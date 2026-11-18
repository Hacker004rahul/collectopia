import { describe, expect, it, vi } from 'vitest';
import { REVIVE_INVULNERABILITY_SECONDS } from '../src/config/revive';
import { getLevelState } from '../src/config/levels';
import { Game } from '../src/game/Game';
import {
  LOCAL_REVIVE_VIDEO_URL,
  LocalDemoVideoProvider,
  type LocalDemoVideoCallbacks,
  type ReviveVideoElement,
} from '../src/ui/LocalDemoVideoProvider';

class FakeVideo extends EventTarget implements ReviveVideoElement {
  private currentTimeValue = 0;
  private srcValue = '';
  duration = 9.99;
  ended = false;
  pauseCount = 0;
  playCount = 0;
  sourceAssignments = 0;
  rejectPlay = false;

  get currentTime(): number {
    return this.currentTimeValue;
  }

  set currentTime(value: number) {
    this.currentTimeValue = value;
    if (value < this.duration) this.ended = false;
  }

  get src(): string {
    return this.srcValue;
  }

  set src(value: string) {
    if (this.srcValue) this.dispatchEvent(new Event('abort'));
    this.srcValue = value;
    this.sourceAssignments += 1;
  }

  pause(): void {
    this.pauseCount += 1;
    this.dispatchEvent(new Event('pause'));
  }

  play(): Promise<void> {
    this.playCount += 1;
    if (this.rejectPlay) return Promise.reject(new Error('play failed'));
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  }
}

function callbacks() {
  const progress: Array<[number, number]> = [];
  let completed = 0;
  const failures: string[] = [];
  const handlers: LocalDemoVideoCallbacks = {
    onProgress: (time, duration) => progress.push([time, duration]),
    onComplete: () => {
      completed += 1;
    },
    onFailure: (message) => failures.push(message),
  };
  return { handlers, progress, get completed() { return completed; }, failures };
}

describe('LocalDemoVideoProvider', () => {
  it('loads the local video and grants completion only once after ended', () => {
    const video = new FakeVideo();
    const result = callbacks();
    const provider = new LocalDemoVideoProvider(video, result.handlers);

    provider.start();
    expect(video.src).toBe(LOCAL_REVIVE_VIDEO_URL);
    expect(video.playCount).toBe(1);

    video.currentTime = 4;
    video.dispatchEvent(new Event('loadedmetadata'));
    expect(result.progress).toEqual([[4, 9.99]]);
    expect(result.completed).toBe(0);

    video.currentTime = 9.99;
    video.ended = true;
    video.dispatchEvent(new Event('ended'));
    video.dispatchEvent(new Event('ended'));

    expect(result.completed).toBe(1);
    expect(result.failures).toEqual([]);
  });

  it('replays the loaded video across repeated revive attempts', () => {
    const video = new FakeVideo();
    const result = callbacks();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      new LocalDemoVideoProvider(video, result.handlers).start();
      video.currentTime = video.duration;
      video.ended = true;
      video.dispatchEvent(new Event('ended'));

      expect(result.completed).toBe(attempt + 1);
      expect(result.failures).toEqual([]);
    }

    expect(video.sourceAssignments).toBe(1);
    expect(video.playCount).toBe(3);
  });

  it('does not complete when playback is interrupted', () => {
    const video = new FakeVideo();
    const result = callbacks();
    const provider = new LocalDemoVideoProvider(video, result.handlers);

    provider.start();
    video.dispatchEvent(new Event('pause'));

    expect(result.completed).toBe(0);
    expect(result.failures[0]).toMatch(/interrupted/i);
    expect(video.pauseCount).toBe(1);
  });

  it('fails on video loading errors', () => {
    const video = new FakeVideo();
    const result = callbacks();
    const provider = new LocalDemoVideoProvider(video, result.handlers);

    provider.start();
    video.dispatchEvent(new Event('error'));

    expect(result.completed).toBe(0);
    expect(result.failures[0]).toMatch(/failed to load or play/i);
  });

  it('fails when the browser rejects playback', async () => {
    const video = new FakeVideo();
    video.rejectPlay = true;
    const result = callbacks();

    new LocalDemoVideoProvider(video, result.handlers).start();
    await Promise.resolve();

    expect(result.completed).toBe(0);
    expect(result.failures[0]).toMatch(/could not start/i);
  });
});

describe('Game revive lifecycle', () => {
  it('allows repeated revives and preserves run progress', () => {
    const game = Object.create(Game.prototype) as Game;
    const obstacles = {
      invulnerable: false,
      resumeAfterFatal: vi.fn(),
    };
    const enemies = { invulnerable: false };
    const clock = { setPaused: vi.fn() };
    const hud = {
      playReviveVideo: vi.fn(() => true),
      hideResults: vi.fn(),
    };
    const economy = { balance: 3_280, totalCoinsCollected: 18_450 };
    const player = { laneIndex: 2, x: 2.4, z: -6_700 };
    const runProgress = {
      distance: 6_700,
      currentLevelIndex: 7,
      runCoins: 46,
      runGates: 12,
      runEnemies: 4,
      economy,
      player,
    };

    for (const [key, value] of Object.entries({
      ...runProgress,
      obstacles,
      enemies,
      clock,
      hud,
      gameOver: true,
      revivePending: false,
      invulnerabilityTimer: 0,
    })) {
      Reflect.set(game, key, value);
    }

    for (let reviveIndex = 0; reviveIndex < 3; reviveIndex += 1) {
      Reflect.set(game, 'gameOver', true);
      invokeGameMethod(game, 'watchReviveVideo');
      invokeGameMethod(game, 'completeRevive');

      expect(Reflect.get(game, 'gameOver')).toBe(false);
      expect(Reflect.get(game, 'invulnerabilityTimer')).toBe(
        REVIVE_INVULNERABILITY_SECONDS,
      );
      expect(Reflect.get(game, 'distance')).toBe(runProgress.distance);
      expect(getLevelState(Reflect.get(game, 'distance')).level.index).toBe(
        runProgress.currentLevelIndex,
      );
      expect(Reflect.get(game, 'currentLevelIndex')).toBe(
        runProgress.currentLevelIndex,
      );
      expect(Reflect.get(game, 'runCoins')).toBe(runProgress.runCoins);
      expect(Reflect.get(game, 'runGates')).toBe(runProgress.runGates);
      expect(Reflect.get(game, 'runEnemies')).toBe(runProgress.runEnemies);
      expect(Reflect.get(game, 'economy')).toBe(economy);
      expect(economy.balance).toBe(3_280);
      expect(economy.totalCoinsCollected).toBe(18_450);
      expect(Reflect.get(game, 'player')).toBe(player);
      expect(player).toEqual({ laneIndex: 2, x: 2.4, z: -6_700 });
      expect(obstacles.resumeAfterFatal).toHaveBeenCalledTimes(reviveIndex + 1);
      expect(obstacles.invulnerable).toBe(true);
      expect(enemies.invulnerable).toBe(true);
    }

    expect(hud.playReviveVideo).toHaveBeenCalledTimes(3);
    expect(hud.hideResults).toHaveBeenCalledTimes(3);
  });

  it('does not revive after interrupted playback and permits a later retry', () => {
    const game = Object.create(Game.prototype) as Game;
    const obstacles = { invulnerable: false, resumeAfterFatal: vi.fn() };
    const hud = {
      playReviveVideo: vi.fn(() => true),
      hideResults: vi.fn(),
    };
    Reflect.set(game, 'obstacles', obstacles);
    Reflect.set(game, 'enemies', { invulnerable: false });
    Reflect.set(game, 'clock', { setPaused: vi.fn() });
    Reflect.set(game, 'hud', hud);
    Reflect.set(game, 'gameOver', true);
    Reflect.set(game, 'revivePending', false);
    Reflect.set(game, 'invulnerabilityTimer', 0);

    invokeGameMethod(game, 'watchReviveVideo');
    invokeGameMethod(game, 'failRevive');
    invokeGameMethod(game, 'completeRevive');

    expect(Reflect.get(game, 'gameOver')).toBe(true);
    expect(Reflect.get(game, 'invulnerabilityTimer')).toBe(0);
    expect(obstacles.resumeAfterFatal).not.toHaveBeenCalled();

    invokeGameMethod(game, 'watchReviveVideo');
    invokeGameMethod(game, 'completeRevive');

    expect(Reflect.get(game, 'gameOver')).toBe(false);
    expect(obstacles.resumeAfterFatal).toHaveBeenCalledTimes(1);
    expect(hud.playReviveVideo).toHaveBeenCalledTimes(2);
  });

  it('ignores duplicate completion callbacks for one playback', () => {
    const game = Object.create(Game.prototype) as Game;
    const obstacles = { invulnerable: false, resumeAfterFatal: vi.fn() };
    const hud = {
      playReviveVideo: vi.fn(() => true),
      hideResults: vi.fn(),
    };
    Reflect.set(game, 'obstacles', obstacles);
    Reflect.set(game, 'enemies', { invulnerable: false });
    Reflect.set(game, 'clock', { setPaused: vi.fn() });
    Reflect.set(game, 'hud', hud);
    Reflect.set(game, 'gameOver', true);
    Reflect.set(game, 'revivePending', false);
    Reflect.set(game, 'invulnerabilityTimer', 0);

    invokeGameMethod(game, 'watchReviveVideo');
    invokeGameMethod(game, 'completeRevive');
    invokeGameMethod(game, 'completeRevive');

    expect(obstacles.resumeAfterFatal).toHaveBeenCalledTimes(1);
    expect(hud.hideResults).toHaveBeenCalledTimes(1);
  });
});

function invokeGameMethod(game: Game, name: string): void {
  const method: unknown = Reflect.get(game, name);
  if (typeof method !== 'function') {
    throw new Error(`Game method ${name} is unavailable`);
  }
  Reflect.apply(method, game, []);
}
