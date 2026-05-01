import { Router } from "express";
import { db, activityLogsTable, permissionsTable, usersTable, rolePermissionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { requirePermission } from "../middleware/permissions";

const adminRouter = Router();

// GET /admin/activity-logs
adminRouter.get("/admin/activity-logs", requirePermission("admin:view_logs"), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await db
      .select({
        id: activityLogsTable.id,
        userId: activityLogsTable.userId,
        userName: usersTable.name,
        action: activityLogsTable.action,
        entityType: activityLogsTable.entityType,
        entityId: activityLogsTable.entityId,
        details: activityLogsTable.details,
        createdAt: activityLogsTable.createdAt,
      })
      .from(activityLogsTable)
      .leftJoin(usersTable, eq(activityLogsTable.userId, usersTable.id))
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(logs);
  } catch (error) {
    console.error("[listActivityLogs] error:", error);
    res.status(500).json({ error: "Failed to list activity logs" });
  }
});

// GET /admin/permissions
adminRouter.get("/admin/permissions", requirePermission("admin:manage_permissions"), async (req, res) => {
  try {
    const permissions = await db.select().from(permissionsTable);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to list permissions" });
  }
});

// GET /admin/role-permissions
adminRouter.get("/admin/role-permissions", requirePermission("admin:manage_permissions"), async (req, res) => {
  try {
    const rolePermissions = await db.select().from(rolePermissionsTable);
    res.json(rolePermissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to list role permissions" });
  }
});

// POST /admin/role-permissions
adminRouter.post("/admin/role-permissions", requirePermission("admin:manage_permissions"), async (req, res): Promise<void> => {
  try {
    const { role, permissions } = req.body;
    if (!role || !Array.isArray(permissions)) {
      res.status(400).json({ error: "Invalid payload. 'role' and 'permissions' array are required." });
      return;
    }

    // Wrap in transaction
    await db.transaction(async (tx) => {
      // Delete existing
      await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleKey, role));
      
      // Insert new
      if (permissions.length > 0) {
        await tx.insert(rolePermissionsTable).values(
          permissions.map(p => ({
            roleKey: role,
            permissionKey: p
          }))
        );
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("POST /admin/role-permissions error:", error);
    res.status(500).json({ error: "Failed to update role permissions" });
  }
});

// POST /admin/permissions
adminRouter.post("/admin/permissions", requirePermission("admin:manage_permissions"), async (req, res): Promise<void> => {
  try {
    const { key, description } = req.body;
    if (!key) {
      res.status(400).json({ error: "Permission key is required." });
      return;
    }
    const [newPerm] = await db.insert(permissionsTable).values({ key, description }).returning();
    res.status(201).json(newPerm);
  } catch (error) {
    res.status(500).json({ error: "Failed to create permission key" });
  }
});

// DELETE /admin/permissions/:key
adminRouter.delete("/admin/permissions/:key", requirePermission("admin:manage_permissions"), async (req, res): Promise<void> => {
  try {
    const key = req.params.key as string;
    // Transactions: remove from role mappings first
    await db.transaction(async (tx) => {
      await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.permissionKey, key));
      await tx.delete(permissionsTable).where(eq(permissionsTable.key, key));
    });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete permission key" });
  }
});

// POST /admin/backup
adminRouter.post("/admin/backup", requirePermission("admin:manage_permissions"), async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");

    const backupsDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
    const filePath = path.join(backupsDir, filename);

    // Use pg_dump. Note: requires pg_dump to be in PATH
    // We pass the URL directly.
    const cmd = `pg_dump "${dbUrl}" -f "${filePath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup Error: ${error.message}`);
        return res.status(500).json({ error: "Backup failed: " + error.message });
      }
      res.json({ message: "Backup created successfully", filename, path: filePath });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default adminRouter;
