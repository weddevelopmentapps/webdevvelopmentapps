/* ════════════════════════════════════════════════════════════════════════════
   report-builder.js — منشئ الموجز التنفيذي في الإدارة (عقد التوسعة §11.1)
   بادئة الأنماط: adf-  ·  الفضاء: RH.admin.reportBuilder
   يُضم بعد admin/publish.js وقبل admin/diff-viewer.js — ويقرأ `RH.report.pages`
   المضموم قبله في السلسلة (build.py §1). لا يعتمد على شيء يأتي بعده.
   ────────────────────────────────────────────────────────────────────────────
   ما هذا التبويب؟

   وضع `#/report` يطبع المستند كاملاً أو محصوراً بـ`?pages=`. هذا التبويب هو
   المكان الذي **يُبنى فيه ذلك الحصر بوعي**: يختار المسؤول الصفحات، فيرى فوراً
   — قبل الطباعة — ماذا سيحمل كل اختيار من أرقام ورسوم وجداول ورؤى **ووسوم
   صدق**، وكم ورقة A4 سيشغل، وما الذي فقده الموجز بإسقاط صفحة.

   ثلاث قواعد تحكم التصميم:

   (1) **المعاينة بالنموذج لا بالمستند.** نستدعي `RH.report.pages.model()` و
       `plan()` — الدالتين النقيتين ذاتيهما اللتين يبني بهما وضع `#/report`
       أوراقه — ونعرض حصيلتهما. فلا نسخة ثانية من منطق الصفحات هنا، ولا رسم
       ECharts داخل الإدارة (الرسم وظيفة وضع الموجز نفسه).

   (2) **إسقاط صفحة قرار له ثمن معلَن.** كل صفحة تحمل وسوم صدق وأرقاماً؛
       إسقاطها يسقطها معها. لذلك تعرض البطاقة السفلية «ما الذي يفقده هذا
       الاختيار» صراحةً: الوسوم الغائبة والأرقام والجداول التي لن تُطبع.

   (3) **الصفحتان الإلزاميتان لا تُناقَشان.** الغلاف يحمل هوية الإصدار وتاريخ
       البيانات، وصفحة الإسناد تحمل مصدر كل رقم وعدّاد البوابات. موجز بلا
       هاتين ورقة مجهولة النسب — فمربّعاهما معطّلان ومعلَّمان «إلزامي»،
       تماماً كما يفرض `RH.report.pages.MANDATORY_PAGE_IDS`.

   المنطق النقي (`summarizePage`، `presetFor`، `matchPreset`، `reportHref`،
   `missingFrom`) مُصدَّر على الفضاء ومختبر في `tests/unit/diff-model.test.mjs`.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

RH.admin.reportBuilder = (function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* ══════════════════════════════════════════════════════════════════════════
     1) الثوابت
     ══════════════════════════════════════════════════════════════════════════ */

  /** مفتاح حفظ الاختيار (العقد §11.1) */
  const STORAGE_KEY = "rh.report.pages";

  /** مفتاح سجل الاختيارات الأخيرة على هذا الجهاز — راحة لا بيانات */
  const HISTORY_KEY = "rh.report.recent";
  const HISTORY_MAX = 8;

  /**
   * قائمة احتياطية للصفحات — تُستعمل حين يغيب `RH.report` من البناء (بناء
   * جزئي)، كي يبقى الاختيار المحفوظ مقروءاً ومعروضاً بدل اختفائه.
   * ليست مصدر حقيقة: متى وُجد `RH.report.pages` فهو المرجع الوحيد.
   */
  const FALLBACK_PAGE_IDS = Object.freeze([
    "cover", "summary", "demand", "licensing", "control", "map",
    "initiatives", "kpis", "forecast", "closing", "appendix-tables", "provenance",
  ]);
  const FALLBACK_MANDATORY = Object.freeze(["cover", "provenance"]);

  /** وصف مختصر لكل صفحة — ماذا يجد القارئ فيها فعلاً */
  const PAGE_HINT = Object.freeze({
    "cover": "هوية الإصدار وتاريخ البيانات وبصمة التحقق — لا تُسقط",
    "summary": "الأرقام الستة الكبرى وقراءتها التنفيذية الأولى",
    "demand": "الطلب مقابل الطاقة المرخصة، والتغطية قطاعياً",
    "licensing": "مسار الترخيص التراكمي والإصدار الشهري وأنواع الإيواء",
    "control": "الزيارات والمخالفات والإغلاقات ونسبة الامتثال بمنهجيتها",
    "map": "التوزيع الجغرافي على القطاعات مع تنويه الخريطة وإسناد الحدود",
    "initiatives": "الركائز الأربع ومحفظة المبادرات وحالاتها المشتقة",
    "kpis": "مؤشرات الأداء بخط أساسها ومستهدفها، والقيم الحالية الغائبة معلَنة",
    "forecast": "سيناريوهات العجز الثلاثة مع تنويهها المورّد",
    "closing": "الحقائق المتحقق منها والتوصيات والأفق الزمني",
    "appendix-tables": "جداول القطاعات وعينة الأحياء والمؤشرات والمبادرات",
    "provenance": "مصدر كل رقم ورقةً ومرساة، وعدّاد البوابات — لا تُسقط",
  });

  /**
   * التوليفات الجاهزة.
   * ليست «قوالب محتوى» بل اختصارات اختيار: كل واحدة قائمة معرفات من القائمة
   * القانونية نفسها، والمستند الناتج يمر بالنموذج ذاته. سُمّيت بحسب الاجتماع
   * الذي تُطبع له عادةً، ووصفها يقول صراحةً ما الذي تتركه خارجاً.
   */
  const PRESETS = Object.freeze([
    {
      id: "full",
      name: "الموجز الكامل",
      desc: "كل صفحات الأقسام العشر — المستند المرجعي الكامل",
      pages: null,   // null = كل الصفحات
    },
    {
      id: "board",
      name: "حزمة المجلس",
      desc: "الملخص والتوقعات والخاتمة — أربع دقائق قراءة قبل الاجتماع؛ "
        + "تترك التفاصيل التشغيلية والجداول للملاحق",
      pages: ["summary", "forecast", "closing"],
    },
    {
      id: "ops",
      name: "الحزمة التشغيلية",
      desc: "التراخيص والرقابة والخريطة — لمن ينفّذ لا لمن يعتمد",
      pages: ["licensing", "control", "map"],
    },
    {
      id: "strategy",
      name: "حزمة الاستراتيجية",
      desc: "المبادرات ومؤشرات الأداء — متابعة خطة العمل وحدها",
      pages: ["initiatives", "kpis"],
    },
    {
      id: "market",
      name: "حزمة العرض والطلب",
      desc: "قراءة السوق: العرض والطلب مع سيناريوهات العجز",
      pages: ["demand", "forecast"],
    },
    {
      id: "evidence",
      name: "حزمة الإسناد",
      desc: "الملخص وجداول الملاحق — الأرقام التفصيلية بلا سرد",
      pages: ["summary", "appendix-tables"],
    },
  ]);

  /* ══════════════════════════════════════════════════════════════════════════
     2) الجسر إلى وحدة الموجز (مع تدهور رشيق حين تغيب)
     ══════════════════════════════════════════════════════════════════════════ */

  /** هل وحدة الموجز مضمّنة في هذا البناء؟ */
  function reportAvailable() {
    return !!(typeof RH.report !== "undefined" && RH.report
      && RH.report.pages && typeof RH.report.pages.model === "function");
  }

  /** القائمة القانونية الكاملة (من الوحدة إن وُجدت) */
  function allPageIds() {
    if (reportAvailable() && Array.isArray(RH.report.pages.PAGE_IDS)) {
      return RH.report.pages.PAGE_IDS.slice();
    }
    return FALLBACK_PAGE_IDS.slice();
  }

  /** الصفحتان الإلزاميتان */
  function mandatoryIds() {
    if (reportAvailable() && Array.isArray(RH.report.pages.MANDATORY_PAGE_IDS)) {
      return RH.report.pages.MANDATORY_PAGE_IDS.slice();
    }
    return FALLBACK_MANDATORY.slice();
  }

  /** صفحات الأقسام القابلة للحصر */
  function sectionIds() {
    if (reportAvailable() && Array.isArray(RH.report.pages.SECTION_PAGE_IDS)) {
      return RH.report.pages.SECTION_PAGE_IDS.slice();
    }
    const mand = mandatoryIds();
    return FALLBACK_PAGE_IDS.filter((id) => mand.indexOf(id) === -1);
  }

  /** عنوان الصفحة (من الوحدة، ومنها يقرأ سجل الأقسام الحي إن توفر) */
  function titleOf(id) {
    if (reportAvailable() && typeof RH.report.pages.titleFor === "function") {
      return RH.report.pages.titleFor(id);
    }
    return id;
  }

  function kickerOf(id) {
    if (reportAvailable() && typeof RH.report.pages.kickerFor === "function") {
      return RH.report.pages.kickerFor(id);
    }
    return "";
  }

  /**
   * تطبيع اختيار إلى قائمة صفحات أقسام صالحة بالترتيب القانوني.
   * يُفوَّض إلى `RH.report.pages.normalizePages` — هو صاحب القاعدة (اختيار
   * فارغ = كل الصفحات، والمجهول يُسقط بصمت). البديل هنا يطابقها حرفياً كي لا
   * يختلف سلوك الإدارة عن سلوك العنوان في بناء جزئي.
   */
  function normalize(ids) {
    if (reportAvailable() && typeof RH.report.pages.normalizePages === "function") {
      return RH.report.pages.normalizePages(ids);
    }
    const legal = sectionIds();
    if (ids == null) return legal;
    let list = ids;
    if (typeof list === "string") list = list.split(",");
    if (!Array.isArray(list)) return legal;
    const want = Object.create(null);
    for (const raw of list) {
      if (raw == null) continue;
      const id = String(raw).trim();
      if (id && legal.indexOf(id) !== -1) want[id] = true;
    }
    const out = legal.filter((id) => want[id]);
    return out.length ? out : legal;
  }

  /** نص معامل ‎?pages= أو "" حين الاختيار كامل */
  function serialize(ids) {
    if (reportAvailable() && typeof RH.report.pages.serializePages === "function") {
      return RH.report.pages.serializePages(ids);
    }
    const norm = normalize(ids);
    return norm.length === sectionIds().length ? "" : norm.join(",");
  }

  /** هل الاختيار محصور فعلاً؟ */
  function isRestricted(ids) {
    return normalize(ids).length < sectionIds().length;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) الاختيار: التخزين والاسترجاع
     ══════════════════════════════════════════════════════════════════════════ */

  /** الاختيار الحي في الجلسة (مصدر الحقيقة لواجهة هذا التبويب) */
  let selected = null;

  /** قراءة الاختيار المحفوظ — العقد: داخل try/catch دائماً */
  function loadSelection() {
    try {
      if (typeof localStorage === "undefined") return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return normalize(parsed);
    } catch (_e) {
      return null;   // مخزن محظور أو محتوى تالف — نبدأ بالاختيار الكامل
    }
  }

  /** حفظ الاختيار */
  function saveSelection(ids) {
    try {
      if (typeof localStorage === "undefined") return false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(ids)));
      return true;
    } catch (_e) {
      return false;  // مخزن ممتلئ — الاختيار يبقى حياً في الجلسة
    }
  }

  /** سجل الاختيارات الأخيرة على هذا الجهاز */
  function loadHistory() {
    try {
      if (typeof localStorage === "undefined") return [];
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((r) => r && Array.isArray(r.pages))
        .slice(0, HISTORY_MAX);
    } catch (_e) {
      return [];
    }
  }

  function pushHistory(ids) {
    try {
      if (typeof localStorage === "undefined") return;
      const norm = normalize(ids);
      const key = norm.join(",");
      const prev = loadHistory().filter((r) => r.pages.join(",") !== key);
      prev.unshift({ pages: norm, at: new Date().toISOString() });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(prev.slice(0, HISTORY_MAX)));
    } catch (_e) { /* راحة لا وظيفة */ }
  }

  /**
   * العقد §11.1: الاختيار الحالي المرتب.
   * يعمل حتى قبل أول رسم (يقرأ المحفوظ)، فيصلح مصدراً لأي مستدعٍ آخر.
   */
  function selection() {
    if (selected) return selected.slice();
    const stored = loadSelection();
    return (stored || normalize(null)).slice();
  }

  /** ضبط الاختيار برمجياً (يُطبَّع دائماً) */
  function setSelection(ids) {
    selected = normalize(ids);
    saveSelection(selected);
    return selected.slice();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) التوليفات
     ══════════════════════════════════════════════════════════════════════════ */

  function presetFor(id) {
    for (const p of PRESETS) if (p.id === id) return p;
    return null;
  }

  /** صفحات التوليفة مطبَّعة (null فيها = الكل) */
  function presetPages(preset) {
    if (!preset) return normalize(null);
    return normalize(preset.pages == null ? null : preset.pages);
  }

  /** أي توليفة تطابق هذا الاختيار؟ (معرّفها أو null) */
  function matchPreset(ids) {
    const key = normalize(ids).join(",");
    for (const p of PRESETS) {
      if (presetPages(p).join(",") === key) return p.id;
    }
    return null;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) تلخيص النموذج — ما الذي يحمله كل اختيار فعلاً
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * ملخص صفحة واحدة من نموذج الموجز.
   * يعدّ ما يُطبع فعلاً: الأرقام البارزة، الرسوم، الجداول وصفوفها، الرؤى،
   * ووسوم الصدق. **الوسوم تُعدّ وتُسرد** لأنها هي ما لا يجوز أن يضيع بحصر.
   * @param {Object} page صفحة من `model.pages`
   */
  function summarizePage(page) {
    const p = page || {};
    const tables = Array.isArray(p.tables) ? p.tables : [];
    let rows = 0;
    for (const t of tables) rows += ((t && t.rows) || []).length;
    const charts = Array.isArray(p.charts) ? p.charts : [];
    let chartCaveats = 0;
    for (const c of charts) if (c && c.caveat) chartCaveats += 1;
    const caveats = Array.isArray(p.caveats) ? p.caveats.slice() : [];
    return {
      id: p.id || "",
      title: p.title || "",
      kicker: p.kicker || "",
      figures: Array.isArray(p.figures) ? p.figures.length : 0,
      charts: charts.length,
      chartCaveats,
      tables: tables.length,
      tableRows: rows,
      insights: Array.isArray(p.insights) ? p.insights.length : 0,
      caveats: caveats.length,
      caveatTexts: caveats,
      /* كثافة الصفحة: مجموع الكتل المطبوعة — يُستعمل لشريط التركيبة المحايد */
      blocks: (Array.isArray(p.figures) ? p.figures.length : 0)
        + charts.length + tables.length
        + (Array.isArray(p.insights) ? p.insights.length : 0),
    };
  }

  /**
   * يدمج ملخصات الصفحات التي تتشارك المعرّف.
   * سببه واقعي: `appendix-tables` تُخرج **صفحتين منطقيتين** من النموذج (جداول
   * القطاعات والأحياء ثم المؤشرات والمبادرات) لأن المحتوى أطول من ورقة. لكن
   * المستخدم يختار «جداول الملاحق» مرة واحدة، فوجب أن يرى بطاقة معاينة واحدة
   * بعدّادات مجموعة — وإلا بدا أن اختياراً واحداً يُسقط «صفحتين».
   * الوسوم تُدمج **بلا تكرار**: الوسم نفسه على جزأي الصفحة وسم واحد.
   */
  function aggregateById(list) {
    const order = [];
    const map = Object.create(null);
    for (const s of list || []) {
      let row = map[s.id];
      if (!row) {
        row = map[s.id] = {
          id: s.id, title: s.title, kicker: s.kicker,
          figures: 0, charts: 0, chartCaveats: 0, tables: 0, tableRows: 0,
          insights: 0, caveats: 0, caveatTexts: [], blocks: 0,
          parts: 0, sheets: 0,
        };
        order.push(s.id);
      }
      row.figures += s.figures;
      row.charts += s.charts;
      row.chartCaveats += s.chartCaveats;
      row.tables += s.tables;
      row.tableRows += s.tableRows;
      row.insights += s.insights;
      row.blocks += s.blocks;
      row.parts += 1;
      row.sheets += (s.sheets || 0);
      for (const t of s.caveatTexts || []) {
        if (row.caveatTexts.indexOf(t) === -1) row.caveatTexts.push(t);
      }
      row.caveats = row.caveatTexts.length;
    }
    return order.map((id) => map[id]);
  }

  /** ملخص النموذج كله + إجمالياته */
  function summarizeModel(model) {
    const m = model || {};
    const pages = Array.isArray(m.pages) ? m.pages : [];
    const list = pages.map(summarizePage);
    const totals = {
      pages: list.length,
      figures: 0, charts: 0, tables: 0, tableRows: 0,
      insights: 0, caveats: 0,
    };
    for (const s of list) {
      totals.figures += s.figures;
      totals.charts += s.charts;
      totals.tables += s.tables;
      totals.tableRows += s.tableRows;
      totals.insights += s.insights;
      totals.caveats += s.caveats;
    }
    return { pages: list, totals };
  }

  /**
   * ما الذي يفقده اختيار محصور؟
   * يقارن ملخص الاختيار الكامل بملخص الاختيار الحالي، فيُخرج الصفحات المسقطة
   * وما تحمله من أرقام وجداول **ووسوم صدق** — لأن إسقاط صفحة الرقابة يسقط
   * معه وسم منهجية الامتثال، وإسقاط صفحة التوقعات يسقط تنويه السيناريوهات.
   * @param {Object} fullModel  نموذج الاختيار الكامل
   * @param {Array}  ids        الاختيار الحالي
   */
  function missingFrom(fullModel, ids) {
    const chosen = normalize(ids);
    const all = summarizeModel(fullModel);
    const kept = Object.create(null);
    for (const id of chosen) kept[id] = true;
    /* الدمج بالمعرّف أولاً: «جداول الملاحق» صفحة اختيار واحدة مهما بلغت
       أجزاؤها في النموذج، فلا يُقال للمستخدم إنه أسقط صفحتين باختيار واحد. */
    const dropped = aggregateById(all.pages).filter((p) => !kept[p.id]);
    const lost = {
      figures: 0, charts: 0, tables: 0, tableRows: 0, insights: 0, caveats: 0,
    };
    const caveatTexts = [];
    for (const p of dropped) {
      lost.figures += p.figures;
      lost.charts += p.charts;
      lost.tables += p.tables;
      lost.tableRows += p.tableRows;
      lost.insights += p.insights;
      lost.caveats += p.caveats;
      for (const t of p.caveatTexts) {
        if (caveatTexts.indexOf(t) === -1) caveatTexts.push(t);
      }
    }
    return { dropped, lost, caveatTexts, restricted: dropped.length > 0 };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) الروابط
     ══════════════════════════════════════════════════════════════════════════ */

  /** رابط الموجز للاختيار الحالي: ‎#/report أو ‎#/report?pages=… */
  function reportHref(ids) {
    const q = serialize(ids);
    return q ? "#/report?pages=" + encodeURIComponent(q) : "#/report";
  }

  /** رابط مطلق يصلح للنسخ والإرسال (مع مسار الملف الحالي) */
  function absoluteHref(ids) {
    let head = "";
    try {
      if (typeof window !== "undefined" && window.location) {
        head = String(window.location.href).split("#")[0];
      }
    } catch (_e) { head = ""; }
    return head + reportHref(ids);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) حالة العرض وتنظيفها
     ══════════════════════════════════════════════════════════════════════════ */

  const state = {
    content: null,
    session: null,
    hosts: null,
    fullModel: null,
    timers: [],
    unbind: [],
  };

  function teardown() {
    for (const t of state.timers) clearTimeout(t);
    state.timers.length = 0;
    for (const off of state.unbind) {
      try { off(); } catch (_e) { /* أُزيل سلفاً */ }
    }
    state.unbind.length = 0;
    state.hosts = null;
    state.fullModel = null;
  }

  function later(fn, ms) {
    const t = setTimeout(() => {
      const i = state.timers.indexOf(t);
      if (i !== -1) state.timers.splice(i, 1);
      fn();
    }, ms);
    state.timers.push(t);
    return t;
  }

  function bindRouteGuard() {
    if (typeof window === "undefined" || !window.addEventListener) return;
    const onHash = () => {
      let r = null;
      try { r = RH.core.router.parse(); } catch (_e) { r = null; }
      if (!r || r.kind !== "admin" || r.id !== "report") teardown();
    };
    window.addEventListener("hashchange", onHash);
    state.unbind.push(() => window.removeEventListener("hashchange", onHash));
  }

  function actorName() {
    if (state.session && state.session.name) return state.session.name;
    try {
      const s = RH.admin.auth.session();
      if (s && s.name) return s.name;
    } catch (_e) { /* لا جلسة */ }
    return "غير معروف";
  }

  function auditAction(action, detail) {
    try {
      const p = RH.data.store.audit(actorName(), action, detail || {});
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (_e) { /* التدقيق أثر لا شرط */ }
  }

  function toast(msg) {
    try { RH.admin.shell.toast(msg); } catch (_e) { /* خارج الإدارة */ }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) لبنات العرض
     ══════════════════════════════════════════════════════════════════════════ */

  function card(title, sub) {
    const el = h("div", { class: "adm-card adf-card" });
    if (title) el.appendChild(h("h3", {}, title));
    if (sub) el.appendChild(h("div", { class: "sub" }, sub));
    return el;
  }

  function num(text) { return h("span", { class: "adf-num" }, text); }

  function chip(text, cls) {
    return h("span", { class: "adf-chip" + (cls ? " " + cls : "") }, text);
  }

  const PAGE_FORMS = Object.freeze({
    zero: "لا صفحات", one: "صفحة واحدة", two: "صفحتان",
    few: "صفحات", many: "صفحة", hundred: "صفحة",
  });
  const SHEET_FORMS = Object.freeze({
    zero: "لا أوراق", one: "ورقة واحدة", two: "ورقتان",
    few: "أوراق", many: "ورقة", hundred: "ورقة",
  });
  const FIGURE_FORMS = Object.freeze({
    zero: "لا أرقام", one: "رقم واحد", two: "رقمان",
    few: "أرقام", many: "رقماً", hundred: "رقم",
  });
  const CHART_FORMS = Object.freeze({
    zero: "لا رسوم", one: "رسم واحد", two: "رسمان",
    few: "رسوم", many: "رسماً", hundred: "رسم",
  });
  const TABLE_FORMS = Object.freeze({
    zero: "لا جداول", one: "جدول واحد", two: "جدولان",
    few: "جداول", many: "جدولاً", hundred: "جدول",
  });
  const ROW_FORMS = Object.freeze({
    zero: "لا صفوف", one: "صف واحد", two: "صفان",
    few: "صفوف", many: "صفاً", hundred: "صف",
  });
  const INSIGHT_FORMS = Object.freeze({
    zero: "لا رؤى", one: "رؤية واحدة", two: "رؤيتان",
    few: "رؤى", many: "رؤية", hundred: "رؤية",
  });
  const CAVEAT_FORMS = Object.freeze({
    zero: "لا وسوم", one: "وسم واحد", two: "وسمان",
    few: "وسوم", many: "وسماً", hundred: "وسم",
  });

  const pagesNoun = (n) => fmt.countNoun(n, PAGE_FORMS);
  const sheetsNoun = (n) => fmt.countNoun(n, SHEET_FORMS);
  const figuresNoun = (n) => fmt.countNoun(n, FIGURE_FORMS);
  const chartsNoun = (n) => fmt.countNoun(n, CHART_FORMS);
  const tablesNoun = (n) => fmt.countNoun(n, TABLE_FORMS);
  const rowsNoun = (n) => fmt.countNoun(n, ROW_FORMS);
  const insightsNoun = (n) => fmt.countNoun(n, INSIGHT_FORMS);
  const caveatsNoun = (n) => fmt.countNoun(n, CAVEAT_FORMS);

  /* ══════════════════════════════════════════════════════════════════════════
     9) بطاقة غياب الوحدة (بناء جزئي)
     ══════════════════════════════════════════════════════════════════════════ */

  function missingModuleCard() {
    const c = card("وحدة الموجز غير مضمّنة بعد", null);
    c.classList.add("adf-alert");
    c.appendChild(h("p", { class: "adf-note" },
      "هذا البناء لا يحتوي ملفات الموجز التنفيذي "
      + "(src/js/report/report-pages.js وأخواتها)، فلا نموذج صفحات يُعاين ولا "
      + "وضع طباعة يُفتح. الاختيار المحفوظ على هذا الجهاز يبقى سليماً وسيعمل "
      + "فور إدراج الوحدة في البناء."));
    const stored = loadSelection();
    if (stored && stored.length) {
      c.appendChild(h("div", { class: "adf-note" },
        "الاختيار المحفوظ حالياً: ",
        h("span", { class: "adf-mono" }, stored.join("، "))));
    }
    c.appendChild(h("p", { class: "adf-note" },
      "أعد البناء بـ python3 build.py بعد توفر الملفات؛ يطبع البناء قائمة "
      + "«الملفات غير الموجودة» صراحةً فلا يخفي نقصاً."));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) قائمة اختيار الصفحات
     ══════════════════════════════════════════════════════════════════════════ */

  /** صف صفحة واحد في قائمة الاختيار */
  function pageRow(id, opts) {
    const o = opts || {};
    const mandatory = o.mandatory;
    const checked = mandatory || o.checked;
    const inputId = "adf-p-" + id;
    const cb = h("input", {
      type: "checkbox",
      id: inputId,
      disabled: mandatory ? "" : null,
      "aria-describedby": inputId + "-d",
    });
    cb.checked = !!checked;
    if (!mandatory) {
      cb.addEventListener("change", () => o.onToggle(id, cb.checked));
    }

    const stats = o.stats;
    return h("div", {
      class: "adf-pagerow" + (mandatory ? " is-mandatory" : "")
        + (checked ? " is-on" : " is-off"),
    },
      h("label", { class: "adf-pagebox", for: inputId }, cb),
      h("div", { class: "adf-pagemain" },
        h("div", { class: "adf-pagehead" },
          h("span", { class: "adf-pagetitle" }, o.title || id),
          mandatory ? chip("إلزامي", "k-required") : null,
          o.kicker ? h("span", { class: "adf-pagekicker" }, o.kicker) : null,
          h("span", { class: "adf-mono adf-pageid" }, id),
        ),
        h("div", { class: "adf-pagehint", id: inputId + "-d" },
          PAGE_HINT[id] || "صفحة من الموجز"),
        stats
          ? h("div", { class: "adf-pagestats" },
            stats.figures ? chip(figuresNoun(stats.figures), "k-fig") : null,
            stats.charts ? chip(chartsNoun(stats.charts), "k-chart") : null,
            stats.tables
              ? chip(tablesNoun(stats.tables) + " · " + rowsNoun(stats.tableRows), "k-table")
              : null,
            stats.insights ? chip(insightsNoun(stats.insights), "k-insight") : null,
            stats.caveats ? chip(caveatsNoun(stats.caveats), "k-honesty") : null,
            stats.sheets
              ? chip(sheetsNoun(stats.sheets) + " A4", "k-sheet") : null,
          )
          : null,
      ),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) شريط التركيبة المحايد لكل صفحة
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * شريط تركيبة الصفحة: نسب الأرقام/الرسوم/الجداول/الرؤى.
   * ألوانه محايدة من رمادي الإدارة حصراً — لا يستعمل منظومة الألوان الدلالية
   * (أخضر/رملي/مرجاني/ذهبي) لأن هذه عدّادات كتل لا قيم بيانات.
   */
  function compositionBar(stats) {
    const total = stats.blocks;
    if (!total) return null;
    const seg = (n, cls, label) => {
      if (!n) return null;
      const pctVal = (n / total) * 100;
      return h("span", {
        class: "adf-comp-seg " + cls,
        style: { width: pctVal.toFixed(3) + "%" },
        title: label + ": " + fmt.int(n),
      });
    };
    return h("div", {
      class: "adf-comp", role: "img",
      "aria-label": "تركيبة الصفحة: " + figuresNoun(stats.figures)
        + "، " + chartsNoun(stats.charts) + "، " + tablesNoun(stats.tables)
        + "، " + insightsNoun(stats.insights),
    },
      seg(stats.figures, "is-fig", "أرقام"),
      seg(stats.charts, "is-chart", "رسوم"),
      seg(stats.tables, "is-table", "جداول"),
      seg(stats.insights, "is-insight", "رؤى"));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) بطاقات المعاينة
     ══════════════════════════════════════════════════════════════════════════ */

  function previewCard(stats) {
    const box = h("div", { class: "adf-preview" },
      h("div", { class: "adf-preview-head" },
        h("span", { class: "adf-preview-kicker" }, stats.kicker || ""),
        h("h4", {}, stats.title || stats.id),
        h("span", { class: "adf-mono adf-pageid" }, stats.id)),
      h("dl", { class: "adf-preview-stats" },
        h("div", {}, h("dt", {}, "أرقام بارزة"), h("dd", { class: "adf-num" },
          fmt.int(stats.figures))),
        h("div", {}, h("dt", {}, "رسوم"), h("dd", { class: "adf-num" },
          fmt.int(stats.charts))),
        h("div", {}, h("dt", {}, "جداول"), h("dd", { class: "adf-num" },
          fmt.int(stats.tables))),
        h("div", {}, h("dt", {}, "صفوف الجداول"), h("dd", { class: "adf-num" },
          fmt.int(stats.tableRows))),
        h("div", {}, h("dt", {}, "رؤى"), h("dd", { class: "adf-num" },
          fmt.int(stats.insights))),
        h("div", {}, h("dt", {}, "أوراق A4"), h("dd", { class: "adf-num" },
          stats.sheets ? fmt.int(stats.sheets) : "—")),
      ),
    );
    const comp = compositionBar(stats);
    if (comp) box.appendChild(comp);
    if (stats.caveats) {
      box.appendChild(h("div", { class: "adf-preview-caveats" },
        h("div", { class: "adf-preview-cap" },
          "وسوم الصدق التي تسافر مع هذه الصفحة (" + fmt.int(stats.caveats) + ")"),
        h("ul", { class: "adf-caveats" },
          stats.caveatTexts.map((t) => h("li", {}, t)))));
    } else {
      box.appendChild(h("div", { class: "adf-preview-caveats is-none" },
        "لا وسم صدق على هذه الصفحة — كل أرقامها معتمدة بلا تحفظ"));
    }
    if (stats.chartCaveats) {
      box.appendChild(h("div", { class: "adf-preview-cap" },
        "ومن رسومها " + fmt.int(stats.chartCaveats) + " يحمل تنويهه الخاص أسفله"));
    }
    if (stats.parts > 1) {
      box.appendChild(h("div", { class: "adf-preview-cap" },
        "تُخرجها آلة الصفحات في " + fmt.int(stats.parts)
        + " صفحات منطقية لطول محتواها — وتبقى اختياراً واحداً"));
    }
    return box;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     13) بناء النموذج والخطة
     ══════════════════════════════════════════════════════════════════════════ */

  /** يقرأ الإصدار والمشتقات والجغرافيا من المخزن الحي */
  function liveInputs() {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const geo = (typeof window !== "undefined" && window.GEO) ? window.GEO : null;
    return { rel, der, geo };
  }

  /**
   * يبني نموذج الموجز لاختيار محدد.
   * دالة رقيقة عمداً: كل المنطق في `RH.report.pages.model` — هنا تمرير مدخلات
   * وحسب، كي لا يتفرع سلوك المعاينة عن سلوك الطباعة أبداً.
   */
  function buildModel(rel, der, geo, ids, now) {
    if (!reportAvailable()) return null;
    return RH.report.pages.model(rel, der, {
      pages: ids == null ? null : normalize(ids),
      geo: geo || null,
      now: now || new Date(),
    });
  }

  /** خطة الأوراق (عدد أوراق A4) — اختيارية: تغيب في بناء بلا `plan` */
  function buildPlan(model) {
    if (!model) return null;
    if (!reportAvailable() || typeof RH.report.pages.plan !== "function") return null;
    try {
      return RH.report.pages.plan(model, {});
    } catch (_e) {
      return null;   // خطة الترقيم راحة لا شرط — غيابها لا يسقط المعاينة
    }
  }

  /** عدد أوراق كل صفحة منطقية من الخطة */
  function sheetsByPage(planned) {
    const out = Object.create(null);
    if (!planned || !Array.isArray(planned.sheets)) return out;
    for (const s of planned.sheets) {
      if (!s || !s.pageId) continue;
      out[s.pageId] = (out[s.pageId] || 0) + 1;
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     14) إعادة الرسم الجزئية
     ══════════════════════════════════════════════════════════════════════════ */

  function onToggle(id, on) {
    const cur = selection();
    const next = on
      ? cur.concat([id])
      : cur.filter((x) => x !== id);
    /* حصر فارغ: القاعدة القانونية أن الفارغ = الكل (normalizePages)، فنجعل
       ذلك صريحاً في الحالة بدل ترك المستخدم يظن أنه أسقط كل شيء. */
    selected = normalize(next);
    saveSelection(selected);
    refresh();
    if (on === false && next.length === 0) {
      toast("الاختيار الفارغ يعني الموجز كاملاً — أُعيد ضبطه على كل الصفحات");
    }
  }

  function applyPreset(p) {
    selected = presetPages(p);
    saveSelection(selected);
    refresh();
    toast("طُبّقت توليفة «" + p.name + "» — " + pagesNoun(selected.length));
  }

  function refresh() {
    const hs = state.hosts;
    if (!hs) return;

    const ids = selection();
    let inputs;
    try {
      inputs = liveInputs();
    } catch (e) {
      RH.core.dom.clear(hs.preview);
      hs.preview.appendChild(h("p", { class: "adf-note" },
        "تعذّر قراءة الإصدار الحالي: " + ((e && e.message) || e)));
      return;
    }

    let model = null;
    let err = null;
    try {
      model = buildModel(inputs.rel, inputs.der, inputs.geo, ids, new Date());
    } catch (e) {
      err = e;
    }
    const planned = buildPlan(model);
    const sheets = sheetsByPage(planned);
    const summary = model ? summarizeModel(model) : { pages: [], totals: null };
    /* الأوراق تُحسب بالمعرّف في الخطة، فتُسند بعد الدمج لا قبله كي لا يُنسب
       مجموع أوراق «جداول الملاحق» إلى كلٍّ من جزأيها. */
    const merged = aggregateById(summary.pages);
    for (const s of merged) s.sheets = sheets[s.id] || 0;

    /* (أ) قائمة الاختيار */
    RH.core.dom.clear(hs.list);
    const mand = mandatoryIds();
    const chosen = Object.create(null);
    for (const id of ids) chosen[id] = true;
    const statsById = Object.create(null);
    for (const s of merged) statsById[s.id] = s;

    for (const id of allPageIds()) {
      const isMand = mand.indexOf(id) !== -1;
      hs.list.appendChild(pageRow(id, {
        mandatory: isMand,
        checked: isMand || !!chosen[id],
        title: titleOf(id),
        kicker: kickerOf(id),
        stats: statsById[id] || null,
        onToggle,
      }));
    }

    /* (ب) شريط الحالة */
    RH.core.dom.clear(hs.status);
    const restricted = isRestricted(ids);
    hs.status.appendChild(h("span", {},
      "الاختيار الحالي: ", num(fmt.int(ids.length)), " من ",
      num(fmt.int(sectionIds().length)), " صفحة أقسام، ",
      "مع الغلاف وصفحة الإسناد إلزاماً"));
    if (planned) {
      hs.status.appendChild(h("span", { class: "adf-statusq" },
        " · الحجم المقدَّر: ", h("b", {}, sheetsNoun(planned.total)), " A4"));
    }
    const pid = matchPreset(ids);
    if (pid) {
      const p = presetFor(pid);
      hs.status.appendChild(h("span", { class: "adf-statusq" },
        " · مطابق لتوليفة «", h("b", {}, p.name), "»"));
    }
    if (!restricted) {
      hs.status.appendChild(h("span", { class: "adf-statusq" },
        " · الموجز كامل بلا حصر"));
    }

    /* (ج) أزرار التوليفات: تُبرز الفاعلة */
    if (hs.presetBtns) {
      for (const id of Object.keys(hs.presetBtns)) {
        const b = hs.presetBtns[id];
        const on = pid === id;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
    }

    /* (د) الروابط */
    const href = reportHref(ids);
    if (hs.openBtn) hs.openBtn.setAttribute("href", href);
    if (hs.newWinBtn) hs.newWinBtn.setAttribute("href", href);
    if (hs.linkText) hs.linkText.textContent = href;

    /* (هـ) المعاينة */
    RH.core.dom.clear(hs.preview);
    if (err) {
      hs.preview.appendChild(h("p", { class: "adf-note" },
        "تعذّر بناء نموذج الموجز: " + ((err && err.message) || err)));
      console.warn("reportBuilder.model:", err);
    } else if (!model) {
      hs.preview.appendChild(h("p", { class: "adf-note" },
        "وحدة الموجز غير متاحة في هذا البناء."));
    } else {
      hs.preview.appendChild(coverStrip(model, planned));
      const grid = h("div", { class: "adf-previews" });
      for (const s of merged) grid.appendChild(previewCard(s));
      hs.preview.appendChild(grid);
      hs.preview.appendChild(totalsStrip(summary.totals, planned));
      hs.preview.appendChild(provenanceStrip(model));
    }

    /* (و) ما الذي يفقده الاختيار */
    RH.core.dom.clear(hs.loss);
    if (model && restricted) {
      let fullModel = state.fullModel;
      if (!fullModel) {
        try {
          fullModel = buildModel(inputs.rel, inputs.der, inputs.geo, null, new Date());
          state.fullModel = fullModel;
        } catch (_e) { fullModel = null; }
      }
      if (fullModel) hs.loss.appendChild(lossCard(missingFrom(fullModel, ids)));
    } else if (model) {
      hs.loss.appendChild(h("div", { class: "adf-note" },
        "الاختيار كامل — لا صفحة مسقطة ولا وسم صدق ضائع."));
    }

    /* (ز) سجل الاختيارات الأخيرة */
    RH.core.dom.clear(hs.history);
    const hist = loadHistory();
    if (hist.length) {
      hs.history.appendChild(h("div", { class: "sub" },
        "آخر ما فُتح من هذا الجهاز — راحة محلية لا سجل مؤسسي "
        + "(السجل المؤسسي في تبويب سجل التدقيق)"));
      const ul = h("div", { class: "adf-recents" });
      for (const r of hist) {
        const rIds = normalize(r.pages);
        const rp = matchPreset(rIds);
        ul.appendChild(h("button", {
          type: "button", class: "adf-recent",
          onclick: () => {
            selected = rIds;
            saveSelection(selected);
            refresh();
            toast("استُعيد اختيار سابق — " + pagesNoun(rIds.length));
          },
        },
          h("span", { class: "adf-recent-n" },
            rp ? presetFor(rp).name : pagesNoun(rIds.length)),
          h("span", { class: "adf-recent-t" },
            r.at ? fmt.date(String(r.at).slice(0, 10)) : ""),
          h("span", { class: "adf-recent-p adf-mono" }, rIds.join("، ")),
        ));
      }
      hs.history.appendChild(ul);
    } else {
      hs.history.appendChild(h("div", { class: "sub" },
        "لم يُفتح موجز من هذا الجهاز بعد."));
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     15) شرائح المعاينة
     ══════════════════════════════════════════════════════════════════════════ */

  /** شريحة الغلاف: هوية الإصدار كما ستُطبع حرفياً */
  function coverStrip(model, planned) {
    const c = model.cover || {};
    return h("div", { class: "adf-cover" },
      h("div", { class: "adf-cover-head" },
        h("span", { class: "adf-preview-kicker" }, "الغلاف كما سيُطبع"),
        h("h4", {}, c.title || "—")),
      h("dl", { class: "adf-cover-grid" },
        h("div", {}, h("dt", {}, "الإصدار"),
          h("dd", { class: "adf-mono" }, c.releaseId || "—")),
        h("div", {}, h("dt", {}, "البيانات حتى"), h("dd", {}, c.dataAsOf || "—")),
        h("div", {}, h("dt", {}, "فترة الرصد"), h("dd", {}, c.monitoringPeriod || "—")),
        h("div", {}, h("dt", {}, "خط الأساس"), h("dd", {}, c.baselineLabel || "—")),
        h("div", {}, h("dt", {}, "تاريخ التوليد"), h("dd", {}, c.generatedAtLabel || "—")),
        h("div", {}, h("dt", {}, "بصمة التحقق"),
          h("dd", { class: "adf-mono" }, c.sha256Short || "—")),
        planned
          ? h("div", {}, h("dt", {}, "إجمالي الأوراق"),
            h("dd", { class: "adf-num" }, fmt.int(planned.total)))
          : null,
      ),
      c.presentationDateNeedsConfirmation
        ? h("div", { class: "adf-rowcaveat" },
          "تاريخ العرض المسجَّل (" + (c.presentationDate ? fmt.date(c.presentationDate) : "—")
          + ") بحاجة تأكيد — يُطبع بوسمه كما هو في البيانات")
        : null,
    );
  }

  /** شريحة الإجماليات */
  function totalsStrip(totals, planned) {
    if (!totals) return h("div", {});
    return h("div", { class: "adf-totals" },
      h("div", { class: "adf-total" },
        h("span", { class: "adf-total-n adf-num" }, fmt.int(totals.pages)),
        h("span", { class: "adf-total-l" }, "صفحة أقسام")),
      h("div", { class: "adf-total" },
        h("span", { class: "adf-total-n adf-num" }, fmt.int(totals.figures)),
        h("span", { class: "adf-total-l" }, "رقم بارز")),
      h("div", { class: "adf-total" },
        h("span", { class: "adf-total-n adf-num" }, fmt.int(totals.charts)),
        h("span", { class: "adf-total-l" }, "رسم")),
      h("div", { class: "adf-total" },
        h("span", { class: "adf-total-n adf-num" }, fmt.int(totals.tables)),
        h("span", { class: "adf-total-l" }, "جدول")),
      h("div", { class: "adf-total" },
        h("span", { class: "adf-total-n adf-num" }, fmt.int(totals.tableRows)),
        h("span", { class: "adf-total-l" }, "صف بيانات")),
      h("div", { class: "adf-total" },
        h("span", { class: "adf-total-n adf-num" }, fmt.int(totals.insights)),
        h("span", { class: "adf-total-l" }, "رؤية")),
      h("div", { class: "adf-total is-honesty" },
        h("span", { class: "adf-total-n adf-num" }, fmt.int(totals.caveats)),
        h("span", { class: "adf-total-l" }, "وسم صدق")),
      planned
        ? h("div", { class: "adf-total is-sheets" },
          h("span", { class: "adf-total-n adf-num" }, fmt.int(planned.total)),
          h("span", { class: "adf-total-l" }, "ورقة A4"))
        : null,
    );
  }

  /** شريحة الإسناد: عدّاد البوابات والمصادر — تُطبع دائماً فتُعرض دائماً */
  function provenanceStrip(model) {
    const p = model.provenance || {};
    const gates = p.gates || {};
    const sources = Array.isArray(p.sources) ? p.sources : [];
    const metrics = Array.isArray(p.metrics) ? p.metrics : [];
    return h("div", { class: "adf-prov" },
      h("div", { class: "adf-preview-kicker" }, "صفحة الإسناد (إلزامية)"),
      h("div", { class: "adf-prov-grid" },
        h("div", {},
          h("span", { class: "adf-num" }, fmt.int(metrics.length)),
          h("span", {}, " مقياساً بمصدره ورقةً ومرساة")),
        h("div", {},
          h("span", { class: "adf-num" }, fmt.int(sources.length)),
          h("span", {}, " مصدراً مستورداً ببصمته")),
        gates.total != null
          ? h("div", {},
            h("span", { class: "adf-num" },
              fmt.int(gates.passed) + "/" + fmt.int(gates.total)),
            h("span", {}, " فحص مجتاز"))
          : null,
        gates.warnings
          ? h("div", {},
            h("span", { class: "adf-num" }, fmt.int(gates.warnings)),
            h("span", {}, " إنذاراً موثقاً"))
          : null,
      ));
  }

  /** بطاقة «ما الذي يفقده هذا الاختيار» */
  function lossCard(miss) {
    const box = h("div", { class: "adf-loss" });
    box.appendChild(h("div", { class: "adf-loss-head" },
      "هذا الاختيار يُسقط ", h("b", {}, pagesNoun(miss.dropped.length))));
    box.appendChild(h("div", { class: "adf-loss-list" },
      miss.dropped.map((p) => h("span", { class: "adf-loss-page" },
        h("b", {}, p.title || p.id),
        h("span", { class: "adf-loss-meta" },
          " — " + figuresNoun(p.figures) + " · " + chartsNoun(p.charts)
          + (p.tableRows ? " · " + rowsNoun(p.tableRows) : ""))))));
    box.appendChild(h("div", { class: "adf-loss-tot" },
      "الفاقد إجمالاً: ", h("b", {}, figuresNoun(miss.lost.figures)), "، ",
      h("b", {}, chartsNoun(miss.lost.charts)), "، ",
      h("b", {}, tablesNoun(miss.lost.tables)), " (", rowsNoun(miss.lost.tableRows), ")، ",
      h("b", {}, insightsNoun(miss.lost.insights))));
    if (miss.caveatTexts.length) {
      box.appendChild(h("div", { class: "adf-loss-caveats" },
        h("div", { class: "adf-preview-cap" },
          "وسوم صدق لن تُطبع في هذا الاختيار — إن كان الرقم الذي تحمله سيُذكر "
          + "شفهياً فاذكر وسمه معه"),
        h("ul", { class: "adf-caveats" },
          miss.caveatTexts.map((t) => h("li", {}, t)))));
    }
    return box;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     16) الرسم الرئيس
     ══════════════════════════════════════════════════════════════════════════ */

  function pageHead() {
    return h("div", { class: "adm-page-head" },
      h("div", { class: "kicker" }, "منشئ الموجز"),
      h("h2", {}, "ابنِ الموجز التنفيذي المطبوع"),
      h("div", { class: "desc" },
        "اختر الصفحات، وشاهد قبل الطباعة ماذا يحمل كل اختيار من أرقام ورسوم "
        + "وجداول ووسوم صدق، وكم ورقة A4 سيشغل. الغلاف وصفحة الإسناد إلزاميان: "
        + "بلا هوية إصدار ومصدر لكل رقم يصبح الموجز ورقة مجهولة النسب."));
  }

  function presetsCard() {
    const c = card("توليفات جاهزة",
      "اختصارات اختيار لا قوالب محتوى — كلها تمر بنموذج الصفحات ذاته، "
      + "ووصف كل توليفة يقول صراحةً ما الذي تتركه خارجاً");
    const wrap = h("div", { class: "adf-presets" });
    const btns = Object.create(null);
    for (const p of PRESETS) {
      const b = h("button", {
        type: "button",
        class: "adf-preset",
        "aria-pressed": "false",
        onclick: () => applyPreset(p),
      },
        h("span", { class: "adf-preset-n" }, p.name),
        h("span", { class: "adf-preset-c" },
          pagesNoun(presetPages(p).length) + " من الأقسام"),
        h("span", { class: "adf-preset-d" }, p.desc));
      btns[p.id] = b;
      wrap.appendChild(b);
    }
    c.appendChild(wrap);
    return { card: c, btns };
  }

  function selectionCard(status, list) {
    const c = card("صفحات الموجز",
      "الترتيب قانوني ولا يتغير بترتيب الاختيار — الغلاف أولاً والإسناد آخراً دائماً");
    c.appendChild(status);
    c.appendChild(list);
    c.appendChild(h("div", { class: "adf-actions" },
      h("button", {
        type: "button", class: "btn btn-line",
        onclick: () => {
          selected = normalize(null);
          saveSelection(selected);
          refresh();
          toast("اختير الموجز كاملاً");
        },
      }, "اختيار كل الصفحات"),
      h("button", {
        type: "button", class: "btn btn-quiet",
        onclick: () => {
          /* «الإلزامي فقط» ليس اختياراً فارغاً: القاعدة القانونية تجعل الفارغ
             = الكل، فنقول ذلك صراحةً بدل إيهام المستخدم بحصر لا يقع. */
          toast("الغلاف والإسناد وحدهما لا يشكّلان موجزاً — "
            + "اختيار صفر صفحة أقسام يعني الموجز كاملاً");
        },
      }, "لماذا لا يمكن إسقاط كل الأقسام؟"),
    ));
    return c;
  }

  function outputCard(openBtn, linkText, newWinBtn) {
    const c = card("الإخراج",
      "وضع الموجز مستند طباعة كامل: يفتح خارج المسرح، ويُطبع بـ«طباعة / حفظ PDF» "
      + "من شريط أدواته، ثم يعيدك زر العودة إلى العرض");
    c.appendChild(h("div", { class: "adf-linkrow" },
      h("span", { class: "adf-linklabel" }, "الرابط:"),
      linkText));
    c.appendChild(h("div", { class: "adf-actions" },
      openBtn,
      h("button", {
        type: "button", class: "btn btn-line",
        onclick: () => {
          const url = absoluteHref(selection());
          copyText(url);
          auditAction("report.copy_link", { pages: selection() });
        },
      }, "نسخ الرابط"),
      newWinBtn,
    ));
    c.appendChild(h("p", { class: "adf-note" },
      "الطباعة تستعمل قواعد ‎@media print الخاصة بالموجز: صفحات A4 عمودية "
      + "بهوامش 12مم، وشريط الأدوات لا يُطبع، والمستند نهاري الحبر حتى لو كان "
      + "المسرح داكناً."));
    return c;
  }

  /** نسخ نص إلى الحافظة (نفس بديل diff-viewer — سياق file:// قد يمنع الحافظة) */
  function copyText(text) {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard
        && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => toast("نُسخ الرابط"),
          () => fallbackCopy(text));
        return true;
      }
    } catch (_e) { /* سياق غير آمن */ }
    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.insetInlineStart = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand("copy");
      document.body.removeChild(ta);
      toast(ok ? "نُسخ الرابط" : "تعذّر النسخ — انسخه يدوياً من السطر أعلاه");
      return !!ok;
    } catch (_e) {
      toast("تعذّر النسخ في هذا المتصفح — انسخ الرابط يدوياً");
      return false;
    }
  }

  /**
   * الرسم — العقد §11.1: `render(content, session)`.
   */
  function render(content, session) {
    teardown();
    state.content = content;
    state.session = session || null;

    RH.core.dom.clear(content);
    content.appendChild(pageHead());

    if (!reportAvailable()) {
      content.appendChild(missingModuleCard());
      return;
    }

    /* الاختيار الحي: المحفوظ إن وُجد، وإلا الكامل */
    if (!selected) selected = loadSelection() || normalize(null);

    const presets = presetsCard();
    content.appendChild(presets.card);

    const status = h("div", { class: "adf-status", role: "status", "aria-live": "polite" });
    const list = h("div", { class: "adf-pagelist" });
    content.appendChild(selectionCard(status, list));

    const linkText = h("code", { class: "adf-mono adf-link" }, "#/report");
    const openBtn = h("a", {
      class: "btn btn-primary",
      href: "#/report",
      onclick: () => {
        pushHistory(selection());
        auditAction("report.open", {
          pages: selection(),
          restricted: isRestricted(selection()),
        });
      },
    }, "فتح الموجز للطباعة");
    const newWinBtn = h("a", {
      class: "btn btn-quiet",
      href: "#/report",
      target: "_blank",
      rel: "noopener",
      onclick: () => {
        pushHistory(selection());
        auditAction("report.open_new_window", { pages: selection() });
      },
    }, "فتح في نافذة مستقلة");
    content.appendChild(outputCard(openBtn, linkText, newWinBtn));

    const previewCardEl = card("معاينة النموذج",
      "المعاينة تقرأ نموذج الصفحات نفسه الذي يبني به وضع الموجز أوراقه — "
      + "لا رسم ECharts هنا: الرسم وظيفة وضع الطباعة نفسه");
    const preview = h("div", { class: "adf-previewhost" });
    previewCardEl.appendChild(preview);
    content.appendChild(previewCardEl);

    const lossCardEl = card("ما الذي يفقده هذا الاختيار؟",
      "إسقاط صفحة يُسقط أرقامها وجداولها ووسوم صدقها معاً — والوسم الغائب "
      + "أخطر من الرقم الغائب");
    const loss = h("div", { class: "adf-losshost" });
    lossCardEl.appendChild(loss);
    content.appendChild(lossCardEl);

    const historyCardEl = card("اختيارات سابقة على هذا الجهاز", null);
    const history = h("div", { class: "adf-historyhost" });
    historyCardEl.appendChild(history);
    content.appendChild(historyCardEl);

    state.hosts = {
      status, list, preview, loss, history,
      openBtn, newWinBtn, linkText, presetBtns: presets.btns,
    };
    bindRouteGuard();
    refresh();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     17) الواجهة العامة
     ══════════════════════════════════════════════════════════════════════════ */

  return {
    // العقد §11.1
    render,
    selection,
    // ضبط برمجي وتنظيف
    setSelection,
    teardown,
    // ثوابت معلَنة
    STORAGE_KEY,
    HISTORY_KEY,
    HISTORY_MAX,
    PRESETS,
    PAGE_HINT,
    FALLBACK_PAGE_IDS,
    FALLBACK_MANDATORY,
    // جسر وحدة الموجز
    reportAvailable,
    allPageIds,
    mandatoryIds,
    sectionIds,
    titleOf,
    kickerOf,
    normalize,
    serialize,
    isRestricted,
    // تخزين
    loadSelection,
    saveSelection,
    loadHistory,
    pushHistory,
    // توليفات
    presetFor,
    presetPages,
    matchPreset,
    // تلخيص
    summarizePage,
    aggregateById,
    summarizeModel,
    missingFrom,
    buildModel,
    buildPlan,
    sheetsByPage,
    // روابط
    reportHref,
    absoluteHref,
    // معدودات
    pagesNoun,
    sheetsNoun,
    figuresNoun,
    chartsNoun,
    tablesNoun,
    rowsNoun,
    insightsNoun,
    caveatsNoun,
  };
})();
