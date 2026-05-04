import { db, permissionsTable, rolesTable, rolePermissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

export const APP_PERMISSIONS = [
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
  { key: "pos:create_order", name: "Create Orders", description: "Place new orders in the system" },
  { key: "kitchen:view", name: "Access Kitchen", description: "View and manage the kitchen production queue" },
  { key: "kitchen:mark_ready", name: "Mark Ready", description: "Mark order items as ready for pickup" },
  
  // Cashier Operations
  { key: "cashier:view", name: "Cashier View", description: "Access the cashier dashboard and order list" },
  { key: "cashier:approve_order", name: "Approve Order", description: "Finalize and approve orders for payment" },
  { key: "cashier:cancel_order", name: "Cancel Order", description: "Void or cancel pending orders" },
  { key: "cashier:refund_order", name: "Refund Order", description: "Process refunds for completed orders" },
  { key: "cashier:close_session", name: "Close Session", description: "End a cashier shift and close the session" },
  { key: "cashier:view_reports", name: "View Cashier Reports", description: "View shift summaries and performance" },
  { key: "pos:apply_discount", name: "Apply Discount", description: "Apply manual or coupon discounts to orders" },

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

const standardRoles = [
  { key: "admin", name: "Administrator" },
  { key: "cashier", name: "Cashier" },
  { key: "barista", name: "Barista" },
  { key: "finance", name: "Finance Manager" }
];

export async function syncPermissions() {
  logger.info("Syncing system permissions...");

  // 1. Ensure Roles exist
  for (const role of standardRoles) {
    const [existing] = await db.select().from(rolesTable).where(eq(rolesTable.key, role.key)).limit(1);
    if (!existing) {
      await db.insert(rolesTable).values(role);
    }
  }

  // 2. Sync Permissions list
  for (const perm of APP_PERMISSIONS) {
    const [existing] = await db.select().from(permissionsTable).where(eq(permissionsTable.key, perm.key)).limit(1);
    if (existing) {
      await db.update(permissionsTable).set(perm).where(eq(permissionsTable.key, perm.key));
    } else {
      await db.insert(permissionsTable).values(perm);
    }
  }

  const assignPermissions = async (roleKey: string, pKeys: string[]) => {
    for (const pKey of pKeys) {
      const [existing] = await db
        .select()
        .from(rolePermissionsTable)
        .where(
          and(
            eq(rolePermissionsTable.roleKey, roleKey),
            eq(rolePermissionsTable.permissionKey, pKey)
          )
        )
        .limit(1);
        
      if (!existing) {
        await db.insert(rolePermissionsTable).values({
          roleKey,
          permissionKey: pKey
        });
      }
    }
  };

  // 3. Map default permissions
  await assignPermissions("admin", APP_PERMISSIONS.map(p => p.key));
  await assignPermissions("cashier", [
    "pos:view",
    "pos:create_order",
    "cashier:view",
    "cashier:approve_order",
    "cashier:cancel_order",
    "cashier:refund_order",
    "cashier:close_session",
    "cashier:view_reports",
    "pos:apply_discount",
    "catalog:view",
    "inventory:view"
  ]);
  await assignPermissions("barista", [
    "pos:view",
    "kitchen:view",
    "kitchen:mark_ready",
    "catalog:view",
    "inventory:view"
  ]);
  await assignPermissions("finance", [
    "admin:view",
    "reports:view",
    "inventory:view",
    "cashier:view_reports"
  ]);

  logger.info("Permissions sync complete.");
}
