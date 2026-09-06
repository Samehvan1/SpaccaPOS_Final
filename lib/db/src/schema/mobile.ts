import { pgTable, serial, text, integer, timestamp, boolean, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { customersTable } from "./customers";
import { drinksTable } from "./drinks";

/**
 * Customer favorites (saved drinks).
 * A customer can favorite a drink for quick access.
 */
export const customerFavoritesTable = pgTable(
  "customer_favorites",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
    drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerDrinkIdx: uniqueIndex("customer_favorites_customer_drink_idx").on(table.customerId, table.drinkId),
    customerIdx: index("customer_favorites_customer_idx").on(table.customerId),
  }),
);

/**
 * Customer saved customized drinks.
 * Stores a drink with its customization selections so the customer can reorder quickly.
 */
export const customerSavedDrinksTable = pgTable(
  "customer_saved_drinks",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
    drinkId: integer("drink_id").notNull().references(() => drinksTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // User-provided name for the saved drink
    selections: jsonb("selections").notNull().default([]), // Array of customization selections
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    customerIdx: index("customer_saved_drinks_customer_idx").on(table.customerId),
  }),
);

/**
 * Customer friends.
 * A customer can add other customers (by phone) as friends.
 */
export const customerFriendsTable = pgTable(
  "customer_friends",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
    friendCustomerId: integer("friend_customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
    friendName: text("friend_name").notNull(), // Snapshot of friend's name at add time
    friendPhone: text("friend_phone").notNull(), // Snapshot of friend's phone
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerFriendIdx: uniqueIndex("customer_friends_customer_friend_idx").on(table.customerId, table.friendCustomerId),
    customerIdx: index("customer_friends_customer_idx").on(table.customerId),
  }),
);

export type CustomerFavorite = typeof customerFavoritesTable.$inferSelect;
export type CustomerSavedDrink = typeof customerSavedDrinksTable.$inferSelect;
export type CustomerFriend = typeof customerFriendsTable.$inferSelect;
