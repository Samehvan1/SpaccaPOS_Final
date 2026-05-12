import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Coffee, Filter, BarChart3, ListFilter, TrendingUp, Percent, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function CustomizationsAnalysisPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [localStartDate, setLocalStartDate] = useState(format(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd"));
  const [localEndDate, setLocalEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const [filterState, setFilterState] = useState({
    branch: "all",
    start: format(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["/api/admin/branches"],
    queryFn: async () => {
      const res = await fetch("/api/admin/branches");
      if (!res.ok) throw new Error("Failed to fetch branches");
      return res.json();
    }
  });

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["/api/finance/customization-analytics", filterState],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        startDate: filterState.start, 
        endDate: filterState.end 
      });
      if (filterState.branch !== "all") params.append("branchId", filterState.branch);
      const res = await fetch(`/api/finance/customization-analytics?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    }
  });

  const handleApply = () => {
    setFilterState({
      branch: selectedBranch,
      start: localStartDate,
      end: localEndDate
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-muted animate-pulse rounded lg:col-span-2" />
          <div className="h-[300px] bg-muted animate-pulse rounded" />
          <div className="h-[300px] bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const { drinks = [], slots = [], options = [] } = analytics || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Customizations Analysis</h1>
        <p className="text-muted-foreground">Detailed report on how customers are modifying their orders.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-primary">
              <Filter className="h-4 w-4" /> Filter Analytics Period
            </CardTitle>
            <button 
              onClick={handleApply}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
            >
              <TrendingUp className="h-3 w-3" /> Apply Filters
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b: any) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground">From Date</label>
              <Input type="date" value={localStartDate} onChange={e => setLocalStartDate(e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground">To Date</label>
              <Input type="date" value={localEndDate} onChange={e => setLocalEndDate(e.target.value)} className="bg-background" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Customized Drinks */}
        <Card className="lg:col-span-2 shadow-sm border-muted-foreground/10 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Coffee className="h-5 w-5 text-primary" /> Most Customized Drinks
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px]">
                {drinks.length} Drinks Analyzed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="font-bold py-4 pl-6">Drink Name</TableHead>
                    <TableHead className="text-right font-bold">Total Drinks</TableHead>
                    <TableHead className="text-right font-bold">Customized</TableHead>
                    <TableHead className="text-right font-bold">% of Drinks</TableHead>
                    <TableHead className="text-right font-bold">Total Price</TableHead>
                    <TableHead className="text-right font-bold">Cust. Price</TableHead>
                    <TableHead className="text-right font-bold">% of Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drinks.map((d: any) => (
                    <TableRow key={d.id} className="hover:bg-muted/5">
                      <TableCell className="font-bold py-4 pl-6">{d.name}</TableCell>
                      <TableCell className="text-right font-mono">{d.totalCount}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-bold">{d.customizedCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right min-w-[120px]">
                        <div className="flex flex-col items-end gap-1.5 pr-2">
                          <div className="flex items-center gap-1.5">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-black text-primary">{d.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={d.percentage} className="h-1.5 w-full bg-primary/10" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">EGP {d.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-primary font-black">EGP {d.customizedRevenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right min-w-[120px]">
                         <div className="flex flex-col items-end gap-1.5 pr-2">
                           <div className="flex items-center gap-1.5">
                             <DollarSign className="h-3 w-3 text-muted-foreground" />
                             <span className="text-sm font-black text-green-600 dark:text-green-400">{d.percentageRevenue.toFixed(1)}%</span>
                           </div>
                          <Progress value={d.percentageRevenue} className="h-1.5 w-full bg-green-500/10" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {drinks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-muted-foreground font-medium italic">
                        No orders found for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Most Customized Slots */}
        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-orange-500" /> Most Customized Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold py-4 pl-6">Slot (Component)</TableHead>
                  <TableHead className="text-right font-bold pr-6">Changes Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((s: any) => (
                  <TableRow key={s.label} className="hover:bg-muted/5">
                    <TableCell className="font-medium py-4 pl-6">{s.label}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant="outline" className="font-mono font-bold bg-orange-500/5 text-orange-600 border-orange-500/20">
                        {s.count}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                 {slots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-10 text-muted-foreground">No data found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Most Customized Options */}
        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" /> Most Chosen Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold py-4 pl-6">Option Name</TableHead>
                  <TableHead className="font-bold">Slot Context</TableHead>
                  <TableHead className="text-right font-bold pr-6">Usage Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {options.map((o: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-muted/5">
                    <TableCell className="font-bold py-4 pl-6">{o.label}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] uppercase font-black tracking-tighter">
                        {o.slot}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant="outline" className="font-mono font-bold bg-indigo-500/5 text-indigo-600 border-indigo-500/20">
                        {o.count}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {options.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No data found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
