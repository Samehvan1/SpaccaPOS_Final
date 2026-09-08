import { db, ingredientNutritionTable, ingredientsTable, customerNutritionLogsTable, customerNutritionGoalsTable, customersTable } from "@workspace/db";
import { eq, inArray, sql } from "drizzle-orm";

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
 * Calculates total nutrition facts for a single drink item based on its customizations/ingredients.
 */
export async function calculateCustomizationNutrition(
  customizations: Array<{ ingredientId: number | null; consumedQty: number }>
): Promise<NutritionFacts> {
  const validReqs = customizations.filter(c => c.ingredientId && c.consumedQty > 0) as Array<{ ingredientId: number; consumedQty: number }>;

  const result: NutritionFacts = {
    calories: 0,
    protein: 0,
    totalCarbs: 0,
    dietaryFiber: 0,
    totalSugars: 0,
    addedSugars: 0,
    totalFat: 0,
    saturatedFat: 0,
    transFat: 0,
    cholesterol: 0,
    sodium: 0,
    caffeine: 0,
    allergens: [],
    ingredientBreakdown: [],
  };

  if (validReqs.length === 0) return result;

  const ingredientIds = [...new Set(validReqs.map(r => r.ingredientId))];

  // Fetch nutrition entries joined with ingredients
  const rows = await db
    .select({
      ingredientId: ingredientsTable.id,
      name: ingredientsTable.name,
      unit: ingredientsTable.unit,
      servingSizeQty: ingredientNutritionTable.servingSizeQty,
      servingSizeUnit: ingredientNutritionTable.servingSizeUnit,
      calories: ingredientNutritionTable.calories,
      protein: ingredientNutritionTable.protein,
      totalCarbs: ingredientNutritionTable.totalCarbs,
      dietaryFiber: ingredientNutritionTable.dietaryFiber,
      totalSugars: ingredientNutritionTable.totalSugars,
      addedSugars: ingredientNutritionTable.addedSugars,
      totalFat: ingredientNutritionTable.totalFat,
      saturatedFat: ingredientNutritionTable.saturatedFat,
      transFat: ingredientNutritionTable.transFat,
      cholesterol: ingredientNutritionTable.cholesterol,
      sodium: ingredientNutritionTable.sodium,
      caffeine: ingredientNutritionTable.caffeine,
      allergens: ingredientNutritionTable.allergens,
    })
    .from(ingredientsTable)
    .leftJoin(ingredientNutritionTable, eq(ingredientNutritionTable.ingredientId, ingredientsTable.id))
    .where(inArray(ingredientsTable.id, ingredientIds));

  const nutritionMap = new Map(rows.map(r => [r.ingredientId, r]));
  const allergenSet = new Set<string>();

  for (const req of validReqs) {
    const info = nutritionMap.get(req.ingredientId);
    if (!info) continue;

    const servingQty = info.servingSizeQty ? parseFloat(info.servingSizeQty) : 1;
    const factor = servingQty > 0 ? req.consumedQty / servingQty : 0;

    const cal = (info.calories ? parseFloat(info.calories) : 0) * factor;
    const prot = (info.protein ? parseFloat(info.protein) : 0) * factor;
    const carbs = (info.totalCarbs ? parseFloat(info.totalCarbs) : 0) * factor;
    const fiber = (info.dietaryFiber ? parseFloat(info.dietaryFiber) : 0) * factor;
    const sug = (info.totalSugars ? parseFloat(info.totalSugars) : 0) * factor;
    const addSug = (info.addedSugars ? parseFloat(info.addedSugars) : 0) * factor;
    const fat = (info.totalFat ? parseFloat(info.totalFat) : 0) * factor;
    const satFat = (info.saturatedFat ? parseFloat(info.saturatedFat) : 0) * factor;
    const trFat = (info.transFat ? parseFloat(info.transFat) : 0) * factor;
    const chol = (info.cholesterol ? parseFloat(info.cholesterol) : 0) * factor;
    const sod = (info.sodium ? parseFloat(info.sodium) : 0) * factor;
    const caff = (info.caffeine ? parseFloat(info.caffeine) : 0) * factor;

    result.calories += cal;
    result.protein += prot;
    result.totalCarbs += carbs;
    result.dietaryFiber += fiber;
    result.totalSugars += sug;
    result.addedSugars += addSug;
    result.totalFat += fat;
    result.saturatedFat += satFat;
    result.transFat += trFat;
    result.cholesterol += chol;
    result.sodium += sod;
    result.caffeine += caff;

    if (info.allergens && Array.isArray(info.allergens)) {
      info.allergens.forEach(a => allergenSet.add(a));
    }

    result.ingredientBreakdown!.push({
      ingredientId: req.ingredientId,
      ingredientName: info.name,
      consumedQty: req.consumedQty,
      unit: info.unit,
      calories: Math.round(cal * 10) / 10,
      caffeine: Math.round(caff * 10) / 10,
      totalSugars: Math.round(sug * 10) / 10,
      protein: Math.round(prot * 10) / 10,
      totalFat: Math.round(fat * 10) / 10,
      totalCarbs: Math.round(carbs * 10) / 10,
    });
  }

  result.allergens = Array.from(allergenSet);

  // Round values nicely
  result.calories = Math.round(result.calories);
  result.protein = Math.round(result.protein * 10) / 10;
  result.totalCarbs = Math.round(result.totalCarbs * 10) / 10;
  result.dietaryFiber = Math.round(result.dietaryFiber * 10) / 10;
  result.totalSugars = Math.round(result.totalSugars * 10) / 10;
  result.addedSugars = Math.round(result.addedSugars * 10) / 10;
  result.totalFat = Math.round(result.totalFat * 10) / 10;
  result.saturatedFat = Math.round(result.saturatedFat * 10) / 10;
  result.transFat = Math.round(result.transFat * 10) / 10;
  result.cholesterol = Math.round(result.cholesterol * 10) / 10;
  result.sodium = Math.round(result.sodium * 10) / 10;
  result.caffeine = Math.round(result.caffeine * 10) / 10;

  return result;
}

/**
 * Logs customer intake when an order is completed or created.
 */
export async function logCustomerNutrition(
  customerId: number,
  orderId: number | null,
  items: Array<{
    orderItemId?: number;
    drinkId?: number;
    drinkName: string;
    quantity: number;
    nutritionSummary: NutritionFacts;
  }>
) {
  if (!customerId || !items || items.length === 0) return;

  try {
    // Ensure customer nutrition goals record exists
    const [existingGoal] = await db
      .select({ customerId: customerNutritionGoalsTable.customerId })
      .from(customerNutritionGoalsTable)
      .where(eq(customerNutritionGoalsTable.customerId, customerId))
      .limit(1);

    if (!existingGoal) {
      await db.insert(customerNutritionGoalsTable).values({
        customerId,
        dailyCalorieGoal: 2000,
        dailyCaffeineLimit: 400,
        dailySugarLimit: 50,
        dailyProteinGoal: 50,
        dietaryPreferences: [],
      }).onConflictDoNothing();
    }

    for (const item of items) {
      const qty = item.quantity || 1;
      const n = item.nutritionSummary;

      await db.insert(customerNutritionLogsTable).values({
        customerId,
        orderId: orderId || null,
        orderItemId: item.orderItemId || null,
        drinkId: item.drinkId || null,
        drinkName: item.drinkName,
        quantity: qty,
        consumedAt: new Date(),
        calories: (n.calories * qty).toFixed(2),
        protein: (n.protein * qty).toFixed(2),
        totalCarbs: (n.totalCarbs * qty).toFixed(2),
        dietaryFiber: (n.dietaryFiber * qty).toFixed(2),
        totalSugars: (n.totalSugars * qty).toFixed(2),
        addedSugars: (n.addedSugars * qty).toFixed(2),
        totalFat: (n.totalFat * qty).toFixed(2),
        saturatedFat: (n.saturatedFat * qty).toFixed(2),
        transFat: (n.transFat * qty).toFixed(2),
        cholesterol: (n.cholesterol * qty).toFixed(2),
        sodium: (n.sodium * qty).toFixed(2),
        caffeine: (n.caffeine * qty).toFixed(2),
        allergens: n.allergens || [],
        nutritionDetails: {
          singleItemFacts: n,
          totalLineFacts: {
            calories: n.calories * qty,
            protein: n.protein * qty,
            totalCarbs: n.totalCarbs * qty,
            totalSugars: n.totalSugars * qty,
            totalFat: n.totalFat * qty,
            caffeine: n.caffeine * qty,
          },
        },
      });
    }

    console.log(`[NutritionLog] Successfully logged ${items.length} item(s) for customer #${customerId}`);
  } catch (err) {
    console.error("[NutritionLog] Error logging customer nutrition:", err);
  }
}
