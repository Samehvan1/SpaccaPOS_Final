import { db, drinksTable } from "@workspace/db";
import { ilike } from "drizzle-orm";

async function main() {
  const drinks = await db.select().from(drinksTable).where(ilike(drinksTable.name, "%iced%latte%"));
  console.log("Iced Latte drinks in DB:", drinks);
}

main().catch(console.error).finally(() => process.exit(0));
