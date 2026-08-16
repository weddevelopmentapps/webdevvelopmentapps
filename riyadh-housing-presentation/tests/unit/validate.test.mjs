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

/* ── عقد الاستراتيجية V2: مرآة المصدر المعتمد approved_source_mirror ── */

test("حذف محور → strategy.pillars4 تحجب (4 محاور: 3 ركائز + ممكن)", () => {
  const rel = freshRelease();
  rel.strategy.pillars = rel.strategy.pillars.slice(0, 3);
  rel.strategy.initiatives = rel.strategy.initiatives
    .filter((i) => i.pillar_id !== "p4"); // عزل بوابة العدد عن بوابة الانتماء
  assert.ok(blockerIds(rel).includes("strategy.pillars4"));
});

test("قلب نوع محور (ركيزتان + ممكنان) → strategy.pillars4 تحجب", () => {
  const rel = freshRelease();
  rel.strategy.pillars[0].kind = "ممكن";
  assert.ok(blockerIds(rel).includes("strategy.pillars4"));
});

test("مبادرة خارج محاورها → strategy.membership تحجب", () => {
  const rel = freshRelease();
  rel.strategy.initiatives[5].pillar_id = "p-ghost";
  assert.ok(blockerIds(rel).includes("strategy.membership"));
});

test("تكرار معرف مبادرة → strategy.initiatives18 تحجب", () => {
  const rel = freshRelease();
  rel.strategy.initiatives[1].id = rel.strategy.initiatives[0].id;
  assert.ok(blockerIds(rel).includes("strategy.initiatives18"));
});

test("مبادرة نهايتها قبل بدايتها → strategy.initiative_dates تحجب", () => {
  const rel = freshRelease();
  const withDates = rel.strategy.initiatives.find((i) => i.start && i.end);
  withDates.end = "2020-01-01";
  assert.ok(blockerIds(rel).includes("strategy.initiative_dates"));
});

test("تاريخ غير ISO → strategy.initiative_dates تحجب", () => {
  const rel = freshRelease();
  rel.strategy.initiatives[2].start = "01/04/2026";
  assert.ok(blockerIds(rel).includes("strategy.initiative_dates"));
});

test("حالة مبادرة خارج المفردات → strategy.initiative_status تحجب", () => {
  const rel = freshRelease();
  rel.strategy.initiatives[0].status = "قيد الدراسة"; // ليست من المفردات الأربع
  assert.ok(blockerIds(rel).includes("strategy.initiative_status"));
});

test("عبث بمعرفات المؤشرات → strategy.kpis14 تحجب (1..14 بالضبط)", () => {
  const rel = freshRelease();
  rel.strategy.kpis[13].id = 99;
  assert.ok(blockerIds(rel).includes("strategy.kpis14"));
});

test("مؤشر نسبي بمستهدف خارج [0,1] → kpi.pct_bounds تحجب", () => {
  const rel = freshRelease();
  const pctKpi = rel.strategy.kpis.find((k) => k.pct);
  pctKpi.target = 1.2;
  assert.ok(blockerIds(rel).includes("kpi.pct_bounds"));
});

test("مستهدف لا يتجاوز خط أساسه → kpi.target_gt_baseline تحجب", () => {
  const rel = freshRelease();
  rel.strategy.kpis[4].target = rel.strategy.kpis[4].baseline;
  assert.ok(blockerIds(rel).includes("kpi.target_gt_baseline"));
});

test("القيم الحالية الغائبة → إنذار kpi.current_values لا حاجب (تنازل موقَّع عند النشر)", () => {
  const res = V.validateRelease(freshRelease()); // الإصدار الحقيقي: 14 قيمة غائبة بصدق
  const gate = res.warnings.find((w) => w.id === "kpi.current_values");
  assert.ok(gate, "الإنذار قائم على الإصدار المنشور");
  assert.ok(!res.blockers.find((b) => b.id === "kpi.current_values"));
  assert.ok(gate.detail.includes("مؤشراً"), "التفصيل يعدّ المؤشرات بتطابق العدد والمعدود");
});

test("حالة استراتيجية غير معتمدة → إنذار strategy.pending وغياب بوابات المرآة", () => {
  const rel = freshRelease();
  rel.strategy.status = "pending_source";
  const res = V.validateRelease(rel);
  assert.ok(res.warnings.some((w) => w.id === "strategy.pending"));
  assert.ok(!res.gates.some((g) => g.id === "strategy.pillars4"));
});

/* ── لوحات رؤى الأقسام تخضع لمجمع الحقائق كالتحليلات تماماً ── */

test("رقم دخيل في نص لوحة رؤى → insight_panels.figures تحجب", () => {
  const rel = freshRelease();
  rel.insight_panels.sections.supply[0].text = "الطلب يتجاوز العرض بنحو 999999 سرير.";
  assert.ok(blockerIds(rel).includes("insight_panels.figures.supply.sd1"));
});

test("الصيغ المختصرة المشروعة (807.6/48.5/18.6) ومعرفات المبادرات (1.1) تمر", () => {
  // نصوص الإصدار الحقيقي تحوي هذه الصيغ — يجب أن تمر بلا أي حاجب أرقام
  const ids = blockerIds(freshRelease());
  assert.ok(!ids.some((id) => id.startsWith("insight_panels.figures.")),
    `حواجب أرقام غير متوقعة: ${ids.join("، ")}`);
});

test("تصنيف لوحة رؤى خارج المفردات → insight_panels.cls تحجب", () => {
  const rel = freshRelease();
  rel.insight_panels.sections.control[0].cls = "danger";
  assert.ok(blockerIds(rel).includes("insight_panels.cls.control.cd1"));
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
