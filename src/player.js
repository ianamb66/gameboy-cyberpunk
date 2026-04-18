import { CONFIG } from './config.js';
import { clamp, norm } from './utils.js';

export function createPlayer(spawn = { x: 24, y: 24 }) {
  const p = {
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    r: CONFIG.PLAYER.SIZE,
    hp: CONFIG.PLAYER.MAX_HP,
    en: CONFIG.PLAYER.MAX_EN,
    facing: { x: 0, y: 1 },
  };

  function setFacingFromMove(ax, ay) {
    if (ax === 0 && ay === 0) return;
    const n = norm(ax, ay);
    p.facing.x = n.x;
    p.facing.y = n.y;
  }

  function applyMove(inputAxes, isRun, dt) {
    const ax = inputAxes.x;
    const ay = inputAxes.y;
    setFacingFromMove(ax, ay);

    const speed = CONFIG.PLAYER.SPEED * (isRun ? CONFIG.PLAYER.RUN_MULT : 1);
    const n = norm(ax, ay);

    p.vx = n.x * speed;
    p.vy = n.y * speed;

    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }

  function clampVitals() {
    p.hp = clamp(p.hp, 0, CONFIG.PLAYER.MAX_HP);
    p.en = clamp(p.en, 0, CONFIG.PLAYER.MAX_EN);
  }

  return { p, applyMove, clampVitals };
}
