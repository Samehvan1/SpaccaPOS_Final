import {
  db,
  usersTable,
  ingredientsTable,
  ingredientOptionsTable,
  drinksTable,
  drinkIngredientSlotsTable,
  ingredientCategoriesTable,
  ingredientTypesTable,
  ingredientVolumesTable,
  ingredientTypeVolumesTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function seedIfEmpty() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  if (count > 0) return;

  logger.info("Database is empty — seeding initial data...");

  // ── Users ──────────────────────────────────────────────────────────────────
  await db.insert(usersTable).values([
    { name: "Admin User",  role: "admin",     pin: "000000" },
    { name: "Sarah",       role: "barista",   pin: "111111" },
    { name: "James",       role: "barista",   pin: "222222" },
    { name: "Spacca POS",  role: "frontdesk", pin: "999999" },
  ]);

  // ── Ingredients (inventory) ────────────────────────────────────────────────
  const [espresso, wholeMilk, oatMilk, almondMilk, vanillaSyrup, caramelSauce, chocSauce, hazelnutSyrup, sugarSyrup, whippedCream, coldBrew, matcha, milkType] =
    await db.insert(ingredientsTable).values([
      { name: "Espresso Beans",        slug: "espresso-beans",        ingredientType: "coffee",    unit: "g",  costPerUnit: "0.5",   stockQuantity: "2000",  lowStockThreshold: "500"  },
      { name: "Whole Milk",            slug: "whole-milk",            ingredientType: "milk",      unit: "ml", costPerUnit: "0.02",  stockQuantity: "4000",  lowStockThreshold: "1000" },
      { name: "Oat Milk",              slug: "oat-milk",              ingredientType: "milk",      unit: "ml", costPerUnit: "0.04",  stockQuantity: "3000",  lowStockThreshold: "800"  },
      { name: "Almond Milk",           slug: "almond-milk",           ingredientType: "milk",      unit: "ml", costPerUnit: "0.04",  stockQuantity: "2000",  lowStockThreshold: "500"  },
      { name: "Vanilla Syrup",         slug: "vanilla-syrup",         ingredientType: "syrup",     unit: "ml", costPerUnit: "0.2",   stockQuantity: "1000",  lowStockThreshold: "200"  },
      { name: "Caramel Sauce",         slug: "caramel-sauce",         ingredientType: "sauce",     unit: "ml", costPerUnit: "0.25",  stockQuantity: "800",   lowStockThreshold: "150"  },
      { name: "Chocolate Sauce",       slug: "chocolate-sauce",       ingredientType: "sauce",     unit: "ml", costPerUnit: "0.2",   stockQuantity: "800",   lowStockThreshold: "150"  },
      { name: "Hazelnut Syrup",        slug: "hazelnut-syrup",        ingredientType: "syrup",     unit: "ml", costPerUnit: "0.22",  stockQuantity: "600",   lowStockThreshold: "100"  },
      { name: "Sugar Syrup",           slug: "sugar-syrup",           ingredientType: "sweetener", unit: "ml", costPerUnit: "0.1",   stockQuantity: "1500",  lowStockThreshold: "300"  },
      { name: "Whipped Cream",         slug: "whipped-cream",         ingredientType: "topping",   unit: "g",  costPerUnit: "0.3",   stockQuantity: "500",   lowStockThreshold: "100"  },
      { name: "Cold Brew Concentrate", slug: "cold-brew-concentrate", ingredientType: "coffee",    unit: "ml", costPerUnit: "0.4",   stockQuantity: "1500",  lowStockThreshold: "400"  },
      { name: "Matcha Powder",         slug: "matcha-powder",         ingredientType: "base",      unit: "g",  costPerUnit: "1.8",   stockQuantity: "400",   lowStockThreshold: "100"  },
      { name: "Milk Type",             slug: "milk-type",             ingredientType: "milk",      unit: "",   costPerUnit: "0",     stockQuantity: "9999",  lowStockThreshold: "0"    },
    ]).returning();

  // ── Ingredient Options (legacy system) ─────────────────────────────────────
  const opts = await db.insert(ingredientOptionsTable).values([
    { ingredientId: espresso.id,      label: "Single Shot",       processedQty: "9",   producedQty: "18",  producedUnit: "ml", extraCost: "0",  isDefault: false, sortOrder: 0 },
    { ingredientId: espresso.id,      label: "Double Shot",       processedQty: "18",  producedQty: "36",  producedUnit: "ml", extraCost: "0",  isDefault: true,  sortOrder: 1 },
    { ingredientId: espresso.id,      label: "Triple Shot",       processedQty: "27",  producedQty: "54",  producedUnit: "ml", extraCost: "10", isDefault: false, sortOrder: 2 },
    { ingredientId: wholeMilk.id,     label: "No Milk",           processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: false, sortOrder: 0 },
    { ingredientId: wholeMilk.id,     label: "Small (100ml)",     processedQty: "100", producedQty: "100", producedUnit: "ml", extraCost: "0",  isDefault: false, sortOrder: 1 },
    { ingredientId: wholeMilk.id,     label: "Medium (150ml)",    processedQty: "150", producedQty: "150", producedUnit: "ml", extraCost: "0",  isDefault: true,  sortOrder: 2 },
    { ingredientId: wholeMilk.id,     label: "Large (200ml)",     processedQty: "200", producedQty: "200", producedUnit: "ml", extraCost: "5",  isDefault: false, sortOrder: 3 },
    { ingredientId: oatMilk.id,       label: "No Oat Milk",       processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: false, sortOrder: 0 },
    { ingredientId: oatMilk.id,       label: "Small (100ml)",     processedQty: "100", producedQty: "100", producedUnit: "ml", extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientId: oatMilk.id,       label: "Medium (150ml)",    processedQty: "150", producedQty: "150", producedUnit: "ml", extraCost: "15", isDefault: true,  sortOrder: 2 },
    { ingredientId: oatMilk.id,       label: "Large (200ml)",     processedQty: "200", producedQty: "200", producedUnit: "ml", extraCost: "20", isDefault: false, sortOrder: 3 },
    { ingredientId: almondMilk.id,    label: "No Almond Milk",    processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: false, sortOrder: 0 },
    { ingredientId: almondMilk.id,    label: "Small (100ml)",     processedQty: "100", producedQty: "100", producedUnit: "ml", extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientId: almondMilk.id,    label: "Medium (150ml)",    processedQty: "150", producedQty: "150", producedUnit: "ml", extraCost: "15", isDefault: true,  sortOrder: 2 },
    { ingredientId: vanillaSyrup.id,  label: "No Syrup",          processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientId: vanillaSyrup.id,  label: "1 Pump",            processedQty: "10",  producedQty: "10",  producedUnit: "ml", extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientId: vanillaSyrup.id,  label: "2 Pumps",           processedQty: "20",  producedQty: "20",  producedUnit: "ml", extraCost: "15", isDefault: false, sortOrder: 2 },
    { ingredientId: vanillaSyrup.id,  label: "3 Pumps",           processedQty: "30",  producedQty: "30",  producedUnit: "ml", extraCost: "20", isDefault: false, sortOrder: 3 },
    { ingredientId: caramelSauce.id,  label: "No Sauce",          processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientId: caramelSauce.id,  label: "Light Drizzle",     processedQty: "10",  producedQty: "10",  producedUnit: "ml", extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientId: caramelSauce.id,  label: "Heavy Drizzle",     processedQty: "20",  producedQty: "20",  producedUnit: "ml", extraCost: "15", isDefault: false, sortOrder: 2 },
    { ingredientId: chocSauce.id,     label: "No Sauce",          processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientId: chocSauce.id,     label: "Light Drizzle",     processedQty: "10",  producedQty: "10",  producedUnit: "ml", extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientId: chocSauce.id,     label: "Heavy Drizzle",     processedQty: "20",  producedQty: "20",  producedUnit: "ml", extraCost: "15", isDefault: false, sortOrder: 2 },
    { ingredientId: hazelnutSyrup.id, label: "No Syrup",          processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientId: hazelnutSyrup.id, label: "1 Pump",            processedQty: "10",  producedQty: "10",  producedUnit: "ml", extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientId: hazelnutSyrup.id, label: "2 Pumps",           processedQty: "20",  producedQty: "20",  producedUnit: "ml", extraCost: "15", isDefault: false, sortOrder: 2 },
    { ingredientId: whippedCream.id,  label: "No Cream",          processedQty: "0",   producedQty: "0",   producedUnit: "g",  extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientId: whippedCream.id,  label: "Add Whipped Cream", processedQty: "30",  producedQty: "30",  producedUnit: "g",  extraCost: "15", isDefault: false, sortOrder: 1 },
    { ingredientId: matcha.id,        label: "Single Scoop",      processedQty: "3",   producedQty: "3",   producedUnit: "g",  extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientId: matcha.id,        label: "Double Scoop",      processedQty: "6",   producedQty: "6",   producedUnit: "g",  extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientId: milkType.id,      label: "Whole Milk",        processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: true,  sortOrder: 0, linkedIngredientId: wholeMilk.id  },
    { ingredientId: milkType.id,      label: "Oat Milk",          processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: false, sortOrder: 1, linkedIngredientId: oatMilk.id   },
    { ingredientId: milkType.id,      label: "Almond Milk",       processedQty: "0",   producedQty: "0",   producedUnit: "ml", extraCost: "0",  isDefault: false, sortOrder: 2, linkedIngredientId: almondMilk.id },
  ]).returning();

  const [shotSingle, shotDouble, shotTriple,
    wNoMilk, wSmall, wMedium, wLarge,
    oNoMilk, oSmall, oMedium, oLarge,
    aNoMilk, aSmall, aMedium,
    vNone, v1, v2, v3,
    cNone, cLight, cHeavy,
    chNone, chLight, chHeavy,
    hNone, h1, h2,
    whNone, whAdd,
    matSingle, matDouble,
    mtWhole, mtOat, mtAlmond] = opts;

  // ── Catalog: Categories ───────────────────────────────────────────────────
  const [catCoffee, catMilk, catSyrup, catSauce, catTopping] =
    await db.insert(ingredientCategoriesTable).values([
      { name: "Coffee",  sortOrder: 0 },
      { name: "Milk",    sortOrder: 1 },
      { name: "Syrup",   sortOrder: 2 },
      { name: "Sauce",   sortOrder: 3 },
      { name: "Topping", sortOrder: 4 },
    ]).returning();

  // ── Catalog: Types ────────────────────────────────────────────────────────
  const [typEspresso, typWhole, typOat, typAlmond, typVanilla, typCaramel, typChoc, typHazelnut, typWhipped] =
    await db.insert(ingredientTypesTable).values([
      { categoryId: catCoffee.id,  name: "Espresso",          inventoryIngredientId: espresso.id,      isActive: true, sortOrder: 0 },
      { categoryId: catMilk.id,    name: "Whole Milk",         inventoryIngredientId: wholeMilk.id,     isActive: true, sortOrder: 0 },
      { categoryId: catMilk.id,    name: "Oat Milk",           inventoryIngredientId: oatMilk.id,       isActive: true, sortOrder: 1 },
      { categoryId: catMilk.id,    name: "Almond Milk",        inventoryIngredientId: almondMilk.id,    isActive: true, sortOrder: 2 },
      { categoryId: catSyrup.id,   name: "Vanilla Syrup",      inventoryIngredientId: vanillaSyrup.id,  isActive: true, sortOrder: 0 },
      { categoryId: catSauce.id,   name: "Caramel Sauce",      inventoryIngredientId: caramelSauce.id,  isActive: true, sortOrder: 0 },
      { categoryId: catSauce.id,   name: "Chocolate Sauce",    inventoryIngredientId: chocSauce.id,     isActive: true, sortOrder: 1 },
      { categoryId: catSyrup.id,   name: "Hazelnut Syrup",     inventoryIngredientId: hazelnutSyrup.id, isActive: true, sortOrder: 1 },
      { categoryId: catTopping.id, name: "Whipped Cream",      inventoryIngredientId: whippedCream.id,  isActive: true, sortOrder: 0 },
    ]).returning();

  // ── Catalog: Volumes (global reusable definitions) ────────────────────────
  const [volSingle, volDouble, volTriple,
    volNoMilk, volSmall100, volMed150, volLarge200,
    volNone, vol1Pump, vol2Pumps, vol3Pumps,
    volNoSauce, volLightDrizzle, volHeavyDrizzle,
    volNoCream, volAddCream] =
    await db.insert(ingredientVolumesTable).values([
      // Espresso shots
      { name: "Single Shot",    processedQty: "9",   producedQty: "18",  unit: "ml", sortOrder: 0 },
      { name: "Double Shot",    processedQty: "18",  producedQty: "36",  unit: "ml", sortOrder: 1 },
      { name: "Triple Shot",    processedQty: "27",  producedQty: "54",  unit: "ml", sortOrder: 2 },
      // Milk sizes
      { name: "No Milk",        processedQty: "0",   producedQty: "0",   unit: "ml", sortOrder: 3 },
      { name: "Small (100ml)",  processedQty: "100", producedQty: "100", unit: "ml", sortOrder: 4 },
      { name: "Medium (150ml)", processedQty: "150", producedQty: "150", unit: "ml", sortOrder: 5 },
      { name: "Large (200ml)",  processedQty: "200", producedQty: "200", unit: "ml", sortOrder: 6 },
      // Syrup pumps
      { name: "None",           processedQty: "0",   producedQty: "0",   unit: "ml", sortOrder: 7 },
      { name: "1 Pump",         processedQty: "10",  producedQty: "10",  unit: "ml", sortOrder: 8 },
      { name: "2 Pumps",        processedQty: "20",  producedQty: "20",  unit: "ml", sortOrder: 9 },
      { name: "3 Pumps",        processedQty: "30",  producedQty: "30",  unit: "ml", sortOrder: 10 },
      // Sauce drizzle
      { name: "No Sauce",       processedQty: "0",   producedQty: "0",   unit: "ml", sortOrder: 11 },
      { name: "Light Drizzle",  processedQty: "10",  producedQty: "10",  unit: "ml", sortOrder: 12 },
      { name: "Heavy Drizzle",  processedQty: "20",  producedQty: "20",  unit: "ml", sortOrder: 13 },
      // Cream
      { name: "No Cream",       processedQty: "0",   producedQty: "0",   unit: "g",  sortOrder: 14 },
      { name: "Add Cream",      processedQty: "30",  producedQty: "30",  unit: "g",  sortOrder: 15 },
    ]).returning();

  // ── Catalog: Type Volumes ─────────────────────────────────────────────────
  await db.insert(ingredientTypeVolumesTable).values([
    // Espresso shots
    { ingredientTypeId: typEspresso.id,  volumeId: volSingle.id,        extraCost: "0",  isDefault: false, sortOrder: 0 },
    { ingredientTypeId: typEspresso.id,  volumeId: volDouble.id,        extraCost: "0",  isDefault: true,  sortOrder: 1 },
    { ingredientTypeId: typEspresso.id,  volumeId: volTriple.id,        extraCost: "10", isDefault: false, sortOrder: 2 },
    // Whole Milk
    { ingredientTypeId: typWhole.id,     volumeId: volNoMilk.id,        extraCost: "0",  isDefault: false, sortOrder: 0 },
    { ingredientTypeId: typWhole.id,     volumeId: volSmall100.id,      extraCost: "0",  isDefault: false, sortOrder: 1 },
    { ingredientTypeId: typWhole.id,     volumeId: volMed150.id,        extraCost: "0",  isDefault: true,  sortOrder: 2 },
    { ingredientTypeId: typWhole.id,     volumeId: volLarge200.id,      extraCost: "5",  isDefault: false, sortOrder: 3 },
    // Oat Milk
    { ingredientTypeId: typOat.id,       volumeId: volNoMilk.id,        extraCost: "0",  isDefault: false, sortOrder: 0 },
    { ingredientTypeId: typOat.id,       volumeId: volSmall100.id,      extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientTypeId: typOat.id,       volumeId: volMed150.id,        extraCost: "15", isDefault: true,  sortOrder: 2 },
    { ingredientTypeId: typOat.id,       volumeId: volLarge200.id,      extraCost: "20", isDefault: false, sortOrder: 3 },
    // Almond Milk
    { ingredientTypeId: typAlmond.id,    volumeId: volNoMilk.id,        extraCost: "0",  isDefault: false, sortOrder: 0 },
    { ingredientTypeId: typAlmond.id,    volumeId: volSmall100.id,      extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientTypeId: typAlmond.id,    volumeId: volMed150.id,        extraCost: "15", isDefault: true,  sortOrder: 2 },
    // Vanilla Syrup
    { ingredientTypeId: typVanilla.id,   volumeId: volNone.id,          extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientTypeId: typVanilla.id,   volumeId: vol1Pump.id,         extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientTypeId: typVanilla.id,   volumeId: vol2Pumps.id,        extraCost: "15", isDefault: false, sortOrder: 2 },
    { ingredientTypeId: typVanilla.id,   volumeId: vol3Pumps.id,        extraCost: "20", isDefault: false, sortOrder: 3 },
    // Caramel Sauce
    { ingredientTypeId: typCaramel.id,   volumeId: volNoSauce.id,       extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientTypeId: typCaramel.id,   volumeId: volLightDrizzle.id,  extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientTypeId: typCaramel.id,   volumeId: volHeavyDrizzle.id,  extraCost: "15", isDefault: false, sortOrder: 2 },
    // Chocolate Sauce
    { ingredientTypeId: typChoc.id,      volumeId: volNoSauce.id,       extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientTypeId: typChoc.id,      volumeId: volLightDrizzle.id,  extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientTypeId: typChoc.id,      volumeId: volHeavyDrizzle.id,  extraCost: "15", isDefault: false, sortOrder: 2 },
    // Hazelnut Syrup
    { ingredientTypeId: typHazelnut.id,  volumeId: volNone.id,          extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientTypeId: typHazelnut.id,  volumeId: vol1Pump.id,         extraCost: "10", isDefault: false, sortOrder: 1 },
    { ingredientTypeId: typHazelnut.id,  volumeId: vol2Pumps.id,        extraCost: "15", isDefault: false, sortOrder: 2 },
    // Whipped Cream
    { ingredientTypeId: typWhipped.id,   volumeId: volNoCream.id,       extraCost: "0",  isDefault: true,  sortOrder: 0 },
    { ingredientTypeId: typWhipped.id,   volumeId: volAddCream.id,      extraCost: "15", isDefault: false, sortOrder: 1 },
  ]);

  // ── Drinks ─────────────────────────────────────────────────────────────────
  const [flatWhite, cappuccino, latte, americano, caramelLatte, espressoChoc, vanillaLatte, coldBrewDrink, icedLatte, matchaLatte, hazelnutMacchiato, icedCaramel, whiteMokka] =
    await db.insert(drinksTable).values([
      { name: "Flat White",              description: "Smooth espresso with silky steamed milk",                  category: "Hot Coffee",  basePrice: "150", prepTimeSeconds: 180, kitchenStation: "main" },
      { name: "Cappuccino",              description: "Espresso with equal parts steamed and foamed milk",        category: "Hot Coffee",  basePrice: "140", prepTimeSeconds: 180, kitchenStation: "main" },
      { name: "Latte",                   description: "Espresso with generous steamed milk",                      category: "Hot Coffee",  basePrice: "130", prepTimeSeconds: 180, kitchenStation: "main" },
      { name: "Americano",               description: "Espresso diluted with hot water",                          category: "Hot Coffee",  basePrice: "95",  prepTimeSeconds: 120, kitchenStation: "main" },
      { name: "Caramel Latte",           description: "Latte with caramel sauce and syrup",                       category: "Hot Coffee",  basePrice: "175", prepTimeSeconds: 200, kitchenStation: "main" },
      { name: "Espresso Chocolate",      description: "Espresso with chocolate sauce and steamed milk",           category: "Hot Coffee",  basePrice: "155", prepTimeSeconds: 200, kitchenStation: "main" },
      { name: "Vanilla Latte",           description: "Latte with vanilla syrup",                                 category: "Hot Coffee",  basePrice: "155", prepTimeSeconds: 180, kitchenStation: "main" },
      { name: "Cold Brew",               description: "Smooth cold brew concentrate over ice",                    category: "Cold Brew",   basePrice: "140", prepTimeSeconds: 60,  kitchenStation: "cold" },
      { name: "Iced Latte",              description: "Espresso with cold milk over ice",                         category: "Cold Coffee", basePrice: "140", prepTimeSeconds: 120, kitchenStation: "cold" },
      { name: "Matcha Latte",            description: "Ceremonial matcha with steamed milk",                      category: "Specialty",   basePrice: "170", prepTimeSeconds: 210, kitchenStation: "main" },
      { name: "Hazelnut Macchiato",      description: "Espresso with hazelnut syrup and a splash of milk",        category: "Hot Coffee",  basePrice: "165", prepTimeSeconds: 150, kitchenStation: "main" },
      { name: "Iced Caramel Macchiato",  description: "Cold espresso with vanilla and caramel over milk",         category: "Cold Coffee", basePrice: "175", prepTimeSeconds: 150, kitchenStation: "cold" },
      { name: "White Mokka",             description: "Espresso with White chocolate sauce and steamed milk",     category: "Hot Coffee",  basePrice: "160", prepTimeSeconds: 120, kitchenStation: "main" },
    ]).returning();

  // ── Drink Ingredient Slots (legacy system — unchanged) ────────────────────
  await db.insert(drinkIngredientSlotsTable).values([
    { drinkId: flatWhite.id,         ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: flatWhite.id,         ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 1 },
    { drinkId: cappuccino.id,        ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: cappuccino.id,        ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 1 },
    { drinkId: latte.id,             ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: latte.id,             ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 1 },
    { drinkId: latte.id,             ingredientId: vanillaSyrup.id,  slotLabel: "Syrup",           isRequired: false, defaultOptionId: vNone.id,      sortOrder: 2 },
    { drinkId: americano.id,         ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: caramelLatte.id,      ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: caramelLatte.id,      ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 1 },
    { drinkId: caramelLatte.id,      ingredientId: caramelSauce.id,  slotLabel: "Caramel Sauce",   isRequired: true,  defaultOptionId: cLight.id,     sortOrder: 2 },
    { drinkId: espressoChoc.id,      ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: espressoChoc.id,      ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 1 },
    { drinkId: espressoChoc.id,      ingredientId: chocSauce.id,     slotLabel: "Chocolate Sauce", isRequired: true,  defaultOptionId: chLight.id,    sortOrder: 2 },
    { drinkId: vanillaLatte.id,      ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: vanillaLatte.id,      ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 1 },
    { drinkId: vanillaLatte.id,      ingredientId: vanillaSyrup.id,  slotLabel: "Vanilla Syrup",   isRequired: true,  defaultOptionId: v1.id,         sortOrder: 2 },
    { drinkId: coldBrewDrink.id,     ingredientId: coldBrew.id,      slotLabel: "Cold Brew",       isRequired: true,  defaultOptionId: null,          sortOrder: 0 },
    { drinkId: icedLatte.id,         ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: icedLatte.id,         ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtOat.id,      sortOrder: 1 },
    { drinkId: matchaLatte.id,       ingredientId: matcha.id,        slotLabel: "Matcha",          isRequired: true,  defaultOptionId: matSingle.id,  sortOrder: 0 },
    { drinkId: matchaLatte.id,       ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtOat.id,      sortOrder: 1 },
    { drinkId: hazelnutMacchiato.id, ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: hazelnutMacchiato.id, ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 1 },
    { drinkId: hazelnutMacchiato.id, ingredientId: hazelnutSyrup.id, slotLabel: "Hazelnut Syrup",  isRequired: true,  defaultOptionId: h1.id,         sortOrder: 2 },
    { drinkId: icedCaramel.id,       ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: icedCaramel.id,       ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 1 },
    { drinkId: icedCaramel.id,       ingredientId: vanillaSyrup.id,  slotLabel: "Vanilla Syrup",   isRequired: false, defaultOptionId: v1.id,         sortOrder: 2 },
    { drinkId: icedCaramel.id,       ingredientId: caramelSauce.id,  slotLabel: "Caramel Drizzle", isRequired: false, defaultOptionId: cLight.id,     sortOrder: 3 },
    { drinkId: whiteMokka.id,        ingredientId: espresso.id,      slotLabel: "Espresso",        isRequired: true,  defaultOptionId: shotDouble.id, sortOrder: 0 },
    { drinkId: whiteMokka.id,        ingredientId: chocSauce.id,     slotLabel: "Chocolate",       isRequired: true,  defaultOptionId: chLight.id,    sortOrder: 1 },
    { drinkId: whiteMokka.id,        ingredientId: milkType.id,      slotLabel: "Milk",            isRequired: true,  defaultOptionId: mtWhole.id,    sortOrder: 2 },
  ]);

  logger.info("Seed complete — 4 users, 13 ingredients, 5 catalog categories, 9 types, 16 volumes, 13 drinks inserted.");
}
