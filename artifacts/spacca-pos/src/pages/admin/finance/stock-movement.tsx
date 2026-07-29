import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Filter, ArrowUpRight, ArrowDownLeft, History, Package, Beaker, List, Layers } from "lucide-react";
import { format } from "date-fns";
import { fmt } from "@/lib/currency";

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

export default function StockMovementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [movements, setMovements] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode: detailed or grouped by item
  const [viewMode, setViewMode] = useState<"detailed" | "grouped">("detailed");

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedIngredient, setSelectedIngredient] = useState<string>("all");
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
      if (selectedType !== "all") params.append("movementType", selectedType);

      const [moveData, ingData, branchData] = await Promise.all([
        api(`/api/stock/movements?${params.toString()}`),
        api("/api/ingredients"),
        api("/api/admin/branches")
      ]);
      setMovements(moveData);
      setIngredients(ingData);
      setBranches(branchData);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedIngredient, startDate, endDate, selectedType]);

  const filteredMovements = movements.filter(m => {
    const matchesSearch = (m.ingredientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.movementType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.note && m.note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || m.movementType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const groupedData = useMemo(() => {
    const map = new Map<string, {
      ingredientId: number | string;
      ingredientName: string;
      saleQty: number;
      calibrationQty: number;
      testQty: number;
      wasteQty: number;
      adjPos: number;
      adjNeg: number;
      adjNet: number;
      restockPos: number;
      restockNeg: number;
      restockNet: number;
      totalOut: number;
      totalIn: number;
      finalTotal: number;
    }>();

    filteredMovements.forEach(m => {
      const key = (m.ingredientName || `Ingredient #${m.ingredientId}`).trim();
      let item = map.get(key);
      if (!item) {
        item = {
          ingredientId: m.ingredientId,
          ingredientName: key,
          saleQty: 0,
          calibrationQty: 0,
          testQty: 0,
          wasteQty: 0,
          adjPos: 0,
          adjNeg: 0,
          adjNet: 0,
          restockPos: 0,
          restockNeg: 0,
          restockNet: 0,
          totalOut: 0,
          totalIn: 0,
          finalTotal: 0,
        };
        map.set(key, item);
      }

      const qty = Number(m.quantity) || 0;
      const absQty = Math.abs(qty);

      if (m.movementType === "sale") {
        item.saleQty += absQty;
      } else if (m.movementType === "calibration") {
        item.calibrationQty += absQty;
      } else if (m.movementType === "testing") {
        item.testQty += absQty;
      } else if (m.movementType === "waste") {
        item.wasteQty += absQty;
      } else if (m.movementType === "restock") {
        item.restockNet += qty;
        if (qty > 0) item.restockPos += qty;
        else if (qty < 0) item.restockNeg += absQty;
      } else if (m.movementType === "adjustment") {
        item.adjNet += qty;
        if (qty > 0) item.adjPos += qty;
        else if (qty < 0) item.adjNeg += absQty;
      } else {
        item.adjNet += qty;
        if (qty > 0) item.adjPos += qty;
        else if (qty < 0) item.adjNeg += absQty;
      }

      if (qty > 0) {
        item.totalIn += absQty;
      } else if (qty < 0) {
        item.totalOut += absQty;
      }

      item.finalTotal += qty;
    });

    return Array.from(map.values()).sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
  }, [filteredMovements]);

  const exportCsv = () => {
    if (viewMode === "grouped") {
      const headers = ["Item Name", "Sale Total Qty", "Calibration", "Test", "Waste", "Stock-Audit", "Received", "Total Out Movement", "Total In", "Final Total"];
      const rows = groupedData.map(g => [
        `"${g.ingredientName.replace(/"/g, '""')}"`,
        fmtQty(g.saleQty),
        fmtQty(g.calibrationQty),
        fmtQty(g.testQty),
        fmtQty(g.wasteQty),
        g.adjPos > 0 && g.adjNeg > 0 ? `"+${fmtQty(g.adjPos)} / -${fmtQty(g.adjNeg)}"` : fmtQty(g.adjNet),
        g.restockPos > 0 && g.restockNeg > 0 ? `"+${fmtQty(g.restockPos)} / -${fmtQty(g.restockNeg)}"` : fmtQty(g.restockNet),
        fmtQty(g.totalOut),
        fmtQty(g.totalIn),
        fmtQty(g.finalTotal)
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
        <p className="text-muted-foreground">Track all inventory changes across branches.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ingredients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ingredients</SelectItem>
                  {ingredients.map(i => (
                    <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
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
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="restock">Received</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
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
                  placeholder="Search..." 
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

      <div className="rounded-md border bg-card">
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
                        m.movementType === "restock" ? "default" :
                        m.movementType === "sale" ? "secondary" :
                        m.movementType === "waste" ? "destructive" : "outline"
                      } className={`capitalize ${
                        m.movementType === "calibration" ? "border-amber-500 text-amber-600 bg-amber-50" : 
                        m.movementType === "testing" ? "border-cyan-500 text-cyan-600 bg-cyan-50" : ""
                      }`}>
                        {m.movementType === "restock" && <ArrowDownLeft className="mr-1 h-3 w-3" />}
                        {m.movementType === "sale" && <ArrowUpRight className="mr-1 h-3 w-3" />}
                        {(m.movementType === "calibration" || m.movementType === "testing") && <Beaker className="mr-1 h-3 w-3" />}
                        {m.movementType === "restock" ? "received" : m.movementType === "adjustment" ? "stock-audit" : m.movementType}
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
                <TableHead className="text-right">Sale Total Qty</TableHead>
                <TableHead className="text-right">Calibration</TableHead>
                <TableHead className="text-right">Test</TableHead>
                <TableHead className="text-right">Waste</TableHead>
                <TableHead className="text-right">Stock-Audit</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right bg-rose-100/70 text-rose-900 font-semibold dark:bg-rose-950/40 dark:text-rose-200">Total Out Movement</TableHead>
                <TableHead className="text-right bg-emerald-100/70 text-emerald-900 font-semibold dark:bg-emerald-950/40 dark:text-emerald-200">Total In</TableHead>
                <TableHead className="text-right bg-sky-100/70 text-sky-900 font-bold dark:bg-sky-950/40 dark:text-sky-200">Final Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <History className="h-8 w-8 text-muted-foreground animate-spin" />
                      <p className="text-muted-foreground">Loading summary...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : groupedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
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
                      <TableCell className={`text-right font-mono font-bold bg-sky-50/70 dark:bg-sky-950/20 ${g.finalTotal > 0 ? "text-emerald-700 dark:text-emerald-400" : g.finalTotal < 0 ? "text-rose-700 dark:text-rose-400" : ""}`}>
                        {g.finalTotal > 0 ? `+${fmtQty(g.finalTotal)}` : fmtQty(g.finalTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold border-t-2">
                    <TableCell>Total ({groupedData.length} items)</TableCell>
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
                        const net = groupedData.reduce((acc, g) => acc + g.finalTotal, 0);
                        return net > 0 ? `+${fmtQty(net)}` : fmtQty(net);
                      })()}
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

