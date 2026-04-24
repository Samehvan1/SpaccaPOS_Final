import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

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
  coffee: "#4b2c20",
  espresso: "#1A0F0A",
  milk: "#fdf5e6",
  syrup: "#d4a373",
  sauce: "#7f4f24",
  sweetener: "#ffffff",
  topping: "#fb8500",
  base: "#D1D5DB",
  water: "#60A5FA",
  other: "#9ca3af",
  ice: "#E0F2FE",
  cream: "#F5F5DC",
  chocolate: "#5D4037",
};

function LiquidLayer({
  layer,
  bottomY,
  height,
  radiusBottom,
  radiusTop,
}: {
  layer: CupLayer;
  bottomY: number;
  height: number;
  radiusBottom: number;
  radiusTop: number;
}) {
  const getDynamicColor = (layer: CupLayer) => {
    if (layer.color) return layer.color;
    const lowerLabel = layer.label?.toLowerCase() || '';
    const lowerCategory = layer.category?.toLowerCase() || '';
    if (lowerLabel.includes('milk') || lowerCategory.includes('milk')) return CATEGORY_COLORS.milk;
    if (lowerLabel.includes('coffee') || lowerCategory.includes('coffee') || lowerCategory.includes('espresso')) return CATEGORY_COLORS.coffee;
    if (lowerLabel.includes('ice') || lowerCategory.includes('ice') || lowerCategory.includes('water')) return CATEGORY_COLORS.ice;
    if (lowerLabel.includes('cream') || lowerCategory.includes('cream')) return CATEGORY_COLORS.cream;
    if (lowerLabel.includes('chocolate') || lowerCategory.includes('chocolate')) return CATEGORY_COLORS.chocolate;
    if (lowerLabel.includes('syrup') || lowerCategory.includes('syrup')) return CATEGORY_COLORS.syrup;
    if (lowerLabel.includes('topping') || lowerCategory.includes('topping')) return CATEGORY_COLORS.topping;
    return CATEGORY_COLORS[lowerCategory] || CATEGORY_COLORS.other;
  };

  const color = getDynamicColor(layer);

  const isIced = layer.category?.toLowerCase().includes("water") || layer.label.toLowerCase().includes("ice");
  const isStrawberry =
    layer.label.toLowerCase().includes("strawberry") ||
    (layer.category?.toLowerCase() === "syrup" && color.toLowerCase() === "#ef4444");

  const particleCount = isIced ? 15 : isStrawberry ? 10 : 0;

  const particles = useMemo(() => {
    const pts = [];
    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 0.75 * ((radiusBottom + radiusTop) / 2);
      const theta = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * height * 0.8;
      pts.push({
        position: new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)),
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        scale: 0.8 + Math.random() * 0.4
      });
    }
    return pts;
  }, [particleCount, height, radiusBottom, radiusTop]);

  // Use a slightly negative epsilon to make each layer overlap the one below by a
  // tiny amount. This closes the sub-pixel seam that the transmissive render pass
  // leaves between adjacent cylinders without affecting the visible proportions.
  const SEAM_OVERLAP = 0.005;

  return (
    <group position={[0, bottomY + height / 2, 0]}>
      <mesh>
        <cylinderGeometry
          args={[radiusTop, radiusBottom, Math.max(height + SEAM_OVERLAP, 0.01), 32]}
        />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.88}
          roughness={0.15}
          depthWrite={false}
        />
      </mesh>

      {particles.map((p, idx) => (
        <mesh 
          key={idx} 
          position={p.position} 
          rotation={p.rotation}
          scale={[p.scale, p.scale, p.scale]}
        >
          {isIced ? (
            <boxGeometry args={[0.3, 0.3, 0.3]} />
          ) : (
            <sphereGeometry args={[0.15, 8, 8]} />
          )}
          <meshPhysicalMaterial
            color={isIced ? "#ffffff" : "#ef4444"}
            transparent
            opacity={isIced ? 0.4 : 1}
            roughness={isIced ? 0.05 : 0.6}
            metalness={isIced ? 0.05 : 0}
            transmission={isIced ? 0.95 : 0}
            thickness={0.2}
            ior={1.31}
            clearcoat={isIced ? 1 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

function CupAssembly({ cupSizeMl, layers }: { cupSizeMl: number; layers: CupLayer[] }) {
  const cupHeight = 5;
  const cupRadiusTop = 1.6;
  const cupRadiusBottom = 1.1;

  const visualizedLayers = useMemo(() => {
    let currentEffectiveVolume = 0;
    const maxVolume = cupSizeMl || 1;

    return layers.map((layer) => {
      const effectiveVolume = Math.max(layer.volume, 0.1);
      const volumePercent = effectiveVolume / maxVolume;
      const layerHeight = volumePercent * cupHeight;

      const startY = (currentEffectiveVolume / maxVolume) * cupHeight;
      const endY = startY + layerHeight;

      const rB = cupRadiusBottom + (cupRadiusTop - cupRadiusBottom) * (startY / cupHeight);
      const rT = cupRadiusBottom + (cupRadiusTop - cupRadiusBottom) * (endY / cupHeight);

      const part = {
        ...layer,
        height: layerHeight,
        bottomY: startY - cupHeight / 2,
        radiusBottom: rB * 0.95,
        radiusTop: rT * 0.95,
      };

      currentEffectiveVolume += effectiveVolume;
      return part;
    });
  }, [layers, cupSizeMl]);

  return (
    <group position={[0, 0, 0]}>
      {/* Glass shell — keep transmission only on the outer glass, not the liquids */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[cupRadiusTop, cupRadiusBottom, cupHeight, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.05}
          transmission={0.9}
          thickness={0.1}
          ior={1.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {visualizedLayers.map((layer) => (
        <LiquidLayer
          key={layer.id}
          layer={layer}
          bottomY={layer.bottomY}
          height={layer.height}
          radiusBottom={layer.radiusBottom}
          radiusTop={layer.radiusTop}
        />
      ))}
    </group>
  );
}

export function CupSimulator({
  cupSizeMl,
  layers,
  showLabels = true,
  className = "",
}: CupSimulatorProps) {
  return (
    <div className={`relative flex flex-col items-center w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />

        <Environment preset="city" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <CupAssembly cupSizeMl={cupSizeMl} layers={layers} />
        </Float>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}
