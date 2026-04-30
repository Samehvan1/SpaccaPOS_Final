ALTER TABLE "cashier_sessions" ADD COLUMN IF NOT EXISTS "ip_address" text;--> statement-breakpoint
ALTER TABLE "cashier_sessions" ADD COLUMN IF NOT EXISTS "user_agent" text;