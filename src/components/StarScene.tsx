import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import Stars from './Stars';
import SectionMarker from './SectionMarker';
import RotatingCameraController from './RotatingCameraController';

type StarSceneProps = {
  activeSection: number;
  headerHeight: number;
};

export default function StarScene({ activeSection, headerHeight }: StarSceneProps) {
  // Arrange 4 sections in a circle, 90° apart, facing outward
  const radius = 8;
  const sectionAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const sectionPositions: [number, number, number][] = sectionAngles.map(angle => [
    Math.cos(-angle) * radius,
    0,
    Math.sin(-angle) * radius,
  ]);

  // Camera rotates around the center to face the selected section
  const cameraDistance = 16;
  const cameraAngle = sectionAngles[activeSection % 4];
  const cameraTarget = new THREE.Vector3(0, 0, 0);
  const cameraPosition: [number, number, number] = [
    Math.cos(-cameraAngle) * cameraDistance,
    0,
    Math.sin(-cameraAngle) * cameraDistance,
  ];

  return (
    <Canvas camera={{ position: cameraPosition, fov: 60 }} style={{ width: '100%', height: '100%', background: 'black' }}>
      <ambientLight args={[0xffffff, 0.6]} />
      <directionalLight args={[0xffffff, 0.6]} position={[5, 5, 5]} />

      <Stars count={1800} />

      {/* Render section markers in a circle */}
      {sectionPositions.map((pos, i) => (
        <SectionMarker key={i} position={pos} index={i} activeSection={activeSection} headerHeight={headerHeight}/>
      ))}

      <RotatingCameraController position={cameraPosition} target={cameraTarget} />
    </Canvas>
  );
}
