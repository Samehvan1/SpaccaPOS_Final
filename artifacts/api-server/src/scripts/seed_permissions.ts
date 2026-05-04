import { db, permissionsTable, rolesTable, rolePermissionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const permissions = [
  // Dashboard & Admin Hub
  { key: "admin:view", name: "View Admin Hub", description: "Access the administrative dashboard" },
  
  // Users & Roles
  { key: "users:view", name: "View Users", description: "List and view user details" },
  { key: "users:create", name: "Create Users", description: "Add new staff members" },
  { key: "users:update", name: "Update Users", description: "Edit staff details and permissions" },
  { key: "users:delete", name: "Delete Users", description: "Remove staff members" },
  
  { key: "roles:view", name: "View Roles", description: "List and view role details" },
  { key: "roles:manage", name: "Manage Roles", description: "Create, update and delete roles" },
  
  // POS & Kitchen
  { key: "pos:view", name: "Access POS", description: "Open the Point of Sale terminal" },
  { key: "kitchen:view", name: "Access Kitchen", description: "View and manage the kitchen production queue" },
  
  // Catalog & Inventory
  { key: "catalog:view", name: "View Catalog", description: "Browse drinks and categories" },
  { key: "catalog:manage", name: "Manage Catalog", description: "Create and edit drinks and categories" },
  
  { key: "inventory:view", name: "View Inventory", description: "Check stock levels and ingredients" },
  { key: "inventory:manage", name: "Manage Inventory", description: "Update stock levels and restock" },
  
  // Finance & Reports
  { key: "reports:view", name: "View Reports", description: "Access sales and performance reports" },
  { key: "discounts:view", name: "View Discounts", description: "View active discount codes" },
  { key: "discounts:manage", name: "Manage Discounts", description: "Create and edit discount codes" },
  
  // Settings & Infrastructure
  { key: "branches:manage", name: "Manage Branches", description: "Add and edit branch locations" },
  { key: "settings:manage", name: "Manage Settings", description: "Change system-wide configurations" },
];

async function seed() {
  console.log("🌱 Seeding permissions...");

  const allRoles = await db.select().from(rolesTable);
  console.log("Found roles:", allRoles.map(r => r.key).join(", "));

  for (const perm of permissions) {
    // Upsert permissions
    const [existing] = await db.select().from(permissionsTable).where(eq(permissionsTable.key, perm.key)).limit(1);
    if (existing) {
      await db.update(permissionsTable).set(perm).where(eq(permissionsTable.key, perm.key));
    } else {
      await db.insert(permissionsTable).values(perm);
    }
  }

  console.log(`✅ ${permissions.length} permissions seeded.`);

  // Auto-assign permissions to the "admin" role if it exists
  const [adminRole] = await db.select().from(rolesTable).where(eq(rolesTable.key, "admin")).limit(1);
  if (adminRole) {
    console.log("🔗 Mapping all permissions to 'admin' role...");
    for (const perm of permissions) {
      const [existing] = await db
        .select()
        .from(rolePermissionsTable)
        .where(
          eq(rolePermissionsTable.roleKey, "admin") && 
          eq(rolePermissionsTable.permissionKey, perm.key)
        )
        .limit(1);
        
      if (!existing) {
        await db.insert(rolePermissionsTable).values({
          roleKey: "admin",
          permissionKey: perm.key
        });
      }
    }
  }

  // Auto-assign permissions to the "finance" role if it exists
  const [financeRole] = await db.select().from(rolesTable).where(eq(rolesTable.key, "finance")).limit(1);
  if (financeRole) {
    console.log("🔗 Mapping permissions to 'finance' role...");
    const financePerms = ["pos:view", "kitchen:view", "admin:view", "reports:view", "inventory:view"];
    for (const pKey of financePerms) {
      const [existing] = await db
        .select()
        .from(rolePermissionsTable)
        .where(
          and(
            eq(rolePermissionsTable.roleKey, "finance"),
            eq(rolePermissionsTable.permissionKey, pKey)
          )
        )
        .limit(1);
        
      if (!existing) {
        await db.insert(rolePermissionsTable).values({
          roleKey: "finance",
          permissionKey: pKey
        });
      }
    }
  }

  console.log("✨ Seeding complete.");
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
