/* validate.js — بوابات الجودة في المتصفح
   دوران: (1) فحص سلامة الإصدار عند التحميل (درع تشغيلي)،
          (2) فحوص جودة المسودة في الإدارة قبل النشر (حاجبة أو منذرة).
   البوابات الحاجبة تمنع النشر ما لم يسجَّل تنازل موقَّع حيث يسمح التكليف. */
"use strict";

RH.data.validate = (function () {
  const D = RH.data.derive;

  /** فحص إصدار كامل. يعيد {gates:[{id,level,ok,label,detail}], blockers, warnings} */
  function validateRelease(rel) {
    const gates = [];
    const g = (id, level, ok, label, detail) =>
      gates.push({ id, level, ok: !!ok, label, detail: detail || "" });

    try {
      const der = D.compute(rel);
      const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);

      g("demand.sectors", "block",
        sum(rel.sectors, (s) => s.demand) === rel.metrics.total_demand.value,
        "مجموع طلب القطاعات = إجمالي الطلب");
      g("beds.sectors", "block", sum(rel.sectors, (s) => s.beds) === rel.metrics.licensed_beds.value,
        "مجموع أسرّة القطاعات = الطاقة المرخصة");
      g("visits.sectors", "block", sum(rel.sectors, (s) => s.visits) === rel.metrics.total_visits.value,
        "مجموع زيارات القطاعات = الإجمالي");
      g("violations.sectors", "block",
        sum(rel.sectors, (s) => s.violations) === rel.metrics.total_violations.value,
        "مجموع مخالفات القطاعات = الإجمالي");
      g("violations.types", "block",
        sum(rel.violation_types, (t) => t.count) === rel.metrics.total_violations.value,
        "مجموع أنواع المخالفات = الإجمالي");
      g("monitoring.monthly", "block",
        sum(rel.monthly.monitoring, (mo) => mo.visits) === rel.metrics.total_visits.value
        && sum(rel.monthly.monitoring, (mo) => mo.violations) === rel.metrics.total_violations.value,
        "المجاميع الشهرية تطابق إجماليات الرقابة");
      g("facility.types", "block",
        sum(rel.facility_types, (t) => t.count) === rel.metrics.current_operational.value,
        "مجموع أنواع الإيواء = الرخص التشغيلية");
      g("collar.sum", "block",
        rel.collar.blue + rel.collar.white === rel.metrics.total_demand.value,
        "زرقاء + بيضاء = إجمالي الطلب");
      g("econ.sum", "block",
        sum(rel.economic_activities, (a) => a.demand) === rel.metrics.total_demand.value,
        "مجموع الأنشطة الاقتصادية = إجمالي الطلب");

      for (const key of ["building", "operational", "beds"]) {
        const cur = key === "beds" ? rel.metrics.licensed_beds.value
          : rel.metrics["current_" + key].value;
        const base = rel.baseline[key];
        const monthly = sum(rel.monthly.licensing, (mo) => mo[key]);
        g("licensing.chain." + key, "block", base + monthly === cur,
          `خط الأساس + الإضافات الشهرية = الحالي (${key})`);
        g("licensing.sectors." + key, "block",
          sum(rel.sectors, (s) => s[key]) === cur, `مجموع القطاعات = الحالي (${key})`);
      }

      g("monitoring.monitors_sum", "block",
        sum(rel.sectors, (s) => s.monitors) === rel.metrics.total_monitors.value,
        "مجموع مراقبي القطاعات = الإجمالي");
      g("monitoring.closures_sum", "block",
        sum(rel.sectors, (s) => s.closures) === rel.metrics.total_closures.value,
        "مجموع قرارات إغلاق القطاعات = الإجمالي");
      g("monitoring.south_metric", "block",
        rel.metrics.south_violations.value
          === rel.sectors.find((s) => s.id === "south").violations,
        "مقياس مخالفات الجنوب يطابق سجل القطاع");
      g("series.lengths", "block",
        rel.monthly.licensing.length === 12 && rel.monthly.monitoring.length === 12
        && rel.scenarios.rows.length === 10,
        "أطوال السلاسل: 12 شهر ترخيص ورقابة، 10 أشهر سيناريوهات");
      const allCounts = []
        .concat(rel.sectors.flatMap((s) =>
          [s.demand, s.building, s.operational, s.beds, s.monitors, s.violations, s.visits, s.closures]))
        .concat(rel.violation_types.map((t) => t.count))
        .concat(rel.facility_types.map((t) => t.count))
        .concat(rel.economic_activities.map((a) => a.demand))
        .concat(rel.monthly.licensing.flatMap((m) => [m.building, m.operational, m.beds]))
        .concat(rel.monthly.monitoring.flatMap((m) => [m.visits, m.violations]))
        .concat(rel.scenarios.rows.flatMap((r) => [r.conservative, r.base, r.optimistic]))
        .concat(rel.neighbourhoods.rows.flatMap((n) => [n.building, n.operational, n.beds, n.violations]));
      g("counts.nonnegative_integers", "block",
        allCounts.every((x) => Number.isInteger(x) && x >= 0),
        "كل الأعداد صحيحة غير سالبة");

      g("occupancy.bound", "block",
        rel.metrics.occupied_beds.value <= rel.metrics.licensed_beds.value,
        "المشغول لا يتجاوز الطاقة");
      g("scenarios.order", "block",
        rel.scenarios.rows.every((r) => r.conservative >= r.base && r.base >= r.optimistic),
        "سيناريوهات: متحفظ ≥ أساسي ≥ متفائل");
      g("months.consecutive", "block",
        isConsecutive(rel.monthly.monitoring.map((r) => r.iso))
        && isConsecutive(rel.monthly.licensing.map((r) => r.iso))
        && isConsecutive(rel.scenarios.rows.map((r) => r.iso)),
        "الأشهر متتابعة في كل السلاسل");

      // الأحياء: عينة لا تتجاوز إجماليات قطاعها
      for (const s of rel.sectors) {
        const rows = rel.neighbourhoods.rows.filter((n) => n.sector === s.id);
        g("nbhd.sample." + s.id, "block",
          sum(rows, (n) => n.building) <= s.building
          && sum(rows, (n) => n.operational) <= s.operational
          && sum(rows, (n) => n.beds) <= s.beds
          && sum(rows, (n) => n.violations) <= s.violations,
          `عينة أحياء ${s.name} ≤ إجمالي القطاع`);
      }
      const names = rel.neighbourhoods.rows.map((n) => n.name);
      g("nbhd.unique", "block", new Set(names).size === names.length, "أسماء الأحياء فريدة");

      // الاستراتيجية: قواعد النشر
      const st = rel.strategy;
      if (st.status === "approved") {
        g("strategy.pillars7", "block",
          st.pillars.length === 7 && st.required_pillars === 7,
          "عدد الركائز المعتمدة = 7 (ثابت التكليف)",
          `الموجود: ${st.pillars.length}`);
        g("strategy.membership", "block",
          st.initiatives.every((i) => st.pillars.some((p) => p.id === i.pillar_id)),
          "كل مبادرة منشورة تنتمي لركيزة معتمدة");
        // إنذار يتطلب تنازلاً موقَّعاً عبر سجل النشر (لا حقل بيانات قابلاً للدسّ)
        const missingKpi = st.kpis.filter((k) => k.priority && k.current_value == null);
        g("kpi.priority_values", "warn", missingKpi.length === 0,
          "لكل مؤشر أولوية قيمة حالية (وإلا فتنازل موقَّع مسجَّل عند النشر)",
          missingKpi.length ? "مؤشرات بلا قيمة: " + missingKpi.map((k) => k.name).join("، ") : "");
        g("kpi.sources", "block",
          st.kpis.every((k) => k.source && k.as_of),
          "لكل مؤشر منشور مصدر وتاريخ قياس");
      } else {
        g("strategy.pending", "warn", false,
          "وحدة المبادرات/المؤشرات بانتظار المصدر المعتمد",
          "المطلوب: " + (st.source_required || "خطة عمل المشروع V.1.0.0")
          + " — مشاهد الاستراتيجية تعرض حالة الاعتماد الشريفة، والنشر الكامل محجوب.");
      }

      // أرقام نصوص التحليلات المعتمدة يجب أن تطابق حقائق الإصدار الحالي —
      // تلتقط عناوين قديمة بعد أي استيراد ببيانات جديدة (بوابة حاجبة)
      const truthPool = buildTruthPool(rel, der);
      for (const [key, ins] of Object.entries(rel.insights || {})) {
        const tokens = (ins.text.match(/[0-9][0-9,\.]*/g) || [])
          .map((t) => t.replace(/,/g, "").replace(/\.$/, ""));
        const stale = tokens.filter((t) => !truthPool.has(t));
        g("insight.figures." + key, "block", stale.length === 0,
          "أرقام التحليل المعتمد (" + key + ") تطابق بيانات الإصدار",
          stale.length ? "أرقام لا تطابق أي حقيقة حالية: " + stale.join("، ") : "");
        if (ins.status === "needs_review") {
          g("insight.review." + key, "warn", false,
            "نص التحليل (" + key + ") يحتاج إعادة اعتماد بعد تغير البيانات");
        }
      }

      const ns = rel.next_steps;
      if (ns.status !== "approved") {
        g("next_steps.pending", "warn", false, "لا خطوات قادمة معتمدة بعد",
          "يدخلها محرر مخوَّل وتُعتمد قبل عرضها؛ لا خطوات ملفّقة.");
      } else {
        g("next_steps.count", "block", ns.items.length >= 3 && ns.items.length <= 4,
          "عدد الخطوات المعتمدة بين 3 و4");
      }

      if (rel.compliance && rel.compliance.status === "pending_methodology") {
        g("compliance.methodology", "warn", false,
          "منهجية معدل الامتثال غير معتمدة",
          "تُعرض القيمة بوسم «قيمة مورّدة — بانتظار اعتماد المنهجية» في السطر الثانوي فقط.");
      }
      if (rel.meta.presentation_date_needs_confirmation) {
        g("meta.presentation_date", "warn", false,
          "تاريخ العرض التقديمي يحتاج تأكيداً من الإدارة قبل يوم العرض");
      }

      const scalarIds = ["deficit_beds", "coverage_pct", "uncovered_pct", "occupancy_pct",
        "vacant_beds", "blue_share_pct", "white_share_pct", "growth_building_abs",
        "growth_building_pct", "growth_operational_abs", "growth_operational_pct",
        "growth_beds_abs", "growth_beds_pct", "avg_monthly_visits",
        "south_violations_share_pct"];
      const scalarOk = scalarIds.every((id) =>
        !rel.derived[id] || der[id] === rel.derived[id].value);
      const sectorOk = rel.derived.sector_derived
        ? rel.sectors.every((s) => {
          const a = der.sector[s.id], b = rel.derived.sector_derived[s.id];
          return b == null || (a.coverage_pct === b.coverage_pct
            && a.deficit_beds === b.deficit_beds
            && a.violations_share_pct === b.violations_share_pct
            && a.demand_share_pct === b.demand_share_pct);
        }) : true;
      const rankOk = rel.derived.rankings
        ? Object.entries(rel.derived.rankings)
          .every(([k, v]) => der.rankings[k] === v) : true;
      g("derived.consistency", "block", scalarOk && sectorOk && rankOk,
        "إعادة حساب المتصفح تطابق كامل مشتقات الإصدار المنشور (قيم وقطاعات وترتيبات)");
    } catch (e) {
      gates.push({ id: "validate.crash", level: "block", ok: false,
        label: "تعذر إكمال الفحص", detail: String(e && e.message || e) });
    }

    return {
      gates,
      blockers: gates.filter((x) => x.level === "block" && !x.ok),
      warnings: gates.filter((x) => x.level === "warn" && !x.ok),
    };
  }

  /** بركة الحقيقة: كل صيغة عرض شرعية لكل قيمة في الإصدار (خام، مختصرة، نسب، آلاف) */
  function buildTruthPool(rel, der) {
    const pool = new Set();
    const add = (v) => {
      if (v == null || !Number.isFinite(v)) return;
      pool.add(String(v));
      pool.add(v.toFixed(1));                                     // 50 → "50.0" أيضاً
      if (Number.isInteger(v)) {
        if (v % 1000 === 0) pool.add(String(v / 1000));           // 368000 → 368 (ألف)
        if (v >= 10_000) pool.add(String(Math.round(v / 100) / 10));  // 612400 → 612.4
        if (v >= 1_000_000) pool.add(String(Math.round(v / 10_000) / 100)); // 1.42
      }
    };
    for (let y = 2020; y <= 2035; y++) pool.add(String(y));       // سنوات مشروعة في النصوص
    for (const m of Object.values(rel.metrics)) add(m.value);
    for (const id of Object.keys(der)) {
      if (typeof der[id] === "number") add(der[id]);
    }
    for (const s of rel.sectors) {
      [s.demand, s.building, s.operational, s.beds, s.monitors, s.violations,
        s.visits, s.closures].forEach(add);
      const sd = der.sector[s.id];
      [sd.coverage_pct, sd.deficit_beds, sd.violations_share_pct, sd.demand_share_pct].forEach(add);
    }
    if (rel.compliance) add(rel.compliance.value);
    return pool;
  }

  function isConsecutive(isos) {
    for (let i = 1; i < isos.length; i++) {
      const [ya, ma] = isos[i - 1].split("-").map(Number);
      const [yb, mb] = isos[i].split("-").map(Number);
      if (ya * 12 + ma + 1 !== yb * 12 + mb) return false;
    }
    return true;
  }

  return { validateRelease, isConsecutive };
})();
