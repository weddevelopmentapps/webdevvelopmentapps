/* s05-lic-baseline.js — تطور التراخيص من خط الأساس
   الجسر التراكمي المطلوب حرفياً: خط الأساس قبل سبتمبر 2025 ← صافي الإضافات
   الشهرية ← الإجمالي حتى أغسطس 2026. خطوات البناء تقلب المقياس:
   رخص البناء ← الرخص التشغيلية ← الأسرّة. لا «مشهد التراخيص» ولا «نمو مطرد». */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  const STEPS = [
    { key: "building", label: "رخص البناء" },
    { key: "operational", label: "الرخص التشغيلية" },
    { key: "beds", label: "الطاقة الاستيعابية المرخصة" },
  ];

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const step = Math.min(2, parseInt(ctx.params.step || "0", 10));
    const cfg = STEPS[step];
    const first = RH.viz.motion.firstEntry("s05-" + cfg.key);

    const figs = h("div", { class: "figs", style: { minWidth: "calc(var(--su)*470)" } },
      figDelta("رخص البناء", rel.metrics.current_building.value,
        der.growth_building_abs, der.growth_building_pct, "رخصة", step === 0),
      figDelta("الرخص التشغيلية", rel.metrics.current_operational.value,
        der.growth_operational_abs, der.growth_operational_pct, "رخصة", step === 1),
      figDelta("الطاقة الاستيعابية المرخصة", rel.metrics.licensed_beds.value,
        der.growth_beds_abs, der.growth_beds_pct, "سرير", step === 2),
    );

    function figDelta(label, value, dAbs, dPct, unit, active) {
      const parts = fmt.compactParts(value);
      return h("div", { class: "fig" + (active ? " accent" : ""),
        style: active ? {} : { opacity: "0.55" } },
        h("div", { class: "fig-label" }, label),
        h("div", { class: "fig-value", style: { fontSize: "calc(var(--su)*64)" } },
          h("span", { class: "num" }, parts.num),
          parts.word ? h("span", { class: "word" }, parts.word) : null,
          h("span", { class: "unit" }, unit),
        ),
        h("div", { class: "fig-foot" },
          "زيادة قدرها " + fmt.int(dAbs) + " " + (unit === "سرير" ? "سرير" : "رخصة")
          + " (" + fmt.pct(dPct) + ") منذ خط الأساس"),
      );
    }

    const chartEl = h("div", { class: "chart" });

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "تطور التراخيص من خط الأساس",
    },
      h("div", { class: "sc-question rise" }, "كيف تطورت التراخيص والطاقة الاستيعابية منذ خط الأساس؟"),
      h("h2", { class: "sc-headline rise", style: { fontSize: "calc(var(--su)*46)" } },
        rel.insights.s05.text),
      h("div", { class: "sc-body rise" },
        figs,
        h("div", { class: "sc-visual" }, chartEl),
      ),
      h("div", { class: "sc-foot rise" },
        h("div", { style: { display: "flex", alignItems: "center", gap: "calc(var(--su)*28)" } },
          h("div", { class: "layer-steps", role: "tablist", "aria-label": "مقياس الجسر" },
            STEPS.map((s, i) => h("button", {
              class: i === step ? "on" : "", role: "tab",
              "aria-selected": i === step ? "true" : "false",
              onclick: () => ctx.update({ step: i === 0 ? null : String(i) }),
            }, s.label)),
          ),
          h("span", { class: "sc-source" }, rel.meta.comparison_qualifier),
        ),
        h("button", {
          class: "btn-appendix",
          onclick: () => RH.presenter.engine.openAppendix("licensing"),
        }, "عرض التفاصيل والتحليل"),
      ),
    ));

    requestAnimationFrame(() => {
      RH.viz.charts.bridge(chartEl, ctx.su, cfg.key, first);
    });
  }

  RH.presenter.engine.registerScene({ id: "05", kind: "analytic", steps: 3, build });
})();
