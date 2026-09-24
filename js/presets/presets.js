/**
 * Presets and URL Sharing Engine
 * - 16 Curated Neon and RetroLED Presets
 * - LocalStorage / IndexedDB preset persistence
 * - URL Hash shareable links (no server required)
 */

export const CURATED_PRESETS = [
  // --- Neon Presets ---
  {
    id: 'neon-cafe',
    name: 'مقهى الشرق',
    category: 'neon',
    desc: 'نيون دافئ بلون أحمر ياقوتي وقلب أبيض',
    params: {
      renderMode: 'neon',
      text: 'مقهى الشرق',
      font: 'Cairo',
      fontWeight: 800,
      fontSize: 84,
      glowColor: '#ff1361',
      coreColor: '#ffffff',
      intensity: 5,
      blurRadius: 18,
      tubeRadius: 4,
      bgStyle: 'studio',
      animMode: 'flicker',
      animSpeed: 1.0
    }
  },
  {
    id: 'neon-cyberpunk',
    name: 'سايبر بانك 2077',
    category: 'neon',
    desc: 'أزرق كهربائي فاقع مع وميض مستقبلي',
    params: {
      renderMode: 'neon',
      text: 'سايبر بانك 2077',
      font: 'Noto Kufi Arabic',
      fontWeight: 800,
      fontSize: 76,
      glowColor: '#00e5ff',
      coreColor: '#ffffff',
      intensity: 6,
      blurRadius: 22,
      tubeRadius: 4.5,
      bgStyle: 'grid',
      animMode: 'pulse',
      animSpeed: 1.2
    }
  },
  {
    id: 'neon-open-24',
    name: 'مفتوح 24 ساعة',
    category: 'neon',
    desc: 'لوحة واجهات كلاسيكية خضراء مشعة',
    params: {
      renderMode: 'neon',
      text: 'مفتوح 24 ساعة',
      font: 'Tajawal',
      fontWeight: 800,
      fontSize: 82,
      glowColor: '#00f59b',
      coreColor: '#ffffff',
      intensity: 5,
      blurRadius: 16,
      tubeRadius: 3.8,
      bgStyle: 'brick',
      animMode: 'steady',
      animSpeed: 1.0
    }
  },
  {
    id: 'neon-ramadan',
    name: 'رمضان كريم',
    category: 'neon',
    desc: 'ذهبي عنبري ملكي بخط ريم كوفي',
    params: {
      renderMode: 'neon',
      text: 'رمضان كريم',
      font: 'Reem Kufi',
      fontWeight: 700,
      fontSize: 90,
      glowColor: '#ffb703',
      coreColor: '#fff9e6',
      intensity: 5,
      blurRadius: 20,
      tubeRadius: 4.2,
      bgStyle: 'studio',
      animMode: 'pulse',
      animSpeed: 0.8
    }
  },
  {
    id: 'neon-cinema',
    name: 'سينما المستقبل',
    category: 'neon',
    desc: 'بنفسجي متوهج مع تأثير الكتابة التتابعية',
    params: {
      renderMode: 'neon',
      text: 'سينما المستقبل',
      font: 'Cairo',
      fontWeight: 900,
      fontSize: 80,
      glowColor: '#9d4edd',
      coreColor: '#f3e8ff',
      intensity: 6,
      blurRadius: 24,
      tubeRadius: 4.5,
      bgStyle: 'studio',
      animMode: 'typewriter',
      animSpeed: 1.2
    }
  },
  {
    id: 'neon-amiri',
    name: 'الخط العربي الأصيل',
    category: 'neon',
    desc: 'نسخي تقليدي ببريق نيون برتقالي ناري',
    params: {
      renderMode: 'neon',
      text: 'جمال الخط العربي',
      font: 'Amiri',
      fontWeight: 700,
      fontSize: 92,
      glowColor: '#ff6b00',
      coreColor: '#ffffff',
      intensity: 5,
      blurRadius: 18,
      tubeRadius: 3.5,
      bgStyle: 'studio',
      animMode: 'flicker',
      animSpeed: 0.9
    }
  },

  // --- RetroLED Presets ---
  {
    id: 'led-ticker',
    name: 'شاشة التداول والأسهم',
    category: 'led',
    desc: 'مصفوفة نقاط LED عنبرية كلاسيكية متحركة',
    params: {
      renderMode: 'led',
      text: 'مؤشر السوق +124.5 نقطة ▲ صعود قياسي',
      font: 'Cairo',
      fontWeight: 700,
      fontSize: 64,
      ledColor: '#ffb703',
      unlitColor: '#141824',
      dotSize: 5,
      dotSpacing: 3,
      dotShape: 'circle',
      glowIntensity: 3,
      showUnlitGrid: true,
      scanlines: true,
      bgStyle: 'solid',
      animMode: 'scroll',
      animSpeed: 1.3
    }
  },
  {
    id: 'led-breaking-news',
    name: 'شريط عاجل إخباري',
    category: 'led',
    desc: 'مصفوفة LED حمراء للشاشات الإخبارية العاجلة',
    params: {
      renderMode: 'led',
      text: 'عاجل: تحديثات وإعلانات هامة على مدار الساعة',
      font: 'Noto Kufi Arabic',
      fontWeight: 800,
      fontSize: 66,
      ledColor: '#ef4444',
      unlitColor: '#16111a',
      dotSize: 6,
      dotSpacing: 3,
      dotShape: 'square',
      glowIntensity: 4,
      showUnlitGrid: true,
      scanlines: true,
      bgStyle: 'solid',
      animMode: 'scroll',
      animSpeed: 1.4
    }
  },
  {
    id: 'led-matrix-green',
    name: 'مصفوفة خضراء رقمية',
    category: 'led',
    desc: 'نقاط ليد خضراء بنبض رقمي إلكتروني',
    params: {
      renderMode: 'led',
      text: 'النظام يعمل بكفاءة 100%',
      font: 'Tajawal',
      fontWeight: 800,
      fontSize: 72,
      ledColor: '#00f59b',
      unlitColor: '#0a1714',
      dotSize: 6,
      dotSpacing: 3,
      dotShape: 'rounded',
      glowIntensity: 3.5,
      showUnlitGrid: true,
      scanlines: true,
      bgStyle: 'solid',
      animMode: 'flicker',
      animSpeed: 1.1
    }
  },
  {
    id: 'led-metro',
    name: 'لوحة قطار المترو',
    category: 'led',
    desc: 'شاشة إرشادية بيضاء ساطعة بنقاط مربعة',
    params: {
      renderMode: 'led',
      text: 'القطار القادم خلال دقيقتين — المسار 1',
      font: 'Cairo',
      fontWeight: 800,
      fontSize: 62,
      ledColor: '#f8fafc',
      unlitColor: '#181e2e',
      dotSize: 5,
      dotSpacing: 3,
      dotShape: 'circle',
      glowIntensity: 3,
      showUnlitGrid: true,
      scanlines: true,
      bgStyle: 'solid',
      animMode: 'steady',
      animSpeed: 1.0
    }
  }
];

export class PresetManager {
  constructor() {
    this.storageKey = 'arabic_neon_user_presets';
  }

  // Get curated presets
  getCuratedPresets() {
    return CURATED_PRESETS;
  }

  // Get saved user presets from LocalStorage
  getUserPresets() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Save current preset
  saveUserPreset(name, params) {
    const list = this.getUserPresets();
    const newPreset = {
      id: `user-${Date.now()}`,
      name,
      category: 'user',
      desc: 'قالب مخصص للمستخدم',
      params: { ...params }
    };
    list.unshift(newPreset);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    return newPreset;
  }

  // Delete user preset
  deleteUserPreset(id) {
    const list = this.getUserPresets().filter(p => p.id !== id);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch (e) {}
  }

  // Encode preset params into shareable URL hash
  encodeToHash(params) {
    return saveStateToURL(params);
  }

  // Decode preset params from URL hash
  decodeFromHash(hash) {
    return loadStateFromURL(hash);
  }
}

/**
 * حفظ الإعدادات في الـ URL Hash
 * @param {Object} state - كائن الحالة والإعدادات
 */
export function saveStateToURL(state) {
  try {
    const jsonString = JSON.stringify(state);
    const base64Encoded = btoa(encodeURIComponent(jsonString));
    window.location.hash = base64Encoded;
    return '#' + base64Encoded;
  } catch (error) {
    console.error("فشل حفظ الحالة في الرابط:", error);
    return '';
  }
}

/**
 * استرجاع الإعدادات من الـ URL Hash عند فتح الصفحة
 * @param {string} [customHash]
 * @returns {Object|null} كائن الحالة أو قيمة فارغة
 */
export function loadStateFromURL(customHash) {
  try {
    let hash = (customHash !== undefined ? customHash : window.location.hash);
    if (!hash) return null;
    if (hash.startsWith('#')) hash = hash.substring(1);
    if (hash.startsWith('preset=')) hash = hash.replace('preset=', '');
    if (!hash) return null;

    try {
      const jsonString = decodeURIComponent(atob(hash));
      return JSON.parse(jsonString);
    } catch (e1) {
      const jsonString = decodeURIComponent(escape(atob(hash)));
      return JSON.parse(jsonString);
    }
  } catch (error) {
    console.error("فشل استرجاع الحالة من الرابط:", error);
    return null;
  }
}
