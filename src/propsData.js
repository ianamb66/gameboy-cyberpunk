// Props are simple pixel-rect shapes for now (no external sprites).
// We later swap these to sprite sheets.

export const PROP_TYPES = {
  tableSmall: { w: 2, h: 2, solid: true, color: 'neonCyan', outline: 'neonPink' },
  tableRound: { w: 3, h: 3, solid: true, color: 'neonPink', outline: 'neonYellow' },
  sofa: { w: 4, h: 2, solid: true, color: 'neonGreen', outline: 'wallEdge' },
  bed: { w: 4, h: 3, solid: true, color: 'neonCyan', outline: 'neonYellow' },
  bar: { w: 10, h: 2, solid: true, color: 'neonYellow', outline: 'neonPink' },
  stool: { w: 1, h: 1, solid: true, color: 'neonPink', outline: 'neonCyan' },
  arcade: { w: 2, h: 2, solid: true, color: 'neonCyan', outline: 'neonPink' },
  plant: { w: 1, h: 1, solid: true, color: 'neonGreen', outline: 'neonYellow' },
  crate: { w: 2, h: 2, solid: true, color: 'wallEdge', outline: 'neonYellow' },

  // Decorative (non-solid)
  bottle: { w: 1, h: 1, solid: false, color: 'neonCyan', outline: null },
  paper: { w: 1, h: 1, solid: false, color: 'ink', outline: null },
  shell: { w: 1, h: 1, solid: false, color: 'neonYellow', outline: null },
};

export const CLUSTERS = {
  barCorner: {
    props: [
      { type: 'bar', ox: 0, oy: 0 },
      { type: 'stool', ox: 2, oy: 2 },
      { type: 'stool', ox: 5, oy: 2 },
      { type: 'stool', ox: 8, oy: 2 },
      { type: 'bottle', ox: 1, oy: 0 },
      { type: 'bottle', ox: 3, oy: 0 },
      { type: 'bottle', ox: 6, oy: 0 },
    ],
  },
  motelRoom: {
    props: [
      { type: 'bed', ox: 0, oy: 0 },
      { type: 'tableSmall', ox: 5, oy: 0 },
      { type: 'sofa', ox: 0, oy: 4 },
      { type: 'paper', ox: 6, oy: 1 },
      { type: 'bottle', ox: 5, oy: 1 },
    ],
  },
  arcadeNook: {
    props: [
      { type: 'arcade', ox: 0, oy: 0 },
      { type: 'arcade', ox: 3, oy: 0 },
      { type: 'stool', ox: 1, oy: 3 },
      { type: 'stool', ox: 4, oy: 3 },
    ],
  },
  roundTableFight: {
    props: [
      { type: 'tableRound', ox: 0, oy: 0 },
      { type: 'bottle', ox: 1, oy: 1 },
      { type: 'shell', ox: 2, oy: 1 },
      { type: 'paper', ox: 1, oy: 2 },
    ],
  },
};
