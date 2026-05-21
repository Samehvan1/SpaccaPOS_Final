import app from "../artifacts/api-server/src/app";
import request from "supertest";
import { db, usersTable } from "../lib/db/src";
import { eq } from "drizzle-orm";

// Register mock session middleware
app.use((req: any, res: any, next: any) => {
  req.session.userId = 9; // System Admin
  req.session.role = "admin";
  req.session.branchId = 1; // Admin belongs to branch 1
  next();
});

// Move mock session middleware right before the '/api' router layer in the stack
const stack = (app as any).router.stack;
const routerIndex = stack.findIndex((layer: any) => layer.name === "router");
if (routerIndex !== -1) {
  const mockSessionLayer = stack.pop();
  stack.splice(routerIndex, 0, mockSessionLayer);
}

async function runTest() {
  const userId = 14; // Abdul Hameed Sabra

  // Fetch before state
  const [before] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  console.log("Before API call:", {
    id: before.id,
    name: before.name,
    username: before.username,
    role: before.role,
    branchId: before.branchId,
  });

  console.log("\n1. Simulating PATCH from frontend to rename and set branch to Global (null)...");
  const patchRes = await request(app)
    .patch(`/api/users/${userId}`)
    .send({
      name: "Abd Elhameed Sabra",
      username: before.username,
      role: before.role,
      branchId: null, // Global
    });

  console.log("PATCH Status Code:", patchRes.status);
  console.log("PATCH Response Body branchId:", patchRes.body.branchId);

  // Fetch from DB to confirm it updated
  const [dbAfterPatch] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  console.log("DB state after PATCH:", {
    id: dbAfterPatch.id,
    name: dbAfterPatch.name,
    branchId: dbAfterPatch.branchId,
  });

  console.log("\n2. Simulating GET /api/users request from frontend...");
  const getRes = await request(app).get("/api/users");

  console.log("GET Status Code:", getRes.status);
  const returnedUser = getRes.body.find((u: any) => u.id === userId);
  if (returnedUser) {
    console.log("SUCCESS: User was found in the GET /api/users response!", {
      id: returnedUser.id,
      name: returnedUser.name,
      branchId: returnedUser.branchId,
    });
  } else {
    console.log("FAILURE: User was NOT found in the GET /api/users response!");
  }

  // Restore name and branch
  await db
    .update(usersTable)
    .set({
      name: "Abdul Hameed Sabra",
      branchId: 1,
    })
    .where(eq(usersTable.id, userId));
  console.log("\nRestored user back to original state in DB.");
  process.exit(returnedUser ? 0 : 1);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
