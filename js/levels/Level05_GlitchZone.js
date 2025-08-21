import { buildPattern } from './helpers.js';

export function GlitchZone() {
  return {
    name: 'Glitch Zone',
    theme: 'theme-glitch',
    message: 'Visual artifacts intensifying…',
    speedMul: 1.3,
    createBricks(game) {
      const rows = 12, cols = 20;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c,R,C)=> {
          const border = r === 0 || c === 0 || r === R - 1 || c === C - 1;
          const inner = (r > 2 && r < R - 3 && c > 2 && c < C - 3);
          const vents = (r % 3 === 0 && c % 5 === 0);
          return border || (inner && !vents);
        },
        ()=> `linear-gradient(180deg, #37F2FF, #009EFF)`,
        ()=> ({})
      );
    },
    onHitBrick(_b, game){
      // Small glitch flash on any brick hit (respects reduced-motion)
      game._glitchScreen(160);
    },
    onEnter(){},
    onUpdate(){},
    onExit(){},
  };
}
