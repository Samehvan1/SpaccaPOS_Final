import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { createHash } from "crypto";

const router: IRouter = Router();

// ─── Ensure customers table exists ────────────────────────────────────────────
async function ensureCustomersTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customers (
        id            SERIAL PRIMARY KEY,
        name          TEXT NOT NULL,
        phone         TEXT NOT NULL UNIQUE,
        email         TEXT,
        password_hash TEXT NOT NULL,
        points        INTEGER NOT NULL DEFAULT 0,
        total_spent   NUMERIC(10,2) NOT NULL DEFAULT 0,
        visit_count   INTEGER NOT NULL DEFAULT 0,
        notes         TEXT,
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log("[customers] Table ready");
  } catch (e) {
    console.error("[customers] Table init error:", e);
  }
}
ensureCustomersTable();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hashPassword(password: string): string {
  return createHash("sha256").update(`spacca_salt_${password}_2024`).digest("hex");
}

function getCustomerId(req: any): number | null {
  return (req.session as any)?.customerId ?? null;
}

// ─── Register ─────────────────────────────────────────────────────────────────
router.post("/customers/register", async (req, res): Promise<void> => {
  const { name, phone, email, password } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters" }); return;
  }
  if (!phone || typeof phone !== "string" || phone.trim().length < 4) {
    res.status(400).json({ error: "Phone number is required" }); return;
  }
  if (!password || typeof password !== "string" || password.length < 4) {
    res.status(400).json({ error: "Password must be at least 4 characters" }); return;
  }

  const cleanPhone = phone.trim();
  const cleanName = name.trim();
  const cleanEmail = typeof email === "string" && email.trim() ? email.trim() : null;

  try {
    const existing = await db.execute(
      sql`SELECT id FROM customers WHERE phone = ${cleanPhone} LIMIT 1`
    );
    if ((existing.rows as any[]).length > 0) {
      res.status(409).json({ error: "Phone number already registered" }); return;
    }

    const passwordHash = hashPassword(password);
    const result = await db.execute(sql`
      INSERT INTO customers (name, phone, email, password_hash)
      VALUES (${cleanName}, ${cleanPhone}, ${cleanEmail}, ${passwordHash})
      RETURNING id, name, phone, email, points, total_spent, visit_count, created_at
    `);
    const customer = (result.rows as any[])[0];

    (req.session as any).customerId = customer.id;
    req.session.save(() => res.status(201).json({ customer }));
  } catch (e: any) {
    console.error("[customers/register] error:", e?.message);
    res.status(500).json({ error: "Registration failed: " + (e?.message ?? "unknown") });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post("/customers/login", async (req, res): Promise<void> => {
  const { phone, password } = req.body ?? {};

  if (!phone || !password) {
    res.status(400).json({ error: "Phone and password are required" }); return;
  }

  const passwordHash = hashPassword(String(password));

  try {
    const result = await db.execute(sql`
      SELECT id, name, phone, email, points, total_spent, visit_count, created_at
      FROM customers
      WHERE phone = ${String(phone).trim()} AND password_hash = ${passwordHash} AND is_active = TRUE
      LIMIT 1
    `);
    const customer = (result.rows as any[])[0];

    if (!customer) {
      res.status(401).json({ error: "Invalid phone or password" }); return;
    }

    (req.session as any).customerId = customer.id;
    req.session.save(() => res.json({ customer }));
  } catch (e: any) {
    console.error("[customers/login] error:", e?.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post("/customers/logout", async (req, res): Promise<void> => {
  delete (req.session as any).customerId;
  req.session.save(() => res.sendStatus(204));
});

// ─── Get My Profile ───────────────────────────────────────────────────────────
router.get("/customers/me", async (req, res): Promise<void> => {
  const customerId = getCustomerId(req);
  if (!customerId) {
    res.status(401).json({ error: "Not logged in" }); return;
  }

  try {
    const result = await db.execute(sql`
      SELECT id, name, phone, email, points, total_spent, visit_count, notes, created_at
      FROM customers WHERE id = ${customerId} AND is_active = TRUE LIMIT 1
    `);
    const customer = (result.rows as any[])[0];
    if (!customer) {
      res.status(401).json({ error: "Customer not found" }); return;
    }
    res.json({ customer });
  } catch (e: any) {
    console.error("[customers/me] error:", e?.message);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// ─── Update My Profile ────────────────────────────────────────────────────────
router.patch("/customers/me", async (req, res): Promise<void> => {
  const customerId = getCustomerId(req);
  if (!customerId) {
    res.status(401).json({ error: "Not logged in" }); return;
  }

  const { name, email } = req.body ?? {};

  try {
    const cleanName = typeof name === "string" && name.trim() ? name.trim() : null;
    const cleanEmail = typeof email === "string" && email.trim() ? email.trim() : null;

    const result = await db.execute(sql`
      UPDATE customers
      SET
        name       = COALESCE(${cleanName}, name),
        email      = CASE WHEN ${cleanEmail !== undefined} THEN ${cleanEmail} ELSE email END,
        updated_at = NOW()
      WHERE id = ${customerId}
      RETURNING id, name, phone, email, points, total_spent, visit_count, notes, created_at
    `);
    const customer = (result.rows as any[])[0];
    res.json({ customer });
  } catch (e: any) {
    console.error("[customers/me PATCH] error:", e?.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─── My Order History ─────────────────────────────────────────────────────────
router.get("/customers/me/orders", async (req, res): Promise<void> => {
  const customerId = getCustomerId(req);
  if (!customerId) {
    res.status(401).json({ error: "Not logged in" }); return;
  }

  try {
    const custResult = await db.execute(sql`
      SELECT name FROM customers WHERE id = ${customerId} LIMIT 1
    `);
    const cust = (custResult.rows as any[])[0];
    if (!cust) { res.json({ orders: [] }); return; }

    const result = await db.execute(sql`
      SELECT o.id, o.order_number, o.status, o.total, o.payment_method, o.created_at,
             COUNT(oi.id)::int AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_name ILIKE ${cust.name}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 20
    `);
    res.json({ orders: result.rows });
  } catch (e: any) {
    console.error("[customers/me/orders] error:", e?.message);
    res.status(500).json({ error: "Failed to get order history" });
  }
});

// ─── Admin: list all customers ────────────────────────────────────────────────
router.get("/admin/customers", async (req, res): Promise<void> => {
  try {
    const result = await db.execute(sql`
      SELECT id, name, phone, email, points, total_spent, visit_count, is_active, created_at
      FROM customers ORDER BY created_at DESC
    `);
    res.json({ customers: result.rows });
  } catch (e: any) {
    console.error("[admin/customers] error:", e?.message);
    res.status(500).json({ error: "Failed to list customers" });
  }
});

export default router;
