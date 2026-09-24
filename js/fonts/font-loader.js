/**
 * Arabic Typography & Font Loader
 * Non-blocking dynamic font loader using FontFace API + font-display: swap
 * Curated list of high-contrast OFL-licensed Arabic typefaces:
 * - Cairo
 * - Tajawal
 * - Noto Kufi Arabic
 * - Reem Kufi
 * - Amiri
 * - Scheherazade New
 */

export const ARABIC_FONTS = [
  {
    id: 'Cairo',
    nameAr: 'القاهرة (Cairo)',
    category: 'هندسي عصري (Geometric Display)',
    weights: [400, 700, 800, 900],
    googleFontFamily: 'Cairo:wght@400;700;800;900',
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'Tajawal',
    nameAr: 'تجوال (Tajawal)',
    category: 'خفيف ومتوازن (Modern Sans)',
    weights: [400, 500, 700, 800],
    googleFontFamily: 'Tajawal:wght@400;500;700;800',
    fallback: 'sans-serif'
  },
  {
    id: 'Noto Kufi Arabic',
    nameAr: 'نوتو كوفي (Noto Kufi)',
    category: 'كوفي إخباري (Kufic Headlines)',
    weights: [400, 700, 800],
    googleFontFamily: 'Noto+Kufi+Arabic:wght@400;700;800',
    fallback: 'sans-serif'
  },
  {
    id: 'Reem Kufi',
    nameAr: 'ريم كوفي (Reem Kufi)',
    category: 'كوفي فاطمي شاعري (Fatimid Kufic)',
    weights: [400, 700],
    googleFontFamily: 'Reem+Kufi:wght@400;700',
    fallback: 'sans-serif'
  },
  {
    id: 'Amiri',
    nameAr: 'الأميري (Amiri)',
    category: 'نسخي تقليدي كلاسيكي (Classical Naskh)',
    weights: [400, 700],
    googleFontFamily: 'Amiri:wght@400;700',
    fallback: 'serif'
  },
  {
    id: 'Scheherazade New',
    nameAr: 'شهرزاد (Scheherazade)',
    category: 'نسخي عريض (Broad Naskh)',
    weights: [400, 700],
    googleFontFamily: 'Scheherazade+New:wght@400;700',
    fallback: 'serif'
  }
];

export class ArabicFontManager {
  constructor() {
    this.loadedFonts = new Set();
    this.fontFaceCache = new Map();
  }

  // Inject Google Fonts link in non-blocking manner
  async initDefaultFonts() {
    // Load default Cairo & Tajawal immediately
    await this.loadFont('Cairo');
    await this.loadFont('Tajawal');
  }

  // Load a font asynchronously via document.fonts
  async loadFont(fontId) {
    if (this.loadedFonts.has(fontId)) return true;

    const fontDef = ARABIC_FONTS.find(f => f.id === fontId);
    if (!fontDef) return false;

    try {
      // 1. Ensure CSS link element is present
      const linkId = `google-font-${fontId.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontDef.googleFontFamily}&display=swap`;
        document.head.appendChild(link);
      }

      // 2. Wait until browser font engine loads it
      if (document.fonts && document.fonts.load) {
        await Promise.race([
          document.fonts.load(`800 24px "${fontId}"`),
          new Promise(r => setTimeout(r, 1200)) // timeout fallback
        ]);
      }

      this.loadedFonts.add(fontId);
      return true;
    } catch (e) {
      console.warn(`Font ${fontId} loading warning:`, e);
      return false;
    }
  }

  getFontList() {
    return ARABIC_FONTS;
  }
}
