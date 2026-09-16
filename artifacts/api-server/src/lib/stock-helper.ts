import { db, branchStockTable, bomsTable, bomItemsTable } from "@workspace/db";
import { eq, and, sql, inArray } from "drizzle-orm";

/**
 * Calculates effective stock quantities for all ingredients in a given branch (or globally if branchId is null/undefined).
 * For regular ingredients: returns physical stock from `branch_stock`.
 * For Live Prepare BOM target ingredients: calculates available portion yield dynamically based on
 * available stock of raw component ingredients, plus any direct physical stock.
 */
export async function getEffectiveStockMap(branchId?: number | null): Promise<Map<number, number>> {
  // 1. Fetch physical stock for all ingredients
  let physicalStockRows: Array<{ ingredientId: number; stock: string }>;
  if (branchId) {
    physicalStockRows = await db
      .select({
        ingredientId: branchStockTable.ingredientId,
        stock: branchStockTable.stockQuantity,
      })
      .from(branchStockTable)
      .where(eq(branchStockTable.branchId, branchId));
  } else {
    physicalStockRows = await db
      .select({
        ingredientId: branchStockTable.ingredientId,
        stock: sql<string>`SUM(${branchStockTable.stockQuantity})::text`,
      })
      .from(branchStockTable)
      .groupBy(branchStockTable.ingredientId);
  }

  const stockMap = new Map<number, number>();
  physicalStockRows.forEach((r) => {
    stockMap.set(r.ingredientId, parseFloat(r.stock || "0"));
  });

  // 2. Fetch active Live Prepare BOMs
  const liveBoms = await db
    .select({
      id: bomsTable.id,
      targetIngredientId: bomsTable.targetIngredientId,
      yieldQuantity: bomsTable.yieldQuantity,
    })
    .from(bomsTable)
    .where(and(eq(bomsTable.isActive, true), eq(bomsTable.isLivePrepare, true)));

  if (liveBoms.length === 0) {
    return stockMap;
  }

  const bomIds = liveBoms.map((b) => b.id);
  const bomItems = await db
    .select()
    .from(bomItemsTable)
    .where(inArray(bomItemsTable.bomId, bomIds));

  const bomItemsMap = new Map<number, typeof bomItems>();
  bomItems.forEach((item) => {
    const list = bomItemsMap.get(item.bomId) ?? [];
    list.push(item);
    bomItemsMap.set(item.bomId, list);
  });

  // 3. For each Live BOM target ingredient, calculate available yield based on component stock
  for (const bom of liveBoms) {
    const targetId = bom.targetIngredientId;
    const items = bomItemsMap.get(bom.id) ?? [];
    if (items.length === 0) continue;

    const yieldQty = parseFloat(bom.yieldQuantity || "1") || 1;
    let maxYield = Infinity;

    for (const item of items) {
      const compReq = parseFloat(item.quantity || "0");
      if (compReq <= 0) continue;

      // Physical stock of component ingredient
      const compStock = stockMap.get(item.ingredientId) ?? 0;
      const possibleYield = (compStock / compReq) * yieldQty;

      if (possibleYield < maxYield) {
        maxYield = possibleYield;
      }
    }

    if (maxYield === Infinity) {
      maxYield = 0;
    }

    // Direct physical stock (if any) + calculated live prepare yield
    const existingPhysical = stockMap.get(targetId) ?? 0;
    stockMap.set(targetId, existingPhysical + Math.max(0, maxYield));
  }

  return stockMap;
}
