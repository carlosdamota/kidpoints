/**
 * Utility to generate droid-like sounds using Web Audio API
 */

class DroidSounds {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private playNote(freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Add a little frequency slide for that "chirp" effect
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + duration);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  public playTaskComplete() {
    const ctx = this.init();
    const now = ctx.currentTime;
    
    // Quick "bip-bip-boop"
    this.playNote(880, now, 0.1, 'sine');
    this.playNote(1100, now + 0.1, 0.1, 'sine');
    this.playNote(1320, now + 0.2, 0.2, 'square', 0.05);
  }

  public playRewardRedeem() {
    const ctx = this.init();
    const now = ctx.currentTime;
    
    // Happy droid whistle sequence
    const notes = [660, 880, 1100, 1320, 1100, 1500];
    notes.forEach((freq, i) => {
      this.playNote(freq, now + i * 0.12, 0.1, i % 2 === 0 ? 'sine' : 'triangle');
    });
    
    // Final long happy note
    this.playNote(1760, now + notes.length * 0.12, 0.5, 'sine', 0.08);
  }

  public playError() {
    const ctx = this.init();
    const now = ctx.currentTime;
    // Sad droid "womp womp"
    this.playNote(220, now, 0.3, 'sawtooth', 0.05);
    this.playNote(110, now + 0.2, 0.5, 'sawtooth', 0.05);
  }
}

export const droidSounds = new DroidSounds();
