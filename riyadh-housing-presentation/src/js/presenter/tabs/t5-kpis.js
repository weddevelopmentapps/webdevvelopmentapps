/* ════════════════════════════════════════════════════════════════════════════
   t5-kpis.js — التبويب ٥: «مؤشرات الأداء» (V3_SPEC §4 و§4-ب · V3_CONTRACTS §4)
   ────────────────────────────────────────────────────────────────────────────
   الموجز الملزم لهذا التبويب — العميل طلب حرفياً «another tab for KPIs where
   we show **guages** not bars of the strategic KPIs»: أي **شبكة عدّادات** تعرض
   المؤشرات الاستراتيجية الأربعة عشر **معاً**، لا عدّاداً واحداً مكبَّراً بلوح
   تفاصيل مرساة وترقيم «1 من 14». البنية إذن ثلاث طبقات لا رابعة:

     ▸ **شريط الموجز** أعلى اللوح في سطر واحد مضغوط: ‎14 مؤشراً · 11 نسبي ·
       3 عددي · 0 من 14 قيمة حالية مسجّلة‎ — كل رقم زر حقيقي يفتح إبرازه،
       ويلازمه وسم الصدق الحرفي «القيمة الحالية غير مسجّلة — تُدخل من الإدارة».

     ▸ **شبكة العدّادات**: أربعة عشر بطاقة في شبكة متجاوبة **ثلاثة في الصف
       على 1920 واثنان على 1366** (وواحد على الشاشات الضيقة). كل بطاقة عدّاد
       نصف دائري مضغوط مرسوم SVG كوداً: قوس يقرأ من اليمين (الصفر) إلى اليسار
       (أعلى المقياس) على سنّة الاتجاه العربي، وفيه **علامتان واضحتان**
       (شاخص خط الأساس المجوف وعارضة المستهدف) وبينهما **نطاق التحسن المطلوب**
       بصبغة ذهبية شفافة؛ فوقه اسم المؤشر **مقصوصاً في سطرين** واسمه الكامل في
       ‎title‎، و**رقاقة نوع المؤشر (نسبي/عددي)**؛ وفي مركزه **الحالة الصريحة**
       «القيمة الحالية · غير مسجّلة» بلا إبرة وهمية إطلاقاً.

     ▸ **مصفوفة المؤشرات** أسفل الشبكة: الأربعة عشر صفاً بكل حقول المصدر.

   **لا ECharts في هذا التبويب**: العدّادات كلها SVG كودي بالهندسة ذاتها،
   فلا مثيل رسم واحد يحتكر الشاشة، ولا تلميح تحويم يحتاج قانون ‎T.tooltip‎.

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
     ١) تحويم على بطاقة العدّاد → تلميح المتصفح الأصلي: سطران (اسم المؤشر +
        قيمة المستهدف). لا يغطي الرسم ولا يعترض النقر.
     ٢) نقرة أولى (رقم في شريط الموجز · بطاقة عدّاد · صف المصفوفة)
        → ‎ctx.highlight‎: جملة واحدة + ≤3 أرقام + زر واحد، بحدّ ‎320‎ حرفاً
        يحرسه اختبار الوحدة ‎tests/unit/tab-kpis.test.mjs‎.
     ٣) زر النافذة → ملحق ‎kpi‎ بصفحته المناسبة وبحالة عودة يرمّزها المحرك.
     **لا لوح تفاصيل مرسى في التبويب**: التفصيل كله خلف النقرتين لا مرافقاً
     دائماً للشبكة — فالشاشة تبقى للعدّادات الأربعة عشر.

   اللون: **صفر لون مكتوب**، ولا لون في JS أصلاً: كل ألوان العدّادات والواجهة
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
  /** ما تَعِد به بطاقة العدّاد عند النقر — نافذة الإبراز لا الملحق مباشرةً */
  const CARD_HINT = "انقر: إبراز المؤشر";
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
      recordedLabel: fmt.ofTotal(recorded.length, list.length),
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
  function typeBadge(r) {
    return h("span", {
      class: "kpi5-type is-" + (r.pct ? "pct" : "num"),
      title: r.typeLong,
    }, r.typeChip);
  }

  /**
   * **العدّاد نصف الدائري المرسوم كوداً** (SVG) — هندسة واحدة لكل بطاقات
   * الشبكة الأربع عشرة. لا إبرة إلا حين تُسجَّل قيمة حالية: ‎recorded === false‎
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

  /**
   * مركز العدّاد: القيمة المسجَّلة أو **الحالة الصريحة** بلا إبرة.
   * العنوان + الرقاقة يقرآن معاً «القيمة الحالية · غير مسجّلة»، والجملة
   * الكاملة من المواصفة في ‎title‎ فلا تُقرأ الرقاقة قيمةً بحال.
   */
  function gaugeCenter(r) {
    return h("span", {
      class: "kpi5-g-center",
      title: r.recorded ? CURRENT_LABEL + ": " + r.currentText : NOT_RECORDED,
    },
      h("span", { class: "kpi5-g-cap" }, CURRENT_LABEL),
      h("b", {
        class: "kpi5-g-val" + (r.recorded ? " is-recorded" : " is-pending"),
      }, r.currentText));
  }

  /** سطر العلامتين تحت أي عدّاد — الشكل واللون والنص معاً */
  function markRow(r) {
    return h("span", { class: "kpi5-marks" },
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

  /**
   * **بطاقة عدّاد واحدة في الشبكة** — البطاقة كلها زر واحد: نقرة = إبراز.
   * ترتيبها الرأسي: سطر المعرف والرقاقة · اسم المؤشر مقصوصاً في سطرين واسمه
   * الكامل في ‎title‎ · العدّاد بمركزه المعلن · طرفا المقياس · العلامتان.
   */
  function gaugeCard(r, onOpen) {
    return h("button", {
      class: "kpi5-g-card", type: "button", "data-interactive": "",
      dataset: { kpi: String(r.id) },
      /* الطبقة الأولى: تلميح مصغّر **سطران** (عنوان + قيمة واحدة) بالتلميح
         الأصلي للمتصفح — لا يغطي الرسم ولا يعترض النقر */
      title: r.name + "\n" + MARK_TARGET + ": " + r.targetText,
      "aria-label": "المؤشر " + r.id + ": " + r.name + " — " + r.typeLong
        + "؛ " + MARK_BASE + " " + r.baseText
        + "؛ " + MARK_TARGET + " " + r.targetText
        + "؛ " + NOT_RECORDED + "؛ افتح الإبراز",
      onclick: (ev) => onOpen(r, ev.currentTarget),
    },
      h("span", { class: "kpi5-g-meta" },
        h("span", { class: "kpi5-g-id tnum" }, r.idText),
        typeBadge(r)),
      /* الاسم الكامل في ‎title‎ فالقصّ في سطرين لا يخفي معنى */
      h("span", { class: "kpi5-g-name", title: r.name }, r.name),
      h("span", { class: "kpi5-g-wrap" }, gaugeSvg(r), gaugeCenter(r)),
      scaleRow(r),
      markRow(r),
      h("span", { class: "kpi5-g-more" }, CARD_HINT));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٤) البناء
     ══════════════════════════════════════════════════════════════════════════ */

  function build(el, ctx) {
    const rel = ctx.release;

    const sum = summary(rel);
    const all = sum.list;
    const mix = mixOf(ctx.params);
    const sort = sortOf(ctx.params);
    const board = applySort(applyMix(all, mix), sort);

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
      "شبكة العدّادات غير فارغة بعد الترشيح": board.length > 0,
    });

    const root = h("div", { class: "kpi5" });
    el.appendChild(root);

    /** فاتح نافذة الإبراز لمؤشر — نقطة الدخول الوحيدة للطبقة الثانية */
    const openKpi = (r, anchor) =>
      ctx.highlight(Object.assign(kpiSpec(rel, r.id), { anchor }));

    /* ── ٤-أ) لافتة التبويب بالنمط الهندسي للهوية ───────────────────────── */
    const banner = h("div", { class: "kpi5-banner" },
      h("div", { class: "kpi5-banner-main" },
        h("h1", { class: "kpi5-title" }, "مؤشرات الأداء"),
        h("p", { class: "kpi5-lede" },
          "عدّاد نصف دائري لكل مؤشر استراتيجي، والأربعة عشر معاً في شبكة "
          + "واحدة: قوس كلٍّ من خط الأساس إلى المستهدف بعلامتين واضحتين، "
          + "والقيمة الحالية معلنة كما هي في المصدر.")),
      h("p", { class: "kpi5-asof" }, "البيانات حتى ", sum.asOf));
    root.appendChild(banner);
    if (RH.brand && typeof RH.brand.pattern === "function") {
      ctx.onTeardown(RH.brand.pattern(banner, {
        opacity: 0.09, angle: 18, size: 128,
      }));
    }

    /* ── ٤-ب) شريط الموجز: سطر واحد مضغوط، كل رقم فيه زر إبراز ──────────── */
    const strip = h("div", {
      class: "kpi5-strip", role: "group",
      "aria-label": "موجز المحفظة المؤشرية — كل رقم يفتح إبرازه",
    });
    const pAll = nounParts(sum.total, "indicator");
    const stripItems = [
      {
        key: "all", value: pAll.num, unit: pAll.word,
        label: "المؤشرات الاستراتيجية",
        spec: () => overviewSpec(rel),
      },
      {
        key: "pct", value: fmt.int(sum.pctCount), unit: TYPE_PCT,
        label: TYPE_PCT_LONG,
        spec: () => typeSpec(rel, "pct"),
      },
      {
        key: "num", value: fmt.int(sum.numCount), unit: TYPE_NUM,
        label: TYPE_NUM_LONG,
        spec: () => typeSpec(rel, "num"),
      },
      {
        key: "current", value: sum.recordedLabel, unit: "قيمة حالية مسجّلة",
        label: "القيم الحالية المسجَّلة", tone: "pending",
        spec: () => currentSpec(rel),
      },
    ];
    for (const s of stripItems) {
      const btn = h("button", {
        class: "kpi5-stat" + (s.tone ? " is-" + s.tone : ""),
        type: "button", "data-interactive": "",
        dataset: { stat: s.key },
        "aria-label": s.label + ": " + s.value + " " + s.unit + "؛ افتح الإبراز",
      },
        h("b", { class: "kpi5-stat-num tnum" }, s.value),
        h("span", { class: "kpi5-stat-unit" }, s.unit));
      btn.addEventListener("click", () => {
        ctx.highlight(Object.assign(s.spec(), { anchor: btn }));
      });
      strip.appendChild(btn);
    }
    /* وسم الصدق الحرفي ملازم للشريط — لا يُقرأ العدّاد بلا هذه الجملة */
    strip.appendChild(h("p", { class: "kpi5-strip-note" }, NOT_RECORDED));
    root.appendChild(strip);

    /* ── ٤-ج) شبكة العدّادات الأربعة عشر (٣ في الصف على 1920 · ٢ على 1366) ── */
    const boardGrid = h("div", { class: "tabgrid is-1 kpi5-board-grid" });
    const boardCard = panelCard({
      title: "عدّادات المؤشرات الاستراتيجية",
      note: "قوس كل عدّاد من خط الأساس إلى المستهدف · بلا إبرة ما دامت القيمة "
        + "الحالية غير مسجّلة · نقرة واحدة على أي عدّاد تفتح إبرازه",
      cls: "kpi5-board-card",
    });
    boardGrid.appendChild(boardCard.card);
    root.appendChild(boardGrid);

    /* أدوات الشبكة: ترشيح بالصيغة + ترتيب — تكتب حالتها في العنوان */
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

    for (const r of board) boardEl.appendChild(gaugeCard(r, openKpi));

    /* ملاحة الأسهم داخل الشبكة — تنقّل مفاتيحي بين العدّادات */
    function onBoardKey(ev) {
      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      const cards = Array.prototype.slice.call(
        boardEl.querySelectorAll(".kpi5-g-card"));
      const i = cards.indexOf(document.activeElement);
      if (i < 0) return;
      /* RTL: السهم الأيسر يتقدّم في القراءة */
      const next = ev.key === "ArrowLeft" ? i + 1 : i - 1;
      if (next < 0 || next >= cards.length) return;
      ev.preventDefault();
      cards[next].focus();
    }
    boardEl.addEventListener("keydown", onBoardKey);
    ctx.onTeardown(() => boardEl.removeEventListener("keydown", onBoardKey));

    /* ── ٤-د) مصفوفة المؤشرات ───────────────────────────────────────────── */
    const matrixGrid = h("div", { class: "tabgrid is-1 kpi5-matrix-grid" });
    const matrixCard = panelCard({
      title: "مصفوفة المؤشرات",
      note: "ترتيب الجدول يتبع أدوات الشبكة أعلاه",
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
        class: "kpi5-row",
        dataset: { kpi: String(r.id) },
      },
        h("th", { scope: "row", class: "tnum" }, r.idText),
        h("td", { class: "kpi5-row-name" },
          h("button", {
            class: "kpi5-row-btn", type: "button", "data-interactive": "",
            "aria-label": "إبراز المؤشر " + r.id + ": " + r.name,
            onclick: (ev) => openKpi(r, ev.currentTarget),
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

    /* ── ٤-هـ) سطر الصدق أسفل اللوح ─────────────────────────────────────── */
    root.appendChild(h("p", { class: "kpi5-foot" },
      "المصدر: ", h("span", { class: "kpi5-foot-src" }, sum.source),
      " · ", sum.note,
      sum.calc ? " · تاريخ الحساب " + fmt.date(sum.calc) + "." : "."));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٥) التسجيل — طابور ‎RH.tabs‎ المؤجَّل (‎ns.js‎) يستقبله في أي ترتيب
     ══════════════════════════════════════════════════════════════════════════ */

  RH.tabs.register({
    id: "kpis",
    order: 5,
    title: "مؤشرات الأداء",
    /** النموذج النقي مكشوف للاختبار ولوحة الأوامر — لا حالة فيه ولا DOM */
    model: MODEL,
    build,
  });
})();
