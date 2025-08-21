import { TileMap } from './TileMap.js';

const testMap = {
  columns: 3,
  rows: 2,
  tiles: [1,2,3,4,5,6],
};

const m = new TileMap(testMap);
if (m.getTile(2,1) !== 6) {
  console.error('Tile lookup failed');
  process.exit(1);
}
console.log('TileMap test passed');
