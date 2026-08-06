import { Router, type IRouter } from "express";
import { eq, and, gte, lte, isNull, desc, sql, inArray, or } from "drizzle-orm";
import { db, cashierSessionsTable, usersTable, ordersTable, orderItemsTable, drinksTable, drinkCategoriesTable, orderPaymentsTable, branchesTable, orderItemCustomizationsTable, shiftCloseRecordsTable } from "@workspace/db";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";
import { serializeDates } from "../lib/serialize";

const router: IRouter = Router();

import bcrypt from "bcryptjs";
import { requirePermission } from "../middleware/permissions";
import { resolveUserPermissions } from "../lib/permissions";
import { RateLimiter } from "./auth";

const cashierLoginLimiter = new RateLimiter(15 * 60 * 1000, 10); // 10 attempts per 15 mins per IP

const CashierLoginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /cashier/login — verify PIN and start a session
router.post("/cashier/login", async (req, res): Promise<void> => {
  const ip = req.ip || "unknown-ip";
  const rateLimitKey = `cashier-login:${ip}`;
  if (cashierLoginLimiter.isLimitExceeded(rateLimitKey)) {
    res.status(429).json({ error: "Too many login attempts. Please try again in 15 minutes." });
    return;
  }

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

  const permissions = await resolveUserPermissions(user.id, user.role);

  // Store session in express session
  const sess = req.session as any;
  sess.cashierSessionId = session.id;
  sess.cashierId = user.id;
  sess.userId = user.id; // Unify with standard auth
  sess.role = user.role;
  sess.branchId = user.branchId;
  sess.permissions = permissions;


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

// POST /cashier/end-session — end the current shift & record cash reconciliation
router.post("/cashier/end-session", requirePermission("cashier:close_session"), async (req, res): Promise<void> => {
  const sessionId = (req.session as any).cashierSessionId as number | undefined;
  if (!sessionId) {
    res.status(400).json({ error: "No active cashier session" });
    return;
  }

  const [session] = await db.select().from(cashierSessionsTable).where(eq(cashierSessionsTable.id, sessionId)).limit(1);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const { cashCounted = 0, cardCounted = 0, partnerCardCounted = 0, notes } = req.body || {};

  const now = new Date();
  const start = session.startedAt;

  // Calculate system payment totals for this session
  const ordersResult = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(and(
      eq(ordersTable.cashierId, session.cashierId),
      gte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, start),
      lte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, now),
      inArray(ordersTable.status, ["completed", "paid", "ready", "in_progress"])
    ));

  const orderIds = ordersResult.map(o => o.id);
  let cashSystem = 0;
  let cardSystem = 0;
  let partnerCardSystem = 0;
  let pointsRedeemed = 0;

  if (orderIds.length > 0) {
    const payments = await db
      .select({ method: orderPaymentsTable.paymentMethod, amount: orderPaymentsTable.amount })
      .from(orderPaymentsTable)
      .where(inArray(orderPaymentsTable.orderId, orderIds));

    for (const p of payments) {
      const amt = parseFloat(p.amount) || 0;
      if (p.method === "cash") cashSystem += amt;
      else if (p.method === "card") cardSystem += amt;
      else if (p.method === "partner_card") partnerCardSystem += amt;
      else if (p.method === "points") pointsRedeemed += amt;
    }
  }

  const cashVar = Number((Number(cashCounted) - cashSystem).toFixed(2));
  const cardVar = Number((Number(cardCounted) - cardSystem).toFixed(2));
  const partnerCardVar = Number((Number(partnerCardCounted) - partnerCardSystem).toFixed(2));

  const cashStat = Math.abs(cashVar) < 0.01 ? "ok" : (cashVar > 0 ? "over" : "short");
  const cardStat = Math.abs(cardVar) < 0.01 ? "ok" : (cardVar > 0 ? "over" : "short");
  const partnerCardStat = Math.abs(partnerCardVar) < 0.01 ? "ok" : (partnerCardVar > 0 ? "over" : "short");

  const [closeRecord] = await db.insert(shiftCloseRecordsTable).values({
    sessionId,
    cashierId: session.cashierId,
    cashSystem: String(cashSystem.toFixed(2)),
    cashCounted: String(Number(cashCounted).toFixed(2)),
    cashVariance: String(cashVar.toFixed(2)),
    cashStatus: cashStat,

    cardSystem: String(cardSystem.toFixed(2)),
    cardCounted: String(Number(cardCounted).toFixed(2)),
    cardVariance: String(cardVar.toFixed(2)),
    cardStatus: cardStat,

    partnerCardSystem: String(partnerCardSystem.toFixed(2)),
    partnerCardCounted: String(Number(partnerCardCounted).toFixed(2)),
    partnerCardVariance: String(partnerCardVar.toFixed(2)),
    partnerCardStatus: partnerCardStat,

    pointsRedeemed: String(pointsRedeemed.toFixed(2)),
    notes: notes || null,
  }).returning();

  await db
    .update(cashierSessionsTable)
    .set({ endedAt: now })
    .where(eq(cashierSessionsTable.id, sessionId));

  delete (req.session as any).cashierSessionId;
  delete (req.session as any).cashierId;

  req.session.save(() => {
    res.json({
      ok: true,
      closeRecord,
      summary: {
        cash: { system: cashSystem, counted: Number(cashCounted), variance: cashVar, status: cashStat },
        card: { system: cardSystem, counted: Number(cardCounted), variance: cardVar, status: cardStat },
        partnerCard: { system: partnerCardSystem, counted: Number(partnerCardCounted), variance: partnerCardVar, status: partnerCardStat },
        pointsRedeemed,
      }
    });
  });
});

// GET /cashier/active — return current active cashier session
router.get("/cashier/active", async (req, res): Promise<void> => {
  let sessionId = (req.session as any).cashierSessionId as number | undefined;
  let userRole = (req.session as any).role;
  const userId = (req.session as any).userId;

  // If role is missing from session (legacy session), fetch it from DB
  if (!userRole && userId) {
    const [user] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (user) {
      userRole = user.role;
      (req.session as any).role = userRole; // Cache it
    }
  }
  
  if (!sessionId && userRole === "admin") {
    // If admin and no session in session storage, find the latest open session overall
    const [latestOpen] = await db
      .select()
      .from(cashierSessionsTable)
      .where(isNull(cashierSessionsTable.endedAt))
      .orderBy(desc(cashierSessionsTable.startedAt))
      .limit(1);
    
    if (latestOpen) sessionId = latestOpen.id;
  }

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

  // IDOR protection: non-admins can only view their own performance stats
  const sessionUserId = (req.session as any).userId as number | undefined;
  const sessionRole = (req.session as any).role as string | undefined;
  if (sessionRole !== "admin" && cashierId !== sessionUserId) {
    res.status(403).json({ error: "Access denied: you may only view your own performance stats" });
    return;
  }

  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const conditions: any[] = [eq(ordersTable.cashierId, cashierId)];
  if (startDate) conditions.push(gte(ordersTable.createdAt, startOfDay(new Date(startDate))));
  if (endDate) {
    conditions.push(lte(ordersTable.createdAt, endOfDay(new Date(endDate))));
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
  const orderIds = completedOrders.map(o => o.id);
  let cashRevenue = 0, cardRevenue = 0, partnerCardRevenue = 0, walletRevenue = 0, hospitalityRevenue = 0, pointsRevenue = 0;
  let cashOrders = 0, cardOrders = 0, partnerCardOrders = 0, walletOrders = 0, hospitalityOrders = 0, pointsOrders = 0;

  if (orderIds.length > 0) {
    const payments = await db
      .select({ orderId: orderPaymentsTable.orderId, paymentMethod: orderPaymentsTable.paymentMethod, amount: orderPaymentsTable.amount })
      .from(orderPaymentsTable)
      .where(inArray(orderPaymentsTable.orderId, orderIds));
    
    const cashOrderIds = new Set<number>();
    const cardOrderIds = new Set<number>();
    const partnerCardOrderIds = new Set<number>();
    const walletOrderIds = new Set<number>();
    const hospitalityOrderIds = new Set<number>();
    const pointsOrderIds = new Set<number>();

    for (const p of payments) {
      const amt = parseFloat(p.amount);
      if (p.paymentMethod === "cash") {
        cashRevenue += amt;
        cashOrderIds.add(p.orderId);
      } else if (p.paymentMethod === "card") {
        cardRevenue += amt;
        cardOrderIds.add(p.orderId);
      } else if (p.paymentMethod === "partner_card") {
        partnerCardRevenue += amt;
        partnerCardOrderIds.add(p.orderId);
      } else if (p.paymentMethod === "wallet") {
        walletRevenue += amt;
        walletOrderIds.add(p.orderId);
      } else if (p.paymentMethod === "hospitality") {
        hospitalityRevenue += amt;
        hospitalityOrderIds.add(p.orderId);
      } else if (p.paymentMethod === "points") {
        pointsRevenue += amt;
        pointsOrderIds.add(p.orderId);
      }
    }

    cashOrders = cashOrderIds.size;
    cardOrders = cardOrderIds.size;
    partnerCardOrders = partnerCardOrderIds.size;
    walletOrders = walletOrderIds.size;
    hospitalityOrders = hospitalityOrderIds.size;
    pointsOrders = pointsOrderIds.size;
  }

  const [cashier] = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, cashierId));

  res.json({
    cashier: cashier ?? null,
    totalOrders: completedOrders.length,
    totalRevenue,
    cashRevenue,
    cashOrders,
    cardRevenue,
    cardOrders,
    partnerCardRevenue,
    partnerCardOrders,
    walletRevenue,
    walletOrders,
    hospitalityRevenue,
    hospitalityOrders,
    pointsRevenue,
    pointsOrders,
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
  if (startDate) conditions.push(gte(cashierSessionsTable.startedAt, startOfDay(new Date(startDate))));
  if (endDate) {
    conditions.push(lte(cashierSessionsTable.startedAt, endOfDay(new Date(endDate))));
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

  // Fetch all completed orders for these cashiers to match them to sessions in memory
  let orders: any[] = [];
  const paymentsMap = new Map<number, { method: string; amount: number }[]>();

  if (cashierIds.length > 0) {
    orders = await db
      .select({
        id: ordersTable.id,
        total: ordersTable.total,
        cashierId: ordersTable.cashierId,
        time: sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`
      })
      .from(ordersTable)
      .where(and(
        inArray(ordersTable.cashierId, cashierIds),
        inArray(ordersTable.status, ["completed", "paid", "ready", "in_progress"])
      ));

    const orderIds = orders.map(o => o.id);
    if (orderIds.length > 0) {
      const payments = await db
        .select({ orderId: orderPaymentsTable.orderId, method: orderPaymentsTable.paymentMethod, amount: orderPaymentsTable.amount })
        .from(orderPaymentsTable)
        .where(inArray(orderPaymentsTable.orderId, orderIds));

      for (const p of payments) {
        if (!paymentsMap.has(p.orderId)) {
          paymentsMap.set(p.orderId, []);
        }
        paymentsMap.get(p.orderId)!.push({
          method: p.method,
          amount: parseFloat(p.amount),
        });
      }
    }
  }

    // Fetch shift close records for these sessions
    const sessionIds = sessions.map(s => s.id);
    const closeRecords = sessionIds.length > 0
      ? await db.select().from(shiftCloseRecordsTable).where(inArray(shiftCloseRecordsTable.sessionId, sessionIds))
      : [];
    const closeRecordsMap = new Map(closeRecords.map(cr => [cr.sessionId, cr]));

  const responseSessions = sessions.map(s => {
    const start = new Date(s.startedAt).getTime();
    const end = s.endedAt ? new Date(s.endedAt).getTime() : Date.now();
    
    let totalRevenue = 0;
    let totalOrders = 0;
    let cashRevenue = 0;
    let cardRevenue = 0;
    let partnerCardRevenue = 0;
    let walletRevenue = 0;
    let hospitalityRevenue = 0;
    let pointsRevenue = 0;

    for (const o of orders) {
      if (o.cashierId !== s.cashierId) continue;
      const oTime = new Date(o.time).getTime();
      if (oTime >= start && oTime <= end) {
        totalOrders++;
        totalRevenue += parseFloat(o.total as any);
        
        const payments = paymentsMap.get(o.id) || [];
        for (const p of payments) {
          if (p.method === "cash") cashRevenue += p.amount;
          else if (p.method === "card") cardRevenue += p.amount;
          else if (p.method === "partner_card") partnerCardRevenue += p.amount;
          else if (p.method === "wallet") walletRevenue += p.amount;
          else if (p.method === "hospitality") hospitalityRevenue += p.amount;
          else if (p.method === "points") pointsRevenue += p.amount;
        }
      }
    }

    return {
      ...s,
      cashierName: cashierMap.get(s.cashierId) ?? "Unknown",
      totalOrders,
      totalRevenue,
      cashRevenue,
      cardRevenue,
      partnerCardRevenue,
      walletRevenue,
      hospitalityRevenue,
      pointsRevenue,
      closeRecord: closeRecordsMap.get(s.id) ?? null,
    };
  });

  res.json(responseSessions);
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

    const ordersResult = await db
      .select({
        id: ordersTable.id,
        total: ordersTable.total,
        status: ordersTable.status,
      })
      .from(ordersTable)
      .where(and(
        eq(ordersTable.cashierId, session.cashierId),
        gte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, start),
        lte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, end)
      ));

    const completedOrders = ordersResult.filter(o => ["completed", "paid", "ready", "in_progress"].includes(o.status));
    const orderIds = completedOrders.map(o => o.id);
    const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total as any), 0);

    let cashRevenue = 0, cardRevenue = 0, partnerCardRevenue = 0, walletRevenue = 0, hospitalityRevenue = 0, pointsRevenue = 0;
    let cashOrders = 0, cardOrders = 0, partnerCardOrders = 0, walletOrders = 0, hospitalityOrders = 0, pointsOrders = 0;
    if (orderIds.length > 0) {
      const payments = await db
        .select({ orderId: orderPaymentsTable.orderId, method: orderPaymentsTable.paymentMethod, amount: orderPaymentsTable.amount })
        .from(orderPaymentsTable)
        .where(inArray(orderPaymentsTable.orderId, orderIds));
      
      const cashOrderIds = new Set<number>();
      const cardOrderIds = new Set<number>();
      const partnerCardOrderIds = new Set<number>();
      const walletOrderIds = new Set<number>();
      const hospitalityOrderIds = new Set<number>();
      const pointsOrderIds = new Set<number>();

      for (const p of payments) {
        const amt = parseFloat(p.amount);
        if (p.method === "cash") {
          cashRevenue += amt;
          cashOrderIds.add(p.orderId);
        } else if (p.method === "card") {
          cardRevenue += amt;
          cardOrderIds.add(p.orderId);
        } else if (p.method === "partner_card") {
          partnerCardRevenue += amt;
          partnerCardOrderIds.add(p.orderId);
        } else if (p.method === "wallet") {
          walletRevenue += amt;
          walletOrderIds.add(p.orderId);
        } else if (p.method === "hospitality") {
          hospitalityRevenue += amt;
          hospitalityOrderIds.add(p.orderId);
        } else if (p.method === "points") {
          pointsRevenue += amt;
          pointsOrderIds.add(p.orderId);
        }
      }

      cashOrders = cashOrderIds.size;
      cardOrders = cardOrderIds.size;
      partnerCardOrders = partnerCardOrderIds.size;
      walletOrders = walletOrderIds.size;
      hospitalityOrders = hospitalityOrderIds.size;
      pointsOrders = pointsOrderIds.size;
    }

  const [cashier] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, session.cashierId));

  const [closeRecord] = await db
    .select()
    .from(shiftCloseRecordsTable)
    .where(eq(shiftCloseRecordsTable.sessionId, sessionId))
    .limit(1);

  res.json({
    cashierName: cashier?.name ?? "Unknown",
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    totalOrders: completedOrders.length,
    totalRevenue,
    cashRevenue,
    cashOrders,
    cardRevenue,
    cardOrders,
    partnerCardRevenue,
    partnerCardOrders,
    walletRevenue,
    walletOrders,
    hospitalityRevenue,
    hospitalityOrders,
    pointsRevenue,
    pointsOrders,
    closeRecord: closeRecord ?? null,
  });
});

// GET /cashier/sessions/:id/report — detailed report with stats and orders
router.get("/cashier/sessions/:id/report", requirePermission("cashier:view_reports"), async (req, res): Promise<void> => {
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

  // Fetch all orders in the session
  const orders = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      total: ordersTable.total,
      paymentMethod: ordersTable.paymentMethod,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      customerName: ordersTable.customerName,
    })
    .from(ordersTable)
    .where(and(
      eq(ordersTable.cashierId, session.cashierId),
      gte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, start),
      lte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, end)
    ))
    .orderBy(desc(ordersTable.createdAt));

  const completedOrders = orders.filter(o => ["completed", "paid", "ready", "in_progress"].includes(o.status));
  const orderIds = completedOrders.map(o => o.id);
  
  // Main Totals
  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total as any), 0);
  
  let cashRevenue = 0, cardRevenue = 0, partnerCardRevenue = 0, walletRevenue = 0, hospitalityRevenue = 0, pointsRevenue = 0;
  let cashOrders = 0, cardOrders = 0, partnerCardOrders = 0, walletOrders = 0, hospitalityOrders = 0, pointsOrders = 0;
  if (orderIds.length > 0) {
    const payments = await db
      .select({ orderId: orderPaymentsTable.orderId, method: orderPaymentsTable.paymentMethod, amount: orderPaymentsTable.amount })
      .from(orderPaymentsTable)
      .where(inArray(orderPaymentsTable.orderId, orderIds));
    
    const cashOrderIds = new Set<number>();
    const cardOrderIds = new Set<number>();
    const partnerCardOrderIds = new Set<number>();
    const walletOrderIds = new Set<number>();
    const hospitalityOrderIds = new Set<number>();
    const pointsOrderIds = new Set<number>();

    for (const p of payments) {
      const amt = parseFloat(p.amount);
      if (p.method === "cash") {
        cashRevenue += amt;
        cashOrderIds.add(p.orderId);
      } else if (p.method === "card") {
        cardRevenue += amt;
        cardOrderIds.add(p.orderId);
      } else if (p.method === "partner_card") {
        partnerCardRevenue += amt;
        partnerCardOrderIds.add(p.orderId);
      } else if (p.method === "wallet") {
        walletRevenue += amt;
        walletOrderIds.add(p.orderId);
      } else if (p.method === "hospitality") {
        hospitalityRevenue += amt;
        hospitalityOrderIds.add(p.orderId);
      } else if (p.method === "points") {
        pointsRevenue += amt;
        pointsOrderIds.add(p.orderId);
      }
    }

    cashOrders = cashOrderIds.size;
    cardOrders = cardOrderIds.size;
    partnerCardOrders = partnerCardOrderIds.size;
    walletOrders = walletOrderIds.size;
    hospitalityOrders = hospitalityOrderIds.size;
    pointsOrders = pointsOrderIds.size;
  }

  // Statistics: Top 5 Orders by Price
  const topOrdersByPrice = [...completedOrders]
    .sort((a, b) => parseFloat(b.total as any) - parseFloat(a.total as any))
    .slice(0, 5);

  // Statistics: Rush by Hour
  const rushByHour: Record<number, number> = {};
  for (const o of completedOrders) {
    const hour = new Date(o.createdAt).getHours();
    rushByHour[hour] = (rushByHour[hour] || 0) + 1;
  }
  const rushByHourList = Object.entries(rushByHour).map(([hour, count]) => ({
    hour: parseInt(hour),
    count
  })).sort((a, b) => a.hour - b.hour);

  // Statistics: Top 5 Drinks
  // We need to fetch items for all completed orders
  let topDrinks: any[] = [];
  
  if (orderIds.length > 0) {
    const items = await db
      .select({
        drinkId: orderItemsTable.drinkId,
        drinkName: orderItemsTable.drinkName,
        quantity: orderItemsTable.quantity,
      })
      .from(orderItemsTable)
      .where(inArray(orderItemsTable.orderId, orderIds));

    const drinkStats: Record<number, { name: string; count: number }> = {};
    for (const item of items) {
      if (!drinkStats[item.drinkId]) {
        drinkStats[item.drinkId] = { name: item.drinkName, count: 0 };
      }
      drinkStats[item.drinkId].count += item.quantity;
    }

    topDrinks = Object.entries(drinkStats)
      .map(([id, stats]) => ({
        id: parseInt(id),
        name: stats.name,
        count: stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  const statistics: any = {
    topDrinks,
    topOrdersByPrice,
    rushByHour: rushByHourList,
    categorySales: []
  };

  if (orderIds.length > 0) {
    // Statistics: Sales by Category
    const categoryStats = await db
      .select({
        categoryId: drinkCategoriesTable.id,
        categoryName: drinkCategoriesTable.name,
        quantity: sql<number>`sum(${orderItemsTable.quantity})`,
        totalSales: sql<number>`sum(${orderItemsTable.lineTotal})`,
      })
      .from(orderItemsTable)
      .innerJoin(drinksTable, eq(orderItemsTable.drinkId, drinksTable.id))
      .innerJoin(drinkCategoriesTable, eq(drinksTable.categoryId, drinkCategoriesTable.id))
      .where(inArray(orderItemsTable.orderId, orderIds))
      .groupBy(drinkCategoriesTable.id, drinkCategoriesTable.name);

    statistics.categorySales = categoryStats.map(c => ({
      id: c.categoryId,
      name: c.categoryName,
      quantity: Number(c.quantity),
      total: Number(c.totalSales)
    }));
  }

  const [cashier] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, session.cashierId));

  const [closeRecord] = await db
    .select()
    .from(shiftCloseRecordsTable)
    .where(eq(shiftCloseRecordsTable.sessionId, sessionId))
    .limit(1);

  res.json({
    session: {
      id: session.id,
      cashierName: cashier?.name ?? "Unknown",
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    },
    totals: {
      totalRevenue,
      cashRevenue,
      cashOrders,
      cardRevenue,
      cardOrders,
      partnerCardRevenue,
      partnerCardOrders,
      walletRevenue,
      walletOrders,
      hospitalityRevenue,
      hospitalityOrders,
      pointsRevenue,
      pointsOrders,
      orderCount: completedOrders.length,
    },
    closeRecord: closeRecord ?? null,
    statistics,
    orders: completedOrders.map(o => ({
      ...o,
      total: parseFloat(o.total as any)
    }))
  });
});

// GET /cashier/sessions/orders — list all orders of the filtered sessions
router.get("/cashier/sessions/orders", requirePermission("cashier:view_reports"), async (req, res): Promise<void> => {
  const { cashierId, startDate, endDate, status, limit: limitStr, offset: offsetStr } = req.query as {
    cashierId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: string;
    offset?: string;
  };

  const limit = limitStr ? parseInt(limitStr, 10) : 50;
  const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

  const conditions: any[] = [];
  if (cashierId && cashierId !== "all") {
    conditions.push(eq(cashierSessionsTable.cashierId, parseInt(cashierId)));
  }
  if (startDate) {
    conditions.push(gte(cashierSessionsTable.startedAt, startOfDay(new Date(startDate))));
  }
  if (endDate) {
    conditions.push(lte(cashierSessionsTable.startedAt, endOfDay(new Date(endDate))));
  }

  const sessions = await db
    .select({
      id: cashierSessionsTable.id,
      cashierId: cashierSessionsTable.cashierId,
      startedAt: cashierSessionsTable.startedAt,
      endedAt: cashierSessionsTable.endedAt,
      cashierName: usersTable.name
    })
    .from(cashierSessionsTable)
    .innerJoin(usersTable, eq(cashierSessionsTable.cashierId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cashierSessionsTable.startedAt));

  if (sessions.length === 0) {
    res.setHeader("X-Total-Count", "0");
    res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");
    res.json([]);
    return;
  }

  const orConditions = [];
  for (const session of sessions) {
    const end = session.endedAt || new Date();
    orConditions.push(
      and(
        eq(ordersTable.cashierId, session.cashierId),
        gte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, session.startedAt),
        lte(sql`COALESCE(${ordersTable.paidAt}, ${ordersTable.createdAt})`, end)
      )
    );
  }

  const orderQueryConditions = [or(...orConditions)];

  if (status && status !== 'all' && status !== '') {
    const statuses = status.split(",") as any[];
    orderQueryConditions.push(inArray(ordersTable.status, statuses));
  }

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(ordersTable)
    .where(and(...orderQueryConditions));

  const totalCount = countResult?.count ?? 0;
  res.setHeader("X-Total-Count", String(totalCount));
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");

  const orders = await db
    .select()
    .from(ordersTable)
    .where(and(...orderQueryConditions))
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit)
    .offset(offset);

  const orderIds = orders.map((o) => o.id);

  const [items, baristas, payments, branches] = await Promise.all([
    orderIds.length > 0
      ? db.select().from(orderItemsTable).where(inArray(orderItemsTable.orderId, orderIds))
      : Promise.resolve([]),
    db.select().from(usersTable), // Fetch all baristas for mapping
    orderIds.length > 0
      ? db.select().from(orderPaymentsTable).where(inArray(orderPaymentsTable.orderId, orderIds))
      : Promise.resolve([]),
    db.select().from(branchesTable), // Fetch all branches for mapping
  ]);

  const itemIds = items.map((i) => i.id);
  const customizations = itemIds.length > 0
    ? await db.select().from(orderItemCustomizationsTable).where(inArray(orderItemCustomizationsTable.orderItemId, itemIds))
    : [];

  const baristaMap = Object.fromEntries(baristas.map((b) => [b.id, b.name]));
  const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));
  const custByItem = new Map<number, any[]>();
  for (const c of customizations) {
    const list = custByItem.get(c.orderItemId) ?? [];
    list.push({ ...c, consumedQty: parseFloat(c.consumedQty), producedQty: parseFloat((c as any).producedQty), addedCost: parseFloat(c.addedCost) });
    custByItem.set(c.orderItemId, list);
  }

  const paymentsByOrder = new Map<number, any[]>();
  for (const p of payments) {
    const list = paymentsByOrder.get(p.orderId) ?? [];
    list.push({ ...p, amount: parseFloat(p.amount) });
    paymentsByOrder.set(p.orderId, list);
  }

  const itemsByOrder = new Map<number, any[]>();
  for (const i of items) {
    const list = itemsByOrder.get(i.orderId) ?? [];
    list.push({
      ...i,
      unitPrice: parseFloat(i.unitPrice),
      lineTotal: parseFloat(i.lineTotal),
      customizations: custByItem.get(i.id) ?? [],
    });
    itemsByOrder.set(i.orderId, list);
  }

  const serializedOrders = orders.map((o) => {
    // Find matching session
    const oTime = new Date(o.paidAt || o.createdAt).getTime();
    const matchingSession = sessions.find(s => {
      if (s.cashierId !== o.cashierId) return false;
      const start = new Date(s.startedAt).getTime();
      const end = s.endedAt ? new Date(s.endedAt).getTime() : Date.now();
      return oTime >= start && oTime <= end;
    });

    const sessionLabel = matchingSession
      ? `${matchingSession.cashierName} (S#${matchingSession.id} - ${new Date(matchingSession.startedAt).toLocaleDateString("en-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })})`
      : "Unknown Session";

    return {
      ...o,
      sessionId: matchingSession?.id ?? null,
      sessionLabel,
      baristaName: baristaMap[o.baristaId] ?? "Unknown",
      branchName: branchMap[o.branchId] ?? "Unknown",
      subtotal: parseFloat(o.subtotal),
      discount: parseFloat(o.discount),
      discountId: o.discountId,
      discountCode: o.discountCode,
      discountValue: o.discountValue ? parseFloat(o.discountValue) : null,
      discountType: o.discountType as "percentage" | "fixed" | "fixed_per_item" | null,
      offerId: o.offerId,
      offerDiscount: o.offerDiscount ? parseFloat(o.offerDiscount) : 0,
      total: parseFloat(o.total),
      amountTendered: o.amountTendered ? parseFloat(o.amountTendered) : null,
      changeDue: o.changeDue ? parseFloat(o.changeDue) : null,
      payments: paymentsByOrder.get(o.id) ?? [],
      items: itemsByOrder.get(o.id) ?? [],
    };
  });

  res.json(serializeDates(serializedOrders));
});

export default router;
