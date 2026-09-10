import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, CameraPreset } from '../../store/sceneStore';

const PRESETS: Record<CameraPreset, { pos: [number,number,number]; target: [number,number,number] }> = {
  AERIAL:         { pos: [0, 38, 32],    target: [0, 0, 0] },
  SOLAR:          { pos: [-15, 12, 5],   target: [-15, 2, -8] },
  BATTERY:        { pos: [6, 12, 22],    target: [6, 3, 10] },
  BUILDING:       { pos: [0, 14, -2],    target: [0, 2, -16] },
  ENERGY_NETWORK: { pos: [0, 25, 5],     target: [0, 0, 0] },
  WEATHER:        { pos: [20, 20, 20],   target: [0, 5, 0] },
  WIND:           { pos: [20, 20, -5],   target: [20, 8, -12] },
};

interface CameraControllerProps {
  isLanding?: boolean;
}

export default function CameraController({ isLanding = false }: CameraControllerProps) {
  const { camera } = useThree();
  const preset = useSceneStore(s => s.cameraPreset);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetPosRef = useRef(new THREE.Vector3(0, 38, 32));
  const targetLookRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentPosRef = useRef(new THREE.Vector3(0, 38, 32));
  const angleRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const cfg = PRESETS[preset];
    targetPosRef.current.set(...cfg.pos);
    targetLookRef.current.set(...cfg.target);
  }, [preset]);

  useFrame((_, delta) => {
    if (isLanding) {
      // Cinematic slow orbit for landing page
      angleRef.current += delta * 0.04;
      const r = 42;
      const targetX = Math.sin(angleRef.current) * r;
      const targetZ = Math.cos(angleRef.current) * r;
      currentPosRef.current.lerp(
        new THREE.Vector3(targetX + mouseRef.current.x * 2, 36, targetZ),
        0.008
      );
    } else {
      const parallaxX = mouseRef.current.x * 1.5;
      const parallaxY = mouseRef.current.y * -0.8;
      const with_parallax = new THREE.Vector3(
        targetPosRef.current.x + parallaxX,
        targetPosRef.current.y + parallaxY,
        targetPosRef.current.z,
      );
      currentPosRef.current.lerp(with_parallax, 0.04);
    }

    camera.position.copy(currentPosRef.current);
    camera.lookAt(targetLookRef.current);
  });

  return null;
}
