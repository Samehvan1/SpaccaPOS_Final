import { 
  db, 
  drinkIngredientSlotsTable, 
  drinkSlotTypeOptionsTable, 
  drinkSlotVolumesTable, 
  ingredientOptionsTable, 
  ingredientVolumesTable, 
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  orderItemCustomizationsTable
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

export interface CustomizationContext {
  slots: any[];
  options: any[];
  slotVolumes: any[];
  ingredientOptions: any[];
  volumes: any[];
  types: any[];
  typeVolumes: any[];
}

/**
 * Fetches all necessary recipe data for a set of drinks to perform customization analysis.
 */
export async function getRecipeContext(drinkIds: number[]): Promise<CustomizationContext> {
  if (drinkIds.length === 0) {
    return { slots: [], options: [], slotVolumes: [], ingredientOptions: [], volumes: [], types: [], typeVolumes: [] };
  }

  const [slots, options, slotVolumes, ingredientOptions, volumes, types, typeVolumes] = await Promise.all([
    db.select().from(drinkIngredientSlotsTable).where(inArray(drinkIngredientSlotsTable.drinkId, drinkIds)),
    db.select().from(drinkSlotTypeOptionsTable).where(inArray(drinkSlotTypeOptionsTable.slotId, db.select({ id: drinkIngredientSlotsTable.id }).from(drinkIngredientSlotsTable).where(inArray(drinkIngredientSlotsTable.drinkId, drinkIds)))),
    db.select().from(drinkSlotVolumesTable).where(inArray(drinkSlotVolumesTable.slotId, db.select({ id: drinkIngredientSlotsTable.id }).from(drinkIngredientSlotsTable).where(inArray(drinkIngredientSlotsTable.drinkId, drinkIds)))),
    db.select().from(ingredientOptionsTable),
    db.select().from(ingredientVolumesTable),
    db.select().from(ingredientTypesTable),
    db.select().from(ingredientTypeVolumesTable),
  ]);

  return { slots, options, slotVolumes, ingredientOptions, volumes, types, typeVolumes };
}

/**
 * Analyzes a raw customization and determines if it is a true override or a recipe default.
 * Returns null if it matches the default, otherwise returns the enriched customization with a defaultLabel.
 */
export function analyzeCustomization(cust: any, context: CustomizationContext) {
  const { slots, options, slotVolumes, ingredientOptions, volumes, types, typeVolumes } = context;

  const currentLabel = cust.optionLabel || cust.ingredientName || "None";
  const drinkSlots = slots.filter(s => s.drinkId === cust.drinkId);
  const matchingSlot = drinkSlots.find(s => s.slotLabel === cust.slotLabel);
  
  // 1. Global Exclusions (Cup/Packaging)
  const slotL = (cust.slotLabel || "").toLowerCase();
  const optL = currentLabel.toLowerCase();
  if (
    slotL.includes("cup") || 
    slotL.includes("pack") || 
    optL.includes("cup") || 
    optL.includes("pack")
  ) return null;

  if (!matchingSlot) {
    return { 
      ...cust, 
      defaultLabel: "None", 
      replacementLabel: `${cust.slotLabel}: ${currentLabel}` 
    };
  }

  // 2. Exclude Dynamic Slots
  if (matchingSlot.isDynamic) return null;

  // 3. Exclude non-customizable slots (only one choice available)
  const slotOptionsCount = options.filter(o => o.slotId === matchingSlot.id).length;
  const slotVolumesCount = slotVolumes.filter(v => v.slotId === matchingSlot.id && v.isEnabled).length;
  
  if (slotOptionsCount <= 1 && slotVolumesCount <= 1 && matchingSlot.ingredientId) return null;
  if ((slotOptionsCount === 1 && slotVolumesCount === 0) || (slotOptionsCount === 0 && slotVolumesCount === 1)) return null;

  // 4. Identify the "Standard" (Default) Component
  let recipeDefault = "None";
  if (matchingSlot.defaultOptionId) {
    const defOpt = ingredientOptions.find(o => o.id === matchingSlot.defaultOptionId);
    if (defOpt) recipeDefault = defOpt.label;
  } else {
    // Check typed defaults
    const defVol = slotVolumes.find(v => v.slotId === matchingSlot.id && v.isDefault);
    if (defVol) {
      const tv = typeVolumes.find(t => t.id === defVol.typeVolumeId);
      if (tv) {
        const v = volumes.find(vol => vol.id === tv.volumeId);
        const t = types.find(typ => typ.id === tv.ingredientTypeId);
        recipeDefault = `${t?.name || ""} . ${v?.name || ""}`.trim();
        if (recipeDefault.endsWith(".")) recipeDefault = recipeDefault.slice(0, -2).trim();
        if (recipeDefault.startsWith(".")) recipeDefault = recipeDefault.slice(1).trim();
      }
    } else {
      const defType = options.find(o => o.slotId === matchingSlot.id && o.isDefault);
      if (defType) {
        const t = types.find(typ => typ.id === defType.ingredientTypeId);
        recipeDefault = t?.name || "None";
      }
    }
  }

  // 5. Filter out if selection matches default
  const normalize = (s: string) => (s || "")
    .toLowerCase()
    .replace(/\(.*\)/g, "")
    .replace(/[\s\-\·\.\,]/g, "");
  
  if (normalize(recipeDefault) === normalize(currentLabel)) return null;

  let isMatch = false;

  // Legacy Comparison
  if (matchingSlot.defaultOptionId !== null || cust.optionId !== null) {
    if (matchingSlot.defaultOptionId === cust.optionId) isMatch = true;
  } else if (matchingSlot.ingredientId !== null || cust.ingredientId !== null) {
    if (matchingSlot.ingredientId === cust.ingredientId) isMatch = true;
  } else {
    const defaultVol = slotVolumes.find(v => v.slotId === matchingSlot.id && v.isDefault);
    if (defaultVol) {
      if (defaultVol.typeVolumeId === cust.typeVolumeId) isMatch = true;
    } else if (!cust.typeVolumeId || normalize(currentLabel) === "none") {
      isMatch = true;
    }
  }

  if (isMatch) return null;

  return { 
    ...cust, 
    defaultLabel: `${matchingSlot.slotLabel}: ${recipeDefault}`,
    replacementLabel: `${matchingSlot.slotLabel}: ${currentLabel}`
  };
}
