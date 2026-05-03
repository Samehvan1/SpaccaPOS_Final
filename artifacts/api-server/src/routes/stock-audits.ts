import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, stockAuditsTable, stockAuditItemsTable, ingredientsTable, stockMovementsTable, usersTable, branchStockTable } from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { logActivity } from "../lib/activity-logger";

const router: IRouter = Router();

// List all audits
router.get("/stock-audits", async (req, res) => {
  const sessionUser = (req.session as any);
  const sessionBranchId = sessionUser.branchId;
  const isAdmin = sessionUser.role === "admin";

  const targetBranchId = req.query.branchId && req.query.branchId !== 'all'
    ? parseInt(req.query.branchId as string)
    : (isAdmin && (req.query.branchId === 'all' || !req.query.branchId)) ? null : sessionBranchId;

  const conditions = [];
  if (targetBranchId) {
    conditions.push(eq(stockAuditsTable.branchId, targetBranchId));
  }

  const audits = await db
    .select({
      id: stockAuditsTable.id,
      status: stockAuditsTable.status,
      branchId: stockAuditsTable.branchId,
      createdBy: stockAuditsTable.createdBy,
      createdByName: usersTable.name,
      approvedBy: stockAuditsTable.approvedBy,
      notes: stockAuditsTable.notes,
      createdAt: stockAuditsTable.createdAt,
      approvedAt: stockAuditsTable.approvedAt,
    })
    .from(stockAuditsTable)
    .leftJoin(usersTable, eq(stockAuditsTable.createdBy, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(stockAuditsTable.createdAt));
  res.json(serializeDates(audits));
});

// Get audit detail
router.get("/stock-audits/:id", async (req, res) => {
  const auditId = parseInt(req.params.id);
  const [audit] = await db
    .select({
      id: stockAuditsTable.id,
      status: stockAuditsTable.status,
      branchId: stockAuditsTable.branchId,
      createdBy: stockAuditsTable.createdBy,
      createdByName: usersTable.name,
      approvedBy: stockAuditsTable.approvedBy,
      notes: stockAuditsTable.notes,
      createdAt: stockAuditsTable.createdAt,
      approvedAt: stockAuditsTable.approvedAt,
    })
    .from(stockAuditsTable)
    .leftJoin(usersTable, eq(stockAuditsTable.createdBy, usersTable.id))
    .where(eq(stockAuditsTable.id, auditId));
    
  if (!audit) {
    res.status(404).json({ error: "Audit not found" });
    return;
  }

  const items = await db
    .select({
      id: stockAuditItemsTable.id,
      ingredientId: stockAuditItemsTable.ingredientId,
      ingredientName: ingredientsTable.name,
      unit: ingredientsTable.unit,
      expectedQuantity: stockAuditItemsTable.expectedQuantity,
      actualQuantity: stockAuditItemsTable.actualQuantity,
      finalQuantity: stockAuditItemsTable.finalQuantity,
      notes: stockAuditItemsTable.notes,
    })
    .from(stockAuditItemsTable)
    .innerJoin(ingredientsTable, eq(stockAuditItemsTable.ingredientId, ingredientsTable.id))
    .where(eq(stockAuditItemsTable.auditId, auditId));

  res.json(serializeDates({ 
    ...audit, 
    items: items.map(item => ({
      ...item,
      expectedQuantity: parseFloat(item.expectedQuantity),
      actualQuantity: parseFloat(item.actualQuantity),
      finalQuantity: item.finalQuantity ? parseFloat(item.finalQuantity) : null,
      deviation: parseFloat(item.actualQuantity) - parseFloat(item.expectedQuantity)
    }))
  }));
});

// Create audit report (Staff)
router.post("/stock-audits", async (req, res) => {
  const { notes, items } = req.body; // items: Array<{ ingredientId, actualQuantity, notes }>
  const sessionUser = (req.session as any);
  const userId = sessionUser?.userId || 1;
  const branchId = sessionUser?.branchId;

  if (!branchId) {
    res.status(400).json({ error: "Branch ID required for audit" });
    return;
  }

  if (!items || !Array.isArray(items)) {
    res.status(400).json({ error: "Items array is required" });
    return;
  }

  try {
    const audit = await db.transaction(async (tx) => {
      const [newAudit] = await tx
        .insert(stockAuditsTable)
        .values({
          createdBy: userId,
          branchId: branchId,
          notes,
          status: "pending",
        })
        .returning();

      for (const item of items) {
        // Fetch current stock for this specific branch
        const [stockRow] = await tx
          .select({ stock: branchStockTable.stockQuantity })
          .from(branchStockTable)
          .where(and(
            eq(branchStockTable.ingredientId, item.ingredientId),
            eq(branchStockTable.branchId, branchId)
          ))
          .limit(1);

        const expectedQty = stockRow ? stockRow.stock : "0";

        await tx.insert(stockAuditItemsTable).values({
          auditId: newAudit.id,
          ingredientId: item.ingredientId,
          expectedQuantity: expectedQty,
          actualQuantity: String(item.actualQuantity),
          notes: item.notes || null,
        });
      }
      return newAudit;
    });

    await logActivity(req, "CREATE_STOCK_AUDIT", "stock_audit", audit.id);
    res.status(201).json(serializeDates(audit));
  } catch (err: any) {
    console.error("[stock-audits] Create audit failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update audit report (Admin edits quantities before approval)
router.patch("/stock-audits/:id", async (req, res) => {
  const auditId = parseInt(req.params.id);
  const { items, notes } = req.body; // items: Array<{ id (audit_item_id), finalQuantity, notes }>

  try {
    await db.transaction(async (tx) => {
      if (notes !== undefined) {
        await tx.update(stockAuditsTable).set({ notes }).where(eq(stockAuditsTable.id, auditId));
      }

      if (items && Array.isArray(items)) {
        for (const item of items) {
          await tx
            .update(stockAuditItemsTable)
            .set({
              finalQuantity: item.finalQuantity !== undefined ? String(item.finalQuantity) : undefined,
              notes: item.notes,
            })
            .where(eq(stockAuditItemsTable.id, item.id));
        }
      }
    });

    await logActivity(req, "UPDATE_STOCK_AUDIT", "stock_audit", auditId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve audit (Admin)
router.post("/stock-audits/:id/approve", async (req, res) => {
  const auditId = parseInt(req.params.id);
  const userId = (req.session as any).userId;

  try {
    await db.transaction(async (tx) => {
      const [audit] = await tx.select().from(stockAuditsTable).where(eq(stockAuditsTable.id, auditId));
      if (!audit) throw new Error("Audit not found");
      if (audit.status !== "pending") throw new Error("Audit already processed");

      const items = await tx.select().from(stockAuditItemsTable).where(eq(stockAuditItemsTable.auditId, auditId));

      for (const item of items) {
        // Use finalQuantity if set by admin, otherwise use actualQuantity reported by staff
        const targetQuantity = item.finalQuantity !== null ? item.actualQuantity : item.actualQuantity;
        // Wait, if finalQuantity is set, we should use it. 
        // Logic fix: 
        const finalQty = item.finalQuantity !== null ? item.finalQuantity : item.actualQuantity;
        
        // Fetch current stock for this specific branch
        const [stockRow] = await tx
          .select({ stock: branchStockTable.stockQuantity })
          .from(branchStockTable)
          .where(and(
            eq(branchStockTable.ingredientId, item.ingredientId),
            eq(branchStockTable.branchId, audit.branchId)
          ))
          .limit(1);

        const currentQty = stockRow ? stockRow.stock : "0";
        const diff = parseFloat(finalQty) - parseFloat(currentQty);
        
        if (diff !== 0) {
          await tx.insert(stockMovementsTable).values({
            branchId: audit.branchId,
            ingredientId: item.ingredientId,
            movementType: "adjustment",
            quantity: String(diff),
            quantityAfter: String(finalQty),
            note: `Approved Audit #${auditId}`,
            createdBy: userId,
          });

          await tx
            .insert(branchStockTable)
            .values({
              branchId: audit.branchId,
              ingredientId: item.ingredientId,
              stockQuantity: String(finalQty),
            })
            .onConflictDoUpdate({
              target: [branchStockTable.branchId, branchStockTable.ingredientId],
              set: { stockQuantity: String(finalQty) }
            });
        }
      }

      await tx
        .update(stockAuditsTable)
        .set({
          status: "approved",
          approvedBy: userId,
          approvedAt: new Date(),
        })
        .where(eq(stockAuditsTable.id, auditId));
    });

    await logActivity(req, "APPROVE_STOCK_AUDIT", "stock_audit", auditId);
    res.json({ success: true });
  } catch (err: any) {
    console.error("[stock-audits] Approve failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// Reject audit
router.post("/stock-audits/:id/reject", async (req, res) => {
  const auditId = parseInt(req.params.id);
  const userId = (req.session as any).userId;

  await db
    .update(stockAuditsTable)
    .set({
      status: "rejected",
      approvedBy: userId,
      approvedAt: new Date(),
    })
    .where(eq(stockAuditsTable.id, auditId));

  await logActivity(req, "REJECT_STOCK_AUDIT", "stock_audit", auditId);
  res.json({ success: true });
});

export default router;
