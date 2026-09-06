import { pgTable, serial, text, varchar, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { discountsTable } from "./discounts";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash"), // Optional if created from POS
  pin: varchar("pin", { length: 60 }), // Mobile app PIN (bcrypt hash, optional)
  otp: text("otp"), // Mobile app OTP code (temporary)
  otpExpiresAt: timestamp("otp_expires_at", { withTimezone: true }), // OTP expiry
  // ── Extended customer profile (mobile app) ──
  birthdate: date("birthdate"), // Customer date of birth
  gender: text("gender", { enum: ["male", "female", "other", "prefer_not_to_say"] }), // Customer gender
  avatarUrl: text("avatar_url"), // Profile avatar image URL
  preferredBranchId: integer("preferred_branch_id"), // Preferred branch (set in app)
  address: text("address"), // Customer address
  city: text("city"), // Customer city
  loyaltyTier: text("loyalty_tier", { enum: ["bronze", "silver", "gold", "platinum"] }).notNull().default("bronze"), // Loyalty tier
  // ── Loyalty / stats ──
  points: integer("points").notNull().default(0),
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).notNull().default("0"),
  visitCount: integer("visit_count").notNull().default(0),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  discountId: integer("discount_id").references(() => discountsTable.id),
});

