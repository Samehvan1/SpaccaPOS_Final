/**
 * Migration: Convert text-based drink categories to dynamic drink_categories table.
 *
 * Run with:
 *   $env:DATABASE_URL="postgresql://postgres:mero1901@localhost:5432/spacca_local"
 *   pnpm tsx scripts/migrate_categories.ts
 */
import "dotenv/config";
import { db, drinksTable, drinkCategoriesTable } from "../lib/db/src/index.ts";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🔍 Reading existing drinks...");
  const drinks = await db.select().from(drinksTable);
  const uniqueCategories = [...new Set(drinks.map(d => d.category).filter(Boolean))];

  console.log(`Found ${uniqueCategories.length} unique categories:`, uniqueCategories);

  // Insert categories (skip if already exist due to UNIQUE constraint)
  const categoryMap = new Map<string, number>();
  for (let i = 0; i < uniqueCategories.length; i++) {
    const name = uniqueCategories[i];
    try {
      const [cat] = await db
        .insert(drinkCategoriesTable)
        .values({ name, sortOrder: i * 10, isActive: true })
        .onConflictDoUpdate({ target: drinkCategoriesTable.name, set: { sortOrder: i * 10 } })
        .returning();
      categoryMap.set(name, cat.id);
      console.log(`✅ Category "${name}" → id=${cat.id}`);
    } catch (err) {
      console.warn(`⚠️  Skipped "${name}":`, err);
    }
  }

  // Link existing drinks to their category
  let linked = 0;
  for (const drink of drinks) {
    const catId = categoryMap.get(drink.category);
    if (catId && !drink.categoryId) {
      await db
        .update(drinksTable)
        .set({ categoryId: catId })
        .where(eq(drinksTable.id, drink.id));
      linked++;
    }
  }

  console.log(`\n✅ Migrated ${categoryMap.size} categories, linked ${linked} drinks.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
