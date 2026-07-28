/* ============================================================
   Charts — ECharts theme per ux-spec §6.12, chart factories.
   ============================================================ */
"use strict";

(function () {
  var Charts = RGP.charts = { instances: [] };

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  Charts.palette = function () {
    return [cssVar("--ch-1"), cssVar("--ch-2"), cssVar("--ch-3"), cssVar("--ch-4"), cssVar("--ch-5"), cssVar("--ch-6")];
  };

  Charts.base = function () {
    var mut = cssVar("--mut"), hair = "rgba(127,127,127,.14)";
    return {
      color: Charts.palette(),
      textStyle: { fontFamily: "IBM Plex Sans Arabic", fontSize: 11, color: mut },
      grid: { top: 32, right: 12, bottom: 36, left: 12, containLabel: true },
      animationDuration: RGP.REDUCED_MOTION ? 0 : 700,
      animationEasing: "cubicOut",
      tooltip: {
        backgroundColor: cssVar("--surface"),
        borderColor: cssVar("--hair") || "rgba(0,0,0,.1)",
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { fontFamily: "Cairo", fontSize: 12, color: cssVar("--ink") },
        extraCssText: "border-radius:10px;box-shadow:0 4px 10px rgba(20,32,26,.07), 0 28px 64px rgba(20,32,26,.13);direction:" + (RGP.i18n.lang === "ar" ? "rtl" : "ltr")
      },
      legend: { icon: "circle", itemWidth: 8, itemHeight: 8, bottom: 0, itemGap: 18, textStyle: { fontSize: 11, color: cssVar("--ink-2") } }
    };
  };

  Charts.axis = function (categories) {
    var mut = cssVar("--mut");
    return {
      xAxis: {
        type: "category", data: categories,
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: mut, fontSize: 10.5 }
      },
      yAxis: {
        type: "value",
        axisLine: { show: false }, axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(127,127,127,.12)", width: 1, type: [2, 6] } },
        axisLabel: { color: mut, fontSize: 10.5 }
      }
    };
  };

  Charts.make = function (el, option) {
    var inst = echarts.init(el, null, { renderer: "canvas" });
    inst.setOption(Object.assign({}, Charts.base(), option));
    Charts.instances.push(inst);
    return inst;
  };

  Charts.disposeAll = function () {
    Charts.instances.forEach(function (i) { try { i.dispose(); } catch (e) { /* noop */ } });
    Charts.instances = [];
  };

  window.addEventListener("resize", RGP.debounce(function () {
    Charts.instances.forEach(function (i) { try { i.resize(); } catch (e) { /* noop */ } });
  }, 150));

  /* bar chart, rounded tops */
  Charts.bar = function (el, categories, series, opts) {
    opts = opts || {};
    var ax = Charts.axis(categories);
    return Charts.make(el, Object.assign(ax, {
      tooltip: Object.assign(Charts.base().tooltip, { trigger: "axis" }),
      legend: series.length > 1 ? Charts.base().legend : { show: false },
      series: series.map(function (s, i) {
        var col = s.color || Charts.palette()[i];
        return {
          name: s.name, type: "bar", data: s.data,
          stack: opts.stack ? "total" : null,
          barMaxWidth: 24,
          emphasis: { focus: "series" },
          animationDelay: RGP.REDUCED_MOTION ? 0 : function (di) { return di * 40; },
          itemStyle: {
            borderRadius: opts.stack && i < series.length - 1 ? [0, 0, 0, 0] : [7, 7, 0, 0],
            color: opts.stack ? col : {
              type: "linear", x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: col }, { offset: 1, color: Charts.hexA(col, 0.75) }]
            }
          }
        };
      })
    }));
  };

  /* line/area over time — x flows LTR always */
  Charts.area = function (el, categories, series) {
    var ax = Charts.axis(categories);
    return Charts.make(el, Object.assign(ax, {
      tooltip: Object.assign(Charts.base().tooltip, { trigger: "axis" }),
      legend: series.length > 1 ? Charts.base().legend : { show: false },
      series: series.map(function (s, i) {
        var col = s.color || Charts.palette()[i];
        return {
          name: s.name, type: "line", data: s.data,
          smooth: 0.3, symbol: "none", lineStyle: { width: 2, color: col },
          itemStyle: { color: col },
          areaStyle: i === 0 ? {
            color: {
              type: "linear", x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: Charts.hexA(col, 0.22) }, { offset: 1, color: Charts.hexA(col, 0) }]
            }
          } : null
        };
      })
    }));
  };

  /* donut with center total */
  Charts.donut = function (el, data, centerLabel) {
    var total = data.reduce(function (a, d) { return a + d.value; }, 0);
    return Charts.make(el, {
      tooltip: Object.assign(Charts.base().tooltip, { trigger: "item" }),
      legend: Object.assign(Charts.base().legend, { show: true }),
      graphic: [{
        type: "text", left: "center", top: "42%",
        style: { text: RGP.fmtNum(total, { dec: 0 }), fontSize: 26, fontWeight: 300, fontFamily: "IBM Plex Sans Arabic", fill: cssVar("--ink") }
      }, {
        type: "text", left: "center", top: "56%",
        style: { text: centerLabel || "", fontSize: 10.5, fontFamily: "IBM Plex Sans Arabic", fill: cssVar("--mut") }
      }],
      series: [{
        type: "pie", radius: ["62%", "82%"], center: ["50%", "46%"],
        label: { show: false }, labelLine: { show: false },
        itemStyle: { borderColor: cssVar("--surface"), borderWidth: 2 },
        data: data
      }]
    });
  };

  /* horizontal bars (entity performance) */
  Charts.hbar = function (el, categories, values, opts) {
    opts = opts || {};
    var mut = cssVar("--mut");
    return Charts.make(el, {
      tooltip: Object.assign(Charts.base().tooltip, { trigger: "axis" }),
      grid: { top: 8, right: 24, bottom: 8, left: 8, containLabel: true },
      xAxis: {
        type: "value", axisLine: { show: false }, axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(127,127,127,.12)" } },
        axisLabel: { color: mut, fontSize: 10.5 }
      },
      yAxis: {
        type: "category", data: categories, inverse: true,
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: cssVar("--ink-2"), fontSize: 11 }
      },
      series: [{
        type: "bar", data: values, barMaxWidth: 18,
        itemStyle: { borderRadius: [0, 6, 6, 0], color: opts.color || cssVar("--ch-1") },
        label: opts.label ? { show: true, position: "right", fontSize: 10.5, color: mut, formatter: opts.label } : null
      }]
    });
  };

  Charts.hexA = function (hex, a) {
    hex = hex.trim();
    if (hex[0] !== "#") return hex;
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  };
})();
