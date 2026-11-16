import * as THREE from 'three';
import { createGlowTexture } from '../assets/proceduralTextures';
import type { PowerUpType } from './PowerUpTimers';

export interface PowerUpPalette {
  color: number;
  accent: number;
  glow: number;
}

const PALETTES: Record<PowerUpType, PowerUpPalette> = {
  magnet: { color: 0xff4f55, accent: 0x68e7ff, glow: 0xff7b80 },
  shield: { color: 0x4fc3ff, accent: 0xe8fbff, glow: 0x7bd8ff },
  'super-punch': { color: 0xff8b3d, accent: 0xffe07a, glow: 0xffb35c },
  'double-coins': { color: 0xffcf3d, accent: 0xfff3ad, glow: 0xffdf64 },
  freeze: { color: 0x8fe8ff, accent: 0xffffff, glow: 0xb5f1ff },
};

export function powerUpPalette(type: PowerUpType): PowerUpPalette {
  return PALETTES[type];
}

function standard(
  color: number,
  emissive: number,
  emissiveIntensity = 0.7,
  metalness = 0.25,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity,
    metalness,
    roughness: 0.32,
  });
}

function addGlow(group: THREE.Group, color: number): void {
  const texture = createGlowTexture();
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      color,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  sprite.scale.set(2.25, 2.25, 1);
  group.add(sprite);
}

/**
 * Builds a small, readable floating icon for each power-up. All geometry is
 * intentionally low-poly so mobile devices can render the pooled set cheaply.
 */
export function buildPowerUpModel(type: PowerUpType): THREE.Group {
  const group = new THREE.Group();
  const palette = powerUpPalette(type);

  switch (type) {
    case 'magnet': {
      const material = standard(palette.color, palette.color, 0.8, 0.4);
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.33, 0.13, 8, 18, Math.PI),
        material,
      );
      arc.rotation.z = Math.PI;
      group.add(arc);

      const tipMaterial = standard(palette.accent, palette.accent, 0.85, 0.35);
      for (const side of [-1, 1]) {
        const tip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.13, 0.22, 10),
          tipMaterial,
        );
        tip.position.set(side * 0.33, 0.11, 0);
        group.add(tip);
      }
      break;
    }

    case 'shield': {
      const shape = new THREE.Shape();
      shape.moveTo(-0.38, 0.42);
      shape.lineTo(0.38, 0.42);
      shape.lineTo(0.34, -0.06);
      shape.quadraticCurveTo(0.26, -0.4, 0, -0.55);
      shape.quadraticCurveTo(-0.26, -0.4, -0.34, -0.06);
      shape.closePath();

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        steps: 1,
      });
      geometry.center();
      const shield = new THREE.Mesh(
        geometry,
        standard(palette.color, palette.color, 0.7, 0.35),
      );
      group.add(shield);

      const boss = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.13),
        standard(palette.accent, palette.accent, 0.95, 0.1),
      );
      boss.position.z = 0.09;
      group.add(boss);
      break;
    }

    case 'super-punch': {
      const fist = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.42, 0.4),
        standard(palette.color, palette.color, 0.8, 0.2),
      );
      group.add(fist);

      const knuckleMaterial = standard(
        palette.accent,
        palette.accent,
        0.9,
        0.15,
      );
      for (let i = 0; i < 4; i += 1) {
        const knuckle = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 6),
          knuckleMaterial,
        );
        knuckle.position.set(-0.19 + i * 0.126, 0.19, -0.17);
        group.add(knuckle);
      }

      const wrist = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.3, 0.3),
        standard(palette.color, palette.color, 0.55, 0.2),
      );
      wrist.position.set(0, -0.03, 0.34);
      group.add(wrist);
      break;
    }

    case 'double-coins': {
      const coinMaterial = standard(palette.color, 0x9a6500, 0.8, 0.7);
      const rimMaterial = standard(palette.accent, 0xb58516, 0.85, 0.65);
      for (const side of [-1, 1]) {
        const coin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.29, 0.29, 0.085, 18),
          coinMaterial,
        );
        coin.rotation.x = Math.PI / 2;
        coin.position.set(side * 0.22, side * 0.03, side * 0.05);
        group.add(coin);

        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(0.29, 0.035, 6, 18),
          rimMaterial,
        );
        rim.position.copy(coin.position);
        group.add(rim);
      }
      break;
    }

    case 'freeze': {
      const material = standard(palette.color, palette.color, 0.9, 0.1);
      for (let i = 0; i < 3; i += 1) {
        const branch = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.78, 0.08),
          material,
        );
        branch.rotation.z = (i * Math.PI) / 3;
        group.add(branch);
      }
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 10, 8),
        standard(palette.accent, palette.accent, 1, 0),
      );
      group.add(core);
      break;
    }
  }

  addGlow(group, palette.glow);
  return group;
}
