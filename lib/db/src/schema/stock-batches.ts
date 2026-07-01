import { pgTable, serial, text, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { branchesTable } from "./branches";
import { ingredientsTable } from "./ingredients";

export const branchInventoryBatchesTable = pgTable("branch_inventory_batches", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").notNull().references(() => branchesTable.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredientsTable.id, { onDelete: "cascade" }),
  batchNumber: text("batch_number"),
  sealedExpiryDate: timestamp("sealed_expiry_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  isOpened: boolean("is_opened").notNull().default(false),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull().default("0"),
  initialQuantity: numeric("initial_quantity", { precision: 12, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBranchInventoryBatchSchema = createInsertSchema(branchInventoryBatchesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBranchInventoryBatch = typeof branchInventoryBatchesTable.$inferInsert;
export type BranchInventoryBatch = typeof branchInventoryBatchesTable.$inferSelect;
