// HUD + overlays: score, lives, timer, performance counters, pause/gameover screens.
import { Settings } from './Settings.js';

export class UI {
  constructor() {
    // HUD nodes
    this.scoreN = document.getElementById('score');
    this.livesN = document.getElementById('lives');
    this.timerN = document.getElementById('timer');
    this.fpsN   = document.getElementById('fps');
    this.dropsN = document.getElementById('drops');

    // Overlays + buttons
    this.overlayPause = document.getElementById('overlay-pause');
    this.overlayGameOver = document.getElementById('overlay-gameover');
    this.btnRetry = document.getElementById('btn-retry');
    this.btnExit  = document.getElementById('btn-exit');
    this.btnPauseContinue = document.getElementById('btn-continue');
    this.btnPauseRestart  = document.getElementById('btn-restart');

    // Settings controls
    this.sfxVolume = document.getElementById('sfxVolume');
    this.effectsMode = document.getElementById('effectsMode');
    this.reducedMotion = document.getElementById('reducedMotion');

    // Perf counters
    this.start = performance.now();
    this._lastTs = performance.now();
    this._fpsEMA = 0; this._alpha = 0.2;
    this._dropsTotal = 0; this._dropsWindow = 0; this._dropsPerSec = 0;
    this._lastWindowTs = performance.now();

    // HUD change caches (avoid unnecessary DOM writes)
    this._lastScore = null;
    this._lastLives = null;
    this._lastTimerSec = null;
    this._lastFpsRender = 0;

    // Load settings into UI controls
    const s = Settings.load();
    if (this.sfxVolume) this.sfxVolume.value = String(s.sfxVolume);
    if (this.effectsMode) this.effectsMode.value = s.effects;
    if (this.reducedMotion) this.reducedMotion.checked = !!s.reducedMotion;

    this.sfxVolume?.addEventListener('input', () => this._persist());
    this.effectsMode?.addEventListener('change', () => this._persist());
    this.reducedMotion?.addEventListener('change', () => this._persist());
  }

  resetTimer(){ this.start = performance.now(); this._lastTimerSec = null; }

  _persist() {
    Settings.save({
      sfxVolume: Number(this.sfxVolume?.value ?? 0.6),
      effects: this.effectsMode?.value ?? 'auto',
      reducedMotion: !!this.reducedMotion?.checked,
    });
  }

  getSettings() { return Settings.load(); }

  // Button hooks
  onRetry(h){ this.btnRetry?.addEventListener('click', h); }
  onExit(h){ this.btnExit?.addEventListener('click', h); }
  onPauseContinue(h){ this.btnPauseContinue?.addEventListener('click', h); }
  onPauseRestart(h){ this.btnPauseRestart?.addEventListener('click', h); }

  // HUD updates (only mutate when values change)
  updateScore(v){
    if (v !== this._lastScore) {
      this._lastScore = v;
      this.scoreN.textContent = `Score: ${v}`;
    }
  }
  updateLives(v){
    if (v !== this._lastLives) {
      this._lastLives = v;
      this.livesN.textContent = `Lives: ${v}`;
    }
  }
  updateTimer(){
    const s = Math.floor((performance.now() - this.start) / 1000);
    if (s !== this._lastTimerSec) {
      this._lastTimerSec = s;
      this.timerN.textContent = `Time: ${s}s`;
    }
  }

  // Overlays
  showPause(){ this.overlayPause.classList.add('show'); this.overlayPause.setAttribute('aria-hidden','false'); }
  hidePause(){ this.overlayPause.classList.remove('show'); this.overlayPause.setAttribute('aria-hidden','true'); }
  showGameOver(){ this.overlayGameOver.classList.add('show'); this.overlayGameOver.setAttribute('aria-hidden','false'); }
  hideGameOver(){ this.overlayGameOver.classList.remove('show'); this.overlayGameOver.setAttribute('aria-hidden','true'); }

  // Performance HUD (EMA FPS + drop counter)
  updateFPS(ts, ignoreDrops = false){
    const dt = ts - this._lastTs;
    this._lastTs = ts;
    if (dt <= 0) return;

    const inst = 1000 / dt;
    this._fpsEMA = this._fpsEMA ? (this._alpha*inst + (1-this._alpha)*this._fpsEMA) : inst;

    // Update FPS text ~5x/sec to avoid churn
    if (ts - this._lastFpsRender > 200) {
      this._lastFpsRender = ts;
      if (this.fpsN) this.fpsN.textContent = `FPS: ${Math.round(this._fpsEMA)}`;
    }

    // Do not record drops if paused/hidden
    const shouldCount = !ignoreDrops && !document.hidden;
    if (shouldCount && dt > 19) { this._dropsTotal++; this._dropsWindow++; }

    const now = ts;
    if (this.dropsN && now - (this._lastDropRender ?? 0) > 200) {
      this._lastDropRender = now;
      this.dropsN.textContent = `Drops: ${this._dropsTotal} (+${this._dropsWindow}/s)`;
    }
    if (shouldCount && now - this._lastWindowTs >= 1000) {
      this._dropsPerSec = this._dropsWindow;
      this._dropsWindow = 0;
      this._lastWindowTs = now;
    }
  }

  getDropsPerSec() { return this._dropsPerSec; }
}
