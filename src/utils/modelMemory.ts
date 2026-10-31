import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { assetUrl } from './assetUrl';

// One Draco decoder (and its worker pool) shared by every viewer, instead of one per canvas.
let sharedDracoLoader: DRACOLoader | null = null;
export function getDracoLoader(): DRACOLoader {
  if (!sharedDracoLoader) {
    sharedDracoLoader = new DRACOLoader();
    const dracoAbsolute = new URL(assetUrl('draco/'), window.location.href).href;
    sharedDracoLoader.setDecoderPath(dracoAbsolute.endsWith('/') ? dracoAbsolute : `${dracoAbsolute}/`);
    sharedDracoLoader.setWorkerLimit(2);
  }
  return sharedDracoLoader;
}

const TEXTURE_KEYS = [
  'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap', 'bumpMap',
  'specularIntensityMap', 'specularColorMap', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap',
  'transmissionMap', 'thicknessMap', 'sheenColorMap', 'sheenRoughnessMap', 'iridescenceMap',
] as const;

// iPhone Safari kills the tab when a page holds too much texture memory (the helmet alone is 36 × 1024² maps),
// so on phones every model texture is shrunk to at most maxSize before it reaches the GPU.
export function downscaleTextures(root: THREE.Object3D, maxSize: number) {
  const done = new Set<THREE.Texture>();
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((mat) => {
      TEXTURE_KEYS.forEach((key) => {
        const tex = (mat as unknown as Record<string, THREE.Texture | null | undefined>)[key];
        if (!tex || done.has(tex)) return;
        done.add(tex);
        const img = tex.image as (HTMLImageElement | ImageBitmap | HTMLCanvasElement) | undefined;
        const w = img && ('naturalWidth' in img ? img.naturalWidth : img.width);
        const h = img && ('naturalHeight' in img ? img.naturalHeight : img.height);
        if (!img || !w || !h || Math.max(w, h) <= maxSize) return;
        const scale = maxSize / Math.max(w, h);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        if ('close' in img && typeof img.close === 'function') img.close();
        tex.image = canvas;
        tex.needsUpdate = true;
      });
    });
  });
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((mat) => {
      if (!mat) return;
      TEXTURE_KEYS.forEach((key) => (mat as unknown as Record<string, THREE.Texture | null | undefined>)[key]?.dispose());
      mat.dispose();
    });
  });
}

// Phones (iPhone Safari in particular) get a tight per-tab memory budget.
export const isPhoneViewport = () => window.matchMedia('(max-width: 768px)').matches;
