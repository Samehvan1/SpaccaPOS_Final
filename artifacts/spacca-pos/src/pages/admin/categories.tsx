import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type DrinkCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
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
    <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/drinks"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Drink Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage categories that appear on the POS navigation bar.
            </p>
          </div>
        </div>
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
