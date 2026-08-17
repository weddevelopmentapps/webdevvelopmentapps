/* ════════════════════════════════════════════════════════════════════════════
   report-pages.js — نموذج صفحات الموجز التنفيذي + محرك الترقيم
   عقد V2_CONTRACTS_EXPANSION §3.1 — يُضم بعد report-charts.js وقبل report.js
   ────────────────────────────────────────────────────────────────────────────
   هذا الملف **نقي بالكامل**: لا `document`، لا `window`، لا ECharts. مدخلاته
   كائن الإصدار والمشتقات، ومخرجاته وصف مجرّد للمستند. لذلك هو المُختبَر في
   `tests/unit/report-model.test.mjs`، وهو أيضاً ما يقرؤه منشئ الموجز في
   الإدارة ليعاين الاختيار قبل الطباعة.

   يقدّم شيئين:

   (1) **النموذج** `model(release, derived, opts)` — الغلاف، صفحات الأقسام
       بأرقامها ورسومها وجداولها ورؤاها **ووسوم صدقها**، وصفحة الإسناد.
       قاعدة حاكمة: لا سرد جديد. نصوص الرؤى من `insight_panels` حرفياً،
       والعناوين من تعريفات الأقسام، وكل رقم عبر `RH.core.fmt` من الإصدار.

   (2) **محرك الترقيم** `plan(model, opts)` — يحوّل الصفحات المنطقية إلى
       «أوراق» A4 فعلية: يقيس كل كتلة بالمليمتر، يوزع الرسوم صفوفاً، **يقسّم
       الجداول الطويلة عبر الأوراق** بترويسة مكررة ووسم «تابع»، ويرقّم الكل.
       الحساب كله بالمليمتر لأن الورقة مقاس فيزيائي: A4‏ 210×297مم بهوامش
       12مم ⇒ صندوق محتوى 186×273مم. الثوابت أدناه مرآة لأرقام `report.css`،
       وتغيير أحدهما دون الآخر يكسر الترقيم — والاختبار الوحدوي يثبّت النسب.

   وسوم الصدق ليست زينة تحريرية بل **جزء من النموذج**: منهجية 81.6٪ تلازم
   صفحة الرقابة، وcaveat السيناريوهات يلازم صفحة التوقعات، ووسم العينة يلازم
   كل جدول أحياء، وتنويه الخريطة وإسناد الحدود يلازمان صفحة التوزيع الجغرافي،
   والقيم الحالية الغائبة للمؤشرات تُعلن غيابها نصاً. الاختبار يتحقق من ذلك
   على النموذج نفسه لا على شجرة DOM — فلا يمكن حذف الوسم بتعديل عرضي.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

RH.report = RH.report || {};

RH.report.pages = (function () {
  const fmt = RH.core.fmt;

  /* ══════════════════════════════════════════════════════════════════════════
     1) القائمة القانونية للصفحات وتعريفاتها
     ══════════════════════════════════════════════════════════════════════════ */

  /** ترتيب الصفحات القانوني — الغلاف أولاً والإسناد آخراً دائماً */
  const PAGE_IDS = Object.freeze([
    "cover",
    "summary",
    "demand",
    "licensing",
    "control",
    "map",
    "initiatives",
    "kpis",
    "forecast",
    "closing",
    "appendix-tables",
    "provenance",
  ]);

  /** صفحتان إلزاميتان لا تقبلان الإسقاط عبر ‎?pages= — بلا غلاف لا هوية
      إصدار، وبلا إسناد لا مصدر لرقم. الموجز بلا هاتين ورقة مجهولة النسب. */
  const MANDATORY_PAGE_IDS = Object.freeze(["cover", "provenance"]);

  /** صفحات الأقسام القابلة للحصر (10) */
  const SECTION_PAGE_IDS = Object.freeze(
    PAGE_IDS.filter((id) => MANDATORY_PAGE_IDS.indexOf(id) === -1));

  /** العناوين والسياقات — مرآة تعريفات `RH.sections.register` القائمة.
      عند توفر السجل الحي (وضع المتصفح) تُقرأ منه مباشرة (`titleFor`)، وفي
      بيئة الاختبار النقية يُستعمل هذا الجدول: القيمتان متطابقتان بالتصميم. */
  const PAGE_META = Object.freeze({
    "cover": { title: "الموجز التنفيذي", kicker: "مستند مطبوع" },
    "summary": { title: "الملخص التنفيذي", kicker: "القراءة التنفيذية الأولى" },
    "demand": { title: "العرض والطلب", kicker: "قراءة السوق" },
    "licensing": { title: "التراخيص", kicker: "منظومة الترخيص" },
    "control": { title: "الرقابة الميدانية", kicker: "الإنفاذ الميداني" },
    "map": { title: "خريطة الرياض التفاعلية", kicker: "القيادة الجغرافية" },
    "initiatives": { title: "المبادرات والركائز", kicker: "التحرك الاستراتيجي" },
    "kpis": { title: "مؤشرات الأداء", kicker: "قياس أثر خطة العمل" },
    "forecast": { title: "سيناريوهات العجز", kicker: "التوقعات" },
    "closing": { title: "الخاتمة والتوصيات", kicker: "الخاتمة" },
    "appendix-tables": { title: "جداول الملاحق", kicker: "البيانات التفصيلية" },
    "provenance": { title: "الإسناد والمنهجية", kicker: "مصدر كل رقم" },
  });

  /** مفتاح لوحة الرؤى المعتمدة لكل صفحة (`insight_panels.sections`).
      الصفحات غير المذكورة تخرج بـ`insights: []` بصدق — لا لوحة مختلقة. */
  const INSIGHT_KEY = Object.freeze({
    summary: "supply",
    licensing: "licensing",
    control: "control",
    initiatives: "initiatives",
  });

  /** العنوان الحي إن توفر سجل الأقسام، وإلا من الجدول أعلاه */
  function titleFor(id) {
    if (typeof RH.sections !== "undefined" && RH.sections
      && typeof RH.sections.get === "function") {
      const def = RH.sections.get(id);
      if (def && def.title) return def.title;
    }
    return (PAGE_META[id] && PAGE_META[id].title) || id;
  }
  function kickerFor(id) {
    if (typeof RH.sections !== "undefined" && RH.sections
      && typeof RH.sections.get === "function") {
      const def = RH.sections.get(id);
      if (def && def.kicker) return def.kicker;
    }
    return (PAGE_META[id] && PAGE_META[id].kicker) || "";
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) تطبيع اختيار الصفحات (‎?pages=a,b,c)
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * يحوّل اختياراً خام (مصفوفة أو نص مفصول بفواصل) إلى قائمة معرفات صفحات
   * أقسام صالحة **بالترتيب القانوني** بلا تكرار. المعرفات المجهولة تُسقَط
   * بصمت (رابط قديم لا يُسقط المستند)، والصفحتان الإلزاميتان لا تظهران هنا
   * لأنهما لا تُحصران أصلاً. اختيار فارغ أو بلا صالح واحد ⇒ كل الصفحات.
   */
  function normalizePages(input) {
    if (input == null) return SECTION_PAGE_IDS.slice();
    let list = input;
    if (typeof list === "string") list = list.split(",");
    if (!Array.isArray(list)) return SECTION_PAGE_IDS.slice();
    const wanted = Object.create(null);
    for (const raw of list) {
      if (raw == null) continue;
      const id = String(raw).trim();
      if (!id) continue;
      if (SECTION_PAGE_IDS.indexOf(id) === -1) continue;
      wanted[id] = true;
    }
    const out = SECTION_PAGE_IDS.filter((id) => wanted[id]);
    return out.length ? out : SECTION_PAGE_IDS.slice();
  }

  /** المعرفات التي رُفضت من اختيارٍ خام — يعرضها شريط الأدوات بصدق */
  function rejectedPages(input) {
    if (input == null) return [];
    let list = input;
    if (typeof list === "string") list = list.split(",");
    if (!Array.isArray(list)) return [];
    const bad = [];
    for (const raw of list) {
      if (raw == null) continue;
      const id = String(raw).trim();
      if (!id) continue;
      if (SECTION_PAGE_IDS.indexOf(id) === -1 && bad.indexOf(id) === -1) bad.push(id);
    }
    return bad;
  }

  /** يعيد نص المعامل، أو "" حين الاختيار كامل (فلا معامل زائد في العنوان) */
  function serializePages(ids) {
    const norm = normalizePages(ids);
    if (norm.length === SECTION_PAGE_IDS.length) return "";
    return norm.join(",");
  }

  /** هل الاختيار محصور فعلاً؟ */
  const isRestricted = (ids) => normalizePages(ids).length < SECTION_PAGE_IDS.length;

  /* ══════════════════════════════════════════════════════════════════════════
     3) وسوم الصدق — نصوصها من الإصدار حرفياً، لا صياغة جديدة
     ══════════════════════════════════════════════════════════════════════════ */

  /** ترجمة حالة بيانات إلى عبارة عربية موحدة (المفردات مقفلة) */
  const STATUS_LABEL = Object.freeze({
    pending_methodology: "بانتظار اعتماد المنهجية",
    supplied_unvalidated: "قيمة مورّدة غير معتمدة",
    indicative_not_approved: "استرشادية غير معتمدة",
    pending_approval: "بانتظار الاعتماد",
    approved_brief: "معتمدة للعرض",
    approved_source_mirror: "منقولة حرفياً عن مصدر معتمد",
  });
  const statusLabel = (s) => STATUS_LABEL[s] || String(s || "");

  /** وسم منهجية الامتثال — يلازم 81.6٪ أينما ظهرت، بلا استثناء */
  function complianceCaveat(rel) {
    const c = rel.compliance;
    if (!c) return null;
    return c.label + " " + fmt.pct(c.value) + " — " + statusLabel(c.status)
      + ". " + c.note;
  }

  /** caveat السيناريوهات المورّدة — نصاً كاملاً من الإصدار */
  function scenariosCaveat(rel) {
    const s = rel.scenarios;
    if (!s) return null;
    return statusLabel(s.status) + ": " + s.caveat;
  }

  /** وسم عينة الأحياء — يلازم كل جدول أو ترتيب على مستوى الحي */
  function sampleCaveat(rel) {
    const n = rel.neighbourhoods;
    if (!n) return null;
    const label = (rel.meta && rel.meta.sample_label) || n.label;
    return label + " — " + n.ranking_note;
  }

  /** تنويه الخريطة + إسناد حدود الأحياء (نص الإسناد المعتمد في geomap) */
  const BOUNDARY_ATTRIB =
    "حدود الأحياء: بيانات عامة (MIT) — مواقع النقاط توضيحية من سجل المنصة";
  function mapCaveats(rel) {
    const out = [];
    if (rel.meta && rel.meta.map_disclaimer) {
      out.push(rel.meta.map_disclaimer + " — لا تُستخدم للاستدلال المساحي أو القانوني.");
    }
    out.push(BOUNDARY_ATTRIB);
    return out;
  }

  /** المستهدف الاسترشادي — يلازم أي رسم أو رقم يعرض خط 60٪ */
  function coverageTargetCaveat(rel) {
    const t = rel.coverage_target_indicative;
    if (!t) return null;
    return t.label + " " + fmt.pct(t.value) + " — " + statusLabel(t.status)
      + ". " + t.note;
  }

  /** مؤهِّل المقارنة الزمنية — يلازم كل رقم نمو */
  const comparisonCaveat = (rel) =>
    (rel.meta && rel.meta.comparison_qualifier) || null;

  /** غياب القيم الحالية للمؤشرات — الصيغة المعتمدة حرفياً */
  const KPI_MISSING = "تُسجَّل من المنصة — غير متوفرة";
  function kpiCurrentCaveat(rel) {
    const list = (rel.strategy && rel.strategy.kpis) || [];
    const note = list.length && list[0].current_note ? list[0].current_note : "";
    const missing = list.filter((k) => k.current == null).length;
    return "القيم الحالية لـ" + fmt.noun(missing, "indicator")
      + " من أصل " + fmt.noun(list.length, "indicator") + ": " + KPI_MISSING
      + (note ? ". " + note : "");
  }

  /** مصدر طبقة الاستراتيجية وقاعدة اشتقاق الحالة */
  function strategyCaveats(rel) {
    const st = rel.strategy || {};
    const out = [];
    if (st.source) out.push("مصدر المبادرات والركائز والمؤشرات: " + st.source);
    if (st.note) out.push(st.note);
    if (st.status_rule) out.push("قاعدة اشتقاق الحالة: " + st.status_rule);
    return out;
  }

  /** سجلات الحجر (بيانات المفتشين) — تظهر كوسم صدق لا كأرقام */
  function quarantineCaveats(rel) {
    const q = rel.quarantine || {};
    const out = [];
    for (const key of Object.keys(q)) {
      if (q[key] && q[key].reason) out.push(q[key].reason);
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) اشتقاقات نقية مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  const round1 = (v) => RH.data.derive.roundHalfUp(v, 1);
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /** حالة مبادرة — مرآة حرفية لقاعدة `strategy.status_rule` وgenerate_data:
      الحالة المصرّحة إن وُجدت؛ وإلا: نهاية سابقة لتاريخ الحساب ⇒ «متأخرة»
      حكماً، وبداية بلغت تاريخ الحساب ⇒ «جاري العمل»، وإلا «لم يتم البدء».
      المقارنة نصية على ISO‏ (YYYY-MM-DD) وهي ترتيبية صحيحة بهذا الشكل. */
  function initiativeStatus(ini, calcDate) {
    if (!ini) return null;
    if (ini.status) return ini.status;
    if (ini.end && calcDate && String(ini.end) < String(calcDate)) return "متأخرة";
    if (ini.start && calcDate && String(ini.start) <= String(calcDate)) return "جاري العمل";
    return "لم يتم البدء";
  }

  /** توزيع الحالات على مفردات `status_vocabulary` بترتيبها المعتمد */
  function statusCounts(initiatives, calcDate, vocabulary) {
    const vocab = (vocabulary && vocabulary.length)
      ? vocabulary.slice()
      : ["منجزة", "جاري العمل", "متأخرة", "لم يتم البدء"];
    const out = {};
    for (const v of vocab) out[v] = 0;
    for (const ini of initiatives || []) {
      const st = initiativeStatus(ini, calcDate);
      if (st == null) continue;
      out[st] = (out[st] || 0) + 1;
    }
    return out;
  }

  /** سلسلة التغطية الشهرية — مرآة `charts-supply.coverageSeries` نقيةً،
      كي يعمل النموذج (والاختبار) بلا مكتبة رسوم محمّلة. */
  function coverageSeries(rel) {
    const months = rel.monthly.licensing;
    const dem = rel.metrics.total_demand.value;
    let cum = rel.baseline.beds;
    const pts = [], cums = [], adds = [];
    for (const m of months) {
      cum += m.beds;
      cums.push(cum);
      adds.push(m.beds);
      pts.push(pctOf(cum, dem));
    }
    return { months, dem, pts, cums, adds, last: pts.length ? pts[pts.length - 1] : null };
  }

  /** تنسيق قيمة مؤشر وفق صيغته — مرآة `charts-strategy.kpiVal` */
  function kpiValue(k, v) {
    if (v == null || !Number.isFinite(v)) return KPI_MISSING;
    return k.pct ? fmt.pct(round1(v * 100)) : fmt.int(v);
  }

  /** ملخص محفظة المؤشرات: العدد، التوزيع على الأنواع، وعدّاد القيم الغائبة */
  function kpiSummary(rel) {
    const kpis = ((rel.strategy && rel.strategy.kpis) || []).slice()
      .sort((a, b) => a.id - b.id);
    const types = {};
    let missing = 0, pctKind = 0;
    for (const k of kpis) {
      types[k.type] = (types[k.type] || 0) + 1;
      if (k.current == null) missing += 1;
      if (k.pct) pctKind += 1;
    }
    return {
      kpis,
      total: kpis.length,
      types,
      typeList: Object.keys(types).map((t) => ({ type: t, count: types[t] })),
      missingCurrent: missing,
      availableCurrent: kpis.length - missing,
      pctKind,
      countKind: kpis.length - pctKind,
      note: kpis.length ? kpis[0].current_note : "",
    };
  }

  /** صفوف القطاعات الخمسة مثراة بالمشتقات القطاعية */
  function sectorRows(rel, der) {
    const sec = (der && der.sector) || {};
    return rel.sectors.map((s) => {
      const d = sec[s.id] || {};
      return {
        id: s.id,
        name: s.name,
        short: s.short,
        demand: s.demand,
        beds: s.beds,
        building: s.building,
        operational: s.operational,
        monitors: s.monitors,
        visits: s.visits,
        violations: s.violations,
        closures: s.closures,
        coverage_pct: d.coverage_pct != null ? d.coverage_pct : pctOf(s.beds, s.demand),
        deficit_beds: d.deficit_beds != null ? d.deficit_beds : Math.max(s.demand - s.beds, 0),
        violations_share_pct: d.violations_share_pct != null ? d.violations_share_pct : null,
        visits_share_pct: d.visits_share_pct != null ? d.visits_share_pct : null,
        demand_share_pct: d.demand_share_pct != null ? d.demand_share_pct : null,
        violations_per_monitor: s.monitors > 0
          ? round1(s.violations / s.monitors) : null,
        visits_per_monitor: s.monitors > 0
          ? Math.round(s.visits / s.monitors) : null,
      };
    });
  }

  /** صفوف عينة الأحياء مرتبة بالقطاع ثم بالطاقة تنازلياً — الترتيب داخل
      العينة فقط، والوسم يقول ذلك صراحةً في `note` الجدول. */
  function districtRows(rel) {
    const nb = rel.neighbourhoods || {};
    const bySector = {};
    for (const s of rel.sectors) bySector[s.id] = s.name;
    return (nb.rows || []).map((r) => Object.assign({}, r, {
      sectorName: bySector[r.sector] || r.sector,
    })).sort((a, b) => {
      if (a.sector !== b.sector) {
        return rel.sectors.findIndex((s) => s.id === a.sector)
          - rel.sectors.findIndex((s) => s.id === b.sector);
      }
      return b.beds - a.beds;
    });
  }

  /** نموذج السيناريوهات: الصفوف + الانتشار الشهري + الحدّان */
  function scenarioModel(rel) {
    const sc = rel.scenarios || { rows: [] };
    const rows = (sc.rows || []).map((r) => ({
      iso: r.iso,
      label: r.label,
      conservative: r.conservative,
      base: r.base,
      optimistic: r.optimistic,
      spread: r.conservative - r.optimistic,
    }));
    const first = rows.length ? rows[0] : null;
    const last = rows.length ? rows[rows.length - 1] : null;
    let maxSpread = null;
    for (const r of rows) {
      if (maxSpread == null || r.spread > maxSpread.spread) maxSpread = r;
    }
    return {
      title: sc.title || "",
      unit: sc.unit || "سرير",
      status: sc.status || "",
      caveat: sc.caveat || "",
      rows, first, last, maxSpread,
      horizonMonths: rows.length,
    };
  }

  /** إجماليات مشتقة من سلسلة الرقابة الشهرية (لا رقم جديد — مجاميع مباشرة) */
  function monitoringSeries(rel) {
    const rows = (rel.monthly && rel.monthly.monitoring) || [];
    const visits = rows.map((r) => r.visits);
    const violations = rows.map((r) => r.violations);
    let sumV = 0, sumX = 0;
    for (const v of visits) sumV += v;
    for (const v of violations) sumX += v;
    let peak = null;
    for (const r of rows) if (!peak || r.violations > peak.violations) peak = r;
    const peakLabels = rows.filter((r) => peak && r.violations === peak.violations)
      .map((r) => r.label);
    return { rows, visits, violations, sumVisits: sumV, sumViolations: sumX, peak, peakLabels };
  }

  /** إجماليات مشتقة من سلسلة التراخيص الشهرية */
  function licensingSeries(rel) {
    const rows = (rel.monthly && rel.monthly.licensing) || [];
    let b = 0, o = 0, beds = 0;
    for (const r of rows) { b += r.building; o += r.operational; beds += r.beds; }
    return {
      rows,
      building: rows.map((r) => r.building),
      operational: rows.map((r) => r.operational),
      beds: rows.map((r) => r.beds),
      sumBuilding: b, sumOperational: o, sumBeds: beds,
    };
  }

  /** عدد أحياء كل قطاع من طبقة الجغرافيا (بلا اختلاق: يعيد null عند غيابها) */
  function geoCounts(geo) {
    if (!geo || !geo.sectors) return null;
    const out = {};
    let total = 0;
    for (const key of Object.keys(geo.sectors)) {
      const n = (geo.sectors[key] || []).length;
      out[key] = n;
      total += n;
    }
    return { bySector: out, total, hotspots: (geo.hotspots || []).length };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) بناة الكتل — أرقام بارزة، جداول، رؤى
     ══════════════════════════════════════════════════════════════════════════ */

  /** رقم بارز: القيمة **منسقة سلفاً** كي لا يُنسق شيء في طبقة العرض */
  function fig(label, value, unit, tone, note) {
    const f = { label: String(label), value: String(value) };
    if (unit) f.unit = String(unit);
    if (tone) f.tone = String(tone);
    if (note) f.note = String(note);
    return f;
  }

  /** خلية جدول: نص، ونغمة اختيارية، ورسم مصغر اختياري يفسّره report.js */
  function cell(text, opts) {
    if (!opts) return String(text);
    return Object.assign({ text: String(text) }, opts);
  }

  /** عمود جدول: عنوانه ومحاذاته (`end` للأرقام في RTL) */
  const col = (label, align) => ({ label: String(label), align: align || "start" });

  /** جدول: عنوان وأعمدة وصفوف وملاحظة ملازمة (وسم العينة يمر من هنا) */
  function table(title, columns, rows, note) {
    const t = { title: String(title), columns, rows };
    if (note) t.note = String(note);
    return t;
  }

  /** مواصفة رسم: مُنشئ قانوني + خياراته + تسميته + وسمه الملازم */
  function chart(builder, opts, caption, caveat) {
    const c = { builder: String(builder), caption: String(caption || "") };
    if (opts) c.opts = opts;
    if (caveat) c.caveat = String(caveat);
    return c;
  }

  /** لوحات الرؤى المعتمدة لصفحة — حرفياً من `insight_panels`، بلا تحرير */
  function insightsFor(rel, pageId) {
    const key = INSIGHT_KEY[pageId];
    if (!key) return [];
    const src = rel.insight_panels && rel.insight_panels.sections;
    const list = (src && src[key]) || [];
    return list.map((p) => ({
      cls: p.cls, title: p.title, text: p.text,
      status: p.status || null, id: p.id || null,
    }));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) صفحات الأقسام — واحدة لكل قسم من الأقسام التسعة + جداول الملاحق
     ══════════════════════════════════════════════════════════════════════════ */

  /** هيكل صفحة فارغ موحد */
  function blankPage(id) {
    return {
      id,
      title: titleFor(id),
      kicker: kickerFor(id),
      figures: [],
      charts: [],
      tables: [],
      insights: [],
      caveats: [],
    };
  }

  /* ── 6.1 الملخص التنفيذي ─────────────────────────────────────────────── */
  function pageSummary(rel, der) {
    const p = blankPage("summary");
    const m = rel.metrics;
    p.figures = [
      fig("إجمالي الطلب التقديري", fmt.int(m.total_demand.value), "سرير", "demand"),
      fig("الطاقة الاستيعابية المرخصة", fmt.int(m.licensed_beds.value), "سرير", "pos"),
      fig("العجز في الطاقة", fmt.int(der.deficit_beds), "سرير", "neg",
        rel.derived.deficit_beds.formula),
      fig("نسبة التغطية", fmt.pct(der.coverage_pct), null, "neu",
        rel.derived.coverage_pct.formula),
      fig("نسبة الإشغال", fmt.pct(der.occupancy_pct), null, "pos",
        rel.derived.occupancy_pct.formula),
      fig("الأسرّة الشاغرة", fmt.int(der.vacant_beds), "سرير", "neu"),
    ];
    p.charts = [
      chart("coverageEvolution", { size: "wide", baseline: true, compact: false },
        "تطور نسبة التغطية شهرياً — " + rel.meta.monitoring_period_label
        + "، تنتهي عند " + fmt.pct(der.coverage_pct),
        coverageTargetCaveat(rel)),
      chart("sectorSupplyDemand", { size: "wide", deficit: true, compact: false },
        "الطلب مقابل الطاقة المرخصة والعجز في القطاعات الخمسة"),
    ];
    const rows = sectorRows(rel, der);
    p.tables = [table(
      "القطاعات الخمسة — الطلب والطاقة والتغطية",
      [col("القطاع"), col("الطلب (سرير)", "end"), col("الطاقة المرخصة (سرير)", "end"),
        col("نسبة التغطية", "end"), col("العجز (سرير)", "end")],
      rows.map((r) => [
        r.name,
        cell(fmt.int(r.demand), { tone: "demand" }),
        cell(fmt.int(r.beds), { tone: "pos" }),
        cell(fmt.pct(r.coverage_pct), {
          micro: { kind: "ratio", pct: r.coverage_pct, tone: "pos" },
        }),
        cell(fmt.int(r.deficit_beds), { tone: "neg" }),
      ]),
      "الترتيب بترتيب القطاعات المعتمد في الإصدار — لا ترتيب تنافسي مضاف.",
    )];
    p.insights = insightsFor(rel, "summary");
    p.caveats = [
      "بيانات هذا الموجز حتى " + rel.meta.data_as_of + "؛ فترة الرصد "
      + rel.meta.monitoring_period_label + ".",
      comparisonCaveat(rel),
      coverageTargetCaveat(rel),
    ].filter(Boolean);
    return p;
  }

  /* ── 6.2 العرض والطلب ────────────────────────────────────────────────── */
  function pageDemand(rel, der) {
    const p = blankPage("demand");
    const m = rel.metrics;
    p.figures = [
      fig("الطلب — الياقات الزرقاء", fmt.int(rel.collar.blue), "سرير", "blue",
        fmt.pct(der.blue_share_pct) + " من إجمالي الطلب"),
      fig("الطلب — الياقات البيضاء", fmt.int(rel.collar.white), "سرير", "demand",
        fmt.pct(der.white_share_pct) + " من إجمالي الطلب"),
      fig("الأسرّة المشغولة", fmt.int(m.occupied_beds.value), "سرير", "pos"),
      fig("الأسرّة الشاغرة", fmt.int(der.vacant_beds), "سرير", "neu",
        rel.derived.vacant_beds.formula),
      fig("نسبة عدم التغطية", fmt.pct(der.uncovered_pct), null, "neg",
        rel.derived.uncovered_pct.formula),
      fig("نسبة الإشغال من الطاقة", fmt.pct(der.occupancy_pct), null, "pos"),
    ];
    p.charts = [
      chart("occupancyComposition", { size: "wide", collar: true, compact: false },
        "تركيبة الإشغال والطلب على محور قيم واحد — الطاقة المرخصة مقابل إجمالي الطلب"),
      chart("econBars", { size: "standard", share: true },
        "الطلب على الأسرّة بحسب النشاط الاقتصادي"),
    ];
    const acts = rel.economic_activities || [];
    const totDem = m.total_demand.value;
    p.tables = [
      table(
        "الطلب بحسب النشاط الاقتصادي",
        [col("النشاط"), col("الطلب (سرير)", "end"), col("الحصة من الطلب", "end")],
        acts.map((a) => [
          a.name,
          cell(fmt.int(a.demand), { tone: "demand" }),
          cell(fmt.pct(pctOf(a.demand, totDem)), {
            micro: { kind: "ratio", pct: pctOf(a.demand, totDem), tone: "demand" },
          }),
        ]),
        "المجموع يطابق إجمالي الطلب المعتمد " + fmt.unitAfter(totDem, "سرير") + ".",
      ),
      table(
        "تركيبة الطلب بحسب فئة العمالة",
        [col("الفئة"), col("الطلب (سرير)", "end"), col("الحصة", "end")],
        [
          ["الياقات الزرقاء", cell(fmt.int(rel.collar.blue), { tone: "blue" }),
            fmt.pct(der.blue_share_pct)],
          ["الياقات البيضاء", cell(fmt.int(rel.collar.white), { tone: "demand" }),
            fmt.pct(der.white_share_pct)],
        ],
        "المصدر: ورقة السياق في ملف البيانات المعتمد.",
      ),
    ];
    p.caveats = [
      "أرقام الطلب تقديرية من ملف البيانات المعتمد (ورقة الطلب) — لا مسح ميداني جديد.",
    ];
    return p;
  }

  /* ── 6.3 التراخيص ────────────────────────────────────────────────────── */
  function pageLicensing(rel, der) {
    const p = blankPage("licensing");
    const m = rel.metrics;
    const growth = (abs, pct) => fmt.iso((abs >= 0 ? "+" : "−") + fmt.int(Math.abs(abs)))
      + " (" + fmt.pct(pct) + ")";
    p.figures = [
      fig("رخص البناء", fmt.int(m.current_building.value), "رخصة", "pos",
        growth(der.growth_building_abs, der.growth_building_pct) + " عن خط الأساس"),
      fig("الرخص التشغيلية", fmt.int(m.current_operational.value), "رخصة", "pos",
        growth(der.growth_operational_abs, der.growth_operational_pct) + " عن خط الأساس"),
      fig("الطاقة المرخصة", fmt.int(m.licensed_beds.value), "سرير", "pos",
        growth(der.growth_beds_abs, der.growth_beds_pct) + " عن خط الأساس"),
      fig("خط الأساس — رخص البناء", fmt.int(rel.baseline.building), "رخصة", "gold",
        rel.meta.baseline_label),
      fig("خط الأساس — الرخص التشغيلية", fmt.int(rel.baseline.operational), "رخصة", "gold",
        rel.meta.baseline_label),
      fig("خط الأساس — الطاقة", fmt.int(rel.baseline.beds), "سرير", "gold",
        rel.meta.baseline_label),
    ];
    p.charts = [
      chart("cumulativeLicenses", { size: "wide", compact: false },
        "المسار التراكمي للرخص والطاقة — " + rel.meta.monitoring_period_label),
      chart("facilityTypes", { size: "standard" },
        "توزيع الرخص التشغيلية على أنواع الإيواء"),
    ];
    const ls = licensingSeries(rel);
    p.tables = [
      table(
        "سجل الإصدار الشهري — " + rel.meta.monitoring_period_label,
        [col("الشهر"), col("رخص بناء", "end"), col("رخص تشغيلية", "end"),
          col("الطاقة المضافة (سرير)", "end")],
        ls.rows.map((r) => [
          r.label, fmt.int(r.building), fmt.int(r.operational),
          cell(fmt.int(r.beds), { tone: "pos" }),
        ]).concat([[
          cell("المجموع", { strong: true }),
          cell(fmt.int(ls.sumBuilding), { strong: true }),
          cell(fmt.int(ls.sumOperational), { strong: true }),
          cell(fmt.int(ls.sumBeds), { strong: true, tone: "pos" }),
        ]]),
        "المجموع المضاف إلى خط الأساس يساوي الطاقة المرخصة المنشورة "
        + fmt.unitAfter(m.licensed_beds.value, "سرير") + ".",
      ),
      table(
        "أنواع الإيواء المرخصة",
        [col("النوع"), col("عدد الرخص التشغيلية", "end"), col("الحصة", "end")],
        (rel.facility_types || []).map((f) => {
          const tot = (rel.facility_types || []).reduce((a, x) => a + x.count, 0);
          return [
            f.name, fmt.int(f.count),
            cell(fmt.pct(pctOf(f.count, tot)), {
              micro: { kind: "ratio", pct: pctOf(f.count, tot), tone: "pos" },
            }),
          ];
        }),
        "المصدر: ورقة التراخيص في ملف البيانات المعتمد.",
      ),
    ];
    p.insights = insightsFor(rel, "licensing");
    p.caveats = [comparisonCaveat(rel)].filter(Boolean);
    return p;
  }

  /* ── 6.4 الرقابة الميدانية ───────────────────────────────────────────── */
  function pageControl(rel, der) {
    const p = blankPage("control");
    const m = rel.metrics;
    const ms = monitoringSeries(rel);
    p.figures = [
      fig("المراقبون", fmt.int(m.total_monitors.value), "مراقب", "neu"),
      fig("الزيارات الميدانية", fmt.int(m.total_visits.value), "زيارة", "pos",
        "بمتوسط " + fmt.unitAfter(der.avg_monthly_visits, "زيارة") + " شهرياً"),
      fig("المخالفات المسجلة", fmt.int(m.total_violations.value), "مخالفة", "neg"),
      fig("قرارات الإغلاق", fmt.int(m.total_closures.value), "قرار", "neg"),
      fig("مخالفات قطاع الجنوب", fmt.int(m.south_violations.value), "مخالفة", "neg",
        fmt.pct(der.south_violations_share_pct) + " من إجمالي المخالفات"),
      fig("معدل الامتثال", fmt.pct(rel.compliance.value), null, "neu",
        statusLabel(rel.compliance.status)),
    ];
    p.charts = [
      chart("monthlyActivityDual", { size: "tall", mode: "monthly", compact: false },
        "النشاط الرقابي شهرياً — الزيارات أعلى والمخالفات أسفل في شبكتين منفصلتين"),
      chart("complianceCard", { size: "standard" },
        "معدل الامتثال في الجولات الرقابية",
        complianceCaveat(rel)),
    ];
    p.tables = [
      table(
        "أنواع المخالفات المسجلة",
        [col("نوع المخالفة"), col("العدد", "end"), col("الحصة", "end")],
        (rel.violation_types || []).map((v) => {
          const tot = m.total_violations.value;
          return [
            v.name, cell(fmt.int(v.count), { tone: "neg" }),
            cell(fmt.pct(pctOf(v.count, tot)), {
              micro: { kind: "ratio", pct: pctOf(v.count, tot), tone: "neg" },
            }),
          ];
        }),
        "قد تُسجَّل أكثر من مخالفة في الزيارة الواحدة — المجموع لا يساوي عدد الزيارات.",
      ),
      table(
        "القدرة الرقابية وتوزيعها على القطاعات",
        [col("القطاع"), col("المراقبون", "end"), col("الزيارات", "end"),
          col("المخالفات", "end"), col("قرارات الإغلاق", "end"),
          col("مخالفات لكل مراقب", "end")],
        sectorRows(rel, der).map((r) => [
          r.name, fmt.int(r.monitors), fmt.int(r.visits),
          cell(fmt.int(r.violations), { tone: "neg" }),
          fmt.int(r.closures),
          r.violations_per_monitor == null ? "—" : fmt.dec1(r.violations_per_monitor),
        ]),
        "«مخالفات لكل مراقب» اشتقاق حسابي تعريفي من الأعمدة المعتمدة — ليس مؤشر أداء مقرّاً.",
      ),
    ];
    p.insights = insightsFor(rel, "control");
    /* الوسم الإلزامي: منهجية 81.6٪ تلازم الصفحة نفسها لا الرسم وحده */
    p.caveats = [complianceCaveat(rel)]
      .concat(quarantineCaveats(rel))
      .concat([
        ms.peakLabels.length
          ? "ذروة المخالفات " + fmt.int(ms.peak.violations) + " في "
            + fmt.monthsList(ms.peakLabels) + "."
          : null,
      ])
      .filter(Boolean);
    return p;
  }

  /* ── 6.5 التوزيع الجغرافي ────────────────────────────────────────────── */
  function pageMap(rel, der, geo) {
    const p = blankPage("map");
    const gc = geoCounts(geo);
    const ranks = (der && der.rankings) || {};
    const byId = {};
    for (const s of rel.sectors) byId[s.id] = s;
    const nameOf = (id) => (byId[id] ? byId[id].name : "—");
    p.figures = [
      fig("الأحياء المرسومة", gc ? fmt.int(gc.total) : "—", "حي", "neu",
        gc ? null : "طبقة الجغرافيا غير مضمّنة في هذا البناء"),
      fig("القطاعات", fmt.int(rel.sectors.length), "قطاع", "neu"),
      fig("نقاط التركّز الرقابي", gc ? fmt.int(gc.hotspots) : "—", "نقطة", "neg",
        "مواقع توضيحية من سجل المنصة"),
      fig("أدنى تغطية", nameOf(ranks.lowest_coverage), null, "neg",
        ranks.lowest_coverage
          ? fmt.pct(der.sector[ranks.lowest_coverage].coverage_pct) : null),
      fig("أعلى تغطية", nameOf(ranks.highest_coverage), null, "pos",
        ranks.highest_coverage
          ? fmt.pct(der.sector[ranks.highest_coverage].coverage_pct) : null),
      fig("أعلى مخالفات", nameOf(ranks.highest_violations), null, "neg",
        ranks.highest_violations
          ? fmt.unitAfter(byId[ranks.highest_violations].violations, "مخالفة") : null),
    ];
    p.charts = [
      chart("sectorViolationsBars", { size: "standard", key: "map", toggle: false },
        "المخالفات المسجلة بحسب القطاع"),
      chart("sectorLicenseCompare", { size: "standard", key: "map" },
        "رخص البناء والرخص التشغيلية بحسب القطاع"),
    ];
    const rows = sectorRows(rel, der);
    p.tables = [
      table(
        "بنية القطاعات الجغرافية",
        [col("القطاع"), col("الأحياء", "end"), col("الطلب (سرير)", "end"),
          col("الطاقة (سرير)", "end"), col("نسبة التغطية", "end"),
          col("حصة الطلب", "end")],
        rows.map((r) => [
          r.name,
          gc && gc.bySector[r.id] != null ? fmt.int(gc.bySector[r.id]) : "—",
          cell(fmt.int(r.demand), { tone: "demand" }),
          cell(fmt.int(r.beds), { tone: "pos" }),
          cell(fmt.pct(r.coverage_pct), {
            micro: { kind: "ratio", pct: r.coverage_pct, tone: "pos" },
          }),
          r.demand_share_pct == null ? "—" : fmt.pct(r.demand_share_pct),
        ]),
        gc ? "عدد الأحياء من طبقة الحدود المضمّنة (" + fmt.int(gc.total)
          + " حياً)." : "طبقة الحدود غير متوفرة في هذا البناء.",
      ),
      table(
        "عينة الأحياء المدرجة — أعلى خمسة أحياء بالطاقة المرخصة",
        [col("الحي"), col("القطاع"), col("الطاقة (سرير)", "end"),
          col("رخص تشغيلية", "end"), col("المخالفات", "end")],
        districtRows(rel).slice()
          .sort((a, b) => b.beds - a.beds).slice(0, 5)
          .map((r) => [
            r.name, r.sectorName,
            cell(fmt.int(r.beds), { tone: "pos" }),
            fmt.int(r.operational),
            cell(fmt.int(r.violations), { tone: "neg" }),
          ]),
        sampleCaveat(rel),
      ),
    ];
    p.caveats = mapCaveats(rel).concat([sampleCaveat(rel)]).filter(Boolean);
    return p;
  }

  /* ── 6.6 المبادرات والركائز ──────────────────────────────────────────── */
  function pageInitiatives(rel, der) {
    const p = blankPage("initiatives");
    const st = rel.strategy || {};
    const inis = st.initiatives || [];
    const calc = rel.meta.calculation_date;
    const counts = statusCounts(inis, calc, st.status_vocabulary);
    const pillars = st.pillars || [];
    p.figures = [
      fig("المبادرات", fmt.int(inis.length), "مبادرة", "neu"),
      fig("الركائز والممكنات", fmt.int(pillars.length), null, "neu",
        fmt.noun(pillars.filter((x) => x.kind === "ركيزة").length, "pillar")
        + " وممكن واحد"),
      fig("منجزة", fmt.int(counts["منجزة"] || 0), "مبادرة", "pos"),
      fig("جاري العمل", fmt.int(counts["جاري العمل"] || 0), "مبادرة", "blue"),
      fig("متأخرة", fmt.int(counts["متأخرة"] || 0), "مبادرة", "neg",
        "تجاوزت نهايتها المخططة دون تسجيل إنجاز"),
      fig("لم يتم البدء", fmt.int(counts["لم يتم البدء"] || 0), "مبادرة", "neu"),
    ];
    p.charts = [
      chart("initiativeGantt", { size: "tall", compact: false },
        "المخطط الزمني لمحفظة المبادرات — خط المرجع عند "
        + fmt.date(calc)),
      chart("statusDonut", { size: "standard" },
        "توزيع حالات المبادرات الثمانية عشرة"),
    ];
    const pillarRows = pillars.map((pl) => {
      const own = inis.filter((i) => i.pillar_id === pl.id);
      const c = statusCounts(own, calc, st.status_vocabulary);
      return [
        pl.name,
        pl.kind,
        fmt.int(own.length),
        cell(fmt.int(c["منجزة"] || 0), { tone: "pos" }),
        cell(fmt.int(c["جاري العمل"] || 0), { tone: "blue" }),
        cell(fmt.int(c["متأخرة"] || 0), { tone: "neg" }),
      ];
    });
    p.tables = [table(
      "الركائز والممكنات وتوزيع مبادراتها",
      [col("الركيزة / الممكن"), col("النوع"), col("المبادرات", "end"),
        col("منجزة", "end"), col("جاري العمل", "end"), col("متأخرة", "end")],
      pillarRows,
      "الحالة محسوبة بقاعدة الإصدار عند تاريخ الحساب " + fmt.date(calc) + ".",
    )];
    p.insights = insightsFor(rel, "initiatives");
    p.caveats = strategyCaveats(rel);
    return p;
  }

  /* ── 6.7 مؤشرات الأداء ───────────────────────────────────────────────── */
  function pageKpis(rel) {
    const p = blankPage("kpis");
    const ks = kpiSummary(rel);
    p.figures = [
      fig("مؤشرات الأداء", fmt.int(ks.total), "مؤشر", "neu"),
      fig("مؤشرات نسبية", fmt.int(ks.pctKind), "مؤشر", "neu", "قيمها نسب مئوية"),
      fig("مؤشرات عددية", fmt.int(ks.countKind), "مؤشر", "neu", "قيمها أعداد مطلقة"),
      fig("قيم حالية متوفرة", fmt.int(ks.availableCurrent), "مؤشر",
        ks.availableCurrent ? "pos" : "neg", KPI_MISSING),
      fig("قيم حالية غائبة", fmt.int(ks.missingCurrent), "مؤشر", "neg", KPI_MISSING),
      fig("أنواع المؤشرات", fmt.int(ks.typeList.length), null, "neu",
        ks.typeList.map((t) => t.type + ": " + fmt.int(t.count)).join(" · ")),
    ];
    p.charts = [
      chart("kpiBullets", { size: "tall", compact: false },
        "خط الأساس والمستهدف لكل مؤشر — القيم الحالية غير متوفرة وتُعرض كذلك",
        kpiCurrentCaveat(rel)),
    ];
    p.tables = [table(
      "محفظة المؤشرات الأربعة عشر",
      [col("#", "end"), col("المؤشر"), col("النوع"), col("خط الأساس", "end"),
        col("المستهدف", "end"), col("القيمة الحالية", "end")],
      ks.kpis.map((k) => [
        fmt.int(k.id),
        k.name,
        k.type,
        cell(kpiValue(k, k.baseline), { tone: "gold" }),
        cell(kpiValue(k, k.target), { tone: "gold" }),
        cell(kpiValue(k, k.current), { tone: k.current == null ? "muted" : "pos" }),
      ]),
      kpiCurrentCaveat(rel),
    )];
    p.caveats = [kpiCurrentCaveat(rel)]
      .concat(strategyCaveats(rel).slice(0, 2))
      .filter(Boolean);
    return p;
  }

  /* ── 6.8 سيناريوهات العجز ────────────────────────────────────────────── */
  function pageForecast(rel, der) {
    const p = blankPage("forecast");
    const sm = scenarioModel(rel);
    const dNow = der.deficit_beds;
    const deltaLast = sm.last ? sm.last.base - dNow : null;
    p.figures = [
      fig("العجز الحالي (خط الأساس)", fmt.int(dNow), "سرير", "gold",
        rel.derived.deficit_beds.formula),
      fig("الأفق الزمني", fmt.int(sm.horizonMonths), "شهراً", "neu",
        sm.first && sm.last ? sm.first.label + " – " + sm.last.label : null),
      fig("الأساسي في " + (sm.last ? sm.last.label : "—"),
        sm.last ? fmt.int(sm.last.base) : "—", "سرير", "neg",
        statusLabel(sm.status)),
      fig("المتحفظ في " + (sm.last ? sm.last.label : "—"),
        sm.last ? fmt.int(sm.last.conservative) : "—", "سرير", "neg",
        statusLabel(sm.status)),
      fig("المتفائل في " + (sm.last ? sm.last.label : "—"),
        sm.last ? fmt.int(sm.last.optimistic) : "—", "سرير", "neg",
        statusLabel(sm.status)),
      fig("أوسع انتشار شهري",
        sm.maxSpread ? fmt.int(sm.maxSpread.spread) : "—", "سرير", "neu",
        sm.maxSpread ? "في " + sm.maxSpread.label : null),
    ];
    p.charts = [
      chart("forecastScenarios", { size: "wide", baseline: true, compact: false },
        sm.title, scenariosCaveat(rel)),
    ];
    p.tables = [table(
      "سيناريوهات العجز المورّدة — " + (sm.rows.length ? sm.first.label + " إلى "
        + sm.last.label : "—"),
      [col("الشهر"), col("متحفظ (سرير)", "end"), col("أساسي (سرير)", "end"),
        col("متفائل (سرير)", "end"), col("الانتشار", "end")],
      sm.rows.map((r) => [
        r.label,
        cell(fmt.int(r.conservative), { tone: "neg" }),
        cell(fmt.int(r.base), { tone: "neg" }),
        cell(fmt.int(r.optimistic), { tone: "neg" }),
        fmt.int(r.spread),
      ]),
      scenariosCaveat(rel),
    )];
    p.caveats = [
      scenariosCaveat(rel),
      deltaLast == null ? null
        : "الفارق بين الأساسي في نهاية الأفق والعجز الحالي "
          + fmt.iso((deltaLast >= 0 ? "+" : "−") + fmt.int(Math.abs(deltaLast)))
          + " سرير — اشتقاق حسابي من قيمتين مورّدتين، لا تنبؤ معتمد.",
      "لا استيفاء بين الأشهر ولا امتداد خارج الأشهر المورّدة.",
    ].filter(Boolean);
    return p;
  }

  /* ── 6.9 الخاتمة والتوصيات ───────────────────────────────────────────── */
  function pageClosing(rel, der) {
    const p = blankPage("closing");
    const v = rel.validation || {};
    const ns = rel.next_steps || {};
    p.figures = [
      fig("بوابات التحقق", fmt.int(v.gates_passed || 0) + " / " + fmt.int(v.gates_total || 0),
        null, (v.gates_passed === v.gates_total) ? "pos" : "neg",
        v.checked_at ? "آخر فحص " + fmt.date(v.checked_at) : null),
      fig("مصادر البيانات", fmt.int((rel.sources || []).length), null, "neu",
        (rel.sources || []).map((s) => s.name).join(" · ")),
      fig("المقاييس المنشورة", fmt.int(Object.keys(rel.metrics || {}).length), "مقياس", "neu",
        "خام من ملف البيانات المعتمد"),
      fig("المقاييس المشتقة",
        fmt.int(Object.keys(rel.derived || {}).filter((k) => rel.derived[k].formula).length),
        "مقياس", "neu", "بصيغ معلنة في صفحة الإسناد"),
      fig("الخطوات التالية", fmt.int((ns.items || []).length), null,
        (ns.items || []).length ? "pos" : "neu", statusLabel(ns.status)),
      fig("نسبة التغطية عند الإصدار", fmt.pct(der.coverage_pct), null, "neu",
        rel.meta.data_as_of),
    ];
    const facts = rel.insights || {};
    const factRows = Object.keys(facts).sort().map((k) => [
      k,
      facts[k].text,
      statusLabel(facts[k].status),
    ]);
    p.tables = [
      table(
        "الحقائق المعتمدة في العرض",
        [col("المرجع"), col("الحقيقة"), col("الحالة")],
        factRows,
        "نصوص معتمدة للعرض — كل رقم فيها من مقاييس الإصدار عبر التنسيق المركزي.",
      ),
      table(
        "الخطوات التالية",
        [col("الخطوة"), col("الحالة")],
        (ns.items || []).length
          ? ns.items.map((it) => [String(it.text || it), statusLabel(it.status)])
          : [[cell(ns.note || "لا خطوات معتمدة بعد", { tone: "muted" }),
            statusLabel(ns.status)]],
        ns.note || null,
      ),
    ];
    p.caveats = [
      ns.note || null,
      "هذا الموجز صورة من إصدار منشور غير قابل للتغيير — أي تحديث يصدر بإصدار جديد بهويته وبصمته.",
    ].filter(Boolean);
    return p;
  }

  /* ── 6.10 جداول الملاحق (ورقتان منطقيتان بالمعرف نفسه) ──────────────── */
  function pagesAppendixTables(rel, der) {
    const calc = rel.meta.calculation_date;
    const st = rel.strategy || {};

    const a = blankPage("appendix-tables");
    a.title = "جداول الملاحق — القطاعات وعينة الأحياء";
    a.tables = [
      table(
        "القطاعات الخمسة — الجدول الكامل",
        [col("القطاع"), col("الطلب", "end"), col("الطاقة", "end"),
          col("رخص بناء", "end"), col("رخص تشغيلية", "end"),
          col("المراقبون", "end"), col("الزيارات", "end"),
          col("المخالفات", "end"), col("الإغلاقات", "end")],
        sectorRows(rel, der).map((r) => [
          r.name,
          cell(fmt.int(r.demand), { tone: "demand" }),
          cell(fmt.int(r.beds), { tone: "pos" }),
          fmt.int(r.building), fmt.int(r.operational), fmt.int(r.monitors),
          fmt.int(r.visits),
          cell(fmt.int(r.violations), { tone: "neg" }),
          fmt.int(r.closures),
        ]),
        "كل الأعمدة خام من ملف البيانات المعتمد — لا عمود مشتق في هذا الجدول.",
      ),
      table(
        "عينة الأحياء المدرجة في قاعدة البيانات",
        [col("الحي"), col("القطاع"), col("رخص بناء", "end"),
          col("رخص تشغيلية", "end"), col("الطاقة (سرير)", "end"),
          col("المخالفات", "end")],
        districtRows(rel).map((r) => [
          r.name, r.sectorName, fmt.int(r.building), fmt.int(r.operational),
          cell(fmt.int(r.beds), { tone: "pos" }),
          cell(fmt.int(r.violations), { tone: "neg" }),
        ]),
        sampleCaveat(rel),
      ),
    ];
    a.caveats = [sampleCaveat(rel)].filter(Boolean);

    const b = blankPage("appendix-tables");
    b.title = "جداول الملاحق — المبادرات والمؤشرات";
    const pillarName = {};
    for (const pl of (st.pillars || [])) pillarName[pl.id] = pl.name;
    b.tables = [
      table(
        "محفظة المبادرات الثمانية عشرة",
        [col("#"), col("المبادرة"), col("الركيزة"), col("البداية", "end"),
          col("النهاية", "end"), col("الحالة")],
        (st.initiatives || []).map((i) => {
          const status = initiativeStatus(i, calc);
          const tone = status === "متأخرة" ? "neg"
            : status === "منجزة" ? "pos"
              : status === "جاري العمل" ? "blue" : "muted";
          return [
            i.id, i.name, pillarName[i.pillar_id] || i.pillar_id,
            i.start ? fmt.date(i.start) : "—",
            i.end ? fmt.date(i.end) : "—",
            cell(status, { tone }),
          ];
        }),
        "الحالة المصرّحة إن وُجدت، وإلا محسوبة بقاعدة الإصدار عند " + fmt.date(calc) + ".",
      ),
      table(
        "مؤشرات الأداء الأربعة عشر",
        [col("#", "end"), col("المؤشر"), col("النوع"),
          col("خط الأساس", "end"), col("المستهدف", "end"), col("الحالية", "end")],
        ((st.kpis || []).slice().sort((x, y) => x.id - y.id)).map((k) => [
          fmt.int(k.id), k.name, k.type,
          cell(kpiValue(k, k.baseline), { tone: "gold" }),
          cell(kpiValue(k, k.target), { tone: "gold" }),
          cell(kpiValue(k, k.current), { tone: k.current == null ? "muted" : "pos" }),
        ]),
        kpiCurrentCaveat(rel),
      ),
    ];
    b.caveats = [kpiCurrentCaveat(rel)].concat(strategyCaveats(rel)).filter(Boolean);

    return [a, b];
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) صفحة الإسناد — أصل كل رقم ورقةً ومرساة
     ══════════════════════════════════════════════════════════════════════════ */

  function provenance(rel, der) {
    const metrics = [];
    for (const id of Object.keys(rel.metrics || {})) {
      const m = rel.metrics[id];
      metrics.push({
        id,
        label: m.label,
        value: m.unit === "٪" ? fmt.pct(m.value) : fmt.int(m.value),
        unit: m.unit || "",
        kind: "raw",
        origin: (m.sheet || "?") + "!" + (m.anchor || "?"),
        sourceId: m.source_id || null,
      });
    }
    for (const id of Object.keys(rel.derived || {})) {
      const d = rel.derived[id];
      if (!d || !d.formula) continue;   // sector_derived/rankings: تجميعات لا مقاييس
      metrics.push({
        id,
        label: d.label || id,
        value: d.unit === "٪" ? fmt.pct(d.value) : fmt.int(d.value),
        unit: d.unit || "",
        kind: "derived",
        origin: "مشتق (" + d.formula + ")"
          + (d.formula_version ? " · " + d.formula_version : ""),
        sourceId: null,
      });
    }

    const v = rel.validation || {};
    const total = v.gates_total || 0;
    const passed = v.gates_passed || 0;

    return {
      sources: (rel.sources || []).map((s) => ({
        id: s.id,
        name: s.name,
        kind: s.kind,
        templateVersion: s.template_version || null,
        sha256: s.sha256 || null,
        sha256Short: s.sha256 ? String(s.sha256).slice(0, 12) : null,
        importedAt: s.imported_at || null,
        private: s.private === true,
      })),
      metrics,
      gates: {
        total,
        passed,
        warnings: Math.max(0, total - passed),
        checkedAt: v.checked_at || null,
      },
      decisions: "انظر ملحق المنهجية",
      quarantine: quarantineCaveats(rel),
      resolved: Object.keys(rel.quarantine_resolved || {}).map((k) => ({
        id: k,
        resolution: rel.quarantine_resolved[k].resolution,
        count: rel.quarantine_resolved[k].count != null
          ? rel.quarantine_resolved[k].count : null,
      })),
      release: {
        id: rel.release.id,
        status: rel.release.status,
        publishedAt: rel.release.published_at || null,
        publishedBy: rel.release.published_by || null,
        sha256: rel.release.sha256 || null,
        sha256Short: rel.release.sha256 ? String(rel.release.sha256).slice(0, 12) : null,
        notes: rel.release.notes || "",
        schemaVersion: rel.schema_version,
      },
    };
  }

  /** يحوّل كائن الإسناد إلى صفحة قابلة للترقيم (جداول تُقسَّم كغيرها) */
  function provenanceAsPage(prov, rel) {
    const p = blankPage("provenance");
    p.figures = [
      fig("هوية الإصدار", prov.release.id, null, "neu", statusLabel(prov.release.status)),
      fig("بصمة الإصدار", prov.release.sha256Short || "—", null, "neu", "sha256 — أول 12 محرفاً"),
      fig("بوابات التحقق",
        fmt.int(prov.gates.passed) + " / " + fmt.int(prov.gates.total),
        null, prov.gates.warnings ? "neg" : "pos",
        prov.gates.warnings
          ? fmt.int(prov.gates.warnings) + " لم تجتز"
          : "اجتازت كلها"),
      fig("المقاييس الموثقة", fmt.int(prov.metrics.length), "مقياس", "neu",
        fmt.int(prov.metrics.filter((m) => m.kind === "raw").length) + " خام و"
        + fmt.int(prov.metrics.filter((m) => m.kind === "derived").length) + " مشتق"),
      fig("المصادر", fmt.int(prov.sources.length), null, "neu",
        prov.sources.map((s) => s.name).join(" · ")),
      fig("قرارات المنهجية", prov.decisions, null, "neu",
        "الملحق يوثق كل قرار بأثره على الأرقام"),
    ];
    p.tables = [
      table(
        "مصادر البيانات وبصماتها",
        [col("المصدر"), col("النوع"), col("إصدار القالب"), col("البصمة (12)"),
          col("الاستيراد")],
        prov.sources.map((s) => [
          s.name, s.kind, s.templateVersion || "—",
          cell(s.sha256Short || "—", { mono: true }),
          s.importedAt ? fmt.date(String(s.importedAt).slice(0, 10)) : "—",
        ]),
        "الملف المصدر خاص ولا يُنشر مع الموجز — البصمة تكفي لإثبات التطابق.",
      ),
      table(
        "أصل كل مقياس منشور",
        [col("المقياس"), col("القيمة", "end"), col("الوحدة"), col("الأصل")],
        prov.metrics.map((m) => [
          m.label,
          cell(m.value, { tone: m.kind === "derived" ? "neu" : "pos" }),
          m.unit || "—",
          cell(m.origin, { mono: m.kind === "raw" }),
        ]),
        "الخام يشير إلى ورقة ومرساة في ملف البيانات؛ والمشتق يعرض صيغته كاملة.",
      ),
    ];
    p.caveats = [
      complianceCaveat(rel),
      scenariosCaveat(rel),
      sampleCaveat(rel),
      coverageTargetCaveat(rel),
    ].concat(prov.quarantine)
      .concat(prov.resolved.map((r) => r.resolution))
      .filter(Boolean);
    return p;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) النموذج الكامل
     ══════════════════════════════════════════════════════════════════════════ */

  /** بناة الصفحات مفهرسة بالمعرف — تعيد صفحة أو مصفوفة صفحات */
  const BUILDERS = {
    summary: (rel, der) => pageSummary(rel, der),
    demand: (rel, der) => pageDemand(rel, der),
    licensing: (rel, der) => pageLicensing(rel, der),
    control: (rel, der) => pageControl(rel, der),
    map: (rel, der, geo) => pageMap(rel, der, geo),
    initiatives: (rel, der) => pageInitiatives(rel, der),
    kpis: (rel) => pageKpis(rel),
    forecast: (rel, der) => pageForecast(rel, der),
    closing: (rel, der) => pageClosing(rel, der),
    "appendix-tables": (rel, der) => pagesAppendixTables(rel, der),
  };

  /**
   * النموذج الكامل للموجز.
   * @param {Object} release  كائن الإصدار المنشور
   * @param {Object} derived  مخرجات RH.data.derive.compute (المسطّحة)
   * @param {Object} [opts]   { pages, geo, now }
   *   pages : حصر صفحات الأقسام (الغلاف والإسناد يبقيان)
   *   geo   : طبقة الجغرافيا (اختيارية — غيابها يظهر بصدق لا بقيمة مختلقة)
   *   now   : لحظة التوليد (Date أو ISO) — تُمرَّر صراحةً في الاختبار للحتمية
   */
  function model(release, derived, opts) {
    if (!release) throw new Error("نموذج الموجز يحتاج كائن إصدار");
    const o = opts || {};
    const der = derived || {};
    const selected = normalizePages(o.pages);
    const geo = o.geo || null;

    const now = o.now
      ? (o.now instanceof Date ? o.now : new Date(o.now))
      : new Date();
    const generatedAt = isNaN(now.getTime()) ? null : now.toISOString();

    const pages = [];
    for (const id of selected) {
      const build = BUILDERS[id];
      if (!build) continue;
      const made = build(release, der, geo);
      if (Array.isArray(made)) { for (const m of made) pages.push(m); }
      else if (made) pages.push(made);
    }

    const prov = provenance(release, der);

    return {
      cover: {
        title: release.meta.title,
        entity: release.meta.entity || null,
        releaseId: release.release.id,
        dataAsOf: release.meta.data_as_of,
        generatedAt,
        generatedAtLabel: generatedAt ? fmt.date(generatedAt.slice(0, 10)) : "—",
        sha256Short: release.release.sha256
          ? String(release.release.sha256).slice(0, 12) : null,
        sha256: release.release.sha256 || null,
        monitoringPeriod: release.meta.monitoring_period_label,
        baselineLabel: release.meta.baseline_label,
        presentationDate: release.meta.presentation_date || null,
        presentationDateNeedsConfirmation:
          release.meta.presentation_date_needs_confirmation === true,
        calculationDate: release.meta.calculation_date || null,
        status: release.release.status,
        statusLabel: statusLabel(release.release.status),
        selectedPages: selected.slice(),
        restricted: selected.length < SECTION_PAGE_IDS.length,
      },
      pages,
      provenance: prov,
      provenancePage: provenanceAsPage(prov, release),
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) محرك الترقيم — هندسة الورقة بالمليمتر
     ──────────────────────────────────────────────────────────────────────────
     A4‏ 210×297مم، هوامش 12مم ⇒ صندوق محتوى 186×273مم. الأرقام أدناه مقاسات
     الكتل كما تخرج من report.css (قيست على أطول محتوى واقعي في هذا الإصدار:
     أسماء المبادرات المكونة من سطرين، وأسماء المؤشرات الطويلة). كل قيمة
     محافظة قليلاً (تقدير أعلى) — تجاوز التقدير يُنتج ورقة أنظف، أما التقدير
     الأدنى فينتج قصاً عند الطباعة وهو الفشل الوحيد غير المقبول هنا.
     ══════════════════════════════════════════════════════════════════════════ */

  const SHEET = Object.freeze({
    widthMm: 210,
    heightMm: 297,
    marginMm: 12,
    contentWidthMm: 186,
    contentHeightMm: 273,
    /* التذييل محجوز أسفل كل ورقة: هوية الإصدار + التاريخ + ترقيم */
    footerMm: 11,
    /* ترويسة أول ورقة من الصفحة مقابل ورقة الاستكمال */
    headFirstMm: 23,
    headContMm: 15,
    /* حارس التقريب الطباعي: ارتفاع الورقة في report.css‏ 272مم لا 273 لأن
       ارتفاعاً مساوياً للمساحة القابلة للطباعة تماماً يتجاوزها بجزء من
       البكسل فيولّد ورقة بيضاء بعد كل ورقة. المليمتر نفسه يُطرح هنا كي
       يبقى الحساب مطابقاً للورق لا للنظرية. */
    printGuardMm: 1,
  });

  const BLOCK = Object.freeze({
    figureRowMm: 23,        // صف بطاقات أرقام
    figureCols: 3,
    chartStandardMm: 51.9,  // 196.2 بكسل ÷ 3.7795
    chartWideMm: 48.1,      // 181.8 بكسل
    chartTallMm: 73.8,      // 278.8 بكسل
    figcaptionMm: 7,
    figcaveatMm: 7.5,
    insightsTitleMm: 8,
    insightMm: 16,
    caveatMm: 10,
    tableTitleMm: 8.5,
    tableHeadMm: 8,
    tableRowMm: 6.4,
    tableNoteMm: 7,
    gapMm: 5,
    /* أقل عدد صفوف يستحق فتح جدول على ورقة — أقل من ذلك يُدفع كاملاً */
    minTableRows: 4,
    /* منع الذيل اليتيم: قطعةٌ تالية أقصر من هذا تُوازَن بسحب صفوف من سابقتها
       — صفٌّ وحيد تحت ترويسة مكررة على ورقة كاملة قراءةٌ رديئة لا اقتصاد. */
    orphanMinRows: 3,
  });

  const usableFirstMm = () =>
    SHEET.contentHeightMm - SHEET.headFirstMm - SHEET.footerMm - SHEET.printGuardMm;
  const usableContMm = () =>
    SHEET.contentHeightMm - SHEET.headContMm - SHEET.footerMm - SHEET.printGuardMm;

  /** ارتفاع إطار رسم بحسب مقاسه المعلن */
  function chartFrameMm(sizeName) {
    if (sizeName === "wide") return BLOCK.chartWideMm;
    if (sizeName === "tall") return BLOCK.chartTallMm;
    return BLOCK.chartStandardMm;
  }

  /** مقاس مواصفة رسم — يتفق مع `RH.report.charts.sizeNameOf` عند توفره،
      وله جدول احتياطي مطابق كي يعمل المحرك في بيئة اختبار نقية. */
  const FALLBACK_SIZE = Object.freeze({
    coverageEvolution: "wide", sectorSupplyDemand: "wide",
    occupancyComposition: "wide", cumulativeLicenses: "wide",
    monthlyNetIssuance: "wide", forecastScenarios: "wide",
    pillarCards: "wide", kpiMatrix: "wide",
    monthlyActivityDual: "tall", initiativeGantt: "tall", kpiBullets: "tall",
  });
  function chartSizeName(spec) {
    if (spec && spec.opts && spec.opts.size) return spec.opts.size;
    if (RH.report.charts && typeof RH.report.charts.sizeNameOf === "function") {
      return RH.report.charts.sizeNameOf(spec && spec.builder, spec && spec.opts);
    }
    return FALLBACK_SIZE[spec && spec.builder] || "standard";
  }

  /**
   * يوزع مواصفات الرسوم على صفوف: الممتد والطويل يشغلان الصف وحدهما،
   * والقياسي يقترن بقياسيٍّ آخر في صف من عمودين (عرض A4 يتسع لعمودين فقط).
   */
  function chartRows(charts) {
    const rows = [];
    let pending = null;
    for (const spec of charts || []) {
      const size = chartSizeName(spec);
      if (size === "standard") {
        if (pending) { rows.push([pending, spec]); pending = null; }
        else pending = spec;
      } else {
        if (pending) { rows.push([pending]); pending = null; }
        rows.push([spec]);
      }
    }
    if (pending) rows.push([pending]);
    return rows;
  }

  /** ارتفاع صف رسوم بالمليمتر: أطول إطار + تسمية + وسم إن وُجد + فاصل */
  function chartRowMm(row) {
    let tallest = 0;
    let caption = 0;
    let caveat = 0;
    for (const spec of row) {
      tallest = Math.max(tallest, chartFrameMm(chartSizeName(spec)));
      if (spec.caption) caption = BLOCK.figcaptionMm;
      if (spec.caveat) caveat = BLOCK.figcaveatMm;
    }
    return tallest + caption + caveat + BLOCK.gapMm;
  }

  /** ارتفاع كتلة الأرقام البارزة */
  function figuresMm(count) {
    if (!count) return 0;
    const rows = Math.ceil(count / BLOCK.figureCols);
    return rows * BLOCK.figureRowMm + BLOCK.gapMm;
  }

  /** ارتفاع جدول كامل (بكل صفوفه) */
  function tableMm(t) {
    const rows = (t && t.rows) ? t.rows.length : 0;
    return BLOCK.tableTitleMm + BLOCK.tableHeadMm + rows * BLOCK.tableRowMm
      + (t && t.note ? BLOCK.tableNoteMm : 0) + BLOCK.gapMm;
  }

  /** عدد الصفوف التي تتسع في مساحة متاحة، مع ترويسة الجدول وعنوانه */
  function rowsFitting(availableMm, withTitle, withNote) {
    const overhead = (withTitle ? BLOCK.tableTitleMm : 0) + BLOCK.tableHeadMm
      + (withNote ? BLOCK.tableNoteMm : 0) + BLOCK.gapMm;
    const room = availableMm - overhead;
    if (room <= 0) return 0;
    return Math.max(0, Math.floor(room / BLOCK.tableRowMm));
  }

  /**
   * يقسّم جدولاً على مساحات متتابعة.
   * @param {Object} t          الجدول {title, columns, rows, note}
   * @param {Array}  capacities مساحات متاحة بالمليمتر لكل ورقة بالترتيب
   * @returns {Array} قطع الجدول: {title, columns, rows, note, part, parts,
   *                  continued, startIndex, endIndex}
   * ملاحظة العقد: الملاحظة (وسم الصدق) تُكرَّر على **كل** قطعة — وسم العينة
   * لا يجوز أن يبقى في الورقة الأولى بينما تُقرأ بقية الصفوف مجرّدة منه.
   */
  function splitTable(t, capacities) {
    const rows = (t && t.rows) || [];
    const chunks = [];
    let i = 0;
    let sheet = 0;
    let guard = 0;
    while (i < rows.length) {
      if (guard++ > 500) break;              // حارس حلقة: لا مستند بلا نهاية
      const cap = capacities[Math.min(sheet, capacities.length - 1)];
      let n = rowsFitting(cap, true, !!t.note);
      if (n <= 0) { sheet += 1; continue; }
      /* موازنة الذيل اليتيم: إن بقي بعد هذه القطعة أقل من الحد، نسحب من
         الحالية بقدر ما يبلّغ الذيلَ حده — ما دامت الحالية تبقى فوق حدها. */
      const remainder = rows.length - (i + n);
      if (remainder > 0 && remainder < BLOCK.orphanMinRows) {
        const shift = BLOCK.orphanMinRows - remainder;
        if (n - shift >= BLOCK.minTableRows) n -= shift;
      }
      const take = rows.slice(i, i + n);
      chunks.push({
        title: t.title,
        columns: t.columns,
        rows: take,
        note: t.note,
        startIndex: i,
        endIndex: i + take.length - 1,
        continued: i > 0,
      });
      i += take.length;
      sheet += 1;
    }
    if (!chunks.length) {
      chunks.push({
        title: t.title, columns: t.columns, rows: [], note: t.note,
        startIndex: 0, endIndex: -1, continued: false,
      });
    }
    const parts = chunks.length;
    chunks.forEach((c, idx) => { c.part = idx + 1; c.parts = parts; });
    return chunks;
  }

  /** ورقة فارغة */
  function newSheet(page, continued) {
    return {
      pageId: page.id,
      kind: page.id === "provenance" ? "provenance" : "section",
      title: page.title,
      kicker: page.kicker,
      continued: !!continued,
      figures: [],
      chartRows: [],
      insights: [],
      caveats: [],
      tables: [],
    };
  }

  /**
   * يوزع صفحة منطقية على أوراق A4.
   * الترتيب داخل الصفحة ثابت: أرقام ← رسوم ← رؤى ← وسوم ← جداول.
   * الجداول آخراً عمداً: هي وحدها القابلة للتقسيم، فتُترك للفائض.
   */
  function flowPage(page) {
    const sheets = [];
    let cur = newSheet(page, false);
    let left = usableFirstMm();
    let used = false;

    function commit() {
      sheets.push(cur);
      cur = newSheet(page, true);
      left = usableContMm();
      used = false;
    }
    /** يفتح ورقة جديدة إن لم تتسع الكتلة وكانت الورقة الحالية مشغولة */
    function ensure(need) {
      if (need <= left) return;
      if (used) commit();
    }

    // (1) الأرقام البارزة — أول ورقة دائماً (لا معنى لتذييل أرقام بعد جدول)
    if (page.figures && page.figures.length) {
      const need = figuresMm(page.figures.length);
      cur.figures = page.figures.slice();
      left -= need;
      used = true;
    }

    // (2) الرسوم — صفاً صفاً، والصف لا يُقص أبداً بين ورقتين
    for (const row of chartRows(page.charts)) {
      const need = chartRowMm(row);
      ensure(need);
      cur.chartRows.push(row);
      left -= need;
      used = true;
    }

    // (3) الرؤى — عنوان الكتلة يُعاد على كل ورقة تحمل بنداً منها، فالحساب
    //     يقيس حالة **الورقة الحالية** لا حالة الصفحة (وإلا نقص التقدير
    //     بمقدار العنوان على كل ورقة استكمال وفاض المحتوى عن حد القص).
    for (const ins of page.insights || []) {
      const needTitle = cur.insights.length ? 0 : BLOCK.insightsTitleMm;
      ensure(BLOCK.insightMm + needTitle);
      if (!cur.insights.length) left -= BLOCK.insightsTitleMm;
      cur.insights.push(ins);
      left -= BLOCK.insightMm;
      used = true;
    }

    // (4) وسوم الصدق — بنداً بنداً، فلا يُدفع وسم كامل إلى ورقة تالية بلا داع
    for (const cv of page.caveats || []) {
      ensure(BLOCK.caveatMm);
      cur.caveats.push(cv);
      left -= BLOCK.caveatMm;
      used = true;
    }

    // (5) الجداول — تُقسَّم عبر الأوراق عند الطول
    for (const t of page.tables || []) {
      const whole = tableMm(t);
      if (whole <= left) {
        cur.tables.push(Object.assign({}, t, {
          part: 1, parts: 1, continued: false,
          startIndex: 0, endIndex: ((t.rows || []).length - 1),
        }));
        left -= whole;
        used = true;
        continue;
      }
      // لا يتسع كاملاً: هل تكفي المساحة الحالية لفتحه بأقل عدد صفوف مقبول؟
      const canOpen = rowsFitting(left, true, !!t.note) >= BLOCK.minTableRows;
      if (!canOpen && used) commit();

      // مساحات متتابعة: الحالية (إن فُتح فيها) ثم أوراق استكمال كاملة
      const caps = [used ? left : usableContMm()];
      for (let k = 0; k < 40; k++) caps.push(usableContMm());
      const chunks = splitTable(t, caps);

      chunks.forEach((chunk, idx) => {
        if (idx > 0) commit();
        cur.tables.push(chunk);
        left -= BLOCK.tableTitleMm + BLOCK.tableHeadMm
          + chunk.rows.length * BLOCK.tableRowMm
          + (chunk.note ? BLOCK.tableNoteMm : 0) + BLOCK.gapMm;
        used = true;
      });
    }

    sheets.push(cur);

    const parts = sheets.length;
    sheets.forEach((s, i) => { s.part = i + 1; s.parts = parts; });
    return sheets;
  }

  /**
   * الخطة الكاملة: أوراق مرقّمة من الغلاف إلى الإسناد + فهرس المحتويات.
   * @returns {{sheets:Array, total:Number, contents:Array}}
   */
  function plan(m, opts) {
    const o = opts || {};
    const sheets = [];

    if (o.cover !== false) {
      sheets.push({
        pageId: "cover",
        kind: "cover",
        title: PAGE_META.cover.title,
        kicker: PAGE_META.cover.kicker,
        continued: false,
        part: 1, parts: 1,
        figures: [], chartRows: [], insights: [], caveats: [], tables: [],
      });
    }

    for (const page of m.pages || []) {
      for (const s of flowPage(page)) sheets.push(s);
    }

    if (m.provenancePage) {
      for (const s of flowPage(m.provenancePage)) sheets.push(s);
    }

    sheets.forEach((s, i) => { s.n = i + 1; s.of = sheets.length; });

    /* فهرس المحتويات: أول ورقة لكل صفحة منطقية، بعنوانها ورقمها */
    const contents = [];
    const seen = Object.create(null);
    for (const s of sheets) {
      if (s.kind === "cover") continue;
      const key = s.pageId + "|" + s.title;
      if (seen[key]) continue;
      if (s.continued) continue;
      seen[key] = true;
      contents.push({ pageId: s.pageId, title: s.title, kicker: s.kicker, sheet: s.n });
    }

    return { sheets, total: sheets.length, contents };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) الواجهة العامة
     ══════════════════════════════════════════════════════════════════════════ */

  return {
    // العقد الأساسي (§3.1)
    PAGE_IDS,
    model,
    // القوائم والتعريفات
    MANDATORY_PAGE_IDS,
    SECTION_PAGE_IDS,
    PAGE_META,
    INSIGHT_KEY,
    titleFor,
    kickerFor,
    // اختيار الصفحات
    normalizePages,
    rejectedPages,
    serializePages,
    isRestricted,
    // وسوم الصدق
    STATUS_LABEL,
    statusLabel,
    complianceCaveat,
    scenariosCaveat,
    sampleCaveat,
    mapCaveats,
    coverageTargetCaveat,
    comparisonCaveat,
    kpiCurrentCaveat,
    strategyCaveats,
    quarantineCaveats,
    BOUNDARY_ATTRIB,
    KPI_MISSING,
    // اشتقاقات نقية
    initiativeStatus,
    statusCounts,
    coverageSeries,
    kpiValue,
    kpiSummary,
    sectorRows,
    districtRows,
    scenarioModel,
    monitoringSeries,
    licensingSeries,
    geoCounts,
    provenance,
    // محرك الترقيم
    SHEET,
    BLOCK,
    usableFirstMm,
    usableContMm,
    chartFrameMm,
    chartSizeName,
    chartRows,
    chartRowMm,
    figuresMm,
    tableMm,
    rowsFitting,
    splitTable,
    flowPage,
    plan,
  };
})();
