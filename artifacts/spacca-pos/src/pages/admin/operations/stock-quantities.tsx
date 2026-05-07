import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Coffee, Package, Layers, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StockQuantitiesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter ingredients by search query
  const filteredIngredients = ingredients.filter((ing: any) => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Quantities</h1>
        <p className="text-muted-foreground">View current inventory levels and drink recipes.</p>
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
          <Select value={selectedDrinkId} onValueChange={setSelectedDrinkId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a drink" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">View All Ingredients</SelectItem>
              {drinks.map((d: any) => (
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
            ) : drinkUsage.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No linked ingredients found for this drink.</p>
            ) : (
              <div className="space-y-6">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Slot / Usage</TableHead>
                        <TableHead>Inventory Item</TableHead>
                        <TableHead>Base Qty</TableHead>
                        <TableHead>Available Stock</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drinkUsage.map((u: any, idx: number) => {
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
                                    <div key={v.name}>{v.name}: {v.qty}{u.unit}</div>
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
                    <TableHead>Inventory Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                        No inventory items found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIngredients.map((ing: any) => {
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
