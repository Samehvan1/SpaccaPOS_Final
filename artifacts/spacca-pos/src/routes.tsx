
import Login from "@/pages/login";
import PosTerminal from "@/pages/pos";
import KitchenDisplay from "@/pages/kitchen";
import CashierPage from "@/pages/cashier";
import PickupPage from "@/pages/pickup";
import AdminHub from "@/pages/admin";
import FinanceDashboard from "@/pages/admin/finance";
import DrinksAdmin from "@/pages/admin/drinks";
import IngredientsAdmin from "@/pages/admin/ingredients";
import StockAdmin from "@/pages/admin/stock";
import ReceiveDeliveryPage from "@/pages/admin/stock/receive-delivery";
import DrinkRecipe from "@/pages/admin/drink-recipe";
import ReportsPage from "@/pages/admin/reports";
import CategoriesAdmin from "@/pages/admin/categories";
import KitchenStationsAdmin from "@/pages/admin/kitchen-stations";
import AdminUsers from "@/pages/admin/users";
import BranchesAdmin from "@/pages/admin/branches";
import DiscountsAdmin from "@/pages/admin/discounts";
import ActivityLogs from "@/pages/admin/activity-logs";
import PermissionsAdmin from "@/pages/admin/permissions";
import CustomerAuth from "@/pages/customer-auth";
import CustomerProfile from "@/pages/customer-profile";
import CashierPerformancePage from "@/pages/admin/cashier-performance";
import KioskPage from "@/pages/kiosk";
import SystemSettingsAdmin from "@/pages/admin/settings";
import StockControlPage from "@/pages/stock-control";
import StockAuditReviewPage from "@/pages/admin/stock-audit-review";
import StockMovementReport from "@/pages/admin/finance/stock-movement";
import SalesAnalysisReport from "@/pages/admin/finance/sales";
import InventoryUsageReport from "@/pages/admin/finance/usage";
import PLReport from "@/pages/admin/finance/pl";
import CashSpotCheckPage from "@/pages/admin/operations/cash-spot-check";
import ShiftReportPage from "@/pages/admin/operations/shift-report";
import StockQuantitiesPage from "@/pages/admin/operations/stock-quantities";
import CustomizationsAnalysisReport from "@/pages/admin/operations/customizations";
import CalibrationPage from "@/pages/admin/operations/calibration";
import WastagePage from "@/pages/admin/operations/wastage";
import OperationalDeductionsReport from "@/pages/admin/operations/deductions-report";
import AllOrdersReport from "@/pages/admin/all-orders-report";
import PurchasesAdmin from "@/pages/admin/purchases";
import SuppliersAdmin from "@/pages/admin/purchases/suppliers";

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  permission: string | "public";
  layout?: boolean; // defaults to true if omitted
}

export const appRoutes: RouteConfig[] = [
  // Public routes
  { path: "/customer/auth", component: CustomerAuth, permission: "public", layout: false },
  { path: "/customer/profile", component: CustomerProfile, permission: "public", layout: false },
  { path: "/kiosk", component: KioskPage, permission: "public", layout: false },

  // Staff POS & Kitchen
  { path: "/pos", component: PosTerminal, permission: "public" },
  { path: "/kitchen", component: KitchenDisplay, permission: "kitchen:view" },
  { path: "/cashier", component: CashierPage, permission: "cashier:view", layout: false },
  { path: "/pickup", component: PickupPage, permission: "orders:pickup" },

  // Admin Hub
  { path: "/admin", component: AdminHub, permission: "admin:view" },

  // Catalog
  { path: "/admin/drinks", component: DrinksAdmin, permission: "catalog:view" },
  { path: "/admin/drinks/:id/recipe", component: DrinkRecipe, permission: "catalog:manage" },
  { path: "/admin/categories", component: CategoriesAdmin, permission: "catalog:view" },

  // Inventory & Stock
  { path: "/admin/ingredients", component: IngredientsAdmin, permission: "inventory:view" },
  { path: "/admin/stock", component: StockAdmin, permission: "inventory:view" },
  { path: "/admin/stock/receive-delivery", component: ReceiveDeliveryPage, permission: "inventory:view" },
  { path: "/admin/stock-audits", component: StockAuditReviewPage, permission: "inventory:manage" },
  { path: "/stock-control", component: StockControlPage, permission: "inventory:view" },

  // Purchases
  { path: "/admin/purchases", component: PurchasesAdmin, permission: "purchases:view" },
  { path: "/admin/purchases/suppliers", component: SuppliersAdmin, permission: "purchases:view" },

  // Finance & Reports
  { path: "/admin/finance", component: FinanceDashboard, permission: "reports:view" },
  { path: "/admin/finance/stock-movement", component: StockMovementReport, permission: "reports:view" },
  { path: "/admin/finance/sales", component: SalesAnalysisReport, permission: "reports:view" },
  { path: "/admin/finance/usage", component: InventoryUsageReport, permission: "reports:view" },
  { path: "/admin/finance/pl", component: PLReport, permission: "reports:view" },
  { path: "/admin/finance/all-orders", component: AllOrdersReport, permission: "reports:view" },
  { path: "/admin/reports", component: ReportsPage, permission: "reports:view" },
  { path: "/admin/cashier-performance", component: CashierPerformancePage, permission: "reports:view" },

  // Operations
  { path: "/admin/operations/cash-spot-check", component: CashSpotCheckPage, permission: "admin:view" },
  { path: "/admin/operations/shift-report", component: ShiftReportPage, permission: "reports:view" },
  { path: "/admin/operations/stock-quantities", component: StockQuantitiesPage, permission: "inventory:view" },
  { path: "/admin/operations/customizations", component: CustomizationsAnalysisReport, permission: "reports:view" },
  { path: "/admin/operations/calibration", component: CalibrationPage, permission: "admin:view" },
  { path: "/admin/operations/wastage", component: WastagePage, permission: "admin:view" },
  { path: "/admin/operations/deductions-report", component: OperationalDeductionsReport, permission: "admin:view" },
  { path: "/admin/operations/all-orders", component: AllOrdersReport, permission: "reports:view" },

  // Settings & Users
  { path: "/admin/kitchen-stations", component: KitchenStationsAdmin, permission: "admin:view" },
  { path: "/admin/discounts", component: DiscountsAdmin, permission: "discounts:view" },
  { path: "/admin/users", component: AdminUsers, permission: "users:view" },
  { path: "/admin/branches", component: BranchesAdmin, permission: "branches:manage" },
  { path: "/admin/activity-logs", component: ActivityLogs, permission: "admin:view" },
  { path: "/admin/permissions", component: PermissionsAdmin, permission: "roles:manage" },
  { path: "/admin/settings", component: SystemSettingsAdmin, permission: "settings:manage" },
];
