import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Package, CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuth } from "@/hooks/use-auth";

type Conversion = {
  id: number;
  unitName: string;
  conversionFactor: number;
  isDefaultPurchase: boolean;
};

type Ingredient = {
  id: number;
  name: string;
  ingredientType: string;
  unit: string;
  stockQuantity: number;
  conversions?: Conversion[];
};

const INGREDIENT_TYPES = ["coffee", "milk", "syrup", "sauce", "sweetener", "topping", "base", "cup", "tea", "packing", "other"] as const;

export default function StockControlPage() {
  const { toast } = useToast();
  const { user, selectedBranchId } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportItems, setReportItems] = useState<Record<number, { actualQuantity: string; notes: string; selectedUnitId?: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/ingredients?active=true")
      .then((res) => res.json())
      .then((data) => {
        setIngredients(data);
        setLoading(false);
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Failed to load ingredients" });
        setLoading(false);
      });
  }, [toast]);

  const handleQuantityChange = (id: number, val: string) => {
    setReportItems((prev) => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        actualQuantity: val,
        selectedUnitId: prev[id]?.selectedUnitId ?? "base"
      },
    }));
  };

  const handleNotesChange = (id: number, val: string) => {
    setReportItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], notes: val },
    }));
  };

  const handleUnitChange = (id: number, unitId: string) => {
    setReportItems((prev) => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        selectedUnitId: unitId
      },
    }));
  };

  const handleSubmit = async () => {
    const items = Object.entries(reportItems)
      .filter(([_, item]) => item.actualQuantity !== "")
      .map(([id, item]) => {
        const ingId = parseInt(id);
        const ing = ingredients.find(i => i.id === ingId);
        
        let factor = 1;
        let selectedUnitLabel = "";
        
        if (item.selectedUnitId && item.selectedUnitId !== "base") {
          const conv = ing?.conversions?.find(c => String(c.id) === item.selectedUnitId);
          if (conv) {
            factor = conv.conversionFactor;
            selectedUnitLabel = conv.unitName;
          }
        }

        const actualQtyBase = parseFloat(item.actualQuantity) * factor;
        
        let finalNotes = item.notes || "";
        if (selectedUnitLabel) {
          const auditMeta = `[Audited: ${item.actualQuantity} ${selectedUnitLabel}]`;
          finalNotes = finalNotes ? `${auditMeta} ${finalNotes}` : auditMeta;
        }

        return {
          ingredientId: ingId,
          actualQuantity: actualQtyBase,
          notes: finalNotes || null,
        };
      });

    if (items.length === 0) {
      toast({ variant: "destructive", title: "No items reported", description: "Please enter at least one quantity." });
      return;
    }

    setSubmitting(true);
    try {
      const auditBranchId = user?.branchId || selectedBranchId || 1;
      const res = await fetch("/api/stock-audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, items, branchId: auditBranchId }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast({ title: "Report submitted", description: "Your stock report has been sent for admin approval." });
      setReportItems({});
      setNotes("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission failed", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReported = Object.values(reportItems).filter(item => item.actualQuantity !== "").length;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      <header className="p-4 md:p-8 pb-0 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Stock Control</h1>
            <p className="text-muted-foreground text-sm">Report daily stock levels for verification.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-8 px-3 text-[10px] uppercase font-black">
              {totalReported} reported
            </Badge>
            <Button onClick={handleSubmit} disabled={submitting || totalReported === 0} className="gap-2 shadow-lg">
              {submitting ? "Submitting..." : <><Send className="h-4 w-4" /> Submit Report</>}
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30 mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ingredients..."
                  className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="md:w-1/3">
                 <Input
                  placeholder="Report notes (optional)..."
                  className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      <div className="flex-1 overflow-hidden px-4 md:px-8">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="bg-muted/50 p-1 mb-4 h-auto flex-wrap justify-start shrink-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-background px-4 py-2 text-xs font-bold uppercase">All</TabsTrigger>
            {INGREDIENT_TYPES.map(type => (
               <TabsTrigger key={type} value={type} className="data-[state=active]:bg-background px-4 py-2 capitalize text-xs font-bold">{type}</TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <TabsContent value="all" className="mt-0 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i} className="animate-pulse bg-muted/20 border-none h-32"></Card>
                    ))
                  ) : filteredIngredients.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-3">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                      <p className="text-muted-foreground font-medium">No ingredients found.</p>
                    </div>
                  ) : (
                    filteredIngredients.map((ing) => (
                      <IngredientItem 
                        key={ing.id} 
                        ing={ing} 
                        report={reportItems[ing.id]} 
                        onChange={handleQuantityChange}
                        onNotesChange={handleNotesChange}
                        onUnitChange={handleUnitChange}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              {INGREDIENT_TYPES.map(type => (
                <TabsContent key={type} value={type} className="mt-0 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredIngredients.filter(i => i.ingredientType === type).map((ing) => (
                      <IngredientItem 
                        key={ing.id} 
                        ing={ing} 
                        report={reportItems[ing.id]} 
                        onChange={handleQuantityChange}
                        onNotesChange={handleNotesChange}
                        onUnitChange={handleUnitChange}
                      />
                    ))}
                    {filteredIngredients.filter(i => i.ingredientType === type).length === 0 && (
                      <div className="col-span-full py-20 text-center text-muted-foreground">No {type} items found.</div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function IngredientItem({ ing, report, onChange, onNotesChange, onUnitChange }: { 
  ing: Ingredient; 
  report?: { actualQuantity: string; notes: string; selectedUnitId?: string };
  onChange: (id: number, val: string) => void;
  onNotesChange: (id: number, val: string) => void;
  onUnitChange: (id: number, unitId: string) => void;
}) {
  const isReported = report?.actualQuantity !== undefined && report?.actualQuantity !== "";
  const selectedUnitId = report?.selectedUnitId ?? "base";

  const conversions = ing.conversions || [];
  const activeConv = selectedUnitId !== "base" ? conversions.find(c => String(c.id) === selectedUnitId) : null;
  const factor = activeConv ? activeConv.conversionFactor : 1;
  const equivalentQty = isReported ? (parseFloat(report!.actualQuantity) * factor).toFixed(2) : null;

  return (
    <Card className={`overflow-hidden transition-all duration-300 border shadow-sm hover:shadow-md ${isReported ? 'bg-primary/[0.03] border-primary/30 ring-1 ring-primary/20' : 'bg-card'}`}>
      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base md:text-lg leading-tight font-bold">{ing.name}</CardTitle>
          {isReported && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
        </div>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[9px] uppercase font-black px-1.5 py-0 h-4">{ing.ingredientType}</Badge>
          <span className="text-[10px] font-medium">STOCK: {ing.stockQuantity} {ing.unit}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="grid gap-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actual Stock Count</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="0.00"
                className={`h-10 text-lg font-bold bg-background/50 border-muted-foreground/10 focus:ring-primary/30 ${isReported ? 'border-primary/30 ring-1 ring-primary/20' : ''}`}
                value={report?.actualQuantity ?? ""}
                onChange={(e) => onChange(ing.id, e.target.value)}
              />
            </div>
            
            {conversions.length > 0 ? (
              <select
                className="h-10 px-3 py-2 rounded-md border border-input bg-background/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedUnitId}
                onChange={(e) => onUnitChange(ing.id, e.target.value)}
              >
                <option value="base">{ing.unit}</option>
                {conversions.map((conv) => (
                  <option key={conv.id} value={String(conv.id)}>
                    {conv.unitName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="h-10 flex items-center justify-center px-3 rounded-md border border-dashed text-xs font-black text-muted-foreground/60 uppercase bg-muted/20">
                {ing.unit}
              </div>
            )}
          </div>
          
          {selectedUnitId !== "base" && isReported && (
            <div className="text-[10px] text-muted-foreground font-semibold italic">
              Equivalent to: {equivalentQty} {ing.unit}
            </div>
          )}
        </div>
        <div className="grid gap-1">
           <Input
              placeholder="Add item note..."
              className="h-8 text-[11px] bg-transparent border-dashed border-muted-foreground/20 focus:border-primary/40"
              value={report?.notes ?? ""}
              onChange={(e) => onNotesChange(ing.id, e.target.value)}
            />
        </div>
      </CardContent>
    </Card>
  );
}
