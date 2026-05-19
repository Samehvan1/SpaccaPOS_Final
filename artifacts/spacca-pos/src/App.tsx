import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { SettingsProvider } from "@/hooks/use-settings";
import { MainLayout } from "@/components/layout/main-layout";
import { useEffect } from "react";
import { PWAUpdater } from "@/components/pwa-updater";
import { CustomerAuthProvider } from "@/hooks/use-customer-auth";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { appRoutes } from "./routes";

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

function getDefaultRoute(role: string): string {
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
}: { 
  component: React.ComponentType; 
  permission?: string;
}) {
  const { user, isLoading, hasPermission } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!user) {
    return <Redirect to={`/login?from=${encodeURIComponent(location)}`} />;
  }

  // If a specific permission is required, check it
  if (permission && !hasPermission(permission)) {
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
      {/* Role-based conditional redirection for /login */}
      <Route path="/login">
        {() => {
          if (user) {
            const params = new URLSearchParams(window.location.search);
            if (params.has("from")) {
              return <Redirect to={params.get("from") as any} />;
            }
            return <Redirect to={getDefaultRoute(user.role)} />;
          }
          return <Login />;
        }}
      </Route>

      {/* Default route redirecting based on session / role */}
      <Route path="/">
        {() => {
          if (!user) return <Redirect to="/login" />;
          return <Redirect to={getDefaultRoute(user.role)} />;
        }}
      </Route>

      {/* Dynamically register protected/public routes from registry */}
      {appRoutes.map((route) => {
        const useLayout = route.layout !== false;

        const Content = () => {
          if (route.permission === "public") {
            return <route.component />;
          }
          return <ProtectedRoute component={route.component} permission={route.permission} />;
        };

        return (
          <Route key={route.path} path={route.path}>
            {useLayout ? (
              <MainLayout>
                <Content />
              </MainLayout>
            ) : (
              <Content />
            )}
          </Route>
        );
      })}

      {/* Fallback 404 Route */}
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
                  <PWAUpdater />
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
