export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function vecLen(x, y) { return Math.hypot(x, y); }
export function norm(x, y) {
  const l = vecLen(x, y);
  if (l <= 1e-8) return { x: 0, y: 0 };
  return { x: x / l, y: y / l };
}

export function rectsIntersect(a, b) {
  return !(
    a.x + a.w <= b.x ||
    a.x >= b.x + b.w ||
    a.y + a.h <= b.y ||
    a.y >= b.y + b.h
  );
}

export function aabb(x, y, w, h) { return { x, y, w, h }; }

export function nowMs() { return (typeof performance !== 'undefined' ? performance.now() : Date.now()); }

export function safeJsonParse(s, fallback) {
  try { return JSON.parse(s); } catch { return fallback; }
}
