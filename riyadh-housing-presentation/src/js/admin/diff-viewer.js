/* ════════════════════════════════════════════════════════════════════════════
   diff-viewer.js — مقارِن الإصدارات حقلاً حقلاً (عقد التوسعة §11.2)
   بادئة الأنماط: adf-  ·  الفضاء: RH.admin.diffViewer
   يُضم بعد admin/report-builder.js وقبل app.js — لا يعتمد على شيء بعده.
   ────────────────────────────────────────────────────────────────────────────
   لماذا يوجد هذا التبويب أصلاً؟

   دورة حياة المسودة في هذه المنصة تنتهي بلقطة **غير قابلة للتغيير** يقرؤها
   أمين المنطقة فوراً (store.publish). بين «فتح مسودة» و«نشر» قد تمر عشرات
   التحريرات في ثمانية محررات مختلفة (البيانات الوصفية، الاستيراد، التحليلات،
   الاستراتيجية، المؤشرات، لوحات الرؤى، الخطوات، ملاحظات الإصدار). لوحة
   التحقق (quality.js) تجيب عن سؤال «هل المسودة سليمة؟» — وهذا التبويب يجيب
   عن السؤال الآخر الذي لا يجيب عنه أحد: **«ما الذي تغيّر بالضبط؟»**

   ثلاث قواعد تحكم التصميم كله:

   (1) **الحذف حدث خطير لا حدث عادي.** حقل موجود في الإصدار المنشور وغائب من
       المسودة هو في الغالب خطأ تحرير لا قراراً؛ لذلك يُلوَّن مرجانياً ويُرفع
       إلى أعلى درجة خطورة ويُعدّ في ملخص المجموعة على حدة.

   (2) **وسوم الصدق لا تتغير في الظلام.** كل مسار يحمل وساماً (منهجية الامتثال
       81.6٪، caveat السيناريوهات، وسم العينة، تنويه الخريطة، حالات «بانتظار
       الاعتماد») يُرفع تلقائياً إلى «تغيّر وسم صدق» في بطاقة مستقلة أعلى
       الصفحة — ونص الوسم نفسه يُعرض مع الصف حرفياً من البيانات لا بصياغة
       جديدة. تعديل نص وسم صدق قرار تحريري يحتاج انتباهاً، لا سطراً في قائمة.

   (3) **ما لا يُقارَن يُعلَن.** الحقول التشغيلية (بصمة التحقق، ختم النشر، رقم
       نسخة المسودة…) تتغير مع كل حفظ فتُستثنى افتراضياً — والقائمة معروضة
       صراحة في «الحقول المستثناة من المقارنة» لا مخبوءة في الكود.

   المنطق كله **نقي وقابل للاختبار**: `diff`/`decorate`/`summarize`/`filter`/
   `paginate`/`textReport` دوال بلا DOM مُصدَّرة على الفضاء، ومختبرة في
   `tests/unit/diff-model.test.mjs`. طبقة الرسم أدناه تستهلكها ولا تكرر منطقها.

   انضباط اللون: هذا سطح إداري لا رسم بياني — الألوان الثلاثة المستعملة هي
   ألوان حالة الإدارة القائمة في admin.css (ok/warn/bad) وفق نص العقد
   «إضافة خضراء، حذف مرجاني، تغيير رملي»، ولا يُستعمل أي لون دلالي من منظومة
   الرسوم (الذهبي للمستهدفات، المرجاني للعجز) خارج هذا المعنى.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

RH.admin.diffViewer = (function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* ══════════════════════════════════════════════════════════════════════════
     1) الثوابت: ما يُستثنى، وكيف تُسمّى المسارات بالعربية
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * الحقول التشغيلية المستثناة افتراضاً.
   * هذه ليست بيانات محتوى بل آثار دورة الحياة: تتغير حتماً مع كل حفظ أو نشر،
   * فإدراجها يغرق المقارنة بضجيج يخفي التغيير الحقيقي. تُعرض القائمة للمستخدم
   * في بطاقة «الحقول المستثناة» كي لا يكون الاستثناء سراً — وكل حقل فيها
   * يظهر بقيمته في بطاقة الهوية أعلى الصفحة، فلا معلومة تضيع بالاستثناء.
   */
  const DEFAULT_IGNORE = Object.freeze([
    "release.id",
    "release.status",
    "release.sha256",
    "release.published_at",
    "release.published_by",
    "release.base_release_id",
    "release.draft_version",
    "release.started_at",
    "release.started_by",
    "release.updated_at",
    "release.updated_by",
    "release.rollback_of",
    "release.waivers",
    "release.notes",
    "validation.checked_at",
  ]);

  /** شرح كل استثناء — يُعرض بجواره فلا يبقى قراراً صامتاً */
  const IGNORE_REASON = Object.freeze({
    "release.id": "معرّف اللقطة يُولَّد وقت النشر",
    "release.status": "حالة اللقطة (مسودة/منشور) ليست محتوى",
    "release.sha256": "بصمة التحقق تُحسب من المحتوى بعد اكتماله",
    "release.published_at": "ختم زمني يُكتب لحظة النشر",
    "release.published_by": "ينسب النشر لا التحرير",
    "release.base_release_id": "يُعرض في بطاقة الهوية أعلاه بدل تكراره صفاً",
    "release.draft_version": "يزيد مع كل حفظ — عدّاد لا محتوى",
    "release.started_at": "ختم فتح المسودة",
    "release.started_by": "من فتح المسودة — يظهر في بطاقة الهوية",
    "release.updated_at": "ختم آخر حفظ",
    "release.updated_by": "آخر محرِّر — يظهر في بطاقة الهوية",
    "release.rollback_of": "وسم مسودة التراجع — يظهر في بطاقة الهوية",
    "release.waivers": "الإقرارات تُدار وتُعرض في تبويب التحقق والنشر",
    "release.notes": "ملاحظات الإصدار تُكتب لحظة النشر، والمسودة تبدأ بلا "
      + "ملاحظات دائماً — فمقارنتها تُظهر «حذفاً» كاذباً في كل مسودة جديدة. "
      + "نصّا الطرفين معروضان في بطاقة الهوية أعلاه",
    "validation.checked_at": "ختم آخر تشغيل للفحوص",
  });

  /** ترتيب المجموعات في العرض = ترتيب المفاتيح العليا في عقد البيانات */
  const GROUP_ORDER = Object.freeze([
    "schema_version", "release", "meta", "sources", "metrics", "derived",
    "sectors", "monthly", "baseline", "facility_types", "economic_activities",
    "violation_types", "collar", "neighbourhoods", "scenarios", "compliance",
    "coverage_target_indicative", "strategy", "insight_panels", "next_steps",
    "insights", "quarantine", "quarantine_resolved", "validation",
  ]);

  /** أسماء المجموعات العربية — مرآة أسماء الأقسام في محررات الإدارة */
  const GROUP_LABEL = Object.freeze({
    schema_version: "إصدار المخطط",
    release: "هوية الإصدار وملاحظاته",
    meta: "البيانات الوصفية",
    sources: "المصادر المستوردة",
    metrics: "المقاييس الخام",
    derived: "القيم المشتقة",
    sectors: "القطاعات الخمسة",
    monthly: "السلاسل الشهرية",
    baseline: "خط الأساس",
    facility_types: "أنواع الإيواء",
    economic_activities: "الأنشطة الاقتصادية",
    violation_types: "أنواع المخالفات",
    collar: "تركيبة العمالة",
    neighbourhoods: "عينة الأحياء",
    scenarios: "سيناريوهات العجز",
    compliance: "نسبة الامتثال",
    coverage_target_indicative: "مستهدف التغطية الاسترشادي",
    strategy: "الاستراتيجية والمبادرات والمؤشرات",
    insight_panels: "لوحات الرؤى",
    next_steps: "الخطوات القادمة",
    insights: "نصوص التحليل",
    quarantine: "البيانات المحجورة",
    quarantine_resolved: "المحجور بعد المعالجة",
    validation: "سجل الفحوص",
  });

  /** أسماء الحقول المتكررة — تُستعمل حين لا يحمل الكائن اسماً خاصاً به */
  const KEY_LABEL = Object.freeze({
    value: "القيمة",
    unit: "الوحدة",
    label: "التسمية",
    name: "الاسم",
    name_en: "الاسم اللاتيني",
    short: "الاسم المختصر",
    title: "العنوان",
    text: "النص",
    note: "الوسم المرافق",
    caveat: "تنويه الصدق",
    status: "الحالة",
    kind: "النوع",
    cls: "نغمة البطاقة",
    id: "المعرّف",
    source_id: "معرّف المصدر",
    sheet: "الورقة",
    anchor: "المرساة",
    formula: "المعادلة",
    formula_version: "نسخة المعادلة",
    inputs: "مدخلات المعادلة",
    template_version: "نسخة القالب",
    sha256: "بصمة التحقق",
    imported_at: "تاريخ الاستيراد",
    private: "ملف خاص لا يُنشر",
    rows: "الصفوف",
    items: "البنود",
    sections: "الأقسام",
    pillars: "الركائز",
    initiatives: "المبادرات",
    kpis: "مؤشرات الأداء",
    pillar_id: "الركيزة التابعة",
    start: "تاريخ البدء",
    end: "تاريخ الانتهاء",
    baseline: "خط الأساس",
    target: "المستهدف",
    current: "القيمة الحالية",
    current_note: "وسم القيمة الحالية",
    pct: "علم الصيغة النسبية",
    type: "التصنيف",
    demand: "الطلب",
    building: "رخص البناء",
    operational: "الرخص التشغيلية",
    beds: "الأسرّة",
    monitors: "المراقبون",
    violations: "المخالفات",
    visits: "الزيارات",
    closures: "الإغلاقات",
    count: "العدد",
    iso: "الشهر (ترميز)",
    conservative: "السيناريو المتحفظ",
    base: "السيناريو الأساس",
    optimistic: "السيناريو المتفائل",
    sector: "القطاع",
    licensing: "سلسلة التراخيص",
    monitoring: "سلسلة الرقابة",
    blue: "الياقات الزرقاء",
    white: "الياقات البيضاء",
    ranking_note: "وسم الترتيب",
    sample_label: "وسم العينة",
    map_disclaimer: "تنويه الخريطة",
    comparison_qualifier: "قيد المقارنة",
    baseline_label: "تسمية خط الأساس",
    monitoring_period_label: "تسمية فترة الرصد",
    monitoring_period_start: "بداية فترة الرصد",
    monitoring_period_end: "نهاية فترة الرصد",
    data_as_of: "البيانات حتى",
    calculation_date: "تاريخ الاحتساب",
    presentation_date: "تاريخ العرض",
    presentation_date_needs_confirmation: "تاريخ العرض بحاجة تأكيد",
    entity: "الجهة",
    notes: "ملاحظات الإصدار",
    source: "المصدر المعلن",
    status_rule: "قاعدة اشتقاق الحالة",
    status_vocabulary: "مفردات الحالة",
    weights_rule: "قاعدة الأوزان",
    required_pillars: "عدد الركائز المطلوب",
    gates_passed: "الفحوص المجتازة",
    gates_total: "إجمالي الفحوص",
    inspector_level_records: "سجلات مستوى المفتشين",
    hotspots: "نقاط التركّز",
    supply: "لوحة العرض والطلب",
    control: "لوحة الرقابة",
    initiatives_panel: "لوحة المبادرات",
  });

  /** أسماء أنواع التغيير */
  const KIND_LABEL = Object.freeze({
    added: "إضافة",
    removed: "حذف",
    changed: "تغيير",
  });

  /** درجات الخطورة بترتيب تنازلي — الترتيب هو معنى المقارنة */
  const SEVERITY_ORDER = Object.freeze(["high", "medium", "low"]);
  const SEVERITY_LABEL = Object.freeze({
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
  });

  /**
   * الحقول التي تحمل وسم صدق — تغيّرها لا يمر مرور الكرام.
   * المفتاح الأخير في المسار يكفي: هذه الأسماء لا تتكرر في المخطط لغير معناها.
   */
  const HONESTY_KEYS = Object.freeze([
    "caveat", "note", "current_note", "ranking_note", "map_disclaimer",
    "sample_label", "status", "source", "status_rule", "weights_rule",
    "comparison_qualifier", "baseline_label", "disclaimer", "private",
  ]);

  /** مجموعات كل ما فيها موسوم بطبيعته (قيم مورّدة أو محجورة أو استرشادية) */
  const HONESTY_GROUPS = Object.freeze([
    "compliance", "scenarios", "coverage_target_indicative",
    "quarantine", "quarantine_resolved",
  ]);

  /** حدود المشي العميق — حارس ضد بنية مرضية لا لتقييد البيانات الحقيقية */
  const MAX_DEPTH = 14;

  /* ══════════════════════════════════════════════════════════════════════════
     2) أدوات القيم النقية
     ══════════════════════════════════════════════════════════════════════════ */

  function isPlainObject(v) {
    return !!v && typeof v === "object" && !Array.isArray(v);
  }

  /** تصنيف القيمة لأغراض العرض والمقارنة */
  function valueKind(v) {
    if (v === undefined) return "missing";
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    const t = typeof v;
    if (t === "object") return "object";
    return t; // number | string | boolean
  }

  /**
   * تسلسل حتمي مستقل عن ترتيب المفاتيح — أساس المقارنة العميقة.
   * `undefined` تأخذ رمزاً خاصاً كي لا تساوي `null` (الفرق بينهما جوهري هنا:
   * الأول «الحقل غير موجود» والثاني «الحقل موجود وقيمته غير محددة»).
   */
  function stableStringify(v) {
    if (v === undefined) return "\u0000undefined";
    if (v === null) return "null";
    const t = typeof v;
    if (t === "number") return Number.isFinite(v) ? String(v) : "\u0000num:" + String(v);
    if (t === "boolean") return v ? "true" : "false";
    if (t === "string") return JSON.stringify(v);
    if (Array.isArray(v)) {
      let out = "[";
      for (let i = 0; i < v.length; i++) {
        if (i) out += ",";
        out += stableStringify(v[i]);
      }
      return out + "]";
    }
    if (t === "object") {
      const keys = Object.keys(v).sort();
      let out = "{";
      for (let i = 0; i < keys.length; i++) {
        if (i) out += ",";
        out += JSON.stringify(keys[i]) + ":" + stableStringify(v[keys[i]]);
      }
      return out + "}";
    }
    return "\u0000" + t;
  }

  /** مساواة عميقة مستقلة عن ترتيب المفاتيح */
  function deepEqual(a, b) {
    return stableStringify(a) === stableStringify(b);
  }

  const round1 = (n) => Math.round(n * 10) / 10;

  /* ══════════════════════════════════════════════════════════════════════════
     3) أدوات المسار النقطي
     ──────────────────────────────────────────────────────────────────────────
     شكل المسار: `strategy.initiatives[1.1].status` — النقاط للمفاتيح
     والأقواس المعقوفة لعناصر المصفوفات (معرّف العنصر إن وُجد، وإلا فهرسه).
     ══════════════════════════════════════════════════════════════════════════ */

  /** ضم مفتاح إلى مسار */
  function joinKey(path, key) {
    return path ? path + "." + key : String(key);
  }

  /** ضم رمز عنصر مصفوفة إلى مسار */
  function joinIndex(path, token) {
    return (path || "") + "[" + token + "]";
  }

  /** تفكيك مسار إلى مقاطع {kind:"key"|"item", token} */
  function splitPath(path) {
    const out = [];
    if (!path) return out;
    const re = /([^.[\]]+)|\[([^\]]*)\]/g;
    let m;
    while ((m = re.exec(String(path))) !== null) {
      if (m[2] !== undefined) out.push({ kind: "item", token: m[2] });
      else out.push({ kind: "key", token: m[1] });
    }
    return out;
  }

  /** المجموعة = المفتاح الأعلى في المسار */
  function groupOf(path) {
    const segs = splitPath(path);
    return segs.length ? String(segs[0].token) : "";
  }

  /** آخر مقطع نصاً (للعرض المختصر) */
  function lastSegment(path) {
    const segs = splitPath(path);
    if (!segs.length) return "";
    const s = segs[segs.length - 1];
    return s.kind === "item" ? "[" + s.token + "]" : String(s.token);
  }

  /** آخر مفتاح فعلي (يتخطى مقاطع العناصر) — أساس قواعد الوسوم والتنسيق */
  function lastKey(path) {
    const segs = splitPath(path);
    for (let i = segs.length - 1; i >= 0; i--) {
      if (segs[i].kind === "key") return String(segs[i].token);
    }
    return "";
  }

  /** مسار الحاوية (المسار بلا مقطعه الأخير) */
  function parentPath(path) {
    const segs = splitPath(path);
    if (segs.length <= 1) return "";
    let out = "";
    for (let i = 0; i < segs.length - 1; i++) {
      out = segs[i].kind === "item" ? joinIndex(out, segs[i].token) : joinKey(out, segs[i].token);
    }
    return out;
  }

  /**
   * قراءة قيمة من جذر عبر مسار نقطي.
   * مقاطع العناصر تُطابَق أولاً بالمعرّف ثم بالفهرس الرقمي — كي يعمل المسار
   * نفسه على الإصدارين حتى لو اختلف ترتيب العناصر بينهما.
   */
  function resolveAt(root, path) {
    let cur = root;
    for (const seg of splitPath(path)) {
      if (cur == null) return undefined;
      if (seg.kind === "key") {
        if (!isPlainObject(cur) && !Array.isArray(cur)) return undefined;
        cur = cur[seg.token];
        continue;
      }
      if (!Array.isArray(cur)) return undefined;
      let next;
      for (const el of cur) {
        if (isPlainObject(el) && el.id != null && String(el.id) === seg.token) { next = el; break; }
      }
      if (next === undefined && /^\d+$/.test(seg.token)) next = cur[Number(seg.token)];
      cur = next;
    }
    return cur;
  }

  /** اسم بشري لكائن إن حمله (بالأولوية: الاسم ثم التسمية ثم العنوان) */
  function objectName(v) {
    if (!isPlainObject(v)) return null;
    for (const k of ["name", "label", "title"]) {
      if (typeof v[k] === "string" && v[k].trim()) return v[k].trim();
    }
    return null;
  }

  /**
   * تسمية عربية كاملة للمسار: «المقاييس الخام ← إجمالي الطلب ← القيمة».
   * تُفضَّل أسماء البيانات نفسها (name/label/title) على قاموس المفاتيح، لأن
   * المحرِّر يعرف «ركيزة 1: زيادة المعروض المرخص» ولا يعرف `p1`.
   * @param {String} path
   * @param {Object} root   الجذر المفضَّل (المسودة عادةً)
   * @param {Object} [alt]  جذر بديل يُستشار حين يغيب المسار من الأول (الحذف)
   */
  function pathLabel(path, root, alt) {
    const segs = splitPath(path);
    if (!segs.length) return "";
    const parts = [];
    let prefix = "";
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      prefix = seg.kind === "item"
        ? joinIndex(prefix, seg.token)
        : joinKey(prefix, seg.token);
      let here = resolveAt(root, prefix);
      if (here === undefined && alt) here = resolveAt(alt, prefix);
      if (seg.kind === "item") {
        const nm = objectName(here);
        parts.push(nm || ("العنصر " + fmt.iso(String(seg.token))));
        continue;
      }
      if (i === 0) {
        parts.push(GROUP_LABEL[seg.token] || String(seg.token));
        continue;
      }
      const nm = objectName(here);
      parts.push(nm || KEY_LABEL[seg.token] || String(seg.token));
    }
    return parts.join(" ← ");
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) الاستثناءات
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * قائمة الاستثناءات الفعلية.
   * `opts.ignore` **تضيف** إلى الافتراضي (العقد: «قابلة للتوسعة»)؛
   * و`opts.replaceIgnore = true` وحدها تستبدله — للاختبار أو لمقارنة تشخيصية
   * يريد فيها المسؤول رؤية كل شيء بما فيه بصمة التحقق.
   */
  function buildIgnore(opts) {
    const o = opts || {};
    const extra = Array.isArray(o.ignore) ? o.ignore.map(String) : [];
    if (o.replaceIgnore === true) return extra.slice();
    return DEFAULT_IGNORE.concat(extra.filter((p) => DEFAULT_IGNORE.indexOf(p) === -1));
  }

  /** هل المسار (أو أحد أسلافه) مستثنى؟ */
  function isIgnored(path, list) {
    if (!path) return false;
    for (const ig of list) {
      if (path === ig) return true;
      if (path.length > ig.length && path.indexOf(ig) === 0) {
        const nxt = path.charAt(ig.length);
        if (nxt === "." || nxt === "[") return true;
      }
    }
    return false;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) المشي العميق — قلب المقارنة
     ══════════════════════════════════════════════════════════════════════════ */

  /** هل كل عناصر المصفوفة كائنات تحمل مفتاح المطابقة؟ */
  function keyedBy(arr, idKey) {
    if (!Array.isArray(arr) || !arr.length) return false;
    return arr.every((el) => isPlainObject(el) && el[idKey] != null);
  }

  /** مفتاح المطابقة الصالح لمصفوفتين، أو null فتُطابقان بالفهرس */
  function matchKeyFor(a, b, idKeys) {
    for (const k of idKeys) {
      const aOk = keyedBy(a, k);
      const bOk = keyedBy(b, k);
      if ((aOk && bOk) || (aOk && (!b || !b.length)) || (bOk && (!a || !a.length))) return k;
    }
    return null;
  }

  function makeEntry(path, kind, from, to) {
    return {
      path,
      kind,
      from,
      to,
      group: groupOf(path),
      key: lastKey(path),
      segment: lastSegment(path),
      parent: parentPath(path),
    };
  }

  /** مشي مصفوفتين مطابقتين بالمعرّف */
  function walkKeyedArrays(path, a, b, idKey, ctx, depth) {
    const bIndex = Object.create(null);
    for (const el of b) bIndex[String(el[idKey])] = el;
    const seen = Object.create(null);

    for (const el of a) {
      const id = String(el[idKey]);
      seen[id] = true;
      const child = joinIndex(path, id);
      if (!(id in bIndex)) {
        if (!isIgnored(child, ctx.ignore)) ctx.out.push(makeEntry(child, "removed", el, undefined));
        continue;
      }
      walk(child, el, bIndex[id], ctx, depth + 1);
    }
    for (const el of b) {
      const id = String(el[idKey]);
      if (seen[id]) continue;
      const child = joinIndex(path, id);
      if (!isIgnored(child, ctx.ignore)) ctx.out.push(makeEntry(child, "added", undefined, el));
    }
  }

  /** مشي مصفوفتين بالفهرس */
  function walkIndexedArrays(path, a, b, ctx, depth) {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const child = joinIndex(path, i);
      if (i >= a.length) {
        if (!isIgnored(child, ctx.ignore)) ctx.out.push(makeEntry(child, "added", undefined, b[i]));
        continue;
      }
      if (i >= b.length) {
        if (!isIgnored(child, ctx.ignore)) ctx.out.push(makeEntry(child, "removed", a[i], undefined));
        continue;
      }
      walk(child, a[i], b[i], ctx, depth + 1);
    }
  }

  /** مشي كائنين: اتحاد المفاتيح بترتيب الأساس ثم الجديدة */
  function walkObjects(path, a, b, ctx, depth) {
    const keys = Object.keys(a);
    for (const k of Object.keys(b)) if (keys.indexOf(k) === -1) keys.push(k);
    for (const k of keys) {
      walk(joinKey(path, k), a[k], b[k], ctx, depth + 1);
    }
  }

  /** المشي الموحّد */
  function walk(path, a, b, ctx, depth) {
    if (isIgnored(path, ctx.ignore)) return;
    if (depth > ctx.maxDepth) {
      if (!deepEqual(a, b)) ctx.out.push(makeEntry(path, "changed", a, b));
      return;
    }
    const aMissing = a === undefined;
    const bMissing = b === undefined;
    if (aMissing && bMissing) return;
    if (aMissing) { ctx.out.push(makeEntry(path, "added", undefined, b)); return; }
    if (bMissing) { ctx.out.push(makeEntry(path, "removed", a, undefined)); return; }

    const ka = valueKind(a);
    const kb = valueKind(b);

    if (ka === "object" && kb === "object") {
      if (ctx.seen.has(a) || ctx.seen.has(b)) return;  // حارس الدوران
      ctx.seen.add(a); ctx.seen.add(b);
      walkObjects(path, a, b, ctx, depth);
      return;
    }
    if (ka === "array" && kb === "array") {
      if (ctx.seen.has(a) || ctx.seen.has(b)) return;
      ctx.seen.add(a); ctx.seen.add(b);
      const idKey = matchKeyFor(a, b, ctx.idKeys);
      if (idKey) walkKeyedArrays(path, a, b, idKey, ctx, depth);
      else walkIndexedArrays(path, a, b, ctx, depth);
      return;
    }
    if (!deepEqual(a, b)) ctx.out.push(makeEntry(path, "changed", a, b));
  }

  /**
   * المقارنة العميقة — العقد §11.2.
   * @param {Object} base  الإصدار المنشور (المرجع)
   * @param {Object} other المسودة (المقارَنة)
   * @param {Object} [opts] { ignore:[], replaceIgnore:Boolean, idKeys:[],
   *                          maxDepth:Number }
   * @returns {Array} [{ path, kind, from, to, group, key, segment, parent }]
   *                  مرتبة بترتيب المشي (وهو ترتيب عقد البيانات نفسه).
   */
  function diff(base, other, opts) {
    const o = opts || {};
    const ctx = {
      out: [],
      ignore: buildIgnore(o),
      idKeys: Array.isArray(o.idKeys) && o.idKeys.length ? o.idKeys.map(String) : ["id"],
      maxDepth: Number.isFinite(o.maxDepth) ? o.maxDepth : MAX_DEPTH,
      seen: new Set(),
    };
    if (base === undefined && other === undefined) return ctx.out;
    walk("", base === undefined ? {} : base, other === undefined ? {} : other, ctx, 0);
    return ctx.out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) تنسيق القيم — كل رقم عبر RH.core.fmt، والوحدة من البيانات لا من الحدس
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * تلميح التنسيق لمسار: من أين نعرف أن 43.1 نسبة و1,420,000 سرير؟
   * من الكائن الحاوي نفسه: `{value, unit:"٪"}` أو `{baseline, target, pct:true}`.
   * لا حدس من اسم المفتاح إلا حين يصرّح المخطط (kpis: pct علمٌ لا قيمة).
   */
  function numberHint(path, root, alt) {
    const key = lastKey(path);
    const pp = parentPath(path);
    let parent = resolveAt(root, pp);
    if (parent === undefined && alt) parent = resolveAt(alt, pp);
    if (!isPlainObject(parent)) return { pct: false, scale: 1, unit: null };

    if (typeof parent.unit === "string" && parent.unit.trim() === "٪") {
      return { pct: true, scale: 1, unit: "٪" };
    }
    if (parent.pct === true
      && (key === "baseline" || key === "target" || key === "current")) {
      return { pct: true, scale: 100, unit: "٪" };
    }
    if (typeof parent.unit === "string" && parent.unit.trim()) {
      return { pct: false, scale: 1, unit: parent.unit.trim() };
    }
    return { pct: false, scale: 1, unit: null };
  }

  const COUNT_FORMS_ITEM = Object.freeze({
    zero: "قائمة فارغة", one: "عنصر واحد", two: "عنصران",
    few: "عناصر", many: "عنصراً", hundred: "عنصر",
  });
  const COUNT_FORMS_FIELD = Object.freeze({
    zero: "كائن بلا حقول", one: "حقل واحد", two: "حقلان",
    few: "حقول", many: "حقلاً", hundred: "حقل",
  });
  const COUNT_FORMS_CHANGE = Object.freeze({
    zero: "لا فروق", one: "فرق واحد", two: "فرقان",
    few: "فروق", many: "فرقاً", hundred: "فرق",
  });

  /** عدد الفروق بتطابق العدد والمعدود — يستعمله الملخص وعدّادات المجموعات */
  function changeCount(n) {
    return fmt.countNoun(n, COUNT_FORMS_CHANGE);
  }

  /**
   * نص عرض قيمة واحدة.
   * @param {*} v
   * @param {Object} [hint] مخرج numberHint
   */
  function formatValue(v, hint) {
    const hh = hint || { pct: false, scale: 1, unit: null };
    const kind = valueKind(v);
    if (kind === "missing") return "(غير موجود)";
    if (kind === "null") return "(غير محدد)";
    if (kind === "boolean") return v ? "نعم" : "لا";
    if (kind === "number") {
      if (!Number.isFinite(v)) return "(قيمة غير رقمية)";
      if (hh.pct) return fmt.pct(hh.scale === 100 ? round1(v * 100) : v);
      if (hh.unit) {
        return Number.isInteger(v)
          ? fmt.unitAfter(v, hh.unit)
          : fmt.dec1(v) + fmt.NBSP + hh.unit;
      }
      return Number.isInteger(v) ? fmt.int(v) : fmt.dec1(v);
    }
    if (kind === "string") {
      const s = String(v);
      return s.trim() ? s : "(نص فارغ)";
    }
    if (kind === "array") return fmt.countNoun(v.length, COUNT_FORMS_ITEM);
    if (kind === "object") {
      const n = Object.keys(v).length;
      const nm = objectName(v);
      return nm ? nm + " — " + fmt.countNoun(n, COUNT_FORMS_FIELD)
        : fmt.countNoun(n, COUNT_FORMS_FIELD);
    }
    return String(v);
  }

  /** نص كامل للقيمة في لوحة التفصيل (كائنات ومصفوفات بصيغة مقروءة) */
  function formatValueFull(v) {
    const kind = valueKind(v);
    if (kind === "missing") return "(غير موجود في هذا الإصدار)";
    if (kind === "null") return "null";
    if (kind === "object" || kind === "array") {
      try { return JSON.stringify(v, null, 2); } catch (_e) { return String(v); }
    }
    return String(v);
  }

  /**
   * فرق رقمي بين قيمتين — null حين لا تكون كلتاهما رقماً منتهياً.
   * `relative` تبقى null حين يكون الأساس صفراً (القسمة على صفر ليست «∞٪»
   * بل «لا نسبة» — والصدق أن نقولها لا أن نخترع رقماً).
   */
  function numericDelta(from, to) {
    if (typeof from !== "number" || typeof to !== "number") return null;
    if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
    const abs = to - from;
    const relative = from === 0 ? null : (abs / Math.abs(from)) * 100;
    return {
      abs,
      relative: relative == null ? null : round1(relative),
      direction: abs > 0 ? "up" : abs < 0 ? "down" : "flat",
    };
  }

  /** نص الفرق الرقمي جاهزاً للعرض: «▲ 12,000 (‎+0.8٪)» */
  function deltaText(delta, hint) {
    if (!delta) return "";
    const hh = hint || { pct: false, scale: 1, unit: null };
    const arrow = delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "=";
    const mag = Math.abs(delta.abs);
    let magText;
    if (hh.pct) magText = fmt.pct(hh.scale === 100 ? round1(mag * 100) : round1(mag));
    else if (Number.isInteger(mag)) magText = fmt.int(mag);
    else magText = fmt.dec1(mag);
    let out = arrow + fmt.NBSP + magText;
    if (hh.unit && !hh.pct) out += fmt.NBSP + hh.unit;
    if (delta.relative != null && delta.relative !== 0) {
      out += fmt.NBSP + "(" + fmt.pct(Math.abs(delta.relative)) + ")";
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) وسوم الصدق والخطورة
     ══════════════════════════════════════════════════════════════════════════ */

  /** هل هذا المسار يحمل وسم صدق (أو يقع كلياً في مجموعة موسومة)؟ */
  function isHonestyPath(path) {
    const g = groupOf(path);
    if (HONESTY_GROUPS.indexOf(g) !== -1) return true;
    const k = lastKey(path);
    if (HONESTY_KEYS.indexOf(k) !== -1) return true;
    // القيم الحالية للمؤشرات: غيابها معلَن بصدق، وظهورها فجأةً حدث موسوم
    if (g === "strategy" && k === "current" && path.indexOf("kpis") !== -1) return true;
    return false;
  }

  /** تسمية حالة بيانات — المفردات الست الأولى منقولة حرفياً عن
      `RH.report.pages.STATUS_LABEL` كي لا تختلف تسمية الحالة نفسها بين
      الإدارة والموجز، والباقي حالات دورة حياة اللقطة. */
  const STATUS_LABEL = Object.freeze({
    pending_methodology: "بانتظار اعتماد المنهجية",
    supplied_unvalidated: "قيمة مورّدة غير معتمدة",
    indicative_not_approved: "استرشادية غير معتمدة",
    pending_approval: "بانتظار الاعتماد",
    approved_brief: "معتمدة للعرض",
    approved_source_mirror: "منقولة حرفياً عن مصدر معتمد",
    quarantined: "محجوزة",
    resolved: "معالَجة",
    published: "منشور",
    draft: "مسودة",
  });
  const statusLabel = (s) => STATUS_LABEL[s] || (s == null ? "—" : String(s));

  function pushUnique(list, text) {
    if (typeof text !== "string") return;
    const t = text.trim();
    if (!t) return;
    if (list.indexOf(t) === -1) list.push(t);
  }

  /**
   * وسوم الصدق الملازمة لمسار — **نصوصها من البيانات حرفياً** لا من صياغة
   * جديدة. تُعرض مع كل صف يمسّ قيمة موسومة، فلا تظهر 81.6٪ عارية أبداً.
   * @param {String} path
   * @param {Object} base   الإصدار المنشور
   * @param {Object} other  المسودة
   * @returns {Array<String>}
   */
  function caveatsFor(path, base, other) {
    const out = [];
    const root = other || base || {};
    const alt = base || {};
    const pick = (fn) => {
      let v;
      try { v = fn(root); } catch (_e) { v = undefined; }
      if (v === undefined || v === null || v === "") {
        try { v = fn(alt); } catch (_e) { v = undefined; }
      }
      return v;
    };
    const g = groupOf(path);
    const k = lastKey(path);

    if (g === "compliance") {
      pushUnique(out, pick((r) => r.compliance && r.compliance.note));
      const st = pick((r) => r.compliance && r.compliance.status);
      if (st) pushUnique(out, "حالة القيمة: " + statusLabel(st));
    }
    if (g === "scenarios") {
      pushUnique(out, pick((r) => r.scenarios && r.scenarios.caveat));
      const st = pick((r) => r.scenarios && r.scenarios.status);
      if (st) pushUnique(out, "حالة القيمة: " + statusLabel(st));
    }
    if (g === "coverage_target_indicative") {
      pushUnique(out, pick((r) => r.coverage_target_indicative
        && r.coverage_target_indicative.note));
      const st = pick((r) => r.coverage_target_indicative
        && r.coverage_target_indicative.status);
      if (st) pushUnique(out, "حالة القيمة: " + statusLabel(st));
    }
    if (g === "neighbourhoods") {
      pushUnique(out, pick((r) => r.neighbourhoods && r.neighbourhoods.label));
      pushUnique(out, pick((r) => r.neighbourhoods && r.neighbourhoods.ranking_note));
      pushUnique(out, pick((r) => r.meta && r.meta.sample_label));
    }
    if (g === "quarantine" || g === "quarantine_resolved") {
      pushUnique(out, "بيانات محجورة لا تدخل الإجماليات المعتمدة — تُعرض في الملاحق بوسمها");
    }
    if (g === "strategy") {
      if (path.indexOf("kpis") !== -1 && (k === "current" || k === "current_note")) {
        pushUnique(out, pick((r) => {
          const list = (r.strategy && r.strategy.kpis) || [];
          for (const kp of list) if (kp.current_note) return kp.current_note;
          return undefined;
        }));
      }
      pushUnique(out, pick((r) => r.strategy && r.strategy.source));
      pushUnique(out, pick((r) => r.strategy && r.strategy.note));
    }
    if (g === "next_steps") {
      pushUnique(out, pick((r) => r.next_steps && r.next_steps.note));
    }
    if (g === "insight_panels") {
      pushUnique(out, pick((r) => r.insight_panels && r.insight_panels.note));
    }
    if (g === "meta" && (k === "map_disclaimer" || k === "sample_label")) {
      pushUnique(out, "وسم يلازم كل ظهور للقيمة في العرض والموجز والملاحق");
    }
    return out;
  }

  /**
   * درجة خطورة الفرق — القاعدة حتمية ومختبرة:
   *   • كل ما يمسّ وسم صدق                     → عالية
   *   • كل حذف                                  → عالية (غياب حقل منشور خلل حتى يُثبت العكس)
   *   • تغيّر رقمي بنسبة ≥10٪                    → عالية
   *   • تغيّر رقمي بنسبة ≥1٪، أو إضافة، أو تغيّر بنيوي → متوسطة
   *   • ما تبقى (نصوص وتسميات وفروق رقمية ضئيلة) → منخفضة
   */
  function severityOf(entry) {
    if (!entry) return "low";
    if (isHonestyPath(entry.path)) return "high";
    if (entry.kind === "removed") return "high";
    const d = numericDelta(entry.from, entry.to);
    if (d) {
      if (d.relative == null) return d.abs === 0 ? "low" : "medium";
      const r = Math.abs(d.relative);
      if (r >= 10) return "high";
      if (r >= 1) return "medium";
      return "low";
    }
    if (entry.kind === "added") return "medium";
    const kf = valueKind(entry.from);
    const kt = valueKind(entry.to);
    if (kf === "object" || kf === "array" || kt === "object" || kt === "array") return "medium";
    if (kf !== kt) return "medium";
    return "low";
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) التزيين: كل ما يحتاجه العرض والبحث محسوب مرة واحدة
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * تطبيع نص للبحث الحر.
   * يُفوَّض إلى `RH.viz.geoutils.normalizeAr` وهو المصدر الوحيد لمنطق التطبيع
   * العربي في هذا البناء (عقد §10: ممنوع نسخ منطق تطبيع جديد في ملفات
   * الميزات). عند غيابه — بناء جزئي لا غير — نكتفي بتطبيع محايد (قصّ ومسافات
   * وخفض لاتيني) دون ادعاء تطبيع عربي ناقص.
   */
  function normalizeSearch(s) {
    if (s == null) return "";
    const raw = String(s);
    const gu = RH.viz && RH.viz.geoutils;
    if (gu && typeof gu.normalizeAr === "function") return gu.normalizeAr(raw);
    return raw.replace(/\s+/g, " ").trim().toLowerCase();
  }

  /**
   * يضيف لكل فرق ما يحتاجه العرض: تسميته، نصوص قيمه، فرقه الرقمي، خطورته،
   * وسومه، ونص بحثه المطبَّع. نقية — تُختبر بلا DOM.
   */
  function decorate(entries, base, other) {
    const list = Array.isArray(entries) ? entries : [];
    return list.map((e, i) => {
      const hint = numberHint(e.path, other, base);
      const label = pathLabel(e.path, other, base);
      const fromText = formatValue(e.from, hint);
      const toText = formatValue(e.to, hint);
      const delta = numericDelta(e.from, e.to);
      const severity = severityOf(e);
      const honesty = isHonestyPath(e.path);
      /* الوسوم تُحسب لكل فرق لا للموسومة وحدها: قيمة حيٍّ من العينة تحمل وسم
         العينة أينما ظهرت — حتى لو لم ترفع درجة الخطورة. `honesty` تحكم
         الشارة والخطورة، و`caveats` تحكم ما يلازم القيمة. */
      const caveats = caveatsFor(e.path, base, other);
      const groupLabel = GROUP_LABEL[e.group] || e.group;
      const search = normalizeSearch([
        e.path, label, groupLabel, fromText, toText, KIND_LABEL[e.kind] || e.kind,
      ].join(" "));
      return Object.assign({}, e, {
        order: i,
        hint,
        label,
        groupLabel,
        fromText,
        toText,
        fromFull: formatValueFull(e.from),
        toFull: formatValueFull(e.to),
        delta,
        deltaText: deltaText(delta, hint),
        severity,
        severityLabel: SEVERITY_LABEL[severity],
        kindLabel: KIND_LABEL[e.kind] || e.kind,
        honesty,
        caveats,
        search,
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) الملخص والتصفية والترتيب والترقيم
     ══════════════════════════════════════════════════════════════════════════ */

  /** ترتيب مجموعة في عقد البيانات (المجهولة تأتي بعد المعروفة) */
  function groupRank(g) {
    const i = GROUP_ORDER.indexOf(g);
    return i === -1 ? GROUP_ORDER.length : i;
  }

  /**
   * ملخص المقارنة: الإجماليات، وتوزيع الأنواع والخطورات، والمجموعات مرتبة
   * بترتيب عقد البيانات مع عدّاداتها.
   */
  function summarize(entries) {
    const list = Array.isArray(entries) ? entries : [];
    const out = {
      total: list.length,
      added: 0, removed: 0, changed: 0,
      high: 0, medium: 0, low: 0,
      honesty: 0,
      groups: [],
    };
    const byGroup = Object.create(null);
    for (const e of list) {
      if (e.kind === "added") out.added += 1;
      else if (e.kind === "removed") out.removed += 1;
      else out.changed += 1;

      const sev = e.severity || severityOf(e);
      if (sev === "high") out.high += 1;
      else if (sev === "medium") out.medium += 1;
      else out.low += 1;

      const hon = e.honesty === undefined ? isHonestyPath(e.path) : e.honesty;
      if (hon) out.honesty += 1;

      const g = e.group || groupOf(e.path);
      let row = byGroup[g];
      if (!row) {
        row = byGroup[g] = {
          group: g,
          label: GROUP_LABEL[g] || g,
          total: 0, added: 0, removed: 0, changed: 0, high: 0, honesty: 0,
        };
      }
      row.total += 1;
      if (e.kind === "added") row.added += 1;
      else if (e.kind === "removed") row.removed += 1;
      else row.changed += 1;
      if (sev === "high") row.high += 1;
      if (hon) row.honesty += 1;
    }
    out.groups = Object.keys(byGroup)
      .map((g) => byGroup[g])
      .sort((a, b) => groupRank(a.group) - groupRank(b.group)
        || String(a.group).localeCompare(String(b.group)));
    return out;
  }

  /**
   * تصفية الفروق.
   * @param {Array} entries  فروق مزيَّنة (decorate)
   * @param {Object} f { query, kinds:{added,removed,changed}, group, severity,
   *                    honestyOnly }
   */
  function filterEntries(entries, f) {
    const list = Array.isArray(entries) ? entries : [];
    const o = f || {};
    const kinds = o.kinds || null;
    const q = normalizeSearch(o.query || "");
    const terms = q ? q.split(" ").filter(Boolean) : [];
    const group = o.group && o.group !== "all" ? String(o.group) : null;
    const sev = o.severity && o.severity !== "all" ? String(o.severity) : null;
    return list.filter((e) => {
      if (kinds && kinds[e.kind] === false) return false;
      if (group && (e.group || groupOf(e.path)) !== group) return false;
      if (sev && (e.severity || severityOf(e)) !== sev) return false;
      if (o.honestyOnly && !(e.honesty === undefined ? isHonestyPath(e.path) : e.honesty)) {
        return false;
      }
      if (!terms.length) return true;
      const hay = e.search || normalizeSearch(e.path + " " + (e.label || ""));
      for (const t of terms) if (hay.indexOf(t) === -1) return false;
      return true;
    });
  }

  const SEV_RANK = Object.freeze({ high: 0, medium: 1, low: 2 });
  const KIND_RANK = Object.freeze({ removed: 0, changed: 1, added: 2 });

  /**
   * ترتيب الفروق. المفاتيح: "path" (ترتيب عقد البيانات)، "severity"،
   * "kind"، "delta" (المقدار النسبي المطلق)، "group".
   * الترتيب **ثابت**: عند التعادل يُرجَّح ترتيب المشي الأصلي كي لا تقفز
   * الصفوف بين إعادتي رسم متطابقتين.
   */
  function sortEntries(entries, key, dir) {
    const list = (Array.isArray(entries) ? entries : []).slice();
    const sign = dir === "desc" ? -1 : 1;
    const rel = (e) => {
      const d = e.delta || numericDelta(e.from, e.to);
      if (!d) return -1;
      return d.relative == null ? Math.abs(d.abs) : Math.abs(d.relative);
    };
    list.sort((a, b) => {
      let c = 0;
      if (key === "severity") {
        c = SEV_RANK[a.severity || severityOf(a)] - SEV_RANK[b.severity || severityOf(b)];
      } else if (key === "kind") {
        c = KIND_RANK[a.kind] - KIND_RANK[b.kind];
      } else if (key === "delta") {
        c = rel(b) - rel(a);   // الأكبر أولاً بطبيعته
      } else if (key === "group") {
        c = groupRank(a.group || groupOf(a.path)) - groupRank(b.group || groupOf(b.path));
      } else {
        c = groupRank(a.group || groupOf(a.path)) - groupRank(b.group || groupOf(b.path));
        if (c === 0) c = String(a.path).localeCompare(String(b.path));
      }
      if (c !== 0) return c * sign;
      return (a.order || 0) - (b.order || 0);
    });
    return list;
  }

  /**
   * حساب الترقيم. يقصّ رقم الصفحة داخل المدى دائماً، ويُعيد حدود العرض
   * البشرية (from/to تبدأ من 1، وتساويان صفراً حين لا عناصر).
   */
  function paginate(items, page, perPage) {
    const list = Array.isArray(items) ? items : [];
    const size = Number.isFinite(perPage) && perPage > 0 ? Math.floor(perPage) : 25;
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / size));
    let p = Number.isFinite(page) ? Math.floor(page) : 1;
    if (p < 1) p = 1;
    if (p > pages) p = pages;
    const start = (p - 1) * size;
    const slice = list.slice(start, start + size);
    return {
      page: p,
      pages,
      perPage: size,
      total,
      from: total ? start + 1 : 0,
      to: total ? start + slice.length : 0,
      slice,
      hasPrev: p > 1,
      hasNext: p < pages,
    };
  }

  /**
   * نافذة أرقام الصفحات لشريط الترقيم: الأولى والأخيرة دائماً، ونافذة حول
   * الحالية، و`null` مكان الفجوة (تُرسم «…»).
   * قاعدة صغيرة مقصودة: فجوة صفحة **واحدة** تُملأ برقمها لا بـ«…» — «…» تحتل
   * عرض زر وتخفي زراً واحداً، فلا مكسب في إخفائه.
   */
  function pageWindow(page, pages, span) {
    const total = Math.max(1, Math.floor(pages || 1));
    let p = Math.min(Math.max(1, Math.floor(page || 1)), total);
    const s = Number.isFinite(span) && span > 0 ? Math.floor(span) : 2;
    const want = Object.create(null);
    want[1] = true;
    want[total] = true;
    for (let i = p - s; i <= p + s; i++) if (i >= 1 && i <= total) want[i] = true;
    const nums = Object.keys(want).map(Number).sort((a, b) => a - b);
    const out = [];
    let prev = 0;
    for (const n of nums) {
      if (prev && n - prev === 2) out.push(prev + 1);        // فجوة صفحة واحدة
      else if (prev && n - prev > 2) out.push(null);         // فجوة حقيقية
      out.push(n);
      prev = n;
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) التقارير النصية (نسخ/تصدير)
     ══════════════════════════════════════════════════════════════════════════ */

  /** ترويسة التقرير من هوية الإصدارين */
  function reportHeader(base, draft) {
    const lines = [];
    lines.push("مقارنة المسودة بالإصدار المنشور");
    if (base && base.release) {
      lines.push("الإصدار المنشور: " + base.release.id
        + (base.release.published_at
          ? " · نُشر في " + fmt.date(String(base.release.published_at).slice(0, 10))
          : ""));
    }
    if (draft && draft.release) {
      lines.push("المسودة: نسخة " + fmt.int(draft.release.draft_version || 1)
        + (draft.release.base_release_id ? " · من الإصدار " + draft.release.base_release_id : "")
        + (draft.release.updated_by ? " · آخر تحرير " + draft.release.updated_by : ""));
    }
    return lines;
  }

  /** تقرير نصي عربي جاهز للصق في محضر أو بريد */
  function textReport(entries, base, draft) {
    const list = Array.isArray(entries) ? entries : [];
    const sum = summarize(list);
    const lines = reportHeader(base, draft);
    lines.push("إجمالي الفروق: " + changeCount(sum.total)
      + " (إضافة " + fmt.int(sum.added)
      + " · حذف " + fmt.int(sum.removed)
      + " · تغيير " + fmt.int(sum.changed) + ")");
    if (sum.honesty) {
      lines.push("منها " + fmt.int(sum.honesty) + " تمسّ وسوم الصدق — تحتاج مراجعة تحريرية");
    }
    lines.push("");
    let lastGroup = null;
    for (const e of list) {
      const g = e.group || groupOf(e.path);
      if (g !== lastGroup) {
        lastGroup = g;
        lines.push("── " + (e.groupLabel || GROUP_LABEL[g] || g) + " ──");
      }
      const from = e.fromText !== undefined ? e.fromText : formatValue(e.from);
      const to = e.toText !== undefined ? e.toText : formatValue(e.to);
      let line = "• [" + (KIND_LABEL[e.kind] || e.kind) + "] " + (e.label || e.path);
      if (e.kind === "added") line += " ← " + to;
      else if (e.kind === "removed") line += " ← كان: " + from;
      else line += " ← " + from + " ⟵ " + to;
      if (e.deltaText) line += "  " + e.deltaText;
      lines.push(line);
      lines.push("   المسار: " + e.path);
      for (const c of e.caveats || []) lines.push("   وسم: " + c);
    }
    if (!list.length) lines.push("لا فروق في الحقول المقارَنة.");
    return lines.join("\n");
  }

  /** خلية CSV آمنة */
  function csvCell(v) {
    const s = v == null ? "" : String(v);
    return '"' + s.replace(/"/g, '""').replace(/\r?\n/g, " ") + '"';
  }

  /** تصدير CSV — بترتيب الأعمدة نفسه المعروض على الشاشة */
  function csvReport(entries) {
    const list = Array.isArray(entries) ? entries : [];
    const head = ["المجموعة", "المسار", "الحقل", "نوع التغيير", "الخطورة",
      "القيمة المنشورة", "قيمة المسودة", "الفرق", "وسوم الصدق"];
    const rows = [head.map(csvCell).join(",")];
    for (const e of list) {
      rows.push([
        e.groupLabel || GROUP_LABEL[e.group] || e.group,
        e.path,
        e.label || "",
        KIND_LABEL[e.kind] || e.kind,
        SEVERITY_LABEL[e.severity || severityOf(e)] || "",
        e.fromText !== undefined ? e.fromText : formatValue(e.from),
        e.toText !== undefined ? e.toText : formatValue(e.to),
        e.deltaText || "",
        (e.caveats || []).join(" | "),
      ].map(csvCell).join(","));
    }
    return rows.join("\r\n");
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) حالة العرض وتنظيفها
     ══════════════════════════════════════════════════════════════════════════ */

  const VIEW_KEY = "rh.diff.view";

  const state = {
    content: null,
    base: null,
    draft: null,
    all: [],          // فروق مزيَّنة كاملة
    view: [],         // بعد التصفية والترتيب
    hosts: null,      // مراجع عناصر إعادة الرسم الجزئي
    query: "",
    kinds: { added: true, removed: true, changed: true },
    group: "all",
    severity: "all",
    honestyOnly: false,
    sort: "path",
    dir: "asc",
    page: 1,
    perPage: 25,
    collapsed: Object.create(null),
    expanded: Object.create(null),
    timers: [],
    unbind: [],
  };

  /** تفضيلات العرض تُحفظ محلياً — لا بيانات فيها، تفضيل واجهة فقط */
  function loadView() {
    try {
      if (typeof RH.core.storage.local === "undefined") return;
      const raw = RH.core.storage.local.getItem(VIEW_KEY);
      if (!raw) return;
      const v = JSON.parse(raw);
      if (!v || typeof v !== "object") return;
      if (typeof v.sort === "string") state.sort = v.sort;
      if (v.dir === "asc" || v.dir === "desc") state.dir = v.dir;
      if (Number.isFinite(v.perPage) && v.perPage > 0) state.perPage = v.perPage;
      if (typeof v.severity === "string") state.severity = v.severity;
      if (typeof v.honestyOnly === "boolean") state.honestyOnly = v.honestyOnly;
    } catch (_e) { /* تفضيل عرض لا أكثر — الفشل لا يُبلَّغ */ }
  }

  function saveView() {
    try {
      if (typeof RH.core.storage.local === "undefined") return;
      RH.core.storage.local.setItem(VIEW_KEY, JSON.stringify({
        sort: state.sort, dir: state.dir, perPage: state.perPage,
        severity: state.severity, honestyOnly: state.honestyOnly,
      }));
    } catch (_e) { /* مخزن ممتلئ أو محظور — لا أثر وظيفي */ }
  }

  /** تنظيف كامل: مؤقتات ومستمعون — يُستدعى قبل كل رسم وعند مغادرة التبويب */
  function teardown() {
    for (const t of state.timers) clearTimeout(t);
    state.timers.length = 0;
    for (const off of state.unbind) {
      try { off(); } catch (_e) { /* مستمع أُزيل سلفاً */ }
    }
    state.unbind.length = 0;
    state.hosts = null;
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

  /** حارس المغادرة: يفكّ كل شيء حين يغادر المسار تبويب المقارنة */
  function bindRouteGuard() {
    if (typeof window === "undefined" || !window.addEventListener) return;
    const onHash = () => {
      let r = null;
      try { r = RH.core.router.parse(); } catch (_e) { r = null; }
      if (!r || r.kind !== "admin" || r.id !== "diff") teardown();
    };
    window.addEventListener("hashchange", onHash);
    state.unbind.push(() => window.removeEventListener("hashchange", onHash));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) لبنات العرض المشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  function card(title, sub) {
    const el = h("div", { class: "adm-card adf-card" });
    if (title) el.appendChild(h("h3", {}, title));
    if (sub) el.appendChild(h("div", { class: "sub" }, sub));
    return el;
  }

  function chip(text, cls) {
    return h("span", { class: "adf-chip" + (cls ? " " + cls : "") }, text);
  }

  function num(text) {
    return h("span", { class: "adf-num" }, text);
  }

  function field(label, value, extraCls) {
    return h("div", { class: "adf-field" + (extraCls ? " " + extraCls : "") },
      h("dt", {}, label),
      h("dd", {}, value));
  }

  /** نسخ نص إلى الحافظة مع بديل يعمل عبر file:// */
  function copyText(text) {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard
        && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => RH.admin.shell.toast("نُسخ التقرير إلى الحافظة"),
          () => fallbackCopy(text));
        return true;
      }
    } catch (_e) { /* سياق غير آمن — نسقط إلى البديل */ }
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
      RH.admin.shell.toast(ok ? "نُسخ التقرير إلى الحافظة" : "تعذّر النسخ — استعمل التنزيل");
      return !!ok;
    } catch (_e) {
      RH.admin.shell.toast("تعذّر النسخ في هذا المتصفح — استعمل التنزيل");
      return false;
    }
  }

  /** تنزيل نص كملف — يعمل عبر file:// في المتصفحات الحديثة */
  function downloadText(filename, text, mime) {
    try {
      const blob = new Blob(["\uFEFF" + text], { type: (mime || "text/plain") + ";charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      later(() => { try { URL.revokeObjectURL(url); } catch (_e) { /* حُرِّر سلفاً */ } }, 4000);
      return true;
    } catch (_e) {
      RH.admin.shell.toast("تعذّر التنزيل في هذا المتصفح — استعمل النسخ");
      return false;
    }
  }

  /** اسم المستخدم الحالي لسجل التدقيق */
  function actorName() {
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
    } catch (_e) { /* المخزن غير متاح — التدقيق أثر لا شرط */ }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     13) البطاقات العليا: الهوية، التحذيرات، الملخص
     ══════════════════════════════════════════════════════════════════════════ */

  function identityCard(base, draft) {
    const c = card("هويّتا الطرفين",
      "المقارنة تجري بين الإصدار المنشور الذي يقرؤه المقدِّم الآن، والمسودة المفتوحة للتحرير");
    const rel = base.release || {};
    const dr = draft.release || {};
    c.appendChild(h("div", { class: "adf-identity" },
      h("dl", { class: "adf-side adf-side-base" },
        h("div", { class: "adf-side-head" },
          h("span", { class: "adf-side-kind" }, "الإصدار المنشور"),
          h("span", { class: "st ok" }, "مرجع المقارنة")),
        field("المعرّف", h("span", { class: "adf-mono" }, rel.id || "—")),
        field("تاريخ النشر", rel.published_at
          ? fmt.date(String(rel.published_at).slice(0, 10)) : "—"),
        field("نشره", rel.published_by || "—"),
        field("بصمة التحقق", h("span", { class: "adf-mono" },
          rel.sha256 ? String(rel.sha256).slice(0, 16) + "…" : "—")),
        field("ملاحظات الإصدار", rel.notes || "—"),
      ),
      h("dl", { class: "adf-side adf-side-draft" },
        h("div", { class: "adf-side-head" },
          h("span", { class: "adf-side-kind" }, "المسودة المفتوحة"),
          h("span", { class: "st info" }, "قيد التحرير")),
        field("نسخة المسودة", num(fmt.int(dr.draft_version || 1))),
        field("مفتوحة من", h("span", { class: "adf-mono" }, dr.base_release_id || "—")),
        field("فتحها", dr.started_by || "—"),
        field("آخر تحرير", (dr.updated_by || dr.started_by || "—")
          + (dr.updated_at ? " · " + String(dr.updated_at).replace("T", " ").slice(0, 16) : "")),
        dr.rollback_of
          ? field("مسودة تراجع إلى", h("span", { class: "adf-mono" }, dr.rollback_of))
          : null,
        /* ملاحظات المسودة تُكتب في تبويب النشر لا هنا؛ تُعرض إن وُجدت كي
           يكتمل الطرفان في البطاقة بعد استثنائها من جدول الفروق. */
        field("ملاحظات المسودة", dr.notes || "(تُكتب عند النشر)"),
      ),
    ));
    return c;
  }

  /** تحذير الأساس المختلف: المسودة فُتحت من إصدار غير المنشور حالياً */
  function baseMismatchCard(base, draft) {
    const dr = draft.release || {};
    const rel = base.release || {};
    if (!dr.base_release_id || dr.base_release_id === rel.id) return null;
    const c = card("تنبيه: أساس المسودة ليس الإصدار المنشور الحالي", null);
    c.classList.add("adf-alert");
    c.appendChild(h("p", { class: "adf-note" },
      "فُتحت هذه المسودة من الإصدار ",
      h("span", { class: "adf-mono" }, String(dr.base_release_id)),
      " بينما المنشور الآن هو ",
      h("span", { class: "adf-mono" }, String(rel.id)),
      ". الجدول أدناه يقارنها بالمنشور الحالي — وهو ما سيراه المقدِّم فعلاً — "
      + "لذا قد تظهر فروق لم يُحدثها محرِّر هذه المسودة بل الإصدار الذي نُشر بينهما. "
      + "مسار النشر يرفض هذه الحالة صراحةً (تعارض أساس)، والمخرج فتح مسودة جديدة "
      + "من الإصدار الحالي ونقل التحرير إليها."));
    return c;
  }

  /** بطاقة وسوم الصدق: تُرفع فوق الجدول لأن تغيّرها قرار تحريري لا سطر */
  function honestyCard(entries) {
    const hits = entries.filter((e) => e.honesty);
    if (!hits.length) return null;
    const c = card("تغيّرت وسوم صدق — مراجعة تحريرية مطلوبة",
      "هذه الحقول تحمل الوسوم التي تلازم القيم أينما ظهرت (منهجية الامتثال، "
      + "تنويه السيناريوهات، وسم العينة، حالات «بانتظار الاعتماد»). تغيّرها يغيّر "
      + "ما يقرؤه أمين المنطقة عن حدود الرقم نفسه.");
    c.classList.add("adf-honesty-card");
    const list = h("div", { class: "adf-honesty-list" });
    for (const e of hits.slice(0, 12)) {
      list.appendChild(h("div", { class: "adf-honesty-item" },
        h("div", { class: "adf-honesty-head" },
          chip(e.kindLabel, "k-" + e.kind),
          h("span", { class: "adf-honesty-label" }, e.label)),
        h("div", { class: "adf-honesty-vals" },
          h("span", { class: "adf-val is-from" }, e.fromText),
          h("span", { class: "adf-arrow" }, "⟵"),
          h("span", { class: "adf-val is-to" }, e.toText)),
        e.caveats.length
          ? h("ul", { class: "adf-caveats" },
            e.caveats.map((t) => h("li", {}, t)))
          : null,
      ));
    }
    if (hits.length > 12) {
      list.appendChild(h("div", { class: "adf-more" },
        "و" + changeCount(hits.length - 12) + " أخرى — تظهر كاملة في الجدول أدناه "
        + "عند تفعيل مرشِّح «وسوم الصدق فقط»"));
    }
    c.appendChild(list);
    return c;
  }

  /** عدّاد واحد في شريط الملخص */
  function tally(value, label, cls) {
    return h("div", { class: "adf-tally" + (cls ? " " + cls : "") },
      h("div", { class: "adf-tally-n adf-num" }, value),
      h("div", { class: "adf-tally-l" }, label));
  }

  /** شريط تركيبة محايد: نسب الأنواع الثلاثة بلا لون دلالي من منظومة الرسوم */
  function mixBar(sum) {
    if (!sum.total) return null;
    const seg = (n, cls, label) => {
      if (!n) return null;
      const pctVal = (n / sum.total) * 100;
      return h("span", {
        class: "adf-mix-seg " + cls,
        style: { width: pctVal.toFixed(3) + "%" },
        title: label + ": " + fmt.int(n) + " (" + fmt.pct(round1(pctVal)) + ")",
      });
    };
    return h("div", { class: "adf-mix", role: "img",
      "aria-label": "تركيبة الفروق: إضافة " + fmt.int(sum.added)
        + "، حذف " + fmt.int(sum.removed) + "، تغيير " + fmt.int(sum.changed) },
      seg(sum.added, "is-added", "إضافة"),
      seg(sum.changed, "is-changed", "تغيير"),
      seg(sum.removed, "is-removed", "حذف"));
  }

  function summaryCard(sum) {
    const c = card("خلاصة الفروق",
      "الحقول المقارَنة كلها ما عدا الحقول التشغيلية المعلَنة أسفل الصفحة");
    c.appendChild(h("div", { class: "adf-tallies" },
      tally(fmt.int(sum.total), "إجمالي الفروق", "is-total"),
      tally(fmt.int(sum.added), "إضافة", "is-added"),
      tally(fmt.int(sum.changed), "تغيير", "is-changed"),
      tally(fmt.int(sum.removed), "حذف", "is-removed"),
      tally(fmt.int(sum.high), "خطورة عالية", "is-high"),
      tally(fmt.int(sum.honesty), "تمسّ وسوم الصدق", "is-honesty"),
    ));
    const mb = mixBar(sum);
    if (mb) c.appendChild(mb);
    if (sum.groups.length) {
      c.appendChild(h("div", { class: "adf-groupchips" },
        sum.groups.map((g) => h("button", {
          type: "button",
          class: "adf-groupchip",
          onclick: () => {
            state.group = state.group === g.group ? "all" : g.group;
            state.page = 1;
            syncControls();
            refresh();
          },
          "aria-pressed": state.group === g.group ? "true" : "false",
          title: g.label + ": " + changeCount(g.total),
        }, g.label, h("span", { class: "adf-groupchip-n adf-num" }, fmt.int(g.total)))),
      ));
    }
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     14) شريط الأدوات
     ══════════════════════════════════════════════════════════════════════════ */

  /** التسمية تلفّ عنصر التحكم فتنشأ العلاقة ضمنياً بلا حاجة لمعرّفات مولَّدة */
  function labelledControl(label, control) {
    return h("label", { class: "adf-ctl" },
      h("span", { class: "adf-ctl-l" }, label),
      control);
  }

  function buildToolbar() {
    const search = h("input", {
      type: "search",
      class: "adf-search",
      placeholder: "ابحث في المسارات والتسميات والقيم…",
      "aria-label": "بحث في الفروق",
      value: state.query,
    });
    search.addEventListener("input", () => {
      state.query = search.value;
      state.page = 1;
      if (search._t) clearTimeout(search._t);
      search._t = later(() => refresh(), 140);
    });

    const kindBox = h("div", { class: "adf-kinds", role: "group",
      "aria-label": "أنواع التغيير المعروضة" });
    for (const k of ["added", "changed", "removed"]) {
      const cb = h("input", { type: "checkbox", id: "adf-k-" + k });
      cb.checked = state.kinds[k] !== false;
      cb.addEventListener("change", () => {
        state.kinds[k] = cb.checked;
        state.page = 1;
        refresh();
      });
      kindBox.appendChild(h("label", { class: "adf-kind k-" + k, for: "adf-k-" + k },
        cb, h("span", {}, KIND_LABEL[k])));
    }

    const groupSel = h("select", { class: "adf-select", "aria-label": "حصر بمجموعة" });
    const sevSel = h("select", { class: "adf-select", "aria-label": "حصر بدرجة الخطورة" },
      h("option", { value: "all" }, "كل الدرجات"),
      SEVERITY_ORDER.map((s) => h("option", { value: s }, "خطورة " + SEVERITY_LABEL[s])));
    sevSel.value = state.severity;
    sevSel.addEventListener("change", () => {
      state.severity = sevSel.value;
      state.page = 1;
      saveView();
      refresh();
    });
    groupSel.addEventListener("change", () => {
      state.group = groupSel.value;
      state.page = 1;
      refresh();
    });

    const sortSel = h("select", { class: "adf-select", "aria-label": "ترتيب الفروق" },
      h("option", { value: "path" }, "ترتيب عقد البيانات"),
      h("option", { value: "severity" }, "الأشد خطورة أولاً"),
      h("option", { value: "kind" }, "الحذف ثم التغيير ثم الإضافة"),
      h("option", { value: "delta" }, "الأكبر فرقاً رقمياً"),
      h("option", { value: "group" }, "بالمجموعة"));
    sortSel.value = state.sort;
    sortSel.addEventListener("change", () => {
      state.sort = sortSel.value;
      state.page = 1;
      saveView();
      refresh();
    });

    const perSel = h("select", { class: "adf-select", "aria-label": "عدد الصفوف في الصفحة" },
      [10, 25, 50, 100, 250].map((n) => h("option", { value: String(n) },
        fmt.int(n) + " صفاً")));
    perSel.value = String(state.perPage);
    perSel.addEventListener("change", () => {
      state.perPage = parseInt(perSel.value, 10) || 25;
      state.page = 1;
      saveView();
      refresh();
    });

    const honCb = h("input", { type: "checkbox", id: "adf-honesty-only" });
    honCb.checked = state.honestyOnly;
    honCb.addEventListener("change", () => {
      state.honestyOnly = honCb.checked;
      state.page = 1;
      saveView();
      refresh();
    });

    /* عكس اتجاه الترتيب: يفيد فعلاً في «الأقل خطورة أولاً» عند تصفية سريعة
       للفروق التحريرية الصغيرة قبل نشر عاجل، وفي قلب ترتيب عقد البيانات. */
    const dirBtn = h("button", {
      type: "button", class: "btn btn-line adf-mini adf-dir",
      "aria-pressed": state.dir === "desc" ? "true" : "false",
      title: "عكس اتجاه الترتيب الحالي",
    }, state.dir === "desc" ? "الاتجاه: معكوس" : "الاتجاه: طبيعي");
    dirBtn.addEventListener("click", () => {
      state.dir = state.dir === "desc" ? "asc" : "desc";
      dirBtn.textContent = state.dir === "desc" ? "الاتجاه: معكوس" : "الاتجاه: طبيعي";
      dirBtn.setAttribute("aria-pressed", state.dir === "desc" ? "true" : "false");
      state.page = 1;
      saveView();
      refresh();
    });

    const bar = h("div", { class: "adf-toolbar" },
      h("div", { class: "adf-toolbar-row" },
        h("div", { class: "adf-searchwrap" }, search),
        labelledControl("المجموعة", groupSel),
        labelledControl("الخطورة", sevSel),
        labelledControl("الترتيب", sortSel),
        labelledControl("لكل صفحة", perSel),
      ),
      h("div", { class: "adf-toolbar-row is-second" },
        kindBox,
        h("label", { class: "adf-kind k-honesty", for: "adf-honesty-only" },
          honCb, h("span", {}, "وسوم الصدق فقط")),
        h("div", { class: "adf-spacer" }),
        dirBtn,
        h("button", { type: "button", class: "btn btn-line adf-mini",
          onclick: () => { setAllCollapsed(false); } }, "فتح كل المجموعات"),
        h("button", { type: "button", class: "btn btn-line adf-mini",
          onclick: () => { setAllCollapsed(true); } }, "طيّ كل المجموعات"),
        h("button", { type: "button", class: "btn btn-quiet adf-mini",
          onclick: () => resetFilters() }, "إعادة الضبط"),
      ),
    );

    return { bar, search, groupSel, sevSel, sortSel, perSel, honCb, kindBox, dirBtn };
  }

  /** يعيد ملء قائمة المجموعات من الفروق الحالية مع إبقاء الاختيار صالحاً */
  function fillGroups(sel, sum) {
    RH.core.dom.clear(sel);
    sel.appendChild(h("option", { value: "all" },
      "كل المجموعات (" + fmt.int(sum.total) + ")"));
    for (const g of sum.groups) {
      sel.appendChild(h("option", { value: g.group },
        g.label + " — " + fmt.int(g.total)));
    }
    const exists = sum.groups.some((g) => g.group === state.group);
    if (!exists && state.group !== "all") state.group = "all";
    sel.value = state.group;
  }

  function syncControls() {
    const hs = state.hosts;
    if (!hs) return;
    if (hs.groupSel) hs.groupSel.value = state.group;
    if (hs.sevSel) hs.sevSel.value = state.severity;
    if (hs.sortSel) hs.sortSel.value = state.sort;
    if (hs.perSel) hs.perSel.value = String(state.perPage);
    if (hs.honCb) hs.honCb.checked = state.honestyOnly;
    if (hs.dirBtn) {
      hs.dirBtn.textContent = state.dir === "desc" ? "الاتجاه: معكوس" : "الاتجاه: طبيعي";
      hs.dirBtn.setAttribute("aria-pressed", state.dir === "desc" ? "true" : "false");
    }
  }

  function resetFilters() {
    state.query = "";
    state.kinds = { added: true, removed: true, changed: true };
    state.group = "all";
    state.severity = "all";
    state.honestyOnly = false;
    state.sort = "path";
    state.dir = "asc";
    state.page = 1;
    state.collapsed = Object.create(null);
    state.expanded = Object.create(null);
    saveView();
    const hs = state.hosts;
    if (hs) {
      if (hs.search) hs.search.value = "";
      if (hs.kindBox) {
        for (const cb of hs.kindBox.querySelectorAll("input")) cb.checked = true;
      }
      syncControls();
    }
    refresh();
  }

  function setAllCollapsed(v) {
    const sum = summarize(state.view);
    for (const g of sum.groups) state.collapsed[g.group] = v;
    refresh();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     15) الصفوف والمجموعات
     ══════════════════════════════════════════════════════════════════════════ */

  function valueBlock(cls, caption, text, isMissing) {
    return h("div", { class: "adf-valblock " + cls + (isMissing ? " is-missing" : "") },
      h("div", { class: "adf-valcap" }, caption),
      h("div", { class: "adf-valtext" }, text));
  }

  function detailPanel(e) {
    const box = h("div", { class: "adf-detail" });
    box.appendChild(h("div", { class: "adf-detail-grid" },
      h("div", {},
        h("div", { class: "adf-detail-cap" }, "القيمة في الإصدار المنشور"),
        h("pre", { class: "adf-pre" }, e.fromFull)),
      h("div", {},
        h("div", { class: "adf-detail-cap" }, "القيمة في المسودة"),
        h("pre", { class: "adf-pre" }, e.toFull)),
    ));
    const meta = h("dl", { class: "adf-detail-meta" },
      field("المسار الكامل", h("span", { class: "adf-mono" }, e.path)),
      field("المجموعة", e.groupLabel),
      field("درجة الخطورة", e.severityLabel),
      field("نوع التغيير", e.kindLabel));
    if (e.delta) {
      meta.appendChild(field("الفرق الرقمي", e.deltaText || "—"));
      if (e.delta.relative == null) {
        meta.appendChild(field("النسبة",
          "لا نسبة — القيمة المنشورة صفر فلا مقام للقسمة"));
      }
    }
    box.appendChild(meta);
    if (e.caveats && e.caveats.length) {
      box.appendChild(h("div", { class: "adf-detail-caveats" },
        h("div", { class: "adf-detail-cap" }, "وسوم الصدق الملازمة لهذه القيمة"),
        h("ul", { class: "adf-caveats" }, e.caveats.map((t) => h("li", {}, t)))));
    }
    return box;
  }

  function entryRow(e) {
    const open = !!state.expanded[e.path];
    const toggle = h("button", {
      type: "button",
      class: "adf-rowtoggle",
      "aria-expanded": open ? "true" : "false",
      title: open ? "طيّ التفاصيل" : "عرض القيم كاملة",
    }, open ? "▾" : "◂");

    const row = h("div", {
      class: "adf-row is-" + e.kind + " sev-" + e.severity
        + (e.honesty ? " is-honesty" : "") + (open ? " is-open" : ""),
    },
      h("div", { class: "adf-rowmain" },
        h("div", { class: "adf-rowhead" },
          toggle,
          chip(e.kindLabel, "k-" + e.kind),
          h("span", { class: "adf-rowlabel" }, e.label),
          e.honesty ? chip("وسم صدق", "k-honesty") : null,
          e.severity === "high" ? chip("خطورة عالية", "k-high") : null,
        ),
        h("div", { class: "adf-rowpath adf-mono" }, e.path),
        h("div", { class: "adf-rowvals" },
          valueBlock("is-from", "الإصدار المنشور", e.fromText, e.kind === "added"),
          h("span", { class: "adf-arrow", "aria-hidden": "true" }, "⟵"),
          valueBlock("is-to", "المسودة", e.toText, e.kind === "removed"),
          e.deltaText
            ? h("span", { class: "adf-delta adf-num", title: "الفرق الرقمي" }, e.deltaText)
            : null,
        ),
        /* الوسم الأول يلازم القيمة في الصف المطوي، والباقي في لوحة التفصيل —
           فلا تظهر قيمة موسومة عارية في أي حال. */
        e.caveats.length && !open
          ? h("div", { class: "adf-rowcaveat" },
            e.caveats[0],
            e.caveats.length > 1
              ? h("span", { class: "adf-rowcaveat-more" },
                " (+" + fmt.int(e.caveats.length - 1) + " وسماً في التفاصيل)")
              : null)
          : null,
      ),
    );

    const detailHost = h("div", { class: "adf-detailhost" });
    if (open) detailHost.appendChild(detailPanel(e));
    row.appendChild(detailHost);

    const flip = () => {
      const now = !state.expanded[e.path];
      state.expanded[e.path] = now;
      toggle.setAttribute("aria-expanded", now ? "true" : "false");
      toggle.textContent = now ? "▾" : "◂";
      row.classList.toggle("is-open", now);
      RH.core.dom.clear(detailHost);
      if (now) detailHost.appendChild(detailPanel(e));
    };
    toggle.addEventListener("click", flip);
    return row;
  }

  function groupSection(g, entries) {
    const collapsed = !!state.collapsed[g.group];
    const bodyId = "adf-g-" + String(g.group).replace(/[^A-Za-z0-9_-]/g, "-");
    const head = h("button", {
      type: "button",
      class: "adf-ghead",
      "aria-expanded": collapsed ? "false" : "true",
      "aria-controls": bodyId,
    },
      h("span", { class: "adf-gcaret", "aria-hidden": "true" }, collapsed ? "◂" : "▾"),
      h("span", { class: "adf-gname" }, g.label),
      h("span", { class: "adf-gcount adf-num" }, changeCount(g.total)),
      g.removed ? chip(fmt.int(g.removed) + " حذف", "k-removed") : null,
      g.added ? chip(fmt.int(g.added) + " إضافة", "k-added") : null,
      g.changed ? chip(fmt.int(g.changed) + " تغيير", "k-changed") : null,
      g.honesty ? chip(fmt.int(g.honesty) + " وسم صدق", "k-honesty") : null,
    );
    const body = h("div", { class: "adf-gbody", id: bodyId });
    if (!collapsed) for (const e of entries) body.appendChild(entryRow(e));
    head.addEventListener("click", () => {
      state.collapsed[g.group] = !state.collapsed[g.group];
      refresh();
    });
    return h("section", { class: "adf-group" + (collapsed ? " is-collapsed" : "") },
      head, body);
  }

  function pager(pg) {
    if (pg.pages <= 1) return null;
    const btn = (label, target, opts) => h("button", {
      type: "button",
      class: "adf-page" + ((opts && opts.cls) ? " " + opts.cls : ""),
      disabled: (opts && opts.disabled) ? "" : null,
      "aria-current": (opts && opts.current) ? "page" : null,
      "aria-label": (opts && opts.aria) || null,
      onclick: () => {
        if (opts && opts.disabled) return;
        state.page = target;
        refresh();
        scrollResultsIntoView();
      },
    }, label);

    const nums = pageWindow(pg.page, pg.pages, 2).map((n) => (n == null
      ? h("span", { class: "adf-pagegap", "aria-hidden": "true" }, "…")
      : btn(fmt.int(n), n, { current: n === pg.page, aria: "الصفحة " + n })));

    return h("nav", { class: "adf-pager", "aria-label": "تنقل صفحات الفروق" },
      btn("السابق", pg.page - 1, { disabled: !pg.hasPrev, cls: "is-step" }),
      h("div", { class: "adf-pagenums" }, nums),
      btn("التالي", pg.page + 1, { disabled: !pg.hasNext, cls: "is-step" }),
      h("span", { class: "adf-pageinfo" },
        "الصفوف ", num(fmt.int(pg.from)), "–", num(fmt.int(pg.to)),
        " من ", num(fmt.int(pg.total))),
    );
  }

  function scrollResultsIntoView() {
    const hs = state.hosts;
    if (!hs || !hs.results || !hs.results.scrollIntoView) return;
    try {
      const reduce = typeof window !== "undefined" && window.matchMedia
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      hs.results.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    } catch (_e) { /* متصفح بلا خيارات التمرير */ }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     16) إعادة الرسم الجزئية
     ══════════════════════════════════════════════════════════════════════════ */

  function refresh() {
    const hs = state.hosts;
    if (!hs) return;

    const filtered = filterEntries(state.all, {
      query: state.query,
      kinds: state.kinds,
      group: state.group,
      severity: state.severity,
      honestyOnly: state.honestyOnly,
    });
    state.view = sortEntries(filtered, state.sort, state.dir);

    const pg = paginate(state.view, state.page, state.perPage);
    state.page = pg.page;

    RH.core.dom.clear(hs.results);
    RH.core.dom.clear(hs.pager);
    RH.core.dom.clear(hs.status);

    hs.status.appendChild(h("span", {},
      "معروض ", num(fmt.int(pg.total)), " من ", num(fmt.int(state.all.length)),
      " فرقاً بعد التصفية"));
    if (state.query) {
      hs.status.appendChild(h("span", { class: "adf-statusq" },
        " · البحث: ", h("b", {}, state.query)));
    }

    if (!state.all.length) {
      hs.results.appendChild(h("div", { class: "adf-empty" },
        h("h4", {}, "لا فروق بين المسودة والإصدار المنشور"),
        h("p", {}, "كل الحقول المقارَنة متطابقة. الحقول التشغيلية (بصمة التحقق، "
          + "أختام الزمن، رقم نسخة المسودة) مستثناة كما هو معلَن أسفل الصفحة، "
          + "فتطابق المحتوى هنا لا يعني تطابق اللقطتين حرفياً.")));
      return;
    }
    if (!pg.total) {
      hs.results.appendChild(h("div", { class: "adf-empty" },
        h("h4", {}, "لا نتائج لهذه التصفية"),
        h("p", {}, "لا فرق يطابق المرشِّحات الحالية من بين "
          + changeCount(state.all.length) + " موجودة."),
        h("button", { type: "button", class: "btn btn-line",
          onclick: () => resetFilters() }, "إعادة ضبط المرشِّحات")));
      return;
    }

    // تجميع صفوف الصفحة الحالية بمجموعاتها، بترتيب ظهورها بعد الفرز
    const order = [];
    const buckets = Object.create(null);
    for (const e of pg.slice) {
      const g = e.group;
      if (!buckets[g]) { buckets[g] = []; order.push(g); }
      buckets[g].push(e);
    }
    const pageSummary = summarize(pg.slice);
    const gInfo = Object.create(null);
    for (const g of pageSummary.groups) gInfo[g.group] = g;

    for (const g of order) {
      hs.results.appendChild(groupSection(gInfo[g], buckets[g]));
    }

    const p = pager(pg);
    if (p) hs.pager.appendChild(p);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     17) بطاقات الذيل: الإجراءات والحقول المستثناة
     ══════════════════════════════════════════════════════════════════════════ */

  function actionsCard(base, draft) {
    const c = card("إجراءات المراجعة",
      "تقرير الفروق ينفع محضر الاعتماد قبل النشر — والتسجيل في سجل التدقيق "
      + "يثبت أن المقارنة رُوجعت فعلاً لا أنها كانت متاحة فقط");
    c.appendChild(h("div", { class: "adf-actions" },
      h("button", {
        type: "button", class: "btn btn-line",
        onclick: () => {
          const text = textReport(state.view.length ? state.view : state.all, base, draft);
          if (copyText(text)) {
            auditAction("diff.copy_report", {
              entries: state.view.length, total: state.all.length,
            });
          }
        },
      }, "نسخ تقرير الفروق"),
      h("button", {
        type: "button", class: "btn btn-line",
        onclick: () => {
          const name = "diff-" + ((base.release && base.release.id) || "release") + ".csv";
          if (downloadText(name, csvReport(state.view.length ? state.view : state.all),
            "text/csv")) {
            auditAction("diff.export_csv", { entries: state.view.length });
            RH.admin.shell.toast("نُزّل ملف الفروق " + name);
          }
        },
      }, "تنزيل CSV"),
      h("button", {
        type: "button", class: "btn btn-primary",
        onclick: () => {
          const sum = summarize(state.all);
          auditAction("diff.reviewed", {
            total: sum.total, added: sum.added, removed: sum.removed,
            changed: sum.changed, high: sum.high, honesty: sum.honesty,
            base: (base.release && base.release.id) || null,
            draft_version: (draft.release && draft.release.draft_version) || null,
          });
          RH.admin.shell.toast("سُجّلت مراجعة الفروق في سجل التدقيق");
        },
      }, "تسجيل مراجعة الفروق في سجل التدقيق"),
      h("a", { class: "btn btn-quiet", href: "#/admin/publish" },
        "الانتقال إلى التحقق والنشر"),
    ));
    return c;
  }

  function ignoredCard(list) {
    const c = card("الحقول المستثناة من المقارنة",
      "استثناء معلَن لا صامت: هذه الحقول تتغير حتماً مع كل حفظ أو نشر، "
      + "فمقارنتها ضجيج يخفي التغيير الحقيقي");
    c.classList.add("adf-ignored");
    const dl = h("dl", { class: "adf-ignore-list" });
    for (const p of list) {
      dl.appendChild(h("div", { class: "adf-ignore-row" },
        h("dt", { class: "adf-mono" }, p),
        h("dd", {}, IGNORE_REASON[p] || "حقل تشغيلي")));
    }
    c.appendChild(dl);
    c.appendChild(h("p", { class: "adf-note" },
      "بصمة التحقق (sha256) تُحسب مركزياً من المحتوى المقارَن نفسه عند النشر، "
      + "فاختلافها نتيجة لا سبب. لمقارنة تشخيصية شاملة تُستدعى "
      + "diff(base, draft, { replaceIgnore: true }) من وحدة التحكم."));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     18) الرسم الرئيس
     ══════════════════════════════════════════════════════════════════════════ */

  function pageHead() {
    return h("div", { class: "adm-page-head" },
      h("div", { class: "kicker" }, "مقارنة الإصدارات"),
      h("h2", {}, "ما الذي تغيّر في المسودة؟"),
      h("div", { class: "desc" },
        "مقارنة حقلاً حقلاً بين المسودة المفتوحة والإصدار المنشور الذي يقرؤه "
        + "المقدِّم الآن. الحذف يُرفع إلى أعلى درجة خطورة لأنه في الغالب خطأ تحرير "
        + "لا قرار، وتغيّر وسوم الصدق يُرفع إلى بطاقة مستقلة أعلى الصفحة."));
  }

  function noDraftCard() {
    const c = card("لا مسودة مفتوحة — المقارنة تتطلب مسودة",
      "المقارنة تجري بين مسودة قيد التحرير وإصدار منشور؛ بلا مسودة لا طرف ثانٍ");
    c.appendChild(h("p", { class: "adf-note" },
      "افتح مسودة من تبويب «نظرة عامة» أو من أي تبويب تحرير، ثم عُد إلى هنا. "
      + "المسودة تُنسخ من الإصدار المنشور الحالي، فتبدأ المقارنة فارغة بالضرورة "
      + "ثم تمتلئ بما تحرّره فعلاً."));
    c.appendChild(h("div", { class: "adf-actions" },
      h("a", { class: "btn btn-primary", href: "#/admin" }, "إلى نظرة عامة"),
      h("a", { class: "btn btn-line", href: "#/admin/history" }, "سجل الإصدارات")));
    return c;
  }

  function unavailableCard(msg) {
    const c = card("تعذّر بناء المقارنة", null);
    c.classList.add("adf-alert");
    c.appendChild(h("p", { class: "adf-note" }, String(msg)));
    return c;
  }

  /**
   * الرسم — العقد §11.2: `render(content, draft)`.
   * `draft` يمرره shell عبر `await RH.data.store.getDraft()` وقد يكون null.
   */
  function render(content, draft) {
    teardown();
    state.content = content;
    state.draft = draft || null;
    loadView();

    RH.core.dom.clear(content);
    content.appendChild(pageHead());

    if (!draft) {
      content.appendChild(noDraftCard());
      content.appendChild(ignoredCard(DEFAULT_IGNORE));
      return;
    }

    let base;
    try {
      base = RH.data.store.release();
    } catch (e) {
      content.appendChild(unavailableCard("تعذّر قراءة الإصدار المنشور: "
        + ((e && e.message) || e)));
      return;
    }
    if (!base) {
      content.appendChild(unavailableCard(
        "لا إصدار منشور في هذا البناء — المقارنة تحتاج طرفاً مرجعياً."));
      return;
    }
    state.base = base;

    let raw;
    try {
      raw = diff(base, draft);
    } catch (e) {
      content.appendChild(unavailableCard("تعذّر حساب الفروق: " + ((e && e.message) || e)));
      console.warn("diffViewer.diff:", e);
      return;
    }
    state.all = decorate(raw, base, draft);
    state.page = 1;

    const sum = summarize(state.all);

    content.appendChild(identityCard(base, draft));
    const mismatch = baseMismatchCard(base, draft);
    if (mismatch) content.appendChild(mismatch);
    content.appendChild(summaryCard(sum));
    const hon = honestyCard(state.all);
    if (hon) content.appendChild(hon);

    const tb = buildToolbar();
    const results = h("div", { class: "adf-results" });
    const pagerHost = h("div", { class: "adf-pagerhost" });
    const status = h("div", { class: "adf-status", role: "status", "aria-live": "polite" });

    const tableCard = card("الفروق حقلاً حقلاً", null);
    tableCard.classList.add("adf-tablecard");
    tableCard.appendChild(tb.bar);
    tableCard.appendChild(status);
    tableCard.appendChild(results);
    tableCard.appendChild(pagerHost);
    content.appendChild(tableCard);

    content.appendChild(actionsCard(base, draft));
    content.appendChild(ignoredCard(DEFAULT_IGNORE));

    state.hosts = {
      results, pager: pagerHost, status,
      search: tb.search, groupSel: tb.groupSel, sevSel: tb.sevSel,
      sortSel: tb.sortSel, perSel: tb.perSel, honCb: tb.honCb, kindBox: tb.kindBox,
      dirBtn: tb.dirBtn,
    };
    fillGroups(tb.groupSel, sum);
    syncControls();
    bindRouteGuard();
    refresh();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     19) الواجهة العامة
     ══════════════════════════════════════════════════════════════════════════ */

  return {
    // العقد §11.2
    diff,
    render,
    // التنظيف (يستدعيه الحارس ذاتياً؛ متاح للاختبارات وللمضيف)
    teardown,
    // ثوابت معلَنة
    DEFAULT_IGNORE,
    IGNORE_REASON,
    GROUP_ORDER,
    GROUP_LABEL,
    KEY_LABEL,
    KIND_LABEL,
    SEVERITY_ORDER,
    SEVERITY_LABEL,
    HONESTY_KEYS,
    HONESTY_GROUPS,
    STATUS_LABEL,
    // أدوات نقية مختبَرة
    stableStringify,
    deepEqual,
    valueKind,
    splitPath,
    joinKey,
    joinIndex,
    groupOf,
    lastKey,
    lastSegment,
    parentPath,
    resolveAt,
    objectName,
    pathLabel,
    buildIgnore,
    isIgnored,
    matchKeyFor,
    numberHint,
    formatValue,
    formatValueFull,
    numericDelta,
    deltaText,
    changeCount,
    isHonestyPath,
    statusLabel,
    caveatsFor,
    severityOf,
    normalizeSearch,
    decorate,
    summarize,
    groupRank,
    filterEntries,
    sortEntries,
    paginate,
    pageWindow,
    reportHeader,
    textReport,
    csvReport,
  };
})();
