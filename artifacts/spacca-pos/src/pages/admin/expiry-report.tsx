import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Calendar, Download, Layers, Coffee, FileText, Loader2, AlertTriangle, Plus } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export default function ExpiryReportPage() {
  const { selectedBranchId, user } = useAuth();
  const { toast } = useToast();

  // Expiry Report filters state
  const [expiryBranchId, setExpiryBranchId] = useState<string>("all");
  const [expiryIngredientId, setExpiryIngredientId] = useState<string>("all");
  const [expiryDays, setExpiryDays] = useState<string>("30");
  const [expiryStatus, setExpiryStatus] = useState<string>("alert");

  // Sync expiry branch to selectedBranchId if restricted
  useEffect(() => {
    if (selectedBranchId !== null && selectedBranchId !== undefined) {
      setExpiryBranchId(String(selectedBranchId));
    }
  }, [selectedBranchId]);

  // Fetch branches
  const { data: branches } = useQuery<any[]>({
    queryKey: ["admin-branches-expiry"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/branches`);
      if (!res.ok) throw new Error("Failed to fetch branches");
      return res.json();
    }
  });

  // Fetch active ingredients (branch-specific stock)
  const { data: activeIngredients } = useQuery<any[]>({
    queryKey: ["active-ingredients-expiry", expiryBranchId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/ingredients?active=true&branchId=${expiryBranchId}`);
      if (!res.ok) throw new Error("Failed to fetch ingredients");
      return res.json();
    }
  });

  const [selectedOpenIngId, setSelectedOpenIngId] = useState<string>("none");

  // State for unsealing packages
  const [unsealBatch, setUnsealBatch] = useState<any | null>(null);
  const [unsealMode, setUnsealMode] = useState<"entire" | "package" | "custom">("entire");
  const [selectedConversionId, setSelectedConversionId] = useState<string>("");
  const [packageCount, setPackageCount] = useState<number>(1);
  const [customQtyToOpen, setCustomQtyToOpen] = useState<string>("");

  // State for labeling/initializing unbatched stock as a batch
  const [initializeBatchData, setInitializeBatchData] = useState<any | null>(null);
  const [initBatchNumber, setInitBatchNumber] = useState<string>("BULK-INITIAL");
  const [initExpiryDate, setInitExpiryDate] = useState<string>("");
  const [initQuantity, setInitQuantity] = useState<string>("");


  // State for editing batch details
  const [editingBatch, setEditingBatch] = useState<any | null>(null);
  const [editBatchNumber, setEditBatchNumber] = useState<string>("");
  const [editSealedExpiryDate, setEditSealedExpiryDate] = useState<string>("");
  const [editExpiryDate, setEditExpiryDate] = useState<string>("");
  const [editQuantity, setEditQuantity] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Expiry Report Queries
  const { data: expiryReportData, isLoading: loadingExpiryReport, refetch: refetchExpiryReport } = useQuery<any[]>({
    queryKey: ["expiry-reports-page", expiryBranchId, expiryIngredientId, expiryDays, expiryStatus],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stock/expiry/reports?branchId=${expiryBranchId}&ingredientId=${expiryIngredientId}&days=${expiryDays}&status=${expiryStatus}`);
      if (!res.ok) throw new Error("Failed to fetch expiry reports");
      return res.json();
    }
  });

  // Fetch ALL batches (regardless of warning days or alert status) to perform the filter on Tab 2
  const { data: allBatchesForOpening, refetch: refetchAllBatches } = useQuery<any[]>({
    queryKey: ["all-batches-for-opening", expiryBranchId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stock/expiry/reports?branchId=${expiryBranchId}&status=all&days=9999`);
      if (!res.ok) throw new Error("Failed to fetch batches");
      return res.json();
    }
  });

  const handleExportExpiryCSV = () => {
    if (!expiryReportData || expiryReportData.length === 0) {
      toast({ variant: "destructive", title: "No data to export" });
      return;
    }
    
    const headers = [
      "Branch Name",
      "Ingredient Name",
      "Batch Number",
      "State",
      "Quantity Remaining",
      "Unit",
      "Sealed Expiry Date",
      "Active Expiry Date",
      "Days Left",
      "Expiry Status"
    ];

    const rows = expiryReportData.map(batch => [
      batch.branchName,
      batch.ingredientName,
      batch.batchNumber || `B-${batch.id}`,
      batch.isOpened ? "Opened" : "Sealed",
      batch.quantity,
      batch.ingredientUnit,
      batch.sealedExpiryDate ? format(new Date(batch.sealedExpiryDate), "yyyy-MM-dd") : "-",
      batch.expiryDate ? format(new Date(batch.expiryDate), "yyyy-MM-dd") : "-",
      batch.daysLeft !== null ? batch.daysLeft : "-",
      batch.status.toUpperCase()
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expiry_report_${expiryBranchId}_days_${expiryDays}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Expiry report exported successfully" });
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <span>Inventory Expiry Status Report</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track batch expiration statuses, monitor shelf life thresholds, and check open package alerts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Global Branch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">Branch:</span>
            <Select 
              value={expiryBranchId} 
              onValueChange={(val) => setExpiryBranchId(val)}
              disabled={(user?.role as string) !== "admin" && (user?.role as string) !== "supervisor"}
            >
              <SelectTrigger id="global-expiry-branch-filter" className="w-[180px] bg-background">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches?.map((b: any) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2 font-bold" onClick={handleExportExpiryCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="report" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6 h-10 print:hidden">
          <TabsTrigger value="report" className="text-sm font-semibold">Expiry Report</TabsTrigger>
          <TabsTrigger value="mark-opened" className="text-sm font-semibold">Mark Opened</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-6 animate-in fade-in duration-300">
          {/* Specialized Filters Card */}
          <Card className="bg-muted/30 border-primary/20 overflow-hidden print:hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6">

                {/* Ingredient Filter */}
                <div className="grid gap-2">
                  <Label htmlFor="expiry-item-filter" className="flex items-center gap-2 text-sm font-bold">
                    <Coffee className="h-4 w-4 text-primary" /> Item (Ingredient)
                  </Label>
                  <Select value={expiryIngredientId} onValueChange={(val) => setExpiryIngredientId(val)}>
                    <SelectTrigger id="expiry-item-filter" className="bg-background">
                      <SelectValue placeholder="All Items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      {activeIngredients?.map((ing: any) => (
                        <SelectItem key={ing.id} value={String(ing.id)}>{ing.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Days Period Input */}
                <div className="grid gap-2">
                  <Label htmlFor="expiry-days-filter" className="flex items-center gap-2 text-sm font-bold">
                    <Calendar className="h-4 w-4 text-primary" /> Expiration Period (Days)
                  </Label>
                  <Input 
                    id="expiry-days-filter"
                    type="number"
                    min="1"
                    value={expiryDays}
                    onChange={e => setExpiryDays(e.target.value)}
                    className="bg-background"
                    placeholder="e.g. 30"
                  />
                </div>

                {/* Status Filter */}
                <div className="grid gap-2">
                  <Label htmlFor="expiry-status-filter" className="flex items-center gap-2 text-sm font-bold">
                    <FileText className="h-4 w-4 text-primary" /> Expiry Status
                  </Label>
                  <Select value={expiryStatus} onValueChange={(val) => setExpiryStatus(val)}>
                    <SelectTrigger id="expiry-status-filter" className="bg-background">
                      <SelectValue placeholder="Alerts Only" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      <SelectItem value="alert">Alerts (Expired/Expiring)</SelectItem>
                      <SelectItem value="expired">Expired Only</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                      <SelectItem value="ok">Safe / OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className="border-none shadow-xl bg-card/40 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="rounded-xl border border-primary/10 overflow-hidden bg-background/20">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow className="hover:bg-transparent border-primary/10">
                      <TableHead className="font-bold text-foreground">Branch</TableHead>
                      <TableHead className="font-bold text-foreground">Ingredient</TableHead>
                      <TableHead className="font-bold text-foreground">Batch Number</TableHead>
                      <TableHead className="font-bold text-foreground">State</TableHead>
                      <TableHead className="font-bold text-foreground text-right">Remaining Qty</TableHead>
                      <TableHead className="font-bold text-foreground">Sealed Expiry</TableHead>
                      <TableHead className="font-bold text-foreground">Active Expiry</TableHead>
                      <TableHead className="font-bold text-foreground text-right">Days Left</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Status</TableHead>
                      <TableHead className="font-bold text-foreground text-center print:hidden w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingExpiryReport ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground font-bold">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                          Loading expiry reports...
                        </TableCell>
                      </TableRow>
                    ) : expiryReportData?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                          No batches matching the filter criteria found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expiryReportData?.map((batch: any) => {
                        let badgeColor = "bg-green-500/10 text-green-400 border border-green-500/20";
                        if (batch.status === "expired") {
                          badgeColor = "bg-red-500/10 text-red-400 border border-red-500/20 font-bold";
                        } else if (batch.status === "expiring_soon") {
                          badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold";
                        }

                        return (
                          <TableRow key={batch.id} className="border-primary/5 hover:bg-primary/5">
                            <TableCell className="font-bold text-foreground">{batch.branchName}</TableCell>
                            <TableCell className="font-bold text-foreground">{batch.ingredientName}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{batch.batchNumber || `B-${batch.id}`}</TableCell>
                            <TableCell>
                              <Badge variant={batch.isOpened ? "default" : "outline"} className={batch.isOpened ? "bg-blue-600 hover:bg-blue-600 text-white border-transparent" : "text-muted-foreground"}>
                                {batch.isOpened ? "Opened" : "Sealed"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-foreground">
                              {batch.quantity} <span className="text-xs font-normal text-muted-foreground">{batch.ingredientUnit}</span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {batch.sealedExpiryDate ? format(new Date(batch.sealedExpiryDate), "MMM d, yyyy") : "-"}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-foreground">
                              {batch.expiryDate ? format(new Date(batch.expiryDate), "MMM d, yyyy") : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {batch.daysLeft !== null ? (
                                <span className={batch.daysLeft < 0 ? "text-red-400 font-bold" : batch.daysLeft <= 7 ? "text-amber-400 font-bold" : "text-foreground"}>
                                  {batch.daysLeft < 0 ? `Expired (${Math.abs(batch.daysLeft)}d ago)` : `${batch.daysLeft} days`}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={badgeColor}>
                                {batch.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center print:hidden">
                              <div className="flex items-center justify-center gap-2">
                                {!batch.isOpened ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-xs border-blue-200 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold"
                                    onClick={() => {
                                      setUnsealBatch(batch);
                                      setUnsealMode("entire");
                                      setPackageCount(1);
                                      setCustomQtyToOpen("");
                                    }}
                                  >
                                    Open
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic mr-1">Opened</span>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-700 font-semibold"
                                  onClick={() => {
                                    setEditingBatch(batch);
                                    setEditBatchNumber(batch.batchNumber || "");
                                    setEditSealedExpiryDate(batch.sealedExpiryDate ? format(new Date(batch.sealedExpiryDate), "yyyy-MM-dd") : "");
                                    setEditExpiryDate(batch.expiryDate ? format(new Date(batch.expiryDate), "yyyy-MM-dd") : "");
                                    setEditQuantity(String(batch.quantity));
                                  }}
                                >
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mark-opened" className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-none shadow-xl bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Select Sealed Batch to Open</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Choose an ingredient below to view its active sealed packages in this branch. Marking a package as opened recalculates its expiration countdown.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="open-ing-select" className="font-bold text-sm">Select Ingredient</Label>
                <Select value={selectedOpenIngId} onValueChange={setSelectedOpenIngId}>
                  <SelectTrigger id="open-ing-select" className="bg-background">
                    <SelectValue placeholder="Select an ingredient..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Choose an ingredient...</SelectItem>
                    {activeIngredients?.map((ing: any) => (
                      <SelectItem key={ing.id} value={String(ing.id)}>{ing.name} ({ing.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOpenIngId !== "none" && (
                <div>
                  {(() => {
                    const ingId = parseInt(selectedOpenIngId);
                    const ingredientObj = activeIngredients?.find((i: any) => i.id === ingId);
                    const totalStock = ingredientObj?.stockQuantity || 0;
                    const unit = ingredientObj?.unit || "units";
                    
                    const ingredientBatches = allBatchesForOpening?.filter((b: any) => b.ingredientId === ingId) ?? [];
                    const sealedBatches = ingredientBatches.filter((b: any) => !b.isOpened);
                    const sumBatchQty = ingredientBatches.reduce((sum: number, b: any) => sum + parseFloat(b.quantity), 0);
                    const unbatchedStock = Math.max(0, totalStock - sumBatchQty);

                    if (expiryBranchId === "all") {
                      return (
                        <div className="py-8 text-center text-muted-foreground italic bg-muted/20 rounded-lg border border-dashed border-primary/10 text-sm mt-4">
                          Please select a specific branch from the dropdown at the top to manage unbatched stock and mark packages as opened.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        {/* Unbatched Stock Banner and Actions */}
                        {unbatchedStock > 0 && (
                          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-amber-600 dark:text-amber-400 text-sm flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4" /> Unbatched Sealed Stock Detected
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                You have <strong className="text-foreground">{unbatchedStock.toFixed(2)} {unit}</strong> of pre-existing stock not assigned to any batch.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 self-stretch md:self-auto">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="font-bold text-xs border-amber-500/20 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 bg-background"
                                onClick={() => {
                                  setInitializeBatchData({
                                    ingredientId: ingId,
                                    ingredientName: ingredientObj?.name,
                                    ingredientUnit: unit,
                                    maxQuantity: unbatchedStock,
                                  });
                                  setInitQuantity(String(unbatchedStock));
                                  setInitBatchNumber("BULK-INITIAL");
                                  setInitExpiryDate("");
                                }}
                              >
                                Label as Batch
                              </Button>
                              <Button 
                                size="sm" 
                                className="font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white"
                                onClick={() => {
                                  setUnsealBatch({
                                    id: -1,
                                    ingredientId: ingId,
                                    ingredientName: ingredientObj?.name,
                                    ingredientUnit: unit,
                                    quantity: unbatchedStock,
                                    batchNumber: "UNBATCHED-STOCK",
                                    isUnbatched: true
                                  });
                                  setUnsealMode("entire");
                                  setPackageCount(1);
                                  setCustomQtyToOpen("");
                                }}
                              >
                                Mark Portion Opened
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            Active Sealed Batches
                          </h3>
                          {sealedBatches.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground italic bg-muted/20 rounded-lg border border-dashed border-primary/10 text-sm">
                              No active sealed batches found for this ingredient in this branch.
                            </div>
                          ) : (
                            <div className="grid gap-3">
                              {sealedBatches.map((batch: any) => (
                                <div key={batch.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-primary/10 rounded-xl bg-background/50 hover:bg-accent/10 transition-colors gap-4">
                                  <div>
                                    <p className="font-bold text-foreground">Batch Number: <span className="font-mono text-sm text-primary">{batch.batchNumber || `B-${batch.id}`}</span></p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                      <span>Remaining Qty: <strong className="text-foreground">{batch.quantity} {batch.ingredientUnit}</strong></span>
                                      <span>Original Expiry: <strong className="text-foreground">{batch.sealedExpiryDate ? format(new Date(batch.sealedExpiryDate), "MMM d, yyyy") : "None"}</strong></span>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="font-bold gap-1.5 self-stretch sm:self-auto bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => {
                                      setUnsealBatch(batch);
                                      setUnsealMode("entire");
                                      setPackageCount(1);
                                      setCustomQtyToOpen("");
                                    }}
                                  >
                                    <Clock className="h-4 w-4" /> Mark Opened
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unseal Quantity Selector Dialog */}
      <Dialog open={unsealBatch !== null} onOpenChange={(open) => { if (!open) setUnsealBatch(null); }}>
        <DialogContent className="sm:max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Unseal Package / Open Batch
            </DialogTitle>
            <DialogDescription>
              Ingredient: <strong className="text-foreground">{unsealBatch?.ingredientName}</strong><br />
              Batch Number: <span className="font-mono text-xs">{unsealBatch?.batchNumber || `B-${unsealBatch?.id}`}</span>
            </DialogDescription>
          </DialogHeader>

          {unsealBatch && (() => {
            const ingredientObj = activeIngredients?.find((i: any) => i.id === unsealBatch.ingredientId);
            const conversions = ingredientObj?.conversions || [];
            const unit = unsealBatch.ingredientUnit || ingredientObj?.unit || "units";
            const batchQty = parseFloat(unsealBatch.quantity);

            // Calculate current preview of amount to open
            let quantityToOpen = batchQty;
            let displayDetails = "";

            if (unsealMode === "package" && conversions.length > 0) {
              const conv = conversions.find((c: any) => String(c.id) === selectedConversionId);
              if (conv) {
                const factor = parseFloat(String(conv.conversionFactor));
                quantityToOpen = packageCount * factor;
                displayDetails = `Opening ${packageCount} ${conv.unitName}(s) = ${quantityToOpen} ${unit}. Remaining ${batchQty - quantityToOpen} ${unit} will stay sealed.`;
              }
            } else if (unsealMode === "custom") {
              quantityToOpen = parseFloat(customQtyToOpen) || 0;
              displayDetails = `Opening ${quantityToOpen} ${unit}. Remaining ${batchQty - quantityToOpen} ${unit} will stay sealed.`;
            } else {
              displayDetails = `Opening the entire batch of ${batchQty} ${unit}.`;
            }

            const canSubmit = quantityToOpen > 0 && quantityToOpen <= batchQty;

            return (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="unseal-mode" className="font-bold text-sm">How would you like to open this batch?</Label>
                  <Select value={unsealMode} onValueChange={(val: any) => {
                    setUnsealMode(val);
                    if (val === "package" && conversions.length > 0) {
                      setSelectedConversionId(String(conversions[0].id));
                    }
                  }}>
                    <SelectTrigger id="unseal-mode" className="bg-background">
                      <SelectValue placeholder="Select open mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entire">Open Entire Batch ({batchQty} {unit})</SelectItem>
                      {conversions.length > 0 && (
                        <SelectItem value="package">Open by Package (Bottle/Box/Bag)</SelectItem>
                      )}
                      <SelectItem value="custom">Open Custom Quantity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {unsealMode === "package" && conversions.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="pkg-select" className="font-bold text-sm">Package Unit</Label>
                      <Select value={selectedConversionId} onValueChange={setSelectedConversionId}>
                        <SelectTrigger id="pkg-select" className="bg-background">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {conversions.map((c: any) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.unitName} ({c.conversionFactor} {unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pkg-count" className="font-bold text-sm">Quantity to Open</Label>
                      <Input 
                        id="pkg-count"
                        type="number"
                        min="1"
                        value={packageCount}
                        onChange={e => setPackageCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-background"
                      />
                    </div>
                  </div>
                )}

                {unsealMode === "custom" && (
                  <div className="grid gap-2">
                    <Label htmlFor="custom-qty" className="font-bold text-sm">Quantity to Open ({unit})</Label>
                    <Input 
                      id="custom-qty"
                      type="number"
                      min="0.0001"
                      step="any"
                      placeholder={`e.g. 1000`}
                      value={customQtyToOpen}
                      onChange={e => setCustomQtyToOpen(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}

                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground border">
                  {displayDetails}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setUnsealBatch(null)}>
                    Cancel
                  </Button>
                  <Button 
                    disabled={!canSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={async () => {
                      try {
                        const payload = unsealMode === "entire" ? {} : { quantity: quantityToOpen };
                        
                        if (unsealBatch.isUnbatched) {
                          let expiryDateVal = null;
                          const openedShelfLife = ingredientObj?.openedShelfLifeDays;
                          if (openedShelfLife != null) {
                            expiryDateVal = format(new Date(Date.now() + openedShelfLife * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
                          }

                          const res = await fetch(`${API_BASE}/stock/expiry/batches/initialize`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              branchId: parseInt(expiryBranchId),
                              ingredientId: unsealBatch.ingredientId,
                              quantity: quantityToOpen,
                              batchNumber: "OPEN-UNBATCHED",
                              expiryDate: expiryDateVal,
                              isOpened: true
                            }),
                          });
                          if (!res.ok) throw new Error(await res.text());
                        } else {
                          const res = await fetch(`${API_BASE}/stock/expiry/batches/${unsealBatch.id}/open`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          if (!res.ok) throw new Error(await res.text());
                        }
                        
                        toast({ title: "Batch unsealed", description: "Successfully opened the requested quantity." });
                        setUnsealBatch(null);
                        refetchExpiryReport();
                        refetchAllBatches();
                      } catch (err: any) {
                        toast({ variant: "destructive", title: "Failed to open package", description: err.message });
                      }
                    }}
                  >
                    Confirm Open
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Label/Initialize Unbatched Stock Dialog */}
      <Dialog open={initializeBatchData !== null} onOpenChange={(open) => { if (!open) setInitializeBatchData(null); }}>
        <DialogContent className="sm:max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Label Stock as Batch
            </DialogTitle>
            <DialogDescription>
              Assign a batch number and expiry date to pre-existing unbatched stock for <strong className="text-foreground">{initializeBatchData?.ingredientName}</strong>.
            </DialogDescription>
          </DialogHeader>

          {initializeBatchData && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="init-qty" className="font-bold text-sm">Quantity to Label ({initializeBatchData.ingredientUnit})</Label>
                <Input 
                  id="init-qty"
                  type="number"
                  max={initializeBatchData.maxQuantity}
                  min="0.0001"
                  step="any"
                  value={initQuantity}
                  onChange={e => setInitQuantity(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">Max available: {initializeBatchData.maxQuantity.toFixed(2)} {initializeBatchData.ingredientUnit}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="init-batch-number" className="font-bold text-sm">Batch Number</Label>
                <Input 
                  id="init-batch-number"
                  value={initBatchNumber}
                  onChange={e => setInitBatchNumber(e.target.value)}
                  className="bg-background"
                  placeholder="e.g. BULK-INITIAL"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="init-expiry" className="font-bold text-sm">Sealed Expiry Date</Label>
                <Input 
                  id="init-expiry"
                  type="date"
                  value={initExpiryDate}
                  onChange={e => setInitExpiryDate(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setInitializeBatchData(null)}>
                  Cancel
                </Button>
                <Button 
                  disabled={!initQuantity || parseFloat(initQuantity) <= 0 || parseFloat(initQuantity) > initializeBatchData.maxQuantity}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/stock/expiry/batches/initialize`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          branchId: parseInt(expiryBranchId),
                          ingredientId: initializeBatchData.ingredientId,
                          quantity: parseFloat(initQuantity),
                          batchNumber: initBatchNumber,
                          expiryDate: initExpiryDate || null,
                          isOpened: false
                        }),
                      });
                      if (!res.ok) throw new Error(await res.text());
                      
                      toast({ title: "Batch created", description: "Unbatched stock converted to batch successfully." });
                      setInitializeBatchData(null);
                      refetchExpiryReport();
                      refetchAllBatches();
                    } catch (err: any) {
                      toast({ variant: "destructive", title: "Failed to create batch", description: err.message });
                    }
                  }}
                >
                  Label Batch
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={editingBatch !== null} onOpenChange={(open) => { if (!open) setEditingBatch(null); }}>
        <DialogContent className="sm:max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Edit Batch Details
            </DialogTitle>
            <DialogDescription>
              Modify the batch number, quantity, and expiry dates for <strong className="text-foreground">{editingBatch?.ingredientName}</strong>.
            </DialogDescription>
          </DialogHeader>

          {editingBatch && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-batch-number" className="font-bold text-sm">Batch Number</Label>
                <Input 
                  id="edit-batch-number"
                  value={editBatchNumber}
                  onChange={e => setEditBatchNumber(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-qty" className="font-bold text-sm">Quantity ({editingBatch.ingredientUnit})</Label>
                <Input 
                  id="edit-qty"
                  type="number"
                  step="any"
                  value={editQuantity}
                  onChange={e => setEditQuantity(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">Editing quantity will adjust the branch inventory stock levels and log a stock movement.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-sealed-expiry" className="font-bold text-sm">Sealed Expiry Date</Label>
                <Input 
                  id="edit-sealed-expiry"
                  type="date"
                  value={editSealedExpiryDate}
                  onChange={e => setEditSealedExpiryDate(e.target.value)}
                  className="bg-background"
                />
              </div>

              {editingBatch.isOpened && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-active-expiry" className="font-bold text-sm">Active Expiry Date (Opened)</Label>
                  <Input 
                    id="edit-active-expiry"
                    type="date"
                    value={editExpiryDate}
                    onChange={e => setEditExpiryDate(e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingBatch(null)} disabled={isSavingEdit}>
                  Cancel
                </Button>
                <Button 
                  disabled={isSavingEdit || !editQuantity || parseFloat(editQuantity) < 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  onClick={async () => {
                    setIsSavingEdit(true);
                    try {
                      const res = await fetch(`${API_BASE}/stock/expiry/batches/${editingBatch.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          batchNumber: editBatchNumber,
                          quantity: parseFloat(editQuantity),
                          sealedExpiryDate: editSealedExpiryDate || null,
                          expiryDate: editingBatch.isOpened ? (editExpiryDate || null) : (editSealedExpiryDate || null),
                        }),
                      });
                      if (!res.ok) throw new Error(await res.text());
                      
                      toast({ title: "Batch updated", description: "Successfully updated batch details." });
                      setEditingBatch(null);
                      refetchExpiryReport();
                      refetchAllBatches();
                    } catch (err: any) {
                      toast({ variant: "destructive", title: "Failed to update batch", description: err.message });
                    } finally {
                      setIsSavingEdit(false);
                    }
                  }}
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
