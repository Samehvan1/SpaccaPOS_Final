import { db, ingredientTypeVolumesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Activating all ingredient type volumes...");
  await db.update(ingredientTypeVolumesTable).set({ isActive: true });
  console.log("Done.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
