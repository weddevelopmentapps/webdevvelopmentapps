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

  /**
   * ‎logo(el, opts)‎ — يبني الشعار داخل ‎el‎ (يُفرَّغ أولاً).
   * opts:
   *   variant {"full"|"mark"|"white"} افتراضي "full"
   *   sub     {boolean} إظهار سطر الإدارة تحت الاسم (افتراضي: مع "full" فقط)
   *   label   {string}  نص بديل لقارئ الشاشة (افتراضي اسم الجهة)
   * يعيد العنصر الجذري المُنشأ.
   */
  function logo(el, opts) {
    const o = opts || {};
    const variant = VARIANT_ASSET[o.variant] ? o.variant : "full";
    const label = o.label || ENTITY_AR;
    const showSub = typeof o.sub === "boolean" ? o.sub : (variant === "full");
    if (el) clear(el);

    // اختيار **الأصل** بحسب السمة السارية: الشعار الملوّن يذوب على سطح داكن،
    // فتُقدَّم النسخة البيضاء إن ضُمِّنت. البديل المرسوم لا يحتاج ذلك أصلاً —
    // ألوانه رموز حيّة تتبع السمة بنفسها.
    const dark = RH.core.themeMode
      && RH.core.themeMode.effective() === "dark";
    const src = (variant === "full" && dark && asset("white"))
      || asset(variant);
    let node;
    if (src) {
      // الأصل الرسمي المضمَّن — يُعرض كما هو بلا أي تدخل لوني
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
    logo(logoBox, { variant: o.variant || "full", sub: false });

    const titles = h("div", { class: "brand-lock-titles" },
      o.title ? h("h1", { class: "brand-lock-title" }, o.title) : null,
      o.subtitle ? h("p", { class: "brand-lock-sub" }, o.subtitle) : null);

    const actionsEl = h("div", { class: "brand-lock-actions" }, o.actions || []);

    const el = h("header", {
      class: "brand-lock", role: "banner",
    },
      h("div", { class: "brand-lock-inner" },
        logoBox,
        h("span", { class: "brand-lock-rule", "aria-hidden": "true" }),
        titles,
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
    const offTheme = RH.core.bus.on("theme:change", () => {
      logo(logoBox, { variant: o.variant || "full", sub: false });
    });

    return {
      el, actionsEl, logoEl: logoBox,
      teardown() { removePattern(); offTheme(); },
    };
  }

  return {
    pattern, logo, lockup, markSvg,
    hasOfficialAssets, ASSET_KEYS, ENTITY_AR, ENTITY_SUB,
  };
})();
