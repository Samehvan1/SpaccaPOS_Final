import { useState } from "react";
import { useListStockMovements, useGetLowStockIngredients, useRestockIngredient, useListIngredients } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, PackageOpen, Download, Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  ingredientType: string;
  stockQuantity: number;
  lowStockThreshold: number;
  conversions: { id: number; unitName: string; conversionFactor: string | number }[];
};

export default function StockAdmin() {
  const { selectedBranchId } = useAuth();
  const { data: movements, isLoading, refetch: refetchMovements } = useListStockMovements({ 
    branchId: (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId 
  } as any);
  const { data: lowStock, refetch: refetchLowStock } = useGetLowStockIngredients({ 
    branchId: (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId 
  } as any);
  const { data: ingredientsData, refetch: refetchIngredients } = useListIngredients({ 
    active: true,
    branchId: (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId 
  } as any);
  const ingredients = ingredientsData as unknown as Ingredient[];

  const { toast } = useToast();

  type DeliveryItem = {
    ingredientId: string;
    quantity: string;
    unitId: string;
  };

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({});
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([
    { ingredientId: "", quantity: "", unitId: "base" }
  ]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Startup stock state: map of ingredientId → input value
  const [startupValues, setStartupValues] = useState<Record<number, string>>({});
  const [isSavingStartup, setIsSavingStartup] = useState(false);

  const updateItem = (index: number, key: keyof DeliveryItem, value: string) => {
    setDeliveryItems(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const addItem = () => {
    setDeliveryItems(prev => [...prev, { ingredientId: "", quantity: "", unitId: "base" }]);
  };

  const removeItem = (index: number) => {
    setDeliveryItems(prev => prev.filter((_, i) => i !== index));
  };

  const { mutate: restockSingle } = useRestockIngredient({
    mutation: {
      onError: () => {
        toast({ variant: "destructive", title: "Failed to update one or more stock entries" });
      }
    }
  });

  const handleRestock = () => {
    if (!selectedBranchId) {
      toast({ variant: "destructive", title: "Select a branch first", description: "You must select a specific branch to update its stock." });
      return;
    }

    const validItems = deliveryItems.filter(item => item.ingredientId !== "" && item.quantity !== "" && !isNaN(parseFloat(item.quantity)));
    if (validItems.length === 0) {
      toast({ variant: "destructive", title: "No valid items entered" });
      return;
    }

    setIsSubmitting(true);
    let saved = 0;
    for (const item of validItems) {
      restockSingle({
        id: parseInt(item.ingredientId),
        data: {
          quantity: parseFloat(item.quantity),
          unitId: item.unitId === "base" ? undefined : parseInt(item.unitId),
          note: note || undefined,
          branchId: selectedBranchId
        } as any
      });
      saved++;
    }

    setTimeout(() => {
      refetchMovements();
      refetchLowStock();
      refetchIngredients();
      setIsSubmitting(false);
      setIsRestockOpen(false);
      setDeliveryItems([{ ingredientId: "", quantity: "", unitId: "base" }]);
      setNote("");
      toast({ title: `Received delivery for ${saved} ingredient${saved !== 1 ? "s" : ""}` });
    }, 800);
  };

  const handleSaveStartupStock = async () => {
    if (!selectedBranchId) {
      toast({ variant: "destructive", title: "Select a branch first", description: "You must select a specific branch to update its stock." });
      return;
    }
    const entries = Object.entries(startupValues).filter(([, v]) => v !== "" && !isNaN(parseFloat(v)));
    if (entries.length === 0) {
      toast({ variant: "destructive", title: "No quantities entered" });
      return;
    }

    setIsSavingStartup(true);
    let saved = 0;
    for (const [id, val] of entries) {
      const ing = ingredients?.find(i => i.id === parseInt(id));
      if (!ing) continue;
      const target = parseFloat(val);
      const current = ing.stockQuantity ?? 0;
      const diff = target - current;
      restockSingle({
        id: parseInt(id),
        data: {
          quantity: diff,
          note: "Opening / startup stock entry",
          branchId: selectedBranchId
        } as any
      });
      saved++;
    }

    setTimeout(() => {
      refetchMovements();
      refetchLowStock();
      refetchIngredients();
      setStartupValues({});
      setIsSavingStartup(false);
      toast({ title: `Startup stock saved for ${saved} ingredient${saved !== 1 ? "s" : ""}` });
    }, 800);
  };

  const handleExportStock = () => {
    if (!ingredients || ingredients.length === 0) {
      toast({ variant: "destructive", title: "No ingredients to export" });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `Current_Stock_${timestamp}.csv`;

    const header = ['Name', 'Type', 'Unit', 'Current Stock', 'Low Stock Threshold', 'Status'];
    const rows = ingredients.map(ing => {
      const stock = Number(ing.stockQuantity ?? 0);
      const threshold = Number(ing.lowStockThreshold ?? 0);
      const status = stock <= threshold ? 'Low Stock' : 'OK';
      return [
        `"${(ing.name || '').replace(/"/g, '""')}"`,
        ing.ingredientType,
        ing.unit,
        stock,
        threshold,
        status,
      ].join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: `Stock exported as ${filename}` });
  };

  const getMovementIcon = (type: string) => {
    if (type === 'restock' || type === 'opening') return <ArrowDownToLine className="h-4 w-4 text-green-500" />;
    return <ArrowUpFromLine className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Stock Management</h1>
            <p className="text-muted-foreground mt-1">Track inventory movements and record deliveries.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportStock}>
            <Download className="h-4 w-4" /> Export Stock
          </Button>
          <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Receive Delivery
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Receive Delivery / Restock</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4 flex-1 overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="delivery-note">Delivery Notes / Invoice (Optional)</Label>
                  <Input 
                    id="delivery-note" 
                    value={note} 
                    onChange={e => setNote(e.target.value)} 
                    placeholder="e.g. Invoice #1234, Supplier Delivery" 
                  />
                </div>

                <Separator className="my-2" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold uppercase tracking-wider">Delivery Items</Label>
                    <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addItem}>
                      <Plus className="h-3.5 w-3.5" /> Add Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {deliveryItems.map((item, index) => {
                      const selectedIng = ingredients?.find(i => i.id.toString() === item.ingredientId);
                      return (
                        <div key={index} className="flex gap-3 items-end p-3 rounded-lg border bg-muted/20 relative">
                          <div className="flex-1 min-w-0 grid gap-1.5">
                            <Label className="text-xs">Ingredient</Label>
                            <Popover 
                              open={openPopovers[index] || false} 
                              onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [index]: open }))}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between font-normal text-left h-10"
                                >
                                  {item.ingredientId && selectedIng
                                    ? `${selectedIng.name} (${selectedIng.unit})`
                                    : "Select ingredient..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[350px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Search ingredient..." />
                                  <CommandList className="max-h-[250px] overflow-y-auto">
                                    <CommandEmpty>No ingredient found.</CommandEmpty>
                                    <CommandGroup>
                                      {ingredients?.map((ing) => (
                                        <CommandItem
                                          key={ing.id}
                                          value={ing.name}
                                          onSelect={() => {
                                            updateItem(index, "ingredientId", ing.id.toString());
                                            updateItem(index, "unitId", "base");
                                            setOpenPopovers(prev => ({ ...prev, [index]: false }));
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              item.ingredientId === ing.id.toString() ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <div className="flex flex-col">
                                            <span>{ing.name}</span>
                                            <span className="text-[10px] text-muted-foreground capitalize">{ing.ingredientType} · {ing.unit}</span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="w-[120px] grid gap-1.5">
                            <Label htmlFor={`qty-${index}`} className="text-xs">Quantity</Label>
                            <Input
                              id={`qty-${index}`}
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={e => updateItem(index, "quantity", e.target.value)}
                              placeholder="0.00"
                              className="h-10"
                            />
                          </div>

                          <div className="w-[120px] grid gap-1.5">
                            <Label className="text-xs">Unit</Label>
                            <Select value={item.unitId} onValueChange={val => updateItem(index, "unitId", val)}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="base">
                                  {selectedIng ? selectedIng.unit : "Unit"}
                                </SelectItem>
                                {selectedIng?.conversions?.map((c: any) => (
                                  <SelectItem key={c.id} value={String(c.id)}>{c.unitName}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {deliveryItems.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10 shrink-0" 
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="border-t pt-4 bg-background">
                <Button variant="outline" onClick={() => setIsRestockOpen(false)}>Cancel</Button>
                <Button onClick={handleRestock} disabled={isSubmitting}>
                  {isSubmitting ? "Saving Delivery..." : "Save Delivery"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {lowStock && lowStock.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3 bg-destructive/5">
            <CardTitle className="text-destructive flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStock.map(ing => (
              <div key={ing.id} className="flex justify-between items-center p-3 border rounded bg-background">
                <div>
                  <div className="font-bold">{ing.name}</div>
                  <div className="text-sm text-muted-foreground">Threshold: {ing.lowStockThreshold} {ing.unit}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-destructive text-lg">{ing.stockQuantity}</div>
                  <div className="text-xs text-muted-foreground">{ing.unit}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="movements">
        <TabsList className="mb-2">
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="startup" className="gap-1.5">
            <PackageOpen className="h-4 w-4" /> Startup Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Stock After</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : movements?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No recent movements.</TableCell>
                      </TableRow>
                    ) : (
                      movements?.map(mov => (
                        <TableRow key={mov.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(mov.createdAt), "MMM d, yyyy h:mm a")}
                          </TableCell>
                          <TableCell className="font-medium">{mov.ingredientName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 capitalize">
                              {getMovementIcon(mov.movementType)}
                              <span>{mov.movementType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={mov.quantity > 0 ? "text-green-600" : "text-destructive"}>
                              {mov.quantity > 0 ? "+" : ""}{mov.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono">{mov.quantityAfter}</TableCell>
                          <TableCell>{mov.createdByName}</TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                            {mov.note || (mov.orderId ? `Order #${mov.orderId}` : "-")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="startup">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PackageOpen className="h-5 w-5 text-primary" />
                    Enter Startup / Opening Stock
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set the current quantity on hand for each ingredient. Leave blank to skip.
                    The system will record the difference as an opening stock entry.
                  </p>
                </div>
                <Button onClick={handleSaveStartupStock} disabled={isSavingStartup} className="shrink-0">
                  {isSavingStartup ? "Saving…" : "Save All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right w-48">Set Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!ingredients ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">Loading…</TableCell>
                      </TableRow>
                    ) : ingredients.filter(i => i.unit !== "").map(ing => (
                      <TableRow key={ing.id}>
                        <TableCell className="font-medium">{ing.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">{ing.ingredientType}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={(ing.stockQuantity ?? 0) <= (ing.lowStockThreshold ?? 0) ? "text-destructive font-bold" : ""}>
                            {ing.stockQuantity ?? 0}
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">{ing.unit}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={String(ing.stockQuantity ?? 0)}
                              value={startupValues[ing.id] ?? ""}
                              onChange={e => setStartupValues(prev => ({ ...prev, [ing.id]: e.target.value }))}
                              className="w-32 text-right"
                            />
                            <span className="text-muted-foreground text-xs w-8 shrink-0">{ing.unit}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
