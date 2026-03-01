import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

const PARALLAX_STRENGTH = 0.25; // max offset in world units

function RotatingCameraController({ position, target }: { position: [number, number, number]; target: THREE.Vector3 }) {
  const { camera } = useThree();
  const currentPos = useRef(camera.position.clone());
  const targetPos = useRef(new THREE.Vector3(...position));

  // Track normalized mouse position (-1 to 1), smoothed
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    const speed = 3;
    const lerpFactor = 1 - Math.exp(-speed * delta);
    targetPos.current.set(...position);
    currentPos.current.lerp(targetPos.current, lerpFactor);

    // Smooth the mouse input to avoid jitter
    const mouseLerp = 1 - Math.exp(-4 * delta);
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * mouseLerp;
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * mouseLerp;

    // Compute camera right and up vectors for the parallax offset
    const lookDir = new THREE.Vector3().subVectors(target, currentPos.current).normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(lookDir, worldUp).normalize();

    // Apply parallax offset perpendicular to the look direction
    const offsetX = smoothMouse.current.x * PARALLAX_STRENGTH;
    const offsetY = -smoothMouse.current.y * PARALLAX_STRENGTH;

    camera.position.copy(currentPos.current);
    camera.position.addScaledVector(right, offsetX);
    camera.position.y += offsetY;

    camera.lookAt(target.x, target.y, target.z);
  });

  return null;
}

export default RotatingCameraController;
