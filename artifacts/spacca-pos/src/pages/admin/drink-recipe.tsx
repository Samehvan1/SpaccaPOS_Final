import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useGetDrink, useListIngredients } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Droplets, Save, FlaskConical, Layers, Tag, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SlotStyle = "legacy" | "typed";

type SlotVolumeDraft = {
  typeVolumeId: number;
  volumeName: string;
  processedQty: string;
  producedQty: string;
  unit: string;
  extraCost: string;
  isDefault: boolean;
  isEnabled: boolean;
};

type SlotTypeOptionDraft = {
  key: string;
  ingredientTypeId: number;
  typeName: string;
  categoryName: string;
  isDefault: boolean;
  sortOrder: number;
  slotVolumes: SlotVolumeDraft[];
  expanded: boolean;
};

type SlotDraft = {
  key: string;
  style: SlotStyle;
  slotLabel: string;
  isRequired: boolean;
  expanded: boolean;
  // Typed (multi-option)
  typeOptions: SlotTypeOptionDraft[];
  // Legacy
  ingredientId: number | null;
  isDynamic: boolean;
  defaultOptionId: number | null;
  baristaSortOrder: number;
  customerSortOrder: number;
  affectsCupSize: boolean | null;
};

type Category = { id: number; name: string; sortOrder: number };
type IngType = {
  id: number; categoryId: number; name: string; isActive: boolean;
  category?: { id: number; name: string } | null;
};
type TypeVolume = {
  id: number; volumeId: number; processedQty: string | null; producedQty: string | null;
  unit: string | null; extraCost: string; isDefault: boolean;
  volume?: { id: number; name: string; processedQty: string; producedQty: string; unit: string } | null;
};

let keyCounter = 0;
const newKey = () => `k-${++keyCounter}`;

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

function makeVolumeDrafts(vols: TypeVolume[]): SlotVolumeDraft[] {
  return vols.map((tv) => ({
    typeVolumeId: tv.id,
    volumeName: tv.volume?.name ?? `vol#${tv.volumeId}`,
    processedQty: String(tv.processedQty ?? tv.volume?.processedQty ?? 0),
    producedQty: String(tv.producedQty ?? tv.volume?.producedQty ?? 0),
    unit: tv.unit ?? tv.volume?.unit ?? "ml",
    extraCost: tv.extraCost ?? "0",
    isDefault: tv.isDefault,
    isEnabled: true,
  }));
}

export default function DrinkRecipe() {
  const params = useParams<{ id: string }>();
  const drinkId = parseInt(params.id ?? "0");
  const { toast } = useToast();

  const { data: drink, isLoading: isLoadingDrink } = useGetDrink(drinkId);
  const { data: ingredients } = useListIngredients({ active: true });

  const [slots, setSlots] = useState<SlotDraft[]>([]);
  const [cupSizeMl, setCupSizeMl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [allTypes, setAllTypes] = useState<IngType[]>([]);
  const [typeVolumeCache, setTypeVolumeCache] = useState<Record<number, TypeVolume[]>>({});
  const [optionsCache, setOptionsCache] = useState<Record<number, any[]>>({});

  useEffect(() => {
    Promise.all([api("/api/catalog/categories"), api("/api/catalog/types")])
      .then(([cats, types]) => { setCategories(cats); setAllTypes(types); })
      .catch(() => {});
  }, []);

  const loadTypeVolumes = useCallback(async (typeId: number): Promise<TypeVolume[]> => {
    if (typeVolumeCache[typeId]) return typeVolumeCache[typeId];
    try {
      const vols: TypeVolume[] = await api(`/api/catalog/types/${typeId}/volumes`);
      setTypeVolumeCache(prev => ({ ...prev, [typeId]: vols }));
      return vols;
    } catch { return []; }
  }, [typeVolumeCache]);

  const fetchOptions = useCallback(async (ingredientId: number) => {
    if (optionsCache[ingredientId]) return;
    try {
      const res = await fetch(`/api/ingredients/${ingredientId}`);
      if (res.ok) { const data = await res.json(); setOptionsCache(prev => ({ ...prev, [ingredientId]: data.options ?? [] })); }
    } catch {}
  }, [optionsCache]);

  useEffect(() => {
    if (!drink) return;
    setCupSizeMl(drink.cupSizeMl != null ? String(drink.cupSizeMl) : "");

    const slotDrafts: SlotDraft[] = (drink.slots ?? []).map((s: any) => {
      if (s.slotStyle === "typed") {
        const rawTypeOptions: any[] = s.typeOptions ?? [];
        const typeOpts: SlotTypeOptionDraft[] = rawTypeOptions.map((to: any) => ({
          key: newKey(),
          ingredientTypeId: to.ingredientTypeId,
          typeName: to.typeName ?? "",
          categoryName: to.categoryName ?? "",
          isDefault: to.isDefault ?? false,
          sortOrder: to.sortOrder ?? 0,
          expanded: true,
          slotVolumes: (to.volumes ?? []).map((v: any) => ({
            typeVolumeId: v.id,
            volumeName: v.volumeName ?? "",
            processedQty: String(v.processedQty ?? 0),
            producedQty: String(v.producedQty ?? 0),
            unit: v.unit ?? "ml",
            extraCost: String(v.extraCost ?? 0),
            isDefault: v.isDefault ?? false,
            isEnabled: v.isEnabled ?? true,
          })),
        }));
        return {
          key: newKey(), style: "typed" as SlotStyle,
          slotLabel: s.slotLabel, isRequired: s.isRequired, expanded: true,
          typeOptions: typeOpts,
          ingredientId: null, isDynamic: false, defaultOptionId: null,
          baristaSortOrder: s.baristaSortOrder ?? s.sortOrder ?? 1,
          customerSortOrder: s.customerSortOrder ?? s.sortOrder ?? 1,
          affectsCupSize: s.affectsCupSize ?? null,
        };
      }
      return {
        key: newKey(), style: "legacy" as SlotStyle,
        slotLabel: s.slotLabel, isRequired: s.isRequired, expanded: true,
        typeOptions: [],
        ingredientId: s.ingredientId ?? null, isDynamic: s.isDynamic ?? false,
        defaultOptionId: s.defaultOptionId ?? null,
        baristaSortOrder: s.baristaSortOrder ?? s.sortOrder ?? 1,
        customerSortOrder: s.customerSortOrder ?? s.sortOrder ?? 1,
        affectsCupSize: s.affectsCupSize ?? null,
      };
    });

    setSlots(slotDrafts);
    setIsDirty(false);

    const initial: Record<number, any[]> = {};
    for (const s of drink.slots ?? []) {
      if ((s as any).ingredient?.options) initial[(s as any).ingredientId] = (s as any).ingredient.options;
    }
    setOptionsCache(prev => ({ ...initial, ...prev }));
  }, [drink]);

  const mark = () => setIsDirty(true);

  const addSlot = (style: SlotStyle = "legacy") => {
    setSlots(prev => [...prev, {
      key: newKey(), style, slotLabel: "", isRequired: true, expanded: true,
      typeOptions: [], ingredientId: null, isDynamic: false, defaultOptionId: null,
      baristaSortOrder: 1, customerSortOrder: 1, affectsCupSize: null,
    }]);
    mark();
  };

  const toggleSlotExpanded = (key: string) => {
    setSlots(prev => prev.map(s => s.key === key ? { ...s, expanded: !s.expanded } : s));
  };

  const removeSlot = (key: string) => { setSlots(prev => prev.filter(s => s.key !== key)); mark(); };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSlots(prev => { const n = [...prev]; [n[index - 1], n[index]] = [n[index], n[index - 1]]; return n; }); mark();
  };
  const moveDown = (index: number) => {
    setSlots(prev => { if (index >= prev.length - 1) return prev; const n = [...prev]; [n[index], n[index + 1]] = [n[index + 1], n[index]]; return n; }); mark();
  };

  const updateSlot = (key: string, patch: Partial<SlotDraft>) => {
    setSlots(prev => prev.map(s => {
      if (s.key !== key) return s;
      const updated = { ...s, ...patch };
      if (patch.ingredientId !== undefined && patch.ingredientId !== s.ingredientId) {
        updated.defaultOptionId = null;
        if (patch.ingredientId) fetchOptions(patch.ingredientId);
      }
      return updated;
    })); mark();
  };

  const addTypeOption = async (slotKey: string, typeId: number) => {
    const type = allTypes.find(t => t.id === typeId);
    const cat = categories.find(c => c.id === type?.categoryId);
    const vols = await loadTypeVolumes(typeId);
    setSlots(prev => prev.map(s => {
      if (s.key !== slotKey) return s;
      const alreadyExists = s.typeOptions.some(to => to.ingredientTypeId === typeId);
      if (alreadyExists) return s;
      const newOpt: SlotTypeOptionDraft = {
        key: newKey(),
        ingredientTypeId: typeId,
        typeName: type?.name ?? "",
        categoryName: cat?.name ?? "",
        isDefault: s.typeOptions.length === 0,
        sortOrder: s.typeOptions.length,
        expanded: true,
        slotVolumes: makeVolumeDrafts(vols),
      };
      return { ...s, typeOptions: [...s.typeOptions, newOpt] };
    }));
    mark();
  };

  const removeTypeOption = (slotKey: string, optKey: string) => {
    setSlots(prev => prev.map(s => {
      if (s.key !== slotKey) return s;
      const filtered = s.typeOptions.filter(to => to.key !== optKey);
      const hasDefault = filtered.some(to => to.isDefault);
      return {
        ...s,
        typeOptions: filtered.map((to, i) => ({ ...to, isDefault: !hasDefault && i === 0 ? true : to.isDefault })),
      };
    })); mark();
  };

  const setTypeOptionDefault = (slotKey: string, optKey: string) => {
    setSlots(prev => prev.map(s => {
      if (s.key !== slotKey) return s;
      return { ...s, typeOptions: s.typeOptions.map(to => ({ ...to, isDefault: to.key === optKey })) };
    })); mark();
  };

  const toggleTypeOptionExpanded = (slotKey: string, optKey: string) => {
    setSlots(prev => prev.map(s => {
      if (s.key !== slotKey) return s;
      return { ...s, typeOptions: s.typeOptions.map(to => to.key === optKey ? { ...to, expanded: !to.expanded } : to) };
    }));
  };

  const updateTypeOptionVolume = (slotKey: string, optKey: string, tvId: number, patch: Partial<SlotVolumeDraft>) => {
    setSlots(prev => prev.map(s => {
      if (s.key !== slotKey) return s;
      return {
        ...s,
        typeOptions: s.typeOptions.map(to => {
          if (to.key !== optKey) return to;
          let vols = to.slotVolumes.map(v => v.typeVolumeId !== tvId ? v : { ...v, ...patch });
          if (patch.isDefault) vols = vols.map(v => v.typeVolumeId === tvId ? v : { ...v, isDefault: false });
          return { ...to, slotVolumes: vols };
        }),
      };
    })); mark();
  };

  const handleSave = async () => {
    for (const s of slots) {
      if (!s.slotLabel.trim()) { toast({ variant: "destructive", title: "All slots need a label" }); return; }
      if (s.style === "legacy" && !s.ingredientId) { toast({ variant: "destructive", title: "Legacy slots need an ingredient selected" }); return; }
      if (s.style === "typed" && s.typeOptions.length === 0) { toast({ variant: "destructive", title: "Catalog slots need at least one type option" }); return; }
    }

    setIsSaving(true);
    try {
      const body = slots.map((s, i) => {
        if (s.style === "typed") {
          return {
            slotLabel: s.slotLabel.trim(),
            isRequired: s.isRequired,
            isDynamic: s.isDynamic,
            sortOrder: i,
            slotTypeOptions: s.typeOptions.map((to, j) => ({
              ingredientTypeId: to.ingredientTypeId,
              isDefault: to.isDefault,
              sortOrder: j,
              slotVolumes: to.slotVolumes.map(v => ({
                typeVolumeId: v.typeVolumeId,
                processedQty: v.processedQty !== "" ? v.processedQty : null,
                producedQty: v.producedQty !== "" ? v.producedQty : null,
                unit: v.unit !== "" ? v.unit : null,
                extraCost: v.extraCost,
                isDefault: v.isDefault,
                isEnabled: v.isEnabled,
              })),
            })),
            baristaSortOrder: s.baristaSortOrder,
            customerSortOrder: s.customerSortOrder,
          };
        }
        return {
          ingredientId: s.ingredientId!,
          slotLabel: s.slotLabel.trim(),
          isRequired: s.isRequired,
          isDynamic: s.isDynamic,
          defaultOptionId: s.defaultOptionId ?? null,
          sortOrder: i,
          baristaSortOrder: s.baristaSortOrder,
          customerSortOrder: s.customerSortOrder,
        };
      });

      const qs = cupSizeMl ? `?cupSizeMl=${parseInt(cupSizeMl)}` : "";
      const resp = await fetch(`/api/drinks/${drinkId}/slots${qs}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error(await resp.text());
      toast({ title: "Recipe saved" });
      setIsDirty(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to save", description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingDrink) {
    return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">Loading recipe…</div></div>;
  }
  if (!drink) {
    return <div className="p-8"><p className="text-destructive">Drink not found.</p></div>;
  }

  const ingredientMap = Object.fromEntries((ingredients ?? []).map(i => [i.id, i]));
  const hasDynamicSlot = slots.some(s => s.isDynamic);

  const activeTypes = allTypes.filter(t => t.isActive);
  const typesByCategory = new Map<number, IngType[]>();
  for (const t of activeTypes) {
    const list = typesByCategory.get(t.categoryId) ?? [];
    list.push(t);
    typesByCategory.set(t.categoryId, list);
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-6 max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/drinks"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold">{drink.name} — Recipe</h1>
                {isDirty && <Badge variant="outline" className="text-amber-600 border-amber-400">Unsaved</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Define ingredient slots. Use <strong>Catalog</strong> slots for the new type+volume system, or <strong>Legacy</strong> for old-style inventory slots.
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 shrink-0">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving…" : "Save Recipe"}
          </Button>
        </div>

        {/* Cup size */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" /> Cup Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 max-w-xs">
              <div className="flex-1 grid gap-1.5">
                <Label htmlFor="cup-size">Cup Size (ml)</Label>
                <Input id="cup-size" type="number" step="10" placeholder="e.g. 250" value={cupSizeMl} onChange={e => { setCupSizeMl(e.target.value); mark(); }} />
              </div>
              <p className="text-xs text-muted-foreground pb-2.5 leading-snug">Required for dynamic fill slots.</p>
            </div>
          </CardContent>
        </Card>

        {/* Slots */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Ingredient Slots ({slots.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => addSlot("typed")}>
                <Layers className="h-4 w-4" /> Add Catalog Slot
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => addSlot("legacy")}>
                <Plus className="h-4 w-4" /> Add Legacy Slot
              </Button>
            </div>
          </div>

          {slots.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 flex flex-col items-center text-center gap-3 text-muted-foreground">
                <FlaskConical className="h-10 w-10 opacity-30" />
                <div>
                  <p className="font-medium">No ingredient slots yet</p>
                  <p className="text-sm">Add catalog slots (new system) or legacy slots for existing ingredients.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => addSlot("typed")} className="gap-2">
                    <Layers className="h-4 w-4" /> Add Catalog Slot
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSlot("legacy")} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Legacy Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {slots.map((slot, index) => {
            const options = slot.ingredientId ? (optionsCache[slot.ingredientId] ?? []) : [];
            const ing = slot.ingredientId ? ingredientMap[slot.ingredientId] : null;

            return (
              <Card
                key={slot.key}
                className={`border-2 transition-colors ${
                  slot.isDynamic ? "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/10" :
                  slot.style === "typed" ? "border-primary/30 bg-primary/5 dark:bg-primary/5" : ""
                }`}
              >
                <CardContent className="pt-3 pb-3 grid gap-3">
                  {/* Header row: reorder + collapse toggle + label + summary + delete */}
                  <div className="flex items-center gap-2">
                    {/* Reorder arrows */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveUp(index)} disabled={index === 0}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveDown(index)} disabled={index === slots.length - 1}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Collapse toggle */}
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => toggleSlotExpanded(slot.key)}
                      title={slot.expanded ? "Collapse slot" : "Expand slot"}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${slot.expanded ? "" : "-rotate-90"}`} />
                    </Button>

                    {/* Label area — always visible */}
                    <button
                      type="button"
                      className="flex-1 flex items-center gap-2 min-w-0 text-left"
                      onClick={() => toggleSlotExpanded(slot.key)}
                    >
                      <Badge variant={slot.style === "typed" ? "default" : "secondary"} className="text-xs h-4 px-1.5 shrink-0">
                        {slot.style === "typed" ? "Catalog" : "Legacy"}
                      </Badge>
                      <span className={`text-sm font-medium truncate ${slot.slotLabel ? "" : "text-muted-foreground italic"}`}>
                        {slot.slotLabel || "Unnamed slot"}
                      </span>
                      {/* Compact summary when collapsed */}
                      {!slot.expanded && (
                        <span className="text-xs text-muted-foreground truncate shrink-0">
                          {slot.style === "typed"
                            ? slot.typeOptions.length > 0
                              ? `· ${slot.typeOptions.map(t => t.typeName).join(", ")}`
                              : "· no types"
                            : slot.isDynamic ? "· dynamic fill"
                            : ""}
                        </span>
                      )}
                    </button>

                    {/* Delete */}
                    <Button
                      variant="ghost" size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeSlot(slot.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                    <div className="flex gap-4 pl-14">
                      <div className="flex-1 grid gap-1.5">
                        <Label className="text-xs">Slot Label</Label>
                        <Input
                          placeholder="e.g. Espresso, Milk, Syrup"
                          value={slot.slotLabel}
                          onChange={e => updateSlot(slot.key, { slotLabel: e.target.value })}
                        />
                      </div>
                      <div className="w-24 grid gap-1.5">
                        <Label className="text-xs">Cust. Index</Label>
                        <Input
                          type="number"
                          value={slot.customerSortOrder}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            updateSlot(slot.key, { customerSortOrder: isNaN(val) ? 1 : val });
                          }}
                        />
                      </div>
                      <div className="w-24 grid gap-1.5">
                        <Label className="text-xs">Barista Index</Label>
                        <Input
                          type="number"
                          value={slot.baristaSortOrder}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            updateSlot(slot.key, { baristaSortOrder: isNaN(val) ? 1 : val });
                          }}
                        />
                      </div>
                      <div className="w-36 grid gap-1.5">
                        <Label className="text-xs">Countable</Label>
                        <Select
                          value={slot.affectsCupSize === null ? "inherit" : slot.affectsCupSize ? "yes" : "no"}
                          onValueChange={v => updateSlot(slot.key, { 
                            affectsCupSize: v === "inherit" ? null : v === "yes" 
                          })}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inherit">Type Default</SelectItem>
                            <SelectItem value="yes">Always Count</SelectItem>
                            <SelectItem value="no">Never Count</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                  {/* ── CATALOG SLOT ── */}
                  {slot.expanded && slot.style === "typed" && (
                    <div className="grid gap-3">
                      {/* Type Options list */}
                      {slot.typeOptions.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {slot.typeOptions.map((to) => (
                            <div key={to.key} className="border rounded-lg bg-card overflow-hidden">
                              {/* Type option header */}
                              <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b">
                                <button
                                  type="button"
                                  onClick={() => toggleTypeOptionExpanded(slot.key, to.key)}
                                  className="flex items-center gap-1.5 text-sm font-medium flex-1 text-left hover:text-primary transition-colors"
                                >
                                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${to.expanded ? "rotate-90" : ""}`} />
                                  <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span>{to.typeName || "Unnamed type"}</span>
                                  {to.categoryName && <span className="text-xs text-muted-foreground font-normal">({to.categoryName})</span>}
                                  <span className="text-xs text-muted-foreground font-normal">· {to.slotVolumes.filter(v => v.isEnabled).length} vol.</span>
                                </button>
                                <div className="flex items-center gap-2 shrink-0">
                                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                                    <input
                                      type="radio"
                                      name={`default-type-${slot.key}`}
                                      checked={to.isDefault}
                                      onChange={() => setTypeOptionDefault(slot.key, to.key)}
                                      className="accent-primary h-3 w-3"
                                    />
                                    Default
                                  </label>
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => removeTypeOption(slot.key, to.key)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Volume table (collapsible) */}
                              {to.expanded && (
                                <div className="p-2">
                                  {to.slotVolumes.length > 0 ? (
                                    <div className="border rounded-md divide-y overflow-x-auto">
                                      <div className="grid grid-cols-[auto_1fr_4rem_4rem_3.5rem_5rem_auto] items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b min-w-[540px]">
                                        <span>On</span>
                                        <span>Volume</span>
                                        <span className="text-right">Proc.</span>
                                        <span className="text-right">Prod.</span>
                                        <span className="text-center">Unit</span>
                                        <span className="text-right">+Cost (E£)</span>
                                        <span className="text-right pr-1">Def.</span>
                                      </div>
                                      {to.slotVolumes.map(sv => (
                                        <div key={sv.typeVolumeId} className={`grid grid-cols-[auto_1fr_4rem_4rem_3.5rem_5rem_auto] items-center gap-2 px-3 py-2 min-w-[540px] ${!sv.isEnabled ? "opacity-50" : ""}`}>
                                          <Checkbox
                                            checked={sv.isEnabled}
                                            onCheckedChange={v => updateTypeOptionVolume(slot.key, to.key, sv.typeVolumeId, { isEnabled: Boolean(v), isDefault: !v ? false : sv.isDefault })}
                                          />
                                          <div className="text-sm font-medium truncate">{sv.volumeName}</div>
                                          <Input type="number" step="0.1" className="h-7 text-sm text-right px-1.5" value={sv.processedQty} disabled={!sv.isEnabled} onChange={e => updateTypeOptionVolume(slot.key, to.key, sv.typeVolumeId, { processedQty: e.target.value })} />
                                          <Input type="number" step="0.1" className="h-7 text-sm text-right px-1.5" value={sv.producedQty} disabled={!sv.isEnabled} onChange={e => updateTypeOptionVolume(slot.key, to.key, sv.typeVolumeId, { producedQty: e.target.value })} />
                                          <Input type="text" className="h-7 text-sm text-center px-1" value={sv.unit} disabled={!sv.isEnabled} onChange={e => updateTypeOptionVolume(slot.key, to.key, sv.typeVolumeId, { unit: e.target.value })} />
                                          <Input type="number" step="0.01" className="h-7 text-sm text-right px-1.5" value={sv.extraCost} disabled={!sv.isEnabled} onChange={e => updateTypeOptionVolume(slot.key, to.key, sv.typeVolumeId, { extraCost: e.target.value })} />
                                          <div className="flex justify-end pr-1">
                                            <input type="radio" name={`default-vol-${slot.key}-${to.key}`} checked={sv.isDefault} disabled={!sv.isEnabled} onChange={() => updateTypeOptionVolume(slot.key, to.key, sv.typeVolumeId, { isDefault: true })} className="accent-primary h-3.5 w-3.5" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground text-center py-2">No volumes for this type. Add volumes in Ingredients → Types → Volumes.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add type option */}
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Select
                          value=""
                          onValueChange={v => addTypeOption(slot.key, parseInt(v))}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder={slot.typeOptions.length === 0 ? "Pick a type to add…" : "Add another type option…"} />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-[60vh] overflow-y-auto">
                            {categories.map(cat => {
                              const catTypes = (typesByCategory.get(cat.id) ?? []).filter(t => !slot.typeOptions.some(to => to.ingredientTypeId === t.id));
                              if (catTypes.length === 0) return null;
                              return (
                                <SelectGroup key={cat.id}>
                                  <SelectLabel>{cat.name}</SelectLabel>
                                  {catTypes.map(t => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                      {t.name} <span className="text-muted-foreground">({cat.name})</span>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {slot.typeOptions.length === 0 && (
                        <p className="text-xs text-muted-foreground">Add at least one type option — e.g. Brazilian, Colombian, Special Roasted.</p>
                      )}

                      {/* Required / Dynamic toggles */}
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2.5">
                          <Switch id={`req-${slot.key}`} checked={slot.isRequired} onCheckedChange={v => updateSlot(slot.key, { isRequired: v })} />
                          <Label htmlFor={`req-${slot.key}`} className="cursor-pointer text-sm font-medium">Required</Label>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Switch id={`dyn-${slot.key}`} checked={slot.isDynamic} onCheckedChange={v => updateSlot(slot.key, { isDynamic: v })} disabled={!slot.isDynamic && hasDynamicSlot} />
                          <Label htmlFor={`dyn-${slot.key}`} className="cursor-pointer text-sm font-medium flex items-center gap-1.5">
                            <Droplets className="h-4 w-4 text-blue-500" /> Dynamic fill
                          </Label>
                          {slot.isDynamic && (
                            <Badge variant="secondary" className="text-blue-600 bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold">
                              fills remaining {cupSizeMl ? `${cupSizeMl}ml` : "cup"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── LEGACY SLOT ── */}
                  {slot.expanded && slot.style === "legacy" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Ingredient</Label>
                          <Select
                            value={slot.ingredientId?.toString() ?? ""}
                            onValueChange={v => updateSlot(slot.key, { ingredientId: parseInt(v) })}
                          >
                            <SelectTrigger><SelectValue placeholder="Pick ingredient…" /></SelectTrigger>
                            <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-[60vh] overflow-y-auto">
                              {(ingredients ?? []).map(i => (
                                <SelectItem key={i.id} value={i.id.toString()}>
                                  <span className="capitalize">[{i.ingredientType}]</span> {i.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {ing && <p className="text-xs text-muted-foreground">{options.length} option{options.length !== 1 ? "s" : ""} · unit: {ing.unit}</p>}
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Default Option</Label>
                          <Select
                            value={slot.defaultOptionId?.toString() ?? "none"}
                            onValueChange={v => updateSlot(slot.key, { defaultOptionId: v === "none" ? null : parseInt(v) })}
                            disabled={options.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={options.length === 0 ? "Select ingredient first" : "Choose default…"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No default</SelectItem>
                              {options.map((o: any) => (
                                <SelectItem key={o.id} value={o.id.toString()}>
                                  {o.label}{o.extraCost > 0 ? ` (+E£${Number(o.extraCost).toFixed(2)})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2.5">
                          <Switch id={`req-${slot.key}`} checked={slot.isRequired} onCheckedChange={v => updateSlot(slot.key, { isRequired: v })} />
                          <Label htmlFor={`req-${slot.key}`} className="cursor-pointer text-sm">Required</Label>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Switch id={`dyn-${slot.key}`} checked={slot.isDynamic} onCheckedChange={v => updateSlot(slot.key, { isDynamic: v })} disabled={!slot.isDynamic && hasDynamicSlot} />
                          <Label htmlFor={`dyn-${slot.key}`} className="cursor-pointer text-sm flex items-center gap-1.5">
                            <Droplets className="h-3.5 w-3.5 text-blue-500" /> Dynamic fill
                          </Label>
                          {slot.isDynamic && (
                            <Badge variant="secondary" className="text-blue-600 bg-blue-100 dark:bg-blue-900/30 text-xs">
                              fills remaining {cupSizeMl ? `${cupSizeMl}ml` : "cup"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {slots.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 flex-1 border-dashed" onClick={() => addSlot("typed")}>
                <Layers className="h-4 w-4" /> Add Catalog Slot
              </Button>
              <Button variant="outline" className="gap-2 flex-1 border-dashed" onClick={() => addSlot("legacy")}>
                <Plus className="h-4 w-4" /> Add Legacy Slot
              </Button>
            </div>
          )}
        </div>

        <Separator />
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="font-semibold">Catalog slot</span> — supports multiple type options (e.g. Brazilian / Colombian / Special Roasted), each with its own volumes (Single / Double / Triple). Baristas pick type first, then volume.</p>
          <p><span className="font-semibold">Legacy slot</span> — uses raw inventory items with manual options. <span className="font-semibold text-blue-600">Dynamic fill</span> fills remaining cup volume automatically.</p>
        </div>
      </div>
    </div>
  );
}
