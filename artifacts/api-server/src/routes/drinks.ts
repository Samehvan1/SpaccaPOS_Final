import { Router, type IRouter } from "express";
import { eq, and, inArray, asc, sql } from "drizzle-orm";
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
} from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { globalCache } from "../lib/cache";
import { requirePermission } from "../middleware/permissions";

// ── Image upload: store in <cwd>/uploads/ ────────────────────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `drink-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
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

            const volumes = globalTypeVolumes.map((tv) => {
              const override = slotVolumeMap.get(tv.id);
              const templateDef = templateVolumeMap.get(tv.id);
              const vol = volMap.get(tv.volumeId);
              
              return {
                id: tv.id,
                volumeId: tv.volumeId,
                volumeName: vol?.name ?? "",
                processedQty: Number(override?.processedQty ?? templateDef?.processedQty ?? tv.processedQty ?? vol?.processedQty ?? 0),
                producedQty: Number(override?.producedQty ?? templateDef?.producedQty ?? tv.producedQty ?? vol?.producedQty ?? 0),
                unit: override?.unit ?? templateDef?.unit ?? tv.unit ?? vol?.unit ?? "ml",
                extraCost: Number(override?.extraCost ?? templateDef?.extraCost ?? tv.extraCost),
                isDefault: override?.isDefault ?? templateDef?.isDefault ?? tv.isDefault,
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
        ).then(options => options.filter(o => o.typeName !== ""));

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

        const enrichedOptions = await Promise.all(
          options.map(async (o) => {
            let linkedIngredient: { id: number; name: string; options: any[] } | null = null;
            if (o.linkedIngredientId) {
              const [linked] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, o.linkedIngredientId));
              if (linked) {
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
        );

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

async function computeDefaultPrice(drinkId: number): Promise<number> {
  const cacheKey = `drink_default_price_${drinkId}`;
  const cached = globalCache.get<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    const data = await calculateDrinkData(drinkId, []);
    globalCache.set(cacheKey, data.totalPrice);
    return data.totalPrice;
  } catch (error) {
    console.error(`Error computing default price for drink ${drinkId}:`, error);
    return 0;
  }
}

router.get("/drinks", async (req, res): Promise<void> => {
  const params = ListDrinksQueryParams.safeParse(req.query);
  const sessionUser = (req.session as any);
  const sessionBranchId = sessionUser.branchId;
  const isAdmin = sessionUser.role === "admin";
  
  // Use session branch by default, but allow query override for admins OR if no session exists (Kiosk/Public)
  const targetBranchId = (req.query.branchId && (isAdmin || !sessionBranchId))
    ? parseInt(req.query.branchId as string)
    : sessionBranchId;

  const conditions = [];
  if (params.success && params.data.active !== undefined) {
    conditions.push(eq(drinksTable.isActive, params.data.active));
  }

  const drinks = conditions.length
    ? await db.select().from(drinksTable).where(and(...conditions))
    : await db.select().from(drinksTable);

  let filtered = drinks;
  if (params.success && params.data.category) {
    filtered = drinks.filter((d) => d.category === params.data.category);
  }

  filtered = [...filtered].sort((a, b) => {
    const sortA = a.sortOrder ?? 0;
    const sortB = b.sortOrder ?? 0;
    if (sortA !== sortB) return sortA - sortB;
    return a.name.localeCompare(b.name);
  });

  const drinksWithDetails = await Promise.all(
    filtered.map(async (d) => {
      // Always calculate detail (availability) to ensure the POS shows accurate Out of Stock badges.
      // Caching ensures this remains performant even for large lists.
      const detail = await buildDrinkDetail(d.id, targetBranchId);
      
      const defaultPrice = await computeDefaultPrice(d.id);
      return { 
        ...d, 
        basePrice: Number(d.basePrice), 
        defaultPrice,
        isAvailable: detail ? detail.isAvailable : true,
        unavailableReasons: detail ? detail.unavailableReasons : [],
        slots: (params.success && params.data.includeSlots) ? detail?.slots : undefined,
      };
    })
  );

  res.json(serializeDates(drinksWithDetails));
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
router.post("/drinks/:id/image", requirePermission("catalog:manage"), upload.single("image"), async (req, res): Promise<void> => {
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

  const cupSizeMl = req.query.cupSizeMl ? parseInt(req.query.cupSizeMl as string) : undefined;
  const cupIngredientId = req.query.cupIngredientId ? parseInt(req.query.cupIngredientId as string) : undefined;
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

import { calculateDrinkData } from "../lib/price-calculator";

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
  const slots = await db.select().from(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drinkId));
  console.log(`[StockUsage-Debug] Found ${slots.length} slots for drinkId ${drinkId}`);
  
  for (const slot of slots) {
    console.log(`***************************************************`);
    console.log(`[DEBUG-TRACE] SLOT: "${slot.slotLabel}" (ID: ${slot.id})`);
    console.log(`[DEBUG-TRACE]   - ingredientId: ${slot.ingredientId}`);
    console.log(`[DEBUG-TRACE]   - ingredientTypeId: ${slot.ingredientTypeId}`);
    console.log(`[DEBUG-TRACE]   - predefinedSlotId: ${slot.predefinedSlotId}`);
    console.log(`[DEBUG-TRACE]   - defaultOptionId: ${(slot as any).defaultOptionId}`);
    
    // Track unique ingredient IDs for this slot to avoid duplicates
    const seenIngredients = new Set<number>();

    const addUsage = (ing: any, type: string, label: string, qty: number, isDefault = false) => {
      console.log(`[DEBUG-TRACE]   !!! MATCH FOUND !!! -> ${ing.name} via ${type} (qty: ${qty})`);
      if (seenIngredients.has(ing.id)) return;
      seenIngredients.add(ing.id);
      usage.push({
        type,
        slotLabel: label,
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        qty: qty,
        isDefault
      });
    };

    // A. Direct Ingredient (Legacy)
    if (slot.ingredientId) {
      const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, slot.ingredientId));
      if (ing) addUsage(ing, "legacy", slot.slotLabel, 0, true);
    }

    // A2. Default Option (Legacy)
    if ((slot as any).defaultOptionId) {
      const [opt] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, (slot as any).defaultOptionId));
      if (opt) {
        const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, opt.ingredientId));
        if (ing) addUsage(ing, "legacy-option", slot.slotLabel, Number(opt.processedQty || 0), true);
      }
    }

    // B. Direct Type (Catalog)
    if (slot.ingredientTypeId) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, slot.ingredientTypeId));
      if (ingType?.inventoryIngredientId) {
        const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
        if (ing) addUsage(ing, "typed-catalog", slot.slotLabel, Number(ingType.processedQty || 0), true);
      }
    }

    // C. Slot-Specific Type Options (Multi-type)
    const typeOptions = await db.select().from(drinkSlotTypeOptionsTable).where(eq(drinkSlotTypeOptionsTable.slotId, slot.id));
    for (const to of typeOptions) {
      const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, to.ingredientTypeId));
      if (ingType?.inventoryIngredientId) {
        const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
        if (ing) addUsage(ing, "typed-option", slot.slotLabel, Number(to.processedQty || ingType.processedQty || 0), !!to.isDefault);
      }
    }

    // D. Slot-Specific Volumes
    const slotVolumes = await db.select().from(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id));
    for (const sv of slotVolumes) {
      const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, sv.typeVolumeId));
      if (typeVol) {
        const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, typeVol.ingredientTypeId));
        if (ingType?.inventoryIngredientId) {
          const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
          if (ing) addUsage(ing, "typed-volume", slot.slotLabel, Number(sv.processedQty || typeVol.processedQty || 0), !!sv.isDefault);
        }
      }
    }

    // E. Template Options (Predefined)
    if (slot.predefinedSlotId) {
      const templateOptions = await db.select().from(predefinedSlotTypeOptionsTable).where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId));
      for (const tto of templateOptions) {
        const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, tto.ingredientTypeId));
        if (ingType?.inventoryIngredientId) {
          const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
          if (ing) addUsage(ing, "typed-template", slot.slotLabel + " (Template)", Number(tto.processedQty || ingType.processedQty || 0), !!tto.isDefault);
        }
      }

      // F. Template Volumes (Predefined)
      const templateVolumes = await db.select().from(predefinedSlotVolumesTable).where(eq(predefinedSlotVolumesTable.predefinedSlotId, slot.predefinedSlotId));
      for (const tv of templateVolumes) {
        const [typeVol] = await db.select().from(ingredientTypeVolumesTable).where(eq(ingredientTypeVolumesTable.id, tv.typeVolumeId));
        if (typeVol) {
          const [ingType] = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.id, typeVol.ingredientTypeId));
          if (ingType?.inventoryIngredientId) {
            const [ing] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, ingType.inventoryIngredientId));
            if (ing) addUsage(ing, "typed-template-vol", slot.slotLabel + " (Template)", Number(tv.processedQty || typeVol.processedQty || 0), !!tv.isDefault);
          }
        }
      }
    }
  }

  res.json(usage);
});

export default router;
