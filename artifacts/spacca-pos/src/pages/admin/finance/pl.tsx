import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Download, Filter, TrendingUp, TrendingDown, DollarSign, 
  PieChart as PieIcon, BarChart2, Calendar, RefreshCw, Layers, Sparkles, Percent
} from "lucide-react";
import { format } from "date-fns";
import { fmt } from "@/lib/currency";
import { handleApiResponse, parseApiError } from "@/lib/api-error";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  return handleApiResponse(res);
};

export default function PLReportsPage() {
  const { toast } = useToast();
  const [report, setReport] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState<any | null>(null);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [startDate, setStartDate] = useState(format(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");

  // Tabs & Groupings
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [trendGrouping, setTrendGrouping] = useState<"day" | "week" | "month">("day");

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);

      const [reportData, dailyPlData, branchData] = await Promise.all([
        api(`/api/finance/pl-report?${params.toString()}`),
        api(`/api/finance/pl-by-day?${params.toString()}`),
        api("/api/admin/branches")
      ]);
      setReport(reportData);
      setDailyData(dailyPlData);
      setBranches(branchData);
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: err?.message?.includes("permission") || err?.message?.includes("Denied") ? "Permission Denied" : "Failed to load report data", 
        description: parseApiError(err, "Failed to load report data") 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, startDate, endDate]);

  const exportCsv = () => {
    const headers = ["Drink Name", "Category", "Orders", "Revenue", "Cost", "Profit", "Margin %"];
    const rows = report.map(r => [
      r.name,
      r.category,
      r.totalOrders,
      r.revenue,
      r.cost,
      r.profit,
      r.margin.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pl_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReport = report.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = useMemo(() => {
    return report.reduce((acc, curr) => ({
      revenue: acc.revenue + (curr.revenue || 0),
      cost: acc.cost + (curr.cost || 0),
      profit: acc.profit + (curr.profit || 0),
    }), { revenue: 0, cost: 0, profit: 0 });
  }, [report]);

  const totalMargin = useMemo(() => {
    return totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;
  }, [totals]);

  // Client-side aggregations for category financial breakdown
  const categoryData = useMemo(() => {
    const groups: Record<string, { name: string; revenue: number; cost: number; profit: number }> = {};
    report.forEach(r => {
      const cat = r.category || "Other";
      const catKey = cat.toLowerCase().trim();
      if (!groups[catKey]) {
        groups[catKey] = { name: cat, revenue: 0, cost: 0, profit: 0 };
      }
      groups[catKey].revenue += r.revenue || 0;
      groups[catKey].cost += r.cost || 0;
      groups[catKey].profit += r.profit || 0;
    });
    return Object.values(groups).sort((a, b) => b.revenue - a.revenue);
  }, [report]);

  // Client-side daily data aggregator for day, week, month groupings
  const aggregatedTrendData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [];

    if (trendGrouping === "day") {
      return dailyData.map(d => {
        let label = d.date;
        try {
          label = format(new Date(d.date), "MMM dd");
        } catch (e) {
          // ignore
        }
        return {
          label,
          revenue: d.revenue,
          cost: d.cost,
          profit: d.profit,
        };
      });
    }

    if (trendGrouping === "week") {
      const groups: Record<string, { label: string; revenue: number; cost: number; profit: number; order: number }> = {};
      dailyData.forEach(d => {
        try {
          const date = new Date(d.date);
          const day = date.getDay();
          const diff = date.getDate() - day; // adjust to Sunday
          const sunday = new Date(date.setDate(diff));
          const weekKey = format(sunday, "yyyy-MM-dd");
          if (!groups[weekKey]) {
            groups[weekKey] = {
              label: `W/C ${format(sunday, "MMM dd")}`,
              revenue: 0,
              cost: 0,
              profit: 0,
              order: sunday.getTime(),
            };
          }
          groups[weekKey].revenue += d.revenue;
          groups[weekKey].cost += d.cost;
          groups[weekKey].profit += d.profit;
        } catch (e) {
          // ignore
        }
      });
      return Object.values(groups).sort((a, b) => a.order - b.order);
    }

    if (trendGrouping === "month") {
      const groups: Record<string, { label: string; revenue: number; cost: number; profit: number; order: number }> = {};
      dailyData.forEach(d => {
        try {
          const date = new Date(d.date);
          const monthKey = format(date, "yyyy-MM");
          if (!groups[monthKey]) {
            groups[monthKey] = {
              label: format(date, "MMM yyyy"),
              revenue: 0,
              cost: 0,
              profit: 0,
              order: date.getFullYear() * 12 + date.getMonth(),
            };
          }
          groups[monthKey].revenue += d.revenue;
          groups[monthKey].cost += d.cost;
          groups[monthKey].profit += d.profit;
        } catch (e) {
          // ignore
        }
      });
      return Object.values(groups).sort((a, b) => a.order - b.order);
    }

    return dailyData;
  }, [dailyData, trendGrouping]);

  const pieData = useMemo(() => {
    return [
      { name: "COGS (Cost)", value: totals.cost, color: "#ef4444" },
      { name: "Gross Profit", value: totals.profit, color: "#10b981" },
    ];
  }, [totals]);

  const topProfitDrivers = useMemo(() => {
    return [...report]
      .filter(r => r.revenue > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [report]);

  const topMarginProducts = useMemo(() => {
    return [...report]
      .filter(r => r.revenue > 0)
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);
  }, [report]);

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">P&L Reports</h1>
        <p className="text-muted-foreground">Detailed Profit and Loss analysis and dynamic charts per drink and category.</p>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-indigo-500" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{fmt(totals.revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Gross sales for the period</p>
          </CardContent>
        </Card>
        
        <Card className="bg-destructive/5 border-destructive/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" /> Total COGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{fmt(totals.cost)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost of Goods Sold (Ingredients)</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" /> Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-600 tracking-tight">{fmt(totals.profit)}</div>
            <p className="text-xs text-green-600 font-bold mt-1">Margin: {totalMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Shared Filters Panel */}
      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> From
              </label>
              <Input type="date" className="h-9" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> To
              </label>
              <Input type="date" className="h-9" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Search Drink / Category</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 h-9" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="dashboard" className="text-sm font-semibold">
            <BarChart2 className="h-4 w-4 mr-2" /> Financial Dashboard
          </TabsTrigger>
          <TabsTrigger value="details" className="text-sm font-semibold">
            <Layers className="h-4 w-4 mr-2" /> Detailed Report
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab Content */}
        <TabsContent value="dashboard" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Trend Area Chart Card */}
            <Card className="lg:col-span-2 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" /> Financial Performance Trend
                  </CardTitle>
                  <CardDescription>Visualizing revenue, costs, and profit over time</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg border">
                  {(["day", "week", "month"] as const).map((g) => (
                    <Button
                      key={g}
                      variant={trendGrouping === g ? "default" : "ghost"}
                      size="sm"
                      className="h-7 px-3 text-xs capitalize font-semibold"
                      onClick={() => setTrendGrouping(g)}
                    >
                      {g}ly
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  {loading ? (
                    <div className="h-full w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  ) : aggregatedTrendData.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      No data available for the selected range.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={aggregatedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          formatter={(value: number) => [fmt(value), ""]}
                          contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area name="Revenue" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area name="COGS (Cost)" type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                        <Area name="Gross Profit" type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Pie Chart Share Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-primary" /> Cost vs Profit Share
                </CardTitle>
                <CardDescription>Percentage distribution of total revenue</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="h-[220px] w-full flex items-center justify-center relative">
                  {loading ? (
                    <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                  ) : totals.revenue === 0 ? (
                    <div className="text-muted-foreground text-sm">No data</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => fmt(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-green-600">{totalMargin.toFixed(0)}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Net Margin</span>
                      </div>
                    </>
                  )}
                </div>

                {!loading && totals.revenue > 0 && (
                  <div className="w-full space-y-3 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                        <span>COGS (Cost of Ingredients)</span>
                      </div>
                      <span className="font-mono font-bold">
                        {((totals.cost / totals.revenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                        <span>Gross Profit Margin</span>
                      </div>
                      <span className="font-mono font-bold text-green-600">
                        {totalMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3. Category Breakdown Card */}
            <Card className="lg:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> Profitability by Category
                </CardTitle>
                <CardDescription>Financial performance split by drink categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  {loading ? (
                    <div className="h-full w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  ) : categoryData.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      No category data found.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} barSize={24} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: number) => fmt(value)} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar name="Revenue" dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar name="COGS (Cost)" dataKey="cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar name="Profit" dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 4. Actionable Insights Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" /> Actionable Menu Insights
                </CardTitle>
                <CardDescription>Menu optimization and profit contributors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" /> Top Profit Drivers
                  </h4>
                  {loading ? (
                    <div className="h-20 bg-muted animate-pulse rounded-lg" />
                  ) : topProfitDrivers.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {topProfitDrivers.map((d) => (
                        <div key={d.drinkId} className="flex items-center justify-between text-xs border-b pb-1.5 last:border-0 last:pb-0">
                          <div className="font-semibold truncate max-w-[150px]">{d.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{d.totalOrders} ord</span>
                            <span className="font-bold text-green-600 font-mono">{fmt(d.profit)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Percent className="h-3 w-3 text-indigo-500" /> High Margin Products
                  </h4>
                  {loading ? (
                    <div className="h-20 bg-muted animate-pulse rounded-lg" />
                  ) : topMarginProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {topMarginProducts.map((d) => (
                        <div key={d.drinkId} className="flex items-center justify-between text-xs border-b pb-1.5 last:border-0 last:pb-0">
                          <div className="font-semibold truncate max-w-[150px]">{d.name}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold">
                              {d.margin.toFixed(0)}%
                            </Badge>
                            <span className="font-bold text-primary font-mono">{fmt(d.profit)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab Content */}
        <TabsContent value="details" className="space-y-6 outline-none">
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={report.length === 0}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="rounded-md border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drink Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost (COGS)</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <span className="font-medium">Calculating margins...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredReport.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No data found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReport.map((r) => (
                    <TableRow key={r.drinkId} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold">{r.name}</TableCell>
                      <TableCell className="capitalize text-muted-foreground text-xs">{r.category}</TableCell>
                      <TableCell className="text-right">{r.totalOrders || 0}</TableCell>
                      <TableCell className="text-right font-mono font-medium">{fmt(r.revenue || 0)}</TableCell>
                      <TableCell 
                        className="text-right font-mono text-destructive cursor-pointer hover:underline hover:text-destructive/70 transition-colors"
                        onClick={() => setSelectedDrink(r)}
                      >
                        -{fmt(r.cost || 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-black text-green-600">{fmt(r.profit || 0)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={(r.margin || 0) > 50 ? "default" : (r.margin || 0) > 20 ? "secondary" : "outline"} className="font-bold">
                          {(r.margin || 0).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ingredient Details Modal */}
      <Dialog open={!!selectedDrink} onOpenChange={(open) => !open && setSelectedDrink(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cost Details: {selectedDrink?.name}</DialogTitle>
          </DialogHeader>
          <div className="rounded-md border bg-card max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Total Qty Used</TableHead>
                  <TableHead className="text-right">Cost Per Unit</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedDrink?.ingredients || selectedDrink.ingredients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No ingredient cost data available for this drink.
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedDrink.ingredients.map((ing: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{ing.name}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{ing.unit}</TableCell>
                      <TableCell className="text-right">{ing.qty.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(ing.costPerUnit)}</TableCell>
                      <TableCell className="text-right font-mono text-destructive">-{fmt(ing.totalCost)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-2 mt-2">
            <div className="text-lg font-bold">
              Total Ingredient Cost: <span className="text-destructive font-mono">-{fmt(selectedDrink?.cost || 0)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
