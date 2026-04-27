import { pgTable, serial, integer, timestamp, text } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const cashierSessionsTable = pgTable("cashier_sessions", {
  id: serial("id").primaryKey(),
  cashierId: integer("cashier_id").notNull().references(() => usersTable.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  notes: text("notes"),
});

export type CashierSession = typeof cashierSessionsTable.$inferSelect;
export type InsertCashierSession = typeof cashierSessionsTable.$inferInsert;
