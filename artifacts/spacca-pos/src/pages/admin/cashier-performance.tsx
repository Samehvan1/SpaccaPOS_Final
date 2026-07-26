import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { fmt, pure } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { format, differenceInSeconds } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Users, TrendingUp, ShoppingBag, CreditCard, Banknote, Wallet, Clock, Calendar, BarChart2, Gift, Receipt, User } from "lucide-react";
import { Link } from "wouter";

const API = (path: string) => fetch(path, { credentials: "include" }).then(r => {
  if (!r.ok) throw new Error("API error");
  return r.json();
});

type CashierUser = { id: number; name: string; role: string };
type Performance = {
  cashier: CashierUser | null;
  totalOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  walletRevenue: number;
  avgOrderValue: number;
};
type Session = {
  id: number;
  cashierId: number;
  cashierName: string;
  startedAt: string;
  endedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
};

function parseUA(ua: string | null) {
  if (!ua) return "Unknown";
  if (ua.includes("Mobile")) return "Mobile Device";
  if (ua.includes("Windows")) return "Windows PC";
  if (ua.includes("Macintosh")) return "Mac";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone")) return "iPhone";
  return "Desktop";
}


function durationStr(start: string, end: string | null) {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || isNaN(seconds)) return "-";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CashierPerformancePage() {
  const { toast } = useToast();
  const { selectedBranchId } = useAuth();
  const [cashiers, setCashiers] = useState<CashierUser[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<string>("all");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingSessionStats, setViewingSessionStats] = useState<any>(null);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  // Filters actually applied on clicking "Apply"
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    cashierId: "all"
  });

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersStatus, setOrdersStatus] = useState<string>("all");
  const rowsPerPage = 50;

  useEffect(() => {
    API("/api/cashier/list").then(setCashiers).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (selectedCashier !== "all") params.set("cashierId", selectedCashier);

      const [sessionsData] = await Promise.all([
        API(`/api/cashier/sessions?${params}`),
      ]);
      setSessions(sessionsData);
      setAppliedFilters({ startDate, endDate, cashierId: selectedCashier });
      setOrdersPage(1);
    } catch {
      toast({ variant: "destructive", title: "Failed to load data" });
    } finally { setLoading(false); }
  }, [selectedCashier, startDate, endDate, toast]);

  const loadSessionStats = async (sessionId: number) => {
    try {
      const data = await API(`/api/cashier/sessions/${sessionId}/performance`);
      setViewingSessionStats(data);
      setIsStatsDialogOpen(true);
    } catch {
      toast({ variant: "destructive", title: "Failed to load session stats" });
    }
  };

  useEffect(() => {
    if (cashiers.length > 0) load();
  }, [cashiers]);

  const performances = useMemo<Performance[]>(() => {
    const map = new Map<number, Performance>();
    for (const s of sessions) {
      const cid = s.cashierId;
      if (!map.has(cid)) {
        map.set(cid, {
          cashier: { id: cid, name: s.cashierName || "Unknown", role: "cashier" },
          totalOrders: 0,
          totalRevenue: 0,
          cashRevenue: 0,
          cardRevenue: 0,
          walletRevenue: 0,
          avgOrderValue: 0,
        });
      }
      const p = map.get(cid)!;
      p.totalOrders += (s as any).totalOrders || 0;
      p.totalRevenue += (s as any).totalRevenue || 0;
      p.cashRevenue += (s as any).cashRevenue || 0;
      p.cardRevenue += (s as any).cardRevenue || 0;
      p.walletRevenue += (s as any).walletRevenue || 0;
    }
    
    return Array.from(map.values()).map(p => ({
      ...p,
      avgOrderValue: p.totalOrders > 0 ? p.totalRevenue / p.totalOrders : 0
    }));
  }, [sessions]);

  const totalRevenue = useMemo(() => sessions.reduce((s, p: any) => s + (p.totalRevenue || 0), 0), [sessions]);
  const totalOrders = useMemo(() => sessions.reduce((s, p: any) => s + (p.totalOrders || 0), 0), [sessions]);
  const totalCash = useMemo(() => sessions.reduce((s, p: any) => s + (p.cashRevenue || 0), 0), [sessions]);
  const totalCard = useMemo(() => sessions.reduce((s, p: any) => s + (p.cardRevenue || 0), 0), [sessions]);

  // Fetch orders of the filtered cashier sessions
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["cashier-sessions-orders", appliedFilters, ordersStatus, ordersPage, selectedBranchId],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        cashierId: appliedFilters.cashierId,
        status: ordersStatus === "active"
          ? "pending,paid,completed,ready,in_progress"
          : (ordersStatus === "all"
              ? "pending,paid,completed,ready,in_progress,cancelled,refunded"
              : ordersStatus),
        limit: String(rowsPerPage),
        offset: String((ordersPage - 1) * rowsPerPage),
      });
      if (selectedBranchId) params.append("branchId", String(selectedBranchId));

      const res = await fetch(`/api/cashier/sessions/orders?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("API error");
      const totalCount = parseInt(res.headers.get("X-Total-Count") || "0", 10);
      const data = await res.json();
      return { orders: data, totalCount };
    }
  });

  const orders = ordersData?.orders || [];
  const totalCount = ordersData?.totalCount || 0;

  return (
    <div className="p-6 w-full overflow-y-auto h-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Cashier Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Track individual cashier activity, revenue, and shift history</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="grid gap-1.5">
              <Label>Cashier</Label>
              <Select value={selectedCashier} onValueChange={setSelectedCashier}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Cashiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cashiers</SelectItem>
                  {cashiers.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>From</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-[160px]" />
            </div>
            <div className="grid gap-1.5">
              <Label>To</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-[160px]" />
            </div>
            <Button onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(totalRevenue)} icon={TrendingUp} color="bg-green-500/10 text-green-500" />
        <StatCard label="Total Orders" value={String(totalOrders)} icon={ShoppingBag} color="bg-blue-500/10 text-blue-500" />
        <StatCard label="Cash Revenue" value={fmt(totalCash)} icon={Banknote} color="bg-amber-500/10 text-amber-500" />
        <StatCard label="Card Revenue" value={fmt(totalCard)} icon={CreditCard} color="bg-purple-500/10 text-purple-500" />
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance" className="gap-2"><BarChart2 className="h-4 w-4" /> Performance</TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2"><Clock className="h-4 w-4" /> Session History</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><ShoppingBag className="h-4 w-4" /> Session Orders</TabsTrigger>
        </TabsList>

        {/* Per-Cashier Performance Table */}
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cashier Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Cash</TableHead>
                    <TableHead className="text-right">Card</TableHead>
                    <TableHead className="text-right">Avg. Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performances.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No data found</TableCell></TableRow>
                  ) : performances.filter(p => p.totalOrders > 0 || selectedCashier !== "all").map(p => (
                    <TableRow key={p.cashier?.id ?? "unknown"}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                            {p.cashier?.name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          {p.cashier?.name ?? "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{p.totalOrders}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">{fmt(p.totalRevenue)}</TableCell>
                      <TableCell className="text-right text-amber-600">{fmt(p.cashRevenue)}</TableCell>
                      <TableCell className="text-right text-purple-600">{fmt(p.cardRevenue)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{fmt(p.avgOrderValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session History */}
        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shift History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Ended</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No sessions found</TableCell></TableRow>
                  ) : sessions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                            {s.cashierName?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          {s.cashierName}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(s.startedAt).toLocaleString("en-EG", { dateStyle: "short", timeStyle: "short" })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.endedAt
                          ? new Date(s.endedAt).toLocaleString("en-EG", { dateStyle: "short", timeStyle: "short" })
                          : <span className="text-muted-foreground">Active</span>}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {durationStr(s.startedAt, s.endedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {s.ipAddress || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {parseUA(s.userAgent)}
                      </TableCell>
                      <TableCell>

                        <Badge variant={s.endedAt ? "secondary" : "default"} className={s.endedAt ? "" : "bg-green-500/20 text-green-600 border-green-500/30"}>
                          {s.endedAt ? "Ended" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={() => loadSessionStats(s.id)}>
                          <BarChart2 className="h-3.5 w-3.5" /> Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Orders */}
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Shift Orders</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={ordersStatus} onValueChange={(val) => { setOrdersStatus(val); setOrdersPage(1); }}>
                  <SelectTrigger className="w-[150px] bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Orders</SelectItem>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Session (Cashier • Shift Start)</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead className="text-center font-bold">Items</TableHead>
                      <TableHead className="text-right font-bold">Total Price</TableHead>
                      <TableHead className="text-right font-bold">Before Tax</TableHead>
                      <TableHead className="text-right font-bold text-muted-foreground">Tax</TableHead>
                      <TableHead className="text-right font-bold text-destructive">Discount</TableHead>
                      <TableHead className="text-right font-bold">Net Price</TableHead>
                      <TableHead className="text-right font-bold text-primary">Total Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingOrders ? (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center py-20">
                          <div className="flex flex-col items-center gap-2">
                            <BarChart2 className="h-8 w-8 text-primary animate-pulse" />
                            <span className="text-muted-foreground font-medium">Loading orders...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center py-20 text-muted-foreground font-medium">
                          No orders found for the selected session range.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order: any) => {
                        const totalPrice = order.subtotal;
                        const beforeTax = totalPrice / 1.14;
                        const taxAmount = totalPrice - beforeTax;
                        const discountAmt = order.discount;
                        const offerDiscountAmt = order.offerDiscount ? Number(order.offerDiscount) : 0;
                        const totalDiscountAmt = discountAmt + offerDiscountAmt;
                        const subtotalPrice = beforeTax - totalDiscountAmt;
                        const finalPrice = subtotalPrice + taxAmount;

                        return (
                          <TableRow key={order.id} className="hover:bg-muted/30">
                            <TableCell
                              className="font-medium text-primary underline cursor-pointer hover:text-primary/70 transition-colors"
                              onClick={() => setSelectedOrderDetails(order)}
                            >
                              {order.id}
                            </TableCell>
                            <TableCell className="font-semibold text-xs text-muted-foreground whitespace-nowrap">
                              {order.sessionLabel}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-EG", { dateStyle: "short" }) : "—"}
                            </TableCell>
                            <TableCell>
                              {order.createdAt ? new Date(order.createdAt).toLocaleTimeString("en-EG", { timeStyle: "short" }) : "—"}
                            </TableCell>
                            <TableCell className="font-mono font-bold">#{order.orderNumber}</TableCell>
                            <TableCell className="text-center">{(order.items || []).length}</TableCell>
                            <TableCell className="text-right">{pure(totalPrice)}</TableCell>
                            <TableCell className="text-right">{pure(beforeTax)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{pure(taxAmount)}</TableCell>
                            <TableCell className="text-right font-medium text-destructive">
                              {discountAmt > 0 && <div>Coupon: -{pure(discountAmt)}</div>}
                              {offerDiscountAmt > 0 && <div>Offer: -{pure(offerDiscountAmt)}</div>}
                              {discountAmt === 0 && offerDiscountAmt === 0 && "0.00"}
                            </TableCell>
                            <TableCell className="text-right">{pure(subtotalPrice)}</TableCell>
                            <TableCell className="text-right font-black text-primary">{pure(finalPrice)}</TableCell>
                            <TableCell>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                                order.status === "completed" || order.status === "paid" || order.status === "ready"
                                  ? "bg-green-500/20 text-green-600 border-green-500/30"
                                  : order.status === "pending" || order.status === "preparing"
                                  ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-600 border-red-500/30"
                              }`}>
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
              
              {!loadingOrders && orders.length > 0 && (() => {
                const totalPages = Math.ceil(totalCount / rowsPerPage);
                return (
                  <div className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4 w-full border-t">
                    <p className="text-xs text-muted-foreground font-semibold">
                      Showing Page {ordersPage} of {totalPages || 1} ({totalCount} total orders) • Calculations based on 14% VAT. Before Tax = Gross / 1.14.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                        disabled={ordersPage === 1 || loadingOrders}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrdersPage(p => p + 1)}
                        disabled={loadingOrders || ordersPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrderDetails} onOpenChange={(open) => !open && setSelectedOrderDetails(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Order Details — #{selectedOrderDetails?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Transaction ID: {selectedOrderDetails?.id} | Date: {selectedOrderDetails?.createdAt && format(new Date(selectedOrderDetails.createdAt), "PPP p")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status & Payment</p>
                 <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="capitalize">{selectedOrderDetails?.status}</Badge>
                    <Badge variant="outline" className="capitalize bg-primary/5">{selectedOrderDetails?.paymentMethod}</Badge>
                    <Badge variant="outline" className="capitalize border-primary/20 text-primary">{selectedOrderDetails?.source || "POS"}</Badge>
                 </div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Customer</p>
                <div className="flex items-center gap-2">
                   <User className="h-4 w-4 text-primary" />
                   <span className="text-sm font-bold truncate">
                     {selectedOrderDetails?.customerName || "Walk-in Guest"}
                     {selectedOrderDetails?.customerPhone && (
                       <span className="text-xs text-muted-foreground font-normal ml-1 block md:inline">
                         ({selectedOrderDetails.customerPhone})
                       </span>
                     )}
                   </span>
                </div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Completion Duration</p>
                <div className="flex items-center gap-2">
                   <Clock className="h-4 w-4 text-primary" />
                   <span className="font-mono font-bold">
                     {selectedOrderDetails?.createdAt && selectedOrderDetails?.completedAt 
                       ? formatDuration(differenceInSeconds(new Date(selectedOrderDetails.completedAt), new Date(selectedOrderDetails.createdAt)))
                       : "In Progress / Cancelled"}
                   </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs uppercase font-bold">Drink Item</TableHead>
                    <TableHead className="text-center text-xs uppercase font-bold">Qty</TableHead>
                    <TableHead className="text-right text-xs uppercase font-bold">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrderDetails?.items?.map((item: any, i: number) => (
                    <TableRow key={i} className={`hover:bg-transparent ${item.status === 'refunded' ? "opacity-50 line-through bg-red-500/5" : ""}`}>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{item.drinkName}</p>
                          {item.status === 'refunded' && <Badge variant="destructive" className="text-[8px] h-4">REFUNDED</Badge>}
                        </div>
                        {item.customizations?.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {item.customizations.map((c: any) => c.optionLabel).join(", ")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">x{item.quantity}</TableCell>
                      <TableCell className="text-right font-bold">{pure(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={2} className="text-right font-medium">Subtotal</TableCell>
                    <TableCell className="text-right font-bold">{pure(selectedOrderDetails?.subtotal)}</TableCell>
                  </TableRow>
                  {selectedOrderDetails?.offerDiscount > 0 && (
                    <TableRow className="bg-muted/20 border-t-0 text-destructive">
                      <TableCell colSpan={2} className="text-right font-medium text-destructive">Offer Discount</TableCell>
                      <TableCell className="text-right font-bold text-destructive">-{pure(selectedOrderDetails.offerDiscount)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-muted/20 border-t-0">
                    <TableCell colSpan={2} className="text-right font-medium text-destructive">Discount</TableCell>
                    <TableCell className="text-right font-bold text-destructive">-{pure(selectedOrderDetails?.discount)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-primary/5 border-t-2 border-primary/20">
                    <TableCell colSpan={2} className="text-right font-black text-primary">Total Paid</TableCell>
                    <TableCell className="text-right font-black text-primary text-lg">{fmt(selectedOrderDetails?.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 p-3 rounded-xl border border-dashed border-muted-foreground/20 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Payment Breakdown</p>
                {selectedOrderDetails?.payments && selectedOrderDetails.payments.length > 0 ? (
                  selectedOrderDetails.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center text-xs">
                      <span className="capitalize font-bold text-muted-foreground">{p.paymentMethod}</span>
                      <span className="font-black text-foreground">{fmt(p.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center text-xs">
                    <span className="capitalize font-bold text-muted-foreground">{selectedOrderDetails?.paymentMethod}</span>
                    <span className="font-black text-foreground">{fmt(selectedOrderDetails?.total)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedOrderDetails(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Shift Summary
            </DialogTitle>
          </DialogHeader>
          {viewingSessionStats && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground">Cashier</span>
                <span className="font-bold">{viewingSessionStats.cashierName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Revenue</div>
                  <div className="text-xl font-black text-green-600">{fmt(viewingSessionStats.totalRevenue)}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Orders</div>
                  <div className="text-xl font-black text-blue-600">{viewingSessionStats.totalOrders}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="flex items-center gap-2"><Banknote className="h-3.5 w-3.5 opacity-60" /> Cash</span>
                  <div className="text-right">
                    <span className="font-semibold">{fmt(viewingSessionStats.cashRevenue)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-bold">({viewingSessionStats.cashOrders || 0} orders)</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 opacity-60" /> Card</span>
                  <div className="text-right">
                    <span className="font-semibold">{fmt(viewingSessionStats.cardRevenue)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-bold">({viewingSessionStats.cardOrders || 0} orders)</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5 opacity-60" /> Wallet</span>
                  <div className="text-right">
                    <span className="font-semibold">{fmt(viewingSessionStats.walletRevenue)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-bold">({viewingSessionStats.walletOrders || 0} orders)</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="flex items-center gap-2 text-pink-600"><Gift className="h-3.5 w-3.5 opacity-60" /> Hospitality</span>
                  <div className="text-right">
                    <span className="font-semibold text-pink-600">{fmt(viewingSessionStats.hospitalityRevenue)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-bold">({viewingSessionStats.hospitalityOrders || 0} orders)</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t mt-2">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Start: {new Date(viewingSessionStats.startedAt).toLocaleString()}</span>
                  {viewingSessionStats.endedAt && <span>End: {new Date(viewingSessionStats.endedAt).toLocaleTimeString()}</span>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setIsStatsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
