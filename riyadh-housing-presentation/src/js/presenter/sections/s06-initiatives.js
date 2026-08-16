/* ════════════════════════════════════════════════════════════════════════════
   s06-initiatives.js — القسم 6: «المبادرات والركائز» — مركز قيادة المحفظة
   ────────────────────────────────────────────────────────────────────────────
   لوحة قيادة كثيفة (عقد V2_CONTRACTS §1 — order:6, id:"initiatives",
   backdrop:"initiatives", major: انتقال مقطعي كبير — القسم يفتتح الفصل
   الاستراتيجي بعد الفصل الميداني):

     ▸ شريط خمسة مؤشرات كبرى أعلى الشاشة — كل رقم قابل للنقر يفتح بطاقة
       تفاصيل كاملة (القوائم والنطاقات والمصدر كما وردت في الإصدار):
         1. محفظة المبادرات        18 مبادرة   (وسم المصدر «خطة عمل V.1.0.0»)
         2. المحاور الاستراتيجية    4 محاور     (3 ركائز + ممكن واحد)
         3. مبادرات منجزة          2           (أخضر — المبادرتان 1.1 و3.1)
         4. جاري العمل عليها       9           (حياد — تمتد حتى أبريل 2027)
         5. متأخرة حكماً           7           (مرجاني — تجاوزت نهايتها
                                                المخططة دون تسجيل إنجاز)

     ▸ نطاق الركائز الأربع (صف كامل العرض): بطاقات pillarCards القانونية
       (3 «ركيزة» + 1 «ممكن») بعدّاداتها وأشرطة توزيع حالاتها — نقر أي
       بطاقة يفتح ملف المحور الكامل بمبادراته.

     ▸ المخطط الزمني Gantt كامل الشاشة تقريباً (9 من 12 عموداً × الصف
       الطويل): initiativeGantt القانوني بخط «اليوم» الذهبي عند تاريخ
       الحساب، وقاعدة «متأخرة حكماً» الأصلية، ومفتاح عرض مزدوج في ترويسة
       البطاقة: «المخطط الزمني» / «سجل المحفظة» — السجل جدول كثيف قابل
       للترشيح بالحالة، وكل صف يفتح ملف مبادرته. نقر أي شريط في المخطط
       يفتح ملف المبادرة كذلك.

     ▸ العمود الجانبي: donut الحالات الكامل (نقر شريحة أو رقاقة يفتح
       قائمة الحالة) + عمود رؤى insight_panels.sections.initiatives +
       بطاقة المصدر بنصه الحرفي من الإصدار + سطر الحداثة والاحتساب.

     ▸ وصول عميق عبر معاملات المسار (عقد ctx.params — تُقرأ ولا تُكتب):
         ‎#/section/initiatives?pillar=p1‎      يفتح ملف المحور مباشرة
         ‎#/section/initiatives?initiative=1.4‎ يفتح ملف المبادرة
         ‎#/section/initiatives?status=late‎    يفتح قائمة الحالة
                                               (done|running|late|idle)
         ‎#/section/initiatives?view=table‎     يبدأ بعرض سجل المحفظة
       معامل غير صالح يُتجاهل بصمت — لا شاشات خطأ في مسرح العرض.

     ▸ دورة تركيز مفاتيحية مكتملة: إغلاق أي بطاقة تفاصيل (بأي بوابة من
       بواباتها الثلاث Escape/زر/خلفية) يعيد التركيز إلى العنصر الذي
       فتحها — مراقب طفرات على جذر القسم يُفصل فور الإصابة وعند الهدم.

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل معطى من release.json (strategy/meta/insight_panels)
     عبر ctx.release حصراً؛ المشتقات الوحيدة حسابات تواريخ شفافة (مدة/
     تجاوز/متبقٍ) من تواريخ المصدر نفسها بمرآة مكتبة الرسوم القانونية،
     والمبادرتان المنجزتان بلا تواريخ تُعرضان «بلا نطاق زمني في المصدر»
     بصدق — لا اختلاق نطاق ولا نسب إنجاز (غير موجودة في المصدر أصلاً).
   • كل رقم ظاهر عبر RH.core.fmt (تطابق العدد والمعدود عبر noun/countNoun،
     عزل اتجاهي عبر fmt.iso/fmt.pct، تواريخ عربية عبر fmt.date).
   • كل نص إصدار يُبنى بعقد dom.h النصي (textContent) — لا innerHTML
     لمحتوى الإصدار إطلاقاً؛ تلميحات الرسوم داخل مكتبة charts2 ذاتها
     (تمر عبر theme.esc هناك).
   • منظومة المعنى: أخضر=منجز (ما اكتمل)، أزرق=جاري العمل (فئة ثانوية
     محايدة)، مرجاني=متأخرة حكماً حصراً (خلل)، رمادي خافت=لم يتم البدء
     (غياب حالة لا فئة)، ذهبي=خط «اليوم» المرجعي ووسوم المصدر/الكروم
     المقنن حصراً. لا gauges دائرية، لا KPI بأيقونات، لا محاور مزدوجة.
   • الرسوم عبر مُنشئي RH.viz.charts2 القانونيين حصراً بمفتاح مثيلات
     "initiatives" كي لا تصطدم بمثيلات الملخص التنفيذي (key:"summary")،
     وبلا أي خيار خارج عقدها الموثق { key, compact, cols, onSelect }.
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (أزرار حقيقية أو
     role=button بمعالجة Enter/مسافة) وموسوم data-interactive كي لا
     يبتلع جهاز التقديم ضغطاته (عقد الملاحة §8)؛ Escape يغلق بطاقة
     التفاصيل (عقد ctx.openDetail) وتلميح الرسم المفاتيحي (keyNav).
   • prefers-reduced-motion محترم: العد التصاعدي عبر RH.viz.motion (قيمة
     نهائية فورية عند التقليل) وانتقالات CSS تُصفَّر في initiatives.css.
   • التنظيف عبر ctx.onTeardown: فصل مستمعي نقر مثيلات ECharts (المثيلات
     تعمّر في سجل الثيم أطول من DOM القسم) وفصل مراقبي الطفرات —
     مستمعو عناصر القسم ذاته تسقط مع هدم DOM.
   • 16:9 يتسع دون تمرير عند 1920×1080 بوحدة ‎--su؛ الفيضان الرأسي في
     وضع اللوحة يُحل بتمرير داخلي في جسم القسم حصراً (initiatives.css) —
     المسرح لا يتمرر أفقياً أبداً.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* نسبة مئوية بنفس مرآة بايثون (نصف لأعلى) — المرجع الوحيد لأي مشتقة
     تواريخ نسبية تظهر في هذه اللوحة (المنقضي من المدة) */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /* ──────────────────────────────────────────────────────────────────────────
     ثوابت عرض (لا قيم بيانات إطلاقاً)
     ────────────────────────────────────────────────────────────────────────── */

  /** وسم المصدر القصير للترويسة والبطاقات — النص الحرفي الكامل من
      strategy.source يُعرض في بطاقة المصدر وبطاقات التفاصيل */
  const SOURCE_BADGE = "خطة عمل V.1.0.0";

  /* مفردات الحالة القانونية — مرآة strategy.status_vocabulary حرفياً
     (تُطابَق ضدها بالحرس عند بناء النموذج) */
  const ST_DONE = "منجزة";
  const ST_RUN = "جاري العمل";
  const ST_LATE = "متأخرة";
  const ST_IDLE = "لم يتم البدء";

  /** أصناف CSS الدلالية لكل حالة — منظومة المعنى المتحقق منها لونياً:
      المنجز أخضر، الجاري أزرق (فئة ثانوية)، المتأخر مرجاني حصراً،
      غير المبدوء رمادي خافت (غياب حالة لا فئة بيانات) */
  const ST_CLS = {};
  ST_CLS[ST_DONE] = "done";
  ST_CLS[ST_RUN] = "run";
  ST_CLS[ST_LATE] = "late";
  ST_CLS[ST_IDLE] = "idle";

  /** نغمة صفوف «بيان ← قيمة» لكل حالة (المرجاني للتأخر حصراً) */
  const ST_TONE = {};
  ST_TONE[ST_DONE] = "pos";
  ST_TONE[ST_RUN] = "neu";
  ST_TONE[ST_LATE] = "neg";
  ST_TONE[ST_IDLE] = "neu";

  /** مفاتيح الوصول العميق اللاتينية → مفردات الحالة (عقد ?status=) */
  const STATUS_PARAM = {
    done: ST_DONE,
    running: ST_RUN,
    late: ST_LATE,
    idle: ST_IDLE,
  };

  /** صيغ عدد ومعدود محلية لما لا تغطيه NOUNS المركزية (عقد fmt.countNoun) */
  const LOCAL_NOUNS = {
    axis: { one: "محور واحد", two: "محوران", few: "محاور", many: "محوراً", hundred: "محور" },
    day: { one: "يوم واحد", two: "يومان", few: "أيام", many: "يوماً", hundred: "يوم" },
    enabler: { one: "ممكن واحد", two: "ممكنان", few: "ممكنات", many: "ممكناً", hundred: "ممكن" },
    state: { one: "حالة واحدة", two: "حالتان", few: "حالات", many: "حالة", hundred: "حالة" },
  };
  const dayNoun = (n) => fmt.countNoun(n, LOCAL_NOUNS.day);
  const axisNoun = (n) => fmt.countNoun(n, LOCAL_NOUNS.axis);

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js: فشل فحص لا يُسقط
     اللوحة (الإصدار المنشور اجتاز البوابات أصلاً) بل ينبه في وحدة التحكم
     لالتقاط أي انجراف بيانات مبكراً أثناء التطوير.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s06-initiatives/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) أدوات التاريخ — تحليل ISO حتمي بتوقيت UTC (مرآة مكتبة الرسوم
        القانونية حرفياً: لا انزياح مناطق زمنية، لا Date.parse حر)
     ══════════════════════════════════════════════════════════════════════════ */
  const DAY_MS = 86400000;

  /** "2026-04-01" → ميلي ثانية UTC؛ يعيد NaN للغائب/غير الصالح */
  function isoMs(iso) {
    if (!iso) return NaN;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
    if (!m) return NaN;
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  }

  /** مرآة حرفية لقاعدة status_rule الرسمية (generate_data وV2_CONTRACTS §3):
      حالة الملف إن وُجدت؛ وإلا: end < calculation_date → «متأخرة» حكماً؛
      start ≤ calculation_date → «جاري العمل»؛ وإلا «لم يتم البدء».
      مقارنة سلاسل ISO مباشرة — حتمية وبلا مناطق زمنية. */
  function statusOf(ini, calcDate) {
    if (ini.status) return ini.status;
    if (ini.end && ini.end < calcDate) return ST_LATE;
    if (ini.start && ini.start <= calcDate) return ST_RUN;
    return ST_IDLE;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) نموذج المحفظة الجاهز للعرض — يُبنى مرة واحدة عند بناء القسم
     ──────────────────────────────────────────────────────────────────────────
     يضم: الصفوف الثمانية عشر مرتبةً بالمحور فالمعرف مع الحالة المحسوبة
     ومشتقات التواريخ الشفافة (مدة/تجاوز/متبقٍ/منقضٍ) + المحاور الأربعة
     بقوائمها وتوزيعاتها ونطاقاتها + التوزيع الكلي 2/9/7 + النطاق الكامل
     للمحفظة — كل شيء من الإصدار المنشور حصراً.
     ══════════════════════════════════════════════════════════════════════════ */
  function initiativesModel(rel) {
    const st = rel.strategy;
    const calc = rel.meta.calculation_date;
    const calcMs = isoMs(calc);
    const vocab = st.status_vocabulary || [];

    const pIdx = {};
    st.pillars.forEach((p, i) => { pIdx[p.id] = i; });

    /* الصفوف: ترتيب المحور فالمعرف عددياً — مرآة ترتيب مكتبة الرسوم
       القانونية حرفياً كي يتطابق dataIndex نقرات المخطط مع صفوفنا */
    const rows = st.initiatives.slice().sort((a, b) => {
      const d = (pIdx[a.pillar_id] || 0) - (pIdx[b.pillar_id] || 0);
      if (d !== 0) return d;
      return String(a.id).localeCompare(String(b.id), "en", { numeric: true });
    }).map((ini) => {
      const startMs = isoMs(ini.start);
      const endMs = isoMs(ini.end);
      const dated = Number.isFinite(startMs) && Number.isFinite(endMs);
      const status = statusOf(ini, calc);
      const row = {
        ini,
        pillar: st.pillars[pIdx[ini.pillar_id]],
        status,
        startMs,
        endMs,
        dated,
        days: dated ? Math.round((endMs - startMs) / DAY_MS) + 1 : null,
        overDays: null,
        leftDays: null,
        untilDays: null,
        elapsedPct: null,
      };
      if (dated && status === ST_LATE) {
        row.overDays = Math.max(Math.round((calcMs - endMs) / DAY_MS), 0);
      }
      if (dated && status === ST_RUN) {
        const span = endMs - startMs;
        row.leftDays = Math.max(Math.round((endMs - calcMs) / DAY_MS), 0);
        if (span > 0) {
          row.elapsedPct = pctOf(Math.min(Math.max(calcMs - startMs, 0), span), span);
        }
      }
      if (dated && status === ST_IDLE) {
        row.untilDays = Math.max(Math.round((startMs - calcMs) / DAY_MS), 0);
      }
      return row;
    });

    /* التوزيع الكلي بترتيب المفردات القانونية (لا ترتيب مخترعاً) */
    const counts = {};
    for (const v of vocab) counts[v] = 0;
    for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;

    /* المحاور الأربعة: قائمة كل محور وتوزيعه ونطاقه المشتق من تواريخ
       المصدر (مقارنة سلاسل ISO حتمية) + قسمة الاسم على فاصلته الأصلية */
    const pillars = st.pillars.map((p) => {
      const list = rows.filter((r) => r.ini.pillar_id === p.id);
      const pc = {};
      for (const v of vocab) pc[v] = 0;
      for (const r of list) pc[r.status] = (pc[r.status] || 0) + 1;
      const dated = list.filter((r) => r.dated);
      let minStart = null, maxEnd = null;
      for (const r of dated) {
        if (minStart === null || r.ini.start < minStart) minStart = r.ini.start;
        if (maxEnd === null || r.ini.end > maxEnd) maxEnd = r.ini.end;
      }
      const name = String(p.name);
      const cut = name.indexOf(":");
      return {
        p,
        list,
        counts: pc,
        minStart,
        maxEnd,
        undated: list.length - dated.length,
        kicker: cut > 0 ? name.slice(0, cut).trim() : String(p.kind),
        title: cut > 0 ? name.slice(cut + 1).trim() : name,
      };
    });
    const pillarById = {};
    for (const pv of pillars) pillarById[pv.p.id] = pv;
    const rowById = {};
    for (const r of rows) rowById[String(r.ini.id)] = r;

    /* النطاق الكامل للمحفظة والقوائم الحالية والقيم القصوى المشتقة */
    const datedRows = rows.filter((r) => r.dated);
    let minStart = null, maxEnd = null;
    for (const r of datedRows) {
      if (minStart === null || r.ini.start < minStart) minStart = r.ini.start;
      if (maxEnd === null || r.ini.end > maxEnd) maxEnd = r.ini.end;
    }
    const undatedRows = rows.filter((r) => !r.dated);
    const doneRows = rows.filter((r) => r.status === ST_DONE);
    const runRows = rows.filter((r) => r.status === ST_RUN);
    const lateRows = rows.filter((r) => r.status === ST_LATE);
    const idleRows = rows.filter((r) => r.status === ST_IDLE);

    let maxOver = 0, maxOverRow = null;
    for (const r of lateRows) {
      if (r.overDays != null && r.overDays > maxOver) {
        maxOver = r.overDays;
        maxOverRow = r;
      }
    }
    let longestRun = null;
    for (const r of runRows) {
      if (r.days != null && (longestRun === null || r.days > longestRun.days)) {
        longestRun = r;
      }
    }
    let runMaxEnd = null;
    for (const r of runRows) {
      if (r.dated && (runMaxEnd === null || r.ini.end > runMaxEnd)) {
        runMaxEnd = r.ini.end;
      }
    }

    /* تركيبة المحاور: 3 «ركيزة» + 1 «ممكن» — من حقل kind الحرفي */
    const kinds = {
      pillar: st.pillars.filter((p) => p.kind === "ركيزة").length,
      enabler: st.pillars.filter((p) => p.kind === "ممكن").length,
    };

    const model = {
      rel, st, calc, calcMs, vocab,
      rows, counts, pillars, pillarById, rowById,
      minStart, maxEnd,
      datedRows, undatedRows, doneRows, runRows, lateRows, idleRows,
      maxOver, maxOverRow, longestRun, runMaxEnd,
      kinds,
      source: String(st.source || ""),
      statusRule: String(st.status_rule || ""),
      asOf: rel.meta.data_as_of,
    };

    /* متطابقات الإصدار التي تتكئ عليها اللوحة كاملة (مرآة بوابات
       strategy.* في validate.js) — تنبيه مبكر عند أي انجراف */
    guard("initiativesModel", {
      "4 محاور في المصدر": st.pillars.length === 4,
      "18 مبادرة في المصدر": rows.length === 18,
      "3 ركائز + 1 ممكن": kinds.pillar === 3 && kinds.enabler === 1,
      "كل مبادرة تنتمي لمحور معرَّف": rows.every((r) => !!r.pillar),
      "كل حالة محسوبة من المفردات القانونية":
        rows.every((r) => vocab.indexOf(r.status) >= 0),
      "التوزيع المثبت بالبوابات 2 منجزة / 9 جاري / 7 متأخرة":
        counts[ST_DONE] === 2 && counts[ST_RUN] === 9 && counts[ST_LATE] === 7,
      "start ≤ end حيث وُجد التاريخان":
        rows.every((r) => !r.dated || r.startMs <= r.endMs),
      "تاريخ الحساب المرجعي حاضر": Number.isFinite(calcMs),
      "المبادرات غير المؤرخة منجزة حصراً في هذا الإصدار":
        undatedRows.every((r) => r.status === ST_DONE),
      "نص المصدر حاضر": !!model.source,
      "نص قاعدة الحالة حاضر": !!model.statusRule,
    });

    return model;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) أدوات صياغة وتفاعل مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** وحدة المعدود المطابقة للرقم: nounUnit(18,"initiative") → «مبادرة» —
      تُشتق من fmt.noun ذاته فلا تفترق الوحدة عن قاعدة العدد والمعدود.
      صيغ المفرد والمثنى نص كامل بلا رقم فتعود كما هي (يتكفل بها المستدعي). */
  function nounUnit(n, key) {
    const full = fmt.noun(n, key);
    const prefix = fmt.int(n) + fmt.NBSP;
    return full.indexOf(prefix) === 0 ? full.slice(prefix.length) : full;
  }

  /** أجزاء البطولة العددية بتطابق المعدود الكامل: للأعداد التي تُكتب
      رقماً («7 مبادرات») رقم + وحدة، ولصيغتي المفرد والمثنى («مبادرتان»)
      النص الكامل بلا رقم — فلا يظهر «2 مبادرتان» المستحيل لغوياً أبداً. */
  function heroCountParts(n, key) {
    const full = fmt.noun(n, key);
    const prefix = fmt.int(n) + fmt.NBSP;
    if (full.indexOf(prefix) === 0) {
      return { num: fmt.int(n), unit: full.slice(prefix.length) };
    }
    return { num: full, unit: null };
  }

  /** جعل عنصر غير-زر قابلاً للتفعيل بالكامل: نقر + Enter + مسافة، بدور
      button ووسم data-interactive (فلا يبتلع جهاز التقديم ضغطاته — عقد §8).
      المستمعون على عناصر القسم ذاته فيسقطون مع هدم DOM (لا تسريب). */
  function activatable(el, onAct, ariaLabel) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-interactive", "");
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    el.classList.add("ini-act");
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

  /** رقاقة حالة موحدة: نقطة ملونة + نص الحالة الحرفي من المفردات —
      اللون دلالي صارم (المرجاني للتأخر حصراً) والنص بحبر الواجهة */
  function statusChip(status) {
    return h("span", { class: "ini-st " + (ST_CLS[status] || "idle") },
      h("i", { class: "ini-st-dot", "aria-hidden": "true" }),
      h("span", { class: "ini-st-txt" }, String(status)),
    );
  }

  /** موقف المبادرة الزمني — نص مشتق من تواريخ المصدر حصراً:
      متأخرة → مقدار التجاوز، جارية → المتبقي، لم تبدأ → العدّ للبداية،
      منجزة بلا تواريخ → التصريح الصادق بغياب النطاق */
  function postureOf(r) {
    if (!r.dated) {
      return { text: "بلا نطاق زمني في المصدر", cls: ST_CLS[r.status] || "idle" };
    }
    if (r.status === ST_LATE) {
      return { text: "تجاوز قدره " + dayNoun(r.overDays), cls: "late" };
    }
    if (r.status === ST_RUN) {
      return { text: "متبقٍ " + dayNoun(r.leftDays), cls: "run" };
    }
    if (r.status === ST_IDLE) {
      return { text: "تبدأ بعد " + dayNoun(r.untilDays), cls: "idle" };
    }
    return { text: "اكتملت وفق ملف الخطة", cls: "done" };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) لبنات بطاقات التفاصيل الزجاجية — قوالب كود ثابتة، النصوص عبر عقد
        dom.h النصي حصراً (لا innerHTML لمحتوى الإصدار إطلاقاً)
     ══════════════════════════════════════════════════════════════════════════ */

  /** البطولة: رقم/معرف ضخم tabular + وحدة معدودة + تسمية بنغمة دلالية */
  function heroBlock(num, unit, label, tone) {
    return h("div", { class: "ini-hero" },
      h("span", { class: "ini-hero-num" + (tone ? " " + tone : "") }, num),
      unit ? h("span", { class: "ini-hero-unit" }, unit) : null,
      h("span", { class: "ini-hero-label" }, label),
    );
  }

  /** أوسمة خيطية بنغمة دلالية — الذهبي لوسوم المصدر/الاعتماد حصراً */
  function badgesBlock(badges) {
    const clean = (badges || []).filter(Boolean);
    if (!clean.length) return null;
    return h("div", { class: "ini-badges" },
      clean.map((b) => h("span", {
        class: "ini-badge" + (b.tone ? " " + b.tone : ""),
      }, b.text)),
    );
  }

  /** شبكة صفوف «بيان ← قيمة» كثيفة بعمودين */
  function rowsGrid(pairs) {
    return h("div", { class: "ini-rows" },
      pairs.filter(Boolean).map((p) => h("div", {
        class: "ini-row" + (p.tone ? " " + p.tone : ""),
      },
        h("span", { class: "ini-row-k" }, p.k),
        p.node
          ? h("span", { class: "ini-row-v" }, p.node)
          : h("span", { class: "ini-row-v" }, p.v),
      )),
    );
  }

  /** أشرطة مقارنة على أساس معلن — امتلاء بألوان الحالات الدلالية حصراً */
  function cbarsBlock(items) {
    return h("div", { class: "ini-cbars" },
      items.filter(Boolean).map((it) => h("div", { class: "ini-cbar " + (it.cls || "") },
        h("span", { class: "ini-cbar-k" }, it.k),
        h("span", { class: "ini-cbar-track" },
          h("span", {
            class: "ini-cbar-fill",
            style: { width: Math.max(0, Math.min(100, it.pct)) + "%" },
          }),
        ),
        h("span", { class: "ini-cbar-v" }, it.v),
      )),
    );
  }

  /** ملاحظات هامشية وسطور مصادر */
  function notesBlock(lines, cls) {
    const clean = (lines || []).filter(Boolean);
    if (!clean.length) return null;
    return h("div", { class: cls || "ini-notes" },
      clean.map((t) => h("div", {
        class: cls === "ini-sources" ? "ini-src" : "ini-note",
      }, t)),
    );
  }

  /** عنوان فرعي داخل البطاقة */
  function subhead(text) {
    return h("div", { class: "ini-subhead" }, text);
  }

  /** جدول مبادرات كثيف داخل بطاقة تفاصيل: كل صف قابل للتفعيل ويفتح ملف
      مبادرته (الطبقة الجديدة تركب فوق الحالية وتُغلقان معاً بـEscape).
      compact يسقط عمود المحور (حين يكون سياق المحور معلوماً أصلاً). */
  function iniTable(ctx, model, list, opts) {
    const o = opts || {};
    const cols = [
      { label: "المعرف" },
      { label: "المبادرة" },
      o.compact ? null : { label: "المحور" },
      { label: "البداية" },
      { label: "النهاية المخططة" },
      { label: "الحالة" },
      { label: "الموقف" },
    ].filter(Boolean);

    const thead = h("thead", {}, h("tr", {},
      cols.map((c) => h("th", { scope: "col" }, c.label))));

    const tbody = h("tbody", {});
    for (const r of list) {
      const posture = postureOf(r);
      const tr = h("tr", { class: "ini-trow" },
        h("th", { scope: "row", class: "ini-td-id" }, fmt.iso(String(r.ini.id))),
        h("td", { class: "ini-td-name" }, String(r.ini.name)),
        o.compact ? null : h("td", { class: "ini-td-pillar" },
          model.pillarById[r.pillar.id].kicker),
        h("td", {}, r.ini.start ? fmt.date(r.ini.start) : "—"),
        h("td", {}, r.ini.end ? fmt.date(r.ini.end) : "—"),
        h("td", {}, statusChip(r.status)),
        h("td", { class: "ini-td-pos " + posture.cls }, posture.text),
      );
      activatable(tr, () => {
        openDetailWithFocusReturn(ctx, tr,
          initiativeDetail(ctx, model, r),
          { title: "مبادرة " + fmt.iso(String(r.ini.id)) });
      }, "مبادرة " + String(r.ini.id) + " — " + String(r.ini.name)
        + " — " + String(r.status));
      tr.setAttribute("title", String(r.ini.name) + " — " + String(r.status));
      tbody.appendChild(tr);
    }

    return h("div", { class: "ini-table" },
      h("table", { class: "table-dense" }, thead, tbody));
  }

  /** مسطرة زمنية مصغرة داخل ملف المبادرة: مسار يمثل نطاق المحفظة الكامل
      (أقدم بداية ← أبعد نهاية من تواريخ المصدر)، وشريحة المبادرة بلون
      حالتها الدلالي، وشاخص «اليوم» الذهبي عند تاريخ الحساب (الذهبي مرجع
      حصراً). RTL عبر الخصائص المنطقية: inline-start = يمين = الأقدم.
      لا تُبنى إلا لمبادرة مؤرخة وضمن نطاق محفظة صالح — لا اختلاق مواضع. */
  function miniTimeline(model, r) {
    if (!r.dated || !model.minStart || !model.maxEnd) return null;
    const lo = isoMs(model.minStart);
    const hi = isoMs(model.maxEnd);
    const span = hi - lo;
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || span <= 0) return null;

    const pct = (ms) => Math.max(0, Math.min(100, ((ms - lo) / span) * 100));
    const x0 = pct(r.startMs);
    const x1 = pct(r.endMs);
    const xc = pct(model.calcMs);

    const seg = h("span", {
      class: "ini-tl-seg " + (ST_CLS[r.status] || "idle"),
      style: {
        insetInlineStart: x0 + "%",
        width: Math.max(x1 - x0, 0.8) + "%",
      },
      title: fmt.date(r.ini.start) + " – " + fmt.date(r.ini.end),
    });
    const today = h("span", {
      class: "ini-tl-today",
      style: { insetInlineStart: xc + "%" },
      title: "اليوم — " + fmt.date(model.calc),
    });

    return h("div", {
      class: "ini-tl",
      role: "img",
      "aria-label": "موضع المبادرة على نطاق المحفظة: من "
        + fmt.date(r.ini.start) + " إلى " + fmt.date(r.ini.end)
        + "، وخط اليوم عند " + fmt.date(model.calc),
    },
      h("div", { class: "ini-tl-track" }, seg, today),
      h("div", { class: "ini-tl-scale", "aria-hidden": "true" },
        h("span", {}, fmt.date(model.minStart)),
        h("span", { class: "ini-tl-cap" }, "نطاق المحفظة"),
        h("span", {}, fmt.date(model.maxEnd)),
      ),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) ملف المبادرة الواحدة — من نقرة على شريط المخطط أو صف السجل
     ══════════════════════════════════════════════════════════════════════════ */
  function initiativeDetail(ctx, model, r) {
    const posture = postureOf(r);
    const pv = model.pillarById[r.pillar.id];
    const orderInPillar = pv.list.indexOf(r) + 1;

    const pairs = [
      { k: "المحور", v: String(r.pillar.name) },
      {
        k: "الترتيب ضمن المحور",
        v: fmt.int(orderInPillar) + " من " + fmt.int(pv.list.length),
      },
      { k: "الحالة", node: statusChip(r.status), tone: ST_TONE[r.status] },
      { k: "الموقف الزمني", v: posture.text, tone: ST_TONE[r.status] },
    ];

    if (r.dated) {
      pairs.push({ k: "البداية", v: fmt.date(r.ini.start) });
      pairs.push({ k: "النهاية المخططة", v: fmt.date(r.ini.end) });
      pairs.push({ k: "المدة المخططة", v: dayNoun(r.days) });
      if (r.status === ST_RUN && r.elapsedPct != null) {
        pairs.push({
          k: "المنقضي من المدة حتى تاريخ الحساب",
          v: fmt.pct(r.elapsedPct),
        });
      }
      if (r.status === ST_LATE) {
        pairs.push({
          k: "التجاوز حتى تاريخ الحساب",
          v: dayNoun(r.overDays),
          tone: "neg",
        });
      }
      if (r.status === ST_IDLE) {
        pairs.push({ k: "تبدأ بعد", v: dayNoun(r.untilDays) });
      }
    } else {
      pairs.push({ k: "التواريخ", v: "غير مدرجة في المصدر" });
    }
    pairs.push({ k: "تاريخ الحساب المرجعي", v: fmt.date(model.calc) });

    const notes = [];
    if (r.status === ST_LATE) {
      notes.push("متأخرة حكماً: تجاوزت نهايتها المخططة دون تسجيل إنجاز — "
        + "وفق قاعدة الحالة المعتمدة في خطة العمل.");
    }
    if (r.status === ST_RUN) {
      notes.push("المنقضي من المدة ترميز زمني مشتق من تواريخ الخطة — "
        + "لا نسب إنجاز في المصدر فلا تُخترع.");
    }
    if (!r.dated) {
      notes.push("لا نطاق زمني لهذه المبادرة في ملف الخطة — تُعرض حالتها "
        + "المسجلة دون اختلاق تواريخ.");
    }

    return h("div", { class: "ini-detail" },
      heroBlock(fmt.iso(String(r.ini.id)), null, String(r.ini.name),
        ST_TONE[r.status] === "neu" ? null : ST_TONE[r.status]),
      badgesBlock([
        { text: SOURCE_BADGE, tone: "gold" },
        { text: pv.kicker + " — " + String(r.pillar.kind), tone: "neu" },
      ]),
      miniTimeline(model, r),
      rowsGrid(pairs),
      notesBlock(notes),
      notesBlock(["المصدر: " + model.source], "ini-sources"),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) ملف المحور الواحد — من نقرة على بطاقة ركيزة أو من ملفات أخرى
     ══════════════════════════════════════════════════════════════════════════ */
  function pillarDetail(ctx, model, pillarId) {
    const pv = model.pillarById[pillarId];
    if (!pv) return null;

    /* أشرطة توزيع الحالات على أساس معلن: كامل مبادرات المحور = 100٪ */
    const bars = [];
    for (const v of model.vocab) {
      if (!pv.counts[v]) continue;
      bars.push({
        cls: ST_CLS[v] || "idle",
        k: v,
        pct: (pv.counts[v] / pv.list.length) * 100,
        v: fmt.noun(pv.counts[v], "initiative"),
      });
    }

    const pairs = [
      { k: "نوع المحور", v: String(pv.p.kind) },
      {
        k: "حصته من المحفظة",
        v: fmt.pct(pctOf(pv.list.length, model.rows.length)),
      },
    ];
    if (pv.minStart && pv.maxEnd) {
      pairs.push({ k: "النطاق المخطط", v: fmt.date(pv.minStart) + " – " + fmt.date(pv.maxEnd) });
    }
    if (pv.undated > 0) {
      pairs.push({
        k: "بلا نطاق زمني في المصدر",
        v: fmt.noun(pv.undated, "initiative"),
      });
    }
    if (pv.counts[ST_LATE] > 0) {
      pairs.push({
        k: "متأخرة حكماً ضمن المحور",
        v: fmt.noun(pv.counts[ST_LATE], "initiative"),
        tone: "neg",
      });
    }

    const hero = heroCountParts(pv.list.length, "initiative");
    return h("div", { class: "ini-detail" },
      heroBlock(hero.num, hero.unit, String(pv.p.name)),
      badgesBlock([
        { text: SOURCE_BADGE, tone: "gold" },
        { text: String(pv.p.kind), tone: "neu" },
      ]),
      cbarsBlock(bars),
      rowsGrid(pairs),
      subhead("مبادرات المحور بحالاتها"),
      iniTable(ctx, model, pv.list, { compact: true }),
      notesBlock([model.statusRule]),
      notesBlock(["المصدر: " + model.source], "ini-sources"),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) قائمة الحالة الواحدة — من نقرة donut/رقاقة/مؤشر الشريط
     ══════════════════════════════════════════════════════════════════════════ */
  function statusDetail(ctx, model, status) {
    const list = model.rows.filter((r) => r.status === status);
    const pairs = [
      {
        k: "الحصة من المحفظة",
        v: fmt.pct(pctOf(list.length, model.rows.length)),
        tone: ST_TONE[status],
      },
    ];

    /* سياق مشتق من تواريخ المصدر لكل حالة — لا استنتاج حر */
    if (status === ST_LATE && model.maxOverRow) {
      pairs.push({
        k: "أقصى تجاوز — مبادرة " + fmt.iso(String(model.maxOverRow.ini.id)),
        v: dayNoun(model.maxOver),
        tone: "neg",
      });
    }
    if (status === ST_RUN && model.runMaxEnd) {
      pairs.push({ k: "أبعد نهاية مخططة", v: fmt.date(model.runMaxEnd) });
      if (model.longestRun) {
        pairs.push({
          k: "أطولها مدة — مبادرة " + fmt.iso(String(model.longestRun.ini.id)),
          v: dayNoun(model.longestRun.days),
        });
      }
    }
    /* الغياب الصادق للتواريخ يُعلن حيث وُجد فعلاً — لا افتراض بالحالة */
    const undatedIn = list.filter((r) => !r.dated).length;
    if (undatedIn > 0) {
      pairs.push({
        k: "بلا نطاق زمني في المصدر",
        v: fmt.noun(undatedIn, "initiative"),
      });
    }

    /* توزيع الحالة على المحاور الأربعة — أعمدة صادقة على أساس القائمة */
    const perPillar = model.pillars
      .filter((pv) => pv.counts[status] > 0)
      .map((pv) => ({
        cls: ST_CLS[status] || "idle",
        k: pv.kicker,
        pct: (pv.counts[status] / list.length) * 100,
        v: fmt.noun(pv.counts[status], "initiative"),
      }));

    const notes = [];
    if (status === ST_LATE) notes.push(model.statusRule);

    const hero = heroCountParts(list.length, "initiative");
    return h("div", { class: "ini-detail" },
      heroBlock(hero.num, hero.unit,
        "حالة «" + String(status) + "» في محفظة المبادرات",
        ST_TONE[status] === "neu" ? null : ST_TONE[status]),
      badgesBlock([{ text: SOURCE_BADGE, tone: "gold" }]),
      rowsGrid(pairs),
      perPillar.length > 1 ? subhead("التوزيع على المحاور") : null,
      perPillar.length > 1 ? cbarsBlock(perPillar) : null,
      subhead("قائمة المبادرات"),
      iniTable(ctx, model, list, {}),
      notesBlock(notes),
      notesBlock(["المصدر: " + model.source], "ini-sources"),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) ملف المحفظة الكاملة — من مؤشر «محفظة المبادرات» في الشريط
     ══════════════════════════════════════════════════════════════════════════ */
  function portfolioDetail(ctx, model) {
    const pairs = [];
    for (const v of model.vocab) {
      if (!model.counts[v]) continue;
      pairs.push({
        k: v,
        v: fmt.noun(model.counts[v], "initiative"),
        tone: ST_TONE[v],
      });
    }
    if (model.minStart && model.maxEnd) {
      pairs.push({
        k: "النطاق الزمني المخطط للمحفظة",
        v: fmt.date(model.minStart) + " – " + fmt.date(model.maxEnd),
      });
    }
    if (model.undatedRows.length > 0) {
      pairs.push({
        k: "بلا نطاق زمني في المصدر",
        v: fmt.noun(model.undatedRows.length, "initiative"),
      });
    }
    pairs.push({ k: "تاريخ الحساب المرجعي", v: fmt.date(model.calc) });

    return h("div", { class: "ini-detail" },
      heroBlock(fmt.int(model.rows.length),
        nounUnit(model.rows.length, "initiative"),
        "محفظة مبادرات منظومة السكن الجماعي"),
      badgesBlock([
        { text: SOURCE_BADGE, tone: "gold" },
        { text: axisNoun(model.pillars.length) + " — "
          + fmt.noun(model.kinds.pillar, "pillar") + " و"
          + fmt.countNoun(model.kinds.enabler, LOCAL_NOUNS.enabler), tone: "neu" },
      ]),
      rowsGrid(pairs),
      subhead("المحفظة كاملة"),
      iniTable(ctx, model, model.rows, {}),
      notesBlock([model.statusRule]),
      notesBlock(["المصدر: " + model.source], "ini-sources"),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) ملف المحاور الأربعة — من مؤشر «المحاور الاستراتيجية» في الشريط
     ══════════════════════════════════════════════════════════════════════════ */
  function axesDetail(ctx, model) {
    const bars = model.pillars.map((pv) => ({
      cls: "axis",
      k: pv.kicker,
      pct: (pv.list.length / model.rows.length) * 100,
      v: fmt.noun(pv.list.length, "initiative"),
    }));

    const pairs = model.pillars.map((pv) => ({
      k: String(pv.p.name),
      v: fmt.noun(pv.list.length, "initiative"),
    }));

    return h("div", { class: "ini-detail" },
      heroBlock(fmt.int(model.pillars.length), axisUnit(model),
        "المحاور الاستراتيجية للخطة"),
      badgesBlock([
        { text: SOURCE_BADGE, tone: "gold" },
        { text: fmt.noun(model.kinds.pillar, "pillar") + " و"
          + fmt.countNoun(model.kinds.enabler, LOCAL_NOUNS.enabler), tone: "neu" },
      ]),
      cbarsBlock(bars),
      rowsGrid(pairs),
      notesBlock([
        "حصص الأشرطة من إجمالي " + fmt.noun(model.rows.length, "initiative")
          + " — أساس المقارنة كامل المحفظة.",
      ]),
      notesBlock(["المصدر: " + model.source], "ini-sources"),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) شريط المؤشرات الكبرى — خمسة أرقام بطولية بعقد layout.kpiStrip:
         عدّ تصاعدي عند أول دخول، ونقر يفتح بطاقة التفاصيل المطابقة.
         قاعدة العدد والمعدود: الوحدة تُشتق من fmt.noun حيث تصح لغوياً
         («18 مبادرة»، «4 محاور»)، وتُحمل التسمية جمعَ المعدود حيث لا
         يصح إلحاق المفرد بالرقم («مبادرات منجزة: 2»).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildKpiStrip(el, ctx, model) {
    const doneIds = model.doneRows.map((r) => fmt.iso(String(r.ini.id)));

    const defs = [
      {
        item: {
          label: "محفظة المبادرات",
          value: fmt.int(model.rows.length),
          unit: nounUnit(model.rows.length, "initiative"),
          delta: {
            text: "على " + axisNoun(model.pillars.length) + " استراتيجية",
            tone: "neu",
          },
          note: SOURCE_BADGE,
          countTo: model.rows.length, fmt: (v) => fmt.int(v),
          key: "ini:kpi:portfolio",
        },
        aria: "محفظة المبادرات — القائمة الكاملة والمصدر",
        detail: () => portfolioDetail(ctx, model),
        title: "محفظة المبادرات",
      },
      {
        item: {
          label: "المحاور الاستراتيجية",
          value: fmt.int(model.pillars.length),
          unit: axisUnit(model),
          delta: {
            text: fmt.noun(model.kinds.pillar, "pillar") + " و"
              + fmt.countNoun(model.kinds.enabler, LOCAL_NOUNS.enabler),
            tone: "neu",
          },
          note: model.minStart && model.maxEnd
            ? "النطاق: " + fmt.date(model.minStart) + " – " + fmt.date(model.maxEnd)
            : null,
          countTo: model.pillars.length, fmt: (v) => fmt.int(v),
          key: "ini:kpi:axes",
        },
        aria: "المحاور الاستراتيجية الأربعة — التركيبة والتوزيع",
        detail: () => axesDetail(ctx, model),
        title: "المحاور الاستراتيجية",
      },
      {
        item: {
          label: "مبادرات منجزة",
          value: fmt.int(model.counts[ST_DONE]),
          tone: "pos",
          delta: {
            /* علامة RLM بعد الواو تمنع التصاق الواو بصرياً بالرقم اللاتيني
               المعزول (إصلاح المراجعة: كانت «و» تندمج مع «3.1») */
            text: doneIds.length === 2
              ? "المبادرتان " + doneIds[0] + " و‏" + doneIds[1]
              : doneIds.join("، "),
            tone: "pos",
          },
          /* الملاحظة مشروطة بواقع البيانات: تظهر فقط إذا كانت المنجزات كلها
             بلا تواريخ في المصدر — لا نص غير مشروط قد يكذب مع إصدار مقبل */
          note: model.doneRows.length
            && model.doneRows.every((r) => !r.ini.start && !r.ini.end)
            ? "بلا نطاق زمني في المصدر" : null,
          countTo: model.counts[ST_DONE], fmt: (v) => fmt.int(v),
          key: "ini:kpi:done",
        },
        aria: "المبادرات المنجزة — القائمة والتفاصيل",
        detail: () => statusDetail(ctx, model, ST_DONE),
        title: "المبادرات — " + ST_DONE,
      },
      {
        item: {
          label: "جاري العمل عليها",
          value: fmt.int(model.counts[ST_RUN]),
          delta: {
            text: model.runMaxEnd
              ? "تمتد حتى " + fmt.date(model.runMaxEnd)
              : "ضمن نطاقاتها المخططة",
            tone: "neu",
          },
          note: model.longestRun
            ? "أطولها مدة: " + dayNoun(model.longestRun.days)
            : null,
          countTo: model.counts[ST_RUN], fmt: (v) => fmt.int(v),
          key: "ini:kpi:running",
        },
        aria: "المبادرات التي يجري العمل عليها — القائمة والتفاصيل",
        detail: () => statusDetail(ctx, model, ST_RUN),
        title: "المبادرات — " + ST_RUN,
      },
      {
        item: {
          label: "متأخرة حكماً",
          value: fmt.int(model.counts[ST_LATE]),
          tone: "neg",
          delta: { text: "تجاوزت نهايتها دون تسجيل إنجاز", tone: "neg" },
          note: model.maxOverRow
            ? "أقصى تجاوز: " + dayNoun(model.maxOver)
            : null,
          countTo: model.counts[ST_LATE], fmt: (v) => fmt.int(v),
          key: "ini:kpi:late",
        },
        aria: "المبادرات المتأخرة حكماً — القائمة وقاعدة الحالة",
        detail: () => statusDetail(ctx, model, ST_LATE),
        title: "المبادرات — " + ST_LATE + " حكماً",
      },
    ];

    guard("kpiStrip", {
      "خمسة مؤشرات (عقد 4-6)": defs.length >= 4 && defs.length <= 6,
      "وحدة المحفظة معدود مطابق":
        nounUnit(model.rows.length, "initiative") === "مبادرة",
      "الأرقام الثلاثة تُجمع إلى المحفظة":
        model.counts[ST_DONE] + model.counts[ST_RUN] + model.counts[ST_LATE]
          + model.counts[ST_IDLE] === model.rows.length,
    });

    const strip = RH.presenter.layout.kpiStrip(el, defs.map((d) => d.item));

    /* كل بطاقة رقم قابلة للتفعيل الكامل — التركيز يعود إليها عند الإغلاق */
    Array.from(strip.children).forEach((kpiEl, i) => {
      const d = defs[i];
      kpiEl.setAttribute("title", d.title);
      activatable(kpiEl, () => {
        openDetailWithFocusReturn(ctx, kpiEl, d.detail(), { title: d.title });
      }, d.aria);
    });

    return strip;
  }

  /** وحدة المحاور المتطابقة عدداً — تُشتق من countNoun المحلي ذاته */
  function axisUnit(model) {
    const full = axisNoun(model.pillars.length);
    const prefix = fmt.int(model.pillars.length) + fmt.NBSP;
    return full.indexOf(prefix) === 0 ? full.slice(prefix.length) : full;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) نطاق الركائز الأربع — بطاقات pillarCards القانونية بصف كامل العرض:
         عدّادات متحركة وأشرطة توزيع من المكتبة، والنقر يفتح ملف المحور
     ══════════════════════════════════════════════════════════════════════════ */
  function buildPillarBand(cell, ctx, model) {
    const band = RH.viz.charts2.pillarCards(cell, ctx.su, {
      key: "initiatives",
      cols: 4,
      onSelect: (p) => {
        /* المستدعي: البطاقة المركزة إن كانت داخل النطاق (نقر أو Enter) */
        const inv = document.activeElement
          && band.contains(document.activeElement)
          ? document.activeElement : band;
        openDetailWithFocusReturn(ctx, inv,
          pillarDetail(ctx, model, p.id), { title: String(p.name) });
      },
    });
    return band;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) سجل المحفظة — العرض الجدولي الكثيف البديل للمخطط الزمني:
         رقاقات ترشيح بالحالة (الكل + الحالات ذات الرصيد بترتيب المفردات)،
         وجدول 18 صفاً كل صف يفتح ملف مبادرته. يُبنى كسولاً عند أول تبديل.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildScheduleView(host, ctx, model, initialFilter) {
    let filter = initialFilter || null; // null = كل الحالات
    let sortMode = "portfolio";         // portfolio | end | status

    /* أوضاع الفرز الثلاثة — كلها حتمية بقواعد كسر تعادل معلنة:
       المحفظة: ترتيب المصدر (المحور فالمعرف — الترتيب القانوني)؛
       النهاية: الأقرب نهايةً أولاً والمبادرات غير المؤرخة آخراً بترتيبها؛
       الحالة: ترتيب مفردات الإصدار ثم ترتيب المحفظة داخل الحالة. */
    const SORTS = [
      { id: "portfolio", label: "ترتيب المحفظة" },
      { id: "end", label: "النهاية المخططة" },
      { id: "status", label: "الحالة" },
    ];
    function sortedRows() {
      const base = filter
        ? model.rows.filter((r) => r.status === filter)
        : model.rows.slice();
      if (sortMode === "end") {
        return base.slice().sort((a, b) => {
          const ae = Number.isFinite(a.endMs) ? a.endMs : Infinity;
          const be = Number.isFinite(b.endMs) ? b.endMs : Infinity;
          if (ae !== be) return ae - be;
          return model.rows.indexOf(a) - model.rows.indexOf(b);
        });
      }
      if (sortMode === "status") {
        return base.slice().sort((a, b) => {
          const d = model.vocab.indexOf(a.status) - model.vocab.indexOf(b.status);
          if (d !== 0) return d;
          return model.rows.indexOf(a) - model.rows.indexOf(b);
        });
      }
      return base;
    }

    const wrap = h("div", { class: "ini-sched" });

    /* رقاقات الترشيح: أزرار حقيقية بضغطة معلنة aria-pressed */
    const chips = h("div", {
      class: "ini-filter",
      role: "group",
      "aria-label": "ترشيح سجل المحفظة بالحالة",
    });
    const chipDefs = [{ status: null, label: "الكل", count: model.rows.length }]
      .concat(model.vocab
        .filter((v) => model.counts[v] > 0)
        .map((v) => ({ status: v, label: v, count: model.counts[v] })));
    const chipEls = [];

    function renderChips() {
      for (const c of chipEls) {
        c.el.setAttribute("aria-pressed",
          c.def.status === filter ? "true" : "false");
        c.el.classList.toggle("active", c.def.status === filter);
      }
    }

    for (const def of chipDefs) {
      const chip = h("button", {
        class: "ini-fchip" + (def.status ? " " + (ST_CLS[def.status] || "idle") : ""),
        type: "button",
        "data-interactive": "",
        "aria-label": def.status
          ? "عرض " + fmt.noun(def.count, "initiative") + " بحالة «" + def.label + "»"
          : "عرض المحفظة كاملة — " + fmt.noun(def.count, "initiative"),
        onclick: () => {
          filter = def.status;
          renderChips();
          renderBody();
        },
      },
        def.status ? h("i", { class: "ini-st-dot", "aria-hidden": "true" }) : null,
        h("span", { class: "ini-fchip-label" }, def.label),
        h("span", { class: "ini-fchip-count" }, fmt.int(def.count)),
      );
      chipEls.push({ def, el: chip });
      chips.appendChild(chip);
    }
    wrap.appendChild(chips);

    /* مبدّل الفرز: مجموعة أزرار حقيقية بضغطة معلنة — كروم واجهة لا لون
       بيانات (النص بحبر الواجهة دائماً) */
    const sortBtns = {};
    const sortBar = h("div", {
      class: "ini-sortbar",
      role: "group",
      "aria-label": "فرز سجل المحفظة",
    },
      h("span", { class: "ini-sortbar-label" }, "فرز:"),
      SORTS.map((s) => {
        const b = h("button", {
          class: "ini-tbtn ini-sbtn",
          type: "button",
          "data-interactive": "",
          "aria-pressed": s.id === sortMode ? "true" : "false",
          onclick: () => {
            if (sortMode === s.id) return;
            sortMode = s.id;
            for (const k of Object.keys(sortBtns)) {
              sortBtns[k].setAttribute("aria-pressed",
                k === sortMode ? "true" : "false");
              sortBtns[k].classList.toggle("active", k === sortMode);
            }
            renderBody();
          },
        }, s.label);
        if (s.id === sortMode) b.classList.add("active");
        sortBtns[s.id] = b;
        return b;
      }),
    );
    chips.appendChild(sortBar);

    /* الجدول: ترويسة ثابتة وجسم يُعاد بناؤه عند الترشيح */
    const cols = [
      { label: "المعرف" },
      { label: "المبادرة" },
      { label: "المحور" },
      { label: "البداية" },
      { label: "النهاية المخططة" },
      { label: "المدة" },
      { label: "الحالة" },
      { label: "الموقف الزمني" },
    ];
    const thead = h("thead", {}, h("tr", {},
      cols.map((c) => h("th", { scope: "col" }, c.label))));
    const tbody = h("tbody", {});
    const scroll = h("div", { class: "ini-sched-scroll" },
      h("table", { class: "table-dense" }, thead, tbody));
    wrap.appendChild(scroll);

    /* سطر خلاصة الترشيح الحي — يعلن نتيجة الترشيح لقارئات الشاشة أيضاً */
    const foot = h("div", { class: "ini-sched-foot", "aria-live": "polite" });
    wrap.appendChild(foot);

    function renderBody() {
      while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
      const list = sortedRows();

      for (const r of list) {
        const posture = postureOf(r);
        const tr = h("tr", { class: "ini-trow" },
          h("th", { scope: "row", class: "ini-td-id" }, fmt.iso(String(r.ini.id))),
          h("td", { class: "ini-td-name" }, String(r.ini.name)),
          h("td", { class: "ini-td-pillar" }, model.pillarById[r.pillar.id].kicker),
          h("td", {}, r.ini.start ? fmt.date(r.ini.start) : "—"),
          h("td", {}, r.ini.end ? fmt.date(r.ini.end) : "—"),
          h("td", {}, r.days != null ? dayNoun(r.days) : "—"),
          h("td", {}, statusChip(r.status)),
          h("td", { class: "ini-td-pos " + posture.cls }, posture.text),
        );
        activatable(tr, () => {
          openDetailWithFocusReturn(ctx, tr,
            initiativeDetail(ctx, model, r),
            { title: "مبادرة " + fmt.iso(String(r.ini.id)) });
        }, "مبادرة " + String(r.ini.id) + " — " + String(r.ini.name)
          + " — " + String(r.status) + " — فتح الملف");
        tr.setAttribute("title", String(r.ini.name) + " — " + String(r.status));
        tbody.appendChild(tr);
      }

      while (foot.firstChild) foot.removeChild(foot.firstChild);
      foot.appendChild(document.createTextNode(
        filter
          ? fmt.noun(list.length, "initiative") + " بحالة «" + filter + "» من "
            + fmt.noun(model.rows.length, "initiative")
          : "المحفظة كاملة — " + fmt.noun(list.length, "initiative")
            + " على " + axisNoun(model.pillars.length)));
    }

    renderChips();
    renderBody();
    host.appendChild(wrap);
    return wrap;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     13) خلية المخطط الزمني — Gantt كامل الشاشة تقريباً بمفتاح عرض مزدوج
     ──────────────────────────────────────────────────────────────────────────
     مضيفان متراكبان (بناء كسول للسجل): التبديل إظهار/إخفاء + resize —
     لا إعادة استدعاء للمُنشئ على المضيف نفسه فلا تتضاعف مستمعات keyNav،
     والمثيل واحد في سجل الثيم (c2:initiativeGantt:initiatives).
     نقر أي شريط/وسم في المخطط يفتح ملف المبادرة الكامل.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildGanttCell(cell, ctx, model) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "المخطط الزمني لمحفظة المبادرات",
      sub: "خط اليوم الذهبي عند تاريخ الحساب — " + fmt.date(model.calc),
      cls: "ini-gantt-card",
    });

    /* المضيفان — dashboard.css يمدد أبناء .chart-host المباشرين؛
       [hidden] يخفي دون مساس بالتموضع */
    const hostChart = h("div", { class: "ini-view-host" });
    const hostSched = h("div", { class: "ini-view-host ini-sched-host", hidden: true });
    res.body.appendChild(hostChart);
    res.body.appendChild(hostSched);

    /* المخطط: المُنشئ القانوني حصراً بخياراته الموثقة { key } */
    const gantt = RH.viz.charts2.initiativeGantt(hostChart, ctx.su, {
      key: "initiatives",
    });

    /* نقر شريط المبادرة → ملفها الكامل: dataIndex يطابق ترتيب صفوفنا
       (مرآة ترتيب المكتبة نفسها: المحور فالمعرف عددياً) */
    wireChartClick(ctx, gantt, (p) => {
      if (!p || p.componentType !== "series") return;
      if (p.seriesType !== "custom") return;
      if (!Number.isInteger(p.dataIndex)) return;
      const r = model.rows[p.dataIndex];
      if (!r) return;
      openDetailWithFocusReturn(ctx, hostChart,
        initiativeDetail(ctx, model, r),
        { title: "مبادرة " + fmt.iso(String(r.ini.id)) });
    });

    let view = "chart";
    let schedBuilt = false;

    /* مفتاح العرض في ترويسة البطاقة — أزرار حقيقية aria-pressed */
    const VIEWS = [
      { id: "chart", label: "المخطط الزمني" },
      { id: "table", label: "سجل المحفظة" },
    ];
    const head = res.card.querySelector(".card-head");
    const btns = {};
    const bar = h("div", {
      class: "ini-toolbar",
      role: "group",
      "aria-label": "طريقة عرض المحفظة",
    });
    for (const v of VIEWS) {
      const b = h("button", {
        class: "ini-tbtn",
        type: "button",
        "data-interactive": "",
        "aria-pressed": v.id === view ? "true" : "false",
        onclick: () => setView(v.id),
      }, v.label);
      btns[v.id] = b;
      bar.appendChild(b);
    }
    if (head) head.appendChild(bar);

    function setView(id) {
      if (id === view) return;
      view = id;
      for (const v of VIEWS) {
        btns[v.id].setAttribute("aria-pressed", v.id === view ? "true" : "false");
        btns[v.id].classList.toggle("active", v.id === view);
      }
      if (view === "table") {
        if (!schedBuilt) {
          schedBuilt = true;
          buildScheduleView(hostSched, ctx, model, null);
        }
        hostChart.hidden = true;
        hostSched.hidden = false;
      } else {
        hostSched.hidden = true;
        hostChart.hidden = false;
        /* المضيف عاد للظهور — أنعش مقاس المثيل الحي */
        if (!gantt.isDisposed()) gantt.resize();
      }
    }
    btns.chart.classList.add("active");

    /* ذيل قراءة موجز: أرقام محسوبة من النموذج لا نص مكتوب */
    res.card.appendChild(h("div", { class: "ini-cardfoot" },
      "قاعدة «متأخرة حكماً»: ",
      h("b", {}, fmt.int(model.counts[ST_LATE])),
      " مبادرات تجاوزت خط اليوم دون تسجيل إنجاز · ",
      h("b", {}, fmt.int(model.counts[ST_RUN])),
      " ضمن نطاقها المخطط · المنجزتان بلا نطاق زمني في المصدر",
    ));

    return { setView };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     14) العمود الجانبي — donut الحالات الكامل + رقاقات الحالات + عمود
         الرؤى المحوكم + بطاقة المصدر الحرفية + سطر الحداثة
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSideCell(cell, ctx, model) {
    /* 14.1) donut الحالات: النسخة الكاملة (المصغرة في الملخص التنفيذي) */
    const res = RH.presenter.layout.chartCard(cell, {
      title: "حالات المحفظة",
      sub: fmt.noun(model.rows.length, "initiative"),
      cls: "ini-donut-card",
    });
    const donut = RH.viz.charts2.statusDonut(res.body, ctx.su, {
      key: "initiatives",
    });
    wireChartClick(ctx, donut, (p) => {
      if (!p || p.componentType !== "series" || !p.name) return;
      if (model.counts[p.name] == null) return;
      openDetailWithFocusReturn(ctx, res.card,
        statusDetail(ctx, model, p.name),
        { title: "المبادرات — " + String(p.name) });
    });

    /* رقاقات الحالات ذات الرصيد أسفل الحلقة — كل رقاقة تفتح قائمتها
       (ترتيب مفردات الإصدار، لا ترتيب مخترعاً) */
    const chips = h("div", {
      class: "ini-chips",
      role: "group",
      "aria-label": "حالات المبادرات — انقر حالة لعرض قائمتها",
    });
    for (const v of model.vocab) {
      const count = model.counts[v] || 0;
      if (!count) continue;
      const chip = h("button", {
        class: "ini-chip " + (ST_CLS[v] || "idle"),
        type: "button",
        "data-interactive": "",
        title: fmt.noun(count, "initiative") + " — " + v,
        "aria-label": fmt.noun(count, "initiative") + " بحالة «" + v + "» — عرض القائمة",
        onclick: () => {
          openDetailWithFocusReturn(ctx, chip,
            statusDetail(ctx, model, v),
            { title: "المبادرات — " + v });
        },
      },
        h("i", { class: "ini-st-dot", "aria-hidden": "true" }),
        h("span", { class: "ini-chip-count" }, fmt.int(count)),
        h("span", { class: "ini-chip-label" }, v),
      );
      chips.appendChild(chip);
    }
    res.card.appendChild(chips);

    /* 14.2) عمود الرؤى المحوكم (المفتاح القانوني "initiatives") — غيابه
       الصادق بطاقة مدمجة لا اختلاق (عقد insightRail: null بصمت) */
    /* compact: العمود الجانبي ضيق — العناوين وحدها تُعرض والنص الكامل في
       الملحق/الملخص؛ دون ذلك تُبتر البطاقات بتمرير شريحة غير مقروءة */
    const rail = RH.presenter.layout.insightRail(cell, "initiatives", { compact: true });
    if (!rail) {
      RH.presenter.layout.pendingCard(cell, {
        label: "رؤى القسم قيد الاعتماد",
        note: "لوحة الرؤى تُدار من الإدارة وتخضع لبوابة مجمع الحقائق",
      });
    }

    /* 14.3) بطاقة المصدر: الوسم القصير + النص الحرفي الكامل من الإصدار */
    cell.appendChild(h("div", { class: "ini-source" },
      h("div", { class: "ini-source-head" },
        h("span", { class: "ini-source-badge", title: model.source }, SOURCE_BADGE),
        h("span", { class: "ini-source-label" }, "مصدر طبقة الاستراتيجية"),
      ),
      h("div", { class: "ini-source-text" }, model.source),
    ));

    /* 14.4) سطر الحداثة والاحتساب */
    cell.appendChild(h("div", { class: "ini-meta" },
      "الحالة محسوبة حتى ", h("b", {}, fmt.date(model.calc)),
      " · بيانات حتى ", h("b", {}, String(model.asOf)),
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     15) الملخص الناطق — فقرة مخفية بصرياً تلخص اللوحة لقارئات الشاشة
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, ctx, model) {
    const late = model.counts[ST_LATE];
    const run = model.counts[ST_RUN];
    const done = model.counts[ST_DONE];
    el.appendChild(h("p", { class: "ini-sr" },
      "لوحة المبادرات والركائز: " + fmt.noun(model.rows.length, "initiative")
      + " موزعة على " + axisNoun(model.pillars.length) + " ("
      + fmt.noun(model.kinds.pillar, "pillar") + " و"
      + fmt.countNoun(model.kinds.enabler, LOCAL_NOUNS.enabler) + ") وفق "
      + SOURCE_BADGE + ". "
      + "الحالة حتى " + fmt.date(model.calc) + ": "
      /* تطابق العدد والمعدود مع الصفة (قاعدة format.js الملزمة) — لا عدد
         مجرداً مثل «2 منجزة» (إصلاح المراجعة) */
      + fmt.countNoun(done, {
        zero: "لا مبادرات منجزة", one: "مبادرة منجزة واحدة",
        two: "مبادرتان منجزتان", few: "مبادرات منجزة",
        many: "مبادرة منجزة", hundred: "مبادرة منجزة",
      })
      + "، و" + fmt.noun(run, "initiative") + " جاري العمل عليها، و"
      + fmt.countNoun(late, {
        zero: "لا مبادرات متأخرة", one: "مبادرة متأخرة واحدة",
        two: "مبادرتان متأخرتان", few: "مبادرات متأخرة",
        many: "مبادرة متأخرة", hundred: "مبادرة متأخرة",
      }) + " حكماً بعد تجاوز نهايتها المخططة دون تسجيل إنجاز. "
      + (model.minStart && model.maxEnd
        ? "النطاق الزمني المخطط للمحفظة من " + fmt.date(model.minStart)
          + " إلى " + fmt.date(model.maxEnd) + ". "
        : "")
      + "المخطط الزمني يعرض الثماني عشرة مبادرة على خط اليوم، وسجل المحفظة "
      + "جدول كامل قابل للترشيح بالحالة، ولكل رسم جدول بيانات مكافئ.",
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     16) الوصول العميق — معاملات المسار تُلبى بعد اكتمال البناء
     ══════════════════════════════════════════════════════════════════════════ */
  function honourDeepLink(ctx, model, views) {
    const p = ctx.params;

    /* ?view=table → البدء بسجل المحفظة (قبل أي بطاقة تفاصيل) */
    if (p.view === "table" && views && typeof views.setView === "function") {
      views.setView("table");
    }

    /* ?pillar=p1 → ملف المحور */
    if (p.pillar && model.pillarById[p.pillar]) {
      ctx.openDetail(pillarDetail(ctx, model, p.pillar),
        { title: String(model.pillarById[p.pillar].p.name) });
      return;
    }

    /* ?initiative=1.4 → ملف المبادرة */
    if (p.initiative && model.rowById[p.initiative]) {
      const r = model.rowById[p.initiative];
      ctx.openDetail(initiativeDetail(ctx, model, r),
        { title: "مبادرة " + fmt.iso(String(r.ini.id)) });
      return;
    }

    /* ?status=late → قائمة الحالة (مفاتيح لاتينية معلنة) — حالة صفرية
       الرصيد تُتجاهل بصمت كأي معامل غير صالح */
    if (p.status && STATUS_PARAM[p.status]
        && model.counts[STATUS_PARAM[p.status]] > 0) {
      ctx.openDetail(statusDetail(ctx, model, STATUS_PARAM[p.status]),
        { title: "المبادرات — " + STATUS_PARAM[p.status] });
    }
    /* معامل غير صالح: تجاهل صامت — لا شاشات خطأ في مسرح العرض */
  }

  /* ══════════════════════════════════════════════════════════════════════════
     17) بناء القسم — الترويسة ثم الشريط ثم الشبكة:
         صف 1: نطاق الركائز الأربع (12)
         صف 2: المخطط الزمني (9) + العمود الجانبي (3)
         الترتيب البصري RTL: الخلية الأولى أقصى اليمين.
     ══════════════════════════════════════════════════════════════════════════ */
  function build(el, ctx) {
    const rel = ctx.release;
    const model = initiativesModel(rel);

    /* متطابقات مستوى اللوحة (المتطابقات التفصيلية داخل النموذج) */
    guard("build", {
      "المفتاح القانوني للرؤى موجود أو يغيب بصدق":
        !rel.insight_panels || !!rel.insight_panels.sections,
      "حالة طبقة الاستراتيجية معلنة": !!model.st.status,
      "مكتبة الرسوم القانونية حاضرة":
        !!(RH.viz.charts2 && RH.viz.charts2.initiativeGantt
          && RH.viz.charts2.statusDonut && RH.viz.charts2.pillarCards),
    });

    /* الترويسة: سياق ذهبي + عنوان + وسم المصدر + سطر الاحتساب */
    RH.presenter.layout.sectionHeader(el, {
      kicker: "التحرك الاستراتيجي",
      title: "المبادرات والركائز",
      badge: SOURCE_BADGE,
      meta: "الحالة محسوبة حتى " + fmt.date(model.calc),
    });

    /* شريط المؤشرات الخمسة القابلة للنقر */
    buildKpiStrip(el, ctx, model);

    /* الشبكة: 12 عموداً وقالب الصفوف في initiatives.css */
    const g = RH.presenter.layout.grid(el, { cols: 12, cls: "ini-grid" });

    const cPillars = g.cell({ span: 12, cls: "ini-cell-pillars" });
    const cGantt = g.cell({ span: 9, cls: "ini-cell-gantt" });
    const cSide = g.cell({ span: 3, cls: "ini-cell-side" });

    buildPillarBand(cPillars, ctx, model);
    const views = buildGanttCell(cGantt, ctx, model);
    buildSideCell(cSide, ctx, model);

    /* الملخص الناطق ثم تلبية معاملات الوصول العميق إن وُجدت */
    buildSrSummary(el, ctx, model);
    honourDeepLink(ctx, model, views);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     18) تسجيل القسم — عقد RH.sections.register (order:6، backdrop:
         "initiatives"، major: يفتتح الفصل الاستراتيجي بانتقال مقطعي كبير،
         حالة واحدة بلا خطوات بناء: مركز القيادة يُقرأ دفعة واحدة).
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "initiatives",
    order: 6,
    title: "المبادرات والركائز",
    kicker: "التحرك الاستراتيجي",
    backdrop: "initiatives",
    dim: 0.84,
    steps: 0,
    major: true,
    build,
  });

  /* منفذ اختبار داخلي (ليس من عقد القسم): يكشف بُناة النموذج والبطاقات
     للاختبارات الآلية كي تتحقق من مطابقة مرآة قاعدة الحالة (2/9/7)
     وأرقام البطاقات لمرايا الإصدار دون بناء DOM المسرح كاملاً.
     البادئة السفلية تعلن أنه غير معد للاستهلاك من بقية الأقسام. */
  RH.sections._initiativesInternals = {
    initiativesModel,
    statusOf,
    postureOf,
    nounUnit,
    initiativeDetail,
    pillarDetail,
    statusDetail,
    portfolioDetail,
    axesDetail,
    STATUS_PARAM,
    SOURCE_BADGE,
  };
})();
