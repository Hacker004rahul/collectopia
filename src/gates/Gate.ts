import * as THREE from 'three';
import type { GateSpec } from '../economy/gateMath';
import { createGateTexture } from '../assets/proceduralTextures';
import { bakeStaticGroup } from '../core/bakeStaticGroup';

export class Gate {
  readonly group = new THREE.Group();

  private readonly frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x37e19a,
    emissive: 0x37e19a,
    emissiveIntensity: 0.32,
    metalness: 0.35,
    roughness: 0.4,
  });
  private readonly panelMaterial = new THREE.MeshBasicMaterial({
    toneMapped: false,
  });
  private readonly glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x37e19a,
    transparent: true,
    opacity: 0.11,
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

    this.frameMaterial.color.set(spec.color);
    this.frameMaterial.emissive.set(spec.color);
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
    const columnGeometry = new THREE.BoxGeometry(0.13, 4.5, 0.13);
    const beamGeometry = new THREE.BoxGeometry(2.46, 0.16, 0.16);
    const baseGeometry = new THREE.BoxGeometry(2.46, 0.12, 0.5);

    for (const side of [-1, 1]) {
      const column = new THREE.Mesh(columnGeometry, this.frameMaterial);
      column.position.set(side * 1.14, 2.25, 0);
      column.castShadow = true;
      frameGroup.add(column);
    }

    const topBeam = new THREE.Mesh(beamGeometry, this.frameMaterial);
    topBeam.position.set(0, 4.55, 0);
    topBeam.castShadow = true;
    frameGroup.add(topBeam);

    const base = new THREE.Mesh(baseGeometry, this.frameMaterial);
    base.position.set(0, 0.06, 0);
    base.castShadow = true;
    frameGroup.add(base);

    this.group.add(bakeStaticGroup(frameGroup));

    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.26), this.panelMaterial);
    panel.position.set(0, 3.45, 0.09);
    this.group.add(panel);

    const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 4.3), this.glowMaterial);
    glowPlane.position.set(0, 2.22, -0.02);
    this.group.add(glowPlane);
  }
}
