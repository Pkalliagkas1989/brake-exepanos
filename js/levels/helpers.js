// Helper to build a patterned grid of bricks with per-cell style/opts.
import { Brick } from '../Brick.js';

export function buildPattern(container, game, rows, cols, shouldPlace, styleAt, optsAt) {
  const topPadding = 28;
  const usableH = Math.floor(game.height * 0.75);
  const usableW = game.width;

  const gap = 6;
  const bw = Math.floor((usableW - (cols - 1) * gap) / cols);
  const bh = Math.floor((usableH - (rows - 1) * gap) / rows);

  const bricks = [];
  const frag = document.createDocumentFragment();
  const tpl = document.getElementById('tpl-brick');

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!shouldPlace(r, c, rows, cols)) continue;
      const x = c * (bw + gap);
      const y = topPadding + r * (bh + gap);
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.style.width = bw + 'px';
      node.style.height = bh + 'px';
      const bg = styleAt?.(r, c);
      if (bg) node.style.background = bg;
      frag.appendChild(node);

      const opts = optsAt?.(r, c) ?? {};
      const b = new Brick(node, x, y, bw, bh, opts);
      bricks.push(b);
    }
  }
  container.appendChild(frag);
  return bricks;
}
