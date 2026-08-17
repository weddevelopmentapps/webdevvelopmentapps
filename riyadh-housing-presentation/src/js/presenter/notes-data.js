/* ════════════════════════════════════════════════════════════════════════════
   notes-data.js — جدول ملاحظات المتحدث (عقد V2_CONTRACTS_EXPANSION §6.1)
   فضاء الأسماء: RH.presenter.notesData  ·  يُضمّ **قبل** presenter/tour.js
   ────────────────────────────────────────────────────────────────────────────
   ما هذا الملف بالضبط:

     ▸ **جدول ملاحظات** لكل معرف في تسلسل المحرك `engine.LINEAR` (الغلاف «00»
       ثم الأقسام التسعة): سطر افتتاح، نقاط حديث، جملة عبور، وسوم صدق ملازمة،
       أسئلة متوقعة بإجاباتها، ومراجع المصدر لكل ذلك.

     ▸ **بوابة تأليف قابلة للتنفيذ**: دوال نقية تبني «مجمع الحقائق» من الإصدار
       ذاته وتدقّق كل رقم يرد في أي نص من هذا الجدول عليه. البوابة ليست توثيقاً
       بل كود يُشغَّل: `audit()` تُستدعى في اختبار الوحدة
       (`tests/unit/notes-data.test.mjs`) فيسقط البناء إن تسرّب رقم مختلق.

   ══ قاعدة التأليف الصارمة (عقد §6.1 حرفياً) ══
   النقاط تُصاغ من نصوص `insight_panels` المعتمدة و`insights` المعتمدة وتسميات
   المقاييس القائمة **حصراً — لا أرقام جديدة**. كل رقم يرد في أي نص هنا يجب أن:
     (أ) يظهر حرفياً داخل نص لوحة رؤى/رؤية معتمدة أو نص وسم منشور، **أو**
     (ب) يكون قيمة منشورة في `release`/`derived` بأحد تنسيقات `RH.core.fmt`
         القانونية (`int` أو `dec1` أو `pct` أو `compactParts.num`)، **أو**
     (ج) يكون عدداً بنيوياً معلناً من الإصدار (عدد القطاعات، عدد المبادرات،
         عدد المؤشرات، عدد أشهر السلسلة…) — وهذه كلها محسوبة من الإصدار لا
         مكتوبة يدوياً.
   لا استثناء رابع. وكل قيمة موسومة تسافر مع وسمها أينما وردت: 81.6٪ بمنهجيتها،
   والسيناريوهات بتحفظها، وقيم الأحياء بوسم العينة، والخريطة بتنويهها، وهدف
   التغطية باسترشاديته.

   ══ ملاحظة قابلية الاختبار (عقد §0) ══
   الملف **لا يلمس `document` ولا `window`** إطلاقاً: بيانات ودوال نقية فقط،
   فيُحمَّل كما هو داخل سياق vm في اختبار الوحدة. المستهلك الوحيد للعرض هو
   `tour.js` (شريط الجولة ودرج الملاحظات) و`palette.js` إن شاء.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

RH.presenter.notesData = (function () {
  const fmt = RH.core.fmt;

  /* ══════════════════════════════════════════════════════════════════════════
     1) الترتيب القانوني ومفردات الوسوم المقفلة
     ══════════════════════════════════════════════════════════════════════════ */

  /** ترتيب الأقسام كما يبنيه `RH.sections.rebuildLinear` (الغلاف ثم التسعة).
      هذه المصفوفة **مرآة توثيقية** لا مصدر حقيقة: الجولة تقرأ `engine.LINEAR`
      الحي، والاختبار يقارن تغطية هذا الجدول بالقائمة القانونية في السجل. */
  const SECTION_ORDER = [
    "00", "summary", "demand", "licensing", "control",
    "map", "initiatives", "kpis", "forecast", "closing",
  ];

  /** وسوم الصدق: نصوص مقفلة تُذكر نطقاً مع القيمة التي تخصّها.
      كل واحد منها مشتق من نص منشور في الإصدار (يُتحقق منه في الاختبار). */
  const CAVEATS = {
    compliance:
      "معدل الامتثال 81.6٪ قيمة مورّدة — بانتظار اعتماد المنهجية (البسط والمقام "
      + "ومعالجة تعدد المخالفات).",
    scenarios:
      "سيناريوهات العجز مورّدة في ملف البيانات ولا تمثل نموذج تنبؤ معتمداً — "
      + "تُعتمد بعد توثيق الافتراضات ومالك النموذج وإصداره وطريقة التحديث.",
    sample:
      "قيم الأحياء من عينة الأحياء المدرجة في قاعدة البيانات — وأي ترتيب هو ضمن "
      + "العينة المورّدة فقط.",
    map:
      "الخريطة توضيحية، وحدود الأحياء مرسومة من طبقة الحدود المرفقة بالإصدار.",
    hotspots:
      "نقاط التركّز الرقابي مواقع توضيحية من سجل المنصة — ليست إحداثيات منشآت.",
    kpiCurrent:
      "القيم الحالية للمؤشرات تُسجَّل من داخل المنصة — غير متوفرة بعد، وتُعرض "
      + "بغيابها المعلن لا بتقدير.",
    targetIndicative:
      "هدف التغطية 60٪ استرشادي غير معتمد — يظهر بخط ذهبي متقطع بوسم «استرشادي» "
      + "ولا يدخل أي حساب.",
    nextSteps:
      "لا خطوات معتمدة بعد؛ تُدار من الإدارة ولا تُنشر خطوات ملفّقة.",
    strategyMirror:
      "المحاور والمبادرات والمؤشرات منقولة حرفياً من خطة عمل المشروع V.1.0.0.",
  };

  /* ميزانية بروفة معلنة الصيغة (أداة إيقاع للمتحدث — ليست بياناً عن القطاع):
     زمن الخطوة = أساس ثابت + زمن لكل نقطة حديث. تُعرض في الدرج مع صيغتها. */
  const BUDGET_BASE_SEC = 15;
  const BUDGET_PER_POINT_SEC = 20;
  const BUDGET_FORMULA = "زمن تقديري = 15 ثانية + 20 ثانية لكل نقطة";

  /* ══════════════════════════════════════════════════════════════════════════
     2) جدول الملاحظات
     ──────────────────────────────────────────────────────────────────────────
     شكل كل مدخل (عقد §6.1 + حقول إضافية يستهلكها الدرج):
       headline    — سطر افتتاح المتحدث (جملة واحدة)
       points      — 3..6 نقاط حديثية (نصوص لوحات الرؤى المعتمدة أو صياغة
                     تقريرية لا تُدخل رقماً خارج مجمع الحقائق)
       transition  — جملة العبور للقسم التالي ("" للخاتمة)
       sourceRefs  — معرفات لوحات الرؤى/المقاييس التي صيغت منها النقاط
       caveats     — وسوم الصدق التي **يجب** أن تُنطق مع أرقام هذا القسم
       ask         — السؤال التنفيذي الذي تفتحه اللوحة (بلا أرقام)
       qa          — أسئلة متوقعة بإجاباتها المعتمدة (دليل المقدِّم §7)
     ══════════════════════════════════════════════════════════════════════════ */
  const SECTIONS = {

    /* ── الغلاف ─────────────────────────────────────────────────────────── */
    "00": {
      headline:
        "نبدأ من إطار واحد: منصة تجمع الطلب والعرض والرقابة وخطة العمل، وكل رقم "
        + "فيها موصول بمصدره وبحالة اعتماده.",
      points: [
        "نطاق العمل أمامكم في العنوان: لوحة معلومات السكن الجماعي للأفراد في مدينة "
        + "الرياض، والبيانات حتى أغسطس 2026.",
        "فترة الرصد سبتمبر 2025 – أغسطس 2026، وكل مقارنة في العرض مقابل خط الأساس "
        + "قبل سبتمبر 2025 — لا مقارنة بلا مرجع معلن.",
        "الإصدار المعروض اجتاز 152 بوابة تحقق من 152، ورقم الإصدار وتاريخ البيانات "
        + "مثبتان في شارة أسفل الشاشة طوال العرض.",
        "ما بعد الغلاف تسع لوحات قيادة كاملة: أرقام بارزة ورسوم وعمود رؤى معتمد — "
        + "وما لم يُعتمد بعد يظهر بوسمه لا بإخفائه.",
      ],
      transition:
        "نفتح بالملخص التنفيذي: أربعة أرقام تحكم القصة كلها.",
      sourceRefs: [
        "meta.title", "meta.data_as_of", "meta.monitoring_period_label",
        "meta.baseline_label", "validation.gates_passed", "validation.gates_total",
      ],
      caveats: [],
      ask: "ما الصورة الكاملة التي نتحدث عنها اليوم، وإلى أي تاريخ؟",
      qa: [],
    },

    /* ── الملخص التنفيذي ────────────────────────────────────────────────── */
    "summary": {
      headline:
        "القراءة التنفيذية الأولى: الطلب يتجاوز العرض بفارق كبير، والعجز يتركز "
        + "جنوباً، والاتجاه يتحسن ببطء.",
      points: [
        "الطلب الحالي يتجاوز العرض بنحو 807.6 ألف سرير، بما يعادل تغطية 43.1٪ فقط "
        + "من إجمالي الاحتياج.",
        "يسجل قطاع الجنوب أدنى نسبة تغطية بين القطاعات (34.8٪) مع أعلى حجم طلب، ما "
        + "يستدعي توجيه الرخص الجديدة إليه.",
        "ارتفعت الطاقة الاستيعابية بنحو 48.5 ألف سرير منذ سبتمبر 2025 نتيجة نمو "
        + "الرخص التشغيلية النشطة.",
        "معدل الامتثال 81.6٪ معروض بوسم منهجيته: قيمة مورّدة بانتظار اعتماد البسط "
        + "والمقام — نذكرها ولا نبني عليها قراراً بعد.",
        "كل رقم في هذه اللوحة قابل للفتح: النقر يعرض أصله وورقته ومرساته وصيغته.",
      ],
      transition:
        "ندخل الآن قراءة السوق تفصيلاً في لوحة العرض والطلب.",
      sourceRefs: [
        "insight_panels.supply.sd1", "insight_panels.supply.sd2",
        "insight_panels.supply.sd3", "compliance.value",
        "derived.deficit_beds", "derived.coverage_pct",
      ],
      caveats: [CAVEATS.compliance],
      ask: "أين نقف اليوم بين ما نحتاجه وما رخّصناه فعلاً؟",
      qa: [
        {
          q: "هل رقم التغطية يشمل السكن غير المرخص؟",
          a: "لا. البسط هو الطاقة الاستيعابية المرخصة والمقام هو الطلب التقديري "
            + "الكلي، وكلاهما من ورقة المصدر بمرساة معلنة. غير المرخص موضوع مبادرة "
            + "قائمة في خطة العمل لا رقم في هذه النسبة.",
        },
      ],
    },

    /* ── العرض والطلب ───────────────────────────────────────────────────── */
    "demand": {
      headline:
        "قراءة السوق: حجم الاحتياج، وما يقابله من طاقة مرخصة، وأين تتسع الفجوة.",
      points: [
        "لا تغطي الطاقة الاستيعابية المرخصة سوى 43.1٪ من الطلب التقديري الحالي.",
        "يسجل قطاع الجنوب أعلى طلب على الأسرّة بواقع 368 ألف سرير، وأدنى نسبة "
        + "لتغطية الطلب عند 34.8٪، بينما يسجل قطاع الشرق أعلى نسبة تغطية عند 52.1٪.",
        "الفجوة المشتقة 807.6 ألف سرير — طرح معلن بين الطلب والطاقة المرخصة، لا "
        + "تقدير جديد ولا نموذج.",
        "تركيبة الطلب: الياقات الزرقاء 82.0٪ والبيضاء 18.0٪ من إجمالي الطلب — وهي "
        + "قسمة تحدد نوع المعروض المطلوب لا حجمه فقط.",
        "المعروض القائم شبه ممتلئ: معدل الإشغال 91.7٪ من الطاقة المرخصة، والشاغر "
        + "50,829 سريراً — فالتوسعة لا تنافس فراغاً قائماً.",
      ],
      transition:
        "من حجم الفجوة إلى ما يُرخَّص فعلاً: لوحة التراخيص.",
      sourceRefs: [
        "insights.s03", "insights.s04", "insight_panels.supply.sd1",
        "derived.deficit_beds", "derived.blue_share_pct", "derived.white_share_pct",
        "derived.occupancy_pct", "derived.vacant_beds",
      ],
      caveats: [CAVEATS.targetIndicative],
      ask: "كم يبعد المعروض المرخص عن الاحتياج، وأين تحديداً؟",
      qa: [
        {
          q: "هدف التغطية 60٪؟",
          a: "استرشادي غير معتمد: يظهر بخط ذهبي متقطع بوسم «استرشادي» حصراً ولا "
            + "يدخل أي حساب في اللوحات.",
        },
        {
          q: "لماذا الإشغال أقل من مئة بالمئة والفجوة بهذا الحجم؟",
          a: "الإشغال يقيس ما هو مشغول من المرخص فقط. الشاغر 50,829 سريراً موزع "
            + "جغرافياً ونوعياً لا يقابل بالضرورة موقع الطلب أو فئته.",
        },
      ],
    },

    /* ── التراخيص ───────────────────────────────────────────────────────── */
    "licensing": {
      headline:
        "منظومة الترخيص تتحرك: العدد ينمو أسرع من الطاقة، وهذه هي رسالة اللوحة.",
      points: [
        "أضيفت 22 رخصة تشغيلية نشطة منذ سبتمبر 2025 ليبلغ الإجمالي 140 رخصة بنمو "
        + "سنوي قدره 18.6٪.",
        "ارتفع عدد رخص البناء 50.0٪ منذ خط الأساس، مقابل نمو 8.6٪ في الطاقة "
        + "الاستيعابية المرخصة.",
        "الفارق بين النموّين هو الخلاصة التنفيذية: رخص أكثر لا تعني أسرّة أكثر "
        + "بالنسبة ذاتها — حجم المشروع المرخص هو المتغير.",
        "يستحوذ قطاعا الشرق والشمال على النصيب الأكبر من الرخص النشطة، مقابل حضور "
        + "أقل في قطاع الغرب.",
        "يتصدر قطاع الشرق رخص البناء (26 رخصة)، والرخص التشغيلية (34 رخصة)، "
        + "والطاقة الاستيعابية المرخصة (172,400 سرير).",
      ],
      transition:
        "ننتقل من الإذن إلى الإنفاذ: لوحة الرقابة الميدانية.",
      sourceRefs: [
        "insight_panels.licensing.ld1", "insight_panels.licensing.ld2",
        "insight_panels.licensing.ld3", "insights.s05", "insights.s06",
        "derived.growth_building_pct", "derived.growth_beds_pct",
      ],
      caveats: [],
      ask: "هل يتحرك المعروض المرخص بالسرعة التي تسدّ بها الفجوة؟",
      qa: [
        {
          q: "لماذا ينمو عدد الرخص 50.0٪ والطاقة 8.6٪ فقط؟",
          a: "لأن النمو في العدد جاء بمشاريع أصغر متوسطاً من مشاريع خط الأساس. "
            + "اللوحة تعرض المسار التراكمي والإصدار الشهري الصافي معاً كي يُقرأ "
            + "الرقمان بجانب بعضهما لا بديلين عن بعض.",
        },
      ],
    },

    /* ── الرقابة الميدانية ──────────────────────────────────────────────── */
    "control": {
      headline:
        "الإنفاذ الميداني: أين تتركز المخالفات، وكيف توزعت القدرة الرقابية مقابلها.",
      points: [
        "سجل قطاع الجنوب 1,367 مخالفة خلال آخر 12 شهراً، وهو الأعلى بين القطاعات "
        + "بفارق كبير عن المتوسط.",
        "هذا الرقم يمثل 37.8٪ من إجمالي مخالفات المدينة، ويبلغ عدد المراقبين في "
        + "القطاع 3.",
        "يغطي قطاعَي الجنوب والغرب ثلاثة مراقبين لكل منهما رغم تباين حجم المخالفات، "
        + "ما يشير إلى حاجة لإعادة الموازنة.",
        "التوصية المعتمدة صريحة: يوصى بإعادة توزيع المراقبين وفق كثافة المخالفات "
        + "المسجلة لكل قطاع.",
        "معدل الامتثال 81.6٪ يظهر دائماً بوسم «قيمة مورّدة — بانتظار اعتماد "
        + "المنهجية»؛ لا نقارن به ولا نبني عليه قراراً قبل الاعتماد.",
      ],
      transition:
        "نضع هذه الأرقام على الأرض: خريطة الرياض التفاعلية.",
      sourceRefs: [
        "insight_panels.control.cd1", "insight_panels.control.cd2",
        "insight_panels.control.cd3", "insights.s07",
        "metrics.south_violations", "derived.south_violations_share_pct",
        "compliance.value",
      ],
      caveats: [CAVEATS.compliance],
      ask: "هل القدرة الرقابية موزعة حيث تقع المخالفات فعلاً؟",
      qa: [
        {
          q: "لماذا 81.6٪ امتثالاً وليست معتمدة؟",
          a: "القيمة مورّدة في ملف البيانات وحالتها «بانتظار اعتماد المنهجية»؛ "
            + "بطاقة «معدل الامتثال» في هذه اللوحة تعرض المعالجة كاملة: البسط "
            + "والمقام ومعالجة تعدد المخالفات لم تُعتمد بعد.",
        },
        {
          q: "أين سجل المفتشين التفصيلي؟",
          a: "محجوز خارج العرض لتعارضه مع الإجماليات المعتمدة — قرار مطابقة معلن "
            + "في ملحق المنهجية، والمعروض هنا هو الإجماليات المعتمدة وحدها.",
        },
      ],
    },

    /* ── الخريطة ────────────────────────────────────────────────────────── */
    "map": {
      headline:
        "الجغرافيا تحسم الأولوية: القراءة نفسها موزعة على حدود الأحياء الحقيقية.",
      points: [
        "يسجل قطاع الجنوب أعلى طلب على الأسرّة بواقع 368 ألف سرير، وأدنى نسبة "
        + "لتغطية الطلب عند 34.8٪، بينما يسجل قطاع الشرق أعلى نسبة تغطية عند 52.1٪.",
        "التلوين يتبدل بين الطلب والتغطية والمخالفات على الحدود ذاتها — القراءة "
        + "الواحدة بثلاث عدسات لا ثلاث خرائط مختلفة.",
        "قيم الأحياء تحمل وسم العينة: عينة من الأحياء المدرجة في قاعدة البيانات، "
        + "وأي ترتيب هو ضمن العينة المورّدة فقط.",
        "نقاط التركّز الرقابي مواقع توضيحية من سجل المنصة — تفيد في تحديد نطاق "
        + "الجولة لا في تحديد منشأة بعينها.",
        "الخريطة تعمل دون اتصال بإسقاط محلي، وتتحول تلقائياً إلى بلاطات حية عند "
        + "توفر الشبكة — لا شيء في العرض يعتمد على الاتصال.",
      ],
      transition:
        "من التشخيص إلى التحرك: محفظة المبادرات والركائز.",
      sourceRefs: [
        "insights.s04", "neighbourhoods.label", "neighbourhoods.ranking_note",
        "meta.map_disclaimer", "derived.sector_derived",
      ],
      caveats: [CAVEATS.map, CAVEATS.sample, CAVEATS.hotspots],
      ask: "أين توضع الرخصة التالية والجولة الرقابية التالية؟",
      qa: [
        {
          q: "هل حدود الأحياء رسمية؟",
          a: "الخريطة توضيحية وحدودها من طبقة الحدود المرفقة بالإصدار، وسطر "
            + "الإسناد مثبت أسفل الخريطة. لا تُستخدم في قرار مساحي.",
        },
      ],
    },

    /* ── المبادرات والركائز ─────────────────────────────────────────────── */
    "initiatives": {
      headline:
        "التحرك الاستراتيجي: محفظة منقولة حرفياً من خطة العمل بحالتها كما هي.",
      points: [
        "المحفظة 18 مبادرة موزعة على 4 محاور، منقولة حرفياً من خطة عمل المشروع "
        + "V.1.0.0 دون إعادة صياغة.",
        "اكتملت دراسة الطلب والعرض (1.1) وتفعيل الرقابة الاستباقية (3.1) وفق خطة "
        + "العمل المعتمدة.",
        "سبع مبادرات تجاوزت تاريخ نهايتها المخطط دون تسجيل إنجاز فتُعد متأخرة "
        + "حكماً — يوصى بتحديث حالاتها في خطة العمل.",
        "تمتد المبادرات التسع الجارية حتى أبريل 2027، وأطولها مدةً تقنين السكن غير "
        + "المرخص وإلزام التسكين المرخص.",
        "قاعدة الحالة معلنة: الحالة المعروضة هي حالة الملف إن وُجدت، وإلا فتجاوز "
        + "تاريخ النهاية يجعلها متأخرة حكماً — الاشتقاق ظاهر لا مخفي.",
      ],
      transition:
        "وكيف نقيس أثر هذا كله؟ لوحة مؤشرات الأداء.",
      sourceRefs: [
        "insight_panels.initiatives.id1", "insight_panels.initiatives.id2",
        "insight_panels.initiatives.id3", "strategy.source", "strategy.status_rule",
        "strategy.initiatives", "strategy.required_pillars",
      ],
      caveats: [CAVEATS.strategyMirror],
      ask: "ما الذي أُنجز فعلاً من الخطة، وما الذي تأخر ولماذا؟",
      qa: [
        {
          q: "من يحدّث حالات المبادرات؟",
          a: "الحالة تأتي من ملف خطة العمل، وتحديثها يتم من الإدارة ثم يُنشر "
            + "بإصدار جديد. المنصة لا تعدّل حالة مبادرة من تلقائها.",
        },
      ],
    },

    /* ── مؤشرات الأداء ──────────────────────────────────────────────────── */
    "kpis": {
      headline:
        "قياس الأثر: مؤشرات الخطة كما وردت، بخط أساسها ومستهدفها، وبفراغها المعلن.",
      points: [
        "14 مؤشراً منقولة حرفياً من خطة العمل بخط أساس ومستهدف لكل منها — لا مؤشر "
        + "مضاف ولا مستهدف معدَّل.",
        "القيم الحالية غير متوفرة: تُسجَّل من داخل المنصة، والمنصة تعلن غيابها بدل "
        + "تعبئة الفراغ بتقدير.",
        "المؤشر 5 «عدد الأسرّة المرخصة في مدينة الرياض» خط أساسه 130,000 ومستهدفه "
        + "260,000 — نطاق تعريفي يخص منظومة الترخيص المحدثة.",
        "هذا الرقم يختلف تعريفياً عن 612,400 سرير الطاقة المرخصة المعلنة في "
        + "اللوحات، والحاشية مثبتة على بطاقة المؤشر نفسها.",
        "لا نقارن مؤشراً بمؤشر عبر تعريفين مختلفين: توحيد التعريف يُعتمد مع تسجيل "
        + "القيم الحالية من المنصة.",
      ],
      transition:
        "ننتقل إلى ما ينتظرنا: سيناريوهات العجز.",
      sourceRefs: [
        "strategy.kpis", "strategy.kpis[5].baseline", "strategy.kpis[5].target",
        "metrics.licensed_beds", "strategy.source",
      ],
      caveats: [CAVEATS.kpiCurrent, CAVEATS.strategyMirror],
      ask: "بماذا سنحكم على نجاح الخطة، ومتى تصبح المؤشرات قابلة للقياس؟",
      qa: [
        {
          q: "خطتكم تستهدف 260,000 سرير مرخص ولوحتكم تقول 612,400 مرخصة اليوم؟",
          a: "القيمتان منقولتان حرفياً من خطة العمل المعتمدة، ونطاق قياس هذا "
            + "المؤشر يخص منظومة ترخيص السكن الجماعي المحدثة — وهو يختلف تعريفياً "
            + "عن إجمالي الطاقة الاستيعابية المرخصة المعلن في اللوحات (612,400 "
            + "سرير من ورقة المصدر التشغيلية). توحيد التعريفين يُعتمد مع تسجيل "
            + "القيم الحالية من المنصة، ولذلك تعرض المنصة القيم الحالية غير "
            + "المتوفرة بصدق بدل خلط التعريفين.",
        },
      ],
    },

    /* ── سيناريوهات العجز ───────────────────────────────────────────────── */
    "forecast": {
      headline:
        "ما ينتظرنا إن لم يتغير شيء: ثلاث قراءات مورّدة، تُعرض بتحفظها كاملاً.",
      points: [
        "السيناريوهات الثلاثة مورّدة في ملف البيانات ولا تمثل نموذج تنبؤ معتمداً — "
        + "هذه الجملة تُقال مع كل رقم في هذه اللوحة.",
        "تُعتمد بعد توثيق الافتراضات ومالك النموذج وإصداره وطريقة التحديث؛ حتى ذلك "
        + "الحين هي مؤشر اتجاه لا التزام رقمي.",
        "الأفق المعروض سبتمبر 2026 – يونيو 2027 كما ورد في الملف: لا استيفاء بين "
        + "الأشهر ولا امتداد خارج الأفق المورّد.",
        "نقطة الانطلاق المعتمدة هي فجوة اليوم 807.6 ألف سرير — القراءات الثلاث "
        + "تُقرأ مقابلها لا مقابل بعضها فقط.",
        "المسافة بين المتحفظ والمتفائل هي رسالة اللوحة: اتساع النطاق يقيس عدم "
        + "اليقين، لا خطأ أحد السيناريوهين.",
      ],
      transition:
        "نغلق بالحقائق المتحقق منها والتوصيات المعتمدة.",
      sourceRefs: [
        "scenarios.caveat", "scenarios.status", "scenarios.title",
        "derived.deficit_beds",
      ],
      caveats: [CAVEATS.scenarios],
      ask: "إلى أين تتجه الفجوة إن بقي الإيقاع الحالي؟",
      qa: [
        {
          q: "هل هذه توقعات المنصة؟",
          a: "لا. هي قيم مورّدة في ملف البيانات، وحالتها «مورّدة غير متحقق منها». "
            + "المنصة تعرضها كما وردت مع تحفظها، ولا تشتق منها التزاماً.",
        },
      ],
    },

    /* ── الخاتمة ────────────────────────────────────────────────────────── */
    "closing": {
      headline:
        "الخلاصة في ثلاث حقائق متحقق منها، وتوصيات كلها مسندة إلى لوحات معتمدة.",
      points: [
        "لا تغطي الطاقة الاستيعابية المرخصة سوى 43.1٪ من الطلب التقديري الحالي.",
        "سجل قطاع الجنوب 1,367 مخالفة خلال آخر 12 شهراً، وهو الأعلى بين القطاعات "
        + "بفارق كبير عن المتوسط.",
        "سبع مبادرات تجاوزت تاريخ نهايتها المخطط دون تسجيل إنجاز فتُعد متأخرة "
        + "حكماً — يوصى بتحديث حالاتها في خطة العمل.",
        "كل توصية معروضة مشتقة من لوحة رؤى معتمدة بعينها — لا توصية بلا مصدر "
        + "ظاهر بجانبها.",
        "لا خطوات معتمدة بعد؛ تُدار من الإدارة ولا تُنشر خطوات ملفّقة — وهذا ما "
        + "نطلب اعتماده اليوم.",
      ],
      transition: "",
      sourceRefs: [
        "insights.s03", "insight_panels.control.cd1",
        "insight_panels.initiatives.id2", "next_steps.status", "next_steps.note",
      ],
      caveats: [CAVEATS.nextSteps],
      ask: "ما القرار المطلوب اليوم، وما الذي يفتحه؟",
      qa: [
        {
          q: "ما الذي تحتاجونه منا الآن؟",
          a: "اعتماد منهجية الامتثال، واعتماد نموذج السيناريوهات بمالكه وافتراضاته، "
            + "وتسجيل القيم الحالية للمؤشرات من المنصة. الثلاثة معروضة اليوم "
            + "بحالتها المعلنة لا بفراغ صامت.",
        },
      ],
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     3) أدوات نصية نقية
     ══════════════════════════════════════════════════════════════════════════ */

  /* محارف التحكم الاتجاهي التي يحقنها fmt (LRI/PDI) — تُزال قبل أي مطابقة */
  const BIDI = /[⁦-⁩‎‏]/g;

  /** كل رقم يظهر في نص، مطبَّعاً: «(43.1٪)» → ["43.1"] و«172,400 سرير» →
      ["172,400"]. الفواصل والنقاط الطرفية تُقصّ فلا يتسرب ترقيم الجملة. */
  function numbersIn(text) {
    if (text == null) return [];
    const clean = String(text).replace(BIDI, "");
    const out = [];
    const re = /\d[\d.,]*/g;
    let m;
    while ((m = re.exec(clean)) !== null) {
      const tok = m[0].replace(/[.,]+$/, "");
      if (tok) out.push(tok);
    }
    return out;
  }

  /** كل النصوص القابلة للنطق داخل مدخل ملاحظات (ما يخضع لبوابة الأرقام) */
  function textsOf(note) {
    if (!note) return [];
    const out = [];
    if (note.headline) out.push(note.headline);
    for (const p of note.points || []) out.push(p);
    if (note.transition) out.push(note.transition);
    if (note.ask) out.push(note.ask);
    for (const c of note.caveats || []) out.push(c);
    for (const qa of note.qa || []) {
      if (qa && qa.q) out.push(qa.q);
      if (qa && qa.a) out.push(qa.a);
    }
    return out;
  }

  /** عدد كلمات تقريبي — يُستعمل لقياس كثافة النقطة في الدرج (أداة إيقاع) */
  function wordCount(text) {
    const s = String(text == null ? "" : text).trim();
    if (!s) return 0;
    return s.split(/\s+/).filter(Boolean).length;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) مجمع الحقائق — كل ما يجوز أن يُنطق رقماً
     ══════════════════════════════════════════════════════════════════════════ */

  /** يضيف كل التنسيقات القانونية لقيمة رقمية منشورة إلى المجمع */
  function pushNumber(set, v) {
    if (v == null || typeof v !== "number" || !Number.isFinite(v)) return;
    const abs = Math.abs(v);
    set.add(String(v));                       // الصورة الخام
    set.add(fmt.int(v).replace(BIDI, ""));    // 172,400
    set.add(fmt.dec1(v).replace(BIDI, ""));   // 82.0
    set.add(fmt.pct(v).replace(BIDI, "").replace("٪", "")); // 43.1
    const cp = fmt.compactParts(v);
    if (cp && cp.num != null) set.add(String(cp.num));       // 807.6 / 368
    // النسب المخزّنة كسوراً (مؤشرات الخطة: 0.8 ⇒ 80) تُعرض مضروبة في مئة
    if (abs > 0 && abs <= 1) {
      const asPct = Math.round(v * 1000) / 10;
      set.add(String(asPct));
      set.add(fmt.dec1(asPct).replace(BIDI, ""));
      set.add(fmt.int(asPct).replace(BIDI, ""));
    }
    // القيم الصحيحة الكبيرة تُنطق أحياناً بالآلاف المجردة (48.5 ألف ⇐ 48,500)
    if (Number.isInteger(v) && abs >= 1000) {
      set.add(fmt.int(Math.round(v / 1000)).replace(BIDI, ""));
    }
  }

  /** عدد بنيوي معلن (طول مجموعة منشورة) — الصفر ليس حقيقة منشورة فيُتجاهل */
  function pushCount(set, n) {
    if (typeof n === "number" && n > 0) pushNumber(set, n);
  }

  /** يضيف كل أرقام نص منشور (النص نفسه حجة الاعتماد) */
  function pushText(pool, text) {
    if (text == null) return;
    const s = String(text);
    if (!s) return;
    pool.texts.push(s);
    for (const tok of numbersIn(s)) pool.numbers.add(tok);
  }

  /** مشي عميق يجمع كل قيمة رقمية منشورة في شجرة الإصدار (المجمع الواسع) */
  function collectDeep(node, set, depth) {
    if (node == null || depth > 8) return;
    if (typeof node === "number") { pushNumber(set, node); return; }
    if (typeof node === "string") {
      for (const tok of numbersIn(node)) set.add(tok);
      return;
    }
    if (Array.isArray(node)) {
      pushNumber(set, node.length);
      for (const item of node) collectDeep(item, set, depth + 1);
      return;
    }
    if (typeof node === "object") {
      const keys = Object.keys(node);
      for (const k of keys) collectDeep(node[k], set, depth + 1);
    }
  }

  /**
   * مجمع الحقائق **المعتمد** (الضيق): مصادره معلنة صراحةً بند بند، فهو بوابة
   * تأليف حقيقية لا شبكة تلتقط كل شيء. يعيد:
   *   { numbers: Set<String>, texts: [String], sources: [String] }
   */
  function factPool(release, derived) {
    const pool = { numbers: new Set(), texts: [], sources: [] };
    if (!release) return pool;
    const src = (label) => pool.sources.push(label);

    /* (أ) نصوص لوحات الرؤى المعتمدة — المصدر الأول للتأليف */
    const panels = release.insight_panels && release.insight_panels.sections;
    if (panels) {
      src("insight_panels.sections");
      for (const key of Object.keys(panels)) {
        for (const p of panels[key] || []) {
          pushText(pool, p.title);
          pushText(pool, p.text);
        }
      }
    }

    /* (ب) الرؤى المعتمدة القصيرة (s03…s07) */
    if (release.insights) {
      src("insights");
      for (const k of Object.keys(release.insights)) {
        pushText(pool, release.insights[k] && release.insights[k].text);
      }
    }

    /* (ج) نصوص الهوية والوسوم المنشورة */
    const meta = release.meta || {};
    src("meta");
    for (const k of ["title", "data_as_of", "monitoring_period_label",
      "baseline_label", "comparison_qualifier", "calculation_date",
      "map_disclaimer", "sample_label", "presentation_date",
      "monitoring_period_start", "monitoring_period_end"]) {
      pushText(pool, meta[k]);
    }
    if (release.release) {
      src("release");
      pushText(pool, release.release.id);
      pushText(pool, release.release.notes);
      pushText(pool, release.release.published_at);
    }
    for (const s of release.sources || []) {
      src("sources[]");
      pushText(pool, s.name);
      pushText(pool, s.template_version);
    }

    /* (د) القيم المنشورة: المقاييس الخام والمشتقة بتسمياتها وصيغها */
    for (const bag of ["metrics", "derived"]) {
      const obj = release[bag];
      if (!obj) continue;
      src(bag);
      for (const k of Object.keys(obj)) {
        const m = obj[k];
        if (!m || typeof m !== "object") continue;
        pushNumber(pool.numbers, m.value);
        pushText(pool, m.label);
        pushText(pool, m.formula);
      }
    }
    /* المشتقات القطاعية (كائن متداخل خارج نمط {value}) */
    const sd = release.derived && release.derived.sector_derived;
    if (sd) {
      src("derived.sector_derived");
      for (const sec of Object.keys(sd)) {
        for (const k of Object.keys(sd[sec] || {})) pushNumber(pool.numbers, sd[sec][k]);
      }
    }
    /* المشتقات الحية كما يحسبها محرك الاشتقاق (مرآة ما يعرضه المسرح) */
    if (derived && typeof derived === "object") {
      src("derived(live)");
      for (const k of Object.keys(derived)) {
        const v = derived[k];
        if (typeof v === "number") pushNumber(pool.numbers, v);
        else if (v && typeof v === "object") {
          for (const kk of Object.keys(v)) {
            const vv = v[kk];
            if (typeof vv === "number") pushNumber(pool.numbers, vv);
            else if (vv && typeof vv === "object") {
              for (const kkk of Object.keys(vv)) pushNumber(pool.numbers, vv[kkk]);
            }
          }
        }
      }
    }

    /* (هـ) القيم الموسومة: الامتثال والهدف الاسترشادي بنصوصها الملازمة */
    for (const key of ["compliance", "coverage_target_indicative"]) {
      const c = release[key];
      if (!c) continue;
      src(key);
      pushNumber(pool.numbers, c.value);
      pushText(pool, c.label);
      pushText(pool, c.note);
      pushText(pool, c.status);
    }

    /* (و) الصفوف القطاعية والشهرية وسلاسل التصنيف */
    for (const row of release.sectors || []) {
      src("sectors[]");
      for (const k of Object.keys(row)) pushNumber(pool.numbers, row[k]);
    }
    const monthly = release.monthly || {};
    for (const key of Object.keys(monthly)) {
      src("monthly." + key);
      pushCount(pool.numbers, (monthly[key] || []).length);
      for (const row of monthly[key] || []) {
        for (const k of Object.keys(row)) {
          if (typeof row[k] === "number") pushNumber(pool.numbers, row[k]);
          else if (typeof row[k] === "string") pushText(pool, row[k]);
        }
      }
    }
    for (const key of ["facility_types", "economic_activities", "violation_types"]) {
      const arr = release[key] || [];
      src(key);
      pushCount(pool.numbers, arr.length);
      for (const row of arr) {
        for (const k of Object.keys(row)) {
          if (typeof row[k] === "number") pushNumber(pool.numbers, row[k]);
        }
      }
    }
    if (release.collar) {
      src("collar");
      for (const k of Object.keys(release.collar)) pushNumber(pool.numbers, release.collar[k]);
    }
    if (release.baseline) {
      src("baseline");
      for (const k of Object.keys(release.baseline)) pushNumber(pool.numbers, release.baseline[k]);
    }

    /* (ز) عينة الأحياء بوسمها الملازم */
    const nb = release.neighbourhoods;
    if (nb) {
      src("neighbourhoods");
      pushText(pool, nb.label);
      pushText(pool, nb.ranking_note);
      pushCount(pool.numbers, (nb.rows || []).length);
      for (const row of nb.rows || []) {
        for (const k of Object.keys(row)) {
          if (typeof row[k] === "number") pushNumber(pool.numbers, row[k]);
        }
      }
    }

    /* (ح) السيناريوهات المورّدة بتحفظها */
    const sc = release.scenarios;
    if (sc) {
      src("scenarios");
      pushText(pool, sc.title);
      pushText(pool, sc.caveat);
      pushText(pool, sc.status);
      pushCount(pool.numbers, (sc.rows || []).length);
      for (const row of sc.rows || []) {
        for (const k of Object.keys(row)) {
          if (typeof row[k] === "number") pushNumber(pool.numbers, row[k]);
          else if (k === "label" || k === "iso") pushText(pool, row[k]);
        }
      }
    }

    /* (ط) الخطة: المحاور والمبادرات والمؤشرات — أعداد بنيوية وقيم منشورة */
    const st = release.strategy;
    if (st) {
      src("strategy");
      pushText(pool, st.source);
      pushText(pool, st.note);
      pushText(pool, st.status_rule);
      pushNumber(pool.numbers, st.required_pillars);
      pushCount(pool.numbers, (st.pillars || []).length);
      pushCount(pool.numbers, (st.initiatives || []).length);
      pushCount(pool.numbers, (st.kpis || []).length);
      for (const p of st.pillars || []) pushText(pool, p.name);
      for (const ini of st.initiatives || []) {
        pushText(pool, ini.id);
        pushText(pool, ini.name);
        pushText(pool, ini.start);
        pushText(pool, ini.end);
      }
      for (const k of st.kpis || []) {
        pushNumber(pool.numbers, k.id);
        pushNumber(pool.numbers, k.baseline);
        pushNumber(pool.numbers, k.target);
        pushNumber(pool.numbers, k.current);
        pushText(pool, k.name);
        pushText(pool, k.current_note);
      }
      for (const v of st.status_vocabulary || []) pushText(pool, v);
    }

    /* (ي) الخطوات القادمة وبوابات التحقق */
    if (release.next_steps) {
      src("next_steps");
      pushText(pool, release.next_steps.note);
      pushText(pool, release.next_steps.status);
      pushCount(pool.numbers, (release.next_steps.items || []).length);
    }
    if (release.validation) {
      src("validation");
      pushNumber(pool.numbers, release.validation.gates_passed);
      pushNumber(pool.numbers, release.validation.gates_total);
      pushText(pool, release.validation.checked_at);
    }

    return pool;
  }

  /** المجمع الواسع: كل رقم موجود فعلاً في شجرة الإصدار (تشخيص لا بوابة) */
  function releasePool(release, derived) {
    const set = new Set();
    collectDeep(release, set, 0);
    if (derived) collectDeep(derived, set, 0);
    return set;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) التدقيق — بوابة «لا رقم مختلق» قابلة للتشغيل
     ══════════════════════════════════════════════════════════════════════════ */

  /** يفحص نصاً واحداً على مجمعين: المعتمد (الضيق) وشجرة الإصدار (الواسع) */
  function verifyText(text, pool, wide) {
    const found = numbersIn(text);
    const offenders = [];
    const fabricated = [];
    for (const tok of found) {
      const inPool = pool.numbers.has(tok);
      if (inPool) continue;
      offenders.push(tok);
      if (!wide || !wide.has(tok)) fabricated.push(tok);
    }
    return { numbers: found, offenders, fabricated, ok: offenders.length === 0 };
  }

  /**
   * تدقيق شامل للجدول كله مقابل إصدار حقيقي.
   * ids: قائمة المعرفات المطلوبة (تُمرَّر `engine.LINEAR` وقت التشغيل، وقائمة
   * السجل القانونية في الاختبار). يعيد تقريراً قابلاً للطباعة في رسالة فشل.
   */
  function audit(release, derived, ids) {
    const want = Array.isArray(ids) && ids.length ? ids.slice() : SECTION_ORDER.slice();
    const pool = factPool(release, derived);
    const wide = releasePool(release, derived);
    const report = {
      ok: true,
      checkedSections: 0,
      checkedTexts: 0,
      checkedNumbers: 0,
      missing: [],       // معرفات مطلوبة بلا ملاحظات
      extra: [],         // ملاحظات لمعرفات خارج التسلسل
      offenders: [],     // {section, field, text, number} خارج المجمع المعتمد
      fabricated: [],    // خارج شجرة الإصدار كلياً — كارثة صدق
      shape: [],         // مخالفات شكل المدخل (عدد النقاط، الحقول الإلزامية)
      poolSize: pool.numbers.size,
      poolSources: pool.sources.slice(),
    };

    for (const id of want) {
      if (!SECTIONS[id]) { report.missing.push(id); report.ok = false; }
    }
    for (const id of Object.keys(SECTIONS)) {
      if (!want.includes(id)) { report.extra.push(id); report.ok = false; }
    }

    for (const id of want) {
      const note = SECTIONS[id];
      if (!note) continue;
      report.checkedSections++;

      /* شكل المدخل: العقد يوجب 3..6 نقاط وحقولاً نصية حاضرة */
      if (typeof note.headline !== "string" || !note.headline.trim()) {
        report.shape.push({ section: id, issue: "headline فارغ" });
      }
      if (!Array.isArray(note.points) || note.points.length < 3 || note.points.length > 6) {
        report.shape.push({ section: id, issue: "عدد النقاط خارج المدى 3..6" });
      }
      if (typeof note.transition !== "string") {
        report.shape.push({ section: id, issue: "transition ليس نصاً" });
      }
      if (!Array.isArray(note.sourceRefs) || !note.sourceRefs.length) {
        report.shape.push({ section: id, issue: "sourceRefs فارغة" });
      }

      const fields = [];
      fields.push({ field: "headline", text: note.headline });
      (note.points || []).forEach((p, i) => fields.push({ field: "points[" + i + "]", text: p }));
      fields.push({ field: "transition", text: note.transition });
      fields.push({ field: "ask", text: note.ask });
      (note.caveats || []).forEach((c, i) => fields.push({ field: "caveats[" + i + "]", text: c }));
      (note.qa || []).forEach((qa, i) => {
        fields.push({ field: "qa[" + i + "].q", text: qa && qa.q });
        fields.push({ field: "qa[" + i + "].a", text: qa && qa.a });
      });

      for (const f of fields) {
        if (f.text == null || f.text === "") continue;
        report.checkedTexts++;
        const res = verifyText(f.text, pool, wide);
        report.checkedNumbers += res.numbers.length;
        for (const n of res.offenders) {
          report.offenders.push({ section: id, field: f.field, number: n, text: f.text });
        }
        for (const n of res.fabricated) {
          report.fabricated.push({ section: id, field: f.field, number: n, text: f.text });
        }
      }
    }

    if (report.offenders.length || report.fabricated.length || report.shape.length) {
      report.ok = false;
    }
    return report;
  }

  /** سطر فشل مقروء يُلحق برسالة الاختبار (لا يبني الاختبار نصه بنفسه) */
  function auditMessage(report) {
    if (!report) return "لا تقرير";
    const lines = [];
    lines.push("أقسام مفحوصة: " + fmt.int(report.checkedSections)
      + " · نصوص: " + fmt.int(report.checkedTexts)
      + " · أرقام: " + fmt.int(report.checkedNumbers)
      + " · حجم المجمع: " + fmt.int(report.poolSize));
    if (report.missing.length) lines.push("معرفات بلا ملاحظات: " + report.missing.join("، "));
    if (report.extra.length) lines.push("ملاحظات زائدة: " + report.extra.join("، "));
    for (const s of report.shape) lines.push("شكل: " + s.section + " — " + s.issue);
    for (const o of report.offenders) {
      lines.push("رقم خارج المجمع المعتمد: «" + o.number + "» في " + o.section + "/" + o.field);
    }
    for (const o of report.fabricated) {
      lines.push("رقم مختلق (خارج الإصدار كلياً): «" + o.number + "» في "
        + o.section + "/" + o.field);
    }
    return lines.join("\n");
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) واجهات القراءة التي يستهلكها tour.js
     ══════════════════════════════════════════════════════════════════════════ */

  const NOTE_NOUNS = {
    point: { one: "نقطة واحدة", two: "نقطتان", few: "نقاط", many: "نقطة", hundred: "نقطة", zero: "لا نقاط" },
    question: { one: "سؤال واحد", two: "سؤالان", few: "أسئلة", many: "سؤالاً", hundred: "سؤال", zero: "لا أسئلة" },
    caveat: { one: "وسم واحد", two: "وسمان", few: "وسوم", many: "وسماً", hundred: "وسم", zero: "لا وسوم" },
  };

  /** مدخل الملاحظات لمعرف قسم — أو null بصمت (الجولة تعرض حالتها الصادقة) */
  function forSection(id) {
    return Object.prototype.hasOwnProperty.call(SECTIONS, id) ? SECTIONS[id] : null;
  }
  const has = (id) => !!forSection(id);
  const ids = () => Object.keys(SECTIONS);
  const pointsOf = (id) => (forSection(id) ? forSection(id).points.slice() : []);
  const caveatsOf = (id) => (forSection(id) ? (forSection(id).caveats || []).slice() : []);
  const qaOf = (id) => (forSection(id) ? (forSection(id).qa || []).slice() : []);

  /** ميزانية البروفة للخطوة الواحدة بالثواني (الصيغة معلنة في BUDGET_FORMULA) */
  function budgetSec(id) {
    const note = forSection(id);
    if (!note) return 0;
    return BUDGET_BASE_SEC + BUDGET_PER_POINT_SEC * note.points.length;
  }

  /** مجموع الميزانية لتسلسل كامل (يُعرض في رأس الدرج) */
  function totalBudgetSec(list) {
    const arr = Array.isArray(list) && list.length ? list : SECTION_ORDER;
    let sum = 0;
    for (const id of arr) sum += budgetSec(id);
    return sum;
  }

  /** تغطية الجدول لتسلسل حي: ما له ملاحظات وما ليس له */
  function coverage(list) {
    const arr = Array.isArray(list) && list.length ? list : SECTION_ORDER;
    const covered = [];
    const missing = [];
    for (const id of arr) (has(id) ? covered : missing).push(id);
    return {
      total: arr.length,
      covered,
      missing,
      complete: missing.length === 0,
      pct: arr.length ? Math.round((covered.length / arr.length) * 1000) / 10 : 0,
    };
  }

  /** سطر إحصاء مقروء لقسم: «5 نقاط · وسم واحد · سؤال واحد» */
  function statLine(id) {
    const note = forSection(id);
    if (!note) return "لا ملاحظات معتمدة لهذه اللوحة";
    const parts = [fmt.countNoun(note.points.length, NOTE_NOUNS.point)];
    if ((note.caveats || []).length) {
      parts.push(fmt.countNoun(note.caveats.length, NOTE_NOUNS.caveat));
    }
    if ((note.qa || []).length) {
      parts.push(fmt.countNoun(note.qa.length, NOTE_NOUNS.question));
    }
    return parts.join(" · ");
  }

  /** كثافة النص: كلمات كل نقطة — يستعمله الدرج لتلوين النقاط الطويلة */
  function density(id) {
    const note = forSection(id);
    if (!note) return { words: 0, perPoint: [], longest: 0 };
    const perPoint = note.points.map(wordCount);
    const words = perPoint.reduce((a, b) => a + b, 0) + wordCount(note.headline);
    return { words, perPoint, longest: perPoint.length ? Math.max.apply(null, perPoint) : 0 };
  }

  return {
    version: "1",
    sections: SECTIONS,
    SECTION_ORDER,
    CAVEATS,
    BUDGET_BASE_SEC,
    BUDGET_PER_POINT_SEC,
    BUDGET_FORMULA,
    NOTE_NOUNS,
    // أدوات نقية (مختبَرة في tests/unit/notes-data.test.mjs)
    numbersIn, textsOf, wordCount,
    factPool, releasePool, verifyText, audit, auditMessage,
    // قراءة
    forSection, has, ids, pointsOf, caveatsOf, qaOf,
    budgetSec, totalBudgetSec, coverage, statLine, density,
  };
})();
