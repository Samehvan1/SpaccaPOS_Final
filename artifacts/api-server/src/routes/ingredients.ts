import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";
import { eq, and, sql } from "drizzle-orm";
import { db, ingredientsTable, branchStockTable, ingredientOptionsTable, stockMovementsTable, ingredientTypesTable, drinkIngredientSlotsTable, drinksTable, orderItemCustomizationsTable, orderItemsTable, ordersTable, usersTable } from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { globalCache } from "../lib/cache";
import { logActivity } from "../lib/activity-logger";
import { requirePermission } from "../middleware/permissions";
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

async function buildIngredientDetail(ingredientId: number, branchId?: number) {
  const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingredientId));
  if (!ingredient) return null;

  let stockInfo = { stockQuantity: "0", lowStockThreshold: "0" };
  if (branchId) {
    const [stock] = await db
      .select()
      .from(branchStockTable)
      .where(and(eq(branchStockTable.ingredientId, ingredientId), eq(branchStockTable.branchId, branchId)));
    if (stock) {
      stockInfo = { stockQuantity: stock.stockQuantity, lowStockThreshold: stock.lowStockThreshold };
    }
  }

  const options = await db
    .select()
    .from(ingredientOptionsTable)
    .where(eq(ingredientOptionsTable.ingredientId, ingredientId))
    .orderBy(ingredientOptionsTable.sortOrder);

  return {
    ...ingredient,
    costPerUnit: parseFloat(ingredient.costPerUnit),
    stockQuantity: parseFloat(stockInfo.stockQuantity),
    lowStockThreshold: parseFloat(stockInfo.lowStockThreshold),
    options: options.map((o) => ({
      ...o,
      processedQty: parseFloat(o.processedQty),
      producedQty: parseFloat(o.producedQty),
      extraCost: parseFloat(o.extraCost),
    })),
  };
}

router.post("/ingredients/import-csv", requirePermission("admin:manage_ingredients"), async (req, res): Promise<void> => {
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
      // 1. Clear links in operational tables
      await tx.update(ingredientTypesTable).set({ inventoryIngredientId: null });
      await tx.update(drinksTable).set({ cupIngredientId: null });
      await tx.update(ingredientOptionsTable).set({ linkedIngredientId: null });
      await tx.update(drinkIngredientSlotsTable).set({ ingredientId: null });

      // 2. Wipe stock records for this branch (or all? if items are for all branches, maybe wipe all stock)
      // Since we are wiping ingredientsTable, it will cascade and wipe branchStockTable too.
      await tx.delete(ingredientOptionsTable);
      await tx.delete(ingredientsTable);

      const adminBranchId = (admin as any).branchId;
      if (!adminBranchId) {
        throw new Error("Admin must be associated with a branch to import inventory.");
      }

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

        const [newIng] = await tx.insert(ingredientsTable).values({
          name,
          slug,
          ingredientType: type,
          unit,
          costPerUnit: "0",
          isActive: true
        }).returning();

        // Initialize stock for the current branch
        await tx.insert(branchStockTable).values({
          branchId: adminBranchId,
          ingredientId: newIng.id,
          stockQuantity: "0",
          lowStockThreshold: "100"
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

router.get("/ingredients", requirePermission("inventory:view"), async (req, res): Promise<void> => {
  const params = ListIngredientsQueryParams.safeParse(req.query);
  const sessionUser = (req.session as any);
  const sessionBranchId = sessionUser.branchId;
  const isAdmin = sessionUser.role === "admin";

  const targetBranchId = (isAdmin && req.query.branchId && req.query.branchId !== 'all') 
    ? parseInt(req.query.branchId as string) 
    : (isAdmin && req.query.branchId === 'all') ? null : sessionBranchId;

  let query = db
    .select({
      id: ingredientsTable.id,
      name: ingredientsTable.name,
      slug: ingredientsTable.slug,
      ingredientType: ingredientsTable.ingredientType,
      unit: ingredientsTable.unit,
      costPerUnit: ingredientsTable.costPerUnit,
      isActive: ingredientsTable.isActive,
      stockQuantity: targetBranchId 
        ? sql<string>`COALESCE(${branchStockTable.stockQuantity}, '0')` 
        : sql<string>`(SELECT COALESCE(SUM(bs.stock_quantity), 0)::text FROM branch_stock bs WHERE bs.ingredient_id = ${ingredientsTable.id})`,
      lowStockThreshold: targetBranchId 
        ? sql<string>`COALESCE(${branchStockTable.lowStockThreshold}, '500')` 
        : sql<string>`'500'`,
      updatedAt: ingredientsTable.updatedAt,
    })
    .from(ingredientsTable)
    .leftJoin(
      branchStockTable,
      and(
        eq(branchStockTable.ingredientId, ingredientsTable.id),
        targetBranchId ? eq(branchStockTable.branchId, targetBranchId) : sql`1=0`
      )
    );

  const conditions = [];
  if (params.success && params.data.active !== undefined) {
    conditions.push(eq(ingredientsTable.isActive, params.data.active));
  }
  if (params.success && params.data.type) {
    conditions.push(eq(ingredientsTable.ingredientType, params.data.type as any));
  }

  const ingredients = conditions.length 
    ? await query.where(and(...conditions))
    : await query;

  // Get counts of links
  const [typeLinks, optionLinks, drinkLinks] = await Promise.all([
    db.select({ id: ingredientTypesTable.inventoryIngredientId, count: sql<number>`count(*)` }).from(ingredientTypesTable).groupBy(ingredientTypesTable.inventoryIngredientId),
    db.select({ id: ingredientOptionsTable.linkedIngredientId, count: sql<number>`count(*)` }).from(ingredientOptionsTable).groupBy(ingredientOptionsTable.linkedIngredientId),
    db.select({ id: drinksTable.cupIngredientId, count: sql<number>`count(*)` }).from(drinksTable).groupBy(drinksTable.cupIngredientId),
  ]);

  const typeCountMap = new Map(typeLinks.map(l => [l.id, Number(l.count)]));
  const optionCountMap = new Map(optionLinks.map(l => [l.id, Number(l.count)]));
  const drinkCountMap = new Map(drinkLinks.map(l => [l.id, Number(l.count)]));

  res.json(
    serializeDates(ingredients.map((i) => {
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

router.post("/ingredients", requirePermission("admin:manage_ingredients"), async (req, res): Promise<void> => {
  const parsed = CreateIngredientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionBranchId = ((req.session as any).branchId as number);
  if (!sessionBranchId) {
    res.status(400).json({ error: "No branch associated with session" });
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
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  const [stock] = await db
    .insert(branchStockTable)
    .values({
      branchId: sessionBranchId,
      ingredientId: ingredient.id,
      stockQuantity: String(parsed.data.stockQuantity ?? 0),
      lowStockThreshold: String(parsed.data.lowStockThreshold ?? 500),
    })
    .returning();

  res.status(201).json(
    ListIngredientsResponse.element.parse(serializeDates({
      ...ingredient,
      costPerUnit: parseFloat(ingredient.costPerUnit),
      stockQuantity: parseFloat(stock.stockQuantity),
      lowStockThreshold: parseFloat(stock.lowStockThreshold),
    }))
  );
  globalCache.clear();
});

router.get("/ingredients/:id", requirePermission("inventory:view"), async (req, res): Promise<void> => {
  const params = GetIngredientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const sessionUser = (req.session as any);
  const targetBranchId = (sessionUser.role === "admin" && req.query.branchId && req.query.branchId !== 'all') 
    ? parseInt(req.query.branchId as string) 
    : sessionUser.branchId;

  const detail = await buildIngredientDetail(params.data.id, targetBranchId);
  if (!detail) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  res.json(GetIngredientResponse.parse(serializeDates(detail)));
});

router.patch("/ingredients/:id", requirePermission("admin:manage_ingredients"), async (req, res): Promise<void> => {
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

  const sessionBranchId = (req.session as any).branchId;
  const updateData: Record<string, unknown> = {};
  const stockUpdateData: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) {
    updateData.name = parsed.data.name;
    updateData.slug = slugify(parsed.data.name);
  }
  if (parsed.data.ingredientType !== undefined) updateData.ingredientType = parsed.data.ingredientType;
  if (parsed.data.unit !== undefined) updateData.unit = parsed.data.unit;
  if (parsed.data.costPerUnit !== undefined) updateData.costPerUnit = String(parsed.data.costPerUnit);
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  if (parsed.data.stockQuantity !== undefined) stockUpdateData.stockQuantity = String(parsed.data.stockQuantity);
  if (parsed.data.lowStockThreshold !== undefined) stockUpdateData.lowStockThreshold = String(parsed.data.lowStockThreshold);

  const [ingredient] = Object.keys(updateData).length > 0
    ? await db.update(ingredientsTable).set(updateData).where(eq(ingredientsTable.id, params.data.id)).returning()
    : await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, params.data.id));

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  let stock;
  if (Object.keys(stockUpdateData).length > 0 && sessionBranchId) {
    [stock] = await db
      .insert(branchStockTable)
      .values({
        branchId: sessionBranchId,
        ingredientId: params.data.id,
        stockQuantity: stockUpdateData.stockQuantity as string || "0",
        lowStockThreshold: stockUpdateData.lowStockThreshold as string || "500",
      })
      .onConflictDoUpdate({
        target: [branchStockTable.branchId, branchStockTable.ingredientId],
        set: stockUpdateData,
      })
      .returning();
  } else if (sessionBranchId) {
    [stock] = await db.select().from(branchStockTable).where(and(eq(branchStockTable.ingredientId, params.data.id), eq(branchStockTable.branchId, sessionBranchId)));
  }

  await logActivity(req, "UPDATE_INGREDIENT", "ingredient", params.data.id, { ...updateData, ...stockUpdateData });

  res.json(
    UpdateIngredientResponse.parse(serializeDates({
      ...ingredient,
      costPerUnit: parseFloat(ingredient.costPerUnit),
      stockQuantity: parseFloat(stock?.stockQuantity || "0"),
      lowStockThreshold: parseFloat(stock?.lowStockThreshold || "500"),
    }))
  );
  globalCache.clear();
});

router.delete("/ingredients/:id", requirePermission("admin:manage_ingredients"), async (req, res): Promise<void> => {
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

    await logActivity(req, "DELETE_INGREDIENT", "ingredient", id);

    res.sendStatus(204);
    globalCache.clear();
  } catch (err: any) {
    res.status(400).json({ error: "Cannot delete ingredient because it is in use by historical orders." });
  }
});

router.post("/ingredients/:id/options", requirePermission("admin:manage_ingredients"), async (req, res): Promise<void> => {
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

router.patch("/ingredients/:id/options/:optionId", requirePermission("admin:manage_ingredients"), async (req, res): Promise<void> => {
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

router.delete("/ingredients/:id/options/:optionId", requirePermission("admin:manage_ingredients"), async (req, res): Promise<void> => {
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

router.post("/ingredients/:id/restock", requirePermission("inventory:adjust"), async (req, res): Promise<void> => {
  const params = GetIngredientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.format() });
    return;
  }

  const parsed = RestockIngredientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, params.data.id));
  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  const sessionBranchId = (req.session as any).branchId as number;
  const isAdmin = (req.session as any).role === "admin";
  const targetBranchId = (isAdmin && req.body.branchId) ? parseInt(req.body.branchId) : sessionBranchId;

  if (!targetBranchId) {
    res.status(400).json({ error: "No target branch specified" });
    return;
  }

  const [stock] = await db
    .select()
    .from(branchStockTable)
    .where(and(eq(branchStockTable.ingredientId, params.data.id), eq(branchStockTable.branchId, targetBranchId)));

  const currentQty = stock ? parseFloat(stock.stockQuantity) : 0;
  const newQty = currentQty + parsed.data.quantity;

  const sessionUserId = ((req.session as unknown as Record<string, unknown>).userId as number) ?? 1;

  await db.insert(stockMovementsTable).values({
    branchId: targetBranchId,
    ingredientId: params.data.id,
    orderId: null,
    movementType: "restock",
    quantity: String(parsed.data.quantity),
    quantityAfter: String(newQty),
    note: parsed.data.note ?? null,
    createdBy: sessionUserId,
  });

  const [updatedStock] = await db
    .insert(branchStockTable)
    .values({
      branchId: targetBranchId,
      ingredientId: (params.data as any).id,
      stockQuantity: String(newQty),
    })
    .onConflictDoUpdate({
      target: [branchStockTable.branchId, branchStockTable.ingredientId],
      set: { stockQuantity: String(newQty) }
    })
    .returning();

  res.json(
    RestockIngredientResponse.parse(serializeDates({
      ...ingredient,
      costPerUnit: parseFloat(ingredient.costPerUnit),
      stockQuantity: parseFloat(updatedStock.stockQuantity),
      lowStockThreshold: parseFloat(updatedStock.lowStockThreshold),
    }))
  );
  
  await logActivity(req, "RESTOCK_INGREDIENT", "ingredient", params.data.id, { quantity: parsed.data.quantity });
  globalCache.clear();
  const { broadcastEvent } = await import("../lib/sse");
  broadcastEvent("inventory_updated", { ingredientId: params.data.id });
});

export default router;
