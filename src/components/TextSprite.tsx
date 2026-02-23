import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { wrapText } from './textUtils';

function TextSprite({ position = [0, 0, 0], text = '', isActive = false }: { position?: [number, number, number]; text?: string; isActive?: boolean; }) {
  const [scaleFactor, setScaleFactor] = React.useState(1);
  const [desiredScreenWidth, setDesiredScreenWidth] = React.useState(window.visualViewport?.width ?? 0); // desired width in screen pixels
  const [ratio, setRatio] = React.useState((window.visualViewport?.height || 1) / (window.visualViewport?.width || 1));
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const [totalContentHeight, setTotalContentHeight] = React.useState(0);
  const spriteRef = React.useRef<THREE.Sprite>(null!);
  React.useEffect(() => {
      const ro = new ResizeObserver(() => {
        setScaleFactor(Math.min(1, ((window.visualViewport?.width ?? 0) * (window.visualViewport?.height ?? 0)) / 800000));
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
    
    let contentHeight = 0;
    
    switch(text) {
        case 'About': {
            const lines = [
                "Hey, I'm Luke McMahon. I'm a software developer with a passion for new technologies and creative problem solving.",
                "",
                "Through my projects and through competitive programming, I have worked with a wide variety of tools and languages, and I love learning more every day!",
                "",
                "In addition to programming, I enjoy tennis, Magic the Gathering, learning new things, and both playing and making video games."
            ];
            let lineHeight = 40 * 1.2 / scaleFactor; // adjust based on font size
            let lastHeight = size * ratio / 4 - scrollOffset;
            lines.forEach((line, i) => {
                lastHeight = wrapText(ctx, line, size / 2, lastHeight, size, lineHeight, false);
            });
            contentHeight = lastHeight + scrollOffset;
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
            let lineHeight = 32 * 1.2 / scaleFactor; // adjust based on font size
            let lastHeight = size * ratio / 4 - scrollOffset;
            lines.forEach((line, i) => {
                lastHeight = wrapText(ctx, line, size / 2, lastHeight, size, lineHeight, isHeader[i]);
            });
            contentHeight = lastHeight + scrollOffset;
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
            let lineHeight = 16 * 1.2 / scaleFactor; // adjust based on font size
            let lastHeight = size * ratio / 4 - scrollOffset;  
            lines.forEach((line, i) => {
                lastHeight = wrapText(ctx, line, size / 2, lastHeight, size, lineHeight, isHeader[i], ((window.visualViewport?.width ?? 0) * (window.visualViewport?.height ?? 0)) < 400000);
            });
            contentHeight = lastHeight + scrollOffset;
            break;
        }
        case 'Contact': {
            const lines = [
                "Want to know more?",
                "Let's talk!",
                "",
                "Email: mcmaholc@rose-hulman.edu"
            ];
            let lineHeight = 48 * 1.2 / scaleFactor; // adjust based on font size
            let lastHeight = size * ratio / 4 - scrollOffset;
            lines.forEach((line, i) => {
                lastHeight = wrapText(ctx, line, size / 2, lastHeight, size, lineHeight, false);
            });
            contentHeight = lastHeight + scrollOffset;
            break;
        }
    }
    
    setTotalContentHeight(contentHeight);
    return canvas;
  }, [text, scaleFactor, ratio, scrollOffset]);

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

  useFrame((_, delta) => {
    if (!spriteRef.current) return;
    // distance from camera to sprite (center)
    const spriteWorldPos = new THREE.Vector3(...position);
    const camPos = camera.position;
    const distance = spriteWorldPos.distanceTo(camPos);

    // ensure camera is PerspectiveCamera
    // fov is in degrees
    const fov = ('fov' in camera && typeof (camera as any).fov === 'number') ? (camera as any).fov : 50;
    const viewportHeight = viewport.height || 800;

    const worldHeightAtDistance = 2 * distance * Math.tan((fov * Math.PI) / 180 / 2);
    const targetWorldWidth = worldHeightAtDistance * (desiredScreenWidth / viewportHeight);
    // aspect ratio of canvas texture
    const canvasAspect = canvas.width / canvas.height;
    const targetWorldHeight = targetWorldWidth / canvasAspect;

    // smooth scaling so it doesn't pop
    spriteRef.current.scale.lerp(new THREE.Vector3(targetWorldWidth, targetWorldWidth * ratio, 1), 0.25);
  });

  // Handle mouse wheel scrolling - only for active sprite when there's overflow
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only scroll if this sprite is active and there's overflow
      if (isActive && totalContentHeight > (2048 * ratio) / 4) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 2; // sensitivity multiplier
        setScrollOffset(prev => {
          const maxScroll = Math.max(0, totalContentHeight - (2048 * ratio) / 4);
          return Math.max(0, Math.min(prev + scrollDelta, maxScroll));
        });
      }
    };
    
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [isActive, totalContentHeight, ratio]);

  return (
    <group>
      <sprite 
        ref={spriteRef} 
        position={position} 
        scale={[0.1, 0.1, 1]}
      >
        <spriteMaterial attach="material" args={[{ map: texture, toneMapped: false, transparent: true, depthWrite: false }]} />
      </sprite>
      
      {/* Scrollbar indicator - only show if content overflows */}
      {totalContentHeight > (2048 * ratio) / 4 && (
        <group position={[position[0] + 1.2, position[1], position[2]]}>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.08, 1.8, 0.01]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
          </mesh>
          
          {/* Scrollbar thumb */}
          <mesh position={[0, -0.2 + (scrollOffset / totalContentHeight) * 1.6, 0.01]}>
            <boxGeometry args={[0.1, Math.max(0.2, (1.8 * (2048 * ratio) / 4) / totalContentHeight), 0.01]} />
            <meshBasicMaterial color="#4CC9F0" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default TextSprite;
