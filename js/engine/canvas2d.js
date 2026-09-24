/**
 * Canvas2D Neon Renderer
 * High-performance multi-layer neon glow and atmospheric rendering
 * Based on authentic physical neon tube optics:
 * 1. Wide diffuse ambient bloom
 * 2. Vibrant colored outer gas glow
 * 3. Sharp glass tube outline
 * 4. White-hot plasma inner core
 */

export class Canvas2DRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
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
  }

  // Draw background (studio dark, brick wall, dark mesh, or transparent)
  drawBackground(bgStyle = 'studio', customColor = '#080a12') {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (bgStyle === 'transparent') {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    if (bgStyle === 'studio') {
      // Vignette radial gradient dark studio
      const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.85);
      grad.addColorStop(0, '#101524');
      grad.addColorStop(0.55, '#0a0d17');
      grad.addColorStop(1, '#05070c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (bgStyle === 'solid') {
      ctx.fillStyle = customColor;
      ctx.fillRect(0, 0, w, h);
    } else if (bgStyle === 'brick') {
      // Procedural dark brick wall pattern
      ctx.fillStyle = '#0a0d15';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#141a29';
      ctx.lineWidth = 1.5;
      const brickW = 60;
      const brickH = 26;
      let row = 0;
      for (let y = 0; y < h; y += brickH) {
        const xOffset = (row % 2 === 0) ? 0 : -brickW / 2;
        for (let x = xOffset; x < w + brickW; x += brickW) {
          ctx.strokeRect(x, y, brickW, brickH);
        }
        row++;
      }

      // Vignette overlay
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
      vig.addColorStop(0, 'rgba(0,0,0,0.1)');
      vig.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    } else if (bgStyle === 'grid') {
      // Cyberpunk dark grid
      ctx.fillStyle = '#070913';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#111728';
      ctx.lineWidth = 1;
      const step = 32;
      ctx.beginPath();
      for (let x = 0; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }
  }

  /**
   * Render Multi-layer Neon Text
   */
  renderNeonText(text, options = {}) {
    const ctx = this.ctx;
    const {
      x = this.width / 2,
      y = this.height / 2,
      fontFamily = 'Cairo',
      fontWeight = 800,
      fontSize = 80,
      glowColor = '#ff1361',
      coreColor = '#ffffff',
      intensity = 5,
      blurRadius = 18,
      tubeRadius = 4,
      flickerFactor = 1.0,
      clipPercent = 1.0, // For typewriter animation
      textAlign = 'center',
      textBaseline = 'middle'
    } = options;

    if (!text || flickerFactor <= 0.05) return;

    ctx.save();

    // Clip for typewriter if needed
    if (clipPercent < 1.0) {
      ctx.beginPath();
      // In RTL: reveals from right to left
      const visibleWidth = this.width * clipPercent;
      ctx.rect(this.width - visibleWidth, 0, visibleWidth, this.height);
      ctx.clip();
    }

    ctx.font = `${fontWeight} ${fontSize}px '${fontFamily}', 'Cairo', 'Tajawal', sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.direction = 'rtl';

    // Effective intensity modified by flicker
    const effIntensity = Math.max(1, Math.round(intensity * flickerFactor));
    const effGlow = glowColor;

    // Layer 1: Ambient Wide Bloom (Large spread, soft opacity)
    ctx.save();
    ctx.globalAlpha = 0.35 * flickerFactor;
    for (let i = 1; i <= 3; i++) {
      ctx.shadowColor = effGlow;
      ctx.shadowBlur = blurRadius * 2.8 * i;
      ctx.fillStyle = effGlow;
      ctx.fillText(text, x, y);
    }
    ctx.restore();

    // Layer 2: Radiant Colored Glow (Main vibrant neon halo)
    ctx.save();
    ctx.globalAlpha = 0.85 * flickerFactor;
    for (let i = 1; i <= effIntensity; i++) {
      ctx.shadowColor = effGlow;
      ctx.shadowBlur = blurRadius * (i * 0.7);
      ctx.fillStyle = effGlow;
      ctx.fillText(text, x, y);
    }
    ctx.restore();

    // Layer 3: Glass Tube Stroke (Simulates colored glass tube boundary)
    ctx.save();
    ctx.globalAlpha = 0.95 * flickerFactor;
    ctx.shadowColor = effGlow;
    ctx.shadowBlur = blurRadius * 0.4;
    ctx.strokeStyle = effGlow;
    ctx.lineWidth = Math.max(2, tubeRadius * 1.6);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    ctx.restore();

    // Layer 4: White-Hot Plasma Core (The intense electrical discharge inside the tube)
    ctx.save();
    ctx.globalAlpha = 1.0 * flickerFactor;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = Math.max(2, blurRadius * 0.2);
    ctx.fillStyle = coreColor;
    ctx.fillText(text, x, y);

    // Inner thin core line for extra brilliance
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, tubeRadius * 0.5);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    ctx.restore();

    ctx.restore();
  }

  // Measure text dimensions accurately
  measureText(text, fontFamily = 'Cairo', fontSize = 80, fontWeight = 800) {
    this.ctx.save();
    this.ctx.font = `${fontWeight} ${fontSize}px '${fontFamily}', 'Cairo', 'Tajawal', sans-serif`;
    const metrics = this.ctx.measureText(text);
    this.ctx.restore();
    return {
      width: metrics.width,
      actualBoundingBoxAscent: metrics.actualBoundingBoxAscent || fontSize * 0.8,
      actualBoundingBoxDescent: metrics.actualBoundingBoxDescent || fontSize * 0.2
    };
  }
}

/**
 * دالة رسم نص النيون الأساسية المتوافقة مع النموذج
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} x 
 * @param {number} y 
 * @param {Object} options 
 */
export function drawNeonText(ctx, text, x, y, options = {}) {
  const {
    textColor = '#FFFFFF',
    glowColor = '#7C6FFF',
    blur = 15,
    intensity = 4,
    fontSize = 52,
    fontFamily = 'Tajawal',
    fontWeight = 700
  } = options;

  ctx.save();
  ctx.font = `bold ${fontSize}px '${fontFamily}', 'Tajawal', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // طبقات التوهج الخارجية
  for (let i = intensity; i > 0; i--) {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = blur * i;
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.35 / i;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // الطبقة المركزية والتصحيح الحاد
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = blur * 0.5;
  ctx.fillStyle = glowColor;
  ctx.fillText(text, x, y);
  ctx.restore();

  // الطبقة الأساسية البيضاء الحادة + خط حافة ناصع
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(1, fontSize * 0.02);
  ctx.strokeText(text, x, y);
  ctx.restore();

  ctx.restore();
}

/**
 * رسم خلفية الـ Canvas والإطار المحيط المتوهج
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} width 
 * @param {number} height 
 * @param {Object} options 
 */
export function drawBackgroundAndFrame(ctx, width, height, options = {}) {
  const { bgColor = "#0A0A0F", frameStyle = "none", glowColor = "#7C6FFF" } = options;
  
  // 1. رسم خلفية الـ Canvas
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. رسم الإطار إذا كان مفعّلاً
  if (frameStyle && frameStyle !== "none") {
    ctx.save();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;

    const padding = 35; // المسافة بين الإطار وحواف الـ Canvas

    if (frameStyle === "box") {
      // إطار مستطيل متوهج كامل
      ctx.strokeRect(padding, padding, width - (padding * 2), height - (padding * 2));
    } 
    else if (frameStyle === "corners") {
      // إطار بزوايا هندسية فقط (تصميم عصري)
      const cornerLength = 40;
      
      // الزاوية العلوية اليسرى
      ctx.beginPath();
      ctx.moveTo(padding, padding + cornerLength);
      ctx.lineTo(padding, padding);
      ctx.lineTo(padding + cornerLength, padding);
      
      // الزاوية العلوية اليمنى
      ctx.moveTo(width - padding - cornerLength, padding);
      ctx.lineTo(width - padding, padding);
      ctx.lineTo(width - padding, padding + cornerLength);
      
      // الزاوية السفلية اليمنى
      ctx.moveTo(width - padding, height - padding - cornerLength);
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(width - padding - cornerLength, height - padding);
      
      // الزاوية السفلية اليسرى
      ctx.moveTo(padding + cornerLength, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(padding, height - padding - cornerLength);
      
      ctx.stroke();
    }
    ctx.restore();
  }
}
