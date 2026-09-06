-- Migration 0028: Branch coordinates (mobile app nearest-branch feature)
-- Adds latitude/longitude to the branches table so the customer mobile app can
-- determine the nearest branch to the customer's current location.

ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "latitude" double precision;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "longitude" double precision;

-- Seed coordinates for known branches (Palm Hills - New Giza, Cairo, Egypt).
-- Hale Town / MAIN branch.
UPDATE "branches"
SET "latitude" = 29.9764, "longitude" = 31.1316
WHERE "code" = 'MAIN' AND "latitude" IS NULL;
