// Ball: transform-only movement, step-splitting to reduce tunneling, paddle/brick collisions.
export class Ball {
  constructor(node, game) {
    this.node = node;
    this.g = game;
    this.r = 7;

    this.baseSpeed = 0.45;  // px/ms baseline
    this.speedMul = 1.0;    // set per level
    this.maxSpeed = 1.25;   // safety cap
    this.minAngle = 0.2;    // avoid too-flat bounces
    this.disabled = false;

    this.resetToPaddle(this.g.paddle);
  }

  setSpeedMultiplier(mul) { this.speedMul = mul; }
  get speedPxPerMs() { return Math.min(this.baseSpeed * this.speedMul, this.maxSpeed); }

  // Slight speed up (used by Level09)
  boostSpeedBy(factor) {
    this.speedMul *= factor;
    const s = this.speedPxPerMs;
    const dir = Math.atan2(this.vy, this.vx);
    this.vx = Math.cos(dir) * s;
    this.vy = Math.sin(dir) * s;
  }

  resetToPaddle(paddle) {
    this.disabled = false;
    this.x = paddle.x + paddle.w / 2;
    this.y = paddle.y - 18;
    const s = this.speedPxPerMs;
    const dir = Math.random() < 0.5 ? -1 : 1;
    this.vx = dir * s * 0.8;
    this.vy = -s;
    this.render();
  }

  nudgeInsideBounds() {
    this.x = Math.max(this.r, Math.min(this.x, this.g.width - this.r));
    this.y = Math.max(this.r, Math.min(this.y, this.g.height - this.r));
    this.render();
  }

  update(dt, paddle) {
    if (this.disabled) return;

    // Step-split if dt is big (reduces tunneling at high speeds)
    const maxStep = 12; // ms
    let remaining = dt;
    while (remaining > 0) {
      const step = Math.min(maxStep, remaining);
      this._integrate(step, paddle);
      remaining -= step;
      if (this.disabled) break;
    }

    this.render();
  }

  _integrate(dt, paddle) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Walls
    if (this.x <= this.r) { this.x = this.r; this.vx *= -1; this.g.sound.play('bounce'); }
    if (this.x >= this.g.width - this.r) { this.x = this.g.width - this.r; this.vx *= -1; this.g.sound.play('bounce'); }
    if (this.y <= this.r) { this.y = this.r; this.vy *= -1; this.g.sound.play('bounce'); }

    // Bottom (lose life)
    if (this.y > this.g.height + this.r) {
      this.disabled = true;
      this.g.loseLife();
      return;
    }

    // Paddle collision (circle vs rect)
    const pr = paddle.rect();
    if (this._intersectRectCircle(pr)) {
      this.y = pr.y - this.r - 0.01;
      this.vy = -Math.abs(this.vy);

      const hit = (this.x - (pr.x + pr.w / 2)) / (pr.w / 2); // -1..1
      const s = Math.hypot(this.vx, this.vy) || this.speedPxPerMs;
      const angle = hit * 0.7;
      this.vx = s * Math.sin(angle);
      this.vy = -s * Math.cos(angle);
      this._enforceAngle();
      this.g.sound.play('bounce');
    }

    // Brick collisions via grid broadphase
    const candidates = this.g.grid?.queryCircle(this.x, this.y, this.r) ?? this.g.bricks;
    for (let i = 0; i < candidates.length; i++) {
      const b = candidates[i];
      if (!b.alive) continue;
      const r = b.rect;
      if (!this._intersectRectCircle(r)) continue;

      const side = this._collisionSide(r);
      if (side === 'left' || side === 'right') this.vx *= -1;
      else this.vy *= -1;

      // Damage brick; remove if dead
      const destroyed = b.hit(this.g);
      if (destroyed) {
        b.destroy();
        this.g.grid?.remove(b);
        const idx = this.g.bricks.indexOf(b);
        if (idx !== -1) this.g.bricks.splice(idx, 1);
        this.g.addScore(10);
      }
      // Level hook (fires on any hit)
      this.g.script?.onHitBrick?.(b, this.g, this, destroyed);
      this.g.sound.play('break');
      break;
    }

    // Boss collision (circle vs boss rect)
    if (this.g._boss) {
      const br = this.g._boss.rect();
      if (this._intersectRectCircle(br)) {
        // Simple reflect up and damage boss
        this.vy = -Math.abs(this.vy);
        this.y = br.y - this.r - 0.01;
        this.g._boss.hit();
        this.g.sound.play('break');
      }
    }
  }

  _enforceAngle() {
    const s = Math.hypot(this.vx, this.vy);
    const angle = Math.asin(Math.abs(this.vx) / s);
    const min = this.minAngle;
    if (angle < min) {
      const signX = Math.sign(this.vx) || 1;
      const sNew = s || this.speedPxPerMs;
      this.vx = Math.sin(min) * sNew * signX;
      this.vy = -Math.abs(Math.cos(min) * sNew);
    }
  }

  _intersectRectCircle(r) {
    const cx = this.x, cy = this.y, cr = this.r;
    const nearestX = Math.max(r.x, Math.min(cx, r.x + r.w));
    const nearestY = Math.max(r.y, Math.min(cy, r.y + r.h));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return (dx*dx + dy*dy) <= cr*cr;
  }

  _collisionSide(r) {
    const cx = this.x, cy = this.y;
    const dxLeft = Math.abs(r.x - cx);
    const dxRight = Math.abs((r.x + r.w) - cx);
    const dyTop = Math.abs(r.y - cy);
    const dyBottom = Math.abs((r.y + r.h) - cy);
    const min = Math.min(dxLeft, dxRight, dyTop, dyBottom);
    if (min === dxLeft) return 'left';
    if (min === dxRight) return 'right';
    if (min === dyTop) return 'top';
    return 'bottom';
  }

  render() {
    this.node.style.transform = `translate3d(${this.x - this.r}px, ${this.y - this.r}px, 0)`;
  }
}
