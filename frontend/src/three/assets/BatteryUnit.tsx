import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEnergyStore } from '../../store/energyStore';
import { useSceneStore } from '../../store/sceneStore';
import { useUIStore } from '../../store/uiStore';

interface BatteryUnitProps { position: [number, number, number]; }

export default function BatteryUnit({ position }: BatteryUnitProps) {
  const fillRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const { battery } = useEnergyStore();
  const { selectedAsset, setSelectedAsset } = useSceneStore();
  const { setInspectorAsset } = useUIStore();
  const isSelected = selectedAsset === 'BATTERY';

  const socNorm = battery.soc / 100;
  const isCharging = battery.chargingAction === 'CHARGING';
  const isDischarging = battery.chargingAction === 'DISCHARGING';
  const isHot = battery.temperature > 38;

  const fillColor = isHot ? new THREE.Color(0xFF5A5A) : socNorm > 0.5 ? new THREE.Color(0x20D67B) : new THREE.Color(0xFFB84D);
  const glowColor = isHot ? 0xFF5A5A : 0x20D67B;

  useFrame(({ clock }) => {
    if (fillRef.current) {
      const targetH = socNorm * 4.5;
      const currentH = (fillRef.current.scale as THREE.Vector3).y;
      (fillRef.current.scale as THREE.Vector3).y = THREE.MathUtils.lerp(currentH, targetH / 4.5, 0.02);
      fillRef.current.position.y = ((fillRef.current.scale as THREE.Vector3).y * 4.5) / 2 - 0.05;
    }
    if (glowRef.current) {
      const pulse = isCharging ? 0.5 + 0.3 * Math.sin(clock.elapsedTime * 3) : 0.3;
      glowRef.current.intensity = pulse;
    }
  });

  return (
    <group position={position}
      onClick={(e) => { e.stopPropagation(); setSelectedAsset('BATTERY'); setInspectorAsset('BATTERY'); }}
    >
      {/* Cabinet shell */}
      <mesh castShadow>
        <boxGeometry args={[3, 5, 1.5]} />
        <meshStandardMaterial color={0x1a2a22} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Front panel */}
      <mesh position={[0, 0, 0.76]}>
        <boxGeometry args={[2.8, 4.8, 0.05]} />
        <meshStandardMaterial color={0x0d1f18} metalness={0.4} roughness={0.6} />
      </mesh>
      {/* SOC fill bar */}
      <mesh ref={fillRef} position={[0, -2.2, 0.78]}>
        <boxGeometry args={[0.6, 4.5, 0.06]} />
        <meshStandardMaterial color={fillColor} emissive={fillColor} emissiveIntensity={0.4} transparent opacity={0.9} />
      </mesh>
      {/* Fill container border */}
      <mesh position={[0, 0, 0.78]}>
        <boxGeometry args={[0.65, 4.55, 0.04]} />
        <meshStandardMaterial color={0x335544} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Status LEDs row */}
      {[-1, -0.5, 0, 0.5, 1].map((x, i) => (
        <mesh key={i} position={[x, -2.6, 0.79]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color={i < Math.floor(socNorm * 5) ? 0x20D67B : 0x224422} />
        </mesh>
      ))}
      {/* Action indicator light */}
      <mesh position={[0.8, 2, 0.79]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={isCharging ? 0x20D67B : isDischarging ? 0xFFB84D : 0x444444} />
      </mesh>
      {/* Point light */}
      <pointLight ref={glowRef} position={[0, 0, 2]} color={glowColor} intensity={0.3} distance={12} />
      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 2.5, 32]} />
          <meshBasicMaterial color={0x27D7D0} transparent opacity={0.4} />
        </mesh>
      )}
      <Html position={[0, 3.5, 0]} center>
        <div style={{
          background: 'rgba(7,17,15,0.85)', border: `1px solid ${isHot ? 'rgba(255,90,90,0.4)' : 'rgba(32,214,123,0.3)'}`,
          borderRadius: 8, padding: '5px 10px', fontSize: '0.68rem',
          color: isHot ? '#FF5A5A' : '#20D67B',
          fontFamily: 'Space Grotesk', fontWeight: 600, whiteSpace: 'nowrap',
          backdropFilter: 'blur(8px)', pointerEvents: 'none',
        }}>
          🔋 Battery · {battery.soc.toFixed(1)}% · {battery.chargingAction}
        </div>
      </Html>
    </group>
  );
}
