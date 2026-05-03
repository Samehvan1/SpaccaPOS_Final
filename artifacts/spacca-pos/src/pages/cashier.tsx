import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Calculator, ClipboardList, User, ListChecks, CreditCard, Banknote, Wallet, Receipt, Printer, FileText, LogOut, Clock, ShoppingBag, TrendingUp, Lock, RotateCcw, Search, History } from "lucide-react";
import { fmt } from "@/lib/currency";
import { printCustomerReceipt, printAgentReceipts } from "@/components/receipt-printer";
import { useSettings } from "@/hooks/use-settings";
import { useGetActiveOrders, useUpdateOrderStatus, useListOrders } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PosTerminal from "./pos";
import { useOrderEvents } from "@/hooks/use-order-events";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type CashierUser = { id: number; name: string; role: string };
type ActiveSession = { sessionId: number; cashier: CashierUser; startedAt: string } | null;

function useCashierSession() {
  const [session, setSession] = useState<ActiveSession>(null);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    try {
      const res = await fetch(`${API_BASE}/cashier/active`, { credentials: "include" });
      const data = await res.json();
      setSession(data);
    } catch { setSession(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchActive(); }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/cashier/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Login failed");
    const data = await res.json();
    setSession(data);
    return data;
  };

  const endSession = async () => {
    await fetch(`${API_BASE}/cashier/end-session`, { method: "POST", credentials: "include" });
    setSession(null);
  };

  return { session, loading, login, endSession, refetch: fetchActive };
}

function formatDuration(startedAt: string) {
  const ms = Date.now() - new Date(startedAt).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

import { Label } from "@/components/ui/label";

function CashierPinLogin({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { login } = useCashierSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      await login(username, password);
      onSuccess();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Login Failed", description: e.message });
      setPassword("");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-cyan/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-green/5 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 mb-2">
            <Lock className="h-8 w-8 text-neon-cyan" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Cashier <span className="text-neon-cyan">Shift Login</span></h1>
          <p className="text-muted-foreground text-sm font-medium">Enter your credentials to start your shift</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 bg-white/5 border-white/10 focus:border-neon-cyan/50 rounded-xl"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-white/5 border-white/10 focus:border-neon-cyan/50 rounded-xl"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base font-black uppercase tracking-widest rounded-2xl bg-neon-green/20 hover:bg-neon-green text-neon-green hover:text-background border border-neon-green/40 transition-all duration-300 glow-green"
            disabled={!username || !password || loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="h-5 w-5 mr-2" /> Start Shift</>}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function CashierPage() {
  const { toast } = useToast();
  const { selectedBranchId } = useAuth();
  const queryClient = useQueryClient();
  const { autoPrintCustomer, autoPrintAgent } = useSettings();
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<any>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState<number | null>(null);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);
  const [isRefundItemsOpen, setIsRefundItemsOpen] = useState(false);
  const [selectedRefundItems, setSelectedRefundItems] = useState<Set<number>>(new Set());
  const [recentSearch, setRecentSearch] = useState("");
  const { session, loading: sessionLoading, endSession, refetch } = useCashierSession();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useOrderEvents();

  const { data: orders = [], isLoading } = useGetActiveOrders(
    { status: "pending" as any, branchId: selectedBranchId || undefined },
    { query: { refetchInterval: 5000 } as any } as any
  );

  const { data: recentOrders = [], refetch: refetchRecent } = useListOrders(
    { limit: 20, status: "paid,completed,ready,in_progress,refunded" as any, branchId: selectedBranchId || undefined },
    { query: { refetchInterval: 10000 } as any } as any
  );

  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const handlePrintAll = (order: any) => {
    printCustomerReceipt(order);
    printAgentReceipts(order);
  };

  const handleRefundAuth = async () => {
    if (!refundOrderId || !adminPin) return;
    setIsRefunding(true);
    try {
      // Verify PIN by calling a dummy or small check (or just wait for items dialog)
      const res = await fetch(`${API_BASE}/auth/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin }),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Verification failed");
      
      setIsAdminAuthOpen(false);
      setIsRefundItemsOpen(true);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: e.message });
      setAdminPin("");
    } finally {
      setIsRefunding(false);
    }
  };

  const handleFinalRefund = async () => {
    if (!refundOrderId || !adminPin) return;
    setIsRefunding(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${refundOrderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adminPin, 
          returnToStockItems: Array.from(selectedRefundItems) 
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Refund failed");
      toast({ title: "Order Refunded", description: "The order has been marked as refunded." });
      setIsRefundItemsOpen(false);
      setAdminPin("");
      setRefundOrderId(null);
      setSelectedRefundItems(new Set());
      refetchRecent();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Refund Error", description: e.message });
    } finally {
      setIsRefunding(false);
    }
  };

  const handleUpdateStatus = (orderId: any, status: string) => {
    const currentOrder = orders.find((o: any) => o.id === orderId);
    updateStatus(
      { id: orderId as any, data: { status: status as any, cashierId: session?.cashier?.id } as any },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/active-orders"] });
          if (status === "paid") {
            toast({ title: "Order Approved", description: `Order ${data.orderNumber} sent to KDS.` });
            const fullOrderData = { ...currentOrder, ...data, items: (data as any).items || currentOrder?.items || [] };
            setCompletedOrder(fullOrderData);
            setIsReceiptOpen(true);
            if (autoPrintCustomer) printCustomerReceipt(fullOrderData as any);
            if (autoPrintAgent) printAgentReceipts(fullOrderData as any);
          } else if (status === "cancelled") {
            toast({ title: "Order Cancelled", description: `Order ${data.orderNumber} cancelled.` });
          }
        },
        onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update order." }),
      }
    );
  };

  const handleEndSession = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_BASE}/cashier/sessions/${session.sessionId}/performance`, { credentials: "include" });
      const data = await res.json();
      setShiftSummary(data);
      setIsSummaryOpen(true);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not load shift summary." });
    }
  };

  const confirmEndSession = async () => {
    await endSession();
    setIsSummaryOpen(false);
    setShiftSummary(null);
    toast({ title: "Shift Ended", description: "Your session has been closed." });
  };

  if (sessionLoading) {
    return <div className="flex-1 flex items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-neon-cyan" /></div>;
  }

  if (!session) {
    return <CashierPinLogin onSuccess={refetch} />;
  }

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-neon-cyan" /></div>;
  }

  const sortedOrders = [...orders].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const heroOrder = sortedOrders[0];
  const remainingOrders = sortedOrders.slice(1);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-green/5 blur-[120px] pointer-events-none rounded-full" />

      <Tabs defaultValue="approvals" className="flex flex-col">
        <div className="bg-background/40 backdrop-blur-md border-b border-white/5 px-6 h-16 shrink-0 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black tracking-tighter text-foreground uppercase">
              Cashier <span className="text-neon-green">Approval</span>
            </h1>
            <TabsList className="bg-white/5 border border-white/10 p-1 h-10">
              <TabsTrigger value="approvals" className="gap-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-neon-cyan">
                <ClipboardList className="h-4 w-4" />
                Approvals {orders.length > 0 && <span className="ml-1 px-1.5 py-0 rounded-full bg-neon-cyan/20 text-neon-cyan text-[10px] font-black">{orders.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-amber-400">
                <History className="h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="terminal" className="gap-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-neon-green">
                <Calculator className="h-4 w-4" />
                Terminal
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Cashier Session Info */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <User className="h-4 w-4 text-neon-cyan" />
              <span className="text-sm font-bold">{session.cashier.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatDuration(session.startedAt)}
              </span>
            </div>
            <button
              onClick={handleEndSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-bold transition-all"
            >
              <LogOut className="h-3.5 w-3.5" /> End Shift
            </button>
          </div>
        </div>

        <TabsContent value="approvals" className="h-[calc(100vh-104px)] overflow-y-auto m-0 p-0">
            <div className="max-w-[1600px] mx-auto p-4 space-y-4">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[70vh] text-muted-foreground animate-in fade-in zoom-in duration-500">
                  <div className="relative">
                    <Check className="h-24 w-24 mb-6 opacity-20 text-neon-green" />
                    <div className="absolute inset-0 bg-neon-green/10 blur-2xl rounded-full" />
                  </div>
                  <p className="text-3xl font-black tracking-tighter text-foreground/50">QUEUE CLEAR</p>
                  <p className="text-sm font-medium mt-2 tracking-widest uppercase">Everything has been processed</p>
                </div>
              ) : (
                <>
                  {heroOrder && (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest text-neon-cyan flex items-center gap-2">
                          <span className="w-8 h-[2px] bg-neon-cyan" />Next in queue
                        </h2>
                        <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5">TOP PRIORITY</Badge>
                      </div>
                      <Card className="glass-card overflow-hidden border-neon-green/30 ring-1 ring-neon-green/10 rounded-3xl">
                        <CardContent className="p-0">
                          <div className="flex flex-col lg:flex-row">
                            <div className="flex-1 p-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Order</label>
                                  <div className="text-4xl font-black tracking-tighter neon-text-cyan">#{heroOrder.orderNumber}</div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Customer</label>
                                  <div className="text-xl font-bold truncate">{heroOrder.customerName || "Walk-in Guest"}</div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] mb-1 block">Amount Due</label>
                                  <div className="text-4xl font-black tracking-tighter text-neon-green">{fmt(heroOrder.total)}</div>
                                </div>
                              </div>
                              <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-8 items-start">
                                <div className="min-w-[140px]">
                                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Payment</label>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/20">
                                      <CreditCard className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-tight">{heroOrder.paymentMethod || "Pending"}</span>
                                  </div>
                                </div>
                                <div className="hidden md:block w-[1px] h-12 bg-white/10 self-center" />
                                <div className="flex-1">
                                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Items</label>
                                  <div className="flex flex-wrap gap-2">
                                    {heroOrder.items.map((item: any) => (
                                      <div key={item.id} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                        <span className="w-5 h-5 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                                        <span className="text-xs font-bold">{item.drinkName}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-full lg:w-auto bg-white/[0.02] border-t lg:border-t-0 lg:border-l border-white/5 p-8 flex flex-row gap-6 items-center justify-center lg:min-w-[480px]">
                              <Button
                                className="w-44 h-44 rounded-3xl flex flex-col items-center justify-center gap-2 group bg-neon-green/10 hover:bg-neon-green text-neon-green hover:text-background transition-all duration-300 border border-neon-green/30 glow-green shadow-xl"
                                onClick={() => handleUpdateStatus(heroOrder.id, "paid")} disabled={isPending}
                              >
                                <Check className="h-12 w-12 group-hover:scale-125 transition-transform" />
                                <span className="text-xl font-black tracking-tighter uppercase">APPROVE</span>
                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">{fmt(heroOrder.total)}</span>
                              </Button>
                              <Button
                                variant="outline"
                                className="w-44 h-44 rounded-3xl flex flex-col items-center justify-center gap-2 group border-neon-red/30 text-neon-red hover:bg-neon-red hover:text-white transition-all duration-300 glow-red shadow-xl"
                                onClick={() => handleUpdateStatus(heroOrder.id, "cancelled")} disabled={isPending}
                              >
                                <X className="h-12 w-12 group-hover:rotate-90 transition-transform" />
                                <span className="text-xl font-bold tracking-tighter uppercase">CANCEL</span>
                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Void</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {remainingOrders.length > 0 && (
                    <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-white/10" />Remaining orders ({remainingOrders.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {remainingOrders.map((order: any) => (
                          <Card key={order.id} className="glass-card border-neon-green/20 ring-1 ring-white/5 hover:border-neon-green/40 transition-all group rounded-3xl overflow-hidden shadow-2xl">
                            <CardHeader className="p-6 pb-4 border-b border-white/5 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-2xl font-black tracking-tighter group-hover:text-neon-cyan transition-colors">#{order.orderNumber}</div>
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate max-w-[150px]">{order.customerName || "Walk-in"}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-black text-neon-green">{fmt(order.total)}</div>
                                  <Badge variant="outline" className="mt-1 border-white/10 text-[10px] bg-white/5 uppercase">{order.paymentMethod}</Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6 h-[180px] overflow-hidden relative">
                              <ScrollArea className="h-full pr-2">
                                <div className="space-y-2">
                                  {order.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm items-center bg-white/5 p-2.5 rounded-xl border border-transparent hover:border-white/10 transition-all">
                                      <span className="font-bold"><span className="text-neon-cyan mr-2">{item.quantity}x</span>{item.drinkName}</span>
                                      <span className="text-muted-foreground font-medium text-xs">{fmt(parseFloat(item.lineTotal as any))}</span>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                            </CardContent>
                            <CardFooter className="p-4 grid grid-cols-2 gap-3 bg-white/[0.02] border-t border-white/5">
                              <Button variant="ghost" className="h-12 font-black text-xs uppercase tracking-widest hover:bg-neon-red/10 hover:text-neon-red transition-all rounded-xl" onClick={() => handleUpdateStatus(order.id, "cancelled")} disabled={isPending}>
                                <X className="w-4 h-4 mr-2" /> Cancel
                              </Button>
                              <Button className="h-12 font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-neon-green/20 hover:text-neon-green text-foreground transition-all rounded-xl border border-white/5 hover:border-neon-green/30" onClick={() => handleUpdateStatus(order.id, "paid")} disabled={isPending}>
                                <Check className="w-4 h-4 mr-2" /> Approve
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
        </TabsContent>

        <TabsContent value="recent" className="h-[calc(100vh-104px)] flex flex-col overflow-hidden m-0 p-0">
          <div className="p-6 border-b border-white/5 bg-white/[0.01] shrink-0">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Order # or Name..." 
                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl"
                value={recentSearch}
                onChange={(e) => setRecentSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            <div className="max-w-4xl mx-auto p-4 space-y-2">
              {recentOrders.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <History className="h-8 w-8 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold opacity-50 uppercase tracking-tighter">No Recent Orders</h3>
                  <p className="text-sm text-muted-foreground mt-2">Completed and paid orders will appear here.</p>
                </div>
              ) : recentOrders.filter(o => {
                const search = recentSearch.toLowerCase();
                const orderNum = String(o.orderNumber).toLowerCase();
                const custName = (o.customerName || "").toLowerCase();
                return orderNum.includes(search) || custName.includes(search);
              }).length === 0 ? (
                <div className="text-center py-20">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-bold">No orders match "{recentSearch}"</p>
                </div>
              ) : recentOrders.filter(o => {
                const search = recentSearch.toLowerCase();
                const orderNum = String(o.orderNumber).toLowerCase();
                const custName = (o.customerName || "").toLowerCase();
                return orderNum.includes(search) || custName.includes(search);
              }).map((order) => (
                <Card key={order.id} className="glass-card border-white/5 overflow-hidden rounded-2xl">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg font-black neon-text-cyan">
                        #{order.orderNumber}
                      </div>
                      <div>
                        <div className="font-bold">{order.customerName || "Walk-in Guest"}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()} · {order.paymentMethod}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right mr-4">
                        <div className="text-lg font-black text-neon-green">{fmt(order.total)}</div>
                        <Badge variant="outline" className={`text-[9px] uppercase border-white/10 ${
                          order.status === 'refunded' ? 'text-red-400 bg-red-400/10' : 
                          order.status === 'completed' ? 'text-neon-green bg-neon-green/10' : 'text-neon-cyan'
                        }`}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-10 px-3 border-white/10 hover:bg-neon-cyan/10 hover:text-neon-cyan gap-2 rounded-xl" onClick={() => handlePrintAll(order)}>
                          <Printer className="h-4 w-4" /> <span className="text-xs font-bold">Reprint</span>
                        </Button>
                        {order.status !== 'refunded' && (
                          <Button variant="outline" size="sm" className="h-10 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2 rounded-xl" onClick={() => { setRefundOrderId(order.id); setIsAdminAuthOpen(true); }}>
                            <RotateCcw className="h-4 w-4" /> <span className="text-xs font-bold">Refund</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="terminal" className="h-[calc(100vh-104px)] overflow-hidden m-0">
          <PosTerminal />
        </TabsContent>
      </Tabs>
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-[380px] bg-[#0A0A0B] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
              <Receipt className="h-6 w-6 text-neon-cyan" />Order #{completedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground font-medium">Order approved. Select receipts to print.</div>
          <div className="grid gap-4 py-2">
            <Button className="h-16 gap-4 text-base bg-white/5 hover:bg-neon-cyan/20 border border-neon-cyan/50 text-white transition-all duration-300 rounded-2xl group" onClick={() => completedOrder && handlePrintAll(completedOrder)}>
              <Receipt className="h-6 w-6 text-neon-cyan" />
              <div className="text-left"><div className="font-black uppercase tracking-tight">Print All (Both)</div><div className="text-[10px] opacity-50 font-bold uppercase tracking-widest">Full receipt + all tickets</div></div>
            </Button>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-white/5 hover:bg-neon-cyan/10 border-white/10 hover:border-neon-cyan/40 text-white transition-all duration-300 rounded-2xl group" onClick={() => completedOrder && printCustomerReceipt(completedOrder)}>
                <FileText className="h-5 w-5 text-neon-cyan" /><div className="text-[10px] font-black uppercase tracking-tight">Customer</div>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-white/5 hover:bg-neon-green/10 border-white/10 hover:border-neon-green/40 text-white transition-all duration-300 rounded-2xl group" onClick={() => completedOrder && printAgentReceipts(completedOrder)}>
                <Printer className="h-5 w-5 text-neon-green" /><div className="text-[10px] font-black uppercase tracking-tight">Barista</div>
              </Button>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" className="w-full h-12 font-black uppercase tracking-widest hover:bg-white/5 rounded-xl" onClick={() => setIsReceiptOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Summary Dialog */}
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="sm:max-w-[450px] bg-[#0A0A0B] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
              <TrendingUp className="h-6 w-6 text-neon-green" />
              Shift Summary
            </DialogTitle>
          </DialogHeader>
          
          {shiftSummary && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</div>
                  <div className="text-2xl font-black text-neon-green">{fmt(shiftSummary.totalRevenue)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Orders</div>
                  <div className="text-2xl font-black text-neon-cyan">{shiftSummary.totalOrders}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <Banknote className="h-4 w-4 text-amber-500" /> Cash
                  </div>
                  <div className="font-black">{fmt(shiftSummary.cashRevenue)}</div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <CreditCard className="h-4 w-4 text-purple-500" /> Card
                  </div>
                  <div className="font-black">{fmt(shiftSummary.cardRevenue)}</div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <Wallet className="h-4 w-4 text-neon-cyan" /> Wallet
                  </div>
                  <div className="font-black">{fmt(shiftSummary.walletRevenue)}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neon-cyan/5 border border-neon-cyan/20">
                <div className="flex items-center gap-2 text-xs font-bold text-neon-cyan uppercase tracking-widest mb-2">
                  <Clock className="h-3.5 w-3.5" /> Shift Timing
                </div>
                <div className="grid grid-cols-2 text-xs gap-4">
                  <div>
                    <div className="opacity-50">Started At</div>
                    <div className="font-bold">{new Date(shiftSummary.startedAt).toLocaleTimeString()}</div>
                  </div>
                  <div>
                    <div className="opacity-50">Duration</div>
                    <div className="font-bold">{formatDuration(shiftSummary.startedAt)}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4">
                Please verify the drawer amount matches the cash revenue before ending the shift.
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <Button 
              className="w-full h-14 text-base font-black uppercase tracking-widest rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/40 transition-all duration-300"
              onClick={confirmEndSession}
            >
              Close Shift & Logout
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-10 font-bold uppercase text-xs tracking-widest" 
              onClick={() => setIsSummaryOpen(false)}
            >
              Continue Working
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Auth for Refunds */}
      <Dialog open={isAdminAuthOpen} onOpenChange={setIsAdminAuthOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0A0A0B] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
              <RotateCcw className="h-6 w-6 text-red-500" />
              Authorize Refund
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Admin or Supervisor PIN required to proceed with refund for Order <span className="text-neon-cyan">#{recentOrders.find(o => o.id === refundOrderId)?.orderNumber}</span></p>
            </div>
            
            <div className="flex justify-center gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${i < adminPin.length ? "border-red-500 bg-red-500/20" : "border-white/20 bg-white/5"}`}>
                  {i < adminPin.length && <div className="w-3 h-3 rounded-full bg-red-500" />}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
                <button key={i} disabled={d === ""} onClick={() => d === "⌫" ? setAdminPin(p => p.slice(0, -1)) : d && adminPin.length < 6 && setAdminPin(p => p + d)}
                  className={`h-14 rounded-2xl text-xl font-black transition-all ${d === "" ? "pointer-events-none" : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full h-14 text-base font-black uppercase tracking-widest rounded-2xl bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20"
              disabled={adminPin.length < 4 || isRefunding}
              onClick={handleRefundAuth}
            >
              {isRefunding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Admin PIN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Items Selection Dialog */}
      <Dialog open={isRefundItemsOpen} onOpenChange={setIsRefundItemsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0A0A0B] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
              <RotateCcw className="h-6 w-6 text-neon-cyan" />
              Return to Stock
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <p className="text-sm text-muted-foreground font-medium">Select items that should be <span className="text-neon-green">returned to stock</span>. Unchecked items will be marked as <span className="text-red-400">Waste</span>.</p>
            
            <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-3">
                {recentOrders.find(o => o.id === refundOrderId)?.items.map((item: any) => {
                  const isSelected = selectedRefundItems.has(item.id);
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        const next = new Set(selectedRefundItems);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        setSelectedRefundItems(next);
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? "border-neon-green bg-neon-green/10" 
                          : "border-white/10 bg-white/5 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected ? "bg-neon-green border-neon-green text-background" : "border-white/20"
                        }`}>
                          {isSelected && <Check className="h-4 w-4 stroke-[4]" />}
                        </div>
                        <div>
                          <div className="font-bold">{item.drinkName}</div>
                          <div className="text-[10px] uppercase font-black tracking-widest opacity-60">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-xs font-black uppercase tracking-widest">
                        {isSelected ? <span className="text-neon-green">Return</span> : <span className="text-red-400">Waste</span>}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full h-14 text-base font-black uppercase tracking-widest rounded-2xl bg-neon-cyan hover:bg-neon-cyan/80 text-background border-none shadow-lg shadow-neon-cyan/20"
              disabled={isRefunding}
              onClick={handleFinalRefund}
            >
              {isRefunding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}