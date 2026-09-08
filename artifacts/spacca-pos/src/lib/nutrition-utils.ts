export type NutritionFacts = {
  calories: number;
  protein: number;
  totalCarbs: number;
  dietaryFiber: number;
  totalSugars: number;
  addedSugars: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  caffeine: number;
  allergens: string[];
  ingredientBreakdown?: Array<{
    ingredientId: number;
    ingredientName: string;
    consumedQty: number;
    unit: string;
    calories: number;
    caffeine: number;
    totalSugars: number;
    protein: number;
    totalFat: number;
    totalCarbs: number;
  }>;
};

/**
 * Client-side API fetcher for dynamic drink nutrition facts.
 * Usable across POS, Mobile Web App, Kiosk, Admin, Customer Dashboard, etc.
 */
export async function calculateDrinkNutrition(
  drinkId: number,
  selections: any[] = [],
  branchId: number | null = null
): Promise<NutritionFacts | null> {
  if (!drinkId) return null;
  try {
    const res = await fetch("/api/nutrition/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drinkId, selections, branchId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.nutritionFacts || null;
  } catch (err) {
    console.error("[nutrition-utils] Error calculating drink nutrition:", err);
    return null;
  }
}

/**
 * Format calorie and nutrient values for display with proper rounding.
 */
export function formatNutrient(value: number | string | null | undefined, unit: string = ""): string {
  const num = typeof value === "number" ? value : parseFloat(value || "0");
  if (isNaN(num)) return `0 ${unit}`.trim();
  const rounded = Math.round(num * 10) / 10;
  return unit ? `${rounded} ${unit}` : `${rounded}`;
}

/**
 * Check whether a customer's daily intake is approaching or exceeding health thresholds.
 */
export function checkIntakeWarning(
  currentVal: number,
  limitVal: number
): { status: "safe" | "warning" | "exceeded"; percent: number } {
  if (!limitVal || limitVal <= 0) return { status: "safe", percent: 0 };
  const pct = Math.round((currentVal / limitVal) * 100);
  if (pct >= 100) return { status: "exceeded", percent: pct };
  if (pct >= 85) return { status: "warning", percent: pct };
  return { status: "safe", percent: pct };
}
