/* s02-hub-housing.js — بوابة لوحة السكن: ثلاثية الطلب/التراخيص/الرقابة
   كل اختيار يحمل حقيقة مصدرية واحدة (لا بطاقات زخرفية). «التالي» يدخل قصة
   الطلب (03)؛ اختيار التراخيص يقفز إلى 05 والرقابة إلى 07 — ومن أي قفزة
   يواصل «التالي» التسلسل الخطي دون حبس المقدِّم. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  const GLYPHS = {
    demand: "M12 3v18 M5 7h14 M5 7 3 12h4L5 7z M19 7l-2 5h4l-2-5z M8 21h8",
    licenses: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M14 3v6h6 M9 13h6 M9 17h4",
    control: "M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6z m-2.8 9 2 2 3.6-3.8",
  };

  function glyph(d) {
    return svg("svg", {
      viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
      "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round",
      "aria-hidden": "true",
    }, svg("path", { d }));
  }

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();

    const panels = [
      {
        name: "الطلب", target: "03", d: GLYPHS.demand,
        fact: ["إجمالي الطلب التقديري ", h("b", {}, fmt.compact(rel.metrics.total_demand.value) + " سرير"),
          "، تغطي الطاقة المرخصة ", h("b", {}, fmt.pct(der.coverage_pct)), " منه"],
      },
      {
        name: "التراخيص", target: "05", d: GLYPHS.licenses,
        fact: [h("b", {}, fmt.noun(rel.metrics.current_operational.value, "licence")),
          " تشغيلية، وطاقتها الاستيعابية ",
          h("b", {}, fmt.compact(rel.metrics.licensed_beds.value) + " سرير"),
          " حتى " + rel.meta.data_as_of],
      },
      {
        name: "الرقابة", target: "07", d: GLYPHS.control,
        fact: [h("b", {}, fmt.int(rel.metrics.total_visits.value) + " زيارة"),
          " ميدانية خلال " + rel.meta.monitoring_period_label],
      },
    ];

    const wrap = h("div", { class: "hub-panels g3" });
    for (const p of panels) {
      wrap.appendChild(h("button", {
        class: "hub-panel rise",
        onclick: () => RH.presenter.engine.goScene(p.target),
        "aria-label": p.name,
      },
        h("span", { class: "hub-glyph" }, glyph(p.d)),
        h("span", {},
          h("span", { class: "hub-name" }, p.name),
          h("span", { class: "hub-fact" }, p.fact),
        ),
      ));
    }

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "لوحة معلومات السكن الجماعي",
    },
      h("h2", { class: "agenda-title rise" }, "لوحة معلومات السكن الجماعي للأفراد"),
      wrap,
    ));
  }

  RH.presenter.engine.registerScene({ id: "02", kind: "hub", build });
})();
