import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ChevronRight, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Edit3, Save, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Audit = {
  id: number;
  status: "pending" | "approved" | "rejected";
  createdByName: string;
  notes: string | null;
  createdAt: string;
  approvedAt: string | null;
};

type AuditItem = {
  id: number;
  ingredientId: number;
  ingredientName: string;
  unit: string;
  expectedQuantity: number;
  actualQuantity: number;
  finalQuantity: number | null;
  notes: string | null;
  deviation: number;
};

type AuditDetail = Audit & {
  items: AuditItem[];
};

export default function StockAuditReviewPage() {
  const { toast } = useToast();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AuditDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingItems, setEditingItems] = useState<Record<number, number>>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stock-audits");
      const data = await res.json();
      setAudits(data);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load audits" });
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/stock-audits/${id}`);
      const data = await res.json();
      setDetail(data);
      setEditingItems({});
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load audit details" });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAuditClick = (id: number) => {
    setSelectedAuditId(id);
    loadDetail(id);
  };

  const handleFinalQtyChange = (itemId: number, val: string) => {
    setEditingItems((prev) => ({
      ...prev,
      [itemId]: parseFloat(val),
    }));
  };

  const handleSaveEdits = async () => {
    if (!detail) return;
    setProcessing(true);
    try {
      const items = Object.entries(editingItems).map(([id, finalQuantity]) => ({
        id: parseInt(id),
        finalQuantity,
      }));

      const res = await fetch(`/api/stock-audits/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast({ title: "Edits saved", description: "Audit quantities updated." });
      loadDetail(detail.id);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save edits", description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/stock-audits/${detail.id}/approve`, {
        method: "POST",
      });

      if (!res.ok) throw new Error(await res.text());

      toast({ title: "Audit approved", description: "Stock quantities have been adjusted." });
      loadAudits();
      setSelectedAuditId(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to approve", description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!detail) return;
    if (!confirm("Are you sure you want to reject this audit report?")) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/stock-audits/${detail.id}/reject`, {
        method: "POST",
      });

      if (!res.ok) throw new Error(await res.text());

      toast({ title: "Audit rejected" });
      loadAudits();
      setSelectedAuditId(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to reject", description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  if (selectedAuditId && detail) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-6xl animate-in fade-in slide-in-from-right-4 duration-300">
        <Button variant="ghost" onClick={() => setSelectedAuditId(null)} className="gap-2 mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Stock Audit #{detail.id}</h1>
            <p className="text-muted-foreground">Submitted by <span className="font-semibold text-foreground">{detail.createdByName}</span> on {format(new Date(detail.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
          </div>
          {detail.status === "pending" && (
            <div className="flex gap-2">
              <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={handleReject} disabled={processing}>
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700 shadow-md">
                Approve & Adjust Stock
              </Button>
            </div>
          )}
          {detail.status !== "pending" && (
             <Badge variant={detail.status === "approved" ? "default" : "destructive"} className="h-10 px-4 text-sm font-bold uppercase">
               {detail.status}
             </Badge>
          )}
        </div>

        {detail.notes && (
          <Card className="bg-muted/30 border-none shadow-sm">
            <CardContent className="pt-6 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Staff Note</p>
                <p className="text-sm">{detail.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Ingredient</TableHead>
                <TableHead className="text-right font-bold">System Stock</TableHead>
                <TableHead className="text-right font-bold">Actual Reported</TableHead>
                <TableHead className="text-center font-bold">Deviation</TableHead>
                <TableHead className="text-right font-bold">Final Quantity (Admin)</TableHead>
                <TableHead className="font-bold">Item Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.items.map((item) => {
                const finalQty = editingItems[item.id] !== undefined ? editingItems[item.id] : (item.finalQuantity ?? item.actualQuantity);
                const hasDeviation = item.deviation !== 0;
                
                return (
                  <TableRow key={item.id} className={hasDeviation ? "bg-amber-50/20" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.ingredientName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.expectedQuantity}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-blue-600">{item.actualQuantity}</TableCell>
                    <TableCell className="text-center">
                      {hasDeviation ? (
                        <Badge variant={item.deviation > 0 ? "default" : "destructive"} className={`font-mono ${item.deviation > 0 ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}`}>
                          {item.deviation > 0 ? "+" : ""}{item.deviation}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right w-40">
                      {detail.status === "pending" ? (
                        <div className="flex items-center gap-2 justify-end">
                           <Input
                            type="number"
                            className="h-9 w-24 text-right font-mono bg-background focus:ring-1 focus:ring-primary/30"
                            value={finalQty}
                            onChange={(e) => handleFinalQtyChange(item.id, e.target.value)}
                          />
                          {editingItems[item.id] !== undefined && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-primary"><Edit3 className="h-4 w-4" /></div>
                              </TooltipTrigger>
                              <TooltipContent>Value edited but not saved</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-foreground">{item.finalQuantity ?? item.actualQuantity}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm italic">{item.notes || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {detail.status === "pending" && Object.keys(editingItems).length > 0 && (
            <div className="p-4 bg-primary/5 flex justify-end border-t border-dashed">
              <Button size="sm" className="gap-2" onClick={handleSaveEdits} disabled={processing}>
                <Save className="h-4 w-4" /> Save All Quantities
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Audit Reports</h1>
          <p className="text-muted-foreground">Review and approve daily stock counts from staff.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-muted/20 h-24"></Card>
          ))
        ) : audits.length === 0 ? (
          <Card className="border-dashed py-12 flex flex-col items-center justify-center space-y-3">
             <AlertTriangle className="h-12 w-12 text-muted-foreground opacity-20" />
             <p className="text-muted-foreground font-medium">No stock audit reports yet.</p>
          </Card>
        ) : (
          audits.map((audit) => (
            <Card 
              key={audit.id} 
              className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.005] active:scale-[0.995] ${audit.status === 'pending' ? 'border-primary/20 shadow-sm' : ''}`}
              onClick={() => handleAuditClick(audit.id)}
            >
              <CardContent className="p-0">
                <div className="flex items-center p-5 gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                    audit.status === 'pending' ? 'bg-primary/10 text-primary' : 
                    audit.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {audit.status === 'pending' ? <AlertTriangle className="h-6 w-6" /> : 
                     audit.status === 'approved' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">Audit Report #{audit.id}</h3>
                      <Badge variant={
                        audit.status === 'pending' ? 'default' : 
                        audit.status === 'approved' ? 'outline' : 'destructive'
                      } className="uppercase text-[10px] font-black h-5">
                        {audit.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>By <span className="font-medium text-foreground">{audit.createdByName}</span></span>
                      <span>•</span>
                      <span>{format(new Date(audit.createdAt), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
