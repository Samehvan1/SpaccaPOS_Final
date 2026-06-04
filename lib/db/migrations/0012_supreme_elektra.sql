CREATE TABLE "purchase_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantity_ordered" numeric(12, 4) NOT NULL,
	"quantity_received" numeric(12, 4) DEFAULT '0' NOT NULL,
	"unit_price" numeric(12, 4) NOT NULL,
	"total_cost" numeric(12, 4) NOT NULL,
	"conversion_id" integer,
	"unit_name" text DEFAULT 'pcs' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"po_number" text NOT NULL,
	"supplier_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"order_date" timestamp with time zone,
	"delivery_date" timestamp with time zone,
	"total_amount" numeric(12, 4) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(12, 4) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"phone" text,
	"email" text,
	"address" text,
	"tax_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_conversion_id_ingredient_conversions_id_fk" FOREIGN KEY ("conversion_id") REFERENCES "public"."ingredient_conversions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;