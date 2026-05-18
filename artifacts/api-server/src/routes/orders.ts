import { Router, type IRouter } from "express";
import { eq, and, inArray, gte, lte, sql, desc } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { serializeDates } from "../lib/serialize";
import { broadcastEvent } from "../lib/sse";
import { logActivity } from "../lib/activity-logger";
import { requirePermission } from "../middleware/permissions";
import { calculateDrinkData } from "../lib/price-calculator";
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
} from "@workspace/db";
import {
  ListOrdersQueryParams,
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function generateOrderNumber(branchId: number): Promise<string> {
  const now = new Date();
  // Day of year (1-indexed): Jan 1 = 1, Apr 16 = 106, Dec 31 = 365/366
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000) + 1;

  // Count orders already created today to derive the next serial
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(ordersTable)
    .where(and(eq(ordersTable.branchId, branchId), gte(ordersTable.createdAt, todayStart)));
  const serial = ((row?.count ?? 0) + 1);

  return `${dayOfYear}${String(serial).padStart(3, "0")}`;
}

async function buildOrderDetail(orderId: number) {
  // Fetch order + items in parallel
  const [[order], items] = await Promise.all([
    db.select().from(ordersTable).where(eq(ordersTable.id, orderId)),
    db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId)),
  ]);
  if (!order) return null;

  // Fetch barista, branch, customizations, and payments in parallel
  const [[barista], [branch], customizations, payments] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, order.baristaId)),
    db.select().from(branchesTable).where(eq(branchesTable.id, order.branchId)),
    items.length > 0
      ? db.select().from(orderItemCustomizationsTable)
          .where(inArray(orderItemCustomizationsTable.orderItemId, items.map((i) => i.id)))
      : Promise.resolve([]),
    db.select().from(orderPaymentsTable).where(eq(orderPaymentsTable.orderId, orderId)),
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
    discountType: order.discountType as "percentage" | "fixed" | null,
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
  const params = ListOrdersQueryParams.safeParse(req.query);
  const sessionUser = (req.session as any);
  const isAdmin = sessionUser.role === "admin";
  const sessionBranchId = sessionUser.branchId;

  const targetBranchId = (isAdmin && req.query.branchId && req.query.branchId !== 'all') 
    ? parseInt(req.query.branchId as string) 
    : (isAdmin && req.query.branchId === 'all') ? null : sessionBranchId;

  const conditions = [];
  if (targetBranchId) {
    conditions.push(eq(ordersTable.branchId, targetBranchId));
  }

  if (params.success && params.data.status) {
    const statuses = params.data.status.split(",") as any[];
    conditions.push(inArray(ordersTable.status, statuses));
  }
  if (params.success && params.data.startDate) {
    conditions.push(gte(ordersTable.createdAt, startOfDay(new Date(params.data.startDate))));
  }
  if (params.success && params.data.endDate) {
    conditions.push(lte(ordersTable.createdAt, endOfDay(new Date(params.data.endDate))));
  }

  const limit = params.success && params.data.limit ? params.data.limit : 50;
  const offset = params.success && params.data.offset ? params.data.offset : 0;

  // If no status provided in reports/dashboard context, we usually want to exclude cancelled/refunded
  // but for the general list, we allow everything unless filtered.
  // However, we'll ensure the conditions are applied at the DB level.
  
  let query = db.select().from(ordersTable).$dynamic();
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const orders = await query
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
        discountType: o.discountType as "percentage" | "fixed" | null,
        total: parseFloat(o.total),
        amountTendered: o.amountTendered ? parseFloat(o.amountTendered) : null,
        changeDue: o.changeDue ? parseFloat(o.changeDue) : null,
        payments: paymentsByOrder.get(o.id) ?? [],
        items: itemsByOrder.get(o.id) ?? [],
      })))
    )
  );
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionUserId = ((req.session as unknown as Record<string, unknown>).userId as number) ?? 1;
  const sessionBranchId = (req.session as any).branchId;
  const bodyBranchId = (req.body as any).branchId;
  const targetBranchId = sessionBranchId || bodyBranchId;

  if (!targetBranchId) {
    res.status(400).json({ error: "No branch associated with session or request" });
    return;
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
          inArray(usersTable.role, ["admin", "supervisor"]),
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
      const calcData = await calculateDrinkData(item.drinkId, item.selections as any[]);
      
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
  const requiredStockMap = new Map<number, number>();
  for (const item of itemDetails) {
    for (const c of item.customizations) {
      if (c.ingredientId && c.consumedQty > 0) {
        const currentReq = requiredStockMap.get(c.ingredientId) ?? 0;
        requiredStockMap.set(c.ingredientId, currentReq + c.consumedQty);
      }
    }
  }

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

  let discountAmount = parsed.data.discount ?? 0;
  let discountId: number | null = null;
  let discountCode: string | null = null;
  let discountValue: number | null = null;
  let discountType: "percentage" | "fixed" | null = null;

  if (parsed.data.discountCode) {
    const [discountRow] = await db
      .select()
      .from(discountsTable)
      .where(eq(discountsTable.code, parsed.data.discountCode));
    
    if (discountRow && discountRow.isActive) {
      discountId = discountRow.id;
      discountCode = discountRow.code;
      discountValue = parseFloat(discountRow.value);
      discountType = discountRow.type as "percentage" | "fixed";
      
      if (discountType === "percentage") {
        const beforeTax = subtotal / 1.14;
        discountAmount = (beforeTax * discountValue) / 100;
      } else {
        discountAmount = discountValue;
      }
    }
  }

  let total = subtotal - discountAmount;
  let discountIdToSave = discountId;
  let discountCodeToSave = discountCode;
  if (parsed.data.paymentMethod === "hospitality") {
    discountAmount = subtotal;
    total = 0;
    discountIdToSave = null;
    discountCodeToSave = "HOSPITALITY";
  }
  const amountTendered = parsed.data.amountTendered ?? null;
  const changeDue = amountTendered != null ? amountTendered - total : null;

  // ── All writes in a single Drizzle transaction ─────────────────────────────
  const orderNumber = await generateOrderNumber(targetBranchId);
  const { order, savedItems } = await db.transaction(async (tx) => {
    const [order] = await tx.insert(ordersTable).values({
      branchId: targetBranchId,
      orderNumber,
      baristaId: sessionUserId,
      status: "pending",
      customerName: parsed.data.customerName ?? null,
      customerPhone: parsed.data.customerPhone ?? null,
      subtotal: String(subtotal),
      discount: String(discountAmount),
      discountId: discountIdToSave,
      discountCode: discountCodeToSave,
      discountValue: discountValue != null ? String(discountValue) : null,
      discountType,
      total: String(total),
      paymentMethod: parsed.data.paymentMethod,
      source: (parsed.data as any).source || "pos",
      amountTendered: amountTendered != null ? String(amountTendered) : null,
      changeDue: changeDue != null ? String(changeDue) : null,
      notes: parsed.data.notes ?? null,
    }).returning();

    // ── Loyalty Points Logic ────────────────────────────────────────────────
    if (parsed.data.customerPhone) {
      // 1 point per 10 currency units before tax (14% tax assumed)
      const pointsToEarn = Math.floor((subtotal / 1.14) / 10);
      if (pointsToEarn > 0) {
        await tx.insert(customersTable)
          .values({
            phone: parsed.data.customerPhone,
            name: parsed.data.customerName || "Customer",
            points: pointsToEarn,
            totalSpent: String(total),
            visitCount: 1,
          })
          .onConflictDoUpdate({
            target: [customersTable.phone],
            set: {
              points: sql`${customersTable.points} + cast(${pointsToEarn} as integer)`,
              totalSpent: sql`${customersTable.totalSpent} + cast(${String(total)} as numeric)`,
              visitCount: sql`${customersTable.visitCount} + 1`,
              updatedAt: new Date(),
            }
          });
        console.log(`[loyalty] Awarded ${pointsToEarn} points to ${parsed.data.customerPhone}`);
      }
    }

    // Pre-fetch ingredient stock levels for all ingredients in one query for this branch
    const allIngredientIds = [
      ...new Set(itemDetails.flatMap((d) => d.customizations.map((c) => c.ingredientId).filter((id): id is number => id !== null))),
    ];
    const stockRows = allIngredientIds.length > 0
      ? await tx.select({ ingredientId: branchStockTable.ingredientId, stockQuantity: branchStockTable.stockQuantity })
          .from(branchStockTable)
          .where(and(eq(branchStockTable.branchId, targetBranchId), inArray(branchStockTable.ingredientId, allIngredientIds)))
      : [];
    const stockMap = new Map(stockRows.map((r) => [r.ingredientId, parseFloat(r.stockQuantity)]));
    console.log(`[stock] Pre-fetched stock for ${allIngredientIds.length} ingredients in branch ${targetBranchId}:`, Array.from(stockMap.entries()));

    const savedItems = [];
    for (const item of itemDetails) {
      const [orderItem] = await tx.insert(orderItemsTable).values({
        orderId: order.id,
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
          }))
        );
      }

      // Batch stock deductions: compute new quantities, then do 1 update + 1 insert per ingredient
      const stockUpdates: Array<{ id: number; newQty: number; delta: number }> = [];
      for (const c of item.customizations) {
        if (!c.ingredientId || c.consumedQty === 0) {
          if (c.ingredientId && c.consumedQty === 0) console.log(`[stock] Skipping deduction for ${c.slotLabel} because consumedQty is 0`);
          continue;
        }
        const current = stockMap.get(c.ingredientId) ?? 0;
        const newQty = Math.max(0, current - c.consumedQty);
        console.log(`[stock] Deducting ${c.consumedQty} from ${c.ingredientId} in branch ${targetBranchId}. ${current} -> ${newQty}`);
        stockMap.set(c.ingredientId, newQty);
        stockUpdates.push({ id: c.ingredientId, newQty, delta: c.consumedQty });
      }

      // Batch-update branch stock and insert movements in parallel
      await Promise.all(
        stockUpdates.map((u) =>
          tx.insert(branchStockTable)
            .values({
              branchId: targetBranchId,
              ingredientId: u.id,
              stockQuantity: String(u.newQty),
            })
            .onConflictDoUpdate({
              target: [branchStockTable.branchId, branchStockTable.ingredientId],
              set: { stockQuantity: String(u.newQty) }
            })
        )
      );
      if (stockUpdates.length > 0) {
        await tx.insert(stockMovementsTable).values(
          stockUpdates.map((u) => ({
            branchId: targetBranchId,
            ingredientId: u.id,
            orderId: order.id,
            movementType: "sale" as const,
            quantity: String(-u.delta),
            quantityAfter: String(u.newQty),
            note: `Order ${order.orderNumber}`,
            createdBy: sessionUserId,
          }))
        );
      }

      savedItems.push({ ...orderItem, customizations: item.customizations, kitchenStation: orderItem.kitchenStation });
    }

    // ── Save Payments ──────────────────────────────────────────────────────
    const orderPayments = parsed.data.payments || [];
    if (orderPayments.length > 0) {
      await tx.insert(orderPaymentsTable).values(
        orderPayments.map((p) => ({
          orderId: order.id,
          paymentMethod: p.paymentMethod,
          amount: String(p.amount),
          transactionId: p.transactionId ?? null,
        }))
      );
      // Update main order paymentMethod to 'split' if multiple, or the single method
      await tx.update(ordersTable).set({ 
        paymentMethod: (orderPayments.length > 1 ? "split" : orderPayments[0].paymentMethod) as any
      }).where(eq(ordersTable.id, order.id));
    } else if (parsed.data.paymentMethod) {
      // Fallback for backward compatibility if payments array is missing
      await tx.insert(orderPaymentsTable).values({
        orderId: order.id,
        paymentMethod: parsed.data.paymentMethod,
        amount: String(total),
      });
    }

    return { order, savedItems };
  });

  const [barista] = await db.select().from(usersTable).where(eq(usersTable.id, order.baristaId));

  broadcastEvent("order_created", { orderId: order.id, orderNumber: order.orderNumber });
  await logActivity(req, "CREATE_ORDER", "order", order.id, { total });
  const { globalCache } = await import("../lib/cache");
  globalCache.clear();
  broadcastEvent("inventory_updated", { orderId: order.id });

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
        discountType: order.discountType as "percentage" | "fixed" | null,
        total: parseFloat(order.total),
        amountTendered: order.amountTendered ? parseFloat(order.amountTendered) : null,
        changeDue: order.changeDue ? parseFloat(order.changeDue) : null,
        items: savedItems.map((item) => ({
          ...item,
          kitchenStation: item.kitchenStation,
          unitPrice: parseFloat(item.unitPrice),
          lineTotal: parseFloat(item.lineTotal),
          customizations: item.customizations.map((c) => ({
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
            inArray(usersTable.role, ["admin", "supervisor"]),
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

      // If changed to hospitality, apply 100% discount
      // Fetch current order to get subtotal
      const [existingOrder] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
      if (existingOrder) {
        updateData.discount = String(existingOrder.subtotal);
        updateData.total = "0";
        updateData.discountCode = "HOSPITALITY";
        updateData.discountId = null;
      }
    }
    updateData.paymentMethod = parsed.data.paymentMethod;
  }

  if (parsed.data.status === "paid") {
    const cashierId = (req.body as any).cashierId ?? (req.session as any).cashierId ?? null;
    if (cashierId) updateData.cashierId = cashierId;
    updateData.paidAt = now;
    
    // ── Update/Save Payments ──────────────────────────────────────────────
    if (parsed.data.payments && parsed.data.payments.length > 0) {
      await db.transaction(async (tx) => {
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
      });
    }
  } else if (parsed.data.status === "ready") {
    updateData.readyAt = now;
  } else if (parsed.data.status === "completed") {
    updateData.completedAt = now;
  } else if (parsed.data.status === "cancelled" || parsed.data.status === "refunded") {
    updateData.cancelledAt = now;
  }
  
  // ── Handle Payment Method Change After Approval ─────────────────────────
  // If the status is NOT changing, but payments are provided, it means we are changing payment method
  if (!parsed.data.status || parsed.data.status === (await db.select({status: ordersTable.status}).from(ordersTable).where(eq(ordersTable.id, params.data.id)).limit(1))[0]?.status) {
    if (parsed.data.payments && parsed.data.payments.length > 0) {
       await db.transaction(async (tx) => {
        await tx.delete(orderPaymentsTable).where(eq(orderPaymentsTable.orderId, params.data.id));
        await tx.insert(orderPaymentsTable).values(
          parsed.data.payments!.map((p) => ({
            orderId: params.data.id,
            paymentMethod: p.paymentMethod,
            amount: String(p.amount),
            transactionId: p.transactionId ?? null,
          }))
        );
        // Also update the main order's paymentMethod for legacy/summary
        if (parsed.data.payments!.length === 1) {
          await tx.update(ordersTable).set({ paymentMethod: parsed.data.payments![0].paymentMethod as any }).where(eq(ordersTable.id, params.data.id));
        } else {
          await tx.update(ordersTable).set({ paymentMethod: "split" }).where(eq(ordersTable.id, params.data.id));
        }
      });
    }
  }

  const [order] = await db
    .update(ordersTable)
    .set(updateData)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

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
        inArray(usersTable.role, ["admin", "cashier"]),
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

  // 1. Process refunds logic
  console.log(`[Refund-Debug] Order ${orderId}, Refund Items:`, itemsToRefund, "Return to Stock:", returnToStockItems);
  if (itemsToRefund.length > 0) {
    await db.transaction(async (tx) => {
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
    });
  }

  // 2. Recalculate order totals based on remaining (non-refunded) items
  const allItems = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  const activeItems = allItems.filter(i => i.status !== "refunded" && i.status !== "cancelled");
  const allRefunded = allItems.every(i => i.status === "refunded" || i.status === "cancelled");
  const anyRefunded = allItems.some(i => i.status === "refunded");

  let nextSubtotal = 0;
  for (const item of activeItems) {
    nextSubtotal += parseFloat(item.lineTotal as string);
  }

  let nextDiscount = 0;
  if (order.discountValue && order.discountType) {
    if (order.discountType === "percentage") {
      const beforeTax = nextSubtotal / 1.14;
      nextDiscount = (beforeTax * parseFloat(order.discountValue)) / 100;
    } else {
      // For fixed discount, we keep it as is unless it exceeds the subtotal
      nextDiscount = Math.min(nextSubtotal, parseFloat(order.discountValue));
    }
  }

  // Hospitality orders always have 100% discount
  if (order.discountCode === "HOSPITALITY") {
    nextDiscount = nextSubtotal;
  }

  const nextTotal = Math.max(0, nextSubtotal - nextDiscount);

  let nextStatus = order.status;
  if (allRefunded) {
    nextStatus = "refunded";
  } else if (anyRefunded && nextStatus !== "refunded") {
    // If some items are refunded but not all, we keep the original status (paid/completed/ready)
    // but the total is updated.
  }

  const refundAmount = parseFloat(order.total) - nextTotal;
  if (refundAmount > 0) {
    await db.insert(orderPaymentsTable).values({
      orderId,
      paymentMethod: "refund",
      amount: String(-refundAmount),
      transactionId: `REFUND-${orderId}-${Date.now()}`,
    });
  }

  const [updatedOrder] = await db
    .update(ordersTable)
    .set({ 
      status: nextStatus as any, 
      subtotal: String(nextSubtotal),
      discount: String(nextDiscount),
      total: String(nextTotal),
      ...(allRefunded ? { cancelledAt: new Date() } : {})
    })
    .where(eq(ordersTable.id, orderId))
    .returning();

  broadcastEvent("order_updated", { orderId: updatedOrder.id, status: updatedOrder.status });
  await logActivity(req, "REFUND_ORDER", "order", updatedOrder.id, { returnToStockItems, refundItems: itemsToRefund });
  res.json({ 
    message: allRefunded ? "Order refunded successfully" : "Item(s) refunded successfully", 
    orderId: updatedOrder.id,
    newTotal: updatedOrder.total
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

export default router;
