import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useListStockMovements, useGetLowStockIngredients, useRestockIngredient, useListIngredients, useUpdateIngredient } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Plus, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, PackageOpen, Download, Settings2, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

type LowStockItem = {
  id: number;
  name: string;
  unit: string;
  ingredientType: string;
  stockQuantity: number;
  lowStockThreshold: number;
  conversions?: { id: number; unitName: string; conversionFactor: number; isDefaultPurchase: boolean; createdAt?: string }[];
};

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  ingredientType: string;
  stockQuantity: number;
  lowStockThreshold: number;
  conversions: { id: number; unitName: string; conversionFactor: string | number }[];
};

export default function StockAdmin() {
  const { selectedBranchId } = useAuth();
  const { data: movements, isLoading, refetch: refetchMovements } = useListStockMovements({ 
    branchId: (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId 
  } as any);
  const { data: lowStock, refetch: refetchLowStock } = useGetLowStockIngredients({ 
    branchId: (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId 
  } as any);
  const { data: ingredientsData, refetch: refetchIngredients } = useListIngredients({ 
    active: true,
    branchId: (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId 
  } as any);
  const ingredients = ingredientsData as unknown as Ingredient[];

  const { toast } = useToast();

  const { mutate: restockSingle } = useRestockIngredient({
    mutation: {
      onError: () => {
        toast({ variant: "destructive", title: "Failed to update one or more stock entries" });
      }
    }
  });

  // Startup stock state: map of ingredientId → input value
  const [startupValues, setStartupValues] = useState<Record<number, string>>({});
  const [isSavingStartup, setIsSavingStartup] = useState(false);

  // Low-stock threshold editing
  const [thresholdEdit, setThresholdEdit] = useState<LowStockItem | null>(null);
  const [newThreshold, setNewThreshold] = useState("");
  const [isLowStockExpanded, setIsLowStockExpanded] = useState(true);

  const [daysThreshold, setDaysThreshold] = useState("3");
  const [statusFilter, setStatusFilter] = useState("alert");
  const [activeTab, setActiveTab] = useState("movements");

  // Pagination states
  const [movementsPage, setMovementsPage] = useState(0);
  const [movementsPageSize, setMovementsPageSize] = useState(10);

  const [startupPage, setStartupPage] = useState(0);
  const [startupPageSize, setStartupPageSize] = useState(10);

  const [expiryPage, setExpiryPage] = useState(0);
  const [expiryPageSize, setExpiryPageSize] = useState(10);

  // Reset pages when branch or filters change
  useEffect(() => {
    setMovementsPage(0);
    setStartupPage(0);
    setExpiryPage(0);
  }, [selectedBranchId]);

  useEffect(() => {
    setExpiryPage(0);
  }, [daysThreshold, statusFilter]);

  // State for unsealing packages
  const [unsealBatch, setUnsealBatch] = useState<any | null>(null);
  const [unsealMode, setUnsealMode] = useState<"entire" | "package" | "custom">("entire");
  const [selectedConversionId, setSelectedConversionId] = useState<string>("");
  const [packageCount, setPackageCount] = useState<number>(1);
  const [customQtyToOpen, setCustomQtyToOpen] = useState<string>("");

  const { data: expiryReports, refetch: refetchExpiryReports } = useQuery<any[]>({
    queryKey: ["expiry-reports", selectedBranchId, daysThreshold, statusFilter],
    queryFn: async () => {
      const branch = (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId;
      const res = await fetch(`/api/stock/expiry/reports?branchId=${branch}&days=${daysThreshold}&status=${statusFilter}`);
      if (!res.ok) throw new Error("Failed to fetch expiry reports");
      return res.json();
    }
  });

  const { data: expiryAlerts, refetch: refetchExpiryAlerts } = useQuery<any[]>({
    queryKey: ["expiry-alerts-banner", selectedBranchId],
    queryFn: async () => {
      const branch = (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId;
      const res = await fetch(`/api/stock/expiry/reports?branchId=${branch}&days=3&status=alert`);
      if (!res.ok) throw new Error("Failed to fetch expiry alerts");
      return res.json();
    }
  });

  const { mutate: updateLowThreshold } = useUpdateIngredient({
    mutation: {
      onSuccess: () => {
        toast({ title: "Low stock threshold updated" });
        refetchLowStock();
        refetchIngredients();
        setThresholdEdit(null);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to update low stock threshold" });
      },
    },
  });

  const handleSaveThreshold = () => {
    if (!thresholdEdit) return;
    const val = parseFloat(newThreshold);
    if (isNaN(val) || val < 0) {
      toast({ variant: "destructive", title: "Enter a valid threshold value" });
      return;
    }
    updateLowThreshold({ id: thresholdEdit.id, data: { lowStockThreshold: val } });
  };

  const handleSaveStartupStock = async () => {
    if (!selectedBranchId) {
      toast({ variant: "destructive", title: "Select a branch first", description: "You must select a specific branch to update its stock." });
      return;
    }
    const entries = Object.entries(startupValues).filter(([, v]) => v !== "" && !isNaN(parseFloat(v)));
    if (entries.length === 0) {
      toast({ variant: "destructive", title: "No quantities entered" });
      return;
    }

    setIsSavingStartup(true);
    let saved = 0;
    for (const [id, val] of entries) {
      const ing = ingredients?.find(i => i.id === parseInt(id));
      if (!ing) continue;
      const target = parseFloat(val);
      const current = ing.stockQuantity ?? 0;
      const diff = target - current;
      restockSingle({
        id: parseInt(id),
        data: {
          quantity: diff,
          note: "Opening / startup stock entry",
          branchId: selectedBranchId
        } as any
      });
      saved++;
    }

    setTimeout(() => {
      refetchMovements();
      refetchLowStock();
      refetchIngredients();
      setStartupValues({});
      setIsSavingStartup(false);
      toast({ title: `Startup stock saved for ${saved} ingredient${saved !== 1 ? "s" : ""}` });
    }, 800);
  };

  const handleExportStock = () => {
    if (!ingredients || ingredients.length === 0) {
      toast({ variant: "destructive", title: "No ingredients to export" });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `Current_Stock_${timestamp}.csv`;

    const header = ['Name', 'Type', 'Unit', 'Current Stock', 'Low Stock Threshold', 'Status'];
    const rows = ingredients.map(ing => {
      const stock = Number(ing.stockQuantity ?? 0);
      const threshold = Number(ing.lowStockThreshold ?? 0);
      const status = stock <= threshold ? 'Low Stock' : 'OK';
      return [
        `"${(ing.name || '').replace(/"/g, '""')}"`,
        ing.ingredientType,
        ing.unit,
        stock,
        threshold,
        status,
      ].join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(["\ufeff", csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: `Stock exported as ${filename}` });
  };

  const getMovementIcon = (type: string) => {
    if (type === 'restock' || type === 'opening') return <ArrowDownToLine className="h-4 w-4 text-green-500" />;
    return <ArrowUpFromLine className="h-4 w-4 text-destructive" />;
  };

  // Stock Movements pagination calculations
  const totalMovements = movements?.length || 0;
  const totalMovementsPages = Math.ceil(totalMovements / movementsPageSize);
  const movementsStartIndex = movementsPage * movementsPageSize;
  const movementsEndIndex = movementsStartIndex + movementsPageSize;
  const paginatedMovements = movements?.slice(movementsStartIndex, movementsEndIndex) || [];

  // Startup stock pagination calculations
  const ingredientsFiltered = ingredients ? ingredients.filter(i => i.unit !== "") : [];
  const totalStartup = ingredientsFiltered.length;
  const totalStartupPages = Math.ceil(totalStartup / startupPageSize);
  const startupStartIndex = startupPage * startupPageSize;
  const startupEndIndex = startupStartIndex + startupPageSize;
  const paginatedStartup = ingredientsFiltered.slice(startupStartIndex, startupEndIndex);

  // Expiry tracking pagination calculations
  const totalExpiry = expiryReports?.length || 0;
  const totalExpiryPages = Math.ceil(totalExpiry / expiryPageSize);
  const expiryStartIndex = expiryPage * expiryPageSize;
  const expiryEndIndex = expiryStartIndex + expiryPageSize;
  const paginatedExpiry = expiryReports?.slice(expiryStartIndex, expiryEndIndex) || [];

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Stock Management</h1>
            <p className="text-muted-foreground mt-1">Track inventory movements and record deliveries.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportStock}>
            <Download className="h-4 w-4" /> Export Stock
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/admin/stock/receive-delivery">
              <Plus className="h-4 w-4" /> Receive Delivery
            </Link>
          </Button>
        </div>
      </div>

      {expiryAlerts && expiryAlerts.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-3 bg-amber-500/10">
            <CardTitle className="text-amber-500 flex items-center justify-between text-lg font-bold">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Inventory Expiry Warnings</span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/20 font-semibold" onClick={() => setActiveTab("expiry")}>
                View Batches
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 text-sm text-amber-500">
            There are <strong>{expiryAlerts.filter((a: any) => a.status === "expired").length}</strong> expired batch(es) and <strong>{expiryAlerts.filter((a: any) => a.status === "expiring_soon").length}</strong> batch(es) expiring within 3 days. Immediate action is recommended.
          </CardContent>
        </Card>
      )}

      {lowStock && lowStock.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader
            className="pb-3 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors select-none"
            onClick={() => setIsLowStockExpanded(!isLowStockExpanded)}
          >
            <CardTitle className="text-destructive flex items-center justify-between text-lg w-full">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Low Stock Alerts ({lowStock.length})</span>
              </div>
              <div className="flex items-center text-destructive">
                {isLowStockExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
          {isLowStockExpanded && (
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStock.map(ing => (
                <button
                  key={ing.id}
                  type="button"
                  onClick={() => { setThresholdEdit(ing); setNewThreshold(String(ing.lowStockThreshold)); }}
                  className="flex justify-between items-center p-3 border rounded bg-background hover:bg-accent/40 hover:border-foreground/30 transition-colors text-left w-full cursor-pointer"
                >
                  <div>
                    <div className="font-bold">{ing.name}</div>
                    <div className="text-sm text-muted-foreground">Threshold: {ing.lowStockThreshold} {ing.unit}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-destructive text-lg">{ing.stockQuantity}</div>
                    <div className="text-xs text-muted-foreground">{ing.unit}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="startup" className="gap-1.5">
            <PackageOpen className="h-4 w-4" /> Startup Stock
          </TabsTrigger>
          <TabsTrigger value="expiry" className="gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Expiry Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Stock After</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : paginatedMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No recent movements.</TableCell>
                      </TableRow>
                    ) : (
                      paginatedMovements.map(mov => (
                        <TableRow key={mov.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(mov.createdAt), "MMM d, yyyy h:mm a")}
                          </TableCell>
                          <TableCell className="font-medium">{mov.ingredientName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 capitalize">
                              {getMovementIcon(mov.movementType)}
                              <span>{mov.movementType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={mov.quantity > 0 ? "text-green-600" : "text-destructive"}>
                              {mov.quantity > 0 ? "+" : ""}{mov.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono">{mov.quantityAfter}</TableCell>
                          <TableCell>{mov.createdByName}</TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                            {mov.note || (mov.orderId ? `Order #${mov.orderId}` : "-")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {totalMovements > 0 && (
              <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div>
                    Showing <span className="font-medium text-foreground">{movementsStartIndex + 1}</span> to{" "}
                    <span className="font-medium text-foreground">{Math.min(movementsEndIndex, totalMovements)}</span> of{" "}
                    <span className="font-medium text-foreground">{totalMovements}</span> entries
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Show</span>
                    <Select
                      value={String(movementsPageSize)}
                      onValueChange={(val) => {
                        setMovementsPageSize(Number(val));
                        setMovementsPage(0);
                      }}
                    >
                      <SelectTrigger className="h-8 w-16 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>entries</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMovementsPage(p => Math.max(0, p - 1))} 
                    disabled={movementsPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm font-medium text-foreground">Page {movementsPage + 1}</span>
                    <span className="text-sm text-muted-foreground">of {totalMovementsPages || 1}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMovementsPage(p => p + 1)} 
                    disabled={movementsPage >= totalMovementsPages - 1}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="startup">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PackageOpen className="h-5 w-5 text-primary" />
                    Enter Startup / Opening Stock
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set the current quantity on hand for each ingredient. Leave blank to skip.
                    The system will record the difference as an opening stock entry.
                  </p>
                </div>
                <Button onClick={handleSaveStartupStock} disabled={isSavingStartup} className="shrink-0">
                  {isSavingStartup ? "Saving…" : "Save All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right w-48">Set Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!ingredients ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">Loading…</TableCell>
                      </TableRow>
                    ) : paginatedStartup.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No ingredients.</TableCell>
                      </TableRow>
                    ) : (
                      paginatedStartup.map(ing => (
                        <TableRow key={ing.id}>
                          <TableCell className="font-medium">{ing.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-xs">{ing.ingredientType}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={(ing.stockQuantity ?? 0) <= (ing.lowStockThreshold ?? 0) ? "text-destructive font-bold" : ""}>
                              {ing.stockQuantity ?? 0}
                            </span>
                            <span className="text-muted-foreground text-xs ml-1">{ing.unit}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={String(ing.stockQuantity ?? 0)}
                                value={startupValues[ing.id] ?? ""}
                                onChange={e => setStartupValues(prev => ({ ...prev, [ing.id]: e.target.value }))}
                                className="w-32 text-right"
                              />
                              <span className="text-muted-foreground text-xs w-8 shrink-0">{ing.unit}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {totalStartup > 0 && (
              <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div>
                    Showing <span className="font-medium text-foreground">{startupStartIndex + 1}</span> to{" "}
                    <span className="font-medium text-foreground">{Math.min(startupEndIndex, totalStartup)}</span> of{" "}
                    <span className="font-medium text-foreground">{totalStartup}</span> entries
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Show</span>
                    <Select
                      value={String(startupPageSize)}
                      onValueChange={(val) => {
                        setStartupPageSize(Number(val));
                        setStartupPage(0);
                      }}
                    >
                      <SelectTrigger className="h-8 w-16 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>entries</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStartupPage(p => Math.max(0, p - 1))} 
                    disabled={startupPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm font-medium text-foreground">Page {startupPage + 1}</span>
                    <span className="text-sm text-muted-foreground">of {totalStartupPages || 1}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStartupPage(p => p + 1)} 
                    disabled={startupPage >= totalStartupPages - 1}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="expiry">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Expiry Tracking & Batches</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Track individual ingredient batches, monitor shelf lives, and open or discard packages.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="days-input" className="text-xs shrink-0 font-medium">Alert Threshold (Days)</Label>
                    <Input 
                      id="days-input" 
                      type="number" 
                      min="1" 
                      value={daysThreshold} 
                      onChange={e => setDaysThreshold(e.target.value)} 
                      className="w-16 h-8 text-center text-xs font-semibold" 
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue placeholder="Filter status" />
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
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Ingredient</TableHead>
                      <TableHead className="font-bold">Batch#</TableHead>
                      <TableHead className="font-bold">State</TableHead>
                      <TableHead className="text-right font-bold">Qty Remaining</TableHead>
                      <TableHead className="font-bold">Sealed Expiry</TableHead>
                      <TableHead className="font-bold">Active Expiry</TableHead>
                      <TableHead className="text-right font-bold">Days Left</TableHead>
                      <TableHead className="text-center font-bold w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!expiryReports ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : paginatedExpiry.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No matching batches found.</TableCell>
                      </TableRow>
                    ) : (
                      paginatedExpiry.map(batch => {
                        let badgeColor = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
                        if (batch.status === "expired") {
                          badgeColor = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/50";
                        } else if (batch.status === "expiring_soon") {
                          badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-semibold";
                        }

                        return (
                          <TableRow key={batch.id} className="hover:bg-muted/10">
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
                                <Badge className={badgeColor}>
                                  {batch.daysLeft < 0 ? `Expired (${Math.abs(batch.daysLeft)}d ago)` : `${batch.daysLeft} days`}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">No Expiry</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {!batch.isOpened && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-xs border-blue-200 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold dark:border-blue-900/40 dark:hover:bg-blue-900/10"
                                    onClick={() => {
                                      setUnsealBatch(batch);
                                      setUnsealMode("entire");
                                      setPackageCount(1);
                                      setCustomQtyToOpen("");
                                    }}
                                  >
                                    Open
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="h-7 text-xs"
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to discard this batch of ${batch.ingredientName}? This will set remaining quantity to 0 and log a waste movement.`)) {
                                      try {
                                        await api(`/api/stock/expiry/batches/${batch.id}/discard`, { method: "POST" });
                                        toast({ title: "Batch discarded", description: "Stock and movement logs updated." });
                                        refetchExpiryReports();
                                        refetchExpiryAlerts();
                                        refetchIngredients();
                                        refetchMovements();
                                        refetchLowStock();
                                      } catch (err: any) {
                                        toast({ variant: "destructive", title: "Failed to discard batch", description: err.message });
                                      }
                                    }
                                  }}
                                >
                                  Discard
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
            {totalExpiry > 0 && (
              <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div>
                    Showing <span className="font-medium text-foreground">{expiryStartIndex + 1}</span> to{" "}
                    <span className="font-medium text-foreground">{Math.min(expiryEndIndex, totalExpiry)}</span> of{" "}
                    <span className="font-medium text-foreground">{totalExpiry}</span> entries
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Show</span>
                    <Select
                      value={String(expiryPageSize)}
                      onValueChange={(val) => {
                        setExpiryPageSize(Number(val));
                        setExpiryPage(0);
                      }}
                    >
                      <SelectTrigger className="h-8 w-16 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>entries</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setExpiryPage(p => Math.max(0, p - 1))} 
                    disabled={expiryPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm font-medium text-foreground">Page {expiryPage + 1}</span>
                    <span className="text-sm text-muted-foreground">of {totalExpiryPages || 1}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setExpiryPage(p => p + 1)} 
                    disabled={expiryPage >= totalExpiryPages - 1}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Low stock threshold editor dialog */}
      <Dialog open={thresholdEdit !== null} onOpenChange={(open) => { if (!open) setThresholdEdit(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
              Low Stock Alert Settings
            </DialogTitle>
          </DialogHeader>
          {thresholdEdit && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-lg">{thresholdEdit.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{thresholdEdit.ingredientType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded border p-3 bg-muted/30">
                  <Label className="text-xs text-muted-foreground">Current Stock</Label>
                  <p className="text-xl font-bold">{thresholdEdit.stockQuantity}</p>
                  <p className="text-xs text-muted-foreground">{thresholdEdit.unit}</p>
                </div>
                <div className="rounded border p-3 bg-muted/30">
                  <Label className="text-xs text-muted-foreground">Current Threshold</Label>
                  <p className="text-xl font-bold">{thresholdEdit.lowStockThreshold}</p>
                  <p className="text-xs text-muted-foreground">{thresholdEdit.unit}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-threshold">New Low Stock Threshold ({thresholdEdit.unit})</Label>
                <Input
                  id="new-threshold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder="Enter threshold value"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setThresholdEdit(null)}>Cancel</Button>
                <Button onClick={handleSaveThreshold}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            const ingredientObj = ingredients?.find((i: any) => i.id === unsealBatch.ingredientId);
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
                        await api(`/api/stock/expiry/batches/${unsealBatch.id}/open`, {
                          method: "POST",
                          body: JSON.stringify(payload),
                        });
                        
                        toast({ title: "Batch unsealed", description: "Successfully opened the requested quantity." });
                        setUnsealBatch(null);
                        refetchExpiryReports();
                        refetchExpiryAlerts();
                        refetchIngredients();
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
          })() }
        </DialogContent>
      </Dialog>
    </div>
  );
}
