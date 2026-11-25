/**
 * عدسة مكبّرة متحركة — Draggable Magnifier Lens
 * - اسحب العدسة (من الزجاج أو المقبض) فتكبّر ما تحتها من نصوص وعناصر.
 * - عجلة الماوس فوق العدسة (أو أزرار + / −) لتغيير التكبير.
 * - مفتاح Esc أو زر الإغلاق لإخفائها.
 * لا تعتمد على أي مكتبة. تعمل بالماوس واللمس.
 */
(function () {
  "use strict";

  var SIZE = 220;            // قطر العدسة بالبكسل
  var MIN_ZOOM = 1.5, MAX_ZOOM = 6, STEP = 0.5;
  var zoom = 2.5;
  var cx = Math.round(window.innerWidth / 2);   // مركز العدسة في إطار العرض
  var cy = Math.round(window.innerHeight / 2);
  var active = false;
  var auto = true;                              // حركة تلقائية
  var tx = cx, ty = cy, vx = 0, vy = 0, t0 = 0, wait = 0;

  // ---------- الأنماط ----------
  var style = document.createElement("style");
  style.textContent = [
    "#mag-toggle{position:fixed;bottom:18px;left:18px;z-index:2147483000;display:flex;align-items:center;gap:8px;",
    "padding:10px 16px;border-radius:999px;border:1px solid #00e5ff;background:#0d1222;color:#f8fafc;",
    "font:600 15px Tajawal,Cairo,sans-serif;cursor:pointer;box-shadow:0 0 14px rgba(0,229,255,.45);direction:rtl}",
    "#mag-toggle[aria-pressed=true]{background:#00e5ff;color:#070912}",
    "#mag-lens{position:fixed;top:0;left:0;z-index:2147482000;width:" + SIZE + "px;height:" + SIZE + "px;",
    "display:none;touch-action:none;user-select:none;-webkit-user-select:none;will-change:transform}",
    "#mag-lens.on{display:block}",
    "#mag-glass{position:absolute;inset:0;border-radius:50%;overflow:hidden;cursor:grab;background:#0b0d14;",
    "border:6px solid #cfd4da;box-shadow:0 0 0 2px #7b838c,0 10px 30px rgba(0,0,0,.6),inset 0 0 18px rgba(0,0,0,.35)}",
    "#mag-lens.drag #mag-glass{cursor:grabbing}",
    "#mag-glass::after{content:'';position:absolute;inset:0;border-radius:50%;pointer-events:none;",
    "background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.12),rgba(255,255,255,0) 40%)}",
    "#mag-content{position:absolute;top:0;left:0;transform-origin:0 0;pointer-events:none}",
    "#mag-handle{position:absolute;left:50%;top:50%;margin-left:-13px;width:26px;height:" + Math.round(SIZE * 0.5) + "px;",
    "transform-origin:13px 0;transform:rotate(-40deg) translateY(" + (SIZE / 2 - 6) + "px);z-index:-1;cursor:grab}",
    "#mag-handle i{display:block;width:100%;height:100%;border-radius:0 0 13px 13px;",
    "background:linear-gradient(90deg,#c2410c,#fb923c 40%,#c2410c);box-shadow:0 6px 14px rgba(0,0,0,.5)}",
    "#mag-ctrl{position:absolute;left:50%;bottom:-44px;transform:translateX(-50%);display:flex;gap:6px;",
    "background:#0d1222;border:1px solid #212d4a;border-radius:999px;padding:4px 6px;direction:ltr}",
    "#mag-ctrl button{width:30px;height:30px;border-radius:50%;border:0;background:#1b2545;color:#fff;",
    "font:700 18px/1 system-ui,sans-serif;cursor:pointer}",
    "#mag-ctrl span{min-width:44px;text-align:center;color:#00e5ff;font:600 14px/30px system-ui,sans-serif}"
  ].join("");
  document.head.appendChild(style);

  // ---------- العناصر ----------
  var toggle = document.createElement("button");
  toggle.id = "mag-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-pressed", "false");
  toggle.innerHTML = "<span aria-hidden='true'>🔍</span><span>العدسة المكبّرة</span>";

  var lens = document.createElement("div");
  lens.id = "mag-lens";
  lens.setAttribute("aria-hidden", "true");
  lens.innerHTML =
    "<div id='mag-handle'><i></i></div>" +
    "<div id='mag-glass'><div id='mag-content'></div></div>" +
    "<div id='mag-ctrl'><button type='button' data-d='-1' aria-label='تصغير'>−</button>" +
    "<span id='mag-zoom'></span><button type='button' data-d='1' aria-label='تكبير'>+</button>"+
    "<button type='button' id='mag-auto' aria-label='تشغيل/إيقاف الحركة التلقائية'>⏸</button></div>";

  // نضيفهما إلى <html> وليس <body> حتى لا تُستنسخ العدسة داخل نفسها
  document.documentElement.appendChild(toggle);
  document.documentElement.appendChild(lens);

  var content = lens.querySelector("#mag-content");
  var zoomLabel = lens.querySelector("#mag-zoom");

  // ---------- استنساخ الصفحة ----------
  var clone = null, origCanvases = [], cloneCanvases = [];

  function rebuild() {
    var body = document.body;
    clone = body.cloneNode(true);
    clone.removeAttribute("id");
    Array.prototype.forEach.call(clone.querySelectorAll("script,[id]"), function (n) {
      if (n.tagName === "SCRIPT") n.remove(); else n.removeAttribute("id");
    });
    // مزامنة قيم الحقول (cloneNode لا ينسخ القيم الحالية)
    var o = body.querySelectorAll("input,select,textarea");
    var c = clone.querySelectorAll("input,select,textarea");
    for (var i = 0; i < o.length && i < c.length; i++) {
      if (o[i].type === "checkbox" || o[i].type === "radio") c[i].checked = o[i].checked;
      else c[i].value = o[i].value;
      c[i].tabIndex = -1;
    }
    origCanvases = Array.prototype.slice.call(body.querySelectorAll("canvas"));
    cloneCanvases = Array.prototype.slice.call(clone.querySelectorAll("canvas"));
    clone.style.cssText += ";position:absolute;top:0;left:0;margin:0;pointer-events:none;" +
      "width:" + body.offsetWidth + "px;height:" + body.offsetHeight + "px;";
    content.textContent = "";
    content.appendChild(clone);
    place();
  }

  // ---------- التموضع ----------
  function place() {
    var half = SIZE / 2;
    lens.style.transform = "translate(" + (cx - half) + "px," + (cy - half) + "px)";
    // نستعمل إحداثيات الجسم الفعلية (تتعامل مع التمرير وRTL تلقائياً)
    var r = document.body.getBoundingClientRect();
    var bx = cx - r.left, by = cy - r.top;                    // نقطة داخل الجسم تحت المركز
    content.style.transform =
      "translate(" + (half - zoom * bx) + "px," + (half - zoom * by) + "px) scale(" + zoom + ")";
    zoomLabel.textContent = "×" + zoom.toFixed(1);
  }

  function copyCanvases() {
    for (var i = 0; i < origCanvases.length && i < cloneCanvases.length; i++) {
      var s = origCanvases[i], d = cloneCanvases[i];
      try {
        if (d.width !== s.width) d.width = s.width;
        if (d.height !== s.height) d.height = s.height;
        var g = d.getContext("2d");
        g.clearRect(0, 0, d.width, d.height);
        g.drawImage(s, 0, 0);
      } catch (e) { /* لوحة محمية أو WebGL بلا مخزن — نتجاهلها */ }
    }
  }

  var raf = 0;
  function pickTarget() {
    var m = SIZE / 2;
    tx = m + Math.random() * (window.innerWidth - SIZE);
    ty = m + Math.random() * (window.innerHeight - SIZE);
    wait = 40 + Math.random() * 60;   // توقف قصير عند كل نقطة للقراءة
  }
  function stepAuto() {
    if (!auto || dragging) return;
    var dx = tx - cx, dy = ty - cy, d = Math.hypot(dx, dy);
    if (d < 6) {
      vx *= 0.8; vy *= 0.8;
      if (--wait <= 0) pickTarget();
    } else {
      // تسارع ناعم نحو الهدف مع احتكاك → حركة انسيابية
      vx = vx * 0.92 + dx / d * 0.35;
      vy = vy * 0.92 + dy / d * 0.35;
      var sp = Math.hypot(vx, vy), max = Math.min(7, d * 0.12 + 0.8);
      if (sp > max) { vx *= max / sp; vy *= max / sp; }
    }
    cx += vx; cy += vy;
    place();
  }
  function loop() {
    if (!active) return;
    stepAuto();
    copyCanvases();
    raf = requestAnimationFrame(loop);
  }

  // إعادة البناء عند تغيّر الصفحة (بتأخير بسيط لتجنب الإفراط)
  var pending = 0;
  function schedule() {
    if (!active || pending) return;
    pending = setTimeout(function () { pending = 0; if (active) rebuild(); }, 120);
  }
  var observer = new MutationObserver(schedule);

  // ---------- السحب ----------
  var dragging = false, offX = 0, offY = 0;
  function onDown(e) {
    if (e.target.closest && e.target.closest("#mag-ctrl")) return;
    dragging = true;
    offX = cx - e.clientX; offY = cy - e.clientY;
    lens.classList.add("drag"); vx = vy = 0;
    lens.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    cx = Math.min(window.innerWidth, Math.max(0, e.clientX + offX));
    cy = Math.min(window.innerHeight, Math.max(0, e.clientY + offY));
    place();
  }
  function onUp(e) {
    dragging = false;
    lens.classList.remove("drag"); wait = 90;   // بعد السحب تستأنف الحركة بعد لحظات
    try { lens.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  lens.addEventListener("pointerdown", onDown);
  lens.addEventListener("pointermove", onMove);
  lens.addEventListener("pointerup", onUp);
  lens.addEventListener("pointercancel", onUp);

  function setAuto(on) {
    auto = on;
    lens.querySelector("#mag-auto").textContent = on ? "⏸" : "▶";
    if (on) { vx = vy = 0; pickTarget(); }
  }
  function setZoom(z) {
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    place();
  }
  lens.addEventListener("wheel", function (e) {
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? STEP : -STEP));
  }, { passive: false });
  lens.querySelector("#mag-ctrl").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b && b.id === "mag-auto") { setAuto(!auto); return; }
    if (b) setZoom(zoom + STEP * Number(b.getAttribute("data-d")));
  });

  // ---------- التشغيل / الإيقاف ----------
  function setActive(on) {
    active = on;
    toggle.setAttribute("aria-pressed", String(on));
    lens.classList.toggle("on", on);
    if (on) {
      rebuild();
      setAuto(auto);
      observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
      loop();
    } else {
      observer.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(pending); pending = 0;
      content.textContent = "";
      clone = null; origCanvases = []; cloneCanvases = [];
    }
  }
  toggle.addEventListener("click", function () { setActive(!active); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && active) setActive(false); });
  // تغيّر قيم الحقول لا يُحدث Mutation، لذا نستمع للأحداث أيضاً
  document.addEventListener("input", schedule, true);
  document.addEventListener("change", schedule, true);
  window.addEventListener("scroll", function () { if (active) place(); }, { passive: true });
  window.addEventListener("resize", function () { if (active) { schedule(); place(); } });
})();
