import { db, drinksTable, ingredientsTable, ingredientTypesTable, ingredientVolumesTable } from "./lib/db/src/index";
import { sql } from "drizzle-orm";

async function findDuplicates(table: any, nameField: string, label: string) {
  const results = await db.select({
    name: table[nameField],
    count: sql<number>`count(*)`,
    ids: sql<string>`string_agg(${table.id}::text, ', ')`
  })
  .from(table)
  .groupBy(table[nameField])
  .having(sql`count(*) > 1`);

  console.log(`\n--- DUPLICATE ${label.toUpperCase()} ---`);
  if (results.length === 0) {
    console.log("None found.");
  } else {
    results.forEach(r => {
      console.log(`Name: "${r.name}" | Count: ${r.count} | IDs: ${r.ids}`);
    });
  }
}

async function main() {
  await findDuplicates(drinksTable, 'name', 'Drinks');
  await findDuplicates(ingredientsTable, 'name', 'Inventory Items');
  await findDuplicates(ingredientTypesTable, 'name', 'Ingredient Types');
  await findDuplicates(ingredientVolumesTable, 'name', 'Ingredient Volumes');
}

main().catch(console.error);
