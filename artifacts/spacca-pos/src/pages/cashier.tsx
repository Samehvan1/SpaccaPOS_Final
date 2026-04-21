import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Calculator, ClipboardList, User, DollarSign, ListChecks, CreditCard } from "lucide-react";
import { fmt } from "@/lib/currency";
import { printCustomerReceipt, printAgentReceipts } from "@/components/receipt-printer";
import { useSettings } from "@/hooks/use-settings";
import { useGetActiveOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PosTerminal from "./pos";
import { useOrderEvents } from "@/hooks/use-order-events";

export default function CashierPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { autoPrintCustomer, autoPrintAgent } = useSettings();

  useOrderEvents();

  const { data: orders = [], isLoading } = useGetActiveOrders(
    { status: "pending" as any },
    { query: { } as any }
  );

  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const handleUpdateStatus = (orderId: any, status: string) => {
    updateStatus(
      { id: orderId as any, data: { status: status as any } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/active-orders"] });
          
          if (status === "paid") {
            toast({ title: "Order Approved", description: `Order ${data.orderNumber} is now sent to KDS.` });
            if (autoPrintCustomer) printCustomerReceipt(data as any);
            if (autoPrintAgent) printAgentReceipts(data as any);
          } else if (status === "cancelled") {
            toast({ title: "Order Cancelled", description: `Order ${data.orderNumber} has been cancelled.` });
          }
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to update order status." });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-neon-cyan" />
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const heroOrder = sortedOrders[0];
  const remainingOrders = sortedOrders.slice(1);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-green/5 blur-[120px] pointer-events-none rounded-full" />

      <Tabs defaultValue="approvals" className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-background/40 backdrop-blur-md border-b border-white/5 px-8 h-16 shrink-0 flex items-center justify-between z-10">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tighter text-foreground uppercase select-none">
              Cashier <span className="text-neon-green">Approval</span>
            </h1>
            <TabsList className="bg-white/5 border border-white/10 p-1 h-10">
              <TabsTrigger value="approvals" className="gap-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-neon-cyan">
                <ClipboardList className="h-4 w-4" />
                Approvals {orders.length > 0 && <span className="ml-1 px-1.5 py-0 rounded-full bg-neon-cyan/20 text-neon-cyan text-[10px] font-black">{orders.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="terminal" className="gap-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-neon-green">
                <Calculator className="h-4 w-4" />
                Terminal
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              Live Dashboard
            </div>
          </div>
        </div>

        <TabsContent value="approvals" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
          <ScrollArea className="flex-1">
            <div className="max-w-[1600px] mx-auto p-8 space-y-10">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[70vh] text-muted-foreground animate-in fade-in zoom-in duration-500">
                  <div className="relative">
                    <Check className="h-24 w-24 mb-6 opacity-20 text-neon-green" />
                    <div className="absolute inset-0 bg-neon-green/10 blur-2xl rounded-full" />
                  </div>
                  <p className="text-3xl font-black tracking-tighter text-foreground/50">QUEUE CLEAR</p>
                  <p className="text-sm font-medium mt-2 tracking-widest uppercase">Everything has been processed</p>
                </div>
              ) : (
                <>
                  {/* Hero Order */}
                  {heroOrder && (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                      <div className="mb-4 flex items-center justify-between">
                         <h2 className="text-sm font-black uppercase tracking-widest text-neon-cyan flex items-center gap-2">
                           <span className="w-8 h-[2px] bg-neon-cyan" />
                           Next in queue
                         </h2>
                         <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5">TOP PRIORITY</Badge>
                      </div>
                      <Card className="glass-card overflow-hidden border-neon-green/30 ring-1 ring-neon-green/10 rounded-3xl">
                        <CardContent className="p-0">
                           <div className="flex flex-col lg:flex-row">
                             <div className="flex-1 p-6 space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div>
                                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Order Identity</label>
                                   <div className="text-4xl font-black tracking-tighter neon-text-cyan">
                                      #{heroOrder.orderNumber}
                                   </div>
                                   <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase flex items-center gap-2">
                                     <span className="px-1.5 py-0.5 bg-white/5 rounded">LARGE</span>
                                     <span className="px-1.5 py-0.5 bg-white/5 rounded">WHITE CUP</span>
                                   </div>
                                 </div>
                                 <div>
                                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Customer</label>
                                   <div className="text-xl font-bold truncate">
                                      {heroOrder.customerName || "Walk-in Guest"}
                                   </div>
                                   <div className="text-xs text-muted-foreground mt-0.5 font-medium">Standard Service • Dine-In</div>
                                 </div>
                                 <div>
                                   <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] mb-1 block">Amount Due</label>
                                   <div className="text-4xl font-black tracking-tighter text-neon-green">
                                      {fmt(parseFloat(heroOrder.total as any))}
                                   </div>
                                 </div>
                               </div>

                               <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-8 items-start">
                                  <div className="min-w-[140px]">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Payment Method</label>
                                    <div className="flex items-center gap-2">
                                       <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/20">
                                          <CreditCard className="h-4 w-4" />
                                       </div>
                                       <span className="text-sm font-black uppercase tracking-tight">{heroOrder.paymentMethod || "Pending"}</span>
                                    </div>
                                  </div>

                                  <div className="hidden md:block w-[1px] h-12 bg-white/10 self-center" />

                                  <div className="flex-1">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Line Items</label>
                                    <div className="flex flex-wrap gap-2">
                                      {heroOrder.items.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                          <span className="w-5 h-5 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                                          <span className="text-xs font-bold">{item.drinkName}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                               </div>
                             </div>

                             {/* Hero Actions - Large Square Buttons */}
                             <div className="w-full lg:w-auto bg-white/[0.02] border-t lg:border-t-0 lg:border-l border-white/5 p-8 flex flex-row gap-6 items-center justify-center lg:min-w-[480px]">
                                <Button 
                                  className="w-44 h-44 rounded-3xl flex flex-col items-center justify-center gap-2 group bg-neon-green/10 hover:bg-neon-green text-neon-green hover:text-background transition-all duration-300 border border-neon-green/30 hover:border-glow-green glow-green shadow-xl"
                                  onClick={() => handleUpdateStatus(heroOrder.id, "paid")}
                                  disabled={isPending}
                                >
                                  <Check className="h-12 w-12 group-hover:scale-125 transition-transform" />
                                  <span className="text-xl font-black tracking-tighter uppercase">APPROVE</span>
                                  <span className="text-xs font-bold opacity-60 uppercase tracking-widest">{fmt(parseFloat(heroOrder.total as any))}</span>
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="w-44 h-44 rounded-3xl flex flex-col items-center justify-center gap-2 group border-neon-red/30 text-neon-red hover:bg-neon-red hover:text-white transition-all duration-300 glow-red shadow-xl"
                                  onClick={() => handleUpdateStatus(heroOrder.id, "cancelled")}
                                  disabled={isPending}
                                >
                                  <X className="h-12 w-12 group-hover:rotate-90 transition-transform" />
                                  <span className="text-xl font-bold tracking-tighter uppercase">CANCEL</span>
                                  <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Void</span>
                                </Button>
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Other Orders Grid */}
                  {remainingOrders.length > 0 && (
                    <div className="space-y-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-white/10" />
                        Remaining orders ({remainingOrders.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {remainingOrders.map((order: any) => (
                          <Card key={order.id} className="glass-card border-neon-green/20 ring-1 ring-white/5 hover:border-neon-green/40 transition-all group rounded-3xl overflow-hidden shadow-2xl">
                            <CardHeader className="p-6 pb-4 border-b border-white/5 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-2xl font-black tracking-tighter group-hover:text-neon-cyan transition-colors">#{order.orderNumber}</div>
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate max-w-[150px]">
                                    {order.customerName || "Walk-in"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-black text-neon-green">{fmt(parseFloat(order.total as any))}</div>
                                  <Badge variant="outline" className="mt-1 border-white/10 text-[10px] bg-white/5 uppercase">{order.paymentMethod}</Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6 h-[180px] overflow-hidden relative">
                               <ScrollArea className="h-full pr-2">
                                 <div className="space-y-2">
                                   {order.items.map((item: any) => (
                                     <div key={item.id} className="flex justify-between text-sm items-center bg-white/5 p-2.5 rounded-xl border border-transparent hover:border-white/10 transition-all">
                                       <span className="font-bold">
                                         <span className="text-neon-cyan mr-2">{item.quantity}x</span>
                                         {item.drinkName}
                                       </span>
                                       <span className="text-muted-foreground font-medium text-xs">{fmt(parseFloat(item.lineTotal as any))}</span>
                                     </div>
                                   ))}
                                 </div>
                               </ScrollArea>
                               <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                            </CardContent>
                            <CardFooter className="p-4 grid grid-cols-2 gap-3 bg-white/[0.02] border-t border-white/5">
                               <Button 
                                  variant="ghost" 
                                  className="h-12 font-black text-xs uppercase tracking-widest hover:bg-neon-red/10 hover:text-neon-red transition-all rounded-xl"
                                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                  disabled={isPending}
                               >
                                 <X className="w-4 h-4 mr-2" /> Cancel
                               </Button>
                               <Button 
                                  className="h-12 font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-neon-green/20 hover:text-neon-green text-foreground transition-all rounded-xl border border-white/5 hover:border-neon-green/30"
                                  onClick={() => handleUpdateStatus(order.id, "paid")}
                                  disabled={isPending}
                               >
                                 <Check className="w-4 h-4 mr-2" /> Approve
                               </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="terminal" className="flex-1 flex flex-col overflow-hidden m-0">
          <PosTerminal />
        </TabsContent>
      </Tabs>
    </div>
  );
}
