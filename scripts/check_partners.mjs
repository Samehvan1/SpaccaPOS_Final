import { db, partnersTable } from "../lib/db/dist/index.mjs";

const partners = await db.select().from(partnersTable);
console.log("Partners count:", partners.length);
console.log("---");
partners.forEach(p => {
  console.log({ id: p.id, name: p.name, code: p.code, isActive: p.isActive, createdAt: p.createdAt });
});
process.exit(0);
