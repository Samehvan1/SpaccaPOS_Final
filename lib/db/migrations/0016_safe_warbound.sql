CREATE TABLE "branch_drink_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_id" integer NOT NULL,
	"drink_id" integer NOT NULL,
	"price" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_drink_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"drink_id" integer NOT NULL,
	"branch_id" integer,
	"price" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordering_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" varchar(50) NOT NULL,
	"commission_type" text DEFAULT 'percentage' NOT NULL,
	"commission_value" numeric(8, 2) DEFAULT '0.00' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ordering_partners_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "partner_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "commission_rate" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "commission_amount" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "net_amount" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "branch_drink_prices" ADD CONSTRAINT "branch_drink_prices_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_drink_prices" ADD CONSTRAINT "branch_drink_prices_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_drink_prices" ADD CONSTRAINT "partner_drink_prices_partner_id_ordering_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."ordering_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_drink_prices" ADD CONSTRAINT "partner_drink_prices_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_drink_prices" ADD CONSTRAINT "partner_drink_prices_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branch_drink_prices_branch_drink_idx" ON "branch_drink_prices" USING btree ("branch_id","drink_id");--> statement-breakpoint
CREATE INDEX "partner_drink_prices_idx" ON "partner_drink_prices" USING btree ("partner_id","drink_id","branch_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_partner_id_ordering_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."ordering_partners"("id") ON DELETE set null ON UPDATE no action;