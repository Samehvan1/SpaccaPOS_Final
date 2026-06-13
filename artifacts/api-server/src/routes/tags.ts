import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tagsTable } from "@workspace/db";
import { requirePermission } from "../middleware/permissions";
import { logActivity } from "../lib/activity-logger";

const router: IRouter = Router();

// GET /admin/tags - List all tags
router.get("/admin/tags", requirePermission("admin:view"), async (req, res): Promise<void> => {
  try {
    const tags = await db.select().from(tagsTable).orderBy(tagsTable.name);
    res.json({ tags });
  } catch (error: any) {
    console.error("[GET /admin/tags] error:", error?.message);
    res.status(500).json({ error: "Failed to list tags" });
  }
});

// POST /admin/tags - Create a tag
router.post("/admin/tags", requirePermission("admin:view"), async (req, res): Promise<void> => {
  const { name, description } = req.body ?? {};
  
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Tag name must be at least 2 characters" });
    return;
  }

  try {
    const cleanName = name.trim();
    const cleanDescription = typeof description === "string" ? description.trim() : null;

    const [newTag] = await db
      .insert(tagsTable)
      .values({
        name: cleanName,
        description: cleanDescription,
      })
      .returning();

    await logActivity(req, "CREATE_TAG", "tag", newTag.id, { name: cleanName });
    res.status(201).json({ tag: newTag });
  } catch (error: any) {
    console.error("[POST /admin/tags] error:", error?.message);
    if (error?.code === "23505" || error?.message?.includes("unique")) {
      res.status(409).json({ error: "Tag name already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create tag: " + error?.message });
  }
});

// PATCH /admin/tags/:id - Update a tag
router.patch("/admin/tags/:id", requirePermission("admin:view"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const { name, description } = req.body ?? {};

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    res.status(400).json({ error: "Tag name must be at least 2 characters" });
    return;
  }

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = typeof description === "string" ? description.trim() : null;
    updateData.updatedAt = new Date();

    const [updatedTag] = await db
      .update(tagsTable)
      .set(updateData)
      .where(eq(tagsTable.id, id))
      .returning();

    if (!updatedTag) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    await logActivity(req, "UPDATE_TAG", "tag", id, updateData);
    res.json({ tag: updatedTag });
  } catch (error: any) {
    console.error("[PATCH /admin/tags/:id] error:", error?.message);
    if (error?.code === "23505" || error?.message?.includes("unique")) {
      res.status(409).json({ error: "Tag name already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to update tag: " + error?.message });
  }
});

// DELETE /admin/tags/:id - Delete a tag
router.get("/admin/tags/:id", requirePermission("admin:view"), async (req, res): Promise<void> => {
  // placeholder or noop
});

router.delete("/admin/tags/:id", requirePermission("admin:view"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);

  try {
    const [deletedTag] = await db
      .delete(tagsTable)
      .where(eq(tagsTable.id, id))
      .returning();

    if (!deletedTag) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    await logActivity(req, "DELETE_TAG", "tag", id, { name: deletedTag.name });
    res.sendStatus(204);
  } catch (error: any) {
    console.error("[DELETE /admin/tags/:id] error:", error?.message);
    res.status(500).json({ error: "Failed to delete tag: " + error?.message });
  }
});

export default router;
