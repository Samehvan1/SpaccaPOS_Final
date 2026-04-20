import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useGetDashboardSummary, useGetSalesByCategory, useGetTopDrinks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Coffee, Receipt, AlertTriangle, TrendingUp, ArrowLeft } from "lucide-react";
import { fmt, CURRENCY } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "wouter";

export default function FinanceDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    setLocation("/pos");
    return null;
  }

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: categorySales, isLoading: isLoadingSales } = useGetSalesByCategory({ days: 7 });
  const { data: topDrinks, isLoading: isLoadingTop } = useGetTopDrinks({ limit: 5 });

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Finance & Sales
          </h1>
          <p className="text-muted-foreground mt-1">Overview of today's performance and weekly trends.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <div className="h-8 bg-muted animate-pulse rounded" /> : (
              <div className="text-3xl font-bold">{fmt(summary?.todayRevenue ?? 0)}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <div className="h-8 bg-muted animate-pulse rounded" /> : (
              <div className="text-3xl font-bold">{summary?.todayOrders || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drinks Sold</CardTitle>
            <Coffee className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <div className="h-8 bg-muted animate-pulse rounded" /> : (
              <div className="text-3xl font-bold">{summary?.todayDrinks || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <div className="h-8 bg-muted animate-pulse rounded" /> : (
              <div className="text-3xl font-bold">{fmt(summary?.averageOrderValue ?? 0)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales by Category (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoadingSales ? (
                <div className="w-full h-full bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${CURRENCY}${value.toFixed(2)}`, 'Revenue']}
                      cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    />
                    <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Drinks List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Drinks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTop ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {topDrinks?.map((drink, index) => (
                  <div key={drink.drinkId} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-muted-foreground w-4">{index + 1}.</div>
                      <div>
                        <div className="font-semibold">{drink.drinkName}</div>
                        <div className="text-xs text-muted-foreground">{drink.totalSold} sold</div>
                      </div>
                    </div>
                    <div className="font-bold text-primary">{fmt(drink.totalRevenue)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {summary && summary.lowStockCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Inventory Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              You have {summary.lowStockCount} ingredients running low on stock.
            </div>
            <Button variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive hover:text-white" asChild>
              <Link href="/admin/stock">Review Stock</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
