CREATE TABLE IF NOT EXISTS "order_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"payment_method" text NOT NULL,
	"amount" numeric(8, 2) NOT NULL,
	"transaction_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='refunded_at') THEN
        ALTER TABLE "order_items" ADD COLUMN "refunded_at" timestamp with time zone;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='refunded_amount') THEN
        ALTER TABLE "order_items" ADD COLUMN "refunded_amount" numeric(8, 2);
    END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='order_payments_order_id_orders_id_fk') THEN
        ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_payments_order_id_idx" ON "order_payments" USING btree ("order_id");