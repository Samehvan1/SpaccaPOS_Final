import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, Tag, Gift, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Offer = {
  id: number;
  name: string;
  buyAmount: number;
  freeAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

export default function OffersAdmin() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [buyAmount, setBuyAmount] = useState("2");
  const [freeAmount, setFreeAmount] = useState("1");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/offers");
      setOffers(data || []);
    } catch {
      toast({ variant: "destructive", title: "Failed to load offers" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditId(null);
    setName("");
    setBuyAmount("2");
    setFreeAmount("1");
    setIsActive(true);
    setShowForm(true);
  };

  const openEdit = (o: Offer) => {
    setEditId(o.id);
    setName(o.name);
    setBuyAmount(String(o.buyAmount));
    setFreeAmount(String(o.freeAmount));
    setIsActive(o.isActive);
    setShowForm(true);
  };

  const handleSave = async () => {
    const buyVal = parseInt(buyAmount, 10);
    const freeVal = parseInt(freeAmount, 10);

    if (!name.trim() || isNaN(buyVal) || buyVal <= 0 || isNaN(freeVal) || freeVal <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid offer name and amounts greater than 0.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        buyAmount: buyVal,
        freeAmount: freeVal,
        isActive,
      };

      if (editId) {
        await api(`/api/offers/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Offer updated successfully" });
      } else {
        await api("/api/offers", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Offer created successfully" });
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save offer", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await api(`/api/offers/${id}`, { method: "DELETE" });
      toast({ title: "Offer deleted" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete offer", description: err.message });
    }
  };

  const handleToggleActive = async (o: Offer, newActive: boolean) => {
    try {
      await api(`/api/offers/${o.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: newActive }),
      });
      toast({ title: newActive ? "Offer activated" : "Offer deactivated" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to update offer", description: err.message });
    }
  };

  const filteredOffers = offers.filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Promotional Offers</h1>
          <p className="text-muted-foreground text-sm">Create and manage Buy 'N' Get 'X' Free rules that apply to all drinks.</p>
        </div>
        <Button onClick={openAdd} className="gap-2 shrink-0 font-bold">
          <Plus className="h-4 w-4" /> Add Offer
        </Button>
      </div>

      <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-wider">
            <Gift className="h-4 w-4 text-primary" /> Active Promotions Checklist
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search offers..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Offer Rule Name</TableHead>
                  <TableHead className="text-center">Buy Requirement (N)</TableHead>
                  <TableHead className="text-center">Free Reward (X)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center w-[120px]">Toggle Active</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Loading promotional offers...
                    </TableCell>
                  </TableRow>
                ) : filteredOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No promotional offers found. Click "Add Offer" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffers.map((o) => (
                    <TableRow key={o.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono font-bold text-xs">{o.id}</TableCell>
                      <TableCell className="font-bold">{o.name}</TableCell>
                      <TableCell className="text-center font-bold">{o.buyAmount}</TableCell>
                      <TableCell className="text-center font-bold">{o.freeAmount}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={o.isActive ? "default" : "secondary"}
                          className={`font-bold ${o.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : ""}`}
                        >
                          {o.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={o.isActive}
                            onCheckedChange={(checked) => handleToggleActive(o, checked)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(o)} className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)} className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Offer Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Promotional Offer" : "Add Promotional Offer"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Offer Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Buy 2 Get 1 Free on Drinks"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buyAmount">Buy Amount (N)</Label>
                <Input
                  id="buyAmount"
                  type="number"
                  min="1"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="freeAmount">Free Amount (X)</Label>
                <Input
                  id="freeAmount"
                  type="number"
                  min="1"
                  value={freeAmount}
                  onChange={(e) => setFreeAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Mark Active</Label>
                <p className="text-[10px] text-muted-foreground">Activating this will automatically deactivate all other offers.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            {isActive && (
              <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[10px] text-amber-700 font-semibold items-start">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Notice: Enactivating this offer will make it live immediately on the cashier screen and kiosk. Standard coupons will be rejected for matching orders.</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
