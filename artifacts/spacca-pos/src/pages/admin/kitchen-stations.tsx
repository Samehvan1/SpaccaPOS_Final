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

type KitchenStation = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

async function fetchStations(): Promise<KitchenStation[]> {
  const res = await fetch(`${API_BASE}/kitchen-stations`);
  if (!res.ok) throw new Error("Failed to fetch stations");
  return res.json();
}

async function createStation(data: { name: string; sortOrder: number; isActive: boolean }): Promise<KitchenStation> {
  const res = await fetch(`${API_BASE}/kitchen-stations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function updateStation(id: number, data: Partial<{ name: string; sortOrder: number; isActive: boolean }>): Promise<KitchenStation> {
  const res = await fetch(`${API_BASE}/kitchen-stations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function deleteStation(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/kitchen-stations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

type Mode = "add" | "edit" | null;

export default function KitchenStationsAdmin() {
  const { toast } = useToast();
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [mode, setMode] = useState<Mode>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<KitchenStation | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setStations(await fetchStations());
    } catch {
      toast({ variant: "destructive", title: "Failed to load stations" });
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
    setSortOrder(String(stations.length * 10));
    setMode("add");
  };

  const openEdit = (s: KitchenStation) => {
    setEditId(s.id);
    setName(s.name);
    setSortOrder(String(s.sortOrder));
    setIsActive(s.isActive);
    setMode("edit");
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const payload = { name: name.trim(), sortOrder: parseInt(sortOrder) || 0, isActive };
      if (mode === "add") {
        await createStation(payload);
        toast({ title: "Station created" });
      } else if (mode === "edit" && editId !== null) {
        await updateStation(editId, payload);
        toast({ title: "Station updated" });
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
      await deleteStation(deleteTarget.id);
      toast({ title: `"${deleteTarget.name}" deleted` });
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Kitchen Stations</h1>
            <p className="text-muted-foreground mt-1">
              Add or remove stations used in the Kitchen Display and Drink settings.
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" /> New Station
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
          ) : stations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="font-medium">No stations defined yet.</p>
              <p className="text-sm mt-1">Create one to start assigning drinks to specific bars.</p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {stations.map(s => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{s.name}</span>
                      <Badge variant={s.isActive ? "default" : "secondary"} className="text-xs">
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Value: <code className="bg-muted px-1 rounded">{s.name.toLowerCase().replace(/\s+/g, '-')}</code> • Sort: {s.sortOrder}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => openEdit(s)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={mode !== null} onOpenChange={open => { if (!open) { setMode(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "New Station" : "Edit Station"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="s-name">Station Name</Label>
              <Input
                id="s-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Hot Bar, Cold Bar"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-sort">Sort Order</Label>
              <Input
                id="s-sort"
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch id="s-active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="s-active">Active station</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setMode(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
              {isSaving ? "Saving..." : mode === "add" ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Drinks currently assigned to this station will default back to "Main Bar".
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? "Deleting..." : "Delete Station"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
