import { useState } from "react";
import { useGetDashboardSummary, useGetSalesByCategory, useGetTopDrinks, useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, BarChart2, TrendingUp, Coffee, Receipt, 
  DollarSign, Medal, Calendar, ChevronLeft, ChevronRight,
  Download, Tag
} from "lucide-react";
import { Link } from "wouter";
import { fmt, CURRENCY } from "@/lib/currency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

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

  // Dashboard Tab Data
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: dashboardCategorySales, isLoading: loadingDashboardCategory } = useGetSalesByCategory({ days: period.days });
  const { data: topDrinks, isLoading: loadingTop } = useGetTopDrinks({ limit: 10 });
  const { data: recentOrders, isLoading: loadingRecentOrders } = useListOrders({ status: "completed", limit: 10 });

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

  const handleExportCSV = () => {
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
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
          <TabsTrigger value="dashboard" className="text-base font-semibold">Dashboard</TabsTrigger>
          <TabsTrigger value="sales" className="text-base font-semibold">Sales Report</TabsTrigger>
        </TabsList>

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
                label: "Revenue", value: fmt(dashTotalRevenue), icon: DollarSign,
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
                  Top Drinks (All Time)
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
          {/* Filters Banner */}
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
                   <Button 
                    variant="outline" 
                    className="gap-2 shrink-0"
                    onClick={handleExportCSV}
                    disabled={!reportOrders || reportOrders.length === 0}
                  >
                      <Download className="h-4 w-4" /> Export CSV
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Totals Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Range Revenue", value: fmt(reportTotalRevenue), icon: DollarSign, loading: loadingReportSummary },
              { label: "Range Orders", value: reportTotalOrders, icon: Receipt, loading: loadingReportSummary },
              { label: "Range Drinks", value: reportTotalDrinks, icon: Coffee, loading: loadingReportSummary },
              { label: "Range Discounts", value: fmt(reportOrders?.reduce((s, o) => s + (o as any).discount, 0) || 0), icon: Tag, loading: loadingReportSummary },
              { label: "Range Avg", value: fmt(reportAvgOrder), icon: TrendingUp, loading: loadingReportSummary },
            ].map(({ label, value, icon: Icon, loading }) => (
              <Card key={label} className="bg-primary/5 border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
                  <Icon className="h-4 w-4 text-primary/60" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-7 bg-primary/10 animate-pulse rounded" />
                  ) : (
                    <div className="text-2xl font-black text-primary">{value}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Sales Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sales Transaction Log</CardTitle>
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
                            <TableCell className="text-right">{fmt(totalPrice)}</TableCell>
                            <TableCell className="text-right">{fmt(beforeTax)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{fmt(taxAmount)}</TableCell>
                            <TableCell className="text-right">
                              {(order as any).discountType === 'percentage' 
                                ? `${(order as any).discountValue}%` 
                                : `${discountPercent.toFixed(1)}%`}
                            </TableCell>
                            <TableCell className="text-right font-medium text-destructive">-{fmt(discountAmt)}</TableCell>
                            <TableCell className="text-right">{fmt(subtotalPrice)}</TableCell>
                            <TableCell className="text-right font-black text-primary">{fmt(finalPrice)}</TableCell>
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
      </Tabs>
    </div>
  );
}
