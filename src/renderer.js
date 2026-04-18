import { CONFIG } from './config.js';

export function createRenderer(canvas) {
  /**
   * Render world into an offscreen buffer, then apply post-processing (VHS/CRT).
   * Output remains crisp pixel scaling.
   */
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  const buffer = document.createElement('canvas');
  buffer.width = CONFIG.WIDTH;
  buffer.height = CONFIG.HEIGHT;
  const bctx = buffer.getContext('2d', { alpha: false });
  bctx.imageSmoothingEnabled = false;

  // Tiny noise tile for VHS grain
  const noiseTile = document.createElement('canvas');
  noiseTile.width = 64;
  noiseTile.height = 64;
  const nctx = noiseTile.getContext('2d');

  function reseedNoise() {
    const img = nctx.createImageData(noiseTile.width, noiseTile.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i + 0] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nctx.putImageData(img, 0, 0);
  }
  reseedNoise();

  function clear() {
    // Deep neon night background
    bctx.fillStyle = CONFIG.PALETTE.bg;
    bctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  }

  function postFX() {
    // Base
    ctx.drawImage(buffer, 0, 0);

    const fx = CONFIG.POSTFX;

    // Chromatic aberration at edges (cheap RGB split)
    if (fx?.chroma) {
      const o = fx.chromaOffset ?? 1;
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.10;
      // Red-ish
      ctx.drawImage(buffer, -o, 0);
      // Cyan-ish
      ctx.drawImage(buffer, o, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // Scanlines
    if (fx?.scanlines) {
      ctx.globalAlpha = fx.scanlineAlpha ?? 0.08;
      ctx.fillStyle = '#000';
      for (let y = 0; y < CONFIG.HEIGHT; y += 2) {
        ctx.fillRect(0, y, CONFIG.WIDTH, 1);
      }
      ctx.globalAlpha = 1;
    }

    // Noise / VHS grain
    if (fx?.noise) {
      // Refresh every frame (fast enough for 480x270)
      reseedNoise();
      ctx.globalAlpha = fx.noiseAlpha ?? 0.08;
      ctx.globalCompositeOperation = 'overlay';
      for (let y = 0; y < CONFIG.HEIGHT; y += noiseTile.height) {
        for (let x = 0; x < CONFIG.WIDTH; x += noiseTile.width) {
          ctx.drawImage(noiseTile, x, y);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // Vignette
    if (fx?.vignette) {
      const g = ctx.createRadialGradient(
        CONFIG.WIDTH * 0.5,
        CONFIG.HEIGHT * 0.55,
        40,
        CONFIG.WIDTH * 0.5,
        CONFIG.HEIGHT * 0.55,
        Math.max(CONFIG.WIDTH, CONFIG.HEIGHT)
      );
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, `rgba(0,0,0,${fx.vignetteAlpha ?? 0.55})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    }
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
          bctx.fillStyle = CONFIG.PALETTE.wall;
          bctx.fillRect(x, y, tile, tile);
          // neon edge highlight
          bctx.fillStyle = CONFIG.PALETTE.wallEdge;
          bctx.globalAlpha = 0.35;
          bctx.fillRect(x, y, tile, 1);
          bctx.fillRect(x, y, 1, tile);
          bctx.globalAlpha = 1;
        } else if (t === 2) {
          // hazard / neon spill
          bctx.fillStyle = CONFIG.PALETTE.neonCyan;
          bctx.globalAlpha = 0.22;
          bctx.fillRect(x, y, tile, tile);
          bctx.globalAlpha = 1;
          bctx.fillStyle = CONFIG.PALETTE.neonCyan;
          bctx.globalAlpha = 0.55;
          bctx.fillRect(x + 2, y + 2, 1, 1);
          bctx.fillRect(x + 6, y + 5, 1, 1);
          bctx.globalAlpha = 1;
        } else {
          // floor (checker)
          const alt = ((tx + ty) & 1) === 0;
          bctx.fillStyle = alt ? CONFIG.PALETTE.floorA : CONFIG.PALETTE.floorB;
          bctx.fillRect(x, y, tile, tile);

          // subtle grime lines
          bctx.globalAlpha = 0.10;
          bctx.fillStyle = '#000';
          bctx.fillRect(x, y, tile, 1);
          bctx.globalAlpha = 1;
        }
      }
    }
  }

  function drawPlayer(player, camera) {
    const x = player.x - camera.x;
    const y = player.y - camera.y;

    // Shadow
    bctx.fillStyle = '#000000';
    bctx.globalAlpha = 0.25;
    bctx.beginPath();
    bctx.ellipse(x, y + player.r - 1, player.r, Math.max(2, player.r / 2), 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.globalAlpha = 1;

    // Body
    bctx.fillStyle = CONFIG.PALETTE.player;
    bctx.beginPath();
    bctx.arc(x, y, player.r, 0, Math.PI * 2);
    bctx.fill();

    // Neon outline
    bctx.strokeStyle = CONFIG.PALETTE.neonPink;
    bctx.globalAlpha = 0.65;
    bctx.lineWidth = 1;
    bctx.beginPath();
    bctx.arc(x, y, player.r + 0.2, 0, Math.PI * 2);
    bctx.stroke();
    bctx.globalAlpha = 1;

    // Facing pip
    bctx.fillStyle = CONFIG.PALETTE.neonYellow;
    bctx.fillRect(
      Math.round(x + player.facing.x * (player.r - 1)),
      Math.round(y + player.facing.y * (player.r - 1)),
      2,
      2
    );
  }

  function drawDebugText(lines) {
    bctx.fillStyle = CONFIG.PALETTE.ink;
    bctx.globalAlpha = 0.92;
    bctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    const x = 6;
    let y = CONFIG.HEIGHT - 8 - (lines.length - 1) * 12;
    for (const line of lines) {
      bctx.fillText(line, x, y);
      y += 12;
    }
    bctx.globalAlpha = 1;
  }

  function present() {
    postFX();
  }

  return { ctx, clear, drawMap, drawPlayer, drawDebugText, present };
}
