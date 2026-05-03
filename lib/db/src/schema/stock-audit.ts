import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { ingredientsTable } from "./ingredients";
import { branchesTable } from "./branches";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stockAuditsTable = pgTable("stock_audits", {
  id: serial("id").primaryKey(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  approvedBy: integer("approved_by").references(() => usersTable.id),
  notes: text("notes"),
  branchId: integer("branch_id").notNull().references(() => branchesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

export const stockAuditItemsTable = pgTable("stock_audit_items", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").notNull().references(() => stockAuditsTable.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredientsTable.id),
  expectedQuantity: numeric("expected_quantity", { precision: 12, scale: 4 }).notNull(),
  actualQuantity: numeric("actual_quantity", { precision: 12, scale: 4 }).notNull(),
  finalQuantity: numeric("final_quantity", { precision: 12, scale: 4 }), // Admin can edit this
  notes: text("notes"),
});

export const insertStockAuditSchema = createInsertSchema(stockAuditsTable).omit({ id: true, createdAt: true, approvedAt: true });
export const insertStockAuditItemSchema = createInsertSchema(stockAuditItemsTable).omit({ id: true });

export type StockAudit = typeof stockAuditsTable.$inferSelect;
export type StockAuditItem = typeof stockAuditItemsTable.$inferSelect;
