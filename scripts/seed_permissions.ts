import { db, permissionsTable, rolePermissionsTable } from "../lib/db/src/index";

async function seedPermissions() {
  console.log("Seeding system permissions...");

  const permissions = [
    { key: "admin:view_logs", description: "View system activity logs" },
    { key: "admin:manage_permissions", description: "Manage roles and permissions" },
    { key: "users:view", description: "View staff list" },
    { key: "users:create", description: "Add new staff members" },
    { key: "users:update", description: "Edit staff details and PINs" },
    { key: "users:delete", description: "Remove staff members" },
    { key: "orders:view", description: "View order history" },
    { key: "catalog:view", description: "View menu and ingredients" },
    { key: "catalog:edit", description: "Manage menu, categories, and pricing" },
    { key: "inventory:view", description: "View stock levels" },
    { key: "inventory:edit", description: "Adjust stock and restock items" },
    { key: "reports:view", description: "Access sales and performance reports" },
  ];

  try {
    for (const p of permissions) {
      await db.insert(permissionsTable)
        .values(p)
        .onConflictDoUpdate({
          target: permissionsTable.key,
          set: { description: p.description }
        });
    }
    console.log("Permissions seeded successfully.");

    // Auto-grant basic permissions to roles if needed, 
    // but the Admin Hub matrix handles the UI for this now.
    
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed permissions:", error);
    process.exit(1);
  }
}

seedPermissions();
