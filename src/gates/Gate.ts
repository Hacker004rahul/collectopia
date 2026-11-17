import * as THREE from 'three';
import type { GateSpec } from '../economy/gateMath';
import {
  createGateGlowTexture,
  createGateTexture,
} from '../assets/proceduralTextures';
import { bakeStaticGroup } from '../core/bakeStaticGroup';

const PANEL_WIDTH = 2.12;
const PANEL_HEIGHT = 1.32;
const PANEL_Y = 2;

function addBox(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
  castShadow = true,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

export class Gate {
  readonly group = new THREE.Group();

  private readonly frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x394550,
    metalness: 0.58,
    roughness: 0.42,
  });
  private readonly edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9c6c6,
    metalness: 0.62,
    roughness: 0.3,
  });
  private readonly baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x8e9995,
    metalness: 0.14,
    roughness: 0.82,
  });
  private readonly accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x2fbf83,
    emissive: 0x2fbf83,
    emissiveIntensity: 0.3,
    metalness: 0.24,
    roughness: 0.42,
  });
  private readonly panelMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false,
    toneMapped: false,
  });
  private readonly floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x2fbf83,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  private readonly auraMaterial = new THREE.MeshBasicMaterial({
    color: 0x2fbf83,
    map: createGateGlowTexture(),
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
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
    this.floorMaterial.color.set(spec.color);
    this.auraMaterial.color.set(spec.color);
    this.panelMaterial.map = createGateTexture(spec);
    this.panelMaterial.needsUpdate = true;

    this.group.position.x = laneX;
    this.group.visible = true;
  }

  hide(): void {
    this.group.visible = false;
  }

  private buildFrame(): void {
    const frame = new THREE.Group();
    const postX = 1.18;

    for (const side of [-1, 1]) {
      const x = side * postX;
      addBox(
        frame,
        new THREE.BoxGeometry(0.54, 0.16, 0.58),
        this.baseMaterial,
        x,
        0.08,
        0,
      );
      addBox(
        frame,
        new THREE.BoxGeometry(0.3, 0.08, 0.36),
        this.edgeMaterial,
        x,
        0.2,
        0,
      );
      addBox(
        frame,
        new THREE.BoxGeometry(0.2, 3.75, 0.24),
        this.frameMaterial,
        x,
        2.075,
        0,
      );
      addBox(
        frame,
        new THREE.BoxGeometry(0.045, 3.55, 0.035),
        this.accentMaterial,
        x - side * 0.07,
        1.95,
        0.15,
        false,
      );
    }

    addBox(
      frame,
      new THREE.BoxGeometry(2.56, 0.16, 0.24),
      this.frameMaterial,
      0,
      3.87,
      0,
    );
    addBox(
      frame,
      new THREE.BoxGeometry(2.3, 0.035, 0.035),
      this.accentMaterial,
      0,
      3.79,
      0.14,
      false,
    );

    addBox(
      frame,
      new THREE.BoxGeometry(PANEL_WIDTH + 0.16, PANEL_HEIGHT + 0.16, 0.2),
      this.frameMaterial,
      0,
      PANEL_Y,
      0.13,
    );
    addBox(
      frame,
      new THREE.BoxGeometry(PANEL_WIDTH + 0.06, 0.035, 0.035),
      this.accentMaterial,
      0,
      PANEL_Y + PANEL_HEIGHT / 2 + 0.015,
      0.25,
      false,
    );

    this.group.add(bakeStaticGroup(frame));

    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_WIDTH + 0.5, PANEL_HEIGHT + 0.5),
      this.auraMaterial,
    );
    aura.position.set(0, PANEL_Y, 0.01);
    aura.renderOrder = 1;
    this.group.add(aura);

    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_WIDTH, PANEL_HEIGHT),
      this.panelMaterial,
    );
    panel.position.set(0, PANEL_Y, 0.245);
    panel.castShadow = false;
    panel.receiveShadow = false;
    panel.renderOrder = 2;
    this.group.add(panel);

    const floorMarker = new THREE.Mesh(
      new THREE.PlaneGeometry(2.24, 1.1),
      this.floorMaterial,
    );
    floorMarker.rotation.x = -Math.PI / 2;
    floorMarker.position.set(0, 0.025, 0.65);
    floorMarker.receiveShadow = false;
    this.group.add(floorMarker);
  }
}
