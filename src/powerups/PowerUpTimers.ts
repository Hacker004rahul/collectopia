import {
  POWERUPS,
} from '../config/balance';

export const POWERUP_TYPES = [
  'magnet',
  'shield',
  'super-punch',
  'double-coins',
  'freeze',
] as const;

export type PowerUpType = (typeof POWERUP_TYPES)[number];

export const POWERUP_LABELS: Record<PowerUpType, string> = {
  magnet: 'MAGNET',
  shield: 'SHIELD',
  'super-punch': 'SUPER PUNCH',
  'double-coins': 'DOUBLE COINS',
  freeze: 'FREEZE',
};

export interface ActivePowerUpState {
  type: PowerUpType;
  remaining: number;
  duration: number;
}

export function getPowerUpDuration(type: PowerUpType): number {
  switch (type) {
    case 'magnet':
      return POWERUPS.magnetDuration;
    case 'shield':
      return POWERUPS.shieldDuration;
    case 'super-punch':
      return POWERUPS.superPunchDuration;
    case 'double-coins':
      return POWERUPS.doubleCoinsDuration;
    case 'freeze':
      return POWERUPS.freezeDuration;
  }
}

export class PowerUpTimers {
  private readonly active = new Map<
    PowerUpType,
    { remaining: number; duration: number }
  >();

  /**
   * Activate or refresh a power-up. Refresh resets the timer to the full
   * duration instead of stacking time on top of the previous activation.
   */
  activate(type: PowerUpType, duration = getPowerUpDuration(type)): void {
    if (!Number.isFinite(duration) || duration <= 0) return;
    this.active.set(type, { remaining: duration, duration });
  }

  update(dt: number): PowerUpType[] {
    if (!Number.isFinite(dt) || dt <= 0 || this.active.size === 0) return [];

    const expired: PowerUpType[] = [];
    for (const [type, timer] of this.active) {
      timer.remaining = Math.max(0, timer.remaining - dt);
      if (timer.remaining <= 0) {
        expired.push(type);
      }
    }
    for (const type of expired) this.active.delete(type);
    return expired;
  }

  isActive(type: PowerUpType): boolean {
    return this.active.has(type);
  }

  remaining(type: PowerUpType): number {
    return this.active.get(type)?.remaining ?? 0;
  }

  remove(type: PowerUpType): boolean {
    return this.active.delete(type);
  }

  clear(): void {
    this.active.clear();
  }

  getStates(): ActivePowerUpState[] {
    const states: ActivePowerUpState[] = [];
    for (const type of POWERUP_TYPES) {
      const timer = this.active.get(type);
      if (!timer) continue;
      states.push({
        type,
        remaining: timer.remaining,
        duration: timer.duration,
      });
    }
    return states;
  }
}
