export const CONFIG = {
  // Internal resolution (Hotline Miami-ish pixel look)
  // (low-res buffer scaled up, crisp)
  // Increased internal resolution (still pixel-crisp)
  WIDTH: 480,
  HEIGHT: 270,
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
    bg: '#07020f',
    floorA: '#2a1456',
    floorB: '#3a1b73',
    wall: '#120826',
    wallEdge: '#ff2bd6',

    // accents
    neonPink: '#ff2bd6',
    neonCyan: '#15f4ee',
    neonYellow: '#ffe14a',
    neonGreen: '#39ff88',
    blood: '#ff1744',

    // entities/UI
    player: '#e6f7ff',
    ink: '#dbe7ff',
  },

  POSTFX: {
    scanlines: true,
    noise: true,
    chroma: true,
    vignette: true,

    scanlineAlpha: 0.08,
    noiseAlpha: 0.08,
    chromaOffset: 1, // px
    vignetteAlpha: 0.55,
  },
};
