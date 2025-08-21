import { buildPattern } from './helpers.js';

export function VirusVault() {
  return {
    name: 'Virus Vault',
    theme: '',
    message: 'Hazardous code detected…',
    speedMul: 1.35,
    createBricks(game) {
      const rows = 10, cols = 16;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c)=> (r>1) && ((r+c)%2===0),
        (r,c)=> ( (r+c)%4===0 ? `linear-gradient(180deg, #ff3b3b, #9a0000)` : `linear-gradient(180deg, #8af, #69a8ff)` ),
        (r,c)=> ( (r+c)%4===0 ? { type:'damaging' } : {} )
      );
    },
    onHitBrick(brick, game){
      if (brick.type === 'damaging') {
        game.paddle.w = Math.max(80, Math.floor(game.paddle.w * 0.85));
        game.paddle.debuffWidthFor(6000);
      }
    },
    onEnter(){},
    onUpdate(){},
    onExit(){},
  };
}
