import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { serializeDates } from "../lib/serialize";
import {
  db,
  stockMovementsTable,
  ingredientsTable,
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
  const conditions = [];
  if (params.success && params.data.ingredientId) {
    conditions.push(eq(stockMovementsTable.ingredientId, params.data.ingredientId));
  }

  const movements = conditions.length
    ? await db.select().from(stockMovementsTable).where(and(...conditions)).orderBy(stockMovementsTable.createdAt)
    : await db.select().from(stockMovementsTable).orderBy(stockMovementsTable.createdAt);

  const limit = params.success && params.data.limit ? params.data.limit : 100;
  const offset = params.success && params.data.offset ? params.data.offset : 0;
  const paginated = movements.slice(offset, offset + limit).reverse();

  const ingredientIds = [...new Set(paginated.map((m) => m.ingredientId))];
  const userIds = [...new Set(paginated.map((m) => m.createdBy))];

  const ingredients =
    ingredientIds.length > 0
      ? await db
          .select()
          .from(ingredientsTable)
          .where(eq(ingredientsTable.id, ingredientIds[0]))
      : [];

  const users =
    userIds.length > 0
      ? await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, userIds[0]))
      : [];

  // Fetch all relevant ingredients and users
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
        quantity: parseFloat(m.quantity),
        quantityAfter: parseFloat(m.quantityAfter),
        orderId: m.orderId ?? null,
      })))
    )
  );
  void ingredients;
  void users;
});

router.post("/stock/adjustments", async (req, res): Promise<void> => {
  const parsed = CreateStockAdjustmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionUserId = ((req.session as unknown as Record<string, unknown>).userId as number) ?? 1;

  const [ingredient] = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.id, parsed.data.ingredientId));

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  const currentQty = parseFloat(ingredient.stockQuantity);
  const adjustedQty = parsed.data.movementType === "waste"
    ? currentQty - parsed.data.quantity
    : currentQty + parsed.data.quantity;

  const newQty = Math.max(0, adjustedQty);

  await db
    .update(ingredientsTable)
    .set({ stockQuantity: String(newQty) })
    .where(eq(ingredientsTable.id, parsed.data.ingredientId));

  const quantityValue =
    parsed.data.movementType === "waste" ? -parsed.data.quantity : parsed.data.quantity;

  const [movement] = await db
    .insert(stockMovementsTable)
    .values({
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
});

export default router;
