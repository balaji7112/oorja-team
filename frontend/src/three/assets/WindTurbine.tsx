import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEnergyStore } from '../../store/energyStore';
import { useSceneStore } from '../../store/sceneStore';
import { useUIStore } from '../../store/uiStore';

interface WindTurbineProps { position: [number, number, number]; }

export default function WindTurbine({ position }: WindTurbineProps) {
  const bladesRef = useRef<THREE.Group>(null);
  const { weather, windPower } = useEnergyStore();
  const { selectedAsset, setSelectedAsset } = useSceneStore();
  const { setInspectorAsset } = useUIStore();
  const isSelected = selectedAsset === 'WIND_TURBINE';
  const angularVelRef = useRef(0);

  useFrame((_, delta) => {
    const targetVel = (weather.windSpeed / 10) * 3;
    angularVelRef.current = THREE.MathUtils.lerp(angularVelRef.current, targetVel, 0.02);
    if (bladesRef.current) {
      bladesRef.current.rotation.z -= angularVelRef.current * delta;
    }
  });

  return (
    <group position={position}
      onClick={(e) => { e.stopPropagation(); setSelectedAsset('WIND_TURBINE'); setInspectorAsset('WIND_TURBINE'); }}
    >
      {/* Tower */}
      <mesh castShadow position={[0, 8, 0]}>
        <cylinderGeometry args={[0.25, 0.45, 16, 8]} />
        <meshStandardMaterial color={0xd0d8d0} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Nacelle */}
      <mesh castShadow position={[0, 16.2, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.8]} />
        <meshStandardMaterial color={0xccddcc} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Hub */}
      <mesh castShadow position={[0, 16.2, 0.5]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color={0xaabbaa} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Blades */}
      <group ref={bladesRef} position={[0, 16.2, 0.55]}>
        {[0, 120, 240].map((angle) => (
          <mesh key={angle} castShadow rotation={[0, 0, (angle * Math.PI) / 180]}>
            <boxGeometry args={[0.2, 6, 0.08]} />
            <meshStandardMaterial color={0xeef5ee} metalness={0.1} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.3, 32]} />
          <meshBasicMaterial color={0x27D7D0} transparent opacity={0.4} />
        </mesh>
      )}
      <Html position={[0, 19, 0]} center>
        <div style={{
          background: 'rgba(7,17,15,0.85)', border: '1px solid rgba(39,215,208,0.3)',
          borderRadius: 8, padding: '5px 10px', fontSize: '0.68rem', color: '#27D7D0',
          fontFamily: 'Space Grotesk', fontWeight: 600, whiteSpace: 'nowrap',
          backdropFilter: 'blur(8px)', pointerEvents: 'none',
        }}>
          💨 Wind · {windPower.toFixed(1)} kW
        </div>
      </Html>
    </group>
  );
}
