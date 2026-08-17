/* ════════════════════════════════════════════════════════════════════════════
   tour.js — الجولة الموجهة ودرج ملاحظات المتحدث (عقد V2_CONTRACTS_EXPANSION §6.2)
   فضاء الأسماء: RH.tour  ·  الأنماط بادئة `tour-` في src/styles/tour.css
   يُضمّ **بعد** presenter/notes-data.js (جدول الملاحظات مصدره الوحيد للنصوص).
   ────────────────────────────────────────────────────────────────────────────
   ما تقدّمه هذه الوحدة:

     ▸ **جولة موجهة** بخطوة لكل معرف في `engine.LINEAR` الحي (لا قائمة منسوخة):
       كل خطوة توجّه المحرك إلى القسم بحالته الأولى، ثم تعرض شريط جولة أسفل
       المسرح فيه اسم الخطوة وعدادها ونقاط الحديث المعتمدة وأزرار التنقل،
       وتُبرز **عنصراً حقيقياً** من اللوحة نفسها بضوء كاشف (حلقة تركيز ذهبية
       فوق حجاب معتم) مع تسمية تشرح ما يُنظر إليه.

     ▸ **درج ملاحظات المتحدث** لوح جانبي زجاجي مستقل عن الجولة: يفتحه المفتاح
       N (منفَّذ في nav.js) أو زر الشريط، ويعرض ملاحظات القسم الحالي كاملة —
       سطر الافتتاح، السؤال التنفيذي، النقاط، وسوم الصدق الملازمة، جملة العبور،
       الأسئلة المتوقعة بإجاباتها، ومراجع المصدر — ويتزامن مع تغيّر المسار.
       الدرج **ليس حوارياً**: العرض يستمر خلفه وجهاز التقديم يبقى عاملاً.

   ══ عقود ملزمة مطبَّقة حرفياً هنا ══
   • **لا نص جديد ولا رقم جديد**: كل ما يُعرض من `RH.presenter.notesData`، وهو
     مؤلَّف من نصوص لوحات الرؤى المعتمدة وقيم الإصدار المنشورة، ومحروس ببوابة
     `notesData.audit()` المشغَّلة في اختبار الوحدة. هذا الملف لا يكتب جملة
     محتوى واحدة عن القطاع.
   • **الأرقام عبر `RH.core.fmt`**: عدّاد الخطوات ونسب التقدم كلها عبر `fmt.int`
     و`fmt.countNoun`. ساعة البروفة ليست بيانات قطاع بل أداة إيقاع، وتُصاغ
     بمنسق محلي معزول اتجاهياً موثّق في موضعه.
   • **مرور الكليكر صحيح** (بند التكليف الصريح): `nav.js` يحوّل مفاتيح العرض
     إلى `bus.emit("tour:key")` أثناء `body.tour-active`، لكنه — بعقد §8 —
     يمتنع إن كان التركيز داخل عنصر تفاعلي. وشريط الجولة والدرج **تفاعليان**
     بالضرورة (أزرار حقيقية). لذلك يحمل كلٌّ منهما مستمع مفاتيح خاصاً يلتقط
     مفاتيح العرض عند وقوع التركيز بداخله ويوجّهها بنفسه: إلى الجولة إن كانت
     نشطة، وإلى المحرك (next/prev/home/end) إن لم تكن — فلا «يبتلع» أي لوح
     ضغطة جهاز التقديم أبداً. المسارات لا تتضاعف: nav يمسك الحالة الأولى
     (تركيز خارج الألواح) وألواحنا تمسك الثانية حصراً.
   • **لا خطوات فرعية**: الجولة تمر على القسم بحالته الأولى (‏step=0). إبراز
     عناصر متعددة داخل اللوحة يتم باختيار صريح من رقاقات الشريط، ولا يُقلّب
     بمفاتيح التالي/السابق (تلك للخطوات حصراً — عقد §6.2).
   • **الحالة الصادقة**: قسم بلا ملاحظات، أو عنصر إبراز غير موجود في هذا
     البناء، أو دخول ملحق أثناء الجولة — لكلٍّ حالته المعلنة، ولا شاشة فارغة
     ولا إبراز يشير إلى فراغ.
   • **`prefers-reduced-motion`**: لا انزلاق ولا تلاشٍ — الظهور والإخفاء فوريان
     (القاعدة في tour.css، وهذا الملف لا يشغّل أي حركة برمجية).
   • **التنظيف**: `stop()` يزيل الطبقات وكل مستمع ومؤقت وراصد أبعاد؛ ودخول
     الإدارة أو الموجز يوقف الجولة ويغلق الدرج تلقائياً (مراقب المسار).

   ══ نقطة الدخول (الاستثناء المرخص — عقد §6.2) ══
   زر «جولة موجهة» على الغلاف بنمط أزرار الغلاف القائمة. يُركَّب من هنا وقت
   التشغيل داخل `.cover-actions` (بالصنف المعتمد `btn-fullscreen` ذاته زائد
   `tour-launch`) بدل تعديل ملف قسم يملكه وكيل آخر — الأثر في DOM مطابق لما
   يوجبه العقد، والملكية الملفّية تبقى نظيفة. التركيب يتم عبر راصد تغيّرات
   خفيف على المسرح، فيصمد أمام إعادة بناء الغلاف عند كل عودة إليه.

   ══ قابلية الاختبار (عقد §0) ══
   نموذج الجولة النقي (`RH.tour.model`) يُعرَّف وقت التحميل دون أي لمس لـDOM،
   وكل وصول إلى `document`/`window` محروس بـ`CAN_DOM` — فيُحمَّل الملف كما هو
   في سياق vm ذي محاكاة DOM دنيا ويُختبر نموذجه في
   `tests/unit/notes-data.test.mjs`.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

RH.tour = (function () {
  const fmt = RH.core.fmt;
  const bus = RH.core.bus;

  /** هل البيئة تملك DOM حقيقياً؟ (بيئة اختبار الوحدة لا تملك classList) */
  const CAN_DOM = !!(typeof document !== "undefined" && document
    && document.body && document.body.classList
    && typeof document.createElement === "function");

  /* عناصر البناء تُقرأ كسولاً: dom.h متاح دائماً، لكن الاستدعاء لا يقع إلا
     داخل دوال العرض المحروسة بـCAN_DOM */
  const D = RH.core.dom;

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 1) ثوابت مقفلة
     ══════════════════════════════════════════════════════════════════════════ */

  /** مفاتيح العرض — مرآة عقد nav.js §8 حرفياً (لا تشتق منها الجولة لهجة خاصة) */
  const NEXT_KEYS = ["PageDown", " ", "Enter", "ArrowRight", "ArrowDown"];
  const PREV_KEYS = ["PageUp", "Backspace", "ArrowLeft", "ArrowUp"];

  /** مفاتيح لا تُوجَّه أبداً من داخل ألواحنا: تفعّل العنصر المركّز نفسه */
  const ACTIVATION_KEYS = [" ", "Enter"];

  /** عناصر تستهلك مفاتيح الاتجاه لنفسها — لا نسرقها منها */
  const SELF_KEYED = "input, textarea, select, [contenteditable], [role='listbox'],"
    + " [role='slider'], [role='menu'], [role='tree'], [role='grid']";

  const DIRECTIONAL = new Set(["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown",
    "Home", "End"]);

  /** مفاتيح يجب منع سلوكها الافتراضي عند توجيهها (تمرير الصفحة/رجوع المتصفح) */
  const PREVENT = new Set([" ", "PageUp", "PageDown", "Backspace",
    "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"]);

  const STORE_KEYS = {
    scale: "rh.tour.notes.scale",
    density: "rh.tour.notes.density",
  };

  /** حدود مقياس خط الدرج (تكبير للمتحدث على شاشة بعيدة) */
  const SCALE_MIN = 0.85;
  const SCALE_MAX = 1.5;
  const SCALE_STEP = 0.075;

  /** محاولات العثور على عنصر الإبراز بعد تبديل المشهد (بناء + انتقال + رسوم) */
  const LOCATE_TRIES = 26;
  const LOCATE_GAP_MS = 60;

  /** إعادة قياس الحلقة بعد استقرار الرسوم (ECharts يعيد المقاس بعد 40–80ms) */
  const SETTLE_MS = [90, 260, 620];

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 2) جدول عناصر الإبراز — عناصر حقيقية في كل لوحة
     ──────────────────────────────────────────────────────────────────────────
     كل هدف يُوصف بطريقة عثور واحدة على الأقل:
       cardTitle — عنوان بطاقة قائم في القسم (يُطابَق على `.card-title` نصياً)
       kpiLabel  — تسمية مؤشر في شريط الأرقام البارزة (`.kpi-label`)
       sel       — محدد CSS داخل جذر القسم
     و`alt` محددات احتياطية. الهدف الذي لا يُعثر عليه في هذا البناء لا يُبرَز
     ولا يُخترع له بديل: الشريط يعلن «العنصر غير متاح في هذه اللوحة» بصدق.
     التسميات هنا **وصف واجهة** لا محتوى بيانات (لا رقم فيها إطلاقاً).
     ══════════════════════════════════════════════════════════════════════════ */
  const TARGETS = {
    "00": [
      { key: "title", label: "العنوان ونطاق العمل", sel: ".cover-title" },
      { key: "asof", label: "تاريخ البيانات المعلن", sel: ".cover-asof" },
      { key: "ticker", label: "شريط حقائق الإصدار", sel: ".cover-ticker" },
      { key: "actions", label: "بدء العرض وملء الشاشة", sel: ".cover-actions" },
    ],
    summary: [
      { key: "kpi", label: "الأرقام البارزة الستة", sel: ".kpi-strip" },
      { key: "coverage", label: "تطور نسبة تغطية الطلب", cardTitle: "تطور نسبة تغطية الطلب" },
      { key: "sectors", label: "العرض والطلب قطاعياً", cardTitle: "العرض والطلب قطاعياً" },
      { key: "compliance", label: "بطاقة معدل الامتثال بوسمها", kpiLabel: "معدل الامتثال" },
      { key: "portfolio", label: "محفظة المبادرات", cardTitle: "محفظة المبادرات" },
      { key: "rail", label: "عمود الرؤى المعتمدة", sel: ".rail" },
    ],
    demand: [
      { key: "kpi", label: "أرقام العرض والطلب البارزة", sel: ".kpi-strip" },
      { key: "sectors", label: "العرض والطلب حسب القطاع", cardTitle: "العرض والطلب حسب القطاع" },
      { key: "coverage", label: "تطور نسبة تغطية الطلب", cardTitle: "تطور نسبة تغطية الطلب" },
      { key: "activity", label: "الطلب حسب النشاط الاقتصادي", cardTitle: "الطلب حسب النشاط الاقتصادي" },
      { key: "collar", label: "تركيبة الطلب حسب فئة العمالة", cardTitle: "تركيبة الطلب حسب فئة العمالة" },
      { key: "occupancy", label: "تركيبة الإشغال", cardTitle: "تركيبة الإشغال" },
    ],
    licensing: [
      { key: "kpi", label: "أرقام التراخيص البارزة", sel: ".kpi-strip" },
      { key: "cumulative", label: "المسار التراكمي للتراخيص", cardTitle: "المسار التراكمي للتراخيص" },
      { key: "growth", label: "تكوين النمو منذ خط الأساس", cardTitle: "تكوين النمو منذ خط الأساس" },
      { key: "sectors", label: "التراخيص حسب القطاع", cardTitle: "التراخيص حسب القطاع" },
      { key: "net", label: "الإصدار الشهري الصافي", cardTitle: "الإصدار الشهري الصافي" },
      { key: "top", label: "أعلى الأحياء ضمن العينة", cardTitle: "أعلى 5 أحياء — ضمن العينة" },
    ],
    control: [
      { key: "kpi", label: "أرقام الرقابة البارزة", sel: ".kpi-strip" },
      { key: "monthly", label: "النشاط الرقابي الشهري", cardTitle: "النشاط الرقابي الشهري" },
      { key: "types", label: "أنواع المخالفات", cardTitle: "أنواع المخالفات" },
      { key: "sectors", label: "المخالفات حسب القطاع", cardTitle: "المخالفات حسب القطاع" },
      { key: "map", label: "خريطة الإنفاذ الميداني", cardTitle: "خريطة الإنفاذ الميداني" },
      { key: "rail", label: "عمود الرؤى الرقابية", sel: ".rail" },
    ],
    map: [
      { key: "kpi", label: "أرقام الجغرافيا البارزة", sel: ".kpi-strip" },
      {
        key: "live", label: "الخريطة الحية على حدود الأحياء",
        cardTitle: "الخريطة الحية — تلوين قطاعي على حدود الأحياء الحقيقية",
        alt: [".map-stage"],
      },
      { key: "layers", label: "طبقات القراءة الثلاث", sel: ".map-layers", alt: [".map-controls"] },
      { key: "toggles", label: "نقاط التركّز وأحياء العينة", sel: ".map-toggles" },
      { key: "legend", label: "مفتاح التدرّج", sel: ".map-rail" },
    ],
    initiatives: [
      { key: "kpi", label: "أرقام المحفظة البارزة", sel: ".kpi-strip" },
      { key: "timeline", label: "المخطط الزمني للمحفظة", cardTitle: "المخطط الزمني لمحفظة المبادرات" },
      { key: "states", label: "حالات المحفظة", cardTitle: "حالات المحفظة" },
      { key: "source", label: "سطر مصدر خطة العمل", sel: ".ini-source" },
      { key: "rail", label: "عمود رؤى المبادرات", sel: ".rail" },
    ],
    kpis: [
      { key: "kpi", label: "أرقام المؤشرات البارزة", sel: ".kpi-strip" },
      {
        key: "matrix", label: "المؤشرات من خط الأساس إلى المستهدف",
        cardTitle: "المؤشرات الأربعة عشر — من خط الأساس إلى المستهدف",
      },
      { key: "grid", label: "مصفوفة المؤشرات", cardTitle: "مصفوفة المؤشرات" },
      { key: "truth", label: "بطاقة القيم الحالية غير المتوفرة", cardTitle: "القيم الحالية تُسجَّل من المنصة" },
      { key: "rail", label: "عمود الرؤى", sel: ".rail" },
    ],
    forecast: [
      { key: "kpi", label: "أرقام التوقعات البارزة", sel: ".kpi-strip" },
      {
        key: "chart", label: "مسارات السيناريوهات الثلاثة",
        cardTitle: "سيناريوهات العجز المتوقع في الطاقة الاستيعابية",
      },
      { key: "table", label: "جدول السيناريوهات الشهري", cardTitle: "جدول السيناريوهات الشهري" },
      { key: "end", label: "مقارنة نهاية الأفق", cardTitle: "مقارنة السيناريوهات — نهاية الأفق" },
      { key: "caveat", label: "بطاقة التحفظ الملازمة", sel: ".pending-card" },
    ],
    closing: [
      { key: "facts", label: "الحقائق المتحقق منها", sel: ".cls-cell-fact", alt: [".cls-fact"] },
      { key: "recs", label: "التوصيات التنفيذية", cardTitle: "التوصيات التنفيذية", alt: [".cls-recs-card"] },
      { key: "horizon", label: "أفق المرحلة المقبلة", cardTitle: "أفق المرحلة المقبلة", alt: [".cls-horizon-card"] },
    ],
  };

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 3) النموذج النقي — RH.tour.model (لا DOM إطلاقاً، مُختبَر)
     ══════════════════════════════════════════════════════════════════════════ */
  const MODEL = (function () {

    /** ترجمة مفتاح عرض إلى فعل جولة (RTL: السهم الأيمن = التالي — عقد nav) */
    function keyToAction(key) {
      if (key == null) return null;
      if (key === "Escape") return "stop";
      if (key === "Home") return "first";
      if (key === "End") return "last";
      if (NEXT_KEYS.indexOf(key) !== -1) return "next";
      if (PREV_KEYS.indexOf(key) !== -1) return "prev";
      return null;
    }

    /** حصر فهرس داخل مدى صالح — بلا لفّ دائري (عقد الملاحة: لا التفاف) */
    function clampIndex(i, len) {
      if (!Number.isFinite(i) || len <= 0) return 0;
      const n = Math.trunc(i);
      if (n < 0) return 0;
      if (n > len - 1) return len - 1;
      return n;
    }

    /** الفهرس التالي/السابق وفق الفعل — يعيد الفهرس ذاته عند الطرف */
    function applyAction(action, i, len) {
      switch (action) {
        case "next": return clampIndex(i + 1, len);
        case "prev": return clampIndex(i - 1, len);
        case "first": return 0;
        case "last": return clampIndex(len - 1, len);
        default: return clampIndex(i, len);
      }
    }

    /**
     * بناء خطوات الجولة — نقي بالكامل.
     * linearIds: تسلسل المحرك الحي · notes: RH.presenter.notesData
     * meta: خريطة id → {title, kicker} (تُبنى وقت التشغيل من RH.sections)
     */
    function buildSteps(linearIds, notes, meta) {
      const ids = Array.isArray(linearIds) ? linearIds.filter(Boolean) : [];
      const m = meta || {};
      return ids.map(function (id, i) {
        const info = m[id] || {};
        const note = notes && notes.forSection ? notes.forSection(id) : null;
        const targets = TARGETS[id] ? TARGETS[id].slice() : [];
        return {
          id,
          index: i,
          title: info.title || (id === "00" ? "الغلاف" : id),
          kicker: info.kicker || (id === "00" ? "افتتاح العرض" : ""),
          note,
          hasNotes: !!note,
          points: note ? note.points.slice() : [],
          caveats: note && note.caveats ? note.caveats.slice() : [],
          budgetSec: notes && notes.budgetSec ? notes.budgetSec(id) : 0,
          targets,
          targetCount: targets.length,
        };
      });
    }

    /** فهرس خطوة بمعرّف قسم — ‎-1 إن لم يكن في التسلسل (ملحق مثلاً) */
    function indexOf(steps, id) {
      if (!Array.isArray(steps)) return -1;
      for (let i = 0; i < steps.length; i++) if (steps[i].id === id) return i;
      return -1;
    }

    /** نموذج التقدم المعروض في الشريط — كل رقم عبر fmt */
    function progressModel(i, total) {
      const n = Math.max(0, total | 0);
      const cur = clampIndex(i, n);
      const done = n > 0 ? cur + 1 : 0;
      return {
        index: cur,
        total: n,
        human: fmt.int(done),
        totalHuman: fmt.int(n),
        label: n > 0 ? "الخطوة " + fmt.int(done) + " من " + fmt.int(n) : "لا خطوات",
        pct: n > 0 ? Math.round((done / n) * 1000) / 10 : 0,
        atFirst: cur <= 0,
        atLast: n === 0 || cur >= n - 1,
        remaining: Math.max(0, n - done),
      };
    }

    /**
     * ساعة البروفة: ثوانٍ → mm:ss بعزل اتجاهي حتمي.
     * ليست قيمة بيانات (لا تخص القطاع) فلا تمر بمنسقات الإصدار؛ العزل نفسه
     * قاعدة الواجهة الموحدة (fmt.iso) كي لا ينقلب الترتيب داخل نص عربي.
     */
    function clock(totalSec) {
      const s = Math.max(0, Math.round(Number(totalSec) || 0));
      const mm = Math.floor(s / 60);
      const ss = s % 60;
      const pad = (x) => (x < 10 ? "0" + x : String(x));
      return fmt.iso(pad(mm) + ":" + pad(ss));
    }

    /**
     * إيقاع البروفة مقابل الميزانية المعلنة.
     * انضباط اللون: لا مرجاني ولا ذهبي هنا إطلاقاً — المرجاني للعجز والمخالفات
     * والذهبي للمستهدف وخط الأساس حصراً. الحالة تُقرأ من النص ومن نغمة محايدة.
     */
    function pacingModel(elapsedSec, budgetSec) {
      const e = Math.max(0, Math.round(Number(elapsedSec) || 0));
      const b = Math.max(0, Math.round(Number(budgetSec) || 0));
      if (b <= 0) {
        return { tone: "neu", label: "بلا زمن تقديري", elapsed: e, budget: 0, delta: 0, ratio: 0 };
      }
      const ratio = e / b;
      const delta = e - b;
      let tone = "on";
      let label = "ضمن الزمن التقديري";
      if (ratio > 1) { tone = "over"; label = "تجاوز الزمن التقديري"; }
      else if (ratio > 0.8) { tone = "near"; label = "اقترب من الزمن التقديري"; }
      return { tone, label, elapsed: e, budget: b, delta, ratio: Math.round(ratio * 100) / 100 };
    }

    /** أهداف الإبراز لقسم — نسخة دفاعية (لا يعدّل المستدعي الجدول المقفل) */
    function targetsFor(id) {
      return TARGETS[id] ? TARGETS[id].map((t) => Object.assign({}, t)) : [];
    }

    /**
     * هل هذا المفتاح مما يستهلكه العنصر المركّز لنفسه؟
     * tagName/role يمرران نصياً كي تبقى الدالة نقية وقابلة للاختبار بلا DOM.
     */
    function selfKeyed(tagName, role, key) {
      const tag = String(tagName || "").toLowerCase();
      const r = String(role || "").toLowerCase();
      const textish = tag === "input" || tag === "textarea" || tag === "select";
      const roleish = r === "listbox" || r === "slider" || r === "menu"
        || r === "tree" || r === "grid" || r === "textbox" || r === "option";
      if (!textish && !roleish) return false;
      if (DIRECTIONAL.has(key)) return true;
      return tag === "input" || tag === "textarea";
    }

    /** ملخص تغطية الملاحظات للتسلسل الحي (يُعرض في رأس الدرج) */
    function coverageModel(steps) {
      const arr = Array.isArray(steps) ? steps : [];
      const withNotes = arr.filter((s) => s.hasNotes).length;
      const points = arr.reduce((a, s) => a + (s.points ? s.points.length : 0), 0);
      const budget = arr.reduce((a, s) => a + (s.budgetSec || 0), 0);
      return {
        steps: arr.length,
        withNotes,
        missing: arr.length - withNotes,
        complete: arr.length > 0 && withNotes === arr.length,
        points,
        budgetSec: budget,
        budgetLabel: clock(budget),
      };
    }

    /** حصر مقياس الخط داخل المدى المسموح بخطوة ثابتة */
    function clampScale(v) {
      const n = Number(v);
      if (!Number.isFinite(n)) return 1;
      return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(n * 1000) / 1000));
    }

    return {
      keyToAction, clampIndex, applyAction, buildSteps, indexOf,
      progressModel, clock, pacingModel, targetsFor, selfKeyed,
      coverageModel, clampScale,
      NEXT_KEYS: NEXT_KEYS.slice(), PREV_KEYS: PREV_KEYS.slice(),
      SCALE_MIN, SCALE_MAX, SCALE_STEP,
    };
  })();

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 4) أدوات بيئة محروسة
     ══════════════════════════════════════════════════════════════════════════ */

  const engine = () => RH.presenter.engine;
  const notesData = () => RH.presenter.notesData || null;

  function reduced() {
    return !!(RH.viz && RH.viz.motion && RH.viz.motion.REDUCED);
  }

  function inPresenterMode() {
    return CAN_DOM && document.body.classList.contains("mode-presenter");
  }

  /** تخزين محلي متسامح: file:// قد يمنعه — السقوط إلى ذاكرة الجلسة */
  const memStore = Object.create(null);
  function readStore(key) {
    try {
      if (typeof RH.core.storage.local !== "undefined" && RH.core.storage.local) {
        const v = RH.core.storage.local.getItem(key);
        if (v != null) return v;
      }
    } catch (_e) { /* ممنوع في file:// — نكمل بالذاكرة */ }
    return Object.prototype.hasOwnProperty.call(memStore, key) ? memStore[key] : null;
  }
  function writeStore(key, value) {
    memStore[key] = String(value);
    try {
      if (typeof RH.core.storage.local !== "undefined" && RH.core.storage.local) {
        RH.core.storage.local.setItem(key, String(value));
      }
    } catch (_e) { /* لا شيء — الذاكرة كافية للجلسة */ }
  }

  /** إطار تالٍ متسامح مع بيئة بلا rAF */
  function raf(fn) {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(fn);
    return setTimeout(fn, 16);
  }

  /**
   * جذر القسم المعروض حالياً.
   *
   * ⚠ نقطة دقيقة يجب ألا تُبسَّط: المحرك يبقي **مضيفين** ظاهرَين معاً طوال
   * الانتقال (المغادر يُخفى بعد انقضاء مدته في `finishSwap`). فأخذ «أول مضيف
   * غير مخفي» يعطي أثناء الانتقال جذرَ القسم **المغادر**، فيقع الضوء الكاشف
   * على عنصر يوشك أن يُمحى — ويبدو الإبراز وكأنه اختفى. لذلك:
   *   • يُستبعد أي مضيف يحمل صنف مغادرة (`leaving-*`)، و
   *   • عند تمرير `expectId` يُطابَق الجذر بمعرّف قسمه حرفياً
   *     (‏`data-section` الذي يكتبه سجل الأقسام، و`.sc-cover` للغلاف)،
   *     وغيابه يعني «لم يُبنَ بعد» فتُعاد المحاولة لا أن يُقبل بديل خاطئ.
   */
  function activeRoot(expectId) {
    if (!CAN_DOM) return null;
    const hosts = D.qsa("#stage .scene-host");
    const visible = hosts.filter((h) => !h.hidden);
    const settled = visible.filter((h) => !/\bleaving-/.test(h.className || ""));
    const pool = settled.length ? settled : visible;
    if (expectId != null) {
      const sel = expectId === "00"
        ? ".sc-cover"
        : '.dash[data-section="' + expectId + '"]';
      for (const host of pool) {
        const el = host.querySelector(sel);
        if (el) return el;
      }
      return null;
    }
    for (const host of pool) {
      const el = host.querySelector(".dash, .sc, .ax");
      if (el) return el;
    }
    return null;
  }

  /** نص عنصر مقصوصاً — للمطابقة على عناوين البطاقات */
  function textOf(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  /**
   * العثور على عنصر إبراز داخل جذر القسم وفق وصفه.
   * الترتيب: عنوان بطاقة ← تسمية مؤشر ← محدد مباشر ← محددات احتياطية.
   */
  function findTarget(root, desc) {
    if (!root || !desc) return null;
    if (desc.cardTitle) {
      const titles = root.querySelectorAll(".card-title");
      for (const t of titles) {
        if (textOf(t) === desc.cardTitle) {
          const card = t.closest(".dash-card");
          if (card) return card;
          return t.parentNode || t;
        }
      }
    }
    if (desc.kpiLabel) {
      const labels = root.querySelectorAll(".kpi-label");
      for (const l of labels) {
        if (textOf(l) === desc.kpiLabel) return l.closest(".kpi") || l;
      }
    }
    if (desc.sel) {
      const el = root.querySelector(desc.sel);
      if (el) return el;
    }
    for (const alt of desc.alt || []) {
      const el = root.querySelector(alt);
      if (el) return el;
    }
    return null;
  }

  /** هل للعنصر مساحة مرئية تستحق إبرازاً؟ */
  function hasBox(el) {
    if (!el || typeof el.getBoundingClientRect !== "function") return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 5) الضوء الكاشف — حجاب بثقب حول عنصر حقيقي
     ──────────────────────────────────────────────────────────────────────────
     التنفيذ بظل خارجي ضخم (box-shadow spread) حول مستطيل الهدف: ثقب واحد
     نظيف بحواف دائرية، بلا أربعة مستطيلات تتفكك عند الأطراف، وبلا SVG mask
     الذي يكلّف إعادة رسم في كل قياس. الطبقة كلها pointer-events:none فيبقى
     العنصر المُبرَز قابلاً للنقر والاستكشاف أثناء الجولة.
     ══════════════════════════════════════════════════════════════════════════ */
  const spotlight = (function () {
    let layer = null;      // .tour-spot — الحلقة + الحجاب
    let cap = null;        // .tour-spot-cap — تسمية ما يُنظر إليه
    let target = null;     // العنصر الحقيقي المُبرَز
    let ro = null;         // ResizeObserver على الهدف
    let timers = [];

    function ensure() {
      if (!CAN_DOM) return false;
      if (layer && layer.parentNode) return true;
      layer = D.h("div", { class: "tour-spot", "aria-hidden": "true" });
      cap = D.h("div", { class: "tour-spot-cap", "aria-hidden": "true" });
      document.body.appendChild(layer);
      document.body.appendChild(cap);
      return true;
    }

    function clearTimers() {
      for (const t of timers) clearTimeout(t);
      timers = [];
    }

    function place() {
      if (!layer || !target) return;
      if (!hasBox(target)) { hide(); return; }
      const r = target.getBoundingClientRect();
      const pad = 6;
      const top = Math.max(0, r.top - pad);
      const left = Math.max(0, r.left - pad);
      const width = Math.min(window.innerWidth - left, r.width + pad * 2);
      const height = Math.min(window.innerHeight - top, r.height + pad * 2);
      layer.style.top = top + "px";
      layer.style.left = left + "px";
      layer.style.width = width + "px";
      layer.style.height = height + "px";
      layer.hidden = false;

      if (cap && cap.textContent) {
        /* التسمية فوق الهدف ما لم يلامس أعلى الشاشة — عندها تحته */
        const above = top > 46;
        cap.style.top = (above ? top - 34 : top + height + 10) + "px";
        /* RTL: التسمية تُحاذى بيمين الهدف */
        const right = Math.max(8, window.innerWidth - (left + width));
        cap.style.right = right + "px";
        cap.style.left = "auto";
        cap.hidden = false;
      }
    }

    function watch() {
      clearTimers();
      for (const ms of SETTLE_MS) timers.push(setTimeout(place, ms));
      if (ro) { try { ro.disconnect(); } catch (_e) {} ro = null; }
      if (typeof ResizeObserver === "function" && target) {
        try {
          ro = new ResizeObserver(() => place());
          ro.observe(target);
        } catch (_e) { ro = null; }
      }
    }

    /**
     * كنس صنف الإبراز من المستند كله.
     * لا يكفي نزعه عن `target` الأخير: تبديل الهدف داخل اللوحة ذاتها، وتبديل
     * المضيفين أثناء الانتقال، يتركان أصنافاً معلّقة على عناصر أقسام معتمدة.
     * الاستعلام محصور بالصنف الخاص بالميزة فكلفته لا تُذكر، والنتيجة عقدية:
     * لا يبقى أثر للجولة على عنصر لا يملكه هذا الملف.
     */
    function clearLit() {
      if (!CAN_DOM) return;
      for (const el of D.qsa(".tour-lit")) el.classList.remove("tour-lit");
    }

    function show(el, label) {
      if (!ensure()) return false;
      clearLit();
      target = el;
      if (cap) cap.textContent = label || "";
      if (target && target.classList) target.classList.add("tour-lit");
      place();
      watch();
      return true;
    }

    function hide() {
      if (layer) layer.hidden = true;
      if (cap) { cap.hidden = true; cap.textContent = ""; }
      clearLit();
      target = null;
      clearTimers();
      if (ro) { try { ro.disconnect(); } catch (_e) {} ro = null; }
    }

    function destroy() {
      hide();
      if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
      if (cap && cap.parentNode) cap.parentNode.removeChild(cap);
      layer = null;
      cap = null;
    }

    return { show, hide, place, destroy, current: () => target };
  })();

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 6) توجيه المفاتيح من داخل ألواح الجولة (مرور الكليكر)
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * مستمع مفاتيح يُركَّب على شريط الجولة ودرج الملاحظات.
   * القاعدة: ما دام التركيز داخل اللوح فإن nav.js لن يبث شيئاً (عقد §8)،
   * فنحن من يوجّه — إلى الجولة إن كانت نشطة وإلا إلى المحرك مباشرة.
   */
  function panelKeydown(e, opts) {
    if (e.repeat) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    const key = e.key;
    const t = e.target || {};

    /* Escape: للجولة إنهاؤها (مخرج المتحدث)، وللدرج وحده إغلاقه */
    if (key === "Escape") {
      if (state.active) return;              // nav يلتقطها ويبثها tour:key
      if (opts && opts.escapeCloses) {
        e.preventDefault();
        e.stopPropagation();
        notesDrawer.close();
      }
      return;
    }

    /* Enter/Space تفعّل العنصر المركّز — لا تُوجَّه أبداً */
    if (ACTIVATION_KEYS.indexOf(key) !== -1) return;

    /* عناصر تستهلك الاتجاهات لنفسها (قوائم/منزلقات/حقول) تُترك لها */
    const role = t.getAttribute ? t.getAttribute("role") : "";
    if (MODEL.selfKeyed(t.tagName, role, key)) return;
    if (t.closest && t.closest(SELF_KEYED) && DIRECTIONAL.has(key)) return;

    const action = MODEL.keyToAction(key);
    if (!action) return;
    if (PREVENT.has(key)) e.preventDefault();
    e.stopPropagation();

    if (state.active) {
      applyTourAction(action);
      return;
    }
    /* الجولة متوقفة: الدرج مفتوح فقط — العرض يستمر والكليكر يمر إلى المحرك */
    const E = engine();
    if (!E) return;
    if (action === "next") E.next();
    else if (action === "prev") E.prev();
    else if (action === "first") E.home();
    else if (action === "last") E.end();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 7) الحالة المشتركة
     ══════════════════════════════════════════════════════════════════════════ */
  const state = {
    active: false,
    steps: [],
    index: 0,
    focusIdx: 0,          // أي هدف إبراز داخل الخطوة
    startedAt: 0,         // طابع بدء الجولة (ms)
    stepStartedAt: 0,     // طابع بدء الخطوة الحالية (ms)
    paused: false,
    pausedAccum: 0,       // ثوانٍ متراكمة قبل الإيقاف المؤقت
    pausedStepAccum: 0,
    tick: null,           // مؤقت الساعة
    collapsed: false,
    pendingLocate: null,  // مؤقت محاولات العثور على الهدف
    locateTries: 0,
    locateSeq: 0,         // رقم محاولة العثور — يبطل ما سبقه عند تغيّر الخطوة
    lastTargetOk: true,
    inAppendix: false,
  };

  /** خريطة عنوان/سطر سياق لكل قسم من سجل الأقسام الحي (بلا نص مخترع) */
  function sectionMeta() {
    const meta = Object.create(null);
    meta["00"] = { title: "الغلاف", kicker: "افتتاح العرض" };
    if (RH.sections && typeof RH.sections.list === "function") {
      for (const def of RH.sections.list()) {
        meta[def.id] = { title: def.title || def.id, kicker: def.kicker || "" };
      }
    }
    return meta;
  }

  /** إعادة بناء الخطوات من التسلسل الحي (يُستدعى عند كل بدء) */
  function rebuildSteps() {
    const E = engine();
    const linear = E && E.LINEAR ? E.LINEAR.slice() : [];
    state.steps = MODEL.buildSteps(linear, notesData(), sectionMeta());
    if (state.index > state.steps.length - 1) {
      state.index = MODEL.clampIndex(state.index, state.steps.length);
    }
    return state.steps;
  }

  const currentStep = () => state.steps[state.index] || null;

  /** ثوانٍ منقضية منذ بدء الجولة / منذ بدء الخطوة (تحترم الإيقاف المؤقت) */
  function elapsedTotal() {
    if (!state.startedAt) return 0;
    const live = state.paused ? 0 : (Date.now() - state.startedAt) / 1000;
    return Math.round(state.pausedAccum + live);
  }
  function elapsedStep() {
    if (!state.stepStartedAt) return 0;
    const live = state.paused ? 0 : (Date.now() - state.stepStartedAt) / 1000;
    return Math.round(state.pausedStepAccum + live);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 8) درج ملاحظات المتحدث
     ══════════════════════════════════════════════════════════════════════════ */
  const notesDrawer = (function () {
    let root = null;
    let bodyEl = null;
    let headEl = null;
    let chipsEl = null;
    let open = false;
    let scale = MODEL.clampScale(parseFloat(readStore(STORE_KEYS.scale) || "1"));
    let dense = readStore(STORE_KEYS.density) === "1";
    let keyHandler = null;

    function applyScale() {
      if (!root) return;
      root.style.setProperty("--tour-notes-scale", String(scale));
      root.classList.toggle("dense", dense);
    }

    function setScale(next) {
      scale = MODEL.clampScale(next);
      writeStore(STORE_KEYS.scale, scale);
      applyScale();
      return scale;
    }

    function toggleDense() {
      dense = !dense;
      writeStore(STORE_KEYS.density, dense ? "1" : "0");
      applyScale();
      render();
    }

    function iconBtn(label, glyph, onClick, cls) {
      return D.h("button", {
        type: "button",
        class: "tour-nbtn" + (cls ? " " + cls : ""),
        "aria-label": label,
        title: label,
        onclick: onClick,
      }, D.h("span", { "aria-hidden": "true" }, glyph));
    }

    function build() {
      if (!CAN_DOM || root) return root;
      root = D.h("aside", {
        class: "tour-notes",
        role: "complementary",
        "aria-label": "ملاحظات المتحدث",
        /* data-interactive: عقد §8 — التركيز داخله لا يقلّب الأقسام،
           وتوجيه مفاتيح الكليكر يتكفل به مستمعنا أدناه */
        "data-interactive": "",
        hidden: true,
      });

      headEl = D.h("div", { class: "tour-notes-head" });
      chipsEl = D.h("div", {
        class: "tour-notes-sections",
        role: "group",
        "aria-label": "الانتقال بين اللوحات",
      });
      bodyEl = D.h("div", {
        class: "tour-notes-body",
        "aria-live": "polite",
        "aria-atomic": "false",
        tabindex: "0",
      });

      root.appendChild(headEl);
      root.appendChild(chipsEl);
      root.appendChild(bodyEl);
      document.body.appendChild(root);

      keyHandler = (e) => panelKeydown(e, { escapeCloses: true });
      root.addEventListener("keydown", keyHandler);
      applyScale();
      return root;
    }

    /** ترويسة الدرج: العنوان، مقياس الخط، الكثافة، الإغلاق */
    function renderHead(step) {
      if (!headEl) return;
      D.clear(headEl);
      const N = notesData();
      if (!state.steps.length) rebuildSteps();
      const cov = MODEL.coverageModel(state.steps);

      headEl.appendChild(D.h("div", { class: "tour-notes-titles" },
        D.h("div", { class: "tour-notes-kicker" }, "ملاحظات المتحدث"),
        D.h("h2", { class: "tour-notes-title" },
          step ? step.title : "لوحة غير معروفة"),
      ));

      const tools = D.h("div", { class: "tour-notes-tools" },
        iconBtn("تصغير خط الملاحظات", "A−", () => setScale(scale - SCALE_STEP)),
        iconBtn("تكبير خط الملاحظات", "A+", () => setScale(scale + SCALE_STEP)),
        iconBtn(dense ? "عرض مريح" : "عرض مضغوط", dense ? "▤" : "▥",
          () => toggleDense(), dense ? "on" : ""),
        iconBtn("إغلاق درج الملاحظات (N)", "✕", () => close(), "close"),
      );
      headEl.appendChild(tools);

      headEl.appendChild(D.h("div", { class: "tour-notes-cov" },
        D.h("span", {}, "تغطية الملاحظات "
          + fmt.int(cov.withNotes) + "/" + fmt.int(cov.steps)),
        D.h("span", { class: "sep", "aria-hidden": "true" }, "·"),
        D.h("span", { title: N ? N.BUDGET_FORMULA : "" },
          "زمن تقديري كلي " + MODEL.clock(cov.budgetSec)),
      ));
    }

    /** شريط رقاقات الأقسام — تنقّل مباشر دون إغلاق الدرج */
    function renderSections(step) {
      if (!chipsEl) return;
      D.clear(chipsEl);
      const E = engine();
      const linear = E && E.LINEAR ? E.LINEAR : [];
      const meta = sectionMeta();
      const N = notesData();
      linear.forEach(function (id, i) {
        const info = meta[id] || {};
        const isNow = step && step.id === id;
        chipsEl.appendChild(D.h("button", {
          type: "button",
          class: "tour-schip" + (isNow ? " now" : "")
            + (N && N.has(id) ? "" : " empty"),
          "aria-current": isNow ? "true" : null,
          title: (info.title || id) + " — " + (N && N.has(id)
            ? N.statLine(id) : "لا ملاحظات معتمدة"),
          onclick: () => {
            if (state.active) { goto(i); return; }
            if (E) E.goScene(id);
          },
        },
          D.h("span", { class: "tour-schip-n" }, fmt.int(i + 1)),
          D.h("span", { class: "tour-schip-t" }, info.title || id),
        ));
      });
    }

    /** قائمة نقاط الحديث مرقّمة، مع وسم النقطة الطويلة (أداة إيقاع) */
    function renderPoints(note, id) {
      const N = notesData();
      const dens = N && N.density ? N.density(id) : { perPoint: [] };
      const ol = D.h("ol", { class: "tour-notes-points" });
      note.points.forEach(function (p, i) {
        const w = dens.perPoint[i] || 0;
        ol.appendChild(D.h("li", {
          class: "tour-notes-point" + (w >= 26 ? " long" : ""),
          title: w ? fmt.int(w) + " كلمة" : null,
        }, p));
      });
      return ol;
    }

    function renderBody(step) {
      if (!bodyEl) return;
      D.clear(bodyEl);
      const N = notesData();

      if (!step) {
        bodyEl.appendChild(D.h("div", { class: "tour-empty" },
          D.h("b", {}, "لا لوحة معروضة الآن"),
          D.h("p", {}, "افتح إحدى اللوحات ليعرض الدرج ملاحظاتها المعتمدة.")));
        return;
      }
      if (state.inAppendix) {
        bodyEl.appendChild(D.h("div", { class: "tour-empty" },
          D.h("b", {}, "أنت داخل ملحق"),
          D.h("p", {}, "الملاحظات معدّة للوحات التسلسل الرئيس. عد إلى اللوحة "
            + "المستدعية ليتابع الدرج معك.")));
        return;
      }
      const note = step.note;
      if (!note) {
        bodyEl.appendChild(D.h("div", { class: "tour-empty" },
          D.h("b", {}, "لا ملاحظات معتمدة لهذه اللوحة"),
          D.h("p", {}, "الملاحظات تُصاغ من لوحات الرؤى المعتمدة حصراً — ولا "
            + "تُخترع هنا عند غيابها.")));
        return;
      }

      /* السؤال التنفيذي وسطر الافتتاح */
      if (note.ask) {
        bodyEl.appendChild(D.h("div", { class: "tour-notes-ask" }, note.ask));
      }
      bodyEl.appendChild(D.h("p", { class: "tour-notes-headline" }, note.headline));

      /* النقاط */
      bodyEl.appendChild(D.h("div", { class: "tour-notes-sec" },
        D.h("div", { class: "tour-notes-sec-h" },
          D.h("span", {}, "نقاط الحديث"),
          D.h("span", { class: "tour-notes-sec-n" },
            N ? N.statLine(step.id) : ""),
        ),
        renderPoints(note, step.id),
      ));

      /* وسوم الصدق الملازمة — تُنطق مع أرقامها */
      if (note.caveats && note.caveats.length) {
        const box = D.h("div", { class: "tour-notes-sec caveats" },
          D.h("div", { class: "tour-notes-sec-h" },
            D.h("span", {}, "وسوم يجب أن تُنطق مع الأرقام")));
        for (const c of note.caveats) {
          box.appendChild(D.h("div", { class: "tour-caveat" },
            D.h("span", { class: "tour-caveat-dot", "aria-hidden": "true" }),
            D.h("span", {}, c)));
        }
        bodyEl.appendChild(box);
      }

      /* الأسئلة المتوقعة — مطوية كي لا تزاحم النقاط */
      if (note.qa && note.qa.length) {
        const box = D.h("div", { class: "tour-notes-sec qa" },
          D.h("div", { class: "tour-notes-sec-h" },
            D.h("span", {}, "أسئلة متوقعة"),
            D.h("span", { class: "tour-notes-sec-n" },
              fmt.countNoun(note.qa.length,
                (N && N.NOTE_NOUNS ? N.NOTE_NOUNS.question : { one: "سؤال", two: "سؤالان", few: "أسئلة", many: "سؤالاً" })),
            )));
        for (const qa of note.qa) {
          const det = D.h("details", { class: "tour-qa" },
            D.h("summary", {}, qa.q),
            D.h("p", {}, qa.a));
          box.appendChild(det);
        }
        bodyEl.appendChild(box);
      }

      /* جملة العبور */
      if (note.transition) {
        bodyEl.appendChild(D.h("div", { class: "tour-notes-transition" },
          D.h("span", { class: "tour-notes-transition-k" }, "العبور"),
          D.h("span", {}, note.transition)));
      }

      /* الإيقاع ومراجع المصدر */
      const pace = MODEL.pacingModel(
        state.active ? elapsedStep() : 0, step.budgetSec);
      bodyEl.appendChild(D.h("div", { class: "tour-notes-foot" },
        D.h("span", { class: "tour-pace t-" + pace.tone, title: N ? N.BUDGET_FORMULA : "" },
          "زمن تقديري " + MODEL.clock(step.budgetSec)
          + (state.active ? " · منقضٍ " + MODEL.clock(pace.elapsed) : "")),
        D.h("span", {
          class: "tour-notes-refs",
          title: (note.sourceRefs || []).join("، "),
        }, "المصدر: " + (note.sourceRefs || []).join("، ")),
      ));

      /* زر بدء الجولة من الدرج حين لا تكون نشطة (مدخل ثانٍ مشروع) */
      if (!state.active) {
        bodyEl.appendChild(D.h("div", { class: "tour-notes-cta" },
          D.h("button", {
            type: "button",
            class: "tour-btn primary",
            onclick: () => start({ from: step.id }),
          }, "ابدأ الجولة الموجهة من هنا")));
      }
    }

    function render() {
      if (!root) return;
      const step = resolveStepForRoute();
      renderHead(step);
      renderSections(step);
      renderBody(step);
    }

    function doOpen() {
      if (!CAN_DOM) return;
      build();
      open = true;
      root.hidden = false;
      document.body.classList.add("tour-notes-open");
      render();
    }

    function close() {
      if (!root) { open = false; return; }
      open = false;
      root.hidden = true;
      if (CAN_DOM) document.body.classList.remove("tour-notes-open");
    }

    function toggle() { (open ? close : doOpen)(); }

    function destroy() {
      if (root) {
        if (keyHandler) root.removeEventListener("keydown", keyHandler);
        if (root.parentNode) root.parentNode.removeChild(root);
      }
      root = null; bodyEl = null; headEl = null; chipsEl = null;
      keyHandler = null;
      open = false;
      if (CAN_DOM) document.body.classList.remove("tour-notes-open");
    }

    return {
      open: doOpen, close, toggle, render, destroy,
      isOpen: () => open,
      scale: () => scale,
      setScale,
    };
  })();

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 9) شريط الجولة
     ══════════════════════════════════════════════════════════════════════════ */
  const tourBar = (function () {
    let root = null;
    let liveEl = null;
    let keyHandler = null;
    const parts = {};

    function button(label, opts) {
      const o = opts || {};
      return D.h("button", {
        type: "button",
        class: "tour-btn" + (o.cls ? " " + o.cls : ""),
        "aria-label": o.aria || label,
        title: o.title || o.aria || label,
        disabled: o.disabled || null,
        onclick: o.onclick,
      }, o.glyph ? D.h("span", { class: "tour-btn-g", "aria-hidden": "true" }, o.glyph) : null,
      D.h("span", {}, label));
    }

    function build() {
      if (!CAN_DOM || root) return root;
      root = D.h("section", {
        class: "tour-bar",
        role: "region",
        "aria-label": "شريط الجولة الموجهة",
        "data-interactive": "",
      });

      /* منطقة إعلان لقارئ الشاشة — تتغير مع كل خطوة */
      liveEl = D.h("p", {
        class: "tour-live",
        role: "status",
        "aria-live": "polite",
      });

      parts.step = D.h("span", { class: "tour-step" });
      parts.kicker = D.h("span", { class: "tour-bar-kicker" });
      parts.title = D.h("h3", { class: "tour-bar-title" });
      parts.pace = D.h("span", { class: "tour-pace" });
      parts.clock = D.h("span", { class: "tour-clock" });

      const head = D.h("div", { class: "tour-bar-head" },
        D.h("div", { class: "tour-bar-id" }, parts.step, parts.kicker),
        parts.title,
        D.h("div", { class: "tour-bar-meta" }, parts.pace, parts.clock),
      );

      parts.headline = D.h("p", { class: "tour-bar-headline" });
      parts.points = D.h("ol", { class: "tour-bar-points" });
      parts.chips = D.h("div", {
        class: "tour-focus",
        role: "group",
        "aria-label": "عناصر اللوحة القابلة للإبراز",
      });
      parts.caveats = D.h("div", { class: "tour-bar-caveats" });
      parts.transition = D.h("p", { class: "tour-bar-transition" });
      parts.status = D.h("p", { class: "tour-bar-status" });

      parts.prev = button("السابق", {
        glyph: "›", cls: "nav",
        aria: "الخطوة السابقة",
        onclick: () => applyTourAction("prev"),
      });
      parts.next = button("التالي", {
        glyph: "‹", cls: "nav primary",
        aria: "الخطوة التالية",
        onclick: () => applyTourAction("next"),
      });
      parts.pause = button("إيقاف مؤقت", {
        cls: "ghost", aria: "إيقاف ساعة البروفة مؤقتاً",
        onclick: () => togglePause(),
      });
      parts.notes = button("الملاحظات", {
        cls: "ghost", aria: "فتح/إغلاق درج ملاحظات المتحدث — المفتاح N",
        onclick: () => notesDrawer.toggle(),
      });
      parts.collapse = button("طيّ", {
        cls: "ghost", aria: "طيّ شريط الجولة إلى سطر واحد",
        onclick: () => toggleCollapse(),
      });
      parts.stop = button("إنهاء الجولة", {
        cls: "ghost danger", aria: "إنهاء الجولة والعودة إلى العرض الحر",
        onclick: () => stop(),
      });

      const actions = D.h("nav", { class: "tour-actions", "aria-label": "تحكم الجولة" },
        parts.next, parts.prev,
        D.h("span", { class: "tour-actions-sep", "aria-hidden": "true" }),
        parts.notes, parts.pause, parts.collapse, parts.stop);

      parts.rail = D.h("div", {
        class: "tour-rail",
        role: "group",
        "aria-label": "خطوات الجولة",
      });

      root.appendChild(head);
      root.appendChild(parts.headline);
      root.appendChild(parts.points);
      root.appendChild(parts.chips);
      root.appendChild(parts.caveats);
      root.appendChild(parts.transition);
      root.appendChild(parts.status);
      root.appendChild(actions);
      root.appendChild(parts.rail);
      root.appendChild(liveEl);
      document.body.appendChild(root);

      keyHandler = (e) => panelKeydown(e, { escapeCloses: false });
      root.addEventListener("keydown", keyHandler);
      return root;
    }

    function renderRail() {
      D.clear(parts.rail);
      state.steps.forEach(function (s, i) {
        const done = i < state.index;
        const now = i === state.index;
        parts.rail.appendChild(D.h("button", {
          type: "button",
          class: "tour-dot" + (now ? " now" : "") + (done ? " done" : "")
            + (s.hasNotes ? "" : " empty"),
          "aria-label": "الخطوة " + fmt.int(i + 1) + " — " + s.title,
          "aria-current": now ? "true" : null,
          title: s.title + (s.hasNotes ? "" : " — لا ملاحظات معتمدة"),
          onclick: () => goto(i),
        }));
      });
    }

    function renderPoints(step) {
      D.clear(parts.points);
      if (!step || !step.hasNotes) return;
      for (const p of step.points) {
        parts.points.appendChild(D.h("li", { class: "tour-bar-point" }, p));
      }
    }

    function renderChips(step) {
      D.clear(parts.chips);
      if (!step || !step.targets.length) return;
      step.targets.forEach(function (t, i) {
        parts.chips.appendChild(D.h("button", {
          type: "button",
          class: "tour-chip" + (i === state.focusIdx ? " on" : ""),
          "aria-pressed": i === state.focusIdx ? "true" : "false",
          title: "إبراز: " + t.label,
          onclick: () => setFocus(i),
        }, t.label));
      });
    }

    function renderCaveats(step) {
      D.clear(parts.caveats);
      if (!step || !step.caveats.length) return;
      for (const c of step.caveats) {
        parts.caveats.appendChild(D.h("span", { class: "tour-caveat", title: c },
          D.h("span", { class: "tour-caveat-dot", "aria-hidden": "true" }),
          D.h("span", {}, c)));
      }
    }

    function render() {
      if (!root) return;
      const step = currentStep();
      const prog = MODEL.progressModel(state.index, state.steps.length);

      parts.step.textContent = prog.label;
      parts.kicker.textContent = step ? step.kicker : "";
      parts.title.textContent = step ? step.title : "—";

      parts.headline.textContent = step && step.note ? step.note.headline : "";
      parts.headline.hidden = !(step && step.note);

      renderPoints(step);
      renderChips(step);
      renderCaveats(step);

      const trans = step && step.note ? step.note.transition : "";
      parts.transition.textContent = trans ? "العبور: " + trans : "";
      parts.transition.hidden = !trans;

      /* الحالات الصادقة: لا ملاحظات · داخل ملحق · تعذر إبراز العنصر */
      let status = "";
      if (state.inAppendix) {
        status = "أنت داخل ملحق — الجولة متوقفة عن الإبراز حتى العودة إلى اللوحة.";
      } else if (step && !step.hasNotes) {
        status = "لا ملاحظات معتمدة لهذه اللوحة — لا نص يُخترع هنا.";
      } else if (!state.lastTargetOk) {
        status = "العنصر المطلوب إبرازه غير متاح في هذه اللوحة — الجولة تكمل بلا إبراز.";
      }
      parts.status.textContent = status;
      parts.status.hidden = !status;

      parts.prev.disabled = prog.atFirst;
      parts.next.disabled = prog.atLast;
      parts.pause.querySelector("span:last-child").textContent =
        state.paused ? "استئناف" : "إيقاف مؤقت";
      parts.collapse.querySelector("span:last-child").textContent =
        state.collapsed ? "بسط" : "طيّ";

      renderRail();
      renderClock();

      root.classList.toggle("collapsed", state.collapsed);
      if (liveEl && step) {
        liveEl.textContent = prog.label + " — " + step.title
          + (step.hasNotes ? " · " + fmt.int(step.points.length) + " نقاط" : "");
      }
    }

    /** تحديث الساعة والإيقاع وحدهما (كل ثانية — لا إعادة بناء للشريط) */
    function renderClock() {
      if (!root) return;
      const step = currentStep();
      const pace = MODEL.pacingModel(elapsedStep(), step ? step.budgetSec : 0);
      parts.pace.textContent = pace.label;
      parts.pace.className = "tour-pace t-" + pace.tone;
      const N = notesData();
      if (N) parts.pace.title = N.BUDGET_FORMULA;
      parts.clock.textContent = MODEL.clock(elapsedStep())
        + " / " + MODEL.clock(step ? step.budgetSec : 0);
      parts.clock.title = "زمن الخطوة المنقضي مقابل الزمن التقديري · الإجمالي "
        + MODEL.clock(elapsedTotal());
    }

    function show() {
      build();
      if (root) root.hidden = false;
    }
    function hide() {
      if (root) root.hidden = true;
    }
    function destroy() {
      if (root) {
        if (keyHandler) root.removeEventListener("keydown", keyHandler);
        if (root.parentNode) root.parentNode.removeChild(root);
      }
      root = null; liveEl = null; keyHandler = null;
      for (const k of Object.keys(parts)) delete parts[k];
    }
    function focusNextButton() {
      if (parts.next && !parts.next.disabled && parts.next.focus) parts.next.focus();
      else if (parts.stop && parts.stop.focus) parts.stop.focus();
    }

    return { show, hide, render, renderClock, destroy, focusNextButton,
      el: () => root };
  })();

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 10) منطق الجولة
     ══════════════════════════════════════════════════════════════════════════ */

  /** الخطوة الموافقة للمسار الحالي (للدرج حين تكون الجولة متوقفة) */
  function resolveStepForRoute() {
    const E = engine();
    const cur = E && E.current ? E.current() : null;
    if (!cur) return currentStep();
    if (cur.kind === "appendix") {
      state.inAppendix = true;
      return currentStep();
    }
    state.inAppendix = false;
    if (!state.steps.length) rebuildSteps();
    const i = MODEL.indexOf(state.steps, cur.id);
    if (i >= 0) {
      if (!state.active) state.index = i;
      return state.steps[i];
    }
    return currentStep();
  }

  /** إلغاء أي محاولة عثور جارية */
  function cancelLocate() {
    if (state.pendingLocate) {
      clearTimeout(state.pendingLocate);
      state.pendingLocate = null;
    }
    state.locateTries = 0;
  }

  /**
   * محاولة إبراز هدف الخطوة الحالية.
   * البناء يقع فور تغيّر المسار لكن الانتقال والرسوم تستقر بعده — فنعاود
   * المحاولة بفواصل قصيرة محدودة العدد بدل انتظار أعمى بمؤقت واحد.
   */
  function locate() {
    cancelLocate();
    if (!CAN_DOM || !state.active) return;
    if (state.inAppendix) { spotlight.hide(); return; }
    const step = currentStep();
    if (!step || !step.targets.length) {
      spotlight.hide();
      state.lastTargetOk = true;
      tourBar.render();
      return;
    }
    const desc = step.targets[MODEL.clampIndex(state.focusIdx, step.targets.length)];
    /* ختم المحاولة: أي استدعاء لاحق يبطل ما قبله، فلا يُبرِز إطارٌ متأخر
       هدفَ خطوة غادرها المتحدث بالفعل */
    const seq = ++state.locateSeq;

    function attempt() {
      state.pendingLocate = null;
      if (!state.active || seq !== state.locateSeq) return;
      const root = activeRoot(step.id);
      const el = root ? findTarget(root, desc) : null;
      if (el && hasBox(el)) {
        state.lastTargetOk = true;
        spotlight.show(el, desc.label);
        tourBar.render();
        return;
      }
      state.locateTries++;
      if (state.locateTries < LOCATE_TRIES) {
        state.pendingLocate = setTimeout(attempt, LOCATE_GAP_MS);
        return;
      }
      /* الحالة الصادقة: لا إبراز مخترع ولا إشارة إلى فراغ */
      state.lastTargetOk = false;
      spotlight.hide();
      tourBar.render();
    }
    state.locateTries = 0;
    raf(attempt);
  }

  /** اختيار هدف إبراز داخل الخطوة (لا يغيّر الخطوة — عقد «لا خطوات فرعية») */
  function setFocus(i) {
    const step = currentStep();
    if (!step) return;
    state.focusIdx = MODEL.clampIndex(i, Math.max(1, step.targets.length));
    locate();
    tourBar.render();
  }

  /** الانتقال إلى خطوة بالفهرس */
  function goto(i) {
    if (!state.steps.length) rebuildSteps();
    const next = MODEL.clampIndex(i, state.steps.length);
    const changed = next !== state.index;
    state.index = next;
    state.focusIdx = 0;
    state.stepStartedAt = Date.now();
    state.pausedStepAccum = 0;
    state.lastTargetOk = true;
    const step = currentStep();
    if (!step) return;
    const E = engine();
    if (E) {
      const cur = E.current();
      const already = cur && cur.kind === "scene" && cur.id === step.id
        && !(cur.params && cur.params.step);
      /* الجولة تدخل القسم بحالته الأولى دائماً (step=0 — عقد §6.2) */
      if (!already) E.goScene(step.id);
    }
    tourBar.render();
    if (notesDrawer.isOpen()) notesDrawer.render();
    /* الإبراز يُعاد في كل حال: تكرار الخطوة ذاتها يعيد الحلقة إلى مكانها بعد
       أن يكون المتحدث قد حرّك اللوحة أو فتح بطاقة تفاصيل فوقها */
    locate();
    return changed;
  }

  const next = () => goto(state.index + 1);
  const prev = () => goto(state.index - 1);
  const first = () => goto(0);
  const last = () => goto(state.steps.length - 1);

  /** تنفيذ فعل جولة قادم من مفتاح أو زر */
  function applyTourAction(action) {
    if (!state.active) return;
    if (action === "stop") { stop(); return; }
    const target = MODEL.applyAction(action, state.index, state.steps.length);
    if (target === state.index && (action === "next" || action === "prev")) {
      /* عند الطرف: لا لفّ — نعيد الرسم كي يظهر تعطيل الزر بوضوح */
      tourBar.render();
      return;
    }
    goto(target);
  }

  function togglePause() {
    if (!state.active) return;
    if (state.paused) {
      state.paused = false;
      state.startedAt = Date.now();
      state.stepStartedAt = Date.now();
    } else {
      state.pausedAccum = elapsedTotal();
      state.pausedStepAccum = elapsedStep();
      state.paused = true;
    }
    tourBar.render();
  }

  function toggleCollapse() {
    state.collapsed = !state.collapsed;
    tourBar.render();
  }

  function startTick() {
    stopTick();
    state.tick = setInterval(function () {
      if (!state.active) return;
      tourBar.renderClock();
      if (notesDrawer.isOpen() && !state.paused) {
        /* الدرج يعرض الإيقاع كذلك — تحديث خفيف كل خمس ثوانٍ */
        const e = elapsedStep();
        if (e % 5 === 0) notesDrawer.render();
      }
    }, 1000);
  }
  function stopTick() {
    if (state.tick) { clearInterval(state.tick); state.tick = null; }
  }

  /** إعادة قياس الحلقة عند تغيّر مقاس النافذة/ملء الشاشة */
  let resizeBound = null;
  function bindResize() {
    if (!CAN_DOM || resizeBound) return;
    resizeBound = function () { spotlight.place(); };
    window.addEventListener("resize", resizeBound);
    document.addEventListener("fullscreenchange", resizeBound);
  }
  function unbindResize() {
    if (!CAN_DOM || !resizeBound) return;
    window.removeEventListener("resize", resizeBound);
    document.removeEventListener("fullscreenchange", resizeBound);
    resizeBound = null;
  }

  /**
   * بدء الجولة.
   * opts.from — معرف قسم تبدأ منه (افتراضاً: القسم الحالي إن كان في التسلسل،
   * وإلا من أوله). لا تعمل خارج وضع المقدِّم.
   */
  function start(opts) {
    if (!CAN_DOM) return false;
    if (!inPresenterMode()) return false;
    const o = opts || {};
    rebuildSteps();
    if (!state.steps.length) return false;

    const E = engine();
    const cur = E && E.current ? E.current() : null;
    let idx = 0;
    if (o.from) idx = Math.max(0, MODEL.indexOf(state.steps, o.from));
    else if (typeof o.index === "number") idx = MODEL.clampIndex(o.index, state.steps.length);
    else if (cur && cur.kind === "scene") {
      const i = MODEL.indexOf(state.steps, cur.id);
      idx = i >= 0 ? i : 0;
    }

    state.active = true;
    state.index = idx;
    state.focusIdx = 0;
    state.collapsed = false;
    state.paused = false;
    state.pausedAccum = 0;
    state.pausedStepAccum = 0;
    state.startedAt = Date.now();
    state.stepStartedAt = Date.now();
    state.lastTargetOk = true;
    document.body.classList.add("tour-active");
    tourBar.show();
    startTick();
    bindResize();
    syncLaunch();
    goto(idx);
    /* التركيز على زر «التالي» كي يعمل جهاز التقديم فوراً بلا نقرة إضافية —
       ومستمع الشريط يوجّه مفاتيحه (مرور الكليكر مضمون في الحالتين) */
    raf(() => tourBar.focusNextButton());
    return true;
  }

  /** إنهاء الجولة وإعادة الحالة (الدرج مستقل — يبقى كما هو) */
  function stop(opts) {
    const o = opts || {};
    cancelLocate();
    stopTick();
    unbindResize();
    /* إزالة كاملة لا إخفاء: عقد §6.2 يوجب ألا يبقى للجولة أثر في DOM بعد
       إنهائها — لا طبقة حجاب معلّقة ولا صنف إبراز على عنصر قسم معتمد */
    spotlight.destroy();
    state.active = false;
    state.paused = false;
    state.collapsed = false;
    state.lastTargetOk = true;
    if (CAN_DOM) document.body.classList.remove("tour-active");
    tourBar.hide();
    tourBar.destroy();
    if (notesDrawer.isOpen() && !o.silent) notesDrawer.render();
    syncLaunch();
    return true;
  }

  const active = () => state.active;

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 11) نقطة الدخول على الغلاف + مراقبة المسار
     ══════════════════════════════════════════════════════════════════════════ */

  /** تركيب زر «جولة موجهة» داخل أزرار الغلاف القائمة (الاستثناء المرخص) */
  function mountLaunch() {
    if (!CAN_DOM) return false;
    if (!inPresenterMode()) return false;
    const root = activeRoot("00");
    if (!root) return false;
    const actions = root.querySelector(".cover-actions");
    if (!actions) return false;
    if (actions.querySelector(".tour-launch")) { syncLaunch(); return true; }
    const btn = D.h("button", {
      type: "button",
      /* الصنف المعتمد ذاته + بادئة الميزة: النمط مطابق لأزرار الغلاف */
      class: "btn-fullscreen tour-launch",
      title: "جولة موجهة عبر اللوحات التسع مع ملاحظات المتحدث",
      onclick: () => start(),
    }, "جولة موجهة");
    actions.appendChild(btn);
    syncLaunch();
    return true;
  }

  /** الزر يختفي أثناء الجولة (لا زر يقود إلى ما هو قائم) */
  function syncLaunch() {
    if (!CAN_DOM) return;
    for (const b of D.qsa(".tour-launch")) b.hidden = state.active;
  }

  /**
   * مزامنة بعد كل تغيّر مسار.
   * تُؤجَّل بـsetTimeout(0) لأن مستمع hashchange الخاص بهذا الملف يُسجَّل قبل
   * مستمع الموجّه (ترتيب الضم: tour.js قبل app.js)، فلا يكون المحرك قد بنى
   * المشهد الجديد بعد لو نُفِّذت فوراً.
   */
  function syncRoute() {
    if (!CAN_DOM) return;
    /* مغادرة وضع المقدِّم (إدارة/موجز): إيقاف كامل وإغلاق الدرج */
    if (!inPresenterMode()) {
      if (state.active) stop({ silent: true });
      notesDrawer.close();
      return;
    }
    const E = engine();
    const cur = E && E.current ? E.current() : null;
    state.inAppendix = !!(cur && cur.kind === "appendix");

    mountLaunch();

    if (state.active) {
      if (!state.steps.length) rebuildSteps();
      if (cur && cur.kind === "scene") {
        const i = MODEL.indexOf(state.steps, cur.id);
        if (i >= 0 && i !== state.index) {
          /* المستخدم غادر إلى قسم آخر بوسيلته الخاصة — الجولة تلحق به */
          state.index = i;
          state.focusIdx = 0;
          state.stepStartedAt = Date.now();
          state.pausedStepAccum = 0;
        }
      }
      tourBar.render();
      locate();
    }
    if (notesDrawer.isOpen()) notesDrawer.render();
  }

  let syncTimer = null;
  function scheduleSync(delay) {
    if (!CAN_DOM) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      syncTimer = null;
      syncRoute();
    }, delay == null ? 0 : delay);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 12) الإقلاع: اشتراكات دائمة على مستوى التطبيق
     ──────────────────────────────────────────────────────────────────────────
     الملف يُحمَّل مرة واحدة، فهذه المستمعات لا تتراكم أبداً (عقد §6.2).
     ══════════════════════════════════════════════════════════════════════════ */

  bus.on("notes:toggle", function () {
    if (!CAN_DOM) return;
    if (!inPresenterMode()) return;
    notesDrawer.toggle();
  });

  bus.on("tour:key", function (key) {
    if (!state.active) return;
    const action = MODEL.keyToAction(key);
    if (!action) return;
    applyTourAction(action);
  });

  if (CAN_DOM) {
    window.addEventListener("hashchange", function () { scheduleSync(0); });

    /* راصد المسرح: يعيد تركيب زر الغلاف بعد كل إعادة بناء له، ويعيد قياس
       الحلقة إن تغيّرت اللوحة تحتها. عمله لكل دفعة تغييرات إطارٌ واحد. */
    if (typeof MutationObserver === "function") {
      let queued = false;
      const obs = new MutationObserver(function () {
        if (queued) return;
        queued = true;
        raf(function () {
          queued = false;
          mountLaunch();
          if (state.active) spotlight.place();
        });
      });
      const startObserving = function () {
        const stage = document.getElementById("stage");
        if (stage) obs.observe(stage, { childList: true, subtree: true });
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startObserving, { once: true });
      } else {
        startObserving();
      }
    }

    /* أول مزامنة بعد إقلاع التطبيق (المتجر ثم المحرك ثم الموجّه) */
    scheduleSync(0);
    setTimeout(function () { mountLaunch(); }, 240);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     القسم 13) الواجهة العامة
     ══════════════════════════════════════════════════════════════════════════ */
  return {
    version: "1",
    start,
    stop,
    active,
    next,
    prev,
    goto,
    first,
    last,
    setFocus,
    togglePause,
    toggleCollapse,
    mountLaunch,
    steps: () => state.steps.slice(),
    currentIndex: () => state.index,
    currentStep,
    rebuildSteps,
    notes: {
      toggle: () => notesDrawer.toggle(),
      open: () => notesDrawer.open(),
      close: () => notesDrawer.close(),
      isOpen: () => notesDrawer.isOpen(),
      render: () => notesDrawer.render(),
      scale: () => notesDrawer.scale(),
      setScale: (v) => notesDrawer.setScale(v),
    },
    model: MODEL,
    TARGETS,
  };
})();
