import { Router, type IRouter } from "express";
import { eq, and, inArray, asc } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  db,
  drinksTable,
  drinkIngredientSlotsTable,
  drinkSlotVolumesTable,
  drinkSlotTypeOptionsTable,
  ingredientsTable,
  ingredientOptionsTable,
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  ingredientVolumesTable,
  ingredientCategoriesTable,
  predefinedSlotsTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable,
} from "@workspace/db";
import { serializeDates } from "../lib/serialize";

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

async function buildDrinkDetail(drinkId: number) {
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
        .where(eq(ingredientTypeVolumesTable.ingredientTypeId, typeId))
        .orderBy(ingredientTypeVolumesTable.sortOrder)
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
        processedQty: parseFloat(override?.processedQty ?? tv.processedQty ?? vol?.processedQty ?? "0"),
        producedQty: parseFloat(override?.producedQty ?? tv.producedQty ?? vol?.producedQty ?? "0"),
        unit: override?.unit ?? tv.unit ?? vol?.unit ?? "ml",
        extraCost: parseFloat(override?.extraCost ?? tv.extraCost),
        isDefault: override?.isDefault ?? tv.isDefault,
        isEnabled: override?.isEnabled ?? true,
        sortOrder: override?.sortOrder ?? tv.sortOrder,
        affectsCupSize: typeDef?.affectsCupSize ?? true,
        hasSlotOverride: !!override,
      };
    }).filter((v) => v.isEnabled);
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
          // Inherit template properties (can be overridden by slot fields if they were non-null, but here we assume template wins for standard fields)
          effectiveSlot.slotLabel = template.slotLabel;
          effectiveSlot.isRequired = template.isRequired;
          effectiveSlot.isDynamic = template.isDynamic;
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

      // Multi-type OR template-based OR single-type
      let effectiveTypeOptions = typeOptions;
      
      // If we have a template but no drink-specific options yet, 
      // or if we want to show all template options as available for selection:
      // Actually, for the API response, we return what is ACTIVE.
      // If it's a template, we only show those in typeOptions (whitelisted).
      
      if (effectiveTypeOptions.length === 0 && !slot.predefinedSlotId && slot.ingredientTypeId) {
        effectiveTypeOptions = [{ id: 0, slotId: slot.id, ingredientTypeId: slot.ingredientTypeId, isDefault: true, sortOrder: 0 }];
      }

      if (effectiveTypeOptions.length > 0 || (slot.predefinedSlotId && templateTypeOptions.length > 0)) {
        // Resolve Type Options
        // If it's a template, we might want to return ALL template options but marked as enabled/disabled?
        // No, POS usually only wants enabled ones. Admin will fetch template separately.
        
        const typeOptionsWithVolumes = await Promise.all(
          effectiveTypeOptions.map(async (to) => {
            const [ingType] = await db.select().from(ingredientTypesTable)
              .where(eq(ingredientTypesTable.id, to.ingredientTypeId));
            const [category] = ingType
              ? await db.select().from(ingredientCategoriesTable)
                  .where(eq(ingredientCategoriesTable.id, ingType.categoryId))
              : [null];
              
            // Volumes: merge slot-level overrides with template-level defaults or global type defaults
            const globalTypeVolumes = await db.select().from(ingredientTypeVolumesTable)
              .where(eq(ingredientTypeVolumesTable.ingredientTypeId, to.ingredientTypeId))
              .orderBy(ingredientTypeVolumesTable.sortOrder);
              
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
                processedQty: parseFloat(override?.processedQty ?? templateDef?.processedQty ?? tv.processedQty ?? vol?.processedQty ?? "0"),
                producedQty: parseFloat(override?.producedQty ?? templateDef?.producedQty ?? tv.producedQty ?? vol?.producedQty ?? "0"),
                unit: override?.unit ?? templateDef?.unit ?? tv.unit ?? vol?.unit ?? "ml",
                extraCost: parseFloat(override?.extraCost ?? templateDef?.extraCost ?? tv.extraCost),
                isDefault: override?.isDefault ?? templateDef?.isDefault ?? tv.isDefault,
                isEnabled: override?.isEnabled ?? templateDef?.isEnabled ?? true,
                sortOrder: override?.sortOrder ?? templateDef?.sortOrder ?? tv.sortOrder,
                affectsCupSize: typeDef?.affectsCupSize ?? true,
                hasSlotOverride: !!override,
              };
            }).filter((v) => v.isEnabled);

            return {
              typeOptionId: to.id,
              ingredientTypeId: to.ingredientTypeId,
              typeName: ingType?.name ?? "",
              categoryName: category?.name ?? "",
              isDefault: to.isDefault,
              sortOrder: to.sortOrder,
              volumes,
            };
          })
        );

        return {
          ...effectiveSlot,
          slotStyle: "typed" as const,
          typeOptions: typeOptionsWithVolumes,
          // Legacy compat fields
          ingredient: null,
          volumes: typeOptionsWithVolumes[0]?.volumes ?? [],
          ingredientType: null,
        };
      }

      // ── Old-style slot: ingredientId set ─────────────────────────────────
      if (!slot.ingredientId) return { ...effectiveSlot, slotStyle: "legacy" as const, ingredient: null, volumes: [] };

      const [ingredient] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, slot.ingredientId));
      const options = await db
        .select()
        .from(ingredientOptionsTable)
        .where(eq(ingredientOptionsTable.ingredientId, slot.ingredientId))
        .orderBy(ingredientOptionsTable.sortOrder);

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
                  processedQty: parseFloat(lo.processedQty),
                  producedQty: parseFloat(lo.producedQty),
                  extraCost: parseFloat(lo.extraCost),
                })),
              };
            }
          }
          return {
            ...o,
            processedQty: parseFloat(o.processedQty),
            producedQty: parseFloat(o.producedQty),
            extraCost: parseFloat(o.extraCost),
            linkedIngredientId: o.linkedIngredientId ?? null,
            linkedIngredient,
          };
        })
      );

      return {
        ...effectiveSlot,
        slotStyle: "legacy" as const,
        ingredient: ingredient ? {
          ...ingredient,
          costPerUnit: parseFloat(ingredient.costPerUnit),
          stockQuantity: parseFloat(ingredient.stockQuantity),
          lowStockThreshold: parseFloat(ingredient.lowStockThreshold),
          options: enrichedOptions,
        } : null,
        volumes: [],
        ingredientType: null,
      };
    })
  );

  return {
    ...drink,
    basePrice: parseFloat(drink.basePrice),
    slots: slotsWithDetails,
  };
}

async function computeDefaultPrice(drinkId: number, basePrice: number): Promise<number> {
  const slots = await db
    .select()
    .from(drinkIngredientSlotsTable)
    .where(eq(drinkIngredientSlotsTable.drinkId, drinkId))
    .orderBy(drinkIngredientSlotsTable.sortOrder);

  let extras = 0;
  for (const slot of slots) {
    if (slot.isDynamic) continue;

    // 1. Resolve Type Selection
    const drinkTypeOptions = await db.select().from(drinkSlotTypeOptionsTable)
      .where(eq(drinkSlotTypeOptionsTable.slotId, slot.id));
    
    let templateTypeOptions: any[] = [];
    if (slot.predefinedSlotId) {
      templateTypeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
        .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.predefinedSlotId));
    }

    const typeOptions = drinkTypeOptions.length > 0 ? drinkTypeOptions : templateTypeOptions;
    let defaultTypeSelection = typeOptions.find(to => to.isDefault) ?? typeOptions[0];
    let effectiveTypeId = defaultTypeSelection?.ingredientTypeId ?? slot.ingredientTypeId;

    // 2. Resolve Volume/Cost
    if (effectiveTypeId) {
      const globalTypeVolumes = await db.select().from(ingredientTypeVolumesTable)
        .where(eq(ingredientTypeVolumesTable.ingredientTypeId, effectiveTypeId))
        .orderBy(ingredientTypeVolumesTable.sortOrder);
      
      const slotVolumes = await db.select().from(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id));
      
      let templateVolumes: any[] = [];
      if (slot.predefinedSlotId) {
        templateVolumes = await db.select().from(predefinedSlotVolumesTable)
          .where(eq(predefinedSlotVolumesTable.predefinedSlotId, slot.predefinedSlotId));
      }

      const slotVolumeMap = new Map(slotVolumes.map((sv) => [sv.typeVolumeId, sv]));
      const templateVolumeMap = new Map(templateVolumes.map((tv) => [tv.typeVolumeId, tv]));

      const defaultTv = globalTypeVolumes.find((tv) => {
        const sv = slotVolumeMap.get(tv.id);
        const tvDef = templateVolumeMap.get(tv.id);
        return sv ? sv.isDefault : (tvDef ? tvDef.isDefault : tv.isDefault);
      }) ?? globalTypeVolumes[0];

      if (defaultTv) {
        const sv = slotVolumeMap.get(defaultTv.id);
        const tvDef = templateVolumeMap.get(defaultTv.id);
        extras += parseFloat(sv?.extraCost ?? tvDef?.extraCost ?? defaultTv.extraCost);
      }
    } 
    // Legacy support (old-style slots)
    else if (slot.defaultOptionId) {
      const [option] = await db.select().from(ingredientOptionsTable).where(eq(ingredientOptionsTable.id, slot.defaultOptionId));
      if (option) {
        if (option.linkedIngredientId) {
          const linkedOpts = await db.select().from(ingredientOptionsTable)
            .where(eq(ingredientOptionsTable.ingredientId, option.linkedIngredientId))
            .orderBy(ingredientOptionsTable.sortOrder);
          const subDefault = linkedOpts.find((o) => o.isDefault) ?? linkedOpts[0];
          if (subDefault) extras += parseFloat(subDefault.extraCost);
        } else {
          extras += parseFloat(option.extraCost);
        }
      }
    }
  }

  return basePrice + extras;
}

router.get("/drinks", async (req, res): Promise<void> => {
  const params = ListDrinksQueryParams.safeParse(req.query);
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

  // Sort: by linked category's sortOrder first, then drink's own sortOrder
  const { drinkCategoriesTable: catTable } = await import("@workspace/db");
  const allCats = await db.select().from(catTable).orderBy(asc(catTable.sortOrder));
  const catOrderMap = new Map(allCats.map((c, i) => [c.id, i]));

  filtered = [...filtered].sort((a, b) => {
    const catA = a.categoryId != null ? (catOrderMap.get(a.categoryId) ?? 999) : 999;
    const catB = b.categoryId != null ? (catOrderMap.get(b.categoryId) ?? 999) : 999;
    if (catA !== catB) return catA - catB;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  const drinksWithDefaultPrice = await Promise.all(
    filtered.map(async (d) => {
      const base = parseFloat(d.basePrice);
      const defaultPrice = await computeDefaultPrice(d.id, base);
      return { ...d, basePrice: base, defaultPrice };
    })
  );

  res.json(ListDrinksResponse.parse(serializeDates(drinksWithDefaultPrice)));
});

router.post("/drinks", async (req, res): Promise<void> => {
  const parsed = CreateDrinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { slots: slotDefs, ...drinkData } = parsed.data;

  const [drink] = await db
    .insert(drinksTable)
    .values({
      name: drinkData.name,
      description: drinkData.description ?? null,
      category: drinkData.category,
      basePrice: String(drinkData.basePrice),
      imageUrl: drinkData.imageUrl ?? null,
      isActive: drinkData.isActive ?? true,
      prepTimeSeconds: drinkData.prepTimeSeconds ?? 180,
      kitchenStation: drinkData.kitchenStation ?? "main",
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

  const detail = await buildDrinkDetail(drink.id);
  res.status(201).json(serializeDates(detail));
});

router.get("/drinks/:id", async (req, res): Promise<void> => {
  const params = GetDrinkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const detail = await buildDrinkDetail(params.data.id);
  if (!detail) {
    res.status(404).json({ error: "Drink not found" });
    return;
  }

  // Note: we bypass GetDrinkResponse.parse() here because typed (catalog) slots
  // have null ingredientId/ingredient which the generated Zod schema doesn't accept.
  res.json(serializeDates(detail));
});

router.patch("/drinks/:id", async (req, res): Promise<void> => {
  const params = UpdateDrinkParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateDrinkBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if ((parsed.data as any).categoryId !== undefined) updateData.categoryId = (parsed.data as any).categoryId;
  if ((parsed.data as any).sortOrder !== undefined) updateData.sortOrder = (parsed.data as any).sortOrder;
  if (parsed.data.basePrice !== undefined) updateData.basePrice = String(parsed.data.basePrice);
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
  if (parsed.data.prepTimeSeconds !== undefined) updateData.prepTimeSeconds = parsed.data.prepTimeSeconds;
  if (parsed.data.kitchenStation !== undefined) updateData.kitchenStation = parsed.data.kitchenStation;

  const [drink] = await db.update(drinksTable).set(updateData).where(eq(drinksTable.id, params.data.id)).returning();
  if (!drink) { res.status(404).json({ error: "Drink not found" }); return; }

  res.json(UpdateDrinkResponse.parse(serializeDates({ ...drink, basePrice: parseFloat(drink.basePrice) })));
});

// POST /drinks/:id/image — upload a drink image
router.post("/drinks/:id/image", upload.single("image"), async (req, res): Promise<void> => {
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
router.put("/drinks/:id/slots", async (req, res): Promise<void> => {
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
  if (cupSizeMl !== undefined) {
    await db.update(drinksTable).set({ cupSizeMl }).where(eq(drinksTable.id, drinkId));
  }

  // Replace all slots (cascade deletes slot volumes)
  await db.delete(drinkIngredientSlotsTable).where(eq(drinkIngredientSlotsTable.drinkId, drinkId));

  if (rawSlots.length > 0) {
    const insertedSlots = await db.insert(drinkIngredientSlotsTable).values(
      rawSlots.map((s: any, i: number) => ({
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

    for (let i = 0; i < rawSlots.length; i++) {
      const s = rawSlots[i];
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

  const detail = await buildDrinkDetail(drinkId);
  if (!detail) { res.status(404).json({ error: "Drink not found" }); return; }
  res.json(serializeDates(detail));
});

router.delete("/drinks/:id", async (req, res): Promise<void> => {
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

  try {
    const data = await calculateDrinkData(params.data.id, parsed.data.selections);
    
    // Format extras for the response (without revealing backend schema complexities if not needed)
    // The previous implementation mapped them out, we can return the Customizations
    const extras = data.customizations.map(c => ({
      ingredientId: c.ingredientId,
      ingredientTypeId: c.ingredientTypeId,
      slotLabel: c.slotLabel,
      optionLabel: c.optionLabel,
      extraCost: c.addedCost,
      producedQty: c.producedQty,
      color: c.color
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

export default router;
