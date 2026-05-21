import { db, usersTable } from "../lib/db/src";

async function listUsers() {
  const users = await db.select().from(usersTable);
  console.log("Current Users in DB:");
  console.log(users.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    branchId: u.branchId,
    isActive: u.isActive
  })));
  process.exit(0);
}

listUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
