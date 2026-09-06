import { Router, type IRouter } from "express";
import { eq, and, inArray, asc, sql, isNull } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  db,
  drinksTable,
  drinkIngredientSlotsTable,
  drinkSlotVolumesTable,
  drinkSlotTypeOptionsTable,
  drinkCategoriesTable,
  ingredientsTable,
  ingredientOptionsTable,
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  ingredientVolumesTable,
  ingredientCategoriesTable,
  predefinedSlotsTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable,
  branchStockTable,
  branchDrinkPricesTable,
  partnerDrinkPricesTable,
  branchDrinkStatusTable,
  partnerDrinkStatusTable,
  orderItemsTable,
  orderItemCustomizationsTable,
  offersTable,
  offersBranchesTable,
  offersPartnersTable,
  offersApplicableDrinksTable,
  offersExcludedDrinksTable,
} from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { globalCache } from "../lib/cache";
import { requirePermission } from "../middleware/permissions";
import { calculateDrinkData, getProductCost, getStandardProductPrice, resolveProductDiscount } from "../lib/price-calculator";

// ── Image upload: store in <cwd>/uploads/ ────────────────────────────────────
const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `drink-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

const uploadSingleImage = (req: any, res: any, next: any) => {
  upload.single("image")(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "Image file size is too large. Maximum allowed size is 25MB." });
        return;
      }
      res.status(400).json({ error: `Image upload error: ${err.message}` });
      return;
    } else if (err) {
      res.status(400).json({ error: err.message || "Failed to upload image" });
      return;
    }
    next();
  });
};
// ─────────────────────────────────────────────────────────────────────────────
import {
  ListDrinksQueryParams,
  ListDrinksResponse,
  CreateDrinkBody,
  GetDrinkParams,
  GetDrinkResponse,
  UpdateDrinkParams,
  UpdateDrinkBody,
  UpdateDrinkResponse,
  DeleteDrinkParams,
  CalculateDrinkPriceParams,
  CalculateDrinkPriceBody,
  CalculateDrinkPriceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildDrinkDetail(drinkId: number, branchId?: number) {
  const cacheKey = `drink_detail_${drinkId}_${branchId ?? 'global'}`;
  const cached = globalCache.get<any>(cacheKey);
  if (cached) return cached;

  const [drink] = await db.select().from(drinksTable).where(eq(drinksTable.id, drinkId));
  if (!drink) return null;

  const slots = await db
    .select()
    .from(drinkIngredientSlotsTable)
    .where(eq(drinkIngredientSlotsTable.drinkId, drinkId))
    .orderBy(drinkIngredientSlotsTable.sortOrder);

  // Helper: build merged volumes for a type + slot-level overrides
  async function buildTypeVolumes(typeId: number, slotId: number) {
    const [[typeDef], typeVolumes] = await Promise.all([
      db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, typeId)),
      db.select().from(ingredientTypeVolumesTable)
        .where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, typeId), eq(ingredientTypeVolumesTable.isActive, true)))
        .orderBy(asc(ingredientTypeVolumesTable.sortOrder), asc(ingredientTypeVolumesTable.id))
    ]);

    const allSlotVols = await db.select().from(drinkSlotVolumesTable)
      .where(eq(drinkSlotVolumesTable.slotId, slotId));
    const slotVolumeMap = new Map(allSlotVols.map((sv) => [sv.typeVolumeId, sv]));

    const volIds = typeVolumes.map((tv) => tv.volumeId);
    const volRows = volIds.length > 0
      ? await db.select().from(ingredientVolumesTable).where(inArray(ingredientVolumesTable.id, volIds))
      : [];
    const volMap = new Map(volRows.map((v) => [v.id, v]));

    return typeVolumes.map((tv) => {
      const override = slotVolumeMap.get(tv.id);
      const vol = volMap.get(tv.volumeId);
      return {
        id: tv.id,
        volumeId: tv.volumeId,
        volumeName: vol?.name ?? "",
        processedQty: Number(override?.processedQty ?? tv.processedQty ?? vol?.processedQty ?? 0),
        producedQty: Number(override?.producedQty ?? tv.producedQty ?? vol?.producedQty ?? 0),
        unit: override?.unit ?? tv.unit ?? vol?.unit ?? "ml",
        extraCost: Number(override?.extraCost ?? tv.extraCost),
        isDefault: override?.isDefault ?? tv.isDefault,
        isEnabled: override?.isEnabled ?? true,
        sortOrder: override?.sortOrder ?? tv.sortOrder,
        affectsCupSize: typeDef?.affectsCupSize ?? true,
        hasSlotOverride: !!override,
      };
    }).filter((v) => v.isEnabled)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
  }

  const slotsWithDetails = await Promise.all(
    slots.map(async (slot) => {
      // ── Template Resolution ──────────────────────────────────────────────
      let effectiveSlot = { ...slot };
      let templateTypeOptions: any[] = [];
      let templateVolumes: any[] = [];

      if (slot.predefinedSlotId) {
        const [template] = await db.select().from(predefinedSlotsTable).where(eq(predefinedSlotsTable.id, slot.predefinedSlotId));
        if (template) {
          // Inherit template properties only if not set on the slot (soft inheritance)
          effectiveSlot.slotLabel = slot.slotLabel || template.slotLabel;
          effectiveSlot.isRequired = slot.isRequired ?? template.isRequired;
          effectiveSlot.isDynamic = slot.isDynamic ?? template.isDynamic;
          effectiveSlot.affectsCupSize = slot.affectsCupSize ?? template.affectsCupSize;
          
          templateTypeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
            .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, template.id));
          templateVolumes = await db.select().from(predefinedSlotVolumesTable)
            .where(eq(predefinedSlotVolumesTable.predefinedSlotId, template.id));
        }
      }

      // ── New-style slot: check for multi-type options first ────────────────
      const typeOptions = await db.select().from(drinkSlotTypeOptionsTable)
        .where(eq(drinkSlotTypeOptionsTable.slotId, slot.id))
        .orderBy(drinkSlotTypeOptionsTable.sortOrder);

      // Merge template options with drink-specific overrides
      let effectiveTypeOptions = typeOptions;
      if (slot.predefinedSlotId && templateTypeOptions.length > 0) {
        if (typeOptions.length > 0) {
          // If the drink has ANY specific overrides for this slot, they define the exact list of options.
          // This allows users to "remove" options from a template by simply not including them in the overrides.
          effectiveTypeOptions = typeOptions;
        } else {
          // No overrides at all? Use the full template list.
          effectiveTypeOptions = templateTypeOptions.map(tto => ({
            id: 0, slotId: slot.id, ingredientTypeId: tto.ingredientTypeId,
            isDefault: tto.isDefault, sortOrder: tto.sortOrder,
            processedQty: tto.processedQty, producedQty: tto.producedQty,
            unit: tto.unit, extraCost: tto.extraCost,
            pricingMode: tto.pricingMode
          }));
        }
      }

      if (effectiveTypeOptions.length === 0 && slot.ingredientTypeId) {
        effectiveTypeOptions = [{ 
          id: 0, slotId: slot.id, ingredientTypeId: slot.ingredientTypeId, 
          isDefault: true, sortOrder: 0,
          processedQty: null, producedQty: null, unit: null, extraCost: null,
          pricingMode: null
        }];
      }

      let slotResult: any;

      if (effectiveTypeOptions.length > 0) {
        // Resolve Type Options
        const typeOptionsWithVolumes = await Promise.all(
          effectiveTypeOptions.map(async (to) => {
            const [ingType] = await db.select().from(ingredientTypesTable)
              .where(eq(ingredientTypesTable.id, to.ingredientTypeId));
            if (!ingType || ingType.isActive === false) return null;

            if (ingType.inventoryIngredientId) {
              const [ing] = await db.select().from(ingredientsTable)
                .where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
              if (!ing || ing.isActive === false) return null;
            }

            const [category] = ingType
              ? await db.select().from(ingredientCategoriesTable)
                  .where(eq(ingredientCategoriesTable.id, ingType.categoryId))
              : [null];

            // Fetch current stock from linked inventory item for specific branch
            let stockQuantity = 999999;
            if (ingType?.inventoryIngredientId) {
              if (branchId) {
                const [inv] = await db.select({ stock: branchStockTable.stockQuantity })
                  .from(branchStockTable)
                  .where(and(
                    eq(branchStockTable.ingredientId, ingType.inventoryIngredientId),
                    eq(branchStockTable.branchId, branchId)
                  ))
                  .limit(1);
                stockQuantity = inv ? Number(inv.stock) : 0;
              } else {
                // Global view: sum across all branches
                const [result] = await db.select({ totalStock: sql<string>`SUM(${branchStockTable.stockQuantity})` })
                  .from(branchStockTable)
                  .where(eq(branchStockTable.ingredientId, ingType.inventoryIngredientId));
                stockQuantity = result?.totalStock ? Number(result.totalStock) : 0;
              }
            } else if (!ingType) {
              stockQuantity = 0;
            }
              
            // Volumes: merge slot-level overrides with template-level defaults or global type defaults
            const globalTypeVolumes = await db.select().from(ingredientTypeVolumesTable)
              .where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, to.ingredientTypeId), eq(ingredientTypeVolumesTable.isActive, true)))
              .orderBy(asc(ingredientTypeVolumesTable.sortOrder), asc(ingredientTypeVolumesTable.id));
              
            const [typeDef] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, to.ingredientTypeId));
            const allSlotVols = await db.select().from(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id));
            const slotVolumeMap = new Map(allSlotVols.map((sv) => [sv.typeVolumeId, sv]));
            const templateVolumeMap = new Map(templateVolumes.map((tv) => [tv.typeVolumeId, tv]));

            const volIds = globalTypeVolumes.map((tv) => tv.volumeId);
            const volRows = volIds.length > 0 ? await db.select().from(ingredientVolumesTable).where(inArray(ingredientVolumesTable.id, volIds)) : [];
            const volMap = new Map(volRows.map((v) => [v.id, v]));

            const hasExplicitDefaultInSlot = allSlotVols.some(sv => {
              const matchingTv = globalTypeVolumes.find(gt => gt.id === sv.typeVolumeId);
              return matchingTv && sv.isDefault === true;
            });
            const hasExplicitDefaultInTemplate = templateVolumes.some(t => {
              const matchingTv = globalTypeVolumes.find(gt => gt.id === t.typeVolumeId);
              return matchingTv && t.isDefault === true;
            });

            const volumes = globalTypeVolumes.map((tv) => {
              const override = slotVolumeMap.get(tv.id);
              const templateDef = templateVolumeMap.get(tv.id);
              const vol = volMap.get(tv.volumeId);
              
              let effectiveIsDefault = tv.isDefault;
              if (override && override.isDefault !== undefined && override.isDefault !== null) {
                if (hasExplicitDefaultInSlot) {
                  effectiveIsDefault = override.isDefault;
                }
              } else if (templateDef && templateDef.isDefault !== undefined && templateDef.isDefault !== null) {
                if (hasExplicitDefaultInTemplate) {
                  effectiveIsDefault = templateDef.isDefault;
                }
              }

              return {
                id: tv.id,
                volumeId: tv.volumeId,
                volumeName: vol?.name ?? "",
                processedQty: Number(override?.processedQty ?? templateDef?.processedQty ?? tv.processedQty ?? vol?.processedQty ?? 0),
                producedQty: Number(override?.producedQty ?? templateDef?.producedQty ?? tv.producedQty ?? vol?.producedQty ?? 0),
                unit: override?.unit ?? templateDef?.unit ?? tv.unit ?? vol?.unit ?? "ml",
                extraCost: Number(override?.extraCost ?? templateDef?.extraCost ?? tv.extraCost),
                isDefault: effectiveIsDefault,
                isEnabled: override?.isEnabled ?? templateDef?.isEnabled ?? true,
                isAvailable: stockQuantity >= Number(override?.processedQty ?? templateDef?.processedQty ?? tv.processedQty ?? vol?.processedQty ?? 0),
                sortOrder: override?.sortOrder ?? templateDef?.sortOrder ?? tv.sortOrder,
                affectsCupSize: typeDef?.affectsCupSize ?? true,
                hasSlotOverride: !!override,
              };
            }).filter((v) => v.isEnabled)
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);

            const baseQty = Number(to.processedQty ?? ingType?.processedQty ?? 0);
            const isAvailable = volumes.length > 0 
              ? volumes.some(v => stockQuantity >= v.processedQty)
              : stockQuantity >= baseQty;

            return {
              typeOptionId: to.id,
              ingredientTypeId: to.ingredientTypeId,
              typeName: ingType?.name ?? "",
              categoryName: category?.name ?? "",
              isDefault: to.isDefault,
              sortOrder: to.sortOrder,
              stockQuantity,
              isAvailable,
              // Base type overrides
              processedQty: Number(to.processedQty ?? ingType?.processedQty ?? 0),
              producedQty: Number(to.producedQty ?? ingType?.producedQty ?? 0),
              unit: to.unit ?? ingType?.unit ?? "ml",
              extraCost: Number(to.extraCost ?? ingType?.extraCost ?? 0),
              pricingMode: to.pricingMode ?? ingType?.pricingMode ?? "volume",
              volumes,
            };
          })
        ).then(options => options.filter((o): o is NonNullable<typeof o> => o !== null && o.typeName !== ""));

        slotResult = {
          ...effectiveSlot,
          slotStyle: "typed" as const,
          typeOptions: typeOptionsWithVolumes,
          // Legacy compat fields
          ingredient: null,
          volumes: typeOptionsWithVolumes[0]?.volumes ?? [],
          ingredientType: null,
        };
      } else if (slot.ingredientId) {
        // ── Old-style slot: ingredientId set ─────────────────────────────────
        const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, slot.ingredientId));
        if (!ingredient || ingredient.isActive === false) {
          return {
            ...effectiveSlot,
            slotStyle: "legacy" as const,
            typeOptions: null,
            ingredient: null,
            volumes: [],
            ingredientType: null,
            isAvailable: false,
            unavailableReason: `Unavailable: ${effectiveSlot.slotLabel || "Ingredient is inactive"}`,
          };
        }

        const options = await db
          .select()
          .from(ingredientOptionsTable)
          .where(eq(ingredientOptionsTable.ingredientId, slot.ingredientId))
          .orderBy(ingredientOptionsTable.sortOrder);

        let stockQuantity = 0;
        if (ingredient) {
          if (branchId) {
            const [stockRow] = await db.select({ stock: branchStockTable.stockQuantity })
              .from(branchStockTable)
              .where(and(
                eq(branchStockTable.ingredientId, ingredient.id),
                eq(branchStockTable.branchId, branchId)
              ))
              .limit(1);
            stockQuantity = stockRow ? Number(stockRow.stock) : 0;
          } else {
            const [result] = await db.select({ totalStock: sql<string>`SUM(${branchStockTable.stockQuantity})` })
              .from(branchStockTable)
              .where(eq(branchStockTable.ingredientId, ingredient.id));
            stockQuantity = result?.totalStock ? Number(result.totalStock) : 0;
          }
        }

        const enrichedOptions = (await Promise.all(
          options.map(async (o) => {
            let linkedIngredient: { id: number; name: string; options: any[] } | null = null;
            if (o.linkedIngredientId) {
              const [linked] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, o.linkedIngredientId));
              if (!linked || linked.isActive === false) return null;
              
              const linkedOpts = await db
                .select()
                .from(ingredientOptionsTable)
                .where(eq(ingredientOptionsTable.ingredientId, o.linkedIngredientId))
                .orderBy(ingredientOptionsTable.sortOrder);
              linkedIngredient = {
                id: linked.id,
                name: linked.name,
                options: linkedOpts.map((lo) => ({
                  ...lo,
                  processedQty: Number(lo.processedQty),
                  producedQty: Number(lo.producedQty),
                  extraCost: Number(lo.extraCost),
                })),
              };
            }
            const isAvailable = stockQuantity >= Number(o.processedQty);
            return {
              ...o,
              isAvailable,
              processedQty: Number(o.processedQty),
              producedQty: Number(o.producedQty),
              extraCost: Number(o.extraCost),
              linkedIngredientId: o.linkedIngredientId ?? null,
              linkedIngredient,
            };
          })
        )).filter((o): o is NonNullable<typeof o> => o !== null);

        slotResult = {
          ...effectiveSlot,
          slotStyle: "legacy" as any,
          typeOptions: null,
          ingredient: ingredient ? {
            ...ingredient,
            costPerUnit: Number(ingredient.costPerUnit),
            stockQuantity,
            lowStockThreshold: 100, // Default for legacy
            options: enrichedOptions,
          } : null,
          volumes: [],
          ingredientType: null,
        };
      } else {
        slotResult = { ...effectiveSlot, slotStyle: "legacy" as const, ingredient: null, volumes: [] };
      }

      // Availability check
      let isAvailable = true;
      let unavailableReason: string | null = null;
      if (effectiveSlot.isRequired) {
        if (slotResult.slotStyle === "typed" && slotResult.typeOptions && slotResult.typeOptions.length > 0) {
          isAvailable = slotResult.typeOptions.some((to: any) => to.isAvailable);
          if (!isAvailable) {
            unavailableReason = `Out of stock: ${slotResult.slotLabel}`;
          }
        } else if (slotResult.ingredient?.options && slotResult.ingredient.options.length > 0) {
          isAvailable = slotResult.ingredient.options.some((o: any) => o.isAvailable);
          if (!isAvailable) {
            unavailableReason = `Out of stock: ${slotResult.ingredient.name}`;
          }
        } else if (slotResult.ingredient) {
          isAvailable = (slotResult.ingredient.stockQuantity ?? 0) > 0;
          if (!isAvailable) {
            unavailableReason = `Out of stock: ${slotResult.ingredient.name}`;
          }
        }
      }
      
      return { ...slotResult, isAvailable, unavailableReason };
    })
  );

  const unavailableReasons = slotsWithDetails
    .filter(s => !s.isAvailable && s.unavailableReason)
    .map(s => s.unavailableReason as string);

  let isCupAvailable = true;
  if (drink.cupIngredientId) {
    if (branchId) {
      const [cupInv] = await db.select({ stock: branchStockTable.stockQuantity })
        .from(branchStockTable)
        .where(and(
          eq(branchStockTable.ingredientId, drink.cupIngredientId),
          eq(branchStockTable.branchId, branchId)
        ))
        .limit(1);
      isCupAvailable = cupInv ? Number(cupInv.stock) >= 1 : false;
    } else {
      const [result] = await db.select({ totalStock: sql<string>`SUM(${branchStockTable.stockQuantity})` })
        .from(branchStockTable)
        .where(eq(branchStockTable.ingredientId, drink.cupIngredientId));
      isCupAvailable = result?.totalStock ? Number(result.totalStock) >= 1 : false;
    }
    if (!isCupAvailable) {
      unavailableReasons.push("Out of stock: Required Cup/Glass");
    }
  }

  const isDrinkAvailable = isCupAvailable && slotsWithDetails.every(s => s.isAvailable);

  const result = {
    ...drink,
    basePrice: Number(drink.basePrice),
    slots: slotsWithDetails,
    isAvailable: isDrinkAvailable,
    unavailableReasons,
  };
  
  globalCache.set(cacheKey, result);
  return result;
}

async function computeDefaultPrice(drinkId: number, branchId?: number, partnerId?: number): Promise<{ defaultPrice: number; cost: number }> {
  const cacheKey = `drink_default_price_cost_${drinkId}_${branchId ?? "global"}_${partnerId ?? "global"}`;
  const cached = globalCache.get<{ defaultPrice: number; cost: number }>(cacheKey);
  if (cached !== null) return cached;

  try {
    const data = await calculateDrinkData(drinkId, [], branchId, partnerId);
    const res = { defaultPrice: data.totalPrice, cost: data.totalCost ?? 0 };
    globalCache.set(cacheKey, res);
    return res;
  } catch (error) {
    console.error(`Error computing default price for drink ${drinkId}:`, error);
    return { defaultPrice: 0, cost: 0 };
  }
}

router.get("/drinks", async (req, res): Promise<void> => {
  const params = ListDrinksQueryParams.safeParse(req.query);
  const sessionUser = (req.session as any);
  const sessionBranchId = sessionUser?.branchId;
  const isAdmin = sessionUser?.role === "admin";
  
  // Use session branch by default, but allow query override for admins OR if no session exists (Kiosk/Public)
  const targetBranchId = (req.query.branchId && (isAdmin || !sessionBranchId))
    ? parseInt(req.query.branchId as string)
    : sessionBranchId;

  const queryPartnerId = req.query.partnerId ? parseInt(req.query.partnerId as string) : undefined;

  const conditions = [];
  if (params.success && params.data.active !== undefined) {
    conditions.push(eq(drinksTable.isActive, params.data.active));
  }

  const drinks = conditions.length
    ? await db.select().from(drinksTable).where(and(...conditions))
    : await db.select().from(drinksTable);

  // Check per-branch and per-partner active/inactive status overrides
  let disabledDrinkIds = new Set<number>();
  if (targetBranchId) {
    const branchStatusRows = await db
      .select()
      .from(branchDrinkStatusTable)
      .where(and(eq(branchDrinkStatusTable.branchId, targetBranchId), eq(branchDrinkStatusTable.isActive, false)));
    for (const r of branchStatusRows) {
      disabledDrinkIds.add(r.drinkId);
    }
  }

  if (queryPartnerId) {
    const partnerStatusRows = await db
      .select()
      .from(partnerDrinkStatusTable)
      .where(and(eq(partnerDrinkStatusTable.partnerId, queryPartnerId), eq(partnerDrinkStatusTable.isActive, false)));
    for (const r of partnerStatusRows) {
      if (!r.branchId || r.branchId === targetBranchId) {
        disabledDrinkIds.add(r.drinkId);
      }
    }
  }

  let filtered = drinks.filter(d => !disabledDrinkIds.has(d.id));
  if (params.success && params.data.category) {
    filtered = filtered.filter((d) => d.category === params.data.category);
  }

  filtered = [...filtered].sort((a, b) => {
    const sortA = a.sortOrder ?? 0;
    const sortB = b.sortOrder ?? 0;
    if (sortA !== sortB) return sortA - sortB;
    return a.name.localeCompare(b.name);
  });

  // Fetch active offers with promoLabel to map to drinks
  const activeOffers = await db.select().from(offersTable).where(eq(offersTable.isActive, true));
  const promoLabelMap = new Map<number, string>();
  for (const offer of activeOffers) {
    if (!offer.promoLabel) continue;
    
    if (targetBranchId) {
      const offerBranches = await db.select().from(offersBranchesTable).where(eq(offersBranchesTable.offerId, offer.id));
      const bIds = offerBranches.map(b => b.branchId);
      if (bIds.length > 0 && !bIds.includes(targetBranchId)) continue;
    }
    if (queryPartnerId) {
      const offerPartners = await db.select().from(offersPartnersTable).where(eq(offersPartnersTable.offerId, offer.id));
      const pIds = offerPartners.map(p => p.partnerId);
      const matchesPartner = (offer.applyToAllPartners ?? true) || pIds.includes(queryPartnerId);
      if (!matchesPartner) continue;
    } else {
      if (!(offer.applyToStore ?? true)) continue;
    }

    const applicable = await db.select().from(offersApplicableDrinksTable).where(eq(offersApplicableDrinksTable.offerId, offer.id));
    const excluded = await db.select().from(offersExcludedDrinksTable).where(eq(offersExcludedDrinksTable.offerId, offer.id));
    const appDrinkIds = applicable.map(a => a.drinkId);
    const exclDrinkIds = new Set(excluded.map(e => e.drinkId));

    if (appDrinkIds.length > 0) {
      for (const did of appDrinkIds) {
        if (!exclDrinkIds.has(did) && !promoLabelMap.has(did)) {
          promoLabelMap.set(did, offer.promoLabel);
        }
      }
    } else {
      for (const d of filtered) {
        if (!exclDrinkIds.has(d.id) && !promoLabelMap.has(d.id)) {
          promoLabelMap.set(d.id, offer.promoLabel);
        }
      }
    }
  }

  const drinksWithDetails = await Promise.all(
    filtered.map(async (d) => {
      // Always calculate detail (availability) to ensure the POS shows accurate Out of Stock badges.
      // Caching ensures this remains performant even for large lists.
      const detail = await buildDrinkDetail(d.id, targetBranchId);
      
      const { defaultPrice, cost } = await computeDefaultPrice(d.id, targetBranchId, queryPartnerId);
      const productDiscount = await resolveProductDiscount(d.id, targetBranchId, queryPartnerId);
      const promoLabel = promoLabelMap.get(d.id) ?? null;

      let basePrice = Number(d.basePrice);
      if (queryPartnerId) {
        if (targetBranchId) {
          const [row] = await db
            .select()
            .from(partnerDrinkPricesTable)
            .where(
              and(
                eq(partnerDrinkPricesTable.partnerId, queryPartnerId),
                eq(partnerDrinkPricesTable.drinkId, d.id),
                eq(partnerDrinkPricesTable.branchId, targetBranchId)
              )
            )
            .limit(1);
          if (row) basePrice = Number(row.price);
        }
        if (basePrice === Number(d.basePrice)) {
          const [row] = await db
            .select()
            .from(partnerDrinkPricesTable)
            .where(
              and(
                eq(partnerDrinkPricesTable.partnerId, queryPartnerId),
                eq(partnerDrinkPricesTable.drinkId, d.id),
                isNull(partnerDrinkPricesTable.branchId)
              )
            )
            .limit(1);
          if (row) basePrice = Number(row.price);
        }
      }
      if (basePrice === Number(d.basePrice) && targetBranchId) {
        const [row] = await db
          .select()
          .from(branchDrinkPricesTable)
          .where(
            and(
              eq(branchDrinkPricesTable.branchId, targetBranchId),
              eq(branchDrinkPricesTable.drinkId, d.id)
            )
          )
          .limit(1);
        if (row) basePrice = Number(row.price);
      }

      return { 
        ...d, 
        basePrice, 
        defaultPrice,
        cost,
        productDiscount,
        promoLabel,
        isAvailable: detail ? detail.isAvailable : true,
        unavailableReasons: detail ? detail.unavailableReasons : [],
        slots: (req.query.includeSlots === "true" || req.query.includeSlots === "1" || (params.success && !!params.data.includeSlots)) ? detail?.slots : undefined,
      };
    })
  );

  res.json(serializeDates(drinksWithDetails));
});

// GET /drinks/:id/recipe-cost — return detailed recipe ingredient cost breakdown
router.get("/drinks/:id/recipe-cost", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid drink ID" });
    return;
  }
  const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : null;
  const partnerId = req.query.partnerId ? parseInt(req.query.partnerId as string) : null;

  try {
    globalCache.clear();
    const costDetails = await getProductCost(id, branchId, partnerId);
    res.json(costDetails);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to calculate drink recipe cost" });
  }
});

router.post("/drinks", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const parsed = CreateDrinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { slots: slotDefs } = parsed.data;
  const drinkData = parsed.data;

  // Check for duplicate name
  const [existingDrink] = await db.select().from(drinksTable).where(eq(drinksTable.name, drinkData.name)).limit(1);
  if (existingDrink) {
    res.status(400).json({ error: `A drink with the name "${drinkData.name}" already exists.` });
    return;
  }

  // Sync legacy category string if categoryId is provided
  let categoryName = drinkData.category;
  if (drinkData.categoryId) {
    const [cat] = await db.select({ name: drinkCategoriesTable.name })
      .from(drinkCategoriesTable)
      .where(eq(drinkCategoriesTable.id, drinkData.categoryId));
    if (cat) categoryName = cat.name;
  }

  const [drink] = await db
    .insert(drinksTable)
    .values({
      name: drinkData.name,
      description: drinkData.description ?? null,
      category: categoryName,
      categoryId: (drinkData as any).categoryId ?? null,
      sortOrder: (drinkData as any).sortOrder ?? 0,
      basePrice: String(drinkData.basePrice),
      imageUrl: drinkData.imageUrl ?? null,
      isActive: drinkData.isActive ?? true,
      isFeatured: (drinkData as any).isFeatured ?? false,
      prepTimeSeconds: drinkData.prepTimeSeconds ?? 180,
      kitchenStation: drinkData.kitchenStation?.toLowerCase().replace(/\s+/g, '-') ?? "main",
      kitchenStationId: (drinkData as any).kitchenStationId ?? null,
    })
    .returning();

  if (slotDefs && slotDefs.length > 0) {
    await db.insert(drinkIngredientSlotsTable).values(
      slotDefs.map((s) => ({
        drinkId: drink.id,
        ingredientId: s.ingredientId ?? null,
        slotLabel: s.slotLabel,
        isRequired: s.isRequired ?? true,
        defaultOptionId: s.defaultOptionId ?? null,
        sortOrder: s.sortOrder ?? 0,
        baristaSortOrder: s.baristaSortOrder ?? s.sortOrder ?? 1,
        customerSortOrder: s.customerSortOrder ?? s.sortOrder ?? 1,
        affectsCupSize: s.affectsCupSize ?? null,
      }))
    );
  }

  const detail = await buildDrinkDetail(drink.id, (req.session as any).branchId);
  res.status(201).json(serializeDates(detail));
});

router.get("/drinks/:id", async (req, res): Promise<void> => {
  const params = GetDrinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const sessionUser = (req.session as any);
  const isAdmin = sessionUser?.role === "admin";
  const sessionBranchId = sessionUser?.branchId;

  const targetBranchId = (req.query.branchId && (isAdmin || !sessionBranchId))
    ? parseInt(req.query.branchId as string)
    : sessionBranchId;

  const detail = await buildDrinkDetail(params.data.id, targetBranchId);
  if (!detail) {
    res.status(404).json({ error: "Drink not found" });
    return;
  }

  // Note: we bypass GetDrinkResponse.parse() here because typed (catalog) slots
  // have null ingredientId/ingredient which the generated Zod schema doesn't accept.
  res.json(serializeDates(detail));
});

router.patch("/drinks/:id", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const params = UpdateDrinkParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateDrinkBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, any> = {};
  if (parsed.data.name !== undefined) {
    const [existing] = await db.select().from(drinksTable)
      .where(and(eq(drinksTable.name, parsed.data.name), sql`id != ${params.data.id}`))
      .limit(1);
    if (existing) {
      res.status(400).json({ error: `A drink with the name "${parsed.data.name}" already exists.` });
      return;
    }
    updateData.name = parsed.data.name;
  }
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  
  // Sync legacy category string if categoryId is provided
  if ((parsed.data as any).categoryId !== undefined) {
    const catId = (parsed.data as any).categoryId;
    updateData.categoryId = catId;
    if (catId) {
      const [cat] = await db.select({ name: drinkCategoriesTable.name })
        .from(drinkCategoriesTable)
        .where(eq(drinkCategoriesTable.id, catId));
      if (cat) updateData.category = cat.name;
    } else {
      updateData.category = "Uncategorized";
    }
  } else if (parsed.data.category !== undefined) {
    updateData.category = parsed.data.category;
  }

  if ((parsed.data as any).sortOrder !== undefined) updateData.sortOrder = (parsed.data as any).sortOrder;
  if (parsed.data.basePrice !== undefined) updateData.basePrice = String(parsed.data.basePrice);
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
  if ((parsed.data as any).isFeatured !== undefined) updateData.isFeatured = (parsed.data as any).isFeatured;
  if (parsed.data.prepTimeSeconds !== undefined) updateData.prepTimeSeconds = parsed.data.prepTimeSeconds;
  if (parsed.data.kitchenStation !== undefined) {
    updateData.kitchenStation = parsed.data.kitchenStation.toLowerCase().replace(/\s+/g, '-');
  }
  if ((parsed.data as any).kitchenStationId !== undefined) {
    updateData.kitchenStationId = (parsed.data as any).kitchenStationId;
  }

  const [drink] = await db.update(drinksTable).set(updateData).where(eq(drinksTable.id, params.data.id)).returning();
  if (!drink) { res.status(404).json({ error: "Drink not found" }); return; }

  // Invalidate cache
  globalCache.clearPrefix(`drink_detail_${params.data.id}`);
  globalCache.clearPrefix(`drink_default_price_${params.data.id}`);

  res.json(UpdateDrinkResponse.parse(serializeDates({ 
    ...drink, 
    basePrice: Number(drink.basePrice),
    categoryId: drink.categoryId ?? undefined
  })));
});

// POST /drinks/:id/image — upload a drink image
router.post("/drinks/:id/image", requirePermission("catalog:manage"), uploadSingleImage, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  if (!req.file) { res.status(400).json({ error: "No image file provided" }); return; }

  const imageUrl = `/uploads/${req.file.filename}`;
  const [drink] = await db
    .update(drinksTable)
    .set({ imageUrl })
    .where(eq(drinksTable.id, id))
    .returning();

  if (!drink) {
    // Clean up orphaned file
    fs.unlink(req.file.path, () => {});
    res.status(404).json({ error: "Drink not found" });
    return;
  }

  res.json({ imageUrl });
});

// PUT /drinks/:id/slots — replace all ingredient slots for a drink
// Supports both old-style (ingredientId) and new-style (ingredientTypeId + slotVolumes) slots
router.put("/drinks/:id/slots", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const idParsed = GetDrinkParams.safeParse(req.params);
  if (!idParsed.success) { res.status(400).json({ error: idParsed.error.message }); return; }
  const drinkId = idParsed.data.id;

  if (!Array.isArray(req.body)) {
    res.status(400).json({ error: "Body must be an array of slot definitions" });
    return;
  }

  const rawSlots = req.body as any[];
  for (const s of rawSlots) {
    const hasLegacy = typeof s.ingredientId === "number";
    const hasTyped = typeof s.ingredientTypeId === "number";
    const hasMultiType = Array.isArray(s.slotTypeOptions) && s.slotTypeOptions.length > 0;
    if (!hasLegacy && !hasTyped && !hasMultiType) {
      res.status(400).json({ error: "Each slot must have either ingredientId, ingredientTypeId, or slotTypeOptions" });
      return;
    }
    if (typeof s.slotLabel !== "string") {
      res.status(400).json({ error: "Each slot must have a string slotLabel" });
      return;
    }
  }

  const rawCupSizeMl = req.query.cupSizeMl as string | undefined;
  const rawCupIngId = req.query.cupIngredientId as string | undefined;

  const cupSizeMl = rawCupSizeMl !== undefined
    ? (rawCupSizeMl === "none" || rawCupSizeMl === "null" || rawCupSizeMl === "" ? null : parseInt(rawCupSizeMl))
    : undefined;

  const cupIngredientId = rawCupIngId !== undefined
    ? (rawCupIngId === "none" || rawCupIngId === "null" || rawCupIngId === "" ? null : parseInt(rawCupIngId))
    : undefined;

  const isCustomizable = req.query.isCustomizable !== undefined ? req.query.isCustomizable === "true" : undefined;

  if (cupSizeMl !== undefined || cupIngredientId !== undefined || isCustomizable !== undefined) {
    await db.update(drinksTable).set({ 
      ...(cupSizeMl !== undefined && { cupSizeMl }),
      ...(cupIngredientId !== undefined && { cupIngredientId }),
      ...(isCustomizable !== undefined && { isCustomizable }),
    }).where(eq(drinksTable.id, drinkId));
  }

  // --- Validate and Clean stale catalog references ---
  const typeIds = new Set<number>();
  const volIds = new Set<number>();
  rawSlots.forEach(s => {
    if (s.ingredientTypeId) typeIds.add(s.ingredientTypeId);
    if (Array.isArray(s.slotTypeOptions)) {
      s.slotTypeOptions.forEach((to: any) => {
        if (to.ingredientTypeId) typeIds.add(to.ingredientTypeId);
        if (Array.isArray(to.slotVolumes)) {
          to.slotVolumes.forEach((sv: any) => { if (sv.typeVolumeId) volIds.add(sv.typeVolumeId); });
        }
      });
    }
    if (Array.isArray(s.slotVolumes)) {
      s.slotVolumes.forEach((sv: any) => { if (sv.typeVolumeId) volIds.add(sv.typeVolumeId); });
    }
  });

  const [validTypes, validVolumes] = await Promise.all([
    typeIds.size > 0 
      ? db.select({ id: ingredientTypesTable.id }).from(ingredientTypesTable).where(and(inArray(ingredientTypesTable.id, Array.from(typeIds)), eq(ingredientTypesTable.isActive, true)))
      : Promise.resolve([]),
    volIds.size > 0
      ? db.select({ id: ingredientTypeVolumesTable.id, typeId: ingredientTypeVolumesTable.ingredientTypeId }).from(ingredientTypeVolumesTable).where(and(inArray(ingredientTypeVolumesTable.id, Array.from(volIds)), eq(ingredientTypeVolumesTable.isActive, true)))
      : Promise.resolve([]),
  ]);

  const validTypeSet = new Set(validTypes.map(t => t.id));
  const validVolMap = new Map(validVolumes.map(v => [v.id, v.typeId]));

  // Clean rawSlots to only keep active references
  const cleanedSlots = rawSlots.map(s => {
    const cleaned = { ...s };
    if (cleaned.ingredientTypeId && !validTypeSet.has(cleaned.ingredientTypeId)) cleaned.ingredientTypeId = null;
    
    if (Array.isArray(cleaned.slotTypeOptions)) {
      cleaned.slotTypeOptions = cleaned.slotTypeOptions.filter((to: any) => validTypeSet.has(to.ingredientTypeId));
      cleaned.slotTypeOptions.forEach((to: any) => {
        if (Array.isArray(to.slotVolumes)) {
          to.slotVolumes = to.slotVolumes.filter((sv: any) => {
            const parentTypeId = validVolMap.get(sv.typeVolumeId);
            return parentTypeId === to.ingredientTypeId;
          });
        }
      });
    }

    if (Array.isArray(cleaned.slotVolumes)) {
      cleaned.slotVolumes = cleaned.slotVolumes.filter((sv: any) => {
        const parentTypeId = validVolMap.get(sv.typeVolumeId);
        // If single type slot, check against that type
        return !cleaned.ingredientTypeId || parentTypeId === cleaned.ingredientTypeId;
      });
    }
    return cleaned;
  });

  // --- FRESH SAVE: Clear everything related to this drink ---
  const existingSlots = await db.select({ id: drinkIngredientSlotsTable.id })
    .from(drinkIngredientSlotsTable)
    .where(eq(drinkIngredientSlotsTable.drinkId, drinkId));
  
  if (existingSlots.length > 0) {
    const slotIds = existingSlots.map(s => s.id);
    // Explicitly delete children first (just in case cascade is off)
    await db.delete(drinkSlotVolumesTable).where(inArray(drinkSlotVolumesTable.slotId, slotIds));
    await db.delete(drinkSlotTypeOptionsTable).where(inArray(drinkSlotTypeOptionsTable.slotId, slotIds));
    // Delete parent slots
    await db.delete(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drinkId));
  }

  if (cleanedSlots.length > 0) {
    const insertedSlots = await db.insert(drinkIngredientSlotsTable).values(
      cleanedSlots.map((s: any, i: number) => ({
        drinkId,
        ingredientId: s.ingredientId ?? null,
        ingredientTypeId: s.ingredientTypeId ?? null,
        slotLabel: s.slotLabel,
        isRequired: s.isRequired ?? true,
        isDynamic: s.isDynamic ?? false,
        defaultOptionId: s.defaultOptionId ?? null,
        sortOrder: s.sortOrder ?? i,
        baristaSortOrder: s.baristaSortOrder ?? s.sortOrder ?? 1,
        customerSortOrder: s.customerSortOrder ?? s.sortOrder ?? 1,
        affectsCupSize: s.affectsCupSize ?? null,
        predefinedSlotId: s.predefinedSlotId ?? null,
      }))
    ).returning();

    // Insert slot type options and volume overrides for new-style slots
    const slotTypeOptionRows: any[] = [];
    const slotVolumeRows: any[] = [];

    for (let i = 0; i < cleanedSlots.length; i++) {
      const s = cleanedSlots[i];
      const slot = insertedSlots[i];

      // --- New multi-type-option style ---
      if (Array.isArray(s.slotTypeOptions) && s.slotTypeOptions.length > 0) {
        for (let j = 0; j < s.slotTypeOptions.length; j++) {
          const to = s.slotTypeOptions[j];
          if (!to.ingredientTypeId) continue;
          slotTypeOptionRows.push({
            slotId: slot.id,
            ingredientTypeId: to.ingredientTypeId,
            isDefault: to.isDefault ?? j === 0,
            sortOrder: to.sortOrder ?? j,
            processedQty: to.processedQty ?? null,
            producedQty: to.producedQty ?? null,
            unit: to.unit ?? null,
            extraCost: to.extraCost ?? null,
            pricingMode: to.pricingMode ?? null,
          });
          // Volume overrides per type option (all keyed by slotId + typeVolumeId)
          if (Array.isArray(to.slotVolumes)) {
            for (const sv of to.slotVolumes) {
              if (!sv.typeVolumeId) continue;
              slotVolumeRows.push({
                slotId: slot.id,
                typeVolumeId: sv.typeVolumeId,
                processedQty: sv.processedQty ?? null,
                producedQty: sv.producedQty ?? null,
                unit: sv.unit ?? null,
                extraCost: sv.extraCost ?? null,
                isDefault: sv.isDefault ?? false,
                isEnabled: sv.isEnabled ?? true,
                sortOrder: sv.sortOrder ?? 0,
              });
            }
          }
        }
      }
      // --- Legacy single-type style (backward compat) ---
      else if (s.ingredientTypeId && Array.isArray(s.slotVolumes)) {
        for (const sv of s.slotVolumes) {
          if (!sv.typeVolumeId) continue;
          slotVolumeRows.push({
            slotId: slot.id,
            typeVolumeId: sv.typeVolumeId,
            processedQty: sv.processedQty ?? null,
            producedQty: sv.producedQty ?? null,
            unit: sv.unit ?? null,
            extraCost: sv.extraCost ?? null,
            isDefault: sv.isDefault ?? false,
            isEnabled: sv.isEnabled ?? true,
            sortOrder: sv.sortOrder ?? 0,
          });
        }
      }
    }

    if (slotTypeOptionRows.length > 0) {
      await db.insert(drinkSlotTypeOptionsTable).values(slotTypeOptionRows);
    }
    if (slotVolumeRows.length > 0) {
      await db.insert(drinkSlotVolumesTable).values(slotVolumeRows);
    }
  }

  const detail = await buildDrinkDetail(drinkId, (req.session as any).branchId);
  if (!detail) { res.status(404).json({ error: "Drink not found" }); return; }
  
  // Invalidate cache
  globalCache.clearPrefix(`drink_detail_${drinkId}`);
  globalCache.clearPrefix(`drink_default_price_${drinkId}`);
  
  res.json(serializeDates(detail));
});

router.delete("/drinks/:id", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const params = DeleteDrinkParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  
  try {
    const [drink] = await db.delete(drinksTable).where(eq(drinksTable.id, params.data.id)).returning();
    if (!drink) { res.status(404).json({ error: "Drink not found" }); return; }
    res.sendStatus(204);
  } catch (error: any) {
    // Handling foreign key constraint (Postgres error 23503)
    // Drizzle often wraps the DB error in a 'cause' property
    const isForeignKeyError = 
      error.code === "23503" || 
      error.cause?.code === "23503" ||
      error.message?.includes("foreign key constraint") ||
      error.cause?.message?.includes("foreign key constraint");

    if (isForeignKeyError) {
      res.status(400).json({ 
        error: "Cannot delete drink with order history. Please deactivate it instead to hide it from the menu." 
      });
    } else {
      console.error("Delete Error:", error);
      res.status(500).json({ error: "Failed to delete drink" });
    }
  }
});

router.post("/drinks/:id/price", async (req, res): Promise<void> => {
  const params = CalculateDrinkPriceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  // Accept both legacy (ingredientId+optionId) and catalog (ingredientTypeId+typeVolumeId) selections.
  const rawBody = req.body as { selections?: unknown[] };
  if (!rawBody?.selections || !Array.isArray(rawBody.selections)) {
    res.status(400).json({ error: "selections must be an array" });
    return;
  }
  const parsed = { data: { selections: rawBody.selections as any[] } };

  const sessionUser = (req.session as any);
  const isAdmin = sessionUser?.role === "admin";
  const sessionBranchId = sessionUser?.branchId;

  // Allow branchId in query or body for price calculation
  const bodyBranchId = (req.body as any).branchId;
  const queryBranchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
  
  const targetBranchId = (isAdmin || !sessionBranchId) 
    ? (queryBranchId || bodyBranchId || sessionBranchId) 
    : sessionBranchId;

  try {
    const data = await calculateDrinkData(params.data.id, parsed.data.selections, targetBranchId);
    
    // Format extras for the response (without revealing backend schema complexities if not needed)
    // The previous implementation mapped them out, we can return the Customizations
    const extras = data.customizations.map(c => ({
      ingredientId: c.ingredientId,
      ingredientTypeId: c.ingredientTypeId,
      slotLabel: c.slotLabel,
      optionLabel: c.optionLabel,
      extraCost: c.addedCost,
      producedQty: c.producedQty,
      color: c.color,
      consumedQty: c.consumedQty
    }));

    res.json({ 
      basePrice: data.basePrice, 
      extras, 
      dynamicInfo: data.dynamicInfo, 
      total: data.totalPrice 
    });
  } catch (error: any) {
    console.error("Calculate Error:", error);
    if (error.message === "Drink not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }});

// GET /drinks/:id/stock-usage — list all inventory items linked to this drink
router.get("/drinks/:id/stock-usage", requirePermission("catalog:view"), async (req, res): Promise<void> => {
  const idParsed = GetDrinkParams.safeParse(req.params);
  if (!idParsed.success) { res.status(400).json({ error: idParsed.error.message }); return; }
  const drinkId = idParsed.data.id;

  console.log(`[StockUsage-Debug] Fetching usage for drinkId: ${drinkId}`);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const drink = await db.select().from(drinksTable).where(eq(drinksTable.id, drinkId)).limit(1).then(r => r[0]);
  if (!drink) {
    res.status(404).json({ error: "Drink not found" });
    return;
  }

  // Check for duplicates with the same name
  const duplicates = await db.select().from(drinksTable).where(eq(drinksTable.name, drink.name));
  if (duplicates.length > 1) {
    console.warn(`[DEBUG-TRACE] WARNING: Found ${duplicates.length} drinks with name "${drink.name}". IDs: ${duplicates.map(d => d.id).join(", ")}`);
  }
  console.log(`[DEBUG-TRACE] DRINK NAME: "${drink.name}" (ID: ${drink.id})`);

  const usage: any[] = [];
  
  // 1. Cup Ingredient
  if (drink.cupIngredientId) {
    const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, drink.cupIngredientId));
    if (ing) {
      usage.push({
        type: "cup",
        slotLabel: "Cup",
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        qty: 1
      });
    }
  }

  // 2. Slots
  const slots = await db
    .select()
    .from(drinkIngredientSlotsTable)
    .where(eq(drinkIngredientSlotsTable.drinkId, drinkId))
    .orderBy(asc(drinkIngredientSlotsTable.sortOrder), asc(drinkIngredientSlotsTable.id));

  // Pre-calculate volume consumed by non-dynamic slots to compute dynamic fill volume (if cupSizeMl is set)
  let nonDynamicVolumeMl = 0;
  for (const slot of slots) {
    if (slot.isDynamic) continue;

    const slotTypeOpts = await db.select().from(drinkSlotTypeOptionsTable).where(and(eq(drinkSlotTypeOptionsTable.slotId, slot.id), eq(drinkSlotTypeOptionsTable.isDefault, true)));
    let defOptTypeId = slotTypeOpts[0]?.ingredientTypeId ?? slot.ingredientTypeId;

    if (!defOptTypeId && slot.predefinedSlotId) {
      const templateOpts = await db.select().from(predefinedSlotTypeOptionsTable).where(and(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId), eq(predefinedSlotTypeOptionsTable.isDefault, true)));
      defOptTypeId = templateOpts[0]?.ingredientTypeId ?? null;
    }

    if (defOptTypeId) {
      const slotVols = await db.select().from(drinkSlotVolumesTable).where(and(eq(drinkSlotVolumesTable.slotId, slot.id), eq(drinkSlotVolumesTable.isDefault, true)));
      let volProduced = 0;
      let volProcessed = 0;
      if (slotVols.length > 0) {
        const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, slotVols[0].typeVolumeId));
        volProduced = Number(slotVols[0].producedQty || typeVol?.producedQty || 0);
        volProcessed = Number(slotVols[0].processedQty || typeVol?.processedQty || 0);
      } else {
        const typeVols = await db.select().from(ingredientTypeVolumesTable).where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, defOptTypeId), eq(ingredientTypeVolumesTable.isActive, true))).orderBy(asc(ingredientTypeVolumesTable.sortOrder));
        const defVol = typeVols.find(v => v.isDefault) ?? typeVols[0];
        if (defVol) {
          volProduced = Number(defVol.producedQty || 0);
          volProcessed = Number(defVol.processedQty || 0);
        }
      }
      nonDynamicVolumeMl += volProduced > 0 ? volProduced : volProcessed;
    }
  }

  const dynamicFillMl = (drink.cupSizeMl && drink.cupSizeMl > 0) ? Math.max(0, drink.cupSizeMl - nonDynamicVolumeMl) : 0;

  for (const slot of slots) {
    // Collect ALL options for this slot including 'None' (where inventoryIngredientId is null)
    let rawOptions: Array<{
      ingredientTypeId: number | null;
      inventoryIngredientId: number | null;
      processedQty: number;
      isDefault: boolean;
      isNone: boolean;
      typeName: string;
      source: string;
    }> = [];

    // A. Slot type options
    const slotTypeOpts = await db
      .select()
      .from(drinkSlotTypeOptionsTable)
      .where(eq(drinkSlotTypeOptionsTable.slotId, slot.id))
      .orderBy(asc(drinkSlotTypeOptionsTable.sortOrder), asc(drinkSlotTypeOptionsTable.id));
      
    for (const to of slotTypeOpts) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, to.ingredientTypeId));
      const typeName = ingType?.name ?? "";
      const isNone = typeName.toLowerCase() === "none" || typeName.toLowerCase() === "no " + slot.slotLabel.toLowerCase() || !ingType?.inventoryIngredientId;
      rawOptions.push({
        ingredientTypeId: to.ingredientTypeId,
        inventoryIngredientId: ingType?.inventoryIngredientId ?? null,
        processedQty: Number(to.processedQty || ingType?.processedQty || 0),
        isDefault: !!to.isDefault,
        isNone,
        typeName,
        source: "typed-option"
      });
    }

    // B. Predefined template options
    if (rawOptions.length === 0 && slot.predefinedSlotId) {
      const templateOpts = await db
        .select()
        .from(predefinedSlotTypeOptionsTable)
        .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId))
        .orderBy(asc(predefinedSlotTypeOptionsTable.sortOrder), asc(predefinedSlotTypeOptionsTable.id));
        
      for (const tto of templateOpts) {
        const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, tto.ingredientTypeId));
        const typeName = ingType?.name ?? "";
        const isNone = typeName.toLowerCase() === "none" || typeName.toLowerCase() === "no " + slot.slotLabel.toLowerCase() || !ingType?.inventoryIngredientId;
        rawOptions.push({
          ingredientTypeId: tto.ingredientTypeId,
          inventoryIngredientId: ingType?.inventoryIngredientId ?? null,
          processedQty: Number(tto.processedQty || ingType?.processedQty || 0),
          isDefault: !!tto.isDefault,
          isNone,
          typeName,
          source: "typed-template"
        });
      }
    }

    // C. Direct type
    if (rawOptions.length === 0 && slot.ingredientTypeId) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, slot.ingredientTypeId));
      const typeName = ingType?.name ?? "";
      const isNone = typeName.toLowerCase() === "none" || !ingType?.inventoryIngredientId;
      rawOptions.push({
        ingredientTypeId: slot.ingredientTypeId,
        inventoryIngredientId: ingType?.inventoryIngredientId ?? null,
        processedQty: Number(ingType?.processedQty || 0),
        isDefault: true,
        isNone,
        typeName,
        source: "typed-catalog"
      });
    }

    // D. Legacy ingredient
    if (rawOptions.length === 0 && (slot as any).defaultOptionId) {
      const [opt] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, (slot as any).defaultOptionId));
      if (opt) {
        rawOptions.push({
          ingredientTypeId: null,
          inventoryIngredientId: opt.ingredientId,
          processedQty: Number(opt.processedQty || 0),
          isDefault: true,
          isNone: false,
          typeName: opt.label,
          source: "legacy-option"
        });
      }
    } else if (rawOptions.length === 0 && slot.ingredientId) {
      rawOptions.push({
        ingredientTypeId: null,
        inventoryIngredientId: slot.ingredientId,
        processedQty: 0,
        isDefault: true,
        isNone: false,
        typeName: slot.slotLabel,
        source: "legacy"
      });
    }

    if (rawOptions.length === 0) continue;

    // Default Option Fallback Rule: If no option has isDefault === true, consider the FIRST option as default across ALL options (including None)
    const hasExplicitDefaultOpt = rawOptions.some(o => o.isDefault);
    if (!hasExplicitDefaultOpt && rawOptions.length > 0) {
      rawOptions[0].isDefault = true;
    }

    const defaultOptionObj = rawOptions.find(o => o.isDefault) || rawOptions[0];
    const isDefaultNone = defaultOptionObj.isNone;

    const validInventoryOptions = rawOptions.filter(o => o.inventoryIngredientId !== null);
    if (validInventoryOptions.length === 0) continue;

    // Default Volume Fallback Rule: Find default volume processedQty for an ingredientType
    const getDefaultVolumeQtyForType = async (typeId: number | null): Promise<number> => {
      if (!typeId) return 0;

      const slotVols = await db.select().from(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id)).orderBy(asc(drinkSlotVolumesTable.sortOrder), asc(drinkSlotVolumesTable.id));
      const volsForType: number[] = [];

      for (const sv of slotVols) {
        const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, sv.typeVolumeId));
        if (typeVol && typeVol.ingredientTypeId === typeId) {
          const qty = Number(sv.processedQty || typeVol.processedQty || 0);
          if (sv.isDefault && qty > 0) return qty;
          if (qty > 0) volsForType.push(qty);
        }
      }

      if (slot.predefinedSlotId) {
        const templateVols = await db.select().from(predefinedSlotVolumesTable).where(eq(predefinedSlotVolumesTable.predefinedSlotId, slot.predefinedSlotId)).orderBy(asc(predefinedSlotVolumesTable.sortOrder), asc(predefinedSlotVolumesTable.id));
        for (const tv of templateVols) {
          const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, tv.typeVolumeId));
          if (typeVol && typeVol.ingredientTypeId === typeId) {
            const qty = Number(tv.processedQty || typeVol.processedQty || 0);
            if (tv.isDefault && qty > 0) return qty;
            if (qty > 0) volsForType.push(qty);
          }
        }
      }

      const typeVols = await db.select().from(ingredientTypeVolumesTable).where(and(eq(ingredientTypeVolumesTable.ingredientTypeId, typeId), eq(ingredientTypeVolumesTable.isActive, true))).orderBy(asc(ingredientTypeVolumesTable.sortOrder), asc(ingredientTypeVolumesTable.id));
      for (const tv of typeVols) {
        const qty = Number(tv.processedQty || 0);
        if (tv.isDefault && qty > 0) return qty;
        if (qty > 0) volsForType.push(qty);
      }

      // If no volume is set as default, consider the FIRST volume as default
      if (volsForType.length > 0) return volsForType[0];

      return 0;
    };

    // Calculate default option quantity for the slot
    let defaultOptionQty = defaultOptionObj && !defaultOptionObj.isNone ? defaultOptionObj.processedQty : 0;
    if (defaultOptionQty === 0 && defaultOptionObj?.ingredientTypeId && !defaultOptionObj.isNone) {
      defaultOptionQty = await getDefaultVolumeQtyForType(defaultOptionObj.ingredientTypeId);
    }

    // Resolve final quantities for each option
    for (const opt of validInventoryOptions) {
      let finalQty = opt.processedQty;

      if (finalQty <= 0) {
        if (defaultOptionQty > 0) {
          finalQty = defaultOptionQty;
        } else {
          const defVolQty = await getDefaultVolumeQtyForType(opt.ingredientTypeId);
          if (defVolQty > 0) {
            finalQty = defVolQty;
          } else if (slot.isDynamic && dynamicFillMl > 0) {
            finalQty = dynamicFillMl;
          }
        }
      }

      const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, opt.inventoryIngredientId!));
      if (!ing) continue;

      // If the slot's default option is 'None', this inventory item is NOT default!
      const effectiveIsDefault = isDefaultNone ? false : opt.isDefault;

      const existingIdx = usage.findIndex(u => u.ingredientId === ing.id && u.slotLabel === slot.slotLabel);
      if (existingIdx !== -1) {
        if (usage[existingIdx].qty === 0 && finalQty > 0) {
          usage[existingIdx].qty = finalQty;
        }
        if (!usage[existingIdx].isDefault && effectiveIsDefault) {
          usage[existingIdx].isDefault = true;
        }
      } else {
        usage.push({
          type: opt.source,
          slotLabel: slot.slotLabel,
          ingredientId: ing.id,
          ingredientName: ing.name,
          unit: ing.unit,
          qty: finalQty,
          isDefault: effectiveIsDefault
        });
      }
    }
  }

  res.json(usage);
});

// ── Branch & Partner Drink Availability Admin Endpoints ──────────────────────
router.get("/admin/drinks/availability", requirePermission("drinks:manage"), async (req, res) => {
  const branchStatuses = await db.select().from(branchDrinkStatusTable);
  const partnerStatuses = await db.select().from(partnerDrinkStatusTable);
  res.json({ branchStatuses, partnerStatuses });
});

router.post("/admin/drinks/branch-status", requirePermission("drinks:manage"), async (req, res) => {
  const { branchId, drinkId, isActive } = req.body;
  if (!branchId || !drinkId || isActive === undefined) {
    res.status(400).json({ error: "Invalid branchId, drinkId, or isActive value" });
    return;
  }
  const targetBranchId = Number(branchId);
  const targetDrinkId = Number(drinkId);
  if (isNaN(targetBranchId) || isNaN(targetDrinkId)) {
    res.status(400).json({ error: "Invalid branchId or drinkId" });
    return;
  }

  const [existing] = await db
    .select()
    .from(branchDrinkStatusTable)
    .where(and(eq(branchDrinkStatusTable.branchId, targetBranchId), eq(branchDrinkStatusTable.drinkId, targetDrinkId)))
    .limit(1);

  if (existing) {
    await db
      .update(branchDrinkStatusTable)
      .set({ isActive: Boolean(isActive), updatedAt: new Date() })
      .where(eq(branchDrinkStatusTable.id, existing.id));
  } else {
    await db.insert(branchDrinkStatusTable).values({
      branchId: targetBranchId,
      drinkId: targetDrinkId,
      isActive: Boolean(isActive),
    });
  }
  globalCache.clear();
  res.json({ success: true });
});

router.post("/admin/drinks/partner-status", requirePermission("drinks:manage"), async (req, res) => {
  const { partnerId, drinkId, branchId, isActive } = req.body;
  if (!partnerId || !drinkId || isActive === undefined) {
    res.status(400).json({ error: "Invalid partnerId, drinkId, or isActive value" });
    return;
  }
  const targetPartnerId = Number(partnerId);
  const targetDrinkId = Number(drinkId);
  if (isNaN(targetPartnerId) || isNaN(targetDrinkId)) {
    res.status(400).json({ error: "Invalid partnerId or drinkId" });
    return;
  }

  const targetBranchId = branchId ? Number(branchId) : null;
  const conditions = [
    eq(partnerDrinkStatusTable.partnerId, targetPartnerId),
    eq(partnerDrinkStatusTable.drinkId, targetDrinkId),
  ];
  if (targetBranchId) {
    conditions.push(eq(partnerDrinkStatusTable.branchId, targetBranchId));
  } else {
    conditions.push(isNull(partnerDrinkStatusTable.branchId));
  }

  const [existing] = await db.select().from(partnerDrinkStatusTable).where(and(...conditions)).limit(1);

  if (existing) {
    await db
      .update(partnerDrinkStatusTable)
      .set({ isActive: Boolean(isActive), updatedAt: new Date() })
      .where(eq(partnerDrinkStatusTable.id, existing.id));
  } else {
    await db.insert(partnerDrinkStatusTable).values({
      partnerId: targetPartnerId,
      drinkId: targetDrinkId,
      branchId: targetBranchId,
      isActive: Boolean(isActive),
    });
  }
  globalCache.clear();
  res.json({ success: true });
});

export default router;
