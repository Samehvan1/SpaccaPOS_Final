import { pgTable, serial, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const permissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(), // e.g. "orders:view", "inventory:edit"
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).unique().notNull(), // e.g. "admin", "barista"
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rolePermissionsTable = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleKey: varchar("role_key", { length: 50 }).references(() => rolesTable.key).notNull(),
  permissionKey: varchar("permission_key", { length: 100 }).references(() => permissionsTable.key).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userPermissionsTable = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  permissionKey: varchar("permission_key", { length: 100 }).references(() => permissionsTable.key).notNull(),
  granted: boolean("granted").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPermissionSchema = createInsertSchema(permissionsTable).omit({ id: true, createdAt: true });
export const insertRoleSchema = createInsertSchema(rolesTable).omit({ id: true, createdAt: true });
export const insertRolePermissionSchema = createInsertSchema(rolePermissionsTable).omit({ id: true, createdAt: true });
export const insertUserPermissionSchema = createInsertSchema(userPermissionsTable).omit({ id: true, createdAt: true });

export type Permission = typeof permissionsTable.$inferSelect;
export type Role = typeof rolesTable.$inferSelect;
export type RolePermission = typeof rolePermissionsTable.$inferSelect;
export type UserPermission = typeof userPermissionsTable.$inferSelect;
