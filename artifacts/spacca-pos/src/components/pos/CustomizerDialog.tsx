import React from "react";
import { RotateCcw, Plus, Droplets } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CupSimulator, type CupLayer } from "@/components/cup-simulator";
import { fmt } from "@/lib/currency";
import { Drink } from "@workspace/api-client-react";

interface CustomizerDialogProps {
  isOpen: boolean;
  activeDrink: Drink | null;
  drinkDetail: any;
  isLoadingDrinkDetail: boolean;
  selections: Record<number, number>;
  subSelections: Record<number, number>;
  notes: string;
  setSelections: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setSubSelections: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setNotes: (val: string) => void;
  displayPrice: number;
  priceBreakdown: any;
  isCalculating: boolean;
  simulatorLayers: CupLayer[];
  allowNoStockSell: boolean;
  onReset: () => void;
  onClose: () => void;
  onAddToCart: () => void;
}

class CupSimulatorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("[CupSimulator ErrorBoundary] Caught render failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 rounded-xl p-2 text-center text-xs text-muted-foreground border border-muted/50">
          <Droplets className="h-6 w-6 text-primary/70 mb-1" />
          <span className="font-semibold text-[10px] text-muted-foreground/80">Drink Preview</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export const CustomizerDialog: React.FC<CustomizerDialogProps> = ({
  isOpen,
  activeDrink,
  drinkDetail,
  isLoadingDrinkDetail,
  selections,
  subSelections,
  notes,
  setSelections,
  setSubSelections,
  setNotes,
  displayPrice,
  priceBreakdown,
  isCalculating,
  simulatorLayers,
  allowNoStockSell,
  onReset,
  onClose,
  onAddToCart,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-5 border-b shrink-0 flex-row items-center gap-4">
          <div className="flex-1 min-w-0 pb-1">
            <DialogTitle className="text-2xl truncate mb-1 capitalize">{activeDrink?.name}</DialogTitle>
            {drinkDetail?.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 leading-normal">
                {drinkDetail.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold text-primary transition-opacity ${isCalculating ? "opacity-60" : "opacity-100"}`}>
                {fmt(displayPrice)}
              </div>
              {drinkDetail && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="h-8 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          {drinkDetail && activeDrink?.cupIngredientId && (
            <div className="w-24 h-32 shrink-0 pr-6 mr-2">
              <CupSimulatorErrorBoundary>
                <CupSimulator
                  cupSizeMl={drinkDetail.cupSizeMl || 0}
                  layers={simulatorLayers || []}
                  className="mb-2"
                />
              </CupSimulatorErrorBoundary>
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
                ?.filter((s) => (s.customerSortOrder ?? s.sortOrder ?? 1) > 0)
                ?.sort((a, b) => (a.customerSortOrder ?? a.sortOrder ?? 1) - (b.customerSortOrder ?? b.sortOrder ?? 1))
                ?.map((slot) => {
                  // ── Typed (catalog) slot: two-level ──
                  if (slot.slotStyle === "typed") {
                    const typeOptions: any[] = slot.typeOptions ?? [];
                    const selectedTypeId = selections[slot.id];
                    const activeTypeOpt = typeOptions.find((to: any) => to.ingredientTypeId === selectedTypeId) ?? typeOptions[0];
                    const activeVolumes: any[] = activeTypeOpt?.volumes ?? [];
                    const multiType = typeOptions.length > 1;

                    return (
                      <div key={slot.id} className="space-y-3 p-3 rounded-xl border-2 border-primary/15 bg-muted/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:bg-muted/5">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-primary/70 flex items-center gap-2">
                            <span>{slot.slotLabel}</span>
                            {activeTypeOpt?.pricingMode === "unit" && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] border-primary/20 bg-primary/5 text-primary font-black tracking-widest uppercase">
                                Fixed Price
                              </Badge>
                            )}
                            {(() => {
                              const typeOptions: any[] = slot.typeOptions ?? [];
                              const defTypeOpt = typeOptions.find((to: any) => to.isDefault) ?? typeOptions[0];
                              const defVol = defTypeOpt?.volumes?.find((v: any) => v.isDefault) ?? defTypeOpt?.volumes?.[0];
                              const defaultLabel = defTypeOpt ? `${defTypeOpt.typeName}${defVol?.volumeName ? ` · ${defVol.volumeName}` : ""}` : "";
                              return defaultLabel && (
                                <span className="normal-case font-semibold text-[10px] sm:text-xs text-muted-foreground/60 tracking-normal italic">
                                  (Default: {defaultLabel})
                                </span>
                              );
                            })()}
                          </Label>
                          <div className="flex-1 h-px bg-gradient-to-r from-primary/10 to-transparent" />
                        </div>

                        {/* Level 1: Type option buttons */}
                        {multiType && (
                          <div className="grid grid-cols-3 gap-1">
                            {typeOptions.map((typeOpt: any) => {
                              const isOutOfStock = !allowNoStockSell && !typeOpt.isAvailable;
                              return (
                                <button
                                  key={typeOpt.ingredientTypeId}
                                  disabled={isOutOfStock}
                                  onClick={() => {
                                    setSelections((prev) => ({ ...prev, [slot.id]: typeOpt.ingredientTypeId }));
                                    const availableVols = (typeOpt.volumes ?? []).filter((v: any) => allowNoStockSell || v.isAvailable);
                                    const defVol = availableVols.find((v: any) => v.isDefault) ?? availableVols[availableVols.length - 1] ?? typeOpt.volumes?.[0];
                                    setSubSelections((prev) => {
                                      const next = { ...prev };
                                      if (defVol) next[slot.id] = defVol.id;
                                      else delete next[slot.id];
                                      return next;
                                    });
                                  }}
                                  className={`px-3 py-2 rounded-md border text-left transition-all text-xs sm:text-sm ${selectedTypeId === typeOpt.ingredientTypeId
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : "bg-background border-border hover:border-primary/50"
                                    } ${isOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                                >
                                  <div className="font-semibold truncate">{typeOpt.typeName}</div>
                                  {isOutOfStock && <div className="text-[10px] font-bold text-destructive uppercase">Out of Stock</div>}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Level 1.5: Status text for single type slots */}
                        {!multiType && activeTypeOpt && (
                          <div className="text-sm sm:text-base font-semibold text-primary/80 mb-1 px-1">
                            {activeTypeOpt.typeName}
                          </div>
                        )}

                        {/* Level 2: Volume buttons */}
                        <div className={multiType ? "pl-3 border-l-2 border-primary/30" : ""}>
                          {multiType && (
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1.5 font-medium">Volume</div>
                          )}
                          <div className="grid grid-cols-3 gap-1">
                            {activeVolumes.map((vol: any) => {
                              const isVolOutOfStock = !allowNoStockSell && !vol.isAvailable;
                              return (
                                <button
                                  key={vol.id}
                                  disabled={isVolOutOfStock}
                                  onClick={() => setSubSelections((prev) => ({ ...prev, [slot.id]: vol.id }))}
                                  className={`px-3 py-2 rounded-md border text-left transition-all text-xs sm:text-sm ${subSelections[slot.id] === vol.id
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : "bg-background border-border hover:border-primary/50"
                                    } ${isVolOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                                >
                                  <div className="font-semibold truncate">{vol.volumeName}</div>
                                  {isVolOutOfStock ? (
                                    <div className="text-[10px] font-bold text-destructive uppercase">No Stock</div>
                                  ) : vol.extraCost > 0 && (
                                    <div className={`text-xs mt-0.5 ${subSelections[slot.id] === vol.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
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

                  // ── Legacy slot ──
                  const options: any[] = slot.ingredient?.options ?? [];
                  const isLinked = options.some((o) => o.linkedIngredientId);
                  const selectedTypeOpt = isLinked ? options.find((o) => o.id === selections[slot.id]) : null;
                  const subOptions: any[] = selectedTypeOpt?.linkedIngredient?.options ?? [];

                  return (
                    <div key={slot.id} className="space-y-3 p-3 rounded-xl border-2 border-primary/15 bg-muted/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:bg-muted/5">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-primary/70 flex items-center gap-2">
                          <span>{slot.slotLabel}</span>
                          {(() => {
                            const options: any[] = slot.ingredient?.options ?? [];
                            const defOpt = options.find((o: any) => o.id === slot.defaultOptionId) || options[0];
                            return defOpt && (
                              <span className="normal-case font-semibold text-[10px] sm:text-xs text-muted-foreground/60 tracking-normal italic">
                                (Default: {defOpt.label})
                              </span>
                            );
                          })()}
                        </Label>
                        <div className="flex-1 h-px bg-gradient-to-r from-primary/10 to-transparent" />
                      </div>

                      {/* Type picker */}
                      <div className="grid grid-cols-3 gap-1">
                        {options.map((option) => {
                          const isOutOfStock = !allowNoStockSell && !option.isAvailable;
                          return (
                            <button
                              key={option.id}
                              disabled={isOutOfStock}
                              onClick={() => {
                                setSelections((prev) => ({ ...prev, [slot.id]: option.id }));
                                if (option.linkedIngredient?.options?.length) {
                                  const subOpts = option.linkedIngredient.options;
                                  const availableSub = allowNoStockSell ? subOpts : subOpts.filter((so: any) => so.isAvailable);
                                  const defSub = availableSub.find((o: any) => o.isDefault) || availableSub[0] || subOpts[0];
                                  setSubSelections((prev) => ({ ...prev, [slot.id]: defSub.id }));
                                } else {
                                  setSubSelections((prev) => {
                                    const next = { ...prev };
                                    delete next[slot.id];
                                    return next;
                                  });
                                }
                              }}
                              className={`px-3 py-2 rounded-md border text-left transition-all text-xs sm:text-sm ${selections[slot.id] === option.id
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-background border-border hover:border-primary/50"
                                } ${isOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                            >
                              <div className="font-semibold truncate">{option.label}</div>
                              {isOutOfStock ? (
                                <div className="text-[10px] font-bold text-destructive uppercase">No Stock</div>
                              ) : !isLinked && option.extraCost > 0 && (
                                <div className={`text-xs mt-0.5 ${selections[slot.id] === option.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                  +{fmt(option.extraCost)}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Sub-option picker */}
                      {isLinked && subOptions.length > 0 && (
                        <div className="mt-2.5 pl-3 border-l-2 border-primary/30">
                          <div className="text-xs sm:text-sm text-muted-foreground mb-1.5 font-medium">Volume</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {subOptions.map((subOpt) => {
                              const isSubOutOfStock = !allowNoStockSell && !subOpt.isAvailable;
                              return (
                                <button
                                  key={subOpt.id}
                                  disabled={isSubOutOfStock}
                                  onClick={() => setSubSelections((prev) => ({ ...prev, [slot.id]: subOpt.id }))}
                                  className={`px-3 py-2 rounded-lg border text-center transition-all text-xs sm:text-sm ${subSelections[slot.id] === subOpt.id
                                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                      : "bg-background border-border hover:border-primary/50"
                                    } ${isSubOutOfStock ? "opacity-40 grayscale pointer-events-none" : ""}`}
                                >
                                  <div className="font-medium leading-tight">{subOpt.label}</div>
                                  {isSubOutOfStock ? (
                                    <div className="text-[10px] font-bold text-destructive uppercase">No Stock</div>
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
                    <span className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300">
                      {priceBreakdown.dynamicInfo.ingredientName}
                    </span>
                    <span className="text-xs sm:text-sm text-blue-500 ml-1.5">
                      ingredient added
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    +{fmt(priceBreakdown.dynamicInfo.cost)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t">
                <Label htmlFor="notes" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Special Notes
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Extra hot, no foam"
                  className="mt-2 text-sm sm:text-base"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-3 border-t shrink-0">
          <Button
            className="w-full h-12 text-base sm:text-lg font-bold shadow-md"
            onClick={onAddToCart}
            disabled={isCalculating || isLoadingDrinkDetail}
          >
            <Plus className="mr-2 h-4 w-4" /> Add to Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
