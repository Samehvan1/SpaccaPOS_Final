import React from "react";
import { Lock, Ticket, Check, X, Loader2, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fmt } from "@/lib/currency";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  branches: any[];
  selectedBranchId: number | null;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  customerInfo?: { name: string; points: number } | null;
  paymentMethod: "cash" | "card" | "wallet" | "hospitality";
  setPaymentMethod: (val: "cash" | "card" | "wallet" | "hospitality") => void;
  adminPin: string;
  setAdminPin: (val: string) => void;
  amountTendered: string;
  setAmountTendered: (val: string) => void;
  discountCode: string;
  setDiscountCode: (val: string) => void;
  appliedDiscount: any;
  setAppliedDiscount: (val: any) => void;
  isValidatingDiscount: boolean;
  onValidateDiscount: () => void;
  isNameRequired: boolean;
  cartSubtotal: number;
  discountAmount: number;
  cartTotal: number;
  isCreatingOrder: boolean;
  onSubmitCheckout: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  isOpen,
  onClose,
  branches,
  selectedBranchId,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerInfo,
  paymentMethod,
  setPaymentMethod,
  adminPin,
  setAdminPin,
  amountTendered,
  setAmountTendered,
  discountCode,
  setDiscountCode,
  appliedDiscount,
  setAppliedDiscount,
  isValidatingDiscount,
  onValidateDiscount,
  isNameRequired,
  cartSubtotal,
  discountAmount,
  cartTotal,
  isCreatingOrder,
  onSubmitCheckout,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Order</DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black tracking-widest text-[10px] uppercase">
              Sending to: {branches.find((b) => b.id === selectedBranchId)?.name || "Default Branch"}
            </Badge>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer" className={isNameRequired ? "text-primary font-bold" : ""}>
              Customer Name {isNameRequired ? "(Required)" : "(Optional)"}
            </Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Name for the order"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone" className={customerPhone.trim() && !(/^01[0125][0-9]{8}$/.test(customerPhone.trim()) || /^(?:\+20|20)1[0125][0-9]{8}$/.test(customerPhone.trim())) ? "text-destructive" : ""}>Customer Phone (Loyalty)</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              pattern="[0-9+]*"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9+]/g, ""))}
              onKeyDown={(e) => {
                if (
                  ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key) ||
                  (e.ctrlKey || e.metaKey)
                ) {
                  return;
                }
                if (!/^[0-9+]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="e.g. 01012345678"
              className={customerPhone.trim() && !(/^01[0125][0-9]{8}$/.test(customerPhone.trim()) || /^(?:\+20|20)1[0125][0-9]{8}$/.test(customerPhone.trim())) ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {customerPhone.trim() && !(/^01[0125][0-9]{8}$/.test(customerPhone.trim()) || /^(?:\+20|20)1[0125][0-9]{8}$/.test(customerPhone.trim())) && (
              <p className="text-[10px] text-destructive font-semibold">
                Invalid Egyptian phone format. Use 01XXXXXXXXX or +201XXXXXXXXX.
              </p>
            )}
            {customerInfo && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                <Check className="h-4 w-4 shrink-0" />
                <span>Customer: {customerInfo.name} ({customerInfo.points} pts)</span>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground italic">
              Enter phone for loyalty points and future health tracking system.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {["cash", "card", "wallet"].map((method) => (
                <Button
                  key={method}
                  variant={paymentMethod === method ? "default" : "outline"}
                  onClick={() => {
                    setPaymentMethod(method as any);
                    if (method !== "hospitality") setAdminPin("");
                  }}
                  className="capitalize"
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>
          {paymentMethod === "hospitality" && (
            <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="adminPin" className="text-pink-600 font-bold">Admin/Supervisor Authorization PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
                <Input
                  id="adminPin"
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter Admin or Supervisor PIN"
                  className="pl-9 border-pink-200 focus-visible:ring-pink-500"
                  autoComplete="off"
                />
              </div>
            </div>
          )}
          {paymentMethod === "cash" && (
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount Tendered</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                placeholder={fmt(cartTotal)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="coupon">Discount Coupon</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="coupon"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter code"
                  className="pl-9 font-mono font-bold uppercase"
                  disabled={!!appliedDiscount || isValidatingDiscount}
                  autoComplete="off"
                />
              </div>
              {appliedDiscount ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive border-destructive/20 hover:bg-destructive/5"
                  onClick={() => { setAppliedDiscount(null); setDiscountCode(""); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={onValidateDiscount}
                  disabled={!discountCode.trim() || isValidatingDiscount}
                >
                  {isValidatingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {appliedDiscount && (
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <Check className="h-3 w-3" />
                Applied: {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `${fmt(appliedDiscount.value)}${appliedDiscount.type === 'fixed_per_item' ? '/item' : ''}`} Off
                {appliedDiscount.reason && <span className="text-muted-foreground font-semibold lowercase"> ({appliedDiscount.reason})</span>}
              </p>
            )}

          </div>

          <div className="space-y-1.5 py-4 border-t border-b">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{fmt(cartSubtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Discount
                </span>
                <span>-{fmt(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-lg">Total Due</span>
              <span className="font-bold text-2xl text-primary">{fmt(cartTotal)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreatingOrder}>
            Cancel
          </Button>
          <Button onClick={onSubmitCheckout} disabled={isCreatingOrder} className="min-w-[120px]">
            {isCreatingOrder ? "Processing..." : "Charge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
