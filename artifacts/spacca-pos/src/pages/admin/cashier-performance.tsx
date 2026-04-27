import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { fmt } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, TrendingUp, ShoppingBag, CreditCard, Banknote, Wallet, Clock, Calendar, BarChart2 } from "lucide-react";
import { Link } from "wouter";

const API = (path: string) => fetch(path).then(r => r.json());

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
};

function durationStr(start: string, end: string | null) {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
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
  const [cashiers, setCashiers] = useState<CashierUser[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<string>("all");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

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

      const targetIds = selectedCashier !== "all"
        ? [parseInt(selectedCashier)]
        : cashiers.map(c => c.id);

      const perfs = await Promise.all(
        targetIds.map(id =>
          API(`/api/cashier/performance/${id}?startDate=${startDate}&endDate=${endDate}`)
        )
      );
      setPerformances(perfs);
    } catch {
      toast({ variant: "destructive", title: "Failed to load data" });
    } finally { setLoading(false); }
  }, [selectedCashier, startDate, endDate, cashiers, toast]);

  useEffect(() => {
    if (cashiers.length > 0) load();
  }, [cashiers]);

  const totalRevenue = performances.reduce((s, p) => s + p.totalRevenue, 0);
  const totalOrders = performances.reduce((s, p) => s + p.totalOrders, 0);
  const totalCash = performances.reduce((s, p) => s + p.cashRevenue, 0);
  const totalCard = performances.reduce((s, p) => s + p.cardRevenue, 0);

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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No sessions found</TableCell></TableRow>
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
                      <TableCell>
                        <Badge variant={s.endedAt ? "secondary" : "default"} className={s.endedAt ? "" : "bg-green-500/20 text-green-600 border-green-500/30"}>
                          {s.endedAt ? "Ended" : "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
