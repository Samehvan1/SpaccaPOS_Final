import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type CupLayer = {
  id: string | number;
  label: string;
  volume: number; // in ml
  color?: string;
  category?: string;
};

interface CupSimulatorProps {
  cupSizeMl: number;
  layers: CupLayer[];
  showLabels?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  coffee: "#2D1B14", // Very deep brown
  espresso: "#1A0F0A",
  milk: "#FFFFFF", // Pure white for contrast
  syrup: "#F59E0B", // Vibrant Amber
  sweetener: "#FCD34D", // Amber 300
  topping: "#78350F", // Brown 900
  base: "#D1D5DB", // Gray 300
  water: "#60A5FA", // Bright Blue
};

export function CupSimulator({ cupSizeMl, layers, showLabels = true, className = "" }: CupSimulatorProps) {
  const totalVolume = useMemo(() => layers.reduce((sum, l) => sum + l.volume, 0), [layers]);
  
  // Normalized layers (percentage of cup size)
  const visualizedLayers = useMemo(() => {
    let currentY = 0; // Starts from bottom (0 in normalized local space, but we map to SVG)
    return layers.map((layer) => {
      const heightPercent = (layer.volume / (cupSizeMl || 1)) * 100;
      const part = {
        ...layer,
        height: heightPercent,
        bottom: currentY,
        color: layer.color || CATEGORY_COLORS[layer.category?.toLowerCase() || ""] || "#9ca3af",
      };
      currentY += heightPercent;
      return part;
    });
  }, [layers, cupSizeMl]);

  const hasDynamicFill = totalVolume < (cupSizeMl || 0);
  const dynamicFillHeight = hasDynamicFill ? ((cupSizeMl - totalVolume) / cupSizeMl) * 100 : 0;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-md overflow-visible"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          {/* Mask for the cup shape (tapered) */}
          <mask id="cup-mask">
            <path
              d="M15,10 L85,10 L75,110 L25,110 Z"
              fill="white"
            />
          </mask>
          
          {/* Gloss/Reflection effect */}
          <linearGradient id="gloss" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.05" />
            <stop offset="30%" stopColor="white" stopOpacity="0.15" />
            <stop offset="50%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Cup Glass/Background */}
        <path
          d="M15,10 L85,10 L75,110 L25,110 Z"
          fill="#f8fafc" 
          stroke="currentColor"
          strokeWidth="4"
          className="text-foreground"
        />

        {/* Content Group (Masked) */}
        <g mask="url(#cup-mask)">
          <AnimatePresence mode="popLayout">
            {/* Visualized Stacked Layers */}
            {visualizedLayers.map((layer, index) => (
              <motion.rect
                key={layer.id}
                layout
                initial={{ height: 0, y: 110 }}
                animate={{ 
                  height: layer.height + 0.8, 
                  y: 110 - layer.bottom - layer.height,
                  fill: layer.color
                }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  mass: 0.8
                }}
                x="0"
                width="100"
              />
            ))}
          </AnimatePresence>

          {/* Dynamic Fill (Liquid on top) */}
          {hasDynamicFill && (
            <motion.rect
              initial={{ height: 0 }}
              animate={{ height: dynamicFillHeight }}
              transition={{ duration: 0.5 }}
              x="0"
              y="10"
              width="100"
              fill="#BFDBFE" 
              fillOpacity="0.6"
            />
          )}
          
          {/* Glass Rim effect */}
          <path d="M15,10 L85,10" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
          
          {/* Reflection overlay */}
          <rect x="0" y="0" width="100" height="120" fill="url(#gloss)" pointerEvents="none" />
        </g>

        {/* Scale indicators */}
        <line x1="20" y1="35" x2="32" y2="35" stroke="currentColor" strokeWidth="1" className="text-foreground/30" />
        <line x1="22" y1="60" x2="34" y2="60" stroke="currentColor" strokeWidth="1" className="text-foreground/30" />
        <line x1="24" y1="85" x2="36" y2="85" stroke="currentColor" strokeWidth="1" className="text-foreground/30" />
      </svg>
    </div>
  );
}
