import { db, ordersTable, orderPaymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";

export async function runDataMigrations() {
  try {
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
