import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

async function main() {
  // Dynamic imports to ensure env vars are loaded first
  const { db } = await import("../../lib/db/src/index.ts");
  const { ingredientsTable } = await import("../../lib/db/src/schema/ingredients.ts");
  const { eq } = await import("drizzle-orm");

  const csvPath = path.join(__dirname, "..", "..", "Inventory2026.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split(/\r?\n/);
  
  // Skip header (line 0)
  const dataLines = lines.slice(1);
  
  console.log(`Processing ${dataLines.length} potential items...`);

  let addedCount = 0;
  let skippedCount = 0;

  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    // Simple CSV split (not handling quotes, but the file doesn't seem to have them)
    const columns = line.split(",");
    
    // Columns: 0:#, 1:Name, 2:Shelf Life, 3:unit, ...
    const name = columns[1]?.trim();
    const unit = columns[3]?.trim() || "unit";
    
    if (!name || name.includes("Morning Manager") || name.includes("waste Checked By")) {
      continue;
    }

    const slug = slugify(name);
    
    // Check if exists
    const existing = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Skipping existing item: ${name} (${slug})`);
      skippedCount++;
      continue;
    }

    // Guess type
    const ingredientType = guessType(name);

    try {
      await db.insert(ingredientsTable).values({
        name,
        slug,
        ingredientType,
        unit,
        costPerUnit: "0",
        stockQuantity: "100",
        lowStockThreshold: "50"
      });
      console.log(`Added new item: ${name} (${slug}) as ${ingredientType}`);
      addedCount++;
    } catch (error) {
      console.error(`Error adding item ${name}:`, error);
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  process.exit(0);
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function guessType(name: string): "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "other" {
  const n = name.toLowerCase();
  if (n.includes("coffee") || n.includes("espresso")) return "coffee";
  if (n.includes("milk")) return "milk";
  if (n.includes("syrup")) return "syrup";
  if (n.includes("sauce")) return "sauce";
  if (n.includes("suger") || n.includes("sugar") || n.includes("honey")) return "sweetener";
  if (n.includes("puree")) return "topping";
  if (n.includes("chocoate") || n.includes("chocolate")) return "sauce";
  return "other";
}

main();
