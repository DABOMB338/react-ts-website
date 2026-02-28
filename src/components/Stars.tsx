import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const vertexShader = `
  attribute float size;
  attribute vec3 starColor;
  attribute float twinklePhase;
  attribute float twinkleSpeed;

  uniform float uTime;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vColor = starColor;

    // Twinkle: sine wave with per-star phase and speed
    float twinkle = 0.55 + 0.45 * sin(uTime * twinkleSpeed + twinklePhase);
    vOpacity = twinkle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Size attenuation: shrink with distance
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    // Circular point with soft edge
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft glow falloff
    float alpha = 1.0 - smoothstep(0.15, 0.5, dist);
    gl_FragColor = vec4(vColor, alpha * vOpacity);
  }
`;

// Star color palette: cool whites, warm whites, pale blues, subtle golds
const STAR_COLORS = [
  [1.0, 1.0, 1.0],       // pure white
  [0.95, 0.95, 1.0],     // cool white
  [0.85, 0.9, 1.0],      // pale blue
  [0.7, 0.85, 1.0],      // light blue
  [0.6, 0.8, 1.0],       // sky blue
  [1.0, 0.97, 0.9],      // warm white
  [1.0, 0.92, 0.75],     // pale gold
  [1.0, 0.85, 0.6],      // soft gold
  [0.75, 0.88, 1.0],     // ice blue
];

function Stars({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const uniformsRef = useRef({ uTime: { value: 0 } });

  const { positions, sizes, colors, phases, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const r = Math.random() * 120 + 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Varying sizes: most small, some medium, few large
      const sizeRoll = Math.random();
      if (sizeRoll < 0.6) {
        sizes[i] = 0.3 + Math.random() * 0.4; // small: 0.3-0.7
      } else if (sizeRoll < 0.9) {
        sizes[i] = 0.7 + Math.random() * 0.6; // medium: 0.7-1.3
      } else {
        sizes[i] = 1.3 + Math.random() * 0.7; // large: 1.3-2.0
      }

      // Pick a random color from the palette
      const palette = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      colors[i * 3 + 0] = palette[0];
      colors[i * 3 + 1] = palette[1];
      colors[i * 3 + 2] = palette[2];

      // Twinkle: random phase and speed per star
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.3 + Math.random() * 1.5; // varies from slow shimmer to quick twinkle
    }

    return { positions, sizes, colors, phases, speeds };
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
    uniformsRef.current.uTime.value += delta;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-starColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-twinklePhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-twinkleSpeed" args={[speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default Stars;
