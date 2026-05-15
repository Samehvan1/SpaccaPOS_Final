import { db, orderItemsTable, orderPaymentsTable } from "../lib/db/src/index.js";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  try {
    console.log("Adding status 'refunded' and 'cancelled' to order_items...");
    // Since we can't easily update enum types in some DBs without specific SQL, 
    // and Drizzle's push usually handles it, but we're stuck.
    // In Postgres, we might need: ALTER TYPE status_enum ADD VALUE 'refunded';
    // But order_items.status is likely a text field with a check constraint if defined in pgTable as enum.
    // Actually, looking at the schema, it's: text("status", { enum: ["pending", "ready"] })
    // This is just a text field in Postgres unless specifically cast.
    
    console.log("Creating order_payments table if it doesn't exist...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "order_payments" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "payment_method" TEXT NOT NULL,
        "amount" NUMERIC(8, 2) NOT NULL,
        "transaction_id" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "order_payments_order_id_idx" ON "order_payments" ("order_id");
    `);

    console.log("Updating order_items table structure...");
    await db.execute(sql`
      ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "refunded_at" TIMESTAMP WITH TIME ZONE;
      ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "refunded_amount" NUMERIC(8, 2);
    `);
    
    console.log("Database updated successfully.");
    process.exit(0);
  } catch (e) {
    console.error("Error updating database:", e);
    process.exit(1);
  }
}

main();
