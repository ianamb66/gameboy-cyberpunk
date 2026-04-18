import { CONFIG } from './config.js';

// Tile IDs (Phase 1)
// 0: floor
// 1: wall
// 2: hazard (visual only)

export function createMap() {
  const tile = CONFIG.TILE;

  // Simple generated districts inside one big map.
  // Scale up a bit for the wider internal resolution.
  const w = CONFIG.WORLD_W;
  const h = CONFIG.WORLD_H;

  const tiles = new Uint8Array(w * h);

  // Helpers
  const idx = (x, y) => y * w + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;

  // Fill with floor
  tiles.fill(0);

  // Borders = walls
  for (let x = 0; x < w; x++) {
    tiles[idx(x, 0)] = 1;
    tiles[idx(x, h - 1)] = 1;
  }
  for (let y = 0; y < h; y++) {
    tiles[idx(0, y)] = 1;
    tiles[idx(w - 1, y)] = 1;
  }

  // Add some blocks/buildings
  function rect(x0, y0, rw, rh, id) {
    for (let y = y0; y < y0 + rh; y++) {
      for (let x = x0; x < x0 + rw; x++) {
        if (inb(x, y)) tiles[idx(x, y)] = id;
      }
    }
  }

  // District bands
  // Core (top-left), Dense (top-right), Industrial (bottom-left), Badlands (bottom-right)
  rect(6, 6, 34, 22, 1);
  rect(10, 10, 26, 14, 0);

  rect(86, 8, 50, 30, 1);
  rect(90, 12, 42, 22, 0);

  rect(12, 84, 46, 42, 1);
  rect(16, 88, 38, 34, 0);

  rect(92, 92, 54, 54, 1);
  rect(96, 96, 46, 46, 0);

  // Some corridors
  rect(40, 16, 46, 3, 0);
  rect(58, 16, 3, 70, 0);
  rect(58, 56, 70, 3, 0);

  // Some hazards / neon puddles
  rect(64, 24, 6, 6, 2);
  rect(28, 64, 5, 9, 2);

  function getTile(x, y) {
    if (!inb(x, y)) return 1;
    return tiles[idx(x, y)];
  }

  function isSolid(tileId) {
    return tileId === 1;
  }

  function worldSizePx() {
    return { w: w * tile, h: h * tile };
  }

  function districtNameAtTile(tx, ty) {
    const halfW = Math.floor(w / 2);
    const halfH = Math.floor(h / 2);

    const left = tx < halfW;
    const top = ty < halfH;

    if (left && top) return 'Core (Corporate)';
    if (!left && top) return 'Dense (Urban)';
    if (left && !top) return 'Industrial';
    return 'Badlands';
  }

  return {
    w,
    h,
    tile,
    tiles,
    getTile,
    isSolid,
    worldSizePx,
    districtNameAtTile,
  };
}
