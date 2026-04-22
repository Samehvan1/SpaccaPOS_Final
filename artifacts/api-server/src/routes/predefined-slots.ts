import { Router, type IRouter } from "express";
import { eq, asc, inArray } from "drizzle-orm";
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
} from "@workspace/db";

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
  const id = parseInt(req.params.id);
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
router.post("/catalog/predefined-slots", async (req, res): Promise<void> => {
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
router.patch("/catalog/predefined-slots/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
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

// Get template usage
router.get("/catalog/predefined-slots/:id/usage", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  
  const usage = await db.select({
    drinkId: drinksTable.id,
    drinkName: drinksTable.name,
    slotLabel: drinkIngredientSlotsTable.slotLabel,
  })
  .from(drinkIngredientSlotsTable)
  .innerJoin(drinksTable, eq(drinkIngredientSlotsTable.drinkId, drinksTable.id))
  .where(eq(drinkIngredientSlotsTable.predefinedSlotId, id));
  
  res.json(usage);
});

// Delete template
router.delete("/catalog/predefined-slots/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
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
