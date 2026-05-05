ALTER TABLE "branch_stock" ADD COLUMN IF NOT EXISTS "startup_quantity" numeric(12, 4) DEFAULT '0' NOT NULL;
