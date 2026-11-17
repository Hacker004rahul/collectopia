import * as THREE from 'three';
import { LANES, PLAYER, PUNCH, STARTING_LANE } from '../config/balance';

interface Limb {
  pivot: THREE.Group;
  phaseOffset: number;
}

export class Player {
  readonly group = new THREE.Group();

  private readonly model = new THREE.Group();
  private readonly legs: Limb[] = [];
  private readonly arms: Limb[] = [];
  private readonly punchGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd79a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  private laneIndexValue: number = STARTING_LANE;
  private targetX: number = LANES[STARTING_LANE];
  private currentX: number = LANES[STARTING_LANE];
  private punchTimer = 0;
  private punchGlow: THREE.Mesh | null = null;

  constructor() {
    this.group.add(this.model);
    this.buildModel();
    this.group.position.set(this.currentX, 0, 0);
  }

  get laneIndex(): number {
    return this.laneIndexValue;
  }

  get x(): number {
    return this.currentX;
  }

  get z(): number {
    return this.group.position.z;
  }

  steer(direction: -1 | 1): void {
    const next = THREE.MathUtils.clamp(
      this.laneIndexValue + direction,
      0,
      LANES.length - 1,
    );
    this.laneIndexValue = next;
    this.targetX = LANES[next];
  }

  punch(): void {
    this.punchTimer = PUNCH.animDuration;
  }

  reset(): void {
    this.laneIndexValue = STARTING_LANE;
    this.targetX = LANES[STARTING_LANE];
    this.currentX = LANES[STARTING_LANE];
    this.punchTimer = 0;
    this.punchGlowMaterial.opacity = 0;
    if (this.punchGlow) this.punchGlow.visible = false;
    this.group.position.set(this.currentX, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.model.position.y = 0;
    this.model.rotation.y = 0;
  }

  update(dt: number, time: number, distance: number, speed: number): void {
    this.currentX = THREE.MathUtils.damp(
      this.currentX,
      this.targetX,
      PLAYER.laneSmoothing,
      dt,
    );

    this.group.position.x = this.currentX;
    this.group.position.z = -distance;

    const cadence = PLAYER.runCycleSpeed * (speed / PLAYER.forwardSpeed);
    const phase = time * cadence;

    for (const leg of this.legs) {
      leg.pivot.rotation.x = Math.sin(phase + leg.phaseOffset) * 0.92;
    }
    for (const arm of this.arms) {
      arm.pivot.rotation.x = Math.sin(phase + arm.phaseOffset) * 0.72;
    }

    if (this.punchTimer > 0) {
      this.punchTimer = Math.max(0, this.punchTimer - dt);
      const progress = 1 - this.punchTimer / PUNCH.animDuration;
      const pose =
        progress < 0.3
          ? THREE.MathUtils.smoothstep(progress / 0.3, 0, 1)
          : 1 - THREE.MathUtils.smoothstep((progress - 0.3) / 0.7, 0, 1);
      const rightArm = this.arms[1].pivot;
      rightArm.rotation.x = THREE.MathUtils.lerp(
        rightArm.rotation.x,
        1.8,
        pose,
      );
      rightArm.rotation.z = THREE.MathUtils.lerp(
        rightArm.rotation.z,
        0.45,
        pose,
      );
      const leftArm = this.arms[0].pivot;
      leftArm.rotation.x = THREE.MathUtils.lerp(
        leftArm.rotation.x,
        -0.35,
        pose * 0.6,
      );
      leftArm.rotation.z = THREE.MathUtils.lerp(
        leftArm.rotation.z,
        -0.18,
        pose * 0.6,
      );
      this.model.rotation.y = THREE.MathUtils.lerp(
        this.model.rotation.y,
        -0.22,
        pose,
      );
      if (this.punchGlow) {
        this.punchGlow.visible = pose > 0.02;
        this.punchGlow.scale.setScalar(0.55 + pose * 0.8);
      }
      this.punchGlowMaterial.opacity = pose * 0.45;
    } else {
      this.arms[1].pivot.rotation.z = THREE.MathUtils.damp(
        this.arms[1].pivot.rotation.z,
        0,
        18,
        dt,
      );
      this.arms[0].pivot.rotation.z = THREE.MathUtils.damp(
        this.arms[0].pivot.rotation.z,
        0,
        18,
        dt,
      );
      this.model.rotation.y = THREE.MathUtils.damp(
        this.model.rotation.y,
        0,
        14,
        dt,
      );
      this.punchGlowMaterial.opacity = 0;
      if (this.punchGlow) this.punchGlow.visible = false;
    }

    this.model.position.y = Math.abs(Math.sin(phase)) * 0.055;
    this.model.rotation.x = -0.06;

    const lean = THREE.MathUtils.clamp((this.targetX - this.currentX) * -0.16, -0.18, 0.18);
    this.group.rotation.z = THREE.MathUtils.damp(this.group.rotation.z, lean, 10, dt);
    this.group.rotation.y = THREE.MathUtils.damp(
      this.group.rotation.y,
      (this.targetX - this.currentX) * 0.035,
      10,
      dt,
    );
  }

  private buildModel(): void {
    const skin = this.material(0xd99a6c, 0.72);
    const shirt = this.material(0x1f8a8a, 0.8);
    const shirtDark = this.material(0x156a6a, 0.82);
    const pants = this.material(0x28364a, 0.88);
    const shoe = this.material(0xf2efe9, 0.65);
    const hair = this.material(0x1b1b22, 0.9);
    const eye = new THREE.MeshBasicMaterial({ color: 0x16161d });
    const backpack = this.material(0xe05a3b, 0.82);
    const scarf = this.material(0xd93b3b, 0.85);
    const white = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.4, 4, 12), shirt);
    torso.position.y = 1.23;
    this.addShadowed(torso);

    const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.03), shirtDark);
    chestStripe.position.set(0, 1.32, -0.265);
    this.addShadowed(chestStripe);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.14, 10), skin);
    neck.position.y = 1.68;
    this.addShadowed(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 14), skin);
    head.position.y = 1.92;
    this.addShadowed(head);

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.278, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hair,
    );
    hairCap.position.y = 1.94;
    hairCap.rotation.x = -0.12;
    this.addShadowed(hairCap);

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skin);
      ear.position.set(side * 0.265, 1.92, 0);
      this.addShadowed(ear);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), eye);
      pupil.position.set(side * 0.1, 1.94, -0.255);
      this.model.add(pupil);

      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), white);
      eyeWhite.position.set(side * 0.1, 1.94, -0.248);
      eyeWhite.scale.set(1, 0.78, 0.5);
      this.model.add(eyeWhite);
    }

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skin);
    nose.position.set(0, 1.86, -0.27);
    this.addShadowed(nose);

    const backpackMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.52, 0.2),
      backpack,
    );
    backpackMesh.position.set(0, 1.28, 0.27);
    this.addShadowed(backpackMesh);

    const backpackPocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.16, 0.05),
      shirtDark,
    );
    backpackPocket.position.set(0, 1.18, 0.39);
    this.addShadowed(backpackPocket);

    const scarfRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.06, 6, 12),
      scarf,
    );
    scarfRing.position.y = 1.7;
    scarfRing.rotation.x = Math.PI / 2;
    this.addShadowed(scarfRing);

    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.56), scarf);
    scarfTail.position.set(0.1, 1.62, 0.28);
    scarfTail.rotation.x = -0.22;
    this.addShadowed(scarfTail);

    for (const side of [-1, 1]) {
      const armPivot = new THREE.Group();
      armPivot.position.set(side * 0.38, 1.48, 0);
      this.model.add(armPivot);

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.26, 4, 8), shirt);
      upperArm.position.y = -0.2;
      this.addShadowed(upperArm, armPivot);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), skin);
      hand.position.y = -0.43;
      this.addShadowed(hand, armPivot);

      if (side === 1) {
        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.13, 10, 8),
          this.punchGlowMaterial,
        );
        glow.position.y = -0.43;
        glow.visible = false;
        armPivot.add(glow);
        this.punchGlow = glow;
      }

      this.arms.push({ pivot: armPivot, phaseOffset: side === 1 ? 0 : Math.PI });
    }

    for (const side of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.145, 0.8, 0);
      this.model.add(hip);

      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.32, 4, 8), pants);
      leg.position.y = -0.28;
      this.addShadowed(leg, hip);

      const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.34), shoe);
      shoeMesh.position.set(0, -0.56, -0.07);
      this.addShadowed(shoeMesh, hip);

      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.04, 0.35), shirtDark);
      sole.position.set(0, -0.63, -0.07);
      this.addShadowed(sole, hip);

      this.legs.push({ pivot: hip, phaseOffset: side === 1 ? 0 : Math.PI });
    }
  }

  private material(color: number, roughness: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      flatShading: true,
    });
  }

  private addShadowed(mesh: THREE.Mesh, parent: THREE.Object3D = this.model): void {
    mesh.castShadow = true;
    parent.add(mesh);
  }
}
