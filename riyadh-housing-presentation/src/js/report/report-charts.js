/* ════════════════════════════════════════════════════════════════════════════
   report-charts.js — لقطات الرسوم للموجز التنفيذي المطبوع
   عقد V2_CONTRACTS_EXPANSION §3.2 — الملف الأول في ترتيب ضم حزمة الموجز
   ────────────────────────────────────────────────────────────────────────────
   ما تفعله هذه الوحدة بالضبط:

   • تبني رسماً من **القائمة القانونية للمنشئين (21)** في `RH.viz.charts2`
     داخل مضيف ثابت المقاس بالبكسل، ثم تجمّد حركته — لقطة سكونية تُطبع كما
     تظهر على الشاشة تماماً. الموجز مستند، لا مسرح: لا حركة ولا تحديث حي.

   • **لا `echarts.init` مباشر أبداً.** المثيل يُنشأ عبر سجل الثيم
     `RH.viz.theme.chart(id, el)` حصراً (عقد V2_CONTRACTS §3)، ومفتاح السجل
     يُفصل عن مثائل المقدِّم بتمرير `opts.key = "rpt…"` — فيصير المعرف
     `c2:<name>:rpt…` ولا يسحب سجلُ الثيم مثيلَ قسمٍ حيٍّ من تحت المقدِّم عند
     العودة من الموجز. هذا شرط عدم المساس بالبناء المعتمد.

   • **سجل مستقل للموجز:** الوحدة تحتفظ بخريطتها الخاصة `"rpt:<name>[:key]"`
     لأن `theme.disposeAll()` عام ويقتل رسوم المقدِّم أيضاً؛ فـ`disposeAll()`
     هنا يتخلص من مثائل الموجز وحدها. المدخلات المتقادمة في سجل الثيم غير
     ضارة: `theme.chart`/`resizeAll` يفحصان `isDisposed()` قبل الاستعمال.

   • **الحدة الطباعية (قرار تصميمي مقصود):** الرسم يُبنى بأبعاد أكبر من مساحته
     على الورق (560×320 و1160×300 و1160×460) ثم يُصغَّر بصرياً في
     `report.css` بـ`transform: scale(~0.61)`. القماش إذن مرسوم بكثافة نقاط
     ‎1.63×‎ تقريباً داخل إطاره الورقي، فيخرج في الـPDF حاداً لا مهترئاً — وهي
     الطريقة الوحيدة لإخراج canvas مقبول على A4 دون لمس مكتبة الرسوم.

   • **الصدق عند التعذر:** اسم خارج القائمة، أو غياب `echarts`، أو غياب
     `RH.viz.charts2`، أو استثناء داخل المُنشئ → **بطاقة «تعذر إدراج الرسم»**
     تشرح السبب بالعربية وتذكر اسم المُنشئ — لا صفحة فارغة صامتة ولا رسم بديل
     مختلق. البطاقة تُطبع كما هي كي يرى القارئ الغياب ويسأل عنه.

   • الرسوم المصغرة داخل الجداول (شرائح، sparklines، رقاقات دلتا، شريط نسبة)
     تمر عبر `RH.viz.micro` — SVG/DOM يطبع نصاً وخطوطاً حادة، لا canvas.

   ممنوعات سارية: لا رقم يُنسق يدوياً (كل شيء عبر `RH.core.fmt`)، لا لون خارج
   المنظومة الدلالية، لا محاور مزدوجة ولا gauges (المكتبة نفسها تضمن ذلك).
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

/* فضاء الموجز يُهيّأ هنا أول مرة (هذا الملف أول المضمومين في الحزمة).
   إشارة وجود الوحدة التي يفحصها chrome.js/app.js/nav.js هي
   `typeof RH.report.show === "function"` — وهي لا تتحقق إلا بضم report.js،
   فبناءٌ جزئي بلا report.js يبقى مكشوفاً بصدق ولا يظهر زر الموجز. */
RH.report = RH.report || {};

RH.report.charts = (function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* ══════════════════════════════════════════════════════════════════════════
     1) القائمة القانونية والثوابت الهندسية
     ══════════════════════════════════════════════════════════════════════════ */

  /** القائمة القانونية للمنشئين (21) — نسخة حرفية من جدول V2_CONTRACTS §3.
      أي اسم خارجها يُرفض ولو كان معرّفاً فعلاً على charts2: الموجز لا يخترع
      رسوماً ولا يستدعي منافذ اختبار داخلية (`_supplyInternals` وأخواتها). */
  const LEGAL = Object.freeze([
    // charts-supply.js
    "occupancyComposition",
    "econBars",
    "sectorSupplyDemand",
    "coverageEvolution",
    "forecastScenarios",
    "demandCollarSplit",
    // charts-licensing.js
    "cumulativeLicenses",
    "monthlyNetIssuance",
    "facilityTypes",
    "sectorLicenseCompare",
    "licenseGrowthBridge",
    // charts-control.js
    "monthlyActivityDual",
    "violationTypes",
    "sectorViolationsBars",
    "complianceCard",
    "closuresBars",
    // charts-strategy.js
    "initiativeGantt",
    "statusDonut",
    "pillarCards",
    "kpiBullets",
    "kpiMatrix",
  ]);

  /** المنشئون الذين لا يعيدون مثيل ECharts بل عنصر DOM (عقد §3: pillarCards
      «ليست ECharts»). هؤلاء يُبنون بنجاح لكن لا يدخلون سجل المثائل ولا
      يحتاجون تجميد حركة — والدالة تعيد `null` دون بطاقة خطأ لأن لا خطأ وقع. */
  const DOM_BUILDERS = Object.freeze(["pillarCards"]);

  /** المقاسات المعتمدة بالبكسل — يقابلها في report.css إطارات مصغَّرة:
        standard : 560×320  → إطار 343.5×196.2 بكسل (≈51.9مم)  — عمودان
        wide     : 1160×300 → إطار 703×181.8 بكسل (≈48.1مم)   — عرض الصفحة
        tall     : 1160×460 → إطار 703×278.8 بكسل (≈73.8مم)   — الجداول الزمنية
      عرض المحتوى على A4 بهوامش 12مم = 186مم = 703 بكسل عند 96dpi، ومنه اشتُقت
      معاملات التصغير. تغيير رقم هنا يوجب تغييره في report.css — الثابتان
      مرتبطان عمداً، والاختبار الوحدوي يثبّت النسب. */
  const SIZES = Object.freeze({
    standard: Object.freeze({ w: 560, h: 320, frameW: 343.5, frameH: 196.2, scale: 0.6134 }),
    wide: Object.freeze({ w: 1160, h: 300, frameW: 703, frameH: 181.8, scale: 0.6060 }),
    tall: Object.freeze({ w: 1160, h: 460, frameW: 703, frameH: 278.8, scale: 0.6060 }),
  });

  /** المقاس الافتراضي لكل مُنشئ — ما يستحق عرض الصفحة كاملاً وما يكفيه عمود.
      السلاسل الزمنية والمصفوفات والجداول الزمنية ممتدة؛ التركيبات والأعمدة
      الفئوية القصيرة تكتفي بنصف العرض. */
  const DEFAULT_SIZE = Object.freeze({
    occupancyComposition: "wide",
    econBars: "standard",
    sectorSupplyDemand: "wide",
    coverageEvolution: "wide",
    forecastScenarios: "wide",
    demandCollarSplit: "standard",
    cumulativeLicenses: "wide",
    monthlyNetIssuance: "wide",
    facilityTypes: "standard",
    sectorLicenseCompare: "standard",
    licenseGrowthBridge: "standard",
    monthlyActivityDual: "tall",
    violationTypes: "standard",
    sectorViolationsBars: "standard",
    complianceCard: "standard",
    closuresBars: "standard",
    initiativeGantt: "tall",
    statusDonut: "standard",
    pillarCards: "wide",
    kpiBullets: "tall",
    kpiMatrix: "wide",
  });

  /** الملف المصدر لكل مُنشئ — يظهر في بطاقة التعذر وفي جرد الرسوم، فيعرف
      القارئ (والمهندس) أين يبحث حين يغيب رسم من بناء جزئي. */
  const SOURCE_FILE = Object.freeze({
    occupancyComposition: "viz/charts/charts-supply.js",
    econBars: "viz/charts/charts-supply.js",
    sectorSupplyDemand: "viz/charts/charts-supply.js",
    coverageEvolution: "viz/charts/charts-supply.js",
    forecastScenarios: "viz/charts/charts-supply.js",
    demandCollarSplit: "viz/charts/charts-supply.js",
    cumulativeLicenses: "viz/charts/charts-licensing.js",
    monthlyNetIssuance: "viz/charts/charts-licensing.js",
    facilityTypes: "viz/charts/charts-licensing.js",
    sectorLicenseCompare: "viz/charts/charts-licensing.js",
    licenseGrowthBridge: "viz/charts/charts-licensing.js",
    monthlyActivityDual: "viz/charts/charts-control.js",
    violationTypes: "viz/charts/charts-control.js",
    sectorViolationsBars: "viz/charts/charts-control.js",
    complianceCard: "viz/charts/charts-control.js",
    closuresBars: "viz/charts/charts-control.js",
    initiativeGantt: "viz/charts/charts-strategy.js",
    statusDonut: "viz/charts/charts-strategy.js",
    pillarCards: "viz/charts/charts-strategy.js",
    kpiBullets: "viz/charts/charts-strategy.js",
    kpiMatrix: "viz/charts/charts-strategy.js",
  });

  /** عرض مرجعي لاشتقاق وحدة القياس su: عند 720 بكسل تكون su=1 فتخرج أحجام
      الخطوط كما صممت في المكتبة (14pt→14px). الحد الأدنى 0.62 يمنع انهيار
      كل التسميات إلى الحد الأدنى 11px في `theme.fs` فتتساوى الهرميّة. */
  const SU_REF = 720;
  const SU_MIN = 0.62;
  const SU_MAX = 1.0;

  /* ══════════════════════════════════════════════════════════════════════════
     2) سجل مثائل الموجز
     ══════════════════════════════════════════════════════════════════════════ */

  /** "rpt:<name>[:key]" → مثيل ECharts */
  const registry = new Map();
  /** سجل حالات التعذر في الجلسة الحالية — يقرؤه شريط الأدوات ليعلن بصدق
      «تعذر إدراج n رسماً» بدل أن يمر الغياب دون ذكر. */
  let failures = [];

  const instKey = (name, key) => "rpt:" + name + (key ? ":" + key : "");

  /* ══════════════════════════════════════════════════════════════════════════
     3) أدوات مساعدة نقية
     ══════════════════════════════════════════════════════════════════════════ */

  const isLegal = (name) => LEGAL.indexOf(name) !== -1;
  const isDomBuilder = (name) => DOM_BUILDERS.indexOf(name) !== -1;

  /** المقاس المعتمد لطلبٍ ما: صريح في opts، وإلا افتراضي المُنشئ، وإلا قياسي */
  function sizeOf(name, opts) {
    const wanted = opts && opts.size;
    if (wanted && SIZES[wanted]) return SIZES[wanted];
    const def = DEFAULT_SIZE[name];
    return SIZES[def] || SIZES.standard;
  }

  function sizeNameOf(name, opts) {
    const wanted = opts && opts.size;
    if (wanted && SIZES[wanted]) return wanted;
    return DEFAULT_SIZE[name] || "standard";
  }

  /** وحدة القياس المدرّجة من عرض القماش الفعلي — نقية ومختبَرة */
  function su(widthPx) {
    const w = typeof widthPx === "number" && widthPx > 0 ? widthPx : SU_REF;
    const raw = w / SU_REF;
    return Math.min(SU_MAX, Math.max(SU_MIN, Math.round(raw * 1000) / 1000));
  }

  /** ارتفاع الإطار الورقي بالمليمتر لمقاسٍ ما — يستهلكه محرك الترقيم في
      report-pages.js فلا يتكرر الرقم في مكانين. 96dpi ⇒ 1مم = 3.7795 بكسل. */
  const PX_PER_MM = 96 / 25.4;
  function frameHeightMm(sizeName) {
    const s = SIZES[sizeName] || SIZES.standard;
    return Math.round((s.frameH / PX_PER_MM) * 10) / 10;
  }
  function frameWidthMm(sizeName) {
    const s = SIZES[sizeName] || SIZES.standard;
    return Math.round((s.frameW / PX_PER_MM) * 10) / 10;
  }

  /** هل بيئة الرسم جاهزة؟ يفصل أسباب التعذر كي تكون البطاقة دقيقة لا عامة */
  function readiness(name) {
    if (typeof window === "undefined" || !window.echarts) {
      return { ok: false, reason: "مكتبة الرسوم ECharts غير محمّلة في هذا البناء" };
    }
    if (!RH.viz || !RH.viz.theme || typeof RH.viz.theme.chart !== "function") {
      return { ok: false, reason: "أساس الرسوم (viz/theme.js) غير مضمّن" };
    }
    if (!RH.viz.charts2) {
      return { ok: false, reason: "مكتبة charts2 غير مضمّنة في هذا البناء" };
    }
    if (typeof RH.viz.charts2[name] !== "function") {
      return {
        ok: false,
        reason: "المُنشئ «" + name + "» غير موجود — مصدره "
          + (SOURCE_FILE[name] || "غير معروف") + " ولعله خارج البناء",
      };
    }
    return { ok: true, reason: "" };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) بطاقة التعذر الصادقة
     ══════════════════════════════════════════════════════════════════════════ */

  /** بطاقة تُطبع مكان الرسم الغائب: عنوان صريح + السبب + اسم المُنشئ وملفه.
      لا زخرفة ولا أيقونة — سطر إداري يُقرأ ويُسأل عنه. */
  function failCard(host, name, reason) {
    const card = h("div", {
      class: "rpt-chart-fail",
      role: "note",
      "aria-label": "تعذر إدراج الرسم " + String(name),
    },
      h("div", { class: "rpt-chart-fail-title" }, "تعذر إدراج الرسم"),
      h("p", { class: "rpt-chart-fail-reason" }, String(reason || "سبب غير محدد")),
      h("div", { class: "rpt-chart-fail-meta" },
        h("span", {}, "المُنشئ: "),
        h("code", { dir: "ltr" }, String(name)),
        SOURCE_FILE[name]
          ? [h("span", {}, " · المصدر: "), h("code", { dir: "ltr" }, SOURCE_FILE[name])]
          : null),
    );
    if (host) host.appendChild(card);
    failures.push({ builder: String(name), reason: String(reason || "") });
    return card;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) اللقطة — snapshot(host, builderName, opts, su)
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * يبني رسماً قانونياً داخل مضيف ثابت المقاس ويجمّد حركته.
   *
   * @param {Element} host      مضيف اللقطة — يُعطى الأبعاد الصريحة هنا
   * @param {String}  name      اسم مُنشئ من القائمة القانونية (21)
   * @param {Object}  opts      خيارات المُنشئ + { size, key }
   * @param {Number}  suArg     وحدة القياس (تُشتق من العرض عند الإغفال)
   * @returns {Object|null}     مثيل ECharts، أو null (مُنشئ DOM أو تعذر)
   */
  function snapshot(host, name, opts, suArg) {
    if (!host || typeof host.appendChild !== "function") {
      console.warn("report.charts.snapshot: مضيف غير صالح للرسم " + name);
      return null;
    }
    const o = Object.assign({}, opts || {});
    const specKey = o.key || "";

    // (أ) بوابة القائمة القانونية — قبل أي لمس للمكتبة
    if (!isLegal(name)) {
      failCard(host, name,
        "المُنشئ غير مدرج في القائمة القانونية للرسوم (21 مُنشئاً) — "
        + "الموجز لا يعرض رسماً خارج العقد المعتمد.");
      return null;
    }

    // (ب) بوابة جاهزية البيئة — رسالة دقيقة لكل سبب
    const ready = readiness(name);
    if (!ready.ok) {
      failCard(host, name, ready.reason);
      return null;
    }

    // (ج) تهيئة المضيف بالأبعاد الصريحة قبل init — ECharts يقيس العنصر عند
    //     الإنشاء، فمضيف بلا ارتفاع يعطي قماشاً صفرياً يطبع فراغاً.
    const size = sizeOf(name, o);
    const sizeName = sizeNameOf(name, o);
    const plate = h("div", { class: "rpt-chart-plate" });
    plate.style.width = size.w + "px";
    plate.style.height = size.h + "px";
    plate.dataset.builder = name;
    plate.dataset.size = sizeName;
    host.appendChild(plate);

    // (د) مفتاح سجل الثيم معزول عن المقدِّم: "c2:<name>:rpt[-key]"
    o.key = "rpt" + (specKey ? "-" + specKey : "");
    // المقاس المدمج افتراضياً: يكبح أشرطة التبديل والملاحظات العائمة التي
    // لا معنى لها في مستند مطبوع (المكتبة تقرأ opts.compact). يُلغى صراحةً
    // بتمرير compact:false في مواصفة الصفحة عند الحاجة لرسم كامل الترويسة.
    if (o.compact === undefined) o.compact = sizeName === "standard";
    // أشرطة التبديل التفاعلية لا تُطبع — تُطفأ من المصدر لا بإخفاء بصري
    if (o.toggle === undefined) o.toggle = false;

    const unit = typeof suArg === "number" && suArg > 0 ? suArg : su(size.w);

    let inst = null;
    try {
      inst = RH.viz.charts2[name](plate, unit, o);
    } catch (e) {
      // فشل بناء واحد لا يسقط المستند: البطاقة تحل محل الرسم والبقية تُبنى
      if (plate.parentNode) plate.parentNode.removeChild(plate);
      failCard(host, name,
        "أخفق بناء الرسم: " + String((e && e.message) || e));
      return null;
    }

    // (هـ) مُنشئ DOM (pillarCards): بُني بنجاح، لا مثيل ولا حركة تُجمَّد
    if (isDomBuilder(name) || (inst && typeof inst.setOption !== "function")) {
      plate.classList.add("is-dom-builder");
      // البطاقات تتمدد بارتفاع محتواها — نحرر الارتفاع الثابت كي لا تُقص
      plate.style.height = "auto";
      stripInteractive(plate);
      return null;
    }

    if (!inst) {
      if (plate.parentNode) plate.parentNode.removeChild(plate);
      failCard(host, name, "لم يُرجع المُنشئ مثيل رسم صالحاً");
      return null;
    }

    // (و) تجميد الحركة إجبارياً — لقطة سكونية تطبع كما تظهر
    freeze(inst);

    // (ز) تنظيف ما لا يُطبع: أزرار التبديل ومقابض التفاعل داخل القماش
    stripInteractive(plate);

    registry.set(instKey(name, specKey), inst);
    return inst;
  }

  /** تجميد الحركة على مثيل قائم — يُستدعى بعد البناء وبعد أي إعادة مقاس.
      نمرر notMerge=false كي لا نمسح الخيارات المبنية، والدمج يكتفي بأعلام
      الحركة. المحاولة محاطة بحارس: مثيل متخلَّص منه لا يرمي بل يُتجاهل. */
  function freeze(inst) {
    if (!inst || typeof inst.setOption !== "function") return false;
    try {
      if (typeof inst.isDisposed === "function" && inst.isDisposed()) return false;
      inst.setOption({
        animation: false,
        animationDuration: 0,
        animationDurationUpdate: 0,
        animationDelay: 0,
        animationDelayUpdate: 0,
      }, false);
      return true;
    } catch (e) {
      console.warn("report.charts: تعذر تجميد حركة الرسم — " + (e.message || e));
      return false;
    }
  }

  /** إزالة العناصر التفاعلية التي تحقنها بعض المنشئات فوق القماش
      (`.c2-measure-toggle`): أزرار لا وظيفة لها في ورق مطبوع، ووجودها في
      لقطة PDF يوحي بتفاعل غير موجود. الجدول النصي المكافئ (`.sr-chart-table`)
      **يبقى** — هو إتاحة لا زخرفة، وهو مخفي بصرياً أصلاً. */
  function stripInteractive(plate) {
    if (!plate || typeof plate.querySelectorAll !== "function") return 0;
    let n = 0;
    const kill = plate.querySelectorAll(".c2-measure-toggle");
    for (let i = 0; i < kill.length; i++) {
      const el = kill[i];
      if (el.parentNode) { el.parentNode.removeChild(el); n += 1; }
    }
    // المضيف لا يلتقط مفاتيح العرض في وضع الموجز أصلاً، لكن إزالة العلامة
    // تمنع أي التباس مستقبلي مع حارس `isInteractive` في nav.js
    if (plate.removeAttribute) plate.removeAttribute("data-interactive");
    return n;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) بناء «شكل» كامل: إطار + لقطة + تسمية + وسم صدق
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * يبني عنصر `<figure>` كاملاً من مواصفة رسم في نموذج الصفحات:
   *   { builder, opts?, caption, caveat? }
   * ويعيد { el, inst, ok } — `ok=false` حين حلّت بطاقة التعذر محل الرسم.
   * الوسم (caveat) يسافر مع الرسم دائماً: هو جزء من الشكل لا حاشية منفصلة.
   */
  function figure(container, spec, suArg) {
    const name = spec && spec.builder;
    const sizeName = sizeNameOf(name, spec && spec.opts);
    const size = SIZES[sizeName] || SIZES.standard;

    const fig = h("figure", {
      class: "rpt-figure is-" + sizeName,
      dataset: { builder: String(name || "?") },
    });
    const frame = h("div", { class: "rpt-chart-frame is-" + sizeName });
    // الأبعاد الصريحة على الإطار: الورق لا يعيد التخطيط، فكل مقاس محسوب سلفاً
    frame.style.width = size.frameW + "px";
    frame.style.height = size.frameH + "px";
    fig.appendChild(frame);

    const inst = snapshot(frame, name, spec && spec.opts, suArg);
    const domOk = !inst && isDomBuilder(name);
    const ok = !!inst || domOk;

    if (spec && spec.caption) {
      fig.appendChild(h("figcaption", { class: "rpt-figcaption" },
        String(spec.caption)));
    }
    if (spec && spec.caveat) {
      fig.appendChild(h("p", { class: "rpt-figure-caveat" }, String(spec.caveat)));
    }
    if (container) container.appendChild(fig);
    return { el: fig, inst, ok };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) الرسوم المصغرة داخل الجداول — عبر RH.viz.micro (SVG يطبع حاداً)
     ══════════════════════════════════════════════════════════════════════════ */

  const hasMicro = () => !!(RH.viz && RH.viz.micro);

  /** شريط نسبة مصغر داخل خلية جدول (تغطية قطاع، حصة مخالفات…).
      النغمة دلالية: `neg` للعجز والمخالفات، `pos` للطاقة والتغطية. */
  function ratioCell(cell, pct, opts) {
    if (!cell) return null;
    if (!hasMicro()) { cell.appendChild(document.createTextNode(fmt.pct(pct))); return null; }
    const o = opts || {};
    return RH.viz.micro.ratioBar(cell, {
      pct,
      tone: o.tone || "pos",
      fmt: o.fmt || fmt.pct,
      ariaLabel: o.ariaLabel || null,
      target: o.target || null,
      note: o.note || null,
    });
  }

  /** خط اتجاه مصغر داخل خلية (سلسلة شهرية) — بلا علامة آخر قيمة افتراضياً
      كي لا يزدحم عمود ضيق، وبفجوات صادقة عند القيم الغائبة. */
  function sparkCell(cell, values, opts) {
    if (!cell) return null;
    if (!hasMicro()) return null;
    const o = opts || {};
    return RH.viz.micro.sparkline(cell, {
      values,
      width: o.width || 132,
      height: o.height || 30,
      tone: o.tone || "pos",
      area: o.area === true,
      markLast: o.markLast === true,
      fmt: o.fmt || fmt.int,
      target: o.target || null,
      ariaLabel: o.ariaLabel || null,
    });
  }

  /** أشرطة أفقية مصغرة (توزيع فئوي داخل بطاقة أو خلية ممتدة) */
  function barsCell(cell, items, opts) {
    if (!cell) return null;
    if (!hasMicro()) return null;
    const o = opts || {};
    return RH.viz.micro.microBars(cell, {
      items,
      max: o.max,
      tone: o.tone || "pos",
      fmt: o.fmt || fmt.int,
      ariaLabel: o.ariaLabel || null,
    });
  }

  /** رقاقة تغيّر — `positiveIsGood:false` إلزامي للعجز والمخالفات */
  function deltaCell(cell, value, opts) {
    if (!cell) return null;
    if (!hasMicro()) { cell.appendChild(document.createTextNode(fmt.int(value))); return null; }
    const o = opts || {};
    return RH.viz.micro.deltaChip(cell, {
      value,
      positiveIsGood: o.positiveIsGood !== false,
      fmt: o.fmt || fmt.int,
      label: o.label || null,
      title: o.title || null,
      ariaLabel: o.ariaLabel || null,
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) دورة الحياة: تخلص، إعادة مقاس، جرد
     ══════════════════════════════════════════════════════════════════════════ */

  /** يتخلص من مثائل الموجز وحدها — رسوم المقدِّم في سجل الثيم لا تُمسّ.
      يعيد عدد ما تُخلّص منه فعلاً (يستهلكه اختبار التسرب في e2e). */
  function disposeAll() {
    let n = 0;
    for (const inst of registry.values()) {
      try {
        if (inst && typeof inst.isDisposed === "function" && !inst.isDisposed()) {
          inst.dispose();
          n += 1;
        }
      } catch (e) {
        console.warn("report.charts.disposeAll: " + (e.message || e));
      }
    }
    registry.clear();
    failures = [];
    return n;
  }

  /** يتخلص من مثيل واحد بالاسم والمفتاح (إعادة بناء صفحة بمفردها) */
  function dispose(name, key) {
    const k = instKey(name, key || "");
    const inst = registry.get(k);
    if (!inst) return false;
    try {
      if (typeof inst.isDisposed === "function" && !inst.isDisposed()) inst.dispose();
    } catch (_e) { /* مثيل ميت أصلاً */ }
    registry.delete(k);
    return true;
  }

  /** إعادة مقاس مثائل الموجز — تُستدعى بعد تغيير تكبير المعاينة أو قبل الطباعة.
      الأبعاد ثابتة بالبكسل فالعملية عادةً بلا أثر، لكنها تعيد رسم القماش على
      نسبة البكسل الحالية للجهاز (مهم عند سحب النافذة بين شاشتين مختلفتي DPI). */
  function resizeAll() {
    let n = 0;
    for (const inst of registry.values()) {
      try {
        if (inst && typeof inst.isDisposed === "function" && !inst.isDisposed()) {
          inst.resize();
          freeze(inst);
          n += 1;
        }
      } catch (_e) { /* نتجاهل: مثيل في طور التخلص */ }
    }
    return n;
  }

  /** جرد ما بُني فعلاً — يستهلكه شريط الأدوات وسطر الإسناد في صفحة الإسناد */
  function inventory() {
    return {
      built: registry.size,
      keys: Array.from(registry.keys()),
      failed: failures.map((f) => Object.assign({}, f)),
      failedCount: failures.length,
    };
  }

  /** جملة عربية صادقة عن حالة الرسوم — لا تُخفي التعذر ولا تضخّم النجاح */
  function inventoryLabel() {
    const inv = inventory();
    if (!inv.built && !inv.failedCount) return "لا رسوم في الاختيار الحالي";
    const parts = [];
    parts.push("أُدرج " + fmt.int(inv.built) + " رسماً");
    if (inv.failedCount) {
      parts.push("وتعذر إدراج " + fmt.int(inv.failedCount)
        + (inv.failedCount === 1 ? " رسم واحد" : " رسماً"));
    }
    return parts.join("، ");
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) الواجهة العامة
     ══════════════════════════════════════════════════════════════════════════ */

  return {
    // العقد الأساسي (§3.2)
    snapshot,
    disposeAll,
    // امتدادات عملية يستهلكها report.js وadmin/report-builder.js
    figure,
    dispose,
    resizeAll,
    freeze,
    inventory,
    inventoryLabel,
    // منطق نقي مُصدَّر للاختبار الوحدوي
    LEGAL,
    DOM_BUILDERS,
    SIZES,
    DEFAULT_SIZE,
    SOURCE_FILE,
    PX_PER_MM,
    isLegal,
    isDomBuilder,
    sizeNameOf,
    su,
    frameHeightMm,
    frameWidthMm,
    // أدوات الخلايا المصغرة
    ratioCell,
    sparkCell,
    barsCell,
    deltaCell,
  };
})();
