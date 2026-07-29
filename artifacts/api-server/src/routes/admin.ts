import { Router } from "express";
import { db, activityLogsTable, permissionsTable, usersTable, rolePermissionsTable, branchesTable, partnersTable, partnerDrinkPricesTable, branchDrinkPricesTable, drinksTable } from "@workspace/db";
import { eq, desc, and, gte, lte, ilike, sql, isNull } from "drizzle-orm";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { requirePermission } from "../middleware/permissions";
import { startOfDay, endOfDay } from "date-fns";

const adminRouter = Router();

// GET /admin/activity-logs
adminRouter.get("/admin/activity-logs", requirePermission("admin:view"), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const { startDate, endDate, userId, entityType, action, userName } = req.query as {
      startDate?: string;
      endDate?: string;
      userId?: string;
      entityType?: string;
      action?: string;
      userName?: string;
    };

    const conditions = [];
    if (userId) conditions.push(eq(activityLogsTable.userId, parseInt(userId)));
    if (action) conditions.push(ilike(activityLogsTable.action, `%${action}%`));
    if (entityType) conditions.push(eq(activityLogsTable.entityType, entityType));
    if (userName) conditions.push(ilike(usersTable.name, `%${userName}%`));
    if (startDate) conditions.push(gte(activityLogsTable.createdAt, startOfDay(new Date(startDate))));
    if (endDate) {
      conditions.push(lte(activityLogsTable.createdAt, endOfDay(new Date(endDate))));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [logs, totalCount] = await Promise.all([
      db
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
        .where(where)
        .orderBy(desc(activityLogsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(activityLogsTable)
        .leftJoin(usersTable, eq(activityLogsTable.userId, usersTable.id))
        .where(where)
    ]);

    res.json({
      data: logs,
      total: totalCount[0].count,
      limit,
      offset
    });
  } catch (error) {
    console.error("[listActivityLogs] error:", error);
    res.status(500).json({ error: "Failed to list activity logs" });
  }
});

// GET /admin/permissions
adminRouter.get("/admin/permissions", requirePermission("roles:manage"), async (req, res) => {
  try {
    const permissions = await db.select().from(permissionsTable);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to list permissions" });
  }
});

// GET /admin/role-permissions
adminRouter.get("/admin/role-permissions", requirePermission("roles:manage"), async (req, res) => {
  try {
    const rolePermissions = await db.select().from(rolePermissionsTable);
    res.json(rolePermissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to list role permissions" });
  }
});

// POST /admin/role-permissions
adminRouter.post("/admin/role-permissions", requirePermission("roles:manage"), async (req, res): Promise<void> => {
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
adminRouter.post("/admin/permissions", requirePermission("roles:manage"), async (req, res): Promise<void> => {
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
adminRouter.delete("/admin/permissions/:key", requirePermission("roles:manage"), async (req, res): Promise<void> => {
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
adminRouter.post("/admin/backup", requirePermission("settings:manage"), async (req, res) => {
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

// Branches route moved to index.ts for better visibility

// GET /admin/partners
adminRouter.get("/admin/partners", requirePermission("branches:manage"), async (req, res) => {
  try {
    const list = await db.select().from(partnersTable).orderBy(desc(partnersTable.createdAt));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to list partners" });
  }
});

// POST /admin/partners
adminRouter.post("/admin/partners", requirePermission("branches:manage"), async (req, res): Promise<void> => {
  try {
    const { name, code, commissionType, commissionValue, isActive } = req.body;
    if (!name || !code) {
      res.status(400).json({ error: "Name and Code are required" });
      return;
    }
    const [partner] = await db
      .insert(partnersTable)
      .values({
        name,
        code,
        commissionType: commissionType || "percentage",
        commissionValue: String(commissionValue || "0.00"),
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();
    res.status(201).json(partner);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create partner" });
  }
});

// PATCH /admin/partners/:id
adminRouter.patch("/admin/partners/:id", requirePermission("branches:manage"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const { name, code, commissionType, commissionValue, isActive } = req.body;
    const [partner] = await db
      .update(partnersTable)
      .set({
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(commissionType !== undefined && { commissionType }),
        ...(commissionValue !== undefined && { commissionValue: String(commissionValue) }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(partnersTable.id, id))
      .returning();
    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }
    res.json(partner);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update partner" });
  }
});

// DELETE /admin/partners/:id
adminRouter.delete("/admin/partners/:id", requirePermission("branches:manage"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [partner] = await db.delete(partnersTable).where(eq(partnersTable.id, id)).returning();
    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete partner" });
  }
});

// GET /admin/branch-prices
adminRouter.get("/admin/branch-prices", requirePermission("catalog:view"), async (req, res): Promise<void> => {
  try {
    const branchId = parseInt(req.query.branchId as string);
    if (isNaN(branchId)) {
      res.status(400).json({ error: "Invalid or missing branchId" });
      return;
    }

    const drinks = await db.select().from(drinksTable).orderBy(drinksTable.name);
    const overrides = await db.select().from(branchDrinkPricesTable).where(eq(branchDrinkPricesTable.branchId, branchId));
    
    const overridesMap = new Map(overrides.map(o => [o.drinkId, o.price]));

    const result = drinks.map(d => ({
      drinkId: d.id,
      name: d.name,
      globalPrice: Number(d.basePrice),
      overridePrice: overridesMap.has(d.id) ? Number(overridesMap.get(d.id)) : null,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to load branch prices" });
  }
});

// POST /admin/branch-prices (Bulk Save)
adminRouter.post("/admin/branch-prices", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  try {
    const { branchId, prices } = req.body as { branchId: number; prices: { drinkId: number; price: number | null }[] };
    if (!branchId || !Array.isArray(prices)) {
      res.status(400).json({ error: "Invalid branchId or prices list" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const p of prices) {
        if (p.price === null || p.price === undefined || isNaN(p.price)) {
          // Delete override if null
          await tx
            .delete(branchDrinkPricesTable)
            .where(and(eq(branchDrinkPricesTable.branchId, branchId), eq(branchDrinkPricesTable.drinkId, p.drinkId)));
        } else {
          // Upsert override
          const [existing] = await tx
            .select()
            .from(branchDrinkPricesTable)
            .where(and(eq(branchDrinkPricesTable.branchId, branchId), eq(branchDrinkPricesTable.drinkId, p.drinkId)))
            .limit(1);
          if (existing) {
            await tx
              .update(branchDrinkPricesTable)
              .set({ price: String(p.price), updatedAt: new Date() })
              .where(eq(branchDrinkPricesTable.id, existing.id));
          } else {
            await tx
              .insert(branchDrinkPricesTable)
              .values({
                branchId,
                drinkId: p.drinkId,
                price: String(p.price),
              });
          }
        }
      }
    });

    res.json({ message: "Branch prices updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save branch prices" });
  }
});

// GET /admin/partner-prices
adminRouter.get("/admin/partner-prices", requirePermission("catalog:view"), async (req, res): Promise<void> => {
  try {
    const partnerId = parseInt(req.query.partnerId as string);
    if (isNaN(partnerId)) {
      res.status(400).json({ error: "Invalid or missing partnerId" });
      return;
    }
    const branchIdStr = req.query.branchId as string;
    const branchId = branchIdStr ? parseInt(branchIdStr) : null;

    const drinks = await db.select().from(drinksTable).orderBy(drinksTable.name);
    
    const conditions = [
      eq(partnerDrinkPricesTable.partnerId, partnerId)
    ];
    if (branchId) {
      conditions.push(eq(partnerDrinkPricesTable.branchId, branchId));
    } else {
      conditions.push(isNull(partnerDrinkPricesTable.branchId));
    }

    const overrides = await db
      .select()
      .from(partnerDrinkPricesTable)
      .where(and(...conditions));
    
    const overridesMap = new Map(overrides.map(o => [o.drinkId, o.price]));

    const result = drinks.map(d => ({
      drinkId: d.id,
      name: d.name,
      globalPrice: Number(d.basePrice),
      overridePrice: overridesMap.has(d.id) ? Number(overridesMap.get(d.id)) : null,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to load partner prices" });
  }
});

// POST /admin/partner-prices (Bulk Save)
adminRouter.post("/admin/partner-prices", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  try {
    const { partnerId, branchId, prices } = req.body as { partnerId: number; branchId: number | null; prices: { drinkId: number; price: number | null }[] };
    if (!partnerId || !Array.isArray(prices)) {
      res.status(400).json({ error: "Invalid partnerId or prices list" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const p of prices) {
        const deleteConditions = [
          eq(partnerDrinkPricesTable.partnerId, partnerId),
          eq(partnerDrinkPricesTable.drinkId, p.drinkId)
        ];
        if (branchId) {
          deleteConditions.push(eq(partnerDrinkPricesTable.branchId, branchId));
        } else {
          deleteConditions.push(isNull(partnerDrinkPricesTable.branchId));
        }

        if (p.price === null || p.price === undefined || isNaN(p.price)) {
          // Delete override if null
          await tx.delete(partnerDrinkPricesTable).where(and(...deleteConditions));
        } else {
          // Upsert override
          const [existing] = await tx
            .select()
            .from(partnerDrinkPricesTable)
            .where(and(...deleteConditions))
            .limit(1);
          if (existing) {
            await tx
              .update(partnerDrinkPricesTable)
              .set({ price: String(p.price), updatedAt: new Date() })
              .where(eq(partnerDrinkPricesTable.id, existing.id));
          } else {
            await tx
              .insert(partnerDrinkPricesTable)
              .values({
                partnerId,
                drinkId: p.drinkId,
                branchId: branchId || null,
                price: String(p.price),
              });
          }
        }
      }
    });

    res.json({ message: "Partner prices updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save partner prices" });
  }
});

export default adminRouter;
