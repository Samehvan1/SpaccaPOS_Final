import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Activity, AlertTriangle, Apple, ChevronDown, Flame, Info, Loader2 } from "lucide-react";

import { useSettings } from "@/hooks/use-settings";

export type NutritionFacts = {
  calories: number;
  protein: number;
  totalCarbs: number;
  dietaryFiber: number;
  totalSugars: number;
  addedSugars: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  caffeine: number;
  allergens: string[];
  ingredientBreakdown?: Array<{
    ingredientId: number;
    ingredientName: string;
    consumedQty: number;
    unit: string;
    calories: number;
    caffeine: number;
    totalSugars: number;
    protein: number;
    totalFat: number;
    totalCarbs: number;
  }>;
};

interface NutritionFactsWidgetProps {
  drinkId: number | null;
  selections: any[];
  branchId?: number | null;
  quantity?: number;
  className?: string;
  compact?: boolean;
}

export const NutritionFactsWidget: React.FC<NutritionFactsWidgetProps> = ({
  drinkId,
  selections,
  branchId = null,
  quantity = 1,
  className = "",
  compact = false,
}) => {
  const { showNutritionFacts } = useSettings();
  const [loading, setLoading] = useState(false);
  const [facts, setFacts] = useState<NutritionFacts | null>(null);

  useEffect(() => {
    if (!drinkId || !showNutritionFacts) {
      setFacts(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch("/api/nutrition/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drinkId, selections, branchId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Calculation error");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setFacts(data.nutritionFacts);
        }
      })
      .catch(() => {
        if (isMounted) setFacts(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [drinkId, JSON.stringify(selections), branchId]);

  if (!drinkId || !showNutritionFacts) return null;

  const qty = Math.max(1, quantity);
  const calories = facts ? Math.round(facts.calories * qty) : 0;
  const caffeine = facts ? Math.round(facts.caffeine * qty) : 0;
  const sugars = facts ? Math.round(facts.totalSugars * qty * 10) / 10 : 0;
  const protein = facts ? Math.round(facts.protein * qty * 10) / 10 : 0;
  const carbs = facts ? Math.round(facts.totalCarbs * qty * 10) / 10 : 0;
  const fat = facts ? Math.round(facts.totalFat * qty * 10) / 10 : 0;
  const allergens = facts?.allergens || [];

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap text-xs ${className}`}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 gap-1">
              <Flame className="h-3 w-3 text-amber-500 fill-amber-500" /> {calories} kcal
            </Badge>
            {caffeine > 0 && (
              <Badge variant="outline" className="bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-900 dark:text-stone-200 gap-1 font-mono">
                ☕ {caffeine} mg caff
              </Badge>
            )}
            {sugars > 0 && (
              <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200">
                🍬 {sugars}g sugar
              </Badge>
            )}
            {allergens.length > 0 && (
              <Badge variant="destructive" className="gap-1 text-[10px]">
                <AlertTriangle className="h-3 w-3" /> {allergens.join(", ")}
              </Badge>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg border bg-gradient-to-br from-emerald-50/50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:to-amber-950/10 border-emerald-200 dark:border-emerald-900/40 space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <Activity className="h-4 w-4 text-emerald-600 animate-pulse" /> Live Nutrition Facts
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2 gap-1 text-muted-foreground hover:text-emerald-700">
              Full Label <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 text-xs font-sans space-y-2 border-2 border-black dark:border-white shadow-xl">
            <div className="font-extrabold text-lg border-b-4 border-black dark:border-white pb-1">Nutrition Facts</div>
            <div className="flex justify-between border-b pb-1 font-semibold">
              <span>Amount Per Serving</span>
              <span>{qty > 1 ? `(x${qty} Items)` : "1 Serving"}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold border-b-2 border-black dark:border-white py-1">
              <span>Calories</span>
              <span>{calories}</span>
            </div>
            <div className="space-y-1 divide-y text-muted-foreground pt-1">
              <div className="flex justify-between font-bold text-foreground pt-1">
                <span>Total Fat {fat}g</span>
                <span>{Math.round((fat / 65) * 100)}%</span>
              </div>
              {facts && facts.saturatedFat > 0 && (
                <div className="flex justify-between pl-3 text-[11px]">
                  <span>Saturated Fat {(facts.saturatedFat * qty).toFixed(1)}g</span>
                  <span>{Math.round(((facts.saturatedFat * qty) / 20) * 100)}%</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground pt-1">
                <span>Sodium {facts ? Math.round(facts.sodium * qty) : 0}mg</span>
                <span>{facts ? Math.round(((facts.sodium * qty) / 2300) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between font-bold text-foreground pt-1">
                <span>Total Carbohydrates {carbs}g</span>
                <span>{Math.round((carbs / 300) * 100)}%</span>
              </div>
              {sugars > 0 && (
                <div className="flex justify-between pl-3 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  <span>Total Sugars {sugars}g</span>
                  <span>{Math.round((sugars / 50) * 100)}%</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground pt-1">
                <span>Protein {protein}g</span>
                <span>{Math.round((protein / 50) * 100)}%</span>
              </div>
              {caffeine > 0 && (
                <div className="flex justify-between font-extrabold text-amber-900 dark:text-amber-200 pt-1 border-t-2 border-black dark:border-white">
                  <span>Caffeine</span>
                  <span>{caffeine} mg</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground pt-2 border-t border-dashed">
              * Percent Daily Values (%DV) are based on a 2,000 calorie diet.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main badges row */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" /> Calculating nutrients...
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-background/80 p-1.5 rounded border border-emerald-100 dark:border-emerald-900/30">
            <div className="text-[10px] text-muted-foreground font-medium">Calories</div>
            <div className="font-extrabold text-amber-700 dark:text-amber-400">{calories} <span className="text-[10px] font-normal">kcal</span></div>
          </div>
          <div className="bg-background/80 p-1.5 rounded border border-emerald-100 dark:border-emerald-900/30">
            <div className="text-[10px] text-muted-foreground font-medium">Caffeine</div>
            <div className="font-extrabold text-amber-900 dark:text-amber-200">{caffeine} <span className="text-[10px] font-normal">mg</span></div>
          </div>
          <div className="bg-background/80 p-1.5 rounded border border-emerald-100 dark:border-emerald-900/30">
            <div className="text-[10px] text-muted-foreground font-medium">Sugar</div>
            <div className="font-extrabold text-rose-600 dark:text-rose-400">{sugars} <span className="text-[10px] font-normal">g</span></div>
          </div>
          <div className="bg-background/80 p-1.5 rounded border border-emerald-100 dark:border-emerald-900/30">
            <div className="text-[10px] text-muted-foreground font-medium">Protein</div>
            <div className="font-extrabold text-blue-600 dark:text-blue-400">{protein} <span className="text-[10px] font-normal">g</span></div>
          </div>
        </div>
      )}

      {/* Allergens warning */}
      {allergens.length > 0 && (
        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 px-2 py-1 rounded text-[11px] font-medium border border-rose-200 dark:border-rose-900">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span>Contains allergens: <strong>{allergens.join(", ")}</strong></span>
        </div>
      )}
    </div>
  );
};
