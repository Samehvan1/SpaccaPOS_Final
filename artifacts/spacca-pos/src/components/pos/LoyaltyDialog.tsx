import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

interface LoyaltyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loyaltyPoints: number | null;
  createdOrder: any;
  onSaveSignature: (signatureData: string) => void;
}

export const LoyaltyDialog: React.FC<LoyaltyDialogProps> = ({
  isOpen,
  onClose,
  loyaltyPoints,
  createdOrder,
  onSaveSignature,
}) => {
  const { pointsConversionRate } = useSettings();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Loyalty Status</DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Total Loyalty Points</p>
            <div className="text-5xl font-black text-primary italic">
              {loyaltyPoints !== null ? loyaltyPoints : "..."}
            </div>
            <p className="text-sm font-medium">Points earned from this order: {createdOrder ? Math.floor((parseFloat(createdOrder.subtotal) / 1.14) / pointsConversionRate) : 0}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-muted" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm with Signature</span>
              <div className="h-px flex-1 bg-muted" />
            </div>
            <SignaturePad onSave={onSaveSignature} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Skip Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function SignaturePad({ onSave }: { onSave: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPointerPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL("image/png");
      onSave(data);
    }
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-stone-200 rounded-2xl bg-white overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-44 touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={clear} className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-xs">
          Clear
        </Button>
        <Button onClick={save} className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-xs">
          Confirm
        </Button>
      </div>
    </div>
  );
}
