import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetActiveOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChefHat, CheckCircle2, Timer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

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
  const [activeStation, setActiveStation] = useState("all");
  const queryClient = useQueryClient();
  const { data: stations = [] } = useKitchenStations();

  const allStations = [
    { value: "all", label: "All Orders" },
    ...stations.map(s => ({
      value: s.name.toLowerCase().replace(/\s+/g, '-'),
      label: s.name
    }))
  ];

  function stationLabel(value: string): string {
    return allStations.find(s => s.value === value)?.label ?? value;
  }

  const { data: activeOrders, isLoading } = useGetActiveOrders({
    query: { refetchInterval: 8000 }
  } as any);

  const { mutate: updateStatus } = useUpdateOrderStatus();

  const handleAdvanceStatus = (orderId: number, currentStatus: string) => {
    let nextStatus: "in_progress" | "ready" | "completed" = "in_progress";
    if (currentStatus === "pending") nextStatus = "in_progress";
    if (currentStatus === "in_progress") nextStatus = "ready";
    if (currentStatus === "ready") nextStatus = "completed";
    updateStatus(
      { id: orderId, data: { status: nextStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/active-orders"] });
          queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ready": return "bg-green-500/10 text-green-600 border-green-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Filter orders by station
  const filteredOrders = activeOrders?.filter(order => {
    if (activeStation === "all") return true;
    return order.items.some((item: any) => {
      const itemStation = (item.kitchenStation ?? "main").toLowerCase().replace(/\s+/g, '-');
      return itemStation === activeStation;
    });
  }) ?? [];

  // Count orders per station (excluding "all") for badge counts
  const stationCounts: Record<string, number> = {};
  allStations.filter(s => s.value !== "all").forEach(s => {
    stationCounts[s.value] = activeOrders?.filter(o =>
      o.items.some((item: any) => (item.kitchenStation ?? "main") === s.value)
    ).length ?? 0;
  });

  if (isLoading && !activeOrders) {
    return (
      <div className="p-8 h-full bg-muted/20">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <ChefHat className="h-8 w-8" />
          Kitchen Display
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-background border-b shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            Kitchen Display
          </h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium">Pending ({activeOrders?.filter(o => o.status === 'pending').length || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">In Progress ({activeOrders?.filter(o => o.status === 'in_progress').length || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Ready ({activeOrders?.filter(o => o.status === 'ready').length || 0})</span>
            </div>
          </div>
        </div>

        {/* Station tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {allStations.map(station => {
            const count = station.value === "all"
              ? (activeOrders?.length ?? 0)
              : (stationCounts[station.value] ?? 0);
            const isActive = activeStation === station.value;
            return (
              <button
                key={station.value}
                onClick={() => setActiveStation(station.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {station.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-32">
            <CheckCircle2 className="h-16 w-16 mb-4 text-green-500/50" />
            <h2 className="text-2xl font-bold">All caught up!</h2>
            <p>
              {activeStation === "all"
                ? "No active orders in the queue."
                : `No active orders for ${stationLabel(activeStation)}.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start auto-rows-max">
            {filteredOrders.map(order => (
              <Card key={order.id} className="overflow-hidden border-2 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="p-4 bg-card border-b flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-xl font-black">#{order.orderNumber}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1 font-medium">
                      {order.customerName || "Walk-in"} • {order.baristaName}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={`capitalize px-3 py-1 ${getStatusColor(order.status)}`}>
                      {order.status.replace("_", " ")}
                    </Badge>
                    <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatDistanceToNow(new Date(order.createdAt))} ago
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {order.items.map((item: any) => {
                      const itemStation = item.kitchenStation ?? "main";
                      const isThisStation = activeStation === "all" || itemStation === activeStation;
                      return (
                        <div
                          key={item.id}
                          className={`p-4 transition-colors ${
                            isThisStation
                              ? "bg-background"
                              : "bg-muted/30 opacity-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`font-bold px-2 py-1 rounded text-sm min-w-8 text-center shrink-0 ${
                              isThisStation
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {item.quantity}x
                            </div>
                            <div className="flex-1">
                              <div className={`font-bold text-lg leading-tight ${!isThisStation && "text-muted-foreground"}`}>
                                {item.drinkName}
                              </div>
                              {!isThisStation && activeStation !== "all" && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  → {stationLabel(itemStation)}
                                </div>
                              )}
                              {isThisStation && item.customizations.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {item.customizations
                                    .filter((cust: any) => (cust.baristaSortOrder ?? 1) !== 0)
                                    .sort((a: any, b: any) => (a.baristaSortOrder ?? 1) - (b.baristaSortOrder ?? 1))
                                    .map((cust: any) => (
                                      <li key={cust.id} className="text-sm text-muted-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                        <span className="font-medium text-foreground/70">{cust.slotLabel}:</span>
                                        <span>{cust.optionLabel}</span>
                                      </li>
                                    ))}
                                </ul>
                              )}
                              {isThisStation && item.specialNotes && (
                                <div className="mt-2 p-2 bg-yellow-500/10 text-yellow-700 rounded text-sm font-medium border border-yellow-500/20 italic">
                                  Note: {item.specialNotes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>

                <CardFooter className="p-4 bg-muted/30 border-t">
                  <Button
                    className="w-full h-12 text-lg font-bold"
                    variant={order.status === "pending" ? "default" : order.status === "in_progress" ? "secondary" : "outline"}
                    onClick={() => handleAdvanceStatus(order.id, order.status)}
                  >
                    {order.status === "pending" && "Start Order"}
                    {order.status === "in_progress" && "Mark Ready"}
                    {order.status === "ready" && "Complete"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
