import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useListDrinks,
  useGetDrink,
  useCalculateDrinkPrice,
  useCreateOrder,
  useListBranches,
  useGetActiveOffer,
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
import { Minus, Plus, ShoppingCart, Trash2, X, ChevronRight, Droplets, Search, Menu, RotateCcw, Ticket, Check, Loader2, Tag, User, Lock, ShoppingBag, Building2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt } from "@/lib/currency";
import { CupSimulator, type CupLayer } from "@/components/cup-simulator";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { Link } from "wouter";

// Modularized components
import { CartSidebar } from "@/components/pos/CartSidebar";
import { CustomizerDialog } from "@/components/pos/CustomizerDialog";
import { CheckoutDialog } from "@/components/pos/CheckoutDialog";
import { LoyaltyDialog } from "@/components/pos/LoyaltyDialog";

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

function usePartners() {
  return useQuery<any[]>({
    queryKey: ["pos-partners"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/partners`);
      if (!res.ok) throw new Error("Failed to fetch partners");
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
  ingredientsRequirement?: {
    ingredientId: number;
    name: string;
    consumedQty: number;
  }[];
};


function detectSubcategory(name: string): string {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);
  return words[words.length - 1] || "";
}

// Smart categorization disabled as per user request

const checkCartStock = (
  tempCart: CartItem[],
  ingredientsList: any[],
  allowNoStockSell: boolean
): { isValid: boolean; errorMsg?: string } => {
  if (allowNoStockSell) return { isValid: true };

  const requiredQty: Record<number, number> = {};
  const ingredientNames: Record<number, string> = {};

  for (const item of tempCart) {
    const requirements = item.ingredientsRequirement || [];
    for (const req of requirements) {
      if (req.ingredientId && req.consumedQty > 0) {
        requiredQty[req.ingredientId] = (requiredQty[req.ingredientId] || 0) + (req.consumedQty * item.quantity);
        ingredientNames[req.ingredientId] = req.name;
      }
    }
  }

  const insufficient: string[] = [];
  for (const [ingIdStr, reqQty] of Object.entries(requiredQty)) {
    const ingId = parseInt(ingIdStr);
    const ing = ingredientsList?.find(i => i.id === ingId);
    const stock = ing ? ing.stockQuantity : 0;
    if (reqQty > stock) {
      const name = ing ? ing.name : (ingredientNames[ingId] || `Ingredient #${ingId}`);
      insufficient.push(`${name} (Required: ${reqQty.toFixed(1)}, Available: ${stock.toFixed(1)})`);
    }
  }

  if (insufficient.length > 0) {
    return {
      isValid: false,
      errorMsg: `Insufficient stock for: ${insufficient.join(", ")}`,
    };
  }

  return { isValid: true };
};

export default function PosTerminal() {
  const { user, selectedBranchId, setSelectedBranchId } = useAuth();
  const { toast } = useToast();
  const { allowNoStockSell } = useSettings();

  const { data: branches = [], isLoading: isLoadingBranches } = useListBranches();
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const { data: partners = [] } = usePartners();
  
  const { data: drinks, isLoading: isLoadingDrinks } = useListDrinks({ 
    active: true, 
    branchId: selectedBranchId || undefined,
    partnerId: selectedPartnerId || undefined,
  } as any);
  const { data: allCategories = [] } = useDrinkCategories();
  const { data: activeOffer } = useGetActiveOffer({
    branchId: selectedBranchId || undefined,
    partnerId: selectedPartnerId || undefined,
  } as any);


  const { data: ingredients = [] } = useQuery<any[]>({
    queryKey: ["pos-ingredients", selectedBranchId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/ingredients?branchId=${selectedBranchId || ""}`);
      if (!res.ok) throw new Error("Failed to fetch ingredients");
      return res.json();
    },
    enabled: !!selectedBranchId,
  });

  const { data: productDiscounts = [] } = useQuery<any[]>({
    queryKey: ["pos-product-discounts", selectedBranchId, selectedPartnerId],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (selectedBranchId) q.set("branchId", String(selectedBranchId));
      if (selectedPartnerId) q.set("partnerId", String(selectedPartnerId));
      const res = await fetch(`${API_BASE}/product-discounts?${q.toString()}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Only show active categories that have the sort order from admin
  const categories = useMemo(() => {
    return allCategories.filter(c => c.isActive);
  }, [allCategories]);

  // selectedCategory is now a DrinkCategory id (number) or null for "All"
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Idle timer to clear category filters & search input after 1 minute of inactivity
  useEffect(() => {
    if (selectedCategoryId === null && !searchQuery.trim()) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSelectedCategoryId(null);
        setSearchQuery("");
      }, 60000); // 1 minute
    };

    resetTimer();

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    const handler = () => resetTimer();

    events.forEach(event => {
      window.addEventListener(event, handler);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, handler);
      });
    };
  }, [selectedCategoryId, searchQuery]);

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
            : typeOptions.filter(to => to.isAvailable);

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

  const [lastCalculatedPrice, setLastCalculatedPrice] = useState<number | null>(null);

  useEffect(() => {
    if (priceBreakdown?.total !== undefined) {
      setLastCalculatedPrice(priceBreakdown.total);
    }
  }, [priceBreakdown?.total]);

  // displayPrice instantly reflects the pre-calculated default price from the server,
  // then updates once the actual breakdown comes in.
  const displayPrice = useMemo(() => {
    if (priceBreakdown?.total !== undefined) return priceBreakdown.total;
    if (lastCalculatedPrice !== null) return lastCalculatedPrice;
    if (activeDrink) return (activeDrink as any).defaultPrice ?? activeDrink.basePrice ?? 0;
    return 0;
  }, [priceBreakdown?.total, lastCalculatedPrice, activeDrink]);

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
      const requirements: { ingredientId: number; name: string; consumedQty: number }[] = [];
      if (drink.cupIngredientId) {
        requirements.push({
          ingredientId: drink.cupIngredientId,
          name: "Cup/Glass",
          consumedQty: 1,
        });
      }

      const nextCartItem: CartItem = {
        id: Math.random().toString(36).substring(7),
        drinkId: drink.id,
        drinkName: drink.name,
        quantity: 1,
        basePrice: drink.basePrice,
        totalPrice: (drink as any).defaultPrice ?? drink.basePrice,
        selections: [], // Empty selections = use defaults on server
        specialNotes: undefined,
        ingredientsRequirement: requirements,
      };

      const testCart = [...cart, nextCartItem];
      const stockCheck = checkCartStock(testCart, ingredients, allowNoStockSell);
      if (!stockCheck.isValid) {
        toast({
          variant: "destructive",
          title: "Insufficient Stock",
          description: stockCheck.errorMsg,
        });
        return;
      }

      setCart(testCart);
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
    setLastCalculatedPrice(null);
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  // Auto-clear discount when cart is emptied to prevent accidental reuse for next customer
  useEffect(() => {
    if (cart.length === 0 && (discountCode || appliedDiscount)) {
      setDiscountCode("");
      setAppliedDiscount(null);
    }
  }, [cart.length, discountCode, appliedDiscount]);

  // Dynamically recalculate cart item pricing if branch/partner changes the base drink prices
  useEffect(() => {
    if (!drinks || drinks.length === 0 || cart.length === 0) return;
    setCart(prevCart => prevCart.map(item => {
      const updatedDrink = drinks.find(d => d.id === item.drinkId);
      if (!updatedDrink) return item;
      const basePrice = Number(updatedDrink.basePrice);
      const customizationsCost = item.selections.reduce((sum, sel) => sum + sel.extraCost, 0);
      const totalPrice = basePrice + customizationsCost;
      return {
        ...item,
        basePrice,
        totalPrice,
      };
    }));
  }, [drinks]);



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

    const ingredientsRequirement: { ingredientId: number; name: string; consumedQty: number }[] = [];

    // Add all customizations from priceBreakdown.extras
    if (priceBreakdown.extras && Array.isArray(priceBreakdown.extras)) {
      priceBreakdown.extras.forEach((ext: any) => {
        if (ext.ingredientId && ext.consumedQty > 0) {
          ingredientsRequirement.push({
            ingredientId: ext.ingredientId,
            name: ext.optionLabel || "Ingredient",
            consumedQty: ext.consumedQty,
          });
        }
      });
    }

    // Add dynamic info if present
    if (
      priceBreakdown.dynamicInfo && 
      priceBreakdown.dynamicInfo.ingredientId && 
      priceBreakdown.dynamicInfo.consumedQty !== undefined && 
      priceBreakdown.dynamicInfo.consumedQty > 0
    ) {
      ingredientsRequirement.push({
        ingredientId: priceBreakdown.dynamicInfo.ingredientId,
        name: priceBreakdown.dynamicInfo.ingredientName,
        consumedQty: priceBreakdown.dynamicInfo.consumedQty,
      });
    }

    const nextCartItem: CartItem = {
      id: Math.random().toString(36).substring(7),
      drinkId: activeDrink.id,
      drinkName: activeDrink.name,
      quantity: 1,
      basePrice: priceBreakdown.basePrice,
      totalPrice: priceBreakdown.total,
      selections: formattedSelections,
      specialNotes: notes || undefined,
      ingredientsRequirement,
    };

    const testCart = [...cart, nextCartItem];
    const stockCheck = checkCartStock(testCart, ingredients, allowNoStockSell);
    if (!stockCheck.isValid) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: stockCheck.errorMsg,
      });
      return;
    }

    setCart(testCart);
    handleCloseCustomization();
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    if (delta > 0) {
      const simulatedCart = cart.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      const stockCheck = checkCartStock(simulatedCart, ingredients, allowNoStockSell);
      if (!stockCheck.isValid) {
        toast({
          variant: "destructive",
          title: "Insufficient Stock",
          description: stockCheck.errorMsg,
        });
        return;
      }
    }
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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "wallet" | "hospitality" | "points">("cash");
  const [adminPin, setAdminPin] = useState("");
  const [amountTendered, setAmountTendered] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isLoyaltyDialogOpen, setIsLoyaltyDialogOpen] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<{ name: string; points: number } | null>(null);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  const offerCalculation = useMemo(() => {
    if (!activeOffer || cart.length === 0 || paymentMethod === "hospitality") {
      return { discount: 0, extraFreeCount: 0, isOfferApplied: false };
    }

    const offersList: any[] = Array.isArray(activeOffer) ? activeOffer : [activeOffer];
    if (offersList.length === 0) {
      return { discount: 0, extraFreeCount: 0, isOfferApplied: false };
    }

    let totalDiscount = 0;
    let totalExtraFreeCount = 0;

    for (const offerItem of offersList) {
      const N = offerItem.buyAmount;
      const X = offerItem.freeAmount;
      const applicableDrinkIds: number[] = (offerItem as any).applicableDrinkIds || [];
      const rewardDrinkIds: number[] = (offerItem as any).rewardDrinkIds || [];
      const excludedDrinkIds: number[] = (offerItem as any).excludedDrinkIds || [];

      const validCart = cart.filter(item => !excludedDrinkIds.includes(item.drinkId));
      if (validCart.length === 0) continue;

      const triggerItems = validCart.filter(item => 
        applicableDrinkIds.length === 0 || applicableDrinkIds.includes(item.drinkId)
      );

      const rewardItems = validCart.filter(item => 
        rewardDrinkIds.length === 0 || rewardDrinkIds.includes(item.drinkId)
      );

      const triggerQty = triggerItems.reduce((sum, item) => sum + item.quantity, 0);
      const isCrossList = applicableDrinkIds.length > 0 && rewardDrinkIds.length > 0 && 
        !applicableDrinkIds.some(id => rewardDrinkIds.includes(id));

      let F = 0;
      let extraFreeCount = 0;

      if (isCrossList) {
        const maxEarned = Math.floor(triggerQty / N) * X;
        const rewardQty = rewardItems.reduce((sum, item) => sum + item.quantity, 0);
        F = Math.min(maxEarned, rewardQty);
      } else {
        const flatTriggerPrices = triggerItems.flatMap(item => 
          Array.from({ length: item.quantity }).map(() => item.totalPrice)
        ).sort((a, b) => a - b);

        const M = flatTriggerPrices.length;
        F = Math.floor(M / (N + X)) * X + Math.min(X, Math.max(0, (M % (N + X)) - N));
        const P = M - F;
        const E = Math.floor(P / N) * X;
        extraFreeCount = rewardItems.length === 0 ? 0 : E - F;
      }

      if (F > 0 && rewardItems.length > 0) {
        const flatRewardPrices = rewardItems.flatMap(item => 
          Array.from({ length: item.quantity }).map(() => item.totalPrice)
        ).sort((a, b) => a - b);

        const discountCount = Math.min(F, flatRewardPrices.length);
        for (let i = 0; i < discountCount; i++) {
          totalDiscount += flatRewardPrices[i];
        }
      }

      totalExtraFreeCount += extraFreeCount;
    }

    return {
      discount: totalDiscount,
      extraFreeCount: totalExtraFreeCount,
      isOfferApplied: totalDiscount > 0,
    };
  }, [cart, activeOffer, paymentMethod]);

  const offerDiscount = offerCalculation.discount;
  const isOfferApplied = offerCalculation.isOfferApplied;

  // Clear discounts/coupons if hospitality is selected
  useEffect(() => {
    if (paymentMethod === "hospitality" && (appliedDiscount || discountCode)) {
      setAppliedDiscount(null);
      setDiscountCode("");
    }
  }, [paymentMethod, appliedDiscount, discountCode]);

  // Rule #5: when the order has an offer applied, discounts can not be accepted
  useEffect(() => {
    if (isOfferApplied && appliedDiscount) {
      setAppliedDiscount(null);
      setDiscountCode("");
      toast({
        title: "Coupon Cleared",
        description: "Coupons cannot be applied when a promotional offer is active.",
      });
    }
  }, [isOfferApplied, appliedDiscount, toast]);

  const discountAmount = useMemo(() => {
    if (isOfferApplied) return 0;
    if (cart.length === 0) return 0;

    let totalDiscount = 0;
    const orderCouponValue = appliedDiscount ? Number(appliedDiscount.value || 0) : 0;
    const orderCouponType = appliedDiscount?.type;

    cart.forEach(item => {
      const drinkId = item.drinkId;
      const allProductDiscs = (productDiscounts || []).filter((pd: any) => pd.drinkId === drinkId && pd.isActive);
      
      let matchedPd: any = null;
      if (selectedPartnerId && selectedBranchId) {
        matchedPd = allProductDiscs.find((pd: any) => pd.partnerId === selectedPartnerId && pd.branchId === selectedBranchId);
      }
      if (!matchedPd && selectedPartnerId) {
        matchedPd = allProductDiscs.find((pd: any) => pd.partnerId === selectedPartnerId && (!pd.branchId || pd.branchId === null));
      }
      if (!matchedPd && selectedBranchId) {
        matchedPd = allProductDiscs.find((pd: any) => pd.branchId === selectedBranchId && (!pd.partnerId || pd.partnerId === null));
      }
      if (!matchedPd) {
        matchedPd = allProductDiscs.find((pd: any) => (!pd.branchId || pd.branchId === null) && (!pd.partnerId || pd.partnerId === null));
      }

      let productDiscPerUnit = 0;
      if (matchedPd) {
        const val = Number(matchedPd.discountValue);
        if (matchedPd.discountType === "percentage") {
          productDiscPerUnit = (item.totalPrice * val) / 100;
        } else if (matchedPd.discountType === "fixed_amount") {
          productDiscPerUnit = Math.min(val, item.totalPrice);
        } else if (matchedPd.discountType === "fixed_price") {
          productDiscPerUnit = Math.max(0, item.totalPrice - val);
        }
      }

      let couponSharePerUnit = 0;
      if (appliedDiscount && orderCouponValue > 0) {
        if (orderCouponType === "percentage") {
          const beforeTax = item.totalPrice / 1.14;
          couponSharePerUnit = (beforeTax * orderCouponValue) / 100;
        } else if (orderCouponType === "fixed_per_item") {
          couponSharePerUnit = orderCouponValue;
        } else if (cartSubtotal > 0) {
          couponSharePerUnit = (item.totalPrice / cartSubtotal) * orderCouponValue;
        }
      }

      const bestUnitDiscount = Math.max(productDiscPerUnit, couponSharePerUnit);
      totalDiscount += bestUnitDiscount * item.quantity;
    });

    return Number(Math.min(totalDiscount, cartSubtotal).toFixed(2));
  }, [appliedDiscount, cartSubtotal, cart, isOfferApplied, productDiscounts, selectedBranchId, selectedPartnerId]);

  const cartTotal = isOfferApplied ? (cartSubtotal - offerDiscount) : (cartSubtotal - discountAmount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);


  const discountPercentage = appliedDiscount?.type === "percentage" ? appliedDiscount.value : (cartSubtotal > 0 ? (discountAmount / cartSubtotal) * 100 : 0);
  const isNameRequired = paymentMethod === "hospitality" || discountPercentage > 50;

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
      onSuccess: async (data) => {
        setCreatedOrder(data);
        if (customerPhone) {
          try {
            const res = await fetch(`${API_BASE}/customers/points/${customerPhone}`);
            if (res.ok) {
              const pointsData = await res.json();
              setLoyaltyPoints(pointsData.points);
            }
          } catch (e) {
            console.error("Failed to fetch loyalty points", e);
          }
          setIsLoyaltyDialogOpen(true);
        } else {
          toast({ title: "Order Created", description: `Order #${data.orderNumber} sent for cashier approval.` });
        }
        
        setCart([]);
        setAppliedDiscount(null);
        setDiscountCode("");
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        // We keep customerPhone and customerName until the loyalty dialog is closed or next order
        setAmountTendered("");
        setPaymentMethod("cash");
        setAdminPin("");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to create order." });
      },
    },
  });
  
  const handleSaveSignature = async (signatureData: string) => {
    if (!createdOrder) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${createdOrder.id}/signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData }),
      });
      if (res.ok) {
        toast({ title: "Signature Saved", description: "Thank you!" });
        setIsLoyaltyDialogOpen(false);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerInfo(null);
        setCreatedOrder(null);
      } else {
        throw new Error("Failed to save signature");
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save signature." });
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Validation for >50% discount or Hospitality
    if (isNameRequired && !customerName.trim()) {
      toast({
        variant: "destructive",
        title: "Customer Name Required",
        description: `Please enter customer name for ${paymentMethod === "hospitality" ? "Hospitality" : "high discount"} orders.`
      });
      return;
    }

    if (customerPhone.trim()) {
      const phoneVal = customerPhone.trim();
      const isEgLocal = /^01[0125][0-9]{8}$/.test(phoneVal);
      const isEgIntl = /^(?:\+20|20)1[0125][0-9]{8}$/.test(phoneVal);
      if (!isEgLocal && !isEgIntl) {
        toast({
          variant: "destructive",
          title: "Invalid Phone Number",
          description: "Please enter a valid Egyptian mobile number (e.g. 010xxxxxxxx or +201xxxxxxxxx)."
        });
        return;
      }
    }

    createOrder({
      data: {
        branchId: selectedBranchId || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
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
        source: "pos",
        partnerId: selectedPartnerId || undefined,
      } as any,
    });
  };

  const gridClass = user?.role === "frontdesk"
    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6";

  const { customer: loggedCustomer } = useCustomerAuth();

  const [loggedCustomerDiscounts, setLoggedCustomerDiscounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchLoggedCustomerDiscounts = async () => {
      if (!loggedCustomer) {
        setLoggedCustomerDiscounts([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/customers/available-discounts`);
        if (res.ok) {
          const data = await res.json();
          setLoggedCustomerDiscounts(data.discounts || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLoggedCustomerDiscounts();
  }, [loggedCustomer]);

  // Auto-apply customer discount and fetch loyalty details
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      const targetPhone = customerPhone.trim();
      if (!targetPhone) {
        setCustomerInfo(null);
        setAppliedDiscount(null);
        setDiscountCode("");
        return;
      }
      try {
        // 1. Fetch points & name
        const pointsRes = await fetch(`${API_BASE}/customers/points/${encodeURIComponent(targetPhone)}`);
        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          if (pointsData.name) {
            setCustomerInfo({ name: pointsData.name, points: pointsData.points });
            // Auto-populate customer name if blank or generic
            setCustomerName(prev => !prev || prev === "Walk-in Guest" || prev === "Walk-in" ? pointsData.name : prev);
          } else {
            setCustomerInfo(null);
          }
        } else {
          setCustomerInfo(null);
        }

        // 2. Fetch available discounts
        const res = await fetch(`${API_BASE}/customers/available-discounts?phone=${encodeURIComponent(targetPhone)}`);
        if (res.ok) {
          const data = await res.json();
          const list = data.discounts || [];
          if (list.length > 0) {
            // Find the best discount
            let best = list[0];
            let maxSavings = 0;
            for (const d of list) {
              const savings = d.type === "percentage" ? (cartSubtotal * d.value) / 100 : d.value;
              if (savings > maxSavings) {
                maxSavings = savings;
                best = d;
              }
            }
            setAppliedDiscount(best);
            setDiscountCode(best.code);
          } else {
            setAppliedDiscount(null);
            setDiscountCode("");
          }
        } else {
          setAppliedDiscount(null);
          setDiscountCode("");
        }
      } catch (e) {
        console.error("Failed to fetch customer discounts/points", e);
      }
    };

    fetchCustomerDetails();
  }, [customerPhone, cartSubtotal]);

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

          {/* Order Channel Selector */}
          <div className="w-36 sm:w-44 shrink-0">
            <Select
              value={selectedPartnerId ? String(selectedPartnerId) : "pos"}
              onValueChange={(val) => {
                if (val === "pos") {
                  setSelectedPartnerId(null);
                } else {
                  setSelectedPartnerId(parseInt(val));
                }
              }}
            >
              <SelectTrigger className="h-9 rounded-full bg-stone-800 border border-stone-600 text-stone-200 text-xs font-bold gap-2">
                <ShoppingBag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <SelectValue placeholder="Channel: POS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pos" className="font-bold text-xs">Store POS</SelectItem>
                {partners.filter((p: any) => p.isActive).map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)} className="font-bold text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onClearCart={() => setCart([])}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          if (loggedCustomer) {
            setCustomerName((prev) => prev || loggedCustomer.name);
            setCustomerPhone((prev) => prev || loggedCustomer.phone);
          }
          setIsCheckoutOpen(true);
        }}
        availableDiscounts={loggedCustomerDiscounts}
        extraFreeCount={offerCalculation.extraFreeCount}
        offerDiscount={offerDiscount}
        offerName={activeOffer?.name}
        discountAmount={discountAmount}
      />


      <CustomizerDialog
        isOpen={isCustomizing}
        activeDrink={activeDrink}
        drinkDetail={drinkDetail}
        isLoadingDrinkDetail={isLoadingDrinkDetail}
        selections={selections}
        subSelections={subSelections}
        notes={notes}
        setSelections={setSelections}
        setSubSelections={setSubSelections}
        setNotes={setNotes}
        displayPrice={displayPrice}
        priceBreakdown={priceBreakdown}
        isCalculating={isCalculating}
        simulatorLayers={simulatorLayers}
        allowNoStockSell={allowNoStockSell}
        onReset={applyDefaults}
        onClose={handleCloseCustomization}
        onAddToCart={handleAddToCart}
      />

      {/* Checkout Dialog */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        branches={branches}
        selectedBranchId={selectedBranchId}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        customerInfo={customerInfo}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        adminPin={adminPin}
        setAdminPin={setAdminPin}
        amountTendered={amountTendered}
        setAmountTendered={setAmountTendered}
        discountCode={discountCode}
        setDiscountCode={setDiscountCode}
        appliedDiscount={appliedDiscount}
        setAppliedDiscount={setAppliedDiscount}
        isValidatingDiscount={isValidatingDiscount}
        onValidateDiscount={handleValidateDiscount}
        isNameRequired={isNameRequired}
        cartSubtotal={cartSubtotal}
        discountAmount={discountAmount}
        offerDiscount={offerDiscount}
        offerName={activeOffer?.name}
        isOfferApplied={isOfferApplied}
        cartTotal={cartTotal}
        isCreatingOrder={isCreatingOrder}
        onSubmitCheckout={handleCheckout}
      />


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

      <LoyaltyDialog
        isOpen={isLoyaltyDialogOpen}
        onClose={() => {
          setIsLoyaltyDialogOpen(false);
          setCustomerName("");
          setCustomerPhone("");
          setCustomerInfo(null);
          setCreatedOrder(null);
        }}
        loyaltyPoints={loyaltyPoints}
        createdOrder={createdOrder}
        onSaveSignature={handleSaveSignature}
      />
    </div>
  );
}


