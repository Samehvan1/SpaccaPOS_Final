import { Router, type IRouter } from "express";
import { eq, and, inArray, sql, gte, lte, desc } from "drizzle-orm";
import { serializeDates } from "../lib/serialize";
import {
  db,
  stockMovementsTable,
  ingredientsTable,
  branchStockTable,
  usersTable,
} from "@workspace/db";
import {
  ListStockMovementsQueryParams,
  ListStockMovementsResponse,
  CreateStockAdjustmentBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stock/movements", async (req, res): Promise<void> => {
  const params = ListStockMovementsQueryParams.safeParse(req.query);
  const sessionUser = (req.session as any);
  const isAdmin = sessionUser.role === "admin";
  const sessionBranchId = sessionUser.branchId;

  const targetBranchId = req.query.branchId && req.query.branchId !== 'all'
    ? parseInt(req.query.branchId as string)
    : (isAdmin && (req.query.branchId === 'all' || !req.query.branchId)) ? null : sessionBranchId;

  const conditions = [];

  if (targetBranchId) {
    conditions.push(eq(stockMovementsTable.branchId, targetBranchId));
  }

  if (params.success) {
    if (params.data.ingredientId) {
      conditions.push(eq(stockMovementsTable.ingredientId, params.data.ingredientId));
    }
    if (params.data.startDate) {
      conditions.push(gte(stockMovementsTable.createdAt, params.data.startDate));
    }
    if (params.data.endDate) {
      conditions.push(lte(stockMovementsTable.createdAt, params.data.endDate));
    }
  }

  const movements = await db
    .select()
    .from(stockMovementsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(stockMovementsTable.createdAt));

  const limit = params.success && params.data.limit ? params.data.limit : 100;
  const offset = params.success && params.data.offset ? params.data.offset : 0;
  const paginated = movements.slice(offset, offset + limit);

  const allIngredients = await db.select().from(ingredientsTable);
  const allUsers = await db.select().from(usersTable);
  const ingredientMap = Object.fromEntries(allIngredients.map((i) => [i.id, i.name]));
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  res.json(
    ListStockMovementsResponse.parse(
      serializeDates(paginated.map((m) => ({
        ...m,
        ingredientName: ingredientMap[m.ingredientId] ?? "Unknown",
        createdByName: userMap[m.createdBy] ?? "Unknown",
        quantity: parseFloat(String(m.quantity || "0")) || 0,
        quantityAfter: parseFloat(String(m.quantityAfter || "0")) || 0,
        orderId: m.orderId ?? null,
      })))
    )
  );
});

router.post("/stock/adjustments", async (req, res): Promise<void> => {
  const parsed = CreateStockAdjustmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionUserId = ((req.session as unknown as Record<string, unknown>).userId as number) ?? 1;
  const sessionBranchId = (req.session as any).branchId;
  if (!sessionBranchId) {
    res.status(400).json({ error: "No branch associated with session" });
    return;
  }

  const [ingredient] = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.id, parsed.data.ingredientId));

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  const [stock] = await db
    .select()
    .from(branchStockTable)
    .where(and(eq(branchStockTable.ingredientId, parsed.data.ingredientId), eq(branchStockTable.branchId, sessionBranchId)));

  const currentQty = stock ? parseFloat(stock.stockQuantity) : 0;
  const adjustedQty = parsed.data.movementType === "waste"
    ? currentQty - parsed.data.quantity
    : currentQty + parsed.data.quantity;

  const newQty = Math.max(0, adjustedQty);

  await db
    .insert(branchStockTable)
    .values({
      branchId: sessionBranchId,
      ingredientId: parsed.data.ingredientId,
      stockQuantity: String(newQty),
    })
    .onConflictDoUpdate({
      target: [branchStockTable.branchId, branchStockTable.ingredientId],
      set: { stockQuantity: String(newQty) }
    });

  const quantityValue =
    parsed.data.movementType === "waste" ? -parsed.data.quantity : parsed.data.quantity;

  const [movement] = await db
    .insert(stockMovementsTable)
    .values({
      branchId: sessionBranchId,
      ingredientId: parsed.data.ingredientId,
      orderId: null,
      movementType: parsed.data.movementType,
      quantity: String(quantityValue),
      quantityAfter: String(newQty),
      note: parsed.data.note ?? null,
      createdBy: sessionUserId,
    })
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));

  res.status(201).json({
    ...movement,
    ingredientName: ingredient.name,
    createdByName: user?.name ?? "Unknown",
    quantity: parseFloat(movement.quantity),
    quantityAfter: parseFloat(movement.quantityAfter),
    orderId: movement.orderId ?? null,
  });
  const { globalCache } = await import("../lib/cache");
  globalCache.clear();
  const { broadcastEvent } = await import("../lib/sse");
  broadcastEvent("inventory_updated", { ingredientId: parsed.data.ingredientId });
});

export default router;
