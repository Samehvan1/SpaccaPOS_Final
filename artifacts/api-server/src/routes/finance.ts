import { Router, type IRouter } from "express";
import { eq, and, sql, sum, count, desc, gte, lte, inArray } from "drizzle-orm";
import { 
  db, 
  ingredientsTable, 
  branchStockTable, 
  stockMovementsTable, 
  orderItemsTable, 
  orderItemCustomizationsTable,
  drinksTable,
  ordersTable,
  drinkIngredientSlotsTable,
  drinkSlotTypeOptionsTable,
  drinkSlotVolumesTable,
  ingredientTypesTable,
  predefinedSlotsTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable,
  ingredientTypeVolumesTable,
  ingredientVolumesTable,
  usersTable,
  branchesTable,
  ingredientOptionsTable
} from "@workspace/db";
import { serializeDates } from "../lib/serialize";
import { requirePermission } from "../middleware/permissions";
import { analyzeCustomization, getRecipeContext } from "../lib/recipe-utils";
import { startOfDay, endOfDay, subDays } from "date-fns";

const router: IRouter = Router();

// ── Inventory Usage Report ────────────────────────────────────────────────
router.get("/finance/inventory-usage", requirePermission("reports:view"), async (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const targetBranchId = branchId && branchId !== "all" ? parseInt(branchId as string) : null;
  const start = startDate ? startOfDay(new Date(startDate as string)) : startOfDay(subDays(new Date(), 30));
  const end = endDate ? endOfDay(new Date(endDate as string)) : endOfDay(new Date());
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ error: "Invalid date format" });
    return;
  }

  // 1. Get all inventory items
  const ingredients = await db.select().from(ingredientsTable);

  // 2. Aggregate actual usage from order customizations
  const usageQuery = db
    .select({
      ingredientId: orderItemCustomizationsTable.ingredientId,
      totalConsumed: sum(orderItemCustomizationsTable.consumedQty),
      usageCount: count(orderItemCustomizationsTable.id),
    })
    .from(orderItemCustomizationsTable)
    .innerJoin(orderItemsTable, eq(orderItemCustomizationsTable.orderItemId, orderItemsTable.id))
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .where(and(
      gte(ordersTable.createdAt, start),
      lte(ordersTable.createdAt, end),
      eq(ordersTable.status, "completed"),
      targetBranchId ? eq(ordersTable.branchId, targetBranchId) : undefined
    ))
    .groupBy(orderItemCustomizationsTable.ingredientId);

  const usageData = await usageQuery;
  const usageMap = new Map(usageData.map(u => [u.ingredientId, u]));

  // 3. Get stock info
  const stockQuery = db
    .select({
      ingredientId: branchStockTable.ingredientId,
      stockQuantity: sum(branchStockTable.stockQuantity),
      startupQuantity: sum(branchStockTable.startupQuantity),
    })
    .from(branchStockTable)
    .where(targetBranchId ? eq(branchStockTable.branchId, targetBranchId) : undefined)
    .groupBy(branchStockTable.ingredientId);

  const stockData = await stockQuery;
  const stockMap = new Map(stockData.map(s => [s.ingredientId, s]));

  const report = ingredients.map(ing => {
    const usage = usageMap.get(ing.id);
    const stock = stockMap.get(ing.id);
    return {
      id: ing.id,
      name: ing.name,
      type: ing.ingredientType || (ing as any).ingredient_type || "other",
      unit: ing.unit,
      costPerUnit: parseFloat(String(ing.costPerUnit || "0")) || 0,
      totalConsumed: usage ? parseFloat(String(usage.totalConsumed || "0")) || 0 : 0,
      usageCount: usage ? Number(usage.usageCount) || 0 : 0,
      currentStock: stock ? parseFloat(String(stock.stockQuantity || "0")) || 0 : 0,
      startupQuantity: stock ? parseFloat(String(stock.startupQuantity || "0")) || 0 : 0,
    };
  });

  res.json(report);
});

// ── P&L Report ────────────────────────────────────────────────────────────
router.get("/finance/pl-report", requirePermission("reports:view"), async (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const targetBranchId = branchId && branchId !== "all" ? parseInt(branchId as string) : null;
  const start = startDate ? startOfDay(new Date(startDate as string)) : startOfDay(subDays(new Date(), 30));
  const end = endDate ? endOfDay(new Date(endDate as string)) : endOfDay(new Date());
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ error: "Invalid date format" });
    return;
  }

  // 1. Get revenue by drink
  const drinkSales = await db
    .select({
      drinkId: orderItemsTable.drinkId,
      drinkName: sql<string>`MAX(${orderItemsTable.drinkName})`,
      category: sql<string>`MAX(${drinksTable.category})`,
      totalOrders: count(orderItemsTable.id),
      totalRevenue: sum(orderItemsTable.lineTotal),
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .innerJoin(drinksTable, eq(orderItemsTable.drinkId, drinksTable.id))
    .where(and(
      gte(ordersTable.createdAt, start),
      lte(ordersTable.createdAt, end),
      eq(ordersTable.status, "completed"),
      targetBranchId ? eq(ordersTable.branchId, targetBranchId) : undefined
    ))
    .groupBy(orderItemsTable.drinkId);

  // 2. Get ingredient costs by drink (Aggregated from customizations)
  const ingredientUsage = await db
    .select({
      drinkId: orderItemsTable.drinkId,
      totalCost: sql<string>`SUM(${orderItemCustomizationsTable.consumedQty} * ${ingredientsTable.costPerUnit})`,
    })
    .from(orderItemCustomizationsTable)
    .innerJoin(orderItemsTable, eq(orderItemCustomizationsTable.orderItemId, orderItemsTable.id))
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .innerJoin(ingredientsTable, eq(orderItemCustomizationsTable.ingredientId, ingredientsTable.id))
    .where(and(
      gte(ordersTable.createdAt, start),
      lte(ordersTable.createdAt, end),
      eq(ordersTable.status, "completed"),
      targetBranchId ? eq(ordersTable.branchId, targetBranchId) : undefined
    ))
    .groupBy(orderItemsTable.drinkId);

  const costMap = new Map(ingredientUsage.map(c => [c.drinkId, parseFloat(String(c.totalCost || "0")) || 0]));

  const report = drinkSales.map(s => {
    const revenue = parseFloat(String(s.totalRevenue || "0")) || 0;
    const cost = costMap.get(s.drinkId) || 0;
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      drinkId: s.drinkId,
      name: s.drinkName,
      category: s.category,
      totalOrders: Number(s.totalOrders),
      revenue,
      cost,
      profit,
      margin
    };
  });

  res.json(report);
});

// ── Ingredient Recipe Audit ───────────────────────────────────────────────
router.get("/finance/ingredient-recipes", requirePermission("reports:view"), async (req, res) => {
  // 1. Get all ingredients
  const ingredients = await db.select().from(ingredientsTable);

  // 2. Fetch all mapping data
  const [
    slots,
    typeOptions,
    slotVolumes,
    types,
    predefinedTypeOptions,
    predefinedVolumes,
    allDrinks,
    typeVolumes,
    baseVolumes
  ] = await Promise.all([
    db.select().from(drinkIngredientSlotsTable),
    db.select().from(drinkSlotTypeOptionsTable),
    db.select().from(drinkSlotVolumesTable),
    db.select().from(ingredientTypesTable),
    db.select().from(predefinedSlotTypeOptionsTable),
    db.select().from(predefinedSlotVolumesTable),
    db.select().from(drinksTable),
    db.select().from(ingredientTypeVolumesTable),
    db.select().from(ingredientVolumesTable)
  ]);

  const drinkMap = new Map(allDrinks.map(d => [d.id, d]));
  const typeMap = new Map(types.map(t => [t.id, t]));
  const typeVolMap = new Map(typeVolumes.map(tv => [tv.id, tv]));
  const baseVolMap = new Map(baseVolumes.map(bv => [bv.id, bv]));

  const getEffectiveQty = (slotId: number | null, ingredientTypeId: number, predefinedSlotId: number | null = null) => {
    const type = typeMap.get(ingredientTypeId);
    if (!type) return 0;

    // 1. Check for Default Volume in Drink Slot
    if (slotId) {
      const dsv = slotVolumes.find(sv => sv.slotId === slotId && sv.isDefault);
      if (dsv) {
        if (dsv.processedQty !== null && dsv.processedQty !== undefined) return parseFloat(String(dsv.processedQty));
        const itv = typeVolMap.get(dsv.typeVolumeId);
        if (itv) {
          if (itv.processedQty !== null && itv.processedQty !== undefined) return parseFloat(String(itv.processedQty));
          const bv = baseVolMap.get(itv.volumeId);
          if (bv) return parseFloat(String(bv.processedQty));
        }
      }
      
      // 2. Check for Override in Type Option
      const dsto = typeOptions.find(to => to.slotId === slotId && to.isDefault && to.ingredientTypeId === ingredientTypeId);
      if (dsto && dsto.processedQty !== null && dsto.processedQty !== undefined) return parseFloat(String(dsto.processedQty));
    }

    // 3. Check for Predefined Slot Defaults
    if (predefinedSlotId) {
      const psv = predefinedVolumes.find(pv => pv.predefinedSlotId === predefinedSlotId && pv.isDefault);
      if (psv) {
        if (psv.processedQty !== null && psv.processedQty !== undefined) return parseFloat(String(psv.processedQty));
        const itv = typeVolMap.get(psv.typeVolumeId);
        if (itv) {
          if (itv.processedQty !== null && itv.processedQty !== undefined) return parseFloat(String(itv.processedQty));
          const bv = baseVolMap.get(itv.volumeId);
          if (bv) return parseFloat(String(bv.processedQty));
        }
      }
      const psto = predefinedTypeOptions.find(pto => pto.predefinedSlotId === predefinedSlotId && pto.isDefault && pto.ingredientTypeId === ingredientTypeId);
      if (psto && psto.processedQty !== null && psto.processedQty !== undefined) return parseFloat(String(psto.processedQty));
    }

    // 4. Fallback to Type Default
    return parseFloat(String(type.processedQty || "0"));
  };

  const report = ingredients.map(ing => {
    const usage: any[] = [];

    // Check direct legacy slots
    for (const slot of slots) {
      if (slot.ingredientId === ing.id) {
        usage.push({
          drinkId: slot.drinkId,
          drinkName: drinkMap.get(slot.drinkId)?.name || "Unknown",
          slotLabel: slot.slotLabel,
          quantity: 1, // Default for legacy if no options
          unit: ing.unit
        });
      }
    }

    // Check types
    const linkedTypes = types.filter(t => t.inventoryIngredientId === ing.id);
    const linkedTypeIds = new Set(linkedTypes.map(t => t.id));

    for (const slot of slots) {
      // Direct type on slot
      if (slot.ingredientTypeId && linkedTypeIds.has(slot.ingredientTypeId)) {
        usage.push({
          drinkId: slot.drinkId,
          drinkName: drinkMap.get(slot.drinkId)?.name || "Unknown",
          slotLabel: slot.slotLabel,
          quantity: getEffectiveQty(slot.id, slot.ingredientTypeId),
          unit: typeMap.get(slot.ingredientTypeId)?.unit || "unit"
        });
      }

      // Type options on slot
      const options = typeOptions.filter(to => to.slotId === slot.id && to.isDefault && linkedTypeIds.has(to.ingredientTypeId));
      for (const opt of options) {
        usage.push({
          drinkId: slot.drinkId,
          drinkName: drinkMap.get(slot.drinkId)?.name || "Unknown",
          slotLabel: slot.slotLabel,
          quantity: getEffectiveQty(slot.id, opt.ingredientTypeId),
          unit: typeMap.get(opt.ingredientTypeId)?.unit || "unit"
        });
      }

      // Predefined slots
      if (slot.predefinedSlotId) {
        const pOpts = predefinedTypeOptions.filter(pto => pto.predefinedSlotId === slot.predefinedSlotId && pto.isDefault && linkedTypeIds.has(pto.ingredientTypeId));
        for (const pOpt of pOpts) {
          usage.push({
            drinkId: slot.drinkId,
            drinkName: drinkMap.get(slot.drinkId)?.name || "Unknown",
            slotLabel: slot.slotLabel,
            quantity: getEffectiveQty(null, pOpt.ingredientTypeId, slot.predefinedSlotId),
            unit: typeMap.get(pOpt.ingredientTypeId)?.unit || "unit"
          });
        }
      }
    }

    // Check cups
    for (const drink of allDrinks) {
      if (drink.cupIngredientId === ing.id) {
        usage.push({
          drinkId: drink.id,
          drinkName: drink.name,
          slotLabel: "Cup",
          quantity: 1,
          unit: "pcs"
        });
      }
    }

    // Calculate total default quantities across all drinks
    const totalRecipeQty = usage.reduce((acc, u) => acc + u.quantity, 0);

    return {
      id: ing.id,
      name: ing.name,
      type: ing.ingredientType || (ing as any).ingredient_type || "other",
      unit: ing.unit,
      drinks: usage,
      totalRecipeQty: totalRecipeQty
    };
  });

  res.json(report);
});

// ── Detailed Sales Items Report ──────────────────────────────────────────
router.get("/finance/sales-items", requirePermission("reports:view"), async (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const targetBranchId = branchId && branchId !== "all" ? parseInt(branchId as string) : null;
  const start = startDate ? startOfDay(new Date(startDate as string)) : startOfDay(subDays(new Date(), 30));
  const end = endDate ? endOfDay(new Date(endDate as string)) : endOfDay(new Date());
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ error: "Invalid date format" });
    return;
  }

  const items = await db
    .select({
      id: orderItemsTable.id,
      orderId: ordersTable.id,
      date: ordersTable.createdAt,
      orderNumber: ordersTable.orderNumber,
      cashier: usersTable.name,
      branch: branchesTable.name,
      drinkName: orderItemsTable.drinkName,
      drinkId: orderItemsTable.drinkId,
      quantity: orderItemsTable.quantity,
      unitPrice: orderItemsTable.unitPrice,
      lineTotal: orderItemsTable.lineTotal,
      subtotal: ordersTable.subtotal,
      discount: ordersTable.discount,
      discountName: ordersTable.discountCode,
      discountValue: ordersTable.discountValue,
      total: ordersTable.total,
      paymentMethod: ordersTable.paymentMethod,
      category: drinksTable.category,
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .innerJoin(drinksTable, eq(orderItemsTable.drinkId, drinksTable.id))
    .innerJoin(branchesTable, eq(ordersTable.branchId, branchesTable.id))
    .leftJoin(usersTable, eq(ordersTable.cashierId, usersTable.id))
    .where(and(
      gte(ordersTable.createdAt, start),
      lte(ordersTable.createdAt, end),
      eq(ordersTable.status, "completed"),
      targetBranchId ? eq(ordersTable.branchId, targetBranchId) : undefined
    ))
    .orderBy(desc(ordersTable.createdAt));

  if (items.length === 0) return res.json([]);

  const itemIds = items.map(i => i.id);
  const drinkIds = [...new Set(items.map(i => i.drinkId))];

  const [rawCustomizations, context] = await Promise.all([
    db.select().from(orderItemCustomizationsTable).where(inArray(orderItemCustomizationsTable.orderItemId, itemIds)),
    getRecipeContext(drinkIds)
  ]);

  const report = items.map(item => {
    const itemCustoms = rawCustomizations.filter(c => c.orderItemId === item.id);
    // Check if any of these customizations are true overrides
    const actualOverrides = itemCustoms
      .map(c => analyzeCustomization({ ...c, drinkId: item.drinkId }, context))
      .filter(Boolean);

    // Financials (Strictly following formulas)
    const lineGross = parseFloat(item.lineTotal as string);
    const beforeTax = lineGross / 1.14;
    const taxAmount = lineGross - beforeTax;
    
    // Determine discount percentage for this line
    const orderSubtotal = parseFloat(item.subtotal as string) || 1;
    const orderDiscountAmt = parseFloat(item.discount as string) || 0;
    // Effective discount percentage (on net/before-tax)
    const effectiveDiscountPct = (orderDiscountAmt / (orderSubtotal / 1.14)) * 100;
    
    const discountVal = item.discountValue ? parseFloat(item.discountValue as string) : effectiveDiscountPct;
    const afterDiscount = beforeTax * ((100 - effectiveDiscountPct) / 100);
    const finalPrice = afterDiscount + taxAmount;
    const itemDiscountAmt = beforeTax - afterDiscount;

    return {
      date: item.date,
      orderNo: item.orderNumber,
      invNo: item.orderId,
      cashier: item.cashier || "System",
      branch: item.branch,
      item: item.drinkName,
      quantity: item.quantity,
      isCustomized: actualOverrides.length > 0 ? "Customize" : "Standard",
      salePrice: parseFloat(item.unitPrice as string),
      totalGross: lineGross,
      netBeforeTax: beforeTax,
      taxAmount: taxAmount,
      discountName: item.discountName || "None",
      discountValue: discountVal,
      discountAmount: itemDiscountAmt,
      subtotalPrice: beforeTax,
      finalPrice: finalPrice,
      paymentMethod: item.paymentMethod,
      category: (item as any).category || "Other"
    };
  });

  res.json(serializeDates(report));
});

// ── Customizations Detailed Report ─────────────────────────────────────────
router.get("/finance/customizations-report", requirePermission("reports:view"), async (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const targetBranchId = branchId && branchId !== "all" ? parseInt(branchId as string) : null;
  const start = startDate ? startOfDay(new Date(startDate as string)) : startOfDay(subDays(new Date(), 30));
  const end = endDate ? endOfDay(new Date(endDate as string)) : endOfDay(new Date());
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ error: "Invalid date format" });
    return;
  }

  const rawCustoms = await db
    .select({
      date: ordersTable.createdAt,
      orderNumber: ordersTable.orderNumber,
      cashier: usersTable.name,
      branch: branchesTable.name,
      drinkName: orderItemsTable.drinkName,
      drinkId: orderItemsTable.drinkId,
      slotLabel: orderItemCustomizationsTable.slotLabel,
      optionLabel: orderItemCustomizationsTable.optionLabel,
      consumedQty: orderItemCustomizationsTable.consumedQty,
      addedCost: orderItemCustomizationsTable.addedCost,
      unit: ingredientsTable.unit,
      ingredientName: ingredientsTable.name,
      ingredientId: orderItemCustomizationsTable.ingredientId,
      optionId: orderItemCustomizationsTable.optionId,
      typeVolumeId: orderItemCustomizationsTable.typeVolumeId,
    })
    .from(orderItemCustomizationsTable)
    .innerJoin(orderItemsTable, eq(orderItemCustomizationsTable.orderItemId, orderItemsTable.id))
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .innerJoin(branchesTable, eq(ordersTable.branchId, branchesTable.id))
    .leftJoin(usersTable, eq(ordersTable.cashierId, usersTable.id))
    .leftJoin(ingredientsTable, eq(orderItemCustomizationsTable.ingredientId, ingredientsTable.id))
    .where(and(
      gte(ordersTable.createdAt, start),
      lte(ordersTable.createdAt, end),
      eq(ordersTable.status, "completed"),
      targetBranchId ? eq(ordersTable.branchId, targetBranchId) : undefined
    ))
    .orderBy(desc(ordersTable.createdAt));

  const drinkIds = [...new Set(rawCustoms.map(c => c.drinkId))];
  const context = await getRecipeContext(drinkIds);

  const report = rawCustoms
    .map(c => analyzeCustomization(c, context))
    .filter(Boolean);

  res.json(serializeDates(report));
});

// ── Customization Analytics Report ────────────────────────────────────────
router.get("/finance/customization-analytics", requirePermission("reports:view"), async (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const targetBranchId = branchId && branchId !== "all" ? parseInt(branchId as string) : null;
  const start = startDate ? startOfDay(new Date(startDate as string)) : startOfDay(subDays(new Date(), 30));
  const end = endDate ? endOfDay(new Date(endDate as string)) : endOfDay(new Date());
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ error: "Invalid date format" });
    return;
  }

  // 1. Get all order items in period
  const items = await db
    .select({
      id: orderItemsTable.id,
      drinkId: orderItemsTable.drinkId,
      drinkName: orderItemsTable.drinkName,
      lineTotal: orderItemsTable.lineTotal,
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .where(and(
      gte(ordersTable.createdAt, start),
      lte(ordersTable.createdAt, end),
      inArray(ordersTable.status, ["paid", "ready", "completed"]),
      targetBranchId ? eq(ordersTable.branchId, targetBranchId) : undefined
    ));

  if (items.length === 0) return res.json({ drinks: [], slots: [], options: [] });

  const itemIds = items.map(i => i.id);
  const drinkIds = [...new Set(items.map(i => i.drinkId))];

  // 2. Get all customizations and recipe context
  const [rawCustoms, context] = await Promise.all([
    db.select().from(orderItemCustomizationsTable).where(inArray(orderItemCustomizationsTable.orderItemId, itemIds)),
    getRecipeContext(drinkIds)
  ]);

  // 3. Identify overrides
  const itemOverrides = new Map<number, any[]>();
  rawCustoms.forEach(c => {
    const item = items.find(i => i.id === c.orderItemId);
    if (!item) return;
    const analysis = analyzeCustomization({ ...c, drinkId: item.drinkId }, context);
    if (analysis) {
       if (!itemOverrides.has(c.orderItemId)) itemOverrides.set(c.orderItemId, []);
       itemOverrides.get(c.orderItemId)!.push(analysis);
    }
  });

  // 4. Aggregate Drink Stats
  const drinkStats = new Map<number, { name: string, totalCount: number, customizedCount: number, totalRevenue: number, customizedRevenue: number }>();
  
  items.forEach(item => {
    if (!drinkStats.has(item.drinkId)) {
      drinkStats.set(item.drinkId, { name: item.drinkName, totalCount: 0, customizedCount: 0, totalRevenue: 0, customizedRevenue: 0 });
    }
    const stats = drinkStats.get(item.drinkId)!;
    const price = parseFloat(String(item.lineTotal || "0"));
    stats.totalCount++;
    stats.totalRevenue += price;
    
    if (itemOverrides.has(item.id)) {
      stats.customizedCount++;
      stats.customizedRevenue += price;
    }
  });

  const drinksReport = Array.from(drinkStats.entries()).map(([id, s]) => ({
    id,
    name: s.name,
    totalCount: s.totalCount,
    customizedCount: s.customizedCount,
    percentage: (s.customizedCount / s.totalCount) * 100,
    totalRevenue: s.totalRevenue,
    customizedRevenue: s.customizedRevenue,
    percentageRevenue: (s.totalRevenue > 0 ? (s.customizedRevenue / s.totalRevenue) * 100 : 0)
  })).sort((a, b) => b.customizedCount - a.customizedCount);

  // 5. Aggregate Slot & Option Stats
  const slotStats = new Map<string, number>();
  const optionStats = new Map<string, { label: string, count: number, slot: string }>();

  itemOverrides.forEach((overrides) => {
    overrides.forEach(ov => {
      slotStats.set(ov.slotLabel, (slotStats.get(ov.slotLabel) || 0) + 1);
      const optKey = `${ov.slotLabel}:${ov.optionLabel}`;
      if (!optionStats.has(optKey)) {
        optionStats.set(optKey, { label: ov.optionLabel, count: 0, slot: ov.slotLabel });
      }
      optionStats.get(optKey)!.count++;
    });
  });

  const slotsReport = Array.from(slotStats.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
    
  const optionsReport = Array.from(optionStats.values())
    .sort((a, b) => b.count - a.count);

  res.json({
    drinks: drinksReport,
    slots: slotsReport,
    options: optionsReport
  });
});

export default router;

