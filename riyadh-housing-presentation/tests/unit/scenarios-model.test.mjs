/* scenarios-model.test.mjs — نموذج مستكشف السيناريوهات RH.explore.scenarios
   ─────────────────────────────────────────────────────────────────────────
   عقد التوسعة §4. ما يُثبَت هنا هو ما يمنع الانجراف الذي يرفضه المدقق:

     • **لا اختلاق**: كل عجز معروض هو رقم `release.scenarios.rows` حرفياً،
       ولا مفتاح رابع يتسرب إلى النموذج.
     • **الترجمة تعريفية لا تنبؤية**: تطبيق `coverageFromDeficit` على العجز
       المشتق المنشور يعيد إنتاج `derived.coverage_pct` المنشورة حرفياً —
       وهو البرهان أنها إعادة تعبير لا تقدير جديد.
     • **التحفظ يلازم القيم**: كل نموذج شهر يحمل نص التحفظ وحالته.
     • **لا استيفاء**: حصر الفهارس يقف عند حدود الأشهر المورّدة، ولا نموذج
       لشهر خارجها.
     • **الصدق عند النقص**: مدخلات غير صالحة تعطي null لا صفراً مختلقاً.
     • **متطلبات الاعتماد من نص التحفظ نفسه**: كل عنصر سلسلة فرعية حرفية.

   الوحدة تُحمَّل بملفها الحقيقي: `load-app.mjs` يبني RH كاملة (core + derive
   + micro) في سياق vm، ثم يُنفَّذ ملف الملحق بوسم RH ذاته — فالنموذج النقي
   يُعرَّف دون DOM، وتسجيل الملحق يتخطى نفسه بغياب `RH.presenter.ax` (وهو
   بالضبط ما يوجبه عقد قابلية الاختبار §0). لم يُعدَّل `load-app.mjs`
   (ملف المعمار) ولا أي ملف خارج عقد هذه الميزة. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RH, ROOT, freshRelease } from "./load-app.mjs";

/* تنفيذ ملف الميزة على RH الحقيقية — بلا نسخ منطق ولا محاكاة للوحدة */
const SRC = path.join(ROOT, "src", "js", "presenter", "appendix", "ax-scenarios.js");
new Function("RH", readFileSync(SRC, "utf8"))(RH);

const S = RH.explore.scenarios;
const fmt = RH.core.fmt;
const rel = freshRelease();

/** مشتقات الإصدار كما يحسبها المحرك (مرآة ما يمرره المتجر وقت التشغيل) */
const der = RH.data.derive.compute(rel);

/** نسخة معدّلة معزولة — لا اختبار يلوث إصدار اختبار آخر */
function mutated(fn) {
  const copy = freshRelease();
  fn(copy);
  return copy;
}

/* ══════════════════ تحميل الوحدة وشكل الواجهة ══════════════════ */

test("الوحدة تُعرَّف على RH.explore دون لمس DOM ودون تسجيل ملحق في بيئة الاختبار", () => {
  assert.ok(S, "RH.explore.scenarios غير معرَّف");
  assert.equal(typeof S.coverageFromDeficit, "function");
  assert.equal(typeof S.monthModel, "function");
  /* ax-shell غائب في بيئة الوحدة فلا يجوز أن يكون التسجيل قد وقع */
  assert.equal(RH.presenter.ax, undefined,
    "تسجيل الملحق يجب أن يتخطى نفسه بغياب الهيكل");
});

test("ترتيب السيناريوهات مقفل على ثلاثة مفاتيح — لا رابع", () => {
  assert.deepEqual(S.SCENARIO_KEYS, ["conservative", "base", "optimistic"]);
  assert.equal(S.SCENARIO_DEFS.length, 3);
  assert.deepEqual(S.SCENARIO_DEFS.map((d) => d.rank), [1, 2, 3]);
  assert.equal(S.defOf("base").label, "الأساسي");
  assert.equal(S.defOf("wild"), null, "مفتاح غريب لا يُعرَّف");
});

/* ══════════════════ الترجمة التعريفية ══════════════════ */

test("coverageFromDeficit على العجز المنشور يعيد إنتاج نسبة التغطية المنشورة", () => {
  const demand = rel.metrics.total_demand.value;
  const deficit = rel.derived.deficit_beds.value;
  assert.equal(S.coverageFromDeficit(deficit, demand), rel.derived.coverage_pct.value);
  /* ومن المشتقة الحية أيضاً (مرآة محرك الاشتقاق) */
  assert.equal(S.coverageFromDeficit(der.deficit_beds, demand), der.coverage_pct);
});

test("coverageFromDeficit يطبق تقريب نصف-لأعلى بمنزلة واحدة", () => {
  /* 1,000,000 طلب و 555,550 عجز ← 44.445٪ → 44.4 بمنزلة واحدة */
  assert.equal(S.coverageFromDeficit(555550, 1000000), 44.4);
  assert.equal(S.coverageFromDeficit(0, 1000), 100);
  assert.equal(S.coverageFromDeficit(1000, 1000), 0);
});

test("مدخلات غير صالحة تعطي null صادقة لا صفراً مختلقاً", () => {
  assert.equal(S.coverageFromDeficit(null, 1420000), null);
  assert.equal(S.coverageFromDeficit(100, 0), null);
  assert.equal(S.coverageFromDeficit(100, -5), null);
  assert.equal(S.coverageFromDeficit(NaN, 1420000), null);
  assert.equal(S.coverageFromDeficit("807600", 1420000), null,
    "السلسلة ليست رقماً — لا تحويل ضمني صامت");
  assert.equal(S.capacityEquivalent(null, 1420000), null);
});

test("التغطية تُقصّ داخل [0,100] فلا تغطية سالبة ولا فوق الكاملة", () => {
  assert.equal(S.coverageFromDeficit(2000000, 1420000), 0);
  assert.equal(S.coverageFromDeficit(-50000, 1420000), 100);
  assert.equal(S.capacityEquivalent(2000000, 1420000), 0);
});

test("الطاقة المكافئة ومعكوساتها متسقة مع الترجمة", () => {
  const demand = rel.metrics.total_demand.value;
  const deficit = rel.derived.deficit_beds.value;
  assert.equal(S.capacityEquivalent(deficit, demand), demand - deficit);
  assert.equal(S.capacityEquivalent(deficit, demand), rel.metrics.licensed_beds.value);
  /* المعكوس: أسرّة نسبةِ التغطية المنشورة ≈ الطاقة المرخصة (فارق التقريب) */
  const beds = S.bedsForCoverage(rel.derived.coverage_pct.value, demand);
  assert.ok(Math.abs(beds - rel.metrics.licensed_beds.value) < 1500,
    "المعكوس يقع ضمن حدود تقريب المنزلة الواحدة");
  assert.equal(S.deficitForCoverage(100, demand), 0);
  assert.equal(S.bedsForCoverage(null, demand), null);
});

/* ══════════════════ نموذج الشهر ══════════════════ */

test("monthModel يعيد القيم المورّدة حرفياً بلا أي مساس", () => {
  const rows = rel.scenarios.rows;
  for (let i = 0; i < rows.length; i++) {
    const m = S.monthModel(rel, i);
    assert.equal(m.iso, rows[i].iso);
    assert.equal(m.label, rows[i].label);
    assert.equal(m.rows.length, 3);
    assert.equal(m.rows[0].deficit, rows[i].conservative);
    assert.equal(m.rows[1].deficit, rows[i].base);
    assert.equal(m.rows[2].deficit, rows[i].optimistic);
  }
});

test("monthModel: الفوارق عن الأساسي بالسرير وبنقاط التغطية", () => {
  const m = S.monthModel(rel, 0);
  const r = rel.scenarios.rows[0];
  assert.equal(m.rows[1].dBase, 0, "الأساسي أساس نفسه");
  assert.equal(m.rows[0].dBase, r.conservative - r.base);
  assert.equal(m.rows[2].dBase, r.optimistic - r.base);
  /* المتحفظ أسوأ: عجز أكبر ⇒ تغطية أقل ⇒ نقاط سالبة، والمتفائل عكسه */
  assert.ok(m.rows[0].dCoveragePts < 0, "المتحفظ يخسر نقاط تغطية");
  assert.equal(m.rows[1].dCoveragePts, 0);
  assert.ok(m.rows[2].dCoveragePts > 0, "المتفائل يكسب نقاط تغطية");
});

test("فارق نقاط التغطية محسوب على القيمتين المعروضتين (لا انجراف عن العين)", () => {
  const m = S.monthModel(rel, 4);
  for (const row of m.rows) {
    const expected = RH.data.derive.roundHalfUp(
      row.coveragePct - m.baseCoverage, 1);
    assert.equal(row.dCoveragePts, expected);
  }
});

test("monthModel: الانتشار = المتحفظ − المتفائل، والمدى بنقاط التغطية", () => {
  const rows = rel.scenarios.rows;
  for (let i = 0; i < rows.length; i++) {
    const m = S.monthModel(rel, i);
    assert.equal(m.spread, rows[i].conservative - rows[i].optimistic);
    assert.equal(m.coverageMax, m.rows[2].coveragePct);
    assert.equal(m.coverageMin, m.rows[0].coveragePct);
    assert.equal(m.spreadCoveragePts,
      RH.data.derive.roundHalfUp(m.coverageMax - m.coverageMin, 1));
  }
});

test("التحفظ وحالة الاعتماد يلازمان كل نموذج شهر", () => {
  for (let i = 0; i < rel.scenarios.rows.length; i++) {
    const m = S.monthModel(rel, i);
    assert.equal(m.caveat, rel.scenarios.caveat);
    assert.equal(m.status, "supplied_unvalidated");
    assert.equal(m.statusLabel, "سيناريوهات مورّدة — غير معتمدة");
    assert.ok(m.caveat.length > 40, "التحفظ يُمرَّر كاملاً لا مقتطعاً");
  }
});

test("الطاقة المكافئة داخل النموذج = الطلب − العجز لكل سيناريو", () => {
  const m = S.monthModel(rel, 9);
  for (const row of m.rows) {
    assert.equal(row.capacityEquiv, m.demand - row.deficit);
    assert.equal(row.uncoveredPct,
      RH.data.derive.roundHalfUp(100 - row.coveragePct, 1));
  }
});

/* ══════════════════ حصر الفهارس — لا استيفاء ولا مدّ ══════════════════ */

test("clampIndex يحصر داخل الأشهر المورّدة ويتسامح مع المدخل النصي", () => {
  const n = S.monthCount(rel);
  assert.equal(n, rel.scenarios.rows.length);
  assert.equal(S.clampIndex(rel, -7), 0);
  assert.equal(S.clampIndex(rel, 0), 0);
  assert.equal(S.clampIndex(rel, n - 1), n - 1);
  assert.equal(S.clampIndex(rel, n + 40), n - 1);
  assert.equal(S.clampIndex(rel, "3"), 3);
  assert.equal(S.clampIndex(rel, "غير رقم"), 0);
  assert.equal(S.clampIndex(rel, null), 0);
  assert.equal(S.clampIndex(rel, 2.9), 2, "الكسر يُبتر — لا شهر بين شهرين");
});

test("monthModel خارج المدى يقف عند الطرف ولا يخترع شهراً", () => {
  const n = S.monthCount(rel);
  const beyond = S.monthModel(rel, 999);
  assert.equal(beyond.iso, rel.scenarios.rows[n - 1].iso);
  const before = S.monthModel(rel, -3);
  assert.equal(before.iso, rel.scenarios.rows[0].iso);
});

test("monthIndexByIso يطابق المعرفات المورّدة ويرفض غيرها", () => {
  assert.equal(S.monthIndexByIso(rel, "2026-09"), 0);
  assert.equal(S.monthIndexByIso(rel, "2026-12"), 3);
  assert.equal(S.monthIndexByIso(rel, "2027-06"), rel.scenarios.rows.length - 1);
  assert.equal(S.monthIndexByIso(rel, "2027-07"), -1, "شهر خارج الأفق غير موجود");
  assert.equal(S.monthIndexByIso(rel, ""), -1);
});

test("إصدار بلا سيناريوهات: نماذج فارغة صادقة لا انهيار ولا قيم بديلة", () => {
  const empty = mutated((r) => { delete r.scenarios; });
  assert.equal(S.monthModel(empty, 0), null);
  assert.equal(S.monthCount(empty), 0);
  assert.deepEqual(S.rowsOf(empty), []);
  assert.equal(S.honestyModel(empty), null);
  assert.equal(S.horizonModel(empty, {}), null);
  const noRows = mutated((r) => { r.scenarios.rows = []; });
  assert.equal(S.monthModel(noRows, 0), null);
  assert.equal(S.clampIndex(noRows, 5), 0);
});

/* ══════════════════ السلاسل والوتيرة ══════════════════ */

test("seriesModel يرسم الأشهر المورّدة فقط بترتيبها", () => {
  const s = S.seriesModel(rel);
  assert.equal(s.count, rel.scenarios.rows.length);
  assert.deepEqual(s.months.map((m) => m.iso), rel.scenarios.rows.map((r) => r.iso));
  for (const key of S.SCENARIO_KEYS) {
    assert.deepEqual(s.byKey[key].values, rel.scenarios.rows.map((r) => r[key]));
    assert.equal(s.byKey[key].values.length, s.count,
      "طول السلسلة = عدد الأشهر المورّدة — لا نقطة زائدة");
  }
  assert.equal(s.byKey.base.first, rel.scenarios.rows[0].base);
  assert.equal(s.byKey.base.last,
    rel.scenarios.rows[rel.scenarios.rows.length - 1].base);
  assert.equal(s.byKey.base.rise, s.byKey.base.last - s.byKey.base.first);
});

test("سلسلة التغطية مشتقة من السلسلة ذاتها لا من مصدر آخر", () => {
  const s = S.seriesModel(rel);
  const demand = rel.metrics.total_demand.value;
  s.byKey.optimistic.values.forEach((v, i) => {
    assert.equal(s.byKey.optimistic.coverage[i],
      S.coverageFromDeficit(v, demand));
  });
});

test("spreadSeries: الانتشار يتسع عبر الأفق المورّد", () => {
  const sp = S.spreadSeries(rel);
  assert.equal(sp.length, rel.scenarios.rows.length);
  sp.forEach((r, i) => {
    const row = rel.scenarios.rows[i];
    assert.equal(r.spread, row.conservative - row.optimistic);
  });
  assert.ok(sp[sp.length - 1].spread > sp[0].spread);
});

test("steps: الخطوة الأولى تُقاس من المرساة حين تُمرَّر، ومن الفراغ حين تغيب", () => {
  const anchor = der.deficit_beds;
  const withAnchor = S.steps(rel, "base", anchor);
  assert.equal(withAnchor[0].fromAnchor, true);
  assert.equal(withAnchor[0].delta, rel.scenarios.rows[0].base - anchor);
  const without = S.steps(rel, "base");
  assert.equal(without[0].fromAnchor, false);
  assert.equal(without[0].delta, null, "بلا مرساة لا خطوة أولى مختلقة");
  /* الخطوات اللاحقة فوارق مباشرة بين شهرين متتاليين */
  for (let i = 1; i < withAnchor.length; i++) {
    assert.equal(withAnchor[i].delta,
      rel.scenarios.rows[i].base - rel.scenarios.rows[i - 1].base);
  }
  assert.deepEqual(S.steps(rel, "wild", anchor), [], "مفتاح غريب لا خطوات له");
});

test("paceModel: مجموع الخطوات = الفارق الكلي عن المرساة", () => {
  const anchor = der.deficit_beds;
  const p = S.paceModel(rel, "conservative", anchor);
  const sum = p.steps.reduce((a, s) => a + s.delta, 0);
  assert.equal(sum, p.total);
  assert.equal(p.total,
    rel.scenarios.rows[rel.scenarios.rows.length - 1].conservative - anchor);
  assert.equal(p.avgMonthly, Math.round(p.total / p.steps.length));
  /* أكبر خطوة هي الأولى لأنها وحدها تُقاس من عجز اليوم */
  assert.equal(p.maxStep.fromAnchor, true);
});

test("horizonModel يجمع الوتيرة ومقارنة طرفَي الأفق", () => {
  const hz = S.horizonModel(rel, der);
  assert.equal(hz.count, rel.scenarios.rows.length);
  assert.equal(hz.anchorDeficit, der.deficit_beds);
  assert.equal(hz.paces.length, 3);
  assert.equal(hz.compare.rows.length, 3);
  const first = rel.scenarios.rows[0];
  const last = rel.scenarios.rows[rel.scenarios.rows.length - 1];
  assert.equal(hz.compare.rows[1].dDeficit, last.base - first.base);
  assert.ok(hz.compare.rows[1].dCoveragePts < 0,
    "اتساع العجز عبر الأفق يعني خسارة نقاط تغطية");
});

test("compareMonths فارق مباشر بين شهرين مورّدين لا معدل مستنبط", () => {
  const c = S.compareMonths(rel, 2, 5);
  assert.equal(c.from.iso, rel.scenarios.rows[2].iso);
  assert.equal(c.to.iso, rel.scenarios.rows[5].iso);
  assert.equal(c.rows[0].dDeficit,
    rel.scenarios.rows[5].conservative - rel.scenarios.rows[2].conservative);
});

test("coverageBand مدى التغطية داخل الشهر الواحد", () => {
  const b = S.coverageBand(rel, 0);
  const m = S.monthModel(rel, 0);
  assert.equal(b.min, m.coverageMin);
  assert.equal(b.max, m.coverageMax);
  assert.equal(b.label, m.label);
});

test("capacityGapModel يقارن الطاقة المكافئة بالمرخصة اليوم", () => {
  const g = S.capacityGapModel(rel, 0, der);
  assert.equal(g.licensed, rel.metrics.licensed_beds.value);
  assert.equal(g.coverageToday, der.coverage_pct);
  for (const r of g.rows) {
    assert.equal(r.vsLicensed, r.capacityEquiv - g.licensed);
    assert.equal(r.vsCoverageToday,
      RH.data.derive.roundHalfUp(r.coveragePct - g.coverageToday, 1));
    assert.ok(r.vsLicensed < 0,
      "كل السيناريوهات المورّدة تقع فوق عجز اليوم فطاقتها المكافئة أدنى");
  }
});

/* ══════════════════ لوحة الصدق ══════════════════ */

test("متطلبات الاعتماد كلها سلاسل فرعية حرفية من نص التحفظ", () => {
  const reqs = S.requirementsFromCaveat(rel.scenarios.caveat);
  assert.ok(reqs.length >= 3, "المتطلبات المنصوصة الأربعة يجب أن تُلتقط");
  for (const r of reqs) {
    assert.ok(rel.scenarios.caveat.indexOf(r) >= 0,
      "المتطلب «" + r + "» ليس نصاً حرفياً من التحفظ");
  }
  /* بترتيب ورودها في النص لا بترتيب قائمة المفردات */
  const positions = reqs.map((r) => rel.scenarios.caveat.indexOf(r));
  const sorted = positions.slice().sort((a, b) => a - b);
  assert.deepEqual(positions, sorted);
});

test("غياب مرساة «تُعتمد بعد» لا يخترع متطلبات", () => {
  assert.deepEqual(S.requirementsFromCaveat("نص بلا شروط اعتماد."), []);
  assert.deepEqual(S.requirementsFromCaveat(""), []);
  assert.deepEqual(S.requirementsFromCaveat(null), []);
  assert.equal(S.requirementsClause("نص بلا شروط"), "");
});

test("جملة غير معروفة المفردات تُعاد كما هي عنصراً واحداً", () => {
  const out = S.requirementsFromCaveat("قيمة مورّدة؛ تُعتمد بعد مراجعة الجهة المالكة.");
  assert.equal(out.length, 1);
  assert.equal(out[0], "مراجعة الجهة المالكة");
});

test("honestyModel ينقل التحفظ والحالة والأفق دون تأليف", () => {
  const hm = S.honestyModel(rel);
  assert.equal(hm.caveat, rel.scenarios.caveat);
  assert.equal(hm.status, rel.scenarios.status);
  assert.equal(hm.title, rel.scenarios.title);
  assert.equal(hm.unit, rel.scenarios.unit);
  assert.equal(hm.scenarioCount, 3);
  assert.equal(hm.horizon.count, rel.scenarios.rows.length);
  assert.equal(hm.horizon.firstLabel, rel.scenarios.rows[0].label);
  assert.equal(hm.horizon.lastIso,
    rel.scenarios.rows[rel.scenarios.rows.length - 1].iso);
});

test("statusLabel: مفردات مقفلة وحالة مجهولة تُعرض بمعرفها الخام", () => {
  assert.equal(S.statusLabel("supplied_unvalidated"), "سيناريوهات مورّدة — غير معتمدة");
  assert.equal(S.statusLabel("pending_methodology"), "قيمة مورّدة — بانتظار اعتماد المنهجية");
  assert.equal(S.statusLabel("brand_new_state"), "brand_new_state",
    "لا تجميل لحالة مجهولة");
  assert.equal(S.statusLabel(null), "—");
});

/* ══════════════════ فحوص الاتساق ══════════════════ */

test("validateSupplied يجتاز كل فحوصه على الإصدار المنشور", () => {
  const checks = S.validateSupplied(rel);
  assert.ok(checks.length >= 9);
  const failed = checks.filter((c) => !c.ok);
  assert.deepEqual(failed.map((c) => c.id), [],
    "الإصدار المنشور يجب أن يجتاز فحوص المستكشف كلها");
  for (const c of checks) {
    assert.equal(typeof c.label, "string");
    assert.ok(c.label.length > 0);
  }
});

test("validateSupplied يكشف خرق الترتيب ولا يخفيه", () => {
  const bad = mutated((r) => { r.scenarios.rows[2].base = r.scenarios.rows[2].conservative + 1; });
  const checks = S.validateSupplied(bad);
  const ordering = checks.filter((c) => c.id === "ordering")[0];
  assert.equal(ordering.ok, false);
});

test("validateSupplied يكشف مفتاح سيناريو رابع دخيلاً", () => {
  const bad = mutated((r) => { r.scenarios.rows[0].extreme = 1; });
  const checks = S.validateSupplied(bad);
  assert.equal(checks.filter((c) => c.id === "no_fourth")[0].ok, false);
  /* ومع ذلك لا يتسرب المفتاح إلى النموذج المعروض */
  const m = S.monthModel(bad, 0);
  assert.deepEqual(m.rows.map((x) => x.key), S.SCENARIO_KEYS);
});

test("validateSupplied يكشف انحدار سلسلة وحالة اعتماد مجهولة", () => {
  const dip = mutated((r) => { r.scenarios.rows[5].base = 1; });
  assert.equal(S.validateSupplied(dip).filter((c) => c.id === "monotonic")[0].ok, false);
  const unknown = mutated((r) => { r.scenarios.status = "whatever"; });
  assert.equal(S.validateSupplied(unknown).filter((c) => c.id === "status_known")[0].ok,
    false);
});

/* ══════════════════ الصيغ والأصل ══════════════════ */

test("formulaCatalogue يعلن الصيغ الخمس بمقامها الحقيقي منسقاً", () => {
  const cat = S.formulaCatalogue(rel);
  assert.equal(cat.length, 5);
  const cov = cat.filter((f) => f.id === "coverage")[0];
  assert.ok(cov.applied.indexOf(fmt.int(rel.metrics.total_demand.value)) >= 0,
    "المقام يظهر منسقاً داخل الصيغة المطبَّقة");
  for (const f of cat) {
    assert.ok(f.label && f.expr && f.applied && f.note);
  }
  /* التعبير الرمزي بمعرفات لاتينية خالصة كي يُعرض في صندوق LTR سليم
     الاتجاه — الشرح العربي يسكن note لا داخل التعبير (خطأ ثنائي الاتجاه) */
  for (const f of cat) {
    assert.ok(!/[؀-ۿ]/.test(f.expr),
      "التعبير «" + f.expr + "» يجب أن يخلو من العربية");
  }
});

test("translationRows تحمل صيغة كل قيمة معروضة كاملة", () => {
  const rows = S.translationRows(rel, 3);
  const m = S.monthModel(rel, 3);
  assert.equal(rows.length, 3);
  rows.forEach((r, i) => {
    assert.equal(r.deficit, m.rows[i].deficit);
    assert.equal(r.coveragePct, m.rows[i].coveragePct);
    assert.ok(r.coverageFormula.indexOf(fmt.int(r.deficit)) >= 0);
    assert.ok(r.coverageFormula.indexOf(fmt.int(m.demand)) >= 0);
    assert.ok(r.capacityFormula.indexOf(fmt.int(r.deficit)) >= 0);
  });
});

test("provenanceModel يسمّي ورقة كل خام وصيغة كل مشتق وحالة المورّد", () => {
  const prov = S.provenanceModel(rel, der);
  const byId = Object.create(null);
  for (const r of prov) byId[r.id] = r;
  assert.ok(byId.total_demand.origin.indexOf(rel.metrics.total_demand.sheet) >= 0);
  assert.ok(byId.total_demand.origin.indexOf(rel.metrics.total_demand.anchor) >= 0);
  assert.equal(byId.total_demand.kind, "raw");
  assert.ok(byId.deficit_beds.origin.indexOf(rel.derived.deficit_beds.formula) >= 0);
  assert.equal(byId.deficit_beds.kind, "derived");
  assert.equal(byId.deficit_beds.value, der.deficit_beds);
  assert.equal(byId.scenarios.kind, "supplied");
  assert.ok(byId.scenarios.origin.indexOf("supplied_unvalidated") >= 0);
  assert.equal(byId.scenarios.value, rel.scenarios.rows.length);
});

test("anchorModel مرساة منشورة لا محسوبة، وبرهانها الذاتي متطابق", () => {
  const a = S.anchorModel(rel, der);
  assert.equal(a.demand, rel.metrics.total_demand.value);
  assert.equal(a.capacity, rel.metrics.licensed_beds.value);
  assert.equal(a.deficit, der.deficit_beds);
  assert.equal(a.coverage, der.coverage_pct);
  assert.equal(a.coverageFromDeficit, a.coverage,
    "الترجمة التعريفية تعيد إنتاج المشتقة المنشورة");
  assert.equal(a.deficitFormula, rel.derived.deficit_beds.formula);
  assert.equal(a.asOf, rel.meta.data_as_of);
});

test("indicativeTarget ينقل حالة المؤشر الاسترشادي ونصه دون ترقية", () => {
  const t = S.indicativeTarget(rel);
  assert.equal(t.value, rel.coverage_target_indicative.value);
  assert.equal(t.status, "indicative_not_approved");
  assert.equal(t.statusLabel, "قيمة استرشادية — غير معتمدة");
  assert.equal(t.note, rel.coverage_target_indicative.note);
  const without = mutated((r) => { delete r.coverage_target_indicative; });
  assert.equal(S.indicativeTarget(without), null);
});

/* ══════════════════ الصياغة النصية ══════════════════ */

test("describeMonth يصوغ الأرقام عبر fmt ويذكر حالة الاعتماد", () => {
  const text = S.describeMonth(rel, 0);
  const row = rel.scenarios.rows[0];
  assert.ok(text.indexOf(row.label) >= 0);
  assert.ok(text.indexOf(fmt.int(row.conservative)) >= 0);
  assert.ok(text.indexOf(fmt.int(row.base)) >= 0);
  assert.ok(text.indexOf(fmt.int(row.optimistic)) >= 0);
  assert.ok(text.indexOf("سيناريوهات مورّدة — غير معتمدة") >= 0,
    "وسم الحالة يسافر مع الأرقام في النص المنطوق");
  assert.ok(/[٠-٩]/.test(text) === false, "نظام أرقام واحد: لاتيني حصراً");
});

test("describeMonth على إصدار بلا سيناريوهات يقول ذلك صراحة", () => {
  const empty = mutated((r) => { delete r.scenarios; });
  assert.equal(S.describeMonth(empty, 0),
    "لا توجد سيناريوهات مورّدة في هذا الإصدار.");
});

test("describeTranslation يعرض السلسلة الحسابية كاملة للسيناريو المطلوب", () => {
  const text = S.describeTranslation(rel, 0, "base");
  const row = rel.scenarios.rows[0];
  assert.ok(text.indexOf(fmt.int(row.base)) >= 0);
  assert.ok(text.indexOf(fmt.int(rel.metrics.total_demand.value)) >= 0);
  assert.ok(text.indexOf(fmt.pct(S.coverageFromDeficit(
    row.base, rel.metrics.total_demand.value))) >= 0);
  assert.equal(S.describeTranslation(rel, 0, "wild"), "",
    "مفتاح غريب لا يولّد جملة");
});
