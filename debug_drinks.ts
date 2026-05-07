import { db, drinksTable, drinkIngredientSlotsTable, drinkSlotTypeOptionsTable, predefinedSlotTypeOptionsTable } from "./lib/db/src/index";
import { eq } from "drizzle-orm";

async function debug() {
  const drinks = await db.select().from(drinksTable);
  const macchiato = drinks.find(d => d.name.includes("Macchiato") && !d.name.includes("Iced"));
  const icedMacchiato = drinks.find(d => d.name.includes("Iced Caramel Macchiato"));

  console.log("--- MACCHIATO ---");
  if (macchiato) {
    console.log(JSON.stringify(macchiato, null, 2));
    const slots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, macchiato.id));
    console.log("Slots:", JSON.stringify(slots, null, 2));
  }

  console.log("\n--- ICED CARAMEL MACCHIATO ---");
  if (icedMacchiato) {
    console.log(JSON.stringify(icedMacchiato, null, 2));
    const slots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, icedMacchiato.id));
    console.log("Slots:", JSON.stringify(slots, null, 2));
    
    for (const slot of slots) {
      if (slot.predefinedSlotId) {
        const opts = await db.select().from(predefinedSlotTypeOptionsTable).where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId));
        console.log(`Slot ${slot.id} (Template ${slot.predefinedSlotId}) Options:`, JSON.stringify(opts, null, 2));
      }
    }
  }
}

debug().catch(console.error);
