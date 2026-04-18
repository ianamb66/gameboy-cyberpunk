import { CONFIG } from './config.js';
import { nowMs } from './utils.js';
import { createRenderer } from './renderer.js';
import { createInput } from './input.js';
import { createCamera } from './camera.js';
import { createMap } from './map.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createUI } from './ui.js';
import { createPropsSystem } from './props.js';
import { createDecals } from './decals.js';
import { mulberry32, randInt, randPick, chance } from './rng.js';
import { CLUSTERS } from './propsData.js';

export function createGame({ canvas, ui }) {
  const renderer = createRenderer(canvas);
  const input = createInput();
  const camera = createCamera();

  let seed = (Date.now() & 0xfffffff) >>> 0;
  const map = createMap(seed);

  const propsSystem = createPropsSystem();
  const decals = createDecals();
  const world = createWorld(map, propsSystem);
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

  function decorate(decoSeed = seed) {
    const rng = mulberry32(decoSeed >>> 0);
    propsSystem.clear();
    decals.clear();

    // Place clusters in rooms
    const roomList = map.rooms || [];
    for (const r of roomList) {
      // 40% chance room gets a cluster
      if (!chance(rng, r.theme === 'club' || r.theme === 'bar' ? 0.65 : 0.40)) continue;

      const choices = [];
      if (r.theme === 'bar' || r.theme === 'club') choices.push('barCorner', 'roundTableFight');
      if (r.theme === 'motel') choices.push('motelRoom');
      if (r.theme === 'office') choices.push('arcadeNook');
      if (r.theme === 'lab') choices.push('roundTableFight');
      if (r.theme === 'alley') choices.push('arcadeNook');
      if (choices.length === 0) choices.push('roundTableFight');

      const clusterName = randPick(rng, choices);
      const cluster = CLUSTERS[clusterName];
      if (!cluster) continue;

      // pick a position inside room
      const margin = 2;
      const baseTx = randInt(rng, r.x + margin, Math.max(r.x + margin, r.x + r.w - margin - 12));
      const baseTy = randInt(rng, r.y + margin, Math.max(r.y + margin, r.y + r.h - margin - 10));

      for (const it of cluster.props) {
        propsSystem.addProp(it.type, baseTx + it.ox, baseTy + it.oy, { cluster: clusterName, theme: r.theme });
      }

      // Crime vibe decals
      if (chance(rng, 0.25)) {
        const px = (baseTx + 4) * CONFIG.TILE;
        const py = (baseTy + 4) * CONFIG.TILE;
        decals.add('blood', px, py, randInt(rng, 2, 6), CONFIG.PALETTE.blood, 0.95);
        decals.add('blood', px + randInt(rng, -14, 14), py + randInt(rng, -12, 12), randInt(rng, 2, 5), CONFIG.PALETTE.blood, 0.85);
      }

      // Neon puddle
      if (chance(rng, 0.35)) {
        decals.add('puddle', (baseTx + 6) * CONFIG.TILE, (baseTy + 2) * CONFIG.TILE, randInt(rng, 3, 8), CONFIG.PALETTE.neonCyan, 0.55);
      }
    }

    // Sprinkle small decor everywhere
    for (let i = 0; i < 220; i++) {
      const tx = randInt(rng, 2, map.w - 3);
      const ty = randInt(rng, 2, map.h - 3);
      const t = map.getTile(tx, ty);
      if (t === 1) continue;
      if (chance(rng, 0.10)) propsSystem.addProp('paper', tx, ty);
      if (chance(rng, 0.07)) propsSystem.addProp('bottle', tx, ty);
      if (chance(rng, 0.05)) propsSystem.addProp('shell', tx, ty);
      if (chance(rng, 0.03)) decals.add('blood', tx * CONFIG.TILE, ty * CONFIG.TILE, 2, CONFIG.PALETTE.blood, 0.65);
      if (chance(rng, 0.06)) decals.add('puddle', tx * CONFIG.TILE, ty * CONFIG.TILE, 3, CONFIG.PALETTE.neonPink, 0.35);
    }
  }

  function regenerate(newSeed) {
    seed = (newSeed >>> 0) || ((Date.now() & 0xfffffff) >>> 0);
    map.regenerate(seed);
    decorate(seed ^ 0x9e3779b9);

    // respawn player near first room if available
    const r0 = map.rooms?.[0];
    if (r0) {
      player.p.x = (r0.x + 3) * CONFIG.TILE;
      player.p.y = (r0.y + 3) * CONFIG.TILE;
    } else {
      player.p.x = 32;
      player.p.y = 32;
    }
  }

  function reset() {
    player.p.hp = CONFIG.PLAYER.MAX_HP;
    player.p.en = CONFIG.PLAYER.MAX_EN;
    state.showMap = false;
    hud.setMapVisible(false);
    regenerate(seed);
  }

  hud.bindButtons(() => setPaused(false), () => reset());

  function handleHotkeys() {
    if (input.wasPressed('escape')) setPaused(!state.paused);
    if (input.wasPressed('m')) toggleMap();

    // N: new seed (new level)
    if (input.wasPressed('n') && !input.state.run) regenerate(((Date.now() & 0xfffffff) >>> 0));
    // Shift+N (we reuse run flag): redecorate same layout
    if (input.wasPressed('n') && input.state.run) decorate(seed ^ ((Date.now() & 0xffff) >>> 0));
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
    renderer.drawDecals(decals.decals, camera.cam);
    renderer.drawProps(propsSystem, camera.cam);
    renderer.drawPlayer(player.p, camera.cam);

    renderer.drawDebugText([
      `FPS ${Math.round(state.fpsSm)}`,
      state.paused ? 'PAUSED' : 'RUN',
      `SEED ${seed}`,
      'N: new • Shift+N: redecorate',
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

    // initial generation
    regenerate(seed);

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
