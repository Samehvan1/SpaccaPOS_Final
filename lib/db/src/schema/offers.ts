import { pgTable, serial, text, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { branchesTable } from "./branches";
import { partnersTable } from "./partners";
import { drinksTable } from "./drinks";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  buyAmount: integer("buy_amount").notNull(), // N
  freeAmount: integer("free_amount").notNull(), // X
  isActive: boolean("is_active").notNull().default(true),
  applyToStore: boolean("apply_to_store").notNull().default(true),
  applyToAllPartners: boolean("apply_to_all_partners").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const offersBranchesTable = pgTable("offers_branches", {
  offerId: integer("offer_id").notNull().references(() => offersTable.id, { onDelete: "cascade" }),
  branchId: integer("branch_id").notNull().references(() => branchesTable.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.offerId, table.branchId] }),
  };
});

export const offersPartnersTable = pgTable("offers_partners", {
  offerId: integer("offer_id").notNull().references(() => offersTable.id, { onDelete: "cascade" }),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.offerId, table.partnerId] }),
  };
});

export const offersApplicableDrinksTable = pgTable("offers_applicable_drinks", {
  offerId: integer("offer_id").notNull().references(() => offersTable.id, { onDelete: "cascade" }),
  drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.offerId, table.drinkId] }),
  };
});

export const offersRewardDrinksTable = pgTable("offers_reward_drinks", {
  offerId: integer("offer_id").notNull().references(() => offersTable.id, { onDelete: "cascade" }),
  drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.offerId, table.drinkId] }),
  };
});

export const offersExcludedDrinksTable = pgTable("offers_excluded_drinks", {
  offerId: integer("offer_id").notNull().references(() => offersTable.id, { onDelete: "cascade" }),
  drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.offerId, table.drinkId] }),
  };
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true, updatedAt: true }) as any;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
