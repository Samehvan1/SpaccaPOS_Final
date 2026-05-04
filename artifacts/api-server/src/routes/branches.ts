import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, branchesTable, insertBranchSchema } from "@workspace/db";
import { requirePermission } from "../middleware/permissions";

const router: IRouter = Router();

// GET /branches
router.get("/", async (req, res): Promise<void> => {
  const branches = await db
    .select()
    .from(branchesTable)
    .orderBy(asc(branchesTable.name));
  res.json(branches);
});

// POST /branches
router.post("/", requirePermission("admin:manage_branches"), async (req, res): Promise<void> => {
  const parsed = insertBranchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [branch] = await db
    .insert(branchesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(branch);
});

// PATCH /branches/:id
router.patch("/:id", requirePermission("admin:manage_branches"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = insertBranchSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [branch] = await db
    .update(branchesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(branchesTable.id, id))
    .returning();

  if (!branch) { res.status(404).json({ error: "Branch not found" }); return; }
  res.json(branch);
});

// DELETE /branches/:id
router.delete("/:id", requirePermission("admin:manage_branches"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [branch] = await db
    .delete(branchesTable)
    .where(eq(branchesTable.id, id))
    .returning();

  if (!branch) { res.status(404).json({ error: "Branch not found" }); return; }
  res.sendStatus(204);
});

export default router;
