CREATE TABLE "branch_drink_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_id" integer NOT NULL,
	"drink_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers_applicable_drinks" (
	"offer_id" integer NOT NULL,
	"drink_id" integer NOT NULL,
	CONSTRAINT "offers_applicable_drinks_offer_id_drink_id_pk" PRIMARY KEY("offer_id","drink_id")
);
--> statement-breakpoint
CREATE TABLE "offers_excluded_drinks" (
	"offer_id" integer NOT NULL,
	"drink_id" integer NOT NULL,
	CONSTRAINT "offers_excluded_drinks_offer_id_drink_id_pk" PRIMARY KEY("offer_id","drink_id")
);
--> statement-breakpoint
CREATE TABLE "offers_reward_drinks" (
	"offer_id" integer NOT NULL,
	"drink_id" integer NOT NULL,
	CONSTRAINT "offers_reward_drinks_offer_id_drink_id_pk" PRIMARY KEY("offer_id","drink_id")
);
--> statement-breakpoint
CREATE TABLE "partner_drink_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"drink_id" integer NOT NULL,
	"branch_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch_drink_status" ADD CONSTRAINT "branch_drink_status_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_drink_status" ADD CONSTRAINT "branch_drink_status_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_applicable_drinks" ADD CONSTRAINT "offers_applicable_drinks_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_applicable_drinks" ADD CONSTRAINT "offers_applicable_drinks_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_excluded_drinks" ADD CONSTRAINT "offers_excluded_drinks_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_excluded_drinks" ADD CONSTRAINT "offers_excluded_drinks_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_reward_drinks" ADD CONSTRAINT "offers_reward_drinks_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_reward_drinks" ADD CONSTRAINT "offers_reward_drinks_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_drink_status" ADD CONSTRAINT "partner_drink_status_partner_id_ordering_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."ordering_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_drink_status" ADD CONSTRAINT "partner_drink_status_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_drink_status" ADD CONSTRAINT "partner_drink_status_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branch_drink_status_idx" ON "branch_drink_status" USING btree ("branch_id","drink_id");--> statement-breakpoint
CREATE INDEX "partner_drink_status_idx" ON "partner_drink_status" USING btree ("partner_id","drink_id","branch_id");