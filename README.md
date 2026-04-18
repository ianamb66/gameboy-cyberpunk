# NEON//POCKET (Phase 1)

Cyberpunk open-world-ish RPG, rendered like a Game Boy demake — but running as a modern web game.

## Run locally

Option A (simple):
- open `index.html` with a local server (recommended because ES modules).

```bash
cd gameboy-cyberpunk
python3 -m http.server 5173
# open http://localhost:5173
```

Controls:
- Move: WASD / Arrow keys
- Run: Shift
- Toggle minimap: M
- Pause: Esc

## Folder structure

- `index.html`
- `styles.css`
- `main.js`
- `src/` contains modular game code (config, input, camera, world, map, player, renderer, UI, utils)

## Phase 1 implemented

- Canvas 2D game loop (delta time)
- Internal low-res rendering (160x144), crisp pixel scaling
- Camera follows player
- Large map (tile-based) with basic collision
- Minimal HUD + minimap overlay
- Keyboard input + basic gamepad movement support

Next phases will add: districts loading, enemies, combat, weapons, loot, cyberware, hacking, vehicles, missions, save system.
