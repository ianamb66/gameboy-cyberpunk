import { createGame } from './src/game.js';
import { bindTouchControls } from './src/touchControls.js';

const canvas = document.getElementById('screen');
const ui = {
  hpBar: document.getElementById('hpBar'),
  enBar: document.getElementById('enBar'),
  coordsChip: document.getElementById('coordsChip'),
  districtChip: document.getElementById('districtChip'),

  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalBody: document.getElementById('modalBody'),
  btnResume: document.getElementById('btnResume'),
  btnReset: document.getElementById('btnReset'),

  settingsModal: document.getElementById('settingsModal'),
  toggleOnscreen: document.getElementById('toggleOnscreen'),
  togglePostfx: document.getElementById('togglePostfx'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),

  minimap: document.getElementById('minimap'),
  minimapCanvas: document.getElementById('minimapCanvas'),

  onscreen: document.getElementById('onscreen'),
  touchpad: document.getElementById('touchpad'),
  touchstick: document.getElementById('touchstick'),
  touchA: document.getElementById('touchA'),
  touchB: document.getElementById('touchB'),
  touchStart: document.getElementById('touchStart'),
  touchSelect: document.getElementById('touchSelect'),
};

const game = createGame({ canvas, ui });

// Touch controls can be toggled from Settings (they remain bound, but UI can hide)
bindTouchControls(ui, game.input);

game.start();
