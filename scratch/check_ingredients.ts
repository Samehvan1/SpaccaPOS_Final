import { db, ingredientsTable } from "@workspace/db";

async function check() {
  const ingredients = await db.select().from(ingredientsTable).limit(5);
  console.log("Ingredients sample:", JSON.stringify(ingredients, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
