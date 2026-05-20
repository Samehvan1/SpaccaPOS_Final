import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateDrinkData } from "../lib/price-calculator";
import { db } from "@workspace/db";
import {
  drinksTable,
  drinkIngredientSlotsTable,
  drinkSlotVolumesTable,
  drinkSlotTypeOptionsTable,
  ingredientsTable,
  ingredientOptionsTable,
  ingredientTypesTable,
  ingredientTypeVolumesTable,
  ingredientVolumesTable,
  predefinedSlotsTable,
  predefinedSlotTypeOptionsTable,
  predefinedSlotVolumesTable,
} from "@workspace/db/schema";

// Mock @workspace/db to intercept queries during testing
vi.mock("@workspace/db", async () => {
  const actual = await vi.importActual<any>("@workspace/db");
  
  let mockDataMap = new Map<string, any[]>();
  
  function getTableName(table: any): string {
    if (!table) return "";
    const drizzleNameSymbol = Symbol.for("drizzle:Name");
    if (table[drizzleNameSymbol]) return table[drizzleNameSymbol];
    if (table._?.name) return table._.name;
    return table.key || "";
  }

  const mockDb = {
    setMockData: (table: any, data: any[]) => {
      const name = getTableName(table);
      mockDataMap.set(name, data);
    },
    clearMockData: () => {
      mockDataMap.clear();
    },
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation((table) => ({
        where: vi.fn().mockImplementation(() => {
          const name = getTableName(table);
          const result = mockDataMap.get(name) || [];
          return Promise.resolve(result);
        }),
      })),
    })),
  };

  return {
    ...actual,
    db: mockDb,
  };
});

describe("calculateDrinkData", () => {
  beforeEach(() => {
    (db as any).clearMockData();
  });

  it("should calculate correct price for a basic drink without customizations", async () => {
    // Mock base drink data
    (db as any).setMockData(drinksTable, [{
      id: 1,
      name: "Espresso",
      basePrice: "15.00",
      isCustomizable: false,
      cupIngredientId: null,
    }]);

    (db as any).setMockData(drinkIngredientSlotsTable, []);

    const result = await calculateDrinkData(1, []);
    expect(result.basePrice).toBe(15);
    expect(result.totalPrice).toBe(15);
    expect(result.customizations).toHaveLength(0);
  });

  it("should add custom option costs to the base price", async () => {
    // 1. Mock drink
    (db as any).setMockData(drinksTable, [{
      id: 2,
      name: "Iced Latte",
      basePrice: "25.00",
      isCustomizable: true,
      cupIngredientId: null,
    }]);

    // 2. Mock slots
    (db as any).setMockData(drinkIngredientSlotsTable, [{
      id: 10,
      drinkId: 2,
      slotLabel: "Milk Type",
      isRequired: true,
      isDynamic: false,
      defaultOptionId: 101,
      ingredientId: 201,
      predefinedSlotId: null,
      ingredientTypeId: null,
    }]);

    // 3. Mock options (using standard 'label' property)
    (db as any).setMockData(ingredientOptionsTable, [
      { id: 101, label: "Whole Milk", extraCost: "0.00", processedQty: "0", producedQty: "0", linkedIngredientId: 201 },
      { id: 102, label: "Oat Milk", extraCost: "5.50", processedQty: "0", producedQty: "0", linkedIngredientId: 202 },
    ]);

    // 4. Mock ingredients
    (db as any).setMockData(ingredientsTable, [
      { id: 201, name: "Whole Milk" },
      { id: 202, name: "Oat Milk" },
    ]);

    // Scenario A: Default option (Whole Milk - cost +0.00)
    const resultDefault = await calculateDrinkData(2, []);
    expect(resultDefault.totalPrice).toBe(25);
    expect(resultDefault.customizations).toHaveLength(1);
    expect(resultDefault.customizations[0].optionLabel).toBe("Whole Milk");
    expect(resultDefault.customizations[0].addedCost).toBe(0);

    // Scenario B: Selected option (Oat Milk - cost +5.50)
    const resultCustom = await calculateDrinkData(2, [{ slotId: 10, optionId: 102 }]);
    expect(resultCustom.totalPrice).toBe(30.50);
    expect(resultCustom.customizations).toHaveLength(1);
    expect(resultCustom.customizations[0].optionLabel).toBe("Oat Milk");
    expect(resultCustom.customizations[0].addedCost).toBe(5.50);
  });
});
