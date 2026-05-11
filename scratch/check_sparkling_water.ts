
import { db, drinksTable, drinkIngredientSlotsTable, ingredientsTable, branchStockTable } from "./lib/db/src";
import { eq, and } from "drizzle-orm";

async function checkSparklingWater() {
  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.name, "Sparkling Water"));
  if (!drink) {
    console.log("Drink 'Sparkling Water' not found");
    process.exit(0);
  }

  console.log("Drink Details:", JSON.stringify(drink, null, 2));

  const slots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drink.id));
  console.log("Slots:", JSON.stringify(slots, null, 2));

  for (const slot of slots) {
    if (slot.ingredientId) {
      const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, slot.ingredientId));
      console.log(`Slot '${slot.slotLabel}' -> Ingredient: ${ingredient?.name}`);
      
      const stock = await db.select().from(branchStockTable).where(and(
        eq(branchStockTable.ingredientId, slot.ingredientId),
        eq(branchStockTable.branchId, 1)
      ));
      console.log(`Stock for ${ingredient?.name} in Branch 1:`, JSON.stringify(stock, null, 2));
    }
  }

  if (drink.cupIngredientId) {
    const [cup] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, drink.cupIngredientId));
    console.log(`Cup Ingredient: ${cup?.name}`);
    const cupStock = await db.select().from(branchStockTable).where(and(
      eq(branchStockTable.ingredientId, drink.cupIngredientId),
      eq(branchStockTable.branchId, 1)
    ));
    console.log(`Cup Stock in Branch 1:`, JSON.stringify(cupStock, null, 2));
  }

  process.exit(0);
}

checkSparklingWater();
