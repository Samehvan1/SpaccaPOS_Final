import { db, branchesTable } from "../lib/db/src";

async function listBranches() {
  const branches = await db.select().from(branchesTable);
  console.log("Current Branches in DB:");
  console.log(branches);
  process.exit(0);
}

listBranches().catch(err => {
  console.error(err);
  process.exit(1);
});
