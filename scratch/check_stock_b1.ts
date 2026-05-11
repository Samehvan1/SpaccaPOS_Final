
import { db, branchStockTable, ingredientsTable } from "./lib/db/src";
import { eq, and } from "drizzle-orm";

async function dumpBranch1Stock() {
  const stock = await db.select({
    id: ingredientsTable.id,
    name: ingredientsTable.name,
    stock: branchStockTable.stockQuantity,
    threshold: branchStockTable.lowStockThreshold
  })
  .from(branchStockTable)
  .innerJoin(ingredientsTable, eq(branchStockTable.ingredientId, ingredientsTable.id))
  .where(eq(branchStockTable.branchId, 1));

  console.log("Branch 1 Stock List:");
  console.log(JSON.stringify(stock, null, 2));

  // Also check if there are any ingredients with NO stock records for branch 1
  const allIngredients = await db.select().from(ingredientsTable);
  const stockIngredientIds = new Set(stock.map(s => s.id));
  const missing = allIngredients.filter(i => !stockIngredientIds.has(i.id));
  
  console.log("\nIngredients missing from branch_stock for Branch 1:");
  console.log(JSON.stringify(missing.map(m => ({ id: m.id, name: m.name })), null, 2));

  process.exit(0);
}

dumpBranch1Stock();
