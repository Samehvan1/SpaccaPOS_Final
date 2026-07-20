import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, CheckCircle2, Lock, Loader2, Beaker, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface AdjustmentItem {
  ingredientId: number;
  name: string;
  quantity: number;
  unit: string;
  note?: string;
  unitId?: number;
  displayUnit: string;
  movementType: "calibration" | "testing";
}

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  conversions: { id: number; unitName: string; conversionFactor: string | number }[];
};

export default function CalibrationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthorized, setIsAuthorized] = useState(user?.role === "admin" || (user?.role as string) === "supervisor");
  const [adminPin, setAdminPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [adjustmentList, setAdjustmentList] = useState<AdjustmentItem[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("base");
  const [quantityInput, setQuantityInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"calibration" | "testing">("calibration");

  // By Drink Recipe States
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>("none");
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [customQuantities, setCustomQuantities] = useState<Record<number, string>>({});
  const [drinkNoteInput, setDrinkNoteInput] = useState("");

  // Fetch all ingredients
  const { data: ingredients = [], isLoading: isIngredientsLoading } = useQuery({
    queryKey: ["/api/ingredients"],
    queryFn: async () => {
      const res = await fetch("/api/ingredients");
      if (!res.ok) throw new Error("Failed to fetch ingredients");
      return res.json();
    },
  });

  // Fetch all drinks
  const { data: drinks = [], isLoading: isDrinksLoading } = useQuery<any[]>({
    queryKey: ["/api/drinks"],
    queryFn: async () => {
      const res = await fetch("/api/drinks");
      if (!res.ok) throw new Error("Failed to fetch drinks");
      return res.json();
    },
  });

  // Fetch recipe ingredients for selected drink
  const { data: drinkUsage = [], isLoading: isUsageLoading } = useQuery<any[]>({
    queryKey: ["/api/drinks", selectedDrinkId, "stock-usage"],
    queryFn: async () => {
      const res = await fetch(`/api/drinks/${selectedDrinkId}/stock-usage`);
      if (!res.ok) throw new Error("Failed to fetch drink ingredients");
      return res.json();
    },
    enabled: !!selectedDrinkId && selectedDrinkId !== "none",
  });

  // Sync checkboxes and quantities when drink recipe is loaded
  useEffect(() => {
    if (drinkUsage && drinkUsage.length > 0) {
      const initialChecked: Record<number, boolean> = {};
      const initialQuantities: Record<number, string> = {};
      drinkUsage.forEach((item: any) => {
        initialChecked[item.ingredientId] = !!item.isDefault;
        initialQuantities[item.ingredientId] = String(item.qty ?? 0);
      });
      setCheckedIngredients(initialChecked);
      setCustomQuantities(initialQuantities);
    }
  }, [drinkUsage]);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin }),
      });
      if (!res.ok) throw new Error("Invalid PIN");
      setIsAuthorized(true);
      toast({ title: "Authorized", description: "Calibration access granted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid admin PIN." });
      setAdminPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  const addItem = () => {
    if (!selectedIngredient || !quantityInput) return;
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      toast({ variant: "destructive", title: "Invalid Quantity", description: "Please enter a valid positive number." });
      return;
    }

    let finalUnit = selectedIngredient.unit;
    let unitId: number | undefined = undefined;
    if (selectedUnit !== "base") {
      const conversion = selectedIngredient.conversions.find((c: any) => String(c.id) === selectedUnit);
      if (conversion) {
        finalUnit = conversion.unitName;
        unitId = conversion.id;
      }
    }

    const existingIndex = adjustmentList.findIndex(item => item.ingredientId === selectedIngredient.id && item.unitId === unitId && item.movementType === adjustmentType);
    if (existingIndex > -1) {
      const newList = [...adjustmentList];
      newList[existingIndex].quantity += qty;
      setAdjustmentList(newList);
    } else {
      setAdjustmentList([...adjustmentList, {
        ingredientId: selectedIngredient.id,
        name: selectedIngredient.name,
        quantity: qty,
        unit: selectedIngredient.unit,
        note: noteInput,
        unitId,
        displayUnit: finalUnit,
        movementType: adjustmentType
      }]);
    }

    setSelectedIngredient(null);
    setSelectedUnit("base");
    setQuantityInput("");
    setNoteInput("");
    setSearchQuery("");
  };

  const addDrinkIngredients = () => {
    if (!selectedDrinkId || selectedDrinkId === "none" || drinkUsage.length === 0) return;

    const itemsToAdd: AdjustmentItem[] = [];
    let hasInvalidQty = false;

    drinkUsage.forEach((item: any) => {
      if (!checkedIngredients[item.ingredientId]) return;

      const qtyStr = customQuantities[item.ingredientId] || "0";
      const qty = parseFloat(qtyStr);
      if (isNaN(qty) || qty <= 0) {
        hasInvalidQty = true;
        return;
      }

      const ingCatalog = ingredients.find((i: any) => i.id === item.ingredientId);
      const unit = ingCatalog ? ingCatalog.unit : item.unit;

      itemsToAdd.push({
        ingredientId: item.ingredientId,
        name: item.ingredientName,
        quantity: qty,
        unit: unit,
        note: drinkNoteInput || "Drink calibration",
        displayUnit: unit,
        movementType: adjustmentType
      });
    });

    if (hasInvalidQty) {
      toast({ variant: "destructive", title: "Invalid Quantity", description: "Please ensure all checked ingredients have a positive quantity." });
      return;
    }

    if (itemsToAdd.length === 0) {
      toast({ variant: "destructive", title: "No Items Selected", description: "Please check at least one ingredient to add." });
      return;
    }

    const newList = [...adjustmentList];
    itemsToAdd.forEach(item => {
      const existingIndex = newList.findIndex(existing => existing.ingredientId === item.ingredientId && existing.unitId === item.unitId && existing.movementType === item.movementType);
      if (existingIndex > -1) {
        newList[existingIndex].quantity += item.quantity;
      } else {
        newList.push(item);
      }
    });

    setAdjustmentList(newList);
    setSelectedDrinkId("none");
    setCheckedIngredients({});
    setCustomQuantities({});
    setDrinkNoteInput("");
    toast({ title: "Added", description: `Added ${itemsToAdd.length} recipe ingredients to the list.` });
  };

  const removeItem = (id: number, unitId?: number, movementType?: string) => {
    setAdjustmentList(adjustmentList.filter(item => !(item.ingredientId === id && item.unitId === unitId && item.movementType === movementType)));
  };

  const handleSubmit = async () => {
    if (adjustmentList.length === 0) return;
    setIsSubmitting(true);
    try {
      for (const item of adjustmentList) {
        const res = await fetch("/api/stock/adjustments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredientId: item.ingredientId,
            movementType: item.movementType,
            quantity: item.quantity,
            unitId: item.unitId,
            note: item.note || (item.movementType === "calibration" ? "Machine calibration" : "Recipe testing")
          }),
        });
        if (!res.ok) throw new Error(`Failed to adjust ${item.name}`);
      }

      toast({ title: "Success", description: "Stock updated successfully." });
      setAdjustmentList([]);
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background p-6">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tighter uppercase">Admin Authorization</CardTitle>
            <CardDescription>Enter Admin PIN to access Calibration & Testing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Admin PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="h-14 text-center text-2xl tracking-[0.5em] font-black bg-muted/50 border-primary/20"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 font-black uppercase tracking-widest text-lg shadow-lg shadow-primary/20"
                disabled={isVerifying || !adminPin}
              >
                {isVerifying ? <Loader2 className="h-6 w-6 animate-spin" /> : "Authorize Access"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredIngredients = ingredients.filter((ing: any) => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 w-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
            <Beaker className="h-8 w-8 text-primary" />
            Calibration <span className="text-primary">& Testing</span>
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest mt-1">Non-revenue stock deductions for machine testing</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3 border-primary/30 text-primary bg-primary/5 font-black uppercase tracking-tight">
            Admin Mode Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Selection */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-lg border-primary/10 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Select Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="individual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="individual" className="font-bold">Individual Ingredient</TabsTrigger>
                  <TabsTrigger value="recipe" className="font-bold">By Drink Recipe</TabsTrigger>
                </TabsList>

                <TabsContent value="individual" className="space-y-6">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Search inventory (Coffee, Milk, Syrup...)" 
                        className="pl-10 h-12 text-lg bg-muted/20 border-transparent focus:bg-background transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {searchQuery.length > 0 && (
                      <div className="max-h-[300px] overflow-y-auto rounded-xl border border-primary/10 bg-card divide-y">
                        {filteredIngredients.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground italic">No ingredients found</div>
                        ) : (
                          filteredIngredients.map((ing: any) => (
                            <div 
                              key={ing.id}
                              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-primary/5 transition-colors ${selectedIngredient?.id === ing.id ? 'bg-primary/10 border-primary/20' : ''}`}
                              onClick={() => setSelectedIngredient(ing)}
                            >
                              <div>
                                <div className="font-bold">{ing.name}</div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{ing.ingredientType} • Stock: {ing.stockQuantity} {ing.unit}</div>
                              </div>
                              {selectedIngredient?.id === ing.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {selectedIngredient && (
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="w-full md:w-[280px] md:shrink-0 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Quantity</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              className="h-14 text-2xl font-black bg-background border-primary/20 flex-1"
                              value={quantityInput}
                              onChange={(e) => setQuantityInput(e.target.value)}
                              autoFocus
                            />
                            <div className="w-[120px]">
                              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                                <SelectTrigger className="h-14 font-bold border-primary/20 bg-background">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="base" className="font-bold">{selectedIngredient?.unit}</SelectItem>
                                  {selectedIngredient?.conversions?.map((c: any) => (
                                    <SelectItem key={c.id} value={String(c.id)} className="font-bold">{c.unitName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {selectedUnit !== "base" && selectedIngredient && quantityInput && (
                            <p className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-tighter">
                              Equivalent to: {(parseFloat(quantityInput) * Number(selectedIngredient.conversions.find((c: any) => String(c.id) === selectedUnit)?.conversionFactor || 1)).toFixed(2)} {selectedIngredient.unit}
                            </p>
                          )}
                        </div>
                        <div className="w-full md:flex-1 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Notes / Purpose</Label>
                          <Input 
                            placeholder="e.g. New recipe test #4"
                            className="h-14 bg-background border-primary/20"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                          />
                        </div>
                        <div className="w-full md:w-[160px] md:shrink-0 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Deduction Type</Label>
                          <Select value={adjustmentType} onValueChange={(val: "calibration" | "testing") => setAdjustmentType(val)}>
                            <SelectTrigger className="h-14 font-bold border-primary/20 bg-background">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="calibration" className="font-bold">Calibration</SelectItem>
                              <SelectItem value="testing" className="font-bold">Testing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={addItem}
                          className="w-full md:w-auto h-14 px-8 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
                        >
                          <Plus className="h-5 w-5 mr-2 stroke-[3px]" /> Add to List
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recipe" className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Select Drink Recipe</Label>
                    <Select value={selectedDrinkId} onValueChange={setSelectedDrinkId}>
                      <SelectTrigger className="h-12 font-bold bg-muted/20 border-transparent focus:bg-background transition-all">
                        <SelectValue placeholder="Search or select a drink (e.g. Caffè Latte)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="font-bold text-muted-foreground">Select a drink...</SelectItem>
                        {isDrinksLoading ? (
                          <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading drinks...
                          </div>
                        ) : drinks.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">No drinks found</div>
                        ) : (
                          drinks.map((drink: any) => (
                            <SelectItem key={drink.id} value={String(drink.id)} className="font-bold">
                              {drink.name} <span className="text-muted-foreground text-xs font-normal">({drink.category})</span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDrinkId && selectedDrinkId !== "none" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {isUsageLoading ? (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-xs uppercase font-bold tracking-widest">Fetching recipe ingredients...</span>
                        </div>
                      ) : drinkUsage.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground italic rounded-2xl bg-muted/10 border border-dashed">
                          No inventory items are linked to this drink recipe.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl border overflow-hidden">
                            <Table>
                              <TableHeader className="bg-muted/30">
                                <TableRow>
                                  <TableHead className="w-[80px] text-center"></TableHead>
                                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Ingredient</TableHead>
                                  <TableHead className="w-[150px] text-right text-[10px] font-black uppercase tracking-widest">Calibration Qty</TableHead>
                                  <TableHead className="w-[80px] text-left text-[10px] font-black uppercase tracking-widest">Unit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(() => {
                                  const renderItemRow = (item: any) => {
                                    const isChecked = !!checkedIngredients[item.ingredientId];
                                    return (
                                      <TableRow key={item.ingredientId} className={isChecked ? "" : "opacity-50"}>
                                        <TableCell className="text-center">
                                          <Checkbox 
                                            checked={isChecked} 
                                            onCheckedChange={(checked) => {
                                              setCheckedIngredients(prev => ({
                                                ...prev,
                                                [item.ingredientId]: !!checked
                                              }));
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell className="font-bold">
                                          {item.ingredientName}
                                          <div className="text-[9px] text-muted-foreground uppercase font-semibold">Role: {item.slotLabel}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Input 
                                            type="number" 
                                            value={customQuantities[item.ingredientId] ?? ""} 
                                            onChange={(e) => {
                                              setCustomQuantities(prev => ({
                                                ...prev,
                                                [item.ingredientId]: e.target.value
                                              }));
                                            }}
                                            disabled={!isChecked}
                                            className="h-10 text-right font-black w-24 ml-auto"
                                          />
                                        </TableCell>
                                        <TableCell className="text-left font-bold text-muted-foreground uppercase text-xs">
                                          {item.unit}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  };

                                  const defaultUsage = drinkUsage.filter((item: any) => item.isDefault);
                                  const otherUsage = drinkUsage.filter((item: any) => !item.isDefault);

                                  return (
                                    <>
                                      {defaultUsage.length > 0 && (
                                        <>
                                          <TableRow className="bg-muted/10 hover:bg-transparent border-b">
                                            <TableCell colSpan={4} className="py-2 pl-4 text-[10px] font-black uppercase tracking-widest text-primary">
                                              Default (Standard) Options
                                            </TableCell>
                                          </TableRow>
                                          {defaultUsage.map(renderItemRow)}
                                        </>
                                      )}
                                      {otherUsage.length > 0 && (
                                        <>
                                          <TableRow className="bg-muted/10 hover:bg-transparent border-b">
                                            <TableCell colSpan={4} className="py-2 pl-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                              Other Options (Optional / Customizations)
                                            </TableCell>
                                          </TableRow>
                                          {otherUsage.map(renderItemRow)}
                                        </>
                                      )}
                                    </>
                                  );
                                })()}
                              </TableBody>
                            </Table>
                          </div>

                          <div className="flex flex-col md:flex-row gap-6 items-end p-6 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="flex-1 space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Notes / Purpose (for all added items)</Label>
                              <Input 
                                placeholder="e.g. Batch calibration for Caffè Latte recipe"
                                className="h-14 bg-background border-primary/20"
                                value={drinkNoteInput}
                                onChange={(e) => setDrinkNoteInput(e.target.value)}
                              />
                            </div>
                            <div className="w-full md:w-[160px] md:shrink-0 space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Deduction Type</Label>
                              <Select value={adjustmentType} onValueChange={(val: "calibration" | "testing") => setAdjustmentType(val)}>
                                <SelectTrigger className="h-14 font-bold border-primary/20 bg-background">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="calibration" className="font-bold">Calibration</SelectItem>
                                  <SelectItem value="testing" className="font-bold">Testing</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={addDrinkIngredients}
                              className="h-14 px-8 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
                            >
                              <Plus className="h-5 w-5 mr-2 stroke-[3px]" /> Add Checked Items
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/10 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">All Stock Levels</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="w-[40%] text-[10px] font-black uppercase tracking-widest">Item</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Type</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isIngredientsLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8">Loading stock data...</TableCell></TableRow>
                  ) : ingredients.slice(0, 5).map((ing: any) => (
                    <TableRow key={ing.id}>
                      <TableCell className="font-bold">{ing.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[9px] uppercase">{ing.ingredientType}</Badge></TableCell>
                      <TableCell className="text-right font-black">{ing.stockQuantity} <span className="text-[10px] text-muted-foreground uppercase">{ing.unit}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t text-center">
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100" onClick={() => window.location.href='/admin/operations/stock-quantities'}>
                  View Full Inventory <Plus className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary & Confirm */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xl border-primary/20 rounded-3xl overflow-hidden flex flex-col h-full sticky top-8">
            <CardHeader className="bg-primary text-primary-foreground p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Adjustment List</CardTitle>
                  <CardDescription className="text-primary-foreground/70 uppercase text-[10px] font-bold tracking-widest">Items pending stock deduction</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-black">
                  {adjustmentList.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-[400px]">
              <ScrollArea className="flex-1 px-6 py-6">
                {adjustmentList.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground opacity-30">
                    <Beaker className="h-16 w-16 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">No items added</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adjustmentList.map((item) => (
                      <div key={`${item.ingredientId}-${item.unitId || "base"}-${item.movementType}`} className="group p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-background transition-all flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm">{item.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] font-black uppercase py-0.5 px-1.5 rounded-full ${
                                item.movementType === "calibration" 
                                  ? "border-amber-500 text-amber-600 bg-amber-50" 
                                  : "border-cyan-500 text-cyan-600 bg-cyan-50"
                              }`}
                            >
                              {item.movementType === "calibration" ? "Calib" : "Test"}
                            </Badge>
                          </div>
                          {item.note && <div className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">{item.note}</div>}
                          <div className="text-lg font-black text-primary">-{item.quantity} <span className="text-xs uppercase text-muted-foreground">{item.displayUnit}</span></div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.ingredientId, item.unitId, item.movementType)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-6 bg-muted/30 border-t space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 text-amber-600 border border-amber-500/20 text-xs font-bold leading-relaxed">
                  <Info className="h-5 w-5 shrink-0" />
                  These adjustments will be recorded as 'Calibration' or 'Testing' in the ledger and will NOT affect revenue.
                </div>
                <Button 
                  className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 glow-primary"
                  disabled={adjustmentList.length === 0 || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CheckCircle2 className="h-6 w-6 mr-2" /> Confirm Deduction</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}
