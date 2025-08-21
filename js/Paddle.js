// Paddle: bounded to board; accel smoothing for premium feel.
export class Paddle {
  constructor(node, game) {
    this.node = node;
    this.g = game;
    this.w = 120;
    this.h = 16;

    this.baseSpeed = 0.7;   // px/ms baseline
    this.speedMul = 1.0;    // set per level
    this.accel = 0.003;     // acceleration factor
    this.velX = 0;

    this.x = (this.g.width - this.w) / 2;
    this.y = this.g.height - 40;
    this._debuffUntil = 0;  // wall-clock time (ms) when debuff ends

    this.render();
  }

  setSpeedMultiplier(mul) { this.speedMul = mul; }

  // Temporarily shrink width (e.g., on hazards)
  debuffWidthFor(ms) {
    const end = performance.now() + ms;
    this._debuffUntil = Math.max(this._debuffUntil, end);
  }

  update(dt, input) {
    // Handle width debuff expiry
    if (this._debuffUntil && performance.now() > this._debuffUntil) {
      this._debuffUntil = 0;
      this.w = 120;
    }

    const invert = input.inverted ? -1 : 1;
    const target = invert * ((input.left ? -1 : 0) + (input.right ? 1 : 0));
    const maxV = this.baseSpeed * this.speedMul;

    const want = target * maxV;
    const sign = Math.sign(want - this.velX);
    const deltaV = this.accel * dt * 60;
    if (Math.abs(want - this.velX) <= deltaV) this.velX = want;
    else this.velX += deltaV * sign;

    if (this.velX !== 0) {
      this.x += this.velX * dt;
      this.clamp();
      this.render();
    }
  }

  clamp() {
    this.x = Math.max(0, Math.min(this.x, this.g.width - this.w));
    this.y = this.g.height - 40;
  }

  render() {
    this.node.style.width = this.w + 'px';
    this.node.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
  }

  rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
}
