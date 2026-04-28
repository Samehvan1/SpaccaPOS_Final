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
  predefinedSlotsTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable,
} from "@workspace/db/schema";

export type CustomizationData = {
  ingredientId: number | null; // Inventory ID for stock deduction
  optionId: number | null;
  typeVolumeId: number | null;
  ingredientTypeId: number | null;
  consumedQty: number; // The qty to deduct from stock
  producedQty: number; // New: qty added to cup (in ml)
  color: string | null; // New: visual color for simulator
  addedCost: number; // The extra money to charge
  slotLabel: string;
  optionLabel: string;
  baristaSortOrder: number;
  customerSortOrder: number;
};

export async function calculateDrinkData(drinkId: number, selections: any[]) {
  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.id, drinkId));
  if (!drink) throw new Error("Drink not found");

  const rawSlots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drinkId));
  const slots = await Promise.all(rawSlots.map(async (slot) => {
    if (!slot.predefinedSlotId) return slot;
    const [template] = await db.select().from(predefinedSlotsTable).where(eq(predefinedSlotsTable.id, slot.predefinedSlotId));
    if (!template) return slot;
    return {
      ...slot,
      slotLabel: slot.slotLabel || template.slotLabel,
      isRequired: slot.isRequired ?? template.isRequired,
      isDynamic: slot.isDynamic ?? template.isDynamic,
      affectsCupSize: slot.affectsCupSize ?? template.affectsCupSize,
    };
  }));

  const customizations: CustomizationData[] = [];
  let totalExtras = 0;
  let usedVolumeMl = 0;
  let dynamicInfo: { slotLabel: string; ingredientName: string; filledMl: number; cost: number } | null = null;

  // Process all non-dynamic slots
  for (const slot of slots) {
    if (slot.isDynamic) continue;

    // 1. Resolve effective selection (from provided selections or defaults)
    let sel = selections.find((s: any) => s.slotId === slot.id);
    if (!sel) {
      // Legacy fallback: check by ingredientTypeId or ingredientId
      if (slot.ingredientTypeId) {
        sel = selections.find((s: any) => s.ingredientTypeId === slot.ingredientTypeId);
      } else if (slot.ingredientId) {
        sel = selections.find((s: any) => s.ingredientId === slot.ingredientId);
      }
    }

    // 2. If no selection provided, resolve standard defaults
    if (!sel) {
      const drinkTypeOptions = await db.select().from(drinkSlotTypeOptionsTable)
        .where(eq(drinkSlotTypeOptionsTable.slotId, slot.id));
      
      let templateTypeOptions: any[] = [];
      if (slot.predefinedSlotId) {
        templateTypeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
          .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId));
      }
      
      const typeOptions = drinkTypeOptions.length > 0 ? drinkTypeOptions : templateTypeOptions;
      
      if (typeOptions.length > 0) {
        const defType = typeOptions.find(to => to.isDefault) ?? typeOptions[0];
        if (defType) {
          // Find default volume for this type
          const typeVolumes = await db.select().from(ingredientTypeVolumesTable)
            .where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, defType.ingredientTypeId), eq(ingredientTypeVolumesTable.isActive, true)));
          
          if (typeVolumes.length > 0) {
            const slotVolumes = await db.select().from(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id));
            const templateVolumes = slot.predefinedSlotId 
              ? await db.select().from(predefinedSlotVolumesTable).where(eq(predefinedSlotVolumesTable.predefinedSlotId, slot.predefinedSlotId))
              : [];
            
            const slotVolumeMap = new Map(slotVolumes.map((sv) => [sv.typeVolumeId, sv]));
            const templateVolumeMap = new Map(templateVolumes.map((tv) => [tv.typeVolumeId, tv]));

            const defVol = typeVolumes.find((tv) => {
              const sv = slotVolumeMap.get(tv.id);
              const tvDef = templateVolumeMap.get(tv.id);
              return sv ? sv.isDefault : (tvDef ? tvDef.isDefault : tv.isDefault);
            }) ?? typeVolumes[0];

            sel = {
              slotId: slot.id,
              ingredientTypeId: defType.ingredientTypeId,
              typeVolumeId: defVol?.id ?? null
            };
          } else {
            // Type-only default
            sel = {
              slotId: slot.id,
              ingredientTypeId: defType.ingredientTypeId
            };
          }
        }
      } else if (slot.ingredientId && slot.defaultOptionId) {
        // Legacy default
        sel = {
          slotId: slot.id,
          ingredientId: slot.ingredientId,
          optionId: slot.defaultOptionId
        };
      }
    }

    // 3. Perform calculation if we have a selection (provided or default)
    if (!sel) continue;

    // --- New-style slot: typed selection (typeVolumeId) ---
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
      
      // Type-level extra cost override
      const drinkTypeOptions = await db.select().from(drinkSlotTypeOptionsTable)
        .where(eq(drinkSlotTypeOptionsTable.slotId, slot.id));
      let templateTypeOptions: any[] = [];
      if (slot.predefinedSlotId) {
        templateTypeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
          .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId));
      }
      const typeOptions = drinkTypeOptions.length > 0 ? drinkTypeOptions : templateTypeOptions;
      const typeOpt = typeOptions.find(to => to.ingredientTypeId === typeVol.ingredientTypeId);
      
      const typeExtraCost = parseFloat(typeOpt?.extraCost ?? typeDef?.extraCost ?? "0") || 0;
      
      const inventoryId = typeDef?.inventoryIngredientId ?? null;
      const typeName = typeDef?.name ?? "";
      
      const [volDef] = typeVol.volumeId ? await db.select().from(ingredientVolumesTable).where(eq(ingredientVolumesTable.id, typeVol.volumeId)) : [null];
      const volumeName = volDef?.name ?? "";

      const [templateDef] = slot.predefinedSlotId 
        ? await db.select().from(predefinedSlotVolumesTable).where(and(eq(predefinedSlotVolumesTable.predefinedSlotId, slot.predefinedSlotId), eq(predefinedSlotVolumesTable.typeVolumeId, sel.typeVolumeId)))
        : [null];

      const volExtraCost = parseFloat(slotVol?.extraCost ?? templateDef?.extraCost ?? typeVol.extraCost) || 0;
      const extraCost = typeExtraCost + volExtraCost;
      totalExtras += extraCost;

      const consumedQty = parseFloat(slotVol?.processedQty ?? templateDef?.processedQty ?? typeVol.processedQty ?? volDef?.processedQty ?? "0") || 0;
      const producedQty = parseFloat(slotVol?.producedQty ?? templateDef?.producedQty ?? typeVol.producedQty ?? volDef?.producedQty ?? "0") || 0;
      
      const shouldCount = slot.affectsCupSize ?? typeDef?.affectsCupSize ?? true;
      if (shouldCount) {
        usedVolumeMl += producedQty;
      }

      const optionLabel = typeName && volumeName ? `${typeName} · ${volumeName}` : typeName || volumeName || "Catalog Item";

      customizations.push({
        ingredientId: inventoryId ? Number(inventoryId) : null,
        optionId: null,
        typeVolumeId: sel.typeVolumeId ? Number(sel.typeVolumeId) : null,
        ingredientTypeId: typeVol.ingredientTypeId ? Number(typeVol.ingredientTypeId) : null,
        consumedQty,
        producedQty,
        color: typeDef?.color ?? null,
        addedCost: extraCost,
        slotLabel: slot.slotLabel,
        optionLabel,
        baristaSortOrder: slot.baristaSortOrder ?? 1,
        customerSortOrder: slot.customerSortOrder ?? 1,
      });
      continue;
    }

    // --- Typed slot but NO volume (type-only e.g. sugar) ---
    if (sel.ingredientTypeId) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, sel.ingredientTypeId));
      if (ingType) {
        const [slotTypeOpt] = await db.select().from(drinkSlotTypeOptionsTable)
          .where(and(eq(drinkSlotTypeOptionsTable.slotId, slot.id), eq(drinkSlotTypeOptionsTable.ingredientTypeId, sel.ingredientTypeId)));
        
        const [templateTypeOpt] = slot.predefinedSlotId
          ? await db.select().from(predefinedSlotTypeOptionsTable)
              .where(and(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId), eq(predefinedSlotTypeOptionsTable.ingredientTypeId, sel.ingredientTypeId)))
          : [null];

        const consumedQty = parseFloat(slotTypeOpt?.processedQty ?? templateTypeOpt?.processedQty ?? ingType.processedQty ?? "0") || 0;
        const producedQty = parseFloat(slotTypeOpt?.producedQty ?? templateTypeOpt?.producedQty ?? ingType.producedQty ?? "0") || 0;
        const extraCost = parseFloat(slotTypeOpt?.extraCost ?? templateTypeOpt?.extraCost ?? ingType.extraCost ?? "0") || 0;
        
        totalExtras += extraCost;
        const shouldCount = slot.affectsCupSize ?? ingType.affectsCupSize ?? true;
        if (shouldCount) {
          usedVolumeMl += producedQty;
        }
        
        const unit = slotTypeOpt?.unit ?? templateTypeOpt?.unit ?? ingType.unit ?? "g";
        const optionLabel = (producedQty > 0 || consumedQty > 0) 
          ? `${ingType.name} (${producedQty > 0 ? producedQty : consumedQty}${unit})`
          : ingType.name;

        customizations.push({
          ingredientId: ingType.inventoryIngredientId ?? null,
          optionId: null,
          typeVolumeId: null,
          ingredientTypeId: Number(sel.ingredientTypeId),
          consumedQty,
          producedQty,
          color: ingType.color ?? null,
          addedCost: extraCost,
          slotLabel: slot.slotLabel,
          optionLabel,
          baristaSortOrder: slot.baristaSortOrder ?? 1,
          customerSortOrder: slot.customerSortOrder ?? 1,
        });
      }
      continue;
    }

    // --- Old-style legacy slot ---
    if (!sel.optionId) continue;
    const [option] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, sel.optionId));
    if (!option) continue;

    if (option.linkedIngredientId && sel.subOptionId) {
      const [subOption] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, sel.subOptionId));
      if (subOption) {
        const extraCost = parseFloat(subOption.extraCost) || 0;
        totalExtras += extraCost;
        const shouldCount = slot.affectsCupSize ?? true;
        if (shouldCount) {
          usedVolumeMl += parseFloat(subOption.producedQty) || 0;
        }
        customizations.push({
          ingredientId: option.linkedIngredientId,
          optionId: sel.subOptionId,
          typeVolumeId: null,
          ingredientTypeId: null,
          consumedQty: parseFloat(subOption.processedQty) || 0,
          producedQty: parseFloat(subOption.producedQty) || 0,
          color: null,
          addedCost: extraCost,
          slotLabel: slot.slotLabel,
          optionLabel: `${option.label} · ${subOption.label}`,
          baristaSortOrder: slot.baristaSortOrder ?? 1,
          customerSortOrder: slot.customerSortOrder ?? 1,
        });
      }
      continue;
    }

    const extraCost = parseFloat(option.extraCost) || 0;
    totalExtras += extraCost;
    const shouldCount = slot.affectsCupSize ?? true;
    if (shouldCount) {
      usedVolumeMl += parseFloat(option.producedQty) || 0;
    }
    customizations.push({
      ingredientId: sel.ingredientId ?? slot.ingredientId ?? null,
      optionId: sel.optionId,
      typeVolumeId: null,
      ingredientTypeId: null,
      consumedQty: parseFloat(option.processedQty) || 0,
      producedQty: parseFloat(option.producedQty) || 0,
      color: null,
      addedCost: extraCost,
      slotLabel: slot.slotLabel,
      optionLabel: option.label,
      baristaSortOrder: slot.baristaSortOrder ?? 1,
      customerSortOrder: slot.customerSortOrder ?? 1,
    });
  }

  // --- Dynamic slot calculate ---
  const dynamicSlot = slots.find((s) => s.isDynamic);
  if (dynamicSlot && drink.cupSizeMl) {
    const filledMl = Math.max(0, drink.cupSizeMl - usedVolumeMl);

    // Catalog Dynamic Slot
    const drinkTypeOptions = await db.select().from(drinkSlotTypeOptionsTable)
      .where(eq(drinkSlotTypeOptionsTable.slotId, dynamicSlot.id));
    
    let templateTypeOptions: any[] = [];
    if (dynamicSlot.predefinedSlotId) {
      templateTypeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
        .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, dynamicSlot.predefinedSlotId));
    }
    
    const typeOptions = drinkTypeOptions.length > 0 ? drinkTypeOptions : templateTypeOptions;

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
        let typeVolumeId = dynamicSelection?.typeVolumeId ? Number(dynamicSelection.typeVolumeId) : null;
        if (!typeVolumeId || isNaN(typeVolumeId)) {
          const typeVolumes = await db.select().from(ingredientTypeVolumesTable)
            .where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, effectiveTypeId), eq(ingredientTypeVolumesTable.isActive, true)));
          const defVol = typeVolumes.find(tv => tv.isDefault) ?? typeVolumes[0];
          typeVolumeId = defVol?.id ?? null;
        }

        const [slotVol] = await db.select().from(drinkSlotVolumesTable)
          .where(and(
            eq(drinkSlotVolumesTable.slotId, dynamicSlot.id),
            eq(drinkSlotVolumesTable.typeVolumeId, typeVolumeId)
          ));

        const [templateDef] = dynamicSlot.predefinedSlotId 
          ? await db.select().from(predefinedSlotVolumesTable).where(and(eq(predefinedSlotVolumesTable.predefinedSlotId, dynamicSlot.predefinedSlotId), eq(predefinedSlotVolumesTable.typeVolumeId, typeVolumeId)))
          : [null];

        let conversionRate = 1;
        let unit = "ml";
        if (typeVolumeId) {
          const [typeVolume] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, typeVolumeId));
          const [volDef] = typeVolume?.volumeId ? await db.select().from(ingredientVolumesTable).where(eq(ingredientVolumesTable.id, typeVolume.volumeId)) : [null];
          
          if (typeVolume) {
            const processedQty = parseFloat(slotVol?.processedQty ?? templateDef?.processedQty ?? typeVolume.processedQty ?? volDef?.processedQty ?? "0") || 0;
            const producedQty = parseFloat(slotVol?.producedQty ?? templateDef?.producedQty ?? typeVolume.producedQty ?? volDef?.producedQty ?? "0") || 0;
            conversionRate = producedQty > 0 ? processedQty / producedQty : 1;
            unit = slotVol?.unit ?? templateDef?.unit ?? typeVolume.unit ?? volDef?.unit ?? "ml";
          }
        }

        const consumedQty = filledMl * conversionRate;
        
        let cost = 0;
        let inventoryId = null;
        
        const slotTypeOpt = typeOptions.find(to => to.ingredientTypeId === effectiveTypeId);
        const pricePerMl = parseFloat(slotTypeOpt?.extraCost ?? ingredientType?.extraCost ?? "0") || 0;
        cost = filledMl * pricePerMl;

        if (ingredientType?.inventoryIngredientId) {
          inventoryId = ingredientType.inventoryIngredientId;
        }

        totalExtras += cost;
        const ingredientName = ingredientType?.name ?? "Dynamic";
        dynamicInfo = { slotLabel: dynamicSlot.slotLabel, ingredientName, filledMl, cost };
        
        customizations.push({
          ingredientId: inventoryId ? Number(inventoryId) : null,
          optionId: null,
          typeVolumeId: typeVolumeId ? Number(typeVolumeId) : null,
          ingredientTypeId: effectiveTypeId ? Number(effectiveTypeId) : null,
          consumedQty,
          producedQty: filledMl,
          color: ingredientType?.color ?? null,
          addedCost: cost,
          slotLabel: dynamicSlot.slotLabel,
          optionLabel: ingredientType?.name ? `${ingredientType.name} (${Math.round(filledMl)}${unit})` : `Dynamic (${Math.round(filledMl)}${unit})`,
          baristaSortOrder: dynamicSlot.baristaSortOrder ?? 1,
          customerSortOrder: dynamicSlot.customerSortOrder ?? 1,
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
          const processedQty = parseFloat(option.processedQty) || 0;
          const producedQty = parseFloat(option.producedQty) || 0;
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
          producedQty: filledMl,
          color: null,
          addedCost: cost,
          slotLabel: dynamicSlot.slotLabel,
          optionLabel: `Dynamic (${Math.round(filledMl)}ml)`,
          baristaSortOrder: dynamicSlot.baristaSortOrder ?? 1,
          customerSortOrder: dynamicSlot.customerSortOrder ?? 1,
        });
      }
    }
  }
  
  // --- Cup Deduction ---
  if (drink.cupIngredientId) {
    const [cupIng] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, drink.cupIngredientId));
    if (cupIng) {
       customizations.push({
         ingredientId: cupIng.id,
         optionId: null,
         typeVolumeId: null,
         ingredientTypeId: null,
         consumedQty: 1, // Always 1 cup
         producedQty: 0,
         color: null,
         addedCost: 0,
         slotLabel: "Packaging",
         optionLabel: cupIng.name,
         baristaSortOrder: 100, // Show at the bottom
         customerSortOrder: 100,
       });
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
