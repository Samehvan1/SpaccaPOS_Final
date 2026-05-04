import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useListDrinks,
  useGetDrink,
  useCalculateDrinkPrice,
  useCreateOrder,
  useListBranches,
  Drink,
} from "@workspace/api-client-react";
import { useSettings } from "@/hooks/use-settings";
import { DrinkCard } from "@/components/drink-card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart, Trash2, X, ChevronRight, Droplets, Search, Menu, RotateCcw, Ticket, Check, Loader2, Tag, User, Lock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { fmt } from "@/lib/currency";
import { CupSimulator, type CupLayer } from "@/components/cup-simulator";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { Link } from "wouter";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type DrinkCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

function useDrinkCategories() {
  return useQuery<DrinkCategory[]>({
    queryKey: ["pos-drink-categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/drink-categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    staleTime: 60_000,
  });
}

type CartItem = {
  id: string;
  drinkId: number;
  drinkName: string;
  quantity: number;
  basePrice: number;
  totalPrice: number;
  selections: {
    ingredientId: number;
    optionId: number;
    subOptionId?: number;
    slotId?: number;
    typeVolumeId?: number;
    ingredientTypeId?: number;
    optionLabel: string;
    slotLabel: string;
    extraCost: number;
  }[];
  specialNotes?: string;
};


function detectSubcategory(name: string): string {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);
  return words[words.length - 1] || "";
}

// Smart categorization disabled as per user request

export default function PosTerminal() {
  const { user, selectedBranchId, setSelectedBranchId } = useAuth();
  const { toast } = useToast();
  const { allowNoStockSell } = useSettings();

  const { data: branches = [], isLoading: isLoadingBranches } = useListBranches();
  const { data: drinks, isLoading: isLoadingDrinks } = useListDrinks({ active: true, branchId: selectedBranchId || undefined });
  const { data: allCategories = [] } = useDrinkCategories();

  // Only show active categories that have the sort order from admin
  const categories = useMemo(() => {
    return allCategories.filter(c => c.isActive);
  }, [allCategories]);

  // selectedCategory is now a DrinkCategory id (number) or null for "All"
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDrinks = useMemo(() => {
    if (!drinks) return [];
    
    // 1. Filter by Main Category
    let result = drinks;
    if (selectedCategoryId !== null) {
      result = drinks.filter(d => {
        // Use categoryId if available (preferred)
        if ((d as any).categoryId !== undefined && (d as any).categoryId !== null) {
          return (d as any).categoryId === selectedCategoryId;
        }
        // Fallback to name matching if categoryId is missing (e.g. older drinks)
        const cat = categories.find(c => c.id === selectedCategoryId);
        return cat && d.category === cat.name;
      });
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d => d.name.toLowerCase().includes(q));
    }

    return result;
  }, [drinks, selectedCategoryId, categories, searchQuery]);

  const groupedDrinks = useMemo(() => {
    const sorted = [...filteredDrinks].sort((a, b) => {
      const sortA = a.sortOrder ?? 0;
      const sortB = b.sortOrder ?? 0;
      if (sortA !== sortB) return sortA - sortB;
      return a.name.localeCompare(b.name);
    });
    return [{ label: "", drinks: sorted }];
  }, [filteredDrinks]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCategoryChange = (catId: number | null) => {
    setSelectedCategoryId(catId);
    setIsMenuOpen(false);
  };

  // ... (customization dialog state and effects) ...

  // Customization dialog
  const [activeDrink, setActiveDrink] = useState<Drink | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { data: drinkDetail, isLoading: isLoadingDrinkDetail } = useGetDrink(
    activeDrink?.id || 0,
    { branchId: selectedBranchId || undefined },
    { query: { enabled: !!activeDrink } } as any
  );

  const [selections, setSelections] = useState<Record<number, number>>({});
  // subSelections: slotId → sub-option id (for two-level type→volume slots)
  const [subSelections, setSubSelections] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState("");

  const applyDefaults = () => {
    if (drinkDetail) {
      const initial: Record<number, number> = {};
      const initialSub: Record<number, number> = {};
      (drinkDetail.slots as any[]).forEach(slot => {
        // Typed (catalog) slot — pick default type option + default volume
        if (slot.slotStyle === "typed") {
          const typeOptions: any[] = slot.typeOptions ?? [];
          
          // Find available types (if not allowing no-stock sell)
          const availableTypes = allowNoStockSell 
            ? typeOptions 
            : typeOptions.filter(to => {
                const stock = to.stockQuantity ?? 0;
                if (stock <= 0) return false;
                // At least one volume must be affordable in terms of stock
                return (to.volumes ?? []).some((v: any) => stock >= (v.processedQty || 0));
              });

          const activeTypeOptions = availableTypes.length > 0 ? availableTypes : typeOptions;
          const defTypeOpt = activeTypeOptions.find((to: any) => to.isDefault) ?? activeTypeOptions[0];
          
          if (defTypeOpt) {
            initial[slot.id] = defTypeOpt.ingredientTypeId; // selections = which type
            const stock = defTypeOpt.stockQuantity ?? 0;
            
            // Filter volumes by stock
            const availableVols = (defTypeOpt.volumes ?? []).filter((v: any) => allowNoStockSell || stock >= (v.processedQty || 0));
            
            let defVol = availableVols.find((v: any) => v.isDefault);
            if (!defVol && availableVols.length > 0) {
              // Selection auto downgrade: pick the largest available volume if default is not available
              defVol = availableVols[availableVols.length - 1]; 
            }
            
            if (defVol) initialSub[slot.id] = defVol.id; // subSelections = typeVolumeId
            else if (defTypeOpt.volumes?.length > 0) initialSub[slot.id] = defTypeOpt.volumes[0].id;
          }
          return;
        }
        // Legacy slot
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

  useEffect(() => {
    applyDefaults();
  }, [drinkDetail]);

  const currentSelectionsArray = useMemo(() => {
    if (!drinkDetail) return [];
    return Object.entries(selections).map(([slotIdStr, selectionVal]) => {
      const slotId = parseInt(slotIdStr);
      const slot = (drinkDetail.slots as any[]).find(s => s.id === slotId);
      if (!slot) return null;
      // Typed slot — send slotId + typeVolumeId + ingredientTypeId
      if (slot.slotStyle === "typed") {
        const typeVolumeId = subSelections[slotId];
        const ingredientTypeId = selectionVal;
        return { slotId: slot.id, ingredientTypeId, typeVolumeId: typeVolumeId || undefined };
      }
      // Legacy slot
      const optionId = selectionVal;
      const option = slot.ingredient?.options?.find((o: any) => o.id === optionId);
      const subOptionId = option?.linkedIngredientId ? (subSelections[slotId] ?? undefined) : undefined;
      return { ingredientId: slot.ingredientId || 0, optionId, subOptionId };
    }).filter((s): s is NonNullable<typeof s> => s !== null && ('typeVolumeId' in s || (s as any).ingredientId > 0));
  }, [selections, subSelections, drinkDetail]);

  const { mutate: calculatePrice, data: priceBreakdown, isPending: isCalculating } = useCalculateDrinkPrice();
  const calcRef = useRef(calculatePrice);
  calcRef.current = calculatePrice;

  // displayPrice instantly reflects the pre-calculated default price from the server,
  // then updates once the actual breakdown comes in.
  const displayPrice = useMemo(() => {
    if (priceBreakdown?.total !== undefined) return priceBreakdown.total;
    if (activeDrink) return (activeDrink as any).defaultPrice ?? activeDrink.basePrice ?? 0;
    return 0;
  }, [priceBreakdown?.total, activeDrink]);

  const [simulatorLayers, setSimulatorLayers] = useState<CupLayer[]>([]);

  useEffect(() => {
    if (priceBreakdown?.extras && Array.isArray(priceBreakdown.extras)) {
      const CATEGORY_DEFAULTS: Record<string, string> = {
        coffee: "#4b2c20",
        milk: "#fdf5e6",
        syrup: "#d4a373",
        sauce: "#7f4f24",
        sweetener: "#ffffff",
        topping: "#fb8500",
        other: "#9ca3af"
      };

      const newLayers: CupLayer[] = (priceBreakdown.extras || [])
        .filter((ext: any) => ext.producedQty >= 0) // Include zero/near-zero to prevent disappear
        .map((ext: any) => {
          // Better category inference
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
            volume: Math.max(0, ext.producedQty || 0), // Ensure non-negative
            color: ext.color,
            category: inferredCategory,
          };
        });
      setSimulatorLayers(newLayers);
    }
  }, [priceBreakdown]);

  useEffect(() => {
    if (activeDrink && currentSelectionsArray.length > 0) {
      calcRef.current(
        { 
          id: activeDrink.id, 
          data: { 
            branchId: selectedBranchId || undefined,
            selections: currentSelectionsArray 
          } 
        },
        { onError: () => { } }
      );
    }
  }, [activeDrink, currentSelectionsArray]);

  const handleSelectDrink = (drink: Drink) => {
    if (drink.isCustomizable === false) {
      // Finished Good: add directly to cart with default options
      // We can use the defaultPrice that was pre-computed by the server
      setCart(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        drinkId: drink.id,
        drinkName: drink.name,
        quantity: 1,
        basePrice: drink.basePrice,
        totalPrice: (drink as any).defaultPrice ?? drink.basePrice,
        selections: [], // Empty selections = use defaults on server
        specialNotes: undefined,
      }]);
      setIsCartOpen(true);
      toast({ title: "Added to cart", description: `${drink.name} added.` });
    } else {
      setActiveDrink(drink);
      setIsCustomizing(true);
    }
  };

  const handleCloseCustomization = () => {
    setIsCustomizing(false);
    setActiveDrink(null);
    setSelections({});
    setSubSelections({});
    setSimulatorLayers([]);
    setNotes("");
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === "percentage") {
      const beforeTax = cartSubtotal / 1.14;
      return (beforeTax * appliedDiscount.value) / 100;
    }
    return appliedDiscount.value;
  }, [appliedDiscount, cartSubtotal]);

  const cartTotal = cartSubtotal - discountAmount;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = () => {
    if (!activeDrink || !drinkDetail || !priceBreakdown) return;

    const formattedSelections = Object.entries(selections).map(([slotIdStr, selectionVal]) => {
      const slotId = parseInt(slotIdStr);
      const slot = (drinkDetail.slots as any[]).find(s => s.id === slotId);
      if (!slot) return null;

      // Typed (catalog) slot — two-level: type option + volume
      if (slot.slotStyle === "typed") {
        const selectedTypeId = selectionVal; // selections[slotId] = ingredientTypeId
        const typeVolumeId = subSelections[slotId];
        const typeOptions: any[] = slot.typeOptions ?? [];
        const typeOpt = typeOptions.find((to: any) => to.ingredientTypeId === selectedTypeId);
        const vol = typeOpt?.volumes?.find((v: any) => v.id === typeVolumeId);
        const extra = (priceBreakdown as any).extras?.find((e: any) => e.slotLabel === slot.slotLabel);
        const typePart = typeOpt?.typeName ?? "";
        const volPart = vol?.volumeName ? ` · ${vol.volumeName}` : "";
        return {
          ingredientId: 0,
          optionId: 0,
          subOptionId: undefined,
          slotId: slot.id,
          typeVolumeId,
          ingredientTypeId: selectedTypeId,
          optionLabel: `${typePart}${volPart}`.trim() || "",
          slotLabel: slot.slotLabel,
          extraCost: extra?.extraCost ?? vol?.extraCost ?? 0,
        };
      }

      // Legacy slot
      const optionId = selectionVal;
      const option = slot.ingredient?.options?.find((o: any) => o.id === optionId);
      const subOptionId = option?.linkedIngredientId ? (subSelections[slotId] ?? undefined) : undefined;
      const effectiveIngredientId = option?.linkedIngredientId ?? slot.ingredientId ?? 0;
      const extra = priceBreakdown.extras.find((e: any) => e.ingredientId === effectiveIngredientId && e.slotLabel === slot.slotLabel);

      let optionLabel = option?.label || "";
      if (subOptionId && option?.linkedIngredient) {
        const subOpt = option.linkedIngredient.options.find((o: any) => o.id === subOptionId);
        if (subOpt) optionLabel = `${option.label} · ${subOpt.label}`;
      }

      return {
        ingredientId: slot.ingredientId,
        optionId,
        subOptionId,
        optionLabel,
        slotLabel: slot.slotLabel,
        extraCost: extra?.extraCost || 0,
      };
    }).filter((s): s is NonNullable<typeof s> => s !== null);

    setCart(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      drinkId: activeDrink.id,
      drinkName: activeDrink.name,
      quantity: 1,
      basePrice: priceBreakdown.basePrice,
      totalPrice: priceBreakdown.total,
      selections: formattedSelections,
      specialNotes: notes || undefined,
    }]);

    handleCloseCustomization();
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "wallet" | "hospitality">("card");
  const [adminPin, setAdminPin] = useState("");
  const [amountTendered, setAmountTendered] = useState("");

  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsValidatingDiscount(true);
    try {
      const res = await fetch(`${API_BASE}/discounts/validate/${discountCode.trim().toUpperCase()}`);
      if (!res.ok) {
        toast({ variant: "destructive", title: "Invalid coupon code" });
        setAppliedDiscount(null);
        return;
      }
      const discount = await res.json();
      setAppliedDiscount(discount);
      toast({ title: "Coupon applied!" });
    } catch {
      toast({ variant: "destructive", title: "Error validating coupon" });
    } finally {
      setIsValidatingDiscount(false);
    }
  };


  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Order Created", description: `Order #${data.orderNumber} sent for cashier approval.` });
        setCart([]);
        setAppliedDiscount(null);
        setDiscountCode("");
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        setCustomerName("");
        setAmountTendered("");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to create order." });
      },
    },
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createOrder({
      data: {
        branchId: selectedBranchId || undefined,
        customerName: customerName || undefined,
        paymentMethod,
        amountTendered: paymentMethod === "cash" && amountTendered ? parseFloat(amountTendered) : undefined,
        adminPin: paymentMethod === "hospitality" ? adminPin : undefined,
        discountCode: appliedDiscount?.code,
        items: cart.map(item => ({
          drinkId: item.drinkId,
          quantity: item.quantity,
          specialNotes: item.specialNotes,
          selections: item.selections.map(s => ({
            ingredientId: s.ingredientId || undefined,
            optionId: s.optionId || undefined,
            subOptionId: s.subOptionId || undefined,
            slotId: s.slotId || undefined,
            typeVolumeId: s.typeVolumeId || undefined,
            ingredientTypeId: s.ingredientTypeId || undefined,
          })),
        })),
      },
    });
  };

  const gridClass = user?.role === "frontdesk"
    ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-6"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6";

  const { customer: loggedCustomer } = useCustomerAuth();

  return (
    <div className="flex flex-col h-full w-full bg-muted/20 overflow-hidden">

      {/* Top bar: category tabs + cart button */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-background border-b shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Mobile Categories Menu */}
          <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shrink-0 h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Categories</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-2">
                  <Button
                    variant={selectedCategoryId === null ? "default" : "ghost"}
                    onClick={() => handleCategoryChange(null)}
                    className="justify-start font-bold h-12"
                  >
                    All Drinks
                  </Button>
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      variant={selectedCategoryId === cat.id ? "default" : "ghost"}
                      onClick={() => handleCategoryChange(cat.id)}
                      className="justify-start font-bold h-12 capitalize"
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Categories Tabs */}
          <div className="hidden lg:flex flex-1 gap-2 overflow-x-auto no-scrollbar">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => handleCategoryChange(null)}
              className="rounded-full whitespace-nowrap shrink-0"
              size="sm"
            >
              All Drinks
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                onClick={() => handleCategoryChange(cat.id)}
                className="rounded-full whitespace-nowrap shrink-0 capitalize"
                size="sm"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 lg:w-64 lg:flex-initial mx-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-9 rounded-full bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/40 text-sm w-full"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Customer login/profile button */}
          <Link href={loggedCustomer ? "/customer/profile" : "/customer/auth"}>
            <button className="shrink-0 flex items-center gap-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 rounded-full px-3 py-2 text-sm font-medium transition-colors h-9">
              <User className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline max-w-[90px] truncate">
                {loggedCustomer ? loggedCustomer.name.split(" ")[0] : "Sign In"}
              </span>
            </button>
          </Link>

          {/* Cart toggle button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative shrink-0 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-3 sm:px-4 py-2 font-semibold shadow-md hover:bg-primary/90 transition-colors h-9"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">{fmt(cartTotal)}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Drink Grid — full width */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        {isLoadingDrinks ? (
          <div className={gridClass}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted/40 animate-pulse rounded-lg border border-white/5" />
            ))}
          </div>
        ) : filteredDrinks.length > 0 ? (
          <div className="space-y-8" key={selectedCategoryId ?? "all"}>
            {groupedDrinks.map(group => (
              <div key={`${selectedCategoryId ?? "all"}-${group.label || "__singles__"}`}>
                {group.label && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">{group.label}</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
                  </div>
                )}
                <div className={gridClass}>
                  {group.drinks.map(drink => (
                    <DrinkCard key={drink.id} drink={drink} variant="pos" onClick={() => handleSelectDrink(drink)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Search className="h-12 w-12 opacity-10 mb-4" />
            <p className="text-lg font-medium">No drinks found</p>
            <p className="text-sm">Try a different category or search term.</p>
          </div>
        )}
      </ScrollArea>

      {/* Cart Slide-in Overlay */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setIsCartOpen(false)}
        />
        {/* Cart panel */}
        <div
          className={`fixed top-0 right-0 h-full w-[340px] max-w-[90vw] bg-card shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b bg-muted/30 shrink-0">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Order
              {cartCount > 0 && (
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-md hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <ScrollArea className="flex-1 p-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center space-y-3 p-6">
                <ShoppingCart className="h-10 w-10 opacity-20" />
                <p className="font-medium">No items yet</p>
                <p className="text-sm">Tap a drink to add it to your order.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="p-3 border rounded-lg bg-background shadow-sm">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-bold text-sm leading-tight pr-2 capitalize">{item.drinkName}</span>
                      <span className="font-bold text-sm shrink-0">{fmt(item.totalPrice * item.quantity)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
                      {item.selections
                        .filter(s => s.optionLabel?.toLowerCase() !== "none")
                        .map(s => (
                        <div key={s.slotLabel} className="flex justify-between">
                          <span><span className="text-muted-foreground/60">{s.slotLabel}:</span> {s.optionLabel}</span>
                          {s.extraCost > 0 && <span>+{fmt(s.extraCost)}</span>}
                        </div>
                      ))}
                      {item.specialNotes && (
                        <div className="italic text-primary/80">"{item.specialNotes}"</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateCartQuantity(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center font-bold text-sm">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateCartQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t bg-muted/30 shrink-0 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{fmt(cartTotal)}</span>
            </div>
            <Button
              className="w-full h-12 text-base font-bold shadow-md flex items-center gap-2"
              disabled={cart.length === 0}
              onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
            >
              Checkout <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </>

      {/* Customization Dialog */}
      <Dialog open={isCustomizing} onOpenChange={(open) => { if (!open) handleCloseCustomization(); }}>
        <DialogContent className="sm:max-w-[420px] max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-5 border-b shrink-0 flex-row items-center gap-4">
            <div className="flex-1 min-w-0 pb-1">
              <DialogTitle className="text-xl truncate mb-1 capitalize">{activeDrink?.name}</DialogTitle>
              {drinkDetail?.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 leading-tight">
                  {drinkDetail.description}
                </p>
              )}
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-bold text-primary transition-opacity ${isCalculating ? "opacity-60" : "opacity-100"}`}>
                  {fmt(displayPrice)}
                </div>
                {drinkDetail && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={applyDefaults}
                    className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
            {drinkDetail && (
              <div className="w-24 h-32 shrink-0 pr-6 mr-2">
                <CupSimulator 
                  cupSizeMl={drinkDetail.cupSizeMl || 0}
                  layers={simulatorLayers}
                  className="mb-2"
                />
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            {isLoadingDrinkDetail ? (
              <div className="space-y-4">
                <div className="h-20 bg-muted animate-pulse rounded-md" />
                <div className="h-20 bg-muted animate-pulse rounded-md" />
              </div>
            ) : (
              <div className="space-y-5">
                {(drinkDetail?.slots as any[])
                  ?.filter(s => (s.customerSortOrder ?? s.sortOrder ?? 1) > 0)
                  ?.sort((a, b) => (a.customerSortOrder ?? a.sortOrder ?? 1) - (b.customerSortOrder ?? b.sortOrder ?? 1))
                  ?.map(slot => {
                  // ── Typed (catalog) slot: two-level — type option → volume ──
                  if (slot.slotStyle === "typed") {
                    const typeOptions: any[] = slot.typeOptions ?? [];
                    const selectedTypeId = selections[slot.id];
                    const activeTypeOpt = typeOptions.find((to: any) => to.ingredientTypeId === selectedTypeId) ?? typeOptions[0];
                    const activeVolumes: any[] = activeTypeOpt?.volumes ?? [];
                    const multiType = typeOptions.length > 1;

                    return (
                      <div key={slot.id} className="space-y-3 p-3 rounded-xl border-2 border-primary/15 bg-muted/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:bg-muted/5">
                        <div className="flex items-center gap-2">
                          <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-primary/70 flex items-center gap-2">
                            <span>{slot.slotLabel}</span>
                            {activeTypeOpt?.pricingMode === "unit" && (
                              <Badge variant="outline" className="h-4 px-1 text-[8px] border-primary/20 bg-primary/5 text-primary font-black tracking-widest uppercase">
                                Fixed Price
                              </Badge>
                            )}
                            {(() => {
                              const typeOptions: any[] = slot.typeOptions ?? [];
                              const defTypeOpt = typeOptions.find((to: any) => to.isDefault) ?? typeOptions[0];
                              const defVol = defTypeOpt?.volumes?.find((v: any) => v.isDefault) ?? defTypeOpt?.volumes?.[0];
                              const defaultLabel = defTypeOpt ? `${defTypeOpt.typeName}${defVol?.volumeName ? ` · ${defVol.volumeName}` : ""}` : "";
                              return defaultLabel && (
                                <span className="normal-case font-medium text-[9px] text-muted-foreground/60 tracking-normal italic">
                                  (Default: {defaultLabel})
                                </span>
                              );
                            })()}
                          </Label>
                          <div className="flex-1 h-px bg-gradient-to-r from-primary/10 to-transparent" />
                        </div>

                        {/* Level 1: Type option buttons (only shown if more than one type) */}
                        {multiType && (
                          <div className="grid grid-cols-3 gap-1">
                            {typeOptions.map((typeOpt: any) => {
                              const isOutOfStock = !allowNoStockSell && !typeOpt.isAvailable;
                              return (
                                <button
                                  key={typeOpt.ingredientTypeId}
                                  disabled={isOutOfStock}
                                  onClick={() => {
                                    setSelections(prev => ({ ...prev, [slot.id]: typeOpt.ingredientTypeId }));
                                    const stock = typeOpt.stockQuantity ?? 0;
                                    const availableVols = (typeOpt.volumes ?? []).filter((v: any) => allowNoStockSell || stock >= (v.processedQty || 0));
                                    const defVol = availableVols.find((v: any) => v.isDefault) ?? availableVols[availableVols.length - 1] ?? typeOpt.volumes?.[0];
                                    setSubSelections(prev => {
                                      const next = { ...prev };
                                      if (defVol) next[slot.id] = defVol.id;
                                      else delete next[slot.id];
                                      return next;
                                    });
                                  }}
                                  className={`px-2 py-1.5 rounded-md border text-left transition-all text-[11px] ${selectedTypeId === typeOpt.ingredientTypeId
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : "bg-background border-border hover:border-primary/50"
                                    } ${isOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                                >
                                  <div className="font-semibold truncate">{typeOpt.typeName}</div>
                                  {isOutOfStock && <div className="text-[9px] font-bold text-destructive uppercase">Out of Stock</div>}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Level 1.5: Status text for single type slots */}
                        {!multiType && activeTypeOpt && (
                          <div className="text-sm font-semibold text-primary/80 mb-1 px-1">
                            {activeTypeOpt.typeName}
                          </div>
                        )}

                        {/* Level 2: Volume buttons for the selected type */}
                        <div className={multiType ? "pl-3 border-l-2 border-primary/30" : ""}>
                          {multiType && (
                            <div className="text-xs text-muted-foreground mb-1.5 font-medium">Volume</div>
                          )}
                          <div className="grid grid-cols-3 gap-1">
                            {activeVolumes.map((vol: any) => {
                              const isVolOutOfStock = !allowNoStockSell && !vol.isAvailable;
                              return (
                                <button
                                  key={vol.id}
                                  disabled={isVolOutOfStock}
                                  onClick={() => setSubSelections(prev => ({ ...prev, [slot.id]: vol.id }))}
                                  className={`px-2 py-1.5 rounded-md border text-left transition-all text-[11px] ${subSelections[slot.id] === vol.id
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : "bg-background border-border hover:border-primary/50"
                                    } ${isVolOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                                >
                                  <div className="font-semibold truncate">{vol.volumeName}</div>
                                  {isVolOutOfStock ? (
                                    <div className="text-[9px] font-bold text-destructive uppercase">No Stock</div>
                                  ) : vol.extraCost > 0 && (
                                    <div className={`text-[10px] mt-0.5 ${subSelections[slot.id] === vol.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                      +{fmt(vol.extraCost)}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // ── Legacy slot: show ingredient options ───────────────────
                  const options: any[] = slot.ingredient?.options ?? [];
                  const isLinked = options.some(o => o.linkedIngredientId);
                  const selectedTypeOpt = isLinked ? options.find(o => o.id === selections[slot.id]) : null;
                  const subOptions: any[] = selectedTypeOpt?.linkedIngredient?.options ?? [];

                  return (
                    <div key={slot.id} className="space-y-3 p-3 rounded-xl border-2 border-primary/15 bg-muted/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:bg-muted/5">
                      <div className="flex items-center gap-2">
                        <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-primary/70 flex items-center gap-2">
                          <span>{slot.slotLabel}</span>
                          {(() => {
                            const options: any[] = slot.ingredient?.options ?? [];
                            const defOpt = options.find((o: any) => o.id === slot.defaultOptionId) || options[0];
                            return defOpt && (
                              <span className="normal-case font-medium text-[9px] text-muted-foreground/60 tracking-normal italic">
                                (Default: {defOpt.label})
                              </span>
                            );
                          })()}
                        </Label>
                        <div className="flex-1 h-px bg-gradient-to-r from-primary/10 to-transparent" />
                      </div>

                      {/* Type picker (or regular option picker) */}
                      <div className="grid grid-cols-3 gap-1">
                        {options.map(option => {
                          const isOutOfStock = !allowNoStockSell && !option.isAvailable;
                          return (
                            <button
                              key={option.id}
                              disabled={isOutOfStock}
                              onClick={() => {
                                setSelections(prev => ({ ...prev, [slot.id]: option.id }));
                                // Auto-select first sub-option of newly selected type
                                if (option.linkedIngredient?.options?.length) {
                                  const subOpts = option.linkedIngredient.options;
                                  const subStock = option.linkedIngredient.stockQuantity ?? 0;
                                  const availableSub = allowNoStockSell ? subOpts : subOpts.filter((so: any) => subStock >= (so.processedQty || 0));
                                  const defSub = availableSub.find((o: any) => o.isDefault) || availableSub[0] || subOpts[0];
                                  setSubSelections(prev => ({ ...prev, [slot.id]: defSub.id }));
                                } else {
                                  setSubSelections(prev => {
                                    const next = { ...prev };
                                    delete next[slot.id];
                                    return next;
                                  });
                                }
                              }}
                              className={`px-2 py-1.5 rounded-md border text-left transition-all text-[11px] ${selections[slot.id] === option.id
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-background border-border hover:border-primary/50"
                                } ${isOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                            >
                              <div className="font-semibold truncate">{option.label}</div>
                              {isOutOfStock ? (
                                <div className="text-[9px] font-bold text-destructive uppercase">No Stock</div>
                              ) : !isLinked && option.extraCost > 0 && (
                                <div className={`text-[10px] mt-0.5 ${selections[slot.id] === option.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                  +{fmt(option.extraCost)}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Sub-option picker — volume / size (shown when type has linked ingredient) */}
                      {isLinked && subOptions.length > 0 && (
                        <div className="mt-2.5 pl-3 border-l-2 border-primary/30">
                          <div className="text-xs text-muted-foreground mb-1.5 font-medium">Volume</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {subOptions.map(subOpt => {
                              const isSubOutOfStock = !allowNoStockSell && !subOpt.isAvailable;
                              return (
                                <button
                                  key={subOpt.id}
                                  disabled={isSubOutOfStock}
                                  onClick={() => setSubSelections(prev => ({ ...prev, [slot.id]: subOpt.id }))}
                                  className={`px-2 py-2 rounded-lg border text-center transition-all text-xs ${subSelections[slot.id] === subOpt.id
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : "bg-background border-border hover:border-primary/50"
                                    } ${isSubOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                                >
                                  <div className="font-medium leading-tight">{subOpt.label}</div>
                                  {isSubOutOfStock ? (
                                    <div className="text-[9px] font-bold text-destructive uppercase">No Stock</div>
                                  ) : subOpt.extraCost > 0 && (
                                    <div className={`text-xs mt-0.5 ${subSelections[slot.id] === subOpt.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                      +{fmt(subOpt.extraCost)}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Dynamic ingredient indicator */}
                {priceBreakdown?.dynamicInfo && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {priceBreakdown.dynamicInfo.ingredientName}
                      </span>
                      <span className="text-xs text-blue-500 ml-1.5">
                        ingredient added
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                      +{fmt(priceBreakdown.dynamicInfo.cost)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Special Notes
                  </Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g., Extra hot, no foam"
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 pt-3 border-t shrink-0">
            <Button
              className="w-full h-12 text-base font-bold shadow-md"
              onClick={handleAddToCart}
              disabled={isCalculating || isLoadingDrinkDetail}
            >
              <Plus className="mr-2 h-4 w-4" /> Add to Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Complete Order</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black tracking-widest text-[10px] uppercase">
                Sending to: {branches.find(b => b.id === selectedBranchId)?.name || "Default Branch"}
              </Badge>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer Name (Optional)</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Name for the order"
              />
            </div>
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-4 gap-2">
                {["cash", "card", "wallet", "hospitality"].map(method => (
                  <Button
                    key={method}
                    variant={paymentMethod === method ? "default" : "outline"}
                    onClick={() => {
                      setPaymentMethod(method as any);
                      if (method !== "hospitality") setAdminPin("");
                    }}
                    className="capitalize"
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </div>
            {paymentMethod === "hospitality" && (
              <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="adminPin" className="text-pink-600 font-bold">Admin Authorization PIN</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
                  <Input
                    id="adminPin"
                    type="password"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    placeholder="Enter Admin PIN"
                    className="pl-9 border-pink-200 focus-visible:ring-pink-500"
                  />
                </div>
              </div>
            )}
            {paymentMethod === "cash" && (
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount Tendered</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amountTendered}
                  onChange={e => setAmountTendered(e.target.value)}
                  placeholder={fmt(cartTotal)}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="coupon">Discount Coupon</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="coupon"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    placeholder="Enter code"
                    className="pl-9 font-mono font-bold uppercase"
                    disabled={!!appliedDiscount || isValidatingDiscount}
                  />
                </div>
                {appliedDiscount ? (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-destructive border-destructive/20 hover:bg-destructive/5"
                    onClick={() => { setAppliedDiscount(null); setDiscountCode(""); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    onClick={handleValidateDiscount}
                    disabled={!discountCode.trim() || isValidatingDiscount}
                  >
                    {isValidatingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              {appliedDiscount && (
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <Check className="h-3 w-3" /> 
                  Applied: {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `E£${fmt(appliedDiscount.value)}`} Off
                </p>
              )}
            </div>

            <div className="space-y-1.5 py-4 border-t border-b">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{fmt(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Discount
                  </span>
                  <span>-{fmt(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-lg">Total Due</span>
                <span className="font-bold text-2xl text-primary">{fmt(cartTotal)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} disabled={isCreatingOrder}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isCreatingOrder} className="min-w-[120px]">
              {isCreatingOrder ? "Processing..." : "Charge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anonymous Branch Picker Overlay */}
      {!user && !selectedBranchId && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full animate-pulse delay-700" />
          </div>

          <div className="relative z-10 w-full max-w-lg space-y-10 animate-in fade-in zoom-in duration-700">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 shadow-xl mb-4 group hover:scale-110 transition-transform duration-500">
                <Menu className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                Welcome to <span className="text-primary">Spacca</span>
              </h1>
              <p className="text-muted-foreground font-medium tracking-wide">Select your location to view the menu and order</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {isLoadingBranches ? (
                <>
                  <div className="h-32 rounded-3xl bg-muted animate-pulse border-2 border-primary/5" />
                  <div className="h-32 rounded-3xl bg-muted animate-pulse border-2 border-primary/5" />
                </>
              ) : branches.length > 0 ? (
                branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranchId(branch.id)}
                    className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-primary/10 bg-card hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-lg hover:shadow-primary/20 active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <Droplets className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-black uppercase tracking-tight">{branch.name}</span>
                    <div className="mt-2 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500 rounded-full" />
                  </button>
                ))
              ) : (
                <div className="col-span-full p-8 rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-muted/5">
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No active locations found</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Please check server connection or database seed</p>
                </div>
              )}
            </div>

            <div className="pt-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              Premium Digital Experience · v2.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


