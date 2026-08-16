/* s10-kpis.js — مؤشرات الأولوية
   أقواس عالية الوضوح لمؤشرات الأولوية فقط (لا 14 عداداً محتشدة). كل مؤشر يعرض
   حقوله المعتمدة كاملة. المفقود لا يتحول صفراً أبداً؛ نشر مؤشر أولوية بلا قيمة
   محجوب أو يتطلب تنازلاً مسجَّلاً (تفرضه بوابات النشر في validate.js). */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const st = rel.strategy;

    if (st.status !== "approved" || !st.kpis.length) {
      host.appendChild(h("section", {
        class: "sc", role: "region", "aria-label": "مؤشرات الأداء ذات الأولوية",
      },
        h("div", { class: "sc-question rise" }, "مؤشرات الأداء ذات الأولوية"),
        h("div", { class: "pending-scene rise" },
          h("div", { class: "glyph" },
            svg("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
              "stroke-width": 1.1, "stroke-linecap": "round", "aria-hidden": "true" },
              svg("path", { d: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2", "stroke-dasharray": "3 3" })),
          ),
          h("h2", {}, "تُستكمل مؤشرات الأداء فور اعتماد مصدرها وتسجيل قيمها الحالية"),
          h("p", {},
            "تعريفات المؤشرات ومستهدفاتها مملوكة للوثيقة المعتمدة ",
            h("span", { class: "src-name" }, "«" + st.source_required + "»"),
            "، وتُسجَّل القيم الحالية من الإدارة بمصدر وتاريخ قياس لكل مؤشر. ",
            "لا تعرض هذه المنصة قيماً مصطنعة ولا تحوّل الغياب إلى صفر."),
        ),
      ));
      return;
    }

    const priority = st.kpis.filter((k) => k.priority);
    const grid = h("div", {
      class: "kpi-grid rise",
      style: {
        flex: "1", minHeight: "0", display: "grid",
        gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, priority.length))}, 1fr)`,
        gap: "calc(var(--su)*30)", alignContent: "center",
      },
    });
    for (const k of priority) RH.viz.rings.kpiArc(grid, k, ctx.su);

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "مؤشرات الأداء ذات الأولوية",
    },
      h("div", { class: "sc-question rise" }, "ما المؤشرات ذات الأولوية، وأين تتركز الفجوة عن المستهدف؟"),
      h("h2", { class: "sc-headline rise", style: { fontSize: "calc(var(--su)*42)" } },
        "مؤشرات الأولوية المعتمدة لعرض " + (rel.meta.data_as_of || "")),
      grid,
      h("div", { class: "sc-foot rise" },
        h("div", { class: "sc-source" }, "المصدر: " + st.source_required),
        h("button", {
          class: "btn-appendix",
          onclick: () => RH.presenter.engine.openAppendix("kpi"),
        }, "عرض التفاصيل والتحليل"),
      ),
    ));
  }

  RH.presenter.engine.registerScene({ id: "10", kind: "analytic", build });
})();
