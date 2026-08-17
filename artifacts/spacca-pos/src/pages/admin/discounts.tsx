import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, Plus, Edit, Trash2, Percent, Banknote, Tag, CupSoda, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Discount = {
  id: number;
  code: string;
  type: "percentage" | "fixed" | "fixed_per_item";
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProductDiscount = {
  id: number;
  drinkId: number;
  drinkName?: string;
  branchId: number | null;
  branchName?: string;
  partnerId: number | null;
  partnerName?: string;
  discountType: "percentage" | "fixed_amount" | "fixed_price";
  discountValue: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type GroupedProductDiscount = {
  groupKey: string;
  ids: number[];
  drinkIds: number[];
  drinkNames: string[];
  branchId: number | null;
  branchName?: string;
  partnerId: number | null;
  partnerName?: string;
  discountType: "percentage" | "fixed_amount" | "fixed_price";
  discountValue: number;
  isActive: boolean;
};

type Drink = { id: number; name: string };
type Branch = { id: number; name: string; code: string };
type Partner = { id: number; name: string; code: string };

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

export default function DiscountsAdmin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"coupons" | "products">("coupons");
  
  // Data lists
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Coupon Form State
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editCouponId, setEditCouponId] = useState<number | null>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed" | "fixed_per_item">("percentage");
  const [value, setValue] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Product Discount Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingGroupIds, setEditingGroupIds] = useState<number[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [pdDrinkIds, setPdDrinkIds] = useState<number[]>([]);
  const [openDrinkPopover, setOpenDrinkPopover] = useState(false);
  const [pdBranchId, setPdBranchId] = useState<string>("all");
  const [pdPartnerId, setPdPartnerId] = useState<string>("all");
  const [pdDiscountType, setPdDiscountType] = useState<"percentage" | "fixed_amount" | "fixed_price">("percentage");
  const [pdDiscountValue, setPdDiscountValue] = useState("0");
  const [pdIsActive, setPdIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [discountsData, pDiscountsData, tagsData, drinksData, branchesData, partnersData] = await Promise.all([
        api("/api/discounts").catch(() => []),
        api("/api/product-discounts").catch(() => []),
        api("/api/admin/tags").catch(() => ({ tags: [] })),
        api("/api/drinks").catch(() => []),
        api("/api/admin/branches").catch(() => []),
        api("/api/admin/partners").catch(() => []),
      ]);

      setDiscounts(discountsData || []);
      setProductDiscounts(pDiscountsData || []);
      setTags(tagsData.tags || []);
      setDrinks(drinksData || []);
      setBranches(branchesData || []);
      setPartners(partnersData || []);
    } catch {
      toast({ variant: "destructive", title: "Failed to load discount data" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Group Product Discounts by discount rule
  const groupedProductDiscounts = useMemo(() => {
    const map = new Map<string, GroupedProductDiscount>();

    for (const pd of productDiscounts) {
      const key = `${pd.branchId ?? "null"}_${pd.partnerId ?? "null"}_${pd.discountType}_${pd.discountValue}_${pd.isActive}`;
      if (!map.has(key)) {
        map.set(key, {
          groupKey: key,
          ids: [pd.id],
          drinkIds: [pd.drinkId],
          drinkNames: pd.drinkName ? [pd.drinkName] : [],
          branchId: pd.branchId,
          branchName: pd.branchName,
          partnerId: pd.partnerId,
          partnerName: pd.partnerName,
          discountType: pd.discountType,
          discountValue: pd.discountValue,
          isActive: pd.isActive,
        });
      } else {
        const g = map.get(key)!;
        g.ids.push(pd.id);
        if (!g.drinkIds.includes(pd.drinkId)) {
          g.drinkIds.push(pd.drinkId);
        }
        if (pd.drinkName && !g.drinkNames.includes(pd.drinkName)) {
          g.drinkNames.push(pd.drinkName);
        }
      }
    }

    return Array.from(map.values());
  }, [productDiscounts]);

  // Coupon Handlers
  const openAddCoupon = () => {
    setEditCouponId(null); setCode(""); setType("percentage"); setValue("0"); setIsActive(true);
    setIsFirstOrder(false); setSelectedTagIds([]);
    setShowCouponForm(true);
  };

  const openEditCoupon = (d: Discount) => {
    setEditCouponId(d.id); setCode(d.code); setType(d.type); setValue(String(d.value)); setIsActive(d.isActive);
    setIsFirstOrder((d as any).isFirstOrder || false);
    setSelectedTagIds((d as any).tagIds || []);
    setShowCouponForm(true);
  };

  const handleSaveCoupon = async () => {
    if (!code.trim() || !value) return;
    setSavingCoupon(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        isActive,
        isFirstOrder,
        tagIds: selectedTagIds,
      };
      if (editCouponId) {
        await api(`/api/discounts/${editCouponId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast({ title: "Order discount updated" });
      } else {
        await api("/api/discounts", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "Order discount created" });
      }
      setShowCouponForm(false); load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save", description: err.message });
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Delete this order discount coupon?")) return;
    try {
      await api(`/api/discounts/${id}`, { method: "DELETE" });
      load();
      toast({ title: "Discount deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  // Product Discount Handlers
  const openAddProductDiscount = () => {
    setEditingGroupIds([]);
    setPdDrinkIds([]);
    setPdBranchId("all");
    setPdPartnerId("all");
    setPdDiscountType("percentage");
    setPdDiscountValue("0");
    setPdIsActive(true);
    setShowProductForm(true);
  };

  const openEditProductDiscountGroup = (group: GroupedProductDiscount) => {
    setEditingGroupIds(group.ids);
    setPdDrinkIds(group.drinkIds);
    setPdBranchId(group.branchId ? String(group.branchId) : "all");
    setPdPartnerId(group.partnerId ? String(group.partnerId) : "all");
    setPdDiscountType(group.discountType);
    setPdDiscountValue(String(group.discountValue));
    setPdIsActive(group.isActive);
    setShowProductForm(true);
  };

  const handleSaveProductDiscount = async () => {
    if (pdDrinkIds.length === 0 || !pdDiscountValue) return;
    setSavingProduct(true);
    try {
      const branchId = pdBranchId === "all" ? null : parseInt(pdBranchId);
      const partnerId = pdPartnerId === "all" ? null : parseInt(pdPartnerId);
      const discountValue = parseFloat(pdDiscountValue);

      // Delete existing group items if editing
      if (editingGroupIds.length > 0) {
        await Promise.all(
          editingGroupIds.map((id) => api(`/api/product-discounts/${id}`, { method: "DELETE" }))
        );
      }

      // Bulk create updated selection for all drinkIds
      await api("/api/product-discounts", {
        method: "POST",
        body: JSON.stringify({
          drinkIds: pdDrinkIds,
          branchId,
          partnerId,
          discountType: pdDiscountType,
          discountValue,
          isActive: pdIsActive,
        }),
      });

      toast({
        title: editingGroupIds.length > 0 ? "Product discount updated" : `Created product discount for ${pdDrinkIds.length} product(s)`,
      });
      setShowProductForm(false); load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save product discount", description: err.message });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProductDiscountGroup = async (group: GroupedProductDiscount) => {
    if (!confirm(`Delete product discount for ${group.drinkNames.join(", ")}?`)) return;
    try {
      await Promise.all(
        group.ids.map((id) => api(`/api/product-discounts/${id}`, { method: "DELETE" }))
      );
      load();
      toast({ title: "Product discount deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete product discount" });
    }
  };

  const filteredCoupons = discounts.filter(d => 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groupedProductDiscounts.filter(g => 
    g.drinkNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (g.branchName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.partnerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discounts & Promotions</h1>
          <p className="text-muted-foreground">Manage order-level coupons and product-specific discounts (Globally, per Branch, or per Partner).</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <div className="flex items-center justify-between pb-2">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="coupons" className="gap-2">
              <Tag className="h-4 w-4" /> Order Coupons ({discounts.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <CupSoda className="h-4 w-4" /> Product Discounts ({groupedProductDiscounts.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === "coupons" ? (
            <Button onClick={openAddCoupon} className="gap-2">
              <Plus className="h-4 w-4" /> Add Order Coupon
            </Button>
          ) : (
            <Button onClick={openAddProductDiscount} className="gap-2">
              <Plus className="h-4 w-4" /> Add Product Discount
            </Button>
          )}
        </div>

        {/* --- ORDER COUPONS TAB --- */}
        <TabsContent value="coupons" className="mt-4">
          <Card>
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search coupons..." 
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
                      <TableRow><TableCell colSpan={5} className="text-center py-8">Loading coupons...</TableCell></TableRow>
                    ) : filteredCoupons.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No coupons found.</TableCell></TableRow>
                    ) : filteredCoupons.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono font-bold text-primary">{d.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {d.type === "percentage" ? <Percent className="h-3.5 w-3.5" /> : <Banknote className="h-3.5 w-3.5" />}
                            <span className="capitalize">{d.type === "fixed_per_item" ? "Fixed Per Item" : d.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {d.type === "percentage" ? `${d.value}%` : `${fmt(d.value)}${d.type === "fixed_per_item" ? " / item" : ""}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.isActive ? "default" : "secondary"}>
                            {d.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditCoupon(d)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCoupon(d.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PRODUCT DISCOUNTS TAB --- */}
        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search product discounts..." 
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
                      <TableHead>Products</TableHead>
                      <TableHead>Branch Scope</TableHead>
                      <TableHead>Partner Scope</TableHead>
                      <TableHead>Discount Type</TableHead>
                      <TableHead>Discount Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">Loading product discounts...</TableCell></TableRow>
                    ) : filteredGroups.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No product discounts found.</TableCell></TableRow>
                    ) : filteredGroups.map(g => (
                      <TableRow key={g.groupKey}>
                        <TableCell className="font-semibold text-primary">
                          {g.drinkNames.length === 1 ? (
                            g.drinkNames[0]
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-sm text-primary">{g.drinkNames.length} Products</span>
                              <span className="text-xs text-muted-foreground max-w-xs truncate">{g.drinkNames.join(", ")}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={g.branchId ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}>
                            {g.branchName || "All Branches"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={g.partnerId ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-700 border-slate-200"}>
                            {g.partnerName || "Direct POS / All Partners"}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {g.discountType === "fixed_amount" ? "Fixed Amount Off" : g.discountType === "fixed_price" ? "Override Special Price" : "Percentage Off (%)"}
                        </TableCell>
                        <TableCell className="font-bold text-emerald-600">
                          {g.discountType === "percentage" ? `${g.discountValue}% Off` : g.discountType === "fixed_amount" ? `-${fmt(g.discountValue)}` : `Special Price: ${fmt(g.discountValue)}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={g.isActive ? "default" : "secondary"}>
                            {g.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditProductDiscountGroup(g)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProductDiscountGroup(g)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- COUPON DIALOG --- */}
      <Dialog open={showCouponForm} onOpenChange={setShowCouponForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCouponId ? "Edit Order Coupon" : "New Order Coupon"}</DialogTitle>
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
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="fixed_per_item">Fixed Amount Per Item</SelectItem>
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
                    {type === "percentage" ? "%" : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch id="firstOrder" checked={isFirstOrder} onCheckedChange={setIsFirstOrder} />
              <Label htmlFor="firstOrder" className="cursor-pointer">Applies to customer's first order only</Label>
            </div>
            <div className="grid gap-1.5 pt-1">
              <Label>Restricted to Group Tags (Optional)</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/20">
                {tags.length === 0 ? (
                  <span className="text-muted-foreground text-xs italic">No tags defined.</span>
                ) : tags.map(tag => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setSelectedTagIds(prev => 
                          prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                        );
                      }}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-muted-foreground hover:bg-muted border-input"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active" className="cursor-pointer">Coupon is active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCouponForm(false)}>Cancel</Button>
            <Button onClick={handleSaveCoupon} disabled={savingCoupon || !code.trim()}>
              {savingCoupon ? "Saving..." : "Save Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- PRODUCT DISCOUNT DIALOG --- */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingGroupIds.length > 0 ? "Edit Product Discount Promotion" : "New Product Discount Promotion"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pdDrink">Target Product(s)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2 text-primary"
                  onClick={() => {
                    if (pdDrinkIds.length === drinks.length) {
                      setPdDrinkIds([]);
                    } else {
                      setPdDrinkIds(drinks.map((d) => d.id));
                    }
                  }}
                >
                  {pdDrinkIds.length === drinks.length ? "Deselect All" : "Select All Products"}
                </Button>
              </div>

              <Popover open={openDrinkPopover} onOpenChange={setOpenDrinkPopover}>
                <PopoverTrigger asChild>
                  <Button
                    id="pdDrink"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDrinkPopover}
                    className="w-full justify-between font-normal min-h-10 h-auto py-2"
                  >
                    {pdDrinkIds.length === 0 ? (
                      <span className="text-muted-foreground">Search & select product(s)...</span>
                    ) : pdDrinkIds.length === 1 ? (
                      <span>{drinks.find((d) => d.id === pdDrinkIds[0])?.name}</span>
                    ) : (
                      <span className="font-semibold text-primary">{pdDrinkIds.length} products selected</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[430px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search product name..." />
                    <CommandList>
                      <CommandEmpty>No product found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {drinks.map((d) => {
                          const isSelected = pdDrinkIds.includes(d.id);
                          return (
                            <CommandItem
                              key={d.id}
                              value={d.name}
                              onSelect={() => {
                                setPdDrinkIds((prev) =>
                                  prev.includes(d.id)
                                    ? prev.filter((id) => id !== d.id)
                                    : [...prev, d.id]
                                );
                              }}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                                    isSelected
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-input"
                                  )}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <span className={isSelected ? "font-semibold text-primary" : ""}>{d.name}</span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {pdDrinkIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                  {pdDrinkIds.map((id) => {
                    const drink = drinks.find((d) => d.id === id);
                    if (!drink) return null;
                    return (
                      <Badge key={id} variant="secondary" className="gap-1 py-0.5 px-2 text-xs">
                        {drink.name}
                        <button
                          type="button"
                          onClick={() => setPdDrinkIds((prev) => prev.filter((i) => i !== id))}
                          className="hover:text-destructive text-muted-foreground ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pdBranch">Branch Scope</Label>
                <Select value={pdBranchId} onValueChange={setPdBranchId}>
                  <SelectTrigger id="pdBranch">
                    <SelectValue placeholder="Select branch scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches (Global)</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pdPartner">Partner Scope</Label>
                <Select value={pdPartnerId} onValueChange={setPdPartnerId}>
                  <SelectTrigger id="pdPartner">
                    <SelectValue placeholder="Select partner scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Direct POS / All Partners</SelectItem>
                    {partners.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pdType">Discount Calculation Type</Label>
                <Select value={pdDiscountType} onValueChange={(v: any) => setPdDiscountType(v)}>
                  <SelectTrigger id="pdType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                    <SelectItem value="fixed_price">Fixed Special Price Target</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pdValue">Discount Value</Label>
                <Input 
                  id="pdValue" 
                  type="number" 
                  step="0.01" 
                  value={pdDiscountValue} 
                  onChange={e => setPdDiscountValue(e.target.value)} 
                  placeholder={pdDiscountType === "percentage" ? "e.g. 20 (for 20%)" : "e.g. 15.00"}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch id="pdActive" checked={pdIsActive} onCheckedChange={setPdIsActive} />
              <Label htmlFor="pdActive" className="cursor-pointer">Product discount is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductForm(false)}>Cancel</Button>
            <Button onClick={handleSaveProductDiscount} disabled={savingProduct || pdDrinkIds.length === 0}>
              {savingProduct ? "Saving..." : "Save Product Discount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
