/* charts.js — بناة الرسوم (ECharts) — كل رسم يقرأ من release/derived حصراً
   قواعد ملزمة: محور واحد، لون واحد للمقياس الواحد، تسميات مباشرة انتقائية،
   شبكة خافتة، تلميح داكن موحد، لا وسيلة إيضاح لسلسلة واحدة. */
"use strict";

RH.viz.charts = (function () {
  const T = RH.viz.theme;
  const fmt = RH.core.fmt;
  const S = () => RH.data.store.release();
  const D = () => RH.data.store.der();

  const kfmt = (v) => (Math.abs(v) >= 1000 ? Math.round(v / 1000) + " ألف" : fmt.int(v));

  /** جسر تراكمي (المشهد 05): خط الأساس ← صافي الإضافات الشهرية ← الإجمالي
      المرحلتان الطرفيتان مرتكزتان للصفر، والإضافات معلّقة على الرصيد المتراكم
      مع تسمية قيمة مباشرة — البنية التي يطلبها التكليف حرفياً. */
  function bridge(el, su, key, animate) {
    const rel = S();
    const monthly = rel.monthly.licensing;
    const baseVal = rel.baseline[key];
    const curVal = key === "beds"
      ? rel.metrics.licensed_beds.value
      : rel.metrics["current_" + key].value;
    // تسميتا الطرفين قصيرتان عمداً (تمنعان القص عند حافتي الشبكة)؛
    // النص الكامل في المؤهل أسفل المشهد وفي التلميح
    const edgeStart = "خط الأساس";
    const edgeEnd = "الإجمالي الحالي";
    const labels = [edgeStart]
      .concat(monthly.map((m) => m.label))
      .concat([edgeEnd]);
    const fullLabels = [rel.meta.baseline_label]
      .concat(monthly.map((m) => m.label))
      .concat(["الإجمالي حتى " + rel.meta.data_as_of]);

    const support = [0];
    // خط الأساس ذهبي — عقد الذهبي داخل الرسوم: المستهدف/خط الأساس حصراً
    const bars = [{ value: baseVal, itemStyle: { color: T.C.gold } }];
    let acc = baseVal;
    for (const m of monthly) {
      support.push(acc);
      bars.push({ value: m[key], itemStyle: { color: T.C.green } });
      acc += m[key];
    }
    support.push(0);
    bars.push({ value: curVal, itemStyle: { color: T.C.greenHi } });

    const unit = key === "beds" ? "سرير" : "رخصة";
    const c = T.chart("bridge-" + key, el);
    c.setOption(Object.assign(T.base(su), {
      animation: animate !== false && !T.REDUCED,
      grid: { top: T.fs(su, 34), bottom: T.fs(su, 56), left: T.fs(su, 46), right: T.fs(su, 76) },
      xAxis: T.catXAxis(su, labels, {
        axisLabel: {
          color: T.C.mut, fontFamily: "Cairo", fontSize: T.fs(su, 12),
          interval: 0, rotate: 38,
        },
      }),
      yAxis: T.valAxis(su, kfmt, key === "beds" ? {} : { minInterval: 1 }),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          if (p.seriesIndex === 0) return "";
          const i = p.dataIndex;
          const isEdge = i === 0 || i === labels.length - 1;
          return T.ttTitle(fullLabels[i]) + T.ttRow(
            isEdge ? "الإجمالي" : "صافي الإضافة",
            fmt.unitAfter(bars[i].value, unit),
            bars[i].itemStyle.color);
        },
      }),
      series: [
        { type: "bar", stack: "b", itemStyle: { color: "transparent" },
          emphasis: { itemStyle: { color: "transparent" } }, silent: true,
          data: support, barWidth: "58%" },
        { type: "bar", stack: "b", data: bars,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          label: {
            show: true, position: "top", color: T.C.ink2,
            fontFamily: "IBM Plex Sans Arabic", fontSize: T.fs(su, 12.5),
            formatter: (p) => {
              const i = p.dataIndex;
              if (i === 0 || i === labels.length - 1) return fmt.int(p.value);
              return fmt.iso("+" + fmt.int(p.value));
            },
          } },
      ],
    }), true);
    return c;
  }

  /** الطلب حسب النشاط الاقتصادي — أعمدة أفقية بلون واحد وتسميات مباشرة */
  function econBars(el, su) {
    const rel = S();
    const rows = rel.economic_activities.slice()
      .sort((a, b) => b.demand - a.demand);
    const c = T.chart("econ", el);
    c.setOption(Object.assign(T.base(su), {
      grid: { top: 6, bottom: T.fs(su, 30), left: T.fs(su, 100), right: T.fs(su, 190) },
      xAxis: T.hValAxis(su, kfmt),
      yAxis: T.hCatAxis(su, rows.map((r) => r.name)),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttTitle(rows[p.dataIndex].name)
          + T.ttRow("الطلب", fmt.unitAfter(rows[p.dataIndex].demand, "سرير"), T.C.demand)
          + T.ttRow("من إجمالي الطلب",
            fmt.pct(RH.data.derive.pct(rows[p.dataIndex].demand, rel.metrics.total_demand.value))),
      }),
      series: [{
        type: "bar", data: rows.map((r) => r.demand), color: T.C.demand,
        barWidth: "56%",
        itemStyle: { borderRadius: [6, 0, 0, 6] },
        label: {
          show: true, position: "left", color: T.C.ivory,
          fontFamily: "IBM Plex Sans Arabic", fontSize: T.fs(su, 14),
          formatter: (p) => fmt.int(p.value),
        },
      }],
    }), true);
    return c;
  }

  /** المخالفات حسب النوع — أعمدة أفقية بلون الخلل الواحد */
  function violTypeBars(el, su) {
    const rel = S();
    const rows = rel.violation_types.slice().sort((a, b) => b.count - a.count);
    const total = rel.metrics.total_violations.value;
    const c = T.chart("violtypes", el);
    c.setOption(Object.assign(T.base(su), {
      grid: { top: 6, bottom: T.fs(su, 30), left: T.fs(su, 90), right: T.fs(su, 250) },
      xAxis: T.hValAxis(su, fmt.int),
      yAxis: T.hCatAxis(su, rows.map((r) => r.name), T.fs(su, 235)),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttTitle(rows[p.dataIndex].name)
          + T.ttRow("المخالفات", fmt.unitAfter(rows[p.dataIndex].count, "مخالفة"), T.C.coral)
          + T.ttRow("من الإجمالي", fmt.pct(RH.data.derive.pct(rows[p.dataIndex].count, total))),
      }),
      series: [{
        type: "bar", data: rows.map((r) => r.count), color: T.C.coral,
        barWidth: "56%",
        itemStyle: { borderRadius: [6, 0, 0, 6] },
        label: {
          show: true, position: "left", color: T.C.ivory,
          fontFamily: "IBM Plex Sans Arabic", fontSize: T.fs(su, 14),
          formatter: (p) => fmt.int(p.value),
        },
      }],
    }), true);
    return c;
  }

  /** مقارنة القطاعات: الطلب مقابل الطاقة المرخصة (زوجان متحقق منهما لونياً) */
  function sectorCompare(el, su) {
    const rel = S();
    const der = D();
    const names = rel.sectors.map((s) => s.short);
    const c = T.chart("seccomp", el);
    c.setOption(Object.assign(T.base(su), {
      legend: {
        top: 0, textStyle: { color: T.C.ink2, fontFamily: "Cairo", fontSize: T.fs(su, 14) },
        itemWidth: 14, itemHeight: 10,
      },
      grid: { top: T.fs(su, 44), bottom: T.fs(su, 34), left: T.fs(su, 14), right: T.fs(su, 66) },
      xAxis: T.catXAxis(su, names),
      yAxis: T.valAxis(su, kfmt),
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (ps) => {
          const i = ps[0].dataIndex;
          const s = rel.sectors[i];
          return T.ttTitle(s.name)
            + T.ttRow("الطلب", fmt.unitAfter(s.demand, "سرير"), T.C.demand)
            + T.ttRow("الطاقة المرخصة", fmt.unitAfter(s.beds, "سرير"), T.C.green)
            + T.ttRow("نسبة التغطية", fmt.pct(der.sector[s.id].coverage_pct));
        },
      }),
      series: [
        { name: "الطلب", type: "bar", color: T.C.demand, barGap: "12%",
          barWidth: "30%", itemStyle: { borderRadius: [4, 4, 0, 0] },
          data: rel.sectors.map((s) => s.demand) },
        { name: "الطاقة المرخصة", type: "bar", color: T.C.green,
          barWidth: "30%", itemStyle: { borderRadius: [4, 4, 0, 0] },
          data: rel.sectors.map((s) => s.beds),
          label: {
            show: true, position: "top", color: T.C.mut,
            fontFamily: "IBM Plex Sans Arabic", fontSize: T.fs(su, 12),
            formatter: (p) => fmt.pct(der.sector[rel.sectors[p.dataIndex].id].coverage_pct),
          } },
      ],
    }), true);
    return c;
  }

  /** سيناريوهات العجز المورّدة — ثلاث درجات مرتبة من صبغة الخلل + تسميات طرفية */
  function scenarioLines(el, su) {
    const rel = S();
    const rows = rel.scenarios.rows;
    const shades = ["#E08A6B", "#C05841", "#8C4630"]; // متحفظ → متفائل (ترتيبي أحادي الصبغة)
    const seriesDefs = [
      { key: "conservative", name: "متحفظ", color: shades[1], type: "solid" },
      { key: "base", name: "أساسي", color: shades[0], type: "solid", width: 3.5 },
      { key: "optimistic", name: "متفائل", color: shades[2], type: "dashed" },
    ];
    const c = T.chart("scenarios", el);
    c.setOption(Object.assign(T.base(su), {
      legend: {
        top: 0, textStyle: { color: T.C.ink2, fontFamily: "Cairo", fontSize: T.fs(su, 14) },
      },
      grid: { top: T.fs(su, 46), bottom: T.fs(su, 40), left: T.fs(su, 16), right: T.fs(su, 84) },
      xAxis: T.catXAxis(su, rows.map((r) => r.label), {
        axisLabel: { color: T.C.mut, fontFamily: "Cairo", fontSize: T.fs(su, 12), rotate: 30 },
      }),
      yAxis: T.valAxis(su, kfmt, {
        min: (v) => Math.floor(v.min * 0.985),
      }),
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        formatter: (ps) => {
          let out = T.ttTitle(rows[ps[0].dataIndex].label);
          for (const p of ps) {
            out += T.ttRow(p.seriesName, fmt.unitAfter(p.value, "سرير"), p.color);
          }
          return out;
        },
      }),
      series: seriesDefs.map((sd) => ({
        name: sd.name, type: "line", color: sd.color,
        symbol: "circle", symbolSize: T.fs(su, 7),
        lineStyle: { width: sd.width || 2.5, type: sd.type },
        endLabel: {
          show: true, color: sd.color, fontFamily: "Cairo",
          fontSize: T.fs(su, 13), formatter: sd.name, distance: 8,
        },
        data: rows.map((r) => r[sd.key]),
      })),
    }), true);
    return c;
  }

  /** النشاط الرقابي الشهري — زيارات (أعمدة خضراء: فعل رقابي) ومخالفات (خط مرجاني) بمحور واحد؟
      مقياسان مختلفا النطاق → رسمان صغيران متراصفان بدل محور مزدوج (قاعدة صارمة). */
  function monitoringMonthly(el, su, which) {
    const rel = S();
    const rows = rel.monthly.monitoring;
    const isVisits = which === "visits";
    const color = isVisits ? T.C.green : T.C.coral;
    const label = isVisits ? "الزيارات الميدانية" : "المخالفات المسجلة";
    const unit = isVisits ? "زيارة" : "مخالفة";
    /* متوسط الشهر — خط مرجعي متقطع محايد (لا ذهبي: ليس مستهدفاً ولا خط أساس) */
    let sum = 0;
    for (const r of rows) sum += isVisits ? r.visits : r.violations;
    const avg = Math.round(sum / rows.length);
    const c = T.chart("monm-" + which, el);
    c.setOption(Object.assign(T.base(su), {
      /* containLabel: أول تسمية شهر دوارة كانت تُقص عند حافة البطاقة */
      grid: { top: T.fs(su, 30), bottom: T.fs(su, 40), left: T.fs(su, 40),
        right: T.fs(su, 70), containLabel: true },
      title: {
        text: label, right: 0, top: 0,
        textStyle: { color: T.C.ink2, fontFamily: "Cairo", fontSize: T.fs(su, 15), fontWeight: 600 },
      },
      xAxis: T.catXAxis(su, rows.map((r) => r.label), {
        axisLabel: { color: T.C.mut, fontFamily: "Cairo", fontSize: T.fs(su, 11.5), rotate: 34 },
      }),
      yAxis: T.valAxis(su, fmt.int),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttTitle(rows[p.dataIndex].label)
          + T.ttRow(label, fmt.unitAfter(p.value, unit), color),
      }),
      series: [{
        type: "bar", data: rows.map((r) => (isVisits ? r.visits : r.violations)),
        color, barWidth: "58%", itemStyle: { borderRadius: [4, 4, 0, 0] },
        markLine: {
          silent: true, symbol: "none",
          lineStyle: { color: "rgba(244,241,230,.42)", width: 1.5, type: "dashed" },
          label: {
            show: true, position: "insideStartTop",
            color: T.C.mut, fontFamily: "Cairo", fontSize: T.fs(su, 11),
            formatter: () => "المتوسط الشهري " + fmt.int(avg),
          },
          data: [{ yAxis: avg }],
        },
      }],
    }), true);
    return c;
  }

  /** صافي الإضافات الشهرية للتراخيص (ملحق) */
  function monthlyNet(el, su, key) {
    const rel = S();
    const rows = rel.monthly.licensing;
    const unit = key === "beds" ? "سرير" : "رخصة";
    const c = T.chart("net-" + key, el);
    c.setOption(Object.assign(T.base(su), {
      grid: { top: T.fs(su, 22), bottom: T.fs(su, 46), left: T.fs(su, 42), right: T.fs(su, 68) },
      xAxis: T.catXAxis(su, rows.map((r) => r.label), {
        axisLabel: { color: T.C.mut, fontFamily: "Cairo", fontSize: T.fs(su, 11.5), rotate: 34 },
      }),
      yAxis: T.valAxis(su, fmt.int, key === "beds" ? {} : { minInterval: 1 }),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttTitle(rows[p.dataIndex].label)
          + T.ttRow("صافي الإضافة", fmt.unitAfter(p.value, unit), T.C.green),
      }),
      series: [{
        type: "bar", data: rows.map((r) => r[key]), color: T.C.green,
        barWidth: "58%", itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: {
          show: true, position: "top", color: T.C.mut,
          fontFamily: "IBM Plex Sans Arabic", fontSize: T.fs(su, 11.5),
          formatter: (p) => "+" + fmt.int(p.value),
        },
      }],
    }), true);
    return c;
  }

  /** مزيج أنواع الإيواء — ثلاث فئات متحقق منها لونياً (أخضر/أزرق/رملي) */
  function facilityMix(el, su) {
    const rel = S();
    const colors = [T.C.green, T.C.blue, T.C.demand];
    const rows = rel.facility_types;
    const c = T.chart("facmix", el);
    c.setOption(Object.assign(T.base(su), {
      grid: { top: 6, bottom: T.fs(su, 30), left: T.fs(su, 80), right: T.fs(su, 150) },
      xAxis: T.hValAxis(su, fmt.int),
      yAxis: T.hCatAxis(su, rows.map((r) => r.name)),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => T.ttTitle(rows[p.dataIndex].name)
          + T.ttRow("الرخص التشغيلية", fmt.noun(rows[p.dataIndex].count, "licence"),
            colors[p.dataIndex]),
      }),
      series: [{
        type: "bar",
        data: rows.map((r, i) => ({ value: r.count, itemStyle: { color: colors[i], borderRadius: [6, 0, 0, 6] } })),
        barWidth: "52%",
        label: {
          show: true, position: "left", color: T.C.ivory,
          fontFamily: "IBM Plex Sans Arabic", fontSize: T.fs(su, 14),
          formatter: (p) => fmt.int(p.value),
        },
      }],
    }), true);
    return c;
  }

  return {
    bridge, econBars, violTypeBars, sectorCompare, scenarioLines,
    monitoringMonthly, monthlyNet, facilityMix,
  };
})();
