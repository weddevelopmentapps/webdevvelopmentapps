/* ════════════════════════════════════════════════════════════════════════════
   palette.js — لوحة الأوامر (Ctrl+K) · عقد V2_CONTRACTS_EXPANSION §7
   فضاء الأسماء: RH.palette  ·  الأنماط بادئة `pal-` في src/styles/palette.css
   يُضمّ **بعد** presenter/tour.js وقبل حزمة الموجز (ترتيب §1 من عقد التوسعة).
   ────────────────────────────────────────────────────────────────────────────
   ما تقدّمه هذه الوحدة:

     ▸ **فهرس تنقّل واحد** لكل ما يمكن الوصول إليه في المنصة: الأقسام التسعة
       والغلاف، الملاحق القانونية التسعة، الأحياء الـ189 (تفعيلها يفتح أطلس
       الأحياء على الحي ذاته)، والمقاييس المنشورة — الخام والمشتقة والقطاعية
       ومؤشرات الأداء الأربعة عشر، وقيمة الامتثال المورّدة وسيناريوهات العجز
       المورّدة والمستهدف الاسترشادي.

     ▸ **إجابة المقياس داخل النتيجة**: سطر يحمل القيمة منسّقة عبر `RH.core.fmt`
       ووحدتها ومرساة مصدرها (‏`ورقة!خلية` للخام، «مشتق (صيغة)» للمشتق)، ووسم
       الصدق الملازم إن كان للقيمة وسم — ولوح إسناد جانبي يفصّل المصدر والصيغة
       والوسم كاملاً ويحمل زر «الانتقال إلى القسم».

     ▸ **مطابقة عربية متسامحة** مفوَّضة كلياً إلى `RH.viz.geoutils.normalizeAr`
       (همزات الألف، التاء المربوطة، الألف المقصورة، التشكيل، التطويل، خفض
       اللاتينية): «الملقى» و«ملقا» و«Malqa» تلتقي كلها، وسلّم الدرجات مقفل
       (تطابق تام > بادئة > بادئة كلمة > بادئة كلمة بعد «أل» > احتواء >
       احتواء في نص مساند > تتابع حروف).

     ▸ **تشغيل بلوحة المفاتيح وحدها**: فتح بـCtrl+K، تركيز فوري في الحقل،
       ‏↑/↓ تنقّل دوّار، Home/End للأطراف، PageUp/PageDown قفزات، Enter تفعيل،
       ‏Ctrl+Enter الإجراء البديل (الملحق التفصيلي)، Alt+→/← وAlt+1..5 تبديل
       المرشّح، Tab محبوس داخل اللوحة، Escape يغلق ويعيد التركيز إلى مصدره.

   ══ عقود ملزمة مطبَّقة حرفياً هنا ══
   • **لا اختلاق قيمة ولا نص قيمة**: كل رقم في هذه اللوحة يُقرأ من
     `release.json`/`riyadh-geo.json` ويمر عبر `RH.core.fmt`. الأسماء العربية
     للمقاييس المشتقة التي لا تحمل `label` في الإصدار **نص واجهة فقط** (مرآة
     `METRIC_AR` القائم في ملحق الطلب) ولا تلمس قيمة، و`label` الوارد في
     البيانات يتقدّم عليها دائماً.
   • **الوسم يسافر مع الرقم**: 81.6٪ لا تظهر في سطر ولا في لوح إسناد بلا وسم
     «قيمة مورّدة — بانتظار اعتماد المنهجية» ونصّ ملاحظتها؛ قيم السيناريوهات
     تلازمها `scenarios.caveat` كاملة؛ قيم الأحياء تلازمها `meta.sample_label`؛
     المستهدف الاسترشادي يلازمه وسم «استرشادية غير معتمدة»؛ ومؤشرات الأداء بلا
     قيمة حالية تُعلن «تُسجَّل من المنصة — غير متوفرة» صراحة لا فراغاً.
   • **منظومة اللون الدلالية**: النغمات في هذه اللوحة على النصوص والشرائط
     المصغرة فقط، وهي مقفلة — مرجاني للعجز والمخالفات حصراً، ذهبي للمستهدف
     وخط الأساس ووسوم الاعتماد حصراً، أخضر للطاقة، رملي للطلب، أزرق للفئة
     الثانوية. لا لون زخرفي في هذا الملف.
   • **عقد §8 (الملاحة)**: الجذر الطافي `role="dialog" aria-modal="true"`
     (فيمنع `nav.js` تلقائياً مفاتيح الكليكر ونقر الخلفية خلف اللوحة)، وحقل
     البحث والجذر يحملان `data-interactive`، وكل مفتاح تلتقطه اللوحة يستدعي
     `stopPropagation` فلا يتسرب إلى المحرك.
   • **`prefers-reduced-motion`**: لا حركة برمجية إطلاقاً في هذا الملف؛
     الظهور والإخفاء انتقالات CSS تُلغى بالكامل في palette.css عند تفضيل
     تقليل الحركة.
   • **التنظيف**: `close()` يفكّ كل مستمع ويلغي أي إطار مجدول ويزيل الطبقة من
     DOM ويعيد التركيز إلى العنصر الذي كان مركّزاً قبل الفتح. لا مؤقتات معلّقة
     ولا مستمعين متراكمين مهما تكرر الفتح والإغلاق.

   ══ إشارة الوجود (عقد §2.1) ══
   `RH.palette` **غير معرَّف في ns.js عمداً**: وجوده هو ما يفحصه `chrome.js`
   (لإظهار زر «بحث وتنقّل») و`nav.js` (لتفعيل الاختصار). لذا يُعرَّف الفضاء
   **كاملاً وقت التحميل** هنا، ولا يُنشأ كائناً فارغاً مبكراً في أي موضع.

   ══ قابلية الاختبار (عقد §0) ══
   كل المنطق المُختبَر نقي ومصدَّر على الفضاء العام: `buildIndex` و`search`
   و`parseQuery` و`paginate` و`matchSegments` و`statusOf` و`formatMetricValue`
   و`recentModel`. لا وصول إلى `document`/`window` وقت التحميل خارج حارس
   `CAN_DOM`، فيُحمَّل الملف كما هو في سياق vm ذي محاكاة DOM دنيا ويُختبر في
   `tests/unit/palette-index.test.mjs`.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

RH.palette = (function () {
  const fmt = RH.core.fmt;
  const bus = RH.core.bus;
  const D = RH.core.dom;
  const G = RH.viz.geoutils;

  /** هل البيئة تملك DOM حقيقياً؟ (بيئة اختبار الوحدة لا تملك classList) */
  const CAN_DOM = !!(typeof document !== "undefined" && document
    && document.body && document.body.classList
    && typeof document.createElement === "function");

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 1) مفردات مقفلة وثوابت العقد
     ══════════════════════════════════════════════════════════════════════════ */

  /** أنواع المدخلات — المفردات مقفلة بعقد §7 ولا تُوسَّع */
  const KINDS = Object.freeze(["section", "appendix", "metric", "district"]);

  /** ترتيب فصل التعادل بين الأنواع (قسم > ملحق > مقياس > حي) — عقد §7 حرفياً */
  const KIND_ORDER = Object.freeze({
    section: 0, appendix: 1, metric: 2, district: 3,
  });

  /** تسميات عربية للأنواع: رقاقة الصف وعناوين المجموعات وأزرار المرشّح */
  const KIND_META = Object.freeze({
    section: { chip: "قسم", group: "الأقسام", plural: "أقسام" },
    appendix: { chip: "ملحق", group: "الملاحق", plural: "ملاحق" },
    metric: { chip: "مقياس", group: "المقاييس", plural: "مقاييس" },
    district: { chip: "حي", group: "الأحياء", plural: "أحياء" },
  });

  /** سلّم درجات المطابقة — مقفل بعقد §7 (الترتيب هو العقد، لا الأرقام ذاتها) */
  const SCORE = Object.freeze({
    EXACT: 100,          // تطابق تام للنص المطبع كاملاً
    PREFIX: 80,          // بادئة النص
    WORD_PREFIX: 60,     // بادئة كلمة داخلية
    AL_WORD_PREFIX: 55,  // بادئة كلمة بعد تجريد «أل» التعريف (تسامح عربي)
    CONTAINS: 40,        // احتواء في أي موضع
    LOOSE_TAIL: 35,      // احتواء بعد تسامح آخر الكلمة (ألف/ياء الطرف)
    ALT: 30,             // مطابقة في النص المساند (الإنجليزي/المعرف/الوصف)
    SUBSEQ: 15,          // تتابع حروف بترتيبها — شبكة أمان للأخطاء المطبعية
    ALT_PENALTY: 12,     // خصم درجة النص المساند عن النص الأساسي
    MULTI_CAP: 40,       // سقف مطابقة الكلمات المتفرقة: لا تتقدم على العبارة
    MIN_SUBSEQ_LEN: 3,   // أقصر استعلام يُسمح له بالتتابع الحرفي
    /** علاوة التغطية: كم يغطي الاستعلامُ العنوانَ. قيمتها في [0,4] وهي
        **أصغر من أضيق فجوة بين درجتين متجاورتين (5)** — فترتيب السلّم
        محفوظ حرفياً، والعلاوة تفصل داخل الدرجة الواحدة فقط: «نسبة تغطية
        الطلب» يتقدم على «قطاع الغرب — نسبة تغطية الطلب» لأن الاستعلام
        يغطي عنوانه أكثر، لا لأنه من نوع آخر. */
    BONUS_MAX: 4,
    /** أقصى امتداد مسموح لمطابقة التتابع الحرفي = طول الاستعلام × هذا العامل
        زائد هامش. بدونه يلتقط التتابع عناوين طويلة لا صلة لها بالاستعلام
        («الملقا» داخل «الطلب على الأسرّة للعمالة…») فيغرق الفهرس بالضجيج. */
    SUBSEQ_SPAN_FACTOR: 1.5,
    SUBSEQ_SPAN_SLACK: 2,
  });

  /** حدود العرض */
  const LIMITS = Object.freeze({
    SEARCH: 400,      // أرضية سقف المطابقة (العرض يرفعه إلى حجم الفهرس كاملاً)
    PAGE: 12,         // نتائج الصفحة الواحدة — القيمة الافتراضية في العقد
    RECENT: 8,        // آخر التفعيلات المحفوظة (عقد §7)
    SUGGEST: 10,      // مقترحات البدء عند غياب الحداثة
    PAGE_JUMP: 8,     // قفزة PageUp/PageDown داخل القائمة
  });

  /** مفتاح تخزين الحداثة — منصوص في العقد حرفياً */
  const STORE_KEY = "rh.palette.recent";

  /** خريطة عرض مقفلة لحالات الاعتماد (مرآة المفردات المعتمدة في الأقسام
      والموجز — لا صياغة جديدة). حالة غير معروفة تُعرض بمعرفها الخام صدقاً. */
  const STATUS_LABEL = Object.freeze({
    pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
    supplied_unvalidated: "قيمة مورّدة غير معتمدة",
    indicative_not_approved: "قيمة استرشادية غير معتمدة",
    pending_approval: "بانتظار الاعتماد",
    approved_brief: "معتمدة للعرض",
    approved_source_mirror: "منقولة حرفياً عن مصدر معتمد",
  });
  const statusLabel = (s) => STATUS_LABEL[s] || String(s || "");

  /** الصيغة المعتمدة لغياب القيمة الحالية لمؤشرات الأداء (حرفياً) */
  const KPI_MISSING = "تُسجَّل من المنصة — غير متوفرة";

  /** الحالة الصادقة لحي خارج عينة الأحياء — تُقرأ من الأطلس إن كان مضمّناً
      كي يبقى النص مصدراً واحداً، وإلا فنص العقد §5 حرفياً. */
  const HONEST_NO_DATA_FALLBACK = "لا بيانات على مستوى الحي — القيم المعروضة "
    + "قطاعية، والحي خارج عينة الأحياء المدرجة";
  function honestNoData() {
    const m = RH.explore && RH.explore.districts;
    if (m && typeof m.HONEST_NO_DATA === "string" && m.HONEST_NO_DATA) {
      return m.HONEST_NO_DATA;
    }
    return HONEST_NO_DATA_FALLBACK;
  }

  /** الأقسام التسعة بترتيبها القانوني (V2_CONTRACTS §1) — احتياطي يُستعمل
      حين لا يُمرَّر `RH.sections.list()` (السياق النقي/الاختبار). */
  const SECTION_FALLBACK = Object.freeze([
    { id: "summary", order: 1, title: "الملخص التنفيذي", kicker: "الصورة الكاملة" },
    { id: "demand", order: 2, title: "العرض والطلب", kicker: "قراءة السوق" },
    { id: "licensing", order: 3, title: "التراخيص", kicker: "أثر التنظيم" },
    { id: "control", order: 4, title: "الرقابة الميدانية", kicker: "الالتزام" },
    { id: "map", order: 5, title: "خريطة الرياض التفاعلية", kicker: "التوزيع الجغرافي" },
    { id: "initiatives", order: 6, title: "المبادرات والركائز", kicker: "الخطة" },
    { id: "kpis", order: 7, title: "مؤشرات الأداء", kicker: "القياس" },
    { id: "forecast", order: 8, title: "سيناريوهات العجز", kicker: "الاستشراف" },
    { id: "closing", order: 9, title: "الخاتمة والتوصيات", kicker: "القرار" },
  ]);

  /** الملاحق القانونية التسعة بعناوينها (عقد §7 + §8) — كل مدخل يحمل ملحقه
      المضمّن في البناء أو يُسقَط بصمت إن غاب (لا بند يقود إلى فراغ). */
  const APPENDIX_CATALOG = Object.freeze([
    { id: "demand", title: "الطلب — التفاصيل والتحليل", kicker: "ملحق تحليلي", section: "demand" },
    { id: "licensing", title: "التراخيص — التفاصيل والتحليل", kicker: "ملحق تحليلي", section: "licensing" },
    { id: "monitoring", title: "الرقابة — التفاصيل والتحليل", kicker: "ملحق تحليلي", section: "control" },
    { id: "pillar", title: "المبادرات والركائز — السجل الكامل", kicker: "ملحق الاستراتيجية", section: "initiatives" },
    { id: "kpi", title: "مؤشرات الأداء — الجدول الكامل", kicker: "ملحق الاستراتيجية", section: "kpis" },
    { id: "scenarios", title: "مستكشف السيناريوهات", kicker: "ملحق استكشافي", section: "forecast" },
    { id: "atlas", title: "أطلس الأحياء", kicker: "ملحق استكشافي", section: "map" },
    { id: "methodology", title: "منهجية البيانات ومصادرها", kicker: "ملحق الإسناد", section: "closing" },
    { id: "decisions", title: "سجل القرارات المطلوبة", kicker: "ملحق الإسناد", section: "closing" },
  ]);

  /** الملاحق الخمسة المعتمدة في البناء الأصلي — حاضرة دائماً */
  const CORE_APPENDICES = Object.freeze(["demand", "licensing", "monitoring", "pillar", "kpi"]);

  /**
   * فحوص وجود ملاحق التوسعة: مرآة نمط `chrome.js` (وجود الفضاء = الوحدة
   * مضمّنة). ملحق بلا فحص معروف يُعامل معاملة الغائب — لا بند يقود إلى
   * «المشهد غير موجود».
   */
  const APPENDIX_PROBES = Object.freeze({
    scenarios: () => hasShell() && !!(RH.explore && RH.explore.scenarios),
    atlas: () => hasShell() && !!(RH.explore && RH.explore.districts),
    methodology: () => hasShell()
      && !!(RH.explore && (RH.explore.methodology || RH.explore.methodologyModel)),
    decisions: () => hasShell()
      && !!(RH.explore && typeof RH.explore.decisionsModel === "function"),
  });

  /** هيكل الملاحق حاضر؟ لا تسجيل ملحق ممكن بدونه، فلا بند يُعرض بدونه */
  function hasShell() {
    return !!(RH.presenter && RH.presenter.ax
      && typeof RH.presenter.ax.register === "function");
  }

  /** أسماء عرض عربية للمقاييس المشتقة التي لا تحمل label في الإصدار —
      نص واجهة فقط (مرآة METRIC_AR في ملحق الطلب، موسَّعة لبقية المشتقات).
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

  /** نغمة كل مقياس — دلالية ومقفلة: مرجاني للعجز/المخالفات، ذهبي للمستهدف
      وخط الأساس، أخضر للطاقة والفعل، رملي للطلب، أزرق للفئة الثانوية. */
  const METRIC_TONE = Object.freeze({
    total_demand: "demand",
    licensed_beds: "pos",
    occupied_beds: "pos",
    current_building: "pos",
    current_operational: "pos",
    baseline_building: "gold",
    baseline_operational: "gold",
    baseline_beds: "gold",
    blue_collar: "blue",
    white_collar: "demand",
    total_monitors: "pos",
    total_visits: "pos",
    total_violations: "neg",
    // قرارات الإغلاق إجراء إنفاذ لا عجز ولا مخالفة: المرجاني محجوز لهما
    // حصراً، فتبقى محايدة النغمة (ومطابقة لتلوينها الثانوي في charts2).
    total_closures: "neu",
    south_violations: "neg",
    deficit_beds: "neg",
    coverage_pct: "pos",
    uncovered_pct: "neg",
    occupancy_pct: "pos",
    vacant_beds: "neu",
    blue_share_pct: "blue",
    white_share_pct: "demand",
    growth_building_abs: "pos",
    growth_building_pct: "pos",
    growth_operational_abs: "pos",
    growth_operational_pct: "pos",
    growth_beds_abs: "pos",
    growth_beds_pct: "pos",
    avg_monthly_visits: "pos",
    south_violations_share_pct: "neg",
  });

  /** القسم الذي يعرض كل مقياس (وجهة زر «الانتقال إلى القسم») */
  const METRIC_SECTION = Object.freeze({
    total_demand: "demand",
    licensed_beds: "demand",
    occupied_beds: "demand",
    current_building: "licensing",
    current_operational: "licensing",
    baseline_building: "licensing",
    baseline_operational: "licensing",
    baseline_beds: "licensing",
    blue_collar: "demand",
    white_collar: "demand",
    total_monitors: "control",
    total_visits: "control",
    total_violations: "control",
    total_closures: "control",
    south_violations: "control",
    deficit_beds: "demand",
    coverage_pct: "demand",
    uncovered_pct: "demand",
    occupancy_pct: "demand",
    vacant_beds: "demand",
    blue_share_pct: "demand",
    white_share_pct: "demand",
    growth_building_abs: "licensing",
    growth_building_pct: "licensing",
    growth_operational_abs: "licensing",
    growth_operational_pct: "licensing",
    growth_beds_abs: "licensing",
    growth_beds_pct: "licensing",
    avg_monthly_visits: "control",
    south_violations_share_pct: "control",
  });

  /** الملحق التفصيلي المرتبط بكل مقياس (الإجراء البديل Ctrl+Enter) */
  const METRIC_APPENDIX = Object.freeze({
    demand: "demand", licensing: "licensing", control: "monitoring",
    kpis: "kpi", initiatives: "pillar", forecast: "scenarios", map: "atlas",
  });

  /** المشتقات غير القياسية (كائنات لا قيم) — تُستثنى من فهرس المقاييس */
  const NON_SCALAR_DERIVED = Object.freeze(["sector_derived", "rankings", "sector"]);

  /**
   * حقول القطاع المفهرسة: ثمانية من صف القطاع في الإصدار وأربعة من مشتقاته.
   * كل حقل يحمل نغمته الدلالية ووجهته وصيغته — لا حساب جديد في هذا الملف:
   * القيم منقولة كما هي من `release.sectors` و`derived.sector`.
   */
  const SECTOR_FIELDS = Object.freeze([
    { key: "demand", from: "row", label: "الطلب التقديري على الأسرّة", unit: "سرير", tone: "demand", section: "demand" },
    { key: "beds", from: "row", label: "الطاقة المرخصة", unit: "سرير", tone: "pos", section: "demand" },
    { key: "building", from: "row", label: "رخص البناء", unit: "رخصة", tone: "pos", section: "licensing" },
    { key: "operational", from: "row", label: "الرخص التشغيلية", unit: "رخصة", tone: "pos", section: "licensing" },
    { key: "visits", from: "row", label: "الزيارات الميدانية", unit: "زيارة", tone: "pos", section: "control" },
    { key: "violations", from: "row", label: "المخالفات المسجلة", unit: "مخالفة", tone: "neg", section: "control" },
    { key: "monitors", from: "row", label: "المراقبون الميدانيون", unit: "مراقب", tone: "pos", section: "control" },
    { key: "closures", from: "row", label: "قرارات الإغلاق", unit: "قرار", tone: "neu", section: "control" },
    { key: "coverage_pct", from: "derived", label: "نسبة تغطية الطلب", unit: "٪", tone: "pos", section: "demand", formula: "أسرّة القطاع ÷ طلب القطاع × 100" },
    { key: "deficit_beds", from: "derived", label: "عجز الأسرّة", unit: "سرير", tone: "neg", section: "demand", formula: "max(طلب القطاع − أسرّة القطاع، 0)" },
    { key: "violations_share_pct", from: "derived", label: "حصة القطاع من المخالفات", unit: "٪", tone: "neg", section: "control", formula: "مخالفات القطاع ÷ إجمالي المخالفات × 100" },
    { key: "demand_share_pct", from: "derived", label: "حصة القطاع من طلب المدينة", unit: "٪", tone: "demand", section: "demand", formula: "طلب القطاع ÷ إجمالي الطلب × 100" },
  ]);

  /** مفاتيح نطاق البحث المكتوبة في الحقل (بادئة رمزية أو كلمة عربية متبوعة
      بنقطتين) — تُقرأ وتُزال من نص الاستعلام قبل المطابقة. */
  const SCOPES = Object.freeze([
    { id: "all", label: "الكل", sign: "", words: ["الكل", "كل"] },
    { id: "section", label: "الأقسام", sign: "#", words: ["قسم", "أقسام", "اقسام"] },
    { id: "appendix", label: "الملاحق", sign: "+", words: ["ملحق", "ملاحق"] },
    { id: "metric", label: "المقاييس", sign: "=", words: ["مقياس", "مقاييس", "رقم"] },
    { id: "district", label: "الأحياء", sign: "@", words: ["حي", "أحياء", "احياء"] },
  ]);
  const SCOPE_IDS = Object.freeze(SCOPES.map((s) => s.id));

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 2) التطبيع والمطابقة — منطق نقي بالكامل
     ──────────────────────────────────────────────────────────────────────────
     التطبيع **مفوَّض حصراً** إلى `RH.viz.geoutils.normalizeAr` (عقد §10:
     ممنوع نسخ منطق تطبيع جديد في ملفات الميزات). ما هنا منطق مطابقة وترتيب
     يبني فوق ذلك التطبيع ولا يعيد تعريفه.
     ══════════════════════════════════════════════════════════════════════════ */

  /** تطبيع نص للمطابقة — تفويض مباشر لأداة الجغرافيا المشتركة */
  function normalize(s) {
    return G.normalizeAr(s);
  }

  /** تجريد «أل» التعريف من بداية كلمة مطبعة — تسامح عربي في المطابقة فقط
      (لا يمسّ نصاً معروضاً ولا قيمة). */
  function stripAl(word) {
    return word.length > 3 && word.startsWith("ال") ? word.slice(2) : word;
  }

  /**
   * تتابع حروف بترتيبها **محصور الامتداد**: يعيد امتداد أول مطابقة جشعة
   * (‏-1 إن لم تكتمل). الحصر ضروري في فهرس مختلط الأطوال — بلا حدّ يلتقط
   * التتابع أي عنوان طويل تصادف أن حروف الاستعلام متفرقة فيه.
   */
  function subsequenceSpan(hay, needle) {
    let i = 0, first = -1, last = -1, pos = 0;
    for (const ch of hay) {
      if (ch === needle[i]) {
        if (first === -1) first = pos;
        last = pos;
        i += 1;
        if (i >= needle.length) return last - first + 1;
      }
      pos += 1;
    }
    return -1;
  }

  /** هل يطابق التتابع الحرفي ضمن الامتداد المسموح؟ */
  function subsequence(hay, needle) {
    if (needle.length < SCORE.MIN_SUBSEQ_LEN) return false;
    const span = subsequenceSpan(hay, needle);
    if (span < 0) return false;
    return span <= needle.length * SCORE.SUBSEQ_SPAN_FACTOR + SCORE.SUBSEQ_SPAN_SLACK;
  }

  /** هل تبدأ كلمة من النص بالاستعلام بعد تجريد «أل»؟ */
  function alWordPrefix(hay, q) {
    const bare = stripAl(q);
    for (const w of hay.split(" ")) {
      if (!w) continue;
      if (stripAl(w).startsWith(bare)) return true;
    }
    return false;
  }

  /**
   * تسامح طرف الكلمة — **مطابقة لا تطبيعاً**: يوحّد الألف والياء في آخر كل
   * كلمة من نصٍّ **مطبع سلفاً** بأداة الجغرافيا المشتركة. سببه أن التطبيع
   * المعتمد يحوّل «ى» إلى «ي» بينما تُكتب أسماء كثيرة بألف في آخرها
   * («الملقى» ↔ «الملقا»)، فتفشل المطابقة رغم أنهما اسم واحد. الناتج
   * **لا يُخزَّن ولا يُعرض ولا يدخل الفهرس** — يُستعمل لحظة المقارنة فقط،
   * وفي درجة أدنى من «الاحتواء» فلا يزاحم مطابقة حقيقية.
   */
  function tolerantTail(s) {
    return String(s || "").replace(/[يا](?=\s|$)/g, "ا");
  }

  /**
   * درجة مطابقة نص مطبع لاستعلام مطبع — سلّم العقد §7 حرفياً.
   * 0 يعني «لا مطابقة» ولا يظهر المدخل إطلاقاً.
   */
  function scoreText(hay, q) {
    if (!hay || !q) return 0;
    if (hay === q) return SCORE.EXACT;
    if (hay.startsWith(q)) return SCORE.PREFIX;
    if (hay.includes(" " + q)) return SCORE.WORD_PREFIX;
    if (alWordPrefix(hay, q)) return SCORE.AL_WORD_PREFIX;
    if (hay.includes(q)) return SCORE.CONTAINS;
    const lh = tolerantTail(hay), lq = tolerantTail(q);
    if (lq !== q || lh !== hay) {
      if (lh === lq || lh.includes(lq)) return SCORE.LOOSE_TAIL;
    }
    if (q.length >= SCORE.MIN_SUBSEQ_LEN && subsequence(hay, q)) return SCORE.SUBSEQ;
    return 0;
  }

  /** درجة النص المساند (إنجليزي/معرف/وصف) — تُخصم عن النص الأساسي */
  function scoreAlt(hay, q) {
    const s = scoreText(hay, q);
    if (!s) return 0;
    return Math.max(1, Math.min(SCORE.ALT, s - SCORE.ALT_PENALTY));
  }

  /**
   * درجة مدخل كامل لاستعلام مطبع:
   *   1) مطابقة العبارة كاملة على النص الأساسي ثم المساند (السلّم أعلاه).
   *   2) فإن لم تُطابق العبارة وكان الاستعلام كلمتين فأكثر: تُطلب مطابقة
   *      **كل** الكلمات (‏AND) وتُحتسب أدنى درجاتها مسقوفةً عند درجة
   *      «الاحتواء» — فمطابقة الكلمات المتفرقة لا تتقدم أبداً على مطابقة
   *      عبارة كاملة، وهو ما يحفظ ترتيب العقد.
   */
  /** علاوة تغطية العنوان — في [0,4] وبمنزلتين عشريتين لثبات الترتيب */
  function relevanceBonus(hay, q) {
    if (!hay || !q) return 0;
    const ratio = Math.min(1, q.length / hay.length);
    return Math.round(ratio * SCORE.BONUS_MAX * 100) / 100;
  }

  function scoreEntry(entry, q) {
    if (!entry || !q) return 0;
    const bonus = relevanceBonus(entry.norm, q);
    const phrase = Math.max(scoreText(entry.norm, q), scoreAlt(entry.normAlt || "", q));
    if (phrase > 0) return phrase + bonus;
    const toks = q.split(" ").filter(Boolean);
    if (toks.length < 2) return 0;
    let worst = Infinity;
    for (const t of toks) {
      const s = Math.max(scoreText(entry.norm, t), scoreAlt(entry.normAlt || "", t));
      if (s <= 0) return 0;
      worst = Math.min(worst, s);
    }
    return Math.min(SCORE.MULTI_CAP, worst) + bonus;
  }

  /** رتبة النوع في فصل التعادل */
  const kindRank = (kind) => (kind in KIND_ORDER ? KIND_ORDER[kind] : 9);

  /**
   * خريطة تطبيع حرفية: النص الأصلي ← نصه المطبع مع فهرس مقابل لكل محرف.
   * تُبنى بتفويض `normalizeAr` **محرفاً محرفاً** (فلا منطق تطبيع جديد هنا)،
   * مع معالجة صريحة للفراغ الذي يُقصّه التطبيع على مستوى المحرف المفرد.
   * تُستعمل حصراً لإبراز موضع المطابقة في النص المعروض.
   */
  function normMap(text) {
    const src = String(text == null ? "" : text);
    let norm = "";
    const map = [];
    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      let piece;
      if (/\s/.test(ch)) piece = norm && !norm.endsWith(" ") ? " " : "";
      else piece = normalize(ch);
      for (const c of piece) { norm += c; map.push(i); }
    }
    while (norm.endsWith(" ")) { norm = norm.slice(0, -1); map.pop(); }
    return { norm, map };
  }

  /** دمج مدَيات متداخلة/متلاصقة وترتيبها تصاعدياً */
  function mergeRanges(ranges) {
    const sorted = ranges.filter((r) => r && r.to >= r.from)
      .sort((a, b) => a.from - b.from || a.to - b.to);
    const out = [];
    for (const r of sorted) {
      const last = out[out.length - 1];
      if (last && r.from <= last.to + 1) last.to = Math.max(last.to, r.to);
      else out.push({ from: r.from, to: r.to });
    }
    return out;
  }

  /**
   * تقطيع نص معروض إلى شرائح مطابقة/غير مطابقة لإبراز موضع البحث.
   * يعيد دائماً مصفوفة شرائح تُعيد تركيب النص الأصلي حرفياً (لا حذف ولا
   * إضافة) — العرض يبني منها عناصر نصية آمنة بلا innerHTML.
   */
  function matchSegments(text, query) {
    const src = String(text == null ? "" : text);
    const q = normalize(query);
    if (!src) return [];
    if (!q) return [{ text: src, hit: false }];
    const { norm, map } = normMap(src);
    if (!norm) return [{ text: src, hit: false }];

    const needles = [];
    if (norm.includes(q)) needles.push(q);
    else {
      for (const t of q.split(" ").filter(Boolean)) {
        if (t && norm.includes(t)) needles.push(t);
      }
    }
    if (!needles.length) return [{ text: src, hit: false }];

    const ranges = [];
    for (const needle of needles) {
      let from = norm.indexOf(needle);
      while (from !== -1) {
        const last = from + needle.length - 1;
        if (map[from] != null && map[last] != null) {
          ranges.push({ from: map[from], to: map[last] });
        }
        from = norm.indexOf(needle, from + Math.max(1, needle.length));
      }
    }
    const merged = mergeRanges(ranges);
    if (!merged.length) return [{ text: src, hit: false }];

    const out = [];
    let cursor = 0;
    for (const r of merged) {
      if (r.from > cursor) out.push({ text: src.slice(cursor, r.from), hit: false });
      out.push({ text: src.slice(r.from, r.to + 1), hit: true });
      cursor = r.to + 1;
    }
    if (cursor < src.length) out.push({ text: src.slice(cursor), hit: false });
    return out.filter((s) => s.text.length > 0);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 3) الإسناد والقيم — صياغة الإجابة الصادقة
     ══════════════════════════════════════════════════════════════════════════ */

  /** اسم مصدر من سجل مصادر الإصدار (لا نص حر) */
  function sourceName(release, sourceId) {
    for (const s of (release && release.sources) || []) {
      if (s.id === sourceId) return s.name;
    }
    return sourceId || "—";
  }

  /**
   * مرساة مقياس خام: «ورقة!خلية».
   * العزل الاتجاهي يقع على **المرساة اللاتينية وحدها**: عزل السلسلة كاملة
   * يفرض اتجاهاً لاتينياً على اسم الورقة العربي فينقلب ترتيب الطرفين بصرياً
   * (تظهر الخلية قبل الورقة). القاعدة العامة في هذا الملف: `fmt.iso` للنص
   * اللاتيني/الرقمي حصراً، ولا يلمس نصاً عربياً أبداً.
   */
  function rawAnchor(metric) {
    if (!metric || !metric.sheet) return "";
    return String(metric.sheet) + "!" + fmt.iso(String(metric.anchor || ""));
  }

  /** سطر مصدر مقياس خام — المصنف والورقة والمرساة (عقد §7: مرساة المصدر) */
  function rawSourceLine(release, metric) {
    return "المصدر: " + sourceName(release, metric.source_id)
      + " — ورقة «" + String(metric.sheet) + "» خلية "
      + fmt.iso(String(metric.anchor || ""));
  }

  /** سطر مصدر مقياس مشتق — «مشتق (صيغة)» بإصدار الصيغة */
  function derivedSourceLine(dm) {
    if (!dm) return "قيمة مشتقة";
    const ver = dm.formula_version ? " · إصدار الصيغة " + fmt.iso(String(dm.formula_version)) : "";
    return "مشتق (" + fmt.iso(String(dm.formula || "")) + ")" + ver;
  }

  /**
   * تنسيق قيمة مقياس بحسب وحدتها — كل رقم يمر من `RH.core.fmt` بلا استثناء.
   * النسب تُعرض بعلامة ٪ العربية المعزولة اتجاهياً، وسواها بفاصل الآلاف.
   */
  function formatMetricValue(value, unit) {
    if (value == null || typeof value !== "number" || !Number.isFinite(value)) return "—";
    if (unit === "٪") return fmt.pct(value);
    return fmt.int(value);
  }

  /** صيغة تنفيذية مختصرة للأرقام الكبيرة (سطر مساند في لوح الإسناد) */
  function compactHint(value, unit) {
    if (unit === "٪") return "";
    if (typeof value !== "number" || !Number.isFinite(value)) return "";
    if (Math.abs(value) < 10000) return "";
    return fmt.compact(value);
  }

  /**
   * اشتقاق حالة الإجابة — نقي ومُختبَر. المفردات مقفلة:
   *   raw               قيمة خام من ورقة معتمدة بمرساتها
   *   derived           مشتقة منشورة بصيغتها
   *   sector            قيمة قطاعية منقولة من جدول القطاعات
   *   supplied_pending  مورّدة بانتظار اعتماد المنهجية (الامتثال)
   *   supplied_scenario سيناريو مورّد غير معتمد
   *   indicative        مستهدف استرشادي غير معتمد
   *   published_kpi     مؤشر منقول عن مصدر معتمد بقيمة حالية
   *   unavailable       لا قيمة حالية — تُسجَّل من المنصة
   */
  function statusOf(x) {
    if (!x) return "unknown";
    const a = x.answer !== undefined ? x.answer : x;   // يقبل المدخل أو إجابته
    if (!a) return "none";
    return a.status || "unknown";
  }

  /** نغمة عرض القيمة — تُقصر على المفردات الدلالية المقفلة */
  const TONES = Object.freeze(["pos", "neg", "gold", "demand", "blue", "neu"]);
  function toneOf(tone) {
    return TONES.includes(tone) ? tone : "neu";
  }

  /**
   * بناء كائن الإجابة الموحّد لكل مدخل مقياس.
   * `caveat` هو الوسم الذي **يسافر مع الرقم** حيثما ظهر — سطراً في النتيجة
   * ونصاً كاملاً في لوح الإسناد. غيابه يعني: لا وسم على هذه القيمة.
   */
  function makeAnswer(o) {
    const unit = o.unit || "";
    const display = o.display != null ? o.display : formatMetricValue(o.value, unit);
    return {
      value: display,                       // منسّقة سلفاً عبر fmt
      raw: typeof o.value === "number" ? o.value : null,
      unit: unit === "٪" ? "" : unit,       // ٪ مدمجة في النص المنسق
      source: o.source || "",               // مرساة المصدر أو الصيغة
      formula: o.formula || "",
      caveat: o.caveat || "",               // الوسم الملازم (نصّه الكامل)
      badge: o.badge || "",                 // الوسم المختصر داخل السطر
      status: o.status || "unknown",
      statusText: o.statusText || "",
      tone: toneOf(o.tone),
      pctOfBar: typeof o.pctOfBar === "number" ? o.pctOfBar : null,
      extra: o.extra || [],                 // أسطر إسناد إضافية (كلها من الإصدار)
      compact: compactHint(o.value, unit),
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 4) بناء الفهرس — مدخلات الأقسام والملاحق والأحياء والمقاييس
     ══════════════════════════════════════════════════════════════════════════ */

  /** يبني نصّي المطابقة (الأساسي والمساند) ويُغلق المدخل */
  function entry(o) {
    const altHay = [o.sub, o.altText, o.id, o.group]
      .filter(Boolean).map((x) => normalize(x)).filter(Boolean).join(" ");
    return {
      kind: o.kind,
      id: o.id,
      title: o.title,
      sub: o.sub || "",
      norm: normalize(o.title),
      normAlt: altHay,
      rank: kindRank(o.kind),
      badge: o.badge || "",
      answer: o.answer || null,
      nav: o.nav,
      alt: o.alt || null,
      altLabel: o.altLabel || "",
      group: o.group || KIND_META[o.kind].group,
      meta: o.meta || null,
    };
  }

  /** مدخلات الأقسام: الغلاف ثم الأقسام التسعة بترتيبها، ثم الموجز إن وُجد */
  function sectionEntries(release, sections, opts) {
    const list = Array.isArray(sections) && sections.length
      ? sections.slice().sort((a, b) => (a.order || 0) - (b.order || 0))
      : SECTION_FALLBACK.slice();
    const out = [];
    const meta = (release && release.meta) || {};

    out.push(entry({
      kind: "section", id: "00", title: "الغلاف",
      sub: "افتتاح العرض", altText: meta.title || "",
      nav: { kind: "scene", id: "00", params: {} },
    }));

    for (const def of list) {
      const apx = METRIC_APPENDIX[def.id] || null;
      out.push(entry({
        kind: "section", id: def.id, title: def.title || def.id,
        sub: def.kicker || "", altText: "لوحة القسم",
        nav: { kind: "scene", id: def.id, params: {} },
        alt: apx && isAppendixAvailable(apx, opts)
          ? { kind: "appendix", id: apx, params: {} } : null,
        altLabel: apx ? "فتح الملحق التفصيلي" : "",
      }));
    }

    if (!opts || opts.includeReport !== false) {
      out.push(entry({
        kind: "section", id: "report",
        title: "الموجز التنفيذي المطبوع",
        sub: "مستند A4 قابل للطباعة وحفظ PDF",
        altText: "تقرير طباعة pdf",
        nav: { kind: "report", id: "main", params: {} },
      }));
    }
    return out;
  }

  /** هل الملحق مضمّن في هذا البناء؟ (opts.appendices يتقدم على الفحوص) */
  function isAppendixAvailable(id, opts) {
    if (opts && Array.isArray(opts.appendices)) return opts.appendices.indexOf(id) !== -1;
    if (CORE_APPENDICES.indexOf(id) !== -1) return true;
    const probe = APPENDIX_PROBES[id];
    return probe ? !!probe() : false;
  }

  /** مدخلات الملاحق القانونية المضمّنة في البناء */
  function appendixEntries(release, opts) {
    const out = [];
    for (const ax of APPENDIX_CATALOG) {
      if (!isAppendixAvailable(ax.id, opts)) continue;
      out.push(entry({
        kind: "appendix", id: ax.id, title: ax.title,
        sub: ax.kicker, altText: ax.section,
        nav: { kind: "appendix", id: ax.id, params: {} },
        alt: ax.section ? { kind: "scene", id: ax.section, params: {} } : null,
        altLabel: "الانتقال إلى القسم المرتبط",
      }));
    }
    return out;
  }

  /**
   * مدخلات الأحياء الـ189 من فهرس `geoutils` — التفعيل يفتح أطلس الأحياء على
   * الحي ذاته (‏`#/appendix/atlas?d=<key>`). عند غياب الأطلس من البناء تُوجَّه
   * إلى قسم الخريطة بدل بند يقود إلى فراغ.
   */
  function districtEntries(release, derived, geo, opts) {
    const out = [];
    if (!geo || !release) return out;
    const atlas = isAppendixAvailable("atlas", opts);
    const index = G.districtIndex(geo, release, derived || null);
    for (const d of index) {
      out.push(entry({
        kind: "district", id: d.key, title: d.name,
        sub: d.sectorName + (d.sample ? " · ضمن العينة المدرجة" : ""),
        altText: [d.name_en, d.sector].filter(Boolean).join(" "),
        badge: d.sample ? "ضمن العينة" : "",
        nav: atlas
          ? { kind: "appendix", id: "atlas", params: { d: d.key } }
          : { kind: "scene", id: "map", params: {} },
        alt: { kind: "scene", id: "map", params: {} },
        altLabel: "عرض القطاع على الخريطة",
        meta: { district: d },
      }));
    }
    return out;
  }

  /** مدخلات المقاييس الخام: كل `release.metrics` بعناوينها ومراسيها */
  function rawMetricEntries(release) {
    const out = [];
    const metrics = (release && release.metrics) || {};
    for (const id of Object.keys(metrics)) {
      const m = metrics[id];
      if (!m || typeof m.value !== "number") continue;
      const section = METRIC_SECTION[id] || "summary";
      const apx = METRIC_APPENDIX[section] || null;
      out.push(entry({
        kind: "metric", id: "metric:" + id,
        title: m.label || id,
        sub: "قيمة خام · " + rawAnchor(m),
        altText: [id, m.sheet, m.anchor, m.unit].filter(Boolean).join(" "),
        answer: makeAnswer({
          value: m.value, unit: m.unit || "",
          source: rawSourceLine(release, m),
          status: "raw",
          statusText: "قيمة خام منشورة من الورقة المعتمدة",
          tone: METRIC_TONE[id] || "neu",
        }),
        nav: { kind: "scene", id: section, params: {} },
        alt: apx ? { kind: "appendix", id: apx, params: {} } : null,
        altLabel: "فتح الملحق التفصيلي",
      }));
    }
    return out;
  }

  /** مدخلات المقاييس المشتقة القياسية: القيمة من الحساب الحي والصيغة من الإصدار */
  function derivedMetricEntries(release, derived) {
    const out = [];
    const published = (release && release.derived) || {};
    const live = derived || {};
    for (const id of Object.keys(published)) {
      if (NON_SCALAR_DERIVED.indexOf(id) !== -1) continue;
      const dm = published[id];
      if (!dm || typeof dm.value !== "number") continue;
      const value = typeof live[id] === "number" ? live[id] : dm.value;
      const section = METRIC_SECTION[id] || "summary";
      const apx = METRIC_APPENDIX[section] || null;
      const unit = dm.unit || "";
      out.push(entry({
        kind: "metric", id: "metric:" + id,
        title: dm.label || DERIVED_AR[id] || id,
        sub: "قيمة مشتقة · " + fmt.iso(String(dm.formula || "")),
        altText: [id, dm.formula, dm.formula_version, unit].filter(Boolean).join(" "),
        answer: makeAnswer({
          value, unit,
          source: derivedSourceLine(dm),
          formula: String(dm.formula || ""),
          status: "derived",
          statusText: "مشتقة منشورة بصيغتها المعتمدة",
          tone: METRIC_TONE[id] || "neu",
          pctOfBar: unit === "٪" ? value : null,
          extra: Array.isArray(dm.inputs) && dm.inputs.length
            ? ["مدخلات الصيغة: " + fmt.iso(dm.inputs.join("، "))] : [],
        }),
        nav: { kind: "scene", id: section, params: {} },
        alt: apx ? { kind: "appendix", id: apx, params: {} } : null,
        altLabel: "فتح الملحق التفصيلي",
      }));
    }
    return out;
  }

  /**
   * مدخلات القطاعات الخمسة: اثنا عشر حقلاً لكل قطاع — ثمانية منقولة حرفياً
   * من صف القطاع وأربعة من مشتقاته المحسوبة مركزياً. لا حساب في هذا الملف.
   */
  function sectorMetricEntries(release, derived) {
    const out = [];
    const sectors = (release && release.sectors) || [];
    const dsec = (derived && derived.sector) || {};
    for (const row of sectors) {
      const sd = dsec[row.id] || null;
      for (const f of SECTOR_FIELDS) {
        const value = f.from === "row" ? row[f.key] : (sd ? sd[f.key] : null);
        if (typeof value !== "number" || !Number.isFinite(value)) continue;
        const apx = METRIC_APPENDIX[f.section] || null;
        out.push(entry({
          kind: "metric", id: "sector:" + row.id + ":" + f.key,
          title: row.name + " — " + f.label,
          sub: (f.from === "row" ? "قيمة قطاعية منشورة" : "مشتقة قطاعية")
            + " · " + (row.short || row.name),
          altText: [row.id, row.short, f.key, f.unit].filter(Boolean).join(" "),
          answer: makeAnswer({
            value, unit: f.unit,
            // صيغة الحقل القطاعي عربية النص فلا تُعزل اتجاهياً (العزل للاتيني)
            source: f.from === "row"
              ? "جدول القطاعات في " + sourceName(release, "src-workbook-v1")
              : "مشتق (" + (f.formula || "") + ")",
            formula: f.formula || "",
            status: f.from === "row" ? "sector" : "derived",
            statusText: f.from === "row"
              ? "قيمة قطاعية منقولة من جدول القطاعات"
              : "مشتقة قطاعية محسوبة مركزياً بالصيغة المعتمدة",
            tone: f.tone,
            pctOfBar: f.unit === "٪" ? value : null,
          }),
          nav: { kind: "scene", id: f.section, params: {} },
          alt: apx ? { kind: "appendix", id: apx, params: {} } : null,
          altLabel: "فتح الملحق التفصيلي",
        }));
      }
    }
    return out;
  }

  /**
   * مدخل معدل الامتثال المورّد — **لا يظهر أبداً بلا وسم منهجيته**:
   * الوسم المختصر في السطر ونص الملاحظة كاملاً في لوح الإسناد.
   */
  function complianceEntry(release) {
    const c = release && release.compliance;
    if (!c || typeof c.value !== "number") return null;
    return entry({
      kind: "metric", id: "metric:compliance",
      title: c.label || "معدل الامتثال في الجولات الرقابية",
      // السطر الثانوي يصف أصل القيمة، والوسم يحمله رقاقة الترويسة —
      // فلا يتكرر النص ذاته ثلاث مرات في صف واحد
      sub: "قيمة مورّدة في ملف البيانات · الرقابة الميدانية",
      altText: "امتثال compliance رقابة",
      badge: statusLabel(c.status),
      answer: makeAnswer({
        value: c.value, unit: c.unit || "٪",
        source: "قيمة مورّدة في ملف البيانات — " + sourceName(release, "src-workbook-v1"),
        status: "supplied_pending",
        statusText: statusLabel(c.status),
        badge: statusLabel(c.status),
        caveat: c.note || "",
        tone: "neu",
        pctOfBar: c.value,
      }),
      nav: { kind: "scene", id: "control", params: {} },
      alt: { kind: "appendix", id: "monitoring", params: {} },
      altLabel: "فتح ملحق الرقابة",
    });
  }

  /** مدخل المستهدف الاسترشادي — ذهبي (مستهدف حصراً) بوسم عدم اعتماده */
  function targetEntry(release) {
    const t = release && release.coverage_target_indicative;
    if (!t || typeof t.value !== "number") return null;
    return entry({
      kind: "metric", id: "metric:coverage_target",
      title: t.label || "هدف نسبة التغطية الاسترشادي",
      sub: "قيمة استرشادية من الورقة · العرض والطلب",
      altText: "مستهدف هدف تغطية استرشادي",
      badge: statusLabel(t.status),
      answer: makeAnswer({
        value: t.value, unit: t.unit || "٪",
        source: "قيمة استرشادية من الورقة — " + sourceName(release, "src-workbook-v1"),
        status: "indicative",
        statusText: statusLabel(t.status),
        badge: statusLabel(t.status),
        caveat: t.note || "",
        tone: "gold",
        pctOfBar: t.value,
      }),
      nav: { kind: "scene", id: "demand", params: {} },
      alt: { kind: "appendix", id: "demand", params: {} },
      altLabel: "فتح ملحق الطلب",
    });
  }

  /**
   * مدخلات سيناريوهات العجز الثلاثة — قيمة الشهر الأول المورّد ومدى السلسلة
   * (أول قيمة ← آخر قيمة، كلتاهما منقولتان حرفياً)، وكلها تحمل
   * `scenarios.caveat` كاملاً. لا سيناريو رابع ولا استيفاء بين الأشهر.
   */
  /** تطابق العدد والمعدود للأشهر — عبر fmt.countNoun لا بجمع مكتوب يدوياً */
  const MONTH_NOUN = Object.freeze({
    zero: "لا أشهر", one: "شهر واحد", two: "شهران",
    few: "أشهر", many: "شهراً", hundred: "شهر",
  });

  const SCENARIO_KEYS = Object.freeze([
    { key: "conservative", label: "السيناريو المتحفظ" },
    { key: "base", label: "السيناريو الأساسي" },
    { key: "optimistic", label: "السيناريو المتفائل" },
  ]);

  function scenarioEntries(release, opts) {
    const sc = release && release.scenarios;
    const rows = (sc && Array.isArray(sc.rows)) ? sc.rows : [];
    if (!sc || !rows.length) return [];
    const first = rows[0];
    const last = rows[rows.length - 1];
    const unit = sc.unit || "سرير";
    const badge = statusLabel(sc.status);
    const hasExplorer = isAppendixAvailable("scenarios", opts);
    const out = [];
    for (const s of SCENARIO_KEYS) {
      const v = first[s.key];
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      const vLast = last[s.key];
      const extra = [];
      if (typeof vLast === "number" && Number.isFinite(vLast)) {
        extra.push("المدى عبر الأشهر المورّدة: "
          + formatMetricValue(v, unit) + " (" + String(first.label) + ") ← "
          + formatMetricValue(vLast, unit) + " (" + String(last.label) + ")");
      }
      extra.push("عدد الأشهر المورّدة: " + fmt.int(rows.length));
      out.push(entry({
        kind: "metric", id: "scenario:" + s.key,
        title: "عجز " + s.label + " — " + String(first.label),
        sub: "سيناريو مورّد · " + fmt.countNoun(rows.length, MONTH_NOUN) + " مورّدة",
        altText: "سيناريو عجز " + s.key + " " + (sc.title || ""),
        badge,
        answer: makeAnswer({
          value: v, unit,
          source: "سيناريوهات مورّدة في ملف البيانات — "
            + sourceName(release, "src-workbook-v1"),
          status: "supplied_scenario",
          statusText: badge,
          badge,
          caveat: sc.caveat || "",
          tone: "neg",          // العجز مرجاني حصراً
          extra,
        }),
        nav: { kind: "scene", id: "forecast", params: {} },
        alt: hasExplorer ? { kind: "appendix", id: "scenarios", params: {} } : null,
        altLabel: "فتح مستكشف السيناريوهات",
      }));
    }
    return out;
  }

  /**
   * مدخلات مؤشرات الأداء الأربعة عشر — القيمة الحالية الغائبة تُعلن صراحة
   * «تُسجَّل من المنصة — غير متوفرة»، وخط الأساس والمستهدف يُعرضان بنغمة
   * ذهبية (خط أساس/مستهدف حصراً). النسب في الإصدار كسور 0..1 → ×100 بـ٪.
   */
  function kpiEntries(release, opts) {
    const st = release && release.strategy;
    const list = (st && Array.isArray(st.kpis)) ? st.kpis : [];
    if (!list.length) return [];
    const approved = RH.data && typeof RH.data.strategyApproved === "function"
      ? RH.data.strategyApproved(st) : st.status === "approved_source_mirror";
    const hasApx = isAppendixAvailable("kpi", opts);
    const out = [];
    for (const k of list) {
      if (!k || k.name == null) continue;
      const unit = k.pct ? "٪" : "";
      const scale = (v) => (typeof v === "number" && Number.isFinite(v)
        ? (k.pct ? v * 100 : v) : null);
      const base = scale(k.baseline);
      const target = scale(k.target);
      const cur = scale(k.current);
      const missing = cur == null;
      const extra = [];
      if (base != null) extra.push("خط الأساس: " + formatMetricValue(base, unit));
      if (target != null) extra.push("المستهدف: " + formatMetricValue(target, unit));
      if (k.type) extra.push("نوع المؤشر: " + String(k.type));
      out.push(entry({
        kind: "metric", id: "kpi:" + String(k.id),
        title: String(k.name),
        sub: "مؤشر أداء" + (k.type ? " · " + String(k.type) : ""),
        altText: ["kpi", "مؤشر", String(k.id), k.type].filter(Boolean).join(" "),
        badge: missing ? "قيمة حالية غير متوفرة" : "",
        answer: makeAnswer({
          value: missing ? null : cur,
          display: missing ? KPI_MISSING : formatMetricValue(cur, unit),
          unit,
          source: "لوحة مؤشرات الأداء — "
            + (approved ? statusLabel(st.status) : statusLabel(st.status || "")),
          status: missing ? "unavailable" : "published_kpi",
          statusText: missing ? KPI_MISSING : "قيمة منشورة",
          badge: missing ? KPI_MISSING : "",
          caveat: missing ? (k.current_note || KPI_MISSING) : "",
          tone: missing ? "neu" : "pos",
          pctOfBar: !missing && k.pct ? cur : null,
          extra,
        }),
        nav: { kind: "scene", id: "kpis", params: {} },
        alt: hasApx ? { kind: "appendix", id: "kpi", params: {} } : null,
        altLabel: "فتح جدول المؤشرات الكامل",
      }));
    }
    return out;
  }

  /**
   * فهرس لوحة الأوامر الكامل (عقد §7).
   * نقي تماماً: لا `document` ولا `window` ولا قراءة من المخزن — كل شيء من
   * الوسائط. `opts.appendices` تحصر الملاحق المضمّنة، و`opts.includeReport`
   * تُسقط بند الموجز حين لا تكون وحدته في البناء.
   */
  function buildIndex(release, derived, geo, sections, opts) {
    const out = [];
    if (!release) return out;
    const push = (arr) => { for (const e of arr) out.push(e); };
    push(sectionEntries(release, sections, opts));
    push(appendixEntries(release, opts));
    push(rawMetricEntries(release));
    push(derivedMetricEntries(release, derived));
    push(sectorMetricEntries(release, derived));
    const comp = complianceEntry(release);
    if (comp) out.push(comp);
    const tgt = targetEntry(release);
    if (tgt) out.push(tgt);
    push(scenarioEntries(release, opts));
    push(kpiEntries(release, opts));
    push(districtEntries(release, derived, geo, opts));
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 5) الاستعلام والبحث والترقيم — منطق نقي
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * تحليل نص الحقل إلى نطاق ونص بحث:
   *   «#الملقا» أو «قسم: التراخيص» → {scope, text}
   * النطاق المكتوب يتقدم على مرشّح الأزرار، والنص الباقي وحده يُطابَق.
   */
  function parseQuery(raw) {
    const src = String(raw == null ? "" : raw);
    const trimmed = src.replace(/^\s+/, "");
    for (const s of SCOPES) {
      if (s.sign && trimmed.startsWith(s.sign)) {
        return { scope: s.id, text: trimmed.slice(s.sign.length).trim(), token: s.sign };
      }
    }
    const colon = trimmed.indexOf(":");
    const colonAr = trimmed.indexOf("：");
    const cut = colon === -1 ? colonAr : (colonAr === -1 ? colon : Math.min(colon, colonAr));
    if (cut > 0 && cut <= 8) {
      const head = normalize(trimmed.slice(0, cut));
      for (const s of SCOPES) {
        for (const w of s.words) {
          if (normalize(w) === head) {
            return { scope: s.id, text: trimmed.slice(cut + 1).trim(), token: trimmed.slice(0, cut + 1) };
          }
        }
      }
    }
    return { scope: "all", text: trimmed.trim(), token: "" };
  }

  /** ترشيح الفهرس بنطاق واحد (‏"all" يمرّ كل شيء) */
  function filterScope(index, scope) {
    if (!scope || scope === "all") return index.slice();
    return index.filter((e) => e.kind === scope);
  }

  /**
   * بحث الفهرس (عقد §7): الترتيب بالدرجة ثم النوع ثم العنوان أبجدياً.
   * استعلام فارغ → مصفوفة فارغة (المستدعي يعرض الحداثة/المقترحات).
   */
  function search(index, query, limit) {
    const q = normalize(query);
    const cap = limit == null ? LIMITS.PAGE : limit;
    if (!q || !Array.isArray(index) || !index.length) return [];
    const scored = [];
    for (const e of index) {
      const s = scoreEntry(e, q);
      if (s > 0) scored.push({ s, e });
    }
    scored.sort((a, b) => (b.s - a.s)
      || (kindRank(a.e.kind) - kindRank(b.e.kind))
      || String(a.e.title).localeCompare(String(b.e.title), "ar"));
    return scored.slice(0, Math.max(0, cap)).map((x) => x.e);
  }

  /** بحث مع درجاته (للعرض التشخيصي وللاختبار الدقيق لسلّم الدرجات) */
  function searchScored(index, query, limit) {
    const q = normalize(query);
    const cap = limit == null ? LIMITS.SEARCH : limit;
    if (!q || !Array.isArray(index)) return [];
    const scored = [];
    for (const e of index) {
      const s = scoreEntry(e, q);
      if (s > 0) scored.push({ score: s, entry: e });
    }
    scored.sort((a, b) => (b.score - a.score)
      || (kindRank(a.entry.kind) - kindRank(b.entry.kind))
      || String(a.entry.title).localeCompare(String(b.entry.title), "ar"));
    return scored.slice(0, Math.max(0, cap));
  }

  /** تجميع نتائج بالنوع بترتيب الأنواع القانوني (يُستعمل في حالة البدء) */
  function groupResults(list) {
    const out = [];
    for (const kind of KINDS) {
      const items = (list || []).filter((e) => e.kind === kind);
      if (items.length) out.push({ kind, label: KIND_META[kind].group, items });
    }
    return out;
  }

  /** عدّاد النتائج بحسب النوع — لشرائط المرشّح */
  function countsByKind(list) {
    const out = { all: 0, section: 0, appendix: 0, metric: 0, district: 0 };
    for (const e of list || []) {
      out.all += 1;
      if (e.kind in out) out[e.kind] += 1;
    }
    return out;
  }

  /**
   * حساب الترقيم — نقي ومحصور: صفحة خارج المدى تُقصّ إلى أقرب صفحة صحيحة،
   * وقائمة فارغة تعطي صفحة واحدة بمدى صفري صادق (‏from=0) لا مدى وهمياً.
   */
  function paginate(items, page, perPage) {
    const list = Array.isArray(items) ? items : [];
    const per = Math.max(1, Math.floor(perPage || LIMITS.PAGE));
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / per));
    const p = Math.min(Math.max(1, Math.floor(page || 1)), pages);
    const start = (p - 1) * per;
    const end = Math.min(total, start + per);
    return {
      items: list.slice(start, end),
      page: p, pages, total, per,
      from: total ? start + 1 : 0,
      to: end,
      hasPrev: p > 1,
      hasNext: p < pages,
    };
  }

  /** تطابق العدد والمعدود لكلمة «نتيجة» — عبر fmt.countNoun لا يدوياً */
  const RESULT_NOUN = Object.freeze({
    zero: "لا نتائج", one: "نتيجة واحدة", two: "نتيجتان",
    few: "نتائج", many: "نتيجة", hundred: "نتيجة",
  });
  const resultCount = (n) => fmt.countNoun(n, RESULT_NOUN);

  /** جملة «النتائج من كذا إلى كذا من أصل كذا» بأرقام fmt وتطابق المعدود */
  function rangeLabel(pg) {
    if (!pg || !pg.total) return "لا نتائج";
    if (pg.pages === 1) return resultCount(pg.total);
    return fmt.int(pg.from) + "–" + fmt.int(pg.to) + " من " + resultCount(pg.total);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 6) الحداثة — النموذج نقي والتخزين محروس
     ══════════════════════════════════════════════════════════════════════════ */

  /** نموذج الحداثة النقي: يحل المعرفات المحفوظة إلى مدخلات حية بترتيبها،
      ويُسقط ما لم يعد موجوداً في الفهرس (بناء تغيّر/إصدار تغيّر) بلا ضجيج. */
  function recentModel(index, stored, limit) {
    const cap = limit == null ? LIMITS.RECENT : limit;
    const ids = Array.isArray(stored) ? stored : [];
    const byId = new Map();
    for (const e of index || []) byId.set(e.kind + "|" + e.id, e);
    const out = [];
    const seen = new Set();
    for (const rec of ids) {
      if (!rec) continue;
      const key = typeof rec === "string" ? rec : (rec.kind + "|" + rec.id);
      if (seen.has(key)) continue;
      const hit = byId.get(key);
      if (!hit) continue;
      seen.add(key);
      out.push(hit);
      if (out.length >= cap) break;
    }
    return out;
  }

  /** دمج تفعيل جديد في قائمة الحداثة (نقي): الأحدث أولاً بلا تكرار */
  function pushRecent(stored, entryKey, limit) {
    const cap = limit == null ? LIMITS.RECENT : limit;
    const list = (Array.isArray(stored) ? stored : []).filter((x) => x && x !== entryKey);
    list.unshift(entryKey);
    return list.slice(0, cap);
  }

  /* التخزين: localStorage قد يُمنع على file:// — السقوط إلى ذاكرة الجلسة */
  let memoryRecent = [];

  function readRecent() {
    try {
      const raw = CAN_DOM && window.localStorage
        ? window.localStorage.getItem(STORE_KEY) : null;
      if (!raw) return memoryRecent.slice();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
      return memoryRecent.slice();
    } catch (_e) {
      return memoryRecent.slice();
    }
  }

  function writeRecent(list) {
    memoryRecent = list.slice();
    try {
      if (CAN_DOM && window.localStorage) {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
      }
    } catch (_e) { /* file:// أو وضع خاص: ذاكرة الجلسة تكفي */ }
  }

  function rememberEntry(e) {
    if (!e) return;
    writeRecent(pushRecent(readRecent(), e.kind + "|" + e.id, LIMITS.RECENT));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 7) الفهرس الحي وذاكرته
     ──────────────────────────────────────────────────────────────────────────
     الفهرس يُبنى مرة واحدة لكل هوية إصدار (المعرف + وضع المخزن + قائمة
     الملاحق المضمّنة)، ويُبطل تلقائياً عند نشر إصدار جديد أو تبديل مسودة —
     فلا يبقى رقم قديم معروضاً في اللوحة بعد تغيّر البيانات.
     ══════════════════════════════════════════════════════════════════════════ */

  const cache = { key: "", index: [] };

  const store = () => (RH.data && RH.data.store) || null;

  function liveRelease() {
    const s = store();
    try { return s && typeof s.release === "function" ? s.release() : null; }
    catch (_e) { return null; }
  }
  function liveDerived() {
    const s = store();
    try { return s && typeof s.der === "function" ? s.der() : null; }
    catch (_e) { return null; }
  }
  function liveGeo() {
    return (typeof window !== "undefined" && window.GEO) ? window.GEO : null;
  }
  function liveSections() {
    return (RH.sections && typeof RH.sections.list === "function")
      ? RH.sections.list() : null;
  }

  /** الملاحق المضمّنة فعلاً في هذا البناء (فحوص الوجود §2.1) */
  function availableAppendices() {
    const out = [];
    for (const ax of APPENDIX_CATALOG) {
      if (isAppendixAvailable(ax.id, null)) out.push(ax.id);
    }
    return out;
  }

  /** هل وحدة الموجز مضمّنة؟ (مرآة فحص chrome.js حرفياً) */
  const hasReport = () => !!(RH.report && typeof RH.report.show === "function");

  function indexKeyOf(release, apx) {
    const s = store();
    let mode = "";
    try { mode = s && typeof s.mode === "function" ? String(s.mode()) : ""; }
    catch (_e) { mode = ""; }
    const id = release && release.release ? String(release.release.id) : "—";
    return id + "|" + mode + "|" + apx.join(",") + "|" + (hasReport() ? "r" : "");
  }

  /** يعيد الفهرس الحي (يبنيه عند أول حاجة أو عند تغيّر هوية الإصدار) */
  function ensureIndex(force) {
    const release = liveRelease();
    if (!release) return [];
    const apx = availableAppendices();
    const key = indexKeyOf(release, apx);
    if (!force && cache.key === key && cache.index.length) return cache.index;
    cache.index = buildIndex(release, liveDerived(), liveGeo(), liveSections(), {
      appendices: apx,
      includeReport: hasReport(),
    });
    cache.key = key;
    return cache.index;
  }

  /** إبطال الذاكرة — يُستدعى عند تغيّر الإصدار (نشر/تراجع/معاينة مسودة) */
  function invalidate() { cache.key = ""; cache.index = []; }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 8) حالة الطبقة
     ══════════════════════════════════════════════════════════════════════════ */

  let instanceSeq = 0;

  const state = {
    open: false,
    uid: "",
    veil: null, panel: null, input: null, listEl: null, previewEl: null,
    countEl: null, rangeEl: null, chips: [], emptyEl: null, pagerEl: null,
    clearBtn: null, closeBtn: null,
    scope: "all",       // مرشّح الأزرار (نطاق مكتوب في الحقل يتقدم عليه)
    query: "",
    page: 1,
    results: [],        // كل النتائج المطابقة (قبل الترقيم)
    recentCount: 0,     // عدد بنود «آخر ما فُتح» في مقدمة حالة البدء
    view: [],           // مدخلات الصفحة المعروضة — مؤشر التنقل عليها
    rowEls: [],         // عناصر <li> المقابلة لـview بالترتيب ذاته
    active: 0,
    mode: "start",      // "start" (بلا استعلام) أو "search"
    lastFocus: null,
    offs: [],           // دوال فك الاشتراك/المستمعين
    raf: 0,
  };

  const REDUCED = () => !!(RH.viz && RH.viz.theme && RH.viz.theme.REDUCED);

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 9) بناء الطبقة
     ══════════════════════════════════════════════════════════════════════════ */

  const { h, svg, clear } = D;

  /** أيقونة خطية موحدة السماكة ترث لون النص (لا لون بيانات في الكروم) */
  function ico(cls, ...paths) {
    return svg("svg", {
      class: "pal-ico " + (cls || ""), viewBox: "0 0 24 24",
      "aria-hidden": "true", focusable: "false",
    }, paths.map((d) => svg("path", { d })));
  }

  /** نص بشرائح إبراز المطابقة — بلا innerHTML إطلاقاً */
  function highlighted(text, query, cls) {
    const wrap = h("span", { class: cls || "pal-hl-wrap" });
    for (const seg of matchSegments(text, query)) {
      wrap.appendChild(seg.hit
        ? h("mark", { class: "pal-hl" }, seg.text)
        : document.createTextNode(seg.text));
    }
    return wrap;
  }

  /** رقاقة نوع المدخل */
  function kindChip(kind) {
    return h("span", { class: "pal-kind pal-kind-" + kind }, KIND_META[kind].chip);
  }

  /** وسم صدق مختصر (ذهبي — وسم اعتماد، لا قيمة بيانات) */
  function badgeEl(text) {
    return h("span", { class: "pal-badge" }, text);
  }

  function buildLayer() {
    instanceSeq += 1;
    state.uid = "pal-" + instanceSeq;

    const input = h("input", {
      class: "pal-input",
      id: state.uid + "-input",
      type: "text",
      autocomplete: "off",
      autocorrect: "off",
      autocapitalize: "off",
      spellcheck: "false",
      role: "combobox",
      "aria-expanded": "true",
      "aria-controls": state.uid + "-list",
      "aria-autocomplete": "list",
      "aria-label": "بحث في الأقسام والملاحق والأحياء والمقاييس",
      placeholder: "اكتب اسم قسم أو ملحق أو حي أو مقياس…",
      "data-interactive": true,
    });

    const clearBtn = h("button", {
      class: "pal-clear", type: "button", hidden: true,
      "aria-label": "مسح نص البحث",
      onclick: () => { input.value = ""; onInput(); input.focus(); },
    }, "✕");

    const closeBtn = h("button", {
      class: "pal-close", type: "button",
      "aria-label": "إغلاق لوحة الأوامر",
      onclick: () => close(),
    }, "✕");

    const countEl = h("span", { class: "pal-count", "aria-live": "polite" });

    const search = h("div", { class: "pal-search" },
      ico("pal-ico-search", "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M20 20l-4-4"),
      input, countEl, clearBtn, closeBtn,
    );

    /* شرائط المرشّح: أزرار حقيقية بدور tab — قابلة للتركيز ومفهرسة بلوحة
       المفاتيح، ولها اختصار Alt+رقم موثق في تذييل اللوحة. */
    const chips = [];
    const chipBar = h("div", {
      class: "pal-filters", role: "tablist",
      "aria-label": "حصر النتائج بنوع",
    });
    SCOPES.forEach((s, i) => {
      const btn = h("button", {
        class: "pal-chip", type: "button", role: "tab",
        id: state.uid + "-chip-" + s.id,
        "aria-selected": s.id === state.scope ? "true" : "false",
        dataset: { scope: s.id },
        title: s.sign
          ? "حصر النتائج بـ" + s.label + " — أو اكتب " + s.sign + " في مقدمة البحث"
          : "كل الأنواع",
        onclick: () => setScope(s.id, true),
      },
        h("span", { class: "pal-chip-label" }, s.label),
        h("span", { class: "pal-chip-n" }, "—"),
        h("span", { class: "pal-chip-key", "aria-hidden": "true" }, String(i + 1)),
      );
      chips.push(btn);
      chipBar.appendChild(btn);
    });

    const listEl = h("ul", {
      class: "pal-list", id: state.uid + "-list", role: "listbox",
      "aria-label": "نتائج البحث",
    });
    const emptyEl = h("div", { class: "pal-empty", hidden: true });
    const pagerEl = h("div", { class: "pal-pager" });
    const rangeEl = h("span", { class: "pal-range" });

    /* لوح الإسناد ليس منطقة حيّة: تسمية الخيار النشط (aria-label) تنطق
       القيمة ووسمها عبر aria-activedescendant، وإضافة aria-live هنا كانت
       ستُكرر النطق عند كل ضغطة سهم. */
    const previewEl = h("aside", {
      class: "pal-preview", "aria-label": "تفاصيل النتيجة المحددة",
    });

    const body = h("div", { class: "pal-body" },
      h("div", { class: "pal-results" }, listEl, emptyEl, pagerEl),
      previewEl,
    );

    const foot = h("div", { class: "pal-foot" },
      rangeEl,
      h("div", { class: "pal-hints" },
        hint("↑ ↓", "تنقّل"),
        hint("Enter", "انتقال"),
        hint("Ctrl Enter", "الملحق"),
        hint("Alt ← →", "المرشّح"),
        hint("Esc", "إغلاق"),
      ),
    );

    const panel = h("div", { class: "pal-panel" }, search, chipBar, body, foot);

    const veil = h("div", {
      class: "pal-veil",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "لوحة الأوامر — بحث وتنقّل",
      "data-interactive": true,
    }, panel);

    Object.assign(state, {
      veil, panel, input, listEl, previewEl, countEl, rangeEl,
      chips, emptyEl, pagerEl, clearBtn, closeBtn,
    });

    input.addEventListener("input", onInput);
    veil.addEventListener("keydown", onKeydown);
    veil.addEventListener("click", (e) => { if (e.target === veil) close(); });
    // النقر داخل اللوحة لا يسرق التركيز من الحقل (نمط لوحة الأوامر المعتاد)
    listEl.addEventListener("mousedown", (e) => e.preventDefault());

    return veil;
  }

  /** رقاقة تلميح مفتاح في التذييل (نص لا مفتاح — معزول اتجاهياً) */
  function hint(keys, label) {
    return h("span", { class: "pal-hint" },
      h("kbd", { class: "pal-kbd" }, keys),
      h("span", { class: "pal-hint-t" }, label),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 10) العرض
     ══════════════════════════════════════════════════════════════════════════ */

  /** جدولة إعادة عرض واحدة لكل إطار — الكتابة السريعة لا تُضاعف العمل */
  function schedule() {
    if (!CAN_DOM) return;
    if (state.raf) return;
    const raf = window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : (fn) => window.setTimeout(fn, 16);
    state.raf = raf(() => { state.raf = 0; refresh(); }) || 1;
  }

  function onInput() {
    state.page = 1;
    state.active = 0;
    schedule();
  }

  /**
   * تبديل المرشّح. إن كان في الحقل نطاق مكتوب («‎حي:» أو «‎#») فهو يتقدم على
   * الأزرار بعقد §7 — فيُزال من نص الحقل عند النقر كي لا يبدو الزر معطلاً
   * بلا سبب (صدق تفاعلي: ما يظهر مفعَّلاً يعمل).
   */
  function setScope(id, focusInput) {
    if (SCOPE_IDS.indexOf(id) === -1) return;
    if (state.input) {
      const parsed = parseQuery(state.input.value);
      if (parsed.scope !== "all") state.input.value = parsed.text;
    }
    state.scope = id;
    state.page = 1;
    state.active = 0;
    if (focusInput && state.input) state.input.focus();
    refresh();
  }

  /** النطاق الفعلي: المكتوب في الحقل يتقدم على مرشّح الأزرار */
  function effectiveScope(parsed) {
    return parsed.scope !== "all" ? parsed.scope : state.scope;
  }

  function refresh() {
    if (!state.open || !state.veil) return;
    const raw = state.input ? state.input.value : "";
    const parsed = parseQuery(raw);
    const scope = effectiveScope(parsed);
    const index = ensureIndex(false);
    state.query = parsed.text;

    /* المطابقة تجري على الفهرس كاملاً **مرة واحدة**، ثم يُرشَّح الناتج
       بالنطاق — فتعرض شرائط المرشّح عدد المطابقات الحقيقي في كل نوع
       (لا عدد الفهرس الكلي) دون تكرار البحث لكل شريحة. */
    let matched;
    if (parsed.text) {
      state.mode = "search";
      /* بلا قصّ: العدّ المعروض يجب أن يكون العدد الحقيقي للمطابقات. سقف
         ثابت كان يجعل «200 نتيجة» تُعرض بينما المطابقات أكثر — عدّ غير صادق
         مهما بدا تفصيلاً صغيراً. الفهرس بضع مئات والمطابقة خطية فالكلفة صفر. */
      matched = search(index, parsed.text, Math.max(LIMITS.SEARCH, index.length));
      state.results = filterScope(matched, scope);
    } else {
      state.mode = "start";
      matched = index;
      const st = startEntries(index, scope);
      state.results = st.items;
      state.recentCount = st.recentCount;
    }

    const pg = paginate(state.results, state.page, LIMITS.PAGE);
    state.page = pg.page;
    state.view = pg.items;
    if (state.active >= state.view.length) state.active = Math.max(0, state.view.length - 1);

    renderChips(matched, parsed);
    renderList(pg);
    renderPager(pg);
    if (state.clearBtn) state.clearBtn.hidden = !raw;
    if (state.countEl) {
      state.countEl.textContent = parsed.text
        ? (state.results.length ? resultCount(state.results.length) : "لا نتائج")
        : "";
    }
    if (state.rangeEl) state.rangeEl.textContent = rangeLabel(pg);
  }

  /**
   * حالة البدء (بلا استعلام): آخر ما فُتح ثم مقترحات من الفهرس نفسه —
   * الأقسام والملاحق. لا اختلاق لمقترحات: كلها مدخلات حقيقية، والحدود
   * تُعاد كعدد لا كوسم على الكائنات (الفهرس مشترك ولا يُلوَّث).
   */
  function startEntries(index, scope) {
    const recents = filterScope(recentModel(index, readRecent(), LIMITS.RECENT), scope);
    const seen = new Set(recents.map((e) => e.kind + "|" + e.id));
    const suggestions = [];
    for (const e of filterScope(index, scope)) {
      if (scope === "all" && e.kind !== "section" && e.kind !== "appendix") continue;
      const key = e.kind + "|" + e.id;
      if (seen.has(key)) continue;
      suggestions.push(e);
      if (scope !== "all" && suggestions.length >= LIMITS.SUGGEST) break;
    }
    return { items: recents.concat(suggestions), recentCount: recents.length };
  }

  function renderChips(pool, parsed) {
    const counts = countsByKind(pool);
    const scope = effectiveScope(parsed);
    for (const btn of state.chips) {
      const id = btn.dataset.scope;
      const on = id === scope;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      const n = btn.querySelector(".pal-chip-n");
      const value = id === "all" ? counts.all : counts[id] || 0;
      if (n) n.textContent = fmt.int(value);
      btn.classList.toggle("empty", value === 0 && !on);
      // النطاق المكتوب في الحقل يقفل المرشّح: يُعلَن ذلك بدل تعطيل صامت
      btn.classList.toggle("locked", parsed.scope !== "all" && !on);
    }
  }

  function renderList(pg) {
    if (!state.listEl) return;
    clear(state.listEl);
    // كل إعادة بناء تبدأ من أعلى القائمة: بقاء التمرير السابق كان يترك الصف
    // النشط الأول خارج الإطار بعد تغيّر الاستعلام أو الصفحة
    state.listEl.scrollTop = 0;
    state.rowEls = [];
    const q = state.query;
    let lastGroup = "";

    state.view.forEach((e, i) => {
      /* ترويسات المجموعات في حالة البدء فقط: نتائج البحث مرتبة بالدرجة
         عبر الأنواع، وتقسيمها بترويسات يكسر ذلك الترتيب. */
      const globalIndex = (pg.from || 1) - 1 + i;
      const group = state.mode === "start"
        ? (globalIndex < state.recentCount ? "آخر ما فُتح" : "ابدأ من هنا")
        : "";
      if (group && group !== lastGroup) {
        lastGroup = group;
        state.listEl.appendChild(h("li", {
          class: "pal-group", role: "presentation",
        }, group));
      }
      const row = renderRow(e, q, i);
      state.rowEls.push(row);
      state.listEl.appendChild(row);
    });

    const none = state.view.length === 0;
    state.listEl.hidden = none;
    if (state.emptyEl) {
      state.emptyEl.hidden = !none;
      if (none) renderEmpty();
    }
    applyActive(true);
  }

  /** صف نتيجة واحد — الإجابة سطر داخله (عقد §7) */
  function renderRow(e, q, i) {
    const li = h("li", {
      class: "pal-opt pal-opt-" + e.kind,
      id: state.uid + "-opt-" + i,
      role: "option",
      "aria-selected": "false",
      onclick: () => { state.active = i; applyActive(true); activate(e, false); },
      onmouseenter: () => { if (state.active !== i) { state.active = i; applyActive(false); } },
    });

    const head = h("div", { class: "pal-opt-head" },
      kindChip(e.kind),
      h("span", { class: "pal-opt-title" }, highlighted(e.title, q)),
      e.badge ? badgeEl(e.badge) : null,
    );
    li.appendChild(head);

    if (e.sub) {
      li.appendChild(h("div", { class: "pal-opt-sub" }, highlighted(e.sub, q)));
    }

    /* سطر الإجابة: القيمة + الوحدة + مرساة المصدر + الوسم الملازم.
       الوسم يسافر مع الرقم — لا سطر قيمة موسومة بلا وسمها. */
    if (e.answer) {
      const a = e.answer;
      const line = h("div", { class: "pal-answer" },
        h("b", { class: "pal-val t-" + a.tone }, a.value),
        a.unit ? h("span", { class: "pal-unit" }, a.unit) : null,
        h("span", { class: "pal-src" }, a.source),
      );
      li.appendChild(line);
      /* الوسم يظهر مرة واحدة في الصف: رقاقة الترويسة تكفي حين تحمله،
         وسطر الوسم يخدم الحالات التي لا رقاقة لها (مؤشر بلا قيمة مثلاً). */
      if (a.badge && a.badge !== e.badge) {
        li.appendChild(h("div", { class: "pal-answer-tag" }, a.badge));
      }
    }

    /* تسمية الإتاحة: النص الكامل الذي يقرأه قارئ الشاشة عند التنقل */
    li.setAttribute("aria-label", optionAria(e));
    return li;
  }

  /** تسمية إتاحة صف كاملة الصدق (النوع + العنوان + القيمة + الوسم) */
  function optionAria(e) {
    const bits = [KIND_META[e.kind].chip, e.title];
    if (e.sub) bits.push(e.sub);
    if (e.answer) {
      bits.push(e.answer.value + (e.answer.unit ? " " + e.answer.unit : ""));
      if (e.answer.badge) bits.push(e.answer.badge);
    }
    return bits.join(" — ");
  }

  function renderEmpty() {
    const el = state.emptyEl;
    clear(el);
    const parsed = parseQuery(state.input ? state.input.value : "");
    if (parsed.text) {
      el.appendChild(h("div", { class: "pal-empty-t" },
        "لا نتائج مطابقة لـ«" + parsed.text + "»"));
      el.appendChild(h("div", { class: "pal-empty-n" },
        "جرّب اسم قسم أو ملحق أو حي أو مقياس، أو امسح المرشّح لتوسيع البحث. "
        + "المطابقة تتجاوز الهمزات والتاء المربوطة والتشكيل تلقائياً."));
    } else {
      el.appendChild(h("div", { class: "pal-empty-t" }, "لا عناصر في هذا المرشّح"));
      el.appendChild(h("div", { class: "pal-empty-n" },
        "اختر «الكل» لعرض كل ما يمكن الانتقال إليه في هذا البناء."));
    }
  }

  function renderPager(pg) {
    const el = state.pagerEl;
    if (!el) return;
    clear(el);
    if (pg.pages <= 1) { el.hidden = true; return; }
    el.hidden = false;
    el.appendChild(h("button", {
      class: "pal-page-btn", type: "button", disabled: !pg.hasPrev,
      "aria-label": "الصفحة السابقة من النتائج",
      onclick: () => { state.page = pg.page - 1; state.active = 0; refresh(); },
    }, "السابقة"));
    el.appendChild(h("span", { class: "pal-page-n" },
      "الصفحة " + fmt.int(pg.page) + " من " + fmt.int(pg.pages)));
    el.appendChild(h("button", {
      class: "pal-page-btn", type: "button", disabled: !pg.hasNext,
      "aria-label": "الصفحة التالية من النتائج",
      onclick: () => { state.page = pg.page + 1; state.active = 0; refresh(); },
    }, "التالية"));
  }

  /* ── لوح الإسناد الجانبي: تفاصيل المدخل المحدد ── */

  function renderPreview() {
    const el = state.previewEl;
    if (!el) return;
    clear(el);
    const e = state.view[state.active] || null;
    if (!e) {
      el.appendChild(h("div", { class: "pal-pv-hint" },
        "حدّد نتيجة لعرض إسنادها الكامل."));
      return;
    }

    el.appendChild(h("div", { class: "pal-pv-head" },
      kindChip(e.kind),
      h("h3", { class: "pal-pv-title" }, e.title),
      e.sub ? h("div", { class: "pal-pv-sub" }, e.sub) : null,
    ));

    if (e.answer) renderAnswerBlock(el, e);
    if (e.kind === "district") renderDistrictBlock(el, e);
    // الوجهة تُعلن دائماً إلا للحي (لوحه يشرح وجهته بنفسه ولا يحتمل سطراً زائداً)
    if (e.kind !== "district") renderDestinationBlock(el, e);

    renderActions(el, e);
  }

  /** كتلة الإجابة: القيمة الكبيرة + الشريط النسبي + الإسناد + الوسم كاملاً */
  function renderAnswerBlock(el, e) {
    const a = e.answer;
    const box = h("div", { class: "pal-pv-answer" });

    box.appendChild(h("div", { class: "pal-pv-value" },
      h("b", { class: "pal-pv-num t-" + a.tone }, a.value),
      a.unit ? h("span", { class: "pal-pv-unit" }, a.unit) : null,
    ));
    if (a.compact) {
      box.appendChild(h("div", { class: "pal-pv-compact" },
        "بالصيغة التنفيذية: " + a.compact));
    }

    /* شريط النسبة المصغّر (بديل الgauge المحرّم) — الوسم يمرّ معه إلزامياً */
    if (a.pctOfBar != null && RH.viz && RH.viz.micro) {
      const su = engineSu();
      RH.viz.micro.ratioBar(box, {
        su, pct: a.pctOfBar, tone: a.tone,
        ariaLabel: e.title + " — " + a.value,
        note: a.badge || null,
      });
    }

    /* سطر الحالة يُطوى حين يكرر نص الوسم حرفياً (بطاقة الوسم أدناه تحمله
       كاملاً، وشاخص الشريط يحمله كذلك) — الوسم حاضر، والتكرار لا يزيد صدقاً */
    if (a.statusText && a.statusText !== a.badge) {
      box.appendChild(h("div", { class: "pal-pv-status" }, a.statusText));
    }
    if (a.source) {
      box.appendChild(h("div", { class: "pal-pv-src" }, a.source));
    }
    for (const line of a.extra || []) {
      box.appendChild(h("div", { class: "pal-pv-extra" }, line));
    }
    if (a.caveat) {
      box.appendChild(pendingBlock(a.badge || "وسم ملازم", a.caveat));
    }
    el.appendChild(box);
  }

  /** بطاقة وسم الصدق — بنمط `.pending-card` المعتمد بلا إعادة تعريف */
  function pendingBlock(label, text) {
    return h("div", { class: "pal-pv-caveat pending-card" },
      h("span", { class: "pending-dot", "aria-hidden": "true" }),
      h("div", {},
        h("div", { class: "pal-pv-caveat-t" }, label),
        h("div", { class: "pal-pv-caveat-n" }, text),
      ),
    );
  }

  /** كتلة الحي: أرقام قطاعه، ثم عينته بوسمها أو حالته الصادقة */
  function renderDistrictBlock(el, e) {
    const d = e.meta && e.meta.district;
    if (!d) return;
    const release = liveRelease();
    const box = h("div", { class: "pal-pv-block" });

    box.appendChild(h("div", { class: "pal-pv-block-t" },
      "أرقام " + (d.sectorName || "القطاع")));
    const rows = [];
    if (d.sectorRow) {
      rows.push({ k: "الطلب التقديري", v: fmt.int(d.sectorRow.demand), u: "سرير", t: "demand" });
      rows.push({ k: "الطاقة المرخصة", v: fmt.int(d.sectorRow.beds), u: "سرير", t: "pos" });
      rows.push({ k: "المخالفات المسجلة", v: fmt.int(d.sectorRow.violations), u: "مخالفة", t: "neg" });
    }
    if (d.sectorDerived && typeof d.sectorDerived.coverage_pct === "number") {
      rows.push({ k: "نسبة تغطية الطلب", v: fmt.pct(d.sectorDerived.coverage_pct), u: "", t: "pos" });
    }
    box.appendChild(figList(rows));

    if (d.sample) {
      const s = d.sample;
      box.appendChild(h("div", { class: "pal-pv-block-t" }, "قيم الحي من العينة"));
      box.appendChild(figList([
        { k: "الأسرّة", v: fmt.int(s.beds), u: "سرير", t: "pos" },
        { k: "رخص البناء", v: fmt.int(s.building), u: "رخصة", t: "pos" },
        { k: "الرخص التشغيلية", v: fmt.int(s.operational), u: "رخصة", t: "pos" },
        { k: "المخالفات", v: fmt.int(s.violations), u: "مخالفة", t: "neg" },
      ]));
      /* وسم العينة يلازم كل قيمة حي — بلا استثناء */
      const meta = (release && release.meta) || {};
      const nb = (release && release.neighbourhoods) || {};
      box.appendChild(pendingBlock(
        meta.sample_label || nb.label || "عينة من الأحياء المدرجة",
        nb.ranking_note || "أي ترتيب هو ضمن العينة المورّدة فقط."));
    } else {
      box.appendChild(pendingBlock("لا بيانات على مستوى الحي", honestNoData()));
    }

    /* نقاط التركّز الرقابي ضمن 3 كم — عدد ومسافة أقرب نقطة */
    const geo = liveGeo();
    if (geo && d.centroid) {
      const near = G.hotspotsNear(geo, d.centroid, 3);
      const line = near.length
        ? fmt.countNoun(near.length, {
          one: "نقطة تركّز واحدة", two: "نقطتا تركّز", few: "نقاط تركّز",
          many: "نقطة تركّز", hundred: "نقطة تركّز",
        }) + " ضمن 3 كم — أقربها على " + fmt.dec1(near[0].km) + " كم"
        : "لا نقاط تركّز رقابي ضمن 3 كم من مركز الحي";
      box.appendChild(h("div", { class: "pal-pv-extra" }, line));
      box.appendChild(h("div", { class: "pal-pv-attrib" },
        "مواقع النقاط توضيحية من سجل المنصة"));
    }
    el.appendChild(box);
  }

  /** قائمة أرقام مدمجة (تسمية/قيمة/وحدة) بنغماتها الدلالية */
  function figList(rows) {
    const wrap = h("div", { class: "pal-figs" });
    for (const r of rows) {
      if (r.v == null) continue;
      wrap.appendChild(h("div", { class: "pal-fig" },
        h("span", { class: "pal-fig-k" }, r.k),
        h("b", { class: "pal-fig-v t-" + toneOf(r.t) }, r.v),
        r.u ? h("span", { class: "pal-fig-u" }, r.u) : null,
      ));
    }
    return wrap;
  }

  /** كتلة الوجهة: ماذا يفتح هذا البند بالضبط */
  function renderDestinationBlock(el, e) {
    const box = h("div", { class: "pal-pv-block" });
    box.appendChild(h("div", { class: "pal-pv-block-t" }, "الوجهة"));
    box.appendChild(h("div", { class: "pal-pv-extra" }, destinationText(e.nav)));
    el.appendChild(box);
  }

  function destinationText(nav) {
    if (!nav) return "—";
    if (nav.kind === "report") return "وضع المستند: الموجز التنفيذي المطبوع";
    if (nav.kind === "appendix") return "ملحق داخل العرض — العودة منه تعيد حالة المستدعي";
    if (nav.id === "00") return "غلاف العرض";
    return "لوحة قسم داخل التسلسل الخطي للعرض";
  }

  /** أزرار الإجراء: الأساسي (الانتقال) والبديل (الملحق التفصيلي) */
  function renderActions(el, e) {
    const acts = h("div", { class: "pal-actions" });
    acts.appendChild(h("button", {
      class: "pal-act pal-act-main", type: "button",
      onclick: () => activate(e, false),
    }, primaryLabel(e), h("span", { class: "pal-act-key", "aria-hidden": "true" }, "Enter")));

    if (e.alt) {
      acts.appendChild(h("button", {
        class: "pal-act", type: "button",
        onclick: () => activate(e, true),
      }, e.altLabel || "الإجراء البديل",
        h("span", { class: "pal-act-key", "aria-hidden": "true" }, "Ctrl Enter")));
    }
    el.appendChild(acts);
  }

  function primaryLabel(e) {
    if (!e || !e.nav) return "انتقال";
    if (e.nav.kind === "report") return "فتح الموجز التنفيذي";
    if (e.nav.kind === "appendix") {
      return e.kind === "district" ? "فتح الأطلس على هذا الحي" : "فتح الملحق";
    }
    if (e.nav.id === "00") return "الانتقال إلى الغلاف";
    return "الانتقال إلى القسم";
  }

  /* ── تحديد الصف النشط ── */

  function applyActive(scrollTo) {
    state.rowEls.forEach((row, i) => {
      const on = i === state.active;
      row.classList.toggle("now", on);
      row.setAttribute("aria-selected", on ? "true" : "false");
    });
    const row = state.rowEls[state.active];
    if (state.input) {
      state.input.setAttribute("aria-activedescendant", row ? row.id : "");
    }
    if (row && scrollTo && typeof row.scrollIntoView === "function") {
      row.scrollIntoView({ block: "nearest" });
    }
    renderPreview();
  }

  function move(delta) {
    const n = state.view.length;
    if (!n) return;
    state.active = ((state.active + delta) % n + n) % n;
    applyActive(true);
  }

  function moveTo(i) {
    const n = state.view.length;
    if (!n) return;
    state.active = Math.max(0, Math.min(n - 1, i));
    applyActive(true);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 11) لوحة المفاتيح — تشغيل كامل بلا فأرة
     ══════════════════════════════════════════════════════════════════════════ */

  /** العناصر القابلة للتركيز داخل اللوحة (حبس Tab) */
  function focusables() {
    if (!state.panel || typeof state.panel.querySelectorAll !== "function") return [];
    return Array.from(state.panel.querySelectorAll(
      "input, button:not([disabled]), [tabindex]:not([tabindex='-1'])"))
      // `offsetParent` يعطي null داخل حاوية ثابتة الموضع في بعض المحركات،
      // فالمقياس الصادق هو وجود مستطيل مرسوم فعلاً
      .filter((el) => !el.hidden && !el.disabled
        && (!el.getClientRects || el.getClientRects().length > 0));
  }

  function onKeydown(e) {
    if (!state.open) return;
    const alt = e.altKey, ctrl = e.ctrlKey || e.metaKey;

    /* Ctrl+K داخل اللوحة: يغلقها (تبديل) — يمسكه nav.js عالمياً كذلك،
       والالتقاط هنا يمنع ازدواج البث. */
    if (ctrl && !alt && (e.code === "KeyK" || e.key === "k" || e.key === "K" || e.key === "ن")) {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }

    if (e.key === "Tab") {
      const list = focusables();
      if (list.length) {
        const i = list.indexOf(e.target);
        const next = e.shiftKey
          ? (i <= 0 ? list.length - 1 : i - 1)
          : (i === -1 || i >= list.length - 1 ? 0 : i + 1);
        e.preventDefault();
        e.stopPropagation();
        list[next].focus();
      }
      return;
    }

    /* Alt+→/← وAlt+1..5: تبديل المرشّح دون مغادرة الحقل */
    if (alt && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      e.stopPropagation();
      const i = SCOPE_IDS.indexOf(state.scope);
      // RTL: السهم الأيسر يتقدم في الشريط، والأيمن يرجع
      const step = e.key === "ArrowLeft" ? 1 : -1;
      const n = SCOPE_IDS.length;
      setScope(SCOPE_IDS[((i + step) % n + n) % n], true);
      return;
    }
    if (alt && /^[1-5]$/.test(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      setScope(SCOPE_IDS[parseInt(e.key, 10) - 1], true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault(); e.stopPropagation(); move(+1); return;
      case "ArrowUp":
        e.preventDefault(); e.stopPropagation(); move(-1); return;
      case "Home":
        if (isTextField(e.target) && state.input && state.input.value && !ctrl) break;
        e.preventDefault(); e.stopPropagation(); moveTo(0); return;
      case "End":
        if (isTextField(e.target) && state.input && state.input.value && !ctrl) break;
        e.preventDefault(); e.stopPropagation(); moveTo(state.view.length - 1); return;
      case "PageDown":
        e.preventDefault(); e.stopPropagation();
        if (state.active >= state.view.length - 1 && pageHasNext()) {
          state.page += 1; state.active = 0; refresh();
        } else { moveTo(state.active + LIMITS.PAGE_JUMP); }
        return;
      case "PageUp":
        e.preventDefault(); e.stopPropagation();
        if (state.active === 0 && state.page > 1) {
          state.page -= 1; state.active = 0; refresh();
        } else { moveTo(state.active - LIMITS.PAGE_JUMP); }
        return;
      case "Enter": {
        /* زر مركّز يفعّل نفسه (شريحة مرشّح، ترقيم، إجراء) — اختطاف Enter هنا
           كان يجعل Tab إلى الشرائح طريقاً مسدوداً بلوحة المفاتيح. */
        if (e.target && e.target.tagName === "BUTTON") return;
        e.preventDefault(); e.stopPropagation();
        const entryNow = state.view[state.active];
        if (entryNow) activate(entryNow, ctrl);
        return;
      }
      default: break;
    }

    /* أي مفتاح آخر داخل اللوحة لا يبلغ المحرك أبداً (عقد §8) */
    e.stopPropagation();
  }

  const isTextField = (el) => !!(el && el.tagName === "INPUT");

  function pageHasNext() {
    return paginate(state.results, state.page, LIMITS.PAGE).hasNext;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 12) التفعيل والملاحة
     ══════════════════════════════════════════════════════════════════════════ */

  /** هل نحن داخل مشهد حي؟ (يحدد أسلوب فتح الملحق — عقد §7) */
  function inScene() {
    const eng = RH.presenter && RH.presenter.engine;
    if (!eng || typeof eng.current !== "function") return false;
    if (CAN_DOM && !document.body.classList.contains("mode-presenter")) return false;
    const cur = eng.current();
    return !!(cur && cur.kind === "scene");
  }

  function engineSu() {
    const eng = RH.presenter && RH.presenter.engine;
    try {
      if (eng && typeof eng.su === "function") {
        const v = eng.su();
        if (Number.isFinite(v) && v > 0) return v;
      }
    } catch (_e) { /* بيئة بلا مسرح */ }
    return 1;
  }

  /**
   * تنفيذ وجهة: الأقسام عبر `engine.goScene`، والملاحق عبر
   * `engine.openAppendix` من داخل مشهد (فتُحفظ حالة العودة) أو عبر
   * `router.go` المباشر من الموجز/الملحق، والموجز عبر مساره.
   */
  function navigate(nav) {
    if (!nav) return;
    const eng = RH.presenter && RH.presenter.engine;
    const router = RH.core.router;
    if (nav.kind === "report") {
      router.go({ kind: "report", id: "main", params: nav.params || {} });
      return;
    }
    if (nav.kind === "appendix") {
      if (inScene() && eng && typeof eng.openAppendix === "function") {
        eng.openAppendix(nav.id, nav.params || {});
      } else {
        router.go({ kind: "appendix", id: nav.id, params: nav.params || {} });
      }
      return;
    }
    if (eng && typeof eng.goScene === "function") {
      eng.goScene(nav.id, nav.params || {});
    } else {
      router.go({ kind: "scene", id: nav.id, params: nav.params || {} });
    }
  }

  /** تفعيل مدخل: يحفظ الحداثة، يغلق اللوحة، ثم ينتقل */
  function activate(e, useAlt) {
    if (!e) return;
    const nav = (useAlt && e.alt) ? e.alt : e.nav;
    rememberEntry(e);
    close();
    navigate(nav);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 13) الفتح والإغلاق والتنظيف
     ══════════════════════════════════════════════════════════════════════════ */

  function open() {
    if (!CAN_DOM || state.open) {
      if (state.open && state.input) { state.input.focus(); state.input.select(); }
      return;
    }
    if (!liveRelease()) return;              // بلا إصدار لا فهرس ولا لوحة صادقة
    state.lastFocus = document.activeElement || null;
    const veil = buildLayer();
    document.body.appendChild(veil);
    document.body.classList.add("pal-open");
    state.open = true;
    state.page = 1;
    state.active = 0;
    /* كل فتح يبدأ من حالة محايدة: مرشّح «الكل» وحقل فارغ. إبقاء مرشّح
       الجلسة السابقة كان يجعل بحثاً صحيحاً يبدو بلا نتائج بلا سبب ظاهر. */
    state.scope = "all";
    if (state.input) state.input.value = "";
    ensureIndex(false);
    refresh();
    state.input.focus();

    /* مغادرة المسار (زر رجوع المتصفح مثلاً) تغلق اللوحة — لا طبقة معلّقة */
    const onHash = () => close();
    window.addEventListener("hashchange", onHash);
    state.offs.push(() => window.removeEventListener("hashchange", onHash));

    /* حارس Escape على مستوى المستند بمرحلة الالتقاط: طبقة تفاصيل قائمة تحت
       اللوحة تلتقط Escape بمرحلة الالتقاط وتوقف انتشاره، فلولا هذا الحارس
       لبقيت اللوحة مفتوحة بعد ضغطة Escape واحدة. `close()` محكم التكرار
       فلا ضرر من وصول الحدث إلى معالج الطبقة كذلك. */
    const onEsc = (ev) => {
      if (ev.key === "Escape" && state.open) close();
    };
    document.addEventListener("keydown", onEsc, true);
    state.offs.push(() => document.removeEventListener("keydown", onEsc, true));
  }

  function close() {
    if (!state.open) return;
    state.open = false;
    if (state.raf && CAN_DOM && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(state.raf);
    }
    state.raf = 0;
    for (const off of state.offs) { try { off(); } catch (_e) { /* تنظيف صامت */ } }
    state.offs = [];
    const veil = state.veil;
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    if (CAN_DOM) document.body.classList.remove("pal-open");
    state.veil = null; state.panel = null; state.input = null;
    state.listEl = null; state.previewEl = null; state.countEl = null;
    state.rangeEl = null; state.emptyEl = null; state.pagerEl = null;
    state.chips = []; state.rowEls = []; state.view = []; state.results = [];
    const back = state.lastFocus;
    state.lastFocus = null;
    if (back && typeof back.focus === "function" && back.isConnected !== false) {
      try { back.focus(); } catch (_e) { /* عنصر غادر DOM */ }
    }
  }

  function toggle() { if (state.open) close(); else open(); }
  const isOpen = () => state.open;

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 14) الربط بالناقل — اشتراك وحيد وقت التحميل (عقد §7)
     ══════════════════════════════════════════════════════════════════════════ */

  bus.on("palette:toggle", () => { try { toggle(); } catch (_e) { close(); } });
  bus.on("release:changed", () => {
    invalidate();
    if (state.open) refresh();
  });

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 15) الواجهة العامة
     ══════════════════════════════════════════════════════════════════════════ */

  const API = {
    /* دورة الحياة */
    open, close, toggle, isOpen,
    /* المنطق النقي (مُختبَر في tests/unit/palette-index.test.mjs) */
    buildIndex, search, searchScored, parseQuery, paginate, groupResults,
    countsByKind, filterScope, matchSegments, normalize, stripAl,
    scoreText, scoreEntry, kindRank, statusOf, toneOf, formatMetricValue,
    rangeLabel, resultCount, recentModel, pushRecent, honestNoData, statusLabel,
    subsequence, subsequenceSpan, tolerantTail, alWordPrefix, normMap,
    isAppendixAvailable, primaryLabel, optionAria, destinationText,
    /* ثوابت العقد */
    KINDS, KIND_ORDER, KIND_META, SCORE, LIMITS, SCOPES, SCOPE_IDS,
    STATUS_LABEL, STORE_KEY, APPENDIX_CATALOG, SECTION_FALLBACK,
    DERIVED_AR, SECTOR_FIELDS, METRIC_TONE, METRIC_SECTION, KPI_MISSING,
    /* أدوات داخلية مفيدة للتشخيص والاختبار */
    ensureIndex, invalidate,
  };

  return API;
})();
