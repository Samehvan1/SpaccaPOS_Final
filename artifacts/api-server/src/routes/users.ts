import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const usersRouter = Router();

// Zod schemas for validation (matching OpenAPI)
const CreateUserSchema = z.object({
  name: z.string().min(1),
  role: z.enum(["admin", "barista", "frontdesk", "cashier", "pickup"]),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits"),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "barista", "frontdesk", "cashier", "pickup"]).optional(),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits").optional(),
});

// GET /users
usersRouter.get("/users", async (req, res) => {
  try {
    const allUsers = await db.select().from(usersTable);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to list users" });
  }
});

// POST /users
usersRouter.post("/users", async (req, res) => {
  try {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const [newUser] = await db.insert(usersTable).values(parsed.data).returning();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PATCH /users/:id
usersRouter.patch("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = UpdateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /users/:id
usersRouter.delete("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deletedUser] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default usersRouter;
