import { Router, type IRouter } from "express";
import { eq, and, inArray, sql, desc, gte, lte } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { serializeDates } from "../lib/serialize";
import {
  db,
  bomsTable,
  bomItemsTable,
  manufacturingRunsTable,
  manufacturingRunItemsTable,
  ingredientsTable,
  branchStockTable,
  stockMovementsTable,
  usersTable,
  branchesTable,
} from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

// Validation Schemas
const SaveBomSchema = z.object({
  targetIngredientId: z.number().int().positive(),
  yieldQuantity: z.number().positive(),
  yieldUnit: z.string().min(1),
  isLivePrepare: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
  items: z.array(
    z.object({
      ingredientId: z.number().int().positive(),
      quantity: z.number().positive(),
      unit: z.string().min(1),
    })
  ).min(1, "At least one BOM item is required"),
});

const CalculateProcessSchema = z.object({
  targetIngredientId: z.number().int().positive(),
  processedQuantity: z.number().positive(),
  branchId: z.number().int().positive().optional(),
});

const SubmitProcessSchema = z.object({
  branchId: z.number().int().positive(),
  targetIngredientId: z.number().int().positive(),
  producedQuantity: z.number().positive(),
  producedUnit: z.string().min(1),
  notes: z.string().optional().nullable(),
  items: z.array(
    z.object({
      ingredientId: z.number().int().positive(),
      plannedQuantity: z.number().min(0),
      actualQuantity: z.number().min(0),
      unit: z.string().min(1),
    })
  ).min(1, "At least one raw ingredient component is required"),
});

// ── GET /boms ─────────────────────────────────────────────────────────────
router.get("/boms", async (req, res): Promise<void> => {
  try {
    const allBoms = await db
      .select({
        bom: bomsTable,
        targetIngredient: ingredientsTable,
      })
      .from(bomsTable)
      .innerJoin(ingredientsTable, eq(bomsTable.targetIngredientId, ingredientsTable.id))
      .where(eq(bomsTable.isActive, true))
      .orderBy(desc(bomsTable.updatedAt));

    const bomIds = allBoms.map((b) => b.bom.id);
    let allBomItems: any[] = [];
    if (bomIds.length > 0) {
      allBomItems = await db
        .select({
          item: bomItemsTable,
          ingredient: ingredientsTable,
        })
        .from(bomItemsTable)
        .innerJoin(ingredientsTable, eq(bomItemsTable.ingredientId, ingredientsTable.id))
        .where(inArray(bomItemsTable.bomId, bomIds));
    }

    const itemsByBomId: Record<number, any[]> = {};
    for (const row of allBomItems) {
      if (!itemsByBomId[row.item.bomId]) {
        itemsByBomId[row.item.bomId] = [];
      }
      itemsByBomId[row.item.bomId].push({
        id: row.item.id,
        bomId: row.item.bomId,
        ingredientId: row.item.ingredientId,
        ingredientName: row.ingredient.name,
        ingredientUnit: row.ingredient.unit,
        costPerUnit: parseFloat(row.ingredient.costPerUnit || "0"),
        quantity: parseFloat(row.item.quantity || "0"),
        unit: row.item.unit,
        totalItemCost: parseFloat(row.item.quantity || "0") * parseFloat(row.ingredient.costPerUnit || "0"),
      });
    }

    const result = allBoms.map(({ bom, targetIngredient }) => {
      const items = itemsByBomId[bom.id] || [];
      const totalFormulaCost = items.reduce((sum, i) => sum + i.totalItemCost, 0);
      const yieldQty = parseFloat(bom.yieldQuantity || "1");
      const estimatedCostPerUnit = yieldQty > 0 ? totalFormulaCost / yieldQty : 0;

      return {
        id: bom.id,
        targetIngredientId: bom.targetIngredientId,
        targetIngredientName: targetIngredient.name,
        targetIngredientUnit: targetIngredient.unit,
        targetIngredientType: targetIngredient.ingredientType,
        yieldQuantity: yieldQty,
        yieldUnit: bom.yieldUnit,
        isLivePrepare: bom.isLivePrepare,
        notes: bom.notes,
        isActive: bom.isActive,
        createdAt: bom.createdAt,
        updatedAt: bom.updatedAt,
        totalFormulaCost,
        estimatedCostPerUnit,
        items,
      };
    });

    res.json(serializeDates(result));
  } catch (error: any) {
    console.error("[manufacturing] Failed to fetch BOMs:", error);
    res.status(500).json({ error: error.message || "Failed to fetch BOM list" });
  }
});

// ── GET /boms/:targetIngredientId ─────────────────────────────────────────
router.get("/boms/:targetIngredientId", async (req, res): Promise<void> => {
  try {
    const targetIngredientId = parseInt(req.params.targetIngredientId, 10);
    if (isNaN(targetIngredientId)) {
      res.status(400).json({ error: "Invalid target ingredient ID" });
      return;
    }

    const bomRow = await db
      .select({
        bom: bomsTable,
        targetIngredient: ingredientsTable,
      })
      .from(bomsTable)
      .innerJoin(ingredientsTable, eq(bomsTable.targetIngredientId, ingredientsTable.id))
      .where(eq(bomsTable.targetIngredientId, targetIngredientId))
      .limit(1);

    if (bomRow.length === 0) {
      res.status(404).json({ error: "BOM formula not found for this ingredient" });
      return;
    }

    const { bom, targetIngredient } = bomRow[0];
    const itemsRows = await db
      .select({
        item: bomItemsTable,
        ingredient: ingredientsTable,
      })
      .from(bomItemsTable)
      .innerJoin(ingredientsTable, eq(bomItemsTable.ingredientId, ingredientsTable.id))
      .where(eq(bomItemsTable.bomId, bom.id));

    const items = itemsRows.map(({ item, ingredient }) => ({
      id: item.id,
      bomId: item.bomId,
      ingredientId: item.ingredientId,
      ingredientName: ingredient.name,
      ingredientUnit: ingredient.unit,
      costPerUnit: parseFloat(ingredient.costPerUnit || "0"),
      quantity: parseFloat(item.quantity || "0"),
      unit: item.unit,
      totalItemCost: parseFloat(item.quantity || "0") * parseFloat(ingredient.costPerUnit || "0"),
    }));

    const totalFormulaCost = items.reduce((sum, i) => sum + i.totalItemCost, 0);
    const yieldQty = parseFloat(bom.yieldQuantity || "1");
    const estimatedCostPerUnit = yieldQty > 0 ? totalFormulaCost / yieldQty : 0;

    res.json(
      serializeDates({
        id: bom.id,
        targetIngredientId: bom.targetIngredientId,
        targetIngredientName: targetIngredient.name,
        targetIngredientUnit: targetIngredient.unit,
        targetIngredientType: targetIngredient.ingredientType,
        yieldQuantity: yieldQty,
        yieldUnit: bom.yieldUnit,
        isLivePrepare: bom.isLivePrepare,
        notes: bom.notes,
        isActive: bom.isActive,
        createdAt: bom.createdAt,
        updatedAt: bom.updatedAt,
        totalFormulaCost,
        estimatedCostPerUnit,
        items,
      })
    );
  } catch (error: any) {
    console.error("[manufacturing] Failed to fetch BOM:", error);
    res.status(500).json({ error: error.message || "Failed to fetch BOM details" });
  }
});

// ── POST /boms (Create / Update) ──────────────────────────────────────────
router.post("/boms", async (req, res): Promise<void> => {
  try {
    const parsed = SaveBomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input data" });
      return;
    }

    const { targetIngredientId, yieldQuantity, yieldUnit, isLivePrepare, notes, items } = parsed.data;

    // Check if target ingredient exists
    const [targetIng] = await db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, targetIngredientId))
      .limit(1);

    if (!targetIng) {
      res.status(404).json({ error: "Target inventory item not found" });
      return;
    }

    // Upsert BOM in transaction
    const savedBom = await db.transaction(async (tx) => {
      // Check existing BOM
      const [existingBom] = await tx
        .select()
        .from(bomsTable)
        .where(eq(bomsTable.targetIngredientId, targetIngredientId))
        .limit(1);

      let bomId: number;
      if (existingBom) {
        bomId = existingBom.id;
        await tx
          .update(bomsTable)
          .set({
            yieldQuantity: yieldQuantity.toString(),
            yieldUnit,
            isLivePrepare: isLivePrepare ?? false,
            notes: notes || null,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(bomsTable.id, bomId));

        // Delete existing items
        await tx.delete(bomItemsTable).where(eq(bomItemsTable.bomId, bomId));
      } else {
        const [inserted] = await tx
          .insert(bomsTable)
          .values({
            targetIngredientId,
            yieldQuantity: yieldQuantity.toString(),
            yieldUnit,
            isLivePrepare: isLivePrepare ?? false,
            notes: notes || null,
            isActive: true,
          })
          .returning();
        bomId = inserted.id;
      }

      // Insert new items
      if (items.length > 0) {
        await tx.insert(bomItemsTable).values(
          items.map((i) => ({
            bomId,
            ingredientId: i.ingredientId,
            quantity: i.quantity.toString(),
            unit: i.unit,
          }))
        );
      }

      return bomId;
    });

    res.json({ message: "BOM formula saved successfully", bomId: savedBom });
  } catch (error: any) {
    console.error("[manufacturing] Failed to save BOM:", error);
    res.status(500).json({ error: error.message || "Failed to save BOM formula" });
  }
});

// ── DELETE /boms/:id ──────────────────────────────────────────────────────
router.delete("/boms/:id", async (req, res): Promise<void> => {
  try {
    const bomId = parseInt(req.params.id, 10);
    if (isNaN(bomId)) {
      res.status(400).json({ error: "Invalid BOM ID" });
      return;
    }

    await db.delete(bomsTable).where(eq(bomsTable.id, bomId));
    res.json({ message: "BOM formula deleted successfully" });
  } catch (error: any) {
    console.error("[manufacturing] Failed to delete BOM:", error);
    res.status(500).json({ error: error.message || "Failed to delete BOM formula" });
  }
});

// ── POST /process/calculate ───────────────────────────────────────────────
router.post("/process/calculate", async (req, res): Promise<void> => {
  try {
    const parsed = CalculateProcessSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input parameters" });
      return;
    }

    const { targetIngredientId, processedQuantity, branchId } = parsed.data;

    // Fetch BOM formula
    const [bom] = await db
      .select()
      .from(bomsTable)
      .where(and(eq(bomsTable.targetIngredientId, targetIngredientId), eq(bomsTable.isActive, true)))
      .limit(1);

    if (!bom) {
      res.status(404).json({ error: "No active BOM formula found for this item" });
      return;
    }

    if (bom.isLivePrepare) {
      res.status(400).json({ error: "Live Prepare items are prepared on-demand when ordered and cannot be pre-manufactured via Preparation Batches." });
      return;
    }

    const targetIngredient = await db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, targetIngredientId))
      .limit(1);

    const baseYieldQty = parseFloat(bom.yieldQuantity || "1");
    const multiplier = baseYieldQty > 0 ? processedQuantity / baseYieldQty : 1;

    // Fetch BOM Items
    const rawBomItems = await db
      .select({
        item: bomItemsTable,
        ingredient: ingredientsTable,
      })
      .from(bomItemsTable)
      .innerJoin(ingredientsTable, eq(bomItemsTable.ingredientId, ingredientsTable.id))
      .where(eq(bomItemsTable.bomId, bom.id));

    // Fetch current stock if branchId provided
    let stockMap: Record<number, number> = {};
    if (branchId) {
      const stockRows = await db
        .select()
        .from(branchStockTable)
        .where(eq(branchStockTable.branchId, branchId));
      for (const s of stockRows) {
        stockMap[s.ingredientId] = parseFloat(s.stockQuantity || "0");
      }
    }

    let calculatedBatchCost = 0;
    const calculatedItems = rawBomItems.map(({ item, ingredient }) => {
      const baseQty = parseFloat(item.quantity || "0");
      const calculatedQty = parseFloat((baseQty * multiplier).toFixed(4));
      const unitCost = parseFloat(ingredient.costPerUnit || "0");
      const estimatedTotalCost = parseFloat((calculatedQty * unitCost).toFixed(4));
      calculatedBatchCost += estimatedTotalCost;

      const currentStock = stockMap[ingredient.id] ?? 0;
      const isSufficientStock = branchId ? currentStock >= calculatedQty : true;

      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        ingredientUnit: ingredient.unit,
        recipeBaseQty: baseQty,
        recipeBaseUnit: item.unit,
        calculatedQuantity: calculatedQty,
        actualQuantity: calculatedQty, // default for frontend editable input
        unitCost,
        estimatedTotalCost,
        currentStock,
        isSufficientStock,
      };
    });

    const estimatedFinishedCostPerUnit = processedQuantity > 0 ? calculatedBatchCost / processedQuantity : 0;

    res.json({
      targetIngredientId,
      targetIngredientName: targetIngredient[0]?.name || "Unknown",
      targetIngredientUnit: targetIngredient[0]?.unit || bom.yieldUnit,
      processedQuantity,
      baseYieldQuantity: baseYieldQty,
      multiplier,
      calculatedBatchCost: parseFloat(calculatedBatchCost.toFixed(4)),
      estimatedFinishedCostPerUnit: parseFloat(estimatedFinishedCostPerUnit.toFixed(4)),
      items: calculatedItems,
    });
  } catch (error: any) {
    console.error("[manufacturing] Failed to calculate process:", error);
    res.status(500).json({ error: error.message || "Failed to calculate preparation process" });
  }
});

// ── POST /process/submit ──────────────────────────────────────────────────
router.post("/process/submit", async (req, res): Promise<void> => {
  try {
    const parsed = SubmitProcessSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid preparation process data" });
      return;
    }

    const { branchId, targetIngredientId, producedQuantity, producedUnit, notes, items } = parsed.data;
    const sessionUserId = (req.session as any)?.userId || 1;

    // Check branch existence
    const [branch] = await db.select().from(branchesTable).where(eq(branchesTable.id, branchId)).limit(1);
    if (!branch) {
      res.status(404).json({ error: "Branch not found" });
      return;
    }

    // Check target ingredient
    const [targetIngredient] = await db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, targetIngredientId))
      .limit(1);

    if (!targetIngredient) {
      res.status(404).json({ error: "Target manufactured ingredient not found" });
      return;
    }

    // Execute preparation transaction
    const runResult = await db.transaction(async (tx) => {
      // 1. Gather component ingredients to calculate costs
      const ingredientIds = items.map((i) => i.ingredientId);
      const ingredientRows = await tx
        .select()
        .from(ingredientsTable)
        .where(inArray(ingredientsTable.id, ingredientIds));

      const ingredientMap = Object.fromEntries(ingredientRows.map((ing) => [ing.id, ing]));

      let totalBatchCost = 0;
      const processedItemsData = [];

      for (const item of items) {
        const ing = ingredientMap[item.ingredientId];
        const unitCost = parseFloat(ing?.costPerUnit || "0");
        const totalItemCost = parseFloat((item.actualQuantity * unitCost).toFixed(4));
        totalBatchCost += totalItemCost;

        processedItemsData.push({
          ingredientId: item.ingredientId,
          plannedQuantity: item.plannedQuantity,
          actualQuantity: item.actualQuantity,
          unit: item.unit,
          unitCost,
          totalCost: totalItemCost,
        });
      }

      totalBatchCost = parseFloat(totalBatchCost.toFixed(4));
      const finishedUnitCost = producedQuantity > 0 ? parseFloat((totalBatchCost / producedQuantity).toFixed(4)) : 0;

      // 2. Create Manufacturing Run record
      const [mRun] = await tx
        .insert(manufacturingRunsTable)
        .values({
          branchId,
          targetIngredientId,
          producedQuantity: producedQuantity.toString(),
          producedUnit,
          totalCost: totalBatchCost.toString(),
          status: "completed",
          preparedBy: sessionUserId,
          notes: notes || null,
        })
        .returning();

      // 3. Insert Run items breakdown
      if (processedItemsData.length > 0) {
        await tx.insert(manufacturingRunItemsTable).values(
          processedItemsData.map((pi) => ({
            manufacturingRunId: mRun.id,
            ingredientId: pi.ingredientId,
            plannedQuantity: pi.plannedQuantity.toString(),
            actualQuantity: pi.actualQuantity.toString(),
            unit: pi.unit,
            unitCost: pi.unitCost.toString(),
            totalCost: pi.totalCost.toString(),
          }))
        );
      }

      // 4. Deduct raw ingredients from branch_stock and log stock_movements
      for (const item of items) {
        if (item.actualQuantity <= 0) continue;

        // Upsert stock record
        const [existingStock] = await tx
          .select()
          .from(branchStockTable)
          .where(and(eq(branchStockTable.branchId, branchId), eq(branchStockTable.ingredientId, item.ingredientId)))
          .limit(1);

        const currentQty = parseFloat(existingStock?.stockQuantity || "0");
        const newQty = parseFloat((currentQty - item.actualQuantity).toFixed(4));

        if (existingStock) {
          await tx
            .update(branchStockTable)
            .set({ stockQuantity: newQty.toString(), updatedAt: new Date() })
            .where(and(eq(branchStockTable.branchId, branchId), eq(branchStockTable.ingredientId, item.ingredientId)));
        } else {
          await tx.insert(branchStockTable).values({
            branchId,
            ingredientId: item.ingredientId,
            stockQuantity: newQty.toString(),
          });
        }

        // Insert Stock Movement
        await tx.insert(stockMovementsTable).values({
          branchId,
          ingredientId: item.ingredientId,
          movementType: "manufacture_consume",
          quantity: (-item.actualQuantity).toString(),
          quantityAfter: newQty.toString(),
          note: `Used in preparation run #${mRun.id} for ${targetIngredient.name} (${producedQuantity} ${producedUnit})`,
          createdBy: sessionUserId,
        });
      }

      // 5. Add produced quantity to target ingredient branch_stock and log stock_movements
      const [existingTargetStock] = await tx
        .select()
        .from(branchStockTable)
        .where(and(eq(branchStockTable.branchId, branchId), eq(branchStockTable.ingredientId, targetIngredientId)))
        .limit(1);

      const currentTargetQty = parseFloat(existingTargetStock?.stockQuantity || "0");
      const newTargetQty = parseFloat((currentTargetQty + producedQuantity).toFixed(4));

      if (existingTargetStock) {
        await tx
          .update(branchStockTable)
          .set({ stockQuantity: newTargetQty.toString(), updatedAt: new Date() })
          .where(and(eq(branchStockTable.branchId, branchId), eq(branchStockTable.ingredientId, targetIngredientId)));
      } else {
        await tx.insert(branchStockTable).values({
          branchId,
          ingredientId: targetIngredientId,
          stockQuantity: newTargetQty.toString(),
        });
      }

      // Stock Movement for produced item
      await tx.insert(stockMovementsTable).values({
        branchId,
        ingredientId: targetIngredientId,
        movementType: "manufacture_produce",
        quantity: producedQuantity.toString(),
        quantityAfter: newTargetQty.toString(),
        note: `Produced in preparation run #${mRun.id}`,
        createdBy: sessionUserId,
      });

      // 6. Update finished ingredient costPerUnit in ingredients master table if cost calculated > 0
      if (finishedUnitCost > 0) {
        await tx
          .update(ingredientsTable)
          .set({ costPerUnit: finishedUnitCost.toString(), updatedAt: new Date() })
          .where(eq(ingredientsTable.id, targetIngredientId));
      }

      return {
        runId: mRun.id,
        targetIngredientName: targetIngredient.name,
        producedQuantity,
        producedUnit,
        totalBatchCost,
        finishedUnitCost,
      };
    });

    res.json({
      message: "Preparation process submitted successfully",
      run: runResult,
    });
  } catch (error: any) {
    console.error("[manufacturing] Failed to submit preparation process:", error);
    res.status(500).json({ error: error.message || "Failed to submit preparation process" });
  }
});

// ── GET /runs (History & Audit) ───────────────────────────────────────────
router.get("/runs", async (req, res): Promise<void> => {
  try {
    const sessionUser = req.session as any;
    const isAdmin = sessionUser.role === "admin" || sessionUser.role === "supervisor";
    const sessionBranchId = sessionUser.branchId;

    const queryBranchId = req.query.branchId && req.query.branchId !== "all"
      ? parseInt(req.query.branchId as string, 10)
      : isAdmin && (req.query.branchId === "all" || !req.query.branchId) ? null : sessionBranchId;

    const conditions = [];
    if (queryBranchId) {
      conditions.push(eq(manufacturingRunsTable.branchId, queryBranchId));
    }
    if (req.query.targetIngredientId) {
      const ingId = parseInt(req.query.targetIngredientId as string, 10);
      if (!isNaN(ingId)) conditions.push(eq(manufacturingRunsTable.targetIngredientId, ingId));
    }
    if (req.query.startDate) {
      conditions.push(gte(manufacturingRunsTable.createdAt, startOfDay(new Date(req.query.startDate as string))));
    }
    if (req.query.endDate) {
      conditions.push(lte(manufacturingRunsTable.createdAt, endOfDay(new Date(req.query.endDate as string))));
    }

    const runs = await db
      .select({
        run: manufacturingRunsTable,
        targetIngredient: ingredientsTable,
        branch: branchesTable,
        preparedByUser: usersTable,
      })
      .from(manufacturingRunsTable)
      .innerJoin(ingredientsTable, eq(manufacturingRunsTable.targetIngredientId, ingredientsTable.id))
      .innerJoin(branchesTable, eq(manufacturingRunsTable.branchId, branchesTable.id))
      .innerJoin(usersTable, eq(manufacturingRunsTable.preparedBy, usersTable.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(manufacturingRunsTable.createdAt))
      .limit(100);

    const runIds = runs.map((r) => r.run.id);
    let runItemsRows: any[] = [];
    if (runIds.length > 0) {
      runItemsRows = await db
        .select({
          runItem: manufacturingRunItemsTable,
          ingredient: ingredientsTable,
        })
        .from(manufacturingRunItemsTable)
        .innerJoin(ingredientsTable, eq(manufacturingRunItemsTable.ingredientId, ingredientsTable.id))
        .where(inArray(manufacturingRunItemsTable.manufacturingRunId, runIds));
    }

    const itemsByRunId: Record<number, any[]> = {};
    for (const row of runItemsRows) {
      if (!itemsByRunId[row.runItem.manufacturingRunId]) {
        itemsByRunId[row.runItem.manufacturingRunId] = [];
      }
      itemsByRunId[row.runItem.manufacturingRunId].push({
        id: row.runItem.id,
        ingredientId: row.runItem.ingredientId,
        ingredientName: row.ingredient.name,
        plannedQuantity: parseFloat(row.runItem.plannedQuantity || "0"),
        actualQuantity: parseFloat(row.runItem.actualQuantity || "0"),
        unit: row.runItem.unit,
        unitCost: parseFloat(row.runItem.unitCost || "0"),
        totalCost: parseFloat(row.runItem.totalCost || "0"),
      });
    }

    const result = runs.map(({ run, targetIngredient, branch, preparedByUser }) => ({
      id: run.id,
      branchId: run.branchId,
      branchName: branch.name,
      targetIngredientId: run.targetIngredientId,
      targetIngredientName: targetIngredient.name,
      producedQuantity: parseFloat(run.producedQuantity || "0"),
      producedUnit: run.producedUnit,
      totalCost: parseFloat(run.totalCost || "0"),
      status: run.status,
      preparedById: run.preparedBy,
      preparedByName: preparedByUser.name,
      notes: run.notes,
      createdAt: run.createdAt,
      items: itemsByRunId[run.id] || [],
    }));

    res.json(serializeDates(result));
  } catch (error: any) {
    console.error("[manufacturing] Failed to fetch manufacturing runs history:", error);
    res.status(500).json({ error: error.message || "Failed to fetch manufacturing runs history" });
  }
});

export default router;
