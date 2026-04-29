import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db, ingredientsTable, ingredientTypesTable, drinksTable, stockMovementsTable, ingredientOptionsTable, orderItemCustomizationsTable, orderItemsTable, ordersTable, drinkIngredientSlotsTable } from "../../lib/db/src/index.js";
import { eq, sql } from "drizzle-orm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const csvPath = path.join(process.cwd(), "..", "Inventory2026.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found at:", csvPath);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n");

  console.log(`Read ${lines.length} lines from CSV.`);

  // Skip header and empty lines
  const dataLines = lines.slice(1).filter(line => line.trim() && !line.startsWith("#"));

  console.log(`Processing ${dataLines.length} items...`);

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const getIngredientType = (name: string): any => {
    const n = name.toLowerCase();
    if (n.includes("tea")) return "tea";
    if (n.includes("cup") || n.includes("lid") || n.includes("sleeve") || n.includes("holder")) return "cup";
    if (n.includes("bag") || n.includes("paper") || n.includes("label") || n.includes("roll") || n.includes("napkin") || n.includes("stirrer") || n.includes("straw") || n.includes("glaves")) return "packing";
    if (n.includes("coffee")) return "coffee";
    if (n.includes("milk") || n.includes("cream")) return "milk";
    if (n.includes("syrup")) return "syrup";
    if (n.includes("sauce") || n.includes("puree") || n.includes("butter")) return "sauce";
    if (n.includes("suger") || n.includes("sugar")) return "sweetener";
    if (n.includes("powder") || n.includes("pawder")) return "base";
    return "other";
  };

  const mapUnit = (u: string) => {
    const unit = u.trim().toUpperCase();
    if (unit === "G") return "g";
    if (unit === "L" || unit === "S") return "ml";
    if (unit === "EACH") return "pcs";
    return unit.toLowerCase() || "pcs";
  };

  try {
    console.log("Cleaning up existing data...");
    
    // We can't easily truncate due to FKs, so we do it in order or clear links
    await db.transaction(async (tx) => {
      // 1. Clear links
      await tx.update(ingredientTypesTable).set({ inventoryIngredientId: null });
      await tx.update(drinksTable).set({ cupIngredientId: null });
      await tx.update(ingredientOptionsTable).set({ linkedIngredientId: null });
      await tx.update(drinkIngredientSlotsTable).set({ ingredientId: null });
      
      // 2. Delete dependent data
      await tx.delete(orderItemCustomizationsTable);
      await tx.delete(orderItemsTable);
      await tx.delete(ordersTable);
      await tx.delete(stockMovementsTable);
      await tx.delete(ingredientOptionsTable);
      await tx.delete(ingredientsTable);
      
      console.log("Existing ingredients wiped.");

      // 3. Insert new items
      const usedSlugs = new Set<string>();
      for (const line of dataLines) {
        const parts = line.split(",");
        if (parts.length < 4) continue;

        const name = parts[1]?.trim();
        const unitRaw = parts[3]?.trim();
        
        if (!name) continue;

        const type = getIngredientType(name);
        const unit = mapUnit(unitRaw);
        let slug = slugify(name);

        if (usedSlugs.has(slug)) {
          slug = `${slug}-${unit}`;
          if (usedSlugs.has(slug)) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
          }
        }
        usedSlugs.add(slug);

        await tx.insert(ingredientsTable).values({
          name,
          slug,
          ingredientType: type,
          unit,
          costPerUnit: "0",
          stockQuantity: "0",
          lowStockThreshold: "100",
          isActive: true
        });
      }
    });

    console.log("Import completed successfully.");
  } catch (err) {
    console.error("Import failed:", err);
  }
}

main().catch(console.error);
