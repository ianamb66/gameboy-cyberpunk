import { CONFIG } from './config.js';

export function createRenderer(canvas) {
  /**
   * We render to an internal low-res buffer (160x144) and let CSS scale it.
   */
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  function clear() {
    // Deep neon night background
    ctx.fillStyle = CONFIG.PALETTE.bg;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // Subtle vignette (cheap)
    const g = ctx.createRadialGradient(
      CONFIG.WIDTH * 0.5,
      CONFIG.HEIGHT * 0.55,
      20,
      CONFIG.WIDTH * 0.5,
      CONFIG.HEIGHT * 0.55,
      Math.max(CONFIG.WIDTH, CONFIG.HEIGHT)
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  }

  function drawMap(map, camera) {
    const tile = map.tile;
    const startX = Math.floor(camera.x / tile);
    const startY = Math.floor(camera.y / tile);
    const endX = Math.ceil((camera.x + camera.w) / tile);
    const endY = Math.ceil((camera.y + camera.h) / tile);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const t = map.getTile(tx, ty);
        const x = tx * tile - camera.x;
        const y = ty * tile - camera.y;

        if (t === 1) {
          // wall
          ctx.fillStyle = CONFIG.PALETTE.wall;
          ctx.fillRect(x, y, tile, tile);
          // neon edge highlight
          ctx.fillStyle = CONFIG.PALETTE.wallEdge;
          ctx.globalAlpha = 0.35;
          ctx.fillRect(x, y, tile, 1);
          ctx.fillRect(x, y, 1, tile);
          ctx.globalAlpha = 1;
        } else if (t === 2) {
          // hazard / neon spill
          ctx.fillStyle = CONFIG.PALETTE.neonCyan;
          ctx.globalAlpha = 0.22;
          ctx.fillRect(x, y, tile, tile);
          ctx.globalAlpha = 1;
          ctx.fillStyle = CONFIG.PALETTE.neonCyan;
          ctx.globalAlpha = 0.55;
          ctx.fillRect(x + 2, y + 2, 1, 1);
          ctx.fillRect(x + 6, y + 5, 1, 1);
          ctx.globalAlpha = 1;
        } else {
          // floor (checker + subtle scanline)
          const alt = ((tx + ty) & 1) === 0;
          ctx.fillStyle = alt ? CONFIG.PALETTE.floorA : CONFIG.PALETTE.floorB;
          ctx.fillRect(x, y, tile, tile);

          ctx.globalAlpha = 0.08;
          ctx.fillStyle = '#000';
          ctx.fillRect(x, y, tile, 1);
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function drawPlayer(player, camera) {
    const x = player.x - camera.x;
    const y = player.y - camera.y;

    // Shadow
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.ellipse(x, y + player.r - 1, player.r, Math.max(2, player.r / 2), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Body
    ctx.fillStyle = CONFIG.PALETTE.player;
    ctx.beginPath();
    ctx.arc(x, y, player.r, 0, Math.PI * 2);
    ctx.fill();

    // Neon outline
    ctx.strokeStyle = CONFIG.PALETTE.neonPink;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, player.r + 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Facing pip
    ctx.fillStyle = CONFIG.PALETTE.neonYellow;
    ctx.fillRect(
      Math.round(x + player.facing.x * (player.r - 1)),
      Math.round(y + player.facing.y * (player.r - 1)),
      2,
      2
    );
  }

  function drawDebugText(lines) {
    ctx.fillStyle = CONFIG.PALETTE.ink;
    ctx.globalAlpha = 0.92;
    ctx.font = '8px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    const x = 4;
    let y = CONFIG.HEIGHT - 4 - (lines.length - 1) * 9;
    for (const line of lines) {
      ctx.fillText(line, x, y);
      y += 9;
    }
    ctx.globalAlpha = 1;
  }

  return { ctx, clear, drawMap, drawPlayer, drawDebugText };
}
