import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, TrendingUp, BarChart3, Loader2, Calendar, Coffee, Package, DollarSign, ShoppingBag, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { fmt } from "@/lib/currency";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type DrinkCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

type CategoryPerf = {
  id: number;
  name: string;
  quantity: number;
  totalSales: number;
  orderCount: number;
};

type TopDrink = {
  drinkId: number;
  drinkName: string;
  categoryName: string;
  quantity: number;
  totalSales: number;
};

type PerfData = {
  categories: CategoryPerf[];
  topDrinks: TopDrink[];
  totalRevenue: number;
  totalQuantity: number;
  totalOrders: number;
  from: string;
  to: string;
};

async function fetchCategories(): Promise<DrinkCategory[]> {
  const res = await fetch(`${API_BASE}/drink-categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function createCategory(data: { name: string; sortOrder: number; isActive: boolean }): Promise<DrinkCategory> {
  const res = await fetch(`${API_BASE}/drink-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function updateCategory(id: number, data: Partial<{ name: string; sortOrder: number; isActive: boolean }>): Promise<DrinkCategory> {
  const res = await fetch(`${API_BASE}/drink-categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/drink-categories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

type Mode = "add" | "edit" | null;

// ── Performance Tab Component ──
function CategoryPerformanceTab() {
  const { toast } = useToast();
  const [perfData, setPerfData] = useState<PerfData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default: current month
  const now = new Date();
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => now.toISOString().split("T")[0]);

  const loadPerformance = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await fetch(`${API_BASE}/drink-categories/performance?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      setPerfData(await res.json());
    } catch {
      toast({ variant: "destructive", title: "Failed to load category performance" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPerformance(); }, [fromDate, toDate]);

  // Quick date presets
  const setPreset = (preset: string) => {
    const today = new Date();
    switch (preset) {
      case "today": {
        const d = today.toISOString().split("T")[0];
        setFromDate(d);
        setToDate(d);
        break;
      }
      case "week": {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        setFromDate(start.toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        break;
      }
      case "month": {
        setFromDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        break;
      }
      case "last-month": {
        const firstLast = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endLast = new Date(today.getFullYear(), today.getMonth(), 0);
        setFromDate(firstLast.toISOString().split("T")[0]);
        setToDate(endLast.toISOString().split("T")[0]);
        break;
      }
      case "year": {
        setFromDate(new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        break;
      }
    }
  };

  // Compute max for bar chart scaling
  const maxSales = useMemo(() => {
    if (!perfData) return 1;
    return Math.max(...perfData.categories.map(c => c.totalSales), 1);
  }, [perfData]);

  const COLORS = [
    "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500",
    "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-orange-500",
    "bg-teal-500", "bg-pink-500", "bg-lime-500", "bg-sky-500",
  ];

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-9 w-[160px]" />
              </div>
              <span className="text-muted-foreground px-1">—</span>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-9 w-[160px]" />
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: "today", label: "Today" },
                { key: "week", label: "This Week" },
                { key: "month", label: "This Month" },
                { key: "last-month", label: "Last Month" },
                { key: "year", label: "YTD" },
              ].map(p => (
                <Button key={p.key} variant="outline" size="sm" className="text-xs h-8" onClick={() => setPreset(p.key)}>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : perfData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold">{fmt(perfData.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Items Sold</p>
                    <p className="text-2xl font-bold">{perfData.totalQuantity.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10">
                    <ShoppingBag className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                    <p className="text-2xl font-bold">{perfData.totalOrders.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {perfData.categories.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {perfData.categories.map((cat, i) => {
                    const pct = perfData.totalRevenue > 0 ? ((cat.totalSales / perfData.totalRevenue) * 100) : 0;
                    const barWidth = (cat.totalSales / maxSales) * 100;
                    return (
                      <div key={cat.id} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-3 h-3 rounded-sm ${COLORS[i % COLORS.length]} shrink-0`} />
                            <span className="font-medium text-sm capitalize truncate">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm shrink-0">
                            <span className="text-muted-foreground tabular-nums">{cat.quantity} items</span>
                            <span className="text-muted-foreground tabular-nums">{cat.orderCount} orders</span>
                            <span className="font-semibold tabular-nums w-[100px] text-right">{fmt(cat.totalSales)}</span>
                            <Badge variant="secondary" className="text-xs tabular-nums w-[52px] justify-center">
                              {pct.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${COLORS[i % COLORS.length]}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Selling Drinks */}
          {perfData.topDrinks && perfData.topDrinks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" /> Top Selling Drinks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {perfData.topDrinks.map((drink, i) => (
                    <div key={drink.drinkId} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        i < 3 ? "bg-amber-500" : "bg-muted-foreground/30"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{drink.drinkName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{drink.categoryName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm tabular-nums">{fmt(drink.totalSales)}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{drink.quantity} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

// ── Main Component ──
export default function CategoriesAdmin() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<DrinkCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [mode, setMode] = useState<Mode>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<DrinkCategory | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setCategories(await fetchCategories());
    } catch {
      toast({ variant: "destructive", title: "Failed to load categories" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSortOrder("0");
    setIsActive(true);
  };

  const openAdd = () => {
    resetForm();
    setSortOrder(String(categories.length * 10));
    setMode("add");
  };

  const openEdit = (cat: DrinkCategory) => {
    setEditId(cat.id);
    setName(cat.name);
    setSortOrder(String(cat.sortOrder));
    setIsActive(cat.isActive);
    setMode("edit");
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const payload = { name: name.trim(), sortOrder: parseInt(sortOrder) || 0, isActive };
      if (mode === "add") {
        await createCategory(payload);
        toast({ title: "Category created" });
      } else if (mode === "edit" && editId !== null) {
        await updateCategory(editId, payload);
        toast({ title: "Category updated" });
      }
      setMode(null);
      resetForm();
      await load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast({ title: `"${deleteTarget.name}" deleted` });
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cat: DrinkCategory) => {
    try {
      await updateCategory(cat.id, { isActive: !cat.isActive });
      await load();
    } catch {
      toast({ variant: "destructive", title: "Failed to update" });
    }
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/drinks"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Drink Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage categories and view performance analytics.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList>
          <TabsTrigger value="manage" className="gap-1.5">
            <Coffee className="h-4 w-4" /> Manage
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5">
            <TrendingUp className="h-4 w-4" /> Performance
          </TabsTrigger>
        </TabsList>

        {/* ── Manage Tab ── */}
        <TabsContent value="manage" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> New Category
            </Button>
          </div>

          <Card>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-medium">No categories yet.</p>
                  <p className="text-sm mt-1">Create one to start organizing your drinks.</p>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{cat.name}</span>
                          <Badge variant={cat.isActive ? "default" : "secondary"} className="text-xs">
                            {cat.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Sort order: {cat.sortOrder}
                        </div>
                      </div>
                      <Switch
                        checked={cat.isActive}
                        onCheckedChange={() => handleToggleActive(cat)}
                        aria-label={`Toggle ${cat.name}`}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => openEdit(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Performance Tab ── */}
        <TabsContent value="performance" className="mt-4">
          <CategoryPerformanceTab />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={mode !== null} onOpenChange={open => { if (!open) { setMode(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "New Category" : "Edit Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Coffee, Cold Drinks"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-sort">Sort Order</Label>
              <Input
                id="cat-sort"
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Lower values appear first in the POS nav.</p>
            </div>
            {mode === "edit" && (
              <div className="flex items-center gap-3 pt-1">
                <Switch id="cat-active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="cat-active">
                  {isActive ? "Active — visible on POS" : "Inactive — hidden from POS"}
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setMode(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
              {isSaving ? "Saving..." : mode === "add" ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Drinks assigned to this category will lose their category link but won't be deleted.
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
