-- Migration 0029: Add isFeatured flag to drinks for mobile app featured products section

ALTER TABLE "drinks" ADD COLUMN IF NOT EXISTS "is_featured" boolean NOT NULL DEFAULT false;
