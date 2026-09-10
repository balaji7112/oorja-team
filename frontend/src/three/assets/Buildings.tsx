import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEnergyStore } from '../../store/energyStore';
import { useSceneStore } from '../../store/sceneStore';
import { useUIStore } from '../../store/uiStore';

const BUILDING_CONFIGS = [
  { id: 'ACADEMIC', name: 'Academic Block', pos: [-6, 0, -16] as [number,number,number], size: [8, 5, 6] as [number,number,number], color: 0x1a2e22 },
  { id: 'COMPUTER_LAB', name: 'Computer Lab', pos: [4, 0, -16] as [number,number,number], size: [7, 4, 5] as [number,number,number], color: 0x172a20 },
  { id: 'LIBRARY', name: 'Library', pos: [13, 0, -16] as [number,number,number], size: [6, 6, 5] as [number,number,number], color: 0x1c3025 },
  { id: 'HOSTEL', name: 'Hostel Block', pos: [-16, 0, 4] as [number,number,number], size: [6, 8, 8] as [number,number,number], color: 0x152618 },
  { id: 'CANTEEN', name: 'Canteen', pos: [-9, 0, 12] as [number,number,number], size: [5, 3, 5] as [number,number,number], color: 0x1a2a1a },
  { id: 'EV_CHARGING', name: 'EV Charging', pos: [14, 0, 12] as [number,number,number], size: [5, 2.5, 4] as [number,number,number], color: 0x132215 },
];

interface BuildingData {
  id: string; name: string; currentLoad: number; peakLoad: number;
  renewableShare: number; anomalyScore: number; status: 'NORMAL' | 'HIGH_LOAD' | 'PEAK' | 'ANOMALY' | 'OFFLINE';
  flexibleLoad: number; healthScore: number; type: string;
}

interface BuildingMeshProps {
  config: typeof BUILDING_CONFIGS[0];
  building: BuildingData;
}

function BuildingMesh({ config, building }: BuildingMeshProps) {
  const { setSelectedAsset } = useSceneStore();
  const { setInspectorAsset } = useUIStore();
  const isSelected = useSceneStore(s => s.selectedAsset === config.id);

  const loadNorm = Math.min(1, building.currentLoad / (building.peakLoad || 8));
  const windowColor = new THREE.Color(0xFFFFAA).lerp(new THREE.Color(0x8888FF), 0.3);
  const windowIntensity = loadNorm * 0.8 + 0.1;
  const anomaly = building.status === 'ANOMALY';

  const [w, h, d] = config.size;

  return (
    <group position={config.pos}
      onClick={(e) => { e.stopPropagation(); setSelectedAsset(config.id); setInspectorAsset(config.id); }}
    >
      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={new THREE.Color(config.color)} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, h + 0.15, 0]}>
        <boxGeometry args={[w + 0.2, 0.3, d + 0.2]} />
        <meshStandardMaterial color={0x223322} roughness={0.9} />
      </mesh>
      {/* Windows (emissive based on load) */}
      {Array.from({ length: Math.floor(h / 1.5) }).map((_, row) =>
        Array.from({ length: Math.floor(w / 1.8) }).map((_, col) => (
          <mesh key={`${row}-${col}`} position={[
            col * 1.8 - (w / 2) + 0.9,
            row * 1.5 + 1.2,
            d / 2 + 0.01
          ]}>
            <planeGeometry args={[0.7, 0.8]} />
            <meshStandardMaterial
              color={windowColor}
              emissive={windowColor}
              emissiveIntensity={windowIntensity * (Math.random() > 0.3 ? 1 : 0.2)}
              transparent opacity={0.9}
            />
          </mesh>
        ))
      )}
      {/* Anomaly diagnostic ring */}
      {anomaly && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.6, Math.max(w, d) * 0.6 + 0.3, 32]} />
          <meshBasicMaterial color={0xFF5A5A} transparent opacity={0.5} />
        </mesh>
      )}
      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.7, Math.max(w, d) * 0.7 + 0.2, 32]} />
          <meshBasicMaterial color={0x27D7D0} transparent opacity={0.5} />
        </mesh>
      )}
      {/* Rooftop solar */}
      {config.id !== 'EV_CHARGING' && (
        <mesh position={[0, h + 0.4, 0]} rotation={[-Math.PI / 16, 0, 0]}>
          <planeGeometry args={[w * 0.6, d * 0.5]} />
          <meshStandardMaterial color={0x0a0a1a} metalness={0.3} roughness={0.5} />
        </mesh>
      )}
      {/* EV charger posts */}
      {config.id === 'EV_CHARGING' && [[-1.2, 0, 1.5], [1.2, 0, 1.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 1, z]} castShadow>
          <boxGeometry args={[0.3, 2, 0.3]} />
          <meshStandardMaterial color={0x27D7D0} emissive={0x27D7D0} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <Html position={[0, h + 1.5, 0]} center>
        <div style={{
          background: 'rgba(7,17,15,0.85)', border: `1px solid ${anomaly ? 'rgba(255,90,90,0.4)' : 'rgba(32,214,123,0.2)'}`,
          borderRadius: 6, padding: '4px 8px', fontSize: '0.62rem',
          color: anomaly ? '#FF5A5A' : '#91AAA2',
          whiteSpace: 'nowrap', backdropFilter: 'blur(8px)', pointerEvents: 'none',
        }}>
          {config.name} · {building.currentLoad.toFixed(1)} kW
        </div>
      </Html>
    </group>
  );
}

export default function Buildings() {
  const { buildings } = useEnergyStore();

  return (
    <group>
      {BUILDING_CONFIGS.map(cfg => {
        const building = buildings.find(b => b.id === cfg.id) || {
          id: cfg.id, name: cfg.name, currentLoad: 2, peakLoad: 8,
          renewableShare: 80, anomalyScore: 0, status: 'NORMAL' as const,
          flexibleLoad: 0, healthScore: 90, type: '',
        };
        return <BuildingMesh key={cfg.id} config={cfg} building={building} />;
      })}
    </group>
  );
}
