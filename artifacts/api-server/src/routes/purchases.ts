import { Router, type IRouter } from "express";
import { 
  db, 
  purchasesTable, 
  purchaseItemsTable, 
  suppliersTable, 
  branchesTable, 
  usersTable, 
  branchStockTable, 
  stockMovementsTable, 
  ingredientConversionsTable, 
  ingredientsTable,
  insertPurchaseSchema
} from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requirePermission } from "../middleware/permissions";
import { logActivity } from "../lib/activity-logger";

const purchasesRouter: IRouter = Router();

// Helper to serialize decimal numbers from DB
const formatPurchase = (p: any) => ({
  ...p,
  totalAmount: parseFloat(String(p.totalAmount || "0")),
  paidAmount: parseFloat(String(p.paidAmount || "0")),
  supplierName: p.supplier?.name ?? "Unknown",
  branchName: p.branch?.name ?? "Unknown",
  createdByName: p.creator?.name ?? "Unknown",
});

// GET /purchases - List all purchase orders
purchasesRouter.get("/purchases", requirePermission("purchases:view"), async (req, res): Promise<void> => {
  try {
    const sessionUser = (req.session as any);
    const isAdmin = sessionUser.role === "admin" || sessionUser.role === "finance";
    const sessionBranchId = sessionUser.branchId;

    // Filter by branch: non-admins can only see their own branch POs
    const targetBranchId = req.query.branchId && req.query.branchId !== "all"
      ? parseInt(req.query.branchId as string)
      : (isAdmin ? null : sessionBranchId);

    const conditions = [];
    if (targetBranchId) {
      conditions.push(eq(purchasesTable.branchId, targetBranchId));
    }

    if (req.query.status) {
      conditions.push(eq(purchasesTable.status, req.query.status as any));
    }

    const pos = await db.query.purchasesTable.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: {
        supplier: true,
        branch: true,
        creator: true,
      },
      orderBy: [desc(purchasesTable.createdAt)],
    });

    res.json(pos.map(formatPurchase));
  } catch (error: any) {
    console.error("GET /purchases error:", error?.message || error);
    res.status(500).json({ error: "Failed to list purchase orders" });
  }
});

// GET /purchases/:id - Get specific purchase order detail
purchasesRouter.get("/purchases/:id", requirePermission("purchases:view"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid purchase order ID" });
      return;
    }

    const po = await db.query.purchasesTable.findFirst({
      where: eq(purchasesTable.id, id),
      with: {
        supplier: true,
        branch: true,
        creator: true,
        items: {
          with: {
            ingredient: true,
            conversion: true,
          }
        }
      }
    });

    if (!po) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    // Map items to parse numeric values
    const items = po.items.map((item: any) => ({
      ...item,
      quantityOrdered: parseFloat(String(item.quantityOrdered || "0")),
      quantityReceived: parseFloat(String(item.quantityReceived || "0")),
      unitPrice: parseFloat(String(item.unitPrice || "0")),
      totalCost: parseFloat(String(item.totalCost || "0")),
      ingredientName: item.ingredient?.name ?? "Unknown",
    }));

    res.json({
      ...formatPurchase(po),
      items
    });
  } catch (error: any) {
    console.error("GET /purchases/:id error:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch purchase order details" });
  }
});

// POST /purchases - Create a new Purchase Order
purchasesRouter.post("/purchases", requirePermission("purchases:manage"), async (req, res): Promise<void> => {
  try {
    const sessionUserId = (req.session as any).userId ?? 1;
    const sessionBranchId = (req.session as any).branchId;
    const { items, poNumber: customPoNumber, ...purchaseData } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Purchase order must contain at least one item." });
      return;
    }

    // Generate standard PO Number if not provided
    let poNumber = customPoNumber;
    if (!poNumber) {
      const countResult = await db.select({ count: sql`count(*)` }).from(purchasesTable);
      const count = Number(countResult[0]?.count || 0) + 1;
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      poNumber = `PO-${today}-${String(count).padStart(4, "0")}`;
    }

    // Validate main purchase data
    const finalPurchaseData = {
      ...purchaseData,
      poNumber,
      createdBy: sessionUserId,
      branchId: purchaseData.branchId ?? sessionBranchId,
    };

    const parsed = insertPurchaseSchema.safeParse(finalPurchaseData);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    // Calculate total amount from items
    let calculatedTotal = 0;
    const itemsToInsert = items.map((item: any) => {
      const qty = parseFloat(item.quantityOrdered);
      const price = parseFloat(item.unitPrice);
      const cost = qty * price;
      calculatedTotal += cost;

      return {
        ingredientId: item.ingredientId,
        quantityOrdered: String(qty),
        unitPrice: String(price),
        totalCost: String(cost),
        conversionId: item.conversionId || null,
        unitName: item.unitName || "pcs",
      };
    });

    // Run transaction
    const newPurchase = await db.transaction(async (tx) => {
      const [insertedPo] = await tx
        .insert(purchasesTable)
        .values({
          ...parsed.data,
          totalAmount: String(calculatedTotal),
          orderDate: parsed.data.status === "ordered" ? new Date() : null,
        })
        .returning();

      if (!insertedPo) {
        throw new Error("Failed to insert purchase order header");
      }

      // Add purchaseId to items
      const finalItems = itemsToInsert.map(item => ({
        ...item,
        purchaseId: insertedPo.id,
      }));

      await tx.insert(purchaseItemsTable).values(finalItems);

      return insertedPo;
    });

    await logActivity(req, "CREATE_PURCHASE_ORDER", "purchase", newPurchase.id, { poNumber: newPurchase.poNumber, totalAmount: calculatedTotal });

    res.status(201).json(newPurchase);
  } catch (error: any) {
    console.error("POST /purchases error:", error?.message || error);
    res.status(500).json({ error: "Failed to create purchase order" });
  }
});

// PATCH /purchases/:id - Update an existing Purchase Order (Only allowed in 'draft' status)
purchasesRouter.patch("/purchases/:id", requirePermission("purchases:manage"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid purchase order ID" });
      return;
    }

    const { items, ...purchaseData } = req.body;

    const [existing] = await db.select().from(purchasesTable).where(eq(purchasesTable.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    if (existing.status !== "draft") {
      res.status(400).json({ error: "Only draft purchase orders can be modified." });
      return;
    }

    // Run update in transaction
    const updatedPurchase = await db.transaction(async (tx) => {
      let calculatedTotal = parseFloat(existing.totalAmount);

      if (items && Array.isArray(items)) {
        if (items.length === 0) {
          throw new Error("Purchase order must contain at least one item.");
        }

        // Delete old items
        await tx.delete(purchaseItemsTable).where(eq(purchaseItemsTable.purchaseId, id));

        // Calculate and insert new items
        calculatedTotal = 0;
        const itemsToInsert = items.map((item: any) => {
          const qty = parseFloat(item.quantityOrdered);
          const price = parseFloat(item.unitPrice);
          const cost = qty * price;
          calculatedTotal += cost;

          return {
            purchaseId: id,
            ingredientId: item.ingredientId,
            quantityOrdered: String(qty),
            unitPrice: String(price),
            totalCost: String(cost),
            conversionId: item.conversionId || null,
            unitName: item.unitName || "pcs",
          };
        });

        await tx.insert(purchaseItemsTable).values(itemsToInsert);
      }

      // Update header
      const updateValues: any = {
        ...purchaseData,
        totalAmount: String(calculatedTotal),
        updatedAt: new Date(),
      };

      if (purchaseData.status === "ordered" && existing.status === "draft") {
        updateValues.orderDate = new Date();
      }

      const [updated] = await tx
        .update(purchasesTable)
        .set(updateValues)
        .where(eq(purchasesTable.id, id))
        .returning();

      return updated;
    });

    await logActivity(req, "UPDATE_PURCHASE_ORDER", "purchase", id, { poNumber: updatedPurchase.poNumber });

    res.json(updatedPurchase);
  } catch (error: any) {
    console.error("PATCH /purchases/:id error:", error?.message || error);
    res.status(500).json({ error: error?.message || "Failed to update purchase order" });
  }
});

// POST /purchases/:id/receive - Receive items and update inventory stock
purchasesRouter.post("/purchases/:id/receive", requirePermission("purchases:manage"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid purchase order ID" });
      return;
    }

    const sessionUserId = (req.session as any).userId ?? 1;
    const { items: receivedItemsInput } = req.body; // Array<{ itemId: number, quantityReceived: number }>

    const po = await db.query.purchasesTable.findFirst({
      where: eq(purchasesTable.id, id),
      with: {
        items: true,
      }
    });

    if (!po) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    if (po.status === "received") {
      res.status(400).json({ error: "Purchase order has already been received." });
      return;
    }

    if (po.status === "draft") {
      res.status(400).json({ error: "Draft purchase orders must be placed ('ordered') before they can be received." });
      return;
    }

    // Process delivery stock modifications in a transaction
    await db.transaction(async (tx) => {
      // 1. Update purchase order header status
      await tx
        .update(purchasesTable)
        .set({
          status: "received",
          deliveryDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(purchasesTable.id, id));

      // 2. Loop through each item in the purchase order
      for (const item of po.items) {
        // Find if user provided specific received quantity
        const inputItem = Array.isArray(receivedItemsInput) 
          ? receivedItemsInput.find((i: any) => i.itemId === item.id) 
          : null;
        
        // Default received to ordered quantity if not specified
        const qtyReceived = inputItem ? parseFloat(inputItem.quantityReceived) : parseFloat(item.quantityOrdered);

        // Update purchase item with received quantity
        await tx
          .update(purchaseItemsTable)
          .set({ quantityReceived: String(qtyReceived) })
          .where(eq(purchaseItemsTable.id, item.id));

        if (qtyReceived <= 0) continue;

        // Calculate actual stock quantity to add (applying conversion factor if configured)
        let finalQuantityAdded = qtyReceived;
        let selectedUnitName = item.unitName;
        let factor = 1;

        if (item.conversionId) {
          const [conversion] = await tx
            .select()
            .from(ingredientConversionsTable)
            .where(eq(ingredientConversionsTable.id, item.conversionId))
            .limit(1);
          
          if (conversion) {
            factor = parseFloat(conversion.conversionFactor) || 1;
            finalQuantityAdded = qtyReceived * factor;
            selectedUnitName = conversion.unitName;
          }
        }

        // Weighted Average Cost (WAC) update on ingredient
        const totalCostOfNewItems = qtyReceived * parseFloat(item.unitPrice);
        const costPerBaseUnit = parseFloat(item.unitPrice) / factor;

        // Sum current stock across all branches to get currentTotalStock
        const stockSums = await tx
          .select({ total: sql<string>`SUM(stock_quantity)` })
          .from(branchStockTable)
          .where(eq(branchStockTable.ingredientId, item.ingredientId));
        const currentTotalStock = Math.max(0, parseFloat(stockSums[0]?.total || "0"));

        // Get current cost per unit
        const [ingredient] = await tx
          .select()
          .from(ingredientsTable)
          .where(eq(ingredientsTable.id, item.ingredientId))
          .limit(1);
        const currentCostPerUnit = parseFloat(ingredient?.costPerUnit || "0");

        // Compute new weighted average cost
        const newTotalStock = currentTotalStock + finalQuantityAdded;
        let newCostPerUnit = currentCostPerUnit;
        if (newTotalStock > 0) {
          newCostPerUnit = (currentTotalStock * currentCostPerUnit + totalCostOfNewItems) / newTotalStock;
        } else {
          newCostPerUnit = costPerBaseUnit;
        }

        // Update the ingredient cost
        await tx
          .update(ingredientsTable)
          .set({ costPerUnit: String(newCostPerUnit.toFixed(4)) })
          .where(eq(ingredientsTable.id, item.ingredientId));

        // Get current stock
        const [stock] = await tx
          .select()
          .from(branchStockTable)
          .where(
            and(
              eq(branchStockTable.branchId, po.branchId),
              eq(branchStockTable.ingredientId, item.ingredientId)
            )
          )
          .limit(1);

        const currentQty = stock ? parseFloat(stock.stockQuantity) : 0;
        const newQty = currentQty + finalQuantityAdded;

        // Update branch stock
        await tx
          .insert(branchStockTable)
          .values({
            branchId: po.branchId,
            ingredientId: item.ingredientId,
            stockQuantity: String(newQty),
          })
          .onConflictDoUpdate({
            target: [branchStockTable.branchId, branchStockTable.ingredientId],
            set: { stockQuantity: String(newQty) }
          });

        // Insert stock movement log
        await tx
          .insert(stockMovementsTable)
          .values({
            branchId: po.branchId,
            ingredientId: item.ingredientId,
            orderId: null,
            movementType: "restock",
            quantity: String(finalQuantityAdded),
            quantityAfter: String(newQty),
            note: `Received from PO #${po.poNumber}${item.conversionId ? ` (Converted from ${qtyReceived} ${selectedUnitName})` : ""}`,
            createdBy: sessionUserId,
          });
      }
    });

    // Clear caches and broadcast SSE events
    try {
      const { globalCache } = await import("../lib/cache");
      globalCache.clear();
      const { broadcastEvent } = await import("../lib/sse");
      broadcastEvent("inventory_updated", {});
    } catch (cacheErr) {
      console.warn("Failed to clear cache or broadcast SSE:", cacheErr);
    }

    await logActivity(req, "RECEIVE_PURCHASE_ORDER", "purchase", id, { poNumber: po.poNumber });

    res.json({ success: true, message: "Purchase order items received and stock updated." });
  } catch (error: any) {
    console.error("POST /purchases/:id/receive error:", error?.message || error);
    res.status(500).json({ error: "Failed to receive purchase order items" });
  }
});

// POST /purchases/:id/pay - Record a payment against a purchase order
purchasesRouter.post("/purchases/:id/pay", requirePermission("purchases:manage"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid purchase order ID" });
      return;
    }

    const { paymentAmount } = req.body;
    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: "Payment amount must be a positive number." });
      return;
    }

    const po = await db.query.purchasesTable.findFirst({
      where: eq(purchasesTable.id, id),
    });

    if (!po) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    const currentPaid = parseFloat(po.paidAmount);
    const totalAmount = parseFloat(po.totalAmount);
    const newPaid = currentPaid + amount;

    let paymentStatus: "unpaid" | "partially_paid" | "paid" = "unpaid";
    if (newPaid >= totalAmount) {
      paymentStatus = "paid";
    } else if (newPaid > 0) {
      paymentStatus = "partially_paid";
    }

    const [updated] = await db
      .update(purchasesTable)
      .set({
        paidAmount: String(newPaid),
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(purchasesTable.id, id))
      .returning();

    await logActivity(req, "RECORD_PURCHASE_PAYMENT", "purchase", id, { 
      poNumber: po.poNumber, 
      paymentAmount: amount,
      totalPaid: newPaid,
      paymentStatus 
    });

    res.json({
      success: true,
      purchase: formatPurchase(updated)
    });
  } catch (error: any) {
    console.error("POST /purchases/:id/pay error:", error?.message || error);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

// DELETE /purchases/:id - Cancel or delete a purchase order
purchasesRouter.delete("/purchases/:id", requirePermission("purchases:manage"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid purchase order ID" });
      return;
    }

    const po = await db.query.purchasesTable.findFirst({
      where: eq(purchasesTable.id, id),
    });

    if (!po) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    if (po.status === "received") {
      res.status(400).json({ error: "Cannot delete or cancel a purchase order that has already been received." });
      return;
    }

    if (po.status === "draft") {
      // Hard delete draft POs
      await db.delete(purchasesTable).where(eq(purchasesTable.id, id));
      await logActivity(req, "DELETE_PURCHASE_ORDER", "purchase", id, { poNumber: po.poNumber });
      res.status(200).json({ success: true, message: "Draft purchase order deleted successfully." });
    } else {
      // For 'ordered', change status to cancelled
      await db
        .update(purchasesTable)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(purchasesTable.id, id));
      await logActivity(req, "CANCEL_PURCHASE_ORDER", "purchase", id, { poNumber: po.poNumber });
      res.status(200).json({ success: true, message: "Purchase order has been cancelled." });
    }
  } catch (error: any) {
    console.error("DELETE /purchases/:id error:", error?.message || error);
    res.status(500).json({ error: "Failed to delete or cancel purchase order" });
  }
});

export default purchasesRouter;
