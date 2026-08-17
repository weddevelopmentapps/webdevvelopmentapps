/* ════════════════════════════════════════════════════════════════════════════
   ax-atlas.js — أطلس الأحياء (ملحق `atlas`)
   عقد V2_CONTRACTS_EXPANSION §5 — بادئة الأنماط `atl-` في src/styles/atlas.css
   ────────────────────────────────────────────────────────────────────────────
   ما تفعله هذه الوحدة بالضبط:

     ▸ تنشر نموذجاً **نقياً** على `RH.explore.districts` (لا DOM إطلاقاً) يحوّل
       فهرس `RH.viz.geoutils.districtIndex` للأحياء الـ189 إلى قراءات قابلة
       للعرض والاختبار: ترشيح وبحث وترتيب وترقيم صفحات، اشتقاق حالة كل حي
       (ضمن العينة / خارج العينة)، لوحة الحي بأرقام قطاعه ونقاط التركّز
       ضمن 3 كم وجيرانه الجغرافيين، ولوحة تمهيدية بإحصاءات موزونة من الإصدار.
       كل دالة منها تُختبر في `tests/unit/atlas-model.test.mjs`.

     ▸ تسجّل ملحقاً من **صفحة واحدة بعمودين** عبر `RH.presenter.ax.register`
       كما ينص العقد حرفياً:
         • عمود البحث والقائمة: حقل بحث بتطبيع `geoutils.normalizeAr`
           و`searchDistricts`، مرشّحات القطاعات الخمسة، مفتاح «ضمن العينة»،
           خمسة ترتيبات، عدّاد نتائج بـ`fmt`، قائمة `role="listbox"` بملاحة
           لوحة مفاتيح كاملة (أسهم/Home/End/PageUp/PageDown/Enter)، وترقيم
           صفحات بحسابٍ نقي مُختبَر.
         • لوحة الحي: ترويسة الاسم والقطاع ووسم العينة؛ خريطة الأطلس المصغرة
           (SVG خاص بالملحق يرسمه `geoutils.projector(...).ringPath` — **لا**
           تعديل على `viz/geomap.js`) بوضعي «المدينة/القطاع» وسطر الإسناد؛
           وخمسة ألسنة `role="tab"`: الحي والقطاع · قيم العينة · التركّز
           الرقابي · الجوار · الإسناد والصدق.

   قواعد ملزمة مطبَّقة حرفياً في هذا الملف:
   • **لا رقم على مستوى الحي إلا من عينة الأحياء المدرجة**: صف الحي في
     `release.neighbourhoods.rows` هو المصدر الوحيد لقيمه، ويلازمه
     `meta.sample_label` أينما ظهر. الحي خارج العينة يعرض **الحالة الصادقة**
     المنصوصة في العقد حرفاً بحرف داخل بطاقة `layout.pendingCard` — ولا
     يُشتق له رقم من القطاع ولا من الجوار ولا من أي متوسط.
   • **أرقام القطاع تُسمّى قطاعية صراحةً** في كل موضع تظهر فيه داخل لوحة حي،
     مصدرها `release.sectors` و`derived.sector` المنشورة (لا إعادة حساب).
   • **نقاط التركّز**: مواقعها من `riyadh-geo.json` وتلازمها عبارة «مواقع
     النقاط توضيحية من سجل المنصة» وسطر إسناد الحدود، والمسافات بحساب
     `geoutils.distanceKm` (haversine) لا بتقدير.
   • **الخريطة المصغرة** تحمل `meta.map_disclaimer` وسطر إسناد الحدود، وهي
     إسقاط `geoutils.projector` ذاته المستخدم في الخريطة المعتمدة — تطابق
     هندسي لا رسم جديد.
   • **منظومة المعنى**: الأخضر للطاقة/التغطية، الرملي للطلب، المرجاني للعجز
     والمخالفات حصراً، الذهبي للوسوم وخطوط الأساس حصراً، الأزرق ثانوي،
     والمحايد لعدم اليقين وحالات «لا بيانات». لا محاور مزدوجة ولا gauges —
     النسب بشريط `RH.viz.micro.ratioBar` وهو البديل القانوني.
   • **الأرقام عبر `RH.core.fmt` حصراً** (تطابق العدد والمعدود، عزل اتجاهي)،
     وكل نص يدخل DOM عبر عقد `dom.h` النصي — لا `innerHTML` لمحتوى إصدار.
   • **لوحة المفاتيح**: حقل البحث والمرشّحات والقائمة والألسنة والترقيم كلها
     عناصر حقيقية قابلة للتركيز وموسومة `data-interactive` فلا يبتلع جهاز
     التقديم ضغطاتها (عقد الملاحة §8)؛ القائمة `role="listbox"` بـ
     `aria-activedescendant` والتمرير يتبع التركيز؛ الألسنة بملاحة أسهم
     أفقية معكوسة الاتجاه (RTL).
   • **الحالة تصمد**: الحي المختار والاستعلام والمرشّح والترتيب والصفحة
     واللسان تُكتب في معاملات المسار عبر `ctx.update` **مؤجَّلة ومجمّعة**
     (كل تحديث معاملات يعيد بناء الملحق بعقد المحرك، فالكتابة تُؤخَّر ويُعاد
     التركيز إلى العنصر ذاته بعد البناء) — فتعود اللوحة كما تُركت.
   • **التنظيف**: المؤقّت المؤجَّل الوحيد يُلغى في `ctx.onTeardown`؛ لا مستمع
     عام ولا مثيل ECharts في هذا الملحق (كل الرسوم SVG/DOM من `RH.viz.micro`
     ومن مُسقط `geoutils`).
   • **prefers-reduced-motion**: لا حركة في هذا الملف أصلاً؛ الانتقالات
     البصرية كلها في `atlas.css` وتُصفَّر هناك عند طلب التقليل.

   ملاحظة قابلية الاختبار (عقد التوسعة §0): النموذج النقي يُعرَّف وقت التحميل
   دون أي لمس لـ`document`/`window`، وتسجيل الملحق مشروط بحضور
   `RH.presenter.ax` — فيُحمَّل الملف في بيئة اختبار الوحدة بنموذجه وحده.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════════════════════════════════════════════════════════════════
   القسم 1) النموذج النقي — RH.explore.districts
   لا DOM، لا حالة عامة، لا آثار جانبية: مدخلاته فهرس geoutils وكائن الإصدار
   وملف الحدود، ومخرجاته بيانات جاهزة للعرض. الفضاء `RH.explore` منشأ سلفاً
   في ns.js (عقد §2.1) فيُكتب عليه مباشرة بلا `|| {}`.
   ══════════════════════════════════════════════════════════════════════════ */
RH.explore.districts = (function () {
  const G = RH.viz.geoutils;
  const fmt = RH.core.fmt;

  /* ── ثوابت مقفلة (ليست بيانات) ───────────────────────────────────────── */

  /** الحالة الصادقة المنصوصة في العقد §5 — حرفاً بحرف، لا إعادة صياغة */
  const HONEST_NO_DATA = "لا بيانات على مستوى الحي — القيم المعروضة قطاعية، "
    + "والحي خارج عينة الأحياء المدرجة";

  /** نصف قطر جوار التركّز الرقابي المعتمد في العقد (كم) */
  const HOTSPOT_RADIUS_KM = 3;

  /** حجم صفحة القائمة الافتراضي — يتسع في إطار المسرح دون تمرير الصفحة */
  const PAGE_SIZE = 12;

  /** عدد الجيران المعروضين في لسان «الجوار» */
  const NEIGHBOUR_LIMIT = 8;

  /** نص الإسناد القانوني للحدود (حرفياً من عقد geomap §4) */
  const ATTRIB_TEXT = "حدود الأحياء: بيانات عامة (MIT) — مواقع النقاط "
    + "توضيحية من سجل المنصة";

  /** صيغ العدد والمعدود التي لا تغطيها NOUNS المركزية في format.js */
  const NOUNS = {
    district: {
      one: "حي واحد", two: "حيان", few: "أحياء", many: "حياً",
      hundred: "حي", zero: "لا أحياء",
    },
    point: {
      one: "نقطة واحدة", two: "نقطتان", few: "نقاط", many: "نقطة",
      hundred: "نقطة", zero: "لا نقاط",
    },
    result: {
      one: "نتيجة واحدة", two: "نتيجتان", few: "نتائج", many: "نتيجة",
      hundred: "نتيجة", zero: "لا نتائج",
    },
    sector: {
      one: "قطاع واحد", two: "قطاعان", few: "قطاعات", many: "قطاعاً",
      hundred: "قطاع", zero: "لا قطاعات",
    },
    page: {
      one: "صفحة واحدة", two: "صفحتان", few: "صفحات", many: "صفحة",
      hundred: "صفحة", zero: "لا صفحات",
    },
  };

  /** معرّفات الترتيب القانونية — أي معرف خارجها يسقط إلى "auto" */
  const SORT_IDS = ["auto", "name", "sector", "beds", "violations", "hotspots"];

  /** تسميات الترتيب المعروضة (نص واجهة لا بيانات) */
  const SORT_LABELS = {
    auto: "تلقائي — الأنسب للسياق",
    name: "أبجدياً بالاسم",
    sector: "بالقطاع ثم الاسم",
    beds: "أسرّة العينة (تنازلياً)",
    violations: "مخالفات العينة (تنازلياً)",
    hotspots: "نقاط التركّز القريبة",
  };

  /** الترتيبات التي تعتمد على قيم العينة وحدها — تُوسم في الواجهة بصدق:
      الأحياء خارج العينة لا قيمة لها فتنزل آخر القائمة بلا اختلاق صفر */
  const SAMPLE_SORTS = ["beds", "violations"];

  /** معرّفات ألسنة اللوحة القانونية */
  const TAB_IDS = ["profile", "sample", "watch", "near", "prov"];

  const isNum = (v) => typeof v === "number" && Number.isFinite(v);

  /* ══════════════════════════════════════════════════════════════════════
     1-أ) التنسيق المركزي لقيم الأطلس
     ──────────────────────────────────────────────────────────────────────
     الوحدة لا تنسق رقماً بنفسها: كل قيمة تمر من RH.core.fmt عبر «نوع» معلن،
     فيبقى نظام الأرقام والفواصل والعزل الاتجاهي وتطابق العدد والمعدود
     مركزياً واحداً. النوع المجهول يسقط إلى fmt.int (لا صمت ولا تخمين).
     ══════════════════════════════════════════════════════════════════════ */

  /** أنواع القيم المعروضة في الأطلس — المفتاح يسافر مع القيمة في النماذج */
  const VALUE_KINDS = ["int", "pct", "beds", "compactBeds", "licence", "visit",
    "violation", "monitor", "decision", "district", "point", "km", "density"];

  /**
   * تنسيق قيمة واحدة بنوعها المعلن — الدالة النقية التي تُختبر مباشرة.
   * القيمة الغائبة تعطي شرطة محايدة «—» لا صفراً مختلقاً.
   */
  function formatValue(value, kind) {
    if (!isNum(value)) return "—";
    switch (kind) {
      case "pct": return fmt.pct(value);
      case "beds": return fmt.unitAfter(value, "سرير");
      case "compactBeds": return fmt.compact(value) + fmt.NBSP + "سرير";
      case "licence": return fmt.noun(value, "licence");
      case "visit": return fmt.noun(value, "visit");
      case "violation": return fmt.noun(value, "violation");
      case "monitor": return fmt.noun(value, "monitor");
      case "decision": return fmt.noun(value, "decision");
      case "district": return fmt.countNoun(value, NOUNS.district);
      case "point": return fmt.countNoun(value, NOUNS.point);
      case "km": return fmt.iso(fmt.dec1(value) + fmt.NBSP + "كم");
      case "density": return fmt.iso(fmt.int(value));
      case "int":
      default: return fmt.int(value);
    }
  }

  /** تسمية عدد النتائج بتطابق عربي سليم: «7 نتائج» لا «7 نتيجة» */
  function resultsLabel(n) {
    return fmt.countNoun(isNum(n) ? n : 0, NOUNS.result);
  }

  /** تسمية عدد الأحياء بتطابق عربي سليم */
  function districtsLabel(n) {
    return fmt.countNoun(isNum(n) ? n : 0, NOUNS.district);
  }

  /** تسمية عدد نقاط التركّز */
  function pointsLabel(n) {
    return fmt.countNoun(isNum(n) ? n : 0, NOUNS.point);
  }

  /** سطر مدى الصفحة المعروض: «‎1–12 من 189 حياً» بعزل اتجاهي للمدى */
  function rangeLabel(pg) {
    if (!pg || !pg.total) return "لا نتائج مطابقة";
    return fmt.iso(fmt.int(pg.from) + "–" + fmt.int(pg.to))
      + " من " + districtsLabel(pg.total);
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ب) الفهرس والبحث والترشيح
     ──────────────────────────────────────────────────────────────────────
     قاعدة الاستهلاك (عقد §10): لا منطق تطبيع أو بحث جديد هنا — الأطلس يبني
     فهرسه عبر `geoutils` حصراً ويضيف فوقه ترشيحاً وترتيباً وترقيماً.
     ══════════════════════════════════════════════════════════════════════ */

  /** الفهرس الموحد للأحياء الـ189 — تفويض صريح إلى أدوات الجغرافيا */
  function index(geo, release, derived) {
    return G.districtIndex(geo, release, derived);
  }

  /** تطبيع الاستعلام — تفويض صريح كي لا يتسرب تطبيع محلي إلى الميزة */
  function normalizeQuery(q) {
    return G.normalizeAr(q);
  }

  /** استرجاع مدخل بمعرفه الثابت (معامل ?d= والقائمة والخريطة المصغرة) */
  function findByKey(list, key) {
    return G.findByKey(list || [], key);
  }

  /** المعرف الثابت لحي من قطاعه واسمه — يستخدمه المضيف عند القفز من الخريطة */
  function keyOf(sector, name) {
    if (!sector || !name) return "";
    return String(sector) + ":" + G.normDistrict(name);
  }

  /**
   * ترشيح الفهرس: استعلام حر (اختياري) ثم قطاع ثم حصر على العينة.
   * استعلام فارغ → الفهرس كاملاً بترتيبه الأصلي (لا قائمة فارغة كاذبة).
   * الترتيب الوارد من البحث هو ترتيب الدرجات — يحفظه "auto".
   */
  function filterEntries(list, opts) {
    const o = opts || {};
    const all = Array.isArray(list) ? list : [];
    const q = normalizeQuery(o.query);
    let out = q ? G.searchDistricts(all, o.query, all.length || 1) : all.slice();
    if (o.sector && o.sector !== "all") {
      out = out.filter((e) => e.sector === o.sector);
    }
    if (o.sampleOnly) out = out.filter((e) => !!e.sample);
    return out;
  }

  /** قيمة عينة لمقياس — الغياب ‎-1 كي ينزل الحي آخر الترتيب بلا اختلاق صفر */
  function sampleMetric(entry, metric) {
    if (!entry || !entry.sample) return -1;
    const v = entry.sample[metric];
    return isNum(v) ? v : -1;
  }

  /** موضع القطاع في الترتيب القانوني (مجهول → آخر القائمة) */
  function sectorRank(entry) {
    const i = G.SECTOR_ORDER.indexOf(entry ? entry.sector : null);
    return i < 0 ? G.SECTOR_ORDER.length : i;
  }

  /** مقارنة اسمية عربية ثابتة — كاسر التعادل الوحيد في كل الترتيبات */
  function byName(a, b) {
    return String(a.name).localeCompare(String(b.name), "ar");
  }

  /**
   * ترتيب النتائج بمعرّف قانوني. "auto" يحفظ ترتيب الوارد (درجات البحث أو
   * ترتيب الملف)، والترتيبات المعتمدة على العينة تُنزل غير المدرجين آخراً.
   * الدالة نقية: تعيد نسخة جديدة ولا تمس المصفوفة الواردة.
   */
  function sortEntries(entries, sortKey, opts) {
    const o = opts || {};
    const out = (entries || []).slice();
    const key = SORT_IDS.includes(sortKey) ? sortKey : "auto";
    switch (key) {
      case "name":
        out.sort(byName);
        break;
      case "sector":
        out.sort((a, b) => sectorRank(a) - sectorRank(b) || byName(a, b));
        break;
      case "beds":
        out.sort((a, b) => sampleMetric(b, "beds") - sampleMetric(a, "beds")
          || byName(a, b));
        break;
      case "violations":
        out.sort((a, b) => sampleMetric(b, "violations")
          - sampleMetric(a, "violations") || byName(a, b));
        break;
      case "hotspots": {
        const stats = o.stats instanceof Map ? o.stats : new Map();
        const count = (e) => {
          const s = stats.get(e.key);
          return s && isNum(s.count) ? s.count : 0;
        };
        const nearest = (e) => {
          const s = stats.get(e.key);
          return s && isNum(s.nearestKm) ? s.nearestKm : Number.POSITIVE_INFINITY;
        };
        out.sort((a, b) => count(b) - count(a) || nearest(a) - nearest(b)
          || byName(a, b));
        break;
      }
      case "auto":
      default:
        break;   // ترتيب الوارد كما هو — درجات البحث أو ترتيب ملف الحدود
    }
    return out;
  }

  /**
   * حساب الترقيم النقي — الدالة التي يختبرها `atlas-model.test.mjs` مباشرة.
   * الصفحات ‎1-based (المحرك يحذف المعاملات ذات القيمة "0" من العنوان، فلا
   * يجوز أن تكون الصفحة الأولى صفراً)، والصفحة خارج المدى تُحصر بلا خطأ،
   * والقائمة الفارغة تعطي صفحة واحدة بمدى صفري صادق لا مدى وهمياً.
   */
  function paginate(items, page, pageSize) {
    const list = Array.isArray(items) ? items : [];
    const rawSize = typeof pageSize === "string"
      ? parseInt(pageSize, 10) : pageSize;
    const size = isNum(rawSize) && rawSize > 0 ? Math.trunc(rawSize) : PAGE_SIZE;
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / size));
    const rawPage = typeof page === "string" ? parseInt(page, 10) : page;
    const p = Math.max(1, Math.min(pages, isNum(rawPage) ? Math.trunc(rawPage) : 1));
    const start = (p - 1) * size;
    const slice = list.slice(start, start + size);
    return {
      page: p,
      pages,
      pageSize: size,
      total,
      from: total ? start + 1 : 0,
      to: total ? start + slice.length : 0,
      items: slice,
      hasPrev: p > 1,
      hasNext: p < pages,
    };
  }

  /** فهرس الصفحة التي يقع فيها عنصر بمعرفه (لإظهار الحي المختار تلقائياً) */
  function pageOfKey(entries, key, pageSize) {
    if (!key) return 1;
    const list = Array.isArray(entries) ? entries : [];
    const size = isNum(pageSize) && pageSize > 0 ? Math.trunc(pageSize) : PAGE_SIZE;
    for (let i = 0; i < list.length; i++) {
      if (list[i] && list[i].key === key) return Math.floor(i / size) + 1;
    }
    return 1;
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ج) اشتقاق الحالات — «ضمن العينة» و«قراءة التغطية»
     ──────────────────────────────────────────────────────────────────────
     الحالة اشتقاق تعريفي من حضور صف العينة لا حكم تقديري؛ ونغمتها محايدة
     عمداً: «خارج العينة» نقص تغطية بيانات لا خلل تشغيلي (المرجاني للعجز
     والمخالفات حصراً — عقد اللون).
     ══════════════════════════════════════════════════════════════════════ */

  /** حالة إدراج الحي في عينة قاعدة البيانات */
  function sampleStatus(entry) {
    if (!entry) {
      return { id: "unknown", label: "—", tone: "neu", inSample: false };
    }
    if (entry.sample) {
      return {
        id: "in_sample",
        label: "ضمن العينة",
        tone: "pos",
        inSample: true,
      };
    }
    return {
      id: "sector_only",
      label: "خارج العينة",
      tone: "neu",
      inSample: false,
    };
  }

  /**
   * قراءة تغطية القطاع مقابل تغطية المدينة المعتمدة — وسم قراءة لا حكم:
   * «دون متوسط المدينة» محايد (فجوة تغطية)، و«فوق متوسط المدينة» أخضر.
   * الفارق بنقاط مئوية محسوب على القيمتين المعروضتين نفسيهما.
   */
  function coverageStatus(sectorPct, cityPct) {
    if (!isNum(sectorPct) || !isNum(cityPct)) {
      return { id: "unknown", label: "—", tone: "neu", deltaPts: null };
    }
    const deltaPts = RH.data.derive.roundHalfUp(sectorPct - cityPct, 1);
    if (deltaPts > 0) {
      return {
        id: "above", label: "فوق متوسط المدينة", tone: "pos", deltaPts,
      };
    }
    if (deltaPts < 0) {
      return {
        id: "below", label: "دون متوسط المدينة", tone: "neu", deltaPts,
      };
    }
    return { id: "equal", label: "على متوسط المدينة", tone: "neu", deltaPts: 0 };
  }

  /**
   * قراءة كثافة التركّز الرقابي حول الحي — تصنيف عرضي معلن الحدود:
   * لا نقطة ضمن النطاق / نقطة واحدة / أكثر. النغمة مرجانية عند وجود تركّز
   * (مخالفات ورقابة — الاستخدام الدلالي المسموح للمرجاني).
   */
  function watchStatus(hotspots) {
    const list = Array.isArray(hotspots) ? hotspots : [];
    if (!list.length) {
      return {
        id: "none",
        label: "لا نقاط تركّز ضمن النطاق",
        tone: "neu",
        count: 0,
      };
    }
    if (list.length === 1) {
      return {
        id: "single", label: "نقطة تركّز واحدة", tone: "neg", count: 1,
      };
    }
    return {
      id: "cluster",
      label: pointsLabel(list.length) + " ضمن النطاق",
      tone: "neg",
      count: list.length,
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-د) أرقام القطاع — من release.sectors وderived.sector المنشورين حصراً
     ══════════════════════════════════════════════════════════════════════ */

  /** صف القطاع من الإصدار بمعرفه */
  function sectorRowOf(release, sectorId) {
    const rows = release && Array.isArray(release.sectors) ? release.sectors : [];
    for (const s of rows) { if (s.id === sectorId) return s; }
    return null;
  }

  /** مشتقات القطاع المنشورة بمعرفه */
  function sectorDerivedOf(derived, sectorId) {
    if (!derived || !derived.sector) return null;
    return derived.sector[sectorId] || null;
  }

  /**
   * أرقام القطاع الثلاثة عشر بترتيبها العرضي — كل عنصر يحمل نوع تنسيقه
   * ونغمته الدلالية ومصدره (`origin`) كي يسافر الإسناد مع الرقم.
   */
  function sectorFigures(sectorRow, sd) {
    if (!sectorRow) return [];
    const out = [
      {
        id: "demand", label: "الطلب التقديري", value: sectorRow.demand,
        kind: "beds", unit: "سرير", tone: "demand", origin: "sectors[].demand",
      },
      {
        id: "beds", label: "الطاقة المرخصة", value: sectorRow.beds,
        kind: "beds", unit: "سرير", tone: "pos", origin: "sectors[].beds",
      },
      {
        id: "building", label: "رخص البناء", value: sectorRow.building,
        kind: "licence", unit: "رخصة", tone: "neu", origin: "sectors[].building",
      },
      {
        id: "operational", label: "الرخص التشغيلية",
        value: sectorRow.operational, kind: "licence", unit: "رخصة",
        tone: "neu", origin: "sectors[].operational",
      },
      {
        id: "visits", label: "الزيارات الميدانية", value: sectorRow.visits,
        kind: "visit", unit: "زيارة", tone: "neu", origin: "sectors[].visits",
      },
      {
        id: "violations", label: "المخالفات المسجلة",
        value: sectorRow.violations, kind: "violation", unit: "مخالفة",
        tone: "neg", origin: "sectors[].violations",
      },
      {
        id: "monitors", label: "المراقبون الميدانيون", value: sectorRow.monitors,
        kind: "monitor", unit: "مراقب", tone: "neu", origin: "sectors[].monitors",
      },
      {
        id: "closures", label: "قرارات الإغلاق", value: sectorRow.closures,
        kind: "decision", unit: "قرار", tone: "neu", origin: "sectors[].closures",
      },
    ];
    if (sd) {
      out.push({
        id: "coverage_pct", label: "نسبة تغطية الطلب", value: sd.coverage_pct,
        kind: "pct", unit: "٪", tone: "pos",
        origin: "derived.sector[].coverage_pct",
      });
      out.push({
        id: "deficit_beds", label: "عجز الأسرّة", value: sd.deficit_beds,
        kind: "beds", unit: "سرير", tone: "neg",
        origin: "derived.sector[].deficit_beds",
      });
      out.push({
        id: "demand_share_pct", label: "حصة القطاع من طلب المدينة",
        value: sd.demand_share_pct, kind: "pct", unit: "٪", tone: "demand",
        origin: "derived.sector[].demand_share_pct",
      });
      out.push({
        id: "violations_share_pct", label: "حصة القطاع من مخالفات المدينة",
        value: sd.violations_share_pct, kind: "pct", unit: "٪", tone: "neg",
        origin: "derived.sector[].violations_share_pct",
      });
      out.push({
        id: "visits_share_pct", label: "حصة القطاع من زيارات المدينة",
        value: sd.visits_share_pct, kind: "pct", unit: "٪", tone: "neu",
        origin: "derived.sector[].visits_share_pct",
      });
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-هـ) بطاقة العينة — المصدر الوحيد لقيم مستوى الحي
     ══════════════════════════════════════════════════════════════════════ */

  /** وسم العينة المنشور (meta.sample_label) — يلازم كل قيمة حي */
  function sampleLabelOf(release) {
    const meta = release && release.meta ? release.meta : null;
    if (meta && meta.sample_label) return String(meta.sample_label);
    const nb = release && release.neighbourhoods ? release.neighbourhoods : null;
    return nb && nb.label ? String(nb.label) : "";
  }

  /** ملاحظة الترتيب المنشورة (كل ترتيب ضمن العينة فقط) */
  function rankingNoteOf(release) {
    const nb = release && release.neighbourhoods ? release.neighbourhoods : null;
    return nb && nb.ranking_note ? String(nb.ranking_note) : "";
  }

  /** كل صفوف العينة (20 صفاً) */
  function sampleRows(release) {
    const nb = release && release.neighbourhoods ? release.neighbourhoods : null;
    return nb && Array.isArray(nb.rows) ? nb.rows : [];
  }

  /**
   * بطاقة قيم الحي من صف العينة — أربع قيم موثقة بوسمها.
   * غياب الصف يعيد null والمستدعي يعرض الحالة الصادقة (لا بديل مشتق).
   */
  function sampleBlock(row, release) {
    if (!row) return null;
    return {
      name: String(row.name),
      sector: row.sector,
      sampleLabel: sampleLabelOf(release),
      rankingNote: rankingNoteOf(release),
      rows: [
        {
          id: "beds", label: "الطاقة الاستيعابية", value: row.beds,
          kind: "beds", unit: "سرير", tone: "pos",
        },
        {
          id: "building", label: "رخص البناء", value: row.building,
          kind: "licence", unit: "رخصة", tone: "neu",
        },
        {
          id: "operational", label: "الرخص التشغيلية", value: row.operational,
          kind: "licence", unit: "رخصة", tone: "neu",
        },
        {
          id: "violations", label: "المخالفات المسجلة", value: row.violations,
          kind: "violation", unit: "مخالفة", tone: "neg",
        },
      ],
    };
  }

  /** مجاميع العينة العشرين — تُعرض موسومة «مجموع العينة» لا «مجموع المدينة» */
  function sampleTotals(release) {
    const rows = sampleRows(release);
    const t = {
      count: rows.length, beds: 0, building: 0, operational: 0, violations: 0,
    };
    for (const r of rows) {
      t.beds += isNum(r.beds) ? r.beds : 0;
      t.building += isNum(r.building) ? r.building : 0;
      t.operational += isNum(r.operational) ? r.operational : 0;
      t.violations += isNum(r.violations) ? r.violations : 0;
    }
    return t;
  }

  /**
   * ترتيب صف عينة داخل العينة لمقياس معلوم — يلازمه ranking_note دائماً.
   * الترتيب تنازلي (الأعلى = 1)، والتعادل يأخذ الرتبة نفسها بلا قفز مصطنع.
   */
  function sampleRank(release, row, metric) {
    if (!row || !isNum(row[metric])) return null;
    const rows = sampleRows(release).filter((r) => isNum(r[metric]));
    if (!rows.length) return null;
    let above = 0;
    for (const r of rows) { if (r[metric] > row[metric]) above += 1; }
    return {
      metric,
      rank: above + 1,
      of: rows.length,
      value: row[metric],
      note: rankingNoteOf(release),
    };
  }

  /** رتب صف العينة على المقاييس الأربعة معاً — لوحة قراءة كاملة */
  function sampleRanks(release, row) {
    if (!row) return [];
    const defs = [
      { metric: "beds", label: "الطاقة الاستيعابية", kind: "beds" },
      { metric: "building", label: "رخص البناء", kind: "licence" },
      { metric: "operational", label: "الرخص التشغيلية", kind: "licence" },
      { metric: "violations", label: "المخالفات المسجلة", kind: "violation" },
    ];
    const out = [];
    for (const d of defs) {
      const r = sampleRank(release, row, d.metric);
      if (r) out.push(Object.assign({ label: d.label, kind: d.kind }, r));
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-و) نقاط التركّز الرقابي والجوار الجغرافي
     ══════════════════════════════════════════════════════════════════════ */

  /** نقاط التركّز ضمن نصف القطر المعتمد حول مركز الحي (تصاعدياً بالمسافة) */
  function hotspotsFor(entry, geo, radiusKm) {
    if (!entry || !entry.centroid) return [];
    const r = isNum(radiusKm) && radiusKm > 0 ? radiusKm : HOTSPOT_RADIUS_KM;
    return G.hotspotsNear(geo, entry.centroid, r).map((hs) => ({
      km: hs.km, density: hs.density, sector: hs.sector,
      lat: hs.lat, lng: hs.lng,
    }));
  }

  /** خلاصة عددية لنقاط التركّز — عدد وأقرب مسافة وأعلى كثافة ومجموعها */
  function hotspotSummary(list) {
    const arr = Array.isArray(list) ? list : [];
    if (!arr.length) {
      return { count: 0, nearestKm: null, maxDensity: null, sumDensity: 0 };
    }
    let nearestKm = arr[0].km;
    let maxDensity = null;
    let sumDensity = 0;
    for (const hs of arr) {
      if (isNum(hs.km) && hs.km < nearestKm) nearestKm = hs.km;
      if (isNum(hs.density)) {
        sumDensity += hs.density;
        if (maxDensity == null || hs.density > maxDensity) maxDensity = hs.density;
      }
    }
    return { count: arr.length, nearestKm, maxDensity, sumDensity };
  }

  /**
   * إحصاء نقاط التركّز لكل أحياء الفهرس دفعة واحدة — يغذي ترتيب "hotspots".
   * خريطة معرف → خلاصة؛ لا يعدل مدخلات الفهرس (لا حقن حقول على المدخلات).
   */
  function hotspotStats(list, geo, radiusKm) {
    const out = new Map();
    for (const e of list || []) {
      out.set(e.key, hotspotSummary(hotspotsFor(e, geo, radiusKm)));
    }
    return out;
  }

  /**
   * الجيران الجغرافيون: أقرب الأحياء بمسافة haversine بين المراكز.
   * حساب هندسي بحت من ملف الحدود — لا قيمة بيانات مشتقة ولا ترجيح.
   */
  function neighboursOf(list, entry, limit) {
    if (!entry || !entry.centroid) return [];
    const n = isNum(limit) && limit > 0 ? Math.trunc(limit) : NEIGHBOUR_LIMIT;
    const out = [];
    for (const e of list || []) {
      if (!e || e.key === entry.key || !e.centroid) continue;
      out.push({
        entry: e,
        km: Math.round(G.distanceKm(entry.centroid, e.centroid) * 10) / 10,
        sameSector: e.sector === entry.sector,
        inSample: !!e.sample,
      });
    }
    out.sort((a, b) => a.km - b.km || byName(a.entry, b.entry));
    return out.slice(0, n);
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ز) نموذج لوحة الحي — العقد الرسمي (§5)
     ══════════════════════════════════════════════════════════════════════ */

  /**
   * لوحة الحي المختار: اسمه وقطاعه، أرقام قطاعه المنشورة، بطاقة عينته إن
   * وُجدت (وإلا الحالة الصادقة المنصوصة)، ونقاط التركّز ضمن 3 كم.
   * `entry` مدخل من `geoutils.districtIndex`؛ `derived` اختياري.
   */
  function panelModel(entry, release, derived, geo) {
    if (!entry) return null;
    const sectorRow = entry.sectorRow || sectorRowOf(release, entry.sector);
    const sd = entry.sectorDerived || sectorDerivedOf(derived, entry.sector);
    const sample = sampleBlock(entry.sample, release);
    return {
      key: entry.key,
      name: String(entry.name),
      name_en: String(entry.name_en || ""),
      sector: entry.sector,
      sectorName: String(entry.sectorName
        || (sectorRow ? sectorRow.name : entry.sector)),
      sectorShort: sectorRow ? String(sectorRow.short || "") : "",
      centroid: entry.centroid || null,
      sectorFigures: sectorFigures(sectorRow, sd),
      sample,
      hotspots: hotspotsFor(entry, geo),
      honest: sample ? null : HONEST_NO_DATA,
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ح) اللوحة التمهيدية — لا حي مختاراً
     ──────────────────────────────────────────────────────────────────────
     إحصاءات موزونة من الإصدار وملف الحدود حصراً: عدد الأحياء بالقطاع من
     geo، وإجماليات القطاعات ومشتقاتها من الإصدار. لا قيمة حيّية مختلقة.
     ══════════════════════════════════════════════════════════════════════ */

  /** عدد الأحياء في ملف الحدود (0 عند غياب الملف — بناء جزئي) */
  function countDistricts(geo) {
    if (!geo || !geo.sectors) return 0;
    let n = 0;
    for (const k of Object.keys(geo.sectors)) {
      n += (geo.sectors[k] || []).length;
    }
    return n;
  }

  /** إحصاءات الجغرافيا لكل قطاع: عدد الأحياء والنقاط وأعلى كثافة */
  function sectorGeoStats(geo) {
    const st = Object.create(null);
    if (!geo || !geo.sectors) return st;
    for (const k of Object.keys(geo.sectors)) {
      st[k] = {
        districts: (geo.sectors[k] || []).length, hotspots: 0, maxDensity: null,
      };
    }
    for (const hs of geo.hotspots || []) {
      if (!st[hs.sector]) {
        st[hs.sector] = { districts: 0, hotspots: 0, maxDensity: null };
      }
      st[hs.sector].hotspots += 1;
      if (st[hs.sector].maxDensity == null
        || hs.density > st[hs.sector].maxDensity) {
        st[hs.sector].maxDensity = hs.density;
      }
    }
    return st;
  }

  /** عدد صفوف العينة التابعة لقطاع */
  function sampleCountOf(release, sectorId) {
    return sampleRows(release).filter((r) => r.sector === sectorId).length;
  }

  /**
   * نموذج اللوحة التمهيدية: أرقام المدينة الموزونة + صف لكل قطاع.
   * كل قيمة من الإصدار أو ملف الحدود — والوسوم تسافر معها.
   */
  function overviewModel(release, derived, geo) {
    const stats = sectorGeoStats(geo);
    const rows = release && Array.isArray(release.sectors) ? release.sectors : [];
    const sectors = rows.map((s) => {
      const sd = sectorDerivedOf(derived, s.id);
      const gs = stats[s.id] || { districts: 0, hotspots: 0, maxDensity: null };
      return {
        id: s.id,
        name: String(s.name),
        short: String(s.short || s.name),
        districts: gs.districts,
        hotspots: gs.hotspots,
        maxDensity: gs.maxDensity,
        sampleCount: sampleCountOf(release, s.id),
        demand: s.demand,
        beds: s.beds,
        building: s.building,
        operational: s.operational,
        visits: s.visits,
        violations: s.violations,
        monitors: s.monitors,
        closures: s.closures,
        coveragePct: sd ? sd.coverage_pct : null,
        deficitBeds: sd ? sd.deficit_beds : null,
        demandSharePct: sd ? sd.demand_share_pct : null,
        violationsSharePct: sd ? sd.violations_share_pct : null,
      };
    });

    const metrics = release && release.metrics ? release.metrics : {};
    const der = derived || {};
    const totalDistricts = countDistricts(geo);
    const totals = sampleTotals(release);

    return {
      totalDistricts,
      sectorCount: sectors.length,
      sampleCount: totals.count,
      hotspotCount: geo && geo.hotspots ? geo.hotspots.length : 0,
      sectors,
      sampleTotals: totals,
      cityDemand: metrics.total_demand ? metrics.total_demand.value : null,
      cityBeds: metrics.licensed_beds ? metrics.licensed_beds.value : null,
      cityCoveragePct: isNum(der.coverage_pct) ? der.coverage_pct : null,
      cityDeficitBeds: isNum(der.deficit_beds) ? der.deficit_beds : null,
      sampleLabel: sampleLabelOf(release),
      rankingNote: rankingNoteOf(release),
      mapDisclaimer: release && release.meta && release.meta.map_disclaimer
        ? String(release.meta.map_disclaimer) : "",
      attribution: ATTRIB_TEXT,
      dataAsOf: release && release.meta ? String(release.meta.data_as_of || "") : "",
      monitoringPeriod: release && release.meta
        ? String(release.meta.monitoring_period_label || "") : "",
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ط) نموذج الإسناد — أصل كل قيمة تظهر في لوحة الحي
     ──────────────────────────────────────────────────────────────────────
     ليس تزييناً: كل سطر يسمي الملف والحقل الذي جاءت منه القيمة، والوسم
     الملازم إن وُجد. الحي خارج العينة يظهر سطره بالحالة الصادقة نفسها.
     ══════════════════════════════════════════════════════════════════════ */
  function provenanceModel(entry, release, geo) {
    const rows = [];
    const src = geo && geo.source ? geo.source : {};

    rows.push({
      id: "name",
      what: "اسم الحي وحدوده الجغرافية",
      origin: "data/riyadh-geo.json → sectors[]",
      detail: String(src.boundaries || ATTRIB_TEXT),
      note: ATTRIB_TEXT,
    });
    rows.push({
      id: "sector",
      what: "انتماء الحي إلى القطاع",
      origin: "data/riyadh-geo.json → التجميع القطاعي",
      detail: String(src.sector_grouping || "تجميع طبقة الخريطة الأصلية"),
      note: "",
    });
    rows.push({
      id: "sector_figures",
      what: "أرقام القطاع المعروضة في اللوحة",
      origin: "release.sectors[] + derived.sector[]",
      detail: "قيم خام منشورة ومشتقات بصيغها المعتمدة — قطاعية لا حيّية",
      note: "كل رقم في لسان «الحي والقطاع» قطاعي بالتسمية الصريحة",
    });
    if (entry && entry.sample) {
      rows.push({
        id: "sample",
        what: "قيم الحي (أسرّة/رخص/مخالفات)",
        origin: "release.neighbourhoods.rows[]",
        detail: "صف الحي في عينة قاعدة البيانات",
        note: sampleLabelOf(release),
      });
    } else {
      rows.push({
        id: "sample_missing",
        what: "قيم الحي (أسرّة/رخص/مخالفات)",
        origin: "غير متوفرة",
        detail: HONEST_NO_DATA,
        note: sampleLabelOf(release),
      });
    }
    rows.push({
      id: "hotspots",
      what: "نقاط التركّز الرقابي ضمن " + formatValue(HOTSPOT_RADIUS_KM, "km"),
      origin: "data/riyadh-geo.json → hotspots[]",
      detail: String(src.hotspots || "طبقة بيانات المنصة الأصلية"),
      note: ATTRIB_TEXT,
    });
    rows.push({
      id: "distance",
      what: "المسافات المعروضة",
      origin: "حساب haversine على المراكز (geoutils.distanceKm)",
      detail: "بدقة منزلة عشرية واحدة — حساب هندسي لا تقدير",
      note: "",
    });
    rows.push({
      id: "map",
      what: "خريطة الأطلس المصغرة",
      origin: "إسقاط geoutils.projector على حدود riyadh-geo.json",
      detail: "الإسقاط ذاته المستخدم في الخريطة المعتمدة — تطابق هندسي",
      note: release && release.meta && release.meta.map_disclaimer
        ? String(release.meta.map_disclaimer) : "",
    });
    const qr = release && release.quarantine_resolved
      ? release.quarantine_resolved : null;
    if (qr && qr.hotspots && qr.hotspots.resolution) {
      rows.push({
        id: "hotspots_decision",
        what: "قرار المطابقة الخاص بنقاط التركّز",
        origin: "release.quarantine_resolved.hotspots",
        detail: String(qr.hotspots.resolution),
        note: "",
      });
    }
    return rows;
  }

  /* ══════════════════════════════════════════════════════════════════════
     1-ي) ملخص ناطق للنتائج — جملة واحدة تصف حالة القائمة بلا رقم مختلق
     ══════════════════════════════════════════════════════════════════════ */
  function searchSummary(opts) {
    const o = opts || {};
    const total = isNum(o.total) ? o.total : 0;
    const parts = [];
    parts.push(resultsLabel(total));
    if (o.query) parts.push("للبحث عن «" + String(o.query).trim() + "»");
    if (o.sectorName) parts.push("في " + String(o.sectorName));
    if (o.sampleOnly) parts.push("ضمن العينة الموثقة فقط");
    if (o.sortLabel) parts.push("مرتبة " + String(o.sortLabel));
    return parts.join(" — ");
  }

  return {
    /* ثوابت العقد */
    HONEST_NO_DATA, HOTSPOT_RADIUS_KM, PAGE_SIZE, NEIGHBOUR_LIMIT,
    ATTRIB_TEXT, SORT_IDS, SORT_LABELS, SAMPLE_SORTS, TAB_IDS, VALUE_KINDS,
    NOUNS,
    /* التنسيق */
    formatValue, resultsLabel, districtsLabel, pointsLabel, rangeLabel,
    /* الفهرس والبحث */
    index, normalizeQuery, findByKey, keyOf,
    filterEntries, sortEntries, paginate, pageOfKey,
    /* الحالات */
    sampleStatus, coverageStatus, watchStatus,
    /* القطاع والعينة */
    sectorRowOf, sectorDerivedOf, sectorFigures,
    sampleLabelOf, rankingNoteOf, sampleRows, sampleBlock, sampleTotals,
    sampleRank, sampleRanks,
    /* الجغرافيا */
    hotspotsFor, hotspotSummary, hotspotStats, neighboursOf,
    countDistricts, sectorGeoStats, sampleCountOf,
    /* النماذج */
    panelModel, overviewModel, provenanceModel, searchSummary,
  };
})();

/* ══════════════════════════════════════════════════════════════════════════
   القسم 2) طبقة العرض — ملحق `atlas` بصفحة واحدة بعمودين
   كل ما تحت هذا السطر يبني DOM؛ لا منطق بيانات جديد هنا: القراءات كلها من
   النموذج النقي أعلاه ومن `RH.viz.geoutils`، والتنسيق من `RH.core.fmt`.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;
  const G = RH.viz.geoutils;
  const M = RH.explore.districts;

  /** عناوين الأقسام لزر العودة السياقي (نص واجهة مقفل — لا بيانات) */
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

  /** ألسنة لوحة الحي بترتيبها القانوني (المُنشئات تُسند أدناه بعد تعريفها) */
  const TAB_DEFS = [
    { id: "profile", label: "الحي والقطاع", hint: "أرقام القطاع وقراءة التغطية" },
    { id: "sample", label: "قيم العينة", hint: "قيم الحي الموثقة ورتبها" },
    { id: "watch", label: "التركّز الرقابي", hint: "نقاط التركّز ضمن النطاق" },
    { id: "near", label: "الجوار", hint: "أقرب الأحياء بالمسافة" },
    { id: "prov", label: "الإسناد والصدق", hint: "أصل كل قيمة معروضة" },
  ];

  /** أوضاع خريطة الأطلس المصغرة */
  const MAP_MODES = [
    { id: "city", label: "المدينة", hint: "كل أحياء الرياض الـ189" },
    { id: "sector", label: "القطاع", hint: "أحياء قطاع الحي المختار وحدها" },
  ];

  /** حدّ فحص «أقرب نقطة تركّز مطلقاً» حين لا نقطة ضمن النطاق (كم) */
  const FAR_SCAN_KM = 500;

  /**
   * حالة التفاعل المعلّقة بين عمليتي بناء: كتابة معاملات المسار تعيد بناء
   * الملحق كاملاً بعقد المحرك، فنسجل هنا العنصر الذي كان يعمل عليه المستخدم
   * (`pendingFocus`) والحي النشط في القائمة (`pendingActiveKey`) ونستعيدهما
   * فور اكتمال البناء التالي — فلا تضيع ملاحة لوحة المفاتيح تحت يد المستخدم.
   * الملف يُحمَّل مرة واحدة فالمتغيران حالة وحدة لا حالة عالمية متسربة.
   */
  let pendingFocus = null;
  let pendingActiveKey = null;

  /* ══════════════════════════════════════════════════════════════════════
     2-أ) لبنات عرض صغيرة مشتركة داخل الملحق
     ══════════════════════════════════════════════════════════════════════ */

  /** رقاقة نصية محايدة بنغمة دلالية اختيارية */
  function chip(text, tone, title) {
    return h("span", {
      class: "atl-chip" + (tone ? " t-" + tone : ""),
      title: title || null,
    }, String(text));
  }

  /** سطر ملاحظة صغير بنقطة — للوسوم الملازمة وأسطر الإسناد */
  function note(text, cls) {
    return h("p", { class: "atl-note" + (cls ? " " + cls : "") },
      h("span", { class: "atl-note-dot", "aria-hidden": "true" }),
      h("span", {}, String(text)));
  }

  /** ترويسة قسم داخلي صغيرة داخل لسان */
  function subHead(text, sub) {
    return h("div", { class: "atl-subhead" },
      h("span", { class: "atl-subhead-t" }, String(text)),
      sub ? h("span", { class: "atl-subhead-s" }, String(sub)) : null);
  }

  /**
   * شبكة أرقام: كل عنصر {label, value, kind, unit, tone, origin} من النموذج
   * النقي — التنسيق عبر M.formatValue حصراً، والقيمة الغائبة تظهر «—» صادقة.
   */
  function figureGrid(el, figures, opts) {
    const o = opts || {};
    const grid = h("div", {
      class: "atl-figs" + (o.cls ? " " + o.cls : ""),
      role: "list",
    });
    for (const f of figures || []) {
      grid.appendChild(h("div", {
        class: "atl-fig" + (f.tone ? " t-" + f.tone : ""),
        role: "listitem",
        title: f.origin ? "المصدر: " + f.origin : null,
      },
        h("span", { class: "atl-fig-k" }, String(f.label)),
        h("b", { class: "atl-fig-v" }, M.formatValue(f.value, f.kind)),
        o.showOrigin && f.origin
          ? h("span", { class: "atl-fig-o" }, String(f.origin)) : null,
      ));
    }
    el.appendChild(grid);
    return grid;
  }

  /** بطاقة الحالة الصادقة الموحدة — بنمط pendingCard المعتمد في اللوحات */
  function honestCard(el, label, noteText) {
    const box = h("div", { class: "atl-honest" });
    RH.presenter.layout.pendingCard(box, { label, note: noteText || "" });
    el.appendChild(box);
    return box;
  }

  /** جدول كثيف بأصناف dashboard.css المشتركة كما هي (لا إعادة تعريف) */
  function denseTable(cols, rows, opts) {
    const o = opts || {};
    const thead = h("thead", {}, h("tr", {}, cols.map((c) => h("th", {
      scope: "col", style: c.align ? { textAlign: c.align } : null,
    }, c.label))));
    const tbody = h("tbody", {});
    for (const r of rows || []) {
      tbody.appendChild(h("tr", { class: r.cls || null },
        cols.map((c, i) => h(i === 0 ? "th" : "td",
          Object.assign(i === 0 ? { scope: "row" } : {},
            c.align ? { style: { textAlign: c.align } } : {}),
          c.render ? c.render(r) : r[c.key]))));
    }
    return h("div", {
      class: "atl-table-wrap" + (o.cls ? " " + o.cls : ""),
    }, h("table", { class: "table-dense atl-table" }, thead, tbody));
  }

  /** زر إجراء داخل الأطلس — عنصر حقيقي موسوم فلا يبتلعه جهاز التقديم */
  function actionBtn(label, onAct, opts) {
    const o = opts || {};
    return h("button", {
      class: "atl-btn" + (o.cls ? " " + o.cls : ""),
      type: "button",
      "data-interactive": "",
      "data-focus": o.focusRef || null,
      "aria-label": o.aria || label,
      title: o.title || null,
      disabled: o.disabled ? true : null,
      onclick: onAct,
    },
      h("span", {}, String(label)),
      o.arrow ? h("span", { class: "atl-btn-arrow", "aria-hidden": "true" }, "←") : null,
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ب) خريطة الأطلس المصغرة
     ──────────────────────────────────────────────────────────────────────
     SVG خاص بالملحق: يرسم كل الأحياء بحياد عبر `geoutils.projector(...)
     .ringPath` ذاتها المستخدمة في الخريطة المعتمدة (تطابق هندسي، **لا**
     تعديل على viz/geomap.js)، ويبرز الحي المختار وقطاعه، ويعلّم نقاط
     التركّز ضمن النطاق ودائرته، مع مقياس مسافة مشتق من الإسقاط نفسه.
     الإسناد وإخلاء المسؤولية سطران ملازمان لا يُفصلان عن الرسم.
     ══════════════════════════════════════════════════════════════════════ */

  /** حدود مجموعة أحياء من حلقاتها — للتكبير على قطاع (fallback: حدود الملف) */
  function boundsOfEntries(entries, fallback) {
    let latMin = Infinity, lngMin = Infinity;
    let latMax = -Infinity, lngMax = -Infinity;
    let seen = false;
    for (const e of entries || []) {
      for (const ring of e.rings || []) {
        for (const pt of ring) {
          if (!pt || pt.length < 2) continue;
          seen = true;
          if (pt[0] < latMin) latMin = pt[0];
          if (pt[0] > latMax) latMax = pt[0];
          if (pt[1] < lngMin) lngMin = pt[1];
          if (pt[1] > lngMax) lngMax = pt[1];
        }
      }
    }
    if (!seen || latMax - latMin <= 0 || lngMax - lngMin <= 0) return fallback;
    /* هامش 6٪ كي لا تلامس الحدود إطار الرسم */
    const padLat = (latMax - latMin) * 0.06;
    const padLng = (lngMax - lngMin) * 0.06;
    return [
      [latMin - padLat, lngMin - padLng],
      [latMax + padLat, lngMax + padLng],
    ];
  }

  /** وحدات الإسقاط لكل كيلومتر — مشتقة من المُسقط نفسه لا من ثابت مكتوب */
  function unitsPerKm(pj, lat) {
    const a = [lat, 0];
    const b = [lat + 0.1, 0];
    const km = G.distanceKm(a, b);
    if (!km) return 0;
    return Math.abs(pj.py(b[0]) - pj.py(a[0])) / km;
  }

  /** مقياس مسافة مقروء: يختار خطوة تقريبية تناسب عرض الإطار */
  function scaleStepKm(pj, lat) {
    const perKm = unitsPerKm(pj, lat);
    if (!perKm) return null;
    const target = pj.w * 0.22;                   // نحو خُمس عرض الإطار
    const raw = target / perKm;
    const steps = [1, 2, 5, 10, 20, 50];
    let best = steps[0];
    for (const s of steps) { if (s <= raw) best = s; }
    return { km: best, units: best * perKm };
  }

  /**
   * بناء الخريطة المصغرة داخل مضيف.
   * o: { list, entry, geo, mode, onPick, release }
   */
  function buildMiniMap(hostEl, o) {
    const geo = o.geo;
    const entry = o.entry || null;
    const list = o.list || [];
    const wrap = h("div", { class: "atl-map" });

    if (!geo || !geo.bounds || !list.length) {
      wrap.appendChild(h("div", { class: "atl-map-missing" },
        "ملف حدود الأحياء غير مضمّن في هذا البناء — لا خريطة تُعرض."));
      hostEl.appendChild(wrap);
      return wrap;
    }

    const sectorList = entry
      ? list.filter((e) => e.sector === entry.sector) : [];
    const zoomed = o.mode === "sector" && sectorList.length > 0;
    const bounds = zoomed
      ? boundsOfEntries(sectorList, geo.bounds) : geo.bounds;
    const pj = G.projector(bounds, 1000);

    const label = entry
      ? "خريطة الأطلس المصغرة — الحي المختار «" + String(entry.name)
        + "» مميّز داخل " + String(entry.sectorName)
        + (zoomed ? "، بعرض القطاع وحده" : "، على كامل حدود المدينة")
      : "خريطة الأطلس المصغرة — كل أحياء الرياض بحياد، لا حي مختاراً بعد";

    const root = svg("svg", {
      class: "atl-map-svg",
      viewBox: "0 0 " + pj.w + " " + pj.h,
      preserveAspectRatio: "xMidYMid meet",
      role: "img",
      "aria-label": label,
      focusable: "false",
    });

    /* الأحياء: طبقة محايدة، ثم أحياء القطاع، ثم الحي المختار فوق الجميع */
    const drawn = zoomed ? sectorList : list;
    let selPath = null;
    for (const e of drawn) {
      if (!e.rings || !e.rings.length) continue;
      const isSel = !!(entry && e.key === entry.key);
      const inSec = !!(entry && e.sector === entry.sector);
      const p = svg("path", {
        class: "atl-map-d" + (inSec ? " in-sec" : "") + (isSel ? " is-sel" : "")
          + (e.sample ? " has-sample" : ""),
        d: pj.ringPath(e.rings),
        "data-key": e.key,
      }, svg("title", {}, String(e.name)
        + (e.sample ? " — ضمن العينة" : "")));
      if (isSel) { selPath = p; continue; }
      root.appendChild(p);
    }
    if (selPath) root.appendChild(selPath);

    /* نطاق التركّز الرقابي حول الحي + النقاط داخله */
    if (entry && entry.centroid) {
      const perKm = unitsPerKm(pj, entry.centroid[0]);
      const cx = pj.px(entry.centroid[1]);
      const cy = pj.py(entry.centroid[0]);
      if (perKm > 0) {
        root.appendChild(svg("circle", {
          class: "atl-map-ring",
          cx: cx.toFixed(2), cy: cy.toFixed(2),
          r: (M.HOTSPOT_RADIUS_KM * perKm).toFixed(2),
        }));
      }
      const near = M.hotspotsFor(entry, geo);
      const maxD = near.reduce((a, x) => Math.max(a, x.density || 0), 0);
      for (const hs of near) {
        const rr = perKm > 0
          ? Math.max(pj.w * 0.004, pj.w * 0.011 * (maxD ? hs.density / maxD : 0.6))
          : pj.w * 0.006;
        root.appendChild(svg("circle", {
          class: "atl-map-hs",
          cx: pj.px(hs.lng).toFixed(2),
          cy: pj.py(hs.lat).toFixed(2),
          r: rr.toFixed(2),
        }, svg("title", {}, "نقطة تركّز — كثافة "
          + M.formatValue(hs.density, "density")
          + " على بعد " + M.formatValue(hs.km, "km"))));
      }
      root.appendChild(svg("circle", {
        class: "atl-map-pin", cx: cx.toFixed(2), cy: cy.toFixed(2),
        r: (pj.w * 0.006).toFixed(2),
      }));
    }

    /* مقياس المسافة — مشتق من الإسقاط ذاته (لا رقم مكتوب) */
    const midLat = (bounds[0][0] + bounds[1][0]) / 2;
    const sc = scaleStepKm(pj, midLat);
    if (sc && sc.units > 0) {
      const y = pj.h - pj.h * 0.045;
      const x2 = pj.w - pj.w * 0.04;
      const x1 = x2 - sc.units;
      root.appendChild(svg("line", {
        class: "atl-map-scale-line",
        x1: x1.toFixed(2), x2: x2.toFixed(2), y1: y.toFixed(2), y2: y.toFixed(2),
      }));
      root.appendChild(svg("text", {
        class: "atl-map-scale-text",
        x: ((x1 + x2) / 2).toFixed(2),
        y: (y - pj.h * 0.012).toFixed(2),
        "text-anchor": "middle",
      }, M.formatValue(sc.km, "km")));
    }

    /* النقر على حي في الرسم يختاره — تعزيز للفأرة، ومسار لوحة المفاتيح
       المكافئ هو القائمة المجاورة (معلن نصاً أسفل الخريطة). */
    if (typeof o.onPick === "function") {
      root.addEventListener("click", (ev) => {
        const t = ev.target;
        const key = t && t.getAttribute ? t.getAttribute("data-key") : null;
        if (key) o.onPick(key);
      });
    }

    const frame = h("div", { class: "atl-map-frame", "data-interactive": "" }, root);
    wrap.appendChild(frame);
    hostEl.appendChild(wrap);
    return wrap;
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ج) ألسنة لوحة الحي
     ──────────────────────────────────────────────────────────────────────
     كل لسان دالة (el, S, model, entry): `S` نطاق الصفحة (الإصدار والمشتقات
     وملف الحدود والفهرس ودوال الاختيار)، و`model` مخرج `M.panelModel`.
     ══════════════════════════════════════════════════════════════════════ */

  /* ── 2-ج-1) «الحي والقطاع» ─────────────────────────────────────────────
     قراءة التغطية القطاعية مقابل متوسط المدينة (خط مقارنة ذهبي — استخدامه
     القانوني الوحيد هنا)، ثم أرقام القطاع الثلاثة عشر بمصادرها، ثم إعلان
     حالة بيانات الحي: بطاقة العينة أو الحالة الصادقة المنصوصة. */
  function tabProfile(el, S, model, entry) {
    const der = S.der;
    const sd = M.sectorDerivedOf(der, entry.sector);
    const cityCov = der && typeof der.coverage_pct === "number"
      ? der.coverage_pct : null;
    const cs = M.coverageStatus(sd ? sd.coverage_pct : null, cityCov);
    const status = M.sampleStatus(entry);

    el.appendChild(subHead("قراءة التغطية القطاعية",
      "كل رقم في هذا اللسان قطاعي — لا يُنسب إلى الحي وحده"));

    const covBox = h("div", { class: "atl-cov" });
    if (sd && typeof sd.coverage_pct === "number") {
      RH.viz.micro.ratioBar(covBox, {
        su: S.su,
        pct: sd.coverage_pct,
        tone: "pos",
        ariaLabel: "نسبة تغطية الطلب في " + String(model.sectorName)
          + " " + fmt.pct(sd.coverage_pct)
          + (cityCov != null ? "، ومتوسط المدينة " + fmt.pct(cityCov) : ""),
        target: cityCov != null
          ? { pct: cityCov, label: "خط المقارنة: متوسط المدينة " + fmt.pct(cityCov) }
          : null,
        note: "نسبة قطاعية من release.sectors ÷ الطلب القطاعي — "
          + "لا توجد نسبة تغطية منشورة على مستوى الحي",
      });
    } else {
      covBox.appendChild(h("div", { class: "atl-empty" },
        "لا نسبة تغطية منشورة لهذا القطاع في الإصدار."));
    }
    el.appendChild(covBox);

    /* رقاقات القراءة: الفارق عن متوسط المدينة + عجز القطاع + حالة العينة */
    const chips = h("div", { class: "atl-chiprow" });
    if (cs.deltaPts != null) {
      RH.viz.micro.deltaChip(chips, {
        value: cs.deltaPts,
        fmt: (v) => fmt.dec1(v),
        positiveIsGood: true,
        label: "نقطة مئوية عن متوسط المدينة",
        title: cs.label,
      });
    }
    if (sd && typeof sd.deficit_beds === "number") {
      chips.appendChild(chip("عجز القطاع " + fmt.unitAfter(sd.deficit_beds, "سرير"),
        "neg", "derived.sector[].deficit_beds"));
    }
    chips.appendChild(chip(status.label, status.tone,
      status.inSample ? M.sampleLabelOf(S.rel) : M.HONEST_NO_DATA));
    el.appendChild(chips);

    el.appendChild(subHead("أرقام القطاع المنشورة", String(model.sectorName)));
    figureGrid(el, model.sectorFigures, { showOrigin: false });

    el.appendChild(subHead("بيانات هذا الحي", status.label));
    if (model.sample) {
      const card = h("div", { class: "atl-sample-lead" },
        h("p", { class: "atl-sample-lead-t" },
          "لهذا الحي صف موثق في عينة قاعدة البيانات — "
          + M.formatValue(model.sample.rows[0].value, "beds")
          + " و" + M.formatValue(model.sample.rows[1].value, "licence")
          + " و" + M.formatValue(model.sample.rows[3].value, "violation") + "."),
        note(model.sample.sampleLabel),
      );
      card.appendChild(actionBtn("عرض قيم العينة كاملة",
        () => S.setTab("sample"),
        { aria: "الانتقال إلى لسان قيم العينة", arrow: true, cls: "ghost" }));
      el.appendChild(card);
    } else {
      honestCard(el, "لا بيانات على مستوى هذا الحي", M.HONEST_NO_DATA);
      el.appendChild(note(M.sampleLabelOf(S.rel)));
    }
  }

  /* ── 2-ج-2) «قيم العينة» ───────────────────────────────────────────────
     المصدر الوحيد لقيم مستوى الحي. الحي خارج العينة يحصل على الحالة الصادقة
     وقائمة أحياء العينة في قطاعه (اختيارها فوري) بدل شاشة فارغة. */
  function tabSample(el, S, model, entry) {
    const rel = S.rel;
    const label = M.sampleLabelOf(rel);
    const rankingNote = M.rankingNoteOf(rel);

    if (!model.sample) {
      honestCard(el, "الحي خارج عينة الأحياء المدرجة", M.HONEST_NO_DATA);
      el.appendChild(note(label));

      const peers = S.list.filter((e) => e.sector === entry.sector && e.sample);
      el.appendChild(subHead("أحياء العينة في " + String(model.sectorName),
        M.districtsLabel(peers.length)));
      if (!peers.length) {
        el.appendChild(h("div", { class: "atl-empty" },
          "لا حي من هذا القطاع ضمن العينة المدرجة."));
      } else {
        const wrap = h("div", { class: "atl-peers" });
        for (const p of peers) {
          wrap.appendChild(actionBtn(String(p.name), () => S.select(p.key, "tabpanel"), {
            aria: "اختيار حي «" + String(p.name) + "» من عينة "
              + String(model.sectorName),
            title: fmt.unitAfter(p.sample.beds, "سرير") + " · "
              + fmt.noun(p.sample.violations, "violation"),
            cls: "peer",
          }));
        }
        el.appendChild(wrap);
      }

      el.appendChild(subHead("لماذا لا قيمة للحي؟", "قاعدة الصدق"));
      el.appendChild(h("p", { class: "atl-para" },
        "الإصدار ينشر قيم أسرّة ورخص ومخالفات لعشرين حياً فقط — هي العينة "
        + "المدرجة في قاعدة البيانات. اشتقاق قيمة لهذا الحي من متوسط القطاع "
        + "أو من جيرانه سيكون رقماً مختلقاً، فتبقى الخانة فارغة بصدق حتى "
        + "يورّد المصدر صفه."));
      return;
    }

    const sample = model.sample;
    el.appendChild(subHead("قيم الحي الموثقة", sample.name));
    figureGrid(el, sample.rows, { cls: "atl-figs-sample" });
    el.appendChild(note(sample.sampleLabel));

    /* موضع الحي داخل العينة: رتب المقاييس الأربعة بملاحظة الترتيب المنشورة */
    const ranks = M.sampleRanks(rel, entry.sample);
    if (ranks.length) {
      el.appendChild(subHead("موضع الحي داخل العينة",
        "الترتيب ضمن العينة العشرين فقط"));
      el.appendChild(denseTable([
        { label: "المقياس", key: "label" },
        { label: "القيمة", align: "center",
          render: (r) => M.formatValue(r.value, r.kind) },
        { label: "الرتبة", align: "center",
          render: (r) => fmt.iso(fmt.int(r.rank) + " من " + fmt.int(r.of)) },
      ], ranks));
      if (rankingNote) el.appendChild(note(rankingNote));
    }

    /* المقارنة داخل قطاع العينة — أشرطة مصغرة بالقيمة نفسها لا بمعدل مشتق */
    const peers = S.list
      .filter((e) => e.sector === entry.sector && e.sample)
      .sort((a, b) => b.sample.beds - a.sample.beds);
    if (peers.length > 1) {
      el.appendChild(subHead("الطاقة الاستيعابية داخل عينة "
        + String(model.sectorName), M.districtsLabel(peers.length)));
      const barsBox = h("div", { class: "atl-bars" });
      RH.viz.micro.microBars(barsBox, {
        su: S.su,
        items: peers.map((p) => ({
          label: String(p.name),
          value: p.sample.beds,
          tone: p.key === entry.key ? "pos" : "neu",
        })),
        tone: "neu",
        fmt: (v) => fmt.int(v),
        ariaLabel: "الطاقة الاستيعابية لأحياء العينة في "
          + String(model.sectorName) + " — الحي المختار «"
          + String(entry.name) + "» مميّز",
      });
      el.appendChild(barsBox);
      el.appendChild(note(sample.sampleLabel));
    }

    /* حصة الحي من مجاميع العينة — حساب معلن على العينة لا على المدينة */
    const totals = M.sampleTotals(rel);
    const shareRows = [
      { id: "beds", label: "الطاقة الاستيعابية", kind: "beds",
        value: entry.sample.beds, total: totals.beds },
      { id: "building", label: "رخص البناء", kind: "licence",
        value: entry.sample.building, total: totals.building },
      { id: "operational", label: "الرخص التشغيلية", kind: "licence",
        value: entry.sample.operational, total: totals.operational },
      { id: "violations", label: "المخالفات المسجلة", kind: "violation",
        value: entry.sample.violations, total: totals.violations },
    ];
    el.appendChild(subHead("حصة الحي من مجموع العينة",
      "نِسَب على العينة العشرين — لا على المدينة"));
    el.appendChild(denseTable([
      { label: "المقياس", key: "label" },
      { label: "قيمة الحي", align: "center",
        render: (r) => M.formatValue(r.value, r.kind) },
      { label: "مجموع العينة", align: "center",
        render: (r) => M.formatValue(r.total, r.kind) },
      { label: "الحصة", align: "center",
        render: (r) => (r.total > 0
          ? fmt.pct(RH.data.derive.pct(r.value, r.total)) : "—") },
    ], shareRows));
    el.appendChild(note("الحصة قسمة معلنة: قيمة الحي ÷ مجموع صفوف العينة "
      + "العشرين × 100 — ليست حصة من إجمالي المدينة."));
  }

  /* ── 2-ج-3) «التركّز الرقابي» ──────────────────────────────────────────
     نقاط التركّز ضمن 3 كم من مركز الحي بمسافاتها وكثافاتها، وحالة صادقة
     عند خلو النطاق مع الإفصاح عن أقرب نقطة مسجلة مهما بعدت. */
  function tabWatch(el, S, model, entry) {
    const list = model.hotspots;
    const sum = M.hotspotSummary(list);
    const ws = M.watchStatus(list);
    const sectorRow = M.sectorRowOf(S.rel, entry.sector);
    const sd = M.sectorDerivedOf(S.der, entry.sector);

    el.appendChild(subHead("نقاط التركّز ضمن "
      + M.formatValue(M.HOTSPOT_RADIUS_KM, "km"), ws.label));

    const figs = [
      { label: "نقاط ضمن النطاق", value: sum.count, kind: "point",
        tone: sum.count ? "neg" : "neu" },
      { label: "أقرب نقطة", value: sum.nearestKm, kind: "km",
        tone: sum.count ? "neg" : "neu" },
      { label: "أعلى كثافة مسجلة", value: sum.maxDensity, kind: "density",
        tone: sum.count ? "neg" : "neu" },
      { label: "مجموع الكثافات", value: sum.count ? sum.sumDensity : null,
        kind: "density", tone: "neu" },
    ];
    figureGrid(el, figs, { cls: "atl-figs-watch" });

    if (!list.length) {
      honestCard(el, "لا نقاط تركّز مسجلة ضمن النطاق",
        "نصف القطر " + M.formatValue(M.HOTSPOT_RADIUS_KM, "km")
        + " اختيار عرضي معلن، وخلو النطاق لا يعني خلو الحي من المخالفات — "
        + "سجل المنصة ينشر نقاط التركّز لا مواقع المخالفات كلها.");
      const far = M.hotspotsFor(entry, S.geo, FAR_SCAN_KM);
      if (far.length) {
        el.appendChild(note("أقرب نقطة تركّز مسجلة على الإطلاق تبعد "
          + M.formatValue(far[0].km, "km") + " بكثافة "
          + M.formatValue(far[0].density, "density") + "."));
      }
    } else {
      const barsBox = h("div", { class: "atl-bars" });
      RH.viz.micro.microBars(barsBox, {
        su: S.su,
        items: list.map((hs) => ({
          label: "على بعد " + M.formatValue(hs.km, "km"),
          value: hs.density,
          tone: "neg",
        })),
        tone: "neg",
        fmt: (v) => fmt.int(v),
        ariaLabel: "كثافة نقاط التركّز حول حي " + String(entry.name)
          + " مرتبة بالأقرب فالأبعد",
      });
      el.appendChild(barsBox);

      el.appendChild(denseTable([
        { label: "المسافة من مركز الحي", align: "start",
          render: (r) => M.formatValue(r.km, "km") },
        { label: "الكثافة المسجلة", align: "center",
          render: (r) => M.formatValue(r.density, "density") },
        { label: "قطاع النقطة", align: "center",
          render: (r) => {
            const s = M.sectorRowOf(S.rel, r.sector);
            return s ? String(s.name) : String(r.sector);
          } },
      ], list));
    }

    el.appendChild(note(M.ATTRIB_TEXT));

    /* السياق الرقابي القطاعي — موسوم قطاعياً بلا لبس */
    if (sectorRow) {
      el.appendChild(subHead("السياق الرقابي القطاعي", String(model.sectorName)));
      figureGrid(el, [
        { label: "الزيارات الميدانية", value: sectorRow.visits, kind: "visit",
          tone: "neu" },
        { label: "المخالفات المسجلة", value: sectorRow.violations,
          kind: "violation", tone: "neg" },
        { label: "المراقبون الميدانيون", value: sectorRow.monitors,
          kind: "monitor", tone: "neu" },
        { label: "قرارات الإغلاق", value: sectorRow.closures, kind: "decision",
          tone: "neu" },
        { label: "حصة القطاع من مخالفات المدينة",
          value: sd ? sd.violations_share_pct : null, kind: "pct", tone: "neg" },
        { label: "حصة القطاع من زيارات المدينة",
          value: sd ? sd.visits_share_pct : null, kind: "pct", tone: "neu" },
      ]);
      el.appendChild(note("أرقام قطاعية من الإصدار — لا تُنسب إلى الحي."));
    }
  }

  /* ── 2-ج-4) «الجوار» ───────────────────────────────────────────────────
     أقرب الأحياء بمسافة haversine بين المراكز — حساب هندسي من ملف الحدود
     لا قيمة بيانات مشتقة. كل صف زر يختار الحي فوراً (تنقّل حقيقي). */
  function tabNear(el, S, model, entry) {
    const near = M.neighboursOf(S.list, entry, M.NEIGHBOUR_LIMIT);
    const sameSector = near.filter((n) => n.sameSector).length;
    const inSample = near.filter((n) => n.inSample).length;

    el.appendChild(subHead("أقرب الأحياء بالمسافة",
      M.districtsLabel(near.length)));

    if (!near.length) {
      el.appendChild(h("div", { class: "atl-empty" },
        "لا مراكز أحياء أخرى في ملف الحدود لمقارنتها."));
      return;
    }

    figureGrid(el, [
      { label: "أقرب حي", value: near[0].km, kind: "km", tone: "neu" },
      { label: "أبعد حي في القائمة", value: near[near.length - 1].km,
        kind: "km", tone: "neu" },
      { label: "منها في القطاع نفسه", value: sameSector, kind: "district",
        tone: "neu" },
      { label: "منها ضمن العينة", value: inSample, kind: "district",
        tone: inSample ? "pos" : "neu" },
    ], { cls: "atl-figs-near" });

    const rows = h("div", { class: "atl-near", role: "list" });
    for (const n of near) {
      const row = h("button", {
        class: "atl-near-row" + (n.sameSector ? " same" : ""),
        type: "button",
        role: "listitem",
        "data-interactive": "",
        "aria-label": "اختيار حي «" + String(n.entry.name) + "» — "
          + String(n.entry.sectorName) + "، على بعد "
          + M.formatValue(n.km, "km")
          + (n.inSample ? "، ضمن العينة الموثقة" : "، خارج العينة"),
        onclick: () => S.select(n.entry.key, "tabpanel"),
      },
        h("span", { class: "atl-near-name" }, String(n.entry.name)),
        h("span", { class: "atl-near-sec" }, String(n.entry.sectorName)),
        n.inSample ? h("span", { class: "atl-near-badge" }, "ضمن العينة") : null,
        h("b", { class: "atl-near-km" }, M.formatValue(n.km, "km")),
      );
      rows.appendChild(row);
    }
    el.appendChild(rows);

    el.appendChild(note("المسافات بين مراكز الأحياء بحساب haversine على "
      + "إحداثيات ملف الحدود — قرب جغرافي لا علاقة بيانات."));
    el.appendChild(note(M.ATTRIB_TEXT));
  }

  /* ── 2-ج-5) «الإسناد والصدق» ───────────────────────────────────────────
     أصل كل قيمة تظهر في اللوحة، ووسمها الملازم، وهوية الإصدار الذي جاءت
     منه — كي لا يبقى في اللوحة رقم بلا مصدر معلن. */
  function tabProv(el, S, model, entry) {
    const rel = S.rel;
    const rows = M.provenanceModel(entry, rel, S.geo);

    el.appendChild(subHead("أصل كل قيمة معروضة", String(model.name)));
    el.appendChild(denseTable([
      { label: "القيمة", key: "what" },
      { label: "مصدرها", render: (r) => String(r.origin) },
      { label: "التفصيل", render: (r) => String(r.detail) },
    ], rows, { cls: "atl-prov" }));

    const noted = rows.filter((r) => r.note);
    if (noted.length) {
      el.appendChild(subHead("الوسوم الملازمة", "تسافر مع الرقم أينما ظهر"));
      const seen = new Set();
      for (const r of noted) {
        if (seen.has(r.note)) continue;
        seen.add(r.note);
        el.appendChild(note(String(r.note)));
      }
    }

    if (!entry.sample) {
      honestCard(el, "لا بيانات على مستوى هذا الحي", M.HONEST_NO_DATA);
    }

    el.appendChild(subHead("هوية الإصدار", "الإصدار الذي تقرأ منه هذه اللوحة"));
    const relBlock = rel && rel.release ? rel.release : {};
    const meta = rel && rel.meta ? rel.meta : {};
    el.appendChild(denseTable([
      { label: "البند", key: "k" },
      { label: "القيمة", key: "v" },
    ], [
      { k: "معرّف الإصدار", v: fmt.iso(String(relBlock.id || "—")) },
      { k: "بيانات حتى", v: String(meta.data_as_of || "—") },
      { k: "فترة الرصد", v: String(meta.monitoring_period_label || "—") },
      { k: "تاريخ الحساب", v: fmt.date(meta.calculation_date) },
      { k: "بصمة الإصدار",
        v: fmt.iso(String(relBlock.sha256 || "—").slice(0, 12)) },
    ], { cls: "atl-prov-rel" }));
  }

  /* إسناد المُنشئات إلى تعريفات الألسنة بعد تعريفها (ترتيب معجمي آمن) */
  const TAB_BUILDERS = {
    profile: tabProfile,
    sample: tabSample,
    watch: tabWatch,
    near: tabNear,
    prov: tabProv,
  };

  /* ══════════════════════════════════════════════════════════════════════
     2-د) لوحة الحي: الترويسة + بطاقة الخريطة + شريط الألسنة
     ══════════════════════════════════════════════════════════════════════ */

  /** عدّاد مثيلات لتوليد معرّفات DOM فريدة (مضيفان قد يتعايشان لحظة الانتقال) */
  let instanceSeq = 0;

  /** وضع خريطة الأطلس المصغرة — حالة وحدة تصمد عبر إعادة البناء بلا ضجيج
      في العنوان (ليست حالة قرار، بل تفضيل عرض لحظي). */
  let mapMode = "city";

  /** ترويسة اللوحة: الاسم والقطاع والاسم اللاتيني ووسم العينة وزر الإلغاء */
  function buildPanelHead(el, S, model, entry) {
    const status = M.sampleStatus(entry);
    const head = h("div", { class: "atl-head" },
      h("div", { class: "atl-head-main" },
        h("h3", { class: "atl-name" }, String(model.name)),
        h("div", { class: "atl-head-sub" },
          chip(String(model.sectorName), "neu", "قطاع الحي في ملف الحدود"),
          model.name_en
            ? h("span", { class: "atl-name-en" }, fmt.iso(String(model.name_en)))
            : null,
          chip(status.label, status.tone,
            status.inSample ? M.sampleLabelOf(S.rel) : M.HONEST_NO_DATA),
        ),
      ),
      h("div", { class: "atl-head-side" },
        actionBtn("إلغاء الاختيار", () => S.select("", "search"), {
          aria: "إلغاء اختيار الحي والعودة إلى اللوحة التمهيدية",
          cls: "ghost",
        }),
      ),
    );
    el.appendChild(head);
    return head;
  }

  /** بطاقة الخريطة المصغرة: مبدّل الوضع + الرسم + سطرا الإسناد والإخلاء */
  function buildMapCard(el, S, model, entry) {
    const rel = S.rel;
    const card = h("div", { class: "atl-mapcard" });

    const modes = h("div", {
      class: "atl-mapmodes", role: "group",
      "aria-label": "وضع خريطة الأطلس المصغرة",
    });
    const modeBtns = [];
    function syncModes() {
      for (const b of modeBtns) {
        const on = b.getAttribute("data-mode") === mapMode;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.classList.toggle("active", on);
      }
    }
    for (const md of MAP_MODES) {
      const b = h("button", {
        class: "atl-mapmode",
        type: "button",
        "data-mode": md.id,
        "data-interactive": "",
        "aria-pressed": "false",
        title: md.hint,
        "aria-label": "وضع الخريطة: " + md.label + " — " + md.hint,
        onclick: () => {
          if (mapMode === md.id) return;
          mapMode = md.id;
          syncModes();
          RH.core.dom.clear(mapHost);
          buildMiniMap(mapHost, {
            list: S.list, entry, geo: S.geo, mode: mapMode,
            onPick: (k) => S.select(k, "tabpanel"),
          });
        },
      }, md.label);
      modeBtns.push(b);
      modes.appendChild(b);
    }

    card.appendChild(h("div", { class: "atl-mapcard-head" },
      h("span", { class: "atl-mapcard-title" }, "موقع الحي على حدود المدينة"),
      modes,
    ));

    const body = h("div", { class: "atl-mapcard-body" });
    const mapHost = h("div", { class: "atl-maphost" });
    const sideBox = h("div", { class: "atl-mapside" });
    body.appendChild(mapHost);
    body.appendChild(sideBox);
    card.appendChild(body);
    syncModes();
    buildMiniMap(mapHost, {
      list: S.list, entry, geo: S.geo, mode: mapMode,
      onPick: (k) => S.select(k, "tabpanel"),
    });

    /* ── نظرة سريعة بجانب الرسم: أربع قراءات ملخّصة كلها معلنة المستوى
       (حيّية من العينة، أو قطاعية بالتسمية الصريحة، أو جغرافية محسوبة) ── */
    buildGlance(sideBox, S, model, entry);

    const disclaimer = rel && rel.meta && rel.meta.map_disclaimer
      ? String(rel.meta.map_disclaimer) : "";
    if (disclaimer) card.appendChild(note(disclaimer + " — إسقاط متساوي البعد."));
    card.appendChild(note(M.ATTRIB_TEXT));
    card.appendChild(note("النقر على حي في الرسم يختاره؛ ومسار لوحة المفاتيح "
      + "المكافئ هو قائمة الأحياء المجاورة.", "faint"));

    el.appendChild(card);
    return card;
  }

  /** «نظرة سريعة»: صفوف مفتاح/قيمة مضغوطة بجانب الخريطة — كل صف يعلن مستواه */
  function buildGlance(el, S, model, entry) {
    const sd = M.sectorDerivedOf(S.der, entry.sector);
    const status = M.sampleStatus(entry);
    const watch = M.hotspotSummary(model.hotspots);
    const near = M.neighboursOf(S.list, entry, 1)[0] || null;

    const rows = [
      {
        k: "حالة بيانات الحي", v: status.label, tone: status.tone,
        lvl: status.inSample ? "حيّي — من العينة" : "لا بيانات حيّية",
      },
      {
        k: "الطاقة الاستيعابية",
        v: model.sample
          ? M.formatValue(model.sample.rows[0].value, "beds") : "—",
        tone: model.sample ? "pos" : "neu",
        lvl: model.sample ? "حيّي — من العينة" : M.HONEST_NO_DATA,
      },
      {
        k: "تغطية القطاع",
        v: sd ? M.formatValue(sd.coverage_pct, "pct") : "—",
        tone: "neu",
        lvl: "قطاعي — " + String(model.sectorName),
      },
      {
        k: "عجز القطاع",
        v: sd ? M.formatValue(sd.deficit_beds, "beds") : "—",
        tone: "neg",
        lvl: "قطاعي — " + String(model.sectorName),
      },
      {
        k: "تركّز رقابي ضمن " + M.formatValue(M.HOTSPOT_RADIUS_KM, "km"),
        v: M.formatValue(watch.count, "point"),
        tone: watch.count ? "neg" : "neu",
        lvl: watch.count
          ? "أقربها " + M.formatValue(watch.nearestKm, "km")
          : "لا نقطة مسجلة ضمن النطاق",
      },
      {
        k: "أقرب حي",
        v: near ? String(near.entry.name) : "—",
        tone: "neu",
        lvl: near ? M.formatValue(near.km, "km") + " بين المركزين" : "—",
      },
    ];

    const box = h("div", { class: "atl-glance", role: "list" });
    for (const r of rows) {
      box.appendChild(h("div", {
        class: "atl-glance-row" + (r.tone ? " t-" + r.tone : ""),
        role: "listitem",
        title: r.lvl,
      },
        h("span", { class: "atl-glance-k" }, r.k),
        h("b", { class: "atl-glance-v" }, r.v),
        h("span", { class: "atl-glance-l" }, r.lvl),
      ));
    }
    el.appendChild(box);
    return box;
  }

  /** شريط الألسنة الخمسة + جسم اللسان (تمرير داخلي لا تمرير للصفحة) */
  function buildTabs(el, S, model, entry) {
    const uid = S.uid;
    const tablist = h("div", {
      class: "atl-tabs", role: "tablist",
      "aria-label": "أقسام لوحة الحي — " + String(model.name),
    });
    const body = h("div", {
      class: "atl-tabpanel",
      role: "tabpanel",
      tabindex: "0",
      "data-interactive": "",
      "data-focus": "tabpanel",
      id: uid + "-panel",
    });

    const btns = [];

    function renderBody() {
      RH.core.dom.clear(body);
      const def = TAB_DEFS.find((t) => t.id === S.st.tab) || TAB_DEFS[0];
      body.setAttribute("aria-label", def.label + " — " + String(model.name));
      const fn = TAB_BUILDERS[def.id];
      if (typeof fn === "function") {
        fn(body, S, model, entry);
      } else {
        body.appendChild(h("div", { class: "atl-empty" }, "لسان غير معروف."));
      }
      body.scrollTop = 0;
    }

    function syncBtns() {
      for (const b of btns) {
        const on = b.getAttribute("data-tab") === S.st.tab;
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.setAttribute("tabindex", on ? "0" : "-1");
        b.classList.toggle("active", on);
      }
    }

    function activate(id, focusBtn) {
      if (!M.TAB_IDS.includes(id)) return;
      S.st.tab = id;
      syncBtns();
      renderBody();
      if (focusBtn) {
        const b = btns.find((x) => x.getAttribute("data-tab") === id);
        if (b) b.focus();
      }
      S.scheduleSync("tab:" + id);
    }
    S.setTab = (id) => activate(id, false);

    TAB_DEFS.forEach((t, i) => {
      const b = h("button", {
        class: "atl-tab",
        type: "button",
        role: "tab",
        id: uid + "-tab-" + t.id,
        "data-tab": t.id,
        "data-focus": "tab:" + t.id,
        "data-interactive": "",
        "aria-selected": "false",
        "aria-controls": uid + "-panel",
        tabindex: "-1",
        title: t.hint,
        onclick: () => activate(t.id, false),
        onkeydown: (ev) => {
          let n = -1;
          /* RTL: السهم الأيسر يتقدم بصرياً إلى اللسان التالي */
          if (ev.key === "ArrowLeft") n = i + 1;
          else if (ev.key === "ArrowRight") n = i - 1;
          else if (ev.key === "Home") n = 0;
          else if (ev.key === "End") n = TAB_DEFS.length - 1;
          else return;
          ev.preventDefault();
          ev.stopPropagation();
          const idx = ((n % TAB_DEFS.length) + TAB_DEFS.length) % TAB_DEFS.length;
          activate(TAB_DEFS[idx].id, true);
        },
      }, t.label);
      btns.push(b);
      tablist.appendChild(b);
    });

    el.appendChild(tablist);
    el.appendChild(body);
    syncBtns();
    renderBody();
    return { tablist, body };
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-هـ) اللوحة التمهيدية — لا حي مختاراً
     ──────────────────────────────────────────────────────────────────────
     إحصاءات موزونة من الإصدار وملف الحدود حصراً؛ لا قيمة حيّية مختلقة،
     وخريطة محايدة بلا إبراز، وجدول القطاعات الخمسة كاملاً.
     ══════════════════════════════════════════════════════════════════════ */
  function buildOverview(el, S) {
    const ov = M.overviewModel(S.rel, S.der, S.geo);

    el.appendChild(h("div", { class: "atl-head" },
      h("div", { class: "atl-head-main" },
        h("h3", { class: "atl-name" }, "أطلس أحياء الرياض"),
        h("div", { class: "atl-head-sub" },
          chip(M.districtsLabel(ov.totalDistricts), "neu",
            "من ملف حدود الأحياء"),
          chip(M.districtsLabel(ov.sampleCount) + " ضمن العينة", "pos",
            ov.sampleLabel),
          ov.dataAsOf ? chip("بيانات حتى " + ov.dataAsOf, "neu") : null,
        ),
      ),
    ));

    el.appendChild(h("p", { class: "atl-para" },
      "ابحث عن أي حي من أحياء الرياض في العمود المجاور، أو انقر حياً على "
      + "الخريطة. لوحة الحي تعرض أرقام قطاعه المنشورة، وقيمه الموثقة إن كان "
      + "ضمن العينة المدرجة، ونقاط التركّز الرقابي حوله، وأصل كل قيمة."));

    el.appendChild(subHead("أرقام الأطلس", ov.monitoringPeriod || ""));
    figureGrid(el, [
      { label: "أحياء ملف الحدود", value: ov.totalDistricts, kind: "district",
        tone: "neu" },
      { label: "أحياء العينة الموثقة", value: ov.sampleCount, kind: "district",
        tone: "pos" },
      { label: "نقاط التركّز الرقابي", value: ov.hotspotCount, kind: "point",
        tone: "neg" },
      { label: "القطاعات", value: ov.sectorCount, kind: "int", tone: "neu" },
      { label: "الطلب التقديري للمدينة", value: ov.cityDemand, kind: "beds",
        tone: "demand" },
      { label: "الطاقة المرخصة للمدينة", value: ov.cityBeds, kind: "beds",
        tone: "pos" },
      { label: "عجز المدينة", value: ov.cityDeficitBeds, kind: "beds",
        tone: "neg" },
      { label: "تغطية المدينة", value: ov.cityCoveragePct, kind: "pct",
        tone: "pos" },
    ], { cls: "atl-figs-ov" });

    if (ov.cityCoveragePct != null) {
      const covBox = h("div", { class: "atl-cov" });
      RH.viz.micro.ratioBar(covBox, {
        su: S.su,
        pct: ov.cityCoveragePct,
        tone: "pos",
        ariaLabel: "نسبة تغطية الطلب على مستوى المدينة "
          + fmt.pct(ov.cityCoveragePct),
        note: "الطاقة المرخصة ÷ الطلب التقديري × 100 — مشتقة منشورة",
      });
      el.appendChild(covBox);
    }

    const mapHost = h("div", { class: "atl-maphost ov" });
    el.appendChild(mapHost);
    buildMiniMap(mapHost, {
      list: S.list, entry: null, geo: S.geo, mode: "city",
      onPick: (k) => S.select(k, "search"),
    });
    if (ov.mapDisclaimer) el.appendChild(note(ov.mapDisclaimer));
    el.appendChild(note(ov.attribution));

    el.appendChild(subHead("القطاعات الخمسة", "أعداد الأحياء من ملف الحدود، "
      + "والأرقام من الإصدار"));
    el.appendChild(denseTable([
      { label: "القطاع", key: "name" },
      { label: "الأحياء", align: "center",
        render: (r) => fmt.int(r.districts) },
      { label: "ضمن العينة", align: "center",
        render: (r) => fmt.int(r.sampleCount) },
      { label: "نقاط التركّز", align: "center",
        render: (r) => fmt.int(r.hotspots) },
      { label: "الطلب", align: "center", render: (r) => fmt.int(r.demand) },
      { label: "الطاقة", align: "center", render: (r) => fmt.int(r.beds) },
      { label: "التغطية", align: "center",
        render: (r) => (r.coveragePct != null ? fmt.pct(r.coveragePct) : "—") },
      { label: "العجز", align: "center",
        render: (r) => (r.deficitBeds != null ? fmt.int(r.deficitBeds) : "—") },
    ], ov.sectors, { cls: "atl-ov-table" }));
    el.appendChild(note(ov.sampleLabel));
    if (ov.rankingNote) el.appendChild(note(ov.rankingNote));
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-و) عمود البحث والقائمة
     ──────────────────────────────────────────────────────────────────────
     حقل بحث بتطبيع geoutils، مرشّحات القطاعات، مفتاح العينة، خمسة ترتيبات،
     عدّاد نتائج ناطق، قائمة role="listbox" بملاحة لوحة مفاتيح كاملة،
     وترقيم صفحات بحساب النموذج النقي. كل عنصر تفاعلي موسوم data-interactive
     فلا تبلغ ضغطاته جهاز التقديم (عقد §8).
     ══════════════════════════════════════════════════════════════════════ */
  function buildSide(el, S) {
    const uid = S.uid;
    const st = S.st;

    let activeIndex = -1;
    let optionNodes = [];
    let pageInfo = M.paginate([], 1, M.PAGE_SIZE);
    let sortedCache = [];
    let autoPage = S.autoPage;
    let statsCache = null;
    /* الحي الذي كان نشطاً في القائمة قبل إعادة البناء — يُستهلك مرة واحدة */
    let restoreActive = S.restoreActiveKey || null;

    /** إحصاء نقاط التركّز يُحسب مرة واحدة عند أول ترتيب يحتاجه فقط */
    function stats() {
      if (!statsCache) statsCache = M.hotspotStats(S.list, S.geo);
      return statsCache;
    }

    /* ── حقل البحث ─────────────────────────────────────────────────────── */
    const input = h("input", {
      class: "atl-search-input",
      type: "search",
      value: st.q,
      placeholder: "ابحث باسم الحي — عربياً أو إنجليزياً",
      "aria-label": "البحث في أحياء الرياض — "
        + M.districtsLabel(S.list.length),
      "aria-describedby": uid + "-count",
      "data-interactive": "",
      "data-focus": "search",
      autocomplete: "off",
      spellcheck: "false",
      oninput: (ev) => {
        st.q = String(ev.target.value || "");
        st.page = 1;
        activeIndex = -1;
        renderList();
        S.scheduleSync("search");
      },
      onkeydown: (ev) => {
        if (ev.key === "ArrowDown") {
          ev.preventDefault();
          ev.stopPropagation();
          listEl.focus();
          setActive(0, true);
        } else if (ev.key === "Enter") {
          ev.preventDefault();
          ev.stopPropagation();
          if (pageInfo.items.length) {
            const at = activeIndex >= 0 ? activeIndex : 0;
            setActive(at, true, true);
            S.select(pageInfo.items[at].key, "search");
          }
        } else if (ev.key === "Escape" && st.q) {
          ev.preventDefault();
          ev.stopPropagation();
          clearQuery();
        }
      },
    });

    function clearQuery() {
      st.q = "";
      st.page = 1;
      activeIndex = -1;
      input.value = "";
      renderList();
      input.focus();
      S.scheduleSync("search");
    }

    const clearBtn = h("button", {
      class: "atl-search-clear",
      type: "button",
      "data-interactive": "",
      "aria-label": "مسح نص البحث",
      title: "مسح البحث",
      onclick: clearQuery,
    }, "✕");

    el.appendChild(h("div", { class: "atl-search" },
      h("span", { class: "atl-search-icon", "aria-hidden": "true" }, "⌕"),
      input, clearBtn));

    /* ── مرشّحات القطاعات + مفتاح العينة ───────────────────────────────── */
    const filtersEl = h("div", {
      class: "atl-filters", role: "group",
      "aria-label": "ترشيح النتائج بالقطاع وبالإدراج في العينة",
    });
    el.appendChild(filtersEl);

    const sectorBtns = [];
    let sampleBtn = null;

    function setSector(id) {
      if (st.sector === id) return;
      st.sector = id;
      st.page = 1;
      activeIndex = -1;
      renderList();
      S.scheduleSync("sec:" + id);
    }

    function toggleSample() {
      st.sampleOnly = !st.sampleOnly;
      st.page = 1;
      activeIndex = -1;
      renderList();
      S.scheduleSync("sample");
    }

    (function buildFilters() {
      const mk = (id, label, title) => {
        const b = h("button", {
          class: "atl-filter",
          type: "button",
          "data-sec": id,
          "data-focus": "sec:" + id,
          "data-interactive": "",
          "aria-pressed": "false",
          title: title || null,
          onclick: () => setSector(id),
        },
          h("span", { class: "atl-filter-l" }, label),
          h("span", { class: "atl-filter-n" }, "—"),
        );
        sectorBtns.push(b);
        filtersEl.appendChild(b);
        return b;
      };
      mk("all", "الكل", "كل أحياء ملف الحدود");
      for (const sid of G.SECTOR_ORDER) {
        const row = M.sectorRowOf(S.rel, sid);
        mk(sid, row ? String(row.short || row.name) : sid,
          row ? String(row.name) : sid);
      }
      sampleBtn = h("button", {
        class: "atl-filter atl-filter-sample",
        type: "button",
        "data-focus": "sample",
        "data-interactive": "",
        "aria-pressed": "false",
        title: M.sampleLabelOf(S.rel),
        onclick: toggleSample,
      },
        h("span", { class: "atl-filter-l" }, "ضمن العينة"),
        h("span", { class: "atl-filter-n" }, "—"),
      );
      filtersEl.appendChild(sampleBtn);
    })();

    /* ── الترتيب ───────────────────────────────────────────────────────── */
    const sortSel = h("select", {
      class: "atl-sort",
      "data-interactive": "",
      "data-focus": "sort",
      "aria-label": "ترتيب نتائج الأحياء",
      onchange: (ev) => {
        const v = String(ev.target.value || "auto");
        st.sort = M.SORT_IDS.includes(v) ? v : "auto";
        st.page = 1;
        activeIndex = -1;
        renderList();
        S.scheduleSync("sort");
      },
    }, M.SORT_IDS.map((id) => h("option", {
      value: id, selected: id === st.sort ? true : null,
    }, M.SORT_LABELS[id] || id)));
    sortSel.value = st.sort;

    const sortNote = h("span", { class: "atl-sort-note" }, "");
    el.appendChild(h("div", { class: "atl-sortrow" },
      h("span", { class: "atl-sortrow-l" }, "الترتيب"), sortSel, sortNote));

    /* ── عدّاد النتائج (منطقة ناطقة) ───────────────────────────────────── */
    const countEl = h("div", {
      class: "atl-count", id: uid + "-count",
      role: "status", "aria-live": "polite", "aria-atomic": "true",
    }, "");
    el.appendChild(countEl);

    /* ── القائمة ───────────────────────────────────────────────────────── */
    const listEl = h("div", {
      class: "atl-list",
      role: "listbox",
      id: uid + "-listbox",
      tabindex: "0",
      "data-interactive": "",
      "data-focus": "list",
      "aria-label": "نتائج الأحياء — استخدم الأسهم للتنقّل وEnter للفتح",
      onkeydown: (ev) => onListKey(ev),
    });
    el.appendChild(listEl);

    /* ── الترقيم ───────────────────────────────────────────────────────── */
    const prevBtn = h("button", {
      class: "atl-page-btn", type: "button", "data-interactive": "",
      "data-focus": "page-prev",
      "aria-label": "الصفحة السابقة من نتائج الأحياء",
      onclick: () => goPage(st.page - 1, "first"),
    }, "السابقة");
    const nextBtn = h("button", {
      class: "atl-page-btn", type: "button", "data-interactive": "",
      "data-focus": "page-next",
      "aria-label": "الصفحة التالية من نتائج الأحياء",
      onclick: () => goPage(st.page + 1, "first"),
    }, "التالية");
    const pageLbl = h("span", { class: "atl-page-lbl" }, "");
    el.appendChild(h("div", { class: "atl-pager" }, nextBtn, pageLbl, prevBtn));

    /* ── منطق العرض ────────────────────────────────────────────────────── */

    function baseForCounts() {
      return M.filterEntries(S.list, {
        query: st.q, sampleOnly: st.sampleOnly,
      });
    }

    function renderChips() {
      const base = baseForCounts();
      const per = Object.create(null);
      for (const e of base) per[e.sector] = (per[e.sector] || 0) + 1;
      for (const b of sectorBtns) {
        const id = b.getAttribute("data-sec");
        const n = id === "all" ? base.length : (per[id] || 0);
        const on = st.sector === id;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.classList.toggle("active", on);
        b.classList.toggle("empty", n === 0);
        const numEl = b.querySelector(".atl-filter-n");
        if (numEl) numEl.textContent = fmt.int(n);
      }
      const inSector = M.filterEntries(S.list, {
        query: st.q, sector: st.sector,
      });
      const sampleN = inSector.filter((e) => !!e.sample).length;
      sampleBtn.setAttribute("aria-pressed", st.sampleOnly ? "true" : "false");
      sampleBtn.classList.toggle("active", st.sampleOnly);
      sampleBtn.classList.toggle("empty", sampleN === 0);
      const sn = sampleBtn.querySelector(".atl-filter-n");
      if (sn) sn.textContent = fmt.int(sampleN);
    }

    function renderCount(total) {
      const secRow = st.sector !== "all"
        ? M.sectorRowOf(S.rel, st.sector) : null;
      countEl.textContent = M.searchSummary({
        total,
        query: st.q,
        sectorName: secRow ? String(secRow.name) : "",
        sampleOnly: st.sampleOnly,
        sortLabel: st.sort !== "auto" ? M.SORT_LABELS[st.sort] : "",
      });
      sortNote.textContent = M.SAMPLE_SORTS.includes(st.sort)
        ? "الأحياء خارج العينة بلا قيمة — تنزل آخر القائمة"
        : "";
    }

    function renderPager() {
      prevBtn.disabled = !pageInfo.hasPrev;
      nextBtn.disabled = !pageInfo.hasNext;
      pageLbl.textContent = pageInfo.total
        ? M.rangeLabel(pageInfo) + " · "
          + fmt.iso("صفحة " + fmt.int(pageInfo.page) + " من "
            + fmt.int(pageInfo.pages))
        : "—";
    }

    function optionLabel(e) {
      const parts = [String(e.name), String(e.sectorName)];
      if (e.sample) {
        parts.push("ضمن العينة — "
          + fmt.unitAfter(e.sample.beds, "سرير") + "، "
          + fmt.noun(e.sample.violations, "violation"));
      } else {
        parts.push("خارج العينة — لا قيم على مستوى الحي");
      }
      return parts.join("، ");
    }

    function renderOptions() {
      RH.core.dom.clear(listEl);
      optionNodes = [];
      if (!pageInfo.items.length) {
        listEl.removeAttribute("aria-activedescendant");
        const box = h("div", { class: "atl-empty atl-empty-list" },
          h("p", {}, "لا حي يطابق البحث والمرشّحات الحالية."),
        );
        box.appendChild(actionBtn("إعادة ضبط البحث والمرشّحات", () => {
          st.q = "";
          st.sector = "all";
          st.sampleOnly = false;
          st.sort = "auto";
          st.page = 1;
          activeIndex = -1;
          input.value = "";
          sortSel.value = "auto";
          renderList();
          input.focus();
          S.scheduleSync("search");
        }, { cls: "ghost", aria: "إعادة ضبط البحث والمرشّحات" }));
        listEl.appendChild(box);
        return;
      }
      pageInfo.items.forEach((e, i) => {
        const selected = st.key === e.key;
        const opt = h("div", {
          class: "atl-opt" + (selected ? " is-sel" : "")
            + (e.sample ? " has-sample" : ""),
          role: "option",
          id: uid + "-opt-" + i,
          "data-key": e.key,
          "aria-selected": selected ? "true" : "false",
          title: optionLabel(e),
          onclick: () => { setActive(i, false, true); S.select(e.key, "list"); },
        },
          h("span", { class: "atl-opt-main" },
            h("span", { class: "atl-opt-name" }, String(e.name)),
            e.name_en
              ? h("span", { class: "atl-opt-en" }, fmt.iso(String(e.name_en)))
              : null,
          ),
          h("span", { class: "atl-opt-side" },
            h("span", { class: "atl-opt-sec" },
              String((M.sectorRowOf(S.rel, e.sector) || {}).short || e.sector)),
            e.sample
              ? h("span", { class: "atl-opt-badge" }, "ضمن العينة") : null,
          ),
        );
        optionNodes.push(opt);
        listEl.appendChild(opt);
      });
      /* أولوية العنصر النشط: موضع ملاحة محجوز قبل إعادة البناء، ثم الحي
         المختار إن كان في هذه الصفحة، ثم آخر موضع محصور — وإلا لا نشط. */
      let at = -1;
      if (restoreActive) {
        at = pageInfo.items.findIndex((e) => e.key === restoreActive);
        restoreActive = null;
      }
      if (at < 0) at = pageInfo.items.findIndex((e) => e.key === st.key);
      if (at < 0 && activeIndex >= 0) {
        at = Math.min(activeIndex, optionNodes.length - 1);
      }
      if (at >= 0) setActive(at, false, true);
      else listEl.removeAttribute("aria-activedescendant");
    }

    function setActive(i, scroll, silent) {
      if (!optionNodes.length) return;
      const at = Math.max(0, Math.min(optionNodes.length - 1, i));
      activeIndex = at;
      optionNodes.forEach((n, j) => n.classList.toggle("is-active", j === at));
      listEl.setAttribute("aria-activedescendant", uid + "-opt-" + at);
      if (scroll && typeof optionNodes[at].scrollIntoView === "function") {
        optionNodes[at].scrollIntoView({ block: "nearest" });
      }
      /* ملاحة المستخدم داخل القائمة تؤجّل أي كتابة معاملات معلّقة وتحجز
         موضعها — كي لا تهبط إعادة البناء في منتصف حركة لوحة المفاتيح
         فتُفقد الحي النشط أو تخطف التركيز إلى حقل البحث. */
      if (!silent) {
        const item = pageInfo.items[at];
        S.touch("list", item ? item.key : null);
      }
    }

    function goPage(p, land) {
      const target = Math.max(1, Math.min(pageInfo.pages, p));
      if (target === pageInfo.page) return;
      st.page = target;
      activeIndex = -1;
      renderList();
      if (land === "last") setActive(optionNodes.length - 1, true, true);
      else if (land === "first") setActive(0, true, true);
      listEl.focus();
      const cur = activeIndex >= 0 ? pageInfo.items[activeIndex] : null;
      S.scheduleSync("list", cur ? cur.key : null);
    }

    function moveActive(delta) {
      const n = pageInfo.items.length;
      if (!n) return;
      let i = activeIndex < 0 ? (delta > 0 ? 0 : n - 1) : activeIndex + delta;
      if (i < 0) {
        if (pageInfo.hasPrev) { goPage(st.page - 1, "last"); return; }
        i = 0;
      } else if (i >= n) {
        if (pageInfo.hasNext) { goPage(st.page + 1, "first"); return; }
        i = n - 1;
      }
      setActive(i, true);
    }

    function onListKey(ev) {
      switch (ev.key) {
        case "ArrowDown": moveActive(1); break;
        case "ArrowUp": moveActive(-1); break;
        case "Home":
          if (ev.ctrlKey) { goPage(1, "first"); } else setActive(0, true);
          break;
        case "End":
          if (ev.ctrlKey) { goPage(pageInfo.pages, "last"); }
          else setActive(pageInfo.items.length - 1, true);
          break;
        case "PageDown": goPage(st.page + 1, "first"); break;
        case "PageUp": goPage(st.page - 1, "first"); break;
        case "Enter":
        case " ":
        case "Spacebar":
          if (activeIndex >= 0 && pageInfo.items[activeIndex]) {
            S.select(pageInfo.items[activeIndex].key, "list");
          }
          break;
        default: return;
      }
      ev.preventDefault();
      ev.stopPropagation();
    }

    function renderList() {
      const filtered = M.filterEntries(S.list, {
        query: st.q, sector: st.sector, sampleOnly: st.sampleOnly,
      });
      sortedCache = M.sortEntries(filtered, st.sort,
        st.sort === "hotspots" ? { stats: stats() } : null);
      if (autoPage) {
        st.page = M.pageOfKey(sortedCache, st.key, M.PAGE_SIZE);
        autoPage = false;
      }
      pageInfo = M.paginate(sortedCache, st.page, M.PAGE_SIZE);
      st.page = pageInfo.page;
      renderChips();
      renderOptions();
      renderCount(pageInfo.total);
      renderPager();
    }

    /** مزامنة وسم الاختيار وحده — دون إعادة بناء القائمة كاملة */
    function syncSelection() {
      optionNodes.forEach((n) => {
        const on = n.getAttribute("data-key") === st.key;
        n.setAttribute("aria-selected", on ? "true" : "false");
        n.classList.toggle("is-sel", on);
      });
    }

    return { renderList, syncSelection, focusSearch: () => input.focus() };
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ز) الصفحة: تجميع العمودين وربط الحالة بالمسار
     ══════════════════════════════════════════════════════════════════════ */

  /** مفاتيح الحالة المكتوبة في العنوان (لا يكتب المحرك قيمة "0" أبداً) */
  const PARAM_KEYS = ["d", "q", "sec", "smp", "srt", "pg", "tab"];

  function pageAtlas(el, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const geo = (typeof window !== "undefined" && window.GEO) || null;
    const params = ctx.params || {};
    const list = M.index(geo, rel, der);

    instanceSeq += 1;
    const uid = "atl-" + instanceSeq;

    const root = h("div", { class: "atl-page" });
    el.appendChild(root);

    /* بناء جزئي أو ملف حدود غائب: بطاقة صادقة بدل شاشة فارغة صامتة */
    if (!list.length) {
      root.appendChild(h("h3", { class: "atl-name" }, "أطلس أحياء الرياض"));
      honestCard(root, "ملف حدود الأحياء غير مضمّن في هذا البناء",
        "الأطلس يقرأ الأحياء من data/riyadh-geo.json — وبغيابه لا تُعرض "
        + "قائمة ولا خريطة، ولا تُشتق قيمة بديلة.");
      return;
    }

    /* ── الحالة الأولية من معاملات المسار (روابط عميقة وعودة من الملحق) ── */
    const st = {
      q: String(params.q || ""),
      sector: G.SECTOR_ORDER.includes(params.sec) ? params.sec : "all",
      sampleOnly: params.smp === "1",
      sort: M.SORT_IDS.includes(params.srt) ? params.srt : "auto",
      page: Math.max(1, parseInt(params.pg, 10) || 1),
      key: String(params.d || ""),
      tab: M.TAB_IDS.includes(params.tab) ? params.tab : "profile",
    };
    /* معرّف حي غير موجود في ملف الحدود لا يُقبل صامتاً — يسقط إلى اللوحة
       التمهيدية بدل لوحة فارغة تدّعي حياً غير موجود */
    if (st.key && !M.findByKey(list, st.key)) st.key = "";

    /* اللقطة المكتوبة حالياً في العنوان — لتفادي كتابة لا تغيّر شيئاً */
    const written = {
      d: st.key, q: st.q,
      sec: st.sector !== "all" ? st.sector : "",
      smp: st.sampleOnly ? "1" : "",
      srt: st.sort !== "auto" ? st.sort : "",
      pg: st.page > 1 ? String(st.page) : "",
      tab: st.tab !== "profile" ? st.tab : "",
    };

    /* حالة ملاحة معلّقة تُستعاد بعد إعادة البناء الناتجة عن كتابة المعاملات */
    const restoreActiveKey = pendingActiveKey;
    pendingActiveKey = null;

    let syncTimer = null;
    let disposed = false;
    function currentParams() {
      return {
        d: st.key || "",
        q: st.q || "",
        sec: st.sector !== "all" ? st.sector : "",
        smp: st.sampleOnly ? "1" : "",
        srt: st.sort !== "auto" ? st.sort : "",
        pg: st.page > 1 ? String(st.page) : "",
        tab: st.tab !== "profile" ? st.tab : "",
      };
    }
    function runSync() {
      syncTimer = null;
      /* حارس دورة الحياة: المحرك يؤجّل تنظيف المضيف المغادَر إلى أول بناء
         تالٍ فيه، فقد ينضج هذا الموعد بعد مغادرة الملحق. `ctx.update` حينها
         يكتب معاملات الأطلس على مسار **آخر** (القسم الذي عاد إليه المستخدم)
         فتتسرب `d/pg/tab` إلى عنوانه وإلى حالة عودته. لا كتابة إذن إلا
         والملحق ما يزال المسار الحالي فعلاً. */
      if (disposed) { pendingFocus = null; pendingActiveKey = null; return; }
      const cur = RH.presenter.engine.current();
      const curId = cur && cur.id ? String(cur.id).split("/")[0] : "";
      if (!cur || cur.kind !== "appendix" || curId !== "atlas") {
        pendingFocus = null;
        pendingActiveKey = null;
        return;
      }
      const next = currentParams();
      let changed = false;
      for (const k of PARAM_KEYS) {
        if (String(next[k] || "") !== String(written[k] || "")) changed = true;
      }
      if (!changed) { pendingFocus = null; return; }
      /* المحرك يحذف المعاملات الفارغة من العنوان (null صريحة أوضح) */
      const payload = {};
      for (const k of PARAM_KEYS) payload[k] = next[k] || null;
      ctx.update(payload);
    }
    /** كتابة مؤجَّلة ومجمّعة: تُنشئ موعداً جديداً وتحجز التركيز وموضع الملاحة */
    function scheduleSync(ref, activeKey) {
      pendingFocus = ref || null;
      pendingActiveKey = activeKey || null;
      clearTimeout(syncTimer);
      syncTimer = setTimeout(runSync, 420);
    }
    /** لمسة تفاعل لا تغيّر حالة محفوظة: تؤجّل الموعد القائم (إن وُجد) وتحجز
        موضع الملاحة — ولا تُنشئ موعداً جديداً كي لا تتسخ معاملات العنوان
        بمجرد تحريك الأسهم داخل القائمة. */
    function touch(ref, activeKey) {
      if (ref) pendingFocus = ref;
      pendingActiveKey = activeKey || null;
      if (syncTimer) {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(runSync, 420);
      }
    }
    ctx.onTeardown(() => {
      disposed = true;
      clearTimeout(syncTimer);
      syncTimer = null;
    });

    /* ── ملخص ناطق يسبق العمودين ── */
    root.appendChild(h("p", { class: "atl-sr" },
      "أطلس الأحياء — " + M.districtsLabel(list.length)
      + " من ملف الحدود، منها " + M.districtsLabel(M.sampleRows(rel).length)
      + " بقيم موثقة في العينة. العمود الأيمن للبحث والقائمة، والأيسر للوحة "
      + "الحي المختار بخمسة ألسنة."));

    const grid = h("div", { class: "atl-grid" });
    const sideEl = h("aside", {
      class: "atl-side", role: "search",
      "aria-label": "البحث في أحياء الرياض واختيار حي",
    });
    const mainEl = h("section", {
      class: "atl-main", role: "region", "aria-label": "لوحة الحي",
      tabindex: "-1",
    });
    grid.appendChild(sideEl);
    grid.appendChild(mainEl);
    root.appendChild(grid);

    const S = {
      rel, der, geo, list, st, uid,
      su: ctx.su,
      autoPage: !params.pg,
      restoreActiveKey,
      scheduleSync,
      touch,
      setTab: () => {},      // يوصلها buildTabs عند بناء اللوحة
      select: () => {},      // توصلها الصفحة أدناه بعد بناء العمود
      renderPanel: () => {},
    };

    const side = buildSide(sideEl, S);

    function renderPanel() {
      RH.core.dom.clear(mainEl);
      const entry = st.key ? M.findByKey(list, st.key) : null;
      if (!entry) { buildOverview(mainEl, S); return; }
      const model = M.panelModel(entry, rel, der, geo);
      buildPanelHead(mainEl, S, model, entry);
      buildMapCard(mainEl, S, model, entry);
      buildTabs(mainEl, S, model, entry);
    }
    S.renderPanel = renderPanel;

    S.select = function select(key, focusRef) {
      const next = key ? String(key) : "";
      if (next && !M.findByKey(list, next)) return;
      st.key = next;
      side.syncSelection();
      renderPanel();
      /* العرض يتحدث فوراً؛ كتابة المعاملات مؤجَّلة، وموضع القائمة محجوز
         على الحي المختار كي تعود الملاحة إليه بعد إعادة البناء. */
      scheduleSync(focusRef || null, next || null);
    };

    side.renderList();
    renderPanel();

    /* ── إعادة التركيز بعد إعادة البناء الناتجة عن كتابة المعاملات ── */
    if (pendingFocus) {
      const ref = pendingFocus;
      pendingFocus = null;
      const target = root.querySelector
        ? root.querySelector("[data-focus=\"" + ref + "\"]") : null;
      if (target && typeof target.focus === "function") {
        target.focus();
        if (target.tagName === "INPUT"
          && typeof target.setSelectionRange === "function") {
          const n = String(target.value || "").length;
          try { target.setSelectionRange(n, n); } catch (_e) { /* غير حرج */ }
        }
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ح) التسجيل — يرث من ax-shell العودة السياقية وهيكل الصفحة.
        تسجيلٌ مشروط بحضور الهيكل كي يُحمَّل الملف في بيئة اختبار الوحدة
        بنموذجه النقي وحده (عقد §0 «قاعدة قابلية الاختبار»).
     ══════════════════════════════════════════════════════════════════════ */
  if (RH.presenter && RH.presenter.ax
      && typeof RH.presenter.ax.register === "function") {
    RH.presenter.ax.register({
      id: "atlas",
      kicker: "ملحق استكشافي",
      title: "أطلس الأحياء",
      returnLabel: (ret) => {
        const title = ret && ret.id ? SECTION_TITLES[ret.id] : null;
        return title ? "العودة إلى " + title : "العودة إلى العرض";
      },
      pages: () => [
        { name: "أطلس الأحياء", build: pageAtlas },
      ],
    });
  }
})();
