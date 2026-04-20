import { pgTable, serial, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  scope: text("scope", { enum: ["global", "user"] }).notNull().default("global"),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(), // JSON stringified value
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  // Unique index for global settings (ensures one 'autoPrint' global setting)
  globalKeyIdx: uniqueIndex("global_key_idx").on(table.key).where(sql`scope = 'global'`),
  // Unique index for per-user settings (ensures one 'autoPrint' per user)
  userKeyIdx: uniqueIndex("user_key_idx").on(table.userId, table.key).where(sql`scope = 'user'`),
}));

export const insertSettingSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settingsTable.$inferSelect;
