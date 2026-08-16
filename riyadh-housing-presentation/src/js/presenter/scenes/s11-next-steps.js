/* s11-next-steps.js — الخطوات القادمة والقرارات المطلوبة
   3–4 بنود معتمدة تديرها الإدارة حصراً (الإجراء/الجهة/الاستحقاق/الحالة/القرار).
   عند غياب الاعتماد: حالة شريفة — لا خطوات ملفّقة أمام أمين المنطقة. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const ns = rel.next_steps;

    if (ns.status !== "approved" || !ns.items.length) {
      host.appendChild(h("section", {
        class: "sc", role: "region", "aria-label": "الخطوات القادمة",
      },
        h("h2", { class: "agenda-title rise" }, "الخطوات القادمة والقرارات المطلوبة"),
        h("div", { class: "pending-scene rise" },
          h("div", { class: "glyph" },
            svg("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
              "stroke-width": 1.1, "stroke-linecap": "round", "stroke-linejoin": "round",
              "aria-hidden": "true" },
              svg("path", { d: "M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01",
                "stroke-dasharray": "2 3" })),
          ),
          h("h2", {}, "تُعتمد الخطوات القادمة قبل يوم العرض من الجهة المخوَّلة"),
          h("p", {},
            "تُدخل الخطوات والقرارات المطلوبة من الإدارة المخوَّلة (الإجراء، الجهة المسؤولة، ",
            "تاريخ الاستحقاق، حالة التنفيذ، القرار المطلوب) وتُعتمد ثم تُنشر. ",
            "لا تعرض هذه الشاشة أي خطوات غير معتمدة."),
        ),
      ));
      return;
    }

    const list = h("ol", { class: "steps-list rise" });
    ns.items.forEach((item, i) => {
      list.appendChild(h("li", { class: "step-item" },
        h("span", { class: "step-num", "aria-hidden": "true" },
          String(i + 1).padStart(2, "0")),
        h("div", {},
          h("div", { class: "step-action" }, item.action),
          h("div", { class: "step-meta" },
            item.owner ? h("span", {}, "الجهة المسؤولة: ", h("b", {}, item.owner)) : null,
            item.due ? h("span", {}, "تاريخ الاستحقاق: ", h("b", {}, fmt.date(item.due))) : null,
            item.status ? h("span", {}, "حالة التنفيذ: ", h("b", {}, item.status)) : null,
          ),
        ),
        item.decision
          ? h("div", { class: "step-decision" }, "القرار المطلوب: " + item.decision)
          : h("span", {}),
      ));
    });

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "الخطوات القادمة",
    },
      h("h2", { class: "agenda-title rise" }, "الخطوات القادمة والقرارات المطلوبة"),
      list,
    ));
  }

  RH.presenter.engine.registerScene({ id: "11", kind: "cinematic", build });
})();
