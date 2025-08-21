import { buildPattern } from './helpers.js';

export function Recompiler() {
  return {
    name: 'Recompiler',
    theme: '',
    message: 'Controls re-mapped…',
    speedMul: 1.4,
    createBricks(game) {
      const rows = 9, cols = 14;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c)=> ((r + c) % 2 === 0),
        ()=> `linear-gradient(180deg, #cccccc, #666666)`,
        ()=> ({})
      );
    },
    onEnter(game){ game.input.inverted = true; game.story.show('Controls inverted!', 1200); },
    onExit(game){ game.input.inverted = false; },
    onUpdate(){},
  };
}
