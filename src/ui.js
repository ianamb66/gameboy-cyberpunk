import { clamp } from './utils.js';
import { CONFIG } from './config.js';

export function createUI(ui) {
  let isPaused = false;
  let showMap = false;
  let showSettings = false;

  function setBars({ hp, maxHp, en, maxEn }) {
    const hpPct = maxHp ? clamp(hp / maxHp, 0, 1) : 0;
    const enPct = maxEn ? clamp(en / maxEn, 0, 1) : 0;
    if (ui.hpBar) ui.hpBar.style.width = `${Math.round(hpPct * 100)}%`;
    if (ui.enBar) ui.enBar.style.width = `${Math.round(enPct * 100)}%`;
  }

  function setChips({ district, x, y }) {
    if (ui.districtChip) ui.districtChip.textContent = `District: ${district}`;
    if (ui.coordsChip) ui.coordsChip.textContent = `(${Math.round(x)},${Math.round(y)})`;
  }

  function setPaused(p) {
    isPaused = p;
    if (!ui.modal) return;
    ui.modal.classList.toggle('hidden', !isPaused);
  }

  function setMapVisible(v) {
    showMap = v;
    if (!ui.minimap) return;
    ui.minimap.classList.toggle('hidden', !showMap);
  }

  function setSettingsVisible(v) {
    showSettings = v;
    if (!ui.settingsModal) return;
    ui.settingsModal.classList.toggle('hidden', !showSettings);
  }

  function bindButtons(onResume, onReset, onCloseSettings) {
    ui.btnResume?.addEventListener('click', onResume);
    ui.btnReset?.addEventListener('click', onReset);
    ui.btnCloseSettings?.addEventListener('click', onCloseSettings);
  }

  function drawMinimap(map, player) {
    if (!ui.minimapCanvas) return;
    const c = ui.minimapCanvas;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const tw = map.w;
    const th = map.h;

    // Fit entire map into minimap canvas.
    const sx = c.width / tw;
    const sy = c.height / th;

    ctx.clearRect(0, 0, c.width, c.height);

    // background
    ctx.fillStyle = CONFIG.PALETTE.gb0;
    ctx.fillRect(0, 0, c.width, c.height);

    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const t = map.getTile(x, y);
        if (t === 1) ctx.fillStyle = CONFIG.PALETTE.gb1;
        else if (t === 2) ctx.fillStyle = CONFIG.PALETTE.accent;
        else ctx.fillStyle = CONFIG.PALETTE.gb0;
        ctx.globalAlpha = (t === 2) ? 0.35 : 1;
        ctx.fillRect(x * sx, y * sy, Math.ceil(sx), Math.ceil(sy));
        ctx.globalAlpha = 1;
      }
    }

    // player marker
    const px = (player.x / map.tile) * sx;
    const py = (player.y / map.tile) * sy;
    ctx.fillStyle = CONFIG.PALETTE.gb3;
    ctx.fillRect(px - 1, py - 1, 3, 3);
  }

  function setOnscreenVisible(v) {
    if (!ui.onscreen) return;
    ui.onscreen.classList.toggle('hidden', !v);
    document.body.classList.toggle('onscreen-on', !!v);
  }

  function setSettingsToggles({ onscreenControls, postFX }) {
    if (ui.toggleOnscreen) ui.toggleOnscreen.checked = !!onscreenControls;
    if (ui.togglePostfx) ui.togglePostfx.checked = !!postFX;
  }

  function onToggleOnscreen(cb) {
    ui.toggleOnscreen?.addEventListener('change', () => cb(!!ui.toggleOnscreen.checked));
  }

  function onTogglePostfx(cb) {
    ui.togglePostfx?.addEventListener('change', () => cb(!!ui.togglePostfx.checked));
  }

  return {
    setBars,
    setChips,
    setPaused,
    setMapVisible,
    setSettingsVisible,
    setOnscreenVisible,
    setSettingsToggles,
    onToggleOnscreen,
    onTogglePostfx,
    bindButtons,
    drawMinimap,
  };
}
