-- Migration: Add Cashier Session Module
-- Run this on your VPS with the Docker command below:
--
--   docker exec -i spacca-db psql -U postgres -d spacca_prod < scripts/src/migrations/add-cashier-session.sql
--

-- 1. Add cashier_id to existing orders table (nullable, safe for existing data)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cashier_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 2. Create cashier_sessions table
CREATE TABLE IF NOT EXISTS cashier_sessions (
  id          SERIAL PRIMARY KEY,
  cashier_id  INTEGER NOT NULL REFERENCES users(id),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  notes       TEXT
);

-- 3. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cashier_sessions_cashier_id ON cashier_sessions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_cashier_sessions_started_at ON cashier_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_orders_cashier_id ON orders(cashier_id);
