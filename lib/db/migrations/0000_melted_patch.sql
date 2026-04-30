CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" varchar(50),
	"password_hash" text,
	"role" text DEFAULT 'barista' NOT NULL,
	"pin" varchar(6),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredient_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredient_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"ingredient_id" integer NOT NULL,
	"label" text NOT NULL,
	"processed_qty" numeric(10, 4) NOT NULL,
	"produced_qty" numeric(10, 4) NOT NULL,
	"produced_unit" text NOT NULL,
	"extra_cost" numeric(8, 4) DEFAULT '0' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"linked_ingredient_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredient_type_volumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"ingredient_type_id" integer NOT NULL,
	"volume_id" integer NOT NULL,
	"processed_qty" numeric(10, 4),
	"produced_qty" numeric(10, 4),
	"unit" text,
	"extra_cost" numeric(8, 4) DEFAULT '0' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredient_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"inventory_ingredient_id" integer,
	"processed_qty" numeric(10, 4) DEFAULT '0' NOT NULL,
	"produced_qty" numeric(10, 4) DEFAULT '0' NOT NULL,
	"unit" text DEFAULT 'ml' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"affects_cup_size" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"color" text,
	"extra_cost" numeric(8, 4) DEFAULT '0' NOT NULL,
	"pricing_mode" text DEFAULT 'volume' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredient_volumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"processed_qty" numeric(10, 4) DEFAULT '0' NOT NULL,
	"produced_qty" numeric(10, 4) DEFAULT '0' NOT NULL,
	"unit" text DEFAULT 'ml' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"ingredient_type" text NOT NULL,
	"unit" text NOT NULL,
	"cost_per_unit" numeric(10, 4) NOT NULL,
	"stock_quantity" numeric(12, 4) DEFAULT '0' NOT NULL,
	"low_stock_threshold" numeric(12, 4) DEFAULT '500' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drink_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drink_ingredient_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"drink_id" integer NOT NULL,
	"ingredient_id" integer,
	"ingredient_type_id" integer,
	"slot_label" text NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"default_option_id" integer,
	"is_dynamic" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"barista_sort_order" integer DEFAULT 1 NOT NULL,
	"customer_sort_order" integer DEFAULT 1 NOT NULL,
	"affects_cup_size" boolean,
	"predefined_slot_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drink_slot_type_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot_id" integer NOT NULL,
	"ingredient_type_id" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"processed_qty" numeric(10, 4),
	"produced_qty" numeric(10, 4),
	"unit" text,
	"extra_cost" numeric(8, 4),
	"pricing_mode" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drink_slot_volumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot_id" integer NOT NULL,
	"type_volume_id" integer NOT NULL,
	"processed_qty" numeric(10, 4),
	"produced_qty" numeric(10, 4),
	"unit" text,
	"extra_cost" numeric(8, 4),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"category_id" integer,
	"base_price" numeric(8, 2) NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"prep_time_seconds" integer DEFAULT 180 NOT NULL,
	"cup_size_ml" integer,
	"cup_ingredient_id" integer,
	"is_customizable" boolean DEFAULT true NOT NULL,
	"kitchen_station" text DEFAULT 'main' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kitchen_stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "predefined_slot_type_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"predefined_slot_id" integer NOT NULL,
	"ingredient_type_id" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"processed_qty" numeric(10, 4),
	"produced_qty" numeric(10, 4),
	"unit" text,
	"extra_cost" numeric(8, 4),
	"pricing_mode" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "predefined_slot_volumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"predefined_slot_id" integer NOT NULL,
	"type_volume_id" integer NOT NULL,
	"processed_qty" numeric(10, 4),
	"produced_qty" numeric(10, 4),
	"unit" text,
	"extra_cost" numeric(8, 4),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "predefined_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slot_label" text NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"is_dynamic" boolean DEFAULT false NOT NULL,
	"affects_cup_size" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_item_customizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer NOT NULL,
	"ingredient_id" integer,
	"option_id" integer,
	"type_volume_id" integer,
	"consumed_qty" numeric(10, 4) NOT NULL,
	"produced_qty" numeric(10, 4) DEFAULT '0' NOT NULL,
	"added_cost" numeric(8, 4) NOT NULL,
	"slot_label" text NOT NULL,
	"option_label" text NOT NULL,
	"barista_sort_order" integer DEFAULT 1 NOT NULL,
	"customer_sort_order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"drink_id" integer NOT NULL,
	"drink_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(8, 2) NOT NULL,
	"line_total" numeric(8, 2) NOT NULL,
	"special_notes" text,
	"kitchen_station" text DEFAULT 'main' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"ready_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"barista_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"customer_name" text,
	"subtotal" numeric(8, 2) NOT NULL,
	"discount" numeric(8, 2) DEFAULT '0' NOT NULL,
	"discount_id" integer,
	"discount_code" text,
	"discount_value" numeric(8, 2),
	"discount_type" text,
	"total" numeric(8, 2) NOT NULL,
	"payment_method" text DEFAULT 'cash' NOT NULL,
	"amount_tendered" numeric(8, 2),
	"change_due" numeric(8, 2),
	"notes" text,
	"cashier_id" integer,
	"paid_at" timestamp with time zone,
	"ready_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"ingredient_id" integer NOT NULL,
	"order_id" integer,
	"movement_type" text NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"quantity_after" numeric(12, 4) NOT NULL,
	"note" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"scope" text DEFAULT 'global' NOT NULL,
	"user_id" integer,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" numeric(8, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cashier_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"cashier_id" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"permission_key" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" integer,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp (6) NOT NULL
);
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_username_unique"; ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "ingredients" DROP CONSTRAINT IF EXISTS "ingredients_slug_unique"; ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "drink_categories" DROP CONSTRAINT IF EXISTS "drink_categories_name_unique"; ALTER TABLE "drink_categories" ADD CONSTRAINT "drink_categories_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "kitchen_stations" DROP CONSTRAINT IF EXISTS "kitchen_stations_name_unique"; ALTER TABLE "kitchen_stations" ADD CONSTRAINT "kitchen_stations_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_order_number_unique"; ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");--> statement-breakpoint
ALTER TABLE "discounts" DROP CONSTRAINT IF EXISTS "discounts_code_unique"; ALTER TABLE "discounts" ADD CONSTRAINT "discounts_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "permissions" DROP CONSTRAINT IF EXISTS "permissions_key_unique"; ALTER TABLE "permissions" ADD CONSTRAINT "permissions_key_unique" UNIQUE("key");--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "ingredient_options" DROP CONSTRAINT IF EXISTS "ingredient_options_ingredient_id_ingredients_id_fk"; ALTER TABLE "ingredient_options" ADD CONSTRAINT "ingredient_options_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_options" DROP CONSTRAINT IF EXISTS "ingredient_options_linked_ingredient_id_ingredients_id_fk"; ALTER TABLE "ingredient_options" ADD CONSTRAINT "ingredient_options_linked_ingredient_id_ingredients_id_fk" FOREIGN KEY ("linked_ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_type_volumes" DROP CONSTRAINT IF EXISTS "ingredient_type_volumes_ingredient_type_id_ingredient_types_id_fk"; ALTER TABLE "ingredient_type_volumes" ADD CONSTRAINT "ingredient_type_volumes_ingredient_type_id_ingredient_types_id_fk" FOREIGN KEY ("ingredient_type_id") REFERENCES "public"."ingredient_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_type_volumes" DROP CONSTRAINT IF EXISTS "ingredient_type_volumes_volume_id_ingredient_volumes_id_fk"; ALTER TABLE "ingredient_type_volumes" ADD CONSTRAINT "ingredient_type_volumes_volume_id_ingredient_volumes_id_fk" FOREIGN KEY ("volume_id") REFERENCES "public"."ingredient_volumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_types" DROP CONSTRAINT IF EXISTS "ingredient_types_category_id_ingredient_categories_id_fk"; ALTER TABLE "ingredient_types" ADD CONSTRAINT "ingredient_types_category_id_ingredient_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ingredient_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_types" DROP CONSTRAINT IF EXISTS "ingredient_types_inventory_ingredient_id_ingredients_id_fk"; ALTER TABLE "ingredient_types" ADD CONSTRAINT "ingredient_types_inventory_ingredient_id_ingredients_id_fk" FOREIGN KEY ("inventory_ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_ingredient_slots" DROP CONSTRAINT IF EXISTS "drink_ingredient_slots_drink_id_drinks_id_fk"; ALTER TABLE "drink_ingredient_slots" ADD CONSTRAINT "drink_ingredient_slots_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_ingredient_slots" DROP CONSTRAINT IF EXISTS "drink_ingredient_slots_ingredient_id_ingredients_id_fk"; ALTER TABLE "drink_ingredient_slots" ADD CONSTRAINT "drink_ingredient_slots_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_ingredient_slots" DROP CONSTRAINT IF EXISTS "drink_ingredient_slots_ingredient_type_id_ingredient_types_id_fk"; ALTER TABLE "drink_ingredient_slots" ADD CONSTRAINT "drink_ingredient_slots_ingredient_type_id_ingredient_types_id_fk" FOREIGN KEY ("ingredient_type_id") REFERENCES "public"."ingredient_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_ingredient_slots" DROP CONSTRAINT IF EXISTS "drink_ingredient_slots_default_option_id_ingredient_options_id_fk"; ALTER TABLE "drink_ingredient_slots" ADD CONSTRAINT "drink_ingredient_slots_default_option_id_ingredient_options_id_fk" FOREIGN KEY ("default_option_id") REFERENCES "public"."ingredient_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_slot_type_options" DROP CONSTRAINT IF EXISTS "drink_slot_type_options_slot_id_drink_ingredient_slots_id_fk"; ALTER TABLE "drink_slot_type_options" ADD CONSTRAINT "drink_slot_type_options_slot_id_drink_ingredient_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."drink_ingredient_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_slot_type_options" DROP CONSTRAINT IF EXISTS "drink_slot_type_options_ingredient_type_id_ingredient_types_id_fk"; ALTER TABLE "drink_slot_type_options" ADD CONSTRAINT "drink_slot_type_options_ingredient_type_id_ingredient_types_id_fk" FOREIGN KEY ("ingredient_type_id") REFERENCES "public"."ingredient_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_slot_volumes" DROP CONSTRAINT IF EXISTS "drink_slot_volumes_slot_id_drink_ingredient_slots_id_fk"; ALTER TABLE "drink_slot_volumes" ADD CONSTRAINT "drink_slot_volumes_slot_id_drink_ingredient_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."drink_ingredient_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_slot_volumes" DROP CONSTRAINT IF EXISTS "drink_slot_volumes_type_volume_id_ingredient_type_volumes_id_fk"; ALTER TABLE "drink_slot_volumes" ADD CONSTRAINT "drink_slot_volumes_type_volume_id_ingredient_type_volumes_id_fk" FOREIGN KEY ("type_volume_id") REFERENCES "public"."ingredient_type_volumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drinks" DROP CONSTRAINT IF EXISTS "drinks_category_id_drink_categories_id_fk"; ALTER TABLE "drinks" ADD CONSTRAINT "drinks_category_id_drink_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."drink_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drinks" DROP CONSTRAINT IF EXISTS "drinks_cup_ingredient_id_ingredients_id_fk"; ALTER TABLE "drinks" ADD CONSTRAINT "drinks_cup_ingredient_id_ingredients_id_fk" FOREIGN KEY ("cup_ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predefined_slot_type_options" DROP CONSTRAINT IF EXISTS "predefined_slot_type_options_predefined_slot_id_predefined_slots_id_fk"; ALTER TABLE "predefined_slot_type_options" ADD CONSTRAINT "predefined_slot_type_options_predefined_slot_id_predefined_slots_id_fk" FOREIGN KEY ("predefined_slot_id") REFERENCES "public"."predefined_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predefined_slot_type_options" DROP CONSTRAINT IF EXISTS "predefined_slot_type_options_ingredient_type_id_ingredient_types_id_fk"; ALTER TABLE "predefined_slot_type_options" ADD CONSTRAINT "predefined_slot_type_options_ingredient_type_id_ingredient_types_id_fk" FOREIGN KEY ("ingredient_type_id") REFERENCES "public"."ingredient_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predefined_slot_volumes" DROP CONSTRAINT IF EXISTS "predefined_slot_volumes_predefined_slot_id_predefined_slots_id_fk"; ALTER TABLE "predefined_slot_volumes" ADD CONSTRAINT "predefined_slot_volumes_predefined_slot_id_predefined_slots_id_fk" FOREIGN KEY ("predefined_slot_id") REFERENCES "public"."predefined_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predefined_slot_volumes" DROP CONSTRAINT IF EXISTS "predefined_slot_volumes_type_volume_id_ingredient_type_volumes_id_fk"; ALTER TABLE "predefined_slot_volumes" ADD CONSTRAINT "predefined_slot_volumes_type_volume_id_ingredient_type_volumes_id_fk" FOREIGN KEY ("type_volume_id") REFERENCES "public"."ingredient_type_volumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_customizations" DROP CONSTRAINT IF EXISTS "order_item_customizations_order_item_id_order_items_id_fk"; ALTER TABLE "order_item_customizations" ADD CONSTRAINT "order_item_customizations_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_customizations" DROP CONSTRAINT IF EXISTS "order_item_customizations_ingredient_id_ingredients_id_fk"; ALTER TABLE "order_item_customizations" ADD CONSTRAINT "order_item_customizations_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_customizations" DROP CONSTRAINT IF EXISTS "order_item_customizations_option_id_ingredient_options_id_fk"; ALTER TABLE "order_item_customizations" ADD CONSTRAINT "order_item_customizations_option_id_ingredient_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."ingredient_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_order_id_orders_id_fk"; ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_drink_id_drinks_id_fk"; ALTER TABLE "order_items" ADD CONSTRAINT "order_items_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_barista_id_users_id_fk"; ALTER TABLE "orders" ADD CONSTRAINT "orders_barista_id_users_id_fk" FOREIGN KEY ("barista_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_discount_id_discounts_id_fk"; ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_cashier_id_users_id_fk"; ALTER TABLE "orders" ADD CONSTRAINT "orders_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" DROP CONSTRAINT IF EXISTS "stock_movements_ingredient_id_ingredients_id_fk"; ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" DROP CONSTRAINT IF EXISTS "stock_movements_order_id_orders_id_fk"; ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" DROP CONSTRAINT IF EXISTS "stock_movements_created_by_users_id_fk"; ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" DROP CONSTRAINT IF EXISTS "settings_user_id_users_id_fk"; ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cashier_sessions" DROP CONSTRAINT IF EXISTS "cashier_sessions_cashier_id_users_id_fk"; ALTER TABLE "cashier_sessions" ADD CONSTRAINT "cashier_sessions_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_permission_key_permissions_key_fk"; ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_key_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."permissions"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_user_id_users_id_fk"; ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "drink_ingredient_slots_drink_id_idx" ON "drink_ingredient_slots" USING btree ("drink_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "drink_slot_type_options_slot_id_idx" ON "drink_slot_type_options" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "drink_slot_volumes_slot_id_idx" ON "drink_slot_volumes" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "drinks_category_id_idx" ON "drinks" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "drinks_is_active_idx" ON "drinks" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_item_customizations_item_id_idx" ON "order_item_customizations" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "global_key_idx" ON "settings" USING btree ("key") WHERE scope = 'global';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_key_idx" ON "settings" USING btree ("user_id","key") WHERE scope = 'user';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" USING btree ("expire");