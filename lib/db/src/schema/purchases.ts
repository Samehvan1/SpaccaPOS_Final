import { pgTable, serial, text, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { branchesTable } from "./branches";
import { ingredientsTable, ingredientConversionsTable } from "./ingredients";
import { usersTable } from "./users";

export const suppliersTable = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  taxId: text("tax_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const purchasesTable = pgTable("purchases", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  supplierId: integer("supplier_id").notNull().references(() => suppliersTable.id, { onDelete: "restrict" }),
  branchId: integer("branch_id").notNull().references(() => branchesTable.id, { onDelete: "restrict" }),
  status: text("status", { enum: ["draft", "ordered", "received", "cancelled"] }).notNull().default("draft"),
  paymentStatus: text("payment_status", { enum: ["unpaid", "partially_paid", "paid"] }).notNull().default("unpaid"),
  orderDate: timestamp("order_date", { withTimezone: true }),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }),
  totalAmount: numeric("total_amount", { precision: 12, scale: 4 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 4 }).notNull().default("0"),
  notes: text("notes"),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const purchaseItemsTable = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull().references(() => purchasesTable.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredientsTable.id, { onDelete: "restrict" }),
  quantityOrdered: numeric("quantity_ordered", { precision: 12, scale: 4 }).notNull(),
  quantityReceived: numeric("quantity_received", { precision: 12, scale: 4 }).notNull().default("0"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 4 }).notNull(),
  totalCost: numeric("total_cost", { precision: 12, scale: 4 }).notNull(),
  conversionId: integer("conversion_id").references(() => ingredientConversionsTable.id, { onDelete: "set null" }),
  unitName: text("unit_name").notNull().default("pcs"),
});

export const suppliersRelations = relations(suppliersTable, ({ many }) => ({
  purchases: many(purchasesTable),
}));

export const purchasesRelations = relations(purchasesTable, ({ one, many }) => ({
  supplier: one(suppliersTable, {
    fields: [purchasesTable.supplierId],
    references: [suppliersTable.id],
  }),
  branch: one(branchesTable, {
    fields: [purchasesTable.branchId],
    references: [branchesTable.id],
  }),
  items: many(purchaseItemsTable),
  creator: one(usersTable, {
    fields: [purchasesTable.createdBy],
    references: [usersTable.id],
  }),
}));

export const purchaseItemsRelations = relations(purchaseItemsTable, ({ one }) => ({
  purchase: one(purchasesTable, {
    fields: [purchaseItemsTable.purchaseId],
    references: [purchasesTable.id],
  }),
  ingredient: one(ingredientsTable, {
    fields: [purchaseItemsTable.ingredientId],
    references: [ingredientsTable.id],
  }),
  conversion: one(ingredientConversionsTable, {
    fields: [purchaseItemsTable.conversionId],
    references: [ingredientConversionsTable.id],
  }),
}));

export const insertSupplierSchema = createInsertSchema(suppliersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseSchema = createInsertSchema(purchasesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseItemSchema = createInsertSchema(purchaseItemsTable).omit({ id: true });

export type Supplier = typeof suppliersTable.$inferSelect;
export type Purchase = typeof purchasesTable.$inferSelect;
export type PurchaseItem = typeof purchaseItemsTable.$inferSelect;
