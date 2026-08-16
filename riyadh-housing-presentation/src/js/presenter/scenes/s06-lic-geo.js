/* s06-lic-geo.js — التوزيع الجغرافي للتراخيص والطاقة
   الخريطة القطاعية المرئي الوحيد المهيمن، بتسلسل بناء حتمي لجهاز التقديم:
   رخص البناء ← الرخص التشغيلية ← الطاقة المرخصة. */
"use strict";

(function () {
  const { h } = RH.core.dom;

  const LAYERS = [
    { metric: "building", label: "رخص البناء" },
    { metric: "operational", label: "الرخص التشغيلية" },
    { metric: "beds", label: "الطاقة الاستيعابية المرخصة" },
  ];

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const step = Math.min(2, parseInt(ctx.params.step || "0", 10));

    const mapBox = h("div", { class: "sc-visual" });
    const info = RH.viz.map.render(mapBox, {
      metric: LAYERS[step].metric,
      su: ctx.su,
      onSelect: () => {},
    });

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "التوزيع الجغرافي للتراخيص",
    },
      h("div", { class: "sc-question rise" }, "كيف تتوزع التراخيص والطاقة الاستيعابية جغرافياً؟"),
      h("h2", { class: "sc-headline rise", style: { fontSize: "calc(var(--su)*36)", lineHeight: "1.6" } },
        rel.insights.s06.text),
      h("div", { class: "sc-body rise" }, mapBox),
      h("div", { class: "sc-foot rise" },
        h("div", { style: { display: "flex", alignItems: "center", gap: "calc(var(--su)*28)" } },
          h("div", { class: "layer-steps", role: "tablist", "aria-label": "طبقة الخريطة" },
            LAYERS.map((l, i) => h("button", {
              class: i === step ? "on" : "", role: "tab",
              "aria-selected": i === step ? "true" : "false",
              onclick: () => ctx.update({ step: i === 0 ? null : String(i) }),
            }, l.label)),
          ),
          RH.viz.map.legendEl(info, ctx.su),
        ),
        h("button", {
          class: "btn-appendix",
          onclick: () => RH.presenter.engine.openAppendix("licensing"),
        }, "عرض التفاصيل والتحليل"),
      ),
    ));
  }

  RH.presenter.engine.registerScene({ id: "06", kind: "analytic", steps: 3, build });
})();
