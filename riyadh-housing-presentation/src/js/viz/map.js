/* map.js — خريطة قطاعات الرياض (رسم كودي أصيل)
   ─────────────────────────────────────────────
   هندسة توضيحية مرسومة بمنحنيات ناعمة لخمسة قطاعات بترتيبها الجغرافي العام
   (الشمال أعلى، الشرق يمين، الوسط، الغرب يسار، الجنوب أسفل) مع مسار رمزي
   لوادي حنيفة. ليست حدوداً إدارية رسمية — لذلك وسم «خريطة توضيحية» إلزامي
   ويعرضه كل استخدام (بوابة الجودة R11). التلوين تسلسلي أحادي الصبغة حسب
   المقياس المختار، والقيم تُكتب مباشرة على القطاعات (لا اعتماد على تحويم). */
"use strict";

RH.viz.map = (function () {
  const { svg } = RH.core.dom;
  const T = RH.viz.theme;
  const fmt = RH.core.fmt;

  const GEO = {
    north: {
      d: "M 165,255 C 150,160 200,95 320,88 C 480,78 700,70 830,100 " +
         "C 900,118 915,210 890,300 C 800,330 700,318 600,322 " +
         "C 470,328 320,300 165,255 Z",
      label: [520, 205],
    },
    east: {
      d: "M 890,300 C 935,420 945,580 915,720 C 850,760 760,742 660,700 " +
         "C 610,678 575,668 565,655 C 590,540 595,420 600,322 " +
         "C 700,318 800,330 890,300 Z",
      label: [768, 505],
    },
    center: {
      d: "M 600,322 C 595,420 590,540 565,655 C 520,668 470,676 425,668 " +
         "C 405,560 400,440 388,336 C 460,340 540,330 600,322 Z",
      label: [494, 498],
    },
    west: {
      d: "M 165,255 C 320,300 365,325 388,336 C 400,440 405,560 425,668 " +
         "C 430,750 420,800 360,845 C 250,820 140,760 105,640 " +
         "C 80,520 100,380 165,255 Z",
      label: [242, 520],
    },
    south: {
      d: "M 360,845 C 420,800 430,750 425,668 C 470,676 520,668 565,655 " +
         "C 575,668 610,678 660,700 C 760,742 850,760 915,720 " +
         "C 930,830 880,950 760,1010 C 600,1075 420,1060 300,980 " +
         "C 240,935 250,880 360,845 Z",
      label: [615, 872],
    },
  };
  const WADI = "M 330,118 C 342,300 362,480 402,640 C 432,760 424,880 382,1002";

  /* مواقع تقريبية لعينة الأحياء (توضيحية — ضمن قطاعها) */
  const NBHD_POS = {
    "حي الملقا": [300, 150], "حي الصحافة": [430, 175], "حي حطين": [360, 235],
    "حي الياسمين": [560, 140], "حي النسيم الشرقي": [740, 390], "حي السلي": [700, 610],
    "حي النظيم": [845, 460], "حي النسيم الغربي": [655, 430], "حي منفوحة": [490, 585],
    "حي غبيرة": [530, 500], "حي الجرادية": [440, 470], "حي الديرة": [500, 390],
    "حي السويدي الغربي": [280, 640], "حي ظهرة لبن": [180, 520], "حي العريجاء الغربي": [300, 420],
    "حي طويق": [160, 640], "حي المنصورية": [540, 890], "حي العزيزية": [640, 950],
    "حي الشفا": [430, 940], "حي بدر": [520, 795],
  };

  /** تلوين تسلسلي: خمس درجات حسب موقع القيمة بين أدنى/أعلى قيم المقياس */
  function seqColor(value, min, max, ramp) {
    if (max === min) return ramp[2];
    const t = (value - min) / (max - min);
    const idx = Math.min(ramp.length - 1, Math.max(0, Math.floor(t * ramp.length)));
    return ramp[idx];
  }

  const METRICS = {
    demand: { label: "الطلب على الأسرّة", unit: "سرير", ramp: "seq",
      value: (s, der) => s.demand, format: (v) => fmt.int(v) },
    coverage: { label: "نسبة تغطية الطلب", unit: "٪", ramp: "seq",
      value: (s, der) => der.sector[s.id].coverage_pct, format: (v) => fmt.pct(v) },
    building: { label: "رخص البناء", unit: "رخصة", ramp: "seq",
      value: (s) => s.building, format: (v) => fmt.int(v) },
    operational: { label: "الرخص التشغيلية", unit: "رخصة", ramp: "seq",
      value: (s) => s.operational, format: (v) => fmt.int(v) },
    beds: { label: "الطاقة الاستيعابية المرخصة", unit: "سرير", ramp: "seq",
      value: (s) => s.beds, format: (v) => fmt.int(v) },
    violations: { label: "المخالفات المسجلة", unit: "مخالفة", ramp: "viol",
      value: (s) => s.violations, format: (v) => fmt.int(v) },
    monitors: { label: "عدد المراقبين", unit: "مراقب", ramp: "seq",
      value: (s) => s.monitors, format: (v) => fmt.int(v) },
  };

  /**
   * يبني الخريطة داخل حاوية.
   * opts: { metric, su, focus, dimOthers, onSelect(sectorId), showNbhd, secondary }
   * secondary: مقياس ثانٍ يُعرض سطرَ قيمةٍ إضافياً تحت الاسم (مثل المراقبين مع المخالفات)
   */
  function render(container, opts) {
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const su = opts.su || 1;
    const metric = METRICS[opts.metric || "demand"];
    const ramp = metric.ramp === "viol" ? T.C.seqViol : T.C.seq;

    const values = rel.sectors.map((s) => metric.value(s, der));
    const min = Math.min(...values);
    const max = Math.max(...values);

    const root = svg("svg", {
      class: "sector-map",
      viewBox: "0 0 1000 1120",
      role: "group",
      "aria-label": "خريطة توضيحية لقطاعات مدينة الرياض — " + metric.label,
    });

    // وادي حنيفة الرمزي خلف القطاعات
    root.appendChild(svg("path", { class: "wadi", d: WADI, "aria-hidden": "true" }));

    for (const s of rel.sectors) {
      const g = GEO[s.id];
      const v = metric.value(s, der);
      const fill = seqColor(v, min, max, ramp);
      const isFocus = opts.focus === s.id;
      const dim = opts.focus && !isFocus && opts.dimOthers;
      const path = svg("path", {
        class: "sector-shape" + (isFocus ? " focus" : "") + (dim ? " dim" : ""),
        d: g.d,
        fill,
        tabindex: "0",
        role: "button",
        "data-interactive": "1",
        "aria-label": `${s.name} — ${metric.label}: ${metric.format(v)} ${metric.unit}`,
        onclick: () => opts.onSelect && opts.onSelect(s.id),
        onkeydown: (e) => {
          if ((e.key === "Enter" || e.key === " ") && opts.onSelect) {
            e.preventDefault();
            e.stopPropagation();
            opts.onSelect(s.id);
          }
        },
      });
      root.appendChild(path);

      const [lx, ly] = g.label;
      const label = svg("g", { class: "slabel", "aria-hidden": "true" });
      label.appendChild(svg("text", {
        x: lx, y: ly - 14, class: "sname",
        "font-size": 30, fill: "#F4F1E6",
      }, s.short));
      label.appendChild(svg("text", {
        x: lx, y: ly + 30, class: "svalue",
        "font-size": 40, fill: "#F4F1E6",
      }, metric.format(v)));
      if (opts.secondary && METRICS[opts.secondary]) {
        const m2 = METRICS[opts.secondary];
        label.appendChild(svg("text", {
          x: lx, y: ly + 66, "font-size": 24, fill: "#C9CFC4",
        }, m2.label.replace("عدد ", "") + ": " + m2.format(m2.value(s, der))));
      }
      root.appendChild(label);
    }

    // نقاط عينة الأحياء (اختيارية — ملحق التراخيص)
    if (opts.showNbhd) {
      for (const n of rel.neighbourhoods.rows) {
        const pos = NBHD_POS[n.name];
        if (!pos) continue;
        const r = 6 + Math.sqrt(n.beds) / 14;
        root.appendChild(svg("circle", {
          cx: pos[0], cy: pos[1], r: r.toFixed(1),
          fill: "rgba(214,171,76,.75)", stroke: "#0B1512", "stroke-width": 1.5,
        }, svg("title", {}, `${n.name} — ${fmt.unitAfter(n.beds, "سرير")} (${rel.neighbourhoods.label})`)));
      }
    }

    RH.core.dom.clear(container).appendChild(root);
    return {
      legend: { min, max, ramp, metric },
    };
  }

  /** شريط مفتاح التدرج + وسم الخريطة التوضيحية */
  function legendEl(info, su) {
    const { h } = RH.core.dom;
    const ramp = info.legend.ramp;
    const grad = `linear-gradient(-90deg, ${ramp[0]}, ${ramp[ramp.length - 1]})`;
    return h("div", { class: "map-legend" },
      h("span", {}, info.legend.metric.format(info.legend.min)),
      h("span", { class: "ramp", style: { background: grad } }),
      h("span", {}, info.legend.metric.format(info.legend.max)),
      h("span", { class: "map-disclaimer", style: { marginInlineStart: "18px" } },
        RH.data.store.release().meta.map_disclaimer),
    );
  }

  return { render, legendEl, METRICS, GEO, NBHD_POS };
})();
