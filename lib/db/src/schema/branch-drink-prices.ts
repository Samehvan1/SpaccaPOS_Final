import { pgTable, serial, integer, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { branchesTable } from "./branches";
import { drinksTable } from "./drinks";

export const branchDrinkPricesTable = pgTable("branch_drink_prices", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").notNull().references(() => branchesTable.id, { onDelete: "cascade" }),
  drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
  price: numeric("price", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    branchDrinkIdx: index("branch_drink_prices_branch_drink_idx").on(table.branchId, table.drinkId),
  };
});

export type BranchDrinkPrice = typeof branchDrinkPricesTable.$inferSelect;
export type InsertBranchDrinkPrice = typeof branchDrinkPricesTable.$inferInsert;
