import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Coffee, Package, Info, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type InventorySortField = "name" | "type" | "status" | "alert" | "stock";
type RecipeSortField = "usage" | "name" | "stock" | "type";
type SortOrder = "asc" | "desc";

export default function StockQuantitiesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Column sorting state for Inventory Items table
  const [invSortField, setInvSortField] = useState<InventorySortField>("type");
  const [invSortOrder, setInvSortOrder] = useState<SortOrder>("asc");

  // Column sorting state for Drink Recipe Usage table
  const [recipeSortField, setRecipeSortField] = useState<RecipeSortField>("type");
  const [recipeSortOrder, setRecipeSortOrder] = useState<SortOrder>("asc");

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/drink-categories"],
    queryFn: async () => {
      const res = await fetch("/api/drink-categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch Drinks (filtered by category if selected)
  const { data: drinks = [] } = useQuery({
    queryKey: ["/api/drinks", categoryFilter],
    queryFn: async () => {
      const url = new URL("/api/drinks", window.location.origin);
      if (categoryFilter !== "all") url.searchParams.append("category", categoryFilter);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch drinks");
      return res.json();
    },
  });

  // Fetch all ingredients for the search/list view
  const { data: ingredients = [] } = useQuery({
    queryKey: ["/api/ingredients"],
    queryFn: async () => {
      const res = await fetch("/api/ingredients");
      if (!res.ok) throw new Error("Failed to fetch ingredients");
      return res.json();
    },
  });

  // Fetch stock usage for selected drink
  const { data: drinkUsage = [], isLoading: isUsageLoading } = useQuery({
    queryKey: ["/api/drinks", selectedDrinkId, "stock-usage"],
    queryFn: async () => {
      if (selectedDrinkId === "all") return [];
      const res = await fetch(`/api/drinks/${selectedDrinkId}/stock-usage`);
      if (!res.ok) throw new Error("Failed to fetch drink usage");
      return res.json();
    },
    enabled: selectedDrinkId !== "all",
  });

  // Toggle sorting column for Inventory Items
  const toggleInvSort = (field: InventorySortField) => {
    if (invSortField === field) {
      setInvSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setInvSortField(field);
      setInvSortOrder("asc");
    }
  };

  // Toggle sorting column for Recipe Items
  const toggleRecipeSort = (field: RecipeSortField) => {
    if (recipeSortField === field) {
      setRecipeSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setRecipeSortField(field);
      setRecipeSortOrder("asc");
    }
  };

  // 1. Order Inventory Items by column (Default: Type then Name)
  const sortedIngredients = useMemo(() => {
    const filtered = ingredients.filter((ing: any) => 
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a: any, b: any) => {
      let cmp = 0;
      if (invSortField === "name") {
        cmp = (a.name || "").localeCompare(b.name || "");
      } else if (invSortField === "type") {
        const typeA = (a.ingredientType || "").toLowerCase();
        const typeB = (b.ingredientType || "").toLowerCase();
        cmp = typeA.localeCompare(typeB);
        if (cmp === 0) {
          cmp = (a.name || "").localeCompare(b.name || "");
        }
      } else if (invSortField === "status") {
        const statusA = a.isActive !== false ? 1 : 0;
        const statusB = b.isActive !== false ? 1 : 0;
        cmp = statusB - statusA;
        if (cmp === 0) {
          cmp = (a.name || "").localeCompare(b.name || "");
        }
      } else if (invSortField === "alert") {
        const isLowA = (a.stockQuantity ?? 0) <= (a.lowStockThreshold ?? 500) ? 1 : 0;
        const isLowB = (b.stockQuantity ?? 0) <= (b.lowStockThreshold ?? 500) ? 1 : 0;
        cmp = isLowB - isLowA;
        if (cmp === 0) {
          cmp = (a.name || "").localeCompare(b.name || "");
        }
      } else if (invSortField === "stock") {
        cmp = (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0);
      }

      return invSortOrder === "desc" ? -cmp : cmp;
    });
  }, [ingredients, searchQuery, invSortField, invSortOrder]);

  // Order Recipe Items by column (Default: Type then Name)
  const sortedDrinkUsage = useMemo(() => {
    return [...drinkUsage].sort((a: any, b: any) => {
      let cmp = 0;
      if (recipeSortField === "usage") {
        cmp = (a.slotLabel || "").localeCompare(b.slotLabel || "");
      } else if (recipeSortField === "name") {
        cmp = (a.ingredientName || "").localeCompare(b.ingredientName || "");
      } else if (recipeSortField === "type") {
        const typeA = (a.type || "").toLowerCase();
        const typeB = (b.type || "").toLowerCase();
        cmp = typeA.localeCompare(typeB);
        if (cmp === 0) {
          cmp = (a.ingredientName || a.slotLabel || "").localeCompare(b.ingredientName || b.slotLabel || "");
        }
      } else if (recipeSortField === "stock") {
        const ingA = ingredients.find((i: any) => i.id === a.ingredientId);
        const ingB = ingredients.find((i: any) => i.id === b.ingredientId);
        cmp = (ingA?.stockQuantity ?? 0) - (ingB?.stockQuantity ?? 0);
      }

      return recipeSortOrder === "desc" ? -cmp : cmp;
    });
  }, [drinkUsage, ingredients, recipeSortField, recipeSortOrder]);

  // Export CSV Function
  const handleExport = () => {
    if (selectedDrinkId !== "all") {
      const selectedDrink = drinks.find((d: any) => String(d.id) === selectedDrinkId);
      const drinkName = selectedDrink?.name || "drink";
      const headers = ["Slot/Usage", "Inventory Item", "Ingredient ID", "Base Qty", "Available Stock", "Unit", "Type"];
      const rows = sortedDrinkUsage.map((u: any) => {
        const ing = ingredients.find((i: any) => i.id === u.ingredientId);
        const stock = ing?.stockQuantity ?? 0;
        return [
          `"${(u.slotLabel || "").replace(/"/g, '""')}"`,
          `"${(u.ingredientName || "").replace(/"/g, '""')}"`,
          u.ingredientId,
          `"${u.qty ? `${u.qty} ${u.unit}` : "-"}"`,
          stock,
          `"${u.unit || ""}"`,
          `"${u.type || ""}"`
        ];
      });
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      downloadCSV(csvContent, `recipe_ingredients_${drinkName.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      const headers = ["ID", "Name", "Slug", "Type", "Item Status", "Stock Alert Status", "Current Stock", "Unit"];
      const rows = sortedIngredients.map((ing: any) => {
        const isLow = (ing.stockQuantity ?? 0) <= (ing.lowStockThreshold ?? 500);
        const itemStatus = ing.isActive !== false ? "Active" : "Inactive";
        const stockAlert = isLow ? "Low Stock" : "OK";
        return [
          ing.id,
          `"${(ing.name || "").replace(/"/g, '""')}"`,
          `"${(ing.slug || "").replace(/"/g, '""')}"`,
          `"${(ing.ingredientType || "").replace(/"/g, '""')}"`,
          `"${itemStatus}"`,
          `"${stockAlert}"`,
          ing.stockQuantity ?? 0,
          `"${ing.unit || ""}"`
        ];
      });
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      downloadCSV(csvContent, `stock_quantities_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Quantities</h1>
          <p className="text-muted-foreground">View current inventory levels and drink recipes.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 font-semibold shadow-sm">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-card p-4 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <Filter className="h-3 w-3" /> Category
          </label>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setSelectedDrinkId("all"); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <Coffee className="h-3 w-3" /> Drink
          </label>
          <Select onValueChange={setSelectedDrinkId} value={selectedDrinkId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a drink..." />
            </SelectTrigger>
            <SelectContent>
              {drinks.filter((d: any) => d.isActive).map((d: any) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <Search className="h-3 w-3" /> Search Inventory Item
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or code..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedDrinkId !== "all" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              Ingredients for {drinks.find((d: any) => String(d.id) === selectedDrinkId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUsageLoading ? (
              <p className="text-center py-10 text-muted-foreground">Loading recipe data...</p>
            ) : sortedDrinkUsage.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No linked ingredients found for this drink.</p>
            ) : (
              <div className="space-y-6">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer select-none hover:bg-muted/80 transition-colors"
                          onClick={() => toggleRecipeSort("usage")}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <span>Slot / Usage</span>
                            {recipeSortField === "usage" ? (
                              recipeSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none hover:bg-muted/80 transition-colors"
                          onClick={() => toggleRecipeSort("name")}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <span>Inventory Item</span>
                            {recipeSortField === "name" ? (
                              recipeSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Base Qty</TableHead>
                        <TableHead 
                          className="cursor-pointer select-none hover:bg-muted/80 transition-colors"
                          onClick={() => toggleRecipeSort("stock")}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <span>Available Stock</span>
                            {recipeSortField === "stock" ? (
                              recipeSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none hover:bg-muted/80 transition-colors"
                          onClick={() => toggleRecipeSort("type")}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <span>Type</span>
                            {recipeSortField === "type" ? (
                              recipeSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedDrinkUsage.map((u: any, idx: number) => {
                        const ing = ingredients.find((i: any) => i.id === u.ingredientId);
                        const stock = ing?.stockQuantity ?? 0;
                        const isLow = stock <= (ing?.lowStockThreshold ?? 500);

                        return (
                          <TableRow key={`${u.ingredientId}-${idx}`}>
                            <TableCell>
                              <div className="font-bold">{u.slotLabel}</div>
                              {u.typeName && <div className="text-[10px] text-muted-foreground">{u.typeName}</div>}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{u.ingredientName}</div>
                              <div className="text-[10px] text-muted-foreground">ID: {u.ingredientId}</div>
                            </TableCell>
                            <TableCell className="font-mono">
                              {u.qty ? `${u.qty} ${u.unit}` : "-"}
                              {u.options && (
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  {u.options.map((o: any) => (
                                    <div key={o.label}>{o.label}: {o.qty}{u.unit}</div>
                                  ))}
                                </div>
                              )}
                              {u.volumes && (
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  {u.volumes.map((v: any) => (
                                    <div key={v.name}>{v.name}: {v.qty}{v.unit}</div>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className={`text-lg font-black ${isLow ? 'text-destructive' : 'text-green-600'}`}>
                                {stock}
                              </div>
                              <div className="text-[10px] text-muted-foreground uppercase">{u.unit}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize text-[10px] bg-muted/30">
                                {u.type}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-500/5 text-blue-600 rounded-lg border border-blue-500/20">
                  <Info className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-medium">
                    Quantities shown reflect the processed amount deducted from inventory per serving. 
                    "Available Stock" is globally shared across drinks using the same inventory item.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              All Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => toggleInvSort("name")}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span>Inventory Item</span>
                        {invSortField === "name" ? (
                          invSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => toggleInvSort("type")}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span>Type</span>
                        {invSortField === "type" ? (
                          invSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => toggleInvSort("status")}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span>Item Status</span>
                        {invSortField === "status" ? (
                          invSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => toggleInvSort("alert")}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span>Stock Alert</span>
                        {invSortField === "alert" ? (
                          invSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => toggleInvSort("stock")}
                    >
                      <div className="flex items-center justify-end gap-1 font-bold">
                        <span>Current Stock</span>
                        {invSortField === "stock" ? (
                          invSortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                        No inventory items found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedIngredients.map((ing: any) => {
                      const isLow = (ing.stockQuantity ?? 0) <= (ing.lowStockThreshold ?? 500);
                      return (
                        <TableRow key={ing.id}>
                          <TableCell>
                            <div className="font-bold">{ing.name}</div>
                            <div className="text-[10px] text-muted-foreground">{ing.slug}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize text-[10px]">
                              {ing.ingredientType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ing.isActive !== false ? (
                              <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-bold text-slate-500 bg-slate-100 border-slate-200">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {isLow ? (
                              <Badge variant="destructive" className="text-[10px] uppercase font-black tracking-tight">Low Stock</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] uppercase font-bold text-green-600 border-green-200 bg-green-50">OK</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`text-xl font-black ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                              {ing.stockQuantity ?? 0}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase">{ing.unit}</div>
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
      )}
    </div>
  );
}
