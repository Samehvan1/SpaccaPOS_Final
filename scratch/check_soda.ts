
import { db, ingredientsTable, branchStockTable } from "./lib/db/src";
import { eq, and, like } from "drizzle-orm";

async function checkSodaStock() {
  const sodaIngredients = await db.select().from(ingredientsTable).where(like(ingredientsTable.name, "%Soda%"));
  console.log("Soda Ingredients found:", JSON.stringify(sodaIngredients.map(i => ({id: i.id, name: i.name})), null, 2));

  for (const soda of sodaIngredients) {
    const stock = await db.select().from(branchStockTable).where(and(
      eq(branchStockTable.ingredientId, soda.id),
      eq(branchStockTable.branchId, 1)
    ));
    console.log(`Stock for ${soda.name} (ID: ${soda.id}) in Branch 1:`, JSON.stringify(stock, null, 2));
  }
  process.exit(0);
}

checkSodaStock();
