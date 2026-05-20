import { eq, and, inArray } from "drizzle-orm";
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

export async function calculateDrinkData(drinkId: number, selections: any[], branchId: number | null = null) {
  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.id, drinkId));
  if (!drink) throw new Error("Drink not found");

  const rawSlots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drinkId));
  const predefinedSlotIds = rawSlots.map(s => s.predefinedSlotId).filter((id): id is number => id !== null);

  const predefinedSlots = predefinedSlotIds.length > 0
    ? await db.select().from(predefinedSlotsTable).where(inArray(predefinedSlotsTable.id, predefinedSlotIds))
    : [];

  const predefinedSlotsMap = new Map(predefinedSlots.map(ps => [ps.id, ps]));

  const slots = rawSlots.map((slot) => {
    if (!slot.predefinedSlotId) return slot;
    const template = predefinedSlotsMap.get(slot.predefinedSlotId);
    if (!template) return slot;
    return {
      ...slot,
      slotLabel: slot.slotLabel || template.slotLabel,
      isRequired: slot.isRequired ?? template.isRequired,
      isDynamic: slot.isDynamic ?? template.isDynamic,
      affectsCupSize: slot.affectsCupSize ?? template.affectsCupSize,
    };
  });

  const slotIds = slots.map(s => s.id);

  // Collect possible Option IDs and Type IDs upfront
  const possibleOptionIds = new Set<number>();
  const possibleTypeIds = new Set<number>();

  slots.forEach(s => {
    if (s.defaultOptionId) possibleOptionIds.add(s.defaultOptionId);
    if (s.ingredientTypeId) possibleTypeIds.add(s.ingredientTypeId);
  });

  selections.forEach((sel: any) => {
    if (sel.optionId) possibleOptionIds.add(sel.optionId);
    if (sel.subOptionId) possibleOptionIds.add(sel.subOptionId);
    if (sel.ingredientTypeId) possibleTypeIds.add(sel.ingredientTypeId);
  });

  const possibleOptionIdList = Array.from(possibleOptionIds);

  // Parallel fetch of all dependent configurations
  const [
    drinkTypeOptionsAll,
    templateTypeOptionsAll,
    drinkSlotVolumesAll,
    predefinedSlotVolumesAll,
    ingredientOptionsAll,
  ] = await Promise.all([
    slotIds.length > 0
      ? db.select().from(drinkSlotTypeOptionsTable).where(inArray(drinkSlotTypeOptionsTable.slotId, slotIds))
      : Promise.resolve([]),
    predefinedSlotIds.length > 0
      ? db.select().from(predefinedSlotTypeOptionsTable).where(inArray(predefinedSlotTypeOptionsTable.predefinedSlotId, predefinedSlotIds))
      : Promise.resolve([]),
    slotIds.length > 0
      ? db.select().from(drinkSlotVolumesTable).where(inArray(drinkSlotVolumesTable.slotId, slotIds))
      : Promise.resolve([]),
    predefinedSlotIds.length > 0
      ? db.select().from(predefinedSlotVolumesTable).where(inArray(predefinedSlotVolumesTable.predefinedSlotId, predefinedSlotIds))
      : Promise.resolve([]),
    possibleOptionIdList.length > 0
      ? db.select().from(ingredientOptionsTable).where(inArray(ingredientOptionsTable.id, possibleOptionIdList))
      : Promise.resolve([]),
  ]);

  // Extract more possible type IDs found in options
  drinkTypeOptionsAll.forEach(to => {
    if (to.ingredientTypeId) possibleTypeIds.add(to.ingredientTypeId);
  });
  templateTypeOptionsAll.forEach(to => {
    if (to.ingredientTypeId) possibleTypeIds.add(to.ingredientTypeId);
  });

  const possibleTypeIdList = Array.from(possibleTypeIds);

  // Secondary parallel fetch for types, volumes and ingredients
  const selectionTypeVolumeIds = selections.map((s: any) => s.typeVolumeId).filter((id): id is number => id !== null);

  const [
    ingredientTypesAll,
    typeVolumesAll,
    typeVolumesBySpecificId,
  ] = await Promise.all([
    possibleTypeIdList.length > 0
      ? db.select().from(ingredientTypesTable).where(inArray(ingredientTypesTable.id, possibleTypeIdList))
      : Promise.resolve([]),
    possibleTypeIdList.length > 0
      ? db.select().from(ingredientTypeVolumesTable).where(and(inArray(ingredientTypeVolumesTable.ingredientTypeId, possibleTypeIdList), eq(ingredientTypeVolumesTable.isActive, true)))
      : Promise.resolve([]),
    selectionTypeVolumeIds.length > 0
      ? db.select().from(ingredientTypeVolumesTable).where(inArray(ingredientTypeVolumesTable.id, selectionTypeVolumeIds))
      : Promise.resolve([]),
  ]);

  // Indexing maps
  const ingredientTypesMap = new Map(ingredientTypesAll.map(it => [it.id, it]));

  const typeVolumeMap = new Map<number, any>();
  typeVolumesAll.forEach(tv => typeVolumeMap.set(tv.id, tv));
  typeVolumesBySpecificId.forEach(tv => typeVolumeMap.set(tv.id, tv));

  // Gather volume IDs and ingredient IDs to fetch
  const volumeIds = Array.from(typeVolumeMap.values()).map(tv => tv.volumeId).filter((id): id is number => id !== null);
  const possibleIngredientIds = new Set<number>();
  if (drink.cupIngredientId) possibleIngredientIds.add(drink.cupIngredientId);
  slots.forEach(s => {
    if (s.isDynamic && s.ingredientId) possibleIngredientIds.add(s.ingredientId);
  });
  ingredientTypesAll.forEach(it => {
    if (it.inventoryIngredientId) possibleIngredientIds.add(it.inventoryIngredientId);
  });
  ingredientOptionsAll.forEach(opt => {
    if (opt.linkedIngredientId) possibleIngredientIds.add(opt.linkedIngredientId);
  });

  const ingredientIdsList = Array.from(possibleIngredientIds);

  const [baseVolumesAll, ingredientsAll] = await Promise.all([
    volumeIds.length > 0
      ? db.select().from(ingredientVolumesTable).where(inArray(ingredientVolumesTable.id, volumeIds))
      : Promise.resolve([]),
    ingredientIdsList.length > 0
      ? db.select().from(ingredientsTable).where(inArray(ingredientsTable.id, ingredientIdsList))
      : Promise.resolve([]),
  ]);

  const baseVolumesMap = new Map(baseVolumesAll.map(bv => [bv.id, bv]));
  const ingredientsMap = new Map(ingredientsAll.map(ing => [ing.id, ing]));
  const ingredientOptionsMap = new Map(ingredientOptionsAll.map(opt => [opt.id, opt]));

  // Build lookups for specific slot configurations
  const drinkTypeOptionsMap = new Map<number, typeof drinkTypeOptionsAll>();
  drinkTypeOptionsAll.forEach(to => {
    const list = drinkTypeOptionsMap.get(to.slotId) ?? [];
    list.push(to);
    drinkTypeOptionsMap.set(to.slotId, list);
  });

  const templateTypeOptionsMap = new Map<number, typeof templateTypeOptionsAll>();
  templateTypeOptionsAll.forEach(to => {
    const list = templateTypeOptionsMap.get(to.predefinedSlotId) ?? [];
    list.push(to);
    templateTypeOptionsMap.set(to.predefinedSlotId, list);
  });

  const drinkSlotVolumesMap = new Map<string, any>();
  drinkSlotVolumesAll.forEach(sv => {
    drinkSlotVolumesMap.set(`${sv.slotId}:${sv.typeVolumeId}`, sv);
  });

  const predefinedSlotVolumesMap = new Map<string, any>();
  predefinedSlotVolumesAll.forEach(sv => {
    predefinedSlotVolumesMap.set(`${sv.predefinedSlotId}:${sv.typeVolumeId}`, sv);
  });

  const customizations: CustomizationData[] = [];
  let totalExtras = 0;
  let usedVolumeMl = 0;
  let dynamicInfo: { 
    slotLabel: string; 
    ingredientName: string; 
    filledMl: number; 
    cost: number;
    ingredientId?: number | null;
    consumedQty?: number;
  } | null = null;

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
      const drinkTypeOptions = drinkTypeOptionsMap.get(slot.id) ?? [];
      
      let templateTypeOptions: any[] = [];
      if (slot.predefinedSlotId) {
        templateTypeOptions = templateTypeOptionsMap.get(slot.predefinedSlotId) ?? [];
      }
      
      const typeOptions = drinkTypeOptions.length > 0 ? drinkTypeOptions : templateTypeOptions;
      
      if (typeOptions.length > 0) {
        const defType = typeOptions.find(to => to.isDefault) ?? typeOptions[0];
        if (defType) {
          // Find default volume for this type
          const typeVolumes = typeVolumesAll.filter(tv => tv.ingredientTypeId === defType.ingredientTypeId);
          
          if (typeVolumes.length > 0) {
            const slotVolumes = drinkSlotVolumesAll.filter(sv => sv.slotId === slot.id);
            const templateVolumes = slot.predefinedSlotId 
              ? predefinedSlotVolumesAll.filter(tv => tv.predefinedSlotId === slot.predefinedSlotId)
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
      const typeVol = typeVolumeMap.get(sel.typeVolumeId);
      if (!typeVol) continue;

      const slotVol = drinkSlotVolumesMap.get(`${slot.id}:${sel.typeVolumeId}`);

      const typeDef = ingredientTypesMap.get(typeVol.ingredientTypeId);
      
      // Type-level extra cost override
      const drinkTypeOptions = drinkTypeOptionsMap.get(slot.id) ?? [];
      let templateTypeOptions: any[] = [];
      if (slot.predefinedSlotId) {
        templateTypeOptions = templateTypeOptionsMap.get(slot.predefinedSlotId) ?? [];
      }
      const typeOptions = drinkTypeOptions.length > 0 ? drinkTypeOptions : templateTypeOptions;
      const typeOpt = typeOptions.find(to => to.ingredientTypeId === typeVol.ingredientTypeId);
      
      const typeExtraCost = parseFloat(typeOpt?.extraCost ?? typeDef?.extraCost ?? "0") || 0;
      
      const inventoryId = typeDef?.inventoryIngredientId ?? null;
      const typeName = typeDef?.name ?? "";
      
      const volDef = typeVol.volumeId ? baseVolumesMap.get(typeVol.volumeId) : null;
      const volumeName = volDef?.name ?? "";

      const templateDef = slot.predefinedSlotId 
        ? predefinedSlotVolumesMap.get(`${slot.predefinedSlotId}:${sel.typeVolumeId}`)
        : null;

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
      const ingType = ingredientTypesMap.get(sel.ingredientTypeId);
      if (ingType) {
        const drinkTypeOptions = drinkTypeOptionsMap.get(slot.id) ?? [];
        const slotTypeOpt = drinkTypeOptions.find(to => to.ingredientTypeId === sel.ingredientTypeId);
        
        let templateTypeOpt = null;
        if (slot.predefinedSlotId) {
          const templateTypeOptions = templateTypeOptionsMap.get(slot.predefinedSlotId) ?? [];
          templateTypeOpt = templateTypeOptions.find(pto => pto.ingredientTypeId === sel.ingredientTypeId);
        }

        const consumedQty = parseFloat(slotTypeOpt?.processedQty ?? templateTypeOpt?.processedQty ?? ingType.processedQty ?? "0") || 0;
        const producedQty = parseFloat(slotTypeOpt?.producedQty ?? templateTypeOpt?.producedQty ?? ingType.producedQty ?? "0") || 0;
        
        const pricingMode = slotTypeOpt?.pricingMode ?? templateTypeOpt?.pricingMode ?? ingType.pricingMode ?? "volume";
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
    const option = ingredientOptionsMap.get(sel.optionId);
    if (!option) continue;

    if (option.linkedIngredientId && sel.subOptionId) {
      const subOption = ingredientOptionsMap.get(sel.subOptionId);
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
    const drinkTypeOptions = drinkTypeOptionsMap.get(dynamicSlot.id) ?? [];
    let templateTypeOptions: any[] = [];
    if (dynamicSlot.predefinedSlotId) {
      templateTypeOptions = templateTypeOptionsMap.get(dynamicSlot.predefinedSlotId) ?? [];
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
        const ingredientType = ingredientTypesMap.get(effectiveTypeId);

        // Try to fetch a type volume just to check for custom conversion rates, if none, default to 1:1
        let typeVolumeId = dynamicSelection?.typeVolumeId ? Number(dynamicSelection.typeVolumeId) : null;
        if (!typeVolumeId || isNaN(typeVolumeId)) {
          const typeVolumes = typeVolumesAll.filter(tv => tv.ingredientTypeId === effectiveTypeId);
          const defVol = typeVolumes.find(tv => tv.isDefault) ?? typeVolumes[0];
          typeVolumeId = defVol?.id ?? null;
        }

        const slotVol = drinkSlotVolumesMap.get(`${dynamicSlot.id}:${typeVolumeId}`);
        const templateDef = dynamicSlot.predefinedSlotId 
          ? predefinedSlotVolumesMap.get(`${dynamicSlot.predefinedSlotId}:${typeVolumeId}`)
          : null;

        let conversionRate = 1;
        let unit = "ml";
        if (typeVolumeId) {
          const typeVolume = typeVolumeMap.get(typeVolumeId);
          const volDef = typeVolume?.volumeId ? baseVolumesMap.get(typeVolume.volumeId) : null;
          
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
        const pricingMode = slotTypeOpt?.pricingMode ?? ingredientType?.pricingMode ?? "volume";
        const extraCostBase = parseFloat(slotTypeOpt?.extraCost ?? ingredientType?.extraCost ?? "0") || 0;
        
        if (pricingMode === "unit") {
          cost = extraCostBase;
        } else {
          cost = filledMl * extraCostBase;
        }

        if (ingredientType?.inventoryIngredientId) {
          inventoryId = ingredientType.inventoryIngredientId;
        }

        totalExtras += cost;
        const ingredientName = ingredientType?.name ?? "Dynamic";
        dynamicInfo = { 
          slotLabel: dynamicSlot.slotLabel, 
          ingredientName, 
          filledMl, 
          cost, 
          ingredientId: inventoryId ? Number(inventoryId) : null, 
          consumedQty 
        };
        
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

        const option = ingredientOptionsMap.get(optionId);
        
        if (option) {
          const processedQty = parseFloat(option.processedQty) || 0;
          const producedQty = parseFloat(option.producedQty) || 0;
          const conversionRate = producedQty > 0 ? processedQty / producedQty : 1;
          consumedQty = filledMl * conversionRate;
          
          const ingredient = ingredientsMap.get(dynamicSlot.ingredientId);
          if (ingredient) {
            cost = consumedQty * parseFloat(ingredient.costPerUnit);
            ingredientName = ingredient.name;
            optionLabel = `${ingredientName} (${Math.round(filledMl)}ml)`;
          }
        }

        totalExtras += cost;
        dynamicInfo = { 
          slotLabel: dynamicSlot.slotLabel, 
          ingredientName, 
          filledMl, 
          cost, 
          ingredientId: dynamicSlot.ingredientId, 
          consumedQty 
        };

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
    const cupIng = ingredientsMap.get(drink.cupIngredientId);
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
