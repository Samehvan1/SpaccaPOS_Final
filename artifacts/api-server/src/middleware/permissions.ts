import type { Request, Response, NextFunction } from "express";
import { db, usersTable, userPermissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { resolveUserPermissions } from "../lib/permissions";
import { ALL_PERMISSIONS } from "@workspace/api-zod";

export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = req.session as any;
    const userId = session.userId ?? session.cashierId;

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
    const userRole = (session.role || user?.role)?.toLowerCase();

    // Special case: admin gets full access to all permissions unless explicitly denied in user_permissions
    if (userRole === "admin") {
      const userOverrides = await db
        .select()
        .from(userPermissionsTable)
        .where(and(eq(userPermissionsTable.userId, userId), eq(userPermissionsTable.permissionKey, permissionKey)));
      const explicitDeny = userOverrides.find(o => !o.granted);
      if (!explicitDeny) {
        console.log(`[Permission] GRANTED (Admin Full Access): User ${userId} for '${permissionKey}'`);
        next();
        return;
      }
    }

    let permissions = session.permissions;

    if (!permissions) {
      // Lazy load permissions from DB and cache them in the session
      try {
        permissions = await resolveUserPermissions(user.id, user.role);
        session.permissions = permissions;

        // Save session changes
        await new Promise<void>((resolve, reject) => {
          session.save((err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (error) {
        console.error("[Permission] Error lazy loading permissions:", error);
        res.status(500).json({ error: "Failed to resolve permissions" });
        return;
      }
    }

    if (!permissions.includes(permissionKey)) {
      const permObj = (ALL_PERMISSIONS as any)[permissionKey];
      const permName = permObj?.name || permissionKey;
      console.log(`[Permission] DENIED: User ${userId} (Role: ${userRole}) lacks '${permissionKey}' (${permName})`);
      res.status(403).json({ 
        error: `Access Denied: Missing permission '${permName}' (${permissionKey})`,
        role: userRole,
        permission: permissionKey,
        permissionName: permName
      });
      return;
    }

    console.log(`[Permission] GRANTED: User ${userId} (Role: ${userRole}) for '${permissionKey}'`);
    next();
  };
}
