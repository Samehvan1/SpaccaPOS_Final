import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSettings } from "@/hooks/use-settings";
import { useOrderEvents } from "@/hooks/use-order-events";
import { Coffee, ChefHat, LayoutDashboard, LogOut, Sun, Moon, Printer, Wifi, WifiOff, Download, RefreshCw, ClipboardCheck, History, TrendingUp, ChevronDown, ChevronRight, User, Settings, PieChart, BarChart3, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout, selectedBranchId, setSelectedBranchId, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { autoPrintCustomer, setAutoPrintCustomer, autoPrintAgent, setAutoPrintAgent } = useSettings();
  const isOnline = useOnlineStatus();
  const { isInstallable, installApp } = usePWAInstall();
  useOrderEvents(!!user);
  const [location, setLocation] = useLocation();

  const { data: branches = [] } = useQuery({
    queryKey: ["/api/admin/branches"],
    queryFn: async () => {
      const res = await fetch("/api/admin/branches");
      if (!res.ok) throw new Error("Failed to fetch branches");
      return res.json() as Promise<{ id: number; name: string }[]>;
    },
    enabled: !!user || location === "/pos",
  });

  if (!user) {
    return (
      <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
        {location === "/pos" && (
          <header className="flex items-center justify-between px-6 py-3 border-b bg-card shrink-0 shadow-sm z-40">
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-primary select-none leading-none">
                SPACCA
              </span>
              {selectedBranchId && (
                <div className="flex items-center gap-1.5 mt-0.5">
                   <Badge variant="outline" className="h-4 px-1.5 text-[8px] border-primary/20 bg-primary/5 text-primary font-black tracking-widest uppercase">
                     {(branches as any[])?.find((b: any) => b.id === selectedBranchId)?.name || "Store Front"}
                   </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg h-8 w-8 p-0 text-muted-foreground"
                onClick={toggleTheme}
              >
                 {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>
        )}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </div>
    );
  }

  // ─── Front-desk kiosk layout ───────────────────────────────────────────────
  if (user?.role === "frontdesk") {
    return (
      <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
        {/* Slim top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card shrink-0 shadow-sm">
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-primary select-none leading-none">
              SPACCA
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
              {user.branch?.name || (selectedBranchId ? (branches as any[])?.find(b => b.id === selectedBranchId)?.name : "Global View")}
            </span>
          </div>

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
              onClick={() => window.location.reload()}
              title="Refresh App"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
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
  const specializedRoles = ["barista", "cashier", "pickup", "stockcontrol"];
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
              <div className="h-4 w-px bg-border mx-1" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-foreground uppercase tracking-wider leading-tight">
                  {user.branch?.name || (selectedBranchId ? (branches as any[])?.find(b => b.id === selectedBranchId)?.name : "Global")}
                </span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                  Branch
                </span>
              </div>
           </div>

           <div className="flex items-center gap-4">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => { logout(); setLocation("/login"); }}
               className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold"
             >
               <LogOut className="h-4 w-4" />
               <span className="hidden sm:inline">LOGOUT</span>
             </Button>
             {!isOnline && (
               <Badge variant="destructive" className="gap-1 animate-pulse px-2 py-0.5 text-[10px] uppercase font-black">
                 <WifiOff className="h-3 w-3" /> Offline
               </Badge>
             )}
             
             {isInstallable && (
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={installApp}
                 className="h-8 gap-2 bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-[10px] font-black uppercase tracking-tight"
               >
                 <Download className="h-3.5 w-3.5" />
                 Install App
               </Button>
             )}

             <div className="hidden sm:flex flex-col items-end">
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
               onClick={() => window.location.reload()}
               className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
               title="Refresh App"
             >
                <RefreshCw className="h-4 w-4" />
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["finance"]);

  const navItems = [
    { href: "/pos", label: "POS", icon: Coffee, permission: "pos:view" },
    { href: "/kitchen", label: "Kitchen", icon: ChefHat, permission: "kitchen:view" },
    { href: "/admin", label: "Admin", icon: LayoutDashboard, permission: "admin:view" },
    { 
      href: "/admin/finance", 
      label: "Finance", 
      icon: TrendingUp, 
      permission: "reports:view",
      children: [
        { href: "/admin/finance", label: "Dashboard" },
        { href: "/admin/finance/stock-movement", label: "Stock Movement" },
        { href: "/admin/finance/sales", label: "Sales Analysis" },
        { href: "/admin/finance/usage", label: "Inventory Usage" },
        { href: "/admin/finance/pl", label: "P&L Reports" },
      ]
    },
    { href: "/admin/stock-audits", label: "Stock Audits", icon: History, permission: "inventory:view" },
  ].filter(item => hasPermission(item.permission));

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside className="w-20 md:w-64 border-r bg-card flex flex-col items-center md:items-start py-6">
        <div className="px-4 md:px-6 mb-8 w-full flex justify-center md:justify-start">
          <div className="font-bold text-2xl tracking-tighter text-primary select-none">
            <span className="hidden md:inline">SPACCA</span>
            <span className="inline md:hidden">SP</span>
          </div>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ScrollArea className="h-full w-full">
            <nav className="space-y-2 px-2 md:px-4 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.children && location.startsWith(item.href));
                const isExpanded = expandedMenus.includes(item.label);
                
                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    {item.children ? (
                      <div
                        onClick={() => toggleMenu(item.label)}
                        className={`flex items-center justify-between gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors ${
                          isActive && !isExpanded
                            ? "bg-primary text-primary-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="hidden md:inline">{item.label}</span>
                        </div>
                        <div className="hidden md:block">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </div>
                    ) : (
                      <Link href={item.href}>
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
                    )}
                    
                    {item.children && isExpanded && (
                      <div className="ml-4 md:ml-9 flex flex-col gap-1 border-l pl-2 mt-1">
                        {item.children.map(child => (
                          <Link key={child.href} href={child.href}>
                            <div className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                              location === child.href 
                                ? "bg-primary/10 text-primary font-bold" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}>
                              {child.label}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </ScrollArea>
        </div>

        <div className="p-4 w-full border-t space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-6 h-auto hover:bg-muted transition-all">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="hidden md:flex flex-col items-start overflow-hidden">
                  <div className="text-sm font-bold truncate w-full">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                    {user.role} • {selectedBranchId ? (branches?.find(b => b.id === selectedBranchId)?.name || 'Branch') : 'Global'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 ml-auto hidden md:block text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={10}>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => window.location.reload()} className="cursor-pointer">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Refresh App</span>
              </DropdownMenuItem>
              
              {(user?.role === "admin" || branches.length > 1) && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Switch Branch</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                      <DropdownMenuLabel>Available Branches</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={String(selectedBranchId || "global")} onValueChange={(v) => setSelectedBranchId(v === "global" ? null : parseInt(v))}>
                        <DropdownMenuRadioItem value="global" className="cursor-pointer">
                          Global View
                        </DropdownMenuRadioItem>
                        {branches.map(b => (
                          <DropdownMenuRadioItem key={b.id} value={String(b.id)} className="cursor-pointer">
                            {b.name}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}

              {(user?.role === "admin" || hasPermission("settings:manage")) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Printing</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={(e) => { e.preventDefault(); setAutoPrintCustomer(!autoPrintCustomer); }}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Printer className="mr-2 h-4 w-4" />
                      <span>Customer Receipt</span>
                    </div>
                    <Badge variant={autoPrintCustomer ? "default" : "outline"} className="text-[8px] h-4">
                      {autoPrintCustomer ? "ON" : "OFF"}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => { e.preventDefault(); setAutoPrintAgent(!autoPrintAgent); }}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Printer className="mr-2 h-4 w-4 text-orange-500" />
                      <span>Agent Receipt</span>
                    </div>
                    <Badge variant={autoPrintAgent ? "default" : "outline"} className="text-[8px] h-4">
                      {autoPrintAgent ? "ON" : "OFF"}
                    </Badge>
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); setLocation("/login"); }} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
