// بيانات فعاليات الرياض (نوفمبر 2026 → مارس 2027)
// conf: "ok" = مؤكدة من مصادر منشورة | "tbc" = تاريخ غير نهائي، راجع المنظّم
// approx: true = الإحداثيات تقريبية للمنطقة وليست للمدخل بالضبط
// end: null = مستمرة حتى إشعار آخر
window.RIYADH_EVENTS = [
  // ---------- موسم الرياض 2026 (الدورة السابعة، تنطلق 21 أكتوبر، ~10 أسابيع) ----------
  { id:1,  name:"بوليفارد سيتي", cat:"season", start:"2026-10-22", end:"2026-12-31", conf:"tbc", approx:true,
    venue:"بوليفارد رياض سيتي", lat:24.7700, lng:46.6050, price:"مدفوع — webook", desc:"قلب موسم الرياض: مطاعم ومسارح وألعاب ومنطقة عروض حيّة.", url:"https://webook.com" },
  { id:2,  name:"بوليفارد وورلد", cat:"season", start:"2026-10-25", end:"2026-12-31", conf:"tbc", approx:true,
    venue:"بوليفارد رياض سيتي", lat:24.7650, lng:46.6000, price:"مدفوع — webook", desc:"جولة حول العالم بأجنحة ثقافية وأطعمة ومعالم مصغّرة.", url:"https://webook.com" },
  { id:3,  name:"شتاء الديرة", cat:"season", start:"2026-11-01", end:null, conf:"tbc", approx:true,
    venue:"الدرعية", lat:24.7345, lng:46.5760, price:"مدفوع — webook", desc:"أجواء شتوية ليلية في الدرعية مع أنشطة وأسواق ومطاعم.", url:"https://webook.com" },
  { id:4,  name:"وندر جاردن", cat:"season", start:"2026-11-18", end:"2026-12-31", conf:"tbc", approx:true,
    venue:"الموقع يُعلن عبر webook", lat:24.7600, lng:46.6300, price:"مدفوع — webook", desc:"حديقة ترفيهية بإضاءات وتجارب غامرة.", url:"https://webook.com" },
  { id:5,  name:"متاهة الحصن", cat:"season", start:"2026-11-19", end:"2026-11-28", conf:"ok", approx:true,
    venue:"الموقع يُعلن عبر webook", lat:24.7400, lng:46.6200, price:"مدفوع — webook", desc:"منطقة جديدة هذا العام: متاهة وتجارب تفاعلية.", url:"https://webook.com" },
  { id:6,  name:"مهرجان إثنوسبورت الثقافي", cat:"festival", start:"2026-11-19", end:"2026-11-28", conf:"ok", approx:true,
    venue:"الرياض (الموقع يُعلن)", lat:24.7500, lng:46.6500, price:"راجع المنظّم", desc:"مهرجان للرياضات التقليدية والتراث من حول العالم.", url:"" },
  { id:7,  name:"سوق المزارعين", cat:"season", start:"2026-12-16", end:"2026-12-31", conf:"tbc", approx:true,
    venue:"الموقع يُعلن عبر webook", lat:24.7200, lng:46.6600, price:"راجع المنظّم", desc:"إضافة متأخرة للموسم: منتجات محلية وطازجة.", url:"https://webook.com" },
  { id:8,  name:"منتزه السويدي", cat:"season", start:"2026-10-21", end:"2026-12-31", conf:"tbc", approx:true,
    venue:"منتزه السويدي", lat:24.5930, lng:46.6330, price:"مجاني", desc:"منطقة مجانية ضمن موسم الرياض.", url:"" },
  { id:9,  name:"حديقة حيوان الرياض", cat:"season", start:"2026-10-21", end:"2026-12-31", conf:"tbc", approx:true,
    venue:"حديقة حيوان الرياض", lat:24.6700, lng:46.7330, price:"مجاني", desc:"مصنّفة «قريباً» في بعض القوائم — تحقق قبل الزيارة.", url:"" },
  { id:10, name:"سفن الحمراء (SEVEN)", cat:"season", start:"2026-11-01", end:"2026-12-31", conf:"tbc", approx:true,
    venue:"حي الحمراء", lat:24.7480, lng:46.7830, price:"راجع المنظّم", desc:"موعد الافتتاح غير مؤكد بعد (TBC).", url:"" },

  // ---------- معارض ومؤتمرات ----------
  { id:11, name:"Black Hat MEA", cat:"expo", start:"2026-12-07", end:"2026-12-09", conf:"tbc", approx:true,
    venue:"مركز الرياض للمعارض والمؤتمرات", lat:24.9700, lng:46.6000, price:"تسجيل", desc:"مؤتمر الأمن السيبراني. بعض المصادر تذكر 1–3 ديسمبر.", url:"" },
  { id:12, name:"Saudi HORECA", cat:"expo", start:"2026-12-07", end:"2026-12-09", conf:"tbc", approx:true,
    venue:"الرياض", lat:24.9600, lng:46.7100, price:"تسجيل", desc:"معرض الضيافة والمطاعم. مصدر آخر يذكر 14–16 ديسمبر.", url:"" },
  { id:13, name:"معرض الرياض الدولي للكتاب", cat:"expo", start:"2026-12-10", end:"2026-12-19", conf:"tbc", approx:true,
    venue:"المكان غير محسوم", lat:24.7900, lng:46.7000, price:"راجع المنظّم", desc:"الموعد والمكان غير نهائيين حسب المصادر.", url:"" },
  { id:14, name:"AES · BDEXPO · INTEX · PNE", cat:"expo", start:"2026-12-20", end:"2026-12-22", conf:"tbc", approx:true,
    venue:"رياض فرونت للمعارض والمؤتمرات", lat:24.9610, lng:46.7150, price:"تسجيل", desc:"مجموعة معارض متزامنة في رياض فرونت.", url:"" },
  { id:15, name:"المعرض الدولي للقهوة والشوكولاتة", cat:"expo", start:"2027-01-06", end:"2027-01-11", conf:"tbc", approx:true,
    venue:"فينيو بلس — جامعة الأميرة نورة", lat:24.8450, lng:46.7200, price:"تذاكر", desc:"قهوة مختصة وشوكولاتة وورش تذوق.", url:"" },
  { id:16, name:"Dunes Outdoor Exhibition", cat:"expo", start:"2027-01-20", end:"2027-01-23", conf:"tbc", approx:true,
    venue:"مركز الرياض للمعارض والمؤتمرات", lat:24.9690, lng:46.6020, price:"تسجيل", desc:"معرض معدات الرحلات والكشتات والهواء الطلق.", url:"" },
  { id:17, name:"World Manufacturing Innovation Expo", cat:"expo", start:"2027-01-21", end:"2027-01-23", conf:"tbc", approx:true,
    venue:"الرياض", lat:24.9580, lng:46.7050, price:"تسجيل", desc:"معرض ومؤتمر الابتكار الصناعي.", url:"" },
  { id:18, name:"فودكس السعودية", cat:"expo", start:"2027-01-26", end:"2027-01-28", conf:"tbc", approx:true,
    venue:"ذا أرينا — الرياض", lat:24.9630, lng:46.7180, price:"تسجيل", desc:"معرض الأغذية والمشروبات.", url:"" },
  { id:19, name:"Maison Chic Expo", cat:"expo", start:"2027-01-26", end:"2027-01-28", conf:"tbc", approx:true,
    venue:"الرياض", lat:24.9560, lng:46.7080, price:"تسجيل", desc:"معرض الديكور والتصميم الداخلي.", url:"" },

  // ---------- رياضة ----------
  { id:20, name:"دورة الألعاب الآسيوية للصالات والفنون القتالية", cat:"sports", start:"2027-03-28", end:"2027-04-08", conf:"tbc", approx:true,
    venue:"الرياض", lat:24.7880, lng:46.8390, price:"راجع المنظّم", desc:"أُجّلت أكثر من مرة؛ آخر موعد معلن 28 مارس – 8 أبريل 2027.", url:"" },

  // ---------- كشتات وبر (موسمية: نوفمبر → مارس) ----------
  { id:21, name:"محمية الإمام تركي بن عبدالله الملكية", cat:"kashta", start:"2026-11-01", end:"2027-03-31", conf:"tbc", approx:true,
    venue:"شمال شرق الرياض", lat:25.4000, lng:46.9500, price:"تصريح/حسب النظام", desc:"سماء صافية وبرّ مفتوح — موسم الكشتة. التزم بأنظمة المحمية.", url:"" },
  { id:22, name:"روضة خريم", cat:"kashta", start:"2026-11-01", end:"2027-03-31", conf:"tbc", approx:true,
    venue:"روضة خريم", lat:25.6200, lng:47.0000, price:"مجاني", desc:"من أشهر وجهات الكشتات الربيعية والشتوية.", url:"" },
  { id:23, name:"منتزه الثمامة", cat:"kashta", start:"2026-11-01", end:"2027-03-31", conf:"tbc", approx:true,
    venue:"الثمامة", lat:25.0700, lng:46.7500, price:"مجاني", desc:"براري قريبة من المدينة للتخييم السريع.", url:"" },
  { id:24, name:"حافة العالم (جبل فهرين)", cat:"kashta", start:"2026-11-01", end:"2027-03-31", conf:"tbc", approx:true,
    venue:"شمال غرب الرياض", lat:24.8000, lng:45.8500, price:"مجاني", desc:"إطلالة جرفية خلابة — يُنصح بسيارة دفع رباعي ومرافق.", url:"" },

  // ---------- أماكن ----------
  { id:25, name:"حي الطريف — الدرعية (يونسكو)", cat:"places", start:"2026-11-01", end:"2027-03-31", conf:"ok", approx:false,
    venue:"الدرعية", lat:24.7340, lng:46.5760, price:"تذاكر", desc:"موقع تراثي عالمي ومهد الدولة السعودية الأولى.", url:"" },
  { id:26, name:"قلعة المصمك", cat:"places", start:"2026-11-01", end:"2027-03-31", conf:"ok", approx:false,
    venue:"وسط الرياض", lat:24.6313, lng:46.7137, price:"تذاكر", desc:"حصن تاريخي في قلب العاصمة القديمة.", url:"" },
  { id:27, name:"المتحف الوطني", cat:"places", start:"2026-11-01", end:"2027-03-31", conf:"ok", approx:false,
    venue:"حي الملز", lat:24.6483, lng:46.7106, price:"تذاكر", desc:"رحلة عبر تاريخ الجزيرة العربية.", url:"" },
  { id:28, name:"برج المملكة — جسر السماء", cat:"places", start:"2026-11-01", end:"2027-03-31", conf:"ok", approx:false,
    venue:"العليا", lat:24.7114, lng:46.6743, price:"تذاكر", desc:"إطلالة بانورامية على الرياض ليلاً.", url:"" },
  { id:29, name:"منتزه وادي حنيفة", cat:"places", start:"2026-11-01", end:"2027-03-31", conf:"ok", approx:true,
    venue:"وادي حنيفة", lat:24.6900, lng:46.5700, price:"مجاني", desc:"مسارات مشي ودراجات وجلسات عائلية.", url:"" }
];

window.RIYADH_CATS = {
  season:   { label:"موسم الرياض",       color:"#ff2e9a" },
  festival: { label:"مهرجانات",           color:"#ffb020" },
  expo:     { label:"معارض ومؤتمرات",     color:"#25d9ff" },
  sports:   { label:"رياضة",              color:"#39ff88" },
  kashta:   { label:"كشتات وبر",          color:"#b678ff" },
  places:   { label:"أماكن",              color:"#ff6a3d" }
};
