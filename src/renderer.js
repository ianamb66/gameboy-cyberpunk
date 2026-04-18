import { CONFIG } from './config.js';

export function createRenderer(canvas) {
  /**
   * We render to an internal low-res buffer (160x144) and let CSS scale it.
   */
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  function clear() {
    ctx.fillStyle = CONFIG.PALETTE.gb0;
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
          ctx.fillStyle = CONFIG.PALETTE.gb1;
          ctx.fillRect(x, y, tile, tile);
          ctx.fillStyle = CONFIG.PALETTE.gb0;
          ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
        } else if (t === 2) {
          ctx.fillStyle = CONFIG.PALETTE.accent;
          ctx.globalAlpha = 0.20;
          ctx.fillRect(x, y, tile, tile);
          ctx.globalAlpha = 1;
          // dot pattern
          ctx.fillStyle = CONFIG.PALETTE.gb3;
          ctx.globalAlpha = 0.25;
          ctx.fillRect(x + 2, y + 2, 1, 1);
          ctx.fillRect(x + 5, y + 4, 1, 1);
          ctx.globalAlpha = 1;
        } else {
          // floor
          ctx.fillStyle = CONFIG.PALETTE.gb0;
          ctx.fillRect(x, y, tile, tile);
          // subtle grid
          ctx.fillStyle = CONFIG.PALETTE.gb1;
          ctx.globalAlpha = 0.08;
          ctx.fillRect(x, y, tile, 1);
          ctx.fillRect(x, y, 1, tile);
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
    ctx.fillStyle = CONFIG.PALETTE.gb3;
    ctx.beginPath();
    ctx.arc(x, y, player.r, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = CONFIG.PALETTE.gb2;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, player.r, 0, Math.PI * 2);
    ctx.stroke();

    // Facing pip
    ctx.fillStyle = CONFIG.PALETTE.accent;
    ctx.fillRect(
      Math.round(x + player.facing.x * (player.r - 1)),
      Math.round(y + player.facing.y * (player.r - 1)),
      1,
      1
    );
  }

  function drawDebugText(lines) {
    ctx.fillStyle = CONFIG.PALETTE.gb3;
    ctx.globalAlpha = 0.9;
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
