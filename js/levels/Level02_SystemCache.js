import { buildPattern } from './helpers.js';

export function SystemCache() {
  return {
    name: 'System Cache',
    theme: '',
    message: 'Memory fragments drifting…',
    speedMul: 1.1,
    createBricks(game) {
      const rows = 10, cols = 16;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c)=> (r>0) && !((r % 3 === 1) && (c % 4 === 2)),
        ()=> `linear-gradient(180deg, #00e5ff, #00a6c8)`,
        ()=> ({ vx: ((Math.random()*2-1)*0.02), vy: ((Math.random()*2-1)*0.02) })
      );
    },
    onEnter(game){ game.story.show('Cache lines unstable…', 1200); },
    onUpdate(){},
    onExit(){},
  };
}
