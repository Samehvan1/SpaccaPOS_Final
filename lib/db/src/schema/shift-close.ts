import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { cashierSessionsTable } from "./cashier-sessions";
import { usersTable } from "./users";

export const shiftCloseRecordsTable = pgTable("shift_close_records", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => cashierSessionsTable.id, { onDelete: "cascade" }),
  cashierId: integer("cashier_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),

  cashSystem: numeric("cash_system", { precision: 10, scale: 2 }).notNull().default("0.00"),
  cashCounted: numeric("cash_counted", { precision: 10, scale: 2 }).notNull().default("0.00"),
  cashVariance: numeric("cash_variance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  cashStatus: text("cash_status", { enum: ["ok", "short", "over"] }).notNull().default("ok"),

  cardSystem: numeric("card_system", { precision: 10, scale: 2 }).notNull().default("0.00"),
  cardCounted: numeric("card_counted", { precision: 10, scale: 2 }).notNull().default("0.00"),
  cardVariance: numeric("card_variance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  cardStatus: text("card_status", { enum: ["ok", "short", "over"] }).notNull().default("ok"),

  partnerCardSystem: numeric("partner_card_system", { precision: 10, scale: 2 }).notNull().default("0.00"),
  partnerCardCounted: numeric("partner_card_counted", { precision: 10, scale: 2 }).notNull().default("0.00"),
  partnerCardVariance: numeric("partner_card_variance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  partnerCardStatus: text("partner_card_status", { enum: ["ok", "short", "over"] }).notNull().default("ok"),

  pointsRedeemed: numeric("points_redeemed", { precision: 10, scale: 2 }).notNull().default("0.00"),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ShiftCloseRecord = typeof shiftCloseRecordsTable.$inferSelect;
export type InsertShiftCloseRecord = typeof shiftCloseRecordsTable.$inferInsert;
