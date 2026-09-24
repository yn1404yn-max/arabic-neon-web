/**
 * Main Application Orchestrator for Arabic Neon & RetroLED Generator
 * Wires Canvas2D, RetroLEDMatrix, ArabicFontManager, AnimationController, Presets, and Exporters.
 */

import { ArabicFontManager } from './fonts/font-loader.js';
import { Canvas2DRenderer } from './engine/canvas2d.js';
import { RetroLEDMatrix } from './engine/led-matrix.js';
import { AnimationController } from './engine/animations.js';
import { PresetManager, saveStateToURL, loadStateFromURL } from './presets/presets.js';
import { ExportEngine } from './export/exporter.js';

class ArabicNeonApp {
  constructor() {
    this.canvas = document.getElementById('neonCanvas');
    this.fontManager = new ArabicFontManager();
    this.neonRenderer = new Canvas2DRenderer(this.canvas);
    this.ledRenderer = new RetroLEDMatrix(this.canvas);
    this.presetManager = new PresetManager();
    this.exportEngine = new ExportEngine(this.canvas);

    // Application state
    this.state = {
      mode: 'neon', // 'neon' or 'led'
      text: 'مقهى الشرق',
      fontFamily: 'Cairo',
      fontSize: 84,
      color: '#00e5ff',
      glowIntensity: 5,
      tubeRadius: 6,
      bgStyle: 'studio',
      animation: 'flicker',
      animSpeed: 1.0,
      isPlaying: true,

      // LED options
      ledShape: 'circle',
      dotSize: 5,
      showUnlit: true,
      scanlines: true
    };

    // Color Swatches
    this.palette = [
      { name: 'سيان سايبربنك', hex: '#00e5ff' },
      { name: 'ياقوت متوهج', hex: '#ff1361' },
      { name: 'كهرمان إلكتروني', hex: '#ffb703' },
      { name: 'زمرد نيون', hex: '#00f59b' },
      { name: 'بنفسجي ملكي', hex: '#9d4edd' },
      { name: 'أزرق كوبالت', hex: '#3a86ff' },
      { name: 'أبيض ليزري', hex: '#f8fafc' },
      { name: 'برتقالي لافا', hex: '#ff4d00' }
    ];

    // Current animation factors calculated each frame
    this.animFactors = {
      flickerFactor: 1.0,
      pulseFactor: 1.0,
      clipPercent: 1.0,
      scrollX: 0
    };

    // Setup AnimationController
    this.animator = new AnimationController((animState) => {
      this.animFactors = animState;
      this.render();
    });
  }

  async init() {
    // 1. Populate UI components
    this.setupFonts();
    this.setupColorSwatches();
    this.setupPresetsUI();
    this.bindEvents();

    // 2. Check for URL Hash state or preset
    const hashState = loadStateFromURL();
    if (hashState) {
      Object.assign(this.state, hashState);
    }
    this.syncUIWithState();

    // 3. Setup canvas sizing
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // 4. Initial font load and render
    await this.fontManager.loadFont(this.state.fontFamily);
    this.animator.setMode(this.state.animation);
    this.animator.setSpeed(this.state.animSpeed);
    this.animator.start();

    // Initial render
    this.render();
  }

  setupFonts() {
    const select = document.getElementById('font-select');
    if (!select) return;
    const fonts = this.fontManager.getFontList();
    select.innerHTML = fonts.map(f => 
      `<option value="${f.id}" ${f.id === this.state.fontFamily ? 'selected' : ''}>${f.nameAr}</option>`
    ).join('');
  }

  setupColorSwatches() {
    const container = document.getElementById('color-swatches');
    if (!container) return;
    container.innerHTML = this.palette.map(p => `
      <button class="swatch-btn ${p.hex === this.state.color ? 'active' : ''}" 
              data-hex="${p.hex}" 
              style="background-color: ${p.hex};" 
              title="${p.name}">
      </button>
    `).join('');
  }

  setupPresetsUI() {
    const list = document.getElementById('presets-list');
    if (!list) return;
    const presets = this.presetManager.getCuratedPresets();
    list.innerHTML = presets.map(p => `
      <div class="preset-card" data-preset-id="${p.id}">
        <span class="preset-title" style="color: ${p.color};">${p.name}</span>
        <span class="preset-desc">${p.text} • ${p.fontFamily}</span>
      </div>
    `).join('');
  }

  bindEvents() {
    // Mode switcher buttons
    const btnNeon = document.getElementById('btn-mode-neon');
    const btnLed = document.getElementById('btn-mode-led');
    const ledControls = document.getElementById('led-specific-controls');

    if (btnNeon && btnLed) {
      btnNeon.addEventListener('click', () => {
        this.state.mode = 'neon';
        btnNeon.classList.add('active');
        btnLed.classList.remove('active');
        if (ledControls) ledControls.style.display = 'none';
        this.render();
      });

      btnLed.addEventListener('click', () => {
        this.state.mode = 'led';
        btnLed.classList.add('active');
        btnNeon.classList.remove('active');
        if (ledControls) ledControls.style.display = 'block';
        this.render();
      });
    }

    // Text Input (Zero-click instant reactivity)
    const textInput = document.getElementById('inputText');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        this.state.text = e.target.value || ' ';
        saveStateToURL(this.state);
        this.render();
      });
    }

    // Diacritics insertion
    document.querySelectorAll('.btn-diacritic').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!textInput) return;
        const char = btn.getAttribute('data-char');
        const start = textInput.selectionStart || 0;
        const end = textInput.selectionEnd || 0;
        const val = textInput.value;
        textInput.value = val.substring(0, start) + char + val.substring(end);
        textInput.focus();
        textInput.selectionStart = textInput.selectionEnd = start + char.length;
        this.state.text = textInput.value;
        this.render();
      });
    });

    // Font select change
    const fontSelect = document.getElementById('font-select');
    if (fontSelect) {
      fontSelect.addEventListener('change', async (e) => {
        this.state.fontFamily = e.target.value;
        await this.fontManager.loadFont(this.state.fontFamily);
        this.render();
      });
    }

    // Color Swatches click
    const swatchesContainer = document.getElementById('color-swatches');
    if (swatchesContainer) {
      swatchesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.swatch-btn');
        if (!btn) return;
        document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.color = btn.getAttribute('data-hex');
        const picker = document.getElementById('custom-color-picker');
        if (picker) picker.value = this.state.color;
        this.render();
      });
    }

    // Custom color picker
    const customPicker = document.getElementById('custom-color-picker');
    if (customPicker) {
      customPicker.addEventListener('input', (e) => {
        this.state.color = e.target.value;
        document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
        this.render();
      });
    }

    // Sliders
    const sliderFont = document.getElementById('slider-font-size');
    const valFont = document.getElementById('val-font-size');
    if (sliderFont && valFont) {
      sliderFont.addEventListener('input', (e) => {
        this.state.fontSize = parseInt(e.target.value, 10);
        valFont.textContent = `${this.state.fontSize}px`;
        this.render();
      });
    }

    const sliderGlow = document.getElementById('slider-glow-intensity');
    const valGlow = document.getElementById('val-glow-intensity');
    if (sliderGlow && valGlow) {
      sliderGlow.addEventListener('input', (e) => {
        this.state.glowIntensity = parseInt(e.target.value, 10);
        valGlow.textContent = this.state.glowIntensity;
        this.render();
      });
    }

    const sliderDot = document.getElementById('slider-dot-size');
    const valDot = document.getElementById('val-dot-size');
    if (sliderDot && valDot) {
      sliderDot.addEventListener('input', (e) => {
        this.state.dotSize = parseInt(e.target.value, 10);
        valDot.textContent = `${this.state.dotSize}px`;
        this.render();
      });
    }

    const sliderSpeed = document.getElementById('slider-anim-speed');
    const valSpeed = document.getElementById('val-anim-speed');
    if (sliderSpeed && valSpeed) {
      sliderSpeed.addEventListener('input', (e) => {
        this.state.animSpeed = parseFloat(e.target.value);
        this.animator.setSpeed(this.state.animSpeed);
        valSpeed.textContent = `${this.state.animSpeed.toFixed(1)}x`;
      });
    }

    // Background style toggles
    document.querySelectorAll('#bg-style-group .toggle-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#bg-style-group .toggle-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.bgStyle = btn.getAttribute('data-bg');
        this.render();
      });
    });

    // LED shape toggles
    document.querySelectorAll('#led-shape-group .toggle-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#led-shape-group .toggle-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.ledShape = btn.getAttribute('data-shape');
        this.render();
      });
    });

    // Unlit grid & scanlines
    const checkUnlit = document.getElementById('check-unlit-grid');
    if (checkUnlit) {
      checkUnlit.addEventListener('change', (e) => {
        this.state.showUnlit = e.target.checked;
        this.render();
      });
    }

    const checkScanlines = document.getElementById('check-scanlines');
    if (checkScanlines) {
      checkScanlines.addEventListener('change', (e) => {
        this.state.scanlines = e.target.checked;
        this.render();
      });
    }

    // Animation Mode selection
    document.querySelectorAll('#anim-mode-group .toggle-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#anim-mode-group .toggle-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.animation = btn.getAttribute('data-anim');
        this.animator.setMode(this.state.animation);
      });
    });

    // Play/Pause button
    const btnPlay = document.getElementById('btn-toggle-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.state.isPlaying = !this.state.isPlaying;
        if (this.state.isPlaying) {
          this.animator.start();
          btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i> إيقاف الحركة مؤقتاً';
        } else {
          this.animator.stop();
          btnPlay.innerHTML = '<i class="fa-solid fa-play"></i> استئناف الحركة';
        }
      });
    }

    // Preset selection
    const presetsList = document.getElementById('presets-list');
    if (presetsList) {
      presetsList.addEventListener('click', async (e) => {
        const card = e.target.closest('.preset-card');
        if (!card) return;
        const id = card.getAttribute('data-preset-id');
        const presets = this.presetManager.getCuratedPresets();
        const preset = presets.find(p => p.id === id);
        if (preset) {
          Object.assign(this.state, preset);
          this.syncUIWithState();
          await this.fontManager.loadFont(this.state.fontFamily);
          saveStateToURL(this.state);
          this.render();
        }
      });
    }

    // Tabs switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        document.getElementById(targetId)?.classList.add('active');
      });
    });

    // Mobile Sidebar toggle
    const sidebar = document.getElementById('control-sidebar');
    const toggleSidebarBtn = document.getElementById('btn-toggle-sidebar');
    if (sidebar && toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Share link buttons
    const triggerShare = () => {
      saveStateToURL(this.state);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      alert('تم نسخ رابط التكوين الحالي إلى الحافظة بنجاح!');
    };

    const shareTop = document.getElementById('btn-share-link');
    if (shareTop) shareTop.addEventListener('click', triggerShare);
    const shareBar = document.getElementById('shareBtn');
    if (shareBar) shareBar.addEventListener('click', triggerShare);

    // Direct PNG button on bar
    const exportPngDirect = document.getElementById('exportPngBtn');
    if (exportPngDirect) {
      exportPngDirect.addEventListener('click', () => {
        this.exportEngine.downloadPNG('arabic-neon.png', false);
      });
    }

    // Export Modal Controls
    const modal = document.getElementById('export-modal');
    const btnOpenExport = document.getElementById('btn-open-export');
    const btnCloseExport = document.getElementById('btn-close-export');
    if (modal && btnOpenExport) {
      btnOpenExport.addEventListener('click', () => modal.classList.add('open'));
    }
    if (modal && btnCloseExport) {
      btnCloseExport.addEventListener('click', () => modal.classList.remove('open'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    // Export formats
    document.getElementById('export-opt-png')?.addEventListener('click', () => {
      this.exportEngine.downloadPNG('arabic-neon.png', false);
      modal?.classList.remove('open');
    });

    document.getElementById('export-opt-svg')?.addEventListener('click', () => {
      this.exportEngine.exportSVG(this.state.text, this.state, 'arabic-neon.svg');
      modal?.classList.remove('open');
    });

    document.getElementById('export-opt-css')?.addEventListener('click', () => {
      const css = this.exportEngine.generateCSS(this.state.text, this.state);
      navigator.clipboard?.writeText(css);
      alert('تم نسخ كود CSS & HTML إلى الحافظة بنجاح!');
      modal?.classList.remove('open');
    });

    document.getElementById('export-opt-video')?.addEventListener('click', async () => {
      modal?.classList.remove('open');
      const origText = btnOpenExport.innerHTML;
      btnOpenExport.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التسجيل...';
      try {
        await this.exportEngine.recordVideo(4000, 'arabic-neon-sign.webm');
      } catch (err) {
        alert('تعذر تسجيل الفيديو: ' + err.message);
      } finally {
        btnOpenExport.innerHTML = origText;
      }
    });
  }

  syncUIWithState() {
    const textInput = document.getElementById('inputText');
    if (textInput) textInput.value = this.state.text;

    const fontSelect = document.getElementById('font-select');
    if (fontSelect) fontSelect.value = this.state.fontFamily;

    const sliderFont = document.getElementById('slider-font-size');
    const valFont = document.getElementById('val-font-size');
    if (sliderFont && valFont) {
      sliderFont.value = this.state.fontSize;
      valFont.textContent = `${this.state.fontSize}px`;
    }

    const sliderGlow = document.getElementById('slider-glow-intensity');
    const valGlow = document.getElementById('val-glow-intensity');
    if (sliderGlow && valGlow) {
      sliderGlow.value = this.state.glowIntensity;
      valGlow.textContent = this.state.glowIntensity;
    }

    const picker = document.getElementById('custom-color-picker');
    if (picker) picker.value = this.state.color;

    // Mode buttons
    const btnNeon = document.getElementById('btn-mode-neon');
    const btnLed = document.getElementById('btn-mode-led');
    const ledControls = document.getElementById('led-specific-controls');
    if (btnNeon && btnLed) {
      if (this.state.mode === 'led') {
        btnLed.classList.add('active');
        btnNeon.classList.remove('active');
        if (ledControls) ledControls.style.display = 'block';
      } else {
        btnNeon.classList.add('active');
        btnLed.classList.remove('active');
        if (ledControls) ledControls.style.display = 'none';
      }
    }
  }

  handleResize() {
    const container = document.getElementById('canvas-container');
    if (!container || !this.canvas) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    this.neonRenderer.resize(width, height);
    this.ledRenderer.resize(width, height);

    this.render();
  }

  render() {
    if (!this.canvas) return;

    if (this.state.mode === 'neon') {
      // 1. Draw Background
      this.neonRenderer.drawBackground(this.state.bgStyle, '#070912');

      // 2. Render Neon Arabic Text with animation factors
      this.neonRenderer.renderNeonText(this.state.text, {
        fontFamily: this.state.fontFamily,
        fontSize: this.state.fontSize,
        color: this.state.color,
        intensity: this.state.glowIntensity,
        flickerFactor: this.animFactors.flickerFactor,
        pulseFactor: this.animFactors.pulseFactor,
        clipPercent: this.animFactors.clipPercent,
        scrollX: this.animFactors.scrollX
      });
    } else {
      // Render RetroLED Matrix
      this.ledRenderer.renderLED(this.state.text, {
        fontFamily: this.state.fontFamily,
        fontSize: this.state.fontSize,
        color: this.state.color,
        dotSize: this.state.dotSize,
        shape: this.state.ledShape,
        showUnlit: this.state.showUnlit,
        scanlines: this.state.scanlines,
        bgStyle: this.state.bgStyle,
        flickerFactor: this.animFactors.flickerFactor,
        pulseFactor: this.animFactors.pulseFactor,
        scrollX: this.animFactors.scrollX
      });
    }
  }
}

// Start app once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new ArabicNeonApp();
  app.init().catch(console.error);
});
