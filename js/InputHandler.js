// Keyboard handler: continuous key states, pause toggle, and scroll prevention.
export class InputHandler {
  constructor() {
    this.left = false;
    this.right = false;
    this.paused = false;
    this.inverted = false;

    // Prevent default browser actions for game keys
    const preventKeys = ['ArrowLeft', 'ArrowRight', ' ', 'Escape', 'Enter'];
    const prevent = e => { if (preventKeys.includes(e.key)) e.preventDefault(); };

    // Track keydown/up as on/off states (smooth controls)
    const onKey = e => {
      const down = e.type === 'keydown';
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.left = down;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.right = down;

      if (down && !e.repeat && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape')) {
        this.paused = !this.paused;
      }
    };

    document.addEventListener('keydown', onKey, { passive: false });
    document.addEventListener('keyup', onKey,   { passive: false });
    document.addEventListener('keydown', prevent, { passive: false });
  }
}
