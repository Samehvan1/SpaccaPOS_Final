import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSettings } from "@/hooks/use-settings";
import { useOrderEvents } from "@/hooks/use-order-events";
import { Coffee, ChefHat, LayoutDashboard, LogOut, Sun, Moon, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { autoPrintCustomer, setAutoPrintCustomer, autoPrintAgent, setAutoPrintAgent } = useSettings();
  useOrderEvents(!!user);
  const [location, setLocation] = useLocation();

  if (!user) return <>{children}</>;

  // ─── Front-desk kiosk layout ───────────────────────────────────────────────
  if (user?.role === "frontdesk") {
    return (
      <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
        {/* Slim top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card shrink-0 shadow-sm">
          <span className="font-bold text-xl tracking-tighter text-primary select-none">
            SPACCA
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <><Sun className="h-4 w-4" /><span className="hidden sm:inline">Light</span></>
              ) : (
                <><Moon className="h-4 w-4" /><span className="hidden sm:inline">Dark</span></>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => { logout(); setLocation("/login"); }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Full-width content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </div>
    );
  }

  // ─── Specialized roles (no sidebar) ───────────────────────────────────────
  const specializedRoles = ["barista", "cashier", "pickup"];
  if (specializedRoles.includes(user?.role || "")) {
    return (
      <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
        {/* Slim actions bar for specialized roles */}
        <header className="flex items-center justify-between px-6 py-2 border-b bg-card shrink-0 shadow-sm z-40">
           <div className="flex items-center gap-3">
              <span className="font-black text-xl tracking-tighter text-primary select-none">SPACCA</span>
              <Badge variant="outline" className="capitalize px-2.5 py-0 rounded-full bg-primary/5 text-primary border-primary/20 font-bold text-[10px] tracking-tight">
                {user.role}
              </Badge>
           </div>
           
           <div className="flex items-center gap-2">
             <div className="hidden sm:flex flex-col items-end mr-2">
               <span className="text-xs font-bold leading-none">{user.name}</span>
               <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Terminal ID: {user.id}</span>
             </div>
             
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={toggleTheme} 
               className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
             >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </Button>
             
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => { logout(); setLocation("/login"); }}
               className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
             >
                <LogOut className="h-4 w-4" />
             </Button>
           </div>
        </header>

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </div>
    );
  }

  // ─── Front-desk kiosk layout ───────────────────────────────────────────────
  const navItems = [
    { href: "/pos", label: "POS", icon: Coffee },
    { href: "/kitchen", label: "Kitchen", icon: ChefHat },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/admin", label: "Admin", icon: LayoutDashboard });
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside className="w-20 md:w-64 border-r bg-card flex flex-col items-center md:items-start py-6">
        <div className="px-4 md:px-6 mb-8 w-full flex justify-center md:justify-start">
          <div className="font-bold text-2xl tracking-tighter text-primary select-none">
            <span className="hidden md:inline">SPACCA</span>
            <span className="inline md:hidden">SP</span>
          </div>
        </div>

        <nav className="flex-1 w-full space-y-2 px-2 md:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 w-full border-t space-y-2">
          <div className="hidden md:block mb-2 px-2">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-center md:justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <><Sun className="h-5 w-5" /><span className="hidden md:inline">Light Mode</span></>
            ) : (
              <><Moon className="h-5 w-5" /><span className="hidden md:inline">Dark Mode</span></>
            )}
          </Button>
          
          {user?.role === "admin" && (
            <>
              <Button
                variant="ghost"
                className={`w-full justify-center md:justify-start gap-2 ${autoPrintCustomer ? "text-primary bg-primary/5" : "text-muted-foreground"} hover:text-foreground transition-all`}
                onClick={() => setAutoPrintCustomer(!autoPrintCustomer)}
              >
                <Printer className="h-5 w-5" />
                <span className="hidden md:inline">Print Customer: {autoPrintCustomer ? "ON" : "OFF"}</span>
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-center md:justify-start gap-2 ${autoPrintAgent ? "text-primary bg-primary/5" : "text-muted-foreground"} hover:text-foreground transition-all`}
                onClick={() => setAutoPrintAgent(!autoPrintAgent)}
              >
                <Printer className="h-5 w-5 text-orange-500/80" />
                <span className="hidden md:inline">Print Agent: {autoPrintAgent ? "ON" : "OFF"}</span>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            className="w-full justify-center md:justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => { logout(); setLocation("/login"); }}
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
