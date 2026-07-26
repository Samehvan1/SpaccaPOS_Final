import { Router, type IRouter } from "express";
import { eq, ne } from "drizzle-orm";
import { db, offersTable } from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { requirePermission } from "../middleware/permissions";
import {
  Offer,
  CreateOfferBody,
  UpdateOfferBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /offers - List all offers
router.get("/offers", requirePermission("discounts:view"), async (req, res): Promise<void> => {
  try {
    const offers = await db.select().from(offersTable);
    res.json(offers.map(o => serializeDates(o)));
  } catch (error: any) {
    console.error("[GET /offers] error:", error?.message);
    res.status(500).json({ error: "Failed to list offers" });
  }
});

// GET /offers/active - Get the currently active offer (if any)
router.get("/offers/active", async (req, res): Promise<void> => {
  try {
    const [activeOffer] = await db
      .select()
      .from(offersTable)
      .where(eq(offersTable.isActive, true))
      .limit(1);

    if (!activeOffer) {
      res.json(null);
      return;
    }

    res.json(serializeDates(activeOffer));
  } catch (error: any) {
    console.error("[GET /offers/active] error:", error?.message);
    res.status(500).json({ error: "Failed to fetch active offer" });
  }
});

// POST /offers - Create a new offer
router.post("/offers", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const offer = await db.transaction(async (tx) => {
      const isAct = parsed.data.isActive ?? true;
      if (isAct) {
        // Deactivate other offers
        await tx
          .update(offersTable)
          .set({ isActive: false, updatedAt: new Date() });
      }

      const [newOffer] = await tx
        .insert(offersTable)
        .values({
          name: parsed.data.name,
          buyAmount: parsed.data.buyAmount,
          freeAmount: parsed.data.freeAmount,
          isActive: isAct,
        })
        .returning();

      return newOffer;
    });

    res.status(201).json(serializeDates(offer));
  } catch (error: any) {
    console.error("[POST /offers] error:", error?.message);
    res.status(500).json({ error: "Failed to create offer: " + error.message });
  }
});

// PATCH /offers/:id - Update an offer
router.patch("/offers/:id", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const offer = await db.transaction(async (tx) => {
      if (parsed.data.isActive === true) {
        // Deactivate other offers
        await tx
          .update(offersTable)
          .set({ isActive: false, updatedAt: new Date() })
          .where(ne(offersTable.id, id));
      }

      const updateData: any = {};
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
      if (parsed.data.buyAmount !== undefined) updateData.buyAmount = parsed.data.buyAmount;
      if (parsed.data.freeAmount !== undefined) updateData.freeAmount = parsed.data.freeAmount;
      if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
      updateData.updatedAt = new Date();

      const [updatedOffer] = await tx
        .update(offersTable)
        .set(updateData)
        .where(eq(offersTable.id, id))
        .returning();

      if (!updatedOffer) {
        throw new Error("Offer not found");
      }

      return updatedOffer;
    });

    res.json(serializeDates(offer));
  } catch (error: any) {
    console.error("[PATCH /offers/:id] error:", error?.message);
    if (error.message === "Offer not found") {
      res.status(404).json({ error: "Offer not found" });
      return;
    }
    res.status(500).json({ error: "Failed to update offer: " + error.message });
  }
});

// DELETE /offers/:id - Delete an offer
router.delete("/offers/:id", requirePermission("discounts:manage"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const [deleted] = await db
      .delete(offersTable)
      .where(eq(offersTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Offer not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error: any) {
    console.error("[DELETE /offers/:id] error:", error?.message);
    res.status(500).json({ error: "Failed to delete offer: " + error.message });
  }
});

export default router;
