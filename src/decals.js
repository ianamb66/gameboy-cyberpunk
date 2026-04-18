import { CONFIG } from './config.js';

export function createDecals() {
  const decals = [];

  function clear() {
    decals.length = 0;
  }

  function add(kind, x, y, size, color, alpha = 1) {
    decals.push({ kind, x, y, size, color, alpha });
  }

  return { decals, clear, add };
}
