import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Factory,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  History,
  Calculator,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Scale,
  DollarSign,
  Info,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface BomItem {
  id?: number;
  ingredientId: number;
  ingredientName?: string;
  ingredientUnit?: string;
  quantity: number;
  unit: string;
  costPerUnit?: number;
  totalItemCost?: number;
}

interface BomFormula {
  id: number;
  targetIngredientId: number;
  targetIngredientName: string;
  targetIngredientUnit: string;
  targetIngredientType: string;
  yieldQuantity: number;
  yieldUnit: string;
  notes?: string;
  isActive: boolean;
  totalFormulaCost: number;
  estimatedCostPerUnit: number;
  items: BomItem[];
  createdAt: string;
  updatedAt: string;
}

interface ProcessItem {
  ingredientId: number;
  ingredientName: string;
  ingredientUnit: string;
  recipeBaseQty: number;
  recipeBaseUnit: string;
  calculatedQuantity: number;
  actualQuantity: number;
  unitCost: number;
  estimatedTotalCost: number;
  currentStock: number;
  isSufficientStock: boolean;
}

interface ProcessCalculation {
  targetIngredientId: number;
  targetIngredientName: string;
  targetIngredientUnit: string;
  processedQuantity: number;
  baseYieldQuantity: number;
  multiplier: number;
  calculatedBatchCost: number;
  estimatedFinishedCostPerUnit: number;
  items: ProcessItem[];
}

interface ManufacturingRun {
  id: number;
  branchId: number;
  branchName: string;
  targetIngredientId: number;
  targetIngredientName: string;
  producedQuantity: number;
  producedUnit: string;
  totalCost: number;
  status: string;
  preparedById: number;
  preparedByName: string;
  notes?: string;
  createdAt: string;
  items: {
    id: number;
    ingredientId: number;
    ingredientName: string;
    plannedQuantity: number;
    actualQuantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }[];
}

async function apiJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
    }
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || `Server returned HTTP ${res.status}`);
  }
  return data;
}

export default function ManufacturingPage() {
  const { user, selectedBranchId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const activeBranchId = selectedBranchId || user?.branchId || 1;

  const [activeTab, setActiveTab] = useState<string>("process");

  // ── Queries ─────────────────────────────────────────────────────────────
  const { data: boms = [], isLoading: isLoadingBoms } = useQuery<BomFormula[]>({
    queryKey: ["/api/admin/manufacturing/boms"],
    queryFn: () => apiJson("/api/admin/manufacturing/boms"),
  });

  const { data: ingredients = [] } = useQuery<any[]>({
    queryKey: ["/api/ingredients"],
    queryFn: () => apiJson("/api/ingredients"),
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/branches"],
    queryFn: () => apiJson("/api/admin/branches"),
  });

  const { data: runs = [], isLoading: isLoadingRuns } = useQuery<ManufacturingRun[]>({
    queryKey: ["/api/admin/manufacturing/runs", activeBranchId],
    queryFn: () => apiJson(`/api/admin/manufacturing/runs?branchId=${activeBranchId}`),
  });

  // ── Preparation Process State ──────────────────────────────────────────
  const [processBranchId, setProcessBranchId] = useState<number>(activeBranchId);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [targetQuantity, setTargetQuantity] = useState<string>("");
  const [processCalculation, setProcessCalculation] = useState<ProcessCalculation | null>(null);
  const [processNotes, setProcessNotes] = useState<string>("");
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isTargetPopoverOpen, setIsTargetPopoverOpen] = useState(false);
  const [isBomTargetPopoverOpen, setIsBomTargetPopoverOpen] = useState(false);
  const [bomItemPopovers, setBomItemPopovers] = useState<Record<number, boolean>>({});

  // Editable actual quantities state: ingredientId -> actualQuantity
  const [editedQuantities, setEditedQuantities] = useState<Record<number, number>>({});

  // ── BOM Modal State ───────────────────────────────────────────────────
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [editingBomId, setEditingBomId] = useState<number | null>(null);
  const [bomTargetId, setBomTargetId] = useState<string>("");
  const [bomYieldQty, setBomYieldQty] = useState<string>("1000");
  const [bomYieldUnit, setBomYieldUnit] = useState<string>("ml");
  const [bomNotes, setBomNotes] = useState<string>("");
  const [bomFormItems, setBomFormItems] = useState<{ ingredientId: number; quantity: number; unit: string }[]>([]);

  // ── History View Modal State ─────────────────────────────────────────
  const [viewingRun, setViewingRun] = useState<ManufacturingRun | null>(null);

  // ── Calculate Process Mutation ────────────────────────────────────────
  const calculateMutation = useMutation({
    mutationFn: (payload: { targetIngredientId: number; processedQuantity: number; branchId: number }) =>
      apiJson("/api/admin/manufacturing/process/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data: ProcessCalculation) => {
      setProcessCalculation(data);
      const initialEdited: Record<number, number> = {};
      data.items.forEach((item) => {
        initialEdited[item.ingredientId] = item.actualQuantity;
      });
      setEditedQuantities(initialEdited);
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Calculation Error", description: err.message });
      setProcessCalculation(null);
    },
  });

  const handleCalculate = (targetId: number, qtyStr: string, branch: number) => {
    const qty = parseFloat(qtyStr);
    if (!targetId || isNaN(qty) || qty <= 0) {
      setProcessCalculation(null);
      return;
    }
    calculateMutation.mutate({
      targetIngredientId: targetId,
      processedQuantity: qty,
      branchId: branch,
    });
  };

  // ── Submit Process Mutation ───────────────────────────────────────────
  const submitProcessMutation = useMutation({
    mutationFn: (payload: any) =>
      apiJson("/api/admin/manufacturing/process/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      toast({
        title: "Preparation Complete! 🎉",
        description: `Successfully produced ${data.run.producedQuantity} ${data.run.producedUnit} of ${data.run.targetIngredientName}. Stock updated!`,
      });
      setIsSubmitConfirmOpen(false);
      setProcessCalculation(null);
      setSelectedTargetId(null);
      setTargetQuantity("");
      setProcessNotes("");
      setEditedQuantities({});
      queryClient.invalidateQueries({ queryKey: ["/api/admin/manufacturing/runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/manufacturing/boms"] });
      setActiveTab("history");
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Submission Failed", description: err.message });
    },
  });

  const handleSubmitProcess = () => {
    if (!processCalculation || !selectedTargetId) return;

    const itemsToSubmit = processCalculation.items.map((item) => ({
      ingredientId: item.ingredientId,
      plannedQuantity: item.calculatedQuantity,
      actualQuantity: editedQuantities[item.ingredientId] ?? item.calculatedQuantity,
      unit: item.recipeBaseUnit,
    }));

    submitProcessMutation.mutate({
      branchId: processBranchId,
      targetIngredientId: selectedTargetId,
      producedQuantity: parseFloat(targetQuantity),
      producedUnit: processCalculation.targetIngredientUnit,
      notes: processNotes,
      items: itemsToSubmit,
    });
  };

  // ── Save BOM Mutation ──────────────────────────────────────────────────
  const saveBomMutation = useMutation({
    mutationFn: (payload: any) =>
      apiJson("/api/admin/manufacturing/boms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "BOM formula saved successfully" });
      setIsBomModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/manufacturing/boms"] });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  // ── Delete BOM Mutation ────────────────────────────────────────────────
  const deleteBomMutation = useMutation({
    mutationFn: (bomId: number) =>
      apiJson(`/api/admin/manufacturing/boms/${bomId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Deleted", description: "BOM formula removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/manufacturing/boms"] });
    },
  });

  const openCreateBomModal = () => {
    setEditingBomId(null);
    setBomTargetId("");
    setBomYieldQty("1000");
    setBomYieldUnit("ml");
    setBomNotes("");
    setBomFormItems([]);
    setIsBomModalOpen(true);
  };

  const openEditBomModal = (bom: BomFormula) => {
    setEditingBomId(bom.id);
    setBomTargetId(bom.targetIngredientId.toString());
    setBomYieldQty(bom.yieldQuantity.toString());
    setBomYieldUnit(bom.yieldUnit);
    setBomNotes(bom.notes || "");
    setBomFormItems(
      bom.items.map((i) => ({
        ingredientId: i.ingredientId,
        quantity: i.quantity,
        unit: i.unit,
      }))
    );
    setIsBomModalOpen(true);
  };

  const handleSaveBom = () => {
    if (!bomTargetId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select a target manufactured ingredient" });
      return;
    }
    const yieldQty = parseFloat(bomYieldQty);
    if (isNaN(yieldQty) || yieldQty <= 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "Standard yield quantity must be greater than zero" });
      return;
    }
    if (bomFormItems.length === 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please add at least one raw component ingredient" });
      return;
    }

    saveBomMutation.mutate({
      targetIngredientId: parseInt(bomTargetId, 10),
      yieldQuantity: yieldQty,
      yieldUnit: bomYieldUnit,
      notes: bomNotes,
      items: bomFormItems,
    });
  };

  // Helper to add raw ingredient item to BOM form
  const addBomFormItem = () => {
    const available = ingredients.filter(
      (ing) => !bomFormItems.some((bi) => bi.ingredientId === ing.id) && ing.id.toString() !== bomTargetId
    );
    if (available.length === 0) {
      toast({ title: "No more ingredients available" });
      return;
    }
    const first = available[0];
    setBomFormItems([...bomFormItems, { ingredientId: first.id, quantity: 100, unit: first.unit || "g" }]);
  };

  // Live calculation of totals for current process calculation with edited quantities
  const liveTotalCost = processCalculation
    ? processCalculation.items.reduce((sum, item) => {
        const actualQty = editedQuantities[item.ingredientId] ?? item.calculatedQuantity;
        return sum + actualQty * item.unitCost;
      }, 0)
    : 0;

  const liveUnitCost = processCalculation && parseFloat(targetQuantity) > 0 ? liveTotalCost / parseFloat(targetQuantity) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
        {/* Header Banner */}
        <header className="px-6 py-5 border-b bg-card shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Factory className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">Manufacturing & Preparation</h1>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  Prepare in-house sauces, syrups, and sub-items from raw inventory with BOM formulas and live stock calculation.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreateBomModal} className="font-bold gap-2 shadow-md">
              <Plus className="h-4 w-4" /> Define New BOM Recipe
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-4 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="process" className="gap-2 font-bold text-xs rounded-lg">
                <FlaskConical className="h-3.5 w-3.5" /> Preparation Process
              </TabsTrigger>
              <TabsTrigger value="boms" className="gap-2 font-bold text-xs rounded-lg">
                <Layers className="h-3.5 w-3.5" /> BOM Recipes ({boms.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 font-bold text-xs rounded-lg">
                <History className="h-3.5 w-3.5" /> History & Audits
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Preparation Process (Batch Execution) */}
            <TabsContent value="process" className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Process Config Panel */}
                <Card className="lg:col-span-1 border-primary/20 shadow-md">
                  <CardHeader className="bg-primary/5 pb-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                      <Calculator className="h-5 w-5" /> Execute Preparation Batch
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Select the branch, target manufactured item, and enter processed output quantity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Branch Selector */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Preparation Branch</Label>
                      <Select
                        value={processBranchId.toString()}
                        onValueChange={(val) => {
                          const bid = parseInt(val, 10);
                          setProcessBranchId(bid);
                          if (selectedTargetId && targetQuantity) {
                            handleCalculate(selectedTargetId, targetQuantity, bid);
                          }
                        }}
                      >
                        <SelectTrigger className="font-semibold">
                          <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((b: any) => (
                            <SelectItem key={b.id} value={b.id.toString()}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Manufactured Item Selector */}
                    <div className="space-y-1.5 flex flex-col">
                      <Label className="text-xs font-bold">Manufactured Item to Prepare</Label>
                      <Popover open={isTargetPopoverOpen} onOpenChange={setIsTargetPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between font-bold text-primary h-10 text-xs"
                          >
                            {selectedTargetId
                              ? boms.find((b) => b.targetIngredientId === selectedTargetId)?.targetIngredientName || "Select Manufactured Item"
                              : "Search & Select Manufactured Item (BOM)..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search manufactured item..." />
                            <CommandList className="max-h-[250px] overflow-y-auto">
                              <CommandEmpty>No manufactured items found.</CommandEmpty>
                              <CommandGroup>
                                {boms.map((bom) => (
                                  <CommandItem
                                    key={bom.targetIngredientId}
                                    value={bom.targetIngredientName}
                                    onSelect={() => {
                                      setSelectedTargetId(bom.targetIngredientId);
                                      if (targetQuantity) {
                                        handleCalculate(bom.targetIngredientId, targetQuantity, processBranchId);
                                      }
                                      setIsTargetPopoverOpen(false);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        selectedTargetId === bom.targetIngredientId ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex items-center justify-between gap-2 w-full">
                                      <span className="font-bold text-xs">{bom.targetIngredientName}</span>
                                      <span className="text-[10px] text-muted-foreground">
                                        (Yield: {bom.yieldQuantity} {bom.yieldUnit})
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Target Output Quantity */}
                    {selectedTargetId && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold">Processed Quantity to Produce</Label>
                          {processCalculation && (
                            <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                              Ratio: {processCalculation.multiplier.toFixed(2)}x standard batch
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="any"
                            placeholder="e.g. 2500"
                            value={targetQuantity}
                            onChange={(e) => {
                              setTargetQuantity(e.target.value);
                              handleCalculate(selectedTargetId, e.target.value, processBranchId);
                            }}
                            className="font-black text-lg text-primary"
                          />
                          <Badge variant="secondary" className="h-10 px-3 font-bold text-xs">
                            {boms.find((b) => b.targetIngredientId === selectedTargetId)?.yieldUnit || "Units"}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Recipe Summary Card */}
                    {selectedTargetId && (
                      <div className="p-3 rounded-lg bg-muted/50 border text-xs space-y-1.5">
                        {(() => {
                          const bom = boms.find((b) => b.targetIngredientId === selectedTargetId);
                          if (!bom) return null;
                          return (
                            <>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Standard Yield:</span>
                                <span className="font-bold text-foreground">
                                  {bom.yieldQuantity} {bom.yieldUnit}
                                </span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Base Formula Cost:</span>
                                <span className="font-bold text-foreground">EGP {bom.totalFormulaCost.toFixed(3)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Base Cost Per Unit:</span>
                                <span className="font-bold text-primary">
                                  EGP {bom.estimatedCostPerUnit.toFixed(4)} / {bom.yieldUnit}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Preparation Notes */}
                    {selectedTargetId && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Batch Notes (Optional)</Label>
                        <Textarea
                          placeholder="e.g. Added 10g extra sugar for sweetness, batch #4"
                          value={processNotes}
                          onChange={(e) => setProcessNotes(e.target.value)}
                          className="text-xs h-16 resize-none"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ingredient Requirements & Editable Table */}
                <Card className="lg:col-span-2 shadow-md flex flex-col">
                  <CardHeader className="border-b bg-card/50 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <Scale className="h-5 w-5 text-primary" /> Auto-Calculated BOM Ingredients
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Calculated based on target quantity. You can edit the <strong>Actual Used Qty</strong> below before submitting.
                        </CardDescription>
                      </div>

                      {processCalculation && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-bold bg-primary/5 text-primary border-primary/20 px-3 py-1">
                            Total Batch: EGP {liveTotalCost.toFixed(3)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-0 overflow-hidden min-h-[300px]">
                    {!selectedTargetId || !targetQuantity ? (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground space-y-2">
                        <FlaskConical className="h-12 w-12 stroke-1 text-muted-foreground/40" />
                        <p className="font-medium text-sm">Select a Manufactured Item and enter output quantity to auto-calculate ingredients.</p>
                      </div>
                    ) : calculateMutation.isPending ? (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-xs">Calculating recipe formula proportions...</p>
                      </div>
                    ) : processCalculation ? (
                      <ScrollArea className="h-full max-h-[420px]">
                        <Table>
                          <TableHeader className="bg-muted/40 sticky top-0 z-10">
                            <TableRow>
                              <TableHead className="font-bold">Raw Ingredient</TableHead>
                              <TableHead className="font-bold text-right">Calculated Qty</TableHead>
                              <TableHead className="font-bold text-right w-36">Actual Used Qty</TableHead>
                              <TableHead className="font-bold text-center">Unit</TableHead>
                              <TableHead className="font-bold text-right">Branch Stock</TableHead>
                              <TableHead className="font-bold text-right">Est. Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {processCalculation.items.map((item) => {
                              const currentEdited = editedQuantities[item.ingredientId] ?? item.calculatedQuantity;
                              const isLow = item.currentStock < currentEdited;
                              const rowCost = currentEdited * item.unitCost;

                              return (
                                <TableRow key={item.ingredientId} className={isLow ? "bg-red-500/5 hover:bg-red-500/10" : ""}>
                                  <TableCell className="font-bold text-foreground">
                                    <div className="flex items-center gap-2">
                                      <span>{item.ingredientName}</span>
                                      {isLow && (
                                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">
                                          Low Stock
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-muted-foreground">
                                    {item.calculatedQuantity}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Input
                                      type="number"
                                      step="any"
                                      value={currentEdited}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setEditedQuantities((prev) => ({
                                          ...prev,
                                          [item.ingredientId]: val,
                                        }));
                                      }}
                                      className="h-8 text-right font-bold text-primary focus:ring-primary"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="text-[10px] uppercase">
                                      {item.recipeBaseUnit}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className={`text-right font-mono font-medium ${isLow ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                                    {item.currentStock}
                                  </TableCell>
                                  <TableCell className="text-right font-bold font-mono text-foreground">
                                    EGP {rowCost.toFixed(3)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    ) : null}
                  </CardContent>

                  {/* Submission Footer */}
                  {processCalculation && (
                    <CardFooter className="border-t bg-muted/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Total Batch Cost: </span>
                          <span className="font-black text-sm text-foreground">EGP {liveTotalCost.toFixed(3)}</span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div>
                          <span className="text-muted-foreground">Calculated Unit Cost: </span>
                          <span className="font-black text-sm text-primary">
                            EGP {liveUnitCost.toFixed(4)} / {processCalculation.targetIngredientUnit}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        onClick={() => setIsSubmitConfirmOpen(true)}
                        disabled={submitProcessMutation.isPending}
                        className="font-bold gap-2 w-full sm:w-auto shadow-md"
                      >
                        <CheckCircle2 className="h-5 w-5" /> Submit Preparation Process
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: BOM Master Recipes */}
            <TabsContent value="boms" className="flex-1 min-h-0 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Bill of Materials (BOM) Formulas</h2>
                  <p className="text-xs text-muted-foreground">Master recipe definitions for manufactured sauces & prepared items.</p>
                </div>
                <Button onClick={openCreateBomModal} size="sm" className="gap-2 font-bold">
                  <Plus className="h-4 w-4" /> Add New Recipe
                </Button>
              </div>

              {isLoadingBoms ? (
                <div className="p-8 text-center text-muted-foreground">Loading BOM formulas...</div>
              ) : boms.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <Layers className="h-12 w-12 mx-auto stroke-1 text-muted-foreground/40 mb-3" />
                  <h3 className="font-bold text-base text-foreground">No BOM Formulas Defined</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                    Create standard recipes for your house-made syrups, sauces, and bases to automate preparation deductions.
                  </p>
                  <Button onClick={openCreateBomModal} className="font-bold gap-2">
                    <Plus className="h-4 w-4" /> Create First BOM Recipe
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boms.map((bom) => (
                    <Card key={bom.id} className="hover:shadow-md transition-shadow border-muted flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base font-bold text-foreground">{bom.targetIngredientName}</CardTitle>
                            <CardDescription className="text-xs capitalize font-medium text-muted-foreground mt-0.5">
                              Type: {bom.targetIngredientType}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="font-bold text-[10px] bg-primary/10 text-primary border-primary/20">
                            Yield: {bom.yieldQuantity} {bom.yieldUnit}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-3">
                        {/* Recipe Ingredients list */}
                        <div className="space-y-1.5 border rounded-lg p-2.5 bg-muted/30">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Raw Components ({bom.items.length})
                          </span>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {bom.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-xs font-medium">
                                <span className="text-foreground">{item.ingredientName}</span>
                                <span className="font-bold text-muted-foreground">
                                  {item.quantity} {item.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between text-xs pt-1 border-t">
                          <span className="text-muted-foreground">Formula Batch Cost:</span>
                          <span className="font-bold text-foreground">EGP {bom.totalFormulaCost.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Est. Cost Per Unit:</span>
                          <span className="font-bold text-primary">
                            EGP {bom.estimatedCostPerUnit.toFixed(4)} / {bom.yieldUnit}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 border-t flex items-center justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTargetId(bom.targetIngredientId);
                            setTargetQuantity((bom.yieldQuantity * 2).toString());
                            handleCalculate(bom.targetIngredientId, (bom.yieldQuantity * 2).toString(), processBranchId);
                            setActiveTab("process");
                          }}
                          className="text-xs font-bold text-primary hover:bg-primary/10 gap-1.5"
                        >
                          <FlaskConical className="h-3.5 w-3.5" /> Prepare Batch
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditBomModal(bom)} className="h-8 w-8 p-0">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete BOM formula for ${bom.targetIngredientName}?`)) {
                                deleteBomMutation.mutate(bom.id);
                              }
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: History & Audit Logs */}
            <TabsContent value="history" className="flex-1 min-h-0 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Preparation Audit History</h2>
                  <p className="text-xs text-muted-foreground">Complete logs of previous manufacturing & preparation batches.</p>
                </div>
              </div>

              {isLoadingRuns ? (
                <div className="p-8 text-center text-muted-foreground">Loading production history...</div>
              ) : runs.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <History className="h-12 w-12 mx-auto stroke-1 text-muted-foreground/40 mb-3" />
                  <p className="font-bold text-sm text-foreground">No preparation process logs recorded yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Execute a batch from the Preparation Process tab to see logs here.</p>
                </Card>
              ) : (
                <Card className="shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold">Batch ID</TableHead>
                        <TableHead className="font-bold">Date & Time</TableHead>
                        <TableHead className="font-bold">Branch</TableHead>
                        <TableHead className="font-bold">Manufactured Item</TableHead>
                        <TableHead className="font-bold text-right">Quantity Produced</TableHead>
                        <TableHead className="font-bold text-right">Total Cost</TableHead>
                        <TableHead className="font-bold">Prepared By</TableHead>
                        <TableHead className="font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {runs.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-mono font-bold text-primary">#{run.id}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">
                            {new Date(run.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{run.branchName}</TableCell>
                          <TableCell className="font-bold text-foreground">{run.targetIngredientName}</TableCell>
                          <TableCell className="text-right font-bold font-mono text-primary">
                            {run.producedQuantity} {run.producedUnit}
                          </TableCell>
                          <TableCell className="text-right font-bold font-mono text-foreground">
                            EGP {run.totalCost.toFixed(3)}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-muted-foreground">{run.preparedByName}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingRun(run)}
                              className="h-7 text-xs font-bold"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ── DIALOG: Create / Edit BOM Recipe Formula ──────────────────────── */}
        <Dialog open={isBomModalOpen} onOpenChange={setIsBomModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                {editingBomId ? "Edit BOM Formula" : "Define New BOM Formula"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Define the standard yield and raw ingredient recipe proportions for an in-house item.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
              {/* Target Manufactured Item */}
              <div className="space-y-1.5 flex flex-col">
                <Label className="text-xs font-bold">Target Manufactured Item</Label>
                <Popover open={isBomTargetPopoverOpen} onOpenChange={setIsBomTargetPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={!!editingBomId}
                      className="w-full justify-between font-bold text-xs h-10 text-left"
                    >
                      {bomTargetId && ingredients.find((i) => i.id.toString() === bomTargetId)
                        ? `${ingredients.find((i) => i.id.toString() === bomTargetId)?.name} (${ingredients.find((i) => i.id.toString() === bomTargetId)?.unit})`
                        : "Search & select inventory item to produce..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search target item by name..." />
                      <CommandList className="max-h-[250px] overflow-y-auto">
                        <CommandEmpty>No ingredient found.</CommandEmpty>
                        <CommandGroup>
                          {ingredients.map((ing) => (
                            <CommandItem
                              key={ing.id}
                              value={ing.name}
                              onSelect={() => {
                                setBomTargetId(ing.id.toString());
                                setIsBomTargetPopoverOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  bomTargetId === ing.id.toString() ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex justify-between items-center w-full">
                                <span className="font-bold text-xs">{ing.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  ({ing.unit}) — Cost: EGP {ing.costPerUnit}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Yield Quantity & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Standard Batch Yield Qty</Label>
                  <Input
                    type="number"
                    step="any"
                    value={bomYieldQty}
                    onChange={(e) => setBomYieldQty(e.target.value)}
                    placeholder="e.g. 1000"
                    className="font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Yield Unit</Label>
                  <Input
                    value={bomYieldUnit}
                    onChange={(e) => setBomYieldUnit(e.target.value)}
                    placeholder="e.g. ml, g, pcs"
                    className="font-bold"
                  />
                </div>
              </div>

              {/* Recipe Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Preparation Recipe Notes</Label>
                <Textarea
                  placeholder="e.g. Simmer sugar and water for 15 minutes before stirring in heavy cream."
                  value={bomNotes}
                  onChange={(e) => setBomNotes(e.target.value)}
                  className="text-xs h-16 resize-none"
                />
              </div>

              {/* Component Ingredients Table */}
              <div className="space-y-2 border rounded-xl p-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-primary">Raw Ingredient Components</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addBomFormItem} className="h-7 text-xs font-bold gap-1">
                    <Plus className="h-3 w-3" /> Add Component
                  </Button>
                </div>

                {bomFormItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No raw ingredients added yet. Click "Add Component".</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {bomFormItems.map((item, idx) => {
                      const selectedIng = ingredients.find((i) => i.id === item.ingredientId);
                      return (
                        <div key={idx} className="flex items-center gap-2 bg-background p-2 rounded-lg border">
                          <div className="flex-1">
                            <Popover
                              open={bomItemPopovers[idx] || false}
                              onOpenChange={(open) =>
                                setBomItemPopovers((prev) => ({ ...prev, [idx]: open }))
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between h-8 text-xs font-semibold text-left"
                                >
                                  {selectedIng ? `${selectedIng.name} (${selectedIng.unit})` : "Select raw ingredient..."}
                                  <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[320px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Search raw ingredient..." />
                                  <CommandList className="max-h-[220px] overflow-y-auto">
                                    <CommandEmpty>No ingredient found.</CommandEmpty>
                                    <CommandGroup>
                                      {ingredients.map((ing) => (
                                        <CommandItem
                                          key={ing.id}
                                          value={ing.name}
                                          onSelect={() => {
                                            const updated = [...bomFormItems];
                                            updated[idx] = {
                                              ...updated[idx],
                                              ingredientId: ing.id,
                                              unit: ing.unit || updated[idx].unit,
                                            };
                                            setBomFormItems(updated);
                                            setBomItemPopovers((prev) => ({ ...prev, [idx]: false }));
                                          }}
                                          className="cursor-pointer text-xs"
                                        >
                                          <Check
                                            className={`mr-2 h-3.5 w-3.5 ${
                                              item.ingredientId === ing.id ? "opacity-100" : "opacity-0"
                                            }`}
                                          />
                                          <div className="flex justify-between items-center w-full">
                                            <span>{ing.name}</span>
                                            <span className="text-[10px] text-muted-foreground">({ing.unit})</span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <Input
                            type="number"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updated = [...bomFormItems];
                              updated[idx].quantity = val;
                              setBomFormItems(updated);
                            }}
                            className="w-24 h-8 text-right font-bold text-xs"
                          />

                          <span className="text-xs font-bold text-muted-foreground w-12 uppercase">{item.unit}</span>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBomFormItems(bomFormItems.filter((_, i) => i !== idx));
                            }}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button variant="outline" onClick={() => setIsBomModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBom} disabled={saveBomMutation.isPending} className="font-bold gap-2">
                Save BOM Recipe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DIALOG: Confirmation for Preparation Process Submission ────────── */}
        <Dialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" /> Confirm Preparation Process
              </DialogTitle>
              <DialogDescription className="text-xs">
                Please confirm the details of this manufacturing batch execution.
              </DialogDescription>
            </DialogHeader>

            {processCalculation && (
              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Producing:</span>
                    <span className="text-primary">
                      {targetQuantity} {processCalculation.targetIngredientUnit} of {processCalculation.targetIngredientName}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-muted-foreground">
                    <span>Target Branch:</span>
                    <span className="text-foreground font-semibold">
                      {branches.find((b: any) => b.id === processBranchId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-muted-foreground">
                    <span>Total Batch Cost:</span>
                    <span className="text-foreground font-bold">EGP {liveTotalCost.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-muted-foreground">
                    <span>New Item Unit Cost:</span>
                    <span className="text-primary font-bold">
                      EGP {liveUnitCost.toFixed(4)} / {processCalculation.targetIngredientUnit}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-muted-foreground block">Stock Deductions to Apply:</span>
                  <div className="space-y-1 max-h-36 overflow-y-auto border p-2 rounded-md bg-muted/20">
                    {processCalculation.items.map((item) => {
                      const actualQty = editedQuantities[item.ingredientId] ?? item.calculatedQuantity;
                      return (
                        <div key={item.ingredientId} className="flex justify-between font-medium">
                          <span>{item.ingredientName}</span>
                          <span className="font-bold text-red-500 font-mono">
                            -{actualQty} {item.recipeBaseUnit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-xs font-bold">Stock Update Notice</AlertTitle>
                  <AlertDescription className="text-[11px]">
                    Submitting will immediately deduct raw materials from inventory and credit {targetQuantity} {processCalculation.targetIngredientUnit} to branch stock.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <DialogFooter className="pt-2 border-t">
              <Button variant="outline" onClick={() => setIsSubmitConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitProcess}
                disabled={submitProcessMutation.isPending}
                className="font-bold gap-2 shadow-md"
              >
                {submitProcessMutation.isPending ? "Processing..." : "Confirm & Execute Batch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DIALOG: View Past Preparation Run Details ──────────────────────── */}
        <Dialog open={!!viewingRun} onOpenChange={() => setViewingRun(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Batch Details #{viewingRun?.id}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Execution summary and component breakdown for this batch.
              </DialogDescription>
            </DialogHeader>

            {viewingRun && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Item Prepared</span>
                    <span className="font-bold text-sm text-foreground">{viewingRun.targetIngredientName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Quantity Produced</span>
                    <span className="font-bold text-sm text-primary">
                      {viewingRun.producedQuantity} {viewingRun.producedUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Branch</span>
                    <span className="font-semibold">{viewingRun.branchName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total Batch Cost</span>
                    <span className="font-bold text-foreground">EGP {viewingRun.totalCost.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Prepared By</span>
                    <span className="font-medium">{viewingRun.preparedByName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Date</span>
                    <span className="font-medium">{new Date(viewingRun.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {viewingRun.notes && (
                  <div className="p-2 rounded border bg-card text-muted-foreground">
                    <span className="font-bold text-foreground block mb-0.5">Notes:</span>
                    {viewingRun.notes}
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="font-bold text-foreground block">Raw Ingredients Consumed ({viewingRun.items.length})</span>
                  <Table className="border rounded-md">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold">Raw Ingredient</TableHead>
                        <TableHead className="font-bold text-right">Planned</TableHead>
                        <TableHead className="font-bold text-right">Actual Used</TableHead>
                        <TableHead className="font-bold text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingRun.items.map((i) => (
                        <TableRow key={i.id}>
                          <TableCell className="font-bold">{i.ingredientName}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {i.plannedQuantity} {i.unit}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {i.actualQuantity} {i.unit}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold">
                            EGP {i.totalCost.toFixed(3)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingRun(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
