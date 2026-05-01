import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "fs";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { fileURLToPath } from "url";

export async function runMigrations(migrationsPath?: string) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  
  // Try sibling migrations (dev) or child migrations (prod/dist)
  let folder = migrationsPath ?? path.resolve(currentDir, "../migrations");
  
  if (!fs.existsSync(folder)) {
    folder = path.resolve(currentDir, "./migrations");
  }

  console.log(`[db] Checking migrations at: ${folder}`);
  
  if (!fs.existsSync(folder)) {
    console.warn(`[db] Migrations folder not found at ${folder}. Skipping.`);
    return;
  }

  await migrate(db, { migrationsFolder: folder });
  console.log("[db] Migrations completed successfully");
}

export * from "./schema/index.js";

