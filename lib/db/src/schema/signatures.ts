import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { ordersTable, orderItemsTable } from "./orders";

export const signaturesTable = pgTable("signatures", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  orderItemId: integer("order_item_id").references(() => orderItemsTable.id, { onDelete: "cascade" }), // For phase 2 (per drink)
  signatureData: text("signature_data").notNull(), // Base64 image data or SVG path
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
