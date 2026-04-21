import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Loader2, PackageCheck, Zap, History, User } from "lucide-react";
import { useGetActiveOrders, useUpdateOrderStatus } from "@workspace/api-client-react";

export default function PickupPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: readyOrders = [], isLoading: isLoadingReady } = useGetActiveOrders(
    { status: "ready" as any },
    { query: { refetchInterval: 5000 } as any }
  );

  // Fetch recently completed orders for the sidebar
  const { data: completedOrders = [] } = useGetActiveOrders(
    { status: "completed" as any },
    { query: { refetchInterval: 10000 } as any }
  );

  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const handleCompleteOrder = (orderId: number) => {
    updateStatus(
      { id: orderId, data: { status: "completed" } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/active-orders"] });
          toast({ title: "Order Delivered", description: `Order ${data.orderNumber} marked as completed.` });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to update order status." });
        },
      }
    );
  };

  if (isLoadingReady) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-neon-green" />
      </div>
    );
  }

  const recentlyCompleted = completedOrders
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex h-full bg-[#0a0a0a] overflow-hidden text-foreground selection:bg-neon-green/30">
      {/* Main Queue Section */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-neon-green/5 to-transparent pointer-events-none" />

        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/20 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
             <div className="bg-neon-green/10 p-2 rounded-xl border border-neon-green/20">
               <PackageCheck className="h-6 w-6 text-neon-green" />
             </div>
             <div>
               <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                 <span className="text-neon-green">Ready</span> for Pickup
               </h1>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Live Delivery Stream</p>
             </div>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-2xl flex items-baseline gap-3">
             <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Active Ready</span>
             <span className="text-2xl font-black text-neon-green [text-shadow:0_0_10px_rgba(57,255,20,0.5)]">{readyOrders.length}</span>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-10">
            {readyOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-in fade-in duration-1000">
                <div className="relative mb-8">
                  <Zap className="h-24 w-24 opacity-5 text-neon-green" />
                  <div className="absolute inset-0 bg-neon-green/5 blur-3xl rounded-full" />
                </div>
                <p className="text-4xl font-black italic tracking-tighter opacity-20">SYSTEMS CLEAR</p>
                <p className="text-xs font-bold tracking-[0.3em] uppercase mt-4">Monitoring for incoming orders</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 pb-10">
                {readyOrders.map((order: any, idx: number) => (
                  <Card key={order.id} className={`glass-card border-neon-green/20 overflow-hidden rounded-3xl group animate-in slide-in-from-bottom-${idx + 1} duration-500`}>
                    <CardHeader className="bg-neon-green/5 p-8 pb-6 border-b border-white/5">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-7xl font-black tracking-tighter neon-text-green leading-none">
                            #{order.orderNumber}
                          </div>
                          <div className="flex items-center gap-3 mt-4 text-xs font-black text-white/40 uppercase tracking-widest">
                            <Clock className="h-3 w-3 text-neon-green" />
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="flex shrink-0">
                           <div className="w-12 h-12 rounded-full border-2 border-neon-green/40 flex items-center justify-center text-neon-green animate-pulse">
                              <Zap className="h-6 w-6 fill-neon-green/10" />
                           </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pb-6">
                       <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center text-neon-green">
                             <User className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer Name</p>
                             <p className="text-xl font-bold tracking-tight">{order.customerName || "Walk-In guest"}</p>
                          </div>
                       </div>

                       <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar scroll-smooth">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-transparent hover:border-white/10 transition-all">
                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-neon-green/20 text-neon-green text-sm font-black ring-1 ring-neon-green/30">
                                 {item.quantity}
                            </span>
                            <span className="text-base font-bold flex-1 truncate uppercase tracking-tighter">{item.drinkName}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-0 border-t border-white/5">
                      <Button 
                        className="w-full h-24 rounded-none text-2xl font-black uppercase tracking-tighter gap-4 bg-neon-green hover:opacity-90 text-black shadow-lg active:scale-[0.98] transition-all duration-300"
                        onClick={() => handleCompleteOrder(order.id)}
                        disabled={isPending}
                      >
                        {isPending ? (
                             <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                            <>
                                <PackageCheck className="h-8 w-8" />
                                MARK DELIVERED
                            </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* History Sidebar */}
      <aside className="w-[380px] border-l border-white/10 shrink-0 flex flex-col bg-black/40 backdrop-blur-xl z-20">
         <header className="h-20 flex items-center px-8 border-b border-white/10 shrink-0">
           <History className="h-5 w-5 mr-3 text-muted-foreground" />
           <h2 className="text-sm font-black uppercase tracking-widest">Recently Completed</h2>
         </header>
         <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
               {recentlyCompleted.length === 0 ? (
                 <div className="py-20 text-center space-y-3 opacity-20">
                    <History className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest leading-relaxed">No history<br/>to display yet</p>
                 </div>
               ) : (
                 recentlyCompleted.map((order: any) => (
                   <div key={order.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                         <div>
                            <span className="text-xl font-black tracking-tighter group-hover:text-neon-cyan transition-colors">#{order.orderNumber}</span>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 truncate max-w-[120px]">{order.customerName || "Walk-In"}</p>
                         </div>
                         <Badge variant="outline" className="border-neon-cyan/20 text-neon-cyan bg-neon-cyan/5 text-[9px] font-black h-5 px-2">COLLECTED</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-4">
                         <Clock className="h-3 w-3" />
                         {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                   </div>
                 ))
               )}
            </div>
         </ScrollArea>
         <footer className="p-6 border-t border-white/10 text-center bg-black/20 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Spacca System v2.0</p>
         </footer>
      </aside>
    </div>
  );
}
