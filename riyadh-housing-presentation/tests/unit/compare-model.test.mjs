/* compare-model.test.mjs — نموذج مركز المقارنة القطاعية RH.explore.compare
   ─────────────────────────────────────────────────────────────────────────
   ما يُثبَت هنا هو ما يمنع الانجراف الذي يرفضه المدقق التحليلي:

     • **لا اختلاق**: كل قيمة قطاعية هي حقل `release.sectors[i]` حرفياً أو
       مشتق منشور في `derived.sector[id]` أو اشتقاق تعريفي من هذين حصراً.
     • **بوابة المطابقة حقيقية**: مجموع القطاعات الخمسة يساوي كل إجمالي
       منشور — ويُثبَت أن البوابة **تسقط فعلاً** عند تلويث الإصدار (وإلا
       كانت البوابة زينة لا فحصاً).
     • **الترتيب مسمّى ومتسق مع اتجاه التحسّن**: «الأدنى أفضل» يعطي الرتبة
       الأولى للأدنى، والتعادل يتقاسم الرتبة تنافسياً، والغياب لا يُرتَّب.
     • **الحصة لا تُفرض على النسب**: المؤشرات النسبية تعيد share = null
       ومعها سبب صريح.
     • **الصدق عند النقص**: مقام صفري أو مدخل غائب → null لا صفر ولا لانهاية.
     • **الوسوم تسافر**: حدود التفكيك تحمل نص منهجية الامتثال وتحفظ
       السيناريوهات حرفياً من الإصدار.
     • **مرآة المشتقات**: التغطية المعاد حسابها من مجاميع القطاعات تطابق
       `derived.coverage_pct` المنشورة — برهان أن الاشتقاق إعادة تعبير.

   الوحدة تُحمَّل بملفها الحقيقي: `load-app.mjs` يبني RH كاملة في سياق vm،
   ثم يُنفَّذ ملف الملحق بوسم RH ذاته — فالنموذج النقي يُعرَّف دون DOM
   وتسجيل الملحق يتخطى نفسه بغياب `RH.presenter.ax`. لم يُعدَّل
   `load-app.mjs` (ملف المعمار) ولا أي ملف خارج عقد هذه الميزة. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RH, ROOT, freshRelease, freshGeo } from "./load-app.mjs";

/* تنفيذ ملف الميزة على RH الحقيقية — بلا نسخ منطق ولا محاكاة للوحدة */
const SRC = path.join(ROOT, "src", "js", "presenter", "appendix", "ax-compare.js");
new Function("RH", readFileSync(SRC, "utf8"))(RH);

const C = RH.explore.compare;
const fmt = RH.core.fmt;
const rel = freshRelease();
const geo = freshGeo();
const der = RH.data.derive.compute(rel);

/** نسخة معدّلة معزولة — لا اختبار يلوث إصدار اختبار آخر */
function mutated(fn) {
  const copy = freshRelease();
  fn(copy);
  return copy;
}

/** الصف الكامل لمؤشر على الإصدار المرجعي */
const rowOf = (id, r, d, g) => C.row(r || rel, d || der, g === undefined ? geo : g, id);

/* ══════════════════════ 1) شكل الوحدة وتحميلها ══════════════════════ */

test("الوحدة تُعرَّف على RH.explore دون لمس DOM ودون تسجيل ملحق في بيئة الاختبار", () => {
  assert.ok(C, "RH.explore.compare غير معرَّف");
  for (const fn of ["row", "matrix", "profile", "reconciliation", "limits",
    "provenance", "concentration", "balance", "context", "formatValue"]) {
    assert.equal(typeof C[fn], "function", "الدالة الناقصة: " + fn);
  }
  /* ax-shell غائب في بيئة الوحدة فلا يجوز أن يكون التسجيل قد وقع */
  assert.equal(RH.presenter.ax, undefined,
    "تسجيل الملحق يجب أن يتخطى نفسه بغياب الهيكل");
});

test("ترتيب القطاعات مقفل على الخمسة بترتيب geoutils ذاته", () => {
  assert.deepEqual(Array.from(C.SECTOR_ORDER),
    ["north", "east", "center", "west", "south"]);
  assert.deepEqual(Array.from(C.SECTOR_ORDER),
    Array.from(RH.viz.geoutils.SECTOR_ORDER),
    "أي انحراف عن ترتيب geoutils يكسر تطابق الخرائط والفهارس");
});

test("كتالوج المؤشرات مجمَّد وبمعرفات فريدة وعائلات قانونية", () => {
  assert.ok(Object.isFrozen(C.INDICATORS));
  const ids = new Set();
  for (const d of C.INDICATORS) {
    assert.ok(!ids.has(d.id), "معرف مؤشر مكرر: " + d.id);
    ids.add(d.id);
    assert.ok(C.FAMILIES.some((f) => f.id === d.family),
      "عائلة خارج القائمة القانونية في " + d.id);
    assert.ok(["raw", "derived", "definitional", "geo"].indexOf(d.kind) !== -1,
      "نوع أصل غير قانوني في " + d.id);
    assert.ok(d.label && d.short && d.unit, "تسمية أو وحدة ناقصة في " + d.id);
    assert.ok(d.formula, "صيغة ناقصة في " + d.id);
    assert.equal(typeof d.value, "function");
    assert.ok([null, "high", "low"].indexOf(d.better === undefined ? null : d.better) !== -1,
      "اتجاه تحسّن غير قانوني في " + d.id);
  }
  assert.ok(ids.size >= 20, "الكتالوج أصغر من أن يبرر مصفوفة مقارنة");
});

test("المعرّف الملوث لا يكسر البناء — يسقط إلى المؤشر الافتراضي", () => {
  assert.equal(C.safeIndicatorId("<script>"), C.DEFAULT_INDICATOR);
  assert.equal(C.safeIndicatorId(""), C.DEFAULT_INDICATOR);
  assert.equal(C.safeIndicatorId("coverage_pct"), "coverage_pct");
  assert.equal(C.indicator("لا-وجود-له"), null);
});

/* ══════════════════════ 2) لا اختلاق: القيم حرفية ══════════════════════ */

test("القيم الخام مطابقة حرفياً لحقول release.sectors — لا إعادة حساب", () => {
  const pairs = [
    ["demand", "demand"], ["beds", "beds"], ["building", "building"],
    ["operational", "operational"], ["monitors", "monitors"],
    ["visits", "visits"], ["violations", "violations"], ["closures", "closures"],
  ];
  for (const [indId, field] of pairs) {
    const rw = rowOf(indId);
    for (const v of rw.values) {
      const src = rel.sectors.find((s) => s.id === v.sector);
      assert.equal(v.value, src[field],
        "قيمة " + indId + " للقطاع " + v.sector + " لا تطابق الإصدار");
    }
  }
});

test("المشتقات القطاعية مأخوذة من derived.sector لا محسوبة محلياً", () => {
  for (const [indId, field] of [
    ["coverage_pct", "coverage_pct"], ["deficit_beds", "deficit_beds"],
    ["demand_share_pct", "demand_share_pct"],
    ["violations_share_pct", "violations_share_pct"],
    ["visits_share_pct", "visits_share_pct"],
  ]) {
    const rw = rowOf(indId);
    for (const v of rw.values) {
      assert.equal(v.value, der.sector[v.sector][field],
        "المشتق " + indId + " انحرف عن derived.sector في " + v.sector);
    }
  }
});

test("عمود المدينة للمقاييس الخام هو الإجمالي المنشور نصاً وقيمةً", () => {
  const map = {
    demand: "total_demand", beds: "licensed_beds",
    building: "current_building", operational: "current_operational",
    monitors: "total_monitors", visits: "total_visits",
    violations: "total_violations", closures: "total_closures",
  };
  for (const [indId, metricId] of Object.entries(map)) {
    const rw = rowOf(indId);
    assert.equal(rw.city, rel.metrics[metricId].value,
      "قيمة المدينة لـ" + indId + " ليست الإجمالي المنشور");
    assert.equal(rw.cityBasis, "published");
    assert.ok(rw.origin.includes(rel.metrics[metricId].sheet),
      "المرساة لا تحمل اسم الورقة");
    assert.ok(rw.origin.includes(rel.metrics[metricId].anchor),
      "المرساة لا تحمل الخلية");
  }
});

test("الاشتقاق التعريفي يعيد إنتاج مشتق منشور — برهان أنه إعادة تعبير", () => {
  /* حصة الطاقة المشتقة تعريفياً + حصة الطلب المنشورة يجب أن تصفّا القطاع
     ذاته: مجموع كل منهما 100٪ بالضبط على القطاعات الخمسة. */
  const beds = rowOf("beds_share_pct");
  const dem = rowOf("demand_share_pct");
  const sum = (rw) => rw.values.reduce((a, v) => a + (v.value || 0), 0);
  /* حد التقريب: كل حصة مقرّبة لمنزلة واحدة مستقلةً، فمجموعها قد يزيح
     ‎±0.3‎ نقطة عن المئة — الاختبار يقبل الإزاحة ولا يقبل انحرافاً بنيوياً. */
  assert.ok(Math.abs(sum(beds) - 100) <= 0.3, "حصص الطاقة: " + sum(beds));
  assert.ok(Math.abs(sum(dem) - 100) <= 0.3, "حصص الطلب: " + sum(dem));
});

/* ══════════════════════ 3) الترتيب واتجاه التحسّن ══════════════════════ */

test("«الأعلى أفضل» يعطي الرتبة الأولى للأعلى فعلاً", () => {
  const rw = rowOf("coverage_pct");
  assert.equal(rw.better, "high");
  const first = rw.values.find((v) => v.rank === 1);
  assert.equal(first.value, rw.max);
  assert.equal(first.sector, der.rankings.highest_coverage,
    "المتصدر يجب أن يطابق ترتيب الإصدار المنشور");
});

test("«الأدنى أفضل» يقلب الترتيب: الرتبة الأولى لأقل عجز", () => {
  const rw = rowOf("deficit_beds");
  assert.equal(rw.better, "low");
  const first = rw.values.find((v) => v.rank === 1);
  assert.equal(first.value, rw.min);
  const last = rw.values.find((v) => v.rank === rw.counted);
  assert.equal(last.value, rw.max);
  assert.equal(last.sector, "south", "أكبر عجز يجب أن يكون آخر الترتيب");
});

test("أدنى تغطية في الصف يطابق rankings.lowest_coverage المنشور", () => {
  const rw = rowOf("coverage_pct");
  const last = rw.values.find((v) => v.rank === rw.counted);
  assert.equal(last.sector, der.rankings.lowest_coverage);
});

test("التعادل يتقاسم الرتبة تنافسياً (1,2,2,4) ولا يخترع فارقاً", () => {
  const pairs = [
    { sector: "a", value: 10 }, { sector: "b", value: 8 },
    { sector: "c", value: 8 }, { sector: "d", value: 5 },
  ];
  const { ranks, counted } = C.competitionRanks(pairs, "high");
  assert.equal(counted, 4);
  assert.equal(ranks.a, 1);
  assert.equal(ranks.b, 2);
  assert.equal(ranks.c, 2);
  assert.equal(ranks.d, 4);
});

test("القيمة الغائبة لا تُرتَّب إطلاقاً — لا رتبة أخيرة مجانية", () => {
  const { ranks, counted } = C.competitionRanks([
    { sector: "a", value: 3 }, { sector: "b", value: null },
  ], "high");
  assert.equal(counted, 1);
  assert.equal(ranks.a, 1);
  assert.equal(ranks.b, undefined);
});

test("نص الترتيب يسمّي المقياس واتجاهه — لا ترتيب مجهول المرجع", () => {
  for (const d of C.INDICATORS) {
    const rw = rowOf(d.id);
    assert.ok(rw.rankingNote.includes(d.label),
      "نص الترتيب لا يسمّي المقياس في " + d.id);
    assert.ok(rw.rankingNote.includes("القطاعات الخمسة"),
      "نص الترتيب لا يحصر نطاقه في " + d.id);
  }
});

/* ══════════════════════ 4) الحصة والانحراف ══════════════════════ */

test("المؤشرات النسبية لا تُعطى حصة — والسبب مصرَّح به", () => {
  for (const d of C.INDICATORS) {
    if (d.shareable) continue;
    const rw = rowOf(d.id);
    assert.ok(rw.shareNote, "مؤشر بلا حصة يجب أن يحمل سبباً: " + d.id);
    for (const v of rw.values) {
      assert.equal(v.share, null, "حصة مختلقة على مؤشر نسبي: " + d.id);
    }
  }
});

test("حصص المؤشرات الجمعية تجمع إلى 100٪ ضمن حد التقريب", () => {
  for (const d of C.INDICATORS) {
    if (!d.shareable) continue;
    const rw = rowOf(d.id);
    const total = rw.values.reduce((a, v) => a + (v.share || 0), 0);
    assert.ok(Math.abs(total - 100) <= 0.3,
      "مجموع الحصص انحرف في " + d.id + ": " + total);
  }
});

test("الانحراف عن المتوسط يجمع إلى صفر — تعريف المتوسط نفسه", () => {
  const rw = rowOf("visits");
  const total = rw.values.reduce((a, v) => a + (v.deviation || 0), 0);
  assert.ok(Math.abs(total) <= 1, "مجموع الانحرافات ليس صفراً: " + total);
});

/* ══════════════════════ 5) الصدق عند النقص ══════════════════════ */

test("المقام الصفري يعيد null لا صفراً ولا لانهاية", () => {
  assert.equal(C.div(5, 0), null);
  assert.equal(C.pct(5, 0), null);
  const zeroed = mutated((r) => {
    for (const s of r.sectors) s.monitors = 0;
  });
  const zd = RH.data.derive.compute(zeroed);
  const rw = C.row(zeroed, zd, geo, "visits_per_monitor");
  for (const v of rw.values) {
    assert.equal(v.value, null, "قسمة على صفر أنتجت قيمة في " + v.sector);
  }
  assert.equal(rw.city, null);
});

test("غياب طبقة الحدود يُصرَّح به ولا يُقدَّر بديلاً", () => {
  const rw = C.row(rel, der, null, "districts");
  for (const v of rw.values) assert.equal(v.value, null);
  assert.equal(rw.city, null);
  const mx = C.matrix(rel, der, null, { family: "geo" });
  assert.equal(mx.hasGeo, false);
  const prof = C.profile(rel, der, null, "south");
  assert.equal(prof.districtCount, 0);
  assert.ok(prof.honest.some((t) => t.includes("طبقة حدود الأحياء")),
    "غياب الحدود يجب أن يُقال صراحة في بطاقة القطاع");
});

test("قطاع خارج القائمة القانونية لا يولّد بطاقة مختلقة", () => {
  assert.equal(C.profile(rel, der, geo, "atlantis"), null);
  assert.equal(C.profile(rel, der, geo, ""), null);
});

/* ══════════════════════ 6) بوابة مطابقة المجاميع ══════════════════════ */

test("مجموع القطاعات يطابق كل إجمالي منشور — البوابة كلها خضراء", () => {
  const rec = C.reconciliation(rel, der, geo);
  assert.ok(rec.total >= 10, "عدد الفحوص أقل من أن يغطي المقاييس الخام");
  assert.equal(rec.failed, 0, "فحص مطابقة ساقط على الإصدار المعتمد");
  assert.equal(rec.allOk, true);
  for (const r of rec.rows) {
    assert.equal(r.diff, 0, "فرق غير صفري في " + r.id);
    assert.ok(r.origin, "فحص بلا مرساة: " + r.id);
  }
});

test("البوابة تسقط فعلاً عند تلويث الإصدار — ليست زينة", () => {
  const bad = mutated((r) => {
    r.sectors.find((s) => s.id === "west").visits += 500;
  });
  const bd = RH.data.derive.compute(bad);
  const rec = C.reconciliation(bad, bd, geo);
  assert.equal(rec.allOk, false, "تلويث الزيارات لم يُسقط البوابة");
  const visits = rec.rows.find((x) => x.id === "visits");
  assert.equal(visits.ok, false);
  assert.equal(visits.diff, 500);
  assert.equal(rec.failed, 1, "التلويث أسقط أكثر من فحصه");
});

test("فحص الهوية يعيد إنتاج التغطية المنشورة من مجاميع القطاعات", () => {
  const rec = C.reconciliation(rel, der, geo);
  const cov = rec.rows.find((x) => x.id === "coverage_identity");
  assert.ok(cov, "فحص هوية التغطية مفقود");
  assert.equal(cov.summed, der.coverage_pct);
  assert.equal(cov.published, der.coverage_pct);
  assert.equal(cov.kind, "identity");
});

test("فحص هوية العجز يطابق العجز المشتق المنشور", () => {
  const rec = C.reconciliation(rel, der, geo);
  const def = rec.rows.find((x) => x.id === "deficit_identity");
  assert.equal(def.summed, der.deficit_beds);
  assert.equal(def.ok, true);
});

test("عدّاد البوابة محسوب لا مكتوب — يتحرك مع النتيجة", () => {
  const clean = C.reconciliation(rel, der, geo);
  const bad = mutated((r) => { r.sectors[0].closures += 3; });
  const dirty = C.reconciliation(bad, RH.data.derive.compute(bad), geo);
  assert.equal(clean.passed, clean.total);
  assert.equal(dirty.passed, dirty.total - 1);
});

/* ══════════════════════ 7) حدود التفكيك والوسوم ══════════════════════ */

test("حدود التفكيك تحمل وسم منهجية الامتثال حرفياً", () => {
  const lim = C.limits(rel, der);
  const comp = lim.find((x) => x.id === "compliance");
  assert.ok(comp, "الامتثال غائب عن حدود التفكيك");
  assert.equal(comp.badge, rel.compliance.note,
    "وسم المنهجية ليس نص الإصدار حرفياً");
  assert.equal(comp.status, "pending_methodology");
  assert.equal(comp.value, fmt.pct(rel.compliance.value));
});

test("تحفظ السيناريوهات يسافر مع بند السيناريوهات نصاً كاملاً", () => {
  const lim = C.limits(rel, der);
  const sc = lim.find((x) => x.id === "scenarios");
  assert.equal(sc.badge, rel.scenarios.caveat);
  assert.equal(sc.status, "supplied_unvalidated");
});

test("بند غائب من الإصدار لا يُذكر في الحدود — لا قائمة تحذيرات وهمية", () => {
  const stripped = mutated((r) => { delete r.violation_types; });
  const lim = C.limits(stripped, RH.data.derive.compute(stripped));
  assert.ok(!lim.some((x) => x.id === "violation_types"));
  assert.ok(lim.some((x) => x.id === "compliance"), "بقية البنود يجب أن تبقى");
});

test("كل بند حدّ يحمل سبب امتناعه — لا صمت", () => {
  for (const item of C.limits(rel, der)) {
    assert.ok(item.reason && item.reason.length > 8,
      "بند بلا سبب: " + item.id);
    assert.ok(item.label, "بند بلا تسمية: " + item.id);
  }
});

/* ══════════════════════ 8) المصفوفة والترشيح والترتيب ══════════════════ */

test("المصفوفة الكاملة تغطي الكتالوج والقطاعات الخمسة", () => {
  const mx = C.matrix(rel, der, geo, {});
  assert.equal(mx.rows.length, C.INDICATORS.length);
  assert.equal(mx.sectors.length, 5);
  assert.equal(mx.family, "all");
  assert.deepEqual(mx.sectorOrder, Array.from(C.SECTOR_ORDER));
});

test("ترشيح العائلة يحصر الصفوف فيها ولا يُسقط مؤشراً منها", () => {
  for (const f of C.FAMILIES) {
    const mx = C.matrix(rel, der, geo, { family: f.id });
    const expected = C.INDICATORS.filter((d) => d.family === f.id);
    assert.equal(mx.rows.length, expected.length, "عدد صفوف " + f.id);
    for (const rw of mx.rows) assert.equal(rw.family, f.id);
  }
});

test("عائلة غير قانونية تسقط إلى «الكل» بصمت — لا مصفوفة فارغة", () => {
  const mx = C.matrix(rel, der, geo, { family: "لا-وجود-لها" });
  assert.equal(mx.family, "all");
  assert.equal(mx.rows.length, C.INDICATORS.length);
});

test("ترتيب الأعمدة تنازلياً يضع الأعلى أولاً ويحفظ العدد", () => {
  const mx = C.matrix(rel, der, geo, { sortBy: "violations", sortDir: "desc" });
  assert.equal(mx.sectorOrder[0], "south", "أعلى المخالفات يجب أن يتصدر");
  assert.equal(mx.sectorOrder.length, 5);
  const asc = C.matrix(rel, der, geo, { sortBy: "violations", sortDir: "asc" });
  assert.equal(asc.sectorOrder[0], "west", "أدنى المخالفات يجب أن يتصدر تصاعدياً");
  assert.deepEqual(asc.sectorOrder.slice().sort(),
    Array.from(C.SECTOR_ORDER).slice().sort(), "الترتيب أسقط قطاعاً أو كرره");
});

test("الترتيب القانوني هو الافتراضي ولا يتأثر بمؤشر محدد", () => {
  const mx = C.matrix(rel, der, geo, { sortBy: "violations" });
  assert.equal(mx.sortDir, "canonical");
  assert.deepEqual(mx.sectorOrder, Array.from(C.SECTOR_ORDER));
});

/* ══════════════════════ 9) التركّز والتوازن ══════════════════════ */

test("إحصاء التركّز يطابق الصف ذاته ولا يخترع حصة لمؤشر نسبي", () => {
  const conc = C.concentration(rel, der, geo, "violations");
  assert.equal(conc.top.sector, "south");
  assert.equal(conc.top.value, rel.sectors.find((s) => s.id === "south").violations);
  assert.ok(conc.topShare > 0 && conc.topShare < 100);
  const ratio = C.concentration(rel, der, geo, "coverage_pct");
  assert.equal(ratio.topShare, null, "حصة مختلقة لمؤشر نسبي");
  assert.ok(ratio.shareFormula.includes("لا حصة"));
});

test("حصة الأعلى في المخالفات تطابق المشتق المنشور لقطاع الجنوب", () => {
  const conc = C.concentration(rel, der, geo, "violations");
  assert.equal(conc.topShare, der.south_violations_share_pct);
});

test("ميزان الحصص: فجوة الطاقة = حصة الطاقة − حصة الطلب بالنقطة المئوية", () => {
  const bal = C.balance(rel, der, geo);
  assert.equal(bal.rows.length, 5);
  for (const r of bal.rows) {
    assert.equal(r.capacityGap,
      C.round1(r.bedsShare - r.demandShare),
      "فجوة الطاقة لا تطابق تعريفها في " + r.sector);
    assert.equal(r.effortGap, C.round1(r.visitShare - r.violShare));
  }
  const south = bal.rows.find((r) => r.sector === "south");
  assert.ok(south.capacityGap < 0,
    "الجنوب أعلى القطاعات طلباً وأدناها تغطية — فجوته يجب أن تكون سالبة");
});

test("مجموع فجوات الطاقة صفر — كلتا الحصتين تجمعان إلى مئة", () => {
  const bal = C.balance(rel, der, geo);
  const total = bal.rows.reduce((a, r) => a + r.capacityGap, 0);
  assert.ok(Math.abs(total) <= 0.3, "مجموع الفجوات انحرف: " + total);
});

/* ══════════════════════ 10) بطاقة القطاع ══════════════════════ */

test("بطاقة القطاع تجمع كل المؤشرات ورتبها وعينتها", () => {
  const prof = C.profile(rel, der, geo, "east");
  assert.equal(prof.id, "east");
  assert.equal(prof.name, rel.sectors.find((s) => s.id === "east").name);
  assert.equal(prof.figures.length, C.INDICATORS.length);
  assert.equal(prof.ranks.length, C.INDICATORS.length);
  assert.equal(prof.districtCount, geo.sectors.east.length);
  assert.equal(prof.hotspotCount,
    geo.hotspots.filter((x) => x.sector === "east").length);
  for (const row of prof.sample) assert.equal(row.sector, "east");
});

test("وسم العينة يلازم صفوف الأحياء في كل بطاقة قطاع", () => {
  for (const sid of C.SECTOR_ORDER) {
    const prof = C.profile(rel, der, geo, sid);
    assert.equal(prof.sampleLabel, rel.meta.sample_label,
      "وسم العينة مفقود في " + sid);
    assert.equal(prof.sampleNote, rel.neighbourhoods.ranking_note);
  }
});

test("إخلاء الخريطة وإسناد الحدود يلازمان بطاقة القطاع", () => {
  const prof = C.profile(rel, der, geo, "north");
  assert.equal(prof.mapDisclaimer, rel.meta.map_disclaimer);
  assert.equal(prof.mapAttribution, geo.source.boundaries);
  assert.equal(prof.sectorGrouping, geo.source.sector_grouping);
});

test("نقاط التركّز مرتبة تنازلياً بالكثافة وضمن القطاع وحده", () => {
  const prof = C.profile(rel, der, geo, "south");
  assert.ok(prof.hotspots.length > 0);
  for (let i = 1; i < prof.hotspots.length; i++) {
    assert.ok(prof.hotspots[i - 1].density >= prof.hotspots[i].density,
      "ترتيب الكثافة منكسر");
  }
  const all = new Set(geo.hotspots.filter((x) => x.sector === "south")
    .map((x) => x.lat + ":" + x.lng));
  for (const hs of prof.hotspots) {
    assert.ok(all.has(hs.lat + ":" + hs.lng), "نقطة من خارج القطاع تسربت");
  }
});

test("القوة والضعف تُحسبان على المؤشرات ذات الاتجاه المعرَّف فقط", () => {
  for (const sid of C.SECTOR_ORDER) {
    const prof = C.profile(rel, der, geo, sid);
    for (const s of prof.strengths) {
      assert.ok(s.better, "قوة محسوبة على مؤشر بلا اتجاه");
      assert.equal(s.rank, 1);
    }
    for (const w of prof.weaknesses) {
      assert.ok(w.better, "ضعف محسوب على مؤشر بلا اتجاه");
      assert.equal(w.rank, w.of);
    }
  }
});

test("الجنوب يتذيّل التغطية ويتصدّر العجز — الاتساق مع سردية الإصدار", () => {
  const prof = C.profile(rel, der, geo, "south");
  const cov = prof.ranks.find((x) => x.id === "coverage_pct");
  assert.equal(cov.rank, cov.of, "أدنى تغطية يجب أن يكون آخر الترتيب");
  const def = prof.ranks.find((x) => x.id === "deficit_beds");
  assert.equal(def.rank, def.of, "أكبر عجز يجب أن يكون آخر ترتيب «الأدنى أفضل»");
});

/* ══════════════════════ 11) الإسناد والتنسيق ══════════════════════ */

test("صفحة الإسناد تغطي كل مؤشر بصيغته ومرساته ونوعه", () => {
  const rows = C.provenance(rel);
  assert.equal(rows.length, C.INDICATORS.length);
  for (const r of rows) {
    assert.ok(r.formula, "صيغة مفقودة: " + r.id);
    assert.ok(r.origin, "مرساة مفقودة: " + r.id);
    assert.ok(r.kindLabel, "تسمية نوع مفقودة: " + r.id);
    assert.ok(r.kindNote, "شرح نوع مفقود: " + r.id);
    assert.ok(r.betterLabel, "اتجاه تحسّن غير مصرَّح: " + r.id);
    assert.ok(r.familyLabel, "عائلة بلا تسمية: " + r.id);
  }
});

test("كل اشتقاق تعريفي يصرّح بأنه إعادة تعبير لا تقدير", () => {
  assert.ok(C.KIND_NOTES.definitional.includes("إعادة تعبير"));
  assert.ok(C.KIND_NOTES.definitional.includes("لا تقدير")
    || C.KIND_NOTES.definitional.includes("لا تقدير جديد"));
});

test("التنسيق يمر عبر RH.core.fmt حصراً ويعالج الغياب بشرطة", () => {
  assert.equal(C.formatValue("int", null), "—");
  assert.equal(C.formatValue("pct", null), "—");
  assert.equal(C.formatValue("pct", 43.1), fmt.pct(43.1));
  assert.equal(C.formatValue("int", 1420000), fmt.iso(fmt.int(1420000)));
  assert.equal(C.formatValue("dec1", 2.35), fmt.iso(fmt.dec1(2.35)));
});

test("الفروق الموقّعة تحمل إشارتها صراحةً ولا تخلط الاتجاه", () => {
  assert.ok(C.formatDelta("int", 500).includes("+"));
  assert.ok(C.formatDelta("int", -500).includes("−"));
  assert.equal(C.formatDelta("int", null), "—");
  assert.ok(C.formatPoints(-5.1).includes("ن.م"));
  assert.ok(C.formatPoints(5.1).includes("+"));
});

test("نص الرتبة يذكر المرجع دائماً — لا رقم عارٍ", () => {
  assert.equal(C.rankText(1, 5), "الأول من " + fmt.noun(5, "sector"));
  assert.equal(C.rankText(null, 5), "—");
  assert.ok(C.rankText(5, 5).includes("الخامس"));
});

test("تطابق العدد والمعدود في المعدودات المحلية", () => {
  assert.equal(C.localNoun(1, "type"), "نوع واحد");
  assert.equal(C.localNoun(2, "type"), "نوعان");
  /* الفاصل بين العدد والمعدود مسافة غير قاطعة من fmt — لا مسافة عادية */
  assert.equal(C.localNoun(3, "type"), "3" + fmt.NBSP + "أنواع");
  assert.equal(C.localNoun(12, "month"), "12" + fmt.NBSP + "شهراً");
  assert.equal(C.localNoun(37, "district"), "37" + fmt.NBSP + "حياً");
});
