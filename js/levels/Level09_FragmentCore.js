import { buildPattern } from './helpers.js';

export function FragmentCore() {
  let speedCd = 3000;
  return {
    name: 'Fragment Core',
    theme: '',
    message: 'Runtime accelerating…',
    speedMul: 1.5,
    createBricks(game) {
      const rows = 10, cols = 18;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c)=> (r+c)%3!==1,
        ()=> `linear-gradient(180deg, #89a, #223)`,
        ()=> ({})
      );
    },
    onUpdate(dt, game){
      speedCd -= dt;
      if (speedCd <= 0) {
        speedCd = 3000;
        game.ball.boostSpeedBy(1.02);
      }
    },
    onExit(){},
  };
}
