// LocalStorage-backed settings with defaults + safe load/save.
export const Settings = {
  _k: 'breakout.exe.settings.v1',
  _d: { sfxVolume: 0.6, effects: 'auto', reducedMotion: false },

  load() {
    try {
      const raw = localStorage.getItem(this._k);
      return raw ? { ...this._d, ...JSON.parse(raw) } : { ...this._d };
    } catch {
      return { ...this._d };
    }
  },

  save(s) {
    try { localStorage.setItem(this._k, JSON.stringify(s)); } catch {}
  }
};
