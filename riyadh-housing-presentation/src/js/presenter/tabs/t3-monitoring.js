/* ════════════════════════════════════════════════════════════════════════════
   t3-monitoring.js — التبويب ٣: «الرقابة» (V3_SPEC §4 · V3_CONTRACTS §4)
   ────────────────────────────────────────────────────────────────────────────
   البنية التي يفرضها الموجز الملزم، بالترتيب حرفياً:

     ▸ **الأرقام المفتاحية أعلى الشاشة** (صف ‎.tabfigs‎ — خمسة أرقام):
         19,651 زيارة · 3,617 مخالفة · 18 مراقباً · 113 قرار إغلاق ·
         ومعدل الامتثال ‎81.6٪‎ **موسوماً** «بانتظار اعتماد المنهجية».
       كل رقم زر حقيقي: نقرة واحدة تفتح نافذة الإبراز (جملة + ≤3 أرقام + زر).

     ▸ **خريطة المخالفات الكبيرة** بعرض اللوح كاملاً (‎.tabchart.is-tall‎):
         الأحياء الـ189 ملوّنة بمخالفات قطاعها المعتمدة (سلّم ‎seq-viol‎)،
         وفوقها **نقاط التركّز الأربعون** بمنظورين يبدّلهما المستخدم:
           «فقاعات» — قرص بحجم متناسب مع **مساحة** مؤشر الكثافة (جذر تربيعي)،
           «طبقة حرارية» — ‎heatmap‎ فوق أرضية محايدة كي تُقرأ الحرارة وحدها.
         وسيلة الإيضاح **في DOM لا في الرسم**: أزرار القطاعات الخمسة بألوانها
         وأعدادها الدقيقة + مفتاح أحجام النقاط — فتقرأ بلوحة المفاتيح وتتبع
         السمة من ‎var(--…)‎ مباشرة.

     ▸ **أعلى 5 فئات مخالفات** أعمدة أفقية مرجانية، **والسادسة فما فوقها
       مجمّعة «أخرى» بصدق**: بلون محايد (ليست فئة منفردة)، وبعدّ ما طُوي
       فيها وأسمائه معلنة في العنوان الفرعي وفي الشريحة وفي جدول القارئ.

   القوانين المطبقة حرفياً (بوابات القبول V3_CONTRACTS §7):
   • **صفر لون مكتوب**: كل لون رسم من ‎RH.viz.theme.C‎ (رموز حيّة تُقرأ وقت
     البناء لا وقت التحميل)، وكل لون واجهة ‎var(--…)‎ في
     ‎src/styles/tabs/monitoring.css‎. تبديل السمة يعيد بناء التبويب كاملاً.
   • **قانون التلميح**: كل ‎tooltip‎ من ‎T.tooltip(su)‎ (‎confine‎ + ‎ttPosition‎
     + 260px) ومحتواه ‎T.ttMicro‎ — سطران: عنوان + قيمة واحدة. لا سطر ثالث.
   • **ثلاث طبقات نقر**: تحويم → تلميح مصغّر · نقرة أولى → ‎ctx.highlight‎
     (حد 320 حرفاً يفرضه ‎highlight.js‎ ويثبته اختبار الوحدة) · الزر → ملحق
     ‎monitoring‎ بصفحته المناسبة وبحالة عودة مرمّزة.
   • **لا تلفيق**: مخالفات الأحياء **غير موجودة في المصدر** — المعروض قيمة
     القطاع المعتمدة بتصريح صريح في الجملة والوسم. ونقاط التركّز «مواقع
     توضيحية من سجل المنصة» بمؤشر كثافة **نسبي بلا وحدة معتمدة**، ووسمها
     الحرفي من ‎quarantine_resolved.hotspots.resolution‎ يلازم كل إبرازها.
     ومعدل الامتثال لا يُعرض إلا موسوماً بحالته من ‎compliance.status‎.
   • **الرسم كبير**: رسمان رئيسان فقط في اللوح، كل منهما بعرض الصف كاملاً
     (‎.tabchart‎ و‎.is-tall‎ للخريطة) — عنصران في الشبكة والحد أربعة.
   • **إتاحة**: أزرار حقيقية لكل تفاعل، ‎aria-pressed‎ لمفاتيح المنظور،
     جدول ‎.sr-only‎ بديل لكل رسم، و‎ctx.onTeardown‎ لكل مستمع ومؤقّت وطبقة.

   النموذج النقي معرَّف على ‎RH.presenter.tabModels.monitoring‎ بلا لمس DOM،
   فيُختبر بالملف الحقيقي في ‎tests/unit/tab-monitoring.test.mjs‎؛ والتسجيل
   يمر بطابور ‎RH.tabs‎ المؤجَّل المُعرَّف في ‎ns.js‎، فلا يعتمد على موضع الملف
   في ‎JS_ORDER‎ ولا يسقط صامتاً في بيئة اختبار الوحدة.
   ملاحظة معرّف: المحور اسمه «الرقابة» ومعرّفه القانوني في القائمة الخماسية
   ‎control‎ (V3_CONTRACTS §4-أ) بينما ملحقه ومَلَفّه يحملان اسم ‎monitoring‎ —
   يُسجَّل بالمعرف القانوني ولا يُخترع سادس.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** اسم الخريطة المسجَّلة في ECharts — ثابت عرض خاص بهذا التبويب لا بيانات */
  const MAP_NAME = "rh-riyadh-control";

  /** الترتيب القانوني للقطاعات (مرآة ‎geoutils.SECTOR_ORDER‎) — كسر التعادل */
  const SECTOR_ORDER = Object.freeze(["north", "east", "center", "west", "south"]);

  /** عدد الفئات المفصّلة قبل دلو التجميع، ومعرّف الدلو */
  const TOP_N = 5;
  const AGG_ID = "other";

  /** منظورا طبقة نقاط التركّز — يُكتب المختار في العنوان (‎?view=‎) */
  const VIEWS = Object.freeze(["bubbles", "heat"]);

  /** نص وسم الصدق الملزم لمعدل الامتثال (V3_CONTRACTS §7-9) */
  const PENDING_BADGE = "بانتظار اعتماد المنهجية";

  /** صيغ عدد ومعدود محلية لما لا تغطيه ‎NOUNS‎ المركزية */
  const LOCAL_NOUNS = Object.freeze({
    category: {
      one: "فئة واحدة", two: "فئتان", few: "فئات",
      many: "فئة", hundred: "فئة", zero: "لا فئات",
    },
    point: {
      one: "نقطة واحدة", two: "نقطتان", few: "نقاط",
      many: "نقطة", hundred: "نقطة", zero: "لا نقاط",
    },
  });

  /** صفحات ملحق «الرقابة» — مرآة ترتيب ‎ax-monitoring.js‎ حرفياً */
  const AX = Object.freeze({
    id: "monitoring",
    MONTHLY: "0",   /* النشاط الرقابي الشهري */
    TYPES: "1",     /* المخالفات حسب النوع */
    SECTORS: "2",   /* القطاعات: زيارات ومخالفات ومراقبون وإغلاق */
    METHOD: "3",    /* منهجية معدل الامتثال */
    PROV: "4",      /* الأصل والحساب */
  });

  /* ══════════════════════════════════════════════════════════════════════════
     1) النموذج النقي — لا DOM ولا ECharts ولا رموز CSS: يُختبر وحدةً كاملاً
     ══════════════════════════════════════════════════════════════════════════ */

  /** نسبة مئوية بتقريب المشروع الموحد (نصف لأعلى، منزلة واحدة) */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /** منظور مشروع أو الافتراضي — يحرس معامل العنوان من أي قيمة غريبة */
  function viewKeyOf(raw) {
    const k = String(raw || "");
    return VIEWS.indexOf(k) >= 0 ? k : "bubbles";
  }

  /**
   * الأرقام المفتاحية الخمسة أعلى التبويب — بترتيب الموجز الملزم.
   * كل قيمة من ‎release.metrics‎/‎release.compliance‎ حرفياً؛ التسميات القصيرة
   * تسميات عرض لا بيانات، والتسمية الكاملة المنشورة تُعرض في نافذة الإبراز.
   */
  function figures(rel) {
    const m = rel.metrics;
    const period = rel.meta.monitoring_period_label;
    const out = [
      {
        key: "visits", label: "الزيارات الميدانية",
        value: m.total_visits.value, unit: m.total_visits.unit,
        nounKey: "visit", tone: "plain", foot: "خلال " + period,
        full: m.total_visits.label,
      },
      {
        key: "violations", label: "المخالفات المسجلة",
        value: m.total_violations.value, unit: m.total_violations.unit,
        nounKey: "violation", tone: "deficit", foot: "خلال " + period,
        full: m.total_violations.label,
      },
      {
        key: "monitors", label: "المراقبون الميدانيون",
        value: m.total_monitors.value, unit: m.total_monitors.unit,
        nounKey: "monitor", tone: "plain",
        foot: "حتى " + rel.meta.data_as_of, full: m.total_monitors.label,
      },
      {
        key: "closures", label: "قرارات الإغلاق",
        value: m.total_closures.value, unit: m.total_closures.unit,
        nounKey: "decision", tone: "plain", foot: "خلال " + period,
        full: m.total_closures.label,
      },
    ];
    const comp = rel.compliance;
    if (comp && typeof comp.value === "number") {
      out.push({
        key: "compliance", label: "معدل الامتثال",
        value: comp.value, unit: comp.unit, isPct: true,
        /* لكنة «بانتظار الاعتماد» لا لون بيانات: القيمة لم تُعتمد منهجيتها */
        tone: comp.status === "pending_methodology" ? "pending" : "plain",
        badge: comp.status === "pending_methodology" ? PENDING_BADGE : null,
        foot: "في الجولات الرقابية", full: comp.label,
      });
    }
    /* النص المعروض والنص الدقيق (لقارئ الشاشة) لكل رقم */
    for (const f of out) {
      f.display = f.isPct ? fmt.pct(f.value) : fmt.int(f.value);
      f.exact = f.isPct ? fmt.pct(f.value) : fmt.noun(f.value, f.nounKey);
    }
    return out;
  }

  /**
   * صفوف فئات المخالفات: أعلى ‎topN‎ مفصّلة تنازلياً، وما دونها **دلو تجميع
   * صريح** يحمل أسماء ما طُوي فيه وعدّه. كسر التعادل بترتيب المصدر (حتمي).
   * ‎covered‎ يعلن هل غطّى مجموع الفئات إجمالي المخالفات المنشور.
   */
  function violationRows(rel, topN) {
    const n = topN == null ? TOP_N : topN;
    const src = (rel.violation_types || []).map((v, i) => ({
      id: v.id, name: v.name, count: v.count, ord: i,
    }));
    const total = rel.metrics.total_violations.value;
    const sorted = src.slice().sort((a, b) => b.count - a.count || a.ord - b.ord);
    const top = sorted.slice(0, n);
    const rest = sorted.slice(n);

    const rows = top.map((r, i) => ({
      id: r.id, name: r.name, count: r.count,
      share: pctOf(r.count, total), rank: i + 1,
      aggregate: false, members: [r.name],
    }));
    if (rest.length) {
      const sum = rest.reduce((a, r) => a + r.count, 0);
      rows.push({
        id: AGG_ID,
        name: aggregateLabel(rest.length),
        count: sum, share: pctOf(sum, total), rank: null,
        aggregate: true, members: rest.map((r) => r.name),
      });
    }
    const sum = src.reduce((a, r) => a + r.count, 0);
    return { rows, top, rest, total, sum, covered: sum === total };
  }

  /** تسمية دلو التجميع: «أخرى (فئة واحدة)» — لا تدّعي أنها فئة منفردة */
  function aggregateLabel(count) {
    return "أخرى (" + fmt.countNoun(count, LOCAL_NOUNS.category) + ")";
  }

  /** إفصاح ما طُوي في الدلو بالاسم — يُعرض دائماً بجوار الرسم لا في تلميح */
  function aggregateDetail(members) {
    if (!members || !members.length) return "";
    return "«أخرى» تجمع " + fmt.countNoun(members.length, LOCAL_NOUNS.category)
      + ": " + members.join(" · ") + ".";
  }

  /** صفوف القطاعات مرتبة تنازلياً بالمخالفات (كسر التعادل بالترتيب القانوني) */
  function sectorRows(rel, der) {
    const rows = (rel.sectors || []).map((s) => {
      const d = (der && der.sector && der.sector[s.id]) || null;
      return {
        id: s.id, name: s.name, short: s.short,
        violations: s.violations, visits: s.visits,
        monitors: s.monitors, closures: s.closures,
        share: d ? d.violations_share_pct
          : pctOf(s.violations, rel.metrics.total_violations.value),
        visitsShare: d ? d.visits_share_pct
          : pctOf(s.visits, rel.metrics.total_visits.value),
        ord: SECTOR_ORDER.indexOf(s.id),
      };
    });
    rows.sort((a, b) => b.violations - a.violations || a.ord - b.ord);
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  }

  /**
   * درجة السلّم لرتبة تصاعدية: الأدنى مخالفةً يأخذ الدرجة الأفتح والأعلى
   * الأغمق، ويُمدّ التوزيع على كامل عدد الدرجات المتاحة مهما تغيّر عدد
   * القطاعات (لا افتراض بأنها خمسة أبداً).
   */
  function rampIndex(rankAsc, count, steps) {
    if (steps <= 1) return 0;
    if (count <= 1) return steps - 1;
    const i = Math.round((rankAsc * (steps - 1)) / (count - 1));
    return Math.max(0, Math.min(steps - 1, i));
  }

  /** خريطة ‎معرّف القطاع → درجة السلّم‎ (0…steps-1) مبنية على المخالفات */
  function sectorRamp(rel, steps) {
    const asc = (rel.sectors || []).slice().sort((a, b) =>
      a.violations - b.violations
      || SECTOR_ORDER.indexOf(a.id) - SECTOR_ORDER.indexOf(b.id));
    const out = {};
    asc.forEach((s, i) => { out[s.id] = rampIndex(i, asc.length, steps); });
    return out;
  }

  /**
   * إحصاء نقاط التركّز من طبقة الجغرافيا: العدد ومدى مؤشر الكثافة وتوزيعه
   * على القطاعات. **لا قيمة مشتقة تُنسب إلى مخالفات** — المؤشر نسبي بلا وحدة.
   */
  function hotspotStats(geo) {
    const list = (geo && geo.hotspots) || [];
    const out = {
      count: list.length, min: null, max: null,
      bySector: {}, top: null,
    };
    for (const id of SECTOR_ORDER) out.bySector[id] = 0;
    for (const hs of list) {
      const d = hs.density;
      if (out.min == null || d < out.min) out.min = d;
      if (out.max == null || d > out.max) out.max = d;
      if (!(hs.sector in out.bySector)) out.bySector[hs.sector] = 0;
      out.bySector[hs.sector] += 1;
      if (!out.top || d > out.top.density) out.top = hs;
    }
    return out;
  }

  /**
   * قطر الفقاعة بالبكسل: **المساحة** متناسبة مع مؤشر الكثافة لا القطر —
   * وإلا ضخّم القطرُ الفروقَ بصرياً (خطأ إدراكي معروف). الجذر التربيعي
   * على المدى المطبَّع، وحدّان أدنى وأعلى مدرّجان مع ‎su‎.
   */
  function bubbleDiameter(density, min, max, su) {
    const s = su && su > 0 ? su : 1;
    const dMin = 9 * s, dMax = 34 * s;
    if (density == null || Number.isNaN(density)) return dMin;
    if (max == null || min == null || max <= min) return (dMin + dMax) / 2;
    const t = Math.max(0, Math.min(1, (density - min) / (max - min)));
    return dMin + (dMax - dMin) * Math.sqrt(t);
  }

  /* ── مواصفات الإبراز (الطبقة الثانية) — كائنات نقية يقيسها اختبار الوحدة ── */

  /** إبراز رقم مفتاحي: جملة واحدة + ثلاثة أرقام مساندة + زر واحد */
  function figureHighlight(rel, der, key) {
    const rows = sectorRows(rel, der);
    const worst = rows[0];
    const m = rel.metrics;
    const period = rel.meta.monitoring_period_label;

    if (key === "violations") {
      const V = violationRows(rel, TOP_N);
      const top = V.rows[0];
      return {
        title: "المخالفات المسجلة",
        sentence: "سُجّلت " + fmt.noun(m.total_violations.value, "violation")
          + " خلال " + period + "، أعلاها في " + worst.name + ".",
        stats: [
          { label: "مخالفات " + worst.short, value: fmt.int(worst.violations), tone: "neg" },
          { label: "حصته", value: fmt.pct(worst.share), tone: "neg" },
          { label: "أعلى فئة", value: fmt.int(top.count), tone: "neg" },
        ],
        note: "الفئة الأعلى: " + top.name + " — " + rel.meta.comparison_qualifier,
        appendix: {
          id: AX.id, params: { page: AX.TYPES },
          label: "المخالفات حسب النوع في الملحق",
        },
      };
    }

    if (key === "monitors") {
      return {
        title: "المراقبون الميدانيون",
        sentence: "يوزَّع " + fmt.noun(m.total_monitors.value, "monitor") + " على "
          + fmt.noun((rel.sectors || []).length, "sector") + " حتى "
          + rel.meta.data_as_of + ".",
        stats: [
          { label: "مراقبو " + worst.short, value: fmt.int(worst.monitors) },
          { label: "مخالفات " + worst.short, value: fmt.int(worst.violations), tone: "neg" },
          { label: "زياراته", value: fmt.int(worst.visits) },
        ],
        note: "التوزيع الكامل للمراقبين على القطاعات في ملحق الرقابة.",
        appendix: {
          id: AX.id, params: { page: AX.SECTORS },
          label: "جدول القطاعات في الملحق",
        },
      };
    }

    if (key === "closures") {
      return {
        title: "قرارات الإغلاق",
        sentence: "صدر " + fmt.noun(m.total_closures.value, "decision") + " خلال "
          + period + "، " + fmt.int(worst.closures) + " منها في " + worst.name + ".",
        stats: [
          { label: "إغلاق " + worst.short, value: fmt.int(worst.closures), tone: "neg" },
          {
            label: "حصته من الإغلاق",
            value: fmt.pct(pctOf(worst.closures, m.total_closures.value)), tone: "neg",
          },
          { label: "المخالفات", value: fmt.int(m.total_violations.value), tone: "neg" },
        ],
        note: rel.meta.comparison_qualifier,
        appendix: {
          id: AX.id, params: { page: AX.SECTORS },
          label: "جدول القطاعات في الملحق",
        },
      };
    }

    if (key === "compliance") {
      const comp = rel.compliance;
      const pending = comp.status === "pending_methodology";
      return {
        title: comp.label,
        sentence: pending
          ? "القيمة المورّدة " + fmt.pct(comp.value)
            + " لم تُعتمد منهجيتها بعد، فتُعرض موسومة ولا تُبنى عليها مقارنة."
          : "معدل الامتثال المعتمد " + fmt.pct(comp.value) + " في الجولات الرقابية.",
        stats: [
          { label: "القيمة المورّدة", value: fmt.pct(comp.value), tone: "gold" },
          { label: "الزيارات", value: fmt.int(m.total_visits.value) },
          { label: "المخالفات", value: fmt.int(m.total_violations.value), tone: "neg" },
        ],
        note: comp.note,
        appendix: {
          id: AX.id, params: { page: AX.METHOD },
          label: "منهجية معدل الامتثال في الملحق",
        },
      };
    }

    /* الافتراضي: الزيارات الميدانية */
    return {
      title: "الزيارات الميدانية",
      sentence: "نفّذت الفرق " + fmt.noun(m.total_visits.value, "visit")
        + " خلال " + period + ".",
      stats: [
        { label: "متوسط شهري", value: fmt.int(der.avg_monthly_visits) },
        { label: "زيارات " + worst.short, value: fmt.int(worst.visits) },
        { label: "حصته", value: fmt.pct(worst.visitsShare) },
      ],
      note: "المتوسط الشهري مشتقة منشورة: إجمالي الزيارات ÷ 12.",
      appendix: {
        id: AX.id, params: { page: AX.MONTHLY },
        label: "النشاط الرقابي الشهري في الملحق",
      },
    };
  }

  /** إبراز فئة مخالفات — الدلو المجمَّع يُعلن أنه تجميع لا فئة */
  function violationHighlight(rel, id) {
    const V = violationRows(rel, TOP_N);
    const row = V.rows.find((r) => r.id === id);
    if (!row) return null;

    if (row.aggregate) {
      return {
        title: row.name,
        sentence: "تجميع صريح لما دون أعلى "
          + fmt.countNoun(V.top.length, LOCAL_NOUNS.category)
          + " — ليس فئة منفردة ولا ينافس على الترتيب.",
        stats: [
          { label: "المطوي فيه", value: fmt.int(row.count), tone: "neg" },
          { label: "حصته", value: fmt.pct(row.share) },
          { label: "عدد الفئات", value: fmt.int(row.members.length) },
        ],
        note: aggregateDetail(row.members),
        appendix: {
          id: AX.id, params: { page: AX.TYPES },
          label: "المخالفات حسب النوع في الملحق",
        },
      };
    }

    return {
      title: row.name,
      sentence: "تمثّل هذه الفئة " + fmt.noun(row.count, "violation") + " من "
        + fmt.int(V.total) + " مخالفة مسجلة.",
      stats: [
        { label: "الحصة", value: fmt.pct(row.share), tone: "neg" },
        { label: "الترتيب", value: fmt.ofTotal(row.rank, V.rows.length) },
        { label: "الإجمالي", value: fmt.int(V.total), tone: "neg" },
      ],
      note: rel.meta.comparison_qualifier,
      appendix: {
        id: AX.id, params: { page: AX.TYPES },
        label: "المخالفات حسب النوع في الملحق",
      },
    };
  }

  /** إبراز قطاع — القيم كلها معتمدة على مستوى القطاع */
  function sectorHighlight(rel, der, id, titleOverride) {
    const row = sectorRows(rel, der).find((s) => s.id === id);
    if (!row) return null;
    return {
      title: titleOverride || row.name,
      sentence: "المعروض مخالفات " + row.name
        + " المعتمدة — لا تُنسب قيمة إلى مستوى الحي.",
      stats: [
        { label: "المخالفات", value: fmt.int(row.violations), tone: "neg" },
        { label: "الحصة", value: fmt.pct(row.share), tone: "neg" },
        { label: "الزيارات", value: fmt.int(row.visits) },
      ],
      note: rel.meta.map_disclaimer + " — التلوين بقيمة القطاع المعتمدة؛ "
        + "لا توجد مخالفات على مستوى الحي في المصدر.",
      appendix: {
        id: AX.id, params: { page: AX.SECTORS },
        label: "جدول القطاعات في الملحق",
      },
    };
  }

  /**
   * إبراز حي على الخريطة: **لا رقم على مستوى الحي إطلاقاً** — العنوان اسم
   * الحي والمضمون قيم قطاعه المعتمدة بتصريح صادق في الجملة والوسم.
   */
  function districtHighlight(rel, der, entry) {
    if (!entry || !entry.sectorRow) return null;
    return sectorHighlight(rel, der, entry.sectorRow.id, entry.name);
  }

  /** إبراز نقطة تركّز — وسم الصدق الحرفي من الإصدار يلازمها دائماً */
  function hotspotHighlight(rel, geo, index) {
    const list = (geo && geo.hotspots) || [];
    const hs = list[index];
    if (!hs) return null;
    const st = hotspotStats(geo);
    const sec = (rel.sectors || []).find((s) => s.id === hs.sector) || null;
    const resolved = rel.quarantine_resolved && rel.quarantine_resolved.hotspots;
    return {
      title: "نقطة تركّز رقابي" + (sec ? " · " + sec.name : ""),
      sentence: "موقع توضيحي من سجل المنصة، ومؤشر كثافته النسبي "
        + fmt.int(hs.density) + " ضمن مدى "
        + fmt.iso(fmt.int(st.min) + "–" + fmt.int(st.max)) + ".",
      stats: [
        { label: "مؤشر الكثافة", value: fmt.int(hs.density) },
        {
          label: "نقاط القطاع",
          value: fmt.int(st.bySector[hs.sector] || 0),
        },
        sec ? { label: "مخالفات القطاع", value: fmt.int(sec.violations), tone: "neg" }
          : { label: "إجمالي النقاط", value: fmt.int(st.count) },
      ],
      note: (resolved && resolved.resolution)
        || "مواقع توضيحية من سجل المنصة — مؤشر الكثافة نسبي بلا وحدة معتمدة.",
      appendix: {
        id: AX.id, params: { page: AX.PROV },
        label: "الأصل والحساب في الملحق",
      },
    };
  }

  /** كل مواصفات الإبراز التي يولّدها هذا التبويب — مادة فحص الحد 320 */
  function allHighlightSpecs(rel, der, geo, index) {
    const out = [];
    for (const f of figures(rel)) out.push(figureHighlight(rel, der, f.key));
    for (const r of violationRows(rel, TOP_N).rows) {
      const spec = violationHighlight(rel, r.id);
      if (spec) out.push(spec);
    }
    for (const s of (rel.sectors || [])) {
      const spec = sectorHighlight(rel, der, s.id);
      if (spec) out.push(spec);
    }
    for (const e of index || []) {
      const spec = districtHighlight(rel, der, e);
      if (spec) out.push(spec);
    }
    const hs = (geo && geo.hotspots) || [];
    for (let i = 0; i < hs.length; i++) {
      const spec = hotspotHighlight(rel, geo, i);
      if (spec) out.push(spec);
    }
    return out;
  }

  /** حارس اتساق تطويري — لا يُسقط اللوحة، ينبّه في الكونسول عند انجراف */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label] && typeof console !== "undefined") {
        console.warn("t3-monitoring/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  const MODEL = {
    AX, MAP_NAME, VIEWS, TOP_N, AGG_ID, SECTOR_ORDER, LOCAL_NOUNS, PENDING_BADGE,
    pctOf, viewKeyOf, figures, violationRows, aggregateLabel, aggregateDetail,
    sectorRows, rampIndex, sectorRamp, hotspotStats, bubbleDiameter,
    figureHighlight, violationHighlight, sectorHighlight, districtHighlight,
    hotspotHighlight, allHighlightSpecs,
  };

  /* الفضاء مُنشأ بحراسة كي لا يتسابق عليه بانو التبويبات الخمسة */
  RH.presenter.tabModels = RH.presenter.tabModels || {};
  RH.presenter.tabModels.monitoring = MODEL;

  /* ══════════════════════════════════════════════════════════════════════════
     2) أدوات بناء الواجهة (DOM) — بادئة الأصناف ‎mont-‎
     ══════════════════════════════════════════════════════════════════════════ */

  /** بطاقة رسم بالأصناف الجاهزة في ‎tabs.css‎ (لا نعيد اختراع التخطيط) */
  function chartCard(host, opts) {
    const o = opts || {};
    const head = h("div", { class: "tabcard-head" },
      h("div", { class: "mont-head-main" },
        h("div", { class: "tabcard-title" }, o.title),
        o.sub ? h("div", { class: "mont-sub" }, o.sub) : null),
      o.aside || (o.note ? h("div", { class: "tabcard-note" }, o.note) : null));
    const chartEl = h("div", {
      class: "tabchart" + (o.tall ? " is-tall" : ""),
      role: "img", "aria-label": o.aria || o.title,
    });
    const body = h("div", { class: "tabcard-body" }, chartEl);
    const card = h("div", {
      class: "tabcard mont-card" + (o.cls ? " " + o.cls : "")
        + (o.span2 ? " span-2" : ""),
    }, head, body);
    host.appendChild(card);
    return { card, head, body, chartEl };
  }

  /** جدول بديل لقارئ الشاشة — الرسم canvas فلا يُقرأ؛ الجدول يحمل القيم */
  function srTable(caption, columns, rows) {
    return h("div", { class: "sr-only" },
      h("table", {},
        h("caption", {}, caption),
        h("thead", {}, h("tr", {}, columns.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, rows.map((r) => h("tr", {},
          r.map((cell, i) => h(i === 0 ? "th" : "td",
            i === 0 ? { scope: "row" } : {}, cell)))))));
  }

  /** توصيل نقر مثيل ECharts مع فصل مضمون عند مغادرة التبويب */
  function onChartClick(ctx, chart, handler) {
    if (!chart) return;
    chart.on("click", handler);
    ctx.onTeardown(() => {
      try { if (!chart.isDisposed()) chart.off("click", handler); } catch (_e) { /* زال */ }
    });
  }

  /** زر شريحة صغير (مفاتيح المنظور · شرائح الفئات · وسيلة الإيضاح) */
  function chipButton(opts) {
    const b = h("button", {
      class: opts.cls, type: "button", "data-interactive": "",
      title: opts.title || null,
      "aria-label": opts.aria || null,
      "aria-pressed": opts.pressed == null ? null : (opts.pressed ? "true" : "false"),
    }, opts.children);
    if (typeof opts.onclick === "function") b.addEventListener("click", opts.onclick);
    return b;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) الخريطة: أرضية الأحياء + طبقة نقاط التركّز (فقاعات أو حرارية)
     ══════════════════════════════════════════════════════════════════════════ */

  /** هل يمكن رسم الخريطة في هذا البناء؟ (بيانات الحدود + دعم ECharts) */
  function mapReady(geo) {
    return !!(geo && geo.sectors && typeof echarts !== "undefined"
      && typeof echarts.registerMap === "function");
  }

  /** GeoJSON من فهرس الأحياء — الحلقات ‎[lat,lng]‎ تُقلب إلى ‎[lng,lat]‎ */
  function toGeoJson(index) {
    return {
      type: "FeatureCollection",
      features: index.map((e) => ({
        type: "Feature",
        properties: { name: e.name },
        geometry: {
          /* حلقات متعددة = أجزاء منفصلة للحي (لا ثقوب) — MultiPolygon */
          type: "MultiPolygon",
          coordinates: (e.rings || []).map((ring) =>
            [ring.map((pt) => [pt[1], pt[0]])]),
        },
      })),
    };
  }

  /**
   * يبني خريطة التبويب. المنظوران يتقاسمان الأرضية نفسها ويختلفان في طبقتها:
   *   bubbles → أحياء ملوّنة بسلّم مخالفات القطاع + أقراص بحجم مؤشر الكثافة
   *   heat    → أرضية محايدة (كي تُقرأ الحرارة وحدها) + طبقة ‎heatmap‎
   * كل الألوان من ‎T.C‎ (رموز حيّة)، ولا وسيلة إيضاح داخل الرسم — وسيلة
   * الإيضاح في DOM فتقرأ بلوحة المفاتيح وتتبع السمة مباشرة.
   */
  function buildMap(ctx, el, index, view) {
    const T = RH.viz.theme;
    const su = ctx.su;
    const rel = ctx.release;
    const der = ctx.derived;
    const geo = ctx.geo;
    const hs = hotspotStats(geo);
    const ramp = T.C.seqViol;
    const steps = sectorRamp(rel, ramp.length);
    const bySector = {};
    for (const s of rel.sectors || []) bySector[s.id] = s;
    const byName = new Map();
    for (const e of index) byName.set(e.name, e);

    echarts.registerMap(MAP_NAME, toGeoJson(index));

    const bubbles = view === "bubbles";
    /* أرضية المنظور الحراري محايدة: لون بيانات تحت طبقة حرارية = قراءة مزدوجة */
    const regions = index.map((e) => ({
      name: e.name,
      itemStyle: {
        areaColor: bubbles && e.sectorRow
          ? ramp[steps[e.sectorRow.id] || 0] : T.C.stage2,
      },
    }));

    const series = [{
      /* سلسلة الخريطة تُغذّي الأحياء بقيم قطاعها فيعمل التلميح والنقر عليها */
      type: "map",
      map: MAP_NAME,
      geoIndex: 0,
      name: "مخالفات القطاع",
      data: index.map((e) => ({
        name: e.name,
        value: e.sectorRow ? e.sectorRow.violations : 0,
      })),
    }];

    if (bubbles) {
      series.push({
        type: "scatter",
        coordinateSystem: "geo",
        geoIndex: 0,
        name: "نقاط التركّز",
        symbol: "circle",
        symbolSize: (v) => bubbleDiameter(v[2], hs.min, hs.max, su),
        /* قرص حبريّ محايد بحافة سطحية: يُقرأ على كل درجات السلّم المرجاني
           وفي السمتين معاً — والحجم وحده هو الترميز الكمّي. */
        itemStyle: {
          color: T.C.ivory, opacity: 0.5,
          borderColor: T.C.stage1, borderWidth: Math.max(1, 1.4 * su),
        },
        emphasis: {
          scale: 1.15,
          itemStyle: { color: T.C.ivory, opacity: 0.82, borderColor: T.C.stage1 },
        },
        z: 12,
        data: (geo.hotspots || []).map((p, i) => ({
          name: "نقطة تركّز",
          value: [p.lng, p.lat, p.density],
          hotspotIndex: i,
        })),
      });
    } else {
      series.push({
        type: "heatmap",
        coordinateSystem: "geo",
        geoIndex: 0,
        name: "كثافة نقاط التركّز",
        pointSize: Math.max(12, Math.round(20 * su)),
        blurSize: Math.max(16, Math.round(28 * su)),
        minOpacity: 0,
        maxOpacity: 0.86,
        z: 12,
        data: (geo.hotspots || []).map((p) => [p.lng, p.lat, p.density]),
      });
    }

    const option = Object.assign(T.base(su), {
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          if (!p) return "";
          if (p.seriesType === "scatter") {
            const arr = p.value || [];
            return T.ttMicro("نقطة تركّز رقابي", fmt.int(arr[2]), "مؤشر كثافة نسبي");
          }
          if (p.seriesType === "heatmap") {
            const arr = p.value || [];
            return T.ttMicro("كثافة نقاط التركّز", fmt.int(arr[2]), "مؤشر نسبي");
          }
          const e = byName.get(p.name);
          if (!e) return "";
          return T.ttMicro(p.name + " · " + e.sectorName, fmt.int(p.value), "مخالفة");
        },
      }),
      geo: {
        map: MAP_NAME,
        roam: false,
        aspectScale: 0.91,          /* جيب تمام خط عرض الرياض ≈ 0.908 */
        top: Math.round(10 * su),
        bottom: Math.round(14 * su),
        label: { show: false },
        /* شعيرة حبرية محايدة تفصل الأحياء على أي درجة تعبئة وفي السمتين */
        itemStyle: {
          areaColor: T.C.stage2,
          borderColor: T.C.plateEdge,
          borderWidth: 0.6,
        },
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: T.C.brandTeal, borderColor: T.C.stage1, borderWidth: 1 },
        },
        select: { disabled: true },
        regions,
        tooltip: { show: true },
      },
      series,
    });

    if (!bubbles) {
      /* السلّم الحراري يقود سلسلة الحرارة وحدها؛ وسيلة الإيضاح في DOM
         فيبقى ‎show:false‎ ولا يزاحم مساحة الرسم. */
      option.visualMap = {
        show: false,
        type: "continuous",
        min: hs.min == null ? 0 : hs.min,
        max: hs.max == null ? 1 : hs.max,
        seriesIndex: 1,
        calculable: false,
        inRange: { color: ramp.slice() },
      };
    }

    const chart = ctx.chart("map", el);
    chart.setOption(option, true);

    onChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      if (p.seriesType === "scatter") {
        const i = p.data && typeof p.data.hotspotIndex === "number"
          ? p.data.hotspotIndex : p.dataIndex;
        const spec = hotspotHighlight(rel, geo, i);
        if (spec) ctx.highlight(Object.assign(spec, { anchor: el }));
        return;
      }
      if (p.seriesType === "heatmap") return;   /* الحرارة تجميع لا كيان مفرد */
      const spec = districtHighlight(rel, der, byName.get(p.name));
      if (spec) ctx.highlight(Object.assign(spec, { anchor: el }));
    });

    return chart;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) أعلى فئات المخالفات — أعمدة أفقية مرجانية + دلو «أخرى» محايد
     ══════════════════════════════════════════════════════════════════════════ */

  function buildBars(ctx, el, V) {
    const T = RH.viz.theme;
    const su = ctx.su;
    const rows = V.rows;
    /* عرض عمود التسميات يُقاس بعرض **الرسم الفعلي** لا بوحدة القياس ‎su‎:
       البطاقة تملأ الصف كاملاً في كل المقاسات بينما ‎su‎ يتقلّص مع الشاشة،
       فتقليصه كان يقصّ «الاكتظاظ وتجاوز الطاقة الاستيعابية» عند 1366. */
    const w = (el && el.clientWidth) || 900;
    const labelW = Math.round(Math.max(150, Math.min(340, w * 0.28)));

    const chart = ctx.chart("violations", el);
    chart.setOption(Object.assign(T.base(su), {
      grid: {
        top: T.fs(su, 10), bottom: T.fs(su, 30),
        left: T.fs(su, 74), right: labelW + T.fs(su, 20),
      },
      xAxis: T.hValAxis(su, (v) => fmt.int(v)),
      yAxis: T.hCatAxis(su, rows.map((r) => r.name), labelW),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttMicro(rows[p.dataIndex].name,
          fmt.int(p.value), "مخالفة"),
      }),
      series: [{
        name: "المخالفات",
        type: "bar",
        barWidth: "58%",
        cursor: "pointer",
        itemStyle: { borderRadius: [6, 0, 0, 6] },
        /* الدلو المجمَّع بلون محايد: ليس فئة مخالفات منفردة فلا يأخذ المرجاني */
        data: rows.map((r) => ({
          value: r.count,
          itemStyle: { color: r.aggregate ? T.C.faint : T.C.coral },
          emphasis: { itemStyle: { color: r.aggregate ? T.C.mut : T.C.bad } },
        })),
        label: {
          show: true, position: "left", distance: T.fs(su, 8),
          color: T.C.ivory, fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, 14), fontWeight: 600,
          formatter: (p) => fmt.int(p.value),
        },
      }],
    }), true);

    onChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      const r = rows[p.dataIndex];
      if (!r) return;
      const spec = violationHighlight(ctx.release, r.id);
      if (spec) ctx.highlight(Object.assign(spec, { anchor: el }));
    });

    return chart;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) بناء التبويب
     ══════════════════════════════════════════════════════════════════════════ */

  function build(el, ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const geo = ctx.geo;
    const view = viewKeyOf(ctx.params && ctx.params.view);
    const V = violationRows(rel, TOP_N);
    const secRows = sectorRows(rel, der);
    const hs = hotspotStats(geo);
    const m = rel.metrics;

    /* متطابقات الإصدار التي يتكئ عليها التبويب كاملاً */
    const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0);
    guard("build", {
      "مجموع فئات المخالفات = الإجمالي المنشور": V.covered,
      "مجموع مخالفات القطاعات = الإجمالي": sum(rel.sectors, "violations")
        === m.total_violations.value,
      "مجموع زيارات القطاعات = الإجمالي": sum(rel.sectors, "visits")
        === m.total_visits.value,
      "مجموع مراقبي القطاعات = الإجمالي": sum(rel.sectors, "monitors")
        === m.total_monitors.value,
      "مجموع إغلاق القطاعات = الإجمالي": sum(rel.sectors, "closures")
        === m.total_closures.value,
      "مخالفات الجنوب تطابق مؤشرها": (rel.sectors.find((s) => s.id === "south") || {})
        .violations === m.south_violations.value,
      "أعلى القطاعات مخالفةً يطابق الترتيب المنشور":
        secRows[0].id === der.rankings.highest_violations,
      "نقاط التركّز أربعون عند توفر الطبقة": !geo || hs.count === 40,
    });

    const root = h("div", { class: "mont" });
    el.appendChild(root);

    /* ── الترويسة الهوياتية: النمط الهندسي للأمانة خلف عنوان المحور ──────── */
    const head = h("div", { class: "mont-banner" },
      h("div", { class: "mont-banner-main" },
        h("h1", { class: "mont-title" }, "الرقابة"),
        h("p", { class: "mont-lede" },
          "النشاط الرقابي الميداني خلال ", rel.meta.monitoring_period_label,
          ": حجم الزيارات والمخالفات، وأين تتركّز، وفي أي الفئات تقع.")),
      h("p", { class: "mont-asof" }, "البيانات حتى ", rel.meta.data_as_of));
    root.appendChild(head);
    if (RH.brand && typeof RH.brand.pattern === "function") {
      ctx.onTeardown(RH.brand.pattern(head, { opacity: 0.09, angle: 18, size: 128 }));
    }

    /* ── الأرقام المفتاحية الخمسة أعلى التبويب ───────────────────────────── */
    const figs = h("div", { class: "tabfigs mont-figs" });
    root.appendChild(figs);
    for (const f of figures(rel)) {
      const btn = h("button", {
        class: "tabfig mont-fig is-" + f.tone, type: "button",
        "data-interactive": "",
        "aria-label": f.full + " — " + f.exact
          + (f.badge ? "؛ " + f.badge : "") + "؛ افتح الإبراز",
      },
        h("span", { class: "tabfig-label" }, f.label),
        h("span", { class: "tabfig-value" },
          h("span", { class: "num tnum" }, f.display),
          f.isPct ? null : h("span", { class: "unit" }, f.unit)),
        f.badge
          ? h("span", { class: "mont-badge" },
            h("span", { class: "mont-badge-dot", "aria-hidden": "true" }), f.badge)
          : null,
        h("span", { class: "tabfig-foot" }, f.foot));
      btn.addEventListener("click", () => {
        ctx.highlight(Object.assign(figureHighlight(rel, der, f.key), { anchor: btn }));
      });
      figs.appendChild(btn);
    }

    /* ── الشبكة العليا: الخريطة المهيمنة + لوح ترتيب القطاعات (‎.is-3‎) ────── */
    const grid = h("div", { class: "tabgrid is-3 mont-grid" });
    root.appendChild(grid);

    /* (١) خريطة المخالفات ونقاط التركّز ─────────────────────────────────── */
    const viewKeys = h("div", {
      class: "mont-views", role: "group", "aria-label": "منظور نقاط التركّز",
    });
    const VIEW_LABELS = { bubbles: "فقاعات", heat: "طبقة حرارية" };
    const VIEW_TITLES = {
      bubbles: "أقراص بحجم مؤشر الكثافة فوق أحياء ملوّنة بمخالفات قطاعها",
      heat: "طبقة حرارية من نقاط التركّز فوق أرضية محايدة",
    };
    for (const k of VIEWS) {
      const on = k === view;
      viewKeys.appendChild(chipButton({
        cls: "mont-view" + (on ? " is-on" : ""),
        pressed: on, title: VIEW_TITLES[k],
        children: [VIEW_LABELS[k]],
        onclick: () => { if (k !== view) ctx.update({ view: k === "bubbles" ? null : k }); },
      }));
    }

    const mapCard = chartCard(grid, {
      title: "خريطة المخالفات ونقاط التركّز",
      sub: hs.count
        ? "أحياء الرياض بقيمة مخالفات قطاعها المعتمدة · و"
          + fmt.countNoun(hs.count, LOCAL_NOUNS.point) + " تركّز من سجل المنصة"
        : "أحياء الرياض بقيمة مخالفات قطاعها المعتمدة",
      aria: "خريطة أحياء الرياض ملوّنة بمخالفات القطاع، وفوقها نقاط التركّز "
        + "الرقابي بحجم مؤشر كثافتها",
      aside: viewKeys,
      tall: true, cls: "mont-map",
    });

    if (!mapReady(geo) || !RH.viz.geoutils) {
      /* غياب صادق لا شاشة فارغة ولا خريطة مختلقة (V3_CONTRACTS §7-9) */
      mapCard.body.removeChild(mapCard.chartEl);
      mapCard.body.appendChild(h("div", { class: "mont-missing" },
        h("b", {}, "حدود الأحياء غير مضمّنة في هذا البناء"),
        h("span", {}, "أعد البناء عبر build.py كي تُحقن data/riyadh-geo.json — "
          + "ولا تُرسم خريطة تقريبية بديلة.")));
    } else {
      const index = RH.viz.geoutils.districtIndex(geo, rel, der);

      /* مفتاح الطبقة تحت الخريطة: الحجم أو التدرّج الحراري — لا لون فيه من
         JS، الأقراص تأخذ قياسها من ‎bubbleDiameter‎ نفسها وألوانها من CSS. */
      if (hs.count) {
        const sizeKey = h("div", {
          class: "mont-legend", role: "group",
          "aria-label": "مفتاح طبقة نقاط التركّز",
        }, h("span", { class: "mont-legend-cap" },
          view === "bubbles"
            ? "حجم النقطة = مؤشر الكثافة النسبي"
            : "شدّة الحرارة = مؤشر الكثافة النسبي"));
        if (view === "bubbles") {
          const mid = Math.round((hs.min + hs.max) / 2);
          for (const d of [hs.min, mid, hs.max]) {
            /* القياس نفسه الذي يمرّره الرسم (‎ctx.su‎) وإلا كذب المفتاح على
               الشاشات الضيقة حيث تصغر النقاط ولا يصغر القرص المرجعي. */
            const px = Math.round(bubbleDiameter(d, hs.min, hs.max, ctx.su));
            sizeKey.appendChild(h("span", { class: "mont-size" },
              h("span", {
                class: "mont-dot", "aria-hidden": "true",
                style: { inlineSize: px + "px", blockSize: px + "px" },
              }),
              h("span", { class: "mont-size-val tnum" }, fmt.int(d))));
          }
        } else {
          sizeKey.appendChild(h("span", { class: "mont-heatbar", "aria-hidden": "true" }));
          sizeKey.appendChild(h("span", { class: "mont-size-val tnum" },
            fmt.iso(fmt.int(hs.min) + "–" + fmt.int(hs.max))));
        }
        sizeKey.appendChild(h("span", { class: "mont-legend-note" },
          fmt.countNoun(hs.count, LOCAL_NOUNS.point) + " من سجل المنصة"));
        mapCard.body.appendChild(sizeKey);
      }

      mapCard.body.appendChild(h("p", { class: "mont-note" },
        rel.meta.map_disclaimer,
        " — لا توجد مخالفات على مستوى الحي في المصدر، فالتلوين بقيمة القطاع ",
        "المعتمدة؛ ونقاط التركّز مواقع توضيحية من سجل المنصة ومؤشر كثافتها ",
        "نسبي بلا وحدة معتمدة."));

      try {
        buildMap(ctx, mapCard.chartEl, index, view);
      } catch (e) {
        if (typeof console !== "undefined") console.warn("الخريطة:", e && e.message);
      }
    }

    /* (٢) لوح ترتيب القطاعات — مفتاح ألوان الخريطة وجدولها المرتّب معاً ─── */
    const rampSteps = sectorRamp(rel, 5);
    const sideBody = h("div", { class: "tabcard-body mont-side-body" });
    grid.appendChild(h("div", { class: "tabcard mont-card mont-side" },
      h("div", { class: "tabcard-head" },
        h("div", { class: "mont-head-main" },
          h("div", { class: "tabcard-title" }, "القطاعات حسب المخالفات"),
          h("div", { class: "mont-sub" },
            view === "bubbles"
              ? "لون الشريط = لون أحياء القطاع على الخريطة"
              : "الأرضية محايدة في المنظور الحراري — الترتيب كما هو")),
        h("div", { class: "tabcard-note" }, "انقر قطاعاً لإبرازه")),
      sideBody));

    sideBody.appendChild(srTable(
      "المخالفات والزيارات ونقاط التركّز حسب القطاع",
      ["القطاع", "المخالفات", "الحصة", "الزيارات", "المراقبون",
        "قرارات الإغلاق", "نقاط التركّز"],
      secRows.map((s) => [s.name, fmt.int(s.violations), fmt.pct(s.share),
        fmt.int(s.visits), fmt.int(s.monitors), fmt.int(s.closures),
        fmt.int(hs.bySector[s.id] || 0)])));

    const rankList = h("ul", { class: "mont-rank" });
    const maxViol = secRows[0] ? secRows[0].violations : 1;
    secRows.forEach((s, i) => {
      const pctW = maxViol > 0 ? (s.violations / maxViol) * 100 : 0;
      rankList.appendChild(h("li", {}, chipButton({
        cls: "mont-rank-row",
        aria: s.name + " — " + fmt.noun(s.violations, "violation")
          + " (" + fmt.pct(s.share) + ")، و"
          + fmt.noun(s.visits, "visit") + "، و"
          + fmt.countNoun(hs.bySector[s.id] || 0, LOCAL_NOUNS.point)
          + " تركّز؛ افتح الإبراز",
        children: [
          /* رتبة بالنظام الرقمي الموحد للمنصة (لاتيني) — لا تناوب أنظمة */
          h("span", { class: "mont-rank-num", "aria-hidden": "true" },
            fmt.int(i + 1)),
          h("span", { class: "mont-rank-main" },
            h("span", { class: "mont-rank-top" },
              h("span", { class: "mont-rank-name" }, s.name),
              h("span", { class: "mont-rank-val tnum" }, fmt.int(s.violations))),
            h("span", { class: "mont-rank-bar", "aria-hidden": "true" },
              h("span", {
                class: "mont-rank-fill" + (view === "bubbles" ? "" : " is-muted"),
                dataset: { step: String((rampSteps[s.id] || 0) + 1) },
                style: { inlineSize: pctW.toFixed(1) + "%" },
              })),
            h("span", { class: "mont-rank-foot" },
              h("span", {}, "الحصة ", fmt.pct(s.share)),
              h("span", {}, fmt.int(s.visits), " زيارة"),
              h("span", {}, fmt.int(hs.bySector[s.id] || 0), " نقطة تركّز"))),
        ],
        onclick: (ev) => {
          const spec = sectorHighlight(rel, der, s.id);
          if (spec) ctx.highlight(Object.assign(spec, { anchor: ev.currentTarget }));
        },
      })));
    });
    sideBody.appendChild(rankList);
    sideBody.appendChild(h("p", { class: "mont-note" },
      "المجموع ", fmt.noun(m.total_violations.value, "violation"), " و",
      fmt.noun(m.total_visits.value, "visit"), " و",
      fmt.noun(m.total_monitors.value, "monitor"), " — كلها من مؤشرات الإصدار ",
      "المعتمدة."));

    /* (٣) أعلى فئات المخالفات ───────────────────────────────────────────── */
    const grid2 = h("div", { class: "tabgrid is-1 mont-grid" });
    root.appendChild(grid2);
    const agg = V.rows.find((r) => r.aggregate) || null;
    const barCard = chartCard(grid2, {
      title: "أعلى فئات المخالفات",
      sub: "أعلى " + fmt.countNoun(V.top.length, LOCAL_NOUNS.category)
        + " مفصّلة" + (agg ? "، وما دونها مجمَّع بصدق في «أخرى»" : ""),
      note: V.covered
        ? "مجموع الفئات = " + fmt.int(V.total) + " مخالفة (الإجمالي المنشور)"
        : "مجموع الفئات " + fmt.int(V.sum) + " من " + fmt.int(V.total),
      aria: "أعمدة أفقية لأعلى فئات المخالفات تنازلياً"
        + (agg ? "، وآخرها دلو تجميع «أخرى»" : ""),
      span2: true, cls: "mont-bars",
    });

    barCard.body.appendChild(srTable(
      "المخالفات حسب الفئة",
      ["الفئة", "عدد المخالفات", "الحصة من الإجمالي"],
      V.rows.map((r) => [
        r.aggregate ? r.name + " — " + r.members.join(" · ") : r.name,
        fmt.int(r.count), fmt.pct(r.share)])));

    /* شرائح الفئات: حصص مقروءة + مسار نقر متاح بلوحة المفاتيح للرسم نفسه */
    const chips = h("div", {
      class: "mont-chips", role: "group", "aria-label": "فئات المخالفات وحصصها",
    });
    const focusType = String((ctx.params && ctx.params.type) || "");
    for (const r of V.rows) {
      chips.appendChild(chipButton({
        cls: "mont-chip" + (r.aggregate ? " is-agg" : "")
          + (r.id === focusType ? " is-on" : ""),
        aria: r.name + " — " + fmt.noun(r.count, "violation")
          + " (" + fmt.pct(r.share) + ")"
          + (r.aggregate ? " — تجميع لا فئة منفردة" : "") + "؛ افتح الإبراز",
        title: r.aggregate ? aggregateDetail(r.members) : r.name,
        children: [
          h("span", { class: "mont-chip-name" }, r.name),
          h("span", { class: "mont-chip-val tnum" }, fmt.pct(r.share)),
        ],
        onclick: (ev) => {
          const spec = violationHighlight(rel, r.id);
          if (spec) ctx.highlight(Object.assign(spec, { anchor: ev.currentTarget }));
        },
      }));
    }
    barCard.body.appendChild(chips);
    if (agg) {
      barCard.body.appendChild(h("p", { class: "mont-note" },
        aggregateDetail(agg.members),
        " ويُعرض بلون محايد لأنه دلو تجميع لا فئة مخالفات منفردة."));
    }

    try {
      buildBars(ctx, barCard.chartEl, V);
    } catch (e) {
      if (typeof console !== "undefined") console.warn("فئات المخالفات:", e && e.message);
    }

    /* ── ذيل التبويب: التحفظ المرجعي + المسار الصريح إلى الملحق ──────────── */
    const foot = h("div", { class: "mont-foot" },
      h("p", { class: "mont-foot-note" },
        rel.meta.comparison_qualifier, " · كل القيم من الإصدار المنشور ",
        h("span", { class: "ltr" }, rel.release.id), "."),
      h("button", {
        class: "mont-ax", type: "button", "data-interactive": "",
        onclick: () => ctx.openAppendix(AX.id, { page: AX.MONTHLY }),
      }, h("span", {}, "الملحق التحليلي: الرقابة — السجل والتفاصيل"),
        h("span", { class: "mont-ax-arrow", "aria-hidden": "true" }, "←")));
    root.appendChild(foot);

    /* ── وصول عميق: ‎#/tab/control?sector=…‎ أو ‎?type=…‎ ─────────────────────
       يفتح نافذة الإبراز المقابلة بعد اكتمال الطلاء؛ ومعامل مجهول يُتجاهل
       بصمت (لا شاشة خطأ في لوحة عرض حيّة). */
    const focusSector = String((ctx.params && ctx.params.sector) || "");
    if (focusSector || focusType) {
      const tid = setTimeout(() => {
        const spec = focusSector
          ? sectorHighlight(rel, der, focusSector)
          : violationHighlight(rel, focusType);
        if (spec) ctx.highlight(spec);
      }, 60);
      ctx.onTeardown(() => clearTimeout(tid));
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) التسجيل — طابور ‎RH.tabs‎ المؤجَّل (‎ns.js‎) يستقبله في أي ترتيب
     ══════════════════════════════════════════════════════════════════════════ */

  RH.tabs.register({
    id: "control",
    order: 3,
    title: "الرقابة",
    /** النموذج النقي مكشوف للاختبار ولوحة الأوامر — لا حالة فيه ولا DOM */
    model: MODEL,
    build,
  });
})();
