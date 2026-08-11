import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, usersTable, activityLogsTable, branchesTable } from "@workspace/db";
import { logActivity } from "../lib/activity-logger";
import { BaristaLoginBody, BaristaLoginResponse, GetMeResponse } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { resolveUserPermissions } from "../lib/permissions";


export class RateLimiter {
  private requests = new Map<string, number[]>();
  constructor(private windowMs: number, private maxRequests: number) {}
  isLimitExceeded(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) ?? [];
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
    if (validTimestamps.length >= this.maxRequests) {
      return true;
    }
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return false;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

const loginRateLimiter = new RateLimiter(15 * 60 * 1000, 10); // 10 attempts per 15 mins
const pinRateLimiter = new RateLimiter(5 * 60 * 1000, 10); // 10 attempts per 5 mins

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = BaristaLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  const ip = req.ip || "unknown-ip";
  const rateLimitKey = `login:${ip}:${username}`;

  if (loginRateLimiter.isLimitExceeded(rateLimitKey)) {
    res.status(429).json({ error: "Too many login attempts. Please try again in 15 minutes." });
    return;
  }

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

  // Login successful, reset rate limit counter
  loginRateLimiter.reset(rateLimitKey);

  const permissions = await resolveUserPermissions(result.user.id, result.user.role);

  (req.session as unknown as Record<string, unknown>).userId = result.user.id;
  (req.session as unknown as Record<string, unknown>).branchId = result.user.branchId;
  (req.session as unknown as Record<string, unknown>).role = result.user.role;
  (req.session as unknown as Record<string, unknown>).permissions = permissions;

  // Log activity
  await db.insert(activityLogsTable).values({
    userId: result.user.id,
    action: "LOGIN",
    entityType: "user",
    entityId: result.user.id,
    details: { ip: req.ip, userAgent: req.get("user-agent") },
  });

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

  let permissions = (req.session as any).permissions;
  if (!permissions) {
    permissions = await resolveUserPermissions(result.user.id, result.user.role);
    (req.session as any).permissions = permissions;
    await new Promise<void>((resolve) => req.session.save(() => resolve()));
  }

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

  const ip = req.ip || "unknown-ip";
  const rateLimitKey = `pin:${ip}`;

  if (pinRateLimiter.isLimitExceeded(rateLimitKey)) {
    res.status(429).json({ error: "Too many PIN verification attempts. Please try again in 5 minutes." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.pin, pin),
        inArray(usersTable.role, ["admin", "cashier", "supervisor"]),
        eq(usersTable.isActive, true)
      )
    )
    .limit(1);

  if (!user) {
    console.warn(`[Security] PIN verification failed: Invalid or inactive Admin PIN`);
    res.status(401).json({ error: "Invalid or inactive PIN" });
    return;
  }

  // PIN verified successfully, reset rate limit counter
  pinRateLimiter.reset(rateLimitKey);

  res.json({ success: true, message: "PIN verified" });
});

// Allow logged-in user to change their own password and PIN
router.post("/auth/change-profile", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { password, pin } = req.body;
  
  if (!password && !pin) {
    res.status(400).json({ error: "Either password or PIN must be provided" });
    return;
  }

  const updateData: any = {};
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }
  if (pin) {
    updateData.pin = pin;
  }

  await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, userId));

  await logActivity(req, "UPDATE_OWN_PROFILE", "user", userId, { 
    changedPassword: !!password, 
    changedPin: !!pin 
  });

  res.json({ success: true, message: "Profile updated successfully" });
});

export default router;
