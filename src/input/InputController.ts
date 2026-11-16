export interface InputCallbacks {
  onSteer: (direction: -1 | 1) => void;
  onPause: () => void;
  onPunch: () => void;
}

const SWIPE_THRESHOLD = 32;
const STEER_COOLDOWN_MS = 90;

export class InputController {
  private pointerActive = false;
  private anchorX = 0;
  private lastSteerAt = 0;
  private readonly disposers: Array<() => void> = [];

  constructor(
    private readonly target: HTMLElement,
    private readonly callbacks: InputCallbacks,
  ) {
    this.bindPointer();
    this.bindKeyboard();
  }

  dispose(): void {
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
  }

  private bindPointer(): void {
    const onPointerDown = (event: PointerEvent): void => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      this.pointerActive = true;
      this.anchorX = event.clientX;
      try {
        this.target.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional; window listeners still handle the gesture.
      }
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (!this.pointerActive) return;

      const dx = event.clientX - this.anchorX;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;

      const now = performance.now();
      if (now - this.lastSteerAt < STEER_COOLDOWN_MS) return;

      this.callbacks.onSteer(dx < 0 ? -1 : 1);
      this.anchorX = event.clientX;
      this.lastSteerAt = now;
    };

    const onPointerUp = (): void => {
      this.pointerActive = false;
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        this.callbacks.onSteer(-1);
        return;
      }
      if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        this.callbacks.onSteer(1);
        return;
      }
      if (key === 'escape' || key === 'p') {
        event.preventDefault();
        this.callbacks.onPause();
      }
      if (key === 'f' || key === ' ') {
        event.preventDefault();
        this.callbacks.onPunch();
      }
    };

    const onContextMenu = (event: Event): void => {
      event.preventDefault();
    };

    this.target.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    this.target.addEventListener('contextmenu', onContextMenu);

    this.disposers.push(
      () => this.target.removeEventListener('pointerdown', onPointerDown),
      () => window.removeEventListener('pointermove', onPointerMove),
      () => window.removeEventListener('pointerup', onPointerUp),
      () => window.removeEventListener('pointercancel', onPointerUp),
      () => window.removeEventListener('keydown', onKeyDown),
      () => this.target.removeEventListener('contextmenu', onContextMenu),
    );
  }

  private bindKeyboard(): void {
    // Keyboard binding lives in bindPointer so both share the same lifecycle.
  }
}
