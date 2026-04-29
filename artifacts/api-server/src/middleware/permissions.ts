import type { Request, Response, NextFunction } from "express";
import { db, rolePermissionsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

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

    const role = (req as any).user.role;

    if (role === "admin") {
      return next();
    }

    const [hasPermission] = await db
      .select()
      .from(rolePermissionsTable)
      .where(
        and(
          eq(rolePermissionsTable.role, role),
          eq(rolePermissionsTable.permissionKey, permissionKey)
        )
      )
      .limit(1);

    if (!hasPermission) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}
