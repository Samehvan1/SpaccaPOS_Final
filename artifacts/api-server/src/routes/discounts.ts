import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, discountsTable } from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { requirePermission } from "../middleware/permissions";
import {
  Discount,
  CreateDiscountBody,
  UpdateDiscountBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/discounts", requirePermission("admin:manage_discounts"), async (req, res): Promise<void> => {
  const discounts = await db.select().from(discountsTable);
  res.json(
    discounts.map((d) => ({
      ...serializeDates(d),
      value: parseFloat(d.value),
    }))
  );
});

router.post("/discounts", requirePermission("admin:manage_discounts"), async (req, res): Promise<void> => {
  const parsed = CreateDiscountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [discount] = await db
    .insert(discountsTable)
    .values({
      code: parsed.data.code,
      type: parsed.data.type,
      value: String(parsed.data.value),
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  res.status(201).json({
    ...serializeDates(discount),
    value: parseFloat(discount.value),
  });
});

router.patch("/discounts/:id", requirePermission("admin:manage_discounts"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateDiscountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = {};
  if (parsed.data.code !== undefined) updateData.code = parsed.data.code;
  if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
  if (parsed.data.value !== undefined) updateData.value = String(parsed.data.value);
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [discount] = await db
    .update(discountsTable)
    .set(updateData)
    .where(eq(discountsTable.id, id))
    .returning();

  if (!discount) {
    res.status(404).json({ error: "Discount not found" });
    return;
  }

  res.json({
    ...serializeDates(discount),
    value: parseFloat(discount.value),
  });
});

router.delete("/discounts/:id", requirePermission("admin:manage_discounts"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const [deleted] = await db
    .delete(discountsTable)
    .where(eq(discountsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Discount not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/discounts/validate/:code", async (req, res): Promise<void> => {
  const [discount] = await db
    .select()
    .from(discountsTable)
    .where(eq(discountsTable.code, req.params.code as string));

  if (!discount || !discount.isActive) {
    res.status(404).json({ error: "Invalid or inactive discount code" });
    return;
  }

  res.json({
    ...serializeDates(discount),
    value: parseFloat(discount.value),
  });
});

export default router;
