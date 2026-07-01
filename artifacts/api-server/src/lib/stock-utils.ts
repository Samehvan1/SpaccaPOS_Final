import { db, branchInventoryBatchesTable, ingredientsTable } from "@workspace/db";
import { eq, and, isNull } from "drizzle-orm";

export async function addStockBatch(
  tx: any,
  branchId: number,
  ingredientId: number,
  quantity: number,
  expiryDate?: Date | null,
  batchNumber?: string | null
) {
  if (quantity <= 0) return;
  const executor = tx || db;

  const activeExpiry = expiryDate ? new Date(expiryDate) : null;
  
  let existingBatch = null;
  if (activeExpiry) {
    const conditions = [
      eq(branchInventoryBatchesTable.branchId, branchId),
      eq(branchInventoryBatchesTable.ingredientId, ingredientId),
      eq(branchInventoryBatchesTable.expiryDate, activeExpiry),
    ];
    if (batchNumber) {
      conditions.push(eq(branchInventoryBatchesTable.batchNumber, batchNumber));
    } else {
      conditions.push(isNull(branchInventoryBatchesTable.batchNumber));
    }
    
    const results = await executor
      .select()
      .from(branchInventoryBatchesTable)
      .where(and(...conditions))
      .limit(1);
    existingBatch = results[0];
  }

  if (existingBatch) {
    const currentQty = parseFloat(existingBatch.quantity);
    const currentInitial = parseFloat(existingBatch.initialQuantity);
    await executor
      .update(branchInventoryBatchesTable)
      .set({
        quantity: String(currentQty + quantity),
        initialQuantity: String(currentInitial + quantity),
        updatedAt: new Date(),
      })
      .where(eq(branchInventoryBatchesTable.id, existingBatch.id));
  } else {
    await executor
      .insert(branchInventoryBatchesTable)
      .values({
        branchId,
        ingredientId,
        batchNumber: batchNumber || `BATCH-${Date.now()}`,
        sealedExpiryDate: activeExpiry,
        expiryDate: activeExpiry,
        isOpened: false,
        quantity: String(quantity),
        initialQuantity: String(quantity),
      });
  }
}

export async function deductStockFromBatches(
  tx: any,
  branchId: number,
  ingredientId: number,
  quantityToDeduct: number
) {
  if (quantityToDeduct <= 0) return;
  const executor = tx || db;

  const activeBatches = await executor
    .select()
    .from(branchInventoryBatchesTable)
    .where(
      and(
        eq(branchInventoryBatchesTable.branchId, branchId),
        eq(branchInventoryBatchesTable.ingredientId, ingredientId)
      )
    );

  const eligibleBatches = activeBatches.filter((b: any) => parseFloat(b.quantity) > 0);

  const sortedBatches = eligibleBatches.sort((a: any, b: any) => {
    if (a.isOpened !== b.isOpened) {
      return a.isOpened ? -1 : 1;
    }
    if (!a.expiryDate && !b.expiryDate) return 0;
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  let remaining = quantityToDeduct;

  for (const batch of sortedBatches) {
    const qty = parseFloat(batch.quantity);
    if (qty >= remaining) {
      const newQty = qty - remaining;
      await executor
        .update(branchInventoryBatchesTable)
        .set({ quantity: String(newQty), updatedAt: new Date() })
        .where(eq(branchInventoryBatchesTable.id, batch.id));
      remaining = 0;
      break;
    } else {
      await executor
        .update(branchInventoryBatchesTable)
        .set({ quantity: "0", updatedAt: new Date() })
        .where(eq(branchInventoryBatchesTable.id, batch.id));
      remaining -= qty;
    }
  }

  if (remaining > 0) {
    const [systemBatch] = await executor
      .select()
      .from(branchInventoryBatchesTable)
      .where(
        and(
          eq(branchInventoryBatchesTable.branchId, branchId),
          eq(branchInventoryBatchesTable.ingredientId, ingredientId),
          isNull(branchInventoryBatchesTable.expiryDate),
          eq(branchInventoryBatchesTable.batchNumber, "SYSTEM-AUTO-DEDUCT")
        )
      )
      .limit(1);

    if (systemBatch) {
      const currentQty = parseFloat(systemBatch.quantity);
      await executor
        .update(branchInventoryBatchesTable)
        .set({ quantity: String(currentQty - remaining), updatedAt: new Date() })
        .where(eq(branchInventoryBatchesTable.id, systemBatch.id));
    } else {
      await executor
        .insert(branchInventoryBatchesTable)
        .values({
          branchId,
          ingredientId,
          batchNumber: "SYSTEM-AUTO-DEDUCT",
          sealedExpiryDate: null,
          expiryDate: null,
          isOpened: false,
          quantity: String(-remaining),
          initialQuantity: "0",
        });
    }
  }
}

export async function openStockBatch(
  tx: any,
  batchId: number
) {
  const executor = tx || db;

  const [batch] = await executor
    .select()
    .from(branchInventoryBatchesTable)
    .where(eq(branchInventoryBatchesTable.id, batchId))
    .limit(1);

  if (!batch) {
    throw new Error("Batch not found");
  }

  if (batch.isOpened) {
    return batch;
  }

  const [ingredient] = await executor
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.id, batch.ingredientId))
    .limit(1);

  const openedShelfLife = ingredient?.openedShelfLifeDays;
  const now = new Date();
  
  let newExpiryDate = batch.sealedExpiryDate;
  if (openedShelfLife != null) {
    const openedExpiry = new Date(now.getTime() + openedShelfLife * 24 * 60 * 60 * 1000);
    if (batch.sealedExpiryDate) {
      const sealedExpiry = new Date(batch.sealedExpiryDate);
      newExpiryDate = openedExpiry < sealedExpiry ? openedExpiry : sealedExpiry;
    } else {
      newExpiryDate = openedExpiry;
    }
  }

  const [updated] = await executor
    .update(branchInventoryBatchesTable)
    .set({
      isOpened: true,
      openedAt: now,
      expiryDate: newExpiryDate,
      updatedAt: now,
    })
    .where(eq(branchInventoryBatchesTable.id, batchId))
    .returning();

  return updated;
}
