export const CONFIG = {
  // Internal resolution (Game Boy classic)
  WIDTH: 160,
  HEIGHT: 144,
  SCALE: 4,

  TILE: 8,

  // World
  WORLD_W: 160, // tiles
  WORLD_H: 160, // tiles

  // Player
  PLAYER: {
    SPEED: 52, // px/s
    RUN_MULT: 1.55,
    SIZE: 6,
    MAX_HP: 100,
    MAX_EN: 100,
  },

  CAMERA: {
    LERP: 0.12,
    DEADZONE: 10,
  },

  // Palette (Game Boy-ish + neon accent)
  PALETTE: {
    gb0: '#0b1f10',
    gb1: '#1f3a1f',
    gb2: '#5d8a3c',
    gb3: '#cbe38a',
    ui:  '#d7f3d7',
    accent: '#eab308',
  },
};
