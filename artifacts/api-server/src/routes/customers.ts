import { Router, type IRouter } from "express";
import { db, customerTagsTable, customersTable, discountsTable } from "@workspace/db";
import { sql, eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requirePermission } from "../middleware/permissions";
import { logActivity } from "../lib/activity-logger";
import { RateLimiter } from "./auth";

const router: IRouter = Router();

// Rate limiters for customer-facing auth endpoints
const customerRegisterLimiter = new RateLimiter(60 * 60 * 1000, 5); // 5 registrations per hour per IP
const customerLoginLimiter = new RateLimiter(15 * 60 * 1000, 10);   // 10 attempts per 15 mins per IP


// ─── Ensure customers table exists ────────────────────────────────────────────
async function ensureCustomersTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customers (
        id            SERIAL PRIMARY KEY,
        name          TEXT NOT NULL,
        phone         TEXT NOT NULL UNIQUE,
        email         TEXT,
        password_hash TEXT,
        points        INTEGER NOT NULL DEFAULT 0,
        total_spent   NUMERIC(10,2) NOT NULL DEFAULT 0,
        visit_count   INTEGER NOT NULL DEFAULT 0,
        notes         TEXT,
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    // Alter table to drop NOT NULL if it was previously created with NOT NULL
    await db.execute(sql`
      ALTER TABLE customers ALTER COLUMN password_hash DROP NOT NULL;
    `);
    await db.execute(sql`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    await db.execute(sql`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS otp TEXT;
    `);
    await db.execute(sql`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
    `);
    console.log("[customers] Table schema ready");
  } catch (e) {
    console.error("[customers] Table init error:", e);
  }
}
ensureCustomersTable();


// ─── Helpers ──────────────────────────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Support legacy SHA-256 hashes for backward compatibility during migration
  const { createHash } = await import("crypto");
  const legacyHash = createHash("sha256").update(`spacca_salt_${password}_2024`).digest("hex");
  if (hash === legacyHash) return true;
  return bcrypt.compare(password, hash);
}

function getCustomerId(req: any): number | null {
  return (req.session as any)?.customerId ?? null;
}

// ─── Register ─────────────────────────────────────────────────────────────────
router.post("/customers/register", async (req, res): Promise<void> => {
  const ip = req.ip || "unknown-ip";
  if (customerRegisterLimiter.isLimitExceeded(`register:${ip}`)) {
    res.status(429).json({ error: "Too many registration attempts. Please try again later." }); return;
  }

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

    const passwordHash = await hashPassword(password);
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
  const ip = req.ip || "unknown-ip";
  if (customerLoginLimiter.isLimitExceeded(`customer-login:${ip}`)) {
    res.status(429).json({ error: "Too many login attempts. Please try again in 15 minutes." }); return;
  }

  const { phone, password } = req.body ?? {};

  if (!phone || !password) {
    res.status(400).json({ error: "Phone and password are required" }); return;
  }

  try {
    const result = await db.execute(sql`
      SELECT id, name, phone, email, points, total_spent, visit_count, created_at, password_hash
      FROM customers
      WHERE phone = ${String(phone).trim()} AND is_active = TRUE
      LIMIT 1
    `);
    const customer = (result.rows as any[])[0];

    if (!customer) {
      res.status(401).json({ error: "Invalid phone or password" }); return;
    }

    const isValid = await verifyPassword(String(password), customer.password_hash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid phone or password" }); return;
    }

    // Return customer without the password_hash field
    const { password_hash, ...safeCustomer } = customer;

    (req.session as any).customerId = safeCustomer.id;
    req.session.save(() => res.json({ customer: safeCustomer }));
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
router.get("/admin/customers", requirePermission("admin:view"), async (req, res): Promise<void> => {
  try {
    const customersRes = await db.execute(sql`
      SELECT c.id, c.name, c.phone, c.email, c.points, c.total_spent, c.visit_count, c.is_active, c.created_at, c.discount_id, c.notes,
             c.avatar_url, c.otp, c.otp_expires_at,
             d.code AS discount_code, d.type AS discount_type, d.value AS discount_value
      FROM customers c
      LEFT JOIN discounts d ON c.discount_id = d.id
      ORDER BY c.created_at DESC
    `);

    const tagsRes = await db.execute(sql`
      SELECT customer_id, tag_id FROM customer_tags
    `);

    const tagsMap: Record<number, number[]> = {};
    for (const row of tagsRes.rows as any[]) {
      if (!tagsMap[row.customer_id]) {
        tagsMap[row.customer_id] = [];
      }
      tagsMap[row.customer_id].push(row.tag_id);
    }

    const customers = (customersRes.rows as any[]).map((c) => ({
      ...c,
      isActive: c.is_active ?? true,
      createdAt: c.created_at,
      discountId: c.discount_id,
      avatarUrl: c.avatar_url,
      otp: c.otp,
      otpExpiresAt: c.otp_expires_at,
      points: parseInt(c.points || 0),
      visit_count: parseInt(c.visit_count || 0),
      total_spent: parseFloat(c.total_spent || 0),
      discount_value: c.discount_value ? parseFloat(c.discount_value) : null,
      tagIds: tagsMap[c.id] || [],
    }));

    res.json({ customers });
  } catch (e: any) {
    console.error("[admin/customers] error:", e?.message);
    res.status(500).json({ error: "Failed to list customers" });
  }
});

// ─── Admin: create a customer ────────────────────────────────────────────────
router.post("/admin/customers", requirePermission("admin:view"), async (req, res): Promise<void> => {
  const { name, phone, email, avatarUrl, otp, otpExpiresAt, points, notes, isActive, discountId, tagIds } = req.body ?? {};
  
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Name is required (at least 2 characters)" });
    return;
  }
  if (!phone || typeof phone !== "string" || phone.trim().length < 4) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }

  try {
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanEmail = typeof email === "string" && email.trim() ? email.trim() : null;

    // Check if phone already exists
    const existing = await db.select().from(customersTable).where(eq(customersTable.phone, cleanPhone)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Phone number already registered" });
      return;
    }

    const cleanOtp = typeof otp === "string" && otp.trim() ? otp.trim() : null;
    const cleanAvatarUrl = typeof avatarUrl === "string" && avatarUrl.trim() ? avatarUrl.trim() : null;

    const customer = await db.transaction(async (tx) => {
      const [cust] = await tx.insert(customersTable).values({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        avatarUrl: cleanAvatarUrl,
        otp: cleanOtp,
        otpExpiresAt: cleanOtp ? (otpExpiresAt ? new Date(otpExpiresAt) : new Date(Date.now() + 10 * 60 * 1000)) : null,
        points: points || 0,
        notes: notes || null,
        isActive: isActive ?? true,
        discountId: discountId || null,
      }).returning();

      if (Array.isArray(tagIds) && tagIds.length > 0) {
        await tx.insert(customerTagsTable).values(
          tagIds.map((tagId) => ({
            customerId: cust.id,
            tagId: tagId,
          }))
        );
      }

      return {
        ...cust,
        tagIds: tagIds || [],
      };
    });

    await logActivity(req, "CREATE_CUSTOMER", "customer", customer.id, { name: cleanName });
    res.status(201).json({ customer });
  } catch (e: any) {
    console.error("[admin/customers POST] error:", e?.message);
    res.status(500).json({ error: "Failed to create customer: " + e.message });
  }
});

// ─── Admin: update a customer ────────────────────────────────────────────────
router.patch("/admin/customers/:id", requirePermission("admin:view"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const { name, phone, email, avatarUrl, otp, otpExpiresAt, points, notes, isActive, discountId, tagIds } = req.body ?? {};

  try {
    await db.transaction(async (tx) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (email !== undefined) updateData.email = email ? email.trim() : null;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
      if (otp !== undefined) {
        const cleanOtp = typeof otp === "string" && otp.trim() ? otp.trim() : null;
        updateData.otp = cleanOtp;
        updateData.otpExpiresAt = cleanOtp ? (otpExpiresAt ? new Date(otpExpiresAt) : new Date(Date.now() + 10 * 60 * 1000)) : null;
      } else if (otpExpiresAt !== undefined) {
        updateData.otpExpiresAt = otpExpiresAt ? new Date(otpExpiresAt) : null;
      }
      if (points !== undefined) updateData.points = parseInt(points);
      if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (discountId !== undefined) updateData.discountId = discountId || null;
      updateData.updatedAt = new Date();

      const [updated] = await tx.update(customersTable).set(updateData).where(eq(customersTable.id, id)).returning();
      if (!updated) {
        throw new Error("Customer not found");
      }

      if (tagIds !== undefined) {
        await tx.delete(customerTagsTable).where(eq(customerTagsTable.customerId, id));
        if (Array.isArray(tagIds) && tagIds.length > 0) {
          await tx.insert(customerTagsTable).values(
            tagIds.map((tagId) => ({
              customerId: id,
              tagId: tagId,
            }))
          );
        }
      }
    });

    await logActivity(req, "UPDATE_CUSTOMER", "customer", id, req.body);
    res.json({ success: true });
  } catch (e: any) {
    console.error("[admin/customers/:id PATCH] error:", e?.message);
    if (e.message === "Customer not found") {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.status(500).json({ error: "Failed to update customer: " + e.message });
  }
});

// ─── Admin: customer order history ──────────────────────────────────────────
router.get("/admin/customers/:id/history", requirePermission("admin:view"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  try {
    const [cust] = await db.select().from(customersTable).where(eq(customersTable.id, id)).limit(1);
    if (!cust) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const result = await db.execute(sql`
      SELECT o.id, o.order_number, o.status, o.total, o.discount, o.discount_code, o.payment_method, o.created_at,
             COUNT(oi.id)::int AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_phone = ${cust.phone} OR (o.customer_name ILIKE ${cust.name} AND o.customer_phone IS NULL)
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json({ orders: result.rows });
  } catch (e: any) {
    console.error("[admin/customers/:id/history] error:", e?.message);
    res.status(500).json({ error: "Failed to get customer history" });
  }
});

// ─── Admin: reports and stats ────────────────────────────────────────────────
router.get("/admin/customer-reports", requirePermission("reports:view"), async (req, res): Promise<void> => {
  try {
    // 1. General Stats
    const generalRes = await db.execute(sql`
      SELECT 
        COUNT(*)::int AS total_customers,
        COALESCE(SUM(total_spent), 0)::numeric AS total_spent,
        COALESCE(SUM(visit_count), 0)::int AS total_visits,
        COALESCE(SUM(points), 0)::int AS total_points
      FROM customers
    `);
    const general = generalRes.rows[0];

    // 2. Discount usage from orders
    const discountUsageRes = await db.execute(sql`
      SELECT 
        COALESCE(discount_code, 'NO_CODE') AS code, 
        COUNT(id)::int AS usage_count, 
        COALESCE(SUM(discount), 0)::numeric AS total_saved
      FROM orders
      WHERE discount > 0 AND status = 'completed'
      GROUP BY discount_code
      ORDER BY usage_count DESC
    `);

    // 3. Group tags stats
    const tagStatsRes = await db.execute(sql`
      SELECT t.id, t.name, COUNT(ct.customer_id)::int AS count,
             COALESCE(SUM(c.total_spent), 0)::numeric AS total_spent,
             COALESCE(SUM(c.visit_count), 0)::int AS total_visits,
             COALESCE(SUM(c.points), 0)::int AS total_points
      FROM tags t
      LEFT JOIN customer_tags ct ON t.id = ct.tag_id
      LEFT JOIN customers c ON ct.customer_id = c.id
      GROUP BY t.id, t.name
      ORDER BY count DESC
    `);

    res.json({
      general: {
        total_customers: parseInt(String(general.total_customers ?? 0)),
        total_spent: parseFloat(String(general.total_spent ?? 0)),
        total_visits: parseInt(String(general.total_visits ?? 0)),
        total_points: parseInt(String(general.total_points ?? 0)),
      },
      discountUsage: discountUsageRes.rows.map((row: any) => ({
        ...row,
        usage_count: parseInt(row.usage_count || 0),
        total_saved: parseFloat(row.total_saved || 0),
      })),
      tagStats: tagStatsRes.rows.map((row: any) => ({
        ...row,
        count: parseInt(row.count || 0),
        total_spent: parseFloat(row.total_spent || 0),
        total_visits: parseInt(row.total_visits || 0),
        total_points: parseInt(row.total_points || 0),
      })),
    });
  } catch (e: any) {
    console.error("[admin/customer-reports] error:", e?.message);
    res.status(500).json({ error: "Failed to generate customer reports" });
  }
});

// ─── Available Discounts Lookup ─────────────────────────────────────────────
router.get("/customers/available-discounts", async (req, res): Promise<void> => {
  const phone = req.query.phone as string | undefined;
  const customerId = getCustomerId(req);

  try {
    let customer: any = null;

    if (customerId) {
      const result = await db.select().from(customersTable).where(and(eq(customersTable.id, customerId), eq(customersTable.isActive, true))).limit(1);
      customer = result[0];
    } else if (phone && phone.trim()) {
      const result = await db.select().from(customersTable).where(and(eq(customersTable.phone, phone.trim()), eq(customersTable.isActive, true))).limit(1);
      customer = result[0];
    }

    if (!customer) {
      res.json({ discounts: [] });
      return;
    }

    // Fetch customer tag mappings
    const customerTagsRes = await db.execute(sql`
      SELECT tag_id FROM customer_tags WHERE customer_id = ${customer.id}
    `);
    const customerTagIds = (customerTagsRes.rows as any[]).map((r) => r.tag_id);

    // Fetch all active discounts
    const activeDiscounts = await db.select().from(discountsTable).where(eq(discountsTable.isActive, true));
    
    // Fetch all discount tag mappings
    const discountTagsRes = await db.execute(sql`
      SELECT discount_id, tag_id FROM discount_tags
    `);
    const discountTagsMap: Record<number, number[]> = {};
    for (const r of discountTagsRes.rows as any[]) {
      if (!discountTagsMap[r.discount_id]) {
        discountTagsMap[r.discount_id] = [];
      }
      discountTagsMap[r.discount_id].push(r.tag_id);
    }

    const applicable: any[] = [];

    for (const d of activeDiscounts) {
      let isApplicable = false;
      let reason = "";

      // 1. Check direct assignment
      if (customer.discountId === d.id) {
        isApplicable = true;
        reason = "Customer-assigned discount";
      }
      // 2. Check first-order discount
      else if (d.isFirstOrder && parseInt(customer.visitCount || 0) === 0) {
        isApplicable = true;
        reason = "First order promotion";
      }
      // 3. Check tag-based discount
      else {
        const associatedTagIds = discountTagsMap[d.id] || [];
        const matchesTag = associatedTagIds.some((tagId) => customerTagIds.includes(tagId));
        if (matchesTag) {
          isApplicable = true;
          reason = "Group tag discount";
        }
      }

      if (isApplicable) {
        applicable.push({
          id: d.id,
          code: d.code,
          type: d.type,
          value: parseFloat(d.value),
          reason,
        });
      }
    }

    res.json({ discounts: applicable });
  } catch (e: any) {
    console.error("[customers/available-discounts] error:", e?.message);
    res.status(500).json({ error: "Failed to fetch available discounts" });
  }
});

// ── Loyalty Points Lookup ───────────────────────────────────────────────────
router.get("/customers/points/:phone", async (req, res): Promise<void> => {
  const { phone } = req.params;
  try {
    const result = await db.execute(sql`
      SELECT points, name FROM customers WHERE phone = ${phone} AND is_active = true LIMIT 1
    `);
    const customer = (result.rows as any[])[0];
    if (!customer) {
      res.json({ points: 0, name: null });
    } else {
      res.json({ points: customer.points, name: customer.name });
    }
  } catch (e: any) {
    console.error("[customers/points] error:", e?.message);
    res.status(500).json({ error: "Failed to fetch loyalty points" });
  }
});

export default router;

