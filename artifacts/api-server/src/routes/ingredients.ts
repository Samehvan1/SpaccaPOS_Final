import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";
import { eq, and, sql } from "drizzle-orm";
import { db, ingredientsTable, ingredientOptionsTable, stockMovementsTable, ingredientTypesTable, drinkIngredientSlotsTable, drinksTable, orderItemCustomizationsTable, orderItemsTable, ordersTable, usersTable } from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { globalCache } from "../lib/cache";
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

router.post("/ingredients/import-csv", async (req, res): Promise<void> => {
  try {
    const { pin } = req.body;
    if (!pin) {
      res.status(400).json({ error: "Admin PIN is required for this action." });
      return;
    }

    // Verify PIN
    const [admin] = await db.select().from(usersTable).where(and(eq(usersTable.pin, pin), eq(usersTable.role, "admin"))).limit(1);
    if (!admin) {
      res.status(401).json({ error: "Invalid Admin PIN. Critical actions require authorization." });
      return;
    }

    const csvPath = path.join(process.cwd(), "Inventory2026.csv");
    if (!fs.existsSync(csvPath)) {
      res.status(404).json({ error: "Inventory2026.csv not found in app root." });
      return;
    }

    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split("\n");
    const dataLines = lines.slice(1).filter(line => line.trim() && !line.startsWith("#"));

    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const getIngredientType = (name: string): any => {
      const n = name.toLowerCase();
      if (n.includes("tea")) return "tea";
      if (n.includes("cup") || n.includes("lid") || n.includes("sleeve") || n.includes("holder")) return "cup";
      if (n.includes("bag") || n.includes("paper") || n.includes("label") || n.includes("roll") || n.includes("napkin") || n.includes("stirrer") || n.includes("straw") || n.includes("glaves")) return "packing";
      if (n.includes("coffee")) return "coffee";
      if (n.includes("milk") || n.includes("cream")) return "milk";
      if (n.includes("syrup")) return "syrup";
      if (n.includes("sauce") || n.includes("puree") || n.includes("butter")) return "sauce";
      if (n.includes("suger") || n.includes("sugar")) return "sweetener";
      if (n.includes("powder") || n.includes("pawder")) return "base";
      return "other";
    };
    const mapUnit = (u: string) => {
      const unit = u.trim().toUpperCase();
      if (unit === "G") return "g";
      if (unit === "L" || unit === "S") return "ml";
      if (unit === "EACH") return "pcs";
      return unit.toLowerCase() || "pcs";
    };

    await db.transaction(async (tx) => {
      // 1. Clear links in operational tables (keep data, just unlink)
      await tx.update(ingredientTypesTable).set({ inventoryIngredientId: null });
      await tx.update(drinksTable).set({ cupIngredientId: null });
      await tx.update(ingredientOptionsTable).set({ linkedIngredientId: null });
      await tx.update(drinkIngredientSlotsTable).set({ ingredientId: null });

      // 2. Wipe ONLY the master inventory definitions
      // Note: We don't wipe ordersTable or orderItemsTable anymore to preserve history.
      
      await tx.delete(ingredientOptionsTable);
      await tx.delete(ingredientsTable);

      const usedSlugs = new Set<string>();
      for (const line of dataLines) {
        const parts = line.split(",");
        if (parts.length < 4) continue;
        const name = parts[1]?.trim();
        const unitRaw = parts[3]?.trim();
        if (!name) continue;

        const type = getIngredientType(name);
        const unit = mapUnit(unitRaw);
        let slug = slugify(name);
        if (usedSlugs.has(slug)) {
          slug = `${slug}-${unit}`;
          if (usedSlugs.has(slug)) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }
        usedSlugs.add(slug);

        await tx.insert(ingredientsTable).values({
          name,
          slug,
          ingredientType: type,
          unit,
          costPerUnit: "0",
          stockQuantity: "0",
          lowStockThreshold: "100",
          isActive: true
        });
      }
    });

    res.json({ message: "Import completed successfully" });
    globalCache.clear();
    const { broadcastEvent } = await import("../lib/sse");
    broadcastEvent("inventory_updated", { type: "import" });
  } catch (err: any) {
    console.error("Import failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/ingredients", async (req, res): Promise<void> => {
  const params = ListIngredientsQueryParams.safeParse(req.query);
  const conditions = [];
  if (params.success && params.data.active !== undefined) {
    conditions.push(eq(ingredientsTable.isActive, params.data.active));
  }

  const ingredients = await db.select().from(ingredientsTable).where(conditions.length ? and(...conditions) : undefined);

  // Get counts of links
  const [typeLinks, optionLinks, drinkLinks] = await Promise.all([
    db.select({ id: ingredientTypesTable.inventoryIngredientId, count: sql<number>`count(*)` }).from(ingredientTypesTable).groupBy(ingredientTypesTable.inventoryIngredientId),
    db.select({ id: ingredientOptionsTable.linkedIngredientId, count: sql<number>`count(*)` }).from(ingredientOptionsTable).groupBy(ingredientOptionsTable.linkedIngredientId),
    db.select({ id: drinksTable.cupIngredientId, count: sql<number>`count(*)` }).from(drinksTable).groupBy(drinksTable.cupIngredientId),
  ]);

  const typeCountMap = new Map(typeLinks.map(l => [l.id, Number(l.count)]));
  const optionCountMap = new Map(optionLinks.map(l => [l.id, Number(l.count)]));
  const drinkCountMap = new Map(drinkLinks.map(l => [l.id, Number(l.count)]));

  let filtered = ingredients;
  if (params.success && params.data.type) {
    filtered = ingredients.filter((i) => i.ingredientType === params.data.type);
  }

  res.json(
    serializeDates(filtered.map((i) => {
      return {
        ...i,
        costPerUnit: parseFloat(i.costPerUnit),
        stockQuantity: parseFloat(i.stockQuantity),
        lowStockThreshold: parseFloat(i.lowStockThreshold),
        linkedTypeCount: (typeCountMap.get(i.id) || 0) + (optionCountMap.get(i.id) || 0),
        linkedProductCount: drinkCountMap.get(i.id) || 0,
      };
    }))
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
  globalCache.clear();
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
  globalCache.clear();
});

router.delete("/ingredients/:id", async (req, res): Promise<void> => {
  const params = GetIngredientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const id = params.data.id;

  // 1. Clear links in catalog_ingredient_types
  await db.update(ingredientTypesTable)
    .set({ inventoryIngredientId: null })
    .where(eq(ingredientTypesTable.inventoryIngredientId, id));

  // 2. Clear links in drinks (cupIngredientId)
  await db.update(drinksTable)
    .set({ cupIngredientId: null })
    .where(eq(drinksTable.cupIngredientId, id));

  // 3. Delete the ingredient
  // Note: if there are orders using this, it might fail due to FKs in stockMovements or customizations.
  // But usually we allow deletion if we want to "clear all".
  try {
    const [deleted] = await db
      .delete(ingredientsTable)
      .where(eq(ingredientsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Ingredient not found" });
      return;
    }

    res.sendStatus(204);
    globalCache.clear();
  } catch (err: any) {
    res.status(400).json({ error: "Cannot delete ingredient because it is in use by historical orders." });
  }
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
  globalCache.clear();
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
  globalCache.clear();
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
  globalCache.clear();
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
  globalCache.clear();
  const { broadcastEvent } = await import("../lib/sse");
  broadcastEvent("inventory_updated", { ingredientId: params.data.id });
});

export default router;
