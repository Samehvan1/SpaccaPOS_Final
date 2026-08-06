CREATE TABLE "shift_close_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"cashier_id" integer NOT NULL,
	"cash_system" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"cash_counted" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"cash_variance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"cash_status" text DEFAULT 'ok' NOT NULL,
	"card_system" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"card_counted" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"card_variance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"card_status" text DEFAULT 'ok' NOT NULL,
	"partner_card_system" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"partner_card_counted" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"partner_card_variance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"partner_card_status" text DEFAULT 'ok' NOT NULL,
	"points_redeemed" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shift_close_records" ADD CONSTRAINT "shift_close_records_session_id_cashier_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."cashier_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_close_records" ADD CONSTRAINT "shift_close_records_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
