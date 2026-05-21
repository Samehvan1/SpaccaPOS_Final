import { useState } from "react";
import { useRestockIngredient, useListIngredients } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  ingredientType: string;
  stockQuantity: number;
  lowStockThreshold: number;
  conversions: { id: number; unitName: string; conversionFactor: string | number }[];
};

type DeliveryItem = {
  ingredientId: string;
  quantity: string;
  unitId: string;
  note: string;
};

export default function ReceiveDeliveryPage() {
  const { selectedBranchId } = useAuth();
  const { data: ingredientsData } = useListIngredients({
    active: true,
    branchId: (selectedBranchId === null || selectedBranchId === undefined) ? 'all' : selectedBranchId,
  } as any);
  const ingredients = ingredientsData as unknown as Ingredient[];
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({});
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([
    { ingredientId: "", quantity: "", unitId: "base", note: "" },
  ]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: restockSingle } = useRestockIngredient({
    mutation: {
      onError: () => {
        toast({ variant: "destructive", title: "Failed to update one or more stock entries" });
      },
    },
  });

  const updateItem = (index: number, key: keyof DeliveryItem, value: string) => {
    setDeliveryItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  };

  const addItem = () => {
    setDeliveryItems((prev) => [...prev, { ingredientId: "", quantity: "", unitId: "base", note: "" }]);
  };

  const removeItem = (index: number) => {
    setDeliveryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedBranchId) {
      toast({
        variant: "destructive",
        title: "Select a branch first",
        description: "You must select a specific branch to update its stock.",
      });
      return;
    }

    const validItems = deliveryItems.filter(
      (item) => item.ingredientId !== "" && item.quantity !== "" && !isNaN(parseFloat(item.quantity)),
    );
    if (validItems.length === 0) {
      toast({ variant: "destructive", title: "No valid items entered" });
      return;
    }

    setIsSubmitting(true);
    let saved = 0;
    for (const item of validItems) {
      const itemNote = [note, item.note].filter(Boolean).join(" · ");
      restockSingle({
        id: parseInt(item.ingredientId),
        data: {
          quantity: parseFloat(item.quantity),
          unitId: item.unitId === "base" ? undefined : parseInt(item.unitId),
          note: itemNote || undefined,
          branchId: selectedBranchId,
        } as any,
      });
      saved++;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: `Received delivery for ${saved} ingredient${saved !== 1 ? "s" : ""}` });
      setLocation("/admin/stock");
    }, 800);
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/stock">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Receive Delivery / Restock</h1>
          <p className="text-muted-foreground mt-1">Record incoming stock for one or more ingredients.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Notes */}
          <div className="grid gap-2 max-w-lg">
            <Label htmlFor="delivery-note">Delivery Notes / Invoice (Optional)</Label>
            <Input
              id="delivery-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Invoice #1234, Supplier Delivery"
            />
          </div>

          <Separator />

          {/* Delivery Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase tracking-wider">Delivery Items</Label>
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {deliveryItems.map((item, index) => {
                const selectedIng = ingredients?.find(
                  (i) => i.id.toString() === item.ingredientId,
                );
                return (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-muted/20 relative space-y-2"
                  >
                    {/* Top row: ingredient, qty, unit, remove */}
                    <div className="flex gap-3 items-end">
                      {/* Ingredient selector */}
                      <div className="flex-1 min-w-0 grid gap-1.5">
                        <Label className="text-xs">Ingredient</Label>
                        <Popover
                          open={openPopovers[index] || false}
                          onOpenChange={(open) =>
                            setOpenPopovers((prev) => ({ ...prev, [index]: open }))
                          }
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
                                        setOpenPopovers((prev) => ({ ...prev, [index]: false }));
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          item.ingredientId === ing.id.toString()
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span>{ing.name}</span>
                                        <span className="text-[10px] text-muted-foreground capitalize">
                                          {ing.ingredientType} · {ing.unit}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Quantity */}
                      <div className="w-[120px] grid gap-1.5">
                        <Label htmlFor={`qty-${index}`} className="text-xs">
                          Quantity
                        </Label>
                        <Input
                          id={`qty-${index}`}
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          placeholder="0.00"
                          className="h-10"
                        />
                      </div>

                      {/* Unit */}
                      <div className="w-[120px] grid gap-1.5">
                        <Label className="text-xs">Unit</Label>
                        <Select
                          value={item.unitId}
                          onValueChange={(val) => updateItem(index, "unitId", val)}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="base">
                              {selectedIng ? selectedIng.unit : "Unit"}
                            </SelectItem>
                            {selectedIng?.conversions?.map((c: any) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.unitName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Remove */}
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

                    {/* Bottom row: per-item note */}
                    <div className="grid gap-1">
                      <Label htmlFor={`item-note-${index}`} className="text-xs text-muted-foreground">
                        Item Note (optional)
                      </Label>
                      <Input
                        id={`item-note-${index}`}
                        value={item.note}
                        onChange={(e) => updateItem(index, "note", e.target.value)}
                        placeholder="e.g. Exp: 2026-08-15, damaged packaging, different brand..."
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/stock">Cancel</Link>
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving Delivery..." : "Save Delivery"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
