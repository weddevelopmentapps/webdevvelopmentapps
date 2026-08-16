/* s01-agenda.js — محاور العرض: ثلاث لوحات كبيرة قابلة للنقر (اللوحة ذاتها هدف
   الملاحة). معالجة اللوحات بأقنعة هادئة وزخرفة هندسية نجدية مرسومة كوداً —
   لا ثلاثة فيديوهات متزامنة، ولا تعليقات حشو. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;

  /** زخرفة نجدية هندسية هادئة (مثلثات متدرجة) — لغة محلية غير مقلَّدة */
  function najdiArt(seedHue) {
    const g = svg("svg", {
      viewBox: "0 0 400 520", preserveAspectRatio: "xMidYMid slice",
      "aria-hidden": "true",
    });
    g.appendChild(svg("rect", { width: 400, height: 520, fill: "transparent" }));
    for (let row = 0; row < 5; row++) {
      const y = 46 + row * 38;
      for (let i = 0; i < 7; i++) {
        const x = 22 + i * 54;
        g.appendChild(svg("path", {
          d: `M ${x},${y} l 20,-26 l 20,26 Z`,
          fill: "none",
          stroke: `rgba(214,171,76,${(0.16 - row * 0.025).toFixed(3)})`,
          "stroke-width": 1.4,
        }));
      }
    }
    g.appendChild(svg("circle", {
      cx: 200, cy: 420, r: 150, fill: `rgba(49,162,109,${seedHue})`,
      filter: "blur(2px)", opacity: 0.16,
    }));
    return g;
  }

  const PANELS = [
    { num: "01", name: "لوحة معلومات السكن الجماعي للأفراد", target: "02", art: 0.5 },
    { num: "02", name: "حالة المبادرات ومؤشرات الأداء", target: "08", art: 0.35 },
    { num: "03", name: "الخطوات القادمة", target: "11", art: 0.2 },
  ];

  function build(host, ctx) {
    const panels = h("div", { class: "agenda-panels" });
    for (const p of PANELS) {
      panels.appendChild(h("button", {
        class: "agenda-panel rise",
        onclick: () => RH.presenter.engine.goScene(p.target),
        "aria-label": p.name,
      },
        h("span", { class: "art" }, najdiArt(p.art)),
        h("span", { class: "agenda-num" }, p.num),
        h("span", { class: "agenda-name" }, p.name),
      ));
    }
    host.appendChild(h("section", {
      class: "sc sc-agenda", role: "region", "aria-label": "محاور العرض",
    },
      h("h2", { class: "agenda-title rise" }, "محاور العرض"),
      panels,
    ));
  }

  RH.presenter.engine.registerScene({ id: "01", kind: "cinematic", build });
})();
