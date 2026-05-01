import { db } from "../lib/db/src/index.js";
import { kitchenStationsTable, drinksTable } from "../lib/db/src/schema/index.js";

async function main() {
  const stations = await db.select().from(kitchenStationsTable);
  console.log("STATIONS:");
  console.table(stations);

  const drinks = await db.select().from(drinksTable).limit(10);
  console.log("DRINKS (sample):");
  console.table(drinks.map(d => ({ id: d.id, name: d.name, kitchen_station: d.kitchenStation })));

  process.exit(0);
}

main().catch(console.error);
