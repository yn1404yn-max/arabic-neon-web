/**
 * RetroLED Matrix Engine
 * Transforms Arabic typography into realistic electronic LED scoreboard & billboard matrices
 * Supports:
 * - Circular, square, and rounded LED dots
 * - Unlit LED background bezels
 * - Dynamic blooming and scanlines
 * - Real-time pixel sampling from offscreen canvas
 */

export class RetroLEDMatrix {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.offscreen = document.createElement('canvas');
    this.offCtx = this.offscreen.getContext('2d', { willReadFrequently: true });
    this.devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width * this.devicePixelRatio;
    this.canvas.height = height * this.devicePixelRatio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);

    this.offscreen.width = width;
    this.offscreen.height = height;
  }

  /**
   * Render Text as an LED Matrix
   */
  renderLED(text, options = {}) {
    const {
      x = this.width / 2,
      y = this.height / 2,
      fontFamily = 'Cairo',
      fontWeight = 800,
      fontSize = 72,
      ledColor = '#ffb703', // Amber by default
      unlitColor = '#121726', // Inactive LED bezel
      dotSize = 5,
      dotSpacing = 3,
      dotShape = 'circle', // 'circle' | 'square' | 'rounded'
      glowIntensity = 3,
      showUnlitGrid = true,
      scanlines = true,
      flickerFactor = 1.0,
      clipPercent = 1.0
    } = options;

    if (!text || flickerFactor <= 0.05) return;

    const w = this.width;
    const h = this.height;
    const step = dotSize + dotSpacing;

    // 1. Clear offscreen canvas and rasterize Arabic text
    this.offCtx.clearRect(0, 0, w, h);
    this.offCtx.fillStyle = '#ffffff';
    this.offCtx.font = `${fontWeight} ${fontSize}px '${fontFamily}', 'Cairo', 'Tajawal', sans-serif`;
    this.offCtx.textAlign = 'center';
    this.offCtx.textBaseline = 'middle';
    this.offCtx.direction = 'rtl';
    this.offCtx.fillText(text, x, y);

    // 2. Read pixel alpha density
    const imgData = this.offCtx.getImageData(0, 0, w, h);
    const pixels = imgData.data;

    const ctx = this.ctx;
    ctx.save();

    // Clip for typewriter if needed
    if (clipPercent < 1.0) {
      ctx.beginPath();
      const visibleWidth = w * clipPercent;
      ctx.rect(w - visibleWidth, 0, visibleWidth, h);
      ctx.clip();
    }

    // Determine active bounds to optimize rendering loop
    const cols = Math.floor(w / step);
    const rows = Math.floor(h / step);

    // 3. Optional ambient LED glow behind active dots
    if (glowIntensity > 0 && flickerFactor > 0.2) {
      ctx.save();
      ctx.shadowColor = ledColor;
      ctx.shadowBlur = dotSize * 3.5 * glowIntensity;
      ctx.fillStyle = ledColor;
      ctx.globalAlpha = 0.25 * flickerFactor;

      for (let r = 0; r < rows; r++) {
        const py = Math.floor(r * step + dotSize / 2);
        for (let c = 0; c < cols; c++) {
          const px = Math.floor(c * step + dotSize / 2);
          const pIdx = (py * w + px) * 4;
          const alpha = pixels[pIdx + 3];

          if (alpha > 70) {
            ctx.beginPath();
            ctx.arc(px, py, dotSize * 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // 4. Render LED dots (both unlit grid and lit pixels)
    for (let r = 0; r < rows; r++) {
      const py = Math.floor(r * step);
      const sampleY = Math.min(h - 1, py + Math.floor(dotSize / 2));

      for (let c = 0; c < cols; c++) {
        const px = Math.floor(c * step);
        const sampleX = Math.min(w - 1, px + Math.floor(dotSize / 2));
        const pIdx = (sampleY * w + sampleX) * 4;
        const alpha = pixels[pIdx + 3] || 0;

        const isLit = alpha > 70;

        if (isLit) {
          // Lit LED with highlight and glow
          ctx.save();
          const intensityNorm = Math.min(1.0, (alpha / 255) * flickerFactor);
          ctx.globalAlpha = intensityNorm;

          // LED Dot Glow
          ctx.shadowColor = ledColor;
          ctx.shadowBlur = dotSize * 1.8 * (glowIntensity / 2);
          ctx.fillStyle = ledColor;

          this.drawDotShape(ctx, px, py, dotSize, dotShape);
          ctx.fill();

          // Hot inner reflection / specular center
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.65 * intensityNorm;
          ctx.shadowBlur = 0;
          this.drawDotShape(ctx, px + dotSize * 0.25, py + dotSize * 0.2, dotSize * 0.45, dotShape);
          ctx.fill();

          ctx.restore();
        } else if (showUnlitGrid) {
          // Unlit LED housing
          ctx.save();
          ctx.fillStyle = unlitColor;
          this.drawDotShape(ctx, px, py, dotSize, dotShape);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // 5. Scanlines Overlay (CRTs / Video Wall effect)
    if (scanlines) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      for (let y = 0; y < h; y += step) {
        ctx.fillRect(0, y + dotSize, w, dotSpacing);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw dot shape based on style
  drawDotShape(ctx, x, y, size, shape) {
    ctx.beginPath();
    if (shape === 'circle') {
      const radius = size / 2;
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
    } else if (shape === 'rounded') {
      const r = Math.max(1, size * 0.25);
      ctx.roundRect ? ctx.roundRect(x, y, size, size, r) : ctx.rect(x, y, size, size);
    } else {
      ctx.rect(x, y, size, size);
    }
  }
}
