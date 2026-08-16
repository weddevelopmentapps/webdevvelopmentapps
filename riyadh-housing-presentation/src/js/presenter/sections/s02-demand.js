/* ════════════════════════════════════════════════════════════════════════════
   s02-demand.js — القسم 2: «العرض والطلب» — قراءة السوق الكاملة
   ────────────────────────────────────────────────────────────────────────────
   لوحة قيادة كثيفة (عقد V2_CONTRACTS §1 — order:2, id:"demand", backdrop:"demand"):

     ▸ شريط ستة مؤشرات كبرى أعلى الشاشة — كل رقم قابل للنقر يفتح بطاقة
       «الأصل والمنهجية» (القيمة الدقيقة، المصدر بورقته ومرساته للخام،
       الصيغة المعتمدة بإصدارها للمشتقات، والتحفظات كما وردت في الإصدار):
         1. إجمالي الطلب التقديري        1.42 مليون سرير
         2. الطاقة الاستيعابية المرخصة   612.4 ألف سرير  (+8.6٪ منذ خط الأساس)
         3. العجز في الأسرّة              807.6 ألف سرير  (مرجاني — عجز حصراً)
         4. نسبة تغطية الطلب              43.1٪  (المستهدف الاسترشادي 60٪ ذهبياً)
         5. معدل الإشغال                  91.7٪
         6. أسرّة شاغرة                   50,829 سريراً (8.3٪ من الطاقة)

     ▸ شبكة رسوم تملأ ما تبقى من الشاشة (صفان + عمود رؤى ممتد):
         صف 1: العرض×الطلب حسب القطاع (أعمدة مجمعة كاملة بالعجز المرجاني +
                شريط رقاقات القطاعات الخمسة — النقر على عمود أو رقاقة يفتح
                بطاقة تفاصيل القطاع الزجاجية من sector_derived) ·
                تطور نسبة التغطية (مساحة شهرية كبيرة تنتهي 43.1٪ بخطي
                المستهدف الاسترشادي وخط الأساس الذهبيين — نقر نقطة شهرية
                يفتح ملف الشهر الواحد: تراخيصه ورقابته وتراكميه)
         صف 2: الطلب حسب النشاط الاقتصادي (أعمدة أفقية كبيرة بالحصص —
                نقر نشاط يفتح ملفه ضمن ترتيب الأنشطة) ·
                تركيبة الإشغال (مشغول/شاغر — نقرها يفتح بطاقة منهجية الإشغال) ·
                تركيبة الطلب حسب فئة العمالة (ياقات زرقاء/بيضاء — نقرها
                يفتح بطاقة الياقات بمصدريها)

     ▸ ربط تحويم ثنائي الاتجاه: التحويم/التركيز على صف قطاع في عمود الرؤى
       أو رقاقة قطاع يبرز عموده في الرسم البطل ويظهر تلميحه، والتحويم على
       عمود في الرسم يضيء صفه في قائمة الترتيب — سلوك مركز قيادة حقيقي.

     ▸ وصول عميق عبر معاملات المسار (عقد ctx.params):
         ‎#/section/demand?sector=south‎  يفتح بطاقة قطاع الجنوب مباشرة
         ‎#/section/demand?month=2026-03‎ يفتح ملف شهر مارس 2026
       معامل غير صالح يُتجاهل بصمت — لا شاشات خطأ في مسرح العرض.

     ▸ دورة تركيز مفاتيحية مكتملة: إغلاق أي بطاقة تفاصيل (بأي بوابة من
       بواباتها الثلاث) يعيد التركيز إلى العنصر الذي فتحها — مراقب طفرات
       على جذر القسم يُفصل فور الإصابة وعند الهدم.

     ▸ عمود رؤى insight_panels.sections.supply + «ترتيب القطاعات بنسبة
       التغطية» (خمسة أزرار مصفوفة تصاعدياً — المسار المفاتيحي الكامل إلى
       بطاقات القطاعات) + زر الملحق التحليلي + سطر «بيانات حتى».

   بطاقة تفاصيل القطاع (ctx.openDetail — Escape/زر الإغلاق/نقر الخلفية تغلق):
     بطولة نسبة التغطية + أوسمة الترتيب من derived.rankings + أشرطة مقارنة
     (طلب/طاقة/عجز على أساس موحد) + شبكة إحصاءات كاملة (رخص/رقابة/حصص) +
     جدول عينة أحياء القطاع بوسم العينة الحرفي من الإصدار + زر الملحق.

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل رقم من release.json (عبر ctx.release/ctx.derived) —
     وكل رقم ظاهر عبر RH.core.fmt حصراً (تطابق العدد والمعدود عبر
     fmt.noun/countNoun، عزل اتجاهي عبر fmt.iso/fmt.pct).
   • كل نص إصدار يُبنى بعقد dom.h النصي (textContent) — لا innerHTML لمحتوى
     الإصدار إطلاقاً؛ نصوص التلميحات داخل الرسوم تمر عبر theme.esc في مكتبة
     charts2 ذاتها.
   • منظومة المعنى: أخضر=طاقة مرخصة، رملي=طلب، مرجاني=عجز/مخالفات حصراً،
     ذهبي=مستهدف/خط أساس/وسوم اعتماد حصراً، أزرق=فئة تصنيفية ثانوية.
   • كل الرسوم عبر مُنشئي RH.viz.charts2 القانونيين بمفتاح مثيلات "demand"
     كي لا تصطدم بمثيلات الملخص التنفيذي (key:"summary").
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (أزرار حقيقية أو role=button
     بمعالجة Enter/مسافة) وموسوم data-interactive كي لا يبتلع جهاز التقديم
     ضغطاته (عقد الملاحة §8)؛ Escape يغلق بطاقة التفاصيل (عقد ctx.openDetail).
   • prefers-reduced-motion محترم: العد التصاعدي عبر RH.viz.motion (قيمة
     نهائية فورية عند التقليل)، وانتقالات CSS تُصفَّر في demand.css.
   • التنظيف عبر ctx.onTeardown: فصل مستمع نقر مثيل ECharts (المثيل يعمّر في
     سجل الثيم أطول من DOM القسم) — مستمعو عناصر القسم تسقط مع هدم DOM ذاته.
   • 16:9 يتسع دون تمرير عند 1920×1080 بوحدة ‎--su؛ الفيضان الرأسي في وضع
     اللوحة يُحل بتمرير داخلي في جسم القسم حصراً (demand.css).
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* نسبة مئوية بنفس تقريب بايثون (نصف لأعلى، منزلة واحدة) — المرآة الرسمية */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /* ──────────────────────────────────────────────────────────────────────────
     ثوابت عرض (لا قيم بيانات إطلاقاً): صيغ عدد ومعدود محلية، تسميات أوسمة
     الترتيب القطاعي، وخريطة وسوم حالات الاعتماد المعروفة.
     ────────────────────────────────────────────────────────────────────────── */

  /** صيغ عدد ومعدود محلية لما لا تغطيه NOUNS المركزية (عقد fmt.countNoun) */
  const LOCAL_NOUNS = {
    sector: { one: "قطاع واحد", two: "قطاعان", few: "قطاعات", many: "قطاعاً", hundred: "قطاع" },
    district: { one: "حي واحد", two: "حيان", few: "أحياء", many: "حياً", hundred: "حي" },
    activity: { one: "نشاط واحد", two: "نشاطان", few: "أنشطة", many: "نشاطاً", hundred: "نشاط" },
    month: { one: "شهر واحد", two: "شهران", few: "أشهر", many: "شهراً", hundred: "شهر" },
  };

  /** أوسمة الترتيب القطاعي — مرآة مفردات derived.rankings حرفياً.
      النغمة دلالية لا زخرفية: المرجاني لأوسمة الخلل (مخالفات/أدنى تغطية)
      حصراً، الأخضر لما يعبر عن طاقة مرخصة أعلى، والحياد لما سواهما. */
  const RANK_BADGES = {
    lowest_coverage: { text: "أدنى نسبة تغطية بين القطاعات", tone: "neg" },
    highest_coverage: { text: "أعلى نسبة تغطية بين القطاعات", tone: "pos" },
    highest_demand: { text: "الأعلى طلباً على الأسرّة", tone: "neu" },
    highest_violations: { text: "الأعلى في المخالفات المسجلة", tone: "neg" },
    highest_building: { text: "الأعلى في رخص البناء", tone: "pos" },
    lowest_building: { text: "الأدنى في رخص البناء", tone: "neu" },
    highest_operational: { text: "الأعلى في الرخص التشغيلية", tone: "pos" },
    lowest_operational: { text: "الأدنى في الرخص التشغيلية", tone: "neu" },
    highest_beds: { text: "الأعلى طاقة استيعابية مرخصة", tone: "pos" },
    lowest_beds: { text: "الأدنى طاقة استيعابية مرخصة", tone: "neu" },
  };

  /** خريطة عرض مقفلة لحالات الاعتماد المعروفة — النص من العقد حرفياً؛
      حالة غير معروفة تُعرض بمعرفها الخام (صدق لا تجميل) */
  const STATUS_BADGE = {
    pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
    indicative_not_approved: "قيمة استرشادية — غير معتمدة",
    supplied_unvalidated: "سيناريوهات مورّدة — غير معتمدة",
  };

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js: فشل فحص لا يُسقط
     اللوحة (الإصدار المنشور اجتاز البوابات الـ152 أصلاً) بل ينبه في وحدة
     التحكم لالتقاط أي انجراف بيانات مبكراً أثناء التطوير.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s02-demand/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) أدوات صياغة وتفاعل مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** نسبة موجبة موقعة بعزل اتجاهي: ‎+8.6٪‎ — للنمو منذ خط الأساس حصراً */
  function isoSignedPct(v) {
    const sign = v >= 0 ? "+" : "−";
    return fmt.iso(sign + fmt.dec1(Math.abs(v)) + "٪");
  }

  /** قيمة تنفيذية مختصرة مع وحدة: «807.6 ألف سرير» / «50,829 سريراً» */
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
    el.classList.add("dmd-act");
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

  /** سطر مصدر لمشتقة: الصيغة المعتمدة بإصدارها من كتلة derived في الإصدار */
  function derivedSourceLine(dm) {
    return "قيمة مشتقة — الصيغة المعتمدة: " + fmt.iso(String(dm.formula))
      + " (إصدار الصيغة " + fmt.iso(String(dm.formula_version)) + ")";
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) نموذج القطاعات الجاهز للعرض — يُبنى مرة واحدة عند بناء القسم
     ──────────────────────────────────────────────────────────────────────────
     يضم لكل قطاع: صف الإصدار الخام + مشتقاته القطاعية (sector_derived عبر
     ctx.derived.sector — المرآة الحية لكتلة release.derived.sector_derived) +
     أوسمة الترتيب التي يحملها من derived.rankings + صفوف عينة أحيائه.
     ══════════════════════════════════════════════════════════════════════════ */
  function sectorModel(rel, der) {
    const rows = rel.sectors.map((s) => {
      const sd = der.sector[s.id];
      const badges = [];
      for (const key of Object.keys(der.rankings)) {
        if (der.rankings[key] === s.id && RANK_BADGES[key]) {
          badges.push(RANK_BADGES[key]);
        }
      }
      return {
        row: s,
        sd,
        badges,
        sample: rel.neighbourhoods.rows.filter((n) => n.sector === s.id),
      };
    });

    const byId = {};
    for (const r of rows) byId[r.row.id] = r;

    /* الأساس الموحد لأشرطة المقارنة داخل بطاقة القطاع: أقصى طلب قطاعي —
       كل الأطوال تُقاس إليه فتبقى المقارنة بين البطاقات صادقة بصرياً */
    let maxDemand = 0;
    for (const r of rows) {
      if (r.row.demand > maxDemand) maxDemand = r.row.demand;
    }

    /* متطابقات الإصدار التي تتكئ عليها اللوحة كاملة — تنبيه مبكر عند انجراف */
    const dem = rel.metrics.total_demand.value;
    const cap = rel.metrics.licensed_beds.value;
    guard("sectorModel", {
      "خمسة قطاعات كما في الإصدار": rows.length === 5,
      "مجموع طلب القطاعات = إجمالي الطلب":
        rows.reduce((a, r) => a + r.row.demand, 0) === dem,
      "مجموع أسرّة القطاعات = الطاقة المرخصة":
        rows.reduce((a, r) => a + r.row.beds, 0) === cap,
      "مجموع العجز القطاعي = العجز الكلي":
        rows.reduce((a, r) => a + r.sd.deficit_beds, 0) === der.deficit_beds,
      "عينة الأحياء تغطي القطاعات الخمسة":
        rows.every((r) => r.sample.length > 0),
    });

    return { rows, byId, maxDemand };
  }

  /** ترتيب تصاعدي بنسبة التغطية (على الخام coverage_raw — قاعدة الترتيب على
      الخام دائماً) — قائمة الأولوية التدخلية في عمود الرؤى */
  function byCoverageAsc(model) {
    return model.rows.slice()
      .sort((a, b) => a.sd.coverage_raw - b.sd.coverage_raw);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) هيكل بطاقة التفاصيل الموحد — عقد Node مبني بـ dom.h النصي حصراً:
        نصوص الإصدار تدخل textContent فلا مسار HTML إطلاقاً.
        { hero:{num, unit?, label?, tone?}, badges?[{text,tone}], caption?,
          bars?[{label, value, valueText, tone}], rows?[{k, v, tone?}],
          table?{columns, rows, note?}, sources?[], notes?[],
          actions?[{label, onAct, aria?}] }
     ══════════════════════════════════════════════════════════════════════════ */

  /** شريط مقارنة أفقي واحد: تسمية + مسار بامتلاء نسبي + قيمة نصية كاملة.
      العرض نسبة من أساس موحد يمرره المستدعي — الشريط زخرفة مكملة للرقم
      الحقيقي المجاور فلا يحمل دلالة وحده (aria-hidden على المسار). */
  function compareBar(o) {
    const width = Math.max(0, Math.min(100, o.pct));
    return h("div", { class: "dmd-cbar" + (o.tone ? " " + o.tone : "") },
      h("span", { class: "dmd-cbar-k" }, o.label),
      h("span", { class: "dmd-cbar-track", "aria-hidden": "true" },
        h("span", {
          class: "dmd-cbar-fill",
          style: { width: width + "%" },
        }),
      ),
      h("b", { class: "dmd-cbar-v" }, o.valueText),
    );
  }

  /** جدول كثيف داخل بطاقة التفاصيل — حاوية قابلة للتمرير الداخلي كي لا
      تفيض البطاقة (عقد «التمرير داخل المكوّن لا المسرح») */
  function detailTable(t) {
    const wrap = h("div", { class: "dmd-table" },
      h("table", { class: "table-dense" },
        h("thead", {}, h("tr", {},
          t.columns.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, t.rows.map((r) => h("tr", {},
          r.map((cell, i) => h(i === 0 ? "th" : "td",
            i === 0 ? { scope: "row" } : {}, cell))))),
      ));
    if (!t.note) return wrap;
    return h("div", {}, wrap, h("div", { class: "dmd-note" }, t.note));
  }

  /** الهيكل الكامل لبطاقة التفاصيل */
  function detailShell(o) {
    const box = h("div", { class: "dmd-detail" });

    if (o.hero) {
      box.appendChild(h("div", { class: "dmd-hero" },
        h("span", {
          class: "dmd-hero-num" + (o.hero.tone ? " " + o.hero.tone : ""),
        }, o.hero.num),
        o.hero.unit ? h("span", { class: "dmd-hero-unit" }, o.hero.unit) : null,
        o.hero.label ? h("span", { class: "dmd-hero-label" }, o.hero.label) : null,
      ));
    }
    if (o.badges && o.badges.length) {
      box.appendChild(h("div", { class: "dmd-badges" },
        o.badges.map((b) => h("span", {
          class: "dmd-badge" + (b.tone ? " " + b.tone : ""),
        }, b.text))));
    }
    if (o.caption) {
      box.appendChild(h("p", { class: "dmd-cap" }, o.caption));
    }
    if (o.bars && o.bars.length) {
      box.appendChild(h("div", { class: "dmd-cbars" }, o.bars.map(compareBar)));
    }
    if (o.rows && o.rows.length) {
      box.appendChild(h("div", { class: "dmd-rows" },
        o.rows.map((r) => h("div", {
          class: "dmd-row" + (r.tone ? " " + r.tone : ""),
        },
          h("span", { class: "dmd-row-k" }, r.k),
          h("b", { class: "dmd-row-v" }, r.v),
        ))));
    }
    if (o.table) box.appendChild(detailTable(o.table));
    if (o.notes && o.notes.length) {
      box.appendChild(h("div", { class: "dmd-notes" },
        o.notes.map((n) => h("p", { class: "dmd-note" }, n))));
    }
    if (o.sources && o.sources.length) {
      box.appendChild(h("div", { class: "dmd-sources" },
        o.sources.map((s) => h("p", { class: "dmd-src" }, s))));
    }
    if (o.actions && o.actions.length) {
      box.appendChild(h("div", { class: "dmd-actions" },
        o.actions.map((a) => h("button", {
          class: "dmd-btn",
          type: "button",
          "data-interactive": "",
          "aria-label": a.aria || a.label,
          onclick: a.onAct,
        },
          h("span", {}, a.label),
          h("span", { class: "dmd-btn-arrow", "aria-hidden": "true" }, "←"),
        ))));
    }
    return box;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) بطاقة تفاصيل القطاع — قلب تفاعل اللوحة (النقر على عمود/رقاقة/صف رؤى)
     ──────────────────────────────────────────────────────────────────────────
     كل أرقامها من صف الإصدار الخام + sector_derived حصراً: التغطية والعجز
     والحصص الثلاث، رخص البناء/التشغيل والطاقة، وعدة الرقابة كاملة، ثم جدول
     عينة أحياء القطاع بوسم العينة الحرفي وملاحظة الترتيب كما وردا في الإصدار.
     ══════════════════════════════════════════════════════════════════════════ */
  function sectorDetailNode(ctx, model, sectorId) {
    const rel = ctx.release;
    const m = model.byId[sectorId];
    const s = m.row;
    const sd = m.sd;

    /* أشرطة المقارنة الثلاثة على أساس أقصى طلب قطاعي موحد */
    const bars = [
      {
        label: "الطلب",
        pct: pctOf(s.demand, model.maxDemand),
        valueText: fmt.unitAfter(s.demand, "سرير"),
        tone: "demand",
      },
      {
        label: "الطاقة المرخصة",
        pct: pctOf(s.beds, model.maxDemand),
        valueText: fmt.unitAfter(s.beds, "سرير"),
        tone: "supply",
      },
      {
        label: "العجز",
        pct: pctOf(sd.deficit_beds, model.maxDemand),
        valueText: fmt.unitAfter(sd.deficit_beds, "سرير"),
        tone: "deficit",
      },
    ];

    /* شبكة الإحصاءات الكاملة — العدد والمعدود عبر fmt.noun حصراً */
    const rows = [
      { k: "حصة القطاع من طلب المدينة", v: fmt.pct(sd.demand_share_pct) },
      { k: "نسبة تغطية الطلب", v: fmt.pct(sd.coverage_pct) },
      { k: "رخص البناء", v: fmt.noun(s.building, "licence") },
      { k: "الرخص التشغيلية", v: fmt.noun(s.operational, "licence") },
      { k: "المراقبون الميدانيون", v: fmt.noun(s.monitors, "monitor") },
      { k: "الزيارات الرقابية", v: fmt.noun(s.visits, "visit") },
      {
        k: "المخالفات المسجلة",
        v: fmt.noun(s.violations, "violation"),
        tone: "neg",
      },
      { k: "قرارات الإغلاق", v: fmt.noun(s.closures, "decision") },
      { k: "حصة القطاع من المخالفات", v: fmt.pct(sd.violations_share_pct) },
      { k: "حصة القطاع من الزيارات", v: fmt.pct(sd.visits_share_pct) },
    ];

    /* جدول عينة الأحياء: الترتيب تنازلياً على الأسرّة ضمن العينة فقط —
       بملاحظة الترتيب الحرفية من الإصدار (لا ترتيب مدينةً كاملة) */
    const sample = m.sample.slice().sort((a, b) => b.beds - a.beds);
    const table = sample.length ? {
      columns: ["الحي", "أسرّة مرخصة", "رخص بناء", "رخص تشغيلية", "مخالفات"],
      rows: sample.map((n) => [
        n.name,
        fmt.int(n.beds),
        fmt.int(n.building),
        fmt.int(n.operational),
        fmt.int(n.violations),
      ]),
      note: rel.neighbourhoods.label + " — " + rel.neighbourhoods.ranking_note,
    } : null;

    return detailShell({
      hero: {
        num: fmt.pct(sd.coverage_pct),
        label: "نسبة تغطية الطلب في " + s.name,
      },
      badges: m.badges,
      caption: "الطلب " + fmt.unitAfter(s.demand, "سرير")
        + " مقابل طاقة مرخصة " + fmt.unitAfter(s.beds, "سرير")
        + "، بعجز " + fmt.unitAfter(sd.deficit_beds, "سرير") + ".",
      bars,
      rows,
      table,
      notes: [rel.meta.comparison_qualifier],
      sources: [
        "قيم القطاع من ورقة قطاعات الإصدار المنشور؛ المشتقات القطاعية "
        + "(التغطية والعجز والحصص) بصيغ " + fmt.iso("sector_derived")
        + " المعتمدة — مرآة " + fmt.iso("derive.js") + " الحية لكتلة الإصدار.",
      ],
      actions: [{
        label: "الملحق التحليلي: الطلب والقطاعات",
        aria: "فتح الملحق التحليلي للطلب مع حفظ حالة القسم",
        onAct: () => ctx.openAppendix("demand"),
      }],
    });
  }

  /** فتح بطاقة القطاع عبر طبقة التفاصيل الزجاجية للقسم — invoker اختياري
      يستعيد التركيز عند الإغلاق (رقاقة/صف ترتيب/مضيف الرسم) */
  function openSectorDetail(ctx, model, sectorId, invoker) {
    const m = model.byId[sectorId];
    if (!m) return;
    openDetailWithFocusReturn(ctx, invoker || null,
      sectorDetailNode(ctx, model, sectorId), {
        title: m.row.name + " — بطاقة القطاع",
      });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) بطاقات «الأصل والمنهجية» لأرقام الشريط الست — إسناد كامل لكل رقم:
        الخام بورقته ومرساته، والمشتق بصيغته المعتمدة وإصدارها، والتحفظ
        الحرفي حيث ورد (المستهدف الاسترشادي غير المعتمد مثالاً).
     ══════════════════════════════════════════════════════════════════════════ */

  /** 1: إجمالي الطلب التقديري — خام + تفكيك الياقات وجدول الأنشطة كاملاً */
  function demandDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const metric = rel.metrics.total_demand;
    const acts = rel.economic_activities.slice()
      .sort((a, b) => b.demand - a.demand);

    return detailShell({
      hero: { num: fmt.compact(metric.value), unit: "سرير", label: metric.label },
      caption: "القيمة الدقيقة " + fmt.unitAfter(metric.value, "سرير")
        + " موزعة على " + fmt.countNoun(acts.length, LOCAL_NOUNS.activity)
        + " اقتصادية وفئتي عمالة.",
      rows: [
        {
          k: rel.metrics.blue_collar.label,
          v: fmt.unitAfter(rel.collar.blue, "سرير") + " (" + fmt.pct(der.blue_share_pct) + ")",
        },
        {
          k: rel.metrics.white_collar.label,
          v: fmt.unitAfter(rel.collar.white, "سرير") + " (" + fmt.pct(der.white_share_pct) + ")",
        },
      ],
      table: {
        columns: ["النشاط الاقتصادي", "الطلب (سرير)", "من إجمالي الطلب"],
        rows: acts.map((a) => [
          a.name,
          fmt.int(a.demand),
          fmt.pct(pctOf(a.demand, metric.value)),
        ]),
      },
      sources: [
        rawSourceLine(rel, metric),
        rawSourceLine(rel, rel.metrics.blue_collar),
        rawSourceLine(rel, rel.metrics.white_collar),
      ],
    });
  }

  /** 2: الطاقة الاستيعابية المرخصة — خام + نموها منذ خط الأساس */
  function supplyDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const metric = rel.metrics.licensed_beds;
    const base = rel.metrics.baseline_beds;

    return detailShell({
      hero: { num: fmt.compact(metric.value), unit: "سرير", label: metric.label },
      caption: "القيمة الدقيقة " + fmt.unitAfter(metric.value, "سرير") + " — "
        + rel.meta.comparison_qualifier + ".",
      rows: [
        { k: base.label, v: fmt.unitAfter(base.value, "سرير") },
        {
          k: "صافي الإضافة منذ خط الأساس",
          v: fmt.iso("+" + fmt.int(der.growth_beds_abs)) + " سرير",
          tone: "pos",
        },
        { k: "نسبة النمو", v: isoSignedPct(der.growth_beds_pct), tone: "pos" },
        { k: "الأسرّة المشغولة", v: fmt.unitAfter(rel.metrics.occupied_beds.value, "سرير") },
        { k: "الأسرّة الشاغرة", v: fmt.unitAfter(der.vacant_beds, "سرير") },
      ],
      sources: [
        rawSourceLine(rel, metric),
        rawSourceLine(rel, base),
        derivedSourceLine(rel.derived.growth_beds_pct),
      ],
    });
  }

  /** 3: العجز في الأسرّة — مشتق بصيغته + توزيعه القطاعي كاملاً */
  function deficitDetail(ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;
    const dm = rel.derived.deficit_beds;
    const ordered = byCoverageAsc(model);

    return detailShell({
      hero: {
        num: fmt.compact(der.deficit_beds),
        unit: "سرير",
        label: "العجز في الطاقة الاستيعابية المرخصة",
        tone: "neg",
      },
      caption: "القيمة الدقيقة " + fmt.unitAfter(der.deficit_beds, "سرير")
        + " — أي إن " + fmt.pct(der.uncovered_pct)
        + " من الطلب التقديري بلا تغطية مرخصة.",
      rows: [
        { k: "إجمالي الطلب التقديري", v: fmt.unitAfter(rel.metrics.total_demand.value, "سرير") },
        { k: "الطاقة المرخصة", v: fmt.unitAfter(rel.metrics.licensed_beds.value, "سرير") },
        { k: "الطلب غير المغطى", v: fmt.pct(der.uncovered_pct), tone: "neg" },
      ],
      table: {
        columns: ["القطاع", "العجز (سرير)", "نسبة التغطية", "حصة الطلب"],
        rows: ordered.map((m) => [
          m.row.name,
          fmt.int(m.sd.deficit_beds),
          fmt.pct(m.sd.coverage_pct),
          fmt.pct(m.sd.demand_share_pct),
        ]),
        note: "القطاعات مرتبة تصاعدياً بنسبة التغطية — الأدنى تغطية أولاً.",
      },
      sources: [derivedSourceLine(dm)],
    });
  }

  /** 4: نسبة تغطية الطلب — مشتقة + مسارها الشهري كاملاً والمستهدف الاسترشادي
      بوسم حالته الحرفي (الذهبي وسم اعتماد حصراً) */
  function coverageDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const dm = rel.derived.coverage_pct;
    const dem = rel.metrics.total_demand.value;

    /* المسار الشهري بالصيغة المعتمدة حرفياً: خط الأساس + تراكمي الإضافات */
    const monthly = [];
    let cum = rel.baseline.beds;
    for (const mo of rel.monthly.licensing) {
      cum += mo.beds;
      monthly.push({ label: mo.label, cum, pct: pctOf(cum, dem) });
    }
    guard("coverageDetail", {
      "آخر نقطة شهرية = نسبة التغطية المنشورة":
        monthly[monthly.length - 1].pct === der.coverage_pct,
      "التراكمي الأخير = الطاقة المرخصة":
        cum === rel.metrics.licensed_beds.value,
    });

    const basePct = pctOf(rel.baseline.beds, dem);
    const tgt = rel.coverage_target_indicative || null;
    const rows = [
      { k: "تغطية خط الأساس (قبل سبتمبر 2025)", v: fmt.pct(basePct) },
      {
        k: "التحسن خلال " + fmt.countNoun(monthly.length, LOCAL_NOUNS.month),
        /* فرق نسبتين يُقاس بالنقاط المئوية بلا علامة ٪ — كانت الوحدة
           مزدوجة «+3.4٪ نقطة مئوية» (إصلاح المراجعة) */
        v: fmt.iso("+" + fmt.dec1(der.coverage_pct - basePct)) + " نقطة مئوية",
        tone: "pos",
      },
      { k: "الطلب غير المغطى", v: fmt.pct(der.uncovered_pct), tone: "neg" },
    ];
    const badges = [];
    const notes = [];
    if (tgt) {
      rows.push({ k: tgt.label, v: fmt.pct(tgt.value), tone: "gold" });
      badges.push({
        text: STATUS_BADGE[tgt.status] || String(tgt.status),
        tone: "gold",
      });
      notes.push(tgt.note);
    }

    return detailShell({
      hero: { num: fmt.pct(der.coverage_pct), label: "نسبة تغطية الطلب الحالية" },
      badges,
      rows,
      table: {
        columns: ["الشهر", "الطاقة التراكمية (سرير)", "نسبة التغطية"],
        rows: monthly.map((mo) => [mo.label, fmt.int(mo.cum), fmt.pct(mo.pct)]),
      },
      notes,
      sources: [derivedSourceLine(dm)],
    });
  }

  /** 5: معدل الإشغال — مشتق بصيغته + طرفا القسمة */
  function occupancyDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const dm = rel.derived.occupancy_pct;
    const occ = rel.metrics.occupied_beds;

    return detailShell({
      hero: { num: fmt.pct(der.occupancy_pct), label: "معدل إشغال الطاقة المرخصة" },
      caption: "من كل مئة سرير مرخص هناك نحو "
        + fmt.iso(fmt.dec1(der.occupancy_pct)) + " سريراً مشغولاً فعلياً.",
      rows: [
        { k: occ.label, v: fmt.unitAfter(occ.value, "سرير") },
        {
          k: rel.metrics.licensed_beds.label,
          v: fmt.unitAfter(rel.metrics.licensed_beds.value, "سرير"),
        },
        {
          k: "الأسرّة الشاغرة المتبقية",
          v: fmt.unitAfter(der.vacant_beds, "سرير"),
        },
      ],
      sources: [rawSourceLine(ctx.release, occ), derivedSourceLine(dm)],
    });
  }

  /** 6: الأسرّة الشاغرة — مشتقة بصيغتها + قراءتها مقابل حجم العجز */
  function vacantDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const dm = rel.derived.vacant_beds;
    const cap = rel.metrics.licensed_beds.value;

    return detailShell({
      hero: {
        num: fmt.int(der.vacant_beds),
        unit: "سرير",
        label: "الأسرّة الشاغرة في المنشآت المرخصة",
      },
      caption: "الشواغر " + fmt.pct(pctOf(der.vacant_beds, cap))
        + " فقط من الطاقة المرخصة — لا تسد سوى جزء يسير من عجز يبلغ "
        + fmt.unitAfter(der.deficit_beds, "سرير") + ".",
      rows: [
        { k: "الطاقة المرخصة", v: fmt.unitAfter(cap, "سرير") },
        {
          k: "الأسرّة المشغولة",
          v: fmt.unitAfter(rel.metrics.occupied_beds.value, "سرير"),
        },
        { k: "نسبة الشواغر من الطاقة", v: fmt.pct(pctOf(der.vacant_beds, cap)) },
        { k: "معدل الإشغال المقابل", v: fmt.pct(der.occupancy_pct) },
      ],
      sources: [derivedSourceLine(dm)],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5-م) ملف الشهر الواحد — نقر نقطة في رسم تطور التغطية:
        مرآة حساب سلسلة التغطية المعتمدة (خط الأساس + تراكمي الإضافات ÷
        إجمالي الطلب بتقريب derive.pct)، مع نشاط الرقابة للشهر نفسه —
        السلسلتان الشهريتان تُحاذيان على iso ويُحرس التحاذي.
     ══════════════════════════════════════════════════════════════════════════ */
  function monthDetail(ctx, i) {
    const rel = ctx.release;
    const lic = rel.monthly.licensing;
    const mon = rel.monthly.monitoring;
    const dem = rel.metrics.total_demand.value;

    if (i < 0 || i >= lic.length) return null;
    let cum = rel.baseline.beds;
    for (let j = 0; j <= i; j++) cum += lic[j].beds;
    const covered = pctOf(cum, dem);
    const m = lic[i];
    const mm = mon[i] && mon[i].iso === m.iso ? mon[i] : null;

    guard("monthDetail", {
      "سلسلتا الشهر متحاذيتان iso": !!mm,
      "التغطية ضمن مدى سليم": covered > 0 && covered <= 100,
    });

    const rows = [
      {
        k: "صافي إضافة الأسرّة هذا الشهر",
        v: fmt.iso("+" + fmt.int(m.beds)) + " سرير",
        tone: "pos",
      },
      { k: "رخص بناء صادرة", v: fmt.noun(m.building, "licence") },
      { k: "رخص تشغيلية صادرة", v: fmt.noun(m.operational, "licence") },
      { k: "الطاقة التراكمية بنهايته", v: fmt.unitAfter(cum, "سرير") },
      {
        k: "الفجوة المتبقية عن الطلب",
        v: fmt.unitAfter(dem - cum, "سرير"),
        tone: "neg",
      },
    ];
    if (mm) {
      rows.push(
        { k: "الزيارات الميدانية", v: fmt.noun(mm.visits, "visit") },
        {
          k: "المخالفات المسجلة",
          v: fmt.noun(mm.violations, "violation"),
          tone: "neg",
        },
      );
    }

    return detailShell({
      hero: {
        num: fmt.pct(covered),
        label: "نسبة تغطية الطلب بنهاية " + m.label,
      },
      caption: "قراءة الشهر الواحد: إصدارات التراخيص وأثرها التراكمي على "
        + "التغطية، ونشاط الرقابة الموازي في الشهر نفسه.",
      rows,
      sources: [derivedSourceLine(rel.derived.coverage_pct)],
      actions: [{
        label: "الملحق التحليلي: الطلب والقطاعات",
        aria: "فتح الملحق التحليلي للطلب مع حفظ حالة القسم",
        onAct: () => ctx.openAppendix("demand"),
      }],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5-ن) ملف النشاط الاقتصادي الواحد — نقر عمود في رسم الأنشطة:
        قيمة النشاط وحصته وترتيبه ضمن الأنشطة الستة، وأشرطة مقارنة على
        أساس النشاط الأعلى طلباً — كل القيم من جدول الأنشطة في الإصدار.
     ══════════════════════════════════════════════════════════════════════════ */
  function activityDetail(ctx, activityId) {
    const rel = ctx.release;
    const sorted = rel.economic_activities.slice()
      .sort((a, b) => b.demand - a.demand);
    const idx = sorted.findIndex((a) => a.id === activityId);
    if (idx < 0) return null;
    const act = sorted[idx];
    const top = sorted[0];
    const total = rel.metrics.total_demand.value;

    return detailShell({
      hero: {
        num: fmt.compact(act.demand),
        unit: "سرير",
        label: "الطلب المقدر من نشاط «" + act.name + "»",
      },
      caption: "الترتيب " + fmt.int(idx + 1) + " من بين "
        + fmt.countNoun(sorted.length, LOCAL_NOUNS.activity)
        + " اقتصادية مدرجة في الإصدار.",
      bars: [
        {
          label: act.name,
          pct: pctOf(act.demand, top.demand),
          valueText: fmt.unitAfter(act.demand, "سرير"),
          tone: "demand",
        },
        {
          label: top.name + " (الأعلى)",
          pct: 100,
          valueText: fmt.unitAfter(top.demand, "سرير"),
          tone: "demand",
        },
      ],
      rows: [
        { k: "القيمة الدقيقة", v: fmt.unitAfter(act.demand, "سرير") },
        { k: "الحصة من إجمالي الطلب", v: fmt.pct(pctOf(act.demand, total)) },
        { k: "إجمالي الطلب التقديري", v: fmt.unitAfter(total, "سرير") },
      ],
      table: {
        columns: ["النشاط", "الطلب (سرير)", "الحصة"],
        rows: sorted.map((a) => [
          a.name,
          fmt.int(a.demand),
          fmt.pct(pctOf(a.demand, total)),
        ]),
        note: "الأنشطة مرتبة تنازلياً على الطلب الخام.",
      },
      sources: [
        "المصدر: " + sourceName(rel, rel.metrics.total_demand.source_id)
        + " — جدول الأنشطة الاقتصادية كما ورد في الإصدار المنشور.",
      ],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5-س) بطاقة فئتي العمالة — نقر شريط الياقات: القيمتان الخام بمصدريهما
        (ورقة السياق بخليتيها) والحصتان المشتقتان المنشورتان.
     ══════════════════════════════════════════════════════════════════════════ */
  function collarDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const blue = rel.metrics.blue_collar;
    const white = rel.metrics.white_collar;
    const total = rel.metrics.total_demand.value;

    guard("collarDetail", {
      "زرقاء + بيضاء = إجمالي الطلب":
        rel.collar.blue + rel.collar.white === total,
    });

    return detailShell({
      hero: {
        num: fmt.pct(der.blue_share_pct),
        label: "حصة الياقات الزرقاء من إجمالي الطلب",
      },
      caption: "الطلب التقديري " + fmt.unitAfter(total, "سرير")
        + " موزع على فئتي عمالة — الياقات الزرقاء الغالبة بفارق واسع.",
      bars: [
        {
          label: "الياقات الزرقاء",
          pct: der.blue_share_pct,
          valueText: fmt.unitAfter(rel.collar.blue, "سرير"),
          tone: "blue",
        },
        {
          label: "الياقات البيضاء",
          pct: der.white_share_pct,
          valueText: fmt.unitAfter(rel.collar.white, "سرير"),
          tone: "demand",
        },
      ],
      rows: [
        { k: blue.label, v: fmt.unitAfter(blue.value, "سرير") },
        { k: "حصتها", v: fmt.pct(der.blue_share_pct) },
        { k: white.label, v: fmt.unitAfter(white.value, "سرير") },
        { k: "حصتها", v: fmt.pct(der.white_share_pct) },
      ],
      sources: [
        rawSourceLine(rel, blue),
        rawSourceLine(rel, white),
        derivedSourceLine(rel.derived.blue_share_pct),
      ],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) شريط المؤشرات الكبرى — ستة أرقام بطولية بعقد layout.kpiStrip:
        القيم منسقة سلفاً عبر fmt، العد التصاعدي عند أول دخول فقط
        (مفاتيح dmd:kpi:*)، وكل بطاقة قابلة للنقر تفتح بطاقة أصلها.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildKpiStrip(el, ctx, model) {
    const rel = ctx.release;
    const der = ctx.derived;

    const dem = rel.metrics.total_demand.value;
    const cap = rel.metrics.licensed_beds.value;
    const occ = rel.metrics.occupied_beds.value;
    const vacant = der.vacant_beds;
    const deficit = der.deficit_beds;
    const basePct = pctOf(rel.baseline.beds, dem);
    const vacPct = pctOf(vacant, cap);
    const tgt = rel.coverage_target_indicative || null;

    /* متطابقات الشريط: القيم الست المعروضة تُطابق مرايا الإصدار المنشورة */
    guard("kpiStrip", {
      "المشغول + الشاغر = الطاقة المرخصة": occ + vacant === cap,
      "العجز = الطلب − الطاقة": deficit === dem - cap,
      "الشاغر يطابق مشتقة الإصدار المنشورة":
        vacant === rel.derived.vacant_beds.value,
      "العجز يطابق مشتقة الإصدار المنشورة":
        deficit === rel.derived.deficit_beds.value,
      "التغطية تطابق مشتقة الإصدار المنشورة":
        der.coverage_pct === rel.derived.coverage_pct.value,
      "الإشغال يطابق مشتقة الإصدار المنشورة":
        der.occupancy_pct === rel.derived.occupancy_pct.value,
    });

    /* منسقات العد التصاعدي — الرقم وحده يُعد وكلمة المقياس تثبت في الوحدة
       (compactParts) كي لا يقفز عرض البطاقة بين صيغ أثناء العد؛ القيمة
       النهائية تساوي value المنسقة حرفياً (عقد layout.kpiStrip). */
    const countMillions = (v) => fmt.compactParts(Math.max(v, 1000000)).num;
    const countThousands = (v) => fmt.compactParts(Math.max(v, 10000)).num;
    const countPct = (v) => fmt.pct(v);
    const countInt = (v) => fmt.int(v);

    const defs = [
      {
        item: {
          label: "إجمالي الطلب التقديري",
          value: fmt.compactParts(dem).num,
          unit: fmt.compactParts(dem).word + " سرير",
          note: "ياقات زرقاء " + fmt.pct(der.blue_share_pct)
            + " · بيضاء " + fmt.pct(der.white_share_pct),
          countTo: dem, fmt: countMillions, key: "dmd:kpi:demand",
        },
        detail: () => demandDetail(ctx),
        title: "إجمالي الطلب التقديري — الأصل والمنهجية",
      },
      {
        item: {
          label: "الطاقة الاستيعابية المرخصة",
          value: fmt.compactParts(cap).num,
          unit: fmt.compactParts(cap).word + " سرير",
          tone: "pos",
          delta: {
            text: isoSignedPct(der.growth_beds_pct) + " منذ خط الأساس",
            tone: "pos",
          },
          note: rel.meta.baseline_label,
          countTo: cap, fmt: countThousands, key: "dmd:kpi:capacity",
        },
        detail: () => supplyDetail(ctx),
        title: "الطاقة الاستيعابية المرخصة — الأصل والمنهجية",
      },
      {
        item: {
          label: "العجز في الأسرّة",
          value: fmt.compactParts(deficit).num,
          unit: fmt.compactParts(deficit).word + " سرير",
          tone: "neg",
          note: fmt.pct(der.uncovered_pct) + " من الطلب دون تغطية",
          countTo: deficit, fmt: countThousands, key: "dmd:kpi:deficit",
        },
        detail: () => deficitDetail(ctx, model),
        title: "العجز في الأسرّة — الأصل والمنهجية",
      },
      {
        item: {
          label: "نسبة تغطية الطلب",
          value: fmt.pct(der.coverage_pct),
          delta: tgt ? {
            text: "المستهدف الاسترشادي " + fmt.pct(tgt.value),
            tone: "warn",
          } : null,
          note: "من " + fmt.pct(basePct) + " عند خط الأساس",
          countTo: der.coverage_pct, fmt: countPct, key: "dmd:kpi:coverage",
        },
        detail: () => coverageDetail(ctx),
        title: "نسبة تغطية الطلب — الأصل والمنهجية",
      },
      {
        item: {
          label: "معدل الإشغال",
          value: fmt.pct(der.occupancy_pct),
          note: "من الطاقة المرخصة الفعلية",
          countTo: der.occupancy_pct, fmt: countPct, key: "dmd:kpi:occupancy",
        },
        detail: () => occupancyDetail(ctx),
        title: "معدل الإشغال — الأصل والمنهجية",
      },
      {
        item: {
          label: "أسرّة شاغرة",
          value: fmt.int(vacant),
          unit: "سرير",
          note: fmt.pct(vacPct) + " من الطاقة المرخصة",
          countTo: vacant, fmt: countInt, key: "dmd:kpi:vacant",
        },
        detail: () => vacantDetail(ctx),
        title: "الأسرّة الشاغرة — الأصل والمنهجية",
      },
    ];

    const strip = RH.presenter.layout.kpiStrip(el, defs.map((d) => d.item));

    /* كل بطاقة رقم زر حقيقي الوظيفة: نقر/Enter/مسافة يفتح بطاقة الأصل،
       والإغلاق يعيد التركيز إلى البطاقة ذاتها (دورة مفاتيحية مكتملة) */
    Array.from(strip.children).forEach((kpiEl, i) => {
      const d = defs[i];
      if (!d) return;
      activatable(kpiEl, () => {
        openDetailWithFocusReturn(ctx, kpiEl, d.detail(), { title: d.title });
      }, d.item.label + " — " + (d.item.value || "")
        + (d.item.unit ? " " + d.item.unit : "") + "؛ بطاقة الأصل والمنهجية");
    });

    return strip;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) خلايا الرسوم — كل رسم عبر مُنشئه القانوني في RH.viz.charts2 بمفتاح
        المثيل "demand"، والبطاقات عبر layout.chartCard حصراً.
     ══════════════════════════════════════════════════════════════════════════ */

  /** 7-أ: العرض×الطلب حسب القطاع (الرسم البطل) + شريط رقاقات القطاعات:
      النقر على عمود أو رقاقة يفتح بطاقة تفاصيل القطاع الزجاجية.
      الرقاقات هي المسار المفاتيحي الصريح (أزرار حقيقية) بجانب نقر الرسم،
      وتنضم إلى «الرابط» المشترك للتحويم الثنائي مع قائمة الترتيب. */
  function buildSectorCell(cell, ctx, model, linker) {
    const der = ctx.derived;
    const res = RH.presenter.layout.chartCard(cell, {
      title: "العرض والطلب حسب القطاع",
      sub: "بالأسرّة — انقر قطاعاً لبطاقة تفاصيله",
      cls: "dmd-sector-card",
    });

    const chart = RH.viz.charts2.sectorSupplyDemand(res.body, ctx.su, {
      key: "demand",
      deficit: true,
    });
    linker.chart = chart;

    /* نقر عمود القطاع → بطاقة التفاصيل. الترتيب القانوني للإصدار محفوظ في
       الرسم (بلا sort) فيصح الفهرس مباشرة على مصفوفة القطاعات؛ الإغلاق
       يعيد التركيز إلى مضيف الرسم (القابل للتركيز بعقد charts2). */
    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      const row = ctx.release.sectors[p.dataIndex];
      if (row) openSectorDetail(ctx, model, row.id, res.body);
    });

    /* شريط الرقاقات أسفل الرسم: زر لكل قطاع بنسبة تغطيته المباشرة */
    const chipbar = h("div", {
      class: "dmd-chipbar",
      role: "group",
      "aria-label": "بطاقات تفاصيل القطاعات الخمسة",
    });
    for (const m of model.rows) {
      const chip = h("button", {
        class: "dmd-chip",
        type: "button",
        "data-interactive": "",
        "aria-label": "تفاصيل " + m.row.name + " — التغطية "
          + fmt.pct(m.sd.coverage_pct),
        onclick: (ev) => openSectorDetail(ctx, model, m.row.id,
          ev.currentTarget),
      },
        h("span", { class: "dmd-chip-name" }, m.row.short),
        h("b", { class: "dmd-chip-val" }, fmt.pct(m.sd.coverage_pct)),
      );
      linker.chips.set(m.row.id, chip);
      chipbar.appendChild(chip);
    }
    res.card.appendChild(chipbar);

    /* سطر قراءة موجز في ذيل البطاقة — من derived.rankings حصراً */
    const worst = model.byId[der.rankings.lowest_coverage];
    const best = model.byId[der.rankings.highest_coverage];
    res.card.appendChild(h("div", { class: "dmd-cardfoot" },
      "أدنى تغطية: ", h("b", {}, worst.row.short),
      " " + fmt.pct(worst.sd.coverage_pct) + " · أعلى تغطية: ",
      h("b", {}, best.row.short), " " + fmt.pct(best.sd.coverage_pct),
    ));
    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7-و) الرابط المشترك — تحويم ثنائي الاتجاه بين الرسم البطل وعناصر DOM
        القطاعية (رقاقات + صفوف الترتيب):
        • تحويم/تركيز صف أو رقاقة → إبراز عمود القطاع وإظهار تلميحه المحوري.
        • تحويم عمود في الرسم → إضاءة صف القطاع ورقاقته (صنف .hl).
        مستمعو DOM يسقطون مع هدم القسم؛ مستمعا مثيل ECharts يُفصلان صراحة
        (المثيل يعمّر في سجل الثيم) — عقد ctx.onTeardown.
     ══════════════════════════════════════════════════════════════════════════ */
  function makeLinker() {
    return { chart: null, chips: new Map(), rows: new Map() };
  }

  function wireSectorLinking(ctx, model, linker) {
    const chart = linker.chart;
    if (!chart) return;
    const ids = ctx.release.sectors.map((s) => s.id);

    /* اتجاه DOM → رسم: إبراز + تلميح محوري على فهرس القطاع */
    function focusSector(sectorId) {
      const i = ids.indexOf(sectorId);
      if (i < 0 || chart.isDisposed()) return;
      chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex: i });
      chart.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: i });
    }
    function blurSector(sectorId) {
      const i = ids.indexOf(sectorId);
      if (i < 0 || chart.isDisposed()) return;
      chart.dispatchAction({ type: "downplay", seriesIndex: 0, dataIndex: i });
      chart.dispatchAction({ type: "hideTip" });
    }
    function wireDomSide(map) {
      for (const [sectorId, el] of map) {
        el.addEventListener("mouseenter", () => focusSector(sectorId));
        el.addEventListener("mouseleave", () => blurSector(sectorId));
        el.addEventListener("focus", () => focusSector(sectorId));
        el.addEventListener("blur", () => blurSector(sectorId));
      }
    }
    wireDomSide(linker.chips);
    wireDomSide(linker.rows);

    /* اتجاه رسم → DOM: إضاءة الصف والرقاقة المطابقين */
    function setHl(sectorId, on) {
      const row = linker.rows.get(sectorId);
      const chip = linker.chips.get(sectorId);
      if (row) row.classList.toggle("hl", on);
      if (chip) chip.classList.toggle("hl", on);
    }
    let lastHover = null;
    const onOver = (p) => {
      if (!p || p.componentType !== "series") return;
      const id = ids[p.dataIndex];
      if (!id) return;
      if (lastHover && lastHover !== id) setHl(lastHover, false);
      lastHover = id;
      setHl(id, true);
    };
    const onOut = () => {
      if (lastHover) setHl(lastHover, false);
      lastHover = null;
    };
    chart.on("mouseover", onOver);
    chart.on("mouseout", onOut);
    chart.on("globalout", onOut);
    ctx.onTeardown(() => {
      if (chart.isDisposed()) return;
      chart.off("mouseover", onOver);
      chart.off("mouseout", onOut);
      chart.off("globalout", onOut);
    });
  }

  /** 7-ب: تطور نسبة التغطية — المساحة الشهرية الكبيرة بخطي المستهدف
      الاسترشادي وخط الأساس الذهبيين (الذهبي لهما حصراً).
      نقر نقطة شهرية يفتح ملف الشهر الواحد. */
  function buildCoverageCell(cell, ctx) {
    const rel = ctx.release;
    const res = RH.presenter.layout.chartCard(cell, {
      title: "تطور نسبة تغطية الطلب",
      sub: rel.meta.monitoring_period_label + " — تنتهي عند "
        + fmt.pct(ctx.derived.coverage_pct) + "؛ انقر شهراً لملفه",
      cls: "dmd-coverage-card",
    });
    const chart = RH.viz.charts2.coverageEvolution(res.body, ctx.su, {
      key: "demand",
      baseline: true,
    });
    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series" || p.seriesType !== "line") return;
      const node = monthDetail(ctx, p.dataIndex);
      if (!node) return;
      openDetailWithFocusReturn(ctx, res.body, node, {
        title: rel.monthly.licensing[p.dataIndex].label + " — ملف الشهر",
      });
    });

    /* ذيل البطاقة: نص الرؤية المعتمدة الموجزة (s03) كما ورد حرفياً —
       يُعرض فقط بحالة الاعتماد approved_brief (لا نص غير معتمد) */
    const insight = rel.insights && rel.insights.s03;
    if (insight && insight.status === "approved_brief") {
      res.card.appendChild(h("div", { class: "dmd-cardfoot" }, insight.text));
    }
    return res;
  }

  /** 7-ج: الطلب حسب النشاط الاقتصادي — الأعمدة الأفقية الكبيرة بالحصص.
      نقر عمود نشاط يفتح ملفه ضمن ترتيب الأنشطة (الترتيب التنازلي على
      الخام مطابق لترتيب المُنشئ القانوني ذاته). */
  function buildEconCell(cell, ctx) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "الطلب حسب النشاط الاقتصادي",
      sub: "بالأسرّة وحصة كل نشاط — انقر نشاطاً لملفه",
      cls: "dmd-econ-card",
    });
    const chart = RH.viz.charts2.econBars(res.body, ctx.su, {
      key: "demand",
      share: true,
    });
    const sorted = ctx.release.economic_activities.slice()
      .sort((a, b) => b.demand - a.demand);
    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      const act = sorted[p.dataIndex];
      if (!act) return;
      const node = activityDetail(ctx, act.id);
      if (!node) return;
      openDetailWithFocusReturn(ctx, res.body, node,
        { title: act.name + " — ملف النشاط" });
    });

    /* ذيل البطاقة: قراءة الصدارة من الجدول ذاته — لا نص حر */
    const top = sorted[0];
    const total = ctx.release.metrics.total_demand.value;
    res.card.appendChild(h("div", { class: "dmd-cardfoot" },
      "يتصدر ", h("b", {}, top.name), " بواقع "
      + fmt.unitAfter(top.demand, "سرير") + " ("
      + fmt.pct(pctOf(top.demand, total)) + " من إجمالي الطلب)",
    ));
    return res;
  }

  /** 7-د: تركيبة الإشغال — مشغول/شاغر من الطاقة المرخصة (بلا صف الياقات:
      لتركيبة الطلب رسمها المستقل المجاور فلا تكرار للسلسلة ذاتها).
      نقر الشريط يفتح بطاقة منهجية الإشغال. */
  function buildOccupancyCell(cell, ctx) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "تركيبة الإشغال",
      sub: "مشغول مقابل شاغر من الطاقة المرخصة",
      cls: "dmd-occupancy-card",
    });
    const chart = RH.viz.charts2.occupancyComposition(res.body, ctx.su, {
      key: "demand",
      collar: false,
    });
    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      openDetailWithFocusReturn(ctx, res.body, occupancyDetail(ctx),
        { title: "معدل الإشغال — الأصل والمنهجية" });
    });

    /* جدول رقمي ثلاثي الأعمدة تحت الشريط — كثافة تحليلية بدل شريط وحيد
       عملاق (إصلاح المراجعة: «كثافة معلومات شبه معدومة») */
    const rel = ctx.release;
    const der = ctx.derived;
    const cap = rel.metrics.licensed_beds.value;
    res.card.appendChild(miniCompTable([
      ["أسرّة مشغولة", fmt.int(rel.metrics.occupied_beds.value),
        fmt.pct(der.occupancy_pct)],
      ["أسرّة شاغرة", fmt.int(der.vacant_beds),
        fmt.pct(pctOf(der.vacant_beds, cap))],
      ["إجمالي الطاقة المرخصة", fmt.int(cap), fmt.pct(100)],
    ]));
    return res;
  }

  /** جدول تركيبة مصغر (الفئة · سرير · الحصة) — قوالب نصية عبر fmt حصراً */
  function miniCompTable(rows) {
    const tbl = h("table", { class: "dmd-mini-table" },
      h("thead", {}, h("tr", {},
        h("th", { scope: "col" }, "الفئة"),
        h("th", { scope: "col" }, "سرير"),
        h("th", { scope: "col" }, "الحصة"),
      )),
    );
    const tb = h("tbody", {});
    for (const r of rows) {
      tb.appendChild(h("tr", {},
        h("th", { scope: "row" }, r[0]),
        h("td", {}, r[1]),
        h("td", {}, r[2]),
      ));
    }
    tbl.appendChild(tb);
    return tbl;
  }

  /** 7-هـ: تركيبة الطلب حسب فئة العمالة — الشريط المكدس الثنائي
      (أزرق=الياقات الزرقاء بدلالته الوحيدة، رملي=البيضاء).
      نقر أي شريحة يفتح بطاقة الفئتين بمصدريهما. */
  function buildCollarCell(cell, ctx) {
    const res = RH.presenter.layout.chartCard(cell, {
      title: "تركيبة الطلب حسب فئة العمالة",
      sub: "جزء من كل — القيم الكاملة في التلميح",
      cls: "dmd-collar-card",
    });
    const chart = RH.viz.charts2.demandCollarSplit(res.body, ctx.su, {
      key: "demand",
      compact: true,
    });
    wireChartClick(ctx, chart, (p) => {
      if (!p || p.componentType !== "series") return;
      openDetailWithFocusReturn(ctx, res.body, collarDetail(ctx),
        { title: "فئتا العمالة — الأصل والمنهجية" });
    });

    /* جدول رقمي ثلاثي الأعمدة تحت الشريط — مرآة معالجة بطاقة الإشغال */
    const rel = ctx.release;
    const der = ctx.derived;
    res.card.appendChild(miniCompTable([
      ["الياقات الزرقاء", fmt.int(rel.collar.blue), fmt.pct(der.blue_share_pct)],
      ["الياقات البيضاء", fmt.int(rel.collar.white), fmt.pct(der.white_share_pct)],
      ["إجمالي الطلب التقديري",
        fmt.int(rel.metrics.total_demand.value), fmt.pct(100)],
    ]));
    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) عمود الرؤى الممتد — insight_panels.sections.supply حصراً (لا اختلاق
        رؤى: غياب المفتاح يستبدل العمود ببطاقة «قيد الاعتماد» الصادقة) +
        «ترتيب القطاعات بنسبة التغطية» + زر الملحق + سطر حداثة البيانات.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildRail(cell, ctx, model, linker) {
    const rel = ctx.release;
    cell.classList.add("dmd-rail-cell");

    const rail = RH.presenter.layout.insightRail(cell, "supply");
    if (!rail) {
      /* صدق العرض: لا رؤى معتمدة في الإصدار → بطاقة مدمجة موسومة، لا فراغ */
      RH.presenter.layout.pendingCard(cell, {
        label: "رؤى القسم بانتظار الاعتماد",
        note: "لا لوحات رؤى معتمدة لمفتاح العرض والطلب في هذا الإصدار — "
          + "تُدار من الإدارة ولا تُختلق.",
      });
    }

    /* قائمة الأولوية التدخلية: القطاعات تصاعدياً بنسبة التغطية — كل صف زر
       حقيقي يفتح بطاقة القطاع (المسار المفاتيحي الموازي لنقر الرسم) */
    const ordered = byCoverageAsc(model);
    const rank = h("div", { class: "dmd-rank" },
      h("div", { class: "dmd-rank-title" }, "ترتيب القطاعات بنسبة التغطية"),
      h("div", { class: "dmd-rank-sub" }, "تصاعدياً — الأدنى تغطية أولاً"),
    );
    for (const m of ordered) {
      const rowBtn = h("button", {
        class: "dmd-rank-row",
        type: "button",
        "data-interactive": "",
        "aria-label": m.row.name + ": التغطية " + fmt.pct(m.sd.coverage_pct)
          + " والعجز " + fmt.unitAfter(m.sd.deficit_beds, "سرير")
          + " — فتح بطاقة القطاع",
        onclick: (ev) => openSectorDetail(ctx, model, m.row.id,
          ev.currentTarget),
      },
        h("span", { class: "dmd-rank-name" }, m.row.short),
        h("span", { class: "dmd-rank-track", "aria-hidden": "true" },
          h("span", {
            class: "dmd-rank-fill",
            style: { width: Math.max(0, Math.min(100, m.sd.coverage_pct)) + "%" },
          }),
        ),
        h("b", { class: "dmd-rank-pct" }, fmt.pct(m.sd.coverage_pct)),
        h("span", { class: "dmd-rank-deficit" },
          "عجز " + fmt.compact(m.sd.deficit_beds)),
      );
      linker.rows.set(m.row.id, rowBtn);
      rank.appendChild(rowBtn);
    }
    cell.appendChild(rank);

    /* زر الملحق التحليلي: التعمق القانوني بحفظ حالة القسم (عقد §7) */
    cell.appendChild(h("button", {
      class: "dmd-appx",
      type: "button",
      "data-interactive": "",
      "aria-label": "فتح الملحق التحليلي: الطلب — التفاصيل والتحليل",
      onclick: () => ctx.openAppendix("demand"),
    },
      h("span", {}, "الملحق التحليلي: الطلب — التفاصيل والتحليل"),
      h("span", { class: "dmd-btn-arrow", "aria-hidden": "true" }, "←"),
    ));

    /* سطر حداثة البيانات وتاريخ الحساب — من meta الإصدار حصراً */
    cell.appendChild(h("div", { class: "dmd-meta" },
      "البيانات حتى ", h("b", {}, rel.meta.data_as_of),
      " · تاريخ الحساب ", h("b", {}, fmt.date(rel.meta.calculation_date)),
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8-ب) ملخص ناطق للوحة كاملة — منطقة مخفية بصرياً تقرأ الأرقام الست
        بترتيبها لقارئات الشاشة قبل الغوص في الرسوم (لكل رسم بديله الجدولي
        الخاص داخل مكتبة charts2 — srTable).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    el.appendChild(h("p", {
      class: "dmd-sr",
      role: "note",
      "aria-label": "ملخص لوحة العرض والطلب",
    },
      "ملخص اللوحة: إجمالي الطلب التقديري "
      + fmt.unitAfter(rel.metrics.total_demand.value, "سرير")
      + "، والطاقة الاستيعابية المرخصة "
      + fmt.unitAfter(rel.metrics.licensed_beds.value, "سرير")
      + "، بعجز " + fmt.unitAfter(der.deficit_beds, "سرير")
      + " ونسبة تغطية " + fmt.pct(der.coverage_pct)
      + ". معدل الإشغال " + fmt.pct(der.occupancy_pct)
      + " والأسرّة الشاغرة " + fmt.noun(der.vacant_beds, "bed")
      + ". البيانات حتى " + rel.meta.data_as_of + ".",
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8-ج) الوصول العميق عبر معاملات المسار (عقد ctx.params — سلاسل خام):
        ‎#/section/demand?sector=south‎ يفتح بطاقة القطاع مباشرة، و
        ‎?month=2026-03‎ يفتح ملف الشهر — روابط قابلة للمشاركة من الملاحق
        والتقارير. معامل غير صالح يُتجاهل بصمت (لا شاشة خطأ في العرض).
     ══════════════════════════════════════════════════════════════════════════ */
  function honourDeepLink(ctx, model) {
    const sectorId = ctx.params && ctx.params.sector;
    if (sectorId && model.byId[sectorId]) {
      openSectorDetail(ctx, model, sectorId);
      return;
    }
    const monthIso = ctx.params && ctx.params.month;
    if (monthIso) {
      const i = ctx.release.monthly.licensing
        .findIndex((m) => m.iso === monthIso);
      if (i >= 0) {
        const node = monthDetail(ctx, i);
        if (node) {
          ctx.openDetail(node, {
            title: ctx.release.monthly.licensing[i].label + " — ملف الشهر",
          });
        }
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) بناء اللوحة — الهرمية الملزمة: ترويسة ← شريط المؤشرات ← شبكة الرسوم
        (صفان × 12 عموداً وعمود رؤى ممتد) — كل شيء داخل el (.dash-body).
     ══════════════════════════════════════════════════════════════════════════ */
  function build(el, ctx) {
    const rel = ctx.release;
    const model = sectorModel(rel, ctx.derived);
    const linker = makeLinker();

    /* مرآة بوابات القسم وقت البناء — تنبيه تطويري مبكر لا حجب عرض */
    guard("build", {
      "12 شهر تراخيص": rel.monthly.licensing.length === 12,
      "12 شهر رقابة": rel.monthly.monitoring.length === 12,
      "السلسلتان الشهريتان متحاذيتان iso": rel.monthly.licensing.every(
        (m, i) => rel.monthly.monitoring[i]
          && rel.monthly.monitoring[i].iso === m.iso),
      "ستة أنشطة اقتصادية": rel.economic_activities.length === 6,
      "مجموع الأنشطة = إجمالي الطلب":
        rel.economic_activities.reduce((a, r) => a + r.demand, 0)
          === rel.metrics.total_demand.value,
    });

    /* الترويسة: سياق ذهبي + عنوان + وسم حداثة + سطر الفترة المرجعية */
    RH.presenter.layout.sectionHeader(el, {
      kicker: "قراءة السوق",
      title: "العرض والطلب",
      badge: "بيانات حتى " + rel.meta.data_as_of,
      meta: rel.meta.monitoring_period_label,
    });

    /* شريط المؤشرات الست القابلة للنقر */
    buildKpiStrip(el, ctx, model);

    /* الشبكة: 12 عموداً؛ قالب الصفوف في demand.css (صف أول أطول قليلاً
       للرسم البطل). الترتيب البصري RTL: الخلية الأولى أقصى اليمين. */
    const g = RH.presenter.layout.grid(el, { cols: 12, cls: "dmd-grid" });

    /* الصف الأول: القطاعات (5) + تطور التغطية (4) + عمود الرؤى (3 ممتد صفين) */
    const cSector = g.cell({ span: 5, cls: "dmd-cell-sector" });
    const cCoverage = g.cell({ span: 4, cls: "dmd-cell-coverage" });
    const cRail = g.cell({ span: 3, rows: 2, cls: "dmd-cell-rail" });

    /* الصف الثاني: الأنشطة الاقتصادية (4) + الإشغال (3) + الياقات (2) */
    const cEcon = g.cell({ span: 4, cls: "dmd-cell-econ" });
    const cOccupancy = g.cell({ span: 3, cls: "dmd-cell-occupancy" });
    const cCollar = g.cell({ span: 2, cls: "dmd-cell-collar" });

    buildSectorCell(cSector, ctx, model, linker);
    buildCoverageCell(cCoverage, ctx);
    buildRail(cRail, ctx, model, linker);
    buildEconCell(cEcon, ctx);
    buildOccupancyCell(cOccupancy, ctx);
    buildCollarCell(cCollar, ctx);

    /* الربط الثنائي بعد اكتمال الطرفين (الرسم البطل + صفوف/رقاقات القطاعات) */
    wireSectorLinking(ctx, model, linker);

    /* الملخص الناطق ثم تلبية معامل الوصول العميق إن وُجد */
    buildSrSummary(el, ctx);
    honourDeepLink(ctx, model);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) تسجيل القسم — عقد RH.sections.register (order:2، backdrop:"demand"،
         حالة واحدة بلا خطوات بناء: اللوحة تُقرأ دفعة واحدة كمركز قيادة).
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "demand",
    order: 2,
    title: "العرض والطلب",
    kicker: "قراءة السوق",
    backdrop: "demand",
    dim: 0.84,
    steps: 0,
    major: false,
    build,
  });

  /* منفذ اختبار داخلي (ليس من عقد القسم): يكشف بُناة النموذج والبطاقات
     للاختبارات الآلية كي تتحقق من مطابقة أرقام البطاقات لمرايا الإصدار
     دون بناء DOM المسرح كاملاً. البادئة السفلية تعلن أنه غير معد
     للاستهلاك من بقية الأقسام. */
  RH.sections._demandInternals = {
    sectorModel,
    byCoverageAsc,
    monthDetail,
    activityDetail,
    RANK_BADGES,
  };
})();
