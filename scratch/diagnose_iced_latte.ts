import { db, drinksTable, drinkIngredientSlotsTable, drinkSlotTypeOptionsTable, drinkSlotVolumesTable, ingredientTypesTable, ingredientsTable, predefinedSlotsTable, predefinedSlotTypeOptionsTable, predefinedSlotVolumesTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";

async function main() {
  console.log("=== Diagnosing Iced Latte Recipe ===");
  const drinks = await db.select().from(drinksTable).where(ilike(drinksTable.name, "%latte%"));
  console.log(`Found ${drinks.length} drinks matching 'latte':`);
  for (const drink of drinks) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Drink ID: ${drink.id}, Name: "${drink.name}", Category: "${drink.category}", cupIngredientId: ${drink.cupIngredientId}`);
    
    if (drink.cupIngredientId) {
      const [cupIng] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, drink.cupIngredientId));
      console.log(`  Cup Ingredient: ID ${drink.cupIngredientId} -> ${cupIng ? cupIng.name : 'NOT FOUND IN INGREDIENTS'}`);
    }

    const slots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drink.id));
    console.log(`  Found ${slots.length} slots:`);
    for (const slot of slots) {
      console.log(`    Slot ID: ${slot.id}, Label: "${slot.slotLabel}", ingredientId: ${slot.ingredientId}, ingredientTypeId: ${slot.ingredientTypeId}, predefinedSlotId: ${slot.predefinedSlotId}, defaultOptionId: ${(slot as any).defaultOptionId}`);

      if (slot.ingredientId) {
        const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, slot.ingredientId));
        console.log(`      Legacy Ingredient: ID ${slot.ingredientId} -> ${ing ? ing.name : 'NOT FOUND IN INGREDIENTS'}`);
      }

      if (slot.ingredientTypeId) {
        const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, slot.ingredientTypeId));
        console.log(`      Slot Direct Type: ID ${slot.ingredientTypeId} -> ${ingType ? `${ingType.name} (inventoryIngredientId: ${ingType.inventoryIngredientId})` : 'NOT FOUND IN TYPES'}`);
        if (ingType?.inventoryIngredientId) {
          const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
          console.log(`        Linked Inventory Ingredient: ${ing ? ing.name : 'NOT FOUND IN INGREDIENTS'}`);
        }
      }

      const typeOptions = await db.select().from(drinkSlotTypeOptionsTable).where(eq(drinkSlotTypeOptionsTable.slotId, slot.id));
      console.log(`      Slot Type Options count: ${typeOptions.length}`);
      for (const to of typeOptions) {
        const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, to.ingredientTypeId));
        console.log(`        Option: typeId ${to.ingredientTypeId} (${ingType?.name}), isDefault: ${to.isDefault}, inventoryIngredientId: ${ingType?.inventoryIngredientId}`);
        if (ingType?.inventoryIngredientId) {
          const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
          console.log(`          Linked Inventory Ingredient: ${ing ? ing.name : 'NOT FOUND IN INGREDIENTS'}`);
        }
      }

      const slotVolumes = await db.select().from(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id));
      console.log(`      Slot Volumes count: ${slotVolumes.length}`);
      for (const sv of slotVolumes) {
        console.log(`        Slot Volume: typeVolumeId ${sv.typeVolumeId}`);
      }

      if (slot.predefinedSlotId) {
        const templateOptions = await db.select().from(predefinedSlotTypeOptionsTable).where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId));
        console.log(`      Predefined Slot Options count: ${templateOptions.length}`);
        for (const tto of templateOptions) {
          const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, tto.ingredientTypeId));
          console.log(`        Template Option: typeId ${tto.ingredientTypeId} (${ingType?.name}), inventoryIngredientId: ${ingType?.inventoryIngredientId}`);
          if (ingType?.inventoryIngredientId) {
            const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
            console.log(`          Linked Inventory Ingredient: ${ing ? ing.name : 'NOT FOUND IN INGREDIENTS'}`);
          }
        }
      }
    }
  }
}

main().catch(console.error).finally(() => process.exit(0));
