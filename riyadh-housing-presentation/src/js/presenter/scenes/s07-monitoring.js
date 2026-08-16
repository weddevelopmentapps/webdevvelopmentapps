/* s07-monitoring.js — الرقابة والامتثال والضغط الجغرافي
   ثلاثة أرقام أولية بفترة صريحة + سطر ثانوي (الإغلاق والامتثال بوسم منهجيته) —
   لا بطاقتين إضافيتين متساويتين. الخريطة: المخالفات مع عدد المراقبين.
   قائمة المفتشين والنقاط الساخنة غير المتحقق منها محجورتان (R1/R2). */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const step = parseInt(ctx.params.step || "0", 10);
    const first = RH.viz.motion.firstEntry("s07");

    const figs = h("div", { class: "figs", style: { minWidth: "calc(var(--su)*480)" } },
      fig("إجمالي المراقبين حتى " + rel.meta.data_as_of,
        rel.metrics.total_monitors.value, "مراقباً", "monitors"),
      fig("الزيارات الميدانية خلال " + rel.meta.monitoring_period_label,
        rel.metrics.total_visits.value, "زيارة", "visits"),
      fig("المخالفات المسجلة خلال الفترة نفسها",
        rel.metrics.total_violations.value, "مخالفة", "violations", "deficit"),
    );

    function fig(label, value, unit, key, cls) {
      const numEl = h("span", { class: "num" }, fmt.int(value));
      if (first) {
        RH.viz.motion.countUp(numEl, value, (v) => fmt.int(v), "s07-" + key, 900);
      }
      return h("div", { class: "fig " + (cls || "") },
        h("div", { class: "fig-label", style: { maxWidth: "calc(var(--su)*440)" } }, label),
        h("div", { class: "fig-value", style: { fontSize: "calc(var(--su)*72)" } },
          numEl, h("span", { class: "unit" }, unit)),
      );
    }

    // السطر الثانوي: الإغلاق + الامتثال الموسوم (لا يُقدَّم كمؤشر معتمد)
    const secondary = h("div", { class: "secondary-line rise", style: { marginTop: "calc(var(--su)*8)", paddingTop: "calc(var(--su)*20)", borderTop: "1px solid var(--hair-d2)" } },
      h("span", {}, "قرارات الإغلاق ", h("b", {}, fmt.int(rel.metrics.total_closures.value)), " قراراً"),
      h("span", {},
        rel.compliance.label + " ", h("b", {}, fmt.pct(rel.compliance.value)), " ",
        h("span", { class: "badge-pending", title: rel.compliance.note },
          "قيمة مورّدة — بانتظار اعتماد المنهجية")),
    );

    const mapBox = h("div", { class: "sc-visual" });
    const info = RH.viz.map.render(mapBox, {
      metric: step >= 1 ? "monitors" : "violations",
      secondary: step >= 1 ? "violations" : "monitors",
      su: ctx.su,
      onSelect: () => {},
    });

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "الرقابة الميدانية",
    },
      h("div", { class: "sc-question rise" }, "أين يتركز الضغط الرقابي خلال الفترة المرجعية؟"),
      h("h2", { class: "sc-headline rise", style: { fontSize: "calc(var(--su)*40)" } },
        rel.insights.s07.text),
      h("div", { class: "sc-body rise", style: { marginTop: "calc(var(--su)*24)" } },
        h("div", { style: { display: "flex", flexDirection: "column", gap: "calc(var(--su)*30)", justifyContent: "center" } },
          figs, secondary),
        mapBox,
      ),
      h("div", { class: "sc-foot rise" },
        h("div", { style: { display: "flex", alignItems: "center", gap: "calc(var(--su)*28)" } },
          h("div", { class: "layer-steps", role: "tablist", "aria-label": "طبقة الخريطة" },
            h("button", {
              class: step === 0 ? "on" : "", role: "tab",
              "aria-selected": step === 0 ? "true" : "false",
              onclick: () => ctx.update({ step: null }),
            }, "المخالفات"),
            h("button", {
              class: step === 1 ? "on" : "", role: "tab",
              "aria-selected": step === 1 ? "true" : "false",
              onclick: () => ctx.update({ step: "1" }),
            }, "عدد المراقبين"),
          ),
          RH.viz.map.legendEl(info, ctx.su),
        ),
        h("button", {
          class: "btn-appendix",
          onclick: () => RH.presenter.engine.openAppendix("monitoring"),
        }, "عرض التفاصيل والتحليل"),
      ),
    ));
  }

  RH.presenter.engine.registerScene({ id: "07", kind: "analytic", steps: 2, build });
})();
