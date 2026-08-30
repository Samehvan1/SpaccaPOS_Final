import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Filter, ArrowUpRight, ArrowDownLeft, History, Package, Beaker, List, Layers, ChevronsUpDown, Check } from "lucide-react";
import { format } from "date-fns";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const fmtQty = (val: any): string => {
  const num = Number(val);
  if (isNaN(num)) return "0";
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(3);
};

const INGREDIENT_TYPES = [
  { value: "all", label: "All Ingredient Types" },
  { value: "base", label: "Base Ingredients" },
  { value: "coffee", label: "Coffee" },
  { value: "milk", label: "Milk" },
  { value: "syrup", label: "Syrup" },
  { value: "sauce", label: "Sauce" },
  { value: "sweetener", label: "Sweetener" },
  { value: "topping", label: "Topping" },
  { value: "tea", label: "Tea" },
  { value: "cup", label: "Cup & Containers" },
  { value: "packing", label: "Packaging Materials" },
  { value: "other", label: "Other Supplies" },
];

function SearchableIngredientSelect({
  ingredients,
  value,
  onValueChange
}: {
  ingredients: { id: number; name: string }[];
  value: string;
  onValueChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const options = useMemo(() => [
    { value: "all", label: "All Ingredients" },
    ...ingredients.map(i => ({ value: String(i.id), label: i.name }))
  ], [ingredients]);

  const selectedOption = options.find(o => o.value === value);
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between bg-background border-input font-normal h-10 px-3"
          type="button"
        >
          <span className="truncate">{selectedOption ? selectedOption.label : "All Ingredients"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[280px] p-0 z-[200]" align="start">
        <div className="p-2 border-b flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input 
            placeholder="Search ingredient..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="h-8 border-none focus-visible:ring-0 px-1"
            autoFocus
          />
        </div>
        <div className="max-h-[240px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="text-xs text-muted-foreground p-3 text-center">No ingredient found.</div>
          ) : (
            filtered.map(opt => (
              <div 
                key={opt.value}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${opt.value === value ? "bg-accent/50 font-semibold" : ""}`}
                onClick={() => {
                  onValueChange(opt.value);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function StockMovementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [movements, setMovements] = useState<any[]>([]);
  const [summaryItems, setSummaryItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode: detailed or grouped by item
  const [viewMode, setViewMode] = useState<"detailed" | "grouped">("detailed");

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedIngredient, setSelectedIngredient] = useState<string>("all");
  const [selectedIngredientType, setSelectedIngredientType] = useState<string>("all");
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [startDate, setStartDate] = useState(format(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate, limit: "5000" });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      if (selectedIngredient !== "all") params.append("ingredientId", selectedIngredient);
      if (selectedIngredientType !== "all") params.append("ingredientType", selectedIngredientType);
      if (selectedProductCategory !== "all") params.append("categoryId", selectedProductCategory);
      if (selectedType !== "all") params.append("movementType", selectedType);

      const summaryParams = new URLSearchParams({ startDate, endDate });
      if (selectedBranch !== "all") summaryParams.append("branchId", selectedBranch);
      if (selectedIngredient !== "all") summaryParams.append("ingredientId", selectedIngredient);
      if (selectedIngredientType !== "all") summaryParams.append("ingredientType", selectedIngredientType);
      if (selectedProductCategory !== "all") summaryParams.append("categoryId", selectedProductCategory);

      const [moveData, summaryData, ingData, branchData, catData] = await Promise.all([
        api(`/api/stock/movements?${params.toString()}`),
        api(`/api/stock/movement-summary?${summaryParams.toString()}`),
        api("/api/ingredients"),
        api("/api/admin/branches"),
        api("/api/drink-categories").catch(() => [])
      ]);
      setMovements(moveData);
      setSummaryItems(summaryData);
      setIngredients(ingData);
      setBranches(branchData);
      setProductCategories(catData || []);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedIngredient, selectedIngredientType, selectedProductCategory, startDate, endDate, selectedType]);

  const filteredMovements = movements.filter(m => {
    const matchesIngredient = selectedIngredient === "all" || String(m.ingredientId) === selectedIngredient;
    const matchesSearch = (m.ingredientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.movementType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.note && m.note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || m.movementType === selectedType;
    
    return matchesIngredient && matchesSearch && matchesType;
  });

  const groupedData = useMemo(() => {
    if (!summaryItems || summaryItems.length === 0) return [];
    
    return summaryItems.filter(g => {
      const matchesSearch = !searchTerm || (g.ingredientName || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => (a.ingredientName || "").localeCompare(b.ingredientName || ""));
  }, [summaryItems, searchTerm]);

  const exportCsv = () => {
    if (viewMode === "grouped") {
      const headers = [
        "Item Name",
        "Unit",
        "Start / Opening Stock",
        "Sale Total Qty",
        "Calibration",
        "Test",
        "Waste",
        "Stock-Audit",
        "Received",
        "Total Out Movement",
        "Total In",
        "Net Change",
        "Period Closing Stock",
        "Current Live Stock"
      ];
      const rows = groupedData.map(g => [
        `"${(g.ingredientName || "").replace(/"/g, '""')}"`,
        `"${(g.unit || "").replace(/"/g, '""')}"`,
        fmtQty(g.openingStock),
        fmtQty(g.saleQty),
        fmtQty(g.calibrationQty),
        fmtQty(g.testQty),
        fmtQty(g.wasteQty),
        g.adjPos > 0 && g.adjNeg > 0 ? `"+${fmtQty(g.adjPos)} / -${fmtQty(g.adjNeg)}"` : fmtQty(g.adjNet),
        g.restockPos > 0 && g.restockNeg > 0 ? `"+${fmtQty(g.restockPos)} / -${fmtQty(g.restockNeg)}"` : fmtQty(g.restockNet),
        fmtQty(g.totalOut),
        fmtQty(g.totalIn),
        fmtQty(g.netChange),
        fmtQty(g.closingStock),
        fmtQty(g.currentStock)
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `stock_movements_grouped_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ["Date", "Ingredient", "Type", "Quantity", "After", "User", "Note"];
      const rows = filteredMovements.map(m => [
        format(new Date(m.createdAt), "yyyy-MM-dd HH:mm"),
        `"${(m.ingredientName || "").replace(/"/g, '""')}"`,
        m.movementType,
        fmtQty(m.quantity),
        fmtQty(m.quantityAfter),
        `"${(m.createdByName || "").replace(/"/g, '""')}"`,
        `"${(m.note || "").replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `stock_movements_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Stock Movement</h1>
        <p className="text-muted-foreground">Track all inventory changes, opening balances, and live stock across branches.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
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
              <label className="text-sm font-medium">Ingredient</label>
              <SearchableIngredientSelect
                ingredients={ingredients}
                value={selectedIngredient}
                onValueChange={setSelectedIngredient}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ingredient Type</label>
              <Select value={selectedIngredientType} onValueChange={setSelectedIngredientType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ingredient Types" />
                </SelectTrigger>
                <SelectContent>
                  {INGREDIENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Category</label>
              <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Product Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Product Categories</SelectItem>
                  {productCategories.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Movement Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Movement Types</SelectItem>
                  <SelectItem value="restock">Received</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="manufacture_produce">Mfg Produce</SelectItem>
                  <SelectItem value="manufacture_consume">Mfg Consume</SelectItem>
                  <SelectItem value="waste">Waste</SelectItem>
                  <SelectItem value="calibration">Calibration</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="adjustment">Stock-Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search item..." 
                  className="pl-9" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border">
          <Button
            variant={viewMode === "detailed" ? "secondary" : "ghost"}
            size="sm"
            className="gap-2 text-xs font-medium"
            onClick={() => setViewMode("detailed")}
          >
            <List className="h-4 w-4" /> Detailed View
          </Button>
          <Button
            variant={viewMode === "grouped" ? "secondary" : "ghost"}
            size="sm"
            className="gap-2 text-xs font-medium"
            onClick={() => setViewMode("grouped")}
          >
            <Layers className="h-4 w-4" /> Grouped by Item
          </Button>
        </div>

        <Button variant="outline" className="gap-2" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        {viewMode === "detailed" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Ingredient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <History className="h-8 w-8 text-muted-foreground animate-spin" />
                      <p className="text-muted-foreground">Loading movements...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">No movements found for the selected period.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {format(new Date(m.createdAt), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{m.ingredientName}</TableCell>
                    <TableCell>
                      <Badge variant={
                        m.movementType === "restock" || m.movementType === "manufacture_produce" ? "default" :
                        m.movementType === "sale" ? "secondary" :
                        m.movementType === "waste" ? "destructive" : "outline"
                      } className={`capitalize ${
                        m.movementType === "calibration" ? "border-amber-500 text-amber-600 bg-amber-50" : 
                        m.movementType === "testing" ? "border-cyan-500 text-cyan-600 bg-cyan-50" :
                        m.movementType === "manufacture_produce" ? "border-emerald-500 text-emerald-700 bg-emerald-50" :
                        m.movementType === "manufacture_consume" ? "border-purple-500 text-purple-700 bg-purple-50" : ""
                      }`}>
                        {m.movementType === "restock" && <ArrowDownLeft className="mr-1 h-3 w-3" />}
                        {m.movementType === "sale" && <ArrowUpRight className="mr-1 h-3 w-3" />}
                        {(m.movementType === "calibration" || m.movementType === "testing") && <Beaker className="mr-1 h-3 w-3" />}
                        {m.movementType === "manufacture_produce" ? "mfg produce" :
                         m.movementType === "manufacture_consume" ? "mfg consume" :
                         m.movementType === "restock" ? "received" :
                         m.movementType === "adjustment" ? "stock-audit" : m.movementType}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-mono ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {m.quantity > 0 ? "+" : ""}{fmtQty(m.quantity)}
                    </TableCell>
                    <TableCell className="text-right font-bold font-mono">
                      {fmtQty(m.quantityAfter)}
                    </TableCell>
                    <TableCell>{m.createdByName}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground italic">
                      {m.note || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right bg-blue-100/70 text-blue-900 font-bold dark:bg-blue-950/40 dark:text-blue-200">Start / Opening Stock</TableHead>
                <TableHead className="text-right">Sale Total Qty</TableHead>
                <TableHead className="text-right">Calibration</TableHead>
                <TableHead className="text-right">Test</TableHead>
                <TableHead className="text-right">Waste</TableHead>
                <TableHead className="text-right">Stock-Audit</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right bg-rose-100/70 text-rose-900 font-semibold dark:bg-rose-950/40 dark:text-rose-200">Total Out</TableHead>
                <TableHead className="text-right bg-emerald-100/70 text-emerald-900 font-semibold dark:bg-emerald-950/40 dark:text-emerald-200">Total In</TableHead>
                <TableHead className="text-right bg-sky-100/70 text-sky-900 font-bold dark:bg-sky-950/40 dark:text-sky-200">Net Change</TableHead>
                <TableHead className="text-right bg-indigo-100/70 text-indigo-900 font-bold dark:bg-indigo-950/40 dark:text-indigo-200">Period Closing Stock</TableHead>
                <TableHead className="text-right bg-violet-100/70 text-violet-900 font-bold dark:bg-violet-950/40 dark:text-violet-200">Current Live Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <History className="h-8 w-8 text-muted-foreground animate-spin" />
                      <p className="text-muted-foreground">Loading summary...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : groupedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">No items found for the selected period.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {groupedData.map((g) => (
                    <TableRow key={g.ingredientId || g.ingredientName}>
                      <TableCell className="font-semibold">{g.ingredientName}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/20">
                        {fmtQty(g.openingStock)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-amber-700">
                        {g.saleQty > 0 ? fmtQty(g.saleQty) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-orange-600">
                        {g.calibrationQty > 0 ? fmtQty(g.calibrationQty) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-cyan-600">
                        {g.testQty > 0 ? fmtQty(g.testQty) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        {g.wasteQty > 0 ? fmtQty(g.wasteQty) : "—"}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${g.adjNet > 0 ? "text-green-600" : g.adjNet < 0 ? "text-red-600" : ""}`}>
                        {g.adjPos > 0 && g.adjNeg > 0
                          ? `+${fmtQty(g.adjPos)} / -${fmtQty(g.adjNeg)}`
                          : g.adjNet > 0
                          ? `+${fmtQty(g.adjNet)}`
                          : g.adjNet < 0
                          ? `${fmtQty(g.adjNet)}`
                          : "—"}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${g.restockNet > 0 ? "text-green-600" : g.restockNet < 0 ? "text-red-600" : ""}`}>
                        {g.restockPos > 0 && g.restockNeg > 0
                          ? `+${fmtQty(g.restockPos)} / -${fmtQty(g.restockNeg)}`
                          : g.restockNet > 0
                          ? `+${fmtQty(g.restockNet)}`
                          : g.restockNet < 0
                          ? `${fmtQty(g.restockNet)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-red-700 dark:text-red-400 bg-rose-50/70 dark:bg-rose-950/20">
                        {g.totalOut > 0 ? `-${fmtQty(g.totalOut)}` : "0"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/20">
                        {g.totalIn > 0 ? `+${fmtQty(g.totalIn)}` : "0"}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold bg-sky-50/70 dark:bg-sky-950/20 ${g.netChange > 0 ? "text-emerald-700 dark:text-emerald-400" : g.netChange < 0 ? "text-rose-700 dark:text-rose-400" : ""}`}>
                        {g.netChange > 0 ? `+${fmtQty(g.netChange)}` : fmtQty(g.netChange)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/20">
                        {fmtQty(g.closingStock)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-violet-700 dark:text-violet-400 bg-violet-50/70 dark:bg-violet-950/20">
                        {fmtQty(g.currentStock)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold border-t-2">
                    <TableCell>Total ({groupedData.length} items)</TableCell>
                    <TableCell className="text-right font-mono text-blue-700 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/40">
                      {fmtQty(groupedData.reduce((acc, g) => acc + g.openingStock, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-amber-700">
                      {fmtQty(groupedData.reduce((acc, g) => acc + g.saleQty, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-orange-600">
                      {fmtQty(groupedData.reduce((acc, g) => acc + g.calibrationQty, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-cyan-600">
                      {fmtQty(groupedData.reduce((acc, g) => acc + g.testQty, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      {fmtQty(groupedData.reduce((acc, g) => acc + g.wasteQty, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(() => {
                        const totalAdj = groupedData.reduce((acc, g) => acc + g.adjNet, 0);
                        return totalAdj > 0 ? `+${fmtQty(totalAdj)}` : totalAdj < 0 ? fmtQty(totalAdj) : "0";
                      })()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(() => {
                        const totalRestock = groupedData.reduce((acc, g) => acc + g.restockNet, 0);
                        return totalRestock > 0 ? `+${fmtQty(totalRestock)}` : totalRestock < 0 ? fmtQty(totalRestock) : "0";
                      })()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-red-700 dark:text-red-400 bg-rose-100/80 dark:bg-rose-900/40">
                      -{fmtQty(groupedData.reduce((acc, g) => acc + g.totalOut, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40">
                      +{fmtQty(groupedData.reduce((acc, g) => acc + g.totalIn, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold bg-sky-100/80 dark:bg-sky-900/40">
                      {(() => {
                        const net = groupedData.reduce((acc, g) => acc + g.netChange, 0);
                        return net > 0 ? `+${fmtQty(net)}` : fmtQty(net);
                      })()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-900/40">
                      {fmtQty(groupedData.reduce((acc, g) => acc + g.closingStock, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-violet-700 dark:text-violet-400 bg-violet-100/80 dark:bg-violet-900/40">
                      {fmtQty(groupedData.reduce((acc, g) => acc + g.currentStock, 0))}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
