import { CONFIG } from './config.js';
import { nowMs } from './utils.js';
import { createRenderer } from './renderer.js';
import { createInput } from './input.js';
import { createCamera } from './camera.js';
import { createMap } from './map.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createUI } from './ui.js';

export function createGame({ canvas, ui }) {
  const renderer = createRenderer(canvas);
  const input = createInput();
  const camera = createCamera();
  const map = createMap();
  const world = createWorld(map);
  const player = createPlayer({ x: 32, y: 32 });
  const hud = createUI(ui);

  const state = {
    running: false,
    paused: false,
    showMap: false,
    last: 0,
    acc: 0,
    fps: 0,
    fpsSm: 60,
  };

  function setPaused(p) {
    state.paused = p;
    hud.setPaused(p);
  }

  function toggleMap() {
    state.showMap = !state.showMap;
    hud.setMapVisible(state.showMap);
  }

  function reset() {
    player.p.x = 32;
    player.p.y = 32;
    player.p.hp = CONFIG.PLAYER.MAX_HP;
    player.p.en = CONFIG.PLAYER.MAX_EN;
    state.showMap = false;
    hud.setMapVisible(false);
  }

  hud.bindButtons(() => setPaused(false), () => reset());

  function handleHotkeys() {
    if (input.wasPressed('escape')) setPaused(!state.paused);
    if (input.wasPressed('m')) toggleMap();
  }

  function step(dt) {
    input.update();
    input.readGamepad();
    handleHotkeys();

    if (!state.paused) {
      player.applyMove(input.state.axes, input.state.run, dt);

      world.resolveCollisionsCircle(player.p);
      world.clampToWorld(player.p);
      player.clampVitals();

      camera.follow(player.p, dt);
      const sz = map.worldSizePx();
      camera.clampToWorld(sz.w, sz.h);
    }

    // UI
    const district = world.districtNameAtPx(player.p.x, player.p.y);
    hud.setBars({ hp: player.p.hp, maxHp: CONFIG.PLAYER.MAX_HP, en: player.p.en, maxEn: CONFIG.PLAYER.MAX_EN });
    hud.setChips({ district, x: player.p.x, y: player.p.y });

    if (state.showMap) hud.drawMinimap(map, player.p);

    input.postUpdate();
  }

  function render() {
    renderer.clear();
    renderer.drawMap(map, camera.cam);
    renderer.drawPlayer(player.p, camera.cam);

    renderer.drawDebugText([
      `FPS ${Math.round(state.fpsSm)}`,
      state.paused ? 'PAUSED' : 'RUN',
    ]);
  }

  function loop(t) {
    if (!state.running) return;

    if (!state.last) state.last = t;
    const dt = Math.min(0.05, (t - state.last) / 1000);
    state.last = t;

    // fps smoothing
    state.fps = dt > 0 ? 1 / dt : 0;
    state.fpsSm = state.fpsSm * 0.92 + state.fps * 0.08;

    step(dt);
    render();
    renderer.present();

    requestAnimationFrame(loop);
  }

  function start() {
    if (state.running) return;
    state.running = true;
    state.last = 0;

    // Ensure correct canvas size
    canvas.width = CONFIG.WIDTH;
    canvas.height = CONFIG.HEIGHT;

    setPaused(false);
    hud.setMapVisible(false);

    requestAnimationFrame(loop);
  }

  function stop() {
    state.running = false;
    input.destroy();
  }

  return { start, stop, state };
}
