import { z } from "zod";
import * as api from "./generated/api";
type Infer<T extends z.ZodType<any, any, any>> = z.infer<T>;
export declare const HealthCheckResponse: z.ZodObject<{
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: string;
}, {
    status: string;
}>;
export type HealthCheckResponse = Infer<typeof api.HealthCheckResponse>;
export declare const BaristaLoginBody: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type BaristaLoginBody = Infer<typeof api.BaristaLoginBody>;
export declare const BaristaLoginResponse: z.ZodObject<{} & {
    user: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        branch: z.ZodOptional<z.ZodObject<{
            id: z.ZodOptional<z.ZodNumber>;
            name: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id?: number | undefined;
            name?: string | undefined;
        }, {
            id?: number | undefined;
            name?: string | undefined;
        }>>;
    } & {
        role: z.ZodString;
        permissions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        role: string;
        permissions: string[];
        branchId?: number | null | undefined;
        branch?: {
            id?: number | undefined;
            name?: string | undefined;
        } | undefined;
    }, {
        id: number;
        name: string;
        role: string;
        permissions: string[];
        branchId?: number | null | undefined;
        branch?: {
            id?: number | undefined;
            name?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    user: {
        id: number;
        name: string;
        role: string;
        permissions: string[];
        branchId?: number | null | undefined;
        branch?: {
            id?: number | undefined;
            name?: string | undefined;
        } | undefined;
    };
}, {
    user: {
        id: number;
        name: string;
        role: string;
        permissions: string[];
        branchId?: number | null | undefined;
        branch?: {
            id?: number | undefined;
            name?: string | undefined;
        } | undefined;
    };
}>;
export type BaristaLoginResponse = Infer<typeof BaristaLoginResponse>;
export declare const GetMeResponse: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    branch: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodNumber>;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id?: number | undefined;
        name?: string | undefined;
    }, {
        id?: number | undefined;
        name?: string | undefined;
    }>>;
} & {
    role: z.ZodString;
    permissions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    role: string;
    permissions: string[];
    branchId?: number | null | undefined;
    branch?: {
        id?: number | undefined;
        name?: string | undefined;
    } | undefined;
}, {
    id: number;
    name: string;
    role: string;
    permissions: string[];
    branchId?: number | null | undefined;
    branch?: {
        id?: number | undefined;
        name?: string | undefined;
    } | undefined;
}>;
export type GetMeResponse = Infer<typeof GetMeResponse>;
export declare const ListDrinksQueryParams: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
    includeSlots: z.ZodOptional<z.ZodBoolean>;
    branchId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    branchId?: number | undefined;
    category?: string | undefined;
    active?: boolean | undefined;
    includeSlots?: boolean | undefined;
}, {
    branchId?: number | undefined;
    category?: string | undefined;
    active?: boolean | undefined;
    includeSlots?: boolean | undefined;
}>;
export type ListDrinksQueryParams = Infer<typeof api.ListDrinksQueryParams>;
export declare const ListDrinksResponseItem: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    category: z.ZodString;
    basePrice: z.ZodNumber;
    defaultPrice: z.ZodOptional<z.ZodNumber>;
    imageUrl: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    prepTimeSeconds: z.ZodNumber;
    cupSizeMl: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cupIngredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isCustomizable: z.ZodOptional<z.ZodBoolean>;
    kitchenStation: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    prepTimeSeconds: number;
    createdAt: string;
    updatedAt: string;
    defaultPrice?: number | undefined;
    cupSizeMl?: number | null | undefined;
    cupIngredientId?: number | null | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
}, {
    id: number;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    prepTimeSeconds: number;
    createdAt: string;
    updatedAt: string;
    defaultPrice?: number | undefined;
    cupSizeMl?: number | null | undefined;
    cupIngredientId?: number | null | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
}>;
export type ListDrinksResponseItem = Infer<typeof api.ListDrinksResponseItem>;
export declare const ListDrinksResponse: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    category: z.ZodString;
    basePrice: z.ZodNumber;
    defaultPrice: z.ZodOptional<z.ZodNumber>;
    imageUrl: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    prepTimeSeconds: z.ZodNumber;
    cupSizeMl: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cupIngredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isCustomizable: z.ZodOptional<z.ZodBoolean>;
    kitchenStation: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    prepTimeSeconds: number;
    createdAt: string;
    updatedAt: string;
    defaultPrice?: number | undefined;
    cupSizeMl?: number | null | undefined;
    cupIngredientId?: number | null | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
}, {
    id: number;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    prepTimeSeconds: number;
    createdAt: string;
    updatedAt: string;
    defaultPrice?: number | undefined;
    cupSizeMl?: number | null | undefined;
    cupIngredientId?: number | null | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
}>, "many">;
export type ListDrinksResponse = Infer<typeof api.ListDrinksResponse>;
export declare const CreateDrinkBody: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    basePrice: z.ZodNumber;
    imageUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    prepTimeSeconds: z.ZodOptional<z.ZodNumber>;
    kitchenStation: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    cupIngredientId: z.ZodOptional<z.ZodNumber>;
    isCustomizable: z.ZodOptional<z.ZodBoolean>;
    slots: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodNumber;
        slotLabel: z.ZodString;
        isRequired: z.ZodOptional<z.ZodBoolean>;
        defaultOptionId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
        baristaSortOrder: z.ZodOptional<z.ZodNumber>;
        customerSortOrder: z.ZodOptional<z.ZodNumber>;
        isDynamic: z.ZodOptional<z.ZodBoolean>;
        affectsCupSize: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        ingredientId: number;
        slotLabel: string;
        sortOrder?: number | undefined;
        isRequired?: boolean | undefined;
        defaultOptionId?: number | null | undefined;
        baristaSortOrder?: number | undefined;
        customerSortOrder?: number | undefined;
        isDynamic?: boolean | undefined;
        affectsCupSize?: boolean | null | undefined;
    }, {
        ingredientId: number;
        slotLabel: string;
        sortOrder?: number | undefined;
        isRequired?: boolean | undefined;
        defaultOptionId?: number | null | undefined;
        baristaSortOrder?: number | undefined;
        customerSortOrder?: number | undefined;
        isDynamic?: boolean | undefined;
        affectsCupSize?: boolean | null | undefined;
    }>, "many">>;
} & {
    kitchenStationId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: string;
    basePrice: number;
    description?: string | undefined;
    imageUrl?: string | undefined;
    isActive?: boolean | undefined;
    prepTimeSeconds?: number | undefined;
    cupIngredientId?: number | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
    slots?: {
        ingredientId: number;
        slotLabel: string;
        sortOrder?: number | undefined;
        isRequired?: boolean | undefined;
        defaultOptionId?: number | null | undefined;
        baristaSortOrder?: number | undefined;
        customerSortOrder?: number | undefined;
        isDynamic?: boolean | undefined;
        affectsCupSize?: boolean | null | undefined;
    }[] | undefined;
    kitchenStationId?: number | null | undefined;
}, {
    name: string;
    category: string;
    basePrice: number;
    description?: string | undefined;
    imageUrl?: string | undefined;
    isActive?: boolean | undefined;
    prepTimeSeconds?: number | undefined;
    cupIngredientId?: number | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
    slots?: {
        ingredientId: number;
        slotLabel: string;
        sortOrder?: number | undefined;
        isRequired?: boolean | undefined;
        defaultOptionId?: number | null | undefined;
        baristaSortOrder?: number | undefined;
        customerSortOrder?: number | undefined;
        isDynamic?: boolean | undefined;
        affectsCupSize?: boolean | null | undefined;
    }[] | undefined;
    kitchenStationId?: number | null | undefined;
}>;
export type CreateDrinkBody = Infer<typeof CreateDrinkBody>;
export declare const GetDrinkParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type GetDrinkParams = Infer<typeof api.GetDrinkParams>;
export declare const GetDrinkResponse: z.ZodIntersection<z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    category: z.ZodString;
    basePrice: z.ZodNumber;
    defaultPrice: z.ZodOptional<z.ZodNumber>;
    imageUrl: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    prepTimeSeconds: z.ZodNumber;
    cupSizeMl: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cupIngredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isCustomizable: z.ZodOptional<z.ZodBoolean>;
    kitchenStation: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    prepTimeSeconds: number;
    createdAt: string;
    updatedAt: string;
    defaultPrice?: number | undefined;
    cupSizeMl?: number | null | undefined;
    cupIngredientId?: number | null | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
}, {
    id: number;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    prepTimeSeconds: number;
    createdAt: string;
    updatedAt: string;
    defaultPrice?: number | undefined;
    cupSizeMl?: number | null | undefined;
    cupIngredientId?: number | null | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
}>, z.ZodObject<{
    slots: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        drinkId: z.ZodNumber;
        ingredientId: z.ZodNumber;
        slotLabel: z.ZodString;
        isRequired: z.ZodBoolean;
        defaultOptionId: z.ZodNullable<z.ZodNumber>;
        sortOrder: z.ZodNumber;
        baristaSortOrder: z.ZodNumber;
        customerSortOrder: z.ZodNumber;
        isDynamic: z.ZodOptional<z.ZodBoolean>;
        affectsCupSize: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        sortOrder: number;
        ingredientId: number;
        slotLabel: string;
        isRequired: boolean;
        defaultOptionId: number | null;
        baristaSortOrder: number;
        customerSortOrder: number;
        drinkId: number;
        isDynamic?: boolean | undefined;
        affectsCupSize?: boolean | null | undefined;
    }, {
        id: number;
        sortOrder: number;
        ingredientId: number;
        slotLabel: string;
        isRequired: boolean;
        defaultOptionId: number | null;
        baristaSortOrder: number;
        customerSortOrder: number;
        drinkId: number;
        isDynamic?: boolean | undefined;
        affectsCupSize?: boolean | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    slots: {
        id: number;
        sortOrder: number;
        ingredientId: number;
        slotLabel: string;
        isRequired: boolean;
        defaultOptionId: number | null;
        baristaSortOrder: number;
        customerSortOrder: number;
        drinkId: number;
        isDynamic?: boolean | undefined;
        affectsCupSize?: boolean | null | undefined;
    }[];
}, {
    slots: {
        id: number;
        sortOrder: number;
        ingredientId: number;
        slotLabel: string;
        isRequired: boolean;
        defaultOptionId: number | null;
        baristaSortOrder: number;
        customerSortOrder: number;
        drinkId: number;
        isDynamic?: boolean | undefined;
        affectsCupSize?: boolean | null | undefined;
    }[];
}>>;
export type GetDrinkResponse = Infer<typeof api.GetDrinkResponse>;
export declare const UpdateDrinkParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type UpdateDrinkParams = Infer<typeof api.UpdateDrinkParams>;
export declare const UpdateDrinkBody: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodOptional<z.ZodNumber>;
    imageUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    prepTimeSeconds: z.ZodOptional<z.ZodNumber>;
    kitchenStation: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    cupIngredientId: z.ZodOptional<z.ZodNumber>;
    isCustomizable: z.ZodOptional<z.ZodBoolean>;
} & {
    kitchenStationId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    category?: string | undefined;
    description?: string | undefined;
    basePrice?: number | undefined;
    imageUrl?: string | undefined;
    isActive?: boolean | undefined;
    prepTimeSeconds?: number | undefined;
    cupIngredientId?: number | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
    kitchenStationId?: number | null | undefined;
}, {
    name?: string | undefined;
    category?: string | undefined;
    description?: string | undefined;
    basePrice?: number | undefined;
    imageUrl?: string | undefined;
    isActive?: boolean | undefined;
    prepTimeSeconds?: number | undefined;
    cupIngredientId?: number | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
    kitchenStationId?: number | null | undefined;
}>;
export type UpdateDrinkBody = Infer<typeof UpdateDrinkBody>;
export declare const UpdateDrinkResponse: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    category: z.ZodString;
    basePrice: z.ZodNumber;
    defaultPrice: z.ZodOptional<z.ZodNumber>;
    imageUrl: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    prepTimeSeconds: z.ZodNumber;
    cupSizeMl: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cupIngredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isCustomizable: z.ZodOptional<z.ZodBoolean>;
    kitchenStation: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    prepTimeSeconds: number;
    createdAt: string;
    updatedAt: string;
    defaultPrice?: number | undefined;
    cupSizeMl?: number | null | undefined;
    cupIngredientId?: number | null | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
}, {
    id: number;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    imageUrl: string | null;
    isActive: boolean;
    prepTimeSeconds: number;
    createdAt: string;
    updatedAt: string;
    defaultPrice?: number | undefined;
    cupSizeMl?: number | null | undefined;
    cupIngredientId?: number | null | undefined;
    isCustomizable?: boolean | undefined;
    kitchenStation?: string | undefined;
    categoryId?: number | undefined;
    sortOrder?: number | undefined;
}>;
export type UpdateDrinkResponse = Infer<typeof api.UpdateDrinkResponse>;
export declare const DeleteDrinkParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type DeleteDrinkParams = Infer<typeof api.DeleteDrinkParams>;
export declare const CalculateDrinkPriceParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type CalculateDrinkPriceParams = Infer<typeof api.CalculateDrinkPriceParams>;
export declare const CalculateDrinkPriceBody: z.ZodObject<{
    branchId: z.ZodOptional<z.ZodNumber>;
    selections: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodOptional<z.ZodNumber>;
        optionId: z.ZodOptional<z.ZodNumber>;
        subOptionId: z.ZodOptional<z.ZodNumber>;
        slotId: z.ZodOptional<z.ZodNumber>;
        typeVolumeId: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        ingredientId?: number | undefined;
        optionId?: number | undefined;
        subOptionId?: number | undefined;
        slotId?: number | undefined;
        typeVolumeId?: number | undefined;
    }, {
        ingredientId?: number | undefined;
        optionId?: number | undefined;
        subOptionId?: number | undefined;
        slotId?: number | undefined;
        typeVolumeId?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    selections: {
        ingredientId?: number | undefined;
        optionId?: number | undefined;
        subOptionId?: number | undefined;
        slotId?: number | undefined;
        typeVolumeId?: number | undefined;
    }[];
    branchId?: number | undefined;
}, {
    selections: {
        ingredientId?: number | undefined;
        optionId?: number | undefined;
        subOptionId?: number | undefined;
        slotId?: number | undefined;
        typeVolumeId?: number | undefined;
    }[];
    branchId?: number | undefined;
}>;
export type CalculateDrinkPriceBody = Infer<typeof api.CalculateDrinkPriceBody>;
export declare const CalculateDrinkPriceResponse: z.ZodObject<{
    basePrice: z.ZodNumber;
    extras: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        ingredientTypeId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        slotLabel: z.ZodString;
        optionLabel: z.ZodString;
        extraCost: z.ZodNumber;
        consumedQty: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        slotLabel: string;
        optionLabel: string;
        extraCost: number;
        ingredientId?: number | null | undefined;
        ingredientTypeId?: number | null | undefined;
        consumedQty?: number | undefined;
    }, {
        slotLabel: string;
        optionLabel: string;
        extraCost: number;
        ingredientId?: number | null | undefined;
        ingredientTypeId?: number | null | undefined;
        consumedQty?: number | undefined;
    }>, "many">;
    dynamicInfo: z.ZodOptional<z.ZodObject<{
        slotLabel: z.ZodString;
        ingredientName: z.ZodString;
        filledMl: z.ZodNumber;
        cost: z.ZodNumber;
        ingredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        consumedQty: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        slotLabel: string;
        ingredientName: string;
        filledMl: number;
        cost: number;
        ingredientId?: number | null | undefined;
        consumedQty?: number | undefined;
    }, {
        slotLabel: string;
        ingredientName: string;
        filledMl: number;
        cost: number;
        ingredientId?: number | null | undefined;
        consumedQty?: number | undefined;
    }>>;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    basePrice: number;
    extras: {
        slotLabel: string;
        optionLabel: string;
        extraCost: number;
        ingredientId?: number | null | undefined;
        ingredientTypeId?: number | null | undefined;
        consumedQty?: number | undefined;
    }[];
    total: number;
    dynamicInfo?: {
        slotLabel: string;
        ingredientName: string;
        filledMl: number;
        cost: number;
        ingredientId?: number | null | undefined;
        consumedQty?: number | undefined;
    } | undefined;
}, {
    basePrice: number;
    extras: {
        slotLabel: string;
        optionLabel: string;
        extraCost: number;
        ingredientId?: number | null | undefined;
        ingredientTypeId?: number | null | undefined;
        consumedQty?: number | undefined;
    }[];
    total: number;
    dynamicInfo?: {
        slotLabel: string;
        ingredientName: string;
        filledMl: number;
        cost: number;
        ingredientId?: number | null | undefined;
        consumedQty?: number | undefined;
    } | undefined;
}>;
export type CalculateDrinkPriceResponse = Infer<typeof api.CalculateDrinkPriceResponse>;
export declare const ListIngredientsQueryParams: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
    branchId: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    branchId?: string | number | undefined;
    active?: boolean | undefined;
}, {
    type?: string | undefined;
    branchId?: string | number | undefined;
    active?: boolean | undefined;
}>;
export type ListIngredientsQueryParams = Infer<typeof api.ListIngredientsQueryParams>;
export declare const ListIngredientsResponseItem: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    ingredientType: z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    stockQuantity: z.ZodNumber;
    startupQuantity: z.ZodNumber;
    lowStockThreshold: z.ZodNumber;
    isActive: z.ZodBoolean;
    linkedTypeCount: z.ZodOptional<z.ZodNumber>;
    linkedProductCount: z.ZodOptional<z.ZodNumber>;
    conversions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ingredientId: z.ZodNumber;
        unitName: z.ZodString;
        conversionFactor: z.ZodNumber;
        isDefaultPurchase: z.ZodBoolean;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}>;
export type ListIngredientsResponseItem = Infer<typeof api.ListIngredientsResponseItem>;
export declare const ListIngredientsResponse: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    ingredientType: z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    stockQuantity: z.ZodNumber;
    startupQuantity: z.ZodNumber;
    lowStockThreshold: z.ZodNumber;
    isActive: z.ZodBoolean;
    linkedTypeCount: z.ZodOptional<z.ZodNumber>;
    linkedProductCount: z.ZodOptional<z.ZodNumber>;
    conversions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ingredientId: z.ZodNumber;
        unitName: z.ZodString;
        conversionFactor: z.ZodNumber;
        isDefaultPurchase: z.ZodBoolean;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}>, "many">;
export type ListIngredientsResponse = Infer<typeof api.ListIngredientsResponse>;
export declare const CreateIngredientBody: z.ZodObject<{
    name: z.ZodString;
    ingredientType: z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    stockQuantity: z.ZodOptional<z.ZodNumber>;
    startupQuantity: z.ZodOptional<z.ZodNumber>;
    lowStockThreshold: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
} & {
    openedShelfLifeDays: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    isActive?: boolean | undefined;
    stockQuantity?: number | undefined;
    startupQuantity?: number | undefined;
    lowStockThreshold?: number | undefined;
    openedShelfLifeDays?: number | null | undefined;
}, {
    name: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    isActive?: boolean | undefined;
    stockQuantity?: number | undefined;
    startupQuantity?: number | undefined;
    lowStockThreshold?: number | undefined;
    openedShelfLifeDays?: number | null | undefined;
}>;
export type CreateIngredientBody = Infer<typeof CreateIngredientBody>;
export declare const GetIngredientParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type GetIngredientParams = Infer<typeof api.GetIngredientParams>;
export declare const GetIngredientResponse: z.ZodIntersection<z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    ingredientType: z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    stockQuantity: z.ZodNumber;
    startupQuantity: z.ZodNumber;
    lowStockThreshold: z.ZodNumber;
    isActive: z.ZodBoolean;
    linkedTypeCount: z.ZodOptional<z.ZodNumber>;
    linkedProductCount: z.ZodOptional<z.ZodNumber>;
    conversions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ingredientId: z.ZodNumber;
        unitName: z.ZodString;
        conversionFactor: z.ZodNumber;
        isDefaultPurchase: z.ZodBoolean;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}>, z.ZodObject<{
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ingredientId: z.ZodNumber;
        label: z.ZodString;
        processedQty: z.ZodNumber;
        producedQty: z.ZodNumber;
        producedUnit: z.ZodString;
        extraCost: z.ZodNumber;
        isDefault: z.ZodBoolean;
        linkedIngredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        sortOrder: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: number;
        sortOrder: number;
        ingredientId: number;
        extraCost: number;
        label: string;
        processedQty: number;
        producedQty: number;
        producedUnit: string;
        isDefault: boolean;
        linkedIngredientId?: number | null | undefined;
    }, {
        id: number;
        sortOrder: number;
        ingredientId: number;
        extraCost: number;
        label: string;
        processedQty: number;
        producedQty: number;
        producedUnit: string;
        isDefault: boolean;
        linkedIngredientId?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    options: {
        id: number;
        sortOrder: number;
        ingredientId: number;
        extraCost: number;
        label: string;
        processedQty: number;
        producedQty: number;
        producedUnit: string;
        isDefault: boolean;
        linkedIngredientId?: number | null | undefined;
    }[];
}, {
    options: {
        id: number;
        sortOrder: number;
        ingredientId: number;
        extraCost: number;
        label: string;
        processedQty: number;
        producedQty: number;
        producedUnit: string;
        isDefault: boolean;
        linkedIngredientId?: number | null | undefined;
    }[];
}>>;
export type GetIngredientResponse = Infer<typeof api.GetIngredientResponse>;
export declare const UpdateIngredientParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type UpdateIngredientParams = Infer<typeof api.UpdateIngredientParams>;
export declare const UpdateIngredientBody: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    ingredientType: z.ZodOptional<z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>>;
    unit: z.ZodOptional<z.ZodString>;
    costPerUnit: z.ZodOptional<z.ZodNumber>;
    stockQuantity: z.ZodOptional<z.ZodNumber>;
    startupQuantity: z.ZodOptional<z.ZodNumber>;
    lowStockThreshold: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
} & {
    openedShelfLifeDays: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    ingredientType?: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other" | undefined;
    unit?: string | undefined;
    costPerUnit?: number | undefined;
    stockQuantity?: number | undefined;
    startupQuantity?: number | undefined;
    lowStockThreshold?: number | undefined;
    openedShelfLifeDays?: number | null | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    ingredientType?: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other" | undefined;
    unit?: string | undefined;
    costPerUnit?: number | undefined;
    stockQuantity?: number | undefined;
    startupQuantity?: number | undefined;
    lowStockThreshold?: number | undefined;
    openedShelfLifeDays?: number | null | undefined;
}>;
export type UpdateIngredientBody = Infer<typeof UpdateIngredientBody>;
export declare const UpdateIngredientResponse: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    ingredientType: z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    stockQuantity: z.ZodNumber;
    startupQuantity: z.ZodNumber;
    lowStockThreshold: z.ZodNumber;
    isActive: z.ZodBoolean;
    linkedTypeCount: z.ZodOptional<z.ZodNumber>;
    linkedProductCount: z.ZodOptional<z.ZodNumber>;
    conversions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ingredientId: z.ZodNumber;
        unitName: z.ZodString;
        conversionFactor: z.ZodNumber;
        isDefaultPurchase: z.ZodBoolean;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}>;
export type UpdateIngredientResponse = Infer<typeof api.UpdateIngredientResponse>;
export declare const CreateIngredientOptionParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type CreateIngredientOptionParams = Infer<typeof api.CreateIngredientOptionParams>;
export declare const CreateIngredientOptionBody: z.ZodObject<{
    label: z.ZodString;
    processedQty: z.ZodNumber;
    producedQty: z.ZodNumber;
    producedUnit: z.ZodString;
    extraCost: z.ZodOptional<z.ZodNumber>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
    linkedIngredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    label: string;
    processedQty: number;
    producedQty: number;
    producedUnit: string;
    sortOrder?: number | undefined;
    extraCost?: number | undefined;
    isDefault?: boolean | undefined;
    linkedIngredientId?: number | null | undefined;
}, {
    label: string;
    processedQty: number;
    producedQty: number;
    producedUnit: string;
    sortOrder?: number | undefined;
    extraCost?: number | undefined;
    isDefault?: boolean | undefined;
    linkedIngredientId?: number | null | undefined;
}>;
export type CreateIngredientOptionBody = Infer<typeof api.CreateIngredientOptionBody>;
export declare const UpdateIngredientOptionParams: z.ZodObject<{
    id: z.ZodNumber;
    optionId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    optionId: number;
}, {
    id: number;
    optionId: number;
}>;
export type UpdateIngredientOptionParams = Infer<typeof api.UpdateIngredientOptionParams>;
export declare const UpdateIngredientOptionBody: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    processedQty: z.ZodOptional<z.ZodNumber>;
    producedQty: z.ZodOptional<z.ZodNumber>;
    producedUnit: z.ZodOptional<z.ZodString>;
    extraCost: z.ZodOptional<z.ZodNumber>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
    linkedIngredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sortOrder?: number | undefined;
    extraCost?: number | undefined;
    label?: string | undefined;
    processedQty?: number | undefined;
    producedQty?: number | undefined;
    producedUnit?: string | undefined;
    isDefault?: boolean | undefined;
    linkedIngredientId?: number | null | undefined;
}, {
    sortOrder?: number | undefined;
    extraCost?: number | undefined;
    label?: string | undefined;
    processedQty?: number | undefined;
    producedQty?: number | undefined;
    producedUnit?: string | undefined;
    isDefault?: boolean | undefined;
    linkedIngredientId?: number | null | undefined;
}>;
export type UpdateIngredientOptionBody = Infer<typeof api.UpdateIngredientOptionBody>;
export declare const DeleteIngredientOptionParams: z.ZodObject<{
    id: z.ZodNumber;
    optionId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    optionId: number;
}, {
    id: number;
    optionId: number;
}>;
export type DeleteIngredientOptionParams = Infer<typeof api.DeleteIngredientOptionParams>;
export declare const RestockIngredientParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type RestockIngredientParams = Infer<typeof api.RestockIngredientParams>;
export declare const RestockIngredientBody: z.ZodObject<{
    quantity: z.ZodNumber;
    unitId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    note: z.ZodOptional<z.ZodString>;
} & {
    expiryDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    batchNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    unitId?: number | null | undefined;
    note?: string | undefined;
    expiryDate?: string | null | undefined;
    batchNumber?: string | null | undefined;
}, {
    quantity: number;
    unitId?: number | null | undefined;
    note?: string | undefined;
    expiryDate?: string | null | undefined;
    batchNumber?: string | null | undefined;
}>;
export type RestockIngredientBody = Infer<typeof RestockIngredientBody>;
export declare const RestockIngredientResponse: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    ingredientType: z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    stockQuantity: z.ZodNumber;
    startupQuantity: z.ZodNumber;
    lowStockThreshold: z.ZodNumber;
    isActive: z.ZodBoolean;
    linkedTypeCount: z.ZodOptional<z.ZodNumber>;
    linkedProductCount: z.ZodOptional<z.ZodNumber>;
    conversions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ingredientId: z.ZodNumber;
        unitName: z.ZodString;
        conversionFactor: z.ZodNumber;
        isDefaultPurchase: z.ZodBoolean;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}>;
export type RestockIngredientResponse = Infer<typeof api.RestockIngredientResponse>;
export declare const ListOrdersQueryParams: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    branchId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    branchId?: number | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    status?: string | undefined;
    branchId?: number | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ListOrdersQueryParams = Infer<typeof api.ListOrdersQueryParams>;
export declare const ListOrdersResponseItem: z.ZodIntersection<z.ZodObject<{
    [x: string]: any;
} & {
    discountCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    branchName: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["pos", "kiosk", "web", "mobile"]>>;
    paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "split", "refund"]>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    [x: string]: any;
    discountCode?: unknown;
    branchName?: unknown;
    source?: unknown;
    paymentMethod?: unknown;
}, {
    [x: string]: any;
    discountCode?: unknown;
    branchName?: unknown;
    source?: unknown;
    paymentMethod?: unknown;
}>, z.ZodObject<{
    [x: string]: any;
} & {
    items: z.ZodArray<z.ZodAny, "many">;
    payments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        paymentMethod: z.ZodString;
        amount: z.ZodNumber;
        transactionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        createdAt: string;
        paymentMethod: string;
        amount: number;
        transactionId?: string | null | undefined;
    }, {
        id: number;
        createdAt: string;
        paymentMethod: string;
        amount: number;
        transactionId?: string | null | undefined;
    }>, "many">>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    [x: string]: any;
    items?: unknown;
    payments?: unknown;
}, {
    [x: string]: any;
    items?: unknown;
    payments?: unknown;
}>>;
export type ListOrdersResponseItem = Infer<typeof ListOrdersResponseItem>;
export declare const ListOrdersResponse: z.ZodArray<z.ZodIntersection<z.ZodObject<{
    [x: string]: any;
} & {
    discountCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    branchName: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["pos", "kiosk", "web", "mobile"]>>;
    paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "split", "refund"]>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    [x: string]: any;
    discountCode?: unknown;
    branchName?: unknown;
    source?: unknown;
    paymentMethod?: unknown;
}, {
    [x: string]: any;
    discountCode?: unknown;
    branchName?: unknown;
    source?: unknown;
    paymentMethod?: unknown;
}>, z.ZodObject<{
    [x: string]: any;
} & {
    items: z.ZodArray<z.ZodAny, "many">;
    payments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        paymentMethod: z.ZodString;
        amount: z.ZodNumber;
        transactionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        createdAt: string;
        paymentMethod: string;
        amount: number;
        transactionId?: string | null | undefined;
    }, {
        id: number;
        createdAt: string;
        paymentMethod: string;
        amount: number;
        transactionId?: string | null | undefined;
    }>, "many">>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    [x: string]: any;
    items?: unknown;
    payments?: unknown;
}, {
    [x: string]: any;
    items?: unknown;
    payments?: unknown;
}>>, "many">;
export type ListOrdersResponse = Infer<typeof ListOrdersResponse>;
export declare const CreateOrderBody: z.ZodObject<{
    branchId: z.ZodOptional<z.ZodNumber>;
    customerName: z.ZodOptional<z.ZodString>;
    customerPhone: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "split", "refund"]>;
    amountTendered: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    discount: z.ZodOptional<z.ZodNumber>;
    discountCode: z.ZodOptional<z.ZodString>;
    adminPin: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        drinkId: z.ZodNumber;
        quantity: z.ZodNumber;
        specialNotes: z.ZodOptional<z.ZodString>;
        selections: z.ZodArray<z.ZodObject<{
            ingredientId: z.ZodOptional<z.ZodNumber>;
            optionId: z.ZodOptional<z.ZodNumber>;
            subOptionId: z.ZodOptional<z.ZodNumber>;
            slotId: z.ZodOptional<z.ZodNumber>;
            typeVolumeId: z.ZodOptional<z.ZodNumber>;
            ingredientTypeId: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            ingredientId?: number | undefined;
            optionId?: number | undefined;
            subOptionId?: number | undefined;
            slotId?: number | undefined;
            typeVolumeId?: number | undefined;
            ingredientTypeId?: number | undefined;
        }, {
            ingredientId?: number | undefined;
            optionId?: number | undefined;
            subOptionId?: number | undefined;
            slotId?: number | undefined;
            typeVolumeId?: number | undefined;
            ingredientTypeId?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        drinkId: number;
        selections: {
            ingredientId?: number | undefined;
            optionId?: number | undefined;
            subOptionId?: number | undefined;
            slotId?: number | undefined;
            typeVolumeId?: number | undefined;
            ingredientTypeId?: number | undefined;
        }[];
        quantity: number;
        specialNotes?: string | undefined;
    }, {
        drinkId: number;
        selections: {
            ingredientId?: number | undefined;
            optionId?: number | undefined;
            subOptionId?: number | undefined;
            slotId?: number | undefined;
            typeVolumeId?: number | undefined;
            ingredientTypeId?: number | undefined;
        }[];
        quantity: number;
        specialNotes?: string | undefined;
    }>, "many">;
} & {
    payments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "refund"]>;
        amount: z.ZodNumber;
        transactionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "refund";
        amount: number;
        transactionId?: string | undefined;
    }, {
        paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "refund";
        amount: number;
        transactionId?: string | undefined;
    }>, "many">>;
    source: z.ZodOptional<z.ZodEnum<["pos", "kiosk", "web", "mobile"]>>;
}, "strip", z.ZodTypeAny, {
    paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "split" | "refund";
    items: {
        drinkId: number;
        selections: {
            ingredientId?: number | undefined;
            optionId?: number | undefined;
            subOptionId?: number | undefined;
            slotId?: number | undefined;
            typeVolumeId?: number | undefined;
            ingredientTypeId?: number | undefined;
        }[];
        quantity: number;
        specialNotes?: string | undefined;
    }[];
    branchId?: number | undefined;
    customerName?: string | undefined;
    customerPhone?: string | undefined;
    discount?: number | undefined;
    amountTendered?: number | undefined;
    notes?: string | undefined;
    discountCode?: string | undefined;
    adminPin?: string | undefined;
    source?: "pos" | "kiosk" | "web" | "mobile" | undefined;
    payments?: {
        paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "refund";
        amount: number;
        transactionId?: string | undefined;
    }[] | undefined;
}, {
    paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "split" | "refund";
    items: {
        drinkId: number;
        selections: {
            ingredientId?: number | undefined;
            optionId?: number | undefined;
            subOptionId?: number | undefined;
            slotId?: number | undefined;
            typeVolumeId?: number | undefined;
            ingredientTypeId?: number | undefined;
        }[];
        quantity: number;
        specialNotes?: string | undefined;
    }[];
    branchId?: number | undefined;
    customerName?: string | undefined;
    customerPhone?: string | undefined;
    discount?: number | undefined;
    amountTendered?: number | undefined;
    notes?: string | undefined;
    discountCode?: string | undefined;
    adminPin?: string | undefined;
    source?: "pos" | "kiosk" | "web" | "mobile" | undefined;
    payments?: {
        paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "refund";
        amount: number;
        transactionId?: string | undefined;
    }[] | undefined;
}>;
export type CreateOrderBody = Infer<typeof CreateOrderBody>;
export declare const GetOrderParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type GetOrderParams = Infer<typeof api.GetOrderParams>;
export declare const GetOrderResponse: z.ZodIntersection<z.ZodObject<{
    [x: string]: any;
} & {
    discountCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    branchName: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["pos", "kiosk", "web", "mobile"]>>;
    paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "split"]>;
    payments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        paymentMethod: z.ZodString;
        amount: z.ZodNumber;
        transactionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        createdAt: string;
        paymentMethod: string;
        amount: number;
        transactionId?: string | null | undefined;
    }, {
        id: number;
        createdAt: string;
        paymentMethod: string;
        amount: number;
        transactionId?: string | null | undefined;
    }>, "many">>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    [x: string]: any;
    discountCode?: unknown;
    branchName?: unknown;
    source?: unknown;
    paymentMethod?: unknown;
    payments?: unknown;
}, {
    [x: string]: any;
    discountCode?: unknown;
    branchName?: unknown;
    source?: unknown;
    paymentMethod?: unknown;
    payments?: unknown;
}>, z.ZodObject<{
    [x: string]: any;
} & {
    items: z.ZodArray<z.ZodAny, "many">;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    [x: string]: any;
    items?: unknown;
}, {
    [x: string]: any;
    items?: unknown;
}>>;
export type GetOrderResponse = Infer<typeof GetOrderResponse>;
export declare const UpdateOrderStatusParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type UpdateOrderStatusParams = Infer<typeof api.UpdateOrderStatusParams>;
export declare const UpdateOrderStatusBody: z.ZodObject<{
    status: z.ZodEnum<["pending", "paid", "in_progress", "ready", "completed", "cancelled", "refunded"]>;
    cashierId: z.ZodOptional<z.ZodNumber>;
} & {
    payments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "refund"]>;
        amount: z.ZodNumber;
        transactionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "refund";
        amount: number;
        transactionId?: string | undefined;
    }, {
        paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "refund";
        amount: number;
        transactionId?: string | undefined;
    }>, "many">>;
    paymentMethod: z.ZodOptional<z.ZodEnum<["cash", "card", "wallet", "hospitality", "split", "refund"]>>;
    adminPin: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "paid" | "in_progress" | "ready" | "completed" | "cancelled" | "refunded";
    paymentMethod?: "cash" | "card" | "wallet" | "hospitality" | "split" | "refund" | undefined;
    adminPin?: string | undefined;
    cashierId?: number | undefined;
    payments?: {
        paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "refund";
        amount: number;
        transactionId?: string | undefined;
    }[] | undefined;
}, {
    status: "pending" | "paid" | "in_progress" | "ready" | "completed" | "cancelled" | "refunded";
    paymentMethod?: "cash" | "card" | "wallet" | "hospitality" | "split" | "refund" | undefined;
    adminPin?: string | undefined;
    cashierId?: number | undefined;
    payments?: {
        paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "refund";
        amount: number;
        transactionId?: string | undefined;
    }[] | undefined;
}>;
export type UpdateOrderStatusBody = Infer<typeof UpdateOrderStatusBody>;
export declare const UpdateOrderStatusResponse: z.ZodIntersection<z.ZodObject<{
    [x: string]: any;
} & {
    discountCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    branchName: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["pos", "kiosk", "web", "mobile"]>>;
    paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "split"]>;
    payments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        paymentMethod: z.ZodString;
        amount: z.ZodNumber;
        transactionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        createdAt: string;
        paymentMethod: string;
        amount: number;
        transactionId?: string | null | undefined;
    }, {
        id: number;
        createdAt: string;
        paymentMethod: string;
        amount: number;
        transactionId?: string | null | undefined;
    }>, "many">>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    [x: string]: any;
    discountCode?: unknown;
    branchName?: unknown;
    source?: unknown;
    paymentMethod?: unknown;
    payments?: unknown;
}, {
    [x: string]: any;
    discountCode?: unknown;
    branchName?: unknown;
    source?: unknown;
    paymentMethod?: unknown;
    payments?: unknown;
}>, z.ZodObject<{
    [x: string]: any;
} & {
    items: z.ZodArray<z.ZodAny, "many">;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    [x: string]: any;
    items?: unknown;
}, {
    [x: string]: any;
    items?: unknown;
}>>;
export type UpdateOrderStatusResponse = Infer<typeof api.UpdateOrderStatusResponse>;
export declare const ListStockMovementsQueryParams: z.ZodObject<{
    ingredientId: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    branchId: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
} & {
    movementType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    branchId?: string | number | undefined;
    ingredientId?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    movementType?: string | undefined;
}, {
    branchId?: string | number | undefined;
    ingredientId?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    movementType?: string | undefined;
}>;
export type ListStockMovementsQueryParams = Infer<typeof ListStockMovementsQueryParams>;
export declare const ListStockMovementsResponseItem: z.ZodObject<{
    id: z.ZodNumber;
    ingredientId: z.ZodNumber;
    ingredientName: z.ZodString;
    orderId: z.ZodNullable<z.ZodNumber>;
    movementType: z.ZodEnum<["sale", "restock", "adjustment", "waste", "opening", "calibration", "testing"]>;
    quantity: z.ZodNumber;
    quantityAfter: z.ZodNumber;
    note: z.ZodNullable<z.ZodString>;
    createdBy: z.ZodNumber;
    createdByName: z.ZodString;
    createdAt: z.ZodString;
} & {
    branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    createdAt: string;
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    note: string | null;
    orderId: number | null;
    movementType: "sale" | "restock" | "adjustment" | "waste" | "opening" | "calibration" | "testing";
    quantityAfter: number;
    createdBy: number;
    createdByName: string;
    branchId?: number | null | undefined;
}, {
    id: number;
    createdAt: string;
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    note: string | null;
    orderId: number | null;
    movementType: "sale" | "restock" | "adjustment" | "waste" | "opening" | "calibration" | "testing";
    quantityAfter: number;
    createdBy: number;
    createdByName: string;
    branchId?: number | null | undefined;
}>;
export type ListStockMovementsResponseItem = Infer<typeof ListStockMovementsResponseItem>;
export declare const ListStockMovementsResponse: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    ingredientId: z.ZodNumber;
    ingredientName: z.ZodString;
    orderId: z.ZodNullable<z.ZodNumber>;
    movementType: z.ZodEnum<["sale", "restock", "adjustment", "waste", "opening", "calibration", "testing"]>;
    quantity: z.ZodNumber;
    quantityAfter: z.ZodNumber;
    note: z.ZodNullable<z.ZodString>;
    createdBy: z.ZodNumber;
    createdByName: z.ZodString;
    createdAt: z.ZodString;
} & {
    branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    createdAt: string;
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    note: string | null;
    orderId: number | null;
    movementType: "sale" | "restock" | "adjustment" | "waste" | "opening" | "calibration" | "testing";
    quantityAfter: number;
    createdBy: number;
    createdByName: string;
    branchId?: number | null | undefined;
}, {
    id: number;
    createdAt: string;
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    note: string | null;
    orderId: number | null;
    movementType: "sale" | "restock" | "adjustment" | "waste" | "opening" | "calibration" | "testing";
    quantityAfter: number;
    createdBy: number;
    createdByName: string;
    branchId?: number | null | undefined;
}>, "many">;
export type ListStockMovementsResponse = Infer<typeof ListStockMovementsResponse>;
export declare const CreateStockAdjustmentBody: z.ZodObject<{
    ingredientId: z.ZodNumber;
    movementType: z.ZodEnum<["adjustment", "waste", "opening", "calibration", "testing"]>;
    quantity: z.ZodNumber;
    unitId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    note: z.ZodOptional<z.ZodString>;
} & {
    expiryDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    batchNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    ingredientId: number;
    quantity: number;
    movementType: "adjustment" | "waste" | "opening" | "calibration" | "testing";
    unitId?: number | null | undefined;
    note?: string | undefined;
    expiryDate?: string | null | undefined;
    batchNumber?: string | null | undefined;
}, {
    ingredientId: number;
    quantity: number;
    movementType: "adjustment" | "waste" | "opening" | "calibration" | "testing";
    unitId?: number | null | undefined;
    note?: string | undefined;
    expiryDate?: string | null | undefined;
    batchNumber?: string | null | undefined;
}>;
export type CreateStockAdjustmentBody = Infer<typeof CreateStockAdjustmentBody>;
export declare const GetDashboardSummaryResponse: z.ZodObject<{
    todayRevenue: z.ZodNumber;
    todayCashRevenue: z.ZodNumber;
    todayCardRevenue: z.ZodNumber;
    todayOrders: z.ZodNumber;
    todayDrinks: z.ZodNumber;
    averageOrderValue: z.ZodNumber;
    pendingOrders: z.ZodNumber;
    lowStockCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    todayRevenue: number;
    todayCashRevenue: number;
    todayCardRevenue: number;
    todayOrders: number;
    todayDrinks: number;
    averageOrderValue: number;
    pendingOrders: number;
    lowStockCount: number;
}, {
    todayRevenue: number;
    todayCashRevenue: number;
    todayCardRevenue: number;
    todayOrders: number;
    todayDrinks: number;
    averageOrderValue: number;
    pendingOrders: number;
    lowStockCount: number;
}>;
export type GetDashboardSummaryResponse = Infer<typeof api.GetDashboardSummaryResponse>;
export declare const GetActiveOrdersResponseItem: z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    id: z.ZodNumber;
    orderNumber: z.ZodString;
    baristaId: z.ZodNumber;
    baristaName: z.ZodString;
    status: z.ZodEnum<["pending", "paid", "in_progress", "ready", "completed", "cancelled", "refunded"]>;
    customerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customerPhone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    subtotal: z.ZodNumber;
    discount: z.ZodNumber;
    discountId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    discountValue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    discountType: z.ZodOptional<z.ZodNullable<z.ZodEnum<["percentage", "fixed", "fixed_per_item"]>>>;
    total: z.ZodNumber;
    paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "split", "refund"]>;
    amountTendered: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    changeDue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    paidAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    readyAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    completedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cancelledAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "paid" | "in_progress" | "ready" | "completed" | "cancelled" | "refunded";
    id: number;
    total: number;
    orderNumber: string;
    baristaId: number;
    baristaName: string;
    subtotal: number;
    discount: number;
    paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "split" | "refund";
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    customerName?: string | null | undefined;
    customerPhone?: string | null | undefined;
    discountId?: number | null | undefined;
    discountValue?: number | null | undefined;
    discountType?: "percentage" | "fixed" | "fixed_per_item" | null | undefined;
    amountTendered?: number | null | undefined;
    changeDue?: number | null | undefined;
    notes?: string | null | undefined;
    paidAt?: string | null | undefined;
    readyAt?: string | null | undefined;
    completedAt?: string | null | undefined;
    cancelledAt?: string | null | undefined;
}, {
    status: "pending" | "paid" | "in_progress" | "ready" | "completed" | "cancelled" | "refunded";
    id: number;
    total: number;
    orderNumber: string;
    baristaId: number;
    baristaName: string;
    subtotal: number;
    discount: number;
    paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "split" | "refund";
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    customerName?: string | null | undefined;
    customerPhone?: string | null | undefined;
    discountId?: number | null | undefined;
    discountValue?: number | null | undefined;
    discountType?: "percentage" | "fixed" | "fixed_per_item" | null | undefined;
    amountTendered?: number | null | undefined;
    changeDue?: number | null | undefined;
    notes?: string | null | undefined;
    paidAt?: string | null | undefined;
    readyAt?: string | null | undefined;
    completedAt?: string | null | undefined;
    cancelledAt?: string | null | undefined;
}>, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        orderId: z.ZodNumber;
        drinkId: z.ZodNumber;
        drinkName: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        lineTotal: z.ZodNumber;
        specialNotes: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["pending", "ready"]>;
        readyAt: z.ZodNullable<z.ZodString>;
        customizations: z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            orderItemId: z.ZodNumber;
            ingredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            optionId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            typeVolumeId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            consumedQty: z.ZodNumber;
            producedQty: z.ZodOptional<z.ZodNumber>;
            addedCost: z.ZodNumber;
            slotLabel: z.ZodString;
            optionLabel: z.ZodString;
            baristaSortOrder: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }, {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "ready";
        id: number;
        drinkId: number;
        quantity: number;
        readyAt: string | null;
        orderId: number;
        drinkName: string;
        unitPrice: number;
        lineTotal: number;
        specialNotes: string | null;
        customizations: {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }[];
    }, {
        status: "pending" | "ready";
        id: number;
        drinkId: number;
        quantity: number;
        readyAt: string | null;
        orderId: number;
        drinkName: string;
        unitPrice: number;
        lineTotal: number;
        specialNotes: string | null;
        customizations: {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        status: "pending" | "ready";
        id: number;
        drinkId: number;
        quantity: number;
        readyAt: string | null;
        orderId: number;
        drinkName: string;
        unitPrice: number;
        lineTotal: number;
        specialNotes: string | null;
        customizations: {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }[];
    }[];
}, {
    items: {
        status: "pending" | "ready";
        id: number;
        drinkId: number;
        quantity: number;
        readyAt: string | null;
        orderId: number;
        drinkName: string;
        unitPrice: number;
        lineTotal: number;
        specialNotes: string | null;
        customizations: {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }[];
    }[];
}>>, z.ZodObject<{
    items: z.ZodArray<z.ZodAny, "many">;
    discountCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    items: any[];
    discountCode?: string | null | undefined;
}, {
    items: any[];
    discountCode?: string | null | undefined;
}>>;
export type GetActiveOrdersResponseItem = Infer<typeof GetActiveOrdersResponseItem>;
export declare const GetActiveOrdersResponse: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    id: z.ZodNumber;
    orderNumber: z.ZodString;
    baristaId: z.ZodNumber;
    baristaName: z.ZodString;
    status: z.ZodEnum<["pending", "paid", "in_progress", "ready", "completed", "cancelled", "refunded"]>;
    customerName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customerPhone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    subtotal: z.ZodNumber;
    discount: z.ZodNumber;
    discountId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    discountValue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    discountType: z.ZodOptional<z.ZodNullable<z.ZodEnum<["percentage", "fixed", "fixed_per_item"]>>>;
    total: z.ZodNumber;
    paymentMethod: z.ZodEnum<["cash", "card", "wallet", "hospitality", "split", "refund"]>;
    amountTendered: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    changeDue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    paidAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    readyAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    completedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cancelledAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "paid" | "in_progress" | "ready" | "completed" | "cancelled" | "refunded";
    id: number;
    total: number;
    orderNumber: string;
    baristaId: number;
    baristaName: string;
    subtotal: number;
    discount: number;
    paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "split" | "refund";
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    customerName?: string | null | undefined;
    customerPhone?: string | null | undefined;
    discountId?: number | null | undefined;
    discountValue?: number | null | undefined;
    discountType?: "percentage" | "fixed" | "fixed_per_item" | null | undefined;
    amountTendered?: number | null | undefined;
    changeDue?: number | null | undefined;
    notes?: string | null | undefined;
    paidAt?: string | null | undefined;
    readyAt?: string | null | undefined;
    completedAt?: string | null | undefined;
    cancelledAt?: string | null | undefined;
}, {
    status: "pending" | "paid" | "in_progress" | "ready" | "completed" | "cancelled" | "refunded";
    id: number;
    total: number;
    orderNumber: string;
    baristaId: number;
    baristaName: string;
    subtotal: number;
    discount: number;
    paymentMethod: "cash" | "card" | "wallet" | "hospitality" | "split" | "refund";
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    customerName?: string | null | undefined;
    customerPhone?: string | null | undefined;
    discountId?: number | null | undefined;
    discountValue?: number | null | undefined;
    discountType?: "percentage" | "fixed" | "fixed_per_item" | null | undefined;
    amountTendered?: number | null | undefined;
    changeDue?: number | null | undefined;
    notes?: string | null | undefined;
    paidAt?: string | null | undefined;
    readyAt?: string | null | undefined;
    completedAt?: string | null | undefined;
    cancelledAt?: string | null | undefined;
}>, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        orderId: z.ZodNumber;
        drinkId: z.ZodNumber;
        drinkName: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        lineTotal: z.ZodNumber;
        specialNotes: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["pending", "ready"]>;
        readyAt: z.ZodNullable<z.ZodString>;
        customizations: z.ZodArray<z.ZodObject<{
            id: z.ZodNumber;
            orderItemId: z.ZodNumber;
            ingredientId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            optionId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            typeVolumeId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            consumedQty: z.ZodNumber;
            producedQty: z.ZodOptional<z.ZodNumber>;
            addedCost: z.ZodNumber;
            slotLabel: z.ZodString;
            optionLabel: z.ZodString;
            baristaSortOrder: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }, {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "ready";
        id: number;
        drinkId: number;
        quantity: number;
        readyAt: string | null;
        orderId: number;
        drinkName: string;
        unitPrice: number;
        lineTotal: number;
        specialNotes: string | null;
        customizations: {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }[];
    }, {
        status: "pending" | "ready";
        id: number;
        drinkId: number;
        quantity: number;
        readyAt: string | null;
        orderId: number;
        drinkName: string;
        unitPrice: number;
        lineTotal: number;
        specialNotes: string | null;
        customizations: {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        status: "pending" | "ready";
        id: number;
        drinkId: number;
        quantity: number;
        readyAt: string | null;
        orderId: number;
        drinkName: string;
        unitPrice: number;
        lineTotal: number;
        specialNotes: string | null;
        customizations: {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }[];
    }[];
}, {
    items: {
        status: "pending" | "ready";
        id: number;
        drinkId: number;
        quantity: number;
        readyAt: string | null;
        orderId: number;
        drinkName: string;
        unitPrice: number;
        lineTotal: number;
        specialNotes: string | null;
        customizations: {
            id: number;
            slotLabel: string;
            optionLabel: string;
            consumedQty: number;
            orderItemId: number;
            addedCost: number;
            ingredientId?: number | null | undefined;
            baristaSortOrder?: number | null | undefined;
            optionId?: number | null | undefined;
            typeVolumeId?: number | null | undefined;
            producedQty?: number | undefined;
        }[];
    }[];
}>>, z.ZodObject<{
    items: z.ZodArray<z.ZodAny, "many">;
    discountCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    items: any[];
    discountCode?: string | null | undefined;
}, {
    items: any[];
    discountCode?: string | null | undefined;
}>>, "many">;
export type GetActiveOrdersResponse = Infer<typeof GetActiveOrdersResponse>;
export declare const GetLowStockIngredientsResponseItem: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    ingredientType: z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    stockQuantity: z.ZodNumber;
    startupQuantity: z.ZodNumber;
    lowStockThreshold: z.ZodNumber;
    isActive: z.ZodBoolean;
    linkedTypeCount: z.ZodOptional<z.ZodNumber>;
    linkedProductCount: z.ZodOptional<z.ZodNumber>;
    conversions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ingredientId: z.ZodNumber;
        unitName: z.ZodString;
        conversionFactor: z.ZodNumber;
        isDefaultPurchase: z.ZodBoolean;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}>;
export type GetLowStockIngredientsResponseItem = Infer<typeof api.GetLowStockIngredientsResponseItem>;
export declare const GetLowStockIngredientsResponse: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    ingredientType: z.ZodEnum<["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"]>;
    unit: z.ZodString;
    costPerUnit: z.ZodNumber;
    stockQuantity: z.ZodNumber;
    startupQuantity: z.ZodNumber;
    lowStockThreshold: z.ZodNumber;
    isActive: z.ZodBoolean;
    linkedTypeCount: z.ZodOptional<z.ZodNumber>;
    linkedProductCount: z.ZodOptional<z.ZodNumber>;
    conversions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ingredientId: z.ZodNumber;
        unitName: z.ZodString;
        conversionFactor: z.ZodNumber;
        isDefaultPurchase: z.ZodBoolean;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }, {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}, {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    ingredientType: "coffee" | "milk" | "syrup" | "sauce" | "sweetener" | "topping" | "base" | "cup" | "tea" | "packing" | "other";
    unit: string;
    costPerUnit: number;
    stockQuantity: number;
    startupQuantity: number;
    lowStockThreshold: number;
    linkedTypeCount?: number | undefined;
    linkedProductCount?: number | undefined;
    conversions?: {
        id: number;
        ingredientId: number;
        unitName: string;
        conversionFactor: number;
        isDefaultPurchase: boolean;
        createdAt?: string | undefined;
    }[] | undefined;
}>, "many">;
export type GetLowStockIngredientsResponse = Infer<typeof api.GetLowStockIngredientsResponse>;
export declare const GetSalesByCategoryQueryParams: z.ZodObject<{
    days: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    days?: number | undefined;
}, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    days?: number | undefined;
}>;
export type GetSalesByCategoryQueryParams = Infer<typeof api.GetSalesByCategoryQueryParams>;
export declare const GetSalesByCategoryResponseItem: z.ZodObject<{
    category: z.ZodString;
    totalOrders: z.ZodNumber;
    totalRevenue: z.ZodNumber;
    totalDrinks: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    category: string;
    totalOrders: number;
    totalRevenue: number;
    totalDrinks: number;
}, {
    category: string;
    totalOrders: number;
    totalRevenue: number;
    totalDrinks: number;
}>;
export type GetSalesByCategoryResponseItem = Infer<typeof api.GetSalesByCategoryResponseItem>;
export declare const GetSalesByCategoryResponse: z.ZodArray<z.ZodObject<{
    category: z.ZodString;
    totalOrders: z.ZodNumber;
    totalRevenue: z.ZodNumber;
    totalDrinks: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    category: string;
    totalOrders: number;
    totalRevenue: number;
    totalDrinks: number;
}, {
    category: string;
    totalOrders: number;
    totalRevenue: number;
    totalDrinks: number;
}>, "many">;
export type GetSalesByCategoryResponse = Infer<typeof api.GetSalesByCategoryResponse>;
export declare const GetTopDrinksQueryParams: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    days: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    limit?: number | undefined;
    days?: number | undefined;
}, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    limit?: number | undefined;
    days?: number | undefined;
}>;
export type GetTopDrinksQueryParams = Infer<typeof api.GetTopDrinksQueryParams>;
export declare const GetTopDrinksResponseItem: z.ZodObject<{
    drinkId: z.ZodNumber;
    drinkName: z.ZodString;
    category: z.ZodString;
    totalSold: z.ZodNumber;
    totalRevenue: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    category: string;
    drinkId: number;
    drinkName: string;
    totalRevenue: number;
    totalSold: number;
}, {
    category: string;
    drinkId: number;
    drinkName: string;
    totalRevenue: number;
    totalSold: number;
}>;
export type GetTopDrinksResponseItem = Infer<typeof api.GetTopDrinksResponseItem>;
export declare const GetTopDrinksResponse: z.ZodArray<z.ZodObject<{
    drinkId: z.ZodNumber;
    drinkName: z.ZodString;
    category: z.ZodString;
    totalSold: z.ZodNumber;
    totalRevenue: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    category: string;
    drinkId: number;
    drinkName: string;
    totalRevenue: number;
    totalSold: number;
}, {
    category: string;
    drinkId: number;
    drinkName: string;
    totalRevenue: number;
    totalSold: number;
}>, "many">;
export type GetTopDrinksResponse = Infer<typeof api.GetTopDrinksResponse>;
export declare const Discount: z.ZodObject<{
    id: z.ZodNumber;
    code: z.ZodString;
    type: z.ZodEnum<["percentage", "fixed", "fixed_per_item"]>;
    value: z.ZodNumber;
    isActive: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    tagIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    isFirstOrder: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    value: number;
    code: string;
    type: "percentage" | "fixed" | "fixed_per_item";
    id: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    tagIds?: number[] | undefined;
    isFirstOrder?: boolean | undefined;
}, {
    value: number;
    code: string;
    type: "percentage" | "fixed" | "fixed_per_item";
    id: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    tagIds?: number[] | undefined;
    isFirstOrder?: boolean | undefined;
}>;
export type Discount = Infer<typeof Discount>;
export declare const CreateDiscountBody: z.ZodObject<{
    code: z.ZodString;
    type: z.ZodEnum<["percentage", "fixed", "fixed_per_item"]>;
    value: z.ZodNumber;
    isActive: z.ZodOptional<z.ZodBoolean>;
} & {
    tagIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    isFirstOrder: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    value: number;
    code: string;
    type: "percentage" | "fixed" | "fixed_per_item";
    isActive?: boolean | undefined;
    tagIds?: number[] | undefined;
    isFirstOrder?: boolean | undefined;
}, {
    value: number;
    code: string;
    type: "percentage" | "fixed" | "fixed_per_item";
    isActive?: boolean | undefined;
    tagIds?: number[] | undefined;
    isFirstOrder?: boolean | undefined;
}>;
export type CreateDiscountBody = Infer<typeof CreateDiscountBody>;
export declare const UpdateDiscountBody: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["percentage", "fixed", "fixed_per_item"]>>;
    value: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
} & {
    tagIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    isFirstOrder: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    value?: number | undefined;
    code?: string | undefined;
    type?: "percentage" | "fixed" | "fixed_per_item" | undefined;
    isActive?: boolean | undefined;
    tagIds?: number[] | undefined;
    isFirstOrder?: boolean | undefined;
}, {
    value?: number | undefined;
    code?: string | undefined;
    type?: "percentage" | "fixed" | "fixed_per_item" | undefined;
    isActive?: boolean | undefined;
    tagIds?: number[] | undefined;
    isFirstOrder?: boolean | undefined;
}>;
export type UpdateDiscountBody = Infer<typeof UpdateDiscountBody>;
export declare const ListUsersResponseItem: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    username: z.ZodString;
    role: z.ZodString;
    branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodOptional<z.ZodDate>;
} & {
    pin: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    id: number;
    name: string;
    role: string;
    isActive: boolean;
    branchId?: number | null | undefined;
    createdAt?: Date | undefined;
    pin?: string | null | undefined;
}, {
    username: string;
    id: number;
    name: string;
    role: string;
    isActive: boolean;
    branchId?: number | null | undefined;
    createdAt?: Date | undefined;
    pin?: string | null | undefined;
}>;
export type ListUsersResponseItem = Infer<typeof ListUsersResponseItem>;
export declare const ListUsersResponse: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    username: z.ZodString;
    role: z.ZodString;
    branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodOptional<z.ZodDate>;
} & {
    pin: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    id: number;
    name: string;
    role: string;
    isActive: boolean;
    branchId?: number | null | undefined;
    createdAt?: Date | undefined;
    pin?: string | null | undefined;
}, {
    username: string;
    id: number;
    name: string;
    role: string;
    isActive: boolean;
    branchId?: number | null | undefined;
    createdAt?: Date | undefined;
    pin?: string | null | undefined;
}>, "many">;
export type ListUsersResponse = Infer<typeof ListUsersResponse>;
export declare const CreateUserBody: z.ZodObject<{
    name: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    pin: z.ZodOptional<z.ZodString>;
} & {
    role: z.ZodString;
    branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    name: string;
    role: string;
    branchId?: number | null | undefined;
    pin?: string | undefined;
}, {
    username: string;
    password: string;
    name: string;
    role: string;
    branchId?: number | null | undefined;
    pin?: string | undefined;
}>;
export type CreateUserBody = Infer<typeof CreateUserBody>;
export declare const UpdateUserBody: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    pin: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
} & {
    role: z.ZodOptional<z.ZodString>;
    branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    username?: string | undefined;
    password?: string | undefined;
    name?: string | undefined;
    role?: string | undefined;
    branchId?: number | null | undefined;
    isActive?: boolean | undefined;
    pin?: string | undefined;
}, {
    username?: string | undefined;
    password?: string | undefined;
    name?: string | undefined;
    role?: string | undefined;
    branchId?: number | null | undefined;
    isActive?: boolean | undefined;
    pin?: string | undefined;
}>;
export type UpdateUserBody = Infer<typeof UpdateUserBody>;
export declare const UserDetail: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    username: z.ZodString;
    isActive: z.ZodBoolean;
    createdAt: z.ZodOptional<z.ZodDate>;
} & {
    role: z.ZodString;
    pin: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    branchId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    username: string;
    id: number;
    name: string;
    role: string;
    isActive: boolean;
    branchId?: number | null | undefined;
    createdAt?: Date | undefined;
    pin?: string | null | undefined;
    permissions?: string[] | undefined;
}, {
    username: string;
    id: number;
    name: string;
    role: string;
    isActive: boolean;
    branchId?: number | null | undefined;
    createdAt?: Date | undefined;
    pin?: string | null | undefined;
    permissions?: string[] | undefined;
}>;
export type UserDetail = Infer<typeof UserDetail>;
export declare const ListActivityLogsQueryParams: z.ZodObject<{
    userId: z.ZodOptional<z.ZodNumber>;
    action: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
} & {
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    entityType: z.ZodOptional<z.ZodString>;
    userName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    userId?: number | undefined;
    action?: string | undefined;
    entityType?: string | undefined;
    userName?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    userId?: number | undefined;
    action?: string | undefined;
    entityType?: string | undefined;
    userName?: string | undefined;
}>;
export type ListActivityLogsQueryParams = Infer<typeof ListActivityLogsQueryParams>;
export declare const ActivityLog: z.ZodObject<{
    id: z.ZodNumber;
    userId: z.ZodNumber;
    action: z.ZodString;
    entityType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    entityId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    details: z.ZodOptional<z.ZodNullable<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>>;
    createdAt: z.ZodString;
} & {
    userName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    createdAt: string;
    userId: number;
    action: string;
    entityType?: string | null | undefined;
    entityId?: number | null | undefined;
    details?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | null | undefined;
    userName?: string | null | undefined;
}, {
    id: number;
    createdAt: string;
    userId: number;
    action: string;
    entityType?: string | null | undefined;
    entityId?: number | null | undefined;
    details?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | null | undefined;
    userName?: string | null | undefined;
}>;
export type ActivityLog = Infer<typeof ActivityLog>;
export declare const ListActivityLogsResponse: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        userId: z.ZodNumber;
        action: z.ZodString;
        entityType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        entityId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        details: z.ZodOptional<z.ZodNullable<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>>;
        createdAt: z.ZodString;
    } & {
        userName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        createdAt: string;
        userId: number;
        action: string;
        entityType?: string | null | undefined;
        entityId?: number | null | undefined;
        details?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | null | undefined;
        userName?: string | null | undefined;
    }, {
        id: number;
        createdAt: string;
        userId: number;
        action: string;
        entityType?: string | null | undefined;
        entityId?: number | null | undefined;
        details?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | null | undefined;
        userName?: string | null | undefined;
    }>, "many">;
    total: z.ZodNumber;
    limit: z.ZodNumber;
    offset: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    limit: number;
    offset: number;
    data: {
        id: number;
        createdAt: string;
        userId: number;
        action: string;
        entityType?: string | null | undefined;
        entityId?: number | null | undefined;
        details?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | null | undefined;
        userName?: string | null | undefined;
    }[];
}, {
    total: number;
    limit: number;
    offset: number;
    data: {
        id: number;
        createdAt: string;
        userId: number;
        action: string;
        entityType?: string | null | undefined;
        entityId?: number | null | undefined;
        details?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | null | undefined;
        userName?: string | null | undefined;
    }[];
}>;
export type ListActivityLogsResponse = Infer<typeof ListActivityLogsResponse>;
export declare const Permission: z.ZodObject<{
    id: z.ZodNumber;
    key: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    key: string;
    description?: string | null | undefined;
}, {
    id: number;
    key: string;
    description?: string | null | undefined;
}>;
export type Permission = Infer<typeof api.ListPermissionsResponseItem>;
export { ALL_PERMISSIONS, type PermissionKey } from "./permissions";
//# sourceMappingURL=index.d.ts.map