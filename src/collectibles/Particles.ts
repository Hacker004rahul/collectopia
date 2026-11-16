import * as THREE from 'three';
import { createGlowTexture } from '../assets/proceduralTextures';

interface Particle {
  active: boolean;
  life: number;
  maxLife: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

const MAX_PARTICLES = 72;
const BURST_SIZE = 14;

export class Particles {
  private readonly points: THREE.Points;
  private readonly positions: Float32Array;
  private readonly particles: Particle[] = [];

  constructor(private readonly scene: THREE.Scene) {
    this.positions = new Float32Array(MAX_PARTICLES * 3);

    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      this.particles.push({
        active: false,
        life: 0,
        maxLife: 1,
        position: new THREE.Vector3(0, -100, 0),
        velocity: new THREE.Vector3(),
      });
      this.positions[i * 3 + 1] = -100;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        map: createGlowTexture(),
        color: 0xffd76a,
        size: 0.2,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  spawn(origin: THREE.Vector3): void {
    let spawned = 0;

    for (const particle of this.particles) {
      if (spawned >= BURST_SIZE) break;
      if (particle.active) continue;

      particle.active = true;
      particle.maxLife = 0.45 + Math.random() * 0.35;
      particle.life = particle.maxLife;
      particle.position.copy(origin);
      particle.position.x += (Math.random() - 0.5) * 0.3;
      particle.position.y += (Math.random() - 0.5) * 0.3;
      particle.velocity.set(
        (Math.random() - 0.5) * 2.4,
        1.8 + Math.random() * 2.4,
        (Math.random() - 0.5) * 2.4,
      );
      spawned += 1;
    }
  }

  update(dt: number): void {
    for (let i = 0; i < this.particles.length; i += 1) {
      const particle = this.particles[i];
      const offset = i * 3;

      if (!particle.active) {
        this.positions[offset + 1] = -100;
        continue;
      }

      particle.life -= dt;
      if (particle.life <= 0) {
        particle.active = false;
        this.positions[offset + 1] = -100;
        continue;
      }

      particle.velocity.y -= 8.5 * dt;
      particle.position.addScaledVector(particle.velocity, dt);

      this.positions[offset] = particle.position.x;
      this.positions[offset + 1] = particle.position.y;
      this.positions[offset + 2] = particle.position.z;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  reset(): void {
    for (let i = 0; i < this.particles.length; i += 1) {
      const particle = this.particles[i];
      particle.active = false;
      particle.life = 0;
      this.positions[i * 3 + 1] = -100;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  dispose(): void {
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
