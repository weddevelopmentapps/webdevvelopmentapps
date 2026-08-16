/* s03-demand-city.js — الطلب والطاقة والعجز والتغطية على مستوى المدينة
   العنوان التقريري المعتمد + ثلاثة أرقام بطولية + مقياس التغطية العلائقي
   (المرئي الرئيس — لا بطاقة رابعة). خطوة بناء ثانية اختيارية: تركيبة الياقات.
   لا شارة نمو سنوي — لا سلسلة تاريخية معتمدة للطلب (بوابة الجودة R6). */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** يبرز القيمة الرقمية داخل نص التقرير المعتمد دون فصل النص عن مصدره */
  function emphasize(text, value, cls) {
    const i = text.indexOf(value);
    if (i < 0) return [text];
    return [
      text.slice(0, i),
      h("b", cls ? { class: cls } : {}, value),
      text.slice(i + value.length),
    ];
  }

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const step = parseInt(ctx.params.step || "0", 10);
    const first = RH.viz.motion.firstEntry("s03");

    const coverage = der.coverage_pct;
    const uncovered = der.uncovered_pct;

    // الأرقام البطولية الثلاثة (حد الكثافة الأقصى)
    const figs = h("div", { class: "figs" },
      fig("إجمالي الطلب التقديري على الأسرّة", rel.metrics.total_demand.value, "", "demand-total", first),
      fig("الطاقة الاستيعابية المرخصة", rel.metrics.licensed_beds.value, "accent", "demand-cap", first),
      fig("عجز الأسرّة", der.deficit_beds, "deficit", "demand-def", first),
    );

    function fig(label, value, cls, key, animate) {
      const parts = fmt.compactParts(value);
      const numEl = h("span", { class: "num" }, parts.num);
      if (animate) {
        RH.viz.motion.countUp(numEl, value,
          (v) => fmt.compactParts(v).num, "s03-" + key, 950);
      }
      return h("div", { class: "fig " + (cls || "") },
        h("div", { class: "fig-label" }, label),
        h("div", { class: "fig-value" },
          numEl,
          parts.word ? h("span", { class: "word" }, parts.word) : null,
          h("span", { class: "unit" }, "سرير"),
        ),
        h("div", { class: "fig-foot" }, fmt.unitAfter(value, "سرير")),
      );
    }

    // المرئي العلائقي الرئيس: مقياس التغطية
    const meter = h("div", { class: "coverage-meter", role: "img",
      "aria-label": `نسبة تغطية الطلب ${fmt.pct(coverage)} — نسبة الطلب غير المغطى ${fmt.pct(uncovered)}` },
      h("div", { class: "track" },
        h("div", { class: "fill", style: { width: (first && !RH.viz.motion.REDUCED ? 0 : coverage) + "%" } },
          h("span", { class: "inlabel", style: { insetInlineStart: "calc(var(--su) * 26)" } },
            "نسبة تغطية الطلب " + fmt.pct(coverage)),
        ),
        h("span", { class: "inlabel on-deficit", style: { insetInlineEnd: "calc(var(--su) * 26)" } },
          "نسبة الطلب غير المغطى " + fmt.pct(uncovered)),
      ),
      h("div", { class: "mlabel", style: { insetInlineStart: "0" } },
        "الطاقة المرخصة ", h("b", {}, fmt.unitAfter(rel.metrics.licensed_beds.value, "سرير"))),
      h("div", { class: "mlabel", style: { insetInlineEnd: "0" } },
        "عجز الأسرّة ", h("b", {}, fmt.unitAfter(der.deficit_beds, "سرير"))),
    );
    if (first && !RH.viz.motion.REDUCED) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        meter.querySelector(".fill").style.width = coverage + "%";
      }));
    }

    // خطوة البناء 2: تركيبة الياقات (ثنائية متحقق منها لونياً: أزرق/رملي)
    const blue = der.blue_share_pct, white = der.white_share_pct;
    const collar = h("div", {
      class: "collar-split",
      style: {
        opacity: step >= 1 ? "1" : "0",
        transition: "opacity 400ms var(--ease)",
        marginTop: "calc(var(--su) * 56)",
      },
      "aria-hidden": step >= 1 ? "false" : "true",
    },
      h("div", { class: "fig-label", style: { fontSize: "calc(var(--su)*19)", color: "var(--mut-d)", fontWeight: "600", marginBottom: "calc(var(--su)*12)" } },
        "تركيبة الطلب حسب فئة العمالة"),
      h("div", {
        style: { display: "flex", height: "calc(var(--su)*40)", borderRadius: "calc(var(--su)*10)", overflow: "hidden", gap: "2px" },
        role: "img",
        "aria-label": `الياقات الزرقاء ${fmt.pct(blue)} والياقات البيضاء ${fmt.pct(white)}`,
      },
        h("div", { style: { width: blue + "%", background: "var(--collar-blue)" } }),
        h("div", { style: { width: white + "%", background: "var(--demand)" } }),
      ),
      h("div", { style: { display: "flex", justifyContent: "space-between", marginTop: "calc(var(--su)*10)", fontSize: "calc(var(--su)*16)", color: "var(--mut-d)" } },
        h("span", {}, "الياقات الزرقاء ", h("b", { style: { color: "var(--ivory)" } },
          fmt.pct(blue)), " — ", fmt.unitAfter(rel.collar.blue, "سرير")),
        h("span", {}, "الياقات البيضاء ", h("b", { style: { color: "var(--ivory)" } },
          fmt.pct(white)), " — ", fmt.unitAfter(rel.collar.white, "سرير")),
      ),
    );

    host.appendChild(h("section", {
      class: "sc", role: "region", "aria-label": "الطلب على مستوى المدينة",
    },
      h("div", { class: "sc-question rise" }, "ما حجم الفجوة بين الطلب التقديري والطاقة الاستيعابية المرخصة؟"),
      h("h2", { class: "sc-headline rise" },
        emphasize(rel.insights.s03.text, fmt.pct(coverage))),
      h("div", { class: "sc-body rise" },
        figs,
        h("div", { class: "sc-visual", style: { display: "flex", flexDirection: "column", justifyContent: "center", paddingInlineStart: "calc(var(--su)*30)" } },
          meter, collar),
      ),
      h("div", { class: "sc-foot rise" },
        h("div", { class: "sc-source" },
          "المصدر: ملف بيانات المنصة (ورقتا الطلب والسياق) · البيانات حتى " + rel.meta.data_as_of),
        h("button", {
          class: "btn-appendix",
          onclick: () => RH.presenter.engine.openAppendix("demand"),
        }, "عرض التفاصيل والتحليل"),
      ),
    ));
  }

  RH.presenter.engine.registerScene({ id: "03", kind: "analytic", steps: 2, build });
})();
