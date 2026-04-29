import { pgTable, serial, text, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Inventory items (unchanged — used for stock tracking) ─────────────────
export const ingredientsTable = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ingredientType: text("ingredient_type", {
    enum: ["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"],
  }).notNull(),
  unit: text("unit").notNull(),
  costPerUnit: numeric("cost_per_unit", { precision: 10, scale: 4 }).notNull(),
  stockQuantity: numeric("stock_quantity", { precision: 12, scale: 4 }).notNull().default("0"),
  lowStockThreshold: numeric("low_stock_threshold", { precision: 12, scale: 4 }).notNull().default("500"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ingredientOptionsTable = pgTable("ingredient_options", {
  id: serial("id").primaryKey(),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredientsTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  processedQty: numeric("processed_qty", { precision: 10, scale: 4 }).notNull(),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }).notNull(),
  producedUnit: text("produced_unit").notNull(),
  extraCost: numeric("extra_cost", { precision: 8, scale: 4 }).notNull().default("0"),
  isDefault: boolean("is_default").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  linkedIngredientId: integer("linked_ingredient_id").references(() => ingredientsTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ── New structured catalog ─────────────────────────────────────────────────

/** High-level groupings: Coffee, Milk, Syrup, Sauce, Sweetener, Topping, etc. */
export const ingredientCategoriesTable = pgTable("ingredient_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Named ingredient kinds within a category.
 * e.g. "Brazilian Espresso" (Coffee), "Oat Milk" (Milk), "Vanilla" (Syrup)
 * inventoryIngredientId → which inventory item to deduct when used
 */
export const ingredientTypesTable = pgTable("ingredient_types", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => ingredientCategoriesTable.id),
  name: text("name").notNull(),
  inventoryIngredientId: integer("inventory_ingredient_id").references(() => ingredientsTable.id, { onDelete: "set null" }),
  processedQty: numeric("processed_qty", { precision: 10, scale: 4 }).notNull().default("0"),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }).notNull().default("0"),
  unit: text("unit").notNull().default("ml"),
  isActive: boolean("is_active").notNull().default(true),
  affectsCupSize: boolean("affects_cup_size").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  color: text("color"),
  extraCost: numeric("extra_cost", { precision: 8, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Reusable global volume definitions.
 * e.g. "Single Shot", "Double Shot", "1 Pump", "Small 100ml", "Medium 150ml"
 */
export const ingredientVolumesTable = pgTable("ingredient_volumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  processedQty: numeric("processed_qty", { precision: 10, scale: 4 }).notNull().default("0"),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }).notNull().default("0"),
  unit: text("unit").notNull().default("ml"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Links a volume to an ingredient type, with per-type overrides and cost.
 * e.g. "Brazilian Espresso" + "Single Shot" = 9g → 18ml, +E£0
 *      "Oat Milk" + "Medium 150ml" = 150ml, +E£15
 */
export const ingredientTypeVolumesTable = pgTable("ingredient_type_volumes", {
  id: serial("id").primaryKey(),
  ingredientTypeId: integer("ingredient_type_id").notNull().references(() => ingredientTypesTable.id, { onDelete: "cascade" }),
  volumeId: integer("volume_id").notNull().references(() => ingredientVolumesTable.id),
  // Override defaults from volume (null = use volume's own values)
  processedQty: numeric("processed_qty", { precision: 10, scale: 4 }),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }),
  unit: text("unit"),
  extraCost: numeric("extra_cost", { precision: 8, scale: 4 }).notNull().default("0"),
  isDefault: boolean("is_default").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

// ── Zod / type exports ─────────────────────────────────────────────────────
export const insertIngredientSchema = createInsertSchema(ingredientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIngredientOptionSchema = createInsertSchema(ingredientOptionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIngredientCategorySchema = createInsertSchema(ingredientCategoriesTable).omit({ id: true, createdAt: true });
export const insertIngredientTypeSchema = createInsertSchema(ingredientTypesTable).omit({ id: true, createdAt: true });
export const insertIngredientVolumeSchema = createInsertSchema(ingredientVolumesTable).omit({ id: true, createdAt: true });
export const insertIngredientTypeVolumeSchema = createInsertSchema(ingredientTypeVolumesTable).omit({ id: true });

export type InsertIngredient = typeof ingredientsTable.$inferInsert;
export type InsertIngredientOption = typeof ingredientOptionsTable.$inferInsert;
export type Ingredient = typeof ingredientsTable.$inferSelect;
export type IngredientOption = typeof ingredientOptionsTable.$inferSelect;
export type IngredientCategory = typeof ingredientCategoriesTable.$inferSelect;
export type IngredientType = typeof ingredientTypesTable.$inferSelect;
export type IngredientVolume = typeof ingredientVolumesTable.$inferSelect;
export type IngredientTypeVolume = typeof ingredientTypeVolumesTable.$inferSelect;
