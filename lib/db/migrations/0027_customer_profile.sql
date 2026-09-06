-- Migration 0027: Extended Customer Profile (mobile app)
-- Adds richer profile fields to the customers table for the customer mobile app.

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "birthdate" date;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "gender" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "avatar_url" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "preferred_branch_id" integer;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "address" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "loyalty_tier" text NOT NULL DEFAULT 'bronze';

-- Optional FK for preferred branch (only if the column was just added / table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'preferred_branch_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_preferred_branch_id_fkey') THEN
      ALTER TABLE "customers"
        ADD CONSTRAINT "customers_preferred_branch_id_fkey"
        FOREIGN KEY ("preferred_branch_id") REFERENCES "branches"("id") ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
