import { useState, useRef, useMemo } from "react";
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
import { ArrowLeft, Plus, Search, Edit, FlaskConical, Tag, Upload, X, ImageIcon, Trash2, Download, FileSpreadsheet, FileCode, Building2, Link2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

function slugifyStation(name: string) {
  if (!name || name === "main" || name === "main-bar") return "hot-bar"; 
  if (name === "cold") return "cold-bar";
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

function useKitchenStations() {
  return useQuery<any[]>({
    queryKey: ["kitchen-stations"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/kitchen-stations`);
      if (!res.ok) throw new Error("Failed to fetch stations");
      return res.json();
    },
  });
}

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
  const { selectedBranchId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const { data: drinks, isLoading, refetch } = useListDrinks({ branchId: selectedBranchId, includeSlots: true } as any);
  const { data: categories = [] } = useDrinkCategories();
  const { data: stations = [] } = useKitchenStations();
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
  const [kitchenStation, setKitchenStation] = useState("main-bar");
  const [sortOrder, setSortOrder] = useState("0");

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Availability Modal State
  const [availabilityDrink, setAvailabilityDrink] = useState<Drink | null>(null);
  const [availBranches, setAvailBranches] = useState<any[]>([]);
  const [availPartners, setAvailPartners] = useState<any[]>([]);
  const [availBranchStatuses, setAvailBranchStatuses] = useState<any[]>([]);
  const [availPartnerStatuses, setAvailPartnerStatuses] = useState<any[]>([]);
  const [availLoading, setAvailLoading] = useState(false);

  const openAvailabilityModal = async (d: Drink) => {
    setAvailabilityDrink(d);
    setAvailLoading(true);
    try {
      const [branchesRes, partnersRes, availRes] = await Promise.all([
        fetch(`${API_BASE}/admin/branches`, { credentials: "include" }),
        fetch(`${API_BASE}/admin/partners`, { credentials: "include" }),
        fetch(`${API_BASE}/admin/drinks/availability`, { credentials: "include" })
      ]);
      const [bData, pData, aData] = await Promise.all([
        branchesRes.json(),
        partnersRes.json(),
        availRes.json()
      ]);
      setAvailBranches(bData || []);
      setAvailPartners(pData || []);
      setAvailBranchStatuses(aData?.branchStatuses || []);
      setAvailPartnerStatuses(aData?.partnerStatuses || []);
    } catch {
      toast({ variant: "destructive", title: "Failed to load drink availability configuration" });
    } finally {
      setAvailLoading(false);
    }
  };

  const toggleBranchStatus = async (branchId: number, currentActive: boolean) => {
    if (!availabilityDrink) return;
    const newActive = !currentActive;
    try {
      const res = await fetch(`${API_BASE}/admin/drinks/branch-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ branchId, drinkId: availabilityDrink.id, isActive: newActive })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to update branch availability");
      }
      setAvailBranchStatuses(prev => {
        const existing = prev.find(s => s.branchId === branchId && s.drinkId === availabilityDrink.id);
        if (existing) {
          return prev.map(s => s.id === existing.id ? { ...s, isActive: newActive } : s);
        }
        return [...prev, { branchId, drinkId: availabilityDrink.id, isActive: newActive }];
      });
      toast({ title: `Updated branch availability to ${newActive ? "Active" : "Inactive"}` });
      refetch();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to update branch availability", description: e.message });
    }
  };

  const togglePartnerStatus = async (partnerId: number, currentActive: boolean) => {
    if (!availabilityDrink) return;
    const newActive = !currentActive;
    try {
      const res = await fetch(`${API_BASE}/admin/drinks/partner-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ partnerId, drinkId: availabilityDrink.id, isActive: newActive })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to update partner availability");
      }
      setAvailPartnerStatuses(prev => {
        const existing = prev.find(s => s.partnerId === partnerId && s.drinkId === availabilityDrink.id);
        if (existing) {
          return prev.map(s => s.id === existing.id ? { ...s, isActive: newActive } : s);
        }
        return [...prev, { partnerId, drinkId: availabilityDrink.id, isActive: newActive }];
      });
      toast({ title: `Updated partner availability to ${newActive ? "Active" : "Inactive"}` });
      refetch();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to update partner availability", description: e.message });
    }
  };
  
  const stats = useMemo(() => {
    if (!drinks) return { total: 0, active: 0, inactive: 0 };
    return {
      total: drinks.length,
      active: drinks.filter(d => d.isActive).length,
      inactive: drinks.filter(d => !d.isActive).length,
    };
  }, [drinks]);

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
    setKitchenStation("main-bar");
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

  const handleExportCSV = () => {
    const listToExport = filteredDrinks || [];
    if (listToExport.length === 0) {
      toast({ variant: "destructive", title: "No drinks to export" });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `Drinks_Menu_${timestamp}.csv`;

    const headers = [
      "ID",
      "Name",
      "Description",
      "Category",
      "Base Price (EGP)",
      "Standard Price (EGP)",
      "Cost (EGP)",
      "Profit Margin (%)",
      "Kitchen Station",
      "Prep Time (s)",
      "Sort Order",
      "Status",
      "Image URL"
    ];

    const rows = listToExport.map(drink => {
      const categoryName = (drink as any).categoryId && catMap.has((drink as any).categoryId)
        ? catMap.get((drink as any).categoryId)
        : drink.category;
      const standardPrice = (drink as any).defaultPrice ?? drink.basePrice;
      const cost = (drink as any).cost ?? 0;
      const profitMargin = standardPrice > 0 ? Number((((standardPrice - cost) / standardPrice) * 100).toFixed(2)) : 0;
      const statusStr = drink.isActive ? "Active" : "Inactive";
      const clean = (val: any) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };

      return [
        drink.id,
        clean(drink.name),
        clean(drink.description || ""),
        clean(categoryName),
        drink.basePrice,
        standardPrice,
        cost,
        profitMargin,
        clean(drink.kitchenStation || "main-bar"),
        drink.prepTimeSeconds ?? 120,
        (drink as any).sortOrder ?? 0,
        clean(statusStr),
        clean((drink as any).imageUrl || "")
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Drinks Exported", description: `Exported ${listToExport.length} drinks as ${filename}` });
  };

  const handleExportJSON = () => {
    const listToExport = filteredDrinks || [];
    if (listToExport.length === 0) {
      toast({ variant: "destructive", title: "No drinks to export" });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `Drinks_Menu_${timestamp}.json`;

    const exportData = listToExport.map(drink => {
      const categoryName = (drink as any).categoryId && catMap.has((drink as any).categoryId)
        ? catMap.get((drink as any).categoryId)
        : drink.category;
      const standardPrice = (drink as any).defaultPrice ?? drink.basePrice;
      const cost = (drink as any).cost ?? 0;
      const profitMargin = standardPrice > 0 ? Number((((standardPrice - cost) / standardPrice) * 100).toFixed(2)) : 0;
      return {
        id: drink.id,
        name: drink.name,
        description: drink.description || null,
        category: categoryName,
        categoryId: (drink as any).categoryId || null,
        basePrice: drink.basePrice,
        standardPrice,
        cost,
        profitMargin,
        kitchenStation: drink.kitchenStation || "main-bar",
        prepTimeSeconds: drink.prepTimeSeconds ?? 120,
        sortOrder: (drink as any).sortOrder ?? 0,
        isActive: drink.isActive,
        imageUrl: (drink as any).imageUrl || null
      };
    });

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Drinks Exported", description: `Exported ${listToExport.length} drinks as ${filename}` });
  };

  const extractSlotItems = (slot: any) => {
    const items: Array<{
      optionName: string;
      volumeName: string;
      processedQty: number | string;
      unit: string;
      extraCost: number | string;
      isDefaultOption: boolean;
      isDefaultVolume: boolean;
      isStandardSelection: boolean;
    }> = [];

    const typeOptions: any[] = slot.typeOptions || [];
    const ingOptions: any[] = slot.ingredient?.options || slot.options || [];

    if (typeOptions.length > 0) {
      typeOptions.forEach((to: any) => {
        const optName = to.typeName || to.categoryName || to.name || "Option";
        const vols: any[] = to.volumes || [];
        const isOptDefault = !!to.isDefault;

        if (vols.length > 0) {
          vols.forEach((v: any) => {
            const isVolDefault = !!v.isDefault;
            items.push({
              optionName: optName,
              volumeName: v.volumeName || "Standard",
              processedQty: v.processedQty ?? to.processedQty ?? 0,
              unit: v.unit || to.unit || "ml",
              extraCost: v.extraCost ?? to.extraCost ?? 0,
              isDefaultOption: isOptDefault,
              isDefaultVolume: isVolDefault,
              isStandardSelection: isOptDefault && isVolDefault,
            });
          });
        } else {
          items.push({
            optionName: optName,
            volumeName: "Standard",
            processedQty: to.processedQty ?? 0,
            unit: to.unit || "ml",
            extraCost: to.extraCost ?? 0,
            isDefaultOption: isOptDefault,
            isDefaultVolume: true,
            isStandardSelection: isOptDefault,
          });
        }
      });
    } else if (ingOptions.length > 0) {
      ingOptions.forEach((opt: any) => {
        const isOptDefault = !!opt.isDefault;
        items.push({
          optionName: opt.name || opt.optionName || opt.ingredientName || "Option",
          volumeName: "Standard",
          processedQty: opt.processedQty ?? 0,
          unit: opt.unit || "ml",
          extraCost: opt.extraCost ?? 0,
          isDefaultOption: isOptDefault,
          isDefaultVolume: true,
          isStandardSelection: isOptDefault,
        });
      });
    } else if (slot.ingredient) {
      items.push({
        optionName: slot.ingredient.name || "Ingredient",
        volumeName: "Standard",
        processedQty: slot.processedQty ?? 1,
        unit: slot.unit || "unit",
        extraCost: slot.extraCost ?? 0,
        isDefaultOption: true,
        isDefaultVolume: true,
        isStandardSelection: true,
      });
    } else if (slot.ingredientName || slot.name) {
      items.push({
        optionName: slot.ingredientName || slot.name || "Ingredient",
        volumeName: "Standard",
        processedQty: slot.processedQty ?? 0,
        unit: slot.unit || "ml",
        extraCost: slot.extraCost ?? 0,
        isDefaultOption: true,
        isDefaultVolume: true,
        isStandardSelection: true,
      });
    }

    return items;
  };

  const handleExportRecipesCSV = async () => {
    let listToExport: any[] = filteredDrinks || [];
    if (listToExport.length === 0) {
      toast({ variant: "destructive", title: "No drinks to export" });
      return;
    }

    toast({ title: "Preparing Recipe Export...", description: "Fetching full recipe details." });

    try {
      const res = await fetch(`${API_BASE}/drinks?includeSlots=true${selectedBranchId ? `&branchId=${selectedBranchId}` : ""}`);
      if (res.ok) {
        const fullDrinks = await res.json();
        const map = new Map(fullDrinks.map((d: any) => [d.id, d]));
        listToExport = listToExport.map(d => map.get(d.id) || d);
      }
    } catch (e) {
      console.warn("Failed to fetch fresh recipe slots", e);
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `Drinks_Recipes_${timestamp}.csv`;

    const headers = [
      "Drink ID",
      "Drink Name",
      "Category",
      "Base Price (EGP)",
      "Standard Price (EGP)",
      "Status",
      "Slot Label",
      "Required",
      "Option / Ingredient",
      "Volume / Portion",
      "Processed Quantity",
      "Unit",
      "Extra Cost (EGP)",
      "Is Default Option",
      "Is Default Portion",
      "Is Standard Selection"
    ];

    const clean = (val: any) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows: string[] = [];

    listToExport.forEach(drink => {
      const categoryName = (drink as any).categoryId && catMap.has((drink as any).categoryId)
        ? catMap.get((drink as any).categoryId)
        : drink.category;
      const standardPrice = (drink as any).defaultPrice ?? drink.basePrice;
      const statusStr = drink.isActive ? "Active" : "Inactive";
      const drinkPrefix = [
        drink.id,
        clean(drink.name),
        clean(categoryName),
        drink.basePrice,
        standardPrice,
        clean(statusStr),
      ];

      const slots: any[] = (drink as any).slots || [];

      if (slots.length === 0) {
        rows.push([
          ...drinkPrefix,
          clean("(No Recipe Slots)"),
          clean("-"),
          clean("-"),
          clean("-"),
          0,
          clean("-"),
          0,
          clean("-"),
          clean("-"),
          clean("-")
        ].join(","));
        return;
      }

      slots.forEach(slot => {
        const slotLabel = slot.slotLabel || "Slot";
        const isReq = slot.isRequired ? "Yes" : "No";

        const items = extractSlotItems(slot);

        if (items.length === 0) {
          rows.push([
            ...drinkPrefix,
            clean(slotLabel),
            clean(isReq),
            clean("(No Options)"),
            clean("-"),
            0,
            clean("-"),
            0,
            clean("-"),
            clean("-"),
            clean("-")
          ].join(","));
        } else {
          items.forEach(item => {
            rows.push([
              ...drinkPrefix,
              clean(slotLabel),
              clean(isReq),
              clean(item.optionName),
              clean(item.volumeName),
              item.processedQty,
              clean(item.unit),
              item.extraCost,
              clean(item.isDefaultOption ? "Yes" : "No"),
              clean(item.isDefaultVolume ? "Yes" : "No"),
              clean(item.isStandardSelection ? "Yes" : "No")
            ].join(","));
          });
        }
      });
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Recipe Details Exported", description: `Exported recipes for ${listToExport.length} drinks as ${filename}` });
  };

  const handleExportRecipesJSON = async () => {
    let listToExport: any[] = filteredDrinks || [];
    if (listToExport.length === 0) {
      toast({ variant: "destructive", title: "No drinks to export" });
      return;
    }

    toast({ title: "Preparing Recipe Export...", description: "Fetching full recipe details." });

    try {
      const res = await fetch(`${API_BASE}/drinks?includeSlots=true${selectedBranchId ? `&branchId=${selectedBranchId}` : ""}`);
      if (res.ok) {
        const fullDrinks = await res.json();
        const map = new Map(fullDrinks.map((d: any) => [d.id, d]));
        listToExport = listToExport.map(d => map.get(d.id) || d);
      }
    } catch (e) {
      console.warn("Failed to fetch fresh recipe slots", e);
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `Drinks_Recipes_${timestamp}.json`;

    const exportData = listToExport.map(drink => {
      const categoryName = (drink as any).categoryId && catMap.has((drink as any).categoryId)
        ? catMap.get((drink as any).categoryId)
        : drink.category;
      const standardPrice = (drink as any).defaultPrice ?? drink.basePrice;

      const rawSlots: any[] = (drink as any).slots || [];
      const recipeSlots = rawSlots.map(slot => ({
        slotLabel: slot.slotLabel || "Slot",
        isRequired: !!slot.isRequired,
        options: extractSlotItems(slot)
      }));

      return {
        id: drink.id,
        name: drink.name,
        description: drink.description || null,
        category: categoryName,
        basePrice: drink.basePrice,
        standardPrice,
        isActive: drink.isActive,
        recipeSlots
      };
    });

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Recipe Details Exported", description: `Exported recipes for ${listToExport.length} drinks as ${filename}` });
  };

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
          <Button variant="outline" className="gap-2 border-purple-200 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-300" onClick={handleExportRecipesCSV}>
            <FlaskConical className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Export Recipes
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 text-green-600" /> Drinks Catalog (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON} className="gap-2 cursor-pointer">
                <FileCode className="h-4 w-4 text-blue-600" /> Drinks Catalog (JSON)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRecipesCSV} className="gap-2 cursor-pointer">
                <FlaskConical className="h-4 w-4 text-purple-600" /> Recipe Details (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRecipesJSON} className="gap-2 cursor-pointer">
                <FileCode className="h-4 w-4 text-purple-600" /> Recipe Details (JSON)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Drinks</p>
                <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/5 border-green-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{stats.active}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-500/5 border-slate-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-600 dark:text-slate-400">{stats.inactive}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-500/10 flex items-center justify-center">
                <X className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
            <div className="flex items-center gap-3">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" /> Drinks Catalog (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON} className="gap-2 cursor-pointer">
                    <FileCode className="h-4 w-4 text-blue-600" /> Drinks Catalog (JSON)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportRecipesCSV} className="gap-2 cursor-pointer">
                    <FlaskConical className="h-4 w-4 text-purple-600" /> Recipe Details (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportRecipesJSON} className="gap-2 cursor-pointer">
                    <FileCode className="h-4 w-4 text-purple-600" /> Recipe Details (JSON)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <TableHead>Profit %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredDrinks?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No drinks found.</TableCell>
                  </TableRow>
                ) : (
                  filteredDrinks?.map(drink => {
                    const standardPrice = (drink as any).defaultPrice ?? drink.basePrice;
                    const cost = (drink as any).cost ?? 0;
                    const hasCost = cost > 0;
                    const profit = standardPrice - cost;
                    const profitMargin = (hasCost && standardPrice > 0) ? (profit / standardPrice) * 100 : 0;

                    let badgeClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                    if (!hasCost) {
                      badgeClass = "border-muted bg-muted/20 text-muted-foreground font-normal";
                    } else if (profitMargin < 20) {
                      badgeClass = "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-bold";
                    } else if (profitMargin < 50) {
                      badgeClass = "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold";
                    }

                    return (
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
                        <TableCell>
                          <Badge variant="outline" className={badgeClass}>
                            {hasCost ? `${profitMargin.toFixed(1)}%` : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8" onClick={() => openAvailabilityModal(drink)}>
                              <Building2 className="h-4 w-4" /> Availability
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8" asChild>
                              <Link href={`/admin/drinks/${drink.id}/recipe`}>
                                <FlaskConical className="h-4 w-4" /> Recipe
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
                    );
                  })
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
                <Label htmlFor="d-price">Base Price (EGP)</Label>
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
                  {stations.length === 0 ? (
                    <SelectItem value="main-bar">Main Bar (Default)</SelectItem>
                  ) : (
                    stations.map(s => (
                      <SelectItem key={s.id} value={slugifyStation(s.name)}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
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

      {/* Availability Management Modal */}
      <Dialog open={!!availabilityDrink} onOpenChange={(open) => { if (!open) setAvailabilityDrink(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Manage Availability for {availabilityDrink?.name}
            </DialogTitle>
          </DialogHeader>
          {availLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading availability configuration...</div>
          ) : (
            <div className="space-y-6 py-2">
              {/* Branch Availability */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" /> Branch Availability
                </h4>
                <div className="rounded-lg border bg-muted/10 p-3 space-y-2">
                  {availBranches.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No branches found.</p>
                  ) : (
                    availBranches.map(b => {
                      const statusRow = availBranchStatuses.find(s => s.branchId === b.id && s.drinkId === availabilityDrink?.id);
                      const isBranchActive = statusRow ? statusRow.isActive : true;
                      return (
                        <div key={b.id} className="flex items-center justify-between py-1 border-b last:border-0">
                          <span className="text-sm font-medium">{b.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={isBranchActive ? "outline" : "secondary"} className={isBranchActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : ""}>
                              {isBranchActive ? "Available" : "Disabled"}
                            </Badge>
                            <Switch
                              checked={isBranchActive}
                              onCheckedChange={() => toggleBranchStatus(b.id, isBranchActive)}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Partner Availability */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <Link2 className="h-4 w-4 text-muted-foreground" /> Partner Channel Availability
                </h4>
                <div className="rounded-lg border bg-muted/10 p-3 space-y-2">
                  {availPartners.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No partner channels found.</p>
                  ) : (
                    availPartners.map(p => {
                      const statusRow = availPartnerStatuses.find(s => s.partnerId === p.id && s.drinkId === availabilityDrink?.id);
                      const isPartnerActive = statusRow ? statusRow.isActive : true;
                      return (
                        <div key={p.id} className="flex items-center justify-between py-1 border-b last:border-0">
                          <span className="text-sm font-medium">{p.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={isPartnerActive ? "outline" : "secondary"} className={isPartnerActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : ""}>
                              {isPartnerActive ? "Available" : "Disabled"}
                            </Badge>
                            <Switch
                              checked={isPartnerActive}
                              onCheckedChange={() => togglePartnerStatus(p.id, isPartnerActive)}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setAvailabilityDrink(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
