import { db, usersTable } from "./lib/db/src";

async function checkPins() {
  const users = await db.select().from(usersTable);
  console.log(JSON.stringify(users.map(u => ({ id: u.id, name: u.name, pin: u.pin })), null, 2));
  process.exit(0);
}

checkPins().catch(err => {
  console.error(err);
  process.exit(1);
});
