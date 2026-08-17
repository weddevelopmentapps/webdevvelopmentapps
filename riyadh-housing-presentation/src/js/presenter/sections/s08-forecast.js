/* ════════════════════════════════════════════════════════════════════════════
   s08-forecast.js — القسم 8: «سيناريوهات العجز» — القراءة الاستشرافية الكاملة
   ────────────────────────────────────────────────────────────────────────────
   لوحة قيادة كثيفة (عقد V2_CONTRACTS §1 — order:8, id:"forecast",
   backdrop:"forecast" — يمر عبر مستعار mediaBg إلى خلفية الطلب):

     ▸ شريط ستة مؤشرات كبرى أعلى الشاشة — كل رقم قابل للنقر يفتح بطاقة
       «الأصل والمنهجية» (القيمة الدقيقة، مصدرها في الإصدار، وصيغة أي
       اشتقاق عرضي، والتحفظ الحرفي حيث يلزم):
         1. عجز اليوم (مرساة القراءة)       807.6 ألف سرير  (مرجاني — عجز حصراً)
         2. المتحفظ — يونيو 2027            904.6 ألف سرير  (+97 ألف عن اليوم)
         3. الأساسي — يونيو 2027            865 ألف سرير    (+57.4 ألف عن اليوم)
         4. المتفائل — يونيو 2027           821.8 ألف سرير  (+14.2 ألف عن اليوم)
         5. نطاق عدم اليقين — يونيو 2027    82.8 ألف سرير   (من 19.8 ألف بدايةً)
         6. وتيرة الاتساع الشهرية (أساسي)   5,741 سرير شهرياً (اشتقاق عرضي معلن)

     ▸ شبكة رسوم تملأ ما تبقى من الشاشة (صفان + عمود رؤى ممتد):
         صف 1: forecastScenarios الكبير (خطوط النطاق الثلاثة بتسميات النهاية
                ومرساة خط الأساس الذهبية عند عجز اليوم — نقر شهر يفتح ملفه
                التوقعي الكامل) — الرسم البطل بعرض تسعة أعمدة
         صف 2: جدول السيناريوهات الشهري الكامل (10 أشهر × متحفظ/أساسي/متفائل/
                النطاق — زر كل شهر يفتح ملفه، والتحويم يظهر تلميح الرسم
                المحوري للشهر ذاته) · بطاقات المقارنة الصغيرة الثلاث
                (نهاية الأفق لكل سيناريو بأشرطة أساس موحد ووتيرته الشهرية —
                نقر البطاقة يفتح ملف السيناريو الكامل)

     ▸ عمود الرؤى الممتد: بطاقة التحفظ الحرفي من release.scenarios.caveat
       بوسمها الذهبي (وسم الحالة supplied_unvalidated → «سيناريوهات مورّدة —
       غير معتمدة») + ترتيب نهاية الأفق (ثلاثة أزرار تنازلياً — المسار
       المفاتيحي الموازي لبطاقات المقارنة) + زر الملحق التحليلي + سطر
       حداثة البيانات. لا مفتاح insight_panels قانونياً لهذا القسم
       (المفاتيح القانونية supply|licensing|control|initiatives) فلا
       يُختلق عمود رؤى — بطاقة التحفظ الصادقة تتصدر العمود بدلاً منه.

     ▸ ربط تحويم ثنائي الاتجاه: التحويم/التركيز على صف ترتيب أو بطاقة
       مقارنة يبرز خط السيناريو في الرسم البطل، والتحويم على خط في الرسم
       يضيء صفه وبطاقته (صنف .hl) — سلوك مركز قيادة حقيقي. تحويم صف شهر
       في الجدول يظهر تلميح الرسم المحوري على الشهر ذاته.

     ▸ وصول عميق عبر معاملات المسار (عقد ctx.params):
         ‎#/section/forecast?month=2026-12‎     يفتح ملف ديسمبر 2026 مباشرة
         ‎#/section/forecast?scenario=base‎     يفتح ملف السيناريو الأساسي
       معامل غير صالح يُتجاهل بصمت — لا شاشات خطأ في مسرح العرض.

     ▸ دورة تركيز مفاتيحية مكتملة: إغلاق أي بطاقة تفاصيل (بأي بوابة من
       بواباتها الثلاث — Escape/زر الإغلاق/نقر الخلفية) يعيد التركيز إلى
       العنصر الذي فتحها — مراقب طفرات على جذر القسم يُفصل فور الإصابة
       وعند الهدم (عقد ctx.onTeardown).

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل رقم من release.json (عبر ctx.release/ctx.derived) —
     صفوف release.scenarios.rows كما وردت، وكل اشتقاق عرضي (فوارق، نطاق،
     متوسط شهري) عملية حسابية معلنة على قيم الإصدار تُوثق صيغتها في بطاقة
     الأصل ذاتها. كل رقم ظاهر عبر RH.core.fmt حصراً (تطابق العدد والمعدود
     عبر fmt.noun/countNoun، عزل اتجاهي عبر fmt.iso/fmt.pct).
   • السيناريوهات «مورّدة غير معتمدة» (release.scenarios.status) — التحفظ
     الحرفي يظهر بوسمه الذهبي في بطاقة العمود وفي بطاقات التفاصيل، ولا
     يُعرض أي سيناريو كتوقع معتمد.
   • كل نص إصدار يُبنى بعقد dom.h النصي (textContent) — لا innerHTML لمحتوى
     الإصدار إطلاقاً؛ نصوص التلميحات داخل الرسم تمر عبر theme.esc في مكتبة
     charts2 ذاتها.
   • منظومة المعنى: المرجاني للعجز حصراً (السيناريوهات الثلاثة درجات
     ترتيبية من صبغته داخل الرسم القانوني)، الذهبي لخط الأساس ووسوم
     الاعتماد حصراً، ولا يلوّن أي منهما زخرفة.
   • الرسم عبر مُنشئ RH.viz.charts2.forecastScenarios القانوني حصراً بمفتاح
     مثيلات "forecast" (لا يصطدم بمثيل الملخص التنفيذي key:"summary").
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (أزرار حقيقية أو role=button
     بمعالجة Enter/مسافة) وموسوم data-interactive كي لا يبتلع جهاز التقديم
     ضغطاته (عقد الملاحة §8)؛ Escape يغلق بطاقة التفاصيل (عقد ctx.openDetail).
   • prefers-reduced-motion محترم: العد التصاعدي عبر RH.viz.motion (قيمة
     نهائية فورية عند التقليل)، وانتقالات CSS تُصفَّر في forecast.css.
   • التنظيف عبر ctx.onTeardown: فصل مستمعي مثيل ECharts (المثيل يعمّر في
     سجل الثيم أطول من DOM القسم) ومراقبي الطفرات — مستمعو عناصر القسم
     تسقط مع هدم DOM ذاته.
   • 16:9 يتسع دون تمرير عند 1920×1080 بوحدة ‎--su؛ الفيضان الرأسي في وضع
     اللوحة يُحل بتمرير داخلي في جسم القسم حصراً (forecast.css) — المسرح
     لا يتمرر أفقياً أبداً.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* نسبة مئوية بنفس تقريب بايثون (نصف لأعلى، منزلة واحدة) — المرآة الرسمية */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /* ──────────────────────────────────────────────────────────────────────────
     ثوابت عرض (لا قيم بيانات إطلاقاً)
     ────────────────────────────────────────────────────────────────────────── */

  /** صيغ عدد ومعدود محلية لما لا تغطيه NOUNS المركزية (عقد fmt.countNoun) */
  const LOCAL_NOUNS = {
    month: { one: "شهر واحد", two: "شهران", few: "أشهر", many: "شهراً", hundred: "شهر" },
    scenario: { one: "سيناريو واحد", two: "سيناريوهان", few: "سيناريوهات", many: "سيناريو", hundred: "سيناريو" },
  };

  /** خريطة عرض مقفلة لحالات الاعتماد المعروفة — النص من العقد حرفياً؛
      حالة غير معروفة تُعرض بمعرفها الخام (صدق لا تجميل) */
  const STATUS_BADGE = {
    supplied_unvalidated: "سيناريوهات مورّدة — غير معتمدة",
    pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
    indicative_not_approved: "قيمة استرشادية — غير معتمدة",
  };

  /** تعريفات السيناريوهات الثلاثة — أسماء العرض والدرجات الترتيبية من صبغة
      الخلل الواحدة (مرآة ثوابت المُنشئ القانوني forecastScenarios المعتمدة
      من V1 حرفياً — ثوابت عرض لا قيم بيانات): الأساسي الأفتح والأبرز،
      المتحفظ أوسط، المتفائل الأدكن. الترتيب هنا ترتيب العرض في البطاقات
      والترتيب التنازلي لنهاية الأفق (المتحفظ ≥ الأساسي ≥ المتفائل ببوابة). */
  const SCENARIOS = [
    { key: "conservative", name: "المتحفظ", short: "متحفظ", color: "#C05841" },
    { key: "base", name: "الأساسي", short: "أساسي", color: "#E08A6B" },
    { key: "optimistic", name: "المتفائل", short: "متفائل", color: "#8C4630" },
  ];

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js: فشل فحص لا يُسقط
     اللوحة (الإصدار المنشور اجتاز البوابات الـ152 أصلاً) بل ينبه في وحدة
     التحكم لالتقاط أي انجراف بيانات مبكراً أثناء التطوير.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s08-forecast/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) أدوات صياغة وتفاعل مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** قيمة موقعة بصيغة تنفيذية مختصرة وعزل اتجاهي حتمي: ‎+97‎ ألف / ‎+5,741‎ —
      الرقم اللاتيني والإشارة داخل عازل LRI وكلمة المقياس عربية خارجه */
  function signedCompact(v) {
    const parts = fmt.compactParts(Math.abs(v));
    const sign = v >= 0 ? "+" : "−";
    return fmt.iso(sign + parts.num) + (parts.word ? fmt.NBSP + parts.word : "");
  }

  /** عدد صحيح موقع معزول اتجاهياً: ‎+7,840‎ */
  function signedInt(v) {
    return fmt.iso((v >= 0 ? "+" : "−") + fmt.int(Math.abs(v)));
  }

  /** قيمة تنفيذية مختصرة مع وحدة موحدة اللحاق: «904.6 ألف سرير» / «3,136 سريراً» */
  function compactBeds(v) {
    return Math.abs(v) >= 10000
      ? fmt.compact(v) + fmt.NBSP + "سرير"
      : fmt.noun(v, "bed");
  }

  /** جعل عنصر غير-زر قابلاً للتفعيل بالكامل: نقر + Enter + مسافة، بدور
      button ووسم data-interactive (فلا يبتلع جهاز التقديم ضغطاته — عقد §8).
      المستمعون على عناصر القسم ذاته فيسقطون مع هدم DOM (لا تسريب). */
  function activatable(el, onAct, ariaLabel) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-interactive", "");
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    el.classList.add("fct-act");
    el.addEventListener("click", onAct);
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
        ev.preventDefault();
        ev.stopPropagation();
        onAct();
      }
    });
  }

  /** توصيل مستمع مثيل ECharts بفصلٍ مضمون: المثيل يعمّر في سجل الثيم أطول
      من DOM القسم فيلزم off صريح عند الهدم (عقد ctx.onTeardown) */
  function wireChartEvent(ctx, chart, event, handler) {
    chart.on(event, handler);
    ctx.onTeardown(() => {
      if (!chart.isDisposed()) chart.off(event, handler);
    });
  }

  /** فتح بطاقة تفاصيل مع إعادة التركيز إلى العنصر المستدعي عند الإغلاق:
      طبقة السجل تُغلق بثلاث بوابات (Escape/زر/خلفية) دون رد نداء، فنراقب
      إزالة ‎.detail-overlay‎ من جذر القسم بمراقب طفرات يُفصل فور الإصابة
      وعند هدم القسم (عقد ctx.onTeardown) — دورة تركيز مفاتيحية مكتملة. */
  function openDetailWithFocusReturn(ctx, invoker, node, opts) {
    const close = ctx.openDetail(node, opts);
    const root = invoker && invoker.closest ? invoker.closest(".dash") : null;
    if (root) {
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
    return close;
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

  /** سطر مصدر لمشتقة منشورة: الصيغة المعتمدة بإصدارها من كتلة derived */
  function derivedSourceLine(dm) {
    return "قيمة مشتقة — الصيغة المعتمدة: " + fmt.iso(String(dm.formula))
      + " (إصدار الصيغة " + fmt.iso(String(dm.formula_version)) + ")";
  }

  /** سطر إفصاح عن اشتقاق عرضي محلي: عملية حسابية معلنة على قيم الإصدار —
      ليست مشتقة منشورة فتُعلن صيغتها نصاً في بطاقة الأصل ذاتها (صدق تام) */
  function displayCalcLine(text) {
    return "اشتقاق عرضي: " + text + " — عملية حسابية على قيم الإصدار كما "
      + "وردت، لا قيمة منشورة مستقلة";
  }

  /** وسم حالة الاعتماد المعروض — من الخريطة المقفلة أو المعرف الخام صدقاً */
  function statusBadgeText(status) {
    return STATUS_BADGE[status] || String(status || "—");
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) نموذج التوقعات الجاهز للعرض — يُبنى مرة واحدة عند بناء القسم
     ──────────────────────────────────────────────────────────────────────────
     يضم: صفوف السيناريوهات العشرة كما وردت + لكل سيناريو ملفه المحسوب
     عرضاً (بداية/نهاية الأفق، الزيادة منذ اليوم، متوسط الاتساع الشهري،
     الخطوات الشهرية بأكبرها) + سلسلة النطاق الشهرية (متحفظ − متفائل) +
     مرساة عجز اليوم من المشتقة المنشورة. كل الأرقام من الإصدار حصراً.
     ══════════════════════════════════════════════════════════════════════════ */
  function forecastModel(rel, der) {
    const sc = rel.scenarios;
    const rows = sc.rows;
    const deficitNow = der.deficit_beds;
    const first = rows[0];
    const last = rows[rows.length - 1];

    /* ملف كل سيناريو: قيم الحواف والخطوات الشهرية محسوبة من الصفوف ذاتها.
       الخطوة الأولى تُقاس من عجز اليوم (مرساة القراءة) والبقية من الشهر
       السابق — كلها فوارق مباشرة بين قيم الإصدار. */
    const byKey = {};
    const list = SCENARIOS.map((def) => {
      const firstV = first[def.key];
      const lastV = last[def.key];
      const steps = [];
      let maxStep = null;
      for (let i = 0; i < rows.length; i++) {
        const prev = i === 0 ? deficitNow : rows[i - 1][def.key];
        const step = {
          iso: rows[i].iso,
          label: rows[i].label,
          value: rows[i][def.key],
          delta: rows[i][def.key] - prev,
          fromToday: i === 0,
        };
        steps.push(step);
        if (!maxStep || step.delta > maxStep.delta) maxStep = step;
      }
      const m = {
        def,
        first: firstV,
        last: lastV,
        sinceToday: lastV - deficitNow,
        horizonRise: lastV - firstV,
        avgMonthly: Math.round((lastV - deficitNow) / rows.length),
        steps,
        maxStep,
      };
      byKey[def.key] = m;
      return m;
    });

    /* سلسلة النطاق الشهرية: المتحفظ − المتفائل لكل شهر — قراءة عدم اليقين */
    const band = rows.map((r) => ({
      iso: r.iso,
      label: r.label,
      span: r.conservative - r.optimistic,
    }));
    const bandFirst = band[0].span;
    const bandLast = band[band.length - 1].span;

    /* متطابقات النموذج — مرآة بوابة الرتابة في المُنشئ القانوني + خصائص
       البيانات التي تتكئ عليها اللوحة كاملة (تنبيه مبكر عند انجراف) */
    guard("forecastModel", {
      "عشرة أشهر توقع كما في الإصدار": rows.length === 10,
      "المتحفظ ≥ الأساسي ≥ المتفائل شهرياً":
        rows.every((r) => r.conservative >= r.base && r.base >= r.optimistic),
      "كل سيناريو غير متناقص عبر الأفق": list.every(
        (m) => m.steps.every((s) => s.delta >= 0)),
      "كل القيم فوق عجز اليوم":
        rows.every((r) => r.optimistic >= deficitNow),
      "عجز اليوم يطابق المشتقة المنشورة":
        deficitNow === rel.derived.deficit_beds.value,
      "النطاق يتسع عبر الأفق": bandLast >= bandFirst,
      "حالة الاعتماد معروفة للعرض": !!STATUS_BADGE[sc.status],
      "نص التحفظ الحرفي حاضر": typeof sc.caveat === "string" && sc.caveat.length > 0,
    });

    return {
      sc, rows, first, last, deficitNow,
      list, byKey,
      band, bandFirst, bandLast,
      badge: statusBadgeText(sc.status),
      monthsNoun: fmt.countNoun(rows.length, LOCAL_NOUNS.month),
    };
  }

  /** الترتيب التنازلي لنهاية الأفق — المتحفظ أولاً (قراءة أسوأ الحالات أولاً).
      الترتيب على القيم لا على مواقع ثابتة كي يصمد أمام أي إصدار قادم. */
  function byLastDesc(model) {
    return model.list.slice().sort((a, b) => b.last - a.last);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) هيكل بطاقة التفاصيل الموحد — عقد Node مبني بـ dom.h النصي حصراً:
        نصوص الإصدار تدخل textContent فلا مسار HTML إطلاقاً.
        { hero:{num, unit?, label?, tone?}, badges?[{text,tone}], caption?,
          bars?[{label, pct, valueText, tone?, color?}], rows?[{k, v, tone?}],
          table?{columns, rows, note?}, notes?[], sources?[],
          actions?[{label, onAct, aria?}] }
     ══════════════════════════════════════════════════════════════════════════ */

  /** شريط مقارنة أفقي واحد: تسمية + مسار بامتلاء نسبي + قيمة نصية كاملة.
      العرض نسبة من أساس موحد يمرره المستدعي — الشريط زخرفة مكملة للرقم
      الحقيقي المجاور فلا يحمل دلالة وحده (aria-hidden على المسار).
      color اختياري لدرجة السيناريو الترتيبية (من ثوابت العرض المعتمدة). */
  function compareBar(o) {
    const width = Math.max(0, Math.min(100, o.pct));
    const fill = h("span", { class: "fct-cbar-fill", style: { width: width + "%" } });
    if (o.color) fill.style.background = o.color;
    return h("div", { class: "fct-cbar" + (o.tone ? " " + o.tone : "") },
      h("span", { class: "fct-cbar-k" }, o.label),
      h("span", { class: "fct-cbar-track", "aria-hidden": "true" }, fill),
      h("b", { class: "fct-cbar-v" }, o.valueText),
    );
  }

  /** جدول كثيف داخل بطاقة التفاصيل — حاوية قابلة للتمرير الداخلي كي لا
      تفيض البطاقة (عقد «التمرير داخل المكوّن لا المسرح») */
  function detailTable(t) {
    const wrap = h("div", { class: "fct-table" },
      h("table", { class: "table-dense" },
        h("thead", {}, h("tr", {},
          t.columns.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, t.rows.map((r) => h("tr", {},
          r.map((cell, i) => h(i === 0 ? "th" : "td",
            i === 0 ? { scope: "row" } : {}, cell))))),
      ));
    if (!t.note) return wrap;
    return h("div", {}, wrap, h("div", { class: "fct-note" }, t.note));
  }

  /** الهيكل الكامل لبطاقة التفاصيل */
  function detailShell(o) {
    const box = h("div", { class: "fct-detail" });

    if (o.hero) {
      box.appendChild(h("div", { class: "fct-hero" },
        h("span", {
          class: "fct-hero-num" + (o.hero.tone ? " " + o.hero.tone : ""),
        }, o.hero.num),
        o.hero.unit ? h("span", { class: "fct-hero-unit" }, o.hero.unit) : null,
        o.hero.label ? h("span", { class: "fct-hero-label" }, o.hero.label) : null,
      ));
    }
    if (o.badges && o.badges.length) {
      box.appendChild(h("div", { class: "fct-badges" },
        o.badges.map((b) => h("span", {
          class: "fct-badge" + (b.tone ? " " + b.tone : ""),
        }, b.text))));
    }
    if (o.caption) {
      box.appendChild(h("p", { class: "fct-cap" }, o.caption));
    }
    if (o.bars && o.bars.length) {
      box.appendChild(h("div", { class: "fct-cbars" }, o.bars.map(compareBar)));
    }
    if (o.rows && o.rows.length) {
      box.appendChild(h("div", { class: "fct-rows" },
        o.rows.map((r) => h("div", {
          class: "fct-row" + (r.tone ? " " + r.tone : ""),
        },
          h("span", { class: "fct-row-k" }, r.k),
          h("b", { class: "fct-row-v" }, r.v),
        ))));
    }
    if (o.table) box.appendChild(detailTable(o.table));
    if (o.notes && o.notes.length) {
      box.appendChild(h("div", { class: "fct-notes" },
        o.notes.map((n) => h("p", { class: "fct-note" }, n))));
    }
    if (o.sources && o.sources.length) {
      box.appendChild(h("div", { class: "fct-sources" },
        o.sources.map((s) => h("p", { class: "fct-src" }, s))));
    }
    if (o.actions && o.actions.length) {
      box.appendChild(h("div", { class: "fct-actions" },
        o.actions.map((a) => h("button", {
          class: "fct-btn",
          type: "button",
          "data-interactive": "",
          "aria-label": a.aria || a.label,
          onclick: a.onAct,
        },
          h("span", {}, a.label),
          h("span", { class: "fct-btn-arrow", "aria-hidden": "true" }, "←"),
        ))));
    }
    return box;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) بُناة بطاقات التفاصيل — كل بطاقة أرقامها من الإصدار حصراً، وكل
        اشتقاق عرضي يعلن صيغته في سطر مصادره (displayCalcLine)، والتحفظ
        الحرفي حاضر في كل بطاقة تعرض قيم السيناريوهات (إفصاح لا يسقط).
     ══════════════════════════════════════════════════════════════════════════ */

  /** 4-أ: بطاقة عجز اليوم — مرساة القراءة الاستشرافية: القيمة الدقيقة
      وصيغة المشتقة المنشورة ومصدرا مدخليها الخامين */
  function todayDetail(ctx, model) {
    const rel = ctx.release;
    const dm = rel.derived.deficit_beds;
    const demand = rel.metrics.total_demand;
    const cap = rel.metrics.licensed_beds;

    return detailShell({
      hero: {
        num: fmt.int(model.deficitNow),
        unit: "سرير",
        label: "العجز القائم اليوم — " + rel.meta.data_as_of,
        tone: "neg",
      },
      badges: [
        { text: "مرساة الخط الذهبي في رسم السيناريوهات", tone: "gold" },
      ],
      caption: "هذا هو الرقم الذي تُقاس إليه قراءات السيناريوهات الثلاثة "
        + "عبر أشهر الأفق العشرة كلها: كل زيادة معروضة في هذه اللوحة هي "
        + "فارق عن هذا العجز القائم.",
      rows: [
        { k: demand.label, v: fmt.unitAfter(demand.value, "سرير") },
        { k: cap.label, v: fmt.unitAfter(cap.value, "سرير"), tone: "pos" },
        {
          k: "نسبة تغطية الطلب اليوم",
          v: fmt.pct(ctx.derived.coverage_pct),
        },
        {
          k: "أدنى سيناريو بنهاية الأفق (المتفائل)",
          v: fmt.unitAfter(model.byKey.optimistic.last, "سرير"),
          tone: "neg",
        },
        {
          k: "أعلى سيناريو بنهاية الأفق (المتحفظ)",
          v: fmt.unitAfter(model.byKey.conservative.last, "سرير"),
          tone: "neg",
        },
      ],
      notes: [
        "لا يهبط أي من السيناريوهات الثلاثة دون العجز القائم في أي شهر من "
        + "أشهر الأفق العشرة — أفضل الحالات المورّدة تبقى فوق عجز اليوم.",
      ],
      sources: [
        derivedSourceLine(dm),
        rawSourceLine(rel, demand),
        rawSourceLine(rel, cap),
      ],
      actions: [
        {
          label: "الملحق التحليلي: الطلب — التفاصيل والتحليل",
          onAct: () => ctx.openAppendix("demand"),
        },
      ],
    });
  }

  /** 4-ب: ملف السيناريو الكامل — بطاقة القلب التفاعلية: حواف الأفق،
      الزيادة منذ اليوم، الوتيرة الشهرية، أكبر خطوة، وجدول الأشهر العشرة
      بقيمها وخطواتها — كلها من صفوف الإصدار وفوارقها المباشرة.
      goto(otherKey) اختيارية: تسلسل بطاقات داخل الطبقة (تغلق الحالية
      وتفتح ملف سيناريو آخر دون العودة إلى الشبكة). */
  function scenarioDetail(ctx, model, key, goto) {
    const m = model.byKey[key];
    if (!m) return null;
    const basis = model.byKey.conservative.last;

    /* أشرطة الأفق الثلاثة على أساس موحد (نهاية المتحفظ) — مقارنة صادقة */
    const bars = [
      {
        label: "عجز اليوم",
        pct: pctOf(model.deficitNow, basis),
        valueText: compactBeds(model.deficitNow),
        tone: "today",
      },
      {
        label: "بداية الأفق — " + model.first.label,
        pct: pctOf(m.first, basis),
        valueText: compactBeds(m.first),
        color: m.def.color,
      },
      {
        label: "نهاية الأفق — " + model.last.label,
        pct: pctOf(m.last, basis),
        valueText: compactBeds(m.last),
        color: m.def.color,
      },
    ];

    return detailShell({
      hero: {
        num: fmt.int(m.last),
        unit: "سرير",
        label: "السيناريو " + m.def.name + " — " + model.last.label,
        tone: "neg",
      },
      badges: [
        { text: model.badge, tone: "gold" },
        {
          text: "زيادة " + signedCompact(m.sinceToday) + " سرير عن عجز اليوم",
          tone: "neg",
        },
      ],
      caption: model.sc.title,
      bars,
      rows: [
        {
          k: "متوسط الاتساع الشهري عبر الأفق",
          v: fmt.unitAfter(m.avgMonthly, "سرير شهرياً"),
        },
        {
          k: "أكبر خطوة شهرية — " + m.maxStep.label
            + (m.maxStep.fromToday ? " (تُقاس من عجز اليوم)" : ""),
          v: signedInt(m.maxStep.delta) + fmt.NBSP + "سرير",
          tone: "neg",
        },
        {
          k: "الاتساع داخل الأفق (يونيو − سبتمبر)",
          v: signedCompact(m.horizonRise) + fmt.NBSP + "سرير",
        },
        {
          k: "ترتيب السيناريو بنهاية الأفق",
          v: fmt.int(byLastDesc(model).findIndex((x) => x.def.key === key) + 1)
            + fmt.NBSP + "من" + fmt.NBSP + fmt.int(model.list.length),
        },
      ],
      table: {
        columns: ["الشهر", "العجز المتوقع", "الخطوة الشهرية"],
        rows: m.steps.map((s) => [
          s.label + (s.fromToday ? " — أول أشهر الأفق" : ""),
          fmt.unitAfter(s.value, "سرير"),
          signedInt(s.delta) + fmt.NBSP + "سرير"
            + (s.fromToday ? " عن عجز اليوم" : ""),
        ]),
        note: "القيم كما وردت حرفياً في صفوف الإصدار؛ الخطوة الشهرية فارق "
          + "مباشر بين شهرين متتاليين (وأولها يُقاس من عجز اليوم "
          + fmt.compact(model.deficitNow) + " سرير).",
      },
      notes: [model.sc.caveat],
      sources: [
        displayCalcLine("الزيادة منذ اليوم = قيمة الشهر − العجز القائم؛ "
          + "متوسط الاتساع = الزيادة منذ اليوم ÷ " + model.monthsNoun),
        "صفوف السيناريو من release.scenarios كما وردت (الحالة: "
        + fmt.iso(String(model.sc.status)) + ")",
      ],
      actions: (function () {
        /* تسلسل داخل الطبقة: زر لكل من السيناريوهين الآخرين بترتيب
           العرض القانوني، ثم زر الملحق — بلا عودة إلى الشبكة */
        const acts = [];
        if (typeof goto === "function") {
          for (const other of SCENARIOS) {
            if (other.key === key) continue;
            acts.push({
              label: "ملف السيناريو " + other.name,
              aria: "الانتقال إلى ملف السيناريو " + other.name
                + " داخل طبقة التفاصيل",
              onAct: () => goto(other.key),
            });
          }
        }
        acts.push({
          label: "الملحق التحليلي: الطلب — التفاصيل والتحليل",
          onAct: () => ctx.openAppendix("demand"),
        });
        return acts;
      })(),
    });
  }

  /** 4-ج: ملف الشهر التوقعي — نقر شهر في الرسم البطل أو الجدول:
      قيم السيناريوهات الثلاثة وخطوتها عن الشهر السابق ونطاق الشهر
      وفارق كلٍّ منها عن عجز اليوم. goto(otherIndex) اختيارية: تصفح
      الأشهر داخل الطبقة (السابق/التالي) دون العودة إلى الشبكة. */
  function monthDetail(ctx, model, i, goto) {
    const r = model.rows[i];
    if (!r) return null;
    const basis = model.byKey.conservative.last;
    const isLast = i === model.rows.length - 1;

    const bars = SCENARIOS.map((def) => ({
      label: def.name,
      pct: pctOf(r[def.key], basis),
      valueText: compactBeds(r[def.key]),
      color: def.color,
    }));

    const rows = [];
    for (const def of SCENARIOS) {
      const step = model.byKey[def.key].steps[i];
      rows.push({
        k: def.name + " — الخطوة "
          + (step.fromToday ? "عن عجز اليوم" : "عن الشهر السابق"),
        v: signedInt(step.delta) + fmt.NBSP + "سرير",
      });
    }
    rows.push({
      k: "نطاق عدم اليقين في هذا الشهر (متحفظ − متفائل)",
      v: fmt.unitAfter(model.band[i].span, "سرير"),
    });
    rows.push({
      k: "زيادة الأساسي عن عجز اليوم",
      v: signedCompact(r.base - model.deficitNow) + fmt.NBSP + "سرير",
      tone: "neg",
    });

    return detailShell({
      hero: {
        num: fmt.int(r.base),
        unit: "سرير",
        label: "السيناريو الأساسي — " + r.label,
        tone: "neg",
      },
      badges: [
        { text: model.badge, tone: "gold" },
        isLast ? { text: "نهاية أفق التوقع", tone: "neu" } : null,
      ].filter(Boolean),
      caption: "الشهر " + fmt.int(i + 1) + " من " + model.monthsNoun
        + " في أفق التوقع (" + model.first.label + " – "
        + model.last.label + ").",
      bars,
      rows,
      notes: [model.sc.caveat],
      sources: [
        "صف الشهر من release.scenarios.rows كما ورد حرفياً",
        displayCalcLine("الخطوة الشهرية والنطاق فارقان مباشران بين قيم "
          + "الإصدار"),
      ],
      actions: (function () {
        /* تصفح الأشهر داخل الطبقة: السابق يمين القراءة العربية والتالي
           يسارها — تظهر الأزرار الموجودة فعلاً فقط (لا زر معطلاً) */
        const acts = [];
        if (typeof goto === "function" && i > 0) {
          acts.push({
            label: "الشهر السابق — " + model.rows[i - 1].label,
            aria: "الانتقال إلى ملف " + model.rows[i - 1].label,
            onAct: () => goto(i - 1),
          });
        }
        if (typeof goto === "function" && i < model.rows.length - 1) {
          acts.push({
            label: "الشهر التالي — " + model.rows[i + 1].label,
            aria: "الانتقال إلى ملف " + model.rows[i + 1].label,
            onAct: () => goto(i + 1),
          });
        }
        return acts;
      })(),
    });
  }

  /** 4-د: بطاقة نطاق عدم اليقين — اتساع الفجوة بين المتحفظ والمتفائل
      عبر الأفق: من 19.8 ألف بداية إلى 82.8 ألف نهاية (كلها محسوبة). */
  function bandDetail(ctx, model) {
    return detailShell({
      hero: {
        num: fmt.int(model.bandLast),
        unit: "سرير",
        label: "نطاق عدم اليقين بنهاية الأفق — " + model.last.label,
      },
      badges: [{ text: model.badge, tone: "gold" }],
      caption: "الفارق بين السيناريو المتحفظ والمتفائل شهراً بشهر — كلما "
        + "ابتعد الأفق اتسعت الفجوة بين أسوأ القراءات وأفضلها، وهو ما "
        + "يجعل اعتماد منهجية التوقع شرطاً قبل البناء على أي رقم منها.",
      rows: [
        {
          k: "النطاق في أول الأفق — " + model.first.label,
          v: fmt.unitAfter(model.bandFirst, "سرير"),
        },
        {
          k: "النطاق في آخر الأفق — " + model.last.label,
          v: fmt.unitAfter(model.bandLast, "سرير"),
        },
        {
          k: "اتساع النطاق عبر الأفق",
          v: signedCompact(model.bandLast - model.bandFirst) + fmt.NBSP + "سرير",
        },
      ],
      table: {
        columns: ["الشهر", "متحفظ", "متفائل", "النطاق"],
        rows: model.rows.map((r, i) => [
          r.label,
          fmt.int(r.conservative),
          fmt.int(r.optimistic),
          fmt.int(model.band[i].span),
        ]),
        note: "القيم بعدد الأسرّة كما وردت في الإصدار؛ النطاق فارق مباشر "
          + "(متحفظ − متفائل).",
      },
      notes: [model.sc.caveat],
      sources: [
        displayCalcLine("النطاق الشهري = المتحفظ − المتفائل لكل صف"),
      ],
    });
  }

  /** 4-هـ: بطاقة وتيرة الاتساع — متوسطات الاتساع الشهرية للسيناريوهات
      الثلاثة وجدول الخطوات الشهرية الكامل جنباً إلى جنب. */
  function paceDetail(ctx, model) {
    const base = model.byKey.base;
    return detailShell({
      hero: {
        num: fmt.int(base.avgMonthly),
        unit: "سرير شهرياً",
        label: "متوسط اتساع العجز — السيناريو الأساسي",
        tone: "neg",
      },
      badges: [{ text: model.badge, tone: "gold" }],
      caption: "متوسط الاتساع الشهري لكل سيناريو محسوب من زيادته الكلية "
        + "منذ عجز اليوم موزعة على " + model.monthsNoun + " — قراءة سرعة "
        + "لا قراءة مسار: الخطوات الشهرية الفعلية في الجدول أدناه.",
      rows: model.list.map((m) => ({
        k: m.def.name + " — متوسط الاتساع الشهري",
        v: fmt.unitAfter(m.avgMonthly, "سرير شهرياً"),
        tone: m.def.key === "base" ? "neg" : null,
      })),
      table: {
        columns: ["الشهر", "خطوة المتحفظ", "خطوة الأساسي", "خطوة المتفائل"],
        rows: model.rows.map((r, i) => [
          r.label + (i === 0 ? " — عن عجز اليوم" : ""),
          signedInt(model.byKey.conservative.steps[i].delta),
          signedInt(model.byKey.base.steps[i].delta),
          signedInt(model.byKey.optimistic.steps[i].delta),
        ]),
        note: "أكبر خطوة في كل سيناريو هي خطوة الشهر الأول لأنها تُقاس من "
          + "عجز اليوم لا من شهر توقع سابق.",
      },
      notes: [model.sc.caveat],
      sources: [
        displayCalcLine("المتوسط = (قيمة " + model.last.label
          + " − عجز اليوم) ÷ " + model.monthsNoun),
      ],
    });
  }

  /** 4-و: بطاقة الحالة الكاملة — التحفظ الحرفي وعنوان الجدول الحرفي
      وحالة الاعتماد ووحدة القياس وحدود الأفق، من release.scenarios حصراً. */
  function caveatDetail(ctx, model) {
    return detailShell({
      badges: [{ text: model.badge, tone: "gold" }],
      caption: model.sc.title,
      rows: [
        { k: "حالة الاعتماد في الإصدار", v: fmt.iso(String(model.sc.status)) },
        { k: "وحدة القياس", v: model.sc.unit },
        { k: "أفق التوقع", v: model.first.label + " – " + model.last.label },
        { k: "عدد أشهر الأفق", v: model.monthsNoun },
        {
          k: "عدد السيناريوهات",
          v: fmt.countNoun(model.list.length, LOCAL_NOUNS.scenario),
        },
      ],
      notes: [
        model.sc.caveat,
        "تعرض هذه اللوحة السيناريوهات كما وردت في ملف البيانات دون أي "
        + "تعديل أو استكمال، ويرافق كل قيمة منها وسم الحالة الذهبي أعلاه.",
      ],
      sources: [
        "كتلة release.scenarios كاملة كما وردت في الإصدار المنشور "
        + fmt.iso(String(ctx.release.release.id)),
      ],
      actions: [
        {
          label: "الملحق التحليلي: الطلب — التفاصيل والتحليل",
          onAct: () => ctx.openAppendix("demand"),
        },
      ],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4-ز) فاتحا التسلسل داخل الطبقة — البوابتان الوحيدتان لبطاقتي الشهر
        والسيناريو في كل مواضع اللوحة (رسم/جدول/شريط/عمود/بطاقات):
        goto يغلق الطبقة الحالية أولاً (عقد ctx.openDetail يعيد دالة إغلاق)
        ثم يفتح البطاقة التالية — فلا تتراكم طبقات فوق بعضها، وإغلاق آخر
        بطاقة يعيد التركيز إلى العنصر الذي بدأ التسلسل (invoker يُمرر عبر
        القفزات كاملة — دورة تركيز واحدة مهما طال التصفح).
     ══════════════════════════════════════════════════════════════════════════ */

  /** فتح ملف شهر بتصفح السابق/التالي داخل الطبقة */
  function openMonthCard(ctx, model, i, invoker) {
    let closeRef = null;
    const node = monthDetail(ctx, model, i, (next) => {
      if (next < 0 || next >= model.rows.length) return;
      if (closeRef) closeRef();
      openMonthCard(ctx, model, next, invoker);
    });
    if (!node) return;
    closeRef = openDetailWithFocusReturn(ctx, invoker, node, {
      title: model.rows[i].label + " — ملف الشهر التوقعي",
    });
  }

  /** فتح ملف سيناريو بالقفز المباشر إلى السيناريوهين الآخرين داخل الطبقة */
  function openScenarioCard(ctx, model, key, invoker) {
    let closeRef = null;
    const node = scenarioDetail(ctx, model, key, (otherKey) => {
      if (!model.byKey[otherKey]) return;
      if (closeRef) closeRef();
      openScenarioCard(ctx, model, otherKey, invoker);
    });
    if (!node) return;
    closeRef = openDetailWithFocusReturn(ctx, invoker, node, {
      title: "السيناريو " + model.byKey[key].def.name + " — الملف الكامل",
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) شريط المؤشرات الكبرى — ستة أرقام بطولية بعقد layout.kpiStrip:
        القيم منسقة سلفاً عبر fmt، العد التصاعدي عند أول دخول فقط
        (مفاتيح fct:kpi:*)، وكل بطاقة قابلة للنقر تفتح بطاقة أصلها.
        المرجاني لعجز اليوم وأسوأ الحالات حصراً — البقية حياد رقمي.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildKpiStrip(el, ctx, model) {
    const cons = model.byKey.conservative;
    const base = model.byKey.base;
    const opt = model.byKey.optimistic;

    /* متطابقات الشريط: الأرقام الستة المعروضة تطابق النموذج المحسوب من
       صفوف الإصدار مباشرة */
    guard("kpiStrip", {
      "نهاية المتحفظ من صف يونيو 2027":
        cons.last === model.last.conservative,
      "نهاية الأساسي من صف يونيو 2027": base.last === model.last.base,
      "نهاية المتفائل من صف يونيو 2027": opt.last === model.last.optimistic,
      "النطاق الأخير = متحفظ − متفائل":
        model.bandLast === cons.last - opt.last,
      "زيادة الأساسي = نهايته − عجز اليوم":
        base.sinceToday === base.last - model.deficitNow,
    });

    /* منسقات العد التصاعدي — الرقم وحده يُعد وكلمة المقياس تثبت في الوحدة
       (compactParts) كي لا يقفز عرض البطاقة بين صيغ أثناء العد؛ القيمة
       النهائية تساوي value المنسقة حرفياً (عقد layout.kpiStrip). */
    const countThousands = (v) => fmt.compactParts(Math.max(v, 10000)).num;
    const countInt = (v) => fmt.int(v);

    const defs = [
      {
        item: {
          label: "عجز اليوم — مرساة القراءة",
          value: fmt.compactParts(model.deficitNow).num,
          unit: fmt.compactParts(model.deficitNow).word + " سرير",
          tone: "neg",
          note: "القائم في " + ctx.release.meta.data_as_of
            + " — الخط الذهبي في الرسم",
          countTo: model.deficitNow, fmt: countThousands, key: "fct:kpi:today",
        },
        open: (inv) => openDetailWithFocusReturn(ctx, inv,
          todayDetail(ctx, model), { title: "عجز اليوم — الأصل والمنهجية" }),
      },
      {
        item: {
          label: "المتحفظ — " + model.last.label,
          value: fmt.compactParts(cons.last).num,
          unit: fmt.compactParts(cons.last).word + " سرير",
          tone: "neg",
          delta: {
            text: signedCompact(cons.sinceToday) + " سرير عن اليوم",
            tone: "neg",
          },
          note: "الأعلى بين السيناريوهات الثلاثة",
          countTo: cons.last, fmt: countThousands, key: "fct:kpi:cons",
        },
        open: (inv) => openScenarioCard(ctx, model, "conservative", inv),
      },
      {
        item: {
          label: "الأساسي — " + model.last.label,
          value: fmt.compactParts(base.last).num,
          unit: fmt.compactParts(base.last).word + " سرير",
          delta: {
            text: signedCompact(base.sinceToday) + " سرير عن اليوم",
            tone: "neg",
          },
          note: "بين المتفائل والمتحفظ في كل شهر",
          countTo: base.last, fmt: countThousands, key: "fct:kpi:base",
        },
        open: (inv) => openScenarioCard(ctx, model, "base", inv),
      },
      {
        item: {
          label: "المتفائل — " + model.last.label,
          value: fmt.compactParts(opt.last).num,
          unit: fmt.compactParts(opt.last).word + " سرير",
          delta: {
            text: signedCompact(opt.sinceToday) + " سرير عن اليوم",
            tone: "neg",
          },
          note: "الأدنى — ويبقى فوق عجز اليوم",
          countTo: opt.last, fmt: countThousands, key: "fct:kpi:opt",
        },
        open: (inv) => openScenarioCard(ctx, model, "optimistic", inv),
      },
      {
        item: {
          label: "نطاق عدم اليقين — " + model.last.label,
          value: fmt.compactParts(model.bandLast).num,
          unit: fmt.compactParts(model.bandLast).word + " سرير",
          delta: {
            text: "من " + fmt.compact(model.bandFirst) + " في "
              + model.first.label,
            tone: "neu",
          },
          note: "المتحفظ − المتفائل شهرياً",
          countTo: model.bandLast, fmt: countThousands, key: "fct:kpi:band",
        },
        open: (inv) => openDetailWithFocusReturn(ctx, inv,
          bandDetail(ctx, model),
          { title: "نطاق عدم اليقين — الأصل والمنهجية" }),
      },
      {
        item: {
          label: "وتيرة الاتساع — الأساسي",
          value: fmt.int(base.avgMonthly),
          unit: "سرير شهرياً",
          delta: {
            text: "متحفظ " + fmt.int(cons.avgMonthly) + " · متفائل "
              + fmt.int(opt.avgMonthly),
            tone: "neu",
          },
          note: "متوسط محسوب على " + model.monthsNoun,
          countTo: base.avgMonthly, fmt: countInt, key: "fct:kpi:pace",
        },
        open: (inv) => openDetailWithFocusReturn(ctx, inv,
          paceDetail(ctx, model),
          { title: "وتيرة اتساع العجز — الأصل والمنهجية" }),
      },
    ];

    const strip = RH.presenter.layout.kpiStrip(el, defs.map((d) => d.item));

    /* كل بطاقة رقم زر حقيقي الوظيفة: نقر/Enter/مسافة يفتح بطاقة الأصل،
       والإغلاق يعيد التركيز إلى البطاقة ذاتها (دورة مفاتيحية مكتملة —
       تصمد عبر تسلسل بطاقات الشهور والسيناريوهات داخل الطبقة) */
    Array.from(strip.children).forEach((kpiEl, i) => {
      const d = defs[i];
      if (!d) return;
      activatable(kpiEl, () => d.open(kpiEl),
        d.item.label + " — " + (d.item.value || "")
        + (d.item.unit ? " " + d.item.unit : "") + "؛ بطاقة الأصل والمنهجية");
    });

    return strip;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) الرابط المشترك — تحويم ثنائي الاتجاه بين الرسم البطل وعناصر DOM
        السيناريوهات (صفوف الترتيب + بطاقات المقارنة) وربط أحادي من صفوف
        جدول الأشهر إلى التلميح المحوري:
        • تحويم/تركيز صف سيناريو أو بطاقته → إبراز خطه في الرسم.
        • تحويم خط في الرسم → إضاءة صفه وبطاقته (صنف .hl).
        • تحويم صف شهر في الجدول → التلميح المحوري على الشهر ذاته.
        مستمعو DOM يسقطون مع هدم القسم؛ مستمعو مثيل ECharts يُفصلون صراحة
        (المثيل يعمّر في سجل الثيم) — عقد ctx.onTeardown.
     ══════════════════════════════════════════════════════════════════════════ */
  function makeLinker() {
    return {
      chart: null,
      rows: new Map(),    // scenario key → صف الترتيب في العمود
      cards: new Map(),   // scenario key → بطاقة المقارنة الصغيرة
      monthEls: new Map(), // فهرس الشهر → زر الشهر في الجدول
    };
  }

  /** فهرس أول سلسلة خطية مرئية في مثيل forecastScenarios القانوني:
      سلسلتا النطاق الصامتتان تسبقان الخطوط الثلاثة (عقد المُنشئ) */
  const FIRST_LINE_SERIES = 2;

  function wireScenarioLinking(ctx, model, linker) {
    const chart = linker.chart;
    if (!chart) return;

    /* اسم سلسلة كل سيناريو داخل الرسم القانوني هو اسمه القصير (متحفظ/
       أساسي/متفائل) — مرآة defs في المُنشئ حرفياً */
    const nameByKey = {};
    const keyByName = {};
    for (const def of SCENARIOS) {
      nameByKey[def.key] = def.short;
      keyByName[def.short] = def.key;
    }

    /* اتجاه DOM → رسم: إبراز خط السيناريو كاملاً */
    function focusScenario(key) {
      if (chart.isDisposed()) return;
      chart.dispatchAction({ type: "highlight", seriesName: nameByKey[key] });
    }
    function blurScenario(key) {
      if (chart.isDisposed()) return;
      chart.dispatchAction({ type: "downplay", seriesName: nameByKey[key] });
    }
    function wireDomSide(map) {
      for (const [key, el] of map) {
        el.addEventListener("mouseenter", () => focusScenario(key));
        el.addEventListener("mouseleave", () => blurScenario(key));
        el.addEventListener("focus", () => focusScenario(key));
        el.addEventListener("blur", () => blurScenario(key));
      }
    }
    wireDomSide(linker.rows);
    wireDomSide(linker.cards);

    /* اتجاه رسم → DOM: إضاءة صف السيناريو وبطاقته المطابقين */
    function setHl(key, on) {
      const row = linker.rows.get(key);
      const card = linker.cards.get(key);
      if (row) row.classList.toggle("hl", on);
      if (card) card.classList.toggle("hl", on);
    }
    let lastHover = null;
    const onOver = (p) => {
      if (!p || p.componentType !== "series" || p.seriesType !== "line") return;
      const key = keyByName[p.seriesName];
      if (!key) return; // سلسلتا النطاق الصامتتان
      if (lastHover && lastHover !== key) setHl(lastHover, false);
      lastHover = key;
      setHl(key, true);
    };
    const onOut = () => {
      if (lastHover) setHl(lastHover, false);
      lastHover = null;
    };
    wireChartEvent(ctx, chart, "mouseover", onOver);
    wireChartEvent(ctx, chart, "mouseout", onOut);
    wireChartEvent(ctx, chart, "globalout", onOut);

    /* اتجاه جدول → رسم: تحويم/تركيز صف شهر يظهر التلميح المحوري عليه */
    for (const [i, el] of linker.monthEls) {
      const show = () => {
        if (chart.isDisposed()) return;
        chart.dispatchAction({
          type: "showTip", seriesIndex: FIRST_LINE_SERIES, dataIndex: i,
        });
      };
      const hide = () => {
        if (chart.isDisposed()) return;
        chart.dispatchAction({ type: "hideTip" });
      };
      el.addEventListener("mouseenter", show);
      el.addEventListener("mouseleave", hide);
      el.addEventListener("focus", show);
      el.addEventListener("blur", hide);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) خلايا اللوحة
     ══════════════════════════════════════════════════════════════════════════ */

  /** 7-أ: الرسم البطل — forecastScenarios الكبير عبر مُنشئه القانوني حصراً
      (خطوط النطاق الثلاثة + مساحة عدم اليقين + تسميات النهاية + مرساة
      عجز اليوم الذهبية + وسم «مورّدة غير معتمدة» داخل الرسم).
      نقر شهر يفتح ملفه التوقعي؛ حماية الضم المتوازي ببطاقة صادقة. */
  function buildHeroCell(cell, ctx, model, linker) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "سيناريوهات العجز المتوقع في الطاقة الاستيعابية",
      sub: model.first.label + " – " + model.last.label
        + " — انقر شهراً لملفه التوقعي",
      cls: "fct-hero-card",
    });

    const mk = RH.viz.charts2 ? RH.viz.charts2.forecastScenarios : null;
    if (typeof mk !== "function") {
      /* الضم المتوازي: غياب المُنشئ لا يُسقط اللوحة — بطاقة صادقة مدمجة */
      console.warn("s08-forecast: مُنشئ forecastScenarios غير مضموم في هذا البناء");
      RH.presenter.layout.pendingCard(res.body, {
        label: "الرسم غير متوفر في هذا البناء",
        note: "المُنشئ forecastScenarios لم يُضم بعد — أعد البناء عبر build.py",
      });
      return res;
    }

    const chart = mk(res.body, ctx.su, { key: "forecast", baseline: true });
    linker.chart = chart;

    /* نقر نقطة شهرية على أي خط → ملف الشهر التوقعي الكامل (بتصفح السابق/
       التالي داخل الطبقة)؛ سلسلتا النطاق الصامتتان لا تصدران أحداث نقر
       (silent) فلا تحتاجان استثناء */
    wireChartEvent(ctx, chart, "click", (p) => {
      if (!p || p.componentType !== "series" || p.seriesType !== "line") return;
      openMonthCard(ctx, model, p.dataIndex, res.body);
    });

    /* ذيل البطاقة: قراءة النطاق الكامل بالأرقام — من النموذج حصراً */
    res.card.appendChild(h("div", { class: "fct-cardfoot" },
      "من عجز قائم ", h("b", {}, fmt.compact(model.deficitNow)),
      " سرير اليوم إلى ما بين ",
      h("b", {}, fmt.compact(model.byKey.optimistic.last)),
      " و", h("b", {}, fmt.compact(model.byKey.conservative.last)),
      " سرير في " + model.last.label + " — نطاق عدم يقين يبلغ ",
      h("b", {}, fmt.compact(model.bandLast)), " سرير",
    ));
    return res;
  }

  /** 7-ب: جدول السيناريوهات الشهري الكامل — عشرة أشهر × ثلاثة سيناريوهات
      والنطاق، بزر شهر يفتح ملفه وتحويم يستدعي التلميح المحوري. تمريره
      الداخلي في .table-scroll (عقد «التمرير داخل المكوّن لا المسرح»). */
  function buildTableCell(cell, ctx, model, linker) {
    const monthBtn = (row) => {
      const btn = h("button", {
        class: "fct-month-btn",
        type: "button",
        "data-interactive": "",
        "aria-label": row.label + " — فتح ملف الشهر التوقعي",
        onclick: (ev) => {
          openMonthCard(ctx, model, row.idx, ev.currentTarget);
        },
      }, row.label);
      linker.monthEls.set(row.idx, btn);
      return btn;
    };

    const rows = model.rows.map((r, i) => ({
      idx: i,
      label: r.label,
      conservative: r.conservative,
      base: r.base,
      optimistic: r.optimistic,
      span: model.band[i].span,
    }));

    const res = RH.presenter.layout.tableCard(cell, {
      title: "جدول السيناريوهات الشهري",
      cls: "fct-table-card",
      columns: [
        { key: "label", label: "الشهر", render: monthBtn },
        {
          key: "conservative", label: "متحفظ", align: "end",
          render: (row) => fmt.int(row.conservative),
        },
        {
          key: "base", label: "أساسي", align: "end",
          render: (row) => h("b", {}, fmt.int(row.base)),
        },
        {
          key: "optimistic", label: "متفائل", align: "end",
          render: (row) => fmt.int(row.optimistic),
        },
        {
          key: "span", label: "النطاق", align: "end",
          render: (row) => fmt.int(row.span),
        },
      ],
      rows,
      note: "القيم بعدد الأسرّة كما وردت حرفياً في الإصدار — "
        + model.badge + "؛ النطاق = المتحفظ − المتفائل.",
    });
    return res;
  }

  /** 7-ج: بطاقات المقارنة الصغيرة الثلاث — نهاية الأفق لكل سيناريو على
      أساس بصري موحد (نهاية المتحفظ)، بزيادته منذ اليوم ووتيرته الشهرية.
      كل بطاقة زر يفتح ملف السيناريو، وتنضم إلى الرابط الثنائي مع الرسم. */
  function buildCompareCell(cell, ctx, model, linker) {
    const res = RH.presenter.layout.card(cell, {
      title: "مقارنة السيناريوهات — نهاية الأفق",
      sub: model.last.label + " — الأشرطة تقيس الزيادة عن عجز اليوم "
        + fmt.compact(model.deficitNow),
      cls: "fct-compare-card",
    });
    /* المقياس المشترك من عجز اليوم إلى المتحفظ (لا من الصفر): القيم 821–904
       ألفاً على شريط صفري كانت تُقرأ ثلاثة أشرطة ممتلئة متطابقة — الآن يقرأ
       الشريط «الزيادة عن اليوم» بفروق مرئية (إصلاح المراجعة) والمقياس معلن */
    const basis = model.byKey.conservative.last;
    const span = Math.max(1, basis - model.deficitNow);
    const wrap = h("div", { class: "fct-sc-list" });

    for (const m of model.list) {
      const widthPct = Math.max(0,
        Math.min(100, Math.round(((m.last - model.deficitNow) / span) * 100)));
      const scCard = h("div", { class: "fct-sc" },
        h("div", { class: "fct-sc-head" },
          h("span", {
            class: "fct-sc-dot",
            style: { background: m.def.color },
            "aria-hidden": "true",
          }),
          h("span", { class: "fct-sc-name" }, m.def.name),
          h("b", { class: "fct-sc-val" },
            fmt.compact(m.last) + fmt.NBSP + "سرير"),
        ),
        h("div", { class: "fct-sc-track", "aria-hidden": "true" },
          h("span", {
            class: "fct-sc-fill",
            style: { width: widthPct + "%", background: m.def.color },
          }),
        ),
        h("div", { class: "fct-sc-meta" },
          h("span", { class: "fct-sc-delta" },
            signedCompact(m.sinceToday) + " عن اليوم"),
          h("span", { class: "fct-sc-pace" },
            fmt.int(m.avgMonthly) + fmt.NBSP + "سرير شهرياً"),
        ),
      );
      activatable(scCard, () => {
        openScenarioCard(ctx, model, m.def.key, scCard);
      }, "السيناريو " + m.def.name + ": " + fmt.unitAfter(m.last, "سرير")
        + " بنهاية الأفق، بزيادة " + signedCompact(m.sinceToday)
        + " سرير عن عجز اليوم — فتح الملف الكامل");
      linker.cards.set(m.def.key, scCard);
      wrap.appendChild(scCard);
    }
    res.body.appendChild(wrap);

    /* ذيل البطاقة: قراءة النطاق — زر حقيقي يفتح بطاقة عدم اليقين */
    const bandBtn = h("button", {
      class: "fct-band-btn",
      type: "button",
      "data-interactive": "",
      "aria-label": "نطاق عدم اليقين: يتسع من "
        + fmt.compact(model.bandFirst) + " إلى "
        + fmt.compact(model.bandLast) + " سرير عبر الأفق — فتح البطاقة",
      onclick: (ev) => {
        openDetailWithFocusReturn(ctx, ev.currentTarget,
          bandDetail(ctx, model),
          { title: "نطاق عدم اليقين — الأصل والمنهجية" });
      },
    },
      h("span", {},
        "النطاق يتسع من " + fmt.compact(model.bandFirst) + " إلى "
        + fmt.compact(model.bandLast) + " سرير"),
      h("span", { class: "fct-btn-arrow", "aria-hidden": "true" }, "←"),
    );
    res.card.appendChild(h("div", { class: "fct-cardfoot fct-band-foot" }, bandBtn));
    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) عمود الرؤى الممتد — لا مفتاح insight_panels قانونياً لقسم التوقعات
        (المفاتيح القانونية supply|licensing|control|initiatives — عقد §2)
        فلا يُختلق عمود رؤى: تتصدر العمودَ بطاقةُ التحفظ الحرفي بوسمها
        الذهبي، ثم ترتيب نهاية الأفق، فزر الملحق وسطر حداثة البيانات.
     ══════════════════════════════════════════════════════════════════════════ */

  /** 8-أ: بطاقة التحفظ الحرفي — نص release.scenarios.caveat كما ورد حرفياً
      بوسم الحالة الذهبي (المطلب النصي للقسم) + زر بطاقة الحالة الكاملة */
  function buildCaveatCard(cell, ctx, model) {
    const card = h("div", { class: "fct-caveat" },
      h("div", { class: "fct-caveat-head" },
        h("span", { class: "fct-caveat-dot", "aria-hidden": "true" }),
        h("span", { class: "fct-caveat-badge" }, model.badge),
      ),
      h("div", { class: "fct-caveat-title" }, "التحفظ المنهجي — نص الإصدار الحرفي"),
      h("p", { class: "fct-caveat-text" }, model.sc.caveat),
      h("button", {
        class: "fct-caveat-btn",
        type: "button",
        "data-interactive": "",
        "aria-label": "فتح بطاقة الحالة الكاملة لسيناريوهات العجز",
        onclick: (ev) => {
          openDetailWithFocusReturn(ctx, ev.currentTarget,
            caveatDetail(ctx, model),
            { title: "سيناريوهات العجز — بطاقة الحالة الكاملة" });
        },
      },
        h("span", {}, "بطاقة الحالة الكاملة"),
        h("span", { class: "fct-btn-arrow", "aria-hidden": "true" }, "←"),
      ),
    );
    cell.appendChild(card);
    return card;
  }

  /** 8-ب: ترتيب نهاية الأفق — ثلاثة أزرار تنازلياً بأشرطة أساس موحد:
      المسار المفاتيحي الموازي لبطاقات المقارنة ولنقر خطوط الرسم */
  function buildHorizonRank(cell, ctx, model, linker) {
    /* المقياس نفسه المعلن في بطاقة المقارنة: الزيادة عن عجز اليوم */
    const basis = model.byKey.conservative.last;
    const span = Math.max(1, basis - model.deficitNow);
    const rank = h("div", { class: "fct-rank" },
      h("div", { class: "fct-rank-title" }, "ترتيب نهاية الأفق — " + model.last.label),
      h("div", { class: "fct-rank-sub" }, "تنازلياً — الأشرطة زيادة عن عجز اليوم"),
    );
    for (const m of byLastDesc(model)) {
      const rowBtn = h("button", {
        class: "fct-rank-row",
        type: "button",
        "data-interactive": "",
        "aria-label": "السيناريو " + m.def.name + ": "
          + fmt.unitAfter(m.last, "سرير") + " بنهاية الأفق بزيادة "
          + signedCompact(m.sinceToday) + " سرير عن اليوم — فتح الملف الكامل",
        onclick: (ev) => {
          openScenarioCard(ctx, model, m.def.key, ev.currentTarget);
        },
      },
        h("span", {
          class: "fct-rank-dot",
          style: { background: m.def.color },
          "aria-hidden": "true",
        }),
        h("span", { class: "fct-rank-name" }, m.def.short),
        h("span", { class: "fct-rank-track", "aria-hidden": "true" },
          h("span", {
            class: "fct-rank-fill",
            style: {
              width: Math.max(0, Math.min(100,
                Math.round(((m.last - model.deficitNow) / span) * 100))) + "%",
              background: m.def.color,
            },
          }),
        ),
        h("b", { class: "fct-rank-val" }, fmt.compact(m.last)),
        h("span", { class: "fct-rank-delta" },
          signedCompact(m.sinceToday) + " عن اليوم"),
      );
      /* لا نُدخل الصف نفسه في linker.rows إن كانت بطاقته مسجلة؟ بلى ندخله:
         الرابط يضيء الاثنين معاً (صف العمود وبطاقة المقارنة) عند تحويم
         خط الرسم — خريطتان منفصلتان في linker */
      linker.rows.set(m.def.key, rowBtn);
      rank.appendChild(rowBtn);
    }
    cell.appendChild(rank);
    return rank;
  }

  /** 8-ب-2: إحصاءات العمود المدمجة — تملأ ما كان فراغاً أسفل الترتيب
      (إصلاح المراجعة): وتيرة الاتساع الشهرية للمسارات الثلاثة + شريط
      مصغر لنطاق عدم اليقين شهراً بشهر — كل القيم من نموذج الإصدار حصراً */
  function buildRailStats(cell, ctx, model) {
    const stats = h("div", { class: "fct-rail-stats" },
      h("div", { class: "fct-rank-title" }, "وتيرة الاتساع الشهرية"),
      h("div", { class: "fct-rank-sub" },
        "متوسط الزيادة عن عجز اليوم عبر "
        + fmt.countNoun(model.rows.length, LOCAL_NOUNS.month)),
    );
    for (const m of model.list) {
      stats.appendChild(h("div", { class: "fct-pace-row" },
        h("span", {
          class: "fct-rank-dot",
          style: { background: m.def.color },
          "aria-hidden": "true",
        }),
        h("span", { class: "fct-pace-name" }, m.def.short),
        h("b", { class: "fct-pace-val" },
          fmt.int(m.avgMonthly) + fmt.NBSP + "سرير شهرياً"),
      ));
    }

    /* الشريط المصغر: اتساع النطاق (متحفظ − متفائل) شهراً بشهر */
    const maxSpan = model.band.reduce((a, b) => Math.max(a, b.span), 0);
    const spark = h("div", {
      class: "fct-band-spark",
      "aria-hidden": "true",
    });
    for (const b of model.band) {
      spark.appendChild(h("i", {
        style: {
          height: Math.max(8, Math.round((b.span / maxSpan) * 100)) + "%",
        },
      }));
    }
    stats.appendChild(h("div", { class: "fct-rank-title band" },
      "نطاق عدم اليقين شهرياً"));
    stats.appendChild(spark);
    /* طرفا النطاق بصياغة معنونة كاملة — لا رمز سهم يتيماً بلا تسمية
       (إصلاح مراجعة الجولة 1) */
    stats.appendChild(h("div", { class: "fct-band-ends" },
      h("span", {}, "من " + fmt.compact(model.bandFirst)),
      h("span", { class: "fct-band-to" }, "إلى"),
      h("span", {}, fmt.compact(model.bandLast)),
    ));
    cell.appendChild(stats);
    return stats;
  }

  /** 8-ج: تجميع العمود كاملاً */
  function buildRail(cell, ctx, model, linker) {
    const rel = ctx.release;
    cell.classList.add("fct-rail-cell");

    /* بطاقة التحفظ الحرفي بوسمها الذهبي — المطلب النصي يتصدر العمود */
    buildCaveatCard(cell, ctx, model);

    /* ترتيب نهاية الأفق */
    buildHorizonRank(cell, ctx, model, linker);

    /* الإحصاءات المدمجة — لا فراغ أسفل العمود (إصلاح المراجعة) */
    buildRailStats(cell, ctx, model);

    /* زر الملحق التحليلي: التعمق القانوني بحفظ حالة القسم (عقد §7) —
       سيناريوهات العجز جزء من ملحق الطلب في بنية الملاحق القائمة */
    cell.appendChild(h("button", {
      class: "fct-appx",
      type: "button",
      "data-interactive": "",
      "aria-label": "فتح الملحق التحليلي: الطلب — التفاصيل والتحليل",
      onclick: () => ctx.openAppendix("demand"),
    },
      h("span", {}, "الملحق التحليلي: الطلب — التفاصيل والتحليل"),
      h("span", { class: "fct-btn-arrow", "aria-hidden": "true" }, "←"),
    ));

    /* سطر حداثة البيانات وتاريخ الحساب — من meta الإصدار حصراً */
    cell.appendChild(h("div", { class: "fct-meta" },
      "البيانات حتى ", h("b", {}, rel.meta.data_as_of),
      " · تاريخ الحساب ", h("b", {}, fmt.date(rel.meta.calculation_date)),
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) ملخص ناطق للوحة كاملة — منطقة مخفية بصرياً تقرأ أرقام الشريط الستة
        وحالة الاعتماد بترتيبها لقارئات الشاشة قبل الغوص في الرسم (للرسم
        بديله الجدولي الخاص داخل مكتبة charts2 — srTable).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, ctx, model) {
    el.appendChild(h("p", {
      class: "fct-sr",
      role: "note",
      "aria-label": "ملخص لوحة سيناريوهات العجز",
    },
      "ملخص اللوحة: العجز القائم اليوم "
      + fmt.unitAfter(model.deficitNow, "سرير")
      + "، وبنهاية أفق التوقع في " + model.last.label
      + " يبلغ السيناريو المتحفظ "
      + fmt.unitAfter(model.byKey.conservative.last, "سرير")
      + " والأساسي " + fmt.unitAfter(model.byKey.base.last, "سرير")
      + " والمتفائل " + fmt.unitAfter(model.byKey.optimistic.last, "سرير")
      + "، بنطاق عدم يقين يبلغ " + fmt.unitAfter(model.bandLast, "سرير")
      + ". " + model.badge + ": " + model.sc.caveat,
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) الوصول العميق عبر معاملات المسار (عقد ctx.params — سلاسل خام):
        ‎#/section/forecast?month=2026-12‎ يفتح ملف الشهر مباشرة، و
        ‎?scenario=base‎ يفتح ملف السيناريو — روابط قابلة للمشاركة من
        الملاحق والتقارير. معامل غير صالح يُتجاهل بصمت (لا شاشة خطأ).
     ══════════════════════════════════════════════════════════════════════════ */
  function honourDeepLink(ctx, model) {
    const scenarioKey = ctx.params && ctx.params.scenario;
    if (scenarioKey && model.byKey[scenarioKey]) {
      /* بلا عنصر مستدعٍ (وصول مباشر من الرابط) — التسلسل داخل الطبقة يعمل */
      openScenarioCard(ctx, model, scenarioKey, null);
      return;
    }
    const monthIso = ctx.params && ctx.params.month;
    if (monthIso) {
      const i = model.rows.findIndex((r) => r.iso === monthIso);
      if (i >= 0) openMonthCard(ctx, model, i, null);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) بناء اللوحة — الهرمية الملزمة: ترويسة ← شريط المؤشرات ← شبكة الرسوم
        (الرسم البطل بتسعة أعمدة + عمود التحفظ والترتيب الممتد، ثم جدول
        السيناريوهات وبطاقات المقارنة) — كل شيء داخل el (‎.dash-body).
     ══════════════════════════════════════════════════════════════════════════ */
  function build(el, ctx) {
    const rel = ctx.release;
    const model = forecastModel(rel, ctx.derived);
    const linker = makeLinker();

    /* الترويسة: سياق ذهبي + عنوان + وسم الحالة الذهبي (لا وسم «حداثة»
       عاماً هنا — الوسم الأصدق لقسم التوقعات هو حالة اعتماد سيناريوهاته)
       + سطر أفق التوقع الكامل */
    RH.presenter.layout.sectionHeader(el, {
      kicker: "التوقعات",
      title: "سيناريوهات العجز",
      badge: model.badge,
      meta: "أفق التوقع: " + model.first.label + " – " + model.last.label
        + " (" + model.monthsNoun + ")",
    });

    /* شريط المؤشرات الست القابلة للنقر */
    buildKpiStrip(el, ctx, model);

    /* الشبكة: 12 عموداً؛ قالب الصفوف في forecast.css (الصف الأول أطول
       للرسم البطل). الترتيب البصري RTL: الخلية الأولى أقصى اليمين. */
    const g = RH.presenter.layout.grid(el, { cols: 12, cls: "fct-grid" });

    /* الصف الأول: الرسم البطل (9) + عمود التحفظ والترتيب (3 ممتد صفين) */
    const cHero = g.cell({ span: 9, cls: "fct-cell-hero" });
    const cRail = g.cell({ span: 3, rows: 2, cls: "fct-cell-rail" });

    /* الصف الثاني: جدول السيناريوهات (5) + بطاقات المقارنة (4) — البقية
       من عرض الصف يشغلها امتداد العمود؛ 5+4+3=12 */
    const cTable = g.cell({ span: 5, cls: "fct-cell-table" });
    const cCompare = g.cell({ span: 4, cls: "fct-cell-compare" });

    buildHeroCell(cHero, ctx, model, linker);
    buildRail(cRail, ctx, model, linker);
    buildTableCell(cTable, ctx, model, linker);
    buildCompareCell(cCompare, ctx, model, linker);

    /* الربط الثنائي بعد اكتمال الطرفين (الرسم البطل + الصفوف والبطاقات) */
    wireScenarioLinking(ctx, model, linker);

    /* الملخص الناطق ثم تلبية معامل الوصول العميق إن وُجد */
    buildSrSummary(el, ctx, model);
    honourDeepLink(ctx, model);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) تسجيل القسم — عقد RH.sections.register (order:8، id:"forecast"،
         backdrop:"forecast" — مستعار mediaBg إلى خلفية الطلب، حالة واحدة
         بلا خطوات بناء: اللوحة تُقرأ دفعة واحدة كمركز قيادة).
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "forecast",
    order: 8,
    title: "سيناريوهات العجز",
    kicker: "التوقعات",
    backdrop: "forecast",
    dim: 0.84,
    steps: 0,
    major: false,
    build,
  });

  /* منفذ اختبار داخلي (ليس من عقد القسم): يكشف بُناة النموذج والبطاقات
     للاختبارات الآلية كي تتحقق من مطابقة أرقام البطاقات لمرايا الإصدار
     دون بناء DOM المسرح كاملاً. البادئة السفلية تعلن أنه غير معد
     للاستهلاك من بقية الأقسام. */
  RH.sections._forecastInternals = {
    forecastModel,
    byLastDesc,
    todayDetail,
    scenarioDetail,
    monthDetail,
    bandDetail,
    paceDetail,
    caveatDetail,
    SCENARIOS,
    STATUS_BADGE,
  };
})();
