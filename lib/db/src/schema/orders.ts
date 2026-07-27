import { pgTable, serial, text, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";
import { drinksTable, kitchenStationsTable } from "./drinks";
import { ingredientsTable, ingredientOptionsTable } from "./ingredients";
import { discountsTable } from "./discounts";
import { branchesTable } from "./branches";
import { offersTable } from "./offers";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").notNull().references(() => branchesTable.id),
  orderNumber: text("order_number").notNull().unique(),
  baristaId: integer("barista_id").notNull().references(() => usersTable.id),
  status: text("status", {
    enum: ["pending", "paid", "in_progress", "ready", "completed", "cancelled", "refunded"],
  }).notNull().default("pending"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  subtotal: numeric("subtotal", { precision: 8, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 8, scale: 2 }).notNull().default("0"),
  discountId: integer("discount_id").references(() => discountsTable.id),
  discountCode: text("discount_code"),
  discountValue: numeric("discount_value", { precision: 8, scale: 2 }),
  discountType: text("discount_type", { enum: ["percentage", "fixed", "fixed_per_item"] }),
  offerId: integer("offer_id").references(() => offersTable.id),
  offerDiscount: numeric("offer_discount", { precision: 8, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 8, scale: 2 }).notNull(),

  paymentMethod: text("payment_method", { enum: ["cash", "card", "wallet", "hospitality", "split", "refund", "points"] }).notNull().default("cash"),
  source: text("source", { enum: ["pos", "kiosk", "web", "mobile"] }).notNull().default("pos"),
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
}, (table) => {
  return {
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
    statusIdx: index("orders_status_idx").on(table.status),
  };
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
  kitchenStationId: integer("kitchen_station_id").references(() => kitchenStationsTable.id),
  status: text("status", { enum: ["pending", "ready", "refunded", "cancelled"] }).notNull().default("pending"),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  refundedAmount: numeric("refunded_amount", { precision: 8, scale: 2 }),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
  };
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
  costPerUnit: numeric("cost_per_unit", { precision: 10, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    orderItemIdIdx: index("order_item_customizations_item_id_idx").on(table.orderItemId),
  };
});

export const orderPaymentsTable = pgTable("order_payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "wallet", "hospitality", "refund", "points"] }).notNull(),
  amount: numeric("amount", { precision: 8, scale: 2 }).notNull(),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    orderIdIdx: index("order_payments_order_id_idx").on(table.orderId),
  };
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true }) as any;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type OrderItemCustomization = typeof orderItemCustomizationsTable.$inferSelect;
