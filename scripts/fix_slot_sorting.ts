/**
 * One-time script to fix sort orders for all existing drink ingredient slots.
 * Sets baristaSortOrder and customerSortOrder to 1 as a baseline.
 */
import "dotenv/config";
import { db, drinkIngredientSlotsTable } from "../lib/db/src/index.ts";

async function main() {
  console.log("🔍 Updating all existing drink ingredient slots...");
  
  const result = await db
    .update(drinkIngredientSlotsTable)
    .set({
      baristaSortOrder: 1,
      customerSortOrder: 1,
    });

  console.log("✅ Successfully set barista and customer sort orders to 1 for all slots.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
