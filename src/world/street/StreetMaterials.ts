import * as THREE from 'three';
import {
  createAsphaltTexture,
  createBrickTexture,
  createConcreteTexture,
  createContactShadowTexture,
  createDirtTexture,
  createPaverTexture,
  createPlasterTexture,
  createRoofTexture,
  createSignAtlasTexture,
  createWoodTexture,
} from '../../assets/proceduralTextures';

function vertexMaterial(
  options: THREE.MeshStandardMaterialParameters,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.9,
    metalness: 0,
    ...options,
  });
}

export class StreetMaterials {
  readonly asphalt: THREE.MeshStandardMaterial;
  readonly roadPatch: THREE.MeshStandardMaterial;
  readonly paver: THREE.MeshStandardMaterial;
  readonly marking: THREE.MeshStandardMaterial;
  readonly dirt: THREE.MeshStandardMaterial;
  readonly plaster: THREE.MeshStandardMaterial;
  readonly brick: THREE.MeshStandardMaterial;
  readonly concrete: THREE.MeshStandardMaterial;
  readonly roof: THREE.MeshStandardMaterial;
  readonly wood: THREE.MeshStandardMaterial;
  readonly metal: THREE.MeshStandardMaterial;
  readonly glass: THREE.MeshStandardMaterial;
  readonly litWindow: THREE.MeshStandardMaterial;
  readonly foliage: THREE.MeshStandardMaterial;
  readonly fabric: THREE.MeshStandardMaterial;
  readonly signAtlas: THREE.MeshStandardMaterial;
  readonly contactShadow: THREE.MeshBasicMaterial;
  readonly lampGlow: THREE.MeshBasicMaterial;
  readonly wire: THREE.LineBasicMaterial;
  readonly distant: THREE.MeshStandardMaterial;

  private readonly textures: THREE.Texture[] = [];
  private readonly materials: THREE.Material[] = [];

  constructor() {
    const asphaltMap = this.texture(createAsphaltTexture());
    const paverMap = this.texture(createPaverTexture());
    const dirtMap = this.texture(createDirtTexture());
    const plasterMap = this.texture(createPlasterTexture());
    const brickMap = this.texture(createBrickTexture());
    const concreteMap = this.texture(createConcreteTexture());
    const roofMap = this.texture(createRoofTexture());
    const woodMap = this.texture(createWoodTexture());
    const signMap = this.texture(createSignAtlasTexture());
    const shadowMap = this.texture(createContactShadowTexture());

    this.asphalt = this.material(
      new THREE.MeshStandardMaterial({
        name: 'asphalt',
        map: asphaltMap,
        color: 0xffffff,
        roughness: 0.97,
        metalness: 0.01,
      }),
    );

    this.roadPatch = this.material(
      new THREE.MeshStandardMaterial({
        name: 'roadPatch',
        color: 0x3a3c3d,
        roughness: 1,
        metalness: 0,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );

    this.paver = this.material(
      new THREE.MeshStandardMaterial({
        name: 'paver',
        map: paverMap,
        color: 0xf6efe3,
        roughness: 0.94,
        metalness: 0,
      }),
    );

    this.marking = this.material(
      new THREE.MeshStandardMaterial({
        name: 'marking',
        color: 0xeee4c9,
        roughness: 0.68,
        metalness: 0,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    );

    this.dirt = this.material(
      new THREE.MeshStandardMaterial({
        name: 'dirt',
        map: dirtMap,
        color: 0xe5ddc3,
        roughness: 1,
        metalness: 0,
      }),
    );

    this.plaster = this.material(
      vertexMaterial({
        name: 'plaster',
        map: plasterMap,
        roughness: 0.96,
      }),
    );

    this.brick = this.material(
      vertexMaterial({
        name: 'brick',
        map: brickMap,
        roughness: 0.96,
      }),
    );

    this.concrete = this.material(
      vertexMaterial({
        name: 'concrete',
        map: concreteMap,
        roughness: 0.95,
      }),
    );

    this.roof = this.material(
      vertexMaterial({
        name: 'roof',
        map: roofMap,
        roughness: 0.92,
      }),
    );

    this.wood = this.material(
      vertexMaterial({
        name: 'wood',
        map: woodMap,
        roughness: 0.86,
      }),
    );

    this.metal = this.material(
      vertexMaterial({
        name: 'metal',
        roughness: 0.5,
        metalness: 0.34,
      }),
    );

    this.glass = this.material(
      vertexMaterial({
        name: 'glass',
        roughness: 0.22,
        metalness: 0.18,
      }),
    );

    this.litWindow = this.material(
      new THREE.MeshStandardMaterial({
        name: 'litWindow',
        color: 0xffd48a,
        emissive: 0xffad45,
        emissiveIntensity: 0.58,
        roughness: 0.42,
        metalness: 0.05,
      }),
    );

    this.foliage = this.material(
      vertexMaterial({
        name: 'foliage',
        roughness: 0.94,
        flatShading: true,
      }),
    );

    this.fabric = this.material(
      vertexMaterial({
        name: 'fabric',
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    );

    this.signAtlas = this.material(
      new THREE.MeshStandardMaterial({
        name: 'signAtlas',
        map: signMap,
        color: 0xffffff,
        roughness: 0.72,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
    );

    this.contactShadow = this.material(
      new THREE.MeshBasicMaterial({
        name: 'contactShadow',
        map: shadowMap,
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        toneMapped: false,
      }),
    );

    this.lampGlow = this.material(
      new THREE.MeshBasicMaterial({
        name: 'lampGlow',
        color: 0xffe2a3,
        toneMapped: false,
      }),
    );

    this.wire = this.material(
      new THREE.LineBasicMaterial({
        name: 'wire',
        color: 0x292a28,
        transparent: true,
        opacity: 0.62,
      }),
    );

    this.distant = this.material(
      vertexMaterial({
        name: 'distant',
        map: plasterMap,
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    );
  }

  dispose(): void {
    for (const material of this.materials) material.dispose();
    for (const texture of this.textures) texture.dispose();
    this.materials.length = 0;
    this.textures.length = 0;
  }

  private texture<T extends THREE.Texture>(texture: T): T {
    this.textures.push(texture);
    return texture;
  }

  private material<T extends THREE.Material>(material: T): T {
    this.materials.push(material);
    return material;
  }
}
