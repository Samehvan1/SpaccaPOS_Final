import { db, usersTable } from "../lib/db/src/index";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Checking for existing users...");
  
  const existingUsers = await db.select().from(usersTable).limit(1);
  
  if (existingUsers.length > 0) {
    console.log("Database already has users. Skipping seeding.");
    process.exit(0);
  }

  console.log("No users found. Seeding default admin...");
  
  try {
    await db.insert(usersTable).values({
      name: "System Admin",
      role: "admin",
      pin: "123456"
    });
    
    console.log("Successfully created default admin!");
    console.log("Role: admin");
    console.log("PIN: 123456");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin user:", error);
    process.exit(1);
  }
}

seed();
