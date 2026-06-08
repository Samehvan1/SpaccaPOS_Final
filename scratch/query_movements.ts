import { db, stockMovementsTable } from "./lib/db/src/index";
import { count, eq } from "drizzle-orm";

async function query() {
  const allCounts = await db
    .select({
      movementType: stockMovementsTable.movementType,
      total: count(),
    })
    .from(stockMovementsTable)
    .groupBy(stockMovementsTable.movementType);

  console.log("Counts grouped by movementType:", allCounts);

  const sampleCalibration = await db
    .select()
    .from(stockMovementsTable)
    .where(eq(stockMovementsTable.movementType, "calibration"))
    .limit(5);
  console.log("Sample Calibration:", sampleCalibration);

  const sampleWaste = await db
    .select()
    .from(stockMovementsTable)
    .where(eq(stockMovementsTable.movementType, "waste"))
    .limit(5);
  console.log("Sample Waste:", sampleWaste);
}

query().catch(console.error);
