import { db, usersTable } from "../lib/db/src";

async function main() {
  const users = await db.select().from(usersTable);
  console.log("All Users in DB:");
  console.table(users.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    branchId: u.branchId,
  })));
  process.exit(0);
}

main().catch(console.error);
