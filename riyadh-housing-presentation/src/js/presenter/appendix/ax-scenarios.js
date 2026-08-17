/* ════════════════════════════════════════════════════════════════════════════
   ax-scenarios.js — مستكشف السيناريوهات (ملحق `scenarios`)
   عقد V2_CONTRACTS_EXPANSION §4 — بادئة الأنماط `axs-` في src/styles/scenarios.css
   ────────────────────────────────────────────────────────────────────────────
   ما تفعله هذه الوحدة بالضبط:

     ▸ تنشر نموذجاً **نقياً** على `RH.explore.scenarios` (لا DOM إطلاقاً) يترجم
       صفوف `release.scenarios` المورّدة إلى قراءات قابلة للعرض والاختبار:
       فوارق عن السيناريو الأساسي، وترجمة كل عجز إلى **نسبة تغطية مكافئة**
       عبر الطلب الكلي المعتمد، وسلاسل الشهور، ونطاق الانتشار، وفحوص اتساق
       على البيانات المورّدة ذاتها. كل دالة منها تُختبر في
       `tests/unit/scenarios-model.test.mjs`.

     ▸ تسجّل ملحقاً من ثلاث صفحات عبر `RH.presenter.ax.register`:
         1) المقارنة التفاعلية — منزلق شهور + ثلاث بطاقات سيناريو + جدول
            دلتات وترجمة تغطية بصيغها المعروضة نصاً.
         2) شريط الحساسية — مضاعفات صغيرة (sparkline لكل سيناريو) + شريط
            الانتشار الشهري + جدول الأشهر المورّدة كاملاً.
         3) لوحة الصدق — نص التحفظ حرفياً، حالة الاعتماد، ما يلزم لاعتمادها
            (مستخرَجاً من نص التحفظ نفسه)، وفحوص الاتساق وأصل كل رقم.

   قواعد ملزمة مطبَّقة حرفياً في هذا الملف:
   • **لا رقم مختلق**: كل قيمة عجز من `release.scenarios.rows` كما وردت؛
     الطلب الكلي من `release.metrics.total_demand`؛ عجز اليوم وتغطيته من
     `release.derived` المنشورة. وكل اشتقاق عرضي (فارق/نطاق/تغطية مكافئة)
     عملية حسابية معلنة **تُعرض صيغتها نصاً بجانب رقمها** — لا صندوق أسود.
   • **التحفظ يلازم القيم**: `release.scenarios.caveat` حاضر بنصه الكامل في
     الصفحات الثلاث كلها (شريط ثابت أعلى الصفحتين الأوليين، وبطاقة
     `layout.pendingCard` كاملة في الثالثة) — لا تُعرض قيمة سيناريو في أي
     موضع من هذا الملحق دون تحفظها ووسم حالتها الذهبي.
   • **لا سيناريو رابع ولا استيفاء**: المنزلق يتنقل بين الأشهر المورّدة
     العشرة فقط (فهارس صحيحة)، ولا قيمة بين شهرين ولا مدّ خارج الأفق.
   • **منظومة المعنى**: المرجاني للعجز حصراً، الأخضر للتغطية/الطاقة، الذهبي
     للوسوم وخط الأساس والمؤشر الاسترشادي حصراً، المحايد للانتشار (قراءة
     عدم يقين لا خلل). لا محاور مزدوجة ولا gauges — الترجمة تُعرض بشريط
     نسبة أفقي `RH.viz.micro.ratioBar` وهو البديل القانوني.
   • **الأرقام عبر `RH.core.fmt` حصراً** (تطابق العدد والمعدود، عزل اتجاهي)،
     وكل نص يدخل DOM عبر عقد `dom.h` النصي — لا `innerHTML` لمحتوى إصدار.
   • **لوحة المفاتيح**: المنزلق وأزرار الشهور والتبويبات كلها عناصر حقيقية
     قابلة للتركيز وموسومة `data-interactive` فلا يبتلع جهاز التقديم ضغطاتها
     (عقد الملاحة §8)؛ Home/End/PageUp/PageDown مدعومة داخل المنزلق؛ وتغيّر
     الشهر يُعلن في منطقة `aria-live`.
   • **الحالة تصمد**: الشهر المختار وأساس المقارنة والمقياس المعروض تُكتب في
     معاملات المسار عبر `ctx.update` (مؤجَّلة كي لا يعيد كل تحريك بناء
     الصفحة)، فتعود كما تُركت عند الرجوع إلى الملحق.
   • **التنظيف**: كل مؤقت مؤجَّل يُلغى في `ctx.onTeardown`؛ لا مستمع عام ولا
     مثيل ECharts في هذا الملحق (كل الرسوم SVG/DOM من `RH.viz.micro`).
   • **prefers-reduced-motion**: لا حركة في هذا الملف أصلاً؛ الانتقالات
     البصرية كلها في `scenarios.css` وتُصفَّر هناك عند طلب التقليل.

   ملاحظة قابلية الاختبار (عقد التوسعة §0): النموذج النقي يُعرَّف وقت التحميل
   دون أي لمس لـ`document`/`window`، وتسجيل الملحق مشروط بحضور `RH.presenter.ax`
   (حاضر دائماً في البناء الكامل — ترتيب build.py يضع ax-shell قبل الملاحق)
   كي يُحمَّل الملف في بيئة اختبار الوحدة بنموذجه وحده.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════════════════════════════════════════════════════════════════
   القسم 1) النموذج النقي — RH.explore.scenarios
   لا DOM، لا حالة عامة، لا آثار جانبية: مدخلاته كائن الإصدار ومخرجاته
   بيانات جاهزة للعرض. الفضاء `RH.explore` منشأ سلفاً في ns.js (عقد §2.1)
   فيُكتب عليه مباشرة بلا `|| {}`.
   ══════════════════════════════════════════════════════════════════════════ */
RH.explore.scenarios = (function () {
  const derive = RH.data.derive;
  const fmt = RH.core.fmt;

  /* ── ثوابت عرض مقفلة (ليست بيانات): تعريف السيناريوهات الثلاثة المورّدة
     بترتيبها القانوني من الأسوأ إلى الأفضل، كما في مُنشئ forecastScenarios
     المعتمد وفي القسم الثامن حرفياً. أي مفتاح خارج هذه القائمة يُتجاهل —
     «لا سيناريو رابع» بوابةً لا نية. ── */
  const SCENARIO_DEFS = [
    {
      key: "conservative", label: "المتحفظ", short: "متحفظ", rank: 1,
      note: "أعلى عجز بين القراءات المورّدة",
    },
    {
      key: "base", label: "الأساسي", short: "أساسي", rank: 2,
      note: "القراءة الوسطى وأساس المقارنة",
    },
    {
      key: "optimistic", label: "المتفائل", short: "متفائل", rank: 3,
      note: "أدنى عجز بين القراءات المورّدة",
    },
  ];
  const SCENARIO_KEYS = SCENARIO_DEFS.map((d) => d.key);
  const DEF_BY_KEY = SCENARIO_DEFS.reduce((acc, d) => {
    acc[d.key] = d;
    return acc;
  }, Object.create(null));

  /** خريطة عرض مقفلة لحالات الاعتماد المعروفة — نصوصها من عقود المشروع
      حرفياً؛ حالة غير معروفة تُعرض بمعرفها الخام (صدق لا تجميل) */
  const STATUS_LABELS = {
    supplied_unvalidated: "سيناريوهات مورّدة — غير معتمدة",
    pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
    indicative_not_approved: "قيمة استرشادية — غير معتمدة",
  };

  /** مرساة استخراج متطلبات الاعتماد من نص التحفظ نفسه (لا إنشاء نص جديد) */
  const REQUIREMENT_MARK = "تُعتمد بعد ";
  /** مفردات المتطلبات المعروفة — تُعرض **فقط** إن وردت حرفياً في نص التحفظ */
  const REQUIREMENT_PHRASES = [
    "توثيق الافتراضات",
    "مالك النموذج",
    "إصداره",
    "طريقة التحديث",
  ];

  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const round1 = (v) => derive.roundHalfUp(v, 1);

  /* ── وصول آمن إلى كتل الإصدار: كل دالة تحتمل إصداراً ناقصاً وتعيد قيمة
     صادقة (null/[]) بدل الانهيار أو اختلاق بديل ── */

  /** كتلة السيناريوهات أو null */
  function block(release) {
    return (release && release.scenarios) ? release.scenarios : null;
  }

  /** صفوف الأشهر المورّدة كما وردت (مرجع القراءة الوحيد — لا نسخ محسوبة) */
  function rowsOf(release) {
    const sc = block(release);
    return sc && Array.isArray(sc.rows) ? sc.rows : [];
  }

  /** عدد الأشهر المورّدة */
  function monthCount(release) {
    return rowsOf(release).length;
  }

  /** الطلب الكلي المعتمد (مقام الترجمة إلى تغطية) أو null */
  function demandOf(release) {
    const m = release && release.metrics && release.metrics.total_demand;
    return m && isNum(m.value) ? m.value : null;
  }

  /** حصر فهرس شهر داخل المدى المورّد — قيمة غير صالحة → 0 (أول الأفق) */
  function clampIndex(release, i) {
    const n = monthCount(release);
    if (!n) return 0;
    const v = typeof i === "string" ? parseInt(i, 10) : i;
    if (!isNum(v)) return 0;
    return Math.max(0, Math.min(n - 1, Math.trunc(v)));
  }

  /** فهرس شهر بمعرفه ISO (‏"2026-12") أو ‎-1 إن لم يكن من الأشهر المورّدة */
  function monthIndexByIso(release, iso) {
    const rows = rowsOf(release);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i].iso === iso) return i;
    }
    return -1;
  }

  /** وسم حالة الاعتماد المعروض */
  function statusLabel(status) {
    return STATUS_LABELS[status] || String(status || "—");
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-أ) الترجمة التعريفية: عجز ↔ تغطية ↔ طاقة مكافئة
     ──────────────────────────────────────────────────────────────────────
     هذه ليست نموذج تنبؤ ولا استكمالاً للسيناريوهات: هي **قسمة تعريفية**
     على الطلب الكلي المعتمد، ومطابقتها للمشتقة المنشورة مثبتة باختبار
     وحدة (عجز اليوم 807,600 → 43.1٪ = coverage_pct المنشورة حرفياً).
     ══════════════════════════════════════════════════════════════════════ */

  /** نسبة التغطية المكافئة لعجز معلوم: ((الطلب − العجز) ÷ الطلب) × 100.
      خارج الشروط (طلب غير موجب أو مدخل غير رقمي) → null صادقة لا صفر.
      تُقصّ إلى [0, 100]: عجز يفوق الطلب لا يعني تغطية سالبة بل انعدامها. */
  function coverageFromDeficit(deficitBeds, totalDemand) {
    if (!isNum(deficitBeds) || !isNum(totalDemand) || totalDemand <= 0) return null;
    const covered = totalDemand - deficitBeds;
    const pct = round1((covered / totalDemand) * 100);
    return Math.max(0, Math.min(100, pct));
  }

  /** الطاقة المكافئة لعجز معلوم: الطلب − العجز (بالسرير) — لا قيم سالبة */
  function capacityEquivalent(deficitBeds, totalDemand) {
    if (!isNum(deficitBeds) || !isNum(totalDemand) || totalDemand <= 0) return null;
    return Math.max(0, totalDemand - deficitBeds);
  }

  /** المعكوس المعلن: كم سريراً تلزم لبلوغ نسبة تغطية معلومة */
  function bedsForCoverage(coveragePct, totalDemand) {
    if (!isNum(coveragePct) || !isNum(totalDemand) || totalDemand <= 0) return null;
    const clamped = Math.max(0, Math.min(100, coveragePct));
    return Math.round((clamped / 100) * totalDemand);
  }

  /** المعكوس المعلن: أي عجز يقابل نسبة تغطية معلومة */
  function deficitForCoverage(coveragePct, totalDemand) {
    const beds = bedsForCoverage(coveragePct, totalDemand);
    return beds == null ? null : Math.max(0, totalDemand - beds);
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ب) نموذج الشهر المختار — العقد الرسمي (§4)
     ══════════════════════════════════════════════════════════════════════ */

  /** صف سيناريو واحد داخل شهر: القيمة المورّدة + اشتقاقاتها المعلنة */
  function scenarioRow(def, row, baseDeficit, baseCoverage, demand) {
    const deficit = isNum(row[def.key]) ? row[def.key] : null;
    const coveragePct = coverageFromDeficit(deficit, demand);
    return {
      key: def.key,
      label: def.label,
      short: def.short,
      rank: def.rank,
      note: def.note,
      deficit,
      /* الفرق عن الأساسي بالسرير — موجب = عجز أسوأ من الأساسي */
      dBase: (isNum(deficit) && isNum(baseDeficit)) ? deficit - baseDeficit : null,
      coveragePct,
      /* فارق نقاط التغطية عن الأساسي — يُحسب على القيمتين المعروضتين
         (كلتاهما مقرَّبة لمنزلة واحدة) كي يطابق الفرق ما تراه العين */
      dCoveragePts: (isNum(coveragePct) && isNum(baseCoverage))
        ? round1(coveragePct - baseCoverage) : null,
      capacityEquiv: capacityEquivalent(deficit, demand),
      uncoveredPct: isNum(coveragePct) ? round1(100 - coveragePct) : null,
    };
  }

  /**
   * نموذج شهر مورّد كامل — العقد:
   *   { iso, label, rows:[{key,label,deficit,dBase,coveragePct,dCoveragePts}],
   *     spread, caveat, status }
   * ومعه امتدادات معلنة (index/count/demand/statusLabel/coverageMin…) يستهلكها
   * العرض. إصدار بلا كتلة سيناريوهات أو بلا صفوف → null (حالة صادقة).
   */
  function monthModel(release, i) {
    const sc = block(release);
    const rows = rowsOf(release);
    if (!sc || !rows.length) return null;

    const idx = clampIndex(release, i);
    const row = rows[idx];
    if (!row) return null;

    const demand = demandOf(release);
    const baseDeficit = isNum(row.base) ? row.base : null;
    const baseCoverage = coverageFromDeficit(baseDeficit, demand);

    const list = SCENARIO_DEFS.map(
      (def) => scenarioRow(def, row, baseDeficit, baseCoverage, demand));

    const cons = list[0].deficit;
    const opt = list[2].deficit;
    const covs = list.map((r) => r.coveragePct).filter(isNum);

    return {
      index: idx,
      count: rows.length,
      iso: row.iso,
      label: row.label,
      title: sc.title || "",
      unit: sc.unit || "سرير",
      demand,
      rows: list,
      baseDeficit,
      baseCoverage,
      /* الانتشار: المتحفظ − المتفائل — مدى عدم اليقين في هذا الشهر */
      spread: (isNum(cons) && isNum(opt)) ? cons - opt : null,
      spreadCoveragePts: covs.length === 3
        ? round1(Math.max.apply(null, covs) - Math.min.apply(null, covs)) : null,
      coverageMin: covs.length ? Math.min.apply(null, covs) : null,
      coverageMax: covs.length ? Math.max.apply(null, covs) : null,
      caveat: sc.caveat || "",
      status: sc.status || "",
      statusLabel: statusLabel(sc.status),
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ج) السلاسل الشهرية — مادة صفحة الحساسية (بلا استيفاء ولا مدّ)
     ══════════════════════════════════════════════════════════════════════ */

  /** سلسلة كل سيناريو عبر الأشهر المورّدة + سلسلة تغطيته المكافئة */
  function seriesModel(release) {
    const sc = block(release);
    const rows = rowsOf(release);
    const demand = demandOf(release);
    const months = rows.map((r) => ({ iso: r.iso, label: r.label }));

    const byKey = Object.create(null);
    for (const def of SCENARIO_DEFS) {
      const values = rows.map((r) => (isNum(r[def.key]) ? r[def.key] : null));
      const coverage = values.map((v) => coverageFromDeficit(v, demand));
      const nums = values.filter(isNum);
      byKey[def.key] = {
        def,
        values,
        coverage,
        first: nums.length ? nums[0] : null,
        last: nums.length ? nums[nums.length - 1] : null,
        min: nums.length ? Math.min.apply(null, nums) : null,
        max: nums.length ? Math.max.apply(null, nums) : null,
        rise: nums.length > 1 ? nums[nums.length - 1] - nums[0] : null,
        coverageFirst: coverageFromDeficit(nums.length ? nums[0] : null, demand),
        coverageLast: coverageFromDeficit(
          nums.length ? nums[nums.length - 1] : null, demand),
      };
    }

    const spread = rows.map((r) => (
      (isNum(r.conservative) && isNum(r.optimistic))
        ? r.conservative - r.optimistic : null));
    const spreadNums = spread.filter(isNum);

    return {
      count: rows.length,
      months,
      demand,
      byKey,
      keys: SCENARIO_KEYS.slice(),
      spread,
      spreadFirst: spreadNums.length ? spreadNums[0] : null,
      spreadLast: spreadNums.length ? spreadNums[spreadNums.length - 1] : null,
      spreadMax: spreadNums.length ? Math.max.apply(null, spreadNums) : null,
      widening: (spreadNums.length > 1)
        ? spreadNums[spreadNums.length - 1] - spreadNums[0] : null,
      caveat: sc ? (sc.caveat || "") : "",
      status: sc ? (sc.status || "") : "",
      statusLabel: statusLabel(sc ? sc.status : ""),
      unit: sc ? (sc.unit || "سرير") : "سرير",
      title: sc ? (sc.title || "") : "",
    };
  }

  /** سلسلة الانتشار الشهرية بصيغة صفوف مسماة (للجدول والأشرطة) */
  function spreadSeries(release) {
    const rows = rowsOf(release);
    return rows.map((r) => ({
      iso: r.iso,
      label: r.label,
      spread: (isNum(r.conservative) && isNum(r.optimistic))
        ? r.conservative - r.optimistic : null,
    }));
  }

  /**
   * خطوات سيناريو شهراً بشهر. `anchor` اختيارية: حين تُمرَّر (عجز اليوم
   * المنشور) تُقاس الخطوة الأولى منها لا من الفراغ — وهو ما تعلنه الواجهة
   * نصاً في كل موضع تعرضه فيه.
   */
  function steps(release, key, anchor) {
    const rows = rowsOf(release);
    if (!DEF_BY_KEY[key]) return [];
    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const value = isNum(rows[i][key]) ? rows[i][key] : null;
      const prev = i === 0 ? (isNum(anchor) ? anchor : null)
        : (isNum(rows[i - 1][key]) ? rows[i - 1][key] : null);
      out.push({
        iso: rows[i].iso,
        label: rows[i].label,
        value,
        delta: (isNum(value) && isNum(prev)) ? value - prev : null,
        fromAnchor: i === 0 && isNum(anchor),
      });
    }
    return out;
  }

  /** وتيرة سيناريو: خطواته وأكبرها ومتوسط الاتساع الشهري عن المرساة */
  function paceModel(release, key, anchor) {
    const list = steps(release, key, anchor);
    if (!list.length) return null;
    let maxStep = null;
    for (const s of list) {
      if (!isNum(s.delta)) continue;
      if (!maxStep || s.delta > maxStep.delta) maxStep = s;
    }
    const last = list[list.length - 1].value;
    const avgMonthly = (isNum(last) && isNum(anchor) && list.length)
      ? Math.round((last - anchor) / list.length) : null;
    return {
      key,
      def: DEF_BY_KEY[key],
      steps: list,
      maxStep,
      avgMonthly,
      total: (isNum(last) && isNum(anchor)) ? last - anchor : null,
    };
  }

  /**
   * قراءة الأفق كاملاً: وتيرة كل سيناريو (خطواته وأكبرها ومتوسطها عن
   * مرساة عجز اليوم) ومقارنة أول شهر مورّد بآخره. تُبنى من الصفوف المورّدة
   * ومن المشتقة المنشورة حصراً — لا امتداد ولا تقدير لما بعد الأفق.
   */
  function horizonModel(release, derived) {
    const rows = rowsOf(release);
    if (!rows.length) return null;
    const a = anchorModel(release, derived);
    const anchorDeficit = a ? a.deficit : null;
    const paces = SCENARIO_KEYS.map((k) => paceModel(release, k, anchorDeficit))
      .filter(Boolean);
    return {
      count: rows.length,
      anchorDeficit,
      firstLabel: rows[0].label,
      lastLabel: rows[rows.length - 1].label,
      paces,
      paceByKey: paces.reduce((acc, p) => {
        acc[p.key] = p;
        return acc;
      }, Object.create(null)),
      compare: compareMonths(release, 0, rows.length - 1),
    };
  }

  /** مقارنة شهرين مورّدين: فارق كل سيناريو بينهما (بالسرير وبنقاط التغطية) */
  function compareMonths(release, a, b) {
    const ma = monthModel(release, a);
    const mb = monthModel(release, b);
    if (!ma || !mb) return null;
    const rows = SCENARIO_DEFS.map((def, i) => {
      const ra = ma.rows[i], rb = mb.rows[i];
      return {
        key: def.key,
        label: def.label,
        from: ra.deficit,
        to: rb.deficit,
        dDeficit: (isNum(ra.deficit) && isNum(rb.deficit))
          ? rb.deficit - ra.deficit : null,
        dCoveragePts: (isNum(ra.coveragePct) && isNum(rb.coveragePct))
          ? round1(rb.coveragePct - ra.coveragePct) : null,
      };
    });
    return { from: ma, to: mb, rows };
  }

  /** مدى التغطية المكافئة داخل شهر واحد (أدنى/أعلى قراءة) */
  function coverageBand(release, i) {
    const m = monthModel(release, i);
    if (!m) return null;
    return {
      min: m.coverageMin,
      max: m.coverageMax,
      spanPts: m.spreadCoveragePts,
      label: m.label,
    };
  }

  /**
   * قراءة الطاقة المكافئة مقابل الطاقة المرخصة اليوم.
   *
   * الترجمة إلى تغطية تقسم على الطلب الكلي المعتمد **الثابت**؛ فحين يتسع
   * العجز المورّد مع ثبات المقام، تنخفض الطاقة المكافئة عن الطاقة المرخصة
   * الحالية. هذا استنتاج حسابي صرف من الرقمين، ومعناه أحد أمرين لا تحسمهما
   * هذه المنصة: إمّا أن السيناريوهات تفترض نمو الطلب ضمنياً، وإمّا أنها
   * تفترض تراجع الطاقة — وكلاهما من «الافتراضات» التي يطلب نص التحفظ
   * توثيقها قبل الاعتماد. تُعرض القراءة بوصفها فارقاً حسابياً معلناً،
   * ولا تُقدَّم تفسيراً.
   */
  function capacityGapModel(release, i, derived) {
    const m = monthModel(release, i);
    if (!m) return null;
    const a = anchorModel(release, derived);
    const licensed = a ? a.capacity : null;
    const coverageToday = a ? a.coverage : null;
    return {
      month: m,
      licensed,
      coverageToday,
      rows: m.rows.map((r) => ({
        key: r.key,
        label: r.label,
        capacityEquiv: r.capacityEquiv,
        vsLicensed: (isNum(r.capacityEquiv) && isNum(licensed))
          ? r.capacityEquiv - licensed : null,
        coveragePct: r.coveragePct,
        vsCoverageToday: (isNum(r.coveragePct) && isNum(coverageToday))
          ? round1(r.coveragePct - coverageToday) : null,
      })),
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-د) المرساة المعتمدة: عجز اليوم وتغطيته من المشتقات المنشورة
     ══════════════════════════════════════════════════════════════════════ */

  /**
   * مرساة القراءة: القيم المنشورة التي تُقاس إليها كل السيناريوهات، مع
   * صيغها المعتمدة ومراسي مصادرها الخام — لا رقم هنا محسوب في الواجهة.
   */
  function anchorModel(release, derived) {
    if (!release || !release.metrics || !release.derived) return null;
    const dem = release.metrics.total_demand;
    const cap = release.metrics.licensed_beds;
    const defM = release.derived.deficit_beds;
    const covM = release.derived.coverage_pct;
    const d = derived || {};
    const deficit = isNum(d.deficit_beds) ? d.deficit_beds
      : (defM && isNum(defM.value) ? defM.value : null);
    const coverage = isNum(d.coverage_pct) ? d.coverage_pct
      : (covM && isNum(covM.value) ? covM.value : null);
    return {
      demand: dem && isNum(dem.value) ? dem.value : null,
      demandLabel: dem ? dem.label : "",
      demandSheet: dem ? dem.sheet : "",
      demandAnchor: dem ? dem.anchor : "",
      capacity: cap && isNum(cap.value) ? cap.value : null,
      capacityLabel: cap ? cap.label : "",
      capacitySheet: cap ? cap.sheet : "",
      capacityAnchor: cap ? cap.anchor : "",
      deficit,
      deficitFormula: defM ? defM.formula : "",
      deficitFormulaVersion: defM ? defM.formula_version : "",
      coverage,
      coverageFormula: covM ? covM.formula : "",
      coverageFormulaVersion: covM ? covM.formula_version : "",
      /* البرهان الذاتي: الترجمة التعريفية تعيد إنتاج التغطية المنشورة */
      coverageFromDeficit: coverageFromDeficit(
        deficit, dem && isNum(dem.value) ? dem.value : null),
      asOf: release.meta ? release.meta.data_as_of : "",
      calculationDate: release.meta ? release.meta.calculation_date : "",
    };
  }

  /** المؤشر الاسترشادي للتغطية إن وُجد — بحالته ونصه الحرفيين لا مجرداً */
  function indicativeTarget(release) {
    const t = release && release.coverage_target_indicative;
    if (!t || !isNum(t.value)) return null;
    return {
      value: t.value,
      unit: t.unit || "٪",
      label: t.label || "",
      status: t.status || "",
      statusLabel: statusLabel(t.status),
      note: t.note || "",
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-هـ) لوحة الصدق: التحفظ ومتطلبات اعتماده وفحوص الاتساق
     ══════════════════════════════════════════════════════════════════════ */

  /** الجزء الحرفي من التحفظ الذي يلي مرساة «تُعتمد بعد» (أو "" إن غاب) */
  function requirementsClause(caveat) {
    const text = typeof caveat === "string" ? caveat : "";
    const at = text.indexOf(REQUIREMENT_MARK);
    if (at < 0) return "";
    return text.slice(at + REQUIREMENT_MARK.length).replace(/[.،؛]\s*$/, "").trim();
  }

  /**
   * متطلبات الاعتماد **من نص التحفظ نفسه**: كل عنصر معاد هو سلسلة فرعية
   * حرفية من النص (لا صياغة جديدة ولا إضافة متطلب من عندنا). إن لم تُطابق
   * أي مفردة معروفة أُعيدت الجملة كما هي عنصراً واحداً؛ وإن غابت مرساة
   * «تُعتمد بعد» أُعيدت قائمة فارغة (لا اختلاق متطلبات).
   */
  function requirementsFromCaveat(caveat) {
    const clause = requirementsClause(caveat);
    if (!clause) return [];
    const hits = [];
    for (const phrase of REQUIREMENT_PHRASES) {
      const at = clause.indexOf(phrase);
      if (at >= 0) hits.push({ phrase, at });
    }
    if (!hits.length) return [clause];
    hits.sort((a, b) => a.at - b.at);
    return hits.map((x) => x.phrase);
  }

  /** لوحة الصدق كاملة — كل حقولها منقولة من الإصدار لا مؤلَّفة */
  function honestyModel(release) {
    const sc = block(release);
    const rows = rowsOf(release);
    if (!sc) return null;
    return {
      title: sc.title || "",
      caveat: sc.caveat || "",
      status: sc.status || "",
      statusLabel: statusLabel(sc.status),
      unit: sc.unit || "سرير",
      requirements: requirementsFromCaveat(sc.caveat),
      requirementsClause: requirementsClause(sc.caveat),
      horizon: {
        count: rows.length,
        firstLabel: rows.length ? rows[0].label : "",
        lastLabel: rows.length ? rows[rows.length - 1].label : "",
        firstIso: rows.length ? rows[0].iso : "",
        lastIso: rows.length ? rows[rows.length - 1].iso : "",
      },
      scenarioCount: SCENARIO_DEFS.length,
    };
  }

  /**
   * فحوص اتساق على البيانات المورّدة ذاتها — تُعرض في لوحة الصدق كما هي:
   * مجتازة أو غير مجتازة، بلا تجميل وبلا إسقاط للوحة عند الإخفاق (الإصدار
   * المنشور اجتاز بوابات validate.js أصلاً؛ هذه قراءة إضافية للمستكشف).
   */
  function validateSupplied(release) {
    const sc = block(release);
    const rows = rowsOf(release);
    const out = [];
    const add = (id, label, ok, detail) => out.push({
      id, label, ok: !!ok, detail: detail || "",
    });

    add("rows_present", "كتلة السيناريوهات تحوي صفوفاً شهرية",
      rows.length > 0,
      rows.length ? fmt.int(rows.length) + " صفاً شهرياً" : "لا صفوف");

    add("three_values", "كل شهر يحمل السيناريوهات الثلاثة رقمياً",
      rows.length > 0 && rows.every(
        (r) => SCENARIO_KEYS.every((k) => isNum(r[k]))),
      "المفاتيح: " + SCENARIO_KEYS.join(" · "));

    add("ordering", "الترتيب محفوظ شهرياً: المتحفظ ≥ الأساسي ≥ المتفائل",
      rows.length > 0 && rows.every(
        (r) => isNum(r.conservative) && isNum(r.base) && isNum(r.optimistic)
          && r.conservative >= r.base && r.base >= r.optimistic),
      "فحص على كل صف مورّد");

    add("monotonic", "كل سيناريو غير متناقص عبر الأفق",
      rows.length > 0 && SCENARIO_KEYS.every((k) => {
        for (let i = 1; i < rows.length; i++) {
          if (!isNum(rows[i][k]) || !isNum(rows[i - 1][k])) return false;
          if (rows[i][k] < rows[i - 1][k]) return false;
        }
        return true;
      }),
      "لا انحدار بين شهرين متتاليين");

    add("iso_order", "معرفات الأشهر بصيغة ISO ومتسلسلة زمنياً",
      rows.length > 0 && rows.every((r) => /^\d{4}-\d{2}$/.test(String(r.iso)))
        && rows.every((r, i) => i === 0 || String(r.iso) > String(rows[i - 1].iso)),
      "الصيغة YYYY-MM تصاعدياً");

    add("labels_present", "لكل شهر تسمية عربية معروضة",
      rows.length > 0 && rows.every(
        (r) => typeof r.label === "string" && r.label.length > 0),
      "التسميات من الإصدار كما وردت");

    add("caveat_present", "نص التحفظ حاضر في الإصدار",
      !!(sc && typeof sc.caveat === "string" && sc.caveat.length > 0),
      sc && sc.caveat ? fmt.int(sc.caveat.length) + " محرفاً" : "غائب");

    add("status_known", "حالة الاعتماد من المفردات المعروفة",
      !!(sc && STATUS_LABELS[sc.status]),
      sc ? String(sc.status || "—") : "—");

    add("demand_anchor", "الطلب الكلي متاح مقاماً للترجمة إلى تغطية",
      isNum(demandOf(release)),
      isNum(demandOf(release))
        ? fmt.unitAfter(demandOf(release), "سرير") : "غير متاح");

    add("no_fourth", "لا سيناريو رابع في أي صف مورّد",
      rows.length > 0 && rows.every((r) => Object.keys(r).every(
        (k) => k === "iso" || k === "label" || SCENARIO_KEYS.indexOf(k) >= 0)),
      "المفاتيح المسموحة: iso · label · " + SCENARIO_KEYS.join(" · "));

    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-و) الصيغ المعروضة وأصل كل رقم — «الحساب مكشوف» عقداً لا شعاراً
     ══════════════════════════════════════════════════════════════════════ */

  /**
   * فهرس الصيغ التي يعرضها هذا الملحق نصاً بجانب أرقامها. `expr` مبنية
   * بقيم الإصدار المنسقة عبر fmt كي تُقرأ كعملية حسابية كاملة لا كرمز.
   */
  function formulaCatalogue(release) {
    const demand = demandOf(release);
    const dem = demand == null ? "—" : fmt.int(demand);
    /* الصيغ تُكتب بمعرفات لاتينية خالصة (مرآة أسلوب `formula` في الإصدار:
       ‏"licensed_beds ÷ total_demand × 100") كي تُعرض في صندوق LTR سليم
       الاتجاه؛ الشرح العربي يسكن حقل note لا داخل التعبير. */
    return [
      {
        id: "coverage",
        label: "التغطية المكافئة",
        expr: "(total_demand − deficit) ÷ total_demand × 100",
        applied: "(" + dem + " − deficit) ÷ " + dem + " × 100",
        note: "قسمة تعريفية على الطلب الكلي المعتمد — ليست تنبؤاً جديداً",
      },
      {
        id: "capacity",
        label: "الطاقة المكافئة",
        expr: "total_demand − deficit",
        applied: dem + " − deficit",
        note: "عدد الأسرّة الذي يقابل بقاء هذا العجز بالضبط",
      },
      {
        id: "dbase",
        label: "الفارق عن الأساسي",
        expr: "deficit(scenario) − deficit(base)",
        applied: "في الشهر المعروض ذاته — لا عبر الأشهر",
        note: "موجب = عجز أوسع من الأساسي",
      },
      {
        id: "dcov",
        label: "فارق نقاط التغطية",
        expr: "coverage(scenario) − coverage(base)",
        applied: "بالنقاط المئوية على القيمتين المعروضتين",
        note: "يُحسب على ما تراه العين فلا ينجرف عن الأرقام المعروضة",
      },
      {
        id: "spread",
        label: "الانتشار الشهري",
        expr: "conservative − optimistic",
        applied: "في الشهر ذاته — قراءة عدم يقين لا خلل",
        note: "نغمة محايدة عمداً: لا يُلوَّن بلون العجز",
      },
    ];
  }

  /** صفوف الترجمة للشهر المختار: الرقم + صيغته الكاملة نصاً */
  function translationRows(release, i) {
    const m = monthModel(release, i);
    if (!m) return [];
    const dem = m.demand == null ? "—" : fmt.int(m.demand);
    return m.rows.map((r) => ({
      key: r.key,
      label: r.label,
      deficit: r.deficit,
      coveragePct: r.coveragePct,
      capacityEquiv: r.capacityEquiv,
      dBase: r.dBase,
      dCoveragePts: r.dCoveragePts,
      coverageFormula: r.deficit == null ? "—"
        : "(" + dem + " − " + fmt.int(r.deficit) + ") ÷ " + dem + " × 100",
      capacityFormula: r.deficit == null ? "—"
        : dem + " − " + fmt.int(r.deficit),
    }));
  }

  /**
   * أصل كل رقم يظهر في هذا الملحق — ورقةً ومرساةً للخام، وصيغةً للمشتق،
   * وإعلاناً صريحاً بأن صفوف السيناريوهات مورّدة كما وردت.
   */
  function provenanceModel(release, derived) {
    if (!release) return [];
    const srcName = (release.sources && release.sources[0])
      ? release.sources[0].name : "";
    const rows = [];
    const raw = (id) => {
      const m = release.metrics && release.metrics[id];
      if (!m) return;
      rows.push({
        id,
        label: m.label || id,
        value: m.value,
        unit: m.unit || "",
        kind: "raw",
        origin: "خام — ورقة «" + (m.sheet || "—") + "» خلية "
          + fmt.iso(String(m.anchor || "—"))
          + (srcName ? " — " + srcName : ""),
      });
    };
    const der = (id) => {
      const m = release.derived && release.derived[id];
      if (!m) return;
      const live = derived && isNum(derived[id]) ? derived[id] : m.value;
      rows.push({
        id,
        label: m.label || id,
        value: live,
        unit: m.unit || "",
        kind: "derived",
        origin: "مشتق — " + fmt.iso(String(m.formula || "—"))
          + " (إصدار الصيغة " + fmt.iso(String(m.formula_version || "—")) + ")",
      });
    };
    raw("total_demand");
    raw("licensed_beds");
    der("deficit_beds");
    der("coverage_pct");

    const sc = block(release);
    if (sc) {
      rows.push({
        id: "scenarios",
        label: sc.title || "صفوف السيناريوهات المورّدة",
        value: rowsOf(release).length,
        unit: "صف شهري",
        kind: "supplied",
        origin: "مورّد — كتلة release.scenarios كما وردت في ملف البيانات "
          + "(الحالة: " + fmt.iso(String(sc.status || "—")) + ")",
      });
    }
    return rows;
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ز) صياغة نصية نقية — تُستهلك في منطقة aria-live وفي الملخص الناطق
     ══════════════════════════════════════════════════════════════════════ */

  /** جملة كاملة تصف شهراً مورّداً بأرقامه المنسقة وتحفظه — لا رقم خامٍ فيها */
  function describeMonth(release, i) {
    const m = monthModel(release, i);
    if (!m) return "لا توجد سيناريوهات مورّدة في هذا الإصدار.";
    const parts = m.rows.map((r) => r.label + " "
      + (r.deficit == null ? "—" : fmt.unitAfter(r.deficit, "سرير"))
      + " (تغطية مكافئة " + (r.coveragePct == null ? "—" : fmt.pct(r.coveragePct)) + ")");
    return m.label + " — الشهر " + fmt.int(m.index + 1) + " من "
      + fmt.int(m.count) + ": " + parts.join("؛ ")
      + ". الانتشار " + (m.spread == null ? "—" : fmt.unitAfter(m.spread, "سرير"))
      + ". " + m.statusLabel + ".";
  }

  /** سطر ترجمة واحد بصيغته الكاملة — يُقرأ كجملة حسابية مكتملة */
  function describeTranslation(release, i, key) {
    const m = monthModel(release, i);
    if (!m) return "";
    const r = m.rows.filter((x) => x.key === key)[0];
    if (!r || r.deficit == null || m.demand == null) return "";
    return "عجز " + r.label + " في " + m.label + " يساوي "
      + fmt.unitAfter(r.deficit, "سرير") + "، أي طاقة مكافئة "
      + fmt.unitAfter(r.capacityEquiv, "سرير") + " من طلب كلي "
      + fmt.unitAfter(m.demand, "سرير") + " — نسبة تغطية مكافئة "
      + fmt.pct(r.coveragePct) + ".";
  }

  return {
    /* ثوابت العرض المقفلة */
    SCENARIO_DEFS,
    SCENARIO_KEYS,
    STATUS_LABELS,
    REQUIREMENT_PHRASES,
    defOf: (key) => DEF_BY_KEY[key] || null,
    statusLabel,

    /* قراءة الإصدار */
    rowsOf,
    monthCount,
    demandOf,
    clampIndex,
    monthIndexByIso,

    /* الترجمة التعريفية (عقد §4) */
    coverageFromDeficit,
    capacityEquivalent,
    bedsForCoverage,
    deficitForCoverage,

    /* النماذج */
    monthModel,
    seriesModel,
    spreadSeries,
    steps,
    paceModel,
    horizonModel,
    compareMonths,
    coverageBand,
    capacityGapModel,
    anchorModel,
    indicativeTarget,

    /* الصدق والأصل */
    requirementsClause,
    requirementsFromCaveat,
    honestyModel,
    validateSupplied,
    formulaCatalogue,
    translationRows,
    provenanceModel,

    /* صياغة نصية */
    describeMonth,
    describeTranslation,
  };
})();

/* ══════════════════════════════════════════════════════════════════════════
   القسم 2) واجهة الملحق — ثلاث صفحات فوق النموذج النقي أعلاه
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  const { h } = RH.core.dom;
  const dom = RH.core.dom;
  const fmt = RH.core.fmt;
  const model = RH.explore.scenarios;

  /** عناوين الأقسام للعودة السياقية — مرآة الجدول القانوني في V2_CONTRACTS §1 */
  const SECTION_TITLES = {
    "00": "الغلاف",
    summary: "الملخص التنفيذي",
    demand: "العرض والطلب",
    licensing: "التراخيص",
    control: "الرقابة الميدانية",
    map: "خريطة الرياض التفاعلية",
    initiatives: "المبادرات والركائز",
    kpis: "مؤشرات الأداء",
    forecast: "سيناريوهات العجز",
    closing: "الخاتمة والتوصيات",
  };

  /** أسس المقارنة المتاحة في صفحة المقارنة (حالة `b` في المسار) */
  const BASES = [
    {
      key: "base",
      label: "الأساسي في الشهر ذاته",
      short: "الأساسي",
      hint: "الفارق يُقاس إلى السيناريو الأساسي في الشهر المعروض",
    },
    {
      key: "today",
      label: "العجز القائم اليوم",
      short: "عجز اليوم",
      hint: "الفارق يُقاس إلى العجز المشتق المنشور (مرساة القراءة)",
    },
    {
      key: "first",
      label: "أول أشهر الأفق",
      short: "أول الأفق",
      hint: "الفارق يُقاس إلى قيمة السيناريو ذاته في أول شهر مورّد",
    },
  ];
  const BASIS_KEYS = BASES.map((b) => b.key);

  /** مقاييس صفحة الحساسية (حالة `v` في المسار) */
  const MEASURES = [
    { key: "deficit", label: "العجز (سرير)", tone: "neg" },
    { key: "coverage", label: "التغطية المكافئة (٪)", tone: "pos" },
  ];
  const MEASURE_KEYS = MEASURES.map((m) => m.key);

  /* تأجيل كتابة الحالة في المسار: كل تحريك للمنزلق يعيد رسم الصفحة محلياً
     فوراً، بينما كتابة المسار (التي تُعيد بناء الملحق كاملاً عبر المحرك)
     تؤجَّل حتى يهدأ التفاعل — فلا وميض ولا إعادة بناء لكل درجة. */
  const COMMIT_DELAY = 340;

  /* حالة تعمّر عبر إعادة البناء (الملف يُحمَّل مرة واحدة): بعد كتابة المسار
     يعيد المحرك بناء الصفحة فيضيع التركيز — نعلّم العنصر الذي يجب أن يستعيده. */
  let pendingFocus = null;

  /* ── أدوات صياغة محلية ─────────────────────────────────────────────── */

  /** صيغ عدد ومعدود لا تغطيها NOUNS المركزية */
  const LOCAL_NOUNS = {
    month: { one: "شهر واحد", two: "شهران", few: "أشهر", many: "شهراً", hundred: "شهر" },
    scenario: {
      one: "سيناريو واحد", two: "سيناريوهان", few: "سيناريوهات",
      many: "سيناريو", hundred: "سيناريو",
    },
    check: { one: "فحص واحد", two: "فحصان", few: "فحوص", many: "فحصاً", hundred: "فحص" },
  };
  const monthsNoun = (n) => fmt.countNoun(n, LOCAL_NOUNS.month);

  /** عدد صحيح موقع معزول اتجاهياً: ‎+9,452‎ */
  function signedInt(v) {
    if (v == null || !Number.isFinite(v)) return "—";
    return fmt.iso((v >= 0 ? "+" : "−") + fmt.int(Math.abs(v)));
  }

  /** نقاط مئوية موقعة: ‎+0.7‎ نقطة مئوية */
  function signedPts(v) {
    if (v == null || !Number.isFinite(v)) return "—";
    return fmt.iso((v >= 0 ? "+" : "−") + fmt.dec1(Math.abs(v)))
      + fmt.NBSP + "نقطة مئوية";
  }

  /** قيمة أسرّة بصيغة تنفيذية عند الكبر وبالعدد والمعدود عند الصغر */
  function bedsText(v) {
    if (v == null || !Number.isFinite(v)) return "—";
    return Math.abs(v) >= 10000
      ? fmt.compact(v) + fmt.NBSP + "سرير"
      : fmt.noun(v, "bed");
  }

  /** نسبة أو شرطة صادقة */
  const pctText = (v) => (v == null || !Number.isFinite(v)) ? "—" : fmt.pct(v);

  /** رقاقة دلتا داخل خلية جدول: الغلاف عنصر يعيده الرسم إلى layout.tableCard */
  function deltaCell(value, opts) {
    const o = opts || {};
    const wrap = h("span", { class: "axs-cell-chip" });
    RH.viz.micro.deltaChip(wrap, {
      value,
      fmt: o.fmt || fmt.int,
      /* العجز: الزيادة سيئة — فالسهم الصاعد مرجاني والنازل أخضر */
      positiveIsGood: o.positiveIsGood === true,
      label: o.label || null,
      title: o.title || null,
    });
    return wrap;
  }

  /** زر عام بنمط الملحق (تفاعلي، مركَّز، لا يبتلعه جهاز التقديم) */
  function button(cls, label, onAct, opts) {
    const o = opts || {};
    const btn = h("button", {
      class: cls,
      type: "button",
      "data-interactive": "",
      "aria-label": o.aria || null,
      title: o.title || null,
      disabled: o.disabled === true,
      onclick: onAct,
    }, o.children || label);
    if (o.pressed != null) btn.setAttribute("aria-pressed", String(!!o.pressed));
    return btn;
  }

  /** مجموعة تبديل: أزرار aria-pressed داخل حاوية موسومة */
  function toggleGroup(el, opts) {
    const o = opts || {};
    const group = h("div", {
      class: "axs-toggle" + (o.cls ? " " + o.cls : ""),
      role: "group",
      "aria-label": o.ariaLabel || "",
    });
    if (o.label) {
      group.appendChild(h("span", { class: "axs-toggle-label" }, o.label));
    }
    for (const item of o.items || []) {
      group.appendChild(button(
        "axs-toggle-btn" + (item.key === o.value ? " now" : ""),
        item.label,
        () => o.onPick(item.key),
        {
          pressed: item.key === o.value,
          title: item.hint || null,
          aria: (o.ariaLabel ? o.ariaLabel + ": " : "") + item.label,
        }));
    }
    el.appendChild(group);
    return group;
  }

  /* ── شريط التحفظ الملازم: يظهر أعلى كل صفحة تعرض قيم سيناريو ───────── */

  /**
   * شريط التحفظ — نص `release.scenarios.caveat` كاملاً بوسم الحالة الذهبي.
   * ثابت في أعلى الصفحتين الأوليين وغير قابل للطيّ: **لا تُعرض قيمة
   * سيناريو في هذا الملحق دون هذا الشريط** (عقد §4 «محرّم: أي إظهار للقيم
   * دون الـcaveat»).
   */
  function buildCaveatBar(el, honesty, opts) {
    const o = opts || {};
    const bar = h("div", {
      class: "axs-caveat",
      role: "note",
      "aria-label": "تحفظ منهجي ملازم لقيم السيناريوهات",
    },
      h("div", { class: "axs-caveat-head" },
        h("span", { class: "axs-caveat-dot", "aria-hidden": "true" }),
        h("span", { class: "axs-caveat-badge" }, honesty.statusLabel),
        h("span", { class: "axs-caveat-title" },
          "التحفظ المنهجي — نص الإصدار الحرفي"),
        /* الزر داخل سطر الترويسة لا تحته: كل سطر رأسي في إطار الملحق
           مقتطع من مساحة بيانات، والتحفظ يبقى كاملاً في كل الأحوال */
        o.onOpenHonesty ? button("axs-caveat-btn", "لوحة الصدق الكاملة",
          o.onOpenHonesty, {
            aria: "الانتقال إلى صفحة لوحة الصدق داخل الملحق",
            children: [
              h("span", {}, "لوحة الصدق الكاملة"),
              h("span", { class: "axs-arrow", "aria-hidden": "true" }, "←"),
            ],
          }) : null,
      ),
      h("p", { class: "axs-caveat-text" }, honesty.caveat),
    );
    el.appendChild(bar);
    return bar;
  }

  /** سطر هامشي موحد (مصدر/إفصاح) */
  function noteLine(el, text, cls) {
    const p = h("p", { class: "axs-note" + (cls ? " " + cls : "") }, text);
    el.appendChild(p);
    return p;
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-أ) الصفحة 1 — المقارنة التفاعلية
     ──────────────────────────────────────────────────────────────────────
     منزلق شهور على فهارس `scenarios.rows` (لا استيفاء بين شهرين)، ثلاث
     بطاقات سيناريو بترجمتها إلى تغطية مكافئة، وجدول دلتات بصيغ معروضة.
     ══════════════════════════════════════════════════════════════════════ */
  function pageCompare(el, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const honesty = model.honestyModel(rel);
    const anchor = model.anchorModel(rel, der);
    const target = model.indicativeTarget(rel);
    const count = model.monthCount(rel);

    const page = h("div", { class: "axs-page axs-p1" });
    el.appendChild(page);

    /* حالة صادقة: إصدار بلا سيناريوهات مورّدة — لا لوحة فارغة صامتة */
    if (!honesty || !count) {
      RH.presenter.layout.pendingCard(page, {
        label: "لا سيناريوهات مورّدة في هذا الإصدار",
        note: "لا يعرض هذا الملحق أرقاماً من عنده: مستكشف السيناريوهات "
          + "يقرأ كتلة release.scenarios حصراً، وغيابها يُعرض كما هو.",
      });
      return;
    }

    /* ── الحالة المقروءة من المسار: الشهر وأساس المقارنة ── */
    let month = model.clampIndex(rel, ctx.params.m);
    let basis = BASIS_KEYS.indexOf(ctx.params.b) >= 0 ? ctx.params.b : "base";

    /* ── الشريط العلوي: التحفظ الملازم إلى جانب مرساة القراءة المعتمدة.
       صفّان مدموجان في صف واحد كي يبقى للبيانات نصيبها من إطار الملحق
       (لا تمرير في صفحات الملاحق — الكثافة تُدار بالتخطيط لا بالحذف). ── */
    const top = h("div", { class: "axs-top" });
    page.appendChild(top);

    buildCaveatBar(top, honesty, {
      onOpenHonesty: () => ctx.update({ page: "2" }),
    });

    /* ── مرساة القراءة المعتمدة: أرقام منشورة لا محسوبة هنا ── */
    const anchorRow = h("div", { class: "axs-anchor", role: "list" });
    function anchorItem(label, value, note, tone) {
      anchorRow.appendChild(h("div", {
        class: "axs-anchor-item" + (tone ? " " + tone : ""),
        role: "listitem",
      },
        h("span", { class: "axs-anchor-k" }, label),
        h("b", { class: "axs-anchor-v" }, value),
        note ? h("span", { class: "axs-anchor-note" }, note) : null,
      ));
    }
    anchorItem("الطلب الكلي المعتمد", fmt.unitAfter(anchor.demand, "سرير"),
      "ورقة «" + anchor.demandSheet + "» خلية " + fmt.iso(String(anchor.demandAnchor)));
    anchorItem("العجز القائم اليوم", fmt.unitAfter(anchor.deficit, "سرير"),
      fmt.iso(String(anchor.deficitFormula)), "neg");
    anchorItem("نسبة التغطية اليوم", pctText(anchor.coverage),
      fmt.iso(String(anchor.coverageFormula)), "pos");
    anchorItem("أفق السيناريوهات المورّد",
      honesty.horizon.firstLabel + " – " + honesty.horizon.lastLabel,
      monthsNoun(honesty.horizon.count) + " — بلا استيفاء بينها");
    top.appendChild(anchorRow);

    /* ── كتلة المنزلق: العنوان + المنزلق + أزرار التنقل + رقاقات الشهور ── */
    const sliderBlock = h("div", { class: "axs-slider-block" });
    page.appendChild(sliderBlock);

    const sliderTitle = h("span", { class: "axs-slider-title" },
      "الشهر المعروض");
    const sliderValue = h("b", { class: "axs-slider-value" }, "");
    const sliderMeta = h("span", { class: "axs-slider-meta" }, "");
    const sliderHead = h("div", { class: "axs-slider-head" },
      h("div", { class: "axs-slider-headmain" },
        sliderTitle, sliderValue, sliderMeta));
    sliderBlock.appendChild(sliderHead);

    const slider = h("input", {
      class: "axs-slider",
      type: "range",
      min: "0",
      max: String(count - 1),
      step: "1",
      value: String(month),
      "data-interactive": "",
      "aria-label": "منزلق أشهر السيناريوهات المورّدة — "
        + monthsNoun(count) + " من " + honesty.horizon.firstLabel
        + " إلى " + honesty.horizon.lastLabel,
    });

    const prevBtn = button("axs-nav-btn", "الشهر السابق",
      () => setMonth(month - 1, "slider"),
      { aria: "الانتقال إلى الشهر السابق في أفق السيناريوهات" });
    const nextBtn = button("axs-nav-btn", "الشهر التالي",
      () => setMonth(month + 1, "slider"),
      { aria: "الانتقال إلى الشهر التالي في أفق السيناريوهات" });

    sliderBlock.appendChild(h("div", { class: "axs-slider-row" },
      prevBtn, h("div", { class: "axs-slider-track" }, slider), nextBtn));

    /* رقاقات الأشهر: مسار مفاتيحي موازٍ للمنزلق (وأسرع للقفز المباشر) */
    const chipsRow = h("div", {
      class: "axs-chips", role: "group",
      "aria-label": "أشهر أفق السيناريوهات المورّدة",
    });
    const chips = [];
    const series = model.seriesModel(rel);
    for (let i = 0; i < count; i++) {
      const m = series.months[i];
      const chip = button("axs-chip", m.label,
        () => setMonth(i, "chip:" + i),
        { aria: "عرض شهر " + m.label, pressed: false });
      chips.push(chip);
      chipsRow.appendChild(chip);
    }
    sliderBlock.appendChild(chipsRow);

    /* ── أساس المقارنة: يغيّر عمود الفارق الإضافي وسطر البطاقات ──
       يسكن سطر الترويسة ذاته توفيراً للارتفاع داخل إطار الملحق */
    toggleGroup(sliderHead, {
      cls: "axs-basis",
      label: "أساس المقارنة الإضافي",
      ariaLabel: "أساس المقارنة الإضافي",
      value: basis,
      items: BASES,
      onPick: (key) => {
        if (key === basis) return;
        basis = key;
        pendingFocus = null;
        ctx.update({ b: key === "base" ? null : key });
      },
    });

    /* ── جسم الصفحة: بطاقات السيناريوهات + جدول الترجمة + الصيغ ── */
    const bodyGrid = h("div", { class: "axs-body" });
    page.appendChild(bodyGrid);

    const cardsHost = h("div", { class: "axs-cards" });
    bodyGrid.appendChild(cardsHost);

    /* وسم الترجمة الملازم لأشرطة التغطية الثلاثة — سطر واحد مرئي دائماً */
    bodyGrid.appendChild(h("p", { class: "axs-cards-note" },
      "أشرطة التغطية في البطاقات الثلاث اشتقاق تعريفي من الطلب الكلي "
      + "المعتمد " + fmt.unitAfter(anchor.demand, "سرير")
      + " — ليست تنبؤاً جديداً، والشاخص الذهبي "
      + (target ? target.label + " " + fmt.pct(target.value) + " ("
        + target.statusLabel + ")" : "غير معروض لغياب المؤشر في الإصدار")
      + "."));

    const lower = h("div", { class: "axs-lower" });
    bodyGrid.appendChild(lower);
    const tableHost = h("div", { class: "axs-table-host" });
    const asideHost = h("div", { class: "axs-aside" });
    const formulaHost = h("div", { class: "axs-aside" });
    lower.appendChild(tableHost);
    lower.appendChild(asideHost);
    lower.appendChild(formulaHost);

    /* منطقة إعلان حيّة لقارئات الشاشة — تغيّر الشهر يُنطق لا يُخمَّن */
    const live = h("p", {
      class: "sr-only axs-live", role: "status", "aria-live": "polite",
    });
    page.appendChild(live);

    /* ── الالتزام المؤجَّل بكتابة الحالة في المسار ── */
    let commitTimer = null;
    function scheduleCommit(focusKey) {
      if (commitTimer) clearTimeout(commitTimer);
      commitTimer = setTimeout(() => {
        commitTimer = null;
        pendingFocus = focusKey || null;
        ctx.update({ m: month === 0 ? null : String(month) });
      }, COMMIT_DELAY);
    }
    ctx.onTeardown(() => {
      if (commitTimer) clearTimeout(commitTimer);
      commitTimer = null;
    });

    /* ── ضبط الشهر: يرسم فوراً ويؤجل كتابة المسار ── */
    function setMonth(next, focusKey) {
      const v = model.clampIndex(rel, next);
      if (v === month) return;
      month = v;
      slider.value = String(month);
      render();
      scheduleCommit(focusKey);
    }

    slider.addEventListener("input", () => {
      const v = model.clampIndex(rel, slider.value);
      if (v === month) return;
      month = v;
      render();
      scheduleCommit("slider");
    });
    /* مفاتيح المنزلق: الأسهم للمتصفح، والقفز للأطراف والصفحات هنا.
       stopPropagation كي لا تصل ضغطة إلى مقلّب صفحات الملحق. */
    slider.addEventListener("keydown", (ev) => {
      let handled = true;
      if (ev.key === "Home") setMonth(0, "slider");
      else if (ev.key === "End") setMonth(count - 1, "slider");
      else if (ev.key === "PageUp") setMonth(month + 3, "slider");
      else if (ev.key === "PageDown") setMonth(month - 3, "slider");
      else handled = false;
      if (handled) ev.preventDefault();
      ev.stopPropagation();
    });

    /* ── بطاقة سيناريو واحدة ── */
    function buildScenarioCard(row, m) {
      const card = h("div", { class: "axs-card " + row.key });

      card.appendChild(h("div", { class: "axs-card-head" },
        h("span", { class: "axs-card-name" }, row.label),
        h("span", { class: "axs-card-rank" },
          "الترتيب " + fmt.int(row.rank) + " من " + fmt.int(m.rows.length)),
      ));

      card.appendChild(h("div", { class: "axs-card-hero" },
        h("span", { class: "axs-card-num" },
          row.deficit == null ? "—" : fmt.int(row.deficit)),
        h("span", { class: "axs-card-unit" }, m.unit),
      ));
      card.appendChild(h("div", { class: "axs-card-sub" },
        "العجز المتوقع في " + m.label + " — " + row.note));

      /* الترجمة إلى تغطية مكافئة: شريط نسبة أفقي (بديل الgauge المحرّم)
         بشاخص ذهبي للمؤشر الاسترشادي بنص حالته الحرفي حين يوجد.
         وسم «اشتقاق تعريفي» يظهر سطراً واحداً تحت البطاقات الثلاث (لا
         يتكرر ثلاثاً) — حاضر دائماً ومرئي، وموفّر لارتفاع البطاقة. */
      const ratioHost = h("div", { class: "axs-card-ratio" });
      RH.viz.micro.ratioBar(ratioHost, {
        su: ctx.su,
        pct: row.coveragePct,
        tone: "pos",
        ariaLabel: "التغطية المكافئة لسيناريو " + row.label + " في " + m.label
          + " — اشتقاق تعريفي من الطلب الكلي المعتمد",
        target: target ? {
          pct: target.value,
          label: target.label + " " + fmt.pct(target.value)
            + " — " + target.statusLabel,
        } : null,
      });
      card.appendChild(ratioHost);

      /* صفوف الأرقام المرافقة — الفوارق عن الأساسي في جدول الدلتات أدناه
         بعمودَيها الكاملين، فلا تُكرَّر هنا (كثافة بلا ازدواج) */
      const rows = h("div", { class: "axs-card-rows" });
      function addRow(k, v, tone) {
        rows.appendChild(h("div", { class: "axs-card-row" + (tone ? " " + tone : "") },
          h("span", { class: "axs-card-k" }, k),
          h("b", { class: "axs-card-v" }, v),
        ));
      }
      addRow("الطاقة المكافئة", fmt.unitAfter(row.capacityEquiv, "سرير"), "pos");
      addRow("غير المغطى من الطلب", pctText(row.uncoveredPct));
      card.appendChild(rows);

      /* رقاقة الفارق عن أساس المقارنة المختار (غير الأساسي) */
      if (basis !== "base") {
        const extra = extraDelta(row, m);
        const chipHost = h("div", { class: "axs-card-extra" },
          h("span", { class: "axs-card-k" },
            "الفارق عن " + basisDef().short));
        RH.viz.micro.deltaChip(chipHost, {
          value: extra,
          fmt: fmt.int,
          positiveIsGood: false,
          label: "سرير",
          title: basisDef().hint,
        });
        card.appendChild(chipHost);
      }
      return card;
    }

    const basisDef = () => BASES.filter((b) => b.key === basis)[0] || BASES[0];

    /** الفارق عن أساس المقارنة المختار — كل أساس معلن نصاً في الواجهة */
    function extraDelta(row, m) {
      if (row.deficit == null) return null;
      if (basis === "today") {
        return anchor.deficit == null ? null : row.deficit - anchor.deficit;
      }
      if (basis === "first") {
        const firstVal = series.byKey[row.key].values[0];
        return firstVal == null ? null : row.deficit - firstVal;
      }
      return row.dBase;
    }

    /* ── جدول الدلتات والترجمة: مصفوفة المقارنة الكاملة للشهر المعروض ── */
    function buildTable(m) {
      const trans = model.translationRows(rel, m.index);
      const byKey = Object.create(null);
      for (const t of trans) byKey[t.key] = t;
      /* قراءة الطاقة المكافئة مقابل المرخصة اليوم تسكن الجدول لا بطاقة
         منفصلة: الصفوف نفسها الثلاثة فلا تكلفة ارتفاع، والمقارنة تُقرأ
         في سياقها بجوار التغطية التي اشتُقت منها. */
      const gap = model.capacityGapModel(rel, m.index, der);
      const gapByKey = Object.create(null);
      for (const g of gap.rows) gapByKey[g.key] = g;

      const columns = [
        {
          key: "label", label: "السيناريو",
          render: (r) => h("span", { class: "axs-t-name " + r.key }, r.label),
        },
        {
          key: "deficit", label: "العجز (" + m.unit + ")", align: "end",
          render: (r) => h("b", { class: "axs-t-num neg" },
            r.deficit == null ? "—" : fmt.int(r.deficit)),
        },
        {
          key: "dBase", label: "الفارق عن الأساسي", align: "end",
          render: (r) => (r.key === "base"
            ? h("span", { class: "axs-t-dash" }, "أساس المقارنة")
            : deltaCell(r.dBase, {
              label: "سرير",
              title: "عجز " + r.label + " ناقص عجز الأساسي في " + m.label,
            })),
        },
        {
          key: "coveragePct", label: "التغطية المكافئة", align: "end",
          render: (r) => h("b", { class: "axs-t-num pos" }, pctText(r.coveragePct)),
        },
        {
          key: "dCoveragePts", label: "فارق نقاط التغطية", align: "end",
          render: (r) => (r.key === "base"
            ? h("span", { class: "axs-t-dash" }, "أساس المقارنة")
            : deltaCell(r.dCoveragePts, {
              fmt: fmt.dec1,
              positiveIsGood: true,
              label: "نقطة",
              title: "تغطية " + r.label + " ناقص تغطية الأساسي في " + m.label,
            })),
        },
        {
          key: "capacityEquiv", label: "الطاقة المكافئة", align: "end",
          render: (r) => h("b", { class: "axs-t-num pos" },
            r.capacityEquiv == null ? "—" : fmt.int(r.capacityEquiv)),
        },
        {
          key: "vsLicensed", label: "مقابل المرخصة اليوم", align: "end",
          render: (r) => deltaCell(
            gapByKey[r.key] ? gapByKey[r.key].vsLicensed : null, {
              label: "سرير",
              positiveIsGood: true,
              title: "الطاقة المكافئة ناقص الطاقة المرخصة اليوم "
                + fmt.unitAfter(gap.licensed, "سرير"),
            }),
        },
        {
          key: "formula", label: "صيغة التغطية المعروضة",
          render: (r) => h("span", { class: "axs-t-formula ltr" },
            (byKey[r.key] && byKey[r.key].coverageFormula) || "—"),
        },
      ];

      if (basis !== "base") {
        columns.splice(3, 0, {
          key: "extra", label: "الفارق عن " + basisDef().short, align: "end",
          render: (r) => deltaCell(extraDelta(r, m), {
            label: "سرير", title: basisDef().hint,
          }),
        });
      }

      RH.presenter.layout.tableCard(tableHost, {
        title: "دلتات " + m.label + " وترجمتها إلى تغطية مكافئة",
        columns,
        rows: m.rows,
        note: "أرقام العجز من الإصدار كما وردت · الفوارق والتغطية اشتقاق "
          + "معلن على " + fmt.unitAfter(m.demand, "سرير") + " · "
          + honesty.statusLabel,
      });
    }

    /* ── العمود الأوسط: الانتشار + قراءة الطاقة المكافئة ── */
    function buildAside(m) {
      /* بطاقة الانتشار — نغمة محايدة: عدم يقين لا خلل (عقد اللون) */
      const spreadCard = RH.presenter.layout.card(asideHost, {
        title: "الانتشار في " + m.label,
        sub: "المتحفظ − المتفائل — قراءة عدم اليقين في الشهر المعروض",
      });
      spreadCard.body.appendChild(h("div", { class: "axs-spread-hero" },
        h("span", { class: "axs-spread-num" },
          m.spread == null ? "—" : fmt.int(m.spread)),
        h("span", { class: "axs-spread-unit" }, m.unit),
      ));
      const barsHost = h("div", { class: "axs-spread-bars" });
      RH.viz.micro.microBars(barsHost, {
        su: ctx.su,
        ariaLabel: "قيم السيناريوهات الثلاثة في " + m.label,
        tone: "neg",
        max: m.rows.reduce(
          (mx, r) => Math.max(mx, r.deficit == null ? 0 : r.deficit), 0),
        items: m.rows.map((r) => ({ label: r.short, value: r.deficit })),
        fmt: fmt.int,
      });
      spreadCard.body.appendChild(barsHost);
      spreadCard.body.appendChild(h("div", { class: "axs-spread-foot" },
        "مدى التغطية المكافئة في هذا الشهر: "
        + pctText(m.coverageMin) + " – " + pctText(m.coverageMax)
        + " (" + signedPts(m.spreadCoveragePts) + ")"));

      /* مدى التغطية داخل الشهر ثم بيان الافتراض الذي تقوم عليه الترجمة:
         المقام ثابت (الطلب الكلي المعتمد)، فاتساع العجز المورّد يعني
         حسابياً طاقة مكافئة أدنى من المرخصة اليوم — عمود الجدول المجاور.
         السبب (نمو طلب مفترض أم تراجع طاقة مفترض) لا يحسمه هذا الملحق،
         وهو بعينه ما يطلب التحفظ توثيقه تحت «الافتراضات». */
      noteLine(spreadCard.body,
        "المقام في الترجمة ثابت عند الطلب الكلي المعتمد "
        + fmt.unitAfter(m.demand, "سرير") + "؛ لذلك تظهر الطاقة المكافئة في "
        + "الجدول أدنى من الطاقة المرخصة اليوم "
        + fmt.unitAfter(model.anchorModel(rel, der).capacity, "سرير")
        + ". أهو نمو طلب مفترض داخل السيناريو أم تراجع طاقة مفترض؟ لا "
        + "يحسم هذا الملحق ذلك — وهو ما يطلب التحفظ توثيقه تحت "
        + "«الافتراضات».", "src");
    }

    /* ── العمود الثالث: الصيغ المعروضة كاملة ── */
    function buildFormulas(m) {
      const fcard = RH.presenter.layout.card(formulaHost, {
        title: "الصيغ المعروضة",
        sub: "كل رقم مشتق في هذه الصفحة يُعلن عمليته الحسابية كاملة",
      });
      const flist = h("div", { class: "axs-formulas" });
      for (const f of model.formulaCatalogue(rel)) {
        flist.appendChild(h("div", { class: "axs-formula", title: f.note },
          h("span", { class: "axs-formula-k" }, f.label),
          h("code", { class: "axs-formula-x ltr" }, f.expr),
          h("span", { class: "axs-formula-n" }, f.note),
        ));
      }
      fcard.body.appendChild(flist);
      noteLine(fcard.body,
        "المقام في صيغتي التغطية والطاقة هو الطلب الكلي المعتمد "
        + fmt.unitAfter(m.demand, "سرير") + " — ورقة «" + anchor.demandSheet
        + "» خلية " + fmt.iso(String(anchor.demandAnchor)) + ".", "src");

      /* مثال محلول على الشهر المعروض: الصيغة مطبقة على سيناريو بعينه */
      const worked = model.describeTranslation(rel, m.index, "base");
      if (worked) {
        const ex = h("div", { class: "axs-worked" },
          h("span", { class: "axs-worked-k" }, "مثال محلول — الأساسي"),
          h("p", { class: "axs-worked-t" }, worked),
        );
        fcard.body.appendChild(ex);
      }

      /* تذكير المفاتيح: مسار مفاتيحي معلن لا مخفي */
      fcard.body.appendChild(h("div", { class: "axs-keys" },
        h("span", { class: "axs-keys-k" }, "لوحة المفاتيح"),
        h("span", { class: "axs-keys-v" },
          "داخل المنزلق: الأسهم شهراً بشهر · PageUp/PageDown ثلاثة أشهر · "
          + "Home/End طرفا الأفق"),
      ));
    }

    /* ── إعادة الرسم الكاملة للشهر الحالي (بلا كتابة مسار) ── */
    function render() {
      const m = model.monthModel(rel, month);
      if (!m) return;

      /* ترويسة المنزلق */
      sliderValue.textContent = m.label;
      sliderMeta.textContent = "الشهر " + fmt.int(m.index + 1) + " من "
        + fmt.int(m.count) + " — " + fmt.iso(String(m.iso));
      slider.value = String(m.index);
      slider.setAttribute("aria-valuetext",
        m.label + " — الشهر " + fmt.int(m.index + 1) + " من " + fmt.int(m.count));
      prevBtn.disabled = m.index <= 0;
      nextBtn.disabled = m.index >= m.count - 1;

      /* الرقاقات */
      chips.forEach((chip, i) => {
        const now = i === m.index;
        chip.classList.toggle("now", now);
        chip.setAttribute("aria-pressed", String(now));
      });

      /* البطاقات */
      dom.clear(cardsHost);
      for (const row of m.rows) cardsHost.appendChild(buildScenarioCard(row, m));

      /* الجدول والعمودان الجانبيان */
      dom.clear(tableHost);
      buildTable(m);
      dom.clear(asideHost);
      buildAside(m);
      dom.clear(formulaHost);
      buildFormulas(m);

      /* الإعلان الحي */
      live.textContent = model.describeMonth(rel, m.index);
    }

    render();

    /* استعادة التركيز بعد إعادة البناء الناتجة عن كتابة الحالة في المسار */
    const want = pendingFocus;
    pendingFocus = null;
    if (want === "slider") {
      slider.focus();
    } else if (want && want.indexOf("chip:") === 0) {
      const i = model.clampIndex(rel, want.slice(5));
      if (chips[i]) chips[i].focus();
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ب) الصفحة 2 — شريط الحساسية
     ──────────────────────────────────────────────────────────────────────
     مضاعفات صغيرة: sparkline لكل سيناريو عبر الأشهر المورّدة فقط، وشريط
     الانتشار الشهري، وجدول الأشهر كاملاً بقيمه وترجماته. لا استيفاء ولا
     مدّ خارج الأفق المورّد — والنص يقولها صراحة.
     ══════════════════════════════════════════════════════════════════════ */
  function pageSensitivity(el, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const honesty = model.honestyModel(rel);
    const anchor = model.anchorModel(rel, der);
    const series = model.seriesModel(rel);

    const page = h("div", { class: "axs-page axs-p2" });
    el.appendChild(page);

    if (!honesty || !series.count) {
      RH.presenter.layout.pendingCard(page, {
        label: "لا سلاسل سيناريوهات في هذا الإصدار",
        note: "صفحة الحساسية ترسم الأشهر المورّدة حصراً؛ غيابها يُعرض كما هو.",
      });
      return;
    }

    let measure = MEASURE_KEYS.indexOf(ctx.params.v) >= 0 ? ctx.params.v : "deficit";
    const measureDef = () => MEASURES.filter((m) => m.key === measure)[0] || MEASURES[0];

    buildCaveatBar(page, honesty, {
      onOpenHonesty: () => ctx.update({ page: "2" }),
    });

    /* ── شريط الأدوات: مقياس المضاعفات الصغيرة ── */
    const tools = h("div", { class: "axs-tools" });
    page.appendChild(tools);
    toggleGroup(tools, {
      label: "المقياس المعروض في المسارات",
      ariaLabel: "المقياس المعروض في مسارات السيناريوهات",
      value: measure,
      items: MEASURES,
      onPick: (key) => {
        if (key === measure) return;
        measure = key;
        pendingFocus = null;
        ctx.update({ v: key === "deficit" ? null : key });
      },
    });
    tools.appendChild(h("span", { class: "axs-tools-note" },
      "الأفق المورّد: " + honesty.horizon.firstLabel + " – "
      + honesty.horizon.lastLabel + " (" + monthsNoun(series.count)
      + ") — لا استيفاء بين الأشهر ولا مدّ خارجها"));

    /* ── المضاعفات الصغيرة: خلية لكل سيناريو ── */
    const smCard = RH.presenter.layout.card(page, {
      title: "مسارات السيناريوهات الثلاثة — " + measureDef().label,
      sub: "نقطة لكل شهر مورّد؛ آخر قيمة معلَّمة، والمقياس موحد داخل كل خلية",
      cls: "axs-sm-card",
    });
    const smHost = h("div", { class: "axs-sm-host" });
    smCard.body.appendChild(smHost);

    const items = series.keys.map((key) => {
      const s = series.byKey[key];
      const values = measure === "coverage" ? s.coverage : s.values;
      return { key, def: s.def, s, values };
    });

    RH.viz.micro.smallMultiples(smHost, {
      su: ctx.su,
      items,
      cols: 3,
      ariaLabel: "مسارات السيناريوهات الثلاثة عبر الأشهر المورّدة",
      renderCell: (cell, item) => {
        const isCov = measure === "coverage";
        cell.appendChild(h("div", { class: "axs-cell-head" },
          h("span", { class: "axs-cell-name " + item.key }, item.def.label),
          h("span", { class: "axs-cell-rank" }, item.def.note),
        ));
        const sparkHost = h("div", { class: "axs-cell-spark" });
        RH.viz.micro.sparkline(sparkHost, {
          su: ctx.su,
          values: item.values,
          tone: isCov ? "pos" : "neg",
          area: true,
          markLast: true,
          width: 240,
          height: 66,
          fmt: isCov ? fmt.pct : fmt.int,
          ariaLabel: "مسار " + item.def.label + " — " + measureDef().label
            + " من " + honesty.horizon.firstLabel + " إلى "
            + honesty.horizon.lastLabel,
        });
        cell.appendChild(sparkHost);
        const first = isCov ? item.s.coverageFirst : item.s.first;
        const last = isCov ? item.s.coverageLast : item.s.last;
        cell.appendChild(h("div", { class: "axs-cell-ends" },
          h("span", {}, "من " + (isCov ? pctText(first) : bedsText(first))),
          h("span", { class: "axs-cell-to" }, "إلى"),
          h("b", {}, isCov ? pctText(last) : bedsText(last)),
        ));
        const chipHost = h("div", { class: "axs-cell-chiprow" });
        RH.viz.micro.deltaChip(chipHost, {
          value: isCov
            ? (first == null || last == null ? null
              : RH.data.derive.roundHalfUp(last - first, 1))
            : item.s.rise,
          fmt: isCov ? fmt.dec1 : fmt.int,
          positiveIsGood: isCov,
          label: isCov ? "نقطة عبر الأفق" : "سرير عبر الأفق",
          title: "الفارق بين أول شهر مورّد وآخره لهذا السيناريو",
        });
        cell.appendChild(chipHost);
      },
    });

    /* ── الصف السفلي: جدول الأشهر + عمود (الانتشار ثم الوتيرة) ── */
    const lower = h("div", { class: "axs-lower2" });
    page.appendChild(lower);
    const tableHost = h("div", { class: "axs-table-host wide" });
    const sideCol = h("div", { class: "axs-aside" });
    lower.appendChild(tableHost);
    lower.appendChild(sideCol);

    /* ── شريط الانتشار الشهري ── */
    const spreadCard = RH.presenter.layout.card(sideCol, {
      title: "الانتشار الشهري — المتحفظ ناقص المتفائل",
      sub: "اتساع المدى بين أسوأ القراءات وأفضلها شهراً بشهر (نغمة محايدة: "
        + "عدم يقين لا خلل)",
      cls: "axs-spread-card",
    });
    const spreadBars = h("div", { class: "axs-spread-strip" });
    RH.viz.micro.microBars(spreadBars, {
      su: ctx.su,
      ariaLabel: "الانتشار الشهري بين المتحفظ والمتفائل عبر الأشهر المورّدة",
      tone: "neu",
      items: model.spreadSeries(rel).map((r) => ({
        label: r.label, value: r.spread,
      })),
      fmt: fmt.int,
    });
    spreadCard.body.appendChild(spreadBars);
    spreadCard.body.appendChild(h("div", { class: "axs-spread-foot" },
      "من " + bedsText(series.spreadFirst) + " في " + honesty.horizon.firstLabel
      + " إلى " + bedsText(series.spreadLast) + " في " + honesty.horizon.lastLabel
      + " — اتساع " + signedInt(series.widening) + fmt.NBSP + "سرير عبر الأفق."));

    /* ── الوتيرة الشهرية: خطوات كل سيناريو عن مرساة عجز اليوم ──
       الخطوة الأولى تُقاس من العجز المشتق المنشور لا من فراغ، والنص يقولها
       صراحة في كل صف كي لا تُقرأ قفزةَ سيناريو مصطنعة. */
    const horizon = model.horizonModel(rel, der);
    const paceCard = RH.presenter.layout.card(sideCol, {
      title: "وتيرة الاتساع الشهرية",
      sub: "متوسط الخطوة وأكبرها لكل سيناريو — الخطوة الأولى مقيسة من عجز "
        + "اليوم " + fmt.unitAfter(horizon.anchorDeficit, "سرير"),
      cls: "axs-pace-card",
    });
    const paceRows = h("div", { class: "axs-krows" });
    for (const p of horizon.paces) {
      const row = h("div", { class: "axs-krow" },
        h("span", { class: "axs-k" }, p.def.label),
        h("b", { class: "axs-v" },
          p.avgMonthly == null ? "—" : fmt.int(p.avgMonthly)),
        h("span", { class: "axs-krow-sub" },
          p.maxStep && p.maxStep.delta != null
            ? "أكبر خطوة " + signedInt(p.maxStep.delta) + " في " + p.maxStep.label
              + (p.maxStep.fromAnchor ? " (عن عجز اليوم)" : "")
            : "—"),
      );
      paceRows.appendChild(row);
    }
    paceCard.body.appendChild(paceRows);
    noteLine(paceCard.body,
      "المتوسط = (قيمة " + horizon.lastLabel + " − عجز اليوم) ÷ "
      + monthsNoun(horizon.count) + " — قراءة سرعة لا قراءة مسار؛ الخطوات "
      + "الفعلية شهراً بشهر في جدول الأشهر المجاور.", "src");

    /* ── جدول الأشهر المورّدة كاملاً (بخطوة الأساسي الشهرية) ── */
    const baseSteps = horizon.paceByKey.base ? horizon.paceByKey.base.steps : [];
    const rowsData = series.months.map((mo, i) => ({
      i,
      iso: mo.iso,
      label: mo.label,
      conservative: series.byKey.conservative.values[i],
      base: series.byKey.base.values[i],
      optimistic: series.byKey.optimistic.values[i],
      coverageBase: series.byKey.base.coverage[i],
      spread: series.spread[i],
      baseStep: baseSteps[i] ? baseSteps[i].delta : null,
      baseStepFromAnchor: !!(baseSteps[i] && baseSteps[i].fromAnchor),
    }));

    RH.presenter.layout.tableCard(tableHost, {
      title: "الأشهر المورّدة كاملة — " + monthsNoun(series.count),
      columns: [
        {
          key: "label", label: "الشهر",
          render: (r) => button("axs-jump", r.label,
            () => {
              pendingFocus = null;
              ctx.update({ m: r.i === 0 ? null : String(r.i), page: null });
            },
            {
              aria: "فتح المقارنة التفاعلية على شهر " + r.label,
              title: "الانتقال إلى صفحة المقارنة على هذا الشهر",
            }),
        },
        {
          key: "conservative", label: "المتحفظ", align: "end",
          render: (r) => h("b", { class: "axs-t-num neg" }, fmt.int(r.conservative)),
        },
        {
          key: "base", label: "الأساسي", align: "end",
          render: (r) => h("b", { class: "axs-t-num neg" }, fmt.int(r.base)),
        },
        {
          key: "optimistic", label: "المتفائل", align: "end",
          render: (r) => h("b", { class: "axs-t-num neg" }, fmt.int(r.optimistic)),
        },
        {
          key: "spread", label: "الانتشار", align: "end",
          render: (r) => h("span", { class: "axs-t-num" }, fmt.int(r.spread)),
        },
        {
          key: "baseStep", label: "خطوة الأساسي", align: "end",
          render: (r) => deltaCell(r.baseStep, {
            label: "سرير",
            title: r.baseStepFromAnchor
              ? "الخطوة الأولى مقيسة من العجز القائم اليوم"
              : "الفارق عن الشهر المورّد السابق",
          }),
        },
        {
          key: "coverageBase", label: "تغطية الأساسي المكافئة", align: "end",
          render: (r) => h("b", { class: "axs-t-num pos" }, pctText(r.coverageBase)),
        },
      ],
      rows: rowsData,
      note: "القيم كما وردت في release.scenarios.rows؛ الانتشار والخطوة "
        + "والتغطية المكافئة اشتقاقات معلنة (المقام: الطلب الكلي المعتمد "
        + fmt.unitAfter(anchor.demand, "سرير")
        + "، وخطوة أول شهر مقيسة من عجز اليوم). " + honesty.statusLabel + ".",
    });

    noteLine(page,
      "لا تُعرض في هذه الصفحة قيمة لشهر غير مورّد: المسارات نقاط على الأشهر "
      + "العشرة كما وردت، والخط بينها وصلٌ بصري لا قيمة محسوبة — ولا امتداد "
      + "قبل " + honesty.horizon.firstLabel + " ولا بعد " + honesty.horizon.lastLabel
      + ".", "src");
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ج) الصفحة 3 — لوحة الصدق
     ──────────────────────────────────────────────────────────────────────
     نص التحفظ كاملاً ببطاقة layout.pendingCard، حالة الاعتماد، ما يلزم
     لاعتمادها مستخرَجاً من نص التحفظ نفسه، وبيان أن الترجمة إلى تغطية
     اشتقاق حسابي تعريفي لا تنبؤ جديد — ثم فحوص الاتساق وأصل كل رقم.
     ══════════════════════════════════════════════════════════════════════ */
  function pageHonesty(el, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const honesty = model.honestyModel(rel);
    const anchor = model.anchorModel(rel, der);
    const checks = model.validateSupplied(rel);
    const prov = model.provenanceModel(rel, der);

    const page = h("div", { class: "axs-page axs-p3" });
    el.appendChild(page);

    if (!honesty) {
      RH.presenter.layout.pendingCard(page, {
        label: "لا كتلة سيناريوهات في هذا الإصدار",
        note: "لوحة الصدق تعرض ما في الإصدار حصراً.",
      });
      return;
    }

    /* ── التحفظ الحرفي كاملاً ── */
    RH.presenter.layout.pendingCard(page, {
      label: honesty.statusLabel,
      note: honesty.caveat,
    });

    const grid = h("div", { class: "axs-honest-grid" });
    page.appendChild(grid);

    /* ── العمود 1: الحالة والمتطلبات ── */
    const colA = h("div", { class: "axs-col" });
    grid.appendChild(colA);

    const stateCard = RH.presenter.layout.card(colA, {
      title: "حالة الاعتماد كما وردت في الإصدار",
      sub: "لا تأويل ولا ترقية: المعرف الخام ووسمه المعروض جنباً إلى جنب",
    });
    const stateRows = h("div", { class: "axs-krows" });
    function kv(k, v, tone) {
      stateRows.appendChild(h("div", { class: "axs-krow" + (tone ? " " + tone : "") },
        h("span", { class: "axs-k" }, k),
        h("b", { class: "axs-v" }, v),
      ));
    }
    kv("المعرف الخام", fmt.iso(String(honesty.status || "—")), "gold");
    kv("الوسم المعروض", honesty.statusLabel, "gold");
    kv("عنوان الكتلة", honesty.title || "—");
    kv("وحدة القياس", honesty.unit);
    kv("عدد السيناريوهات",
      fmt.countNoun(honesty.scenarioCount, LOCAL_NOUNS.scenario));
    kv("أفق التوقع المورّد",
      honesty.horizon.firstLabel + " – " + honesty.horizon.lastLabel);
    kv("عدد الأشهر المورّدة", monthsNoun(honesty.horizon.count));
    stateCard.body.appendChild(stateRows);

    const reqCard = RH.presenter.layout.card(colA, {
      title: "ما يلزم لاعتماد هذه السيناريوهات",
      sub: "مستخرَج حرفياً من نص التحفظ نفسه — لا شرط من عندنا",
    });
    if (honesty.requirements.length) {
      const list = h("ul", { class: "axs-req" });
      for (const r of honesty.requirements) {
        list.appendChild(h("li", { class: "axs-req-item" },
          h("span", { class: "axs-req-dot", "aria-hidden": "true" }),
          h("span", {}, r),
        ));
      }
      reqCard.body.appendChild(list);
      noteLine(reqCard.body,
        "الجملة المصدر في التحفظ: «" + honesty.requirementsClause + "».", "src");
    } else {
      RH.presenter.layout.pendingCard(reqCard.body, {
        label: "لا شروط اعتماد منصوصة في نص التحفظ",
        note: "لا تُستنبط شروط غير مكتوبة — تُعرض هذه الحالة كما هي.",
      });
    }

    /* ── العمود 2: طبيعة الترجمة + فحوص الاتساق ── */
    const colB = h("div", { class: "axs-col" });
    grid.appendChild(colB);

    const natureCard = RH.presenter.layout.card(colB, {
      title: "طبيعة الترجمة إلى نسبة تغطية",
      sub: "اشتقاق حسابي تعريفي من الطلب الكلي المعتمد — ليس تنبؤاً جديداً",
    });
    natureCard.body.appendChild(h("p", { class: "axs-para" },
      "كل نسبة تغطية معروضة في هذا الملحق ناتج قسمة واحدة معلنة: الطاقة "
      + "المكافئة (الطلب الكلي ناقص العجز المورّد) على الطلب الكلي المعتمد. "
      + "هي لا تضيف معلومة إلى السيناريو المورّد ولا تصححه ولا تمدّه — تعيد "
      + "التعبير عن رقمه بوحدة أقرب إلى قرار السياسة."));
    const proof = h("div", { class: "axs-krows" });
    proof.appendChild(h("div", { class: "axs-krow" },
      h("span", { class: "axs-k" }, "برهان التعريف على قيمة منشورة"),
      h("b", { class: "axs-v" },
        "عجز اليوم " + fmt.int(anchor.deficit) + " ← "
        + pctText(anchor.coverageFromDeficit)),
    ));
    proof.appendChild(h("div", { class: "axs-krow" },
      h("span", { class: "axs-k" }, "نسبة التغطية المشتقة المنشورة"),
      h("b", { class: "axs-v pos" }, pctText(anchor.coverage)),
    ));
    proof.appendChild(h("div", { class: "axs-krow" },
      h("span", { class: "axs-k" }, "الصيغة المعتمدة في الإصدار"),
      h("b", { class: "axs-v ltr" }, String(anchor.coverageFormula || "—")),
    ));
    natureCard.body.appendChild(proof);
    noteLine(natureCard.body,
      "تطبيق الترجمة على العجز المنشور يعيد إنتاج نسبة التغطية المنشورة "
      + "حرفياً — وهو ما يثبت أنها إعادة تعبير لا تقدير جديد (مثبت أيضاً "
      + "باختبار وحدة).", "src");

    /* ── مقارنة طرفَي الأفق: أول شهر مورّد مقابل آخره ── */
    const horizon = model.horizonModel(rel, der);
    if (horizon && horizon.compare) {
      const hCard = RH.presenter.layout.card(colB, {
        title: "طرفا الأفق المورّد",
        sub: horizon.firstLabel + " مقابل " + horizon.lastLabel
          + " — فارق مباشر بين قيمتين مورّدتين",
      });
      const hRows = h("div", { class: "axs-krows" });
      for (const r of horizon.compare.rows) {
        const line = h("div", { class: "axs-krow" },
          h("span", { class: "axs-k" }, r.label),
          h("b", { class: "axs-v" },
            fmt.int(r.from) + " ← " + fmt.int(r.to)),
          h("span", { class: "axs-krow-sub" },
            signedPts(r.dCoveragePts) + " في التغطية المكافئة"),
        );
        RH.viz.micro.deltaChip(line, {
          value: r.dDeficit,
          fmt: fmt.int,
          positiveIsGood: false,
          label: "سرير",
          title: "قيمة " + horizon.lastLabel + " ناقص قيمة " + horizon.firstLabel,
        });
        hRows.appendChild(line);
      }
      hCard.body.appendChild(hRows);
      noteLine(hCard.body,
        "الفارق بين شهرين مورّدين لا يمتد خارجهما: لا معدل نمو مستنبط ولا "
        + "إسقاط لما بعد " + horizon.lastLabel + ".", "src");
    }

    /* ── العمود 3: فحوص الاتساق ── */
    const colC = h("div", { class: "axs-col" });
    grid.appendChild(colC);

    const checkCard = RH.presenter.layout.card(colC, {
      title: "فحوص اتساق على البيانات المورّدة",
      sub: fmt.countNoun(checks.length, LOCAL_NOUNS.check) + " تُعرض بنتيجتها "
        + "كما هي — لا تُخفى نتيجة ولا تُسقط اللوحة عند إخفاق",
    });
    const checkList = h("div", { class: "axs-checks" });
    let passed = 0;
    for (const c of checks) {
      if (c.ok) passed++;
      checkList.appendChild(h("div", { class: "axs-check" + (c.ok ? " ok" : " bad") },
        h("span", { class: "axs-check-dot", "aria-hidden": "true" }),
        h("span", { class: "axs-check-label" }, c.label),
        h("span", { class: "axs-check-detail" }, c.detail),
        h("span", { class: "axs-check-state" }, c.ok ? "مجتاز" : "غير مجتاز"),
      ));
    }
    checkCard.body.appendChild(checkList);
    noteLine(checkCard.body,
      "المجتاز " + fmt.int(passed) + " من " + fmt.int(checks.length)
      + " — هذه قراءة إضافية للمستكشف، وبوابات النشر الرسمية في "
      + "محرك التحقق لا هنا.", "src");

    /* ── الصف السفلي: جدول أصل كل رقم بعرض الصفحة ── */
    const provHost = h("div", { class: "axs-table-host wide axs-prov" });
    page.appendChild(provHost);
    RH.presenter.layout.tableCard(provHost, {
      title: "أصل كل رقم يظهر في هذا الملحق",
      columns: [
        { key: "label", label: "القيمة" },
        {
          key: "value", label: "المقدار", align: "end",
          render: (r) => h("b", { class: "axs-t-num" },
            r.unit === "٪" ? pctText(r.value)
              : (r.unit ? fmt.unitAfter(r.value, r.unit) : fmt.int(r.value))),
        },
        {
          key: "kind", label: "النوع",
          render: (r) => h("span", { class: "axs-kind " + r.kind },
            r.kind === "raw" ? "خام" : r.kind === "derived" ? "مشتق" : "مورّد"),
        },
        {
          key: "origin", label: "المصدر أو الصيغة",
          render: (r) => h("span", { class: "axs-origin" }, r.origin),
        },
      ],
      rows: prov,
      note: "هوية الإصدار " + fmt.iso(String(rel.release.id))
        + " — نُشر في " + fmt.date(String(rel.release.published_at).slice(0, 10))
        + "، وتاريخ الحساب " + fmt.date(anchor.calculationDate)
        + "، والبيانات حتى " + anchor.asOf + ".",
    });

    /* ── العمود 4: قواعد العرض المطبقة (إفصاح عن سلوك الأداة نفسها) ── */
    const colD = h("div", { class: "axs-col" });
    grid.appendChild(colD);

    const rulesCard = RH.presenter.layout.card(colD, {
      title: "قواعد العرض المطبَّقة في هذا المستكشف",
      sub: "إفصاح عن سلوك الأداة ذاتها لا عن البيانات",
      cls: "axs-rules-card",
    });
    const rules = h("ul", { class: "axs-rules" });
    for (const line of [
      "لا سيناريو رابع: تُقرأ ثلاثة مفاتيح فقط من كل صف مورّد، وأي مفتاح "
      + "آخر لا يُعرض ولا يُخترع.",
      "لا استيفاء: المنزلق يقف على فهارس الأشهر المورّدة الصحيحة، ولا قيمة "
      + "بين شهرين ولا خارج الأفق.",
      "لا قيمة بلا تحفظها: نص التحفظ ووسم الحالة يظهران في الصفحات الثلاث، "
      + "وفي حاشية كل جدول يعرض قيم سيناريو.",
      "لا تقريب صامت: نسب التغطية بمنزلة عشرية واحدة بتقريب نصف-لأعلى نفسه "
      + "المعتمد في محرك الاشتقاق، وفوارق النقاط محسوبة على القيم المعروضة.",
      "لا رقم بلا مصدر: الجدول أعلاه يسمّي ورقة كل قيمة خام ومرساتها، وصيغة "
      + "كل مشتقة وإصدارها.",
    ]) {
      rules.appendChild(h("li", { class: "axs-rule" },
        h("span", { class: "axs-rule-dot", "aria-hidden": "true" }),
        h("span", {}, line),
      ));
    }
    rulesCard.body.appendChild(rules);
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-د) التسجيل — يرث من ax-shell هيكل الصفحات والعودة السياقية ومفاتيح
        التقليب. تسجيلٌ مشروط بحضور الهيكل كي يُحمَّل الملف في بيئة اختبار
        الوحدة بنموذجه النقي وحده (عقد §0 «قاعدة قابلية الاختبار»).
     ══════════════════════════════════════════════════════════════════════ */
  if (RH.presenter && RH.presenter.ax
      && typeof RH.presenter.ax.register === "function") {
    RH.presenter.ax.register({
      id: "scenarios",
      kicker: "ملحق استكشافي",
      title: "مستكشف السيناريوهات",
      returnLabel: (ret) => {
        const title = ret && ret.id ? SECTION_TITLES[ret.id] : null;
        return title ? "العودة إلى " + title : "العودة إلى العرض";
      },
      pages: () => [
        { name: "المقارنة التفاعلية", build: pageCompare },
        { name: "شريط الحساسية", build: pageSensitivity },
        { name: "لوحة الصدق", build: pageHonesty },
      ],
    });
  }
})();
