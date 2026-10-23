import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EarthGlobeMode, QuickLookShaderMode } from '../../types/spatial';
import { createLovbackenModel, disposeThreeObject } from './LovbackenModel';

function createUVRainbowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#ff2d55');
  grad.addColorStop(0.25, '#ffcc00');
  grad.addColorStop(0.5, '#34c759');
  grad.addColorStop(0.75, '#007aff');
  grad.addColorStop(1, '#af52de');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  // Deep ocean gradient
  const ocean = ctx.createLinearGradient(0, 0, 0, 512);
  ocean.addColorStop(0, '#0b3878');
  ocean.addColorStop(0.5, '#1357b8');
  ocean.addColorStop(1, '#0b3878');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, 1024, 512);

  // Stylized continents (Africa, Eurasia, Americas, Australia)
  const continents = [
    // Africa & Europe
    { x: 520, y: 260, rx: 75, ry: 110, rot: -0.2, color: '#5c7c3b' },
    { x: 540, y: 150, rx: 95, ry: 55, rot: 0.1, color: '#4d6f32' },
    // Asia
    { x: 690, y: 170, rx: 145, ry: 85, rot: 0.15, color: '#6b8444' },
    { x: 620, y: 205, rx: 60, ry: 45, rot: -0.1, color: '#a89660' }, // Sahara/Arabia desert tint
    // North & South America
    { x: 240, y: 165, rx: 95, ry: 75, rot: 0.3, color: '#4f7536' },
    { x: 315, y: 330, rx: 55, ry: 95, rot: -0.2, color: '#3f6a2b' },
    // Australia
    { x: 825, y: 355, rx: 52, ry: 38, rot: 0.1, color: '#9c7a44' },
  ];
  continents.forEach((c) => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  return new THREE.CanvasTexture(canvas);
}

// 3D product viewer. Surface placement is implemented separately through WebXR hit testing.
export const Lovbacken3DCanvas: React.FC<{ mode: 'embedded' | 'popout' }> = ({ mode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<{ x: number; y: number }>({
    x: mode === 'popout' ? 0.18 : 0.12,
    y: mode === 'popout' ? -0.45 : 0.35,
  });
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const popoutStartTimeRef = useRef(0);
  const interactionHoldUntilRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(1, container.clientWidth || 480);
    const height = Math.max(1, container.clientHeight || 420);
    popoutStartTimeRef.current = performance.now();
    interactionHoldUntilRef.current = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.05, 30);
    camera.position.set(0, 0.79, mode === 'popout' ? 2.12 : 2.02);
    camera.lookAt(0, 0.22, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf4f7ff, 0x726b61, 1.4));
    const keyLight = new THREE.DirectionalLight(0xfff4df, 3.0);
    keyLight.position.set(-1.4, 2.4, 2.1);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x84aaff, 1.65);
    rimLight.position.set(1.7, 1.4, -1.6);
    scene.add(rimLight);

    const tableGroup = createLovbackenModel();
    tableGroup.rotation.set(rotationRef.current.x, rotationRef.current.y, 0);
    scene.add(tableGroup);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const shadowContext = shadowCanvas.getContext('2d');
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    if (shadowContext) {
      const gradient = shadowContext.createRadialGradient(64, 64, 4, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(0,0,0,0.32)');
      gradient.addColorStop(0.65, 'rgba(0,0,0,0.11)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      shadowContext.fillStyle = gradient;
      shadowContext.fillRect(0, 0, 128, 128);
      shadowTexture.needsUpdate = true;
    }
    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.45, 1.45),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = 0.001;
    scene.add(floorShadow);

    let animId = 0;
    let previousFrameTime = performance.now();
    const angularVelocity = { x: 0, y: 0 };
    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const frameScale = Math.min(2, Math.max(0.5, (time - previousFrameTime) / 16.67));
      previousFrameTime = time;
      if (!isDraggingRef.current) {
        let automaticTour = false;
        if (mode === 'popout' && time >= interactionHoldUntilRef.current) {
          automaticTour = true;
          const elapsed = (time - popoutStartTimeRef.current) / 1000;
          const liftProgress = Math.max(0, Math.min(1, (elapsed - 0.65) / 1.8));
          const liftEase = liftProgress * liftProgress * (3 - 2 * liftProgress);
          const returnProgress = Math.max(0, Math.min(1, (elapsed - 3.1) / 1.8));
          const returnEase = returnProgress * returnProgress * (3 - 2 * returnProgress);
          const idleTilt = elapsed > 5 ? Math.sin((elapsed - 5) * 1.25) * 0.035 : 0;
          const revealTilt = 0.76 * liftEase * (1 - returnEase);
          const targetPitch = 0.18 + revealTilt + idleTilt;
          rotationRef.current.x += (targetPitch - rotationRef.current.x) * 0.035 * frameScale;
          // Match the reference's slow inspection turn: one broad half-turn while
          // the model tips to reveal its underside, then a quiet display spin.
          const tourSpeed = elapsed < 5.8 ? 0.008 : 0.0016;
          angularVelocity.y += (tourSpeed - angularVelocity.y) * 0.025 * frameScale;
        }
        rotationRef.current.y += angularVelocity.y * frameScale;
        rotationRef.current.x = Math.max(-0.12, Math.min(0.68, rotationRef.current.x + angularVelocity.x * frameScale));
        angularVelocity.x *= Math.pow(0.94, frameScale);
        if (!automaticTour) angularVelocity.y *= Math.pow(0.94, frameScale);
      }
      tableGroup.rotation.set(rotationRef.current.x, rotationRef.current.y, 0);
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const onDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      interactionHoldUntilRef.current = performance.now() + 1800;
      angularVelocity.x = 0;
      angularVelocity.y = 0;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic camera-hand pointers are routed directly to the canvas.
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      rotationRef.current.y += dx * 0.01;
      rotationRef.current.x = Math.max(-0.12, Math.min(0.68, rotationRef.current.x + dy * 0.006));
      angularVelocity.y = dx * 0.0018;
      angularVelocity.x = dy * 0.0012;
    };
    const onUp = () => {
      isDraggingRef.current = false;
      if (mode === 'popout') interactionHoldUntilRef.current = performance.now() + 1400;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerup', onUp);
    dom.addEventListener('pointercancel', onUp);

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(1, container.clientWidth);
      const nextHeight = Math.max(1, container.clientHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerup', onUp);
      dom.removeEventListener('pointercancel', onUp);
      disposeThreeObject(tableGroup);
      floorShadow.geometry.dispose();
      (floorShadow.material as THREE.Material).dispose();
      shadowTexture.dispose();
      renderer.dispose();
    };
  }, [mode]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

// Quick Look USDZ Chair_V3.usdz 3D Volume with Original / Plain / Wireframe / UV Shader Switcher
export const QuickLookChairCanvas: React.FC<{ shaderMode: QuickLookShaderMode }> = ({ shaderMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const materialsRef = useRef<{
    original: THREE.Material;
    plain: THREE.Material;
    wireframe: THREE.Material;
    uv: THREE.Material;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.45, 3.7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const dir = new THREE.DirectionalLight(0xfff5e6, 2.0);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    const uvTex = createUVRainbowTexture();
    const mats = {
      original: new THREE.MeshStandardMaterial({
        color: 0xd8d2c7,
        roughness: 0.65,
        metalness: 0.08,
      }),
      plain: new THREE.MeshStandardMaterial({
        color: 0xefefef,
        roughness: 0.85,
        metalness: 0.0,
      }),
      wireframe: new THREE.MeshStandardMaterial({
        color: 0xdcdcdc,
        roughness: 0.4,
        wireframe: true,
      }),
      uv: new THREE.MeshStandardMaterial({
        map: uvTex,
        roughness: 0.35,
      }),
    };
    materialsRef.current = mats;

    // Build the exact sculptural Chair_V3.usdz from quick_look__d7qy16ralfcm_large.jpg:
    // 3 round donut/pillow backrest cushions, wavy scalloped seat cushion, and tubular sled legs
    const chairGroup = new THREE.Group();
    const collectedMeshes: THREE.Mesh[] = [];

    const addPart = (geo: THREE.BufferGeometry, pos: [number, number, number], rot?: [number, number, number]) => {
      const m = new THREE.Mesh(geo, mats.wireframe);
      m.position.set(...pos);
      if (rot) m.rotation.set(...rot);
      chairGroup.add(m);
      collectedMeshes.push(m);
    };

    // 3 Round Backrest Cushions
    [-0.56, 0, 0.56].forEach((xOffset) => {
      addPart(new THREE.TorusGeometry(0.22, 0.13, 24, 36), [xOffset, 0.68, -0.45]);
      addPart(new THREE.SphereGeometry(0.14, 20, 20), [xOffset, 0.68, -0.45]);
    });

    // Plush Seat Cushion
    addPart(new THREE.BoxGeometry(1.55, 0.24, 1.18, 24, 8, 20), [0, 0.14, 0.02]);

    // Wavy Scalloped Front & Side Apron Tubes
    for (let i = -3; i <= 3; i++) {
      addPart(
        new THREE.TorusGeometry(0.11, 0.048, 16, 24, Math.PI),
        [i * 0.21, -0.02, 0.61],
        [Math.PI, 0, 0]
      );
    }

    // Cantilevered Tubular Legs & Frame
    addPart(new THREE.CylinderGeometry(0.05, 0.05, 1.45, 20), [-0.76, 0.12, -0.48]);
    addPart(new THREE.CylinderGeometry(0.05, 0.05, 1.45, 20), [0.76, 0.12, -0.48]);
    addPart(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 20), [-0.76, -0.35, 0.58]);
    addPart(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 20), [0.76, -0.35, 0.58]);
    addPart(new THREE.CylinderGeometry(0.05, 0.05, 1.12, 20), [-0.76, -0.74, 0.05], [Math.PI / 2, 0, 0]);
    addPart(new THREE.CylinderGeometry(0.05, 0.05, 1.12, 20), [0.76, -0.74, 0.05], [Math.PI / 2, 0, 0]);

    meshesRef.current = collectedMeshes;
    chairGroup.rotation.set(0.12, -0.42, 0);
    scene.add(chairGroup);

    let isDown = false;
    let prev = { x: 0, y: 0 };
    const onDown = (e: MouseEvent) => {
      isDown = true;
      prev = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      chairGroup.rotation.y += (e.clientX - prev.x) * 0.01;
      chairGroup.rotation.x = Math.max(-0.6, Math.min(0.8, chairGroup.rotation.x + (e.clientY - prev.y) * 0.01));
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      isDown = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDown) {
        chairGroup.rotation.y += 0.0025;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!materialsRef.current) return;
    const mat = materialsRef.current[shaderMode];
    meshesRef.current.forEach((m) => {
      m.material = mat;
    });
  }, [shaderMode]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

// Interactive 3D Planet Earth Volume (from Hello-World-intro@2x.png)
export const PlanetEarth3DCanvas: React.FC<{ mode: EarthGlobeMode }> = ({ mode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<EarthGlobeMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 3.3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xdbeafe, 0.9);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
    sunLight.position.set(-4, 2, 3);
    scene.add(sunLight);

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = -0.41; // 23.5 deg axial tilt
    scene.add(tiltGroup);

    // Earth Sphere
    const earthTex = createEarthTexture();
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 64, 64),
      new THREE.MeshStandardMaterial({
        map: earthTex,
        roughness: 0.55,
        metalness: 0.1,
      })
    );
    tiltGroup.add(earthMesh);

    // Cloud Atmosphere Sphere
    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.975, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        wireframe: false,
      })
    );
    tiltGroup.add(cloudMesh);

    // Axial Tilt Axis Line (White pole sticking out top & bottom like Hello-World-intro@2x.png)
    const axisLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 2.45, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
    );
    tiltGroup.add(axisLine);

    // Satellite Orbit Ring + Satellite
    const orbitGroup = new THREE.Group();
    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.32, 0.006, 12, 96),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.55 })
    );
    orbitRing.rotation.x = Math.PI / 2.2;
    orbitGroup.add(orbitRing);

    const satMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.09, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 })
    );
    satMesh.position.set(1.32, 0, 0);
    orbitGroup.add(satMesh);
    scene.add(orbitGroup);

    let isDown = false;
    let prevX = 0;
    const dom = renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      isDown = true;
      prevX = e.clientX;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      earthMesh.rotation.y += (e.clientX - prevX) * 0.012;
      prevX = e.clientX;
    });
    window.addEventListener('mouseup', () => {
      isDown = false;
    });

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const currentMode = modeRef.current;
      const rotSpeed = currentMode === 'rotation' ? 0.018 : 0.0045;
      if (!isDown) {
        earthMesh.rotation.y += rotSpeed;
      }
      cloudMesh.rotation.y -= rotSpeed * 0.6;
      cloudMesh.material.opacity = currentMode === 'clouds' ? 0.52 : 0.18;
      orbitGroup.visible = currentMode === 'orbit' || currentMode === 'daylight';
      orbitGroup.rotation.y += 0.012;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
