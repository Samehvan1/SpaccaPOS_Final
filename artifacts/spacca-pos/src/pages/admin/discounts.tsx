import { useState, useEffect, useCallback } from "react";
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
import { Search, Plus, Edit, Trash2, Percent, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Discount = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
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

export default function DiscountsAdmin() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDiscounts(await api("/api/discounts"));
    } catch {
      toast({ variant: "destructive", title: "Failed to load discounts" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditId(null); setCode(""); setType("percentage"); setValue("0"); setIsActive(true);
    setShowForm(true);
  };

  const openEdit = (d: Discount) => {
    setEditId(d.id); setCode(d.code); setType(d.type); setValue(String(d.value)); setIsActive(d.isActive);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!code.trim() || !value) return;
    setSaving(true);
    try {
      const payload = { code: code.trim().toUpperCase(), type, value: parseFloat(value), isActive };
      if (editId) {
        await api(`/api/discounts/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Discount updated" });
      } else {
        await api("/api/discounts", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Discount created" });
      }
      setShowForm(false); load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this discount coupon?")) return;
    try {
      await api(`/api/discounts/${id}`, { method: "DELETE" });
      load();
      toast({ title: "Discount deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  const filtered = discounts.filter(d => 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discounts & Coupons</h1>
          <p className="text-muted-foreground">Manage discount codes for the POS terminal.</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Discount
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by code..." 
              className="pl-9" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No discounts found.</TableCell></TableRow>
                ) : filtered.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-bold text-primary">{d.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {d.type === "percentage" ? <Percent className="h-3.5 w-3.5" /> : <Banknote className="h-3.5 w-3.5" />}
                        <span className="capitalize">{d.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {d.type === "percentage" ? `${d.value}%` : `E£${fmt(d.value)}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.isActive ? "default" : "secondary"}>
                        {d.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Discount" : "New Discount Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input 
                id="code" 
                placeholder="e.g. SUMMER20, WELCOME" 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                className="font-mono font-bold uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (E£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <div className="relative">
                  <Input 
                    id="value" 
                    type="number" 
                    step="0.01" 
                    value={value} 
                    onChange={e => setValue(e.target.value)} 
                  />
                  <div className="absolute right-3 top-2 text-xs text-muted-foreground font-medium">
                    {type === "percentage" ? "%" : "E£"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active" className="cursor-pointer">Coupon is active and can be used</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !code.trim()}>
              {saving ? "Saving..." : "Save Discount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
