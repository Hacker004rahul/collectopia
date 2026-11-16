export class Loop {
  private handle = 0;
  private running = false;
  private lastTime = 0;

  constructor(
    private readonly update: (dt: number, now: number) => void,
    private readonly render: () => void,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.handle = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.handle);
  }

  private readonly frame = (now: number): void => {
    if (!this.running) return;

    const dt = Math.min(Math.max((now - this.lastTime) / 1000, 0), 0.05);
    this.lastTime = now;

    this.update(dt, now);
    this.render();

    this.handle = requestAnimationFrame(this.frame);
  };
}
