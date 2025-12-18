import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { SECTION_TITLES } from './App';

type StarSceneProps = {
  activeSection: number;
};

function Stars({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 120 + 20; // radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr[i * 3 + 0] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={ref} rotation={[0, 0, 0]}>
      <bufferGeometry attach="geometry">
        {/* create a BufferAttribute directly using args: [array, itemSize] */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial attach="material" args={[{ color: '#ffffff', size: 0.6, sizeAttenuation: true, transparent: true, opacity: 0.85 }]} />
    </points>
  );
}

function SectionMarker({ position, index}: { position: [number, number, number]; index: number; }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        {/* <sphereGeometry args={[0.6, 16, 16]} /> */}
        <meshStandardMaterial
          args={[{ color: index === 0 ? '#FFD166' : '#4CC9F0', emissive: index === 0 ? '#2A9D8F' : '#1B9CFC', emissiveIntensity: 0.04 }]}
        />
      </mesh>

      {/* small floating ring to make the marker more visible */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <ringGeometry args={[0.9, 1.1, 40]} />
        <meshBasicMaterial args={[{ color: '#ffffff', toneMapped: false, transparent: true, opacity: 0.06 }]} />
      </mesh>
      {/* label mode: either draw a sprite (canvas texture) OR a DOM Html overlay via drei */}
      
    <group scale={[0.5, 0.5, 0.5]}>
        <TextSprite position={[0, 0, 0]} text={SECTION_TITLES[index]}/>
    </group>

    </group>
  );
}

function TextSprite({ position = [0, 0, 0], text = ''}: { position?: [number, number, number]; text?: string; }) {
  const [scaleFactor, setScaleFactor] = React.useState(1);
  const [desiredScreenWidth, setDesiredScreenWidth] = React.useState(window.visualViewport?.width ?? 0); // desired width in screen pixels
  const [ratio, setRatio] = React.useState((window.visualViewport?.height || 1) / (window.visualViewport?.width || 1));
  React.useEffect(() => {
      const ro = new ResizeObserver(() => {
        setScaleFactor(Math.min(1, (window.visualViewport?.width ?? 0) / 900 / 2));
        setDesiredScreenWidth(window.visualViewport?.width ?? 0);
        setRatio((window.visualViewport?.height || 1) / (window.visualViewport?.width || 1));
      });
      ro.observe(document.body);
      return () => ro.disconnect();
    }, []);
  const canvas = useMemo(() => {
    // render text onto a canvas
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size * ratio;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, size, size * ratio);
    // background subtle
    ctx.fillStyle = 'rgba(30,34,44,0.9)';
    ctx.fillRect(0, 0, size, size * ratio);
    ctx.font = `bold ${36 / scaleFactor}px system-ui, Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size * ratio / 6);
    switch(text) {
        case 'About': {
            const lines = [
                "Hey, I'm Luke McMahon. I'm a software developer with a passion for new technologies and creative problem solving.",
                "",
                "Through my projects and through competitive programming, I have worked with a wide variety of tools and languages, and I love learning more every day!",
                "",
                "In addition to programming, I enjoy tennis, Magic the Gathering, learning new things, and both playing and making video games."
            ];
            let lineHeight = 24 * 1.2 / scaleFactor; // adjust based on font size
            let lastHeight = size * ratio / 4;
            lines.forEach((line, i) => {
                lastHeight = wrapText(ctx, line, size / 2, lastHeight, size, lineHeight, false);
            });
            break;
        }
         case 'Skills': {
            const lines = [
                "I have extensive experience with the following:",
                "",
                "Programming Languages",
                "Python, Java, Typescript, JavaScript, C, C++, C#, MSSQL, PromQL",
                "",
                "Technologies",
                "C Sharp/.NET, React, Node.js, SQL, Git, Docker, Kubernetes, Prometheus, Grafana, AWS, CosmosDB, Unity",
                "",
                "Languages",
                "English (native), Spanish (conversational)",
            ];
            const isHeader = [
                false,
                false,
                true,
                false,
                false,
                true,
                false,
                false,
                true,
                false,
            ]
            let lineHeight = 24 * 1.2 / scaleFactor; // adjust based on font size
            let lastHeight = size * ratio / 4;
            lines.forEach((line, i) => {
                lastHeight = wrapText(ctx, line, size / 2, lastHeight, size, lineHeight, isHeader[i]);
            });
            break;
        }
        case 'Projects': {
            const lines = [
                "Here are some of my projects:",
                "",
                "AI Captioning for Epic Video Client",
                "    - Developed AI-powered real-time captioning for the Epic Video Client by extending backend services (C#/.NET), updating Azure Cosmos DB data models and integrating WebRTC vendor APIs and speech-to-text services to meet U.S. accessibility compliance requirements. ",
                "    - Designed and implemented React-based UI components for real-time caption rendering, ensuring accessible, low-latency display across clinical and patient-facing workflows.",
                "    - Built Prometheus alerts and Grafana dashboards to monitor captioning reliability, enabling quick response to outages and higher system availability.",
                "    - Implemented caption usage metrics reporting, improving insight into feature adoption and load patterns across health systems.",
                "",
                "Captioning in Teleregistration",
                "    - Worked closely with the teleregistration team to create a way of displaying captions in the teleregistration view using the Epic Video Client iframe's captioning functionality.",
                "",
                "Whiteboarding and Annotations in Epic Video Client",
                "    - Added whiteboarding and annotation features to the Epic Video Client, allowing users to draw and annotate directly on shared video streams as well as a shared whiteboard during calls.",
                "    - Allowed for various annotation tools including freehand drawing, emojis, text, and erasing.",
                "    - Implemented real-time synchronization of annotations across all participants using WebRTC data channels.",
                "",
                "Personal Website",
                "    - Built a responsive website using React and Three.js to showcase my projects and skills with an interactive 3D experience."
            ];
            const isHeader = [
                false,
                false,
                true,
                false,
                false,
                false,
                false,
                false,
                true,
                false,
                false,
                true,
                false,
                false,
                false,
                false,
                true,
                false,
            ]
            let lineHeight = 13 * 1.2 / scaleFactor; // adjust based on font size
            let lastHeight = size * ratio / 4;
            lines.forEach((line, i) => {
                lastHeight = wrapText(ctx, line, size / 2, lastHeight, size, lineHeight, isHeader[i], (window.visualViewport?.width ?? 0) < 900);
            });
            break;
        }
        case 'Contact': {
            const lines = [
                "Want to know more?",
                "Let's talk!",
                "",
                "Email: mcmaholc@rose-hulman.edu"
            ];
            let lineHeight = 24 * 1.2 / scaleFactor; // adjust based on font size
            let lastHeight = size * ratio / 4;
            lines.forEach((line, i) => {
                lastHeight = wrapText(ctx, line, size / 2, lastHeight, size, lineHeight, false);
            });
            break;
        }
    }
    return canvas;
  }, [text, scaleFactor, ratio]);

  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);

  // cleanup texture when unmounted
  React.useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  // Compute world size so the sprite occupies a consistent screen size (pixels) regardless of viewport / browser.
  // Formula (perspective camera): worldWidth = 2 * distance * tan(fov/2) * (screenWidthPx / viewportHeightPx)
  const { camera, size: viewport } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null!);

  useFrame((_, delta) => {
    if (!spriteRef.current) return;
    // distance from camera to sprite (center)
    const spriteWorldPos = new THREE.Vector3(...position);
    const camPos = camera.position;
    const distance = spriteWorldPos.distanceTo(camPos);
    // console.log(distance);

    // ensure camera is PerspectiveCamera
    // fov is in degrees
    const fov = ('fov' in camera && typeof (camera as any).fov === 'number') ? (camera as any).fov : 50;
    const viewportHeight = viewport.height || 800;

    const worldHeightAtDistance = 2 * distance * Math.tan((fov * Math.PI) / 180 / 2);
    // console.log(desiredScreenWidth)
    const targetWorldWidth = worldHeightAtDistance * (desiredScreenWidth / viewportHeight);
    // aspect ratio of canvas texture
    const canvasAspect = canvas.width / canvas.height;
    const targetWorldHeight = targetWorldWidth / canvasAspect;
    // console.log(targetWorldHeight, targetWorldWidth);

    // smooth scaling so it doesn't pop
    spriteRef.current.scale.lerp(new THREE.Vector3(targetWorldWidth, targetWorldWidth * ratio, 1), 0.25);
  });

  return (
    <sprite ref={spriteRef} position={position} scale={[0.1, 0.1, 1]}>
      <spriteMaterial attach="material" args={[{ map: texture, toneMapped: false, transparent: true, depthWrite: false }]} />
    </sprite>
  );
}

function CameraController({ target }: { target: THREE.Vector3 }) {
  const { camera } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    // smooth position
    tmp.current.lerp(target, 0.06);
    camera.position.copy(tmp.current);
    // always look toward center-ish (or change to target for more specific look)
    camera.lookAt(0, 0, Math.max(-1, target.z - 6));
  });

  return null;
}

export default function StarScene({ activeSection}: StarSceneProps) {
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

  // CameraController now rotates camera to the correct position and looks at center
  function RotatingCameraController({ position, target }: { position: [number, number, number]; target: THREE.Vector3 }) {
    const { camera } = useThree();
    // Start from camera's current position for smooth motion
    const currentPos = useRef(camera.position.clone());
    // Store the target position as a stable vector
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

  return (
    <Canvas camera={{ position: cameraPosition, fov: 60 }} style={{ width: '100%', height: '100%', background: 'black' }}>
      <ambientLight args={[0xffffff, 0.6]} />
      <directionalLight args={[0xffffff, 0.6]} position={[5, 5, 5]} />

      <Stars count={1800} />

      {/* Render section markers in a circle */}
      {sectionPositions.map((pos, i) => (
        <SectionMarker key={i} position={pos} index={i}/>
      ))}

      <RotatingCameraController position={cameraPosition} target={cameraTarget} />
    </Canvas>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  isHeader: boolean,
  moreRoom: boolean = true,
): number {
  const words: string[] = text.split(" ");
  let line: string = "";
  const lines: string[] = [];
  if(isHeader) {
    ctx.font = `bold ${lineHeight / 1.2 / (!moreRoom ? 0.75 : 1)}px system-ui, Arial`;   
    ctx.textAlign = 'center';
  } else {
    ctx.font = `${lineHeight / 1.6 / (!moreRoom ? 0.75 : 1)}px system-ui, Arial`;   
    ctx.textAlign = 'left';
    x = (moreRoom ? 0.15 : 0.25) * maxWidth; // left align with some padding
  }

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth * (moreRoom ? 0.7 : 0.5) && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Draw the lines
  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight);
  });
  return lines.length * lineHeight / (!moreRoom ? 0.75 : 1) + y;
}
