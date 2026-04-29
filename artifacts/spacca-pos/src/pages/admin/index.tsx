import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Droplet, LayoutDashboard, LineChart, PackageSearch, BarChart2, Tag, ChefHat, Users, Ticket, UserCheck, History, Shield } from "lucide-react";

export default function AdminHub() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    setLocation("/pos");
    return null;
  }

  const modules = [
    {
      title: "Finance & Sales",
      description: "View revenue, top drinks, and sales trends",
      icon: LineChart,
      href: "/admin/finance",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Drinks Menu",
      description: "Manage recipes, pricing, and active status",
      icon: Coffee,
      href: "/admin/drinks",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Ingredients",
      description: "Manage base ingredients, options, and costs",
      icon: Droplet,
      href: "/admin/ingredients",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Stock Management",
      description: "Log deliveries, adjustments, and waste",
      icon: PackageSearch,
      href: "/admin/stock",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Drink Categories",
      description: "Manage POS categories, sort order, and visibility",
      icon: Tag,
      href: "/admin/categories",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      title: "Kitchen Stations",
      description: "Manage Hot Bar, Cold Bar, and other prep areas",
      icon: ChefHat,
      href: "/admin/kitchen-stations",
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      title: "Reports",
      description: "Sales analytics, top drinks, and order history",
      icon: BarChart2,
      href: "/admin/reports",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "User Management",
      description: "Manage staff access, roles, and terminal PINs",
      icon: Users,
      href: "/admin/users",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      title: "Discounts & Coupons",
      description: "Manage discount codes and promotional coupons",
      icon: Ticket,
      href: "/admin/discounts",
      color: "text-pink-500",
      bg: "bg-pink-500/10"
    },
    {
      title: "Cashier Performance",
      description: "Track per-cashier sales, revenue, and shift history",
      icon: UserCheck,
      href: "/admin/cashier-performance",
      color: "text-teal-500",
      bg: "bg-teal-500/10"
    },
    {
      title: "Activity Logs",
      description: "Monitor system events, deletions, and administrative actions",
      icon: History,
      href: "/admin/activity-logs",
      color: "text-slate-500",
      bg: "bg-slate-500/10"
    },
    {
      title: "Roles & Permissions",
      description: "Manage system-wide permissions and role-based access",
      icon: Shield,
      href: "/admin/permissions",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10"
    }
  ];

  return (
    <div className="p-8 w-full overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          Admin Hub
        </h1>
        <p className="text-muted-foreground mt-2">Manage your Spacca POS system settings, menu, and operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}>
              <Card className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/50 h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${mod.bg}`}>
                      <Icon className={`h-8 w-8 ${mod.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{mod.title}</CardTitle>
                      <CardDescription className="mt-1 text-base">{mod.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
