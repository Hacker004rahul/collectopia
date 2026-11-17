import * as THREE from 'three';
import type { GateSpec } from '../economy/gateMath';
import { createGateTexture } from '../assets/proceduralTextures';
import { bakeStaticGroup } from '../core/bakeStaticGroup';

function addRoundedRect(
  path: THREE.Shape | THREE.Path,
  width: number,
  height: number,
  radius: number,
  reverse = false,
): void {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const r = Math.min(radius, halfWidth, halfHeight);

  if (reverse) {
    path.moveTo(-halfWidth + r, -halfHeight);
    path.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth, -halfHeight + r);
    path.lineTo(-halfWidth, halfHeight - r);
    path.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth + r, halfHeight);
    path.lineTo(halfWidth - r, halfHeight);
    path.quadraticCurveTo(halfWidth, halfHeight, halfWidth, halfHeight - r);
    path.lineTo(halfWidth, -halfHeight + r);
    path.quadraticCurveTo(halfWidth, -halfHeight, halfWidth - r, -halfHeight);
    path.closePath();
    return;
  }

  path.moveTo(-halfWidth + r, -halfHeight);
  path.lineTo(halfWidth - r, -halfHeight);
  path.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + r);
  path.lineTo(halfWidth, halfHeight - r);
  path.quadraticCurveTo(halfWidth, halfHeight, halfWidth - r, halfHeight);
  path.lineTo(-halfWidth + r, halfHeight);
  path.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - r);
  path.lineTo(-halfWidth, -halfHeight + r);
  path.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + r, -halfHeight);
  path.closePath();
}

function createArchGeometry(
  outerHalf: number,
  innerHalf: number,
  top: number,
  innerTop: number,
  outerRadius: number,
  innerRadius: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-outerHalf, 0);
  shape.lineTo(-outerHalf, top - outerRadius);
  shape.quadraticCurveTo(-outerHalf, top, -outerHalf + outerRadius, top);
  shape.lineTo(outerHalf - outerRadius, top);
  shape.quadraticCurveTo(outerHalf, top, outerHalf, top - outerRadius);
  shape.lineTo(outerHalf, 0);
  shape.lineTo(innerHalf, 0);
  shape.lineTo(innerHalf, innerTop - innerRadius);
  shape.quadraticCurveTo(innerHalf, innerTop, innerHalf - innerRadius, innerTop);
  shape.lineTo(-innerHalf + innerRadius, innerTop);
  shape.quadraticCurveTo(-innerHalf, innerTop, -innerHalf, innerTop - innerRadius);
  shape.lineTo(-innerHalf, 0);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.022,
    bevelThickness: 0.022,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function createPanelFrameGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  addRoundedRect(shape, 2.18, 1.36, 0.16);

  const hole = new THREE.Path();
  addRoundedRect(hole, 1.96, 1.14, 0.11, true);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.055,
    steps: 1,
    curveSegments: 10,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
  geometry.translate(0, 0, -0.0275);
  geometry.computeVertexNormals();
  return geometry;
}

export class Gate {
  readonly group = new THREE.Group();

  private readonly trimMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8c08d,
    metalness: 0.9,
    roughness: 0.25,
    emissive: 0x3b2a11,
    emissiveIntensity: 0.16,
  });
  private readonly trimShadowMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e5129,
    metalness: 0.82,
    roughness: 0.34,
  });
  private readonly trimHighlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5e4b8,
    metalness: 0.72,
    roughness: 0.2,
    emissive: 0x3d2d14,
    emissiveIntensity: 0.12,
  });
  private readonly accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x2fbf83,
    emissive: 0x2fbf83,
    emissiveIntensity: 0.55,
    metalness: 0.35,
    roughness: 0.24,
  });
  private readonly panelMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaTest: 0.035,
    toneMapped: false,
  });
  private readonly glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.08,
    transparent: true,
    opacity: 0.07,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  private readonly glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x2fbf83,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  laneIndex = 1;
  id = '';
  spec: GateSpec | null = null;

  constructor() {
    this.buildFrame();
    this.group.visible = false;
  }

  setSpec(spec: GateSpec, laneIndex: number, laneX: number, id: string): void {
    this.spec = spec;
    this.laneIndex = laneIndex;
    this.id = id;

    this.accentMaterial.color.set(spec.color);
    this.accentMaterial.emissive.set(spec.color);
    this.glowMaterial.color.set(spec.color);
    this.panelMaterial.map?.dispose();
    this.panelMaterial.map = createGateTexture(spec);
    this.panelMaterial.needsUpdate = true;

    this.group.position.x = laneX;
    this.group.visible = true;
  }

  hide(): void {
    this.group.visible = false;
  }

  private buildFrame(): void {
    const frameGroup = new THREE.Group();

    const backing = new THREE.Mesh(
      createArchGeometry(1.31, 1.01, 4.48, 4.2, 0.39, 0.24, 0.15),
      this.trimShadowMaterial,
    );
    backing.position.z = -0.055;
    backing.castShadow = true;
    frameGroup.add(backing);

    const arch = new THREE.Mesh(
      createArchGeometry(1.27, 1.03, 4.43, 4.19, 0.34, 0.23, 0.15),
      this.trimMaterial,
    );
    arch.castShadow = true;
    arch.receiveShadow = true;
    frameGroup.add(arch);

    const insetTrim = new THREE.Mesh(
      createArchGeometry(1.19, 1.1, 4.33, 4.24, 0.22, 0.18, 0.045),
      this.trimHighlightMaterial,
    );
    insetTrim.position.z = 0.075;
    frameGroup.add(insetTrim);

    const panelFrame = new THREE.Mesh(
      createPanelFrameGeometry(),
      this.trimMaterial,
    );
    panelFrame.position.set(0, 3.43, 0.135);
    panelFrame.castShadow = true;
    frameGroup.add(panelFrame);

    const panelFrameHighlight = new THREE.Mesh(
      createPanelFrameGeometry(),
      this.trimHighlightMaterial,
    );
    panelFrameHighlight.scale.set(0.955, 0.91, 0.5);
    panelFrameHighlight.position.set(0, 3.43, 0.19);
    frameGroup.add(panelFrameHighlight);

    for (const side of [-1, 1]) {
      const x = side * 1.17;

      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.31, 0.37, 0.16, 8),
        this.trimShadowMaterial,
      );
      plinth.position.set(x, 0.08, 0);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      frameGroup.add(plinth);

      const plinthTrim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.31, 0.12, 8),
        this.trimMaterial,
      );
      plinthTrim.position.set(x, 0.22, 0);
      plinthTrim.castShadow = true;
      frameGroup.add(plinthTrim);

      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.175, 0.205, 0.1, 12),
        this.trimHighlightMaterial,
      );
      collar.position.set(x, 0.34, 0);
      frameGroup.add(collar);

      for (const y of [0.78, 1.52, 2.26, 3]) {
        const stud = new THREE.Mesh(
          new THREE.SphereGeometry(0.036, 8, 8),
          this.trimHighlightMaterial,
        );
        stud.position.set(x, y, 0.1);
        frameGroup.add(stud);
      }

      const shoulder = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.052),
        this.accentMaterial,
      );
      shoulder.position.set(side * 1.09, 4.13, 0.11);
      shoulder.rotation.z = Math.PI / 4;
      frameGroup.add(shoulder);
    }

    const crestBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.13, 0.07, 12),
      this.trimMaterial,
    );
    crestBase.position.set(0, 4.5, 0);
    frameGroup.add(crestBase);

    const crestGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.07),
      this.accentMaterial,
    );
    crestGem.position.set(0, 4.58, 0);
    crestGem.rotation.y = Math.PI / 4;
    frameGroup.add(crestGem);

    this.group.add(bakeStaticGroup(frameGroup));

    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.02, 1.185),
      this.panelMaterial,
    );
    panel.position.set(0, 3.43, 0.115);
    this.group.add(panel);

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1.16),
      this.glassMaterial,
    );
    glass.position.set(0, 3.43, 0.152);
    this.group.add(glass);

    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 4.5),
      this.glowMaterial,
    );
    glowPlane.position.set(0, 2.25, -0.04);
    this.group.add(glowPlane);
  }
}
