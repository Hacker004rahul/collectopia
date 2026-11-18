import { describe, expect, it } from 'vitest';
import { ReviveRunState } from '../src/game/ReviveRunState';
import {
  LOCAL_REVIVE_VIDEO_URL,
  LocalDemoVideoProvider,
  type LocalDemoVideoCallbacks,
  type ReviveVideoElement,
} from '../src/ui/LocalDemoVideoProvider';

class FakeVideo extends EventTarget implements ReviveVideoElement {
  currentTime = 0;
  duration = 9.99;
  ended = false;
  src = '';
  pauseCount = 0;
  playCount = 0;
  rejectPlay = false;

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

describe('ReviveRunState', () => {
  it('allows only one completed revive per run', () => {
    const revive = new ReviveRunState();

    expect(revive.beginAttempt()).toBe(true);
    expect(revive.completeAttempt()).toBe(true);
    expect(revive.available).toBe(false);
    expect(revive.beginAttempt()).toBe(false);
    expect(revive.completeAttempt()).toBe(false);
  });

  it('does not grant a revive after an interrupted attempt', () => {
    const revive = new ReviveRunState();

    expect(revive.beginAttempt()).toBe(true);
    revive.failAttempt();

    expect(revive.completeAttempt()).toBe(false);
    expect(revive.available).toBe(true);
    expect(revive.beginAttempt()).toBe(false);
  });

  it('resets revive availability for a new run', () => {
    const revive = new ReviveRunState();

    revive.beginAttempt();
    revive.completeAttempt();
    revive.reset();

    expect(revive.available).toBe(true);
    expect(revive.beginAttempt()).toBe(true);
  });
});
