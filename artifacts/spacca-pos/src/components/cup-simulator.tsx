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
  coffee: "#2D1B14", // Very deep brown
  espresso: "#1A0F0A",
  milk: "#FFFFFF", // Pure white for contrast
  syrup: "#F59E0B", // Vibrant Amber
  sweetener: "#FCD34D", // Amber 300
  topping: "#78350F", // Brown 900
  base: "#D1D5DB", // Gray 300
  water: "#60A5FA", // Bright Blue
};

// 3D Liquid Layer
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
  const color = layer.color || CATEGORY_COLORS[layer.category?.toLowerCase() || ""] || "#9ca3af";

  // Proof of concept: Embed dynamic items like ice or strawberry pieces based on label or category
  const isIced = layer.category?.toLowerCase() === "water" || layer.label.toLowerCase().includes("ice");
  const isStrawberry =
    layer.label.toLowerCase().includes("strawberry") ||
    (layer.category?.toLowerCase() === "syrup" && color.toLowerCase() === "#ef4444");

  const particleCount = isIced ? 15 : isStrawberry ? 10 : 0;

  // Random positions for particles inside this specific layer volume
  const particles = useMemo(() => {
    const pts = [];
    for (let i = 0; i < particleCount; i++) {
      // Keep inside the cylinder roughly
      const r = Math.random() * 0.75 * ((radiusBottom + radiusTop) / 2);
      const theta = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * height * 0.8;
      pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }
    return pts;
  }, [particleCount, height, radiusBottom, radiusTop]);

  return (
    <group position={[0, bottomY + height / 2, 0]}>
      {/* Liquid Mesh */}
      <mesh>
        <cylinderGeometry args={[radiusTop, radiusBottom, Math.max(height, 0.01), 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.85}
          roughness={0.1}
          transmission={0.5}
          thickness={0.5}
        />
      </mesh>

      {/* Embedded Particles (Ice / Strawberry pieces) */}
      {particles.map((pos, idx) => (
        <mesh key={idx} position={pos} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          {isIced ? (
            <boxGeometry args={[0.3, 0.3, 0.3]} />
          ) : (
            <sphereGeometry args={[0.15, 8, 8]} />
          )}
          <meshPhysicalMaterial
            color={isIced ? "#ffffff" : "#ef4444"}
            transparent={isIced}
            opacity={isIced ? 0.6 : 1}
            roughness={isIced ? 0.1 : 0.6}
            transmission={isIced ? 0.9 : 0}
            ior={1.33}
          />
        </mesh>
      ))}
    </group>
  );
}

// Full Cup Assembly
function CupAssembly({ cupSizeMl, layers }: { cupSizeMl: number; layers: CupLayer[] }) {
  const totalVolume = useMemo(() => layers.reduce((sum, l) => sum + l.volume, 0), [layers]);

  const cupHeight = 5; // Fixed physical height of the cup in 3D units
  const cupRadiusTop = 1.6;
  const cupRadiusBottom = 1.2;

  // Normalized layers
  const visualizedLayers = useMemo(() => {
    let currentVolume = 0;
    const maxVolume = cupSizeMl || 1;
    
    return layers.map((layer) => {
      const volumePercent = layer.volume / maxVolume;
      const layerHeight = volumePercent * cupHeight;

      const startY = (currentVolume / maxVolume) * cupHeight;
      const endY = startY + layerHeight;

      // Interpolate radius for the tapered cup
      const rB = cupRadiusBottom + (cupRadiusTop - cupRadiusBottom) * (startY / cupHeight);
      const rT = cupRadiusBottom + (cupRadiusTop - cupRadiusBottom) * (endY / cupHeight);

      const part = {
        ...layer,
        height: layerHeight,
        bottomY: startY - cupHeight / 2, // shift to center relative to cup
        radiusBottom: rB * 0.95, // slight inner offset so liquid doesn't z-fight with glass
        radiusTop: rT * 0.95,
      };
      currentVolume += layer.volume;
      return part;
    });
  }, [layers, cupSizeMl, totalVolume]);

  return (
    <group position={[0, 0, 0]}>
      {/* The Glass Cup Background / Shell */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[cupRadiusTop, cupRadiusBottom, cupHeight, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.05}
          transmission={0.95} // Glass-like material
          thickness={0.1}
          ior={1.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Render each liquid layer */}
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
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />

        {/* Environment reflection for realistic glass rendering */}
        <Environment preset="city" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <CupAssembly cupSizeMl={cupSizeMl} layers={layers} />
        </Float>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />

        {/* Allows the user to rotate the cup to see 3D effect */}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}
