import { pgTable, serial, text, numeric, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { ingredientsTable, ingredientOptionsTable, ingredientTypesTable, ingredientTypeVolumesTable } from "./ingredients";

export const drinkCategoriesTable = pgTable("drink_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const kitchenStationsTable = pgTable("kitchen_stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const drinksTable = pgTable("drinks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // Legacy: keep for migration, then we can drop
  categoryId: integer("category_id").references(() => drinkCategoriesTable.id),
  basePrice: numeric("base_price", { precision: 8, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  prepTimeSeconds: integer("prep_time_seconds").notNull().default(180),
  cupSizeMl: integer("cup_size_ml"),
  cupIngredientId: integer("cup_ingredient_id").references(() => ingredientsTable.id, { onDelete: "set null" }),
  isCustomizable: boolean("is_customizable").notNull().default(true),
  kitchenStation: text("kitchen_station").notNull().default("main"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const drinkIngredientSlotsTable = pgTable("drink_ingredient_slots", {
  id: serial("id").primaryKey(),
  drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
  // Legacy: raw inventory ingredient (old-style slots)
  ingredientId: integer("ingredient_id").references(() => ingredientsTable.id),
  // New: structured ingredient type (new-style slots)
  ingredientTypeId: integer("ingredient_type_id").references(() => ingredientTypesTable.id, { onDelete: "set null" }),
  slotLabel: text("slot_label").notNull(),
  isRequired: boolean("is_required").notNull().default(true),
  // Legacy default option (old-style)
  defaultOptionId: integer("default_option_id").references(() => ingredientOptionsTable.id, { onDelete: "set null" }),
  isDynamic: boolean("is_dynamic").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  baristaSortOrder: integer("barista_sort_order").notNull().default(1),
  customerSortOrder: integer("customer_sort_order").notNull().default(1),
  affectsCupSize: boolean("affects_cup_size"), // null = inherit from type
  predefinedSlotId: integer("predefined_slot_id"), // Added for templates support
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/**
 * Multi-type options for a typed slot.
 * A slot can offer several ingredient types for the barista to choose from.
 * e.g. Coffee slot → {Brazilian, Colombian, Special Roasted}
 */
export const drinkSlotTypeOptionsTable = pgTable("drink_slot_type_options", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").notNull().references(() => drinkIngredientSlotsTable.id, { onDelete: "cascade" }),
  ingredientTypeId: integer("ingredient_type_id").notNull().references(() => ingredientTypesTable.id, { onDelete: "cascade" }),
  isDefault: boolean("is_default").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  // Per-drink overrides for the type itself (when no volume selected)
  processedQty: numeric("processed_qty", { precision: 10, scale: 4 }),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }),
  unit: text("unit"),
  extraCost: numeric("extra_cost", { precision: 8, scale: 4 }),
  pricingMode: text("pricing_mode", { enum: ["volume", "unit"] }),
});

/**
 * Per-drink volume overrides for new-style slots.
 * Scoped to a specific type option (slotTypeOptionId) + volume (typeVolumeId).
 * Allows a drink to override qty/cost/enabled for any type+volume combination.
 */
export const drinkSlotVolumesTable = pgTable("drink_slot_volumes", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").notNull().references(() => drinkIngredientSlotsTable.id, { onDelete: "cascade" }),
  typeVolumeId: integer("type_volume_id").notNull().references(() => ingredientTypeVolumesTable.id),
  // Drink-specific overrides (null = inherit from type volume)
  processedQty: numeric("processed_qty", { precision: 10, scale: 4 }),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }),
  unit: text("unit"),
  extraCost: numeric("extra_cost", { precision: 8, scale: 4 }),
  isDefault: boolean("is_default").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const predefinedSlotsTable = pgTable("predefined_slots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Administrative name (e.g. "Standard Milk Choice")
  slotLabel: text("slot_label").notNull(), // Default UI label (e.g. "Milk")
  isRequired: boolean("is_required").notNull().default(true),
  isDynamic: boolean("is_dynamic").notNull().default(false),
  affectsCupSize: boolean("affects_cup_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const predefinedSlotTypeOptionsTable = pgTable("predefined_slot_type_options", {
  id: serial("id").primaryKey(),
  predefinedSlotId: integer("predefined_slot_id").notNull().references(() => predefinedSlotsTable.id, { onDelete: "cascade" }),
  ingredientTypeId: integer("ingredient_type_id").notNull().references(() => ingredientTypesTable.id, { onDelete: "cascade" }),
  isDefault: boolean("is_default").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  processedQty: numeric("processed_qty", { precision: 10, scale: 4 }),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }),
  unit: text("unit"),
  extraCost: numeric("extra_cost", { precision: 8, scale: 4 }),
  pricingMode: text("pricing_mode", { enum: ["volume", "unit"] }),
});

export const predefinedSlotVolumesTable = pgTable("predefined_slot_volumes", {
  id: serial("id").primaryKey(),
  predefinedSlotId: integer("predefined_slot_id").notNull().references(() => predefinedSlotsTable.id, { onDelete: "cascade" }),
  typeVolumeId: integer("type_volume_id").notNull().references(() => ingredientTypeVolumesTable.id, { onDelete: "cascade" }),
  processedQty: numeric("processed_qty", { precision: 10, scale: 4 }),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }),
  unit: text("unit"),
  extraCost: numeric("extra_cost", { precision: 8, scale: 4 }),
  isDefault: boolean("is_default").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertDrinkSchema = createInsertSchema(drinksTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDrinkCategorySchema = createInsertSchema(drinkCategoriesTable).omit({ id: true, createdAt: true });
export const insertKitchenStationSchema = createInsertSchema(kitchenStationsTable).omit({ id: true, createdAt: true });
export const insertDrinkSlotSchema = createInsertSchema(drinkIngredientSlotsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDrinkSlotVolumeSchema = createInsertSchema(drinkSlotVolumesTable).omit({ id: true });
export const insertDrinkSlotTypeOptionSchema = createInsertSchema(drinkSlotTypeOptionsTable).omit({ id: true });
export const insertPredefinedSlotSchema = createInsertSchema(predefinedSlotsTable).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertDrink = typeof drinksTable.$inferInsert;
export type InsertDrinkCategory = typeof drinkCategoriesTable.$inferInsert;
export type InsertDrinkSlot = typeof drinkIngredientSlotsTable.$inferInsert;
export type Drink = typeof drinksTable.$inferSelect;
export type DrinkCategory = typeof drinkCategoriesTable.$inferSelect;
export type KitchenStation = typeof kitchenStationsTable.$inferSelect;
export type InsertKitchenStation = typeof kitchenStationsTable.$inferInsert;
export type DrinkIngredientSlot = typeof drinkIngredientSlotsTable.$inferSelect;
export type DrinkSlotVolume = typeof drinkSlotVolumesTable.$inferSelect;
export type DrinkSlotTypeOption = typeof drinkSlotTypeOptionsTable.$inferSelect;

export type PredefinedSlot = typeof predefinedSlotsTable.$inferSelect;
export type PredefinedSlotTypeOption = typeof predefinedSlotTypeOptionsTable.$inferSelect;
export type PredefinedSlotVolume = typeof predefinedSlotVolumesTable.$inferSelect;
