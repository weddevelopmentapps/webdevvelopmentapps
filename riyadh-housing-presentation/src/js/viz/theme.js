/* theme.js — أساس ECharts والمنظومة اللونية المتحقق منها
   ─────────────────────────────────────────────────────────
   المنظومة اجتازت مدقق اللوحات (فحوص CVD والفصل والتباين) على سطح ‎#0B1512:
     main3    = أخضر ‎#31A26D + رملي نحاسي ‎#AA8A3E + مرجاني ‎#D66A50   (كل الأزواج ✓)
     collar2  = أزرق ‎#3F7FB0 + رملي ‎#AA8A3E                            (✓)
     facility3= أخضر + أزرق + رملي                                       (✓)
   الذهبي ‎#D6AB4C لون تعليق (خطوط مستهدف/خط أساس) لا خانة تصنيفية — تباينه نصياً 8.7:1.
   قاعدة: لون واحد لكل مقياس؛ لا تدرّج موقعي متعدد الصبغات في أعمدة التصنيف. */
"use strict";

RH.viz.theme = (function () {
  const C = {
    green: "#31A26D", greenHi: "#4CC18C",
    demand: "#AA8A3E",
    coral: "#D66A50",
    gold: "#D6AB4C",
    blue: "#3F7FB0",
    ivory: "#F4F1E6", ink2: "#C9CFC4", mut: "#93A096", faint: "#5E6C63",
    axLine: "rgba(244,241,230,.13)", axSplit: "rgba(244,241,230,.06)",
    stage1: "#0B1512", stage2: "#10201A",
    seq: ["#12241C", "#1A3A2B", "#24523B", "#2F6E4E", "#31A26D"],
    seqViol: ["#241512", "#3D2019", "#5C2E22", "#8C4630", "#D66A50"],
  };

  const REDUCED = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* مقاس خط مدرّج مع المسرح (المشاهد تمرر su وقت البناء) */
  const fs = (su, n) => Math.max(11, Math.round(n * su));

  /** محاور رأسية RTL: الفئات تُقرأ من اليمين لليسار والقيم على اليمين */
  function catXAxis(su, data, extra) {
    return Object.assign({
      type: "category", data, inverse: true,
      axisLine: { lineStyle: { color: C.axLine } },
      axisTick: { show: false },
      axisLabel: { color: C.mut, fontFamily: "Cairo", fontSize: fs(su, 14) },
    }, extra || {});
  }
  function valAxis(su, fmt, extra) {
    return Object.assign({
      type: "value", position: "right",
      splitLine: { lineStyle: { color: C.axSplit } },
      axisLabel: {
        color: C.faint, fontFamily: "IBM Plex Sans Arabic",
        fontSize: fs(su, 12.5), formatter: fmt,
      },
    }, extra || {});
  }
  /** أعمدة أفقية RTL: تنمو يميناً→يساراً، التسميات على اليمين، الأول أعلى */
  function hValAxis(su, fmt, max) {
    const a = {
      type: "value", inverse: true,
      splitLine: { lineStyle: { color: C.axSplit } },
      axisLabel: {
        color: C.faint, fontFamily: "IBM Plex Sans Arabic",
        fontSize: fs(su, 12.5), formatter: fmt,
      },
    };
    if (max != null) a.max = max;
    return a;
  }
  function hCatAxis(su, data, labelWidth) {
    return {
      type: "category", data, position: "right", inverse: true,
      axisLine: { lineStyle: { color: "transparent" } },
      axisTick: { show: false },
      axisLabel: {
        color: C.ink2, fontFamily: "Cairo", fontSize: fs(su, 15),
        width: labelWidth || null, overflow: labelWidth ? "truncate" : "none",
      },
    };
  }

  /* تلميح داكن موحد HTML بالاتجاه الصحيح */
  function tooltip(su) {
    return {
      trigger: "item",
      backgroundColor: "#131D17",
      borderWidth: 0,
      textStyle: { color: "#F1F5F2", fontFamily: "Cairo", fontSize: fs(su, 13) },
      extraCssText: "direction:rtl;text-align:right;box-shadow:0 14px 40px rgba(4,10,8,.5);" +
        "border-radius:13px;padding:11px 15px;",
      confine: true,
    };
  }
  function ttRow(k, v, color) {
    return `<div style="display:flex;justify-content:space-between;gap:18px;align-items:center;margin:2px 0">
      <span style="color:#A9B6AE">${color ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-left:6px"></span>` : ""}${k}</span>
      <b style="font-family:'IBM Plex Sans Arabic';color:#FFF">${v}</b></div>`;
  }
  const ttTitle = (t) => `<div style="font-weight:700;margin-bottom:5px">${t}</div>`;

  /** خط مستهدف ذهبي (لون تعليق حصراً) */
  function targetLine(su, value, label) {
    return {
      silent: true, symbol: "none",
      lineStyle: { color: C.gold, width: 2, type: "dashed" },
      label: {
        show: true, position: "insideStartTop", color: C.gold,
        fontFamily: "Cairo", fontSize: fs(su, 13), formatter: label,
      },
      data: [{ yAxis: value }],
    };
  }

  const base = (su) => ({
    animationDuration: REDUCED ? 0 : 300,
    animationEasing: "cubicOut",
    textStyle: { fontFamily: "Cairo" },
    tooltip: tooltip(su),
  });

  // ── سجل مثيلات ECharts: تخلص من المثيل إذا استُبدل عنصره ──
  const registry = new Map();
  function chart(id, el) {
    const old = registry.get(id);
    if (old && old.getDom() !== el) { old.dispose(); registry.delete(id); }
    if (!registry.has(id) || registry.get(id).isDisposed()) {
      registry.set(id, echarts.init(el, null, { renderer: "canvas" }));
    }
    return registry.get(id);
  }
  function disposeAll() {
    for (const c of registry.values()) { if (!c.isDisposed()) c.dispose(); }
    registry.clear();
  }
  function resizeAll() {
    for (const c of registry.values()) { if (!c.isDisposed()) c.resize(); }
  }
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(resizeAll, 120);
  });

  return {
    C, REDUCED, fs, base, catXAxis, valAxis, hValAxis, hCatAxis,
    tooltip, ttRow, ttTitle, targetLine, chart, disposeAll, resizeAll,
  };
})();
