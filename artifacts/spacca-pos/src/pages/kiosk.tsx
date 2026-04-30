import { useState, useMemo, useEffect, useRef } from "react";
import {
  useListDrinks,
  useGetDrink,
  useCalculateDrinkPrice,
  useCreateOrder,
  Drink,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Coffee, ChevronRight, ShoppingCart, X, Plus, Minus, ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fmt } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import { CupSimulator, type CupLayer } from "@/components/cup-simulator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

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
  const [step, setStep] = useState<"start" | "menu" | "checkout" | "success">("start");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const { data: drinks = [] } = useListDrinks({ active: true });
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
          const defTypeOpt = typeOptions.find((to: any) => to.isDefault) ?? typeOptions[0];
          if (defTypeOpt) {
            initial[slot.id] = defTypeOpt.ingredientTypeId;
            const defVol = (defTypeOpt.volumes ?? []).find((v: any) => v.isDefault) ?? defTypeOpt.volumes?.[0];
            if (defVol) initialSub[slot.id] = defVol.id;
          }
          return;
        }
        let selectedOptionId: number | undefined;
        if (slot.defaultOptionId) {
          selectedOptionId = slot.defaultOptionId;
        } else if (slot.ingredient?.options?.length > 0) {
          const def = slot.ingredient.options.find((o: any) => o.isDefault) || slot.ingredient.options[0];
          selectedOptionId = def.id;
        }
        if (selectedOptionId !== undefined) {
          initial[slot.id] = selectedOptionId;
          const selOpt = slot.ingredient?.options?.find((o: any) => o.id === selectedOptionId);
          if (selOpt?.linkedIngredient?.options?.length) {
            const defSub = selOpt.linkedIngredient.options.find((o: any) => o.isDefault) || selOpt.linkedIngredient.options[0];
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
      calculatePrice({ id: activeDrink.id, data: { selections: currentSelectionsArray } });
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
  if (step === "start") {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden" onClick={() => setStep("menu")}>
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 text-center space-y-6"
        >
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(var(--primary),0.5)]">
            <Coffee className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">Spacca</h1>
          <p className="text-xl text-white/60 font-medium tracking-[0.5em] uppercase">Touch to Order</p>
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
          <span className="font-black text-xl tracking-tighter uppercase italic">Spacca</span>
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
            <div className="grid grid-cols-2 gap-6 pb-24">
              {filteredDrinks.map(drink => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={drink.id}
                  onClick={() => {
                    setActiveDrink(drink);
                    setIsCustomizing(true);
                  }}
                  className="flex flex-col bg-card rounded-[2.5rem] overflow-hidden border shadow-sm group active:shadow-inner"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                    {(drink as any).imageUrl ? (
                      <img src={(drink as any).imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={drink.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Coffee className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-left">
                       <p className="text-white/60 font-black text-[10px] uppercase tracking-[0.2em]">{(drink as any).category}</p>
                       <h3 className="text-white font-black text-xl capitalize italic leading-none">{drink.name}</h3>
                    </div>
                    <div className="absolute top-4 right-4 bg-primary text-white font-black px-3 py-1 rounded-full text-sm shadow-xl italic">
                       {fmt((drink as any).defaultPrice || drink.basePrice)}
                    </div>
                  </div>
                </motion.button>
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
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                setSelections(prev => ({ ...prev, [slot.id]: id }));
                                if (slot.slotStyle === "typed") {
                                  const defVol = (opt.volumes ?? []).find((v: any) => v.isDefault) ?? opt.volumes?.[0];
                                  if (defVol) setSubSelections(prev => ({ ...prev, [slot.id]: defVol.id }));
                                }
                              }}
                              className={`p-4 rounded-3xl border-2 text-left transition-all ${
                                isSelected ? "border-primary bg-primary/5 shadow-inner" : "border-muted bg-card"
                              }`}
                            >
                              <div className="font-black uppercase text-xs tracking-wide">{opt.typeName || opt.label}</div>
                              {opt.extraCost > 0 && <div className="text-[10px] text-primary font-bold">+{fmt(opt.extraCost)}</div>}
                            </button>
                          );
                        })}
                      </div>
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
              <div className="flex justify-between items-center px-4">
                <span className="text-xl text-muted-foreground uppercase tracking-widest font-bold">Total Amount</span>
                <span className="text-4xl font-black text-primary italic">{fmt(cartTotal)}</span>
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
