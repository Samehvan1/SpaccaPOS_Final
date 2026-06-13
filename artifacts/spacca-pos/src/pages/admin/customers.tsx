import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, History, ArrowLeft, Loader2, User, Phone, Mail, Award, Landmark, Calendar, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { fmt } from "@/lib/currency";
import { format } from "date-fns";

type Customer = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  points: number;
  total_spent: number;
  visit_count: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  discountId?: number | null;
  discount_code?: string | null;
  tagIds: number[];
};

type Tag = {
  id: number;
  name: string;
};

type Discount = {
  id: number;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
};

type OrderHistoryItem = {
  id: number;
  order_number: string;
  status: string;
  total: string;
  discount: string;
  discount_code?: string | null;
  payment_method: string;
  created_at: string;
  item_count: number;
};

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

export default function CustomersAdmin() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Customer Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState("0");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [discountId, setDiscountId] = useState<string>("none");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // History state
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [historyOrders, setHistoryOrders] = useState<OrderHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [custData, tagsData, discData] = await Promise.all([
        api("/api/admin/customers"),
        api("/api/admin/tags"),
        api("/api/discounts"),
      ]);
      setCustomers(custData.customers || []);
      setTags(tagsData.tags || []);
      setDiscounts((discData || []).filter((d: Discount) => d.isActive));
    } catch {
      toast({ variant: "destructive", title: "Failed to load customer list" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => {
    setEditId(null); setName(""); setPhone(""); setEmail(""); setPoints("0"); setNotes("");
    setIsActive(true); setDiscountId("none"); setSelectedTagIds([]);
    setShowForm(true);
  };

  const openEdit = (c: Customer) => {
    setEditId(c.id); setName(c.name); setPhone(c.phone); setEmail(c.email || "");
    setPoints(String(c.points)); setNotes(c.notes || ""); setIsActive(c.isActive);
    setDiscountId(c.discountId ? String(c.discountId) : "none");
    setSelectedTagIds(c.tagIds || []);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) return;
    
    const targetPhone = phone.trim();
    const isEgLocal = /^01[0125][0-9]{8}$/.test(targetPhone);
    const isEgIntl = /^(?:\+20|20)1[0125][0-9]{8}$/.test(targetPhone);
    if (!isEgLocal && !isEgIntl) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid Egyptian mobile number (e.g. 010xxxxxxxx or +201xxxxxxxxx)."
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        points: parseInt(points) || 0,
        notes: notes.trim() || undefined,
        isActive,
        discountId: discountId === "none" ? null : parseInt(discountId),
        tagIds: selectedTagIds,
      };

      if (editId) {
        await api(`/api/admin/customers/${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Customer profile updated successfully" });
      } else {
        await api("/api/admin/customers", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Customer created successfully" });
      }
      setShowForm(false); loadData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save profile", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (c: Customer) => {
    setHistoryCustomer(c);
    setLoadingHistory(true);
    setHistoryOrders([]);
    try {
      const data = await api(`/api/admin/customers/${c.id}/history`);
      setHistoryOrders(data.orders || []);
    } catch {
      toast({ variant: "destructive", title: "Failed to load order history" });
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleTagSelection = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
              <User className="h-7 w-7 text-amber-500" />
              <span>Customers Rewards & Accounts</span>
              {!loading && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 font-bold text-xs rounded-full">
                  {customers.length} Total
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">Manage customer profiles, group tags, loyalty points, and custom discounts.</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, phone, or email..." 
              className="pl-9" 
              value={searchTerm} 
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Group Tags</TableHead>
                  <TableHead>Discount Coupon</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No customers found.</TableCell></TableRow>
                ) : (
                  (() => {
                    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                    return paginated.map(c => (
                      <TableRow key={c.id} className={c.isActive ? "" : "opacity-60"}>
                        <TableCell>
                          <div className="font-bold text-foreground capitalize flex items-center gap-2">
                            {c.name}
                            {!c.isActive && <Badge variant="secondary" className="text-[9px] scale-90">Inactive</Badge>}
                          </div>
                          <div className="text-muted-foreground text-xs font-semibold">{c.email || "No email"}</div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" />{c.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {c.tagIds && c.tagIds.length > 0 ? (
                              c.tagIds.map(tagId => {
                                const found = tags.find(t => t.id === tagId);
                                return found ? (
                                  <Badge key={tagId} variant="outline" className="bg-amber-100/50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-200/50">
                                    {found.name}
                                  </Badge>
                                ) : null;
                              })
                            ) : (
                              <span className="text-xs text-muted-foreground italic">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.discount_code ? (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-mono font-bold text-xs bg-green-50 dark:bg-green-950/50 px-2 py-1 rounded border border-green-200/50">
                              <Ticket className="h-3.5 w-3.5" />
                              {c.discount_code}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          <div className="flex items-center gap-1"><Award className="h-4 w-4" />{c.points}</div>
                        </TableCell>
                        <TableCell className="font-black text-sm">
                          {fmt(c.total_spent)}
                        </TableCell>
                        <TableCell className="font-bold text-sm">
                          {c.visit_count}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="ghost" size="icon" title="Order History" onClick={() => openHistory(c)}>
                            <History className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit Customer" onClick={() => openEdit(c)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ));
                  })()
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            (() => {
              const totalPages = Math.ceil(filtered.length / pageSize) || 1;
              return (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t px-2">
                  <div className="text-xs text-muted-foreground font-semibold">
                    Showing {Math.min(filtered.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filtered.length, currentPage * pageSize)} of {filtered.length} customers
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold">Rows per page:</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(val) => {
                          setPageSize(Number(val));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-8 text-xs font-bold bg-background">
                          <SelectValue placeholder={String(pageSize)} />
                        </SelectTrigger>
                        <SelectContent>
                          {[10, 25, 50, 100].map((size) => (
                            <SelectItem key={size} value={String(size)} className="text-xs font-semibold">
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-20 font-bold bg-background"
                      >
                        Previous
                      </Button>
                      <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-20 font-bold bg-background"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>

      {/* View/Edit dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Customer Details" : "Register Customer"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="cust-name">Customer Name</Label>
                <Input id="cust-name" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cust-phone" className={phone.trim() && !(/^01[0125][0-9]{8}$/.test(phone.trim()) || /^(?:\+20|20)1[0125][0-9]{8}$/.test(phone.trim())) ? "text-destructive" : ""}>Phone Number</Label>
                <Input
                  id="cust-phone"
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+]*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                  onKeyDown={(e) => {
                    if (
                      ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key) ||
                      (e.ctrlKey || e.metaKey)
                    ) {
                      return;
                    }
                    if (!/^[0-9+]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="e.g. 01012345678"
                  className={phone.trim() && !(/^01[0125][0-9]{8}$/.test(phone.trim()) || /^(?:\+20|20)1[0125][0-9]{8}$/.test(phone.trim())) ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {phone.trim() && !(/^01[0125][0-9]{8}$/.test(phone.trim()) || /^(?:\+20|20)1[0125][0-9]{8}$/.test(phone.trim())) && (
                  <p className="text-[10px] text-destructive font-semibold">
                    Invalid Egyptian format. Use 01XXXXXXXXX or +201XXXXXXXXX.
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="cust-email">Email Address</Label>
                <Input id="cust-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@email.com" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cust-points">Reward Points</Label>
                <Input id="cust-points" type="number" value={points} onChange={e => setPoints(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Customer Group Tags</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/20">
                {tags.length === 0 ? (
                  <span className="text-muted-foreground text-xs italic">No tags defined yet. Configure them in Group Tags admin panel.</span>
                ) : tags.map(tag => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTagSelection(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected 
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-background text-muted-foreground hover:bg-muted border-input"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="assigned-discount">Specific Assigned Discount</Label>
              <Select value={discountId} onValueChange={setDiscountId}>
                <SelectTrigger id="assigned-discount">
                  <SelectValue placeholder="Select discount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {discounts.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.code} ({d.type === 'percentage' ? `${d.value}%` : fmt(d.value)} Off)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cust-notes">Internal Administration Notes</Label>
              <Textarea id="cust-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. VIP client, prefers cold brew..." rows={3} />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch id="cust-active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="cust-active" className="cursor-pointer">Customer profile is active and logged in orders</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim() || !phone.trim()}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!historyCustomer} onOpenChange={(open) => { if (!open) setHistoryCustomer(null); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <History className="h-5 w-5 text-amber-500" />
              <span>Order History: {historyCustomer?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingHistory ? (
              <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
            ) : historyOrders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground italic text-sm">No orders found for this customer.</div>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-bold text-xs text-primary">#{order.order_number}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.created_at ? format(new Date(order.created_at), "yyyy-MM-dd HH:mm") : "—"}
                        </TableCell>
                        <TableCell className="capitalize text-xs font-semibold">{order.payment_method}</TableCell>
                        <TableCell className="text-xs font-bold text-green-600 dark:text-green-400">
                          {parseFloat(order.discount) > 0 ? (
                            <span className="flex items-center gap-0.5">
                              {order.discount_code ? `${order.discount_code}: ` : ""}
                              -{fmt(parseFloat(order.discount))}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-black text-sm">{fmt(parseFloat(order.total))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setHistoryCustomer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
