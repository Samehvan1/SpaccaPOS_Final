import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, activityLogsTable, branchesTable } from "@workspace/db";
import { logActivity } from "../lib/activity-logger";
import { BaristaLoginBody, BaristaLoginResponse, GetMeResponse } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { resolveUserPermissions } from "../lib/permissions";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = BaristaLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [result] = await db
    .select({
      user: usersTable,
      branchName: branchesTable.name,
    })
    .from(usersTable)
    .leftJoin(branchesTable, eq(usersTable.branchId, branchesTable.id))
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!result || !result.user.passwordHash) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, result.user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (!result.user.isActive) {
    res.status(403).json({ error: "Account is inactive" });
    return;
  }

  (req.session as unknown as Record<string, unknown>).userId = result.user.id;
  (req.session as unknown as Record<string, unknown>).branchId = result.user.branchId;

  // Log activity
  await db.insert(activityLogsTable).values({
    userId: result.user.id,
    action: "LOGIN",
    entityType: "user",
    entityId: result.user.id,
    details: { ip: req.ip, userAgent: req.get("user-agent") },
  });

  const permissions = await resolveUserPermissions(result.user.id, result.user.role);

  const payload = BaristaLoginResponse.parse({
    user: {
      id: result.user.id,
      name: result.user.name,
      role: result.user.role,
      permissions,
      branchId: result.user.branchId,
      branch: result.user.branchId ? {
        id: result.user.branchId,
        name: result.branchName || "Unknown Branch",
      } : undefined,
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

  const [result] = await db
    .select({
      user: usersTable,
      branchName: branchesTable.name,
    })
    .from(usersTable)
    .leftJoin(branchesTable, eq(usersTable.branchId, branchesTable.id))
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!result) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const permissions = await resolveUserPermissions(result.user.id, result.user.role);

  res.json(
    GetMeResponse.parse({
      id: result.user.id,
      name: result.user.name,
      role: result.user.role,
      permissions,
      branchId: result.user.branchId,
      branch: result.user.branchId ? {
        id: result.user.branchId,
        name: result.branchName || "Unknown Branch",
      } : undefined,
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
