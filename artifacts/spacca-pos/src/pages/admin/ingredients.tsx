import { useState, useEffect, useCallback } from "react";
import { useListIngredients, useCreateIngredient, useUpdateIngredient, useCreateIngredientOption } from "@workspace/api-client-react";
import { fmt } from "@/lib/currency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Search, Edit, Trash2, Link2, Star, StarOff, ChevronRight, Package, Tag, Layers, FlaskConical } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const INGREDIENT_TYPES = ["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "other"] as const;
type IngredientType = typeof INGREDIENT_TYPES[number];

type Ingredient = {
  id: number; name: string; ingredientType: IngredientType; unit: string;
  costPerUnit: number; stockQuantity: number; lowStockThreshold: number; isActive: boolean;
};
type IngredientOption = {
  id: number; ingredientId: number; label: string; extraCost: number; processedQty: number;
  producedQty: number; producedUnit: string; isDefault: boolean; sortOrder: number; linkedIngredientId: number | null;
};
type Category = { id: number; name: string; sortOrder: number };
type IngType = {
  id: number; categoryId: number; name: string; inventoryIngredientId: number | null;
  processedQty: string; producedQty: string; unit: string;
  isActive: boolean; sortOrder: number; category?: Category | null; inventoryIngredient?: { id: number; name: string; unit: string } | null;
};
type Volume = { id: number; name: string; processedQty: string; producedQty: string; unit: string; sortOrder: number };
type TypeVolume = {
  id: number; ingredientTypeId: number; volumeId: number; processedQty: string | null;
  producedQty: string | null; unit: string | null; extraCost: string; isDefault: boolean; sortOrder: number;
  volume?: Volume | null;
};

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

// ── Categories Tab ────────────────────────────────────────────────────────

function CategoriesTab() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCategories(await api("/api/catalog/categories")); } catch { toast({ variant: "destructive", title: "Failed to load categories" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditId(null); setName(""); setShowAdd(true); };
  const openEdit = (c: Category) => { setEditId(c.id); setName(c.name); setShowAdd(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await api(`/api/catalog/categories/${editId}`, { method: "PATCH", body: JSON.stringify({ name: name.trim() }) });
        toast({ title: "Category updated" });
      } else {
        await api("/api/catalog/categories", { method: "POST", body: JSON.stringify({ name: name.trim(), sortOrder: categories.length }) });
        toast({ title: "Category created" });
      }
      setShowAdd(false);
      load();
    } catch { toast({ variant: "destructive", title: "Failed to save" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? All types under it will lose their category link.")) return;
    try { await api(`/api/catalog/categories/${id}`, { method: "DELETE" }); load(); toast({ title: "Category deleted" }); }
    catch { toast({ variant: "destructive", title: "Failed to delete" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">High-level groupings: Coffee, Milk, Syrup, Sauce, etc.</p>
        <Button size="sm" className="gap-2" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Category</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={2} className="text-center py-8">Loading…</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">No categories yet.</TableCell></TableRow>
            ) : categories.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAdd} onOpenChange={o => { if (!o) setShowAdd(false); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Coffee, Milk, Syrup" autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Types Tab ─────────────────────────────────────────────────────────────

function TypesTab({ inventoryItems }: { inventoryItems: Ingredient[] }) {
  const { toast } = useToast();
  const [types, setTypes] = useState<IngType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allVolumes, setAllVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [inventoryIngId, setInventoryIngId] = useState<string>("none");
  const [isActive, setIsActive] = useState(true);
  const [processedQty, setProcessedQty] = useState("0");
  const [producedQty, setProducedQty] = useState("0");
  const [unit, setUnit] = useState("ml");
  const [saving, setSaving] = useState(false);

  // Volume config dialog
  const [volTypeId, setVolTypeId] = useState<number | null>(null);
  const [volTypeName, setVolTypeName] = useState("");
  const [typeVolumes, setTypeVolumes] = useState<TypeVolume[]>([]);
  const [loadingTypeVols, setLoadingTypeVols] = useState(false);
  const [addingVolumeId, setAddingVolumeId] = useState<string>("");
  const [addingExtraCost, setAddingExtraCost] = useState("0");
  const [addingIsDefault, setAddingIsDefault] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, c, v] = await Promise.all([
        api("/api/catalog/types"),
        api("/api/catalog/categories"),
        api("/api/catalog/volumes"),
      ]);
      setTypes(t); setCategories(c); setAllVolumes(v);
    } catch { toast({ variant: "destructive", title: "Failed to load types" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { 
    setEditId(null); setName(""); setCategoryId(""); setInventoryIngId("none"); 
    setProcessedQty("0"); setProducedQty("0"); setUnit("ml");
    setIsActive(true); setShowForm(true); 
  };
  const openEdit = (t: IngType) => {
    setEditId(t.id); setName(t.name); setCategoryId(String(t.categoryId));
    setInventoryIngId(t.inventoryIngredientId ? String(t.inventoryIngredientId) : "none");
    setProcessedQty(t.processedQty ?? "0");
    setProducedQty(t.producedQty ?? "0");
    setUnit(t.unit ?? "ml");
    setIsActive(t.isActive); setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !categoryId) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(), categoryId: parseInt(categoryId),
        inventoryIngredientId: inventoryIngId !== "none" ? parseInt(inventoryIngId) : null,
        processedQty, producedQty, unit: unit || "ml",
        isActive,
      };
      if (editId) {
        await api(`/api/catalog/types/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Type updated" });
      } else {
        await api("/api/catalog/types", { method: "POST", body: JSON.stringify({ ...payload, sortOrder: types.length }) });
        toast({ title: "Type created" });
      }
      setShowForm(false); load();
    } catch { toast({ variant: "destructive", title: "Failed to save" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this ingredient type?")) return;
    try { await api(`/api/catalog/types/${id}`, { method: "DELETE" }); load(); toast({ title: "Type deleted" }); }
    catch { toast({ variant: "destructive", title: "Failed to delete" }); }
  };

  const openVolumes = async (t: IngType) => {
    setVolTypeId(t.id); setVolTypeName(t.name);
    setLoadingTypeVols(true); setAddingVolumeId(""); setAddingExtraCost("0"); setAddingIsDefault(false);
    try { setTypeVolumes(await api(`/api/catalog/types/${t.id}/volumes`)); }
    catch { toast({ variant: "destructive", title: "Failed to load volumes" }); }
    finally { setLoadingTypeVols(false); }
  };

  const handleAddTypeVolume = async () => {
    if (!volTypeId || !addingVolumeId) return;
    try {
      const row = await api(`/api/catalog/types/${volTypeId}/volumes`, {
        method: "POST",
        body: JSON.stringify({ volumeId: parseInt(addingVolumeId), extraCost: addingExtraCost, isDefault: addingIsDefault, sortOrder: typeVolumes.length }),
      });
      setTypeVolumes(prev => [...prev, { ...row, volume: allVolumes.find(v => v.id === row.volumeId) ?? null }]);
      setAddingVolumeId(""); setAddingExtraCost("0"); setAddingIsDefault(false);
      toast({ title: "Volume added to type" });
    } catch { toast({ variant: "destructive", title: "Failed to add volume" }); }
  };

  const handleDeleteTypeVolume = async (tvId: number) => {
    try {
      await api(`/api/catalog/type-volumes/${tvId}`, { method: "DELETE" });
      setTypeVolumes(prev => prev.filter(v => v.id !== tvId));
      toast({ title: "Volume removed" });
    } catch { toast({ variant: "destructive", title: "Failed to remove volume" }); }
  };

  const handleToggleDefault = async (tv: TypeVolume) => {
    try {
      const updated = await api(`/api/catalog/type-volumes/${tv.id}`, {
        method: "PATCH", body: JSON.stringify({ isDefault: !tv.isDefault }),
      });
      setTypeVolumes(prev => prev.map(v => v.id === tv.id ? { ...v, isDefault: updated.isDefault } : { ...v, isDefault: false }));
    } catch { toast({ variant: "destructive", title: "Failed to update" }); }
  };

  const availableVolumesToAdd = allVolumes.filter(v => !typeVolumes.some(tv => tv.volumeId === v.id));

  const filteredTypes = types.filter(t => {
    if (filterCategory !== "all" && String(t.categoryId) !== filterCategory) return false;
    if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Named ingredient kinds within a category, linked to an inventory item for stock tracking.</p>
        <Button size="sm" className="gap-2" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Type</Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search types..." 
            className="pl-9" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Inventory Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading…</TableCell></TableRow>
            ) : filteredTypes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No types found.</TableCell></TableRow>
            ) : filteredTypes.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>
                  {t.category ? (
                    <Badge variant="outline">{t.category.name}</Badge>
                  ) : <span className="text-muted-foreground text-sm">—</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.inventoryIngredient ? t.inventoryIngredient.name : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={t.isActive ? "default" : "secondary"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs" onClick={() => openVolumes(t)}>
                    <Layers className="h-3.5 w-3.5" /> Volumes
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Type Dialog */}
      <Dialog open={showForm} onOpenChange={o => { if (!o) setShowForm(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Edit Type" : "Add Ingredient Type"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Brazilian Espresso, Oat Milk" autoFocus />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Pick category…" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Inventory Item (for stock deduction)</Label>
              <Select value={inventoryIngId} onValueChange={setInventoryIngId}>
                <SelectTrigger><SelectValue placeholder="Link to inventory item…" /></SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  <SelectItem value="none">No link</SelectItem>
                  {inventoryItems.map(i => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name} <span className="text-muted-foreground">({i.unit})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Processed Qty</Label>
                <Input type="number" step="0.1" value={processedQty} onChange={e => setProcessedQty(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Produced Qty</Label>
                <Input type="number" step="0.1" value={producedQty} onChange={e => setProducedQty(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Unit</Label>
                <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="ml, g" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Base quantities to use if no volume is selected in the recipe.</p>
            <div className="flex items-center gap-2">
              <Switch id="type-active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="type-active" className="cursor-pointer">{isActive ? "Active" : "Inactive"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim() || !categoryId}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Type Volumes Dialog */}
      <Dialog open={volTypeId !== null} onOpenChange={o => { if (!o) setVolTypeId(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Volumes — {volTypeName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Add the volumes available for this ingredient type, with extra cost and default flag.</p>

            {loadingTypeVols ? (
              <div className="text-sm text-center py-4 text-muted-foreground">Loading…</div>
            ) : typeVolumes.length === 0 ? (
              <div className="border border-dashed rounded-md p-4 text-center text-sm text-muted-foreground">No volumes yet.</div>
            ) : (
              <div className="border rounded-md divide-y">
                {typeVolumes.map(tv => (
                  <div key={tv.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{tv.volume?.name ?? `#${tv.volumeId}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {tv.volume && `${tv.volume.producedQty}${tv.volume.unit}`}
                        {tv.extraCost !== "0" && ` · +${fmt(parseFloat(tv.extraCost))}`}
                      </div>
                    </div>
                    <button
                      title={tv.isDefault ? "Remove as default" : "Set as default"}
                      className="text-muted-foreground hover:text-primary transition-colors p-1"
                      onClick={() => handleToggleDefault(tv)}
                    >
                      {tv.isDefault ? <Star className="h-4 w-4 fill-primary text-primary" /> : <StarOff className="h-4 w-4" />}
                    </button>
                    <button
                      title="Remove"
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      onClick={() => handleDeleteTypeVolume(tv.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add volume form */}
            {availableVolumesToAdd.length > 0 && (
              <div className="border rounded-md p-3 space-y-3 bg-muted/20">
                <div className="text-xs font-medium text-muted-foreground">Add Volume</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Volume</Label>
                    <Select value={addingVolumeId} onValueChange={setAddingVolumeId}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pick volume…" /></SelectTrigger>
                      <SelectContent>
                        {availableVolumesToAdd.map(v => (
                          <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Extra Cost (E£)</Label>
                    <Input className="h-8 text-sm" type="number" step="0.01" value={addingExtraCost} onChange={e => setAddingExtraCost(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="tv-default" checked={addingIsDefault} onCheckedChange={setAddingIsDefault} />
                  <Label htmlFor="tv-default" className="text-xs">Set as default</Label>
                </div>
                <Button size="sm" className="w-full gap-2" onClick={handleAddTypeVolume} disabled={!addingVolumeId}>
                  <Plus className="h-3.5 w-3.5" /> Add Volume
                </Button>
              </div>
            )}
            {availableVolumesToAdd.length === 0 && typeVolumes.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">All volumes added. Create more in the Volumes tab.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Volumes Tab ───────────────────────────────────────────────────────────

function VolumesTab() {
  const { toast } = useToast();
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [processedQty, setProcessedQty] = useState("0");
  const [producedQty, setProducedQty] = useState("0");
  const [unit, setUnit] = useState("ml");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setVolumes(await api("/api/catalog/volumes")); } catch { toast({ variant: "destructive", title: "Failed to load volumes" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditId(null); setName(""); setProcessedQty("0"); setProducedQty("0"); setUnit("ml"); setShowForm(true); };
  const openEdit = (v: Volume) => { setEditId(v.id); setName(v.name); setProcessedQty(v.processedQty); setProducedQty(v.producedQty); setUnit(v.unit); setShowForm(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = { name: name.trim(), processedQty, producedQty, unit: unit || "ml" };
      if (editId) {
        await api(`/api/catalog/volumes/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Volume updated" });
      } else {
        await api("/api/catalog/volumes", { method: "POST", body: JSON.stringify({ ...payload, sortOrder: volumes.length }) });
        toast({ title: "Volume created" });
      }
      setShowForm(false); load();
    } catch { toast({ variant: "destructive", title: "Failed to save" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this volume? It will be removed from all types.")) return;
    try { await api(`/api/catalog/volumes/${id}`, { method: "DELETE" }); load(); toast({ title: "Volume deleted" }); }
    catch { toast({ variant: "destructive", title: "Failed to delete" }); }
  };

  const filteredVolumes = volumes.filter(v => 
    !searchTerm || v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Reusable volume definitions: Single Shot, Double Shot, 1 Pump, 150ml, etc.</p>
        <Button size="sm" className="gap-2" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Volume</Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search volumes..." 
            className="pl-9" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Processed Qty</TableHead>
              <TableHead>Produced Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading…</TableCell></TableRow>
            ) : filteredVolumes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No volumes found.</TableCell></TableRow>
            ) : filteredVolumes.map(v => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{v.processedQty}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{v.producedQty}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{v.unit}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={o => { if (!o) setShowForm(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Edit Volume" : "Add Volume"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Single Shot, 1 Pump, Medium 150ml" autoFocus />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Processed Qty</Label>
                <Input type="number" step="0.1" value={processedQty} onChange={e => setProcessedQty(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Produced Qty</Label>
                <Input type="number" step="0.1" value={producedQty} onChange={e => setProducedQty(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Unit</Label>
                <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="ml, g, pump" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Processed Qty = raw material consumed. Produced Qty = liquid produced (used for cup fill calculations).</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Inventory Tab (existing, preserved) ──────────────────────────────────

function InventoryTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: ingredients, isLoading, refetch } = useListIngredients();
  const { toast } = useToast();

  const [mode, setMode] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<IngredientType>("coffee");
  const [unit, setUnit] = useState("g");
  const [cost, setCost] = useState("");
  const [lowThreshold, setLowThreshold] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [options, setOptions] = useState<IngredientOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptLabel, setNewOptLabel] = useState("");
  const [newOptExtraCost, setNewOptExtraCost] = useState("0");
  const [newOptLinkedId, setNewOptLinkedId] = useState<string>("none");
  const [newOptProcessedQty, setNewOptProcessedQty] = useState("1");
  const [newOptProducedQty, setNewOptProducedQty] = useState("1");
  const [newOptProducedUnit, setNewOptProducedUnit] = useState("");
  const [newOptIsDefault, setNewOptIsDefault] = useState(false);

  const { mutate: createIngredient, isPending: isCreating } = useCreateIngredient({
    mutation: {
      onSuccess: () => { toast({ title: "Ingredient Created" }); setMode(null); resetForm(); refetch(); },
      onError: () => toast({ variant: "destructive", title: "Failed to create ingredient" }),
    },
  });

  const { mutate: updateIngredient, isPending: isUpdating } = useUpdateIngredient({
    mutation: {
      onSuccess: () => { toast({ title: "Ingredient updated" }); setMode(null); resetForm(); refetch(); },
      onError: () => toast({ variant: "destructive", title: "Failed to update ingredient" }),
    },
  });

  const { mutate: createOption } = useCreateIngredientOption({
    mutation: {
      onSuccess: (data: any) => { setOptions(prev => [...prev, data as IngredientOption]); setShowAddOption(false); resetNewOption(); toast({ title: "Option added" }); },
      onError: () => toast({ variant: "destructive", title: "Failed to add option" }),
    },
  });

  const resetForm = () => { setName(""); setType("coffee"); setUnit("g"); setCost(""); setLowThreshold("0"); setIsActive(true); setEditId(null); setOptions([]); setShowAddOption(false); resetNewOption(); };
  const resetNewOption = () => { setNewOptLabel(""); setNewOptExtraCost("0"); setNewOptLinkedId("none"); setNewOptProcessedQty("1"); setNewOptProducedQty("1"); setNewOptProducedUnit(""); setNewOptIsDefault(false); };

  const loadOptions = async (id: number) => {
    setIsLoadingOptions(true);
    try {
      const res = await fetch(`/api/ingredients/${id}`);
      const data = await res.json();
      setOptions(data.options ?? []);
    } catch { toast({ variant: "destructive", title: "Failed to load options" }); }
    finally { setIsLoadingOptions(false); }
  };

  const openAdd = () => { resetForm(); setMode("add"); };
  const openEdit = (ing: Ingredient) => {
    setEditId(ing.id); setName(ing.name); setType(ing.ingredientType); setUnit(ing.unit);
    setCost(String(ing.costPerUnit)); setLowThreshold(String(ing.lowStockThreshold)); setIsActive(ing.isActive);
    setMode("edit"); loadOptions(ing.id);
  };

  const handleSave = () => {
    if (!name || !cost) return;
    if (mode === "add") {
      createIngredient({ data: { name, ingredientType: type, unit, costPerUnit: parseFloat(cost) } });
    } else if (mode === "edit" && editId !== null) {
      updateIngredient({ id: editId, data: { name, ingredientType: type, unit, costPerUnit: parseFloat(cost), lowStockThreshold: parseFloat(lowThreshold), isActive } });
    }
  };

  const handleAddOption = () => {
    if (!editId || !newOptLabel) return;
    createOption({
      id: editId,
      data: {
        label: newOptLabel, extraCost: parseFloat(newOptExtraCost) || 0,
        processedQty: parseFloat(newOptProcessedQty) || 1, producedQty: parseFloat(newOptProducedQty) || 1,
        producedUnit: newOptProducedUnit || unit, isDefault: newOptIsDefault,
        linkedIngredientId: newOptLinkedId !== "none" ? parseInt(newOptLinkedId) : null,
        sortOrder: options.length,
      },
    });
  };

  const handleDeleteOption = async (optId: number) => {
    if (!editId) return;
    try { await fetch(`/api/ingredients/${editId}/options/${optId}`, { method: "DELETE" }); setOptions(prev => prev.filter(o => o.id !== optId)); toast({ title: "Option removed" }); }
    catch { toast({ variant: "destructive", title: "Failed to delete option" }); }
  };

  const handleToggleDefault = async (opt: IngredientOption) => {
    if (!editId) return;
    try {
      const res = await fetch(`/api/ingredients/${editId}/options/${opt.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: !opt.isDefault }) });
      const updated = await res.json();
      setOptions(prev => prev.map(o => o.id === opt.id ? { ...o, isDefault: updated.isDefault } : o));
    } catch { toast({ variant: "destructive", title: "Failed to update option" }); }
  };

  const handleSetLinked = async (opt: IngredientOption, linkedIngredientId: number | null) => {
    if (!editId) return;
    try {
      const res = await fetch(`/api/ingredients/${editId}/options/${opt.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkedIngredientId }) });
      const updated = await res.json();
      setOptions(prev => prev.map(o => o.id === opt.id ? { ...o, linkedIngredientId: updated.linkedIngredientId } : o));
    } catch { toast({ variant: "destructive", title: "Failed to update link" }); }
  };

  const filteredIngredients = ingredients?.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.ingredientType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getIngredientName = (id: number | null) => id ? (ingredients?.find(i => i.id === id)?.name ?? `#${id}`) : null;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Raw inventory items used for stock tracking and cost calculation.</p>
        <Button size="sm" className="gap-2" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> New Ingredient</Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ingredients..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Low Alert</TableHead>
                  <TableHead>Cost/Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredIngredients?.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No ingredients found.</TableCell></TableRow>
                ) : (
                  filteredIngredients?.map(ing => (
                    <TableRow key={ing.id}>
                      <TableCell className="font-medium">{ing.name}</TableCell>
                      <TableCell className="capitalize">{ing.ingredientType}</TableCell>
                      <TableCell>
                        <div className={`font-medium ${ing.stockQuantity <= ing.lowStockThreshold ? "text-destructive" : ""}`}>
                          {ing.stockQuantity} {ing.unit}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{ing.lowStockThreshold} {ing.unit}</TableCell>
                      <TableCell>{fmt(ing.costPerUnit, 4)}</TableCell>
                      <TableCell>
                        <Badge variant={ing.isActive ? "default" : "secondary"}>{ing.isActive ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(ing as Ingredient)}><Edit className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={mode !== null} onOpenChange={open => { if (!open) { setMode(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{mode === "add" ? "Add Ingredient" : `Edit: ${name}`}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="i-name">Name</Label>
              <Input id="i-name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={v => setType(v as IngredientType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INGREDIENT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="i-unit">Unit</Label>
                <Input id="i-unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="g, ml, pump" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="i-cost">Cost per Unit (E£)</Label>
                <Input id="i-cost" type="number" step="0.0001" value={cost} onChange={e => setCost(e.target.value)} />
              </div>
              {mode === "edit" && (
                <div className="grid gap-2">
                  <Label htmlFor="i-low">Low Stock Alert</Label>
                  <Input id="i-low" type="number" step="0.01" value={lowThreshold} onChange={e => setLowThreshold(e.target.value)} />
                </div>
              )}
            </div>
            {mode === "edit" && (
              <div className="flex items-center gap-3 pt-1">
                <Switch id="i-active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="i-active">{isActive ? "Active — used in drinks" : "Inactive — disabled"}</Label>
              </div>
            )}
          </div>

          {mode === "edit" && (
            <>
              <Separator className="my-2" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Options</div>
                    <div className="text-xs text-muted-foreground">Each option can link to another ingredient for two-level picking.</div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAddOption(v => !v)}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
                {isLoadingOptions ? (
                  <div className="text-sm text-muted-foreground py-2">Loading options...</div>
                ) : options.length === 0 && !showAddOption ? (
                  <div className="text-sm text-muted-foreground border border-dashed rounded-md p-4 text-center">No options yet.</div>
                ) : (
                  <div className="border rounded-md divide-y overflow-hidden">
                    {options.map(opt => (
                      <div key={opt.id} className="flex items-start gap-3 p-3 bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{opt.label}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {opt.extraCost !== 0 && <span className="text-xs text-muted-foreground">+{fmt(opt.extraCost)}</span>}
                            {opt.linkedIngredientId ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                <Link2 className="h-3 w-3" /> Links to: {getIngredientName(opt.linkedIngredientId)}
                              </span>
                            ) : null}
                            {opt.isDefault && <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full font-medium">Default</span>}
                          </div>
                          <div className="mt-2">
                            <Select value={String(opt.linkedIngredientId ?? "none")} onValueChange={v => handleSetLinked(opt, v === "none" ? null : parseInt(v))}>
                              <SelectTrigger className="h-7 text-xs max-w-[200px]"><SelectValue placeholder="Links to ingredient…" /></SelectTrigger>
                              <SelectContent className="max-h-[250px]">
                                <SelectItem value="none">No link (plain option)</SelectItem>
                                {ingredients?.filter(i => i.id !== editId).map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded" onClick={() => handleToggleDefault(opt)}>
                            {opt.isDefault ? <Star className="h-4 w-4 fill-primary text-primary" /> : <StarOff className="h-4 w-4" />}
                          </button>
                          <button className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded" onClick={() => handleDeleteOption(opt.id)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showAddOption && (
                  <div className="border rounded-md p-3 space-y-3 bg-muted/20">
                    <div className="text-sm font-medium text-muted-foreground">New Option</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Label *</Label>
                        <Input className="h-8 text-sm" value={newOptLabel} onChange={e => setNewOptLabel(e.target.value)} placeholder="e.g. Oat Milk, Small 100ml" />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Extra Cost (E£)</Label>
                        <Input className="h-8 text-sm" type="number" step="0.01" value={newOptExtraCost} onChange={e => setNewOptExtraCost(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Processed Qty</Label>
                        <Input className="h-8 text-sm" type="number" step="0.1" value={newOptProcessedQty} onChange={e => setNewOptProcessedQty(e.target.value)} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Produced Qty</Label>
                        <Input className="h-8 text-sm" type="number" step="0.1" value={newOptProducedQty} onChange={e => setNewOptProducedQty(e.target.value)} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Produced Unit</Label>
                        <Input className="h-8 text-sm" value={newOptProducedUnit || unit} onChange={e => setNewOptProducedUnit(e.target.value)} placeholder={unit} />
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs flex items-center gap-1"><Link2 className="h-3 w-3" /> Links to ingredient</Label>
                      <Select value={newOptLinkedId} onValueChange={setNewOptLinkedId}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="No link (plain option)" /></SelectTrigger>
                        <SelectContent className="max-h-[250px]">
                          <SelectItem value="none">No link (plain option)</SelectItem>
                          {ingredients?.filter(i => i.id !== editId).map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="new-opt-default" checked={newOptIsDefault} onCheckedChange={setNewOptIsDefault} />
                      <Label htmlFor="new-opt-default" className="text-xs">Set as default option</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={handleAddOption} disabled={!newOptLabel}>Add Option</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setShowAddOption(false); resetNewOption(); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => { setMode(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={isCreating || isUpdating || !name || !cost}>
              {(isCreating || isUpdating) ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────

export default function IngredientsAdmin() {
  const { data: inventoryItems = [] } = useListIngredients();

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ingredients</h1>
          <p className="text-muted-foreground mt-1">Manage inventory items, catalog categories, types, and volume definitions.</p>
        </div>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="inventory" className="gap-1.5">
            <Package className="h-3.5 w-3.5" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Categories
          </TabsTrigger>
          <TabsTrigger value="types" className="gap-1.5">
            <FlaskConical className="h-3.5 w-3.5" /> Types
          </TabsTrigger>
          <TabsTrigger value="volumes" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Volumes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <InventoryTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="types" className="mt-6">
          <TypesTab inventoryItems={inventoryItems as Ingredient[]} />
        </TabsContent>
        <TabsContent value="volumes" className="mt-6">
          <VolumesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
