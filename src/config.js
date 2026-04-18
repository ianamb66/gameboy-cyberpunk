export const CONFIG = {
  // Internal resolution (Hotline Miami-ish pixel look)
  // (low-res buffer scaled up, crisp)
  WIDTH: 320,
  HEIGHT: 180,
  SCALE: 4,

  TILE: 10,

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

  // Palette (Hotline Miami vibe: neon + deep shadows)
  PALETTE: {
    // world
    bg: '#0b0616',
    floorA: '#2a1456',
    floorB: '#3a1b73',
    wall: '#140b2b',
    wallEdge: '#ff2bd6',

    // accents
    neonPink: '#ff2bd6',
    neonCyan: '#15f4ee',
    neonYellow: '#ffe14a',
    neonGreen: '#39ff88',

    // entities/UI
    player: '#e6f7ff',
    ink: '#dbe7ff',
  },
};
