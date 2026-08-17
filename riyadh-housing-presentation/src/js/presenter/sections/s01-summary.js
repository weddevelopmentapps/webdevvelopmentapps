/* ════════════════════════════════════════════════════════════════════════════
   s01-summary.js — القسم 1: «الملخص التنفيذي» — أول ما يراه الأمين
   ────────────────────────────────────────────────────────────────────────────
   لوحة القيادة الافتتاحية (عقد V2_CONTRACTS §1 — order:1, id:"summary"):

     ▸ شريط ستة مؤشرات كبرى أعلى الشاشة (كل رقم قابل للنقر → بطاقة «الأصل
       والمنهجية»: القيمة، المصدر بورقته ومرساته، الصيغة للمشتقات، والتحفظات):
         1. إجمالي الطلب التقديري      1.42 مليون سرير
         2. الطاقة الاستيعابية المرخصة  612.4 ألف سرير  (+8.6٪ منذ خط الأساس)
         3. نسبة تغطية الطلب            43.1٪  (المستهدف الاسترشادي 60٪)
         4. العجز في الطاقة             807.6 ألف سرير  (مرجاني — عجز حصراً)
         5. معدل الإشغال                91.7٪
         6. معدل الامتثال               81.6٪  بوسمه الذهبي «قيمة مورّدة —
            بانتظار اعتماد المنهجية» (الذهبي وسم اعتماد حصراً، لا قيمة بيانات)

     ▸ شبكة 3×2 من الرسوم تملأ ما تبقى من الشاشة:
         صف 1: تطور نسبة التغطية (مساحة شهرية تنتهي 43.1٪) ·
                العرض×الطلب قطاعياً (بالعجز المرجاني) ·
                محفظة المبادرات (donut حالات + بطاقة 2/7/9 بقاعدة
                «متأخرة حكماً» المرآة — كل بطاقة تفتح قائمة مبادراتها)
         صف 2: خريطة الرياض المصغرة (layer=coverage، مبدل طبقات، نقر حي →
                بطاقة تفاصيل) · أنواع المخالفات (مصغر) · سيناريوهات العجز (مصغر)

     ▸ عمود رؤى insight_panels.sections.supply + «نبض الرقابة» (إجماليات
       الزيارات/المخالفات/الإغلاقات/المراقبين) + سطر بوابات التحقق.

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل رقم من release.json (عبر ctx.release/ctx.derived) أو
     riyadh-geo.json (عبر ctx.geo) — وكل رقم ظاهر عبر RH.core.fmt حصراً
     (تطابق العدد والمعدود عبر fmt.noun/countNoun، عزل اتجاهي عبر fmt.iso/pct).
   • كل نص إصدار يُبنى بعقد dom.h النصي (textContent) — لا innerHTML لمحتوى
     الإصدار إطلاقاً؛ نصوص التلميحات داخل الرسوم تمر عبر theme.esc في مكتبات
     charts2 ذاتها.
   • منظومة المعنى: أخضر=طاقة مرخصة، رملي=طلب، مرجاني=عجز/مخالفات حصراً،
     ذهبي=مستهدف/خط أساس/وسوم اعتماد حصراً، أزرق=فئة ثانوية.
   • كل الرسوم عبر مُنشئي RH.viz.charts2 القانونيين بمفاتيح مثيلات "summary"
     كي لا تصطدم بمثيلات الأقسام الكاملة، والخريطة عبر RH.viz.geomap.render.
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (أزرار حقيقية أو role=button
     بمعالجة Enter/مسافة) وموسوم data-interactive كي لا يبتلع جهاز التقديم
     ضغطاته؛ Escape يغلق بطاقة التفاصيل (عقد ctx.openDetail في السجل).
   • prefers-reduced-motion محترم: العد التصاعدي عبر RH.viz.motion (يتحول
     لقيمة نهائية فورية)، وانتقالات CSS تُصفَّر في summary.css.
   • التنظيف عبر ctx.onTeardown: هدم الخريطة وفصل مراقب المقاس — مستمعو
     عناصر القسم تسقط مع هدم DOM ذاته.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* نسبة مئوية بنفس تقريب بايثون (نصف لأعلى، منزلة واحدة) — المرآة الرسمية */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /* ──────────────────────────────────────────────────────────────────────────
     ثوابت عرض (لا قيم بيانات): معرفات الأقسام المستهدفة بالتعمق، خريطة وسوم
     حالات الاعتماد، وصيغ العدد والمعدود غير المغطاة في NOUNS المركزية.
     ────────────────────────────────────────────────────────────────────────── */

  /** عناوين الأقسام القانونية المستهدفة بأزرار «اللوحة الكاملة» (عقد §1) */
  const SECTION_TITLES = {
    demand: "العرض والطلب",
    licensing: "التراخيص",
    control: "الرقابة الميدانية",
    map: "خريطة الرياض التفاعلية",
    initiatives: "المبادرات والركائز",
    kpis: "مؤشرات الأداء",
    forecast: "سيناريوهات العجز",
  };

  /** خريطة عرض مقفلة لحالات الاعتماد المعروفة — النص القانوني من العقد حرفياً؛
      حالة غير معروفة تُعرض بمعرفها الخام (صدق لا تجميل) */
  const STATUS_BADGE = {
    pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
    indicative_not_approved: "قيمة استرشادية — غير معتمدة",
    supplied_unvalidated: "سيناريوهات مورّدة — غير معتمدة",
  };

  /** صيغ عدد ومعدود محلية لما لا تغطيه NOUNS المركزية (عقد fmt.countNoun) */
  const LOCAL_NOUNS = {
    sector: { one: "قطاع واحد", two: "قطاعان", few: "قطاعات", many: "قطاعاً", hundred: "قطاع" },
    district: { one: "حي واحد", two: "حيان", few: "أحياء", many: "حياً", hundred: "حي" },
    gate: { one: "بوابة واحدة", two: "بوابتان", few: "بوابات", many: "بوابة", hundred: "بوابة" },
    enabler: { one: "ممكن واحد", two: "ممكنان", few: "ممكنات", many: "ممكناً", hundred: "ممكن" },
  };

  /** أصناف بطاقات حالات المبادرات — دلالية لا زخرفية:
      منجزة=أخضر، جاري العمل=أزرق (فئة ثانوية)، متأخرة=مرجاني (خلل حصراً)،
      لم يتم البدء=رمادي خافت — مرآة ألوان statusDonut في charts-strategy */
  const STATUS_CLS = {
    "منجزة": "pos",
    "جاري العمل": "run",
    "متأخرة": "late",
    "لم يتم البدء": "idle",
  };

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js: فشل فحص لا يُسقط
     اللوحة (الإصدار المنشور اجتاز البوابات أصلاً) بل ينبه في وحدة التحكم.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s01-summary/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) مرآة قاعدة حالة المبادرة — التطابق الحرفي مع generate_data (عقد §3):
        الحالة المعروضة = حالة الملف إن وُجدت؛ وإلا:
          تجاوزت نهايتها دون تسجيل إنجاز  → «متأخرة» (متأخرة حكماً)
          بدأت ولم تنته                    → «جاري العمل»
          لم يحن بدؤها                     → «لم يتم البدء»
        المقارنة على سلاسل ISO مباشرة (YYYY-MM-DD قابلة للترتيب المعجمي).
     ══════════════════════════════════════════════════════════════════════════ */
  function initiativeStatus(ini, calcISO) {
    if (ini.status) return ini.status;
    if (ini.end && ini.end < calcISO) return "متأخرة";
    if (ini.start && ini.start <= calcISO) return "جاري العمل";
    return "لم يتم البدء";
  }

  /** نموذج الاستراتيجية الجاهز للعرض: القوائم والأعداد بحسب الحالة + فهارس
      الركائز — يُبنى مرة عند بناء القسم ويُمرر لكل ما يحتاجه */
  function strategyModel(rel) {
    const st = rel.strategy;
    const calc = rel.meta.calculation_date;
    const order = (st.status_vocabulary || []).slice();
    const lists = {};
    for (const s of order) lists[s] = [];
    for (const ini of st.initiatives) {
      const s = initiativeStatus(ini, calc);
      if (!lists[s]) { order.push(s); lists[s] = []; }
      lists[s].push(ini);
    }
    const counts = {};
    for (const s of order) counts[s] = lists[s].length;

    const pillarName = {};
    let pillarCount = 0, enablerCount = 0;
    for (const p of st.pillars) {
      pillarName[p.id] = p.name;
      if (p.kind === "ممكن") enablerCount += 1; else pillarCount += 1;
    }

    /* الأعداد المثبتة بالبوابات: 2 منجزة / 7 متأخرة / 9 جاري العمل —
       أي انحراف يعني انجراف بيانات أو كسر قاعدة المرآة */
    guard("strategyModel", {
      "18 مبادرة كما في الإصدار": st.initiatives.length === 18,
      "منجزة = 2 (بوابة)": counts["منجزة"] === 2,
      "متأخرة حكماً = 7 (بوابة)": counts["متأخرة"] === 7,
      "جاري العمل = 9 (بوابة)": counts["جاري العمل"] === 9,
      "4 محاور كما في الإصدار": st.pillars.length === 4,
    });

    return { st, calc, order, lists, counts, pillarName, pillarCount, enablerCount };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) أدوات تفاعل مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** جعل عنصر غير-زر قابلاً للتفعيل بالكامل: نقر + Enter + مسافة، بدور
      button ووسم data-interactive (فلا يبتلع جهاز التقديم ضغطاته — عقد §8).
      المستمعون على عناصر القسم ذاته فيسقطون مع هدم DOM (لا تسريب). */
  function activatable(el, onAct, ariaLabel) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-interactive", "");
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    el.addEventListener("click", onAct);
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
        ev.preventDefault();
        ev.stopPropagation();
        onAct();
      }
    });
  }

  /** أزرار التعمق في ترويسة بطاقة:
        section  → «اللوحة الكاملة» عبر جهاز الملاحة (goScene)
        appendix → «الملحق» عبر ctx.openAppendix (عقد §7 — يحفظ حالة القسم،
                   و«التالي/السابق» لا يبلغان الملاحق أبداً)
      كلاهما زر حقيقي قابل للتركيز بلوحة المفاتيح وموسوم data-interactive. */
  function cardActions(res, ctx, o) {
    const head = res.card.querySelector(".card-head");
    if (!head) return;
    const wrap = h("span", { class: "sum-card-actions" });
    if (o.appendix) {
      wrap.appendChild(h("button", {
        class: "sum-link ghost",
        type: "button",
        "data-interactive": "",
        title: "فتح ملحق البيانات التفصيلية",
        "aria-label": "فتح ملحق البيانات التفصيلية",
        onclick: () => ctx.openAppendix(o.appendix),
      },
        h("span", { class: "sum-link-text" }, "الملحق"),
      ));
    }
    if (o.section) {
      const title = SECTION_TITLES[o.section] || o.section;
      wrap.appendChild(h("button", {
        class: "sum-link",
        type: "button",
        "data-interactive": "",
        title: "الانتقال إلى قسم «" + title + "»",
        "aria-label": "الانتقال إلى قسم «" + title + "»",
        onclick: () => RH.presenter.engine.goScene(o.section),
      },
        h("span", { class: "sum-link-text" }, "اللوحة الكاملة"),
        h("span", { class: "sum-link-arrow", "aria-hidden": "true" }, "←"),
      ));
    }
    head.appendChild(wrap);
  }

  /** استدعاء مُنشئ رسم قانوني باسمه مع حماية الضم المتوازي: المكتبات الأربع
      تُبنى بالتوازي مع الأقسام، وغياب مُنشئ واحد (ضم ناقص) يجب ألا يُسقط
      اللوحة كلها — بطاقة صادقة مدمجة بدل الرسم + تنبيه في وحدة التحكم.
      عند اكتمال الضم القانوني هذا المسار لا يُسلك إطلاقاً. */
  function chart2(name, el, su, opts) {
    const mk = RH.viz.charts2 ? RH.viz.charts2[name] : null;
    if (typeof mk !== "function") {
      console.warn("s01-summary: مُنشئ الرسم غير مضموم في هذا البناء — " + name);
      RH.presenter.layout.pendingCard(el, {
        label: "الرسم غير متوفر في هذا البناء",
        note: "المُنشئ " + name + " لم يُضم بعد — أعد البناء عبر build.py",
      });
      return null;
    }
    return mk(el, su, opts);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) بناة بطاقات التفاصيل (تفتح عبر ctx.openDetail — Escape/زر/خلفية تغلق)
        كلها عقد Node مبني بـ dom.h النصي: نصوص الإصدار تدخل textContent
        حصراً فلا مسار HTML إطلاقاً — أمان أقوى من مسار esc ذاته.
     ══════════════════════════════════════════════════════════════════════════ */

  /** سطر مصدر لمقياس خام: اسم المصنف + الورقة + المرساة (بعزل اتجاهي) */
  function rawSource(rel, metric) {
    let name = metric.source_id || "";
    for (const s of rel.sources || []) {
      if (s.id === metric.source_id) { name = s.name; break; }
    }
    return "المصدر: " + name + " — ورقة «" + metric.sheet + "» خلية "
      + fmt.iso(String(metric.anchor));
  }

  /** سطر مصدر لمشتقة: الصيغة المعتمدة بإصدارها (من كتلة derived في الإصدار) */
  function derivedSource(dm) {
    return "قيمة مشتقة — الصيغة المعتمدة: " + fmt.iso(String(dm.formula))
      + " (إصدار الصيغة " + fmt.iso(String(dm.formula_version)) + ")";
  }

  /** جدول كثيف داخل بطاقة تفاصيل: cols نصوص، rows مصفوفات نصوص/عقد —
      يعيد حاوية قابلة للتمرير الداخلي كي لا تفيض البطاقة */
  function denseTable(cols, rows) {
    return h("div", { class: "sum-detail-table" },
      h("table", { class: "table-dense" },
        h("thead", {}, h("tr", {}, cols.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, rows.map((r) => h("tr", {},
          r.map((cell, i) => h(i === 0 ? "th" : "td",
            i === 0 ? { scope: "row" } : {}, cell))))),
      ));
  }

  /** هيكل بطاقة التفاصيل الموحد:
      { num, unit?, tone?, caption?, rows?[{k,v,tone?}], table?, notes?[],
        sources?[], actions?[{label, onAct, aria?}] } */
  function detailShell(o) {
    const box = h("div", { class: "sum-detail" });

    if (o.num != null) {
      box.appendChild(h("div", { class: "sum-detail-hero" },
        h("span", {
          class: "sum-detail-num" + (o.tone ? " " + o.tone : ""),
        }, o.num),
        o.unit ? h("span", { class: "sum-detail-unit" }, o.unit) : null,
      ));
    }
    if (o.caption) {
      box.appendChild(h("p", { class: "sum-detail-cap" }, o.caption));
    }
    if (o.rows && o.rows.length) {
      box.appendChild(h("div", { class: "sum-detail-rows" },
        o.rows.map((r) => h("div", {
          class: "sum-detail-row" + (r.tone ? " " + r.tone : ""),
        },
          h("span", { class: "sum-detail-k" }, r.k),
          h("b", { class: "sum-detail-v" }, r.v),
        ))));
    }
    if (o.table) box.appendChild(o.table);
    for (const n of o.notes || []) {
      box.appendChild(h("p", { class: "sum-detail-note" },
        h("span", { class: "sum-detail-note-dot", "aria-hidden": "true" }), n));
    }
    for (const s of o.sources || []) {
      box.appendChild(h("p", { class: "sum-detail-src" }, s));
    }
    if (o.actions && o.actions.length) {
      box.appendChild(h("div", { class: "sum-detail-actions" },
        o.actions.map((a) => h("button", {
          class: "sum-detail-go",
          type: "button",
          "data-interactive": "",
          "aria-label": a.aria || a.label,
          onclick: a.onAct,
        }, a.label))));
    }
    return box;
  }

  /* ── 3.1) الطلب التقديري: التركيبة والأنشطة الاقتصادية والمصدر ── */
  function demandDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const m = rel.metrics.total_demand;
    const blue = rel.collar.blue;
    const white = rel.collar.white;

    guard("demandDetail", {
      "زرقاء + بيضاء = إجمالي الطلب": blue + white === m.value,
    });

    const econ = rel.economic_activities.slice().sort((a, b) => b.demand - a.demand);
    return detailShell({
      num: fmt.int(m.value),
      unit: "سرير",
      caption: String(m.label),
      rows: [
        { k: "الياقات الزرقاء", v: fmt.unitAfter(blue, "سرير") + " (" + fmt.pct(der.blue_share_pct) + ")" },
        { k: "الياقات البيضاء", v: fmt.unitAfter(white, "سرير") + " (" + fmt.pct(der.white_share_pct) + ")" },
        { k: "أعلى قطاع طلباً", v: sectorByRank(rel, der, "highest_demand") },
      ],
      table: denseTable(
        ["النشاط الاقتصادي", "الطلب", "الحصة"],
        econ.map((r) => [
          String(r.name),
          fmt.unitAfter(r.demand, "سرير"),
          fmt.pct(pctOf(r.demand, m.value)),
        ])),
      sources: [rawSource(rel, m)],
      actions: [{
        label: "لوحة العرض والطلب",
        aria: "الانتقال إلى قسم «العرض والطلب»",
        onAct: () => RH.presenter.engine.goScene("demand"),
      }],
    });
  }

  /** اسم قطاع من سجل الترتيبات المنشور + قيمة طلبه (لا إعادة حساب ترتيب) */
  function sectorByRank(rel, der, rankKey) {
    const id = der.rankings[rankKey];
    for (const s of rel.sectors) {
      if (s.id === id) return String(s.name) + " — " + fmt.unitAfter(s.demand, "سرير");
    }
    return "—";
  }

  /* ── 3.2) الطاقة المرخصة: خط الأساس والنمو والرخص النشطة ── */
  function capacityDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const m = rel.metrics.licensed_beds;
    const base = rel.metrics.baseline_beds;

    return detailShell({
      num: fmt.int(m.value),
      unit: "سرير",
      tone: "pos",
      caption: String(m.label),
      rows: [
        { k: String(rel.meta.baseline_label), v: fmt.unitAfter(base.value, "سرير") },
        {
          k: "النمو منذ خط الأساس",
          v: fmt.iso("+" + fmt.int(der.growth_beds_abs)) + " سرير ("
            + fmt.iso("+" + fmt.dec1(der.growth_beds_pct) + "٪") + ")",
          tone: "pos",
        },
        { k: "الرخص التشغيلية النشطة", v: fmt.noun(rel.metrics.current_operational.value, "licence"), tone: "pos" },
        { k: "رخص البناء القائمة", v: fmt.noun(rel.metrics.current_building.value, "licence") },
        { k: "معدل الإشغال الحالي", v: fmt.pct(der.occupancy_pct) },
      ],
      notes: [String(rel.meta.comparison_qualifier)],
      sources: [rawSource(rel, m), derivedSource(rel.derived.growth_beds_pct)],
      actions: [{
        label: "لوحة التراخيص",
        aria: "الانتقال إلى قسم «التراخيص»",
        onAct: () => RH.presenter.engine.goScene("licensing"),
      }],
    });
  }

  /* ── 3.3) نسبة التغطية: البسط والمقام والمستهدف الاسترشادي بتحفظه الكامل ── */
  function coverageDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const dm = rel.derived.coverage_pct;
    const tgt = rel.coverage_target_indicative || null;

    const rows = [
      { k: "البسط — الطاقة المرخصة", v: fmt.unitAfter(rel.metrics.licensed_beds.value, "سرير") },
      { k: "المقام — إجمالي الطلب", v: fmt.unitAfter(rel.metrics.total_demand.value, "سرير") },
      { k: "الفجوة غير المغطاة", v: fmt.pct(der.uncovered_pct), tone: "neg" },
      { k: "أدنى تغطية قطاعية", v: coverageExtreme(rel, der, "lowest_coverage"), tone: "neg" },
      { k: "أعلى تغطية قطاعية", v: coverageExtreme(rel, der, "highest_coverage"), tone: "pos" },
    ];
    const notes = [];
    if (tgt) {
      rows.push({
        k: String(tgt.label),
        v: fmt.pct(tgt.value),
        tone: "warn",
      });
      notes.push(String(tgt.note));
    }
    return detailShell({
      num: fmt.pct(der.coverage_pct),
      caption: "نسبة تغطية الطلب — حصة الطلب التقديري التي تغطيها الطاقة المرخصة",
      rows,
      notes,
      sources: [derivedSource(dm)],
      actions: [{
        label: "لوحة العرض والطلب",
        aria: "الانتقال إلى قسم «العرض والطلب»",
        onAct: () => RH.presenter.engine.goScene("demand"),
      }],
    });
  }

  /** طرف تغطية قطاعي من الترتيبات المنشورة: «قطاع الجنوب — 34.8٪» */
  function coverageExtreme(rel, der, rankKey) {
    const id = der.rankings[rankKey];
    for (const s of rel.sectors) {
      if (s.id === id) {
        return String(s.name) + " — " + fmt.pct(der.sector[id].coverage_pct);
      }
    }
    return "—";
  }

  /* ── 3.4) العجز: الصيغة + الجدول القطاعي الكامل (طلب/طاقة/تغطية/عجز) ── */
  function deficitDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const dm = rel.derived.deficit_beds;
    const worst = worstDeficitSector(rel, der);

    guard("deficitDetail", {
      "مجموع عجز القطاعات مرصود": rel.sectors
        .every((s) => Number.isFinite(der.sector[s.id].deficit_beds)),
    });

    return detailShell({
      num: fmt.int(der.deficit_beds),
      unit: "سرير",
      tone: "neg",
      caption: "العجز في الطاقة الاستيعابية — ما يتجاوز به الطلبُ التقديري الطاقةَ المرخصة",
      rows: [
        {
          k: "أعمق عجز قطاعي",
          v: String(worst.name) + " — " + fmt.unitAfter(der.sector[worst.id].deficit_beds, "سرير"),
          tone: "neg",
        },
        { k: "أدنى تغطية قطاعية", v: coverageExtreme(rel, der, "lowest_coverage"), tone: "neg" },
      ],
      table: denseTable(
        ["القطاع", "الطلب", "الطاقة المرخصة", "التغطية", "العجز"],
        rel.sectors.map((s) => [
          String(s.short),
          fmt.unitAfter(s.demand, "سرير"),
          fmt.unitAfter(s.beds, "سرير"),
          fmt.pct(der.sector[s.id].coverage_pct),
          fmt.unitAfter(der.sector[s.id].deficit_beds, "سرير"),
        ])),
      sources: [derivedSource(dm)],
      actions: [{
        label: "سيناريوهات العجز",
        aria: "الانتقال إلى قسم «سيناريوهات العجز»",
        onAct: () => RH.presenter.engine.goScene("forecast"),
      }],
    });
  }

  /** القطاع الأعمق عجزاً: أول الأقصى بترتيب الإصدار (قاعدة كسر التعادل
      الموحدة — مرآة byRaw في derive.js) */
  function worstDeficitSector(rel, der) {
    let top = rel.sectors[0];
    for (const s of rel.sectors) {
      if (der.sector[s.id].deficit_beds > der.sector[top.id].deficit_beds) top = s;
    }
    return top;
  }

  /* ── 3.5) الإشغال: المشغول والشاغر بمصدر كل منهما ── */
  function occupancyDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const occ = rel.metrics.occupied_beds;

    guard("occupancyDetail", {
      "مشغول + شاغر = الطاقة المرخصة":
        occ.value + der.vacant_beds === rel.metrics.licensed_beds.value,
    });

    return detailShell({
      num: fmt.pct(der.occupancy_pct),
      tone: "pos",
      caption: "معدل إشغال الطاقة الاستيعابية المرخصة",
      rows: [
        { k: String(occ.label), v: fmt.unitAfter(occ.value, "سرير"), tone: "pos" },
        { k: "الأسرّة الشاغرة", v: fmt.unitAfter(der.vacant_beds, "سرير") },
        { k: "إجمالي الطاقة المرخصة", v: fmt.unitAfter(rel.metrics.licensed_beds.value, "سرير") },
        { k: "حصة الشاغر من الطاقة", v: fmt.pct(pctOf(der.vacant_beds, rel.metrics.licensed_beds.value)) },
      ],
      sources: [rawSource(ctx.release, occ), derivedSource(rel.derived.occupancy_pct)],
      actions: [{
        label: "لوحة العرض والطلب",
        aria: "الانتقال إلى قسم «العرض والطلب»",
        onAct: () => RH.presenter.engine.goScene("demand"),
      }],
    });
  }

  /* ── 3.6) الامتثال: القيمة المورّدة بإفصاحها الثلاثي الكامل ── */
  function complianceDetail(ctx) {
    const rel = ctx.release;
    const comp = rel.compliance;
    let srcName = "";
    if (rel.sources && rel.sources.length) srcName = String(rel.sources[0].name);

    return detailShell({
      num: fmt.pct(comp.value),
      caption: String(comp.label),
      rows: [
        {
          k: "حالة الاعتماد",
          v: STATUS_BADGE[comp.status] || String(comp.status),
          tone: "warn",
        },
        { k: "الزيارات الميدانية خلال الفترة", v: fmt.noun(rel.metrics.total_visits.value, "visit") },
        { k: "المخالفات المسجلة خلال الفترة", v: fmt.noun(rel.metrics.total_violations.value, "violation"), tone: "neg" },
      ],
      notes: [String(comp.note)],
      sources: ["قيمة مورّدة في ملف البيانات" + (srcName ? " " + srcName : "")
        + " — تُعرض كما هي دون اعتماد منهجية"],
      actions: [{
        label: "لوحة الرقابة الميدانية",
        aria: "الانتقال إلى قسم «الرقابة الميدانية»",
        onAct: () => RH.presenter.engine.goScene("control"),
      }],
    });
  }

  /* ── 3.7) قائمة مبادرات حالة واحدة (تفتحها بطاقات 2/7/9) ── */
  function statusDetail(ctx, model, statusName) {
    const list = model.lists[statusName] || [];
    const notes = [];
    if (statusName === "متأخرة") {
      /* قاعدة «متأخرة حكماً» تُعرض نصاً حرفياً من الإصدار — إفصاح المنهجية */
      notes.push(String(model.st.status_rule));
    }
    notes.push("تاريخ الحساب: " + fmt.date(model.calc));

    return detailShell({
      /* البطولة بتطابق العدد والمعدود الكامل: «مبادرتان» / «7 مبادرات» —
         fmt.noun يتكفل بالصيغة الصحيحة فلا فصل رقم/وحدة يكسر التطابق */
      num: fmt.noun(list.length, "initiative"),
      tone: STATUS_CLS[statusName] === "pos" ? "pos"
        : STATUS_CLS[statusName] === "late" ? "neg" : undefined,
      caption: "المبادرات بحالة «" + statusName + "» وفق قاعدة الحالة المعتمدة في خطة العمل",
      table: denseTable(
        ["المعرف", "المبادرة", "المحور", "البداية", "النهاية"],
        list.map((ini) => [
          fmt.iso(String(ini.id)),
          String(ini.name),
          String(model.pillarName[ini.pillar_id] || ini.pillar_id),
          fmt.date(ini.start),
          fmt.date(ini.end),
        ])),
      notes,
      sources: ["المصدر: " + String(model.st.source)],
      actions: [{
        label: "لوحة المبادرات والركائز",
        aria: "الانتقال إلى قسم «المبادرات والركائز»",
        onAct: () => RH.presenter.engine.goScene("initiatives"),
      }],
    });
  }

  /* ── 3.8) بطاقة تفاصيل حي (نقر/Enter على الخريطة المصغرة) ──
     info من عقد geomap.onDistrict: {name, name_en, sector, sectorName,
     sectorRow, sectorDerived, centroid, sample|null} — أسماء الأحياء من ملف
     الحدود العام فتُبنى بعقد النص حصراً. */
  function districtDetail(ctx, info) {
    const rel = ctx.release;
    const rows = [
      { k: "القطاع", v: String(info.sectorName) },
      { k: "طلب القطاع", v: fmt.unitAfter(info.sectorRow.demand, "سرير") },
      { k: "الطاقة المرخصة بالقطاع", v: fmt.unitAfter(info.sectorRow.beds, "سرير"), tone: "pos" },
      { k: "عجز القطاع", v: fmt.unitAfter(info.sectorDerived.deficit_beds, "سرير"), tone: "neg" },
      { k: "مخالفات القطاع", v: fmt.noun(info.sectorRow.violations, "violation"), tone: "neg" },
      { k: "المراقبون بالقطاع", v: fmt.noun(info.sectorRow.monitors, "monitor") },
    ];

    let table = null;
    const notes = [];
    if (info.sample) {
      /* صف عينة الأحياء المطابق — قيم الحي الحقيقية من قاعدة البيانات */
      table = denseTable(
        ["بيان الحي (من العينة)", "القيمة"],
        [
          ["الطاقة الاستيعابية", fmt.unitAfter(info.sample.beds, "سرير")],
          ["رخص البناء", fmt.noun(info.sample.building, "licence")],
          ["الرخص التشغيلية", fmt.noun(info.sample.operational, "licence")],
          ["المخالفات المسجلة", fmt.noun(info.sample.violations, "violation")],
        ]);
      notes.push(String(rel.neighbourhoods.label));
    } else {
      notes.push("لا صف لهذا الحي في عينة قاعدة البيانات — القيم المعروضة قطاعية.");
    }
    notes.push("حدود الأحياء: بيانات عامة (MIT) — مواقع النقاط توضيحية من سجل المنصة");

    return detailShell({
      /* البطولة: تغطية قطاع الحي — عنوان البطاقة يحمل اسم الحي أصلاً
         (opts.title في openDetail) فلا تكرار للاسم في المتن */
      num: fmt.pct(info.sectorDerived.coverage_pct),
      unit: "تغطية " + String(info.sectorName),
      caption: info.name_en ? fmt.iso(String(info.name_en)) : null,
      rows,
      table,
      notes,
      actions: [{
        label: "فتح الخريطة التفاعلية الكاملة",
        aria: "الانتقال إلى قسم «خريطة الرياض التفاعلية»",
        onAct: () => RH.presenter.engine.goScene("map"),
      }],
    });
  }

  /* ── 3.9) الملف القطاعي الكامل (نقر عمود قطاع في رسم العرض×الطلب) ──
     بطاقة قرار عابرة للمجالات: الطلب والطاقة والتغطية والعجز والتراخيص
     والرقابة لقطاع واحد — مع وسوم الصدارة من سجل الترتيبات المنشور. */
  const RANK_LABELS = {
    lowest_coverage: "أدنى تغطية بين القطاعات",
    highest_coverage: "أعلى تغطية بين القطاعات",
    highest_demand: "أعلى طلب بين القطاعات",
    highest_violations: "أعلى مخالفات بين القطاعات",
    highest_building: "أعلى رخص بناء",
    lowest_building: "أدنى رخص بناء",
    highest_operational: "أعلى رخص تشغيلية",
    lowest_operational: "أدنى رخص تشغيلية",
    highest_beds: "أعلى طاقة مرخصة",
    lowest_beds: "أدنى طاقة مرخصة",
  };

  function sectorDetail(ctx, s) {
    const der = ctx.derived;
    const sd = der.sector[s.id];

    /* وسوم الصدارة: كل ترتيب منشور يشير إلى هذا القطاع — من rankings حصراً
       (لا إعادة حساب ترتيب — قاعدة كسر التعادل ملك derive.js) */
    const badges = [];
    for (const key of Object.keys(der.rankings)) {
      if (der.rankings[key] === s.id && RANK_LABELS[key]) {
        badges.push(RANK_LABELS[key]);
      }
    }

    return detailShell({
      num: fmt.pct(sd.coverage_pct),
      unit: "نسبة تغطية القطاع",
      tone: sd.coverage_pct < der.coverage_pct ? "neg" : "pos",
      caption: String(s.name) + " — الملف القطاعي الموحد (طلب/طاقة/تراخيص/رقابة)",
      rows: [
        { k: "الطلب التقديري", v: fmt.unitAfter(s.demand, "سرير") },
        { k: "حصة القطاع من الطلب", v: fmt.pct(sd.demand_share_pct) },
        { k: "الطاقة المرخصة", v: fmt.unitAfter(s.beds, "سرير"), tone: "pos" },
        { k: "العجز", v: fmt.unitAfter(sd.deficit_beds, "سرير"), tone: "neg" },
        { k: "رخص البناء", v: fmt.noun(s.building, "licence") },
        { k: "الرخص التشغيلية", v: fmt.noun(s.operational, "licence") },
        { k: "الزيارات الميدانية", v: fmt.noun(s.visits, "visit") },
        { k: "المخالفات المسجلة", v: fmt.noun(s.violations, "violation"), tone: "neg" },
        { k: "حصة القطاع من المخالفات", v: fmt.pct(sd.violations_share_pct), tone: "neg" },
        { k: "المراقبون", v: fmt.noun(s.monitors, "monitor") },
        { k: "قرارات الإغلاق", v: fmt.noun(s.closures, "decision") },
      ],
      notes: badges.length
        ? ["مواضع الصدارة: " + badges.join("، ") + "."]
        : [],
      actions: [{
        label: "لوحة العرض والطلب",
        aria: "الانتقال إلى قسم «العرض والطلب»",
        onAct: () => RH.presenter.engine.goScene("demand"),
      }, {
        label: "الخريطة التفاعلية",
        aria: "الانتقال إلى قسم «خريطة الرياض التفاعلية»",
        onAct: () => RH.presenter.engine.goScene("map"),
      }],
    });
  }

  /* ── 3.10) ملف شهر واحد (نقر نقطة في رسم تطور التغطية) ──
     مرآة حساب سلسلة التغطية المعتمدة: تراكمي (خط الأساس + إضافات الأسرّة
     الشهرية) ÷ إجمالي الطلب — بنفس تقريب derive.pct، مع نشاط الرقابة
     للشهر نفسه (الفهرسان متطابقان iso ويُحرسان). */
  function monthDetail(ctx, i) {
    const rel = ctx.release;
    const lic = rel.monthly.licensing;
    const mon = rel.monthly.monitoring;
    const dem = rel.metrics.total_demand.value;

    let cum = rel.baseline.beds;
    for (let j = 0; j <= i; j++) cum += lic[j].beds;
    const covered = pctOf(cum, dem);
    const m = lic[i];
    const mm = mon[i] && mon[i].iso === m.iso ? mon[i] : null;

    guard("monthDetail", {
      "سلسلتا الشهر متحاذيتان iso": !!mm,
      "الفهرس ضمن 12 شهراً": i >= 0 && i < lic.length,
    });

    const rows = [
      { k: "صافي إضافة الأسرّة", v: fmt.iso("+" + fmt.int(m.beds)) + " سرير", tone: "pos" },
      { k: "رخص بناء صادرة", v: fmt.noun(m.building, "licence") },
      { k: "رخص تشغيلية صادرة", v: fmt.noun(m.operational, "licence") },
      { k: "الطاقة التراكمية", v: fmt.unitAfter(cum, "سرير"), tone: "pos" },
      { k: "الفجوة المتبقية", v: fmt.unitAfter(dem - cum, "سرير"), tone: "neg" },
    ];
    if (mm) {
      rows.push(
        { k: "الزيارات الميدانية", v: fmt.noun(mm.visits, "visit") },
        { k: "المخالفات المسجلة", v: fmt.noun(mm.violations, "violation"), tone: "neg" },
      );
    }
    return detailShell({
      num: fmt.pct(covered),
      unit: "التغطية بنهاية الشهر",
      caption: String(m.label) + " — قراءة الشهر الواحد عبر التراخيص والرقابة",
      rows,
      sources: [derivedSource(ctx.release.derived.coverage_pct)],
      actions: [{
        label: "لوحة العرض والطلب",
        aria: "الانتقال إلى قسم «العرض والطلب»",
        onAct: () => RH.presenter.engine.goScene("demand"),
      }, {
        label: "لوحة التراخيص",
        aria: "الانتقال إلى قسم «التراخيص»",
        onAct: () => RH.presenter.engine.goScene("licensing"),
      }],
    });
  }

  /* ── 3.11) ملف نوع مخالفة واحد (نقر عمود في رسم أنواع المخالفات) ──
     نفس ترتيب الرسم التنازلي (مرآة الفرز المحلي في violationTypes). */
  function violationTypeDetail(ctx, sortedRows, i) {
    const rel = ctx.release;
    const total = rel.metrics.total_violations.value;
    const r = sortedRows[i];
    let cum = 0;
    for (let j = 0; j <= i; j++) cum += sortedRows[j].count;

    return detailShell({
      num: fmt.noun(r.count, "violation"),
      tone: "neg",
      caption: String(r.name),
      rows: [
        { k: "الترتيب بين الأنواع", v: fmt.int(i + 1) + " من " + fmt.int(sortedRows.length) },
        { k: "الحصة من إجمالي المخالفات", v: fmt.pct(pctOf(r.count, total)), tone: "neg" },
        { k: "تراكمياً حتى هذا النوع", v: fmt.pct(pctOf(cum, total)) },
        { k: "إجمالي المخالفات المعتمد", v: fmt.noun(total, "violation") },
      ],
      sources: ["المصدر: تصنيف أنواع المخالفات في الإصدار المنشور — "
        + String(rel.meta.monitoring_period_label)],
      actions: [{
        label: "لوحة الرقابة الميدانية",
        aria: "الانتقال إلى قسم «الرقابة الميدانية»",
        onAct: () => RH.presenter.engine.goScene("control"),
      }, {
        label: "ملحق الرقابة",
        aria: "فتح ملحق الرقابة التفصيلي",
        onAct: () => ctx.openAppendix("monitoring"),
      }],
    });
  }

  /* ── 3.12) السجل الشهري للرقابة (تفتحه صفوف «نبض الرقابة») ──
     جدول 12 شهراً كاملاً: زيارات ومخالفات كل شهر + صف الإجماليات المعتمدة —
     المجاميع تُحرس ضد الإجماليات المعتمدة (مرآة R1). */
  function controlPulseDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const rows = rel.monthly.monitoring;
    const totVisits = rel.metrics.total_visits.value;
    const totViol = rel.metrics.total_violations.value;

    let sumV = 0, sumF = 0;
    for (const r of rows) { sumV += r.visits; sumF += r.violations; }
    guard("controlPulseDetail", {
      "مجموع الزيارات الشهرية = الإجمالي المعتمد": sumV === totVisits,
      "مجموع المخالفات الشهرية = الإجمالي المعتمد": sumF === totViol,
      "12 شهراً كاملة": rows.length === 12,
    });

    const tableRows = rows.map((r) => [
      String(r.label),
      fmt.noun(r.visits, "visit"),
      fmt.noun(r.violations, "violation"),
    ]);
    tableRows.push([
      "الإجمالي المعتمد",
      fmt.noun(totVisits, "visit"),
      fmt.noun(totViol, "violation"),
    ]);

    return detailShell({
      num: fmt.noun(totVisits, "visit"),
      caption: "النشاط الرقابي الشهري — " + String(rel.meta.monitoring_period_label),
      rows: [
        { k: "متوسط الزيارات الشهري", v: fmt.noun(der.avg_monthly_visits, "visit") },
        { k: "المخالفات خلال الفترة", v: fmt.noun(totViol, "violation"), tone: "neg" },
        { k: "قرارات الإغلاق", v: fmt.noun(rel.metrics.total_closures.value, "decision") },
        { k: "المراقبون الميدانيون", v: fmt.noun(rel.metrics.total_monitors.value, "monitor") },
      ],
      table: denseTable(["الشهر", "الزيارات", "المخالفات"], tableRows),
      sources: [rawSource(rel, rel.metrics.total_visits)],
      actions: [{
        label: "لوحة الرقابة الميدانية",
        aria: "الانتقال إلى قسم «الرقابة الميدانية»",
        onAct: () => RH.presenter.engine.goScene("control"),
      }, {
        label: "ملحق الرقابة",
        aria: "فتح ملحق الرقابة التفصيلي",
        onAct: () => ctx.openAppendix("monitoring"),
      }],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) شريط المؤشرات الكبرى — ستة أرقام بطولية بعقد layout.kpiStrip
        كل مؤشر: قيمة منسقة سلفاً + عدّ تصاعدي عند أول دخول (مفتاح مشهدي
        فلا يعاد العد عند العودة) + بطاقة «الأصل والمنهجية» عند النقر.
     ══════════════════════════════════════════════════════════════════════════ */
  function kpiDefs(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;

    const dem = rel.metrics.total_demand.value;
    const cap = rel.metrics.licensed_beds.value;
    const occ = rel.metrics.occupied_beds.value;
    const deficit = der.deficit_beds;
    const comp = rel.compliance;
    const tgt = rel.coverage_target_indicative || null;
    const worst = worstDeficitSector(rel, der);

    /* متطابقات الإصدار التي يتكئ عليها الشريط كله */
    guard("kpiStrip", {
      "العجز = الطلب − الطاقة": deficit === Math.max(dem - cap, 0),
      "التغطية المنشورة تطابق مرآة الحساب": der.coverage_pct === pctOf(cap, dem),
      "الإشغال المنشور يطابق مرآة الحساب": der.occupancy_pct === pctOf(occ, cap),
    });

    const demParts = fmt.compactParts(dem);
    const capParts = fmt.compactParts(cap);
    const defParts = fmt.compactParts(deficit);

    /* منسقا العد التصاعدي: مقياس ثابت مطابق للوحدة المعروضة (لا قفزات
       «ألف/مليون» أثناء العد) — القيمة النهائية تساوي حتماً القيمة المنسقة */
    const countMillions = (v) => fmt.compactParts(Math.max(v, 1000000)).num;
    const countThousands = (v) => fmt.compactParts(Math.max(v, 10000)).num;
    const countPct = (v) => fmt.pct(v);

    return [
      {
        item: {
          label: "إجمالي الطلب التقديري",
          value: demParts.num,
          unit: demParts.word + " سرير",
          delta: { text: fmt.pct(der.blue_share_pct) + " ياقات زرقاء", tone: "neu" },
          note: fmt.unitAfter(dem, "سرير"),
          countTo: dem, fmt: countMillions, key: "sum:kpi:demand",
        },
        title: "إجمالي الطلب التقديري",
        aria: "إجمالي الطلب التقديري " + fmt.unitAfter(dem, "سرير")
          + " — عرض الأصل والمنهجية",
        detail: () => demandDetail(ctx),
      },
      {
        item: {
          label: "الطاقة الاستيعابية المرخصة",
          value: capParts.num,
          unit: capParts.word + " سرير",
          tone: "pos",
          delta: {
            text: fmt.iso("+" + fmt.dec1(der.growth_beds_pct) + "٪") + " منذ خط الأساس",
            tone: "pos",
          },
          note: fmt.unitAfter(cap, "سرير"),
          countTo: cap, fmt: countThousands, key: "sum:kpi:capacity",
        },
        title: "الطاقة الاستيعابية المرخصة",
        aria: "الطاقة الاستيعابية المرخصة " + fmt.unitAfter(cap, "سرير")
          + " بنمو " + fmt.pct(der.growth_beds_pct) + " منذ خط الأساس — عرض الأصل والمنهجية",
        detail: () => capacityDetail(ctx),
      },
      {
        item: {
          label: "نسبة تغطية الطلب",
          value: fmt.pct(der.coverage_pct),
          delta: tgt
            ? { text: "المستهدف الاسترشادي " + fmt.pct(tgt.value), tone: "warn" }
            : null,
          note: "غير المغطى " + fmt.pct(der.uncovered_pct),
          countTo: der.coverage_pct, fmt: countPct, key: "sum:kpi:coverage",
        },
        title: "نسبة تغطية الطلب",
        aria: "نسبة تغطية الطلب " + fmt.pct(der.coverage_pct)
          + " — عرض الأصل والمنهجية",
        detail: () => coverageDetail(ctx),
      },
      {
        item: {
          label: "العجز في الطاقة",
          value: defParts.num,
          unit: defParts.word + " سرير",
          tone: "neg",
          delta: {
            text: "ذروته في " + String(worst.short) + " "
              + fmt.compact(der.sector[worst.id].deficit_beds),
            tone: "neg",
          },
          note: fmt.unitAfter(deficit, "سرير"),
          countTo: deficit, fmt: countThousands, key: "sum:kpi:deficit",
        },
        title: "العجز في الطاقة الاستيعابية",
        aria: "العجز في الطاقة الاستيعابية " + fmt.unitAfter(deficit, "سرير")
          + " — عرض الأصل والمنهجية",
        detail: () => deficitDetail(ctx),
      },
      {
        item: {
          label: "معدل الإشغال",
          value: fmt.pct(der.occupancy_pct),
          tone: "pos",
          delta: { text: fmt.compact(occ) + " سرير مشغول", tone: "neu" },
          note: "الشاغر " + fmt.unitAfter(der.vacant_beds, "سرير"),
          countTo: der.occupancy_pct, fmt: countPct, key: "sum:kpi:occupancy",
        },
        title: "معدل الإشغال",
        aria: "معدل الإشغال " + fmt.pct(der.occupancy_pct) + " — عرض الأصل والمنهجية",
        detail: () => occupancyDetail(ctx),
      },
      {
        item: {
          label: "معدل الامتثال",
          value: fmt.pct(comp.value),
          note: STATUS_BADGE[comp.status] || String(comp.status),
          countTo: comp.value, fmt: countPct, key: "sum:kpi:compliance",
        },
        title: "معدل الامتثال الرقابي",
        aria: "معدل الامتثال " + fmt.pct(comp.value)
          + " — قيمة مورّدة بانتظار اعتماد المنهجية — عرض التفاصيل",
        detail: () => complianceDetail(ctx),
        flag: true, // وسم ذهبي: القيمة مورّدة غير معتمدة (عقد الإفصاح)
      },
    ];
  }

  /** بناء الشريط وتوصيل التعمق: كل بطاقة مؤشر زر حقيقي بلوحة المفاتيح */
  function buildStrip(el, ctx) {
    const defs = kpiDefs(ctx);
    const strip = RH.presenter.layout.kpiStrip(el, defs.map((d) => d.item));
    const nodes = strip.querySelectorAll(".kpi");
    defs.forEach((d, i) => {
      const node = nodes[i];
      if (!node) return;
      if (d.flag) node.classList.add("sum-kpi-flag");
      node.classList.add("sum-kpi");
      node.title = "عرض الأصل والمنهجية";
      activatable(node, () => ctx.openDetail(d.detail(), { title: d.title }), d.aria);
    });
    return strip;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) خلايا الشبكة — ستة رسوم/بطاقات + عمود الرؤى (شبكة 12 عموداً × صفين)
     ══════════════════════════════════════════════════════════════════════════ */

  /* ── 5.1) تطور نسبة التغطية الشهرية (مساحة تنتهي 43.1٪ بخط 60٪ الذهبي) ── */
  function buildCoverageCell(cell, ctx) {
    const rel = ctx.release;
    const res = RH.presenter.layout.chartCard(cell, {
      title: "تطور نسبة تغطية الطلب",
      sub: String(rel.meta.monitoring_period_label),
    });
    cardActions(res, ctx, { section: "demand", appendix: "demand" });
    const inst = chart2("coverageEvolution", res.body, ctx.su, { key: "summary" });
    if (inst) {
      /* تعمق الشهر الواحد: نقر نقطة على المنحنى يفتح ملف الشهر الموحد
         (المحور معكوس RTL لكن dataIndex يطابق فهرس السلسلة الشهرية) */
      inst.on("click", (p) => {
        if (p && p.componentType === "series"
          && Number.isInteger(p.dataIndex)
          && rel.monthly.licensing[p.dataIndex]) {
          ctx.openDetail(monthDetail(ctx, p.dataIndex),
            { title: String(rel.monthly.licensing[p.dataIndex].label) });
        }
      });
    }
  }

  /* ── 5.2) العرض × الطلب قطاعياً بالعجز المرجاني وتسميات التغطية ── */
  function buildSectorCell(cell, ctx) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "العرض والطلب قطاعياً",
      sub: "الطلب مقابل الطاقة والعجز — بعدد الأسرّة",
    });
    cardActions(res, ctx, { section: "demand", appendix: "demand" });
    /* بلا opts.sort عمداً: ترتيب الأعمدة = ترتيب قطاعات الإصدار القانوني،
       فيبقى dataIndex عند النقر مطابقاً لفهرس rel.sectors مباشرة */
    const inst = chart2("sectorSupplyDemand", res.body, ctx.su, {
      key: "summary",
      deficit: true,
    });
    if (inst) {
      /* تعمق القطاع: نقر أي عمود (طلب/طاقة/عجز) يفتح الملف القطاعي الموحد */
      inst.on("click", (p) => {
        if (p && p.componentType === "series"
          && Number.isInteger(p.dataIndex)
          && ctx.release.sectors[p.dataIndex]) {
          const s = ctx.release.sectors[p.dataIndex];
          ctx.openDetail(sectorDetail(ctx, s), { title: String(s.name) });
        }
      });
    }
  }

  /* ── 5.3) محفظة المبادرات: donut الحالات + بطاقة 2/7/9 التفاعلية ── */
  function buildInitiativesCell(cell, ctx, model) {
    const subText = fmt.noun(model.st.initiatives.length, "initiative")
      + " على " + pillarsPhrase(model);
    const res = RH.presenter.layout.card(cell, {
      title: "محفظة المبادرات",
      sub: subText,
      cls: "sum-ini-card",
    });
    cardActions(res, ctx, { section: "initiatives" });

    /* مضيف الرسم: donut الحالات من مكتبة الاستراتيجية القانونية */
    const host = h("div", { class: "chart-host sum-donut-host" });
    res.body.appendChild(host);
    chart2("statusDonut", host, ctx.su, { key: "summary", compact: true });

    /* بطاقة 2/7/9: شريحة لكل حالة ذات رصيد — كل شريحة تفتح قائمة مبادراتها.
       الترتيب ترتيب مفردات الإصدار (منجزة → جاري → متأخرة → لم يبدأ). */
    const chips = h("div", {
      class: "sum-chips",
      role: "group",
      "aria-label": "حالات المبادرات — انقر حالة لعرض مبادراتها",
    });
    for (const status of model.order) {
      const count = model.counts[status] || 0;
      if (!count) continue;
      const cls = STATUS_CLS[status] || "idle";
      const chip = h("button", {
        class: "sum-chip " + cls,
        type: "button",
        "data-interactive": "",
        "aria-label": fmt.noun(count, "initiative") + " بحالة «" + status + "» — عرض القائمة",
        onclick: () => ctx.openDetail(
          statusDetail(ctx, model, status),
          { title: "المبادرات — " + status }),
      },
        h("span", { class: "sum-chip-dot", "aria-hidden": "true" }),
        h("span", { class: "sum-chip-count" }, fmt.int(count)),
        h("span", { class: "sum-chip-label" }, status),
      );
      chips.appendChild(chip);
    }
    res.body.appendChild(chips);

    /* سطر تركيبة المحاور: 3 ركائز وممكن واحد — من كتلة الاستراتيجية ذاتها */
    res.body.appendChild(h("div", { class: "sum-ini-foot" },
      "تاريخ الحساب: " + fmt.date(model.calc)));
  }

  /** صياغة تركيبة المحاور بتطابق العدد والمعدود: «3 ركائز وممكن واحد» */
  function pillarsPhrase(model) {
    const parts = [];
    if (model.pillarCount) parts.push(fmt.noun(model.pillarCount, "pillar"));
    if (model.enablerCount) parts.push(fmt.countNoun(model.enablerCount, LOCAL_NOUNS.enabler));
    return parts.join(" و") || "—";
  }

  /* ── 5.4) الخريطة المصغرة: choropleth قطاعي layer=coverage + مبدل طبقات ──
     الطبقات الثلاث المتاحة هنا دلالية الألوان بعقدها: التغطية (أخضر تسلسلي)،
     الطلب (رملي نحاسي)، المخالفات (مرجاني حصراً + نقاط التركّز الرقابي).
     اختيار الطبقة يُحفظ في معاملات العنوان (ctx.update) فيصمد عبر العودة. */
  function buildMapCell(cell, ctx, teardown) {
    const districtsCount = countDistricts(ctx.geo);
    const res = RH.presenter.layout.card(cell, {
      title: "الانتشار الجغرافي — قطاعات الرياض",
      sub: districtsCount
        ? "حدود " + fmt.countNoun(districtsCount, LOCAL_NOUNS.district) + " حقيقية"
        : "حدود الأحياء غير مضمنة في هذا البناء",
      cls: "sum-map-card",
      pad: false,
    });
    cardActions(res, ctx, { section: "map" });

    const host = h("div", { class: "sum-map-host" });
    res.body.appendChild(host);

    /* الطبقات القانونية للملخص + استرجاع الاختيار من معاملات العنوان */
    const LAYER_DEFS = [
      { id: "coverage", label: "التغطية", cls: "cov" },
      { id: "demand", label: "الطلب", cls: "dem" },
      { id: "violations", label: "المخالفات", cls: "vio" },
    ];
    const validLayer = (k) => LAYER_DEFS.some((d) => d.id === k);
    let currentLayer = validLayer(ctx.params.mlayer) ? ctx.params.mlayer : "coverage";

    const gm = RH.viz.geomap.render(host, {
      su: ctx.su,
      layer: currentLayer,
      mode: "auto",
      hotspots: currentLayer === "violations",
      sample: true,
      interactive: true,
      onDistrict: (info) => ctx.openDetail(
        districtDetail(ctx, info),
        { title: String(info.name) }),
    });

    /* مبدل الطبقات في ترويسة البطاقة — أزرار حقيقية aria-pressed */
    const head = res.card.querySelector(".card-head");
    const bar = h("div", {
      class: "sum-layerbar",
      role: "group",
      "aria-label": "اختيار طبقة الخريطة المصغرة",
    });
    const btns = [];
    function syncLayerBtns() {
      for (const b of btns) {
        b.setAttribute("aria-pressed", b.dataset.layer === currentLayer ? "true" : "false");
        b.classList.toggle("active", b.dataset.layer === currentLayer);
      }
    }
    function setLayer(id) {
      if (!validLayer(id) || id === currentLayer) return;
      currentLayer = id;
      gm.setLayer(id);
      /* نقاط التركّز الرقابي (مرجانية) مع طبقة المخالفات حصراً —
         خلط النقاط مع طبقات الطاقة/الطلب يلوث الدلالة اللونية */
      gm.setHotspots(id === "violations");
      syncLayerBtns();
      /* لا ctx.update هنا عمداً: إعادة كتابة المعاملات تعيد بناء القسم كاملاً
         في مكانه (عقد المحرك)، بينما setLayer يعيد التلوين بلا هدم — التبديل
         الفوري هو جوهر واجهة geomap. المعامل mlayer يبقى مقروءاً من العنوان
         (روابط عميقة يدوية) دون أن يُكتب من هذا المبدل. */
    }
    for (const d of LAYER_DEFS) {
      const b = h("button", {
        class: "sum-layer-btn " + d.cls,
        type: "button",
        dataset: { layer: d.id },
        "data-interactive": "",
        "aria-pressed": "false",
        "aria-label": "طبقة " + d.label,
        onclick: () => setLayer(d.id),
      },
        h("span", { class: "sum-layer-dot", "aria-hidden": "true" }),
        d.label,
      );
      btns.push(b);
      bar.appendChild(b);
    }
    if (head) head.appendChild(bar);
    syncLayerBtns();

    /* مواءمة مقاس الخريطة: المحرك يبني في مضيف احتياطي ثم يبدّل، وresizeAll
       يخدم ECharts لا Leaflet — مراقب المقاس يستدعي refresh عند أول قياس
       حقيقي وعند كل تغيّر لاحق. يُفصل في التنظيف. */
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

  /* ── 5.5) أنواع المخالفات (مصغر — مرجاني حصراً، تسميات كاملة) ── */
  function buildViolationsCell(cell, ctx) {
    const rel = ctx.release;
    const res = RH.presenter.layout.chartCard(cell, {
      title: "أنواع المخالفات",
      sub: fmt.noun(rel.metrics.total_violations.value, "violation") + " خلال الفترة",
    });
    cardActions(res, ctx, { section: "control", appendix: "monitoring" });
    const inst = chart2("violationTypes", res.body, ctx.su, { key: "summary", compact: true });
    if (inst) {
      /* مرآة فرز المُنشئ ذاته (تنازلي على الخام) — dataIndex يطابقها */
      const sorted = rel.violation_types.slice().sort((a, b) => b.count - a.count);
      inst.on("click", (p) => {
        if (p && p.componentType === "series"
          && Number.isInteger(p.dataIndex)
          && sorted[p.dataIndex]) {
          ctx.openDetail(violationTypeDetail(ctx, sorted, p.dataIndex),
            { title: "نوع المخالفة — تفصيل" });
        }
      });
    }
  }

  /* ── 5.6) سيناريوهات العجز (مصغر — بوسم «مورّدة غير معتمدة» الذهبي) ── */
  function buildForecastCell(cell, ctx) {
    const rel = ctx.release;
    const rows = rel.scenarios.rows;
    const range = rows.length
      ? String(rows[0].label) + " – " + String(rows[rows.length - 1].label)
      : "—";
    const res = RH.presenter.layout.chartCard(cell, {
      title: "سيناريوهات العجز المتوقع",
      sub: range,
    });
    cardActions(res, ctx, { section: "forecast" });
    chart2("forecastScenarios", res.body, ctx.su, { key: "summary", compact: true });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) عمود الرؤى + نبض الرقابة + سطر بوابات التحقق
        الرؤى من release.insight_panels.sections.supply حصراً (عقد insightRail
        — لا اختلاق رؤى)، ونبض الرقابة أربعة إجماليات معتمدة مع تعمق للوحة
        الرقابة، وسطر البوابات من كتلة validation المنشورة.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildRail(cell, ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    cell.classList.add("sum-rail-cell");

    const rail = RH.presenter.layout.insightRail(cell, "supply");
    if (!rail) {
      /* غياب الرؤى (إصدار منقح إدارياً): بطاقة صادقة مدمجة — لا اختلاق */
      RH.presenter.layout.pendingCard(cell, {
        label: "رؤى القسم قيد الاعتماد",
        note: "تُدار لوحات الرؤى التحليلية من الإدارة ولا تُنشر رؤى ملفّقة.",
      });
    }

    /* ── نبض الرقابة الميدانية: أربعة إجماليات معتمدة بسطور سياق ── */
    const visits = rel.metrics.total_visits.value;
    const viols = rel.metrics.total_violations.value;
    const closures = rel.metrics.total_closures.value;
    const monitors = rel.metrics.total_monitors.value;

    guard("controlPulse", {
      "متوسط الزيارات المنشور موجود": Number.isFinite(der.avg_monthly_visits),
      "حصة الجنوب من المخالفات منشورة":
        Number.isFinite(der.sector.south.violations_share_pct),
    });

    const pulseRows = [
      {
        cls: "v-visits",
        label: "الزيارات الميدانية",
        value: fmt.int(visits),
        meta: "متوسط شهري " + fmt.noun(der.avg_monthly_visits, "visit"),
      },
      {
        cls: "v-viol",
        label: "المخالفات المسجلة",
        value: fmt.int(viols),
        meta: "منها " + fmt.pct(der.sector.south.violations_share_pct) + " في الجنوب",
      },
      {
        cls: "v-clo",
        label: "قرارات الإغلاق",
        value: fmt.int(closures),
        meta: fmt.noun(closures, "decision") + " خلال الفترة",
      },
      {
        cls: "v-mon",
        label: "المراقبون الميدانيون",
        value: fmt.int(monitors),
        meta: "على " + fmt.countNoun(rel.sectors.length, LOCAL_NOUNS.sector),
      },
    ];

    const pulse = h("div", { class: "sum-pulse dash-card" },
      h("div", { class: "sum-pulse-head" },
        h("span", { class: "sum-pulse-title" }, "نبض الرقابة الميدانية"),
        h("button", {
          class: "sum-link",
          type: "button",
          "data-interactive": "",
          "aria-label": "الانتقال إلى قسم «الرقابة الميدانية»",
          onclick: () => RH.presenter.engine.goScene("control"),
        },
          h("span", { class: "sum-link-text" }, "اللوحة"),
          h("span", { class: "sum-link-arrow", "aria-hidden": "true" }, "←"),
        ),
      ),
      pulseRows.map((r) => {
        const row = h("div", { class: "sum-pulse-row " + r.cls, title: "عرض السجل الشهري" },
          h("span", { class: "sum-pulse-dot", "aria-hidden": "true" }),
          h("span", { class: "sum-pulse-body" },
            h("span", { class: "sum-pulse-label" }, r.label),
            h("span", { class: "sum-pulse-meta" }, r.meta),
          ),
          h("b", { class: "sum-pulse-value" }, r.value),
        );
        /* كل صف نبض يفتح السجل الشهري الكامل — تعمق موحد للكتلة كلها */
        activatable(row,
          () => ctx.openDetail(controlPulseDetail(ctx),
            { title: "نبض الرقابة الميدانية" }),
          r.label + " " + r.value + " — عرض السجل الشهري");
        return row;
      }),
    );
    cell.appendChild(pulse);

    /* ── سطر بوابات التحقق: ثقة الإصدار المنشور (من كتلة validation) ──
       صيغة مدمجة بسطر واحد لا يلتف أبداً (إصلاح مراجعة الجولة 3: كانت
       الجملة الطويلة تلتف فيطبع سطرها الثاني «2026» تحت شارة الإصدار) —
       الجملة الكاملة في تلميح السطر وفي بطاقات الأصل. */
    if (rel.validation
      && Number.isFinite(rel.validation.gates_passed)
      && Number.isFinite(rel.validation.gates_total)) {
      const v = rel.validation;
      const all = v.gates_passed === v.gates_total;
      const ratio = fmt.iso(fmt.int(v.gates_passed) + "/" + fmt.int(v.gates_total));
      cell.appendChild(h("div", {
        class: "sum-gates",
        title: (all
          ? "اجتاز الإصدار جميع بوابات التحقق " + v.gates_passed + "/" + v.gates_total
          : "اجتاز الإصدار " + v.gates_passed + "/" + v.gates_total
            + " من بوابات التحقق")
          + " — " + fmt.date(v.checked_at),
      },
        h("span", { class: "sum-gates-dot", "aria-hidden": "true" }),
        h("span", { class: "sum-gates-text" },
          "بوابات التحقق: ", h("b", {}, ratio), (all ? " ✓" : ""),
          " — " + fmt.date(v.checked_at)),
      ));
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) الملخص الناطق — فقرة مخفية بصرياً تقرأ اللوحة كلها جملة واحدة
        لقارئات الشاشة قبل الغوص في الرسوم (كل رسم يحمل بديله الجدولي أصلاً
        داخل مكتبات charts2 — هذه الفقرة تمنح «القراءة التنفيذية» ذاتها).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;
    const txt = "لوحة الملخص التنفيذي — بيانات حتى " + String(rel.meta.data_as_of)
      + ": الطلب التقديري " + fmt.unitAfter(rel.metrics.total_demand.value, "سرير")
      + "، والطاقة الاستيعابية المرخصة " + fmt.unitAfter(rel.metrics.licensed_beds.value, "سرير")
      + " بنسبة تغطية " + fmt.pct(der.coverage_pct)
      + "، والعجز " + fmt.unitAfter(der.deficit_beds, "سرير")
      + "، ومعدل الإشغال " + fmt.pct(der.occupancy_pct)
      + "، ومعدل الامتثال المورّد " + fmt.pct(rel.compliance.value)
      + " بانتظار اعتماد المنهجية. المبادرات: "
      /* صيغ العدد والمعدود مع الصفة المطابقة (مثنى «مبادرتان منجزتان») —
         قوالب countNoun كاملة بدل صفة مفردة بعد fmt.noun (إصلاح المراجعة)،
         و«جاري العمل عليها» بلفظ مفردات الحالة المقفلة في الإصدار */
      + fmt.countNoun(model.counts["منجزة"] || 0, {
        zero: "لا مبادرات منجزة", one: "مبادرة منجزة واحدة",
        two: "مبادرتان منجزتان", few: "مبادرات منجزة",
        many: "مبادرة منجزة", hundred: "مبادرة منجزة",
      }) + "، و"
      + fmt.noun(model.counts["جاري العمل"] || 0, "initiative")
      + " جاري العمل عليها، و"
      + fmt.countNoun(model.counts["متأخرة"] || 0, {
        zero: "لا مبادرات متأخرة", one: "مبادرة متأخرة واحدة",
        two: "مبادرتان متأخرتان", few: "مبادرات متأخرة",
        many: "مبادرة متأخرة", hundred: "مبادرة متأخرة",
      }) + " حكماً.";
    el.appendChild(h("p", { class: "sum-sr-summary" }, txt));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) تجميع اللوحة: ترويسة → شريط المؤشرات → الشبكة 12 عموداً × صفين
        صف 1: التغطية (4) · قطاعي (4) · مبادرات (2) · رؤى (2×صفين)
        صف 2: خريطة (4) · مخالفات (3) · سيناريوهات (3) · [الرؤى تكمل]
        الارتفاعان متساويان (grid-template-rows في summary.css)؛ عند ضيق
        استثنائي يتمرر جسم القسم داخلياً فقط (المسرح لا يتمرر أفقياً أبداً).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildGrid(el, ctx, model) {
    const g = RH.presenter.layout.grid(el, { cols: 12, cls: "sum-grid" });

    const cCoverage = g.cell({ span: 4, cls: "sum-cell" });
    const cSector = g.cell({ span: 4, cls: "sum-cell" });
    const cInitiatives = g.cell({ span: 2, cls: "sum-cell" });
    const cRail = g.cell({ span: 2, rows: 2, cls: "sum-cell" });
    const cMap = g.cell({ span: 4, cls: "sum-cell" });
    const cViolations = g.cell({ span: 3, cls: "sum-cell" });
    const cForecast = g.cell({ span: 3, cls: "sum-cell" });

    buildCoverageCell(cCoverage, ctx);
    buildSectorCell(cSector, ctx);
    buildInitiativesCell(cInitiatives, ctx, model);
    buildRail(cRail, ctx);
    buildMapCell(cMap, ctx, ctx.onTeardown);
    buildViolationsCell(cViolations, ctx);
    buildForecastCell(cForecast, ctx);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) تسجيل القسم — عقد RH.sections.register (order:1، backdrop:"summary"،
        دخول مقطعي كبير major كما في الجدول القانوني)
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "summary",
    order: 1,
    title: "الملخص التنفيذي",
    kicker: "القراءة التنفيذية الأولى",
    backdrop: "summary",
    major: true,
    build(el, ctx) {
      const rel = ctx.release;
      const model = strategyModel(rel);

      /* الترويسة: سياق ذهبي + عنوان + وسم حداثة البيانات + فترة الرصد */
      RH.presenter.layout.sectionHeader(el, {
        kicker: "القراءة التنفيذية الأولى",
        title: "الملخص التنفيذي",
        badge: "بيانات حتى " + String(rel.meta.data_as_of),
        meta: "فترة الرصد: " + String(rel.meta.monitoring_period_label),
      });

      /* الملخص الناطق ثم شريط المؤشرات الكبرى الست ثم شبكة الرسوم والرؤى */
      buildSrSummary(el, ctx, model);
      buildStrip(el, ctx);
      buildGrid(el, ctx, model);
    },
  });
})();
