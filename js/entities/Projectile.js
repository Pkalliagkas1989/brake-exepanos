// Boss projectile: small circle that harms the player on contact.
export class Projectile {
  constructor(x, y, vx, vy) {
    this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.r=5; this.alive=true;
    this.node = document.createElement('div');
    this.node.className = 'proj';
    document.getElementById('entities').appendChild(this.node);
    this.render();
  }
  update(dt, game) {
    if (!this.alive) return;
    this.x += this.vx*dt; this.y += this.vy*dt;

    // Collide with paddle (simple AABB point-in-rect)
    const pr = game.paddle.rect();
    if (this.x>=pr.x && this.x<=pr.x+pr.w && this.y>=pr.y && this.y<=pr.y+pr.h) {
      this.destroy(); game.loseLife(); return;
    }
    if (this.y > game.height+20) this.destroy();
    this.render();
  }
  render(){ this.node.style.transform = `translate3d(${this.x - this.r}px, ${this.y - this.r}px, 0)`; }
  destroy(){ if(!this.alive) return; this.alive=false; this.node.remove(); }
}
