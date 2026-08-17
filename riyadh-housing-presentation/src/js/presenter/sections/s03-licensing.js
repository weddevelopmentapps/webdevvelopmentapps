/* ════════════════════════════════════════════════════════════════════════════
   s03-licensing.js — القسم 3: «التراخيص» — لوحة قيادة منظومة الترخيص كاملة
   ────────────────────────────────────────────────────────────────────────────
   لوحة كثيفة (عقد V2_CONTRACTS §1 — order:3, id:"licensing", backdrop:"licensing"):

     ▸ شريط أربعة مؤشرات كبرى أعلى الشاشة — كل رقم قابل للنقر يفتح بطاقة
       «الأصل والمنهجية» (القيمة الدقيقة بورقتها ومرساتها، والمشتق بصيغته
       المعتمدة وإصدارها):
         1. رخص البناء                    96   (‎+50.0٪‎ منذ خط الأساس 64)
         2. الرخص التشغيلية النشطة       140   (‎+18.6٪‎ منذ خط الأساس 118)
         3. الطاقة الاستيعابية المرخصة   612.4 ألف سرير (‎+8.6٪‎ = ‎+48.5 ألف)
         4. أنواع الإيواء المرخصة        38 / 68 / 34  (مجمع/مبنى/كبائن = 140)

     ▸ شبكة رسوم تملأ ما تبقى (ثلاثة صفوف × 12 عموداً وعمود رؤى ممتد صفين):
         صف 1: المسار التراكمي للتراخيص (الرسم البطل — بناء/تشغيلية بشبكة
                الرخص والأسرّة بشبكة مستقلة، نقر نقطة شهرية يفتح ملف الشهر
                ونقطة «الأساس» تفتح بطاقة خط الأساس) ·
                تكوين النمو منذ خط الأساس licenseGrowthBridge (بديل الجسر
                الشلالي المرفوض) بمبدّل مقياس أسرّة/بناء/تشغيلية
         صف 2: مقارنة التراخيص قطاعياً (نقر قطاع يفتح بطاقة ترخيصه) ·
                التوزيع الجغرافي على خريطة الرياض الحقيقية RH.viz.geomap
                بطبقات أسرّة/تشغيلية/بناء — نقر حي يفتح بطاقته
         صف 3: الإصدار الشهري الصافي · أنواع الإيواء المرخصة ·
                أعلى-5 أحياء من العينة (بوسم العينة الحرفي وملاحظة الترتيب،
                بمبدّل مقياس الترتيب — كل صف زر يفتح بطاقة الحي)

     ▸ عمود رؤى insight_panels.sections.licensing + «النمو منذ خط الأساس»
       (ثلاثة صفوف قياس 64→96 / 118→140 / 563.9→612.4 ألف — المسار المفاتيحي
       الموازي لبطاقات الأصل) + زر الملحق التحليلي + سطر حداثة البيانات.

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل رقم من release.json/riyadh-geo.json (عبر ctx.release/
     ctx.derived/ctx.geo)، وكل رقم ظاهر عبر RH.core.fmt حصراً (تطابق العدد
     والمعدود عبر fmt.noun/countNoun، عزل اتجاهي حتمي عبر fmt.iso/fmt.pct).
   • كل نص إصدار يُبنى بعقد dom.h النصي (textContent) — لا innerHTML لمحتوى
     الإصدار إطلاقاً؛ نصوص تلميحات الرسوم تمر عبر theme.esc داخل مكتبة
     charts2 ذاتها، وتلميح الخريطة عبر esc داخل geomap ذاته.
   • منظومة المعنى: أخضر=طاقة/رخص مرخصة، رملي=طلب، مرجاني=عجز/مخالفات حصراً،
     ذهبي=خط الأساس/المستهدف/وسوم الاعتماد حصراً، أزرق=فئة تصنيفية ثانوية.
   • كل الرسوم عبر مُنشئي RH.viz.charts2 القانونيين بمفتاح مثيلات "licensing"
     كي لا تصطدم بمثيلات الملخص التنفيذي (key:"summary").
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (أزرار حقيقية أو role=button
     بمعالجة Enter/مسافة) وموسوم data-interactive (عقد الملاحة §8)؛ Escape
     يغلق بطاقة التفاصيل (عقد ctx.openDetail) ويُخرج تركيز الخريطة (عقدها).
   • prefers-reduced-motion محترم: العد التصاعدي عبر RH.viz.motion (قيمة
     نهائية فورية عند التقليل)، وانتقالات CSS تُصفَّر في licensing.css.
   • التنظيف عبر ctx.onTeardown: فصل مستمعي نقر مثيلات ECharts (المثيلات
     تعمّر في سجل الثيم أطول من DOM القسم)، وهدم الخريطة gm.destroy، وفصل
     مستمع resize الخاص بها، وإلغاء مؤقت انتظار الإلحاق.
   • 16:9 يتسع دون تمرير عند 1920×1080 بوحدة ‎--su؛ الفيضان الرأسي في وضع
     اللوحة يُحل بتمرير داخلي في جسم القسم حصراً (licensing.css).
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* نسبة مئوية بنفس تقريب بايثون (نصف لأعلى، منزلة واحدة) — المرآة الرسمية */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /* ──────────────────────────────────────────────────────────────────────────
     ثوابت عرض (لا قيم بيانات إطلاقاً): صيغ عدد ومعدود محلية، أوسمة الترتيب
     الترخيصية، وتعريف مقاييس الترخيص الثلاثة وطبقات الخريطة.
     ────────────────────────────────────────────────────────────────────────── */

  /** صيغ عدد ومعدود محلية لما لا تغطيه NOUNS المركزية (عقد fmt.countNoun) */
  const LOCAL_NOUNS = {
    sector: { one: "قطاع واحد", two: "قطاعان", few: "قطاعات", many: "قطاعاً", hundred: "قطاع" },
    district: { one: "حي واحد", two: "حيان", few: "أحياء", many: "حياً", hundred: "حي" },
    type: { one: "نوع واحد", two: "نوعان", few: "أنواع", many: "نوعاً", hundred: "نوع" },
    month: { one: "شهر واحد", two: "شهران", few: "أشهر", many: "شهراً", hundred: "شهر" },
  };

  /** أوسمة الترتيب القطاعي الترخيصية — مرآة مفردات derived.rankings حرفياً.
      النغمة دلالية: الأخضر لما يعبر عن طاقة/رخص أعلى، والحياد لما دونها —
      لا مرجاني هنا (المخالفات شأن قسم الرقابة لا التراخيص). */
  const RANK_BADGES = {
    highest_building: { text: "الأعلى في رخص البناء", tone: "pos" },
    lowest_building: { text: "الأدنى في رخص البناء", tone: "neu" },
    highest_operational: { text: "الأعلى في الرخص التشغيلية", tone: "pos" },
    lowest_operational: { text: "الأدنى في الرخص التشغيلية", tone: "neu" },
    highest_beds: { text: "الأعلى طاقة استيعابية مرخصة", tone: "pos" },
    lowest_beds: { text: "الأدنى طاقة استيعابية مرخصة", tone: "neu" },
  };

  /** مقاييس الترخيص الثلاثة — تعريف عرض يقرأ من الإصدار وقت البناء حصراً:
      لا قيمة مخزنة هنا؛ الدوال تُقيَّم على release/derived الحية. */
  const MEASURES = {
    building: {
      key: "building",
      disp: "رخص البناء",
      short: "بناء",
      unit: "رخصة",
      nounKey: "licence",
      fV: (v) => fmt.int(v),
      cur: (rel) => rel.metrics.current_building.value,
      base: (rel) => rel.baseline.building,
      growthAbs: (der) => der.growth_building_abs,
      growthPct: (der) => der.growth_building_pct,
      metric: (rel) => rel.metrics.current_building,
      baseMetric: (rel) => rel.metrics.baseline_building,
      derived: (rel) => rel.derived.growth_building_pct,
      sectorVal: (s) => s.building,
      layer: "building",
    },
    operational: {
      key: "operational",
      disp: "الرخص التشغيلية",
      short: "تشغيلية",
      unit: "رخصة",
      nounKey: "licence",
      fV: (v) => fmt.int(v),
      cur: (rel) => rel.metrics.current_operational.value,
      base: (rel) => rel.baseline.operational,
      growthAbs: (der) => der.growth_operational_abs,
      growthPct: (der) => der.growth_operational_pct,
      metric: (rel) => rel.metrics.current_operational,
      baseMetric: (rel) => rel.metrics.baseline_operational,
      derived: (rel) => rel.derived.growth_operational_pct,
      sectorVal: (s) => s.operational,
      layer: "operational",
    },
    beds: {
      key: "beds",
      disp: "الأسرّة المرخصة",
      short: "أسرّة",
      unit: "سرير",
      nounKey: "bed",
      fV: (v) => fmt.compact(v),
      cur: (rel) => rel.metrics.licensed_beds.value,
      base: (rel) => rel.baseline.beds,
      growthAbs: (der) => der.growth_beds_abs,
      growthPct: (der) => der.growth_beds_pct,
      metric: (rel) => rel.metrics.licensed_beds,
      baseMetric: (rel) => rel.metrics.baseline_beds,
      derived: (rel) => rel.derived.growth_beds_pct,
      sectorVal: (s) => s.beds,
      layer: "beds",
    },
  };

  /** ترتيب عرض المقاييس في المبدّلات (الأسرّة أولاً — الرقم التنفيذي الأكبر) */
  const MEASURE_ORDER = ["beds", "building", "operational"];

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js: فشل فحص لا يُسقط
     اللوحة (الإصدار المنشور اجتاز بواباته أصلاً) بل ينبه في وحدة التحكم
     لالتقاط أي انجراف بيانات مبكراً أثناء التطوير.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s03-licensing/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) أدوات صياغة وتفاعل مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** نسبة موجبة موقعة بعزل اتجاهي حتمي: ‎+8.6٪‎ — لنمو خط الأساس حصراً */
  function isoSignedPct(v) {
    const sign = v >= 0 ? "+" : "−";
    return fmt.iso(sign + fmt.dec1(Math.abs(v)) + "٪");
  }

  /** «+N» بعزل اتجاهي حتمي — الإضافات هنا موجبة دائماً (سلاسل صافية) */
  const plusInt = (n) => fmt.iso("+" + fmt.int(n));

  /** قيمة تنفيذية مختصرة بوحدتها: «612.4 ألف سرير» / «3,200 سرير» */
  function compactUnit(v, unit) {
    return Math.abs(v) >= 10000
      ? fmt.compact(v) + fmt.NBSP + unit
      : fmt.unitAfter(v, unit);
  }

  /** جعل عنصر غير-زر قابلاً للتفعيل بالكامل: نقر + Enter + مسافة، بدور
      button ووسم data-interactive (فلا يبتلع جهاز التقديم ضغطاته — عقد §8).
      المستمعون على عناصر القسم ذاته فيسقطون مع هدم DOM (لا تسريب). */
  function activatable(el, onAct, ariaLabel) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-interactive", "");
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    el.classList.add("lic-act");
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

  /** سطر مصدر لمشتقة: الصيغة المعتمدة بإصدارها من كتلة derived في الإصدار */
  function derivedSourceLine(dm) {
    return "قيمة مشتقة — الصيغة المعتمدة: " + fmt.iso(String(dm.formula))
      + " (إصدار الصيغة " + fmt.iso(String(dm.formula_version)) + ")";
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) نموذج الترخيص الجاهز للعرض — يُبنى مرة واحدة عند بناء القسم
     ──────────────────────────────────────────────────────────────────────────
     يضم: المقاييس الثلاثة بقيمها المقيَّمة (أساس/حالي/نمو)، والتراكمي الشهري
     لكل مقياس، وأنواع الإيواء مرتبة تنازلياً على الخام، ونموذج القطاعات
     بأوسمة ترتيبها الترخيصية وعينات أحيائها، وفهرس عينة الأحياء كاملاً.
     ══════════════════════════════════════════════════════════════════════════ */
  function licModel(rel, der) {
    /* المقاييس الثلاثة مقيَّمة على الإصدار الحي */
    const meas = {};
    for (const k of Object.keys(MEASURES)) {
      const M = MEASURES[k];
      meas[k] = {
        def: M,
        cur: M.cur(rel),
        base: M.base(rel),
        growthAbs: M.growthAbs(der),
        growthPct: M.growthPct(der),
      };
    }

    /* التراكمي الشهري لكل مقياس — المتطابقة: آخر نقطة = القيمة المنشورة */
    const months = rel.monthly.licensing;
    const cum = { building: [], operational: [], beds: [] };
    const acc = {
      building: meas.building.base,
      operational: meas.operational.base,
      beds: meas.beds.base,
    };
    for (const m of months) {
      for (const k of Object.keys(cum)) {
        acc[k] += m[k];
        cum[k].push(acc[k]);
      }
    }

    /* أنواع الإيواء تنازلياً على الخام — مرآة ترتيب facilityTypes في المكتبة
       (اللون هناك يتبع المعرف الثابت فلا يتأثر بالترتيب) */
    const types = rel.facility_types.slice().sort((a, b) => b.count - a.count);
    let typesSum = 0;
    for (const t of types) typesSum += t.count;

    /* نموذج القطاعات: الصف الخام + المشتقات + الأوسمة الترخيصية + عينته */
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
        sample: rel.neighbourhoods.rows.filter((n) => n.sector === s.id),
      };
    });
    const bySector = {};
    for (const s of sectors) bySector[s.row.id] = s;

    /* فهرس عينة الأحياء بالاسم — أساس بطاقات الأحياء وقائمة أعلى-5 */
    const sample = rel.neighbourhoods.rows.slice();
    const sampleByName = new Map();
    for (const n of sample) sampleByName.set(n.name, n);

    /* متطابقات الإصدار التي تتكئ عليها اللوحة كاملة — تنبيه مبكر عند انجراف */
    guard("licModel", {
      "12 شهراً في سلسلة التراخيص": months.length === 12,
      "تراكمي البناء = الحالي المنشور": acc.building === meas.building.cur,
      "تراكمي التشغيلية = الحالي المنشور": acc.operational === meas.operational.cur,
      "تراكمي الأسرّة = الطاقة المرخصة": acc.beds === meas.beds.cur,
      "النمو المطلق للبناء متطابق":
        meas.building.cur - meas.building.base === meas.building.growthAbs,
      "النمو المطلق للتشغيلية متطابق":
        meas.operational.cur - meas.operational.base === meas.operational.growthAbs,
      "النمو المطلق للأسرّة متطابق":
        meas.beds.cur - meas.beds.base === meas.beds.growthAbs,
      "مجموع أنواع الإيواء = الرخص التشغيلية": typesSum === meas.operational.cur,
      "ثلاثة أنواع إيواء": types.length === 3,
      "خمسة قطاعات كما في الإصدار": sectors.length === 5,
      "مجموع بناء القطاعات = الإجمالي":
        sectors.reduce((a, s) => a + s.row.building, 0) === meas.building.cur,
      "مجموع تشغيلية القطاعات = الإجمالي":
        sectors.reduce((a, s) => a + s.row.operational, 0) === meas.operational.cur,
      "مجموع أسرّة القطاعات = الطاقة المرخصة":
        sectors.reduce((a, s) => a + s.row.beds, 0) === meas.beds.cur,
      "عينة الأحياء غير فارغة وتكفي لأعلى-5": sample.length >= 5,
    });

    return { meas, months, cum, types, typesSum, sectors, bySector, sample, sampleByName };
  }

  /** ترتيب عينة الأحياء تنازلياً على مقياس، بكسر تعادل حتمي (الأسرّة ثم
      الاسم أبجدياً) — الترتيب ضمن العينة المورّدة فقط (ملاحظة الإصدار) */
  function topSample(model, measureKey, n) {
    const val = (r) => r[measureKey];
    return model.sample.slice().sort((a, b) => {
      if (val(b) !== val(a)) return val(b) - val(a);
      if (b.beds !== a.beds) return b.beds - a.beds;
      return String(a.name).localeCompare(String(b.name), "ar");
    }).slice(0, n);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) هيكل بطاقة التفاصيل الموحد — عقد Node مبني بـ dom.h النصي حصراً:
        نصوص الإصدار تدخل textContent فلا مسار HTML إطلاقاً.
        { hero:{num, unit?, label?, tone?}, badges?[{text,tone}], caption?,
          bars?[{label, pct, valueText, tone}], rows?[{k, v, tone?}],
          table?{columns, rows, note?}, notes?[], sources?[],
          actions?[{label, onAct, aria?}] }
     ══════════════════════════════════════════════════════════════════════════ */

  /** شريط مقارنة أفقي واحد: تسمية + مسار بامتلاء نسبي + قيمة نصية كاملة.
      الامتلاء زخرفة مكملة للرقم الحقيقي المجاور فلا يحمل دلالة وحده
      (aria-hidden على المسار) — الأساس الموحد يمرره المستدعي. */
  function compareBar(o) {
    const width = Math.max(0, Math.min(100, o.pct));
    return h("div", { class: "lic-cbar" + (o.tone ? " " + o.tone : "") },
      h("span", { class: "lic-cbar-k" }, o.label),
      h("span", { class: "lic-cbar-track", "aria-hidden": "true" },
        h("span", { class: "lic-cbar-fill", style: { width: width + "%" } }),
      ),
      h("b", { class: "lic-cbar-v" }, o.valueText),
    );
  }

  /** جدول كثيف داخل بطاقة التفاصيل — حاوية قابلة للتمرير الداخلي كي لا
      تفيض البطاقة (عقد «التمرير داخل المكوّن لا المسرح») */
  function detailTable(t) {
    const wrap = h("div", { class: "lic-table" },
      h("table", { class: "table-dense" },
        h("thead", {}, h("tr", {},
          t.columns.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, t.rows.map((r) => h("tr", {},
          r.map((cell, i) => h(i === 0 ? "th" : "td",
            i === 0 ? { scope: "row" } : {}, cell))))),
      ));
    if (!t.note) return wrap;
    return h("div", {}, wrap, h("div", { class: "lic-note" }, t.note));
  }

  /** الهيكل الكامل لبطاقة التفاصيل */
  function detailShell(o) {
    const box = h("div", { class: "lic-detail" });

    if (o.hero) {
      box.appendChild(h("div", { class: "lic-hero" },
        h("span", {
          class: "lic-hero-num" + (o.hero.tone ? " " + o.hero.tone : ""),
        }, o.hero.num),
        o.hero.unit ? h("span", { class: "lic-hero-unit" }, o.hero.unit) : null,
        o.hero.label ? h("span", { class: "lic-hero-label" }, o.hero.label) : null,
      ));
    }
    if (o.badges && o.badges.length) {
      box.appendChild(h("div", { class: "lic-badges" },
        o.badges.map((b) => h("span", {
          class: "lic-badge" + (b.tone ? " " + b.tone : ""),
        }, b.text))));
    }
    if (o.caption) {
      box.appendChild(h("p", { class: "lic-cap" }, o.caption));
    }
    if (o.bars && o.bars.length) {
      box.appendChild(h("div", { class: "lic-cbars" }, o.bars.map(compareBar)));
    }
    if (o.rows && o.rows.length) {
      box.appendChild(h("div", { class: "lic-rows" },
        o.rows.map((r) => h("div", {
          class: "lic-row" + (r.tone ? " " + r.tone : ""),
        },
          h("span", { class: "lic-row-k" }, r.k),
          h("b", { class: "lic-row-v" }, r.v),
        ))));
    }
    if (o.table) box.appendChild(detailTable(o.table));
    if (o.notes && o.notes.length) {
      box.appendChild(h("div", { class: "lic-notes" },
        o.notes.map((n) => h("p", { class: "lic-note" }, n))));
    }
    if (o.sources && o.sources.length) {
      box.appendChild(h("div", { class: "lic-sources" },
        o.sources.map((s) => h("p", { class: "lic-src" }, s))));
    }
    if (o.actions && o.actions.length) {
      box.appendChild(h("div", { class: "lic-actions" },
        o.actions.map((a) => h("button", {
          class: "lic-btn",
          type: "button",
          "data-interactive": "",
          "aria-label": a.aria || a.label,
          onclick: a.onAct,
        },
          h("span", {}, a.label),
          h("span", { class: "lic-btn-arrow", "aria-hidden": "true" }, "←"),
        ))));
    }
    return box;
  }

  /** زر الملحق القياسي داخل بطاقات التفاصيل (عقد §7: يحفظ حالة القسم) */
  function appendixAction(ctx) {
    return {
      label: "الملحق التحليلي: التراخيص — السجل والتحليل",
      aria: "فتح الملحق التحليلي للتراخيص مع حفظ حالة القسم",
      onAct: () => ctx.openAppendix("licensing"),
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) بطاقات «الأصل والمنهجية» لأرقام الشريط الأربعة + بطاقة خط الأساس
     ══════════════════════════════════════════════════════════════════════════ */

  /** التوزيع القطاعي لمقياس — جدول مشترك بين بطاقات المقاييس الثلاثة */
  function sectorTableFor(model, mk) {
    const M = MEASURES[mk];
    const total = model.meas[mk].cur;
    const ordered = model.sectors.slice()
      .sort((a, b) => M.sectorVal(b.row) - M.sectorVal(a.row));
    return {
      columns: ["القطاع", M.disp, "الحصة من الإجمالي"],
      rows: ordered.map((s) => [
        s.row.name,
        fmt.int(M.sectorVal(s.row)),
        fmt.pct(pctOf(M.sectorVal(s.row), total)),
      ]),
      note: "القطاعات مرتبة تنازلياً على " + M.disp + " الخام.",
    };
  }

  /** 1: رخص البناء — خام + نموه منذ خط الأساس + توزيعه القطاعي */
  function buildingDetail(ctx, model) {
    const rel = ctx.release;
    const m = model.meas.building;
    const metric = MEASURES.building.metric(rel);
    const baseMetric = MEASURES.building.baseMetric(rel);

    return detailShell({
      hero: { num: fmt.int(m.cur), unit: "رخصة", label: metric.label, tone: "pos" },
      caption: "من " + fmt.noun(m.base, "licence") + " عند خط الأساس إلى "
        + fmt.noun(m.cur, "licence") + " حالياً — "
        + rel.meta.comparison_qualifier + ".",
      rows: [
        { k: baseMetric.label, v: fmt.noun(m.base, "licence") },
        {
          k: "صافي الإضافة منذ خط الأساس",
          v: plusInt(m.growthAbs) + " رخصة",
          tone: "pos",
        },
        { k: "نسبة النمو", v: isoSignedPct(m.growthPct), tone: "pos" },
        {
          k: "متوسط الإصدار الشهري خلال الفترة",
          v: fmt.iso(fmt.dec1(m.growthAbs / model.months.length)) + " رخصة",
        },
      ],
      table: sectorTableFor(model, "building"),
      notes: [rel.meta.comparison_qualifier],
      sources: [
        rawSourceLine(rel, metric),
        rawSourceLine(rel, baseMetric),
        derivedSourceLine(MEASURES.building.derived(rel)),
      ],
      actions: [appendixAction(ctx)],
    });
  }

  /** 2: الرخص التشغيلية — خام + نموها + تفكيك أنواع الإيواء (مجموعها 140) */
  function operationalDetail(ctx, model) {
    const rel = ctx.release;
    const m = model.meas.operational;
    const metric = MEASURES.operational.metric(rel);
    const baseMetric = MEASURES.operational.baseMetric(rel);

    return detailShell({
      hero: { num: fmt.int(m.cur), unit: "رخصة", label: metric.label, tone: "pos" },
      caption: "من " + fmt.noun(m.base, "licence") + " عند خط الأساس إلى "
        + fmt.noun(m.cur, "licence") + " نشطة حالياً، موزعة على "
        + fmt.countNoun(model.types.length, LOCAL_NOUNS.type) + " من الإيواء.",
      rows: [
        { k: baseMetric.label, v: fmt.noun(m.base, "licence") },
        {
          k: "صافي الإضافة منذ خط الأساس",
          v: plusInt(m.growthAbs) + " رخصة",
          tone: "pos",
        },
        { k: "نسبة النمو", v: isoSignedPct(m.growthPct), tone: "pos" },
      ],
      table: {
        columns: ["نوع الإيواء", "الرخص التشغيلية", "الحصة"],
        rows: model.types.map((t) => [
          t.name,
          fmt.int(t.count),
          fmt.pct(pctOf(t.count, m.cur)),
        ]).concat([["الإجمالي", fmt.int(model.typesSum), fmt.pct(100)]]),
        note: "مجموع الأنواع يساوي الرخص التشغيلية النشطة — متطابقة محروسة "
          + "ببوابات التحقق.",
      },
      sources: [
        rawSourceLine(rel, metric),
        rawSourceLine(rel, baseMetric),
        derivedSourceLine(MEASURES.operational.derived(rel)),
      ],
      actions: [appendixAction(ctx)],
    });
  }

  /** 3: الطاقة الاستيعابية المرخصة — خام + نموها + مسارها التراكمي الشهري
      وأثرها على نسبة تغطية الطلب (المشتقة بصيغتها) */
  function bedsDetail(ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;
    const m = model.meas.beds;
    const metric = MEASURES.beds.metric(rel);
    const baseMetric = MEASURES.beds.baseMetric(rel);
    const dem = rel.metrics.total_demand.value;

    const monthly = model.months.map((mo, i) => ({
      label: mo.label,
      add: mo.beds,
      cum: model.cum.beds[i],
      pct: pctOf(model.cum.beds[i], dem),
    }));
    guard("bedsDetail", {
      "آخر نقطة شهرية = نسبة التغطية المنشورة":
        monthly[monthly.length - 1].pct === der.coverage_pct,
    });

    return detailShell({
      hero: { num: fmt.compact(m.cur), unit: "سرير", label: metric.label, tone: "pos" },
      caption: "القيمة الدقيقة " + fmt.unitAfter(m.cur, "سرير") + " — "
        + rel.meta.comparison_qualifier + ".",
      rows: [
        { k: baseMetric.label, v: fmt.unitAfter(m.base, "سرير") },
        {
          k: "صافي الإضافة منذ خط الأساس",
          v: plusInt(m.growthAbs) + " سرير",
          tone: "pos",
        },
        { k: "نسبة النمو", v: isoSignedPct(m.growthPct), tone: "pos" },
        { k: "نسبة تغطية الطلب الحالية", v: fmt.pct(der.coverage_pct) },
      ],
      table: {
        columns: ["الشهر", "صافي الإضافة", "التراكمي (سرير)", "تغطية الطلب"],
        rows: monthly.map((mo) => [
          mo.label,
          plusInt(mo.add),
          fmt.int(mo.cum),
          fmt.pct(mo.pct),
        ]),
      },
      sources: [
        rawSourceLine(rel, metric),
        rawSourceLine(rel, baseMetric),
        derivedSourceLine(MEASURES.beds.derived(rel)),
        derivedSourceLine(rel.derived.coverage_pct),
      ],
      actions: [appendixAction(ctx)],
    });
  }

  /** 4: أنواع الإيواء المرخصة — الأنواع الثلاثة بحصصها من الرخص النشطة */
  function typesDetail(ctx, model) {
    const rel = ctx.release;
    const total = model.meas.operational.cur;
    const top = model.types[0];

    return detailShell({
      hero: {
        num: fmt.int(model.types.length),
        unit: "أنواع",
        label: "أنواع الإيواء المرخصة في المدينة",
      },
      caption: "يتصدر «" + top.name + "» بواقع " + fmt.noun(top.count, "licence")
        + " أي " + fmt.pct(pctOf(top.count, total))
        + " من إجمالي " + fmt.noun(total, "licence") + " تشغيلية نشطة.",
      bars: model.types.map((t) => ({
        label: t.name,
        pct: pctOf(t.count, top.count),
        valueText: fmt.noun(t.count, "licence")
          + " (" + fmt.pct(pctOf(t.count, total)) + ")",
        tone: "supply",
      })),
      rows: [
        { k: "إجمالي الرخص التشغيلية النشطة", v: fmt.noun(total, "licence") },
        { k: "مجموع الأنواع الثلاثة", v: fmt.noun(model.typesSum, "licence") },
      ],
      notes: [
        "الأطوال منسوبة إلى النوع الأعلى؛ الحصص من إجمالي الرخص التشغيلية.",
      ],
      sources: [
        "المصدر: " + sourceName(rel, rel.metrics.current_operational.source_id)
        + " — جدول أنواع الإيواء كما ورد في الإصدار المنشور.",
      ],
      actions: [appendixAction(ctx)],
    });
  }

  /** بطاقة نوع إيواء واحد — نقر عمود في رسم الأنواع */
  function facilityTypeDetail(ctx, model, typeId) {
    const rel = ctx.release;
    const total = model.meas.operational.cur;
    const idx = model.types.findIndex((t) => t.id === typeId);
    if (idx < 0) return null;
    const t = model.types[idx];
    const top = model.types[0];

    return detailShell({
      hero: {
        num: fmt.int(t.count),
        unit: "رخصة",
        label: "رخص تشغيلية نشطة من نوع «" + t.name + "»",
      },
      caption: "الترتيب " + fmt.int(idx + 1) + " من بين "
        + fmt.countNoun(model.types.length, LOCAL_NOUNS.type)
        + " مدرجة في الإصدار.",
      bars: [
        {
          label: t.name,
          pct: pctOf(t.count, top.count),
          valueText: fmt.noun(t.count, "licence"),
          tone: "supply",
        },
        {
          label: top.name + (top.id === t.id ? "" : " (الأعلى)"),
          pct: 100,
          valueText: fmt.noun(top.count, "licence"),
          tone: "supply",
        },
      ],
      rows: [
        { k: "الحصة من الرخص التشغيلية النشطة", v: fmt.pct(pctOf(t.count, total)) },
        { k: "إجمالي الرخص التشغيلية النشطة", v: fmt.noun(total, "licence") },
      ],
      table: {
        columns: ["النوع", "الرخص", "الحصة"],
        rows: model.types.map((x) => [
          x.name,
          fmt.int(x.count),
          fmt.pct(pctOf(x.count, total)),
        ]),
        note: "الأنواع مرتبة تنازلياً على عدد الرخص الخام.",
      },
      sources: [
        "المصدر: " + sourceName(rel, rel.metrics.current_operational.source_id)
        + " — جدول أنواع الإيواء كما ورد في الإصدار المنشور.",
      ],
    });
  }

  /** بطاقة خط الأساس — نقر نقطة «الأساس» في المسار التراكمي: القيم الثلاث
      المرساة قبل سبتمبر 2025 كما وردت في الإصدار */
  function baselineDetail(ctx, model) {
    const rel = ctx.release;
    return detailShell({
      hero: {
        num: fmt.compact(model.meas.beds.base),
        unit: "سرير",
        label: rel.meta.baseline_label + " — نقطة انطلاق المسار التراكمي",
        tone: "gold",
      },
      caption: "قيم خط الأساس الثلاث هي مرساة كل مقارنات النمو في هذه اللوحة — "
        + rel.meta.comparison_qualifier + ".",
      rows: [
        {
          k: MEASURES.building.baseMetric(rel).label,
          v: fmt.noun(model.meas.building.base, "licence"),
        },
        {
          k: MEASURES.operational.baseMetric(rel).label,
          v: fmt.noun(model.meas.operational.base, "licence"),
        },
        {
          k: MEASURES.beds.baseMetric(rel).label,
          v: fmt.unitAfter(model.meas.beds.base, "سرير"),
        },
      ],
      sources: [
        rawSourceLine(rel, MEASURES.building.baseMetric(rel)),
        rawSourceLine(rel, MEASURES.operational.baseMetric(rel)),
        rawSourceLine(rel, MEASURES.beds.baseMetric(rel)),
      ],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) ملف الشهر الواحد — نقر نقطة/عمود شهري في أي رسم زمني:
        إصدارات الشهر الثلاث، والتراكمي بعده لكل مقياس، وحصته من النمو
        السنوي، وأثره على نسبة التغطية — مرآة الصيغة المعتمدة حرفياً.
     ══════════════════════════════════════════════════════════════════════════ */
  function monthDetail(ctx, model, i) {
    const rel = ctx.release;
    if (i < 0 || i >= model.months.length) return null;
    const m = model.months[i];
    const dem = rel.metrics.total_demand.value;
    const covered = pctOf(model.cum.beds[i], dem);

    guard("monthDetail", {
      "التغطية ضمن مدى سليم": covered > 0 && covered <= 100,
    });

    return detailShell({
      hero: {
        num: plusInt(m.beds),
        unit: "سرير",
        label: "صافي الأسرّة المضافة في " + m.label,
        tone: "pos",
      },
      caption: "قراءة الشهر الواحد: إصداراته الثلاثة، وموقعه من المسار "
        + "التراكمي، وحصته من نمو اثني عشر شهراً.",
      rows: [
        { k: "رخص بناء صادرة", v: fmt.noun(m.building, "licence") },
        { k: "رخص تشغيلية صادرة", v: fmt.noun(m.operational, "licence") },
        {
          k: "حصة الشهر من نمو الأسرّة السنوي",
          v: fmt.pct(pctOf(m.beds, model.meas.beds.growthAbs)),
        },
        {
          k: "تراكمي رخص البناء بنهايته",
          v: fmt.noun(model.cum.building[i], "licence"),
        },
        {
          k: "تراكمي الرخص التشغيلية بنهايته",
          v: fmt.noun(model.cum.operational[i], "licence"),
        },
        {
          k: "الطاقة المرخصة التراكمية بنهايته",
          v: fmt.unitAfter(model.cum.beds[i], "سرير"),
        },
        { k: "نسبة تغطية الطلب بنهايته", v: fmt.pct(covered) },
      ],
      sources: [
        "سلسلة الإصدار الشهري من الإصدار المنشور؛ التراكمي بصيغة "
        + "«خط الأساس + مجموع الإضافات» المعتمدة.",
        derivedSourceLine(rel.derived.coverage_pct),
      ],
      actions: [appendixAction(ctx)],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) بطاقة ترخيص القطاع الواحد — نقر عمود في المقارنة القطاعية:
        رخصه وطاقته وحصصه من الإجماليات الثلاثة، وأوسمة ترتيبه الترخيصية،
        وجدول عينة أحيائه بوسم العينة الحرفي وملاحظة الترتيب.
     ══════════════════════════════════════════════════════════════════════════ */
  function sectorLicDetail(ctx, model, sectorId) {
    const rel = ctx.release;
    const sm = model.bySector[sectorId];
    if (!sm) return null;
    const s = sm.row;

    const bars = MEASURE_ORDER.map((mk) => {
      const M = MEASURES[mk];
      return {
        label: M.disp,
        pct: pctOf(M.sectorVal(s), model.meas[mk].cur),
        valueText: mk === "beds"
          ? fmt.unitAfter(s.beds, "سرير")
          : fmt.noun(M.sectorVal(s), "licence"),
        tone: "supply",
      };
    });

    const sample = sm.sample.slice().sort((a, b) => b.beds - a.beds);
    const table = sample.length ? {
      columns: ["الحي", "أسرّة مرخصة", "رخص بناء", "رخص تشغيلية"],
      rows: sample.map((n) => [
        n.name,
        fmt.int(n.beds),
        fmt.int(n.building),
        fmt.int(n.operational),
      ]),
      note: rel.neighbourhoods.label + " — " + rel.neighbourhoods.ranking_note,
    } : null;

    return detailShell({
      hero: {
        num: fmt.compact(s.beds),
        unit: "سرير",
        label: "الطاقة الاستيعابية المرخصة في " + s.name,
      },
      badges: sm.badges,
      caption: fmt.noun(s.building, "licence") + " للبناء و"
        + fmt.noun(s.operational, "licence") + " تشغيلية نشطة، بتغطية "
        + fmt.pct(sm.sd.coverage_pct) + " من طلب القطاع.",
      bars,
      rows: [
        {
          k: "الحصة من رخص البناء (" + fmt.int(model.meas.building.cur) + ")",
          v: fmt.pct(pctOf(s.building, model.meas.building.cur)),
        },
        {
          k: "الحصة من الرخص التشغيلية (" + fmt.int(model.meas.operational.cur) + ")",
          v: fmt.pct(pctOf(s.operational, model.meas.operational.cur)),
        },
        {
          k: "الحصة من الأسرّة المرخصة (" + fmt.compact(model.meas.beds.cur) + ")",
          v: fmt.pct(pctOf(s.beds, model.meas.beds.cur)),
        },
        { k: "نسبة تغطية طلب القطاع", v: fmt.pct(sm.sd.coverage_pct) },
        { k: "طلب القطاع على الأسرّة", v: fmt.unitAfter(s.demand, "سرير") },
      ],
      table,
      notes: [
        "الأطوال في أشرطة المقارنة هي حصة القطاع من إجمالي كل مقياس — "
        + "قواعد قياس موحدة لا تضخيم فيها.",
      ],
      sources: [
        "قيم القطاع من ورقة قطاعات الإصدار المنشور؛ نسبة التغطية من مشتقات "
        + fmt.iso("sector_derived") + " المعتمدة.",
      ],
      actions: [appendixAction(ctx)],
    });
  }

  function openSectorDetail(ctx, model, sectorId) {
    const sm = model.bySector[sectorId];
    if (!sm) return;
    ctx.openDetail(sectorLicDetail(ctx, model, sectorId), {
      title: sm.row.name + " — بطاقة الترخيص",
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) بطاقة الحي الواحد — نقر حي على الخريطة أو صف في أعلى-5:
        قيم العينة إن وُجد الحي فيها (بوسم العينة الحرفي)، وإلا قيم قطاعه
        المعتمدة بتصريح صادق أن الحي خارج العينة — لا اختلاق قيم حي.
     ══════════════════════════════════════════════════════════════════════════ */
  function districtDetail(ctx, model, info) {
    const rel = ctx.release;
    const sm = model.bySector[info.sectorId];
    if (!sm) return null;
    const s = sm.row;
    const n = info.sample || null;

    if (n) {
      /* الحي ضمن العينة العشرين — قيمه المورّدة تُعرض بوسمها */
      return detailShell({
        hero: {
          num: fmt.int(n.beds),
          unit: "سرير",
          label: "أسرّة مرخصة في " + n.name + " (ضمن العينة)",
        },
        badges: [{ text: rel.neighbourhoods.label, tone: "gold" }],
        caption: "الحي من أحياء " + s.name + " — "
          + rel.neighbourhoods.ranking_note + ".",
        rows: [
          { k: "رخص البناء في الحي", v: fmt.noun(n.building, "licence") },
          { k: "الرخص التشغيلية في الحي", v: fmt.noun(n.operational, "licence") },
          {
            k: "حصة الحي من أسرّة قطاعه",
            v: fmt.pct(pctOf(n.beds, s.beds)),
          },
          {
            k: "المخالفات المسجلة في الحي",
            v: fmt.noun(n.violations, "violation"),
            tone: "neg",
          },
          { k: "أسرّة " + s.name + " كاملاً", v: fmt.unitAfter(s.beds, "سرير") },
          {
            k: "رخص القطاع (بناء / تشغيلية)",
            v: fmt.iso(fmt.int(s.building) + " / " + fmt.int(s.operational)),
          },
        ],
        sources: [
          "قيم الحي من جدول عينة الأحياء في الإصدار المنشور — "
          + rel.neighbourhoods.label + ".",
          "قيم القطاع من ورقة قطاعات الإصدار المنشور.",
        ],
        actions: [appendixAction(ctx)],
      });
    }

    /* الحي خارج العينة — قيم القطاع المعتمدة فقط بتصريح صادق */
    return detailShell({
      hero: {
        num: fmt.compact(s.beds),
        unit: "سرير",
        label: "الطاقة المرخصة في " + s.name + " (قيم قطاعية)",
      },
      caption: "حي " + info.name + " من أحياء " + s.name
        + " — الحي خارج عينة الأحياء المدرجة في قاعدة البيانات، والقيم "
        + "المعروضة قطاعية معتمدة لا تقديرات على مستوى الحي.",
      rows: [
        { k: "رخص البناء في القطاع", v: fmt.noun(s.building, "licence") },
        { k: "الرخص التشغيلية في القطاع", v: fmt.noun(s.operational, "licence") },
        { k: "نسبة تغطية طلب القطاع", v: fmt.pct(sm.sd.coverage_pct) },
        { k: "طلب القطاع على الأسرّة", v: fmt.unitAfter(s.demand, "سرير") },
      ],
      notes: [
        "لا قيم مختلقة على مستوى الحي: قيم الأحياء تظهر فقط حيث ورد الحي في "
        + "عينة الأحياء العشرين المدرجة في الإصدار، بوسمها.",
      ],
      sources: ["قيم القطاع من ورقة قطاعات الإصدار المنشور."],
      actions: [appendixAction(ctx)],
    });
  }

  function openDistrictDetail(ctx, model, info) {
    const node = districtDetail(ctx, model, info);
    if (!node) return;
    ctx.openDetail(node, { title: info.name + " — بطاقة الحي" });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) شريط المؤشرات الكبرى — أربعة أرقام بطولية بعقد layout.kpiStrip:
        96 بناء ‎+50.0٪‎ · 140 تشغيلية ‎+18.6٪‎ · 612.4 ألف سرير ‎+8.6٪‎ ·
        أنواع 38/68/34. القيم منسقة سلفاً عبر fmt، والعد التصاعدي عند أول
        دخول فقط (مفاتيح lic:kpi:*)، وكل بطاقة تفتح بطاقة أصلها.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildKpiStrip(el, ctx, model) {
    const rel = ctx.release;
    const mB = model.meas.building;
    const mO = model.meas.operational;
    const mS = model.meas.beds;
    const bedsParts = fmt.compactParts(mS.cur);

    /* متطابقات الشريط: المعروض يطابق مرايا الإصدار المنشورة */
    guard("kpiStrip", {
      "نمو البناء يطابق المشتقة المنشورة":
        mB.growthPct === rel.derived.growth_building_pct.value,
      "نمو التشغيلية يطابق المشتقة المنشورة":
        mO.growthPct === rel.derived.growth_operational_pct.value,
      "نمو الأسرّة يطابق المشتقة المنشورة":
        mS.growthPct === rel.derived.growth_beds_pct.value,
      "أنواع الإيواء تجمع إلى التشغيلية": model.typesSum === mO.cur,
    });

    /* منسقات العد التصاعدي — الرقم وحده يُعد وكلمة المقياس ثابتة في الوحدة
       (compactParts) كي لا يقفز عرض البطاقة أثناء العد؛ القيمة النهائية
       تساوي value المنسقة حرفياً (عقد layout.kpiStrip). */
    const countInt = (v) => fmt.int(v);
    const countThousands = (v) => fmt.compactParts(Math.max(v, 10000)).num;

    /* ترتيب أرقام الأنواع بترتيب جدول الإصدار الحرفي (مجمع/مبنى/كبائن) —
       عزل اتجاهي واحد للسلسلة المختلطة كاملة */
    const typesRun = fmt.iso(rel.facility_types.map((t) => fmt.int(t.count)).join(" / "));
    const typesNote = rel.facility_types
      .map((t) => t.name.split(" ")[0] + " " + fmt.int(t.count)).join(" · ");

    const defs = [
      {
        item: {
          label: MEASURES.building.metric(rel).label,
          value: fmt.int(mB.cur),
          unit: "رخصة",
          tone: "pos",
          delta: { text: isoSignedPct(mB.growthPct) + " منذ خط الأساس", tone: "pos" },
          note: "من " + fmt.noun(mB.base, "licence") + " عند خط الأساس",
          countTo: mB.cur, fmt: countInt, key: "lic:kpi:building",
        },
        detail: () => buildingDetail(ctx, model),
        title: "رخص البناء — الأصل والمنهجية",
      },
      {
        item: {
          label: MEASURES.operational.metric(rel).label,
          value: fmt.int(mO.cur),
          unit: "رخصة",
          tone: "pos",
          delta: { text: isoSignedPct(mO.growthPct) + " منذ خط الأساس", tone: "pos" },
          note: "من " + fmt.noun(mO.base, "licence") + " عند خط الأساس",
          countTo: mO.cur, fmt: countInt, key: "lic:kpi:operational",
        },
        detail: () => operationalDetail(ctx, model),
        title: "الرخص التشغيلية — الأصل والمنهجية",
      },
      {
        item: {
          label: MEASURES.beds.metric(rel).label,
          value: bedsParts.num,
          unit: bedsParts.word + " سرير",
          tone: "pos",
          delta: { text: isoSignedPct(mS.growthPct) + " منذ خط الأساس", tone: "pos" },
          note: plusInt(mS.growthAbs) + " سرير خلال "
            + fmt.countNoun(model.months.length, LOCAL_NOUNS.month),
          countTo: mS.cur, fmt: countThousands, key: "lic:kpi:beds",
        },
        detail: () => bedsDetail(ctx, model),
        title: "الطاقة الاستيعابية المرخصة — الأصل والمنهجية",
      },
      {
        item: {
          label: "أنواع الإيواء المرخصة",
          value: typesRun,
          note: typesNote + " — مجموعها " + fmt.noun(model.typesSum, "licence"),
        },
        detail: () => typesDetail(ctx, model),
        title: "أنواع الإيواء المرخصة — الأصل والمنهجية",
      },
    ];

    const strip = RH.presenter.layout.kpiStrip(el, defs.map((d) => d.item));

    /* كل بطاقة رقم زر حقيقي الوظيفة: نقر/Enter/مسافة يفتح بطاقة الأصل */
    Array.from(strip.children).forEach((kpiEl, i) => {
      const d = defs[i];
      if (!d) return;
      kpiEl.classList.add("lic-kpi");
      activatable(kpiEl, () => {
        ctx.openDetail(d.detail(), { title: d.title });
      }, d.item.label + " — " + (d.item.value || "")
        + (d.item.unit ? " " + d.item.unit : "") + "؛ بطاقة الأصل والمنهجية");
    });

    /* بطاقة الأنواع: سلسلة أرقام ثلاثية أعرض من رقم مفرد — صنف تصغير */
    if (strip.children[3]) strip.children[3].classList.add("lic-kpi-types");

    return strip;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) خلايا الرسوم — كل رسم عبر مُنشئه القانوني في RH.viz.charts2 بمفتاح
        المثيل "licensing"، والبطاقات عبر layout.chartCard حصراً.
     ══════════════════════════════════════════════════════════════════════════ */

  /** 9-أ: المسار التراكمي للتراخيص (الرسم البطل): بناء/تشغيلية بشبكة الرخص
      والأسرّة بشبكتها المستقلة (لا محور مزدوج). نقر نقطة شهرية يفتح ملف
      الشهر، ونقطة «الأساس» تفتح بطاقة خط الأساس. */
  function buildCumulativeCell(cell, ctx, model) {
    const rel = ctx.release;
    const res = RH.presenter.layout.chartCard(cell, {
      title: "المسار التراكمي للتراخيص",
      sub: rel.meta.baseline_label + " ← " + rel.meta.data_as_of
        + " — انقر شهراً لملفه",
      cls: "lic-cum-card",
    });

    const chart = RH.viz.charts2.cumulativeLicenses(res.body, ctx.su, {
      key: "licensing",
    });

    /* الفهرس 0 = نقطة الأساس المسبوقة؛ i≥1 = الشهر i−1 (عقد المُنشئ) */
    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      if (p.dataIndex === 0) {
        ctx.openDetail(baselineDetail(ctx, model), {
          title: rel.meta.baseline_label + " — بطاقة خط الأساس",
        });
      } else {
        const node = monthDetail(ctx, model, p.dataIndex - 1);
        if (node) {
          ctx.openDetail(node, {
            title: model.months[p.dataIndex - 1].label + " — ملف الشهر",
          });
        }
      }
    });

    /* سطر قراءة موجز في ذيل البطاقة — الإجماليات الثلاثة الحالية */
    res.card.appendChild(h("div", { class: "lic-cardfoot" },
      "بناء ", h("b", {}, fmt.int(model.meas.building.cur)),
      " · تشغيلية ", h("b", {}, fmt.int(model.meas.operational.cur)),
      " · أسرّة ", h("b", {}, fmt.compact(model.meas.beds.cur)),
      " — كل الخطوط تبدأ من خط أساسها الذهبي",
    ));
    return res;
  }

  /** 9-ب: تكوين النمو منذ خط الأساس licenseGrowthBridge — المعالجة البديلة
      للجسر الشلالي المرفوض، بمبدّل مقياس (أسرّة/بناء/تشغيلية): إعادة
      استدعاء المُنشئ بنفس المفتاح تعيد ضبط المثيل ذاته بلا إعادة بناء. */
  function buildBridgeCell(cell, ctx, model) {
    const state = { measure: "beds" };

    const subFor = (mk) => {
      const m = model.meas[mk];
      return "من " + m.def.fV(m.base) + " إلى " + m.def.fV(m.cur)
        + " (" + isoSignedPct(m.growthPct) + ")";
    };

    const res = RH.presenter.layout.chartCard(cell, {
      title: "تكوين النمو منذ خط الأساس",
      sub: subFor(state.measure),
      cls: "lic-bridge-card",
    });
    const subEl = res.card.querySelector(".card-sub");

    const chart = RH.viz.charts2.licenseGrowthBridge(res.body, ctx.su, {
      key: "licensing",
      measure: state.measure,
    });

    /* نقر أي عمود يفتح ملف شهره: سلسلة واحدة وdataIndex = فهرس الشهر —
       مرآة عقد المُنشئ بعد إعادة التصميم (أعمدة التراكمي الشهري). */
    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      const node = monthDetail(ctx, model, p.dataIndex);
      if (node) {
        ctx.openDetail(node, {
          title: model.months[p.dataIndex].label + " — ملف الشهر",
        });
      }
    });

    /* مبدّل المقياس: ثلاثة أزرار حقيقية بحالة aria-pressed — إعادة استدعاء
       المُنشئ بالمقياس الجديد (المثيل واحد في سجل الثيم فلا تسريب) */
    const chips = h("div", {
      class: "lic-chipbar",
      role: "group",
      "aria-label": "مبدّل مقياس تكوين النمو",
    });
    const chipEls = new Map();
    function setMeasure(mk) {
      if (state.measure === mk) return;
      state.measure = mk;
      RH.viz.charts2.licenseGrowthBridge(res.body, ctx.su, {
        key: "licensing",
        measure: mk,
      });
      if (subEl) subEl.textContent = subFor(mk);
      for (const [k, b] of chipEls) {
        b.classList.toggle("on", k === mk);
        b.setAttribute("aria-pressed", k === mk ? "true" : "false");
      }
    }
    for (const mk of MEASURE_ORDER) {
      const m = model.meas[mk];
      const btn = h("button", {
        class: "lic-chip" + (mk === state.measure ? " on" : ""),
        type: "button",
        "data-interactive": "",
        "aria-pressed": mk === state.measure ? "true" : "false",
        "aria-label": "عرض تكوين نمو " + m.def.disp + " — "
          + isoSignedPct(m.growthPct),
        onclick: () => setMeasure(mk),
      },
        h("span", { class: "lic-chip-name" }, m.def.short),
        h("b", { class: "lic-chip-val" }, isoSignedPct(m.growthPct)),
      );
      chipEls.set(mk, btn);
      chips.appendChild(btn);
    }
    res.card.appendChild(chips);
    return res;
  }

  /** 9-ج: مقارنة التراخيص قطاعياً — بناء/تشغيلية بشبكة الرخص والأسرّة
      بشبكتها المستقلة؛ نقر قطاع يفتح بطاقة ترخيصه. */
  function buildSectorCell(cell, ctx, model) {
    const der = ctx.derived;
    const res = RH.presenter.layout.chartCard(cell, {
      title: "التراخيص حسب القطاع",
      sub: "بناء وتشغيلية بمقياس الرخص · الأسرّة بشبكة مستقلة — انقر قطاعاً",
      cls: "lic-sector-card",
    });

    const chart = RH.viz.charts2.sectorLicenseCompare(res.body, ctx.su, {
      key: "licensing",
      compact: true,
    });

    /* الترتيب القانوني للإصدار محفوظ في الرسم (بلا sort) فيصح الفهرس */
    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      const row = ctx.release.sectors[p.dataIndex];
      if (row) openSectorDetail(ctx, model, row.id);
    });

    /* سطر قراءة موجز — من derived.rankings حصراً (نص لا لون) */
    const hiB = model.bySector[der.rankings.highest_beds];
    const loB = model.bySector[der.rankings.lowest_beds];
    res.card.appendChild(h("div", { class: "lic-cardfoot" },
      "الأعلى أسرّةً: ", h("b", {}, hiB.row.short),
      " " + fmt.compact(hiB.row.beds) + " · الأدنى: ",
      h("b", {}, loB.row.short), " " + fmt.compact(loB.row.beds),
    ));
    return res;
  }

  /** 9-د: الإصدار الشهري الصافي — أسرّة بشبكة عليا ورخص بشبكة سفلى؛
      نقر أي عمود يفتح ملف الشهر. */
  function buildMonthlyCell(cell, ctx, model) {
    const rel = ctx.release;
    const res = RH.presenter.layout.chartCard(cell, {
      title: "الإصدار الشهري الصافي",
      sub: rel.meta.monitoring_period_label + " — انقر شهراً لملفه",
      cls: "lic-monthly-card",
    });

    const chart = RH.viz.charts2.monthlyNetIssuance(res.body, ctx.su, {
      key: "licensing",
      compact: true,
    });

    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      const node = monthDetail(ctx, model, p.dataIndex);
      if (node) {
        ctx.openDetail(node, {
          title: model.months[p.dataIndex].label + " — ملف الشهر",
        });
      }
    });
    return res;
  }

  /** 9-هـ: أنواع الإيواء المرخصة — ثلاثية facility3 المتحقق منها لونياً؛
      نقر نوع يفتح بطاقته. الفهرس على الترتيب التنازلي (مرآة المُنشئ). */
  function buildFacilityCell(cell, ctx, model) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "أنواع الإيواء المرخصة",
      sub: "مجموعها " + fmt.noun(model.typesSum, "licence") + " تشغيلية نشطة",
      cls: "lic-facility-card",
    });

    const chart = RH.viz.charts2.facilityTypes(res.body, ctx.su, {
      key: "licensing",
      compact: true,
    });

    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      const t = model.types[p.dataIndex];
      if (!t) return;
      const node = facilityTypeDetail(ctx, model, t.id);
      if (node) ctx.openDetail(node, { title: t.name + " — بطاقة النوع" });
    });
    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) التوزيع الجغرافي — خريطة الرياض الحقيقية RH.viz.geomap بطبقات
         أسرّة/تشغيلية/بناء (choropleth قطاعي — لا قيمة مختلقة على مستوى
         الحي؛ قيم العينة تظهر في التلميح بوسمها). نقر/Enter على حي يفتح
         بطاقته. الهدم عبر gm.destroy إلزامي (عقد §4).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildGeoCell(cell, ctx, model) {
    /* عدّ الأحياء من بيانات الحدود الحية — لا رقم مثبت في الكود */
    let districtCount = 0;
    if (ctx.geo && ctx.geo.sectors) {
      for (const k of Object.keys(ctx.geo.sectors)) {
        districtCount += (ctx.geo.sectors[k] || []).length;
      }
    }

    const res = RH.presenter.layout.card(cell, {
      title: "التوزيع الجغرافي للتراخيص",
      sub: districtCount
        ? "حدود " + fmt.countNoun(districtCount, LOCAL_NOUNS.district)
          + " حقيقية — انقر حياً لبطاقته"
        : "خريطة الرياض",
      cls: "lic-geo-card",
      pad: false,
    });

    /* مبدّل الطبقات الثلاث — الطبقات الترخيصية حصراً (لا مخالفات هنا) */
    const LAYER_ORDER = ["beds", "operational", "building"];
    const state = { layer: "beds", gm: null, raf: 0, dead: false };
    const chips = h("div", {
      class: "lic-chipbar lic-geo-chips",
      role: "group",
      "aria-label": "مبدّل طبقات الخريطة",
    });
    const chipEls = new Map();
    function setLayer(lk) {
      state.layer = lk;
      if (state.gm) state.gm.setLayer(lk);
      for (const [k, b] of chipEls) {
        b.classList.toggle("on", k === lk);
        b.setAttribute("aria-pressed", k === lk ? "true" : "false");
      }
    }
    for (const lk of LAYER_ORDER) {
      const M = MEASURES[lk];
      const btn = h("button", {
        class: "lic-chip" + (lk === state.layer ? " on" : ""),
        type: "button",
        "data-interactive": "",
        "aria-pressed": lk === state.layer ? "true" : "false",
        "aria-label": "تلوين الخريطة بطبقة " + M.disp,
        onclick: () => setLayer(lk),
      }, h("span", { class: "lic-chip-name" }, M.short));
      chipEls.set(lk, btn);
      chips.appendChild(btn);
    }
    res.body.appendChild(chips);

    const host = h("div", { class: "lic-map-host" });
    res.body.appendChild(host);

    /* المحرك يبني القسم في مضيف احتياطي ثم يبدّل (عقد §1) — وضع البلاطات
       يحتاج مقاسات حقيقية وقت الإنشاء، فنؤجل الرسم حتى الإلحاق بالوثيقة
       (محاولات rAF محدودة ثم إنشاء على أي حال — وضع svg يتدرج ذاتياً). */
    let tries = 0;
    function createMap() {
      if (state.dead) return;
      state.gm = RH.viz.geomap.render(host, {
        su: ctx.su,
        layer: state.layer,
        mode: "auto",
        hotspots: false,           /* نقاط التركّز الرقابي شأن قسم الرقابة */
        sample: true,
        interactive: true,
        onDistrict: (info) => {
          openDistrictDetail(ctx, model, {
            name: info.name,
            sectorId: info.sector,
            sample: info.sample,
          });
        },
      });
      state.gm.refresh();
    }
    function waitAttach() {
      if (state.dead) return;
      if (host.isConnected || tries >= 90) {
        createMap();
        return;
      }
      tries += 1;
      state.raf = requestAnimationFrame(waitAttach);
    }
    waitAttach();

    /* مواءمة مقاس الخريطة مع تغير النافذة — مستمع خاص يُفصل عند الهدم */
    let rzTimer = 0;
    const onResize = () => {
      clearTimeout(rzTimer);
      rzTimer = setTimeout(() => { if (state.gm) state.gm.refresh(); }, 150);
    };
    window.addEventListener("resize", onResize);

    ctx.onTeardown(() => {
      state.dead = true;
      if (state.raf) cancelAnimationFrame(state.raf);
      clearTimeout(rzTimer);
      window.removeEventListener("resize", onResize);
      if (state.gm) state.gm.destroy();
      state.gm = null;
    });

    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) أعلى-5 أحياء من العينة — بوسم العينة الحرفي وملاحظة الترتيب، مع
         مبدّل مقياس الترتيب (أسرّة/تشغيلية/بناء): كل صف زر حقيقي يفتح
         بطاقة الحي — المسار المفاتيحي الموازي لنقر الخريطة.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildTopFiveCell(cell, ctx, model) {
    const rel = ctx.release;
    /* وسم العينة وملاحظة الترتيب الحرفيان في السطر الثانوي (سطران بحد
       أقصى والنص الكامل في التلميح) — لا ذيل منفصلاً يزاحم الصفوف الخمسة */
    const res = RH.presenter.layout.card(cell, {
      title: "أعلى 5 أحياء — ضمن العينة",
      sub: rel.neighbourhoods.label + " — " + rel.neighbourhoods.ranking_note,
      cls: "lic-top5-card",
      pad: false,
    });

    const state = { measure: "beds" };
    const chips = h("div", {
      class: "lic-chipbar lic-top5-chips",
      role: "group",
      "aria-label": "مبدّل مقياس ترتيب الأحياء",
    });
    const chipEls = new Map();
    const list = h("div", { class: "lic-rank", role: "list" });

    function renderRows() {
      RH.core.dom.clear(list);
      const M = MEASURES[state.measure];
      const rows = topSample(model, state.measure, 5);
      let maxV = 0;
      for (const r of rows) {
        if (r[state.measure] > maxV) maxV = r[state.measure];
      }
      rows.forEach((n, i) => {
        const v = n[state.measure];
        const sec = model.bySector[n.sector];
        list.appendChild(h("button", {
          class: "lic-rank-row",
          type: "button",
          role: "listitem",
          "data-interactive": "",
          "aria-label": n.name + " — " + M.disp + " "
            + (state.measure === "beds"
              ? fmt.unitAfter(v, "سرير")
              : fmt.noun(v, "licence"))
            + "، الترتيب " + fmt.int(i + 1) + " ضمن العينة — فتح بطاقة الحي",
          onclick: () => openDistrictDetail(ctx, model, {
            name: n.name,
            sectorId: n.sector,
            sample: n,
          }),
        },
          h("span", { class: "lic-rank-idx", "aria-hidden": "true" }, fmt.int(i + 1)),
          h("span", { class: "lic-rank-name" }, n.name),
          h("span", { class: "lic-rank-sector" }, sec ? sec.row.short : ""),
          h("span", { class: "lic-rank-track", "aria-hidden": "true" },
            h("span", {
              class: "lic-rank-fill",
              style: { width: (maxV ? Math.round((v / maxV) * 100) : 0) + "%" },
            }),
          ),
          h("b", { class: "lic-rank-val" }, fmt.int(v)),
        ));
      });
    }

    function setMeasure(mk) {
      state.measure = mk;
      for (const [k, b] of chipEls) {
        b.classList.toggle("on", k === mk);
        b.setAttribute("aria-pressed", k === mk ? "true" : "false");
      }
      renderRows();
    }
    for (const mk of MEASURE_ORDER) {
      const M = MEASURES[mk];
      const btn = h("button", {
        class: "lic-chip" + (mk === state.measure ? " on" : ""),
        type: "button",
        "data-interactive": "",
        "aria-pressed": mk === state.measure ? "true" : "false",
        "aria-label": "ترتيب الأحياء بمقياس " + M.disp,
        onclick: () => setMeasure(mk),
      }, h("span", { class: "lic-chip-name" }, M.short));
      chipEls.set(mk, btn);
      chips.appendChild(btn);
    }

    res.body.appendChild(chips);
    res.body.appendChild(list);
    renderRows();

    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) عمود الرؤى الممتد — insight_panels.sections.licensing حصراً (لا
         اختلاق رؤى: غياب المفتاح يستبدل العمود ببطاقة «قيد الاعتماد»
         الصادقة) + «النمو منذ خط الأساس» (المسار المفاتيحي الموازي
         لبطاقات الأصل) + زر الملحق + سطر حداثة البيانات.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildRail(cell, ctx, model) {
    const rel = ctx.release;
    cell.classList.add("lic-rail-cell");

    const rail = RH.presenter.layout.insightRail(cell, "licensing");
    if (!rail) {
      /* صدق العرض: لا رؤى معتمدة في الإصدار → بطاقة مدمجة موسومة، لا فراغ */
      RH.presenter.layout.pendingCard(cell, {
        label: "رؤى القسم بانتظار الاعتماد",
        note: "لا لوحات رؤى معتمدة لمفتاح التراخيص في هذا الإصدار — "
          + "تُدار من الإدارة ولا تُختلق.",
      });
    }

    /* النمو منذ خط الأساس: ثلاثة صفوف قياس، كل صف زر يفتح بطاقة الأصل */
    const growth = h("div", { class: "lic-growth" },
      h("div", { class: "lic-growth-title" }, "النمو منذ خط الأساس"),
      h("div", { class: "lic-growth-sub" }, rel.meta.comparison_qualifier),
    );
    const detailFor = {
      building: () => buildingDetail(ctx, model),
      operational: () => operationalDetail(ctx, model),
      beds: () => bedsDetail(ctx, model),
    };
    const titleFor = {
      building: "رخص البناء — الأصل والمنهجية",
      operational: "الرخص التشغيلية — الأصل والمنهجية",
      beds: "الطاقة الاستيعابية المرخصة — الأصل والمنهجية",
    };
    for (const mk of ["building", "operational", "beds"]) {
      const m = model.meas[mk];
      growth.appendChild(h("button", {
        class: "lic-growth-row",
        type: "button",
        "data-interactive": "",
        "aria-label": m.def.disp + ": من " + m.def.fV(m.base) + " إلى "
          + m.def.fV(m.cur) + " بنمو " + isoSignedPct(m.growthPct)
          + " — فتح بطاقة الأصل والمنهجية",
        onclick: () => ctx.openDetail(detailFor[mk](), { title: titleFor[mk] }),
      },
        h("span", { class: "lic-growth-k" }, m.def.disp),
        /* داخل عزل LTR يتقدم الحالي نصياً كي يقرأه العربي يميناً→يساراً:
           «الأساس ← الحالي» بصرياً (السهم يشير إلى وجهة النمو) */
        h("span", { class: "lic-growth-v" },
          fmt.iso(m.def.fV(m.cur) + " ← " + m.def.fV(m.base))),
        h("b", { class: "lic-growth-pct" }, isoSignedPct(m.growthPct)),
      ));
    }
    cell.appendChild(growth);

    /* زر الملحق التحليلي: التعمق القانوني بحفظ حالة القسم (عقد §7) */
    cell.appendChild(h("button", {
      class: "lic-appx",
      type: "button",
      "data-interactive": "",
      "aria-label": "فتح الملحق التحليلي: التراخيص — السجل والتحليل",
      onclick: () => ctx.openAppendix("licensing"),
    },
      h("span", {}, "الملحق التحليلي: التراخيص — السجل والتحليل"),
      h("span", { class: "lic-btn-arrow", "aria-hidden": "true" }, "←"),
    ));

    /* سطر حداثة البيانات وتاريخ الحساب — من meta الإصدار حصراً */
    cell.appendChild(h("div", { class: "lic-meta" },
      "البيانات حتى ", h("b", {}, rel.meta.data_as_of),
      " · تاريخ الحساب ", h("b", {}, fmt.date(rel.meta.calculation_date)),
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     13) الملخص الناطق — فقرة مخفية بصرياً تروي اللوحة كاملة لقارئات
         الشاشة (عقد الإتاحة: البديل النصي للوحة بطولتها وأرقامها).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, ctx, model) {
    const rel = ctx.release;
    const mB = model.meas.building;
    const mO = model.meas.operational;
    const mS = model.meas.beds;
    el.appendChild(h("p", { class: "lic-sr-summary" },
      "لوحة التراخيص: بلغت رخص البناء " + fmt.noun(mB.cur, "licence")
      + " بنمو " + fmt.pct(mB.growthPct) + " منذ خط الأساس، والرخص التشغيلية "
      + fmt.noun(mO.cur, "licence") + " بنمو " + fmt.pct(mO.growthPct)
      + "، والطاقة الاستيعابية المرخصة " + fmt.unitAfter(mS.cur, "سرير")
      + " بنمو " + fmt.pct(mS.growthPct) + " — "
      + rel.meta.comparison_qualifier + ". أنواع الإيواء الثلاثة: "
      + model.types.map((t) => t.name + " " + fmt.noun(t.count, "licence")).join("، ")
      + ". اللوحة تعرض المسار التراكمي وتكوين النمو والإصدار الشهري "
      + "والمقارنة القطاعية والتوزيع الجغرافي وأعلى خمسة أحياء ضمن "
      + rel.neighbourhoods.label + ".",
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     14) بناء اللوحة — الهرمية الملزمة: ترويسة ← شريط المؤشرات ← شبكة الرسوم
         (ثلاثة صفوف × 12 عموداً وعمود رؤى ممتد صفين) — داخل el (.dash-body).
         الترتيب البصري RTL: الخلية الأولى أقصى اليمين.
     ══════════════════════════════════════════════════════════════════════════ */
  function build(el, ctx) {
    const rel = ctx.release;
    const model = licModel(rel, ctx.derived);

    /* الترويسة: سياق ذهبي + عنوان + وسم حداثة + سطر الفترة المرجعية */
    RH.presenter.layout.sectionHeader(el, {
      kicker: "منظومة الترخيص",
      title: "التراخيص",
      badge: "بيانات حتى " + rel.meta.data_as_of,
      meta: rel.meta.monitoring_period_label,
    });

    /* الملخص الناطق ثم شريط المؤشرات الأربعة القابلة للنقر */
    buildSrSummary(el, ctx, model);
    buildKpiStrip(el, ctx, model);

    /* الشبكة: 12 عموداً × 3 صفوف؛ قالب الصفوف في licensing.css */
    const g = RH.presenter.layout.grid(el, { cols: 12, cls: "lic-grid" });

    /* الصف الأول: المسار التراكمي (5) + تكوين النمو (4) + الرؤى (3 ممتد صفين) */
    const cCum = g.cell({ span: 5, cls: "lic-cell-cum" });
    const cBridge = g.cell({ span: 4, cls: "lic-cell-bridge" });
    const cRail = g.cell({ span: 3, rows: 2, cls: "lic-cell-rail" });

    /* الصف الثاني: المقارنة القطاعية (5) + الخريطة (4) */
    const cSector = g.cell({ span: 5, cls: "lic-cell-sector" });
    const cGeo = g.cell({ span: 4, cls: "lic-cell-geo" });

    /* الصف الثالث (كامل العرض): الإصدار الشهري (4) + الأنواع (3) + أعلى-5 (5) */
    const cMonthly = g.cell({ span: 4, cls: "lic-cell-monthly" });
    const cFacility = g.cell({ span: 3, cls: "lic-cell-facility" });
    const cTop5 = g.cell({ span: 5, cls: "lic-cell-top5" });

    buildCumulativeCell(cCum, ctx, model);
    buildBridgeCell(cBridge, ctx, model);
    buildRail(cRail, ctx, model);
    buildSectorCell(cSector, ctx, model);
    buildGeoCell(cGeo, ctx, model);
    buildMonthlyCell(cMonthly, ctx, model);
    buildFacilityCell(cFacility, ctx, model);
    buildTopFiveCell(cTop5, ctx, model);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     15) تسجيل القسم — عقد RH.sections.register (order:3، backdrop:"licensing"،
         حالة واحدة بلا خطوات بناء: اللوحة تُقرأ دفعة واحدة كمركز قيادة).
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "licensing",
    order: 3,
    title: "التراخيص",
    kicker: "منظومة الترخيص",
    backdrop: "licensing",
    dim: 0.84,
    steps: 0,
    major: false,
    build,
  });
})();
