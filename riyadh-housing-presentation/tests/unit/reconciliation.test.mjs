/* reconciliation.test.mjs — مصفوفة المطابقة الكاملة ضد release.json مباشرة:
   كل مجموع جزئي يساوي إجماليه المعتمد، والسلاسل متتابعة، والعينات محدودة
   بقطاعاتها — ثم validateRelease يعيد صفر بوابات حاجبة على الإصدار المنشور. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH, freshRelease } from "./load-app.mjs";

const rel = freshRelease();
const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);

/* ── مجاميع القطاعات مقابل الإجماليات المعتمدة ── */
test("مجموع طلب القطاعات = 1,420,000 = إجمالي الطلب", () => {
  assert.deepStrictEqual(sum(rel.sectors, (s) => s.demand), 1420000);
  assert.deepStrictEqual(sum(rel.sectors, (s) => s.demand), rel.metrics.total_demand.value);
});

test("مجموع أسرّة القطاعات = 612,400 = الطاقة المرخصة", () => {
  assert.deepStrictEqual(sum(rel.sectors, (s) => s.beds), 612400);
  assert.deepStrictEqual(sum(rel.sectors, (s) => s.beds), rel.metrics.licensed_beds.value);
});

test("مجموع زيارات القطاعات = 19,651 = إجمالي الزيارات", () => {
  assert.deepStrictEqual(sum(rel.sectors, (s) => s.visits), 19651);
  assert.deepStrictEqual(sum(rel.sectors, (s) => s.visits), rel.metrics.total_visits.value);
});

test("المخالفات 3,617 قطاعياً ونوعياً وشهرياً", () => {
  const total = rel.metrics.total_violations.value;
  assert.deepStrictEqual(total, 3617);
  assert.deepStrictEqual(sum(rel.sectors, (s) => s.violations), total, "قطاعياً");
  assert.deepStrictEqual(sum(rel.violation_types, (t) => t.count), total, "نوعياً");
  assert.deepStrictEqual(sum(rel.monthly.monitoring, (m) => m.violations), total, "شهرياً");
});

test("الزيارات الشهرية = الإجمالي، ومخالفات الجنوب متسقة بين المقياس والقطاع", () => {
  assert.deepStrictEqual(sum(rel.monthly.monitoring, (m) => m.visits),
    rel.metrics.total_visits.value);
  assert.deepStrictEqual(rel.metrics.south_violations.value,
    rel.sectors.find((s) => s.id === "south").violations);
});

test("مجموع أنواع منشآت الإيواء = 140 = الرخص التشغيلية", () => {
  assert.deepStrictEqual(sum(rel.facility_types, (t) => t.count), 140);
  assert.deepStrictEqual(sum(rel.facility_types, (t) => t.count),
    rel.metrics.current_operational.value);
});

/* ── الياقات والأنشطة الاقتصادية = إجمالي الطلب ── */
test("زرقاء + بيضاء = إجمالي الطلب، ومقاييس الياقات مطابقة", () => {
  assert.deepStrictEqual(rel.collar.blue + rel.collar.white, rel.metrics.total_demand.value);
  assert.deepStrictEqual(rel.collar.blue, rel.metrics.blue_collar.value);
  assert.deepStrictEqual(rel.collar.white, rel.metrics.white_collar.value);
});

test("مجموع الأنشطة الاقتصادية = إجمالي الطلب", () => {
  assert.deepStrictEqual(sum(rel.economic_activities, (a) => a.demand),
    rel.metrics.total_demand.value);
});

/* ── سلسلة الترخيص: خط الأساس + الشهري = الحالي (المقاييس الثلاثة) ── */
test("خط الأساس + الإضافات الشهرية = الحالي، ومجموع القطاعات = الحالي", () => {
  for (const key of ["building", "operational", "beds"]) {
    const cur = key === "beds"
      ? rel.metrics.licensed_beds.value
      : rel.metrics["current_" + key].value;
    assert.deepStrictEqual(rel.baseline[key], rel.metrics["baseline_" + key].value,
      `تطابق خط الأساس (${key})`);
    assert.deepStrictEqual(rel.baseline[key] + sum(rel.monthly.licensing, (m) => m[key]),
      cur, `السلسلة الشهرية (${key})`);
    assert.deepStrictEqual(sum(rel.sectors, (s) => s[key]), cur, `القطاعات (${key})`);
  }
});

test("المشغول لا يتجاوز الطاقة المرخصة", () => {
  assert.ok(rel.metrics.occupied_beds.value <= rel.metrics.licensed_beds.value);
});

/* ── تتابع الأشهر وترتيب السيناريوهات ── */
test("الأشهر متتابعة في الرقابة والترخيص والسيناريوهات (12/12/10 نقطة)", () => {
  const consec = RH.data.validate.isConsecutive;
  assert.deepStrictEqual(rel.monthly.monitoring.length, 12);
  assert.deepStrictEqual(rel.monthly.licensing.length, 12);
  assert.ok(consec(rel.monthly.monitoring.map((r) => r.iso)));
  assert.ok(consec(rel.monthly.licensing.map((r) => r.iso)));
  assert.ok(consec(rel.scenarios.rows.map((r) => r.iso)));
  // سلامة الفاحص نفسه: عبور السنة صحيح والفجوة مكشوفة
  assert.ok(consec(["2025-12", "2026-01"]));
  assert.deepStrictEqual(consec(["2025-12", "2026-02"]), false);
});

test("سيناريوهات العجز: متحفظ ≥ أساسي ≥ متفائل في كل شهر", () => {
  for (const r of rel.scenarios.rows) {
    assert.ok(r.conservative >= r.base && r.base >= r.optimistic, `الشهر ${r.iso}`);
  }
});

/* ── عينة الأحياء لا تتجاوز إجماليات قطاعها ── */
test("عينة الأحياء ≤ إجماليات قطاعها في المقاييس الأربعة", () => {
  for (const s of rel.sectors) {
    const rows = rel.neighbourhoods.rows.filter((n) => n.sector === s.id);
    assert.ok(rows.length > 0, `للقطاع ${s.id} عينة أحياء`);
    assert.ok(sum(rows, (n) => n.building) <= s.building, `بناء ${s.id}`);
    assert.ok(sum(rows, (n) => n.operational) <= s.operational, `تشغيلية ${s.id}`);
    assert.ok(sum(rows, (n) => n.beds) <= s.beds, `أسرّة ${s.id}`);
    assert.ok(sum(rows, (n) => n.violations) <= s.violations, `مخالفات ${s.id}`);
  }
});

test("أسماء الأحياء فريدة في العينة", () => {
  const names = rel.neighbourhoods.rows.map((n) => n.name);
  assert.deepStrictEqual(new Set(names).size, names.length);
});

/* ── البوابة الجامعة: الإصدار المنشور يمر بصفر حواجب ── */
test("validateRelease على الإصدار المنشور: صفر بوابات حاجبة", () => {
  const res = RH.data.validate.validateRelease(freshRelease());
  assert.deepStrictEqual(Array.from(res.blockers, (b) => b.id), [],
    "لا يجوز وجود أي بوابة حاجبة فاشلة على الإصدار المنشور");
  for (const gate of res.gates.filter((g) => g.level === "block")) {
    assert.ok(gate.ok, `بوابة حاجبة فاشلة: ${gate.id}`);
  }
});

test("إنذارات الشرف الأربعة قائمة (استراتيجية/خطوات/امتثال/تاريخ العرض)", () => {
  const res = RH.data.validate.validateRelease(freshRelease());
  const ids = res.warnings.map((w) => w.id);
  assert.ok(ids.includes("strategy.pending"), "وحدة الاستراتيجية بانتظار المصدر");
  assert.ok(ids.includes("next_steps.pending"), "لا خطوات معتمدة");
  assert.ok(ids.includes("compliance.methodology"), "منهجية الامتثال غير معتمدة");
  assert.ok(ids.includes("meta.presentation_date"), "تاريخ العرض يحتاج تأكيداً");
});
