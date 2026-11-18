import type { LevelDefinition } from '../config/levels';
import {
  POWERUP_LABELS,
  POWERUP_TYPES,
  type ActivePowerUpState,
  type PowerUpType,
} from '../powerups/PowerUpTimers';
import {
  LocalDemoVideoProvider,
  type ReviveVideoElement,
} from './LocalDemoVideoProvider';

export interface HudCallbacks {
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onPunch: () => void;
  onRestart: () => void;
  onWatchRevive: () => void;
  onReviveComplete: () => void;
  onReviveFailure: () => void;
  onEndRun: () => void;
}

export interface RunResults {
  distance: number;
  level: number;
  coinsCollected: number;
  gatesPassed: number;
  enemiesDefeated: number;
  finalBalance: number;
  reason: string;
}

const TEMPLATE = `
  <div class="hud-top">
    <div class="brand">
      <p class="brand-kicker">INDIAN STREET RUN</p>
      <h1 class="brand-title">COLLECTOPIA</h1>
    </div>
    <div class="hud-stats">
      <div class="balance-pill">
        <span class="coin-icon" aria-hidden="true"></span>
        <span class="balance-copy">
          <span class="balance-label">COINS</span>
          <span class="balance-value">0</span>
        </span>
      </div>
      <button class="pause-button" type="button" aria-label="Pause game">
        <span></span><span></span>
      </button>
    </div>
  </div>
  <div class="level-row">
    <div class="level-copy">
      <span class="level-name">Level 1</span>
      <span class="level-zone">Residential Street</span>
    </div>
    <div class="progress-track" role="progressbar" aria-label="Level progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="progress-fill"></div>
    </div>
    <span class="progress-value">0%</span>
  </div>
  <div class="gate-toast" role="status" aria-live="polite"></div>
  <div class="powerup-strip" aria-live="polite"></div>
  <div class="zone-transition" aria-hidden="true">
    <div class="zone-transition-card">
      <span class="zone-transition-kicker">ENTERING</span>
      <strong class="zone-transition-name"></strong>
    </div>
  </div>
  <div class="tutorial-hint" role="status" aria-live="polite" aria-hidden="true">
    <span class="tutorial-touch">Swipe or drag to steer</span>
    <span class="tutorial-keys">← → or A / D · F or Space to punch · Esc to pause</span>
  </div>
  <div class="start-prompt">
    <button class="start-button" type="button" aria-label="Start run">START RUN</button>
  </div>
  <div class="punch-area">
    <button class="punch-button" type="button" aria-label="Punch">
      <svg class="punch-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.2 10.4V8.8a1.6 1.6 0 0 1 3.2 0v1.4"/>
        <path d="M8.4 9.9V7.7a1.6 1.6 0 0 1 3.2 0v2.1"/>
        <path d="M11.6 9.9V8.1a1.6 1.6 0 0 1 3.2 0v2"/>
        <path d="M14.8 10V9a1.6 1.6 0 0 1 3.2 0v5.4c0 2.7-2 4.8-4.7 4.8h-1.1c-1.4 0-2.6-.7-3.4-1.8l-3-4.2a1.7 1.7 0 0 1 2.6-2.1l1.4 1.3"/>
        <path d="M5.2 10.4H4.1a1.6 1.6 0 0 0 0 3.2h1.1"/>
      </svg>
      <span class="punch-label">PUNCH</span>
      <svg class="punch-cooldown-ring" viewBox="0 0 44 44" aria-hidden="true">
        <circle class="punch-cooldown-track" cx="22" cy="22" r="18"/>
        <circle class="punch-cooldown-fill" cx="22" cy="22" r="18"/>
      </svg>
    </button>
  </div>
  <div class="pause-overlay" hidden>
    <div class="pause-panel">
      <p class="pause-kicker">TAKE A BREATH</p>
      <h2>PAUSED</h2>
      <button class="resume-button" type="button">Resume run</button>
      <p class="pause-note">Stay in your lane. Collect coins. Choose the better gate.</p>
    </div>
  </div>
  <div class="results-overlay" role="dialog" aria-modal="true" aria-labelledby="results-title" hidden>
    <div class="results-panel">
      <p class="results-kicker">RUN SUMMARY</p>
      <h2 id="results-title">GAME OVER</h2>
      <p class="results-reason"></p>
      <div class="results-grid">
        <div class="results-stat"><span>Distance</span><strong data-result="distance">0 m</strong></div>
        <div class="results-stat"><span>Level</span><strong data-result="level">1</strong></div>
        <div class="results-stat"><span>Coins</span><strong data-result="coins">0</strong></div>
        <div class="results-stat"><span>Gates</span><strong data-result="gates">0</strong></div>
        <div class="results-stat"><span>Enemies</span><strong data-result="enemies">0</strong></div>
        <div class="results-stat"><span>Balance</span><strong data-result="balance">0</strong></div>
      </div>
      <p class="revive-error" role="alert" hidden></p>
      <div class="revive-offer">
        <span class="revive-offer-label">ONE-TIME REVIVE</span>
        <p>Finish the local demo video to continue this run.</p>
      </div>
      <div class="revive-actions">
        <button class="revive-watch-button" type="button">
          <span>WATCH VIDEO</span>
          <span class="revive-button-detail">CONTINUE THIS RUN</span>
        </button>
        <button class="end-run-button" type="button">
          <span>END RUN</span>
          <span class="end-run-detail">Save these results</span>
        </button>
      </div>
      <button class="restart-button" type="button">Run again</button>
      <p class="results-note">Lifetime coins carry over between runs.</p>
    </div>
    <div class="revive-video-panel" tabindex="-1" hidden>
      <p class="results-kicker">LOCAL DEMO <span class="provider-tag">NOT AN AD</span></p>
      <h2>CONTINUE RUN</h2>
      <p class="revive-video-note">Your run is paused while this video plays.</p>
      <div class="revive-video-frame">
        <video
          class="revive-video"
          playsinline
          preload="metadata"
          disablepictureinpicture
          controlslist="nodownload noplaybackrate noremoteplayback"
          aria-label="Local demo video for a one-time run revive"
        ></video>
      </div>
      <div class="revive-video-progress" role="progressbar" aria-label="Video progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="revive-video-progress-fill"></span>
      </div>
      <p class="revive-video-countdown" role="status" aria-live="polite">Loading video...</p>
      <p class="revive-video-note">Complete the full video to earn your one-time revive.</p>
    </div>
  </div>
`;

const TUTORIAL_STORAGE_KEY = 'collectopia.tutorial.v1';
const TUTORIAL_DURATION_MS = 7_000;
const TUTORIAL_FADE_MS = 300;

function hasCompletedTutorial(): boolean {
  try {
    return window.localStorage.getItem(TUTORIAL_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberTutorialCompleted(): void {
  try {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

export class Hud {
  private readonly callbacks: HudCallbacks;
  private readonly root: HTMLDivElement;
  private readonly balanceValue: HTMLElement;
  private readonly balancePill: HTMLElement;
  private readonly levelName: HTMLElement;
  private readonly levelZone: HTMLElement;
  private readonly progressTrack: HTMLElement;
  private readonly progressFill: HTMLElement;
  private readonly progressValue: HTMLElement;
  private readonly toast: HTMLElement;
  private readonly zoneTransition: HTMLElement;
  private readonly zoneTransitionName: HTMLElement;
  private readonly tutorialHint: HTMLElement;
  private readonly startPrompt: HTMLElement;
  private readonly startButton: HTMLButtonElement;
  private readonly pauseOverlay: HTMLElement;
  private readonly resultsOverlay: HTMLElement;
  private readonly resultsPanel: HTMLElement;
  private readonly reviveVideoPanel: HTMLElement;
  private readonly reviveError: HTMLElement;
  private readonly reviveOffer: HTMLElement;
  private readonly reviveWatchButton: HTMLButtonElement;
  private readonly endRunButton: HTMLButtonElement;
  private readonly reviveVideo: HTMLVideoElement;
  private readonly reviveVideoProgress: HTMLElement;
  private readonly reviveVideoProgressFill: HTMLElement;
  private readonly reviveVideoCountdown: HTMLElement;
  private readonly restartButton: HTMLButtonElement;
  private readonly resultsReason: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly punchButton: HTMLButtonElement;
  private readonly punchCooldownFill: SVGCircleElement;
  private readonly powerupStrip: HTMLElement;
  private readonly powerupChips = new Map<PowerUpType, HTMLElement>();
  private readonly powerupBars = new Map<PowerUpType, HTMLElement>();
  private readonly coinPops: HTMLSpanElement[] = [];
  private coinPopIndex = 0;
  private toastTimer = 0;
  private balancePulseTimer = 0;
  private tutorialTimer = 0;
  private tutorialHideTimer = 0;
  private tutorialComplete = false;
  private lastLevelIndex = -1;
  private lastProgress = -1;
  private lastCooldownRatio = -1;
  private activeVideoProvider: LocalDemoVideoProvider | null = null;

  constructor(container: HTMLElement, callbacks: HudCallbacks) {
    this.callbacks = callbacks;
    this.root = document.createElement('div');
    this.root.className = 'hud';
    this.root.innerHTML = TEMPLATE;
    container.appendChild(this.root);

    this.balanceValue = this.query('.balance-value');
    this.balancePill = this.query('.balance-pill');
    this.levelName = this.query('.level-name');
    this.levelZone = this.query('.level-zone');
    this.progressTrack = this.query('.progress-track');
    this.progressFill = this.query('.progress-fill');
    this.progressValue = this.query('.progress-value');
    this.toast = this.query('.gate-toast');
    this.zoneTransition = this.query('.zone-transition');
    this.zoneTransitionName = this.query('.zone-transition-name');
    this.tutorialHint = this.query('.tutorial-hint');
    this.startPrompt = this.query('.start-prompt');
    this.startButton = this.query<HTMLButtonElement>('.start-button');
    this.pauseOverlay = this.query('.pause-overlay');
    this.resultsOverlay = this.query('.results-overlay');
    this.resultsPanel = this.query('.results-panel');
    this.reviveVideoPanel = this.query('.revive-video-panel');
    this.reviveError = this.query('.revive-error');
    this.reviveOffer = this.query('.revive-offer');
    this.reviveWatchButton = this.query<HTMLButtonElement>('.revive-watch-button');
    this.endRunButton = this.query<HTMLButtonElement>('.end-run-button');
    this.reviveVideo = this.query<HTMLVideoElement>('.revive-video');
    this.reviveVideoProgress = this.query('.revive-video-progress');
    this.reviveVideoProgressFill = this.query('.revive-video-progress-fill');
    this.reviveVideoCountdown = this.query('.revive-video-countdown');
    this.resultsReason = this.query('.results-reason');
    this.pauseButton = this.query('.pause-button');
    this.powerupStrip = this.query('.powerup-strip');

    this.buildPowerUpChips();

    this.tutorialComplete = hasCompletedTutorial();
    this.pauseButton.disabled = true;

    this.punchButton = this.query<HTMLButtonElement>('.punch-button');
    this.punchButton.disabled = true;
    this.punchCooldownFill = this.root.querySelector(
      '.punch-cooldown-fill',
    ) as SVGCircleElement;

    // Circumference of the cooldown ring (r=18 → c ≈ 113.1)
    const CIRCUMFERENCE = 2 * Math.PI * 18;
    this.punchCooldownFill.style.strokeDasharray = `${CIRCUMFERENCE}`;
    this.punchCooldownFill.style.strokeDashoffset = '0';

    this.startButton.addEventListener('click', (event) => {
      event.stopPropagation();
      callbacks.onStart();
    });

    this.pauseButton.addEventListener('click', (event) => {
      event.stopPropagation();
      callbacks.onPause();
    });

    this.punchButton.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      callbacks.onPunch();
    });

    const resumeButton = this.query<HTMLButtonElement>('.resume-button');
    resumeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      callbacks.onResume();
    });

    this.restartButton = this.query<HTMLButtonElement>('.restart-button');
    this.restartButton.addEventListener('click', (event) => {
      event.stopPropagation();
      callbacks.onRestart();
    });

    this.reviveWatchButton.addEventListener('click', (event) => {
      event.stopPropagation();
      callbacks.onWatchRevive();
    });

    this.endRunButton.addEventListener('click', (event) => {
      event.stopPropagation();
      callbacks.onEndRun();
    });
  }

  setBalance(balance: number, pulse = true): void {
    this.balanceValue.textContent = Math.max(0, Math.round(balance)).toLocaleString('en-IN');

    if (!pulse) return;

    this.balancePill.classList.remove('is-pulsing');
    void this.balancePill.offsetWidth;
    this.balancePill.classList.add('is-pulsing');
    window.clearTimeout(this.balancePulseTimer);
    this.balancePulseTimer = window.setTimeout(() => {
      this.balancePill.classList.remove('is-pulsing');
    }, 240);
  }

  setLevel(level: LevelDefinition): void {
    if (level.index === this.lastLevelIndex) return;
    this.lastLevelIndex = level.index;
    this.levelName.textContent = level.name;
    this.levelZone.textContent = level.zone;
  }

  setProgress(progress: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    if (Math.abs(clamped - this.lastProgress) < 0.001) return;
    this.lastProgress = clamped;

    this.progressFill.style.transform = `scaleX(${clamped})`;
    const percent = Math.floor(clamped * 100);
    this.progressValue.textContent = `${percent}%`;
    this.progressTrack.setAttribute('aria-valuenow', String(percent));
  }

  showHitPenalty(value: number, screenX: number, screenY: number): void {
    let element = this.coinPops[this.coinPopIndex];

    if (!element) {
      element = document.createElement('span');
      element.className = 'coin-pop';
      this.root.appendChild(element);
      this.coinPops.push(element);
    }

    this.coinPopIndex = (this.coinPopIndex + 1) % 8;
    element.textContent = `-${Math.round(value)}`;
    element.style.left = `${screenX}px`;
    element.style.top = `${screenY}px`;
    element.classList.remove('is-active', 'is-hit');
    void element.offsetWidth;
    element.classList.add('is-active', 'is-hit');
  }

  showCoinGain(value: number, screenX: number, screenY: number): void {
    let element = this.coinPops[this.coinPopIndex];

    if (!element) {
      element = document.createElement('span');
      element.className = 'coin-pop';
      this.root.appendChild(element);
      this.coinPops.push(element);
    }

    this.coinPopIndex = (this.coinPopIndex + 1) % 8;
    element.textContent = `+${Math.round(value)}`;
    element.style.left = `${screenX}px`;
    element.style.top = `${screenY}px`;
    element.classList.remove('is-active');
    void element.offsetWidth;
    element.classList.add('is-active');
  }

  showCalculation(text: string, positive: boolean): void {
    this.toast.textContent = text;
    this.toast.classList.remove('is-visible', 'is-positive', 'is-negative');
    this.toast.classList.add(positive ? 'is-positive' : 'is-negative');
    void this.toast.offsetWidth;
    this.toast.classList.add('is-visible');

    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast.classList.remove('is-visible');
    }, 1900);
  }

  setZoneTransition(zoneName: string, active: boolean): void {
    this.zoneTransitionName.textContent = zoneName;
    this.zoneTransition.classList.toggle('is-active', active);
  }

  setPowerUps(states: readonly ActivePowerUpState[]): void {
    const active = new Map(states.map((state) => [state.type, state]));
    for (const type of POWERUP_TYPES) {
      const chip = this.powerupChips.get(type);
      const bar = this.powerupBars.get(type);
      if (!chip || !bar) continue;

      const state = active.get(type);
      if (!state) {
        chip.classList.remove('is-active');
        chip.setAttribute('aria-hidden', 'true');
        continue;
      }

      chip.classList.add('is-active');
      chip.setAttribute('aria-hidden', 'false');
      const ratio =
        state.duration > 0
          ? Math.max(0, Math.min(1, state.remaining / state.duration))
          : 0;
      bar.style.transform = `scaleX(${ratio})`;
      chip.title = `${POWERUP_LABELS[type]} ${state.remaining.toFixed(1)}s`;
    }
  }

  showPowerUp(type: PowerUpType): void {
    this.toast.textContent = POWERUP_LABELS[type];
    this.toast.classList.remove('is-visible', 'is-positive', 'is-negative');
    this.toast.classList.add('is-positive');
    void this.toast.offsetWidth;
    this.toast.classList.add('is-visible');

    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast.classList.remove('is-visible');
    }, 1500);
  }

  showResults(results: RunResults): void {
    this.renderResults(results);
    this.restartButton.hidden = false;
    this.reviveOffer.hidden = true;
    this.reviveWatchButton.hidden = true;
    this.endRunButton.hidden = true;
    this.reviveError.hidden = true;
    this.reviveVideoPanel.hidden = true;
    this.resultsPanel.hidden = false;
    this.root.classList.add('is-finished');
    this.resultsOverlay.hidden = false;
    this.restartButton.focus();
  }

  showRevivePrompt(results: RunResults, canRevive: boolean): void {
    this.renderResults(results);
    this.restartButton.hidden = true;
    this.reviveOffer.hidden = !canRevive;
    this.reviveWatchButton.hidden = !canRevive;
    this.endRunButton.hidden = false;
    this.reviveError.textContent = canRevive
      ? ''
      : 'Your one revive has already been used.';
    this.reviveError.hidden = canRevive;
    this.resultsPanel.hidden = false;
    this.reviveVideoPanel.hidden = true;
    this.resultsOverlay.hidden = false;
    this.root.classList.add('is-finished');
    (canRevive ? this.reviveWatchButton : this.endRunButton).focus();
  }

  private renderResults(results: RunResults): void {
    this.resultsReason.textContent = results.reason;
    this.resultsOverlay.querySelector('[data-result="distance"]')!.textContent =
      `${Math.round(results.distance).toLocaleString('en-IN')} m`;
    this.resultsOverlay.querySelector('[data-result="level"]')!.textContent =
      String(results.level);
    this.resultsOverlay.querySelector('[data-result="coins"]')!.textContent =
      results.coinsCollected.toLocaleString('en-IN');
    this.resultsOverlay.querySelector('[data-result="gates"]')!.textContent =
      String(results.gatesPassed);
    this.resultsOverlay.querySelector('[data-result="enemies"]')!.textContent =
      String(results.enemiesDefeated);
    this.resultsOverlay.querySelector('[data-result="balance"]')!.textContent =
      results.finalBalance.toLocaleString('en-IN');
  }

  playReviveVideo(): boolean {
    if (this.activeVideoProvider) return false;

    this.reviveError.hidden = true;
    this.resultsPanel.hidden = true;
    this.reviveVideoPanel.hidden = false;
    this.reviveVideoProgress.setAttribute('aria-valuenow', '0');
    this.reviveVideoProgressFill.style.transform = 'scaleX(0)';
    this.reviveVideoCountdown.textContent = 'Loading video...';
    this.reviveVideoPanel.focus();

    const video = this.reviveVideo as ReviveVideoElement;
    this.activeVideoProvider = new LocalDemoVideoProvider(video, {
      onProgress: (currentTime, duration) => {
        if (!Number.isFinite(duration) || duration <= 0) {
          this.reviveVideoCountdown.textContent = 'Loading video...';
          return;
        }

        const ratio = Math.max(0, Math.min(1, currentTime / duration));
        const percent = Math.floor(ratio * 100);
        const remaining = Math.max(0, Math.ceil(duration - currentTime));
        this.reviveVideoProgressFill.style.transform = `scaleX(${ratio})`;
        this.reviveVideoProgress.setAttribute('aria-valuenow', String(percent));
        this.reviveVideoCountdown.textContent = `${remaining}s remaining`;
      },
      onComplete: () => {
        this.activeVideoProvider = null;
        this.reviveVideoPanel.hidden = true;
        this.callbacks.onReviveComplete();
      },
      onFailure: (message) => {
        this.activeVideoProvider = null;
        this.reviveVideoPanel.hidden = true;
        this.resultsPanel.hidden = false;
        this.reviveOffer.hidden = true;
        this.reviveWatchButton.hidden = true;
        this.reviveError.textContent = message;
        this.reviveError.hidden = false;
        this.endRunButton.focus();
        this.callbacks.onReviveFailure();
      },
    });
    this.activeVideoProvider.start();
    return true;
  }

  interruptReviveVideo(): void {
    this.activeVideoProvider?.interrupt();
  }

  hideResults(): void {
    this.activeVideoProvider?.dispose();
    this.activeVideoProvider = null;
    this.reviveVideoPanel.hidden = true;
    this.resultsOverlay.hidden = true;
    this.root.classList.remove('is-finished');
  }

  flashHit(): void {
    this.root.classList.remove('is-hit-flash');
    void this.root.offsetWidth;
    this.root.classList.add('is-hit-flash');
  }

  setPaused(paused: boolean): void {
    this.pauseOverlay.hidden = !paused;
    this.root.classList.toggle('is-paused', paused);
    this.pauseButton.setAttribute('aria-label', paused ? 'Game paused' : 'Pause game');
  }

  beginRun(): void {
    this.startPrompt.hidden = true;
    this.pauseButton.disabled = false;
    this.punchButton.disabled = false;
    this.root.classList.add('is-started');

    if (this.tutorialComplete) return;

    window.clearTimeout(this.tutorialHideTimer);
    this.tutorialHint.hidden = false;
    this.tutorialHint.classList.add('is-visible');
    this.tutorialHint.setAttribute('aria-hidden', 'false');
    window.clearTimeout(this.tutorialTimer);
    this.tutorialTimer = window.setTimeout(() => {
      this.dismissTutorial();
    }, TUTORIAL_DURATION_MS);
  }

  dismissTutorial(): void {
    if (
      this.tutorialComplete ||
      !this.tutorialHint.classList.contains('is-visible')
    ) {
      return;
    }

    this.tutorialComplete = true;
    window.clearTimeout(this.tutorialTimer);
    this.tutorialTimer = 0;
    this.tutorialHint.classList.remove('is-visible');
    this.tutorialHint.setAttribute('aria-hidden', 'true');
    this.tutorialHideTimer = window.setTimeout(() => {
      this.tutorialHint.hidden = true;
    }, TUTORIAL_FADE_MS);
    rememberTutorialCompleted();
  }

  /**
   * Update the Punch button cooldown ring.
   * @param ratio  0 = ready, 1 = just punched (full cooldown).
   */
  setPunchCooldown(ratio: number): void {
    const clamped = Math.max(0, Math.min(1, ratio));
    const readinessChanged = (clamped === 0) !== (this.lastCooldownRatio === 0);
    if (Math.abs(clamped - this.lastCooldownRatio) < 0.01 && !readinessChanged) return;
    this.lastCooldownRatio = clamped;

    const CIRCUMFERENCE = 2 * Math.PI * 18;
    this.punchCooldownFill.style.strokeDashoffset = String(
      CIRCUMFERENCE * (1 - clamped),
    );
    this.punchButton.classList.toggle('is-ready', clamped === 0);
    this.punchButton.disabled = clamped > 0;
  }

  /** Show a floating reward amount at a screen position (enemy defeated). */
  showEnemyReward(value: number, screenX: number, screenY: number): void {
    let element = this.coinPops[this.coinPopIndex];

    if (!element) {
      element = document.createElement('span');
      element.className = 'coin-pop';
      this.root.appendChild(element);
      this.coinPops.push(element);
    }

    this.coinPopIndex = (this.coinPopIndex + 1) % 8;
    element.textContent = `+${Math.round(value)}`;
    element.style.left = `${screenX}px`;
    element.style.top = `${screenY}px`;
    element.classList.remove('is-active', 'is-hit', 'is-reward');
    void element.offsetWidth;
    element.classList.add('is-active', 'is-reward');
  }

  private buildPowerUpChips(): void {
    for (const type of POWERUP_TYPES) {
      const chip = document.createElement('div');
      chip.className = 'powerup-chip';
      chip.dataset.powerup = type;
      chip.setAttribute('aria-hidden', 'true');

      const label = document.createElement('span');
      label.className = 'powerup-label';
      label.textContent = POWERUP_LABELS[type];

      const track = document.createElement('span');
      track.className = 'powerup-track';
      const bar = document.createElement('span');
      bar.className = 'powerup-bar';
      track.appendChild(bar);

      chip.append(label, track);
      this.powerupStrip.appendChild(chip);
      this.powerupChips.set(type, chip);
      this.powerupBars.set(type, bar);
    }
  }

  dispose(): void {
    this.activeVideoProvider?.dispose();
    this.activeVideoProvider = null;
    window.clearTimeout(this.toastTimer);
    window.clearTimeout(this.balancePulseTimer);
    window.clearTimeout(this.tutorialTimer);
    window.clearTimeout(this.tutorialHideTimer);
    this.root.remove();
  }

  private query<T extends HTMLElement = HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) {
      throw new Error(`HUD element not found: ${selector}`);
    }
    return element;
  }
}
