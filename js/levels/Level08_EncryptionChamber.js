import { buildPattern } from './helpers.js';
import { Brick } from '../Brick.js';

export function EncryptionChamber() {
  let regrowPool = []; // remembered slots for regrowth
  let cd = 1200;       // regen cooldown
  return {
    name: 'Encryption Chamber',
    theme: '',
    message: 'Cells regenerate…',
    speedMul: 1.45,
    createBricks(game) {
      const rows = 10, cols = 16;
      const bricks = buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c)=> (r>0 && c>0 && (r%2===0 || c%3===0)),
        ()=> `linear-gradient(180deg, #44ccff, #0066aa)`,
        (r,c)=> ({ type: ( (r+c)%3===0 ? 'regrow' : 'normal') })
      );
      regrowPool = []; // reset on level start
      cd = 1200;       // reset cadence
      return bricks;
    },
    onHitBrick(brick, _game, _ball, destroyed){
      if (destroyed && brick.type==='regrow') {
        regrowPool.push({ ...brick.rect }); // remember slot for respawn
      }
    },
    onUpdate(dt, game){
      cd -= dt;
      if (cd <= 0 && regrowPool.length) {
        cd = 1600;
        const slot = regrowPool.shift();
        // Respawn a brick in the remembered slot
        const node = document.getElementById('tpl-brick').content.firstElementChild.cloneNode(true);
        node.style.width = slot.w + 'px';
        node.style.height = slot.h + 'px';
        node.style.background = `linear-gradient(180deg, #44ccff, #0066aa)`;
        game.layerBricks.appendChild(node);
        const b = new Brick(node, slot.x, slot.y, slot.w, slot.h, { type:'regrow' });
        game.bricks.push(b);
        game.grid.build(game.bricks, game.width, game.height);
      }
    },
    onExit(){ regrowPool = []; },
  };
}
