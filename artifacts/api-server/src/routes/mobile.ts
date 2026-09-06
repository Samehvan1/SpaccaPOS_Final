import { Router, type IRouter } from "express";
import { eq, and, inArray, desc, asc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  db,
  customersTable,
  customerFavoritesTable,
  customerSavedDrinksTable,
  customerFriendsTable,
  drinksTable,
  drinkCategoriesTable,
  drinkIngredientSlotsTable,
  drinkSlotTypeOptionsTable,
  drinkSlotVolumesTable,
  ingredientTypesTable,
  ingredientOptionsTable,
  ingredientTypeVolumesTable,
  ingredientVolumesTable,
  ingredientsTable,
  ingredientCategoriesTable,
  predefinedSlotsTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable,
  branchesTable,
  ordersTable,
  orderItemsTable,
  orderItemCustomizationsTable,
  orderPaymentsTable,
  usersTable,
  discountsTable,
  offersTable,
  offersBranchesTable,
  offersPartnersTable,
  offersApplicableDrinksTable,
  offersRewardDrinksTable,
  offersExcludedDrinksTable,
  customerTagsTable,
  discountTagsTable,
  productDrinkDiscountsTable,
} from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { broadcastEvent } from "../lib/sse";
import { logActivity } from "../lib/activity-logger";
import { RateLimiter } from "./auth";
import { generateOrderNumber } from "./orders";
import { calculateDrinkData, getStandardProductPrice } from "../lib/price-calculator";

const router: IRouter = Router();

// ── Rate limiters ─────────────────────────────────────────────────────────────
const otpRequestLimiter = new RateLimiter(10 * 60 * 1000, 5); // 5 OTP requests per 10 mins per phone
const otpVerifyLimiter = new RateLimiter(10 * 60 * 1000, 10); // 10 OTP verify attempts per 10 mins
const pinLoginLimiter = new RateLimiter(15 * 60 * 1000, 10); // 10 PIN login attempts per 15 mins

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCustomerId(req: any): number | null {
  return (req.session as any)?.customerId ?? null;
}

function requireCustomer(req: any, res: any): number | null {
  const customerId = getCustomerId(req);
  if (!customerId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return customerId;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
}

async function getCustomerById(id: number) {
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, id))
    .limit(1);
  return customer;
}

function safeCustomer(c: any) {
  if (!c) return null;
  const { passwordHash, otp, otpExpiresAt, ...safe } = c;
  return safe;
}

// Resolve a valid baristaId for mobile orders (orders.barista_id is NOT NULL FK to users).
async function getDefaultBaristaId(): Promise<number> {
  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.isActive, true))
    .orderBy(usersTable.id)
    .limit(1);
  return user?.id ?? 1;
}

// ── Auth: Request OTP ─────────────────────────────────────────────────────────
router.post("/mobile/auth/request-otp", async (req, res): Promise<void> => {
  const { phone } = req.body ?? {};
  if (!phone || typeof phone !== "string" || phone.trim().length < 4) {
    res.status(400).json({ error: "Valid phone number is required" });
    return;
  }
  const cleanPhone = phone.trim();
  if (otpRequestLimiter.isLimitExceeded(`otp:${cleanPhone}`)) {
    res.status(429).json({ error: "Too many OTP requests. Please try again in 10 minutes." });
    return;
  }

  // Registered users with a PIN sign in with phone + PIN — no OTP needed.
  // The app routes them straight to the PIN screen (hasPin: true).
  const [existing] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.phone, cleanPhone))
    .limit(1);

  if (existing?.pin) {
    res.json({ success: true, message: "Registered", hasPin: true });
    return;
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

  if (existing) {
    await db
      .update(customersTable)
      .set({ otp, otpExpiresAt: expiresAt, updatedAt: new Date() })
      .where(eq(customersTable.id, existing.id));
  } else {
    await db.insert(customersTable).values({
      name: cleanPhone, // placeholder name until registration completes
      phone: cleanPhone,
      otp,
      otpExpiresAt: expiresAt,
    });
  }

  // NOTE: In production, send OTP via SMS gateway here.
  // For development, return the OTP in the response so the app can be tested.
  console.log(`[mobile] OTP for ${cleanPhone}: ${otp}`);
  res.json({ success: true, message: "OTP sent", devOtp: otp, expiresIn: 600, hasPin: false });
});

// ── Auth: Verify OTP (login/register) ────────────────────────────────────────
router.post("/mobile/auth/verify-otp", async (req, res): Promise<void> => {
  const { phone, otp, name } = req.body ?? {};
  if (!phone || !otp) {
    res.status(400).json({ error: "Phone and OTP are required" });
    return;
  }
  const cleanPhone = phone.trim();
  if (otpVerifyLimiter.isLimitExceeded(`otp-verify:${cleanPhone}`)) {
    res.status(429).json({ error: "Too many verification attempts. Please try again in 10 minutes." });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.phone, cleanPhone))
    .limit(1);

  if (!customer || !customer.otp || customer.otp !== String(otp).trim()) {
    res.status(401).json({ error: "Invalid OTP" });
    return;
  }
  if (customer.otpExpiresAt && new Date(customer.otpExpiresAt) < new Date()) {
    res.status(401).json({ error: "OTP has expired. Please request a new one." });
    return;
  }

  // If this is a new registration (placeholder name = phone), allow setting a real name
  const isNewRegistration = customer.name === customer.phone;
  const finalName = isNewRegistration && name && typeof name === "string" && name.trim().length >= 2
    ? name.trim()
    : customer.name;

  const [updated] = await db
    .update(customersTable)
    .set({ name: finalName, otp: null, otpExpiresAt: null, updatedAt: new Date() })
    .where(eq(customersTable.id, customer.id))
    .returning();

  (req.session as any).customerId = updated.id;
  req.session.save(() => {
    res.json({ customer: safeCustomer(updated), hasPin: !!updated.pin });
  });
});

// ── Auth: Create / Update PIN ────────────────────────────────────────────────
router.post("/mobile/auth/create-pin", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const { pin } = req.body ?? {};
  if (!pin || typeof pin !== "string" || !/^\d{4,6}$/.test(pin)) {
    res.status(400).json({ error: "PIN must be 4-6 digits" });
    return;
  }
  const hashedPin = await bcrypt.hash(pin, 10);
  const [updated] = await db
    .update(customersTable)
    .set({ pin: hashedPin, updatedAt: new Date() })
    .where(eq(customersTable.id, customerId))
    .returning();
  res.json({ success: true, customer: safeCustomer(updated) });
});

// ── Auth: Login with PIN ─────────────────────────────────────────────────────
router.post("/mobile/auth/login", async (req, res): Promise<void> => {
  const { phone, pin } = req.body ?? {};
  if (!phone || !pin) {
    res.status(400).json({ error: "Phone and PIN are required" });
    return;
  }
  const cleanPhone = phone.trim();
  if (pinLoginLimiter.isLimitExceeded(`pin-login:${cleanPhone}`)) {
    res.status(429).json({ error: "Too many login attempts. Please try again in 15 minutes." });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(and(eq(customersTable.phone, cleanPhone), eq(customersTable.isActive, true)))
    .limit(1);

  if (!customer || !customer.pin) {
    res.status(401).json({ error: "Invalid phone or PIN" });
    return;
  }
  const isValid = await bcrypt.compare(String(pin), customer.pin);
  if (!isValid) {
    res.status(401).json({ error: "Invalid phone or PIN" });
    return;
  }

  (req.session as any).customerId = customer.id;
  req.session.save(() => {
    res.json({ customer: safeCustomer(customer) });
  });
});

// ── Auth: Logout ─────────────────────────────────────────────────────────────
router.post("/mobile/auth/logout", async (req, res): Promise<void> => {
  delete (req.session as any).customerId;
  req.session.save(() => res.sendStatus(204));
});

// ── Auth: Me ─────────────────────────────────────────────────────────────────
router.get("/mobile/auth/me", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.status(401).json({ error: "Customer not found" });
    return;
  }
  res.json({ customer: safeCustomer(customer) });
});

// ── Profile: Update ──────────────────────────────────────────────────────────
router.patch("/mobile/me", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const { name, email, birthdate, gender, avatarUrl, preferredBranchId, address, city } = req.body ?? {};
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (name && typeof name === "string" && name.trim().length >= 2) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email ? email.trim() : null;
  if (birthdate !== undefined) updateData.birthdate = birthdate ? new Date(birthdate) : null;
  if (gender !== undefined) updateData.gender = gender || null;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;
  if (preferredBranchId !== undefined) updateData.preferredBranchId = preferredBranchId || null;
  if (address !== undefined) updateData.address = address || null;
  if (city !== undefined) updateData.city = city || null;
  const [updated] = await db
    .update(customersTable)
    .set(updateData)
    .where(eq(customersTable.id, customerId))
    .returning();
  res.json({ customer: safeCustomer(updated) });
});

// ── Profile: Upload avatar ──────────────────────────────────────────────────
const customerUploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(customerUploadsDir)) fs.mkdirSync(customerUploadsDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, customerUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});
const avatarUpload = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/mobile/me/avatar", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;

  avatarUpload.single("avatar")(req, res, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "Image too large. Maximum 5MB allowed." });
        return;
      }
      res.status(400).json({ error: err.message || "Failed to upload avatar" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const [updated] = await db
      .update(customersTable)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(customersTable.id, customerId))
      .returning();

    res.json({ customer: safeCustomer(updated) });
  });
});

// ── Profile: Change phone ────────────────────────────────────────────────────
router.post("/mobile/me/change-phone", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const { newPhone } = req.body ?? {};
  if (!newPhone || typeof newPhone !== "string" || newPhone.trim().length < 4) {
    res.status(400).json({ error: "Valid new phone number is required" });
    return;
  }
  const cleanPhone = newPhone.trim();
  const [existing] = await db.select().from(customersTable).where(eq(customersTable.phone, cleanPhone)).limit(1);
  if (existing && existing.id !== customerId) {
    res.status(409).json({ error: "Phone number already in use" });
    return;
  }
  const [updated] = await db
    .update(customersTable)
    .set({ phone: cleanPhone, updatedAt: new Date() })
    .where(eq(customersTable.id, customerId))
    .returning();
  res.json({ customer: safeCustomer(updated) });
});

// ── Profile: Change PIN ──────────────────────────────────────────────────────
router.post("/mobile/me/change-pin", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const { currentPin, newPin } = req.body ?? {};
  if (!newPin || typeof newPin !== "string" || !/^\d{4,6}$/.test(newPin)) {
    res.status(400).json({ error: "New PIN must be 4-6 digits" });
    return;
  }
  const customer = await getCustomerById(customerId);
  if (customer?.pin) {
    const valid = await bcrypt.compare(String(currentPin ?? ""), customer.pin);
    if (!valid) {
      res.status(401).json({ error: "Current PIN is incorrect" });
      return;
    }
  }
  const hashedPin = await bcrypt.hash(newPin, 10);
  await db
    .update(customersTable)
    .set({ pin: hashedPin, updatedAt: new Date() })
    .where(eq(customersTable.id, customerId));
  res.json({ success: true });
});

// ── Profile: Deactivate / Delete ─────────────────────────────────────────────
router.post("/mobile/me/deactivate", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  await db
    .update(customersTable)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(customersTable.id, customerId));
  delete (req.session as any).customerId;
  req.session.save(() => res.json({ success: true }));
});

router.delete("/mobile/me", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  await db.delete(customersTable).where(eq(customersTable.id, customerId));
  delete (req.session as any).customerId;
  req.session.save(() => res.sendStatus(204));
});

// ── Points ───────────────────────────────────────────────────────────────────
router.get("/mobile/points", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const customer = await getCustomerById(customerId);
  res.json({ points: customer?.points ?? 0, totalSpent: customer?.totalSpent ?? "0", visitCount: customer?.visitCount ?? 0 });
});

// ── Discounts: Available to the logged-in customer ───────────────────────────
router.get("/mobile/discounts", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.json({ discounts: [] });
    return;
  }

  const customerTagsRes = await db.execute(sql`
    SELECT tag_id FROM customer_tags WHERE customer_id = ${customer.id}
  `);
  const customerTagIds = (customerTagsRes.rows as any[]).map((r) => r.tag_id);

  const activeDiscounts = await db.select().from(discountsTable).where(eq(discountsTable.isActive, true));

  const discountTagsRes = await db.execute(sql`
    SELECT discount_id, tag_id FROM discount_tags
  `);
  const discountTagsMap: Record<number, number[]> = {};
  for (const r of discountTagsRes.rows as any[]) {
    if (!discountTagsMap[r.discount_id]) discountTagsMap[r.discount_id] = [];
    discountTagsMap[r.discount_id].push(r.tag_id);
  }

  const applicable: any[] = [];
  for (const d of activeDiscounts) {
    let isApplicable = false;
    let reason = "";
    if (customer.discountId === d.id) {
      isApplicable = true;
      reason = "Customer-assigned discount";
    } else if (d.isFirstOrder && (customer.visitCount || 0) === 0) {
      isApplicable = true;
      reason = "First order promotion";
    } else {
      const associatedTagIds = discountTagsMap[d.id] || [];
      if (associatedTagIds.some((tagId) => customerTagIds.includes(tagId))) {
        isApplicable = true;
        reason = "Group tag discount";
      }
    }
    if (isApplicable) {
      applicable.push({ id: d.id, code: d.code, type: d.type, value: parseFloat(d.value), isTaxable: d.isTaxable ?? false, reason });
    }
  }

  res.json({ discounts: applicable });
});

// ── Offers: Active offers for a branch ───────────────────────────────────────
router.get("/mobile/offers", async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : null;
  const offers = await db.select().from(offersTable).where(eq(offersTable.isActive, true));
  const matchingOffers: any[] = [];

  for (const o of offers) {
    const offerBranches = await db.select().from(offersBranchesTable).where(eq(offersBranchesTable.offerId, o.id));
    const offerPartners = await db.select().from(offersPartnersTable).where(eq(offersPartnersTable.offerId, o.id));
    const branchIds = offerBranches.map((b: any) => b.branchId);
    const partnerIds = offerPartners.map((p: any) => p.partnerId);

    if (branchId && branchIds.length > 0 && !branchIds.includes(branchId)) continue;
    if (!(o.applyToStore ?? true)) continue;

    const applicableRows = await db.select().from(offersApplicableDrinksTable).where(eq(offersApplicableDrinksTable.offerId, o.id));
    const rewardRows = await db.select().from(offersRewardDrinksTable).where(eq(offersRewardDrinksTable.offerId, o.id));
    const excludedRows = await db.select().from(offersExcludedDrinksTable).where(eq(offersExcludedDrinksTable.offerId, o.id));

    matchingOffers.push({
      id: o.id,
      name: o.name,
      buyAmount: o.buyAmount,
      freeAmount: o.freeAmount,
      promoLabel: o.promoLabel,
      applyToStore: o.applyToStore,
      applyToAllPartners: o.applyToAllPartners,
      branchIds,
      partnerIds,
      applicableDrinkIds: applicableRows.map((r) => r.drinkId),
      rewardDrinkIds: rewardRows.map((r) => r.drinkId),
      excludedDrinkIds: excludedRows.map((r) => r.drinkId),
    });
  }

  res.json(matchingOffers);
});

// ── Discounts: Validate a discount code ──────────────────────────────────────
router.get("/mobile/discounts/validate/:code", async (req, res): Promise<void> => {
  const code = (req.params.code as string).trim();
  const [discount] = await db
    .select()
    .from(discountsTable)
    .where(eq(discountsTable.code, code))
    .limit(1);
  if (discount && discount.isActive) {
    res.json({ valid: true, discount: { id: discount.id, code: discount.code, type: discount.type, value: parseFloat(discount.value), isTaxable: discount.isTaxable ?? false } });
  } else {
    res.json({ valid: false, error: "Invalid or inactive discount code" });
  }
});

// ── Favorites ────────────────────────────────────────────────────────────────
router.get("/mobile/favorites", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const favorites = await db
    .select({
      id: customerFavoritesTable.id,
      drinkId: customerFavoritesTable.drinkId,
      createdAt: customerFavoritesTable.createdAt,
      drink: {
        id: drinksTable.id,
        name: drinksTable.name,
        description: drinksTable.description,
        category: drinksTable.category,
        basePrice: drinksTable.basePrice,
        imageUrl: drinksTable.imageUrl,
        isCustomizable: drinksTable.isCustomizable,
      },
    })
    .from(customerFavoritesTable)
    .innerJoin(drinksTable, eq(customerFavoritesTable.drinkId, drinksTable.id))
    .where(eq(customerFavoritesTable.customerId, customerId))
    .orderBy(desc(customerFavoritesTable.createdAt));
  res.json({ favorites: serializeDates(favorites) });
});

router.post("/mobile/favorites", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const { drinkId } = req.body ?? {};
  if (!drinkId) {
    res.status(400).json({ error: "drinkId is required" });
    return;
  }
  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.id, drinkId)).limit(1);
  if (!drink) {
    res.status(404).json({ error: "Drink not found" });
    return;
  }
  const [existing] = await db
    .select()
    .from(customerFavoritesTable)
    .where(and(eq(customerFavoritesTable.customerId, customerId), eq(customerFavoritesTable.drinkId, drinkId)))
    .limit(1);
  if (!existing) {
    await db.insert(customerFavoritesTable).values({ customerId, drinkId });
  }
  res.status(201).json({ success: true });
});

router.delete("/mobile/favorites/:drinkId", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const drinkId = parseInt(req.params.drinkId as string);
  await db
    .delete(customerFavoritesTable)
    .where(and(eq(customerFavoritesTable.customerId, customerId), eq(customerFavoritesTable.drinkId, drinkId)));
  res.sendStatus(204);
});

// ── Saved Customized Drinks ──────────────────────────────────────────────────
router.get("/mobile/saved-drinks", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const saved = await db
    .select({
      id: customerSavedDrinksTable.id,
      drinkId: customerSavedDrinksTable.drinkId,
      name: customerSavedDrinksTable.name,
      selections: customerSavedDrinksTable.selections,
      quantity: customerSavedDrinksTable.quantity,
      createdAt: customerSavedDrinksTable.createdAt,
      drink: {
        id: drinksTable.id,
        name: drinksTable.name,
        imageUrl: drinksTable.imageUrl,
        basePrice: drinksTable.basePrice,
      },
    })
    .from(customerSavedDrinksTable)
    .innerJoin(drinksTable, eq(customerSavedDrinksTable.drinkId, drinksTable.id))
    .where(eq(customerSavedDrinksTable.customerId, customerId))
    .orderBy(desc(customerSavedDrinksTable.createdAt));
  res.json({ savedDrinks: serializeDates(saved) });
});

router.post("/mobile/saved-drinks", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const { drinkId, name, selections, quantity } = req.body ?? {};
  if (!drinkId) {
    res.status(400).json({ error: "drinkId is required" });
    return;
  }
  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.id, drinkId)).limit(1);
  if (!drink) {
    res.status(404).json({ error: "Drink not found" });
    return;
  }
  const [saved] = await db
    .insert(customerSavedDrinksTable)
    .values({
      customerId,
      drinkId,
      name: name && typeof name === "string" && name.trim() ? name.trim() : drink.name,
      selections: Array.isArray(selections) ? selections : [],
      quantity: quantity || 1,
    })
    .returning();
  res.status(201).json({ savedDrink: serializeDates(saved) });
});

router.delete("/mobile/saved-drinks/:id", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const id = parseInt(req.params.id as string);
  await db
    .delete(customerSavedDrinksTable)
    .where(and(eq(customerSavedDrinksTable.id, id), eq(customerSavedDrinksTable.customerId, customerId)));
  res.sendStatus(204);
});

// ── Friends ──────────────────────────────────────────────────────────────────
router.get("/mobile/friends", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const friends = await db
    .select()
    .from(customerFriendsTable)
    .where(eq(customerFriendsTable.customerId, customerId))
    .orderBy(desc(customerFriendsTable.createdAt));
  res.json({ friends: serializeDates(friends) });
});

router.post("/mobile/friends", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const { phone } = req.body ?? {};
  if (!phone || typeof phone !== "string" || phone.trim().length < 4) {
    res.status(400).json({ error: "Valid friend phone number is required" });
    return;
  }
  const cleanPhone = phone.trim();
  const me = await getCustomerById(customerId);
  if (me && cleanPhone === me.phone) {
    res.status(400).json({ error: "You cannot add yourself as a friend" });
    return;
  }
  const [friend] = await db
    .select()
    .from(customersTable)
    .where(and(eq(customersTable.phone, cleanPhone), eq(customersTable.isActive, true)))
    .limit(1);
  if (!friend) {
    res.status(404).json({ error: "No SPACCA account found with this phone number" });
    return;
  }
  const [existing] = await db
    .select()
    .from(customerFriendsTable)
    .where(and(eq(customerFriendsTable.customerId, customerId), eq(customerFriendsTable.friendCustomerId, friend.id)))
    .limit(1);
  if (existing) {
    res.status(409).json({ error: "Already friends" });
    return;
  }
  const [added] = await db
    .insert(customerFriendsTable)
    .values({ customerId, friendCustomerId: friend.id, friendName: friend.name, friendPhone: friend.phone })
    .returning();
  res.status(201).json({ friend: serializeDates(added) });
});

router.delete("/mobile/friends/:id", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const id = parseInt(req.params.id as string);
  await db
    .delete(customerFriendsTable)
    .where(and(eq(customerFriendsTable.id, id), eq(customerFriendsTable.customerId, customerId)));
  res.sendStatus(204);
});

// ── Catalog: Branches ────────────────────────────────────────────────────────
router.get("/mobile/branches", async (_req, res): Promise<void> => {
  const branches = await db
    .select()
    .from(branchesTable)
    .where(eq(branchesTable.isActive, true))
    .orderBy(branchesTable.name);
  res.json({ branches: serializeDates(branches) });
});

// ── Catalog: Categories ──────────────────────────────────────────────────────
// Supports incremental sync via `?since=<ISO timestamp>`: when provided, only
// categories whose `updatedAt` is newer than `since` are returned, along with
// `deletedIds` (categories deactivated/removed since then) and `serverNow` so the
// client can advance its sync cursor. Without `since`, returns the full list.
router.get("/mobile/categories", async (req, res): Promise<void> => {
  const since = req.query.since as string | undefined;
  const sinceDate = since ? new Date(since) : null;
  const validSince = sinceDate && !isNaN(sinceDate.getTime()) ? sinceDate : null;

  const all = await db
    .select()
    .from(drinkCategoriesTable)
    .orderBy(drinkCategoriesTable.sortOrder);

  const active = all.filter((c) => c.isActive);
  const deletedIds = all.filter((c) => !c.isActive).map((c) => c.id);

  let categories = active;
  if (validSince) {
    categories = active.filter((c) => new Date(c.createdAt) > validSince);
  }

  res.json({
    categories: serializeDates(categories),
    deletedIds,
    serverNow: new Date().toISOString(),
  });
});

// ── Catalog: Products for a category (with real prices) ─────────────────────
// Supports incremental sync via `?since=<ISO timestamp>`: only drinks whose
// `updatedAt` is newer than `since` are returned, plus `deletedIds` (drinks
// deactivated/removed since then) and `serverNow` for the sync cursor.
router.get("/mobile/categories/:id/drinks", async (req, res): Promise<void> => {
  const categoryId = parseInt(req.params.id as string);
  if (isNaN(categoryId)) {
    res.status(400).json({ error: "Invalid category id" });
    return;
  }
  const since = req.query.since as string | undefined;
  const sinceDate = since ? new Date(since) : null;
  const validSince = sinceDate && !isNaN(sinceDate.getTime()) ? sinceDate : null;

  const all = await db
    .select()
    .from(drinksTable)
    .where(eq(drinksTable.categoryId, categoryId))
    .orderBy(drinksTable.sortOrder);

  const active = all.filter((d) => d.isActive);
  const deletedIds = all.filter((d) => !d.isActive).map((d) => d.id);

  let changed = active;
  if (validSince) {
    changed = active.filter((d) => new Date(d.updatedAt ?? d.createdAt) > validSince);
  }

  const products = await Promise.all(
    changed.map(async (d) => {
      const price = await getStandardProductPrice(d.id);
      return {
        id: d.id,
        name: d.name,
        description: d.description,
        imageUrl: d.imageUrl,
        isCustomizable: d.isCustomizable,
        price,
        sortOrder: d.sortOrder,
      };
    })
  );

  res.json({
    products: serializeDates(products),
    deletedIds,
    serverNow: new Date().toISOString(),
  });
});

// ── Catalog: Drink detail (with ingredients) ─────────────────────────────────
/**
 * Builds the full customization recipe for a drink: each slot with its
 * selectable options (legacy) or type options + volumes (typed). This mirrors
 * the POS `includeSlots` structure but shaped for the mobile customization UI.
 */
async function buildMobileRecipeSlots(drinkId: number): Promise<any[]> {
  const slots = await db
    .select()
    .from(drinkIngredientSlotsTable)
    .where(eq(drinkIngredientSlotsTable.drinkId, drinkId))
    .orderBy(asc(drinkIngredientSlotsTable.customerSortOrder), asc(drinkIngredientSlotsTable.sortOrder), asc(drinkIngredientSlotsTable.id));

  const slotIds = slots.map((s) => s.id);
  const templateIds = [...new Set(slots.map((s) => s.predefinedSlotId).filter((v): v is number => v !== null))];

  const [typeOptions, slotVolumes, ingredientOptions, volumes, types, typeVolumes, predefinedSlots, templateTypeOptions, templateVolumes] =
    await Promise.all([
      slotIds.length > 0 ? db.select().from(drinkSlotTypeOptionsTable).where(inArray(drinkSlotTypeOptionsTable.slotId, slotIds)) : Promise.resolve([]),
      slotIds.length > 0 ? db.select().from(drinkSlotVolumesTable).where(inArray(drinkSlotVolumesTable.slotId, slotIds)) : Promise.resolve([]),
      db.select().from(ingredientOptionsTable),
      db.select().from(ingredientVolumesTable),
      db.select().from(ingredientTypesTable),
      db.select().from(ingredientTypeVolumesTable),
      templateIds.length > 0 ? db.select().from(predefinedSlotsTable).where(inArray(predefinedSlotsTable.id, templateIds)) : Promise.resolve([]),
      templateIds.length > 0 ? db.select().from(predefinedSlotTypeOptionsTable).where(inArray(predefinedSlotTypeOptionsTable.predefinedSlotId, templateIds)) : Promise.resolve([]),
      templateIds.length > 0 ? db.select().from(predefinedSlotVolumesTable).where(inArray(predefinedSlotVolumesTable.predefinedSlotId, templateIds)) : Promise.resolve([]),
    ]);

  const volumeMap = new Map(volumes.map((v) => [v.id, v]));
  const typeMap = new Map(types.map((t) => [t.id, t]));
  const typeVolumeMap = new Map(typeVolumes.map((tv) => [tv.id, tv]));

  const result: any[] = [];

  for (const slot of slots) {
    const template = slot.predefinedSlotId ? predefinedSlots.find((ps) => ps.id === slot.predefinedSlotId) : null;

    // Resolve effective type options (drink overrides vs template)
    let effectiveTypeOptions: any[] = typeOptions.filter((to) => to.slotId === slot.id);
    if (effectiveTypeOptions.length === 0 && template) {
      effectiveTypeOptions = templateTypeOptions
        .filter((tto) => tto.predefinedSlotId === template.id)
        .map((tto) => ({
          id: 0,
          slotId: slot.id,
          ingredientTypeId: tto.ingredientTypeId,
          isDefault: tto.isDefault,
          sortOrder: tto.sortOrder,
          extraCost: tto.extraCost,
        }));
    }
    if (effectiveTypeOptions.length === 0 && slot.ingredientTypeId) {
      effectiveTypeOptions = [{ id: 0, slotId: slot.id, ingredientTypeId: slot.ingredientTypeId, isDefault: true, sortOrder: 0, extraCost: null }];
    }

    // ── Typed slot: type options + volumes ──
    if (effectiveTypeOptions.length > 0) {
      const typedOptions = effectiveTypeOptions
        .map((to) => {
          const ingType = typeMap.get(to.ingredientTypeId);
          if (!ingType || ingType.isActive === false) return null;

          const globalTypeVolumes = typeVolumes.filter(
            (tv) => tv.ingredientTypeId === to.ingredientTypeId && tv.isActive !== false
          );
          const slotVolMap = new Map(slotVolumes.filter((sv) => sv.slotId === slot.id).map((sv) => [sv.typeVolumeId, sv]));
          const templateVolMap = new Map(templateVolumes.filter((tv) => tv.predefinedSlotId === template?.id).map((tv) => [tv.typeVolumeId, tv]));

          const volumesForType = globalTypeVolumes
            .map((tv) => {
              const override = slotVolMap.get(tv.id);
              const templateDef = templateVolMap.get(tv.id);
              const vol = volumeMap.get(tv.volumeId);
              const isEnabled = override?.isEnabled ?? templateDef?.isEnabled ?? true;
              if (isEnabled === false) return null;
              return {
                typeVolumeId: tv.id,
                volumeName: vol?.name ?? "",
                extraCost: Number(override?.extraCost ?? templateDef?.extraCost ?? tv.extraCost ?? 0),
                isDefault: override?.isDefault ?? templateDef?.isDefault ?? tv.isDefault ?? false,
                isAvailable: true,
                processedQty: Number(override?.processedQty ?? templateDef?.processedQty ?? tv.processedQty ?? vol?.processedQty ?? 0),
              };
            })
            .filter((v): v is NonNullable<typeof v> => v !== null)
            .sort((a, b) => (a.typeVolumeId ?? 0) - (b.typeVolumeId ?? 0));

          return {
            typeOptionId: to.id,
            ingredientTypeId: to.ingredientTypeId,
            typeName: ingType.name ?? "",
            extraCost: Number(to.extraCost ?? ingType.extraCost ?? 0),
            isDefault: to.isDefault ?? false,
            processedQty: Number(to.processedQty ?? ingType.processedQty ?? 0),
            volumes: volumesForType,
          };
        })
        .filter((o): o is NonNullable<typeof o> => o !== null && o.typeName !== "");

      result.push({
        slotId: slot.id,
        slotLabel: slot.slotLabel || template?.slotLabel || "Option",
        isRequired: slot.isRequired ?? template?.isRequired ?? false,
        slotStyle: "typed",
        customerSortOrder: slot.customerSortOrder ?? 1,
        options: [],
        typeOptions: typedOptions,
      });
      continue;
    }

    // ── Legacy slot: ingredient options ──
    if (slot.ingredientId) {
      const ingredientOptionsForSlot = ingredientOptions
        .filter((o) => o.ingredientId === slot.ingredientId)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);

      result.push({
        slotId: slot.id,
        slotLabel: slot.slotLabel || "Option",
        isRequired: slot.isRequired ?? false,
        slotStyle: "legacy",
        customerSortOrder: slot.customerSortOrder ?? 1,
        ingredientId: slot.ingredientId,
        options: ingredientOptionsForSlot.map((o) => ({
          optionId: o.id,
          label: o.label,
          extraCost: Number(o.extraCost ?? 0),
          isDefault: o.isDefault ?? false,
          isAvailable: true,
          processedQty: Number(o.processedQty ?? 0),
        })),
        typeOptions: [],
      });
      continue;
    }

    // ── Fallback: no options ──
    result.push({
      slotId: slot.id,
      slotLabel: slot.slotLabel || "Option",
      isRequired: slot.isRequired ?? false,
      slotStyle: "legacy",
      customerSortOrder: slot.customerSortOrder ?? 1,
      options: [],
      typeOptions: [],
    });
  }

  return result;
}

router.get("/mobile/drinks/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid drink id" });
    return;
  }
  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.id, id)).limit(1);
  if (!drink) {
    res.status(404).json({ error: "Drink not found" });
    return;
  }

  const price = await getStandardProductPrice(id);

  // Build the full customization recipe (slots -> type options + volumes / legacy options).
  const recipeSlots = await buildMobileRecipeSlots(id);

  // Derive human-readable ingredients from the recipe so ProductDetails shows the
  // recipe's standard (default) option + volume for each slot.
  const ingredients = recipeSlots.map((slot) => {
    let optionLabel: string | null = null;
    let volumeLabel: string | null = null;

    if (slot.slotStyle === "typed" && slot.typeOptions.length > 0) {
      const defType = slot.typeOptions.find((to: any) => to.isDefault) ?? slot.typeOptions[0];
      optionLabel = defType?.typeName ?? null;
      const defVol = defType?.volumes?.find((v: any) => v.isDefault) ?? defType?.volumes?.[0];
      volumeLabel = defVol?.volumeName ?? null;
    } else if (slot.options.length > 0) {
      const defOpt = slot.options.find((o: any) => o.isDefault) ?? slot.options[0];
      optionLabel = defOpt?.label ?? null;
    }

    return {
      slotLabel: slot.slotLabel,
      name: optionLabel ?? slot.slotLabel,
      optionLabel,
      volumeLabel,
      isRequired: slot.isRequired,
      customerSortOrder: slot.customerSortOrder ?? 1,
    };
  });

    res.json({
      drink: {
        id: drink.id,
        name: drink.name,
        description: drink.description,
        category: drink.category,
        categoryId: drink.categoryId,
        imageUrl: drink.imageUrl,
        isCustomizable: drink.isCustomizable,
        price,
        cupSizeMl: drink.cupSizeMl,
      },
    ingredients: serializeDates(ingredients),
    slots: recipeSlots,
  });
});

// ── Orders: My orders ────────────────────────────────────────────────────────
router.get("/mobile/orders", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.json({ orders: [] });
    return;
  }
  const orders = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      status: ordersTable.status,
      total: ordersTable.total,
      subtotal: ordersTable.subtotal,
      discount: ordersTable.discount,
      paymentMethod: ordersTable.paymentMethod,
      source: ordersTable.source,
      branchId: ordersTable.branchId,
      createdAt: ordersTable.createdAt,
      branchName: branchesTable.name,
    })
    .from(ordersTable)
    .leftJoin(branchesTable, eq(ordersTable.branchId, branchesTable.id))
    .where(eq(ordersTable.customerPhone, customer.phone))
    .orderBy(desc(ordersTable.createdAt))
    .limit(50);
  res.json({ orders: serializeDates(orders) });
});

// ── Orders: Order detail ─────────────────────────────────────────────────────
router.get("/mobile/orders/:id", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const id = parseInt(req.params.id as string);
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.customerPhone, customer.phone)))
    .limit(1);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [items, payments, branch] = await Promise.all([
    db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id)),
    db.select().from(orderPaymentsTable).where(eq(orderPaymentsTable.orderId, order.id)),
    db.select().from(branchesTable).where(eq(branchesTable.id, order.branchId)).limit(1),
  ]);
  const itemIds = items.map((i) => i.id);
  const customizations = itemIds.length > 0
    ? await db.select().from(orderItemCustomizationsTable).where(inArray(orderItemCustomizationsTable.orderItemId, itemIds))
    : [];
  const custByItem = new Map<number, any[]>();
  for (const c of customizations) {
    const list = custByItem.get(c.orderItemId) ?? [];
    list.push(c);
    custByItem.set(c.orderItemId, list);
  }
  res.json({
    order: serializeDates({
      ...order,
      subtotal: parseFloat(order.subtotal),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      branchName: branch[0]?.name ?? "Unknown",
      payments: payments.map((p) => ({ ...p, amount: parseFloat(p.amount) })),
      items: items.map((i) => ({
        ...i,
        unitPrice: parseFloat(i.unitPrice),
        lineTotal: parseFloat(i.lineTotal),
        customizations: custByItem.get(i.id) ?? [],
      })),
    }),
  });
});

// ── Orders: Place order (source=mobile) ──────────────────────────────────────
router.post("/mobile/orders", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.status(401).json({ error: "Customer not found" });
    return;
  }

  const { branchId, items, paymentMethod, notes, discountCode } = req.body ?? {};
  if (!branchId || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "branchId and items are required" });
    return;
  }

  const [branch] = await db.select().from(branchesTable).where(eq(branchesTable.id, branchId)).limit(1);
  if (!branch) {
    res.status(400).json({ error: "Branch not found" });
    return;
  }

  // Compute totals & customizations using the shared price calculator
  let subtotal = 0;
  const itemDetails: any[] = [];
  for (const item of items) {
    const calcData = await calculateDrinkData(item.drinkId, item.selections ?? [], branchId, null);
    const customizations = calcData.customizations.map((c: any) => ({
      ingredientId: c.ingredientId,
      optionId: c.optionId,
      typeVolumeId: c.typeVolumeId,
      consumedQty: c.consumedQty * (item.quantity ?? 1),
      producedQty: c.producedQty * (item.quantity ?? 1),
      addedCost: c.addedCost,
      slotLabel: c.slotLabel,
      optionLabel: c.optionLabel,
      baristaSortOrder: c.baristaSortOrder,
      customerSortOrder: c.customerSortOrder,
    }));
    const unitPrice = calcData.totalPrice;
    const lineTotal = unitPrice * (item.quantity ?? 1);
    subtotal += lineTotal;
    itemDetails.push({
      drinkId: item.drinkId,
      drinkName: calcData.drink.name,
      kitchenStation: calcData.drink.kitchenStation,
      kitchenStationId: calcData.drink.kitchenStationId,
      quantity: item.quantity ?? 1,
      unitPrice,
      lineTotal,
      specialNotes: item.specialNotes ?? null,
      customizations,
    });
  }

  // ── Calculate Offer Discount (BOGO: buy N get X free) ─────────────────────
  const offersList = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.isActive, true));

  const activeOffers: (typeof offersList[0])[] = [];
  for (const o of offersList) {
    const offerBranches = await db.select().from(offersBranchesTable).where(eq(offersBranchesTable.offerId, o.id));
    const oBranchIds = offerBranches.map((b: any) => b.branchId);

    if (branchId && oBranchIds.length > 0 && !oBranchIds.includes(branchId)) continue;
    if (!(o.applyToStore ?? true)) continue;

    activeOffers.push(o);
  }

  let offerDiscountAmount = 0;
  let offerIdToSave: number | null = null;

  for (const activeOffer of activeOffers) {
    const N = activeOffer.buyAmount;
    const X = activeOffer.freeAmount;

    const applicableRows = await db.select().from(offersApplicableDrinksTable).where(eq(offersApplicableDrinksTable.offerId, activeOffer.id));
    const rewardRows = await db.select().from(offersRewardDrinksTable).where(eq(offersRewardDrinksTable.offerId, activeOffer.id));
    const excludedRows = await db.select().from(offersExcludedDrinksTable).where(eq(offersExcludedDrinksTable.offerId, activeOffer.id));

    const applicableDrinkIds = applicableRows.map(r => r.drinkId);
    const rewardDrinkIds = rewardRows.map(r => r.drinkId);
    const excludedDrinkIds = excludedRows.map(r => r.drinkId);

    const triggerItems = itemDetails.filter(item =>
      !excludedDrinkIds.includes(item.drinkId) &&
      (applicableDrinkIds.length === 0 || applicableDrinkIds.includes(item.drinkId))
    );

    const rewardItems = itemDetails.filter(item =>
      !excludedDrinkIds.includes(item.drinkId) &&
      (rewardDrinkIds.length === 0 || rewardDrinkIds.includes(item.drinkId))
    );

    const triggerQty = triggerItems.reduce((sum, item) => sum + item.quantity, 0);
    const isCrossList = applicableDrinkIds.length > 0 && rewardDrinkIds.length > 0 &&
      !applicableDrinkIds.some(id => rewardDrinkIds.includes(id));

    let F = 0;
    if (isCrossList) {
      const maxEarned = Math.floor(triggerQty / N) * X;
      const rewardQty = rewardItems.reduce((sum, item) => sum + item.quantity, 0);
      F = Math.min(maxEarned, rewardQty);
    } else {
      const M = triggerQty;
      F = Math.floor(M / (N + X)) * X + Math.min(X, Math.max(0, (M % (N + X)) - N));
    }

    if (F > 0 && rewardItems.length > 0) {
      const flatRewardPrices = rewardItems.flatMap(item =>
        Array.from({ length: item.quantity }).map(() => item.unitPrice)
      ).sort((a, b) => a - b);

      const itemsToDiscountCount = Math.min(F, flatRewardPrices.length);
      if (itemsToDiscountCount > 0) {
        if (!offerIdToSave) offerIdToSave = activeOffer.id;
        for (let i = 0; i < itemsToDiscountCount; i++) {
          offerDiscountAmount += flatRewardPrices[i];
        }
      }
    }
  }

  // ── Discount handling (coupon or customer-linked discount) ────────────────
  let discountAmount = 0;
  let discountId: number | null = null;
  let discountCodeSaved: string | null = null;
  let discountValue: number | null = null;
  let discountType: "percentage" | "fixed" | "fixed_per_item" | null = null;

  // Rule: offers and discounts are mutually exclusive - offers take priority.
  if (offerDiscountAmount > 0) {
    discountAmount = 0;
  } else {
    let discountRow: any = null;

    // 1. Explicit discount code from the app takes precedence.
    if (discountCode) {
      const [row] = await db
        .select()
        .from(discountsTable)
        .where(eq(discountsTable.code, discountCode))
        .limit(1);
      if (row && row.isActive) discountRow = row;
    }
    // 2. Otherwise auto-apply the customer's linked discount (e.g. STAFF50).
    else if (customer.discountId) {
      const [row] = await db
        .select()
        .from(discountsTable)
        .where(eq(discountsTable.id, customer.discountId))
        .limit(1);
      if (row && row.isActive) discountRow = row;
    }

    if (discountRow) {
      discountId = discountRow.id;
      discountCodeSaved = discountRow.code;
      discountValue = parseFloat(discountRow.value);
      discountType = discountRow.type as any;
      const totalItemCount = itemDetails.reduce((sum, item) => sum + item.quantity, 0);
      // Products are tax-inclusive (14% VAT). Discounts are NOT tax-included, so
      // percentage discounts are computed on the ex-tax (net) subtotal unless the
      // discount is explicitly marked taxable. Fixed discounts are already net values.
      const isTaxable = discountRow.isTaxable ?? false;
      const baseForCalc = isTaxable ? subtotal : subtotal / 1.14;
      if (discountRow.type === "percentage") {
        discountAmount = (baseForCalc * parseFloat(discountRow.value)) / 100;
      } else if (discountRow.type === "fixed") {
        discountAmount = Math.min(parseFloat(discountRow.value), subtotal);
      } else if (discountRow.type === "fixed_per_item") {
        discountAmount = Math.min(parseFloat(discountRow.value) * totalItemCount, subtotal);
      }
    }
  }

  const total = Math.max(0, subtotal - (offerDiscountAmount > 0 ? offerDiscountAmount : discountAmount));

  const baristaId = await getDefaultBaristaId();

  const [order] = await db.transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx, branchId);
    const [newOrder] = await tx.insert(ordersTable).values({
      branchId,
      orderNumber,
      baristaId,
      status: "pending",
      customerName: customer.name,
      customerPhone: customer.phone,
      subtotal: String(subtotal),
      discount: String(discountAmount),
      discountId,
      discountCode: discountCodeSaved,
      discountValue: discountValue != null ? String(discountValue) : null,
      discountType,
      offerId: offerIdToSave,
      offerDiscount: String(offerDiscountAmount),
      total: String(total),
      paymentMethod: paymentMethod || "card",
      source: "mobile",
      notes: notes ?? null,
    }).returning();

    for (const item of itemDetails) {
      const [orderItem] = await tx.insert(orderItemsTable).values({
        orderId: newOrder.id,
        drinkId: item.drinkId,
        drinkName: item.drinkName,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        lineTotal: String(item.lineTotal),
        specialNotes: item.specialNotes,
        kitchenStation: item.kitchenStation,
        kitchenStationId: item.kitchenStationId,
      }).returning();
      if (item.customizations.length > 0) {
        await tx.insert(orderItemCustomizationsTable).values(
          item.customizations.map((c: any) => ({
            orderItemId: orderItem.id,
            ingredientId: c.ingredientId ? Number(c.ingredientId) : null,
            optionId: c.optionId ? Number(c.optionId) : null,
            typeVolumeId: c.typeVolumeId ? Number(c.typeVolumeId) : null,
            consumedQty: String(c.consumedQty || 0),
            producedQty: String(c.producedQty || 0),
            addedCost: String(c.addedCost || 0),
            slotLabel: c.slotLabel,
            optionLabel: c.optionLabel,
            baristaSortOrder: c.baristaSortOrder,
            customerSortOrder: c.customerSortOrder,
          }))
        );
      }
    }

    // Record the payment
    await tx.insert(orderPaymentsTable).values({
      orderId: newOrder.id,
      paymentMethod: (paymentMethod || "card") as any,
      amount: String(total),
    });

    return [newOrder];
  });

  broadcastEvent("order_created", { orderId: order.id, orderNumber: order.orderNumber });
  await logActivity(req, "CREATE_MOBILE_ORDER", "order", order.id, { total });
  res.status(201).json({ order: serializeDates({ ...order, total: parseFloat(order.total) }) });
});

// ── Orders: Cancel ───────────────────────────────────────────────────────────
router.post("/mobile/orders/:id/cancel", async (req, res): Promise<void> => {
  const customerId = requireCustomer(req, res);
  if (!customerId) return;
  const id = parseInt(req.params.id as string);
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.customerPhone, customer.phone)))
    .limit(1);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (order.status !== "pending" && order.status !== "paid") {
    res.status(400).json({ error: "Order can no longer be cancelled" });
    return;
  }
  const [updated] = await db
    .update(ordersTable)
    .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
    .where(eq(ordersTable.id, id))
    .returning();
  broadcastEvent("order_updated", { orderId: id });
  res.json({ order: serializeDates(updated) });
});

// ── Home: Featured products (drinks flagged as featured) ──────────────────────
router.get("/mobile/home/featured", async (_req, res): Promise<void> => {
  const featured = await db
    .select({
      id: drinksTable.id,
      name: drinksTable.name,
      imageUrl: drinksTable.imageUrl,
      basePrice: drinksTable.basePrice,
    })
    .from(drinksTable)
    .where(and(eq(drinksTable.isFeatured, true), eq(drinksTable.isActive, true)))
    .orderBy(drinksTable.sortOrder);

  const products = await Promise.all(
    featured.map(async (d) => {
      const price = await getStandardProductPrice(d.id);
      return {
        id: d.id,
        name: d.name,
        image: d.imageUrl,
        price: String(price),
        isFeatured: true,
      };
    })
  );

  res.json({ products: serializeDates(products) });
});

// ── Home: Products on sale (active product discounts) ────────────────────────
router.get("/mobile/home/offers", async (req, res): Promise<void> => {
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : null;

  const activeDiscounts = await db
    .select({
      drinkId: productDrinkDiscountsTable.drinkId,
      discountType: productDrinkDiscountsTable.discountType,
      discountValue: productDrinkDiscountsTable.discountValue,
      startDate: productDrinkDiscountsTable.startDate,
      endDate: productDrinkDiscountsTable.endDate,
      branchId: productDrinkDiscountsTable.branchId,
    })
    .from(productDrinkDiscountsTable)
    .where(eq(productDrinkDiscountsTable.isActive, true));

  // Filter to relevant discounts (branch-specific or global)
  const now = new Date();
  const relevantDiscounts = activeDiscounts.filter((d) => {
    if (branchId && d.branchId !== null && d.branchId !== branchId) return false;
    if (d.startDate && new Date(d.startDate) > now) return false;
    if (d.endDate && new Date(d.endDate) < now) return false;
    return true;
  });

  // Deduplicate: keep best discount per drink (prefer branch-specific over global)
  const drinkDiscountMap = new Map<number, typeof relevantDiscounts[0]>();
  for (const d of relevantDiscounts) {
    const existing = drinkDiscountMap.get(d.drinkId);
    if (!existing) {
      drinkDiscountMap.set(d.drinkId, d);
    } else if (d.branchId !== null && existing.branchId === null) {
      drinkDiscountMap.set(d.drinkId, d);
    }
  }

  const drinkIds = Array.from(drinkDiscountMap.keys());
  if (drinkIds.length === 0) {
    res.json({ products: [] });
    return;
  }

  const drinks = await db
    .select()
    .from(drinksTable)
    .where(and(inArray(drinksTable.id, drinkIds), eq(drinksTable.isActive, true)));

  const products = await Promise.all(
    drinks.map(async (d) => {
      const discount = drinkDiscountMap.get(d.id)!;
      const originalPrice = await getStandardProductPrice(d.id);
      let discountedPrice: number;

      if (discount.discountType === "percentage") {
        discountedPrice = originalPrice * (1 - parseFloat(String(discount.discountValue)) / 100);
      } else if (discount.discountType === "fixed_amount") {
        discountedPrice = originalPrice - parseFloat(String(discount.discountValue));
      } else {
        // fixed_price
        discountedPrice = parseFloat(String(discount.discountValue));
      }
      discountedPrice = Math.max(0, discountedPrice);

      return {
        id: d.id,
        name: d.name,
        image: d.imageUrl,
        price: String(discountedPrice.toFixed(2)),
        originalPrice: String(originalPrice.toFixed(2)),
        onSale: true,
      };
    })
  );

  res.json({ products: serializeDates(products) });
});

// ── Home: Slider banners ─────────────────────────────────────────────────────
router.get("/mobile/home/slider", async (_req, res): Promise<void> => {
  // Placeholder: return empty slider until a banners table is added
  res.json({ slider: [] });
});

export default router;
