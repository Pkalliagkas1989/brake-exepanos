// Sentinel boss: floats horizontally, shoots at the paddle, regenerates defenses.
import { Projectile } from './Projectile.js';

export class Boss {
  constructor(game) {
    this.game = game;
    this.hp = 20;
    this.x = game.width/2; this.y = 80; this.t=0;
    this.node = document.createElement('div');
    this.node.className = 'boss';
    document.getElementById('entities').appendChild(this.node);
    this._shootCd = 0;
    this._regenCd = 0;
    this.render();
  }

  rect() { return { x: this.x-40, y: this.y-40, w: 80, h: 80 }; }

  update(dt) {
    this.t += dt;
    // Floaty sine motion
    this.x = this.game.width/2 + Math.sin(this.t/600)*120;
    this.render();

    // Shoot at player
    this._shootCd -= dt;
    if (this._shootCd <= 0) {
      this._shootCd = 900;
      const px = this.game.paddle.x + this.game.paddle.w/2;
      const dx = px - this.x, dy = (this.game.paddle.y - this.y);
      const len = Math.hypot(dx, dy) || 1;
      this.game._projectiles.push(new Projectile(this.x, this.y+30, dx/len*0.35, dy/len*0.35));
    }

    // Regenerate bricks periodically
    this._regenCd -= dt;
    if (this._regenCd <= 0) {
      this._regenCd = 2500;
      this.game.script?.spawnDefenses?.(this.game);
    }
  }

  hit() {
    this.hp--;
    if (this.hp === 15 || this.hp === 10 || this.hp === 5) {
      this.game.story.show(`Sentinel: You won't escape... (${this.hp})`, 1200);
    }
    if (this.hp <= 0) this.destroy();
  }

  destroy(){ this.node.remove(); this.game._boss=null; }
  render(){ this.node.style.transform = `translate3d(${this.x-40}px, ${this.y-40}px, 0)`; }
}
