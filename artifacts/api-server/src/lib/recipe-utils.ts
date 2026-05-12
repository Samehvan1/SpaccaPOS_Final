import { 
  db, 
  drinkIngredientSlotsTable, 
  drinkSlotTypeOptionsTable, 
  drinkSlotVolumesTable, 
  ingredientOptionsTable, 
  ingredientVolumesTable, 
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  orderItemCustomizationsTable,
  predefinedSlotsTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable
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
  // Template data
  predefinedSlots: any[];
  templateOptions: any[];
  templateVolumes: any[];
}

/**
 * Fetches all necessary recipe data for a set of drinks to perform customization analysis.
 * Now includes support for predefined (template) slots.
 */
export async function getRecipeContext(drinkIds: number[]): Promise<CustomizationContext> {
  if (drinkIds.length === 0) {
    return { slots: [], options: [], slotVolumes: [], ingredientOptions: [], volumes: [], types: [], typeVolumes: [], predefinedSlots: [], templateOptions: [], templateVolumes: [] };
  }

  // Fetch direct slots
  const slots = await db.select().from(drinkIngredientSlotsTable).where(inArray(drinkIngredientSlotsTable.drinkId, drinkIds));
  const slotIds = slots.map(s => s.id);
  const templateIds = [...new Set(slots.map(s => s.predefinedSlotId).filter(id => id !== null))] as number[];

  const [options, slotVolumes, ingredientOptions, volumes, types, typeVolumes, predefinedSlots, templateOptions, templateVolumes] = await Promise.all([
    slotIds.length > 0 ? db.select().from(drinkSlotTypeOptionsTable).where(inArray(drinkSlotTypeOptionsTable.slotId, slotIds)) : Promise.resolve([]),
    slotIds.length > 0 ? db.select().from(drinkSlotVolumesTable).where(inArray(drinkSlotVolumesTable.slotId, slotIds)) : Promise.resolve([]),
    db.select().from(ingredientOptionsTable),
    db.select().from(ingredientVolumesTable),
    db.select().from(ingredientTypesTable),
    db.select().from(ingredientTypeVolumesTable),
    // Template data
    templateIds.length > 0 ? db.select().from(predefinedSlotsTable).where(inArray(predefinedSlotsTable.id, templateIds)) : Promise.resolve([]),
    templateIds.length > 0 ? db.select().from(predefinedSlotTypeOptionsTable).where(inArray(predefinedSlotTypeOptionsTable.predefinedSlotId, templateIds)) : Promise.resolve([]),
    templateIds.length > 0 ? db.select().from(predefinedSlotVolumesTable).where(inArray(predefinedSlotVolumesTable.predefinedSlotId, templateIds)) : Promise.resolve([]),
  ]);

  return { slots, options, slotVolumes, ingredientOptions, volumes, types, typeVolumes, predefinedSlots, templateOptions, templateVolumes };
}

/**
 * Analyzes a raw customization and determines if it is a true override or a recipe default.
 * Returns null if it matches the default, otherwise returns the enriched customization with a defaultLabel.
 */
export function analyzeCustomization(cust: any, context: CustomizationContext) {
  const { 
    slots, options, slotVolumes, ingredientOptions, volumes, types, typeVolumes,
    predefinedSlots, templateOptions, templateVolumes 
  } = context;

  const currentLabel = cust.optionLabel || cust.ingredientName || "None";
  const drinkSlots = slots.filter(s => s.drinkId === cust.drinkId);
  const matchingSlot = drinkSlots.find(s => s.slotLabel === cust.slotLabel);
  
  if (!matchingSlot) return null;

  // Resolve template inheritance
  let effectiveIsDynamic = matchingSlot.isDynamic;
  const template = matchingSlot.predefinedSlotId ? predefinedSlots.find(ps => ps.id === matchingSlot.predefinedSlotId) : null;
  if (template) {
    if (effectiveIsDynamic === null || effectiveIsDynamic === undefined) effectiveIsDynamic = template.isDynamic;
  }

  // Resolve effective options and volumes (overrides vs template)
  let effectiveOptions = options.filter(o => o.slotId === matchingSlot.id);
  if (effectiveOptions.length === 0 && template) {
    effectiveOptions = templateOptions.filter(to => to.predefinedSlotId === template.id);
  }

  let effectiveSlotVolumes = slotVolumes.filter(v => v.slotId === matchingSlot.id);
  if (effectiveSlotVolumes.length === 0 && template) {
    effectiveSlotVolumes = templateVolumes.filter(tv => tv.predefinedSlotId === template.id);
  }

  // Global Exclusions (Cup/Packaging)
  const slotL = (cust.slotLabel || "").toLowerCase();
  const optL = currentLabel.toLowerCase();
  if (slotL.includes("cup") || slotL.includes("pack") || optL.includes("cup") || optL.includes("pack")) return null;

  // Exclude non-customizable slots (only one choice available)
  const slotOptionsCount = effectiveOptions.length;
  const slotVolumesCount = effectiveSlotVolumes.filter(v => v.isEnabled !== false).length;
  if (slotOptionsCount <= 1 && slotVolumesCount <= 1 && matchingSlot.ingredientId) return null;
  if ((slotOptionsCount === 1 && slotVolumesCount === 0) || (slotOptionsCount === 0 && slotVolumesCount === 1)) return null;

  // Build the default label for this slot
  let recipeDefault = "None";
  let typeName = "";
  let defType = effectiveOptions.find(o => o.isDefault);
  if (!defType && effectiveOptions.length > 0) defType = effectiveOptions[0]; // Fallback to first

  let defVolInfo: any = null;

  const style = matchingSlot.ingredientTypeId || matchingSlot.predefinedSlotId ? "typed" : "legacy";

  if (style === "typed" && defType) {
    const t = types.find(typ => typ.id === defType.ingredientTypeId);
    typeName = (defType as any).typeName || t?.name || "";

    // For volumes, we must merge: ingredient_type_volumes + (drink_slot_volumes OR predefined_slot_volumes)
    const baseVolumes = typeVolumes.filter(tv => tv.ingredientTypeId === defType!.ingredientTypeId && tv.isActive);
    
    // Check for direct drink overrides
    const directOverrides = slotVolumes.filter(v => v.slotId === matchingSlot.id);
    // Check for template overrides
    const templateOverrides = template ? templateVolumes.filter(tv => tv.predefinedSlotId === template.id) : [];

    // Merge logic: For each base volume, check drink-level override, then template-level override
    const resolvedVolumes = baseVolumes.map(bv => {
      const drinkOverride = directOverrides.find(ov => ov.typeVolumeId === bv.id);
      const tempOverride = templateOverrides.find(ov => ov.typeVolumeId === bv.id);
      
      return {
        id: bv.id,
        volumeId: bv.volumeId,
        isDefault: drinkOverride?.isDefault ?? tempOverride?.isDefault ?? bv.isDefault,
        isEnabled: drinkOverride?.isEnabled ?? tempOverride?.isEnabled ?? true
      };
    }).filter(v => v.isEnabled);

    defVolInfo = resolvedVolumes.find(v => v.isDefault);
    if (!defVolInfo && resolvedVolumes.length > 0) defVolInfo = resolvedVolumes[0];

    if (defVolInfo) {
      const v = volumes.find(vol => vol.id === defVolInfo!.volumeId);
      recipeDefault = `${typeName} · ${v?.name || ""}`;
    } else {
      recipeDefault = typeName;
    }
  } else if (style === "legacy") {
    let defOpt = ingredientOptions.find(o => o.id === matchingSlot.defaultOptionId);
    if (!defOpt && matchingSlot.ingredientId) {
       const ingredientOpts = ingredientOptions.filter(o => o.ingredientId === matchingSlot.ingredientId);
       if (ingredientOpts.length > 0) defOpt = ingredientOpts[0];
    }
    if (defOpt) recipeDefault = defOpt.label;
  }

  // Normalization logic
  const normalize = (s: string) => (s || "")
    .toLowerCase()
    .replace(/\(.*\)/g, "") 
    .replace(/\d+(ml|g|oz|cl|pcs)/g, "") 
    .replace(/[\s\-\·\.\,\|]/g, "") 
    .replace(/standard|default|none/g, "")
    .trim();

  const normRecipe = normalize(recipeDefault);
  const normCurrent = normalize(currentLabel);

  let isMatch = false;

  // ID based matches
  if (matchingSlot.defaultOptionId !== null && cust.optionId !== null) {
    if (matchingSlot.defaultOptionId === cust.optionId) isMatch = true;
  } else if (matchingSlot.ingredientId !== null && cust.ingredientId !== null) {
    if (matchingSlot.ingredientId === cust.ingredientId) isMatch = true;
  } else {
    // Check if current selection matches the resolved default volume
    if (defVolInfo && defVolInfo.id === cust.typeVolumeId) isMatch = true;
  }

  // Normalization match
  if (!isMatch && normRecipe === normCurrent) isMatch = true;

  // Dynamic slot handling
  if (effectiveIsDynamic) {
    if (isMatch) return null;
    if (typeName && currentLabel.toLowerCase().startsWith(typeName.toLowerCase())) return null;
  }

  if (isMatch) return null;

  return { 
    ...cust, 
    defaultLabel: `${matchingSlot.slotLabel}: ${recipeDefault}`,
    replacementLabel: `${matchingSlot.slotLabel}: ${currentLabel}`
  };
}
