import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { SettingsProvider } from "@/hooks/use-settings";
import { MainLayout } from "@/components/layout/main-layout";
import { useEffect } from "react";

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
import DrinkRecipe from "@/pages/admin/drink-recipe";
import ReportsPage from "@/pages/admin/reports";
import CategoriesAdmin from "@/pages/admin/categories";
import KitchenStationsAdmin from "@/pages/admin/kitchen-stations";
import AdminUsers from "@/pages/admin/users";
import BranchesAdmin from "@/pages/admin/branches";
import DiscountsAdmin from "@/pages/admin/discounts";
import ActivityLogs from "@/pages/admin/activity-logs";
import PermissionsAdmin from "@/pages/admin/permissions";
import NotFound from "@/pages/not-found";
import CustomerAuth from "@/pages/customer-auth";
import CustomerProfile from "@/pages/customer-profile";
import { CustomerAuthProvider } from "@/hooks/use-customer-auth";
import CashierPerformancePage from "@/pages/admin/cashier-performance";
import KioskPage from "./pages/kiosk";
import SystemSettingsAdmin from "@/pages/admin/settings";
import StockControlPage from "./pages/stock-control";
import StockAuditReviewPage from "./pages/admin/stock-audit-review";
import StockMovementReport from "@/pages/admin/finance/stock-movement";
import SalesAnalysisReport from "@/pages/admin/finance/sales";
import InventoryUsageReport from "@/pages/admin/finance/usage";
import PLReport from "@/pages/admin/finance/pl";

// PWA Helper to update title for "Add to Home Screen"
function PWAContextHandler() {
  const [location] = useLocation();
  
  useEffect(() => {
    let title = "Spacca POS";
    if (location === "/cashier") title = "Spacca Cashier";
    else if (location === "/pickup") title = "Spacca Pickup";
    else if (location === "/kitchen") title = "Spacca Kitchen";
    
    document.title = title;
    
    // Update Apple-specific meta tag for "Add to Home Screen" name
    const metaTag = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (metaTag) {
      metaTag.setAttribute("content", title);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "apple-mobile-web-app-title";
      newMeta.content = title;
      document.head.appendChild(newMeta);
    }
  }, [location]);

  return null;
}

const queryClient = new QueryClient();

function getDefaultRoute(role: string): any {
  switch (role) {
    case "admin": return "/admin";
    case "barista": return "/kitchen";
    case "cashier": return "/cashier";
    case "pickup": return "/pickup";
    case "frontdesk": return "/pos";
    case "stockcontrol": return "/stock-control";
    default: return "/pos";
  }
}

function ProtectedRoute({ 
  component: Component, 
  permission,
  allowedRoles // Keep for backward compat if needed, but prioritize permission
}: { 
  component: React.ComponentType, 
  permission?: string,
  allowedRoles?: string[]
}) {
  const { user, isLoading, hasPermission } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Redirect to={`/login?from=${encodeURIComponent(location)}`} />;
  }

  // If a specific permission is required, check it
  if (permission && !hasPermission(permission)) {
    return <Redirect to={getDefaultRoute(user.role)} />;
  }

  // Fallback for allowedRoles if permission is not provided
  if (!permission && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to={getDefaultRoute(user.role)} />;
  }

  return <Component />;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-background">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/login">
        {() => {
          if (user) {
            const params = new URLSearchParams(window.location.search);
            if (params.has("from")) {
              return <Redirect to={params.get("from") as any} />;
            }
            // Role-based default redirection
            switch (user.role as string) {
              case "barista": return <Redirect to="/kitchen" />;
              case "cashier": return <Redirect to="/cashier" />;
              case "pickup": return <Redirect to="/pickup" />;
              case "frontdesk": return <Redirect to="/pos" />;
              case "stockcontrol": return <Redirect to="/stock-control" />;
              case "admin": return <Redirect to="/admin" />;
              default: return <Redirect to="/pos" />;
            }
          }
          return <Login />;
        }}
      </Route>

      <Route path="/">
        {() => {
          if (!user) return <Redirect to="/pos" />;
          switch (user.role as string) {
            case "barista": return <Redirect to="/kitchen" />;
            case "cashier": return <Redirect to="/cashier" />;
            case "pickup": return <Redirect to="/pickup" />;
            case "frontdesk": return <Redirect to="/pos" />;
            case "stockcontrol": return <Redirect to="/stock-control" />;
            case "admin": return <Redirect to="/admin" />;
            default: return <Redirect to="/pos" />;
          }
        }}
      </Route>

      <Route path="/pos">
        <MainLayout>
          <PosTerminal />
        </MainLayout>
      </Route>

      <Route path="/kitchen">
        <MainLayout>
          <ProtectedRoute 
            component={KitchenDisplay} 
            permission="kitchen:view" 
          />
        </MainLayout>
      </Route>
      
      <Route path="/cashier">
        <CashierPage />
      </Route>

      <Route path="/pickup">
        <MainLayout>
          <ProtectedRoute 
            component={PickupPage} 
            permission="orders:pickup" 
          />
        </MainLayout>
      </Route>

      <Route path="/admin">
        <MainLayout>
          <ProtectedRoute component={AdminHub} permission="admin:view" />
        </MainLayout>
      </Route>

      <Route path="/admin/finance">
        <MainLayout>
          <ProtectedRoute component={FinanceDashboard} permission="reports:view" />
        </MainLayout>
      </Route>
      <Route path="/admin/finance/stock-movement">
        <MainLayout>
          <ProtectedRoute component={StockMovementReport} permission="reports:view" />
        </MainLayout>
      </Route>
      <Route path="/admin/finance/sales">
        <MainLayout>
          <ProtectedRoute component={SalesAnalysisReport} permission="reports:view" />
        </MainLayout>
      </Route>
      <Route path="/admin/finance/usage">
        <MainLayout>
          <ProtectedRoute component={InventoryUsageReport} permission="reports:view" />
        </MainLayout>
      </Route>
      <Route path="/admin/finance/pl">
        <MainLayout>
          <ProtectedRoute component={PLReport} permission="reports:view" />
        </MainLayout>
      </Route>

      <Route path="/admin/drinks">
        <MainLayout>
          <ProtectedRoute component={DrinksAdmin} permission="catalog:view" />
        </MainLayout>
      </Route>

      <Route path="/admin/drinks/:id/recipe">
        <MainLayout>
          <ProtectedRoute component={DrinkRecipe} permission="catalog:manage" />
        </MainLayout>
      </Route>

      <Route path="/admin/categories">
        <MainLayout>
          <ProtectedRoute component={CategoriesAdmin} permission="catalog:view" />
        </MainLayout>
      </Route>
      <Route path="/admin/kitchen-stations">
        <MainLayout>
          <ProtectedRoute component={KitchenStationsAdmin} permission="admin:view" />
        </MainLayout>
      </Route>

      <Route path="/admin/ingredients">
        <MainLayout>
          <ProtectedRoute component={IngredientsAdmin} permission="inventory:view" />
        </MainLayout>
      </Route>

      <Route path="/admin/stock">
        <MainLayout>
          <ProtectedRoute component={StockAdmin} permission="inventory:view" />
        </MainLayout>
      </Route>
      <Route path="/admin/stock-audits">
        <MainLayout>
          <ProtectedRoute component={StockAuditReviewPage} permission="inventory:manage" />
        </MainLayout>
      </Route>

      <Route path="/admin/reports">
        <MainLayout>
          <ProtectedRoute component={ReportsPage} permission="reports:view" />
        </MainLayout>
      </Route>
      <Route path="/admin/discounts">
        <MainLayout>
          <ProtectedRoute component={DiscountsAdmin} permission="discounts:view" />
        </MainLayout>
      </Route>
      <Route path="/admin/users">
        <MainLayout>
          <ProtectedRoute component={AdminUsers} permission="users:view" />
        </MainLayout>
      </Route>

      <Route path="/admin/cashier-performance">
        <MainLayout>
          <ProtectedRoute component={CashierPerformancePage} permission="reports:view" />
        </MainLayout>
      </Route>

      <Route path="/admin/branches">
        <MainLayout>
          <ProtectedRoute component={BranchesAdmin} permission="branches:manage" />
        </MainLayout>
      </Route>

      <Route path="/admin/activity-logs">
        <MainLayout>
          <ProtectedRoute component={ActivityLogs} permission="admin:view" />
        </MainLayout>
      </Route>

      <Route path="/admin/permissions">
        <MainLayout>
          <ProtectedRoute component={PermissionsAdmin} permission="roles:manage" />
        </MainLayout>
      </Route>
      <Route path="/admin/settings">
        <MainLayout>
          <ProtectedRoute component={SystemSettingsAdmin} permission="settings:manage" />
        </MainLayout>
      </Route>

      <Route path="/customer/auth">
        <CustomerAuth />
      </Route>

      <Route path="/customer/profile">
        <CustomerProfile />
      </Route>

      <Route path="/kiosk">
        <KioskPage />
      </Route>
      <Route path="/stock-control">
        <MainLayout>
          <ProtectedRoute component={StockControlPage} permission="inventory:view" />
        </MainLayout>
      </Route>

      <Route>
        <MainLayout>
          <NotFound />
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <CustomerAuthProvider>
              <SettingsProvider>
                <TooltipProvider>
                  <PWAContextHandler />
                  <AppRoutes />
                  <Toaster />
                </TooltipProvider>
              </SettingsProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
