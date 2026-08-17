import { db, ordersTable, orderPaymentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger.js";

export async function runDataMigrations() {
  try {
    logger.info("[migration] Ensuring shift_close_records table exists...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "shift_close_records" (
        "id" serial PRIMARY KEY NOT NULL,
        "session_id" integer NOT NULL REFERENCES "cashier_sessions"("id") ON DELETE CASCADE,
        "cashier_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "cash_system" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "cash_counted" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "cash_variance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "cash_status" text DEFAULT 'ok' NOT NULL,
        "card_system" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "card_counted" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "card_variance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "card_status" text DEFAULT 'ok' NOT NULL,
        "partner_card_system" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "partner_card_counted" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "partner_card_variance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "partner_card_status" text DEFAULT 'ok' NOT NULL,
        "points_redeemed" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "notes" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    logger.info("[migration] Ensuring product_drink_discounts table exists...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "product_drink_discounts" (
        "id" serial PRIMARY KEY NOT NULL,
        "drink_id" integer NOT NULL REFERENCES "drinks"("id") ON DELETE CASCADE,
        "branch_id" integer REFERENCES "branches"("id") ON DELETE CASCADE,
        "partner_id" integer REFERENCES "ordering_partners"("id") ON DELETE CASCADE,
        "discount_type" text DEFAULT 'percentage' NOT NULL,
        "discount_value" numeric(8, 2) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "start_date" timestamp with time zone,
        "end_date" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "product_drink_discounts_scope_idx" ON "product_drink_discounts" ("drink_id", "branch_id", "partner_id");
    `);


    logger.info("[migration] Ensuring catalog:manage & drinks:manage permissions exist for admin role...");
    await db.execute(sql`
      INSERT INTO "permissions" ("key", "description")
      VALUES ('drinks:manage', 'Manage branch and partner drink availability')
      ON CONFLICT ("key") DO NOTHING;

      INSERT INTO "role_permissions" ("role_key", "permission_key")
      VALUES ('admin', 'drinks:manage'), ('admin', 'catalog:manage')
      ON CONFLICT DO NOTHING;

      DELETE FROM "user_permissions"
      WHERE "permission_key" IN ('catalog:manage', 'drinks:manage')
        AND "granted" = false
        AND "user_id" IN (SELECT "id" FROM "users" WHERE lower("role") = 'admin');
    `);

    logger.info("[migration] Reassigning orders 1-221001 and 1-221002 to cashier Menna Gamal (ID 25)...");
    await db.execute(sql`
      UPDATE "orders"
      SET "cashier_id" = 25
      WHERE "order_number" IN ('1-221001', '1-221002') AND "cashier_id" = 24;
    `);

    logger.info("[migration] Checking for legacy hospitality order payments...");
    const hospitalityOrders = await db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        subtotal: ordersTable.subtotal,
      })
      .from(ordersTable)
      .where(eq(ordersTable.paymentMethod, "hospitality"));

    let migratedCount = 0;
    for (const o of hospitalityOrders) {
      const existingPayments = await db
        .select()
        .from(orderPaymentsTable)
        .where(eq(orderPaymentsTable.orderId, o.id));

      const needsMigration = 
        existingPayments.length === 0 || 
        existingPayments.some(p => p.paymentMethod !== "hospitality" || parseFloat(p.amount) === 0);

      if (needsMigration) {
        await db.transaction(async (tx) => {
          await tx.delete(orderPaymentsTable).where(eq(orderPaymentsTable.orderId, o.id));
          await tx.insert(orderPaymentsTable).values({
            orderId: o.id,
            paymentMethod: "hospitality",
            amount: o.subtotal,
          });
        });
        logger.info(`[migration] Migrated hospitality order #${o.orderNumber} to amount ${o.subtotal}`);
        migratedCount++;
      }
    }
    if (migratedCount > 0) {
      logger.info(`[migration] Completed! Migrated ${migratedCount} legacy hospitality orders.`);
    } else {
      logger.info("[migration] No legacy hospitality orders needed migration.");
    }
  } catch (error) {
    logger.error({ err: error }, "[migration] Error running data migrations");
  }
}
