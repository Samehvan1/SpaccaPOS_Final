import { pgTable, serial, text, numeric, integer, timestamp, jsonb, primaryKey, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { ingredientsTable } from "./ingredients";
import { customersTable } from "./customers";
import { ordersTable, orderItemsTable } from "./orders";
import { drinksTable } from "./drinks";

// ── Ingredient Nutrition Facts ──────────────────────────────────────────────
export const ingredientNutritionTable = pgTable("ingredient_nutrition", {
  ingredientId: integer("ingredient_id").primaryKey().references(() => ingredientsTable.id, { onDelete: "cascade" }),
  servingSizeQty: numeric("serving_size_qty", { precision: 10, scale: 4 }).notNull().default("1"),
  servingSizeUnit: text("serving_size_unit").notNull().default("unit"),
  calories: numeric("calories", { precision: 10, scale: 2 }).notNull().default("0"),
  protein: numeric("protein", { precision: 10, scale: 2 }).notNull().default("0"),
  totalCarbs: numeric("total_carbs", { precision: 10, scale: 2 }).notNull().default("0"),
  dietaryFiber: numeric("dietary_fiber", { precision: 10, scale: 2 }).notNull().default("0"),
  totalSugars: numeric("total_sugars", { precision: 10, scale: 2 }).notNull().default("0"),
  addedSugars: numeric("added_sugars", { precision: 10, scale: 2 }).notNull().default("0"),
  totalFat: numeric("total_fat", { precision: 10, scale: 2 }).notNull().default("0"),
  saturatedFat: numeric("saturated_fat", { precision: 10, scale: 2 }).notNull().default("0"),
  transFat: numeric("trans_fat", { precision: 10, scale: 2 }).notNull().default("0"),
  cholesterol: numeric("cholesterol", { precision: 10, scale: 2 }).notNull().default("0"),
  sodium: numeric("sodium", { precision: 10, scale: 2 }).notNull().default("0"),
  caffeine: numeric("caffeine", { precision: 10, scale: 2 }).notNull().default("0"),
  allergens: jsonb("allergens").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ── Customer Nutrition Goals ─────────────────────────────────────────────────
export const customerNutritionGoalsTable = pgTable("customer_nutrition_goals", {
  customerId: integer("customer_id").primaryKey().references(() => customersTable.id, { onDelete: "cascade" }),
  dailyCalorieGoal: integer("daily_calorie_goal").notNull().default(2000),
  dailyCaffeineLimit: integer("daily_caffeine_limit").notNull().default(400),
  dailySugarLimit: integer("daily_sugar_limit").notNull().default(50),
  dailyProteinGoal: integer("daily_protein_goal").notNull().default(50),
  dailyCarbLimit: integer("daily_carb_limit"),
  dailyFatLimit: integer("daily_fat_limit"),
  dietaryPreferences: jsonb("dietary_preferences").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ── Customer Nutrition Intake Log ───────────────────────────────────────────
export const customerNutritionLogsTable = pgTable("customer_nutrition_logs", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => ordersTable.id, { onDelete: "set null" }),
  orderItemId: integer("order_item_id").references(() => orderItemsTable.id, { onDelete: "set null" }),
  drinkId: integer("drink_id").references(() => drinksTable.id, { onDelete: "set null" }),
  drinkName: text("drink_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  consumedAt: timestamp("consumed_at", { withTimezone: true }).notNull().defaultNow(),
  calories: numeric("calories", { precision: 10, scale: 2 }).notNull().default("0"),
  protein: numeric("protein", { precision: 10, scale: 2 }).notNull().default("0"),
  totalCarbs: numeric("total_carbs", { precision: 10, scale: 2 }).notNull().default("0"),
  dietaryFiber: numeric("dietary_fiber", { precision: 10, scale: 2 }).notNull().default("0"),
  totalSugars: numeric("total_sugars", { precision: 10, scale: 2 }).notNull().default("0"),
  addedSugars: numeric("added_sugars", { precision: 10, scale: 2 }).notNull().default("0"),
  totalFat: numeric("total_fat", { precision: 10, scale: 2 }).notNull().default("0"),
  saturatedFat: numeric("saturated_fat", { precision: 10, scale: 2 }).notNull().default("0"),
  transFat: numeric("trans_fat", { precision: 10, scale: 2 }).notNull().default("0"),
  cholesterol: numeric("cholesterol", { precision: 10, scale: 2 }).notNull().default("0"),
  sodium: numeric("sodium", { precision: 10, scale: 2 }).notNull().default("0"),
  caffeine: numeric("caffeine", { precision: 10, scale: 2 }).notNull().default("0"),
  allergens: jsonb("allergens").$type<string[]>().notNull().default([]),
  nutritionDetails: jsonb("nutrition_details").$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    customerConsumedIdx: index("customer_nutrition_logs_customer_consumed_idx").on(table.customerId, table.consumedAt),
    orderIdIdx: index("customer_nutrition_logs_order_id_idx").on(table.orderId),
  };
});

// Zod & Type exports
export const insertIngredientNutritionSchema = createInsertSchema(ingredientNutritionTable);
export const insertCustomerNutritionGoalsSchema = createInsertSchema(customerNutritionGoalsTable);
export const insertCustomerNutritionLogSchema = createInsertSchema(customerNutritionLogsTable).omit({ id: true, createdAt: true });

export type IngredientNutrition = typeof ingredientNutritionTable.$inferSelect;
export type InsertIngredientNutrition = typeof ingredientNutritionTable.$inferInsert;
export type CustomerNutritionGoals = typeof customerNutritionGoalsTable.$inferSelect;
export type InsertCustomerNutritionGoals = typeof customerNutritionGoalsTable.$inferInsert;
export type CustomerNutritionLog = typeof customerNutritionLogsTable.$inferSelect;
export type InsertCustomerNutritionLog = typeof customerNutritionLogsTable.$inferInsert;
