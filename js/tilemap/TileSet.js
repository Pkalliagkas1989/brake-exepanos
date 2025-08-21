export class TileSet {
  /**
   * @param {string} src Path to the tileset image
   * @param {number} tileWidth Width of a single tile in pixels
   * @param {number} tileHeight Height of a single tile in pixels
   */
  constructor(src, tileWidth, tileHeight) {
    this.image = new Image();
    this.image.src = src;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.columns = 0;
    this.image.addEventListener('load', () => {
      this.columns = Math.floor(this.image.width / this.tileWidth);
    });
  }

  /** Draw a tile by index to the given canvas context. */
  draw(ctx, tileIndex, dx, dy) {
    if (this.columns === 0) return; // image not loaded yet
    const sx = (tileIndex % this.columns) * this.tileWidth;
    const sy = Math.floor(tileIndex / this.columns) * this.tileHeight;
    ctx.drawImage(
      this.image,
      sx,
      sy,
      this.tileWidth,
      this.tileHeight,
      dx,
      dy,
      this.tileWidth,
      this.tileHeight,
    );
  }
}
