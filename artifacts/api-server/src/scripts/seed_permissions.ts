import { syncPermissions } from "../lib/permissions-seed";

async function seed() {
  await syncPermissions();
  console.log("✨ Seeding complete.");
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});


