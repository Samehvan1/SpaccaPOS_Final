import { Router, type IRouter } from "express";
import { eq, asc, inArray, and } from "drizzle-orm";
import {
  db,
  predefinedSlotsTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable,
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  ingredientVolumesTable,
  ingredientCategoriesTable,
  drinksTable,
  drinkIngredientSlotsTable,
  drinkSlotTypeOptionsTable,
  drinkSlotVolumesTable,
} from "@workspace/db";
import { requirePermission } from "../middleware/permissions";

const router: IRouter = Router();

// List templates
router.get("/catalog/predefined-slots", async (_req, res): Promise<void> => {
  const slots = await db.select().from(predefinedSlotsTable).orderBy(asc(predefinedSlotsTable.name));
  
  const detail = await Promise.all(slots.map(async (slot) => {
    const typeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
      .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, slot.id))
      .orderBy(predefinedSlotTypeOptionsTable.sortOrder);
      
    const volumes = await db.select().from(predefinedSlotVolumesTable)
      .where(eq(predefinedSlotVolumesTable.predefinedSlotId, slot.id))
      .orderBy(predefinedSlotVolumesTable.sortOrder);
      
    return { ...slot, typeOptions, volumes };
  }));
  
  res.json(detail);
});

// Get single template
router.get("/catalog/predefined-slots/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const [slot] = await db.select().from(predefinedSlotsTable).where(eq(predefinedSlotsTable.id, id));
  if (!slot) { res.status(404).json({ error: "Not found" }); return; }
  
  const typeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
    .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, id))
    .orderBy(predefinedSlotTypeOptionsTable.sortOrder);
    
  const volumes = await db.select().from(predefinedSlotVolumesTable)
    .where(eq(predefinedSlotVolumesTable.predefinedSlotId, id))
    .orderBy(predefinedSlotVolumesTable.sortOrder);
    
  res.json({ ...slot, typeOptions, volumes });
});

// Create template
router.post("/catalog/predefined-slots", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const { name, slotLabel, isRequired, isDynamic, affectsCupSize, autoLoadCategoryId } = req.body;
  if (!name || !slotLabel) { res.status(400).json({ error: "name and slotLabel required" }); return; }
  
  const [slot] = await db.insert(predefinedSlotsTable).values({
    name, slotLabel, isRequired: isRequired ?? true, isDynamic: isDynamic ?? false, affectsCupSize: affectsCupSize ?? null
  }).returning();
  
  // Bulk load if categoryId provided
  if (autoLoadCategoryId) {
    const categoryId = parseInt(autoLoadCategoryId);
    const types = await db.select().from(ingredientTypesTable).where(eq(ingredientTypesTable.categoryId, categoryId));
    
    if (types.length > 0) {
      const typeOptionValues = types.map((t, i) => ({
        predefinedSlotId: slot.id,
        ingredientTypeId: t.id,
        isDefault: i === 0,
        sortOrder: i
      }));
      await db.insert(predefinedSlotTypeOptionsTable).values(typeOptionValues);
      
      const typeIds = types.map(t => t.id);
      const typeVolumes = await db.select().from(ingredientTypeVolumesTable).where(inArray(ingredientTypeVolumesTable.ingredientTypeId, typeIds));
      
      if (typeVolumes.length > 0) {
        const volumeValues = typeVolumes.map((tv, i) => ({
          predefinedSlotId: slot.id,
          typeVolumeId: tv.id,
          processedQty: tv.processedQty,
          producedQty: tv.producedQty,
          unit: tv.unit,
          extraCost: tv.extraCost,
          isDefault: tv.isDefault,
          isEnabled: true,
          sortOrder: i
        }));
        await db.insert(predefinedSlotVolumesTable).values(volumeValues);
      }
    }
  }
  
  res.status(201).json(slot);
});

// Update template
router.patch("/catalog/predefined-slots/:id", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const { name, slotLabel, isRequired, isDynamic, affectsCupSize, typeOptions, volumes } = req.body;
  
  const patch: any = {};
  if (name !== undefined) patch.name = name;
  if (slotLabel !== undefined) patch.slotLabel = slotLabel;
  if (isRequired !== undefined) patch.isRequired = isRequired;
  if (isDynamic !== undefined) patch.isDynamic = isDynamic;
  if (affectsCupSize !== undefined) patch.affectsCupSize = affectsCupSize;
  
  if (Object.keys(patch).length > 0) {
    await db.update(predefinedSlotsTable).set(patch).where(eq(predefinedSlotsTable.id, id));
  }
  
  // Update Type Options if provided
  if (Array.isArray(typeOptions)) {
    await db.delete(predefinedSlotTypeOptionsTable).where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, id));
    if (typeOptions.length > 0) {
      await db.insert(predefinedSlotTypeOptionsTable).values(typeOptions.map((to, i) => ({
        predefinedSlotId: id,
        ingredientTypeId: to.ingredientTypeId,
        isDefault: to.isDefault ?? i === 0,
        sortOrder: to.sortOrder ?? i
      })));
    }
  }
  
  // Update Volumes if provided
  if (Array.isArray(volumes)) {
    await db.delete(predefinedSlotVolumesTable).where(eq(predefinedSlotVolumesTable.predefinedSlotId, id));
    if (volumes.length > 0) {
      await db.insert(predefinedSlotVolumesTable).values(volumes.map((v, i) => ({
        predefinedSlotId: id,
        typeVolumeId: v.typeVolumeId,
        processedQty: v.processedQty ?? null,
        producedQty: v.producedQty ?? null,
        unit: v.unit ?? null,
        extraCost: v.extraCost ?? null,
        isDefault: v.isDefault ?? false,
        isEnabled: v.isEnabled ?? true,
        sortOrder: v.sortOrder ?? i
      })));
    }
  }
  
  res.json({ success: true });
});

// Sync products using template
router.post("/catalog/predefined-slots/:id/sync", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const templateId = parseInt(req.params.id as string);
  const drinkId = req.body?.drinkId ? parseInt(req.body.drinkId) : undefined;

  const [template] = await db.select().from(predefinedSlotsTable).where(eq(predefinedSlotsTable.id, templateId));
  if (!template) { res.status(404).json({ error: "Template not found" }); return; }

  const templateTypeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
    .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, templateId))
    .orderBy(predefinedSlotTypeOptionsTable.sortOrder);

  const templateVolumes = await db.select().from(predefinedSlotVolumesTable)
    .where(eq(predefinedSlotVolumesTable.predefinedSlotId, templateId))
    .orderBy(predefinedSlotVolumesTable.sortOrder);

  const conditions = [eq(drinkIngredientSlotsTable.predefinedSlotId, templateId)];
  if (drinkId) {
    conditions.push(eq(drinkIngredientSlotsTable.drinkId, drinkId));
  }

  const targetSlots = await db.select().from(drinkIngredientSlotsTable).where(and(...conditions));

  if (targetSlots.length === 0) {
    res.json({ success: true, count: 0 });
    return;
  }

  await db.transaction(async (tx) => {
    for (const slot of targetSlots) {
      // 1. Update slot properties
      await tx.update(drinkIngredientSlotsTable)
        .set({
          slotLabel: template.slotLabel,
          isRequired: template.isRequired,
          isDynamic: template.isDynamic,
          affectsCupSize: template.affectsCupSize,
        })
        .where(eq(drinkIngredientSlotsTable.id, slot.id));

      // 2. Refresh type options for this slot
      await tx.delete(drinkSlotTypeOptionsTable).where(eq(drinkSlotTypeOptionsTable.slotId, slot.id));
      if (templateTypeOptions.length > 0) {
        await tx.insert(drinkSlotTypeOptionsTable).values(templateTypeOptions.map((to, i) => ({
          slotId: slot.id,
          ingredientTypeId: to.ingredientTypeId,
          isDefault: to.isDefault,
          sortOrder: to.sortOrder ?? i,
          processedQty: to.processedQty,
          producedQty: to.producedQty,
          unit: to.unit,
          extraCost: to.extraCost,
          pricingMode: to.pricingMode,
        })));
      }

      // 3. Refresh slot volumes for this slot
      await tx.delete(drinkSlotVolumesTable).where(eq(drinkSlotVolumesTable.slotId, slot.id));
      if (templateVolumes.length > 0) {
        await tx.insert(drinkSlotVolumesTable).values(templateVolumes.map((tv, i) => ({
          slotId: slot.id,
          typeVolumeId: tv.typeVolumeId,
          processedQty: tv.processedQty,
          producedQty: tv.producedQty,
          unit: tv.unit,
          extraCost: tv.extraCost,
          isDefault: tv.isDefault,
          isEnabled: tv.isEnabled,
          sortOrder: tv.sortOrder ?? i,
        })));
      }
    }
  });

  res.json({ success: true, count: targetSlots.length });
});

function isEqualVal(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA === numB;
  }
  return String(a) === String(b);
}

// Get template usage
router.get("/catalog/predefined-slots/:id/usage", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  
  const [template] = await db.select().from(predefinedSlotsTable).where(eq(predefinedSlotsTable.id, id));
  if (!template) { res.status(404).json({ error: "Template not found" }); return; }

  const templateTypeOptions = await db.select().from(predefinedSlotTypeOptionsTable)
    .where(eq(predefinedSlotTypeOptionsTable.predefinedSlotId, id))
    .orderBy(predefinedSlotTypeOptionsTable.sortOrder);

  const templateVolumes = await db.select().from(predefinedSlotVolumesTable)
    .where(eq(predefinedSlotVolumesTable.predefinedSlotId, id))
    .orderBy(predefinedSlotVolumesTable.sortOrder);

  const rawUsage = await db.select({
    drinkId: drinksTable.id,
    drinkName: drinksTable.name,
    slotLabel: drinkIngredientSlotsTable.slotLabel,
    slotId: drinkIngredientSlotsTable.id,
    isRequired: drinkIngredientSlotsTable.isRequired,
    isDynamic: drinkIngredientSlotsTable.isDynamic,
    affectsCupSize: drinkIngredientSlotsTable.affectsCupSize,
  })
  .from(drinkIngredientSlotsTable)
  .innerJoin(drinksTable, eq(drinkIngredientSlotsTable.drinkId, drinksTable.id))
  .where(eq(drinkIngredientSlotsTable.predefinedSlotId, id))
  .orderBy(asc(drinksTable.name), asc(drinkIngredientSlotsTable.id));
  
  const usage = await Promise.all(rawUsage.map(async (u) => {
    // Check metadata sync
    const isMetaSynced = 
      u.slotLabel === template.slotLabel &&
      u.isRequired === template.isRequired &&
      u.isDynamic === template.isDynamic &&
      u.affectsCupSize === template.affectsCupSize;

    if (!isMetaSynced) {
      return { drinkId: u.drinkId, drinkName: u.drinkName, slotLabel: u.slotLabel, slotId: u.slotId, isSynced: false };
    }

    const slotTypeOptions = await db.select().from(drinkSlotTypeOptionsTable)
      .where(eq(drinkSlotTypeOptionsTable.slotId, u.slotId))
      .orderBy(drinkSlotTypeOptionsTable.sortOrder);

    if (slotTypeOptions.length !== templateTypeOptions.length) {
      return { drinkId: u.drinkId, drinkName: u.drinkName, slotLabel: u.slotLabel, slotId: u.slotId, isSynced: false };
    }

    const isTypesSynced = templateTypeOptions.every((to) => {
      const sto = slotTypeOptions.find(s => s.ingredientTypeId === to.ingredientTypeId);
      if (!sto) return false;
      return (
        sto.isDefault === to.isDefault &&
        isEqualVal(sto.processedQty, to.processedQty) &&
        isEqualVal(sto.producedQty, to.producedQty) &&
        isEqualVal(sto.unit, to.unit) &&
        isEqualVal(sto.extraCost, to.extraCost) &&
        isEqualVal(sto.pricingMode, to.pricingMode)
      );
    });

    if (!isTypesSynced) {
      return { drinkId: u.drinkId, drinkName: u.drinkName, slotLabel: u.slotLabel, slotId: u.slotId, isSynced: false };
    }

    const slotVolumes = await db.select().from(drinkSlotVolumesTable)
      .where(eq(drinkSlotVolumesTable.slotId, u.slotId))
      .orderBy(drinkSlotVolumesTable.sortOrder);

    if (slotVolumes.length !== templateVolumes.length) {
      return { drinkId: u.drinkId, drinkName: u.drinkName, slotLabel: u.slotLabel, slotId: u.slotId, isSynced: false };
    }

    const isVolumesSynced = templateVolumes.every((tv) => {
      const sv = slotVolumes.find(s => s.typeVolumeId === tv.typeVolumeId);
      if (!sv) return false;
      return (
        sv.isDefault === tv.isDefault &&
        sv.isEnabled === tv.isEnabled &&
        isEqualVal(sv.processedQty, tv.processedQty) &&
        isEqualVal(sv.producedQty, tv.producedQty) &&
        isEqualVal(sv.unit, tv.unit) &&
        isEqualVal(sv.extraCost, tv.extraCost)
      );
    });

    return {
      drinkId: u.drinkId,
      drinkName: u.drinkName,
      slotLabel: u.slotLabel,
      slotId: u.slotId,
      isSynced: isVolumesSynced,
    };
  }));

  res.json(usage);
});

// Delete template
router.delete("/catalog/predefined-slots/:id", requirePermission("catalog:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  try {
    await db.delete(predefinedSlotsTable).where(eq(predefinedSlotsTable.id, id));
    res.sendStatus(204);
  } catch (error: any) {
    if (error.code === "23503" || error.cause?.code === "23503") {
      res.status(400).json({ error: "Cannot delete template while it is used in drink recipes." });
    } else {
      res.status(500).json({ error: "Failed to delete template" });
    }
  }
});

export default router;


