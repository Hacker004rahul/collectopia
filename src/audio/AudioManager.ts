type AudioContextConstructor = new () => AudioContext;

export class AudioManager {
  private context: AudioContext | null = null;

  unlock(): void {
    if (!this.context) {
      const audioWindow = window as Window & {
        webkitAudioContext?: AudioContextConstructor;
      };
      const Constructor = window.AudioContext ?? audioWindow.webkitAudioContext;
      if (!Constructor) return;
      this.context = new Constructor();
    }

    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
  }

  coin(): void {
    this.tone(880, 0.07, 'triangle', 0.14);
    this.tone(1320, 0.1, 'triangle', 0.1, 0.055);
  }

  gate(positive: boolean): void {
    const notes = positive ? [523.25, 659.25, 783.99] : [392, 329.63, 261.63];
    notes.forEach((frequency, index) => {
      this.tone(frequency, 0.16, 'sine', 0.1, index * 0.07);
    });
  }

  levelUp(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      this.tone(frequency, 0.18, 'sine', 0.09, index * 0.08);
    });
  }

  hit(): void {
    this.tone(180, 0.18, 'sawtooth', 0.22);
    this.tone(120, 0.28, 'sawtooth', 0.18, 0.06);
  }

  /** Player's punch lands on an enemy. */
  punchHit(): void {
    this.tone(260, 0.06, 'square', 0.28);
    this.tone(180, 0.1, 'sawtooth', 0.2, 0.04);
    this.tone(440, 0.08, 'triangle', 0.14, 0.06);
  }

  /** Player punches but misses (no enemy in range). */
  punchMiss(): void {
    this.tone(220, 0.08, 'triangle', 0.1);
  }

  /** Enemy successfully damages the player. */
  enemyHit(): void {
    this.tone(160, 0.22, 'sawtooth', 0.26);
    this.tone(100, 0.3, 'sawtooth', 0.2, 0.08);
  }

  /** Enemy defeated — brief fanfare. */
  enemyDefeated(): void {
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      this.tone(freq, 0.14, 'triangle', 0.16, i * 0.055);
    });
  }

  powerUp(): void {
    [659.25, 880, 1174.66].forEach((freq, i) => {
      this.tone(freq, 0.14, 'sine', 0.14, i * 0.055);
    });
    this.tone(1318.5, 0.18, 'triangle', 0.1, 0.14);
  }

  shieldBlock(): void {
    this.tone(520, 0.08, 'square', 0.16);
    this.tone(780, 0.16, 'sine', 0.12, 0.04);
  }

  obstacleBreak(): void {
    this.tone(140, 0.12, 'sawtooth', 0.2);
    this.tone(95, 0.2, 'square', 0.16, 0.04);
  }

  gameOver(): void {
    [392, 329.63, 261.63, 196].forEach((freq, i) => {
      this.tone(freq, 0.28, 'triangle', 0.16, i * 0.12);
    });
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
  ): void {
    const context = this.context;
    if (!context || context.state !== 'running') return;

    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
}
