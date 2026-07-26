import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart2, TrendingUp, Coffee, Receipt, 
  Banknote, Calendar, ChevronLeft, ChevronRight,
  Download, Tag, CheckCircle2, History, Layers, Sliders,
  Eye, Package, User, Clock, MapPin, Search, Loader2, Gift
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [activeTab, setActiveTab] = useState("orders");
  
  const [orders, setOrders] = useState<any[]>([]);
  const [drinkSales, setDrinkSales] = useState<any[]>([]);
  const [customizations, setCustomizations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeSummary, setRangeSummary] = useState<any>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const rowsPerPage = 50;

  const fetchOrderDetails = async (orderId: number) => {
    setFetchingOrder(true);
    try {
      const data = await api(`/api/orders/${orderId}`);
      setSelectedOrderDetails(data);
      setIsOrderModalOpen(true);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load order details" });
    } finally {
      setFetchingOrder(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: reportStartDate,
        endDate: reportEndDate,
        status: "paid,completed,ready,in_progress",
      });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);

      // 1. Always fetch Range Summary for the top cards
      const rangeData = await api(`/api/finance/sales-summary?${params.toString()}`);
      setRangeSummary(rangeData);

      // 2. Fetch Tab-specific data
      if (activeTab === "orders") {
        params.append("limit", String(rowsPerPage));
        params.append("offset", String((reportPage - 1) * rowsPerPage));
        const [orderData, summaryData] = await Promise.all([
          api(`/api/orders?${params.toString()}`),
          api(`/api/dashboard/sales-by-category?${params.toString()}`),
        ]);
        setOrders(orderData);
        setSummary(summaryData);

        if (isDailyGrouped) {
          const dailyData = await api(`/api/dashboard/sales-by-day?${params.toString()}`);
          setDailySummary(dailyData);
        }
      } else if (activeTab === "drinks") {
        const data = await api(`/api/finance/sales-items?${params.toString()}`);
        setDrinkSales(data);
      } else if (activeTab === "customs") {
        const data = await api(`/api/finance/customizations-report?${params.toString()}`);
        setCustomizations(data);
      }
      
      // 3. Always load branches for filter if not yet loaded
      if (branches.length === 0) {
        setBranches(await api("/api/admin/branches"));
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load sales data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reportStartDate, reportEndDate, reportPage, isDailyGrouped, selectedBranch, activeTab]);

  const totals = useMemo(() => {
    if (!rangeSummary) {
      return { revenue: 0, count: 0, drinks: 0, discounts: 0, offerDiscounts: 0, netRevenue: 0 };
    }
    return { 
      revenue: rangeSummary.revenue, 
      count: rangeSummary.count, 
      drinks: rangeSummary.drinks, 
      discounts: rangeSummary.discounts,
      offerDiscounts: rangeSummary.offerDiscounts || 0,
      netRevenue: rangeSummary.netRevenue 
    };
  }, [rangeSummary]);


  const handleExportCSV = async () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `sales_report_${reportStartDate}_to_${reportEndDate}.csv`;

    setIsExporting(true);
    try {
      if (activeTab === "orders") {
        const params = new URLSearchParams({
          startDate: reportStartDate,
          endDate: reportEndDate,
          status: "paid,completed,ready,in_progress",
          limit: "1000000",
        });
        if (selectedBranch !== "all") params.append("branchId", selectedBranch);

        const allOrders = await api(`/api/orders?${params.toString()}`);
        if (!allOrders || allOrders.length === 0) return;

        headers = ["OrderID", "Date", "Time", "Order Number", "Items Count", "Total Price", "Before Tax", "Tax Value", "Discount Name", "Discount Value", "Discount Amount", "Offer Discount", "Final Price", "Status", "Payment Method"];
        
        let totalItemsCount = 0;
        let totalGrossPrice = 0;
        let totalNetPrice = 0;
        let totalTaxValue = 0;
        let totalDiscountAmount = 0;
        let totalOfferDiscountAmount = 0;
        let totalFinalPrice = 0;

        rows = allOrders.map((o: any) => {
          const itemsCount = o.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
          const grossPrice = o.subtotal || 0;
          const netPrice = grossPrice / 1.14;
          const taxValue = grossPrice - netPrice;
          const discountAmount = o.discount || 0;
          const offerDiscountAmount = o.offerDiscount || 0;
          const finalPrice = o.total || 0;

          totalItemsCount += itemsCount;
          totalGrossPrice += grossPrice;
          totalNetPrice += netPrice;
          totalTaxValue += taxValue;
          totalDiscountAmount += discountAmount;
          totalOfferDiscountAmount += offerDiscountAmount;
          totalFinalPrice += finalPrice;

          return [
            o.id,
            format(new Date(o.createdAt), "yyyy-MM-dd"),
            format(new Date(o.createdAt), "HH:mm"),
            `#${o.orderNumber}`,
            itemsCount,
            grossPrice.toFixed(2),
            netPrice.toFixed(2),
            taxValue.toFixed(2),
            o.paymentMethod === "hospitality" ? "HOSPITALITY" : ((o as any).discountCode || "-"),
            (o as any).discountValue ? ((o as any).discountType === 'percentage' ? `${(o as any).discountValue}%` : (o as any).discountValue.toFixed(2)) : "0",
            discountAmount.toFixed(2),
            offerDiscountAmount.toFixed(2),
            finalPrice.toFixed(2),
            o.status,
            o.paymentMethod
          ];
        });

        // Add Totals row
        rows.push([
          "TOTALS",
          "",
          "",
          "",
          totalItemsCount,
          totalGrossPrice.toFixed(2),
          totalNetPrice.toFixed(2),
          totalTaxValue.toFixed(2),
          "",
          "",
          totalDiscountAmount.toFixed(2),
          totalOfferDiscountAmount.toFixed(2),
          totalFinalPrice.toFixed(2),
          "",
          ""
        ]);
      } else if (activeTab === "drinks") {
        filename = `drink_sales_${reportStartDate}_to_${reportEndDate}.csv`;
        headers = ["Date", "Order NO", "Inv.NO", "Cashier", "Branch", "Item", "Quantity", "Standard/Customize", "Sale Price", "Total Price (Gross)", "Before Tax (Net)", "Tax Amount", "Discount Name", "Discount value", "Discount Amount", "SubTotal Price", "Final Price", "Payment Method", "Category"];
        rows = drinkSales.map(i => [
          format(new Date(i.date), "yyyy-MM-dd"),
          i.orderNo,
          i.invNo,
          i.cashier,
          i.branch,
          i.item,
          i.quantity,
          i.isCustomized,
          i.salePrice,
          i.totalGross,
          i.netBeforeTax,
          i.taxAmount,
          i.discountName,
          i.discountValue,
          i.discountAmount,
          i.subtotalPrice,
          i.finalPrice,
          i.paymentMethod,
          i.category
        ]);
      } else if (activeTab === "customs") {
        filename = `customizations_${reportStartDate}_to_${reportEndDate}.csv`;
        headers = ["Date", "Order NO", "Inv.NO", "Cashier", "Branch", "Item/Drink", "Standard Ing.", "Quantity", "Customized Ing.", "Quantity", "Unit", "Sales Price"];
        rows = customizations.map(c => [
          format(new Date(c.date), "yyyy-MM-dd"),
          c.orderNumber,
          "-",
          c.cashier || "System",
          c.branch,
          c.drinkName,
          c.defaultLabel || "Standard", 
          "-",
          c.replacementLabel,
          c.consumedQty,
          c.unit || "unit",
          c.addedCost
        ]);
      }

      const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement("a"));
      link.href = url;
      link.download = filename;
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setIsExporting(false);
    }
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
              <Switch checked={isDailyGrouped} onCheckedChange={setIsDailyGrouped} id="daily-grp" disabled={activeTab !== "orders"} />
              <Label htmlFor="daily-grp" className={`cursor-pointer ${activeTab !== "orders" ? "opacity-50" : ""}`}>Group by Day</Label>
            </div>
             <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="gap-2 w-full" 
                onClick={handleExportCSV}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Revenue", value: fmt(totals.revenue), icon: Banknote },
          { label: "Range Net Rev", value: fmt(totals.netRevenue), icon: TrendingUp },
          { label: "Orders", value: totals.count, icon: Receipt },
          { label: "Drinks", value: totals.drinks, icon: Coffee },
          { label: "Discounts", value: fmt(totals.discounts), icon: Tag },
          { label: "Offer Discounts", value: fmt(totals.offerDiscounts), icon: Gift },
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2"><Receipt className="h-4 w-4" /> Orders Totals</TabsTrigger>
          <TabsTrigger value="drinks" className="gap-2"><Coffee className="h-4 w-4" /> Drink Sales</TabsTrigger>
          <TabsTrigger value="customs" className="gap-2"><Sliders className="h-4 w-4" /> Customizations</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
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
                      <TableCell>
                        <button 
                          onClick={() => fetchOrderDetails(order.id)}
                          className="font-mono font-medium text-primary hover:underline"
                          disabled={fetchingOrder}
                        >
                          #{order.orderNumber}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(order.createdAt), "MMM dd, HH:mm")}
                      </TableCell>
                      <TableCell>{fmt(order.subtotal)}</TableCell>
                      <TableCell className="text-destructive">
                        {order.offerDiscount > 0 ? (
                          <div className="flex flex-col text-xs leading-none">
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Offer</span>
                            <span>-{fmt(order.offerDiscount)}</span>
                          </div>
                        ) : order.discount > 0 ? (
                          `-${fmt(order.discount)}`
                        ) : (
                          "0.00"
                        )}
                      </TableCell>
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

          {!isDailyGrouped && (() => {
            const totalPages = rangeSummary?.count ? Math.ceil(rangeSummary.count / rowsPerPage) : 1;
            return (
              <div className="flex justify-center items-center gap-2 pb-10">
                <Button 
                  variant="outline" 
                  onClick={() => setReportPage(p => Math.max(1, p - 1))} 
                  disabled={reportPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 font-medium text-sm">
                  Page {reportPage} of {totalPages} ({rangeSummary?.count || 0} total orders)
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setReportPage(p => p + 1)} 
                  disabled={reportPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="drinks">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Order #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10">Loading drink sales...</TableCell></TableRow>
                ) : drinkSales.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No data found for this range.</TableCell></TableRow>
                ) : drinkSales.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{format(new Date(item.date), "MMM dd")}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.item}
                        {item.isCustomized === "Customize" && <Badge variant="outline" className="text-[9px] h-4">Custom</Badge>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize text-[10px]">{item.category}</Badge></TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{fmt(item.salePrice)}</TableCell>
                    <TableCell className="text-right font-bold">{fmt(item.totalGross)}</TableCell>
                    <TableCell>
                      <button 
                        onClick={() => fetchOrderDetails(item.invNo)}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        #{item.orderNo}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="customs">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Drink</TableHead>
                  <TableHead>Standard</TableHead>
                  <TableHead>Replacement</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Added Cost</TableHead>
                  <TableHead>Branch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10">Loading customizations...</TableCell></TableRow>
                ) : customizations.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No customizations found.</TableCell></TableRow>
                ) : customizations.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{format(new Date(c.date), "MMM dd")}</TableCell>
                    <TableCell className="font-medium">{c.drinkName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground font-normal">{c.defaultLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{c.replacementLabel}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{c.consumedQty} {c.unit}</TableCell>
                    <TableCell className="text-right font-bold">{fmt(c.addedCost)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.branch}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Receipt className="h-6 w-6 text-primary" />
              Order #{selectedOrderDetails?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Created on {selectedOrderDetails && format(new Date(selectedOrderDetails.createdAt), "MMMM dd, yyyy HH:mm")}
            </DialogDescription>
          </DialogHeader>

          {selectedOrderDetails && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Cashier</span>
                  <p className="font-medium">{selectedOrderDetails.cashierName || "System"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Branch</span>
                  <p className="font-medium">{selectedOrderDetails.branchName || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Banknote className="h-3 w-3" /> Payment</span>
                  <p className="font-medium capitalize">{selectedOrderDetails.paymentMethod}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Status</span>
                  <Badge variant="secondary" className="capitalize">{selectedOrderDetails.status}</Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Package className="h-3 w-3" /> Source</span>
                  <Badge variant="outline" className="capitalize">{selectedOrderDetails.source || "POS"}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2"><Coffee className="h-4 w-4" /> Order Items</h3>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Drink</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrderDetails.items.map((item: any) => (
                        <>
                          <TableRow key={item.id} className={item.status === 'refunded' ? "opacity-50 line-through bg-red-500/5" : ""}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {item.drinkName}
                                {item.status === 'refunded' && <Badge variant="destructive" className="text-[8px] h-4">REFUNDED</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{fmt(item.unitPrice)}</TableCell>
                            <TableCell className="text-right font-bold">{fmt(item.lineTotal)}</TableCell>
                          </TableRow>
                          {item.customizations?.length > 0 && (
                            <TableRow key={`${item.id}-cust`} className="bg-muted/10">
                              <TableCell colSpan={4} className="py-2 px-6">
                                <div className="flex flex-wrap gap-2">
                                  {item.customizations.map((c: any) => (
                                    <Badge key={c.id} variant="outline" className="text-[10px] bg-background">
                                      <span className="text-primary font-bold mr-1">{c.slotLabel}:</span> {c.optionLabel}
                                      {c.addedCost > 0 && <span className="ml-1 text-green-600">+{fmt(c.addedCost)}</span>}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full md:w-64 space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{fmt(selectedOrderDetails.subtotal)}</span>
                  </div>
                  {selectedOrderDetails.offerDiscount > 0 && (
                    <div className="flex justify-between text-sm text-destructive font-bold bg-destructive/5 px-2.5 py-1 rounded-md border border-destructive/15">
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Offer Discount</span>
                      <span>-{fmt(selectedOrderDetails.offerDiscount)}</span>
                    </div>
                  )}
                  {selectedOrderDetails.discount > 0 && (
                    <div className="flex justify-between text-sm text-destructive font-medium">
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Discount ({selectedOrderDetails.discountCode})</span>
                      <span>-{fmt(selectedOrderDetails.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-primary">{fmt(selectedOrderDetails.total)}</span>
                  </div>
                  <div className="pt-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Payment Details</p>
                    {selectedOrderDetails.payments && selectedOrderDetails.payments.length > 0 ? (
                      selectedOrderDetails.payments.map((p: any) => (
                        <div key={p.id} className="flex justify-between text-[11px] font-bold">
                          <span className="capitalize text-muted-foreground">{p.paymentMethod}</span>
                          <span>{fmt(p.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="capitalize text-muted-foreground">Payment Method</span>
                        <span>{selectedOrderDetails.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedOrderDetails.notes && (
                <div className="bg-muted/30 p-3 rounded-lg text-sm italic text-muted-foreground">
                  <span className="font-bold not-italic block mb-1">Order Notes:</span>
                  {selectedOrderDetails.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
