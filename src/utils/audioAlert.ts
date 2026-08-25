/**
 * Web Audio API synthesizer for flood sirens and notification chimes.
 * Generates alert frequencies in real-time without external audio files.
 */

class SoundAlertManager {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private soundEnabled = true;

  private initCtx() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Subtle friendly notification chime for normal updates
   */
  public playChime() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, this.audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Dual-tone Emergency Flood Warning Siren for HIGH / SEVERE risk
   */
  public playEmergencySiren(durationSeconds = 2.5) {
    if (!this.soundEnabled || this.isPlaying) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      this.isPlaying = true;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      
      // Siren frequency modulation (wailing frequency 480Hz <-> 820Hz)
      const cycles = Math.floor(durationSeconds * 2);
      for (let i = 0; i < cycles; i++) {
        const t = now + i * 0.5;
        osc.frequency.setValueAtTime(460, t);
        osc.frequency.linearRampToValueAtTime(850, t + 0.25);
        osc.frequency.linearRampToValueAtTime(460, t + 0.5);
      }

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.2, now + durationSeconds - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      setTimeout(() => {
        this.isPlaying = false;
      }, durationSeconds * 1000);
    } catch {
      this.isPlaying = false;
    }
  }

  /**
   * Trigger mobile haptic vibration if supported
   */
  public triggerVibration(pattern: number[] = [300, 100, 300, 100, 500]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptics failure
      }
    }
  }
}

export const soundManager = new SoundAlertManager();
