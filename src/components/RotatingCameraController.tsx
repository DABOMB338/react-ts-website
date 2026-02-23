import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

function RotatingCameraController({ position, target }: { position: [number, number, number]; target: THREE.Vector3 }) {
  const { camera } = useThree();
  const currentPos = useRef(camera.position.clone());
  const targetPos = useRef(new THREE.Vector3(...position));
  
  useFrame((_, delta) => {
    // Use a time-based lerp factor for constant speed (e.g., 3 units/sec)
    const speed = 3; // units per second
    const lerpFactor = 1 - Math.exp(-speed * delta);
    targetPos.current.set(...position);
    currentPos.current.lerp(targetPos.current, lerpFactor);
    camera.position.copy(currentPos.current);
    camera.lookAt(target.x, target.y, target.z);
  });
  
  return null;
}

export default RotatingCameraController;
