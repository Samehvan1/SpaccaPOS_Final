import { Coffee, Tag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Drink } from "@workspace/api-client-react";
import { useSettings } from "@/hooks/use-settings";
import { fmt } from "@/lib/currency";

interface DrinkCardProps {
  drink: Drink;
  onClick: () => void;
  variant: "pos" | "kiosk";
}

export function DrinkCard({ drink, onClick, variant }: DrinkCardProps) {
  const { allowNoStockSell } = useSettings();
  const imageUrl = (drink as any).imageUrl as string | null | undefined;
  const isAvailable = (drink as any).isAvailable !== false;
  const unavailableReasons = (drink as any).unavailableReasons as string[] | undefined;
  const showOutOfStock = !isAvailable && !allowNoStockSell;
  const tooltipText = showOutOfStock && unavailableReasons?.length 
    ? `Missing: ${unavailableReasons.join(", ")}` 
    : undefined;

  const productDiscount = (drink as any).productDiscount;
  const promoLabel = (drink as any).promoLabel as string | null | undefined;

  let discountBadgeText: string | null = null;
  if (productDiscount && productDiscount.discountValue > 0) {
    if (productDiscount.discountType === "percentage") {
      discountBadgeText = `${productDiscount.discountValue}% OFF`;
    } else if (productDiscount.discountType === "fixed_amount") {
      discountBadgeText = `-${fmt(productDiscount.discountValue)}`;
    } else if (productDiscount.discountType === "fixed_price") {
      discountBadgeText = `Special ${fmt(productDiscount.discountValue)}`;
    }
  }

  if (variant === "pos") {
    return (
      <button
        onClick={onClick}
        disabled={showOutOfStock}
        title={tooltipText}
        className={`flex flex-col rounded-2xl border bg-card text-card-foreground transition-all h-52 overflow-hidden group w-full relative ${
          showOutOfStock 
            ? "opacity-90 cursor-not-allowed" 
            : "hover:border-primary/50 hover:shadow-md active:scale-95"
        }`}
      >
        {/* Out of stock overlay */}
        {showOutOfStock && (
          <div className="absolute inset-0 z-20 bg-background/30 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
            <div className="bg-destructive text-destructive-foreground text-[10px] font-black px-2 py-1 rounded shadow-lg transform -rotate-12 border-2 border-destructive-foreground/20 tracking-tighter">
              OUT OF STOCK
            </div>
          </div>
        )}

        {/* Promo Label & Discount Badges */}
        <div className="absolute top-2 left-2 right-2 z-10 flex flex-wrap items-center justify-between gap-1 pointer-events-none">
          {discountBadgeText ? (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 tracking-tight border border-emerald-400/30">
              <Tag className="w-2.5 h-2.5" />
              {discountBadgeText}
            </span>
          ) : <span />}

          {promoLabel ? (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 tracking-tight border border-amber-300">
              <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
              {promoLabel}
            </span>
          ) : null}
        </div>

        <div className={`flex-1 flex items-center justify-center overflow-hidden min-h-0 ${showOutOfStock ? "grayscale opacity-70" : ""}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={drink.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <Coffee className="h-9 w-9 text-primary/80 shrink-0" />
          )}
        </div>

        <div className="flex flex-col items-center px-3 py-2.5 border-t bg-slate-100/5 shrink-0 w-full">
          <span className="font-bold text-xs sm:text-sm leading-tight line-clamp-2 w-full text-center capitalize mb-1">{drink.name}</span>
          <span className="text-xs sm:text-sm text-primary font-black leading-tight">{fmt((drink as any).defaultPrice ?? drink.basePrice)}</span>
        </div>
      </button>
    );
  }

  // Kiosk Variant
  return (
    <motion.button
      whileTap={showOutOfStock ? {} : { scale: 0.95 }}
      disabled={showOutOfStock}
      onClick={onClick}
      className={`flex flex-col bg-card rounded-[2.5rem] overflow-hidden border shadow-sm group active:shadow-inner relative h-full ${
        showOutOfStock ? "opacity-90 cursor-not-allowed" : ""
      }`}
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-muted w-full">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            alt={drink.name} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <Coffee className="h-16 w-16" />
          </div>
        )}
        
        {showOutOfStock && (
          <div className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-destructive text-white font-black px-6 py-2 rounded-full text-xl shadow-2xl transform -rotate-12 border-4 border-white/20 tracking-tighter">
              SOLD OUT
            </div>
          </div>
        )}

        {/* Kiosk Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          {discountBadgeText && (
            <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl flex items-center gap-1 tracking-tight">
              <Tag className="w-3 h-3" />
              {discountBadgeText}
            </span>
          )}
          {promoLabel && (
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-xl flex items-center gap-1 tracking-tight">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              {promoLabel}
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 text-left max-w-[85%]">
           <p className="text-white/60 font-bold text-[9px] uppercase tracking-[0.2em] mb-1">{(drink as any).category}</p>
           <h3 className="text-white font-black text-base capitalize italic leading-tight tracking-tight line-clamp-2">{drink.name}</h3>
        </div>
        {!showOutOfStock && (
          <div className="absolute top-4 right-4 bg-primary text-white font-black px-4 py-1.5 rounded-full text-xs shadow-xl italic tracking-tight">
             {fmt((drink as any).defaultPrice || drink.basePrice)}
          </div>
        )}
      </div>
    </motion.button>
  );
}
