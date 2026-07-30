import { db, partnersTable } from "@workspace/db";

async function main() {
  const partners = await db.select().from(partnersTable);
  console.log("Partners count:", partners.length);
  console.log("---");
  partners.forEach(p => {
    console.log({ id: p.id, name: p.name, code: p.code, isActive: p.isActive, createdAt: p.createdAt });
  });
}

main().catch(console.error);
