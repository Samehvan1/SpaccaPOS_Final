import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, drinkCategoriesTable, drinksTable } from "@workspace/db";
import { insertDrinkCategorySchema } from "@workspace/db";

const router: IRouter = Router();

// GET /drink-categories — list all
router.get("/drink-categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select()
    .from(drinkCategoriesTable)
    .orderBy(asc(drinkCategoriesTable.sortOrder), asc(drinkCategoriesTable.name));
  res.json(categories);
});

// POST /drink-categories — create
router.post("/drink-categories", async (req, res): Promise<void> => {
  const parsed = insertDrinkCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [category] = await db
    .insert(drinkCategoriesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(category);
});

// PATCH /drink-categories/:id — update
router.patch("/drink-categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, sortOrder, isActive } = req.body as {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  if (isActive !== undefined) updateData.isActive = isActive;

  const [category] = await db
    .update(drinkCategoriesTable)
    .set(updateData)
    .where(eq(drinkCategoriesTable.id, id))
    .returning();

  if (!category) { res.status(404).json({ error: "Category not found" }); return; }

  // Sync legacy 'category' field in drinksTable if the name changed
  if (name !== undefined) {
    await db.update(drinksTable)
      .set({ category: name })
      .where(eq(drinksTable.categoryId, id));
  }

  res.json(category);
});

// DELETE /drink-categories/:id — delete
router.delete("/drink-categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [category] = await db
    .delete(drinkCategoriesTable)
    .where(eq(drinkCategoriesTable.id, id))
    .returning();

  if (!category) { res.status(404).json({ error: "Category not found" }); return; }
  res.sendStatus(204);
});

export default router;
