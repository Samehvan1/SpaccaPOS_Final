import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Filter, ArrowUpRight, ArrowDownLeft, History, Package } from "lucide-react";
import { format } from "date-fns";
import { fmt } from "@/lib/currency";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function StockMovementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [movements, setMovements] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedIngredient, setSelectedIngredient] = useState<string>("all");
  const [startDate, setStartDate] = useState(format(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      if (selectedIngredient !== "all") params.append("ingredientId", selectedIngredient);

      const [moveData, ingData, branchData] = await Promise.all([
        api(`/api/stock/movements?${params.toString()}`),
        api("/api/ingredients"),
        api("/api/admin/branches")
      ]);
      setMovements(moveData);
      setIngredients(ingData);
      setBranches(branchData);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedIngredient, startDate, endDate]);

  const exportCsv = () => {
    const headers = ["Date", "Ingredient", "Type", "Quantity", "After", "User", "Note"];
    const rows = movements.map(m => [
      format(new Date(m.createdAt), "yyyy-MM-dd HH:mm"),
      m.ingredientName,
      m.movementType,
      m.quantity,
      m.quantityAfter,
      m.createdByName,
      m.note || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_movements_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMovements = movements.filter(m => 
    m.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.movementType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.note && m.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Stock Movement</h1>
        <p className="text-muted-foreground">Track all inventory changes across branches.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ingredient</label>
              <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ingredients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ingredients</SelectItem>
                  {ingredients.map(i => (
                    <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Balance After</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <History className="h-8 w-8 text-muted-foreground animate-spin" />
                    <p className="text-muted-foreground">Loading movements...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">No movements found for the selected period.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {format(new Date(m.createdAt), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{m.ingredientName}</TableCell>
                  <TableCell>
                    <Badge variant={
                      m.movementType === "restock" ? "default" :
                      m.movementType === "sale" ? "secondary" :
                      m.movementType === "waste" ? "destructive" : "outline"
                    } className="capitalize">
                      {m.movementType === "restock" && <ArrowDownLeft className="mr-1 h-3 w-3" />}
                      {m.movementType === "sale" && <ArrowUpRight className="mr-1 h-3 w-3" />}
                      {m.movementType}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-mono ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                    {m.quantity > 0 ? "+" : ""}{m.quantity}
                  </TableCell>
                  <TableCell className="text-right font-bold font-mono">
                    {m.quantityAfter}
                  </TableCell>
                  <TableCell>{m.createdByName}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground italic">
                    {m.note || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
