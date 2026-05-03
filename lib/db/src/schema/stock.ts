import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ingredientsTable } from "./ingredients";
import { ordersTable } from "./orders";
import { usersTable } from "./users";
import { branchesTable } from "./branches";

export const stockMovementsTable = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branchesTable.id),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredientsTable.id),
  orderId: integer("order_id").references(() => ordersTable.id, { onDelete: "set null" }),
  movementType: text("movement_type", {
    enum: ["sale", "restock", "adjustment", "waste", "opening"],
  }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  quantityAfter: numeric("quantity_after", { precision: 12, scale: 4 }).notNull(),
  note: text("note"),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStockMovementSchema = createInsertSchema(stockMovementsTable).omit({ id: true, createdAt: true });
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovementsTable.$inferSelect;
