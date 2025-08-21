import { buildPattern } from './helpers.js';

export function Firewall() {
  return {
    name: 'Firewall',
    theme: 'theme-firewall',
    message: 'Unbreakable sectors detected…',
    speedMul: 1.2,
    createBricks(game) {
      const rows = 12, cols = 14;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c)=> (c % 2 === 0) || !((r % 4) === 2) && r > 1,
        (r,c)=> (c%2===0) ? `linear-gradient(180deg, #ff6b6b, #b40000)` : `linear-gradient(180deg, #ffaa66, #ff6b3a)`,
        (r,c)=> (c%2===0) ? ({ type:'unbreakable' }) : ({})
      );
    },
    onEnter(){},
    onUpdate(){},
    onExit(){},
  };
}
