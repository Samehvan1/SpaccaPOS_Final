import { db, usersTable } from "../lib/db/src";
import { UpdateUserBody } from "../lib/api-zod/src";
import { eq } from "drizzle-orm";

async function run() {
  const userId = 14;

  // 1. Get user before
  const [userBefore] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  console.log("User before update:", {
    id: userBefore.id,
    name: userBefore.name,
    branchId: userBefore.branchId,
  });

  // 2. Mock request body sent by frontend when editing name and branch to 1 (retaining branchId 1)
  const reqBody = {
    name: "Abd Elhameed Sabra",
    role: "admin",
    branchId: 1, // retained branch
  };

  console.log("\nParsing request body with UpdateUserBody:", reqBody);
  const parsed = UpdateUserBody.safeParse(reqBody);
  if (!parsed.success) {
    console.error("Validation failed:", parsed.error.format());
    process.exit(1);
  }

  console.log("Parsed data:", parsed.data);

  // 3. Perform update exactly as backend route does
  const updateData: any = { ...parsed.data };
  
  console.log("Updating database with:", updateData);
  const [updatedUser] = await db
    .update(usersTable)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId))
    .returning();

  console.log("\nUpdated user in DB:", {
    id: updatedUser.id,
    name: updatedUser.name,
    branchId: updatedUser.branchId,
  });

  // 4. Reset user back to 'Abdul Hameed Sabra' so we don't mess up DB
  await db
    .update(usersTable)
    .set({
      name: "Abdul Hameed Sabra",
      branchId: 1,
    })
    .where(eq(usersTable.id, userId));

  console.log("\nReset user back to Abdul Hameed Sabra");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
