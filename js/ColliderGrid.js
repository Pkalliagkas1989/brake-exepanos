// Uniform grid broadphase for brick lookup near the ball (reduces checks).
export class ColliderGrid {
  constructor() {
    this.cols = 0;
    this.rows = 0;
    this.cellW = 64;
    this.cellH = 24;
    this.width = 0;
    this.height = 0;
    this.cells = []; // Array<Brick[]>
  }

  build(bricks, boardW, boardH) {
    if (!bricks.length) { this.cells = []; return; }

    // Estimate cell size from first brick (keeps indices tight)
    const b0 = bricks[0].rect;
    this.cellW = Math.max(24, Math.floor(b0.w));
    this.cellH = Math.max(16, Math.floor(b0.h));

    this.width = boardW;
    this.height = boardH;

    this.cols = Math.max(1, Math.ceil(boardW / this.cellW));
    this.rows = Math.max(1, Math.ceil(boardH / this.cellH));
    this.cells = Array.from({ length: this.cols * this.rows }, () => []);

    for (const b of bricks) this._insert(b);
  }

  _insert(brick) {
    const { x, y, w, h } = brick.rect;
    const c0 = Math.floor(x / this.cellW);
    const r0 = Math.floor(y / this.cellH);
    const c1 = Math.floor((x + w) / this.cellW);
    const r1 = Math.floor((y + h) / this.cellH);

    for (let r = Math.max(0, r0); r <= Math.min(this.rows - 1, r1); r++) {
      for (let c = Math.max(0, c0); c <= Math.min(this.cols - 1, c1); c++) {
        this.cells[r * this.cols + c].push(brick);
      }
    }
  }

  remove(brick) {
    for (const cell of this.cells) {
      const idx = cell.indexOf(brick);
      if (idx !== -1) cell.splice(idx, 1);
    }
  }

  queryCircle(cx, cy, cr) {
    if (!this.cells.length) return [];
    const x0 = cx - cr, y0 = cy - cr, x1 = cx + cr, y1 = cy + cr;
    const c0 = Math.max(0, Math.floor(x0 / this.cellW));
    const r0 = Math.max(0, Math.floor(y0 / this.cellH));
    const c1 = Math.min(this.cols - 1, Math.floor(x1 / this.cellW));
    const r1 = Math.min(this.rows - 1, Math.floor(y1 / this.cellH));

    const out = [];
    const seen = new Set();
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const cell = this.cells[r * this.cols + c];
        for (const b of cell) {
          if (!b.alive) continue;
          if (!seen.has(b)) { seen.add(b); out.push(b); }
        }
      }
    }
    return out;
  }
}
