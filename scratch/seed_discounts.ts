import { db, discountsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seedDiscounts() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(discountsTable);
  if (count > 0) {
    console.log("Discounts table already has data. Skipping seed.");
    return;
  }

  console.log("Seeding initial discounts...");
  await db.insert(discountsTable).values([
    { code: "SUMMER10",  type: "percentage", value: "10", isActive: true },
    { code: "SAVE50",    type: "fixed",      value: "50", isActive: true },
    { code: "WELCOME20", type: "percentage", value: "20", isActive: true },
  ]);
  console.log("Seed complete.");
}

seedDiscounts().catch(console.error).finally(() => process.exit(0));
