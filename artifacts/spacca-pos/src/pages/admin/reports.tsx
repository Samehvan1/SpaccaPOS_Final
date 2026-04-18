import { useState } from "react";
import { useGetDashboardSummary, useGetSalesByCategory, useGetTopDrinks, useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, BarChart2, TrendingUp, Coffee, Receipt, DollarSign, Medal } from "lucide-react";
import { Link } from "wouter";
import { fmt, CURRENCY } from "@/lib/currency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format } from "date-fns";

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
  const [period, setPeriod] = useState(PERIODS[1]);

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: categorySales, isLoading: loadingCategory } = useGetSalesByCategory({ days: period.days });
  const { data: topDrinks, isLoading: loadingTop } = useGetTopDrinks({ limit: 10 });
  const { data: orders, isLoading: loadingOrders } = useListOrders({ status: "completed", limit: 50 });

  const totalRevenue = categorySales?.reduce((s, c) => s + c.totalRevenue, 0) ?? 0;
  const totalOrders = categorySales?.reduce((s, c) => s + c.totalOrders, 0) ?? 0;
  const totalDrinks = categorySales?.reduce((s, c) => s + c.totalDrinks, 0) ?? 0;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-y-auto h-full">
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

        {/* Period selector */}
        <div className="flex gap-2">
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
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue", value: fmt(totalRevenue), icon: DollarSign,
            sub: `vs today: ${fmt(summary?.todayRevenue ?? 0)}`, loading: loadingCategory
          },
          {
            label: "Orders", value: totalOrders, icon: Receipt,
            sub: `Today: ${summary?.todayOrders ?? 0}`, loading: loadingCategory
          },
          {
            label: "Drinks Sold", value: totalDrinks, icon: Coffee,
            sub: `Today: ${summary?.todayDrinks ?? 0}`, loading: loadingCategory
          },
          {
            label: "Avg Order", value: fmt(avgOrder), icon: TrendingUp,
            sub: `Today avg: ${fmt(summary?.averageOrderValue ?? 0)}`, loading: loadingCategory
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
        {/* Revenue by Category bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Category — {period.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {loadingCategory ? (
                <div className="h-full bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales} barSize={40}>
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

        {/* Drink distribution pie */}
        <Card>
          <CardHeader>
            <CardTitle>Drinks Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {loadingCategory ? (
                <div className="h-full bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySales}
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
                      {categorySales?.map((_, i) => (
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
        {/* Top drinks leaderboard */}
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

        {/* Category breakdown table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown — {period.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCategory ? (
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
                    {categorySales?.map(row => (
                      <TableRow key={row.category}>
                        <TableCell className="font-medium capitalize">{row.category}</TableCell>
                        <TableCell className="text-right">{row.totalDrinks}</TableCell>
                        <TableCell className="text-right">{row.totalOrders}</TableCell>
                        <TableCell className="text-right font-bold">{fmt(row.totalRevenue)}</TableCell>
                      </TableRow>
                    ))}
                    {categorySales && categorySales.length > 0 && (
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{totalDrinks}</TableCell>
                        <TableCell className="text-right">{totalOrders}</TableCell>
                        <TableCell className="text-right">{fmt(totalRevenue)}</TableCell>
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
                {loadingOrders ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading…</TableCell>
                  </TableRow>
                ) : !orders || orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No completed orders yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map(order => (
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
    </div>
  );
}
