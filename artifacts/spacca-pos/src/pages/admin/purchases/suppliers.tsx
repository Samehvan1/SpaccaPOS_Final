import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Supplier = {
  id: number;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxId: string | null;
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

export default function SuppliersAdmin() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSuppliers(await api("/api/purchases/suppliers"));
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load suppliers", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditId(null);
    setName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setTaxId("");
    setIsActive(true);
    setShowForm(true);
  };

  const openEdit = (s: Supplier) => {
    setEditId(s.id);
    setName(s.name);
    setContactName(s.contactName || "");
    setPhone(s.phone || "");
    setEmail(s.email || "");
    setAddress(s.address || "");
    setTaxId(s.taxId || "");
    setIsActive(s.isActive);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Supplier name is required" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        contactName: contactName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        taxId: taxId.trim() || null,
        isActive,
      };

      if (editId) {
        await api(`/api/purchases/suppliers/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Supplier updated successfully" });
      } else {
        await api("/api/purchases/suppliers", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Supplier created successfully" });
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save supplier", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier? If the supplier has existing purchase orders, their profile will be deactivated instead.")) return;
    try {
      const result = await api(`/api/purchases/suppliers/${id}`, { method: "DELETE" });
      if (result && result.message) {
        toast({ title: "Supplier Deactivated", description: result.message });
      } else {
        toast({ title: "Supplier deleted successfully" });
      }
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete supplier", description: err.message });
    }
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contactName && s.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Suppliers Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage external vendors, contact information, and billing details.</p>
        </div>
        <Button onClick={openAdd} className="gap-2 font-bold uppercase tracking-wider">
          <Plus className="h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <Card className="border-primary/10 bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, contact, phone..." 
              className="pl-10 bg-background/50 border-primary/10" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="rounded-lg border border-primary/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow className="hover:bg-transparent border-primary/10">
                  <TableHead className="font-bold text-foreground">Supplier Name</TableHead>
                  <TableHead className="font-bold text-foreground">Contact Representative</TableHead>
                  <TableHead className="font-bold text-foreground">Contact Info</TableHead>
                  <TableHead className="font-bold text-foreground">Tax ID</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-primary/5 hover:bg-transparent">
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-semibold">
                      Loading suppliers directory...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-primary/5 hover:bg-transparent">
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-semibold">
                      No suppliers found. Click "Add Supplier" to create one.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(s => (
                  <TableRow key={s.id} className="border-primary/5 hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold text-foreground">
                      <div className="flex flex-col">
                        <span>{s.name}</span>
                        {s.address && (
                          <span className="text-xs text-muted-foreground font-normal flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" /> {s.address}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {s.contactName || <span className="text-muted-foreground text-xs italic">Not Provided</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        {s.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" /> {s.phone}
                          </span>
                        )}
                        {s.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 shrink-0" /> {s.email}
                          </span>
                        )}
                        {!s.phone && !s.email && <span className="italic">No contact info</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.taxId ? (
                        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" /> {s.taxId}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? "default" : "secondary"} className={s.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}>
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="hover:bg-primary/10">
                          <Edit className="h-4 w-4 text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md border-primary/10 bg-card">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">{editId ? "Edit Supplier" : "Register New Supplier"}</DialogTitle>
            <DialogDescription>
              Provide contact and tax details for this vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold">Supplier / Company Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Al-Marai Dairy, El-Sallab Wholesale" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="bg-background border-primary/10 font-medium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactName" className="font-bold">Contact Person</Label>
              <Input 
                id="contactName" 
                placeholder="e.g. Mahmoud Ali" 
                value={contactName} 
                onChange={e => setContactName(e.target.value)} 
                className="bg-background border-primary/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-bold">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="e.g. +201012345678" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="bg-background border-primary/10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="e.g. sales@vendor.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="bg-background border-primary/10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="font-bold">Address</Label>
              <Input 
                id="address" 
                placeholder="e.g. 15 El-Nasr Rd, Nasr City, Cairo" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                className="bg-background border-primary/10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taxId" className="font-bold">Tax Registration ID (optional)</Label>
              <Input 
                id="taxId" 
                placeholder="e.g. 123-456-789" 
                value={taxId} 
                onChange={e => setTaxId(e.target.value)} 
                className="bg-background border-primary/10 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-primary/5">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active" className="cursor-pointer font-semibold">Active supplier status</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-primary/10">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()} className="font-bold">
              {saving ? "Saving..." : "Save Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
