CREATE TABLE "offers_branches" (
	"offer_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	CONSTRAINT "offers_branches_offer_id_branch_id_pk" PRIMARY KEY("offer_id","branch_id")
);
--> statement-breakpoint
CREATE TABLE "offers_partners" (
	"offer_id" integer NOT NULL,
	"partner_id" integer NOT NULL,
	CONSTRAINT "offers_partners_offer_id_partner_id_pk" PRIMARY KEY("offer_id","partner_id")
);
--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "apply_to_store" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "apply_to_all_partners" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "offers_branches" ADD CONSTRAINT "offers_branches_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_branches" ADD CONSTRAINT "offers_branches_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_partners" ADD CONSTRAINT "offers_partners_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers_partners" ADD CONSTRAINT "offers_partners_partner_id_ordering_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."ordering_partners"("id") ON DELETE cascade ON UPDATE no action;