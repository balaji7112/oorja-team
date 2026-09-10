import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEnergyStore } from '../../store/energyStore';
import { useSceneStore } from '../../store/sceneStore';
import { useUIStore } from '../../store/uiStore';

interface SolarFarmProps {
  position: [number, number, number];
}

// Panel glow shader
const panelVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const panelFragmentShader = `
  uniform float uTime;
  uniform float uPower;
  uniform vec3 uColor;
  varying vec2 vUv;
  
  void main() {
    // Cell grid pattern
    vec2 grid = fract(vUv * vec2(8.0, 6.0));
    float cell = step(0.05, grid.x) * step(0.05, grid.y);
    
    // Energy pulse sweeping up
    float pulse = sin(vUv.y * 4.0 - uTime * 2.0) * 0.5 + 0.5;
    pulse *= uPower;
    
    vec3 baseColor = vec3(0.05, 0.05, 0.15);
    vec3 energyColor = uColor * pulse * 0.4;
    vec3 finalColor = mix(baseColor, baseColor + energyColor, cell);
    
    float gridLine = 1.0 - cell;
    finalColor += vec3(0.02, 0.08, 0.06) * gridLine;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function SolarFarm({ position }: SolarFarmProps) {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { solar, energyState } = useEnergyStore();
  const { selectedAsset, setSelectedAsset } = useSceneStore();
  const { setInspectorAsset } = useUIStore();

  const isSelected = selectedAsset === 'SOLAR_FARM';
  const ROWS = 6, COLS = 8;
  const TOTAL = ROWS * COLS;

  // Setup instanced mesh transforms
  useEffect(() => {
    if (!instancedRef.current || !frameRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        dummy.position.set(c * 2.2 - (COLS * 2.2) / 2, 0.05, r * 1.5 - (ROWS * 1.5) / 2);
        dummy.rotation.set(-Math.PI / 8, 0, 0); // slight tilt toward sun
        dummy.updateMatrix();
        instancedRef.current.setMatrixAt(idx, dummy.matrix);
        frameRef.current.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }
    instancedRef.current.instanceMatrix.needsUpdate = true;
    frameRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const shaderUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPower: { value: 0 },
    uColor: { value: new THREE.Color(0x20D67B) },
  }), []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      const powerNorm = Math.min(1, solar.currentPower / 25);
      materialRef.current.uniforms.uPower.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uPower.value, powerNorm, 0.05
      );
    }

    // Gentle float on hover/select
    if (groupRef.current) {
      const targetY = isSelected ? 0.3 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base mounting structure */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[COLS * 2.2, 0.1, ROWS * 1.5]} />
        <meshStandardMaterial color={0x1a2a22} roughness={0.8} />
      </mesh>

      {/* Solar panel cells (instanced) */}
      <instancedMesh ref={instancedRef} args={[undefined, undefined, TOTAL]} castShadow receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          setSelectedAsset('SOLAR_FARM');
          setInspectorAsset('SOLAR_FARM');
        }}
      >
        <planeGeometry args={[1.9, 1.2]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={panelVertexShader}
          fragmentShader={panelFragmentShader}
          uniforms={shaderUniforms}
        />
      </instancedMesh>

      {/* Panel frames (instanced) */}
      <instancedMesh ref={frameRef} args={[undefined, undefined, TOTAL]}>
        <planeGeometry args={[2.0, 1.3]} />
        <meshStandardMaterial
          color={0x334444}
          roughness={0.4}
          metalness={0.6}
        />
      </instancedMesh>

      {/* Support poles */}
      {Array.from({ length: COLS }).map((_, c) => (
        <mesh key={c} position={[c * 2.2 - (COLS * 2.2) / 2, -0.8, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 1.6, 6]} />
          <meshStandardMaterial color={0x445544} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Selection glow ring */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[COLS * 1.2, COLS * 1.2 + 0.3, 48]} />
          <meshBasicMaterial color={0x20D67B} transparent opacity={0.4} />
        </mesh>
      )}

      {/* Status indicator */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial
          color={solar.currentPower > 5 ? 0x20D67B : solar.currentPower > 0 ? 0xFFB84D : 0x444444}
        />
      </mesh>

      {/* Floating label */}
      <Html position={[0, 3.2, 0]} center>
        <div style={{
          background: 'rgba(7, 17, 15, 0.85)',
          border: '1px solid rgba(32, 214, 123, 0.3)',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: '0.7rem',
          color: '#20D67B',
          fontFamily: 'Space Grotesk',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
        }}>
          ☀ Solar Farm · {solar.currentPower} kW
        </div>
      </Html>
    </group>
  );
}
