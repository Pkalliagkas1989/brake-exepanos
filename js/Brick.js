// Brick: supports hp, moving bricks (vx/vy), and types (unbreakable / regrow / damaging).
export class Brick {
  constructor(node, x, y, w = 80, h = 24, opts = {}) {
    this.node = node;
    this.rect = { x, y, w, h };
    this.type = opts.type ?? 'normal';
    this.hp   = opts.hp ?? 1;
    this.vx   = opts.vx ?? 0;   // for moving bricks
    this.vy   = opts.vy ?? 0;
    this.alive = true;

    // Visual overrides (optional)
    if (opts.background) this.node.style.background = opts.background;
    if (opts.shadowOff) this.node.style.boxShadow = 'none';

    this.render();
  }

  // Moving bricks bounce inside top play area
  tick(dt, game) {
    if (!this.alive) return;
    if (this.vx || this.vy) {
      this.rect.x += this.vx * dt;
      this.rect.y += this.vy * dt;
      const topPad = 28;
      if (this.rect.x <= 0 || this.rect.x + this.rect.w >= game.width) this.vx *= -1;
      if (this.rect.y <= topPad || this.rect.y + this.rect.h >= game.height * 0.75) this.vy *= -1;
      this.render();
    }
  }

  // Returns true if destroyed on this hit
  hit() {
    if (this.type === 'unbreakable') return false;
    this.hp--;
    if (this.hp <= 0) { return true; }
    this.node.style.filter = 'brightness(0.85)'; // small damaged tint
    return false;
  }

  render() {
    this.node.style.transform = `translate3d(${this.rect.x}px, ${this.rect.y}px, 0)`;
  }

  destroy() {
    if (!this.alive) return;
    this.alive = false;
    this.node.remove();
  }
}
