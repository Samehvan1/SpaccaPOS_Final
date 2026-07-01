import { Router, type IRouter } from "express";
import { eq, and, inArray, sql, gte, lte, desc, asc } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { serializeDates } from "../lib/serialize";
import {
  db,
  stockMovementsTable,
  ingredientsTable,
  branchStockTable,
  ingredientConversionsTable,
  usersTable,
  branchesTable,
  branchInventoryBatchesTable,
} from "@workspace/db";
import {
  ListStockMovementsQueryParams,
  ListStockMovementsResponse,
  CreateStockAdjustmentBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stock/movements", async (req, res): Promise<void> => {
  const params = ListStockMovementsQueryParams.safeParse(req.query);
  const sessionUser = (req.session as any);
  const isAdmin = sessionUser.role === "admin";
  const sessionBranchId = sessionUser.branchId;

  const targetBranchId = req.query.branchId && req.query.branchId !== 'all'
    ? parseInt(req.query.branchId as string)
    : (isAdmin && (req.query.branchId === 'all' || !req.query.branchId)) ? null : sessionBranchId;

  const conditions = [];

  if (targetBranchId) {
    conditions.push(eq(stockMovementsTable.branchId, targetBranchId));
  }

  if (params.success) {
    if (params.data.ingredientId) {
      conditions.push(eq(stockMovementsTable.ingredientId, params.data.ingredientId));
    }
    if (params.data.startDate) {
      conditions.push(gte(stockMovementsTable.createdAt, startOfDay(new Date(params.data.startDate))));
    }
    if (params.data.endDate) {
      conditions.push(lte(stockMovementsTable.createdAt, endOfDay(new Date(params.data.endDate))));
    }
    if (params.data.movementType) {
      const types = params.data.movementType.split(",") as any[];
      conditions.push(inArray(stockMovementsTable.movementType, types));
    }
  }

  const movements = await db
    .select()
    .from(stockMovementsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(stockMovementsTable.createdAt));

  const limit = params.success && params.data.limit ? params.data.limit : 100;
  const offset = params.success && params.data.offset ? params.data.offset : 0;
  const paginated = movements.slice(offset, offset + limit);

  const allIngredients = await db.select().from(ingredientsTable);
  const allUsers = await db.select().from(usersTable);
  const ingredientMap = Object.fromEntries(allIngredients.map((i) => [i.id, i.name]));
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  res.json(
    ListStockMovementsResponse.parse(
      serializeDates(paginated.map((m) => ({
        ...m,
        ingredientName: ingredientMap[m.ingredientId] ?? "Unknown",
        createdByName: userMap[m.createdBy] ?? "Unknown",
        quantity: parseFloat(String(m.quantity || "0")) || 0,
        quantityAfter: parseFloat(String(m.quantityAfter || "0")) || 0,
        orderId: m.orderId ?? null,
      })))
    )
  );
});

router.post("/stock/adjustments", async (req, res): Promise<void> => {
  const parsed = CreateStockAdjustmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionUserId = ((req.session as unknown as Record<string, unknown>).userId as number) ?? 1;
  const sessionUser = (req.session as any);
  const isAdmin = sessionUser.role === "admin" || sessionUser.role === "supervisor";
  let targetBranchId: number | undefined = sessionUser.branchId ?? undefined;
  if (!targetBranchId && isAdmin) {
    // If admin can choose branch in the body, use it, or fallback to first branch
    targetBranchId = req.body.branchId ? parseInt(req.body.branchId) : undefined;
    if (!targetBranchId) {
      const branches = await db.select().from(branchesTable).limit(1);
      targetBranchId = branches[0]?.id;
    }
  }

  if (!targetBranchId) {
    res.status(400).json({ error: "No branch associated with session or request" });
    return;
  }

  const [ingredient] = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.id, parsed.data.ingredientId));

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  const [stock] = await db
    .select()
    .from(branchStockTable)
    .where(and(eq(branchStockTable.ingredientId, parsed.data.ingredientId), eq(branchStockTable.branchId, targetBranchId)));

  const quantityValueBase = parsed.data.quantity;
  let finalQuantity = quantityValueBase;
  let selectedUnitName = null;

  if (parsed.data.unitId) {
    const [conversion] = await db
      .select()
      .from(ingredientConversionsTable)
      .where(and(eq(ingredientConversionsTable.id, parsed.data.unitId), eq(ingredientConversionsTable.ingredientId, parsed.data.ingredientId)));
    
    if (conversion) {
      finalQuantity = quantityValueBase * parseFloat(conversion.conversionFactor);
      selectedUnitName = conversion.unitName;
    }
  }

  const currentQty = stock ? parseFloat(stock.stockQuantity) : 0;
  const adjustedQty = (parsed.data.movementType === "waste" || parsed.data.movementType === "calibration" || parsed.data.movementType === "testing")
    ? currentQty - finalQuantity
    : currentQty + finalQuantity;

  const newQty = Math.max(0, adjustedQty);

  const { addStockBatch, deductStockFromBatches } = await import("../lib/stock-utils");

  const [movement] = await db.transaction(async (tx) => {
    await tx
      .insert(branchStockTable)
      .values({
        branchId: targetBranchId,
        ingredientId: parsed.data.ingredientId,
        stockQuantity: String(newQty),
      })
      .onConflictDoUpdate({
        target: [branchStockTable.branchId, branchStockTable.ingredientId],
        set: { stockQuantity: String(newQty) }
      });

    if (parsed.data.movementType === "waste" || parsed.data.movementType === "calibration" || parsed.data.movementType === "testing") {
      await deductStockFromBatches(tx, targetBranchId!, parsed.data.ingredientId, finalQuantity);
    } else {
      await addStockBatch(
        tx,
        targetBranchId!,
        parsed.data.ingredientId,
        finalQuantity,
        parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
        parsed.data.batchNumber
      );
    }

    const ledgerQuantity =
      (parsed.data.movementType === "waste" || parsed.data.movementType === "calibration" || parsed.data.movementType === "testing") ? -finalQuantity : finalQuantity;

    const movementNote = selectedUnitName 
      ? `${parsed.data.note ?? ""} (Converted from ${parsed.data.quantity} ${selectedUnitName})`.trim()
      : parsed.data.note ?? null;

    return tx
      .insert(stockMovementsTable)
      .values({
        branchId: targetBranchId,
        ingredientId: parsed.data.ingredientId,
        orderId: null,
        movementType: parsed.data.movementType,
        quantity: String(ledgerQuantity),
        quantityAfter: String(newQty),
        note: movementNote,
        createdBy: sessionUserId,
      })
      .returning();
  });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));

  res.status(201).json({
    ...movement,
    ingredientName: ingredient.name,
    createdByName: user?.name ?? "Unknown",
    quantity: parseFloat(movement.quantity),
    quantityAfter: parseFloat(movement.quantityAfter),
    orderId: movement.orderId ?? null,
  });
  const { globalCache } = await import("../lib/cache");
  globalCache.clear();
  const { broadcastEvent } = await import("../lib/sse");
  broadcastEvent("inventory_updated", { ingredientId: parsed.data.ingredientId });
});

router.get("/stock/expiry/reports", async (req, res): Promise<void> => {
  const sessionUser = (req.session as any);
  const isAdmin = sessionUser.role === "admin" || sessionUser.role === "supervisor";
  const sessionBranchId = sessionUser.branchId;

  const targetBranchId = req.query.branchId && req.query.branchId !== "all"
    ? parseInt(req.query.branchId as string)
    : (isAdmin && (req.query.branchId === "all" || !req.query.branchId)) ? null : sessionBranchId;

  const days = req.query.days ? parseInt(req.query.days as string) : 3;

  const conditions = [
    sql`quantity > 0`
  ];

  if (targetBranchId) {
    conditions.push(eq(branchInventoryBatchesTable.branchId, targetBranchId));
  }

  const batches = await db
    .select({
      id: branchInventoryBatchesTable.id,
      branchId: branchInventoryBatchesTable.branchId,
      branchName: branchesTable.name,
      ingredientId: branchInventoryBatchesTable.ingredientId,
      ingredientName: ingredientsTable.name,
      ingredientUnit: ingredientsTable.unit,
      batchNumber: branchInventoryBatchesTable.batchNumber,
      sealedExpiryDate: branchInventoryBatchesTable.sealedExpiryDate,
      expiryDate: branchInventoryBatchesTable.expiryDate,
      isOpened: branchInventoryBatchesTable.isOpened,
      openedAt: branchInventoryBatchesTable.openedAt,
      quantity: branchInventoryBatchesTable.quantity,
      createdAt: branchInventoryBatchesTable.createdAt,
    })
    .from(branchInventoryBatchesTable)
    .innerJoin(ingredientsTable, eq(branchInventoryBatchesTable.ingredientId, ingredientsTable.id))
    .innerJoin(branchesTable, eq(branchInventoryBatchesTable.branchId, branchesTable.id))
    .where(and(...conditions))
    .orderBy(asc(branchInventoryBatchesTable.expiryDate));

  const now = new Date();
  const reports = batches.map(b => {
    let diffDays = null;
    let status: "expired" | "expiring_soon" | "ok" = "ok";
    
    if (b.expiryDate) {
      const expiry = new Date(b.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        status = "expired";
      } else if (diffDays <= days) {
        status = "expiring_soon";
      }
    }

    return {
      ...b,
      quantity: parseFloat(String(b.quantity)),
      daysLeft: diffDays,
      status,
    };
  });

  const statusFilter = req.query.status as string;
  let filteredReports = reports;
  if (statusFilter === "expired") {
    filteredReports = reports.filter(r => r.status === "expired");
  } else if (statusFilter === "expiring_soon") {
    filteredReports = reports.filter(r => r.status === "expiring_soon");
  } else if (statusFilter === "alert") {
    filteredReports = reports.filter(r => r.status === "expired" || r.status === "expiring_soon");
  } else if (statusFilter === "ok") {
    filteredReports = reports.filter(r => r.status === "ok");
  }

  res.json(serializeDates(filteredReports));
});

router.post("/stock/expiry/batches/:id/open", async (req, res): Promise<void> => {
  const batchId = parseInt(req.params.id);
  if (isNaN(batchId)) {
    res.status(400).json({ error: "Invalid batch ID" });
    return;
  }

  try {
    const { openStockBatch } = await import("../lib/stock-utils");
    const updated = await openStockBatch(db, batchId);
    
    const { globalCache } = await import("../lib/cache");
    globalCache.clear();
    const { broadcastEvent } = await import("../lib/sse");
    broadcastEvent("inventory_updated", {});

    res.json(serializeDates(updated));
  } catch (error: any) {
    console.error("POST /stock/expiry/batches/:id/open error:", error);
    res.status(500).json({ error: error?.message || "Failed to open batch" });
  }
});

router.post("/stock/expiry/batches/:id/discard", async (req, res): Promise<void> => {
  const batchId = parseInt(req.params.id);
  const sessionUserId = ((req.session as any).userId as number) ?? 1;

  if (isNaN(batchId)) {
    res.status(400).json({ error: "Invalid batch ID" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      const [batch] = await tx
        .select()
        .from(branchInventoryBatchesTable)
        .where(eq(branchInventoryBatchesTable.id, batchId))
        .limit(1);

      if (!batch) {
        throw new Error("Batch not found");
      }

      const qty = parseFloat(batch.quantity);
      if (qty <= 0) {
        throw new Error("Batch is already empty");
      }

      await tx
        .update(branchInventoryBatchesTable)
        .set({ quantity: "0", updatedAt: new Date() })
        .where(eq(branchInventoryBatchesTable.id, batchId));

      const [stock] = await tx
        .select()
        .from(branchStockTable)
        .where(and(eq(branchStockTable.ingredientId, batch.ingredientId), eq(branchStockTable.branchId, batch.branchId)))
        .limit(1);

      const currentQty = stock ? parseFloat(stock.stockQuantity) : 0;
      const newQty = Math.max(0, currentQty - qty);

      await tx
        .insert(branchStockTable)
        .values({
          branchId: batch.branchId,
          ingredientId: batch.ingredientId,
          stockQuantity: String(newQty),
        })
        .onConflictDoUpdate({
          target: [branchStockTable.branchId, branchStockTable.ingredientId],
          set: { stockQuantity: String(newQty) }
        });

      await tx
        .insert(stockMovementsTable)
        .values({
          branchId: batch.branchId,
          ingredientId: batch.ingredientId,
          orderId: null,
          movementType: "waste",
          quantity: String(-qty),
          quantityAfter: String(newQty),
          note: `Discarded batch #${batch.batchNumber || batch.id}`,
          createdBy: sessionUserId,
        });
    });

    const { globalCache } = await import("../lib/cache");
    globalCache.clear();
    const { broadcastEvent } = await import("../lib/sse");
    broadcastEvent("inventory_updated", {});

    res.json({ success: true });
  } catch (error: any) {
    console.error("POST /stock/expiry/batches/:id/discard error:", error);
    res.status(500).json({ error: error?.message || "Failed to discard batch" });
  }
});

export default router;
