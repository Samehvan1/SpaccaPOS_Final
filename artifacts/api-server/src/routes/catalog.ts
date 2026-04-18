/**
 * /api/catalog — Ingredient Categories, Types, and Volumes CRUD
 */
import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import {
  db,
  ingredientCategoriesTable,
  ingredientTypesTable,
  ingredientVolumesTable,
  ingredientTypeVolumesTable,
  ingredientsTable,
} from "@workspace/db";

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
  res.status(201).json(row);
});

router.patch("/catalog/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { name, sortOrder } = req.body;
  const [row] = await db.update(ingredientCategoriesTable).set({ ...(name && { name }), ...(sortOrder !== undefined && { sortOrder }) }).where(eq(ingredientCategoriesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/catalog/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(ingredientCategoriesTable).where(eq(ingredientCategoriesTable.id, id));
  res.sendStatus(204);
});

// ── Types ─────────────────────────────────────────────────────────────────

router.get("/catalog/types", async (_req, res): Promise<void> => {
  const types = await db.select().from(ingredientTypesTable).orderBy(asc(ingredientTypesTable.categoryId), asc(ingredientTypesTable.sortOrder));
  const [categories, inventoryItems] = await Promise.all([
    db.select().from(ingredientCategoriesTable),
    db.select({ id: ingredientsTable.id, name: ingredientsTable.name, unit: ingredientsTable.unit }).from(ingredientsTable),
  ]);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const invMap = new Map(inventoryItems.map((i) => [i.id, i]));
  res.json(types.map((t) => ({
    ...t,
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
    .orderBy(asc(ingredientTypeVolumesTable.sortOrder));
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
  const { categoryId, name, inventoryIngredientId, isActive, sortOrder } = req.body;
  if (!categoryId || !name) { res.status(400).json({ error: "categoryId and name required" }); return; }
  const [row] = await db.insert(ingredientTypesTable).values({ categoryId, name, inventoryIngredientId: inventoryIngredientId ?? null, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 }).returning();
  res.status(201).json(row);
});

router.patch("/catalog/types/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { categoryId, name, inventoryIngredientId, isActive, sortOrder } = req.body;
  const patch: Record<string, unknown> = {};
  if (categoryId !== undefined) patch.categoryId = categoryId;
  if (name !== undefined) patch.name = name;
  if (inventoryIngredientId !== undefined) patch.inventoryIngredientId = inventoryIngredientId;
  if (isActive !== undefined) patch.isActive = isActive;
  if (sortOrder !== undefined) patch.sortOrder = sortOrder;
  const [row] = await db.update(ingredientTypesTable).set(patch).where(eq(ingredientTypesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/catalog/types/:id", async (req, res): Promise<void> => {
  await db.delete(ingredientTypesTable).where(eq(ingredientTypesTable.id, parseInt(req.params.id)));
  res.sendStatus(204);
});

// ── Type Volumes (volumes attached to a type) ─────────────────────────────

router.get("/catalog/types/:id/volumes", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const typeVolumes = await db.select().from(ingredientTypeVolumesTable)
    .where(eq(ingredientTypeVolumesTable.ingredientTypeId, id))
    .orderBy(asc(ingredientTypeVolumesTable.sortOrder));

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
  }).returning();
  res.status(201).json(row);
});

router.patch("/catalog/type-volumes/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { processedQty, producedQty, unit, extraCost, isDefault, sortOrder } = req.body;
  const patch: Record<string, unknown> = {};
  if (processedQty !== undefined) patch.processedQty = processedQty;
  if (producedQty !== undefined) patch.producedQty = producedQty;
  if (unit !== undefined) patch.unit = unit;
  if (extraCost !== undefined) patch.extraCost = extraCost;
  if (isDefault !== undefined) patch.isDefault = isDefault;
  if (sortOrder !== undefined) patch.sortOrder = sortOrder;
  const [row] = await db.update(ingredientTypeVolumesTable).set(patch).where(eq(ingredientTypeVolumesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/catalog/type-volumes/:id", async (req, res): Promise<void> => {
  await db.delete(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, parseInt(req.params.id)));
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
  await db.delete(ingredientVolumesTable).where(eq(ingredientVolumesTable.id, parseInt(req.params.id)));
  res.sendStatus(204);
});

export default router;
