/* ════════════════════════════════════════════════════════════════════════════
   s04-control.js — القسم 4: «الرقابة الميدانية» — مركز قيادة الإنفاذ
   ────────────────────────────────────────────────────────────────────────────
   لوحة قيادة كثيفة (عقد V2_CONTRACTS §1 — order:4, id:"control", backdrop:"control"):

     ▸ شريط خمسة مؤشرات كبرى أعلى الشاشة — كل رقم قابل للنقر يفتح بطاقة
       «الأصل والمنهجية» (القيمة الدقيقة، المصدر بورقته ومرساته للخام،
       الصيغة المعتمدة بإصدارها للمشتقات، والتحفظات كما وردت في الإصدار):
         1. الزيارات الميدانية          19,651 زيارة  (بمتوسط 1,638 زيارة شهرياً)
         2. المخالفات المسجلة           3,617 مخالفة  (مرجاني — خلل حصراً؛
                                        37.8٪ منها في قطاع الجنوب)
         3. المراقبون الميدانيون        18 مراقباً    (أخضر — قدرة رقابية)
         4. قرارات الإغلاق              113 قراراً    (حياد — إجراء إنفاذ لا خلل)
         5. معدل الامتثال               81.6٪ موسوماً ذهبياً «قيمة مورّدة —
                                        بانتظار اعتماد المنهجية» (compliance.status)

     ▸ شبكة رسوم تملأ ما تبقى من الشاشة (صفان + عمود رؤى ممتد):
         صف 1: النشاط الرقابي الشهري (اللوحتان المكدستان — زيارات أعلى
                ومخالفات أسفل، لا محاور مزدوجة أبداً — بمفتاح تبديل
                «شهري/تراكمي»؛ نقر شهر يفتح ملف الشهر الكامل) ·
                أنواع المخالفات الست (أفقي مرجاني بتسميات كاملة —
                نقر نوع يفتح ملفه ضمن ترتيب باريتو)
         صف 2: المخالفات قطاعياً بوسم المراقبين + مبدّل مقياس مدمج
                (مخالفات/مراقبون/إغلاقات — إعادة تلوين بلا هدم؛ نقر عمود
                يفتح ملف القطاع الرقابي الكامل) ·
                خريطة الرياض الحقيقية (layer=violations + نقاط التركّز
                الرقابي الأربعين، مع مبدّل طبقة «مخالفات/مراقبون» ومفتاح
                إظهار النقاط؛ نقر حي يفتح بطاقته) ·
                أعلى 5 أحياء بالمخالفات ضمن العينة المورّدة (بوسم العينة
                وقاعدة الترتيب الحرفيين من الإصدار)

     ▸ عمود رؤى insight_panels.sections.control + بطاقة «توزيع القدرة
       الرقابية» (مراقبو كل قطاع نقاطاً خضراء + عبء المخالفات لكل مراقب
       شريطاً مرجانياً — المسار المفاتيحي الكامل إلى ملفات القطاعات) +
       زر ملحق الرقابة (سجل المراقبين الـ18 يعيش في الملحق حصراً بوسم
       «قيد المطابقة» — لا يظهر في هذه اللوحة إطلاقاً) + سطر الحداثة.

     ▸ وصول عميق عبر معاملات المسار (عقد ctx.params — تُقرأ ولا تُكتب):
         ‎#/section/control?sector=south‎     يفتح ملف قطاع الجنوب مباشرة
         ‎#/section/control?month=2026-03‎    يفتح ملف شهر مارس 2026
         ‎#/section/control?vtype=overcrowding‎ يفتح ملف نوع المخالفة
         ‎#/section/control?measure=closures‎ يبدأ الأعمدة القطاعية بالإغلاقات
         ‎#/section/control?mlayer=inspectors‎ يبدأ الخريطة بطبقة المراقبين
       معامل غير صالح يُتجاهل بصمت — لا شاشات خطأ في مسرح العرض.

     ▸ دورة تركيز مفاتيحية مكتملة: إغلاق أي بطاقة تفاصيل (بأي بوابة من
       بواباتها الثلاث Escape/زر/خلفية) يعيد التركيز إلى العنصر الذي فتحها —
       مراقب طفرات على جذر القسم يُفصل فور الإصابة وعند الهدم.

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل رقم من release.json/riyadh-geo.json (عبر ctx.release/
     ctx.derived/ctx.geo) — وكل رقم ظاهر عبر RH.core.fmt حصراً (تطابق العدد
     والمعدود عبر fmt.noun/countNoun، عزل اتجاهي عبر fmt.iso/fmt.pct).
     الحسابات الشفافة القليلة (مخالفات لكل مراقب، حصة الإغلاق من الزيارات)
     تُجرى بمرآة تقريب derive الرسمية وتُوسم «حساب شفاف» بصيغتها المعلنة.
   • كل نص إصدار يُبنى بعقد dom.h النصي (textContent) — لا innerHTML لمحتوى
     الإصدار إطلاقاً؛ نصوص تلميحات الرسوم تمر عبر theme.esc داخل مكتبة
     charts2 وgeomap ذاتيهما.
   • منظومة المعنى: أخضر=قدرة رقابية نتحكم بها (زيارات/مراقبون)، مرجاني=
     مخالفات/خلل حصراً، ذهبي=وسوم «بانتظار الاعتماد» حصراً، أزرق=فئة
     ثانوية (قرارات الإغلاق — إجراء إنفاذ لا خلل). لا gauges دائرية،
     لا KPI بأيقونات، لا محاور مزدوجة.
   • جدول المراقبين (18 اسماً — مجاميعه تخالف الإجماليات المعتمدة) لا يُدرج
     هنا إطلاقاً: زر الملحق يقود إليه بوسم «قيد المطابقة» (قرار §2 من
     REVAMP_SPEC حرفياً).
   • كل الرسوم عبر مُنشئي RH.viz.charts2 القانونيين بمفتاح مثيلات "control"
     كي لا تصطدم بمثيلات الملخص التنفيذي (key:"summary")، والخريطة عبر
     RH.viz.geomap.render مع destroy إلزامي في التنظيف.
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (أزرار حقيقية أو role=button
     بمعالجة Enter/مسافة) وموسوم data-interactive كي لا يبتلع جهاز التقديم
     ضغطاته (عقد الملاحة §8)؛ Escape يغلق بطاقة التفاصيل (عقد ctx.openDetail).
   • prefers-reduced-motion محترم: العد التصاعدي عبر RH.viz.motion (قيمة
     نهائية فورية عند التقليل)، وانتقالات CSS تُصفَّر في control.css.
   • التنظيف عبر ctx.onTeardown: هدم الخريطة، فصل مراقبي المقاس والطفرات،
     وفصل مستمعي نقر مثيلات ECharts (المثيلات تعمّر في سجل الثيم أطول من
     DOM القسم) — مستمعو عناصر القسم ذاته تسقط مع هدم DOM.
   • 16:9 يتسع دون تمرير عند 1920×1080 بوحدة ‎--su؛ الفيضان الرأسي في وضع
     اللوحة يُحل بتمرير داخلي في جسم القسم حصراً (control.css) — المسرح
     لا يتمرر أفقياً أبداً.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* نسبة مئوية وتقريب بنفس مرآة بايثون (نصف لأعلى) — المرجع الرسمي الوحيد
     لأي حساب شفاف يظهر في هذه اللوحة */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);
  const round0 = (v) => RH.data.derive.roundHalfUp(v, 0);

  /* ──────────────────────────────────────────────────────────────────────────
     ثوابت عرض (لا قيم بيانات إطلاقاً)
     ────────────────────────────────────────────────────────────────────────── */

  /** صيغ عدد ومعدود محلية لما لا تغطيه NOUNS المركزية (عقد fmt.countNoun) */
  const LOCAL_NOUNS = {
    sector: { one: "قطاع واحد", two: "قطاعان", few: "قطاعات", many: "قطاعاً", hundred: "قطاع" },
    district: { one: "حي واحد", two: "حيان", few: "أحياء", many: "حياً", hundred: "حي" },
    month: { one: "شهر واحد", two: "شهران", few: "أشهر", many: "شهراً", hundred: "شهر" },
    vtype: { one: "نوع واحد", two: "نوعان", few: "أنواع", many: "نوعاً", hundred: "نوع" },
    point: { one: "نقطة واحدة", two: "نقطتان", few: "نقاط", many: "نقطة", hundred: "نقطة" },
  };

  /** أوسمة الترتيب القطاعي ذات الصلة الرقابية — مرآة مفردات derived.rankings.
      النغمة دلالية: المرجاني لأوسمة الخلل حصراً، والحياد لما سواه. */
  const RANK_BADGES = {
    highest_violations: { text: "الأعلى في المخالفات المسجلة", tone: "neg" },
    highest_demand: { text: "الأعلى طلباً على الأسرّة", tone: "neu" },
    lowest_coverage: { text: "أدنى نسبة تغطية بين القطاعات", tone: "neg" },
  };

  /** خريطة عرض مقفلة لحالات الاعتماد المعروفة — النص من العقد حرفياً؛
      حالة غير معروفة تُعرض بمعرفها الخام (صدق لا تجميل) */
  const STATUS_BADGE = {
    pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
  };

  /** المقاييس القانونية لمبدّل الأعمدة القطاعية (مرآة عقد charts2) */
  const VALID_MEASURES = ["violations", "monitors", "closures"];

  /** طبقتا الخريطة القانونيتان في هذا القسم: المخالفات (مرجاني حصراً +
      نقاط التركّز) والمراقبون (أخضر — قدرة). لا طبقات طاقة/طلب هنا —
      قسم الخريطة الكامل (order 5) يملك الطيف كله. */
  const MAP_LAYERS = [
    { id: "violations", label: "المخالفات", cls: "vio" },
    { id: "inspectors", label: "المراقبون", cls: "ins" },
  ];

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js: فشل فحص لا يُسقط
     اللوحة (الإصدار المنشور اجتاز البوابات أصلاً) بل ينبه في وحدة التحكم
     لالتقاط أي انجراف بيانات مبكراً أثناء التطوير.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s04-control/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) أدوات صياغة وتفاعل مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** وحدة المعدود المطابقة للرقم: nounUnit(113,"decision") → «قراراً» —
      تُشتق من fmt.noun ذاته فلا تفترق الوحدة عن قاعدة العدد والمعدود أبداً */
  function nounUnit(n, key) {
    const full = fmt.noun(n, key);
    const prefix = fmt.int(n) + fmt.NBSP;
    return full.indexOf(prefix) === 0 ? full.slice(prefix.length) : full;
  }

  /** فرق موقَّع بعزل اتجاهي حتمي: «+41» أو «−197» — للفروق الشهرية */
  function signedInt(d) {
    if (d == null || Number.isNaN(d)) return "—";
    if (d > 0) return fmt.iso("+" + fmt.int(d));
    return fmt.int(d); // fmt.int يتكفل بإشارة السالب الحقيقية − وبالصفر
  }

  /** جعل عنصر غير-زر قابلاً للتفعيل بالكامل: نقر + Enter + مسافة، بدور
      button ووسم data-interactive (فلا يبتلع جهاز التقديم ضغطاته — عقد §8).
      المستمعون على عناصر القسم ذاته فيسقطون مع هدم DOM (لا تسريب). */
  function activatable(el, onAct, ariaLabel) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-interactive", "");
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    el.classList.add("ctl-act");
    el.addEventListener("click", onAct);
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
        ev.preventDefault();
        ev.stopPropagation();
        onAct();
      }
    });
  }

  /** توصيل نقر مثيل ECharts بفصلٍ مضمون: المثيل يعمّر في سجل الثيم أطول
      من DOM القسم فيلزم off صريح عند الهدم (عقد ctx.onTeardown) */
  function wireChartClick(ctx, chart, handler) {
    chart.on("click", handler);
    ctx.onTeardown(() => {
      if (!chart.isDisposed()) chart.off("click", handler);
    });
  }

  /** فتح بطاقة تفاصيل مع إعادة التركيز إلى العنصر المستدعي عند الإغلاق:
      طبقة السجل تُغلق بثلاث بوابات (Escape/زر/خلفية) دون رد نداء، فنراقب
      إزالة ‎.detail-overlay‎ من جذر القسم بمراقب طفرات يُفصل فور الإصابة
      وعند هدم القسم (عقد ctx.onTeardown) — دورة تركيز مفاتيحية مكتملة. */
  function openDetailWithFocusReturn(ctx, invoker, node, opts) {
    ctx.openDetail(node, opts);
    const root = invoker && invoker.closest ? invoker.closest(".dash") : null;
    if (!root) return;
    const mo = new MutationObserver((muts) => {
      for (const mu of muts) {
        for (const rm of mu.removedNodes) {
          if (rm.nodeType === 1 && rm.classList
              && rm.classList.contains("detail-overlay")) {
            mo.disconnect();
            if (document.contains(invoker)
                && typeof invoker.focus === "function") {
              invoker.focus();
            }
            return;
          }
        }
      }
    });
    mo.observe(root, { childList: true });
    ctx.onTeardown(() => mo.disconnect());
  }

  /** اسم مصدر مقياس خام من سجل مصادر الإصدار (لا نص حر) */
  function sourceName(rel, sourceId) {
    for (const s of rel.sources || []) {
      if (s.id === sourceId) return s.name;
    }
    return sourceId || "—";
  }

  /** سطر مصدر لمقياس خام: المصنف + الورقة + المرساة (المرساة لاتينية → عزل) */
  function rawSourceLine(rel, metric) {
    return "المصدر: " + sourceName(rel, metric.source_id) + " — ورقة «"
      + metric.sheet + "» خلية " + fmt.iso(String(metric.anchor));
  }

  /** سطر حساب شفاف: الصيغة تُعلن كما تُحسب — بنفس مرآة تقريب derive */
  function transparentLine(formula) {
    return "حساب شفاف بقاعدة التقريب المعتمدة (نصف لأعلى): "
      + fmt.iso(String(formula));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) نموذج الرقابة الجاهز للعرض — يُبنى مرة واحدة عند بناء القسم
     ──────────────────────────────────────────────────────────────────────────
     يضم: المقاييس الأربعة المعتمدة + الامتثال المورّد + السلسلة الشهرية
     بذروتيها وتراكميّيها + القطاعات بمشتقاتها وأعبائها الرقابية + أنواع
     المخالفات مرتبةً بحصصها وتراكميها + أعلى 5 أحياء بالمخالفات ضمن
     العينة — كل شيء من الإصدار المنشور حصراً.
     ══════════════════════════════════════════════════════════════════════════ */
  function controlModel(rel, der) {
    const m = rel.metrics;
    const totVisits = m.total_visits.value;
    const totViol = m.total_violations.value;
    const totMon = m.total_monitors.value;
    const totClo = m.total_closures.value;

    /* السلسلة الشهرية بتراكمها وذروتيها (قاعدة كسر التعادل: أول الأقصى) */
    const months = rel.monthly.monitoring;
    const cum = [];
    let cv = 0, cf = 0;
    for (const r of months) {
      cv += r.visits;
      cf += r.violations;
      cum.push({ visits: cv, violations: cf });
    }
    let peakV = 0, peakF = 0;
    months.forEach((r, i) => {
      if (r.visits > months[peakV].visits) peakV = i;
      if (r.violations > months[peakF].violations) peakF = i;
    });
    /* إفصاح تعادل الذروة (إصلاح مراجعة الجولة 4): كل الأشهر المساوية للأقصى
       تُعدّ ذروةً وتُسمّى كلها — يوليو وأغسطس 2026 يتشاركان ذروة المخالفات
       317، وقصر التسمية على يوليو يوحي بانحسارٍ في آخر شهر لم يحدث */
    const peaksV = [], peaksF = [];
    months.forEach((r, i) => {
      if (r.visits === months[peakV].visits) peaksV.push(i);
      if (r.violations === months[peakF].violations) peaksF.push(i);
    });
    const peakVWhen = fmt.monthsList(peaksV.map((i) => months[i].label));
    const peakFWhen = fmt.monthsList(peaksF.map((i) => months[i].label));

    /* القطاعات: الصف الخام + المشتقات المنشورة + العبء الرقابي الشفاف
       (مخالفات لكل مراقب — نفس حساب تلميح charts-control حرفياً) + أوسمة
       الترتيب ذات الصلة + عينة أحياء القطاع مرتبة تنازلياً بالمخالفات */
    const sectors = rel.sectors.map((s) => {
      const badges = [];
      for (const key of Object.keys(der.rankings)) {
        if (der.rankings[key] === s.id && RANK_BADGES[key]) {
          badges.push(RANK_BADGES[key]);
        }
      }
      return {
        row: s,
        sd: der.sector[s.id],
        badges,
        loadPerMonitor: round0(s.violations / s.monitors),
        visitsPerMonitor: round0(s.visits / s.monitors),
        violPer100: pctOf(s.violations, s.visits),
        sample: rel.neighbourhoods.rows
          .filter((n) => n.sector === s.id)
          .slice()
          .sort((a, b) => b.violations - a.violations),
      };
    });
    const sectorById = {};
    for (const s of sectors) sectorById[s.row.id] = s;

    /* أقصى القيم القطاعية — أساس موحد لأشرطة المقارنة الصادقة بصرياً */
    const maxSector = { violations: 0, visits: 0, closures: 0, load: 0 };
    for (const s of sectors) {
      if (s.row.violations > maxSector.violations) maxSector.violations = s.row.violations;
      if (s.row.visits > maxSector.visits) maxSector.visits = s.row.visits;
      if (s.row.closures > maxSector.closures) maxSector.closures = s.row.closures;
      if (s.loadPerMonitor > maxSector.load) maxSector.load = s.loadPerMonitor;
    }

    /* أول الأقصى إغلاقاً وزياراتٍ بترتيب الإصدار (rankings لا تغطيهما —
       نفس قاعدة byRaw الموحدة) + مدى المراقبين للقطاع الواحد */
    let topClosures = sectors[0];
    let topVisits = sectors[0];
    let minMon = Infinity, maxMon = -Infinity;
    for (const s of sectors) {
      if (s.row.closures > topClosures.row.closures) topClosures = s;
      if (s.row.visits > topVisits.row.visits) topVisits = s;
      if (s.row.monitors < minMon) minMon = s.row.monitors;
      if (s.row.monitors > maxMon) maxMon = s.row.monitors;
    }

    /* أنواع المخالفات تنازلياً بحصصها وتراكميها — مرآة ترتيب المكتبة ذاته */
    let acc = 0;
    const types = rel.violation_types.slice()
      .sort((a, b) => b.count - a.count)
      .map((t) => {
        acc += t.count;
        return {
          t,
          share: pctOf(t.count, totViol),
          cumCount: acc,
          cumShare: pctOf(acc, totViol),
        };
      });

    /* أعلى 5 أحياء بالمخالفات — ضمن العينة المورّدة حصراً وبوسمها الحرفي */
    const top5 = rel.neighbourhoods.rows.slice()
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 5)
      .map((n) => ({
        n,
        sector: rel.sectors.find((s) => s.id === n.sector),
        share: pctOf(n.violations, totViol),
      }));
    const maxTop5 = top5.length ? top5[0].n.violations : 0;

    /* الحصة الشفافة لقرارات الإغلاق من الزيارات (تُوسم بصيغتها عند العرض) */
    const closureSharePct = pctOf(totClo, totVisits);

    const model = {
      rel, der,
      totVisits, totViol, totMon, totClo,
      avgVisits: der.avg_monthly_visits,
      southShare: der.south_violations_share_pct,
      compliance: rel.compliance,
      months, cum, peakV, peakF, peaksV, peaksF, peakVWhen, peakFWhen,
      sectors, sectorById, maxSector, topClosures, topVisits, minMon, maxMon,
      types, top5, maxTop5, closureSharePct,
      calc: rel.meta.calculation_date,
      asOf: rel.meta.data_as_of,
      period: rel.meta.monitoring_period_label,
      sampleLabel: rel.neighbourhoods.label,
      rankingNote: rel.neighbourhoods.ranking_note,
    };

    /* متطابقات الإصدار التي تتكئ عليها اللوحة كاملة — تنبيه مبكر عند انجراف */
    guard("controlModel", {
      "12 شهراً رقابياً كاملاً": months.length === 12,
      "مجموع الزيارات الشهرية = الإجمالي المعتمد":
        cum[cum.length - 1].visits === totVisits,
      "مجموع المخالفات الشهرية = الإجمالي المعتمد":
        cum[cum.length - 1].violations === totViol,
      "خمسة قطاعات": sectors.length === 5,
      "مجموع مخالفات القطاعات = الإجمالي":
        sectors.reduce((a, s) => a + s.row.violations, 0) === totViol,
      "مجموع مراقبي القطاعات = الإجمالي":
        sectors.reduce((a, s) => a + s.row.monitors, 0) === totMon,
      "مجموع إغلاقات القطاعات = الإجمالي":
        sectors.reduce((a, s) => a + s.row.closures, 0) === totClo,
      "مجموع أنواع المخالفات = الإجمالي":
        types.length && types[types.length - 1].cumCount === totViol,
      "خمسة أحياء في القمة": top5.length === 5,
      "مخالفات الجنوب المعتمدة تطابق صف القطاع":
        sectorById.south.row.violations === m.south_violations.value,
      "قيمة الامتثال ضمن [0,100]":
        model.compliance.value >= 0 && model.compliance.value <= 100,
      "حالة الامتثال معلنة": !!model.compliance.status,
    });

    return model;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) لبنات بطاقات التفاصيل الزجاجية — قوالب كود ثابتة، النصوص عبر عقد
        dom.h النصي حصراً (لا innerHTML لمحتوى الإصدار إطلاقاً)
     ══════════════════════════════════════════════════════════════════════════ */

  /** البطولة: رقم ضخم tabular + وحدة معدودة + تسمية (نغمة دلالية اختيارية) */
  function heroBlock(num, unit, label, tone) {
    return h("div", { class: "ctl-hero" },
      h("span", { class: "ctl-hero-num" + (tone ? " " + tone : "") }, num),
      unit ? h("span", { class: "ctl-hero-unit" }, unit) : null,
      h("span", { class: "ctl-hero-label" }, label),
    );
  }

  /** أوسمة خيطية بنغمة دلالية — الذهبي لوسوم الاعتماد حصراً */
  function badgesBlock(badges) {
    if (!badges || !badges.length) return null;
    return h("div", { class: "ctl-badges" },
      badges.map((b) => h("span", {
        class: "ctl-badge" + (b.tone ? " " + b.tone : ""),
      }, b.text)),
    );
  }

  /** شبكة صفوف «بيان ← قيمة» كثيفة بعمودين */
  function rowsGrid(pairs) {
    return h("div", { class: "ctl-rows" },
      pairs.filter(Boolean).map((p) => h("div", {
        class: "ctl-row" + (p.tone ? " " + p.tone : ""),
      },
        h("span", { class: "ctl-row-k" }, p.k),
        h("span", { class: "ctl-row-v" }, p.v),
      )),
    );
  }

  /** أشرطة مقارنة على أساس موحد معلن — ألوان الامتلاء دلالية صارمة:
      viol=مرجاني (خلل)، cap=أخضر (قدرة)، enf=أزرق (إنفاذ فئة ثانوية) */
  function cbarsBlock(items) {
    return h("div", { class: "ctl-cbars" },
      items.filter(Boolean).map((it) => h("div", { class: "ctl-cbar " + (it.cls || "") },
        h("span", { class: "ctl-cbar-k" }, it.k),
        h("span", { class: "ctl-cbar-track" },
          h("span", {
            class: "ctl-cbar-fill",
            style: { width: Math.max(0, Math.min(100, it.pct)) + "%" },
          }),
        ),
        h("span", { class: "ctl-cbar-v" }, it.v),
      )),
    );
  }

  /** ملاحظات هامشية وسطور مصادر */
  function notesBlock(lines, cls) {
    const clean = (lines || []).filter(Boolean);
    if (!clean.length) return null;
    return h("div", { class: cls || "ctl-notes" },
      clean.map((t) => h("div", { class: cls === "ctl-sources" ? "ctl-src" : "ctl-note" }, t)),
    );
  }

  /** صف أزرار إجراءات داخل البطاقة (زر الملحق ونحوه) */
  function actionsBlock(actions) {
    const clean = (actions || []).filter(Boolean);
    if (!clean.length) return null;
    return h("div", { class: "ctl-actions" },
      clean.map((a) => h("button", {
        class: "ctl-btn",
        type: "button",
        "data-interactive": "",
        onclick: a.onAct,
      },
        a.label,
        h("span", { class: "ctl-btn-arrow", "aria-hidden": "true" }, "←"),
      )),
    );
  }

  /** جدول كثيف داخل بطاقة التفاصيل بتمرير داخلي خاص */
  function detailTable(columns, rows) {
    const thead = h("thead", {}, h("tr", {},
      columns.map((c) => h("th", { scope: "col" }, c.label))));
    const tbody = h("tbody", {},
      rows.map((r) => h("tr", {},
        columns.map((c, i) => h(i === 0 ? "th" : "td",
          i === 0 ? { scope: "row" } : {}, c.render(r))))));
    return h("div", { class: "ctl-table" },
      h("table", { class: "table-dense" }, thead, tbody));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) بطاقات «الأصل والمنهجية» لمؤشرات الشريط — القيمة الدقيقة + المصدر
        بورقته ومرساته + السياق الرقابي، بصدق التحفظات كما وردت
     ══════════════════════════════════════════════════════════════════════════ */

  /** ملف الزيارات الميدانية */
  function visitsDetail(ctx, model) {
    const met = model.rel.metrics.total_visits;
    const peak = model.months[model.peakV];
    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.int(met.value), nounUnit(met.value, "visit"),
        met.label, "pos"),
      rowsGrid([
        { k: "المتوسط الشهري", v: fmt.noun(model.avgVisits, "visit"), tone: "pos" },
        { k: "ذروة النشاط — " + model.peakVWhen, v: fmt.noun(peak.visits, "visit") },
        { k: "الأعلى زياراتٍ", v: model.topVisits.row.name },
        { k: "حصته من الزيارات", v: fmt.pct(model.topVisits.sd.visits_share_pct) },
        { k: "الزيارات لكل مراقب (إجمالاً)", v: fmt.int(round0(model.totVisits / model.totMon)) },
        { k: "الفترة المرجعية", v: model.period },
      ]),
      notesBlock([
        "المتوسط الشهري مشتقة معتمدة: " + fmt.iso("total_visits ÷ 12")
          + " — والزيارات لكل مراقب " + transparentLine("total_visits ÷ total_monitors"),
      ]),
      notesBlock([rawSourceLine(model.rel, met)], "ctl-sources"),
      actionsBlock([{
        label: "ملحق الرقابة الميدانية",
        onAct: () => ctx.openAppendix("monitoring"),
      }]),
    );
  }

  /** ملف المخالفات المسجلة */
  function violationsDetail(ctx, model) {
    const met = model.rel.metrics.total_violations;
    const top = model.types[0];
    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.int(met.value), nounUnit(met.value, "violation"),
        met.label, "neg"),
      badgesBlock([{ text: "مرجاني — الخلل حصراً في منظومة اللون", tone: "neg" }]),
      rowsGrid([
        { k: "حصة قطاع الجنوب", v: fmt.pct(model.southShare), tone: "neg" },
        { k: "أعلى نوع — " + top.t.name, v: fmt.noun(top.t.count, "violation") },
        { k: "أعلى نوعين معاً", v: fmt.pct(model.types[1].cumShare) },
        { k: "مخالفة لكل 100 زيارة", v: fmt.dec1(pctOf(model.totViol, model.totVisits)) },
        { k: "الأنواع المصنفة", v: fmt.countNoun(model.types.length, LOCAL_NOUNS.vtype) },
        { k: "الفترة المرجعية", v: model.period },
      ]),
      notesBlock([
        "حصة الجنوب مشتقة معتمدة: " + fmt.iso("south_violations ÷ total_violations × 100")
          + " — ومعدل المخالفة لكل 100 زيارة " + transparentLine("total_violations ÷ total_visits × 100"),
      ]),
      notesBlock([rawSourceLine(model.rel, met)], "ctl-sources"),
      actionsBlock([{
        label: "ملحق الرقابة الميدانية",
        onAct: () => ctx.openAppendix("monitoring"),
      }]),
    );
  }

  /** ملف المراقبين — التوزيع القطاعي كاملاً، وسجل المراقبين في الملحق حصراً */
  function monitorsDetail(ctx, model) {
    const met = model.rel.metrics.total_monitors;
    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.int(met.value), nounUnit(met.value, "monitor"),
        met.label, "pos"),
      cbarsBlock(model.sectors.map((s) => ({
        cls: "cap",
        k: s.row.short,
        pct: (s.row.monitors / model.maxMon) * 100,
        v: fmt.noun(s.row.monitors, "monitor"),
      }))),
      rowsGrid([
        { k: "المدى لكل قطاع", v: "من " + fmt.int(model.minMon) + " إلى " + fmt.int(model.maxMon) },
        { k: "أثقل عبء مخالفات لكل مراقب", v: model.sectorById.south.row.short + " — " + fmt.int(model.sectorById.south.loadPerMonitor), tone: "neg" },
        { k: "أخف عبء مخالفات لكل مراقب", v: lightestLoad(model).row.short + " — " + fmt.int(lightestLoad(model).loadPerMonitor) },
        { k: "الزيارات لكل مراقب (إجمالاً)", v: fmt.int(round0(model.totVisits / model.totMon)) },
      ]),
      notesBlock([
        "عبء المخالفات لكل مراقب " + transparentLine("violations ÷ monitors لكل قطاع"),
        "سجل المراقبين الثمانية عشر بأسمائهم يعيش في الملحق حصراً بوسم "
          + "«أرقام تشغيلية من سجل المنصة — قيد المطابقة مع الإجماليات المعتمدة».",
      ]),
      notesBlock([rawSourceLine(model.rel, met)], "ctl-sources"),
      actionsBlock([{
        label: "فتح ملحق الرقابة — سجل المراقبين",
        onAct: () => ctx.openAppendix("monitoring"),
      }]),
    );
  }

  /** أول الأدنى عبئاً بترتيب الإصدار (قاعدة كسر التعادل الموحدة) */
  function lightestLoad(model) {
    let best = model.sectors[0];
    for (const s of model.sectors) {
      if (s.loadPerMonitor < best.loadPerMonitor) best = s;
    }
    return best;
  }

  /** ملف قرارات الإغلاق — إجراء إنفاذ (أزرق فئة ثانوية — لا يلبس المرجاني) */
  function closuresDetail(ctx, model) {
    const met = model.rel.metrics.total_closures;
    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.int(met.value), nounUnit(met.value, "decision"), met.label),
      badgesBlock([{ text: "إجراء إنفاذ — فئة ثانوية (أزرق)، لا يُعد خللاً", tone: "neu" }]),
      cbarsBlock(model.sectors.map((s) => ({
        cls: "enf",
        k: s.row.short,
        pct: (s.row.closures / model.maxSector.closures) * 100,
        v: fmt.noun(s.row.closures, "decision"),
      }))),
      rowsGrid([
        { k: "أعلى قطاع إغلاقاً", v: model.topClosures.row.name },
        { k: "قراراته", v: fmt.noun(model.topClosures.row.closures, "decision") },
        { k: "حصة الإغلاق من الزيارات", v: fmt.pct(model.closureSharePct) },
        { k: "الفترة المرجعية", v: model.period },
      ]),
      notesBlock([
        "حصة الإغلاق من الزيارات " + transparentLine("total_closures ÷ total_visits × 100"),
      ]),
      notesBlock([rawSourceLine(model.rel, met)], "ctl-sources"),
    );
  }

  /** ملف معدل الامتثال المورّد — الإفصاح الكامل عن حالة الاعتماد */
  function complianceDetail(ctx, model) {
    const comp = model.compliance;
    const badge = STATUS_BADGE[comp.status] || String(comp.status);
    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.pct(comp.value), null, comp.label, "pos"),
      badgesBlock([{ text: badge, tone: "gold" }]),
      h("div", { class: "ctl-comp-track", role: "img",
        "aria-label": comp.label + " " + fmt.pct(comp.value) },
        h("span", { class: "ctl-comp-fill",
          style: { width: Math.max(0, Math.min(100, comp.value)) + "%" } }),
      ),
      h("div", { class: "ctl-comp-scale", "aria-hidden": "true" },
        h("span", {}, fmt.pct(0)),
        h("span", {}, fmt.pct(100)),
      ),
      notesBlock([String(comp.note)]),
      notesBlock([
        "المتبقي حتى 100٪ متممٌ حسابي لا «عدم امتثال» — تسميته كذلك تفترض "
          + "منهجية بسطٍ ومقامٍ لم تُعتمد بعد، ولذا لا يلبس المرجاني.",
      ]),
      h("div", { class: "ctl-pending-host" }),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) ملف الشهر الواحد — نقرة على أي عمود شهري في اللوحتين المكدستين
     ══════════════════════════════════════════════════════════════════════════ */
  function monthDetail(ctx, model, idx) {
    const r = model.months[idx];
    const c = model.cum[idx];
    const prev = idx > 0 ? model.months[idx - 1] : null;
    const lic = model.rel.monthly.licensing[idx] || null;
    /* وسم الذروة تعادلياً: كل شهر يساوي الأقصى ذروةٌ (يوليو وأغسطس 2026
       يتشاركان ذروة المخالفات — كلاهما يستحق الوسام) */
    const isPeakV = model.peaksV.indexOf(idx) !== -1;
    const isPeakF = model.peaksF.indexOf(idx) !== -1;

    const badges = [];
    if (isPeakV) badges.push({ text: "ذروة الزيارات في الفترة", tone: "pos" });
    if (isPeakF) badges.push({ text: "ذروة المخالفات في الفترة", tone: "neg" });

    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.int(r.visits), nounUnit(r.visits, "visit"),
        "الزيارات الميدانية — " + r.label, "pos"),
      badgesBlock(badges),
      rowsGrid([
        { k: "المخالفات المسجلة", v: fmt.noun(r.violations, "violation"), tone: "neg" },
        { k: "مخالفة لكل 100 زيارة", v: fmt.dec1(pctOf(r.violations, r.visits)) },
        { k: "الفرق عن الشهر السابق — زيارات", v: prev ? signedInt(r.visits - prev.visits) : "—" },
        { k: "الفرق عن الشهر السابق — مخالفات", v: prev ? signedInt(r.violations - prev.violations) : "—" },
        { k: "حصة الشهر من الزيارات", v: fmt.pct(pctOf(r.visits, model.totVisits)) },
        { k: "حصة الشهر من المخالفات", v: fmt.pct(pctOf(r.violations, model.totViol)) },
        { k: "تراكمي الزيارات حتى نهايته", v: fmt.int(c.visits) },
        { k: "تراكمي المخالفات حتى نهايته", v: fmt.int(c.violations) },
      ]),
      lic ? h("div", { class: "ctl-subhead" }, "سياق التراخيص في الشهر نفسه") : null,
      lic ? rowsGrid([
        { k: "رخص البناء الصادرة", v: fmt.noun(lic.building, "licence") },
        { k: "الرخص التشغيلية الصادرة", v: fmt.noun(lic.operational, "licence") },
        { k: "الأسرّة المضافة", v: fmt.unitAfter(lic.beds, "سرير"), tone: "pos" },
      ]) : null,
      notesBlock([
        "معدل المخالفة لكل 100 زيارة " + transparentLine("violations ÷ visits × 100"),
      ]),
      notesBlock([
        "أرقام الشهر من السلسلتين الشهريتين المعتمدتين في الإصدار — "
          + "مجموعاهما يطابقان الإجماليين المعتمدين "
          + fmt.int(model.totVisits) + " و" + fmt.int(model.totViol) + ".",
      ], "ctl-sources"),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) ملف نوع المخالفة — نقرة على عمود في رسم الأنواع
     ══════════════════════════════════════════════════════════════════════════ */
  function typeDetail(ctx, model, idx) {
    const e = model.types[idx];
    const top = model.types[0];
    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.int(e.t.count), nounUnit(e.t.count, "violation"),
        e.t.name, "neg"),
      badgesBlock([{
        text: "الترتيب " + fmt.int(idx + 1) + " من "
          + fmt.countNoun(model.types.length, LOCAL_NOUNS.vtype),
        tone: idx === 0 ? "neg" : "neu",
      }]),
      cbarsBlock([
        {
          cls: "viol", k: "هذا النوع",
          pct: (e.t.count / top.t.count) * 100,
          v: fmt.int(e.t.count),
        },
        idx !== 0 ? {
          cls: "viol", k: "الأعلى — " + top.t.name,
          pct: 100,
          v: fmt.int(top.t.count),
        } : null,
      ]),
      rowsGrid([
        { k: "الحصة من إجمالي المخالفات", v: fmt.pct(e.share), tone: "neg" },
        { k: "تراكمياً حتى هذا النوع", v: fmt.pct(e.cumShare) },
        { k: "عدده التراكمي", v: fmt.int(e.cumCount) },
        { k: "إجمالي الفترة", v: fmt.noun(model.totViol, "violation") },
      ]),
      notesBlock([
        "قراءة باريتو: أعلى نوعين («" + top.t.name + "» و«"
          + model.types[1].t.name + "») يمثلان معاً "
          + fmt.pct(model.types[1].cumShare) + " من مخالفات الفترة.",
      ]),
      notesBlock([
        "من جدول أنواع المخالفات المعتمد في الإصدار — مجموع الأنواع الستة "
          + "يطابق الإجمالي المعتمد " + fmt.int(model.totViol) + ".",
      ], "ctl-sources"),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) ملف القطاع الرقابي — نقرة على عمود قطاعي أو صف في بطاقة التوزيع
     ══════════════════════════════════════════════════════════════════════════ */
  function sectorDetail(ctx, model, sectorId) {
    const s = model.sectorById[sectorId];
    if (!s) return null;
    const r = s.row;

    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.int(r.violations), nounUnit(r.violations, "violation"),
        "المخالفات المسجلة — " + r.name, "neg"),
      badgesBlock(s.badges),
      /* أشرطة مقارنة على أساس موحد: أقصى قطاع في كل مقياس = 100٪ —
         المقاييس الثلاثة بألوانها الدلالية (خلل/قدرة/إنفاذ) */
      cbarsBlock([
        {
          cls: "viol", k: "المخالفات",
          pct: (r.violations / model.maxSector.violations) * 100,
          v: fmt.int(r.violations),
        },
        {
          cls: "cap", k: "الزيارات",
          pct: (r.visits / model.maxSector.visits) * 100,
          v: fmt.int(r.visits),
        },
        {
          cls: "enf", k: "قرارات الإغلاق",
          pct: (r.closures / model.maxSector.closures) * 100,
          v: fmt.int(r.closures),
        },
      ]),
      rowsGrid([
        { k: "حصة القطاع من المخالفات", v: fmt.pct(s.sd.violations_share_pct), tone: "neg" },
        { k: "حصة القطاع من الزيارات", v: fmt.pct(s.sd.visits_share_pct) },
        { k: "المراقبون الميدانيون", v: fmt.noun(r.monitors, "monitor"), tone: "pos" },
        { k: "مخالفات لكل مراقب", v: fmt.int(s.loadPerMonitor), tone: "neg" },
        { k: "زيارات لكل مراقب", v: fmt.int(s.visitsPerMonitor) },
        { k: "مخالفة لكل 100 زيارة", v: fmt.dec1(s.violPer100) },
        { k: "قرارات الإغلاق", v: fmt.noun(r.closures, "decision") },
        { k: "حصة القطاع من الطلب (سياق)", v: fmt.pct(s.sd.demand_share_pct) },
      ]),
      s.sample.length ? h("div", { class: "ctl-subhead" },
        model.sampleLabel + " — " + r.name) : null,
      s.sample.length ? detailTable([
        { label: "الحي", render: (n) => n.name },
        { label: "المخالفات", render: (n) => fmt.int(n.violations) },
        { label: "الأسرّة", render: (n) => fmt.int(n.beds) },
        { label: "رخص بناء", render: (n) => fmt.int(n.building) },
        { label: "تشغيلية", render: (n) => fmt.int(n.operational) },
      ], s.sample) : null,
      notesBlock([
        "العبء لكل مراقب ومعدل المخالفة لكل 100 زيارة "
          + transparentLine("violations ÷ monitors · violations ÷ visits × 100"),
        String(model.rankingNote),
      ]),
      actionsBlock([{
        label: "ملحق الرقابة الميدانية",
        onAct: () => ctx.openAppendix("monitoring"),
      }]),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) بطاقة الحي — من نقرة على الخريطة (عقد geomap.onDistrict) أو من
        قائمة أعلى 5 أحياء (صف العينة مباشرة)
     ══════════════════════════════════════════════════════════════════════════ */

  /** من الخريطة: info={name, sector, sectorName, sectorRow, sectorDerived,
      sample|null} — قيم الحي تظهر فقط حيث وُجد في العينة وبوسمها */
  function districtDetail(ctx, model, info) {
    const s = model.sectorById[info.sector];
    const sample = info.sample || null;
    return h("div", { class: "ctl-detail" },
      heroBlock(
        sample ? fmt.int(sample.violations) : "—",
        sample ? nounUnit(sample.violations, "violation") : null,
        sample
          ? "مخالفات الحي ضمن العينة المورّدة"
          : "الحي خارج عينة الأحياء المدرجة — تُعرض قيم قطاعه",
        sample ? "neg" : null),
      badgesBlock([
        { text: String(info.sectorName), tone: "neu" },
        sample ? { text: model.sampleLabel, tone: "gold" } : null,
      ].filter(Boolean)),
      sample ? rowsGrid([
        { k: "حصة الحي من مخالفات الفترة", v: fmt.pct(pctOf(sample.violations, model.totViol)), tone: "neg" },
        { k: "الأسرّة المرخصة (عينة)", v: fmt.unitAfter(sample.beds, "سرير"), tone: "pos" },
        { k: "رخص البناء (عينة)", v: fmt.noun(sample.building, "licence") },
        { k: "الرخص التشغيلية (عينة)", v: fmt.noun(sample.operational, "licence") },
      ]) : null,
      h("div", { class: "ctl-subhead" }, "السياق الرقابي للقطاع"),
      rowsGrid([
        { k: "مخالفات القطاع", v: fmt.noun(s.row.violations, "violation"), tone: "neg" },
        { k: "حصة القطاع من المخالفات", v: fmt.pct(s.sd.violations_share_pct) },
        { k: "زيارات القطاع", v: fmt.noun(s.row.visits, "visit") },
        { k: "مراقبو القطاع", v: fmt.noun(s.row.monitors, "monitor"), tone: "pos" },
        { k: "قرارات الإغلاق", v: fmt.noun(s.row.closures, "decision") },
        { k: "مخالفات لكل مراقب", v: fmt.int(s.loadPerMonitor), tone: "neg" },
      ]),
      notesBlock([
        "حدود الأحياء: بيانات عامة (MIT) — مواقع النقاط توضيحية من سجل المنصة.",
        sample ? null : "لا قيم على مستوى هذا الحي في العينة المورّدة — لا اختلاق.",
      ]),
      actionsBlock([{
        label: "فتح ملف القطاع الكامل",
        onAct: () => {
          // بطاقة فوق بطاقة ممنوعة — الطبقة الحالية تُستبدل عبر فتح جديدة
          openDetailWithFocusReturn(ctx, null,
            sectorDetail(ctx, model, info.sector), { title: String(info.sectorName) });
        },
      }]),
    );
  }

  /** من قائمة أعلى 5: صف العينة نفسه (entry من model.top5) */
  function topRowDetail(ctx, model, entry) {
    const s = model.sectorById[entry.n.sector];
    return h("div", { class: "ctl-detail" },
      heroBlock(fmt.int(entry.n.violations), nounUnit(entry.n.violations, "violation"),
        entry.n.name + " — " + s.row.name, "neg"),
      badgesBlock([{ text: model.sampleLabel, tone: "gold" }]),
      cbarsBlock([
        {
          cls: "viol", k: "الحي",
          pct: (entry.n.violations / model.maxTop5) * 100,
          v: fmt.int(entry.n.violations),
        },
        {
          cls: "viol", k: "قطاعه كاملاً",
          pct: 100,
          v: fmt.int(s.row.violations),
        },
      ]),
      rowsGrid([
        { k: "حصة الحي من مخالفات الفترة", v: fmt.pct(entry.share), tone: "neg" },
        { k: "حصته من مخالفات قطاعه", v: fmt.pct(pctOf(entry.n.violations, s.row.violations)) },
        { k: "الأسرّة المرخصة (عينة)", v: fmt.unitAfter(entry.n.beds, "سرير"), tone: "pos" },
        { k: "رخص البناء / التشغيلية", v: fmt.int(entry.n.building) + " / " + fmt.int(entry.n.operational) },
      ]),
      notesBlock([String(model.rankingNote)]),
      actionsBlock([{
        label: "فتح ملف " + s.row.name,
        onAct: () => {
          openDetailWithFocusReturn(ctx, null,
            sectorDetail(ctx, model, s.row.id), { title: String(s.row.name) });
        },
      }]),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) شريط المؤشرات الكبرى — خمسة أرقام بطولية بعقد layout.kpiStrip:
        عدّ تصاعدي عند أول دخول، ونقر يفتح بطاقة الأصل والمنهجية
     ══════════════════════════════════════════════════════════════════════════ */
  function buildKpiStrip(el, ctx, model) {
    const comp = model.compliance;
    const compBadge = STATUS_BADGE[comp.status] || String(comp.status);

    /* تعريف المؤشرات: value منسقة سلفاً (عقد layout)، countTo يفعّل العد،
       والقيمة النهائية تساوي value المنسقة حرفياً */
    const defs = [
      {
        item: {
          label: "الزيارات الميدانية",
          value: fmt.int(model.totVisits),
          unit: nounUnit(model.totVisits, "visit"),
          tone: "pos",
          delta: { text: "بمتوسط " + fmt.noun(model.avgVisits, "visit") + " شهرياً", tone: "neu" },
          note: model.period,
          countTo: model.totVisits, fmt: (v) => fmt.int(v),
          key: "control:kpi:visits",
        },
        aria: "الزيارات الميدانية — التفاصيل والمصدر",
        detail: () => visitsDetail(ctx, model),
        title: "الزيارات الميدانية",
      },
      {
        item: {
          label: "المخالفات المسجلة",
          value: fmt.int(model.totViol),
          unit: nounUnit(model.totViol, "violation"),
          tone: "neg",
          delta: { text: fmt.pct(model.southShare) + " منها في قطاع الجنوب", tone: "neg" },
          note: fmt.countNoun(model.types.length, LOCAL_NOUNS.vtype) + " مصنفة",
          countTo: model.totViol, fmt: (v) => fmt.int(v),
          key: "control:kpi:violations",
        },
        aria: "المخالفات المسجلة — التفاصيل والمصدر",
        detail: () => violationsDetail(ctx, model),
        title: "المخالفات المسجلة",
      },
      {
        item: {
          label: "المراقبون الميدانيون",
          value: fmt.int(model.totMon),
          unit: nounUnit(model.totMon, "monitor"),
          tone: "pos",
          delta: {
            text: "من " + fmt.int(model.minMon) + " إلى "
              + fmt.int(model.maxMon) + " لكل قطاع", tone: "neu",
          },
          note: "موزعون على " + fmt.countNoun(model.sectors.length, LOCAL_NOUNS.sector),
          countTo: model.totMon, fmt: (v) => fmt.int(v),
          key: "control:kpi:monitors",
        },
        aria: "المراقبون الميدانيون — التوزيع والمصدر",
        detail: () => monitorsDetail(ctx, model),
        title: "المراقبون الميدانيون",
      },
      {
        item: {
          label: "قرارات الإغلاق",
          value: fmt.int(model.totClo),
          unit: nounUnit(model.totClo, "decision"),
          tone: "neu",
          delta: { text: fmt.pct(model.closureSharePct) + " من الزيارات", tone: "neu" },
          note: "أعلاها " + model.topClosures.row.short + " — "
            + fmt.noun(model.topClosures.row.closures, "decision"),
          countTo: model.totClo, fmt: (v) => fmt.int(v),
          key: "control:kpi:closures",
        },
        aria: "قرارات الإغلاق — التفاصيل والمصدر",
        detail: () => closuresDetail(ctx, model),
        title: "قرارات الإغلاق",
      },
      {
        item: {
          label: "معدل الامتثال",
          value: fmt.pct(comp.value),
          tone: "pos",
          delta: { text: compBadge, tone: "warn" },
          note: "المعالجة الكاملة في التفاصيل",
          countTo: comp.value, fmt: (v) => fmt.pct(v),
          key: "control:kpi:compliance",
        },
        aria: "معدل الامتثال — قيمة مورّدة بانتظار اعتماد المنهجية",
        detail: () => complianceDetailWithPending(ctx, model),
        title: String(comp.label),
      },
    ];

    guard("kpiStrip", {
      "خمسة مؤشرات (عقد 4-6)": defs.length >= 4 && defs.length <= 6,
      "وحدات معدودة مطابقة": nounUnit(model.totMon, "monitor") === "مراقباً"
        && nounUnit(model.totClo, "decision") === "قراراً",
    });

    const strip = RH.presenter.layout.kpiStrip(el, defs.map((d) => d.item));

    /* كل بطاقة رقم قابلة للتفعيل الكامل — التركيز يعود إليها عند الإغلاق */
    Array.from(strip.children).forEach((kpiEl, i) => {
      const d = defs[i];
      activatable(kpiEl, () => {
        openDetailWithFocusReturn(ctx, kpiEl, d.detail(), { title: d.title });
      }, d.aria);
    });

    return strip;
  }

  /** بطاقة الامتثال مع بطاقة «قيد الاعتماد» المدمجة (layout.pendingCard —
      بطاقة داخل اللوحة أبداً لا شاشة كاملة) */
  function complianceDetailWithPending(ctx, model) {
    const node = complianceDetail(ctx, model);
    const host = node.querySelector(".ctl-pending-host");
    if (host) {
      RH.presenter.layout.pendingCard(host, {
        label: "منهجية الاحتساب قيد الاعتماد",
        note: "يلزم اعتماد البسط والمقام ومعالجة تعدد المخالفات في الزيارة الواحدة",
      });
    }
    return node;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) خلية النشاط الشهري — اللوحتان المكدستان بمفتاح «شهري/تراكمي»
     ──────────────────────────────────────────────────────────────────────────
     مضيفان متراكبان (بناء كسول للتراكمي): التبديل إظهار/إخفاء + resize —
     لا إعادة استدعاء للمُنشئ على المضيف نفسه فلا تتضاعف مستمعات keyNav،
     ولكل وضع مثيله في سجل الثيم (c2:monthlyActivityDual:control[-cum]).
     نقر أي عمود/نقطة شهرية في أي وضع يفتح ملف الشهر الكامل.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildMonthlyCell(cell, ctx, model) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "النشاط الرقابي الشهري",
      sub: model.period,
      cls: "ctl-monthly-card",
    });

    /* المضيفان — dashboard.css يمدد أبناء .chart-host المباشرين إلى كامل
       المساحة؛ [hidden] يخفي دون مساس بالتموضع */
    const hostMonthly = h("div", { class: "ctl-mode-host" });
    const hostCum = h("div", { class: "ctl-mode-host", hidden: true });
    res.body.appendChild(hostMonthly);
    res.body.appendChild(hostCum);

    const charts = { monthly: null, cumulative: null };

    /* توصيل نقر الشهر: dataIndex واحد عبر اللوحتين (سلسلتا الشهر متحاذيتان) */
    function wireMonthClick(chart) {
      wireChartClick(ctx, chart, (p) => {
        if (p == null || typeof p.dataIndex !== "number") return;
        const idx = p.dataIndex;
        if (idx < 0 || idx >= model.months.length) return;
        openDetailWithFocusReturn(ctx, res.body,
          monthDetail(ctx, model, idx),
          { title: "ملف " + model.months[idx].label });
      });
    }

    /* البناء الأول: الوضع الشهري (قراءة الإيقاع والذروة) */
    charts.monthly = RH.viz.charts2.monthlyActivityDual(hostMonthly, ctx.su, {
      key: "control",
      mode: "monthly",
    });
    wireMonthClick(charts.monthly);

    let mode = "monthly";

    /* مفتاح التبديل في ترويسة البطاقة — أزرار حقيقية aria-pressed */
    const MODES = [
      { id: "monthly", label: "شهري" },
      { id: "cumulative", label: "تراكمي" },
    ];
    const head = res.card.querySelector(".card-head");
    const bar = h("div", {
      class: "ctl-toolbar",
      role: "group",
      "aria-label": "طريقة قراءة النشاط الشهري",
    });
    const btns = [];
    function syncBtns() {
      for (const b of btns) {
        const active = b.dataset.mode === mode;
        b.setAttribute("aria-pressed", active ? "true" : "false");
        b.classList.toggle("active", active);
      }
    }
    function setMode(id) {
      if (id === mode) return;
      mode = id;
      const wantCum = mode === "cumulative";
      hostMonthly.hidden = wantCum;
      hostCum.hidden = !wantCum;
      if (wantCum && !charts.cumulative) {
        /* بناء كسول بعد الإظهار — المضيف ظاهر فالمقاس صحيح من أول مرة */
        charts.cumulative = RH.viz.charts2.monthlyActivityDual(hostCum, ctx.su, {
          key: "control-cum",
          mode: "cumulative",
        });
        wireMonthClick(charts.cumulative);
      } else {
        const c = wantCum ? charts.cumulative : charts.monthly;
        if (c && !c.isDisposed()) c.resize();
      }
      syncBtns();
      /* لا ctx.update هنا عمداً: إعادة كتابة المعاملات تعيد بناء القسم كاملاً
         (عقد المحرك)، بينما التبديل إظهار/إخفاء فوري بلا هدم. */
    }
    for (const md of MODES) {
      const b = h("button", {
        class: "ctl-tbtn",
        type: "button",
        dataset: { mode: md.id },
        "data-interactive": "",
        "aria-pressed": "false",
        onclick: () => setMode(md.id),
      }, md.label);
      btns.push(b);
      bar.appendChild(b);
    }
    if (head) head.appendChild(bar);
    syncBtns();

    /* ذيل قراءة موجز: الذروتان بالتسمية والقيمة — أرقام tabular داكنة.
       التسمية تعادلية: كل أشهر الذروة تُذكر (يوليو وأغسطس 2026 للمخالفات) */
    const pv = model.months[model.peakV];
    const pf = model.months[model.peakF];
    res.card.appendChild(h("div", { class: "ctl-cardfoot" },
      "ذروة الزيارات ", h("b", {}, fmt.int(pv.visits)), " في " + model.peakVWhen
        + " · ذروة المخالفات ", h("b", {}, fmt.int(pf.violations)),
      " في " + model.peakFWhen + " · انقر أي شهر لملفه الكامل",
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) خلية أنواع المخالفات — أفقي مرجاني بتسميات كاملة، نقر يفتح الملف
     ══════════════════════════════════════════════════════════════════════════ */
  function buildTypesCell(cell, ctx, model) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "أنواع المخالفات",
      sub: fmt.countNoun(model.types.length, LOCAL_NOUNS.vtype)
        + " — " + fmt.noun(model.totViol, "violation"),
      cls: "ctl-types-card",
    });

    const chart = RH.viz.charts2.violationTypes(res.body, ctx.su, {
      key: "control",
      share: true,
    });

    /* المكتبة ترتب تنازلياً على العدّ بنفس المقارن — dataIndex يطابق نموذجنا */
    wireChartClick(ctx, chart, (p) => {
      if (p == null || typeof p.dataIndex !== "number") return;
      const idx = p.dataIndex;
      if (idx < 0 || idx >= model.types.length) return;
      openDetailWithFocusReturn(ctx, res.body,
        typeDetail(ctx, model, idx),
        { title: String(model.types[idx].t.name) });
    });

    /* ذيل باريتو: أعلى نوعين يجاوزان نصف المخالفات — قراءة تنفيذية واحدة */
    res.card.appendChild(h("div", { class: "ctl-cardfoot" },
      "أعلى نوعين معاً ", h("b", {}, fmt.pct(model.types[1].cumShare)),
      " من مخالفات الفترة — قراءة باريتو للتدخل المركّز",
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) خلية المخالفات قطاعياً — المبدّل المدمج (مخالفات/مراقبون/إغلاقات)
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSectorCell(cell, ctx, model) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "المخالفات حسب القطاع",
      sub: "بوسم عدد المراقبين — بدّل المقياس من الأزرار",
      cls: "ctl-sector-card",
    });

    /* وصول عميق: ?measure=monitors|closures يبدأ الرسم على ذلك المقياس */
    const measure = VALID_MEASURES.includes(ctx.params.measure)
      ? ctx.params.measure : "violations";

    /* مبدّل المقياس في ترويسة البطاقة (صف كروم مخصص) لا داخل مساحة الرسم —
       إصلاح مراجعة الجولة 1: كانت رقاقات المبدّل المدمجة تطفو فوق عمود
       الجنوب فتحجب قيمته 1,367؛ الرسم يبدأ الآن أسفل الترويسة حصراً. */
    const chart = RH.viz.charts2.sectorViolationsBars(res.body, ctx.su, {
      key: "control",
      toggle: false,
      measure,
    });

    const MEASURE_DEFS = [
      { id: "violations", label: "المخالفات", cls: "vio" },
      { id: "monitors", label: "المراقبون", cls: "ins" },
      { id: "closures", label: "قرارات الإغلاق", cls: "enf" },
    ];
    const head = res.card.querySelector(".card-head");
    const mbar = h("div", {
      class: "ctl-toolbar ctl-measures",
      role: "group",
      "aria-label": "اختيار مقياس الأعمدة القطاعية",
    });
    const mbtns = [];
    function syncMeasureBtns() {
      const cur = chart.measure ? chart.measure() : measure;
      for (const b of mbtns) {
        const active = b.dataset.measure === cur;
        b.setAttribute("aria-pressed", active ? "true" : "false");
        b.classList.toggle("active", active);
      }
    }
    for (const d of MEASURE_DEFS) {
      const b = h("button", {
        class: "ctl-tbtn ctl-measure-btn " + d.cls,
        type: "button",
        dataset: { measure: d.id },
        "data-interactive": "",
        "aria-pressed": "false",
        onclick: () => {
          if (chart.setMeasure) chart.setMeasure(d.id);
          syncMeasureBtns();
        },
      },
        h("span", { class: "ctl-layer-dot", "aria-hidden": "true" }),
        d.label,
      );
      mbtns.push(b);
      mbar.appendChild(b);
    }
    if (head) head.appendChild(mbar);
    syncMeasureBtns();

    /* الترتيب المعروض هو ترتيب الإصدار (لا sort=value) — dataIndex يطابق
       rel.sectors مباشرة في كل المقاييس */
    wireChartClick(ctx, chart, (p) => {
      if (p == null || typeof p.dataIndex !== "number") return;
      const idx = p.dataIndex;
      if (idx < 0 || idx >= model.sectors.length) return;
      const id = model.sectors[idx].row.id;
      openDetailWithFocusReturn(ctx, res.body,
        sectorDetail(ctx, model, id),
        { title: String(model.sectors[idx].row.name) });
    });

    /* ذيل القراءة: اختلال التوزيع — جوهر رؤية cd2 من أرقام الإصدار نفسها */
    const south = model.sectorById.south;
    res.card.appendChild(h("div", { class: "ctl-cardfoot" },
      "الجنوب ", h("b", {}, fmt.pct(south.sd.violations_share_pct)),
      " من المخالفات بعبء ", h("b", {}, fmt.int(south.loadPerMonitor)),
      " مخالفة لكل مراقب — انقر عموداً لملف القطاع",
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     13) خلية الخريطة الحقيقية — layer=violations + نقاط التركّز الأربعون
     ──────────────────────────────────────────────────────────────────────────
     «الخريطتان» المطلوبتان في المواصفة (مراقبون/مخالفات) خريطة واحدة بمبدّل
     طبقة فوري (إعادة تلوين بلا هدم) — النقاط الحرارية مع طبقة المخالفات
     حصراً كي لا تلوث دلالة المرجاني، ومفتاح إظهارها مستقل داخل الطبقة.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildMapCell(cell, ctx, model, teardown) {
    const geoCount = countDistricts(ctx.geo);
    const hsCount = ctx.geo && ctx.geo.hotspots ? ctx.geo.hotspots.length : 0;
    const res = RH.presenter.layout.card(cell, {
      title: "خريطة الإنفاذ الميداني",
      sub: geoCount
        ? "حدود " + fmt.countNoun(geoCount, LOCAL_NOUNS.district) + " حقيقية — "
          + fmt.countNoun(hsCount, LOCAL_NOUNS.point) + " تركّز"
        : "حدود الأحياء غير مضمنة في هذا البناء",
      cls: "ctl-map-card",
      pad: false,
    });

    const host = h("div", { class: "ctl-map-host" });
    res.body.appendChild(host);

    /* وصول عميق: ?mlayer=inspectors يبدأ بطبقة المراقبين (تُقرأ ولا تُكتب) */
    const validLayer = (k) => MAP_LAYERS.some((d) => d.id === k);
    let currentLayer = validLayer(ctx.params.mlayer) ? ctx.params.mlayer : "violations";
    /* النقاط الحرارية: افتراضياً مفعلة مع طبقة المخالفات (عقد التكليف) */
    let hotspotsOn = currentLayer === "violations";

    const gm = RH.viz.geomap.render(host, {
      su: ctx.su,
      layer: currentLayer,
      mode: "auto",
      hotspots: hotspotsOn,
      sample: true,
      interactive: true,
      onDistrict: (info) => {
        openDetailWithFocusReturn(ctx, host,
          districtDetail(ctx, model, info), { title: String(info.name) });
      },
    });

    /* مبدّل الطبقة + مفتاح النقاط — كروم واجهة في ترويسة البطاقة */
    const head = res.card.querySelector(".card-head");
    const bar = h("div", {
      class: "ctl-toolbar ctl-maplayers",
      role: "group",
      "aria-label": "طبقة الخريطة الرقابية",
    });
    const layerBtns = [];
    let hsBtn = null;

    function syncMapBtns() {
      for (const b of layerBtns) {
        const active = b.dataset.layer === currentLayer;
        b.setAttribute("aria-pressed", active ? "true" : "false");
        b.classList.toggle("active", active);
      }
      if (hsBtn) {
        hsBtn.setAttribute("aria-pressed", hotspotsOn ? "true" : "false");
        hsBtn.classList.toggle("active", hotspotsOn);
        /* النقاط المرجانية طبقة خلل — تُتاح مع طبقة المخالفات حصراً */
        hsBtn.disabled = currentLayer !== "violations";
      }
    }

    function setLayer(id) {
      if (!validLayer(id) || id === currentLayer) return;
      currentLayer = id;
      gm.setLayer(id);
      const wantHs = id === "violations" && hotspotsOn;
      gm.setHotspots(wantHs);
      syncMapBtns();
    }

    function toggleHotspots() {
      hotspotsOn = !hotspotsOn;
      gm.setHotspots(currentLayer === "violations" && hotspotsOn);
      syncMapBtns();
    }

    for (const d of MAP_LAYERS) {
      const b = h("button", {
        class: "ctl-tbtn ctl-layer-btn " + d.cls,
        type: "button",
        dataset: { layer: d.id },
        "data-interactive": "",
        "aria-pressed": "false",
        "aria-label": "طبقة " + d.label,
        onclick: () => setLayer(d.id),
      },
        h("span", { class: "ctl-layer-dot", "aria-hidden": "true" }),
        d.label,
      );
      layerBtns.push(b);
      bar.appendChild(b);
    }
    hsBtn = h("button", {
      class: "ctl-tbtn ctl-hs-btn",
      type: "button",
      "data-interactive": "",
      "aria-pressed": "true",
      "aria-label": "إظهار نقاط التركّز الرقابي",
      onclick: toggleHotspots,
    },
      h("span", { class: "ctl-hs-dot", "aria-hidden": "true" }),
      "التركّز",
    );
    bar.appendChild(hsBtn);
    if (head) head.appendChild(bar);
    syncMapBtns();

    /* مواءمة المقاس: المحرك يبني في مضيف احتياطي ثم يبدّل، وresizeAll يخدم
       ECharts لا Leaflet — مراقب مقاس يستدعي refresh ويُفصل عند الهدم */
    let ro = null;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => gm.refresh());
      ro.observe(host);
    }
    teardown(() => {
      if (ro) ro.disconnect();
      gm.destroy();
    });
  }

  /** عدد الأحياء في ملف الحدود (للسطر الثانوي) — صفر عند غياب الملف */
  function countDistricts(geo) {
    if (!geo || !geo.sectors) return 0;
    let n = 0;
    for (const k of Object.keys(geo.sectors)) {
      n += (geo.sectors[k] || []).length;
    }
    return n;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     14) خلية أعلى 5 أحياء بالمخالفات — ضمن العينة المورّدة حصراً
     ──────────────────────────────────────────────────────────────────────────
     قائمة رتب كثيفة: رقم الترتيب + الاسم + شريط مرجاني (المخالفات حصراً)
     منسوب إلى الأول + القيمة — كل صف قابل للتفعيل يفتح بطاقة الحي.
     وسم العينة وقاعدة الترتيب حرفيان من الإصدار (لا ترتيب مدينةً كاملة).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildTopCell(cell, ctx, model) {
    const res = RH.presenter.layout.card(cell, {
      title: "أعلى 5 أحياء مخالفاتٍ",
      sub: "ضمن العينة المورّدة",
      cls: "ctl-top-card",
      pad: false,
    });

    const list = h("div", { class: "ctl-top", role: "list" });
    model.top5.forEach((e, i) => {
      const row = h("div", { class: "ctl-top-row", role: "listitem" },
        h("span", { class: "ctl-top-rank", "aria-hidden": "true" }, fmt.int(i + 1)),
        h("span", { class: "ctl-top-main" },
          h("span", { class: "ctl-top-name" }, e.n.name),
          h("span", { class: "ctl-top-sector" }, e.sector ? e.sector.short : "—"),
          h("span", { class: "ctl-top-track" },
            h("span", {
              class: "ctl-top-fill",
              style: { width: (e.n.violations / model.maxTop5) * 100 + "%" },
            }),
          ),
        ),
        h("span", { class: "ctl-top-val" }, fmt.int(e.n.violations)),
      );
      activatable(row, () => {
        openDetailWithFocusReturn(ctx, row,
          topRowDetail(ctx, model, e), { title: String(e.n.name) });
      }, e.n.name + " — " + fmt.noun(e.n.violations, "violation"));
      list.appendChild(row);
    });
    res.body.appendChild(list);

    /* وسم العينة — إصلاح مراجعة الجولة 2: النص الكامل كان يُقص في منتصف
       الكلمة («المقيا…») ويطبع فوق شريط الصف الخامس — سطر مختصر يسع سطراً
       واحداً دائماً، والوسم الحرفي الكامل من الإصدار في تلميح العنصر. */
    const fullNote = model.sampleLabel + " — المقياس المرتب: المخالفات المسجلة";
    res.body.appendChild(h("div", {
      class: "ctl-top-note",
      title: fullNote,
    }, "عينة الأحياء الموثقة — المقياس: المخالفات المسجلة"));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     15) عمود الرؤى الممتد — insight_panels.control + توزيع القدرة الرقابية
         + زر الملحق (سجل المراقبين بوسم قيد المطابقة) + سطر الحداثة
     ══════════════════════════════════════════════════════════════════════════ */
  function buildRail(cell, ctx, model) {
    cell.classList.add("ctl-rail-cell");

    /* 15.1) بطاقات الرؤى المحوكمة (المفتاح القانوني "control") — غيابها
       الصادق بطاقة مدمجة لا اختلاق (عقد insightRail: null بصمت) */
    const rail = RH.presenter.layout.insightRail(cell, "control");
    if (!rail) {
      RH.presenter.layout.pendingCard(cell, {
        label: "رؤى القسم قيد الاعتماد",
        note: "لوحة الرؤى تُدار من الإدارة وتخضع لبوابة مجمع الحقائق",
      });
    }

    /* 15.2) توزيع القدرة الرقابية: مراقبو كل قطاع نقاطاً خضراء (قدرة)
       وعبء المخالفات لكل مراقب شريطاً مرجانياً (خلل) — الصف يفتح ملف القطاع */
    const dist = h("div", { class: "ctl-mon" },
      h("div", { class: "ctl-mon-title" }, "توزيع القدرة الرقابية"),
      h("div", { class: "ctl-mon-sub" },
        fmt.noun(model.totMon, "monitor") + " — العبء: مخالفات لكل مراقب"),
    );
    /* الترتيب التحليلي الصحيح لبطاقة عبء: الأثقل أولاً (الجنوب 456 يتصدر) —
       لا ترتيب الإصدار الجغرافي؛ إصلاح مراجعة الجولة 1: كان صف الجنوب
       آخر الصفوف فيُقص عند ضيق العمود وهو جوهر رؤية cd2 ذاتها. */
    const byLoadDesc = model.sectors.slice()
      .sort((a, b) => b.loadPerMonitor - a.loadPerMonitor);
    for (const s of byLoadDesc) {
      const dots = h("span", { class: "ctl-mon-dots", "aria-hidden": "true" });
      for (let i = 0; i < s.row.monitors; i++) {
        dots.appendChild(h("i", { class: "ctl-mon-dot" }));
      }
      const row = h("div", { class: "ctl-mon-row" },
        h("span", { class: "ctl-mon-name" }, s.row.short),
        dots,
        h("span", { class: "ctl-mon-track" },
          h("span", {
            class: "ctl-mon-fill",
            style: { width: (s.loadPerMonitor / model.maxSector.load) * 100 + "%" },
          }),
        ),
        h("span", { class: "ctl-mon-load" }, fmt.int(s.loadPerMonitor)),
      );
      activatable(row, () => {
        openDetailWithFocusReturn(ctx, row,
          sectorDetail(ctx, model, s.row.id), { title: String(s.row.name) });
      }, s.row.name + " — " + fmt.noun(s.row.monitors, "monitor")
        + "، العبء " + fmt.int(s.loadPerMonitor));
      dist.appendChild(row);
    }
    dist.appendChild(h("div", { class: "ctl-mon-note" },
      "العبء " + transparentLine("violations ÷ monitors")));
    cell.appendChild(dist);

    /* 15.3) زر الملحق: سجل المراقبين الـ18 يعيش هناك حصراً — قرار §2 */
    const appx = h("button", {
      class: "ctl-appx",
      type: "button",
      "data-interactive": "",
      onclick: () => ctx.openAppendix("monitoring"),
    },
      h("span", { class: "ctl-appx-main" },
        h("span", { class: "ctl-appx-label" }, "ملحق الرقابة الميدانية"),
        h("span", { class: "ctl-appx-sub" }, "سجل المراقبين الميدانيين — قيد المطابقة"),
      ),
      h("span", { class: "ctl-btn-arrow", "aria-hidden": "true" }, "←"),
    );
    cell.appendChild(appx);

    /* 15.4) سطر الحداثة والاحتساب */
    cell.appendChild(h("div", { class: "ctl-meta" },
      "بيانات حتى ", h("b", {}, model.asOf),
      " · تاريخ الحساب ", h("b", {}, fmt.date(model.calc)),
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     16) الملخص الناطق — فقرة مخفية بصرياً تلخص اللوحة لقارئات الشاشة
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, ctx, model) {
    const south = model.sectorById.south;
    el.appendChild(h("p", { class: "ctl-sr" },
      "لوحة الرقابة الميدانية: " + fmt.noun(model.totVisits, "visit")
      + " و" + fmt.noun(model.totViol, "violation")
      + " خلال " + model.period
      + "، نفذها " + fmt.noun(model.totMon, "monitor")
      + " وأسفرت عن " + fmt.noun(model.totClo, "decision") + " بالإغلاق. "
      + "قطاع الجنوب الأعلى مخالفاتٍ بواقع "
      + fmt.noun(south.row.violations, "violation")
      + " أي " + fmt.pct(south.sd.violations_share_pct) + " من الإجمالي. "
      + "يتصدر الأنواعَ " + model.types[0].t.name
      + " بواقع " + fmt.noun(model.types[0].t.count, "violation") + ". "
      + "معدل الامتثال المورّد " + fmt.pct(model.compliance.value)
      + " — " + (STATUS_BADGE[model.compliance.status] || String(model.compliance.status)) + ". "
      + "الخريطة تعرض توزيع المخالفات ونقاط التركّز الرقابي على أحياء الرياض، "
      + "ولكل رسم في هذه اللوحة جدول بيانات مكافئ.",
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     17) الوصول العميق — معاملات المسار تُلبى بعد اكتمال البناء
     ══════════════════════════════════════════════════════════════════════════ */
  function honourDeepLink(ctx, model) {
    const p = ctx.params;

    /* ?sector=south → ملف القطاع */
    if (p.sector && model.sectorById[p.sector]) {
      ctx.openDetail(sectorDetail(ctx, model, p.sector),
        { title: String(model.sectorById[p.sector].row.name) });
      return;
    }

    /* ?month=2026-03 → ملف الشهر */
    if (p.month) {
      const idx = model.months.findIndex((r) => r.iso === p.month);
      if (idx >= 0) {
        ctx.openDetail(monthDetail(ctx, model, idx),
          { title: "ملف " + model.months[idx].label });
        return;
      }
    }

    /* ?vtype=overcrowding → ملف نوع المخالفة */
    if (p.vtype) {
      const idx = model.types.findIndex((e) => e.t.id === p.vtype);
      if (idx >= 0) {
        ctx.openDetail(typeDetail(ctx, model, idx),
          { title: String(model.types[idx].t.name) });
      }
    }
    /* معامل غير صالح: تجاهل صامت — لا شاشات خطأ في مسرح العرض */
  }

  /* ══════════════════════════════════════════════════════════════════════════
     18) بناء القسم — الترويسة ثم الشريط ثم الشبكة (صفان + عمود ممتد)
     ══════════════════════════════════════════════════════════════════════════ */
  function build(el, ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const model = controlModel(rel, der);

    /* متطابقات مستوى اللوحة (المتطابقات التفصيلية داخل controlModel) */
    guard("build", {
      "المفتاح القانوني للرؤى موجود أو يغيب بصدق":
        !rel.insight_panels || !!rel.insight_panels.sections,
      "تسمية العينة حاضرة": !!model.sampleLabel,
      "فترة الرصد معلنة": !!model.period,
    });

    /* الترويسة: سياق ذهبي + عنوان + وسم حداثة + سطر الفترة المرجعية */
    RH.presenter.layout.sectionHeader(el, {
      kicker: "الإنفاذ الميداني",
      title: "الرقابة الميدانية",
      badge: "بيانات حتى " + model.asOf,
      meta: model.period,
    });

    /* شريط المؤشرات الخمسة القابلة للنقر */
    buildKpiStrip(el, ctx, model);

    /* الشبكة: 12 عموداً؛ قالب الصفوف في control.css.
       الترتيب البصري RTL: الخلية الأولى أقصى اليمين.
       صف 1: النشاط الشهري (5) + الأنواع (4) + عمود الرؤى (3 ممتد صفين)
       صف 2: القطاعات (4) + الخريطة (3) + أعلى 5 أحياء (2) */
    const g = RH.presenter.layout.grid(el, { cols: 12, cls: "ctl-grid" });

    const cMonthly = g.cell({ span: 5, cls: "ctl-cell-monthly" });
    const cTypes = g.cell({ span: 4, cls: "ctl-cell-types" });
    const cRail = g.cell({ span: 3, rows: 2, cls: "ctl-cell-rail" });

    const cSector = g.cell({ span: 4, cls: "ctl-cell-sector" });
    const cMap = g.cell({ span: 3, cls: "ctl-cell-map" });
    const cTop = g.cell({ span: 2, cls: "ctl-cell-top" });

    buildMonthlyCell(cMonthly, ctx, model);
    buildTypesCell(cTypes, ctx, model);
    buildRail(cRail, ctx, model);
    buildSectorCell(cSector, ctx, model);
    buildMapCell(cMap, ctx, model, ctx.onTeardown);
    buildTopCell(cTop, ctx, model);

    /* الملخص الناطق ثم تلبية معامل الوصول العميق إن وُجد */
    buildSrSummary(el, ctx, model);
    honourDeepLink(ctx, model);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     19) تسجيل القسم — عقد RH.sections.register (order:4، backdrop:"control"،
         حالة واحدة بلا خطوات بناء: مركز القيادة يُقرأ دفعة واحدة).
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "control",
    order: 4,
    title: "الرقابة الميدانية",
    kicker: "الإنفاذ الميداني",
    backdrop: "control",
    dim: 0.84,
    steps: 0,
    major: false,
    build,
  });

  /* منفذ اختبار داخلي (ليس من عقد القسم): يكشف بُناة النموذج والبطاقات
     للاختبارات الآلية كي تتحقق من مطابقة أرقام البطاقات لمرايا الإصدار
     دون بناء DOM المسرح كاملاً. البادئة السفلية تعلن أنه غير معد
     للاستهلاك من بقية الأقسام. */
  RH.sections._controlInternals = {
    controlModel,
    nounUnit,
    monthDetail,
    typeDetail,
    sectorDetail,
    RANK_BADGES,
    STATUS_BADGE,
    VALID_MEASURES,
    MAP_LAYERS,
  };
})();
