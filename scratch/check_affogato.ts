import { db, drinksTable, drinkIngredientSlotsTable, drinkSlotTypeOptionsTable, ingredientTypesTable, branchStockTable } from "../lib/db/src";
import { eq, and } from "drizzle-orm";

async function run() {
  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.name, "Espresso Affogato")).limit(1);
  if (!drink) {
    console.log("Drink not found");
    process.exit(0);
  }
  console.log("Drink:", JSON.stringify(drink, null, 2));

  const slots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drink.id));
  for (const slot of slots) {
    console.log("Slot:", slot.slotLabel, "isRequired:", slot.isRequired);
    const typeOptions = await db.select().from(drinkSlotTypeOptionsTable).where(eq(drinkSlotTypeOptionsTable.slotId, slot.id));
    for (const to of typeOptions) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, to.ingredientTypeId)).limit(1);
      console.log("  Type Option:", ingType?.name, "invId:", ingType?.inventoryIngredientId);
      if (ingType?.inventoryIngredientId) {
          const stocks = await db.select().from(branchStockTable).where(eq(branchStockTable.ingredientId, ingType.inventoryIngredientId));
          console.log("    Stocks:", JSON.stringify(stocks, null, 2));
      }
    }
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
