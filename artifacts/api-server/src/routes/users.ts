import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody, UpdateUserBody, UserDetail } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { requirePermission } from "../middleware/permissions";

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
  } catch (error) {
    console.error("GET /users error:", error);
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

    res.status(201).json(UserDetail.parse({
      ...newUser,
      username: newUser.username ?? `user_${newUser.id}`,
      isActive: newUser.isActive ?? true,
      createdAt: newUser.createdAt?.toISOString(),
      updatedAt: newUser.updatedAt?.toISOString(),
    }));
    return;
  } catch (error) {
    console.error("POST /users error:", error);
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

    res.json(UserDetail.parse({
      ...updatedUser,
      username: updatedUser.username ?? `user_${updatedUser.id}`,
      isActive: updatedUser.isActive ?? true,
      createdAt: updatedUser.createdAt?.toISOString(),
      updatedAt: updatedUser.updatedAt?.toISOString(),
    }));
    return;
  } catch (error) {
    console.error("PATCH /users/:id error:", error);
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

    res.status(204).end();
    return;
  } catch (error) {
    console.error("DELETE /users/:id error:", error);
    res.status(500).json({ error: "Failed to delete user" });
    return;
  }
});

export default usersRouter;
