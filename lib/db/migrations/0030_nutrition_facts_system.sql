CREATE TABLE IF NOT EXISTS "ingredient_nutrition" (
  "ingredient_id" integer PRIMARY KEY NOT NULL REFERENCES "ingredients"("id") ON DELETE cascade,
  "serving_size_qty" numeric(10, 4) DEFAULT '1' NOT NULL,
  "serving_size_unit" text DEFAULT 'unit' NOT NULL,
  "calories" numeric(10, 2) DEFAULT '0' NOT NULL,
  "protein" numeric(10, 2) DEFAULT '0' NOT NULL,
  "total_carbs" numeric(10, 2) DEFAULT '0' NOT NULL,
  "dietary_fiber" numeric(10, 2) DEFAULT '0' NOT NULL,
  "total_sugars" numeric(10, 2) DEFAULT '0' NOT NULL,
  "added_sugars" numeric(10, 2) DEFAULT '0' NOT NULL,
  "total_fat" numeric(10, 2) DEFAULT '0' NOT NULL,
  "saturated_fat" numeric(10, 2) DEFAULT '0' NOT NULL,
  "trans_fat" numeric(10, 2) DEFAULT '0' NOT NULL,
  "cholesterol" numeric(10, 2) DEFAULT '0' NOT NULL,
  "sodium" numeric(10, 2) DEFAULT '0' NOT NULL,
  "caffeine" numeric(10, 2) DEFAULT '0' NOT NULL,
  "allergens" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "customer_nutrition_goals" (
  "customer_id" integer PRIMARY KEY NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
  "daily_calorie_goal" integer DEFAULT 2000 NOT NULL,
  "daily_caffeine_limit" integer DEFAULT 400 NOT NULL,
  "daily_sugar_limit" integer DEFAULT 50 NOT NULL,
  "daily_protein_goal" integer DEFAULT 50 NOT NULL,
  "daily_carb_limit" integer,
  "daily_fat_limit" integer,
  "dietary_preferences" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "customer_nutrition_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "customer_id" integer NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
  "order_id" integer REFERENCES "orders"("id") ON DELETE set null,
  "order_item_id" integer REFERENCES "order_items"("id") ON DELETE set null,
  "drink_id" integer REFERENCES "drinks"("id") ON DELETE set null,
  "drink_name" text NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "consumed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "calories" numeric(10, 2) DEFAULT '0' NOT NULL,
  "protein" numeric(10, 2) DEFAULT '0' NOT NULL,
  "total_carbs" numeric(10, 2) DEFAULT '0' NOT NULL,
  "dietary_fiber" numeric(10, 2) DEFAULT '0' NOT NULL,
  "total_sugars" numeric(10, 2) DEFAULT '0' NOT NULL,
  "added_sugars" numeric(10, 2) DEFAULT '0' NOT NULL,
  "total_fat" numeric(10, 2) DEFAULT '0' NOT NULL,
  "saturated_fat" numeric(10, 2) DEFAULT '0' NOT NULL,
  "trans_fat" numeric(10, 2) DEFAULT '0' NOT NULL,
  "cholesterol" numeric(10, 2) DEFAULT '0' NOT NULL,
  "sodium" numeric(10, 2) DEFAULT '0' NOT NULL,
  "caffeine" numeric(10, 2) DEFAULT '0' NOT NULL,
  "allergens" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "nutrition_details" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "nutrition_summary" jsonb;

CREATE INDEX IF NOT EXISTS "customer_nutrition_logs_customer_consumed_idx" ON "customer_nutrition_logs" ("customer_id", "consumed_at");
CREATE INDEX IF NOT EXISTS "customer_nutrition_logs_order_id_idx" ON "customer_nutrition_logs" ("order_id");
