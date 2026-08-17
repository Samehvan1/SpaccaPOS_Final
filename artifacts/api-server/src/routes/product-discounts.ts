import { Router, type IRouter } from "express";
import { eq, and, isNull, or, sql } from "drizzle-orm";
import { db, productDrinkDiscountsTable, drinksTable, branchesTable, partnersTable } from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { requirePermission } from "../middleware/permissions";

const router: IRouter = Router();

// List product discounts with optional filters
router.get("/product-discounts", requirePermission("discounts:view"), async (req, res): Promise<void> => {
  try {
    const drinkId = req.query.drinkId ? parseInt(req.query.drinkId as string) : undefined;
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
    const partnerId = req.query.partnerId ? parseInt(req.query.partnerId as string) : undefined;

    const conditions: any[] = [];
    if (drinkId) conditions.push(eq(productDrinkDiscountsTable.drinkId, drinkId));
    if (branchId !== undefined) {
      if (branchId === 0) {
        conditions.push(isNull(productDrinkDiscountsTable.branchId));
      } else {
        conditions.push(or(eq(productDrinkDiscountsTable.branchId, branchId), isNull(productDrinkDiscountsTable.branchId)));
      }
    }
    if (partnerId !== undefined) {
      if (partnerId === 0) {
        conditions.push(isNull(productDrinkDiscountsTable.partnerId));
      } else {
        conditions.push(or(eq(productDrinkDiscountsTable.partnerId, partnerId), isNull(productDrinkDiscountsTable.partnerId)));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        discount: productDrinkDiscountsTable,
        drinkName: drinksTable.name,
        branchName: branchesTable.name,
        partnerName: partnersTable.name,
      })
      .from(productDrinkDiscountsTable)
      .leftJoin(drinksTable, eq(productDrinkDiscountsTable.drinkId, drinksTable.id))
      .leftJoin(branchesTable, eq(productDrinkDiscountsTable.branchId, branchesTable.id))
      .leftJoin(partnersTable, eq(productDrinkDiscountsTable.partnerId, partnersTable.id))
      .where(whereClause);

    res.json(
      rows.map(({ discount, drinkName, branchName, partnerName }) => ({
        ...serializeDates(discount),
        discountValue: parseFloat(discount.discountValue),
        drinkName,
        branchName: branchName ?? "All Branches",
        partnerName: partnerName ?? "Direct POS / All Partners",
      }))
    );
  } catch (error: any) {
    console.error("[GET /product-discounts] error:", error?.message);
    res.status(500).json({ error: "Failed to list product discounts" });
  }
});

// Create product discount(s) (supports single drinkId or multiple drinkIds)
router.post("/product-discounts", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
  const drinkIds: number[] = Array.isArray(req.body.drinkIds) && req.body.drinkIds.length > 0
    ? req.body.drinkIds.map(Number)
    : req.body.drinkId ? [Number(req.body.drinkId)] : [];

  if (drinkIds.length === 0) {
    res.status(400).json({ error: "At least one product (drinkId or drinkIds) must be selected" });
    return;
  }

  const { branchId, partnerId, discountType, discountValue, isActive, startDate, endDate } = req.body;
  if (!discountType || discountValue === undefined) {
    res.status(400).json({ error: "discountType and discountValue are required" });
    return;
  }

  try {
    const insertedRows = await db
      .insert(productDrinkDiscountsTable)
      .values(
        drinkIds.map((id) => ({
          drinkId: id,
          branchId: branchId ?? null,
          partnerId: partnerId ?? null,
          discountType: discountType,
          discountValue: String(discountValue),
          isActive: isActive ?? true,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        }))
      )
      .returning();

    res.status(201).json(
      insertedRows.map((row) => ({
        ...serializeDates(row),
        discountValue: parseFloat(row.discountValue),
      }))
    );
  } catch (error: any) {
    console.error("[POST /product-discounts] error:", error?.message);
    res.status(500).json({ error: "Failed to create product discount: " + error.message });
  }
});

// Update a product discount
router.patch("/product-discounts/:id", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);

  try {
    const updateData: any = {};
    if (req.body.drinkId !== undefined) updateData.drinkId = Number(req.body.drinkId);
    if (req.body.branchId !== undefined) updateData.branchId = req.body.branchId;
    if (req.body.partnerId !== undefined) updateData.partnerId = req.body.partnerId;
    if (req.body.discountType !== undefined) updateData.discountType = req.body.discountType;
    if (req.body.discountValue !== undefined) updateData.discountValue = String(req.body.discountValue);
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    if (req.body.startDate !== undefined) updateData.startDate = req.body.startDate ? new Date(req.body.startDate) : null;
    if (req.body.endDate !== undefined) updateData.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(productDrinkDiscountsTable)
      .set(updateData)
      .where(eq(productDrinkDiscountsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Product discount not found" });
      return;
    }

    res.json({
      ...serializeDates(updated),
      discountValue: parseFloat(updated.discountValue),
    });
  } catch (error: any) {
    console.error("[PATCH /product-discounts/:id] error:", error?.message);
    res.status(500).json({ error: "Failed to update product discount: " + error.message });
  }
});

// Delete a product discount
router.delete("/product-discounts/:id", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  try {
    const [deleted] = await db
      .delete(productDrinkDiscountsTable)
      .where(eq(productDrinkDiscountsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Product discount not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error: any) {
    console.error("[DELETE /product-discounts/:id] error:", error?.message);
    res.status(500).json({ error: "Failed to delete product discount" });
  }
});

export default router;
