import { Router, type IRouter } from "express";
import { gte, sql, eq, and, lte, inArray } from "drizzle-orm";
import { serializeDates } from "../lib/serialize";
import {
  db,
  ordersTable,
  orderItemsTable,
  ingredientsTable,
  usersTable,
  orderItemCustomizationsTable,
  drinksTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetActiveOrdersResponse,
  GetLowStockIngredientsResponse,
  GetSalesByCategoryQueryParams,
  GetSalesByCategoryResponse,
  GetTopDrinksQueryParams,
  GetTopDrinksResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        gte(ordersTable.createdAt, today),
        sql`${ordersTable.status} NOT IN ('cancelled', 'refunded')`
      )
    );

  const todayCashOrders = todayOrders.filter(o => o.paymentMethod === 'cash');
  const todayCardOrders = todayOrders.filter(o => o.paymentMethod === 'card');
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const todayCashRevenue = todayCashOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const todayCardRevenue = todayCardOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);

  const todayItems = await db
    .select()
    .from(orderItemsTable)
    .where(
      inArray(orderItemsTable.orderId, todayOrders.map(o => o.id).concat([-1]))
    );

  const todayDrinks = todayItems.reduce((sum, i) => sum + i.quantity, 0);
  const avgOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  const pendingOrders = todayOrders.filter(
    (o) => o.status === "pending" || o.status === "in_progress"
  ).length;

  const lowStockResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ingredientsTable)
    .where(sql`${ingredientsTable.stockQuantity} < ${ingredientsTable.lowStockThreshold}`);
  
  const lowStockCount = Number(lowStockResult[0]?.count || 0);

  res.json(
    GetDashboardSummaryResponse.parse({
      todayRevenue,
      todayCashRevenue,
      todayCardRevenue,
      todayOrders: todayOrders.length,
      todayDrinks,
      averageOrderValue: avgOrderValue,
      pendingOrders,
      lowStockCount,
    })
  );
});

router.get("/dashboard/active-orders", async (req, res): Promise<void> => {
  const { status } = req.query;
  const statusList = status 
    ? [status] 
    : ["pending", "paid", "in_progress", "ready"];

  const activeOrders = await db
    .select()
    .from(ordersTable)
    .where(inArray(ordersTable.status, statusList as any))
    .orderBy(ordersTable.createdAt);

  if (activeOrders.length === 0) {
    res.json(GetActiveOrdersResponse.parse([]));
    return;
  }

  const orderIds = activeOrders.map(o => o.id);
  
  // Batch fetch items and customizations
  const allItems = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));
    
  const itemIds = allItems.map(i => i.id);
  const allCustomizations = itemIds.length > 0
    ? await db
        .select()
        .from(orderItemCustomizationsTable)
        .where(inArray(orderItemCustomizationsTable.orderItemId, itemIds))
    : [];

  const allUsers = await db.select().from(usersTable);
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  // Group items and customizations by parent ID
  const customizationsByItemId = allCustomizations.reduce((acc, c) => {
    if (!acc[c.orderItemId]) acc[c.orderItemId] = [];
    acc[c.orderItemId].push({
      ...c,
      consumedQty: parseFloat(c.consumedQty),
      producedQty: parseFloat(c.producedQty),
      addedCost: parseFloat(c.addedCost),
    });
    return acc;
  }, {} as Record<number, any[]>);

  const itemsByOrderId = allItems.reduce((acc, i) => {
    if (!acc[i.orderId]) acc[i.orderId] = [];
    acc[i.orderId].push({
      ...i,
      status: i.status as "pending" | "ready",
      kitchenStation: i.kitchenStation || "main",
      unitPrice: parseFloat(i.unitPrice),
      lineTotal: parseFloat(i.lineTotal),
      customizations: customizationsByItemId[i.id] ?? [],
    });
    return acc;
  }, {} as Record<number, any[]>);

  const ordersWithDetails = activeOrders.map(order => ({
    ...order,
    baristaName: userMap[order.baristaId] ?? "Unknown",
    subtotal: parseFloat(order.subtotal),
    discount: parseFloat(order.discount),
    discountValue: order.discountValue ? parseFloat(order.discountValue) : null,
    discountType: order.discountType as "percentage" | "fixed" | null,
    total: parseFloat(order.total),
    amountTendered: order.amountTendered ? parseFloat(order.amountTendered) : null,
    changeDue: order.changeDue ? parseFloat(order.changeDue) : null,
    items: itemsByOrderId[order.id] ?? [],
  }));

  res.json(GetActiveOrdersResponse.parse(serializeDates(ordersWithDetails)));
});

router.get("/dashboard/low-stock", async (_req, res): Promise<void> => {
  const allIngredients = await db.select().from(ingredientsTable).where(eq(ingredientsTable.isActive, true));

  const lowStock = allIngredients.filter(
    (i) => parseFloat(i.stockQuantity) < parseFloat(i.lowStockThreshold)
  );

  res.json(
    GetLowStockIngredientsResponse.parse(
      serializeDates(lowStock.map((i) => ({
        ...i,
        costPerUnit: parseFloat(i.costPerUnit),
        stockQuantity: parseFloat(i.stockQuantity),
        lowStockThreshold: parseFloat(i.lowStockThreshold),
      })))
    )
  );
});

router.get("/dashboard/sales-by-category", async (req, res): Promise<void> => {
  const params = GetSalesByCategoryQueryParams.safeParse(req.query);
  const conditions = [sql`${ordersTable.status} NOT IN ('cancelled', 'refunded')`];

  if (params.success && params.data.startDate) {
    conditions.push(gte(ordersTable.createdAt, new Date(params.data.startDate)));
  }
  if (params.success && params.data.endDate) {
    const end = new Date(params.data.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(ordersTable.createdAt, end));
  }

  // Fallback to days if no range provided
  if (!params.success || (!params.data.startDate && !params.data.endDate)) {
    const days = (params.success && params.data.days) ? params.data.days : 30;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);
    conditions.push(gte(ordersTable.createdAt, since));
  }

  const orders = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(and(...conditions));

  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) {
    res.json(GetSalesByCategoryResponse.parse([]));
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));

  const drinkIds = [...new Set(items.map((i) => i.drinkId))];
  const drinks = drinkIds.length > 0
    ? await db.select().from(drinksTable).where(inArray(drinksTable.id, drinkIds))
    : [];
  const drinkCategoryMap = Object.fromEntries(drinks.map((d) => [d.id, d.category]));

  const categoryStats: Record<string, { totalOrders: Set<number>; totalRevenue: number; totalDrinks: number }> = {};

  for (const item of items) {
    const category = drinkCategoryMap[item.drinkId] ?? "Other";
    if (!categoryStats[category]) {
      categoryStats[category] = { totalOrders: new Set(), totalRevenue: 0, totalDrinks: 0 };
    }
    categoryStats[category].totalOrders.add(item.orderId);
    categoryStats[category].totalRevenue += parseFloat(item.lineTotal);
    categoryStats[category].totalDrinks += item.quantity;
  }

  const result = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    totalOrders: stats.totalOrders.size,
    totalRevenue: stats.totalRevenue,
    totalDrinks: stats.totalDrinks,
  }));

  res.json(GetSalesByCategoryResponse.parse(result));
});

router.get("/dashboard/top-drinks", async (req, res): Promise<void> => {
  const params = GetTopDrinksQueryParams.safeParse(req.query);
  const limit = (params.success && params.data.limit) ? params.data.limit : 5;
  
  const conditions = [sql`${ordersTable.status} != 'cancelled'`];

  if (params.success && params.data.startDate) {
    conditions.push(gte(ordersTable.createdAt, new Date(params.data.startDate)));
  }
  if (params.success && params.data.endDate) {
    const end = new Date(params.data.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(ordersTable.createdAt, end));
  }

  // Fallback to days if no range provided
  if (!params.success || (!params.data.startDate && !params.data.endDate)) {
    const days = (params.success && params.data.days) ? params.data.days : 30;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);
    conditions.push(gte(ordersTable.createdAt, since));
  }

  const orders = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(and(...conditions));

  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) {
    res.json(GetTopDrinksResponse.parse([]));
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));

  const drinkStats: Record<number, { totalSold: number; totalRevenue: number }> = {};
  for (const item of items) {
    if (!drinkStats[item.drinkId]) {
      drinkStats[item.drinkId] = { totalSold: 0, totalRevenue: 0 };
    }
    drinkStats[item.drinkId].totalSold += item.quantity;
    drinkStats[item.drinkId].totalRevenue += parseFloat(item.lineTotal);
  }

  const drinkIds = Object.keys(drinkStats).map(Number);
  const drinks = drinkIds.length > 0
    ? await db.select().from(drinksTable).where(inArray(drinksTable.id, drinkIds))
    : [];
  const drinkMap = Object.fromEntries(drinks.map((d) => [d.id, d]));

  const result = Object.entries(drinkStats)
    .map(([drinkId, stats]) => {
      const drink = drinkMap[Number(drinkId)];
      return {
        drinkId: Number(drinkId),
        drinkName: drink?.name ?? "Unknown",
        category: drink?.category ?? "Other",
        totalSold: stats.totalSold,
        totalRevenue: stats.totalRevenue,
      };
    })
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);

  res.json(GetTopDrinksResponse.parse(result));
});

export default router;
