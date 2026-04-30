/**
 * /api/catalog — Ingredient Categories, Types, and Volumes CRUD
 */
import { Router, type IRouter } from "express";
import { eq, asc, inArray, and } from "drizzle-orm";
import {
  db,
  ingredientCategoriesTable,
  ingredientTypesTable,
  ingredientVolumesTable,
  ingredientTypeVolumesTable,
  ingredientsTable,
  drinkIngredientSlotsTable,
  drinkSlotTypeOptionsTable,
  drinkSlotVolumesTable,
  drinksTable,
} from "@workspace/db";
import { globalCache } from "../lib/cache";

const router: IRouter = Router();

// ── Categories ────────────────────────────────────────────────────────────

router.get("/catalog/categories", async (_req, res): Promise<void> => {
  const rows = await db.select().from(ingredientCategoriesTable).orderBy(asc(ingredientCategoriesTable.sortOrder), asc(ingredientCategoriesTable.name));
  res.json(rows);
});

router.post("/catalog/categories", async (req, res): Promise<void> => {
  const { name, sortOrder } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [row] = await db.insert(ingredientCategoriesTable).values({ name, sortOrder: sortOrder ?? 0 }).returning();
  globalCache.clear();
  res.status(201).json(row);
});

router.patch("/catalog/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { name, sortOrder } = req.body;
  const [row] = await db.update(ingredientCategoriesTable).set({ ...(name && { name }), ...(sortOrder !== undefined && { sortOrder }) }).where(eq(ingredientCategoriesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  globalCache.clear();
  res.json(row);
});

router.delete("/catalog/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(ingredientCategoriesTable).where(eq(ingredientCategoriesTable.id, id));
    globalCache.clear();
    res.sendStatus(204);
  } catch (error: any) {
    const isForeignKeyError = error.code === "23503" || error.cause?.code === "23503";
    if (isForeignKeyError) {
      res.status(400).json({ error: "Cannot delete category while it contains ingredient types. Please remove the types first." });
    } else {
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
});

// ── Types ─────────────────────────────────────────────────────────────────

router.get("/catalog/types", async (_req, res): Promise<void> => {
  const types = await db.select().from(ingredientTypesTable).orderBy(asc(ingredientTypesTable.categoryId), asc(ingredientTypesTable.sortOrder));
  const [categories, inventoryItems, slotLinks, optionLinks] = await Promise.all([
    db.select().from(ingredientCategoriesTable),
    db.select({ id: ingredientsTable.id, name: ingredientsTable.name, unit: ingredientsTable.unit }).from(ingredientsTable),
    db.select({ drinkId: drinkIngredientSlotsTable.drinkId, typeId: drinkIngredientSlotsTable.ingredientTypeId }).from(drinkIngredientSlotsTable),
    db.select({ drinkId: drinkIngredientSlotsTable.drinkId, typeId: drinkSlotTypeOptionsTable.ingredientTypeId })
      .from(drinkSlotTypeOptionsTable)
      .innerJoin(drinkIngredientSlotsTable, eq(drinkSlotTypeOptionsTable.slotId, drinkIngredientSlotsTable.id)),
  ]);

  const typeDrinkMap = new Map<number, Set<number>>();
  [...slotLinks, ...optionLinks].forEach(link => {
    if (link.typeId) {
      if (!typeDrinkMap.has(link.typeId)) typeDrinkMap.set(link.typeId, new Set());
      typeDrinkMap.get(link.typeId)!.add(link.drinkId);
    }
  });

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const invMap = new Map(inventoryItems.map((i) => [i.id, i]));
  res.json(types.map((t) => ({
    ...t,
    drinkCount: typeDrinkMap.get(t.id)?.size ?? 0,
    category: catMap.get(t.categoryId) ?? null,
    inventoryIngredient: t.inventoryIngredientId ? invMap.get(t.inventoryIngredientId) ?? null : null,
  })));
});

router.get("/catalog/types/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [type] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, id));
  if (!type) { res.status(404).json({ error: "Not found" }); return; }

  // Fetch type volumes with volume details
  const typeVolumes = await db.select().from(ingredientTypeVolumesTable)
    .where(eq(ingredientTypeVolumesTable.ingredientTypeId, id))
    .orderBy(asc(ingredientTypeVolumesTable.sortOrder), asc(ingredientTypeVolumesTable.id));
  const volIds = typeVolumes.map((v) => v.volumeId);
  const volumes = volIds.length > 0
    ? await db.select().from(ingredientVolumesTable).where(eq(ingredientVolumesTable.id, volIds[0]))
    : [];
  // fetch all
  const allVols = volIds.length > 0
    ? await Promise.all(volIds.map((vid) => db.select().from(ingredientVolumesTable).where(eq(ingredientVolumesTable.id, vid))))
    : [];
  const volMap = new Map(allVols.flat().map((v) => [v.id, v]));

  res.json({
    ...type,
    volumes: typeVolumes.map((tv) => ({
      ...tv,
      volume: volMap.get(tv.volumeId) ?? null,
    })),
  });
});

router.post("/catalog/types", async (req, res): Promise<void> => {
  const { categoryId, name, inventoryIngredientId, processedQty, producedQty, unit, isActive, affectsCupSize, sortOrder, color, extraCost, pricingMode } = req.body;
  if (!categoryId || !name) { res.status(400).json({ error: "categoryId and name required" }); return; }
  const [row] = await db.insert(ingredientTypesTable).values({ 
    categoryId, 
    name, 
    inventoryIngredientId: inventoryIngredientId ?? null, 
    processedQty: processedQty ?? "0",
    producedQty: producedQty ?? "0",
    unit: unit ?? "ml",
    isActive: isActive ?? true, 
    affectsCupSize: affectsCupSize ?? true,
    sortOrder: sortOrder ?? 0,
    color: color ?? null,
    extraCost: extraCost ?? "0",
    pricingMode: pricingMode ?? "volume"
  }).returning();
  globalCache.clear();
  res.status(201).json(row);
});

router.patch("/catalog/types/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { categoryId, name, inventoryIngredientId, processedQty, producedQty, unit, isActive, affectsCupSize, sortOrder, color, extraCost, pricingMode } = req.body;
  
  const patch: Record<string, unknown> = {};
  if (categoryId !== undefined) patch.categoryId = categoryId;
  if (name !== undefined) patch.name = name;
  if (inventoryIngredientId !== undefined) patch.inventoryIngredientId = inventoryIngredientId;
  if (processedQty !== undefined) patch.processedQty = String(processedQty);
  if (producedQty !== undefined) patch.producedQty = String(producedQty);
  if (unit !== undefined) patch.unit = unit;
  if (isActive !== undefined) patch.isActive = isActive;
  if (affectsCupSize !== undefined) patch.affectsCupSize = affectsCupSize;
  if (sortOrder !== undefined) patch.sortOrder = sortOrder;
  if (color !== undefined) patch.color = color;
  if (extraCost !== undefined) patch.extraCost = String(extraCost);
  if (pricingMode !== undefined) patch.pricingMode = pricingMode;

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: "No valid fields provided for update" });
    return;
  }

  try {
    const [row] = await db.update(ingredientTypesTable).set(patch).where(eq(ingredientTypesTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    globalCache.clear();
    res.json(row);
  } catch (err: any) {
    console.error("Update Type Error:", err);
    res.status(500).json({ error: err.message || "Failed to update ingredient type" });
  }
});

router.delete("/catalog/types/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(ingredientTypesTable).where(eq(ingredientTypesTable.id, id));
    globalCache.clear();
    res.sendStatus(204);
  } catch (error: any) {
    const isForeignKeyError = error.code === "23503" || error.cause?.code === "23503";
    if (isForeignKeyError) {
      res.status(400).json({ error: "Cannot delete ingredient type while it is used in drink recipes or has associated volume definitions." });
    } else {
      res.status(500).json({ error: "Failed to delete ingredient type" });
    }
  }
});

// ── Type Volumes (volumes attached to a type) ─────────────────────────────

router.get("/catalog/type-volumes", async (_req, res): Promise<void> => {
  const rows = await db.select().from(ingredientTypeVolumesTable).orderBy(asc(ingredientTypeVolumesTable.sortOrder), asc(ingredientTypeVolumesTable.id));
  res.json(rows);
});

router.get("/catalog/types/:id/volumes", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const typeVolumes = await db.select().from(ingredientTypeVolumesTable)
    .where(eq(ingredientTypeVolumesTable.ingredientTypeId, id))
    .orderBy(asc(ingredientTypeVolumesTable.sortOrder), asc(ingredientTypeVolumesTable.id));

  if (typeVolumes.length === 0) { res.json([]); return; }

  const volRows = await Promise.all(typeVolumes.map((tv) =>
    db.select().from(ingredientVolumesTable).where(eq(ingredientVolumesTable.id, tv.volumeId))
  ));
  const volMap = new Map(volRows.flat().map((v) => [v.id, v]));

  res.json(typeVolumes.map((tv) => ({ ...tv, volume: volMap.get(tv.volumeId) ?? null })));
});

router.post("/catalog/types/:id/volumes", async (req, res): Promise<void> => {
  const ingredientTypeId = parseInt(req.params.id);
  const { volumeId, processedQty, producedQty, unit, extraCost, isDefault, sortOrder } = req.body;
  if (!volumeId) { res.status(400).json({ error: "volumeId required" }); return; }
  const [row] = await db.insert(ingredientTypeVolumesTable).values({
    ingredientTypeId, volumeId,
    processedQty: processedQty ?? null,
    producedQty: producedQty ?? null,
    unit: unit ?? null,
    extraCost: extraCost ?? "0",
    isDefault: isDefault ?? false,
    sortOrder: sortOrder ?? 0,
    isActive: true,
  }).returning();
  globalCache.clear();
  res.status(201).json(row);
});

router.patch("/catalog/type-volumes/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { processedQty, producedQty, unit, extraCost, isDefault, sortOrder, isActive } = req.body;
  const patch: Record<string, unknown> = {};
  if (processedQty !== undefined) patch.processedQty = processedQty;
  if (producedQty !== undefined) patch.producedQty = producedQty;
  if (unit !== undefined) patch.unit = unit;
  if (extraCost !== undefined) patch.extraCost = extraCost;
  if (isDefault !== undefined) patch.isDefault = isDefault;
  if (sortOrder !== undefined) patch.sortOrder = sortOrder;
  if (isActive !== undefined) patch.isActive = isActive;
  const [row] = await db.update(ingredientTypeVolumesTable).set(patch).where(eq(ingredientTypeVolumesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  globalCache.clear();
  res.json(row);
});

router.delete("/catalog/type-volumes/:id", async (req, res): Promise<void> => {
  await db.delete(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, parseInt(req.params.id)));
  globalCache.clear();
  res.sendStatus(204);
});

// ── Volumes ───────────────────────────────────────────────────────────────

router.get("/catalog/volumes", async (_req, res): Promise<void> => {
  const rows = await db.select().from(ingredientVolumesTable).orderBy(asc(ingredientVolumesTable.sortOrder), asc(ingredientVolumesTable.name));
  res.json(rows);
});

router.post("/catalog/volumes", async (req, res): Promise<void> => {
  const { name, processedQty, producedQty, unit, sortOrder } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [row] = await db.insert(ingredientVolumesTable).values({ name, processedQty: processedQty ?? "0", producedQty: producedQty ?? "0", unit: unit ?? "ml", sortOrder: sortOrder ?? 0 }).returning();
  res.status(201).json(row);
});

router.patch("/catalog/volumes/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { name, processedQty, producedQty, unit, sortOrder } = req.body;
  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (processedQty !== undefined) patch.processedQty = processedQty;
  if (producedQty !== undefined) patch.producedQty = producedQty;
  if (unit !== undefined) patch.unit = unit;
  if (sortOrder !== undefined) patch.sortOrder = sortOrder;
  const [row] = await db.update(ingredientVolumesTable).set(patch).where(eq(ingredientVolumesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/catalog/volumes/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(ingredientVolumesTable).where(eq(ingredientVolumesTable.id, id));
    res.sendStatus(204);
  } catch (error: any) {
    const isForeignKeyError = error.code === "23503" || error.cause?.code === "23503";
    if (isForeignKeyError) {
      res.status(400).json({ error: "Cannot delete volume while it is linked to ingredient types. Please remove it from those types first." });
    } else {
      res.status(500).json({ error: "Failed to delete volume" });
    }
  }
});

// ── Overrides Management ──────────────────────────────────────────────────

/**
 * Lists drinks that have overrides for a specific ingredient type.
 * Overrides are records in drink_slot_volumes linked to type volumes of this type.
 */
router.get("/catalog/types/:id/overrides", async (req, res): Promise<void> => {
  const typeId = parseInt(req.params.id);
  
  const overrides = await db.select({
    drinkId: drinksTable.id,
    drinkName: drinksTable.name,
    slotId: drinkIngredientSlotsTable.id,
    slotLabel: drinkIngredientSlotsTable.slotLabel,
  })
  .from(drinkSlotVolumesTable)
  .innerJoin(ingredientTypeVolumesTable, eq(drinkSlotVolumesTable.typeVolumeId, ingredientTypeVolumesTable.id))
  .innerJoin(drinkIngredientSlotsTable, eq(drinkSlotVolumesTable.slotId, drinkIngredientSlotsTable.id))
  .innerJoin(drinksTable, eq(drinkIngredientSlotsTable.drinkId, drinksTable.id))
  .where(eq(ingredientTypeVolumesTable.ingredientTypeId, typeId))
  .groupBy(drinksTable.id, drinksTable.name, drinkIngredientSlotsTable.id, drinkIngredientSlotsTable.slotLabel);

  // Group by drink to make it cleaner for the UI
  const grouped = overrides.reduce((acc: any[], curr) => {
    let drink = acc.find(d => d.id === curr.drinkId);
    if (!drink) {
      drink = { id: curr.drinkId, name: curr.drinkName, slots: [] };
      acc.push(drink);
    }
    drink.slots.push({ id: curr.slotId, label: curr.slotLabel });
    return acc;
  }, []);

  res.json(grouped);
});

/**
 * Resets (deletes) overrides for a specific ingredient type on a specific drink.
 */
router.post("/catalog/types/:id/sync", async (req, res): Promise<void> => {
  const typeId = parseInt(req.params.id);
  const { drinkId } = req.body;
  
  if (!drinkId) {
    res.status(400).json({ error: "drinkId required" });
    return;
  }

  // Find type volume IDs for this type
  const typeVols = await db.select({ id: ingredientTypeVolumesTable.id })
    .from(ingredientTypeVolumesTable)
    .where(eq(ingredientTypeVolumesTable.ingredientTypeId, typeId));
  
  if (typeVols.length === 0) {
    res.sendStatus(204);
    return;
  }

  const tvIds = typeVols.map(tv => tv.id);

  // Find slot IDs for this drink that reference this type (directly or via options)
  const slots = await db.select({ id: drinkIngredientSlotsTable.id })
    .from(drinkIngredientSlotsTable)
    .where(eq(drinkIngredientSlotsTable.drinkId, drinkId));
  
  if (slots.length === 0) {
    res.sendStatus(204);
    return;
  }

  const slotIds = slots.map(s => s.id);

  // Delete overrides in drink_slot_volumes
  // Actually, we should only delete overrides WHERE typeVolumeId belongs to this type
  
  await db.delete(drinkSlotVolumesTable)
    .where(and(
      inArray(drinkSlotVolumesTable.slotId, slotIds),
      inArray(drinkSlotVolumesTable.typeVolumeId, tvIds)
    ));

  res.sendStatus(204);
});

export default router;
