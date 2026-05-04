import { db, rolePermissionsTable, userPermissionsTable, permissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

/**
 * Resolves all permissions for a user based on their role and individual overrides.
 */
export async function resolveUserPermissions(userId: number, role: string): Promise<string[]> {
  const normalizedRole = role.toLowerCase();
  
  // 1. Get all base permissions from the role
  const rolePerms = await db
    .select({ key: rolePermissionsTable.permissionKey })
    .from(rolePermissionsTable)
    .where(eq(rolePermissionsTable.roleKey, normalizedRole));

  // 2. Get all user-level overrides
  const userOverrides = await db
    .select()
    .from(userPermissionsTable)
    .where(eq(userPermissionsTable.userId, userId));

  // 3. Create a set of granted permission keys
  const granted = new Set<string>();

  // Start with role permissions
  rolePerms.forEach(p => granted.add(p.key));

  // Apply overrides
  userOverrides.forEach(o => {
    if (o.granted) {
      granted.add(o.permissionKey);
    } else {
      granted.delete(o.permissionKey);
    }
  });

  // Special case: admin gets all permissions unless explicitly denied
  if (role === "admin") {
    const allAvailable = await db.select({ key: permissionsTable.key }).from(permissionsTable);
    allAvailable.forEach(p => {
      // Only add if not explicitly denied
      const isDenied = userOverrides.find(o => o.permissionKey === p.key && !o.granted);
      if (!isDenied) {
        granted.add(p.key);
      }
    });
  }

  return Array.from(granted);
}
