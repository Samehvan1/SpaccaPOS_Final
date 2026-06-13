import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, discountsTable, discountTagsTable } from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { requirePermission } from "../middleware/permissions";
import {
  Discount,
  CreateDiscountBody,
  UpdateDiscountBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/discounts", requirePermission("discounts:view"), async (req, res): Promise<void> => {
  try {
    const discounts = await db.select().from(discountsTable);
    
    const discountTagsRes = await db.execute(sql`
      SELECT discount_id, tag_id FROM discount_tags
    `);
    const tagsMap: Record<number, number[]> = {};
    for (const r of discountTagsRes.rows as any[]) {
      if (!tagsMap[r.discount_id]) {
        tagsMap[r.discount_id] = [];
      }
      tagsMap[r.discount_id].push(r.tag_id);
    }

    res.json(
      discounts.map((d) => ({
        ...serializeDates(d),
        value: parseFloat(d.value),
        isFirstOrder: d.isFirstOrder,
        tagIds: tagsMap[d.id] || [],
      }))
    );
  } catch (error: any) {
    console.error("[GET /discounts] error:", error?.message);
    res.status(500).json({ error: "Failed to list discounts" });
  }
});

router.post("/discounts", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
  const parsed = CreateDiscountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const discount = await db.transaction(async (tx) => {
      const [newDisc] = await tx
        .insert(discountsTable)
        .values({
          code: parsed.data.code,
          type: parsed.data.type,
          value: String(parsed.data.value),
          isActive: parsed.data.isActive ?? true,
          isFirstOrder: parsed.data.isFirstOrder ?? false,
        })
        .returning();

      if (Array.isArray(parsed.data.tagIds) && parsed.data.tagIds.length > 0) {
        await tx.insert(discountTagsTable).values(
          parsed.data.tagIds.map((tagId) => ({
            discountId: newDisc.id,
            tagId: tagId,
          }))
        );
      }

      return {
        ...newDisc,
        tagIds: parsed.data.tagIds || [],
      };
    });

    res.status(201).json({
      ...serializeDates(discount),
      value: parseFloat(discount.value),
    });
  } catch (error: any) {
    console.error("[POST /discounts] error:", error?.message);
    res.status(500).json({ error: "Failed to create discount: " + error.message });
  }
});

router.patch("/discounts/:id", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateDiscountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const discount = await db.transaction(async (tx) => {
      const updateData: any = {};
      if (parsed.data.code !== undefined) updateData.code = parsed.data.code;
      if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
      if (parsed.data.value !== undefined) updateData.value = String(parsed.data.value);
      if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
      if (parsed.data.isFirstOrder !== undefined) updateData.isFirstOrder = parsed.data.isFirstOrder;
      updateData.updatedAt = new Date();

      const [updatedDisc] = await tx
        .update(discountsTable)
        .set(updateData)
        .where(eq(discountsTable.id, id))
        .returning();

      if (!updatedDisc) {
        throw new Error("Discount not found");
      }

      if (parsed.data.tagIds !== undefined) {
        await tx.delete(discountTagsTable).where(eq(discountTagsTable.discountId, id));
        if (Array.isArray(parsed.data.tagIds) && parsed.data.tagIds.length > 0) {
          await tx.insert(discountTagsTable).values(
            parsed.data.tagIds.map((tagId) => ({
              discountId: id,
              tagId: tagId,
            }))
          );
        }
      }

      // Fetch the updated tag mappings
      const tagsRes = await tx.execute(sql`
        SELECT tag_id FROM discount_tags WHERE discount_id = ${id}
      `);
      const tagIds = (tagsRes.rows as any[]).map((r) => r.tag_id);

      return {
        ...updatedDisc,
        tagIds,
      };
    });

    res.json({
      ...serializeDates(discount),
      value: parseFloat(discount.value),
    });
  } catch (error: any) {
    console.error("[PATCH /discounts/:id] error:", error?.message);
    if (error.message === "Discount not found") {
      res.status(404).json({ error: "Discount not found" });
      return;
    }
    res.status(500).json({ error: "Failed to update discount: " + error.message });
  }
});

router.delete("/discounts/:id", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
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

  const discountTagsRes = await db.execute(sql`
    SELECT tag_id FROM discount_tags WHERE discount_id = ${discount.id}
  `);
  const tagIds = (discountTagsRes.rows as any[]).map((r) => r.tag_id);

  res.json({
    ...serializeDates(discount),
    value: parseFloat(discount.value),
    isFirstOrder: discount.isFirstOrder,
    tagIds,
  });
});

export default router;
