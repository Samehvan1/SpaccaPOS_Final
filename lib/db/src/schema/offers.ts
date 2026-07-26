import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  buyAmount: integer("buy_amount").notNull(), // N
  freeAmount: integer("free_amount").notNull(), // X
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true, updatedAt: true }) as any;
export type InsertOffer = any;
export type Offer = typeof offersTable.$inferSelect;
