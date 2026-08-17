/* ════════════════════════════════════════════════════════════════════════════
   ax-methodology.js — ملحق المنهجية والإسناد (ملحق `methodology`)
   عقد V2_CONTRACTS_EXPANSION §8.1 — بادئة الأنماط `mth-` في src/styles/methodology.css
   ────────────────────────────────────────────────────────────────────────────
   ما تفعله هذه الوحدة بالضبط:

     ▸ تنشر نموذجاً **نقياً** على `RH.explore.methodology` (لا DOM إطلاقاً)
       يجيب على سؤال واحد: «من أين جاء كل رقم في هذا العرض، ومن يملكه، وما
       الذي لم يُعتمد بعد؟». مكوناته:
         · هوية الإصدار ومصادره وفتراته الزمنية كما وردت في `release`.
         · صف إسناد لكل مقياس خام (ورقة/مرساة/مصدر) ولكل مشتقة (صيغة/إصدار
           صيغة/مدخلات)، مع سلسلة اعتماد كاملة للمشتقات ومعكوسها (من يعتمد
           على هذا المقياس).
         · بحث وترشيح وترتيب وترقيم صفحات — منطق نقي قابل للاختبار وحده.
         · تشغيل بوابات التحقق **حيّاً** عبر `RH.data.validate.validateRelease`
           وعرض العد الحقيقي لا رقماً مكتوباً في الكود.
         · سجل الوسوم الملازمة (الامتثال، السيناريوهات، الهدف الاسترشادي،
           عينة الأحياء، إخلاء الخريطة، القيم الحالية للمؤشرات، الحجر) —
           كل وسم بنصه الحرفي من الإصدار.
         · جدول قرارات المطابقة R1–R12 منقولاً بصياغة عرضية من
           `docs/DATA_RECONCILIATION.md` §3، مع **قرينة حيّة** من الإصدار
           لكل قرار له أثر مسجَّل فيه.

     ▸ تسجّل ملحقاً من أربع صفحات عبر `RH.presenter.ax.register` (يرث هيكل
       الصفحات والعودة السياقية ومفاتيح التقليب من ax-shell).

   قواعد ملزمة مطبَّقة حرفياً في هذا الملف:
   • **لا رقم مختلق ولا نص مختلق**: كل قيمة معروضة تُقرأ من `release` عبر
     `RH.core.fmt`؛ وكل نص وسم/تحفظ/ملاحظة يُعرض بنصه الحرفي من الإصدار.
     جدول R1–R12 وحده ثابت التأليف (مصدره وثيقة لا إصدار) — وقد جُرِّد من
     كل رقم عمداً: الأرقام التي كانت في الوثيقة تأتي هنا من الإصدار الحي
     (بطاقة «القرينة في الإصدار») فلا يتجمد رقم في كود.
   • **الوسم يسافر مع الرقم**: ‏81.6٪ لا تظهر في هذا الملحق إلا ومعها
     `compliance.note` و«قيمة مورّدة — بانتظار اعتماد المنهجية»؛ وكذلك
     السيناريوهات والهدف الاسترشادي وعينة الأحياء.
   • **منظومة المعنى مقفلة**: الذهبي لوسوم الاعتماد وخط الأساس حصراً،
     المرجاني للحاجب/العجز حصراً، الأخضر للاجتياز، المحايد للمعلومة.
     لا محاور مزدوجة ولا gauges — النسب بأشرطة `RH.viz.micro.ratioBar`.
   • **لوحة المفاتيح**: حقل البحث والأزرار والتبويبات وصفوف الجداول كلها
     عناصر حقيقية قابلة للتركيز وموسومة `data-interactive` فلا يبتلع جهاز
     التقديم ضغطاتها (عقد §8)؛ الأسهم وHome/End تتنقل داخل القوائم.
   • **الحالة تصمد**: الاستعلام والترشيح والترتيب والصفحة والمقياس المختار
     تُكتب في معاملات المسار عبر `ctx.update` (مؤجَّلة أثناء الكتابة) فتعود
     كما تُركت عند الرجوع إلى الملحق.
   • **التنظيف**: كل مؤقت مؤجَّل يُلغى في `ctx.onTeardown`؛ لا مستمع عام ولا
     مثيل ECharts هنا (كل الرسوم SVG/DOM من `RH.viz.micro`).
   • **prefers-reduced-motion**: لا حركة في هذا الملف؛ الانتقالات البصرية
     في methodology.css وتُصفَّر هناك عند طلب التقليل.

   ملاحظة قابلية الاختبار (عقد التوسعة §0): النموذج النقي يُعرَّف وقت التحميل
   دون لمس `document`/`window`، وتسجيل الملحق مشروط بحضور `RH.presenter.ax`
   كي يُحمَّل الملف في بيئة اختبار الوحدة بنموذجه وحده.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════════════════════════════════════════════════════════════════
   القسم 1) النموذج النقي — RH.explore.methodology
   الفضاء `RH.explore` منشأ سلفاً في ns.js (عقد §2.1) فيُكتب عليه مباشرة.
   ══════════════════════════════════════════════════════════════════════════ */
RH.explore.methodology = (function () {
  const fmt = RH.core.fmt;

  /* ── 1.0) مفردات عرض مقفلة (ليست بيانات) ────────────────────────────── */

  /** حالات الاعتماد المعروفة ونصوصها المعتمدة في المشروع — مرآة الخريطة
      نفسها في الأقسام والملاحق (نص واجهة مقفل، لا اشتقاق منه). حالة غير
      معروفة تُعرض بمعرفها الخام: صدق لا تجميل. */
  const STATUS_LABELS = Object.freeze({
    approved: "معتمد",
    approved_brief: "موجز معتمد — اجتاز بوابة مجمع الحقائق",
    approved_source_mirror: "مرآة حرفية لمصدر معتمد",
    pending_approval: "بانتظار الاعتماد",
    pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
    indicative_not_approved: "قيمة استرشادية — غير معتمدة",
    supplied_unvalidated: "سيناريوهات مورّدة — غير معتمدة",
    published: "إصدار منشور",
    quarantined: "محجورة — لا تُعرض حقيقةً رسمية",
  });

  /** نوع القيمة: خام من ورقة، أو مشتقة بصيغة معلنة */
  const KIND_LABELS = Object.freeze({
    raw: "خام",
    derived: "مشتق",
  });

  /** مستويات البوابات: حاجبة تمنع النشر، منذِرة تُسجَّل ولا تمنع */
  const GATE_LEVELS = Object.freeze({
    block: { key: "block", label: "حاجبة", note: "تمنع النشر عند الفشل" },
    warn: { key: "warn", label: "منذِرة", note: "تُسجَّل وتتطلب قراراً لا تمنع" },
  });

  /** مجموعات البوابات بأسمائها العربية — المفتاح هو ما قبل أول نقطة في
      معرف البوابة (`licensing.chain.beds` → `licensing`). مجموعة غير
      معروفة تُعرض بمفتاحها الخام. */
  const GATE_GROUPS = Object.freeze({
    demand: "الطلب",
    beds: "الطاقة المرخصة",
    visits: "الزيارات",
    violations: "المخالفات",
    monitoring: "الرقابة",
    facility: "أنواع الإيواء",
    collar: "تركيبة الياقات",
    econ: "الأنشطة الاقتصادية",
    licensing: "سلاسل التراخيص",
    series: "أطوال السلاسل",
    counts: "سلامة الأعداد",
    occupancy: "الإشغال",
    scenarios: "السيناريوهات",
    months: "تسلسل الأشهر",
    nbhd: "عينة الأحياء",
    strategy: "الاستراتيجية",
    kpi: "مؤشرات الأداء",
    insight: "نصوص التحليل",
    insight_panels: "لوحات الرؤى",
    next_steps: "الخطوات القادمة",
    compliance: "معدل الامتثال",
    meta: "بيانات التعريف",
    derived: "اتساق المشتقات",
    validate: "الفحص ذاته",
  });

  /** أسماء عربية للمشتقات التي لا تحمل `label` في الإصدار — نص واجهة فقط.
      أي `label` وارد في البيانات يتقدّم على هذه الأسماء دائماً. */
  const DERIVED_AR = Object.freeze({
    deficit_beds: "عجز الأسرّة",
    coverage_pct: "نسبة تغطية الطلب",
    uncovered_pct: "نسبة الطلب غير المغطى",
    occupancy_pct: "نسبة إشغال الطاقة المرخصة",
    vacant_beds: "الأسرّة الشاغرة",
    blue_share_pct: "حصة الياقات الزرقاء من الطلب",
    white_share_pct: "حصة الياقات البيضاء من الطلب",
    growth_building_abs: "نمو رخص البناء عن خط الأساس",
    growth_building_pct: "نسبة نمو رخص البناء عن خط الأساس",
    growth_operational_abs: "نمو الرخص التشغيلية عن خط الأساس",
    growth_operational_pct: "نسبة نمو الرخص التشغيلية عن خط الأساس",
    growth_beds_abs: "نمو الطاقة المرخصة عن خط الأساس",
    growth_beds_pct: "نسبة نمو الطاقة المرخصة عن خط الأساس",
    avg_monthly_visits: "متوسط الزيارات الميدانية شهرياً",
    south_violations_share_pct: "حصة قطاع الجنوب من إجمالي المخالفات",
  });

  /** معرفات مركّبة لا تُعرض صفوفاً مفردة في جدول الأصل (كائنات لا قيَماً):
      لكل منها موضعه الخاص في الأقسام والملاحق. */
  const COMPOSITE_DERIVED = Object.freeze(["sector_derived", "rankings"]);

  /** مفاتيح ترتيب جدول الأصل ونصوصها */
  const SORT_KEYS = Object.freeze([
    { key: "label", label: "الاسم" },
    { key: "value", label: "القيمة" },
    { key: "kind", label: "النوع" },
    { key: "origin", label: "المصدر" },
  ]);

  const PER_PAGE_OPTIONS = Object.freeze([8, 12, 20]);
  const DEFAULT_PER_PAGE = 12;

  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const str = (v) => (v == null ? "" : String(v));

  /* ── 1.1) هوية الإصدار والمصادر والفترات ────────────────────────────── */

  /** اختصار الهاش بقالب ثابت: أول n محرفاً ثم علامة قطع — لا تقصير عشوائي */
  function shortSha(sha, n) {
    const s = str(sha);
    const take = isNum(n) && n > 0 ? Math.trunc(n) : 16;
    if (!s) return "—";
    return s.length <= take ? s : s.slice(0, take) + "…";
  }

  /** حالة معروضة لأي مفتاح حالة — النص المعتمد أو المعرف الخام صدقاً */
  function statusLabel(status) {
    const k = str(status);
    if (!k) return "—";
    return STATUS_LABELS[k] || k;
  }

  /**
   * هوية الإصدار كما وردت في `release.release` (+ schema_version).
   * `baseReleaseId` الغائب يبقى null — والواجهة تقول «الإصدار التأسيسي»
   * لأن ذلك هو معنى غيابه في نموذج الإصدارات، لا اختلاقاً لسلف.
   */
  function identity(release) {
    const r = (release && release.release) || {};
    return {
      id: str(r.id) || "—",
      status: str(r.status),
      statusLabel: statusLabel(r.status),
      publishedAt: str(r.published_at),
      publishedBy: str(r.published_by),
      baseReleaseId: r.base_release_id == null ? null : str(r.base_release_id),
      notes: str(r.notes),
      sha256: str(r.sha256),
      shaShort: shortSha(r.sha256, 16),
      schemaVersion: str(release && release.schema_version),
    };
  }

  /**
   * سجل المصادر كاملاً — كل مصدر بهاشه واختصاره ووسم خصوصيته.
   * `private:true` يعني: الملف الأصلي لا يُضمَّن في الحزمة المنشورة
   * ويُسجَّل هاشه فقط (قرار المطابقة R12).
   */
  function sources(release) {
    const list = (release && release.sources) || [];
    return list.map((s) => ({
      id: str(s.id),
      name: str(s.name),
      kind: str(s.kind),
      templateVersion: str(s.template_version),
      sha256: str(s.sha256),
      shaShort: shortSha(s.sha256, 16),
      importedAt: str(s.imported_at),
      isPrivate: s.private === true,
      privacyNote: s.private === true
        ? "ملف خاص — لا يُضمَّن في الحزمة المنشورة، ويُسجَّل هاشه فقط"
        : "",
    }));
  }

  /** اسم مصدر بمعرفه أو المعرف الخام إن لم يوجد */
  function sourceName(release, sourceId) {
    for (const s of (release && release.sources) || []) {
      if (s.id === sourceId) return str(s.name);
    }
    return str(sourceId) || "—";
  }

  /**
   * صفوف الفترات والتواريخ من `meta` — الحقول الأربعة المنفصلة التي يوجب
   * عقد الإسناد فصلها (فترة الرصد، البيانات حتى، تاريخ الحساب، تاريخ العرض)
   * مع خط الأساس ومؤهّل المقارنة والإخلاءات الدائمة.
   */
  function periodRows(release) {
    const m = (release && release.meta) || {};
    const rows = [
      {
        id: "monitoring_period",
        label: "فترة الرصد",
        value: str(m.monitoring_period_label),
        note: "من " + str(m.monitoring_period_start) + " إلى "
          + str(m.monitoring_period_end),
        flag: null,
      },
      {
        id: "data_as_of",
        label: "البيانات حتى",
        value: str(m.data_as_of),
        note: "آخر شهر مكتمل في ورقة البيانات",
        flag: null,
      },
      {
        id: "calculation_date",
        label: "تاريخ الحساب",
        value: m.calculation_date ? fmt.date(m.calculation_date) : "—",
        note: "المرجع الزمني لقاعدة حالة المبادرات (متأخرة حكماً)",
        flag: null,
      },
      {
        id: "presentation_date",
        label: "تاريخ العرض",
        value: m.presentation_date ? fmt.date(m.presentation_date) : "—",
        note: "يُثبَّت من الإدارة قبل يوم العرض",
        flag: m.presentation_date_needs_confirmation === true
          ? "بانتظار التأكيد" : null,
      },
      {
        id: "baseline_label",
        label: "خط الأساس",
        value: str(m.baseline_label),
        note: "كل نمو معروض يقاس إليه",
        flag: null,
      },
      {
        id: "comparison_qualifier",
        label: "مؤهّل المقارنة",
        value: str(m.comparison_qualifier),
        note: "الصيغة الملزمة لكل عبارة مقارنة في العرض",
        flag: null,
      },
    ];
    /* صف بلا قيمة في الإصدار يسقط بصمت — لا خانة فارغة معروضة بلا معنى؛
       وتاريخ العرض يبقى دائماً لأن غيابه ذاته معلومة (بانتظار التأكيد). */
    return rows.filter((r) => r.id === "presentation_date"
      || (r.value && r.value !== "—"));
  }

  /** الإخلاءات الدائمة الملازمة (خريطة/عينة) بنصها الحرفي من `meta` */
  function standingDisclaimers(release) {
    const m = (release && release.meta) || {};
    const out = [];
    if (m.map_disclaimer) {
      out.push({
        id: "map_disclaimer",
        label: "إخلاء الخريطة",
        text: str(m.map_disclaimer),
        rule: "يلازم كل استخدام لهندسة الخريطة (قرار المطابقة R11)",
      });
    }
    if (m.sample_label) {
      out.push({
        id: "sample_label",
        label: "وسم العينة",
        text: str(m.sample_label),
        rule: "يلازم كل قيمة على مستوى الحي (قرار المطابقة R10)",
      });
    }
    const nb = release && release.neighbourhoods;
    if (nb && nb.ranking_note) {
      out.push({
        id: "ranking_note",
        label: "قاعدة الترتيب داخل العينة",
        text: str(nb.ranking_note),
        rule: "أي ترتيب معروض يسمّي مقياسه ويعلن أنه داخل العينة",
      });
    }
    return out;
  }

  /* ── 1.2) أصل كل مقياس: صفوف الإسناد ─────────────────────────────────
     الصف الواحد يجيب على أربعة أسئلة: ما الاسم؟ ما القيمة ووحدتها؟ من أين
     جاءت (ورقة ومرساة أو صيغة وإصدارها)؟ وعلى ماذا تعتمد؟
     ─────────────────────────────────────────────────────────────────── */

  /** اسم معروض لمقياس: `label` الوارد في البيانات يتقدم، ثم القاموس، ثم المعرف */
  function metricLabel(id, entry) {
    if (entry && entry.label) return str(entry.label);
    if (DERIVED_AR[id]) return DERIVED_AR[id];
    return str(id);
  }

  /** نص القيمة منسقاً عبر fmt حصراً: النسب بعلامة ٪ معزولة، وسواها بفاصل آلاف */
  function valueText(row) {
    if (!row || !isNum(row.value)) return "—";
    return row.unit === "٪" ? fmt.pct(row.value) : fmt.int(row.value);
  }

  /** نص القيمة مع وحدتها حيث تكون الوحدة معدوداً لا علامة */
  function valueWithUnit(row) {
    if (!row || !isNum(row.value)) return "—";
    if (row.unit === "٪") return fmt.pct(row.value);
    return row.unit ? fmt.int(row.value) + fmt.NBSP + row.unit : fmt.int(row.value);
  }

  /** سطر المصدر الموحد: مرساة الورقة للخام، والصيغة وإصدارها للمشتق */
  function originText(row) {
    if (!row) return "—";
    if (row.kind === "raw") {
      const sheet = row.sheet ? "ورقة «" + row.sheet + "»" : "ورقة غير مسماة";
      const anchor = row.anchor ? " خلية " + fmt.iso(row.anchor) : "";
      return sheet + anchor;
    }
    const fv = row.formulaVersion ? " (إصدار الصيغة " + fmt.iso(row.formulaVersion) + ")" : "";
    return "مشتق: " + fmt.iso(row.formula || "صيغة غير معلنة") + fv;
  }

  /** صف إسناد لمقياس خام */
  function rawRow(release, id, m) {
    return {
      id: str(id),
      label: metricLabel(id, m),
      value: isNum(m.value) ? m.value : null,
      unit: str(m.unit),
      kind: "raw",
      kindLabel: KIND_LABELS.raw,
      sheet: str(m.sheet),
      anchor: str(m.anchor),
      sourceId: str(m.source_id),
      sourceName: sourceName(release, m.source_id),
      formula: "",
      formulaVersion: "",
      inputs: [],
    };
  }

  /** صف إسناد لمشتقة منشورة */
  function derivedRow(id, d) {
    return {
      id: str(id),
      label: metricLabel(id, d),
      value: isNum(d.value) ? d.value : null,
      unit: str(d.unit),
      kind: "derived",
      kindLabel: KIND_LABELS.derived,
      sheet: "",
      anchor: "",
      sourceId: "",
      sourceName: "",
      formula: str(d.formula),
      formulaVersion: str(d.formula_version),
      inputs: Array.isArray(d.inputs) ? d.inputs.map(str) : [],
    };
  }

  /** كل المقاييس الخام بترتيب ورودها في الإصدار */
  function rawRows(release) {
    const metrics = (release && release.metrics) || {};
    const out = [];
    for (const id of Object.keys(metrics)) {
      const m = metrics[id];
      if (!m || typeof m !== "object") continue;
      out.push(rawRow(release, id, m));
    }
    return out;
  }

  /** كل المشتقات القياسية (المركّبة مستثناة — لها موضعها الخاص) */
  function derivedRows(release) {
    const der = (release && release.derived) || {};
    const out = [];
    for (const id of Object.keys(der)) {
      if (COMPOSITE_DERIVED.includes(id)) continue;
      const d = der[id];
      if (!d || typeof d !== "object" || !isNum(d.value)) continue;
      out.push(derivedRow(id, d));
    }
    return out;
  }

  /** جدول الأصل الشامل: الخام أولاً ثم المشتق (ترتيب القراءة الطبيعي) */
  function provenanceRows(release) {
    return rawRows(release).concat(derivedRows(release));
  }

  /** فهرس سريع من المعرف إلى الصف */
  function rowIndex(rows) {
    const idx = Object.create(null);
    for (const r of rows || []) idx[r.id] = r;
    return idx;
  }

  /** صف بمعرفه من قائمة صفوف */
  function rowById(rows, id) {
    for (const r of rows || []) {
      if (r.id === id) return r;
    }
    return null;
  }

  /** إحصاء المجموعتين ومجموع الأوراق المستخدمة */
  function coverageStats(release) {
    const raws = rawRows(release);
    const ders = derivedRows(release);
    const sheets = new Set();
    for (const r of raws) {
      if (r.sheet) sheets.add(r.sheet);
    }
    return {
      raw: raws.length,
      derived: ders.length,
      total: raws.length + ders.length,
      sheets: sheets.size,
      sources: ((release && release.sources) || []).length,
      composite: COMPOSITE_DERIVED.length,
    };
  }

  /** توزيع المقاييس الخام على أوراق المصنف — مرتباً تنازلياً ثم أبجدياً */
  function sheetIndex(release) {
    const bag = new Map();
    for (const r of rawRows(release)) {
      const key = r.sheet || "—";
      if (!bag.has(key)) bag.set(key, { sheet: key, count: 0, ids: [] });
      const e = bag.get(key);
      e.count += 1;
      e.ids.push(r.id);
    }
    return Array.from(bag.values()).sort((a, b) =>
      b.count - a.count || (a.sheet < b.sheet ? -1 : a.sheet > b.sheet ? 1 : 0));
  }

  /**
   * سلسلة الاعتماد لمشتقة: مدخلاتها ثم مدخلات مدخلاتها حتى الخام.
   * آمنة ضد الدوران (مجموعة زيارة) ومحدودة العمق كي لا تنفجر شجرة عرض.
   * تعيد قائمة مسطحة بترتيب العمق: [{id, row|null, depth, via}].
   */
  function dependencyChain(release, id, maxDepth) {
    const rows = provenanceRows(release);
    const idx = rowIndex(rows);
    const limit = isNum(maxDepth) && maxDepth > 0 ? Math.trunc(maxDepth) : 4;
    const seen = new Set([str(id)]);
    const out = [];
    let frontier = [{ id: str(id), via: null }];
    for (let depth = 1; depth <= limit && frontier.length; depth++) {
      const next = [];
      for (const node of frontier) {
        const row = idx[node.id];
        const inputs = row && row.kind === "derived" ? row.inputs : [];
        for (const inputId of inputs) {
          if (seen.has(inputId)) continue;
          seen.add(inputId);
          const child = { id: inputId, row: idx[inputId] || null, depth, via: node.id };
          out.push(child);
          next.push({ id: inputId, via: node.id });
        }
      }
      frontier = next;
    }
    return out;
  }

  /** معكوس السلسلة: أي المشتقات المنشورة تعتمد على هذا المقياس مباشرة */
  function dependentsOf(release, id) {
    const target = str(id);
    return derivedRows(release).filter((r) => r.inputs.includes(target));
  }

  /**
   * وصف نصي كامل لصف واحد — يُستعمل للتسمية الصوتية ولملخص قارئ الشاشة،
   * ويُختبر بوصفه صياغة نقية لا DOM فيها.
   */
  function describeRow(row) {
    if (!row) return "—";
    const parts = [row.label + ": " + valueWithUnit(row)];
    if (row.kind === "raw") {
      parts.push("قيمة خام من " + originText(row)
        + (row.sourceName ? " — " + row.sourceName : ""));
    } else {
      parts.push("قيمة مشتقة بالصيغة " + fmt.iso(row.formula || "—")
        + (row.formulaVersion ? " بإصدار " + fmt.iso(row.formulaVersion) : ""));
      if (row.inputs.length) {
        parts.push("مدخلاتها: " + row.inputs.join("، "));
      }
    }
    return parts.join(". ") + ".";
  }

  /* ── 1.3) البحث والترشيح والترتيب والترقيم — منطق نقي مختبَر ──────────
     التطبيع عبر `RH.viz.geoutils.normalizeAr` حصراً (عقد §10: ممنوع نسخ
     منطق تطبيع جديد في ملفات الميزات).
     ─────────────────────────────────────────────────────────────────── */

  /** تطبيع نص للمطابقة الحرة — بوابة واحدة إلى أدوات الجغرافيا المشتركة */
  function normalize(s) {
    const geo = RH.viz && RH.viz.geoutils;
    if (geo && typeof geo.normalizeAr === "function") return geo.normalizeAr(s);
    /* تدهور رشيق: البناء الجزئي قد يسبق ضم الأدوات — المطابقة تبقى عاملة
       بأدنى تطبيع (قصّ وخفض) بدل أن تتعطل الميزة كلياً. */
    return str(s).trim().toLowerCase();
  }

  /** حقول المطابقة لصف واحد — تُجمع مرة وتُطبَّع مرة (لا تطبيع داخل حلقة) */
  function searchTextOf(row) {
    return [row.label, row.id, row.unit, row.sheet, row.anchor,
      row.formula, row.sourceName, row.kindLabel]
      .concat(row.inputs || [])
      .filter(Boolean).join(" ");
  }

  /** هل يطابق الصف استعلاماً مطبَّعاً سلفاً؟ استعلام فارغ يطابق كل شيء */
  function matchRow(row, normQuery) {
    if (!normQuery) return true;
    return normalize(searchTextOf(row)).indexOf(normQuery) !== -1;
  }

  /** ترشيح بالبحث الحر — يحافظ على ترتيب الإدخال (الترتيب شأن sortRows) */
  function searchRows(rows, query) {
    const q = normalize(query);
    if (!q) return (rows || []).slice();
    return (rows || []).filter((r) => matchRow(r, q));
  }

  /**
   * ترشيح مركّب: النوع (raw|derived|all) + الورقة + الاستعلام الحر.
   * كل معيار غائب = لا ترشيح به (لا افتراضات صامتة).
   */
  function filterRows(rows, opts) {
    const o = opts || {};
    let out = (rows || []).slice();
    if (o.kind === "raw" || o.kind === "derived") {
      out = out.filter((r) => r.kind === o.kind);
    }
    if (o.sheet) out = out.filter((r) => r.sheet === o.sheet);
    if (o.query) out = searchRows(out, o.query);
    return out;
  }

  /**
   * ترتيب مستقر: المقارنة على القيم الخام لا المنسقة (قاعدة المشروع)،
   * والتعادل يفصله ترتيب الإدخال الأصلي فلا يهتز الجدول بين رسمين.
   * مفتاح غير معروف → لا ترتيب (يعيد نسخة كما هي).
   */
  function sortRows(rows, key, dir) {
    const list = (rows || []).map((r, i) => ({ r, i }));
    const sign = dir === "desc" ? -1 : 1;
    const known = SORT_KEYS.some((k) => k.key === key);
    if (!known) return (rows || []).slice();
    const cmpText = (a, b) => {
      const x = normalize(a), y = normalize(b);
      return x < y ? -1 : x > y ? 1 : 0;
    };
    list.sort((A, B) => {
      const a = A.r, b = B.r;
      let c = 0;
      if (key === "value") {
        /* القيم الغائبة تُدفع إلى الذيل في الاتجاهين — الغياب ليس صفراً */
        const av = isNum(a.value) ? a.value : null;
        const bv = isNum(b.value) ? b.value : null;
        if (av == null && bv == null) c = 0;
        else if (av == null) return 1;
        else if (bv == null) return -1;
        else c = av - bv;
      } else if (key === "kind") {
        c = cmpText(a.kindLabel, b.kindLabel);
      } else if (key === "origin") {
        c = cmpText(originText(a), originText(b));
      } else {
        c = cmpText(a.label, b.label);
      }
      if (c !== 0) return c * sign;
      return A.i - B.i;
    });
    return list.map((x) => x.r);
  }

  /**
   * حساب الترقيم: يعيد النافذة الحالية وحدودها بصدق حسابي كامل.
   * قائمة فارغة → صفحة واحدة فارغة (pages=1) كي لا يعرض العداد «0 من 0».
   * الصفحة خارج المدى تُقصّ إلى أقرب صفحة صالحة (لا صفحة بيضاء صامتة).
   */
  function paginate(list, page, perPage) {
    const items = Array.isArray(list) ? list : [];
    let per = isNum(perPage) ? Math.trunc(perPage) : DEFAULT_PER_PAGE;
    if (per < 1) per = DEFAULT_PER_PAGE;
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / per));
    let p = isNum(page) ? Math.trunc(page) : parseInt(page, 10);
    if (!isNum(p)) p = 0;
    p = Math.max(0, Math.min(pages - 1, p));
    const from = total ? p * per : 0;
    const to = Math.min(total, from + per);
    return {
      page: p,
      pages,
      perPage: per,
      total,
      from,
      to,
      /* أرقام العرض للبشر: تبدأ من 1 وتساوي 0 عند الفراغ */
      firstIndex: total ? from + 1 : 0,
      lastIndex: to,
      hasPrev: p > 0,
      hasNext: p < pages - 1,
      items: items.slice(from, to),
    };
  }

  /**
   * نافذة أزرار الصفحات حول الصفحة الحالية (span فردي مثالياً) — تُبقي
   * العدد ثابتاً عند الأطراف فلا يقفز عرض شريط الترقيم بين صفحة وأخرى.
   */
  function pageWindow(page, pages, span) {
    const n = Math.max(1, isNum(pages) ? Math.trunc(pages) : 1);
    const s = Math.max(1, Math.min(n, isNum(span) ? Math.trunc(span) : 5));
    let p = isNum(page) ? Math.trunc(page) : 0;
    p = Math.max(0, Math.min(n - 1, p));
    let start = p - Math.floor(s / 2);
    if (start < 0) start = 0;
    if (start + s > n) start = n - s;
    const out = [];
    for (let i = start; i < start + s; i++) out.push(i);
    return out;
  }

  /* ── 1.4) بوابات التحقق حيّاً ────────────────────────────────────────
     العد المعروض في هذا الملحق ناتج **تشغيل فعلي** لـ
     `RH.data.validate.validateRelease` على الإصدار المحمَّل الآن — لا رقم
     مكتوب في الكود ولا منسوخ من الوثائق. غياب وحدة التحقق (بناء جزئي)
     يعطي نموذجاً صادقاً بحالة `unavailable` لا صفراً مضللاً.
     ─────────────────────────────────────────────────────────────────── */

  /** مجموعة البوابة = ما قبل أول نقطة في معرفها */
  function gateGroupOf(id) {
    const s = str(id);
    const i = s.indexOf(".");
    return i === -1 ? s : s.slice(0, i);
  }

  /** اسم المجموعة العربي أو مفتاحها الخام صدقاً */
  function gateGroupLabel(key) {
    return GATE_GROUPS[key] || str(key) || "—";
  }

  /**
   * تجميع البوابات في مجموعات بعدادات كل مجموعة، مرتبة بالأكثر فشلاً ثم
   * بالأكثر عدداً — فما يحتاج نظر المدقق يتصدر بلا بحث.
   */
  function groupGates(gates) {
    const bag = new Map();
    for (const g of gates || []) {
      const key = gateGroupOf(g.id);
      if (!bag.has(key)) {
        bag.set(key, {
          key, label: gateGroupLabel(key),
          total: 0, passed: 0, failed: 0, blockers: 0, warnings: 0, gates: [],
        });
      }
      const e = bag.get(key);
      e.total += 1;
      e.gates.push(g);
      if (g.ok) e.passed += 1;
      else {
        e.failed += 1;
        if (g.level === "block") e.blockers += 1;
        else e.warnings += 1;
      }
    }
    return Array.from(bag.values()).sort((a, b) =>
      b.blockers - a.blockers || b.failed - a.failed || b.total - a.total
      || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  }

  /**
   * نموذج البوابات الحي الكامل.
   * `recorded` هو ما سجّله مولّد البيانات وقت البناء (`release.validation`) —
   * يُعرض إلى جانب العد الحي **لا بديلاً عنه**: المجموعتان فحوص مختلفة
   * (بوابات البناء في بايثون مقابل درع التشغيل في المتصفح)، وخلط الرقمين
   * تضليل. لذلك يحمل النموذج الرقمين معاً وسمةً `comparable:false`.
   */
  function gatesModel(release) {
    const recordedBlock = (release && release.validation) || null;
    const recorded = recordedBlock ? {
      passed: isNum(recordedBlock.gates_passed) ? recordedBlock.gates_passed : null,
      total: isNum(recordedBlock.gates_total) ? recordedBlock.gates_total : null,
      checkedAt: str(recordedBlock.checked_at),
    } : null;

    const V = RH.data && RH.data.validate;
    if (!V || typeof V.validateRelease !== "function") {
      return {
        available: false,
        gates: [], groups: [], total: 0, passed: 0, failed: 0,
        blockers: [], warnings: [], recorded, comparable: false,
        unavailableNote: "وحدة التحقق غير مضمَّنة في هذا البناء — لا يُعرض عدد "
          + "بديل ولا يُنسخ رقم من وثيقة",
      };
    }

    let res;
    try {
      res = V.validateRelease(release);
    } catch (e) {
      return {
        available: false,
        gates: [], groups: [], total: 0, passed: 0, failed: 0,
        blockers: [], warnings: [], recorded, comparable: false,
        unavailableNote: "تعذر إكمال الفحص الحي: " + str(e && e.message ? e.message : e),
      };
    }

    const gates = (res && res.gates) || [];
    const passed = gates.filter((g) => g.ok).length;
    const blockers = (res && res.blockers) || gates.filter((g) => g.level === "block" && !g.ok);
    const warnings = (res && res.warnings) || gates.filter((g) => g.level === "warn" && !g.ok);
    return {
      available: true,
      gates,
      groups: groupGates(gates),
      total: gates.length,
      passed,
      failed: gates.length - passed,
      blockers,
      warnings,
      byLevel: {
        block: gates.filter((g) => g.level === "block").length,
        warn: gates.filter((g) => g.level === "warn").length,
      },
      recorded,
      comparable: false,
      unavailableNote: "",
    };
  }

  /** ترشيح قائمة البوابات: بالمجموعة وبالحالة (all|passed|failed|warn|block) */
  function filterGates(gates, opts) {
    const o = opts || {};
    let out = (gates || []).slice();
    if (o.group && o.group !== "all") {
      out = out.filter((g) => gateGroupOf(g.id) === o.group);
    }
    if (o.state === "passed") out = out.filter((g) => g.ok);
    else if (o.state === "failed") out = out.filter((g) => !g.ok);
    else if (o.state === "warn") out = out.filter((g) => !g.ok && g.level === "warn");
    else if (o.state === "block") out = out.filter((g) => !g.ok && g.level === "block");
    if (o.query) {
      const q = normalize(o.query);
      if (q) {
        out = out.filter((g) =>
          normalize(str(g.id) + " " + str(g.label) + " " + str(g.detail)).indexOf(q) !== -1);
      }
    }
    return out;
  }

  /* ── 1.5) سجل الوسوم الملازمة ────────────────────────────────────────
     كل قيمة في هذا العرض تحمل وسماً إلزامياً تُجمع هنا في مكان واحد بنصها
     الحرفي من الإصدار — فالمدقق يرى في شاشة واحدة ما لم يُعتمد بعد.
     ─────────────────────────────────────────────────────────────────── */

  /**
   * الوسوم الملازمة الحية. كل عنصر: {id, label, valueText, status,
   * statusLabel, note, rule, tone}. لا عنصر يُخترع: يظهر فقط ما وُجد في
   * الإصدار فعلاً، وبنصه كما ورد.
   */
  function flaggedValues(release) {
    const out = [];
    const rel = release || {};

    if (rel.compliance) {
      out.push({
        id: "compliance",
        label: str(rel.compliance.label) || "معدل الامتثال",
        valueText: isNum(rel.compliance.value) ? fmt.pct(rel.compliance.value) : "—",
        rawValue: isNum(rel.compliance.value) ? rel.compliance.value : null,
        status: str(rel.compliance.status),
        statusLabel: statusLabel(rel.compliance.status),
        note: str(rel.compliance.note),
        rule: "الوسم يسافر مع الرقم: لا تظهر هذه النسبة في أي موضع دون حالتها ونصها",
        decisionRef: "R8",
        tone: "gold",
      });
    }

    if (rel.scenarios) {
      const rows = Array.isArray(rel.scenarios.rows) ? rel.scenarios.rows : [];
      out.push({
        id: "scenarios",
        label: str(rel.scenarios.title) || "سيناريوهات العجز",
        valueText: rows.length
          ? fmt.countNoun(rows.length, {
            one: "شهر واحد", two: "شهران", few: "أشهر",
            many: "شهراً", hundred: "شهر",
          }) + " مورّدة"
          : "—",
        rawValue: rows.length || null,
        status: str(rel.scenarios.status),
        statusLabel: statusLabel(rel.scenarios.status),
        note: str(rel.scenarios.caveat),
        rule: "لا تُعرض قيمة سيناريو في أي شاشة دون هذا التحفظ نصاً",
        decisionRef: null,
        tone: "gold",
      });
    }

    if (rel.coverage_target_indicative) {
      const t = rel.coverage_target_indicative;
      out.push({
        id: "coverage_target",
        label: str(t.label) || "هدف نسبة التغطية الاسترشادي",
        valueText: isNum(t.value) ? fmt.pct(t.value) : "—",
        rawValue: isNum(t.value) ? t.value : null,
        status: str(t.status),
        statusLabel: statusLabel(t.status),
        note: str(t.note),
        rule: "يظهر خطاً ذهبياً متقطعاً موسوماً، ولا يدخل أي حساب أو مشتق منشور",
        decisionRef: "R9",
        tone: "gold",
      });
    }

    if (rel.neighbourhoods) {
      const rows = Array.isArray(rel.neighbourhoods.rows) ? rel.neighbourhoods.rows : [];
      out.push({
        id: "neighbourhoods",
        label: "قيم مستوى الحي",
        valueText: rows.length
          ? fmt.int(rows.length) + fmt.NBSP + "حياً في العينة" : "—",
        rawValue: rows.length || null,
        status: "sample_only",
        statusLabel: "عينة لا حصر شامل",
        note: str(rel.neighbourhoods.label),
        rule: str(rel.neighbourhoods.ranking_note),
        decisionRef: "R10",
        tone: "neu",
      });
    }

    const st = rel.strategy;
    if (st) {
      const kpis = Array.isArray(st.kpis) ? st.kpis : [];
      const missing = kpis.filter((k) => k && k.current == null).length;
      if (kpis.length) {
        const noteSet = new Set();
        for (const k of kpis) {
          if (k && k.current_note) noteSet.add(str(k.current_note));
        }
        out.push({
          id: "kpi_current",
          label: "القيم الحالية لمؤشرات الأداء",
          valueText: fmt.int(missing) + " من " + fmt.int(kpis.length) + " غير متوفرة",
          rawValue: missing,
          status: "pending_approval",
          statusLabel: "تُسجَّل من المنصة — غير متوفرة",
          note: Array.from(noteSet).join(" · "),
          rule: "لا أصفار زائفة: الغياب يُعرض غياباً صريحاً في كل بطاقة مؤشر",
          decisionRef: "R7",
          tone: "gold",
        });
      }
      out.push({
        id: "strategy_source",
        label: "مصدر المحاور والمبادرات والمؤشرات",
        valueText: statusLabel(st.status),
        rawValue: null,
        status: str(st.status),
        statusLabel: statusLabel(st.status),
        note: str(st.source),
        rule: str(st.note),
        decisionRef: "R4",
        tone: "neu",
      });
      if (st.weights_rule == null) {
        out.push({
          id: "strategy_weights",
          label: "أوزان المحاور ونسب تقدم المبادرات",
          valueText: "غير واردة في المصدر",
          rawValue: null,
          status: "absent_by_source",
          statusLabel: "غائبة في المصدر — لا تُلفَّق",
          note: "المصدر المعتمد لا يتضمن أوزاناً ولا نسب تقدم ولا ملّاكاً، "
            + "فتبقى الحقول غائبة ولا يُحسب تقدم موزون",
          rule: "لا اشتقاق تقدم من الحالات النصية (لا تحويل «جاري العمل» إلى نسبة)",
          decisionRef: "R4",
          tone: "neu",
        });
      }
    }

    const ns = rel.next_steps;
    if (ns && ns.status !== "approved") {
      out.push({
        id: "next_steps",
        label: "الخطوات القادمة",
        valueText: Array.isArray(ns.items) && ns.items.length
          ? fmt.int(ns.items.length) + " بند" : "لا بنود",
        rawValue: Array.isArray(ns.items) ? ns.items.length : 0,
        status: str(ns.status),
        statusLabel: statusLabel(ns.status),
        note: str(ns.note),
        rule: "لا خطوات ملفّقة: البطاقة الصادقة تعلن الغياب ولا يُشتق منه قرار",
        decisionRef: null,
        tone: "gold",
      });
    }

    const q = rel.quarantine || {};
    for (const key of Object.keys(q)) {
      const entry = q[key];
      if (!entry) continue;
      out.push({
        id: "quarantine:" + key,
        label: "سجل محجور: " + key,
        valueText: "محجور",
        rawValue: null,
        status: "quarantined",
        statusLabel: statusLabel("quarantined"),
        note: str(entry.reason),
        rule: "لا يظهر في المشاهد الرئيسة، وما يُعرض منه يحمل وسم «قيد المطابقة»",
        decisionRef: "R1",
        tone: "neg",
      });
    }

    const m = rel.meta || {};
    if (m.presentation_date_needs_confirmation === true) {
      out.push({
        id: "presentation_date",
        label: "تاريخ العرض التقديمي",
        valueText: m.presentation_date ? fmt.date(m.presentation_date) : "—",
        rawValue: null,
        status: "pending_approval",
        statusLabel: "بانتظار التأكيد",
        note: "التاريخ مبدئي حتى تثبته الإدارة قبل يوم العرض",
        rule: "يظهر بوسمه في ذيل الخاتمة وفي هذا الملحق",
        decisionRef: null,
        tone: "gold",
      });
    }

    return out;
  }

  /* ── 1.6) قرارات المطابقة R1–R12 ─────────────────────────────────────
     جدول ثابت التأليف لأن مصدره **وثيقة** لا إصدار: `docs/DATA_RECONCILIATION.md`
     §3. نُقل بصياغة عرضية دون تغيير منطوق أي قرار، و**جُرِّد من كل رقم عمداً**:
     الأرقام التي تحملها الوثيقة تأتي هنا حيّة من الإصدار عبر `evidenceFor`،
     فلا يتجمد رقم في كود ولا يتعارض مع بيانات منشورة.
     الحالة (`state`) حالة الوثيقة بتاريخها؛ وحيث سجّل الإصدار المنشور أثراً
     على القرار يظهر نصه الحرفي في بطاقة القرينة — والواجهة تقول ذلك صراحة.
     ─────────────────────────────────────────────────────────────────── */

  const OPEN = "open";
  const CLOSED = "closed";

  const RECONCILIATION = Object.freeze([
    Object.freeze({
      id: "R1",
      topic: "سجل المفتشين التشغيلي يخالف إجماليات الزيارات والمخالفات المعتمدة",
      decision: "حجر صحي: لا تظهر أسماء المفتشين ولا أداؤهم الفردي في تجربة "
        + "المقدِّم حتى يَرِد سجل رسمي يطابق الإجماليات المعتمدة تماماً؛ وما "
        + "يُعرض منه في ملحق الرقابة يحمل وسم «قيد المطابقة» ولا يدخل أي مشهد رئيس.",
      state: OPEN,
      stateNote: "بانتظار مصدر رسمي مطابق",
      area: "الرقابة",
    }),
    Object.freeze({
      id: "R2",
      topic: "إحداثيات نقاط التركّز الرقابي وتسمياتها غير واردة في ورقة البيانات",
      decision: "لا تُعرض بوصفها حقائق رسمية؛ يستوعبها ملحق الرقابة والخريطة "
        + "مع حقول مصدر إلزامية ووسم «مواقع النقاط توضيحية من سجل المنصة».",
      state: OPEN,
      stateNote: "مفتوح في الوثيقة — وللإصدار أثر مسجَّل عليه",
      area: "الجغرافيا",
    }),
    Object.freeze({
      id: "R3",
      topic: "انحراف مصفوفات التوقع في طبقة بيانات المنصة القديمة عن ورقة البيانات",
      decision: "اعتماد ورقة البيانات حرفياً، مع فحص تساوٍ آلي في اختبارات "
        + "الوحدة يمنع عودة الانحراف.",
      state: CLOSED,
      stateNote: "محسوم",
      area: "السيناريوهات",
    }),
    Object.freeze({
      id: "R4",
      topic: "خطة عمل المشروع (المحاور والمبادرات والمؤشرات) كانت غير مرفقة",
      decision: "مُغلق بقرار العميل: رفع حجب النشر واعتماد النقل الحرفي من "
        + "مرآة طبقة بيانات المنصة بحالة «مرآة مصدر معتمد» — المحاور "
        + "والمبادرات والمؤشرات تُعرض كاملة بوسم مصدرها؛ وما لم يرد في "
        + "المرآة (أوزان ونسب تقدم وملّاك وقيم حالية) يبقى غائباً بصدق ولا يُلفَّق.",
      state: CLOSED,
      stateNote: "محسوم — بتوجيه العميل",
      area: "الاستراتيجية",
    }),
    Object.freeze({
      id: "R5",
      topic: "عدد المحاور في المصدر المعتمد يخالف العدد المبدئي الوارد في التكليف",
      decision: "مُغلق مع R4: تكوين المصدر المعتمد نفسه هو المعروض حرفياً "
        + "(ركائز وممكن) بلا تلفيق محاور إضافية، وبوابة تحقق حاجبة تثبّت "
        + "التكوين فلا ينجرف.",
      state: CLOSED,
      stateNote: "محسوم — بتوجيه العميل",
      area: "الاستراتيجية",
    }),
    Object.freeze({
      id: "R6",
      topic: "نمو الطلب في معالجة بصرية سابقة ليس قيمة معتمدة، ولا سلسلة طلب "
        + "تاريخية في الورقة",
      decision: "لا يُعرض أي نمو للطلب في أي شاشة؛ تُستخدم نسب التغطية "
        + "والتركيبة والفجوة الموثقة بدلاً منه.",
      state: CLOSED,
      stateNote: "محسوم",
      area: "الطلب",
    }),
    Object.freeze({
      id: "R7",
      topic: "القيم الحالية لمؤشرات الأداء مفقودة",
      decision: "لا أصفار زائفة: القيمة الغائبة تُعرض غائبة صراحة، مع تحذير "
        + "إداري وحجب نشر مؤشرات الأولوية أو تنازل موقَّع مسجَّل.",
      state: CLOSED,
      stateNote: "محسوم آلياً — بوابة منذِرة عند النشر",
      area: "مؤشرات الأداء",
    }),
    Object.freeze({
      id: "R8",
      topic: "منهجية معدل الامتثال غير موثقة: البسط والمقام ومعالجة تعدد "
        + "المخالفات في الزيارة الواحدة",
      decision: "تُعرض القيمة بوصفها قيمة مورّدة في ملف البيانات مع وسم "
        + "«بانتظار اعتماد المنهجية»، ولا تُقدَّم مؤشراً معتمداً، ولا تُشتق "
        + "من نسبة المخالفات إلى الزيارات.",
      state: OPEN,
      stateNote: "بانتظار اعتماد المالك",
      area: "الرقابة",
    }),
    Object.freeze({
      id: "R9",
      topic: "هدف نسبة التغطية استرشادي في الورقة لا مستهدفاً معتمداً",
      decision: "قرار محدَّث: يجوز ظهور الهدف الاسترشادي في اللوحات الرئيسة "
        + "بشرطين إلزاميين: (أ) وسم «استرشادي — غير معتمد» ملازم لكل ظهور، "
        + "خطاً ذهبياً متقطعاً بحبة موسومة؛ (ب) ألا يدخل أي حساب أو مشتق منشور.",
      state: CLOSED,
      stateNote: "محسوم بصيغته المحدثة",
      area: "الطلب",
    }),
    Object.freeze({
      id: "R10",
      topic: "ورقة الأحياء عينة لا حصر شامل",
      decision: "وسم إلزامي «عينة من الأحياء المدرجة في قاعدة البيانات» ملازم "
        + "لكل قيمة على مستوى الحي، وأي ترتيب يُعلن أنه داخل العينة ويسمّي "
        + "مقياسه المرتَّب.",
      state: CLOSED,
      stateNote: "محسوم",
      area: "الجغرافيا",
    }),
    Object.freeze({
      id: "R11",
      topic: "هندسة الخريطة غير موثقة المصدر",
      decision: "وسم «خريطة توضيحية» دائم على كل استخدام لهندسة الخريطة، "
        + "مع سطر إسناد الحدود في الوضعين.",
      state: CLOSED,
      stateNote: "محسوم",
      area: "الجغرافيا",
    }),
    Object.freeze({
      id: "R12",
      topic: "بيانات تعريف ملف المصدر (أسماء المؤلفين والمسارات)",
      decision: "الملف الأصلي يبقى خاصاً ولا يُضمَّن في الحزمة المنشورة؛ "
        + "يُسجَّل هاشه فقط في سجل المصادر.",
      state: CLOSED,
      stateNote: "محسوم",
      area: "الحوكمة",
    }),
  ]);

  /** نسخة قابلة للاستهلاك من جدول القرارات (المصفوفة الأصلية مجمّدة) */
  function reconciliation() {
    return RECONCILIATION.slice();
  }

  /** قرار بمعرفه (‏"R8") أو null */
  function reconciliationById(id) {
    const key = str(id).toUpperCase();
    for (const d of RECONCILIATION) {
      if (d.id === key) return d;
    }
    return null;
  }

  /** عدادات الجدول: كم قرار مفتوح وكم محسوم */
  function reconciliationStats() {
    let open = 0, closed = 0;
    for (const d of RECONCILIATION) {
      if (d.state === OPEN) open += 1; else closed += 1;
    }
    return { total: RECONCILIATION.length, open, closed };
  }

  /** ترشيح الجدول بالحالة وبالبحث الحر */
  function filterDecisions(list, opts) {
    const o = opts || {};
    let out = (list || []).slice();
    if (o.state === OPEN || o.state === CLOSED) {
      out = out.filter((d) => d.state === o.state);
    }
    if (o.query) {
      const q = normalize(o.query);
      if (q) {
        out = out.filter((d) => normalize(
          d.id + " " + d.topic + " " + d.decision + " " + d.area + " " + d.stateNote,
        ).indexOf(q) !== -1);
      }
    }
    return out;
  }

  /**
   * القرينة الحيّة لقرار مطابقة: النص الذي يثبت أثر القرار في الإصدار
   * المنشور الآن، بلفظه كما ورد. لا قرينة → null (ولا تُختلق).
   * تعيد: [{ label, text, path }] — `path` مسار الحقل في الإصدار للشفافية.
   */
  function evidenceFor(release, id) {
    const rel = release || {};
    const key = str(id).toUpperCase();
    const out = [];
    const push = (label, text, path) => {
      const t = str(text);
      if (t) out.push({ label, text: t, path });
    };

    if (key === "R1") {
      const q = (rel.quarantine && rel.quarantine.inspector_level_records) || null;
      if (q) push("سبب الحجر المسجَّل في الإصدار", q.reason,
        "quarantine.inspector_level_records.reason");
    } else if (key === "R2") {
      const qr = (rel.quarantine_resolved && rel.quarantine_resolved.hotspots) || null;
      if (qr) {
        push("أثر مسجَّل في الإصدار", qr.resolution,
          "quarantine_resolved.hotspots.resolution");
        if (isNum(qr.count)) {
          push("عدد النقاط المنشورة",
            fmt.int(qr.count) + fmt.NBSP + "نقطة تركّز رقابي",
            "quarantine_resolved.hotspots.count");
        }
      }
      push("الإخلاء الملازم", rel.meta && rel.meta.map_disclaimer, "meta.map_disclaimer");
    } else if (key === "R3") {
      const sc = rel.scenarios;
      if (sc && Array.isArray(sc.rows)) {
        push("أفق السيناريوهات المورّد كما في الورقة",
          fmt.int(sc.rows.length) + " صفاً شهرياً بلا استيفاء ولا مدّ",
          "scenarios.rows");
      }
    } else if (key === "R4") {
      const st = rel.strategy;
      if (st) {
        push("حالة مصدر الاستراتيجية", statusLabel(st.status), "strategy.status");
        push("المصدر كما أُعلن", st.source, "strategy.source");
        push("قاعدة الغياب", st.note, "strategy.note");
      }
    } else if (key === "R5") {
      const st = rel.strategy;
      if (st && Array.isArray(st.pillars)) {
        const kinds = new Map();
        for (const p of st.pillars) {
          const k = str(p.kind) || "محور";
          kinds.set(k, (kinds.get(k) || 0) + 1);
        }
        const parts = [];
        for (const [k, n] of kinds) parts.push(fmt.int(n) + fmt.NBSP + k);
        push("تكوين المحاور في الإصدار المنشور",
          parts.join(" + ") + " = " + fmt.int(st.pillars.length) + " محاور",
          "strategy.pillars");
        if (isNum(st.required_pillars)) {
          push("العدد الذي تثبّته البوابة الحاجبة",
            fmt.int(st.required_pillars), "strategy.required_pillars");
        }
      }
    } else if (key === "R6") {
      const d = rel.derived || {};
      if (d.coverage_pct) {
        push("البديل المنشور عن نمو الطلب",
          "نسبة تغطية الطلب " + fmt.pct(d.coverage_pct.value)
          + " بالصيغة " + fmt.iso(str(d.coverage_pct.formula)),
          "derived.coverage_pct");
      }
    } else if (key === "R7") {
      const kpis = (rel.strategy && rel.strategy.kpis) || [];
      if (kpis.length) {
        const missing = kpis.filter((k) => k && k.current == null).length;
        push("القيم الحالية الغائبة",
          fmt.int(missing) + " من " + fmt.int(kpis.length) + " مؤشراً",
          "strategy.kpis[].current");
        const note = kpis.find((k) => k && k.current_note);
        if (note) push("النص المعروض مكان القيمة", note.current_note,
          "strategy.kpis[].current_note");
      }
    } else if (key === "R8") {
      const c = rel.compliance;
      if (c) {
        push("القيمة المورّدة",
          (isNum(c.value) ? fmt.pct(c.value) : "—") + " — " + statusLabel(c.status),
          "compliance.value");
        push("نص الوسم الملازم", c.note, "compliance.note");
      }
    } else if (key === "R9") {
      const t = rel.coverage_target_indicative;
      if (t) {
        push("الهدف الاسترشادي كما ورد",
          (isNum(t.value) ? fmt.pct(t.value) : "—") + " — " + statusLabel(t.status),
          "coverage_target_indicative.value");
        push("نص الشرط", t.note, "coverage_target_indicative.note");
      }
    } else if (key === "R10") {
      const nb = rel.neighbourhoods;
      if (nb) {
        push("وسم العينة", nb.label, "neighbourhoods.label");
        push("قاعدة الترتيب", nb.ranking_note, "neighbourhoods.ranking_note");
        if (Array.isArray(nb.rows)) {
          push("حجم العينة المنشورة",
            fmt.int(nb.rows.length) + fmt.NBSP + "حياً", "neighbourhoods.rows");
        }
      }
    } else if (key === "R11") {
      push("الإخلاء الدائم", rel.meta && rel.meta.map_disclaimer, "meta.map_disclaimer");
    } else if (key === "R12") {
      const priv = ((rel.sources || []).filter((s) => s.private === true));
      if (priv.length) {
        push("المصدر الخاص المسجَّل بهاشه",
          priv.map((s) => str(s.name) + " — " + shortSha(s.sha256, 16)).join(" · "),
          "sources[].sha256");
      }
    }
    return out;
  }

  /** الجدول كاملاً مع قرينة كل قرار — أساس صفحة القرارات وأساس اختبارها */
  function decisionsWithEvidence(release) {
    return reconciliation().map((d) => {
      const ev = evidenceFor(release, d.id);
      return Object.assign({}, d, {
        evidence: ev,
        hasEvidence: ev.length > 0,
        stateLabel: d.state === OPEN ? "مفتوح" : "محسوم",
      });
    });
  }

  /* ── 1.7) الواجهة المصدَّرة ─────────────────────────────────────────── */
  return {
    /* مفردات مقفلة */
    STATUS_LABELS, KIND_LABELS, GATE_LEVELS, GATE_GROUPS, DERIVED_AR,
    COMPOSITE_DERIVED, SORT_KEYS, PER_PAGE_OPTIONS, DEFAULT_PER_PAGE,
    RECONCILIATION, OPEN, CLOSED,

    /* هوية ومصادر وفترات */
    shortSha, statusLabel, identity, sources, sourceName,
    periodRows, standingDisclaimers,

    /* أصل كل مقياس */
    metricLabel, valueText, valueWithUnit, originText,
    rawRows, derivedRows, provenanceRows, rowIndex, rowById,
    coverageStats, sheetIndex, dependencyChain, dependentsOf, describeRow,

    /* بحث وترشيح وترتيب وترقيم */
    normalize, searchTextOf, matchRow, searchRows, filterRows, sortRows,
    paginate, pageWindow,

    /* بوابات التحقق */
    gateGroupOf, gateGroupLabel, groupGates, gatesModel, filterGates,

    /* الوسوم الملازمة */
    flaggedValues,

    /* قرارات المطابقة */
    reconciliation, reconciliationById, reconciliationStats,
    filterDecisions, evidenceFor, decisionsWithEvidence,
  };

})();

/* ══════════════════════════════════════════════════════════════════════════
   القسم 2) واجهة الملحق — أربع صفحات فوق النموذج النقي أعلاه
   الصفحات: (1) هوية الإصدار والمصادر · (2) أصل كل مقياس · (3) بوابات
   التحقق حيّاً · (4) قرارات المطابقة R1–R12.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  const dom = RH.core.dom;
  const { h } = dom;
  const fmt = RH.core.fmt;
  const model = RH.explore.methodology;

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

  /** صيغ عدد ومعدود لا تغطيها NOUNS المركزية */
  const LOCAL_NOUNS = {
    gate: { one: "بوابة واحدة", two: "بوابتان", few: "بوابات", many: "بوابة", hundred: "بوابة" },
    metric: { one: "مقياس واحد", two: "مقياسان", few: "مقاييس", many: "مقياساً", hundred: "مقياس" },
    source: { one: "مصدر واحد", two: "مصدران", few: "مصادر", many: "مصدراً", hundred: "مصدر" },
    sheet: { one: "ورقة واحدة", two: "ورقتان", few: "أوراق", many: "ورقة", hundred: "ورقة" },
    row: { one: "صف واحد", two: "صفان", few: "صفوف", many: "صفاً", hundred: "صف" },
    note: { one: "وسم واحد", two: "وسمان", few: "وسوم", many: "وسماً", hundred: "وسم" },
    warn: { one: "إنذار واحد", two: "إنذاران", few: "إنذارات", many: "إنذاراً", hundred: "إنذار" },
    decision: { one: "قرار واحد", two: "قراران", few: "قرارات", many: "قراراً", hundred: "قرار" },
    page: { one: "صفحة واحدة", two: "صفحتان", few: "صفحات", many: "صفحة", hundred: "صفحة" },
    dep: { one: "مشتقة واحدة", two: "مشتقتان", few: "مشتقات", many: "مشتقة", hundred: "مشتقة" },
  };
  const noun = (n, key) => fmt.countNoun(n, LOCAL_NOUNS[key]);

  /** نسبة «مجتاز من كلي» بعزل اتجاهي حتمي: بلا العازل يعكس محرك ثنائي
      الاتجاه ترتيبَ الطرفين داخل الفقرة العربية فيُقرأ ‎67 / 71‎ مقلوباً. */
  const ratio = (a, b) => fmt.iso(fmt.int(a) + " / " + fmt.int(b));

  /* تأجيل كتابة الحالة في المسار: كل ضغطة مفتاح في حقل البحث تعيد الرسم
     محلياً فوراً، بينما كتابة المسار (التي يعيد المحرك عندها بناء الملحق
     كاملاً) تؤجَّل حتى يهدأ التفاعل — فلا وميض ولا فقد تركيز لكل حرف. */
  const COMMIT_DELAY = 360;

  /* حالة تعمّر عبر إعادة البناء (الملف يُحمَّل مرة واحدة): بعد كتابة المسار
     يعيد المحرك بناء الصفحة فيضيع التركيز — نعلّم ما يجب أن يستعيده. */
  let pendingFocus = null;

  /* ── 2.0) أدوات بناء مشتركة بين الصفحات الأربع ─────────────────────── */

  /** زر عام بنمط الملحق: عنصر حقيقي، مركَّز، موسوم فلا يبتلعه جهاز التقديم */
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

  /** مجموعة تبديل بأزرار aria-pressed — للترشيح والترتيب */
  function toggleGroup(el, opts) {
    const o = opts || {};
    const group = h("div", {
      class: "mth-toggle" + (o.cls ? " " + o.cls : ""),
      role: "group",
      "aria-label": o.ariaLabel || "",
    });
    if (o.label) group.appendChild(h("span", { class: "mth-toggle-label" }, o.label));
    for (const item of o.items || []) {
      group.appendChild(button(
        "mth-toggle-btn" + (item.key === o.value ? " now" : ""),
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

  /** شريط إحصاءات علوي مدمج (مضيفه فقط `mth-` — لا إعادة تعريف لأصناف عامة) */
  function statStrip(el, items) {
    const strip = h("div", { class: "mth-strip", role: "list" });
    for (const it of items || []) {
      if (!it) continue;
      strip.appendChild(h("div", {
        class: "mth-stat" + (it.tone ? " " + it.tone : ""),
        role: "listitem",
        title: it.title || null,
      },
        h("div", { class: "mth-stat-k" }, it.label),
        h("div", { class: "mth-stat-v" }, it.value),
        it.foot ? h("div", { class: "mth-stat-f" }, it.foot) : null,
      ));
    }
    el.appendChild(strip);
    return strip;
  }

  /** سطر هامشي موحد (إسناد/إفصاح) */
  function noteLine(el, text, cls) {
    const p = h("p", { class: "mth-note" + (cls ? " " + cls : "") }, text);
    el.appendChild(p);
    return p;
  }

  /** وسم صغير ملوّن — الذهبي لحالات الاعتماد حصراً (منظومة المعنى) */
  function badge(text, tone) {
    return h("span", { class: "mth-badge" + (tone ? " " + tone : "") }, text);
  }

  /** خانة نص لاتيني (هاش/مرساة/صيغة) بعزل اتجاهي كامل */
  function mono(text, cls) {
    return h("span", {
      class: "mth-mono" + (cls ? " " + cls : ""),
      title: String(text),
    }, String(text));
  }

  /** صف مفتاح/قيمة داخل بطاقة تعريف */
  function kvRow(list, label, value, opts) {
    const o = opts || {};
    list.appendChild(h("div", { class: "mth-kv" + (o.cls ? " " + o.cls : "") },
      h("dt", { class: "mth-kv-k" }, label),
      h("dd", { class: "mth-kv-v" },
        o.mono ? mono(value) : value,
        o.badge ? badge(o.badge, o.badgeTone || "gold") : null,
        o.note ? h("span", { class: "mth-kv-note" }, o.note) : null,
      ),
    ));
    return list;
  }

  /** قائمة تعريف (dl) جاهزة داخل جسم بطاقة */
  function kvList(host, cls) {
    const dl = h("dl", { class: "mth-kvs" + (cls ? " " + cls : "") });
    host.appendChild(dl);
    return dl;
  }

  /**
   * جدول كثيف قابل للتصفح بلوحة المفاتيح.
   * columns: [{key, label, align?, cls?, render?(row)→Node|String}]
   * rows:    مصفوفة كائنات
   * onActivate(row, index): تفعيل صف (نقر/Enter/مسافة) — اختياري
   * keyOf(row): مفتاح المقارنة لتمييز الصف المختار — اختياري
   * الأسهم تتنقل بين الصفوف وHome/End للأطراف، والجدول كله موسوم
   * `data-interactive` فلا تبلغ مفاتيحه جهاز التقديم (عقد §8).
   */
  function denseTable(host, opts) {
    const o = opts || {};
    const cols = o.columns || [];
    const rows = o.rows || [];
    const interactive = typeof o.onActivate === "function";

    const thead = h("thead", {}, h("tr", {}, cols.map((c) => h("th", {
      scope: "col",
      class: c.cls || null,
      style: c.align ? { textAlign: c.align } : null,
    }, c.label))));

    const tbody = h("tbody", {});
    const trs = [];
    rows.forEach((row, i) => {
      const selected = o.keyOf && o.selectedKey != null
        && o.keyOf(row) === o.selectedKey;
      const tr = h("tr", {
        class: "mth-tr" + (selected ? " now" : "") + (o.rowCls ? " " + o.rowCls(row) : ""),
      },
        cols.map((c) => h("td", {
          class: c.cls || null,
          style: c.align ? { textAlign: c.align } : null,
        }, c.render ? c.render(row, i) : String(row[c.key] == null ? "—" : row[c.key]))));
      if (interactive) {
        tr.setAttribute("role", "button");
        tr.setAttribute("tabindex", i === 0 || selected ? "0" : "-1");
        tr.setAttribute("data-interactive", "");
        if (selected) tr.setAttribute("aria-current", "true");
        if (o.rowAria) tr.setAttribute("aria-label", o.rowAria(row, i));
        tr.addEventListener("click", () => o.onActivate(row, i));
        tr.addEventListener("keydown", (ev) => onRowKey(ev, i));
      }
      tbody.appendChild(tr);
      trs.push(tr);
    });

    function focusRow(i) {
      if (!trs.length) return;
      const j = Math.max(0, Math.min(trs.length - 1, i));
      for (const t of trs) t.setAttribute("tabindex", "-1");
      trs[j].setAttribute("tabindex", "0");
      trs[j].focus();
    }

    function onRowKey(ev, i) {
      const k = ev.key;
      if (k === "Enter" || k === " " || k === "Spacebar") {
        ev.preventDefault();
        ev.stopPropagation();
        o.onActivate(rows[i], i);
        return;
      }
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
        ev.preventDefault();
        ev.stopPropagation();
        if (k === "ArrowDown") focusRow(i + 1);
        else if (k === "ArrowUp") focusRow(i - 1);
        else if (k === "Home") focusRow(0);
        else focusRow(trs.length - 1);
      }
    }

    const table = h("table", {
      class: "table-dense mth-table" + (o.cls ? " " + o.cls : ""),
      "aria-label": o.ariaLabel || null,
    }, o.caption ? h("caption", { class: "sr-only" }, o.caption) : null, thead, tbody);

    const scroll = h("div", { class: "mth-tscroll" }, table);
    host.appendChild(scroll);
    if (o.note) host.appendChild(h("p", { class: "mth-tnote" }, o.note));
    return { table, tbody, rows: trs, focusRow, scroll };
  }

  /** حالة فارغة صادقة داخل مضيف — لا شاشة بيضاء ولا نتيجة مختلقة */
  function emptyState(host, label, note) {
    return RH.presenter.layout.pendingCard(host, { label, note: note || null });
  }

  /** الانتقال إلى ملحق شقيق مع الحفاظ على وجهة العودة الأصلية للمستدعي */
  function goAppendix(id, ctx) {
    const params = {};
    if (ctx && ctx.params && ctx.params.return) params.return = ctx.params.return;
    RH.core.router.go({ kind: "appendix", id, params });
  }

  /** قراءة معامل مسار نصي بحدّ أقصى للطول (حماية من عناوين مشوّهة) */
  function paramStr(ctx, key, max) {
    const v = ctx && ctx.params ? ctx.params[key] : null;
    if (v == null) return "";
    const s = String(v);
    return s.length > (max || 80) ? s.slice(0, max || 80) : s;
  }

  /** قراءة معامل مسار عددي مع حد أدنى/أعلى */
  function paramInt(ctx, key, def) {
    const v = ctx && ctx.params ? ctx.params[key] : null;
    if (v == null || v === "") return def;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : def;
  }

  /** قفز بين صفحات الملحق ذاته (ax-shell يقرأ `page` عند إعادة البناء) */
  function goPage(ctx, n) {
    pendingFocus = null;
    ctx.update({ page: n === 0 ? null : String(n) });
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-أ) الصفحة 1 — هوية الإصدار والمصادر
     ──────────────────────────────────────────────────────────────────────
     من أين جاءت هذه الحزمة كاملة: معرف الإصدار وهاشه وسجل مصادره وفتراته
     الزمنية الأربع المنفصلة وإخلاءاته الدائمة. كل قيمة من `release` نصاً.
     ══════════════════════════════════════════════════════════════════════ */
  function pageIdentity(el, ctx) {
    const rel = RH.data.store.release();
    const id = model.identity(rel);
    const srcs = model.sources(rel);
    const stats = model.coverageStats(rel);
    const gates = model.gatesModel(rel);
    const sheets = model.sheetIndex(rel);

    const page = h("div", { class: "mth-page mth-p1" });
    el.appendChild(page);

    /* ── شريط الهوية العلوي ── */
    statStrip(page, [
      {
        label: "معرف الإصدار",
        value: fmt.iso(id.id),
        foot: id.statusLabel,
      },
      {
        label: "تاريخ النشر",
        value: id.publishedAt ? fmt.date(id.publishedAt.slice(0, 10)) : "—",
        foot: id.publishedBy ? "بواسطة " + fmt.iso(id.publishedBy) : "",
      },
      {
        label: "بصمة المحتوى",
        value: fmt.iso(id.shaShort),
        foot: "SHA-256 — أول ‎16‎ محرفاً",
        title: id.sha256,
      },
      {
        label: "المصادر المسجَّلة",
        value: noun(stats.sources, "source"),
        foot: srcs.some((s) => s.isPrivate) ? "منها مصدر خاص بهاشه فقط" : "",
      },
      {
        label: "المقاييس الموثقة",
        value: noun(stats.total, "metric"),
        foot: fmt.int(stats.raw) + " خام · " + fmt.int(stats.derived) + " مشتق",
      },
      {
        label: "الفحص الحي الآن",
        value: gates.available
          ? ratio(gates.passed, gates.total)
          : "غير متاح",
        foot: gates.available
          ? (gates.blockers.length
            ? noun(gates.blockers.length, "gate") + " حاجبة لم تجتز"
            : "بلا بوابات حاجبة فاشلة")
          : gates.unavailableNote,
        tone: gates.available && !gates.blockers.length ? "pos" : "warn",
      },
    ]);

    /* ── شبكة العمودين ── */
    const grid = h("div", { class: "mth-grid mth-grid-2" });
    page.appendChild(grid);
    const colA = h("div", { class: "mth-col" });
    const colB = h("div", { class: "mth-col" });
    grid.appendChild(colA);
    grid.appendChild(colB);

    /* ── بطاقة هوية الإصدار ── */
    const idCard = RH.presenter.layout.card(colA, {
      title: "هوية الإصدار المنشور",
      sub: "نموذج إصدارات غير قابل للتغيير — كل عرض يقرأ من إصدار معرَّف بهاشه",
      cls: "mth-card mth-card-id",
    });
    const idList = kvList(idCard.body);
    kvRow(idList, "المعرف", fmt.iso(id.id), { mono: true });
    kvRow(idList, "الحالة", id.statusLabel, { badge: id.status, badgeTone: "neu" });
    kvRow(idList, "نُشر في",
      id.publishedAt ? fmt.date(id.publishedAt.slice(0, 10)) : "—",
      { note: id.publishedAt ? fmt.iso(id.publishedAt) : "" });
    kvRow(idList, "نُشر بواسطة", id.publishedBy ? fmt.iso(id.publishedBy) : "—");
    kvRow(idList, "الإصدار السابق",
      id.baseReleaseId ? fmt.iso(id.baseReleaseId) : "لا إصدار سابق",
      {
        mono: !!id.baseReleaseId,
        note: id.baseReleaseId ? "" : "هذا هو الإصدار التأسيسي في السجل",
      });
    kvRow(idList, "إصدار المخطط",
      id.schemaVersion ? fmt.iso(id.schemaVersion) : "—");
    kvRow(idList, "بصمة المحتوى", id.sha256 || "—", { mono: true, cls: "wide" });
    if (id.notes) kvRow(idList, "ملاحظة الإصدار", id.notes, { cls: "wide" });

    noteLine(idCard.body,
      "البصمة تُحسب على المحتوى المتحقق منه وحده؛ أي تعديل على قيمة منشورة "
      + "يُنتج إصداراً جديداً ببصمة جديدة — ولا يُكتب فوق إصدار قائم.");

    /* ── بطاقة المصادر ── */
    const srcCard = RH.presenter.layout.card(colA, {
      title: "سجل المصادر",
      sub: "من يملك أي حقل — ولا يكتب مصدر فوق حقول مصدر آخر دون قرار مطابقة موثق",
      cls: "mth-card mth-card-src",
    });
    if (!srcs.length) {
      emptyState(srcCard.body, "لا مصادر مسجَّلة في هذا الإصدار",
        "سجل المصادر جزء من عقد الإسناد — غيابه يمنع النشر");
    } else {
      denseTable(srcCard.body, {
        ariaLabel: "سجل مصادر الإصدار",
        columns: [
          { key: "name", label: "المصدر", render: (r) => mono(r.name) },
          { key: "kind", label: "النوع", render: (r) => r.kind || "—" },
          {
            key: "templateVersion", label: "إصدار القالب",
            render: (r) => (r.templateVersion ? fmt.iso(r.templateVersion) : "—"),
          },
          { key: "shaShort", label: "البصمة", render: (r) => mono(r.shaShort) },
          {
            key: "importedAt", label: "استُورد في",
            render: (r) => (r.importedAt ? fmt.date(r.importedAt.slice(0, 10)) : "—"),
          },
          {
            key: "isPrivate", label: "الخصوصية",
            render: (r) => (r.isPrivate
              ? badge("خاص — الهاش فقط", "gold") : "عام"),
          },
        ],
        rows: srcs,
      });
      const priv = srcs.filter((s) => s.isPrivate);
      if (priv.length) {
        noteLine(srcCard.body, priv[0].privacyNote
          + " (قرار المطابقة R12) — والبصمة أعلاه هي وسيلة التحقق الوحيدة "
          + "المتاحة للمدقق من داخل الحزمة.");
      }
    }

    /* ── بطاقة الفترات والتواريخ ── */
    const perCard = RH.presenter.layout.card(colB, {
      title: "الفترات والتواريخ",
      sub: "أربعة تواريخ منفصلة عمداً — خلطها هو أشيع خطأ في قراءة اللوحات",
      cls: "mth-card mth-card-per",
    });
    const periods = model.periodRows(rel);
    denseTable(perCard.body, {
      ariaLabel: "فترات الإصدار وتواريخه",
      columns: [
        { key: "label", label: "الحقل", cls: "k" },
        {
          key: "value", label: "القيمة",
          render: (r) => h("span", { class: "mth-perv" },
            r.value || "—",
            r.flag ? badge(r.flag, "gold") : null),
        },
        { key: "note", label: "ما يعنيه", cls: "mth-dim" },
      ],
      rows: periods,
    });

    /* ── بطاقة الإخلاءات الدائمة ── */
    const disc = model.standingDisclaimers(rel);
    const discCard = RH.presenter.layout.card(colB, {
      title: "الإخلاءات الدائمة",
      sub: "وسوم تلازم بياناتها أينما ظهرت — لا تُطوى ولا تُختصر",
      cls: "mth-card mth-card-disc",
    });
    if (!disc.length) {
      emptyState(discCard.body, "لا إخلاءات مسجَّلة في بيانات التعريف", null);
    } else {
      const ul = h("ul", { class: "mth-disc" });
      for (const d of disc) {
        ul.appendChild(h("li", { class: "mth-disc-item" },
          h("div", { class: "mth-disc-head" },
            h("span", { class: "mth-disc-label" }, d.label),
            badge("ملازم", "gold")),
          h("p", { class: "mth-disc-text" }, d.text),
          h("p", { class: "mth-disc-rule" }, d.rule),
        ));
      }
      discCard.body.appendChild(ul);
    }

    /* ── بطاقة تغطية الأوراق ── */
    const shCard = RH.presenter.layout.card(colB, {
      title: "توزيع المقاييس الخام على أوراق المصنف",
      sub: "أي ورقة تغذّي كم مقياساً — قراءة سريعة لاعتماد العرض على المصدر",
      cls: "mth-card mth-card-sheets",
    });
    if (!sheets.length) {
      emptyState(shCard.body, "لا مقاييس خام في هذا الإصدار", null);
    } else {
      RH.viz.micro.microBars(shCard.body, {
        su: ctx.su,
        items: sheets.map((s) => ({ label: s.sheet, value: s.count, tone: "blue" })),
        ariaLabel: "عدد المقاييس الخام لكل ورقة في المصنف",
        fmt: fmt.int,
        tone: "blue",
      });
      noteLine(shCard.body,
        noun(stats.raw, "metric") + " خام موزعة على " + noun(stats.sheets, "sheet")
        + "، و" + fmt.int(stats.derived) + " مشتقة تُحسب من هذه القيم بصيغ معلنة، "
        + "إضافة إلى " + fmt.int(stats.composite)
        + " كتلة مشتقة مركّبة (القطاعات والترتيبات) لكل منها موضعها في اللوحات.");
    }

    /* ── مسار الانتقال إلى بقية الصفحات ── */
    const nav = h("div", { class: "mth-pagenav" },
      button("mth-linkbtn", "أصل كل مقياس", () => goPage(ctx, 1), {
        aria: "الانتقال إلى صفحة أصل كل مقياس داخل الملحق",
        children: [h("span", {}, "أصل كل مقياس"),
          h("span", { class: "mth-arrow", "aria-hidden": "true" }, "←")],
      }),
      button("mth-linkbtn", "بوابات التحقق حيّاً", () => goPage(ctx, 2), {
        aria: "الانتقال إلى صفحة بوابات التحقق الحية",
        children: [h("span", {}, "بوابات التحقق حيّاً"),
          h("span", { class: "mth-arrow", "aria-hidden": "true" }, "←")],
      }),
      button("mth-linkbtn", "قرارات المطابقة", () => goPage(ctx, 3), {
        aria: "الانتقال إلى صفحة قرارات المطابقة",
        children: [h("span", {}, "قرارات المطابقة"),
          h("span", { class: "mth-arrow", "aria-hidden": "true" }, "←")],
      }),
      RH.explore && typeof RH.explore.decisionsModel === "function"
        ? button("mth-linkbtn ghost", "سجل القرارات المطلوبة",
          () => goAppendix("decisions", ctx), {
            aria: "فتح ملحق سجل القرارات المطلوبة",
            children: [h("span", {}, "سجل القرارات المطلوبة"),
              h("span", { class: "mth-arrow", "aria-hidden": "true" }, "←")],
          })
        : null,
    );
    page.appendChild(nav);
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ب) الصفحة 2 — أصل كل مقياس
     ──────────────────────────────────────────────────────────────────────
     جدول شامل لكل مقياس خام (ورقة/مرساة/مصدر) وكل مشتقة (صيغة/إصدار/مدخلات)
     مع بحث حر وترشيح وترتيب وترقيم صفحات، ولوحة تفصيل تعرض سلسلة الاعتماد
     كاملة ومَن يعتمد على المقياس. المنطق كله في النموذج النقي — هذه الصفحة
     ترسمه فقط.
     ══════════════════════════════════════════════════════════════════════ */
  const KIND_FILTERS = [
    { key: "all", label: "الكل", hint: "كل المقاييس الخام والمشتقة" },
    { key: "raw", label: "خام", hint: "قيم من أوراق المصنف مباشرة" },
    { key: "derived", label: "مشتق", hint: "قيم محسوبة بصيغ معلنة وإصدار صيغة" },
  ];

  function pageProvenance(el, ctx) {
    const rel = RH.data.store.release();
    const allRows = model.provenanceRows(rel);
    const sheets = model.sheetIndex(rel);

    /* ── الحالة من المسار (مقصوصة إلى قيم صالحة دائماً) ── */
    let query = paramStr(ctx, "q", 60);
    let kind = paramStr(ctx, "k", 10);
    if (!KIND_FILTERS.some((f) => f.key === kind)) kind = "all";
    let sheet = paramStr(ctx, "sh", 40);
    if (sheet && !sheets.some((s) => s.sheet === sheet)) sheet = "";
    let sortKey = paramStr(ctx, "s", 12);
    if (!model.SORT_KEYS.some((k) => k.key === sortKey)) sortKey = "label";
    let sortDir = paramStr(ctx, "o", 5) === "desc" ? "desc" : "asc";
    let perPage = paramInt(ctx, "pp", model.DEFAULT_PER_PAGE);
    if (!model.PER_PAGE_OPTIONS.includes(perPage)) perPage = model.DEFAULT_PER_PAGE;
    let pageNo = paramInt(ctx, "pg", 0);
    let selectedId = paramStr(ctx, "m", 40);

    const page = h("div", { class: "mth-page mth-p2" });
    el.appendChild(page);

    /* ── شريط الأدوات ── */
    const tools = h("div", { class: "mth-tools" });
    page.appendChild(tools);

    const searchWrap = h("div", { class: "mth-search" });
    const searchId = "mth-q";
    const searchInput = h("input", {
      id: searchId,
      class: "mth-search-input",
      type: "search",
      value: query,
      placeholder: "ابحث في الأسماء والمعرفات والأوراق والمراسي والصيغ",
      "data-interactive": "",
      autocomplete: "off",
      spellcheck: "false",
      "aria-label": "بحث داخل جدول أصل المقاييس",
    });
    searchWrap.appendChild(h("label", {
      class: "sr-only", for: searchId,
    }, "بحث داخل جدول أصل المقاييس"));
    searchWrap.appendChild(searchInput);
    const clearBtn = button("mth-search-clear", "مسح", () => {
      query = "";
      searchInput.value = "";
      pageNo = 0;
      render();
      scheduleCommit("search");
    }, { aria: "مسح نص البحث", disabled: !query });
    searchWrap.appendChild(clearBtn);
    tools.appendChild(searchWrap);

    const countEl = h("span", {
      class: "mth-count", role: "status", "aria-live": "polite",
    });
    tools.appendChild(countEl);

    toggleGroup(tools, {
      cls: "mth-kind",
      label: "النوع",
      ariaLabel: "ترشيح نوع المقياس",
      value: kind,
      items: KIND_FILTERS,
      onPick: (k) => {
        if (k === kind) return;
        kind = k;
        pageNo = 0;
        render();
        commitNow();
      },
    });

    if (sheets.length > 1) {
      toggleGroup(tools, {
        cls: "mth-sheet",
        label: "الورقة",
        ariaLabel: "ترشيح ورقة المصدر",
        value: sheet || "",
        items: [{ key: "", label: "كل الأوراق", hint: "بلا ترشيح بالورقة" }]
          .concat(sheets.map((s) => ({
            key: s.sheet,
            label: s.sheet,
            hint: noun(s.count, "metric") + " خام في هذه الورقة",
          }))),
        onPick: (k) => {
          if (k === sheet) return;
          sheet = k;
          /* ترشيح الورقة يخص الخام وحده — فيُضبط النوع معه بصدق بدل أن
             يعرض المستخدمُ ترشيحاً لا نتيجة له */
          if (sheet && kind === "derived") kind = "all";
          pageNo = 0;
          render();
          commitNow();
        },
      });
    }

    toggleGroup(tools, {
      cls: "mth-sort",
      label: "الترتيب",
      ariaLabel: "مفتاح ترتيب الجدول",
      value: sortKey,
      items: model.SORT_KEYS.map((k) => ({ key: k.key, label: k.label })),
      onPick: (k) => {
        if (k === sortKey) {
          sortDir = sortDir === "asc" ? "desc" : "asc";
        } else {
          sortKey = k;
          sortDir = "asc";
        }
        render();
        commitNow();
      },
    });

    const dirBtn = button("mth-dirbtn", "", () => {
      sortDir = sortDir === "asc" ? "desc" : "asc";
      render();
      commitNow();
    }, { aria: "عكس اتجاه الترتيب" });
    tools.appendChild(dirBtn);

    /* ── جسم الصفحة: الجدول + لوحة التفصيل ── */
    const body = h("div", { class: "mth-body" });
    page.appendChild(body);
    const tableHost = h("div", { class: "mth-table-host" });
    const detailHost = h("aside", {
      class: "mth-detail",
      "aria-label": "تفصيل المقياس المختار",
    });
    body.appendChild(tableHost);
    body.appendChild(detailHost);

    const pager = h("div", { class: "mth-pager" });
    page.appendChild(pager);

    /* ── الالتزام المؤجَّل بكتابة الحالة في المسار ── */
    let commitTimer = null;
    function stateParams() {
      return {
        q: query || null,
        k: kind === "all" ? null : kind,
        sh: sheet || null,
        s: sortKey === "label" ? null : sortKey,
        o: sortDir === "asc" ? null : sortDir,
        pp: perPage === model.DEFAULT_PER_PAGE ? null : String(perPage),
        pg: pageNo ? String(pageNo) : null,
        m: selectedId || null,
      };
    }
    function commitNow(focusKey) {
      if (commitTimer) { clearTimeout(commitTimer); commitTimer = null; }
      pendingFocus = focusKey || null;
      ctx.update(stateParams());
    }
    function scheduleCommit(focusKey) {
      if (commitTimer) clearTimeout(commitTimer);
      commitTimer = setTimeout(() => {
        commitTimer = null;
        pendingFocus = focusKey || null;
        ctx.update(stateParams());
      }, COMMIT_DELAY);
    }
    ctx.onTeardown(() => {
      if (commitTimer) clearTimeout(commitTimer);
      commitTimer = null;
    });

    searchInput.addEventListener("input", () => {
      query = searchInput.value.slice(0, 60);
      pageNo = 0;
      render();
      scheduleCommit("search");
    });
    /* Escape داخل الحقل يمسح الاستعلام ولا يغادر الملحق (الحقل تفاعلي
       فلا يبلغ الحدثُ حارسَ الملاحة أصلاً — لكن الإيقاف صريح للأمان) */
    searchInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && query) {
        ev.preventDefault();
        ev.stopPropagation();
        query = "";
        searchInput.value = "";
        pageNo = 0;
        render();
        scheduleCommit("search");
      }
    });

    /* ── لوحة تفصيل مقياس واحد ── */
    function buildDetail(row) {
      dom.clear(detailHost);
      if (!row) {
        const card = RH.presenter.layout.card(detailHost, {
          title: "اختر مقياساً",
          sub: "لعرض أصله وسلسلة اعتماده ومن يعتمد عليه",
          cls: "mth-card mth-detail-card",
        });
        const ul = h("ul", { class: "mth-hint" });
        for (const line of [
          "الصف الخام يعرض ورقة المصدر ومرساة الخلية واسم المصنف.",
          "الصف المشتق يعرض صيغته وإصدار الصيغة ومدخلاتها بقيمها.",
          "سلسلة الاعتماد تنزل حتى القيم الخام فلا تبقى صيغة صندوقاً مغلقاً.",
          "الأسهم أعلى/أسفل تتنقل بين الصفوف، وEnter يفتح التفصيل.",
        ]) ul.appendChild(h("li", {}, line));
        card.body.appendChild(ul);
        return;
      }

      const card = RH.presenter.layout.card(detailHost, {
        title: row.label,
        sub: model.originText(row),
        cls: "mth-card mth-detail-card",
      });

      const head = h("div", { class: "mth-detail-head" },
        h("div", { class: "mth-detail-value" }, model.valueWithUnit(row)),
        badge(row.kindLabel, row.kind === "raw" ? "neu" : "blue"),
        mono(row.id, "small"),
      );
      card.body.appendChild(head);

      const dl = kvList(card.body, "tight");
      if (row.kind === "raw") {
        kvRow(dl, "الورقة", row.sheet || "—");
        kvRow(dl, "المرساة", row.anchor || "—", { mono: true });
        kvRow(dl, "المصنف", row.sourceName || "—", { mono: true });
        kvRow(dl, "نوع القيمة", "خام — تُقرأ كما وردت بلا حساب");
      } else {
        kvRow(dl, "الصيغة", row.formula || "—", { mono: true, cls: "wide" });
        kvRow(dl, "إصدار الصيغة", row.formulaVersion || "—", { mono: true });
        kvRow(dl, "نوع القيمة",
          "مشتقة — تُعاد حسابها في المتصفح وتُقارن بالمنشور في بوابة اتساق حاجبة");
      }
      if (row.unit) kvRow(dl, "الوحدة", row.unit);

      /* سلسلة الاعتماد */
      const chain = model.dependencyChain(rel, row.id, 4);
      const chainCard = h("div", { class: "mth-sub" });
      chainCard.appendChild(h("div", { class: "mth-sub-title" }, "سلسلة الاعتماد"));
      if (!chain.length) {
        chainCard.appendChild(h("p", { class: "mth-sub-empty" },
          row.kind === "raw"
            ? "قيمة خام — لا مدخلات لها؛ هي طرف السلسلة."
            : "لا مدخلات معلنة لهذه الصيغة في الإصدار."));
      } else {
        const ol = h("ol", { class: "mth-chain" });
        for (const node of chain) {
          const r = node.row;
          ol.appendChild(h("li", {
            class: "mth-chain-item d" + node.depth,
          },
            /* رتبة العمق تُقرأ رقماً لا إزاحةً وحدها: العمق 1 مدخل مباشر،
               والأعمق مدخلُ مدخلٍ — والإزاحة البصرية في methodology.css */
            h("span", { class: "mth-chain-depth", title: "عمق الاعتماد" },
              fmt.iso("د" + fmt.int(node.depth))),
            r
              ? button("mth-chain-link", r.label, () => selectRow(r.id), {
                aria: "فتح تفصيل " + r.label,
                children: [
                  h("span", { class: "mth-chain-name" }, r.label),
                  h("b", { class: "mth-chain-val" }, model.valueWithUnit(r)),
                ],
              })
              : h("span", { class: "mth-chain-missing" }, node.id),
            h("span", { class: "mth-chain-via" }, "مدخل في " + node.via),
          ));
        }
        chainCard.appendChild(ol);
      }
      card.body.appendChild(chainCard);

      /* المعتمدون على هذا المقياس */
      const deps = model.dependentsOf(rel, row.id);
      const depCard = h("div", { class: "mth-sub" });
      depCard.appendChild(h("div", { class: "mth-sub-title" },
        "يعتمد على هذا المقياس"));
      if (!deps.length) {
        depCard.appendChild(h("p", { class: "mth-sub-empty" },
          "لا مشتقة منشورة تعتمد عليه مباشرة."));
      } else {
        const ul = h("ul", { class: "mth-deps" });
        for (const d of deps) {
          ul.appendChild(h("li", {},
            button("mth-chain-link", d.label, () => selectRow(d.id), {
              aria: "فتح تفصيل " + d.label,
              children: [
                h("span", { class: "mth-chain-name" }, d.label),
                h("b", { class: "mth-chain-val" }, model.valueWithUnit(d)),
              ],
            })));
        }
        depCard.appendChild(ul);
        depCard.appendChild(h("p", { class: "mth-sub-foot" },
          noun(deps.length, "dep") + " منشورة تتغير بتغير هذه القيمة."));
      }
      card.body.appendChild(depCard);

      card.body.appendChild(h("p", { class: "sr-only" }, model.describeRow(row)));
    }

    function selectRow(id) {
      selectedId = selectedId === id ? "" : String(id);
      buildDetail(selectedId ? model.rowById(allRows, selectedId) : null);
      markSelection();
      commitNow(selectedId ? "row:" + selectedId : null);
    }

    let tableApi = null;
    function markSelection() {
      if (!tableApi) return;
      tableApi.rows.forEach((tr, i) => {
        const rid = tr.getAttribute("data-row-id");
        const on = !!selectedId && rid === selectedId;
        tr.classList.toggle("now", on);
        if (on) tr.setAttribute("aria-current", "true");
        else tr.removeAttribute("aria-current");
        tr.setAttribute("tabindex", on || (!selectedId && i === 0) ? "0" : "-1");
      });
    }

    /* ── الترقيم ── */
    function buildPager(pg) {
      dom.clear(pager);
      if (pg.total === 0) return;

      pager.appendChild(button("mth-pgbtn", "السابقة", () => {
        pageNo = pg.page - 1;
        render();
        commitNow();
      }, { disabled: !pg.hasPrev, aria: "الصفحة السابقة من الجدول" }));

      const nums = h("div", { class: "mth-pgnums", role: "group", "aria-label": "صفحات الجدول" });
      for (const i of model.pageWindow(pg.page, pg.pages, 5)) {
        nums.appendChild(button(
          "mth-pgnum" + (i === pg.page ? " now" : ""),
          fmt.int(i + 1),
          () => {
            if (i === pg.page) return;
            pageNo = i;
            render();
            commitNow();
          },
          {
            pressed: i === pg.page,
            aria: "الصفحة " + fmt.int(i + 1) + " من " + fmt.int(pg.pages),
          }));
      }
      pager.appendChild(nums);

      pager.appendChild(button("mth-pgbtn", "التالية", () => {
        pageNo = pg.page + 1;
        render();
        commitNow();
      }, { disabled: !pg.hasNext, aria: "الصفحة التالية من الجدول" }));

      pager.appendChild(h("span", { class: "mth-pginfo" },
        "الصفوف " + fmt.iso(fmt.int(pg.firstIndex) + "–" + fmt.int(pg.lastIndex))
        + " من " + fmt.int(pg.total)));

      toggleGroup(pager, {
        cls: "mth-perpage",
        label: "لكل صفحة",
        ariaLabel: "عدد الصفوف في الصفحة",
        value: String(perPage),
        items: model.PER_PAGE_OPTIONS.map((n) => ({
          key: String(n), label: fmt.int(n),
        })),
        onPick: (k) => {
          const n = parseInt(k, 10);
          if (n === perPage) return;
          perPage = n;
          pageNo = 0;
          render();
          commitNow();
        },
      });
    }

    /* ── الرسم الكامل ── */
    function render() {
      const filtered = model.filterRows(allRows, { kind, sheet, query });
      const sorted = model.sortRows(filtered, sortKey, sortDir);
      const pg = model.paginate(sorted, pageNo, perPage);
      pageNo = pg.page;

      countEl.textContent = query || kind !== "all" || sheet
        ? noun(pg.total, "metric") + " مطابقة من " + fmt.int(allRows.length)
        : noun(allRows.length, "metric") + " موثقة";

      clearBtn.disabled = !query;
      const sortLabel = (model.SORT_KEYS.find((k) => k.key === sortKey) || {}).label || "";
      dom.clear(dirBtn);
      dirBtn.appendChild(h("span", { "aria-hidden": "true" },
        sortDir === "asc" ? "▲" : "▼"));
      dirBtn.appendChild(h("span", {}, sortDir === "asc" ? "تصاعدي" : "تنازلي"));
      dirBtn.setAttribute("aria-label",
        "اتجاه الترتيب حسب " + sortLabel + ": " + (sortDir === "asc" ? "تصاعدي" : "تنازلي")
        + " — التفعيل يعكسه");

      dom.clear(tableHost);
      if (!pg.total) {
        emptyState(tableHost, "لا مقياس يطابق الترشيح الحالي",
          "جرّب مسح البحث أو إعادة النوع إلى «الكل» — ولا يُعرض صف بديل مختلق.");
        tableApi = null;
      } else {
        tableApi = denseTable(tableHost, {
          ariaLabel: "جدول أصل المقاييس",
          caption: "أصل كل مقياس: القيمة والنوع والمصدر",
          columns: [
            {
              key: "label", label: "المقياس", cls: "k",
              render: (r) => h("span", { class: "mth-cell-label" },
                h("span", {}, r.label),
                h("span", { class: "mth-cell-id" }, fmt.iso(r.id))),
            },
            {
              key: "value", label: "القيمة", align: "end", cls: "num",
              render: (r) => model.valueText(r),
            },
            { key: "unit", label: "الوحدة", render: (r) => r.unit || "—" },
            {
              key: "kind", label: "النوع",
              render: (r) => badge(r.kindLabel, r.kind === "raw" ? "neu" : "blue"),
            },
            {
              key: "origin", label: "المصدر أو الصيغة", cls: "mth-dim",
              render: (r) => mono(model.originText(r)),
            },
          ],
          rows: pg.items,
          keyOf: (r) => r.id,
          selectedKey: selectedId || null,
          rowAria: (r) => model.describeRow(r),
          onActivate: (r) => selectRow(r.id),
        });
        tableApi.rows.forEach((tr, i) => {
          tr.setAttribute("data-row-id", pg.items[i].id);
        });
        markSelection();
      }

      buildPager(pg);
      buildDetail(selectedId ? model.rowById(allRows, selectedId) : null);
    }

    render();

    /* سطر الإسناد الملازم أسفل الصفحة */
    noteLine(page,
      "كل قيمة خام أعلاه تُقرأ من ورقتها ومرساتها في المصنف المسجَّل بهاشه، "
      + "وكل مشتقة تُعاد حسابها في المتصفح بالصيغة المعلنة وتُقارن بالقيمة "
      + "المنشورة في بوابة اتساق حاجبة — والفروق تمنع النشر ولا تُخفى.",
      "wide");

    /* استعادة التركيز بعد إعادة البناء الناتجة عن كتابة الحالة في المسار */
    const want = pendingFocus;
    pendingFocus = null;
    if (want === "search") {
      searchInput.focus();
      const n = searchInput.value.length;
      try { searchInput.setSelectionRange(n, n); } catch (_e) { /* أنواع لا تدعم التحديد */ }
    } else if (want && want.indexOf("row:") === 0 && tableApi) {
      const id = want.slice(4);
      for (const tr of tableApi.rows) {
        if (tr.getAttribute("data-row-id") === id) { tr.focus(); break; }
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ج) الصفحة 3 — بوابات التحقق حيّاً
     ──────────────────────────────────────────────────────────────────────
     تشغيل فعلي لـ`RH.data.validate.validateRelease` على الإصدار المحمَّل
     الآن: العد الحقيقي، المجموعات، الإنذارات المفتوحة بنصها، شرح فلسفة
     «الحجب مقابل الإنذار»، وسجل الوسوم الملازمة كاملاً.
     ══════════════════════════════════════════════════════════════════════ */
  const GATE_STATES = [
    { key: "all", label: "الكل", hint: "كل البوابات المنفذة في الفحص الحي" },
    { key: "failed", label: "لم تجتز", hint: "حاجبة أو منذِرة لم تجتز" },
    { key: "warn", label: "إنذارات", hint: "لم تجتز ولا تمنع النشر" },
    { key: "block", label: "حاجبة فاشلة", hint: "لم تجتز وتمنع النشر" },
    { key: "passed", label: "مجتازة", hint: "اجتازت الفحص" },
  ];

  function pageGates(el, ctx) {
    const rel = RH.data.store.release();
    const gm = model.gatesModel(rel);
    const flags = model.flaggedValues(rel);

    let group = paramStr(ctx, "g", 30) || "all";
    let state = paramStr(ctx, "gs", 10);
    if (!GATE_STATES.some((s) => s.key === state)) state = "all";

    const page = h("div", { class: "mth-page mth-p3" });
    el.appendChild(page);

    if (!gm.available) {
      emptyState(page, "الفحص الحي غير متاح في هذا البناء", gm.unavailableNote);
      noteLine(page,
        "لا يُعرض عدد بديل ولا يُنسخ رقم من وثيقة: العدد المعروض في هذا "
        + "الملحق ناتج تشغيل فعلي أو لا يُعرض إطلاقاً.");
      return;
    }

    if (group !== "all" && !gm.groups.some((x) => x.key === group)) group = "all";

    /* ── شريط النتيجة ── */
    statStrip(page, [
      {
        label: "البوابات المنفذة الآن",
        value: fmt.int(gm.total),
        foot: fmt.int(gm.byLevel.block) + " حاجبة · " + fmt.int(gm.byLevel.warn) + " منذِرة",
      },
      {
        label: "اجتازت",
        value: fmt.int(gm.passed),
        foot: gm.total ? fmt.pct((gm.passed / gm.total) * 100) + " من الفحوص" : "",
        tone: "pos",
      },
      {
        label: "حاجبة لم تجتز",
        value: fmt.int(gm.blockers.length),
        foot: gm.blockers.length ? "النشر ممنوع حتى تُعالج" : "لا مانع نشر قائم",
        tone: gm.blockers.length ? "neg" : "pos",
      },
      {
        label: "إنذارات مفتوحة",
        value: fmt.int(gm.warnings.length),
        foot: "تُسجَّل ولا تمنع — تتطلب قراراً",
        tone: gm.warnings.length ? "warn" : "pos",
      },
      {
        label: "الوسوم الملازمة",
        value: noun(flags.length, "note"),
        foot: "قيم تُعرض بوسمها أينما ظهرت",
        tone: "warn",
      },
      gm.recorded && gm.recorded.total != null ? {
        label: "المسجَّل وقت التوليد",
        value: ratio(gm.recorded.passed, gm.recorded.total),
        foot: gm.recorded.checkedAt ? "بتاريخ " + fmt.date(gm.recorded.checkedAt) : "",
      } : null,
    ]);

    /* الإفصاح الحاسم: الرقمان ليسا مقارنين */
    if (gm.recorded && gm.recorded.total != null) {
      noteLine(page,
        "الرقمان أعلاه يقيسان مجموعتي فحوص مختلفتين ولا يُقارن أحدهما بالآخر: "
        + fmt.int(gm.recorded.total) + " بوابة سجّلها مولّد البيانات وقت بناء "
        + "الإصدار (فحوص المصنف والتوليد كاملة)، و" + fmt.int(gm.total)
        + " بوابة ينفذها درع التشغيل في المتصفح الآن على الإصدار المحمَّل. "
        + "لا يُقدَّم أحدهما بديلاً عن الآخر ولا يُجمعان.",
        "warnline");
    }

    /* ── شبكة العمودين ── */
    const grid = h("div", { class: "mth-grid mth-grid-gates" });
    page.appendChild(grid);
    const colA = h("div", { class: "mth-col" });
    const colB = h("div", { class: "mth-col" });
    grid.appendChild(colA);
    grid.appendChild(colB);

    /* ── بطاقة الإنذارات المفتوحة (تتصدر: هي ما يحتاج قراراً) ── */
    const warnCard = RH.presenter.layout.card(colA, {
      title: "الإنذارات المفتوحة",
      sub: "بوابات لم تجتز ولا تمنع النشر — كل واحدة تنتظر قراراً موثقاً",
      cls: "mth-card mth-card-warn",
    });
    if (!gm.warnings.length) {
      emptyState(warnCard.body, "لا إنذارات مفتوحة في الفحص الحي", null);
    } else {
      const ul = h("ul", { class: "mth-warns" });
      for (const w of gm.warnings) {
        ul.appendChild(h("li", { class: "mth-warn" },
          h("div", { class: "mth-warn-head" },
            h("span", { class: "mth-warn-dot", "aria-hidden": "true" }),
            h("span", { class: "mth-warn-label" }, w.label),
            mono(w.id, "small")),
          w.detail ? h("p", { class: "mth-warn-detail" }, w.detail) : null,
        ));
      }
      warnCard.body.appendChild(ul);
      noteLine(warnCard.body,
        noun(gm.warnings.length, "warn") + " مفتوحة — النشر ممكن معها، "
        + "ولكل إنذار أثر ظاهر في الواجهة (وسم أو بطاقة صادقة) لا يُخفى.");
    }

    /* ── بطاقة فلسفة الحجب مقابل الإنذار ── */
    const philCard = RH.presenter.layout.card(colA, {
      title: "الحجب مقابل الإنذار",
      sub: "لماذا تمنع بوابة النشر وتكتفي أخرى بالتسجيل",
      cls: "mth-card mth-card-phil",
    });
    const phil = h("div", { class: "mth-phil" });
    for (const item of [
      {
        badge: model.GATE_LEVELS.block.label,
        tone: "neg",
        title: "تمنع النشر",
        text: "البوابة الحاجبة تفحص اتساقاً داخلياً لا يحتمل الاجتهاد: مجموع "
          + "أجزاء يساوي كله، وسلسلة خط أساس زائد الإضافات تساوي الحالي، "
          + "وإعادة حساب المتصفح تطابق المشتقات المنشورة. فشلها يعني أن رقماً "
          + "معروضاً غير صحيح — ولا يُنشر عرض برقم غير صحيح.",
        count: gm.byLevel.block,
      },
      {
        badge: model.GATE_LEVELS.warn.label,
        tone: "gold",
        title: "تُسجَّل ولا تمنع",
        text: "البوابة المنذِرة تفحص اكتمال حوكمة لا اتساق حساب: قيمة لم "
          + "يعتمد مالكها منهجيتها، أو حقل ينتظر إدخالاً من المنصة، أو تاريخ "
          + "ينتظر تثبيتاً. الرقم المعروض صحيح فيما يخصه، والنقص يُعلن وسماً "
          + "ملازماً بدل أن يُخفى أو يُملأ بقيمة مختلقة.",
        count: gm.byLevel.warn,
      },
    ]) {
      phil.appendChild(h("div", { class: "mth-phil-item " + item.tone },
        h("div", { class: "mth-phil-head" },
          badge(item.badge, item.tone),
          h("span", { class: "mth-phil-title" }, item.title),
          h("b", { class: "mth-phil-count" }, noun(item.count, "gate"))),
        h("p", { class: "mth-phil-text" }, item.text),
      ));
    }
    philCard.body.appendChild(phil);
    noteLine(philCard.body,
      "القاعدة الحاكمة: لا تُضعَّف بوابة لتمرير بيانات — يوسَّع مجمع الحقائق "
      + "بحقيقة مشروعة أو تُصحَّح البيانات.");

    /* ── بطاقة سجل الوسوم الملازمة ── */
    const flagCard = RH.presenter.layout.card(colA, {
      title: "سجل الوسوم الملازمة",
      sub: "كل قيمة لم تُعتمد منهجيتها أو مصدرها — بنصها الحرفي من الإصدار",
      cls: "mth-card mth-card-flags",
    });
    if (!flags.length) {
      emptyState(flagCard.body, "لا وسوم ملازمة في هذا الإصدار", null);
    } else {
      const ul = h("ul", { class: "mth-flags" });
      for (const f of flags) {
        ul.appendChild(h("li", { class: "mth-flag " + (f.tone || "neu") },
          h("div", { class: "mth-flag-head" },
            h("span", { class: "mth-flag-label" }, f.label),
            h("b", { class: "mth-flag-value" }, f.valueText),
            badge(f.statusLabel, f.tone === "neg" ? "neg" : "gold"),
            f.decisionRef ? h("span", { class: "mth-flag-ref" },
              "قرار " + fmt.iso(f.decisionRef)) : null),
          f.note ? h("p", { class: "mth-flag-note" }, f.note) : null,
          f.rule ? h("p", { class: "mth-flag-rule" }, f.rule) : null,
        ));
      }
      flagCard.body.appendChild(ul);
      noteLine(flagCard.body,
        "الوسم يسافر مع الرقم: أي ظهور لهذه القيم في اللوحات أو الموجز أو "
        + "لوحة الأوامر يحمل نصه أعلاه — لا اختصار ولا طيّ.");
    }

    /* ── عمود البوابات: مجموعات + قائمة ── */
    const listCard = RH.presenter.layout.card(colB, {
      title: "البوابات المنفذة",
      sub: "مجمَّعة بموضوعها — والمجموعة ذات الفشل تتصدر",
      cls: "mth-card mth-card-gates",
    });

    const filters = h("div", { class: "mth-gfilters" });
    listCard.body.appendChild(filters);

    toggleGroup(filters, {
      cls: "mth-gstate",
      label: "الحالة",
      ariaLabel: "ترشيح حالة البوابة",
      value: state,
      items: GATE_STATES,
      onPick: (k) => {
        if (k === state) return;
        state = k;
        pendingFocus = null;
        ctx.update({ gs: k === "all" ? null : k });
      },
    });

    const groupBar = h("div", {
      class: "mth-groups", role: "tablist",
      "aria-label": "مجموعات بوابات التحقق",
    });
    listCard.body.appendChild(groupBar);

    const groupItems = [{
      key: "all", label: "كل المجموعات",
      total: gm.total, failed: gm.total - gm.passed,
    }].concat(gm.groups.map((x) => ({
      key: x.key, label: x.label, total: x.total, failed: x.failed,
    })));

    for (const gi of groupItems) {
      const tab = h("button", {
        class: "mth-gtab" + (gi.key === group ? " now" : "")
          + (gi.failed ? " has-fail" : ""),
        type: "button",
        role: "tab",
        "data-interactive": "",
        "aria-selected": String(gi.key === group),
        "aria-label": gi.label + " — " + noun(gi.total, "gate")
          + (gi.failed ? "، " + fmt.int(gi.failed) + " لم تجتز" : "، كلها مجتازة"),
        onclick: () => {
          if (gi.key === group) return;
          group = gi.key;
          pendingFocus = null;
          ctx.update({ g: gi.key === "all" ? null : gi.key });
        },
      },
        h("span", { class: "mth-gtab-label" }, gi.label),
        h("span", { class: "mth-gtab-n" }, fmt.int(gi.total)),
        gi.failed
          ? h("span", { class: "mth-gtab-fail" }, fmt.int(gi.failed)) : null,
      );
      groupBar.appendChild(tab);
    }

    const listHost = h("div", { class: "mth-glist-host" });
    listCard.body.appendChild(listHost);

    const shown = model.filterGates(gm.gates, { group, state });
    if (!shown.length) {
      emptyState(listHost, "لا بوابة تطابق الترشيح الحالي",
        "أعد الحالة إلى «الكل» — ولا تُعرض بوابة بديلة مختلقة.");
    } else {
      denseTable(listHost, {
        ariaLabel: "قائمة بوابات التحقق المنفذة",
        cls: "mth-gtable",
        columns: [
          {
            key: "ok", label: "النتيجة",
            render: (g) => badge(g.ok ? "اجتاز" : "لم يجتز", g.ok ? "pos" : (g.level === "block" ? "neg" : "gold")),
          },
          {
            key: "level", label: "المستوى",
            render: (g) => (model.GATE_LEVELS[g.level]
              ? model.GATE_LEVELS[g.level].label : g.level),
          },
          {
            key: "label", label: "ما تفحصه",
            render: (g) => h("span", { class: "mth-gcell" },
              h("span", {}, g.label),
              g.detail ? h("span", { class: "mth-gdetail" }, g.detail) : null),
          },
          { key: "id", label: "المعرف", cls: "mth-dim", render: (g) => mono(g.id, "small") },
        ],
        rows: shown,
        rowCls: (g) => (g.ok ? "" : (g.level === "block" ? "bad" : "warn")),
        note: "المعروض " + noun(shown.length, "gate") + " من "
          + fmt.int(gm.total) + " — والترشيح لا يغيّر نتيجة الفحص.",
      });
    }

    noteLine(page,
      "هذه الصفحة تشغّل الفحص عند كل دخول: الأرقام أعلاه ناتج التشغيل الآن "
      + "على الإصدار المحمَّل، لا قيمة محفوظة ولا رقم مكتوب في الكود.",
      "wide");
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-د) الصفحة 4 — قرارات المطابقة R1–R12
     ──────────────────────────────────────────────────────────────────────
     الجدول ثابت التأليف (مصدره وثيقة المطابقة لا الإصدار) — وكل قرار
     يُعرض إلى جانب **قرينته الحيّة** من الإصدار المنشور: النص الذي يثبت
     أثر القرار فعلاً. لا إعادة صياغة تغيّر منطوق قرار.
     ══════════════════════════════════════════════════════════════════════ */
  const DEC_FILTERS = [
    { key: "all", label: "الكل", hint: "كل قرارات المطابقة المسجَّلة" },
    { key: "open", label: "مفتوح", hint: "قرارات تنتظر مصدراً أو اعتماداً" },
    { key: "closed", label: "محسوم", hint: "قرارات مغلقة ونافذة في البناء" },
  ];

  function pageReconciliation(el, ctx) {
    const rel = RH.data.store.release();
    const all = model.decisionsWithEvidence(rel);
    const stats = model.reconciliationStats();

    let filter = paramStr(ctx, "rf", 10);
    if (!DEC_FILTERS.some((f) => f.key === filter)) filter = "all";
    let selected = paramStr(ctx, "r", 6).toUpperCase();
    if (selected && !model.reconciliationById(selected)) selected = "";

    const page = h("div", { class: "mth-page mth-p4" });
    el.appendChild(page);

    const withEvidence = all.filter((d) => d.hasEvidence).length;

    statStrip(page, [
      { label: "قرارات مسجَّلة", value: noun(stats.total, "decision") },
      {
        label: "مفتوحة",
        value: fmt.int(stats.open),
        foot: "تنتظر مصدراً رسمياً أو اعتماد مالك",
        tone: "warn",
      },
      {
        label: "محسومة",
        value: fmt.int(stats.closed),
        foot: "نافذة في هذا البناء",
        tone: "pos",
      },
      {
        label: "لها قرينة حيّة",
        value: ratio(withEvidence, stats.total),
        foot: "أثر القرار ظاهر نصاً في الإصدار المنشور",
      },
    ]);

    const grid = h("div", { class: "mth-grid mth-grid-dec" });
    page.appendChild(grid);
    const colA = h("div", { class: "mth-col" });
    const colB = h("div", { class: "mth-col" });
    grid.appendChild(colA);
    grid.appendChild(colB);

    /* ── جدول القرارات ── */
    const tblCard = RH.presenter.layout.card(colA, {
      title: "قرارات المطابقة",
      sub: "منقولة بصياغة عرضية من وثيقة مطابقة المصادر — بلا تغيير منطوق",
      cls: "mth-card mth-card-dec",
    });

    toggleGroup(tblCard.body, {
      cls: "mth-decfilter",
      label: "الحالة",
      ariaLabel: "ترشيح حالة القرار",
      value: filter,
      items: DEC_FILTERS,
      onPick: (k) => {
        if (k === filter) return;
        pendingFocus = null;
        ctx.update({ rf: k === "all" ? null : k });
      },
    });

    const shown = model.filterDecisions(all, { state: filter });
    const listHost = h("div", { class: "mth-declist" });
    tblCard.body.appendChild(listHost);

    if (!shown.length) {
      emptyState(listHost, "لا قرار بهذه الحالة", null);
    } else {
      const api = denseTable(listHost, {
        ariaLabel: "جدول قرارات المطابقة",
        cls: "mth-dectable",
        columns: [
          { key: "id", label: "المعرف", render: (d) => mono(d.id, "small") },
          {
            key: "topic", label: "الموضوع",
            render: (d) => h("span", { class: "mth-dec-topic" }, d.topic),
          },
          { key: "area", label: "المجال", cls: "mth-dim" },
          {
            key: "state", label: "الحالة",
            render: (d) => badge(d.stateLabel, d.state === model.OPEN ? "gold" : "pos"),
          },
          {
            key: "hasEvidence", label: "قرينة",
            render: (d) => (d.hasEvidence
              ? h("span", { class: "mth-dec-ev" }, fmt.int(d.evidence.length))
              : h("span", { class: "mth-dim" }, "—")),
          },
        ],
        rows: shown,
        keyOf: (d) => d.id,
        selectedKey: selected || null,
        rowCls: (d) => (d.state === model.OPEN ? "warn" : ""),
        rowAria: (d) => d.id + " — " + d.topic + " — " + d.stateLabel,
        onActivate: (d) => {
          pendingFocus = "dec:" + d.id;
          ctx.update({ r: d.id === selected ? null : d.id });
        },
      });
      /* استعادة التركيز بعد إعادة البناء الناتجة عن اختيار قرار */
      const want = pendingFocus;
      pendingFocus = null;
      if (want && want.indexOf("dec:") === 0) {
        const id = want.slice(4);
        const i = shown.findIndex((d) => d.id === id);
        if (i >= 0 && api.rows[i]) api.rows[i].focus();
      }
    }

    noteLine(tblCard.body,
      "الحالة في العمود حالةُ وثيقة المطابقة بتاريخها. وحيث سجّل الإصدار "
      + "المنشور أثراً لاحقاً على قرار، يظهر نصه الحرفي في بطاقة «القرينة في "
      + "الإصدار» — ولا يُعاد كتابة منطوق القرار ليطابقه.");

    /* ── بطاقة تفصيل القرار ── */
    const detail = h("div", { class: "mth-col-inner" });
    colB.appendChild(detail);

    const dec = selected ? all.find((d) => d.id === selected) : null;
    if (!dec) {
      const card = RH.presenter.layout.card(detail, {
        title: "اختر قراراً",
        sub: "لعرض منطوقه كاملاً وقرينته في الإصدار المنشور",
        cls: "mth-card mth-detail-card",
      });
      const ul = h("ul", { class: "mth-hint" });
      for (const line of [
        "القرارات المفتوحة هي ما ينتظر مصدراً رسمياً أو اعتماد مالك المنهجية.",
        "القرارات المحسومة نافذة في هذا البناء — ولكل منها أثر ظاهر في الواجهة.",
        "القرينة الحيّة نص من الإصدار المنشور نفسه، لا شرح مكتوب في الكود.",
      ]) ul.appendChild(h("li", {}, line));
      card.body.appendChild(ul);

      /* ملخص المفتوح: ما الذي يمنع اكتمال الحوكمة اليوم */
      const openList = all.filter((d) => d.state === model.OPEN);
      if (openList.length) {
        const oc = RH.presenter.layout.card(detail, {
          title: "ما يبقى مفتوحاً اليوم",
          sub: "القرارات التي تنتظر مصدراً أو اعتماداً",
          cls: "mth-card mth-card-open",
        });
        const ol = h("ul", { class: "mth-openlist" });
        for (const d of openList) {
          ol.appendChild(h("li", { class: "mth-openitem" },
            button("mth-openbtn", d.id, () => {
              pendingFocus = null;
              ctx.update({ r: d.id });
            }, {
              aria: "فتح تفصيل القرار " + d.id,
              children: [
                mono(d.id, "small"),
                h("span", { class: "mth-open-topic" }, d.topic),
                h("span", { class: "mth-open-state" }, d.stateNote),
              ],
            })));
        }
        oc.body.appendChild(ol);
      }
    } else {
      const card = RH.presenter.layout.card(detail, {
        title: dec.id + " — " + dec.topic,
        sub: dec.area + " · " + dec.stateNote,
        cls: "mth-card mth-detail-card",
      });
      card.body.appendChild(h("div", { class: "mth-dec-head" },
        badge(dec.stateLabel, dec.state === model.OPEN ? "gold" : "pos"),
        mono(dec.id, "small"),
        h("span", { class: "mth-dec-area" }, dec.area),
      ));
      card.body.appendChild(h("div", { class: "mth-dec-body" },
        h("div", { class: "mth-dec-k" }, "منطوق القرار"),
        h("p", { class: "mth-dec-text" }, dec.decision),
      ));

      const evHost = h("div", { class: "mth-sub" });
      evHost.appendChild(h("div", { class: "mth-sub-title" }, "القرينة في الإصدار"));
      if (!dec.evidence.length) {
        evHost.appendChild(h("p", { class: "mth-sub-empty" },
          "لا نص في الإصدار المنشور يقابل هذا القرار مباشرة — أثره في سلوك "
          + "البناء لا في حقل بيانات."));
      } else {
        const dl = kvList(evHost, "tight");
        for (const e of dec.evidence) {
          kvRow(dl, e.label, e.text, { cls: "wide", note: e.path });
        }
      }
      card.body.appendChild(evHost);

      const back = h("div", { class: "mth-dec-actions" },
        button("mth-linkbtn ghost", "إغلاق التفصيل", () => {
          pendingFocus = null;
          ctx.update({ r: null });
        }, { aria: "إغلاق تفصيل القرار والعودة إلى القائمة" }),
      );
      card.body.appendChild(back);
    }

    noteLine(page,
      "المصدر: وثيقة مطابقة المصادر في حزمة المشروع، القسم الثالث. "
      + "هذا الجدول عرضٌ لها لا تعديل عليها — ولا يُنشئ قراراً جديداً.",
      "wide");
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-هـ) التسجيل — يرث من ax-shell هيكل الصفحات والعودة السياقية ومفاتيح
        التقليب. تسجيلٌ مشروط بحضور الهيكل كي يُحمَّل الملف في بيئة اختبار
        الوحدة بنموذجه النقي وحده (عقد §0 «قاعدة قابلية الاختبار»).
     ══════════════════════════════════════════════════════════════════════ */
  if (RH.presenter && RH.presenter.ax
      && typeof RH.presenter.ax.register === "function") {
    RH.presenter.ax.register({
      id: "methodology",
      kicker: "ملحق الإسناد",
      title: "منهجية البيانات ومصادرها",
      returnLabel: (ret) => {
        const title = ret && ret.id ? SECTION_TITLES[ret.id] : null;
        return title ? "العودة إلى " + title : "العودة إلى العرض";
      },
      pages: () => [
        { name: "هوية الإصدار والمصادر", build: pageIdentity },
        { name: "أصل كل مقياس", build: pageProvenance },
        { name: "بوابات التحقق حيّاً", build: pageGates },
        { name: "قرارات المطابقة", build: pageReconciliation },
      ],
    });
  }
})();
