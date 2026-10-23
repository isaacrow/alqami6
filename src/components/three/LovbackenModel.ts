import * as THREE from 'three';

/** Real-scale procedural Lövbacken-inspired mesh shared by the product viewer and WebXR. */
export function createLovbackenModel(): THREE.Group {
  const model = new THREE.Group();
  model.name = 'Lövbacken coffee table · 90 cm';

  const blue = new THREE.MeshStandardMaterial({
    color: 0x123ca8,
    roughness: 0.38,
    metalness: 0.04,
  });
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = grainCanvas.height = 512;
  const grainContext = grainCanvas.getContext('2d');
  let seed = 8212026;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };
  if (grainContext) {
    grainContext.fillStyle = '#969896';
    grainContext.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 6200; i += 1) {
      const shade = random() > 0.54 ? 245 : 38;
      const alpha = 0.025 + random() * 0.09;
      const radius = 0.25 + random() * 1.1;
      grainContext.fillStyle = `rgba(${shade},${shade},${shade},${alpha})`;
      grainContext.beginPath();
      grainContext.arc(random() * 512, random() * 512, radius, 0, Math.PI * 2);
      grainContext.fill();
    }
  }
  const concreteTexture = new THREE.CanvasTexture(grainCanvas);
  concreteTexture.colorSpace = THREE.SRGBColorSpace;
  const concrete = new THREE.MeshStandardMaterial({
    color: 0x989a98,
    map: concreteTexture,
    roughness: 0.78,
    metalness: 0.015,
  });
  const brushedMetal = new THREE.MeshStandardMaterial({
    color: 0x9ca3aa,
    metalness: 0.78,
    roughness: 0.26,
  });

  // Vertical flutes are modeled into the silhouette, so the ribs remain visible at any angle.
  const radialSegments = 256;
  const fluteCount = 48;
  const profile = [
    { y: 0.035, radius: 0.205 },
    { y: 0.055, radius: 0.214 },
    { y: 0.105, radius: 0.235 },
    { y: 0.17, radius: 0.264 },
    { y: 0.24, radius: 0.302 },
    { y: 0.31, radius: 0.345 },
    { y: 0.36, radius: 0.375 },
    { y: 0.389, radius: 0.388 },
  ];
  const positions: number[] = [];
  const indices: number[] = [];
  for (const { y, radius } of profile) {
    for (let i = 0; i <= radialSegments; i += 1) {
      const angle = (i / radialSegments) * Math.PI * 2;
      const rib = Math.cos(angle * fluteCount) * 0.0048;
      const r = radius + rib;
      positions.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
    }
  }
  for (let row = 0; row < profile.length - 1; row += 1) {
    for (let i = 0; i < radialSegments; i += 1) {
      const a = row * (radialSegments + 1) + i;
      const b = a + radialSegments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const pedestalGeometry = new THREE.BufferGeometry();
  pedestalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  pedestalGeometry.setIndex(indices);
  pedestalGeometry.computeVertexNormals();
  const pedestal = new THREE.Mesh(pedestalGeometry, blue);
  pedestal.name = 'Blue fluted pedestal';
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  model.add(pedestal);

  // Revolved edge profile gives the 90 cm concrete top a soft, manufactured lip.
  const topProfile = [
    new THREE.Vector2(0.205, 0.389),
    new THREE.Vector2(0.37, 0.389),
    new THREE.Vector2(0.397, 0.393),
    new THREE.Vector2(0.42, 0.402),
    new THREE.Vector2(0.442, 0.414),
    new THREE.Vector2(0.45, 0.425),
    new THREE.Vector2(0.45, 0.439),
    new THREE.Vector2(0.445, 0.448),
    new THREE.Vector2(0.433, 0.451),
    new THREE.Vector2(0, 0.451),
  ];
  const tabletop = new THREE.Mesh(new THREE.LatheGeometry(topProfile, 128), concrete);
  tabletop.name = 'Soft-edge gray concrete top · 90 cm';
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  model.add(tabletop);

  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.024, 96), brushedMetal);
  foot.name = 'Brushed metal foot ring';
  foot.position.y = 0.022;
  foot.castShadow = true;
  model.add(foot);

  // A fine metal reveal separates the concrete top from the blue body.
  const reveal = new THREE.Mesh(new THREE.TorusGeometry(0.389, 0.003, 10, 128), brushedMetal);
  reveal.rotation.x = Math.PI / 2;
  reveal.position.y = 0.39;
  model.add(reveal);

  return model;
}

export function disposeThreeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value && typeof value === 'object' && 'isTexture' in value) {
          (value as THREE.Texture).dispose();
        }
      });
      material.dispose();
    });
  });
}
