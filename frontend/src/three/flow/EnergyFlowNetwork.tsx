import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnergyStore } from '../../store/energyStore';

interface FlowLine {
  from: [number, number, number];
  to: [number, number, number];
  color: THREE.Color;
  getPower: () => number;
  id: string;
}

function EnergyParticles({ from, to, color, power }: {
  from: THREE.Vector3; to: THREE.Vector3; color: THREE.Color; power: number;
}) {
  const meshRef = useRef<THREE.Points>(null);
  const COUNT = 12;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      pos[i * 3] = from.x + (to.x - from.x) * t;
      pos[i * 3 + 1] = from.y + (to.y - from.y) * t + 0.5;
      pos[i * 3 + 2] = from.z + (to.z - from.z) * t;
      spd[i] = 0.005 + Math.random() * 0.005;
    }
    return { positions: pos, speeds: spd };
  }, [from, to]);

  const progressRef = useRef(new Float32Array(COUNT).map((_, i) => i / COUNT));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const pos = (meshRef.current.geometry as THREE.BufferGeometry).attributes.position;
    if (!pos) return;
    const flowSpeed = Math.max(0.01, power / 25) * delta * 2;
    for (let i = 0; i < COUNT; i++) {
      progressRef.current[i] = (progressRef.current[i] + flowSpeed) % 1;
      const t = progressRef.current[i];
      pos.setXYZ(
        i,
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t + 0.5,
        from.z + (to.z - from.z) * t,
      );
    }
    pos.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  if (power < 0.1) return null;

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial color={color} size={0.25} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function FlowTube({ from, to, color, power }: { from: [number,number,number]; to: [number,number,number]; color: THREE.Color; power: number }) {
  const curve = useMemo(() => {
    const mid: [number,number,number] = [
      (from[0] + to[0]) / 2,
      Math.max(from[1], to[1]) + 1,
      (from[2] + to[2]) / 2,
    ];
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to),
    );
  }, [from, to]);

  const opacity = Math.min(0.5, power / 30 + 0.1);

  return (
    <>
      <mesh>
        <tubeGeometry args={[curve, 20, 0.06, 6, false]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <EnergyParticles
        from={new THREE.Vector3(...from)}
        to={new THREE.Vector3(...to)}
        color={color} power={power}
      />
    </>
  );
}

export default function EnergyFlowNetwork() {
  const store = useEnergyStore();

  const flows = useMemo((): Array<{
    from: [number,number,number]; to: [number,number,number];
    color: THREE.Color; power: number; id: string;
  }> => [
    {
      id: 'solar-campus', from: [-15, 1, -8], to: [0, 1, -10],
      color: new THREE.Color(0xFFB84D),
      power: Math.max(0, store.solar.currentPower - store.battery.chargeRate),
    },
    {
      id: 'solar-battery', from: [-15, 1, -8], to: [6, 1, 10],
      color: new THREE.Color(0x20D67B),
      power: store.battery.chargingAction === 'CHARGING' ? store.battery.chargeRate : 0,
    },
    {
      id: 'battery-campus', from: [6, 2, 10], to: [0, 1, -5],
      color: new THREE.Color(0x27D7D0),
      power: store.battery.chargingAction === 'DISCHARGING' ? store.battery.dischargeRate : 0,
    },
    {
      id: 'wind-campus', from: [20, 5, -12], to: [5, 1, -10],
      color: new THREE.Color(0x4A9EE0),
      power: store.windPower,
    },
    {
      id: 'grid-campus', from: [0, 1, 25], to: [0, 1, 5],
      color: new THREE.Color(0x6680AA),
      power: store.gridImport,
    },
  ], [
    store.solar.currentPower, store.battery.chargeRate, store.battery.dischargeRate,
    store.battery.chargingAction, store.windPower, store.gridImport,
  ]);

  return (
    <group>
      {flows.map(f => (
        <FlowTube key={f.id} from={f.from} to={f.to} color={f.color} power={f.power} />
      ))}
    </group>
  );
}
