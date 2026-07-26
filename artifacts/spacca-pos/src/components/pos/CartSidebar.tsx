import React from "react";
import { ShoppingCart, Trash2, X, Minus, Plus, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fmt } from "@/lib/currency";

export type CartItem = {
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

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  onClearCart: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  availableDiscounts?: any[];
  extraFreeCount?: number;
  offerDiscount?: number;
  offerName?: string;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  cart,
  cartCount,
  cartTotal,
  onClearCart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  availableDiscounts = [],
  extraFreeCount = 0,
  offerDiscount = 0,
  offerName = "Promo Offer",
}) => {

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      {/* Cart panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] max-w-[90vw] bg-card shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
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
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
                onClick={() => {
                  if (confirm("Clear all items from cart?")) {
                    onClearCart();
                  }
                }}
                title="Clear Cart"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
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
              {cart.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg bg-background shadow-sm">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-bold text-sm leading-tight pr-2 capitalize">{item.drinkName}</span>
                    <span className="font-bold text-sm shrink-0">{fmt(item.totalPrice * item.quantity)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
                    {item.selections
                      .filter((s) => s.optionLabel?.toLowerCase() !== "none")
                      .map((s) => (
                        <div key={s.slotLabel} className="flex justify-between">
                          <span>
                            <span className="text-muted-foreground/60">{s.slotLabel}:</span> {s.optionLabel}
                          </span>
                          {s.extraCost > 0 && <span>+{fmt(s.extraCost)}</span>}
                        </div>
                      ))}
                    {item.specialNotes && (
                      <div className="italic text-primary/80">"{item.specialNotes}"</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center font-bold text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
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
          {extraFreeCount > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 p-2.5 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 font-semibold space-y-1 animate-pulse">
              <div className="font-bold flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-emerald-500 animate-bounce" /> Extra Free Drink Available!
              </div>
              <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">
                You qualify for <span className="font-bold text-sm">{extraFreeCount}</span> more free drink(s). Add them to your cart!
              </div>
            </div>
          )}
          {offerDiscount > 0 && (
            <div className="flex justify-between items-center text-xs text-destructive font-bold bg-destructive/5 p-2 rounded-lg border border-destructive/15">
              <span className="flex items-center gap-1 capitalize">
                <Tag className="h-3.5 w-3.5 text-destructive" /> Offer: {offerName}
              </span>
              <span>-{fmt(offerDiscount)}</span>
            </div>
          )}
          {availableDiscounts.length > 0 && offerDiscount === 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 p-2.5 rounded-lg text-xs text-amber-800 dark:text-amber-200 font-semibold space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-amber-500" /> Customer Discount Available!
              </div>
              <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                {availableDiscounts[0].reason}: <span className="font-bold">{availableDiscounts[0].code}</span> ({availableDiscounts[0].type === 'percentage' ? `${availableDiscounts[0].value}%` : `${fmt(availableDiscounts[0].value)}${availableDiscounts[0].type === 'fixed_per_item' ? '/item' : ''}`} Off) will apply at checkout.
              </div>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{fmt(cartTotal)}</span>
          </div>

          <Button
            className="w-full h-12 text-base font-bold shadow-md flex items-center gap-2"
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            Checkout <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </>
  );
};
