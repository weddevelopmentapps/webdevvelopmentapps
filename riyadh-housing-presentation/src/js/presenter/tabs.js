/* tabs.js — قشرة التبويبات الخمسة والمتتبّع (V3_SPEC §4)
   ══════════════════════════════════════════════════════
   البنية الجديدة التي طلبها العميل حرفياً: «No need for one condensed executive
   summary. Have 4 tabs (with a tracker at the top)» ثم عدّد خمسة:
   الطلب · التراخيص · الرقابة · المبادرات · مؤشرات الأداء. **وكل ما عداها ملحق.**

   ما تملكه هذه الوحدة:
     • ‎RH.tabs.register({id, order, title, build(el, ctx)})‎ — سجل بانات التبويبات.
     • قفل الرأس الهوياتي (‎RH.brand.lockup‎) + المتتبّع ‎١…٥‎ بحالة راهنة،
       ملاحة لوحة مفاتيح كاملة (أسهم/Home/End) و‎tabindex‎ متجوّل.
     • المسار ‎#/tab/<id>‎ (الافتراضي ‎#/tab/demand‎) وإحالة المسارات القديمة
       ‎#/section/*‎ إلى تبويبها أو إلى ملحقها.
     • أزرار الرأس: مبدّل السمة · الموجز التنفيذي · لوحة الأوامر · وضع العرض.
     • **وضع العرض بملء الشاشة بالكليكر يبقى حياً**: طبقة اختيارية فوق
       التبويبات تعيد استعمال محرك المشاهد كما هو (V3_SPEC §6) — لم يُحذف منه شيء.

   قواعد ملزمة على بانو التبويبات (تُفحص في المراجعة):
     • الرسم الرئيس ‎min-height: min(46vh, 420px)‎ — الصنف ‎.tabchart‎ يوفّرها.
     • رسمان رئيسان كحد أقصى في الصف، وأربعة عناصر كحد أقصى في شبكة الشاشة.
     • كل تلميح من ‎RH.viz.theme.tooltip(su)‎ ومحتواه ‎ttMicro‎ (سطران).
     • النقرة الأولى تفتح ‎RH.highlight.open‎ لا نافذة تفاصيل مطوّلة.
     • كل رقم عبر ‎RH.core.fmt‎ · كل تفاعل يُنظَّف عبر ‎ctx.onTeardown‎. */
"use strict";

RH.tabs = (function () {
  const { h, clear } = RH.core.dom;

  /** تسجيلات وصلت قبل تعريف القشرة (طابور ‎ns.js‎) — تُصرَّف في نهاية الوحدة */
  const PENDING = (RH.tabs && Array.isArray(RH.tabs._pending))
    ? RH.tabs._pending.slice() : [];

  /* ══════════════════════════════════════════════════════════════════════════
     1) القائمة القانونية والسجل
     ══════════════════════════════════════════════════════════════════════════ */

  /** المعرفات الخمسة القانونية بترتيب المتتبّع — لا سادس */
  const VALID_IDS = Object.freeze([
    "demand", "licensing", "control", "initiatives", "kpis",
  ]);
  const DEFAULT_ID = "demand";

  /** العناوين الاحتياطية (يتجاوزها ‎def.title‎ عند التسجيل) */
  const FALLBACK_TITLES = Object.freeze({
    demand: "الطلب",
    licensing: "التراخيص",
    control: "الرقابة",
    initiatives: "المبادرات",
    kpis: "مؤشرات الأداء",
  });

  /** أرقام عربية-هندية للمتتبّع (١…٥) */
  const AR_DIGITS = Object.freeze(["١", "٢", "٣", "٤", "٥"]);

  /** إحالة أقسام V2 القديمة: إمّا تبويب وإمّا ملحق (V3_SPEC §4) */
  const SECTION_TO_TAB = Object.freeze({
    demand: "demand", licensing: "licensing", control: "control",
    initiatives: "initiatives", kpis: "kpis",
  });
  const SECTION_TO_APPENDIX = Object.freeze({
    summary: "summary",      /* الملخص التنفيذي السابق صار ملحقاً */
    map: "atlas",            /* الخريطة الموسعة → أطلس الأحياء */
    forecast: "scenarios",   /* التوقعات → مستكشف السيناريوهات */
    closing: "decisions",    /* الخطوات التالية → سجل القرارات */
  });

  /** أسماء بديلة → المعرف القانوني.
      المحور الثالث اسمه «الرقابة» ومعرفه القانوني ‎control‎ (V3_CONTRACTS §4-أ)
      بينما مَلَفّه وتنسيقه وملحقه تحمل اسم ‎monitoring‎؛ والمحور الخامس ملحقه
      ‎kpi‎ بالمفرد. أي رابط عميق يُكتب بالاسم البديل كان يسقط صامتاً إلى
      ‎demand‎ ويترك العنوان يكذب على الشاشة — فيُحال هنا إلى معرفه القانوني
      ويُعاد كتابة العنوان. لا تبويب سادس يُخلق بهذا: الأسماء البديلة إحالات
      إلى الخمسة لا أعضاء في القائمة القانونية. */
  const ID_ALIASES = Object.freeze({
    monitoring: "control",   /* ملف/تنسيق/ملحق التبويب ٣ */
    kpi: "kpis",             /* ملحق التبويب ٥ بالمفرد */
  });

  /** يعيد المعرف القانوني لأي مدخل (أو ‎null‎ إن كان مجهولاً تماماً) */
  function canonicalId(id) {
    const key = String(id == null ? "" : id).trim().toLowerCase();
    if (VALID_IDS.includes(key)) return key;
    return ID_ALIASES[key] || null;
  }

  const defs = new Map();
  let booted = false;

  function register(def) {
    if (!def || !def.id || typeof def.build !== "function") {
      throw new Error("تسجيل تبويب ناقص: id وbuild إلزاميان");
    }
    const id = canonicalId(def.id);
    if (!id) {
      throw new Error("معرف تبويب خارج القائمة القانونية: " + def.id);
    }
    if (typeof def.order !== "number") {
      throw new Error("التبويب " + id + " بلا ترتيب order");
    }
    defs.set(id, id === def.id ? def : Object.assign({}, def, { id }));
    if (booted) renderTracker();
  }

  const get = (id) => defs.get(id) || null;
  const list = () => VALID_IDS.map((id) => defs.get(id)).filter(Boolean);
  const titleOf = (id) => (defs.get(id) && defs.get(id).title)
    || FALLBACK_TITLES[id] || id;

  /* ══════════════════════════════════════════════════════════════════════════
     2) بناء القشرة
     ══════════════════════════════════════════════════════════════════════════ */

  let rootEl = null;       // #tabs-root
  let panelEl = null;      // مضيف التبويب الحالي
  let trackEl = null;      // شريط المتتبّع
  let lock = null;         // كائن قفل الرأس من RH.brand
  let currentId = null;
  let currentParams = {};
  const teardowns = [];    // تنظيفات بناء التبويب الحالي
  const chartIds = [];     // معرفات رسوم التبويب الحالي (تُتلف عند التبديل)

  /** أيقونة خطية موحدة السماكة ترث لون النص */
  function ico(...paths) {
    return RH.core.dom.svg("svg", {
      class: "tabx-ico", viewBox: "0 0 24 24", "aria-hidden": "true",
      focusable: "false",
    }, paths.map((d) => RH.core.dom.svg("path", { d })));
  }

  function headerButton(opts) {
    return h("button", {
      class: "tabx-btn" + (opts.cls ? " " + opts.cls : ""),
      id: opts.id, type: "button",
      title: opts.title, "aria-label": opts.label || opts.title,
      onclick: opts.onclick,
    }, opts.icon, opts.text ? h("span", { class: "tabx-txt" }, opts.text) : null);
  }

  /** أزرار الرأس — تُخفى تلقائياً إن غابت وحدتها (بناء جزئي) */
  function buildActions() {
    const themeBtn = headerButton({
      id: "tabx-theme", cls: "tabx-theme",
      title: RH.core.themeMode.label(),
      icon: h("span", { class: "tabx-theme-ico", "aria-hidden": "true" }),
      onclick: () => RH.core.themeMode.toggle(),
    });
    syncThemeButton(themeBtn);
    RH.core.bus.on("theme:change", () => syncThemeButton(themeBtn));

    const paletteBtn = headerButton({
      id: "tabx-palette",
      title: "بحث وتنقّل سريع — Ctrl+K",
      icon: ico("M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M20 20l-4-4"),
      onclick: () => RH.core.bus.emit("palette:toggle"),
    });
    paletteBtn.hidden = !(RH.palette && typeof RH.palette.toggle === "function");

    const reportBtn = headerButton({
      id: "tabx-report",
      title: "الموجز التنفيذي المطبوع",
      icon: ico("M6 3h8l4 4v14H6z", "M14 3v4h4", "M9 12h6", "M9 16h6"),
      onclick: () => RH.core.router.go({ kind: "report", id: "main", params: {} }),
    });
    reportBtn.hidden = !(RH.report && typeof RH.report.show === "function");

    const presentBtn = headerButton({
      id: "tabx-present",
      title: "وضع العرض بملء الشاشة (يقوده جهاز التقديم)",
      label: "وضع العرض",
      icon: ico("M4 9V4h5", "M20 15v5h-5", "M20 9V4h-5", "M4 15v5h5"),
      onclick: () => present.enter(),
    });

    return [themeBtn, paletteBtn, reportBtn, presentBtn];
  }

  function syncThemeButton(btn) {
    if (!btn) return;
    const eff = RH.core.themeMode.effective();
    btn.dataset.theme = eff;
    btn.title = RH.core.themeMode.label();
    btn.setAttribute("aria-label", RH.core.themeMode.label());
    btn.setAttribute("aria-pressed", eff === "dark" ? "true" : "false");
  }

  /** المتتبّع ١…٥ */
  function renderTracker() {
    if (!trackEl) return;
    // المتتبّع يُعاد بناؤه كاملاً عند كل ‎show‎، فيُتلف الزر الذي يحمل التركيز
    // ويسقط التركيز إلى ‎<body>‎ — وعندها تموت ملاحة لوحة المفاتيح بعد خطوة
    // واحدة. نلتقط الحالة قبل الهدم ونعيدها إلى الزر الراهن بعد البناء، فيبقى
    // الـ‎tabindex‎ المتجوّل حياً ويصح تسلسل الأسهم/Home/End بلا انقطاع.
    const hadFocus = !!(document.activeElement
      && trackEl.contains(document.activeElement));
    clear(trackEl);
    // المتتبّع يعرض المحاور الخمسة **دائماً** بترتيبها القانوني، مسجَّلةً كانت
    // أم لا: بنيةُ المنصة ثابتة أمام العميل، والتبويب غير المبني يُعلن غيابه
    // بصدق في لوحه بدل أن يختفي من الشريط فتبدو المنصة ناقصة محاور.
    const items = VALID_IDS.map((id) => defs.get(id)
      || { id, title: FALLBACK_TITLES[id], pending: true });
    items.forEach((def, i) => {
      const id = def.id;
      const active = id === currentId;
      const btn = h("button", {
        class: "tabtrack-item" + (active ? " is-current" : "")
          + (def.pending ? " is-pending" : "")
          + (currentId && VALID_IDS.indexOf(id) < VALID_IDS.indexOf(currentId)
            ? " is-past" : ""),
        type: "button", role: "tab",
        id: "tabtrack-" + id,
        "aria-controls": "tabpanel-" + id,
        "aria-selected": active ? "true" : "false",
        tabindex: active ? "0" : "-1",
        dataset: { tab: id },
        onclick: () => go(id),
        onkeydown: (e) => onTrackKey(e, i, items),
      },
        h("span", { class: "tabtrack-num", "aria-hidden": "true" },
          AR_DIGITS[i] || String(i + 1)),
        h("span", { class: "tabtrack-label" }, def.title || FALLBACK_TITLES[id]),
        h("span", { class: "tabtrack-dot", "aria-hidden": "true" }));
      trackEl.appendChild(btn);
    });
    // شريط التقدم أسفل المتتبّع: نسبة الموقع الحالي من الخمسة
    const pos = items.findIndex((d) => d.id === currentId);
    const pct = items.length ? ((pos + 1) / items.length) * 100 : 0;
    trackEl.appendChild(h("span", {
      class: "tabtrack-rail", "aria-hidden": "true",
    }, h("span", {
      class: "tabtrack-fill",
      style: { inlineSize: pct.toFixed(1) + "%" },
    })));
    if (hadFocus) {
      const cur = document.getElementById("tabtrack-" + currentId);
      if (cur) cur.focus();
    }
  }

  /** أسهم لوحة المفاتيح داخل المتتبّع (RTL: اليسار = التالي) */
  function onTrackKey(e, index, items) {
    let next = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = index + 1;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    e.stopPropagation();
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    go(items[next].id);
    const el = document.getElementById("tabtrack-" + items[next].id);
    if (el) el.focus();
  }

  /** ينشئ جذر القشرة مرة واحدة */
  function ensureRoot() {
    if (rootEl) return rootEl;
    const rel = RH.data.store.release();

    trackEl = h("div", {
      class: "tabtrack", role: "tablist",
      "aria-label": "محاور اللوحة الخمسة",
    });

    panelEl = h("main", {
      class: "tab-panel", role: "tabpanel", id: "tabpanel-" + DEFAULT_ID,
      tabindex: "-1",
    });

    lock = RH.brand.lockup({
      title: rel.meta.title,
      subtitle: "البيانات حتى " + RH.core.fmt.iso(rel.meta.data_as_of),
      actions: buildActions(),
    });

    rootEl = h("div", { id: "tabs-root", class: "tabs-root" },
      lock.el,
      h("nav", { class: "tabtrack-bar", "aria-label": "متتبّع المحاور" }, trackEl),
      panelEl);
    document.body.appendChild(rootEl);

    // مخرج وضع العرض: زر ثابت خارج جذر التبويبات كي يبقى ظاهراً بعد إخفائه
    document.body.appendChild(h("button", {
      class: "tabx-btn tabs-exit-present", type: "button",
      id: "tabx-exit-present",
      title: "الخروج من وضع العرض والعودة إلى التبويبات (Esc)",
      "aria-label": "الخروج من وضع العرض",
      onclick: () => present.exit(),
    }, ico("M9 4H4v5", "M15 20h5v-5", "M15 4h5v5", "M9 20H4v-5"),
      h("span", { class: "tabx-txt" }, "إنهاء وضع العرض")));

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("keydown", onGlobalKey, true);

    // تبديل السمة: يعيد بناء التبويب الحالي كاملاً بعد إعادة صبغ الرسوم،
    // فتلحق العناصر المرسومة بـSVG/DOM (الحلقات والرسوم المصغرة) باللوحة.
    RH.viz.theme.onRetheme(() => {
      if (document.body.classList.contains("mode-tabs") && currentId) {
        buildTab(currentId, currentParams);
      }
    });
    return rootEl;
  }

  let resizeTimer = null;
  function onResize() {
    if (!document.body.classList.contains("mode-tabs")) return;
    setSu();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => RH.viz.theme.resizeAll(), 140);
  }

  /** وحدة القياس المدرّجة في وضع التبويبات: العرض الكامل لا إطار 16:9 */
  function setSu() {
    const su = Math.min(Math.max(window.innerWidth, 900) / 1920, 1.12);
    document.documentElement.style.setProperty("--su", su.toFixed(5) + "px");
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) بناء تبويب
     ══════════════════════════════════════════════════════════════════════════ */

  function runTeardowns() {
    while (teardowns.length) {
      const fn = teardowns.pop();
      try { fn(); } catch (_e) { /* تنظيف لا يُسقط تنظيفاً */ }
    }
    while (chartIds.length) {
      const id = chartIds.pop();
      try { RH.viz.theme.disposeById(id); } catch (_e) { /* المثيل زال سلفاً */ }
    }
    if (RH.highlight) RH.highlight.close();
  }

  function buildTab(id, params) {
    const def = defs.get(id);
    runTeardowns();
    clear(panelEl);
    panelEl.id = "tabpanel-" + id;
    panelEl.setAttribute("aria-labelledby", "tabtrack-" + id);
    panelEl.dataset.tab = id;

    if (!def) {
      panelEl.appendChild(h("div", { class: "tab-missing" },
        h("h2", {}, "التبويب غير مُسجَّل بعد"),
        h("p", {}, "المعرف «" + id + "» ضمن القائمة القانونية لكن بانيه غائب "
          + "عن هذا البناء — لا محتوى مختلق يعوّضه.")));
      return;
    }

    setSu();
    const su = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--su")) || 1;

    const ctx = {
      su,
      release: RH.data.store.release(),
      derived: RH.data.store.der(),
      geo: window.GEO || null,
      params: params || {},
      route: { kind: "tab", id, params: params || {} },
      tab: id,
      def,
      /** تحديث معاملات التبويب في العنوان دون إدخال تاريخ جديد */
      update: (patch) => updateParams(patch),
      onTeardown: (fn) => { if (typeof fn === "function") teardowns.push(fn); },
      /** مثيل رسم بمعرف مُفضَّى بالتبويب — يُتلف تلقائياً عند مغادرة التبويب */
      chart: (name, el) => {
        const cid = "tab:" + id + ":" + name;
        if (chartIds.indexOf(cid) === -1) chartIds.push(cid);
        return RH.viz.theme.chart(cid, el);
      },
      /** الطبقة الثانية من سلوك النقر — نافذة الإبراز بحدّها الصارم */
      highlight: (spec) => RH.highlight.bind(ctx, spec),
      openAppendix: (aid, aparams) =>
        RH.presenter.engine.openAppendix(aid, aparams),
    };

    try {
      def.build(panelEl, ctx);
    } catch (e) {
      clear(panelEl);
      panelEl.appendChild(h("div", { class: "tab-missing" },
        h("h2", {}, "تعذّر بناء التبويب"),
        h("p", {}, String((e && e.message) || e))));
      if (typeof console !== "undefined") console.error(e);
    }
    setTimeout(() => RH.viz.theme.resizeAll(), 40);
  }

  function updateParams(patch) {
    const next = Object.assign({}, currentParams, patch || {});
    for (const k of Object.keys(next)) {
      if (next[k] == null || next[k] === "" || next[k] === "0") delete next[k];
    }
    currentParams = next;
    RH.core.router.go({ kind: "tab", id: currentId, params: next },
      { replace: true, inPlace: true });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) الملاحة
     ══════════════════════════════════════════════════════════════════════════ */

  function go(id, params) {
    RH.core.router.go({
      kind: "tab", id: canonicalId(id) || DEFAULT_ID, params: params || {},
    });
  }

  /**
   * إحالة مسار قديم (‎#/section/*‎ أو ‎#/scene/*‎) إلى وجهته في V3.
   * يعيد كائن مسار جديد أو ‎null‎ إن كان المسار مشروعاً كما هو.
   */
  function resolveLegacy(route) {
    if (!route || route.kind !== "scene") return null;
    const id = String(route.id);
    if (SECTION_TO_TAB[id]) {
      return { kind: "tab", id: SECTION_TO_TAB[id], params: route.params || {} };
    }
    const ax = SECTION_TO_APPENDIX[id];
    if (ax && RH.presenter.engine.hasAppendix(ax)) {
      return { kind: "appendix", id: ax, params: route.params || {} };
    }
    // الغلاف والمعرفات المجهولة → التبويب الافتراضي (لا شاشة فارغة أبداً)
    return { kind: "tab", id: DEFAULT_ID, params: {} };
  }

  /** يعرض تبويباً (يستدعيه معالج الموجّه في app.js) */
  function show(route) {
    ensureRoot();
    const id = canonicalId(route.id) || DEFAULT_ID;
    const params = route.params || {};
    // العنوان لا يكذب على الشاشة: اسم بديل (‎monitoring‎) أو معرف مجهول يُعرض
    // بمعرفه القانوني، فيُعاد كتابة الهاش استبدالاً صامتاً (لا إدخال في
    // التاريخ ← لا حلقة رجوع، ولا إعادة بناء لأن ‎replace‎ لا تستدعي المعالج).
    if (route.id !== id) {
      RH.core.router.replace(
        RH.core.router.serialize({ kind: "tab", id, params }));
    }
    document.body.classList.add("mode-tabs");
    rootEl.hidden = false;
    currentId = id;
    currentParams = params;
    renderTracker();
    // المعاملات جزء من حالة اللوحة (شريحة/حي/شهر مختار) فيُعاد البناء دوماً؛
    // كتابة المعاملات في مكانها تمرّ عبر ‎updateParams‎ الذي يستدعي هذا المسار.
    buildTab(id, params);
    document.title = RH.data.store.release().meta.title + " · " + titleOf(id);
  }

  /** يخفي القشرة (عند دخول ملحق/إدارة/موجز/وضع عرض) */
  function hide() {
    if (rootEl) rootEl.hidden = true;
    document.body.classList.remove("mode-tabs");
  }

  const current = () => (currentId
    ? { kind: "tab", id: currentId, params: currentParams } : null);

  /* ══════════════════════════════════════════════════════════════════════════
     5) وضع العرض الاختياري (ملء الشاشة + الكليكر) — إعادة استعمال المحرك
     ══════════════════════════════════════════════════════════════════════════ */

  let presentActive = false;
  const present = {
    active: () => presentActive,

    /** يدخل وضع العرض على القسم المقابل للتبويب الحالي */
    enter(sectionId) {
      const target = sectionId
        || (currentId && RH.sections && RH.sections.get(currentId) ? currentId : null)
        || (RH.presenter.engine.LINEAR[1] || "00");
      presentActive = true;
      document.body.classList.add("mode-present");
      hide();
      RH.presenter.chrome.requestFullscreen();
      RH.core.router.go({ kind: "scene", id: target, params: {} });
    },

    /** يخرج ويعود إلى التبويب الذي انطلق منه */
    exit() {
      if (!presentActive) return;
      presentActive = false;
      document.body.classList.remove("mode-present");
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen();
        }
      } catch (_e) { /* رفض الخروج من ملء الشاشة لا يعطّل العودة */ }
      RH.core.router.go({ kind: "tab", id: currentId || DEFAULT_ID,
        params: currentParams || {} });
    },
  };

  /** Escape في وضع العرض = الخروج (ما لم تكن طبقة مشروطة مفتوحة) */
  function onGlobalKey(e) {
    if (e.key !== "Escape" || !presentActive) return;
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
    const cur = RH.core.router.parse();
    if (cur.kind === "appendix") return;   // الملحق يملك Escape الخاص به
    e.preventDefault();
    e.stopPropagation();
    present.exit();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) الإقلاع
     ══════════════════════════════════════════════════════════════════════════ */

  function boot() {
    if (booted) return;
    booted = true;
    ensureRoot();
    renderTracker();
  }

  /* تصريف الطابور: أي تبويب سجّل نفسه قبل تعريف القشرة يدخل السجل الآن.
     خطأ تسجيل واحد لا يبتلع البقية — يُعلَن في الوحدة ولا يُسقط البناء. */
  PENDING.forEach((def) => {
    try { register(def); } catch (e) {
      if (typeof console !== "undefined") console.error("tabs/register:", e);
    }
  });

  return {
    register, boot, show, hide, go, get, list, titleOf, current,
    resolveLegacy, present, renderTracker, canonicalId,
    VALID_IDS, DEFAULT_ID, AR_DIGITS, ID_ALIASES,
    SECTION_TO_TAB, SECTION_TO_APPENDIX,
  };
})();
