import { Router, type IRouter } from "express";
import { db, ingredientNutritionTable, ingredientsTable, customerNutritionGoalsTable, customerNutritionLogsTable, customersTable } from "@workspace/db";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";
import { calculateDrinkData } from "../lib/price-calculator";
import { calculateCustomizationNutrition } from "../lib/nutrition-calculator";

const router: IRouter = Router();

// Ensure nutrition tables exist on runtime startup
async function ensureNutritionTables() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ingredient_nutrition (
        ingredient_id     INTEGER PRIMARY KEY REFERENCES ingredients(id) ON DELETE CASCADE,
        serving_size_qty  NUMERIC(10,4) NOT NULL DEFAULT 1,
        serving_size_unit TEXT NOT NULL DEFAULT 'unit',
        calories          NUMERIC(10,2) NOT NULL DEFAULT 0,
        protein           NUMERIC(10,2) NOT NULL DEFAULT 0,
        total_carbs       NUMERIC(10,2) NOT NULL DEFAULT 0,
        dietary_fiber     NUMERIC(10,2) NOT NULL DEFAULT 0,
        total_sugars      NUMERIC(10,2) NOT NULL DEFAULT 0,
        added_sugars      NUMERIC(10,2) NOT NULL DEFAULT 0,
        total_fat         NUMERIC(10,2) NOT NULL DEFAULT 0,
        saturated_fat     NUMERIC(10,2) NOT NULL DEFAULT 0,
        trans_fat         NUMERIC(10,2) NOT NULL DEFAULT 0,
        cholesterol       NUMERIC(10,2) NOT NULL DEFAULT 0,
        sodium            NUMERIC(10,2) NOT NULL DEFAULT 0,
        caffeine          NUMERIC(10,2) NOT NULL DEFAULT 0,
        allergens         JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customer_nutrition_goals (
        customer_id           INTEGER PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
        daily_calorie_goal    INTEGER NOT NULL DEFAULT 2000,
        daily_caffeine_limit  INTEGER NOT NULL DEFAULT 400,
        daily_sugar_limit     INTEGER NOT NULL DEFAULT 50,
        daily_protein_goal    INTEGER NOT NULL DEFAULT 50,
        daily_carb_limit      INTEGER,
        daily_fat_limit       INTEGER,
        dietary_preferences   JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customer_nutrition_logs (
        id                SERIAL PRIMARY KEY,
        customer_id       INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        order_id          INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        order_item_id     INTEGER REFERENCES order_items(id) ON DELETE SET NULL,
        drink_id          INTEGER REFERENCES drinks(id) ON DELETE SET NULL,
        drink_name        TEXT NOT NULL,
        quantity          INTEGER NOT NULL DEFAULT 1,
        consumed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        calories          NUMERIC(10,2) NOT NULL DEFAULT 0,
        protein           NUMERIC(10,2) NOT NULL DEFAULT 0,
        total_carbs       NUMERIC(10,2) NOT NULL DEFAULT 0,
        dietary_fiber     NUMERIC(10,2) NOT NULL DEFAULT 0,
        total_sugars      NUMERIC(10,2) NOT NULL DEFAULT 0,
        added_sugars      NUMERIC(10,2) NOT NULL DEFAULT 0,
        total_fat         NUMERIC(10,2) NOT NULL DEFAULT 0,
        saturated_fat     NUMERIC(10,2) NOT NULL DEFAULT 0,
        trans_fat         NUMERIC(10,2) NOT NULL DEFAULT 0,
        cholesterol       NUMERIC(10,2) NOT NULL DEFAULT 0,
        sodium            NUMERIC(10,2) NOT NULL DEFAULT 0,
        caffeine          NUMERIC(10,2) NOT NULL DEFAULT 0,
        allergens         JSONB NOT NULL DEFAULT '[]'::jsonb,
        nutrition_details JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS nutrition_summary JSONB;
    `);
    console.log("[nutrition] Tables schema ready");
  } catch (e) {
    console.error("[nutrition] Table init error:", e);
  }
}
ensureNutritionTables();

// ── GET /api/ingredients/:id/nutrition ──────────────────────────────────────
router.get("/ingredients/:id/nutrition", async (req, res): Promise<void> => {
  const ingredientId = parseInt(req.params.id, 10);
  if (isNaN(ingredientId)) {
    res.status(400).json({ error: "Invalid ingredient ID" });
    return;
  }

  const [row] = await db
    .select()
    .from(ingredientNutritionTable)
    .where(eq(ingredientNutritionTable.ingredientId, ingredientId))
    .limit(1);

  if (!row) {
    // Return default empty facts for this ingredient
    const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingredientId)).limit(1);
    if (!ing) {
      res.status(404).json({ error: "Ingredient not found" });
      return;
    }
    res.json({
      ingredientId,
      servingSizeQty: "1",
      servingSizeUnit: ing.unit || "unit",
      calories: "0",
      protein: "0",
      totalCarbs: "0",
      dietaryFiber: "0",
      totalSugars: "0",
      addedSugars: "0",
      totalFat: "0",
      saturatedFat: "0",
      transFat: "0",
      cholesterol: "0",
      sodium: "0",
      caffeine: "0",
      allergens: [],
    });
    return;
  }

  res.json(row);
});

// ── PUT /api/ingredients/:id/nutrition ──────────────────────────────────────
router.put("/ingredients/:id/nutrition", async (req, res): Promise<void> => {
  const ingredientId = parseInt(req.params.id, 10);
  if (isNaN(ingredientId)) {
    res.status(400).json({ error: "Invalid ingredient ID" });
    return;
  }

  const {
    servingSizeQty = "1",
    servingSizeUnit = "unit",
    calories = "0",
    protein = "0",
    totalCarbs = "0",
    dietaryFiber = "0",
    totalSugars = "0",
    addedSugars = "0",
    totalFat = "0",
    saturatedFat = "0",
    transFat = "0",
    cholesterol = "0",
    sodium = "0",
    caffeine = "0",
    allergens = [],
  } = req.body ?? {};

  const cleanAllergens = Array.isArray(allergens) ? allergens.map((a: any) => String(a).toLowerCase().trim()) : [];

  const values = {
    ingredientId,
    servingSizeQty: String(servingSizeQty),
    servingSizeUnit: String(servingSizeUnit),
    calories: String(calories),
    protein: String(protein),
    totalCarbs: String(totalCarbs),
    dietaryFiber: String(dietaryFiber),
    totalSugars: String(totalSugars),
    addedSugars: String(addedSugars),
    totalFat: String(totalFat),
    saturatedFat: String(saturatedFat),
    transFat: String(transFat),
    cholesterol: String(cholesterol),
    sodium: String(sodium),
    caffeine: String(caffeine),
    allergens: cleanAllergens,
  };

  const [existing] = await db
    .select()
    .from(ingredientNutritionTable)
    .where(eq(ingredientNutritionTable.ingredientId, ingredientId))
    .limit(1);

  if (existing) {
    await db
      .update(ingredientNutritionTable)
      .set(values)
      .where(eq(ingredientNutritionTable.ingredientId, ingredientId));
  } else {
    await db.insert(ingredientNutritionTable).values(values);
  }

  res.json({ message: "Nutrition updated successfully", ...values });
});

// ── GET /api/ingredients/nutrition-list ────────────────────────────────────
router.get("/ingredients-nutrition-list", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      ingredientId: ingredientsTable.id,
      name: ingredientsTable.name,
      ingredientType: ingredientsTable.ingredientType,
      unit: ingredientsTable.unit,
      servingSizeQty: ingredientNutritionTable.servingSizeQty,
      servingSizeUnit: ingredientNutritionTable.servingSizeUnit,
      calories: ingredientNutritionTable.calories,
      protein: ingredientNutritionTable.protein,
      totalCarbs: ingredientNutritionTable.totalCarbs,
      totalSugars: ingredientNutritionTable.totalSugars,
      totalFat: ingredientNutritionTable.totalFat,
      caffeine: ingredientNutritionTable.caffeine,
      allergens: ingredientNutritionTable.allergens,
    })
    .from(ingredientsTable)
    .leftJoin(ingredientNutritionTable, eq(ingredientNutritionTable.ingredientId, ingredientsTable.id));

  res.json(rows);
});

// ── POST /api/nutrition/calculate ───────────────────────────────────────────
router.post("/nutrition/calculate", async (req, res): Promise<void> => {
  const { drinkId, selections = [], branchId = null } = req.body ?? {};

  if (!drinkId || typeof drinkId !== "number") {
    res.status(400).json({ error: "drinkId is required" });
    return;
  }

  try {
    const calcData = await calculateDrinkData(drinkId, selections, branchId, null);
    const customizations = calcData.customizations.map(c => ({
      ingredientId: c.ingredientId,
      consumedQty: c.consumedQty,
    }));

    const nutritionFacts = await calculateCustomizationNutrition(customizations);

    res.json({
      drinkId,
      drinkName: calcData.drink.name,
      basePrice: calcData.totalPrice,
      customizationsCount: calcData.customizations.length,
      nutritionFacts,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to calculate drink nutrition" });
  }
});

// ── GET /api/customers/:id/nutrition/summary ───────────────────────────────
router.get("/customers/:id/nutrition/summary", async (req, res): Promise<void> => {
  const customerId = parseInt(req.params.id, 10);
  if (isNaN(customerId)) {
    res.status(400).json({ error: "Invalid customer ID" });
    return;
  }

  // Get customer goals
  let [goals] = await db
    .select()
    .from(customerNutritionGoalsTable)
    .where(eq(customerNutritionGoalsTable.customerId, customerId))
    .limit(1);

  if (!goals) {
    goals = {
      customerId,
      dailyCalorieGoal: 2000,
      dailyCaffeineLimit: 400,
      dailySugarLimit: 50,
      dailyProteinGoal: 50,
      dailyCarbLimit: null,
      dailyFatLimit: null,
      dietaryPreferences: [],
      updatedAt: new Date(),
    };
  }

  // Define today start and end
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Define 7 days start
  const startOf7Days = new Date(now.valueOf() - 7 * 24 * 60 * 60 * 1000);

  // Fetch today's intake logs
  const todayLogs = await db
    .select()
    .from(customerNutritionLogsTable)
    .where(
      and(
        eq(customerNutritionLogsTable.customerId, customerId),
        gte(customerNutritionLogsTable.consumedAt, startOfDay),
        lte(customerNutritionLogsTable.consumedAt, endOfDay)
      )
    );

  let todayCalories = 0;
  let todayCaffeine = 0;
  let todaySugars = 0;
  let todayProtein = 0;
  let todayCarbs = 0;
  let todayFat = 0;
  let todaySodium = 0;
  const todayAllergensSet = new Set<string>();

  for (const log of todayLogs) {
    todayCalories += parseFloat(log.calories || "0");
    todayCaffeine += parseFloat(log.caffeine || "0");
    todaySugars += parseFloat(log.totalSugars || "0");
    todayProtein += parseFloat(log.protein || "0");
    todayCarbs += parseFloat(log.totalCarbs || "0");
    todayFat += parseFloat(log.totalFat || "0");
    todaySodium += parseFloat(log.sodium || "0");

    if (Array.isArray(log.allergens)) {
      log.allergens.forEach(a => todayAllergensSet.add(a));
    }
  }

  // Fetch 7-day intake logs
  const weeklyLogs = await db
    .select()
    .from(customerNutritionLogsTable)
    .where(
      and(
        eq(customerNutritionLogsTable.customerId, customerId),
        gte(customerNutritionLogsTable.consumedAt, startOf7Days)
      )
    );

  let weeklyCalories = 0;
  let weeklyCaffeine = 0;
  let weeklySugars = 0;
  let weeklyProtein = 0;
  for (const log of weeklyLogs) {
    weeklyCalories += parseFloat(log.calories || "0");
    weeklyCaffeine += parseFloat(log.caffeine || "0");
    weeklySugars += parseFloat(log.totalSugars || "0");
    weeklyProtein += parseFloat(log.protein || "0");
  }

  res.json({
    customerId,
    goals,
    today: {
      calories: Math.round(todayCalories),
      caffeine: Math.round(todayCaffeine * 10) / 10,
      totalSugars: Math.round(todaySugars * 10) / 10,
      protein: Math.round(todayProtein * 10) / 10,
      totalCarbs: Math.round(todayCarbs * 10) / 10,
      totalFat: Math.round(todayFat * 10) / 10,
      sodium: Math.round(todaySodium * 10) / 10,
      itemsCount: todayLogs.length,
      allergensConsumed: Array.from(todayAllergensSet),
    },
    weekly: {
      calories: Math.round(weeklyCalories),
      caffeine: Math.round(weeklyCaffeine * 10) / 10,
      totalSugars: Math.round(weeklySugars * 10) / 10,
      protein: Math.round(weeklyProtein * 10) / 10,
      avgDailyCalories: Math.round(weeklyCalories / 7),
      avgDailyCaffeine: Math.round((weeklyCaffeine / 7) * 10) / 10,
      itemsCount: weeklyLogs.length,
    },
  });
});

// ── GET /api/customers/:id/nutrition/history ───────────────────────────────
router.get("/customers/:id/nutrition/history", async (req, res): Promise<void> => {
  const customerId = parseInt(req.params.id, 10);
  if (isNaN(customerId)) {
    res.status(400).json({ error: "Invalid customer ID" });
    return;
  }

  const logs = await db
    .select()
    .from(customerNutritionLogsTable)
    .where(eq(customerNutritionLogsTable.customerId, customerId))
    .orderBy(desc(customerNutritionLogsTable.consumedAt))
    .limit(100);

  res.json(logs);
});

// ── GET /api/customers/:id/nutrition/goals ─────────────────────────────────
router.get("/customers/:id/nutrition/goals", async (req, res): Promise<void> => {
  const customerId = parseInt(req.params.id, 10);
  if (isNaN(customerId)) {
    res.status(400).json({ error: "Invalid customer ID" });
    return;
  }

  let [goals] = await db
    .select()
    .from(customerNutritionGoalsTable)
    .where(eq(customerNutritionGoalsTable.customerId, customerId))
    .limit(1);

  if (!goals) {
    goals = {
      customerId,
      dailyCalorieGoal: 2000,
      dailyCaffeineLimit: 400,
      dailySugarLimit: 50,
      dailyProteinGoal: 50,
      dailyCarbLimit: null,
      dailyFatLimit: null,
      dietaryPreferences: [],
      updatedAt: new Date(),
    };
  }

  res.json(goals);
});

// ── PUT /api/customers/:id/nutrition/goals ─────────────────────────────────
router.put("/customers/:id/nutrition/goals", async (req, res): Promise<void> => {
  const customerId = parseInt(req.params.id, 10);
  if (isNaN(customerId)) {
    res.status(400).json({ error: "Invalid customer ID" });
    return;
  }

  const {
    dailyCalorieGoal = 2000,
    dailyCaffeineLimit = 400,
    dailySugarLimit = 50,
    dailyProteinGoal = 50,
    dailyCarbLimit = null,
    dailyFatLimit = null,
    dietaryPreferences = [],
  } = req.body ?? {};

  const cleanPrefs = Array.isArray(dietaryPreferences)
    ? dietaryPreferences.map((p: any) => String(p).toLowerCase().trim())
    : [];

  const values = {
    customerId,
    dailyCalorieGoal: parseInt(dailyCalorieGoal, 10) || 2000,
    dailyCaffeineLimit: parseInt(dailyCaffeineLimit, 10) || 400,
    dailySugarLimit: parseInt(dailySugarLimit, 10) || 50,
    dailyProteinGoal: parseInt(dailyProteinGoal, 10) || 50,
    dailyCarbLimit: dailyCarbLimit ? parseInt(dailyCarbLimit, 10) : null,
    dailyFatLimit: dailyFatLimit ? parseInt(dailyFatLimit, 10) : null,
    dietaryPreferences: cleanPrefs,
  };

  const [existing] = await db
    .select()
    .from(customerNutritionGoalsTable)
    .where(eq(customerNutritionGoalsTable.customerId, customerId))
    .limit(1);

  if (existing) {
    await db
      .update(customerNutritionGoalsTable)
      .set(values)
      .where(eq(customerNutritionGoalsTable.customerId, customerId));
  } else {
    await db.insert(customerNutritionGoalsTable).values(values);
  }

  res.json({ message: "Goals updated successfully", ...values });
});

// ── GET /api/nutrition/reports ─────────────────────────────────────────────
router.get("/nutrition/reports", async (_req, res): Promise<void> => {
  try {
    const totalLogged = await db.execute(sql`
      SELECT 
        COUNT(*)::int as total_items,
        SUM(calories)::numeric as total_calories,
        SUM(caffeine)::numeric as total_caffeine,
        SUM(total_sugars)::numeric as total_sugars,
        SUM(protein)::numeric as total_protein
      FROM customer_nutrition_logs
    `);

    const topCaffeine = await db.execute(sql`
      SELECT 
        drink_name,
        COUNT(*)::int as times_ordered,
        AVG(caffeine)::numeric as avg_caffeine,
        AVG(calories)::numeric as avg_calories,
        AVG(total_sugars)::numeric as avg_sugars
      FROM customer_nutrition_logs
      GROUP BY drink_name
      ORDER BY avg_caffeine DESC
      LIMIT 10
    `);

    const topSugars = await db.execute(sql`
      SELECT 
        drink_name,
        COUNT(*)::int as times_ordered,
        AVG(total_sugars)::numeric as avg_sugars,
        AVG(calories)::numeric as avg_calories
      FROM customer_nutrition_logs
      GROUP BY drink_name
      ORDER BY avg_sugars DESC
      LIMIT 10
    `);

    const stats = (totalLogged.rows as any[])[0] || {};

    res.json({
      summary: {
        totalItemsLogged: stats.total_items || 0,
        totalCaloriesServed: Math.round(parseFloat(stats.total_calories || "0")),
        totalCaffeineGramsServed: Math.round((parseFloat(stats.total_caffeine || "0") / 1000) * 10) / 10,
        totalSugarKgServed: Math.round((parseFloat(stats.total_sugars || "0") / 1000) * 10) / 10,
        totalProteinKgServed: Math.round((parseFloat(stats.total_protein || "0") / 1000) * 10) / 10,
      },
      topCaffeinatedDrinks: topCaffeine.rows || [],
      topSugaryDrinks: topSugars.rows || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate nutrition reports" });
  }
});

export default router;
