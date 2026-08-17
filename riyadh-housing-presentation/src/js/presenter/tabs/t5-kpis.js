/* ════════════════════════════════════════════════════════════════════════════
   t5-kpis.js — التبويب ٥: «مؤشرات الأداء» (V3_SPEC §4 و§4-ب · V3_CONTRACTS §4)
   ────────────────────────────────────────────────────────────────────────────
   الموجز الملزم لهذا التبويب — العميل طلب **عدّادات نصف دائرية (gauges)**
   صراحةً بدل الأشرطة:

     ▸ **صف الأرقام الكبرى** أعلى اللوح: تكوين المحفظة المؤشرية (14 مؤشراً ·
       النسبية · العددية · **القيم الحالية المسجَّلة ‎0 من 14‎ بصدق**). كل رقم
       زر حقيقي: نقرة واحدة تفتح نافذة الإبراز.

     ▸ **العدّاد المكبَّر** للمؤشر المختار (رسم رئيس ‎.tabchart‎ من ECharts):
       قوس نصف دائري يقرأ من اليمين (الصفر) إلى اليسار (أعلى المقياس) على سنّة
       الاتجاه العربي، وفيه **علامتان واضحتان**: شريحة ذهبية عند خط الأساس
       وشريحة أغمق عند المستهدف، وبينهما **نطاق التحسن المطلوب** بصبغة ذهبية
       شفافة. بجانبه بطاقة حقائق المؤشر وزر الإبراز.

     ▸ **لوح العدّادات الأربعة عشر**: شبكة مريحة **ثلاثة في الصف كحد أقصى**،
       كل عدّاد رسم SVG كودي بالهندسة ذاتها (‎arcSegments‎ نفسها التي تُغذّي
       العدّاد المكبَّر) — فالعدّاد الصغير والعدّاد الكبير لغة بصرية واحدة.
       لكل عدّاد **رقاقة نوع المؤشر (نسبي/عددي)** كما نصّ الموجز.

     ▸ **مصفوفة المؤشرات** أسفل اللوح: الأربعة عشر صفاً بكل حقول المصدر.

   ══ صدق البيانات (V3_SPEC §4-ب — يُنفَّذ حرفياً، ولا استثناء) ══
     • **لا توجد قيم حالية للمؤشرات في المصدر (14/14 فارغة).** لذلك يعرض
       العدّاد قوسه بخط الأساس والمستهدف **كعلامتين**، وحالة صريحة داخل
       العدّاد: «القيمة الحالية غير مسجّلة — تُدخل من الإدارة»،
       و**لا تُرسم إبرة وهمية إطلاقاً** ولا يُملأ قوس تقدم مختلق.
     • مسار الإبرة والتقدّم **مبنيان في الكود** ومحكومان بـ‎recorded‎: ما إن
       تُدخل الإدارة قيمة حالية حتى يظهر العدّاد كاملاً (إبرة + قوس تقدم +
       القيمة في المركز) تلقائياً وبلا تعديل سطر واحد.
     • المقياس معلن لا مضمر: المؤشر النسبي يُقاس على ‎0 → 100٪‎ (المقياس
       الطبيعي للنسبة)، والمؤشر العددي على ‎0 → المستهدف‎ (لا سقف طبيعي له
       في المصدر). التسمية تلازم كل عدّاد فلا يُقرأ قوس على غير مقياسه.
     • كل قيمة من ‎strategy.kpis‎ حرفياً عبر ‎RH.core.fmt‎؛ والمشتق الوحيد
       حسابات شفافة من قيم المصدر ذاتها (مدى التحسن = المستهدف − خط الأساس،
       وموضع خط الأساس على المقياس) بمرآة تقريب بايثون ‎roundHalfUp‎.

   طبقات النقر الثلاث (V3_SPEC §5) — لا رابعة:
     ١) تحويم على العدّاد المكبَّر → ‎T.ttMicro‎: سطران (عنوان + قيمة واحدة).
     ٢) نقرة أولى (رقم كبير · عدّاد صغير · صف المصفوفة · زر بطاقة الحقائق)
        → ‎ctx.highlight‎: جملة واحدة + ≤3 أرقام + زر واحد، بحدّ ‎320‎ حرفاً
        يحرسه اختبار الوحدة ‎tests/unit/tab-kpis.test.mjs‎.
     ٣) الزر → ملحق ‎kpi‎ بصفحته المناسبة وبحالة عودة يرمّزها المحرك.
     • زر «تكبير» داخل بطاقة العدّاد **تصفية/تركيز** لا نافذة: يكتب ‎?kpi=‎
       في العنوان فيتبدّل العدّاد المكبَّر — فلا تنبثق طبقة مشروطة مع كل تركيز.

   اللون: **صفر لون مكتوب**. ألوان العدّاد المكبَّر من ‎RH.viz.theme.C‎ (رموز
   حيّة تُقرأ وقت البناء لا وقت التحميل)، وألوان العدّادات الصغيرة والواجهة
   ‎var(--…)‎ في ‎src/styles/tabs/kpis.css‎ — فتتبع السمتين بلا سطر JS.
   تبديل السمة يعيد بناء التبويب كاملاً عبر خطاف ‎onRetheme‎ في القشرة.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** مرآة تقريب المشروع الموحد (نصف لأعلى، منزلة واحدة) — تُقرأ وقت النداء */
  const round1 = (v) => RH.data.derive.roundHalfUp(v, 1);

  /* ── التسميات الحرفية الملزمة (V3_SPEC §4-ب) — لا يُعاد صياغتها ────────── */
  /** الحالة الصريحة داخل العدّاد — نص المواصفة حرفياً */
  const NOT_RECORDED = "القيمة الحالية غير مسجّلة — تُدخل من الإدارة";
  /** الصيغة المختصرة داخل قرص العدّاد (المساحة ضيقة، والجملة الكاملة تحته) */
  const NOT_RECORDED_SHORT = "غير مسجّلة";
  /** عنوان الحالة فوق الصيغة المختصرة */
  const CURRENT_LABEL = "القيمة الحالية";
  /** تسميتا العلامتين على القوس */
  const MARK_BASE = "خط الأساس";
  const MARK_TARGET = "المستهدف";
  /** المشتق الشفاف الوحيد المسموح تسميته على القوس */
  const SPAN_LABEL = "مدى التحسن المطلوب";
  /** تسمية المقياس — تلازم كل عدّاد فلا يُقرأ قوس على غير مقياسه */
  const SCALE_PCT = "المقياس: 0 إلى 100٪";
  const SCALE_NUM = "المقياس: 0 إلى المستهدف";

  /** رقاقة نوع المؤشر التي طلبها الموجز صراحةً */
  const TYPE_PCT = "نسبي";
  const TYPE_NUM = "عددي";
  /** التسمية المطوّلة (المصفوفة وبطاقة الحقائق) — مرآة مفردات ‎ax-kpi‎ */
  const TYPE_PCT_LONG = "نسبة مئوية";
  const TYPE_NUM_LONG = "قيمة عددية";

  /** الملحق الوحيد لهذا التبويب ونص زره */
  const AX_ID = "kpi";
  const AX_LABEL = "التفاصيل الكاملة في الملحق";
  /** حجم صفحة جدول الملحق — مرآة ‎ROWS_PER_PAGE‎ في ‎ax-kpi.js‎ */
  const AX_ROWS_PER_PAGE = 8;

  /** نصف عرض شريحة العلامة على القوس (كسر من المقياس) — ثابت عرض لا بيانات */
  const MARK_HALF = 0.014;

  /** هندسة العدّاد الصغير في نظام إحداثيات ثابت (‎viewBox‎) — لا قيم بيانات */
  const GEO = Object.freeze({
    W: 240, H: 138, CX: 120, CY: 122, R: 96,
    BAND: 17,          /* سماكة القوس */
    DOT: 5.4,          /* نصف قطر شاخص خط الأساس المجوف */
    TICK_IN: 14, TICK_OUT: 9,   /* امتداد عارضة المستهدف داخلاً وخارجاً */
  });

  /** مفاتيح الترشيح والترتيب القانونية — أي قيمة أخرى تسقط إلى الافتراضي */
  const MIXES = Object.freeze(["", "pct", "num"]);
  const SORTS = Object.freeze(["", "span", "base"]);

  /* ══════════════════════════════════════════════════════════════════════════
     ١) النموذج النقي — دوال بلا DOM ولا ECharts، مغطاة باختبار الوحدة
        ‎tests/unit/tab-kpis.test.mjs‎ (اشتقاق · هندسة · تسميات · حدود).
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * تنسيق قيمة مؤشر — المرآة الحرفية لدالة ‎kpiVal‎ في ‎s07-kpis‎ و‎ax-kpi‎:
   * النسبية ‎×100‎ بعلامة ٪ العربية المعزولة، والعددية بفاصل الآلاف.
   * الغياب يُعرض «—» ولا يتحول صفراً أبداً.
   */
  function kpiVal(k, v) {
    if (v == null || !Number.isFinite(v)) return "—";
    return k && k.pct ? fmt.pct(round1(v * 100)) : fmt.int(v);
  }

  /** مدى التحسن المطلوب = المستهدف − خط الأساس، بصيغة المؤشر ذاتها */
  function spanVal(k) {
    if (!k) return "—";
    return k.pct
      ? fmt.pct(round1((k.target - k.baseline) * 100))
      : fmt.int(k.target - k.baseline);
  }

  /**
   * أعلى المقياس المعلن:
   *   نسبي  → ‎1‎ (أي 100٪ — المقياس الطبيعي للنسبة)
   *   عددي  → المستهدف (لا سقف طبيعي في المصدر، فالمستهدف هو نهاية القوس)
   * مستهدف غير موجب (لا يقع في الإصدار — بوابة ‎target_gt_baseline‎) يعيد ‎0‎
   * فتصير كل الكسور صفراً بدل قسمة على صفر.
   */
  function scaleMax(k) {
    if (!k) return 0;
    if (k.pct) return 1;
    return Number.isFinite(k.target) && k.target > 0 ? k.target : 0;
  }

  /** موضع قيمة على القوس ككسر ‎[0,1]‎ — الشذوذ يُحصر ولا يُسقط الرسم */
  function fracOf(k, v) {
    const max = scaleMax(k);
    if (!max || !Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(1, v / max));
  }

  /**
   * تفكيك «عدد + معدود» من ‎fmt.noun‎ — يضمن تطابق الوحدة اللاحقة مع العدد
   * في كل موضع يعرض الرقم والمعدود منفصلين (صف الأرقام الكبرى): «14 مؤشراً»
   * مقابل «3 مؤشرات» بلا تناوب عشوائي ولا وحدة مكتوبة يدوياً.
   */
  function nounParts(n, key) {
    const parts = fmt.noun(n, key).split(fmt.NBSP);
    return {
      num: parts.length > 1 ? parts[0] : fmt.int(n),
      word: parts.length > 1 ? parts.slice(1).join(fmt.NBSP) : "",
    };
  }

  /** رقاقة النوع القصيرة (داخل بطاقة العدّاد) وتسميتها المطوّلة */
  const typeChip = (k) => (k && k.pct ? TYPE_PCT : TYPE_NUM);
  const typeLong = (k) => (k && k.pct ? TYPE_PCT_LONG : TYPE_NUM_LONG);
  const scaleNote = (k) => (k && k.pct ? SCALE_PCT : SCALE_NUM);

  /**
   * **شرائح القوس** — الدالة النقية التي يتقاسمها العدّاد المكبَّر (ECharts)
   * والعدّادات الصغيرة (SVG)، فتتطابق لغتهما البصرية حرفياً.
   * تعيد مصفوفة ‎[{stop, role}]‎ بنهايات تصاعدية آخرها ‎1‎، والأدوار:
   *   ‎track‎  المسار المحايد · ‎base‎ شريحة علامة خط الأساس
   *   ‎band‎   نطاق التحسن المطلوب · ‎target‎ شريحة علامة المستهدف
   * الشرائح المنعدمة الطول تُسقط (لا شريحة بلا مساحة)، والتلاصق عند تقارب
   * العلامتين يُلغي النطاق بينهما بدل أن يقلب ترتيب النهايات.
   * وحين ينطبق الموضعان (حالة لا تقع في الإصدار — بوابة ‎target_gt_baseline‎)
   * تُقسم الشريحة نصفين فتبقى **العلامتان** قائمتين ولا تبتلع إحداهما الأخرى.
   */
  function arcSegments(baseFrac, targetFrac, mark) {
    const clamp01 = (v) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0);
    const m = Number.isFinite(mark) && mark >= 0 ? mark : MARK_HALF;
    let b = clamp01(baseFrac);
    let t = clamp01(targetFrac);
    if (t < b) { const s = b; b = t; t = s; }
    const apart = t > b;

    const raw = [
      { to: b - m, role: "track" },
      { to: apart ? b + m : b, role: "base" },
      { to: apart ? t - m : b, role: "band" },
      { to: t + m, role: "target" },
      { to: 1, role: "track" },
    ];
    const out = [];
    let prev = 0;
    for (const s of raw) {
      const stop = clamp01(s.to);
      if (stop <= prev) continue;      /* شريحة بلا طول — تُسقط لا تُقلب */
      out.push({ stop, role: s.role });
      prev = stop;
    }
    if (!out.length) out.push({ stop: 1, role: "track" });
    else if (out[out.length - 1].stop < 1) out.push({ stop: 1, role: "track" });
    return out;
  }

  /**
   * نقطة على نصف الدائرة: الكسر ‎0‎ عند الطرف **الأيمن** والكسر ‎1‎ عند الطرف
   * **الأيسر** — اتجاه القراءة العربي، مرآة ‎inverse: true‎ في محاور الثيم.
   * (‎y‎ في SVG تنمو نزولاً فالجيب يُطرح.)
   */
  function polar(cx, cy, r, frac) {
    const f = Number.isFinite(frac) ? Math.max(0, Math.min(1, frac)) : 0;
    const a = f * Math.PI;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  }

  /** مسار قوس من الكسر ‎a‎ إلى الكسر ‎b‎ — أقصى امتداد ‎180°‎ فعلم القوس الكبير صفر */
  function arcPath(cx, cy, r, a, b) {
    const p0 = polar(cx, cy, r, a);
    const p1 = polar(cx, cy, r, b);
    const n = (v) => Math.round(v * 100) / 100;
    /* عكس عقارب الساعة على الشاشة (يمين → أعلى → يسار) ⇒ ‎sweep-flag = 0‎ */
    return "M " + n(p0.x) + " " + n(p0.y)
      + " A " + n(r) + " " + n(r) + " 0 0 0 " + n(p1.x) + " " + n(p1.y);
  }

  /** فهرس صفحة الملحق ‎kpi‎ التي تحمل المؤشر — مرآة ترقيم ‎ax-kpi.js‎ (0-based) */
  function pageOf(id) {
    const n = Math.max(1, Math.round(Number(id) || 1));
    return Math.floor((n - 1) / AX_ROWS_PER_PAGE);
  }

  /**
   * صفوف العرض: كل ما يحتاجه العدّاد والمصفوفة، مشتقاً من المصدر وحده.
   * الترتيب بالمعرف عدداً — ترتيب المصدر القانوني (1..14) على كل متصفح.
   */
  function rows(release) {
    const list = ((release && release.strategy && release.strategy.kpis) || [])
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id));

    return list.map((k) => {
      const recorded = k.current != null && Number.isFinite(k.current);
      const baseFrac = fracOf(k, k.baseline);
      const targetFrac = fracOf(k, k.target);
      return {
        id: Number(k.id),
        idText: fmt.iso(fmt.int(k.id)),
        name: String(k.name),
        type: String(k.type || "—"),
        pct: !!k.pct,
        baseline: k.baseline,
        target: k.target,
        current: recorded ? k.current : null,
        recorded,
        note: String(k.current_note || ""),
        max: scaleMax(k),
        baseFrac,
        targetFrac,
        /* موضع الإبرة — يبقى ‎null‎ ما دامت القيمة غير مسجّلة فلا تُرسم إبرة */
        currentFrac: recorded ? fracOf(k, k.current) : null,
        /* اتساع المسافة بين العلامتين على المقياس — مشتق شفاف للترتيب */
        spanFrac: Math.max(0, targetFrac - baseFrac),
        baseText: kpiVal(k, k.baseline),
        targetText: kpiVal(k, k.target),
        maxText: kpiVal(k, scaleMax(k)),
        zeroText: kpiVal(k, 0),
        spanText: spanVal(k),
        currentText: recorded ? kpiVal(k, k.current) : NOT_RECORDED_SHORT,
        basePosText: fmt.pct(round1(baseFrac * 100)),
        typeChip: typeChip(k),
        typeLong: typeLong(k),
        scaleNote: scaleNote(k),
        segments: arcSegments(baseFrac, targetFrac, MARK_HALF),
        axPage: pageOf(k.id),
      };
    });
  }

  /** إحصاء المحفظة المؤشرية — كل عدد محسوب من الصفوف ذاتها لا مكتوب يدوياً */
  function summary(release) {
    const list = rows(release);
    const pctList = list.filter((r) => r.pct);
    const numList = list.filter((r) => !r.pct);
    const recorded = list.filter((r) => r.recorded);

    let widest = null;
    for (const r of list) {
      if (!widest || r.spanFrac > widest.spanFrac) widest = r;
    }
    let minPctTarget = null;
    let maxPctTarget = null;
    for (const r of pctList) {
      if (minPctTarget == null || r.target < minPctTarget) minPctTarget = r.target;
      if (maxPctTarget == null || r.target > maxPctTarget) maxPctTarget = r.target;
    }
    /* المؤشرات النسبية التي مستهدفها التغطية الكاملة (100٪) */
    const fullTargets = pctList.filter((r) => r.target === 1);

    const meta = (release && release.meta) || {};
    return {
      list,
      total: list.length,
      pctCount: pctList.length,
      numCount: numList.length,
      recordedCount: recorded.length,
      missingCount: list.length - recorded.length,
      recordedLabel: fmt.iso(fmt.int(recorded.length) + " من " + fmt.int(list.length)),
      widest,
      fullTargets: fullTargets.length,
      minPctTarget,
      maxPctTarget,
      minPctTargetText: minPctTarget == null ? "—" : fmt.pct(round1(minPctTarget * 100)),
      maxPctTargetText: maxPctTarget == null ? "—" : fmt.pct(round1(maxPctTarget * 100)),
      note: list.length ? list[0].note : "",
      asOf: String(meta.data_as_of || "—"),
      calc: String(meta.calculation_date || ""),
      source: String((release && release.strategy && release.strategy.source) || "—"),
    };
  }

  /** حراسة معاملات العنوان: قيمة خارج القائمة القانونية تسقط إلى الافتراضي */
  const mixOf = (params) => {
    const v = String((params && params.mix) || "");
    return MIXES.indexOf(v) >= 0 ? v : "";
  };
  const sortOf = (params) => {
    const v = String((params && params.sort) || "");
    return SORTS.indexOf(v) >= 0 ? v : "";
  };

  /** ترشيح اللوح بالصيغة — مفتاح مجهول يعيد القائمة كاملة بصمت */
  function applyMix(list, mix) {
    if (mix === "pct") return list.filter((r) => r.pct);
    if (mix === "num") return list.filter((r) => !r.pct);
    return list.slice();
  }

  /**
   * ترتيب اللوح — حتمي دائماً بكسر تعادل على المعرف:
   *   ‎span‎ الأوسع مدى تحسن أولاً · ‎base‎ الأقرب انطلاقاً أولاً · وإلا بالمعرف.
   */
  function applySort(list, sort) {
    const out = list.slice();
    if (sort === "span") {
      out.sort((a, b) => (b.spanFrac - a.spanFrac) || (a.id - b.id));
    } else if (sort === "base") {
      out.sort((a, b) => (b.baseFrac - a.baseFrac) || (a.id - b.id));
    } else {
      out.sort((a, b) => a.id - b.id);
    }
    return out;
  }

  /** المؤشر المعروض في العدّاد المكبَّر — معرف مجهول يسقط على الأول بصمت */
  function focusOf(list, wanted) {
    if (!list.length) return null;
    const id = Number(wanted);
    const hit = Number.isFinite(id) ? list.find((r) => r.id === id) : null;
    return hit || list[0];
  }

  /* ── مواصفات الإبراز (الطبقة الثانية) — جملة واحدة + ≤3 أرقام + زر واحد ──
     ‎note‎ خارج حدّ الأحرف عمداً: وسم صدق/مصدر لا يُقصّ أبداً (عقد §5-ج). */

  /** وسم الصدق الموحد: لا قيمة حالية في المصدر، والعدّاد بلا إبرة */
  const honestyNote = (sum) =>
    "القيم الحالية غير مسجّلة في المصدر (" + sum.recordedLabel
    + ") فلا إبرة على أي عدّاد — البيانات حتى " + sum.asOf + ".";

  /** وجهة الزر الوحيد: ملحق المؤشرات، وصفحته التي تحمل المؤشر */
  const axTo = (page) => ({
    id: AX_ID,
    params: page ? { page: String(page) } : {},
    label: AX_LABEL,
  });

  function overviewSpec(release) {
    const sum = summary(release);
    return {
      title: "المؤشرات الاستراتيجية",
      sentence: "خطة العمل تقيس أثرها بـ" + fmt.noun(sum.total, "indicator")
        + "، لكل منها خط أساس ومستهدف معتمدان في المصدر.",
      stats: [
        { label: TYPE_PCT_LONG, value: fmt.noun(sum.pctCount, "indicator") },
        { label: TYPE_NUM_LONG, value: fmt.noun(sum.numCount, "indicator") },
        { label: "القيم المسجَّلة", value: sum.recordedLabel },
      ],
      appendix: axTo(0),
      note: honestyNote(sum),
    };
  }

  function typeSpec(release, kind) {
    const sum = summary(release);
    const isPct = kind !== "num";
    const count = isPct ? sum.pctCount : sum.numCount;
    const stats = [
      { label: "العدد", value: fmt.noun(count, "indicator") },
      { label: "الحصة", value: fmt.pct(round1((count / (sum.total || 1)) * 100)) },
    ];
    if (isPct) {
      stats.push({
        label: "مستهدف التغطية الكاملة",
        value: fmt.noun(sum.fullTargets, "indicator"),
        tone: "gold",
      });
    } else {
      stats.push({ label: "المقياس", value: "0 إلى المستهدف" });
    }
    return {
      title: isPct ? "المؤشرات النسبية" : "المؤشرات العددية",
      sentence: isPct
        ? fmt.noun(count, "indicator") + " بصيغة نسبة مئوية تُقاس على مقياس "
          + "0 إلى 100٪، ومستهدفاتها بين " + sum.minPctTargetText
          + " و" + sum.maxPctTargetText + "."
        : fmt.noun(count, "indicator") + " بصيغة قيمة عددية، لكل منها خط أساس "
          + "ومستهدف مطلقان يرسمان نهاية قوس عدّاده.",
      stats,
      appendix: axTo(0),
      note: honestyNote(sum),
    };
  }

  /** بيان الصدق: لماذا لا إبرة على أي عدّاد */
  function currentSpec(release) {
    const sum = summary(release);
    return {
      title: CURRENT_LABEL,
      sentence: "لا قيمة حالية مسجَّلة لأي مؤشر في المصدر، فتعرض العدّادات "
        + "خط الأساس والمستهدف علامتين بلا إبرة.",
      stats: [
        { label: "المسجَّل", value: sum.recordedLabel },
        { label: "مصدر التسجيل", value: "واجهة الإدارة" },
        { label: "البيانات حتى", value: sum.asOf },
      ],
      appendix: axTo(0),
      note: honestyNote(sum),
    };
  }

  function kpiSpec(release, id) {
    const sum = summary(release);
    const r = focusOf(sum.list, id);
    if (!r) return overviewSpec(release);

    const sentence = r.recorded
      ? "القيمة الحالية " + r.currentText + " مقابل مستهدف " + r.targetText
        + " وخط أساس " + r.baseText + "."
      : "ينطلق المؤشر من خط أساس " + r.baseText + " نحو مستهدف "
        + r.targetText + "، والقيمة الحالية غير مسجّلة بعد.";

    const stats = [
      { label: MARK_BASE, value: r.baseText, tone: "gold" },
      { label: MARK_TARGET, value: r.targetText, tone: "gold" },
      r.recorded
        ? { label: CURRENT_LABEL, value: r.currentText }
        : { label: SPAN_LABEL, value: r.spanText },
    ];

    return {
      title: r.name,
      sentence,
      stats,
      appendix: axTo(r.axPage),
      note: honestyNote(sum),
    };
  }

  /**
   * كل مواصفات الإبراز التي يستطيع هذا التبويب فتحها — مصدر واحد يفحصه
   * اختبار الوحدة على حدّ ‎320‎ حرفاً وحدّ ثلاثة أرقام (بوابة قبول V3_SPEC §5).
   */
  function allSpecs(release) {
    const out = [overviewSpec(release), currentSpec(release),
      typeSpec(release, "pct"), typeSpec(release, "num")];
    for (const r of rows(release)) out.push(kpiSpec(release, r.id));
    return out;
  }

  const MODEL = {
    NOT_RECORDED, NOT_RECORDED_SHORT, CURRENT_LABEL,
    MARK_BASE, MARK_TARGET, SPAN_LABEL, SCALE_PCT, SCALE_NUM,
    TYPE_PCT, TYPE_NUM, TYPE_PCT_LONG, TYPE_NUM_LONG,
    AX_ID, AX_LABEL, AX_ROWS_PER_PAGE, MARK_HALF, GEO, MIXES, SORTS,
    kpiVal, spanVal, scaleMax, fracOf, nounParts, typeChip, typeLong, scaleNote,
    arcSegments, polar, arcPath, pageOf,
    rows, summary, mixOf, sortOf, applyMix, applySort, focusOf,
    overviewSpec, typeSpec, currentSpec, kpiSpec, allSpecs,
  };

  RH.presenter.tabModels = RH.presenter.tabModels || {};
  RH.presenter.tabModels.kpis = MODEL;

  /* ══════════════════════════════════════════════════════════════════════════
     ٢) حارس اتساق تطويري — يُنبّه ولا يُسقط (مرآة مخففة لبوابات validate.js)
     ══════════════════════════════════════════════════════════════════════════ */
  function guard(where, checks) {
    if (typeof console === "undefined") return;
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("t5-kpis/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٣) عناصر الواجهة المشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** بطاقة بعقد ‎.tabcard‎ الجاهز — تعيد ‎{card, body, head}‎ */
  function panelCard(opts) {
    const body = h("div", { class: "tabcard-body" });
    const head = h("div", { class: "tabcard-head" },
      h("h2", { class: "tabcard-title" }, opts.title),
      opts.note ? h("p", { class: "tabcard-note" }, opts.note) : null);
    const card = h("section", {
      class: "tabcard kpi5-card" + (opts.cls ? " " + opts.cls : ""),
      "aria-label": opts.title,
    }, head, body);
    return { card, body, head };
  }

  /** رقاقة نوع المؤشر (نسبي/عددي) — نص + لون، والنص هو حامل المعنى */
  function typeBadge(r, extra) {
    return h("span", {
      class: "kpi5-type is-" + (r.pct ? "pct" : "num") + (extra ? " " + extra : ""),
      title: r.typeLong,
    }, r.typeChip);
  }

  /**
   * **العدّاد نصف الدائري المرسوم كوداً** (SVG) — بالهندسة ذاتها التي تُغذّي
   * العدّاد المكبَّر. لا إبرة إلا حين تُسجَّل قيمة حالية: ‎recorded === false‎
   * يعني قوساً بعلامتيه ومركزاً يعلن الغياب صراحةً — لا إبرة وهمية أبداً.
   */
  function gaugeSvg(r) {
    const g = GEO;
    const parts = [];
    let from = 0;
    for (const seg of r.segments) {
      const d = arcPath(g.CX, g.CY, g.R, from, seg.stop);
      parts.push(svg("path", {
        class: "kpi5-arc is-" + seg.role,
        d,
        "stroke-width": g.BAND,
      }));
      from = seg.stop;
    }

    /* شاخص خط الأساس: دائرة مجوفة على القوس (الشكل يميّزه عن عارضة المستهدف) */
    const bp = polar(g.CX, g.CY, g.R, r.baseFrac);
    parts.push(svg("circle", {
      class: "kpi5-mark-base",
      cx: Math.round(bp.x * 100) / 100,
      cy: Math.round(bp.y * 100) / 100,
      r: g.DOT,
    }));

    /* عارضة المستهدف: خط يعبر القوس داخلاً وخارجاً */
    const ti = polar(g.CX, g.CY, g.R - g.TICK_IN, r.targetFrac);
    const to = polar(g.CX, g.CY, g.R + g.TICK_OUT, r.targetFrac);
    const n = (v) => Math.round(v * 100) / 100;
    parts.push(svg("line", {
      class: "kpi5-mark-target",
      x1: n(ti.x), y1: n(ti.y), x2: n(to.x), y2: n(to.y),
    }));

    /* الإبرة: تُرسم **فقط** حين تُسجَّل قيمة حالية (V3_SPEC §4-ب) */
    if (r.recorded && r.currentFrac != null) {
      const np = polar(g.CX, g.CY, g.R - g.BAND, r.currentFrac);
      parts.push(svg("line", {
        class: "kpi5-needle",
        x1: g.CX, y1: g.CY, x2: n(np.x), y2: n(np.y),
      }));
      parts.push(svg("circle", {
        class: "kpi5-needle-hub", cx: g.CX, cy: g.CY, r: 5,
      }));
    }

    return svg("svg", {
      class: "kpi5-g" + (r.recorded ? " is-recorded" : " is-pending"),
      viewBox: "0 0 " + g.W + " " + g.H,
      "aria-hidden": "true", focusable: "false",
      preserveAspectRatio: "xMidYMid meet",
    }, parts);
  }

  /** مركز العدّاد: القيمة المسجَّلة أو **الحالة الصريحة** بلا إبرة */
  function gaugeCenter(r) {
    return h("span", { class: "kpi5-g-center" },
      h("span", { class: "kpi5-g-cap" }, CURRENT_LABEL),
      h("b", {
        class: "kpi5-g-val" + (r.recorded ? " is-recorded" : " is-pending"),
      }, r.currentText));
  }

  /** سطر العلامتين تحت أي عدّاد — الشكل واللون والنص معاً */
  function markRow(r, cls) {
    return h("span", { class: "kpi5-marks" + (cls ? " " + cls : "") },
      h("span", { class: "kpi5-mark is-base" },
        h("i", { class: "kpi5-mark-glyph is-base", "aria-hidden": "true" }),
        h("span", { class: "kpi5-mark-lab" }, MARK_BASE),
        h("b", { class: "kpi5-mark-val tnum" }, r.baseText)),
      h("span", { class: "kpi5-mark is-target" },
        h("i", { class: "kpi5-mark-glyph is-target", "aria-hidden": "true" }),
        h("span", { class: "kpi5-mark-lab" }, MARK_TARGET),
        h("b", { class: "kpi5-mark-val tnum" }, r.targetText)));
  }

  /** طرفا المقياس تحت القوس: الصفر يميناً وأعلى المقياس يساراً (اتجاه القراءة) */
  function scaleRow(r) {
    return h("span", { class: "kpi5-scale" },
      h("i", { class: "kpi5-scale-end tnum" }, r.zeroText),
      h("span", { class: "kpi5-scale-cap" }, r.scaleNote),
      h("i", { class: "kpi5-scale-end tnum" }, r.maxText));
  }

  /** توصيل نقر مثيل ECharts بفصل مضمون عند مغادرة التبويب */
  function onChartClick(ctx, chart, handler) {
    chart.on("click", handler);
    ctx.onTeardown(() => {
      try {
        if (!chart.isDisposed()) chart.off("click", handler);
      } catch (_e) { /* أُتلف سلفاً */ }
    });
  }

  /**
   * صبغة مشتقة من قناة رمز حيّ ‎--x-rgb‎ (المسلك ذاته الذي يعتمده
   * ‎viz/theme.js‎ في ‎computeAxisTints‎): لا قيمة لونية مكتوبة، والشفافية
   * تتبع السمة لأن القناة نفسها معرَّفة في ‎tokens.css‎ لكل سمة.
   * تعيد ‎null‎ حين لا يتوفر ‎getComputedStyle‎ (سياق اختبار) فيسقط النداء
   * على لون رمزي صريح.
   */
  function tint(name, alpha) {
    let rgb = "";
    try {
      if (typeof getComputedStyle === "function" && document.documentElement) {
        rgb = String(getComputedStyle(document.documentElement)
          .getPropertyValue(name) || "").trim();
      }
    } catch (_e) { rgb = ""; }
    if (!rgb) return null;
    return "rgba(" + rgb + ", " + alpha + ")";
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٤) البناء
     ══════════════════════════════════════════════════════════════════════════ */

  function build(el, ctx) {
    const T = RH.viz.theme;
    const rel = ctx.release;
    const su = ctx.su;

    const sum = summary(rel);
    const all = sum.list;
    const mix = mixOf(ctx.params);
    const sort = sortOf(ctx.params);
    const board = applySort(applyMix(all, mix), sort);
    const focus = focusOf(all, (ctx.params && ctx.params.kpi) || "");

    guard("build", {
      "14 مؤشراً بالضبط (بوابة strategy.kpis14)": all.length === 14,
      "معرفات 1..14 بالضبط":
        all.map((r) => r.id).join(",") === all.map((_r, i) => i + 1).join(","),
      "كل مستهدف > خط أساسه (بوابة kpi.target_gt_baseline)":
        all.every((r) => r.target > r.baseline),
      "حدود النسب [0,1] (بوابة kpi.pct_bounds)":
        all.filter((r) => r.pct).every((r) => r.baseline >= 0 && r.baseline <= 1
          && r.target >= 0 && r.target <= 1),
      "القيم الحالية غائبة بصدق (إنذار kpi.current_values)":
        sum.recordedCount === 0,
      "11 نسبية + 3 عددية (تكوين الإصدار المنشور)":
        sum.pctCount === 11 && sum.numCount === 3,
      "كل عدّاد له علامتان على قوسه":
        all.every((r) => r.segments.some((s) => s.role === "base")
          && r.segments.some((s) => s.role === "target")),
      "لوح العدّادات غير فارغ بعد الترشيح": board.length > 0,
    });

    const root = h("div", { class: "kpi5" });
    el.appendChild(root);

    /* ── ٤-أ) لافتة التبويب بالنمط الهندسي للهوية ───────────────────────── */
    const banner = h("div", { class: "kpi5-banner" },
      h("div", { class: "kpi5-banner-main" },
        h("h1", { class: "kpi5-title" }, "مؤشرات الأداء"),
        h("p", { class: "kpi5-lede" },
          "عدّاد نصف دائري لكل مؤشر استراتيجي: قوسه من خط الأساس إلى "
          + "المستهدف بعلامتين واضحتين، والقيمة الحالية معلنة كما هي في المصدر.")),
      h("p", { class: "kpi5-asof" }, "البيانات حتى ", sum.asOf));
    root.appendChild(banner);
    if (RH.brand && typeof RH.brand.pattern === "function") {
      ctx.onTeardown(RH.brand.pattern(banner, {
        opacity: 0.09, angle: 18, size: 128,
      }));
    }

    /* ── ٤-ب) الأرقام الكبرى: تكوين المحفظة المؤشرية ────────────────────── */
    const figs = h("div", {
      class: "tabfigs kpi5-figs", role: "group",
      "aria-label": "تكوين المؤشرات الاستراتيجية — كل رقم يفتح إبرازه",
    });
    const pAll = nounParts(sum.total, "indicator");
    const pPct = nounParts(sum.pctCount, "indicator");
    const pNum = nounParts(sum.numCount, "indicator");
    const figures = [
      {
        key: "all", label: "المؤشرات الاستراتيجية",
        value: pAll.num, unit: pAll.word,
        foot: "من خطة عمل المشروع",
        spec: () => overviewSpec(rel),
      },
      {
        key: "pct", label: "بصيغة " + TYPE_PCT_LONG,
        value: pPct.num, unit: pPct.word,
        foot: "المستهدفات بين " + sum.minPctTargetText + " و" + sum.maxPctTargetText,
        spec: () => typeSpec(rel, "pct"),
      },
      {
        key: "num", label: "بصيغة " + TYPE_NUM_LONG,
        value: pNum.num, unit: pNum.word,
        foot: "المقياس ينتهي عند المستهدف",
        spec: () => typeSpec(rel, "num"),
      },
      {
        key: "current", label: "القيم الحالية المسجَّلة",
        value: sum.recordedLabel, unit: null, tone: "pending",
        foot: NOT_RECORDED,
        spec: () => currentSpec(rel),
      },
    ];
    for (const f of figures) {
      const btn = h("button", {
        class: "tabfig kpi5-fig" + (f.tone ? " is-" + f.tone : ""),
        type: "button", "data-interactive": "",
        dataset: { fig: f.key },
        "aria-label": f.label + ": " + f.value + (f.unit ? " " + f.unit : "")
          + "؛ " + f.foot + "؛ افتح الإبراز",
      },
        h("span", { class: "tabfig-label" }, f.label),
        h("span", { class: "tabfig-value" },
          h("span", { class: "num tnum" }, f.value),
          f.unit ? h("span", { class: "unit" }, f.unit) : null),
        h("span", { class: "tabfig-foot" }, f.foot));
      btn.addEventListener("click", () => {
        ctx.highlight(Object.assign(f.spec(), { anchor: btn }));
      });
      figs.appendChild(btn);
    }
    root.appendChild(figs);

    /* ── ٤-ج) الشبكة العليا: العدّاد المكبَّر + بطاقة حقائق المؤشر ────────── */
    const topGrid = h("div", { class: "tabgrid is-3 kpi5-top" });
    root.appendChild(topGrid);

    const pos = all.indexOf(focus);
    const stepper = h("div", {
      class: "kpi5-step", role: "group", "aria-label": "تبديل المؤشر المكبَّر",
    },
      h("button", {
        class: "kpi5-step-btn", type: "button", "data-interactive": "",
        disabled: pos <= 0,
        "aria-label": "المؤشر السابق في العدّاد المكبَّر",
        onclick: () => ctx.update({ kpi: String(all[Math.max(0, pos - 1)].id) }),
      }, "→"),
      h("span", { class: "kpi5-step-pos tnum" },
        fmt.iso(fmt.int(pos + 1) + " من " + fmt.int(all.length))),
      h("button", {
        class: "kpi5-step-btn", type: "button", "data-interactive": "",
        disabled: pos >= all.length - 1,
        "aria-label": "المؤشر التالي في العدّاد المكبَّر",
        onclick: () => ctx.update({
          kpi: String(all[Math.min(all.length - 1, pos + 1)].id) }),
      }, "←"));

    const focusCard = panelCard({
      title: "العدّاد المكبَّر — المؤشر " + focus.idText,
      note: focus.scaleNote + " · " + NOT_RECORDED,
      cls: "kpi5-focus-card",
    });
    focusCard.head.appendChild(stepper);
    topGrid.appendChild(focusCard.card);

    focusCard.body.appendChild(h("h3", { class: "kpi5-focus-name" },
      typeBadge(focus, "kpi5-focus-type"), focus.name));

    const chartEl = h("div", { class: "tabchart kpi5-focus-chart" });
    focusCard.body.appendChild(chartEl);
    focusCard.body.appendChild(markRow(focus, "is-lg"));
    focusCard.body.appendChild(scaleRow(focus));

    /* ألوان العدّاد المكبَّر من الرموز الحية وقت البناء (لا وقت التحميل) */
    const ROLE = {
      /* المسار المحايد بلون الشعيرة المعايَرة: يبقى مقروءاً على السمتين معاً
         (‎--surface-3‎ الداكن يكاد يذوب في سطح البطاقة فيبدو القوس مبتوراً) */
      track: T.C.line,
      /* نطاق التحسن: صبغة ذهبية شفافة من قناة الرمز الحيّة، وبديلها الرمز نفسه */
      band: tint("--gold-rgb", 0.28) || T.C.gold,
      base: T.C.gold,
      target: T.C.goldHi,
    };
    const axisColor = focus.segments.map((s) => [s.stop, ROLE[s.role] || ROLE.track]);
    const bandWidth = Math.max(16, Math.round(28 * su));
    const gauge = ctx.chart("focus", chartEl);

    /** مركز القوس رأسياً ككسر من ارتفاع القماش — نصف الدائرة كله فوقه */
    const CY_FRAC = 0.82;
    /**
     * نصف قطر القوس بالبكسل من مقاس القماش الفعلي: ‎radius‎ النسبي في ECharts
     * يُحسب من ‎min(العرض, الارتفاع) ÷ 2‎ فيهدر نصف دائرةٍ عرضُها ضعف ارتفاعها.
     * يُعاد حسابه عند تغيّر المقاس (المستمع مسجَّل في تنظيف التبويب).
     */
    function fitRadius() {
      const cw = gauge.getWidth() || chartEl.clientWidth || 600;
      const ch = gauge.getHeight() || chartEl.clientHeight || 400;
      const pad = Math.round(30 * su) + 10;   /* فسحة تسميتَي طرفَي المقياس */
      return Math.max(60, Math.min(cw / 2 - pad, ch * CY_FRAC - pad));
    }

    const opt = Object.assign(T.base(su), {
      tooltip: Object.assign(T.tooltip(su), {
        formatter: () => T.ttMicro(
          "المؤشر " + focus.idText + " · " + MARK_TARGET, focus.targetText),
      }),
      series: [{
        type: "gauge",
        /* نصف دائرة علوية من ‎0°‎ (يمين) إلى ‎180°‎ (يسار): الصفر عند بداية
           السطر العربي وأعلى المقياس عند نهايته. ‎clockwise: false‎ إلزامي —
           بدونه يمسح ECharts النصف السفلي المخفي ولا يظهر قوس. */
        startAngle: 0,
        endAngle: 180,
        clockwise: false,
        center: ["50%", Math.round(CY_FRAC * 100) + "%"],
        radius: fitRadius(),
        min: 0,
        max: focus.max || 1,
        splitNumber: 1,
        axisLine: { lineStyle: { width: bandWidth, color: axisColor } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          show: true,
          distance: Math.round(bandWidth * 0.62) + 6,
          color: T.C.faint,
          fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, 12.5),
          formatter: (v) => kpiVal(focus, v),
        },
        /* **لا إبرة ولا قوس تقدم ما لم تُسجَّل قيمة حالية** (V3_SPEC §4-ب) */
        pointer: focus.recorded
          ? {
            show: true, icon: "rect", width: Math.max(4, Math.round(5 * su)),
            length: "62%", offsetCenter: [0, "-4%"],
            itemStyle: { color: T.C.green },
          }
          : { show: false },
        progress: focus.recorded
          ? { show: true, width: bandWidth, itemStyle: { color: T.C.green } }
          : { show: false },
        anchor: { show: false },
        title: {
          show: true, offsetCenter: [0, "-44%"],
          color: T.C.mut, fontFamily: "Cairo", fontSize: T.fs(su, 13.5),
        },
        detail: {
          show: true, offsetCenter: [0, "-20%"],
          color: focus.recorded ? T.C.ivory : T.C.gold,
          fontFamily: "IBM Plex Sans Arabic",
          fontWeight: focus.recorded ? 700 : 600,
          fontSize: T.fs(su, focus.recorded ? 30 : 21),
          formatter: () => focus.currentText,
        },
        data: [{ value: focus.recorded ? focus.current : 0, name: CURRENT_LABEL }],
        animation: !T.REDUCED,
      }],
    });
    gauge.setOption(opt, true);

    /* إعادة ملاءمة نصف القطر عند تغيّر المقاس — تُمرَّر **شجرة الخيارات كاملة**
       كي يبقى ما يلتقطه سجل الثيم مكتملاً فلا تفقد إعادةُ الصبغة خياراتها. */
    let fitTimer = null;
    function onWinResize() {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(() => {
        if (gauge.isDisposed()) return;
        const r = fitRadius();
        if (Math.abs(r - opt.series[0].radius) < 2) return;
        opt.series[0].radius = r;
        gauge.setOption(opt, true);
      }, 180);
    }
    window.addEventListener("resize", onWinResize, { passive: true });
    ctx.onTeardown(() => {
      clearTimeout(fitTimer);
      window.removeEventListener("resize", onWinResize);
    });

    onChartClick(ctx, gauge, () => {
      ctx.highlight(Object.assign(kpiSpec(rel, focus.id), { anchor: chartEl }));
    });

    /* بطاقة حقائق المؤشر المختار — نصٌّ بديل كامل للعدّاد وزر الإبراز */
    const facts = panelCard({
      title: "حقائق المؤشر",
      note: "كل قيمة من المصدر حرفياً",
      cls: "kpi5-facts-card",
    });
    topGrid.appendChild(facts.card);

    const dl = h("dl", { class: "kpi5-dl" });
    const factRows = [
      { k: "المعرف", v: focus.idText },
      { k: "النوع", v: focus.type },
      { k: "الصيغة", v: focus.typeLong },
      { k: MARK_BASE, v: focus.baseText, cls: "is-gold" },
      { k: MARK_TARGET, v: focus.targetText, cls: "is-gold" },
      { k: SPAN_LABEL, v: focus.spanText },
      { k: "موضع خط الأساس على المقياس", v: focus.basePosText },
      {
        k: CURRENT_LABEL,
        v: focus.recorded ? focus.currentText : NOT_RECORDED_SHORT,
        cls: focus.recorded ? null : "is-pending",
      },
    ];
    for (const row of factRows) {
      dl.appendChild(h("div", {
        class: "kpi5-dl-row" + (row.cls ? " " + row.cls : ""),
      },
        h("dt", {}, row.k),
        h("dd", { class: "tnum" }, row.v)));
    }
    facts.body.appendChild(dl);
    facts.body.appendChild(h("p", { class: "kpi5-facts-note" }, focus.note));
    facts.body.appendChild(h("div", { class: "kpi5-facts-act" },
      h("button", {
        class: "kpi5-btn", type: "button", "data-interactive": "",
        "aria-label": "إبراز المؤشر " + focus.id + ": " + focus.name,
        onclick: (ev) => ctx.highlight(Object.assign(
          kpiSpec(rel, focus.id), { anchor: ev.currentTarget })),
      }, "إبراز المؤشر")));

    /* ── ٤-د) لوح العدّادات الأربعة عشر (ثلاثة في الصف كحد أقصى) ─────────── */
    const boardGrid = h("div", { class: "tabgrid is-1 kpi5-board-grid" });
    const boardCard = panelCard({
      title: "عدّادات المؤشرات الاستراتيجية",
      note: "قوس من خط الأساس إلى المستهدف · بلا إبرة ما دامت القيمة الحالية "
        + "غير مسجّلة",
      cls: "kpi5-board-card",
    });
    boardGrid.appendChild(boardCard.card);
    root.appendChild(boardGrid);

    /* أدوات اللوح: ترشيح بالصيغة + ترتيب — تكتب حالتها في العنوان */
    const tools = h("div", { class: "kpi5-tools" });
    const chipGroup = (label, opts, current, param) => {
      const grp = h("div", {
        class: "kpi5-chips", role: "group", "aria-label": label,
      }, h("span", { class: "kpi5-chips-cap" }, label));
      for (const o of opts) {
        const on = o.id === current;
        grp.appendChild(h("button", {
          class: "kpi5-chip" + (on ? " is-on" : ""),
          type: "button", "data-interactive": "",
          "aria-pressed": on ? "true" : "false",
          onclick: () => ctx.update({ [param]: o.id || null }),
        }, o.text, o.count == null ? null
          : h("b", { class: "kpi5-chip-num tnum" }, fmt.int(o.count))));
      }
      return grp;
    };
    tools.appendChild(chipGroup("الصيغة", [
      { id: "", text: "الكل", count: sum.total },
      { id: "pct", text: TYPE_PCT_LONG, count: sum.pctCount },
      { id: "num", text: TYPE_NUM_LONG, count: sum.numCount },
    ], mix, "mix"));
    tools.appendChild(chipGroup("الترتيب", [
      { id: "", text: "بالمعرف" },
      { id: "span", text: "الأوسع " + SPAN_LABEL },
      { id: "base", text: "الأقرب انطلاقاً" },
    ], sort, "sort"));
    boardCard.body.appendChild(tools);

    const boardEl = h("div", {
      class: "kpi5-board", role: "group",
      "aria-label": "عدّادات المؤشرات — " + fmt.noun(board.length, "indicator"),
    });
    boardCard.body.appendChild(boardEl);

    for (const r of board) {
      const on = r.id === focus.id;
      const gbtn = h("button", {
        class: "kpi5-g-btn", type: "button", "data-interactive": "",
        dataset: { kpi: String(r.id) },
        /* الطبقة الأولى على العدّاد الصغير: تلميح مصغّر **سطران** (عنوان +
           قيمة واحدة) بالتلميح الأصلي للمتصفح — لا يغطي الرسم ولا يعترض النقر */
        title: r.name + "\n" + MARK_TARGET + ": " + r.targetText,
        "aria-label": "المؤشر " + r.id + ": " + r.name + " — " + r.typeLong
          + "؛ " + MARK_BASE + " " + r.baseText
          + "؛ " + MARK_TARGET + " " + r.targetText
          + "؛ " + NOT_RECORDED + "؛ افتح الإبراز",
        onclick: (ev) => ctx.highlight(Object.assign(
          kpiSpec(rel, r.id), { anchor: ev.currentTarget })),
      },
        h("span", { class: "kpi5-g-head" },
          h("span", { class: "kpi5-g-id tnum" }, r.idText),
          h("span", { class: "kpi5-g-name" }, r.name),
          typeBadge(r)),
        h("span", { class: "kpi5-g-wrap" }, gaugeSvg(r), gaugeCenter(r)),
        scaleRow(r),
        markRow(r));

      const zoom = h("button", {
        class: "kpi5-g-zoom", type: "button", "data-interactive": "",
        "aria-pressed": on ? "true" : "false",
        "aria-label": on
          ? "المؤشر " + r.id + " معروض في العدّاد المكبَّر"
          : "اعرض المؤشر " + r.id + " في العدّاد المكبَّر",
        onclick: () => ctx.update({ kpi: String(r.id) }),
      }, on ? "معروض" : "تكبير");

      boardEl.appendChild(h("article", {
        class: "kpi5-g-card" + (on ? " is-on" : ""),
        dataset: { kpi: String(r.id) },
      }, gbtn, zoom));
    }

    /* ملاحة الأسهم داخل اللوح — تنقّل مفاتيحي بين العدّادات */
    function onBoardKey(ev) {
      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      const btns = Array.prototype.slice.call(
        boardEl.querySelectorAll(".kpi5-g-btn"));
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      /* RTL: السهم الأيسر يتقدّم في القراءة */
      const next = ev.key === "ArrowLeft" ? i + 1 : i - 1;
      if (next < 0 || next >= btns.length) return;
      ev.preventDefault();
      btns[next].focus();
    }
    boardEl.addEventListener("keydown", onBoardKey);
    ctx.onTeardown(() => boardEl.removeEventListener("keydown", onBoardKey));

    /* ── ٤-هـ) مصفوفة المؤشرات ──────────────────────────────────────────── */
    const matrixGrid = h("div", { class: "tabgrid is-1 kpi5-matrix-grid" });
    const matrixCard = panelCard({
      title: "مصفوفة المؤشرات",
      note: "ترتيب الجدول يتبع أدوات اللوح أعلاه",
      cls: "kpi5-matrix-card",
    });
    matrixGrid.appendChild(matrixCard.card);
    root.appendChild(matrixGrid);

    const thead = h("thead", {}, h("tr", {},
      ["#", "المؤشر", "الصيغة", MARK_BASE, MARK_TARGET, SPAN_LABEL,
        "موضع الأساس", CURRENT_LABEL]
        .map((t) => h("th", { scope: "col" }, t))));

    const tbody = h("tbody", {});
    for (const r of board) {
      tbody.appendChild(h("tr", {
        class: "kpi5-row" + (r.id === focus.id ? " is-on" : ""),
        dataset: { kpi: String(r.id) },
      },
        h("th", { scope: "row", class: "tnum" }, r.idText),
        h("td", { class: "kpi5-row-name" },
          h("button", {
            class: "kpi5-row-btn", type: "button", "data-interactive": "",
            "aria-label": "إبراز المؤشر " + r.id + ": " + r.name,
            onclick: (ev) => ctx.highlight(Object.assign(
              kpiSpec(rel, r.id), { anchor: ev.currentTarget })),
          }, r.name)),
        h("td", {}, typeBadge(r)),
        h("td", { class: "tnum is-gold" }, r.baseText),
        h("td", { class: "tnum is-gold" }, r.targetText),
        h("td", { class: "tnum" }, r.spanText),
        h("td", { class: "tnum" }, r.basePosText),
        h("td", {},
          r.recorded
            ? h("span", { class: "tnum" }, r.currentText)
            : h("span", { class: "kpi5-na" }, NOT_RECORDED_SHORT))));
    }

    matrixCard.body.appendChild(h("div", { class: "kpi5-matrix-scroll" },
      h("table", { class: "kpi5-matrix" },
        h("caption", { class: "kpi5-matrix-cap" },
          fmt.noun(board.length, "indicator") + " معروضاً من "
          + fmt.noun(all.length, "indicator")
          + " · القيم الحالية تُدخل من الإدارة ولا تُحوَّل إلى صفر"),
        thead, tbody)));

    /* ── ٤-و) سطر الصدق أسفل اللوح ──────────────────────────────────────── */
    root.appendChild(h("p", { class: "kpi5-foot" },
      "المصدر: ", h("span", { class: "kpi5-foot-src" }, sum.source),
      " · ", sum.note,
      sum.calc ? " · تاريخ الحساب " + fmt.date(sum.calc) + "." : "."));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٥) التسجيل — يتخطى نفسه بغياب القشرة (بيئة اختبار الوحدة)
     ══════════════════════════════════════════════════════════════════════════ */

  if (RH.tabs && typeof RH.tabs.register === "function") {
    RH.tabs.register({
      id: "kpis",
      order: 5,
      title: "مؤشرات الأداء",
      /** النموذج النقي مكشوف للاختبار ولوحة الأوامر — لا حالة فيه ولا DOM */
      model: MODEL,
      build,
    });
  }
})();
