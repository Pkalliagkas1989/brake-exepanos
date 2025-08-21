import { buildPattern } from './helpers.js';

export function BootSector() {
  return {
    name: 'Boot Sector',
    theme: 'theme-crt',
    message: 'Tracing boot sequence…',
    speedMul: 1.0,
    createBricks(game) {
      const rows = 9, cols = 14;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c)=> ((r + Math.floor(c / 2)) % 2 === 0),
        ()=> `linear-gradient(180deg, #2EE6A6, #1BD6C4)`,
        ()=> ({})
      );
    },
    onEnter(game){ game.story.show('Use arrows / A–D to move'); },
    onUpdate(){},
    onExit(){},
  };
}
