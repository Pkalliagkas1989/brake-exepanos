export class TileMap {
  /**
   * @param {object} opts
   * @param {number} opts.columns Number of columns
   * @param {number} opts.rows Number of rows
   * @param {Array<number>} opts.tiles Tile index array
   */
  constructor({ columns, rows, tiles }) {
    this.columns = columns;
    this.rows = rows;
    this.tiles = tiles;
  }

  /** Get tile index at a column and row. */
  getTile(col, row) {
    return this.tiles[row * this.columns + col];
  }

  /** Render map to a canvas context using a TileSet. */
  render(ctx, tileset) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        const t = this.getTile(c, r);
        if (t >= 0) {
          tileset.draw(
            ctx,
            t,
            c * tileset.tileWidth,
            r * tileset.tileHeight,
          );
        }
      }
    }
  }
}
