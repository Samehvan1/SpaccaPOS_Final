import { Router, type IRouter } from "express";
import { eq, ne, and, inArray } from "drizzle-orm";
import { 
  db, 
  offersTable, 
  offersBranchesTable, 
  offersPartnersTable,
  offersApplicableDrinksTable,
  offersRewardDrinksTable,
  offersExcludedDrinksTable 
} from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { requirePermission } from "../middleware/permissions";
import {
  Offer,
  CreateOfferBody,
  UpdateOfferBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Helper to load branchIds, partnerIds, and drink scopes for an offer from junction tables
async function loadOfferScopes(tx: any, offerId: number) {
  const branches = await tx.select().from(offersBranchesTable).where(eq(offersBranchesTable.offerId, offerId));
  const partners = await tx.select().from(offersPartnersTable).where(eq(offersPartnersTable.offerId, offerId));
  const applicable = await tx.select().from(offersApplicableDrinksTable).where(eq(offersApplicableDrinksTable.offerId, offerId));
  const reward = await tx.select().from(offersRewardDrinksTable).where(eq(offersRewardDrinksTable.offerId, offerId));
  const excluded = await tx.select().from(offersExcludedDrinksTable).where(eq(offersExcludedDrinksTable.offerId, offerId));
  return {
    branchIds: branches.map((b: any) => b.branchId) as number[],
    partnerIds: partners.map((p: any) => p.partnerId) as number[],
    applicableDrinkIds: applicable.map((a: any) => a.drinkId) as number[],
    rewardDrinkIds: reward.map((r: any) => r.drinkId) as number[],
    excludedDrinkIds: excluded.map((e: any) => e.drinkId) as number[],
  };
}

// Helper to enrich an offer row with junction table arrays
async function enrichOffer(tx: any, offer: any) {
  const scopes = await loadOfferScopes(tx, offer.id);
  return { ...serializeDates(offer), ...scopes };
}

// Helper to sync junction tables for an offer (insert/replace pattern)
async function syncOfferScopes(
  tx: any, 
  offerId: number, 
  branchIds?: number[], 
  partnerIds?: number[],
  applicableDrinkIds?: number[],
  rewardDrinkIds?: number[],
  excludedDrinkIds?: number[]
) {
  if (branchIds !== undefined) {
    await tx.delete(offersBranchesTable).where(eq(offersBranchesTable.offerId, offerId));
    if (branchIds.length > 0) {
      await tx.insert(offersBranchesTable).values(branchIds.map(bid => ({ offerId, branchId: bid })));
    }
  }
  if (partnerIds !== undefined) {
    await tx.delete(offersPartnersTable).where(eq(offersPartnersTable.offerId, offerId));
    if (partnerIds.length > 0) {
      await tx.insert(offersPartnersTable).values(partnerIds.map(pid => ({ offerId, partnerId: pid })));
    }
  }
  if (applicableDrinkIds !== undefined) {
    await tx.delete(offersApplicableDrinksTable).where(eq(offersApplicableDrinksTable.offerId, offerId));
    if (applicableDrinkIds.length > 0) {
      await tx.insert(offersApplicableDrinksTable).values(applicableDrinkIds.map(did => ({ offerId, drinkId: did })));
    }
  }
  if (rewardDrinkIds !== undefined) {
    await tx.delete(offersRewardDrinksTable).where(eq(offersRewardDrinksTable.offerId, offerId));
    if (rewardDrinkIds.length > 0) {
      await tx.insert(offersRewardDrinksTable).values(rewardDrinkIds.map(did => ({ offerId, drinkId: did })));
    }
  }
  if (excludedDrinkIds !== undefined) {
    await tx.delete(offersExcludedDrinksTable).where(eq(offersExcludedDrinksTable.offerId, offerId));
    if (excludedDrinkIds.length > 0) {
      await tx.insert(offersExcludedDrinksTable).values(excludedDrinkIds.map(did => ({ offerId, drinkId: did })));
    }
  }
}

// Helper to deactivate overlapping active offers based on junction table scopes
async function deactivateOverlappingOffers(
  tx: any,
  newOffer: {
    branchIds: number[];        // empty = all branches
    partnerIds: number[];       // empty = all partners (when applyToAllPartners=true)
    applyToStore?: boolean;
    applyToAllPartners?: boolean;
  },
  excludeId?: number
) {
  let query = tx.select().from(offersTable).where(eq(offersTable.isActive, true));
  if (excludeId) {
    query = tx.select().from(offersTable).where(and(eq(offersTable.isActive, true), ne(offersTable.id, excludeId)));
  }
  const activeOffers = await query;

  const overlappingIds: number[] = [];

  for (const o of activeOffers) {
    const { branchIds: oBranchIds, partnerIds: oPartnerIds } = await loadOfferScopes(tx, o.id);

    // Branches overlap: if either offer has no branch restriction, or they share at least one branch
    const branchesOverlap =
      oBranchIds.length === 0 ||
      newOffer.branchIds.length === 0 ||
      oBranchIds.some(b => newOffer.branchIds.includes(b));

    if (!branchesOverlap) continue;

    // Store channel overlap
    const storeOverlap = (o.applyToStore ?? true) && (newOffer.applyToStore ?? true);

    // Partner channel overlap
    const oAllPartners = o.applyToAllPartners ?? true;
    const newAllPartners = newOffer.applyToAllPartners ?? true;
    const partnerOverlap =
      (oAllPartners && newAllPartners) ||
      (oAllPartners && newOffer.partnerIds.length > 0) ||
      (newAllPartners && oPartnerIds.length > 0) ||
      oPartnerIds.some(p => newOffer.partnerIds.includes(p));

    if (storeOverlap || partnerOverlap) {
      overlappingIds.push(o.id);
    }
  }

  if (overlappingIds.length > 0) {
    await tx
      .update(offersTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(inArray(offersTable.id, overlappingIds));
  }
}

// GET /offers - List all offers with junction table scopes
router.get("/offers", requirePermission("discounts:view"), async (req, res): Promise<void> => {
  try {
    const offers = await db.select().from(offersTable);
    const enriched = await Promise.all(offers.map(o => enrichOffer(db, o)));
    res.json(enriched);
  } catch (error: any) {
    console.error("[GET /offers] error:", error?.message);
    res.status(500).json({ error: "Failed to list offers" });
  }
});

// GET /offers/active - Get the currently active offer for a branch and partner
router.get("/offers/active", async (req, res): Promise<void> => {
  try {
    const { branchId, partnerId } = req.query;
    const targetBranchId = branchId && branchId !== "null" && branchId !== "undefined" ? parseInt(branchId as string) : null;
    const targetPartnerId = partnerId && partnerId !== "all" && partnerId !== "null" && partnerId !== "undefined" ? parseInt(partnerId as string) : null;

    const offers = await db.select().from(offersTable).where(eq(offersTable.isActive, true));

    for (const o of offers) {
      const { branchIds, partnerIds } = await loadOfferScopes(db, o.id);

      // Branch check: if offer has no specific branches, applies to all
      if (targetBranchId && branchIds.length > 0 && !branchIds.includes(targetBranchId)) {
        continue;
      }

      // Channel check
      if (targetPartnerId) {
        // Partner order: match if applyToAllPartners or specific partner is listed
        const matchesPartner = (o.applyToAllPartners ?? true) || partnerIds.includes(targetPartnerId);
        if (!matchesPartner) continue;
      } else {
        // Store order: match if applyToStore
        if (!(o.applyToStore ?? true)) continue;
      }

      // Return enriched offer with all branch, partner, and drink scoping lists
      const enriched = await enrichOffer(db, o);
      res.json(enriched);
      return;
    }

    res.json(null);
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
    const enrichedOffer = await db.transaction(async (tx) => {
      const isAct = parsed.data.isActive ?? true;
      const branchIds: number[] = parsed.data.branchIds ?? [];
      const partnerIds: number[] = parsed.data.partnerIds ?? [];
      const applicableDrinkIds: number[] = (parsed.data as any).applicableDrinkIds ?? [];
      const rewardDrinkIds: number[] = (parsed.data as any).rewardDrinkIds ?? [];
      const excludedDrinkIds: number[] = (parsed.data as any).excludedDrinkIds ?? [];
      const applyToStore = parsed.data.applyToStore ?? true;
      const applyToAllPartners = parsed.data.applyToAllPartners ?? true;

      if (isAct) {
        await deactivateOverlappingOffers(tx, { branchIds, partnerIds, applyToStore, applyToAllPartners });
      }

      const [newOffer] = await tx
        .insert(offersTable)
        .values({
          name: parsed.data.name,
          buyAmount: parsed.data.buyAmount,
          freeAmount: parsed.data.freeAmount,
          isActive: isAct,
          applyToStore,
          applyToAllPartners,
        })
        .returning();

      await syncOfferScopes(tx, newOffer.id, branchIds, partnerIds, applicableDrinkIds, rewardDrinkIds, excludedDrinkIds);

      return { ...serializeDates(newOffer), branchIds, partnerIds, applicableDrinkIds, rewardDrinkIds, excludedDrinkIds };
    });

    res.status(201).json(enrichedOffer);
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
    const enrichedOffer = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(offersTable).where(eq(offersTable.id, id));
      if (!existing) {
        throw new Error("Offer not found");
      }

      const { 
        branchIds: existingBranchIds, 
        partnerIds: existingPartnerIds,
        applicableDrinkIds: existingApplicable,
        rewardDrinkIds: existingReward,
        excludedDrinkIds: existingExcluded 
      } = await loadOfferScopes(tx, id);

      const isAct = parsed.data.isActive !== undefined ? parsed.data.isActive : existing.isActive;
      const branchIds: number[] = parsed.data.branchIds !== undefined ? parsed.data.branchIds : existingBranchIds;
      const partnerIds: number[] = parsed.data.partnerIds !== undefined ? parsed.data.partnerIds : existingPartnerIds;
      const applicableDrinkIds: number[] = (parsed.data as any).applicableDrinkIds !== undefined ? (parsed.data as any).applicableDrinkIds : existingApplicable;
      const rewardDrinkIds: number[] = (parsed.data as any).rewardDrinkIds !== undefined ? (parsed.data as any).rewardDrinkIds : existingReward;
      const excludedDrinkIds: number[] = (parsed.data as any).excludedDrinkIds !== undefined ? (parsed.data as any).excludedDrinkIds : existingExcluded;
      const applyToStore = parsed.data.applyToStore !== undefined ? parsed.data.applyToStore : existing.applyToStore;
      const applyToAllPartners = parsed.data.applyToAllPartners !== undefined ? parsed.data.applyToAllPartners : existing.applyToAllPartners;

      if (isAct) {
        await deactivateOverlappingOffers(tx, { branchIds, partnerIds, applyToStore, applyToAllPartners }, id);
      }

      const updateData: any = { updatedAt: new Date() };
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
      if (parsed.data.buyAmount !== undefined) updateData.buyAmount = parsed.data.buyAmount;
      if (parsed.data.freeAmount !== undefined) updateData.freeAmount = parsed.data.freeAmount;
      if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
      if (parsed.data.applyToStore !== undefined) updateData.applyToStore = parsed.data.applyToStore;
      if (parsed.data.applyToAllPartners !== undefined) updateData.applyToAllPartners = parsed.data.applyToAllPartners;

      const [updatedOffer] = await tx
        .update(offersTable)
        .set(updateData)
        .where(eq(offersTable.id, id))
        .returning();

      await syncOfferScopes(
        tx, 
        id, 
        parsed.data.branchIds, 
        parsed.data.partnerIds,
        (parsed.data as any).applicableDrinkIds,
        (parsed.data as any).rewardDrinkIds,
        (parsed.data as any).excludedDrinkIds
      );

      return { ...serializeDates(updatedOffer), branchIds, partnerIds, applicableDrinkIds, rewardDrinkIds, excludedDrinkIds };
    });

    res.json(enrichedOffer);
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
