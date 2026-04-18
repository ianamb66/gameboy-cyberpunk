import { CONFIG } from './config.js';
import { aabb } from './utils.js';

export function createWorld(map, propsSystem) {
  const tile = map.tile;

  function tileAABB(tx, ty) {
    return aabb(tx * tile, ty * tile, tile, tile);
  }

  function resolveCollisionsCircle(entity) {
    // entity: {x,y,r}
    // Broad: check nearby tiles
    const tx0 = Math.floor((entity.x - entity.r) / tile) - 1;
    const ty0 = Math.floor((entity.y - entity.r) / tile) - 1;
    const tx1 = Math.floor((entity.x + entity.r) / tile) + 1;
    const ty1 = Math.floor((entity.y + entity.r) / tile) + 1;

    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = map.getTile(tx, ty);
        if (!map.isSolid(t)) continue;

        // Push circle out of tile AABB
        const box = tileAABB(tx, ty);
        const closestX = Math.max(box.x, Math.min(entity.x, box.x + box.w));
        const closestY = Math.max(box.y, Math.min(entity.y, box.y + box.h));
        const dx = entity.x - closestX;
        const dy = entity.y - closestY;
        const dist2 = dx * dx + dy * dy;
        const r2 = entity.r * entity.r;

        if (dist2 < r2 && dist2 > 1e-8) {
          const dist = Math.sqrt(dist2);
          const overlap = entity.r - dist;
          entity.x += (dx / dist) * overlap;
          entity.y += (dy / dist) * overlap;
        } else if (dist2 < r2) {
          entity.x += 0.1;
          entity.y += 0.1;
        }
      }
    }

    // Props collisions
    propsSystem?.resolveCircleVsSolidProps?.(entity);
  }

  function clampToWorld(entity) {
    const { w, h } = map.worldSizePx();
    entity.x = Math.max(entity.r, Math.min(w - entity.r, entity.x));
    entity.y = Math.max(entity.r, Math.min(h - entity.r, entity.y));
  }

  function districtNameAtPx(x, y) {
    const tx = Math.floor(x / tile);
    const ty = Math.floor(y / tile);
    return map.districtNameAtTile(tx, ty);
  }

  return {
    resolveCollisionsCircle,
    clampToWorld,
    districtNameAtPx,
  };
}
