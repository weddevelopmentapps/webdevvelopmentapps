/* validate.test.mjs — بوابات الجودة تحت الإفساد المتعمد: كل نسخة فاسدة من
   الإصدار يجب أن تحجبها البوابة الصحيحة بعينها — لا نشر لأرقام لا تتصالح. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH, freshRelease } from "./load-app.mjs";

const V = RH.data.validate;
const blockerIds = (rel) => Array.from(V.validateRelease(rel).blockers, (b) => b.id);

test("خط أساس: الإصدار السليم يمر بصفر حواجب", () => {
  assert.deepStrictEqual(blockerIds(freshRelease()), []);
});

test("إفساد طلب قطاع → بوابة demand.sectors تحجب", () => {
  const rel = freshRelease();
  rel.sectors[0].demand += 1000;
  const ids = blockerIds(rel);
  assert.ok(ids.includes("demand.sectors"), `الحواجب: ${ids.join(", ")}`);
});

test("إفساد أسرّة قطاع → بوابتا beds.sectors وlicensing.sectors.beds تحجبان", () => {
  const rel = freshRelease();
  rel.sectors[2].beds -= 500;
  const ids = blockerIds(rel);
  assert.ok(ids.includes("beds.sectors"));
  assert.ok(ids.includes("licensing.sectors.beds"));
});

test("حذف شهر من الرقابة → تتابع الأشهر والمجاميع الشهرية يحجبان", () => {
  const rel = freshRelease();
  rel.monthly.monitoring.splice(3, 1);
  const ids = blockerIds(rel);
  assert.ok(ids.includes("months.consecutive"), "فجوة الأشهر مكشوفة");
  assert.ok(ids.includes("monitoring.monthly"), "المجاميع الشهرية لم تعد تطابق");
});

test("سيناريو معكوس (متفائل فوق المتحفظ) → scenarios.order تحجب", () => {
  const rel = freshRelease();
  const row = rel.scenarios.rows[4];
  row.optimistic = row.conservative + 100000;
  assert.ok(blockerIds(rel).includes("scenarios.order"));
});

test("حي يتجاوز أسرّة قطاعه → بوابة عينة القطاع تحجب", () => {
  const rel = freshRelease();
  rel.neighbourhoods.rows.find((n) => n.sector === "north").beds = 999999;
  assert.ok(blockerIds(rel).includes("nbhd.sample.north"));
});

test("اسم حي مكرر → nbhd.unique تحجب", () => {
  const rel = freshRelease();
  rel.neighbourhoods.rows[1].name = rel.neighbourhoods.rows[0].name;
  assert.ok(blockerIds(rel).includes("nbhd.unique"));
});

test("strategy approved بركائز ناقصة → strategy.pillars7 تحجب", () => {
  const rel = freshRelease();
  rel.strategy.status = "approved"; // اعتماد مزعوم والركائز صفر من أصل 7
  const res = V.validateRelease(rel);
  assert.ok(res.blockers.some((b) => b.id === "strategy.pillars7"));
  // مع الاعتماد لا يصدر إنذار «بانتظار المصدر» — الحجب صريح لا ضبابي
  assert.ok(!res.warnings.some((w) => w.id === "strategy.pending"));
});

test("مبادرة خارج ركائزها المعتمدة → strategy.membership تحجب", () => {
  const rel = freshRelease();
  rel.strategy.status = "approved";
  rel.strategy.pillars = Array.from({ length: 7 }, (_x, i) => ({ id: "p" + (i + 1) }));
  rel.strategy.initiatives = [{ id: "i1", pillar_id: "p-ghost", execution_status: "on_track" }];
  assert.ok(blockerIds(rel).includes("strategy.membership"));
});

test("مؤشر أولوية بلا قيمة → إنذار kpi.priority_values (يُحجب النشر دون تنازل موقَّع)", () => {
  const rel = freshRelease();
  rel.strategy.status = "approved";
  rel.strategy.required_pillars = 7;
  rel.strategy.pillars = Array.from({ length: 7 }, (_x, i) => ({ id: "p" + (i + 1) }));
  rel.strategy.initiatives = [];
  rel.strategy.kpis = [{
    id: "k1", name: "نسبة التغطية المستهدفة", priority: true,
    current_value: null, source: "ورقة العمل", as_of: "2026-08",
  }];
  const res = V.validateRelease(rel);
  // بعد مراجعة الأمن: التنازل حصراً عبر سجل التنازلات الموقَّع الممرر للنشر —
  // لا حقل waiver داخل البيانات. البوابة إنذار، وpublish يرفض إنذاراً بلا تنازل.
  const gate = res.warnings.find((b) => b.id === "kpi.priority_values");
  assert.ok(gate, "البوابة تنذر وتتطلب تنازلاً موقَّعاً");
  assert.ok(gate.detail.includes("نسبة التغطية المستهدفة"), "التفصيل يسمي المؤشر الناقص");
  assert.ok(!res.blockers.find((b) => b.id === "kpi.priority_values"));
});

test("المؤشر نفسه بقيمة حالية → البوابة تمر (حقل waiver داخل البيانات لا يتجاوزها)", () => {
  for (const patch of [{ current_value: 43.1 }]) {
    const rel = freshRelease();
    rel.strategy.status = "approved";
    rel.strategy.pillars = Array.from({ length: 7 }, (_x, i) => ({ id: "p" + (i + 1) }));
    rel.strategy.initiatives = [];
    rel.strategy.kpis = [Object.assign({
      id: "k1", name: "نسبة التغطية المستهدفة", priority: true,
      current_value: null, waiver: null, source: "ورقة العمل", as_of: "2026-08",
    }, patch)];
    assert.ok(!blockerIds(rel).includes("kpi.priority_values"));
  }
});

test("مؤشر منشور بلا مصدر أو تاريخ قياس → kpi.sources تحجب", () => {
  const rel = freshRelease();
  rel.strategy.status = "approved";
  rel.strategy.pillars = Array.from({ length: 7 }, (_x, i) => ({ id: "p" + (i + 1) }));
  rel.strategy.initiatives = [];
  rel.strategy.kpis = [{
    id: "k1", name: "مؤشر", priority: false,
    current_value: 10, waiver: null, source: "", as_of: "2026-08",
  }];
  assert.ok(blockerIds(rel).includes("kpi.sources"));
});

test("خطوات قادمة معتمدة بعدد خارج 3–4 → next_steps.count تحجب", () => {
  const rel = freshRelease();
  rel.next_steps = { status: "approved", items: [{ text: "خطوة وحيدة" }] };
  assert.ok(blockerIds(rel).includes("next_steps.count"));
});

test("مشتق منشور محرَّف → derived.consistency تحجب", () => {
  const rel = freshRelease();
  rel.derived.coverage_pct.value = 99.9;
  assert.ok(blockerIds(rel).includes("derived.consistency"));
});

test("إصدار مكسور بنيوياً (قطاع الجنوب محذوف) → حاجز validate.crash لا انهيار", () => {
  const rel = freshRelease();
  rel.sectors = rel.sectors.filter((s) => s.id !== "south");
  let res;
  assert.doesNotThrow(() => { res = V.validateRelease(rel); });
  assert.ok(res.blockers.some((b) => b.id === "validate.crash"));
});
