import { db, ordersTable } from "@workspace/db";
import { count } from "drizzle-orm";

async function checkOrders() {
  const result = await db.select({ count: count() }).from(ordersTable);
  console.log("Total Orders count in database:", result);
  const sample = await db.select().from(ordersTable).limit(5);
  console.log("Sample Orders:", JSON.stringify(sample, null, 2));
  process.exit(0);
}

checkOrders();
