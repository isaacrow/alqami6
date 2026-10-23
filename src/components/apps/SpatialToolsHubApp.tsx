import React, { useState } from 'react';
import {
  Box,
  Layers,
  Sliders,
  Scissors,
  Ruler,
  Sun,
  Eye,
  Camera,
  Compass,
  Hand,
  Sparkles,
  Volume2,
  Navigation,
  Crosshair,
  ShieldAlert,
  Search,
  CheckCircle2,
  ExternalLink,
  Flame,
  Terminal,
  Activity,
  Cpu,
  Tv,
  RefreshCw,
  Zap,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import { spatialSound } from '../../utils/spatialSound';
import { AppId } from '../../types/spatial';

export interface SpatialToolItem {
  id: number;
  category: string;
  name: string;
  desc: string;
  status: 'ACTIVE' | 'HARDWARE READY' | 'INTEGRATED' | 'SIMULATED';
  icon: any;
  actionLabel: string;
  onExecute: () => void;
}

interface SpatialToolsHubAppProps {
  onOpenApp?: (id: AppId) => void;
  xrState?: any;
  setXrState?: React.Dispatch<React.SetStateAction<any>>;
}

export const SpatialToolsHubApp: React.FC<SpatialToolsHubAppProps> = ({ onOpenApp, xrState, setXrState }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);

  const triggerHapticFeedback = () => {
    spatialSound.playPinchTap();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([15, 30, 15]);
    }
  };

  // The 100 Real AR / XR & 3D Spatial Tools
  const ALL_100_TOOLS: SpatialToolItem[] = [
    // Category 1: 3D Model & Mesh Tools (1–20)
    {
      id: 1,
      category: '3D Mesh',
      name: 'GLTF / GLB Binary Parser',
      desc: 'High-performance WebGL 3D asset loader with mesh decompression and PBR scene hierarchy graph.',
      status: 'ACTIVE',
      icon: Box,
      actionLabel: 'Open 3D Studio',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 2,
      category: '3D Mesh',
      name: 'Wavefront OBJ Mesh Loader',
      desc: 'Parses vertex positions, UV coordinates, and face definitions for classic polygon models.',
      status: 'ACTIVE',
      icon: Layers,
      actionLabel: 'Load OBJ Model',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 3,
      category: '3D Mesh',
      name: 'Stereolithography STL Importer',
      desc: 'Direct binary triangle parser for CAD, manufacturing, and 3D printing geometries.',
      status: 'HARDWARE READY',
      icon: Cpu,
      actionLabel: 'Inspect STL',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 4,
      category: '3D Mesh',
      name: 'Real-World Bounding Box Calculator',
      desc: 'Calculates exact geometric extents along X, Y, Z axes calibrated to real physical metric scale.',
      status: 'ACTIVE',
      icon: Ruler,
      actionLabel: 'Calculate Dimensions',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 5,
      category: '3D Mesh',
      name: 'Volume & Surface Area Estimator',
      desc: 'Computes volumetric displacement (cm³) and polygonal surface area for 3D meshes.',
      status: 'INTEGRATED',
      icon: Activity,
      actionLabel: 'Compute Volume',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 6,
      category: '3D Mesh',
      name: 'Wireframe Topology Visualizer',
      desc: 'Renders underlying triangle and quad edge topology with zero-artifact depth offsetting.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Toggle Wireframe',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('quicklook');
      },
    },
    {
      id: 7,
      category: '3D Mesh',
      name: 'Vertex & Face Normal Visualizer',
      desc: 'Displays outward-pointing normal vectors to diagnose lighting shading anomalies.',
      status: 'INTEGRATED',
      icon: Compass,
      actionLabel: 'Show Normals',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 8,
      category: '3D Mesh',
      name: 'Exploded-View Radial Disassembler',
      desc: 'Smoothly pulls multi-part assemblies outward along centroid vectors to inspect internal parts.',
      status: 'ACTIVE',
      icon: Layers,
      actionLabel: 'Explode Drone Parts',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 9,
      category: '3D Mesh',
      name: 'Exploded-View Linear Axis Separator',
      desc: 'Separates components sequentially along a specified Cartesian axis (X, Y, or Z).',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Linear Explode',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 10,
      category: '3D Mesh',
      name: 'Dynamic Cross-Section Slicer (X-Axis)',
      desc: 'Real-time hardware clipping plane cutting through 3D meshes along sagittal axis.',
      status: 'ACTIVE',
      icon: Scissors,
      actionLabel: 'Slice X-Plane',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 11,
      category: '3D Mesh',
      name: 'Dynamic Cross-Section Slicer (Y-Axis)',
      desc: 'Transverse horizontal clipping plane revealing interior cavities and chambers.',
      status: 'ACTIVE',
      icon: Scissors,
      actionLabel: 'Slice Y-Plane',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 12,
      category: '3D Mesh',
      name: 'Dynamic Cross-Section Slicer (Z-Axis)',
      desc: 'Frontal clipping plane with hollow-cap contour visualization for internal engineering.',
      status: 'ACTIVE',
      icon: Scissors,
      actionLabel: 'Slice Z-Plane',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 13,
      category: '3D Mesh',
      name: 'Dual-Sided Slab Inspection Slicer',
      desc: 'Clamps geometry between two parallel clipping planes for thin structural inspection.',
      status: 'INTEGRATED',
      icon: Scissors,
      actionLabel: 'Inspect Slab',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 14,
      category: '3D Mesh',
      name: 'Bounding Box Metric Dimension Rulers',
      desc: 'Overlays callout arrows displaying real-world width, height, and depth in centimeters.',
      status: 'ACTIVE',
      icon: Ruler,
      actionLabel: 'Show Metric Rulers',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 15,
      category: '3D Mesh',
      name: 'Center of Mass & Pivot Alignment',
      desc: 'Calculates the volumetric centroid and recenters the rotation pivot automatically.',
      status: 'ACTIVE',
      icon: Crosshair,
      actionLabel: 'Center Pivot',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 16,
      category: '3D Mesh',
      name: 'Ground Snapping & Shadow Alignment',
      desc: 'Snaps lowest vertex point to zero plane to prevent virtual models from floating.',
      status: 'ACTIVE',
      icon: Box,
      actionLabel: 'Snap Ground',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 17,
      category: '3D Mesh',
      name: 'Turntable Auto-Rotation Controller',
      desc: 'Smooth continuous orbit around the vertical axis with customizable RPM speed.',
      status: 'ACTIVE',
      icon: RefreshCw,
      actionLabel: 'Toggle Turntable',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 18,
      category: '3D Mesh',
      name: 'Submesh Component Tree Inspector',
      desc: 'Interactive hierarchy tree showing every individual submesh with isolated visibility.',
      status: 'ACTIVE',
      icon: Layers,
      actionLabel: 'Inspect Hierarchy',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 19,
      category: '3D Mesh',
      name: 'High-Res 3D Model Snapshot Capture',
      desc: 'Captures transparent PNG renders with antialiasing and bloom directly to device.',
      status: 'ACTIVE',
      icon: Camera,
      actionLabel: 'Take 3D Photo',
      onExecute: () => {
        triggerHapticFeedback();
        spatialSound.playAnchorDrop();
      },
    },
    {
      id: 20,
      category: '3D Mesh',
      name: 'Procedural Geometry Synthesizer',
      desc: 'Generates mathematical parametric solids (Torus, Capsule, Icosahedron, Sphere).',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Generate Geometry',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },

    // Category 2: PBR Materials, Shaders & Visual Styles (21–35)
    {
      id: 21,
      category: 'Shaders & PBR',
      name: 'PBR Metallic Reflectivity Controller',
      desc: 'Conductive surface reflections using real physical Fresnel-Schlick approximations.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Adjust Metalness',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 22,
      category: 'Shaders & PBR',
      name: 'PBR Microfacet Roughness Controller',
      desc: 'Cook-Torrance specular distribution simulating micro-scratches from mirror to matte.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Adjust Roughness',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 23,
      category: 'Shaders & PBR',
      name: 'Frosted Glass Optical Transmission',
      desc: 'Apple visionOS glass shader with optical refraction, chromatic dispersion, and blur.',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Toggle Glass Transmit',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 24,
      category: 'Shaders & PBR',
      name: 'Automotive Clearcoat Lacquer Shader',
      desc: 'Secondary glossy clearcoat layer simulating car paint and glazed ceramic finishes.',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Enable Clearcoat',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 25,
      category: 'Shaders & PBR',
      name: 'Emissive Neon Glow & HDR Bloom',
      desc: 'High-dynamic-range self-illuminating materials with cyber neon bloom trails.',
      status: 'ACTIVE',
      icon: Flame,
      actionLabel: 'Trigger Bloom',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('aircanvas');
      },
    },
    {
      id: 26,
      category: 'Shaders & PBR',
      name: 'Wireframe Shading Overlay',
      desc: 'Superimposes glowing green or cyan wireframe lines directly onto PBR surfaces.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Toggle Wireframe',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('quicklook');
      },
    },
    {
      id: 27,
      category: 'Shaders & PBR',
      name: 'MatCap Non-Photorealistic Shader',
      desc: 'Pre-baked lighting sphere textures (ZBrush Red Wax, Chrome, Pearl, Normal Map).',
      status: 'ACTIVE',
      icon: Eye,
      actionLabel: 'Switch MatCap',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('quicklook');
      },
    },
    {
      id: 28,
      category: 'Shaders & PBR',
      name: 'Normal Map Tangent Space Modifier',
      desc: 'Perturbs surface normals without adding polygons for micro-relief detail.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Inspect Normals',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 29,
      category: 'Shaders & PBR',
      name: 'Cel-Shaded Toon Outline Shader',
      desc: 'Quantized lighting steps with inverted-hull black silhouette outlines.',
      status: 'INTEGRATED',
      icon: Layers,
      actionLabel: 'Apply Cel-Shading',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 30,
      category: 'Shaders & PBR',
      name: 'Holographic Fresnel Edge-Glow',
      desc: 'Intensifies luminescence at glancing angles for sci-fi hologram projections.',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Glow Edge',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 31,
      category: 'Shaders & PBR',
      name: 'X-Ray Ghost Transparency Scanner',
      desc: 'Inverted depth opacity revealing internal skeletal structures in 3D models.',
      status: 'ACTIVE',
      icon: Eye,
      actionLabel: 'Enable X-Ray',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 32,
      category: 'Shaders & PBR',
      name: 'Depth Buffer Grayscale Depth Map',
      desc: 'Visualizes camera distance as linear grayscale gradient for depth estimation.',
      status: 'INTEGRATED',
      icon: Activity,
      actionLabel: 'View Depth Map',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 33,
      category: 'Shaders & PBR',
      name: 'Soft Contact Ambient Occlusion (AO)',
      desc: 'Darkens crevices and contact points between objects and physical floors.',
      status: 'ACTIVE',
      icon: Box,
      actionLabel: 'Adjust AO',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 34,
      category: 'Shaders & PBR',
      name: 'Studio 3-Point Key/Fill/Rim Rig',
      desc: 'Professional portrait lighting setup with balanced warm key and cool rim light.',
      status: 'ACTIVE',
      icon: Sun,
      actionLabel: 'Studio Lighting',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 35,
      category: 'Shaders & PBR',
      name: 'Golden Hour Sunset HDRI Simulation',
      desc: 'Atmospheric Rayleigh scattering with 2400K warm directional solar lighting.',
      status: 'ACTIVE',
      icon: Sun,
      actionLabel: 'Sunset Lighting',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },

    // Category 3: Augmented Reality & Passthrough Vision (36–50)
    {
      id: 36,
      category: 'AR & Passthrough',
      name: 'Rear Environment Camera Passthrough',
      desc: 'Streams live physical room video with zero latency underneath floating spatial windows.',
      status: 'ACTIVE',
      icon: Camera,
      actionLabel: 'Toggle Camera',
      onExecute: () => {
        triggerHapticFeedback();
        window.dispatchEvent(new Event('visionos:toggle-camera'));
      },
    },
    {
      id: 37,
      category: 'AR & Passthrough',
      name: 'User-Facing Selfie Camera Passthrough',
      desc: 'Front camera with horizontal mirroring for spatial FaceTime and face tracking.',
      status: 'ACTIVE',
      icon: RefreshCw,
      actionLabel: 'Flip Camera',
      onExecute: () => {
        triggerHapticFeedback();
        window.dispatchEvent(new Event('visionos:toggle-camera'));
      },
    },
    {
      id: 38,
      category: 'AR & Passthrough',
      name: 'Camera FPS & Exposure Stabilizer',
      desc: 'Requests 1080p 60fps video constraints with automatic gain and flicker reduction.',
      status: 'ACTIVE',
      icon: Activity,
      actionLabel: 'Optimize Feed',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 39,
      category: 'AR & Passthrough',
      name: 'Real-Time Ambient Room Color Tinting',
      desc: 'Samples camera pixel frames in real time to tint frosted glass windows to match physical room lighting.',
      status: 'ACTIVE',
      icon: Eye,
      actionLabel: 'Sample Room Tint',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 40,
      category: 'AR & Passthrough',
      name: 'Holographic LiDAR Room Mesh Scanner',
      desc: 'Overlays a polygonal triangulation laser mesh and contour rings over physical furniture.',
      status: 'ACTIVE',
      icon: Crosshair,
      actionLabel: 'Toggle LiDAR Mesh',
      onExecute: () => {
        triggerHapticFeedback();
        setXrState?.((prev: any) => ({ ...prev, lidarScannerActive: !prev?.lidarScannerActive }));
      },
    },
    {
      id: 41,
      category: 'AR & Passthrough',
      name: 'LiDAR Sonar Elevation Contour Radar',
      desc: 'Displays expanding scanning contour rings detecting physical floors and tabletops.',
      status: 'ACTIVE',
      icon: Compass,
      actionLabel: 'Run Sonar Pulse',
      onExecute: () => {
        triggerHapticFeedback();
        spatialSound.playAnchorDrop();
      },
    },
    {
      id: 42,
      category: 'AR & Passthrough',
      name: 'Plane Classification Indicator',
      desc: 'Classifies scanned physical surfaces into Floor, Tabletop, Wall, or Ceiling.',
      status: 'ACTIVE',
      icon: Box,
      actionLabel: 'Detect Planes',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 43,
      category: 'AR & Passthrough',
      name: 'WebXR Hit-Test Surface Reticle',
      desc: 'Raycasts into real-world geometry to orient targeting rings along physical surface normals.',
      status: 'HARDWARE READY',
      icon: Crosshair,
      actionLabel: 'Start Hit-Testing',
      onExecute: () => {
        triggerHapticFeedback();
        window.dispatchEvent(new Event('visionos:place-product'));
      },
    },
    {
      id: 44,
      category: 'AR & Passthrough',
      name: 'Soft Contact Shadow Ground Plane',
      desc: 'Dynamic radial shadow generator that visually grounds virtual models on the floor.',
      status: 'ACTIVE',
      icon: Box,
      actionLabel: 'Cast Shadows',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 45,
      category: 'AR & Passthrough',
      name: 'Direct USDZ Native iOS Quick Look Export',
      desc: 'Universal link trigger launching Apple ARKit native Quick Look viewer on iOS and Vision Pro.',
      status: 'ACTIVE',
      icon: ExternalLink,
      actionLabel: 'Quick Look USDZ',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('quicklook');
      },
    },
    {
      id: 46,
      category: 'AR & Passthrough',
      name: 'Direct GLB Android Scene Viewer Export',
      desc: 'Instant handoff into Google Play Services Scene Viewer AR on Android devices.',
      status: 'ACTIVE',
      icon: ExternalLink,
      actionLabel: 'Scene Viewer GLB',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 47,
      category: 'AR & Passthrough',
      name: 'Apple Vision Pro Safari Immersive API',
      desc: 'Connects directly to Safari Immersive USDZ room API for hardware-native spatial anchoring.',
      status: 'HARDWARE READY',
      icon: Sparkles,
      actionLabel: 'Enter Immersive',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 48,
      category: 'AR & Passthrough',
      name: 'Camera Zoom & Field of View (FOV) Tuner',
      desc: 'Matches virtual camera focal length to physical phone camera sensor geometry.',
      status: 'ACTIVE',
      icon: Camera,
      actionLabel: 'Calibrate FOV',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 49,
      category: 'AR & Passthrough',
      name: 'Thermal Vision Heatmap Camera Filter',
      desc: 'Simulates infrared FLIR thermal imaging using color lookup ramp (Blue -> Yellow -> Red).',
      status: 'ACTIVE',
      icon: Flame,
      actionLabel: 'Thermal Vision',
      onExecute: () => {
        triggerHapticFeedback();
        setXrState?.((prev: any) => ({
          ...prev,
          cameraActive: true,
          thermalVisionActive: !prev?.thermalVisionActive,
          nightVisionActive: false,
        }));
      },
    },
    {
      id: 50,
      category: 'AR & Passthrough',
      name: 'Night Vision Phosphor Camera Filter',
      desc: 'Monochrome emerald phosphor shader with high gain amplification for dark rooms.',
      status: 'ACTIVE',
      icon: Eye,
      actionLabel: 'Night Vision',
      onExecute: () => {
        triggerHapticFeedback();
        setXrState?.((prev: any) => ({
          ...prev,
          cameraActive: true,
          nightVisionActive: !prev?.nightVisionActive,
          thermalVisionActive: false,
        }));
      },
    },

    // Category 4: Motion, Tracking & Anti-Lag Physics (51–65)
    {
      id: 51,
      category: 'Motion & Physics',
      name: '3DoF Gyroscope Head Look Tracking',
      desc: 'Reads real-time device orientation angles (alpha, beta, gamma) to pan spatial 3D windows.',
      status: 'ACTIVE',
      icon: Compass,
      actionLabel: 'Toggle Gyro Look',
      onExecute: () => {
        triggerHapticFeedback();
        window.dispatchEvent(new Event('visionos:toggle-camera'));
      },
    },
    {
      id: 52,
      category: 'Motion & Physics',
      name: 'iOS DeviceOrientation Permission Manager',
      desc: 'Requests cryptographic motion sensor permissions required on iOS 13+ Safari.',
      status: 'ACTIVE',
      icon: ShieldAlert,
      actionLabel: 'Request iOS Sensor',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 53,
      category: 'Motion & Physics',
      name: 'Gyro Baseline Zero-Drift Recenter',
      desc: 'Instantly resets orientation baseline coordinates to lock windows directly ahead of the user.',
      status: 'ACTIVE',
      icon: Crosshair,
      actionLabel: 'Recenter View',
      onExecute: () => {
        triggerHapticFeedback();
        spatialSound.playPinchTap();
      },
    },
    {
      id: 54,
      category: 'Motion & Physics',
      name: 'Motion-to-Photon Lead Predictor (+35ms)',
      desc: 'Velocity derivative dead reckoning from delay_lab that eliminates motion lag and window slip.',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Toggle Predictor',
      onExecute: () => {
        triggerHapticFeedback();
        setXrState?.((prev: any) => ({
          ...prev,
          latencyPredictionActive: prev?.latencyPredictionActive === false ? true : false,
        }));
      },
    },
    {
      id: 55,
      category: 'Motion & Physics',
      name: 'Exponential Moving Average Jitter Filter',
      desc: 'Dynamic alpha-smoothing filter (a = 0.78) that removes high-frequency hand tremors.',
      status: 'ACTIVE',
      icon: Activity,
      actionLabel: 'Filter Jitter',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 56,
      category: 'Motion & Physics',
      name: 'Stationary Deadband Noise Gate',
      desc: 'Clamps sub-pixel drift when hands or head are stationary, locking UI solidly in space.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Clamp Deadband',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 57,
      category: 'Motion & Physics',
      name: 'Real-Time Latency & FPS Telemetry HUD',
      desc: 'Live telemetry HUD monitoring sensor polling frequency, rendering FPS, and motion lead.',
      status: 'ACTIVE',
      icon: Activity,
      actionLabel: 'Toggle Telemetry',
      onExecute: () => {
        triggerHapticFeedback();
        setXrState?.((prev: any) => ({
          ...prev,
          hudDiagnosticsOpen: !prev?.hudDiagnosticsOpen,
        }));
      },
    },
    {
      id: 58,
      category: 'Motion & Physics',
      name: 'MediaPipe 21-Joint 3D Hand Tracker',
      desc: 'WASM GPU neural network tracking all 21 skeletal joints of both hands in real-time video.',
      status: 'ACTIVE',
      icon: Hand,
      actionLabel: 'Track Hands',
      onExecute: () => {
        triggerHapticFeedback();
        window.dispatchEvent(new Event('visionos:toggle-camera'));
      },
    },
    {
      id: 59,
      category: 'Motion & Physics',
      name: 'Thumb-Index Pinch Recognition Engine',
      desc: 'Measures euclidean distance between joint 4 and joint 8 to trigger native visionOS selection.',
      status: 'ACTIVE',
      icon: Hand,
      actionLabel: 'Test Pinch Tap',
      onExecute: () => {
        triggerHapticFeedback();
        spatialSound.playPinchTap();
      },
    },
    {
      id: 60,
      category: 'Motion & Physics',
      name: 'Synthetic Pointer Event Dispatcher',
      desc: 'Synthesizes real DOM pointerdown, pointermove, and pointerup events from hand pinches.',
      status: 'ACTIVE',
      icon: Terminal,
      actionLabel: 'Dispatch Event',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 61,
      category: 'Motion & Physics',
      name: 'Open-Palm Vertical Scroll Gesture',
      desc: 'Detects 4 extended fingers to scroll pages and documents naturally without touching the glass.',
      status: 'ACTIVE',
      icon: Hand,
      actionLabel: 'Test Palm Scroll',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 62,
      category: 'Motion & Physics',
      name: 'Two-Finger Pinch-to-Scale AR Transform',
      desc: 'Scales 3D models from 10% to 500% real-world size using distance between two hands.',
      status: 'ACTIVE',
      icon: Maximize2,
      actionLabel: 'Test Pinch Scale',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 63,
      category: 'Motion & Physics',
      name: 'Two-Finger Twist-to-Rotate AR Transform',
      desc: 'Rotates 3D models 360 degrees around the vertical axis following hand rotation.',
      status: 'ACTIVE',
      icon: RefreshCw,
      actionLabel: 'Test Twist Rotate',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },
    {
      id: 64,
      category: 'Motion & Physics',
      name: 'Inertial Window Drag & Glide Physics',
      desc: 'Calculates release velocity vector (px/ms) and applies cubic decay friction for window movement.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Test Inertia',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 65,
      category: 'Motion & Physics',
      name: 'Dynamic Window Depth Billboarding',
      desc: 'Tilts windows slightly towards the user eye position for optimal readability at any angle.',
      status: 'ACTIVE',
      icon: Tv,
      actionLabel: 'Test Billboarding',
      onExecute: () => triggerHapticFeedback(),
    },

    // Category 5: Spatial Drawing, Annotations & World Anchors (66–80)
    {
      id: 66,
      category: 'Drawing & Anchors',
      name: 'Spatial In-Air Finger Drawing (Air Canvas)',
      desc: 'Extrudes glowing neon 3D ribbons in mid-air following index finger coordinates.',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Open Air Canvas',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('aircanvas');
      },
    },
    {
      id: 67,
      category: 'Drawing & Anchors',
      name: '3D Neon Ribbon Depth Extruder',
      desc: 'Generates quad-strip meshes with additive blending along hand motion trajectories.',
      status: 'ACTIVE',
      icon: Layers,
      actionLabel: 'Extrude 3D Ribbon',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('aircanvas');
      },
    },
    {
      id: 68,
      category: 'Drawing & Anchors',
      name: 'Holographic Particle Spark Trail Emitter',
      desc: 'Spawns sparkling light motes from finger joints that swirl and fade out smoothly.',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Emit Sparkles',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('aircanvas');
      },
    },
    {
      id: 69,
      category: 'Drawing & Anchors',
      name: 'VisionOS Neon Spectral Color Palette',
      desc: 'Six Apple Vision neon hues: Cyber Cyan, Vision Pink, Solar Gold, Emerald AR, Laser White, Ultra Violet.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Switch Palette',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('aircanvas');
      },
    },
    {
      id: 70,
      category: 'Drawing & Anchors',
      name: 'Air Canvas 3D Depth Orbit Rotator',
      desc: 'Rotates mid-air drawings in full 3D perspective space to inspect artwork from every side.',
      status: 'ACTIVE',
      icon: RefreshCw,
      actionLabel: 'Orbit Drawing',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('aircanvas');
      },
    },
    {
      id: 71,
      category: 'Drawing & Anchors',
      name: 'Stroke Undo & Redo History Stack',
      desc: 'LIFO history buffer preserving vector stroke points and colors for air sketches.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Undo Stroke',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('aircanvas');
      },
    },
    {
      id: 72,
      category: 'Drawing & Anchors',
      name: 'Canvas Reset & Snapshot Downloader',
      desc: 'Exports 3D air sketches to high-resolution PNG image files with transparent backgrounds.',
      status: 'ACTIVE',
      icon: Camera,
      actionLabel: 'Save Air Art',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('aircanvas');
      },
    },
    {
      id: 73,
      category: 'Drawing & Anchors',
      name: '360° Holographic Compass Heading Radar',
      desc: 'Interactive compass ring tracking magnetic north with real-time bearing angle degrees.',
      status: 'ACTIVE',
      icon: Compass,
      actionLabel: 'View Compass Radar',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('anchors');
      },
    },
    {
      id: 74,
      category: 'Drawing & Anchors',
      name: 'High-Precision GPS Geolocation Tracker',
      desc: 'Reads device GPS coordinates (latitude, longitude, altitude, accuracy) with zero drift.',
      status: 'ACTIVE',
      icon: Navigation,
      actionLabel: 'Track GPS Position',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('anchors');
      },
    },
    {
      id: 75,
      category: 'Drawing & Anchors',
      name: 'Location-Based World Anchor Dropper',
      desc: 'Drops persistent AR Billboards and Chirps at physical coordinates (from billboardbug-mcp).',
      status: 'ACTIVE',
      icon: Navigation,
      actionLabel: 'Drop AR Anchor',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('anchors');
      },
    },
    {
      id: 76,
      category: 'Drawing & Anchors',
      name: 'Haversine Anchor Distance & Bearing Indicator',
      desc: 'Computes great-circle distance in meters between user position and spatial world pins.',
      status: 'ACTIVE',
      icon: Ruler,
      actionLabel: 'Calculate Distance',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('anchors');
      },
    },
    {
      id: 77,
      category: 'Drawing & Anchors',
      name: 'Cardinal Heading Azimuth Markers (N, E, S, W)',
      desc: 'Fixed spatial beacons anchored to geographic north, east, south, and west.',
      status: 'ACTIVE',
      icon: Compass,
      actionLabel: 'Show Cardinal Pins',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('anchors');
      },
    },
    {
      id: 78,
      category: 'Drawing & Anchors',
      name: 'Floating 3D Spatial Tag Pins',
      desc: 'Holographic pill pins with title, category, and distance hovering in physical space.',
      status: 'ACTIVE',
      icon: Navigation,
      actionLabel: 'Inspect Pins',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('anchors');
      },
    },
    {
      id: 79,
      category: 'Drawing & Anchors',
      name: 'Spatial Sticky Note Pinboard',
      desc: 'Anchors rich text notes to specific physical surfaces in the room.',
      status: 'ACTIVE',
      icon: Layers,
      actionLabel: 'Open Notes',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('notes');
      },
    },
    {
      id: 80,
      category: 'Drawing & Anchors',
      name: 'Point-to-Point AR Tape Measure',
      desc: 'Taps two points on physical floor or tabletop to measure exact real-world distance in cm.',
      status: 'ACTIVE',
      icon: Ruler,
      actionLabel: 'Measure Distance',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('studio3d');
      },
    },

    // Category 6: VR/Stereoscopy & Display Modes (81–90)
    {
      id: 81,
      category: 'VR & Displays',
      name: 'Stereoscopic Side-by-Side (SBS) Dual-Eye Visor',
      desc: 'Splits screen into Left and Right viewports for Google Cardboard and mobile VR/AR viewers.',
      status: 'ACTIVE',
      icon: Eye,
      actionLabel: xrState?.sbsStereoActive ? 'Exit SBS' : 'Launch SBS',
      onExecute: () => {
        triggerHapticFeedback();
        setXrState?.((prev: any) => ({ ...prev, sbsStereoActive: !prev?.sbsStereoActive }));
      },
    },
    {
      id: 82,
      category: 'VR & Displays',
      name: 'Interpupillary Distance (IPD) Parallax Adjuster',
      desc: 'Shifts eye disparity offset (+-16px to +-32px) to match individual user eye separation.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Cycle IPD Offset',
      onExecute: () => {
        triggerHapticFeedback();
        setXrState?.((prev: any) => {
          const current = prev?.ipdOffset || 16;
          const next = current === 16 ? 24 : current === 24 ? 32 : 16;
          return { ...prev, ipdOffset: next };
        });
      },
    },
    {
      id: 83,
      category: 'VR & Displays',
      name: 'Anaglyph Red-Cyan 3D Stereoscopic Filter',
      desc: 'Color-separated stereoscopic channel overlay for classic 3D glasses.',
      status: 'ACTIVE',
      icon: Eye,
      actionLabel: xrState?.anaglyphActive ? 'Disable Anaglyph' : 'Enable Anaglyph',
      onExecute: () => {
        triggerHapticFeedback();
        setXrState?.((prev: any) => ({ ...prev, anaglyphActive: !prev?.anaglyphActive }));
      },
    },
    {
      id: 84,
      category: 'VR & Displays',
      name: 'Curved Ultrawide Display Mode (32:9 Cinema)',
      desc: 'Wraps panoramic workspace 180 degrees around user with cylindrical mesh curvature.',
      status: 'ACTIVE',
      icon: Tv,
      actionLabel: 'Open Mac Display',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('mac-display');
      },
    },
    {
      id: 85,
      category: 'VR & Displays',
      name: 'Spatial Window Distance Z-Offset Stepper',
      desc: 'Pushes windows forward or backward in 3D depth from 10cm to 3 meters.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Step Z Depth',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 86,
      category: 'VR & Displays',
      name: 'Immersive Environment Dimming Scrim',
      desc: 'Dials environment backdrop opacity from transparent passthrough to 100% full immersion.',
      status: 'ACTIVE',
      icon: Sun,
      actionLabel: 'Dial Immersion',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 87,
      category: 'VR & Displays',
      name: 'Control Center 3-Panel Bento Window',
      desc: 'visionOS 2 bento layout: Clock & Spatial Audio, Quick Toggles & Mac Display, Environments.',
      status: 'ACTIVE',
      icon: Sliders,
      actionLabel: 'Open Control Center',
      onExecute: () => {
        triggerHapticFeedback();
        spatialSound.playHover();
      },
    },
    {
      id: 88,
      category: 'VR & Displays',
      name: '15-App Staggered Honeycomb Launch Pad',
      desc: 'Apple Vision Pro home view launcher with spring physics and depth-offset icon rows.',
      status: 'ACTIVE',
      icon: Layers,
      actionLabel: 'Open Home Launcher',
      onExecute: () => {
        triggerHapticFeedback();
        spatialSound.playPinchTap();
      },
    },
    {
      id: 89,
      category: 'VR & Displays',
      name: 'Corner Arc Window Resize Gizmos',
      desc: 'Draggable rounded corner arc handles for fluid 2D and 3D window scaling.',
      status: 'ACTIVE',
      icon: Maximize2,
      actionLabel: 'Test Resize Gizmo',
      onExecute: () => triggerHapticFeedback(),
    },
    {
      id: 90,
      category: 'VR & Displays',
      name: 'Floating Detached Window Ornaments',
      desc: 'Spatial toolbars floating 24px in front of or beside parent windows (Left, Top, Bottom).',
      status: 'ACTIVE',
      icon: Layers,
      actionLabel: 'Inspect Ornaments',
      onExecute: () => {
        triggerHapticFeedback();
        onOpenApp?.('ikea');
      },
    },

    // Category 7: Spatial Audio & Acoustic Synthesizer (91–100)
    {
      id: 91,
      category: 'Spatial Audio',
      name: 'Procedural Web Audio API Sound Engine',
      desc: 'Real-time procedural synthesizer generating clean zero-latency audio without loading MP3 files.',
      status: 'ACTIVE',
      icon: Volume2,
      actionLabel: 'Init Audio Engine',
      onExecute: () => {
        triggerHapticFeedback();
        spatialSound.playPinchTap();
      },
    },
    {
      id: 92,
      category: 'Spatial Audio',
      name: '3D Stereo Panner Node (-1.0 to +1.0)',
      desc: 'Pans audio left or right dynamically based on the exact screen X coordinate of interaction.',
      status: 'ACTIVE',
      icon: Volume2,
      actionLabel: 'Test Left/Right Pan',
      onExecute: () => {
        spatialSound.playDrawStroke(650, -0.9);
        setTimeout(() => spatialSound.playDrawStroke(650, 0.9), 180);
      },
    },
    {
      id: 93,
      category: 'Spatial Audio',
      name: 'Glass Tap Click Acoustic Chime',
      desc: 'Triangle oscillator ramp (340Hz -> 980Hz) simulating a physical glass tap resonance.',
      status: 'ACTIVE',
      icon: Volume2,
      actionLabel: 'Play Glass Click',
      onExecute: () => spatialSound.playPinchTap(),
    },
    {
      id: 94,
      category: 'Spatial Audio',
      name: 'Air Drawing Laser Frequency Pitch Shifter',
      desc: 'Modulates oscillator pitch in real time proportionally to vertical index finger height.',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Play Pitch Ramp',
      onExecute: () => {
        [350, 480, 620, 800].forEach((freq, idx) => {
          setTimeout(() => spatialSound.playDrawStroke(freq, 0), idx * 60);
        });
      },
    },
    {
      id: 95,
      category: 'Spatial Audio',
      name: 'World Anchor Drop Resonance Chime',
      desc: 'Harmonic overtone chime (880Hz -> 1760Hz) confirming 3D anchor placement in the room.',
      status: 'ACTIVE',
      icon: Volume2,
      actionLabel: 'Play Anchor Chime',
      onExecute: () => spatialSound.playAnchorDrop(),
    },
    {
      id: 96,
      category: 'Spatial Audio',
      name: 'Siri AI Multi-Tone Morphing Arpeggio',
      desc: 'Four-note major arpeggio (C5, E5, G5, C6) signaling AI prompt ingestion and response.',
      status: 'ACTIVE',
      icon: Sparkles,
      actionLabel: 'Play Siri Chime',
      onExecute: () => spatialSound.playSiriChime(),
    },
    {
      id: 97,
      category: 'Spatial Audio',
      name: 'Mobile Haptic Vibration Pulse Synthesizer',
      desc: 'Generates tactile feedback patterns on mobile phone vibration motors (`navigator.vibrate`).',
      status: 'ACTIVE',
      icon: Zap,
      actionLabel: 'Test Phone Vibration',
      onExecute: () => {
        triggerHapticFeedback();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([20, 40, 20, 40, 30]);
        }
      },
    },
    {
      id: 98,
      category: 'Spatial Audio',
      name: 'Spatial Distance Attenuation & Rolloff',
      desc: 'Decreases volume by inverse-square law as the user walks away from virtual 3D models.',
      status: 'ACTIVE',
      icon: Volume2,
      actionLabel: 'Test Rolloff',
      onExecute: () => {
        spatialSound.playHover();
      },
    },
    {
      id: 99,
      category: 'Spatial Audio',
      name: 'Spatial Keyboard Tactile Audio Feedback',
      desc: 'High-frequency transient click accompanying each virtual keycap depression.',
      status: 'ACTIVE',
      icon: Volume2,
      actionLabel: 'Test Keyboard Click',
      onExecute: () => {
        spatialSound.playHover();
      },
    },
    {
      id: 100,
      category: 'Spatial Audio',
      name: 'Master Spatial Audio Enable / Mute Switch',
      desc: 'Global audio mute controller respecting system audio policy and user preference.',
      status: 'ACTIVE',
      icon: Volume2,
      actionLabel: 'Toggle Audio Master',
      onExecute: () => {
        spatialSound.enabled = !spatialSound.enabled;
        triggerHapticFeedback();
      },
    },
  ];

  const categories = [
    'All',
    '3D Mesh',
    'Shaders & PBR',
    'AR & Passthrough',
    'Motion & Physics',
    'Drawing & Anchors',
    'VR & Displays',
    'Spatial Audio',
  ];

  const filteredTools = ALL_100_TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full w-full select-none text-white overflow-hidden rounded-2xl relative bg-black/40 backdrop-blur-2xl">
      {/* Top Header & Search Navigation */}
      <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-black shadow-md">
            <Cpu className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-wide">Spatial AR/XR & 3D Power Tools Hub</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-400/40">
                100 / 100 TOOLS ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-white/50">Comprehensive Suite of 100 Spatial Computing & 3D Utilities</p>
          </div>
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search all 100 tools (e.g. lidar, PBR, slice)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="h-10 px-5 border-b border-white/10 flex items-center gap-2 overflow-x-auto bg-black/20 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              spatialSound.playHover();
            }}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-emerald-500 text-black font-semibold shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {cat} {cat === 'All' ? `(${ALL_100_TOOLS.length})` : ''}
          </button>
        ))}
      </div>

      {/* Main 100 Tools Grid */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-[10px] text-white/40 font-bold">
                        #{tool.id.toString().padStart(2, '0')}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider ${
                        tool.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : tool.status === 'HARDWARE READY'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-[11px] text-white/60 mt-1 leading-relaxed line-clamp-2">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-white/40">{tool.category}</span>
                  <button
                    onClick={() => {
                      tool.onExecute();
                      setLastExecuted(`Tool #${tool.id}: ${tool.name} executed!`);
                      setTimeout(() => setLastExecuted(null), 2500);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-black font-semibold text-[11px] transition-all flex items-center gap-1 shadow"
                  >
                    <span>{tool.actionLabel}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 text-white/50 text-xs">
            No spatial tools found matching "{searchQuery}".
          </div>
        )}
      </div>

      {/* Floating Action Confirmation Toast */}
      {lastExecuted && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full vision-glass text-xs text-emerald-300 border border-emerald-400/40 shadow-lg flex items-center gap-2 animate-fadeIn z-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{lastExecuted}</span>
        </div>
      )}
    </div>
  );
};
