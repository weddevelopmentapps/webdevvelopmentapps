/* brand.js — عدّة هوية أمانة منطقة الرياض (V3_SPEC §2)
   ═════════════════════════════════════════════════════
   قيد ملزم موثّق: نطاق ‎alriyadh.gov.sa‎ محجوب على بوابة الشبكة في بيئة
   التنفيذ (EGRESS_BLOCKED) — لا يجوز الالتفاف ولا **تلفيق شعار رسمي**.
   لذلك تعمل هذه الوحدة على مسارين:

     1) **الملفات الرسمية إن وُجدت.** ‎build.py‎ يضمّن أي ملف في
        ‎assets/brand/‎ (‎logo-full‎ · ‎logo-mark‎ · ‎logo-white‎ بامتداد
        ‎svg|png|webp‎) بصيغة data URI داخل ‎window.BRAND‎. إسقاط الملفات في
        المجلد يكمل الهوية **دون تغيير سطر كود واحد**.

     2) **البديل المرسوم كوداً** حين تغيب الملفات: علامة هندسية مجرّدة من
        متوازيات أضلاع متراكبة (نفس موتيف مرفق العميل) + اسم الجهة بالخط
        الرسمي. هذه علامة **أسلوبية معلنة** لا ادّعاء بأنها الشعار الرسمي،
        ومتسقة مع المشروع الشقيق ‎riyadh-labor-accommodation‎.

   اللون: طرفا التدرّج ‎--brand-teal ‎#127C74‎ → ‎--brand-deep ‎#0B6B4F‎ والأخضر
   الرسمي ‎--brand ‎#00733D‎ — كلها رموز حية، فالعلامة تتبع السمة تلقائياً.
   لا لون مكتوب في هذا الملف: ‎currentColor‎ و‎var(--…)‎ حصراً. */
"use strict";

RH.brand = (function () {
  const { h, svg, clear } = RH.core.dom;

  const ENTITY_AR = "أمانة منطقة الرياض";
  const ENTITY_SUB = "الإدارة العامة للرقابة على السكن الجماعي";

  /** أسماء الملفات المتوقعة في ‎assets/brand/‎ (مفاتيح ‎window.BRAND‎) */
  const ASSET_KEYS = Object.freeze(["logo-full", "logo-mark", "logo-white"]);

  /** خريطة النسخة → مفتاح الأصل الرسمي */
  const VARIANT_ASSET = Object.freeze({
    full: "logo-full",
    mark: "logo-mark",
    white: "logo-white",
  });

  let uid = 0;
  const nextId = (p) => p + "-" + (++uid);

  /** هل ضُمِّن أصل رسمي لهذه النسخة؟ */
  function asset(variant) {
    const bag = (typeof window !== "undefined" && window.BRAND) || null;
    if (!bag) return null;
    const key = VARIANT_ASSET[variant] || VARIANT_ASSET.full;
    const src = bag[key];
    return (typeof src === "string" && src.length > 16) ? src : null;
  }

  /** هل المنصة تعمل بأصول رسمية أم بالبديل المرسوم؟ (يُعرض في التسليم) */
  function hasOfficialAssets() {
    return ASSET_KEYS.some((k) => asset(
      Object.keys(VARIANT_ASSET).find((v) => VARIANT_ASSET[v] === k)));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     0) قياس هندسة الأصل الرسمي — تفكيك القفل الرأسي إلى رمز + كلمة
     ──────────────────────────────────────────────────────────────────────────
     الأصل الرسمي المسلَّم (‎logo-full‎/‎logo-white‎) **قفل رأسي**: الرمز الدائري
     فوق سطرَي الاسم. إدراجه كصورة واحدة في شريط رأس ارتفاعه ‎44px‎ يُنزل الرمز
     إلى ‎~26px‎ ويجعل الاسم غير مقروء — وهي الشكوى الحرفية («علامة ‎28px‎ في
     الزاوية»). الحل ليس تكبير الصورة كلها (فتبتلع الشريط) بل **إعادة تركيبها
     أفقياً**: الرمز بارتفاع ‎48px‎ وإلى جانبه كتلة الاسم بارتفاعها الخاص.

     الحدود لا تُكتب أرقاماً ثابتة — فأي ملف يُسقطه العميل لاحقاً في
     ‎assets/brand/‎ بهندسة مختلفة كان سيُقصّ خطأً. تُقاس وقت التشغيل من قناة
     ألفا للصورة نفسها: صفوف غير شفافة ← نطاقات ← أعلى نطاق «رمز» إن كان
     أضيق من الصورة وقريباً من المربع، وما تحته «كلمة». يفشل القياس ⇒ الصورة
     تُعرض كما هي (تدهور رشيق، بلا قصّ أعمى).
     ══════════════════════════════════════════════════════════════════════════ */

  /** أقصى عرض للتحليل (تقليص للأداء — النِسب وحدها هي المطلوبة) */
  const GEOM_MAX_W = 480;
  /** عتبة الشفافية التي تُعدّ عندها البكسل «حبراً» */
  const ALPHA_MIN = 24;

  const geomValue = new Map();     // src → هندسة مقيسة أو null (فشل/غير قابل)
  const geomPromise = new Map();   // src → وعد القياس الجاري
  const geomWaiters = [];          // دوال تُستدعى عند اكتمال أي قياس

  /** مستطيل إحاطة الحبر لمدى صفوف */
  function inkBox(rowMin, rowMax, a, b) {
    let x0 = Infinity, x1 = -1;
    for (let y = a; y <= b; y++) {
      if (rowMax[y] < 0) continue;
      if (rowMin[y] < x0) x0 = rowMin[y];
      if (rowMax[y] > x1) x1 = rowMax[y];
    }
    if (x1 < 0) return null;
    return { x: x0, y: a, w: x1 - x0 + 1, h: b - a + 1 };
  }

  /** يقيس صورة محمَّلة ويعيد ‎{full, mark, word}‎ أو ‎null‎ إن لم تكن قفلاً رأسياً */
  function measureImage(img) {
    const NW = img.naturalWidth, NH = img.naturalHeight;
    if (!NW || !NH) return null;
    const k = Math.min(1, GEOM_MAX_W / NW);
    const w = Math.max(1, Math.round(NW * k));
    const hh = Math.max(1, Math.round(NH * k));
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = hh;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    if (!cx) return null;
    cx.drawImage(img, 0, 0, w, hh);
    // data: URI لا يلوّث القماش، فالقراءة مشروعة على ‎file://‎ أيضاً
    const px = cx.getImageData(0, 0, w, hh).data;

    const rowMin = new Int32Array(hh), rowMax = new Int32Array(hh);
    for (let y = 0; y < hh; y++) {
      let mn = w, mx = -1;
      const base = y * w * 4;
      for (let x = 0; x < w; x++) {
        if (px[base + x * 4 + 3] > ALPHA_MIN) { if (x < mn) mn = x; mx = x; }
      }
      rowMin[y] = mn; rowMax[y] = mx;
    }

    // نطاقات الصفوف الحبرية، مع دمج الفواصل الأرق من 2.5٪ من الارتفاع
    // (تباعد الأحرف الداخلي ليس فاصلاً بين كتلتَي الهوية)
    const gap = Math.max(2, Math.round(hh * 0.025));
    const runs = [];
    let start = null;
    for (let y = 0; y < hh; y++) {
      const ink = rowMax[y] >= 0;
      if (ink && start === null) start = y;
      if (!ink && start !== null) { runs.push([start, y - 1]); start = null; }
    }
    if (start !== null) runs.push([start, hh - 1]);
    const bands = [];
    for (const r of runs) {
      const last = bands[bands.length - 1];
      if (last && r[0] - last[1] - 1 < gap) last[1] = r[1];
      else bands.push([r[0], r[1]]);
    }
    if (bands.length < 2) return null;

    const mark = inkBox(rowMin, rowMax, bands[0][0], bands[0][1]);
    const word = inkBox(rowMin, rowMax, bands[1][0], bands[bands.length - 1][1]);
    if (!mark || !word) return null;
    // شروط «قفل رأسي حقيقي»: الرمز أضيق من الصورة وقريب من المربع،
    // وكتلة الاسم أعرض منه بوضوح. غير ذلك ⇒ الصورة أفقية سلفاً فتُترك.
    const ratio = mark.h / mark.w;
    if (mark.w > w * 0.75) return null;
    if (ratio < 0.6 || ratio > 1.8) return null;
    if (word.w < mark.w * 1.25) return null;
    return {
      full: { w, h: hh },
      natural: { w: NW, h: NH },
      img,                       /* الصورة المفكوكة — تخدم الصبغ أدناه */
      mark, word,
    };
  }

  /* ── صبغ كتلة الاسم للأسطح الداكنة ──────────────────────────────────────
     نسخة ‎logo-white.png‎ المسلَّمة مشتقة بعتبة إضاءة، فحروفها العربية ملتحمة
     والسطر اللاتيني غير مقروء. والأصل الملوّن **لا تصلح قناة ألفا فيه مصدراً
     للشكل** أيضاً: نزع الخلفية البيضاء ترك ألفا مشوّشة (قياس: 45٪ من بكسلات
     كتلة الاسم صفر و37٪ صلبة والباقي ضجيج)، فالصبغ عبر ‎source-in‎ يعيد
     التشويه نفسه — جُرِّب فسقط.

     الشكل الصحيح محفوظ في **قنوات اللون**: حبر أخضر على أبيض. فتُشتق التغطية
     من الإضاءة بعد التركيب على الصحن الأبيض ‎--brand-plate‎:
         coverage = (255 − luminance) ÷ (255 − أغمق حبر)
     ثم تُكتب لوناً من رمز حي بألفا التغطية. النتيجة: الشكل الرسمي حرفياً،
     بحدّة كاملة، بلون السمة — بلا ملف جديد وبلا لون مكتوب في الكود.

     الرمز الدائري يبقى **ملوَّناً** في السمتين على صحنه الفاتح: تسطيحه إلى
     قرص أبيض يمحو القلعة والسماء والسيفين. */
  const tintCache = new Map();   // src|color|box → data URI

  /** يقرأ قيمة رمز CSS حياً (لا لون مكتوب في هذا الملف) */
  function tokenColor(name, fallback) {
    try {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
      return v || fallback;
    } catch (_e) { return fallback; }
  }

  /** يحل أي صيغة لون CSS إلى ‎[r,g,b]‎ عبر تطبيع ‎fillStyle‎ في القماش */
  function rgbOf(color, fallback) {
    try {
      const cx = document.createElement("canvas").getContext("2d");
      cx.fillStyle = "#000000";
      cx.fillStyle = color;
      const s = String(cx.fillStyle);
      let m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(s);
      if (m) return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
      m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(s);
      if (m) return [+m[1], +m[2], +m[3]];
    } catch (_e) { /* لا قماش: البديل */ }
    return fallback;
  }

  function tintCrop(geom, box, color) {
    const key = String(geom.img.src).slice(-48) + "|" + color
      + "|" + box.x + "," + box.y + "," + box.w + "," + box.h;
    if (tintCache.has(key)) return tintCache.get(key);
    let uri = null;
    try {
      const rgb = rgbOf(color, [255, 255, 255]);
      const plate = rgbOf(tokenColor("--brand-plate", "#FFFFFF"), [255, 255, 255]);
      const sc = geom.natural.w / geom.full.w;   // فضاء القياس → بكسل أصلي
      const sx = Math.round(box.x * sc), sy = Math.round(box.y * sc);
      const sw = Math.max(1, Math.round(box.w * sc));
      const sh = Math.max(1, Math.round(box.h * sc));
      const cv = document.createElement("canvas");
      cv.width = sw; cv.height = sh;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      if (cx) {
        // 1) التركيب على الصحن: يعيد بناء «الحبر على الأبيض» الأصلي
        cx.fillStyle = "rgb(" + plate[0] + "," + plate[1] + "," + plate[2] + ")";
        cx.fillRect(0, 0, sw, sh);
        cx.drawImage(geom.img, sx, sy, sw, sh, 0, 0, sw, sh);
        const id = cx.getImageData(0, 0, sw, sh);
        const d = id.data;
        // 2) التغطية من الإضاءة + أغمق حبر (تطبيع القوة الكاملة)
        const lum = new Uint8ClampedArray(sw * sh);
        let darkest = 255;
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
          const L = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
          lum[p] = L;
          if (L < darkest) darkest = L;
        }
        const span = Math.max(255 - darkest, 60);
        // 3) الكتابة بلون الرمز الحي وألفا التغطية
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
          let a = ((255 - lum[p]) * 255) / span;
          if (a < 0) a = 0; else if (a > 255) a = 255;
          d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = a;
        }
        cx.putImageData(id, 0, 0);
        uri = cv.toDataURL("image/png");
      }
    } catch (_e) { uri = null; }
    tintCache.set(key, uri);
    return uri;
  }

  /** يبدأ قياس ‎src‎ (مرة واحدة) ويخزن نتيجته */
  function measureAsset(src) {
    if (!src || typeof document === "undefined") return null;
    if (geomValue.has(src)) return geomValue.get(src);
    if (geomPromise.has(src)) return null;
    const img = new Image();
    const done = (val) => {
      geomValue.set(src, val);
      geomPromise.delete(src);
      geomWaiters.slice().forEach((fn) => { try { fn(); } catch (_e) {} });
    };
    img.onload = () => {
      let val = null;
      try { val = measureImage(img); } catch (_e) { val = null; }
      done(val);
    };
    img.onerror = () => done(null);
    geomPromise.set(src, true);
    img.src = src;
    return null;
  }

  /** يسجّل مستمعاً لاكتمال القياس — يعيد دالة إلغاء */
  function onMeasured(fn) {
    geomWaiters.push(fn);
    return function off() {
      const i = geomWaiters.indexOf(fn);
      if (i !== -1) geomWaiters.splice(i, 1);
    };
  }

  /* تسخين مبكّر: القياس ينطلق عند تحميل الوحدة، قبل بناء الرأس بكثير
     (‎RH.data.store.init()‎ غير متزامن) — فالقفل يُبنى أفقياً من أول طلاء. */
  if (typeof document !== "undefined") {
    ASSET_KEYS.forEach((key) => {
      const variant = Object.keys(VARIANT_ASSET)
        .find((v) => VARIANT_ASSET[v] === key);
      const src = asset(variant);
      if (src) measureAsset(src);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) النمط الهندسي — متوازيات أضلاع متراكبة
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * ‎pattern(el, opts)‎ — يرسم طبقة النمط داخل ‎el‎ (تُضاف كطفل مطلق الموضع).
   * opts:
   *   opacity {number} تعتيم الطبقة كلها (افتراضي 0.10 — «نسبة تعتيم منخفضة»)
   *   angle   {number} ميل متوازي الأضلاع بالدرجات (افتراضي 18)
   *   size    {number} ضلع البلاطة بالبكسل (افتراضي 132)
   *   tone    {"brand"|"ink"} مصدر التدرّج (افتراضي brand)
   * يعيد دالة تنظيف تزيل الطبقة (تُسجَّل في ‎ctx.onTeardown‎).
   */
  function pattern(el, opts) {
    if (!el) return function () {};
    const o = opts || {};
    const opacity = typeof o.opacity === "number" ? o.opacity : 0.07;
    const angle = typeof o.angle === "number" ? o.angle : 18;
    const size = typeof o.size === "number" ? o.size : 108;
    const tone = o.tone === "ink" ? "ink" : "brand";

    const pid = nextId("rh-brandpat");
    const gid = nextId("rh-brandgrad");
    const skew = "skewX(" + (-angle) + ")";

    // ثلاث شرائح متراكبة داخل البلاطة: عرضها وتعتيمها متدرجان فيقرأ التراكب
    const slabs = [
      { x: 0, w: size * 0.42, o: 1 },
      { x: size * 0.30, w: size * 0.30, o: 0.62 },
      { x: size * 0.62, w: size * 0.20, o: 0.34 },
    ];

    const tile = svg("pattern", {
      id: pid, width: size, height: size,
      patternUnits: "userSpaceOnUse",
      patternTransform: "rotate(-8)",
    }, slabs.map((s) => svg("g", { transform: skew },
      svg("rect", {
        x: s.x.toFixed(2), y: -size * 0.4,
        width: s.w.toFixed(2), height: size * 1.8,
        fill: "url(#" + gid + ")", opacity: s.o,
      }))));

    const grad = svg("linearGradient", {
      id: gid, x1: "0", y1: "0", x2: "1", y2: "1",
    },
      svg("stop", {
        offset: "0",
        "stop-color": tone === "ink" ? "var(--ink)" : "var(--brand-teal)",
      }),
      svg("stop", {
        offset: "1",
        "stop-color": tone === "ink" ? "var(--ink-2)" : "var(--brand-deep)",
      }));

    const root = svg("svg", {
      class: "brand-pattern",
      "aria-hidden": "true", focusable: "false",
      preserveAspectRatio: "none",
      style: "opacity:" + opacity,
    },
      svg("defs", {}, grad, tile),
      svg("rect", { x: "0", y: "0", width: "100%", height: "100%",
        fill: "url(#" + pid + ")" }));

    el.appendChild(root);
    return function teardown() {
      if (root.parentNode) root.parentNode.removeChild(root);
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) العلامة المرسومة كوداً (البديل المعلن)
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * علامة مربّعة 64×64: ثلاث متوازيات أضلاع متراكبة داخل إطار مستدير.
   * ‎mono=true‎ ترسمها بلون النص الحالي (للرأس الداكن والنسخة البيضاء).
   */
  function markSvg(mono) {
    const gid = nextId("rh-markgrad");
    const fill = mono ? "currentColor" : "url(#" + gid + ")";
    const bars = [
      { x: 12, w: 13, o: 1 },
      { x: 26.5, w: 11, o: 0.72 },
      { x: 39, w: 9, o: 0.46 },
    ];
    return svg("svg", {
      class: "brand-mark-svg", viewBox: "0 0 64 64",
      "aria-hidden": "true", focusable: "false",
    },
      svg("defs", {},
        svg("linearGradient", { id: gid, x1: "0", y1: "0", x2: "1", y2: "1" },
          svg("stop", { offset: "0", "stop-color": "var(--brand-teal)" }),
          svg("stop", { offset: "1", "stop-color": "var(--brand-deep)" }))),
      svg("g", { transform: "skewX(-16) translate(6,0)" },
        bars.map((b) => svg("rect", {
          x: b.x, y: 10, width: b.w, height: 44, rx: 2.5,
          fill, opacity: b.o,
        }))));
  }

  /** ارتفاع الرمز في قفل الرأس (V3: 44–52px — «علامة قابلة للتعرّف لا أيقونة») */
  const MARK_H = 48;
  /** ارتفاع كتلة الاسم إلى جانبه (سطر عربي + سطر لاتيني) */
  const WORD_H = 34;

  /**
   * ‎cropSpan(src, box, full, renderH, cls)‎ — يقتطع مستطيلاً من صورة الهوية.
   * القصّ بخلفية موضوعة بدقة بدل ‎clip-path‎: يعمل في كل محرك، ويقبل التكبير
   * الجزئي، ولا يفرض عنصراً إضافياً. كل الأبعاد مشتقة من القياس الحي —
   * لا رقم مكتوب بيد.
   */
  function cropSpan(src, box, full, renderH, cls) {
    const s = renderH / box.h;
    return h("span", {
      class: cls,
      "aria-hidden": "true",
      style: {
        display: "block",
        flex: "0 0 auto",
        width: (box.w * s).toFixed(2) + "px",
        height: renderH.toFixed(2) + "px",
        backgroundImage: 'url("' + src + '")',
        backgroundSize: (full.w * s).toFixed(2) + "px "
          + (full.h * s).toFixed(2) + "px",
        backgroundPosition: (-box.x * s).toFixed(2) + "px "
          + (-box.y * s).toFixed(2) + "px",
        backgroundRepeat: "no-repeat",
      },
    });
  }

  /**
   * ‎logo(el, opts)‎ — يبني الشعار داخل ‎el‎ (يُفرَّغ أولاً).
   * opts:
   *   variant {"full"|"mark"|"white"} افتراضي "full"
   *   sub     {boolean} إظهار سطر الإدارة تحت الاسم (افتراضي: مع "full" فقط)
   *   label   {string}  نص بديل لقارئ الشاشة (افتراضي اسم الجهة)
   *   row     {boolean} قفل أفقي (رمز كبير + كتلة اسم) — الافتراضي مع "full"
   *   markH   {number}  ارتفاع الرمز في القفل الأفقي (افتراضي 48)
   * يعيد العنصر الجذري المُنشأ.
   */
  function logo(el, opts) {
    const o = opts || {};
    const variant = VARIANT_ASSET[o.variant] ? o.variant : "full";
    const label = o.label || ENTITY_AR;
    const showSub = typeof o.sub === "boolean" ? o.sub : (variant === "full");
    const wantRow = typeof o.row === "boolean" ? o.row : (variant === "full");
    const markH = typeof o.markH === "number" ? o.markH : MARK_H;
    if (el) clear(el);

    // اختيار **الأصل** بحسب السمة السارية: الشعار الملوّن يذوب على سطح داكن،
    // فتُقدَّم النسخة البيضاء إن ضُمِّنت. البديل المرسوم لا يحتاج ذلك أصلاً —
    // ألوانه رموز حيّة تتبع السمة بنفسها.
    const dark = RH.core.themeMode
      && RH.core.themeMode.effective() === "dark";
    // القفل الأفقي يُركَّب دائماً من الأصل **الملوَّن**؛ ملاءمة السطح الداكن
    // تتم بصبغ كتلة الاسم لا باستبدال الملف (انظر ‎tintCrop‎ أعلاه).
    const src = wantRow
      ? (asset(variant === "white" ? "white" : "full") || asset(variant))
      : ((variant === "full" && dark && asset("white")) || asset(variant));
    let node;
    const geom = src && wantRow ? (geomValue.has(src)
      ? geomValue.get(src) : measureAsset(src)) : null;
    if (src && geom) {
      // القفل الأفقي المعاد تركيبه من الأصل الرسمي نفسه: الرمز بحجمه الكامل،
      // وكتلة الاسم إلى جانبه — تُخفى وحدها على الشاشات الضيقة (CSS) فيبقى
      // الرمز شاهداً على الهوية بلا ازدحام.
      const wordH = markH * (WORD_H / MARK_H);
      // لون كتلة الاسم على السطح الداكن = حبر السمة نفسه ‎--ink‎ (وهو فاتح
      // هناك) فيتوحّد وزن الاسم مع عنوان المنصة بجواره. لا لون مكتوب.
      const tint = (dark && variant === "full")
        ? tintCrop(geom, geom.word, tokenColor("--ink", "#F4F1E6"))
        : null;
      const wordEl = tint
        ? h("img", {
          class: "brand-lock-word", src: tint, alt: "",
          "aria-hidden": "true", draggable: "false",
          style: { height: wordH.toFixed(2) + "px", width: "auto" },
        })
        : cropSpan(src, geom.word, geom.full, wordH, "brand-lock-word");
      node = h("span", {
        class: "brand-logo brand-logo--asset brand-logo--row is-" + variant,
        role: "img", "aria-label": label,
        dataset: { brandSource: "asset", brandLayout: "row" },
      },
        cropSpan(src, geom.mark, geom.full, markH, "brand-lock-mark"),
        wordEl);
    } else if (src) {
      // الأصل الرسمي المضمَّن كما هو — لم يُقس بعد (أو ليس قفلاً رأسياً)
      node = h("span", {
        class: "brand-logo brand-logo--asset is-" + variant,
        dataset: { brandSource: "asset" },
      },
        h("img", { src, alt: label, class: "brand-logo-img", draggable: "false" }));
    } else if (variant === "mark") {
      node = h("span", {
        class: "brand-logo brand-logo--coded is-mark",
        role: "img", "aria-label": label,
        dataset: { brandSource: "coded" },
      }, markSvg(false));
    } else {
      const mono = variant === "white";
      node = h("span", {
        class: "brand-logo brand-logo--coded is-" + variant,
        role: "img", "aria-label": label,
        dataset: { brandSource: "coded" },
      },
        h("span", { class: "brand-mark" }, markSvg(mono)),
        h("span", { class: "brand-words" },
          h("span", { class: "brand-name" }, ENTITY_AR),
          showSub ? h("span", { class: "brand-sub" }, ENTITY_SUB) : null));
    }
    if (el) el.appendChild(node);
    return node;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) قفل الرأس (lockup) — الشعار + عنوان المنصة + منطقة إجراءات
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * ‎lockup(opts)‎ — يعيد عنصر الرأس الهوياتي جاهزاً للإدراج.
   * opts:
   *   title    {string}  عنوان المنصة (يُمرَّر من ‎release.meta.title‎)
   *   subtitle {string}  سطر سياقي اختياري (تاريخ البيانات مثلاً)
   *   variant  {"full"|"white"} نسخة الشعار (افتراضي "full")
   *   actions  {Node[]}  أزرار الرأس (السمة/الموجز/اللوحة) — تُوضع في الطرف
   *   pattern  {boolean|object} طبقة النمط الهندسي خلف الرأس (افتراضي true)
   * الكائن المعاد يحمل ‎.el‎ و‎.actionsEl‎ و‎.teardown()‎.
   */
  function lockup(opts) {
    const o = opts || {};
    const logoBox = h("div", { class: "brand-lock-logo" });
    const paint = () => logo(logoBox, {
      variant: o.variant || "full", sub: false, row: true,
      markH: typeof o.markH === "number" ? o.markH : MARK_H,
    });
    paint();

    const titles = h("div", { class: "brand-lock-titles" },
      o.title ? h("h1", { class: "brand-lock-title" }, o.title) : null,
      o.subtitle ? h("p", { class: "brand-lock-sub" }, o.subtitle) : null);

    const actionsEl = h("div", { class: "brand-lock-actions" }, o.actions || []);

    const el = h("header", {
      class: "brand-lock", role: "banner",
    },
      h("div", { class: "brand-lock-inner" },
        logoBox,
        titles,
        h("span", { class: "brand-lock-rule", "aria-hidden": "true" }),
        actionsEl));

    let removePattern = function () {};
    if (o.pattern !== false) {
      const po = (o.pattern && typeof o.pattern === "object") ? o.pattern : {};
      removePattern = pattern(el, {
        opacity: typeof po.opacity === "number" ? po.opacity : 0.06,
        angle: typeof po.angle === "number" ? po.angle : 18,
        size: po.size,
      });
    }

    // تبديل السمة يعيد رسم الشعار كي تُختار نسخة الأصل الملائمة للسطح الجديد
    const offTheme = RH.core.bus.on("theme:change", paint);
    // واكتمال قياس هندسة الأصل يعيد رسمه أيضاً: إن سبق البناءُ القياسَ
    // (صورة بطيئة الفكّ) عُرضت الصورة كما هي، ثم تحلّ محلها التركيبة الأفقية
    // فور توفّر الحدود — بلا انتظار ولا شاشة فارغة.
    const offMeasure = onMeasured(paint);

    return {
      el, actionsEl, logoEl: logoBox,
      teardown() { removePattern(); offTheme(); offMeasure(); },
    };
  }

  return {
    pattern, logo, lockup, markSvg, measureImage, onMeasured,
    hasOfficialAssets, ASSET_KEYS, ENTITY_AR, ENTITY_SUB, MARK_H, WORD_H,
  };
})();
