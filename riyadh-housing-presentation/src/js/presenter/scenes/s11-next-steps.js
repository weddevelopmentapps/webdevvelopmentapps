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
      // خاتمة كريمة بلا تلفيق: خلاصة الحقائق الثلاث الموثقة التي تستدعي القرار،
      // وسطر صريح بموضع الخطوات المعتمدة عند ورودها
      const der = RH.data.store.der();
      const fact = (label, valueEls, foot) => h("div", { class: "cell", style: { padding: "calc(var(--su)*34) calc(var(--su)*40)" } },
        h("div", { class: "slabel", style: { fontSize: "calc(var(--su)*19)" } }, label),
        h("div", { class: "svalue", style: { fontSize: "calc(var(--su)*66)", fontWeight: "300", marginTop: "calc(var(--su)*10)" } }, valueEls),
        foot ? h("div", { class: "slabel", style: { marginTop: "calc(var(--su)*10)", fontWeight: "400", fontSize: "calc(var(--su)*16)" } }, foot) : null,
      );
      host.appendChild(h("section", {
        class: "sc", role: "region", "aria-label": "خلاصة العرض والخطوات القادمة",
      },
        h("h2", { class: "agenda-title rise" }, "خلاصة الصورة الراهنة"),
        h("div", { class: "rise", style: { flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "calc(var(--su)*44)" } },
          h("div", { class: "stat-strip", style: { borderBlockWidth: "1px" } },
            fact("نسبة تغطية الطلب التقديري",
              [h("b", { style: { color: "var(--green-hi)", fontWeight: 400 } }, fmt.pct(der.coverage_pct))],
              "عجز قائم قدره " + fmt.unitAfter(der.deficit_beds, "سرير")),
            fact("نمو رخص البناء منذ خط الأساس",
              [h("b", { style: { fontWeight: 400 } }, fmt.pct(der.growth_building_pct))],
              "مقابل " + fmt.pct(der.growth_beds_pct) + " نمواً في الطاقة المرخصة"),
            fact("تركز الضغط الرقابي",
              [h("b", { style: { color: "var(--coral)", fontWeight: 400 } },
                fmt.pct(der.south_violations_share_pct))],
              "من مخالفات المدينة في قطاع الجنوب"),
          ),
          h("p", { style: { fontSize: "calc(var(--su)*20)", color: "var(--mut-d)", lineHeight: "1.9", maxWidth: "calc(var(--su)*1250)" } },
            "تُعرض في هذه الشاشة الخطوات القادمة والقرارات المطلوبة (الإجراء، الجهة المسؤولة، ",
            "تاريخ الاستحقاق، حالة التنفيذ، القرار المطلوب) فور اعتمادها من الجهة المخوَّلة — ",
            "ولا تعرض المنصة أي خطوات غير معتمدة."),
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
