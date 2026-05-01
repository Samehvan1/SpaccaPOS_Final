import { Router, type IRouter } from "express";
import { db, rolesTable, rolePermissionsTable, permissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requirePermission } from "../middleware/permissions";
import { logActivity } from "../lib/activity-logger";

const rolesRouter: IRouter = Router();

// GET /roles
rolesRouter.get("/", requirePermission("users:view"), async (req, res): Promise<void> => {
  try {
    const allRoles = await db.select().from(rolesTable);
    res.json(allRoles);
  } catch (error: any) {
    console.error("GET /roles error:", error?.message || error);
    res.status(500).json({ error: "Failed to list roles" });
  }
});

// POST /roles
rolesRouter.post("/", requirePermission("users:create"), async (req, res): Promise<void> => {
  try {
    const { key, name, description, permissions } = req.body;

    if (!key || !name) {
      res.status(400).json({ error: "Key and Name are required" });
      return;
    }

    const [newRole] = await db.transaction(async (tx) => {
      const [role] = await tx.insert(rolesTable).values({ key, name, description }).returning();
      
      if (Array.isArray(permissions) && permissions.length > 0) {
        await tx.insert(rolePermissionsTable).values(
          permissions.map((pk: string) => ({
            roleKey: role.key,
            permissionKey: pk,
          }))
        );
      }
      return [role];
    });

    await logActivity(req, "CREATE_ROLE", "role", newRole.id, { key: newRole.key });
    res.status(201).json(newRole);
  } catch (error: any) {
    console.error("POST /roles error:", error?.message || error);
    res.status(500).json({ error: "Failed to create role" });
  }
});

// GET /roles/:key/permissions
rolesRouter.get("/:key/permissions", requirePermission("users:view"), async (req, res): Promise<void> => {
  try {
    const key = req.params.key as string;
    const perms = await db
      .select()
      .from(rolePermissionsTable)
      .where(eq(rolePermissionsTable.roleKey, key));
    res.json(perms);
  } catch (error: any) {
    console.error("GET /roles/:key/permissions error:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch role permissions" });
  }
});

// PATCH /roles/:key
rolesRouter.patch("/:key", requirePermission("users:update"), async (req, res): Promise<void> => {
  try {
    const { name, description, permissions } = req.body;
    const key = req.params.key as string;

    const [updatedRole] = await db.transaction(async (tx) => {
      const [role] = await tx
        .update(rolesTable)
        .set({ name, description })
        .where(eq(rolesTable.key, key))
        .returning();

      if (Array.isArray(permissions)) {
        await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleKey, key));
        if (permissions.length > 0) {
          await tx.insert(rolePermissionsTable).values(
            permissions.map((pk: string) => ({
              roleKey: key,
              permissionKey: pk,
            }))
          );
        }
      }
      return [role];
    });

    if (!updatedRole) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    await logActivity(req, "UPDATE_ROLE", "role", updatedRole.id, { key: updatedRole.key });
    res.json(updatedRole);
  } catch (error: any) {
    console.error("PATCH /roles/:key error:", error?.message || error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// DELETE /roles/:key
rolesRouter.delete("/:key", requirePermission("users:update"), async (req, res): Promise<void> => {
  try {
    const key = req.params.key as string;
    
    const [deletedRole] = await db.transaction(async (tx) => {
      await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleKey, key));
      return await tx.delete(rolesTable).where(eq(rolesTable.key, key)).returning();
    });

    if (!deletedRole) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    await logActivity(req, "DELETE_ROLE", "role", deletedRole.id, { key: deletedRole.key });
    res.status(204).end();
  } catch (error: any) {
    console.error("DELETE /roles/:key error:", error?.message || error);
    res.status(500).json({ error: "Failed to delete role" });
  }
});

// GET /permissions
rolesRouter.get("/permissions/list", requirePermission("users:view"), async (req, res): Promise<void> => {
  try {
    const all = await db.select().from(permissionsTable);
    res.json(all);
  } catch (error: any) {
    console.error("GET /permissions/list error:", error?.message || error);
    res.status(500).json({ error: "Failed to list permissions" });
  }
});

export default rolesRouter;
