import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

import { 
  ArrowLeftRight, Plus, Search, RefreshCw, Download, 
  Building2, ShoppingBag, ArrowRight, User, Calendar, Trash2, CheckCircle2, Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Branch = { id: number; name: string; code?: string };
type Ingredient = { id: number; name: string; unit: string; conversions?: Array<{ id: number; unitName: string; conversionFactor: number }> };
type TransferRecord = {
  id: number;
  branchId: number;
  ingredientId: number;
  ingredientName: string;
  movementType: string;
  quantity: number;
  quantityAfter: number;
  note: string;
  fromBranchName: string;
  toBranchName: string;
  createdByName: string;
  createdAt: string;
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between bg-background border-primary/10 font-medium h-9 text-left px-3 disabled:opacity-50"
          type="button"
          disabled={disabled}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <span className="text-muted-foreground ml-2 text-xs">▼</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[320px] p-0 z-[200]" align="start">
        <div className="p-2 border-b border-primary/5">
          <Input 
            placeholder="Search ingredient..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="h-8 bg-background border-primary/5"
            autoFocus
          />
        </div>
        <ScrollArea className="max-h-[220px] overflow-y-auto p-1">
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
                  setSearch("");
                }}
              >
                <span className="whitespace-normal break-words">{opt.label}</span>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default function StockTransfersAdmin() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [branchStockMap, setBranchStockMap] = useState<Record<number, Record<number, number>>>({});

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("all");

  // Transfer Wizard Modal state
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferFromBranchId, setTransferFromBranchId] = useState<string>("");
  const [transferToBranchId, setTransferToBranchId] = useState<string>("");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferItems, setTransferItems] = useState<Array<{ ingredientId: string; conversionId: string; quantity: string }>>([
    { ingredientId: "", conversionId: "base", quantity: "" }
  ]);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [transfersList, branchList, ingList, stockQuantities] = await Promise.all([
        api("/api/stock/transfers").catch(() => []),
        api("/api/admin/branches").catch(() => []),
        api("/api/ingredients?active=true").catch(() => []),
        api("/api/stock/branch-quantities").catch(() => ({}))
      ]);
      setTransfers(transfersList);
      setBranches(branchList);
      setIngredients(ingList);
      setBranchStockMap(stockQuantities || {});
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load transfers", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openTransferModal = async () => {
    try {
      const freshStock = await api("/api/stock/branch-quantities");
      if (freshStock) setBranchStockMap(freshStock);
    } catch {}

    const centralBranch = branches.find(b => b.name.toLowerCase().includes("central") || b.name.toLowerCase().includes("warehouse")) || branches[0];
    const firstOtherBranch = branches.find(b => b.id !== centralBranch?.id) || branches[1] || branches[0];
    
    setTransferFromBranchId(centralBranch ? String(centralBranch.id) : "");
    setTransferToBranchId(firstOtherBranch ? String(firstOtherBranch.id) : "");
    setTransferNotes("");
    setTransferItems([{ ingredientId: "", conversionId: "base", quantity: "" }]);
    setShowTransfer(true);
  };

  const handleAddTransferItem = () => {
    setTransferItems(prev => [...prev, { ingredientId: "", conversionId: "base", quantity: "" }]);
  };

  const handleRemoveTransferItem = (idx: number) => {
    setTransferItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTransferItemChange = (idx: number, field: string, val: string) => {
    setTransferItems(prev => {
      const next = [...prev];
      (next[idx] as any)[field] = val;
      return next;
    });
  };

  const handleExecuteTransfer = async () => {
    if (!transferFromBranchId || !transferToBranchId) {
      toast({ variant: "destructive", title: "Missing branches", description: "Select both source and destination branches" });
      return;
    }
    if (transferFromBranchId === transferToBranchId) {
      toast({ variant: "destructive", title: "Invalid transfer", description: "Source and destination branches must be different" });
      return;
    }
    const validItems = transferItems.filter(i => i.ingredientId && parseFloat(i.quantity) > 0);
    if (validItems.length === 0) {
      toast({ variant: "destructive", title: "No items", description: "Add at least one valid ingredient and quantity" });
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      const res = await api("/api/stock/transfers", {
        method: "POST",
        body: JSON.stringify({
          fromBranchId: parseInt(transferFromBranchId),
          toBranchId: parseInt(transferToBranchId),
          notes: transferNotes,
          items: validItems
        })
      });
      toast({ title: "Transfer Completed", description: res.message });
      setShowTransfer(false);
      loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transfer Failed", description: e.message });
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // Filter transfers
  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = 
      t.ingredientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.createdByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBranch = selectedBranchFilter === "all" || 
      String(t.branchId) === selectedBranchFilter ||
      t.fromBranchName.toLowerCase().includes(selectedBranchFilter.toLowerCase()) ||
      t.toBranchName.toLowerCase().includes(selectedBranchFilter.toLowerCase());

    return matchesSearch && matchesBranch;
  });

  const exportTransfersReport = (formatType: "csv" | "json") => {
    if (filteredTransfers.length === 0) {
      toast({ title: "No data to export" });
      return;
    }

    if (formatType === "csv") {
      const headers = ["Transfer ID", "Date", "Source Branch (From)", "Destination Branch (To)", "Ingredient", "Quantity", "User", "Notes"];
      const rows = filteredTransfers.map(t => [
        t.id,
        format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
        `"${t.fromBranchName}"`,
        `"${t.toBranchName}"`,
        `"${t.ingredientName}"`,
        t.quantity,
        `"${t.createdByName}"`,
        `"${t.note || ''}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `stock-transfers-${format(new Date(), "yyyyMMdd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTransfers, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", jsonContent);
      link.setAttribute("download", `stock-transfers-${format(new Date(), "yyyyMMdd")}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-7 w-7 text-primary" /> Inter-Branch Stock Transfers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transfer inventory stock & batches directly between central warehouse and branches, and track audit history.
          </p>
        </div>

        {hasPermission("purchases:manage") && (
          <Button onClick={openTransferModal} className="gap-2 font-bold uppercase tracking-wider shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> New Stock Transfer
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              {transfers.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-400" />
              {branches.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Catalog Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {ingredients.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-foreground truncate">
              {transfers[0] ? format(new Date(transfers[0].createdAt), "MMM dd, yyyy HH:mm") : "No transfers yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="tracker" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-2">
          <TabsList className="bg-card border border-primary/10">
            <TabsTrigger value="tracker" className="gap-2 font-bold">
              <ArrowLeftRight className="h-4 w-4" /> Transfers Tracker Report
            </TabsTrigger>
            <TabsTrigger value="inventory-map" className="gap-2 font-bold">
              <Building2 className="h-4 w-4" /> Branch Inventory Map
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 border-primary/10">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportTransfersReport("csv")} className="gap-1.5 border-primary/10">
              <Download className="h-3.5 w-3.5 text-emerald-400" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Tab 1: Transfers Tracker */}
        <TabsContent value="tracker" className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transfer history by ingredient, branch, user, or notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-primary/10"
              />
            </div>

            <Select value={selectedBranchFilter} onValueChange={setSelectedBranchFilter}>
              <SelectTrigger className="w-full md:w-[220px] bg-card border-primary/10">
                <SelectValue placeholder="Filter Branch" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(b => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="border-primary/10 bg-card">
            <CardHeader className="pb-3 border-b border-primary/5">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Stock Transfer Audit Log ({filteredTransfers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-primary/5">
                  <TableRow className="hover:bg-transparent border-primary/10">
                    <TableHead className="font-bold text-foreground w-[160px]">Date & Time</TableHead>
                    <TableHead className="font-bold text-foreground">Transfer Route (From → To)</TableHead>
                    <TableHead className="font-bold text-foreground">Ingredient</TableHead>
                    <TableHead className="font-bold text-foreground w-[100px]">Movement</TableHead>
                    <TableHead className="font-bold text-foreground text-right w-[140px]">Transferred Qty</TableHead>
                    <TableHead className="font-bold text-foreground w-[160px]">Executed By</TableHead>
                    <TableHead className="font-bold text-foreground">Notes / Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading transfer history...</TableCell>
                    </TableRow>
                  ) : filteredTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No stock transfer records found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredTransfers.map(tr => (
                      <TableRow key={tr.id} className="hover:bg-primary/5 border-primary/5">
                        <TableCell className="font-medium text-xs">
                          {format(new Date(tr.createdAt), "yyyy-MM-dd HH:mm")}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                              {tr.fromBranchName}
                            </Badge>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">
                              {tr.toBranchName}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-foreground">
                          {tr.ingredientName}
                        </TableCell>

                        <TableCell>
                          {tr.movementType === "transfer_out" ? (
                            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-bold text-xs">Out</Badge>
                          ) : tr.movementType === "transfer_in" ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-xs">In</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">{tr.movementType}</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right font-black text-emerald-400">
                          {tr.quantity.toFixed(2)}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3 text-primary" /> {tr.createdByName}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                          {tr.note || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Branch Inventory Stock Map */}
        <TabsContent value="inventory-map" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map(branch => {
              const branchStock = branchStockMap[branch.id] || {};
              const stockedIngredientsCount = Object.keys(branchStock).filter(id => branchStock[Number(id)] > 0).length;

              return (
                <Card key={branch.id} className="border-primary/10 bg-card">
                  <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <CardTitle className="font-bold text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" /> {branch.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {stockedIngredientsCount} Items in Stock
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ScrollArea className="h-[260px] pr-2">
                      <div className="space-y-2">
                        {ingredients.map(ing => {
                          const qty = branchStock[ing.id] ?? 0;
                          return (
                            <div key={ing.id} className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-primary/5 text-xs">
                              <span className="font-medium text-foreground truncate max-w-[180px]">{ing.name}</span>
                              <span className={`font-bold ${qty > 0 ? "text-emerald-400" : "text-destructive opacity-50"}`}>
                                {qty > 0 ? `${qty.toFixed(2)} ${ing.unit}` : "0.00 Out of Stock"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Inter-Branch Stock Transfer Dialog */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent className="max-w-3xl border-primary/10 bg-card max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-primary/5 pb-4">
            <DialogTitle className="font-bold text-xl flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" /> Execute Inter-Branch Stock Transfer
            </DialogTitle>
            <DialogDescription>Transfer inventory stock & batches directly between branches (e.g. from Central Warehouse to a branch).</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tr-from-branch" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">From Branch (Source)</Label>
                <Select value={transferFromBranchId} onValueChange={setTransferFromBranchId}>
                  <SelectTrigger id="tr-from-branch" className="bg-background border-primary/10">
                    <SelectValue placeholder="Source branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tr-to-branch" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">To Branch (Destination)</Label>
                <Select value={transferToBranchId} onValueChange={setTransferToBranchId}>
                  <SelectTrigger id="tr-to-branch" className="bg-background border-primary/10">
                    <SelectValue placeholder="Destination branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tr-notes" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Transfer Notes / Reason</Label>
              <Input 
                id="tr-notes" 
                placeholder="Optional transfer note, e.g. Restock for Branch A" 
                value={transferNotes} 
                onChange={e => setTransferNotes(e.target.value)} 
                className="bg-background border-primary/10"
              />
            </div>

            {/* Transfer Items Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                  <ShoppingBag className="h-4 w-4 text-primary" /> Transfer Items List
                </h3>
                <Button variant="outline" size="sm" onClick={handleAddTransferItem} className="h-8 gap-1.5 border-primary/10 hover:bg-primary/5 font-semibold text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </Button>
              </div>

              <div className="rounded-lg border border-primary/10 bg-background/30 overflow-visible">
                <Table className="overflow-visible" wrapperClassName="overflow-visible">
                  <TableHeader className="bg-primary/5">
                    <TableRow className="hover:bg-transparent border-primary/10 overflow-visible">
                      <TableHead className="font-bold text-foreground min-w-[220px]">Ingredient</TableHead>
                      <TableHead className="font-bold text-foreground w-[160px]">Available at Source</TableHead>
                      <TableHead className="font-bold text-foreground w-[160px]">Transfer Unit</TableHead>
                      <TableHead className="font-bold text-foreground w-[130px]">Qty to Transfer</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferItems.map((item, idx) => {
                      const selectedIng = ingredients.find(ing => String(ing.id) === item.ingredientId);
                      const sourceBranchId = parseInt(transferFromBranchId);
                      const availBase = (selectedIng && sourceBranchId) ? (branchStockMap[sourceBranchId]?.[selectedIng.id] ?? 0) : 0;

                      let conversionFactor = 1;
                      let selectedUnitName = selectedIng?.unit || "";
                      if (item.conversionId && item.conversionId !== "base" && selectedIng) {
                        const conv = selectedIng.conversions?.find(c => String(c.id) === item.conversionId);
                        if (conv) {
                          conversionFactor = conv.conversionFactor;
                          selectedUnitName = conv.unitName;
                        }
                      }

                      const availConverted = availBase / (conversionFactor || 1);
                      const optionsWithAvail = ingredients.map(ing => {
                        const stock = sourceBranchId ? (branchStockMap[sourceBranchId]?.[ing.id] ?? 0) : 0;
                        return {
                          value: String(ing.id),
                          label: `${ing.name} (${stock > 0 ? `${stock} ${ing.unit}` : 'Out of Stock'})`
                        };
                      });

                      return (
                        <TableRow key={idx} className="border-primary/5 hover:bg-transparent">
                          <TableCell className="p-2">
                            <SearchableSelect
                              options={optionsWithAvail}
                              value={item.ingredientId}
                              onValueChange={(val) => handleTransferItemChange(idx, "ingredientId", val)}
                              placeholder="Choose ingredient"
                            />
                          </TableCell>

                          <TableCell className="p-2">
                            {selectedIng ? (
                              <div className="flex flex-col">
                                <span className={`font-bold text-xs ${availBase > 0 ? "text-emerald-400" : "text-destructive"}`}>
                                  {availBase > 0 
                                    ? (item.conversionId !== "base" && conversionFactor > 1 
                                        ? `${availConverted.toFixed(2)} ${selectedUnitName}` 
                                        : `${availBase.toFixed(2)} ${selectedIng.unit}`)
                                    : "0.00 (Out of Stock)"}
                                </span>
                                {availBase > 0 && item.conversionId !== "base" && conversionFactor > 1 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    ({availBase.toFixed(2)} {selectedIng.unit})
                                  </span>
                                )}
                                {availBase <= 0 && (() => {
                                  const availableInBranches = branches.filter(b => b.id !== sourceBranchId && (branchStockMap[b.id]?.[selectedIng.id] ?? 0) > 0);
                                  if (availableInBranches.length > 0) {
                                    return (
                                      <span className="text-[10px] text-amber-400 font-semibold mt-0.5">
                                        Stock in: {availableInBranches.map(b => `${b.name} (${branchStockMap[b.id][selectedIng.id]} ${selectedIng.unit})`).join(", ")}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          
                          <TableCell className="p-2">
                            <Select 
                              value={item.conversionId} 
                              onValueChange={(val) => handleTransferItemChange(idx, "conversionId", val)}
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
                              value={item.quantity} 
                              onChange={e => handleTransferItemChange(idx, "quantity", e.target.value)} 
                              className="bg-background border-primary/5 h-9"
                              disabled={!item.ingredientId}
                            />
                          </TableCell>
                          
                          <TableCell className="p-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                              onClick={() => handleRemoveTransferItem(idx)}
                              disabled={transferItems.length === 1}
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
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-primary/5 pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowTransfer(false)} className="border-primary/10">Cancel</Button>
            <Button onClick={handleExecuteTransfer} disabled={isSubmittingTransfer} className="font-bold gap-2">
              <ArrowLeftRight className="h-4 w-4" /> {isSubmittingTransfer ? "Executing..." : "Execute Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
