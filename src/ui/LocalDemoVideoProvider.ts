export const LOCAL_REVIVE_VIDEO_URL = '/assets/videos/revive-ad.mp4';

export interface ReviveVideoElement extends EventTarget {
  currentTime: number;
  duration: number;
  ended: boolean;
  src: string;
  pause(): void;
  play(): Promise<void>;
}

export interface LocalDemoVideoCallbacks {
  onProgress: (currentTime: number, duration: number) => void;
  onComplete: () => void;
  onFailure: (message: string) => void;
}

export class LocalDemoVideoProvider {
  private settled = false;
  private started = false;

  constructor(
    private readonly video: ReviveVideoElement,
    private readonly callbacks: LocalDemoVideoCallbacks,
  ) {}

  start(): void {
    this.video.addEventListener('play', this.handlePlay);
    this.video.addEventListener('pause', this.handlePause);
    this.video.addEventListener('loadedmetadata', this.handleProgress);
    this.video.addEventListener('timeupdate', this.handleProgress);
    this.video.addEventListener('ended', this.handleEnded);
    this.video.addEventListener('error', this.handleError);
    this.video.addEventListener('abort', this.handleAbort);

    try {
      if (!this.video.src.endsWith(LOCAL_REVIVE_VIDEO_URL)) {
        this.video.src = LOCAL_REVIVE_VIDEO_URL;
      }
      if (this.video.currentTime > 0) this.video.currentTime = 0;
      void this.video.play().catch(() => {
        this.fail('The local video could not start. You can end the run.');
      });
    } catch {
      this.fail('The local video could not start. You can end the run.');
    }
  }

  interrupt(): void {
    this.fail('Video playback was interrupted. You can end the run.');
  }

  dispose(): void {
    if (this.settled) return;
    this.settled = true;
    this.removeListeners();
    this.video.pause();
  }

  private readonly handlePlay = (): void => {
    this.started = true;
  };

  private readonly handlePause = (): void => {
    if (this.started && !this.video.ended) {
      this.fail('Video playback was interrupted. You can end the run.');
    }
  };

  private readonly handleProgress = (): void => {
    this.callbacks.onProgress(this.video.currentTime, this.video.duration);
  };

  private readonly handleEnded = (): void => {
    if (!this.video.ended) {
      this.fail('The video did not finish. You can end the run.');
      return;
    }

    if (this.settled) return;
    this.settled = true;
    this.removeListeners();
    this.callbacks.onComplete();
  };

  private readonly handleError = (): void => {
    this.fail('The local video failed to load or play. You can end the run.');
  };

  private readonly handleAbort = (): void => {
    this.fail('Video loading was interrupted. You can end the run.');
  };

  private fail(message: string): void {
    if (this.settled) return;
    this.settled = true;
    this.removeListeners();
    this.video.pause();
    this.callbacks.onFailure(message);
  }

  private removeListeners(): void {
    this.video.removeEventListener('play', this.handlePlay);
    this.video.removeEventListener('pause', this.handlePause);
    this.video.removeEventListener('loadedmetadata', this.handleProgress);
    this.video.removeEventListener('timeupdate', this.handleProgress);
    this.video.removeEventListener('ended', this.handleEnded);
    this.video.removeEventListener('error', this.handleError);
    this.video.removeEventListener('abort', this.handleAbort);
  }
}
