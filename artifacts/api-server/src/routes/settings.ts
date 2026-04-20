import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/settings", async (req, res): Promise<void> => {
  const scope = req.query.scope as string | undefined;
  const currentUserId = (req.session as any).userId as number | undefined;

  let query = db.select().from(settingsTable);

  if (scope === "global") {
    query = query.where(eq(settingsTable.scope, "global")) as any;
  } else if (scope === "user") {
    if (!currentUserId) {
      res.status(401).json({ error: "Not authenticated for user settings" });
      return;
    }
    query = query.where(and(eq(settingsTable.scope, "user"), eq(settingsTable.userId, currentUserId))) as any;
  }

  const rows = await query;
  res.json(rows);
});

router.patch("/settings", async (req, res): Promise<void> => {
  const { scope, settings } = req.body;
  const currentUserId = (req.session as any).userId as number | undefined;

  if (!scope || !settings || !Array.isArray(settings)) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  if (scope === "user" && !currentUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const results = [];
  for (const s of settings) {
    const { key, value } = s;
    if (!key) continue;

    // Manual upsert logic
    let existing;
    if (scope === "global") {
      [existing] = await db.select()
        .from(settingsTable)
        .where(and(eq(settingsTable.scope, "global"), eq(settingsTable.key, key)))
        .limit(1);
    } else {
      [existing] = await db.select()
        .from(settingsTable)
        .where(and(
          eq(settingsTable.scope, "user"), 
          eq(settingsTable.userId, currentUserId!), 
          eq(settingsTable.key, key)
        ))
        .limit(1);
    }

    if (existing) {
      const [updated] = await db.update(settingsTable)
        .set({ value, updatedAt: new Date() })
        .where(eq(settingsTable.id, existing.id))
        .returning();
      results.push(updated);
    } else {
      const [inserted] = await db.insert(settingsTable).values({
        scope,
        userId: scope === "user" ? currentUserId : null,
        key,
        value
      }).returning();
      results.push(inserted);
    }
  }

  res.json(results);
});

export default router;
