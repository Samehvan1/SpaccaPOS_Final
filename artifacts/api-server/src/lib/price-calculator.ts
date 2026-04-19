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
  ingredientVolumesTable,
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
  baristaSortOrder: number;
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
      const typeName = typeDef?.name ?? "";
      
      const [volDef] = typeVol.volumeId ? await db.select().from(ingredientVolumesTable).where(eq(ingredientVolumesTable.id, typeVol.volumeId)) : [null];
      const volumeName = volDef?.name ?? "";

      const extraCost = parseFloat(slotVol?.extraCost ?? typeVol.extraCost);
      totalExtras += extraCost;

      const consumedQty = parseFloat(slotVol?.processedQty ?? typeVol.processedQty ?? "0");
      const producedQty = parseFloat(slotVol?.producedQty ?? typeVol.producedQty ?? "0");
      
      if (typeDef?.affectsCupSize) {
        usedVolumeMl += producedQty;
      }

      const optionLabel = typeName && volumeName ? `${typeName} · ${volumeName}` : typeName || volumeName || "Catalog Item";

      customizations.push({
        ingredientId: inventoryId,
        optionId: null,
        typeVolumeId: sel.typeVolumeId,
        ingredientTypeId: typeVol.ingredientTypeId,
        consumedQty,
        addedCost: extraCost,
        slotLabel: slot.slotLabel,
        optionLabel,
        baristaSortOrder: slot.baristaSortOrder ?? 1,
      });
      continue;
    }

    // Typed slot but NO volume (type-only e.g. sugar)
    if (sel.ingredientTypeId) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, sel.ingredientTypeId));
      if (ingType) {
        const consumedQty = parseFloat(ingType.processedQty ?? "0");
        const producedQty = parseFloat(ingType.producedQty ?? "0");
        
        if (ingType.affectsCupSize) {
          usedVolumeMl += producedQty;
        }
        
        const optionLabel = (producedQty > 0 || consumedQty > 0) 
          ? `${ingType.name} (${producedQty > 0 ? producedQty : consumedQty}${ingType.unit ?? "g"})`
          : ingType.name;

        customizations.push({
          ingredientId: ingType.inventoryIngredientId ?? null,
          optionId: null,
          typeVolumeId: null,
          ingredientTypeId: sel.ingredientTypeId,
          consumedQty,
          addedCost: 0,
          slotLabel: slot.slotLabel,
          optionLabel,
          baristaSortOrder: slot.baristaSortOrder ?? 1,
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
          baristaSortOrder: slot.baristaSortOrder ?? 1,
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
      baristaSortOrder: slot.baristaSortOrder ?? 1,
    });
  }

  // Dynamic slot calculate
  const dynamicSlot = slots.find((s) => s.isDynamic);
  if (dynamicSlot && drink.cupSizeMl) {
    const filledMl = Math.max(0, drink.cupSizeMl - usedVolumeMl);

    // Catalog Dynamic Slot
    const typeOptions = await db.select().from(drinkSlotTypeOptionsTable)
      .where(eq(drinkSlotTypeOptionsTable.slotId, dynamicSlot.id));

    if (dynamicSlot.ingredientTypeId || typeOptions.length > 0) {
      const dynamicSelection = selections.find((s: any) => s.slotId === dynamicSlot.id);
      let effectiveTypeId = dynamicSelection?.ingredientTypeId;
      
      if (!effectiveTypeId) {
        const defType = typeOptions.find(to => to.isDefault) ?? typeOptions[0];
        effectiveTypeId = defType?.ingredientTypeId ?? dynamicSlot.ingredientTypeId;
      }

      if (effectiveTypeId) {
        const [ingredientType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, effectiveTypeId));

        // Try to fetch a type volume just to check for custom conversion rates, if none, default to 1:1
        let typeVolumeId = dynamicSelection?.typeVolumeId;
        if (!typeVolumeId) {
          const typeVolumes = await db.select().from(ingredientTypeVolumesTable)
            .where(eq(ingredientTypeVolumesTable.ingredientTypeId, effectiveTypeId));
          const defVol = typeVolumes.find(tv => tv.isDefault) ?? typeVolumes[0];
          typeVolumeId = defVol?.id;
        }

        let conversionRate = 1;
        let unit = "ml";
        if (typeVolumeId) {
          const [typeVolume] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, typeVolumeId));
          if (typeVolume) {
            const processedQty = parseFloat(typeVolume.processedQty ?? "0");
            const producedQty = parseFloat(typeVolume.producedQty ?? "0");
            conversionRate = producedQty > 0 ? processedQty / producedQty : 1;
            unit = typeVolume.unit ?? "ml";
          }
        }

        const consumedQty = filledMl * conversionRate;
        
        let cost = 0;
        let inventoryId = null;

        if (ingredientType?.inventoryIngredientId) {
          inventoryId = ingredientType.inventoryIngredientId;
          const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, inventoryId));
          if (ingredient) {
            cost = consumedQty * parseFloat(ingredient.costPerUnit);
          }
        }

        totalExtras += cost;
        const ingredientName = ingredientType?.name ?? "Dynamic";
        dynamicInfo = { slotLabel: dynamicSlot.slotLabel, ingredientName, filledMl, cost };
        
        customizations.push({
          ingredientId: inventoryId,
          optionId: null,
          typeVolumeId: typeVolumeId ?? null,
          ingredientTypeId: effectiveTypeId,
          consumedQty,
          addedCost: cost,
          slotLabel: dynamicSlot.slotLabel,
          optionLabel: ingredientType?.name ? `${ingredientType.name} (${Math.round(filledMl)}${unit})` : `Dynamic (${Math.round(filledMl)}${unit})`,
          baristaSortOrder: dynamicSlot.baristaSortOrder ?? 1,
        });
      }
    }
    // Legacy Dynamic Slot
    else if (dynamicSlot.ingredientId) {
      const dynamicSelection = selections.find((s: any) => s.ingredientId === dynamicSlot.ingredientId);
      const optionId = dynamicSelection?.optionId ?? dynamicSlot.defaultOptionId;
      if (optionId) {
        let cost = 0;
        let consumedQty = 0;
        let optionLabel = `Dynamic (${Math.round(filledMl)}ml)`;
        let ingredientName = "Dynamic";

        const [option] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, optionId));
        
        if (option) {
          const processedQty = parseFloat(option.processedQty);
          const producedQty = parseFloat(option.producedQty);
          const conversionRate = producedQty > 0 ? processedQty / producedQty : 1;
          consumedQty = filledMl * conversionRate;
          
          const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, dynamicSlot.ingredientId));
          if (ingredient) {
            cost = consumedQty * parseFloat(ingredient.costPerUnit);
            ingredientName = ingredient.name;
            optionLabel = `${ingredientName} (${Math.round(filledMl)}ml)`;
          }
        }

        totalExtras += cost;
        dynamicInfo = { slotLabel: dynamicSlot.slotLabel, ingredientName, filledMl, cost };

        customizations.push({
          ingredientId: dynamicSlot.ingredientId,
          optionId,
          typeVolumeId: null,
          ingredientTypeId: null,
          consumedQty,
          addedCost: cost,
          slotLabel: dynamicSlot.slotLabel,
          optionLabel: `Dynamic (${Math.round(filledMl)}ml)`,
          baristaSortOrder: dynamicSlot.baristaSortOrder ?? 1,
        });
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
