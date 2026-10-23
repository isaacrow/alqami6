import * as THREE from 'three';
import { Text } from 'troika-three-text';

/**
 * Creates a high-clarity 3D Arabic & English typography billboard in Three.js AR space
 * powered by protectwise/troika (troika-three-text).
 * Provides crisp SDF glyph rendering with proper Arabic cursive joining and zero blurriness.
 */
export function createTroikaSpatialText(params: {
  textAr: string;
  textEn?: string;
  fontSize?: number;
  color?: number | string;
  outlineColor?: number | string;
}): THREE.Group {
  const container = new THREE.Group();
  container.name = 'troika-spatial-text';

  // 1. Primary Arabic 3D Title
  const textMeshAr = new Text();
  textMeshAr.text = params.textAr;
  textMeshAr.fontSize = params.fontSize || 38;
  textMeshAr.color = params.color || 0xffffff;
  textMeshAr.outlineWidth = 2.5;
  textMeshAr.outlineColor = params.outlineColor || 0x050814;
  textMeshAr.anchorX = 'center';
  textMeshAr.anchorY = 'middle';
  textMeshAr.textAlign = 'center';
  textMeshAr.direction = 'rtl'; // RTL for authentic Arabic ligature rendering
  textMeshAr.position.set(0, params.textEn ? 22 : 0, 0);

  // Material optimization for spatial pass
  if (textMeshAr.material) {
    (textMeshAr.material as THREE.Material).depthWrite = false;
  }
  textMeshAr.sync();
  container.add(textMeshAr);

  // 2. Secondary English Subtitle (if provided)
  if (params.textEn) {
    const textMeshEn = new Text();
    textMeshEn.text = params.textEn;
    textMeshEn.fontSize = (params.fontSize || 38) * 0.48;
    textMeshEn.color = 0x00f5d4; // Cyan neon
    textMeshEn.outlineWidth = 1.5;
    textMeshEn.outlineColor = 0x050814;
    textMeshEn.anchorX = 'center';
    textMeshEn.anchorY = 'middle';
    textMeshEn.textAlign = 'center';
    textMeshEn.direction = 'ltr';
    textMeshEn.position.set(0, -18, 0);

    if (textMeshEn.material) {
      (textMeshEn.material as THREE.Material).depthWrite = false;
    }
    textMeshEn.sync();
    container.add(textMeshEn);
  }

  // Floating background glass pill mesh
  const pillGeo = new THREE.PlaneGeometry(360, 80);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(8, 12, 22, 0.75)';
  ctx.roundRect(4, 4, 248, 56, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const pillTex = new THREE.CanvasTexture(canvas);
  const pillMat = new THREE.MeshBasicMaterial({
    map: pillTex,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const pillMesh = new THREE.Mesh(pillGeo, pillMat);
  pillMesh.position.set(0, 0, -2);
  container.add(pillMesh);

  return container;
}
