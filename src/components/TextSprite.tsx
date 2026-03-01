import React, { useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { wrapText } from './textUtils';

function TextSprite({ position = [0, 0, 0], text = '', sectionIndex = 0, isActive = false, headerHeight = 0, onSwipeLeft, onSwipeRight, onScrollableChange, onContentEndY }: {
  position?: [number, number, number];
  text?: string;
  sectionIndex?: number;
  isActive?: boolean;
  headerHeight?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onScrollableChange?: (sectionIndex: number, scrollable: boolean) => void;
  onContentEndY?: (sectionIndex: number, yFraction: number) => void;
}) {
  const [canvasDims, setCanvasDims] = React.useState(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    const maxW = Math.floor(vw);
    const width = Math.min(vw, maxW) * dpr;
    const height = vh * dpr;
    return { width, height, dpr };
  });
  const [totalContentHeight, setTotalContentHeight] = React.useState(0);
  const spriteRef = React.useRef<THREE.Sprite>(null!);
  const scrollOffsetRef = React.useRef(0);
  const targetScrollRef = React.useRef(0);
  const contentEndYRef = React.useRef(0);
  const lastDrawnScrollRef = React.useRef(-1);

  // Persistent canvas and texture — created once, reused for all redraws
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const textureRef = React.useRef<THREE.CanvasTexture | null>(null);
  const textureDimsRef = React.useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  React.useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      const maxW = Math.floor(vw);
      const width = Math.min(vw, maxW) * dpr;
      const height = vh * dpr;
      setCanvasDims({ width, height, dpr });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure actual wrapped text height using canvas context
  const canvasMeasurements = useMemo(() => {
    const { width, height, dpr } = canvasDims;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    let lines: string[] = [];
    let isHeader: boolean[] = [];
    let lineHeight = 44;
    let extraSpacing = 12;
    switch(text) {
      case 'About': {
        lines = [
          "Hey, I'm Luke McMahon. I'm a software developer with a passion for new technologies and creative problem solving.",
          "",
          "Through my projects, both personal and professional, and through competitive programming, I have worked with a wide variety of tools and languages, and I love learning more every day!",
          "",
          "In addition to programming, I enjoy learning new things, tennis, Magic the Gathering, and both playing and making video games."
        ];
        lineHeight = Math.round(0.023 * height / dpr) + extraSpacing;
        break;
      }
      case 'Skills': {
        lines = [
          "I have extensive experience with the following:",
          "",
          "Programming Languages",
          "C#, TypeScript, Python, Java, JavaScript, C, C++, MSSQL, MUMPS, PromQL",
          "",
          "Technologies",
          "React, Node.js, .NET, RESTful APIs, Jest, Docker, Kubernetes, Prometheus, Grafana, AWS, Cosmos DB, Flask, Claude Code, Unity",
          "",
          "Languages",
          "English (native), Spanish (conversational), Japanese (learning!)",
        ];
        isHeader = [false, false, true, false, false, true, false, false, true, false];
        lineHeight = Math.round(0.018 * height / dpr) + extraSpacing;
        break;
      }
      case 'Projects': {
        lines = [
          "Here are some of my projects:",
          "",
          "AI Captioning for Epic Video Client",
          "    - Developed AI-powered real-time captioning for the Epic Video Client by extending backend services (C#/.NET), updating Azure Cosmos DB data models and integrating WebRTC vendor APIs and speech-to-text services to meet U.S. accessibility compliance requirements.  ",
          "    - Designed and implemented React-based UI components for real-time caption rendering, ensuring accessible, low-latency display across clinical and patient-facing workflows.",
          "    - Built Prometheus alerts and Grafana dashboards to monitor captioning reliability, enabling quick response to outages and higher system availability.",
          "    - Implemented caption usage metrics reporting, improving insight into feature adoption and load patterns across health systems.",
          "",
          "Captioning in Teleregistration",
          "    - Worked closely with the teleregistration team to create a way of displaying captions in the teleregistration view on a Welcome kiosk.",
          "    - Designed and implemented a framework to send messages to and from the Welcome kiosk to ensure caption state is consistent between Epic Video Client iframe and the kiosk",
          "",
          "AI Hardware Testing",
          "    - Worked on a project using LLMs, YOLO, and other models to find issues with video and audio feeds in Epic Video Client's hardware test",
          "",
          "Whiteboarding and Annotations in Epic Video Client",
          "    - Added whiteboarding and annotation features to the Epic Video Client, allowing users to draw and annotate directly on shared video streams as well as a shared whiteboard during calls.",
          "    - Allowed for various annotation tools including freehand drawing, emojis, text, and erasing.",
          "    - Implemented real-time synchronization of annotations across all participants using WebRTC data channels.",
          "",
          "LinkedIn Salary Predictor",
          "    - Scraped, cleaned, and manipulated LinkedIn job posting data using Python to create a dataset of feature-rich job data that could be useful for determining salaries.",
          "    - Built a machine learning model using Python and keras to predict salaries based on LinkedIn job posting data, achieving an R² score of 0.75.",
          "",
          "Personal Website",
          "    - Built a responsive website using React and Three.js to showcase my projects and skills with an interactive 3D experience."
        ];
        isHeader = [false,false,true,false,false,false,false,false,true,false,false,false,true,false,false,true,false,false,false,false,true,false,false,false,true,false];
        lineHeight = Math.round(0.011 * height / dpr) + extraSpacing;
        break;
      }
      case 'Contact': {
        lines = [
          "Want to know more?",
          "Let's talk!",
        ];
        lineHeight = Math.round(0.025 * height / dpr) + extraSpacing;
        break;
      }
    }
    // Use wrapText to measure height
    let yStart = Math.round(0.05 * height / dpr) + 32;
    let yCursor = yStart;
    lines.forEach((line, i) => {
      let header = isHeader[i] || false;
      let font = header ? `bold ${Math.round(0.028 * height / dpr)}px system-ui, Arial` : `${Math.round(0.023 * height / dpr)}px system-ui, Arial`;
      ctx.font = font;
      let maxWidth = (width / dpr) * 0.85;
      yCursor = wrapText(ctx, line, (width / dpr) / 2, yCursor, maxWidth, lineHeight, header, width / dpr > 1000);
    });
    return { totalContentHeight: yCursor - yStart, yStart, width, height, lineHeight, lines, isHeader, extraSpacing };
  }, [text, canvasDims]);

  // Draw function — redraws onto the persistent canvas at a given scroll offset
  const drawCanvas = useCallback((scrollPos: number) => {
    const { width, height, dpr } = canvasDims;

    // Ensure persistent canvas exists and is the right size
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const cvs = canvasRef.current;
    if (cvs.width !== width || cvs.height !== height) {
      cvs.width = width;
      cvs.height = height;
    }

    const ctx = cvs.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width / dpr, height / dpr);
    gradient.addColorStop(0, '#232946AA');
    gradient.addColorStop(1, '#4CC9F0AA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width / dpr, height / dpr);
    ctx.textBaseline = 'top';

    // Title
    let y = canvasMeasurements.yStart - scrollPos;
    ctx.font = `bold ${Math.round(0.056 * height / dpr)}px system-ui, Arial`;
    ctx.fillStyle = '#F7F7FF';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#4CC9F0';
    ctx.shadowBlur = 12;
    ctx.fillText(text, (width / dpr) / 2, y);
    y += Math.round(0.056 * height / dpr) + 16;
    ctx.shadowBlur = 0;

    // Body text
    canvasMeasurements.lines.forEach((line, i) => {
      let header = canvasMeasurements.isHeader[i] || false;
      ctx.font = header ? `bold ${Math.round(0.023 * height / dpr)}px system-ui, Arial` : `${Math.round(0.019 * height / dpr)}px system-ui, Arial`;
      ctx.textAlign = header ? 'center' : 'left';
      ctx.fillStyle = header ? '#5CD9FF' : '#F7F7DF';
      y = wrapText(ctx, line, header ? (width / dpr) / 2 : (width / dpr) * 0.08, y, (width / dpr), canvasMeasurements.lineHeight, header, width / dpr > 1000);
    });

    contentEndYRef.current = y / (height / dpr);

    // Recreate texture when dimensions change, otherwise just flag for update
    const dimsChanged = textureDimsRef.current.w !== width || textureDimsRef.current.h !== height;
    if (!textureRef.current || dimsChanged) {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
      textureRef.current = new THREE.CanvasTexture(cvs);
      textureDimsRef.current = { w: width, h: height };
    } else {
      textureRef.current.needsUpdate = true;
    }
  }, [text, canvasMeasurements, canvasDims]);

  // Initial draw + redraw on content/dimension changes (including resize)
  React.useEffect(() => {
    // Reset scroll on resize since content reflows
    scrollOffsetRef.current = 0;
    targetScrollRef.current = 0;
    lastDrawnScrollRef.current = -1; // Force useFrame to redraw

    drawCanvas(0);
    setTotalContentHeight(canvasMeasurements.totalContentHeight + Math.round(canvasDims.height / canvasDims.dpr * 0.028) + 16);
  }, [drawCanvas, canvasMeasurements, canvasDims]);

  // Report scrollability to parent when content/dimensions change
  React.useEffect(() => {
    if (onScrollableChange && isActive) {
      const visibleHeight = canvasDims.height / canvasDims.dpr - canvasMeasurements.yStart;
      const scrollable = totalContentHeight > visibleHeight;
      onScrollableChange(sectionIndex, scrollable);
    }
  }, [totalContentHeight, canvasDims.height, canvasDims.dpr, canvasMeasurements.yStart, isActive, sectionIndex, onScrollableChange]);

  // Report content end Y position to parent
  React.useEffect(() => {
    if (onContentEndY && isActive) {
      onContentEndY(sectionIndex, contentEndYRef.current);
    }
  }, [totalContentHeight, isActive, sectionIndex, onContentEndY]);

  // Cleanup texture on unmount
  React.useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, []);

  const { camera, size: viewport } = useThree();

  useFrame((_, delta) => {
    if (!spriteRef.current) return;

    // --- Sprite sizing ---
    const spriteWorldPos = new THREE.Vector3(...position);
    const camPos = camera.position;
    const distance = spriteWorldPos.distanceTo(camPos);
    const fov = ('fov' in camera && typeof (camera as any).fov === 'number') ? (camera as any).fov : 50;
    const viewportHeight = viewport.height || 800;
    const viewportWidth = viewport.width || 1280;
    const worldHeightAtDistance = 2 * distance * Math.tan((fov * Math.PI) / 180 / 2);
    const worldWidthAtDistance = worldHeightAtDistance * (viewportWidth / viewportHeight);
    let targetWorldWidth = worldWidthAtDistance;
    let targetWorldHeight = worldHeightAtDistance;
    const canvasAspect = canvasDims.width / canvasDims.height;
    const viewportAspect = viewportWidth / viewportHeight;
    if (canvasAspect < viewportAspect) {
      targetWorldWidth = targetWorldHeight * canvasAspect;
    } else if (canvasAspect > viewportAspect) {
      targetWorldHeight = targetWorldWidth / canvasAspect;
    }
    spriteRef.current.scale.lerp(new THREE.Vector3(targetWorldWidth, targetWorldHeight, 1), 0.25);

    // --- Fade + keep material in sync with texture ref ---
    const targetOpacity = isActive ? 1 : 0.5;
    const mat = spriteRef.current.material as THREE.SpriteMaterial;
    mat.opacity += (targetOpacity - mat.opacity) * Math.min(1, 3 * delta);
    if (textureRef.current && mat.map !== textureRef.current) {
      mat.map = textureRef.current;
      mat.needsUpdate = true;
    }

    // --- Smooth scroll: lerp toward target, redraw only on whole-pixel change ---
    const diff = targetScrollRef.current - scrollOffsetRef.current;
    if (Math.abs(diff) > 0.5) {
      const lerpSpeed = 1 - Math.exp(-10 * delta);
      scrollOffsetRef.current += diff * lerpSpeed;
    }
    const rounded = Math.round(scrollOffsetRef.current);
    if (rounded !== lastDrawnScrollRef.current) {
      lastDrawnScrollRef.current = rounded;
      drawCanvas(rounded);
    }
  });

  // Handle mouse wheel scrolling
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const visibleHeight = canvasDims.height / canvasDims.dpr - canvasMeasurements.yStart;
      const maxScroll = Math.max(0, totalContentHeight - visibleHeight + 100);
      if (isActive && totalContentHeight > visibleHeight) {
        e.preventDefault();
        targetScrollRef.current = Math.max(0, Math.min(targetScrollRef.current + e.deltaY * 0.8, maxScroll));
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [isActive, totalContentHeight, canvasDims.height, canvasMeasurements.yStart]);

  // Touch scroll and swipe for mobile
  React.useEffect(() => {
    let lastY: number | undefined = undefined;
    let lastX: number | undefined = undefined;
    let lastTime = 0;
    let swipeStartX: number | undefined = undefined;
    let swipeStartY: number | undefined = undefined;
    let swipeDetected = false;
    let touchVelocity = 0;
    const SWIPE_THRESHOLD = 90;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length === 1) {
        lastY = e.touches[0].clientY;
        lastX = e.touches[0].clientX;
        lastTime = performance.now();
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
        swipeDetected = false;
        touchVelocity = 0;
        targetScrollRef.current = scrollOffsetRef.current;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isActive && e.touches && e.touches.length === 1 && lastY !== undefined && lastX !== undefined && swipeStartX !== undefined && swipeStartY !== undefined) {
        const newY = e.touches[0].clientY;
        const newX = e.touches[0].clientX;
        const now = performance.now();
        const dt = Math.max(1, now - lastTime) / 1000;
        const deltaY = lastY - newY;
        lastY = newY;
        lastX = newX;
        lastTime = now;
        touchVelocity = deltaY / dt;
        if (!swipeDetected) {
          const totalDeltaX = newX - swipeStartX;
          const totalDeltaY = newY - swipeStartY;
          if (Math.abs(totalDeltaX) > SWIPE_THRESHOLD && Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) {
            swipeDetected = true;
            if (totalDeltaX < 0 && typeof onSwipeLeft === 'function') {
              onSwipeLeft();
            } else if (totalDeltaX > 0 && typeof onSwipeRight === 'function') {
              onSwipeRight();
            }
            return;
          }
        }
        const visibleHeight = canvasDims.height / canvasDims.dpr - canvasMeasurements.yStart;
        const maxScroll = Math.max(0, totalContentHeight - visibleHeight + 100);
        if (maxScroll > 0) {
          e.preventDefault();
        }
        const nextScroll = Math.max(0, Math.min(scrollOffsetRef.current + deltaY, maxScroll));
        scrollOffsetRef.current = nextScroll;
        targetScrollRef.current = nextScroll;
      }
    };
    const handleTouchEnd = () => {
      if (!swipeDetected && Math.abs(touchVelocity) > 50) {
        const visibleHeight = canvasDims.height / canvasDims.dpr - canvasMeasurements.yStart;
        const maxScroll = Math.max(0, totalContentHeight - visibleHeight + 100);
        const projected = scrollOffsetRef.current + touchVelocity * 0.3;
        targetScrollRef.current = Math.max(0, Math.min(projected, maxScroll));
      }
      lastY = undefined;
      lastX = undefined;
      swipeStartX = undefined;
      swipeStartY = undefined;
      swipeDetected = false;
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive, canvasDims.height, canvasDims.dpr, canvasMeasurements.yStart, totalContentHeight, onSwipeLeft, onSwipeRight]);

  // Convert headerHeight (pixels) to world units
  const spriteWorldPos = new THREE.Vector3(...position);
  const camPos = camera.position;
  const distance = spriteWorldPos.distanceTo(camPos);
  const fov = ('fov' in camera && typeof (camera as any).fov === 'number') ? (camera as any).fov : 50;
  const viewportHeight = viewport.height || 800;
  const worldHeightAtDistance = 2 * distance * Math.tan((fov * Math.PI) / 180 / 2);
  const worldUnitsPerPixel = worldHeightAtDistance / (window.visualViewport?.height || 800);
  const yOffset = headerHeight * worldUnitsPerPixel;

  return (
    <group>
      <sprite
        ref={spriteRef}
        position={[position[0], position[1] - yOffset, position[2]]}
      >
        <spriteMaterial attach="material" args={[{ toneMapped: false, transparent: true, depthWrite: false }]} />
      </sprite>
    </group>
  );
}

export default TextSprite;
