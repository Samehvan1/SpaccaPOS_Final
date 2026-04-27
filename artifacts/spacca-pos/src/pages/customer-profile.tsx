import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Star, TrendingUp, ArrowLeft, LogOut, Edit2, Check, X, Phone, Mail, Receipt } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

function fmtMoney(val: string | number) {
  return `EGP ${Number(val).toFixed(2)}`;
}

function getPointsLevel(points: number): { label: string; next: number } {
  if (points >= 500) return { label: "Gold", next: Infinity };
  if (points >= 200) return { label: "Silver", next: 500 };
  return { label: "Bronze", next: 200 };
}

export default function CustomerProfile() {
  const [, setLocation] = useLocation();
  const { customer, isLoading, logout, refetch } = useCustomerAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !customer) {
      setLocation("/customer/auth");
    }
  }, [customer, isLoading, setLocation]);

  useEffect(() => {
    if (customer) {
      setEditName(customer.name);
      setEditEmail(customer.email ?? "");
      setIsLoadingOrders(true);
      fetch(`${API_BASE}/customers/me/orders`, { credentials: "include" })
        .then(r => r.ok ? r.json() : { orders: [] })
        .then(d => setOrders(d.orders ?? []))
        .finally(() => setIsLoadingOrders(false));
    }
  }, [customer]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/customers/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Profile updated" });
      refetch();
      setIsEditing(false);
    } catch {
      toast({ variant: "destructive", title: "Failed to save profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signed out" });
    setLocation("/pos");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) return null;

  const level = getPointsLevel(customer.points);
  const progressPct = level.next === Infinity ? 100 : Math.min(100, (customer.points / level.next) * 100);
  const nextLevelName = level.next >= 500 ? "Gold" : "Silver";

  return (
    <div className="min-h-screen w-full bg-background overflow-y-auto">
      {/* Subtle background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/pos">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Profile Hero */}
        <Card className="mb-6 overflow-hidden shadow-lg shadow-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl font-black text-primary-foreground shadow-md shrink-0">
                {customer.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="h-8 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="h-8 mt-1"
                        placeholder="optional"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-8 gap-1.5" onClick={handleSaveProfile} disabled={isSaving}>
                        <Check className="h-3 w-3" /> {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground" onClick={() => setIsEditing(false)}>
                        <X className="h-3 w-3" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold text-foreground truncate">{customer.name}</h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {customer.email}
                      </div>
                    )}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs font-bold border-primary text-primary">
                        ⭐ {level.label} Member
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-black text-foreground">{customer.points}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Points</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <Coffee className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-black text-foreground">{customer.visit_count}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Visits</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-base font-black text-foreground leading-tight mt-0.5">{fmtMoney(customer.total_spent)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Points Progress */}
        {level.next !== Infinity && (
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground font-medium">Progress to {nextLevelName}</span>
                <span className="text-primary font-semibold">{customer.points} / {level.next} pts</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {level.next - customer.points} points needed to reach {nextLevelName}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order History */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Coffee className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No orders yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Your order history will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border"
                  >
                    <div>
                      <div className="text-foreground text-sm font-semibold">Order #{order.order_number}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}
                        {order.item_count > 0 && ` · ${order.item_count} item${order.item_count !== 1 ? "s" : ""}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-bold text-sm">{fmtMoney(order.total)}</div>
                      <Badge
                        variant="outline"
                        className={`text-xs mt-1 ${
                          order.status === "completed" ? "border-primary text-primary" :
                          order.status === "cancelled" ? "border-destructive text-destructive" :
                          "border-muted-foreground text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Member since {format(new Date(customer.created_at), "MMMM yyyy")}
        </p>
      </div>
    </div>
  );
}
