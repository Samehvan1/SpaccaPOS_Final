import { Router, type IRouter } from "express";
import { db, usersTable, userPermissionsTable, permissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateUserBody, UpdateUserBody, UserDetail } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { requirePermission } from "../middleware/permissions";
import { logActivity } from "../lib/activity-logger";

const usersRouter: IRouter = Router();

// GET /users
usersRouter.get("/users", requirePermission("users:view"), async (req, res): Promise<void> => {
  try {
    const allUsers = await db.select().from(usersTable);
    res.json(allUsers.map(u => UserDetail.parse({
      ...u,
      username: u.username ?? `user_${u.id}`,
      isActive: u.isActive ?? true,
      createdAt: u.createdAt?.toISOString(),
      updatedAt: u.updatedAt?.toISOString(),
    })));
    return;
  } catch (error: any) {
    console.error("GET /users error:", error?.message || error);
    res.status(500).json({ error: "Failed to list users" });
    return;
  }
});

// POST /users
usersRouter.post("/users", requirePermission("users:create"), async (req, res): Promise<void> => {
  try {
    const parsed = CreateUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    const { password, ...userData } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(usersTable)
      .values({
        ...userData,
        passwordHash,
      })
      .returning();

    if (!newUser) {
      throw new Error("User creation failed: no data returned");
    }

    await logActivity(req, "CREATE_USER", "user", newUser.id, { role: newUser.role, name: newUser.name });

    res.status(201).json(UserDetail.parse({
      ...newUser,
      username: newUser.username ?? `user_${newUser.id}`,
      isActive: newUser.isActive ?? true,
      createdAt: newUser.createdAt?.toISOString(),
      updatedAt: newUser.updatedAt?.toISOString(),
    }));
    return;
  } catch (error: any) {
    console.error("POST /users error:", error?.message || error);
    res.status(500).json({ error: "Failed to create user" });
    return;
  }
});

// PATCH /users/:id
usersRouter.patch("/users/:id", requirePermission("users:update"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const parsed = UpdateUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    const updateData: any = { ...parsed.data };
    if (parsed.data.password) {
      updateData.passwordHash = await bcrypt.hash(parsed.data.password, 10);
      delete updateData.password;
    }
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await logActivity(req, "UPDATE_USER", "user", id, { role: updatedUser.role, name: updatedUser.name });

    res.json(UserDetail.parse({
      ...updatedUser,
      username: updatedUser.username ?? `user_${updatedUser.id}`,
      isActive: updatedUser.isActive ?? true,
      createdAt: updatedUser.createdAt?.toISOString(),
      updatedAt: updatedUser.updatedAt?.toISOString(),
    }));
    return;
  } catch (error: any) {
    console.error("PATCH /users/:id error:", error?.message || error);
    res.status(500).json({ error: "Failed to update user" });
    return;
  }
});

// DELETE /users/:id
usersRouter.delete("/users/:id", requirePermission("users:delete"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const [deletedUser] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();

    if (!deletedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await logActivity(req, "DELETE_USER", "user", id);

    res.status(204).end();
    return;
  } catch (error: any) {
    console.error("DELETE /users/:id error:", error?.message || error);
    res.status(500).json({ error: "Failed to delete user" });
    return;
  }
});

// ── User Permissions Endpoints ───────────────────────────────────────────────

// GET /users/:id/permissions
usersRouter.get("/users/:id/permissions", requirePermission("users:update"), async (req, res): Promise<void> => {
  try {
    const userId = parseInt(req.params.id as string);
    const permissions = await db
      .select()
      .from(userPermissionsTable)
      .where(eq(userPermissionsTable.userId, userId));
    
    res.json(permissions);
  } catch (error: any) {
    console.error("GET /users/:id/permissions error:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch user permissions" });
  }
});

// POST /users/:id/permissions
usersRouter.post("/users/:id/permissions", requirePermission("users:update"), async (req, res): Promise<void> => {
  try {
    const userId = parseInt(req.params.id as string);
    const { permissions } = req.body; // Array<{ key, granted }>

    if (!Array.isArray(permissions)) {
      res.status(400).json({ error: "Permissions array required" });
      return;
    }

    await db.transaction(async (tx) => {
      // Clear existing overrides
      await tx.delete(userPermissionsTable).where(eq(userPermissionsTable.userId, userId));
      
      // Insert new overrides
      if (permissions.length > 0) {
        await tx.insert(userPermissionsTable).values(
          permissions.map((p: any) => ({
            userId,
            permissionKey: p.key,
            granted: p.granted ?? true,
          }))
        );
      }
    });

    await logActivity(req, "UPDATE_USER_PERMISSIONS", "user", userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error("POST /users/:id/permissions error:", error?.message || error);
    res.status(500).json({ error: "Failed to update user permissions" });
  }
});

export default usersRouter;
