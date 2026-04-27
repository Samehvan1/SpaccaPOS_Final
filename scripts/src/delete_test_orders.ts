import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root BEFORE other imports that might depend on it
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

async function main() {
  console.log("Deleting test orders created before 2026-04-27...");

  // Dynamic imports with explicit extensions to avoid resolution issues in ESM
  const { db } = await import("../../lib/db/src/index.ts");
  const { ordersTable } = await import("../../lib/db/src/schema/orders.ts");
  const { lt } = await import("drizzle-orm");

  const cutoffDate = new Date("2026-04-27T00:00:00Z");
  
  try {
    const deletedOrders = await db
      .delete(ordersTable)
      .where(lt(ordersTable.createdAt, cutoffDate))
      .returning({ id: ordersTable.id });

    console.log(`Successfully deleted ${deletedOrders.length} test orders.`);
    
    if (deletedOrders.length > 0) {
      console.log("IDs of deleted orders:", deletedOrders.map(o => o.id).join(", "));
    }
  } catch (error) {
    console.error("Error deleting test orders:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
