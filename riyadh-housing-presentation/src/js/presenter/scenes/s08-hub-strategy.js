/* s08-hub-strategy.js — بوابة الاستراتيجية: المبادرات / مؤشرات الأداء
   بوابة محفظة بانتقال مقطعي داخلي — لا شريط تبويبات ويب. «التالي» يدخل 09؛
   اختيار المؤشرات يقفز إلى 10. الحقائق تُشتق من حالة المصدر الفعلية — لا تلفيق. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  function glyph(d) {
    return svg("svg", {
      viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
      "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round",
      "aria-hidden": "true",
    }, svg("path", { d }));
  }

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const st = rel.strategy;
    const approved = st.status === "approved";

    const iniFact = approved
      ? [fmt.noun(st.initiatives.length, "initiative"), " عبر ",
         fmt.noun(st.pillars.length, "pillar")]
      : ["تُستكمل بعد اعتماد ", h("b", {}, st.source_required)];
    const kpiFact = approved
      ? [fmt.noun(st.kpis.filter((k) => k.priority).length, "indicator"), " ذات أولوية لهذا العرض"]
      : ["تُستكمل بعد اعتماد ", h("b", {}, st.source_required)];

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "حالة المبادرات ومؤشرات الأداء",
    },
      h("h2", { class: "agenda-title rise" }, "حالة المبادرات ومؤشرات الأداء"),
      h("div", { class: "hub-panels g2 rise" },
        h("button", {
          class: "hub-panel",
          onclick: () => RH.presenter.engine.goScene("09"),
          "aria-label": "المبادرات",
        },
          h("span", { class: "hub-glyph" }, glyph("M5 21V4 M5 4h13l-2.5 4L18 12H5")),
          h("span", {},
            h("span", { class: "hub-name" }, "المبادرات"),
            h("span", { class: "hub-fact" }, iniFact),
          ),
        ),
        h("button", {
          class: "hub-panel",
          onclick: () => RH.presenter.engine.goScene("10"),
          "aria-label": "مؤشرات الأداء",
        },
          h("span", { class: "hub-glyph" },
            glyph("M4 20V10 M10 20V4 M16 20v-7 M22 20H2")),
          h("span", {},
            h("span", { class: "hub-name" }, "مؤشرات الأداء"),
            h("span", { class: "hub-fact" }, kpiFact),
          ),
        ),
      ),
    ));
  }

  RH.presenter.engine.registerScene({ id: "08", kind: "hub", build });
})();
