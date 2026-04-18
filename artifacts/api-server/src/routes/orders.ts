import { Router, type IRouter } from "express";
import { eq, and, inArray, gte, sql } from "drizzle-orm";
import { serializeDates } from "../lib/serialize";
import { broadcastEvent } from "../lib/sse";
import {
  db,
  ordersTable,
  orderItemsTable,
  orderItemCustomizationsTable,
  drinksTable,
  ingredientsTable,
  ingredientOptionsTable,
  drinkIngredientSlotsTable,
  stockMovementsTable,
  usersTable,
  drinkSlotTypeOptionsTable,
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  drinkSlotVolumesTable,
  ingredientVolumesTable,
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

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  // Day of year (1-indexed): Jan 1 = 1, Apr 16 = 106, Dec 31 = 365/366
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000) + 1;

  // Count orders already created today to derive the next serial
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, todayStart));
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

  // Fetch barista + all customizations in parallel
  const [[barista], customizations] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, order.baristaId)),
    items.length > 0
      ? db.select().from(orderItemCustomizationsTable)
          .where(inArray(orderItemCustomizationsTable.orderItemId, items.map((i) => i.id)))
      : Promise.resolve([]),
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
    subtotal: parseFloat(order.subtotal),
    discount: parseFloat(order.discount),
    total: parseFloat(order.total),
    amountTendered: order.amountTendered ? parseFloat(order.amountTendered) : null,
    changeDue: order.changeDue ? parseFloat(order.changeDue) : null,
    items: items.map((item) => ({
      ...item,
      unitPrice: parseFloat(item.unitPrice),
      lineTotal: parseFloat(item.lineTotal),
      customizations: (custByItem.get(item.id) ?? []).map((c) => ({
        ...c,
        consumedQty: parseFloat(c.consumedQty),
        addedCost: parseFloat(c.addedCost),
      })),
    })),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  const conditions = [];
  if (params.success && params.data.status) {
    conditions.push(eq(ordersTable.status, params.data.status as "pending" | "in_progress" | "ready" | "completed" | "cancelled"));
  }

  const orders = conditions.length
    ? await db.select().from(ordersTable).where(and(...conditions)).orderBy(ordersTable.createdAt)
    : await db.select().from(ordersTable).orderBy(ordersTable.createdAt);

  const limit = params.success && params.data.limit ? params.data.limit : 50;
  const offset = params.success && params.data.offset ? params.data.offset : 0;
  const paginated = orders.slice(offset, offset + limit);

  const baristaIds = [...new Set(paginated.map((o) => o.baristaId))];
  const baristas = baristaIds.length > 0
    ? await db.select().from(usersTable).where(inArray(usersTable.id, baristaIds))
    : [];
  const baristaMap = Object.fromEntries(baristas.map((b) => [b.id, b.name]));

  res.json(
    ListOrdersResponse.parse(
      serializeDates(paginated.map((o) => ({
        ...o,
        baristaName: baristaMap[o.baristaId] ?? "Unknown",
        subtotal: parseFloat(o.subtotal),
        discount: parseFloat(o.discount),
        total: parseFloat(o.total),
        amountTendered: o.amountTendered ? parseFloat(o.amountTendered) : null,
        changeDue: o.changeDue ? parseFloat(o.changeDue) : null,
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
  const { items: orderItems } = parsed.data;

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

  const allTypeVolumeIds = [
    ...new Set(orderItems.flatMap((i) => i.selections.map((s: any) => s.typeVolumeId).filter(Boolean))),
  ];

  const [drinks, slots, options, typeVolumes, slotVolumes, volumes] = await Promise.all([
    db.select().from(drinksTable).where(inArray(drinksTable.id, drinkIds)),
    db.select().from(drinkIngredientSlotsTable).where(inArray(drinkIngredientSlotsTable.drinkId, drinkIds)),
    allOptionIds.length > 0
      ? db.select().from(ingredientOptionsTable).where(inArray(ingredientOptionsTable.id, allOptionIds))
      : Promise.resolve([]),
    allTypeVolumeIds.length > 0
      ? db.select().from(ingredientTypeVolumesTable).where(inArray(ingredientTypeVolumesTable.id, allTypeVolumeIds))
      : Promise.resolve([]),
    db.select().from(drinkSlotVolumesTable).where(inArray(drinkSlotVolumesTable.slotId, slots.map(s => s.id))),
    db.select().from(ingredientVolumesTable),
  ]);

  const drinkMap = new Map(drinks.map((d) => [d.id, d]));
  const slotsByDrink = new Map<number, typeof slots>();
  for (const s of slots) {
    const list = slotsByDrink.get(s.drinkId) ?? [];
    list.push(s);
    slotsByDrink.set(s.drinkId, list);
  }
  const optionMap = new Map(options.map((o) => [o.id, o]));
  const typeVolumeMap = new Map(typeVolumes.map((tv) => [tv.id, tv]));
  const slotVolumeMap = new Map<string, typeof slotVolumes[0]>(); // key: slotId_typeVolumeId
  for (const sv of slotVolumes) {
    slotVolumeMap.set(`${sv.slotId}_${sv.typeVolumeId}`, sv);
  }

  // Pre-fetch ingredient types for the catalog volumes to find inventory IDs
  const allTypeIds = [...new Set(typeVolumes.map(tv => tv.ingredientTypeId))];
  const ingredientTypes = allTypeIds.length > 0
    ? await db.select().from(ingredientTypesTable).where(inArray(ingredientTypesTable.id, allTypeIds))
    : [];
  const typeToInventoryMap = new Map(ingredientTypes.map(it => [it.id, it.inventoryIngredientId]));
  const typeNameMap = new Map(ingredientTypes.map(it => [it.id, it.name]));
  const volumeMap = new Map(volumes.map(v => [v.id, v.name]));

  // ── Compute totals & customizations ────────────────────────────────────────
  type Customization = {
    ingredientId: number | null;
    optionId: number | null;
    typeVolumeId: number | null;
    consumedQty: number;
    addedCost: number;
    slotLabel: string;
    optionLabel: string;
  };
  type ItemDetail = {
    drinkId: number; drinkName: string; quantity: number;
    unitPrice: number; lineTotal: number; specialNotes: string | null;
    customizations: Customization[];
  };

  let subtotal = 0;
  const itemDetails: ItemDetail[] = [];

  for (const item of orderItems) {
    const drink = drinkMap.get(item.drinkId);
    if (!drink) { res.status(400).json({ error: `Drink ${item.drinkId} not found` }); return; }

    const drinkSlots = slotsByDrink.get(item.drinkId) ?? [];
    let extraCost = 0;
    const customizations: Customization[] = [];

    for (const selection of item.selections) {
      const sel = selection as any;
      let slot: (typeof slots)[0] | undefined;

      // 1. Identify slot
      if (sel.slotId) {
        slot = drinkSlots.find((s) => s.id === sel.slotId);
      } else if (sel.ingredientId) {
        slot = drinkSlots.find((s) => s.ingredientId === sel.ingredientId);
      } else if (sel.ingredientTypeId) {
        slot = drinkSlots.find((s) => s.ingredientTypeId === sel.ingredientTypeId);
      }
      if (!slot) continue;

      // 2. Process selection (Typed vs Legacy)
      if (sel.typeVolumeId) {
        const typeVol = typeVolumeMap.get(sel.typeVolumeId);
        if (!typeVol) continue;

        const sv = slotVolumeMap.get(`${slot.id}_${sel.typeVolumeId}`);
        const cost = parseFloat(sv?.extraCost ?? typeVol.extraCost);
        const processedQty = parseFloat(sv?.processedQty ?? typeVol.processedQty ?? "0");
        const typeName = typeNameMap.get(typeVol.ingredientTypeId) ?? "";
        const volumeName = volumeMap.get(typeVol.volumeId) ?? "";
        const inventoryId = typeToInventoryMap.get(typeVol.ingredientTypeId);
        const optionLabel = typeName && volumeName ? `${typeName} · ${volumeName}` : typeName || volumeName || "Catalog Item";

        extraCost += cost;
        customizations.push({
          ingredientId: inventoryId ?? null,
          optionId: null,
          typeVolumeId: sel.typeVolumeId,
          consumedQty: processedQty * item.quantity,
          addedCost: cost,
          slotLabel: slot.slotLabel,
          optionLabel,
        });
        continue;
      }

      // Legacy selection
      if (sel.optionId) {
        const option = optionMap.get(sel.optionId);
        if (!option) continue;

        if (option.linkedIngredientId && sel.subOptionId) {
          const sub = optionMap.get(sel.subOptionId);
          if (sub) {
            const cost = parseFloat(sub.extraCost);
            extraCost += cost;
            customizations.push({
              ingredientId: option.linkedIngredientId,
              optionId: sel.subOptionId,
              typeVolumeId: null,
              consumedQty: parseFloat(sub.processedQty) * item.quantity,
              addedCost: cost,
              slotLabel: slot.slotLabel,
              optionLabel: `${option.label} · ${sub.label}`,
            });
          }
          continue;
        }

        const cost = parseFloat(option.extraCost);
        extraCost += cost;
        customizations.push({
          ingredientId: sel.ingredientId ?? slot.ingredientId ?? null,
          optionId: sel.optionId,
          typeVolumeId: null,
          consumedQty: parseFloat(option.processedQty) * item.quantity,
          addedCost: cost,
          slotLabel: slot.slotLabel,
          optionLabel: option.label,
        });
      }
    }

    const unitPrice = parseFloat(drink.basePrice) + extraCost;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    itemDetails.push({ drinkId: item.drinkId, drinkName: drink.name, quantity: item.quantity, unitPrice, lineTotal, specialNotes: item.specialNotes ?? null, customizations });
  }

  const discount = parsed.data.discount ?? 0;
  const total = subtotal - discount;
  const amountTendered = parsed.data.amountTendered ?? null;
  const changeDue = amountTendered != null ? amountTendered - total : null;

  // ── All writes in a single Drizzle transaction ─────────────────────────────
  const orderNumber = await generateOrderNumber();
  const { order, savedItems } = await db.transaction(async (tx) => {
    const [order] = await tx.insert(ordersTable).values({
      orderNumber,
      baristaId: sessionUserId,
      status: "pending",
      customerName: parsed.data.customerName ?? null,
      subtotal: String(subtotal),
      discount: String(discount),
      total: String(total),
      paymentMethod: parsed.data.paymentMethod,
      amountTendered: amountTendered != null ? String(amountTendered) : null,
      changeDue: changeDue != null ? String(changeDue) : null,
      notes: parsed.data.notes ?? null,
    }).returning();

    // Pre-fetch ingredient stock levels for all ingredients in one query
    const allIngredientIds = [
      ...new Set(itemDetails.flatMap((d) => d.customizations.map((c) => c.ingredientId).filter((id): id is number => id !== null))),
    ];
    const ingredientRows = allIngredientIds.length > 0
      ? await tx.select({ id: ingredientsTable.id, stockQuantity: ingredientsTable.stockQuantity })
          .from(ingredientsTable)
          .where(inArray(ingredientsTable.id, allIngredientIds))
      : [];
    const stockMap = new Map(ingredientRows.map((r) => [r.id, parseFloat(r.stockQuantity)]));

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
      }).returning();

      if (item.customizations.length > 0) {
        await tx.insert(orderItemCustomizationsTable).values(
          item.customizations.map((c) => ({
            orderItemId: orderItem.id,
            ingredientId: c.ingredientId,
            optionId: c.optionId,
            typeVolumeId: c.typeVolumeId,
            consumedQty: String(c.consumedQty),
            addedCost: String(c.addedCost),
            slotLabel: c.slotLabel,
            optionLabel: c.optionLabel,
          }))
        );
      }

      // Batch stock deductions: compute new quantities, then do 1 update + 1 insert per ingredient
      const stockUpdates: Array<{ id: number; newQty: number; delta: number }> = [];
      for (const c of item.customizations) {
        if (!c.ingredientId || c.consumedQty === 0) continue;
        const current = stockMap.get(c.ingredientId) ?? 0;
        const newQty = Math.max(0, current - c.consumedQty);
        stockMap.set(c.ingredientId, newQty);
        stockUpdates.push({ id: c.ingredientId, newQty, delta: c.consumedQty });
      }

      // Batch-update stock and insert movements in parallel
      await Promise.all(
        stockUpdates.map((u) =>
          tx.update(ingredientsTable)
            .set({ stockQuantity: String(u.newQty) })
            .where(eq(ingredientsTable.id, u.id))
        )
      );
      if (stockUpdates.length > 0) {
        await tx.insert(stockMovementsTable).values(
          stockUpdates.map((u) => ({
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

      savedItems.push({ ...orderItem, customizations: item.customizations });
    }

    return { order, savedItems };
  });

  const [barista] = await db.select().from(usersTable).where(eq(usersTable.id, order.baristaId));

  broadcastEvent("order_created", { orderId: order.id, orderNumber: order.orderNumber });

  res.status(201).json(
    GetOrderResponse.parse(
      serializeDates({
        ...order,
        baristaName: barista?.name ?? "Unknown",
        subtotal: parseFloat(order.subtotal),
        discount: parseFloat(order.discount),
        total: parseFloat(order.total),
        amountTendered: order.amountTendered ? parseFloat(order.amountTendered) : null,
        changeDue: order.changeDue ? parseFloat(order.changeDue) : null,
        items: savedItems.map((item) => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice),
          lineTotal: parseFloat(item.lineTotal),
          customizations: item.customizations.map((c) => ({
            ingredientId: c.ingredientId,
            optionId: c.optionId,
            typeVolumeId: c.typeVolumeId,
            consumedQty: c.consumedQty,
            addedCost: c.addedCost,
            slotLabel: c.slotLabel,
            optionLabel: c.optionLabel,
            orderItemId: item.id,
            id: 0,
          })),
        })),
      })
    )
  );
});

router.get("/orders/:id", async (req, res): Promise<void> => {
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

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
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

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [barista] = await db.select().from(usersTable).where(eq(usersTable.id, order.baristaId));

  broadcastEvent("order_updated", { orderId: order.id, status: order.status });
  res.json(
    UpdateOrderStatusResponse.parse(serializeDates({
      ...order,
      baristaName: barista?.name ?? "Unknown",
      subtotal: parseFloat(order.subtotal),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      amountTendered: order.amountTendered ? parseFloat(order.amountTendered) : null,
      changeDue: order.changeDue ? parseFloat(order.changeDue) : null,
    }))
  );
});

export default router;
