ALTER TABLE "boms" ADD COLUMN IF NOT EXISTS "is_live_prepare" boolean DEFAULT false NOT NULL;
