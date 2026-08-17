/* ════════════════════════════════════════════════════════════════════════════
   t1-demand.js — التبويب ١: «الطلب» (V3_SPEC §4 · V3_CONTRACTS §4)
   ────────────────────────────────────────────────────────────────────────────
   الموجز الملزم لهذا التبويب:
     ▸ أعلى الشاشة: الأرقام الكبرى — إجمالي العمالة المستهدفة ‎1,420,000‎ سرير
       مطلوب، ومعها تفكيك الياقات ونسبة التغطية المرخصة.
     ▸ ثم تقسيم الياقات (زرقاء ‎1,164,400‎ · بيضاء ‎255,600‎) **شريطاً أفقياً
       مكدساً كبيراً** يملأ عرض اللوح.
     ▸ ثم القطاعات البلدية الخمسة: أعمدة كبيرة مرتبة تنازلياً بالطلب، ونسبة
       التغطية **تسمية مباشرة** فوق كل عمود لا في تلميح.
     ▸ ثم أعلى خمسة أنشطة اقتصادية: أعمدة أفقية، و«قطاعات أخرى» دلو تجميع
       ظاهر بلونه المحايد وبعدّ ما طُوي فيه.

   حدود الكثافة (V3_SPEC §3) المطبَّقة حرفياً:
     • شريط الأرقام الكبرى ‎.tabfigs‎ (ليس خلية شبكة) + **ثلاث بطاقات فقط**
       في شبكات اللوح: صفٌّ برسم واحد ممتد، ثم صفٌّ برسمين — فلا يتجاوز
       المعروض في الشاشة الواحدة أربعة عناصر ولا يزيد الصف عن رسمين.
     • كل رسم رئيس بالصنف ‎.tabchart‎ (‎min-height: min(46vh, 420px)‎).
     • التمرير الرأسي طبيعي؛ الأفقي ممنوع (‎min-width: 0‎ على كل خلية).

   طبقات النقر الثلاث (V3_SPEC §5) — لا رابعة:
     ١) تحويم  → ‎T.ttMicro‎: سطران (عنوان + قيمة واحدة) عبر ‎T.tooltip(su)‎
                 (‎confine‎ + ‎ttPosition‎) فلا يغطي التلميح الرسم أبداً.
     ٢) نقرة أولى → ‎ctx.highlight(spec)‎: جملة واحدة + ≤3 أرقام + زر واحد،
                 وكل المواصفات مبنية في ‎MODEL.allSpecs‎ ومحروسة باختبار
                 الوحدة ‎tests/unit/tab-demand.test.mjs‎ على حد ‎320‎ حرفاً.
     ٣) الزر → ملحق ‎demand‎ بحالة عودة يرمّزها المحرك من المسار الحي.

   الصدق:
     • كل رقم من ‎ctx.release‎/‎ctx.derived‎ حصراً، وكل رقم ظاهر عبر ‎RH.core.fmt‎
       (تطابق العدد والمعدود وعزل اتجاهي).
     • «قطاعات أخرى» تُعلن أنها تجميع لا نشاط، ولا تنافس على المراتب.
     • حارس اتساق يُنبّه في الكونسول عند أي انجراف (مجاميع الياقات/القطاعات/
       الأنشطة مقابل إجمالي الطلب) ولا يُسقط اللوح.

   اللون: **صفر لون مكتوب**. كل لون رسم من ‎RH.viz.theme.C‎ (رموز حيّة)،
   وكل لون واجهة من ‎var(--…)‎ في ‎src/styles/tabs/demand.css‎. تبديل السمة
   يعيد بناء التبويب كاملاً عبر خطاف ‎onRetheme‎ في قشرة التبويبات.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** نسبة بتقريب المشروع الموحد (نصف لأعلى، منزلة واحدة) — تُقرأ وقت النداء */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /** معرف دلو التجميع في جدول الأنشطة، وعدد الأنشطة المفصّلة المعروضة */
  const AGG_ID = "other";
  const TOP_N = 5;

  /** صيغ عدد ومعدود محلية لما لا تغطيه NOUNS المركزية */
  const LOCAL_NOUNS = {
    activity: {
      one: "نشاط واحد", two: "نشاطان", few: "أنشطة",
      many: "نشاطاً", hundred: "نشاط", zero: "لا أنشطة",
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
     ١) النموذج النقي — دوال بلا DOM ولا ECharts، مغطاة باختبار الوحدة
        ‎tests/unit/tab-demand.test.mjs‎ (اشتقاق · تنسيق · حد ٣٢٠ حرفاً).
     ══════════════════════════════════════════════════════════════════════════ */

  /**
   * تقسيم الطلب حسب فئة العمالة.
   * القيمتان خامّتان من ‎release.collar‎ والحصتان من المشتقات المنشورة —
   * ولا يُحتسب أيٌّ منهما هنا من جديد كي لا ينجرف عن الإصدار.
   */
  function collarSplit(release, derived) {
    const total = release.metrics.total_demand.value;
    const blue = release.collar.blue;
    const white = release.collar.white;
    return {
      total,
      /** هل مجموع الفئتين يطابق الإجمالي؟ (يفحصه الحارس ويعرضه الاختبار) */
      exact: blue + white === total,
      rows: [
        {
          id: "blue",
          name: "الياقات الزرقاء",
          value: blue,
          share: derived.blue_share_pct,
          label: release.metrics.blue_collar.label,
        },
        {
          id: "white",
          name: "الياقات البيضاء",
          value: white,
          share: derived.white_share_pct,
          label: release.metrics.white_collar.label,
        },
      ],
    };
  }

  /**
   * القطاعات البلدية الخمسة مرتبة **تنازلياً بالطلب** (كسر التعادل بالمعرف
   * أبجدياً كي يكون الترتيب حتمياً على كل متصفح). كل قطاع يحمل معه نسبة
   * تغطيته وعجزه وحصته من طلب المدينة كما اشتُقّت مركزياً.
   */
  function sectorsByDemand(release, derived) {
    return release.sectors.map((s) => {
      const sd = derived.sector[s.id];
      return {
        id: s.id,
        name: s.name,
        short: s.short,
        demand: s.demand,
        beds: s.beds,
        coverage_pct: sd.coverage_pct,
        coverage_raw: sd.coverage_raw,
        deficit_beds: sd.deficit_beds,
        demand_share_pct: sd.demand_share_pct,
      };
    }).sort((a, b) => (b.demand - a.demand)
      || String(a.id).localeCompare(String(b.id)));
  }

  /**
   * أعلى ‎n‎ نشاطاً اقتصادياً + دلو «قطاعات أخرى».
   *
   * قواعد الصدق:
   *   • الدلو الوارد في المصدر (‎id === aggregateId‎) **دلو لا نشاط**: يُستبعد
   *     من المنافسة على المراتب ويُعرض دائماً في الذيل.
   *   • ما يفيض عن ‎n‎ من الأنشطة المفصّلة **يُطوى داخل الدلو** بعدّ ظاهر
   *     (‎folded‎) — فلا يختفي طلب ولا يُخترع رقم.
   *   • الإجمالي المعاد هو مجموع الصفوف الواردة كما هي (مرجع للحارس).
   *
   * يعيد: ‎{ top, other, folded, total }‎ · ‎other = null‎ إن لم يوجد دلو ولا فائض.
   */
  function topActivities(rows, n, aggregateId) {
    const aggId = aggregateId == null ? AGG_ID : aggregateId;
    const limit = Math.max(0, n == null ? TOP_N : n);
    const list = Array.isArray(rows) ? rows : [];

    const named = [];
    const buckets = [];
    for (const r of list) {
      if (r && r.id === aggId) buckets.push(r);
      else if (r) named.push(r);
    }
    named.sort((a, b) => (b.demand - a.demand)
      || String(a.id).localeCompare(String(b.id)));

    const top = named.slice(0, limit);
    const folded = named.slice(limit);
    const bucketDemand = buckets.reduce((acc, r) => acc + r.demand, 0);
    const foldedDemand = folded.reduce((acc, r) => acc + r.demand, 0);

    const other = (buckets.length || folded.length)
      ? {
        id: aggId,
        name: buckets.length ? buckets[0].name : "قطاعات أخرى",
        demand: bucketDemand + foldedDemand,
        folded: folded.length,
        aggregate: true,
      }
      : null;

    return {
      top,
      other,
      folded,
      total: list.reduce((acc, r) => acc + (r ? r.demand : 0), 0),
    };
  }

  /**
   * صف الأرقام الكبرى أعلى التبويب — أربع بطاقات جاهزة للعرض.
   * ‎kind‎ يحكم مقاس الرقم في CSS: ‎hero‎ صيغة تنفيذية · ‎exact‎ رقم دقيق
   * (الياقات كما طلبها الموجز حرفياً) · ‎pct‎ نسبة.
   */
  function figures(release, derived) {
    const total = release.metrics.total_demand.value;
    const cap = release.metrics.licensed_beds.value;
    const collar = collarSplit(release, derived);
    const blue = collar.rows[0];
    const white = collar.rows[1];
    const hero = fmt.compactParts(total);

    return [
      {
        id: "total", kind: "hero", tone: null,
        label: "إجمالي الطلب المستهدف على الأسرّة",
        value: hero.num, word: hero.word, unit: "سرير",
        foot: "العمالة المستهدفة في مدينة الرياض — القيمة الدقيقة "
          + fmt.unitAfter(total, "سرير"),
      },
      {
        id: "blue", kind: "exact", tone: "blue",
        label: "الياقات الزرقاء",
        value: fmt.int(blue.value), word: "", unit: "سرير",
        foot: fmt.pct(blue.share) + " من إجمالي الطلب",
      },
      {
        id: "white", kind: "exact", tone: "demand",
        label: "الياقات البيضاء",
        value: fmt.int(white.value), word: "", unit: "سرير",
        foot: fmt.pct(white.share) + " من إجمالي الطلب",
      },
      {
        id: "coverage", kind: "pct", tone: "green",
        label: "تغطية الطلب بالطاقة المرخصة",
        value: fmt.pct(derived.coverage_pct), word: "", unit: "",
        foot: fmt.unitAfter(cap, "سرير") + " مرخصة حتى تاريخ الإصدار",
      },
    ];
  }

  /* ── مواصفات الإبراز (الطبقة الثانية) — جملة واحدة + ≤3 أرقام + زر واحد ──
     ‎note‎ خارج حدّ الأحرف عمداً: وسم مصدر/صدق لا يُقصّ أبداً (عقد §5-ج). */

  /** وسم «البيانات حتى …» الموحد لكل نوافذ هذا التبويب */
  const asOf = (release) => "البيانات حتى " + release.meta.data_as_of + ".";

  /** الزر الوحيد: الملحق التحليلي للطلب بحالة عودة يرمّزها المحرك */
  const AX_LABEL = "التفاصيل الكاملة في الملحق";

  function totalSpec(release, derived) {
    const total = release.metrics.total_demand.value;
    const collar = collarSplit(release, derived);
    return {
      title: "إجمالي الطلب على الأسرّة",
      sentence: "الطلب المقدَّر لسكن العمالة في مدينة الرياض "
        + fmt.unitAfter(total, "سرير") + " موزّع على فئتي عمالة وخمسة قطاعات.",
      stats: [
        { label: "الياقات الزرقاء", value: fmt.unitAfter(collar.rows[0].value, "سرير") },
        { label: "الياقات البيضاء", value: fmt.unitAfter(collar.rows[1].value, "سرير") },
        {
          label: "الطاقة المرخصة",
          value: fmt.unitAfter(release.metrics.licensed_beds.value, "سرير"),
          tone: "pos",
        },
      ],
      appendix: { id: "demand", label: AX_LABEL },
      note: asOf(release),
    };
  }

  function coverageSpec(release, derived) {
    return {
      title: "تغطية الطلب بالطاقة المرخصة",
      sentence: "الطاقة المرخصة تغطي " + fmt.pct(derived.coverage_pct)
        + " من الطلب المقدَّر، ويبقى "
        + fmt.unitAfter(derived.deficit_beds, "سرير") + " بلا تغطية.",
      stats: [
        {
          label: "الطاقة المرخصة",
          value: fmt.unitAfter(release.metrics.licensed_beds.value, "سرير"),
          tone: "pos",
        },
        {
          label: "الطلب المقدَّر",
          value: fmt.unitAfter(release.metrics.total_demand.value, "سرير"),
        },
        { label: "غير المغطى", value: fmt.pct(derived.uncovered_pct), tone: "neg" },
      ],
      appendix: { id: "demand", label: AX_LABEL },
      note: asOf(release),
    };
  }

  function collarSpec(release, derived, collarId) {
    const collar = collarSplit(release, derived);
    const row = collar.rows.find((r) => r.id === collarId) || collar.rows[0];
    const other = collar.rows.find((r) => r.id !== row.id);
    return {
      title: row.name,
      sentence: row.name + " تمثّل " + fmt.pct(row.share)
        + " من الطلب على الأسرّة بواقع " + fmt.unitAfter(row.value, "سرير") + ".",
      stats: [
        { label: "الطلب", value: fmt.unitAfter(row.value, "سرير") },
        { label: "الحصة", value: fmt.pct(row.share) },
        { label: other.name, value: fmt.unitAfter(other.value, "سرير") },
      ],
      appendix: { id: "demand", label: AX_LABEL },
      note: asOf(release),
    };
  }

  function sectorSpec(release, derived, sectorId) {
    const rows = sectorsByDemand(release, derived);
    const s = rows.find((r) => r.id === sectorId) || rows[0];
    return {
      title: s.name,
      sentence: s.name + " يستحوذ على " + fmt.pct(s.demand_share_pct)
        + " من طلب المدينة، وتغطيه طاقته المرخصة بنسبة "
        + fmt.pct(s.coverage_pct) + ".",
      stats: [
        { label: "الطلب", value: fmt.unitAfter(s.demand, "سرير") },
        { label: "الطاقة المرخصة", value: fmt.unitAfter(s.beds, "سرير"), tone: "pos" },
        { label: "العجز", value: fmt.unitAfter(s.deficit_beds, "سرير"), tone: "neg" },
      ],
      appendix: { id: "demand", params: { sector: s.id }, label: AX_LABEL },
      note: asOf(release),
    };
  }

  /**
   * مواصفة نشاط اقتصادي واحد. للدلو المجمَّع نصٌّ مختلف يعلن أنه تجميع
   * ولا يدّعي رتبة — ويذكر عدد ما طُوي فيه إن وُجد.
   */
  function activitySpec(release, derived, activityId) {
    const total = release.metrics.total_demand.value;
    const model = topActivities(release.economic_activities, TOP_N, AGG_ID);

    if (model.other && model.other.id === activityId) {
      const o = model.other;
      return {
        title: o.name,
        sentence: "«" + o.name + "» تجميع لما دون أعلى "
          + fmt.countNoun(TOP_N, LOCAL_NOUNS.activity) + " بطلب "
          + fmt.unitAfter(o.demand, "سرير") + ".",
        stats: [
          { label: "الطلب المجمَّع", value: fmt.unitAfter(o.demand, "سرير") },
          { label: "الحصة من الإجمالي", value: fmt.pct(pctOf(o.demand, total)) },
        ],
        appendix: { id: "demand", params: { activity: o.id }, label: AX_LABEL },
        note: "تجميع لا نشاط منفرد · " + asOf(release),
      };
    }

    const idx = model.top.findIndex((a) => a.id === activityId);
    const a = idx >= 0 ? model.top[idx] : model.top[0];
    const rank = (idx >= 0 ? idx : 0) + 1;
    return {
      title: a.name,
      sentence: "نشاط " + a.name + " في المرتبة " + fmt.int(rank) + " بطلب "
        + fmt.unitAfter(a.demand, "سرير") + " أي "
        + fmt.pct(pctOf(a.demand, total)) + " من إجمالي الطلب.",
      stats: [
        { label: "الطلب", value: fmt.unitAfter(a.demand, "سرير") },
        { label: "الحصة من الإجمالي", value: fmt.pct(pctOf(a.demand, total)) },
        {
          label: "الترتيب",
          value: fmt.iso(fmt.int(rank) + " من " + fmt.int(model.top.length)),
        },
      ],
      appendix: { id: "demand", params: { activity: a.id }, label: AX_LABEL },
      note: asOf(release),
    };
  }

  /**
   * كل مواصفات الإبراز التي يستطيع هذا التبويب فتحها — مصدر واحد يفحصه
   * اختبار الوحدة على حدّ ‎320‎ حرفاً وحدّ ثلاثة أرقام (بوابة قبول V3_SPEC §5).
   */
  function allSpecs(release, derived) {
    const out = [totalSpec(release, derived), coverageSpec(release, derived)];
    for (const r of collarSplit(release, derived).rows) {
      out.push(collarSpec(release, derived, r.id));
    }
    for (const s of sectorsByDemand(release, derived)) {
      out.push(sectorSpec(release, derived, s.id));
    }
    const acts = topActivities(release.economic_activities, TOP_N, AGG_ID);
    for (const a of acts.top) out.push(activitySpec(release, derived, a.id));
    if (acts.other) out.push(activitySpec(release, derived, acts.other.id));
    return out;
  }

  const MODEL = {
    AGG_ID, TOP_N,
    collarSplit, sectorsByDemand, topActivities, figures,
    totalSpec, coverageSpec, collarSpec, sectorSpec, activitySpec, allSpecs,
  };

  /* ══════════════════════════════════════════════════════════════════════════
     ٢) حارس اتساق تطويري — يُنبّه ولا يُسقط (الإصدار اجتاز بواباته الـ152)
     ══════════════════════════════════════════════════════════════════════════ */
  function guard(where, checks) {
    if (typeof console === "undefined") return;
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("t1-demand/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٣) عناصر الواجهة المشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** بطاقة رسم بعقد ‎.tabcard‎ الجاهز — تعيد ‎{card, body}‎ */
  function chartCard(opts) {
    const body = h("div", { class: "tabcard-body" });
    const card = h("section", {
      class: "tabcard dmt-card" + (opts.cls ? " " + opts.cls : ""),
      "aria-label": opts.title,
    },
      h("div", { class: "tabcard-head" },
        h("h2", { class: "tabcard-title" }, opts.title),
        opts.note ? h("p", { class: "tabcard-note" }, opts.note) : null),
      body);
    return { card, body };
  }

  /** رقاقة تفاعلية (زر حقيقي) — المسار المفاتيحي إلى نافذة الإبراز */
  function chip(opts) {
    return h("button", {
      class: "dmt-chip" + (opts.cls ? " " + opts.cls : "")
        + (opts.on ? " is-on" : ""),
      type: "button",
      "data-interactive": "",
      "aria-label": opts.aria || opts.label,
      onclick: opts.onclick,
    },
      h("span", { class: "dmt-chip-swatch", "aria-hidden": "true" }),
      h("span", { class: "dmt-chip-label" }, opts.label),
      opts.value ? h("b", { class: "dmt-chip-value tnum" }, opts.value) : null);
  }

  /** توصيل نقر مثيل ECharts بفصل مضمون عند مغادرة التبويب */
  function onChartClick(ctx, chart, handler) {
    chart.on("click", handler);
    ctx.onTeardown(() => {
      try { if (!chart.isDisposed()) chart.off("click", handler); } catch (_e) { /* أُتلف سلفاً */ }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٤) البناء
     ══════════════════════════════════════════════════════════════════════════ */

  function build(el, ctx) {
    const T = RH.viz.theme;
    const rel = ctx.release;
    const der = ctx.derived;
    const su = ctx.su;

    /* صيغة محور مختصرة: «505 ألف» / «1.16 مليون» — كلها من fmt المركزي */
    const axFmt = (v) => fmt.compact(v);

    const collar = collarSplit(rel, der);
    const sectors = sectorsByDemand(rel, der);
    const acts = topActivities(rel.economic_activities, TOP_N, AGG_ID);
    const total = rel.metrics.total_demand.value;

    guard("build", {
      "الياقات الزرقاء + البيضاء = إجمالي الطلب": collar.exact,
      "مجموع طلب القطاعات = إجمالي الطلب":
        sectors.reduce((a, s) => a + s.demand, 0) === total,
      "مجموع الأنشطة = إجمالي الطلب": acts.total === total,
      "خمسة قطاعات كما في الإصدار": sectors.length === 5,
    });

    const root = h("div", { class: "dmt" });
    el.appendChild(root);

    /* ── ٤-أ) شريط الأرقام الكبرى ───────────────────────────────────────── */
    const figSpecs = {
      total: () => totalSpec(rel, der),
      blue: () => collarSpec(rel, der, "blue"),
      white: () => collarSpec(rel, der, "white"),
      coverage: () => coverageSpec(rel, der),
    };

    const figsEl = h("div", {
      class: "tabfigs dmt-figs",
      role: "group",
      "aria-label": "الأرقام الكبرى للطلب",
    });
    for (const f of figures(rel, der)) {
      const btn = h("button", {
        class: "tabfig dmt-fig is-" + f.kind
          + (f.tone ? " is-tone-" + f.tone : ""),
        type: "button",
        "data-interactive": "",
        dataset: { fig: f.id },
        "aria-label": f.label + ": " + f.value
          + (f.word ? " " + f.word : "") + (f.unit ? " " + f.unit : "")
          + " — اعرض الإبراز",
        onclick: (ev) => {
          const spec = figSpecs[f.id];
          if (spec) ctx.highlight(Object.assign(spec(), { anchor: ev.currentTarget }));
        },
      },
        h("span", { class: "tabfig-label" }, f.label),
        h("span", { class: "tabfig-value" },
          h("span", { class: "num" }, f.value),
          f.word ? h("span", { class: "word" }, f.word) : null,
          f.unit ? h("span", { class: "unit" }, f.unit) : null),
        h("span", { class: "tabfig-foot" }, f.foot));

      /* بطاقة البطل تحمل النمط الهندسي لهوية الأمانة بتعتيم منخفض */
      if (f.kind === "hero") {
        btn.classList.add("dmt-fig-hero");
        if (RH.brand && typeof RH.brand.pattern === "function") {
          ctx.onTeardown(RH.brand.pattern(btn, { opacity: 0.07, angle: 18, size: 128 }));
        }
      }
      figsEl.appendChild(btn);
    }
    root.appendChild(figsEl);

    /* ── ٤-ب) تقسيم الياقات: شريط أفقي مكدس كبير (رسم ممتد وحده في صفه) ── */
    const collarGrid = h("div", { class: "tabgrid is-1" });
    const collarCard = chartCard({
      title: "تقسيم الطلب حسب فئة العمالة",
      note: "إجمالي " + fmt.unitAfter(total, "سرير") + " — انقر فئة لإبرازها",
      cls: "dmt-collar-card",
    });
    const collarChartEl = h("div", { class: "tabchart dmt-collar-chart" });
    collarCard.body.appendChild(collarChartEl);

    const collarLegend = h("div", {
      class: "dmt-chips dmt-legend",
      role: "group",
      "aria-label": "فئتا العمالة — القيم الدقيقة",
    });
    collar.rows.forEach((r) => {
      collarLegend.appendChild(chip({
        cls: "is-tone-" + (r.id === "blue" ? "blue" : "demand"),
        label: r.name,
        value: fmt.unitAfter(r.value, "سرير") + " · " + fmt.pct(r.share),
        aria: r.label + ": " + fmt.unitAfter(r.value, "سرير")
          + "، " + fmt.pct(r.share) + " من إجمالي الطلب — اعرض الإبراز",
        onclick: (ev) => ctx.highlight(Object.assign(
          collarSpec(rel, der, r.id), { anchor: ev.currentTarget })),
      }));
    });
    collarCard.body.appendChild(collarLegend);
    collarGrid.appendChild(collarCard.card);
    root.appendChild(collarGrid);

    /* محور الشريط المكدس: مداه = إجمالي الطلب كي يملأ الشريط عرض اللوح.
       تسمية الطرف الأقصى تُخفى لأنها تقع على حافة القماش فتُقصّ — والقيمة
       نفسها معروضة كاملة في عنوان البطاقة وفي رقاقات المفاتيح. */
    const collarXAxis = T.hValAxis(su, axFmt, total);
    collarXAxis.axisLabel = Object.assign({}, collarXAxis.axisLabel,
      { showMaxLabel: false });

    const collarChart = ctx.chart("collar", collarChartEl);
    collarChart.setOption(Object.assign(T.base(su), {
      grid: {
        top: T.fs(su, 26), bottom: T.fs(su, 40),
        left: T.fs(su, 26), right: T.fs(su, 20), containLabel: true,
      },
      xAxis: collarXAxis,
      yAxis: {
        type: "category", data: [""], position: "right",
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { show: false },
      },
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttMicro(p.seriesName, fmt.int(p.value), "سرير"),
      }),
      series: collar.rows.map((r, i) => ({
        name: r.name,
        type: "bar",
        stack: "collar",
        barWidth: "56%",
        cursor: "pointer",
        data: [r.value],
        color: i === 0 ? T.C.blue : T.C.demand,
        itemStyle: {
          borderRadius: i === 0 ? [0, 14, 14, 0] : [14, 0, 0, 14],
        },
        emphasis: { itemStyle: { color: i === 0 ? T.C.blueHi : T.C.demandHi } },
        /* التسمية داخل الشريط: النسبة وحدها — كبيرة ومقروءة على الأرضيتين،
           والقيم الدقيقة في رقاقات المفاتيح أسفل الرسم (لا ازدحام). */
        label: {
          show: true, position: "inside",
          color: T.C.tipFg,
          fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, 21), fontWeight: 700,
          formatter: () => fmt.pct(r.share),
        },
      })),
    }), true);

    onChartClick(ctx, collarChart, (p) => {
      if (!p || p.componentType !== "series") return;
      const r = collar.rows[p.seriesIndex];
      if (r) {
        ctx.highlight(Object.assign(collarSpec(rel, der, r.id),
          { anchor: collarChartEl }));
      }
    });

    /* ── ٤-ج) صف الرسمين: القطاعات البلدية · الأنشطة الاقتصادية ─────────── */
    const mainGrid = h("div", { class: "tabgrid" });

    /* (١) القطاعات البلدية الخمسة — أعمدة تنازلية بالطلب، التغطية تسمية مباشرة */
    const secCard = chartCard({
      title: "الطلب حسب القطاع البلدي",
      note: "مرتبة تنازلياً بالطلب · نسبة التغطية أعلى كل عمود",
      cls: "dmt-sector-card",
    });
    const secChartEl = h("div", { class: "tabchart dmt-sector-chart" });
    secCard.body.appendChild(secChartEl);

    const secChips = h("div", {
      class: "dmt-chips dmt-sector-chips",
      role: "group",
      "aria-label": "القطاعات البلدية الخمسة — تغطية الطلب",
    });
    const focusSector = String((ctx.params && ctx.params.sector) || "");
    sectors.forEach((s) => {
      secChips.appendChild(chip({
        cls: "is-tone-demand",
        on: s.id === focusSector,
        label: s.short,
        value: fmt.pct(s.coverage_pct),
        aria: s.name + ": الطلب " + fmt.unitAfter(s.demand, "سرير")
          + "، نسبة التغطية " + fmt.pct(s.coverage_pct) + " — اعرض الإبراز",
        onclick: (ev) => ctx.highlight(Object.assign(
          sectorSpec(rel, der, s.id), { anchor: ev.currentTarget })),
      }));
    });
    secCard.body.appendChild(secChips);
    mainGrid.appendChild(secCard.card);

    const secChart = ctx.chart("sectors", secChartEl);
    secChart.setOption(Object.assign(T.base(su), {
      grid: {
        top: T.fs(su, 62), bottom: T.fs(su, 8),
        left: T.fs(su, 10), right: T.fs(su, 10), containLabel: true,
      },
      xAxis: T.catXAxis(su, sectors.map((s) => s.short)),
      yAxis: T.valAxis(su, axFmt),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttMicro(sectors[p.dataIndex].name,
          fmt.int(p.value), "سرير"),
      }),
      series: [{
        name: "الطلب",
        type: "bar",
        barWidth: "54%",
        cursor: "pointer",
        color: T.C.demand,
        itemStyle: { borderRadius: [10, 10, 0, 0] },
        emphasis: { itemStyle: { color: T.C.demandHi } },
        data: sectors.map((s) => s.demand),
        /* التسمية المباشرة المطلوبة في الموجز: القيمة ثم نسبة التغطية */
        label: {
          show: true, position: "top", distance: T.fs(su, 9),
          formatter: (p) => "{v|" + fmt.int(p.value) + "}\n{c|تغطية "
            + fmt.pct(sectors[p.dataIndex].coverage_pct) + "}",
          rich: {
            v: {
              color: T.C.ivory, fontFamily: "IBM Plex Sans Arabic",
              fontSize: T.fs(su, 15), fontWeight: 700,
              lineHeight: T.fs(su, 20), align: "center",
            },
            c: {
              color: T.C.mut, fontFamily: "Cairo",
              fontSize: T.fs(su, 12.5), lineHeight: T.fs(su, 17),
              align: "center",
            },
          },
        },
      }],
    }), true);

    onChartClick(ctx, secChart, (p) => {
      if (!p || p.componentType !== "series") return;
      const s = sectors[p.dataIndex];
      if (s) {
        ctx.highlight(Object.assign(sectorSpec(rel, der, s.id),
          { anchor: secChartEl }));
      }
    });

    /* (٢) أعلى خمسة أنشطة + «قطاعات أخرى» مجمّعة — أعمدة أفقية */
    const actRows = acts.other ? acts.top.concat([acts.other]) : acts.top.slice();
    const actNote = acts.other
      ? "أعلى " + fmt.countNoun(acts.top.length, LOCAL_NOUNS.activity)
        + " و«" + acts.other.name + "» تجميعاً"
      : "أعلى " + fmt.countNoun(acts.top.length, LOCAL_NOUNS.activity);

    const actCard = chartCard({
      title: "الطلب حسب النشاط الاقتصادي",
      note: actNote,
      cls: "dmt-act-card",
    });
    const actChartEl = h("div", { class: "tabchart dmt-act-chart" });
    actCard.body.appendChild(actChartEl);

    const actChips = h("div", {
      class: "dmt-chips is-quiet",
      role: "group",
      "aria-label": "الأنشطة الاقتصادية المعروضة",
    });
    const focusActivity = String((ctx.params && ctx.params.activity) || "");
    actRows.forEach((a) => {
      actChips.appendChild(chip({
        cls: a.aggregate ? "is-tone-neutral" : "is-tone-demand",
        on: a.id === focusActivity,
        label: a.name,
        aria: a.name + ": " + fmt.unitAfter(a.demand, "سرير")
          + (a.aggregate ? " — تجميع لا نشاط منفرد" : "") + " — اعرض الإبراز",
        onclick: (ev) => ctx.highlight(Object.assign(
          activitySpec(rel, der, a.id), { anchor: ev.currentTarget })),
      }));
    });
    actCard.body.appendChild(actChips);
    mainGrid.appendChild(actCard.card);
    root.appendChild(mainGrid);

    const actChart = ctx.chart("activities", actChartEl);
    actChart.setOption(Object.assign(T.base(su), {
      grid: {
        top: T.fs(su, 8), bottom: T.fs(su, 30),
        left: T.fs(su, 92), right: T.fs(su, 168),
      },
      xAxis: T.hValAxis(su, axFmt),
      yAxis: T.hCatAxis(su, actRows.map((a) => a.name), T.fs(su, 158)),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttMicro(actRows[p.dataIndex].name,
          fmt.int(p.value), "سرير"),
      }),
      series: [{
        name: "الطلب",
        type: "bar",
        barWidth: "58%",
        cursor: "pointer",
        itemStyle: { borderRadius: [6, 0, 0, 6] },
        /* الدلو المجمَّع بلون محايد: ليس فئة طلب منفردة فلا يأخذ لون الطلب */
        data: actRows.map((a) => ({
          value: a.demand,
          itemStyle: { color: a.aggregate ? T.C.faint : T.C.demand },
          emphasis: { itemStyle: { color: a.aggregate ? T.C.mut : T.C.demandHi } },
        })),
        label: {
          show: true, position: "left", distance: T.fs(su, 8),
          color: T.C.ivory, fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, 14), fontWeight: 600,
          formatter: (p) => fmt.int(p.value),
        },
      }],
    }), true);

    onChartClick(ctx, actChart, (p) => {
      if (!p || p.componentType !== "series") return;
      const a = actRows[p.dataIndex];
      if (a) {
        ctx.highlight(Object.assign(activitySpec(rel, der, a.id),
          { anchor: actChartEl }));
      }
    });

    /* ── ٤-د) سطر الصدق أسفل اللوح ───────────────────────────────────────── */
    root.appendChild(h("p", { class: "dmt-foot" },
      "كل القيم من الإصدار المنشور ",
      h("span", { class: "ltr" }, rel.release.id),
      " — البيانات حتى " + rel.meta.data_as_of
      + " · تاريخ الحساب " + fmt.date(rel.meta.calculation_date) + "."));

    /* ── ٤-هـ) وصول عميق: ‎#/tab/demand?sector=…‎ أو ‎?activity=…‎ ─────────
       يفتح نافذة الإبراز المقابلة بعد اكتمال الطلاء — معامل مجهول يُتجاهل
       بصمت (لا شاشة خطأ في لوحة عرض). */
    const deep = () => {
      if (focusSector && sectors.some((s) => s.id === focusSector)) {
        ctx.highlight(Object.assign(sectorSpec(rel, der, focusSector),
          { anchor: secChartEl }));
        return;
      }
      if (focusActivity && actRows.some((a) => a.id === focusActivity)) {
        ctx.highlight(Object.assign(activitySpec(rel, der, focusActivity),
          { anchor: actChartEl }));
      }
    };
    if (focusSector || focusActivity) {
      const tid = setTimeout(deep, 60);
      ctx.onTeardown(() => clearTimeout(tid));
    }
  }

  RH.tabs.register({
    id: "demand",
    order: 1,
    title: "الطلب",
    /** النموذج النقي مكشوف للاختبار ولوحة الأوامر — لا حالة فيه ولا DOM */
    model: MODEL,
    build,
  });
})();
