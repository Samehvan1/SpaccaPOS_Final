ALTER TABLE "discounts" ADD COLUMN IF NOT EXISTS "is_taxable" boolean DEFAULT false NOT NULL;
ALTER TABLE "product_drink_discounts" ADD COLUMN IF NOT EXISTS "is_taxable" boolean DEFAULT false NOT NULL;
ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "promo_label" text;
