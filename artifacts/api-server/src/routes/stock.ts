import { Router, type IRouter } from "express";
import { eq, and, inArray, sql, gte, lte, desc, asc, sum } from "drizzle-orm";
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

router.get("/stock/movement-summary", async (req, res): Promise<void> => {
  try {
    const sessionUser = (req.session as any);
    const isAdmin = sessionUser?.role === "admin" || sessionUser?.role === "supervisor";
    const sessionBranchId = sessionUser?.branchId;

    const targetBranchId = req.query.branchId && req.query.branchId !== "all"
      ? parseInt(req.query.branchId as string)
      : (isAdmin && (req.query.branchId === "all" || !req.query.branchId)) ? null : sessionBranchId;

    const targetIngredientId = req.query.ingredientId && req.query.ingredientId !== "all"
      ? parseInt(req.query.ingredientId as string)
      : null;

    const startDateStr = req.query.startDate as string;
    const endDateStr = req.query.endDate as string;

    const start = startDateStr ? startOfDay(new Date(startDateStr)) : startOfDay(new Date());
    const end = endDateStr ? endOfDay(new Date(endDateStr)) : endOfDay(new Date());

    // 1. Fetch active ingredients
    const ingConditions = [eq(ingredientsTable.isActive, true)];
    if (targetIngredientId) {
      ingConditions.push(eq(ingredientsTable.id, targetIngredientId));
    }
    const ingredients = await db.select().from(ingredientsTable).where(and(...ingConditions));

    // 2. Fetch current live branch stock per ingredient
    const stockConditions = [];
    if (targetBranchId) {
      stockConditions.push(eq(branchStockTable.branchId, targetBranchId));
    }
    if (targetIngredientId) {
      stockConditions.push(eq(branchStockTable.ingredientId, targetIngredientId));
    }

    const branchStocks = await db
      .select({
        ingredientId: branchStockTable.ingredientId,
        stockQuantity: branchStockTable.stockQuantity,
      })
      .from(branchStockTable)
      .where(stockConditions.length ? and(...stockConditions) : undefined);

    const currentStockMap = new Map<number, number>();
    for (const s of branchStocks) {
      const prev = currentStockMap.get(s.ingredientId) || 0;
      currentStockMap.set(s.ingredientId, prev + (parseFloat(String(s.stockQuantity || "0")) || 0));
    }

    // 3. Fetch net movements since `start` date to compute opening stock at `start`
    const sinceStartConditions = [
      gte(stockMovementsTable.createdAt, start)
    ];
    if (targetBranchId) {
      sinceStartConditions.push(eq(stockMovementsTable.branchId, targetBranchId));
    }
    if (targetIngredientId) {
      sinceStartConditions.push(eq(stockMovementsTable.ingredientId, targetIngredientId));
    }

    const movementsSinceStart = await db
      .select({
        ingredientId: stockMovementsTable.ingredientId,
        netQuantity: sum(stockMovementsTable.quantity),
      })
      .from(stockMovementsTable)
      .where(and(...sinceStartConditions))
      .groupBy(stockMovementsTable.ingredientId);

    const netSinceStartMap = new Map<number, number>();
    for (const m of movementsSinceStart) {
      netSinceStartMap.set(m.ingredientId, parseFloat(String(m.netQuantity || "0")) || 0);
    }

    // 4. Fetch period movements within [start, end]
    const periodConditions = [
      gte(stockMovementsTable.createdAt, start),
      lte(stockMovementsTable.createdAt, end),
    ];
    if (targetBranchId) {
      periodConditions.push(eq(stockMovementsTable.branchId, targetBranchId));
    }
    if (targetIngredientId) {
      periodConditions.push(eq(stockMovementsTable.ingredientId, targetIngredientId));
    }

    const periodMovements = await db
      .select({
        ingredientId: stockMovementsTable.ingredientId,
        movementType: stockMovementsTable.movementType,
        quantity: stockMovementsTable.quantity,
      })
      .from(stockMovementsTable)
      .where(and(...periodConditions));

    // Group period movements by ingredientId
    const periodMovementsMap = new Map<number, typeof periodMovements>();
    for (const pm of periodMovements) {
      let list = periodMovementsMap.get(pm.ingredientId);
      if (!list) {
        list = [];
        periodMovementsMap.set(pm.ingredientId, list);
      }
      list.push(pm);
    }

    // 5. Build response list
    const results = ingredients.map((ing) => {
      const currentStock = currentStockMap.get(ing.id) || 0;
      const netSinceStart = netSinceStartMap.get(ing.id) || 0;
      const openingStock = currentStock - netSinceStart;

      const pMovements = periodMovementsMap.get(ing.id) || [];

      let saleQty = 0;
      let calibrationQty = 0;
      let testQty = 0;
      let wasteQty = 0;
      let mfgConsumeQty = 0;
      let mfgProduceQty = 0;
      let adjPos = 0;
      let adjNeg = 0;
      let adjNet = 0;
      let restockPos = 0;
      let restockNeg = 0;
      let restockNet = 0;
      let totalIn = 0;
      let totalOut = 0;

      for (const m of pMovements) {
        const qty = parseFloat(String(m.quantity || "0")) || 0;
        const absQty = Math.abs(qty);

        if (m.movementType === "sale") {
          saleQty += absQty;
        } else if (m.movementType === "calibration") {
          calibrationQty += absQty;
        } else if (m.movementType === "testing") {
          testQty += absQty;
        } else if (m.movementType === "waste") {
          wasteQty += absQty;
        } else if (m.movementType === "manufacture_consume") {
          mfgConsumeQty += absQty;
        } else if (m.movementType === "manufacture_produce") {
          mfgProduceQty += absQty;
        } else if (m.movementType === "restock") {
          restockNet += qty;
          if (qty > 0) restockPos += qty;
          else if (qty < 0) restockNeg += absQty;
        } else if (m.movementType === "adjustment") {
          adjNet += qty;
          if (qty > 0) adjPos += qty;
          else if (qty < 0) adjNeg += absQty;
        } else {
          adjNet += qty;
          if (qty > 0) adjPos += qty;
          else if (qty < 0) adjNeg += absQty;
        }

        if (qty > 0) totalIn += absQty;
        else if (qty < 0) totalOut += absQty;
      }

      const netChange = totalIn - totalOut;
      const closingStock = openingStock + netChange;

      return {
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        currentStock,
        openingStock,
        saleQty,
        calibrationQty,
        testQty,
        wasteQty,
        mfgConsumeQty,
        mfgProduceQty,
        adjPos,
        adjNeg,
        adjNet,
        restockPos,
        restockNeg,
        restockNet,
        totalOut,
        totalIn,
        netChange,
        closingStock,
        movementCount: pMovements.length,
      };
    });

    const filteredResults = targetIngredientId
      ? results
      : results.filter(
          (r) =>
            Math.abs(r.currentStock) > 0.0001 ||
            Math.abs(r.openingStock) > 0.0001 ||
            r.movementCount > 0 ||
            r.totalIn > 0 ||
            r.totalOut > 0
        );

    res.json(serializeDates(filteredResults));
  } catch (err: any) {
    console.error("GET /stock/movement-summary error:", err);
    res.status(500).json({ error: err?.message || "Failed to load stock movement summary" });
  }
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

  const targetIngredientId = req.query.ingredientId && req.query.ingredientId !== "all"
    ? parseInt(req.query.ingredientId as string)
    : null;

  // Auto-open nearest expiry batches where appropriate
  try {
    const { triggerAutoOpening } = await import("../lib/stock-utils");
    await triggerAutoOpening(db, targetBranchId, targetIngredientId);
  } catch (err) {
    console.error("Auto-opening error in GET /stock/expiry/reports:", err);
  }

  const days = req.query.days ? parseInt(req.query.days as string) : 3;

  const conditions = [
    sql`cast(quantity as numeric) > 0`
  ];

  if (targetBranchId) {
    conditions.push(eq(branchInventoryBatchesTable.branchId, targetBranchId));
  }

  if (req.query.ingredientId && req.query.ingredientId !== "all") {
    conditions.push(eq(branchInventoryBatchesTable.ingredientId, parseInt(req.query.ingredientId as string)));
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
    const quantityToOpen = req.body.quantity !== undefined ? parseFloat(req.body.quantity) : undefined;
    const { openStockBatch } = await import("../lib/stock-utils");
    const updated = await openStockBatch(db, batchId, quantityToOpen);
    
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

router.put("/stock/expiry/batches/:id", async (req, res): Promise<void> => {
  const batchId = parseInt(req.params.id);
  const sessionUserId = ((req.session as any).userId as number) ?? 1;

  if (isNaN(batchId)) {
    res.status(400).json({ error: "Invalid batch ID" });
    return;
  }

  const { batchNumber, sealedExpiryDate, expiryDate, quantity } = req.body;

  try {
    const [existingBatch] = await db
      .select()
      .from(branchInventoryBatchesTable)
      .where(eq(branchInventoryBatchesTable.id, batchId))
      .limit(1);

    if (!existingBatch) {
      res.status(404).json({ error: "Batch not found" });
      return;
    }

    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (batchNumber !== undefined) updateFields.batchNumber = batchNumber;
    
    if (existingBatch.isOpened) {
      if (expiryDate !== undefined) {
        updateFields.expiryDate = expiryDate ? new Date(expiryDate) : null;
      }
      if (sealedExpiryDate !== undefined) {
        updateFields.sealedExpiryDate = sealedExpiryDate ? new Date(sealedExpiryDate) : null;
      }
    } else {
      if (sealedExpiryDate !== undefined) {
        const dateVal = sealedExpiryDate ? new Date(sealedExpiryDate) : null;
        updateFields.sealedExpiryDate = dateVal;
        updateFields.expiryDate = dateVal;
      } else if (expiryDate !== undefined) {
        const dateVal = expiryDate ? new Date(expiryDate) : null;
        updateFields.sealedExpiryDate = dateVal;
        updateFields.expiryDate = dateVal;
      }
    }

    if (quantity !== undefined) {
      const newQty = parseFloat(quantity);
      const oldQty = parseFloat(existingBatch.quantity);
      const diff = newQty - oldQty;

      if (isNaN(newQty) || newQty < 0) {
        res.status(400).json({ error: "Invalid quantity value" });
        return;
      }

      if (diff !== 0) {
        await db.transaction(async (tx) => {
          await tx
            .update(branchInventoryBatchesTable)
            .set({
              ...updateFields,
              quantity: String(newQty),
              initialQuantity: String(newQty),
            })
            .where(eq(branchInventoryBatchesTable.id, batchId));

          const [stock] = await tx
            .select()
            .from(branchStockTable)
            .where(
              and(
                eq(branchStockTable.ingredientId, existingBatch.ingredientId),
                eq(branchStockTable.branchId, existingBatch.branchId)
              )
            )
            .limit(1);

          const currentStockQty = stock ? parseFloat(stock.stockQuantity) : 0;
          const updatedStockQty = Math.max(0, currentStockQty + diff);

          await tx
            .insert(branchStockTable)
            .values({
              branchId: existingBatch.branchId,
              ingredientId: existingBatch.ingredientId,
              stockQuantity: String(updatedStockQty),
            })
            .onConflictDoUpdate({
              target: [branchStockTable.branchId, branchStockTable.ingredientId],
              set: { stockQuantity: String(updatedStockQty) }
            });

          await tx
            .insert(stockMovementsTable)
            .values({
              branchId: existingBatch.branchId,
              ingredientId: existingBatch.ingredientId,
              orderId: null,
              movementType: "adjustment",
              quantity: String(diff),
              quantityAfter: String(updatedStockQty),
              note: `Edited batch #${existingBatch.batchNumber || existingBatch.id} quantity from ${oldQty} to ${newQty}`,
              createdBy: sessionUserId,
            });
        });
      } else {
        await db
          .update(branchInventoryBatchesTable)
          .set(updateFields)
          .where(eq(branchInventoryBatchesTable.id, batchId));
      }
    } else {
      await db
        .update(branchInventoryBatchesTable)
        .set(updateFields)
        .where(eq(branchInventoryBatchesTable.id, batchId));
    }

    const { triggerAutoOpening } = await import("../lib/stock-utils");
    await triggerAutoOpening(db, existingBatch.branchId, existingBatch.ingredientId);

    const { globalCache } = await import("../lib/cache");
    globalCache.clear();
    const { broadcastEvent } = await import("../lib/sse");
    broadcastEvent("inventory_updated", {});

    res.json({ success: true });
  } catch (error: any) {
    console.error("PUT /stock/expiry/batches/:id error:", error);
    res.status(500).json({ error: error?.message || "Failed to update batch" });
  }
});

router.post("/stock/expiry/batches/initialize", async (req, res): Promise<void> => {
  const { branchId, ingredientId, quantity, batchNumber, expiryDate, isOpened } = req.body;

  if (!branchId || !ingredientId || !quantity || quantity <= 0) {
    res.status(400).json({ error: "Missing required parameters or invalid quantity" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      // 1. Fetch branch stock
      const [stock] = await tx
        .select()
        .from(branchStockTable)
        .where(
          and(
            eq(branchStockTable.branchId, branchId),
            eq(branchStockTable.ingredientId, ingredientId)
          )
        )
        .limit(1);

      const totalStock = stock ? parseFloat(stock.stockQuantity) : 0;

      // 2. Fetch sum of active batches
      const activeBatches = await tx
        .select()
        .from(branchInventoryBatchesTable)
        .where(
          and(
            eq(branchInventoryBatchesTable.branchId, branchId),
            eq(branchInventoryBatchesTable.ingredientId, ingredientId)
          )
        );
      
      const sumBatchQty = activeBatches.reduce((sum: number, b: any) => sum + parseFloat(b.quantity), 0);
      const unbatchedStock = Math.max(0, totalStock - sumBatchQty);

      if (quantity > unbatchedStock + 0.0001) {
        throw new Error(`Quantity to initialize (${quantity}) exceeds unbatched stock (${unbatchedStock.toFixed(2)})`);
      }

      // 3. Create the batch record
      const activeExpiry = expiryDate ? new Date(expiryDate) : null;
      
      let finalExpiry = activeExpiry;
      if (isOpened && !activeExpiry) {
        // If unsealing directly, calculate based on ingredient opened shelf life
        const [ingredient] = await tx
          .select()
          .from(ingredientsTable)
          .where(eq(ingredientsTable.id, ingredientId))
          .limit(1);
        const openedShelfLife = ingredient?.openedShelfLifeDays;
        if (openedShelfLife != null) {
          finalExpiry = new Date(Date.now() + openedShelfLife * 24 * 60 * 60 * 1000);
        }
      }

      await tx
        .insert(branchInventoryBatchesTable)
        .values({
          branchId,
          ingredientId,
          batchNumber: batchNumber || `BULK-${Date.now()}`,
          sealedExpiryDate: isOpened ? null : activeExpiry,
          expiryDate: finalExpiry,
          isOpened: !!isOpened,
          openedAt: isOpened ? new Date() : null,
          quantity: String(quantity),
          initialQuantity: String(quantity),
        });
    });

    const { globalCache } = await import("../lib/cache");
    globalCache.clear();
    const { broadcastEvent } = await import("../lib/sse");
    broadcastEvent("inventory_updated", {});

    res.json({ success: true });
  } catch (error: any) {
    console.error("POST /stock/expiry/batches/initialize error:", error);
    res.status(500).json({ error: error?.message || "Failed to initialize batch" });
  }
});

// GET /stock/transfers — Get all inter-branch stock transfers history
router.get("/stock/transfers", async (req, res): Promise<void> => {
  try {
    const movements = await db
      .select()
      .from(stockMovementsTable)
      .where(sql`note LIKE 'Transfer Out to%' OR note LIKE 'Transfer In from%'`)
      .orderBy(desc(stockMovementsTable.createdAt));

    const [allIngredients, allUsers, allBranches] = await Promise.all([
      db.select().from(ingredientsTable),
      db.select().from(usersTable),
      db.select().from(branchesTable),
    ]);

    const ingredientMap = Object.fromEntries(allIngredients.map((i) => [i.id, i.name]));
    const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));
    const branchMap = Object.fromEntries(allBranches.map((b) => [b.id, b.name]));

    const transfers = movements.map((m) => {
      const isOut = m.note?.startsWith("Transfer Out to");
      let fromBranchName = "Unknown";
      let toBranchName = "Unknown";

      if (isOut) {
        fromBranchName = branchMap[m.branchId || 0] ?? "Unknown";
        const match = m.note?.match(/Transfer Out to (.*?) \(/);
        toBranchName = match ? match[1] : "Unknown";
      } else {
        toBranchName = branchMap[m.branchId || 0] ?? "Unknown";
        const match = m.note?.match(/Transfer In from (.*?) \(/);
        fromBranchName = match ? match[1] : "Unknown";
      }

      return {
        id: m.id,
        branchId: m.branchId,
        ingredientId: m.ingredientId,
        ingredientName: ingredientMap[m.ingredientId] ?? "Unknown",
        movementType: m.movementType,
        quantity: Math.abs(parseFloat(String(m.quantity || "0"))),
        quantityAfter: parseFloat(String(m.quantityAfter || "0")),
        note: m.note,
        fromBranchName,
        toBranchName,
        createdByName: userMap[m.createdBy] ?? "System Admin",
        createdAt: m.createdAt,
      };
    });

    res.json(serializeDates(transfers));
  } catch (error: any) {
    console.error("GET /stock/transfers error:", error);
    res.status(500).json({ error: "Failed to load transfer history" });
  }
});

// GET /stock/branch-quantities — Get all branch stock quantities mapped by { [branchId]: { [ingredientId]: quantity } }
router.get("/stock/branch-quantities", async (req, res): Promise<void> => {
  try {
    const allStock = await db.select({
      branchId: branchStockTable.branchId,
      ingredientId: branchStockTable.ingredientId,
      stockQuantity: branchStockTable.stockQuantity
    }).from(branchStockTable);

    const result: Record<number, Record<number, number>> = {};
    for (const item of allStock) {
      if (!item.branchId) continue;
      if (!result[item.branchId]) result[item.branchId] = {};
      result[item.branchId][item.ingredientId] = parseFloat(item.stockQuantity || "0");
    }

    res.json(result);
  } catch (error: any) {
    console.error("GET /stock/branch-quantities error:", error);
    res.status(500).json({ error: "Failed to load branch stock quantities" });
  }
});

// POST /stock/transfers — Inter-Branch Stock Transfer
router.post("/stock/transfers", async (req, res): Promise<void> => {
  try {
    const { fromBranchId, toBranchId, items, notes } = req.body;
    const sessionUserId = ((req.session as unknown as Record<string, unknown>).userId as number) ?? 1;

    const fromId = parseInt(fromBranchId);
    const toId = parseInt(toBranchId);

    if (isNaN(fromId) || isNaN(toId)) {
      res.status(400).json({ error: "fromBranchId and toBranchId are required" });
      return;
    }

    if (fromId === toId) {
      res.status(400).json({ error: "Source and Destination branches must be different" });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "At least one item is required for stock transfer" });
      return;
    }

    const [fromBranch] = await db.select({ name: branchesTable.name }).from(branchesTable).where(eq(branchesTable.id, fromId));
    const [toBranch] = await db.select({ name: branchesTable.name }).from(branchesTable).where(eq(branchesTable.id, toId));

    if (!fromBranch || !toBranch) {
      res.status(404).json({ error: "Source or Destination branch not found" });
      return;
    }

    const { addStockBatch, deductStockFromBatches } = await import("../lib/stock-utils");

    await db.transaction(async (tx) => {
      for (const item of items) {
        const ingredientId = parseInt(item.ingredientId);
        const qtyInput = parseFloat(item.quantity);

        if (isNaN(ingredientId) || isNaN(qtyInput) || qtyInput <= 0) continue;

        const [ingredient] = await tx.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingredientId));
        if (!ingredient) continue;

        let conversionFactor = 1;
        let unitName = ingredient.unit;

        if (item.conversionId && item.conversionId !== "base") {
          const conversionId = parseInt(item.conversionId);
          if (!isNaN(conversionId)) {
            const [conv] = await tx.select().from(ingredientConversionsTable).where(eq(ingredientConversionsTable.id, conversionId));
            if (conv) {
              conversionFactor = parseFloat(conv.conversionFactor);
              unitName = conv.unitName;
            }
          }
        }

        const baseQtyToTransfer = qtyInput * conversionFactor;

        // 1. Deduct stock from Source Branch
        const [fromStock] = await tx.select().from(branchStockTable).where(and(eq(branchStockTable.branchId, fromId), eq(branchStockTable.ingredientId, ingredientId)));
        const currentFromQty = fromStock ? parseFloat(fromStock.stockQuantity) : 0;
        const newFromQty = Math.max(0, currentFromQty - baseQtyToTransfer);

        await tx.insert(branchStockTable).values({
          branchId: fromId,
          ingredientId,
          stockQuantity: String(newFromQty),
        }).onConflictDoUpdate({
          target: [branchStockTable.branchId, branchStockTable.ingredientId],
          set: { stockQuantity: String(newFromQty) }
        });

        await deductStockFromBatches(tx, fromId, ingredientId, baseQtyToTransfer);

        await tx.insert(stockMovementsTable).values({
          branchId: fromId,
          ingredientId,
          orderId: null,
          movementType: "adjustment",
          quantity: String(-baseQtyToTransfer),
          quantityAfter: String(newFromQty),
          note: `Transfer Out to ${toBranch.name} (${qtyInput} ${unitName})${notes ? `: ${notes}` : ''}`,
          createdBy: sessionUserId,
        });

        // 2. Add stock to Destination Branch
        const [toStock] = await tx.select().from(branchStockTable).where(and(eq(branchStockTable.branchId, toId), eq(branchStockTable.ingredientId, ingredientId)));
        const currentToQty = toStock ? parseFloat(toStock.stockQuantity) : 0;
        const newToQty = currentToQty + baseQtyToTransfer;

        await tx.insert(branchStockTable).values({
          branchId: toId,
          ingredientId,
          stockQuantity: String(newToQty),
        }).onConflictDoUpdate({
          target: [branchStockTable.branchId, branchStockTable.ingredientId],
          set: { stockQuantity: String(newToQty) }
        });

        await addStockBatch(tx, toId, ingredientId, baseQtyToTransfer, null);

        await tx.insert(stockMovementsTable).values({
          branchId: toId,
          ingredientId,
          orderId: null,
          movementType: "restock",
          quantity: String(baseQtyToTransfer),
          quantityAfter: String(newToQty),
          note: `Transfer In from ${fromBranch.name} (${qtyInput} ${unitName})${notes ? `: ${notes}` : ''}`,
          createdBy: sessionUserId,
        });
      }
    });

    const { globalCache } = await import("../lib/cache");
    globalCache.clear();
    const { broadcastEvent } = await import("../lib/sse");
    broadcastEvent("inventory_updated", {});

    res.json({ success: true, message: `Successfully transferred stock from ${fromBranch.name} to ${toBranch.name}` });
  } catch (error: any) {
    console.error("POST /stock/transfers error:", error);
    res.status(500).json({ error: error?.message || "Failed to process stock transfer" });
  }
});

export default router;
