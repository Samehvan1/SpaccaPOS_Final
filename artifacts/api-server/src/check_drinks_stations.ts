import { db, drinksTable } from "@workspace/db";

async function run() {
  const drinks = await db.select({
    id: drinksTable.id,
    name: drinksTable.name,
    kitchenStation: drinksTable.kitchenStation,
    kitchenStationId: drinksTable.kitchenStationId,
  }).from(drinksTable);

  console.log(`Total drinks: ${drinks.length}`);
  const summary: Record<string, number> = {};
  for (const d of drinks) {
    const key = `StationText: "${d.kitchenStation}" | StationID: ${d.kitchenStationId}`;
    summary[key] = (summary[key] || 0) + 1;
  }
  console.log("=== DRINKS STATION SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
}

run().catch(console.error).finally(() => process.exit(0));
