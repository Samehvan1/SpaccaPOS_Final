import { db, permissionsTable, rolesTable, rolePermissionsTable } from "../lib/db/src/index";
import { eq, or, ilike } from "drizzle-orm";

const permissions = [
  // Dashboard & Admin Hub
  { key: "admin:view", description: "Access the administrative dashboard" },
  
  // Users & Roles
  { key: "users:view", description: "List and view user details" },
  { key: "users:create", description: "Add new staff members" },
  { key: "users:update", description: "Edit staff details and permissions" },
  { key: "users:delete", description: "Remove staff members" },
  
  { key: "roles:view", description: "List and view role details" },
  { key: "roles:manage", description: "Create, update and delete roles" },
  
  // POS & Kitchen
  { key: "pos:view", description: "Open the Point of Sale terminal" },
  { key: "kitchen:view", description: "View and manage the kitchen production queue" },
  
  // Catalog & Inventory
  { key: "catalog:view", description: "Browse drinks and categories" },
  { key: "catalog:manage", description: "Create and edit drinks and categories" },
  
  { key: "inventory:view", description: "Check stock levels and ingredients" },
  { key: "inventory:manage", description: "Update stock levels and restock" },
  
  // Finance & Reports
  { key: "reports:view", description: "Access sales and performance reports" },
  { key: "discounts:view", description: "View active discount codes" },
  { key: "discounts:manage", description: "Create and edit discount codes" },
  
  // Settings & Infrastructure
  { key: "branches:manage", description: "Add and edit branch locations" },
  { key: "settings:manage", description: "Change system-wide configurations" },
  { key: "orders:pickup", description: "Access the pickup/collection interface" },
];

async function seed() {
  console.log("🌱 Seeding permissions...");

  for (const perm of permissions) {
    await db.insert(permissionsTable)
      .values({
        key: perm.key,
        name: perm.key.split(':').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        description: perm.description
      })
      .onConflictDoUpdate({
        target: permissionsTable.key,
        set: { description: perm.description }
      });
  }

  console.log(`✅ ${permissions.length} permissions seeded.`);

  // 1. Get all roles to find Finance-related ones
  const allRoles = await db.select().from(rolesTable);
  console.log("Found roles:", allRoles.map(r => r.key).join(", "));

  // 2. Map for Admin (Full Access)
  const [adminRole] = allRoles.filter(r => r.key.toLowerCase() === "admin");
  if (adminRole) {
    console.log("🔗 Mapping all permissions to 'admin' role...");
    const adminMappings = permissions.map(p => ({
      roleKey: adminRole.key,
      permissionKey: p.key
    }));
    
    for (const m of adminMappings) {
      await db.insert(rolePermissionsTable).values(m).onConflictDoNothing();
    }
  }

  // 3. Map for Finance (Reports, Inventory, POS, Kitchen)
  const financeRoles = allRoles.filter(r => r.key.toLowerCase().includes("finance"));
  if (financeRoles.length > 0) {
    const financePerms = ["pos:view", "kitchen:view", "admin:view", "reports:view", "inventory:view", "branches:manage"];
    for (const fRole of financeRoles) {
      console.log(`🔗 Mapping permissions to '${fRole.key}' role...`);
      for (const pKey of financePerms) {
        await db.insert(rolePermissionsTable).values({
          roleKey: fRole.key,
          permissionKey: pKey
        }).onConflictDoNothing();
      }
    }
  }

  // 4. Default mappings for other common roles if they exist
  const baristaRoles = allRoles.filter(r => r.key.toLowerCase().includes("barista") || r.key.toLowerCase() === "kitchen");
  if (baristaRoles.length > 0) {
    const baristaPerms = ["pos:view", "kitchen:view", "inventory:view"];
    for (const bRole of baristaRoles) {
       console.log(`🔗 Mapping permissions to '${bRole.key}' role...`);
       for (const pKey of baristaPerms) {
         await db.insert(rolePermissionsTable).values({ roleKey: bRole.key, permissionKey: pKey }).onConflictDoNothing();
       }
    }
  }

  console.log("✨ Seeding complete.");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
