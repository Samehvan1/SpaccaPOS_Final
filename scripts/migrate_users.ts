import "dotenv/config";
import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function migrate() {
  console.log("Starting user migration...");
  const users = await db.select().from(usersTable);

  for (const user of users) {
    if (!user.username) {
      const username = user.name.toLowerCase().replace(/\s+/g, "_") + user.id;
      const defaultPassword = "password123"; // User should change this
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      console.log(`Migrating user ${user.name}: username=${username}, password=${defaultPassword}`);

      await db.update(usersTable)
        .set({
          username,
          passwordHash,
          isActive: true
        })
        .where(eq(usersTable.id, user.id));
    }
  }

  console.log("Migration completed.");
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
