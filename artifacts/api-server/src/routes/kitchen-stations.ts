import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, kitchenStationsTable, insertKitchenStationSchema, drinksTable } from "@workspace/db";

const router: IRouter = Router();

// GET /kitchen-stations
router.get("/kitchen-stations", async (_req, res): Promise<void> => {
  const stations = await db
    .select()
    .from(kitchenStationsTable)
    .orderBy(asc(kitchenStationsTable.sortOrder), asc(kitchenStationsTable.name));
  res.json(stations);
});

// POST /kitchen-stations
router.post("/kitchen-stations", async (req, res): Promise<void> => {
  const parsed = insertKitchenStationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [station] = await db
    .insert(kitchenStationsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(station);
});

// PATCH /kitchen-stations/:id
router.patch("/kitchen-stations/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, sortOrder, isActive } = req.body as {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  if (isActive !== undefined) updateData.isActive = isActive;

  const [oldStation] = await db
    .select()
    .from(kitchenStationsTable)
    .where(eq(kitchenStationsTable.id, id));

  if (!oldStation) { res.status(404).json({ error: "Station not found" }); return; }

  const [station] = await db
    .update(kitchenStationsTable)
    .set(updateData)
    .where(eq(kitchenStationsTable.id, id))
    .returning();

  // Sync drinks that use this station if the name changed
  if (name !== undefined && name !== oldStation.name) {
    const oldSlug = oldStation.name.toLowerCase().replace(/\s+/g, '-');
    const newSlug = name.toLowerCase().replace(/\s+/g, '-');
    
    await db.update(drinksTable)
      .set({ kitchenStation: newSlug })
      .where(eq(drinksTable.kitchenStation, oldSlug));
  }

  res.json(station);
});

// DELETE /kitchen-stations/:id
router.delete("/kitchen-stations/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [station] = await db
    .delete(kitchenStationsTable)
    .where(eq(kitchenStationsTable.id, id))
    .returning();

  if (!station) { res.status(404).json({ error: "Station not found" }); return; }

  // Fallback drinks to 'main' station
  const { drinksTable } = await import("@workspace/db");
  const slug = station.name.toLowerCase().replace(/\s+/g, '-');
  await db.update(drinksTable)
    .set({ kitchenStation: "main" })
    .where(eq(drinksTable.kitchenStation, slug));

  res.sendStatus(204);
});

export default router;
