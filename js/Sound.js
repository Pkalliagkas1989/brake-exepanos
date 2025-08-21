// WebAudio SFX with procedural buffers (no external assets).
import { Settings } from './Settings.js';

export class Sound {
  constructor() {
    this.enabled = true;
    const AC = window.AudioContext || window.webkitAudioContext;
    this._ctx = AC ? new AC() : null;
    this._gain = this._ctx ? this._ctx.createGain() : null;
    if (this._gain && this._ctx) {
      this._gain.connect(this._ctx.destination);
      this.setVolume(Settings.load().sfxVolume);
    }

    // Pre-generate simple effects
    this._buffers = {};
    if (this._ctx) {
      this._buffers.bounce = this._tone(700, 0.05, 'sine');
      this._buffers.break  = this._noise(0.06);
      this._buffers.life   = this._noise(0.18);
      this._buffers.ui     = this._tone(440, 0.08, 'triangle');
    }

    // Suspend/resume on visibility change (saves power)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this._ctx?.state === 'running') this._ctx.suspend().catch(()=>{});
      if (!document.hidden && this._ctx?.state === 'suspended') this._ctx.resume().catch(()=>{});
    });
  }

  setVolume(v) { if (this._gain) this._gain.gain.value = Math.max(0, Math.min(1, v)); }

  // Play a named buffer; attempt resume if context is suspended
  async play(name) {
    if (!this.enabled) return;
    const settings = Settings.load();
    this.setVolume(settings.sfxVolume);
    if (!this._ctx || !this._buffers[name]) return;

    try {
      if (this._ctx.state === 'suspended') {
        await this._ctx.resume().catch(()=>{});
      }
      const src = this._ctx.createBufferSource();
      src.buffer = this._buffers[name];
      src.connect(this._gain);
      src.start(0);
    } catch {}
  }

  // Simple tone with exponential decay
  _tone(freq, seconds, type='sine') {
    const sr = this._ctx.sampleRate;
    const len = Math.floor(sr * seconds);
    const buf = this._ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    let phase = 0, inc = (2*Math.PI*freq)/sr;
    for (let i=0;i<len;i++) {
      const t = i/len;
      const env = Math.exp(-6*t);
      let v=0;
      if (type==='sine') v = Math.sin(phase);
      else if (type==='triangle') v = 2*Math.asin(Math.sin(phase))/Math.PI;
      data[i] = v * env * 0.6;
      phase += inc;
    }
    return buf;
  }

  // White noise with fast decay
  _noise(seconds) {
    const sr = this._ctx.sampleRate;
    const len = Math.floor(sr * seconds);
    const buf = this._ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i=0;i<len;i++) {
      const t = i/len;
      const env = Math.exp(-5*t);
      data[i] = (Math.random()*2-1) * env * 0.8;
    }
    return buf;
  }
}
