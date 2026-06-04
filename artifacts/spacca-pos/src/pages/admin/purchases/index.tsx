import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fmt } from "@/lib/currency";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Plus, Edit, Trash2, Eye, ClipboardCheck, 
  CreditCard, Calendar, Truck, User, Building2, 
  FileText, Coins, PackageCheck, AlertCircle, ShoppingBag 
} from "lucide-react";

type Supplier = {
  id: number;
  name: string;
  isActive: boolean;
};

type Branch = {
  id: number;
  name: string;
};

type Conversion = {
  id: number;
  unitName: string;
  conversionFactor: number;
  isDefaultPurchase: boolean;
};

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  isActive: boolean;
  conversions: Conversion[];
};

type PurchaseItemInput = {
  ingredientId: string;
  quantityOrdered: string;
  unitPrice: string;
  conversionId: string; // 'base' or number string
  unitName: string;
  calculatedCost: number;
};

type Purchase = {
  id: number;
  poNumber: string;
  supplierId: number;
  branchId: number;
  status: "draft" | "ordered" | "received" | "cancelled";
  paymentStatus: "unpaid" | "partially_paid" | "paid";
  orderDate: string | null;
  deliveryDate: string | null;
  totalAmount: number;
  paidAmount: number;
  notes: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  supplierName?: string;
  branchName?: string;
  createdByName?: string;
  items?: any[];
};

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

function SearchableSelect({ 
  options, 
  value, 
  onValueChange, 
  placeholder,
  disabled
}: { 
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const selectedOption = options.find(o => o.value === value);
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  
  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isOpen]);

  return (
    <div className="relative w-full" onClick={e => e.stopPropagation()}>
      <Button 
        variant="outline" 
        className="w-full justify-between bg-background border-primary/10 font-medium h-9 text-left px-3 disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        disabled={disabled}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-muted-foreground ml-2 text-xs">▼</span>
      </Button>
      
      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full rounded-md border border-primary/10 bg-card text-popover-foreground shadow-lg outline-none animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b border-primary/5">
            <Input 
              placeholder="Search..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="h-8 bg-background border-primary/5"
              autoFocus
            />
          </div>
          <ScrollArea className="max-h-[200px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="text-xs text-muted-foreground p-2 text-center">No options found.</div>
            ) : (
              filtered.map(opt => (
                <div 
                  key={opt.value}
                  className={`flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-primary hover:text-primary-foreground ${opt.value === value ? "bg-primary/10 text-primary font-bold" : ""}`}
                  onClick={() => {
                    onValueChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default function PurchasesAdmin() {
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();
  const isAdminOrFinance = (user?.role as string) === "admin" || (user?.role as string) === "finance";

  // Data states
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Dialog control states
  const [showWizard, setShowWizard] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Selected item states
  const [selectedPo, setSelectedPo] = useState<Purchase | null>(null);
  const [savingPo, setSavingPo] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingReceive, setSavingReceive] = useState(false);

  // Wizard form state
  const [wizardEditId, setWizardEditId] = useState<number | null>(null);
  const [wizardSupplierId, setWizardSupplierId] = useState("");
  const [wizardBranchId, setWizardBranchId] = useState("");
  const [wizardStatus, setWizardStatus] = useState<"draft" | "ordered">("draft");
  const [wizardNotes, setWizardNotes] = useState("");
  const [wizardItems, setWizardItems] = useState<PurchaseItemInput[]>([]);

  // Receive form state
  const [receiveQuantities, setReceiveQuantities] = useState<Record<number, string>>({});

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");

  // Load all foundational data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [posList, supList, ingList, branchList] = await Promise.all([
        api("/api/purchases"),
        api("/api/purchases/suppliers"),
        api("/api/ingredients?active=true"),
        api("/api/admin/branches")
      ]);
      setPurchases(posList);
      setSuppliers(supList.filter((s: Supplier) => s.isActive));
      setIngredients(ingList);
      setBranches(branchList);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load data", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open creation wizard
  const openCreateWizard = () => {
    setWizardEditId(null);
    setWizardSupplierId(suppliers[0]?.id ? String(suppliers[0].id) : "");
    setWizardBranchId(user?.branchId ? String(user.branchId) : (branches[0]?.id ? String(branches[0].id) : ""));
    setWizardStatus("draft");
    setWizardNotes("");
    setWizardItems([
      { ingredientId: "", quantityOrdered: "", unitPrice: "", conversionId: "base", unitName: "", calculatedCost: 0 }
    ]);
    setShowWizard(true);
  };

  // Open edit wizard
  const openEditWizard = async (po: Purchase) => {
    try {
      const fullPo = await api(`/api/purchases/${po.id}`);
      setWizardEditId(fullPo.id);
      setWizardSupplierId(String(fullPo.supplierId));
      setWizardBranchId(String(fullPo.branchId));
      setWizardStatus(fullPo.status as any);
      setWizardNotes(fullPo.notes || "");
      
      const mappedItems = fullPo.items.map((item: any) => {
        const itemIng = ingredients.find(ing => ing.id === item.ingredientId);
        const conversionId = item.conversionId ? String(item.conversionId) : "base";
        return {
          ingredientId: String(item.ingredientId),
          quantityOrdered: String(item.quantityOrdered),
          unitPrice: String(item.unitPrice),
          conversionId,
          unitName: item.unitName,
          calculatedCost: item.quantityOrdered * item.unitPrice,
        };
      });

      setWizardItems(mappedItems.length > 0 ? mappedItems : [
        { ingredientId: "", quantityOrdered: "", unitPrice: "", conversionId: "base", unitName: "", calculatedCost: 0 }
      ]);
      setShowWizard(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load PO details", description: err.message });
    }
  };

  // Wizard item line handlers
  const handleAddWizardItem = () => {
    setWizardItems([
      ...wizardItems,
      { ingredientId: "", quantityOrdered: "", unitPrice: "", conversionId: "base", unitName: "", calculatedCost: 0 }
    ]);
  };

  const handleRemoveWizardItem = (index: number) => {
    const updated = [...wizardItems];
    updated.splice(index, 1);
    setWizardItems(updated.length > 0 ? updated : [
      { ingredientId: "", quantityOrdered: "", unitPrice: "", conversionId: "base", unitName: "", calculatedCost: 0 }
    ]);
  };

  const handleWizardItemChange = (index: number, field: keyof PurchaseItemInput, value: string) => {
    const updated = [...wizardItems];
    const item = { ...updated[index] };

    if (field === "ingredientId") {
      item.ingredientId = value;
      const ing = ingredients.find(i => String(i.id) === value);
      if (ing) {
        // Default to base unit
        item.unitName = ing.unit;
        item.conversionId = "base";
        
        // If there is a default purchase conversion, select it instead!
        const defaultConv = ing.conversions?.find(c => c.isDefaultPurchase);
        if (defaultConv) {
          item.conversionId = String(defaultConv.id);
          item.unitName = defaultConv.unitName;
        }
      }
    } else if (field === "conversionId") {
      item.conversionId = value;
      const ing = ingredients.find(i => String(i.id) === item.ingredientId);
      if (ing) {
        if (value === "base") {
          item.unitName = ing.unit;
        } else {
          const conv = ing.conversions.find(c => String(c.id) === value);
          if (conv) {
            item.unitName = conv.unitName;
          }
        }
      }
    } else if (field === "quantityOrdered") {
      item.quantityOrdered = value;
    } else if (field === "unitPrice") {
      item.unitPrice = value;
    }

    // Recompute cost
    const qty = parseFloat(item.quantityOrdered) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    item.calculatedCost = qty * price;

    updated[index] = item;
    setWizardItems(updated);
  };

  // Save wizard PO
  const handleSavePurchaseOrder = async () => {
    if (!wizardSupplierId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Supplier is required" });
      return;
    }

    if (!wizardBranchId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Branch is required" });
      return;
    }

    // Clean up empty item rows
    const validItems = wizardItems.filter(item => item.ingredientId && parseFloat(item.quantityOrdered) > 0 && parseFloat(item.unitPrice) >= 0);
    
    if (validItems.length === 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "At least one valid item is required" });
      return;
    }

    setSavingPo(true);
    try {
      const payload = {
        supplierId: parseInt(wizardSupplierId),
        branchId: parseInt(wizardBranchId),
        status: wizardStatus,
        notes: wizardNotes.trim() || null,
        items: validItems.map(item => ({
          ingredientId: parseInt(item.ingredientId),
          quantityOrdered: parseFloat(item.quantityOrdered),
          unitPrice: parseFloat(item.unitPrice),
          conversionId: item.conversionId === "base" ? null : parseInt(item.conversionId),
          unitName: item.unitName,
        }))
      };

      if (wizardEditId) {
        await api(`/api/purchases/${wizardEditId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Purchase order updated" });
      } else {
        await api("/api/purchases", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Purchase order created" });
      }
      setShowWizard(false);
      loadData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save PO", description: err.message });
    } finally {
      setSavingPo(false);
    }
  };

  // Open details
  const openDetailDialog = async (po: Purchase) => {
    try {
      const fullPo = await api(`/api/purchases/${po.id}`);
      setSelectedPo(fullPo);
      setShowDetail(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error loading details", description: err.message });
    }
  };

  // Open receiving
  const openReceiveDialog = async (po: Purchase) => {
    try {
      const fullPo = await api(`/api/purchases/${po.id}`);
      setSelectedPo(fullPo);
      
      const initialQty: Record<number, string> = {};
      fullPo.items.forEach((item: any) => {
        initialQty[item.id] = String(item.quantityOrdered);
      });
      setReceiveQuantities(initialQty);
      setShowReceive(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error loading details", description: err.message });
    }
  };

  // Submit delivery receipt
  const handleSubmitReceipt = async () => {
    if (!selectedPo) return;
    setSavingReceive(true);
    try {
      const payload = {
        items: Object.entries(receiveQuantities).map(([itemId, qty]) => ({
          itemId: parseInt(itemId),
          quantityReceived: parseFloat(qty) || 0
        }))
      };

      await api(`/api/purchases/${selectedPo.id}/receive`, { method: "POST", body: JSON.stringify(payload) });
      toast({ title: "Delivery received", description: "Inventory stock levels and ledger updated successfully." });
      setShowReceive(false);
      loadData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to receive delivery", description: err.message });
    } finally {
      setSavingReceive(false);
    }
  };

  // Open payment recorder
  const openPaymentDialog = (po: Purchase) => {
    setSelectedPo(po);
    const unpaid = po.totalAmount - po.paidAmount;
    setPaymentAmount(String(unpaid > 0 ? unpaid : ""));
    setShowPayment(true);
  };

  // Record payment
  const handleRecordPayment = async () => {
    if (!selectedPo || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "Enter a valid positive payment amount" });
      return;
    }

    setSavingPayment(true);
    try {
      await api(`/api/purchases/${selectedPo.id}/pay`, {
        method: "POST",
        body: JSON.stringify({ paymentAmount: amount })
      });
      toast({ title: "Payment recorded successfully" });
      setShowPayment(false);
      loadData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to record payment", description: err.message });
    } finally {
      setSavingPayment(false);
    }
  };

  // Delete / Cancel PO
  const handleDeletePo = async (po: Purchase) => {
    const isDraft = po.status === "draft";
    const confirmMsg = isDraft 
      ? "Are you sure you want to permanently delete this draft purchase order?" 
      : "Are you sure you want to cancel this purchase order? This will mark it as cancelled.";
    
    if (!confirm(confirmMsg)) return;

    try {
      const res = await api(`/api/purchases/${po.id}`, { method: "DELETE" });
      toast({ title: isDraft ? "PO Deleted" : "PO Cancelled", description: res.message });
      loadData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete or cancel PO", description: err.message });
    }
  };

  // Filter computations
  const filtered = purchases.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (po.supplierName && po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBranch = branchFilter === "all" || String(po.branchId) === branchFilter;
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || po.paymentStatus === paymentFilter;

    return matchesSearch && matchesBranch && matchesStatus && matchesPayment;
  });

  // Calculate statistics
  const stats = {
    totalPoCount: filtered.length,
    totalCost: filtered.reduce((acc, po) => acc + po.totalAmount, 0),
    totalPaid: filtered.reduce((acc, po) => acc + po.paidAmount, 0),
    totalUnpaid: filtered.reduce((acc, po) => acc + (po.totalAmount - po.paidAmount), 0),
    pendingReceive: filtered.filter(po => po.status === "ordered").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-bold uppercase tracking-tight">Draft</Badge>;
      case "ordered":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold uppercase tracking-tight">Ordered</Badge>;
      case "received":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold uppercase tracking-tight">Received</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold uppercase tracking-tight">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold uppercase tracking-tight">Unpaid</Badge>;
      case "partially_paid":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold uppercase tracking-tight">Partial</Badge>;
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold uppercase tracking-tight">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Grand total for current wizard items
  const wizardGrandTotal = wizardItems.reduce((acc, item) => acc + item.calculatedCost, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage wholesale suppliers purchases, deliveries, stock additions, and financial invoices.</p>
        </div>
        {hasPermission("purchases:manage") && (
          <Button onClick={openCreateWizard} className="gap-2 font-bold uppercase tracking-wider">
            <Plus className="h-4 w-4" /> Create Order
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {stats.totalPoCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground flex items-center gap-2">
              <Coins className="h-5 w-5 text-indigo-400" />
              {fmt(stats.totalCost)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {fmt(stats.totalPaid)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Remaining Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {fmt(stats.totalUnpaid)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/60 backdrop-blur-md col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-400 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {stats.pendingReceive}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search PO# or Supplier..." 
                className="pl-10 bg-background/50 border-primary/10" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdminOrFinance && branches.length > 0 && (
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-primary/10">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background/50 border-primary/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[140px] bg-background/50 border-primary/10">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partially_paid">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="rounded-lg border border-primary/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow className="hover:bg-transparent border-primary/10">
                  <TableHead className="font-bold text-foreground">PO Number</TableHead>
                  <TableHead className="font-bold text-foreground">Supplier</TableHead>
                  <TableHead className="font-bold text-foreground">Branch</TableHead>
                  <TableHead className="font-bold text-foreground">Dates</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Payment Status</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Total Amount</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Paid</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-primary/5 hover:bg-transparent">
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground font-semibold">
                      Loading purchase orders...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-primary/5 hover:bg-transparent">
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground font-semibold">
                      No purchase orders found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(po => {
                  const remaining = po.totalAmount - po.paidAmount;
                  return (
                    <TableRow key={po.id} className="border-primary/5 hover:bg-primary/5 transition-colors">
                      <TableCell className="font-bold font-mono text-primary">{po.poNumber}</TableCell>
                      <TableCell className="font-bold text-foreground">{po.supplierName}</TableCell>
                      <TableCell className="font-medium text-foreground">{po.branchName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          {po.orderDate ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0" /> Order: {new Date(po.orderDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="italic text-[10px]">Unordered draft</span>
                          )}
                          {po.deliveryDate && (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <Truck className="h-3 w-3 shrink-0" /> Recv: {new Date(po.deliveryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell>{getPaymentBadge(po.paymentStatus)}</TableCell>
                      <TableCell className="font-bold text-right text-foreground">{fmt(po.totalAmount)}</TableCell>
                      <TableCell className="font-semibold text-right text-emerald-400">{fmt(po.paidAmount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openDetailDialog(po)} title="View Details">
                            <Eye className="h-4 w-4 text-foreground" />
                          </Button>
                          
                          {hasPermission("purchases:manage") && (
                            <>
                              {po.status === "draft" && (
                                <Button variant="ghost" size="icon" onClick={() => openEditWizard(po)} title="Edit Draft">
                                  <Edit className="h-4 w-4 text-foreground" />
                                </Button>
                              )}
                              
                              {po.status === "ordered" && (
                                <Button variant="ghost" size="icon" onClick={() => openReceiveDialog(po)} title="Receive Delivery" className="text-blue-400 hover:bg-blue-500/10">
                                  <ClipboardCheck className="h-4 w-4" />
                                </Button>
                              )}

                              {po.status !== "draft" && po.status !== "cancelled" && po.paymentStatus !== "paid" && (
                                <Button variant="ghost" size="icon" onClick={() => openPaymentDialog(po)} title="Record Payment" className="text-emerald-400 hover:bg-emerald-500/10">
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}

                              {po.status !== "received" && po.status !== "cancelled" && (
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeletePo(po)} title={po.status === "draft" ? "Delete PO" : "Cancel PO"}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* PO Creation/Editing Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-4xl border-primary/10 bg-card max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-primary/5 pb-4">
            <DialogTitle className="font-bold text-xl">{wizardEditId ? `Edit Purchase Order #${selectedPo?.poNumber || ""}` : "Create New Purchase Order"}</DialogTitle>
            <DialogDescription>Draft a wholesale inventory order and select delivery configurations.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Supplier</Label>
                <SearchableSelect
                  options={suppliers.map(s => ({ value: String(s.id), label: s.name }))}
                  value={wizardSupplierId}
                  onValueChange={setWizardSupplierId}
                  placeholder="Select supplier"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="wiz-branch" className="font-bold">Branch</Label>
                <Select value={wizardBranchId} onValueChange={setWizardBranchId} disabled={!isAdminOrFinance}>
                  <SelectTrigger id="wiz-branch" className="bg-background border-primary/10">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="wiz-status" className="font-bold">Initial State</Label>
                <Select value={wizardStatus} onValueChange={(v: any) => setWizardStatus(v)} disabled={wizardEditId !== null && selectedPo?.status !== "draft"}>
                  <SelectTrigger id="wiz-status" className="bg-background border-primary/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="draft">Draft (Save only)</SelectItem>
                    <SelectItem value="ordered">Ordered (Placed order)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="font-bold">Creator</Label>
                <Input value={user?.name || "Self"} disabled className="bg-muted border-primary/10" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wiz-notes" className="font-bold">Notes / Instructions</Label>
              <Textarea 
                id="wiz-notes" 
                placeholder="Include shipping instructions, delivery details, contact numbers..." 
                value={wizardNotes} 
                onChange={e => setWizardNotes(e.target.value)} 
                className="bg-background border-primary/10 min-h-[60px]"
              />
            </div>

            {/* Items table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                <h3 className="font-bold text-foreground flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-primary" /> Order Items List
                </h3>
                <Button variant="outline" size="sm" onClick={handleAddWizardItem} className="h-8 gap-1.5 border-primary/10 hover:bg-primary/5 font-semibold text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </Button>
              </div>

              <div className="rounded-lg border border-primary/10 overflow-hidden bg-background/30">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow className="hover:bg-transparent border-primary/10">
                      <TableHead className="font-bold text-foreground">Ingredient</TableHead>
                      <TableHead className="font-bold text-foreground w-[180px]">Purchasing Unit</TableHead>
                      <TableHead className="font-bold text-foreground w-[120px]">Qty Ordered</TableHead>
                      <TableHead className="font-bold text-foreground w-[130px]">Unit Price (EGP)</TableHead>
                      <TableHead className="font-bold text-foreground text-right w-[140px]">Line Cost</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wizardItems.map((item, idx) => {
                      const selectedIng = ingredients.find(ing => String(ing.id) === item.ingredientId);
                      return (
                        <TableRow key={idx} className="border-primary/5 hover:bg-transparent">
                          <TableCell className="p-2">
                            <SearchableSelect
                              options={ingredients.map(ing => ({ value: String(ing.id), label: ing.name }))}
                              value={item.ingredientId}
                              onValueChange={(val) => handleWizardItemChange(idx, "ingredientId", val)}
                              placeholder="Choose ingredient"
                            />
                          </TableCell>
                          
                          <TableCell className="p-2">
                            <Select 
                              value={item.conversionId} 
                              onValueChange={(val) => handleWizardItemChange(idx, "conversionId", val)}
                              disabled={!item.ingredientId}
                            >
                              <SelectTrigger className="bg-background border-primary/5 h-9">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent className="bg-card">
                                {selectedIng && (
                                  <>
                                    <SelectItem value="base">{selectedIng.unit} (Base Unit)</SelectItem>
                                    {selectedIng.conversions?.map(conv => (
                                      <SelectItem key={conv.id} value={String(conv.id)}>
                                        {conv.unitName} ({conv.conversionFactor} {selectedIng.unit})
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          
                          <TableCell className="p-2">
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              value={item.quantityOrdered} 
                              onChange={e => handleWizardItemChange(idx, "quantityOrdered", e.target.value)} 
                              className="bg-background border-primary/5 h-9"
                              disabled={!item.ingredientId}
                            />
                          </TableCell>
                          
                          <TableCell className="p-2">
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              value={item.unitPrice} 
                              onChange={e => handleWizardItemChange(idx, "unitPrice", e.target.value)} 
                              className="bg-background border-primary/5 h-9"
                              disabled={!item.ingredientId}
                            />
                          </TableCell>
                          
                          <TableCell className="p-2 font-bold text-right text-foreground">
                            {fmt(item.calculatedCost)}
                          </TableCell>
                          
                          <TableCell className="p-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                              onClick={() => handleRemoveWizardItem(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between px-2 pt-2 border-t border-primary/5">
                <span className="text-sm text-muted-foreground font-semibold">Ordered items total cost:</span>
                <span className="text-xl font-black text-primary">{fmt(wizardGrandTotal)}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="shrink-0 border-t border-primary/5 pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowWizard(false)} className="border-primary/10">Cancel</Button>
            <Button onClick={handleSavePurchaseOrder} disabled={savingPo} className="font-bold">
              {savingPo ? "Saving PO..." : (wizardEditId ? "Update Purchase Order" : "Place Order")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PO Detail View Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl border-primary/10 bg-card max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-primary/5 pb-4">
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="font-bold text-xl flex items-center gap-2">
                  PO Details: <span className="font-mono text-primary">{selectedPo?.poNumber}</span>
                </DialogTitle>
                <DialogDescription>Full audit view of wholesale purchase invoice.</DialogDescription>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedPo && getStatusBadge(selectedPo.status)}
                {selectedPo && getPaymentBadge(selectedPo.paymentStatus)}
              </div>
            </div>
          </DialogHeader>

          {selectedPo && (
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Meta details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-lg border border-primary/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Supplier</span>
                  <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> {selectedPo.supplierName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Branch</span>
                  <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {selectedPo.branchName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Created By</span>
                  <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> {selectedPo.createdByName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Creation Date</span>
                  <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {new Date(selectedPo.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedPo.notes && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs text-muted-foreground">
                  <strong className="text-foreground block mb-0.5">Notes:</strong>
                  {selectedPo.notes}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <h3 className="font-black text-sm text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <PackageCheck className="h-4 w-4 text-primary" /> Purchase Items
                </h3>
                <div className="rounded-lg border border-primary/10 overflow-hidden bg-background/20">
                  <Table>
                    <TableHeader className="bg-primary/5">
                      <TableRow className="hover:bg-transparent border-primary/10">
                        <TableHead className="font-bold text-foreground">Ingredient</TableHead>
                        <TableHead className="font-bold text-foreground w-[120px]">Unit Name</TableHead>
                        <TableHead className="font-bold text-foreground text-right w-[100px]">Qty Ordered</TableHead>
                        <TableHead className="font-bold text-foreground text-right w-[100px]">Qty Recv</TableHead>
                        <TableHead className="font-bold text-foreground text-right w-[120px]">Unit Price</TableHead>
                        <TableHead className="font-bold text-foreground text-right w-[140px]">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPo.items?.map((item: any) => (
                        <TableRow key={item.id} className="border-primary/5 hover:bg-transparent">
                          <TableCell className="font-bold text-foreground">{item.ingredientName}</TableCell>
                          <TableCell className="font-medium text-muted-foreground">
                            {item.unitName}
                            {item.conversion && (
                              <span className="text-[10px] text-muted-foreground/60 block mt-0.5">
                                ({item.conversion.conversionFactor} Base Ratio)
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">{item.quantityOrdered}</TableCell>
                          <TableCell className="text-right font-bold text-emerald-400">{item.quantityReceived}</TableCell>
                          <TableCell className="text-right font-medium text-foreground">{fmt(item.unitPrice)}</TableCell>
                          <TableCell className="text-right font-bold text-foreground">{fmt(item.totalCost)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Financial summary */}
              <div className="grid grid-cols-3 gap-4 border-t border-primary/5 pt-4">
                <div className="text-center bg-zinc-500/5 p-3 rounded-lg border border-zinc-500/10">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Subtotal Invoice</span>
                  <span className="text-lg font-black text-foreground mt-1 block">{fmt(selectedPo.totalAmount)}</span>
                </div>
                <div className="text-center bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Total Paid</span>
                  <span className="text-lg font-black text-emerald-400 mt-1 block">{fmt(selectedPo.paidAmount)}</span>
                </div>
                <div className="text-center bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Remaining Balance</span>
                  <span className="text-lg font-black text-rose-400 mt-1 block">{fmt(selectedPo.totalAmount - selectedPo.paidAmount)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="shrink-0 border-t border-primary/5 pt-4">
            <Button onClick={() => setShowDetail(false)} className="font-bold">Close View</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Deliveries Dialog */}
      <Dialog open={showReceive} onOpenChange={setShowReceive}>
        <DialogContent className="max-w-2xl border-primary/10 bg-card max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-primary/5 pb-4">
            <DialogTitle className="font-bold text-xl flex items-center gap-2">
              Receive Delivery: <span className="font-mono text-primary">{selectedPo?.poNumber}</span>
            </DialogTitle>
            <DialogDescription>Input the actual quantities delivered by the supplier. Stock levels will automatically adjust.</DialogDescription>
          </DialogHeader>

          {selectedPo && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/10 text-amber-500 text-xs rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Inventory Updates:</strong> Submitting this delivery will automatically increment branch stock levels and append restock movements in logs.
                </div>
              </div>

              <div className="rounded-lg border border-primary/10 overflow-hidden bg-background/20">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow className="hover:bg-transparent border-primary/10">
                      <TableHead className="font-bold text-foreground">Ingredient</TableHead>
                      <TableHead className="font-bold text-foreground">Unit</TableHead>
                      <TableHead className="font-bold text-foreground text-right w-[120px]">Qty Ordered</TableHead>
                      <TableHead className="font-bold text-foreground text-right w-[150px]">Qty Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPo.items?.map((item: any) => (
                      <TableRow key={item.id} className="border-primary/5 hover:bg-transparent">
                        <TableCell className="font-bold text-foreground">{item.ingredientName}</TableCell>
                        <TableCell className="font-medium text-muted-foreground">{item.unitName}</TableCell>
                        <TableCell className="text-right font-medium text-foreground">{item.quantityOrdered}</TableCell>
                        <TableCell className="text-right p-2">
                          <Input 
                            type="number" 
                            value={receiveQuantities[item.id] || ""} 
                            onChange={(e) => setReceiveQuantities({
                              ...receiveQuantities,
                              [item.id]: e.target.value
                            })}
                            className="bg-background border-primary/10 h-8 font-bold text-right text-emerald-400"
                            placeholder="0.00"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter className="shrink-0 border-t border-primary/5 pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowReceive(false)} className="border-primary/10">Cancel</Button>
            <Button onClick={handleSubmitReceipt} disabled={savingReceive} className="font-bold">
              {savingReceive ? "Updating Stock..." : "Confirm Delivery Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md border-primary/10 bg-card">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl flex items-center gap-1.5">
              <CreditCard className="h-5 w-5 text-emerald-400" /> Record Invoice Payment
            </DialogTitle>
            <DialogDescription>
              Log a monetary payment made to the supplier.
            </DialogDescription>
          </DialogHeader>

          {selectedPo && (
            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-3 rounded-lg border border-primary/5 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">PO Number</span>
                  <span className="font-bold block text-foreground font-mono">{selectedPo.poNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Supplier</span>
                  <span className="font-bold block text-foreground">{selectedPo.supplierName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Invoiced</span>
                  <span className="font-bold block text-foreground">{fmt(selectedPo.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Remaining Unpaid</span>
                  <span className="font-bold block text-rose-400">{fmt(selectedPo.totalAmount - selectedPo.paidAmount)}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentAmt" className="font-bold">Payment Amount (EGP)</Label>
                <div className="relative">
                  <Input 
                    id="paymentAmt" 
                    type="number"
                    step="0.01"
                    placeholder="0.00" 
                    value={paymentAmount} 
                    onChange={e => setPaymentAmount(e.target.value)} 
                    className="bg-background border-primary/10 font-bold text-emerald-400 pr-10 text-lg h-11"
                  />
                  <div className="absolute right-3 top-3 text-xs text-muted-foreground font-medium">EGP</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPayment(false)} className="border-primary/10">Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={savingPayment || !paymentAmount} className="font-bold">
              {savingPayment ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
