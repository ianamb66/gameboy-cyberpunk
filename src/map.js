import { CONFIG } from './config.js';
import { mulberry32, randInt, randPick, chance } from './rng.js';

// Tile IDs
// 0: floor (default)
// 1: wall
// 2: hazard / neon spill
// 3: wood floor
// 4: tile floor
// 5: carpet floor
// 6: concrete floor

export function createMap(seed = 1337) {
  const tile = CONFIG.TILE;
  const w = CONFIG.WORLD_W;
  const h = CONFIG.WORLD_H;

  const tiles = new Uint8Array(w * h);

  const idx = (x, y) => y * w + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;

  function fill(id) { tiles.fill(id); }

  function rect(x0, y0, rw, rh, id) {
    for (let y = y0; y < y0 + rh; y++) {
      for (let x = x0; x < x0 + rw; x++) {
        if (inb(x, y)) tiles[idx(x, y)] = id;
      }
    }
  }

  function outlineRect(x0, y0, rw, rh, id) {
    for (let x = x0; x < x0 + rw; x++) {
      if (inb(x, y0)) tiles[idx(x, y0)] = id;
      if (inb(x, y0 + rh - 1)) tiles[idx(x, y0 + rh - 1)] = id;
    }
    for (let y = y0; y < y0 + rh; y++) {
      if (inb(x0, y)) tiles[idx(x0, y)] = id;
      if (inb(x0 + rw - 1, y)) tiles[idx(x0 + rw - 1, y)] = id;
    }
  }

  function carveDoor(x, y) {
    if (!inb(x, y)) return;
    tiles[idx(x, y)] = 0;
  }

  // Room list used by prop/decals placement
  const rooms = [];

  function generate(newSeed) {
    if (typeof newSeed === 'number') seed = newSeed;
    const rng = mulberry32(seed);

    fill(6); // concrete base

    // Outer walls
    outlineRect(0, 0, w, h, 1);

    rooms.length = 0;

    // Generate 10–16 rooms
    const roomCount = randInt(rng, 10, 16);
    const themes = [
      { name: 'club', floor: 3 },
      { name: 'motel', floor: 5 },
      { name: 'lab', floor: 4 },
      { name: 'office', floor: 4 },
      { name: 'alley', floor: 6 },
      { name: 'bar', floor: 3 },
    ];

    let attempts = 0;
    while (rooms.length < roomCount && attempts < roomCount * 30) {
      attempts++;
      const rw = randInt(rng, 10, 22);
      const rh = randInt(rng, 8, 18);
      const x0 = randInt(rng, 2, w - rw - 2);
      const y0 = randInt(rng, 2, h - rh - 2);

      // Check overlap (simple)
      let ok = true;
      for (const r of rooms) {
        const pad = 2;
        if (
          x0 < r.x + r.w + pad &&
          x0 + rw + pad > r.x &&
          y0 < r.y + r.h + pad &&
          y0 + rh + pad > r.y
        ) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      const theme = randPick(rng, themes);

      // Walls
      outlineRect(x0, y0, rw, rh, 1);
      // Interior floor
      rect(x0 + 1, y0 + 1, rw - 2, rh - 2, theme.floor);

      rooms.push({ x: x0, y: y0, w: rw, h: rh, theme: theme.name, floor: theme.floor });
    }

    // Connect rooms with corridors
    // We'll connect in sequence by center points
    for (let i = 1; i < rooms.length; i++) {
      const a = rooms[i - 1];
      const b = rooms[i];
      const ax = Math.floor(a.x + a.w / 2);
      const ay = Math.floor(a.y + a.h / 2);
      const bx = Math.floor(b.x + b.w / 2);
      const by = Math.floor(b.y + b.h / 2);

      // Horizontal then vertical corridor
      const stepX = ax < bx ? 1 : -1;
      for (let x = ax; x !== bx; x += stepX) {
        tiles[idx(x, ay)] = 0;
        if (chance(rng, 0.10)) tiles[idx(x, ay)] = 2; // neon spill
      }
      const stepY = ay < by ? 1 : -1;
      for (let y = ay; y !== by; y += stepY) {
        tiles[idx(bx, y)] = 0;
        if (chance(rng, 0.10)) tiles[idx(bx, y)] = 2;
      }

      // Door carving near room edges
      carveDoor(ax, ay);
      carveDoor(bx, by);
    }

    // Add random neon spills
    for (let i = 0; i < 80; i++) {
      const x = randInt(rng, 2, w - 3);
      const y = randInt(rng, 2, h - 3);
      if (tiles[idx(x, y)] !== 1 && chance(rng, 0.25)) tiles[idx(x, y)] = 2;
    }
  }

  generate(seed);

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
    // Use nearest room theme; fallback by quadrants
    for (const r of rooms) {
      if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) {
        return r.theme;
      }
    }

    const halfW = Math.floor(w / 2);
    const halfH = Math.floor(h / 2);
    const left = tx < halfW;
    const top = ty < halfH;
    if (left && top) return 'core';
    if (!left && top) return 'dense';
    if (left && !top) return 'industrial';
    return 'badlands';
  }

  return {
    w,
    h,
    tile,
    tiles,
    rooms,
    seed: () => seed,
    regenerate: (s) => generate(s),
    getTile,
    isSolid,
    worldSizePx,
    districtNameAtTile,
  };
}
