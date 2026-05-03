import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function resetAdmin() {
  const passwordHash = "$2b$10$crJwgEutnJcfWcuojL8qd.atmgvNIDdmSyoc0mMdLM87t5uvs1TZC"; // password123
  await db.update(usersTable)
    .set({ passwordHash })
    .where(eq(usersTable.username, "admin"));
  console.log("Admin password reset to 'password123'");
  process.exit(0);
}

resetAdmin().catch(console.error);
