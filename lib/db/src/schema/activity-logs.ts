import { pgTable, serial, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  action: text("action").notNull(), // e.g. "LOGIN", "CREATE_ORDER", "DELETE_INGREDIENT"
  entityType: text("entity_type"), // e.g. "order", "ingredient", "user"
  entityId: integer("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogsTable).omit({ id: true, createdAt: true });
export type ActivityLog = typeof activityLogsTable.$inferSelect;
