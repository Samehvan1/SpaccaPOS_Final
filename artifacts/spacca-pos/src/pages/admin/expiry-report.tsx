import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Calendar, Download, Layers, Coffee, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export default function ExpiryReportPage() {
  const { selectedBranchId, user } = useAuth();
  const { toast } = useToast();

  // Expiry Report filters state
  const [expiryBranchId, setExpiryBranchId] = useState<string>("all");
  const [expiryIngredientId, setExpiryIngredientId] = useState<string>("all");
  const [expiryDays, setExpiryDays] = useState<string>("30");
  const [expiryStatus, setExpiryStatus] = useState<string>("alert");

  // Sync expiry branch to selectedBranchId if restricted
  useEffect(() => {
    if (selectedBranchId !== null && selectedBranchId !== undefined) {
      setExpiryBranchId(String(selectedBranchId));
    }
  }, [selectedBranchId]);

  // Fetch branches
  const { data: branches } = useQuery<any[]>({
    queryKey: ["admin-branches-expiry"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/branches`);
      if (!res.ok) throw new Error("Failed to fetch branches");
      return res.json();
    }
  });

  // Fetch active ingredients
  const { data: activeIngredients } = useQuery<any[]>({
    queryKey: ["active-ingredients-expiry"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/ingredients?active=true`);
      if (!res.ok) throw new Error("Failed to fetch ingredients");
      return res.json();
    }
  });

  // Expiry Report Queries
  const { data: expiryReportData, isLoading: loadingExpiryReport } = useQuery<any[]>({
    queryKey: ["expiry-reports-page", expiryBranchId, expiryIngredientId, expiryDays, expiryStatus],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stock/expiry/reports?branchId=${expiryBranchId}&ingredientId=${expiryIngredientId}&days=${expiryDays}&status=${expiryStatus}`);
      if (!res.ok) throw new Error("Failed to fetch expiry reports");
      return res.json();
    }
  });

  const handleExportExpiryCSV = () => {
    if (!expiryReportData || expiryReportData.length === 0) {
      toast({ variant: "destructive", title: "No data to export" });
      return;
    }
    
    const headers = [
      "Branch Name",
      "Ingredient Name",
      "Batch Number",
      "State",
      "Quantity Remaining",
      "Unit",
      "Sealed Expiry Date",
      "Active Expiry Date",
      "Days Left",
      "Expiry Status"
    ];

    const rows = expiryReportData.map(batch => [
      batch.branchName,
      batch.ingredientName,
      batch.batchNumber || `B-${batch.id}`,
      batch.isOpened ? "Opened" : "Sealed",
      batch.quantity,
      batch.ingredientUnit,
      batch.sealedExpiryDate ? format(new Date(batch.sealedExpiryDate), "yyyy-MM-dd") : "-",
      batch.expiryDate ? format(new Date(batch.expiryDate), "yyyy-MM-dd") : "-",
      batch.daysLeft !== null ? batch.daysLeft : "-",
      batch.status.toUpperCase()
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expiry_report_${expiryBranchId}_days_${expiryDays}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Expiry report exported successfully" });
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <span>Inventory Expiry Status Report</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track batch expiration statuses, monitor shelf life thresholds, and check open package alerts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 font-bold" onClick={handleExportExpiryCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Specialized Filters Card */}
      <Card className="bg-muted/30 border-primary/20 overflow-hidden print:hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-6">
            {/* Branch Filter */}
            <div className="grid gap-2">
              <Label htmlFor="expiry-branch-filter" className="flex items-center gap-2 text-sm font-bold">
                <Layers className="h-4 w-4 text-primary" /> Branch
              </Label>
              <Select 
                value={expiryBranchId} 
                onValueChange={(val) => setExpiryBranchId(val)}
                disabled={(user?.role as string) !== "admin" && (user?.role as string) !== "supervisor"}
              >
                <SelectTrigger id="expiry-branch-filter" className="bg-background">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map((b: any) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ingredient Filter */}
            <div className="grid gap-2">
              <Label htmlFor="expiry-item-filter" className="flex items-center gap-2 text-sm font-bold">
                <Coffee className="h-4 w-4 text-primary" /> Item (Ingredient)
              </Label>
              <Select value={expiryIngredientId} onValueChange={(val) => setExpiryIngredientId(val)}>
                <SelectTrigger id="expiry-item-filter" className="bg-background">
                  <SelectValue placeholder="All Items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {activeIngredients?.map((ing: any) => (
                    <SelectItem key={ing.id} value={String(ing.id)}>{ing.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Days Period Input */}
            <div className="grid gap-2">
              <Label htmlFor="expiry-days-filter" className="flex items-center gap-2 text-sm font-bold">
                <Calendar className="h-4 w-4 text-primary" /> Expiration Period (Days)
              </Label>
              <Input 
                id="expiry-days-filter"
                type="number"
                min="1"
                value={expiryDays}
                onChange={e => setExpiryDays(e.target.value)}
                className="bg-background"
                placeholder="e.g. 30"
              />
            </div>

            {/* Status Filter */}
            <div className="grid gap-2">
              <Label htmlFor="expiry-status-filter" className="flex items-center gap-2 text-sm font-bold">
                <FileText className="h-4 w-4 text-primary" /> Expiry Status
              </Label>
              <Select value={expiryStatus} onValueChange={(val) => setExpiryStatus(val)}>
                <SelectTrigger id="expiry-status-filter" className="bg-background">
                  <SelectValue placeholder="Alerts Only" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="alert">Alerts (Expired/Expiring)</SelectItem>
                  <SelectItem value="expired">Expired Only</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="ok">Safe / OK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-none shadow-xl bg-card/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="rounded-xl border border-primary/10 overflow-hidden bg-background/20">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow className="hover:bg-transparent border-primary/10">
                  <TableHead className="font-bold text-foreground">Branch</TableHead>
                  <TableHead className="font-bold text-foreground">Ingredient</TableHead>
                  <TableHead className="font-bold text-foreground">Batch Number</TableHead>
                  <TableHead className="font-bold text-foreground">State</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Remaining Qty</TableHead>
                  <TableHead className="font-bold text-foreground">Sealed Expiry</TableHead>
                  <TableHead className="font-bold text-foreground">Active Expiry</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Days Left</TableHead>
                  <TableHead className="font-bold text-foreground text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingExpiryReport ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground font-bold">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading expiry reports...
                    </TableCell>
                  </TableRow>
                ) : expiryReportData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No batches matching the filter criteria found.
                    </TableCell>
                  </TableRow>
                ) : (
                  expiryReportData?.map((batch: any) => {
                    let badgeColor = "bg-green-500/10 text-green-400 border border-green-500/20";
                    if (batch.status === "expired") {
                      badgeColor = "bg-red-500/10 text-red-400 border border-red-500/20 font-bold";
                    } else if (batch.status === "expiring_soon") {
                      badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold";
                    }

                    return (
                      <TableRow key={batch.id} className="border-primary/5 hover:bg-primary/5">
                        <TableCell className="font-bold text-foreground">{batch.branchName}</TableCell>
                        <TableCell className="font-bold text-foreground">{batch.ingredientName}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{batch.batchNumber || `B-${batch.id}`}</TableCell>
                        <TableCell>
                          <Badge variant={batch.isOpened ? "default" : "outline"} className={batch.isOpened ? "bg-blue-600 hover:bg-blue-600 text-white border-transparent" : "text-muted-foreground"}>
                            {batch.isOpened ? "Opened" : "Sealed"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">
                          {batch.quantity} <span className="text-xs font-normal text-muted-foreground">{batch.ingredientUnit}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {batch.sealedExpiryDate ? format(new Date(batch.sealedExpiryDate), "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {batch.expiryDate ? format(new Date(batch.expiryDate), "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {batch.daysLeft !== null ? (
                            <span className={batch.daysLeft < 0 ? "text-red-400 font-bold" : batch.daysLeft <= 7 ? "text-amber-400 font-bold" : "text-foreground"}>
                              {batch.daysLeft < 0 ? `Expired (${Math.abs(batch.daysLeft)}d ago)` : `${batch.daysLeft} days`}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={badgeColor}>
                            {batch.status.replace("_", " ").toUpperCase()}
                          </Badge>
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
    </div>
  );
}
