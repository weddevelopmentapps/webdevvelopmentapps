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

      g("demand.sectors", "block", sum(rel.sectors, (s) => s.demand) === 1_420_000,
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
          st.pillars.length === st.required_pillars,
          `عدد الركائز المعتمدة = ${st.required_pillars}`,
          `الموجود: ${st.pillars.length}`);
        g("strategy.membership", "block",
          st.initiatives.every((i) => st.pillars.some((p) => p.id === i.pillar_id)),
          "كل مبادرة منشورة تنتمي لركيزة معتمدة");
        const missingKpi = st.kpis.filter((k) => k.priority && k.current_value == null && !k.waiver);
        g("kpi.priority_values", "block", missingKpi.length === 0,
          "لكل مؤشر أولوية قيمة حالية أو تنازل موقَّع",
          missingKpi.length ? "مؤشرات ناقصة: " + missingKpi.map((k) => k.name).join("، ") : "");
        g("kpi.sources", "block",
          st.kpis.every((k) => k.source && k.as_of),
          "لكل مؤشر منشور مصدر وتاريخ قياس");
      } else {
        g("strategy.pending", "warn", false,
          "وحدة المبادرات/المؤشرات بانتظار المصدر المعتمد",
          "المطلوب: " + (st.source_required || "خطة عمل المشروع V.1.0.0")
          + " — مشاهد الاستراتيجية تعرض حالة الاعتماد الشريفة، والنشر الكامل محجوب.");
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

      g("derived.consistency", "block",
        der.coverage_pct === rel.derived.coverage_pct.value
        && der.occupancy_pct === rel.derived.occupancy_pct.value
        && der.vacant_beds === rel.derived.vacant_beds.value,
        "إعادة حساب المتصفح تطابق مشتقات الإصدار المنشور");
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
