import { Router, type IRouter } from "express";
import { eq, asc, and, gte, lte, sql, inArray, desc } from "drizzle-orm";
import { db, drinkCategoriesTable, drinksTable, ordersTable, orderItemsTable } from "@workspace/db";
import { insertDrinkCategorySchema } from "@workspace/db";
import { requirePermission } from "../middleware/permissions";

const router: IRouter = Router();

// --- helpers for Cairo-timezone date boundaries ---
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(dateStr);
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
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
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
    const parts = formatter.formatToParts(approxUtc);
    const g = (t: string) => parseInt(parts.find(p => p.type === t)!.value, 10);
    const formattedUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
    return new Date(approxUtc.getTime() + (approxUtc.getTime() - formattedUtc));
  } catch { return localDate; }
}

// GET /drink-categories — list all
router.get("/drink-categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select()
    .from(drinkCategoriesTable)
    .orderBy(asc(drinkCategoriesTable.sortOrder), asc(drinkCategoriesTable.name));
  res.json(categories);
});

// GET /drink-categories/performance — sales by category with date range filter
router.get("/drink-categories/performance", requirePermission("reports:view"), async (req, res): Promise<void> => {
  try {
    const { from, to, branchId } = req.query as { from?: string; to?: string; branchId?: string };

    const now = new Date();
    const fromDate = from ? toCairoMidnight(parseLocalDate(from), false) : toCairoMidnight(new Date(now.getFullYear(), now.getMonth(), 1), false);
    const toDate = to ? toCairoMidnight(parseLocalDate(to), true) : toCairoMidnight(now, true);

    // Build order filter conditions
    const orderConditions = [
      gte(ordersTable.createdAt, fromDate),
      lte(ordersTable.createdAt, toDate),
      inArray(ordersTable.status, ["paid", "completed", "ready", "in_progress"]),
    ];
    if (branchId) {
      const bid = parseInt(branchId);
      if (!isNaN(bid)) orderConditions.push(eq(ordersTable.branchId, bid));
    }

    // Get matching order IDs
    const matchingOrders = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(and(...orderConditions));

    const orderIds = matchingOrders.map(o => o.id);

    if (orderIds.length === 0) {
      // Return only active categories (no sales to show for inactive ones)
      const allCats = await db.select({ id: drinkCategoriesTable.id, name: drinkCategoriesTable.name, isActive: drinkCategoriesTable.isActive }).from(drinkCategoriesTable);
      res.json({
        categories: allCats.filter(c => c.isActive).map(c => ({ id: c.id, name: c.name, quantity: 0, totalSales: 0, orderCount: 0 })),
        totalRevenue: 0,
        totalQuantity: 0,
        totalOrders: 0,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });
      return;
    }

    // Aggregate sales by category
    const categoryStats = await db
      .select({
        categoryId: drinkCategoriesTable.id,
        categoryName: drinkCategoriesTable.name,
        isActive: drinkCategoriesTable.isActive,
        quantity: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)`,
        totalSales: sql<number>`coalesce(sum(${orderItemsTable.lineTotal}), 0)`,
        orderCount: sql<number>`count(distinct ${orderItemsTable.orderId})`,
      })
      .from(drinkCategoriesTable)
      .leftJoin(drinksTable, eq(drinksTable.categoryId, drinkCategoriesTable.id))
      .leftJoin(
        orderItemsTable,
        and(
          eq(orderItemsTable.drinkId, drinksTable.id),
          inArray(orderItemsTable.orderId, orderIds),
        ),
      )
      .groupBy(drinkCategoriesTable.id, drinkCategoriesTable.name, drinkCategoriesTable.isActive)
      .orderBy(desc(sql`coalesce(sum(${orderItemsTable.lineTotal}), 0)`));

    // Hide inactive categories unless they have actual sales
    const categories = categoryStats
      .filter(c => c.isActive || Number(c.totalSales) > 0)
      .map(c => ({
        id: c.categoryId,
        name: c.categoryName,
        quantity: Number(c.quantity),
        totalSales: Number(c.totalSales),
        orderCount: Number(c.orderCount),
      }));

    const totalRevenue = categories.reduce((s, c) => s + c.totalSales, 0);
    const totalQuantity = categories.reduce((s, c) => s + c.quantity, 0);

    // Top 5 selling drinks across all categories
    const topDrinks = orderIds.length > 0
      ? await db
          .select({
            drinkId: orderItemsTable.drinkId,
            drinkName: orderItemsTable.drinkName,
            categoryName: drinkCategoriesTable.name,
            quantity: sql<number>`sum(${orderItemsTable.quantity})`,
            totalSales: sql<number>`sum(${orderItemsTable.lineTotal})`,
          })
          .from(orderItemsTable)
          .innerJoin(drinksTable, eq(orderItemsTable.drinkId, drinksTable.id))
          .leftJoin(drinkCategoriesTable, eq(drinksTable.categoryId, drinkCategoriesTable.id))
          .where(inArray(orderItemsTable.orderId, orderIds))
          .groupBy(orderItemsTable.drinkId, orderItemsTable.drinkName, drinkCategoriesTable.name)
          .orderBy(desc(sql`sum(${orderItemsTable.lineTotal})`))
          .limit(10)
      : [];

    res.json({
      categories,
      topDrinks: topDrinks.map(d => ({
        drinkId: d.drinkId,
        drinkName: d.drinkName,
        categoryName: d.categoryName,
        quantity: Number(d.quantity),
        totalSales: Number(d.totalSales),
      })),
      totalRevenue,
      totalQuantity,
      totalOrders: orderIds.length,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    });
  } catch (err: any) {
    console.error("Category performance error:", err);
    res.status(500).json({ error: "Failed to load category performance" });
  }
});

// POST /drink-categories — create
router.post("/drink-categories", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const parsed = insertDrinkCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [category] = await db
    .insert(drinkCategoriesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(category);
});

// PATCH /drink-categories/:id — update
router.patch("/drink-categories/:id", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, sortOrder, isActive } = req.body as {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  if (isActive !== undefined) updateData.isActive = isActive;

  const [category] = await db
    .update(drinkCategoriesTable)
    .set(updateData)
    .where(eq(drinkCategoriesTable.id, id))
    .returning();

  if (!category) { res.status(404).json({ error: "Category not found" }); return; }

  // Sync legacy 'category' field in drinksTable if the name changed
  if (name !== undefined) {
    await db.update(drinksTable)
      .set({ category: name })
      .where(eq(drinksTable.categoryId, id));
  }

  res.json(category);
});

// DELETE /drink-categories/:id — delete
router.delete("/drink-categories/:id", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [category] = await db
    .delete(drinkCategoriesTable)
    .where(eq(drinkCategoriesTable.id, id))
    .returning();

  if (!category) { res.status(404).json({ error: "Category not found" }); return; }
  res.sendStatus(204);
});

export default router;

