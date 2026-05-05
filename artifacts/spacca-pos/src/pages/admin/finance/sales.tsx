import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart2, TrendingUp, Coffee, Receipt, 
  Banknote, Calendar, ChevronLeft, ChevronRight,
  Download, Tag, CheckCircle2, History
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";
import { fmt, pure } from "@/lib/currency";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function SalesAnalysisPage() {
  const { toast } = useToast();
  const { selectedBranchId } = useAuth();
  
  const [reportStartDate, setReportStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [reportEndDate, setReportEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reportPage, setReportPage] = useState(1);
  const [isDailyGrouped, setIsDailyGrouped] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(selectedBranchId ? String(selectedBranchId) : "all");
  
  const [orders, setOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const rowsPerPage = 50;

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: reportStartDate,
        endDate: reportEndDate,
        status: "paid,completed,ready,in_progress",
        limit: String(rowsPerPage),
        offset: String((reportPage - 1) * rowsPerPage)
      });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);

      const [orderData, summaryData, branchData] = await Promise.all([
        api(`/api/orders?${params.toString()}`),
        api(`/api/dashboard/sales-by-category?${params.toString()}`),
        api("/api/admin/branches")
      ]);
      setOrders(orderData);
      setSummary(summaryData);
      setBranches(branchData);

      if (isDailyGrouped) {
        const dailyData = await api(`/api/dashboard/sales-by-day?${params.toString()}`);
        setDailySummary(dailyData);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load sales data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reportStartDate, reportEndDate, reportPage, isDailyGrouped, selectedBranch]);

  const totals = useMemo(() => {
    const revenue = summary?.reduce((s, c) => s + c.totalRevenue, 0) ?? 0;
    const count = summary?.reduce((s, c) => s + c.totalOrders, 0) ?? 0;
    const drinks = summary?.reduce((s, c) => s + c.totalDrinks, 0) ?? 0;
    const discounts = orders?.reduce((s, o) => s + (o as any).discount, 0) || 0;
    return { revenue, count, drinks, discounts };
  }, [summary, orders]);

  const handleExportCSV = () => {
    const headers = ["OrderID", "Date", "Time", "Order Number", "Subtotal", "Discount", "Total", "Status", "Payment"];
    const rows = orders.map(o => [
      o.id,
      format(new Date(o.createdAt), "yyyy-MM-dd"),
      format(new Date(o.createdAt), "HH:mm"),
      `#${o.orderNumber}`,
      o.subtotal,
      o.discount,
      o.total,
      o.status,
      o.paymentMethod
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${reportStartDate}_to_${reportEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Sales Analysis</h1>
        <p className="text-muted-foreground">Comprehensive sales reports and transaction history.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 h-10">
              <Switch checked={isDailyGrouped} onCheckedChange={setIsDailyGrouped} id="daily-grp" />
              <Label htmlFor="daily-grp" className="cursor-pointer">Group by Day</Label>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2 w-full" onClick={handleExportCSV}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: fmt(totals.revenue), icon: Banknote },
          { label: "Orders", value: totals.count, icon: Receipt },
          { label: "Drinks", value: totals.drinks, icon: Coffee },
          { label: "Discounts", value: fmt(totals.discounts), icon: Tag },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-md border bg-card">
        {isDailyGrouped ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Net Revenue</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Final Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailySummary.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-bold">{day.date}</TableCell>
                  <TableCell className="text-right">{day.orders}</TableCell>
                  <TableCell className="text-right">{fmt(day.net)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmt(day.tax)}</TableCell>
                  <TableCell className="text-right text-destructive">-{fmt(day.discount)}</TableCell>
                  <TableCell className="text-right font-bold text-primary">{fmt(day.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">Loading orders...</TableCell>
                </TableRow>
              ) : orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">#{order.orderNumber}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(order.createdAt), "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell>{fmt(order.subtotal)}</TableCell>
                  <TableCell className="text-destructive">-{fmt(order.discount)}</TableCell>
                  <TableCell className="font-bold">{fmt(order.total)}</TableCell>
                  <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"} className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!isDailyGrouped && (
        <div className="flex justify-center gap-2 pb-10">
          <Button variant="outline" onClick={() => setReportPage(p => Math.max(1, p - 1))} disabled={reportPage === 1}>
            Previous
          </Button>
          <div className="flex items-center px-4 font-medium text-sm">Page {reportPage}</div>
          <Button variant="outline" onClick={() => setReportPage(p => p + 1)} disabled={orders.length < rowsPerPage}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
