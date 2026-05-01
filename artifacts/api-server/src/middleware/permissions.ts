import type { Request, Response, NextFunction } from "express";
import { db, rolePermissionsTable, userPermissionsTable, usersTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";

export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req.session as any).userId;

    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!(req as any).user) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }
      (req as any).user = user;
    }

    const user = (req as any).user;
    const role = user.role;

    // Admin still has full access unless explicitly denied (rare case)
    if (role === "admin") {
       // Check for explicit denial at user level
       const [denial] = await db
         .select()
         .from(userPermissionsTable)
         .where(
           and(
             eq(userPermissionsTable.userId, userId),
             eq(userPermissionsTable.permissionKey, permissionKey),
             eq(userPermissionsTable.granted, false)
           )
         )
         .limit(1);
       
       if (!denial) return next();
    }

    // 1. Check User-level Override (highest priority)
    const [userOverride] = await db
      .select()
      .from(userPermissionsTable)
      .where(
        and(
          eq(userPermissionsTable.userId, userId),
          eq(userPermissionsTable.permissionKey, permissionKey)
        )
      )
      .limit(1);

    if (userOverride) {
      if (userOverride.granted) {
        return next();
      } else {
        res.status(403).json({ error: "Insufficient permissions (denied at user level)" });
        return;
      }
    }

    // 2. Check Role-level permissions
    const [rolePermission] = await db
      .select()
      .from(rolePermissionsTable)
      .where(
        and(
          eq(rolePermissionsTable.roleKey, role),
          eq(rolePermissionsTable.permissionKey, permissionKey)
        )
      )
      .limit(1);

    if (!rolePermission) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}
