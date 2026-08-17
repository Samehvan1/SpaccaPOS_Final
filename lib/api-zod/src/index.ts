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

export const CreateIngredientBody = api.CreateIngredientBody.extend({
  openedShelfLifeDays: z.number().nullish(),
});
export type CreateIngredientBody = Infer<typeof CreateIngredientBody>;
export const GetIngredientParams = api.GetIngredientParams;
export type GetIngredientParams = Infer<typeof api.GetIngredientParams>;
export const GetIngredientResponse = api.GetIngredientResponse;
export type GetIngredientResponse = Infer<typeof api.GetIngredientResponse>;

export const UpdateIngredientParams = api.UpdateIngredientParams;
export type UpdateIngredientParams = Infer<typeof api.UpdateIngredientParams>;
export const UpdateIngredientBody = api.UpdateIngredientBody.extend({
  openedShelfLifeDays: z.number().nullish(),
});
export type UpdateIngredientBody = Infer<typeof UpdateIngredientBody>;
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
export const RestockIngredientBody = api.RestockIngredientBody.extend({
  expiryDate: z.string().nullish(),
  batchNumber: z.string().nullish(),
});
export type RestockIngredientBody = Infer<typeof RestockIngredientBody>;
export const RestockIngredientResponse = api.RestockIngredientResponse;
export type RestockIngredientResponse = Infer<
  typeof api.RestockIngredientResponse
>;

// Orders
export const ListOrdersQueryParams = api.ListOrdersQueryParams;
export type ListOrdersQueryParams = Infer<typeof api.ListOrdersQueryParams>;
export const ListOrdersResponseItem = (
  (api.ListOrdersResponseItem as any)._def.left as z.ZodObject<any>
)
  .extend({
    discountCode: z.string().nullish(),
    branchName: z.string().optional(),
    source: z.enum(["pos", "kiosk", "web", "mobile"]).optional(),
    paymentMethod: z.enum([
      "cash",
      "card",
      "wallet",
      "hospitality",
      "split",
      "refund",
      "points",
    ]),
  })
  .and(
    ((api.ListOrdersResponseItem as any)._def.right as z.ZodObject<any>).extend(
      {
        items: z.array(z.any()), // Allow updated item fields like status: 'refunded'
        payments: z
          .array(
            z.object({
              id: z.number(),
              paymentMethod: z.string(),
              amount: z.number(),
              transactionId: z.string().nullish(),
              createdAt: z.string(),
            }),
          )
          .optional(),
      },
    ),
  );
export type ListOrdersResponseItem = Infer<typeof ListOrdersResponseItem>;
export const ListOrdersResponse = z.array(ListOrdersResponseItem);
export type ListOrdersResponse = Infer<typeof ListOrdersResponse>;

export const CreateOrderBody = api.CreateOrderBody.extend({
  branchId: z
    .union([z.number(), z.string()])
    .nullish()
    .transform((v) => (v && !isNaN(Number(v)) ? Number(v) : undefined)),
  paymentMethod: z.enum([
    "cash",
    "card",
    "wallet",
    "hospitality",
    "split",
    "refund",
    "points",
  ]),
  payments: z
    .array(
      z.object({
        paymentMethod: z.string(),
        amount: z.coerce.number(),
        transactionId: z.string().nullish(),
      }),
    )
    .optional(),
  source: z.enum(["pos", "kiosk", "web", "mobile"]).optional(),
  partnerId: z
    .union([z.number(), z.string()])
    .nullish()
    .transform((v) =>
      v && v !== "store" && !isNaN(Number(v)) ? Number(v) : undefined,
    ),
  items: z.array(
    z.object({
      drinkId: z.coerce.number(),
      quantity: z.coerce.number(),
      specialNotes: z.string().nullish(),
      selections: z
        .array(
          z.object({
            ingredientId: z.coerce.number().nullish(),
            optionId: z.coerce.number().nullish(),
            subOptionId: z.coerce.number().nullish(),
            slotId: z.coerce.number().nullish(),
            typeVolumeId: z.coerce.number().nullish(),
            ingredientTypeId: z.coerce.number().nullish(),
          }),
        )
        .optional()
        .default([]),
    }),
  ),
});
export type CreateOrderBody = Infer<typeof CreateOrderBody>;

export const GetOrderParams = api.GetOrderParams;
export type GetOrderParams = Infer<typeof api.GetOrderParams>;
export const GetOrderResponse = (
  (api.GetOrderResponse as any)._def.left as z.ZodObject<any>
)
  .extend({
    discountCode: z.string().nullish(),
    branchName: z.string().optional(),
    source: z.enum(["pos", "kiosk", "web", "mobile"]).optional(),
    paymentMethod: z.enum([
      "cash",
      "card",
      "wallet",
      "hospitality",
      "split",
      "points",
    ]),
    payments: z
      .array(
        z.object({
          id: z.number(),
          paymentMethod: z.string(),
          amount: z.number(),
          transactionId: z.string().nullish(),
          createdAt: z.string(),
        }),
      )
      .optional(),
  })
  .and(
    ((api.GetOrderResponse as any)._def.right as z.ZodObject<any>).extend({
      items: z.array(z.any()), // Override to allow updated item fields
    }),
  );
export type GetOrderResponse = Infer<typeof GetOrderResponse>;

export const UpdateOrderStatusParams = api.UpdateOrderStatusParams;
export type UpdateOrderStatusParams = Infer<typeof api.UpdateOrderStatusParams>;
export const UpdateOrderStatusBody = api.UpdateOrderStatusBody.extend({
  payments: z
    .array(
      z.object({
        paymentMethod: z.enum([
          "cash",
          "card",
          "wallet",
          "hospitality",
          "refund",
        ]),
        amount: z.number(),
        transactionId: z.string().optional(),
      }),
    )
    .optional(),
  paymentMethod: z
    .enum(["cash", "card", "wallet", "hospitality", "split", "refund"])
    .optional(),
  adminPin: z.string().optional(),
});
export type UpdateOrderStatusBody = Infer<typeof UpdateOrderStatusBody>;
export const UpdateOrderStatusResponse = GetOrderResponse;
export type UpdateOrderStatusResponse = Infer<
  typeof api.UpdateOrderStatusResponse
>;

// Stock Movements
export const ListStockMovementsQueryParams =
  api.ListStockMovementsQueryParams.extend({
    movementType: z.string().optional(),
  });
export type ListStockMovementsQueryParams = Infer<
  typeof ListStockMovementsQueryParams
>;
export const ListStockMovementsResponseItem =
  api.ListStockMovementsResponseItem.extend({
    branchId: z.number().nullish(),
    movementType: z.string(),
  });
export type ListStockMovementsResponseItem = Infer<
  typeof ListStockMovementsResponseItem
>;
export const ListStockMovementsResponse = z.array(
  ListStockMovementsResponseItem,
);
export type ListStockMovementsResponse = Infer<
  typeof ListStockMovementsResponse
>;

export const CreateStockAdjustmentBody = api.CreateStockAdjustmentBody.extend({
  expiryDate: z.string().nullish(),
  batchNumber: z.string().nullish(),
});
export type CreateStockAdjustmentBody = Infer<typeof CreateStockAdjustmentBody>;

// Dashboard
export const GetDashboardSummaryResponse = api.GetDashboardSummaryResponse;
export type GetDashboardSummaryResponse = Infer<
  typeof api.GetDashboardSummaryResponse
>;
export const GetActiveOrdersResponseItem = api.GetActiveOrdersResponseItem.and(
  z.object({
    items: z.array(z.any()), // Allow extra fields in items like kitchenStationId
    discountCode: z.string().nullish(),
  }),
);
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
export const Discount = api.ListDiscountsResponseItem.extend({
  tagIds: z.array(z.number()).optional(),
  isFirstOrder: z.boolean().optional(),
});
export type Discount = Infer<typeof Discount>;

export const CreateDiscountBody = api.CreateDiscountBody.extend({
  tagIds: z.array(z.number()).optional(),
  isFirstOrder: z.boolean().optional(),
});
export type CreateDiscountBody = Infer<typeof CreateDiscountBody>;

export const UpdateDiscountBody = api.UpdateDiscountBody.extend({
  tagIds: z.array(z.number()).optional(),
  isFirstOrder: z.boolean().optional(),
});
export type UpdateDiscountBody = Infer<typeof UpdateDiscountBody>;

// Users
export const ListUsersResponseItem = api.ListUsersResponseItem.extend({
  pin: z.string().nullish(),
});
export type ListUsersResponseItem = Infer<typeof ListUsersResponseItem>;
export const ListUsersResponse = z.array(ListUsersResponseItem);
export type ListUsersResponse = Infer<typeof ListUsersResponse>;

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
  pin: z.string().nullish(),
  branchId: z.number().nullable().optional(),
  permissions: z.array(z.string()).optional(),
}); // This has all fields
export type UserDetail = Infer<typeof UserDetail>;

// Admin
export const ListActivityLogsQueryParams =
  api.ListActivityLogsQueryParams.extend({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    entityType: z.string().optional(),
    userName: z.string().optional(),
  });
export type ListActivityLogsQueryParams = Infer<
  typeof ListActivityLogsQueryParams
>;

export const ActivityLog = api.ListActivityLogsResponseItem.extend({
  userName: z.string().nullish(),
});
export type ActivityLog = Infer<typeof ActivityLog>;

export const ListActivityLogsResponse = z.object({
  data: z.array(ActivityLog),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});
export type ListActivityLogsResponse = Infer<typeof ListActivityLogsResponse>;

export const Permission = api.ListPermissionsResponseItem;
export type Permission = Infer<typeof api.ListPermissionsResponseItem>;

export { ALL_PERMISSIONS, type PermissionKey } from "./permissions";

// Offers
export const Offer = api.ListOffersResponseItem;
export type Offer = Infer<typeof api.ListOffersResponseItem>;

export const CreateOfferBody = api.CreateOfferBody;
export type CreateOfferBody = Infer<typeof api.CreateOfferBody>;

export const UpdateOfferBody = api.UpdateOfferBody;
export type UpdateOfferBody = Infer<typeof api.UpdateOfferBody>;

// Product Drink Discounts
export const ProductDrinkDiscount = z.object({
  id: z.number(),
  drinkId: z.number(),
  branchId: z.number().nullable(),
  partnerId: z.number().nullable(),
  discountType: z.enum(["percentage", "fixed_amount", "fixed_price"]),
  discountValue: z.number(),
  isActive: z.boolean(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type ProductDrinkDiscount = Infer<typeof ProductDrinkDiscount>;

export const CreateProductDrinkDiscountBody = z.object({
  drinkId: z.number(),
  branchId: z.number().nullable().optional(),
  partnerId: z.number().nullable().optional(),
  discountType: z.enum(["percentage", "fixed_amount", "fixed_price"]),
  discountValue: z.number().positive(),
  isActive: z.boolean().optional().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});
export type CreateProductDrinkDiscountBody = Infer<typeof CreateProductDrinkDiscountBody>;

export const UpdateProductDrinkDiscountBody = CreateProductDrinkDiscountBody.partial();
export type UpdateProductDrinkDiscountBody = Infer<typeof UpdateProductDrinkDiscountBody>;

