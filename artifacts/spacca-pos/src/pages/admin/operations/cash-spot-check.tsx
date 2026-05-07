import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote, Plus, History, Calculator, CheckCircle2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function CashSpotCheckPage() {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  
  // Fetch active session report for printing details
  const { data: activeSession, refetch: refetchActive } = useQuery({
    queryKey: ["/api/cashier/active"],
    queryFn: async () => {
      const res = await fetch("/api/cashier/active");
      if (!res.ok) throw new Error("Failed to fetch active session");
      return res.json();
    },
  });

  const { data: report, refetch: refetchReport } = useQuery({
    queryKey: ["/api/cashier/sessions", activeSession?.sessionId, "report"],
    queryFn: async () => {
      if (!activeSession?.sessionId) return null;
      const res = await fetch(`/api/cashier/sessions/${activeSession.sessionId}/report`);
      if (!res.ok) throw new Error("Failed to fetch session report");
      return res.json();
    },
    enabled: !!activeSession?.sessionId,
  });

  // Denominations for Egyptian Pound
  const [counts, setCounts] = useState<Record<string, string>>({
    "200": "",
    "100": "",
    "50": "",
    "20": "",
    "10": "",
    "5": "",
    "1": "",
    "0.5": "",
    "Credit": "", // Added Credit to the list
  });

  const total = Object.entries(counts).reduce((sum, [denom, count]) => {
    if (denom === "Credit") return sum + (parseFloat(count) || 0);
    return sum + (parseFloat(denom) * (parseInt(count) || 0));
  }, 0);

  const handlePrint = () => {
    if (!report) {
      toast({ variant: "destructive", title: "Report data not ready", description: "Wait for session data to load before printing." });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sessionStart = report.session.startedAt ? format(new Date(report.session.startedAt), "MMM d, HH:mm") : "N/A";
    const sessionEnd = report.session.endedAt ? format(new Date(report.session.endedAt), "MMM d, HH:mm") : "Active";
    
    // Calculate totals for tax/discount if available
    const subtotal = report.orders.reduce((sum: number, o: any) => sum + (o.subtotal || o.total), 0);
    const discount = report.orders.reduce((sum: number, o: any) => sum + (o.discount || 0), 0);
    const final = report.totals.totalRevenue;
    const cashFound = total - (parseFloat(counts["Credit"]) || 0);
    const cardFound = parseFloat(counts["Credit"]) || 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cash Spot Check Report</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .section { margin-bottom: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .separator { border-top: 1px dashed #000; margin: 10px 0; }
            .bold { font-weight: bold; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">SPACCA POS</div>
            <div>CASH SPOT CHECK</div>
          </div>

          <div class="section">
            <div class="row"><span>Session From:</span> <span>${sessionStart}</span></div>
            <div class="row"><span>Session To:</span> <span>${sessionEnd}</span></div>
            <div class="row"><span>Total Orders:</span> <span>${report.totals.orderCount}</span></div>
          </div>

          <div class="separator"></div>

          <div class="section">
            <div class="row"><span>Cash Found:</span> <span class="bold">EGP ${cashFound.toFixed(2)}</span></div>
            <div class="row"><span>Card Found:</span> <span class="bold">EGP ${cardFound.toFixed(2)}</span></div>
          </div>

          <div class="separator"></div>

          <div class="section">
            <div class="bold" style="margin-bottom: 8px;">SALES BY CATEGORY</div>
            ${report.statistics.categorySales?.map((c: any) => `
              <div class="row"><span>${c.name}:</span> <span>EGP ${c.total.toFixed(2)}</span></div>
            `).join("") || "<div>No category data</div>"}
          </div>

          <div class="separator"></div>

          <div class="section">
            <div class="row"><span>Total Before Tax:</span> <span>EGP ${subtotal.toFixed(2)}</span></div>
            <div class="row"><span>Total Discount:</span> <span>EGP ${discount.toFixed(2)}</span></div>
            <div class="row"><span class="bold">Final:</span> <span class="bold">EGP ${final.toFixed(2)}</span></div>
          </div>

          <div class="separator"></div>

          <div class="section" style="font-size: 12px; opacity: 0.8;">
            <div class="row"><span>Record Date:</span> <span>${format(new Date(), "yyyy-MM-dd HH:mm:ss")}</span></div>
            <div class="row"><span>User:</span> <span>${activeSession?.cashier?.name || "System"}</span></div>
          </div>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSave = () => {
    toast({
      title: "Spot Check Recorded",
      description: `Total counted: EGP ${total.toFixed(2)}`,
    });
    
    // Ask to print
    if (confirm("Would you like to print the spot check report?")) {
      handlePrint();
    }

    setIsChecking(false);
    setCounts({
      "200": "", "100": "", "50": "", "20": "", "10": "", "5": "", "1": "", "0.5": "", "Credit": ""
    });
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Spot Check</h1>
          <p className="text-muted-foreground">Verify physical cash in drawer during shift.</p>
        </div>
        {!isChecking && (
          <Button onClick={() => {
            refetchActive();
            refetchReport();
            setIsChecking(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" /> New Spot Check
          </Button>
        )}
      </div>

      {isChecking ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Denomination Counter
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.keys(counts).map((denom) => (
                  <div key={denom} className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">
                      {denom === "Credit" ? "Credit/Card Total" : `EGP ${denom} Notes/Coins`}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={counts[denom]}
                        onChange={(e) => setCounts(prev => ({ ...prev, [denom]: e.target.value }))}
                        className="text-right font-bold text-lg"
                      />
                      {denom !== "Credit" && (
                        <span className="text-xs text-muted-foreground w-12">= EGP {(parseFloat(denom) * (parseInt(counts[denom]) || 0)).toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
 
          <div className="flex flex-col gap-6">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6 flex flex-col items-center justify-center py-10">
                <span className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Total Counted (Cash + Credit)</span>
                <span className="text-5xl font-black">EGP {total.toFixed(2)}</span>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 py-6" onClick={() => setIsChecking(false)}>Cancel</Button>
              <Button 
                className="flex-1 py-6 font-bold text-lg gap-2" 
                onClick={handleSave}
                disabled={!report || !activeSession}
              >
                {!activeSession ? (
                   "No Active Session"
                ) : !report ? (
                   <>
                     <span className="animate-spin mr-2">◌</span>
                     Loading Report...
                   </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> 
                    Record Spot Check
                  </>
                )}
              </Button>
            </div>

            {!activeSession && (
              <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-md border border-destructive/20 text-center">
                Warning: No active cashier session found. You can count cash, but you won't be able to print a shift comparison report.
              </div>
            )}

            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6 text-sm text-muted-foreground italic">
                Tip: Spot checks help identify discrepancies early. The recorded amount will be compared against the expected cash revenue in the shift report.
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Recent Spot Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-dashed py-20 flex flex-col items-center justify-center text-muted-foreground">
              <Banknote className="h-12 w-12 mb-4 opacity-10" />
              <p>No recent spot checks found for this shift.</p>
              <Button variant="link" onClick={() => setIsChecking(true)}>Start your first check now</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
