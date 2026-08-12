import { pgTable, serial, text, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { ingredientsTable } from "./ingredients";
import { branchesTable } from "./branches";
import { usersTable } from "./users";

// ── BOM Formulas Master Table ─────────────────────────────────────────────
export const bomsTable = pgTable("boms", {
  id: serial("id").primaryKey(),
  targetIngredientId: integer("target_ingredient_id")
    .notNull()
    .unique()
    .references(() => ingredientsTable.id, { onDelete: "cascade" }),
  yieldQuantity: numeric("yield_quantity", { precision: 12, scale: 4 }).notNull().default("1"),
  yieldUnit: text("yield_unit").notNull().default("ml"),
  notes: text("notes"),
  isLivePrepare: boolean("is_live_prepare").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ── BOM Formula Items / Raw Ingredients ──────────────────────────────────
export const bomItemsTable = pgTable("bom_items", {
  id: serial("id").primaryKey(),
  bomId: integer("bom_id")
    .notNull()
    .references(() => bomsTable.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id")
    .notNull()
    .references(() => ingredientsTable.id, { onDelete: "cascade" }),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ── Manufacturing Preparation Process Runs (Production Batches) ──────────
export const manufacturingRunsTable = pgTable("manufacturing_runs", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branchesTable.id, { onDelete: "cascade" }),
  targetIngredientId: integer("target_ingredient_id")
    .notNull()
    .references(() => ingredientsTable.id, { onDelete: "cascade" }),
  producedQuantity: numeric("produced_quantity", { precision: 12, scale: 4 }).notNull(),
  producedUnit: text("produced_unit").notNull(),
  totalCost: numeric("total_cost", { precision: 12, scale: 4 }).notNull().default("0"),
  status: text("status", { enum: ["completed", "cancelled"] }).notNull().default("completed"),
  preparedBy: integer("prepared_by")
    .notNull()
    .references(() => usersTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Detailed BOM Items consumed during a specific Manufacturing Run ─────
export const manufacturingRunItemsTable = pgTable("manufacturing_run_items", {
  id: serial("id").primaryKey(),
  manufacturingRunId: integer("manufacturing_run_id")
    .notNull()
    .references(() => manufacturingRunsTable.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id")
    .notNull()
    .references(() => ingredientsTable.id, { onDelete: "cascade" }),
  plannedQuantity: numeric("planned_quantity", { precision: 12, scale: 4 }).notNull(),
  actualQuantity: numeric("actual_quantity", { precision: 12, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 4 }).notNull().default("0"),
  totalCost: numeric("total_cost", { precision: 12, scale: 4 }).notNull().default("0"),
});

// ── Zod Schemas & Types ──────────────────────────────────────────────────
export const insertBomSchema = createInsertSchema(bomsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBomItemSchema = createInsertSchema(bomItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertManufacturingRunSchema = createInsertSchema(manufacturingRunsTable).omit({ id: true, createdAt: true });
export const insertManufacturingRunItemSchema = createInsertSchema(manufacturingRunItemsTable).omit({ id: true });

export type Bom = typeof bomsTable.$inferSelect;
export type BomItem = typeof bomItemsTable.$inferSelect;
export type ManufacturingRun = typeof manufacturingRunsTable.$inferSelect;
export type ManufacturingRunItem = typeof manufacturingRunItemsTable.$inferSelect;
