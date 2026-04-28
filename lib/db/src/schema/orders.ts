import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { drinksTable } from "./drinks";
import { ingredientsTable, ingredientOptionsTable } from "./ingredients";
import { discountsTable } from "./discounts";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  baristaId: integer("barista_id").notNull().references(() => usersTable.id),
  status: text("status", {
    enum: ["pending", "paid", "in_progress", "ready", "completed", "cancelled", "refunded"],
  }).notNull().default("pending"),
  customerName: text("customer_name"),
  subtotal: numeric("subtotal", { precision: 8, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 8, scale: 2 }).notNull().default("0"),
  discountId: integer("discount_id").references(() => discountsTable.id),
  discountCode: text("discount_code"),
  discountValue: numeric("discount_value", { precision: 8, scale: 2 }),
  discountType: text("discount_type", { enum: ["percentage", "fixed"] }),
  total: numeric("total", { precision: 8, scale: 2 }).notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "wallet"] }).notNull().default("cash"),
  amountTendered: numeric("amount_tendered", { precision: 8, scale: 2 }),
  changeDue: numeric("change_due", { precision: 8, scale: 2 }),
  notes: text("notes"),
  cashierId: integer("cashier_id").references(() => usersTable.id, { onDelete: "set null" }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  drinkId: integer("drink_id").notNull().references(() => drinksTable.id),
  drinkName: text("drink_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 8, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 8, scale: 2 }).notNull(),
  specialNotes: text("special_notes"),
  kitchenStation: text("kitchen_station").notNull().default("main"),
  status: text("status", { enum: ["pending", "ready"] }).notNull().default("pending"),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const orderItemCustomizationsTable = pgTable("order_item_customizations", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id").notNull().references(() => orderItemsTable.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id").references(() => ingredientsTable.id), // Nullable for catalog-only items
  optionId: integer("option_id").references(() => ingredientOptionsTable.id, { onDelete: "set null" }), // Nullable for Typed slots
  typeVolumeId: integer("type_volume_id"), // Added for Typed slots tracking
  consumedQty: numeric("consumed_qty", { precision: 10, scale: 4 }).notNull(),
  producedQty: numeric("produced_qty", { precision: 10, scale: 4 }).notNull().default("0"),
  addedCost: numeric("added_cost", { precision: 8, scale: 4 }).notNull(),
  slotLabel: text("slot_label").notNull(),
  optionLabel: text("option_label").notNull(),
  baristaSortOrder: integer("barista_sort_order").notNull().default(1),
  customerSortOrder: integer("customer_sort_order").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type OrderItemCustomization = typeof orderItemCustomizationsTable.$inferSelect;
