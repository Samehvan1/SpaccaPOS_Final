import { z } from "zod";
import * as api from "./generated/api";
import * as types from "./generated/types";

// Helper for inference
type Infer<T extends z.ZodType<any, any, any>> = z.infer<T>;

// Health
export const HealthCheckResponse = api.HealthCheckResponse;
export type HealthCheckResponse = Infer<typeof api.HealthCheckResponse>;

// Auth
export const BaristaLoginBody = api.BaristaLoginBody;
export type BaristaLoginBody = Infer<typeof api.BaristaLoginBody>;
export const BaristaLoginResponse = api.BaristaLoginResponse.extend({
  user: api.BaristaLoginResponse.shape.user.extend({
    role: z.string(),
    permissions: z.array(z.string()),
  }),
});
export type BaristaLoginResponse = Infer<typeof BaristaLoginResponse>;
export const GetMeResponse = api.GetMeResponse.extend({
  role: z.string(),
  permissions: z.array(z.string()),
});
export type GetMeResponse = Infer<typeof GetMeResponse>;

// Drinks
export const ListDrinksQueryParams = api.ListDrinksQueryParams;
export type ListDrinksQueryParams = Infer<typeof api.ListDrinksQueryParams>;
export const ListDrinksResponseItem = api.ListDrinksResponseItem;
export type ListDrinksResponseItem = Infer<typeof api.ListDrinksResponseItem>;
export const ListDrinksResponse = api.ListDrinksResponse;
export type ListDrinksResponse = Infer<typeof api.ListDrinksResponse>;

export const CreateDrinkBody = api.CreateDrinkBody.extend({
  kitchenStationId: z.number().nullish(),
});
export type CreateDrinkBody = Infer<typeof CreateDrinkBody>;
export const GetDrinkParams = api.GetDrinkParams;
export type GetDrinkParams = Infer<typeof api.GetDrinkParams>;
export const GetDrinkResponse = api.GetDrinkResponse;
export type GetDrinkResponse = Infer<typeof api.GetDrinkResponse>;

export const UpdateDrinkParams = api.UpdateDrinkParams;
export type UpdateDrinkParams = Infer<typeof api.UpdateDrinkParams>;
export const UpdateDrinkBody = api.UpdateDrinkBody.extend({
  kitchenStationId: z.number().nullish(),
});
export type UpdateDrinkBody = Infer<typeof UpdateDrinkBody>;
export const UpdateDrinkResponse = api.UpdateDrinkResponse;
export type UpdateDrinkResponse = Infer<typeof api.UpdateDrinkResponse>;

export const DeleteDrinkParams = api.DeleteDrinkParams;
export type DeleteDrinkParams = Infer<typeof api.DeleteDrinkParams>;

export const CalculateDrinkPriceParams = api.CalculateDrinkPriceParams;
export type CalculateDrinkPriceParams = Infer<
  typeof api.CalculateDrinkPriceParams
>;
export const CalculateDrinkPriceBody = api.CalculateDrinkPriceBody;
export type CalculateDrinkPriceBody = Infer<typeof api.CalculateDrinkPriceBody>;
export const CalculateDrinkPriceResponse = api.CalculateDrinkPriceResponse;
export type CalculateDrinkPriceResponse = Infer<
  typeof api.CalculateDrinkPriceResponse
>;

// Ingredients
export const ListIngredientsQueryParams = api.ListIngredientsQueryParams;
export type ListIngredientsQueryParams = Infer<
  typeof api.ListIngredientsQueryParams
>;
export const ListIngredientsResponseItem = api.ListIngredientsResponseItem;
export type ListIngredientsResponseItem = Infer<
  typeof api.ListIngredientsResponseItem
>;
export const ListIngredientsResponse = api.ListIngredientsResponse;
export type ListIngredientsResponse = Infer<typeof api.ListIngredientsResponse>;

export const CreateIngredientBody = api.CreateIngredientBody;
export type CreateIngredientBody = Infer<typeof api.CreateIngredientBody>;
export const GetIngredientParams = api.GetIngredientParams;
export type GetIngredientParams = Infer<typeof api.GetIngredientParams>;
export const GetIngredientResponse = api.GetIngredientResponse;
export type GetIngredientResponse = Infer<typeof api.GetIngredientResponse>;

export const UpdateIngredientParams = api.UpdateIngredientParams;
export type UpdateIngredientParams = Infer<typeof api.UpdateIngredientParams>;
export const UpdateIngredientBody = api.UpdateIngredientBody;
export type UpdateIngredientBody = Infer<typeof api.UpdateIngredientBody>;
export const UpdateIngredientResponse = api.UpdateIngredientResponse;
export type UpdateIngredientResponse = Infer<
  typeof api.UpdateIngredientResponse
>;

export const CreateIngredientOptionParams = api.CreateIngredientOptionParams;
export type CreateIngredientOptionParams = Infer<
  typeof api.CreateIngredientOptionParams
>;
export const CreateIngredientOptionBody = api.CreateIngredientOptionBody;
export type CreateIngredientOptionBody = Infer<
  typeof api.CreateIngredientOptionBody
>;
export const UpdateIngredientOptionParams = api.UpdateIngredientOptionParams;
export type UpdateIngredientOptionParams = Infer<
  typeof api.UpdateIngredientOptionParams
>;
export const UpdateIngredientOptionBody = api.UpdateIngredientOptionBody;
export type UpdateIngredientOptionBody = Infer<
  typeof api.UpdateIngredientOptionBody
>;
export const DeleteIngredientOptionParams = api.DeleteIngredientOptionParams;
export type DeleteIngredientOptionParams = Infer<
  typeof api.DeleteIngredientOptionParams
>;

export const RestockIngredientParams = api.RestockIngredientParams;
export type RestockIngredientParams = Infer<typeof api.RestockIngredientParams>;
export const RestockIngredientBody = api.RestockIngredientBody;
export type RestockIngredientBody = Infer<typeof api.RestockIngredientBody>;
export const RestockIngredientResponse = api.RestockIngredientResponse;
export type RestockIngredientResponse = Infer<
  typeof api.RestockIngredientResponse
>;

// Orders
export const ListOrdersQueryParams = api.ListOrdersQueryParams;
export type ListOrdersQueryParams = Infer<typeof api.ListOrdersQueryParams>;
export const ListOrdersResponseItem = api.ListOrdersResponseItem;
export type ListOrdersResponseItem = Infer<typeof api.ListOrdersResponseItem>;
export const ListOrdersResponse = api.ListOrdersResponse;
export type ListOrdersResponse = Infer<typeof api.ListOrdersResponse>;

export const CreateOrderBody = api.CreateOrderBody;
export type CreateOrderBody = Infer<typeof api.CreateOrderBody>;

export const GetOrderParams = api.GetOrderParams;
export type GetOrderParams = Infer<typeof api.GetOrderParams>;
export const GetOrderResponse = api.GetOrderResponse;
export type GetOrderResponse = Infer<typeof api.GetOrderResponse>;

export const UpdateOrderStatusParams = api.UpdateOrderStatusParams;
export type UpdateOrderStatusParams = Infer<typeof api.UpdateOrderStatusParams>;
export const UpdateOrderStatusBody = api.UpdateOrderStatusBody;
export type UpdateOrderStatusBody = Infer<typeof api.UpdateOrderStatusBody>;
export const UpdateOrderStatusResponse = api.UpdateOrderStatusResponse;
export type UpdateOrderStatusResponse = Infer<
  typeof api.UpdateOrderStatusResponse
>;

// Stock Movements
export const ListStockMovementsQueryParams = api.ListStockMovementsQueryParams;
export type ListStockMovementsQueryParams = Infer<
  typeof api.ListStockMovementsQueryParams
>;
export const ListStockMovementsResponseItem =
  api.ListStockMovementsResponseItem;
export type ListStockMovementsResponseItem = Infer<
  typeof api.ListStockMovementsResponseItem
>;
export const ListStockMovementsResponse = api.ListStockMovementsResponse;
export type ListStockMovementsResponse = Infer<
  typeof api.ListStockMovementsResponse
>;

export const CreateStockAdjustmentBody = api.CreateStockAdjustmentBody;
export type CreateStockAdjustmentBody = Infer<
  typeof api.CreateStockAdjustmentBody
>;

// Dashboard
export const GetDashboardSummaryResponse = api.GetDashboardSummaryResponse;
export type GetDashboardSummaryResponse = Infer<
  typeof api.GetDashboardSummaryResponse
>;
export const GetActiveOrdersResponseItem = api.GetActiveOrdersResponseItem.and(z.object({
  items: z.array(z.any()) // Allow extra fields in items like kitchenStationId
}));
export type GetActiveOrdersResponseItem = Infer<
  typeof GetActiveOrdersResponseItem
>;
export const GetActiveOrdersResponse = z.array(GetActiveOrdersResponseItem);
export type GetActiveOrdersResponse = Infer<typeof GetActiveOrdersResponse>;

export const GetLowStockIngredientsResponseItem =
  api.GetLowStockIngredientsResponseItem;
export type GetLowStockIngredientsResponseItem = Infer<
  typeof api.GetLowStockIngredientsResponseItem
>;
export const GetLowStockIngredientsResponse =
  api.GetLowStockIngredientsResponse;
export type GetLowStockIngredientsResponse = Infer<
  typeof api.GetLowStockIngredientsResponse
>;

export const GetSalesByCategoryQueryParams = api.GetSalesByCategoryQueryParams;
export type GetSalesByCategoryQueryParams = Infer<
  typeof api.GetSalesByCategoryQueryParams
>;
export const GetSalesByCategoryResponseItem =
  api.GetSalesByCategoryResponseItem;
export type GetSalesByCategoryResponseItem = Infer<
  typeof api.GetSalesByCategoryResponseItem
>;
export const GetSalesByCategoryResponse = api.GetSalesByCategoryResponse;
export type GetSalesByCategoryResponse = Infer<
  typeof api.GetSalesByCategoryResponse
>;

export const GetTopDrinksQueryParams = api.GetTopDrinksQueryParams;
export type GetTopDrinksQueryParams = Infer<typeof api.GetTopDrinksQueryParams>;
export const GetTopDrinksResponseItem = api.GetTopDrinksResponseItem;
export type GetTopDrinksResponseItem = Infer<
  typeof api.GetTopDrinksResponseItem
>;
export const GetTopDrinksResponse = api.GetTopDrinksResponse;
export type GetTopDrinksResponse = Infer<typeof api.GetTopDrinksResponse>;

// Discounts
export const Discount = api.ListDiscountsResponseItem;
export type Discount = Infer<typeof api.ListDiscountsResponseItem>;
export const CreateDiscountBody = api.CreateDiscountBody;
export type CreateDiscountBody = Infer<typeof api.CreateDiscountBody>;
export const UpdateDiscountBody = api.UpdateDiscountBody;
export type UpdateDiscountBody = Infer<typeof api.UpdateDiscountBody>;

// Users
export const CreateUserBody = api.CreateUserBody.extend({
  role: z.string(),
  branchId: z.number().nullable().optional(),
});
export type CreateUserBody = Infer<typeof CreateUserBody>;

export const UpdateUserBody = api.UpdateUserBody.extend({
  role: z.string().optional(),
  branchId: z.number().nullable().optional(),
});
export type UpdateUserBody = Infer<typeof UpdateUserBody>;

export const UserDetail = api.UpdateUserResponse.extend({
  role: z.string(),
  branchId: z.number().nullable().optional(),
  permissions: z.array(z.string()).optional(),
}); // This has all fields
export type UserDetail = Infer<typeof UserDetail>;

// Admin
export const ActivityLog = api.ListActivityLogsResponseItem;
export type ActivityLog = Infer<typeof api.ListActivityLogsResponseItem>;
export const Permission = api.ListPermissionsResponseItem;
export type Permission = Infer<typeof api.ListPermissionsResponseItem>;
