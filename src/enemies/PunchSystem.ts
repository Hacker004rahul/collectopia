/**
 * PunchSystem
 *
 * Owns the punch state machine:
 *  - Cooldown timer (enforced; no punch while cooling down).
 *  - Animation phase (brief arm-swing visual on the Player group).
 *  - Delegation to EnemySystem.punch() for hit detection.
 *  - Callbacks for hit and miss feedback.
 *
 * The accepted-punch callbacks drive the Player's right-arm animation. This is
 * entirely cosmetic and reverts automatically; it does not affect steering or
 * other gameplay.
 */
import { PUNCH } from '../config/balance';
import type { EnemySystem } from './EnemySystem';

export interface PunchCallbacks {
  /** Called when the punch lands on a valid target. */
  onHit: (superPunch: boolean) => void;
  /** Called when the punch swings but misses (no enemy in range). */
  onMiss: () => void;
}

export class PunchSystem {
  /** Set true when Super Punch power-up is active (Phase 5). */
  superPunchActive = false;

  private cooldownRemaining = 0;
  private animTimer = 0;

  get isReady(): boolean {
    return this.cooldownRemaining <= 0;
  }

  get cooldownRatio(): number {
    return Math.max(0, Math.min(1, this.cooldownRemaining / PUNCH.cooldown));
  }

  constructor(
    private readonly enemies: EnemySystem,
    private readonly callbacks: PunchCallbacks,
  ) {}

  /**
   * Attempt a punch at the current player position.
   * No-ops if still on cooldown.
   */
  trigger(playerZ: number, playerX: number): void {
    if (this.cooldownRemaining > 0) return;

    this.cooldownRemaining = PUNCH.cooldown;
    this.animTimer = PUNCH.animDuration;

    const hit = this.enemies.punch(playerZ, playerX, this.superPunchActive);
    if (hit) {
      this.callbacks.onHit(this.superPunchActive);
    } else {
      this.callbacks.onMiss();
    }
  }

  /**
   * Advance timers.  Call once per frame with the game-clock dt.
   */
  update(dt: number): void {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
    }
    if (this.animTimer > 0) {
      this.animTimer = Math.max(0, this.animTimer - dt);
    }
  }

  /** True while the punch animation is playing. */
  get isAnimating(): boolean {
    return this.animTimer > 0;
  }

  reset(): void {
    this.cooldownRemaining = 0;
    this.animTimer = 0;
    this.superPunchActive = false;
  }
}
