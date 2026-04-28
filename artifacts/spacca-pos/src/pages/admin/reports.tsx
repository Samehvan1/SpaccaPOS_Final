import { useState, useMemo } from "react";
import { useGetDashboardSummary, useGetSalesByCategory, useGetTopDrinks, useListOrders, useGetDrink, useListDrinks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, BarChart2, TrendingUp, Coffee, Receipt, 
  Banknote, Medal, Calendar, ChevronLeft, ChevronRight,
  Download, Tag, CheckCircle2, XCircle, FileText, Layers, Clock
} from "lucide-react";
import { Link } from "wouter";
import { fmt, pure, CURRENCY } from "@/lib/currency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, differenceInSeconds } from "date-fns";

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || isNaN(seconds)) return "-";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const PERIODS = [
  { label: "Today", days: 1 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

const PIE_COLORS = ["#BCD991", "#D96B43", "#6BA3D9", "#D9B36B", "#9B6BD9", "#6BD9C1"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [period, setPeriod] = useState(PERIODS[1]);
  const [drinksView, setDrinksView] = useState<"grouped" | "individual">("grouped");
  const [showCustomizedOnly, setShowCustomizedOnly] = useState(false);
  const [selectedCustomizedItem, setSelectedCustomizedItem] = useState<any>(null);

  // Fetch all drinks with slots for precise customization detection in the list
  const { data: allDrinksCatalog } = useListDrinks({ includeSlots: true } as any);

  // Helper to build defaults map for any given set of drink slots
  const buildDefaultsMap = (slots: any[]) => {
    const map: Record<string, { label: string; isDynamic: boolean; typeName: string }> = {};
    if (!slots) return map;
    slots.forEach(slot => {
      let label = "";
      let typeName = "";
      if (slot.slotStyle === "typed") {
        const defType = slot.typeOptions?.find((to: any) => to.isDefault);
        const defVol = defType?.volumes?.find((v: any) => v.isDefault);
        typeName = defType?.typeName ?? "";
        if (defType && defVol) {
          label = `${defType.typeName} · ${defVol.volumeName}`;
        } else if (defType) {
          label = defType.typeName;
        }
      } else if (slot.slotStyle === "legacy") {
         const defOpt = slot.ingredient?.options?.find((o: any) => o.isDefault);
         if (defOpt) {
           label = defOpt.label;
         }
      }
      map[slot.slotLabel] = { label, isDynamic: !!slot.isDynamic, typeName };
    });
    return map;
  };

  // Fetch drink details for defaults when a customized item is selected (modal)
  const { data: drinkDetail, isLoading: loadingDrinkDetail } = useGetDrink(selectedCustomizedItem?.drinkId || 0, {
    query: { enabled: !!selectedCustomizedItem?.drinkId } as any
  });

  const defaultsMap = useMemo(() => buildDefaultsMap(drinkDetail?.slots as any[]), [drinkDetail]);

  // Dashboard Tab Data
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: dashboardCategorySales, isLoading: loadingDashboardCategory } = useGetSalesByCategory({ days: period.days });
  const { data: topDrinks, isLoading: loadingTop } = useGetTopDrinks({ limit: 10, days: period.days });
  const { data: recentOrders, isLoading: loadingRecentOrders } = useListOrders({ 
    status: "completed", 
    limit: 10,
    startDate: format(subDays(new Date(), period.days), "yyyy-MM-dd")
  });

  const dashTotalRevenue = dashboardCategorySales?.reduce((s, c) => s + c.totalRevenue, 0) ?? 0;
  const dashTotalOrders = dashboardCategorySales?.reduce((s, c) => s + c.totalOrders, 0) ?? 0;
  const dashTotalDrinks = dashboardCategorySales?.reduce((s, c) => s + c.totalDrinks, 0) ?? 0;
  const dashAvgOrder = dashTotalOrders > 0 ? dashTotalRevenue / dashTotalOrders : 0;

  // Sales Report Tab Data
  const [reportStartDate, setReportStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [reportEndDate, setReportEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reportPage, setReportPage] = useState(1);
  const rowsPerPage = 50;

  const { data: reportOrders, isLoading: loadingReportOrders } = useListOrders({
    startDate: reportStartDate,
    endDate: reportEndDate,
    limit: rowsPerPage,
    offset: (reportPage - 1) * rowsPerPage
  });

  // Calculate totals for report banner using the updated category sales endpoint
  const { data: reportSummary, isLoading: loadingReportSummary } = useGetSalesByCategory({
    startDate: reportStartDate,
    endDate: reportEndDate
  });

  const reportTotalRevenue = reportSummary?.reduce((s, c) => s + c.totalRevenue, 0) ?? 0;
  const reportTotalOrders = reportSummary?.reduce((s, c) => s + c.totalOrders, 0) ?? 0;
  const reportTotalDrinks = reportSummary?.reduce((s, c) => s + c.totalDrinks, 0) ?? 0;
  const reportAvgOrder = reportTotalOrders > 0 ? reportTotalRevenue / reportTotalOrders : 0;

  // Drinks Report Processing
  const drinkItems = useMemo(() => {
    if (!reportOrders) return [];
    return reportOrders.flatMap(order => (order.items || []).map(item => {
      const customizations = item.customizations || [];
      const specialNotes = (item.specialNotes || "").trim();
      
      // Better customization check: compare with catalog defaults if available
      let isActuallyCustomized = false;
      if (specialNotes !== "") {
        isActuallyCustomized = true;
      } else {
        const drinkInCatalog = allDrinksCatalog?.find((d: any) => d.id === item.drinkId) as any;
        if (drinkInCatalog?.slots) {
          const itemDefaults = buildDefaultsMap(drinkInCatalog.slots);
          const norm = (s: string) => s.replace(/\s*[·()]\s*/g, "|").trim().toLowerCase();
          
          isActuallyCustomized = customizations.some(c => {
            const def = itemDefaults[c.slotLabel];
            if (!def) return false;
            
            // Exact same normalization and logic as the details modal
            const norm = (s: string) => s.replace(/\s*[·()]\s*/g, "|").replace(/\|+$/, "").trim().toLowerCase();
            
            if (def.isDynamic) {
              return !c.optionLabel.toLowerCase().startsWith(def.typeName.toLowerCase());
            }
            return norm(c.optionLabel) !== norm(def.label);
          });
        } else {
          // If catalog not yet loaded, don't guess based on cost (defaults can have costs)
          isActuallyCustomized = false;
        }
      }

      return {
        ...item,
        orderId: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderDiscount: order.discount,
        orderSubtotal: order.subtotal,
        isCustomized: isActuallyCustomized
      };
    })).filter(item => !showCustomizedOnly || item.isCustomized);
  }, [reportOrders, allDrinksCatalog, showCustomizedOnly]);

  const groupedDrinkItems = useMemo(() => {
    const groups: Record<string, { drinkName: string; isCustomized: boolean; quantity: number; revenue: number }> = {};
    drinkItems.forEach((item: any) => {
      const key = `${item.drinkName}_${item.isCustomized}`;
      if (!groups[key]) {
        groups[key] = { drinkName: item.drinkName, isCustomized: item.isCustomized, quantity: 0, revenue: 0 };
      }
      groups[key].quantity += item.quantity;
      groups[key].revenue += item.lineTotal;
    });
    return Object.values(groups).sort((a, b) => b.revenue - a.revenue);
  }, [drinkItems]);

  const handleExportSalesCSV = () => {
    if (!reportOrders || reportOrders.length === 0) return;

    const headers = [
      "OrderID", "Date", "Time", "Order Number", "Total Price (Gross)", "Before Tax (Net)", 
      "Tax Amount", "Discount %", "Discount Amount", "SubTotal Price", "Final Price", "Status", "Payment Method"
    ];

    const rows = reportOrders.map(order => {
      const totalPrice = order.subtotal;
      const beforeTax = totalPrice / 1.14;
      const taxAmount = totalPrice - beforeTax;
      const discountAmt = order.discount;
      const discountPercent = beforeTax > 0 ? (discountAmt / beforeTax) * 100 : 0;
      const subtotalPrice = beforeTax - discountAmt;
      const finalPrice = subtotalPrice + taxAmount;

      return [
        order.id,
        format(new Date(order.createdAt), "yyyy-MM-dd"),
        format(new Date(order.createdAt), "HH:mm"),
        `#${order.orderNumber}`,
        totalPrice.toFixed(2),
        beforeTax.toFixed(2),
        taxAmount.toFixed(2),
        `${discountPercent.toFixed(1)}%`,
        discountAmt.toFixed(2),
        subtotalPrice.toFixed(2),
        finalPrice.toFixed(2),
        order.status,
        order.paymentMethod
      ].map(v => `"${v}"`).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${reportStartDate}_to_${reportEndDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDrinksCSV = () => {
    if (!drinkItems || drinkItems.length === 0) return;

    const headers = [
      "Drink Name", "Type", "Order #", "Original (Gross)", "Before Tax", "Tax", "Discount", "After Disc.", "Final Price"
    ];

    const rows = drinkItems.map((item: any) => {
      const itemGross = item.lineTotal;
      const itemNet = itemGross / 1.14;
      const itemTax = itemGross - itemNet;
      const orderBeforeTax = item.orderSubtotal / 1.14;
      const discountRatio = orderBeforeTax > 0 ? item.orderDiscount / orderBeforeTax : 0;
      const itemDiscountAmt = itemNet * discountRatio;
      const itemAfterDiscount = itemNet - itemDiscountAmt;
      const itemFinalPrice = itemAfterDiscount + itemTax;

      return [
        item.drinkName,
        item.isCustomized ? "Customized" : "Standard",
        `#${item.orderNumber}`,
        itemGross.toFixed(2),
        itemNet.toFixed(2),
        itemTax.toFixed(2),
        itemDiscountAmt.toFixed(2),
        itemAfterDiscount.toFixed(2),
        itemFinalPrice.toFixed(2)
      ].map(v => `"${v}"`).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `drinks_report_${reportStartDate}_to_${reportEndDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart2 className="h-8 w-8 text-primary" />
              Reports
            </h1>
            <p className="text-muted-foreground mt-1">Sales performance and operational analytics.</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 h-12">
          <TabsTrigger value="dashboard" className="text-base font-semibold">Dashboard</TabsTrigger>
          <TabsTrigger value="sales" className="text-base font-semibold">Sales Report</TabsTrigger>
          <TabsTrigger value="drinks" className="text-base font-semibold">Drinks Report</TabsTrigger>
          <TabsTrigger value="performance" className="text-base font-semibold">Performance</TabsTrigger>
        </TabsList>

        {activeTab !== "dashboard" && (
          <div className="flex flex-col gap-6 mb-8 animate-in fade-in duration-500">
            {/* Shared Filters Banner */}
            <Card className="bg-muted/30 border-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-end gap-6">
                  <div className="grid gap-2 w-full md:w-auto">
                    <Label htmlFor="start-date" className="flex items-center gap-2 text-sm font-bold">
                      <Calendar className="h-4 w-4 text-primary" /> From
                    </Label>
                    <Input 
                      id="start-date" 
                      type="date" 
                      value={reportStartDate} 
                      onChange={e => { setReportStartDate(e.target.value); setReportPage(1); }}
                      className="bg-background w-full md:w-48"
                    />
                  </div>
                  <div className="grid gap-2 w-full md:w-auto">
                    <Label htmlFor="end-date" className="flex items-center gap-2 text-sm font-bold">
                      <Calendar className="h-4 w-4 text-primary" /> To
                    </Label>
                    <Input 
                      id="end-date" 
                      type="date" 
                      value={reportEndDate} 
                      onChange={e => { setReportEndDate(e.target.value); setReportPage(1); }}
                      className="bg-background w-full md:w-48"
                    />
                  </div>
                  <div className="md:ml-auto flex items-center gap-2">
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shared Totals Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Range Revenue", value: fmt(reportTotalRevenue), icon: Banknote, loading: loadingReportSummary },
                { label: "Range Orders", value: reportTotalOrders, icon: Receipt, loading: loadingReportSummary },
                { label: "Range Drinks", value: reportTotalDrinks, icon: Coffee, loading: loadingReportSummary },
                { label: "Range Discounts", value: fmt(reportOrders?.reduce((s, o) => s + (o as any).discount, 0) || 0), icon: Tag, loading: loadingReportSummary },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-md bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      {stat.loading ? (
                        <div className="h-6 w-16 bg-muted animate-pulse rounded mt-1" />
                      ) : (
                        <p className="text-lg font-bold">{stat.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <TabsContent value="dashboard" className="flex flex-col gap-6 animate-in fade-in duration-500">
          {/* Period selector */}
          <div className="flex justify-end gap-2">
            {PERIODS.map(p => (
              <Button
                key={p.days}
                variant={period.days === p.days ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Summary KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Revenue", value: fmt(dashTotalRevenue), icon: Banknote,
                sub: `vs today: ${fmt(summary?.todayRevenue ?? 0)}`, loading: loadingDashboardCategory
              },
              {
                label: "Orders", value: dashTotalOrders, icon: Receipt,
                sub: `Today: ${summary?.todayOrders ?? 0}`, loading: loadingDashboardCategory
              },
              {
                label: "Drinks Sold", value: dashTotalDrinks, icon: Coffee,
                sub: `Today: ${summary?.todayDrinks ?? 0}`, loading: loadingDashboardCategory
              },
              {
                label: "Avg Order", value: fmt(dashAvgOrder), icon: TrendingUp,
                sub: `Today avg: ${fmt(summary?.averageOrderValue ?? 0)}`, loading: loadingDashboardCategory
              },
            ].map(({ label, value, icon: Icon, sub, loading }) => (
              <Card key={label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 bg-muted animate-pulse rounded" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Category — {period.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {loadingDashboardCategory ? (
                    <div className="h-full bg-muted animate-pulse rounded" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardCategorySales} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="category" tick={{ fontSize: 13 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(v: number) => [`${CURRENCY}${v.toFixed(2)}`, "Revenue"]}
                          cursor={{ fill: "rgba(0,0,0,0.04)" }}
                        />
                        <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drinks Share</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {loadingDashboardCategory ? (
                    <div className="h-full bg-muted animate-pulse rounded" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardCategorySales}
                          dataKey="totalDrinks"
                          nameKey="category"
                          cx="50%"
                          cy="45%"
                          outerRadius={90}
                          label={({ category, percent }) =>
                            `${category} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {dashboardCategorySales?.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [v, "Drinks"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Drinks + Category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-primary" />
                  Top Drinks ({period.label})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTop ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topDrinks?.map((drink, i) => (
                      <div key={drink.drinkId} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0 ? "bg-yellow-400 text-yellow-900" :
                          i === 1 ? "bg-gray-300 text-gray-800" :
                          i === 2 ? "bg-amber-600 text-white" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{drink.drinkName}</div>
                          <div className="text-xs text-muted-foreground">{drink.totalSold} sold</div>
                        </div>
                        <div className="font-bold text-primary shrink-0">{fmt(drink.totalRevenue)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown — {period.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDashboardCategory ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Drinks</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardCategorySales?.map(row => (
                          <TableRow key={row.category}>
                            <TableCell className="font-medium capitalize">{row.category}</TableCell>
                            <TableCell className="text-right">{row.totalDrinks}</TableCell>
                            <TableCell className="text-right">{row.totalOrders}</TableCell>
                            <TableCell className="text-right font-bold">{fmt(row.totalRevenue)}</TableCell>
                          </TableRow>
                        ))}
                        {dashboardCategorySales && dashboardCategorySales.length > 0 && (
                          <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right">{dashTotalDrinks}</TableCell>
                            <TableCell className="text-right">{dashTotalOrders}</TableCell>
                            <TableCell className="text-right">{fmt(dashTotalRevenue)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Completed Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Barista</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingRecentOrders ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Loading…</TableCell>
                      </TableRow>
                    ) : !recentOrders || recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No completed orders yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-medium">#{order.orderNumber}</TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(order.createdAt), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>{order.baristaName}</TableCell>
                          <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold">{fmt(order.total)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="flex flex-col gap-6 animate-in slide-in-from-right duration-500">

          {/* Detailed Sales Table */}
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Sales Transaction Log</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 h-8 px-3"
                  onClick={handleExportSalesCSV}
                  disabled={!reportOrders || reportOrders.length === 0}
                >
                  <Download className="h-4 w-4" /> Export Sales
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setReportPage(p => Math.max(1, p - 1))}
                  disabled={reportPage === 1 || loadingReportOrders}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">Page {reportPage}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setReportPage(p => p + 1)}
                  disabled={!reportOrders || reportOrders.length < rowsPerPage || loadingReportOrders}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">OrderID</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Time</TableHead>
                      <TableHead className="font-bold">Order #</TableHead>
                      <TableHead className="font-bold">Coupon</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap">Total Price (Gross)</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap">Before Tax (Net)</TableHead>
                      <TableHead className="text-right font-bold">Tax amount</TableHead>
                      <TableHead className="text-right font-bold">Discount (%)</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap">Discount amount</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap">SubTotal Price</TableHead>
                      <TableHead className="text-right font-bold">Final Price</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold whitespace-nowrap">Payment Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingReportOrders ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-20">
                          <div className="flex flex-col items-center gap-2">
                            <BarChart2 className="h-8 w-8 text-primary animate-pulse" />
                            <span className="text-muted-foreground font-medium">Generating report...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : !reportOrders || reportOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-20 text-muted-foreground font-medium">
                          No transactions found for the selected range.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportOrders.map(order => {
                        // User's requested calculations
                        const totalPrice = order.subtotal; // Our DB subtotal is gross before discount
                        const beforeTax = totalPrice / 1.14;
                        const taxAmount = totalPrice - beforeTax;
                        const discountAmt = order.discount; // Our DB discount is the amount
                        
                        // Percentage calculation (relative to Net/Before Tax as per their formula)
                        const discountPercent = beforeTax > 0 ? (discountAmt / beforeTax) * 100 : 0;
                        const subtotalPrice = beforeTax - discountAmt;
                        const finalPrice = subtotalPrice + taxAmount; // effectively order.total

                        return (
                          <TableRow key={order.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-muted-foreground">{order.id}</TableCell>
                            <TableCell className="whitespace-nowrap">{format(new Date(order.createdAt), "yyyy-MM-dd")}</TableCell>
                            <TableCell>{format(new Date(order.createdAt), "HH:mm")}</TableCell>
                             <TableCell className="font-mono font-bold">#{order.orderNumber}</TableCell>
                             <TableCell>
                               {(order as any).discountId ? (
                                 <Badge variant="outline" className="font-mono text-[10px] bg-primary/5">
                                   {(order as any).discountCode || `ID:${(order as any).discountId}`}
                                 </Badge>
                               ) : <span className="text-muted-foreground text-xs">—</span>}
                             </TableCell>
                            <TableCell className="text-right">{pure(totalPrice)}</TableCell>
                            <TableCell className="text-right">{pure(beforeTax)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{pure(taxAmount)}</TableCell>
                            <TableCell className="text-right">
                              {(order as any).discountType === 'percentage' 
                                ? `${(order as any).discountValue}%` 
                                : `${discountPercent.toFixed(1)}%`}
                            </TableCell>
                            <TableCell className="text-right font-medium text-destructive">-{pure(discountAmt)}</TableCell>
                            <TableCell className="text-right">{pure(subtotalPrice)}</TableCell>
                            <TableCell className="text-right font-black text-primary">{pure(finalPrice)}</TableCell>
                            <TableCell>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell className="capitalize font-medium">{order.paymentMethod}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                 <p className="text-xs text-muted-foreground">
                    Calculations based on 14% VAT. Before Tax = Gross / 1.14. Discount applied to Net price.
                 </p>
                 <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setReportPage(p => Math.max(1, p - 1))}
                      disabled={reportPage === 1 || loadingReportOrders}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setReportPage(p => p + 1)}
                      disabled={!reportOrders || reportOrders.length < rowsPerPage || loadingReportOrders}
                    >
                      Next
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drinks" className="flex flex-col gap-6 animate-in fade-in duration-500">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Coffee className="h-5 w-5 text-primary" />
                      Drinks Sales Report
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2 h-8 px-3"
                      onClick={handleExportDrinksCSV}
                      disabled={!drinkItems || drinkItems.length === 0}
                    >
                      <Download className="h-4 w-4" /> Export Drinks
                    </Button>
                  </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
                    <Label htmlFor="custom-only" className="text-xs font-medium cursor-pointer">Customized Only</Label>
                    <input 
                      id="custom-only"
                      type="checkbox" 
                      checked={showCustomizedOnly} 
                      onChange={(e) => setShowCustomizedOnly(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                    <Button 
                      variant={drinksView === "grouped" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setDrinksView("grouped")}
                      className="gap-2 h-8 px-3"
                    >
                      <Layers className="h-4 w-4" />
                      Grouped
                    </Button>
                    <Button 
                      variant={drinksView === "individual" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setDrinksView("individual")}
                      className="gap-2 h-8 px-3"
                    >
                      <FileText className="h-4 w-4" />
                      Individual
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[200px]">Drink Name</TableHead>
                      <TableHead>Type</TableHead>
                      {drinksView === "individual" ? (
                        <>
                          <TableHead>Order #</TableHead>
                          <TableHead className="text-right">Original (Gross)</TableHead>
                          <TableHead className="text-right">Before Tax</TableHead>
                          <TableHead className="text-right text-xs">Tax</TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                          <TableHead className="text-right whitespace-nowrap">After Disc.</TableHead>
                          <TableHead className="text-right font-bold">Final Price</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drinksView === "grouped" ? (
                      groupedDrinkItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                            No drink data available for this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        groupedDrinkItems.map((item, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold text-foreground">{item.drinkName}</TableCell>
                            <TableCell>
                              <Badge variant={item.isCustomized ? "outline" : "secondary"} className={item.isCustomized ? "border-amber-500 text-amber-600 bg-amber-50" : "bg-green-50 text-green-700"}>
                                {item.isCustomized ? (
                                  <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> Customized</span>
                                ) : (
                                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Standard</span>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                            <TableCell className="text-right font-bold text-primary">{pure(item.revenue)}</TableCell>
                          </TableRow>
                        ))
                      )
                    ) : (
                      drinkItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                            No individual drink items available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        drinkItems.map((item: any, idx: number) => {
                        const itemGross = item.lineTotal;
                        const itemNet = itemGross / 1.14;
                        const itemTax = itemGross - itemNet;
                        
                        const orderBeforeTax = item.orderSubtotal / 1.14;
                        const discountRatio = orderBeforeTax > 0 ? item.orderDiscount / orderBeforeTax : 0;
                        const itemDiscountAmt = itemNet * discountRatio;
                        const itemAfterDiscount = itemNet - itemDiscountAmt;
                        const itemFinalPrice = itemAfterDiscount + itemTax;

                        return (
                          <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold text-foreground">
                              {item.drinkName}
                              {item.specialNotes && (
                                <p className="text-[10px] text-muted-foreground font-normal italic mt-1 truncate max-w-[150px]">
                                  {item.specialNotes}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={item.isCustomized ? "outline" : "secondary"} 
                                className={item.isCustomized ? "border-amber-500 text-amber-600 bg-amber-50 text-[10px] px-1 h-5 cursor-help hover:bg-amber-100 transition-colors" : "bg-green-50 text-green-700 text-[10px] px-1 h-5"}
                                onClick={() => item.isCustomized && setSelectedCustomizedItem(item)}
                              >
                                {item.isCustomized ? "Customized" : "Standard"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">#{item.orderNumber}</TableCell>
                            <TableCell className="text-right">{pure(itemGross)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{pure(itemNet)}</TableCell>
                            <TableCell className="text-right text-[10px] text-muted-foreground">{pure(itemTax)}</TableCell>
                            <TableCell className="text-right text-destructive">-{pure(itemDiscountAmt)}</TableCell>
                            <TableCell className="text-right font-medium">{pure(itemAfterDiscount)}</TableCell>
                            <TableCell className="text-right font-bold text-primary">{pure(itemFinalPrice)}</TableCell>
                          </TableRow>
                        );
                      })
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="flex flex-col gap-6 animate-in fade-in duration-500">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Barista & Kitchen Performance
                </CardTitle>
                <div className="flex bg-muted/50 p-1 rounded-lg border">
                  <Button 
                    variant={drinksView === "grouped" ? "default" : "ghost"} 
                    size="sm" 
                    className="h-7 text-xs px-3"
                    onClick={() => setDrinksView("grouped")}
                  >
                    By Order
                  </Button>
                  <Button 
                    variant={drinksView === "individual" ? "default" : "ghost"} 
                    size="sm" 
                    className="h-7 text-xs px-3"
                    onClick={() => setDrinksView("individual")}
                  >
                    By Drink
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-bold">Order # / Status</TableHead>
                      <TableHead className="font-bold">Date & Time</TableHead>
                      <TableHead className="font-bold text-center">Creation to Paid<br/><span className="text-[10px] text-muted-foreground font-normal">(Cashier Time)</span></TableHead>
                      <TableHead className="font-bold text-center">Paid to Ready<br/><span className="text-[10px] text-muted-foreground font-normal">(Barista Time)</span></TableHead>
                      {drinksView === "grouped" && (
                        <TableHead className="font-bold text-center">Ready to Delivered<br/><span className="text-[10px] text-muted-foreground font-normal">(Pickup Time)</span></TableHead>
                      )}
                      {drinksView === "grouped" && (
                        <TableHead className="font-bold text-right">Total Duration</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingReportOrders ? (
                      <TableRow>
                         <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                              <span className="text-sm text-muted-foreground">Loading performance data...</span>
                            </div>
                         </TableCell>
                      </TableRow>
                    ) : !reportOrders || reportOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No data available for the selected range.
                        </TableCell>
                      </TableRow>
                    ) : drinksView === "grouped" ? (
                      reportOrders.map(order => {
                        const created = order.createdAt ? new Date(order.createdAt) : null;
                        const paid = order.paidAt ? new Date(order.paidAt) : null;
                        const ready = order.readyAt ? new Date(order.readyAt) : null;
                        const completed = order.completedAt ? new Date(order.completedAt) : null;
                        
                        const cashierSecs = created && paid ? differenceInSeconds(paid, created) : null;
                        const baristaSecs = paid && ready ? differenceInSeconds(ready, paid) : null;
                        const pickupSecs = ready && completed ? differenceInSeconds(completed, ready) : null;
                        const totalSecs = created && completed ? differenceInSeconds(completed, created) : null;

                        return (
                          <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono">
                              <div className="font-bold">#{order.orderNumber}</div>
                              <div className="text-[10px] uppercase opacity-50">{order.status}</div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(created || new Date(), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">{formatDuration(cashierSecs)}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                                {formatDuration(baristaSecs)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">{formatDuration(pickupSecs)}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatDuration(totalSecs)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      drinkItems.map((item: any, idx: number) => {
                        const created = item.createdAt ? new Date(item.createdAt) : null;
                        // For drinks, we use the order's paid time to start barista duration
                        const orderRaw = reportOrders.find(o => o.id === item.orderId);
                        const paid = orderRaw && (orderRaw as any).paidAt ? new Date((orderRaw as any).paidAt) : null;
                        const ready = item.readyAt ? new Date(item.readyAt) : null;

                        const cashierSecs = created && paid ? differenceInSeconds(paid, created) : null;
                        const baristaSecs = paid && ready ? differenceInSeconds(ready, paid) : null;

                        return (
                          <TableRow key={`${item.id}-${idx}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold">
                              {item.drinkName}
                              <div className="text-[10px] text-muted-foreground font-mono">Order #{item.orderNumber}</div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(created || new Date(), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono text-xs">{formatDuration(cashierSecs)}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {formatDuration(baristaSecs)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
                <p>Calculations: Cashier Time = Paid - Created. Barista Time = Ready - Paid. Pickup Time = Completed - Ready.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customization Details Modal */}
      <Dialog open={!!selectedCustomizedItem} onOpenChange={(open) => !open && setSelectedCustomizedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" />
              Customization Details
            </DialogTitle>
            <DialogDescription>
              Selections for <strong>{selectedCustomizedItem?.drinkName}</strong> (Order #{selectedCustomizedItem?.orderNumber})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs uppercase font-bold py-2">Slot/Component</TableHead>
                    <TableHead className="text-xs uppercase font-bold py-2">Default</TableHead>
                    <TableHead className="text-xs uppercase font-bold py-2">Selection</TableHead>
                    <TableHead className="text-right text-xs uppercase font-bold py-2">Extra Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDrinkDetail ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                         <div className="flex items-center justify-center gap-2">
                           <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                           <span className="text-sm text-muted-foreground">Loading defaults...</span>
                         </div>
                      </TableCell>
                    </TableRow>
                  ) : selectedCustomizedItem?.customizations?.length > 0 ? (
                    selectedCustomizedItem.customizations.map((c: any, i: number) => {
                      const def = defaultsMap[c.slotLabel];
                      // Normalize strings for comparison (remove spaces and separators, trim trailing pipes)
                      const norm = (s: string) => s.replace(/\s*[·()]\s*/g, "|").replace(/\|+$/, "").trim().toLowerCase();
                      
                      let isModified = false;
                      if (def) {
                        if (def.isDynamic) {
                          // For dynamic slots, we only care if the ingredient type changed, not the filled volume
                          isModified = !c.optionLabel.toLowerCase().startsWith(def.typeName.toLowerCase());
                        } else {
                          isModified = norm(c.optionLabel) !== norm(def.label);
                        }
                      }

                      return (
                        <TableRow key={i} className={`hover:bg-transparent border-l-2 ${isModified ? "border-l-amber-500 bg-amber-50/20" : "border-l-transparent"}`}>
                          <TableCell className="py-2 text-sm font-medium">{c.slotLabel}</TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground italic">
                            {def?.label || "—"}
                          </TableCell>
                          <TableCell className={`py-2 text-sm ${isModified ? "text-amber-600 font-bold" : ""}`}>
                            {c.optionLabel}
                            {c.consumedQty > 0 && <span className="text-[10px] text-muted-foreground ml-1">({c.consumedQty}ml)</span>}
                          </TableCell>
                          <TableCell className="py-2 text-sm text-right font-mono">
                            {c.addedCost > 0 ? `+${pure(c.addedCost)}` : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm italic">
                        No customizations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {selectedCustomizedItem?.specialNotes && (
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                <p className="text-xs font-bold text-amber-700 uppercase mb-1">Barista Notes:</p>
                <p className="text-sm text-amber-900 italic">"{selectedCustomizedItem.specialNotes}"</p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedCustomizedItem(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
