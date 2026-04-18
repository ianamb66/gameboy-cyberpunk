import { clamp } from './utils.js';

export function bindTouchControls(ui, input) {
  if (!ui.touchpad || !ui.touchstick) return { destroy() {} };

  let pointerId = null;
  const center = { x: 0, y: 0 };
  const maxR = 55;

  function setStick(dx, dy) {
    ui.touchstick.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function updateAxesFromPointer(clientX, clientY) {
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    const dist = Math.hypot(dx, dy);
    const k = dist > maxR ? maxR / dist : 1;
    const ndx = dx * k;
    const ndy = dy * k;
    setStick(ndx, ndy);
    input.setTouchAxes(clamp(ndx / maxR, -1, 1), clamp(ndy / maxR, -1, 1));
  }

  function onDown(e) {
    if (pointerId !== null) return;
    pointerId = e.pointerId;
    const r = ui.touchpad.getBoundingClientRect();
    center.x = r.left + r.width / 2;
    center.y = r.top + r.height / 2;
    ui.touchpad.setPointerCapture(pointerId);
    updateAxesFromPointer(e.clientX, e.clientY);
  }

  function onMove(e) {
    if (e.pointerId !== pointerId) return;
    updateAxesFromPointer(e.clientX, e.clientY);
  }

  function onUp(e) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    setStick(0, 0);
    input.setTouchAxes(0, 0);
  }

  ui.touchpad.addEventListener('pointerdown', onDown);
  ui.touchpad.addEventListener('pointermove', onMove);
  ui.touchpad.addEventListener('pointerup', onUp);
  ui.touchpad.addEventListener('pointercancel', onUp);

  function bindBtn(el, btnName) {
    if (!el) return;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      input.touchPress(btnName, true);
      el.setPointerCapture(e.pointerId);
    });
    const up = (e) => {
      e.preventDefault();
      input.touchPress(btnName, false);
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  bindBtn(ui.touchA, 'a');
  bindBtn(ui.touchB, 'b');
  bindBtn(ui.touchStart, 'start');
  bindBtn(ui.touchSelect, 'select');

  return {
    destroy() {
      ui.touchpad.removeEventListener('pointerdown', onDown);
      ui.touchpad.removeEventListener('pointermove', onMove);
      ui.touchpad.removeEventListener('pointerup', onUp);
      ui.touchpad.removeEventListener('pointercancel', onUp);
    },
  };
}
