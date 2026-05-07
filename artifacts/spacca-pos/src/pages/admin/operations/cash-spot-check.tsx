import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote, Plus, History, Calculator, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CashSpotCheckPage() {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  
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
  });

  const total = Object.entries(counts).reduce((sum, [denom, count]) => {
    return sum + (parseFloat(denom) * (parseInt(count) || 0));
  }, 0);

  const handleSave = () => {
    toast({
      title: "Spot Check Recorded",
      description: `Total cash counted: E£${total.toFixed(2)}`,
    });
    setIsChecking(false);
    setCounts({
      "200": "", "100": "", "50": "", "20": "", "10": "", "5": "", "1": "", "0.5": ""
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
          <Button onClick={() => setIsChecking(true)} className="gap-2">
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
                    <Label className="text-xs font-bold text-muted-foreground">E£{denom} Notes/Coins</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={counts[denom]}
                        onChange={(e) => setCounts(prev => ({ ...prev, [denom]: e.target.value }))}
                        className="text-right font-bold text-lg"
                      />
                      <span className="text-xs text-muted-foreground w-12">= E£{(parseFloat(denom) * (parseInt(counts[denom]) || 0)).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6 flex flex-col items-center justify-center py-10">
                <span className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Total Counted Cash</span>
                <span className="text-5xl font-black">E£{total.toFixed(2)}</span>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 py-6" onClick={() => setIsChecking(false)}>Cancel</Button>
              <Button className="flex-1 py-6 font-bold text-lg gap-2" onClick={handleSave}>
                <CheckCircle2 className="h-5 w-5" /> Record Spot Check
              </Button>
            </div>

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
