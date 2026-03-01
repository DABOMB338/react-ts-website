import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import TextSprite from './TextSprite';
import { SECTION_TITLES } from './App';

function SectionMarker({ position, index, activeSection, headerHeight, rotateLeft, rotateRight, onScrollableChange, onContentEndY }: { position: [number, number, number]; index: number; activeSection: number; headerHeight: number; rotateLeft: () => void; rotateRight: () => void; onScrollableChange: (sectionIndex: number, scrollable: boolean) => void; onContentEndY?: (sectionIndex: number, yFraction: number) => void; }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <meshStandardMaterial
          args={[{ color: index === 0 ? '#FFD166' : '#4CC9F0', emissive: index === 0 ? '#2A9D8F' : '#1B9CFC', emissiveIntensity: 0.04 }]}
        />
      </mesh>

      {/* small floating ring to make the marker more visible */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <ringGeometry args={[0.9, 1.1, 40]} />
        <meshBasicMaterial args={[{ color: '#ffffff', toneMapped: false, transparent: true, opacity: 0.06 }]} />
      </mesh>

      <group scale={[0.5, 0.5, 0.5]}>
        <TextSprite position={[0, 0, 0]} text={SECTION_TITLES[index]} sectionIndex={index} isActive={activeSection === index} headerHeight={headerHeight} onSwipeLeft={rotateLeft} onSwipeRight={rotateRight} onScrollableChange={onScrollableChange} onContentEndY={onContentEndY}/>
      </group>
    </group>
  );
}

export default SectionMarker;
