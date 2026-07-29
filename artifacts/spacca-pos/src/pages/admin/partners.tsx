import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Edit, Trash2, ShoppingBag, ShieldCheck, HelpCircle, Building2, Search, Edit3 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { fmt } from "@/lib/currency";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

interface Partner {
  id: number;
  name: string;
  code: string;
  commissionType: "percentage" | "fixed";
  commissionValue: string;
  isActive: boolean;
}

interface Branch {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

interface PartnerPriceRow {
  drinkId: number;
  name: string;
  globalPrice: number;
  overridePrice: number | null;
}

export default function PartnersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("platforms");

  // Partner Modal Form States
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [commissionType, setCommissionType] = useState<"percentage" | "fixed">("percentage");
  const [commissionValue, setCommissionValue] = useState("");
  const [partnerActive, setPartnerActive] = useState(true);

  // Pricing Overrides States
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("__global__"); // __global__ or branchId
  const [pricingSearch, setPricingSearch] = useState("");
  const [pricingOverrides, setPricingOverrides] = useState<Record<number, string>>({});

  // 1. Fetch platforms
  const { data: partners = [], isLoading: isLoadingPartners } = useQuery<Partner[]>({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/partners`);
      if (!res.ok) throw new Error("Failed to fetch partners");
      const list = await res.json();
      if (list.length > 0 && !selectedPartnerId) {
        setSelectedPartnerId(String(list[0].id));
      }
      return list;
    },
  });

  // 2. Fetch branches
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["admin-branches"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/branches`);
      if (!res.ok) throw new Error("Failed to fetch branches");
      return res.json();
    },
  });

  // 3. Fetch pricing listings for selected platform + branch
  const { data: prices = [], isLoading: isLoadingPrices, refetch: refetchPrices } = useQuery<PartnerPriceRow[]>({
    queryKey: ["partner-prices", selectedPartnerId, selectedBranchId],
    queryFn: async () => {
      if (!selectedPartnerId) return [];
      const branchParam = selectedBranchId === "__global__" ? "" : `&branchId=${selectedBranchId}`;
      const res = await fetch(`${API_BASE}/admin/partner-prices?partnerId=${selectedPartnerId}${branchParam}`);
      if (!res.ok) throw new Error("Failed to fetch partner prices");
      const data = await res.json();

      const state: Record<number, string> = {};
      data.forEach((p: PartnerPriceRow) => {
        state[p.drinkId] = p.overridePrice !== null ? String(p.overridePrice) : "";
      });
      setPricingOverrides(state);

      return data;
    },
    enabled: !!selectedPartnerId,
  });

  // Platform Save/Edit Mutation
  const partnerSaveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editingPartner ? "PATCH" : "POST";
      const url = editingPartner ? `${API_BASE}/admin/partners/${editingPartner.id}` : `${API_BASE}/admin/partners`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save aggregator platform");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      toast({ title: "Aggregator Saved", description: "Ordering partner saved successfully." });
      setIsPartnerModalOpen(false);
      resetPartnerForm();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error Saving Platform", description: err.message });
    },
  });

  // Platform Delete Mutation
  const partnerDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/admin/partners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete platform");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      toast({ title: "Deleted", description: "Aggregator platform has been removed." });
    },
  });

  // Pricing Overrides Save Mutation
  const pricingSaveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        partnerId: parseInt(selectedPartnerId),
        branchId: selectedBranchId === "__global__" ? null : parseInt(selectedBranchId),
        prices: Object.entries(pricingOverrides).map(([drinkId, priceStr]) => ({
          drinkId: parseInt(drinkId),
          price: priceStr.trim() === "" ? null : parseFloat(priceStr),
        })),
      };

      const res = await fetch(`${API_BASE}/admin/partner-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save pricing overrides");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-prices", selectedPartnerId, selectedBranchId] });
      toast({ title: "Prices Saved", description: "Partner-specific prices updated successfully." });
      refetchPrices();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error Saving Overrides", description: err.message });
    },
  });

  const resetPartnerForm = () => {
    setEditingPartner(null);
    setPartnerName("");
    setPartnerCode("");
    setCommissionType("percentage");
    setCommissionValue("");
    setPartnerActive(true);
  };

  const handleEditPartner = (p: Partner) => {
    setEditingPartner(p);
    setPartnerName(p.name);
    setPartnerCode(p.code);
    setCommissionType(p.commissionType);
    setCommissionValue(String(p.commissionValue));
    setPartnerActive(p.isActive);
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = () => {
    if (!partnerName.trim() || !partnerCode.trim() || !commissionValue.trim()) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in name, code and commission." });
      return;
    }
    partnerSaveMutation.mutate({
      name: partnerName,
      code: partnerCode.toLowerCase().replace(/\s+/g, ""),
      commissionType,
      commissionValue: parseFloat(commissionValue),
      isActive: partnerActive,
    });
  };

  const handlePriceChange = (drinkId: number, val: string) => {
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;
    setPricingOverrides(prev => ({
      ...prev,
      [drinkId]: val,
    }));
  };

  const filteredPrices = prices.filter(p =>
    p.name.toLowerCase().includes(pricingSearch.toLowerCase())
  );

  return (
    <div className="p-8 w-full overflow-y-auto h-full space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full h-9 w-9">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-amber-500" />
            Partners & Price Overrides
          </h1>
          <p className="text-muted-foreground mt-1">Manage online aggregators (Talabat, Break-Fast) and platform-specific drink prices.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-96 grid-cols-2 mb-6">
          <TabsTrigger value="platforms">Platform Setup</TabsTrigger>
          <TabsTrigger value="pricing">Platform Pricing</TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Aggregator Platforms</h2>
            <Button id="btn-add-partner" onClick={() => { resetPartnerForm(); setIsPartnerModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Partner
            </Button>
          </div>

          <Card className="border-2">
            <CardContent className="p-0">
              {isLoadingPartners ? (
                <div className="p-12 text-center text-muted-foreground">Loading aggregators...</div>
              ) : partners.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">No partners configured yet. Click 'Add Partner' to get started.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform Name</TableHead>
                      <TableHead>Platform Code</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map(p => (
                      <TableRow key={p.id} className="hover:bg-muted/10">
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell className="font-mono text-sm">{p.code}</TableCell>
                        <TableCell>
                          {p.commissionType === "percentage"
                            ? `${p.commissionValue}% of order total`
                            : `${fmt(Number(p.commissionValue))} flat per order`}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${p.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEditPartner(p)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm("Remove this partner? All overrides will be deleted.")) partnerDeleteMutation.mutate(p.id); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Control panel */}
            <Card className="lg:col-span-1 border-2">
              <CardHeader className="pb-4 border-b bg-muted/20">
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Select aggregator and scope to override base prices.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="pricing-partner-select">Ordering Partner</Label>
                  <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                    <SelectTrigger id="pricing-partner-select">
                      <SelectValue placeholder="Select platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pricing-branch-select">Branch Location Scope</Label>
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                    <SelectTrigger id="pricing-branch-select">
                      <SelectValue placeholder="Select branch scope..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__global__">General Partner Price (All Branches)</SelectItem>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={String(b.id)}>Specific Branch: {b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button
                    id="btn-save-partner-prices"
                    className="w-full font-bold flex items-center justify-center gap-2"
                    onClick={() => pricingSaveMutation.mutate()}
                    disabled={pricingSaveMutation.isPending || !selectedPartnerId}
                  >
                    <Save className="h-4 w-4" />
                    {pricingSaveMutation.isPending ? "Saving changes..." : "Save Platform Prices"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* List */}
            <Card className="lg:col-span-3 border-2">
              <CardHeader className="pb-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-muted/20">
                <div>
                  <CardTitle className="text-xl">Platform Price Overrides</CardTitle>
                  <CardDescription>Leave input blank to fallback to general POS prices.</CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={pricingSearch}
                    onChange={e => setPricingSearch(e.target.value)}
                    placeholder="Search drinks..."
                    className="pl-9 bg-background"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingPrices ? (
                  <div className="p-12 text-center text-muted-foreground">Loading prices...</div>
                ) : filteredPrices.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">No drinks found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Drink Name</TableHead>
                        <TableHead className="w-48 text-right">POS Store Price</TableHead>
                        <TableHead className="w-56 text-right">Aggregator Override Price (EGP)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrices.map(drink => (
                        <TableRow key={drink.drinkId} className="hover:bg-muted/10">
                          <TableCell className="font-bold">{drink.name}</TableCell>
                          <TableCell className="text-right font-medium text-muted-foreground">
                            {fmt(drink.globalPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                id={`partner-price-${drink.drinkId}`}
                                type="text"
                                value={pricingOverrides[drink.drinkId] ?? ""}
                                onChange={e => handlePriceChange(drink.drinkId, e.target.value)}
                                placeholder={String(drink.globalPrice)}
                                className="w-32 text-right font-bold focus-visible:ring-amber-500 border-muted-foreground/30 focus-visible:border-amber-500"
                              />
                              <Edit3 className="h-4 w-4 text-muted-foreground opacity-40 shrink-0" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Partner Modals */}
      <Dialog open={isPartnerModalOpen} onOpenChange={open => { if (!open) { setIsPartnerModalOpen(false); resetPartnerForm(); } }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPartner ? "Edit Partner Platform" : "Add Ordering Partner"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="p-name">Partner Name</Label>
              <Input id="p-name" value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="e.g. Talabat" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-code">Code Identifier</Label>
              <Input id="p-code" value={partnerCode} onChange={e => setPartnerCode(e.target.value)} placeholder="e.g. talabat" disabled={!!editingPartner} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="p-type">Commission Type</Label>
                <Select value={commissionType} onValueChange={setCommissionType as any}>
                  <SelectTrigger id="p-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Rate (EGP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-value">Commission Value</Label>
                <Input id="p-value" type="number" step="0.01" value={commissionValue} onChange={e => setCommissionValue(e.target.value)} placeholder="e.g. 15.00" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch id="p-active" checked={partnerActive} onCheckedChange={setPartnerActive} />
              <Label htmlFor="p-active">Active Platform (Visible in POS)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsPartnerModalOpen(false); resetPartnerForm(); }}>Cancel</Button>
            <Button onClick={handleSavePartner} disabled={partnerSaveMutation.isPending || !partnerName || !partnerCode || !commissionValue}>
              {partnerSaveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
