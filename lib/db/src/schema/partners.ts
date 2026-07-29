import { pgTable, serial, text, varchar, numeric, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { branchesTable } from "./branches";
import { drinksTable } from "./drinks";

export const partnersTable = pgTable("ordering_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: varchar("code", { length: 50 }).unique().notNull(), // e.g. "talabat", "breakfast"
  commissionType: text("commission_type", { enum: ["percentage", "fixed"] }).notNull().default("percentage"),
  commissionValue: numeric("commission_value", { precision: 8, scale: 2 }).notNull().default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const partnerDrinkPricesTable = pgTable("partner_drink_prices", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id, { onDelete: "cascade" }),
  drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }), // Nullable: if null, applies to all branches
  price: numeric("price", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    partnerDrinkBranchIdx: index("partner_drink_prices_idx").on(table.partnerId, table.drinkId, table.branchId),
  };
});

export const insertPartnerSchema = createInsertSchema(partnersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPartnerDrinkPriceSchema = createInsertSchema(partnerDrinkPricesTable).omit({ id: true, createdAt: true, updatedAt: true });

export type Partner = typeof partnersTable.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type PartnerDrinkPrice = typeof partnerDrinkPricesTable.$inferSelect;
export type InsertPartnerDrinkPrice = z.infer<typeof insertPartnerDrinkPriceSchema>;
