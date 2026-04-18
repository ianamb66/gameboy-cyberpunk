import { CONFIG } from './config.js';
import { aabb, rectsIntersect, clamp } from './utils.js';
import { PROP_TYPES } from './propsData.js';

export function createPropsSystem() {
  const props = [];

  function clear() {
    props.length = 0;
  }

  function addProp(type, tx, ty, meta = {}) {
    const def = PROP_TYPES[type];
    if (!def) throw new Error(`Unknown prop type: ${type}`);
    const tile = CONFIG.TILE;
    const p = {
      id: `${type}_${tx}_${ty}_${Math.random().toString(16).slice(2)}`,
      type,
      tx,
      ty,
      w: def.w,
      h: def.h,
      solid: !!def.solid,
      color: def.color,
      outline: def.outline,
      meta,
    };
    props.push(p);
    return p;
  }

  function getAABB(prop) {
    const tile = CONFIG.TILE;
    return aabb(prop.tx * tile, prop.ty * tile, prop.w * tile, prop.h * tile);
  }

  function resolveCircleVsSolidProps(circle) {
    // circle: {x,y,r}
    const tile = CONFIG.TILE;
    // Only check props near circle
    const cx = circle.x;
    const cy = circle.y;
    const r = circle.r;
    const query = aabb(cx - r - tile * 2, cy - r - tile * 2, r * 2 + tile * 4, r * 2 + tile * 4);

    for (const prop of props) {
      if (!prop.solid) continue;
      const box = getAABB(prop);
      if (!rectsIntersect(query, box)) continue;

      // Push circle out of AABB
      const closestX = Math.max(box.x, Math.min(cx, box.x + box.w));
      const closestY = Math.max(box.y, Math.min(cy, box.y + box.h));
      const dx = cx - closestX;
      const dy = cy - closestY;
      const dist2 = dx * dx + dy * dy;
      const r2 = r * r;
      if (dist2 < r2 && dist2 > 1e-8) {
        const dist = Math.sqrt(dist2);
        const overlap = r - dist;
        circle.x += (dx / dist) * overlap;
        circle.y += (dy / dist) * overlap;
      } else if (dist2 < r2) {
        circle.x += 0.1;
        circle.y += 0.1;
      }
    }
  }

  return {
    props,
    clear,
    addProp,
    getAABB,
    resolveCircleVsSolidProps,
  };
}
