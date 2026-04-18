import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  drinksTable,
  drinkIngredientSlotsTable,
  drinkSlotVolumesTable,
  drinkSlotTypeOptionsTable,
} from "@workspace/db/schema";
import {
  ingredientsTable,
  ingredientOptionsTable,
  ingredientTypesTable,
  ingredientTypeVolumesTable,
} from "@workspace/db/schema";

export type CustomizationData = {
  ingredientId: number | null; // Inventory ID for stock deduction
  optionId: number | null;
  typeVolumeId: number | null;
  ingredientTypeId: number | null;
  consumedQty: number; // The qty to deduct from stock
  addedCost: number; // The extra money to charge
  slotLabel: string;
  optionLabel: string;
};

export async function calculateDrinkData(drinkId: number, selections: any[]) {
  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.id, drinkId));
  if (!drink) throw new Error("Drink not found");

  const slots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drinkId));

  const customizations: CustomizationData[] = [];
  let totalExtras = 0;
  let usedVolumeMl = 0;
  let dynamicInfo: { slotLabel: string; ingredientName: string; filledMl: number; cost: number } | null = null;

  for (const selection of selections) {
    const sel = selection as any;
    let slot: (typeof slots)[0] | undefined;

    // Identify slot: prefer explicit slotId, then ingredientTypeId, then ingredientId
    if (sel.slotId) {
      slot = slots.find((s) => s.id === sel.slotId);
    } else if (sel.ingredientTypeId) {
      slot = slots.find((s) => s.ingredientTypeId === sel.ingredientTypeId);
    } else {
      slot = slots.find((s) => s.ingredientId === sel.ingredientId);
    }
    if (!slot || slot.isDynamic) continue;

    // New-style slot: typed selection (slotId + typeVolumeId)
    if (sel.typeVolumeId) {
      const [typeVol] = await db.select().from(ingredientTypeVolumesTable)
        .where(eq(ingredientTypeVolumesTable.id, sel.typeVolumeId));
      if (!typeVol) continue;

      const [slotVol] = await db.select().from(drinkSlotVolumesTable)
        .where(and(
          eq(drinkSlotVolumesTable.slotId, slot.id),
          eq(drinkSlotVolumesTable.typeVolumeId, sel.typeVolumeId)
        ));

      const [typeDef] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, typeVol.ingredientTypeId));
      const inventoryId = typeDef?.inventoryIngredientId ?? null;

      const extraCost = parseFloat(slotVol?.extraCost ?? typeVol.extraCost);
      totalExtras += extraCost;

      const consumedQty = parseFloat(slotVol?.processedQty ?? typeVol.processedQty ?? "0");
      const producedQty = parseFloat(slotVol?.producedQty ?? typeVol.producedQty ?? "0");
      usedVolumeMl += producedQty;

      customizations.push({
        ingredientId: inventoryId,
        optionId: null,
        typeVolumeId: sel.typeVolumeId,
        ingredientTypeId: typeVol.ingredientTypeId,
        consumedQty,
        addedCost: extraCost,
        slotLabel: slot.slotLabel,
        optionLabel: "", // Let the frontend formatting take precedence for standard items
      });
      continue;
    }

    // Typed slot but NO volume (type-only e.g. sugar)
    if (sel.ingredientTypeId) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, sel.ingredientTypeId));
      if (ingType) {
        customizations.push({
          ingredientId: ingType.inventoryIngredientId ?? null,
          optionId: null,
          typeVolumeId: null,
          ingredientTypeId: sel.ingredientTypeId,
          consumedQty: 0,
          addedCost: 0,
          slotLabel: slot.slotLabel,
          optionLabel: ingType.name,
        });
      }
      continue;
    }

    // Old-style slot
    if (!selection.optionId) continue;
    const [option] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, selection.optionId));
    if (!option) continue;

    if (option.linkedIngredientId && selection.subOptionId) {
      const [subOption] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, selection.subOptionId));
      if (subOption) {
        const extraCost = parseFloat(subOption.extraCost);
        totalExtras += extraCost;
        usedVolumeMl += parseFloat(subOption.producedQty);
        customizations.push({
          ingredientId: option.linkedIngredientId,
          optionId: selection.subOptionId,
          typeVolumeId: null,
          ingredientTypeId: null,
          consumedQty: parseFloat(subOption.processedQty),
          addedCost: extraCost,
          slotLabel: slot.slotLabel,
          optionLabel: `${option.label} · ${subOption.label}`,
        });
      }
      continue;
    }

    const extraCost = parseFloat(option.extraCost);
    totalExtras += extraCost;
    usedVolumeMl += parseFloat(option.producedQty);
    customizations.push({
      ingredientId: selection.ingredientId ?? slot.ingredientId ?? null,
      optionId: selection.optionId,
      typeVolumeId: null,
      ingredientTypeId: null,
      consumedQty: parseFloat(option.processedQty),
      addedCost: extraCost,
      slotLabel: slot.slotLabel,
      optionLabel: option.label,
    });
  }

  // Dynamic slot calculate
  const dynamicSlot = slots.find((s) => s.isDynamic);
  if (dynamicSlot && drink.cupSizeMl) {
    const filledMl = Math.max(0, drink.cupSizeMl - usedVolumeMl);

    // Catalog Dynamic Slot
    if (dynamicSlot.ingredientTypeId || slots.some(s => s.id === dynamicSlot.id && s.ingredientTypeId)) {
      const dynamicSelection = selections.find((s: any) => s.slotId === dynamicSlot.id);
      let typeVolumeId = dynamicSelection?.typeVolumeId;

      if (!typeVolumeId) {
        const typeOptions = await db.select().from(drinkSlotTypeOptionsTable)
          .where(eq(drinkSlotTypeOptionsTable.slotId, dynamicSlot.id));
        const defType = typeOptions.find(to => to.isDefault) ?? typeOptions[0];
        const effectiveTypeId = defType?.ingredientTypeId;

        if (effectiveTypeId) {
          const typeVolumes = await db.select().from(ingredientTypeVolumesTable)
            .where(eq(ingredientTypeVolumesTable.ingredientTypeId, effectiveTypeId));
          const defVol = typeVolumes.find(tv => tv.isDefault) ?? typeVolumes[0];
          typeVolumeId = defVol?.id;
        }
      }

      if (typeVolumeId) {
        const [typeVolume] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, typeVolumeId));
        if (typeVolume) {
          const [ingredientType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, typeVolume.ingredientTypeId));

          if (ingredientType?.inventoryIngredientId) {
            const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingredientType.inventoryIngredientId));
            if (ingredient) {
              const processedQty = parseFloat(typeVolume.processedQty ?? "0");
              const producedQty = parseFloat(typeVolume.producedQty ?? "0");
              const conversionRate = producedQty > 0 ? processedQty / producedQty : 1;
              const consumedQty = filledMl * conversionRate;
              const cost = consumedQty * parseFloat(ingredient.costPerUnit);
              
              totalExtras += cost;
              dynamicInfo = { slotLabel: dynamicSlot.slotLabel, ingredientName: ingredientType.name, filledMl, cost };
              
              customizations.push({
                ingredientId: ingredientType.inventoryIngredientId,
                optionId: null,
                typeVolumeId: typeVolume.id,
                ingredientTypeId: typeVolume.ingredientTypeId,
                consumedQty,
                addedCost: cost,
                slotLabel: dynamicSlot.slotLabel,
                optionLabel: `Dynamic (${Math.round(filledMl)}${typeVolume.unit ?? "ml"})`,
              });
            }
          }
        }
      }
    }
    // Legacy Dynamic Slot
    else if (dynamicSlot.ingredientId) {
      const dynamicSelection = selections.find((s: any) => s.ingredientId === dynamicSlot.ingredientId);
      const optionId = dynamicSelection?.optionId ?? dynamicSlot.defaultOptionId;
      if (optionId) {
        const [[option], [ingredient]] = await Promise.all([
          db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, optionId)),
          db.select().from(ingredientsTable).where(eq(ingredientsTable.id, dynamicSlot.ingredientId)),
        ]);
        if (option && ingredient) {
          const processedQty = parseFloat(option.processedQty);
          const producedQty = parseFloat(option.producedQty);
          const conversionRate = producedQty > 0 ? processedQty / producedQty : 1;
          const consumedQty = filledMl * conversionRate;
          const cost = consumedQty * parseFloat(ingredient.costPerUnit);
          
          totalExtras += cost;
          dynamicInfo = { slotLabel: dynamicSlot.slotLabel, ingredientName: ingredient.name, filledMl, cost };
          
          customizations.push({
            ingredientId: dynamicSlot.ingredientId,
            optionId,
            typeVolumeId: null,
            ingredientTypeId: null,
            consumedQty,
            addedCost: cost,
            slotLabel: dynamicSlot.slotLabel,
            optionLabel: `Dynamic (${Math.round(filledMl)}ml)`,
          });
        }
      }
    }
  }

  const basePrice = parseFloat(drink.basePrice);
  return {
    drink,
    basePrice,
    totalExtras,
    totalPrice: basePrice + totalExtras,
    usedVolumeMl,
    customizations,
    dynamicInfo,
  };
}
