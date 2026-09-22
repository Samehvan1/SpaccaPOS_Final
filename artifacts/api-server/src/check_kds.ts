import { db, ordersTable, orderItemsTable, kitchenStationsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

async function run() {
  const stations = await db.select().from(kitchenStationsTable);
  console.log("=== KITCHEN STATIONS ===");
  console.log(JSON.stringify(stations, null, 2));

  const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.id)).limit(10);
  console.log("\n=== RECENT ORDERS ===");
  for (const o of recentOrders) {
    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
    console.log(`Order #${o.id} (${o.orderNumber}) - Status: "${o.status}", Branch: ${o.branchId}, Payment: ${o.paymentMethod}, Items Count: ${items.length}`);
    for (const item of items) {
      console.log(`   Item #${item.id}: ${item.drinkName} | Status: "${item.status}" | Station: "${item.kitchenStation}" | StationID: ${item.kitchenStationId}`);
    }
  }
}

run().catch(console.error).finally(() => process.exit(0));
