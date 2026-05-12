/**
 * Shared utility for detecting customizations in drink items.
 * Used across various administrative reports to ensure consistent results.
 */

export interface CustomizationContext {
  slots: any[];
}

/**
 * Robust normalization for comparing recipe labels.
 * Removes parentheses content, volume suffixes (e.g. 40ml), standard separators, and casing.
 */
export const normalizeRecipeLabel = (s: string) => {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\(.*\)/g, "") // Remove everything in parentheses
    .replace(/\d+(ml|g|oz|cl|pcs)/g, "") // Remove volume suffixes
    .replace(/[\s\-\·\.\,\|]/g, "") // Remove separators and spaces
    .replace(/standard|default|none/g, "") // Remove filler terms
    .trim();
};

/**
 * Logic to determine if a specific customization is actually an override of the default.
 */
export function isActuallyCustomized(
  cust: { slotLabel: string; optionLabel: string },
  itemDefaults: Record<string, { label: string; isDynamic: boolean; typeName: string }>
): boolean {
  const def = itemDefaults[cust.slotLabel];
  if (!def) return false;

  const normCurrent = normalizeRecipeLabel(cust.optionLabel);
  const normDefault = normalizeRecipeLabel(def.label);

  if (def.isDynamic) {
    // For dynamic slots, check if it matches the generated default label
    if (normCurrent === normDefault) return false;
    // Fallback: Check if it at least starts with the correct type name
    return !cust.optionLabel.toLowerCase().startsWith(def.typeName.toLowerCase());
  }
  
  return normCurrent !== normDefault;
}

/**
 * Builds a map of default labels for each slot in a drink recipe.
 */
export const buildDrinkDefaultsMap = (slots: any[]) => {
  const map: Record<string, { label: string; isDynamic: boolean; typeName: string }> = {};
  if (!slots) return map;

  slots.forEach(slot => {
    let label = "";
    let typeName = "";
    
    if (slot.slotStyle === "typed") {
      let defType = slot.typeOptions?.find((to: any) => to.isDefault);
      if (!defType && slot.typeOptions?.length > 0) defType = slot.typeOptions[0]; // Fallback to first

      let defVol = defType?.volumes?.find((v: any) => v.isDefault);
      if (!defVol && defType?.volumes?.length > 0) defVol = defType.volumes[0]; // Fallback to first
      
      typeName = defType?.typeName ?? "";
      
      if (defType && defVol) {
        label = `${defType.typeName} · ${defVol.volumeName}`;
      } else if (defType) {
        label = defType.typeName;
      }
    } else if (slot.slotStyle === "legacy") {
      let defOpt = slot.ingredient?.options?.find((o: any) => o.isDefault);
      if (!defOpt && slot.ingredient?.options?.length > 0) defOpt = slot.ingredient.options[0]; // Fallback
      if (defOpt) {
        label = defOpt.label;
      }
    }
    
    map[slot.slotLabel] = { label, isDynamic: !!slot.isDynamic, typeName };
  });
  
  return map;
};
