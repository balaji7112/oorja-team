import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, Sky, Cloud, Environment, Plane, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEnergyStore } from '../../store/energyStore';
import { useSceneStore } from '../../store/sceneStore';
import SolarFarm from '../assets/SolarFarm';
import WindTurbine from '../assets/WindTurbine';
import BatteryUnit from '../assets/BatteryUnit';
import Buildings from '../assets/Buildings';
import EnergyFlowNetwork from '../flow/EnergyFlowNetwork';
import CameraController from '../camera/CameraController';
import AtmosphericParticles from './AtmosphericParticles';

interface CampusSceneProps {
  isLanding?: boolean;
  introPhase?: 'intro' | 'complete';
  compact?: boolean;
}

// Ground grid shader
function GroundGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const shader = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vec2 grid = fract(vUv * 20.0);
        float line = step(0.97, grid.x) + step(0.97, grid.y);
        float pulse = 0.5 + 0.5 * sin(uTime * 0.3 - length(vUv - 0.5) * 8.0);
        vec3 color = vec3(0.08, 0.35, 0.22) * line * (0.4 + pulse * 0.1);
        float dist = length(vUv - 0.5);
        float fade = 1.0 - smoothstep(0.3, 0.5, dist);
        gl_FragColor = vec4(color * fade, line * fade * 0.4);
      }
    `,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    side: THREE.DoubleSide,
  }), []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[120, 120, 1, 1]} />
      <shaderMaterial ref={materialRef} {...shader} />
    </mesh>
  );
}

// Simple ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color={new THREE.Color(0x0a1a10)}
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
}

// Roads
function Roads() {
  const roads = useMemo(() => [
    { pos: [0, 0, 0] as [number,number,number], rot: [0,0,0] as [number,number,number], w: 120, h: 4 },
    { pos: [0, 0, 0] as [number,number,number], rot: [0, Math.PI/2, 0] as [number,number,number], w: 120, h: 4 },
    { pos: [-10, 0, 0] as [number,number,number], rot: [0, Math.PI/2, 0] as [number,number,number], w: 60, h: 3 },
  ], []);

  return (
    <group>
      {roads.map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, r.rot[1]]} position={[r.pos[0], 0.01, r.pos[2]]} receiveShadow>
          <planeGeometry args={[r.h, r.w]} />
          <meshStandardMaterial color={new THREE.Color(0x0c1f18)} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// Trees (instanced)
function Trees() {
  const count = 20;
  const trunkMesh = useRef<THREE.InstancedMesh>(null);
  const canopyMesh = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(() => {
    const rng = () => (Math.sin(Date.now() * 0) * 0.5); // deterministic
    return [
      [-25,0,-25], [-22,0,-18], [-28,0,-12], [-24,0,-5], [-26,0,3],
      [-24,0,12], [-22,0,20], [-26,0,28], [25,0,-25], [22,0,-18],
      [28,0,-12], [24,0,-5], [26,0,3], [24,0,12], [22,0,20],
      [26,0,28], [-5,0,28], [5,0,28], [0,0,-28], [12,0,-28],
    ] as [number,number,number][];
  }, []);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], 1.0, pos[2]);
      dummy.scale.setScalar(0.2);
      dummy.updateMatrix();
      trunkMesh.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(pos[0], 2.5, pos[2]);
      dummy.scale.setScalar(1.2);
      dummy.updateMatrix();
      canopyMesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (trunkMesh.current) trunkMesh.current.instanceMatrix.needsUpdate = true;
    if (canopyMesh.current) canopyMesh.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <group>
      <instancedMesh ref={trunkMesh} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[0.15, 0.2, 2, 6]} />
        <meshStandardMaterial color={0x3D2B1F} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={canopyMesh} args={[undefined, undefined, count]}>
        <coneGeometry args={[1.5, 3, 7]} />
        <meshStandardMaterial color={0x1A4A2A} roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

// Lighting rig
function SceneLighting() {
  const { timeOfDay } = useSceneStore();
  const lightRef = useRef<THREE.DirectionalLight>(null);

  const sunConfig = {
    DAWN: { pos: [-30, 10, -30] as [number,number,number], intensity: 0.4, color: 0xFFAA55 },
    MORNING: { pos: [-20, 30, -20] as [number,number,number], intensity: 0.8, color: 0xFFF5E0 },
    NOON: { pos: [0, 50, 0] as [number,number,number], intensity: 1.0, color: 0xFFFFFF },
    AFTERNOON: { pos: [20, 30, 20] as [number,number,number], intensity: 0.8, color: 0xFFEED0 },
    EVENING: { pos: [30, 10, 30] as [number,number,number], intensity: 0.4, color: 0xFF8855 },
    NIGHT: { pos: [0, 20, 0] as [number,number,number], intensity: 0.1, color: 0x4466AA },
  };

  const cfg = sunConfig[timeOfDay];

  return (
    <>
      <ambientLight intensity={timeOfDay === 'NIGHT' ? 0.3 : 0.5} color={0x112211} />
      <directionalLight
        ref={lightRef}
        position={cfg.pos}
        intensity={cfg.intensity}
        color={cfg.color}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={100}
        shadow-camera-near={0.1}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      {/* Energy accent light — subtle green glow from below */}
      <pointLight position={[0, 5, 0]} intensity={0.3} color={0x20D67B} distance={40} />
      {/* Solar warm fill */}
      <pointLight position={[-15, 8, -5]} intensity={0.2} color={0xFFB84D} distance={20} />
      {/* Battery cyan fill */}
      <pointLight position={[5, 4, 10]} intensity={0.15} color={0x27D7D0} distance={15} />
    </>
  );
}

// ============================================================
// MAIN CAMPUS SCENE
// ============================================================
export default function CampusScene({ isLanding = false, introPhase = 'complete', compact = false }: CampusSceneProps) {
  const { weather, energyState } = useEnergyStore();
  const { timeOfDay } = useSceneStore();

  const isNight = timeOfDay === 'NIGHT';
  const cloudCover = weather.cloudCover;

  return (
    <>
      {/* Camera */}
      <CameraController isLanding={isLanding} />

      {/* Lighting */}
      <SceneLighting />

      {/* Sky */}
      {!isNight ? (
        <Sky
          distance={450000}
          sunPosition={timeOfDay === 'NOON' ? [0, 1, 0] : timeOfDay === 'MORNING' ? [-1, 0.3, -1] : [1, 0.3, 1]}
          inclination={timeOfDay === 'NOON' ? 0.49 : 0.45}
          azimuth={0.25}
          rayleigh={cloudCover * 2 + 0.5}
          turbidity={cloudCover * 10 + 2}
        />
      ) : (
        <>
          <color attach="background" args={['#020608']} />
          <Stars radius={100} depth={50} count={3000} factor={3} saturation={0.1} fade />
        </>
      )}

      {/* Fog for atmospheric depth */}
      <fog attach="fog" args={['#0a1a10', 60, 180]} />

      {/* Ground */}
      <Ground />
      <GroundGrid />
      <Roads />
      <Trees />

      {/* ===== ENERGY ASSETS ===== */}
      <SolarFarm position={[-15, 0, -8]} />
      <WindTurbine position={[20, 0, -12]} />
      <BatteryUnit position={[6, 0, 10]} />

      {/* ===== BUILDINGS ===== */}
      <Buildings />

      {/* ===== ENERGY FLOW NETWORK ===== */}
      {!compact && <EnergyFlowNetwork />}

      {/* ===== ATMOSPHERE ===== */}
      <AtmosphericParticles count={compact ? 100 : 300} />

      {/* Environment for reflections */}
      <Environment preset="night" />
    </>
  );
}
