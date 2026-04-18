import { CONFIG } from './config.js';
import { lerp, clamp } from './utils.js';

export function createCamera() {
  const cam = {
    x: 0,
    y: 0,
    w: CONFIG.WIDTH,
    h: CONFIG.HEIGHT,
  };

  function follow(target, dt) {
    const desiredX = target.x - cam.w / 2;
    const desiredY = target.y - cam.h / 2;

    // Simple lerp smoothing
    cam.x = lerp(cam.x, desiredX, 1 - Math.pow(1 - CONFIG.CAMERA.LERP, dt * 60));
    cam.y = lerp(cam.y, desiredY, 1 - Math.pow(1 - CONFIG.CAMERA.LERP, dt * 60));

    // Clamp to world bounds (in px) is done in world step, since map sizes can vary.
  }

  function clampToWorld(worldPxW, worldPxH) {
    cam.x = clamp(cam.x, 0, Math.max(0, worldPxW - cam.w));
    cam.y = clamp(cam.y, 0, Math.max(0, worldPxH - cam.h));
  }

  return { cam, follow, clampToWorld };
}
