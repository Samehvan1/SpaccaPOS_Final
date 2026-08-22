import { Router, type IRouter } from "express";
import { eq, and, inArray, gte, lte, sql, desc, ilike, isNull, isNotNull } from "drizzle-orm";
import { serializeDates } from "../lib/serialize";

function parseLocalDate(dateStr: any): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) {
    if (
      dateStr.getUTCHours() === 0 &&
      dateStr.getUTCMinutes() === 0 &&
      dateStr.getUTCSeconds() === 0 &&
      dateStr.getUTCMilliseconds() === 0
    ) {
      return new Date(dateStr.getUTCFullYear(), dateStr.getUTCMonth(), dateStr.getUTCDate());
    }
    return dateStr;
  }
  if (typeof dateStr !== "string") return new Date();
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(dateStr);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? new Date(dateStr) : date;
}

function toCairoMidnight(localDate: Date, isEnd: boolean): Date {
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();
  
  const approxUtc = isEnd 
    ? new Date(Date.UTC(year, month, day, 23, 59, 59, 999))
    : new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Cairo",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    
    const partsFmt = formatter.formatToParts(approxUtc);
    const fYear = parseInt(partsFmt.find(p => p.type === 'year')!.value, 10);
    const fMonth = parseInt(partsFmt.find(p => p.type === 'month')!.value, 10) - 1;
    const fDay = parseInt(partsFmt.find(p => p.type === 'day')!.value, 10);
    const fHour = parseInt(partsFmt.find(p => p.type === 'hour')!.value, 10);
    const fMin = parseInt(partsFmt.find(p => p.type === 'minute')!.value, 10);
    const fSec = parseInt(partsFmt.find(p => p.type === 'second')!.value, 10);
    
    const formattedUtc = Date.UTC(fYear, fMonth, fDay, fHour, fMin, fSec);
    const offsetMs = approxUtc.getTime() - formattedUtc;
    
    return new Date(approxUtc.getTime() + offsetMs);
  } catch (e) {
    return localDate;
  }
}

function startOfDay(d: Date): Date {
  return toCairoMidnight(d, false);
}

function endOfDay(d: Date): Date {
  return toCairoMidnight(d, true);
}
import { broadcastEvent } from "../lib/sse";
import { logActivity } from "../lib/activity-logger";
import { requirePermission } from "../middleware/permissions";
import { calculateDrinkData, resolveProductDiscount, calculateProductDiscountAmount } from "../lib/price-calculator";
import {
  db,
  ordersTable,
  orderItemsTable,
  orderItemCustomizationsTable,
  drinksTable,
  ingredientsTable,
  branchStockTable,
  ingredientOptionsTable,
  drinkIngredientSlotsTable,
  stockMovementsTable,
  usersTable,
  drinkSlotTypeOptionsTable,
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  drinkSlotVolumesTable,
  ingredientVolumesTable,
  discountsTable,
  kitchenStationsTable,
  customersTable,
  signaturesTable,
  orderPaymentsTable,
  branchesTable,
  settingsTable,
  bomsTable,
  bomItemsTable,
  offersTable,
  offersBranchesTable,
  offersPartnersTable,
  offersApplicableDrinksTable,
  offersRewardDrinksTable,
  offersExcludedDrinksTable,
  partnersTable,
} from "@workspace/db";

export async function expandLivePrepareIngredients(
  dbOrTx: any,
  items: Array<{ ingredientId: number; consumedQty: number; parentName?: string }>
): Promise<Array<{ ingredientId: number; consumedQty: number; isLiveComponent?: boolean; parentName?: string }>> {
  if (items.length === 0) return [];

  const ingredientIds = Array.from(new Set(items.map(i => i.ingredientId)));
  const boms = await dbOrTx
    .select({
      bom: bomsTable,
      targetIngredient: ingredientsTable,
    })
    .from(bomsTable)
    .innerJoin(ingredientsTable, eq(bomsTable.targetIngredientId, ingredientsTable.id))
    .where(and(inArray(bomsTable.targetIngredientId, ingredientIds), eq(bomsTable.isActive, true), eq(bomsTable.isLivePrepare, true)));

  if (boms.length === 0) {
    return items;
  }

  const liveBomMap = new Map<number, { bom: typeof bomsTable.$inferSelect; targetIngredient: typeof ingredientsTable.$inferSelect }>();
  boms.forEach((b: any) => liveBomMap.set(b.bom.targetIngredientId, b));
  const bomIds = boms.map((b: any) => b.bom.id);

  const bomItems = await dbOrTx
    .select()
    .from(bomItemsTable)
    .where(inArray(bomItemsTable.bomId, bomIds));

  const bomItemsMap = new Map<number, typeof bomItems>();
  bomItems.forEach((item: any) => {
    const list = bomItemsMap.get(item.bomId) ?? [];
    list.push(item);
    bomItemsMap.set(item.bomId, list);
  });

  const expandedList: Array<{ ingredientId: number; consumedQty: number; isLiveComponent?: boolean; parentName?: string }> = [];

  for (const item of items) {
    const liveBomEntry = liveBomMap.get(item.ingredientId);
    if (!liveBomEntry) {
      expandedList.push(item);
      continue;
    }

    const { bom, targetIngredient } = liveBomEntry;
    const yieldQty = parseFloat(bom.yieldQuantity || "1");
    const multiplier = yieldQty > 0 ? item.consumedQty / yieldQty : 1;
    const components = bomItemsMap.get(bom.id) ?? [];

    for (const comp of components) {
      const compQty = parseFloat(comp.quantity || "0") * multiplier;
      expandedList.push({
        ingredientId: comp.ingredientId,
        consumedQty: compQty,
        isLiveComponent: true,
        parentName: targetIngredient.name,
      });
    }
  }

  const hasSubLive = expandedList.some(e => liveBomMap.has(e.ingredientId));
  if (hasSubLive) {
    return expandLivePrepareIngredients(dbOrTx, expandedList);
  }

  return expandedList;
}

import {
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

export function getDayOfYear(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')!.value);
  const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1; // 0-indexed
  const day = parseInt(parts.find(p => p.type === 'day')!.value);

  const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (isLeapYear) {
    monthLengths[1] = 29;
  }
  let dayOfYear = day;
  for (let i = 0; i < month; i++) {
    dayOfYear += monthLengths[i];
  }
  return dayOfYear;
}

export function getCairoStartOfDay(date: Date): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')!.value);
  const month = parseInt(parts.find(p => p.type === 'month')!.value);
  const day = parseInt(parts.find(p => p.type === 'day')!.value);

  const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const cairoHours = parseInt(new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    hour: "numeric",
    hourCycle: "h23"
  }).format(utcMidnight));
  
  utcMidnight.setUTCHours(utcMidnight.getUTCHours() - cairoHours);
  return utcMidnight;
}

async function generateOrderNumber(tx: any, branchId: number): Promise<string> {
  // Acquire a lock on the branch row to serialize order number generation and prevent collisions
  await tx
    .select({ id: branchesTable.id })
    .from(branchesTable)
    .where(eq(branchesTable.id, branchId))
    .for("update");

  const now = new Date();
  const dayOfYear = getDayOfYear(now);
  const todayStart = getCairoStartOfDay(now);

  const existingOrders = await tx
    .select({ orderNumber: ordersTable.orderNumber })
    .from(ordersTable)
    .where(and(eq(ordersTable.branchId, branchId), gte(ordersTable.createdAt, todayStart)));

  let maxSerial = 0;
  const newPrefix = `${branchId}-${dayOfYear}`;
  const oldPrefix = `${dayOfYear}`;

  for (const o of existingOrders) {
    const numStr = o.orderNumber;
    if (numStr.startsWith(newPrefix)) {
      const serialStr = numStr.slice(newPrefix.length);
      const serialPart = parseInt(serialStr, 10);
      if (!isNaN(serialPart) && serialPart > maxSerial) {
        maxSerial = serialPart;
      }
    } else if (numStr.startsWith(oldPrefix) && !numStr.includes("-")) {
      const serialStr = numStr.slice(oldPrefix.length);
      const serialPart = parseInt(serialStr, 10);
      if (!isNaN(serialPart) && serialPart > maxSerial) {
        maxSerial = serialPart;
      }
    }
  }

  const serial = maxSerial + 1;
  return `${newPrefix}${String(serial).padStart(3, "0")}`;
}

export async function loadOfferMap(dbOrTx: any, offerIds: (number | null | undefined)[]) {
  const validIds = [...new Set(offerIds.filter((id): id is number => typeof id === "number" && id > 0))];
  if (validIds.length === 0) return new Map<number, any>();

  const offers = await dbOrTx.select().from(offersTable).where(inArray(offersTable.id, validIds));
  const [applicable, reward, excluded] = await Promise.all([
    dbOrTx.select().from(offersApplicableDrinksTable).where(inArray(offersApplicableDrinksTable.offerId, validIds)),
    dbOrTx.select().from(offersRewardDrinksTable).where(inArray(offersRewardDrinksTable.offerId, validIds)),
    dbOrTx.select().from(offersExcludedDrinksTable).where(inArray(offersExcludedDrinksTable.offerId, validIds)),
  ]);

  const appMap = new Map<number, number[]>();
  for (const a of applicable) {
    const list = appMap.get(a.offerId) ?? [];
    list.push(a.drinkId);
    appMap.set(a.offerId, list);
  }
  const rewMap = new Map<number, number[]>();
  for (const r of reward) {
    const list = rewMap.get(r.offerId) ?? [];
    list.push(r.drinkId);
    rewMap.set(r.offerId, list);
  }
  const excMap = new Map<number, number[]>();
  for (const e of excluded) {
    const list = excMap.get(e.offerId) ?? [];
    list.push(e.drinkId);
    excMap.set(e.offerId, list);
  }

  const map = new Map<number, any>();
  for (const o of offers) {
    map.set(o.id, {
      id: o.id,
      name: o.name,
      buyAmount: o.buyAmount,
      freeAmount: o.freeAmount,
      promoLabel: o.promoLabel ?? null,
      applicableDrinkIds: appMap.get(o.id) ?? [],
      rewardDrinkIds: rewMap.get(o.id) ?? [],
      excludedDrinkIds: excMap.get(o.id) ?? [],
    });
  }
  return map;
}

async function buildOrderDetail(orderId: number) {
  // Fetch order + items in parallel
  const [[order], items] = await Promise.all([
    db.select().from(ordersTable).where(eq(ordersTable.id, orderId)),
    db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId)),
  ]);
  if (!order) return null;

  // Fetch barista, branch, customizations, payments, and offer details in parallel
  const [[barista], [branch], customizations, payments, offerMap] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, order.baristaId)),
    db.select().from(branchesTable).where(eq(branchesTable.id, order.branchId)),
    items.length > 0
      ? db.select().from(orderItemCustomizationsTable)
          .where(inArray(orderItemCustomizationsTable.orderItemId, items.map((i) => i.id)))
      : Promise.resolve([]),
    db.select().from(orderPaymentsTable).where(eq(orderPaymentsTable.orderId, orderId)),
    order.offerId ? loadOfferMap(db, [order.offerId]) : Promise.resolve(new Map()),
  ]);

  const custByItem = new Map<number, typeof customizations>();
  for (const c of customizations) {
    const list = custByItem.get(c.orderItemId) ?? [];
    list.push(c);
    custByItem.set(c.orderItemId, list);
  }

  return {
    ...order,
    baristaName: barista?.name ?? "Unknown",
    branchName: branch?.name ?? "Unknown",
    subtotal: parseFloat(order.subtotal),
    discount: parseFloat(order.discount),
    discountId: order.discountId,
    discountCode: order.discountCode,
    discountValue: order.discountValue ? parseFloat(order.discountValue) : null,
    discountType: order.discountType as "percentage" | "fixed" | "fixed_per_item" | null,
    offerId: order.offerId,
    offerDiscount: order.offerDiscount ? parseFloat(order.offerDiscount) : 0,
    offer: order.offerId ? (offerMap.get(order.offerId) ?? null) : null,
    total: parseFloat(order.total),

    amountTendered: order.amountTendered ? parseFloat(order.amountTendered) : null,
    changeDue: order.changeDue ? parseFloat(order.changeDue) : null,
    payments: payments.map(p => ({
      ...p,
      amount: parseFloat(p.amount),
    })),
    items: items.map((item) => ({
      ...item,
      status: item.status as "pending" | "ready" | "refunded" | "cancelled",
      unitPrice: parseFloat(item.unitPrice),
      lineTotal: parseFloat(item.lineTotal),
      refundedAmount: item.refundedAmount ? parseFloat(item.refundedAmount) : null,
      customizations: (custByItem.get(item.id) ?? []).map((c) => ({
        ...c,
        consumedQty: parseFloat(c.consumedQty),
        producedQty: parseFloat(c.producedQty),
        addedCost: parseFloat(c.addedCost),
      })),
    })),
  };
}

router.get("/orders", requirePermission("cashier:view"), async (req, res): Promise<void> => {
  const statusStr = req.query.status as string | undefined;
  const startDateStr = req.query.startDate as string | undefined;
  const endDateStr = req.query.endDate as string | undefined;
  const sessionUser = (req.session as any);
  const isAdmin = sessionUser.role === "admin";
  const sessionBranchId = sessionUser.branchId;

  const targetBranchId = (isAdmin && req.query.branchId && req.query.branchId !== 'all' && req.query.branchId !== 'null' && req.query.branchId !== 'undefined') 
    ? parseInt(req.query.branchId as string) 
    : (isAdmin && (req.query.branchId === 'all' || req.query.branchId === 'null' || req.query.branchId === 'undefined')) ? null : sessionBranchId;

  const conditions = [];
  if (targetBranchId) {
    conditions.push(eq(ordersTable.branchId, targetBranchId));
  }

  const partnerIdStr = req.query.partnerId as string | undefined;
  const sourceStr = req.query.source as string | undefined;

  if (statusStr && statusStr !== 'null' && statusStr !== 'undefined' && statusStr !== '') {
    const statuses = statusStr.split(",") as any[];
    conditions.push(inArray(ordersTable.status, statuses));
  }
  if (startDateStr && startDateStr !== 'null' && startDateStr !== 'undefined' && startDateStr !== '') {
    conditions.push(gte(ordersTable.createdAt, startOfDay(parseLocalDate(startDateStr))));
  }
  if (endDateStr && endDateStr !== 'null' && endDateStr !== 'undefined' && endDateStr !== '') {
    conditions.push(lte(ordersTable.createdAt, endOfDay(parseLocalDate(endDateStr))));
  }
  if (sourceStr && sourceStr !== 'all' && sourceStr !== 'null' && sourceStr !== 'undefined' && sourceStr !== '') {
    conditions.push(eq(ordersTable.source, sourceStr as any));
  }
  if (partnerIdStr && partnerIdStr !== 'all' && partnerIdStr !== 'null' && partnerIdStr !== 'undefined' && partnerIdStr !== '') {
    if (partnerIdStr === 'all_partners' || partnerIdStr === 'partners') {
      conditions.push(isNotNull(ordersTable.partnerId));
    } else if (partnerIdStr === 'store' || partnerIdStr === 'none') {
      conditions.push(isNull(ordersTable.partnerId));
    } else if (!isNaN(parseInt(partnerIdStr, 10))) {
      conditions.push(eq(ordersTable.partnerId, parseInt(partnerIdStr, 10)));
    }
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

  // If no status provided in reports/dashboard context, we usually want to exclude cancelled/refunded
  // but for the general list, we allow everything unless filtered.
  // However, we'll ensure the conditions are applied at the DB level.
  
  let query = db.select().from(ordersTable).$dynamic();
  let countQuery = db.select({ count: sql<number>`cast(count(*) as int)` }).from(ordersTable).$dynamic();
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
    countQuery = countQuery.where(and(...conditions)) as any;
  }
  
  const [orders, [countResult]] = await Promise.all([
    query
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset),
    countQuery
  ]);

  const totalCount = countResult?.count ?? 0;
  res.setHeader("X-Total-Count", String(totalCount));
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");

  const orderIds = orders.map((o) => o.id);
  const offerIds = orders.map((o) => o.offerId).filter(Boolean);

  const [items, baristas, payments, branches, partners, offerMap] = await Promise.all([
    orderIds.length > 0
      ? db.select().from(orderItemsTable).where(inArray(orderItemsTable.orderId, orderIds))
      : Promise.resolve([]),
    db.select().from(usersTable), // Fetch all baristas for mapping
    orderIds.length > 0
      ? db.select().from(orderPaymentsTable).where(inArray(orderPaymentsTable.orderId, orderIds))
      : Promise.resolve([]),
    db.select().from(branchesTable), // Fetch all branches for mapping
    db.select().from(partnersTable), // Fetch all ordering partners for mapping
    offerIds.length > 0
      ? loadOfferMap(db, offerIds)
      : Promise.resolve(new Map()),
  ]);

  const itemIds = items.map((i) => i.id);
  const customizations = itemIds.length > 0
    ? await db.select().from(orderItemCustomizationsTable).where(inArray(orderItemCustomizationsTable.orderItemId, itemIds))
    : [];

  const baristaMap = Object.fromEntries(baristas.map((b) => [b.id, b.name]));
  const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));
  const partnerMap = Object.fromEntries(partners.map((p) => [p.id, p.name]));
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

  res.json(
    ListOrdersResponse.parse(
      serializeDates(orders.map((o) => ({
        ...o,
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
        offer: o.offerId ? (offerMap.get(o.offerId) ?? null) : null,
        total: parseFloat(o.total),

        amountTendered: o.amountTendered ? parseFloat(o.amountTendered) : null,
        changeDue: o.changeDue ? parseFloat(o.changeDue) : null,
        partnerId: o.partnerId,
        partnerName: o.partnerId ? (partnerMap[o.partnerId] ?? `Partner #${o.partnerId}`) : null,
        source: o.source,
        payments: paymentsByOrder.get(o.id) ?? [],
        items: itemsByOrder.get(o.id) ?? [],
      })))
    )
  );
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    console.error("[POST /orders] Zod validation error:", JSON.stringify(parsed.error.format(), null, 2));
    console.error("[POST /orders] Received body:", JSON.stringify(req.body, null, 2));
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionUserId = ((req.session as unknown as Record<string, unknown>).userId as number) ?? 1;
  const sessionBranchId = (req.session as any).branchId;
  const bodyBranchId = (req.body as any).branchId || parsed.data.branchId;
  let targetBranchId = sessionBranchId || bodyBranchId;

  if (!targetBranchId) {
    const [firstBranch] = await db.select({ id: branchesTable.id }).from(branchesTable).limit(1);
    targetBranchId = firstBranch ? firstBranch.id : 1;
    console.log(`[POST /orders] Defaulting targetBranchId to ${targetBranchId}`);
  }

  const { items: orderItems, adminPin } = parsed.data;

  // Hospitality requires admin authorization
  if (parsed.data.paymentMethod === "hospitality") {
    if (!adminPin) {
      res.status(403).json({ error: "Admin or Supervisor PIN required for hospitality orders" });
      return;
    }
    const [admin] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.pin, adminPin),
          inArray(usersTable.role, ["admin", "supervisor", "cashier"]),
          eq(usersTable.isActive, true)
        )
      )
      .limit(1);

    if (!admin) {
      console.warn(`[Security] Hospitality authorization failed: Invalid Admin PIN used`);
      res.status(401).json({ error: "Invalid or inactive PIN" });
      return;
    }

    console.log(`[Security] Hospitality authorized by admin: ${admin.name} (ID: ${admin.id})`);
  }

  // ── Batch-fetch all required data in parallel ──────────────────────────────
  const drinkIds = [...new Set(orderItems.map((i) => i.drinkId))];
  const allOptionIds = [
    ...new Set(
      orderItems.flatMap((i) =>
        i.selections.flatMap((s) => [
          ...(s.optionId ? [s.optionId] : []),
          ...(s.subOptionId ? [s.subOptionId] : [])
        ])
      )
    ),
  ];

  // ── Compute totals & customizations ────────────────────────────────────────
  // Log available stations for debugging
  const availStations = await db.select().from(kitchenStationsTable);
  console.log(`[KDS] Available stations:`, availStations.map(s => ({ name: s.name, slug: s.name.toLowerCase().replace(/\s+/g, '-') })));

  type Customization = {
    ingredientId: number | null;
    optionId: number | null;
    typeVolumeId: number | null;
    consumedQty: number;
    producedQty: number;
    addedCost: number;
    slotLabel: string;
    optionLabel: string;
    baristaSortOrder: number;
    customerSortOrder: number;
  };
  type ItemDetail = {
    drinkId: number; drinkName: string; kitchenStation: string; kitchenStationId: number | null; quantity: number;
    unitPrice: number; lineTotal: number; specialNotes: string | null;
    customizations: Customization[];
  };

  let subtotal = 0;
  const itemDetails: ItemDetail[] = [];

  for (const item of orderItems) {
    try {
      const calcData = await calculateDrinkData(
        item.drinkId,
        item.selections as any[],
        targetBranchId,
        parsed.data.partnerId || null
      );
      
      const customizations: Customization[] = calcData.customizations.map(c => ({
        ingredientId: c.ingredientId,
        optionId: c.optionId,
        typeVolumeId: c.typeVolumeId,
        consumedQty: c.consumedQty * item.quantity,
        producedQty: c.producedQty * item.quantity,
        addedCost: c.addedCost,
        slotLabel: c.slotLabel,
        optionLabel: c.optionLabel,
        baristaSortOrder: c.baristaSortOrder,
        customerSortOrder: c.customerSortOrder
      }));

      const unitPrice = calcData.totalPrice;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      itemDetails.push({ 
        drinkId: item.drinkId, 
        drinkName: calcData.drink.name, 
        kitchenStation: calcData.drink.kitchenStation,
        kitchenStationId: calcData.drink.kitchenStationId,
        quantity: item.quantity, 
        unitPrice, 
        lineTotal, 
        specialNotes: item.specialNotes ?? null, 
        customizations 
      });
      console.log(`[KDS] Order Item: ${calcData.drink.name}, Assigned Station: ${calcData.drink.kitchenStation}`);
    } catch (e: any) {
      if (e.message === "Drink not found") {
        res.status(400).json({ error: `Drink ${item.drinkId} not found` });
        return;
      }
      throw e;
    }
  }

  // ── Stock Validation ──
  const rawStockReqs: Array<{ ingredientId: number; consumedQty: number }> = [];
  for (const item of itemDetails) {
    for (const c of item.customizations) {
      if (c.ingredientId && c.consumedQty > 0) {
        rawStockReqs.push({ ingredientId: c.ingredientId, consumedQty: c.consumedQty });
      }
    }
  }

  if (rawStockReqs.length > 0) {
    const expandedReqs = await expandLivePrepareIngredients(db, rawStockReqs);
    const requiredStockMap = new Map<number, number>();
    expandedReqs.forEach((r) => {
      requiredStockMap.set(r.ingredientId, (requiredStockMap.get(r.ingredientId) ?? 0) + r.consumedQty);
    });

    if (requiredStockMap.size > 0) {
    const [allowNoStockSellRow] = await db
      .select()
      .from(settingsTable)
      .where(and(eq(settingsTable.scope, "global"), eq(settingsTable.key, "allowNoStockSell")))
      .limit(1);
    const allowNoStockSell = allowNoStockSellRow ? allowNoStockSellRow.value === "true" : false;

    if (!allowNoStockSell) {
      const allReqIngredientIds = Array.from(requiredStockMap.keys());
      const stockRows = await db
        .select({ 
          ingredientId: branchStockTable.ingredientId, 
          stockQuantity: branchStockTable.stockQuantity,
          name: ingredientsTable.name
        })
        .from(branchStockTable)
        .innerJoin(ingredientsTable, eq(ingredientsTable.id, branchStockTable.ingredientId))
        .where(and(eq(branchStockTable.branchId, targetBranchId), inArray(branchStockTable.ingredientId, allReqIngredientIds)));
      
      const stockMap = new Map(stockRows.map((r) => [r.ingredientId, { stock: parseFloat(r.stockQuantity), name: r.name }]));

      const insufficientStockItems: string[] = [];
      for (const [ingId, reqQty] of requiredStockMap.entries()) {
        const stockInfo = stockMap.get(ingId);
        const availableStock = stockInfo ? stockInfo.stock : 0;
        if (reqQty > availableStock) {
          const ingName = stockInfo ? stockInfo.name : `Ingredient #${ingId}`;
          insufficientStockItems.push(`${ingName} (Required: ${reqQty.toFixed(1)}, Available: ${availableStock.toFixed(1)})`);
        }
      }

      if (insufficientStockItems.length > 0) {
        res.status(400).json({ 
          error: `Insufficient stock for the following: ${insufficientStockItems.join(", ")}` 
        });
        return;
      }
    }
  }
}

  // ── Calculate Offer Discount (Requirement #1, #2, #4) ──────────────────────
  const offersList = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.isActive, true));

  const activeOffers: (typeof offersList[0])[] = [];
  for (const o of offersList) {
    const offerBranches = await db.select().from(offersBranchesTable).where(eq(offersBranchesTable.offerId, o.id));
    const offerPartners = await db.select().from(offersPartnersTable).where(eq(offersPartnersTable.offerId, o.id));
    const oBranchIds = offerBranches.map((b: any) => b.branchId);
    const oPartnerIds = offerPartners.map((p: any) => p.partnerId);

    if (targetBranchId && oBranchIds.length > 0 && !oBranchIds.includes(targetBranchId)) continue;

    if (parsed.data.partnerId) {
      const matchesPartner = (o.applyToAllPartners ?? true) || oPartnerIds.includes(parsed.data.partnerId);
      if (!matchesPartner) continue;
    } else {
      if (!(o.applyToStore ?? true)) continue;
    }

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

  let discountAmount = parsed.data.discount ?? 0;
  let discountId: number | null = null;
  let discountCode: string | null = null;
  let discountValue: number | null = null;
  let discountType: "percentage" | "fixed" | "fixed_per_item" | null = null;

  // Rule #5: when the order has an offer applied, discounts can not be accepted
  if (offerDiscountAmount > 0) {
    discountAmount = 0;
  } else {
    // 1. Fetch order coupon if provided
    let orderCouponRow: any = null;
    if (parsed.data.discountCode) {
      const [row] = await db
        .select()
        .from(discountsTable)
        .where(eq(discountsTable.code, parsed.data.discountCode));
      if (row && row.isActive) {
        orderCouponRow = row;
        discountId = row.id;
        discountCode = row.code;
        discountValue = parseFloat(row.value);
        discountType = row.type as any;
      }
    }

    // 2. Evaluate Best-Deal (Product Discount vs Order Coupon Share) for each line item
    let totalCalculatedDiscount = 0;
    for (const item of itemDetails) {
      const productDisc = await resolveProductDiscount(item.drinkId, targetBranchId, parsed.data.partnerId || null);
      const productDiscPerUnit = calculateProductDiscountAmount(item.unitPrice, productDisc);

      let couponSharePerUnit = 0;
      if (orderCouponRow && discountValue) {
        const isTaxable = orderCouponRow.isTaxable ?? false;
        const baseForCalc = isTaxable ? item.unitPrice : item.unitPrice / 1.14;
        if (discountType === "percentage") {
          couponSharePerUnit = (baseForCalc * discountValue) / 100;
        } else if (discountType === "fixed_per_item") {
          couponSharePerUnit = discountValue;
        } else if (discountType === "fixed" && subtotal > 0) {
          couponSharePerUnit = (item.unitPrice / subtotal) * discountValue;
        }
      }

      // Best-Deal Rule: Select maximum discount per unit
      const bestUnitDiscount = Math.max(productDiscPerUnit, couponSharePerUnit);
      totalCalculatedDiscount += bestUnitDiscount * item.quantity;
    }

    discountAmount = Number(Math.min(totalCalculatedDiscount, subtotal).toFixed(2));
  }

  let total = subtotal - (offerDiscountAmount > 0 ? offerDiscountAmount : discountAmount);
  let discountIdToSave = discountId;
  let discountCodeToSave = discountCode;
  if (parsed.data.paymentMethod === "hospitality") {
    discountAmount = subtotal;
    offerDiscountAmount = 0;
    offerIdToSave = null;
    total = 0;
    discountIdToSave = null;
    discountCodeToSave = "HOSPITALITY";
  }
  const amountTendered = parsed.data.amountTendered ?? null;
  const changeDue = amountTendered != null ? amountTendered - total : null;

  // ── All writes in a single Drizzle transaction ─────────────────────────────
  let order: any;
  let savedItems: any[] = [];
  let retries = 15;

  while (retries > 0) {
    try {
      const resTx = await db.transaction(async (tx) => {
        const orderNumber = await generateOrderNumber(tx, targetBranchId);
        let finalCustomerName = parsed.data.customerName ?? null;

        if (parsed.data.customerPhone) {
          const [existingCust] = await tx
            .select()
            .from(customersTable)
            .where(eq(customersTable.phone, parsed.data.customerPhone.trim()))
            .limit(1);

          if (existingCust) {
            if (!existingCust.isActive) {
              await tx
                .update(customersTable)
                .set({ isActive: true, updatedAt: new Date() })
                .where(eq(customersTable.id, existingCust.id));
              existingCust.isActive = true;
            }

            if (!finalCustomerName) {
              finalCustomerName = existingCust.name;
            }

            if (parsed.data.paymentMethod === "points") {
              // Fetch pointsToEgpRate
              let pointsRate = 10;
              const [pointsToEgpRow] = await tx
                .select()
                .from(settingsTable)
                .where(and(eq(settingsTable.scope, "global"), eq(settingsTable.key, "pointsToEgpRate")))
                .limit(1);
              if (pointsToEgpRow) {
                const parsedRate = parseFloat(pointsToEgpRow.value);
                if (!isNaN(parsedRate) && parsedRate > 0) {
                  pointsRate = parsedRate;
                }
              }

              const pointsNeeded = Math.ceil(total * pointsRate);
              if (existingCust.points < pointsNeeded) {
                throw new Error(`INSUFFICIENT_POINTS: Insufficient points. Needs ${pointsNeeded} points, customer only has ${existingCust.points}`);
              }

              // Deduct points
              await tx
                .update(customersTable)
                .set({
                  points: sql`${customersTable.points} - cast(${pointsNeeded} as integer)`,
                  updatedAt: new Date(),
                })
                .where(eq(customersTable.id, existingCust.id));

              console.log(`[loyalty] Paid by points: Deducted ${pointsNeeded} points from customer ${existingCust.name}`);
              
              // Update local reference to reflect deduction
              existingCust.points -= pointsNeeded;
            }
          } else {
            if (parsed.data.paymentMethod === "points") {
              throw new Error("CUSTOMER_NOT_FOUND: Customer phone not registered for points payment");
            }
            console.log(`[loyalty] New customer phone entered: ${parsed.data.customerPhone}. Creation deferred to cashier approval.`);
          }
        } else if (parsed.data.paymentMethod === "points") {
          throw new Error("PHONE_REQUIRED: Customer phone is required for points payment");
        }

        let commissionRate: string | null = null;
        let commissionAmount: string | null = null;
        let netAmount: string | null = null;

        if (parsed.data.partnerId) {
          const [partner] = await tx
            .select()
            .from(partnersTable)
            .where(eq(partnersTable.id, parsed.data.partnerId))
            .limit(1);
          if (partner) {
            commissionRate = partner.commissionValue;
            const rateNum = parseFloat(partner.commissionValue) || 0;
            if (partner.commissionType === "percentage") {
              commissionAmount = ((total * rateNum) / 100).toFixed(2);
            } else {
              commissionAmount = rateNum.toFixed(2);
            }
            netAmount = (total - parseFloat(commissionAmount)).toFixed(2);
          }
        }

        const [newOrder] = await tx.insert(ordersTable).values({
          branchId: targetBranchId,
          orderNumber,
          baristaId: sessionUserId,
          status: "pending",
          customerName: finalCustomerName,
          customerPhone: parsed.data.customerPhone ?? null,
          subtotal: String(subtotal),
          discount: String(discountAmount),
          discountId: discountIdToSave,
          discountCode: discountCodeToSave,
          discountValue: discountValue != null ? String(discountValue) : null,
          discountType,
          offerId: offerIdToSave,
          offerDiscount: String(offerDiscountAmount),
          total: String(total),
          paymentMethod: parsed.data.paymentMethod,

          source: (parsed.data as any).source || "pos",
          amountTendered: amountTendered != null ? String(amountTendered) : null,
          changeDue: changeDue != null ? String(changeDue) : null,
          notes: parsed.data.notes ?? null,

          partnerId: parsed.data.partnerId ?? null,
          commissionRate,
          commissionAmount,
          netAmount,
        }).returning();

        const allIngredientIds = [
          ...new Set(itemDetails.flatMap((d) => d.customizations.map((c) => c.ingredientId).filter((id): id is number => id !== null))),
        ];
        const ingredientCosts = allIngredientIds.length > 0
          ? await tx.select({ id: ingredientsTable.id, costPerUnit: ingredientsTable.costPerUnit })
              .from(ingredientsTable)
              .where(inArray(ingredientsTable.id, allIngredientIds))
          : [];
        const ingredientCostMap = new Map(ingredientCosts.map((r) => [r.id, r.costPerUnit]));

        const currentSavedItems = [];
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
              item.customizations.map((c) => ({
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
                costPerUnit: c.ingredientId ? (ingredientCostMap.get(c.ingredientId) || "0") : "0",
              }))
            );
          }

          currentSavedItems.push({ ...orderItem, customizations: item.customizations, kitchenStation: orderItem.kitchenStation });
        }

        // ── Save Payments ──────────────────────────────────────────────────────
        const orderPayments = parsed.data.payments || [];
        if (orderPayments.length > 0) {
          await tx.insert(orderPaymentsTable).values(
            orderPayments.map((p) => ({
              orderId: newOrder.id,
              paymentMethod: p.paymentMethod as any,
              amount: String(p.amount),
              transactionId: p.transactionId ?? null,
            }))
          );
          // Update main order paymentMethod to 'split' if multiple, or the single method
          await tx.update(ordersTable).set({ 
            paymentMethod: (orderPayments.length > 1 ? "split" : orderPayments[0].paymentMethod) as any
          }).where(eq(ordersTable.id, newOrder.id));
        } else if (parsed.data.paymentMethod) {
          // Fallback for backward compatibility if payments array is missing
          const isHospitality = parsed.data.paymentMethod === "hospitality";
          await tx.insert(orderPaymentsTable).values({
            orderId: newOrder.id,
            paymentMethod: parsed.data.paymentMethod as any,
            amount: String(isHospitality ? subtotal : total),
          });
        }

        return { order: newOrder, savedItems: currentSavedItems };
      });

      order = resTx.order;
      savedItems = resTx.savedItems;
      break; // Success!
    } catch (err: any) {
      if (err.message?.startsWith("INSUFFICIENT_POINTS:") || 
          err.message?.startsWith("CUSTOMER_NOT_FOUND:") || 
          err.message?.startsWith("PHONE_REQUIRED:")) {
        res.status(400).json({ error: err.message.substring(err.message.indexOf(":") + 1).trim() });
        return;
      }
      retries--;
      const isUniqueViolation = err.code === "23505" || err.message?.includes("unique constraint") || err.message?.includes("duplicate key");
      const isLockContention = err.code === "40001" || err.code === "40P01" || err.message?.includes("deadlock") || err.message?.includes("serialization") || err.message?.includes("concurrent update");
      if ((isUniqueViolation || isLockContention) && retries > 0) {
        console.warn(`[orders] DB contention (code: ${err.code || "unknown"}). Retrying transaction... (${retries} retries left). Error: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 150 + 50));
        continue;
      }
      throw err;
    }
  }

  const [barista] = await db.select().from(usersTable).where(eq(usersTable.id, order.baristaId));

  broadcastEvent("order_created", { orderId: order.id, orderNumber: order.orderNumber });
  await logActivity(req, "CREATE_ORDER", "order", order.id, { total });
  const { globalCache } = await import("../lib/cache");
  globalCache.clear();
  broadcastEvent("inventory_updated", { orderId: order.id });

  const createdOfferMap = order.offerId ? await loadOfferMap(db, [order.offerId]) : new Map();

  res.status(201).json(
    GetOrderResponse.parse(
      serializeDates({
        ...order,
        baristaName: barista?.name ?? "Unknown",
        subtotal: parseFloat(order.subtotal),
        discount: parseFloat(order.discount),
        discountId: order.discountId,
        discountCode: order.discountCode,
        discountValue: order.discountValue ? parseFloat(order.discountValue) : null,
        discountType: order.discountType as "percentage" | "fixed" | "fixed_per_item" | null,
        offerId: order.offerId,
        offerDiscount: order.offerDiscount ? parseFloat(order.offerDiscount) : 0,
        offer: order.offerId ? (createdOfferMap.get(order.offerId) ?? null) : null,
        total: parseFloat(order.total),

        amountTendered: order.amountTendered ? parseFloat(order.amountTendered) : null,
        changeDue: order.changeDue ? parseFloat(order.changeDue) : null,
        items: savedItems.map((item) => ({
          ...item,
          kitchenStation: item.kitchenStation,
          unitPrice: parseFloat(item.unitPrice),
          lineTotal: parseFloat(item.lineTotal),
          customizations: item.customizations.map((c: any) => ({
            ingredientId: c.ingredientId,
            optionId: c.optionId,
            typeVolumeId: c.typeVolumeId,
            consumedQty: c.consumedQty,
            producedQty: c.producedQty,
            addedCost: c.addedCost,
            slotLabel: c.slotLabel,
            optionLabel: c.optionLabel,
            baristaSortOrder: c.baristaSortOrder,
            customerSortOrder: (c as any).customerSortOrder,
            orderItemId: item.id,
            id: 0,
          })),
        })),
      })
    )
  );
});

router.get("/orders/:id", requirePermission("pos:view"), async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const detail = await buildOrderDetail(params.data.id);
  if (!detail) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(serializeDates(detail)));
});

router.patch("/orders/:id/status", async (req, res, next): Promise<void> => {
  // Granular check inside the route because status varies
  const status = req.body.status;
  let perm = "cashier:view";
  if (status === "paid") perm = "cashier:approve_order";
  if (status === "ready") perm = "kitchen:mark_ready";
  if (status === "in_progress") perm = "kitchen:view";
  if (status === "cancelled") perm = "cashier:cancel_order";
  if (status === "refunded") perm = "cashier:refund_order";
  if (status === "completed") perm = "cashier:view";

  return requirePermission(perm)(req, res, next);
}, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existingOrder] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id))
    .limit(1);

  if (!existingOrder) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Attach cashierId when approving — comes from the frontend cashier session
  const updateData: Record<string, unknown> = { status: parsed.data.status };
  const now = new Date();
  
  if (parsed.data.paymentMethod) {
    if (parsed.data.paymentMethod === "hospitality") {
      const adminPin = (parsed.data as any).adminPin;
      if (!adminPin) {
        res.status(403).json({ error: "Admin or Supervisor PIN required for hospitality authorization" });
        return;
      }
      const [admin] = await db
        .select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.pin, adminPin),
            inArray(usersTable.role, ["admin", "supervisor", "cashier"]),
            eq(usersTable.isActive, true)
          )
        )
        .limit(1);

      if (!admin) {
        console.warn(`[Security] Hospitality authorization failed: Invalid Admin PIN used for order ${params.data.id}`);
        res.status(401).json({ error: "Invalid or inactive PIN" });
        return;
      }

      console.log(`[Security] Hospitality authorized by admin: ${admin.name} (ID: ${admin.id}) for order ${params.data.id}`);

      // If changed to hospitality, apply 100% discount (which is equal to subtotal) and remove offers
      updateData.discount = String(existingOrder.subtotal);
      updateData.total = "0";
      updateData.discountCode = "HOSPITALITY";
      updateData.discountId = null;
      updateData.offerId = null;
      updateData.offerDiscount = "0";
    } else if (existingOrder.paymentMethod === "hospitality") {
      // Transitioning away from hospitality: clear hospitality discount and restore total
      updateData.discount = "0";
      updateData.total = String(existingOrder.subtotal);
      updateData.discountCode = null;
      updateData.discountId = null;
      updateData.offerId = null;
      updateData.offerDiscount = "0";
    }
    updateData.paymentMethod = parsed.data.paymentMethod;
  }

  if (parsed.data.status === "paid") {
    // Prefer authenticated session cashierId/userId over body payload to prevent stale frontend session bugs
    const sessionCashierId = (req.session as any).cashierId ?? (req.session as any).userId;
    const cashierId = sessionCashierId ?? (req.body as any).cashierId ?? null;
    if (cashierId) updateData.cashierId = cashierId;
    updateData.paidAt = now;
  } else if (parsed.data.status === "ready") {
    updateData.readyAt = now;
  } else if (parsed.data.status === "completed") {
    updateData.completedAt = now;
  } else if (parsed.data.status === "cancelled" || parsed.data.status === "refunded") {
    updateData.cancelledAt = now;
  }
  
  // ── Update/Save Payments & Stock Deductions inside a single Transaction ──
  let order: any;
  await db.transaction(async (tx) => {
    if (parsed.data.payments && parsed.data.payments.length > 0) {
      // Delete existing payments for this order and replace with new ones
      await tx.delete(orderPaymentsTable).where(eq(orderPaymentsTable.orderId, params.data.id));
      await tx.insert(orderPaymentsTable).values(
        parsed.data.payments!.map((p) => ({
          orderId: params.data.id,
          paymentMethod: p.paymentMethod,
          amount: String(p.amount),
          transactionId: p.transactionId ?? null,
        }))
      );
    } else if (parsed.data.paymentMethod || parsed.data.status === "paid") {
      // If single payment method updated or order approved/paid, update/sync the payment record
      await tx.delete(orderPaymentsTable).where(eq(orderPaymentsTable.orderId, params.data.id));
      
      const finalMethod = (parsed.data.paymentMethod ?? existingOrder.paymentMethod ?? "cash") as any;
      const subtotalVal = parseFloat(existingOrder.subtotal);
      const totalVal = parseFloat((updateData.total as string) ?? existingOrder.total);
      const amountVal = finalMethod === "hospitality" ? subtotalVal : totalVal;

      await tx.insert(orderPaymentsTable).values({
        orderId: params.data.id,
        paymentMethod: finalMethod,
        amount: String(amountVal),
      });
    }

    // Perform stock deduction if the order transitions from pending to a paid/confirmed status
    const isConfirming = existingOrder.status === "pending" && ["paid", "in_progress", "ready", "completed"].includes(parsed.data.status);
    if (isConfirming) {
      // 1. Process customer registration and loyalty points
      if (existingOrder.customerPhone) {
        const [existingCust] = await tx
          .select()
          .from(customersTable)
          .where(eq(customersTable.phone, existingOrder.customerPhone.trim()))
          .limit(1);

        const orderTotal = parseFloat((updateData.total as string) ?? existingOrder.total);

        // Award points & update statistics
        let pointsToEarn = 0;
        if ((updateData.paymentMethod ?? existingOrder.paymentMethod) !== "points") {
          const [pointsRateRow] = await tx
            .select()
            .from(settingsTable)
            .where(and(eq(settingsTable.scope, "global"), eq(settingsTable.key, "pointsConversionRate")))
            .limit(1);
          const pointsRate = pointsRateRow ? parseFloat(pointsRateRow.value) : 10;
          const finalPointsRate = isNaN(pointsRate) || pointsRate <= 0 ? 10 : pointsRate;
          pointsToEarn = Math.floor((orderTotal / 1.14) / finalPointsRate);
        }

        if (existingCust) {
          if (!existingCust.isActive) {
            await tx
              .update(customersTable)
              .set({ isActive: true, updatedAt: new Date() })
              .where(eq(customersTable.id, existingCust.id));
            existingCust.isActive = true;
          }

          await tx
            .update(customersTable)
            .set({
              points: sql`${customersTable.points} + cast(${pointsToEarn} as integer)`,
              totalSpent: sql`${customersTable.totalSpent} + cast(${String(orderTotal)} as numeric)`,
              visitCount: sql`${customersTable.visitCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(customersTable.id, existingCust.id));
          
          console.log(`[loyalty] Cashier approved order: Updated customer ${existingCust.name} (${existingOrder.customerPhone}): +${pointsToEarn} points`);
        } else {
          // Register a new customer
          const newCustName = existingOrder.customerName || "New Customer";
          
          const [newCust] = await tx
            .insert(customersTable)
            .values({
              name: newCustName,
              phone: existingOrder.customerPhone.trim(),
              points: pointsToEarn,
              totalSpent: String(orderTotal),
              visitCount: 1,
              isActive: true,
            })
            .returning();
          
          console.log(`[loyalty] Cashier approved order: Created customer ${newCust.name} (${existingOrder.customerPhone}) and earned +${pointsToEarn} points`);
        }
      }

      // 2. Perform stock deductions
      const customizations = await tx
        .select({
          ingredientId: orderItemCustomizationsTable.ingredientId,
          consumedQty: orderItemCustomizationsTable.consumedQty,
          slotLabel: orderItemCustomizationsTable.slotLabel,
        })
        .from(orderItemCustomizationsTable)
        .innerJoin(orderItemsTable, eq(orderItemsTable.id, orderItemCustomizationsTable.orderItemId))
        .where(eq(orderItemsTable.orderId, existingOrder.id));

      const rawCustomizations: Array<{ ingredientId: number; consumedQty: number }> = [];
      customizations.forEach(c => {
        if (c.ingredientId && parseFloat(c.consumedQty) > 0) {
          rawCustomizations.push({ ingredientId: c.ingredientId, consumedQty: parseFloat(c.consumedQty) });
        }
      });

      if (rawCustomizations.length > 0) {
        const expandedDeductions = await expandLivePrepareIngredients(tx, rawCustomizations);
        const liveComponentNotesMap = new Map<number, string[]>();
        expandedDeductions.forEach(e => {
          if (e.isLiveComponent && e.parentName) {
            const list = liveComponentNotesMap.get(e.ingredientId) ?? [];
            list.push(`Live Prepare component for ${e.parentName}`);
            liveComponentNotesMap.set(e.ingredientId, list);
          }
        });

        const totalsToDeduct = new Map<number, number>();
        expandedDeductions.forEach(c => {
          totalsToDeduct.set(c.ingredientId, (totalsToDeduct.get(c.ingredientId) ?? 0) + c.consumedQty);
        });

        if (totalsToDeduct.size > 0) {
          const ingredientIds = Array.from(totalsToDeduct.keys());
          const stockRows = await tx
            .select({ ingredientId: branchStockTable.ingredientId, stockQuantity: branchStockTable.stockQuantity })
            .from(branchStockTable)
            .where(and(eq(branchStockTable.branchId, existingOrder.branchId), inArray(branchStockTable.ingredientId, ingredientIds)));
          const stockMap = new Map(stockRows.map((r) => [r.ingredientId, parseFloat(r.stockQuantity)]));

          const stockUpdates: Array<{ id: number; newQty: number; delta: number; liveNote?: string }> = [];
          const { deductStockFromBatches } = await import("../lib/stock-utils");

          for (const [ingredientId, delta] of totalsToDeduct.entries()) {
            const current = stockMap.get(ingredientId) ?? 0;
            const newQty = Math.max(0, current - delta);
            const liveNotes = liveComponentNotesMap.get(ingredientId);
            const liveNoteStr = liveNotes && liveNotes.length > 0 ? ` (${[...new Set(liveNotes)].join(", ")})` : "";

            console.log(`[stock] Confirming order: Deducting ${delta} from ${ingredientId} in branch ${existingOrder.branchId}. ${current} -> ${newQty}${liveNoteStr}`);
            stockMap.set(ingredientId, newQty);
            stockUpdates.push({ id: ingredientId, newQty, delta, liveNote: liveNoteStr });

            // Deduct from batches using FEFO
            await deductStockFromBatches(tx, existingOrder.branchId, ingredientId, delta);
          }

          // Batch-update branch stock
          await Promise.all(
            stockUpdates.map((u) =>
              tx.insert(branchStockTable)
                .values({
                  branchId: existingOrder.branchId,
                  ingredientId: u.id,
                  stockQuantity: String(u.newQty),
                })
                .onConflictDoUpdate({
                  target: [branchStockTable.branchId, branchStockTable.ingredientId],
                  set: { stockQuantity: String(u.newQty) }
                })
            )
          );

          // Insert stock movements
          const sessionUserId = (req.session as any).userId;
          await tx.insert(stockMovementsTable).values(
            stockUpdates.map((u) => ({
              branchId: existingOrder.branchId,
              ingredientId: u.id,
              orderId: existingOrder.id,
              movementType: "sale" as const,
              quantity: String(-u.delta),
              quantityAfter: String(u.newQty),
              note: `Order ${existingOrder.orderNumber} Confirmation${u.liveNote || ""}`,
              createdBy: sessionUserId,
            }))
          );
        }
      }
    }

    const [updatedOrder] = await tx
      .update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, params.data.id))
      .returning();
    order = updatedOrder;
  });

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const detail = await buildOrderDetail(params.data.id);
  if (!detail) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  broadcastEvent("order_updated", { orderId: order.id, status: order.status });
  await logActivity(req, "UPDATE_ORDER_STATUS", "order", order.id, { status: order.status });
  res.json(UpdateOrderStatusResponse.parse(serializeDates(detail)));
});

router.patch("/order-items/:id/ready", requirePermission("kitchen:mark_ready"), async (req, res): Promise<void> => {
  const itemId = parseInt(req.params.id as string);
  if (isNaN(itemId)) {
    res.status(400).json({ error: "Invalid item ID" });
    return;
  }

  const [item] = await db
    .update(orderItemsTable)
    .set({ status: "ready", readyAt: new Date() })
    .where(eq(orderItemsTable.id, itemId))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  // Check if all items in the order are ready
  const allItems = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, item.orderId));

  const allReady = allItems.every((i) => i.status === "ready");
  
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, item.orderId));

  if (order) {
    let nextStatus = order.status;
    if (allReady) {
      nextStatus = "ready";
    } else if (order.status === "paid" || order.status === "pending") {
      // If at least one item is ready, it's definitely in progress now
      nextStatus = "in_progress";
    }

    if (nextStatus !== order.status) {
      const orderUpdateData: Record<string, unknown> = { status: nextStatus };
      if (nextStatus === "ready") orderUpdateData.readyAt = new Date();

      await db
        .update(ordersTable)
        .set(orderUpdateData)
        .where(eq(ordersTable.id, order.id));
      
      broadcastEvent("order_updated", { orderId: order.id, status: nextStatus });
    }
  }

  const detail = await buildOrderDetail(item.orderId);
  res.json(GetOrderResponse.parse(serializeDates(detail)));
});

router.post("/orders/:id/refund", requirePermission("cashier:refund_order"), async (req, res): Promise<void> => {
  const { id } = req.params;
  const { adminPin, refundItems, returnToStockItems } = req.body as { adminPin: string; refundItems?: number[]; returnToStockItems?: number[] };
  
  // Backward compatibility: if refundItems is missing but returnToStockItems is present, refund all in returnToStockItems
  const itemsToRefund = refundItems || returnToStockItems || [];

  if (!adminPin) {
    res.status(400).json({ error: "Admin or Cashier PIN is required" });
    return;
  }

  const [admin] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.pin, adminPin),
        inArray(usersTable.role, ["admin", "supervisor", "cashier"]),
        eq(usersTable.isActive, true)
      )
    )
    .limit(1);

  if (!admin) {
    console.warn(`[Security] Refund authorization failed: Invalid Admin PIN used for order ${id}`);
    res.status(401).json({ error: "Invalid or inactive PIN" });
    return;
  }

  console.log(`[Security] Refund authorized by admin: ${admin.name} (ID: ${admin.id}) for order ${id}`);

  const orderId = parseInt(id as string);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // 1. Process refunds logic, recalculation, and loyalty adjustments in a single transaction
  let updatedOrder: any = null;
  let allRefunded = false;
  
  await db.transaction(async (tx) => {
    console.log(`[Refund-Debug] Order ${orderId}, Refund Items:`, itemsToRefund, "Return to Stock:", returnToStockItems);
    
    if (itemsToRefund.length > 0) {
      for (const itemId of itemsToRefund) {
        const shouldReturnToStock = returnToStockItems?.includes(itemId);
        
        if (shouldReturnToStock) {
          const customizations = await tx
            .select()
            .from(orderItemCustomizationsTable)
            .where(eq(orderItemCustomizationsTable.orderItemId, itemId));

          console.log(`[Refund-Debug] Returning stock for item ${itemId}`);

          for (const cust of customizations) {
            if (cust.ingredientId) {
              const consumed = parseFloat(cust.consumedQty as string);
              if (consumed > 0) {
                await tx
                  .update(branchStockTable)
                  .set({
                    stockQuantity: sql`${branchStockTable.stockQuantity} + cast(${String(consumed)} as numeric)`,
                    updatedAt: new Date(),
                  })
                  .where(
                    and(
                      eq(branchStockTable.ingredientId, cust.ingredientId),
                      eq(branchStockTable.branchId, order.branchId)
                    )
                  );
              }
            }
          }
        }
        
        // Update item status to refunded
        const [item] = await tx.select().from(orderItemsTable).where(eq(orderItemsTable.id, itemId)).limit(1);
        if (item) {
          await tx.update(orderItemsTable)
            .set({ 
              status: "refunded", 
              refundedAt: new Date(),
              refundedAmount: item.lineTotal
            })
            .where(eq(orderItemsTable.id, itemId));
        }
      }
    }

    // 2. Recalculate order totals based on remaining (non-refunded) items
    const allItems = await tx.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
    const activeItems = allItems.filter(i => i.status !== "refunded" && i.status !== "cancelled");
    allRefunded = allItems.every(i => i.status === "refunded" || i.status === "cancelled");
    const anyRefunded = allItems.some(i => i.status === "refunded");

    let nextSubtotal = 0;
    for (const item of activeItems) {
      nextSubtotal += parseFloat(item.lineTotal as string);
    }

    let nextDiscount = 0;
    let nextOfferDiscount = 0;

    if (order.offerId) {
      const [offerRow] = await tx
        .select()
        .from(offersTable)
        .where(eq(offersTable.id, order.offerId))
        .limit(1);
      if (offerRow) {
        const N = offerRow.buyAmount;
        const X = offerRow.freeAmount;
        
        const flatPrices = activeItems.flatMap(item => 
          Array.from({ length: item.quantity }).map(() => parseFloat(item.unitPrice as string))
        ).sort((a, b) => a - b);
        
        const M = flatPrices.length;
        const F = Math.floor(M / (N + X)) * X + Math.min(X, Math.max(0, (M % (N + X)) - N));
        if (F > 0) {
          for (let i = 0; i < F; i++) {
            nextOfferDiscount += flatPrices[i];
          }
        }
      }
    }

    if (nextOfferDiscount > 0) {
      nextDiscount = 0;
    } else if (order.discountValue && order.discountType) {
      if (order.discountType === "percentage") {
        const beforeTax = nextSubtotal / 1.14;
        nextDiscount = (beforeTax * parseFloat(order.discountValue)) / 100;
      } else {
        nextDiscount = Math.min(nextSubtotal, parseFloat(order.discountValue));
      }
    }

    // Hospitality orders always have 100% discount
    if (order.discountCode === "HOSPITALITY") {
      nextDiscount = nextSubtotal;
      nextOfferDiscount = 0;
    }

    const nextTotal = Math.max(0, nextSubtotal - (nextOfferDiscount > 0 ? nextOfferDiscount : nextDiscount));

    let nextStatus = order.status;
    if (allRefunded) {
      nextStatus = "refunded";
    }

    const refundAmount = parseFloat(order.total) - nextTotal;
    if (refundAmount > 0) {
      await tx.insert(orderPaymentsTable).values({
        orderId,
        paymentMethod: "refund",
        amount: String(-refundAmount),
        transactionId: `REFUND-${orderId}-${Date.now()}`,
      });
    }

    // 3. Loyalty Adjustments (using tx)
    if (order.customerPhone) {
      const [customer] = await tx
        .select()
        .from(customersTable)
        .where(and(eq(customersTable.phone, order.customerPhone.trim()), eq(customersTable.isActive, true)))
        .limit(1);
      if (customer) {
        const originalTotal = parseFloat(order.total);
        const totalDifference = originalTotal - nextTotal;
        
        let pointsDiff = 0;
        let pointsAction: "add" | "sub" = "add";

        if (order.paymentMethod === "points") {
          // Paid by points: refund points back to customer
          let pointsToEgpRate = 10;
          const [pointsToEgpRow] = await tx
            .select()
            .from(settingsTable)
            .where(and(eq(settingsTable.scope, "global"), eq(settingsTable.key, "pointsToEgpRate")))
            .limit(1);
          if (pointsToEgpRow) {
            const parsedRate = parseFloat(pointsToEgpRow.value);
            if (!isNaN(parsedRate) && parsedRate > 0) {
              pointsToEgpRate = parsedRate;
            }
          }
          const originalPointsSpent = Math.ceil(originalTotal * pointsToEgpRate);
          const newPointsSpent = Math.ceil(nextTotal * pointsToEgpRate);
          pointsDiff = originalPointsSpent - newPointsSpent;
          pointsAction = "add";
        } else {
          // Paid by cash/card/wallet: deduct earned points from customer
          let pointsConversionRate = 10;
          const [pointsConversionRow] = await tx
            .select()
            .from(settingsTable)
            .where(and(eq(settingsTable.scope, "global"), eq(settingsTable.key, "pointsConversionRate")))
            .limit(1);
          if (pointsConversionRow) {
            const parsedRate = parseFloat(pointsConversionRow.value);
            if (!isNaN(parsedRate) && parsedRate > 0) {
              pointsConversionRate = parsedRate;
            }
          }
          const originalPointsEarned = Math.floor((originalTotal / 1.14) / pointsConversionRate);
          const newPointsEarned = Math.floor((nextTotal / 1.14) / pointsConversionRate);
          pointsDiff = originalPointsEarned - newPointsEarned;
          pointsAction = "sub";
        }

        const pointsUpdate = pointsAction === "add"
          ? sql`${customersTable.points} + cast(${Math.max(0, pointsDiff)} as integer)`
          : sql`GREATEST(0, ${customersTable.points} - cast(${Math.max(0, pointsDiff)} as integer))`;

        await tx
          .update(customersTable)
          .set({
            points: pointsUpdate,
            totalSpent: sql`GREATEST(0, ${customersTable.totalSpent} - cast(${String(Math.max(0, totalDifference))} as numeric))`,
            updatedAt: new Date(),
          })
          .where(eq(customersTable.id, customer.id));

        console.log(`[loyalty] Refund loyalty updates for customer ${customer.name}: points diff = ${pointsDiff} (${pointsAction}), spent diff = -${totalDifference}`);
      }
    }

    // 4. Update ordersTable
    const [updatedOrderRow] = await tx
      .update(ordersTable)
      .set({ 
        status: nextStatus as any, 
        subtotal: String(nextSubtotal),
        discount: String(nextDiscount),
        offerDiscount: String(nextOfferDiscount),
        total: String(nextTotal),
        ...(allRefunded ? { cancelledAt: new Date() } : {})
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    updatedOrder = updatedOrderRow;
  });

  if (updatedOrder) {
    broadcastEvent("order_updated", { orderId: updatedOrder.id, status: updatedOrder.status });
  }
  
  await logActivity(req, "REFUND_ORDER", "order", orderId, { returnToStockItems, refundItems: itemsToRefund });
  
  res.json({ 
    message: allRefunded ? "Order refunded successfully" : "Item(s) refunded successfully", 
    orderId: orderId,
    newTotal: updatedOrder ? updatedOrder.total : order.total
  });
});

router.post("/orders/:id/signature", async (req, res): Promise<void> => {
  const orderId = parseInt(req.params.id);
  const { signatureData, orderItemId } = req.body;

  if (!signatureData) {
    res.status(400).json({ error: "Signature data is required" });
    return;
  }

  try {
    const [signature] = await db.insert(signaturesTable).values({
      orderId,
      orderItemId: orderItemId || null,
      signatureData,
    }).returning();

    res.status(201).json({ signature });
  } catch (e: any) {
    console.error("[orders/signature] error:", e?.message);
    res.status(500).json({ error: "Failed to save signature" });
  }
});

router.delete("/orders/test-orders", requirePermission("admin:view"), async (req, res): Promise<void> => {
  try {
    const deleted = await db
      .delete(ordersTable)
      .where(ilike(ordersTable.customerName, "Tester-%"))
      .returning({ id: ordersTable.id });
    
    res.json({
      message: `Successfully deleted ${deleted.length} test orders from the database.`,
      count: deleted.length,
    });
  } catch (err: any) {
    console.error("[orders/cleanup] error:", err.message);
    res.status(500).json({ error: "Failed to delete test orders: " + err.message });
  }
});

export default router;
