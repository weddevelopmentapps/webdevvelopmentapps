/* s04-demand-geo.js — التركز الجغرافي للطلب وفجوة التغطية
   الخريطة القطاعية هي المرئي الرئيس. نقر قطاع يكشف تفصيلاً مركّزاً داخل السرد
   (بطاقة زجاجية) دون مغادرة المشهد. خطوة البناء 2: طبقة التغطية.
   حالة الاختيار تُحفظ في العنوان (sector=) لتعود بدقة من الملحق. */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const step = parseInt(ctx.params.step || "0", 10);
    const selected = ctx.params.sector || null;
    const metric = step >= 1 ? "coverage" : "demand";

    const mapBox = h("div", { class: "sc-visual" });
    const mapWrap = h("div", { style: { position: "absolute", inset: "0" } });
    mapBox.appendChild(mapWrap);

    let detail = null;
    if (selected) {
      const s = rel.sectors.find((x) => x.id === selected);
      const sd = der.sector[selected];
      if (s) {
        detail = h("aside", { class: "sector-detail", role: "region", "aria-label": "تفصيل " + s.name },
          h("h3", {}, s.name),
          drow("الطلب على الأسرّة", fmt.unitAfter(s.demand, "سرير")),
          drow("الطاقة الاستيعابية المرخصة", fmt.unitAfter(s.beds, "سرير")),
          drow("نسبة تغطية الطلب", fmt.pct(sd.coverage_pct),
            sd.coverage_pct >= der.coverage_pct ? "pos" : "neg"),
          drow("عجز الأسرّة", fmt.unitAfter(sd.deficit_beds, "سرير"), "neg"),
          drow("حصة القطاع من طلب المدينة", fmt.pct(sd.demand_share_pct)),
          h("button", {
            class: "dclose", "data-interactive": "1",
            onclick: () => ctx.update({ sector: null }),
          }, "إغلاق التفصيل"),
        );
      }
    }

    function drow(label, value, cls) {
      return h("div", { class: "drow" },
        h("span", { class: "dlabel" }, label),
        h("span", { class: "dvalue " + (cls || "") }, value));
    }

    const info = RH.viz.map.render(mapWrap, {
      metric,
      su: ctx.su,
      focus: selected,
      dimOthers: !!selected,
      onSelect: (id) => ctx.update({ sector: id === selected ? null : id }),
    });
    if (detail) mapBox.appendChild(detail);

    const steps = h("div", { class: "layer-steps", role: "tablist", "aria-label": "طبقة الخريطة" },
      stepBtn("الطلب", 0), stepBtn("نسبة التغطية", 1));
    function stepBtn(label, n) {
      return h("button", {
        class: n === step ? "on" : "", role: "tab",
        "aria-selected": n === step ? "true" : "false",
        onclick: () => ctx.update({ step: n === 0 ? null : String(n) }),
      }, label);
    }

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "التركز الجغرافي للطلب",
    },
      h("div", { class: "sc-question rise" }, "أين يتركز الطلب، وأين تتسع فجوة التغطية؟"),
      h("h2", { class: "sc-headline rise", style: { fontSize: "calc(var(--su) * 44)" } },
        rel.insights.s04.text),
      h("div", { class: "sc-body rise" }, mapBox),
      h("div", { class: "sc-foot rise" },
        h("div", { style: { display: "flex", alignItems: "center", gap: "calc(var(--su)*28)" } },
          steps, RH.viz.map.legendEl(info, ctx.su)),
        h("button", {
          class: "btn-appendix",
          onclick: () => RH.presenter.engine.openAppendix("demand"),
        }, "عرض التفاصيل والتحليل"),
      ),
    ));
  }

  RH.presenter.engine.registerScene({ id: "04", kind: "analytic", steps: 2, build });
})();
