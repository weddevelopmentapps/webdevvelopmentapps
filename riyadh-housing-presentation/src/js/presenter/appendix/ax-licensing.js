/* ax-licensing.js — ملحق التراخيص: التفاصيل والتحليل
   ست صفحات بحجم الإطار (لا تمرير): الإضافات الشهرية، الجسر من خط الأساس،
   مزيج أنواع الإيواء، مقارنة القطاعات، عينة الأحياء (بوسمها الإلزامي)،
   ثم الصيغ والمصادر. كل قيمة من store حصراً وكل رقم ظاهر عبر fmt. */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** حاوية رسم قياسية داخل صفحة الملحق (تملأ المساحة المتبقية) */
  function chartArea() {
    const chart = h("div", { class: "chart" });
    return { area: h("div", { class: "chart-area" }, chart), chart };
  }

  /* ── 1) صافي الإضافات الشهرية ── */
  function pgMonthlyNet(el, ctx) {
    const rel = RH.data.store.release();
    const rows = rel.monthly.licensing;
    const total = rows.reduce((acc, m) => acc + m.beds, 0);
    const avg = RH.data.derive.roundHalfUp(total / rows.length, 0);

    const { area, chart } = chartArea();
    el.appendChild(area);
    RH.viz.charts.monthlyNet(chart, ctx.su, "beds");

    el.appendChild(h("div", { class: "ax-note" },
      "بلغ إجمالي صافي الإضافات إلى الطاقة الاستيعابية المرخصة ",
      h("b", {}, fmt.unitAfter(total, "سرير")),
      " خلال ", rel.meta.monitoring_period_label,
      "، بمتوسط إضافة شهرية قدره ",
      h("b", {}, fmt.unitAfter(avg, "سرير")), ".",
    ));
  }

  /* ── 2) الجسر من خط الأساس ── */
  function pgBridge(el, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();

    const { area, chart } = chartArea();
    el.appendChild(area);
    RH.viz.charts.bridge(chart, ctx.su, "operational", true);

    el.appendChild(h("div", { class: "ax-note" },
      "ارتفعت الرخص التشغيلية من ",
      h("b", {}, fmt.noun(rel.metrics.baseline_operational.value, "licence")),
      " إلى ",
      h("b", {}, fmt.noun(rel.metrics.current_operational.value, "licence")),
      " بنمو ", h("b", {}, fmt.pct(der.growth_operational_pct)),
      " — ", rel.meta.comparison_qualifier, ".",
    ));
  }

  /* ── 3) مزيج أنواع الإيواء ── */
  function pgFacilityMix(el, ctx) {
    const rel = RH.data.store.release();

    const { area, chart } = chartArea();
    el.appendChild(area);
    RH.viz.charts.facilityMix(chart, ctx.su);

    const note = h("div", { class: "ax-note" },
      "تتوزع الرخص التشغيلية القائمة، وعددها ",
      h("b", {}, fmt.noun(rel.metrics.current_operational.value, "licence")),
      "، على أنواع الإيواء الثلاثة: ");
    rel.facility_types.forEach((t, i) => {
      if (i > 0) note.appendChild(document.createTextNode("، و"));
      note.appendChild(document.createTextNode(t.name + " بواقع "));
      note.appendChild(h("b", {}, fmt.noun(t.count, "licence")));
    });
    note.appendChild(document.createTextNode("."));
    el.appendChild(note);
  }

  /* ── 4) مقارنة القطاعات ── */
  function pgSectorTable(el) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();

    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        h("th", {}, "القطاع"),
        h("th", {}, "رخص البناء"),
        h("th", {}, "الرخص التشغيلية"),
        h("th", {}, "الطاقة (سرير)"),
        h("th", {}, "نسبة التغطية"),
      )),
      h("tbody", {}, rel.sectors.map((s) => h("tr", {},
        h("td", {}, s.name),
        h("td", { class: "num" }, fmt.int(s.building)),
        h("td", { class: "num" }, fmt.int(s.operational)),
        h("td", { class: "num" }, fmt.int(s.beds)),
        h("td", { class: "num" }, fmt.pct(der.sector[s.id].coverage_pct)),
      ))),
    ));

    el.appendChild(h("div", { class: "ax-note" },
      "نسبة التغطية لكل قطاع هي حاصل قسمة طاقته الاستيعابية المرخصة على طلبه التقديري — البيانات حتى ",
      rel.meta.data_as_of, ".",
    ));
  }

  /* ── 5) عينة الأحياء المدرجة ── */
  function pgNeighbourhoods(el, ctx) {
    const rel = RH.data.store.release();

    const area = h("div", { class: "chart-area" });
    el.appendChild(area);
    RH.viz.map.render(area, { metric: "beds", su: ctx.su, showNbhd: true });

    // الملاحظة الإلزامية: وسم العينة + قاعدة الترتيب حرفياً + وسم الخريطة التوضيحية
    el.appendChild(h("div", { class: "ax-note" },
      rel.neighbourhoods.label, " — ", rel.neighbourhoods.ranking_note,
      ". المقياس المعروض: ", RH.viz.map.METRICS.beds.label, ". ",
      h("span", { class: "map-disclaimer" }, rel.meta.map_disclaimer),
    ));
  }

  /* ── 6) الصيغ والمصادر — الأعمدة الموحدة لصفحات المصادر في الملاحق ── */
  function pgProvenance(el) {
    const rel = RH.data.store.release();
    const rows = RH.presenter.ax.provenanceRows([
      "current_building", "current_operational", "licensed_beds",
      "baseline_building", "baseline_operational", "baseline_beds",
      "growth_building_pct", "growth_operational_pct", "growth_beds_pct",
    ]);

    const val = (r) => r.unit === "٪" ? fmt.pct(r.value) : fmt.unitAfter(r.value, r.unit);

    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        h("th", {}, "المؤشر"),
        h("th", {}, "القيمة"),
        h("th", {}, "المصدر"),
        h("th", {}, "الصيغة"),
      )),
      h("tbody", {}, rows.map((r) => h("tr", {},
        h("td", {}, r.label),
        h("td", { class: "num" }, val(r)),
        h("td", {}, r.source),
        h("td", {}, h("span", { class: "formula" }, r.formula)),
      ))),
    ));

    // الهدف الاسترشادي: يُعرض بقيمته وحالته الحرفية — لا يُعرض كمستهدف معتمد
    const ct = rel.coverage_target_indicative;
    el.appendChild(h("div", { class: "ax-note" },
      ct.label, ": ", h("b", {}, fmt.pct(ct.value)),
      " — الحالة: ", h("span", { class: "ltr" }, ct.status),
      ". ", ct.note,
    ));
  }

  RH.presenter.ax.register({
    id: "licensing",
    kicker: "ملحق تحليلي",
    title: "التراخيص — التفاصيل والتحليل",
    returnLabel: "العودة إلى التراخيص",
    pages: () => [
      { name: "صافي الإضافات الشهرية", build: pgMonthlyNet },
      { name: "الجسر من خط الأساس", build: pgBridge },
      { name: "مزيج أنواع الإيواء", build: pgFacilityMix },
      { name: "مقارنة القطاعات", build: (el) => pgSectorTable(el) },
      { name: "عينة الأحياء المدرجة", build: pgNeighbourhoods },
      { name: "الصيغ والمصادر", build: (el) => pgProvenance(el) },
    ],
  });
})();
