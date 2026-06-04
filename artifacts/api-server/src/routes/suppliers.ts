import { Router, type IRouter } from "express";
import { db, suppliersTable, insertSupplierSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requirePermission } from "../middleware/permissions";
import { logActivity } from "../lib/activity-logger";

const suppliersRouter: IRouter = Router();

// GET /purchases/suppliers
suppliersRouter.get("/purchases/suppliers", requirePermission("purchases:view"), async (req, res): Promise<void> => {
  try {
    const suppliers = await db.select().from(suppliersTable).orderBy(suppliersTable.name);
    res.json(suppliers);
  } catch (error: any) {
    console.error("GET /purchases/suppliers error:", error?.message || error);
    res.status(500).json({ error: "Failed to list suppliers" });
  }
});

// POST /purchases/suppliers
suppliersRouter.post("/purchases/suppliers", requirePermission("purchases:manage"), async (req, res): Promise<void> => {
  try {
    const parsed = insertSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    const [newSupplier] = await db
      .insert(suppliersTable)
      .values(parsed.data)
      .returning();

    if (!newSupplier) {
      throw new Error("Supplier creation failed");
    }

    await logActivity(req, "CREATE_SUPPLIER", "supplier", newSupplier.id, { name: newSupplier.name });

    res.status(201).json(newSupplier);
  } catch (error: any) {
    console.error("POST /purchases/suppliers error:", error?.message || error);
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

// PATCH /purchases/suppliers/:id
suppliersRouter.patch("/purchases/suppliers/:id", requirePermission("purchases:manage"), async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid supplier ID" });
      return;
    }

    // We make a partial check of the input schema
    const parsed = insertSupplierSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    const [updatedSupplier] = await db
      .update(suppliersTable)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(suppliersTable.id, id))
      .returning();

    if (!updatedSupplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    await logActivity(req, "UPDATE_SUPPLIER", "supplier", id, { name: updatedSupplier.name });

    res.json(updatedSupplier);
  } catch (error: any) {
    console.error("PATCH /purchases/suppliers/:id error:", error?.message || error);
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

// DELETE /purchases/suppliers/:id
suppliersRouter.delete("/purchases/suppliers/:id", requirePermission("purchases:manage"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid supplier ID" });
    return;
  }

  try {

    // Rather than hard delete, let's deactivate or hard delete depending on whether they have POs.
    // For simplicity, we can do a hard delete if no purchases refer to them, otherwise return 400.
    const [deletedSupplier] = await db.delete(suppliersTable).where(eq(suppliersTable.id, id)).returning();

    if (!deletedSupplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    await logActivity(req, "DELETE_SUPPLIER", "supplier", id, { name: deletedSupplier.name });

    res.status(204).end();
  } catch (error: any) {
    console.error("DELETE /purchases/suppliers/:id error:", error?.message || error);
    if (error?.code === "23503" || error?.message?.includes("foreign key constraint")) {
      // It has purchases referencing it. Let's soft delete (set isActive to false)
      const [deactivatedSupplier] = await db
        .update(suppliersTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(suppliersTable.id, id))
        .returning();
      
      if (deactivatedSupplier) {
        await logActivity(req, "DEACTIVATE_SUPPLIER", "supplier", id, { name: deactivatedSupplier.name });
        res.status(200).json({ message: "Supplier has purchase orders. It has been deactivated instead of deleted.", supplier: deactivatedSupplier });
        return;
      }
    }
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});

export default suppliersRouter;
