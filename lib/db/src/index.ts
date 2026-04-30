import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

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
  const folder = migrationsPath ?? path.resolve(currentDir, "../migrations");
  console.log(`[db] Running migrations from: ${folder}`);
  await migrate(db, { migrationsFolder: folder });
  console.log("[db] Migrations completed");
}

export * from "./schema";

