import { db, ordersTable, orderPaymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function migrate() {
  console.log("Fetching all hospitality orders...");
  const hospitalityOrders = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      subtotal: ordersTable.subtotal,
    })
    .from(ordersTable)
    .where(eq(ordersTable.paymentMethod, "hospitality"));

  console.log(`Found ${hospitalityOrders.length} hospitality orders. Processing...`);

  let migratedCount = 0;
  for (const o of hospitalityOrders) {
    const existingPayments = await db
      .select()
      .from(orderPaymentsTable)
      .where(eq(orderPaymentsTable.orderId, o.id));

    // Determine if we need to insert or update
    const needsMigration = 
      existingPayments.length === 0 || 
      existingPayments.some(p => p.paymentMethod !== "hospitality" || parseFloat(p.amount) === 0);

    if (needsMigration) {
      await db.transaction(async (tx) => {
        // Clear any incorrect payments for this order
        await tx.delete(orderPaymentsTable).where(eq(orderPaymentsTable.orderId, o.id));
        
        // Insert correct hospitality payment record
        await tx.insert(orderPaymentsTable).values({
          orderId: o.id,
          paymentMethod: "hospitality",
          amount: o.subtotal,
        });
      });
      console.log(`Migrated Order #${o.orderNumber} (ID: ${o.id}) -> Set payment amount to EGP ${o.subtotal}`);
      migratedCount++;
    }
  }

  console.log(`Migration completed successfully! Total orders updated: ${migratedCount}`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
