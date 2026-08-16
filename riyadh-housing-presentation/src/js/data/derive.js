/* derive.js — الاشتقاق المركزي في المتصفح
   مرآة حرفية لدالة derive() في generate_data.py: الصيغ نفسها، التقريب نفسه
   (نصف لأعلى)، والترتيب على الخام دائماً. الاختبارات تؤكد تطابق المخرجين.
   كل رسم وكل عنوان يقرأ من هنا أو من release — لا حساب متناثر في المشاهد. */
"use strict";

RH.data.derive = (function () {

  /** تقريب نصف-لأعلى حتمي بمنازل محددة — مطابق لـ round_half_up في بايثون */
  function roundHalfUp(value, places) {
    if (places == null) places = 1;
    const f = Math.pow(10, places);
    // EPSILON يعالج تمثيل الفاصلة العائمة (91.69999999) قبل التقريب
    return Math.round((value * f) + (value >= 0 ? 1e-9 : -1e-9)) / f;
  }

  function pct(num, den, places) {
    if (den === 0) throw new Error("قسمة على صفر مرفوضة في حساب نسبة");
    return roundHalfUp((num / den) * 100, places == null ? 1 : places);
  }

  /** يحسب المشتقات كاملة من كائن الإصدار ويعيدها (لا يعدل الإصدار) */
  function compute(release) {
    const m = release.metrics;
    const val = (id) => m[id].value;
    const d = {};

    const dem = val("total_demand");
    const cap = val("licensed_beds");
    const occ = val("occupied_beds");

    d.deficit_beds = Math.max(dem - cap, 0);
    d.coverage_pct = pct(cap, dem);
    d.uncovered_pct = roundHalfUp(100 - d.coverage_pct);
    d.occupancy_pct = pct(occ, cap);
    d.vacant_beds = cap - occ;
    d.blue_share_pct = pct(release.collar.blue, dem);
    d.white_share_pct = pct(release.collar.white, dem);

    for (const key of ["building", "operational", "beds"]) {
      const cur = key === "beds" ? cap : val("current_" + key);
      const base = val("baseline_" + key);
      d["growth_" + key + "_abs"] = cur - base;
      d["growth_" + key + "_pct"] = pct(cur - base, base);
    }

    const totV = val("total_violations");
    const totVisits = val("total_visits");
    d.sector = {};
    for (const s of release.sectors) {
      d.sector[s.id] = {
        coverage_pct: pct(s.beds, s.demand),
        coverage_raw: s.beds / s.demand,
        deficit_beds: Math.max(s.demand - s.beds, 0),
        violations_share_pct: pct(s.violations, totV),
        visits_share_pct: pct(s.visits, totVisits),
        demand_share_pct: pct(s.demand, dem),
      };
    }

    // قاعدة كسر التعادل الموحدة (مرآة بايثون max/min): أول الأقصى/الأدنى بترتيب القطاعات
    const byRaw = (arr, keyFn, desc) => {
      let best = arr[0];
      for (const s of arr) {
        if (desc ? keyFn(s) > keyFn(best) : keyFn(s) < keyFn(best)) best = s;
      }
      return best.id;
    };
    const S = release.sectors;
    d.rankings = {
      lowest_coverage: byRaw(S, (s) => d.sector[s.id].coverage_raw, false),
      highest_coverage: byRaw(S, (s) => d.sector[s.id].coverage_raw, true),
      highest_demand: byRaw(S, (s) => s.demand, true),
      highest_violations: byRaw(S, (s) => s.violations, true),
      highest_building: byRaw(S, (s) => s.building, true),
      lowest_building: byRaw(S, (s) => s.building, false),
      highest_operational: byRaw(S, (s) => s.operational, true),
      lowest_operational: byRaw(S, (s) => s.operational, false),
      highest_beds: byRaw(S, (s) => s.beds, true),
      lowest_beds: byRaw(S, (s) => s.beds, false),
    };

    d.avg_monthly_visits = Math.round(roundHalfUp(totVisits / 12, 0));
    d.south_violations_share_pct = pct(
      S.find((s) => s.id === "south").violations, totV);

    // تقدّم المبادرات الموزون + تجميعات الركائز — يعمل فقط عند وجود مصدر معتمد
    d.strategy = computeStrategy(release.strategy);

    return d;
  }

  /** التقدم الموزون: pillar = Σ(w·progress)/Σw ، overall = Σ(W·pillar)/ΣW
      لا تحويل تعسفياً لـ«قيد التنفيذ» إلى 50٪ — القيم من الحقول الصريحة فقط. */
  function computeStrategy(strategy) {
    const out = { publishable: false, pillars: {}, overall_pct: null, status_counts: null };
    if (!strategy || strategy.status !== "approved" || !strategy.pillars.length) return out;

    const counts = { execution: {}, schedule: {} };
    let allHaveProgress = true;
    for (const ini of strategy.initiatives) {
      counts.execution[ini.execution_status] = (counts.execution[ini.execution_status] || 0) + 1;
      if (ini.schedule_status) {
        counts.schedule[ini.schedule_status] = (counts.schedule[ini.schedule_status] || 0) + 1;
      }
      if (typeof ini.progress_percent !== "number") allHaveProgress = false;
    }
    out.status_counts = counts;

    if (!allHaveProgress) return out; // توزيع الحالات فقط — النسبة الدقيقة محجوبة

    let overallNum = 0, overallDen = 0;
    for (const p of strategy.pillars) {
      const inis = strategy.initiatives.filter((i) => i.pillar_id === p.id);
      if (!inis.length) { out.pillars[p.id] = { progress_pct: null, count: 0 }; continue; }
      let num = 0, den = 0;
      for (const i of inis) {
        const w = typeof i.weight === "number" && i.weight > 0 ? i.weight : null;
        if (w == null) return out; // أوزان ناقصة → لا نسبة دقيقة
        num += w * i.progress_percent;
        den += w;
      }
      const pp = roundHalfUp(num / den);
      out.pillars[p.id] = { progress_pct: pp, count: inis.length, raw: num / den };
      const W = typeof p.weight === "number" && p.weight > 0 ? p.weight : 1;
      overallNum += W * (num / den);
      overallDen += W;
    }
    out.overall_pct = roundHalfUp(overallNum / overallDen);
    out.publishable = true;
    return out;
  }

  /** فجوة مؤشر عن مستهدفه وفق اتجاه التحسن (أعلى/أدنى أفضل) */
  function kpiVariance(kpi) {
    if (!Number.isFinite(kpi.current_value) || !Number.isFinite(kpi.target)) return null;
    const diff = kpi.direction === "lower_better"
      ? kpi.target - kpi.current_value
      : kpi.current_value - kpi.target;
    return { gap: roundHalfUp(kpi.target - kpi.current_value, 2), onTrack: diff >= 0 };
  }

  return { compute, computeStrategy, kpiVariance, roundHalfUp, pct };
})();
