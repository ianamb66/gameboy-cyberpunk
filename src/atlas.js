import { loadImage, loadJSON } from './assets.js';

export async function loadAtlas(jsonUrl) {
  const data = await loadJSON(jsonUrl);
  const img = await loadImage('/' + data.image.replace(/^\//, ''));

  const grid = data.grid;
  const sprites = {};

  for (const [name, s] of Object.entries(data.sprites || {})) {
    const x = grid.margin.x + s.col * (grid.cell.w + grid.gutter.x);
    const y = grid.margin.y + s.row * (grid.cell.h + grid.gutter.y);
    sprites[name] = { x, y, w: grid.cell.w, h: grid.cell.h };
  }

  return {
    image: img,
    sprites,
    draw(ctx, name, dx, dy, dw, dh, opts = {}) {
      const spr = sprites[name];
      if (!spr) return false;
      const { x, y, w, h } = spr;
      ctx.drawImage(img, x, y, w, h, dx, dy, dw, dh);
      return true;
    }
  };
}
