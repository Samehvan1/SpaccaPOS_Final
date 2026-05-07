import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { TrendingUp, Clock, Users, Coffee, CreditCard, Wallet, Banknote, Handshake, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ShiftReportPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderSearch, setOrderSearch] = useState("");

  // Fetch all sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/cashier/sessions"],
    queryFn: async () => {
      const res = await fetch("/api/cashier/sessions");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
  });

  // Default to the latest session if none selected
  const activeSessionId = selectedSessionId || (sessions.length > 0 ? sessions[0].id : null);

  // Fetch report for the selected session
  const { data: report, isLoading } = useQuery({
    queryKey: ["/api/cashier/sessions", activeSessionId, "report"],
    queryFn: async () => {
      if (!activeSessionId) return null;
      const res = await fetch(`/api/cashier/sessions/${activeSessionId}/report`);
      if (!res.ok) throw new Error("Failed to fetch session report");
      return res.json();
    },
    enabled: !!activeSessionId,
  });

  // Fetch order details when clicked
  const handleOrderClick = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch order details");
      const data = await res.json();
      setSelectedOrder(data);
      setIsOrderModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = report?.orders?.filter((o: any) => 
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.customerName || "").toLowerCase().includes(orderSearch.toLowerCase())
  ) || [];

  if (isLoading && !report) return <div className="p-8">Loading report...</div>;

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Sales Report</h1>
          <p className="text-muted-foreground">Detailed performance analysis for cashier shifts.</p>
        </div>

        <div className="flex items-center gap-2 min-w-[300px]">
          <span className="text-sm font-medium whitespace-nowrap">Select Session:</span>
          <Select 
            value={String(activeSessionId || "")} 
            onValueChange={(v) => setSelectedSessionId(parseInt(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {format(new Date(s.startedAt), "MMM d, HH:mm")} - {s.cashierName} {s.endedAt ? "" : "(Active)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {report ? (
        <>
          {/* Main Totals Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">E£{report.totals.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{report.totals.orderCount} Orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-green-500" /> Cash
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">E£{report.totals.cashRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" /> Credit/Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">E£{report.totals.cardRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-orange-500" /> Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">E£{report.totals.walletRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-pink-500" /> Hospitality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">E£{report.totals.hospitalityRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statistics Section */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Shift Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Top 5 Drinks</h4>
                  <div className="space-y-2">
                    {report.statistics.topDrinks.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{d.name}</span>
                        </div>
                        <Badge variant="secondary">{d.count} sold</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Top 5 Orders by Price</h4>
                  <div className="space-y-2">
                    {report.statistics.topOrdersByPrice.map((o: any) => (
                      <div 
                        key={o.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleOrderClick(o.id)}
                      >
                        <span className="text-sm font-medium">{o.orderNumber}</span>
                        <span className="font-bold">E£{parseFloat(o.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Rush by Hour</h4>
                  <div className="space-y-1">
                    {report.statistics.rushByHour.map((h: any) => (
                      <div key={h.hour} className="flex items-center gap-2">
                        <span className="text-xs w-10">{h.hour}:00</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(h.count / Math.max(...report.statistics.rushByHour.map((x: any) => x.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs w-6 text-right font-bold">{h.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Section */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Session Orders</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-8 h-9" 
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No orders found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((o: any) => (
                          <TableRow 
                            key={o.id} 
                            className="cursor-pointer hover:bg-muted/30"
                            onClick={() => handleOrderClick(o.id)}
                          >
                            <TableCell className="text-xs">{format(new Date(o.createdAt), "HH:mm")}</TableCell>
                            <TableCell className="font-bold">{o.orderNumber}</TableCell>
                            <TableCell className="max-w-[120px] truncate">{o.customerName || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize text-[10px]">
                                {o.paymentMethod}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={o.status === 'completed' || o.status === 'paid' ? 'default' : 'secondary'} 
                                className="capitalize text-[10px]"
                              >
                                {o.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold">E£{o.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mb-4 opacity-20" />
          <p>No session data available.</p>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details: {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Customer</span>
                  <span className="font-bold">{selectedOrder.customerName || "Walk-in"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Time</span>
                  <span className="font-bold">{format(new Date(selectedOrder.createdAt), "HH:mm:ss")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Payment</span>
                  <Badge className="capitalize">{selectedOrder.paymentMethod}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status</span>
                  <Badge variant="outline" className="capitalize">{selectedOrder.status}</Badge>
                </div>
              </div>

              <div className="border rounded-lg p-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Drinks</h4>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <span className="font-bold text-primary">{item.quantity}x</span>
                      <div>
                        <div className="font-bold text-sm">{item.drinkName}</div>
                        {item.customizations?.map((c: any) => (
                          <div key={c.id} className="text-[10px] text-muted-foreground">
                            • {c.slotLabel}: {c.optionLabel}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm font-medium">E£{(item.lineTotal || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-primary">E£{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
