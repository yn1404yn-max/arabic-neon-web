/**
 * Multi-Format Export Engine
 * 1. PNG: High-res transparent or dark background export
 * 2. SVG: Scalable vector with embedded drop-shadow filters
 * 3. CSS: Ready-to-use HTML/CSS snippet with @keyframes and text-shadow
 * 4. Video (WebM/MP4): In-browser deterministic recording via MediaRecorder API
 */

export class ExportEngine {
  constructor(canvas) {
    this.canvas = canvas;
  }

  // 1. Export PNG
  downloadPNG(filename = 'arabic-neon-sign.png', transparent = false) {
    let targetCanvas = this.canvas;

    if (transparent) {
      // Create offscreen copy with transparent background
      const off = document.createElement('canvas');
      off.width = this.canvas.width;
      off.height = this.canvas.height;
      const oCtx = off.getContext('2d');
      // Draw image
      oCtx.drawImage(this.canvas, 0, 0);
      targetCanvas = off;
    }

    targetCanvas.toBlob(blob => {
      if (!blob) return;
      this.triggerDownload(blob, filename);
    }, 'image/png');
  }

  // 2. Export SVG Vector with Neon Filter
  exportSVG(text, params, filename = 'arabic-neon-sign.svg') {
    const {
      font = 'Cairo',
      fontWeight = 800,
      fontSize = 80,
      glowColor = '#ff1361',
      coreColor = '#ffffff',
      intensity = 5,
      blurRadius = 18
    } = params;

    const width = 1000;
    const height = 450;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&amp;display=swap');
      .neon-text {
        font-family: '${font}', 'Cairo', sans-serif;
        font-weight: ${fontWeight};
        font-size: ${fontSize}px;
        text-anchor: middle;
        dominant-baseline: central;
        direction: rtl;
      }
    </style>
    <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${blurRadius * 1.2}" result="blur1" />
      <feGaussianBlur stdDeviation="${blurRadius * 0.6}" result="blur2" />
      <feGaussianBlur stdDeviation="${blurRadius * 0.2}" result="blur3" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="blur3" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#080a12" />

  <!-- Outer Ambient Glow Layer -->
  <text x="50%" y="50%" class="neon-text" fill="${glowColor}" filter="url(#neon-glow)" opacity="0.9">
    ${this.escapeXml(text)}
  </text>

  <!-- Sharp Inner Core Layer -->
  <text x="50%" y="50%" class="neon-text" fill="${coreColor}" stroke="${glowColor}" stroke-width="3">
    ${this.escapeXml(text)}
  </text>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    this.triggerDownload(blob, filename);
  }

  // 3. Generate CSS & HTML Snippet
  generateCSS(text, params) {
    const {
      font = 'Cairo',
      fontWeight = 800,
      fontSize = 72,
      glowColor = '#ff1361',
      coreColor = '#ffffff',
      blurRadius = 18,
      animMode = 'flicker',
      animSpeed = 1.0
    } = params;

    let keyframes = '';
    let animationCSS = '';

    if (animMode === 'flicker') {
      keyframes = `
@keyframes neon-flicker {
  0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
    opacity: 1;
    filter: brightness(1);
  }
  20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
    opacity: 0.4;
    filter: brightness(0.6);
  }
}`;
      animationCSS = `animation: neon-flicker ${(2.5 / animSpeed).toFixed(1)}s infinite;`;
    } else if (animMode === 'pulse') {
      keyframes = `
@keyframes neon-pulse {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 ${blurRadius}px ${glowColor});
    transform: scale(1);
  }
  50% {
    filter: brightness(1.3) drop-shadow(0 0 ${blurRadius * 1.8}px ${glowColor});
    transform: scale(1.02);
  }
}`;
      animationCSS = `animation: neon-pulse ${(2.0 / animSpeed).toFixed(1)}s ease-in-out infinite;`;
    }

    return `<!-- كود HTML -->
<div class="arabic-neon-container">
  <h1 class="arabic-neon-text">${this.escapeXml(text)}</h1>
</div>

<!-- كود CSS -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&display=swap');

.arabic-neon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #080a12;
  min-height: 250px;
  padding: 40px;
}

.arabic-neon-text {
  font-family: '${font}', 'Cairo', sans-serif;
  font-weight: ${fontWeight};
  font-size: ${fontSize}px;
  color: ${coreColor};
  direction: rtl;
  text-align: center;
  text-shadow:
    0 0 7px ${coreColor},
    0 0 14px ${glowColor},
    0 0 28px ${glowColor},
    0 0 42px ${glowColor},
    0 0 70px ${glowColor};
  ${animationCSS}
}
${keyframes}
</style>`;
  }

  // 4. Record Video (WebM / MP4) via MediaRecorder
  async recordVideo(durationMs = 3500, filename = 'arabic-neon-animation.webm') {
    if (!this.canvas.captureStream) {
      alert('ميزة تسجيل الفيديو غير مدعومة في هذا المتصفح');
      return;
    }

    const stream = this.canvas.captureStream(60);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : (MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm');

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6000000
    });

    const chunks = [];
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        this.triggerDownload(blob, filename.replace(/\.(webm|mp4)$/, `.${ext}`));
        resolve(blob);
      };

      recorder.onerror = reject;
      recorder.start();

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, durationMs);
    });
  }

  escapeXml(unsafe) {
    return (unsafe || '').replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

/**
 * تصدير محتوى الـ Canvas كصورة PNG عالية الجودة
 * @param {HTMLCanvasElement} canvas
 * @param {Object} appState
 * @param {Function} [drawNeonTextFn]
 */
export function exportCanvasAsPNG(canvas, appState = {}, drawNeonTextFn = null) {
  const exportScale = 2; // مضاعفة الجودة (Retina / High-Res)
  const tempCanvas = document.createElement("canvas");
  const baseW = canvas.clientWidth || (canvas.width / (window.devicePixelRatio || 1));
  const baseH = canvas.clientHeight || (canvas.height / (window.devicePixelRatio || 1));
  tempCanvas.width = baseW * exportScale;
  tempCanvas.height = baseH * exportScale;
  const tempCtx = tempCanvas.getContext("2d");

  // رسم خلفية المشهد
  if (appState.bgStyle !== 'transparent') {
    tempCtx.fillStyle = '#080a12';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  }

  if (typeof drawNeonTextFn === 'function') {
    drawNeonTextFn(
      tempCtx,
      appState.text || "يوسف نايف",
      tempCanvas.width / 2,
      tempCanvas.height / 2,
      {
        ...appState,
        fontSize: (appState.fontSize || 52) * exportScale,
        blur: (appState.blur || (appState.glowIntensity * 3.5) || 15) * exportScale
      }
    );
  } else {
    // رسم محتوى الكانفاس الحالي بنعومة
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
  }

  tempCanvas.toBlob((blob) => {
    if (!blob) {
      alert("فشل تصدير الصورة، يرجى المحاولة مرة أخرى.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `neon-arabic-${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, "image/png");
}
