/* ════════════════════════════════════════════════════════════════════════════
   s09-closing.js — القسم 9: «الخاتمة والتوصيات» — خاتمة مهيبة بكثافة قيادية
   ────────────────────────────────────────────────────────────────────────────
   لوحة قيادة ختامية (عقد V2_CONTRACTS §1 — order:9, id:"closing",
   backdrop:"closing" → مستعار mediaBg إلى خلفية kpis_closing, major:true):

     ▸ صف الحقائق الثلاث المتحقق منها — ثلاث بطاقات بطولية بأرقام ضخمة،
       كل واحدة موجز معتمد حرفي من release.insights بحالة approved_brief
       اجتاز بوابة مجمع الحقائق (152/152):
         1. تغطية الطلب        43.1٪  (أخضر — الطاقة المرخصة، insights.s03)
         2. نمو رخص البناء     50.0٪  (عاجي محايد — insights.s05)
         3. تركز مخالفات الجنوب 37.8٪ (مرجاني — الخلل حصراً، insights.s07)
       كل بطاقة: رقم بطولي بعدّ تصاعدي عند أول دخول + نص الموجز المعتمد
       حرفياً + شرائح الأرقام المساندة + رسم مصغر حي من مكتبة charts2
       القانونية (تطور التغطية / تكوين نمو رخص البناء / المخالفات قطاعياً)
       + سطر الصيغة المعتمدة، والنقر (أو Enter) يفتح بطاقة «الأصل
       والمنهجية» الكاملة بتسلسل تنقل بين الحقائق الثلاث داخل الطبقة.

     ▸ صف التوصيات والأفق:
         • بطاقة «التوصيات التنفيذية»: أربع توصيات منتقاة بمعرفاتها من
           release.insight_panels (cd3 مراجعة الانتشار الميداني، sd2 توجيه
           الرخص إلى الجنوب، id2 تحديث حالات المتأخرة، cd2 موازنة القدرة
           الرقابية) — نصوصها حرفية وتصنيفها اللوني من الإصدار (مفردات
           مقفلة pos|neg|warn|neu)، ونقر كل توصية يفتح بطاقة أثر كاملة
           بأرقامها المساندة من الإصدار وزرّي «الانتقال إلى القسم» و«الملحق
           التحليلي». توصية غائبة من الإصدار تسقط بصمت — لا اختلاق توصيات.
         • بطاقة «أفق المرحلة المقبلة»: donut حالات المبادرات المصغر
           (2 منجزة / 9 جاري / 7 متأخرة حكماً — مرآة قاعدة status_rule)
           + صفوف الأفق (امتداد الجاري حتى 30 أبريل 2027، أفق السيناريوهات
           يونيو 2027، الهدف الاسترشادي 60٪ بوسمه الذهبي «غير معتمد»)
           + بطاقة «الخطوات القادمة» الصادقة قيد الاعتماد (layout.pendingCard
           — بطاقة مدمجة لا شاشة كاملة، حكم العميل على V1 محفوظ).

     ▸ سطر التواريخ والاعتماد (ذيل اللوحة بعرضها الكامل): فترة الرصد،
       البيانات حتى، تاريخ الحساب، تاريخ العرض (بوسم «بانتظار التأكيد»
       الصادق من meta)، معرف الإصدار، بوابات التحقق 152/152 — وزرّا
       «سجل الاعتماد الكامل» (بطاقة المصادر والبصمات والحجر الصحي للبيانات)
       و«العودة إلى الملخص التنفيذي» (ختام دائري للعرض).

     ▸ خلفية bokeh احتفالية: طبقة زخرفية حتمية البذرة (لا عشوائية بين
       زيارتين) من دوائر ضبابية بصبغات الزمرد والعاج الخافتة حصراً —
       الذهبي والمرجاني لا يلوّنان زخرفة أبداً (انضباط المنظومة الدلالية)،
       والطبقة aria-hidden خاملة المؤشر وحركتها تتصفر مع reduced-motion.

     ▸ وصول عميق عبر معاملات المسار (عقد ctx.params):
         ‎#/section/closing?fact=coverage‎    يفتح بطاقة أصل الحقيقة مباشرة
         ‎#/section/closing?rec=cd3‎          يفتح بطاقة التوصية مباشرة
         ‎#/section/closing?card=provenance‎  يفتح سجل الاعتماد الكامل
         ‎#/section/closing?card=horizon‎     يفتح سجل الأفق الكامل
       معامل غير صالح يُتجاهل بصمت — لا شاشات خطأ في مسرح العرض.

     ▸ دورة تركيز مفاتيحية مكتملة: إغلاق أي بطاقة (Escape/زر/نقر الخلفية)
       يعيد التركيز إلى العنصر الذي فتحها — مراقب طفرات على جذر القسم
       يُفصل فور الإصابة وعند الهدم (عقد ctx.onTeardown).

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل رقم من release.json عبر ctx.release/ctx.derived،
     وكل اشتقاق عرضي (متوسط مخالفات لكل مراقب ونحوه) عملية حسابية معلنة
     الصيغة على قيم الإصدار تُوثق في بطاقة الأصل ذاتها. كل رقم ظاهر عبر
     RH.core.fmt حصراً (تطابق العدد والمعدود عبر fmt.noun/countNoun،
     والعزل الاتجاهي الحتمي عبر fmt.iso/fmt.pct).
   • نصوص الإصدار (موجزات الحقائق، التوصيات، التحفظات) تُبنى بعقد dom.h
     النصي (textContent) — لا innerHTML لمحتوى الإصدار إطلاقاً؛ نصوص
     تلميحات الرسوم تمر عبر theme.esc داخل مكتبة charts2 ذاتها.
   • منظومة المعنى: الأخضر للطاقة المرخصة، المرجاني للعجز والمخالفات
     والتأخر حصراً، الذهبي لخط الأساس والمستهدف ووسوم الاعتماد حصراً،
     الرملي للطلب، الأزرق فئة ثانوية (جاري العمل) — ولا يلوّن الذهبي
     أو المرجاني أي زخرفة (بما فيها الـbokeh).
   • الرسوم عبر مُنشئي RH.viz.charts2 القانونيين حصراً بمفتاح مثيلات
     "closing" (لا تصادم مع مثيلات الأقسام الأخرى) — غياب مُنشئ في بناء
     متوازٍ يعرض بطاقة صادقة مدمجة لا يسقط اللوحة.
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (زر حقيقي أو role=button
     بمعالجة Enter/مسافة) وموسوم data-interactive كي لا يبتلع جهاز التقديم
     ضغطاته (عقد الملاحة §8)؛ Escape يغلق بطاقة التفاصيل (عقد ctx.openDetail).
   • prefers-reduced-motion محترم: العد التصاعدي عبر RH.viz.motion (قيمة
     نهائية فورية)، وحركات bokeh والانتقالات تتصفر في closing.css.
   • التنظيف عبر ctx.onTeardown: فصل مستمعي مثيلات ECharts (المثيلات تعمّر
     في سجل الثيم أطول من DOM القسم) ومراقبي الطفرات — مستمعو عناصر القسم
     ذاتها تسقط مع هدم DOM.
   • 16:9 يتسع دون تمرير عند 1920×1080 بوحدة ‎--su؛ الفيضان الرأسي في وضع
     اللوحة يُحل بتمرير داخلي في جسم القسم حصراً (closing.css) — المسرح
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
    fact: { one: "حقيقة واحدة", two: "حقيقتان", few: "حقائق", many: "حقيقة", hundred: "حقيقة" },
    rec: { one: "توصية واحدة", two: "توصيتان", few: "توصيات", many: "توصية", hundred: "توصية" },
    gate: { one: "بوابة واحدة", two: "بوابتان", few: "بوابات", many: "بوابة", hundred: "بوابة" },
    month: { one: "شهر واحد", two: "شهران", few: "أشهر", many: "شهراً", hundred: "شهر" },
    source: { one: "مصدر واحد", two: "مصدران", few: "مصادر", many: "مصدراً", hundred: "مصدر" },
  };

  /** خريطة عرض مقفلة لحالات الاعتماد المعروفة — النصوص من عقود المشروع
      حرفياً؛ حالة غير معروفة تُعرض بمعرفها الخام (صدق لا تجميل) */
  const STATUS_BADGE = {
    approved_brief: "موجز معتمد — اجتاز بوابة مجمع الحقائق",
    approved_source_mirror: "مرآة حرفية لمصدر معتمد",
    pending_approval: "بانتظار الاعتماد",
    pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
    indicative_not_approved: "قيمة استرشادية — غير معتمدة",
    supplied_unvalidated: "سيناريوهات مورّدة — غير معتمدة",
    published: "إصدار منشور",
  };

  /** المفاتيح القانونية للوحات الرؤى وما يقابلها من أقسام وملاحق —
      (معرفات الملاحق من سجل ax-shell القائم: demand/licensing/monitoring/
      pillar/kpi — لا معرف مخترعاً) */
  const SECTION_META = {
    supply: { label: "العرض والطلب", sectionId: "demand", appendixId: "demand" },
    licensing: { label: "التراخيص", sectionId: "licensing", appendixId: "licensing" },
    control: { label: "الرقابة الميدانية", sectionId: "control", appendixId: "monitoring" },
    initiatives: { label: "المبادرات والركائز", sectionId: "initiatives", appendixId: "pillar" },
  };

  /** التصنيفات القانونية لبطاقات الرؤى (مفردات مقفلة — عقد §2) */
  const LEGAL_CLS = ["pos", "neg", "warn", "neu"];

  /** التوصيات المنتقاة بمعرفاتها من لوحات الرؤى المعتمدة — انتقاء عرضي
      لبطاقات تحمل لغة توصية صريحة («يوصى»/«يستدعي»/«يشير إلى حاجة»)؛
      النص والتصنيف من الإصدار حرفياً، والغائب يسقط بصمت (لا اختلاق). */
  const REC_REFS = [
    { sectionKey: "control", panelId: "cd3" },
    { sectionKey: "supply", panelId: "sd2" },
    { sectionKey: "initiatives", panelId: "id2" },
    { sectionKey: "control", panelId: "cd2" },
  ];

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js: فشل فحص لا يُسقط
     اللوحة (الإصدار المنشور اجتاز بواباته أصلاً) بل ينبه في وحدة التحكم
     لالتقاط أي انجراف بيانات مبكراً أثناء التطوير.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s09-closing/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) أدوات صياغة وتفاعل مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** عدد صحيح موقع معزول اتجاهياً: ‎+32‎ / ‎−12‎ */
  function signedInt(v) {
    return fmt.iso((v >= 0 ? "+" : "−") + fmt.int(Math.abs(v)));
  }

  /** نسبة موقعة معزولة اتجاهياً: ‎+50.0٪‎ — الإشارة والرقم والعلامة داخل
      عازل واحد كي لا تتشظى في السياق العربي */
  function signedPct(v) {
    return fmt.iso((v >= 0 ? "+" : "−") + fmt.dec1(Math.abs(v)) + "٪");
  }

  /** قيمة تنفيذية مختصرة مع وحدة موحدة اللحاق: «612.4 ألف سرير» / «3,200 سرير» */
  function compactBeds(v) {
    return Math.abs(v) >= 10000
      ? fmt.compact(v) + fmt.NBSP + "سرير"
      : fmt.noun(v, "bed");
  }

  /** وسم حالة الاعتماد المعروض — من الخريطة المقفلة أو المعرف الخام صدقاً */
  function statusBadgeText(status) {
    return STATUS_BADGE[status] || String(status || "—");
  }

  /** جعل عنصر غير-زر قابلاً للتفعيل بالكامل: نقر + Enter + مسافة، بدور
      button ووسم data-interactive (فلا يبتلع جهاز التقديم ضغطاته — عقد §8).
      المستمعون على عناصر القسم ذاته فيسقطون مع هدم DOM (لا تسريب). */
  function activatable(el, onAct, ariaLabel) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-interactive", "");
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    el.classList.add("cls-act");
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

  /** الانتقال إلى قسم آخر عبر الموجّه القانوني (عقد §7: ‎#/section/<id>‎) —
      معرف خارج القائمة القانونية يُتجاهل بصمت (لا شاشة خطأ في المسرح) */
  function goSection(id, params) {
    if (RH.sections && RH.sections.VALID_IDS
        && !RH.sections.VALID_IDS.includes(id)) {
      console.warn("s09-closing: معرف قسم خارج القائمة القانونية — " + id);
      return;
    }
    RH.core.router.go({ kind: "scene", id, params: params || {} });
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

  /* ══════════════════════════════════════════════════════════════════════════
     2) مرآة قاعدة حالة المبادرات — مطابقة حرفية لقاعدة status_rule في
        الإصدار وعقد §3: حالة الملف إن وُجدت؛ وإلا: تجاوزت النهاية دون
        إنجاز = «متأخرة» حكماً، بدأت ولم تنته = «جاري العمل»، لم يحن
        بدؤها = «لم يتم البدء». المقارنة على سلاسل ISO مباشرة (ترتيبها
        الأبجدي هو ترتيبها الزمني).
     ══════════════════════════════════════════════════════════════════════════ */
  const ST_DONE = "منجزة";
  const ST_RUN = "جاري العمل";
  const ST_LATE = "متأخرة";
  const ST_IDLE = "لم يتم البدء";

  function computedStatus(ini, calcIso) {
    if (ini.status) return ini.status;
    if (ini.end && ini.end < calcIso) return ST_LATE;
    if (ini.start && ini.start <= calcIso) return ST_RUN;
    return ST_IDLE;
  }

  /** خلاصة حالة الاستراتيجية للعرض الختامي: الأعداد بالقاعدة الحرفية،
      وقوائم المتأخرة والجارية بتواريخها، وأبعد نهاية مخططة عبر المحفظة */
  function strategyStatus(rel) {
    const st = rel.strategy || {};
    const inis = st.initiatives || [];
    const calc = rel.meta.calculation_date;

    const counts = {};
    counts[ST_DONE] = 0; counts[ST_RUN] = 0;
    counts[ST_LATE] = 0; counts[ST_IDLE] = 0;
    const late = [];
    const running = [];
    let maxEnd = null;
    let maxRunningEnd = null;

    for (const ini of inis) {
      const status = computedStatus(ini, calc);
      if (counts[status] == null) counts[status] = 0;
      counts[status] += 1;
      if (status === ST_LATE) late.push(ini);
      if (status === ST_RUN) {
        running.push(ini);
        if (ini.end && (!maxRunningEnd || ini.end > maxRunningEnd)) {
          maxRunningEnd = ini.end;
        }
      }
      if (ini.end && (!maxEnd || ini.end > maxEnd)) maxEnd = ini.end;
    }
    /* الترتيب الزمني للقوائم: المتأخرة الأقدم نهايةً أولاً (الأشد تأخراً)،
       والجارية الأبعد نهايةً أولاً (الأطول أفقاً) — ترتيب على ISO الخام */
    late.sort((a, b) => (a.end < b.end ? -1 : a.end > b.end ? 1 : 0));
    running.sort((a, b) => (a.end > b.end ? -1 : a.end < b.end ? 1 : 0));

    guard("strategyStatus", {
      "18 مبادرة كما في البوابات": inis.length === 18,
      "التوزيع المثبت بالبوابات 2/9/7":
        counts[ST_DONE] === 2 && counts[ST_RUN] === 9 && counts[ST_LATE] === 7,
      "أبعد نهاية مخططة موجودة": !!maxEnd,
      "قاعدة الحالة معلنة في الإصدار": typeof st.status_rule === "string",
    });

    return { st, inis, calc, counts, late, running, maxEnd, maxRunningEnd };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) تعريفات الحقائق الثلاث — ثوابت عرض تحيل كل شيء إلى الإصدار:
        القيمة من المشتقات المحسوبة (مرآة بايثون)، والمرجع المنشور من
        كتلة release.derived، والموجز الحرفي من release.insights، والرسم
        المصغر من مكتبة charts2 القانونية بخيارات compact.
     ══════════════════════════════════════════════════════════════════════════ */
  const FACT_DEFS = [
    {
      key: "coverage",
      ord: "الأولى",
      theme: "تغطية الطلب",
      tone: "pos",                       /* أخضر — الطاقة المرخصة (البند الملزم) */
      insightId: "s03",
      chartName: "coverageEvolution",
      chartOpts: { key: "closing", compact: true, target: true, baseline: false },
      /* العنوان يركّب من meta الإصدار — لا تاريخ حرفياً (إصلاح المراجعة) */
      chartTitle: (rel) => "تطور نسبة التغطية الشهرية حتى "
        + String(rel.meta.data_as_of),
      sectionId: "demand",
      appendixId: "demand",
      value: (rel, der) => der.coverage_pct,
      published: (rel) => rel.derived.coverage_pct.value,
      publishedMetric: (rel) => rel.derived.coverage_pct,
      chips: (rel, der) => [
        {
          text: "الطاقة المرخصة " + compactBeds(rel.metrics.licensed_beds.value),
          tone: "pos",
        },
        {
          text: "الطلب " + compactBeds(rel.metrics.total_demand.value),
          tone: "demand",
        },
        {
          text: "العجز " + compactBeds(der.deficit_beds),
          tone: "neg",
        },
      ],
    },
    {
      key: "licenses",
      ord: "الثانية",
      theme: "نمو الترخيص",
      tone: "neu",                       /* عاجي محايد — كما نص التكليف */
      insightId: "s05",
      chartName: "licenseGrowthBridge",
      chartOpts: { key: "closing", compact: true, measure: "building" },
      chartTitle: "تكوين نمو رخص البناء منذ خط الأساس",
      sectionId: "licensing",
      appendixId: "licensing",
      value: (rel, der) => der.growth_building_pct,
      published: (rel) => rel.derived.growth_building_pct.value,
      publishedMetric: (rel) => rel.derived.growth_building_pct,
      chips: (rel, der) => [
        {
          text: "رخص البناء من " + fmt.int(rel.metrics.baseline_building.value)
            + " إلى " + fmt.int(rel.metrics.current_building.value)
            + " (" + signedInt(der.growth_building_abs) + ")",
          tone: "pos",
        },
        {
          text: "التشغيلية " + signedPct(der.growth_operational_pct),
          tone: "pos",
        },
        {
          text: "الطاقة " + signedPct(der.growth_beds_pct),
          tone: "pos",
        },
      ],
    },
    {
      key: "south",
      ord: "الثالثة",
      theme: "تركز المخالفات",
      tone: "neg",                       /* مرجاني — الخلل حصراً (البند الملزم) */
      insightId: "s07",
      chartName: "sectorViolationsBars",
      chartOpts: {
        key: "closing", compact: true, toggle: false,
        measure: "violations", sort: "value",
      },
      chartTitle: "المخالفات قطاعياً — الجنوب يتصدر",
      sectionId: "control",
      appendixId: "monitoring",
      value: (rel, der) => der.south_violations_share_pct,
      published: (rel) => rel.derived.south_violations_share_pct.value,
      publishedMetric: (rel) => rel.derived.south_violations_share_pct,
      chips: (rel, der) => {
        const south = rel.sectors.find((s) => s.id === "south");
        return [
          {
            text: fmt.noun(south.violations, "violation") + " من "
              + fmt.int(rel.metrics.total_violations.value),
            tone: "neg",
          },
          {
            text: fmt.noun(south.monitors, "monitor") + " في القطاع",
            tone: "neu",
          },
          {
            text: "قرارات الإغلاق " + fmt.int(south.closures),
            tone: "neu",
          },
        ];
      },
    },
  ];

  /* ══════════════════════════════════════════════════════════════════════════
     4) نموذج الخاتمة الجاهز للعرض — يُبنى مرة واحدة عند بناء القسم:
        الحقائق الثلاث بقيمها وموجزاتها المعتمدة، والتوصيات المنتقاة
        الموجودة فعلاً في الإصدار، وخلاصة الاستراتيجية، وأفق السيناريوهات،
        وسجل الاعتماد (الإصدار/المصادر/البوابات). كل الأرقام من الإصدار.
     ══════════════════════════════════════════════════════════════════════════ */
  function closingModel(rel, der) {
    const meta = rel.meta;
    const insights = rel.insights || {};

    /* الحقائق الثلاث: الموجز الحرفي إن وُجد بحالته، والقيمة من المشتقات */
    const facts = FACT_DEFS.map((def) => {
      const ins = insights[def.insightId] || null;
      return {
        def,
        key: def.key,
        value: def.value(rel, der),
        published: def.published(rel),
        insight: ins,
        text: ins ? ins.text : null,
        approved: !!(ins && ins.status === "approved_brief"),
        chips: def.chips(rel, der),
      };
    });
    const factByKey = {};
    for (const f of facts) factByKey[f.key] = f;

    guard("facts", {
      "ثلاث حقائق معرفة": facts.length === 3,
      "القيم تطابق المشتقات المنشورة":
        facts.every((f) => f.value === f.published),
      "الموجزات حاضرة ومعتمدة": facts.every((f) => f.approved && !!f.text),
      "ألوان البنود الملزمة (أخضر/محايد/مرجاني)":
        facts[0].def.tone === "pos" && facts[1].def.tone === "neu"
        && facts[2].def.tone === "neg",
    });

    /* التوصيات المنتقاة: الموجود فعلاً في الإصدار فقط — الغائب يسقط بصمت */
    const recs = [];
    for (const ref of REC_REFS) {
      const sections = rel.insight_panels && rel.insight_panels.sections;
      const list = sections ? sections[ref.sectionKey] : null;
      const panel = (list || []).find((p) => p.id === ref.panelId);
      if (!panel) continue;
      recs.push({
        ref,
        panel,
        secMeta: SECTION_META[ref.sectionKey],
        cls: LEGAL_CLS.includes(panel.cls) ? panel.cls : "neu",
      });
    }
    const recById = {};
    for (const r of recs) recById[r.panel.id] = r;

    guard("recs", {
      "التوصيات الأربع المنتقاة موجودة في الإصدار":
        recs.length === REC_REFS.length,
      "تصنيفات التوصيات من المفردات المقفلة":
        recs.every((r) => LEGAL_CLS.includes(r.panel.cls)),
      "توصيات معتمدة الموجز":
        recs.every((r) => r.panel.status === "approved_brief"),
    });

    /* خلاصة الاستراتيجية وأفق السيناريوهات والهدف الاسترشادي */
    const st = strategyStatus(rel);
    const scRows = (rel.scenarios && rel.scenarios.rows) || [];
    const scFirst = scRows.length ? scRows[0] : null;
    const scLast = scRows.length ? scRows[scRows.length - 1] : null;
    const tgt = rel.coverage_target_indicative || null;

    /* سجل الاعتماد: الإصدار والبوابات والمصادر */
    const validation = rel.validation || null;
    const gatesText = validation
      ? fmt.iso(fmt.int(validation.gates_passed) + "/"
        + fmt.int(validation.gates_total))
      : "—";

    guard("provenance", {
      "سجل الإصدار حاضر": !!(rel.release && rel.release.id),
      "بوابات التحقق مجتازة بالكامل":
        !!validation && validation.gates_passed === validation.gates_total,
      "مصدر مصنف واحد على الأقل": (rel.sources || []).length > 0,
      "فترة الرصد معلنة": typeof meta.monitoring_period_label === "string",
    });

    return {
      meta,
      facts,
      factByKey,
      recs,
      recById,
      st,
      scFirst,
      scLast,
      scStatus: rel.scenarios ? rel.scenarios.status : null,
      tgt,
      validation,
      gatesText,
      release: rel.release,
      sources: rel.sources || [],
      nextSteps: rel.next_steps || null,
      factsNoun: fmt.countNoun(facts.length, LOCAL_NOUNS.fact),
      recsNoun: fmt.countNoun(recs.length, LOCAL_NOUNS.rec),
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) هيكل بطاقة التفاصيل الموحد — عقد Node مبني بـ dom.h النصي حصراً:
        نصوص الإصدار تدخل textContent فلا مسار HTML إطلاقاً.
        { hero:{num, unit?, label?, tone?}, badges?[{text,tone}], caption?,
          bars?[{label, pct, valueText, tone?}], rows?[{k, v, tone?}],
          table?{columns, rows, note?}, notes?[], sources?[],
          actions?[{label, onAct, aria?}] }
     ══════════════════════════════════════════════════════════════════════════ */

  /** شريط مقارنة أفقي واحد: تسمية + مسار بامتلاء نسبي + قيمة نصية كاملة.
      الشريط زخرفة مكملة للرقم الحقيقي المجاور فلا يحمل دلالة وحده
      (aria-hidden على المسار)؛ لونه من صنف tone الدلالي في closing.css
      (pos أخضر، neg مرجاني، demand رملي، gold ذهبي لخط الأساس حصراً). */
  function compareBar(o) {
    const width = Math.max(0, Math.min(100, o.pct));
    return h("div", { class: "cls-cbar" + (o.tone ? " " + o.tone : "") },
      h("span", { class: "cls-cbar-k" }, o.label),
      h("span", { class: "cls-cbar-track", "aria-hidden": "true" },
        h("span", { class: "cls-cbar-fill", style: { width: width + "%" } }),
      ),
      h("b", { class: "cls-cbar-v" }, o.valueText),
    );
  }

  /** جدول كثيف داخل بطاقة التفاصيل — حاوية قابلة للتمرير الداخلي كي لا
      تفيض البطاقة (عقد «التمرير داخل المكوّن لا المسرح») */
  function detailTable(t) {
    const wrap = h("div", { class: "cls-table" },
      h("table", { class: "table-dense" },
        h("thead", {}, h("tr", {},
          t.columns.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, t.rows.map((r) => h("tr", {},
          r.map((cell, i) => h(i === 0 ? "th" : "td",
            i === 0 ? { scope: "row" } : {}, cell))))),
      ));
    if (!t.note) return wrap;
    return h("div", {}, wrap, h("div", { class: "cls-note" }, t.note));
  }

  /** الهيكل الكامل لبطاقة التفاصيل */
  function detailShell(o) {
    const box = h("div", { class: "cls-detail" });

    if (o.hero) {
      box.appendChild(h("div", { class: "cls-hero" },
        h("span", {
          class: "cls-hero-num" + (o.hero.tone ? " " + o.hero.tone : ""),
        }, o.hero.num),
        o.hero.unit ? h("span", { class: "cls-hero-unit" }, o.hero.unit) : null,
        o.hero.label ? h("span", { class: "cls-hero-label" }, o.hero.label) : null,
      ));
    }
    if (o.badges && o.badges.length) {
      box.appendChild(h("div", { class: "cls-badges" },
        o.badges.map((b) => h("span", {
          class: "cls-badge" + (b.tone ? " " + b.tone : ""),
        }, b.text))));
    }
    if (o.caption) {
      box.appendChild(h("p", { class: "cls-cap" }, o.caption));
    }
    if (o.bars && o.bars.length) {
      box.appendChild(h("div", { class: "cls-cbars" }, o.bars.map(compareBar)));
    }
    if (o.rows && o.rows.length) {
      box.appendChild(h("div", { class: "cls-rows" },
        o.rows.map((r) => h("div", {
          class: "cls-row" + (r.tone ? " " + r.tone : ""),
        },
          h("span", { class: "cls-row-k" }, r.k),
          h("b", { class: "cls-row-v" }, r.v),
        ))));
    }
    if (o.table) box.appendChild(detailTable(o.table));
    if (o.notes && o.notes.length) {
      box.appendChild(h("div", { class: "cls-notes" },
        o.notes.map((n) => h("p", { class: "cls-note" }, n))));
    }
    if (o.sources && o.sources.length) {
      box.appendChild(h("div", { class: "cls-sources" },
        o.sources.map((s) => h("p", { class: "cls-src" }, s))));
    }
    if (o.actions && o.actions.length) {
      box.appendChild(h("div", { class: "cls-actions" },
        o.actions.map((a) => h("button", {
          class: "cls-btn",
          type: "button",
          "data-interactive": "",
          "aria-label": a.aria || a.label,
          onclick: a.onAct,
        },
          h("span", {}, a.label),
          h("span", { class: "cls-arrow", "aria-hidden": "true" }, "←"),
        ))));
    }
    return box;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) بطاقات «الأصل والمنهجية» للحقائق الثلاث — كل بطاقة: الرقم البطولي
        الدقيق، الموجز المعتمد حرفياً، أشرطة/جدول القراءة المساندة، سطور
        المصادر (الصيغة المعتمدة + مراسي المصنف)، وأزرار: الحقيقتان
        الأخريان (تسلسل داخل الطبقة) + القسم المتخصص + الملحق التحليلي.
     ══════════════════════════════════════════════════════════════════════════ */

  /** 6-أ: الحقيقة الأولى — تغطية الطلب 43.1٪ */
  function coverageFactBody(ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;
    const demand = rel.metrics.total_demand;
    const cap = rel.metrics.licensed_beds;

    return {
      bars: [
        {
          label: "الطاقة المرخصة",
          pct: pctOf(cap.value, demand.value),
          valueText: compactBeds(cap.value),
          tone: "pos",
        },
        {
          label: "إجمالي الطلب التقديري",
          pct: 100,
          valueText: compactBeds(demand.value),
          tone: "demand",
        },
        {
          label: "الفجوة غير المغطاة",
          pct: der.uncovered_pct,
          valueText: compactBeds(der.deficit_beds),
          tone: "neg",
        },
      ],
      rows: [
        { k: cap.label, v: fmt.unitAfter(cap.value, "سرير"), tone: "pos" },
        { k: demand.label, v: fmt.unitAfter(demand.value, "سرير") },
        {
          k: "العجز القائم (مشتقة منشورة)",
          v: fmt.unitAfter(der.deficit_beds, "سرير"),
          tone: "neg",
        },
        { k: "النسبة غير المغطاة", v: fmt.pct(der.uncovered_pct), tone: "neg" },
        { k: "إشغال الطاقة المرخصة", v: fmt.pct(der.occupancy_pct) },
      ],
      notes: [
        "الرسم المصغر في بطاقة الحقيقة يتتبع السلسلة الشهرية المشتقة "
        + "(التراكمي ÷ الطلب) وتنتهي حتماً عند القيمة المنشورة ذاتها — "
        + "بوابة «التغطية الشهرية الأخيرة» في مواصفة التحقق.",
      ],
      sources: [
        derivedSourceLine(rel.derived.coverage_pct),
        rawSourceLine(rel, cap),
        rawSourceLine(rel, demand),
      ],
    };
  }

  /** 6-ب: الحقيقة الثانية — نمو رخص البناء 50.0٪ */
  function licensesFactBody(ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;
    const curB = rel.metrics.current_building;
    const baseB = rel.metrics.baseline_building;

    return {
      table: {
        columns: ["المقياس", "خط الأساس", "الحالي", "النمو"],
        rows: [
          [
            "رخص البناء",
            fmt.int(baseB.value),
            fmt.int(curB.value),
            signedPct(der.growth_building_pct),
          ],
          [
            "الرخص التشغيلية",
            fmt.int(rel.metrics.baseline_operational.value),
            fmt.int(rel.metrics.current_operational.value),
            signedPct(der.growth_operational_pct),
          ],
          [
            "الطاقة المرخصة (سرير)",
            fmt.int(rel.metrics.baseline_beds.value),
            fmt.int(rel.metrics.licensed_beds.value),
            signedPct(der.growth_beds_pct),
          ],
        ],
        /* لا تواريخ حرفية مكررة — نص المقارنة الحرفي من meta الإصدار وحده
           يحمل الفترة (إصلاح المراجعة: خطر انجراف عند إعادة النشر) */
        note: rel.meta.comparison_qualifier + ".",
      },
      rows: [
        {
          k: "الزيادة المطلقة في رخص البناء",
          v: signedInt(der.growth_building_abs) + fmt.NBSP + "رخصة",
          tone: "pos",
        },
        {
          k: "الزيادة المطلقة في الطاقة",
          v: signedInt(der.growth_beds_abs) + fmt.NBSP + "سرير",
          tone: "pos",
        },
      ],
      notes: [
        /* النسبتان من المشتقات لا من نص حرفي (إصلاح المراجعة: كانتا
           50.0/8.6 مكتوبتين فتنجرفان صامتتين عند إعادة النشر)،
           و«تحوُّل» بدل محاكاة translate الأعجمية */
        "قراءة الحقيقة الثانية المزدوجة: وتيرة الترخيص تتسارع ("
        + fmt.pct(der.growth_building_pct) + " في رخص البناء) بينما تحوُّل "
        + "الرخص إلى أسرّة مرخصة أبطأ (" + fmt.pct(der.growth_beds_pct)
        + ") — وهو ما يجعل متابعة تحويل رخص البناء إلى طاقة تشغيلية بنداً "
        + "رقابياً قائماً بذاته.",
      ],
      sources: [
        derivedSourceLine(rel.derived.growth_building_pct),
        rawSourceLine(rel, curB),
        rawSourceLine(rel, baseB),
      ],
    };
  }

  /** 6-ج: الحقيقة الثالثة — تركز مخالفات الجنوب 37.8٪ */
  function southFactBody(ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;
    const south = rel.sectors.find((s) => s.id === "south");
    const totV = rel.metrics.total_violations;

    /* أشرطة حصص المخالفات القطاعية تنازلياً — كلها بصبغة الخلل الواحدة */
    const shares = rel.sectors
      .map((s) => ({
        name: s.short,
        share: der.sector[s.id].violations_share_pct,
        count: s.violations,
      }))
      .sort((a, b) => b.share - a.share);

    return {
      bars: shares.map((s) => ({
        label: s.name,
        pct: s.share,
        valueText: fmt.pct(s.share) + " — " + fmt.noun(s.count, "violation"),
        tone: "neg",
      })),
      rows: [
        {
          k: rel.metrics.south_violations.label,
          v: fmt.noun(south.violations, "violation"),
          tone: "neg",
        },
        { k: totV.label, v: fmt.noun(totV.value, "violation") },
        {
          k: "المراقبون في قطاع الجنوب",
          v: fmt.noun(south.monitors, "monitor"),
        },
        {
          k: "زيارات الجنوب الميدانية",
          v: fmt.noun(south.visits, "visit"),
        },
        {
          k: "حصة الجنوب من الزيارات",
          v: fmt.pct(der.sector.south.visits_share_pct),
        },
        {
          k: "قرارات الإغلاق في الجنوب",
          v: fmt.noun(south.closures, "decision"),
          tone: "neg",
        },
      ],
      notes: [
        "التركز الرقابي في الجنوب هو الحقيقة التي تبنى عليها توصيتا "
        + "إعادة الانتشار الميداني وموازنة القدرة الرقابية أدناه.",
      ],
      sources: [
        derivedSourceLine(rel.derived.south_violations_share_pct),
        rawSourceLine(rel, rel.metrics.south_violations),
        rawSourceLine(rel, totV),
      ],
    };
  }

  const FACT_BODY = {
    coverage: coverageFactBody,
    licenses: licensesFactBody,
    south: southFactBody,
  };

  /** بطاقة الحقيقة الكاملة — الرقم البطولي + الموجز الحرفي + جسم القراءة
      + أزرار التسلسل بين الحقائق الثلاث داخل الطبقة والقسم والملحق */
  function factDetail(ctx, model, key, goto) {
    const f = model.factByKey[key];
    if (!f) return null;
    const bodyMk = FACT_BODY[key];
    const body = bodyMk ? bodyMk(ctx, model) : {};

    const actions = [];
    if (typeof goto === "function") {
      for (const other of model.facts) {
        if (other.key === key) continue;
        actions.push({
          label: "الحقيقة " + other.def.ord + " — " + other.def.theme,
          aria: "الانتقال إلى بطاقة الحقيقة " + other.def.ord
            + " داخل طبقة التفاصيل",
          onAct: () => goto(other.key),
        });
      }
    }
    actions.push({
      label: "الانتقال إلى قسم " + SECTION_META[
        f.def.sectionId === "demand" ? "supply"
          : f.def.sectionId === "licensing" ? "licensing" : "control"].label,
      aria: "مغادرة الخاتمة إلى القسم المتخصص",
      onAct: () => goSection(f.def.sectionId),
    });
    actions.push({
      label: "الملحق التحليلي — التفاصيل والتحليل",
      onAct: () => ctx.openAppendix(f.def.appendixId),
    });

    return detailShell({
      hero: {
        num: fmt.pct(f.value),
        label: "الحقيقة " + f.def.ord + " — " + f.def.theme,
        tone: f.def.tone === "neu" ? null : f.def.tone,
      },
      badges: [
        { text: statusBadgeText(f.insight ? f.insight.status : null), tone: "gold" },
        {
          text: "بوابات التحقق " + model.gatesText,
          tone: "neu",
        },
      ],
      caption: f.text,
      bars: body.bars || null,
      rows: body.rows || null,
      table: body.table || null,
      notes: body.notes || null,
      sources: body.sources || null,
      actions,
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) بطاقات أثر التوصيات — لكل توصية منتقاة جسم قراءة مساند بأرقام
        الإصدار التي بنيت عليها (لا رقم في البطاقة إلا وله أصل منشور،
        وكل اشتقاق عرضي معلن الصيغة). النص الحرفي يتصدر البطاقة دائماً.
     ══════════════════════════════════════════════════════════════════════════ */

  /** متوسط المخالفات لكل مراقب في قطاع — اشتقاق عرضي معلن (تقريب منزلة) */
  function violPerMonitor(s) {
    return Math.round((s.violations / s.monitors) * 10) / 10;
  }

  /** 7-أ: cd3 — مراجعة خطة الانتشار الميداني */
  function recBodyCd3(ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;
    return {
      table: {
        columns: ["القطاع", "المراقبون", "المخالفات", "الزيارات", "مخالفات/مراقب"],
        rows: rel.sectors
          .slice()
          .sort((a, b) => violPerMonitor(b) - violPerMonitor(a))
          .map((s) => [
            s.short,
            fmt.int(s.monitors),
            fmt.int(s.violations),
            fmt.int(s.visits),
            fmt.dec1(violPerMonitor(s)),
          ]),
        note: "الترتيب تنازلي على متوسط المخالفات لكل مراقب — قراءة كثافة "
          + "الخلل مقابل القدرة الرقابية المتاحة.",
      },
      rows: [
        {
          k: rel.metrics.total_monitors.label,
          v: fmt.noun(rel.metrics.total_monitors.value, "monitor"),
        },
        {
          k: "متوسط الزيارات الشهري (مشتقة منشورة)",
          v: fmt.noun(der.avg_monthly_visits, "visit"),
        },
      ],
      sources: [
        displayCalcLine("مخالفات/مراقب = مخالفات القطاع ÷ مراقبيه (تقريب منزلة)"),
        rawSourceLine(ctx.release, ctx.release.metrics.total_monitors),
      ],
    };
  }

  /** 7-ب: cd2 — تفاوت توزيع القدرة الرقابية */
  function recBodyCd2(ctx, model) {
    const rel = ctx.release;
    const south = rel.sectors.find((s) => s.id === "south");
    const west = rel.sectors.find((s) => s.id === "west");
    const maxViol = Math.max(south.violations, west.violations);
    return {
      bars: [
        {
          label: "الجنوب — المخالفات",
          pct: pctOf(south.violations, maxViol),
          valueText: fmt.noun(south.violations, "violation"),
          tone: "neg",
        },
        {
          label: "الغرب — المخالفات",
          pct: pctOf(west.violations, maxViol),
          valueText: fmt.noun(west.violations, "violation"),
          tone: "neg",
        },
      ],
      rows: [
        {
          k: "مراقبو الجنوب مقابل مراقبي الغرب",
          v: fmt.int(south.monitors) + fmt.NBSP + "مقابل" + fmt.NBSP
            + fmt.int(west.monitors),
        },
        {
          k: "مخالفات/مراقب في الجنوب",
          v: fmt.dec1(violPerMonitor(south)),
          tone: "neg",
        },
        {
          k: "مخالفات/مراقب في الغرب",
          v: fmt.dec1(violPerMonitor(west)),
        },
      ],
      notes: [
        "قطاعان بالقدرة الرقابية ذاتها (ثلاثة مراقبين) يواجهان حجمي خلل "
        + "متباينين بفارق يقارب أربعة أضعاف — جوهر توصية إعادة الموازنة.",
      ],
      sources: [
        displayCalcLine("مخالفات/مراقب = مخالفات القطاع ÷ مراقبيه (تقريب منزلة)"),
      ],
    };
  }

  /** 7-ج: sd2 — توجيه الرخص الجديدة إلى الجنوب */
  function recBodySd2(ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;
    const covRows = rel.sectors
      .map((s) => ({
        name: s.short,
        cov: der.sector[s.id].coverage_pct,
        deficit: der.sector[s.id].deficit_beds,
      }))
      .sort((a, b) => a.cov - b.cov);
    return {
      bars: covRows.map((r) => ({
        label: r.name,
        pct: r.cov,
        valueText: fmt.pct(r.cov),
        tone: "pos",
      })),
      rows: [
        {
          k: "طلب قطاع الجنوب — الأعلى بين القطاعات",
          v: compactBeds(rel.sectors.find((s) => s.id === "south").demand),
          tone: "demand",
        },
        {
          k: "عجز قطاع الجنوب",
          v: compactBeds(der.sector.south.deficit_beds),
          tone: "neg",
        },
        {
          k: "حصة الجنوب من طلب المدينة",
          v: fmt.pct(der.sector.south.demand_share_pct),
        },
      ],
      notes: [
        "أشرطة التغطية تصاعدياً من الأدنى: الجنوب في القاع بوضوح رغم "
        + "تصدره الطلب — فجوة الاستهداف الجغرافي التي تعالجها التوصية.",
      ],
      sources: [
        displayCalcLine("تغطية القطاع = أسرّته المرخصة ÷ طلبه × 100 "
          + "(المشتقات القطاعية المنشورة)"),
      ],
    };
  }

  /** 7-د: id2 — تحديث حالات المبادرات المتأخرة حكماً */
  function recBodyId2(ctx, model) {
    const st = model.st;
    return {
      table: {
        columns: ["المبادرة", "المعرف", "النهاية المخططة", "الحالة"],
        rows: st.late.map((ini) => [
          String(ini.name),
          fmt.iso(String(ini.id)),
          fmt.date(ini.end),
          ST_LATE + " حكماً",
        ]),
        note: "متأخرة حكماً = تجاوزت نهايتها المخططة قبل تاريخ الحساب "
          + fmt.date(st.calc) + " دون تسجيل إنجاز في المصدر.",
      },
      rows: [
        {
          k: "المبادرات المتأخرة حكماً",
          v: fmt.noun(st.counts[ST_LATE], "initiative"),
          tone: "neg",
        },
        {
          k: "أقدم نهاية متجاوزة",
          v: st.late.length ? fmt.date(st.late[0].end) : "—",
        },
      ],
      notes: [String(st.st.status_rule || "")],
      sources: [
        "قاعدة الحالة من release.strategy.status_rule كما وردت حرفياً — "
        + "مصدر الخطة: " + String(st.st.source || "—"),
      ],
    };
  }

  const REC_BODY = {
    cd3: recBodyCd3,
    cd2: recBodyCd2,
    sd2: recBodySd2,
    id2: recBodyId2,
  };

  /** بطاقة التوصية الكاملة — النص الحرفي يتصدر، ثم جسم الأثر، ثم أزرار
      «الانتقال إلى القسم» و«الملحق التحليلي» وتسلسل التوصيات داخل الطبقة */
  function recDetail(ctx, model, panelId, goto) {
    const rec = model.recById[panelId];
    if (!rec) return null;
    const bodyMk = REC_BODY[panelId];
    const body = bodyMk ? bodyMk(ctx, model) : {};

    const actions = [];
    if (typeof goto === "function") {
      for (const other of model.recs) {
        if (other.panel.id === panelId) continue;
        actions.push({
          label: "التوصية التالية — " + other.panel.title,
          aria: "الانتقال إلى بطاقة التوصية «" + other.panel.title
            + "» داخل طبقة التفاصيل",
          onAct: () => goto(other.panel.id),
        });
        break; /* زر تسلسل واحد يكفي — البقية من الشبكة ذاتها */
      }
    }
    actions.push({
      label: "الانتقال إلى قسم " + rec.secMeta.label,
      aria: "مغادرة الخاتمة إلى قسم " + rec.secMeta.label,
      onAct: () => goSection(rec.secMeta.sectionId),
    });
    actions.push({
      label: "الملحق التحليلي — التفاصيل والتحليل",
      onAct: () => ctx.openAppendix(rec.secMeta.appendixId),
    });

    return detailShell({
      badges: [
        { text: statusBadgeText(rec.panel.status), tone: "gold" },
        {
          text: "لوحة رؤى " + rec.secMeta.label + " — "
            + fmt.iso(String(rec.panel.id)),
          tone: "neu",
        },
      ],
      caption: rec.panel.text,
      bars: body.bars || null,
      rows: body.rows || null,
      table: body.table || null,
      notes: body.notes || null,
      sources: (body.sources || []).concat([
        "نص التوصية حرفي من release.insight_panels — قابل للتحرير من "
        + "الإدارة ويخضع لبوابة مجمع الحقائق ذاتها",
      ]),
      actions,
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) سجل الاعتماد الكامل وسجل الأفق — بطاقتا الذيل والعمود الجانبي
     ══════════════════════════════════════════════════════════════════════════ */

  /** 8-أ: سجل الاعتماد الكامل — الإصدار والبوابات والمصادر والبصمات
      وبنود الحجر الصحي للبيانات (صدق كامل حتى في الخاتمة الاحتفالية) */
  function provenanceDetail(ctx, model) {
    const rel = ctx.release;
    const meta = model.meta;
    const shaShort = (sha) => fmt.iso(String(sha || "").slice(0, 12) + "…");

    const rows = [
      { k: "معرف الإصدار المنشور", v: fmt.iso(String(model.release.id)) },
      {
        k: "حالة الإصدار",
        v: statusBadgeText(model.release.status),
        tone: "pos",
      },
      { k: "نُشر في", v: fmt.date(model.release.published_at) },
      { k: "نُشر بواسطة", v: String(model.release.published_by || "—") },
      { k: "فترة الرصد", v: String(meta.monitoring_period_label) },
      { k: "البيانات حتى", v: String(meta.data_as_of) },
      { k: "تاريخ الحساب المعتمد", v: fmt.date(meta.calculation_date) },
      {
        k: "تاريخ العرض" + (meta.presentation_date_needs_confirmation
          ? " — بانتظار التأكيد" : ""),
        v: fmt.date(meta.presentation_date),
        tone: meta.presentation_date_needs_confirmation ? "gold" : null,
      },
      { k: "بصمة الإصدار SHA-256", v: shaShort(model.release.sha256) },
    ];
    if (model.validation) {
      rows.push({
        k: "بوابات التحقق المجتازة — " + fmt.date(model.validation.checked_at),
        v: model.gatesText + fmt.NBSP
          + fmt.countNoun(model.validation.gates_total, LOCAL_NOUNS.gate)
            .replace(/^[\d,]+\s/, ""),
        tone: "pos",
      });
    }

    const notes = [];
    if (model.release.notes) notes.push(String(model.release.notes));
    if (rel.strategy && rel.strategy.note) notes.push(String(rel.strategy.note));
    if (rel.quarantine && rel.quarantine.inspector_level_records) {
      notes.push("حجر بيانات قائم: "
        + String(rel.quarantine.inspector_level_records.reason));
    }
    if (rel.quarantine_resolved && rel.quarantine_resolved.hotspots) {
      notes.push("حجر محسوم: "
        + String(rel.quarantine_resolved.hotspots.resolution));
    }

    return detailShell({
      hero: {
        num: model.gatesText,
        unit: "بوابة تحقق",
        label: "كل بوابات الإصدار مجتازة — "
          + (model.validation ? fmt.date(model.validation.checked_at) : "—"),
        tone: "pos",
      },
      badges: [
        { text: statusBadgeText(model.release.status), tone: "gold" },
      ],
      caption: "سجل الاعتماد الكامل للإصدار الذي بنيت عليه هذه اللوحة: "
        + "كل رقم في العرض يعود إلى هذا الإصدار المنشور غير القابل للتغيير "
        + "أو إلى مشتقة معلنة الصيغة من قيمه.",
      rows,
      table: {
        columns: ["المصدر", "النوع", "القالب", "استيراده", "بصمته"],
        rows: model.sources.map((s) => [
          String(s.name),
          String(s.kind),
          fmt.iso(String(s.template_version || "—")),
          fmt.date(s.imported_at),
          shaShort(s.sha256),
        ]),
        note: fmt.countNoun(model.sources.length, LOCAL_NOUNS.source)
          + " في سجل مصادر الإصدار — البصمات مختصرة إلى 12 خانة للعرض.",
      },
      notes,
      sources: [
        "مصدر الاستراتيجية: " + String((rel.strategy || {}).source || "—"),
      ],
    });
  }

  /** 8-ب: سجل الأفق الكامل — امتدادات المبادرات الجارية، أفق السيناريوهات،
      الهدف الاسترشادي بحالته، وقاعدة الحالة الحرفية */
  function horizonDetail(ctx, model) {
    const st = model.st;
    const rows = [
      {
        k: "مبادرات جاري العمل عليها",
        v: fmt.noun(st.counts[ST_RUN], "initiative"),
        tone: "run",
      },
      {
        k: "متأخرة حكماً — بانتظار تحديث الحالة",
        v: fmt.noun(st.counts[ST_LATE], "initiative"),
        tone: "neg",
      },
      {
        k: "منجزة",
        v: fmt.noun(st.counts[ST_DONE], "initiative"),
        tone: "pos",
      },
      {
        k: "أبعد نهاية مخططة في المحفظة",
        v: st.maxEnd ? fmt.date(st.maxEnd) : "—",
      },
    ];
    if (model.scLast) {
      rows.push({
        k: "أفق سيناريوهات العجز المورّدة",
        v: (model.scFirst ? String(model.scFirst.label) + " – " : "")
          + String(model.scLast.label),
      });
    }
    if (model.tgt) {
      rows.push({
        k: String(model.tgt.label),
        v: fmt.pct(model.tgt.value),
        tone: "gold",
      });
    }

    const notes = [String(st.st.status_rule || "")];
    if (model.tgt && model.tgt.note) notes.push(String(model.tgt.note));
    if (model.scStatus) {
      notes.push("حالة السيناريوهات: " + statusBadgeText(model.scStatus));
    }

    return detailShell({
      hero: {
        num: st.maxEnd ? fmt.date(st.maxEnd) : "—",
        label: "أبعد التزام مخطط في خطة العمل — نهاية مبادرة "
          + (st.running.length ? String(st.running[0].name) : "—"),
      },
      badges: [
        { text: statusBadgeText((model.st.st || {}).status), tone: "gold" },
      ],
      /* العدد والأفق من بيانات الإصدار لا من نص حرفي (إصلاح المراجعة) */
      caption: "أفق المرحلة المقبلة كما تلتزم به خطة العمل والسيناريوهات "
        + "المورّدة: " + fmt.noun(st.running.length, "initiative")
        + " ممتدة، وأفق توقع حتى "
        + String(model.scLast ? model.scLast.label : "—")
        + "، وهدف تغطية استرشادي لم يُعتمد بعد.",
      rows,
      table: {
        columns: ["المبادرة الجارية", "المعرف", "البداية", "النهاية المخططة"],
        rows: st.running.map((ini) => [
          String(ini.name),
          fmt.iso(String(ini.id)),
          ini.start ? fmt.date(ini.start) : "—",
          ini.end ? fmt.date(ini.end) : "—",
        ]),
        note: "الترتيب تنازلي على النهاية المخططة — الأطول أفقاً أولاً.",
      },
      notes,
      sources: [
        "التواريخ والحالات من release.strategy كما وردت حرفياً — "
        + "قاعدة «متأخرة حكماً» مرآة status_rule المنشورة",
      ],
      actions: [
        {
          label: "الانتقال إلى قسم المبادرات والركائز",
          onAct: () => goSection("initiatives"),
        },
        {
          label: "الانتقال إلى قسم سيناريوهات العجز",
          onAct: () => goSection("forecast"),
        },
      ],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) فاتحو التسلسل داخل الطبقة — goto يغلق الطبقة الحالية أولاً (عقد
        ctx.openDetail يعيد دالة إغلاق) ثم يفتح التالية، فلا تتراكم طبقات؛
        وإغلاق آخر بطاقة يعيد التركيز إلى العنصر الذي بدأ التسلسل.
     ══════════════════════════════════════════════════════════════════════════ */

  /** فتح بطاقة حقيقة بتسلسل تنقل بين الحقائق الثلاث داخل الطبقة */
  function openFactCard(ctx, model, key, invoker) {
    let closeRef = null;
    const node = factDetail(ctx, model, key, (nextKey) => {
      if (!model.factByKey[nextKey]) return;
      if (closeRef) closeRef();
      openFactCard(ctx, model, nextKey, invoker);
    });
    if (!node) return;
    const f = model.factByKey[key];
    closeRef = openDetailWithFocusReturn(ctx, invoker, node, {
      title: "الحقيقة " + f.def.ord + " — الأصل والمنهجية",
    });
  }

  /** فتح بطاقة توصية بتسلسل تنقل بين التوصيات داخل الطبقة */
  function openRecCard(ctx, model, panelId, invoker) {
    let closeRef = null;
    const node = recDetail(ctx, model, panelId, (nextId) => {
      if (!model.recById[nextId]) return;
      if (closeRef) closeRef();
      openRecCard(ctx, model, nextId, invoker);
    });
    if (!node) return;
    const rec = model.recById[panelId];
    closeRef = openDetailWithFocusReturn(ctx, invoker, node, {
      title: "توصية: " + rec.panel.title,
    });
  }

  /** فتح سجل الاعتماد الكامل */
  function openProvenanceCard(ctx, model, invoker) {
    openDetailWithFocusReturn(ctx, invoker, provenanceDetail(ctx, model), {
      title: "سجل الاعتماد والتواريخ — الإصدار الكامل",
    });
  }

  /** فتح سجل الأفق الكامل */
  function openHorizonCard(ctx, model, invoker) {
    openDetailWithFocusReturn(ctx, invoker, horizonDetail(ctx, model), {
      title: "أفق المرحلة المقبلة — السجل الكامل",
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) خلفية bokeh الاحتفالية — طبقة زخرفية حتمية البذرة فوق طبقة الوسائط
         وتحت جسم اللوحة (z-index في closing.css): دوائر ضبابية بصبغات
         الزمرد والعاج الخافتة حصراً (الذهبي والمرجاني لا يلوّنان زخرفة)،
         aria-hidden وخاملة المؤشر، وحركة انجراف بطيئة تتصفر مع
         prefers-reduced-motion. مولد شبه عشوائي خطي ببذرة ثابتة —
         التوزيع ذاته في كل زيارة (زخرفة حتمية لا «عشوائية» تُتهم بالبيانات).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildBokeh(root) {
    if (!root) return null;
    /* مولد LCG ببذرة ثابتة (تاريخ العرض التأسيسي كرقم) — حتمي تماماً */
    let seed = 20260816 >>> 0;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const layer = h("div", { class: "cls-bokeh", "aria-hidden": "true" });
    const COUNT = 18;
    for (let i = 0; i < COUNT; i++) {
      const size = Math.round(70 + rand() * 260);          /* قطر بوحدة su */
      const x = (rand() * 104 - 2).toFixed(2);             /* يسمح بقصّ الحواف */
      const y = (rand() * 104 - 2).toFixed(2);
      const dur = (16 + rand() * 16).toFixed(2);
      const delay = (-rand() * 24).toFixed(2);
      layer.appendChild(h("span", {
        class: "cls-bokeh-dot v" + (i % 3),
        style: {
          width: "calc(var(--su) * " + size + ")",
          height: "calc(var(--su) * " + size + ")",
          insetInlineStart: x + "%",
          top: y + "%",
          animationDuration: dur + "s",
          animationDelay: delay + "s",
        },
      }));
    }
    root.appendChild(layer);
    return layer;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) رسم مصغر داخل بطاقة — عبر مُنشئ charts2 القانوني حصراً؛ غياب
         المُنشئ في بناء متوازٍ يعرض بطاقة صادقة مدمجة لا يسقط اللوحة.
     ══════════════════════════════════════════════════════════════════════════ */
  function makeChart(host, ctx, name, opts) {
    const mk = RH.viz.charts2 ? RH.viz.charts2[name] : null;
    if (typeof mk !== "function") {
      console.warn("s09-closing: مُنشئ " + name + " غير مضموم في هذا البناء");
      RH.presenter.layout.pendingCard(host, {
        label: "الرسم غير متوفر في هذا البناء",
        note: "المُنشئ " + name + " لم يُضم بعد — أعد البناء عبر build.py",
      });
      return null;
    }
    return mk(host, ctx.su, opts);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) صف الحقائق الثلاث — البطاقات البطولية: رقم ضخم بعدّ تصاعدي عند
         أول دخول، الموجز المعتمد حرفياً، شرائح الأرقام المساندة، الرسم
         المصغر الحي، وسطر الصيغة المعتمدة مع وسم التحقق. البطل (الرقم +
         الموجز) زر حقيقي الوظيفة يفتح بطاقة الأصل، ونقر الرسم المصغر
         يفتحها كذلك (مسار فأرة موازٍ — للوحة المفاتيح مسار البطل).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildFactCard(cell, ctx, model, f) {
    const rel = ctx.release;
    const dm = f.def.publishedMetric(rel);

    const card = h("article", {
      class: "dash-card cls-fact " + f.def.tone,
      "aria-label": "الحقيقة " + f.def.ord + " — " + f.def.theme,
    });

    /* السطر التمهيدي: رتبة الحقيقة وموضوعها + وسم التحقق */
    card.appendChild(h("div", { class: "cls-fact-kicker" },
      h("span", { class: "cls-fact-ord" }, "الحقيقة " + f.def.ord),
      h("span", { class: "cls-fact-theme" }, f.def.theme),
      h("span", {
        class: "cls-fact-verified",
        title: statusBadgeText(f.insight ? f.insight.status : null),
      }, "متحقق منها"),
    ));

    /* البطل: الرقم الضخم (عدّ تصاعدي عند أول دخول فقط) + الموجز الحرفي */
    const numEl = h("span", {
      class: "cls-fact-num",
      "aria-hidden": "true",                /* القيمة تُقرأ من aria-label البطل */
    }, fmt.pct(f.value));
    RH.viz.motion.countUp(numEl, f.value, (v) => fmt.pct(v),
      "cls:fact:" + f.key, 1100);

    const hero = h("div", { class: "cls-fact-hero" },
      numEl,
      h("p", { class: "cls-fact-read" }, f.text || "—"),
    );
    activatable(hero, () => openFactCard(ctx, model, f.key, hero),
      "الحقيقة " + f.def.ord + " — " + f.def.theme + ": " + fmt.pct(f.value)
      + "؛ " + (f.text || "") + " — فتح بطاقة الأصل والمنهجية");
    card.appendChild(hero);

    /* شرائح الأرقام المساندة — كلها من الإصدار عبر fmt */
    card.appendChild(h("div", { class: "cls-fact-chips" },
      f.chips.map((c) => h("span", {
        class: "cls-chip" + (c.tone ? " " + c.tone : ""),
      }, c.text))));

    /* الرسم المصغر الحي — مُنشئ قانوني بمفتاح "closing".
       chartTitle قد يكون دالة تركب العنوان من meta الإصدار (لا تاريخ حرفياً) */
    const chartWrap = h("div", { class: "cls-fact-chartwrap" },
      h("div", { class: "cls-fact-charttitle" },
        typeof f.def.chartTitle === "function"
          ? f.def.chartTitle(ctx.release)
          : f.def.chartTitle));
    const host = h("div", { class: "chart-host cls-fact-chart" });
    chartWrap.appendChild(host);
    card.appendChild(chartWrap);
    const chart = makeChart(host, ctx, f.def.chartName, f.def.chartOpts);
    if (chart) {
      wireChartEvent(ctx, chart, "click", () => {
        openFactCard(ctx, model, f.key, hero);
      });
    }

    /* ذيل البطاقة: الصيغة المعتمدة للمشتقة المنشورة (لاتينية → عزل) */
    card.appendChild(h("div", { class: "cls-fact-foot" },
      h("span", { class: "cls-fact-formula" },
        "الصيغة المعتمدة: " + fmt.iso(String(dm.formula))),
      h("span", { class: "cls-arrow", "aria-hidden": "true" }, "←"),
    ));

    cell.appendChild(card);
    return card;
  }

  function buildFactsRow(g, ctx, model) {
    for (const f of model.facts) {
      const cell = g.cell({ span: 4, cls: "cls-cell-fact" });
      buildFactCard(cell, ctx, model, f);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     13) بطاقة التوصيات التنفيذية — شبكة 2×2 من بطاقات التوصيات المنتقاة:
         النص الحرفي والتصنيف اللوني من الإصدار، وكل بطاقة زر حقيقي يفتح
         بطاقة الأثر الكاملة بأرقامها وأزرار الانتقال.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildRecsCell(cell, ctx, model) {
    const res = RH.presenter.layout.card(cell, {
      title: "التوصيات التنفيذية",
      sub: model.recsNoun + " من لوحات الرؤى المعتمدة — انقر توصية لأثرها",
      cls: "cls-recs-card",
    });

    const grid2 = h("div", { class: "cls-recs-grid" });
    for (const rec of model.recs) {
      const recEl = h("article", { class: "cls-rec " + rec.cls },
        h("div", { class: "cls-rec-head" },
          h("span", { class: "cls-rec-dot", "aria-hidden": "true" }),
          h("span", { class: "cls-rec-src" }, "رؤى " + rec.secMeta.label),
          h("span", { class: "cls-rec-id" }, fmt.iso(String(rec.panel.id))),
        ),
        h("div", { class: "cls-rec-title" }, rec.panel.title),
        h("p", { class: "cls-rec-text" }, rec.panel.text),
        h("div", { class: "cls-rec-foot" },
          h("span", {}, "الأثر والأرقام المساندة"),
          h("span", { class: "cls-arrow", "aria-hidden": "true" }, "←"),
        ),
      );
      activatable(recEl,
        () => openRecCard(ctx, model, rec.panel.id, recEl),
        "توصية من لوحة رؤى " + rec.secMeta.label + ": " + rec.panel.title
        + " — فتح بطاقة الأثر الكاملة");
      grid2.appendChild(recEl);
    }
    res.body.appendChild(grid2);

    /* ذيل صادق: مصدر التوصيات وحوكمتها */
    res.card.appendChild(h("div", { class: "cls-cardfoot" },
      "التوصيات نصوص حرفية من لوحات الرؤى المعتمدة في الإصدار — تُدار من "
      + "الإدارة وتخضع أرقامها لبوابة مجمع الحقائق ذاتها.",
    ));
    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     14) بطاقة أفق المرحلة المقبلة — donut حالات المبادرات المصغر + صفوف
         الأفق (كلها من الإصدار) + زر السجل الكامل، ثم بطاقة «الخطوات
         القادمة» الصادقة قيد الاعتماد (بطاقة مدمجة — لا شاشة كاملة أبداً).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildHorizonCell(cell, ctx, model) {
    cell.classList.add("cls-cell-side");
    const st = model.st;

    const res = RH.presenter.layout.card(cell, {
      title: "أفق المرحلة المقبلة",
      sub: "ما بعد " + String(model.meta.data_as_of),
      cls: "cls-horizon-card",
    });

    const wrap = h("div", { class: "cls-hz-wrap" });

    /* اليمين (أول RTL): صفوف الأفق */
    const rows = h("div", { class: "cls-hz-rows" });

    function hzRow(o) {
      const rowEl = h("div", { class: "cls-hz-row" + (o.tone ? " " + o.tone : "") },
        h("span", { class: "cls-hz-k" }, o.k),
        h("span", { class: "cls-hz-v" },
          h("b", {}, o.v),
          o.badge ? h("span", { class: "cls-hz-badge" }, o.badge) : null,
        ),
        o.sub ? h("span", { class: "cls-hz-sub" }, o.sub) : null,
      );
      rows.appendChild(rowEl);
      return rowEl;
    }

    hzRow({
      k: "جاري العمل عليها",
      v: fmt.noun(st.counts[ST_RUN], "initiative"),
      sub: st.maxRunningEnd
        ? "تمتد حتى " + fmt.date(st.maxRunningEnd) : null,
      tone: "run",
    });
    hzRow({
      k: "متأخرة حكماً",
      v: fmt.noun(st.counts[ST_LATE], "initiative"),
      sub: "بانتظار تحديث الحالة في خطة العمل",
      tone: "neg",
    });
    hzRow({
      k: "منجزة",
      v: fmt.noun(st.counts[ST_DONE], "initiative"),
      tone: "pos",
    });
    if (model.scLast) {
      hzRow({
        k: "أفق سيناريوهات العجز",
        v: String(model.scLast.label),
        sub: statusBadgeText(model.scStatus),
      });
    }
    if (model.tgt) {
      hzRow({
        k: "هدف التغطية الاسترشادي",
        v: fmt.pct(model.tgt.value),
        badge: "غير معتمد",
        tone: "gold",
      });
    }
    wrap.appendChild(rows);

    /* اليسار: donut حالات المبادرات المصغر — مُنشئ قانوني بمفتاح closing */
    const donutHost = h("div", { class: "chart-host cls-hz-donut" });
    wrap.appendChild(donutHost);
    const donut = makeChart(donutHost, ctx, "statusDonut",
      { key: "closing", compact: true });
    if (donut) {
      wireChartEvent(ctx, donut, "click", () => {
        openHorizonCard(ctx, model, res.card);
      });
    }

    res.body.appendChild(wrap);

    /* زر السجل الكامل */
    const btn = h("button", {
      class: "cls-linkbtn",
      type: "button",
      "data-interactive": "",
      "aria-label": "فتح سجل أفق المرحلة المقبلة الكامل",
      onclick: (ev) => openHorizonCard(ctx, model, ev.currentTarget),
    },
      h("span", {}, "السجل الكامل — المبادرات الممتدة والأفق"),
      h("span", { class: "cls-arrow", "aria-hidden": "true" }, "←"),
    );
    res.card.appendChild(h("div", { class: "cls-cardfoot cls-hz-foot" }, btn));

    /* الخطوات القادمة — الحالة الصادقة قيد الاعتماد كبطاقة مدمجة */
    if (model.nextSteps) {
      RH.presenter.layout.pendingCard(cell, {
        label: "الخطوات القادمة — " + statusBadgeText(model.nextSteps.status),
        note: String(model.nextSteps.note || ""),
      });
    }
    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     15) سطر التواريخ والاعتماد — ذيل اللوحة بعرضها الكامل: بنود الفترة
         والتواريخ والإصدار والبوابات، وزرّا «سجل الاعتماد الكامل» و«العودة
         إلى الملخص التنفيذي» (الختام الدائري للعرض).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildFooter(el, ctx, model) {
    const meta = model.meta;

    const items = [
      { k: "فترة الرصد", v: String(meta.monitoring_period_label) },
      { k: "البيانات حتى", v: String(meta.data_as_of) },
      { k: "تاريخ الحساب", v: fmt.date(meta.calculation_date) },
      {
        k: "تاريخ العرض",
        v: fmt.date(meta.presentation_date),
        badge: meta.presentation_date_needs_confirmation
          ? "بانتظار التأكيد" : null,
      },
      { k: "الإصدار", v: fmt.iso(String(model.release.id)) },
      { k: "بوابات التحقق", v: model.gatesText, tone: "pos" },
    ];

    const line = h("div", { class: "cls-footer-line" });
    items.forEach((it, i) => {
      if (i > 0) {
        line.appendChild(h("span", {
          class: "cls-footer-sep", "aria-hidden": "true",
        }, "·"));
      }
      line.appendChild(h("span", {
        class: "cls-footer-item" + (it.tone ? " " + it.tone : ""),
      },
        h("span", { class: "cls-footer-k" }, it.k),
        h("b", { class: "cls-footer-v" }, it.v),
        it.badge ? h("span", { class: "cls-footer-badge" }, it.badge) : null,
      ));
    });

    const actions = h("div", { class: "cls-footer-actions" },
      h("button", {
        class: "cls-linkbtn",
        type: "button",
        "data-interactive": "",
        "aria-label": "فتح سجل الاعتماد والتواريخ الكامل للإصدار",
        onclick: (ev) => openProvenanceCard(ctx, model, ev.currentTarget),
      },
        h("span", {}, "سجل الاعتماد الكامل"),
        h("span", { class: "cls-arrow", "aria-hidden": "true" }, "←"),
      ),
      h("button", {
        class: "cls-linkbtn cls-home",
        type: "button",
        "data-interactive": "",
        "aria-label": "العودة إلى الملخص التنفيذي — بداية اللوحات",
        onclick: () => goSection("summary"),
      },
        h("span", {}, "العودة إلى الملخص التنفيذي"),
        h("span", { class: "cls-arrow", "aria-hidden": "true" }, "←"),
      ),
    );

    el.appendChild(h("footer", { class: "cls-footer" }, line, actions));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     16) ملخص ناطق للوحة كاملة — منطقة مخفية بصرياً تقرأ الحقائق الثلاث
         والتوصيات وسجل الاعتماد بترتيبها لقارئات الشاشة قبل الغوص في
         الرسوم (للرسوم بدائلها الجدولية داخل مكتبة charts2 — srTable).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, ctx, model) {
    const parts = model.facts.map((f) =>
      "الحقيقة " + f.def.ord + " (" + f.def.theme + "): " + (f.text || "—"));
    el.appendChild(h("p", {
      class: "cls-sr",
      role: "note",
      "aria-label": "ملخص لوحة الخاتمة",
    },
      "خاتمة العرض — " + model.factsNoun + " متحقق منها: "
      + parts.join(" ") + " وتليها " + model.recsNoun
      + " من لوحات الرؤى المعتمدة. الإصدار "
      + fmt.iso(String(model.release.id)) + " اجتاز " + model.gatesText
      + " من بوابات التحقق، والبيانات حتى " + String(model.meta.data_as_of)
      + " عن فترة الرصد " + String(model.meta.monitoring_period_label) + ".",
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     17) الوصول العميق عبر معاملات المسار (عقد ctx.params — سلاسل خام):
         ‎?fact=coverage|licenses|south‎ · ‎?rec=<panelId>‎ ·
         ‎?card=provenance|horizon‎ — روابط قابلة للمشاركة من الملاحق
         والتقارير. معامل غير صالح يُتجاهل بصمت (لا شاشة خطأ في المسرح).
     ══════════════════════════════════════════════════════════════════════════ */
  function honourDeepLink(ctx, model) {
    const p = ctx.params || {};
    if (p.fact && model.factByKey[p.fact]) {
      openFactCard(ctx, model, p.fact, null);
      return;
    }
    if (p.rec && model.recById[p.rec]) {
      openRecCard(ctx, model, p.rec, null);
      return;
    }
    if (p.card === "provenance") {
      openProvenanceCard(ctx, model, null);
      return;
    }
    if (p.card === "horizon") {
      openHorizonCard(ctx, model, null);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     18) بناء اللوحة — الهرمية الملزمة: خلفية bokeh (تحت الجسم) ← ترويسة
         ← صف الحقائق الثلاث البطولية (شريط الأرقام الكبرى بصيغته المهيبة)
         ← صف التوصيات (7) والأفق (5) ← سطر التواريخ والاعتماد بعرض كامل.
     ══════════════════════════════════════════════════════════════════════════ */
  function build(el, ctx) {
    const rel = ctx.release;
    const model = closingModel(rel, ctx.derived);

    /* طبقة bokeh الزخرفية على جذر القسم (تحت جسم اللوحة بالتراص) */
    buildBokeh(el.closest ? el.closest(".dash") : null);

    /* الترويسة: سياق ذهبي + عنوان + وسم البوابات + سطر الفترة */
    RH.presenter.layout.sectionHeader(el, {
      kicker: "الخاتمة",
      title: "الحقائق المتحقق منها والتوصيات",
      badge: "بوابات التحقق " + model.gatesText,
      meta: "بيانات حتى " + String(model.meta.data_as_of) + " — فترة الرصد "
        + String(model.meta.monitoring_period_label),
    });

    /* الشبكة: 12 عموداً؛ قالب الصفوف في closing.css (صف الحقائق أطول).
       الترتيب البصري RTL: الخلية الأولى أقصى اليمين. */
    const g = RH.presenter.layout.grid(el, { cols: 12, cls: "cls-grid" });

    /* الصف الأول: الحقائق الثلاث (4+4+4) */
    buildFactsRow(g, ctx, model);

    /* الصف الثاني: التوصيات (7) + الأفق والخطوات القادمة (5) */
    const cRecs = g.cell({ span: 7, cls: "cls-cell-recs" });
    const cSide = g.cell({ span: 5 });
    buildRecsCell(cRecs, ctx, model);
    buildHorizonCell(cSide, ctx, model);

    /* سطر التواريخ والاعتماد بعرض اللوحة الكامل */
    buildFooter(el, ctx, model);

    /* الملخص الناطق ثم تلبية معامل الوصول العميق إن وُجد */
    buildSrSummary(el, ctx, model);
    honourDeepLink(ctx, model);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     19) تسجيل القسم — عقد RH.sections.register (order:9، id:"closing"،
         backdrop:"closing" → مستعار mediaBg إلى خلفية kpis_closing،
         major:true — دخول الخاتمة انتقال مقطعي كبير، حالة واحدة بلا
         خطوات بناء: الخاتمة تُقرأ دفعة واحدة كلوحة شرف).
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "closing",
    order: 9,
    title: "الخاتمة والتوصيات",
    kicker: "الخاتمة",
    backdrop: "closing",
    dim: 0.86,
    steps: 0,
    major: true,
    build,
  });

  /* منفذ اختبار داخلي (ليس من عقد القسم): يكشف بُناة النموذج والبطاقات
     للاختبارات الآلية كي تتحقق من مطابقة أرقام البطاقات لمرايا الإصدار
     دون بناء DOM المسرح كاملاً. البادئة السفلية تعلن أنه غير معد
     للاستهلاك من بقية الأقسام. */
  RH.sections._closingInternals = {
    closingModel,
    strategyStatus,
    computedStatus,
    factDetail,
    recDetail,
    provenanceDetail,
    horizonDetail,
    FACT_DEFS,
    REC_REFS,
    SECTION_META,
    STATUS_BADGE,
  };
})();
