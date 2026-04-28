import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, ingredientsTable, ingredientOptionsTable, stockMovementsTable, ingredientTypesTable, drinkIngredientSlotsTable, drinksTable } from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import {
  ListIngredientsQueryParams,
  ListIngredientsResponse,
  CreateIngredientBody,
  GetIngredientParams,
  GetIngredientResponse,
  UpdateIngredientParams,
  UpdateIngredientBody,
  UpdateIngredientResponse,
  CreateIngredientOptionParams,
  CreateIngredientOptionBody,
  UpdateIngredientOptionParams,
  UpdateIngredientOptionBody,
  DeleteIngredientOptionParams,
  RestockIngredientParams,
  RestockIngredientBody,
  RestockIngredientResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function buildIngredientDetail(ingredientId: number) {
  const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingredientId));
  if (!ingredient) return null;

  const options = await db
    .select()
    .from(ingredientOptionsTable)
    .where(eq(ingredientOptionsTable.ingredientId, ingredientId))
    .orderBy(ingredientOptionsTable.sortOrder);

  return {
    ...ingredient,
    costPerUnit: parseFloat(ingredient.costPerUnit),
    stockQuantity: parseFloat(ingredient.stockQuantity),
    lowStockThreshold: parseFloat(ingredient.lowStockThreshold),
    options: options.map((o) => ({
      ...o,
      processedQty: parseFloat(o.processedQty),
      producedQty: parseFloat(o.producedQty),
      extraCost: parseFloat(o.extraCost),
    })),
  };
}

router.get("/ingredients", async (req, res): Promise<void> => {
  const params = ListIngredientsQueryParams.safeParse(req.query);
  const conditions = [];
  if (params.success && params.data.active !== undefined) {
    conditions.push(eq(ingredientsTable.isActive, params.data.active));
  }

  const ingredients = conditions.length
    ? await db.select().from(ingredientsTable).where(and(...conditions))
    : await db.select().from(ingredientsTable);

  let filtered = ingredients;
  if (params.success && params.data.type) {
    filtered = ingredients.filter((i) => i.ingredientType === params.data.type);
  }

  const [allTypes, allSlots, allDrinks] = await Promise.all([
    db.select({ id: ingredientTypesTable.id, inventoryIngredientId: ingredientTypesTable.inventoryIngredientId }).from(ingredientTypesTable),
    db.select({ id: drinkIngredientSlotsTable.id, ingredientId: drinkIngredientSlotsTable.ingredientId, drinkId: drinkIngredientSlotsTable.drinkId }).from(drinkIngredientSlotsTable),
    db.select({ id: drinksTable.id, cupIngredientId: drinksTable.cupIngredientId }).from(drinksTable),
  ]);

  res.json(
    ListIngredientsResponse.parse(
      serializeDates(filtered.map((i) => {
        const typeCount = allTypes.filter(t => t.inventoryIngredientId === i.id).length;
        
        // Product count: unique drinks that use this ingredient either as a slot or as a cup
        const drinksFromSlots = allSlots.filter(s => s.ingredientId === i.id).map(s => s.drinkId);
        const drinksFromCups = allDrinks.filter(d => d.cupIngredientId === i.id).map(d => d.id);
        const uniqueDrinkIds = new Set([...drinksFromSlots, ...drinksFromCups]);
        
        return {
          ...i,
          costPerUnit: parseFloat(i.costPerUnit),
          stockQuantity: parseFloat(i.stockQuantity),
          lowStockThreshold: parseFloat(i.lowStockThreshold),
          linkedTypeCount: typeCount,
          linkedProductCount: uniqueDrinkIds.size,
        };
      }))
    )
  );
});

router.post("/ingredients", async (req, res): Promise<void> => {
  const parsed = CreateIngredientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slug = slugify(parsed.data.name);

  const [ingredient] = await db
    .insert(ingredientsTable)
    .values({
      name: parsed.data.name,
      slug,
      ingredientType: parsed.data.ingredientType,
      unit: parsed.data.unit,
      costPerUnit: String(parsed.data.costPerUnit),
      stockQuantity: String(parsed.data.stockQuantity ?? 0),
      lowStockThreshold: String(parsed.data.lowStockThreshold ?? 500),
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  res.status(201).json(
    ListIngredientsResponse.element.parse(serializeDates({
      ...ingredient,
      costPerUnit: parseFloat(ingredient.costPerUnit),
      stockQuantity: parseFloat(ingredient.stockQuantity),
      lowStockThreshold: parseFloat(ingredient.lowStockThreshold),
    }))
  );
});

router.get("/ingredients/:id", async (req, res): Promise<void> => {
  const params = GetIngredientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const detail = await buildIngredientDetail(params.data.id);
  if (!detail) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  res.json(GetIngredientResponse.parse(serializeDates(detail)));
});

router.patch("/ingredients/:id", async (req, res): Promise<void> => {
  const params = UpdateIngredientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateIngredientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) {
    updateData.name = parsed.data.name;
    updateData.slug = slugify(parsed.data.name);
  }
  if (parsed.data.ingredientType !== undefined) updateData.ingredientType = parsed.data.ingredientType;
  if (parsed.data.unit !== undefined) updateData.unit = parsed.data.unit;
  if (parsed.data.costPerUnit !== undefined) updateData.costPerUnit = String(parsed.data.costPerUnit);
  if (parsed.data.stockQuantity !== undefined) updateData.stockQuantity = String(parsed.data.stockQuantity);
  if (parsed.data.lowStockThreshold !== undefined) updateData.lowStockThreshold = String(parsed.data.lowStockThreshold);
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [ingredient] = await db
    .update(ingredientsTable)
    .set(updateData)
    .where(eq(ingredientsTable.id, params.data.id))
    .returning();

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  res.json(
    UpdateIngredientResponse.parse(serializeDates({
      ...ingredient,
      costPerUnit: parseFloat(ingredient.costPerUnit),
      stockQuantity: parseFloat(ingredient.stockQuantity),
      lowStockThreshold: parseFloat(ingredient.lowStockThreshold),
    }))
  );
});

router.post("/ingredients/:id/options", async (req, res): Promise<void> => {
  const params = CreateIngredientOptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateIngredientOptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [option] = await db
    .insert(ingredientOptionsTable)
    .values({
      ingredientId: params.data.id,
      label: parsed.data.label,
      processedQty: String(parsed.data.processedQty),
      producedQty: String(parsed.data.producedQty),
      producedUnit: parsed.data.producedUnit,
      extraCost: String(parsed.data.extraCost ?? 0),
      isDefault: parsed.data.isDefault ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
      linkedIngredientId: parsed.data.linkedIngredientId ?? null,
    })
    .returning();

  res.status(201).json({
    ...option,
    processedQty: parseFloat(option.processedQty),
    producedQty: parseFloat(option.producedQty),
    extraCost: parseFloat(option.extraCost),
  });
});

router.patch("/ingredients/:id/options/:optionId", async (req, res): Promise<void> => {
  const params = UpdateIngredientOptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateIngredientOptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.label !== undefined) updateData.label = parsed.data.label;
  if (parsed.data.extraCost !== undefined) updateData.extraCost = String(parsed.data.extraCost);
  if (parsed.data.isDefault !== undefined) updateData.isDefault = parsed.data.isDefault;
  if (parsed.data.sortOrder !== undefined) updateData.sortOrder = parsed.data.sortOrder;
  if ("linkedIngredientId" in parsed.data) updateData.linkedIngredientId = parsed.data.linkedIngredientId ?? null;

  const [option] = await db
    .update(ingredientOptionsTable)
    .set(updateData)
    .where(
      and(
        eq(ingredientOptionsTable.id, params.data.optionId),
        eq(ingredientOptionsTable.ingredientId, params.data.id)
      )
    )
    .returning();

  if (!option) {
    res.status(404).json({ error: "Option not found" });
    return;
  }

  res.json({
    ...option,
    processedQty: parseFloat(option.processedQty),
    producedQty: parseFloat(option.producedQty),
    extraCost: parseFloat(option.extraCost),
  });
});

router.delete("/ingredients/:id/options/:optionId", async (req, res): Promise<void> => {
  const params = DeleteIngredientOptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(ingredientOptionsTable)
    .where(
      and(
        eq(ingredientOptionsTable.id, params.data.optionId),
        eq(ingredientOptionsTable.ingredientId, params.data.id)
      )
    )
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Option not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/ingredients/:id/restock", async (req, res): Promise<void> => {
  const params = RestockIngredientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = RestockIngredientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, params.data.id));
  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  const currentQty = parseFloat(ingredient.stockQuantity);
  const newQty = currentQty + parsed.data.quantity;

  const sessionUserId = ((req.session as unknown as Record<string, unknown>).userId as number) ?? 1;

  await db.insert(stockMovementsTable).values({
    ingredientId: params.data.id,
    orderId: null,
    movementType: "restock",
    quantity: String(parsed.data.quantity),
    quantityAfter: String(newQty),
    note: parsed.data.note ?? null,
    createdBy: sessionUserId,
  });

  const [updated] = await db
    .update(ingredientsTable)
    .set({ stockQuantity: String(newQty) })
    .where(eq(ingredientsTable.id, params.data.id))
    .returning();

  res.json(
    RestockIngredientResponse.parse(serializeDates({
      ...updated,
      costPerUnit: parseFloat(updated.costPerUnit),
      stockQuantity: parseFloat(updated.stockQuantity),
      lowStockThreshold: parseFloat(updated.lowStockThreshold),
    }))
  );
});

export default router;
