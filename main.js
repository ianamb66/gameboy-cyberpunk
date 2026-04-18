import { createGame } from './src/game.js';

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
  minimap: document.getElementById('minimap'),
  minimapCanvas: document.getElementById('minimapCanvas'),
};

const game = createGame({ canvas, ui });

game.start();
