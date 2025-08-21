// Entry-point: rAF-driven loop with fixed-step simulation at 120 Hz.
import { Game } from './Game.js';

const game = new Game();

let last = performance.now();
let acc = 0;
const STEP = 1000 / 120; // 120 Hz sim step (in ms)
const MAX_STEPS = 3; // Cap sim steps per frame to avoid huge catch-ups

function loop(now) {
  const frameDt = Math.min(100, now - last);
  last = now;
  acc += frameDt;

  // Run the sim in fixed steps, but cap iterations to avoid long hitches
  let steps = 0;
  while (acc >= STEP && steps < MAX_STEPS) {
    game.simulate(STEP);
    acc -= STEP;
    steps++;
  }
  if (acc >= STEP) {
    const skipped = Math.floor(acc / STEP);
    console.warn(`Skipping ${skipped} simulation steps to catch up`);
    acc = 0; // Drop remaining backlog
  }

  // Render once per rAF
  game.render(now);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
