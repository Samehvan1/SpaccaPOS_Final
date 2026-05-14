import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, CheckCircle2, Lock, Loader2, Trash, AlertTriangle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WastageItem {
  ingredientId: number;
  name: string;
  quantity: number;
  unit: string;
  reason: string;
  note?: string;
}

const WASTE_REASONS = [
  "Expired",
  "Spilled/Dropped",
  "Incorrect Preparation",
  "Defective/Damaged",
  "Customer Return",
  "Theft/Missing",
  "Other"
];

export default function WastagePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthorized, setIsAuthorized] = useState(user?.role === "admin");
  const [adminPin, setAdminPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [wastageList, setWastageList] = useState<WastageItem[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [reasonInput, setReasonInput] = useState("Expired");
  const [noteInput, setNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all ingredients
  const { data: ingredients = [], isLoading: isIngredientsLoading } = useQuery({
    queryKey: ["/api/ingredients"],
    queryFn: async () => {
      const res = await fetch("/api/ingredients");
      if (!res.ok) throw new Error("Failed to fetch ingredients");
      return res.json();
    },
  });

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
      toast({ title: "Authorized", description: "Wastage access granted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid admin PIN." });
      setAdminPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  const addItem = () => {
    if (!selectedIngredient || !quantityInput || !reasonInput) return;
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      toast({ variant: "destructive", title: "Invalid Quantity", description: "Please enter a valid positive number." });
      return;
    }

    // Check if same item with same reason exists
    const existingIndex = wastageList.findIndex(item => item.ingredientId === selectedIngredient.id && item.reason === reasonInput);
    if (existingIndex > -1) {
      const newList = [...wastageList];
      newList[existingIndex].quantity += qty;
      setWastageList(newList);
    } else {
      setWastageList([...wastageList, {
        ingredientId: selectedIngredient.id,
        name: selectedIngredient.name,
        quantity: qty,
        unit: selectedIngredient.unit,
        reason: reasonInput,
        note: noteInput
      }]);
    }

    setSelectedIngredient(null);
    setQuantityInput("");
    setNoteInput("");
    setSearchQuery("");
  };

  const removeItem = (id: number, reason: string) => {
    setWastageList(wastageList.filter(item => !(item.ingredientId === id && item.reason === reason)));
  };

  const handleSubmit = async () => {
    if (wastageList.length === 0) return;
    setIsSubmitting(true);
    try {
      for (const item of wastageList) {
        const res = await fetch("/api/stock/adjustments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredientId: item.ingredientId,
            movementType: "waste",
            quantity: item.quantity,
            note: `Waste (${item.reason})${item.note ? `: ${item.note}` : ""}`
          }),
        });
        if (!res.ok) throw new Error(`Failed to adjust ${item.name}`);
      }

      toast({ title: "Success", description: "Stock updated successfully for wastage." });
      setWastageList([]);
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
        <Card className="w-full max-w-md shadow-2xl border-destructive/20">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tighter uppercase">Admin Authorization</CardTitle>
            <CardDescription>Enter Admin PIN to access Wastage Tracking</CardDescription>
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
                  className="h-14 text-center text-2xl tracking-[0.5em] font-black bg-muted/50 border-destructive/20"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                variant="destructive"
                className="w-full h-14 font-black uppercase tracking-widest text-lg shadow-lg shadow-destructive/20"
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
    <div className="p-4 md:p-8 w-full flex flex-col gap-6 max-w-7xl mx-auto overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
            <Trash className="h-8 w-8 text-destructive" />
            Wastage <span className="text-destructive">Tracking</span>
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest mt-1">Audit-ready stock deduction for wasted inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3 border-destructive/30 text-destructive bg-destructive/5 font-black uppercase tracking-tight">
            Admin Mode Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Selection */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-lg border-destructive/10 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-destructive">Select Wasted Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
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
                  <div className="max-h-[300px] overflow-y-auto rounded-xl border border-destructive/10 bg-card divide-y">
                    {filteredIngredients.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground italic">No ingredients found</div>
                    ) : (
                      filteredIngredients.map((ing: any) => (
                        <div 
                          key={ing.id}
                          className={`p-4 flex items-center justify-between cursor-pointer hover:bg-destructive/5 transition-colors ${selectedIngredient?.id === ing.id ? 'bg-destructive/10 border-destructive/20' : ''}`}
                          onClick={() => setSelectedIngredient(ing)}
                        >
                          <div>
                            <div className="font-bold">{ing.name}</div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{ing.ingredientType} • Stock: {ing.stockQuantity} {ing.unit}</div>
                          </div>
                          {selectedIngredient?.id === ing.id && <CheckCircle2 className="h-5 w-5 text-destructive" />}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedIngredient && (
                <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1">Quantity wasted ({selectedIngredient.unit})</Label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="h-14 text-2xl font-black bg-background border-destructive/20"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1">Reason for wastage</Label>
                      <Select value={reasonInput} onValueChange={setReasonInput}>
                        <SelectTrigger className="h-14 text-lg font-bold border-destructive/20 bg-background">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {WASTE_REASONS.map((r) => (
                            <SelectItem key={r} value={r} className="font-bold">{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1">Additional Notes</Label>
                    <Input 
                      placeholder="e.g. Fridge failure during night shift"
                      className="h-14 bg-background border-destructive/20"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={addItem}
                    variant="destructive"
                    className="w-full h-14 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-destructive/20"
                  >
                    <Plus className="h-5 w-5 mr-2 stroke-[3px]" /> Add to Wastage List
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-destructive/10 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-destructive">Recent Adjustments</CardTitle>
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary & Confirm */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xl border-destructive/20 rounded-3xl overflow-hidden flex flex-col h-full sticky top-8">
            <CardHeader className="bg-destructive text-destructive-foreground p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Wastage Summary</CardTitle>
                  <CardDescription className="text-destructive-foreground/70 uppercase text-[10px] font-bold tracking-widest">Items pending audit deduction</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-black">
                  {wastageList.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-[400px]">
              <ScrollArea className="flex-1 px-6 py-6">
                {wastageList.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground opacity-30">
                    <AlertTriangle className="h-16 w-16 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">No wastage added</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wastageList.map((item) => (
                      <div key={`${item.ingredientId}-${item.reason}`} className="group p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-destructive/20 hover:bg-background transition-all flex items-center justify-between">
                        <div>
                          <div className="font-black text-sm">{item.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] uppercase font-bold border-destructive/20 text-destructive">{item.reason}</Badge>
                            {item.note && <span className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">{item.note}</span>}
                          </div>
                          <div className="text-lg font-black text-destructive mt-1">-{item.quantity} <span className="text-xs uppercase text-muted-foreground">{item.unit}</span></div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.ingredientId, item.reason)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-6 bg-muted/30 border-t space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 text-destructive border border-destructive/20 text-xs font-bold leading-relaxed">
                  <Info className="h-5 w-5 shrink-0" />
                  Wastage is recorded as 'Waste' in the ledger. Excessive wastage may trigger management review.
                </div>
                <Button 
                  variant="destructive"
                  className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-destructive/30 glow-destructive"
                  disabled={wastageList.length === 0 || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CheckCircle2 className="h-6 w-6 mr-2" /> Confirm Wastage</>}
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
