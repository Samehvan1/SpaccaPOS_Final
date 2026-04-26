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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, PackageOpen, Download } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function StockAdmin() {
  const { data: movements, isLoading, refetch: refetchMovements } = useListStockMovements();
  const { data: lowStock, refetch: refetchLowStock } = useGetLowStockIngredients();
  const { data: ingredients, refetch: refetchIngredients } = useListIngredients({ active: true });
  const { toast } = useToast();

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  // Startup stock state: map of ingredientId → input value
  const [startupValues, setStartupValues] = useState<Record<number, string>>({});
  const [isSavingStartup, setIsSavingStartup] = useState(false);

  const { mutate: restock, isPending: isRestocking } = useRestockIngredient({
    mutation: {
      onSuccess: () => {
        toast({ title: "Stock Updated" });
        setIsRestockOpen(false);
        setQuantity("");
        setNote("");
        refetchMovements();
        refetchLowStock();
        refetchIngredients();
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to update stock" });
      }
    }
  });

  const { mutate: restockSingle } = useRestockIngredient({
    mutation: {
      onError: () => {
        toast({ variant: "destructive", title: "Failed to update one or more stock entries" });
      }
    }
  });

  const handleRestock = () => {
    if (!selectedIngredient || !quantity) return;
    restock({
      id: parseInt(selectedIngredient),
      data: {
        quantity: parseFloat(quantity),
        note: note || undefined
      }
    });
  };

  const handleSaveStartupStock = async () => {
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
          note: "Opening / startup stock entry"
        }
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Receive Delivery / Restock</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Ingredient</Label>
                <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                  <SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                  <SelectContent>
                    {ingredients?.map(ing => (
                      <SelectItem key={ing.id} value={ing.id.toString()}>{ing.name} ({ing.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qty">Quantity Added</Label>
                <Input id="qty" type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Notes (Optional)</Label>
                <Input id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Invoice #1234" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRestockOpen(false)}>Cancel</Button>
              <Button onClick={handleRestock} disabled={isRestocking}>Save</Button>
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
