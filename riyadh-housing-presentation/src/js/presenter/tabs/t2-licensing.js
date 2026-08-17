/* ════════════════════════════════════════════════════════════════════════════
   t2-licensing.js — التبويب ٢: «التراخيص» (V3_SPEC §4 · V3_CONTRACTS §4)
   ────────────────────────────────────────────────────────────────────────────
   البنية التي طلبها الموجز الملزم حرفياً:

     ▸ **الإجماليات أعلى الشاشة** (صف ‎.tabfigs‎ — ثلاثة أرقام كبرى):
         96 رخصة بناء ‎+50.0٪‎ · 140 رخصة تشغيلية ‎+18.6٪‎ · 612,400 سرير ‎+8.6٪‎
       كل رقم زر حقيقي: نقرة واحدة تفتح نافذة الإبراز (جملة + ≤3 أرقام + زر).

     ▸ **رسمان منفصلان جنباً إلى جنب** (‎.tabgrid‎ عمودان — رسمان لا أكثر):
         1. «تطور عدد الرخص شهرياً» — لوحتان متراصتان داخل مثيل واحد:
            التراكمي (تشغيلية/بناء) أعلى، والصافي الشهري أسفل. **محورا قيم
            مستقلان لكل لوحة — لا محور مزدوج في لوحة واحدة إطلاقاً.**
         2. «تطور الأسرّة المرخصة شهرياً» — البنية ذاتها بمقياس الأسرّة
            المستقل تماماً عن مقياس الرخص (وهذا سبب فصل الرسمين أصلاً).

     ▸ **الخريطة الجغرافية** أسفلهما بعرض كامل مع **مفاتيح طبقات** ثلاثة
       (أسرّة · تشغيلية · بناء) — الطبقة المختارة تُكتب في العنوان
       (‎?layer=‎) فيكون المشهد قابلاً للمشاركة.

   القوانين المطبقة حرفياً (بوابات القبول V3_CONTRACTS §7):
   • **صفر لون مكتوب**: كل لون رسم من ‎RH.viz.theme.C‎ (رموز حيّة)، وكل لون
     واجهة من ‎var(--…)‎ في ‎src/styles/tabs/licensing.css‎.
   • **قانون التلميح**: كل ‎tooltip‎ من ‎T.tooltip(su)‎ (‎confine‎ + ‎ttPosition‎
     + عرض أقصى 260px) ومحتواه ‎T.ttMicro‎ — سطران: عنوان + قيمة واحدة.
     التفاصيل تنتقل إلى نافذة النقر لا إلى التلميح.
   • **سلوك النقر ثلاث طبقات**: تحويم → تلميح مصغّر · نقرة أولى →
     ‎ctx.highlight‎ (الحد 320 حرفاً يفرضه ‎highlight.js‎ ويثبته اختبار الوحدة)
     · الزر → ملحق ‎licensing‎ بصفحته المناسبة وبحالة عودة مرمّزة.
   • **لا تلفيق**: لا قيمة على مستوى الحي إلا إن ورد الحي في عينة الأحياء
     المدرجة، وإلا عُرضت قيم قطاعه المعتمدة بتصريح صادق. كل رقم من
     ‎ctx.release‎/‎ctx.derived‎ عبر ‎RH.core.fmt‎ حصراً.
   • **الرسم كبير**: كل رسم رئيس بالصنف ‎.tabchart‎ · رسمان في الصف ·
     ثلاثة عناصر في الشبكة (والحد أربعة).
   • **إتاحة**: أزرار حقيقية، ‎aria-pressed‎ لمفاتيح الطبقات، جدول بديل
     لقارئ الشاشة لكل رسم (‎.sr-only‎)، و‎ctx.onTeardown‎ لكل مستمع ومثيل.

   النموذج النقي معرَّف على ‎RH.presenter.tabModels.licensing‎ بلا أي لمس
   لـDOM، فيُختبر بالملف الحقيقي في ‎tests/unit/tab-licensing.test.mjs‎؛
   والتسجيل يمر بطابور ‎RH.tabs‎ المؤجَّل المُعرَّف في ‎ns.js‎، فلا يعتمد على
   موضع الملف في ‎JS_ORDER‎ ولا يسقط صامتاً في بيئة اختبار الوحدة.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** اسم الخريطة المسجَّلة في ECharts — ثابت عرض لا بيانات */
  const MAP_NAME = "rh-riyadh-districts";

  /** المقاييس الثلاثة بترتيب المفاتيح المطلوب في الموجز (أسرّة أولاً) */
  const LAYER_ORDER = Object.freeze(["beds", "operational", "building"]);

  /** صيغ عدد ومعدود محلية لما لا تغطيه ‎NOUNS‎ المركزية */
  const LOCAL_NOUNS = Object.freeze({
    district: { one: "حي واحد", two: "حيان", few: "أحياء", many: "حياً", hundred: "حي" },
  });

  /** صفحات ملحق «التراخيص» — مرآة ترتيب ‎ax-licensing.js‎ حرفياً */
  const AX = Object.freeze({
    id: "licensing",
    MONTHLY: "0",     /* صافي الإضافات الشهرية */
    BRIDGE: "1",      /* الجسر من خط الأساس */
    SECTORS: "3",     /* مقارنة القطاعات */
    SAMPLE: "4",      /* عينة الأحياء المدرجة */
  });

  /* ══════════════════════════════════════════════════════════════════════════
     1) النموذج النقي — لا DOM ولا ECharts ولا رموز CSS: يُختبر وحدةً كاملاً
     ══════════════════════════════════════════════════════════════════════════ */

  /** نسبة مئوية بتقريب بايثون نفسه (نصف لأعلى، منزلة واحدة) */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /** نسبة موقعة بعزل اتجاهي حتمي: ‎+8.6٪‎ — للنمو عن خط الأساس حصراً */
  function signedPct(v) {
    if (v == null || Number.isNaN(v)) return "—";
    return fmt.iso((v >= 0 ? "+" : "−") + fmt.dec1(Math.abs(v)) + "٪");
  }

  /** «‎+N‎» بعزل اتجاهي حتمي — الإضافات الشهرية موجبة دائماً في هذا المصدر */
  function plusInt(n) {
    if (n == null || Number.isNaN(n)) return "—";
    return fmt.iso((n >= 0 ? "+" : "−") + fmt.int(Math.abs(n)));
  }

  /** تعريف الطبقات/المقاييس: دوال قراءة على الإصدار الحي — لا قيمة مخزَّنة */
  const LAYERS = Object.freeze({
    beds: Object.freeze({
      key: "beds",
      label: "الطاقة الاستيعابية المرخصة",
      short: "أسرّة",
      unit: "سرير",
      sectorVal: (s) => s.beds,
      cur: (rel) => rel.metrics.licensed_beds.value,
      base: (rel) => rel.baseline.beds,
      metric: (rel) => rel.metrics.licensed_beds,
      growthAbs: (der) => der.growth_beds_abs,
      growthPct: (der) => der.growth_beds_pct,
      fmtV: (v) => fmt.unitAfter(v, "سرير"),
    }),
    operational: Object.freeze({
      key: "operational",
      label: "الرخص التشغيلية النشطة",
      short: "تشغيلية",
      unit: "رخصة",
      sectorVal: (s) => s.operational,
      cur: (rel) => rel.metrics.current_operational.value,
      base: (rel) => rel.baseline.operational,
      metric: (rel) => rel.metrics.current_operational,
      growthAbs: (der) => der.growth_operational_abs,
      growthPct: (der) => der.growth_operational_pct,
      fmtV: (v) => fmt.noun(v, "licence"),
    }),
    building: Object.freeze({
      key: "building",
      label: "رخص البناء",
      short: "بناء",
      unit: "رخصة",
      sectorVal: (s) => s.building,
      cur: (rel) => rel.metrics.current_building.value,
      base: (rel) => rel.baseline.building,
      metric: (rel) => rel.metrics.current_building,
      growthAbs: (der) => der.growth_building_abs,
      growthPct: (der) => der.growth_building_pct,
      fmtV: (v) => fmt.noun(v, "licence"),
    }),
  });

  /** مفتاح طبقة مشروع أو الافتراضي — يحرس معامل العنوان من أي قيمة غريبة */
  function layerKeyOf(raw) {
    const k = String(raw || "");
    return LAYER_ORDER.indexOf(k) >= 0 ? k : "beds";
  }

  /**
   * السلاسل الزمنية الثلاث: الخام الشهري + التراكمي المبني على خط الأساس.
   * المتطابقة الحاكمة: آخر نقطة تراكمية = القيمة المنشورة لكل مقياس.
   */
  function series(rel) {
    const months = (rel.monthly && rel.monthly.licensing) || [];
    const base = {
      building: LAYERS.building.base(rel),
      operational: LAYERS.operational.base(rel),
      beds: LAYERS.beds.base(rel),
    };
    const cur = {
      building: LAYERS.building.cur(rel),
      operational: LAYERS.operational.cur(rel),
      beds: LAYERS.beds.cur(rel),
    };
    const cum = { building: [], operational: [], beds: [] };
    const acc = Object.assign({}, base);
    for (const m of months) {
      for (const k of LAYER_ORDER) {
        acc[k] += m[k];
        cum[k].push(acc[k]);
      }
    }
    return { months, base, cur, cum, end: acc };
  }

  /** تسميات الفئات: نقطة الأساس المسبوقة ثم الأشهر (مختصرة بلا سنة) */
  function categories(rel) {
    const months = (rel.monthly && rel.monthly.licensing) || [];
    return ["الأساس"].concat(
      months.map((m) => String(m.label).replace(/\s+\d{4}$/, "")));
  }

  /** العناوين الكاملة المقابلة للفئات — تُستعمل في التلميح والإبراز */
  function fullTitles(rel) {
    const months = (rel.monthly && rel.monthly.licensing) || [];
    return [rel.meta.baseline_label].concat(months.map((m) => m.label));
  }

  /**
   * الأرقام الكبرى الثلاثة أعلى التبويب — بترتيب الموجز الملزم:
   * رخص البناء ثم الرخص التشغيلية ثم الأسرّة المرخصة.
   */
  function totals(rel, der) {
    return ["building", "operational", "beds"].map((k) => {
      const L = LAYERS[k];
      const cur = L.cur(rel);
      const parts = k === "beds" ? fmt.compactParts(cur) : null;
      return {
        key: k,
        label: L.metric(rel).label,
        value: cur,
        base: L.base(rel),
        growthAbs: L.growthAbs(der),
        growthPct: L.growthPct(der),
        /* النص المعروض: الأسرّة بصيغة تنفيذية مختصرة، والرخص بعدد دقيق */
        num: parts ? parts.num : fmt.int(cur),
        word: parts ? parts.word : "",
        unit: L.unit,
        exact: k === "beds" ? fmt.unitAfter(cur, "سرير") : fmt.noun(cur, "licence"),
      };
    });
  }

  /** مدى قيم طبقة على القطاعات الخمسة — أساس سلم ألوان الخريطة */
  function layerRange(rel, layerKey) {
    const L = LAYERS[layerKeyOf(layerKey)];
    const vals = (rel.sectors || []).map((s) => L.sectorVal(s));
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
  }

  /* ── مواصفات الإبراز (الطبقة الثانية) — كائنات نقية يقيسها اختبار الوحدة ── */

  /** إبراز رقم كبير: من خط الأساس إلى القيمة الحالية + الزر إلى الجسر */
  function totalHighlight(rel, der, key) {
    const k = LAYER_ORDER.indexOf(key) >= 0 ? key : "beds";
    const L = LAYERS[k];
    const cur = L.cur(rel);
    const base = L.base(rel);
    const isBeds = k === "beds";
    return {
      title: L.label,
      sentence: "ارتفع المؤشر من " + (isBeds ? fmt.unitAfter(base, "سرير")
        : fmt.noun(base, "licence")) + " عند خط الأساس إلى "
        + (isBeds ? fmt.unitAfter(cur, "سرير") : fmt.noun(cur, "licence")) + ".",
      stats: [
        { label: "خط الأساس", value: fmt.int(base), tone: "gold" },
        { label: "صافي الإضافة", value: plusInt(L.growthAbs(der)), tone: "pos" },
        { label: "نسبة النمو", value: signedPct(L.growthPct(der)), tone: "pos" },
      ],
      note: rel.meta.comparison_qualifier,
      appendix: {
        id: AX.id, params: { page: AX.BRIDGE },
        label: "الجسر من خط الأساس في الملحق",
      },
    };
  }

  /** إبراز نقطة خط الأساس في أي من الرسمين */
  function baselineHighlight(rel) {
    return {
      title: rel.meta.baseline_label,
      sentence: "كل مسارات هذا التبويب تنطلق من قيم خط الأساس المرصودة قبل "
        + "بداية فترة الرصد.",
      stats: [
        { label: "رخص البناء", value: fmt.int(LAYERS.building.base(rel)), tone: "gold" },
        { label: "الرخص التشغيلية", value: fmt.int(LAYERS.operational.base(rel)), tone: "gold" },
        { label: "الأسرّة المرخصة", value: fmt.int(LAYERS.beds.base(rel)), tone: "gold" },
      ],
      note: rel.meta.comparison_qualifier,
      appendix: {
        id: AX.id, params: { page: AX.BRIDGE },
        label: "الجسر من خط الأساس في الملحق",
      },
    };
  }

  /**
   * إبراز شهر واحد. ‎kind‎:
   *   "licences" — من رسم الرخص: الصادر في الشهر + التراكمي بنهايته
   *   "beds"     — من رسم الأسرّة: المضاف + التراكمي + تغطيته للطلب
   */
  function monthHighlight(rel, der, index, kind) {
    const S = series(rel);
    if (index < 0 || index >= S.months.length) return null;
    const m = S.months[index];
    const dem = rel.metrics.total_demand.value;

    if (kind === "beds") {
      return {
        title: m.label,
        sentence: "أضاف " + m.label + " " + fmt.unitAfter(m.beds, "سرير")
          + " إلى الطاقة المرخصة.",
        stats: [
          { label: "الطاقة التراكمية", value: fmt.int(S.cum.beds[index]), tone: "pos" },
          { label: "تغطية الطلب بنهايته", value: fmt.pct(pctOf(S.cum.beds[index], dem)) },
          {
            label: "حصته من نمو السنة",
            value: fmt.pct(pctOf(m.beds, LAYERS.beds.growthAbs(der))),
          },
        ],
        note: rel.meta.comparison_qualifier,
        appendix: {
          id: AX.id, params: { page: AX.MONTHLY },
          label: "صافي الإضافات الشهرية في الملحق",
        },
      };
    }

    return {
      title: m.label,
      sentence: "في " + m.label + " صدرت " + fmt.noun(m.building, "licence")
        + " للبناء و" + fmt.noun(m.operational, "licence") + " تشغيلية.",
      stats: [
        { label: "تراكمي رخص البناء", value: fmt.int(S.cum.building[index]), tone: "pos" },
        {
          label: "تراكمي الرخص التشغيلية",
          value: fmt.int(S.cum.operational[index]), tone: "pos",
        },
        { label: "الأسرّة المضافة", value: plusInt(m.beds), tone: "pos" },
      ],
      note: rel.meta.comparison_qualifier,
      appendix: {
        id: AX.id, params: { page: AX.MONTHLY },
        label: "صافي الإضافات الشهرية في الملحق",
      },
    };
  }

  /**
   * إبراز حي على الخريطة. ‎entry‎ من ‎RH.viz.geoutils.districtIndex‎.
   * صدق البيانات: قيم الحي تُعرض **فقط** إن ورد الحي في عينة الأحياء
   * المدرجة؛ وإلا عُرضت قيم قطاعه المعتمدة بتصريح صادق في الجملة والوسم.
   */
  function districtHighlight(rel, der, entry, layerKey) {
    if (!entry || !entry.sectorRow) return null;
    const L = LAYERS[layerKeyOf(layerKey)];
    const s = entry.sectorRow;
    const n = entry.sample;

    if (n) {
      return {
        title: entry.name,
        sentence: "الحي ضمن عينة الأحياء المدرجة، وله "
          + fmt.unitAfter(n.beds, "سرير") + " مرخصة في " + entry.sectorName + ".",
        stats: [
          { label: "رخص البناء", value: fmt.int(n.building), tone: "pos" },
          { label: "الرخص التشغيلية", value: fmt.int(n.operational), tone: "pos" },
          { label: "حصته من أسرّة القطاع", value: fmt.pct(pctOf(n.beds, s.beds)) },
        ],
        note: rel.neighbourhoods.label + " — " + rel.neighbourhoods.ranking_note,
        appendix: {
          id: AX.id, params: { page: AX.SAMPLE },
          label: "عينة الأحياء المدرجة في الملحق",
        },
      };
    }

    return {
      title: entry.name,
      sentence: "الحي خارج العينة المدرجة، فالمعروض قيم " + entry.sectorName
        + " المعتمدة لا تقديرات حي.",
      stats: [
        { label: L.label, value: fmt.int(L.sectorVal(s)), tone: "pos" },
        { label: "تغطية طلب القطاع", value: fmt.pct(entry.sectorDerived
          ? entry.sectorDerived.coverage_pct : pctOf(s.beds, s.demand)) },
        { label: "حصته من الإجمالي", value: fmt.pct(pctOf(L.sectorVal(s), L.cur(rel))) },
      ],
      note: rel.meta.map_disclaimer + " — لا قيمة مختلقة على مستوى الحي؛ "
        + rel.neighbourhoods.label + ".",
      appendix: {
        id: AX.id, params: { page: AX.SECTORS },
        label: "مقارنة القطاعات في الملحق",
      },
    };
  }

  /** يبني كل مواصفات الإبراز التي يولّدها هذا التبويب — مادة فحص الحد 320 */
  function allHighlightSpecs(rel, der, index) {
    const out = [];
    for (const k of LAYER_ORDER) out.push(totalHighlight(rel, der, k));
    out.push(baselineHighlight(rel));
    const S = series(rel);
    for (let i = 0; i < S.months.length; i++) {
      out.push(monthHighlight(rel, der, i, "licences"));
      out.push(monthHighlight(rel, der, i, "beds"));
    }
    for (const e of index || []) {
      for (const k of LAYER_ORDER) {
        const spec = districtHighlight(rel, der, e, k);
        if (spec) out.push(spec);
      }
    }
    return out;
  }

  /** حارس اتساق تطويري — لا يُسقط اللوحة، ينبّه في الكونسول عند انجراف */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label] && typeof console !== "undefined") {
        console.warn("t2-licensing/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  const MODEL = {
    LAYERS, LAYER_ORDER, LOCAL_NOUNS, AX, MAP_NAME,
    layerKeyOf, series, categories, fullTitles, totals, layerRange,
    signedPct, plusInt, pctOf,
    totalHighlight, baselineHighlight, monthHighlight, districtHighlight,
    allHighlightSpecs,
  };

  /* الفضاء مُنشأ بحراسة كي لا يتسابق عليه بانو التبويبات الخمسة */
  RH.presenter.tabModels = RH.presenter.tabModels || {};
  RH.presenter.tabModels.licensing = MODEL;

  /* ══════════════════════════════════════════════════════════════════════════
     2) أدوات بناء الواجهة (DOM) — بادئة الأصناف ‎lict-‎
     ══════════════════════════════════════════════════════════════════════════ */

  /** بطاقة رسم بالأصناف الجاهزة في ‎tabs.css‎ (لا نعيد اختراع التخطيط) */
  function chartCard(host, opts) {
    const o = opts || {};
    const titleEl = h("div", { class: "tabcard-title" }, o.title);
    const noteEl = o.note ? h("div", { class: "tabcard-note" }, o.note) : null;
    const head = h("div", { class: "tabcard-head" },
      h("div", { class: "lict-head-main" }, titleEl,
        o.sub ? h("div", { class: "lict-sub" }, o.sub) : null),
      o.aside || noteEl);
    const chartEl = h("div", {
      class: "tabchart" + (o.tall ? " is-tall" : ""),
      role: "img", "aria-label": o.aria || o.title,
    });
    const body = h("div", { class: "tabcard-body" }, chartEl);
    const card = h("div", {
      class: "tabcard lict-card" + (o.cls ? " " + o.cls : "")
        + (o.span2 ? " span-2" : ""),
    }, head, body);
    host.appendChild(card);
    return { card, head, body, chartEl, titleEl };
  }

  /** جدول بديل لقارئ الشاشة — الرسم canvas فلا يُقرأ؛ الجدول يحمل السلسلة */
  function srTable(caption, columns, rows) {
    return h("div", { class: "sr-only" },
      h("table", {},
        h("caption", {}, caption),
        h("thead", {}, h("tr", {}, columns.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, rows.map((r) => h("tr", {},
          r.map((cell, i) => h(i === 0 ? "th" : "td",
            i === 0 ? { scope: "row" } : {}, cell)))))));
  }

  /** توصيل نقر مثيل ECharts مع فصل مضمون عند مغادرة التبويب */
  function onChartClick(ctx, chart, handler) {
    if (!chart) return;
    chart.on("click", handler);
    ctx.onTeardown(() => {
      try { if (!chart.isDisposed()) chart.off("click", handler); } catch (_e) { /* زال */ }
    });
  }

  /**
   * نقر على **كامل مساحة اللوحة** لا على العلامة وحدها: طبقة zrender تُحوّل
   * إحداثي النقر إلى فهرس الفئة في اللوحة التي وقع فيها. بذلك يصيب المستخدم
   * الشهر بنقرة في أي موضع من عموده — لا يُطالَب بإصابة نقطة قطرها ست بكسلات.
   */
  function onPlotClick(ctx, chart, grids, handler) {
    if (!chart) return;
    const zr = chart.getZr();
    const fn = (e) => {
      const p = [e.offsetX, e.offsetY];
      for (const gi of grids) {
        let inside = false;
        try { inside = chart.containPixel({ gridIndex: gi }, p); } catch (_e) { inside = false; }
        if (!inside) continue;
        let idx = null;
        try { idx = chart.convertFromPixel({ xAxisIndex: gi }, p[0]); } catch (_e) { idx = null; }
        if (idx == null || Number.isNaN(idx)) return;
        handler(Math.round(idx));
        return;
      }
    };
    zr.on("click", fn);
    ctx.onTeardown(() => {
      try { if (!chart.isDisposed()) chart.getZr().off("click", fn); } catch (_e) { /* زال */ }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) الرسمان الزمنيان — مثيل واحد بلوحتين متراصتين ومحورَي قيم مستقلين
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * يبني رسماً زمنياً بلوحتين: التراكمي أعلى والصافي الشهري أسفل.
   * spec: {
   *   keys: [{key, name, color}],   السلاسل المعروضة (رخص: اثنتان · أسرّة: واحدة)
   *   unit, axisFmt, valueFmt,      وحدة القيمة وصياغتها
   *   topTitle, bottomTitle,        عنوانا اللوحتين (فوق مساحة الرسم لا داخلها)
   *   area,                         تعبئة متدرجة تحت خط التراكمي (سلسلة واحدة)
   * }
   * **لا محور مزدوج**: كل لوحة grid مستقلة بمحور قيمها الخاص.
   */
  function buildTimeChart(ctx, el, name, spec) {
    const T = RH.viz.theme;
    const su = ctx.su;
    const rel = ctx.release;
    const S = series(rel);
    const cats = categories(rel);
    const titles = fullTitles(rel);
    const sp = (n) => Math.max(6, Math.round(n * su));
    const narrow = T.narrow();

    /* بيانات كل سلسلة: تراكمية مسبوقة بنقطة الأساس · وصافية بفجوة عند الأساس */
    const cumSeries = spec.keys.map((k) => ({
      name: k.name,
      type: "line",
      xAxisIndex: 0,
      yAxisIndex: 0,
      color: k.color,
      z: 10,
      symbol: "circle",
      symbolSize: T.fs(su, narrow ? 6 : 8),
      lineStyle: { width: narrow ? 2.4 : 3, color: k.color },
      itemStyle: { color: k.color, borderColor: T.C.stage1, borderWidth: 1 },
      emphasis: { focus: "series", scale: 1.6 },
      areaStyle: spec.area ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: k.color },
          { offset: 1, color: T.C.stage1 },
        ]),
        opacity: 0.18,
      } : null,
      /* خط الأساس الذهبي (الذهبي لخط الأساس حصراً) — صامت بلا تسمية داخلية:
         القيمة معلنة في عنوان اللوحة فلا تتصادم تسميتان في مساحة الرسم. */
      markLine: (function () {
        const ml = T.targetLine(su, S.base[k.key], "");
        ml.label.show = false;
        ml.silent = true;
        return ml;
      })(),
      data: [S.base[k.key]].concat(S.cum[k.key]),
    }));

    const netSeries = spec.keys.map((k) => ({
      name: k.name + " — الصافي الشهري",
      type: "bar",
      xAxisIndex: 1,
      yAxisIndex: 1,
      color: k.color,
      barMaxWidth: sp(narrow ? 13 : 18),
      itemStyle: { color: k.color, borderRadius: [3, 3, 0, 0] },
      emphasis: { focus: "series" },
      data: [null].concat(S.months.map((m) => m[k.key])),
    }));

    /** محور فئات مشترك الشكل بين اللوحتين (RTL: معكوس) */
    const catAxis = (gridIndex, showLabel) => Object.assign(
      T.catXAxis(su, cats, {
        axisLabel: {
          show: showLabel,
          fontSize: T.fs(su, narrow ? 11 : 12),
          rotate: narrow ? 32 : 0,
          hideOverlap: true,
        },
      }), { gridIndex });

    /* المفتاح يظهر عند سلسلتين فأكثر فقط (قاعدة الرسوم: لا مفتاح لسلسلة واحدة)
       — وارتفاعه يُزاح من أعلى اللوحة العليا كي لا يتراكب مع عنوانها. */
    const multi = cumSeries.length > 1;
    const legendH = multi ? sp(22) : 0;
    const titleTop = legendH + sp(4);
    const gridTop = titleTop + sp(24);
    /* هامش محور القيم على اليمين: مقاس بأعرض تسمية فعلية لا بنسبة عمياء —
       «612.4 ألف» أعرض من «120» بكثير، وتقليص الهامش مع ‎su‎ عند 1366 كان
       يقصّ التسمية. لذلك القيمة تُدرَّج مع ‎su‎ لكن بأرضية دنيا لا تُخترق. */
    const sideInset = Math.max(spec.insetMin || 40,
      Math.round((spec.inset || 68) * su));

    const subTitle = (text, top) => ({
      text, right: sp(6), top,
      textStyle: {
        color: T.C.ink2, fontFamily: "Cairo",
        fontSize: T.fs(su, narrow ? 12 : 13), fontWeight: 600,
      },
    });

    const netAxis = Object.assign(T.valAxis(su, spec.axisFmt), {
      gridIndex: 1, splitNumber: 2,
    });
    if (spec.netMinInterval) netAxis.minInterval = spec.netMinInterval;

    /* حامل المثيل + آخر موضع رأسي للمؤشر: التلميح محوري (يعمل في أي موضع من
       العمود لا على النقطة وحدها) لكنه يبقى **قيمة واحدة** كما يوجب القانون —
       تُنتقى السلسلة الأقرب رأسياً إلى المؤشر، واسمها في سطر العنوان فلا لبس. */
    const live = { chart: null, y: null };

    function pickNearest(list) {
      if (list.length < 2 || live.y == null || !live.chart) return list[0];
      let best = list[0], bestD = Infinity;
      for (const p of list) {
        let px = null;
        try {
          px = live.chart.convertToPixel({ seriesIndex: p.seriesIndex },
            [p.dataIndex, p.value]);
        } catch (_e) { px = null; }
        const d = px ? Math.abs(px[1] - live.y) : Infinity;
        if (d < bestD) { bestD = d; best = p; }
      }
      return best;
    }

    const option = Object.assign(T.base(su), {
      tooltip: Object.assign(T.tooltip(su, { trigger: "axis" }), {
        axisPointer: {
          type: "line",
          lineStyle: { color: T.C.axLine, width: 1 },
          label: { show: false },
        },
        formatter: (arg) => {
          const list = (Array.isArray(arg) ? arg : [arg])
            .filter((p) => p && p.value != null);
          if (!list.length) return "";
          const p = pickNearest(list);
          const head = titles[p.dataIndex] || String(p.axisValueLabel || p.name);
          return T.ttMicro(head + " · " + p.seriesName,
            spec.valueFmt(p.value), spec.unit);
        },
      }),
      title: [subTitle(spec.topTitle, titleTop), subTitle(spec.bottomTitle, "66%")],
      grid: [
        { top: gridTop, height: "42%", left: sp(10), right: sideInset },
        { top: "74%", bottom: sp(narrow ? 48 : 32), left: sp(10), right: sideInset },
      ],
      xAxis: [catAxis(0, false), catAxis(1, true)],
      yAxis: [
        Object.assign(T.valAxis(su, spec.axisFmt), { gridIndex: 0, scale: true }),
        netAxis,
      ],
      series: cumSeries.concat(netSeries),
    });

    if (multi) {
      option.legend = {
        top: 0,
        left: "center",
        icon: "roundRect",
        itemWidth: T.fs(su, 13),
        itemHeight: T.fs(su, 9),
        itemGap: T.fs(su, 16),
        selectedMode: false,     /* مفتاح قراءة لا مبدّل: لا حالة معلّقة بين اللوحتين */
        textStyle: { color: T.C.ink2, fontFamily: "Cairo", fontSize: T.fs(su, 12.5) },
        data: cumSeries.map((s) => s.name),
      };
    }

    const chart = ctx.chart(name, el);
    chart.setOption(option);
    live.chart = chart;

    /* تتبّع موضع المؤشر داخل القماش — يغذّي انتقاء السلسلة الأقرب أعلاه */
    const zr = chart.getZr();
    const onMove = (e) => { live.y = e.offsetY; };
    zr.on("mousemove", onMove);
    ctx.onTeardown(() => {
      try { if (!chart.isDisposed()) chart.getZr().off("mousemove", onMove); }
      catch (_e) { /* المثيل زال سلفاً */ }
    });

    return chart;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) الخريطة الجغرافية بمفاتيح الطبقات
     ══════════════════════════════════════════════════════════════════════════ */

  /** هل يمكن رسم الخريطة في هذا البناء؟ (بيانات الحدود + دعم ECharts) */
  function mapReady(geo) {
    return !!(geo && geo.sectors && typeof echarts !== "undefined"
      && typeof echarts.registerMap === "function");
  }

  /** GeoJSON من فهرس الأحياء — الحلقات ‎[lat,lng]‎ تُقلب إلى ‎[lng,lat]‎ */
  function toGeoJson(index) {
    return {
      type: "FeatureCollection",
      features: index.map((e) => ({
        type: "Feature",
        properties: { name: e.name },
        geometry: {
          /* حلقات متعددة = أجزاء منفصلة للحي (لا ثقوب) — MultiPolygon */
          type: "MultiPolygon",
          coordinates: (e.rings || []).map((ring) =>
            [ring.map((pt) => [pt[1], pt[0]])]),
        },
      })),
    };
  }

  function buildMap(ctx, el, index, layerKey) {
    const T = RH.viz.theme;
    const su = ctx.su;
    const rel = ctx.release;
    const L = LAYERS[layerKey];
    const range = layerRange(rel, layerKey);
    const byName = new Map();
    for (const e of index) byName.set(e.name, e);

    echarts.registerMap(MAP_NAME, toGeoJson(index));

    const chart = ctx.chart("map", el);
    chart.setOption(Object.assign(T.base(su), {
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          const e = byName.get(p.name);
          if (!e) return "";
          return T.ttMicro(p.name + " · " + e.sectorName,
            fmt.int(p.value), L.unit);
        },
      }),
      visualMap: {
        type: "continuous",
        min: range.min,
        max: range.max,
        calculable: false,
        orient: "horizontal",
        left: "center",
        bottom: Math.max(4, Math.round(6 * su)),
        text: [L.fmtV(range.max), L.fmtV(range.min)],
        textGap: T.fs(su, 8),
        textStyle: { color: T.C.mut, fontFamily: "Cairo", fontSize: T.fs(su, 11.5) },
        /* أرضية السلم مرفوعة درجةً (‎seq-2‎ فصاعداً): الدرجة الدنيا ‎seq-1‎ تكاد
           تختفي على السطح في السمتين (فاتحة على أبيض · داكنة على أسود) فيُقرأ
           القطاع الأدنى فراغاً لا قيمة. أربع درجات تكفي أربع قيم قطاعية متمايزة. */
        inRange: { color: T.C.seq.slice(1) },
        seriesIndex: 0,
      },
      series: [{
        type: "map",
        map: MAP_NAME,
        roam: false,
        aspectScale: 0.91,          /* جيب تمام خط عرض الرياض ≈ 0.908 */
        top: Math.round(10 * su),
        bottom: Math.round(44 * su),
        label: { show: false },
        /* شعيرة حبرية محايدة: تفصل الأحياء على أي درجة تعبئة وفي السمتين معاً */
        itemStyle: { borderColor: T.C.plateEdge, borderWidth: 0.6 },
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: T.C.brandTeal, borderColor: T.C.stage1, borderWidth: 1 },
        },
        select: { disabled: true },
        data: index.map((e) => ({
          name: e.name,
          value: e.sectorRow ? L.sectorVal(e.sectorRow) : 0,
        })),
      }],
    }));

    return chart;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) بناء التبويب
     ══════════════════════════════════════════════════════════════════════════ */

  function build(el, ctx) {
    const T = RH.viz.theme;
    const rel = ctx.release;
    const der = ctx.derived;
    const S = series(rel);
    const layerKey = layerKeyOf(ctx.params && ctx.params.layer);

    /* متطابقات الإصدار التي يتكئ عليها التبويب كاملاً */
    guard("build", {
      "اثنا عشر شهراً في سلسلة التراخيص": S.months.length === 12,
      "تراكمي البناء = المنشور": S.end.building === S.cur.building,
      "تراكمي التشغيلية = المنشور": S.end.operational === S.cur.operational,
      "تراكمي الأسرّة = الطاقة المرخصة": S.end.beds === S.cur.beds,
      "نمو البناء يطابق المشتقة": der.growth_building_pct
        === rel.derived.growth_building_pct.value,
      "نمو التشغيلية يطابق المشتقة": der.growth_operational_pct
        === rel.derived.growth_operational_pct.value,
      "نمو الأسرّة يطابق المشتقة": der.growth_beds_pct
        === rel.derived.growth_beds_pct.value,
    });

    const root = h("div", { class: "lict" });
    el.appendChild(root);

    /* ── الترويسة الهوياتية: النمط الهندسي للأمانة خلف عنوان المحور ──────── */
    const head = h("div", { class: "lict-banner" },
      h("div", { class: "lict-banner-main" },
        h("h1", { class: "lict-title" }, "التراخيص"),
        h("p", { class: "lict-lede" },
          "مسار إصدار الرخص والطاقة الاستيعابية المرخصة خلال ",
          rel.meta.monitoring_period_label, "، ثم توزيعها الجغرافي.")),
      h("p", { class: "lict-asof" },
        "البيانات حتى ", rel.meta.data_as_of));
    root.appendChild(head);
    if (RH.brand && typeof RH.brand.pattern === "function") {
      ctx.onTeardown(RH.brand.pattern(head, { opacity: 0.09, angle: 18, size: 128 }));
    }

    /* ── الإجماليات الثلاثة أعلى التبويب ─────────────────────────────────── */
    const figs = h("div", { class: "tabfigs lict-figs" });
    root.appendChild(figs);
    for (const t of totals(rel, der)) {
      const btn = h("button", {
        class: "tabfig lict-fig is-accent", type: "button",
        "data-interactive": "",
        "aria-label": t.label + " — " + t.exact + "؛ افتح الإبراز",
      },
        h("span", { class: "tabfig-label" }, t.label),
        h("span", { class: "tabfig-value" },
          h("span", { class: "num tnum" }, t.num),
          t.word ? h("span", { class: "word" }, t.word) : null,
          h("span", { class: "unit" }, t.unit)),
        h("span", { class: "lict-fig-delta" },
          signedPct(t.growthPct), " منذ خط الأساس"),
        h("span", { class: "tabfig-foot" },
          "من ", fmt.int(t.base), " عند خط الأساس · ", plusInt(t.growthAbs)));
      btn.addEventListener("click", () => {
        ctx.highlight(Object.assign(totalHighlight(rel, der, t.key), { anchor: btn }));
      });
      figs.appendChild(btn);
    }

    /* ── الشبكة: رسمان جنباً إلى جنب ثم الخريطة بعرض كامل ────────────────── */
    const grid = h("div", { class: "tabgrid lict-grid" });
    root.appendChild(grid);

    /* 1) تطور عدد الرخص شهرياً */
    const licCard = chartCard(grid, {
      title: "تطور عدد الرخص شهرياً",
      sub: "التراكمي أعلى والصافي الشهري أسفل — مقياس الرخص وحده",
      note: "مرّر أو انقر في أي موضع من عمود الشهر",
      aria: "رسم تطور عدد الرخص شهرياً: التراكمي والصافي الشهري لرخص البناء "
        + "والرخص التشغيلية",
      cls: "lict-lic",
    });
    licCard.body.appendChild(srTable(
      "تطور عدد الرخص شهرياً — تراكمي وصافي",
      ["الشهر", "بناء (صافي)", "تشغيلية (صافي)", "بناء (تراكمي)", "تشغيلية (تراكمي)"],
      [[rel.meta.baseline_label, "—", "—", fmt.int(S.base.building),
        fmt.int(S.base.operational)]].concat(
        S.months.map((m, i) => [m.label, fmt.int(m.building), fmt.int(m.operational),
          fmt.int(S.cum.building[i]), fmt.int(S.cum.operational[i])]))));

    const licChart = buildTimeChart(ctx, licCard.chartEl, "licences", {
      keys: [
        { key: "operational", name: LAYERS.operational.short, color: T.C.green },
        { key: "building", name: LAYERS.building.short, color: T.C.blue },
      ],
      unit: "رخصة",
      valueFmt: (v) => fmt.int(v),
      axisFmt: (v) => fmt.int(v),
      inset: 48, insetMin: 38,          /* تسميات قصيرة: «60» … «140» */
      topTitle: "التراكمي — تشغيلية " + fmt.int(S.cur.operational)
        + " · بناء " + fmt.int(S.cur.building),
      bottomTitle: "الصادر شهرياً (رخصة)",
      netMinInterval: 1,
    });
    onPlotClick(ctx, licChart, [0, 1], (i) => {
      const spec = i === 0 ? baselineHighlight(rel)
        : monthHighlight(rel, der, i - 1, "licences");
      if (spec) ctx.highlight(spec);
    });

    /* 2) تطور الأسرّة المرخصة شهرياً */
    const bedCard = chartCard(grid, {
      title: "تطور الأسرّة المرخصة شهرياً",
      sub: "التراكمي أعلى والصافي الشهري أسفل — مقياس الأسرّة وحده",
      note: "مرّر أو انقر في أي موضع من عمود الشهر",
      aria: "رسم تطور الأسرّة المرخصة شهرياً: الطاقة التراكمية والصافي الشهري",
      cls: "lict-beds",
    });
    bedCard.body.appendChild(srTable(
      "تطور الأسرّة المرخصة شهرياً — تراكمي وصافي",
      ["الشهر", "الأسرّة المضافة", "الطاقة التراكمية"],
      [[rel.meta.baseline_label, "—", fmt.int(S.base.beds)]].concat(
        S.months.map((m, i) => [m.label, fmt.int(m.beds), fmt.int(S.cum.beds[i])]))));

    const bedChart = buildTimeChart(ctx, bedCard.chartEl, "beds", {
      keys: [{ key: "beds", name: "الأسرّة المرخصة", color: T.C.greenHi }],
      unit: "سرير",
      area: true,
      valueFmt: (v) => fmt.int(v),
      axisFmt: (v) => fmt.compact(v),
      inset: 82, insetMin: 62,          /* تسميات عريضة: «612.4 ألف» */
      topTitle: "الطاقة التراكمية — " + fmt.compact(S.cur.beds) + " سرير",
      bottomTitle: "المضاف شهرياً (سرير)",
    });
    onPlotClick(ctx, bedChart, [0, 1], (i) => {
      const spec = i === 0 ? baselineHighlight(rel)
        : monthHighlight(rel, der, i - 1, "beds");
      if (spec) ctx.highlight(spec);
    });

    /* 3) الخريطة الجغرافية + مفاتيح الطبقات ─────────────────────────────── */
    const layerKeys = h("div", {
      class: "lict-layers", role: "group",
      "aria-label": "طبقة الخريطة",
    });
    for (const k of LAYER_ORDER) {
      const L = LAYERS[k];
      const on = k === layerKey;
      const b = h("button", {
        class: "lict-layer" + (on ? " is-on" : ""), type: "button",
        "data-interactive": "", "aria-pressed": on ? "true" : "false",
        title: L.label,
      }, L.short);
      b.addEventListener("click", () => {
        if (k === layerKey) return;
        ctx.update({ layer: k === "beds" ? null : k });
      });
      layerKeys.appendChild(b);
    }

    const mapCard = chartCard(grid, {
      title: "التوزيع الجغرافي للتراخيص",
      sub: LAYERS[layerKey].label + " — القيم قطاعية معتمدة",
      aria: "خريطة أحياء الرياض ملوّنة بـ" + LAYERS[layerKey].label
        + " على مستوى القطاع",
      aside: layerKeys,
      span2: true,
      tall: true,
      cls: "lict-map",
    });

    const geo = ctx.geo;
    if (!mapReady(geo) || !RH.viz.geoutils) {
      /* غياب صادق لا شاشة فارغة ولا خريطة مختلقة (V3_CONTRACTS §7-9) */
      mapCard.body.removeChild(mapCard.chartEl);
      mapCard.body.appendChild(h("div", { class: "lict-missing" },
        h("b", {}, "حدود الأحياء غير مضمّنة في هذا البناء"),
        h("span", {}, "أعد البناء عبر build.py كي تُحقن "
          + "data/riyadh-geo.json — ولا تُرسم خريطة تقريبية بديلة.")));
    } else {
      const index = RH.viz.geoutils.districtIndex(geo, rel, der);
      const L = LAYERS[layerKey];
      mapCard.body.appendChild(srTable(
        "توزيع " + L.label + " على القطاعات",
        ["القطاع", L.label, "الحصة من الإجمالي"],
        rel.sectors.map((s) => [s.name, fmt.int(L.sectorVal(s)),
          fmt.pct(pctOf(L.sectorVal(s), L.cur(rel)))])));
      mapCard.body.appendChild(h("p", { class: "lict-note" },
        rel.meta.map_disclaimer, " — التلوين بقيمة القطاع المعتمدة؛ ",
        rel.neighbourhoods.label, " وحدها تحمل قيماً على مستوى الحي (",
        fmt.countNoun(rel.neighbourhoods.rows.length, LOCAL_NOUNS.district), ")."));

      let mapChart = null;
      try {
        mapChart = buildMap(ctx, mapCard.chartEl, index, layerKey);
      } catch (e) {
        if (typeof console !== "undefined") console.warn("الخريطة:", e && e.message);
      }
      const byName = new Map();
      for (const en of index) byName.set(en.name, en);
      onChartClick(ctx, mapChart, (p) => {
        if (!p || p.componentType !== "series") return;
        const spec = districtHighlight(rel, der, byName.get(p.name), layerKey);
        if (spec) ctx.highlight(spec);
      });
    }

    /* ── ذيل التبويب: المسار الصريح إلى الملحق (متاح بلوحة المفاتيح) ────── */
    const foot = h("div", { class: "lict-foot" },
      h("p", { class: "lict-foot-note" }, rel.meta.comparison_qualifier),
      h("button", {
        class: "lict-ax", type: "button", "data-interactive": "",
        onclick: () => ctx.openAppendix(AX.id, { page: AX.MONTHLY }),
      }, h("span", {}, "الملحق التحليلي: التراخيص — السجل والتفاصيل"),
        h("span", { class: "lict-ax-arrow", "aria-hidden": "true" }, "←")));
    root.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) التسجيل — طابور ‎RH.tabs‎ المؤجَّل (‎ns.js‎) يستقبله في أي ترتيب
     ══════════════════════════════════════════════════════════════════════════ */

  RH.tabs.register({
    id: "licensing",
    order: 2,
    title: "التراخيص",
    build,
  });
})();
