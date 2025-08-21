/**
 * @fileoverview Defines the Brick class for the BREAKOUT.EXE game, updated with user-provided sprite sheet data.
 * This version uses a single image file for all brick textures to improve performance. The `MATERIALS` object
 * has been updated with the coordinates and dimensions from the user's sprite map.
 */

// We'll create a simple helper class to pre-load a single sprite sheet.
class ImageLoader {
    constructor() {
        this.spriteSheet = null;
        this.isLoaded = false;
    }

    /**
     * Loads the single sprite sheet image.
     * @param {string} url The URL path to the sprite sheet file.
     * @returns {Promise<void>} A promise that resolves when the image is loaded.
     */
    loadImage(url) {
        return new Promise((resolve, reject) => {
            this.spriteSheet = new Image();
            this.spriteSheet.onload = () => {
                this.isLoaded = true;
                console.log('Sprite sheet loaded successfully.');
                resolve();
            };
            this.spriteSheet.onerror = () => {
                console.error(`Failed to load sprite sheet: ${url}`);
                reject(new Error(`Failed to load image at ${url}`));
            };
            this.spriteSheet.src = url;
        });
    }
}