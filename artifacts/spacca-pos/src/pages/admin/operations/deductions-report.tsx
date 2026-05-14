import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Filter, Beaker, Trash, History, Package, MapPin, Calendar, ClipboardList } from "lucide-react";
import { format } from "date-fns";

const api = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function OperationalDeductionsReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [movements, setMovements] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all"); // all, calibration, waste
  const [startDate, setStartDate] = useState(format(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (selectedBranch !== "all") params.append("branchId", selectedBranch);
      
      const [moveData, branchData] = await Promise.all([
        api(`/api/stock/movements?${params.toString()}`),
        api("/api/admin/branches")
      ]);

      // Filter for only calibration and waste
      const operationalMoves = moveData.filter((m: any) => 
        m.movementType === "calibration" || m.movementType === "waste"
      );

      setMovements(operationalMoves);
      setBranches(branchData);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load operational data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, startDate, endDate]);

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.note && m.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.createdByName && m.createdByName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || m.movementType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const exportCsv = () => {
    const headers = ["Date", "Branch", "Ingredient", "Type", "Quantity", "User", "Notes"];
    const rows = filteredMovements.map(m => [
      format(new Date(m.createdAt), "yyyy-MM-dd HH:mm"),
      branches.find(b => b.id === m.branchId)?.name || "Unknown",
      m.ingredientName,
      m.movementType,
      m.quantity,
      m.createdByName,
      m.note || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `operational_deductions_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 w-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3 text-primary">
            <ClipboardList className="h-8 w-8" />
            Operational <span className="text-foreground">Deductions</span>
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest mt-1">Audit trail for Calibration, Testing, and Wastage</p>
        </div>
        <Button variant="outline" className="h-12 px-6 font-black uppercase tracking-widest border-2 hover:bg-primary hover:text-primary-foreground transition-all" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      <Card className="border-2 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" /> Filter Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Branch
              </label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="h-12 font-bold border-2 focus:ring-primary">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-bold">All Branches</SelectItem>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)} className="font-bold">{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                <History className="h-3 w-3" /> Deduction Type
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-12 font-bold border-2">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-bold">All Deductions</SelectItem>
                  <SelectItem value="calibration" className="font-bold">Calibration & Testing</SelectItem>
                  <SelectItem value="waste" className="font-bold">Wastage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Date Range
              </label>
              <div className="flex items-center gap-2">
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-12 font-bold border-2" />
                <span className="text-muted-foreground font-black">→</span>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-12 font-bold border-2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                <Search className="h-3 w-3" /> Quick Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Ingredient, user or note..." 
                  className="pl-10 h-12 font-bold border-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-3xl border-2 shadow-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="h-16">
              <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest">Time & Date</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Branch</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Inventory Item</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Category</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Quantity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Authorized By</TableHead>
              <TableHead className="pr-6 text-[10px] font-black uppercase tracking-widest">Reason / Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <History className="h-12 w-12 text-primary animate-spin opacity-20" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Loading Audit Logs...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <Package className="h-16 w-16 text-muted-foreground opacity-10" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No records found for this period</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((m) => {
                const branchName = branches.find(b => b.id === m.branchId)?.name || "Global";
                return (
                  <TableRow key={m.id} className="h-20 hover:bg-muted/20 transition-colors group">
                    <TableCell className="pl-6 font-medium">
                      <div className="text-sm font-black">{format(new Date(m.createdAt), "HH:mm")}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">{format(new Date(m.createdAt), "MMM dd, yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-black text-[10px] uppercase border-primary/20 bg-primary/5">{branchName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-black text-sm">{m.ingredientName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Stock Item #{m.ingredientId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.movementType === "calibration" ? "outline" : "destructive"} className={`capitalize font-black text-[10px] py-1 px-3 rounded-full ${m.movementType === "calibration" ? "border-amber-500 text-amber-600 bg-amber-50" : ""}`}>
                        {m.movementType === "calibration" ? <Beaker className="mr-1.5 h-3 w-3" /> : <Trash className="mr-1.5 h-3 w-3" />}
                        {m.movementType === "calibration" ? "Calibration" : "Wastage"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-lg font-black text-destructive">-{m.quantity}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-black text-xs uppercase">{m.createdByName}</div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="max-w-[300px] text-xs font-bold leading-relaxed text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all">
                        {m.note || <span className="opacity-30 italic font-normal">No details provided</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
