import { buildPattern } from './helpers.js';
import { Boss } from '../entities/Boss.js';
import { Brick } from '../Brick.js';

export function TheSentinel() {
  return {
    name: 'The Sentinel',
    theme: '',
    message: 'Central AI engaged…',
    speedMul: 1.55,
    createBricks(game) {
      // Fortress ring with unbreakable border
      const rows = 8, cols = 12;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c,R,C)=> (r===0 || c===0 || r===R-1 || c===C-1) && !((r===0 && (c%3===0)) || (c===0 && (r%3===0))),
        ()=> `linear-gradient(180deg, #37F2FF, #2A6FFF)`,
        (r,c,R,C)=> ({ type: (r===0 || r===R-1 || c===0 || c===C-1) ? 'unbreakable' : 'normal' })
      );
    },
    onEnter(game){
      game._boss = new Boss(game);
      game.story.show('Sentinel: You shouldn’t be here.', 1500);
    },
    onUpdate(){},
    onExit(game){
      if (game._boss) { game._boss.destroy(); game._boss = null; }
    },
    spawnDefenses(game){
      // Spawn a small line of normal bricks under boss
      const y = 150 + Math.random()*40;
      const w = 60, h=20, gap=8;
      for (let i=-2; i<=2; i++) {
        const node = document.getElementById('tpl-brick').content.firstElementChild.cloneNode(true);
        node.style.width = w + 'px';
        node.style.height = h + 'px';
        node.style.background = `linear-gradient(180deg, #00c8ff, #234cff)`;
        game.layerBricks.appendChild(node);
        const x = Math.max(0, Math.min(game.width - w, game._boss.x + i*(w+gap) - w/2));
        const b = new Brick(node, x, y, w, h, { hp:1 });
        game.bricks.push(b);
      }
      game.grid.build(game.bricks, game.width, game.height);
    },
    isComplete(game){
      return !game._boss; // boss dead
    }
  };
}
