/* s09-pillars.js — محفظة الاستراتيجية (كوكبة الركائز)
   عند اعتماد المصدر: كوكبة N-ركائز (حتى 7) بحلقة مركزية لنسبة الإنجاز
   الإجمالية — تُعرض النسبة الدقيقة فقط إذا كانت منهجية الأوزان معتمدة
   (strat.publishable)، وإلا فتوزيع الحالات. عند غيابه: مشهد حالة اعتماد
   شريف بلغة عرض لائقة — لا ركائز ملفّقة ولا أصفار زائفة (بوابة R4/R5). */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  function pendingGlyph() {
    return svg("svg", {
      viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
      "stroke-width": 1.1, "stroke-linecap": "round", "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
      svg("circle", { cx: 12, cy: 12, r: 9, "stroke-dasharray": "4 3" }),
      svg("path", { d: "M12 7v5l3 3" }),
    );
  }

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const st = rel.strategy;

    if (st.status !== "approved" || !st.pillars.length) {
      host.appendChild(h("section", {
        class: "sc", role: "region", "aria-label": "محفظة الاستراتيجية",
      },
        h("div", { class: "sc-question rise" }, "ما مستوى إنجاز الاستراتيجية، وأي الركائز تتطلب التدخل؟"),
        h("div", { class: "pending-scene rise" },
          h("div", { class: "glyph" }, pendingGlyph()),
          h("h2", {}, "تُستكمل محفظة الركائز والمبادرات فور اعتماد مصدرها الرسمي"),
          h("p", {},
            "تعريفات الركائز السبع والمبادرات وأوزانها ونسب إنجازها مملوكة للوثيقة المعتمدة ",
            h("span", { class: "src-name" }, "«" + st.source_required + "»"),
            "، ولم تُرفَق بعد. تعرض هذه الشاشة الحالة بأمانة بدل أي أرقام تقديرية، ويُستكمل النشر من الإدارة فور ورود الوثيقة."),
        ),
      ));
      return;
    }

    const strat = RH.data.store.der().strategy;
    const stage = h("div", { class: "sc-visual" });
    RH.viz.rings.constellation(stage, st, strat, {
      onSelect: (pid) => RH.presenter.engine.openAppendix("pillar/" + pid),
    });

    // عند غياب نسب/أوزان معتمدة: توزيع الحالات بدل نسبة دقيقة
    let statusStrip = null;
    if (!strat.publishable && strat.status_counts) {
      const c = strat.status_counts.execution;
      statusStrip = h("div", { class: "stat-strip rise" },
        Object.entries(c).map(([k, v]) => h("div", { class: "cell" },
          h("div", { class: "slabel" }, k),
          h("div", { class: "svalue" }, fmt.noun(v, "initiative")),
        )),
      );
    }

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "محفظة الاستراتيجية",
    },
      h("div", { class: "sc-question rise" }, "ما مستوى إنجاز الاستراتيجية، وأي الركائز تتطلب التدخل؟"),
      h("h2", { class: "sc-headline rise", style: { fontSize: "calc(var(--su)*40)" } },
        strat.publishable
          ? ["نسبة الإنجاز الإجمالية للاستراتيجية ", h("b", {}, fmt.pct(strat.overall_pct)),
             " عبر ", fmt.noun(st.pillars.length, "pillar")]
          : "محفظة الركائز — توزيع حالات التنفيذ (النسبة الدقيقة بانتظار اعتماد الأوزان)"),
      h("div", { class: "sc-body rise" }, stage),
      statusStrip,
      h("div", { class: "sc-foot rise" },
        h("div", { class: "sc-source" },
          "المصدر: " + st.source_required + " · انقر ركيزة لاستعراض مبادراتها"),
      ),
    ));
  }

  RH.presenter.engine.registerScene({ id: "09", kind: "portfolio", build });
})();
