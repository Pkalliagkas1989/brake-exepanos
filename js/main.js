// Entry-point: rAF-driven loop with fixed-step simulation at 120 Hz.
import { Game } from './Game.js';

const game = new Game();

let last = performance.now();
let acc = 0;
const STEP = 1000 / 120; // 120 Hz sim step (in ms)

function loop(now) {
  const frameDt = Math.min(100, now - last);
  last = now;
  acc += frameDt;

  // Run the sim in fixed steps, catch up if needed
  while (acc >= STEP) {
    game.simulate(STEP);
    acc -= STEP;
  }

  // Render once per rAF
  game.render(now);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
