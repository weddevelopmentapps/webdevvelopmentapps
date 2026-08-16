/* rings.js — كوكبة الركائز وأقواس المؤشرات (SVG كودي أصيل)
   ─────────────────────────────────────────────────────────
   مكوّن N-ركائز (حتى 7) يرسم كوكبة واحدة متماسكة: حلقة مركزية لنسبة الإنجاز
   الإجمالية للاستراتيجية تحيط بها حلقات الركائز — لا سبع بطاقات دونات متفرقة.
   يكشف التقدم مرة واحدة عند الدخول ثم يثبت. لا يُظهر نسبة إجمالية دقيقة إلا
   إذا كانت publishable وفق منهجية الأوزان المعتمدة (derive.computeStrategy). */
"use strict";

RH.viz.rings = (function () {
  const { svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  function arcPath(cx, cy, r, startDeg, endDeg) {
    const a1 = (startDeg - 90) * Math.PI / 180;
    const a2 = (endDeg - 90) * Math.PI / 180;
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} ` +
      `A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}`;
  }

  /** حلقة تقدم واحدة داخل مجموعة SVG */
  function ring(g, cx, cy, r, pct, opts) {
    const o = opts || {};
    const sw = o.stroke || 10;
    const track = svg("circle", {
      cx, cy, r, class: "ring-track", "stroke-width": sw,
    });
    g.appendChild(track);
    if (pct != null) {
      const circumference = 2 * Math.PI * r;
      const fill = svg("circle", {
        cx, cy, r, class: "ring-fill",
        "stroke-width": sw,
        stroke: o.color || undefined,
        "stroke-dasharray": circumference.toFixed(1),
        "stroke-dashoffset": (circumference * (1 - Math.min(100, pct) / 100)).toFixed(1),
        transform: `rotate(-90 ${cx} ${cy})`,
      });
      if (o.animate && !RH.viz.motion.REDUCED) {
        fill.setAttribute("stroke-dashoffset", circumference.toFixed(1));
        requestAnimationFrame(() => requestAnimationFrame(() => {
          fill.setAttribute("stroke-dashoffset",
            (circumference * (1 - Math.min(100, pct) / 100)).toFixed(1));
        }));
      }
      g.appendChild(fill);
    }
  }

  /**
   * كوكبة الركائز: strategy معتمدة + strat (نتيجة computeStrategy).
   * onSelect(pillarId) يفتح ملحق الركيزة.
   */
  function constellation(container, strategy, strat, opts) {
    const o = opts || {};
    const W = 1600, H = 900;
    const root = svg("svg", {
      class: "constellation", viewBox: `0 0 ${W} ${H}`,
      role: "group", "aria-label": "كوكبة ركائز الاستراتيجية",
    });
    const n = strategy.pillars.length;
    const cx = W / 2, cy = H / 2 + 20;

    // الحلقة المركزية: نسبة الإنجاز الإجمالية للاستراتيجية
    const central = svg("g", {});
    central.appendChild(svg("circle", { cx, cy, r: 158, class: "ring-core" }));
    ring(central, cx, cy, 138, strat.publishable ? strat.overall_pct : null,
      { stroke: 16, animate: true });
    central.appendChild(svg("text", {
      x: cx, y: cy - 26, class: "pname", "font-size": 30, fill: "#93A096",
    }, "نسبة الإنجاز الإجمالية للاستراتيجية"));
    central.appendChild(svg("text", {
      x: cx, y: cy + 52, class: "ppct", "font-size": 92,
    }, strat.publishable ? fmt.pct(strat.overall_pct) : "—"));
    root.appendChild(central);

    // حلقات الركائز على قوس علوي متناظر
    const orbitR = 330;
    const span = Math.min(300, 44 * n + 80);
    const start = -span / 2;
    strategy.pillars.forEach((p, i) => {
      const ang = n === 1 ? 0 : start + (span / (n - 1)) * i;
      const rad = (ang - 90) * Math.PI / 180 * (360 / 360);
      const px = cx + orbitR * Math.cos((ang - 90) * Math.PI / 180) * 1.9;
      const py = cy + orbitR * Math.sin((ang - 90) * Math.PI / 180) * 0.95;
      const pv = strat.pillars[p.id];
      const g = svg("g", {
        tabindex: "0", role: "button", "data-interactive": "1",
        "aria-label": `${p.name} — نسبة إنجاز الركيزة: ${pv && pv.progress_pct != null ? fmt.pct(pv.progress_pct) : "غير متاحة"}`,
        style: "cursor:pointer",
        onclick: () => o.onSelect && o.onSelect(p.id),
        onkeydown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault(); e.stopPropagation();
            o.onSelect && o.onSelect(p.id);
          }
        },
      });
      g.appendChild(svg("circle", { cx: px, cy: py, r: 92, class: "ring-core" }));
      ring(g, px, py, 78, pv ? pv.progress_pct : null, { stroke: 11, animate: true });
      g.appendChild(svg("text", {
        x: px, y: py + 14, class: "ppct", "font-size": 44,
      }, pv && pv.progress_pct != null ? fmt.pct(pv.progress_pct) : "—"));
      g.appendChild(svg("text", {
        x: px, y: py + 132, class: "pname", "font-size": 24,
      }, p.short || p.name));
      // وصلة خيطية هادئة إلى المركز
      root.appendChild(svg("line", {
        x1: cx + (px - cx) * 0.32, y1: cy + (py - cy) * 0.32,
        x2: px + (cx - px) * 0.28, y2: py + (cy - py) * 0.28,
        stroke: "rgba(244,241,230,.08)", "stroke-width": 1.5,
      }));
      root.appendChild(g);
    });

    RH.core.dom.clear(container).appendChild(root);
  }

  /**
   * قوس مؤشر واحد (مشهد 10/ملحق المؤشرات): يعرض كل الحقول المعتمدة.
   * kpi: {name, unit, baseline, target, current_value, direction, as_of, source}
   * لا يحوَّل الغياب إلى صفر أبداً — يُرسم قوس فارغ بحالة «غير متاح».
   */
  function kpiArc(container, kpi, su) {
    const { h } = RH.core.dom;
    const W = 460, H = 300;
    const cx = W / 2, cy = H - 60, r = 150;
    const root = svg("svg", {
      viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": kpi.name + " — " + (kpi.current_value == null
        ? "القيمة الحالية غير متاحة" : "القيمة الحالية " + kpi.current_value + " " + (kpi.unit || "")),
    });
    root.appendChild(svg("path", {
      d: arcPath(cx, cy, r, -105, 105),
      stroke: "rgba(244,241,230,.12)", "stroke-width": 15,
      fill: "none", "stroke-linecap": "round",
    }));
    let ratio = null;
    if (kpi.current_value != null && kpi.target != null && kpi.baseline != null
        && kpi.target !== kpi.baseline) {
      ratio = (kpi.current_value - kpi.baseline) / (kpi.target - kpi.baseline);
      ratio = Math.max(0, Math.min(1, ratio));
    }
    if (ratio != null && ratio > 0.005) {
      root.appendChild(svg("path", {
        d: arcPath(cx, cy, r, -105, -105 + 210 * ratio),
        stroke: "#31A26D", "stroke-width": 15, fill: "none", "stroke-linecap": "round",
      }));
    }
    // علامة المستهدف الذهبية عند نهاية القوس
    const tAng = (105 - 90) * Math.PI / 180;
    root.appendChild(svg("circle", {
      cx: cx + r * Math.cos(tAng), cy: cy + r * Math.sin(tAng), r: 7, fill: "#D6AB4C",
    }));
    root.appendChild(svg("text", {
      x: cx, y: cy - 34, "text-anchor": "middle", fill: "#F4F1E6",
      "font-family": "IBM Plex Sans Arabic", "font-weight": 300, "font-size": 58,
    }, kpi.current_value == null ? "—" : String(kpi.current_value)));
    root.appendChild(svg("text", {
      x: cx, y: cy + 2, "text-anchor": "middle", fill: "#93A096",
      "font-family": "Cairo", "font-size": 18,
    }, kpi.current_value == null ? "القيمة الحالية غير متاحة" : (kpi.unit || "")));

    const wrap = h("div", { class: "kpi-card", dataset: { kpi: kpi.id } });
    wrap.appendChild(h("div", { class: "kpi-name" }, kpi.name));
    wrap.appendChild(root);
    const variance = RH.data.derive.kpiVariance(kpi);
    const dirLabel = kpi.direction === "lower_better" ? "الانخفاض أفضل" : "الارتفاع أفضل";
    wrap.appendChild(h("div", { class: "kpi-meta" },
      h("span", {}, "خط الأساس: ", h("b", {}, kpi.baseline == null ? "—" : String(kpi.baseline))),
      h("span", {}, "المستهدف: ", h("b", {}, kpi.target == null ? "—" : String(kpi.target))),
      h("span", {}, "الفجوة عن المستهدف: ",
        h("b", {}, variance ? String(Math.abs(variance.gap)) : "—")),
      h("span", {}, "اتجاه التحسن: ", h("b", {}, dirLabel)),
      h("span", {}, "تاريخ القياس: ", h("b", {}, kpi.as_of ? fmt.date(kpi.as_of) : "—")),
    ));
    container.appendChild(wrap);
    return wrap;
  }

  return { constellation, kpiArc, ring, arcPath };
})();
