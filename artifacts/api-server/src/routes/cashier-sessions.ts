import { Router, type IRouter } from "express";
import { eq, and, gte, lte, isNull, desc, sql, inArray } from "drizzle-orm";
import { db, cashierSessionsTable, usersTable, ordersTable } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

import bcrypt from "bcryptjs";
import { requirePermission } from "../middleware/permissions";

const CashierLoginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /cashier/login — verify PIN and start a session
router.post("/cashier/login", async (req, res): Promise<void> => {
  const parsed = CashierLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "cashierId and pin required" });
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

  if (user.role !== "cashier" && user.role !== "admin") {
    res.status(403).json({ error: "User is not a cashier" });
    return;
  }

  /* 
  // Reusing active session instead of creating duplicates
  // This allows the same cashier to work across multiple devices in one shift
  */
  const [existingSession] = await db
    .select()
    .from(cashierSessionsTable)
    .where(and(eq(cashierSessionsTable.cashierId, user.id), isNull(cashierSessionsTable.endedAt)))
    .limit(1);

  let session = existingSession;

  const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  if (!session) {
    // Create new session
    const [newSession] = await db
      .insert(cashierSessionsTable)
      .values({ 
        cashierId: user.id,
        ipAddress,
        userAgent
      })
      .returning();
    session = newSession;
  } else {
    // Update existing session with current IP/UA
    await db.update(cashierSessionsTable)
      .set({ ipAddress, userAgent })
      .where(eq(cashierSessionsTable.id, session.id));
  }

  // Store session in express session
  const sess = req.session as any;
  sess.cashierSessionId = session.id;
  sess.cashierId = user.id;
  sess.userId = user.id; // Unify with standard auth
  sess.role = user.role;
  sess.branchId = user.branchId;


  req.session.save((err) => {
    if (err) {
      res.status(500).json({ error: "Session error" });
      return;
    }
    res.json({
      sessionId: session.id,
      cashier: { id: user.id, name: user.name, role: user.role },
      startedAt: session.startedAt,
    });
  });
});

// POST /cashier/end-session — end the current shift
router.post("/cashier/end-session", requirePermission("cashier:close_session"), async (req, res): Promise<void> => {
  const sessionId = (req.session as any).cashierSessionId as number | undefined;
  if (!sessionId) {
    res.status(400).json({ error: "No active cashier session" });
    return;
  }

  await db
    .update(cashierSessionsTable)
    .set({ endedAt: new Date() })
    .where(eq(cashierSessionsTable.id, sessionId));

  delete (req.session as any).cashierSessionId;
  delete (req.session as any).cashierId;

  req.session.save(() => {
    res.json({ ok: true });
  });
});

// GET /cashier/active — return current active cashier session
router.get("/cashier/active", async (req, res): Promise<void> => {
  const sessionId = (req.session as any).cashierSessionId as number | undefined;
  if (!sessionId) {
    res.json(null);
    return;
  }

  const [session] = await db
    .select()
    .from(cashierSessionsTable)
    .where(eq(cashierSessionsTable.id, sessionId));

  if (!session || session.endedAt) {
    res.json(null);
    return;
  }

  const [cashier] = await db
    .select({ id: usersTable.id, name: usersTable.name, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, session.cashierId));

  res.json({
    sessionId: session.id,
    cashier: cashier ?? null,
    startedAt: session.startedAt,
  });
});

// GET /cashier/performance/:cashierId — stats for a specific cashier
router.get("/cashier/performance/:cashierId", requirePermission("cashier:view_reports"), async (req, res): Promise<void> => {
  const cashierId = parseInt(req.params.cashierId as string);
  if (isNaN(cashierId)) {
    res.status(400).json({ error: "Invalid cashierId" });
    return;
  }

  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const conditions: any[] = [eq(ordersTable.cashierId, cashierId)];
  if (startDate) conditions.push(gte(ordersTable.createdAt, new Date(startDate)));
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(ordersTable.createdAt, end));
  }

  const orders = await db
    .select({
      id: ordersTable.id,
      total: ordersTable.total,
      paymentMethod: ordersTable.paymentMethod,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .where(and(...conditions));

  const completedOrders = orders.filter(o => o.status === "completed" || o.status === "paid" || o.status === "ready" || o.status === "in_progress");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total as any), 0);
  const cashRevenue = completedOrders.filter(o => o.paymentMethod === "cash").reduce((sum, o) => sum + parseFloat(o.total as any), 0);
  const cardRevenue = completedOrders.filter(o => o.paymentMethod === "card").reduce((sum, o) => sum + parseFloat(o.total as any), 0);
  const walletRevenue = completedOrders.filter(o => o.paymentMethod === "wallet").reduce((sum, o) => sum + parseFloat(o.total as any), 0);

  const [cashier] = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, cashierId));

  res.json({
    cashier: cashier ?? null,
    totalOrders: completedOrders.length,
    totalRevenue,
    cashRevenue,
    cardRevenue,
    walletRevenue,
    avgOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
  });
});

// GET /cashier/sessions — list all sessions (admin)
router.get("/cashier/sessions", requirePermission("cashier:view_reports"), async (req, res): Promise<void> => {
  const { cashierId, startDate, endDate } = req.query as {
    cashierId?: string;
    startDate?: string;
    endDate?: string;
  };

  const conditions: any[] = [];
  if (cashierId) conditions.push(eq(cashierSessionsTable.cashierId, parseInt(cashierId)));
  if (startDate) conditions.push(gte(cashierSessionsTable.startedAt, new Date(startDate)));
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(cashierSessionsTable.startedAt, end));
  }

  const sessions = await db
    .select()
    .from(cashierSessionsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cashierSessionsTable.startedAt));

  // Get unique cashier IDs and fetch names
  const cashierIds = [...new Set(sessions.map(s => s.cashierId))];
  const cashiers = cashierIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable)
    : [];
  const cashierMap = new Map(cashiers.map(c => [c.id, c.name]));

  res.json(sessions.map(s => ({
    ...s,
    cashierName: cashierMap.get(s.cashierId) ?? "Unknown",
  })));
});

// GET /cashier/list — list all users with cashier/admin role
router.get("/cashier/list", requirePermission("cashier:view"), async (_req, res): Promise<void> => {
  const cashiers = await db
    .select({ id: usersTable.id, name: usersTable.name, role: usersTable.role })
    .from(usersTable)
    .where(inArray(usersTable.role, ['cashier', 'admin']));
  res.json(cashiers);
});

// GET /cashier/sessions/:id/performance — stats for a specific session
router.get("/cashier/sessions/:id/performance", requirePermission("cashier:view_reports"), async (req, res): Promise<void> => {
  const sessionId = parseInt(req.params.id as string);
  if (isNaN(sessionId)) {
    res.status(400).json({ error: "Invalid sessionId" });
    return;
  }

  const [session] = await db
    .select()
    .from(cashierSessionsTable)
    .where(eq(cashierSessionsTable.id, sessionId));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const start = session.startedAt;
  const end = session.endedAt || new Date();

  const orders = await db
    .select({
      total: ordersTable.total,
      paymentMethod: ordersTable.paymentMethod,
      status: ordersTable.status,
    })
    .from(ordersTable)
    .where(and(
      eq(ordersTable.cashierId, session.cashierId),
      gte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, start),
      lte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, end)
    ));

  const completedOrders = orders.filter(o => ["completed", "paid", "ready", "in_progress"].includes(o.status));
  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total as any), 0);
  const cashRevenue = completedOrders.filter(o => o.paymentMethod === "cash").reduce((sum, o) => sum + parseFloat(o.total as any), 0);
  const cardRevenue = completedOrders.filter(o => o.paymentMethod === "card").reduce((sum, o) => sum + parseFloat(o.total as any), 0);
  const walletRevenue = completedOrders.filter(o => o.paymentMethod === "wallet").reduce((sum, o) => sum + parseFloat(o.total as any), 0);

  const [cashier] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, session.cashierId));

  res.json({
    cashierName: cashier?.name ?? "Unknown",
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    totalOrders: completedOrders.length,
    totalRevenue,
    cashRevenue,
    cardRevenue,
    walletRevenue,
  });
});

export default router;
