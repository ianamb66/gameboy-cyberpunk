import { clamp } from './utils.js';

export function createInput() {
  const state = {
    keys: new Set(),
    pressed: new Set(),
    released: new Set(),
    axes: { x: 0, y: 0 },
    run: false,
  };

  function keyOf(e) {
    // Normalize
    const k = (e.key || '').toLowerCase();
    return k;
  }

  function onKeyDown(e) {
    const k = keyOf(e);
    if (!state.keys.has(k)) state.pressed.add(k);
    state.keys.add(k);
    // Prevent page scroll with arrows/space
    if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
  }

  function onKeyUp(e) {
    const k = keyOf(e);
    state.keys.delete(k);
    state.released.add(k);
  }

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);

  function isDown(k) { return state.keys.has(k); }
  function wasPressed(k) { return state.pressed.has(k); }

  function update() {
    const left = isDown('a') || isDown('arrowleft');
    const right = isDown('d') || isDown('arrowright');
    const up = isDown('w') || isDown('arrowup');
    const down = isDown('s') || isDown('arrowdown');

    state.axes.x = (right ? 1 : 0) - (left ? 1 : 0);
    state.axes.y = (down ? 1 : 0) - (up ? 1 : 0);

    state.run = isDown('shift');

    // clear edge sets next frame
  }

  function postUpdate() {
    state.pressed.clear();
    state.released.clear();
  }

  function destroy() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  // Basic, optional gamepad support (Phase 1: movement only)
  function readGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && pads[0];
    if (!gp) return;
    const ax0 = gp.axes?.[0] ?? 0;
    const ax1 = gp.axes?.[1] ?? 0;
    const dz = 0.18;
    const x = Math.abs(ax0) < dz ? 0 : ax0;
    const y = Math.abs(ax1) < dz ? 0 : ax1;
    // If keyboard is idle, allow stick to drive
    if (state.axes.x === 0 && state.axes.y === 0) {
      state.axes.x = clamp(x, -1, 1);
      state.axes.y = clamp(y, -1, 1);
    }
  }

  return {
    state,
    update,
    postUpdate,
    isDown,
    wasPressed,
    readGamepad,
    destroy,
  };
}
