-- Migration 0026: Mobile App Features (OTP/PIN auth, favorites, saved drinks, friends)

-- 1. Add mobile auth columns to customers table
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "pin" varchar(60);
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "otp" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "otp_expires_at" timestamptz;

-- 2. Customer favorites (saved drinks)
CREATE TABLE IF NOT EXISTS "customer_favorites" (
  "id" serial PRIMARY KEY NOT NULL,
  "customer_id" integer NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "drink_id" integer NOT NULL REFERENCES "drinks"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "customer_favorites_customer_drink_idx" ON "customer_favorites" ("customer_id", "drink_id");
CREATE INDEX IF NOT EXISTS "customer_favorites_customer_idx" ON "customer_favorites" ("customer_id");

-- 3. Customer saved customized drinks
CREATE TABLE IF NOT EXISTS "customer_saved_drinks" (
  "id" serial PRIMARY KEY NOT NULL,
  "customer_id" integer NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "drink_id" integer NOT NULL REFERENCES "drinks"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "selections" jsonb NOT NULL DEFAULT '[]',
  "quantity" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "customer_saved_drinks_customer_idx" ON "customer_saved_drinks" ("customer_id");

-- 4. Customer friends
CREATE TABLE IF NOT EXISTS "customer_friends" (
  "id" serial PRIMARY KEY NOT NULL,
  "customer_id" integer NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "friend_customer_id" integer NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "friend_name" text NOT NULL,
  "friend_phone" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "customer_friends_customer_friend_idx" ON "customer_friends" ("customer_id", "friend_customer_id");
CREATE INDEX IF NOT EXISTS "customer_friends_customer_idx" ON "customer_friends" ("customer_id");
