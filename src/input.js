import { clamp } from './utils.js';

export function createInput() {
  const state = {
    keys: new Set(),
    pressed: new Set(),
    released: new Set(),
    axes: { x: 0, y: 0 },
    run: false,

    // Virtual buttons (for gamepad + touch)
    btn: {
      a: false,
      b: false,
      start: false,
      select: false,
    },
    btnPressed: {
      a: false,
      b: false,
      start: false,
      select: false,
    },

    // touch stick
    touchAxes: { x: 0, y: 0 },
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
    // reset edge flags (will be set by gamepad/touch)
    state.btnPressed.a = false;
    state.btnPressed.b = false;
    state.btnPressed.start = false;
    state.btnPressed.select = false;

    const left = isDown('a') || isDown('arrowleft');
    const right = isDown('d') || isDown('arrowright');
    const up = isDown('w') || isDown('arrowup');
    const down = isDown('s') || isDown('arrowdown');

    state.axes.x = (right ? 1 : 0) - (left ? 1 : 0);
    state.axes.y = (down ? 1 : 0) - (up ? 1 : 0);

    // action buttons via keyboard too
    const aNow = isDown('j') || isDown(' ') || isDown('enter');
    const bNow = isDown('k');
    const startNow = isDown('escape');
    const selectNow = (isDown('tab') || (isDown('m') && isDown('shift')));

    if (aNow && !state.btn.a) state.btnPressed.a = true;
    if (bNow && !state.btn.b) state.btnPressed.b = true;
    if (startNow && !state.btn.start) state.btnPressed.start = true;
    if (selectNow && !state.btn.select) state.btnPressed.select = true;

    state.btn.a = aNow;
    state.btn.b = bNow;
    state.btn.start = startNow;
    state.btn.select = selectNow;

    state.run = isDown('shift');

    // Touch axes override if keyboard idle
    if (state.axes.x === 0 && state.axes.y === 0) {
      state.axes.x = state.touchAxes.x;
      state.axes.y = state.touchAxes.y;
    }
  }

  function postUpdate() {
    state.pressed.clear();
    state.released.clear();
    state.btnPressed.a = false;
    state.btnPressed.b = false;
    state.btnPressed.start = false;
    state.btnPressed.select = false;
  }

  function destroy() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  // Gamepad support (XInput via Gamepad API). Works with Xbox controllers and most pads.
  function readGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && pads[0];
    if (!gp) return;

    const ax0 = gp.axes?.[0] ?? 0;
    const ax1 = gp.axes?.[1] ?? 0;
    const dz = 0.18;
    const x = Math.abs(ax0) < dz ? 0 : ax0;
    const y = Math.abs(ax1) < dz ? 0 : ax1;

    // XInput mapping (standard)
    const A = !!gp.buttons?.[0]?.pressed;
    const B = !!gp.buttons?.[1]?.pressed;
    const START = !!gp.buttons?.[9]?.pressed;
    const SELECT = !!gp.buttons?.[8]?.pressed;

    if (A && !state.btn.a) state.btnPressed.a = true;
    if (B && !state.btn.b) state.btnPressed.b = true;
    if (START && !state.btn.start) state.btnPressed.start = true;
    if (SELECT && !state.btn.select) state.btnPressed.select = true;

    state.btn.a = state.btn.a || A;
    state.btn.b = state.btn.b || B;
    state.btn.start = state.btn.start || START;
    state.btn.select = state.btn.select || SELECT;

    // If keyboard/touch is idle, allow stick to drive
    if (state.axes.x === 0 && state.axes.y === 0) {
      state.axes.x = clamp(x, -1, 1);
      state.axes.y = clamp(y, -1, 1);
    }
  }

  function setTouchAxes(x, y) {
    state.touchAxes.x = clamp(x, -1, 1);
    state.touchAxes.y = clamp(y, -1, 1);
  }

  function touchPress(btn, down) {
    if (!state.btn[btn] && down) state.btnPressed[btn] = true;
    state.btn[btn] = down;
  }

  return {
    state,
    update,
    postUpdate,
    isDown,
    wasPressed,
    readGamepad,
    setTouchAxes,
    touchPress,
    destroy,
  };
}
