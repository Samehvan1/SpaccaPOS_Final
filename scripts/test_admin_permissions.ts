import app from "../artifacts/api-server/src/app";
import request from "supertest";
import { db, drinksTable, ingredientCategoriesTable } from "../lib/db/src";
import { eq } from "drizzle-orm";

// Register mock session middleware for User 8 (admin)
app.use((req: any, res: any, next: any) => {
  req.session.userId = 8;
  req.session.role = "admin";
  req.session.branchId = 1;
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
  console.log("Starting backend permissions verification test for admin role...");

  // 1. Test drinks endpoint PATCH (catalog:manage)
  console.log("\n1. Testing PATCH /api/drinks/:id (Requires 'catalog:manage')...");
  const [drink] = await db.select().from(drinksTable).limit(1);
  if (drink) {
    console.log(`Found drink in DB: ID=${drink.id}, Name="${drink.name}"`);
    const res = await request(app)
      .patch(`/api/drinks/${drink.id}`)
      .send({ name: drink.name }); // Save with same name to avoid duplicate error or side effects
    
    console.log("PATCH /api/drinks response status:", res.status);
    console.log("PATCH /api/drinks response body:", res.body);
    
    if (res.status === 200) {
      console.log("SUCCESS: Admin successfully authorized to edit drinks (catalog:manage)!");
    } else {
      console.log(`FAILURE: Expected status 200, got ${res.status}`);
      process.exit(1);
    }
  } else {
    console.log("No drinks found in the database. Testing with non-existent ID 9999...");
    const res = await request(app)
      .patch("/api/drinks/9999")
      .send({ name: "Test Drink" });
    
    console.log("PATCH /api/drinks/9999 response status:", res.status);
    if (res.status === 404) {
      console.log("SUCCESS: Admin bypassed permission check (catalog:manage) and got 404!");
    } else {
      console.log(`FAILURE: Expected status 404 (Not Found), got ${res.status}`);
      process.exit(1);
    }
  }

  // 2. Test categories endpoint POST (catalog:manage)
  console.log("\n2. Testing POST /api/catalog/categories (Requires 'catalog:manage')...");
  const resCategory = await request(app)
    .post("/api/catalog/categories")
    .send({}); // Empty body to trigger validation error (status 400) if permission check succeeds
  
  console.log("POST /api/catalog/categories response status:", resCategory.status);
  if (resCategory.status === 400) {
    console.log("SUCCESS: Admin bypassed permission check (catalog:manage) and hit validation logic (400)!");
  } else {
    console.log(`FAILURE: Expected status 400 (Bad Request), got ${resCategory.status}`);
    process.exit(1);
  }

  // 3. Test branches endpoint POST (branches:manage)
  console.log("\n3. Testing POST /api/admin/branches (Requires 'branches:manage')...");
  const resBranches = await request(app)
    .post("/api/admin/branches")
    .send({}); // Empty body to trigger validation error (status 400) if permission check succeeds

  console.log("POST /api/admin/branches response status:", resBranches.status);
  if (resBranches.status === 400) {
    console.log("SUCCESS: Admin bypassed permission check (branches:manage) and hit validation logic (400)!");
  } else {
    console.log(`FAILURE: Expected status 400 (Bad Request), got ${resBranches.status}`);
    process.exit(1);
  }

  console.log("\nAll permissions checks completed successfully!");
  process.exit(0);
}

runTest().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
