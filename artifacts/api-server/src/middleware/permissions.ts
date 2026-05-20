import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { resolveUserPermissions } from "../lib/permissions";

export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = req.session as any;
    const userId = session.userId ?? session.cashierId;

    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    let permissions = session.permissions;

    if (!permissions) {
      // Lazy load permissions from DB and cache them in the session
      try {
        if (!(req as any).user) {
          const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
          if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
          }
          (req as any).user = user;
        }
        const user = (req as any).user;
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
      console.log(`[Permission] DENIED: User ${userId} (Role: ${session.role}) lacks '${permissionKey}'`);
      res.status(403).json({ 
        error: `Insufficient permissions: '${permissionKey}' required`,
        role: session.role,
        permission: permissionKey
      });
      return;
    }

    console.log(`[Permission] GRANTED: User ${userId} (Role: ${session.role}) for '${permissionKey}'`);
    next();
  };
}
