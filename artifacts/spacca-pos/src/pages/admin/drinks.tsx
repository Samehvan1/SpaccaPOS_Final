import { useState, useRef } from "react";
import { useListDrinks, useUpdateDrink, useCreateDrink, useDeleteDrink } from "@workspace/api-client-react";
import { fmt } from "@/lib/currency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Search, Edit, FlaskConical, Tag, Upload, X, ImageIcon, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type DrinkCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type Drink = {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  categoryId?: number | null;
  basePrice: number;
  isActive: boolean;
  prepTimeSeconds: number;
  kitchenStation?: string;
  sortOrder?: number;
  imageUrl?: string | null;
};

type Mode = "add" | "edit" | null;

const KITCHEN_STATIONS = [
  { value: "main", label: "Main Bar" },
  { value: "arabian", label: "Arabian Coffee" },
  { value: "espresso", label: "Espresso Bar" },
  { value: "cold", label: "Cold Bar" },
  { value: "pastry", label: "Pastry / Food" },
];

function useDrinkCategories() {
  return useQuery<DrinkCategory[]>({
    queryKey: ["drink-categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/drink-categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
}

export default function DrinksAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const { data: drinks, isLoading, refetch } = useListDrinks();
  const { data: categories = [] } = useDrinkCategories();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("coffee");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [basePrice, setBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [prepTime, setPrepTime] = useState("120");
  const [kitchenStation, setKitchenStation] = useState("main");
  const [sortOrder, setSortOrder] = useState("0");

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createDrink, isPending: isCreating } = useCreateDrink({
    mutation: {
      onSuccess: async (data: any) => {
        if (imageFile && data?.id) {
          await uploadImage(data.id);
        }
        toast({ title: "Drink created" });
        setMode(null);
        resetForm();
        refetch();
      },
      onError: () => toast({ variant: "destructive", title: "Failed to create drink" })
    }
  });

  const { mutate: updateDrink, isPending: isUpdating } = useUpdateDrink({
    mutation: {
      onSuccess: async () => {
        if (imageFile && editId !== null) {
          await uploadImage(editId);
        }
        toast({ title: "Drink updated" });
        setMode(null);
        resetForm();
        refetch();
      },
      onError: () => toast({ variant: "destructive", title: "Failed to update drink" })
    }
  });

  const { mutate: deleteDrink } = useDeleteDrink({
    mutation: {
      onSuccess: () => {
        toast({ title: "Drink deleted" });
        refetch();
      },
      onError: (err: any) => {
        const msg = err.data?.error || "Failed to delete drink";
        toast({ variant: "destructive", title: "Deletion Failed", description: msg });
      }
    }
  });

  const uploadImage = async (drinkId: number) => {
    if (!imageFile) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await fetch(`${API_BASE}/drinks/${drinkId}/image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Image upload failed");
    } catch {
      toast({ variant: "destructive", title: "Image upload failed" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setDescription("");
    setCategory("coffee");
    setCategoryId(null);
    setBasePrice("");
    setIsActive(true);
    setPrepTime("120");
    setKitchenStation("main");
    setSortOrder("0");
    setImagePreview(null);
    setImageFile(null);
  };

  const openAdd = () => {
    resetForm();
    setMode("add");
  };

  const openEdit = (drink: Drink) => {
    setEditId(drink.id);
    setName(drink.name);
    setDescription(drink.description ?? "");
    setCategory(drink.category);
    setCategoryId(drink.categoryId ?? null);
    setBasePrice(String(drink.basePrice));
    setIsActive(drink.isActive);
    setPrepTime(String(drink.prepTimeSeconds));
    setKitchenStation(drink.kitchenStation ?? "main");
    setSortOrder(String(drink.sortOrder ?? 0));
    setImagePreview(drink.imageUrl ?? null);
    setImageFile(null);
    setMode("edit");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!name || !basePrice) return;
    const payload: any = {
      name,
      description: description || undefined,
      category: categoryId
        ? (categories.find(c => c.id === categoryId)?.name ?? category)
        : category,
      categoryId: categoryId ?? undefined,
      basePrice: parseFloat(basePrice),
      isActive,
      prepTimeSeconds: parseInt(prepTime) || 120,
      kitchenStation,
      sortOrder: parseInt(sortOrder) || 0,
    };
    if (mode === "add") {
      createDrink({ data: payload });
    } else if (mode === "edit" && editId !== null) {
      updateDrink({ id: editId, data: payload });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this drink? This action cannot be undone.")) {
      deleteDrink({ id });
    }
  };

   const filteredDrinks = drinks?.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = d.isActive || showInactive;
    return matchesSearch && matchesStatus;
  });

  const isPending = isCreating || isUpdating || isUploadingImage;

  // Map categoryId → category name for display
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Drinks Menu</h1>
            <p className="text-muted-foreground mt-1">Manage your active products and pricing.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/admin/categories">
              <Tag className="h-4 w-4" /> Categories
            </Link>
          </Button>
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> New Drink
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drinks..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border bg-muted/20">
              <Switch 
                id="show-inactive-drinks" 
                checked={showInactive} 
                onCheckedChange={setShowInactive} 
              />
              <Label htmlFor="show-inactive-drinks" className="text-xs font-medium cursor-pointer">
                Show Inactive
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredDrinks?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No drinks found.</TableCell>
                  </TableRow>
                ) : (
                  filteredDrinks?.map(drink => (
                    <TableRow key={drink.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(drink as any).imageUrl ? (
                            <img
                              src={(drink as any).imageUrl}
                              alt={drink.name}
                              className="h-8 w-8 rounded object-cover shrink-0 border"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0 border">
                              <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{drink.name}</div>
                            {drink.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[180px]">{drink.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {(drink as any).categoryId && catMap.has((drink as any).categoryId)
                          ? catMap.get((drink as any).categoryId)
                          : drink.category}
                      </TableCell>
                      <TableCell>{fmt(drink.basePrice)}</TableCell>
                      <TableCell className="text-muted-foreground">{(drink as any).sortOrder ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={drink.isActive ? "default" : "secondary"}>
                          {drink.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8" asChild>
                            <Link href={`/admin/drinks/${drink.id}/recipe`}>
                              <FlaskConical className="h-3.5 w-3.5" />
                              Recipe
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(drink as Drink)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(drink.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={mode !== null} onOpenChange={open => { if (!open) { setMode(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "New Drink" : "Edit Drink"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">

            {/* Image Upload */}
            <div className="grid gap-2">
              <Label>Product Image</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-28 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-background border rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={e => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">Click to upload an image<br /><span className="text-xs">PNG, JPG, WEBP · max 5 MB</span></p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="d-name">Name</Label>
              <Input id="d-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Oat Milk Latte" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="d-desc">Description</Label>
              <Input id="d-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              {categories.length > 0 ? (
                <Select
                  value={categoryId !== null ? String(categoryId) : "__none__"}
                  onValueChange={val => {
                    if (val === "__none__") { setCategoryId(null); }
                    else { setCategoryId(parseInt(val)); }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No category</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={String(c.id)} className="capitalize">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/30">
                  No categories yet —{" "}
                  <Link href="/admin/categories" className="text-primary underline">create one first</Link>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="d-price">Base Price (E£)</Label>
                <Input id="d-price" type="number" step="5" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="e.g. 130" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="d-sort">Sort Order</Label>
                <Input id="d-sort" type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="d-prep">Prep Time (sec)</Label>
              <Input id="d-prep" type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Kitchen Station</Label>
              <Select value={kitchenStation} onValueChange={setKitchenStation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KITCHEN_STATIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {mode === "edit" && (
              <div className="flex items-center gap-3 pt-1">
                <Switch id="d-active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="d-active">{isActive ? "Active — visible on POS" : "Inactive — hidden from POS"}</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setMode(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending || !name || !basePrice}>
              {isPending ? "Saving..." : mode === "add" ? "Create Drink" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
