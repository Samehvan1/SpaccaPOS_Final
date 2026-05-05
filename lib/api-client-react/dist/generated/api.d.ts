import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ActivityLog, Branch, CalculateDrinkPriceParams, CategorySales, CreateBranchBody, CreateDiscountBody, CreateDrinkBody, CreateIngredientBody, CreateIngredientOptionBody, CreateIngredientOptionParams, CreateOrderBody, CreateUserBody, DashboardSummary, DeleteDiscountParams, DeleteDrinkParams, DeleteIngredientOptionParams, DeleteIngredientParams, DeleteUserParams, Discount, Drink, DrinkDetail, GetActiveOrdersParams, GetDrinkParams, GetIngredientParams, GetOrderParams, GetSalesByCategoryParams, GetSettingsParams, GetTopDrinksParams, HealthStatus, Ingredient, IngredientDetail, IngredientOption, ListActivityLogsParams, ListDrinksParams, ListIngredientsParams, ListOrdersParams, ListStockMovementsParams, LoginBody, LoginResponse, MarkOrderItemReadyParams, Order, OrderDetail, Permission, PriceBreakdown, PriceCalculationBody, RestockBody, RestockIngredientParams, Setting, StockAdjustmentBody, StockMovement, TopDrink, UpdateBranchBody, UpdateDiscountBody, UpdateDiscountParams, UpdateDrinkBody, UpdateDrinkParams, UpdateIngredientBody, UpdateIngredientOptionBody, UpdateIngredientOptionParams, UpdateIngredientParams, UpdateOrderStatusBody, UpdateOrderStatusParams, UpdateSettingsBody, UpdateUserBody, UpdateUserParams, User, UserDetail } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Login with PIN
 */
export declare const getBaristaLoginUrl: () => string;
export declare const baristaLogin: (loginBody: LoginBody, options?: RequestInit) => Promise<LoginResponse>;
export declare const getBaristaLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof baristaLogin>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof baristaLogin>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
export type BaristaLoginMutationResult = NonNullable<Awaited<ReturnType<typeof baristaLogin>>>;
export type BaristaLoginMutationBody = BodyType<LoginBody>;
export type BaristaLoginMutationError = ErrorType<void>;
/**
 * @summary Login with PIN
 */
export declare const useBaristaLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof baristaLogin>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof baristaLogin>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
/**
 * @summary Logout
 */
export declare const getBaristaLogoutUrl: () => string;
export declare const baristaLogout: (options?: RequestInit) => Promise<void>;
export declare const getBaristaLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof baristaLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof baristaLogout>>, TError, void, TContext>;
export type BaristaLogoutMutationResult = NonNullable<Awaited<ReturnType<typeof baristaLogout>>>;
export type BaristaLogoutMutationError = ErrorType<unknown>;
/**
 * @summary Logout
 */
export declare const useBaristaLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof baristaLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof baristaLogout>>, TError, void, TContext>;
/**
 * @summary Get current user
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all drinks
 */
export declare const getListDrinksUrl: (params?: ListDrinksParams) => string;
export declare const listDrinks: (params?: ListDrinksParams, options?: RequestInit) => Promise<Drink[]>;
export declare const getListDrinksQueryKey: (params?: ListDrinksParams) => readonly ["/api/drinks", ...ListDrinksParams[]];
export declare const getListDrinksQueryOptions: <TData = Awaited<ReturnType<typeof listDrinks>>, TError = ErrorType<unknown>>(params?: ListDrinksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDrinks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDrinks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDrinksQueryResult = NonNullable<Awaited<ReturnType<typeof listDrinks>>>;
export type ListDrinksQueryError = ErrorType<unknown>;
/**
 * @summary List all drinks
 */
export declare function useListDrinks<TData = Awaited<ReturnType<typeof listDrinks>>, TError = ErrorType<unknown>>(params?: ListDrinksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDrinks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a drink
 */
export declare const getCreateDrinkUrl: () => string;
export declare const createDrink: (createDrinkBody: CreateDrinkBody, options?: RequestInit) => Promise<Drink>;
export declare const getCreateDrinkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDrink>>, TError, {
        data: BodyType<CreateDrinkBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDrink>>, TError, {
    data: BodyType<CreateDrinkBody>;
}, TContext>;
export type CreateDrinkMutationResult = NonNullable<Awaited<ReturnType<typeof createDrink>>>;
export type CreateDrinkMutationBody = BodyType<CreateDrinkBody>;
export type CreateDrinkMutationError = ErrorType<unknown>;
/**
 * @summary Create a drink
 */
export declare const useCreateDrink: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDrink>>, TError, {
        data: BodyType<CreateDrinkBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDrink>>, TError, {
    data: BodyType<CreateDrinkBody>;
}, TContext>;
/**
 * @summary Get a drink with its ingredient slots
 */
export declare const getGetDrinkUrl: (id: number, params?: GetDrinkParams) => string;
export declare const getDrink: (id: number, params?: GetDrinkParams, options?: RequestInit) => Promise<DrinkDetail>;
export declare const getGetDrinkQueryKey: (id: number, params?: GetDrinkParams) => readonly [`/api/drinks/${number}`, ...GetDrinkParams[]];
export declare const getGetDrinkQueryOptions: <TData = Awaited<ReturnType<typeof getDrink>>, TError = ErrorType<void>>(id: number, params?: GetDrinkParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDrink>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDrink>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDrinkQueryResult = NonNullable<Awaited<ReturnType<typeof getDrink>>>;
export type GetDrinkQueryError = ErrorType<void>;
/**
 * @summary Get a drink with its ingredient slots
 */
export declare function useGetDrink<TData = Awaited<ReturnType<typeof getDrink>>, TError = ErrorType<void>>(id: number, params?: GetDrinkParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDrink>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a drink
 */
export declare const getUpdateDrinkUrl: (id: number, params?: UpdateDrinkParams) => string;
export declare const updateDrink: (id: number, updateDrinkBody: UpdateDrinkBody, params?: UpdateDrinkParams, options?: RequestInit) => Promise<Drink>;
export declare const getUpdateDrinkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDrink>>, TError, {
        id: number;
        data: BodyType<UpdateDrinkBody>;
        params?: UpdateDrinkParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDrink>>, TError, {
    id: number;
    data: BodyType<UpdateDrinkBody>;
    params?: UpdateDrinkParams;
}, TContext>;
export type UpdateDrinkMutationResult = NonNullable<Awaited<ReturnType<typeof updateDrink>>>;
export type UpdateDrinkMutationBody = BodyType<UpdateDrinkBody>;
export type UpdateDrinkMutationError = ErrorType<unknown>;
/**
 * @summary Update a drink
 */
export declare const useUpdateDrink: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDrink>>, TError, {
        id: number;
        data: BodyType<UpdateDrinkBody>;
        params?: UpdateDrinkParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDrink>>, TError, {
    id: number;
    data: BodyType<UpdateDrinkBody>;
    params?: UpdateDrinkParams;
}, TContext>;
/**
 * @summary Delete a drink
 */
export declare const getDeleteDrinkUrl: (id: number, params?: DeleteDrinkParams) => string;
export declare const deleteDrink: (id: number, params?: DeleteDrinkParams, options?: RequestInit) => Promise<void>;
export declare const getDeleteDrinkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDrink>>, TError, {
        id: number;
        params?: DeleteDrinkParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDrink>>, TError, {
    id: number;
    params?: DeleteDrinkParams;
}, TContext>;
export type DeleteDrinkMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDrink>>>;
export type DeleteDrinkMutationError = ErrorType<unknown>;
/**
 * @summary Delete a drink
 */
export declare const useDeleteDrink: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDrink>>, TError, {
        id: number;
        params?: DeleteDrinkParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDrink>>, TError, {
    id: number;
    params?: DeleteDrinkParams;
}, TContext>;
/**
 * @summary Calculate price with customizations (side-effect free)
 */
export declare const getCalculateDrinkPriceUrl: (id: number, params?: CalculateDrinkPriceParams) => string;
export declare const calculateDrinkPrice: (id: number, priceCalculationBody: PriceCalculationBody, params?: CalculateDrinkPriceParams, options?: RequestInit) => Promise<PriceBreakdown>;
export declare const getCalculateDrinkPriceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof calculateDrinkPrice>>, TError, {
        id: number;
        data: BodyType<PriceCalculationBody>;
        params?: CalculateDrinkPriceParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof calculateDrinkPrice>>, TError, {
    id: number;
    data: BodyType<PriceCalculationBody>;
    params?: CalculateDrinkPriceParams;
}, TContext>;
export type CalculateDrinkPriceMutationResult = NonNullable<Awaited<ReturnType<typeof calculateDrinkPrice>>>;
export type CalculateDrinkPriceMutationBody = BodyType<PriceCalculationBody>;
export type CalculateDrinkPriceMutationError = ErrorType<unknown>;
/**
 * @summary Calculate price with customizations (side-effect free)
 */
export declare const useCalculateDrinkPrice: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof calculateDrinkPrice>>, TError, {
        id: number;
        data: BodyType<PriceCalculationBody>;
        params?: CalculateDrinkPriceParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof calculateDrinkPrice>>, TError, {
    id: number;
    data: BodyType<PriceCalculationBody>;
    params?: CalculateDrinkPriceParams;
}, TContext>;
/**
 * @summary List all ingredients
 */
export declare const getListIngredientsUrl: (params?: ListIngredientsParams) => string;
export declare const listIngredients: (params?: ListIngredientsParams, options?: RequestInit) => Promise<Ingredient[]>;
export declare const getListIngredientsQueryKey: (params?: ListIngredientsParams) => readonly ["/api/ingredients", ...ListIngredientsParams[]];
export declare const getListIngredientsQueryOptions: <TData = Awaited<ReturnType<typeof listIngredients>>, TError = ErrorType<unknown>>(params?: ListIngredientsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listIngredients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listIngredients>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListIngredientsQueryResult = NonNullable<Awaited<ReturnType<typeof listIngredients>>>;
export type ListIngredientsQueryError = ErrorType<unknown>;
/**
 * @summary List all ingredients
 */
export declare function useListIngredients<TData = Awaited<ReturnType<typeof listIngredients>>, TError = ErrorType<unknown>>(params?: ListIngredientsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listIngredients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new ingredient
 */
export declare const getCreateIngredientUrl: () => string;
export declare const createIngredient: (createIngredientBody: CreateIngredientBody, options?: RequestInit) => Promise<Ingredient>;
export declare const getCreateIngredientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createIngredient>>, TError, {
        data: BodyType<CreateIngredientBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createIngredient>>, TError, {
    data: BodyType<CreateIngredientBody>;
}, TContext>;
export type CreateIngredientMutationResult = NonNullable<Awaited<ReturnType<typeof createIngredient>>>;
export type CreateIngredientMutationBody = BodyType<CreateIngredientBody>;
export type CreateIngredientMutationError = ErrorType<unknown>;
/**
 * @summary Create a new ingredient
 */
export declare const useCreateIngredient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createIngredient>>, TError, {
        data: BodyType<CreateIngredientBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createIngredient>>, TError, {
    data: BodyType<CreateIngredientBody>;
}, TContext>;
/**
 * @summary Wipe current inventory and import from Inventory2026.csv
 */
export declare const getImportInventoryCsvUrl: () => string;
export declare const importInventoryCsv: (options?: RequestInit) => Promise<void>;
export declare const getImportInventoryCsvMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof importInventoryCsv>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof importInventoryCsv>>, TError, void, TContext>;
export type ImportInventoryCsvMutationResult = NonNullable<Awaited<ReturnType<typeof importInventoryCsv>>>;
export type ImportInventoryCsvMutationError = ErrorType<void>;
/**
 * @summary Wipe current inventory and import from Inventory2026.csv
 */
export declare const useImportInventoryCsv: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof importInventoryCsv>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof importInventoryCsv>>, TError, void, TContext>;
/**
 * @summary Get ingredient with options
 */
export declare const getGetIngredientUrl: (id: number, params?: GetIngredientParams) => string;
export declare const getIngredient: (id: number, params?: GetIngredientParams, options?: RequestInit) => Promise<IngredientDetail>;
export declare const getGetIngredientQueryKey: (id: number, params?: GetIngredientParams) => readonly [`/api/ingredients/${number}`, ...GetIngredientParams[]];
export declare const getGetIngredientQueryOptions: <TData = Awaited<ReturnType<typeof getIngredient>>, TError = ErrorType<void>>(id: number, params?: GetIngredientParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIngredient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIngredient>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIngredientQueryResult = NonNullable<Awaited<ReturnType<typeof getIngredient>>>;
export type GetIngredientQueryError = ErrorType<void>;
/**
 * @summary Get ingredient with options
 */
export declare function useGetIngredient<TData = Awaited<ReturnType<typeof getIngredient>>, TError = ErrorType<void>>(id: number, params?: GetIngredientParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIngredient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update an ingredient
 */
export declare const getUpdateIngredientUrl: (id: number, params?: UpdateIngredientParams) => string;
export declare const updateIngredient: (id: number, updateIngredientBody: UpdateIngredientBody, params?: UpdateIngredientParams, options?: RequestInit) => Promise<Ingredient>;
export declare const getUpdateIngredientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIngredient>>, TError, {
        id: number;
        data: BodyType<UpdateIngredientBody>;
        params?: UpdateIngredientParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateIngredient>>, TError, {
    id: number;
    data: BodyType<UpdateIngredientBody>;
    params?: UpdateIngredientParams;
}, TContext>;
export type UpdateIngredientMutationResult = NonNullable<Awaited<ReturnType<typeof updateIngredient>>>;
export type UpdateIngredientMutationBody = BodyType<UpdateIngredientBody>;
export type UpdateIngredientMutationError = ErrorType<unknown>;
/**
 * @summary Update an ingredient
 */
export declare const useUpdateIngredient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIngredient>>, TError, {
        id: number;
        data: BodyType<UpdateIngredientBody>;
        params?: UpdateIngredientParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateIngredient>>, TError, {
    id: number;
    data: BodyType<UpdateIngredientBody>;
    params?: UpdateIngredientParams;
}, TContext>;
/**
 * @summary Delete an ingredient
 */
export declare const getDeleteIngredientUrl: (id: number, params?: DeleteIngredientParams) => string;
export declare const deleteIngredient: (id: number, params?: DeleteIngredientParams, options?: RequestInit) => Promise<void>;
export declare const getDeleteIngredientMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteIngredient>>, TError, {
        id: number;
        params?: DeleteIngredientParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteIngredient>>, TError, {
    id: number;
    params?: DeleteIngredientParams;
}, TContext>;
export type DeleteIngredientMutationResult = NonNullable<Awaited<ReturnType<typeof deleteIngredient>>>;
export type DeleteIngredientMutationError = ErrorType<void>;
/**
 * @summary Delete an ingredient
 */
export declare const useDeleteIngredient: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteIngredient>>, TError, {
        id: number;
        params?: DeleteIngredientParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteIngredient>>, TError, {
    id: number;
    params?: DeleteIngredientParams;
}, TContext>;
/**
 * @summary Add an option to an ingredient
 */
export declare const getCreateIngredientOptionUrl: (id: number, params?: CreateIngredientOptionParams) => string;
export declare const createIngredientOption: (id: number, createIngredientOptionBody: CreateIngredientOptionBody, params?: CreateIngredientOptionParams, options?: RequestInit) => Promise<IngredientOption>;
export declare const getCreateIngredientOptionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createIngredientOption>>, TError, {
        id: number;
        data: BodyType<CreateIngredientOptionBody>;
        params?: CreateIngredientOptionParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createIngredientOption>>, TError, {
    id: number;
    data: BodyType<CreateIngredientOptionBody>;
    params?: CreateIngredientOptionParams;
}, TContext>;
export type CreateIngredientOptionMutationResult = NonNullable<Awaited<ReturnType<typeof createIngredientOption>>>;
export type CreateIngredientOptionMutationBody = BodyType<CreateIngredientOptionBody>;
export type CreateIngredientOptionMutationError = ErrorType<unknown>;
/**
 * @summary Add an option to an ingredient
 */
export declare const useCreateIngredientOption: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createIngredientOption>>, TError, {
        id: number;
        data: BodyType<CreateIngredientOptionBody>;
        params?: CreateIngredientOptionParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createIngredientOption>>, TError, {
    id: number;
    data: BodyType<CreateIngredientOptionBody>;
    params?: CreateIngredientOptionParams;
}, TContext>;
/**
 * @summary Update an ingredient option
 */
export declare const getUpdateIngredientOptionUrl: (id: number, optionId: number, params?: UpdateIngredientOptionParams) => string;
export declare const updateIngredientOption: (id: number, optionId: number, updateIngredientOptionBody: UpdateIngredientOptionBody, params?: UpdateIngredientOptionParams, options?: RequestInit) => Promise<IngredientOption>;
export declare const getUpdateIngredientOptionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIngredientOption>>, TError, {
        id: number;
        optionId: number;
        data: BodyType<UpdateIngredientOptionBody>;
        params?: UpdateIngredientOptionParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateIngredientOption>>, TError, {
    id: number;
    optionId: number;
    data: BodyType<UpdateIngredientOptionBody>;
    params?: UpdateIngredientOptionParams;
}, TContext>;
export type UpdateIngredientOptionMutationResult = NonNullable<Awaited<ReturnType<typeof updateIngredientOption>>>;
export type UpdateIngredientOptionMutationBody = BodyType<UpdateIngredientOptionBody>;
export type UpdateIngredientOptionMutationError = ErrorType<unknown>;
/**
 * @summary Update an ingredient option
 */
export declare const useUpdateIngredientOption: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIngredientOption>>, TError, {
        id: number;
        optionId: number;
        data: BodyType<UpdateIngredientOptionBody>;
        params?: UpdateIngredientOptionParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateIngredientOption>>, TError, {
    id: number;
    optionId: number;
    data: BodyType<UpdateIngredientOptionBody>;
    params?: UpdateIngredientOptionParams;
}, TContext>;
/**
 * @summary Remove an option from an ingredient
 */
export declare const getDeleteIngredientOptionUrl: (id: number, optionId: number, params?: DeleteIngredientOptionParams) => string;
export declare const deleteIngredientOption: (id: number, optionId: number, params?: DeleteIngredientOptionParams, options?: RequestInit) => Promise<void>;
export declare const getDeleteIngredientOptionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteIngredientOption>>, TError, {
        id: number;
        optionId: number;
        params?: DeleteIngredientOptionParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteIngredientOption>>, TError, {
    id: number;
    optionId: number;
    params?: DeleteIngredientOptionParams;
}, TContext>;
export type DeleteIngredientOptionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteIngredientOption>>>;
export type DeleteIngredientOptionMutationError = ErrorType<unknown>;
/**
 * @summary Remove an option from an ingredient
 */
export declare const useDeleteIngredientOption: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteIngredientOption>>, TError, {
        id: number;
        optionId: number;
        params?: DeleteIngredientOptionParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteIngredientOption>>, TError, {
    id: number;
    optionId: number;
    params?: DeleteIngredientOptionParams;
}, TContext>;
/**
 * @summary Restock an ingredient
 */
export declare const getRestockIngredientUrl: (id: number, params?: RestockIngredientParams) => string;
export declare const restockIngredient: (id: number, restockBody: RestockBody, params?: RestockIngredientParams, options?: RequestInit) => Promise<Ingredient>;
export declare const getRestockIngredientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof restockIngredient>>, TError, {
        id: number;
        data: BodyType<RestockBody>;
        params?: RestockIngredientParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof restockIngredient>>, TError, {
    id: number;
    data: BodyType<RestockBody>;
    params?: RestockIngredientParams;
}, TContext>;
export type RestockIngredientMutationResult = NonNullable<Awaited<ReturnType<typeof restockIngredient>>>;
export type RestockIngredientMutationBody = BodyType<RestockBody>;
export type RestockIngredientMutationError = ErrorType<unknown>;
/**
 * @summary Restock an ingredient
 */
export declare const useRestockIngredient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof restockIngredient>>, TError, {
        id: number;
        data: BodyType<RestockBody>;
        params?: RestockIngredientParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof restockIngredient>>, TError, {
    id: number;
    data: BodyType<RestockBody>;
    params?: RestockIngredientParams;
}, TContext>;
/**
 * @summary List orders
 */
export declare const getListOrdersUrl: (params?: ListOrdersParams) => string;
export declare const listOrders: (params?: ListOrdersParams, options?: RequestInit) => Promise<OrderDetail[]>;
export declare const getListOrdersQueryKey: (params?: ListOrdersParams) => readonly ["/api/orders", ...ListOrdersParams[]];
export declare const getListOrdersQueryOptions: <TData = Awaited<ReturnType<typeof listOrders>>, TError = ErrorType<unknown>>(params?: ListOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof listOrders>>>;
export type ListOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List orders
 */
export declare function useListOrders<TData = Awaited<ReturnType<typeof listOrders>>, TError = ErrorType<unknown>>(params?: ListOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Place a new order (full transaction)
 */
export declare const getCreateOrderUrl: () => string;
export declare const createOrder: (createOrderBody: CreateOrderBody, options?: RequestInit) => Promise<OrderDetail>;
export declare const getCreateOrderMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<CreateOrderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<CreateOrderBody>;
}, TContext>;
export type CreateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createOrder>>>;
export type CreateOrderMutationBody = BodyType<CreateOrderBody>;
export type CreateOrderMutationError = ErrorType<void>;
/**
 * @summary Place a new order (full transaction)
 */
export declare const useCreateOrder: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<CreateOrderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<CreateOrderBody>;
}, TContext>;
/**
 * @summary Get order detail
 */
export declare const getGetOrderUrl: (id: number, params?: GetOrderParams) => string;
export declare const getOrder: (id: number, params?: GetOrderParams, options?: RequestInit) => Promise<OrderDetail>;
export declare const getGetOrderQueryKey: (id: number, params?: GetOrderParams) => readonly [`/api/orders/${number}`, ...GetOrderParams[]];
export declare const getGetOrderQueryOptions: <TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<void>>(id: number, params?: GetOrderParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrderQueryResult = NonNullable<Awaited<ReturnType<typeof getOrder>>>;
export type GetOrderQueryError = ErrorType<void>;
/**
 * @summary Get order detail
 */
export declare function useGetOrder<TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<void>>(id: number, params?: GetOrderParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Advance order status (kitchen display)
 */
export declare const getUpdateOrderStatusUrl: (id: number, params?: UpdateOrderStatusParams) => string;
export declare const updateOrderStatus: (id: number, updateOrderStatusBody: UpdateOrderStatusBody, params?: UpdateOrderStatusParams, options?: RequestInit) => Promise<Order>;
export declare const getUpdateOrderStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<UpdateOrderStatusBody>;
        params?: UpdateOrderStatusParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<UpdateOrderStatusBody>;
    params?: UpdateOrderStatusParams;
}, TContext>;
export type UpdateOrderStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrderStatus>>>;
export type UpdateOrderStatusMutationBody = BodyType<UpdateOrderStatusBody>;
export type UpdateOrderStatusMutationError = ErrorType<unknown>;
/**
 * @summary Advance order status (kitchen display)
 */
export declare const useUpdateOrderStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<UpdateOrderStatusBody>;
        params?: UpdateOrderStatusParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<UpdateOrderStatusBody>;
    params?: UpdateOrderStatusParams;
}, TContext>;
/**
 * @summary Mark a specific order item as ready
 */
export declare const getMarkOrderItemReadyUrl: (id: number, params?: MarkOrderItemReadyParams) => string;
export declare const markOrderItemReady: (id: number, params?: MarkOrderItemReadyParams, options?: RequestInit) => Promise<Order>;
export declare const getMarkOrderItemReadyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markOrderItemReady>>, TError, {
        id: number;
        params?: MarkOrderItemReadyParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markOrderItemReady>>, TError, {
    id: number;
    params?: MarkOrderItemReadyParams;
}, TContext>;
export type MarkOrderItemReadyMutationResult = NonNullable<Awaited<ReturnType<typeof markOrderItemReady>>>;
export type MarkOrderItemReadyMutationError = ErrorType<unknown>;
/**
 * @summary Mark a specific order item as ready
 */
export declare const useMarkOrderItemReady: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markOrderItemReady>>, TError, {
        id: number;
        params?: MarkOrderItemReadyParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markOrderItemReady>>, TError, {
    id: number;
    params?: MarkOrderItemReadyParams;
}, TContext>;
/**
 * @summary List stock movements ledger
 */
export declare const getListStockMovementsUrl: (params?: ListStockMovementsParams) => string;
export declare const listStockMovements: (params?: ListStockMovementsParams, options?: RequestInit) => Promise<StockMovement[]>;
export declare const getListStockMovementsQueryKey: (params?: ListStockMovementsParams) => readonly ["/api/stock/movements", ...ListStockMovementsParams[]];
export declare const getListStockMovementsQueryOptions: <TData = Awaited<ReturnType<typeof listStockMovements>>, TError = ErrorType<unknown>>(params?: ListStockMovementsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listStockMovements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listStockMovements>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListStockMovementsQueryResult = NonNullable<Awaited<ReturnType<typeof listStockMovements>>>;
export type ListStockMovementsQueryError = ErrorType<unknown>;
/**
 * @summary List stock movements ledger
 */
export declare function useListStockMovements<TData = Awaited<ReturnType<typeof listStockMovements>>, TError = ErrorType<unknown>>(params?: ListStockMovementsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listStockMovements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create manual stock adjustment or waste entry
 */
export declare const getCreateStockAdjustmentUrl: () => string;
export declare const createStockAdjustment: (stockAdjustmentBody: StockAdjustmentBody, options?: RequestInit) => Promise<StockMovement>;
export declare const getCreateStockAdjustmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStockAdjustment>>, TError, {
        data: BodyType<StockAdjustmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createStockAdjustment>>, TError, {
    data: BodyType<StockAdjustmentBody>;
}, TContext>;
export type CreateStockAdjustmentMutationResult = NonNullable<Awaited<ReturnType<typeof createStockAdjustment>>>;
export type CreateStockAdjustmentMutationBody = BodyType<StockAdjustmentBody>;
export type CreateStockAdjustmentMutationError = ErrorType<unknown>;
/**
 * @summary Create manual stock adjustment or waste entry
 */
export declare const useCreateStockAdjustment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStockAdjustment>>, TError, {
        data: BodyType<StockAdjustmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createStockAdjustment>>, TError, {
    data: BodyType<StockAdjustmentBody>;
}, TContext>;
/**
 * @summary Get today's sales summary
 */
export declare const getGetDashboardSummaryUrl: () => string;
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get today's sales summary
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get active orders for various screens
 */
export declare const getGetActiveOrdersUrl: (params?: GetActiveOrdersParams) => string;
export declare const getActiveOrders: (params?: GetActiveOrdersParams, options?: RequestInit) => Promise<OrderDetail[]>;
export declare const getGetActiveOrdersQueryKey: (params?: GetActiveOrdersParams) => readonly ["/api/dashboard/active-orders", ...GetActiveOrdersParams[]];
export declare const getGetActiveOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getActiveOrders>>, TError = ErrorType<unknown>>(params?: GetActiveOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActiveOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getActiveOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetActiveOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getActiveOrders>>>;
export type GetActiveOrdersQueryError = ErrorType<unknown>;
/**
 * @summary Get active orders for various screens
 */
export declare function useGetActiveOrders<TData = Awaited<ReturnType<typeof getActiveOrders>>, TError = ErrorType<unknown>>(params?: GetActiveOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActiveOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get ingredients below low stock threshold
 */
export declare const getGetLowStockIngredientsUrl: () => string;
export declare const getLowStockIngredients: (options?: RequestInit) => Promise<Ingredient[]>;
export declare const getGetLowStockIngredientsQueryKey: () => readonly ["/api/dashboard/low-stock"];
export declare const getGetLowStockIngredientsQueryOptions: <TData = Awaited<ReturnType<typeof getLowStockIngredients>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStockIngredients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLowStockIngredients>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLowStockIngredientsQueryResult = NonNullable<Awaited<ReturnType<typeof getLowStockIngredients>>>;
export type GetLowStockIngredientsQueryError = ErrorType<unknown>;
/**
 * @summary Get ingredients below low stock threshold
 */
export declare function useGetLowStockIngredients<TData = Awaited<ReturnType<typeof getLowStockIngredients>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStockIngredients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all users
 */
export declare const getListUsersUrl: () => string;
export declare const listUsers: (options?: RequestInit) => Promise<UserDetail[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new user
 */
export declare const getCreateUserUrl: () => string;
export declare const createUser: (createUserBody: CreateUserBody, options?: RequestInit) => Promise<UserDetail>;
export declare const getCreateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<CreateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<CreateUserBody>;
}, TContext>;
export type CreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof createUser>>>;
export type CreateUserMutationBody = BodyType<CreateUserBody>;
export type CreateUserMutationError = ErrorType<unknown>;
/**
 * @summary Create a new user
 */
export declare const useCreateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<CreateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<CreateUserBody>;
}, TContext>;
/**
 * @summary Update a user
 */
export declare const getUpdateUserUrl: (id: number, params?: UpdateUserParams) => string;
export declare const updateUser: (id: number, updateUserBody: UpdateUserBody, params?: UpdateUserParams, options?: RequestInit) => Promise<UserDetail>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UpdateUserBody>;
        params?: UpdateUserParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UpdateUserBody>;
    params?: UpdateUserParams;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UpdateUserBody>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
 * @summary Update a user
 */
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UpdateUserBody>;
        params?: UpdateUserParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UpdateUserBody>;
    params?: UpdateUserParams;
}, TContext>;
/**
 * @summary Delete a user
 */
export declare const getDeleteUserUrl: (id: number, params?: DeleteUserParams) => string;
export declare const deleteUser: (id: number, params?: DeleteUserParams, options?: RequestInit) => Promise<void>;
export declare const getDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
        params?: DeleteUserParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
    params?: DeleteUserParams;
}, TContext>;
export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>;
export type DeleteUserMutationError = ErrorType<unknown>;
/**
 * @summary Delete a user
 */
export declare const useDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
        params?: DeleteUserParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
    params?: DeleteUserParams;
}, TContext>;
/**
 * @summary List activity logs
 */
export declare const getListActivityLogsUrl: (params?: ListActivityLogsParams) => string;
export declare const listActivityLogs: (params?: ListActivityLogsParams, options?: RequestInit) => Promise<ActivityLog[]>;
export declare const getListActivityLogsQueryKey: (params?: ListActivityLogsParams) => readonly ["/api/admin/activity-logs", ...ListActivityLogsParams[]];
export declare const getListActivityLogsQueryOptions: <TData = Awaited<ReturnType<typeof listActivityLogs>>, TError = ErrorType<unknown>>(params?: ListActivityLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActivityLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listActivityLogs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListActivityLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listActivityLogs>>>;
export type ListActivityLogsQueryError = ErrorType<unknown>;
/**
 * @summary List activity logs
 */
export declare function useListActivityLogs<TData = Awaited<ReturnType<typeof listActivityLogs>>, TError = ErrorType<unknown>>(params?: ListActivityLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActivityLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all available permissions
 */
export declare const getListPermissionsUrl: () => string;
export declare const listPermissions: (options?: RequestInit) => Promise<Permission[]>;
export declare const getListPermissionsQueryKey: () => readonly ["/api/admin/permissions"];
export declare const getListPermissionsQueryOptions: <TData = Awaited<ReturnType<typeof listPermissions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPermissions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPermissions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPermissionsQueryResult = NonNullable<Awaited<ReturnType<typeof listPermissions>>>;
export type ListPermissionsQueryError = ErrorType<unknown>;
/**
 * @summary List all available permissions
 */
export declare function useListPermissions<TData = Awaited<ReturnType<typeof listPermissions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPermissions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get sales grouped by drink category
 */
export declare const getGetSalesByCategoryUrl: (params?: GetSalesByCategoryParams) => string;
export declare const getSalesByCategory: (params?: GetSalesByCategoryParams, options?: RequestInit) => Promise<CategorySales[]>;
export declare const getGetSalesByCategoryQueryKey: (params?: GetSalesByCategoryParams) => readonly ["/api/dashboard/sales-by-category", ...GetSalesByCategoryParams[]];
export declare const getGetSalesByCategoryQueryOptions: <TData = Awaited<ReturnType<typeof getSalesByCategory>>, TError = ErrorType<unknown>>(params?: GetSalesByCategoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesByCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesByCategory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesByCategoryQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesByCategory>>>;
export type GetSalesByCategoryQueryError = ErrorType<unknown>;
/**
 * @summary Get sales grouped by drink category
 */
export declare function useGetSalesByCategory<TData = Awaited<ReturnType<typeof getSalesByCategory>>, TError = ErrorType<unknown>>(params?: GetSalesByCategoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesByCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get top selling drinks
 */
export declare const getGetTopDrinksUrl: (params?: GetTopDrinksParams) => string;
export declare const getTopDrinks: (params?: GetTopDrinksParams, options?: RequestInit) => Promise<TopDrink[]>;
export declare const getGetTopDrinksQueryKey: (params?: GetTopDrinksParams) => readonly ["/api/dashboard/top-drinks", ...GetTopDrinksParams[]];
export declare const getGetTopDrinksQueryOptions: <TData = Awaited<ReturnType<typeof getTopDrinks>>, TError = ErrorType<unknown>>(params?: GetTopDrinksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopDrinks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTopDrinks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTopDrinksQueryResult = NonNullable<Awaited<ReturnType<typeof getTopDrinks>>>;
export type GetTopDrinksQueryError = ErrorType<unknown>;
/**
 * @summary Get top selling drinks
 */
export declare function useGetTopDrinks<TData = Awaited<ReturnType<typeof getTopDrinks>>, TError = ErrorType<unknown>>(params?: GetTopDrinksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopDrinks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get application settings
 */
export declare const getGetSettingsUrl: (params?: GetSettingsParams) => string;
export declare const getSettings: (params?: GetSettingsParams, options?: RequestInit) => Promise<Setting[]>;
export declare const getGetSettingsQueryKey: (params?: GetSettingsParams) => readonly ["/api/settings", ...GetSettingsParams[]];
export declare const getGetSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(params?: GetSettingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSettings>>>;
export type GetSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get application settings
 */
export declare function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(params?: GetSettingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update multiple settings
 */
export declare const getUpdateSettingsUrl: () => string;
export declare const updateSettings: (updateSettingsBody: UpdateSettingsBody, options?: RequestInit) => Promise<Setting[]>;
export declare const getUpdateSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<UpdateSettingsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<UpdateSettingsBody>;
}, TContext>;
export type UpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSettings>>>;
export type UpdateSettingsMutationBody = BodyType<UpdateSettingsBody>;
export type UpdateSettingsMutationError = ErrorType<unknown>;
/**
 * @summary Update multiple settings
 */
export declare const useUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<UpdateSettingsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<UpdateSettingsBody>;
}, TContext>;
/**
 * @summary List all discounts
 */
export declare const getListDiscountsUrl: () => string;
export declare const listDiscounts: (options?: RequestInit) => Promise<Discount[]>;
export declare const getListDiscountsQueryKey: () => readonly ["/api/discounts"];
export declare const getListDiscountsQueryOptions: <TData = Awaited<ReturnType<typeof listDiscounts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDiscounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDiscounts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDiscountsQueryResult = NonNullable<Awaited<ReturnType<typeof listDiscounts>>>;
export type ListDiscountsQueryError = ErrorType<unknown>;
/**
 * @summary List all discounts
 */
export declare function useListDiscounts<TData = Awaited<ReturnType<typeof listDiscounts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDiscounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a discount
 */
export declare const getCreateDiscountUrl: () => string;
export declare const createDiscount: (createDiscountBody: CreateDiscountBody, options?: RequestInit) => Promise<Discount>;
export declare const getCreateDiscountMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDiscount>>, TError, {
        data: BodyType<CreateDiscountBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDiscount>>, TError, {
    data: BodyType<CreateDiscountBody>;
}, TContext>;
export type CreateDiscountMutationResult = NonNullable<Awaited<ReturnType<typeof createDiscount>>>;
export type CreateDiscountMutationBody = BodyType<CreateDiscountBody>;
export type CreateDiscountMutationError = ErrorType<unknown>;
/**
 * @summary Create a discount
 */
export declare const useCreateDiscount: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDiscount>>, TError, {
        data: BodyType<CreateDiscountBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDiscount>>, TError, {
    data: BodyType<CreateDiscountBody>;
}, TContext>;
/**
 * @summary Update a discount
 */
export declare const getUpdateDiscountUrl: (id: number, params?: UpdateDiscountParams) => string;
export declare const updateDiscount: (id: number, updateDiscountBody: UpdateDiscountBody, params?: UpdateDiscountParams, options?: RequestInit) => Promise<Discount>;
export declare const getUpdateDiscountMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDiscount>>, TError, {
        id: number;
        data: BodyType<UpdateDiscountBody>;
        params?: UpdateDiscountParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDiscount>>, TError, {
    id: number;
    data: BodyType<UpdateDiscountBody>;
    params?: UpdateDiscountParams;
}, TContext>;
export type UpdateDiscountMutationResult = NonNullable<Awaited<ReturnType<typeof updateDiscount>>>;
export type UpdateDiscountMutationBody = BodyType<UpdateDiscountBody>;
export type UpdateDiscountMutationError = ErrorType<unknown>;
/**
 * @summary Update a discount
 */
export declare const useUpdateDiscount: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDiscount>>, TError, {
        id: number;
        data: BodyType<UpdateDiscountBody>;
        params?: UpdateDiscountParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDiscount>>, TError, {
    id: number;
    data: BodyType<UpdateDiscountBody>;
    params?: UpdateDiscountParams;
}, TContext>;
/**
 * @summary Delete a discount
 */
export declare const getDeleteDiscountUrl: (id: number, params?: DeleteDiscountParams) => string;
export declare const deleteDiscount: (id: number, params?: DeleteDiscountParams, options?: RequestInit) => Promise<void>;
export declare const getDeleteDiscountMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDiscount>>, TError, {
        id: number;
        params?: DeleteDiscountParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDiscount>>, TError, {
    id: number;
    params?: DeleteDiscountParams;
}, TContext>;
export type DeleteDiscountMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDiscount>>>;
export type DeleteDiscountMutationError = ErrorType<unknown>;
/**
 * @summary Delete a discount
 */
export declare const useDeleteDiscount: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDiscount>>, TError, {
        id: number;
        params?: DeleteDiscountParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDiscount>>, TError, {
    id: number;
    params?: DeleteDiscountParams;
}, TContext>;
/**
 * @summary List all branches
 */
export declare const getListBranchesUrl: () => string;
export declare const listBranches: (options?: RequestInit) => Promise<Branch[]>;
export declare const getListBranchesQueryKey: () => readonly ["/api/admin/branches"];
export declare const getListBranchesQueryOptions: <TData = Awaited<ReturnType<typeof listBranches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBranches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listBranches>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListBranchesQueryResult = NonNullable<Awaited<ReturnType<typeof listBranches>>>;
export type ListBranchesQueryError = ErrorType<unknown>;
/**
 * @summary List all branches
 */
export declare function useListBranches<TData = Awaited<ReturnType<typeof listBranches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBranches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new branch
 */
export declare const getCreateBranchUrl: () => string;
export declare const createBranch: (createBranchBody: CreateBranchBody, options?: RequestInit) => Promise<Branch>;
export declare const getCreateBranchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBranch>>, TError, {
        data: BodyType<CreateBranchBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBranch>>, TError, {
    data: BodyType<CreateBranchBody>;
}, TContext>;
export type CreateBranchMutationResult = NonNullable<Awaited<ReturnType<typeof createBranch>>>;
export type CreateBranchMutationBody = BodyType<CreateBranchBody>;
export type CreateBranchMutationError = ErrorType<unknown>;
/**
 * @summary Create a new branch
 */
export declare const useCreateBranch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBranch>>, TError, {
        data: BodyType<CreateBranchBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBranch>>, TError, {
    data: BodyType<CreateBranchBody>;
}, TContext>;
/**
 * @summary Update a branch
 */
export declare const getUpdateBranchUrl: (id: number) => string;
export declare const updateBranch: (id: number, updateBranchBody: UpdateBranchBody, options?: RequestInit) => Promise<Branch>;
export declare const getUpdateBranchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBranch>>, TError, {
        id: number;
        data: BodyType<UpdateBranchBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateBranch>>, TError, {
    id: number;
    data: BodyType<UpdateBranchBody>;
}, TContext>;
export type UpdateBranchMutationResult = NonNullable<Awaited<ReturnType<typeof updateBranch>>>;
export type UpdateBranchMutationBody = BodyType<UpdateBranchBody>;
export type UpdateBranchMutationError = ErrorType<unknown>;
/**
 * @summary Update a branch
 */
export declare const useUpdateBranch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBranch>>, TError, {
        id: number;
        data: BodyType<UpdateBranchBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateBranch>>, TError, {
    id: number;
    data: BodyType<UpdateBranchBody>;
}, TContext>;
/**
 * @summary Delete a branch
 */
export declare const getDeleteBranchUrl: (id: number) => string;
export declare const deleteBranch: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteBranchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBranch>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteBranch>>, TError, {
    id: number;
}, TContext>;
export type DeleteBranchMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBranch>>>;
export type DeleteBranchMutationError = ErrorType<unknown>;
/**
 * @summary Delete a branch
 */
export declare const useDeleteBranch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBranch>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteBranch>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Validate a discount code
 */
export declare const getValidateDiscountUrl: (code: string) => string;
export declare const validateDiscount: (code: string, options?: RequestInit) => Promise<Discount>;
export declare const getValidateDiscountQueryKey: (code: string) => readonly [`/api/discounts/validate/${string}`];
export declare const getValidateDiscountQueryOptions: <TData = Awaited<ReturnType<typeof validateDiscount>>, TError = ErrorType<void>>(code: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof validateDiscount>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof validateDiscount>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ValidateDiscountQueryResult = NonNullable<Awaited<ReturnType<typeof validateDiscount>>>;
export type ValidateDiscountQueryError = ErrorType<void>;
/**
 * @summary Validate a discount code
 */
export declare function useValidateDiscount<TData = Awaited<ReturnType<typeof validateDiscount>>, TError = ErrorType<void>>(code: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof validateDiscount>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map