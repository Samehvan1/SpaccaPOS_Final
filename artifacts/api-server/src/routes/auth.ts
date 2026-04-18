import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { BaristaLoginBody, BaristaLoginResponse, GetMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = BaristaLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.pin, parsed.data.pin))
    .limit(1);

  if (!user[0]) {
    res.status(401).json({ error: "Invalid PIN" });
    return;
  }

  (req.session as unknown as Record<string, unknown>).userId = user[0].id;

  const payload = BaristaLoginResponse.parse({
    user: {
      id: user[0].id,
      name: user[0].name,
      role: user[0].role,
    },
  });

  req.session.save((err) => {
    if (err) {
      res.status(500).json({ error: "Session error" });
      return;
    }
    res.json(payload);
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.sendStatus(204);
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = (req.session as unknown as Record<string, unknown>).userId as number | undefined;

  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(
    GetMeResponse.parse({
      id: user.id,
      name: user.name,
      role: user.role,
    })
  );
});

export default router;
