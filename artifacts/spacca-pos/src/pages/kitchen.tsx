import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetActiveOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChefHat, CheckCircle2, Timer, Flame, Coffee, Info, Zap, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useOrderEvents } from "@/hooks/use-order-events";
import { useAuth } from "@/hooks/use-auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

function slugifyStation(name: string) {
  if (!name) return "";
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

export default function KitchenDisplay() {
  const { toast } = useToast();
  const [activeStation, setActiveStation] = useState("all");
  const { selectedBranchId } = useAuth();
  const queryClient = useQueryClient();
  const { data: stations = [] } = useKitchenStations();

  const allStations = [
    { value: "all", label: "Global View" },
    ...stations.map(s => ({
      value: s.id.toString(),
      label: s.name
    }))
  ];

  function stationLabel(value: string): string {
    return allStations.find(s => s.value === value)?.label ?? value;
  }

  useOrderEvents();

  const { data: activeOrders, isLoading } = useGetActiveOrders(
    { branchId: selectedBranchId || undefined },
    { 
      query: { 
        // No polling needed, using SSE
      } as any
    } as any
  );

  const { mutate: updateStatus } = useUpdateOrderStatus();

  const handleMarkItemReady = async (itemId: number) => {
    try {
      const res = await fetch(`${API_BASE}/order-items/${itemId}/ready`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark item ready");
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/active-orders"] });
      toast({ title: "Item Ready", description: "Drink marked as prepared." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update item status." });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-neon-yellow border-neon-yellow/30 bg-neon-yellow/10";
      case "in_progress": return "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10";
      case "ready": return "text-neon-green border-neon-green/30 bg-neon-green/10";
      default: return "text-muted-foreground border-white/10 bg-white/5";
    }
  };

  const knownStationValues = new Set(allStations.map(s => s.value).filter(v => v !== "all"));

  // Improved station matching with robust name/ID fallback and debug logging
  const stationMatches = (item: any, targetValue: string) => {
    if (targetValue === "all") return true;
    if (!item) return false;
    
    const itemId = item.kitchenStationId?.toString();
    const itemSlug = slugifyStation(item.kitchenStation);
    
    // 1. Try exact ID matching (modern robust way)
    if (itemId) {
      const matched = String(itemId) === String(targetValue);
      // If we have an ID, we should be VERY strict. 
      // If the ID doesn't match the target, it shouldn't match at all.
      return matched;
    }
    
    // 2. Resolve target station name from ID for legacy fallback
    const targetStation = stations.find(s => s.id.toString() === targetValue);
    if (!targetStation) return false;
    
    const targetSlug = slugifyStation(targetStation.name);

    // 3. Exact slug match
    if (itemSlug === targetSlug) return true;

    // 4. Default fallback: 'main' or empty items go to 'Hot Bar', 'Main Bar', or 'Barista'
    // only if they don't have a specific station ID assigned.
    const isDefaultItem = !itemSlug || itemSlug === "main";
    const isDefaultStation = targetSlug === "hot-bar" || targetSlug === "main-bar" || targetSlug === "barista" || targetValue === stations[0]?.id.toString();
    
    const isMatched = isDefaultItem && isDefaultStation;
    return isMatched;
  };

  // Filter orders by station
  const filteredOrders = (activeOrders as any[])?.filter(order => {
    if (order.status === "ready" || order.status === "completed" || order.status === "cancelled") return false;

    if (activeStation === "all") return order.status !== "pending";
    
    const hasItemsForThisStation = order.items.some((item: any) => {
      if (stationMatches(item, activeStation)) return true;
      return false;
    });

    return (order.status === "paid" || order.status === "in_progress") && hasItemsForThisStation;
  }) ?? [];

  const stationCounts: Record<string, number> = {};
  allStations.filter(s => s.value !== "all").forEach((s, idx) => {
    const isFirst = s.value === allStations[1]?.value;

    stationCounts[s.value] = activeOrders?.filter(o =>
      (o.status === "paid" || o.status === "in_progress") && 
      o.items.some((item: any) => {
        const isMatched = stationMatches(item, s.value);
        return isMatched && item.status === "pending";
      })
    ).length ?? 0;
  });

  if (isLoading && !activeOrders) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#080808] overflow-hidden text-foreground">
      <div className="flex-1 overflow-y-auto">
        {/* Header Area */}
      <div className="shrink-0 bg-background/40 backdrop-blur-md border-b border-white/5 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center text-neon-cyan border border-neon-cyan/20">
                <ChefHat className="h-6 w-6" />
             </div>
             <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tighter uppercase">Kitchen <span className="text-neon-cyan">Control</span></h1>
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green/40 animate-pulse mt-1" title="Real-time Link Active" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">Production Queue</p>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Waitroom: {activeOrders?.filter(o => (o.status as string) === 'paid').length || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-yellow shadow-[0_0_8px_rgba(255,234,0,0.8)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">In Progress: {activeOrders?.filter(o => (o.status as string) === 'in_progress').length || 0}</span>
            </div>
          </div>
        </div>

        {/* Station Tabs */}
        <div className="px-8 pb-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          {allStations.map(station => {
            const count = station.value === "all"
              ? (activeOrders?.length ?? 0)
              : (stationCounts[station.value] ?? 0);
            const isActive = activeStation === station.value;
            return (
              <button
                key={station.value}
                onClick={() => setActiveStation(station.value)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? "bg-neon-cyan text-black border-neon-cyan glow-cyan"
                    : "bg-white/5 text-muted-foreground border-white/10 hover:border-neon-cyan/40 hover:bg-white/10"
                }`}
              >
                {station.label === "Global View" ? < Zap className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
                {station.label}
                {count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? "bg-black/20 text-black" : "bg-neon-cyan/20 text-neon-cyan"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1 p-8">
        {filteredOrders.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground/30 animate-in fade-in duration-1000">
            <CheckCircle2 className="h-24 w-24 mb-6 opacity-5 text-neon-green" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Production Clear</h2>
            <p className="text-xs font-bold mt-2 uppercase tracking-[0.3em]">Awaiting new tickets</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 items-start auto-rows-max pb-10">
            {filteredOrders.map(order => (
              <Card key={order.id} className="glass-card border-white/10 ring-1 ring-white/5 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                <CardHeader className="p-4 pb-2 border-b border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold tracking-tighter group-hover:neon-text-cyan transition-all">#{order.orderNumber}</CardTitle>
                        {Array.from(new Set(order.items.map((i:any) => i.kitchenStation))).length > 1 && (
                          <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0 rounded bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20 uppercase tracking-widest">
                            Mixed
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-widest truncate max-w-[120px]">
                        {order.customerName || "Walk-in"}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                       <Badge variant="outline" className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border-0 ${getStatusColor(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </Badge>
                      <div className="text-[9px] font-black text-white/30 flex items-center gap-1 uppercase tracking-widest">
                        <Timer className="h-3 w-3" />
                        {formatDistanceToNow(new Date(order.createdAt))}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {order.items.map((item: any) => {
                      const isMatched = stationMatches(item, activeStation);
                      const isThisStation = activeStation === "all" || isMatched;

                      return (
                        <div
                          key={item.id}
                          className={`p-1 transition-all relative ${
                            isThisStation && item.status === "pending"
                              ? "bg-transparent"
                              : "bg-black/40 opacity-40 grayscale"
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <div className={`font-bold w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-lg ${
                              isThisStation && item.status === "pending"
                                ? "bg-neon-cyan/20 text-neon-cyan ring-1 ring-neon-cyan/40"
                                : "bg-white/5 text-white/20 ring-1 ring-white/10"
                            }`}>
                              {item.quantity}x
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className={`font-bold text-lg leading-tight tracking-tight flex items-center gap-2 ${(!isThisStation || item.status === "ready") && "text-white/40"}`}>
                                {item.drinkName}
                                {item.status === "ready" && <CheckCircle2 className="h-4 w-4 text-neon-green" />}
                              </div>
                              
                              {isThisStation && item.status === "pending" ? (
                                <>
                                    <ul className="mt-0.5 space-y-0 -ml-1">
                                      {item.customizations
                                        .filter((cust: any) => (cust.baristaSortOrder ?? 1) !== 0 && cust.optionLabel?.toLowerCase() !== "none")
                                        .sort((a: any, b: any) => (a.baristaSortOrder ?? 1) - (b.baristaSortOrder ?? 1))
                                        .map((cust: any) => {
                                          const displayQty = cust.producedQty > 0 ? cust.producedQty : cust.consumedQty;
                                          return (
                                            <li key={cust.id} className="text-[11px] flex items-center gap-1">
                                              <div className="w-1 h-1 rounded-full bg-neon-cyan shrink-0" />
                                              <span className="font-bold text-white/40 uppercase tracking-widest">{cust.slotLabel}:</span>
                                              <span className="font-medium text-foreground">{cust.optionLabel}</span>
                                              {displayQty > 0 && (
                                                <span className="text-[10px] text-primary font-black ml-1">({Math.round(displayQty)}ml)</span>
                                              )}
                                            </li>
                                          );
                                        })}
                                    </ul>

                                    {item.specialNotes && (
                                      <div className="mt-2 p-2 bg-neon-yellow/5 text-neon-yellow border border-neon-yellow/20 rounded-lg text-[10px] font-bold italic flex gap-2">
                                        <Info className="h-3.5 w-3.5 shrink-0" />
                                        {item.specialNotes}
                                      </div>
                                    )}
                                    
                                    <Button 
                                      className="mt-3 w-full bg-neon-green hover:opacity-90 text-black font-bold uppercase tracking-widest h-10 rounded-lg shadow-lg shadow-neon-green/10 active:scale-[0.98] transition-all"
                                      onClick={() => handleMarkItemReady(item.id)}
                                    >
                                      Produce Done
                                    </Button>
                                  </>
                                ) : (
                                  !isThisStation && activeStation !== "all" && (
                                    <div className="text-[10px] font-black text-neon-cyan/40 uppercase tracking-widest mt-2 flex items-center gap-2 italic">
                                      <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan/40 animate-pulse" />
                                      In production at {
                                        stations.find(s => slugifyStation(s.name) === slugifyStation(item.kitchenStation))?.name ?? 
                                        stationLabel(item.kitchenStation)
                                      }
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>

                <CardFooter className="px-4 py-2 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                   <div className="flex gap-1 items-center">
                      <Coffee className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stationLabel(activeStation)}</span>
                   </div>
                   <div className="text-[10px] font-bold text-neon-green uppercase tracking-widest">
                     {order.items.filter((i:any) => i.status === 'ready').length}/{order.items.length} COMPLETE
                   </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      </div>
    </div>
  );
}
