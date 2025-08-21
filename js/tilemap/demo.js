import { TileSet } from './TileSet.js';
import { TileMap } from './TileMap.js';
import { maps } from './maps.js';

const canvas = document.getElementById('tileMapCanvas');
const ctx = canvas.getContext('2d');

// Tileset: grouped image of all tiles
const tileset = new TileSet('./assets/images/BasicArkanoidPack.png', 40, 17);
let current = 0;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const map = new TileMap(maps[current]);
  map.render(ctx, tileset);
}

// Cycle through maps when the button is pressed
const btn = document.getElementById('nextMap');
btn.addEventListener('click', () => {
  current = (current + 1) % maps.length;
  render();
});

// Initial render after tileset loads
tileset.image.addEventListener('load', render);
