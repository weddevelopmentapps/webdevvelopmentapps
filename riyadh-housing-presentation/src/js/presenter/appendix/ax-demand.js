/* ax-demand.js — ملحق الطلب: أربع صفحات بحجم الإطار (لا تمرير)
   1) الطلب حسب النشاط الاقتصادي  2) الطلب/الطاقة/التغطية قطاعياً
   3) سيناريوهات العجز المورّدة (بوسم النموذج غير المعتمد — لا تلفيق)
   4) الصيغ والمصادر مع سطر التواريخ.
   كل قيمة من store.release()/der() حصراً وكل رقم ظاهر عبر RH.core.fmt. */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** اسم القطاع الكامل من معرّفه في der().rankings */
  function sectorName(rel, id) {
    const s = rel.sectors.find((x) => x.id === id);
    return s ? s.name : id;
  }

  /** أسماء عرض عربية للمقاييس المشتقة التي لا تحمل label في الإصدار —
      نص واجهة فقط (لا قيم)؛ label الوارد في البيانات يتقدم عليها دائماً */
  const METRIC_AR = {
    deficit_beds: "عجز الأسرّة",
    coverage_pct: "نسبة تغطية الطلب",
    uncovered_pct: "نسبة الطلب غير المغطى",
    occupancy_pct: "نسبة إشغال الطاقة المرخصة",
    vacant_beds: "الأسرّة الشاغرة",
    blue_share_pct: "حصة الياقات الزرقاء من الطلب",
    white_share_pct: "حصة الياقات البيضاء من الطلب",
  };

  /** منطقة رسم قياسية داخل .ax-page: رسم واحد مهيمن يملأ الإطار */
  function chartArea(el) {
    const chartEl = h("div", { class: "chart" });
    el.appendChild(h("div", { class: "chart-area" }, chartEl));
    return chartEl;
  }

  /* ── الصفحة 1: الطلب حسب النشاط الاقتصادي ─────────────────────────── */
  function pageEcon(el, ctx) {
    const rel = RH.data.store.release();
    RH.viz.charts.econBars(chartArea(el), ctx.su);

    // الإحصاءة المشتقة: النشاط الأعلى طلباً وحصته من الإجمالي (ترتيب على الخام)
    const top = rel.economic_activities.slice()
      .sort((a, b) => b.demand - a.demand)[0];
    const total = rel.metrics.total_demand.value;
    const share = RH.data.derive.pct(top.demand, total);

    el.appendChild(h("div", { class: "ax-note" },
      "يتصدر نشاط «", top.name, "» الطلب على الأسرّة بواقع ",
      h("b", {}, fmt.unitAfter(top.demand, "سرير")),
      "، أي ما نسبته ", h("b", {}, fmt.pct(share)),
      " من إجمالي الطلب التقديري البالغ ",
      fmt.unitAfter(total, "سرير"), ".",
    ));
  }

  /* ── الصفحة 2: الطلب والطاقة والتغطية حسب القطاع ──────────────────── */
  function pageSectors(el, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    RH.viz.charts.sectorCompare(chartArea(el), ctx.su);

    const hi = der.rankings.highest_coverage;
    const lo = der.rankings.lowest_coverage;

    el.appendChild(h("div", { class: "ax-note" },
      "يسجل ", sectorName(rel, hi), " أعلى نسبة تغطية للطلب عند ",
      h("b", {}, fmt.pct(der.sector[hi].coverage_pct)),
      "، بينما يسجل ", sectorName(rel, lo), " أدنى نسبة عند ",
      h("b", {}, fmt.pct(der.sector[lo].coverage_pct)),
      " بعجز قدره ",
      fmt.unitAfter(der.sector[lo].deficit_beds, "سرير"), ".",
    ));
  }

  /* ── الصفحة 3: سيناريوهات العجز المورّدة ──────────────────────────── */
  function pageScenarios(el, ctx) {
    const rel = RH.data.store.release();
    RH.viz.charts.scenarioLines(chartArea(el), ctx.su);

    const sc = rel.scenarios;
    // عقيدة عدم التلفيق: الوسم الذهبي البارز يُعرض ما دام النموذج غير معتمد
    // في الإصدار؛ العنوان والتحفظ يُعرضان حرفياً من ملف البيانات دائماً.
    const approved = sc.status === "approved";
    el.appendChild(h("div", { class: "ax-note" },
      approved ? null : h("b", {}, "سيناريوهات مورّدة في ملف البيانات — نموذج غير معتمد"),
      approved ? null : " · ",
      sc.title, ". ", sc.caveat,
    ));
  }

  /* ── الصفحة 4: الصيغ والمصادر ─────────────────────────────────────── */
  function pageProvenance(el, _ctx) {
    const rel = RH.data.store.release();
    const rows = RH.presenter.ax.provenanceRows([
      "total_demand", "licensed_beds", "deficit_beds",
      "coverage_pct", "uncovered_pct", "occupancy_pct",
      "vacant_beds", "blue_share_pct", "white_share_pct",
    ]);

    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        ["المقياس", "القيمة", "الوحدة", "الصيغة", "المصدر"]
          .map((t) => h("th", { scope: "col" }, t)),
      )),
      h("tbody", {}, rows.map((r) => h("tr", {},
        h("td", {}, METRIC_AR[r.label] || r.label),
        h("td", { class: "num" },
          h("span", { class: "ltr" },
            r.unit === "٪" ? fmt.pct(r.value) : fmt.int(r.value)),
        ),
        h("td", {}, r.unit || "—"),
        h("td", {}, h("span", { class: "formula" }, r.formula)),
        // مراسي الورقة (اسم الورقة!الخلية — الملف) مقاطع لاتينية مختلطة → عزل اتجاهي
        h("td", {}, r.source.includes("!")
          ? h("span", { class: "ltr" }, r.source)
          : r.source),
      ))),
    ));

    el.appendChild(h("div", { class: "ax-note" },
      "البيانات حتى ", h("b", {}, rel.meta.data_as_of),
      " · تاريخ الحساب: ", h("b", {}, fmt.date(rel.meta.calculation_date)), ".",
    ));
  }

  RH.presenter.ax.register({
    id: "demand",
    kicker: "ملحق تحليلي",
    title: "الطلب — التفاصيل والتحليل",
    returnLabel: "العودة إلى الطلب",
    pages: () => [
      { name: "الطلب حسب النشاط الاقتصادي", build: pageEcon },
      { name: "الطلب والطاقة والتغطية حسب القطاع", build: pageSectors },
      { name: "سيناريوهات العجز المورّدة", build: pageScenarios },
      { name: "الصيغ والمصادر", build: pageProvenance },
    ],
  });
})();
