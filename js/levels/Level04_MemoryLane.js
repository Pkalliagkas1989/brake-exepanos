import { buildPattern } from './helpers.js';

export function MemoryLane() {
  let teleCd = 800;
  return {
    name: 'Memory Lane',
    theme: '',
    message: 'Addresses are shifting…',
    speedMul: 1.25,
    createBricks(game) {
      const rows = 12, cols = 18;
      return buildPattern(
        game.layerBricks, game, rows, cols,
        (r,c,R,C)=> {
          const mid = Math.floor(R / 2);
          const amp = Math.floor(R / 3);
          const wave = mid + Math.floor(Math.sin((c / C) * Math.PI * 2) * amp * 0.7);
          return Math.abs(r - wave) <= 2;
        },
        ()=> `linear-gradient(180deg, #9D8CFF, #6f62ff)`,
        ()=> ({})
      );
    },
    onEnter(game){ game.story.show('Old memories flicker by…', 1200); },
    onUpdate(dt, game){
      teleCd -= dt;
      if (teleCd <= 0 && game.bricks.length) {
        teleCd = 900 + Math.random()*600;
        const b = game.bricks[Math.floor(Math.random()*game.bricks.length)];
        if (b && b.alive) {
          const areaW = game.width, areaH = game.height*0.75;
          b.rect.x = Math.max(0, Math.min(areaW - b.rect.w, Math.random() * (areaW - b.rect.w)));
          b.rect.y = 28 + Math.random() * (areaH - 28 - b.rect.h);
          b.render();
          game.grid.build(game.bricks, game.width, game.height);
        }
      }
    },
    onExit(){},
  };
}
