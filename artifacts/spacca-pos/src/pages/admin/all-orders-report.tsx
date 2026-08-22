import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Filter, Receipt, Clock, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fmt, pure } from "@/lib/currency";
import { computeFreeQtyMap } from "@/components/receipt-printer";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900/30",
  paid: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/30",
  in_progress: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900/30",
  ready: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/30",
  completed: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30",
  refunded: "bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-900/30",
};

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function AllOrdersReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState(format(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", String(rowsPerPage));
      params.append("offset", String((page - 1) * rowsPerPage));
      
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      // Handle Branch Filter
      if (selectedBranch !== "all") {
        params.append("branchId", selectedBranch);
      }
      
      // Handle Status Filter
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const ordersRes = await fetch(`/api/orders?${params.toString()}`);
      if (!ordersRes.ok) throw new Error(await ordersRes.text());
      const totalCount = parseInt(ordersRes.headers.get("X-Total-Count") || ordersRes.headers.get("x-total-count") || "0");
      const ordersData = await ordersRes.json();
      
      const branchData = await api("/api/admin/branches");

      setOrders(ordersData);
      setTotalOrders(totalCount);
      setBranches(branchData);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load orders data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedStatus, startDate, endDate, page]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedBranch, selectedStatus, startDate, endDate]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerPhone && order.customerPhone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.baristaName && order.baristaName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const exportCsv = () => {
    const headers = [
      "Order ID", "Order Number", "Date", "Branch", "Barista", "Status", 
      "Payment Method", "Subtotal (Gross)", "Discount", "Offer Discount", "Total (Net)", "Notes"
    ];
    const rows = filteredOrders.map(o => [
      o.id,
      o.orderNumber,
      o.createdAt ? format(new Date(o.createdAt), "yyyy-MM-dd HH:mm") : "",
      o.branchName || `Branch #${o.branchId}`,
      o.baristaName || "",
      o.status,
      o.paymentMethod,
      o.subtotal,
      o.discount,
      o.offerDiscount || 0,
      o.total,
      (o.notes || "").replace(/"/g, '""')
    ]);


    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_orders_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">All Orders Tracker</h1>
          <p className="text-muted-foreground">Monitor and audit every order in the system regardless of its status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={loadData}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="default" size="sm" className="gap-2" onClick={exportCsv} disabled={filteredOrders.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-wider">
            <Filter className="h-4 w-4 text-primary" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Branch Filter */}
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

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> From
              </label>
              <Input type="date" className="h-9" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> To
              </label>
              <Input type="date" className="h-9" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>

            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Order No, Customer..." 
                  className="pl-9 h-9" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <div className="rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground font-medium">Loading orders data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="text-muted-foreground py-4">
                      <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="font-semibold">No orders found</p>
                      <p className="text-xs">Adjust your filters or try a different date range.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell 
                      className="font-bold text-primary underline cursor-pointer hover:text-primary/70 transition-colors font-mono"
                      onClick={() => setSelectedOrderDetails(order)}
                    >
                      {order.id}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy HH:mm") : "—"}
                    </TableCell>
                    <TableCell className="font-bold font-mono">#{order.orderNumber}</TableCell>
                    <TableCell className="text-xs">
                      {order.customerName ? (
                        <div>
                          <div className="font-bold">{order.customerName}</div>
                          {order.customerPhone && <div className="text-[10px] text-muted-foreground">{order.customerPhone}</div>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize font-bold text-[10px] border px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground border-muted-200"}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize font-bold text-xs">{order.paymentMethod}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{pure(order.subtotal)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-destructive">-{pure(order.discount)}</TableCell>
                    <TableCell className="text-right font-mono font-black text-primary">{pure(order.total)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {(() => {
          const totalPages = totalOrders > 0 ? Math.ceil(totalOrders / rowsPerPage) : 1;
          const displayLabel = totalOrders > 0 
            ? `Showing Page ${page} of ${totalPages} (${totalOrders} total orders)`
            : (orders.length > 0 ? `Showing Page ${page}` : `Showing Page ${page} of 1 (0 total orders)`);
            
          return (
            <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">
                {displayLabel} • List includes cancelled and refunded transactions to maintain a clean tracking ledger.
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading || (totalOrders > 0 ? page >= totalPages : orders.length < rowsPerPage)}
                >
                  Next
                </Button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrderDetails} onOpenChange={(open) => !open && setSelectedOrderDetails(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black italic tracking-tighter text-xl">
              <Receipt className="h-5 w-5 text-primary" />
              Order Details — #{selectedOrderDetails?.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Database ID: {selectedOrderDetails?.id} | Date: {selectedOrderDetails?.createdAt && format(new Date(selectedOrderDetails.createdAt), "PPP p")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/40 p-3 rounded-xl border border-muted-200">
                <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-1">Status & Channel</p>
                 <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`capitalize font-bold text-[10px] border ${STATUS_COLORS[selectedOrderDetails?.status] ?? ""}`}>{selectedOrderDetails?.status}</Badge>
                    <Badge variant="outline" className="capitalize text-[10px] bg-primary/5">{selectedOrderDetails?.paymentMethod}</Badge>
                    <Badge variant="outline" className="capitalize text-[10px] border-primary/20 text-primary">{selectedOrderDetails?.source || "POS"}</Badge>
                 </div>
              </div>
              <div className="bg-muted/40 p-3 rounded-xl border border-muted-200">
                <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-1">Staff Involved</p>
                <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                   <span>Barista/Creator:</span>
                   <span className="text-primary font-black">{selectedOrderDetails?.baristaName || `ID: ${selectedOrderDetails?.baristaId}`}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs uppercase font-bold">Drink Item</TableHead>
                    <TableHead className="text-center text-xs uppercase font-bold w-[60px]">Qty</TableHead>
                    <TableHead className="text-right text-xs uppercase font-bold w-[120px]">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const freeQtyMap = selectedOrderDetails ? computeFreeQtyMap(selectedOrderDetails) : new Map();
                    return selectedOrderDetails?.items?.map((item: any, i: number) => {
                      const isRefunded = item.status === 'refunded' || item.status === 'cancelled';
                      const freeQty = freeQtyMap.get(item.id) ?? 0;
                      const offerLabel = !isRefunded && freeQty > 0 ? (freeQty === item.quantity ? "FREE" : `${freeQty} FREE`) : null;
                      return (
                        <TableRow key={i} className={`hover:bg-transparent ${isRefunded ? "opacity-50 line-through bg-red-500/5" : ""}`}>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm">{item.drinkName}</p>
                              {offerLabel && (
                                <Badge variant="outline" className="text-[9px] h-4 bg-emerald-500/10 text-emerald-600 border-emerald-200 font-bold">
                                  [{offerLabel}]
                                </Badge>
                              )}
                              {isRefunded && <Badge variant="destructive" className="text-[8px] h-4 font-black">REFUNDED</Badge>}
                            </div>
                            {item.customizations?.length > 0 && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                {item.customizations.map((c: any) => c.optionLabel).join(", ")}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-bold">x{item.quantity}</TableCell>
                          <TableCell className="text-right font-bold text-sm">{pure(item.lineTotal)}</TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                  <TableRow className="bg-muted/20 border-t">
                    <TableCell colSpan={2} className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">Subtotal</TableCell>
                    <TableCell className="text-right font-bold text-sm">{pure(selectedOrderDetails?.subtotal)}</TableCell>
                  </TableRow>
                  {selectedOrderDetails?.offerDiscount > 0 && (
                    <TableRow className="bg-muted/20 border-t-0 text-destructive">
                      <TableCell colSpan={2} className="text-right font-semibold text-xs uppercase tracking-wider text-destructive">
                        Offer Discount {selectedOrderDetails?.offer?.promoLabel || selectedOrderDetails?.offer?.name ? `(${selectedOrderDetails.offer.promoLabel || selectedOrderDetails.offer.name})` : ""}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-destructive">-{pure(selectedOrderDetails.offerDiscount)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-muted/20 border-t-0">
                    <TableCell colSpan={2} className="text-right font-semibold text-xs uppercase tracking-wider text-destructive">Discount</TableCell>
                    <TableCell className="text-right font-bold text-sm text-destructive">-{pure(selectedOrderDetails?.discount)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-primary/5 border-t-2 border-primary/20">
                    <TableCell colSpan={2} className="text-right font-black text-xs uppercase tracking-wider text-primary">Total Paid</TableCell>
                    <TableCell className="text-right font-black text-primary text-base">{fmt(selectedOrderDetails?.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Payment Details */}
            <div className="p-3 bg-muted/20 rounded-xl border border-dashed space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Payment Breakdown</p>
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
            
            {/* Notes Section */}
            {selectedOrderDetails?.notes && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs">
                <span className="font-black uppercase tracking-wider text-amber-600 block mb-1 text-[10px]">Order Notes</span>
                <p className="text-muted-foreground italic">"{selectedOrderDetails.notes}"</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setSelectedOrderDetails(null)}>Close Details</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
