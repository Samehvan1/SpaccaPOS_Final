import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Building2, Search, Edit3 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fmt } from "@/lib/currency";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

interface Branch {
  id: number;
  name: string;
  code: string;
}

interface BranchPriceRow {
  drinkId: number;
  name: string;
  globalPrice: number;
  overridePrice: number | null;
}

export default function BranchPricesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceOverrides, setPriceOverrides] = useState<Record<number, string>>({});

  // 1. Fetch active branches
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["admin-branches"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/branches`);
      if (!res.ok) throw new Error("Failed to fetch branches");
      const list: Branch[] = await res.json();
      const activeBranches = list.filter((b: any) => b.isActive !== false);
      if (activeBranches.length > 0 && !selectedBranchId) {
        setSelectedBranchId(String(activeBranches[0].id));
      }
      return activeBranches;
    },
  });

  // 2. Fetch price listings for the selected branch
  const { data: prices = [], isLoading, refetch } = useQuery<BranchPriceRow[]>({
    queryKey: ["branch-prices", selectedBranchId],
    queryFn: async () => {
      if (!selectedBranchId) return [];
      const res = await fetch(`${API_BASE}/admin/branch-prices?branchId=${selectedBranchId}`);
      if (!res.ok) throw new Error("Failed to fetch branch prices");
      const data: BranchPriceRow[] = await res.json();
      
      // Initialize editing states
      const state: Record<number, string> = {};
      data.forEach(p => {
        state[p.drinkId] = p.overridePrice !== null ? String(p.overridePrice) : "";
      });
      setPriceOverrides(state);

      return data;
    },
    enabled: !!selectedBranchId,
  });

  // 3. Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        branchId: parseInt(selectedBranchId),
        prices: Object.entries(priceOverrides).map(([drinkId, priceStr]) => ({
          drinkId: parseInt(drinkId),
          price: priceStr.trim() === "" ? null : parseFloat(priceStr),
        })),
      };

      const res = await fetch(`${API_BASE}/admin/branch-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save pricing overrides");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-prices", selectedBranchId] });
      toast({ title: "Prices Saved", description: "Branch base price overrides saved successfully." });
      refetch();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error Saving Prices", description: err.message });
    },
  });

  const filteredPrices = prices.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePriceChange = (drinkId: number, val: string) => {
    // Only allow numbers and decimal
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;
    setPriceOverrides(prev => ({
      ...prev,
      [drinkId]: val,
    }));
  };

  return (
    <div className="p-8 w-full overflow-y-auto h-full space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full h-9 w-9">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            Branch Pricing Overrides
          </h1>
          <p className="text-muted-foreground mt-1">Configure branch-specific base prices for menu drinks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Configuration */}
        <Card className="lg:col-span-1 border-2">
          <CardHeader className="pb-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Location Select</CardTitle>
            <CardDescription>Choose the branch you want to customize prices for.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="branch-select">Select Branch</Label>
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger id="branch-select">
                  <SelectValue placeholder="Select a branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name} ({b.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-2">
              <Button
                id="btn-save-branch-prices"
                className="w-full font-bold flex items-center justify-center gap-2"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !selectedBranchId}
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? "Saving changes..." : "Save Pricing Overrides"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pricing List Table */}
        <Card className="lg:col-span-3 border-2">
          <CardHeader className="pb-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-muted/20">
            <div>
              <CardTitle className="text-xl">Menu Drink Prices</CardTitle>
              <CardDescription>Leave override input blank to inherit global default base price.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search drinks..."
                className="pl-9 bg-background"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading menu drinks prices...</div>
            ) : filteredPrices.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No drinks found matching your search.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drink Name</TableHead>
                    <TableHead className="w-48 text-right">Global Base Price</TableHead>
                    <TableHead className="w-56 text-right">Branch Override Price (EGP)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrices.map(drink => (
                    <TableRow key={drink.drinkId} className="hover:bg-muted/10">
                      <TableCell className="font-bold">{drink.name}</TableCell>
                      <TableCell className="text-right font-medium text-muted-foreground">
                        {fmt(drink.globalPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            id={`override-price-${drink.drinkId}`}
                            type="text"
                            value={priceOverrides[drink.drinkId] ?? ""}
                            onChange={e => handlePriceChange(drink.drinkId, e.target.value)}
                            placeholder={String(drink.globalPrice)}
                            className="w-32 text-right font-bold focus-visible:ring-blue-500 border-muted-foreground/30 focus-visible:border-blue-500"
                          />
                          <Edit3 className="h-4 w-4 text-muted-foreground opacity-40 shrink-0" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
