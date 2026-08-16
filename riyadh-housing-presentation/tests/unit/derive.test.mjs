/* derive.test.mjs — الاشتقاق المركزي: إعادة حساب كل قيمة مشتقة منشورة
   ومطابقتها بدقة مع release.json.derived (مرآة بايثون ↔ متصفح). */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH, freshRelease, norm } from "./load-app.mjs";

const D = RH.data.derive;
const rel = freshRelease();
const der = D.compute(rel);

/* ── القيم المشتقة على مستوى المدينة: القيمة المتوقعة حرفياً + مطابقة الإصدار ── */
const CITY = [
  ["coverage_pct", 43.1],
  ["uncovered_pct", 56.9],
  ["occupancy_pct", 91.7],
  ["vacant_beds", 50829],
  ["deficit_beds", 807600],
  ["growth_building_abs", 32],
  ["growth_building_pct", 50.0],
  ["growth_operational_abs", 22],
  ["growth_operational_pct", 18.6],
  ["growth_beds_abs", 48500],
  ["growth_beds_pct", 8.6],
  ["blue_share_pct", 82.0],
  ["white_share_pct", 18.0],
  ["south_violations_share_pct", 37.8],
  ["avg_monthly_visits", 1638],
];

test("المشتقات المدينية: compute يعيد القيم المنشورة حرفياً", () => {
  for (const [key, expected] of CITY) {
    assert.deepStrictEqual(der[key], expected, `المفتاح ${key}`);
    assert.deepStrictEqual(der[key], rel.derived[key].value,
      `تطابق الإصدار المنشور للمفتاح ${key}`);
  }
});

test("تغطيات القطاعات الخمس تطابق المنشور بدقة", () => {
  const EXPECTED = { north: 49.6, east: 52.1, center: 39.0, west: 40.6, south: 34.8 };
  for (const [id, cov] of Object.entries(EXPECTED)) {
    assert.deepStrictEqual(der.sector[id].coverage_pct, cov, `تغطية ${id}`);
    assert.deepStrictEqual(der.sector[id].coverage_pct,
      rel.derived.sector_derived[id].coverage_pct, `تطابق الإصدار لتغطية ${id}`);
  }
});

test("كامل مشتقات القطاعات (عجز/حصص/خام) تطابق sector_derived المنشورة", () => {
  for (const s of rel.sectors) {
    assert.deepStrictEqual(norm(der.sector[s.id]), rel.derived.sector_derived[s.id],
      `مشتقات قطاع ${s.id}`);
  }
});

test("الترتيبات: الجنوب أعلى طلباً وأدنى تغطية، الشرق أعلى تغطية", () => {
  assert.deepStrictEqual(der.rankings.highest_demand, "south");
  assert.deepStrictEqual(der.rankings.lowest_coverage, "south");
  assert.deepStrictEqual(der.rankings.highest_violations, "south");
  assert.deepStrictEqual(der.rankings.highest_coverage, "east");
  assert.deepStrictEqual(der.rankings.highest_building, "east");
  assert.deepStrictEqual(der.rankings.lowest_building, "center");
  assert.deepStrictEqual(der.rankings.lowest_operational, "west");
  assert.deepStrictEqual(der.rankings.lowest_beds, "west");
  assert.deepStrictEqual(norm(der.rankings), rel.derived.rankings);
});

/* ── roundHalfUp: نصف-لأعلى حتمي رغم تمثيل الفاصلة العائمة ── */
test("roundHalfUp: حالات الحد النصفي والتمثيل العائم", () => {
  assert.deepStrictEqual(D.roundHalfUp(0.05, 1), 0.1);
  assert.deepStrictEqual(D.roundHalfUp(91.65, 1), 91.7);
  assert.deepStrictEqual(D.roundHalfUp(91.64, 1), 91.6);
  assert.deepStrictEqual(D.roundHalfUp(2.5, 0), 3);
  assert.deepStrictEqual(D.roundHalfUp(1.25), 1.3); // المنازل الافتراضية = 1
});

test("roundHalfUp: السالب نصف-بعيداً-عن-الصفر (مرآة ROUND_HALF_UP)", () => {
  assert.deepStrictEqual(D.roundHalfUp(-0.05, 1), -0.1);
  assert.deepStrictEqual(D.roundHalfUp(-2.5, 0), -3);
  assert.deepStrictEqual(D.roundHalfUp(-91.65, 1), -91.7);
});

test("pct يرفض القسمة على صفر برسالة صريحة", () => {
  assert.throws(() => D.pct(5, 0), /قسمة على صفر/);
  assert.throws(() => D.pct(0, 0), /قسمة على صفر/);
});

/* ── kpiVariance بالاتجاهين ── */
test("kpiVariance: أعلى-أفضل داخل المسار وخارجه", () => {
  assert.deepStrictEqual(
    norm(D.kpiVariance({ current_value: 43.1, target: 60, direction: "higher_better" })),
    { gap: 16.9, onTrack: false });
  assert.deepStrictEqual(
    norm(D.kpiVariance({ current_value: 65, target: 60, direction: "higher_better" })),
    { gap: -5, onTrack: true });
});

test("kpiVariance: أدنى-أفضل داخل المسار وخارجه", () => {
  assert.deepStrictEqual(
    norm(D.kpiVariance({ current_value: 8, target: 10, direction: "lower_better" })),
    { gap: 2, onTrack: true });
  assert.deepStrictEqual(
    norm(D.kpiVariance({ current_value: 12, target: 10, direction: "lower_better" })),
    { gap: -2, onTrack: false });
});

test("kpiVariance: قيمة حالية أو مستهدف مفقود → null (لا تلفيق)", () => {
  assert.deepStrictEqual(D.kpiVariance({ current_value: null, target: 60 }), null);
  assert.deepStrictEqual(D.kpiVariance({ current_value: 5, target: null }), null);
});

/* ── computeStrategy: عقيدة عدم التلفيق ── */
test("مرآة المصدر approved_source_mirror بلا أوزان/تقدم → لا نسب ملفقة", () => {
  // V2: المصدر معتمد نقلاً حرفياً، لكنه لا يحمل أوزاناً ولا نسب تقدم —
  // فيبقى التقدم الموزون غير قابل للنشر بصدق (لا تحويل تعسفي لأي حالة إلى ٪)
  assert.deepStrictEqual(rel.strategy.status, "approved_source_mirror");
  assert.deepStrictEqual(der.strategy.publishable, false);
  assert.deepStrictEqual(der.strategy.overall_pct, null);
  assert.deepStrictEqual(der.strategy.status_counts, null);
});

function miniStrategy() {
  return {
    status: "approved",
    pillars: [
      { id: "p1", weight: 2 },
      { id: "p2", weight: 1 },
      { id: "p3", weight: 1 }, // ركيزة بلا مبادرات: تقدّمها null ولا تدخل الإجمالي
    ],
    initiatives: [
      { pillar_id: "p1", weight: 1, progress_percent: 40, execution_status: "on_track" },
      { pillar_id: "p1", weight: 3, progress_percent: 80, execution_status: "on_track" },
      { pillar_id: "p2", weight: 1, progress_percent: 50,
        execution_status: "delayed", schedule_status: "behind" },
    ],
  };
}

test("computeStrategy: أوزان كاملة → متوسطات موزونة صحيحة", () => {
  const out = D.computeStrategy(miniStrategy());
  assert.deepStrictEqual(out.publishable, true);
  // p1 = (1·40 + 3·80) ÷ 4 = 70 ، p2 = 50 ، الإجمالي = (2·70 + 1·50) ÷ 3 = 63.3
  assert.deepStrictEqual(out.pillars.p1.progress_pct, 70);
  assert.deepStrictEqual(out.pillars.p1.count, 2);
  assert.deepStrictEqual(out.pillars.p2.progress_pct, 50);
  assert.deepStrictEqual(norm(out.pillars.p3), { progress_pct: null, count: 0 });
  assert.deepStrictEqual(out.overall_pct, 63.3);
  assert.deepStrictEqual(norm(out.status_counts.execution), { on_track: 2, delayed: 1 });
  assert.deepStrictEqual(norm(out.status_counts.schedule), { behind: 1 });
});

test("computeStrategy: وزن مبادرة مفقود → غير قابل للنشر", () => {
  const st = miniStrategy();
  delete st.initiatives[1].weight;
  const out = D.computeStrategy(st);
  assert.deepStrictEqual(out.publishable, false);
  assert.deepStrictEqual(out.overall_pct, null);
  // توزيع الحالات يبقى متاحاً — النسبة الدقيقة وحدها محجوبة
  assert.deepStrictEqual(norm(out.status_counts.execution), { on_track: 2, delayed: 1 });
});

test("computeStrategy: progress_percent غير رقمي → توزيع الحالات فقط", () => {
  const st = miniStrategy();
  st.initiatives[0].progress_percent = null;
  const out = D.computeStrategy(st);
  assert.deepStrictEqual(out.publishable, false);
  assert.deepStrictEqual(out.overall_pct, null);
  assert.ok(out.status_counts, "توزيع الحالات يبقى منشوراً");
});

test("computeStrategy: غير معتمدة أو بلا ركائز → غير قابلة للنشر", () => {
  const st = miniStrategy();
  st.status = "pending_source";
  assert.deepStrictEqual(D.computeStrategy(st).publishable, false);
  const st2 = miniStrategy();
  st2.pillars = [];
  assert.deepStrictEqual(D.computeStrategy(st2).publishable, false);
  assert.deepStrictEqual(D.computeStrategy(null).publishable, false);
});
