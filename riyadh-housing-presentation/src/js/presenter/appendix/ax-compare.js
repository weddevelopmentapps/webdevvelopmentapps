/* ════════════════════════════════════════════════════════════════════════════
   ax-compare.js — مركز المقارنة القطاعية (ملحق `compare`)
   بادئة الأنماط `cmp-` في src/styles/compare.css · الفضاء RH.explore.compare
   ────────────────────────────────────────────────────────────────────────────
   لماذا هذا الملحق موجود أصلاً:

     القطاعات الخمسة تظهر في ست لوحات مختلفة (الطلب، التراخيص، الرقابة،
     الخريطة، الملخص، التوقعات) — لكن كل لوحة تعرضها من زاوية مقياس واحد.
     السؤال الذي يطرحه الأمين في القاعة ولا تجيبه أي لوحة منفردة هو:
     «أين يقف كل قطاع من **كل** المقاييس معاً، وأين الخلل بين ما يستحقه
     القطاع من طاقة وما يناله فعلاً؟». هذا الملحق هو ذلك الجواب: مصفوفة
     واحدة تضع أربعة وعشرين مؤشراً × خمسة قطاعات + عمود المدينة في شاشة
     واحدة، ثم بطاقة قطاع كاملة، ثم تحليل الفجوة والتركّز، ثم — وهو الأهم —
     صفحة تُثبت حيّاً أن مجاميع القطاعات تطابق الإجماليات المنشورة.

   ما تفعله هذه الوحدة بالضبط:

     ▸ **لا رقم جديد**: كل قيمة إمّا حقل خام في `release.sectors[i]`، أو
       مشتق منشور في `derived.sector[id]`، أو **اشتقاق حسابي تعريفي** من
       هذين المصدرين حصراً (نسبة، حصة، متوسط) — والاشتقاق التعريفي يحمل
       صيغته الحرفية أينما ظهر، ويُعلَن نوعه في المصفوفة وفي صفحة الإسناد.
     ▸ **الترتيب مسمّى دائماً**: أي ترتيب هو ضمن القطاعات الخمسة وباسم
       المقياس المرتَّب — مرآة قاعدة `neighbourhoods.ranking_note` المعتمدة.
       المؤشر بلا اتجاه تحسّن معرَّف يُرتَّب تنازلياً بالقيمة **ويقول ذلك**.
     ▸ **الحصة لا تُفرض على النِسَب**: عرض «الحصة من المدينة» يُعطَّل بصدق
       على المؤشرات النسبية (لا تُجمع النِسَب) بدل توليد رقم بلا معنى.
     ▸ **بوابة المطابقة حيّة**: صفحة كاملة تجمع القطاعات الخمسة لكل مقياس
       خام وتقارنه بالمقياس المنشور في `release.metrics` — النتيجة محسوبة
       وقت العرض لا ثابتاً مكتوباً، فإن انحرف إصدارٌ مستقبلي ظهر الانحراف.
     ▸ **حدود التفكيك معلنة**: ما لا يقبل التوزيع القطاعي في هذا الإصدار
       (الامتثال، الإشغال، أنواع الإيواء، الأنشطة، الياقات، السيناريوهات،
       المبادرات، المؤشرات) يُسرَد بأسمائه وبسبب امتناعه — لا صمت ولا
       تقدير بديل.

   قواعد ملزمة مطبَّقة حرفياً في هذا الملف:
   • كل رقم يمر عبر `RH.core.fmt` — لا تنسيق يدوي ولا فاصلة مكتوبة.
   • منظومة المعنى مقفلة: مرجاني للعجز والمخالفات حصراً، ذهبي للمستهدف
     وخط الأساس ووسوم الاعتماد حصراً، أخضر للطاقة والفعل، رملي للطلب،
     أزرق للفئة الثانوية، محايد لما لا اتجاه له.
   • وسم منهجية الامتثال ‎81.6٪ يسافر مع الرقم أينما ظهر — وهو هنا يظهر
     في صفحة الحدود بوصفه مقياساً **غير قابل** للتفكيك القطاعي.
   • وسم العينة (`meta.sample_label`) يلازم كل صف حي في بطاقة القطاع.
   • إسناد حدود الخريطة وإخلاء `meta.map_disclaimer` يلازمان الخريطة المصغرة.
   • لوحة المفاتيح كاملة: تبويبات `role="tab"` بالأسهم وHome/End، ومصفوفة
     بتنقّل ثنائي الاتجاه (roving tabindex)، وكلها داخل `data-interactive`
     فلا يبتلع جهاز التقديم ضغطاتها (عقد §8).
   • الحالة تصمد: المؤشر والقطاع والعرض والعائلة والترتيب تُكتب في معاملات
     المسار **مؤجَّلة ومجمّعة** (مرآة نمط الأطلس) فتعود كما تُركت.
   • التنظيف: كل مؤقت يُلغى في `ctx.onTeardown`، ولا مستمع عام واحد.
   • `prefers-reduced-motion`: لا حركة في الجافاسكربت؛ انتقالات compare.css
     تُصفَّر عند طلب التقليل.

   قابلية الاختبار (عقد التوسعة §0): القسم 1 نموذج نقي بالكامل — يُعرَّف وقت
   التحميل دون لمس `document`/`window`، ويُختبر في
   `tests/unit/compare-model.test.mjs`. تسجيل الملحق في القسم 2 يتخطى نفسه
   بغياب `RH.presenter.ax` (بيئة الوحدة) فلا يسقط التحميل.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════════════════════════════════════════════════════════════════
   القسم 1) النموذج النقي — RH.explore.compare
   لا DOM ولا وصول عام: دوال تأخذ (release, derived, geo) وتعيد كائنات عادية.
   ══════════════════════════════════════════════════════════════════════════ */
RH.explore.compare = (function () {
  const fmt = RH.core.fmt;

  /* ── 1.0) مفردات مقفلة ─────────────────────────────────────────────── */

  /** الترتيب القانوني للقطاعات — مطابق لـ geoutils وgeomap والإصدار */
  const SECTOR_ORDER = Object.freeze(["north", "east", "center", "west", "south"]);

  /** عائلات المؤشرات: تبويبات الترشيح في المصفوفة */
  const FAMILIES = Object.freeze([
    Object.freeze({
      id: "capacity", label: "الطلب والطاقة",
      note: "الطلب التقديري والطاقة المرخصة وما بينهما من عجز وتغطية",
    }),
    Object.freeze({
      id: "licensing", label: "التراخيص",
      note: "رخص البناء والرخص التشغيلية وكثافة الأسرّة خلفها",
    }),
    Object.freeze({
      id: "control", label: "الرقابة الميدانية",
      note: "المراقبون والزيارات والمخالفات وقرارات الإغلاق ومعدلاتها",
    }),
    Object.freeze({
      id: "geo", label: "الامتداد الجغرافي",
      note: "أحياء القطاع ونقاط التركّز الرقابي داخله",
    }),
  ]);

  /** معرفات العائلات + «الكل» — القائمة القانونية لمعامل المسار `f` */
  const FAMILY_IDS = Object.freeze(["all"].concat(FAMILIES.map((f) => f.id)));

  /** أوضاع عرض خلايا المصفوفة */
  const VIEW_MODES = Object.freeze([
    Object.freeze({
      id: "value", label: "القيمة",
      note: "القيمة المنشورة أو المشتقة كما هي، مع شريط نسبتها إلى أعلى قطاع",
    }),
    Object.freeze({
      id: "share", label: "الحصة من المدينة",
      note: "حصة القطاع من مجموع القطاعات الخمسة — معطَّلة على المؤشرات النسبية",
    }),
    Object.freeze({
      id: "deviation", label: "الانحراف عن المتوسط",
      note: "الفرق عن متوسط القطاعات الخمسة لهذا المؤشر بوحدته نفسها",
    }),
    Object.freeze({
      id: "rank", label: "الترتيب",
      note: "موقع القطاع بين الخمسة في هذا المقياس تحديداً",
    }),
  ]);

  const VIEW_IDS = Object.freeze(VIEW_MODES.map((v) => v.id));

  /** أنواع أصل القيمة — تظهر وسماً في المصفوفة وصفحة الإسناد */
  const KIND_LABELS = Object.freeze({
    raw: "خام",
    derived: "مشتق منشور",
    definitional: "اشتقاق تعريفي",
    geo: "من طبقة الحدود",
  });

  const KIND_NOTES = Object.freeze({
    raw: "قيمة قطاعية خام من ورقة المصدر — تدخل بوابة مطابقة المجاميع",
    derived: "مشتق منشور في الإصدار — الصيغة وإصدارها مثبتان في الإصدار نفسه",
    definitional: "اشتقاق حسابي تعريفي من قيم الإصدار — إعادة تعبير لا تقدير جديد",
    geo: "عدّ مباشر من طبقة حدود الأحياء المرفقة — لا تقدير",
  });

  /** اتجاه التحسّن: نص صريح يرافق كل ترتيب فلا يُقرأ الترتيب على عمياه */
  const BETTER_LABELS = Object.freeze({
    high: "الأعلى أفضل",
    low: "الأدنى أفضل",
    none: "لا اتجاه تحسّن معرَّف — الترتيب تنازلي بالقيمة",
  });

  /* ── 1.1) أدوات حسابية آمنة ────────────────────────────────────────── */

  const isNum = (v) => typeof v === "number" && Number.isFinite(v);

  /** تقريب نصف-لأعلى حتمي — مرآة derive.roundHalfUp (المصدر ذاته) */
  function round1(v, places) {
    if (!isNum(v)) return null;
    const p = places == null ? 1 : places;
    const f = Math.pow(10, p);
    return Math.round((v * f) + (v >= 0 ? 1e-9 : -1e-9)) / f;
  }

  /** قسمة آمنة: مقام صفري أو غير رقمي → null (لا صفر مختلق ولا لانهاية) */
  function div(num, den) {
    if (!isNum(num) || !isNum(den) || den === 0) return null;
    return num / den;
  }

  /** نسبة مئوية بمنزلة واحدة أو null */
  function pct(num, den, places) {
    const q = div(num, den);
    return q == null ? null : round1(q * 100, places == null ? 1 : places);
  }

  /** جمع آمن يتجاهل الغياب ويعيد null إذا لم تُجمع قيمة واحدة */
  function sumOf(list) {
    let acc = 0;
    let seen = 0;
    for (const v of list) { if (isNum(v)) { acc += v; seen += 1; } }
    return seen ? acc : null;
  }

  /* ── 1.2) سياق الحساب: يُبنى مرة ويُمرَّر لكل دوال القيمة ──────────── */

  /**
   * يبني سياق الحساب من الإصدار ومشتقاته وطبقة الحدود.
   * geo اختياري: بغيابه تعود مؤشرات العائلة الجغرافية بـ null بصدق
   * (والواجهة تعرض «—» وسبب الغياب) بدل أن تختلق أعداداً.
   */
  function context(release, derived, geo) {
    const rows = [];
    const byId = Object.create(null);
    for (const id of SECTOR_ORDER) {
      const row = (release && release.sectors || []).find((s) => s.id === id) || null;
      if (!row) continue;
      rows.push(row);
      byId[id] = row;
    }
    const sd = (derived && derived.sector) || Object.create(null);

    /* مجاميع القطاعات — تُحسب مرة وتخدم الحصص والمطابقة معاً */
    const sums = {
      demand: sumOf(rows.map((r) => r.demand)),
      beds: sumOf(rows.map((r) => r.beds)),
      building: sumOf(rows.map((r) => r.building)),
      operational: sumOf(rows.map((r) => r.operational)),
      monitors: sumOf(rows.map((r) => r.monitors)),
      visits: sumOf(rows.map((r) => r.visits)),
      violations: sumOf(rows.map((r) => r.violations)),
      closures: sumOf(rows.map((r) => r.closures)),
      deficit: sumOf(rows.map((r) => (sd[r.id] ? sd[r.id].deficit_beds : null))),
    };

    /* أعداد الأحياء ونقاط التركّز لكل قطاع — من طبقة الحدود حصراً */
    let districts = null;
    let hotspots = null;
    if (geo && geo.sectors) {
      districts = Object.create(null);
      for (const id of SECTOR_ORDER) {
        districts[id] = (geo.sectors[id] || []).length;
      }
    }
    if (geo && Array.isArray(geo.hotspots)) {
      hotspots = Object.create(null);
      for (const id of SECTOR_ORDER) hotspots[id] = 0;
      for (const hs of geo.hotspots) {
        if (hs && hs.sector in hotspots) hotspots[hs.sector] += 1;
      }
    }

    return {
      release: release || null,
      derived: derived || null,
      geo: geo || null,
      rows, byId, sd, sums, districts, hotspots,
      hasGeo: !!(geo && geo.sectors),
    };
  }

  /* ── 1.3) كتالوج المؤشرات ───────────────────────────────────────────
     كل مدخل يحمل: التسمية والوحدة والعائلة والنغمة الدلالية ونوع الأصل
     وصيغته ومرساته، ودالة القيمة القطاعية، ودالة قيمة المدينة، وقاعدة
     صلاحية عرض الحصة. الترتيب هنا هو ترتيب صفوف المصفوفة.
     ─────────────────────────────────────────────────────────────────── */

  /** مرساة مقياس منشور: «ورقة!خلية — اسم المصدر» أو «مشتق (إصدار الصيغة)» */
  function metricOrigin(release, metricId) {
    const rel = release || {};
    const m = (rel.metrics && rel.metrics[metricId])
      || (rel.derived && rel.derived[metricId]) || null;
    if (!m) return "—";
    if (m.kind === "raw") {
      const src = rel.sources && rel.sources[0] ? rel.sources[0].name : "";
      return String(m.sheet || "") + "!" + String(m.anchor || "")
        + (src ? " — " + src : "");
    }
    return "مشتق (" + String(m.formula_version || "fv1") + ")";
  }

  const INDICATORS = Object.freeze([
    /* ═════════ عائلة: الطلب والطاقة ═════════ */
    Object.freeze({
      id: "demand",
      label: "الطلب التقديري على الأسرّة",
      short: "الطلب",
      unit: "سرير", nounKey: "bed", fmtKey: "int",
      family: "capacity", tone: "demand", kind: "raw",
      additive: true, shareable: true, better: null,
      cityMetric: "total_demand",
      formula: "قيمة قطاعية خام من ورقة الطلب",
      value: (C, id) => (C.byId[id] ? C.byId[id].demand : null),
      city: (C) => (C.release && C.release.metrics.total_demand
        ? C.release.metrics.total_demand.value : C.sums.demand),
    }),
    Object.freeze({
      id: "beds",
      label: "الطاقة الاستيعابية المرخصة",
      short: "الطاقة",
      unit: "سرير", nounKey: "bed", fmtKey: "int",
      family: "capacity", tone: "pos", kind: "raw",
      additive: true, shareable: true, better: "high",
      cityMetric: "licensed_beds",
      formula: "قيمة قطاعية خام من ورقة التراخيص",
      value: (C, id) => (C.byId[id] ? C.byId[id].beds : null),
      city: (C) => (C.release && C.release.metrics.licensed_beds
        ? C.release.metrics.licensed_beds.value : C.sums.beds),
    }),
    Object.freeze({
      id: "deficit_beds",
      label: "عجز الأسرّة",
      short: "العجز",
      unit: "سرير", nounKey: "bed", fmtKey: "int",
      family: "capacity", tone: "neg", kind: "derived",
      additive: true, shareable: true, better: "low",
      cityMetric: "deficit_beds",
      formula: "max(الطلب − الطاقة المرخصة، 0)",
      value: (C, id) => (C.sd[id] ? C.sd[id].deficit_beds : null),
      city: (C) => (C.derived && isNum(C.derived.deficit_beds)
        ? C.derived.deficit_beds : C.sums.deficit),
    }),
    Object.freeze({
      id: "coverage_pct",
      label: "نسبة تغطية الطلب",
      short: "التغطية",
      unit: "٪", fmtKey: "pct",
      family: "capacity", tone: "pos", kind: "derived",
      additive: false, shareable: false, better: "high",
      cityMetric: "coverage_pct",
      shareNote: "نسبة لا تُجمع — الحصة بلا معنى هنا",
      formula: "الطاقة المرخصة ÷ الطلب × 100",
      value: (C, id) => (C.sd[id] ? C.sd[id].coverage_pct : null),
      city: (C) => (C.derived && isNum(C.derived.coverage_pct)
        ? C.derived.coverage_pct : pct(C.sums.beds, C.sums.demand)),
    }),
    Object.freeze({
      id: "demand_share_pct",
      label: "حصة القطاع من طلب المدينة",
      short: "حصة الطلب",
      unit: "٪", fmtKey: "pct",
      family: "capacity", tone: "demand", kind: "derived",
      additive: false, shareable: false, better: null,
      shareNote: "المؤشر نفسه حصة — عرض الحصة يكرره",
      formula: "طلب القطاع ÷ إجمالي الطلب × 100",
      value: (C, id) => (C.sd[id] ? C.sd[id].demand_share_pct : null),
      city: () => 100,
      cityBasis: "identity",
    }),
    Object.freeze({
      id: "beds_share_pct",
      label: "حصة القطاع من الطاقة المرخصة",
      short: "حصة الطاقة",
      unit: "٪", fmtKey: "pct",
      family: "capacity", tone: "pos", kind: "definitional",
      additive: false, shareable: false, better: null,
      shareNote: "المؤشر نفسه حصة — عرض الحصة يكرره",
      formula: "طاقة القطاع ÷ مجموع طاقة القطاعات × 100",
      value: (C, id) => pct(C.byId[id] ? C.byId[id].beds : null, C.sums.beds),
      city: () => 100,
      cityBasis: "identity",
    }),
    Object.freeze({
      id: "deficit_share_pct",
      label: "حصة القطاع من عجز المدينة",
      short: "حصة العجز",
      unit: "٪", fmtKey: "pct",
      family: "capacity", tone: "neg", kind: "definitional",
      additive: false, shareable: false, better: "low",
      shareNote: "المؤشر نفسه حصة — عرض الحصة يكرره",
      formula: "عجز القطاع ÷ مجموع عجز القطاعات × 100",
      value: (C, id) => pct(C.sd[id] ? C.sd[id].deficit_beds : null, C.sums.deficit),
      city: () => 100,
      cityBasis: "identity",
    }),

    /* ═════════ عائلة: التراخيص ═════════ */
    Object.freeze({
      id: "building",
      label: "رخص البناء",
      short: "رخص البناء",
      unit: "رخصة", nounKey: "licence", fmtKey: "int",
      family: "licensing", tone: "pos", kind: "raw",
      additive: true, shareable: true, better: "high",
      cityMetric: "current_building",
      formula: "قيمة قطاعية خام من ورقة التراخيص",
      value: (C, id) => (C.byId[id] ? C.byId[id].building : null),
      city: (C) => (C.release && C.release.metrics.current_building
        ? C.release.metrics.current_building.value : C.sums.building),
    }),
    Object.freeze({
      id: "operational",
      label: "الرخص التشغيلية",
      short: "تشغيلية",
      unit: "رخصة", nounKey: "licence", fmtKey: "int",
      family: "licensing", tone: "pos", kind: "raw",
      additive: true, shareable: true, better: "high",
      cityMetric: "current_operational",
      formula: "قيمة قطاعية خام من ورقة التراخيص",
      value: (C, id) => (C.byId[id] ? C.byId[id].operational : null),
      city: (C) => (C.release && C.release.metrics.current_operational
        ? C.release.metrics.current_operational.value : C.sums.operational),
    }),
    Object.freeze({
      id: "licences_total",
      label: "إجمالي الرخص (بناء + تشغيلية)",
      short: "إجمالي الرخص",
      unit: "رخصة", nounKey: "licence", fmtKey: "int",
      family: "licensing", tone: "pos", kind: "definitional",
      additive: true, shareable: true, better: "high",
      formula: "رخص البناء + الرخص التشغيلية",
      note: "مجموع فئتين مختلفتي الطور — يُقرأ حجم نشاط ترخيصي لا طاقة قائمة",
      value: (C, id) => {
        const r = C.byId[id];
        if (!r || !isNum(r.building) || !isNum(r.operational)) return null;
        return r.building + r.operational;
      },
      city: (C) => sumOf([C.sums.building, C.sums.operational]),
    }),
    Object.freeze({
      id: "operational_share_pct",
      label: "حصة القطاع من الرخص التشغيلية",
      short: "حصة التشغيلية",
      unit: "٪", fmtKey: "pct",
      family: "licensing", tone: "pos", kind: "definitional",
      additive: false, shareable: false, better: null,
      shareNote: "المؤشر نفسه حصة — عرض الحصة يكرره",
      formula: "الرخص التشغيلية للقطاع ÷ مجموعها في القطاعات × 100",
      value: (C, id) => pct(C.byId[id] ? C.byId[id].operational : null, C.sums.operational),
      city: () => 100,
      cityBasis: "identity",
    }),
    Object.freeze({
      id: "beds_per_operational",
      label: "متوسط الأسرّة لكل رخصة تشغيلية",
      short: "أسرّة/تشغيلية",
      unit: "سرير", nounKey: "bed", fmtKey: "int",
      family: "licensing", tone: "neu", kind: "definitional",
      additive: false, shareable: false, better: null,
      shareNote: "متوسط لا يُجمع — الحصة بلا معنى هنا",
      formula: "طاقة القطاع ÷ عدد رخصه التشغيلية",
      note: "متوسط حسابي لا حجم منشأة نموذجية — التوزيع داخل القطاع غير منشور",
      value: (C, id) => {
        const r = C.byId[id];
        const q = r ? div(r.beds, r.operational) : null;
        return q == null ? null : Math.round(q);
      },
      city: (C) => {
        const q = div(C.sums.beds, C.sums.operational);
        return q == null ? null : Math.round(q);
      },
      cityBasis: "ratio",
    }),

    /* ═════════ عائلة: الرقابة الميدانية ═════════ */
    Object.freeze({
      id: "monitors",
      label: "المراقبون الميدانيون",
      short: "المراقبون",
      unit: "مراقب", nounKey: "monitor", fmtKey: "int",
      family: "control", tone: "pos", kind: "raw",
      additive: true, shareable: true, better: "high",
      cityMetric: "total_monitors",
      formula: "قيمة قطاعية خام من ورقة الرقابة",
      value: (C, id) => (C.byId[id] ? C.byId[id].monitors : null),
      city: (C) => (C.release && C.release.metrics.total_monitors
        ? C.release.metrics.total_monitors.value : C.sums.monitors),
    }),
    Object.freeze({
      id: "visits",
      label: "الزيارات الميدانية",
      short: "الزيارات",
      unit: "زيارة", nounKey: "visit", fmtKey: "int",
      family: "control", tone: "pos", kind: "raw",
      additive: true, shareable: true, better: "high",
      cityMetric: "total_visits",
      formula: "قيمة قطاعية خام من ورقة الرقابة",
      value: (C, id) => (C.byId[id] ? C.byId[id].visits : null),
      city: (C) => (C.release && C.release.metrics.total_visits
        ? C.release.metrics.total_visits.value : C.sums.visits),
    }),
    Object.freeze({
      id: "violations",
      label: "المخالفات المسجلة",
      short: "المخالفات",
      unit: "مخالفة", nounKey: "violation", fmtKey: "int",
      family: "control", tone: "neg", kind: "raw",
      additive: true, shareable: true, better: "low",
      cityMetric: "total_violations",
      formula: "قيمة قطاعية خام من ورقة الرقابة",
      value: (C, id) => (C.byId[id] ? C.byId[id].violations : null),
      city: (C) => (C.release && C.release.metrics.total_violations
        ? C.release.metrics.total_violations.value : C.sums.violations),
    }),
    Object.freeze({
      id: "closures",
      label: "قرارات الإغلاق",
      short: "الإغلاق",
      unit: "قرار", nounKey: "decision", fmtKey: "int",
      family: "control", tone: "neg", kind: "raw",
      additive: true, shareable: true, better: null,
      cityMetric: "total_closures",
      formula: "قيمة قطاعية خام من ورقة الرقابة",
      note: "القرار إجراء إنفاذ على مخالفة — ارتفاعه لا يُقرأ وحده حسناً ولا سيئاً",
      value: (C, id) => (C.byId[id] ? C.byId[id].closures : null),
      city: (C) => (C.release && C.release.metrics.total_closures
        ? C.release.metrics.total_closures.value : C.sums.closures),
    }),
    Object.freeze({
      id: "visits_share_pct",
      label: "حصة القطاع من الزيارات",
      short: "حصة الزيارات",
      unit: "٪", fmtKey: "pct",
      family: "control", tone: "pos", kind: "derived",
      additive: false, shareable: false, better: null,
      shareNote: "المؤشر نفسه حصة — عرض الحصة يكرره",
      formula: "زيارات القطاع ÷ إجمالي الزيارات × 100",
      value: (C, id) => (C.sd[id] ? C.sd[id].visits_share_pct : null),
      city: () => 100,
      cityBasis: "identity",
    }),
    Object.freeze({
      id: "violations_share_pct",
      label: "حصة القطاع من المخالفات",
      short: "حصة المخالفات",
      unit: "٪", fmtKey: "pct",
      family: "control", tone: "neg", kind: "derived",
      additive: false, shareable: false, better: "low",
      shareNote: "المؤشر نفسه حصة — عرض الحصة يكرره",
      formula: "مخالفات القطاع ÷ إجمالي المخالفات × 100",
      value: (C, id) => (C.sd[id] ? C.sd[id].violations_share_pct : null),
      city: () => 100,
      cityBasis: "identity",
    }),
    Object.freeze({
      id: "visits_per_monitor",
      label: "متوسط الزيارات لكل مراقب",
      short: "زيارات/مراقب",
      unit: "زيارة", nounKey: "visit", fmtKey: "int",
      family: "control", tone: "neu", kind: "definitional",
      additive: false, shareable: false, better: null,
      shareNote: "متوسط لا يُجمع — الحصة بلا معنى هنا",
      formula: "زيارات القطاع ÷ عدد مراقبيه",
      note: "عبء عمل ظاهري خلال فترة الرصد كاملة — لا معدل شهري ولا مقياس إنتاجية معتمد",
      value: (C, id) => {
        const r = C.byId[id];
        const q = r ? div(r.visits, r.monitors) : null;
        return q == null ? null : Math.round(q);
      },
      city: (C) => {
        const q = div(C.sums.visits, C.sums.monitors);
        return q == null ? null : Math.round(q);
      },
      cityBasis: "ratio",
    }),
    Object.freeze({
      id: "violations_per_100_visits",
      label: "المخالفات لكل 100 زيارة",
      short: "مخالفات/100 زيارة",
      unit: "مخالفة", nounKey: "violation", fmtKey: "dec1",
      family: "control", tone: "neg", kind: "definitional",
      additive: false, shareable: false, better: "low",
      shareNote: "معدل لا يُجمع — الحصة بلا معنى هنا",
      formula: "مخالفات القطاع ÷ زياراته × 100",
      note: "معدل ضبط لا معدل امتثال — البسط والمقام كلاهما من ورقة الرقابة",
      value: (C, id) => {
        const r = C.byId[id];
        return r ? pct(r.violations, r.visits) : null;
      },
      city: (C) => pct(C.sums.violations, C.sums.visits),
      cityBasis: "ratio",
    }),
    Object.freeze({
      id: "closures_per_100_violations",
      label: "قرارات الإغلاق لكل 100 مخالفة",
      short: "إغلاق/100 مخالفة",
      unit: "قرار", nounKey: "decision", fmtKey: "dec1",
      family: "control", tone: "neu", kind: "definitional",
      additive: false, shareable: false, better: null,
      shareNote: "معدل لا يُجمع — الحصة بلا معنى هنا",
      formula: "قرارات إغلاق القطاع ÷ مخالفاته × 100",
      note: "شدة الإجراء على المخالفة المسجلة — لا تصنيف لخطورة المخالفات في الإصدار",
      value: (C, id) => {
        const r = C.byId[id];
        return r ? pct(r.closures, r.violations) : null;
      },
      city: (C) => pct(C.sums.closures, C.sums.violations),
      cityBasis: "ratio",
    }),

    /* ═════════ عائلة: الامتداد الجغرافي ═════════ */
    Object.freeze({
      id: "districts",
      label: "الأحياء داخل القطاع",
      short: "الأحياء",
      unit: "حي", fmtKey: "int",
      family: "geo", tone: "neu", kind: "geo",
      additive: true, shareable: true, better: null,
      formula: "عدّ أحياء القطاع في طبقة الحدود المرفقة",
      value: (C, id) => (C.districts ? C.districts[id] : null),
      city: (C) => (C.districts ? sumOf(SECTOR_ORDER.map((s) => C.districts[s])) : null),
    }),
    Object.freeze({
      id: "hotspots",
      label: "نقاط التركّز الرقابي",
      short: "نقاط التركّز",
      unit: "نقطة", fmtKey: "int",
      family: "geo", tone: "neg", kind: "geo",
      additive: true, shareable: true, better: null,
      formula: "عدّ نقاط التركّز المنسوبة للقطاع في طبقة الحدود",
      note: "مواقع النقاط توضيحية من سجل المنصة الأصلي — لا إحداثيات مسحية",
      value: (C, id) => (C.hotspots ? C.hotspots[id] : null),
      city: (C) => (C.hotspots ? sumOf(SECTOR_ORDER.map((s) => C.hotspots[s])) : null),
    }),
    Object.freeze({
      id: "beds_per_district",
      label: "متوسط الأسرّة المرخصة لكل حي",
      short: "أسرّة/حي",
      unit: "سرير", nounKey: "bed", fmtKey: "int",
      family: "geo", tone: "neu", kind: "definitional",
      additive: false, shareable: false, better: null,
      shareNote: "متوسط لا يُجمع — الحصة بلا معنى هنا",
      formula: "طاقة القطاع ÷ عدد أحيائه",
      note: "كثافة توزيعية حسابية — الطاقة غير موزعة على الأحياء في الإصدار",
      value: (C, id) => {
        if (!C.districts || !C.byId[id]) return null;
        const q = div(C.byId[id].beds, C.districts[id]);
        return q == null ? null : Math.round(q);
      },
      city: (C) => {
        if (!C.districts) return null;
        const q = div(C.sums.beds, sumOf(SECTOR_ORDER.map((s) => C.districts[s])));
        return q == null ? null : Math.round(q);
      },
      cityBasis: "ratio",
    }),
  ]);

  /** فهرس المؤشرات بالمعرف — بحث ثابت الزمن */
  const INDICATOR_INDEX = (function () {
    const m = Object.create(null);
    for (const def of INDICATORS) m[def.id] = def;
    return m;
  })();

  /** المعرف القانوني الافتراضي — التغطية هي سؤال القاعة الأول */
  const DEFAULT_INDICATOR = "coverage_pct";

  /** تعريف مؤشر بمعرفه، أو null (معامل مسار ملوث لا يكسر البناء) */
  function indicator(id) {
    return INDICATOR_INDEX[String(id || "")] || null;
  }

  /** معرف مؤشر صالح دائماً: المطلوب إن وُجد وإلا الافتراضي */
  function safeIndicatorId(id) {
    return INDICATOR_INDEX[String(id || "")] ? String(id) : DEFAULT_INDICATOR;
  }

  /** مؤشرات عائلة (أو الكل) بترتيب الكتالوج */
  function indicatorsOf(familyId) {
    const f = String(familyId || "all");
    if (f === "all" || FAMILY_IDS.indexOf(f) === -1) return INDICATORS.slice();
    return INDICATORS.filter((d) => d.family === f);
  }

  /** تعريف عائلة بمعرفها أو null («الكل» ليست عائلة كتالوجية) */
  function family(id) {
    return FAMILIES.find((f) => f.id === String(id || "")) || null;
  }

  /** وضع عرض بمعرفه أو الوضع الافتراضي */
  function viewMode(id) {
    return VIEW_MODES.find((v) => v.id === String(id || "")) || VIEW_MODES[0];
  }

  /* ── 1.4) صف المصفوفة: قيم القطاعات الخمسة + المدينة + الإحصاء ────── */

  /**
   * ترتيب تنافسي (1,2,2,4): القيم المتساوية تتقاسم الرتبة، والرتبة التالية
   * تقفز بعدد المتساوين. الغياب لا يُرتَّب إطلاقاً (rank = null) — لا رتبة
   * أخيرة مجانية لقيمة غير متوفرة.
   */
  function competitionRanks(pairs, better) {
    const present = pairs.filter((p) => isNum(p.value));
    const desc = better !== "low";     // «الأدنى أفضل» يرتب تصاعدياً
    present.sort((a, b) => (desc ? b.value - a.value : a.value - b.value));
    const ranks = Object.create(null);
    let lastVal = null;
    let lastRank = 0;
    present.forEach((p, i) => {
      if (lastVal != null && p.value === lastVal) {
        ranks[p.sector] = lastRank;
      } else {
        ranks[p.sector] = i + 1;
        lastRank = i + 1;
        lastVal = p.value;
      }
    });
    return { ranks, counted: present.length };
  }

  /**
   * صف مصفوفة كامل لمؤشر واحد.
   * يعيد القيم القطاعية بحصصها وانحرافاتها ورتبها، وقيمة المدينة وأساسها،
   * والإحصاء الوصفي (أدنى/أعلى/مدى/متوسط/انحراف معياري/معامل اختلاف)،
   * وحالة المطابقة إن كان المؤشر خاماً له إجمالي منشور.
   */
  function row(release, derived, geo, indicatorId, C0) {
    const def = indicator(indicatorId);
    if (!def) return null;
    const C = C0 || context(release, derived, geo);

    const pairs = SECTOR_ORDER.map((sid) => {
      const r = C.byId[sid] || null;
      return {
        sector: sid,
        name: r ? r.name : sid,
        short: r ? r.short : sid,
        value: def.value(C, sid),
      };
    });

    const nums = pairs.filter((p) => isNum(p.value)).map((p) => p.value);
    const total = sumOf(nums);
    const min = nums.length ? Math.min.apply(null, nums) : null;
    const max = nums.length ? Math.max.apply(null, nums) : null;
    const mean = nums.length ? total / nums.length : null;

    /* الانحراف المعياري السكاني (القطاعات الخمسة كلها المجتمع لا عينة منه) */
    let sd = null;
    if (nums.length > 1 && isNum(mean)) {
      let acc = 0;
      for (const v of nums) acc += (v - mean) * (v - mean);
      sd = Math.sqrt(acc / nums.length);
    }
    const cv = (isNum(sd) && isNum(mean) && mean !== 0)
      ? round1((sd / Math.abs(mean)) * 100) : null;

    const { ranks, counted } = competitionRanks(pairs, def.better);

    const values = pairs.map((p) => {
      const share = (def.shareable && isNum(p.value) && isNum(total) && total !== 0)
        ? round1((p.value / total) * 100) : null;
      const deviation = (isNum(p.value) && isNum(mean)) ? p.value - mean : null;
      const devPct = (isNum(deviation) && isNum(mean) && mean !== 0)
        ? round1((deviation / Math.abs(mean)) * 100) : null;
      return {
        sector: p.sector, name: p.name, short: p.short,
        value: p.value,
        share,
        deviation: isNum(deviation) ? round1(deviation, def.fmtKey === "int" ? 0 : 1) : null,
        devPct,
        rank: ranks[p.sector] == null ? null : ranks[p.sector],
        isMax: isNum(p.value) && p.value === max,
        isMin: isNum(p.value) && p.value === min,
      };
    });

    const city = def.city ? def.city(C) : null;
    const cityBasis = def.cityBasis
      || (def.cityMetric ? "published" : (def.additive ? "sum" : "ratio"));

    /* بوابة المطابقة: خام له إجمالي منشور → مقارنة حيّة */
    let reconcile = null;
    if (def.kind === "raw" && def.cityMetric && C.release
      && C.release.metrics && C.release.metrics[def.cityMetric]) {
      const published = C.release.metrics[def.cityMetric].value;
      const summed = total;
      reconcile = {
        metricId: def.cityMetric,
        published,
        summed,
        diff: (isNum(published) && isNum(summed)) ? summed - published : null,
        ok: isNum(published) && isNum(summed) && summed === published,
        origin: metricOrigin(C.release, def.cityMetric),
      };
    }

    /* الأفضل والأسوأ بالمعنى الدلالي لا بالقيمة العددية وحدها */
    let best = null;
    let worst = null;
    if (counted) {
      for (const v of values) {
        if (v.rank === 1) best = v.sector;
        if (v.rank === counted) worst = v.sector;
      }
    }

    return {
      id: def.id,
      label: def.label,
      short: def.short,
      unit: def.unit,
      fmtKey: def.fmtKey,
      family: def.family,
      tone: def.tone,
      kind: def.kind,
      kindLabel: KIND_LABELS[def.kind] || def.kind,
      better: def.better,
      betterLabel: BETTER_LABELS[def.better || "none"],
      additive: !!def.additive,
      shareable: !!def.shareable,
      shareNote: def.shareNote || "",
      formula: def.formula || "",
      note: def.note || "",
      origin: def.cityMetric ? metricOrigin(C.release, def.cityMetric)
        : (def.kind === "geo" ? "data/riyadh-geo.json — طبقة حدود الأحياء"
          : "اشتقاق من قيم قطاعية منشورة"),
      values,
      city,
      cityBasis,
      total, min, max, mean,
      spread: (isNum(max) && isNum(min)) ? max - min : null,
      ratio: (isNum(max) && isNum(min) && min !== 0) ? round1(max / min, 2) : null,
      sd: isNum(sd) ? round1(sd, 1) : null,
      cv,
      counted,
      best, worst,
      reconcile,
      rankingNote: "الترتيب ضمن القطاعات الخمسة في مقياس «" + def.label + "» — "
        + (BETTER_LABELS[def.better || "none"]),
    };
  }

  /**
   * المصفوفة الكاملة: صفوف العائلة المطلوبة + ترتيب أعمدة القطاعات.
   * opts: { family, sortBy (معرف مؤشر), sortDir: "desc" | "asc" | "canonical" }
   */
  function matrix(release, derived, geo, opts) {
    const o = opts || {};
    const C = context(release, derived, geo);
    const famId = FAMILY_IDS.indexOf(String(o.family || "all")) !== -1
      ? String(o.family || "all") : "all";
    const defs = indicatorsOf(famId);
    const rows = defs.map((d) => row(release, derived, geo, d.id, C)).filter(Boolean);

    /* ترتيب الأعمدة: بمؤشر مختار أو بالترتيب القانوني */
    let order = SECTOR_ORDER.slice();
    const sortBy = o.sortBy ? indicator(o.sortBy) : null;
    const dir = o.sortDir === "asc" ? "asc" : (o.sortDir === "desc" ? "desc" : "canonical");
    if (sortBy && dir !== "canonical") {
      const sortRow = rows.find((r) => r.id === sortBy.id)
        || row(release, derived, geo, sortBy.id, C);
      const vals = Object.create(null);
      for (const v of sortRow.values) vals[v.sector] = v.value;
      order = order.slice().sort((a, b) => {
        const va = vals[a], vb = vals[b];
        if (!isNum(va) && !isNum(vb)) return SECTOR_ORDER.indexOf(a) - SECTOR_ORDER.indexOf(b);
        if (!isNum(va)) return 1;      // الغياب يلحق دائماً بالذيل
        if (!isNum(vb)) return -1;
        if (va === vb) return SECTOR_ORDER.indexOf(a) - SECTOR_ORDER.indexOf(b);
        return dir === "asc" ? va - vb : vb - va;
      });
    }

    return {
      family: famId,
      familyDef: family(famId),
      sectors: order.map((sid) => {
        const r = C.byId[sid] || null;
        return { id: sid, name: r ? r.name : sid, short: r ? r.short : sid };
      }),
      sectorOrder: order,
      rows,
      sortBy: sortBy ? sortBy.id : null,
      sortDir: dir,
      counts: {
        indicators: rows.length,
        sectors: order.length,
        definitional: rows.filter((r) => r.kind === "definitional").length,
        raw: rows.filter((r) => r.kind === "raw").length,
      },
      hasGeo: C.hasGeo,
    };
  }

  /* ── 1.5) التركّز والتوازن ──────────────────────────────────────────── */

  /**
   * إحصاء التركّز لمؤشر: أعلى قطاع وحصته، نسبة الأعلى إلى الأدنى، المدى،
   * ومعامل الاختلاف. كلها اشتقاقات تعريفية بصيغها الظاهرة.
   */
  function concentration(release, derived, geo, indicatorId, C0) {
    const r = row(release, derived, geo, indicatorId, C0);
    if (!r) return null;
    const sorted = r.values.filter((v) => isNum(v.value))
      .slice().sort((a, b) => b.value - a.value);
    const top = sorted[0] || null;
    const bottom = sorted.length ? sorted[sorted.length - 1] : null;
    const topShare = (top && isNum(r.total) && r.total !== 0 && r.additive)
      ? round1((top.value / r.total) * 100) : null;
    const topTwoShare = (sorted.length > 1 && isNum(r.total) && r.total !== 0 && r.additive)
      ? round1(((sorted[0].value + sorted[1].value) / r.total) * 100) : null;
    return {
      indicatorId: r.id,
      label: r.label,
      unit: r.unit,
      fmtKey: r.fmtKey,
      tone: r.tone,
      additive: r.additive,
      top, bottom,
      topShare, topTwoShare,
      ratio: r.ratio,
      spread: r.spread,
      mean: r.mean,
      sd: r.sd,
      cv: r.cv,
      ranked: sorted,
      rankingNote: r.rankingNote,
      formula: r.formula,
      shareFormula: r.additive
        ? "حصة الأعلى = قيمة الأعلى ÷ مجموع القطاعات × 100"
        : "لا حصة: المؤشر نسبي/متوسط لا يُجمع",
      cvFormula: "معامل الاختلاف = الانحراف المعياري ÷ |المتوسط| × 100",
    };
  }

  /**
   * ميزان الاستحقاق: يقارن ما ينال القطاع من الطاقة/الزيارات بما يمثله من
   * الطلب/المخالفات — بفارق نقاط مئوية صريح. هذا هو السؤال التنفيذي الذي
   * لا تجيبه لوحة منفردة: هل توزيع الموارد يتبع توزيع الحاجة؟
   */
  function balance(release, derived, geo, C0) {
    const C = C0 || context(release, derived, geo);
    const out = [];
    for (const sid of SECTOR_ORDER) {
      const r = C.byId[sid];
      if (!r) continue;
      const sd = C.sd[sid] || {};
      const demandShare = isNum(sd.demand_share_pct)
        ? sd.demand_share_pct : pct(r.demand, C.sums.demand);
      const bedsShare = pct(r.beds, C.sums.beds);
      const violShare = isNum(sd.violations_share_pct)
        ? sd.violations_share_pct : pct(r.violations, C.sums.violations);
      const visitShare = isNum(sd.visits_share_pct)
        ? sd.visits_share_pct : pct(r.visits, C.sums.visits);
      const monitorShare = pct(r.monitors, C.sums.monitors);
      out.push({
        sector: sid, name: r.name, short: r.short,
        demandShare, bedsShare,
        capacityGap: (isNum(bedsShare) && isNum(demandShare))
          ? round1(bedsShare - demandShare) : null,
        violShare, visitShare, monitorShare,
        effortGap: (isNum(visitShare) && isNum(violShare))
          ? round1(visitShare - violShare) : null,
        monitorGap: (isNum(monitorShare) && isNum(violShare))
          ? round1(monitorShare - violShare) : null,
        coverage: C.sd[sid] ? C.sd[sid].coverage_pct : null,
      });
    }
    return {
      rows: out,
      capacityFormula: "فجوة الطاقة = حصة القطاع من الطاقة − حصته من الطلب (نقطة مئوية)",
      effortFormula: "فجوة الجهد = حصة القطاع من الزيارات − حصته من المخالفات (نقطة مئوية)",
      monitorFormula: "فجوة التغطية الرقابية = حصة القطاع من المراقبين − حصته من المخالفات",
      note: "الفجوة نقاط مئوية بين حصتين من المدينة — لا مقياس كفاية معتمد ولا معيار توزيع رسمي",
    };
  }

  /* ── 1.6) بطاقة القطاع ─────────────────────────────────────────────── */

  /** صفوف عينة الأحياء المنسوبة لقطاع — من `release.neighbourhoods` حصراً */
  function sampleRowsOf(release, sectorId) {
    const nb = release && release.neighbourhoods;
    if (!nb || !Array.isArray(nb.rows)) return [];
    return nb.rows.filter((r) => r && r.sector === sectorId);
  }

  /** نقاط التركّز المنسوبة لقطاع، تنازلياً بالكثافة (المفتاح الوحيد المنشور) */
  function hotspotsOf(geo, sectorId) {
    if (!geo || !Array.isArray(geo.hotspots)) return [];
    return geo.hotspots
      .filter((h) => h && h.sector === sectorId)
      .map((h) => ({ density: h.density, lat: h.lat, lng: h.lng }))
      .sort((a, b) => (b.density || 0) - (a.density || 0));
  }

  /** أسماء أحياء القطاع من طبقة الحدود (بترتيب الملف — لا فرز مختلق) */
  function districtsOf(geo, sectorId) {
    if (!geo || !geo.sectors) return [];
    return (geo.sectors[sectorId] || []).map((d) => ({
      name: d.name, name_en: d.name_en || "", centroid: d.centroid,
    }));
  }

  /**
   * بطاقة القطاع الكاملة: أرقامه، رتبه في كل مؤشر، انحرافه عن متوسط
   * القطاعات، أحياؤه ونقاط تركّزه، صفوف عينته، وسطر ميزانه.
   * القطاع خارج القائمة القانونية → null (لا بطاقة مختلقة).
   */
  function profile(release, derived, geo, sectorId, C0) {
    const sid = String(sectorId || "");
    if (SECTOR_ORDER.indexOf(sid) === -1) return null;
    const C = C0 || context(release, derived, geo);
    const r = C.byId[sid];
    if (!r) return null;

    /* كل المؤشرات مرة واحدة — الرتب والانحرافات تُقرأ من الصفوف ذاتها */
    const rows = INDICATORS.map((d) => row(release, derived, geo, d.id, C)).filter(Boolean);

    const figures = [];
    const ranks = [];
    const deviations = [];
    for (const rw of rows) {
      const cell = rw.values.find((v) => v.sector === sid) || null;
      if (!cell) continue;
      figures.push({
        id: rw.id, label: rw.label, short: rw.short, unit: rw.unit,
        fmtKey: rw.fmtKey, tone: rw.tone, kind: rw.kind, kindLabel: rw.kindLabel,
        value: cell.value, formula: rw.formula, note: rw.note,
      });
      ranks.push({
        id: rw.id, label: rw.label, short: rw.short,
        rank: cell.rank, of: rw.counted,
        better: rw.better, betterLabel: rw.betterLabel,
        tone: rw.tone, value: cell.value, unit: rw.unit, fmtKey: rw.fmtKey,
        rankingNote: rw.rankingNote,
      });
      deviations.push({
        id: rw.id, label: rw.label, short: rw.short,
        value: cell.value, mean: isNum(rw.mean) ? round1(rw.mean, rw.fmtKey === "int" ? 0 : 1) : null,
        deviation: cell.deviation, devPct: cell.devPct,
        tone: rw.tone, unit: rw.unit, fmtKey: rw.fmtKey, better: rw.better,
      });
    }

    const bal = balance(release, derived, geo, C);
    const balRow = bal.rows.find((b) => b.sector === sid) || null;

    const districts = districtsOf(geo, sid);
    const hotspots = hotspotsOf(geo, sid);
    const sample = sampleRowsOf(release, sid);

    /* أفضل ثلاث رتب وأسوأ ثلاث — قراءة سريعة لموقع القطاع */
    const ranked = ranks.filter((x) => isNum(x.rank));
    const strengths = ranked.filter((x) => x.better && x.rank === 1);
    const weaknesses = ranked.filter((x) => x.better && x.rank === x.of);

    /* الحالات الصادقة: ما لا يتوفر لهذا القطاع يُقال صراحةً */
    const honest = [];
    if (!C.hasGeo) {
      honest.push("طبقة حدود الأحياء غير محمّلة في هذه الجلسة — أعداد الأحياء "
        + "ونقاط التركّز والخريطة المصغرة غير متاحة، ولا تُقدَّر بديلاً.");
    }
    if (!sample.length) {
      honest.push("لا صفوف لهذا القطاع في عينة الأحياء المدرجة — الأرقام "
        + "المعروضة قطاعية بالكامل ولا قيمة على مستوى الحي.");
    }
    honest.push("معدل الامتثال ونسبة الإشغال وأنواع الإيواء والأنشطة الاقتصادية "
      + "وتقسيم الياقات منشورة على مستوى المدينة فقط — لا تفكيك قطاعي لها في هذا الإصدار.");

    return {
      id: sid,
      name: r.name,
      short: r.short,
      raw: {
        demand: r.demand, beds: r.beds, building: r.building,
        operational: r.operational, monitors: r.monitors,
        visits: r.visits, violations: r.violations, closures: r.closures,
      },
      derived: C.sd[sid] || null,
      figures, ranks, deviations,
      strengths, weaknesses,
      balance: balRow,
      balanceMeta: {
        capacityFormula: bal.capacityFormula,
        effortFormula: bal.effortFormula,
        monitorFormula: bal.monitorFormula,
        note: bal.note,
      },
      districts,
      districtCount: districts.length,
      hotspots,
      hotspotCount: hotspots.length,
      sample,
      sampleLabel: (release && release.meta && release.meta.sample_label) || "",
      sampleNote: (release && release.neighbourhoods && release.neighbourhoods.ranking_note) || "",
      mapDisclaimer: (release && release.meta && release.meta.map_disclaimer) || "",
      mapAttribution: (geo && geo.source && geo.source.boundaries) || "",
      sectorGrouping: (geo && geo.source && geo.source.sector_grouping) || "",
      honest,
    };
  }

  /* ── 1.7) بوابة مطابقة المجاميع (تُحسب حيّاً لا ثابتاً مكتوباً) ─────── */

  /**
   * تجمع القطاعات الخمسة لكل مقياس خام له إجمالي منشور وتقارن — ثم تضيف
   * فحصي هوية مشتقين (مجموع العجز، ونسبة التغطية المعاد حسابها).
   * النتيجة كلها محسوبة من الإصدار المحمَّل: انحراف إصدار مستقبلي يظهر هنا.
   */
  function reconciliation(release, derived, geo, C0) {
    const C = C0 || context(release, derived, geo);
    const rows = [];

    for (const def of INDICATORS) {
      if (def.kind !== "raw" || !def.cityMetric) continue;
      const rw = row(release, derived, geo, def.id, C);
      if (!rw || !rw.reconcile) continue;
      rows.push({
        id: def.id,
        label: def.label,
        unit: def.unit,
        fmtKey: def.fmtKey,
        summed: rw.reconcile.summed,
        published: rw.reconcile.published,
        diff: rw.reconcile.diff,
        ok: rw.reconcile.ok,
        origin: rw.reconcile.origin,
        metricId: rw.reconcile.metricId,
        kind: "sum",
      });
    }

    /* هوية 1: مجموع عجز القطاعات = عجز المدينة المشتق */
    const cityDeficit = C.derived && isNum(C.derived.deficit_beds)
      ? C.derived.deficit_beds : null;
    rows.push({
      id: "deficit_identity",
      label: "مجموع عجز القطاعات مقابل عجز المدينة المشتق",
      unit: "سرير", fmtKey: "int",
      summed: C.sums.deficit,
      published: cityDeficit,
      diff: (isNum(C.sums.deficit) && isNum(cityDeficit))
        ? C.sums.deficit - cityDeficit : null,
      ok: isNum(C.sums.deficit) && isNum(cityDeficit) && C.sums.deficit === cityDeficit,
      origin: "مشتق (fv1) — max(الطلب − الطاقة، 0)",
      metricId: "deficit_beds",
      kind: "identity",
    });

    /* هوية 2: التغطية المعاد حسابها من مجاميع القطاعات = التغطية المنشورة */
    const cityCoverage = C.derived && isNum(C.derived.coverage_pct)
      ? C.derived.coverage_pct : null;
    const recomputed = pct(C.sums.beds, C.sums.demand);
    rows.push({
      id: "coverage_identity",
      label: "نسبة التغطية المعاد حسابها من مجاميع القطاعات",
      unit: "٪", fmtKey: "pct",
      summed: recomputed,
      published: cityCoverage,
      diff: (isNum(recomputed) && isNum(cityCoverage))
        ? round1(recomputed - cityCoverage) : null,
      ok: isNum(recomputed) && isNum(cityCoverage) && recomputed === cityCoverage,
      origin: "مشتق (fv1) — الطاقة ÷ الطلب × 100",
      metricId: "coverage_pct",
      kind: "identity",
    });

    const passed = rows.filter((x) => x.ok).length;
    return {
      rows,
      total: rows.length,
      passed,
      failed: rows.length - passed,
      allOk: passed === rows.length,
      note: "المطابقة محسوبة وقت العرض من الإصدار المحمَّل — لا عدّاد ثابت "
        + "مكتوب في الشيفرة. أي انحراف في إصدار لاحق يظهر هنا فوراً.",
      gatesNote: (release && release.validation)
        ? "بوابات التحقق المعتمدة في هذا الإصدار: "
          + fmt.int(release.validation.gates_passed) + " من "
          + fmt.int(release.validation.gates_total)
        : "",
    };
  }

  /* ── 1.8) حدود التفكيك القطاعي — ما لا يُوزَّع، بأسمائه وأسبابه ────── */

  /** صيغ عدد ومعدود محلية لمعدودات لا تغطيها قائمة NOUNS المركزية
      (تطابق العدد والمعدود مطلب لغوي معتمد — لا «3 نوع» ولا «6 نشاط») */
  const LOCAL_NOUNS = Object.freeze({
    type: Object.freeze({
      one: "نوع واحد", two: "نوعان", few: "أنواع", many: "نوعاً", hundred: "نوع",
    }),
    activity: Object.freeze({
      one: "نشاط واحد", two: "نشاطان", few: "أنشطة", many: "نشاطاً", hundred: "نشاط",
    }),
    month: Object.freeze({
      one: "شهر واحد", two: "شهران", few: "أشهر", many: "شهراً", hundred: "شهر",
    }),
    district: Object.freeze({
      one: "حي واحد", two: "حيان", few: "أحياء", many: "حياً", hundred: "حي",
    }),
    hotspot: Object.freeze({
      one: "نقطة واحدة", two: "نقطتان", few: "نقاط", many: "نقطة", hundred: "نقطة",
    }),
    row: Object.freeze({
      one: "صف واحد", two: "صفان", few: "صفوف", many: "صفاً", hundred: "صف",
    }),
    indicatorRow: Object.freeze({
      one: "مؤشر واحد", two: "مؤشران", few: "مؤشرات", many: "مؤشراً", hundred: "مؤشر",
    }),
    gate: Object.freeze({
      one: "فحص واحد", two: "فحصان", few: "فحوص", many: "فحصاً", hundred: "فحص",
    }),
  });

  /** عدّ ومعدود بصيغة محلية — الواجهة كلها تمر من هنا لا من نصوص يدوية */
  function localNoun(n, key) {
    const forms = LOCAL_NOUNS[key];
    return forms ? fmt.countNoun(n, forms) : fmt.int(n);
  }

  /** كتالوج المقاييس التي لا تحمل بُعداً قطاعياً في عقد البيانات الحالي */
  const LIMIT_CATALOG = Object.freeze([
    Object.freeze({
      id: "compliance", label: "معدل الامتثال في الجولات الرقابية",
      has: (rel) => !!(rel && rel.compliance),
      value: (rel) => (rel.compliance ? fmt.pct(rel.compliance.value) : "—"),
      reason: "قيمة مدينة واحدة في الورقة، ولا بسط ولا مقام قطاعيان",
      badge: (rel) => (rel.compliance ? rel.compliance.note : ""),
      status: (rel) => (rel.compliance ? rel.compliance.status : ""),
    }),
    Object.freeze({
      id: "occupancy", label: "نسبة إشغال الطاقة المرخصة",
      has: (rel, der) => !!(der && isNum(der.occupancy_pct)),
      value: (rel, der) => fmt.pct(der.occupancy_pct),
      reason: "الأسرّة المشغولة منشورة إجمالاً واحداً — لا توزيع قطاعي لها",
    }),
    Object.freeze({
      id: "facility_types", label: "أنواع مرافق الإيواء",
      has: (rel) => !!(rel && rel.facility_types && rel.facility_types.length),
      value: (rel) => localNoun(rel.facility_types.length, "type"),
      reason: "التوزيع على الأنواع منشور على مستوى المدينة",
    }),
    Object.freeze({
      id: "economic_activities", label: "الأنشطة الاقتصادية المولّدة للطلب",
      has: (rel) => !!(rel && rel.economic_activities && rel.economic_activities.length),
      value: (rel) => localNoun(rel.economic_activities.length, "activity"),
      reason: "الطلب موزع على الأنشطة لا على القطاعات الجغرافية",
    }),
    Object.freeze({
      id: "violation_types", label: "أنواع المخالفات",
      has: (rel) => !!(rel && rel.violation_types && rel.violation_types.length),
      value: (rel) => localNoun(rel.violation_types.length, "type"),
      reason: "التصنيف النوعي منشور إجمالاً — لا تقاطع نوع × قطاع",
    }),
    Object.freeze({
      id: "collar", label: "تقسيم الطلب على الياقات",
      has: (rel) => !!(rel && rel.collar),
      value: (rel) => fmt.compact(rel.collar.blue + rel.collar.white) + " سرير",
      reason: "التقسيم منشور على مستوى المدينة في ورقة السياق",
    }),
    Object.freeze({
      id: "scenarios", label: "سيناريوهات العجز المتوقع",
      has: (rel) => !!(rel && rel.scenarios && rel.scenarios.rows),
      value: (rel) => localNoun(rel.scenarios.rows.length, "month") + " مورّدة",
      reason: "السيناريوهات مورّدة على مستوى المدينة، وحالتها غير معتمدة أصلاً",
      badge: (rel) => (rel.scenarios ? rel.scenarios.caveat : ""),
      status: (rel) => (rel.scenarios ? rel.scenarios.status : ""),
    }),
    Object.freeze({
      id: "initiatives", label: "مبادرات خطة العمل",
      has: (rel) => !!(rel && rel.strategy && rel.strategy.initiatives
        && rel.strategy.initiatives.length),
      value: (rel) => fmt.noun(rel.strategy.initiatives.length, "initiative"),
      reason: "المبادرات مرتبطة بركائز لا بقطاعات جغرافية",
    }),
    Object.freeze({
      id: "kpis", label: "مؤشرات الأداء",
      has: (rel) => !!(rel && rel.strategy && rel.strategy.kpis
        && rel.strategy.kpis.length),
      value: (rel) => fmt.noun(rel.strategy.kpis.length, "indicator"),
      reason: "خطوط الأساس والمستهدفات على مستوى المشروع لا القطاع",
    }),
    Object.freeze({
      id: "monthly", label: "السلاسل الشهرية (التراخيص والرقابة)",
      has: (rel) => !!(rel && rel.monthly && rel.monthly.licensing),
      value: (rel) => localNoun(rel.monthly.licensing.length, "month"),
      reason: "السلسلة الزمنية منشورة للمدينة — لا سلسلة شهرية لكل قطاع",
    }),
  ]);

  /**
   * حدود التفكيك: تُرشَّح على ما هو حاضر فعلاً في الإصدار — بند غائب من
   * البيانات لا يُذكر أصلاً (لا قائمة تحذيرات وهمية).
   */
  function limits(release, derived) {
    const rel = release || {};
    const der = derived || {};
    const out = [];
    for (const item of LIMIT_CATALOG) {
      if (!item.has(rel, der)) continue;
      out.push({
        id: item.id,
        label: item.label,
        value: item.value(rel, der),
        reason: item.reason,
        badge: item.badge ? item.badge(rel) : "",
        status: item.status ? item.status(rel) : "",
      });
    }
    return out;
  }

  /* ── 1.9) صفحة الإسناد: أصل كل مؤشر وصيغته ─────────────────────────── */

  /** صفوف الإسناد لكل مؤشرات الكتالوج بترتيبها، مع تسمية عائلته ونوعه */
  function provenance(release) {
    return INDICATORS.map((def) => ({
      id: def.id,
      label: def.label,
      short: def.short,
      unit: def.unit,
      familyId: def.family,
      familyLabel: (family(def.family) || { label: def.family }).label,
      kind: def.kind,
      kindLabel: KIND_LABELS[def.kind] || def.kind,
      kindNote: KIND_NOTES[def.kind] || "",
      formula: def.formula || "",
      note: def.note || "",
      better: def.better,
      betterLabel: BETTER_LABELS[def.better || "none"],
      tone: def.tone,
      origin: def.cityMetric
        ? metricOrigin(release, def.cityMetric)
        : (def.kind === "geo"
          ? "data/riyadh-geo.json — طبقة حدود الأحياء (189 حياً)"
          : "اشتقاق من قيم قطاعية منشورة في الإصدار"),
      cityMetric: def.cityMetric || null,
      shareable: !!def.shareable,
      additive: !!def.additive,
    }));
  }

  /* ── 1.10) تنسيق موحد: كل رقم يخرج من هنا فقط ─────────────────────── */

  /**
   * تنسيق قيمة وفق مفتاح تنسيق المؤشر — الدالة الوحيدة التي تحوّل رقماً
   * إلى نص في هذا الملف (الواجهة لا تنسق شيئاً بنفسها).
   */
  function formatValue(fmtKey, v) {
    if (!isNum(v)) return "—";
    if (fmtKey === "pct") return fmt.pct(v);
    if (fmtKey === "dec1") return fmt.iso(fmt.dec1(v));
    return fmt.iso(fmt.int(v));
  }

  /** تنسيق فرق موقّع مع إشارته الصريحة (+/−) وعزل اتجاهي */
  function formatDelta(fmtKey, v) {
    if (!isNum(v)) return "—";
    const sign = v > 0 ? "+" : (v < 0 ? "−" : "");
    const abs = Math.abs(v);
    if (fmtKey === "pct") return fmt.iso(sign + fmt.dec1(abs) + "٪");
    if (fmtKey === "dec1") return fmt.iso(sign + fmt.dec1(abs));
    return fmt.iso(sign + fmt.int(abs));
  }

  /** نقاط مئوية موقّعة — وحدة الفجوات في صفحة التوازن */
  function formatPoints(v) {
    if (!isNum(v)) return "—";
    const sign = v > 0 ? "+" : (v < 0 ? "−" : "");
    return fmt.iso(sign + fmt.dec1(Math.abs(v)) + " ن.م");
  }

  /** نص الرتبة الكامل: «الأول من خمسة» — لا رقم عارٍ بلا مرجع */
  const ORDINALS = Object.freeze(["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس"]);
  function rankText(rank, of) {
    if (!isNum(rank) || rank < 1) return "—";
    const ord = ORDINALS[rank] || fmt.int(rank);
    return ord + " من " + fmt.noun(of || 5, "sector");
  }

  return {
    /* مفردات */
    SECTOR_ORDER, FAMILIES, FAMILY_IDS, VIEW_MODES, VIEW_IDS,
    KIND_LABELS, KIND_NOTES, BETTER_LABELS, INDICATORS, DEFAULT_INDICATOR,
    LIMIT_CATALOG, ORDINALS, LOCAL_NOUNS,
    /* أدوات */
    context, indicator, safeIndicatorId, indicatorsOf, family, viewMode,
    metricOrigin, competitionRanks, round1, div, pct, sumOf,
    sampleRowsOf, hotspotsOf, districtsOf,
    /* نماذج */
    row, matrix, concentration, balance, profile, reconciliation, limits, provenance,
    /* تنسيق */
    formatValue, formatDelta, formatPoints, rankText, localNoun,
  };
})();

/* ══════════════════════════════════════════════════════════════════════════
   القسم 2) الواجهة — تسجيل الملحق `compare` عبر RH.presenter.ax
   يتخطى نفسه بغياب الهيكل (بيئة اختبار الوحدة أو بناء جزئي أثناء التطوير).
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  if (!RH.presenter || !RH.presenter.ax
    || typeof RH.presenter.ax.register !== "function") return;

  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;
  const M = RH.explore.compare;
  const micro = RH.viz.micro;
  const G = RH.viz.geoutils;

  /* ── 2.0) حالة تعبر إعادة البناء ───────────────────────────────────────
     كتابة معاملات المسار تُعيد بناء الملحق كاملاً (عقد المحرك). فحتى لا
     يقفز التركيز عند كل ضغطة، يُحجز مرجع العنصر المطلوب تركيزه هنا على
     مستوى الوحدة، ويُستعاد بعد أول بناء تالٍ ثم يُفرَّغ.
     ─────────────────────────────────────────────────────────────────── */
  let pendingFocus = null;

  /** مفاتيح معاملات المسار التي تملكها هذه الميزة — لا مفتاح خارجها */
  const PARAM_KEYS = Object.freeze(["i", "s", "v", "f", "o"]);

  /** اتجاهات ترتيب الأعمدة بالتناوب: القانوني ← تنازلي ← تصاعدي */
  const SORT_CYCLE = Object.freeze(["canonical", "desc", "asc"]);
  const SORT_LABELS = Object.freeze({
    canonical: "الترتيب القانوني للقطاعات",
    desc: "تنازلياً بقيمة المؤشر المحدد",
    asc: "تصاعدياً بقيمة المؤشر المحدد",
  });

  /** نغمة دلالية → صنف نص (ألوانه من tokens عبر compare.css) */
  const toneText = (t) => "cmp-t-" + (["pos", "neg", "demand", "gold", "blue", "neu"]
    .indexOf(String(t)) !== -1 ? t : "neu");

  /** نغمة دلالية → صنف نغمة مكتبة الرسوم المصغرة */
  const microTone = (t) => (["pos", "neg", "demand", "gold", "blue", "neu"]
    .indexOf(String(t)) !== -1 ? String(t) : "neu");

  /* ── 2.1) لبنات واجهة صغيرة مشتركة بين الصفحات ─────────────────────── */

  /** وسم صغير محايد (نوع الأصل، اتجاه التحسّن، حالة…) */
  function tag(text, cls) {
    return h("span", { class: "cmp-tag" + (cls ? " " + cls : "") }, String(text));
  }

  /** سطر ملاحظة صدق ملازم — يظهر تحت ما يصفه لا في صفحة منفصلة */
  function honestLine(el, text, cls) {
    if (!text) return null;
    const node = h("div", { class: "cmp-honest" + (cls ? " " + cls : "") },
      h("span", { class: "cmp-honest-mark", "aria-hidden": "true" }, "◆"),
      h("span", {}, String(text)));
    el.appendChild(node);
    return node;
  }

  /** صف «مفتاح: قيمة» كثيف داخل بطاقة */
  function kvRow(el, label, value, cls) {
    const node = h("div", { class: "cmp-kv" + (cls ? " " + cls : "") },
      h("span", { class: "cmp-kv-k" }, String(label)),
      h("b", { class: "cmp-kv-v" }, value == null ? "—" : value));
    el.appendChild(node);
    return node;
  }

  /** بطاقة إحصاء مدمجة بأسلوب الملاحق القائم (.ax-stat) */
  function statCell(el, label, value, cls, foot) {
    const node = h("div", { class: "cmp-stat" + (cls ? " " + cls : "") },
      h("div", { class: "cmp-stat-k" }, String(label)),
      h("div", { class: "cmp-stat-v" }, value == null ? "—" : value),
      foot ? h("div", { class: "cmp-stat-f" }, String(foot)) : null);
    el.appendChild(node);
    return node;
  }

  /**
   * شريط تبويبات قابل للتنقل بلوحة المفاتيح (عقد §8: داخل data-interactive).
   * RTL: السهم الأيسر/الأسفل يتقدم، والأيمن/الأعلى يتراجع — مرآة سجل القرارات.
   * items: [{ key, label, title? , disabled? }]
   */
  function tabStrip(el, opts) {
    const o = opts || {};
    const items = o.items || [];
    const wrap = h("div", {
      class: "cmp-tabs" + (o.cls ? " " + o.cls : ""),
      role: "tablist",
      "aria-label": o.ariaLabel || "تبويبات",
      "data-interactive": "",
    });
    const btns = [];
    items.forEach((it) => {
      const active = it.key === o.activeKey;
      const btn = h("button", {
        class: "cmp-tab" + (active ? " now" : "") + (it.cls ? " " + it.cls : ""),
        type: "button",
        role: "tab",
        "aria-selected": active ? "true" : "false",
        tabindex: active ? "0" : "-1",
        title: it.title || "",
        dataset: { ref: (o.refPrefix || "tab") + ":" + it.key },
        disabled: it.disabled ? true : null,
        onclick: () => { if (!it.disabled) o.onPick(it.key); },
      }, String(it.label));
      btn.addEventListener("keydown", (ev) => {
        const k = ev.key;
        const i = btns.indexOf(btn);
        let j = -1;
        if (k === "ArrowLeft" || k === "ArrowDown") j = i + 1;
        else if (k === "ArrowRight" || k === "ArrowUp") j = i - 1;
        else if (k === "Home") j = 0;
        else if (k === "End") j = btns.length - 1;
        else if (k === "Enter" || k === " " || k === "Spacebar") {
          ev.preventDefault();
          ev.stopPropagation();
          if (!it.disabled) o.onPick(it.key);
          return;
        } else return;
        ev.preventDefault();
        ev.stopPropagation();
        if (j < 0) j = btns.length - 1;
        if (j >= btns.length) j = 0;
        btns[j].focus();
      });
      wrap.appendChild(btn);
      btns.push(btn);
    });
    el.appendChild(wrap);
    return { el: wrap, buttons: btns };
  }

  /* ── 2.2) خريطة القطاع المصغرة (SVG خاص بالملحق) ───────────────────────
     لا مساس بـ viz/geomap.js المعتمد: الرسم هنا عبر geoutils.projector
     ذاته الذي يستعمله الأطلس، فالهندسة مطابقة والملكية منفصلة.
     ─────────────────────────────────────────────────────────────────── */
  function sectorMap(el, opts) {
    const o = opts || {};
    const geo = o.geo;
    if (!geo || !geo.sectors || !geo.bounds) {
      const miss = h("div", { class: "cmp-map-missing" },
        "طبقة حدود الأحياء غير محمّلة — لا خريطة تُرسم، ولا شكل يُختلق بديلاً.");
      el.appendChild(miss);
      return miss;
    }
    const proj = G.projector(geo.bounds, 1000);
    const root = svg("svg", {
      class: "cmp-map",
      viewBox: "0 0 " + proj.w + " " + proj.h,
      preserveAspectRatio: "xMidYMid meet",
      role: "img",
      "aria-label": o.ariaLabel || "خريطة أحياء الرياض مع إبراز القطاع المحدد",
      focusable: "false",
    });

    /* الطبقة الأولى: كل الأحياء بحياد — سياق المدينة كاملاً */
    const gAll = svg("g", { class: "cmp-map-base" });
    const gSel = svg("g", { class: "cmp-map-sel" });
    for (const sid of M.SECTOR_ORDER) {
      const list = geo.sectors[sid] || [];
      for (const d of list) {
        const path = svg("path", {
          class: sid === o.sectorId ? "cmp-map-d now" : "cmp-map-d",
          d: proj.ringPath(d.rings),
        });
        (sid === o.sectorId ? gSel : gAll).appendChild(path);
      }
    }
    root.appendChild(gAll);
    root.appendChild(gSel);

    /* نقاط التركّز داخل القطاع المحدد — دوائر مرجانية (خلل حصراً) */
    if (o.hotspots && o.hotspots.length) {
      const gHs = svg("g", { class: "cmp-map-hs" });
      for (const hs of o.hotspots) {
        gHs.appendChild(svg("circle", {
          cx: proj.px(hs.lng).toFixed(2),
          cy: proj.py(hs.lat).toFixed(2),
          r: "8",
        }));
      }
      root.appendChild(gHs);
    }

    el.appendChild(root);
    return root;
  }

  /* ══════════════════════════════════════════════════════════════════════
     2.3) الصفحة 1 — مصفوفة المقارنة
     ══════════════════════════════════════════════════════════════════════ */

  /** خلية مصفوفة واحدة وفق وضع العرض المختار */
  function matrixCell(td, rw, cell, view) {
    if (view === "rank") {
      if (cell.rank == null) {
        td.appendChild(h("span", { class: "cmp-dash", title: "لا قيمة — لا رتبة" }, "—"));
        return;
      }
      td.appendChild(h("span", {
        class: "cmp-rank" + (cell.rank === 1 ? " first" : "")
          + (cell.rank === rw.counted ? " last" : ""),
        title: M.rankText(cell.rank, rw.counted) + " — " + rw.betterLabel,
      }, fmt.iso(fmt.int(cell.rank))));
      td.appendChild(h("span", { class: "cmp-rank-of" }, "/" + fmt.int(rw.counted)));
      return;
    }

    if (view === "share") {
      if (!rw.shareable) {
        td.appendChild(h("span", {
          class: "cmp-dash",
          title: rw.shareNote || "لا حصة لهذا المؤشر",
        }, "—"));
        td.appendChild(h("span", { class: "cmp-cell-why" }, "لا تُجمع"));
        return;
      }
      const v = cell.share;
      td.appendChild(h("b", { class: "cmp-cell-v " + toneText(rw.tone) },
        v == null ? "—" : fmt.pct(v)));
      td.appendChild(barFor(v, 100, rw.tone));
      return;
    }

    if (view === "deviation") {
      const dv = cell.deviation;
      /* اتجاه اللون دلالي: الزيادة في مؤشر «الأدنى أفضل» ليست إنجازاً */
      let cls = "neu";
      if (dv != null && dv !== 0) {
        if (rw.better === "high") cls = dv > 0 ? "pos" : "neg";
        else if (rw.better === "low") cls = dv > 0 ? "neg" : "pos";
        else cls = "neu";
      }
      td.appendChild(h("b", { class: "cmp-cell-v " + toneText(cls) },
        M.formatDelta(rw.fmtKey, dv)));
      td.appendChild(h("span", { class: "cmp-cell-why" },
        cell.devPct == null ? "" : M.formatDelta("pct", cell.devPct)));
      return;
    }

    /* الوضع الافتراضي: القيمة + شريط نسبتها إلى أعلى قطاع في الصف */
    td.appendChild(h("b", {
      class: "cmp-cell-v " + toneText(rw.tone)
        + (cell.isMax ? " is-max" : "") + (cell.isMin ? " is-min" : ""),
    }, M.formatValue(rw.fmtKey, cell.value)));
    td.appendChild(barFor(cell.value, rw.max, rw.tone));
  }

  /** شريط نسبة داخل الخلية — لا رقم فيه، القيمة مكتوبة فوقه */
  function barFor(value, max, tone) {
    const wrap = h("span", { class: "cmp-cellbar " + toneText(tone), "aria-hidden": "true" });
    if (typeof value === "number" && Number.isFinite(value)
      && typeof max === "number" && max > 0) {
      const w = Math.max(0, Math.min(100, (value / max) * 100));
      wrap.appendChild(h("span", { class: "cmp-cellbar-fill", style: { width: w.toFixed(1) + "%" } }));
    }
    return wrap;
  }

  /**
   * جدول المصفوفة كاملاً: صف لكل مؤشر، عمود لكل قطاع + المدينة + المدى.
   * التنقّل: أسهم أعلى/أسفل بين الصفوف، Enter يختار المؤشر، وضغط رأس
   * العمود يرتب الأعمدة به.
   */
  function buildMatrix(host, st, mtx, actions) {
    const card = h("div", { class: "dash-card cmp-matrix-card" });
    const scroll = h("div", { class: "cmp-matrix-scroll" });

    const headCells = [
      h("th", { scope: "col", class: "cmp-th-ind" }, "المؤشر"),
    ];
    mtx.sectors.forEach((s) => {
      const isSortKey = st.sortDir !== "canonical";
      headCells.push(h("th", { scope: "col", class: "cmp-th-sec" },
        h("button", {
          class: "cmp-secbtn",
          type: "button",
          "data-interactive": "",
          dataset: { ref: "sec:" + s.id },
          title: "فتح بطاقة القطاع «" + s.name + "»"
            + (isSortKey ? " — الأعمدة مرتبة الآن " + SORT_LABELS[st.sortDir] : ""),
          onclick: () => actions.openSector(s.id),
        }, s.short)));
    });
    headCells.push(h("th", { scope: "col", class: "cmp-th-city" }, "المدينة"));
    headCells.push(h("th", { scope: "col", class: "cmp-th-spread" }, "المدى"));

    const tbody = h("tbody", {});
    const rowEls = [];
    mtx.rows.forEach((rw) => {
      const selected = rw.id === st.indicator;
      /* دلالة الجدول تبقى جدولاً: الصف صفٌّ، والزر داخل خلية المؤشر هو
         العنصر القابل للتركيز — فلا يُكسر شجر a11y بـ role=button على <tr>. */
      const tr = h("tr", {
        class: "cmp-row" + (selected ? " now" : ""),
        "data-interactive": "",
        title: rw.label + " — " + rw.formula,
        onclick: () => actions.pickIndicator(rw.id),
      });

      const pick = h("button", {
        class: "cmp-indbtn",
        type: "button",
        tabindex: selected ? "0" : "-1",
        "aria-pressed": selected ? "true" : "false",
        dataset: { ref: "row:" + rw.id },
        title: rw.formula,
        onclick: (ev) => { ev.stopPropagation(); actions.pickIndicator(rw.id); },
      },
        h("span", { class: "cmp-ind-label" }, rw.label),
        h("span", { class: "cmp-ind-meta" },
          tag(rw.kindLabel, "k-" + rw.kind),
          h("span", { class: "cmp-ind-unit" }, rw.unit)));

      tr.appendChild(h("td", { class: "cmp-td-ind" }, pick));

      mtx.sectors.forEach((s) => {
        const cell = rw.values.find((v) => v.sector === s.id)
          || { sector: s.id, value: null, rank: null };
        const td = h("td", {
          class: "cmp-td-cell"
            + (cell.rank === 1 && rw.better ? " best" : "")
            + (cell.rank === rw.counted && rw.better && rw.counted > 1 ? " worst" : ""),
        });
        matrixCell(td, rw, cell, st.view);
        tr.appendChild(td);
      });

      tr.appendChild(h("td", { class: "cmp-td-city" },
        h("b", {}, M.formatValue(rw.fmtKey, rw.city)),
        h("span", { class: "cmp-cell-why" }, cityBasisLabel(rw.cityBasis))));
      tr.appendChild(h("td", { class: "cmp-td-spread" },
        h("b", {}, M.formatValue(rw.fmtKey, rw.spread)),
        h("span", { class: "cmp-cell-why" },
          rw.ratio == null ? "" : "×" + fmt.iso(fmt.dec1(rw.ratio)))));

      pick.addEventListener("keydown", (ev) => {
        const k = ev.key;
        const i = rowEls.indexOf(pick);
        let j = -1;
        if (k === "ArrowDown") j = i + 1;
        else if (k === "ArrowUp") j = i - 1;
        else if (k === "Home") j = 0;
        else if (k === "End") j = rowEls.length - 1;
        else if (k === "Enter" || k === " " || k === "Spacebar") {
          ev.preventDefault();
          ev.stopPropagation();
          actions.pickIndicator(rw.id);
          return;
        } else return;
        ev.preventDefault();
        ev.stopPropagation();
        if (j < 0) j = rowEls.length - 1;
        if (j >= rowEls.length) j = 0;
        rowEls[j].focus();
      });

      tbody.appendChild(tr);
      rowEls.push(pick);
    });

    scroll.appendChild(h("table", { class: "table-dense cmp-matrix" },
      h("thead", {}, h("tr", {}, headCells)), tbody));
    card.appendChild(scroll);
    host.appendChild(card);
    return card;
  }

  /** وصف أساس قيمة عمود المدينة — لا رقم بلا أصل معلن */
  function cityBasisLabel(basis) {
    if (basis === "published") return "إجمالي منشور";
    if (basis === "identity") return "مجموع الحصص";
    if (basis === "ratio") return "محسوبة على إجماليات المدينة";
    return "مجموع القطاعات";
  }

  /** لوحة تركيز المؤشر المحدد — الشريط الأيسر في صفحة المصفوفة */
  function buildFocus(host, st, mtx, model, actions) {
    const rw = mtx.rows.find((r) => r.id === st.indicator)
      || M.row(model.release, model.derived, model.geo, st.indicator, model.C);
    const card = h("div", { class: "dash-card cmp-focus" });

    card.appendChild(h("div", { class: "cmp-focus-head" },
      h("div", { class: "cmp-focus-title" }, rw.label),
      h("div", { class: "cmp-focus-tags" },
        tag(rw.kindLabel, "k-" + rw.kind),
        tag(rw.unit, "k-unit"),
        tag(rw.betterLabel, "k-dir")),
    ));

    const body = h("div", { class: "cmp-focus-body" });

    /* الترتيب المرئي: أشرطة مصغرة تنازلياً بالقيمة الفعلية */
    const ranked = rw.values.filter((v) => typeof v.value === "number")
      .slice().sort((a, b) => b.value - a.value);
    const barsHost = h("div", { class: "cmp-focus-bars" });
    if (ranked.length) {
      micro.microBars(barsHost, {
        items: ranked.map((v) => ({ label: v.short, value: v.value })),
        tone: microTone(rw.tone),
        max: rw.max,
        fmt: (n) => M.formatValue(rw.fmtKey, n),
        ariaLabel: "القطاعات مرتبة تنازلياً بقيمة " + rw.label,
      });
    } else {
      barsHost.appendChild(h("div", { class: "cmp-dash" }, "—"));
    }
    body.appendChild(barsHost);

    /* الإحصاء الوصفي — كله اشتقاق تعريفي بصيغته المعلنة */
    const stats = h("div", { class: "cmp-focus-stats" });
    kvRow(stats, "قيمة المدينة", M.formatValue(rw.fmtKey, rw.city));
    kvRow(stats, "أعلى قطاع",
      rw.max == null ? "—" : M.formatValue(rw.fmtKey, rw.max));
    kvRow(stats, "أدنى قطاع",
      rw.min == null ? "—" : M.formatValue(rw.fmtKey, rw.min));
    kvRow(stats, "متوسط القطاعات الخمسة",
      rw.mean == null ? "—" : M.formatValue(rw.fmtKey,
        rw.fmtKey === "int" ? Math.round(rw.mean) : M.round1(rw.mean)));
    kvRow(stats, "المدى (أعلى − أدنى)", M.formatValue(rw.fmtKey, rw.spread));
    kvRow(stats, "معامل الاختلاف",
      rw.cv == null ? "—" : fmt.pct(rw.cv));
    body.appendChild(stats);

    /* الصيغة والمصدر — يسافران مع الرقم دائماً */
    const prov = h("div", { class: "cmp-focus-prov" });
    kvRow(prov, "الصيغة", h("span", { class: "cmp-formula" }, rw.formula), "wide");
    kvRow(prov, "المصدر", h("span", { class: "cmp-origin" }, rw.origin), "wide");
    body.appendChild(prov);

    if (rw.note) honestLine(body, rw.note);
    honestLine(body, rw.rankingNote, "rank");
    if (!rw.shareable && st.view === "share") {
      honestLine(body, rw.shareNote || "لا حصة لهذا المؤشر — النِسَب لا تُجمع.", "warn");
    }

    const acts = h("div", { class: "cmp-focus-acts" });
    if (rw.best) {
      acts.appendChild(h("button", {
        class: "cmp-btn", type: "button", "data-interactive": "",
        dataset: { ref: "focus:best" },
        onclick: () => actions.openSector(rw.best),
      }, "بطاقة المتصدر: " + sectorShort(model, rw.best)));
    }
    acts.appendChild(h("button", {
      class: "cmp-btn ghost", type: "button", "data-interactive": "",
      dataset: { ref: "focus:gap" },
      onclick: () => actions.goPage(2),
    }, "تحليل الفجوة والتركّز"));
    body.appendChild(acts);

    card.appendChild(body);
    host.appendChild(card);
    return card;
  }

  /** الاسم المختصر لقطاع من الإصدار — لا نص مكتوب يدوياً */
  function sectorShort(model, sid) {
    const r = (model.release.sectors || []).find((s) => s.id === sid);
    return r ? r.short : sid;
  }

  function pageMatrix(el, st, model, actions) {
    const mtx = M.matrix(model.release, model.derived, model.geo, {
      family: st.family, sortBy: st.indicator, sortDir: st.sortDir,
    });

    /* شريط الأدوات: العائلة + وضع العرض + ترتيب الأعمدة */
    const bar = h("div", { class: "cmp-toolbar" });
    const famItems = [{ key: "all", label: "كل المؤشرات", title: "الأربعة والعشرون مؤشراً معاً" }]
      .concat(M.FAMILIES.map((f) => ({ key: f.id, label: f.label, title: f.note })));
    tabStrip(bar, {
      items: famItems, activeKey: st.family, ariaLabel: "ترشيح عائلة المؤشرات",
      refPrefix: "fam", cls: "fams", onPick: (k) => actions.pickFamily(k),
    });
    tabStrip(bar, {
      items: M.VIEW_MODES.map((v) => ({ key: v.id, label: v.label, title: v.note })),
      activeKey: st.view, ariaLabel: "وضع عرض خلايا المصفوفة",
      refPrefix: "view", cls: "views", onPick: (k) => actions.pickView(k),
    });
    bar.appendChild(h("button", {
      class: "cmp-btn sort", type: "button", "data-interactive": "",
      dataset: { ref: "sort:cycle" },
      title: "ترتيب أعمدة القطاعات: " + SORT_LABELS[st.sortDir],
      onclick: () => actions.cycleSort(),
    },
      h("span", { "aria-hidden": "true" }, "⇅"),
      h("span", {}, SORT_LABELS[st.sortDir])));
    el.appendChild(bar);

    /* الجسم: المصفوفة (يمين) + لوحة تركيز المؤشر (يسار) */
    const main = h("div", { class: "cmp-matrix-main" });
    buildMatrix(main, st, mtx, actions);
    buildFocus(main, st, mtx, model, actions);
    el.appendChild(main);

    /* التذييل: وصف الوضع المختار وعدد ما يُعرض — لا عدّاد مكتوب يدوياً */
    const foot = h("div", { class: "cmp-foot" },
      h("span", { class: "cmp-foot-main" }, M.viewMode(st.view).note),
      h("span", { class: "cmp-foot-sep" }, "·"),
      h("span", {}, M.localNoun(mtx.counts.indicators, "indicatorRow") + " × "
        + fmt.noun(mtx.counts.sectors, "sector")),
      h("span", { class: "cmp-foot-sep" }, "·"),
      h("span", {}, "منها " + M.localNoun(mtx.counts.definitional, "indicatorRow")
        + " باشتقاق تعريفي معلن الصيغة"),
      h("span", { class: "cmp-foot-sep" }, "·"),
      h("span", {}, "الجدول يُمرَّر رأسياً لبقية الصفوف"));
    el.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════════════════════
     2.4) الصفحة 2 — بطاقة القطاع
     ══════════════════════════════════════════════════════════════════════ */

  /**
   * أرقام بطاقة القطاع: اثنا عشر رقماً في شبكة ثلاثية الأعمدة (أربعة صفوف
   * تامة بلا صف أعرج) تقرأ القطاع من الطاقة إلى الترخيص إلى الرقابة.
   * النغمات دلالية مقفلة، وبقية الأربعة والعشرين تُقرأ في قائمة الرتب.
   */
  const PROFILE_FIGURES = Object.freeze([
    Object.freeze({ id: "demand", tone: "demand" }),
    Object.freeze({ id: "beds", tone: "pos" }),
    Object.freeze({ id: "coverage_pct", tone: "pos" }),
    Object.freeze({ id: "deficit_beds", tone: "neg" }),
    Object.freeze({ id: "demand_share_pct", tone: "demand" }),
    Object.freeze({ id: "beds_share_pct", tone: "pos" }),
    Object.freeze({ id: "building", tone: "pos" }),
    Object.freeze({ id: "operational", tone: "pos" }),
    Object.freeze({ id: "monitors", tone: "pos" }),
    Object.freeze({ id: "visits", tone: "pos" }),
    Object.freeze({ id: "violations", tone: "neg" }),
    Object.freeze({ id: "closures", tone: "neg" }),
  ]);

  /** عمود الأرقام + ميزان الاستحقاق */
  function profileFigures(host, prof) {
    const col = h("div", { class: "cmp-prof-col figures" });

    const grid = h("div", { class: "cmp-figgrid" });
    for (const f of PROFILE_FIGURES) {
      const fig = prof.figures.find((x) => x.id === f.id);
      if (!fig) continue;
      statCell(grid, fig.short, M.formatValue(fig.fmtKey, fig.value),
        toneText(fig.tone), fig.unit);
    }
    col.appendChild(h("div", { class: "cmp-card-title" }, "أرقام القطاع"));
    col.appendChild(grid);

    /* ميزان الاستحقاق: ثلاث فجوات بنقاط مئوية صريحة */
    const bal = prof.balance;
    const balCard = h("div", { class: "dash-card cmp-balance" });
    balCard.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, "ميزان الاستحقاق"),
      h("div", { class: "card-sub" }, "فارق حصتين من المدينة بالنقطة المئوية")));
    const balBody = h("div", { class: "card-body" });
    if (bal) {
      const rowsDef = [
        {
          key: "capacityGap", label: "الطاقة مقابل الطلب",
          a: "حصة الطاقة " + (bal.bedsShare == null ? "—" : fmt.pct(bal.bedsShare)),
          b: "حصة الطلب " + (bal.demandShare == null ? "—" : fmt.pct(bal.demandShare)),
          good: true, formula: prof.balanceMeta.capacityFormula,
        },
        {
          key: "effortGap", label: "الزيارات مقابل المخالفات",
          a: "حصة الزيارات " + (bal.visitShare == null ? "—" : fmt.pct(bal.visitShare)),
          b: "حصة المخالفات " + (bal.violShare == null ? "—" : fmt.pct(bal.violShare)),
          good: true, formula: prof.balanceMeta.effortFormula,
        },
        {
          key: "monitorGap", label: "المراقبون مقابل المخالفات",
          a: "حصة المراقبين " + (bal.monitorShare == null ? "—" : fmt.pct(bal.monitorShare)),
          b: "حصة المخالفات " + (bal.violShare == null ? "—" : fmt.pct(bal.violShare)),
          good: true, formula: prof.balanceMeta.monitorFormula,
        },
      ];
      for (const rd of rowsDef) {
        const v = bal[rd.key];
        const line = h("div", { class: "cmp-balrow", title: rd.formula },
          h("div", { class: "cmp-balrow-k" }, rd.label),
          h("div", { class: "cmp-balrow-parts" }, rd.a + " ← " + rd.b));
        const chipHost = h("div", { class: "cmp-balrow-chip" });
        micro.deltaChip(chipHost, {
          value: v,
          positiveIsGood: rd.good,
          fmt: (n) => fmt.iso(fmt.dec1(n) + " ن.م"),
          label: v == null ? "" : (v >= 0 ? "فائض حصة" : "نقص حصة"),
          title: rd.formula,
          ariaLabel: rd.label + ": " + M.formatPoints(v),
        });
        line.appendChild(chipHost);
        balBody.appendChild(line);
      }
      /* ملاحظة الميزان تعيش في تذييل الصفحة لا داخل البطاقة: عند 1366
         كان سطرها يدفع الصف الثالث خارج الإطار (قصّ صف بيانات). */
    } else {
      RH.presenter.layout.pendingCard(balBody, {
        label: "لا ميزان لهذا القطاع",
        note: "الحصص تتطلب مجاميع قطاعية كاملة، وهي غير متوفرة في هذا الإصدار.",
      });
    }
    balCard.appendChild(balBody);
    col.appendChild(balCard);
    host.appendChild(col);
    return col;
  }

  /** عمود الخريطة المصغرة وعينة الأحياء */
  function profileMap(host, prof, model) {
    const col = h("div", { class: "cmp-prof-col map" });

    const mapCard = h("div", { class: "dash-card cmp-mapcard" });
    mapCard.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, "موقع القطاع" ),
      h("div", { class: "card-sub" },
        M.localNoun(prof.districtCount, "district") + " · "
        + M.localNoun(prof.hotspotCount, "hotspot") + " تركّز")));
    const mapBody = h("div", { class: "card-body cmp-mapbody" });
    const mapHost = h("div", { class: "cmp-maphost" });
    sectorMap(mapHost, {
      geo: model.geo,
      sectorId: prof.id,
      hotspots: prof.hotspots,
      ariaLabel: "خريطة الرياض مع إبراز " + prof.name + " ونقاط تركّزه الرقابي",
    });
    mapBody.appendChild(mapHost);

    const legend = h("div", { class: "cmp-maplegend" },
      h("span", { class: "cmp-legend-item sel" }, "أحياء " + prof.short),
      h("span", { class: "cmp-legend-item base" }, "بقية أحياء المدينة"),
      prof.hotspotCount
        ? h("span", { class: "cmp-legend-item hs" }, "نقاط التركّز الرقابي") : null);
    mapBody.appendChild(legend);
    mapCard.appendChild(mapBody);

    /* الإسناد والإخلاء يلازمان الخريطة أينما رُسمت */
    const attrib = h("div", { class: "card-note cmp-mapnote" },
      (prof.mapDisclaimer ? prof.mapDisclaimer + " · " : "")
      + (prof.mapAttribution || "")
      + (prof.sectorGrouping ? " · " + prof.sectorGrouping : ""));
    mapCard.appendChild(attrib);
    col.appendChild(mapCard);

    /* عينة الأحياء: وسم العينة يسافر مع الصفوف إلزامياً */
    const sampleCard = h("div", { class: "dash-card cmp-samplecard" });
    sampleCard.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, "أحياء القطاع ضمن العينة"),
      h("div", { class: "card-sub", title: prof.sampleLabel }, prof.sampleLabel)));
    const sBody = h("div", { class: "card-body" });
    if (prof.sample.length) {
      const tb = h("tbody", {});
      for (const rowx of prof.sample) {
        tb.appendChild(h("tr", {},
          h("td", {}, rowx.name),
          h("td", { class: "num" }, fmt.iso(fmt.int(rowx.building))),
          h("td", { class: "num" }, fmt.iso(fmt.int(rowx.operational))),
          h("td", { class: "num" }, fmt.iso(fmt.int(rowx.beds))),
          h("td", { class: "num neg" }, fmt.iso(fmt.int(rowx.violations)))));
      }
      const scroll = h("div", { class: "cmp-scroll" },
        h("table", { class: "table-dense cmp-sample" },
          h("thead", {}, h("tr", {},
            h("th", { scope: "col" }, "الحي"),
            h("th", { scope: "col" }, "بناء"),
            h("th", { scope: "col" }, "تشغيلية"),
            h("th", { scope: "col" }, "أسرّة"),
            h("th", { scope: "col" }, "مخالفات"))),
          tb));
      sBody.appendChild(scroll);
      honestLine(sBody, prof.sampleNote);
    } else {
      RH.presenter.layout.pendingCard(sBody, {
        label: "لا صفوف لهذا القطاع في العينة",
        note: prof.sampleLabel
          + " — القيم المعروضة أعلاه قطاعية بالكامل، ولا قيمة حيّية تُقدَّر.",
      });
    }
    sampleCard.appendChild(sBody);
    col.appendChild(sampleCard);

    host.appendChild(col);
    return col;
  }

  /** عمود الرتب: موقع القطاع في كل مؤشر من الأربعة والعشرين */
  function profileRanks(host, prof, actions) {
    const col = h("div", { class: "cmp-prof-col ranks" });
    const card = h("div", { class: "dash-card cmp-rankcard" });
    card.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, "موقع القطاع في كل مؤشر"),
      h("div", { class: "card-sub" },
        "قائمة تُمرَّر تضم " + M.localNoun(prof.ranks.length, "indicatorRow")
        + " — الرتبة ضمن القطاعات الخمسة واتجاه التحسّن مذكوران لكل مقياس")));
    const body = h("div", { class: "card-body" });

    /* ملخص القوة والضعف بمعيار صريح: الرتبة الأولى/الأخيرة في مؤشر له اتجاه */
    const summary = h("div", { class: "cmp-rank-summary" });
    kvRow(summary, "يتصدر في",
      prof.strengths.length
        ? prof.strengths.map((s) => s.short).join(" · ")
        : "لا مؤشر يتصدره ضمن ذوات الاتجاه المعرَّف");
    kvRow(summary, "يتذيّل في",
      prof.weaknesses.length
        ? prof.weaknesses.map((s) => s.short).join(" · ")
        : "لا مؤشر يتذيّله ضمن ذوات الاتجاه المعرَّف");
    body.appendChild(summary);

    const list = h("div", { class: "cmp-scroll cmp-ranklist" });
    for (const rk of prof.ranks) {
      const cls = rk.rank == null ? "na"
        : (rk.better && rk.rank === 1 ? "first"
          : (rk.better && rk.rank === rk.of ? "last" : "mid"));
      const item = h("button", {
        class: "cmp-rankrow " + cls,
        type: "button",
        "data-interactive": "",
        dataset: { ref: "rank:" + rk.id },
        title: rk.rankingNote,
        onclick: () => actions.pickIndicatorAndGo(rk.id, 0),
      },
        h("span", { class: "cmp-rankrow-badge" },
          rk.rank == null ? "—" : fmt.iso(fmt.int(rk.rank))),
        h("span", { class: "cmp-rankrow-label" }, rk.short),
        h("span", { class: "cmp-rankrow-val " + toneText(rk.tone) },
          M.formatValue(rk.fmtKey, rk.value)),
        h("span", { class: "cmp-rankrow-dir" },
          rk.better === "high" ? "الأعلى أفضل"
            : rk.better === "low" ? "الأدنى أفضل" : "بلا اتجاه"));
      list.appendChild(item);
    }
    body.appendChild(list);
    card.appendChild(body);
    col.appendChild(card);
    host.appendChild(col);
    return col;
  }

  function pageProfile(el, st, model, actions) {
    const prof = M.profile(model.release, model.derived, model.geo, st.sector, model.C);

    const bar = h("div", { class: "cmp-toolbar" });
    tabStrip(bar, {
      items: M.SECTOR_ORDER.map((sid) => {
        const r = (model.release.sectors || []).find((s) => s.id === sid);
        return { key: sid, label: r ? r.name : sid, title: "بطاقة " + (r ? r.name : sid) };
      }),
      activeKey: st.sector, ariaLabel: "اختيار القطاع", refPrefix: "psec",
      cls: "sectors", onPick: (k) => actions.pickSector(k),
    });
    if (prof) {
      bar.appendChild(h("div", { class: "cmp-toolbar-meta" },
        h("b", {}, prof.name),
        h("span", {}, " · " + M.localNoun(prof.districtCount, "district")),
        h("span", {}, " · " + M.localNoun(prof.sample.length, "row") + " في العينة")));
    }
    el.appendChild(bar);

    const main = h("div", { class: "cmp-profile" });
    if (!prof) {
      RH.presenter.layout.pendingCard(main, {
        label: "لا بطاقة لهذا المعرف",
        note: "المعرف المطلوب خارج القطاعات الخمسة المنشورة في الإصدار.",
      });
    } else {
      profileFigures(main, prof);
      profileMap(main, prof, model);
      profileRanks(main, prof, actions);
    }
    el.appendChild(main);

    const foot = h("div", { class: "cmp-foot" });
    if (prof) {
      foot.appendChild(h("span", { class: "cmp-foot-honest" },
        prof.balanceMeta.note));
      for (const line of prof.honest) {
        foot.appendChild(h("span", { class: "cmp-foot-honest" }, line));
      }
    }
    el.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════════════════════
     2.5) الصفحة 3 — الفجوة والتركّز
     ══════════════════════════════════════════════════════════════════════ */

  /** أعمدة جدول الميزان — تعريف واحد يخدم الرأس والصفوف والوصف الناطق */
  const BALANCE_COLUMNS = Object.freeze([
    Object.freeze({ key: "name", label: "القطاع", kind: "text" }),
    Object.freeze({ key: "demandShare", label: "حصة الطلب", kind: "pct", tone: "demand" }),
    Object.freeze({ key: "bedsShare", label: "حصة الطاقة", kind: "pct", tone: "pos" }),
    Object.freeze({ key: "capacityGap", label: "فجوة الطاقة", kind: "points", good: true }),
    Object.freeze({ key: "violShare", label: "حصة المخالفات", kind: "pct", tone: "neg" }),
    Object.freeze({ key: "visitShare", label: "حصة الزيارات", kind: "pct", tone: "pos" }),
    Object.freeze({ key: "effortGap", label: "فجوة الجهد", kind: "points", good: true }),
    Object.freeze({ key: "monitorShare", label: "حصة المراقبين", kind: "pct", tone: "pos" }),
    Object.freeze({ key: "monitorGap", label: "فجوة التغطية الرقابية", kind: "points", good: true }),
  ]);

  /** الخلايا الثلاث لمضاعفات الفجوات — نص كل خلية وصيغتها من نموذج الميزان */
  const GAP_CELLS = Object.freeze([
    Object.freeze({
      key: "capacityGap", title: "فجوة الطاقة عن الطلب",
      formulaOf: (bal) => bal.capacityFormula,
    }),
    Object.freeze({
      key: "effortGap", title: "فجوة الزيارات عن المخالفات",
      formulaOf: (bal) => bal.effortFormula,
    }),
    Object.freeze({
      key: "monitorGap", title: "فجوة المراقبين عن المخالفات",
      formulaOf: (bal) => bal.monitorFormula,
    }),
  ]);

  function buildBalanceTable(host, bal, actions) {
    const card = h("div", { class: "dash-card cmp-baltable" });
    card.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, "ميزان الحصص بين القطاعات"),
      h("div", { class: "card-sub" },
        fmt.noun(bal.rows.length, "sector")
        + " × ثلاث فجوات — كل فجوة فارق نقاط مئوية بين حصتين من المدينة")));
    const body = h("div", { class: "card-body" });

    const tb = h("tbody", {});
    for (const r of bal.rows) {
      const tr = h("tr", {
        class: "cmp-balrow-tr",
        "data-interactive": "",
        title: "فتح بطاقة " + r.name,
        onclick: () => actions.openSector(r.sector),
      });
      for (const col of BALANCE_COLUMNS) {
        const v = r[col.key];
        if (col.kind === "text") {
          /* اسم القطاع زرٌّ داخل خلية — الصف يبقى صفاً في شجرة a11y */
          tr.appendChild(h("td", {}, h("button", {
            class: "cmp-linkbtn", type: "button",
            dataset: { ref: "bal:" + r.sector },
            title: "فتح بطاقة " + r.name,
            onclick: (ev) => { ev.stopPropagation(); actions.openSector(r.sector); },
          }, String(v))));
        } else if (col.kind === "pct") {
          tr.appendChild(h("td", { class: "num " + toneText(col.tone) },
            v == null ? "—" : fmt.pct(v)));
        } else {
          const cls = v == null || v === 0 ? "neu" : (v > 0 ? "pos" : "neg");
          tr.appendChild(h("td", { class: "num " + toneText(cls) },
            M.formatPoints(v)));
        }
      }
      tb.appendChild(tr);
    }

    body.appendChild(h("div", { class: "cmp-balscroll" },
      h("table", { class: "table-dense cmp-baltbl" },
        h("thead", {}, h("tr", {}, BALANCE_COLUMNS.map((c) =>
          h("th", { scope: "col", class: c.kind === "points" ? "gapcol" : null }, c.label)))),
        tb)));
    /* ثلاث خلايا مضاعفات صغيرة: كل خلية فجوة واحدة مرتبة من الفائض إلى
       النقص. الجدول أعلاه يعطي كل الأرقام، وهذه تعطي القراءة السريعة:
       من يفيض ومن ينقص في كل ميزان — بالرقاقة الدلالية المقفلة ذاتها
       (`positiveIsGood` صحيح: فائض الحصة أخضر ونقصها مرجاني). */
    micro.smallMultiples(body, {
      items: GAP_CELLS,
      cols: 3,
      ariaLabel: "الفجوات الثلاث لكل قطاع مرتبة من الفائض إلى النقص",
      renderCell(cell, item) {
        cell.appendChild(h("div", { class: "cmp-gapcell-t", title: item.formulaOf(bal) },
          item.title));
        const ordered = bal.rows.slice().sort((a, b) => {
          const va = a[item.key], vb = b[item.key];
          if (va == null && vb == null) return 0;
          if (va == null) return 1;
          if (vb == null) return -1;
          return vb - va;
        });
        for (const r of ordered) {
          const line = h("div", { class: "cmp-gapline" },
            h("span", { class: "cmp-gapline-k" }, r.short));
          micro.deltaChip(line, {
            value: r[item.key],
            positiveIsGood: true,
            fmt: (n) => fmt.iso(fmt.dec1(n) + " ن.م"),
            ariaLabel: item.title + " — " + r.name + ": " + M.formatPoints(r[item.key]),
          });
          cell.appendChild(line);
        }
      },
    });

    card.appendChild(body);
    host.appendChild(card);
    return card;
  }

  function pageGap(el, st, model, actions) {
    const conc = M.concentration(model.release, model.derived, model.geo,
      st.indicator, model.C);
    const bal = M.balance(model.release, model.derived, model.geo, model.C);

    /* شريط اختيار المؤشر داخل عائلته — نفس الحالة المشتركة مع المصفوفة */
    const bar = h("div", { class: "cmp-toolbar" });
    const famItems = [{ key: "all", label: "كل المؤشرات" }]
      .concat(M.FAMILIES.map((f) => ({ key: f.id, label: f.label, title: f.note })));
    tabStrip(bar, {
      items: famItems, activeKey: st.family, ariaLabel: "عائلة المؤشرات",
      refPrefix: "gfam", cls: "fams", onPick: (k) => actions.pickFamily(k),
    });
    el.appendChild(bar);

    const chips = h("div", {
      class: "cmp-chiprow", role: "tablist",
      "aria-label": "اختيار المؤشر المحلَّل", "data-interactive": "",
    });
    const chipEls = [];
    const famDefs = M.indicatorsOf(st.family);
    famDefs.forEach((d) => {
      const active = d.id === st.indicator;
      const b = h("button", {
        class: "cmp-chip" + (active ? " now" : ""),
        type: "button", role: "tab",
        "aria-selected": active ? "true" : "false",
        tabindex: active ? "0" : "-1",
        title: d.label + " — " + d.formula,
        dataset: { ref: "chip:" + d.id },
        onclick: () => actions.pickIndicator(d.id),
      }, d.short);
      b.addEventListener("keydown", (ev) => {
        const k = ev.key;
        const i = chipEls.indexOf(b);
        let j = -1;
        if (k === "ArrowLeft" || k === "ArrowDown") j = i + 1;
        else if (k === "ArrowRight" || k === "ArrowUp") j = i - 1;
        else if (k === "Home") j = 0;
        else if (k === "End") j = chipEls.length - 1;
        else if (k === "Enter" || k === " " || k === "Spacebar") {
          ev.preventDefault(); ev.stopPropagation();
          actions.pickIndicator(d.id);
          return;
        } else return;
        ev.preventDefault(); ev.stopPropagation();
        if (j < 0) j = chipEls.length - 1;
        if (j >= chipEls.length) j = 0;
        chipEls[j].focus();
      });
      chips.appendChild(b);
      chipEls.push(b);
    });
    el.appendChild(chips);

    /* شريط إحصاء التركّز */
    const strip = h("div", { class: "cmp-strip" });
    if (conc) {
      statCell(strip, "المؤشر المحلَّل", conc.label, "wide");
      statCell(strip, "أعلى قطاع",
        conc.top ? conc.top.short : "—",
        toneText(conc.tone),
        conc.top ? M.formatValue(conc.fmtKey, conc.top.value) : "");
      statCell(strip, "حصة الأعلى",
        conc.topShare == null ? "—" : fmt.pct(conc.topShare),
        conc.topShare == null ? "" : toneText(conc.tone),
        conc.additive ? "من مجموع القطاعات" : "المؤشر لا يُجمع");
      statCell(strip, "أعلى قطاعين معاً",
        conc.topTwoShare == null ? "—" : fmt.pct(conc.topTwoShare),
        "", conc.additive ? "تركّز الحصة" : "المؤشر لا يُجمع");
      statCell(strip, "نسبة الأعلى إلى الأدنى",
        conc.ratio == null ? "—" : "×" + fmt.iso(fmt.dec1(conc.ratio)),
        "", conc.bottom ? "الأدنى: " + conc.bottom.short : "");
      statCell(strip, "المدى", M.formatValue(conc.fmtKey, conc.spread), "",
        "أعلى − أدنى");
      statCell(strip, "معامل الاختلاف",
        conc.cv == null ? "—" : fmt.pct(conc.cv), "",
        "تشتّت نسبي حول المتوسط");
    }
    el.appendChild(strip);

    const main = h("div", { class: "cmp-gap-main" });

    /* بطاقة الترتيب المرئي */
    const rankCard = h("div", { class: "dash-card cmp-gaprank" });
    rankCard.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, conc ? conc.label : "—"),
      h("div", { class: "card-sub" }, conc ? conc.formula : "")));
    const rankBody = h("div", { class: "card-body" });
    if (conc && conc.ranked.length) {
      micro.microBars(rankBody, {
        items: conc.ranked.map((v) => ({ label: v.short, value: v.value })),
        tone: microTone(conc.tone),
        fmt: (n) => M.formatValue(conc.fmtKey, n),
        ariaLabel: "القطاعات مرتبة تنازلياً بقيمة " + conc.label,
      });
      /* جدول التفكيك تحت الأشرطة: الشريط يُري الترتيب، والجدول يُري
         الأرقام التي بُني عليها (قيمة/حصة/انحراف/رتبة) — فلا يبقى في
         البطاقة فراغ ولا يُطلب من القارئ تخمين ما وراء الشريط. */
      const detailRow = M.row(model.release, model.derived, model.geo,
        st.indicator, model.C);
      const dtb = h("tbody", {});
      for (const v of detailRow.values) {
        dtb.appendChild(h("tr", {},
          h("td", {}, h("b", {}, v.short)),
          h("td", { class: "num " + toneText(detailRow.tone) },
            M.formatValue(detailRow.fmtKey, v.value)),
          h("td", { class: "num" },
            v.share == null ? "—" : fmt.pct(v.share)),
          h("td", { class: "num" },
            M.formatDelta(detailRow.fmtKey, v.deviation)),
          h("td", { class: "num" },
            v.rank == null ? "—" : M.rankText(v.rank, detailRow.counted))));
      }
      rankBody.appendChild(h("div", { class: "cmp-scroll cmp-detailwrap" },
        h("table", { class: "table-dense cmp-detailtbl" },
          h("thead", {}, h("tr", {},
            h("th", { scope: "col" }, "القطاع"),
            h("th", { scope: "col" }, "القيمة"),
            h("th", { scope: "col" }, "الحصة"),
            h("th", { scope: "col" }, "الانحراف عن المتوسط"),
            h("th", { scope: "col" }, "الرتبة"))),
          dtb)));
      honestLine(rankBody, conc.rankingNote, "rank");
      honestLine(rankBody, conc.shareFormula);
      honestLine(rankBody, conc.cvFormula);
    } else {
      RH.presenter.layout.pendingCard(rankBody, {
        label: "لا قيم لهذا المؤشر في الإصدار",
        note: "المؤشر معرَّف في الكتالوج لكن مدخلاته غائبة — لا قيمة تُقدَّر بديلاً.",
      });
    }
    rankCard.appendChild(rankBody);
    main.appendChild(rankCard);

    buildBalanceTable(main, bal, actions);
    el.appendChild(main);

    /* تذييل الصفحة: صيغ الفجوات الثلاث وتحفظها — خارج متمرر البطاقة كي
       لا يكون وسم الصدق أول ما يُقصّ عند ضيق الارتفاع. */
    const foot = h("div", { class: "cmp-foot" });
    honestLine(foot, bal.capacityFormula);
    honestLine(foot, bal.effortFormula);
    honestLine(foot, bal.monitorFormula);
    honestLine(foot, bal.note, "warn");
    el.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════════════════════
     2.6) الصفحة 4 — مطابقة المجاميع وحدود التفكيك
     ══════════════════════════════════════════════════════════════════════ */

  function pageReconcile(el, st, model) {
    const rel = model.release;
    const rec = M.reconciliation(model.release, model.derived, model.geo, model.C);
    const lim = M.limits(model.release, model.derived);

    const strip = h("div", { class: "cmp-strip" });
    statCell(strip, "فحوص المطابقة",
      fmt.iso(fmt.int(rec.passed)) + " / " + fmt.iso(fmt.int(rec.total)),
      rec.allOk ? toneText("pos") : toneText("neg"),
      rec.allOk ? "كلها مطابقة" : M.localNoun(rec.failed, "gate") + " منحرفاً");
    statCell(strip, "مقاييس خام مجموعة",
      fmt.iso(fmt.int(rec.rows.filter((r) => r.kind === "sum").length)),
      "", "مجموع القطاعات مقابل الإجمالي المنشور");
    statCell(strip, "فحوص هوية مشتقة",
      fmt.iso(fmt.int(rec.rows.filter((r) => r.kind === "identity").length)),
      "", "إعادة حساب المشتق من مجاميع القطاعات");
    statCell(strip, "حدود التفكيك",
      M.localNoun(lim.length, "indicatorRow"), "",
      "مقاييس بلا بُعد قطاعي في هذا الإصدار");
    if (rec.gatesNote) {
      statCell(strip, "بوابات الإصدار", rec.gatesNote, "wide");
    }
    el.appendChild(strip);

    const main = h("div", { class: "cmp-rec-main" });

    /* جدول المطابقة الحي */
    const recCard = h("div", { class: "dash-card cmp-reccard" });
    recCard.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, "مجموع القطاعات مقابل المنشور"),
      h("div", { class: "card-sub" },
        M.localNoun(rec.total, "gate") + " — " + rec.note)));
    const recBody = h("div", { class: "card-body" });
    const tb = h("tbody", {});
    for (const r of rec.rows) {
      tb.appendChild(h("tr", { class: r.ok ? "ok" : "bad" },
        h("td", {}, r.label),
        h("td", { class: "num" }, M.formatValue(r.fmtKey, r.summed)),
        h("td", { class: "num" }, M.formatValue(r.fmtKey, r.published)),
        h("td", { class: "num " + (r.ok ? toneText("neu") : toneText("neg")) },
          M.formatDelta(r.fmtKey, r.diff)),
        h("td", {}, h("span", {
          class: "cmp-gate " + (r.ok ? "ok" : "bad"),
          title: r.origin,
        }, r.ok ? "مطابق" : "منحرف")),
        h("td", { class: "cmp-origin" }, r.origin)));
    }
    recBody.appendChild(h("div", { class: "cmp-scroll" },
      h("table", { class: "table-dense cmp-rectbl" },
        h("thead", {}, h("tr", {},
          h("th", { scope: "col" }, "الفحص"),
          h("th", { scope: "col" }, "مجموع القطاعات"),
          h("th", { scope: "col" }, "القيمة المنشورة"),
          h("th", { scope: "col" }, "الفرق"),
          h("th", { scope: "col" }, "النتيجة"),
          h("th", { scope: "col" }, "المرساة"))),
        tb)));

    /* هوية الإصدار المفحوص + ما تثبته البوابة بالضبط.
       بلا هذين لا معنى للنتيجة: «مطابق» عن أي إصدار؟ وبأي بصمة؟ */
    const idBlock = h("div", { class: "cmp-recfoot" });
    const idCol = h("div", { class: "cmp-recfoot-col" });
    kvRow(idCol, "الإصدار المفحوص", String(rel.release.id));
    kvRow(idCol, "حالة الإصدار",
      rel.release.status === "published" ? "منشور" : String(rel.release.status));
    kvRow(idCol, "بصمة الإصدار",
      h("span", { class: "cmp-origin", title: String(rel.release.sha256) },
        String(rel.release.sha256).slice(0, 16) + "…"));
    kvRow(idCol, "تاريخ الحساب", fmt.date(rel.meta.calculation_date));
    kvRow(idCol, "فترة الرصد", String(rel.meta.monitoring_period_label));
    idBlock.appendChild(idCol);

    const proofCol = h("div", { class: "cmp-recfoot-col" });
    proofCol.appendChild(h("div", { class: "cmp-card-title" }, "ما تثبته هذه البوابة"));
    honestLine(proofCol, "أن كل مقياس خام يظهر في المصفوفة القطاعية قابل "
      + "للجمع إلى الإجمالي المنشور نفسه — فلا قيمة قطاعية معروضة خارج "
      + "الإجمالي الذي تقرؤه القاعة.");
    honestLine(proofCol, "أن المشتقات المعروضة قطاعياً تعيد إنتاج المشتق "
      + "المنشور للمدينة حين تُحسب من مجاميع القطاعات — أي أنها إعادة "
      + "تعبير عن الإصدار لا حساب مستقل عنه.");
    honestLine(proofCol, "ما لا تثبته: صحة الأرقام في المصدر ذاته. البوابة "
      + "فحص اتساق داخلي بين طبقتي العرض والإصدار، لا تدقيق ميداني.");
    idBlock.appendChild(proofCol);
    recBody.appendChild(idBlock);

    recCard.appendChild(recBody);
    main.appendChild(recCard);

    /* حدود التفكيك — كل بند بسببه، والموسوم يحمل وسمه */
    const limCard = h("div", { class: "dash-card cmp-limcard" });
    limCard.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, "ما لا يقبل التفكيك القطاعي"),
      h("div", { class: "card-sub" },
        "قائمة تُمرَّر تضم " + M.localNoun(lim.length, "indicatorRow")
        + " منشورة على مستوى المدينة — تُذكر هنا كي لا يُظن أنها حُجبت")));
    const limBody = h("div", { class: "card-body cmp-scroll" });
    for (const item of lim) {
      const box = h("div", { class: "cmp-limit" + (item.badge ? " tagged" : "") },
        h("div", { class: "cmp-limit-head" },
          h("b", {}, item.label),
          h("span", { class: "cmp-limit-val" }, item.value)),
        h("div", { class: "cmp-limit-why" }, item.reason));
      if (item.badge) {
        /* الوسم يسافر مع الرقم: منهجية الامتثال وتحفظ السيناريوهات نصاً كاملاً */
        box.appendChild(h("div", { class: "cmp-limit-badge" },
          h("span", { class: "cmp-limit-status" },
            item.status === "pending_methodology" ? "بانتظار اعتماد المنهجية"
              : item.status === "supplied_unvalidated" ? "قيمة مورّدة غير معتمدة"
                : String(item.status || "")),
          h("span", { class: "cmp-limit-note" }, item.badge)));
      }
      limBody.appendChild(box);
    }
    limCard.appendChild(limBody);
    main.appendChild(limCard);

    el.appendChild(main);
  }

  /* ══════════════════════════════════════════════════════════════════════
     2.7) الصفحة 5 — الصيغ والمصادر
     ══════════════════════════════════════════════════════════════════════ */

  function pageProvenance(el, st, model) {
    const rows = M.provenance(model.release);
    const rel = model.release;

    const strip = h("div", { class: "cmp-strip" });
    statCell(strip, "مؤشرات الكتالوج", M.localNoun(rows.length, "indicatorRow"));
    statCell(strip, "قيم خام",
      M.localNoun(rows.filter((r) => r.kind === "raw").length, "indicatorRow"),
      "", "من ورقة المصدر مباشرة");
    statCell(strip, "مشتقات منشورة",
      M.localNoun(rows.filter((r) => r.kind === "derived").length, "indicatorRow"),
      "", "صيغتها في الإصدار");
    statCell(strip, "اشتقاقات تعريفية",
      M.localNoun(rows.filter((r) => r.kind === "definitional").length, "indicatorRow"),
      "", "صيغتها معلنة في هذا الجدول");
    statCell(strip, "من طبقة الحدود",
      M.localNoun(rows.filter((r) => r.kind === "geo").length, "indicatorRow"),
      "", "عدّ مباشر لا تقدير");
    el.appendChild(strip);

    const card = h("div", { class: "dash-card cmp-provcard" });
    card.appendChild(h("div", { class: "card-head" },
      h("div", { class: "card-title" }, "أصل كل مؤشر وصيغته"),
      h("div", { class: "card-sub" },
        "الإصدار " + String(rel.release.id) + " · بيانات حتى "
        + String(rel.meta.data_as_of) + " · تاريخ الحساب "
        + fmt.date(rel.meta.calculation_date))));
    const body = h("div", { class: "card-body" });
    const tb = h("tbody", {});
    for (const r of rows) {
      tb.appendChild(h("tr", { class: r.id === st.indicator ? "now" : null },
        h("td", {}, h("b", {}, r.label),
          r.note ? h("div", { class: "cmp-prov-note" }, r.note) : null),
        h("td", {}, r.familyLabel),
        h("td", {}, h("span", { class: "cmp-tag k-" + r.kind, title: r.kindNote }, r.kindLabel)),
        h("td", {}, r.unit),
        h("td", { class: "cmp-formula" }, r.formula),
        h("td", { class: "cmp-origin" }, r.origin),
        h("td", {}, r.betterLabel)));
    }
    body.appendChild(h("div", { class: "cmp-scroll" },
      h("table", { class: "table-dense cmp-provtbl" },
        h("thead", {}, h("tr", {},
          h("th", { scope: "col" }, "المؤشر"),
          h("th", { scope: "col" }, "العائلة"),
          h("th", { scope: "col" }, "النوع"),
          h("th", { scope: "col" }, "الوحدة"),
          h("th", { scope: "col" }, "الصيغة"),
          h("th", { scope: "col" }, "المرساة أو المصدر"),
          h("th", { scope: "col" }, "اتجاه التحسّن"))),
        tb)));
    card.appendChild(body);
    el.appendChild(card);

    const foot = h("div", { class: "cmp-foot" });
    honestLine(foot, "الاشتقاق التعريفي إعادة تعبير حسابية عن قيم منشورة — "
      + "ليس تقديراً ولا نموذجاً، ولا يُضاف إلى الإصدار ولا يُنشر مقياساً جديداً.");
    honestLine(foot, "مصادر الإصدار: "
      + (rel.sources || []).map((s) => s.name).join(" · "));
    el.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════════════════════
     2.8) الحالة، المزامنة المؤجَّلة، وتسجيل الملحق
     ══════════════════════════════════════════════════════════════════════ */

  /** الصفحات بترتيبها القانوني — الفهرس هو ما يُكتب في معامل `page` */
  const PAGES = Object.freeze([
    Object.freeze({ name: "مصفوفة المقارنة", build: pageMatrix }),
    Object.freeze({ name: "بطاقة القطاع", build: pageProfile }),
    Object.freeze({ name: "الفجوة والتركّز", build: pageGap }),
    Object.freeze({ name: "مطابقة المجاميع وحدودها", build: pageReconcile }),
    Object.freeze({ name: "الصيغ والمصادر", build: pageProvenance }),
  ]);

  /** نص زر العودة السياقي: اسم القسم المستدعي حرفياً من سجل الأقسام */
  function returnLabel(ret) {
    if (ret && ret.kind === "scene") {
      if (ret.id === "00") return "العودة إلى الغلاف";
      const def = (RH.sections && typeof RH.sections.get === "function")
        ? RH.sections.get(ret.id) : null;
      if (def && def.title) return "العودة إلى " + def.title;
    }
    return "العودة إلى العرض";
  }

  /**
   * قراءة الحالة من معاملات المسار مع تطهير كامل: أي قيمة خارج القوائم
   * القانونية تسقط إلى الافتراضي بصمت — معامل ملوث لا يكسر بناءً.
   */
  function readState(params, derived) {
    const p = params || {};
    const sectorParam = String(p.s || "");
    const fallbackSector = (derived && derived.rankings
      && M.SECTOR_ORDER.indexOf(derived.rankings.lowest_coverage) !== -1)
      ? derived.rankings.lowest_coverage : M.SECTOR_ORDER[0];
    return {
      indicator: M.safeIndicatorId(p.i),
      sector: M.SECTOR_ORDER.indexOf(sectorParam) !== -1 ? sectorParam : fallbackSector,
      view: M.VIEW_IDS.indexOf(String(p.v || "")) !== -1 ? String(p.v) : M.VIEW_IDS[0],
      family: M.FAMILY_IDS.indexOf(String(p.f || "")) !== -1 ? String(p.f) : "all",
      sortDir: SORT_CYCLE.indexOf(String(p.o || "")) !== -1 ? String(p.o) : "canonical",
    };
  }

  /** يركز عنصراً بمرجعه داخل شجرة الصفحة (بلا تمرير قافز) */
  function focusRefIn(root, ref) {
    if (!root || !ref || !root.querySelector) return;
    const el = root.querySelector("[data-ref=\"" + String(ref).replace(/"/g, "") + "\"]");
    if (!el || typeof el.focus !== "function") return;
    try { el.focus({ preventScroll: true }); } catch (_e) { el.focus(); }
  }

  /** ملخص ناطق مختصر لحالة الصفحة — يقرؤه قارئ الشاشة قبل الجدول */
  function srSummary(el, st, model) {
    const rw = M.row(model.release, model.derived, model.geo, st.indicator, model.C);
    if (!rw) return;
    const best = rw.best ? sectorShort(model, rw.best) : "—";
    const worst = rw.worst ? sectorShort(model, rw.worst) : "—";
    el.appendChild(h("p", { class: "cmp-sr" },
      "المؤشر المحدد: " + rw.label + "، وحدته " + rw.unit
      + "، قيمة المدينة " + M.formatValue(rw.fmtKey, rw.city)
      + "، أعلى القطاعين في هذا المقياس " + best
      + "، وأدناها " + worst + ". " + rw.rankingNote + "."));
  }

  RH.presenter.ax.register({
    id: "compare",
    kicker: "ملحق تحليلي",
    title: "مركز المقارنة القطاعية",
    returnLabel,
    pages(ctx) {
      /* نموذج البيانات يُبنى مرة لكل بناء — سياق الحساب مشترك بين الصفحات */
      const release = RH.data.store.release();
      const derived = RH.data.store.der();
      const geo = window.GEO || null;
      const model = {
        release, derived, geo,
        C: M.context(release, derived, geo),
      };

      const st = readState(ctx.params, derived);

      /* ما كُتب فعلاً في العنوان الآن — أساس المقارنة قبل أي كتابة جديدة */
      const written = Object.create(null);
      for (const k of PARAM_KEYS) written[k] = String(ctx.params[k] || "");

      let pageHost = null;
      let pageIndex = 0;
      let syncTimer = null;
      let syncFocusRef = null;
      let disposed = false;

      ctx.onTeardown(() => {
        disposed = true;
        clearTimeout(syncTimer);
        syncTimer = null;
      });

      /** الحالة الحالية بصيغة معاملات المسار (الفارغ يُحذف من العنوان) */
      function paramPayload() {
        return {
          i: st.indicator === M.DEFAULT_INDICATOR ? null : st.indicator,
          s: st.sector,
          v: st.view === M.VIEW_IDS[0] ? null : st.view,
          f: st.family === "all" ? null : st.family,
          o: st.sortDir === "canonical" ? null : st.sortDir,
        };
      }

      /**
       * الكتابة المؤجَّلة: تجمع ضغطات متتابعة في كتابة واحدة، ولا تكتب إلا
       * والملحق ما يزال المسار الحالي فعلاً — وإلا تسربت معاملاتنا إلى عنوان
       * القسم الذي عاد إليه المستخدم (الدرس المكتسب من ملحق الأطلس).
       */
      function runSync() {
        syncTimer = null;
        if (disposed) { syncFocusRef = null; return; }
        const cur = RH.presenter.engine.current();
        const curId = cur && cur.id ? String(cur.id).split("/")[0] : "";
        if (!cur || cur.kind !== "appendix" || curId !== "compare") {
          syncFocusRef = null;
          return;
        }
        const next = paramPayload();
        let changed = false;
        for (const k of PARAM_KEYS) {
          if (String(next[k] || "") !== String(written[k] || "")) changed = true;
        }
        if (!changed) { syncFocusRef = null; return; }
        pendingFocus = syncFocusRef;
        syncFocusRef = null;
        ctx.update(next);
      }

      function scheduleSync(ref) {
        syncFocusRef = ref || syncFocusRef;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(runSync, 420);
      }

      /**
       * إعادة رسم الصفحة الحالية في مكانها — لا إعادة بناء للملحق كله.
       * كل محتوى الصفحة داخل جذر واحد `.cmp-page` كي تبقى فجوة `.ax-page`
       * المعتمدة بلا أثر على تخطيط هذه الميزة (لا لمس لـ appendix.css).
       */
      function render(focusRef) {
        if (!pageHost) return;
        RH.core.dom.clear(pageHost);
        const page = h("div", { class: "cmp-page" });
        srSummary(page, st, model);
        PAGES[pageIndex].build(page, st, model, actions);
        pageHost.appendChild(page);
        const ref = focusRef || pendingFocus;
        pendingFocus = null;
        if (ref) focusRefIn(pageHost, ref);
      }

      /** انتقال صفحة يحمل معه كل الحالة دفعة واحدة (لا كتابتان متتاليتان) */
      function goPage(n) {
        clearTimeout(syncTimer);
        syncTimer = null;
        syncFocusRef = null;
        if (disposed) return;
        const payload = paramPayload();
        payload.page = n === 0 ? null : String(n);
        ctx.update(payload);
      }

      const actions = {
        /** اختيار مؤشر: تحديث فوري في المكان + كتابة مؤجَّلة للعنوان */
        pickIndicator(id, ref) {
          const safe = M.safeIndicatorId(id);
          if (safe === st.indicator) { return; }
          st.indicator = safe;
          const target = ref || (pageIndex === 0 ? "row:" + safe : "chip:" + safe);
          render(target);
          scheduleSync(target);
        },
        /** اختيار قطاع داخل صفحة البطاقة */
        pickSector(sid) {
          if (M.SECTOR_ORDER.indexOf(sid) === -1 || sid === st.sector) return;
          st.sector = sid;
          render("psec:" + sid);
          scheduleSync("psec:" + sid);
        },
        /** ترشيح عائلة: يضمن بقاء المؤشر المحدد داخل العائلة المعروضة */
        pickFamily(fid) {
          if (M.FAMILY_IDS.indexOf(fid) === -1 || fid === st.family) return;
          st.family = fid;
          const list = M.indicatorsOf(fid);
          if (!list.some((d) => d.id === st.indicator) && list.length) {
            st.indicator = list[0].id;
          }
          const ref = (pageIndex === 2 ? "gfam:" : "fam:") + fid;
          render(ref);
          scheduleSync(ref);
        },
        /** تبديل وضع عرض الخلايا */
        pickView(vid) {
          if (M.VIEW_IDS.indexOf(vid) === -1 || vid === st.view) return;
          st.view = vid;
          render("view:" + vid);
          scheduleSync("view:" + vid);
        },
        /** تدوير ترتيب أعمدة القطاعات: قانوني ← تنازلي ← تصاعدي */
        cycleSort() {
          const i = SORT_CYCLE.indexOf(st.sortDir);
          st.sortDir = SORT_CYCLE[(i + 1) % SORT_CYCLE.length];
          render("sort:cycle");
          scheduleSync("sort:cycle");
        },
        /** فتح بطاقة قطاع من أي صفحة */
        openSector(sid) {
          if (M.SECTOR_ORDER.indexOf(sid) === -1) return;
          st.sector = sid;
          goPage(1);
        },
        /** اختيار مؤشر ثم الانتقال إلى صفحة بعينها */
        pickIndicatorAndGo(id, page) {
          st.indicator = M.safeIndicatorId(id);
          goPage(page);
        },
        /** انتقال صفحة مباشر (أزرار «تحليل الفجوة» ونظائرها) */
        goPage,
      };

      return PAGES.map((p, i) => ({
        name: p.name,
        build(el) {
          pageHost = el;
          pageIndex = i;
          render(null);
        },
      }));
    },
  });
})();
