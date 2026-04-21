import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { SettingsProvider } from "@/hooks/use-settings";
import { MainLayout } from "@/components/layout/main-layout";

import Login from "@/pages/login";
import PosTerminal from "@/pages/pos";
import KitchenDisplay from "@/pages/kitchen";
import AdminHub from "@/pages/admin";
import FinanceDashboard from "@/pages/admin/finance";
import DrinksAdmin from "@/pages/admin/drinks";
import IngredientsAdmin from "@/pages/admin/ingredients";
import StockAdmin from "@/pages/admin/stock";
import DrinkRecipe from "@/pages/admin/drink-recipe";
import ReportsPage from "@/pages/admin/reports";
import CategoriesAdmin from "@/pages/admin/categories";
import KitchenStationsAdmin from "@/pages/admin/kitchen-stations";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Redirect to={`/login?from=${encodeURIComponent(location)}`} />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Redirect to="/pos" />;
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
          const params = new URLSearchParams(window.location.search);
          const from = params.get("from") || "/pos";
          return user ? <Redirect to={from as any} /> : <Login />;
        }}
      </Route>

      <Route path="/">
        <Redirect to={user ? "/pos" : "/login"} />
      </Route>

      <Route path="/pos">
        <MainLayout>
          <ProtectedRoute component={PosTerminal} />
        </MainLayout>
      </Route>

      <Route path="/kitchen">
        <MainLayout>
          <ProtectedRoute component={KitchenDisplay} />
        </MainLayout>
      </Route>

      <Route path="/admin">
        <MainLayout>
          <ProtectedRoute component={AdminHub} adminOnly={true} />
        </MainLayout>
      </Route>

      <Route path="/admin/finance">
        <MainLayout>
          <ProtectedRoute component={FinanceDashboard} adminOnly={true} />
        </MainLayout>
      </Route>

      <Route path="/admin/drinks">
        <MainLayout>
          <ProtectedRoute component={DrinksAdmin} adminOnly={true} />
        </MainLayout>
      </Route>

      <Route path="/admin/drinks/:id/recipe">
        <MainLayout>
          <ProtectedRoute component={DrinkRecipe} adminOnly={true} />
        </MainLayout>
      </Route>

      <Route path="/admin/categories">
        <MainLayout>
          <ProtectedRoute component={CategoriesAdmin} adminOnly={true} />
        </MainLayout>
      </Route>
      <Route path="/admin/kitchen-stations">
        <MainLayout>
          <ProtectedRoute component={KitchenStationsAdmin} adminOnly={true} />
        </MainLayout>
      </Route>

      <Route path="/admin/ingredients">
        <MainLayout>
          <ProtectedRoute component={IngredientsAdmin} adminOnly={true} />
        </MainLayout>
      </Route>

      <Route path="/admin/stock">
        <MainLayout>
          <ProtectedRoute component={StockAdmin} adminOnly={true} />
        </MainLayout>
      </Route>

      <Route path="/admin/reports">
        <MainLayout>
          <ProtectedRoute component={ReportsPage} adminOnly={true} />
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
            <SettingsProvider>
              <TooltipProvider>
                <AppRoutes />
                <Toaster />
              </TooltipProvider>
            </SettingsProvider>
          </AuthProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
