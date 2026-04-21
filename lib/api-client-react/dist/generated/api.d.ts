import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { CategorySales, CreateDrinkBody, CreateIngredientBody, CreateIngredientOptionBody, CreateOrderBody, DashboardSummary, Drink, DrinkDetail, GetSalesByCategoryParams, GetSettingsParams, GetTopDrinksParams, HealthStatus, Ingredient, IngredientDetail, IngredientOption, ListDrinksParams, ListIngredientsParams, ListOrdersParams, ListStockMovementsParams, LoginBody, LoginResponse, Order, OrderDetail, PriceBreakdown, PriceCalculationBody, RestockBody, Setting, StockAdjustmentBody, StockMovement, TopDrink, UpdateDrinkBody, UpdateIngredientBody, UpdateIngredientOptionBody, UpdateOrderStatusBody, UpdateSettingsBody, User } from "./api.schemas";
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
export declare const getGetDrinkUrl: (id: number) => string;
export declare const getDrink: (id: number, options?: RequestInit) => Promise<DrinkDetail>;
export declare const getGetDrinkQueryKey: (id: number) => readonly [`/api/drinks/${number}`];
export declare const getGetDrinkQueryOptions: <TData = Awaited<ReturnType<typeof getDrink>>, TError = ErrorType<void>>(id: number, options?: {
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
export declare function useGetDrink<TData = Awaited<ReturnType<typeof getDrink>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDrink>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a drink
 */
export declare const getUpdateDrinkUrl: (id: number) => string;
export declare const updateDrink: (id: number, updateDrinkBody: UpdateDrinkBody, options?: RequestInit) => Promise<Drink>;
export declare const getUpdateDrinkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDrink>>, TError, {
        id: number;
        data: BodyType<UpdateDrinkBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDrink>>, TError, {
    id: number;
    data: BodyType<UpdateDrinkBody>;
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
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDrink>>, TError, {
    id: number;
    data: BodyType<UpdateDrinkBody>;
}, TContext>;
/**
 * @summary Delete a drink
 */
export declare const getDeleteDrinkUrl: (id: number) => string;
export declare const deleteDrink: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteDrinkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDrink>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDrink>>, TError, {
    id: number;
}, TContext>;
export type DeleteDrinkMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDrink>>>;
export type DeleteDrinkMutationError = ErrorType<unknown>;
/**
 * @summary Delete a drink
 */
export declare const useDeleteDrink: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDrink>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDrink>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Calculate price with customizations (side-effect free)
 */
export declare const getCalculateDrinkPriceUrl: (id: number) => string;
export declare const calculateDrinkPrice: (id: number, priceCalculationBody: PriceCalculationBody, options?: RequestInit) => Promise<PriceBreakdown>;
export declare const getCalculateDrinkPriceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof calculateDrinkPrice>>, TError, {
        id: number;
        data: BodyType<PriceCalculationBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof calculateDrinkPrice>>, TError, {
    id: number;
    data: BodyType<PriceCalculationBody>;
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
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof calculateDrinkPrice>>, TError, {
    id: number;
    data: BodyType<PriceCalculationBody>;
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
 * @summary Create an ingredient
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
 * @summary Create an ingredient
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
 * @summary Get ingredient with options
 */
export declare const getGetIngredientUrl: (id: number) => string;
export declare const getIngredient: (id: number, options?: RequestInit) => Promise<IngredientDetail>;
export declare const getGetIngredientQueryKey: (id: number) => readonly [`/api/ingredients/${number}`];
export declare const getGetIngredientQueryOptions: <TData = Awaited<ReturnType<typeof getIngredient>>, TError = ErrorType<void>>(id: number, options?: {
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
export declare function useGetIngredient<TData = Awaited<ReturnType<typeof getIngredient>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIngredient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update an ingredient
 */
export declare const getUpdateIngredientUrl: (id: number) => string;
export declare const updateIngredient: (id: number, updateIngredientBody: UpdateIngredientBody, options?: RequestInit) => Promise<Ingredient>;
export declare const getUpdateIngredientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIngredient>>, TError, {
        id: number;
        data: BodyType<UpdateIngredientBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateIngredient>>, TError, {
    id: number;
    data: BodyType<UpdateIngredientBody>;
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
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateIngredient>>, TError, {
    id: number;
    data: BodyType<UpdateIngredientBody>;
}, TContext>;
/**
 * @summary Add an option to an ingredient
 */
export declare const getCreateIngredientOptionUrl: (id: number) => string;
export declare const createIngredientOption: (id: number, createIngredientOptionBody: CreateIngredientOptionBody, options?: RequestInit) => Promise<IngredientOption>;
export declare const getCreateIngredientOptionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createIngredientOption>>, TError, {
        id: number;
        data: BodyType<CreateIngredientOptionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createIngredientOption>>, TError, {
    id: number;
    data: BodyType<CreateIngredientOptionBody>;
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
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createIngredientOption>>, TError, {
    id: number;
    data: BodyType<CreateIngredientOptionBody>;
}, TContext>;
/**
 * @summary Update an ingredient option
 */
export declare const getUpdateIngredientOptionUrl: (id: number, optionId: number) => string;
export declare const updateIngredientOption: (id: number, optionId: number, updateIngredientOptionBody: UpdateIngredientOptionBody, options?: RequestInit) => Promise<IngredientOption>;
export declare const getUpdateIngredientOptionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIngredientOption>>, TError, {
        id: number;
        optionId: number;
        data: BodyType<UpdateIngredientOptionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateIngredientOption>>, TError, {
    id: number;
    optionId: number;
    data: BodyType<UpdateIngredientOptionBody>;
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
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateIngredientOption>>, TError, {
    id: number;
    optionId: number;
    data: BodyType<UpdateIngredientOptionBody>;
}, TContext>;
/**
 * @summary Remove an option from an ingredient
 */
export declare const getDeleteIngredientOptionUrl: (id: number, optionId: number) => string;
export declare const deleteIngredientOption: (id: number, optionId: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteIngredientOptionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteIngredientOption>>, TError, {
        id: number;
        optionId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteIngredientOption>>, TError, {
    id: number;
    optionId: number;
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
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteIngredientOption>>, TError, {
    id: number;
    optionId: number;
}, TContext>;
/**
 * @summary Restock an ingredient
 */
export declare const getRestockIngredientUrl: (id: number) => string;
export declare const restockIngredient: (id: number, restockBody: RestockBody, options?: RequestInit) => Promise<Ingredient>;
export declare const getRestockIngredientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof restockIngredient>>, TError, {
        id: number;
        data: BodyType<RestockBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof restockIngredient>>, TError, {
    id: number;
    data: BodyType<RestockBody>;
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
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof restockIngredient>>, TError, {
    id: number;
    data: BodyType<RestockBody>;
}, TContext>;
/**
 * @summary List orders
 */
export declare const getListOrdersUrl: (params?: ListOrdersParams) => string;
export declare const listOrders: (params?: ListOrdersParams, options?: RequestInit) => Promise<Order[]>;
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
export declare const getGetOrderUrl: (id: number) => string;
export declare const getOrder: (id: number, options?: RequestInit) => Promise<OrderDetail>;
export declare const getGetOrderQueryKey: (id: number) => readonly [`/api/orders/${number}`];
export declare const getGetOrderQueryOptions: <TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<void>>(id: number, options?: {
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
export declare function useGetOrder<TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Advance order status (kitchen display)
 */
export declare const getUpdateOrderStatusUrl: (id: number) => string;
export declare const updateOrderStatus: (id: number, updateOrderStatusBody: UpdateOrderStatusBody, options?: RequestInit) => Promise<Order>;
export declare const getUpdateOrderStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<UpdateOrderStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<UpdateOrderStatusBody>;
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
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<UpdateOrderStatusBody>;
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
 * @summary Get active orders (pending + in_progress) for kitchen display
 */
export declare const getGetActiveOrdersUrl: () => string;
export declare const getActiveOrders: (options?: RequestInit) => Promise<OrderDetail[]>;
export declare const getGetActiveOrdersQueryKey: () => readonly ["/api/dashboard/active-orders"];
export declare const getGetActiveOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getActiveOrders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActiveOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getActiveOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetActiveOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getActiveOrders>>>;
export type GetActiveOrdersQueryError = ErrorType<unknown>;
/**
 * @summary Get active orders (pending + in_progress) for kitchen display
 */
export declare function useGetActiveOrders<TData = Awaited<ReturnType<typeof getActiveOrders>>, TError = ErrorType<unknown>>(options?: {
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
 * @summary Update application settings
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
 * @summary Update application settings
 */
export declare const useUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<UpdateSettingsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<UpdateSettingsBody>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map