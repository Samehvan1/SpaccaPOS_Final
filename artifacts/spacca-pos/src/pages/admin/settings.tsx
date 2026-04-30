import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Settings, PackageX } from "lucide-react";
import { Link } from "wouter";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettingsAdmin() {
  const { 
    allowNoStockSell, 
    setAllowNoStockSell,
    autoPrintCustomer,
    setAutoPrintCustomer,
    autoPrintAgent,
    setAutoPrintAgent,
    isLoading 
  } = useSettings();
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "System configuration has been updated." });
  };

  return (
    <div className="p-8 w-full flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              System Settings
            </h1>
            <p className="text-muted-foreground mt-1">Configure global POS behavior and business rules.</p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Save All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Settings */}
        <Card className="border-2 hover:border-primary/20 transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <PackageX className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <CardTitle>Inventory & Selling</CardTitle>
                <CardDescription>Control how the system handles out-of-stock items.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="allow-no-stock" className="text-base font-bold">Allow No-Stock Selling</Label>
                <p className="text-sm text-muted-foreground">
                  If enabled, items can be sold even if inventory is 0. 
                  If disabled, out-of-stock options will be dimmed in the POS.
                </p>
              </div>
              <Switch 
                id="allow-no-stock" 
                checked={allowNoStockSell} 
                onCheckedChange={setAllowNoStockSell} 
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Printing Settings */}
        <Card className="border-2 hover:border-primary/20 transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Settings className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>Printing Defaults</CardTitle>
                <CardDescription>Configure automatic receipt printing behavior.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="auto-print-customer" className="font-bold">Auto-Print Customer Receipt</Label>
                <p className="text-xs text-muted-foreground">Print receipt automatically after payment.</p>
              </div>
              <Switch 
                id="auto-print-customer" 
                checked={autoPrintCustomer} 
                onCheckedChange={setAutoPrintCustomer}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="auto-print-agent" className="font-bold">Auto-Print Agent Ticket</Label>
                <p className="text-xs text-muted-foreground">Print kitchen ticket automatically for baristas.</p>
              </div>
              <Switch 
                id="auto-print-agent" 
                checked={autoPrintAgent} 
                onCheckedChange={setAutoPrintAgent}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
