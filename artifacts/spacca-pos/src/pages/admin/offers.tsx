import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Edit, Trash2, Gift, AlertTriangle, Building2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Offer = {
  id: number;
  name: string;
  buyAmount: number;
  freeAmount: number;
  isActive: boolean;
  branchIds: number[];
  partnerIds: number[];
  applicableDrinkIds?: number[];
  rewardDrinkIds?: number[];
  excludedDrinkIds?: number[];
  applyToStore: boolean;
  applyToAllPartners: boolean;
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
  const [branches, setBranches] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [drinksCatalog, setDrinksCatalog] = useState<any[]>([]);
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
  // Multi-select scopes
  const [allBranches, setAllBranches] = useState(true);          // true = no branch restriction
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [applyToStore, setApplyToStore] = useState(true);
  const [applyToAllPartners, setApplyToAllPartners] = useState(true);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<number[]>([]);

  // Drink scopes state
  const [selectedApplicableDrinkIds, setSelectedApplicableDrinkIds] = useState<number[]>([]);
  const [selectedRewardDrinkIds, setSelectedRewardDrinkIds] = useState<number[]>([]);
  const [selectedExcludedDrinkIds, setSelectedExcludedDrinkIds] = useState<number[]>([]);

  // Drink search filters
  const [applicableSearch, setApplicableSearch] = useState("");
  const [rewardSearch, setRewardSearch] = useState("");
  const [excludedSearch, setExcludedSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [offersData, branchesData, partnersData, drinksData] = await Promise.all([
        api("/api/offers"),
        api("/api/admin/branches"),
        api("/api/admin/partners"),
        api("/api/drinks?active=true")
      ]);
      setOffers(offersData || []);
      setBranches(branchesData || []);
      setPartners(partnersData || []);
      setDrinksCatalog(drinksData || []);
    } catch {
      toast({ variant: "destructive", title: "Failed to load offers configuration" });
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
    setAllBranches(true);
    setSelectedBranchIds([]);
    setApplyToStore(true);
    setApplyToAllPartners(true);
    setSelectedPartnerIds([]);
    setSelectedApplicableDrinkIds([]);
    setSelectedRewardDrinkIds([]);
    setSelectedExcludedDrinkIds([]);
    setApplicableSearch("");
    setRewardSearch("");
    setExcludedSearch("");
    setShowForm(true);
  };

  const openEdit = (o: Offer) => {
    setEditId(o.id);
    setName(o.name);
    setBuyAmount(String(o.buyAmount));
    setFreeAmount(String(o.freeAmount));
    setIsActive(o.isActive);
    const bIds = o.branchIds ?? [];
    setAllBranches(bIds.length === 0);
    setSelectedBranchIds(bIds);
    setApplyToStore(o.applyToStore ?? true);
    setApplyToAllPartners(o.applyToAllPartners ?? true);
    setSelectedPartnerIds(o.partnerIds ?? []);
    setSelectedApplicableDrinkIds(o.applicableDrinkIds ?? []);
    setSelectedRewardDrinkIds(o.rewardDrinkIds ?? []);
    setSelectedExcludedDrinkIds(o.excludedDrinkIds ?? []);
    setApplicableSearch("");
    setRewardSearch("");
    setExcludedSearch("");
    setShowForm(true);
  };

  const toggleBranch = (id: number) => {
    setSelectedBranchIds(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const togglePartner = (id: number) => {
    setSelectedPartnerIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleApplicableDrink = (id: number) => {
    setSelectedApplicableDrinkIds(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleRewardDrink = (id: number) => {
    setSelectedRewardDrinkIds(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleExcludedDrink = (id: number) => {
    setSelectedExcludedDrinkIds(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
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

    if (!applyToStore && !applyToAllPartners && selectedPartnerIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select at least one channel (Store, All Partners, or specific partners).",
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
        branchIds: allBranches ? [] : selectedBranchIds,
        partnerIds: selectedPartnerIds,
        applyToStore,
        applyToAllPartners: selectedPartnerIds.length > 0 ? false : applyToAllPartners,
        applicableDrinkIds: selectedApplicableDrinkIds,
        rewardDrinkIds: selectedRewardDrinkIds,
        excludedDrinkIds: selectedExcludedDrinkIds,
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

  const getBranchLabel = (o: Offer) => {
    const ids = o.branchIds ?? [];
    if (ids.length === 0) return "All Branches";
    if (ids.length === 1) return branches.find(b => b.id === ids[0])?.name || `Branch #${ids[0]}`;
    return `${ids.length} Branches`;
  };

  const getChannelLabel = (o: Offer) => {
    const pIds = o.partnerIds ?? [];
    if (o.applyToStore && (o.applyToAllPartners || pIds.length === 0)) return "All Channels";
    if (o.applyToStore && !o.applyToAllPartners && pIds.length === 0) return "Store Only";
    if (!o.applyToStore && o.applyToAllPartners) return "All Partners";
    if (!o.applyToStore && pIds.length > 0) {
      if (pIds.length === 1) return partners.find(p => p.id === pIds[0])?.name || `Partner #${pIds[0]}`;
      return `${pIds.length} Partners`;
    }
    if (o.applyToStore && pIds.length > 0) {
      return `Store + ${pIds.length} Partner${pIds.length > 1 ? 's' : ''}`;
    }
    return "All Channels";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Promotional Offers</h1>
          <p className="text-muted-foreground text-sm">Create and manage Buy 'N' Get 'X' Free rules that apply to specific branches and channels.</p>
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
                  <TableHead>Branch Target</TableHead>
                  <TableHead>Channel Scope</TableHead>
                  <TableHead className="text-center">Buy (N)</TableHead>
                  <TableHead className="text-center">Free (X)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center w-[120px]">Toggle</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      Loading promotional offers...
                    </TableCell>
                  </TableRow>
                ) : filteredOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No promotional offers found. Click "Add Offer" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffers.map((o) => (
                    <TableRow key={o.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono font-bold text-xs">{o.id}</TableCell>
                      <TableCell className="font-bold">{o.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(o.branchIds ?? []).length === 0 ? (
                            <Badge variant="outline" className="text-xs font-semibold gap-1">
                              <Building2 className="h-3 w-3" /> All Branches
                            </Badge>
                          ) : (o.branchIds ?? []).length <= 2 ? (
                            (o.branchIds ?? []).map(bid => (
                              <Badge key={bid} variant="outline" className="text-xs font-semibold gap-1">
                                <Building2 className="h-3 w-3" />
                                {branches.find(b => b.id === bid)?.name || `#${bid}`}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs font-semibold gap-1">
                              <Building2 className="h-3 w-3" /> {getBranchLabel(o)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {o.applyToStore && (
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-200 font-semibold">
                              Store
                            </Badge>
                          )}
                          {o.applyToAllPartners && (
                            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 border-purple-200 font-semibold">
                              All Partners
                            </Badge>
                          )}
                          {!o.applyToAllPartners && (o.partnerIds ?? []).map(pid => (
                            <Badge key={pid} variant="outline" className="text-xs bg-purple-500/10 text-purple-700 border-purple-200 font-semibold gap-1">
                              <Link2 className="h-3 w-3" />
                              {partners.find(p => p.id === pid)?.name || `#${pid}`}
                            </Badge>
                          ))}
                          {!o.applyToStore && !o.applyToAllPartners && (o.partnerIds ?? []).length === 0 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">None</Badge>
                          )}
                        </div>
                      </TableCell>
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
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Promotional Offer" : "Add Promotional Offer"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="offer-name">Offer Name</Label>
              <Input
                id="offer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Buy 2 Get 1 Free"
              />
            </div>

            {/* Buy/Free amounts */}
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

            {/* Branch scope checklist */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> Branch Scope
                </Label>
                <span className="text-xs text-muted-foreground">
                  {allBranches ? "All branches" : selectedBranchIds.length === 0 ? "None selected" : `${selectedBranchIds.length} selected`}
                </span>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                {/* All Branches toggle — fully independent checkbox */}
                <div className="flex items-center gap-2 pb-2 mb-2 border-b">
                  <Checkbox
                    id="branch-all"
                    checked={allBranches}
                    onCheckedChange={(c) => {
                      setAllBranches(!!c);
                      if (c) setSelectedBranchIds([]);
                    }}
                  />
                  <label htmlFor="branch-all" className="text-sm font-semibold cursor-pointer select-none">
                    All Branches
                  </label>
                </div>
                {/* Individual branches — only relevant when All Branches is unchecked */}
                <div className={allBranches ? "opacity-40 pointer-events-none" : ""}>
                  <ScrollArea className="max-h-36">
                    <div className="grid grid-cols-2 gap-1.5">
                      {branches.map((b) => (
                        <div key={b.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`branch-${b.id}`}
                            checked={selectedBranchIds.includes(b.id)}
                            onCheckedChange={() => {
                              setAllBranches(false);
                              toggleBranch(b.id);
                            }}
                          />
                          <label htmlFor={`branch-${b.id}`} className="text-sm cursor-pointer select-none truncate">
                            {b.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {!allBranches && selectedBranchIds.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">⚠ No specific branch selected — offer will not apply to any branch.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Channel scope */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Link2 className="h-4 w-4" /> Channel Scope
                </Label>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                {/* Store toggle */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="channel-store"
                    checked={applyToStore}
                    onCheckedChange={(c) => setApplyToStore(!!c)}
                  />
                  <label htmlFor="channel-store" className="text-sm font-semibold cursor-pointer select-none">
                    Store (Walk-in)
                  </label>
                </div>

                {/* Partners divider */}
                <div className="border-t pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      id="channel-all-partners"
                      checked={applyToAllPartners}
                      onCheckedChange={(c) => {
                        setApplyToAllPartners(!!c);
                        if (c) setSelectedPartnerIds([]);
                      }}
                    />
                    <label htmlFor="channel-all-partners" className="text-sm font-semibold cursor-pointer select-none">
                      All Partners
                    </label>
                  </div>

                  {!applyToAllPartners && (
                    <>
                      <p className="text-xs text-muted-foreground mb-2 ml-6">Or select specific partners:</p>
                      <ScrollArea className="max-h-32 ml-6">
                        <div className="grid grid-cols-2 gap-1.5">
                          {partners.map((p) => (
                            <div key={p.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`partner-${p.id}`}
                                checked={selectedPartnerIds.includes(p.id)}
                                onCheckedChange={() => togglePartner(p.id)}
                              />
                              <label htmlFor={`partner-${p.id}`} className="text-sm cursor-pointer select-none truncate">
                                {p.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Drink Scoping Section */}
            <div className="grid gap-4 border-t pt-4">
              <h3 className="text-sm font-bold text-foreground">Drink Rules & Exclusions</h3>
              
              {/* Applicable Trigger Drinks */}
              <div className="grid gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <Label className="text-xs font-semibold">1. Trigger Drinks (Buy List A)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {selectedApplicableDrinkIds.length === 0 ? "All drinks qualify" : `${selectedApplicableDrinkIds.length} selected`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[10px]"
                      onClick={() => {
                        if (selectedApplicableDrinkIds.length === drinksCatalog.length) {
                          setSelectedApplicableDrinkIds([]);
                        } else {
                          setSelectedApplicableDrinkIds(drinksCatalog.map(d => d.id));
                        }
                      }}
                    >
                      {selectedApplicableDrinkIds.length === drinksCatalog.length ? "Clear All" : "Select All"}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search trigger drinks..."
                    className="pl-8 h-8 text-xs mb-2"
                    value={applicableSearch}
                    onChange={(e) => setApplicableSearch(e.target.value)}
                  />
                </div>
                <div className="rounded-lg border bg-muted/10 p-2.5 h-44 overflow-y-auto">
                  {drinksCatalog.filter(d => d.name.toLowerCase().includes(applicableSearch.toLowerCase())).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No matching drinks found</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      {drinksCatalog
                        .filter(d => d.name.toLowerCase().includes(applicableSearch.toLowerCase()))
                        .map((d) => (
                          <div key={d.id} className="flex items-center gap-2 p-1 hover:bg-muted/40 rounded transition-colors">
                            <Checkbox
                              id={`app-drink-${d.id}`}
                              checked={selectedApplicableDrinkIds.includes(d.id)}
                              onCheckedChange={() => toggleApplicableDrink(d.id)}
                            />
                            <label htmlFor={`app-drink-${d.id}`} className="text-xs cursor-pointer select-none truncate font-medium">
                              {d.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reward Free Drinks */}
              <div className="grid gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <Label className="text-xs font-semibold">2. Reward Drinks (Free List B)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {selectedRewardDrinkIds.length === 0 ? "All drinks eligible" : `${selectedRewardDrinkIds.length} selected`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[10px]"
                      onClick={() => {
                        if (selectedRewardDrinkIds.length === drinksCatalog.length) {
                          setSelectedRewardDrinkIds([]);
                        } else {
                          setSelectedRewardDrinkIds(drinksCatalog.map(d => d.id));
                        }
                      }}
                    >
                      {selectedRewardDrinkIds.length === drinksCatalog.length ? "Clear All" : "Select All"}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search reward drinks..."
                    className="pl-8 h-8 text-xs mb-2"
                    value={rewardSearch}
                    onChange={(e) => setRewardSearch(e.target.value)}
                  />
                </div>
                <div className="rounded-lg border bg-muted/10 p-2.5 h-44 overflow-y-auto">
                  {drinksCatalog.filter(d => d.name.toLowerCase().includes(rewardSearch.toLowerCase())).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No matching drinks found</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      {drinksCatalog
                        .filter(d => d.name.toLowerCase().includes(rewardSearch.toLowerCase()))
                        .map((d) => (
                          <div key={d.id} className="flex items-center gap-2 p-1 hover:bg-muted/40 rounded transition-colors">
                            <Checkbox
                              id={`reward-drink-${d.id}`}
                              checked={selectedRewardDrinkIds.includes(d.id)}
                              onCheckedChange={() => toggleRewardDrink(d.id)}
                            />
                            <label htmlFor={`reward-drink-${d.id}`} className="text-xs cursor-pointer select-none truncate font-medium">
                              {d.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Excluded Drinks */}
              <div className="grid gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <Label className="text-xs font-semibold text-destructive">3. Excluded Drinks</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {selectedExcludedDrinkIds.length === 0 ? "None excluded" : `${selectedExcludedDrinkIds.length} excluded`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[10px]"
                      onClick={() => {
                        if (selectedExcludedDrinkIds.length === drinksCatalog.length) {
                          setSelectedExcludedDrinkIds([]);
                        } else {
                          setSelectedExcludedDrinkIds(drinksCatalog.map(d => d.id));
                        }
                      }}
                    >
                      {selectedExcludedDrinkIds.length === drinksCatalog.length ? "Clear All" : "Select All"}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search excluded drinks..."
                    className="pl-8 h-8 text-xs mb-2"
                    value={excludedSearch}
                    onChange={(e) => setExcludedSearch(e.target.value)}
                  />
                </div>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 h-44 overflow-y-auto">
                  {drinksCatalog.filter(d => d.name.toLowerCase().includes(excludedSearch.toLowerCase())).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No matching drinks found</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      {drinksCatalog
                        .filter(d => d.name.toLowerCase().includes(excludedSearch.toLowerCase()))
                        .map((d) => (
                          <div key={d.id} className="flex items-center gap-2 p-1 hover:bg-muted/40 rounded transition-colors">
                            <Checkbox
                              id={`ex-drink-${d.id}`}
                              checked={selectedExcludedDrinkIds.includes(d.id)}
                              onCheckedChange={() => toggleExcludedDrink(d.id)}
                            />
                            <label htmlFor={`ex-drink-${d.id}`} className="text-xs cursor-pointer select-none truncate font-medium">
                              {d.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between pt-1 border-t">
              <div className="space-y-0.5">
                <Label>Mark Active</Label>
                <p className="text-[10px] text-muted-foreground">Activating this will automatically deactivate overlapping offers.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            {isActive && (
              <div className="space-y-2">
                <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[10px] text-amber-700 font-semibold items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Activating will make this offer live immediately on the cashier screen and kiosk for the selected branches and channels.</span>
                </div>
                <div className="flex gap-2 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg text-[10px] text-blue-700 font-semibold items-start">
                  <Gift className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Multiple active offers can coexist as long as they target different branches or channels. Only truly overlapping offers will be deactivated automatically.</span>
                </div>
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
