import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, TrendingDown, DollarSign, Coffee, 
  Receipt, Package, AlertTriangle, ArrowRight 
} from "lucide-react";
import { Link } from "wouter";
import { fmt } from "@/lib/currency";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from "recharts";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function FinanceDashboard() {
  const { selectedBranchId } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [salesByDay, setSalesByDay] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBranchId) params.append("branchId", String(selectedBranchId));
      params.append("days", "7");
      
      const queryStr = params.toString();
      const [summaryData, salesData] = await Promise.all([
        api(`/api/dashboard/summary?${queryStr}`),
        api(`/api/dashboard/sales-by-day?${queryStr}`)
      ]);
      setSummary(summaryData);
      setSalesByDay(salesData);
    } catch (err) {
      console.error("Dashboard error:", err);
      toast({ variant: "destructive", title: "Failed to load dashboard" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
        <p className="text-muted-foreground">High-level financial overview and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(summary?.todayRevenue ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cash: {fmt(summary?.todayCashRevenue ?? 0)} | Card: {fmt(summary?.todayCardRevenue ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.todayOrders ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Average: {fmt(summary?.averageOrderValue ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drinks Sold</CardTitle>
            <Coffee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.todayDrinks ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total items prepared today</p>
          </CardContent>
        </Card>
        <Card className={summary?.lowStockCount > 0 ? "border-destructive bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${summary?.lowStockCount > 0 ? "text-destructive" : "text-primary"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary?.lowStockCount > 0 ? "text-destructive" : ""}`}>
              {summary?.lowStockCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Items below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v: any) => fmt(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="justify-between h-14" asChild>
              <Link href="/admin/finance/stock-movement">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Package className="h-5 w-5 text-primary" /></div>
                  <div className="text-left">
                    <div className="font-bold">Stock Movement</div>
                    <div className="text-xs text-muted-foreground">Track inventory ins and outs</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between h-14" asChild>
              <Link href="/admin/finance/sales">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="h-5 w-5 text-primary" /></div>
                  <div className="text-left">
                    <div className="font-bold">Sales Analysis</div>
                    <div className="text-xs text-muted-foreground">Detailed transaction reports</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between h-14" asChild>
              <Link href="/admin/finance/pl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><DollarSign className="h-5 w-5 text-primary" /></div>
                  <div className="text-left">
                    <div className="font-bold">P&L Reports</div>
                    <div className="text-xs text-muted-foreground">Profit and margin analysis</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
