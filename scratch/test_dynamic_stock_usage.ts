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

async function getStockUsageWithDynamic(drinkId: number) {
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

  // Pre-calculate non-dynamic used volume (ml) if drink has cupSizeMl
  let nonDynamicVolumeMl = 0;
  for (const slot of slots) {
    if (slot.isDynamic) continue;

    // Check default option / volume for this non-dynamic slot
    const slotTypeOpts = await db.select().from(drinkSlotTypeOptionsTable).where(and(eq(drinkSlotTypeOptionsTable.slotId, slot.id), eq(drinkSlotTypeOptionsTable.isDefault, true)));
    let defOptTypeId = slotTypeOpts[0]?.ingredientTypeId ?? slot.ingredientTypeId;

    if (!defOptTypeId && slot.predefinedSlotId) {
      const templateOpts = await db.select().from(predefinedSlotTypeOptionsTable).where(and(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId), eq(predefinedSlotTypeOptionsTable.isDefault, true)));
      defOptTypeId = templateOpts[0]?.ingredientTypeId ?? null;
    }

    if (defOptTypeId) {
      // Check default volume for this typeId
      const slotVols = await db.select().from(drinkSlotVolumesTable).where(and(eq(drinkSlotVolumesTable.slotId, slot.id), eq(drinkSlotVolumesTable.isDefault, true)));
      let volProduced = 0;
      let volProcessed = 0;
      if (slotVols.length > 0) {
        const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, slotVols[0].typeVolumeId));
        volProduced = Number(slotVols[0].producedQty || typeVol?.producedQty || 0);
        volProcessed = Number(slotVols[0].processedQty || typeVol?.processedQty || 0);
      } else {
        const typeVols = await db.select().from(ingredientTypeVolumesTable).where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, defOptTypeId), eq(ingredientTypeVolumesTable.isActive, true))).orderBy(asc(ingredientTypeVolumesTable.sortOrder));
        const defVol = typeVols.find(v => v.isDefault) ?? typeVols[0];
        if (defVol) {
          volProduced = Number(defVol.producedQty || 0);
          volProcessed = Number(defVol.processedQty || 0);
        }
      }
      nonDynamicVolumeMl += volProduced > 0 ? volProduced : volProcessed;
    }
  }

  const dynamicFillMl = (drink.cupSizeMl && drink.cupSizeMl > 0) ? Math.max(0, drink.cupSizeMl - nonDynamicVolumeMl) : 0;
  console.log(`[DynamicVolume] Drink: "${drink.name}", cupSizeMl: ${drink.cupSizeMl}, nonDynamicVolumeMl: ${nonDynamicVolumeMl}, dynamicFillMl: ${dynamicFillMl}`);

  for (const slot of slots) {
    let options: Array<{
      ingredientTypeId: number | null;
      inventoryIngredientId: number | null;
      processedQty: number;
      isDefault: boolean;
      source: string;
      label: string;
    }> = [];

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

    const hasExplicitDefaultOpt = options.some(o => o.isDefault);
    if (!hasExplicitDefaultOpt && options.length > 0) {
      options[0].isDefault = true;
    }

    const getDefaultVolumeQtyForType = async (typeId: number | null): Promise<number> => {
      if (!typeId) return 0;
      const slotVols = await db.select().from(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id)).orderBy(asc(drinkSlotVolumesTable.sortOrder), asc(drinkSlotVolumesTable.id));
      const volsForType: number[] = [];

      for (const sv of slotVols) {
        const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, sv.typeVolumeId));
        if (typeVol && typeVol.ingredientTypeId === typeId) {
          const qty = Number(sv.processedQty || typeVol.processedQty || 0);
          if (sv.isDefault && qty > 0) return qty;
          if (qty > 0) volsForType.push(qty);
        }
      }

      if (slot.predefinedSlotId) {
        const templateVols = await db.select().from(predefinedSlotVolumesTable).where(eq(predefinedSlotVolumesTable.predefinedSlotId, slot.predefinedSlotId)).orderBy(asc(predefinedSlotVolumesTable.sortOrder), asc(predefinedSlotVolumesTable.id));
        for (const tv of templateVols) {
          const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, tv.typeVolumeId));
          if (typeVol && typeVol.ingredientTypeId === typeId) {
            const qty = Number(tv.processedQty || typeVol.processedQty || 0);
            if (tv.isDefault && qty > 0) return qty;
            if (qty > 0) volsForType.push(qty);
          }
        }
      }

      const typeVols = await db.select().from(ingredientTypeVolumesTable).where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, typeId), eq(ingredientTypeVolumesTable.isActive, true))).orderBy(asc(ingredientTypeVolumesTable.sortOrder), asc(ingredientTypeVolumesTable.id));
      for (const tv of typeVols) {
        const qty = Number(tv.processedQty || 0);
        if (tv.isDefault && qty > 0) return qty;
        if (qty > 0) volsForType.push(qty);
      }

      if (volsForType.length > 0) return volsForType[0];

      return 0;
    };

    const defaultOptionObj = options.find(o => o.isDefault) || options[0];
    let defaultOptionQty = defaultOptionObj ? defaultOptionObj.processedQty : 0;
    if (defaultOptionQty === 0 && defaultOptionObj?.ingredientTypeId) {
      defaultOptionQty = await getDefaultVolumeQtyForType(defaultOptionObj.ingredientTypeId);
    }

    for (const opt of options) {
      let finalQty = opt.processedQty;

      if (finalQty <= 0) {
        if (defaultOptionQty > 0) {
          finalQty = defaultOptionQty;
        } else {
          const defVolQty = await getDefaultVolumeQtyForType(opt.ingredientTypeId);
          if (defVolQty > 0) {
            finalQty = defVolQty;
          } else if (slot.isDynamic && dynamicFillMl > 0) {
            // DYNAMIC VOLUME FALLBACK
            finalQty = dynamicFillMl;
          }
        }
      }

      const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, opt.inventoryIngredientId!));
      if (!ing) continue;

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
  console.log("=== Testing Dynamic Stock Usage for Iced Latte (ID 36) ===");
  const usage36 = await getStockUsageWithDynamic(36);
  console.table(usage36);
}

main().catch(console.error).finally(() => process.exit(0));
