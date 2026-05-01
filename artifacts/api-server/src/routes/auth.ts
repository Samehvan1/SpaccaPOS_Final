import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, activityLogsTable } from "@workspace/db";
import { logActivity } from "../lib/activity-logger";
import { BaristaLoginBody, BaristaLoginResponse, GetMeResponse } from "@workspace/api-zod";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = BaristaLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account is inactive" });
    return;
  }

  (req.session as unknown as Record<string, unknown>).userId = user.id;

  // Log activity
  await db.insert(activityLogsTable).values({
    userId: user.id,
    action: "LOGIN",
    entityType: "user",
    entityId: user.id,
    details: { ip: req.ip, userAgent: req.get("user-agent") },
  });

  const payload = BaristaLoginResponse.parse({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
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
  await logActivity(req, "LOGOUT", "user", (req.session as any).userId);
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

router.post("/auth/verify-pin", async (req, res): Promise<void> => {
  const { pin } = req.body;
  if (!pin) {
    res.status(400).json({ error: "PIN is required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.pin, pin), eq(usersTable.role, "admin")))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid Admin PIN" });
    return;
  }

  res.json({ success: true, message: "PIN verified" });
});

// EMERGENCY: Bypasses password for the first admin user found. 
// Use this to recover access if password hashes are broken.
router.post("/auth/emergency-login", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, "admin")).limit(1);
  if (!user) {
    res.status(404).json({ error: "Admin user not found" });
    return;
  }
  (req.session as any).userId = user.id;
  req.session.save(() => res.json({ success: true }));
});

export default router;
