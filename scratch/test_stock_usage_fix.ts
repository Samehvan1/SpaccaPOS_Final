import {
  db,
  drinksTable,
  drinkIngredientSlotsTable,
  drinkSlotTypeOptionsTable,
  drinkSlotVolumesTable,
  ingredientsTable,
  ingredientOptionsTable,
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  ingredientVolumesTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable,
} from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";

async function getStockUsage(drinkId: number) {
  const usage: any[] = [];
  const drink = await db.select().from(drinksTable).where(eq(drinksTable.id, drinkId)).limit(1).then(r => r[0]);
  if (!drink) return [];

  // 1. Cup
  if (drink.cupIngredientId) {
    const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, drink.cupIngredientId));
    if (ing) {
      usage.push({
        type: "cup",
        slotLabel: "Cup",
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        qty: 1,
        isDefault: true
      });
    }
  }

  // 2. Slots
  const slots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drinkId)).orderBy(asc(drinkIngredientSlotsTable.sortOrder), asc(drinkIngredientSlotsTable.id));

  for (const slot of slots) {
    // Collect all options for this slot
    let options: Array<{
      ingredientTypeId: number | null;
      inventoryIngredientId: number | null;
      processedQty: number;
      isDefault: boolean;
      source: string;
      label: string;
    }> = [];

    // A. Slot type options
    const slotTypeOpts = await db.select().from(drinkSlotTypeOptionsTable).where(eq(drinkSlotTypeOptionsTable.slotId, slot.id)).orderBy(asc(drinkSlotTypeOptionsTable.sortOrder), asc(drinkSlotTypeOptionsTable.id));
    for (const to of slotTypeOpts) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, to.ingredientTypeId));
      if (ingType?.inventoryIngredientId) {
        options.push({
          ingredientTypeId: to.ingredientTypeId,
          inventoryIngredientId: ingType.inventoryIngredientId,
          processedQty: Number(to.processedQty || ingType.processedQty || 0),
          isDefault: !!to.isDefault,
          source: "typed-option",
          label: slot.slotLabel
        });
      }
    }

    // B. Predefined template options
    if (options.length === 0 && slot.predefinedSlotId) {
      const templateOpts = await db.select().from(predefinedSlotTypeOptionsTable).where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId)).orderBy(asc(predefinedSlotTypeOptionsTable.sortOrder), asc(predefinedSlotTypeOptionsTable.id));
      for (const tto of templateOpts) {
        const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, tto.ingredientTypeId));
        if (ingType?.inventoryIngredientId) {
          options.push({
            ingredientTypeId: tto.ingredientTypeId,
            inventoryIngredientId: ingType.inventoryIngredientId,
            processedQty: Number(tto.processedQty || ingType.processedQty || 0),
            isDefault: !!tto.isDefault,
            source: "typed-template",
            label: slot.slotLabel
          });
        }
      }
    }

    // C. Direct type
    if (options.length === 0 && slot.ingredientTypeId) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, slot.ingredientTypeId));
      if (ingType?.inventoryIngredientId) {
        options.push({
          ingredientTypeId: slot.ingredientTypeId,
          inventoryIngredientId: ingType.inventoryIngredientId,
          processedQty: Number(ingType.processedQty || 0),
          isDefault: true,
          source: "typed-catalog",
          label: slot.slotLabel
        });
      }
    }

    // D. Legacy ingredient
    if (options.length === 0 && (slot as any).defaultOptionId) {
      const [opt] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, (slot as any).defaultOptionId));
      if (opt) {
        options.push({
          ingredientTypeId: null,
          inventoryIngredientId: opt.ingredientId,
          processedQty: Number(opt.processedQty || 0),
          isDefault: true,
          source: "legacy-option",
          label: slot.slotLabel
        });
      }
    } else if (options.length === 0 && slot.ingredientId) {
      options.push({
        ingredientTypeId: null,
        inventoryIngredientId: slot.ingredientId,
        processedQty: 0,
        isDefault: true,
        source: "legacy",
        label: slot.slotLabel
      });
    }

    if (options.length === 0) continue;

    // Rule 1: Determine default option for the slot
    // If no option has isDefault === true, consider the FIRST option as default!
    const hasExplicitDefaultOpt = options.some(o => o.isDefault);
    if (!hasExplicitDefaultOpt && options.length > 0) {
      options[0].isDefault = true;
    }

    // Helper: find default volume processedQty for an ingredientType in this slot
    const getDefaultVolumeQtyForType = async (typeId: number | null): Promise<number> => {
      if (!typeId) return 0;

      // 1. Slot-specific volumes for this slot
      const slotVols = await db.select().from(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id)).orderBy(asc(drinkSlotVolumesTable.sortOrder), asc(drinkSlotVolumesTable.id));
      const volsForType: number[] = [];
      let defaultVolQty = 0;

      for (const sv of slotVols) {
        const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, sv.typeVolumeId));
        if (typeVol && typeVol.ingredientTypeId === typeId) {
          const qty = Number(sv.processedQty || typeVol.processedQty || 0);
          if (sv.isDefault && qty > 0) {
            return qty;
          }
          if (qty > 0) volsForType.push(qty);
        }
      }

      // 2. Predefined template volumes
      if (slot.predefinedSlotId) {
        const templateVols = await db.select().from(predefinedSlotVolumesTable).where(eq(predefinedSlotVolumesTable.predefinedSlotId, slot.predefinedSlotId)).orderBy(asc(predefinedSlotVolumesTable.sortOrder), asc(predefinedSlotVolumesTable.id));
        for (const tv of templateVols) {
          const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, tv.typeVolumeId));
          if (typeVol && typeVol.ingredientTypeId === typeId) {
            const qty = Number(tv.processedQty || typeVol.processedQty || 0);
            if (tv.isDefault && qty > 0) {
              return qty;
            }
            if (qty > 0) volsForType.push(qty);
          }
        }
      }

      // 3. Global ingredient type volumes
      const typeVols = await db.select().from(ingredientTypeVolumesTable).where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, typeId), eq(ingredientTypeVolumesTable.isActive, true))).orderBy(asc(ingredientTypeVolumesTable.sortOrder), asc(ingredientTypeVolumesTable.id));
      for (const tv of typeVols) {
        const qty = Number(tv.processedQty || 0);
        if (tv.isDefault && qty > 0) {
          return qty;
        }
        if (qty > 0) volsForType.push(qty);
      }

      // If no volume marked isDefault, use FIRST volume's processedQty if available!
      if (volsForType.length > 0) {
        return volsForType[0];
      }

      return 0;
    };

    // Rule 2: Find default option's processedQty for the slot
    const defaultOptionObj = options.find(o => o.isDefault) || options[0];
    let defaultOptionQty = defaultOptionObj ? defaultOptionObj.processedQty : 0;
    if (defaultOptionQty === 0 && defaultOptionObj?.ingredientTypeId) {
      defaultOptionQty = await getDefaultVolumeQtyForType(defaultOptionObj.ingredientTypeId);
    }

    // Now resolve each option's final processed quantity
    for (const opt of options) {
      let finalQty = opt.processedQty;

      // 1. Check direct processedQty
      if (finalQty <= 0) {
        // 2. Check default option's processedQty
        if (defaultOptionQty > 0) {
          finalQty = defaultOptionQty;
        } else {
          // 3. Check default volume's processedQty for this opt's type
          const defVolQty = await getDefaultVolumeQtyForType(opt.ingredientTypeId);
          if (defVolQty > 0) {
            finalQty = defVolQty;
          }
        }
      }

      const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, opt.inventoryIngredientId!));
      if (!ing) continue;

      // Deduplicate per slot
      const existingIdx = usage.findIndex(u => u.ingredientId === ing.id && u.slotLabel === slot.slotLabel);
      if (existingIdx !== -1) {
        if (usage[existingIdx].qty === 0 && finalQty > 0) {
          usage[existingIdx].qty = finalQty;
        }
        if (!usage[existingIdx].isDefault && opt.isDefault) {
          usage[existingIdx].isDefault = true;
        }
      } else {
        usage.push({
          type: opt.source,
          slotLabel: slot.slotLabel,
          ingredientId: ing.id,
          ingredientName: ing.name,
          unit: ing.unit,
          qty: finalQty,
          isDefault: opt.isDefault
        });
      }
    }
  }

  return usage;
}

async function main() {
  console.log("=== Testing Stock Usage for Iced Latte (ID 36) ===");
  const usage36 = await getStockUsage(36);
  console.log(`Iced Latte (ID 36) usage count: ${usage36.length}`);
  console.table(usage36);
}

main().catch(console.error).finally(() => process.exit(0));
