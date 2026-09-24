# مولد النيون وشاشات LED للنصوص العربية 🌟
### Procedural Arabic Neon & RetroLED Generator

أداة ويب تفاعلية فائقة السرعة وخفيفة الحجم (No-Click & Standalone) تعمل فور فتح الصفحة، متخصصة في تصميم وتحريك نصوص الخطوط العربية بتأثيرات النيون الواقعية (Neon Glow) وشاشات البكسل الرقمية (Retro LED Matrix) مع دعم كامل للكتابة بالاتجاه من اليمين لليسار (RTL)، وتصدير فوري بصيغ متعددة (PNG بدقة عالية 2x، ناقلات SVG، كود CSS نقي، وفيديو متحرك WebM/MP4).

---

## ✨ المميزات الرئيسية (Core Features)

1. **معاينة فورية حية (No-Click Instant Live Preview):**
   - يبدأ المحرك بالرسم فور تحميل الصفحة مع نص افتراضي وتوهج نيون ديناميكي دون الحاجة لأي نقر.
   - دعم شاشات Retina وHiDPI عبر مضاعفة نسبة البكسل الفيزيائية (`devicePixelRatio`).

2. **نمطان للعرض (Two Rendering Modes):**
   - **النيون المتوهج (Neon Glow):** محاكاة فيزيائية لأنابيب الغاز والزجاج عبر طبقات توهج متعددة (`shadowBlur` متدرج)، ونواة بلازما حادة بيضاء في المركز.
   - **شاشة LED النقطية (Retro LED Matrix):** أخذ عينات نقطية من كثافة البكسلات (Pixel Density Sampling عبر `getImageData`) وتوليد شبكة مصابيح LED مع تحكم بحجم النقطة، التباعد، الشكل (دائري / مربع / حواف مستديرة)، وشبكة المصابيح المطفأة (`Unlit Grid`) وخطوط المسح التلفزيوني (`Scanlines`).

3. **حزمة الخطوط العربية المتكاملة (Google Fonts):**
   - **Tajawal (تجوال):** خط حديث متوازن ممتاز لواجهات المستخدم.
   - **Cairo (القاهرة):** خط هندسي عصري بوزن عريض للأناقة.
   - **Noto Kufi Arabic (نوتو كوفي):** عناوين كوفية هندسية واضحة.
   - **Reem Kufi (ريم كوفي):** طراز كوفي فاطمي مميز للوحات التراثية والعصرية.
   - **Amiri (أميري):** نسخي كلاسيكي عريق.
   - **Scheherazade New (شهرزاد):** خط نسخي تقليدي واسع.
   - تحميل ديناميكي سلس عبر `FontFace API` مع التخزين المؤقت في المتصفح.

4. **شريط التشكيل العربي السريع (Diacritics Bar):**
   - أزرار سريعة لإدراج الحركات (فتحة، ضمة، كسرة، تنوين، شدة، سكون، تطويل/كشيدة) مباشرة في موضع المؤشر.

5. **أنماط حركة متعددة (Animation Engine):**
   - **وميض نيون كهربائي (Neon Flicker):** وميض متقطع يحاكي مفاتيح تشغيل أنابيب النيون القديمة أو التذبذب الكهربائي.
   - **نبض وتنفس ضوئي (Pulse):** تسريع عتادي عبر Web Animations API (WAAPI) لتموج الإضاءة والتحجيم بسلاسة 60 إطاراً في الثانية.
   - **كتابة تتابعية (Typewriter):** إظهار الحروف تدريجياً حرفاً بحرف.
   - **شريط متحرك (Marquee Scroll):** تمرير أفقي انسيابي للنصوص الطويلة.
   - **إضاءة مستقرة (Steady):** توهج نقي ثابت.

6. **إطارات وخلفيات مخصصة (Frames & Backgrounds):**
   - **نمط الإطار:** بدون إطار، إطار مستطيل متوهج كامل (`box`)، أو زوايا هندسية مستقبلية (`corners`).
   - **لون الخلفية:** منتقي ألوان كامل مع أزرار اختصار سريعة (داكن / فاتح).
   - **خامات الاستوديو:** خلفية استوديو ناعمة، جدار طوب مظلم، شبكة رقمية (Digital Grid)، أو داكن نقي.

7. **مشاركة فورية عبر الرابط (URL Hash State):**
   - حفظ كامل حالة التصميم والنص والألوان والحركة في الـ URL Hash بتشفير `Base64` تلقائياً.
   - إمكانية نسخ الرابط بنقرة واحدة ومشاركته مع أي شخص لفتح نفس التصميم فوراً بدون الحاجة لقاعدة بيانات.

8. **منظومة التصدير المتكاملة (Multi-Format Export):**
   - **PNG عالي الدقة (2x Retina):** تنزيل فوري للصورة بنقرة زر بجودة فائقة.
   - **SVG Vector:** ناقلات متجهية قابلة للتحجيم اللا نهائي مع فلاتر التوهج SVG.
   - **CSS / HTML Code:** توليد كود CSS نقي مع تأثيرات `text-shadow` متعددة الطبقات جاهزة للنسخ في أي موقع ويب.
   - **تسجيل فيديو متحرك (WebM / MP4):** تسجيل مباشر لحركة الكانفاس عبر `MediaRecorder API` وتنزيل مقطع فيديو فوري.

---

## 🏗️ هيكلية المشروع (Project Architecture)

```
arabic-neon-web/
├── index.html                     # الصفحة الرئيسية والواجهة التفاعلية (RTL)
├── package.json                   # إعدادات المشروع وحزم التشغيل المحلي
├── LICENSE                        # ترخيص MIT مفتوح المصدر
├── README.md                      # هذا الدليل التوثيقي
├── .github/
│   └── workflows/
│       └── pages.yml              # النشر التلقائي على GitHub Pages
├── css/
│   └── style.css                  # التنسيقات العامة والسمة الداكنة Cyberpunk
└── js/
    ├── app.js                     # المتحكم الرئيسي وربط الأحداث وحلقة العرض
    ├── engine/
    │   ├── canvas2d.js            # محرك رسم النيون، الخلفيات، والإطارات
    │   ├── led-matrix.js          # محرك مصفوفة الـ LED النقطية وخطوط المسح
    │   ├── animations.js          # متحكم التوقيت والحركة وحساب الإطارات
    │   └── webgl-glow.js          # فلاتر التوهج المتقدمة والتشويه اللوني
    ├── fonts/
    │   └── font-loader.js         # محرك تحميل وإدارة الخطوط العربية
    ├── presets/
    │   └── presets.js             # القوالب الجاهزة وحفظ الحالة في URL Hash
    └── export/
        └── exporter.js            # تصدير الصور، الفيكتور، الكود، والفيديو
```

---

## 🚀 التشغيل السريع (Quick Start)

### 1. الاستخدام المباشر دون تثبيت
لا تتطلب الأداة أي حزم أو بناء (Build Step). يمكنك تشغيلها مباشرة بفتح ملف `index.html` في أي متصفح حديث (Chrome, Firefox, Safari, Edge)!

### 2. التشغيل عبر خادم محلي
```bash
# استنساخ المستودع
git clone https://github.com/yn1404yn-max/arabic-neon-web.git
cd arabic-neon-web

# تشغيل خادم محلي بسيط
npx serve .
# أو باستخدام Python
python3 -m http.server 8080
```
افتح المتصفح على: `http://localhost:8080` أو `http://localhost:3000`.

---

## 🌐 النشر على GitHub Pages

المستودع مجهز بالفعل مع ملف GitHub Actions (`.github/workflows/pages.yml`).
لتفعيل النشر التلقائي:
1. اذهب إلى إعدادات المستودع على GitHub: **Settings > Pages**.
2. تحت قسم **Build and deployment > Source**، اختر **GitHub Actions**.
3. عند أي Push لفرع `main`، سيتم بناء ونشر الموقع تلقائياً على الرابط:
   `https://yn1404yn-max.github.io/arabic-neon-web/`

---

## 💻 نماذج برمجية مقتبسة من المحرك (Key Code Snippets)

### 1. دالة رسم النيون المتوهج (Canvas2D Multi-Pass Glow):
```javascript
function drawNeonText(ctx, text, x, y, options) {
  const { textColor = "#FFFFFF", glowColor = "#7C6FFF", blur = 15, intensity = 4, fontSize = 52, fontFamily = "Tajawal" } = options;

  ctx.font = `bold ${fontSize}px ${fontFamily}, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

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

  // الطبقة المركزية الحادة
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = blur * 0.5;
  ctx.fillStyle = glowColor;
  ctx.fillText(text, x, y);
  ctx.restore();

  // النواة الحادة مع خط الحافة
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = textColor;
  ctx.fillText(text, x, y);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.strokeText(text, x, y);
  ctx.restore();
}
```

### 2. حفظ واسترجاع الحالة في URL Hash:
```javascript
// حفظ الحالة في الرابط
function saveStateToURL(state) {
  const jsonString = JSON.stringify(state);
  window.location.hash = btoa(encodeURIComponent(jsonString));
}

// استرجاع الحالة عند فتح الرابط
function loadStateFromURL() {
  const hash = window.location.hash.substring(1);
  if (!hash) return null;
  return JSON.parse(decodeURIComponent(atob(hash)));
}
```

---

## 📜 الترخيص (License)
هذا المشروع مرخص تحت رخصة **MIT**. يمكنك استخدامه، تعديله، وتطويره بحرية.
صُمم وطُوّر بواسطة: **يوسف نايف (yn1404yn-max)**.
