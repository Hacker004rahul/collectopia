export class Clock {
  private lastTime = 0;
  private started = false;
  private paused = false;
  private elapsed = 0;
  private lastDelta = 0;

  get time(): number {
    return this.elapsed;
  }

  get delta(): number {
    return this.lastDelta;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  start(now: number): void {
    this.started = true;
    this.lastTime = now;
    this.lastDelta = 0;
  }

  tick(now: number): number {
    if (!this.started) {
      this.start(now);
      return 0;
    }

    const rawDelta = Math.min(Math.max((now - this.lastTime) / 1000, 0), 0.05);
    this.lastTime = now;

    if (this.paused) {
      this.lastDelta = 0;
      return 0;
    }

    this.lastDelta = rawDelta;
    this.elapsed += rawDelta;
    return rawDelta;
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    this.lastDelta = 0;
    if (!paused) {
      this.lastTime = performance.now();
    }
  }
}
