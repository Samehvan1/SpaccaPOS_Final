import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Filter, Package, ShoppingCart, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

function CollapsibleDrinks({ drinks }: { drinks: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const showCollapsible = drinks.length > 2;
  const displayedDrinks = expanded ? drinks : drinks.slice(0, 2);

  if (drinks.length === 0) {
    return <span className="text-xs text-muted-foreground">Not used in any recipes.</span>;
  }

  return (
    <div className="space-y-1">
      {displayedDrinks.map((d: any, idx: number) => (
        <div key={idx} className="flex justify-between items-center text-sm border-b border-muted last:border-0 py-1">
          <span className="font-medium">{d.drinkName} <span className="text-xs text-muted-foreground">({d.slotLabel})</span></span>
          <span className="font-mono text-primary font-bold">{d.quantity.toFixed(2)} {d.unit}</span>
        </div>
      ))}
      {showCollapsible && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs text-muted-foreground gap-1 w-full justify-start hover:text-primary"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : `View all ${drinks.length} drinks...`}
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </Button>
      )}
    </div>
  );
}

export default function InventoryUsagePage() {
  const { toast } = useToast();
  const [report, setReport] = useState<any[]>([]);
  const [catalogReport, setCatalogReport] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usageMode, setUsageMode] = useState<string>("actual");

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [startDate, setStartDate] = useState(format(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");
  const [hideZeroConsumed, setHideZeroConsumed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, usageMode, selectedBranch, startDate, endDate, hideZeroConsumed]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);

      const [reportData, branchData, catalogData] = await Promise.all([
        api(`/api/finance/inventory-usage?${params.toString()}`),
        api("/api/admin/branches"),
        api("/api/finance/ingredient-recipes")
      ]);
      setReport(reportData);
      setBranches(branchData);
      setCatalogReport(catalogData);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load report" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, startDate, endDate]);

  const exportCsv = () => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (usageMode === "catalog") {
      headers = ["Item Type", "Ingredient Name", "Drink Name", "Slot", "Default Qty", "Unit"];
      sortedCatalog.forEach(ing => {
        ing.drinks.forEach((d: any) => {
          rows.push([ing.type, ing.name, d.drinkName, d.slotLabel, d.quantity, d.unit]);
        });
      });
    } else {
      headers = ["Item Type", "Item Name", "Consumed", "Unit", "Orders Count", "Current Stock", "Startup Stock"];
      rows = sortedReport.map(r => [
        r.type,
        r.name,
        r.totalConsumed,
        r.unit,
        r.usageCount,
        r.currentStock,
        r.startupQuantity
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_usage_${usageMode}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedReport = useMemo(() => {
    return [...report]
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(r => !hideZeroConsumed || (r.totalConsumed || 0) !== 0)
      .sort((a, b) => {
        const typeA = a.type || "";
        const typeB = b.type || "";
        if (typeA !== typeB) return typeA.localeCompare(typeB);
        return a.name.localeCompare(b.name);
      });
  }, [report, searchTerm, hideZeroConsumed]);

  const sortedCatalog = useMemo(() => {
    return [...catalogReport]
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const typeA = a.type || "";
        const typeB = b.type || "";
        if (typeA !== typeB) return typeA.localeCompare(typeB);
        return a.name.localeCompare(b.name);
      });
  }, [catalogReport, searchTerm]);

  const paginatedReport = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedReport.slice(start, start + itemsPerPage);
  }, [sortedReport, currentPage]);

  const paginatedCatalog = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCatalog.slice(start, start + itemsPerPage);
  }, [sortedCatalog, currentPage]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Item Usage</h1>
        <p className="text-muted-foreground">Analyze how much of each ingredient is being used in orders vs theoretical recipe quantities.</p>
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
              <label className="text-sm font-medium">From</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={usageMode === "catalog"} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={usageMode === "catalog"} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Item</label>
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
        <Tabs value={usageMode} onValueChange={setUsageMode} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="actual" className="gap-2">
              <ShoppingCart className="h-4 w-4" /> Usage in Orders
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-2">
              <Package className="h-4 w-4" /> Usage in Catalog
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          {usageMode === "actual" && (
            <div className="flex items-center gap-2">
              <Switch
                id="hide-zero-consumed"
                checked={hideZeroConsumed}
                onCheckedChange={setHideZeroConsumed}
              />
              <Label htmlFor="hide-zero-consumed" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                Hide Zero Consumed
              </Label>
            </div>
          )}
          <Button variant="outline" className="gap-2" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        {usageMode === "catalog" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Total Recipe Qty</TableHead>
                <TableHead>In Recipes (Drinks)</TableHead>
                <TableHead>Default Quantities per Drink</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 animate-pulse" />
                      <span>Auditing catalog recipes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedCatalog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No ingredients found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCatalog.map((ing) => (
                  <TableRow key={ing.id} className={ing.drinks.length === 0 ? "bg-amber-50 dark:bg-amber-950/30" : ""}>
                    <TableCell className="font-medium align-top py-4">{ing.name}</TableCell>
                    <TableCell className="align-top py-4">
                      <Badge variant="outline" className="w-fit text-[10px] font-normal capitalize">
                        {ing.type || "Other"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right align-top py-4">
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-bold text-primary">{(ing.totalRecipeQty || 0).toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{ing.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <Badge variant="secondary">{ing.drinks.length} drinks</Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <CollapsibleDrinks drinks={ing.drinks} />
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
                <TableHead>Ingredient Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actual Consumed</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Orders Count</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead className="text-right">Closing Balance</TableHead>
                <TableHead className="text-right">Real Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 animate-pulse" />
                      <span>Analyzing usage data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedReport.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No data found for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReport.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="w-fit text-[10px] font-normal capitalize">
                        {r.type || "Other"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {(r.totalConsumed || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{r.unit}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{r.usageCount} orders</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{(r.startupQuantity || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono font-bold">{(r.currentStock || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {((r.startupQuantity || 0) - (r.currentStock || 0) - (r.totalConsumed || 0)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex justify-center items-center gap-2 py-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center px-4 font-medium text-sm">
          Page {currentPage} of {Math.ceil((usageMode === "catalog" ? sortedCatalog.length : sortedReport.length) / itemsPerPage) || 1}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(p => p + 1)} 
          disabled={currentPage >= Math.ceil((usageMode === "catalog" ? sortedCatalog.length : sortedReport.length) / itemsPerPage)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
