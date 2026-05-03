import { useState, useMemo, useEffect, useRef } from "react";
import {
  useListDrinks,
  useGetDrink,
  useCalculateDrinkPrice,
  useCreateOrder,
  Drink,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ShoppingCart, X, Plus, Minus, ArrowLeft, RotateCcw, Loader2, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fmt } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import { CupSimulator, type CupLayer } from "@/components/cup-simulator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { useSettings } from "@/hooks/use-settings";
import { useOrderEvents } from "@/hooks/use-order-events";

import { DrinkCard } from "@/components/drink-card";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type DrinkCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

function useDrinkCategories() {
  return useQuery<DrinkCategory[]>({
    queryKey: ["kiosk-drink-categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/drink-categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
}

export default function KioskPage() {
  const { allowNoStockSell } = useSettings();
  useOrderEvents();
  const [step, setStep] = useState<"start" | "menu" | "checkout" | "success">("start");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get("branchId");
    if (fromUrl) return parseInt(fromUrl);
    const saved = localStorage.getItem("kiosk_branch_id");
    return saved ? parseInt(saved) : null;
  });
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/branches`);
      if (!res.ok) throw new Error("Failed to fetch branches");
      return res.json();
    },
  });

  useEffect(() => {
    if (selectedBranchId) {
      localStorage.setItem("kiosk_branch_id", selectedBranchId.toString());
    }
  }, [selectedBranchId]);

  const selectedBranch = useMemo(() => branches.find(b => b.id === selectedBranchId), [branches, selectedBranchId]);

  const { data: drinks = [] } = useListDrinks({ active: true, branchId: selectedBranchId || undefined });
  const { data: allCategories = [] } = useDrinkCategories();

  const categories = useMemo(() => allCategories.filter(c => c.isActive), [allCategories]);

  const filteredDrinks = useMemo(() => {
    if (selectedCategoryId === null) return drinks;
    return drinks.filter(d => (d as any).categoryId === selectedCategoryId);
  }, [drinks, selectedCategoryId]);

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  // --- Customization State ---
  const [activeDrink, setActiveDrink] = useState<Drink | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { data: drinkDetail, isLoading: isLoadingDrinkDetail } = useGetDrink(
    activeDrink?.id || 0,
    { branchId: selectedBranchId || undefined },
    { query: { enabled: !!activeDrink } } as any
  );

  const [selections, setSelections] = useState<Record<number, number>>({});
  const [subSelections, setSubSelections] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState("");

  const applyDefaults = () => {
    if (drinkDetail) {
      const initial: Record<number, number> = {};
      const initialSub: Record<number, number> = {};
      (drinkDetail.slots as any[]).forEach(slot => {
        if (slot.slotStyle === "typed") {
          const typeOptions: any[] = slot.typeOptions ?? [];
          
          const availableTypes = allowNoStockSell 
            ? typeOptions 
            : typeOptions.filter(to => to.isAvailable);

          const activeTypeOptions = availableTypes.length > 0 ? availableTypes : typeOptions;
          const defTypeOpt = activeTypeOptions.find((to: any) => to.isDefault) ?? activeTypeOptions[0];
          
          if (defTypeOpt) {
            initial[slot.id] = defTypeOpt.ingredientTypeId;
            const availableVols = (defTypeOpt.volumes ?? []).filter((v: any) => allowNoStockSell || v.isAvailable);
            
            let defVol = availableVols.find((v: any) => v.isDefault);
            if (!defVol && availableVols.length > 0) {
              defVol = availableVols[availableVols.length - 1]; 
            }
            
            if (defVol) initialSub[slot.id] = defVol.id;
            else if (defTypeOpt.volumes?.length > 0) initialSub[slot.id] = defTypeOpt.volumes[0].id;
          }
          return;
        }

        let selectedOptionId: number | undefined;
        const options: any[] = slot.ingredient?.options ?? [];
        const stock = slot.ingredient?.stockQuantity ?? 0;
        
        const availableOptions = allowNoStockSell 
          ? options 
          : options.filter(o => stock > 0);

        if (slot.defaultOptionId && (allowNoStockSell || stock > 0)) {
          selectedOptionId = slot.defaultOptionId;
        } else if (availableOptions.length > 0) {
          selectedOptionId = (availableOptions.find((o: any) => o.isDefault) || availableOptions[0]).id;
        }

        if (selectedOptionId !== undefined) {
          initial[slot.id] = selectedOptionId;
          const selOpt = options.find((o: any) => o.id === selectedOptionId);
          if (selOpt?.linkedIngredient?.options?.length) {
            const subOpts = selOpt.linkedIngredient.options;
            const subStock = selOpt.linkedIngredient.stockQuantity ?? 0;
            const availableSub = allowNoStockSell ? subOpts : subOpts.filter((so: any) => subStock >= (so.processedQty || 0));
            const defSub = availableSub.find((o: any) => o.isDefault) || availableSub[0] || subOpts[0];
            if (defSub) initialSub[slot.id] = defSub.id;
          }
        }
      });
      setSelections(initial);
      setSubSelections(initialSub);
      setNotes("");
    }
  };

  useEffect(() => { applyDefaults(); }, [drinkDetail]);

  const currentSelectionsArray = useMemo(() => {
    if (!drinkDetail) return [];
    return Object.entries(selections).map(([slotIdStr, selectionVal]) => {
      const slotId = parseInt(slotIdStr);
      const slot = (drinkDetail.slots as any[]).find(s => s.id === slotId);
      if (!slot) return null;
      if (slot.slotStyle === "typed") {
        const typeVolumeId = subSelections[slotId];
        return { slotId: slot.id, ingredientTypeId: selectionVal, typeVolumeId: typeVolumeId || undefined };
      }
      const optionId = selectionVal;
      const option = slot.ingredient?.options?.find((o: any) => o.id === optionId);
      const subOptionId = option?.linkedIngredientId ? (subSelections[slotId] ?? undefined) : undefined;
      return { ingredientId: slot.ingredientId || 0, optionId, subOptionId };
    }).filter((s): s is any => s !== null);
  }, [selections, subSelections, drinkDetail]);

  const { mutate: calculatePrice, data: priceBreakdown, isPending: isCalculating } = useCalculateDrinkPrice();
  
  useEffect(() => {
    if (activeDrink && currentSelectionsArray.length > 0) {
      calculatePrice({ 
        id: activeDrink.id, 
        data: { 
          branchId: selectedBranchId || undefined, 
          selections: currentSelectionsArray 
        } 
      });
    }
  }, [activeDrink, currentSelectionsArray]);

  const displayPrice = useMemo(() => {
    if (priceBreakdown?.total !== undefined) return priceBreakdown.total;
    if (activeDrink) return (activeDrink as any).defaultPrice ?? activeDrink.basePrice ?? 0;
    return 0;
  }, [priceBreakdown?.total, activeDrink]);

  const [simulatorLayers, setSimulatorLayers] = useState<CupLayer[]>([]);

  useEffect(() => {
    if (priceBreakdown?.extras && Array.isArray(priceBreakdown.extras)) {
      const newLayers: CupLayer[] = (priceBreakdown.extras || [])
        .filter((ext: any) => ext.producedQty >= 0)
        .map((ext: any) => {
          const slotLower = ext.slotLabel?.toLowerCase() || '';
          let inferredCategory = 'other';
          if (slotLower.includes('milk') || slotLower.includes('cream')) inferredCategory = 'milk';
          else if (slotLower.includes('coffee') || slotLower.includes('espresso')) inferredCategory = 'coffee';
          else if (slotLower.includes('syrup')) inferredCategory = 'syrup';
          else if (slotLower.includes('topping')) inferredCategory = 'topping';
          else if (slotLower.includes('ice') || slotLower.includes('water')) inferredCategory = 'water';

          return {
            id: `${ext.slotLabel}-${ext.optionLabel}-${ext.producedQty}`,
            label: `${ext.optionLabel} (${Math.round(ext.producedQty)}ml)`,
            volume: Math.max(0, ext.producedQty || 0),
            color: ext.color,
            category: inferredCategory,
          };
        });
      setSimulatorLayers(newLayers);
    }
  }, [priceBreakdown]);

  const handleAddToCart = () => {
    if (!activeDrink || !drinkDetail || !priceBreakdown) return;

    const formattedSelections = Object.entries(selections).map(([slotIdStr, selectionVal]) => {
      const slotId = parseInt(slotIdStr);
      const slot = (drinkDetail.slots as any[]).find(s => s.id === slotId);
      if (!slot) return null;

      if (slot.slotStyle === "typed") {
        const typeOptions: any[] = slot.typeOptions ?? [];
        const typeOpt = typeOptions.find((to: any) => to.ingredientTypeId === selectionVal);
        const vol = typeOpt?.volumes?.find((v: any) => v.id === subSelections[slotId]);
        return {
          slotId: slot.id,
          ingredientTypeId: selectionVal,
          typeVolumeId: subSelections[slotId],
          optionLabel: `${typeOpt?.typeName || ""}${vol?.volumeName ? ` · ${vol.volumeName}` : ""}`.trim(),
          slotLabel: slot.slotLabel,
          extraCost: (priceBreakdown as any).extras?.find((e: any) => e.slotLabel === slot.slotLabel)?.extraCost || 0
        };
      }

      const option = slot.ingredient?.options?.find((o: any) => o.id === selectionVal);
      let optionLabel = option?.label || "";
      if (option?.linkedIngredientId) {
        const subOpt = option.linkedIngredient.options.find((o: any) => o.id === subSelections[slotId]);
        if (subOpt) optionLabel = `${option.label} · ${subOpt.label}`;
      }

      return {
        ingredientId: slot.ingredientId,
        optionId: selectionVal,
        subOptionId: subSelections[slotId],
        optionLabel,
        slotLabel: slot.slotLabel,
        extraCost: priceBreakdown.extras.find((e: any) => e.slotLabel === slot.slotLabel)?.extraCost || 0
      };
    }).filter(s => s !== null);

    setCart(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      drinkId: activeDrink.id,
      drinkName: activeDrink.name,
      quantity: 1,
      basePrice: priceBreakdown.basePrice,
      totalPrice: priceBreakdown.total,
      selections: formattedSelections,
      image: (activeDrink as any).imageUrl,
    }]);

    setIsCustomizing(false);
    setActiveDrink(null);
  };

  // --- Order Creation ---
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder({
    mutation: {
      onSuccess: (data) => {
        setOrderNumber(data.orderNumber);
        setStep("success");
        setCart([]);
      },
    },
  });

  const handleFinish = () => {
    createOrder({
      data: {
        branchId: selectedBranchId || undefined,
        paymentMethod: "card", // Default to card for Kiosk
        items: cart.map(item => ({
          drinkId: item.drinkId,
          quantity: item.quantity,
          selections: item.selections.map((s: any) => ({
            ingredientId: s.ingredientId,
            optionId: s.optionId,
            subOptionId: s.subOptionId,
            slotId: s.slotId,
            typeVolumeId: s.typeVolumeId,
            ingredientTypeId: s.ingredientTypeId,
          })),
        })),
      },
    });
  };

  // --- Start Step ---
  if (step === "start" || !selectedBranchId) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 text-center space-y-8 w-full max-w-xl px-6"
        >
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(var(--primary),0.5)]">
            <Coffee className="h-12 w-12 text-primary-foreground" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">Spacca</h1>
            <p className="text-xl text-white/60 font-medium tracking-[0.5em] uppercase">Premium Coffee</p>
          </div>

          {!selectedBranchId ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white uppercase italic tracking-wider">Select Location</h2>
              <div className="grid grid-cols-1 gap-4">
                {branches.map(branch => (
                  <Button 
                    key={branch.id}
                    variant="outline"
                    className="h-20 rounded-[2rem] border-white/20 bg-white/5 hover:bg-primary hover:border-primary text-xl font-bold transition-all text-white"
                    onClick={() => {
                      setSelectedBranchId(branch.id);
                      setStep("menu");
                    }}
                  >
                    {branch.name}
                  </Button>
                ))}
                {branches.length === 0 && (
                  <div className="text-white/40 italic">Loading locations...</div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
               <div className="space-y-2">
                 <p className="text-white/40 uppercase tracking-[0.3em] font-black text-sm">Ordering from</p>
                 <h2 className="text-3xl font-black text-primary italic uppercase">{selectedBranch?.name}</h2>
               </div>
               
               <Button 
                 className="w-full h-24 rounded-full text-2xl font-black uppercase tracking-[0.2em] shadow-2xl"
                 onClick={() => setStep("menu")}
               >
                 Touch to Order
               </Button>
               
               <button 
                 onClick={() => setSelectedBranchId(null)}
                 className="text-white/40 hover:text-white underline underline-offset-8 font-bold uppercase tracking-widest text-xs"
               >
                 Change Location
               </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col portrait:max-w-full">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-20 border-b">
        <div className="flex items-center gap-3" onClick={() => setStep("start")}>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Coffee className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter uppercase italic leading-none">Spacca</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{selectedBranch?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="rounded-full font-bold uppercase tracking-widest text-xs">العربية</Button>
          {cart.length > 0 && (
             <Button variant="outline" className="rounded-full h-12 px-6 gap-2 border-primary/20 bg-primary/5" onClick={() => setStep("checkout")}>
               <ShoppingCart className="h-5 w-5 text-primary" />
               <span className="font-bold text-lg">{fmt(cartTotal)}</span>
             </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <aside className="w-32 border-r bg-muted/20 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedCategoryId === null ? "bg-primary text-primary-foreground shadow-lg" : "bg-card hover:bg-muted"
                }`}
              >
                <div className="font-black text-[10px] uppercase tracking-widest leading-none">All</div>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full aspect-square rounded-2xl p-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedCategoryId === cat.id ? "bg-primary text-primary-foreground shadow-lg scale-105" : "bg-card hover:bg-muted"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Drink Grid */}
        <main className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full p-6">
            <div className="grid grid-cols-3 gap-6 p-10 pb-40">
              {filteredDrinks.map(drink => (
                <DrinkCard 
                  key={drink.id}
                  drink={drink}
                  variant="kiosk"
                  onClick={() => {
                    setActiveDrink(drink);
                    setIsCustomizing(true);
                  }}
                />
              ))}
            </div>
          </ScrollArea>
          
          {/* Floating Cart Bar */}
          <AnimatePresence>
            {cart.length > 0 && (
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-background via-background to-transparent"
              >
                <Button 
                  className="w-full h-20 rounded-full text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 gap-4"
                  onClick={() => setStep("checkout")}
                >
                  Confirm Order ({cart.reduce((s,i) => s+i.quantity, 0)})
                  <div className="h-8 w-px bg-white/20 mx-2" />
                  {fmt(cartTotal)}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <Dialog open={isCustomizing} onOpenChange={(open) => { if (!open) setIsCustomizing(false); }}>
        <DialogContent className="sm:max-w-[500px] h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-8 pt-10 pb-8 border-b shrink-0 bg-muted/20 relative">
             <div className="flex flex-col items-center text-center">
               <div className="w-full flex justify-between items-start mb-6">
                 <div className="text-left">
                   <DialogTitle className="text-3xl font-black capitalize italic tracking-tighter mb-2">{activeDrink?.name}</DialogTitle>
                   <div className="text-3xl font-black text-primary italic">{fmt(displayPrice)}</div>
                 </div>
                 <button onClick={() => setIsCustomizing(false)} className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                   <X className="h-6 w-6" />
                 </button>
               </div>
               
               {/* Cup Simulator & Description */}
               <div className="w-full flex flex-col items-center gap-6">
                 {drinkDetail && (
                   <div className="w-48 h-64">
                     <CupSimulator 
                       cupSizeMl={drinkDetail.cupSizeMl || 0}
                       layers={simulatorLayers}
                       className="drop-shadow-2xl"
                     />
                   </div>
                 )}
                 {drinkDetail?.description && (
                   <p className="text-sm text-muted-foreground font-medium max-w-sm">
                     {drinkDetail.description}
                   </p>
                 )}
               </div>
             </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-8 py-6">
            {isLoadingDrinkDetail ? (
               <div className="flex flex-col items-center justify-center h-40">
                 <Loader2 className="h-10 w-10 animate-spin text-primary" />
               </div>
            ) : (
              <div className="space-y-10">
                {(drinkDetail?.slots as any[])?.map(slot => {
                  const options = slot.slotStyle === "typed" ? slot.typeOptions : slot.ingredient?.options;
                  if (!options?.length) return null;

                  return (
                    <div key={slot.id} className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">{slot.slotLabel}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {options.map((opt: any) => {
                          const id = slot.slotStyle === "typed" ? opt.ingredientTypeId : opt.id;
                          const isSelected = selections[slot.id] === id;
                          
                          // Check stock
                          const isOutOfStock = !allowNoStockSell && !opt.isAvailable;

                          return (
                            <button
                              key={id}
                              disabled={isOutOfStock}
                              onClick={() => {
                                setSelections(prev => ({ ...prev, [slot.id]: id }));
                                if (slot.slotStyle === "typed") {
                                  const availableVols = (opt.volumes ?? []).filter((v: any) => allowNoStockSell || v.isAvailable);
                                  const defVol = availableVols.find((v: any) => v.isDefault) ?? availableVols[availableVols.length - 1] ?? opt.volumes?.[0];
                                  if (defVol) setSubSelections(prev => ({ ...prev, [slot.id]: defVol.id }));
                                } else if (opt.linkedIngredient?.options?.length) {
                                  const subOpts = opt.linkedIngredient.options;
                                  const availableSub = allowNoStockSell ? subOpts : subOpts.filter((so: any) => so.isAvailable);
                                  const defSub = availableSub.find((o: any) => o.isDefault) || availableSub[0] || subOpts[0];
                                  if (defSub) setSubSelections(prev => ({ ...prev, [slot.id]: defSub.id }));
                                }
                              }}
                              className={`p-4 rounded-3xl border-2 text-left transition-all relative ${
                                isSelected ? "border-primary bg-primary/5 shadow-inner" : "border-muted bg-card"
                              } ${isOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                            >
                              <div className="font-black uppercase text-xs tracking-wide">{opt.typeName || opt.label}</div>
                              {isOutOfStock ? (
                                <div className="text-[10px] text-destructive font-bold uppercase mt-1">Sold Out</div>
                              ) : opt.extraCost > 0 && (
                                <div className="text-[10px] text-primary font-bold">+{fmt(opt.extraCost)}</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Sub-options / Volumes */}
                      {(() => {
                        const selectedId = selections[slot.id];
                        if (!selectedId) return null;
                        
                        let subOptions: any[] = [];
                        if (slot.slotStyle === "typed") {
                          const typeOpt = (slot.typeOptions as any[]).find(to => to.ingredientTypeId === selectedId);
                          subOptions = typeOpt?.volumes ?? [];
                        } else {
                          const opt = (slot.ingredient?.options as any[]).find(o => o.id === selectedId);
                          subOptions = opt?.linkedIngredient?.options ?? [];
                        }
                        
                        if (subOptions.length <= 1) return null; // No need to pick if only one option
                        
                        return (
                          <div className="mt-4 pl-6 border-l-4 border-primary/20 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Choose Variant</p>
                            <div className="grid grid-cols-2 gap-2">
                              {subOptions.map((sub: any) => {
                                const isSubSelected = subSelections[slot.id] === sub.id;
                                const isSubOut = !allowNoStockSell && (sub.isAvailable === false || (sub.processedQty && (slot.typeOptions?.find((to:any)=>to.ingredientTypeId === selectedId)?.stockQuantity ?? 0) < sub.processedQty));
                                
                                return (
                                  <button
                                    key={sub.id}
                                    disabled={isSubOut}
                                    onClick={() => setSubSelections(prev => ({ ...prev, [slot.id]: sub.id }))}
                                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                                      isSubSelected ? "border-primary bg-primary text-white shadow-lg" : "border-muted bg-muted/30 text-muted-foreground"
                                    } ${isSubOut ? "opacity-30 grayscale pointer-events-none" : ""}`}
                                  >
                                    <div className="font-bold text-[10px] uppercase truncate">{sub.volumeName || sub.label}</div>
                                    {!isSubOut && sub.extraCost > 0 && <div className={`text-[9px] ${isSubSelected ? "text-white/70" : "text-primary"}`}>+{fmt(sub.extraCost)}</div>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="p-8 border-t bg-muted/20">
            <Button className="w-full h-20 rounded-full text-xl font-black uppercase tracking-widest shadow-xl" onClick={handleAddToCart} disabled={isCalculating}>
              Add to Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Overlay */}
      <AnimatePresence>
        {step === "checkout" && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <header className="px-6 py-8 flex items-center gap-4 border-b">
              <Button variant="ghost" size="icon" className="rounded-full w-12 h-12" onClick={() => setStep("menu")}>
                <ArrowLeft className="h-8 w-8" />
              </Button>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Review Order</h2>
            </header>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center bg-muted/30 p-6 rounded-[2.5rem]">
                    <div className="w-24 h-24 bg-muted rounded-3xl overflow-hidden shrink-0">
                       {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black capitalize text-base tracking-tight italic">{item.drinkName}</h4>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                        {item.selections.map((s: any) => s.optionLabel).join(" · ")}
                      </div>
                      <p className="text-primary font-black text-lg">{fmt(item.totalPrice)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2" onClick={() => {
                        setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
                      }}>
                        <Minus className="h-5 w-5" />
                      </Button>
                      <span className="font-black text-2xl w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2" onClick={() => {
                        setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
                      }}>
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-8 border-t space-y-6 bg-muted/20">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Pick-up Location</span>
                  <span className="text-lg font-black italic uppercase">{selectedBranch?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Amount</span>
                  <div className="text-4xl font-black text-primary italic">{fmt(cartTotal)}</div>
                </div>
              <Button 
                className="w-full h-24 rounded-[2rem] text-2xl font-black uppercase tracking-[0.2em] shadow-2xl"
                onClick={handleFinish}
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? "Sending..." : "Finish Order"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Step */}
      <AnimatePresence>
        {step === "success" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(34,197,94,0.4)]"
            >
               <ShoppingCart className="h-16 w-16" />
            </motion.div>
            <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-4">Order Placed!</h2>
            <p className="text-2xl text-white/60 font-bold max-w-sm">Please show this number to the cashier to pay.</p>
            <div className="mt-12 p-10 bg-white/5 rounded-[3rem] border border-white/10 w-full max-w-xs">
               <p className="text-xs opacity-60 uppercase tracking-[0.3em] font-black mb-2">Order Number</p>
               <p className="text-7xl font-black text-primary italic">#{orderNumber}</p>
            </div>
            
            <Button 
              className="mt-20 h-20 px-16 rounded-full text-xl font-black uppercase tracking-widest shadow-2xl"
              onClick={() => {
                setOrderNumber(null);
                setStep("start");
              }}
            >
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
