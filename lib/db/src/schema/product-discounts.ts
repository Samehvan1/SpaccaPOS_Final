import { pgTable, serial, text, numeric, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { drinksTable } from "./drinks";
import { branchesTable } from "./branches";
import { partnersTable } from "./partners";

export const productDrinkDiscountsTable = pgTable("product_drink_discounts", {
  id: serial("id").primaryKey(),
  drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }), // Nullable: null applies across all branches
  partnerId: integer("partner_id").references(() => partnersTable.id, { onDelete: "cascade" }), // Nullable: null applies to direct POS / all partners
  discountType: text("discount_type", { enum: ["percentage", "fixed_amount", "fixed_price"] }).notNull().default("percentage"),
  discountValue: numeric("discount_value", { precision: 8, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isTaxable: boolean("is_taxable").notNull().default(false),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    productDiscountScopeIdx: index("product_drink_discounts_scope_idx").on(table.drinkId, table.branchId, table.partnerId),
  };
});

export const insertProductDrinkDiscountSchema = createInsertSchema(productDrinkDiscountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type ProductDrinkDiscount = typeof productDrinkDiscountsTable.$inferSelect;
export type InsertProductDrinkDiscount = z.infer<typeof insertProductDrinkDiscountSchema>;
