import { runMigrations } from "./lib/db/src/index.js";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  try {
    await runMigrations();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
