/* ════════════════════════════════════════════════════════════════════════════
   tab-monitoring.test.mjs — نموذج التبويب ٣ «الرقابة»
   (‎RH.presenter.tabModels.monitoring‎ — عقد V3_CONTRACTS §4 و§5 و§7)
   ────────────────────────────────────────────────────────────────────────────
   ما يُثبَت هنا هو ما يمنع الانجراف الذي ترفضه بوابات القبول:

     • **لا اختلاق**: كل رقم في كل مواصفة إبراز صياغةُ ‎fmt‎ لرقم منشور في
       ‎release.json‎ أو مشتقة معتمدة. ومجاميع القطاعات وفئات المخالفات
       تُطابَق بالإجماليات المنشورة (19,651 · 3,617 · 18 · 113) حرفياً.
     • **صدق مستوى الحي**: لا يوجد في المصدر رقم مخالفات لأي حي — فمواصفة
       أي حي تحمل **قيم قطاعه** حصراً، ووسم الصدق يلازمها في ‎note‎.
     • **صدق دلو «أخرى»**: الفئة السادسة فما دونها تُجمَّع في دلو **يُعلن**
       أنه تجميع، ويحمل أسماء ما طُوي فيه وعدّه، ولا يأخذ رتبة، ولا يُخفي
       فرقاً (مجموع الفئات = الإجمالي المنشور بالضبط).
     • **صدق معدل الامتثال**: يُعرض بقيمته المورّدة موسوماً بحالته
       ‎pending_methodology‎ ونصّ تحفّظ الإصدار حرفياً — لا يُقدَّم معتمداً.
     • **صدق نقاط التركّز**: مؤشر الكثافة نسبي بلا وحدة، ووسم الحسم من
       ‎quarantine_resolved.hotspots.resolution‎ يلازم كل مواصفة نقطة.
     • **حد الإبراز 320 حرفاً** (V3_SPEC §5) مُثبَت على **كل** مواصفة يولّدها
       التبويب: 5 أرقام مفتاحية + 6 فئات + 5 قطاعات + 189 حياً + 40 نقطة —
       كلها تمر من ‎RH.highlight.normalize(spec, {strict:true})‎ دون أن ترمي.
     • **حراسة المعاملات**: منظور الخريطة القادم من العنوان يُحصر في القائمة
       القانونية ولا تتسرب قيمة غريبة إلى النموذج.
     • **قوانين الترميز**: حجم الفقاعة متناسب مع **المساحة** (جذر تربيعي)،
       وسلّم ألوان القطاعات يمدّ الرتب على كل الدرجات بلا افتراض عددها.

   الوحدة تُحمَّل بملفها الحقيقي: ‎load-app.mjs‎ يبني RH كاملة (core + derive
   + geoutils + highlight) في سياق vm، ثم يُنفَّذ ملف التبويب بوسم RH ذاته —
   فالنموذج النقي يُعرَّف دون DOM، والتسجيل يتخطى نفسه بغياب ‎RH.tabs‎.
   لم يُعدَّل ‎load-app.mjs‎ (ملف المعمار) ولا أي ملف خارج عقد هذا التبويب.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RH, ROOT, freshRelease, freshGeo, norm } from "./load-app.mjs";

/* تنفيذ ملف التبويب على RH الحقيقية — بلا نسخ منطق ولا محاكاة للوحدة */
const SRC = path.join(ROOT, "src", "js", "presenter", "tabs", "t3-monitoring.js");
new Function("RH", readFileSync(SRC, "utf8"))(RH);

const M = RH.presenter.tabModels.monitoring;
const HL = RH.highlight;
const fmt = RH.core.fmt;

const rel = freshRelease();
const geo = freshGeo();
const der = RH.data.derive.compute(rel);
const index = RH.viz.geoutils.districtIndex(geo, rel, der);

/** محارف العزل الاتجاهي (LRI/PDI) — تلازم كل رقم مختلط في نص عربي */
const LRI = "⁦";
const PDI = "⁩";

const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0);

/** الفاصل بين العدد والمعدود في ‎fmt‎ فراغ غير فاصل — يُكتب صراحةً في الترقّبات */
const NB = " ";

/**
 * «جملة واحدة» (V3_SPEC §5): نقطة ختامية واحدة لا غير — والنقطة العشرية
 * داخل رقم (‎81.6٪‎) ليست فاصل جملة فتُستثنى بحارس «غير متبوعة برقم».
 */
function sentenceStops(s) {
  const out = [];
  const re = /\.(?!\d)/g;
  let m;
  while ((m = re.exec(String(s))) !== null) out.push(m.index);
  return out;
}

/* ══════════════════════ 0) التحميل وشكل الواجهة ══════════════════════ */

test("الوحدة تُعرَّف على RH.presenter.tabModels دون لمس DOM ودون تسجيل تبويب", () => {
  assert.ok(M, "RH.presenter.tabModels.monitoring غير معرَّف");
  for (const fn of ["viewKeyOf", "figures", "violationRows", "aggregateLabel",
    "aggregateDetail", "sectorRows", "rampIndex", "sectorRamp", "hotspotStats",
    "bubbleDiameter", "figureHighlight", "violationHighlight", "sectorHighlight",
    "districtHighlight", "hotspotHighlight", "allHighlightSpecs"]) {
    assert.equal(typeof M[fn], "function", "الدالة الناقصة: " + fn);
  }
  /* قشرة التبويبات غائبة في بيئة الوحدة فلا يجوز أن يكون التسجيل قد وقع */
  assert.equal(RH.tabs, undefined,
    "تسجيل التبويب يجب أن يتخطى نفسه بغياب القشرة");
});

test("ثوابت العقد: ملحق monitoring وصفحاته الخمس ومنظورا الخريطة", () => {
  assert.equal(M.AX.id, "monitoring");
  assert.deepEqual(norm([M.AX.MONTHLY, M.AX.TYPES, M.AX.SECTORS, M.AX.METHOD, M.AX.PROV]),
    ["0", "1", "2", "3", "4"]);
  assert.deepEqual(norm(M.VIEWS), ["bubbles", "heat"]);
  assert.equal(M.TOP_N, 5);
  assert.equal(M.AGG_ID, "other");
  assert.equal(M.PENDING_BADGE, "بانتظار اعتماد المنهجية");
});

test("viewKeyOf يحرس معامل العنوان: كل قيمة خارج القائمة تسقط إلى الفقاعات", () => {
  assert.equal(M.viewKeyOf("bubbles"), "bubbles");
  assert.equal(M.viewKeyOf("heat"), "heat");
  for (const bad of [null, undefined, "", "HEAT", "map", "0", 7, {}, []]) {
    assert.equal(M.viewKeyOf(bad), "bubbles", "قيمة غريبة لم تُحصر: " + String(bad));
  }
});

/* ══════════════════════ 1) الأرقام المفتاحية ══════════════════════ */

test("الأرقام المفتاحية خمسة بترتيب الموجز وبقيم الإصدار حرفياً", () => {
  const f = M.figures(rel);
  assert.deepEqual(norm(f.map((x) => x.key)),
    ["visits", "violations", "monitors", "closures", "compliance"]);
  assert.deepEqual(norm(f.map((x) => x.value)), [19651, 3617, 18, 113, 81.6]);
  assert.equal(f[0].value, rel.metrics.total_visits.value);
  assert.equal(f[1].value, rel.metrics.total_violations.value);
  assert.equal(f[2].value, rel.metrics.total_monitors.value);
  assert.equal(f[3].value, rel.metrics.total_closures.value);
  assert.equal(f[4].value, rel.compliance.value);
});

test("صياغة الأرقام: فاصل آلاف موحد، ونسبة الامتثال معزولة اتجاهياً", () => {
  const f = M.figures(rel);
  assert.equal(f[0].display, "19,651");
  assert.equal(f[1].display, "3,617");
  assert.equal(f[2].display, "18");
  assert.equal(f[3].display, "113");
  assert.equal(f[4].display, LRI + "81.6٪" + PDI);
});

test("النص الدقيق يطابق العدد والمعدود العربي — «18 مراقباً» لا «18 مراقب»", () => {
  const f = M.figures(rel);
  assert.equal(f[0].exact, "19,651" + NB + "زيارة");
  assert.equal(f[1].exact, "3,617" + NB + "مخالفة");
  assert.equal(f[2].exact, "18" + NB + "مراقباً");
  assert.equal(f[3].exact, "113" + NB + "قراراً");
  assert.equal(f[2].exact, fmt.noun(18, "monitor"));
});

test("الوحدات من الإصدار لا من الكود، والتسمية الكاملة المنشورة محفوظة", () => {
  const f = M.figures(rel);
  assert.equal(f[0].unit, rel.metrics.total_visits.unit);
  assert.equal(f[1].unit, rel.metrics.total_violations.unit);
  assert.equal(f[2].unit, rel.metrics.total_monitors.unit);
  assert.equal(f[3].unit, rel.metrics.total_closures.unit);
  assert.equal(f[0].full, rel.metrics.total_visits.label);
  assert.equal(f[4].full, rel.compliance.label);
});

test("معدل الامتثال يحمل وسم «بانتظار اعتماد المنهجية» ولا يأخذ لون بيانات", () => {
  const f = M.figures(rel);
  const comp = f[4];
  assert.equal(rel.compliance.status, "pending_methodology");
  assert.equal(comp.badge, "بانتظار اعتماد المنهجية");
  assert.equal(comp.tone, "pending");
  assert.equal(comp.isPct, true);
  /* المخالفات وحدها تأخذ المرجاني (منظومة المعنى المقفلة) */
  assert.equal(f[1].tone, "deficit");
  assert.equal(f[0].tone, "plain");
  assert.equal(f[3].tone, "plain");
});

test("إصدار بلا معدل امتثال يعرض أربعة أرقام لا رقماً خامساً مختلقاً", () => {
  const bare = freshRelease();
  delete bare.compliance;
  const f = M.figures(bare);
  assert.equal(f.length, 4);
  assert.ok(!f.some((x) => x.key === "compliance"));
});

test("معدل امتثال معتمد المنهجية يسقط الوسم ولا يبقى وسماً جامداً", () => {
  const ok = freshRelease();
  ok.compliance.status = "approved";
  const comp = M.figures(ok).find((x) => x.key === "compliance");
  assert.equal(comp.badge, null);
  assert.equal(comp.tone, "plain");
});

/* ══════════════════════ 2) فئات المخالفات ودلو «أخرى» ══════════════════════ */

test("الصفوف: أعلى خمس فئات تنازلياً ثم دلو تجميع واحد", () => {
  const V = M.violationRows(rel, 5);
  assert.equal(V.top.length, 5);
  assert.equal(V.rows.length, 6);
  for (let i = 1; i < 5; i++) {
    assert.ok(V.rows[i - 1].count >= V.rows[i].count, "الترتيب ليس تنازلياً @" + i);
  }
  assert.deepEqual(norm(V.rows.slice(0, 5).map((r) => r.id)),
    ["overcrowding", "fire-safety", "hygiene", "unlicensed", "electrical"]);
  assert.deepEqual(norm(V.rows.slice(0, 5).map((r) => r.count)),
    [1121, 868, 615, 434, 326]);
});

test("مجموع الفئات يساوي إجمالي المخالفات المنشور بالضبط — لا فرق مبتلع", () => {
  const V = M.violationRows(rel, 5);
  assert.equal(V.total, rel.metrics.total_violations.value);
  assert.equal(V.sum, V.total);
  assert.equal(V.covered, true);
  assert.equal(sum(V.rows, "count"), V.total, "مجموع الصفوف المعروضة ≠ الإجمالي");
});

test("دلو «أخرى» يُعلن أنه تجميع: بلا رتبة، وبأسماء ما طُوي فيه وعدّه", () => {
  const V = M.violationRows(rel, 5);
  const agg = V.rows[5];
  assert.equal(agg.id, "other");
  assert.equal(agg.aggregate, true);
  assert.equal(agg.rank, null, "الدلو أخذ رتبة فنافس الفئات المنفردة");
  assert.equal(agg.count, 253);
  assert.deepEqual(norm(agg.members), ["التهوية والعزل غير المطابق"]);
  assert.equal(agg.name, "أخرى (فئة واحدة)");
  assert.ok(M.aggregateDetail(agg.members).includes("التهوية والعزل غير المطابق"));
});

test("تسمية الدلو تتبع العدد والمعدود ولا تتجمّد على المفرد", () => {
  assert.equal(M.aggregateLabel(1), "أخرى (فئة واحدة)");
  assert.equal(M.aggregateLabel(2), "أخرى (فئتان)");
  assert.equal(M.aggregateLabel(3), "أخرى (3" + NB + "فئات)");
  assert.equal(M.aggregateLabel(12), "أخرى (12" + NB + "فئة)");
});

test("لا دلو أصلاً حين لا يبقى وراء العتبة شيء — لا دلو فارغ مضلل", () => {
  const V = M.violationRows(rel, 6);
  assert.equal(V.rows.length, 6);
  assert.ok(!V.rows.some((r) => r.aggregate), "دلو فارغ ظهر بلا محتوى");
  const V9 = M.violationRows(rel, 9);
  assert.equal(V9.rows.length, 6);
  assert.ok(!V9.rows.some((r) => r.aggregate));
});

test("الحصص من الإجمالي المنشور بتقريب المشروع الموحد ومجموعها ≈ 100", () => {
  const V = M.violationRows(rel, 5);
  for (const r of V.rows) {
    assert.equal(r.share, RH.data.derive.pct(r.count, V.total), "حصة " + r.id);
  }
  const total = V.rows.reduce((a, r) => a + r.share, 0);
  assert.ok(Math.abs(total - 100) <= 0.2, "مجموع الحصص انحرف: " + total);
});

test("كسر التعادل حتمي بترتيب المصدر فلا يتبدّل الرسم بين بناءين", () => {
  const tied = freshRelease();
  tied.violation_types = [
    { id: "a", name: "أ", count: 100 }, { id: "b", name: "ب", count: 100 },
    { id: "c", name: "ج", count: 100 }, { id: "d", name: "د", count: 50 },
    { id: "e", name: "هـ", count: 50 }, { id: "f", name: "و", count: 25 },
  ];
  tied.metrics.total_violations.value = 425;
  const a = M.violationRows(tied, 5).rows.map((r) => r.id);
  const b = M.violationRows(tied, 5).rows.map((r) => r.id);
  assert.deepEqual(norm(a), norm(b));
  assert.deepEqual(norm(a), ["a", "b", "c", "d", "e", "other"]);
});

/* ══════════════════════ 3) القطاعات وسلّم الألوان ══════════════════════ */

test("صفوف القطاعات مرتبة تنازلياً بالمخالفات وترتيبها يطابق المنشور", () => {
  const rows = M.sectorRows(rel, der);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].id, der.rankings.highest_violations);
  assert.equal(rows[0].id, "south");
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].violations >= rows[i].violations, "ترتيب مكسور @" + i);
    assert.equal(rows[i].rank, i + 1);
  }
});

test("حصص القطاعات من المشتقات المنشورة لا من حساب محلي مستقل", () => {
  for (const r of M.sectorRows(rel, der)) {
    assert.equal(r.share, der.sector[r.id].violations_share_pct, "حصة " + r.id);
    assert.equal(r.visitsShare, der.sector[r.id].visits_share_pct, "زيارات " + r.id);
  }
  assert.equal(M.sectorRows(rel, der)[0].share, rel.derived.south_violations_share_pct.value);
});

test("مجاميع القطاعات تطابق الإجماليات المنشورة الأربعة", () => {
  assert.equal(sum(rel.sectors, "violations"), rel.metrics.total_violations.value);
  assert.equal(sum(rel.sectors, "visits"), rel.metrics.total_visits.value);
  assert.equal(sum(rel.sectors, "monitors"), rel.metrics.total_monitors.value);
  assert.equal(sum(rel.sectors, "closures"), rel.metrics.total_closures.value);
  const south = rel.sectors.find((s) => s.id === "south");
  assert.equal(south.violations, rel.metrics.south_violations.value);
});

test("rampIndex يمدّ الرتب على كل الدرجات ويصمد أمام الحالات الحدّية", () => {
  assert.equal(M.rampIndex(0, 5, 5), 0);
  assert.equal(M.rampIndex(4, 5, 5), 4);
  assert.equal(M.rampIndex(2, 5, 5), 2);
  /* رتب أكثر من الدرجات: توزيع متساوٍ بلا تجاوز الطرفين */
  assert.equal(M.rampIndex(0, 9, 5), 0);
  assert.equal(M.rampIndex(8, 9, 5), 4);
  assert.equal(M.rampIndex(4, 9, 5), 2);
  /* حالات حدّية لا ترمي ولا تعيد قيمة خارج المدى */
  assert.equal(M.rampIndex(0, 1, 5), 4);
  assert.equal(M.rampIndex(0, 5, 1), 0);
  assert.equal(M.rampIndex(99, 5, 5), 4);
  assert.equal(M.rampIndex(-3, 5, 5), 0);
});

test("سلّم القطاعات: الأدنى مخالفةً أفتح درجة والأعلى أغمقها", () => {
  const steps = M.sectorRamp(rel, 5);
  assert.equal(steps.west, 0, "الغرب (356) ليس أفتح درجة");
  assert.equal(steps.south, 4, "الجنوب (1,367) ليس أغمق درجة");
  const rows = M.sectorRows(rel, der);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(steps[rows[i - 1].id] >= steps[rows[i].id],
      "درجة أغمق لقطاع أقل مخالفات: " + rows[i].id);
  }
  /* عدد درجات مختلف لا يكسر التوزيع */
  const three = M.sectorRamp(rel, 3);
  assert.equal(three.west, 0);
  assert.equal(three.south, 2);
});

/* ══════════════════════ 4) نقاط التركّز ══════════════════════ */

test("إحصاء نقاط التركّز: أربعون نقطة ومدى مؤشر الكثافة من الطبقة نفسها", () => {
  const st = M.hotspotStats(geo);
  assert.equal(st.count, 40);
  assert.equal(st.count, geo.hotspots.length);
  assert.equal(st.min, Math.min.apply(null, geo.hotspots.map((h) => h.density)));
  assert.equal(st.max, Math.max.apply(null, geo.hotspots.map((h) => h.density)));
  assert.equal(st.top.density, st.max);
});

test("توزيع النقاط على القطاعات يجمع إلى العدد الكلي بلا نقطة يتيمة", () => {
  const st = M.hotspotStats(geo);
  const total = Object.keys(st.bySector).reduce((a, k) => a + st.bySector[k], 0);
  assert.equal(total, st.count);
  for (const id of M.SECTOR_ORDER) {
    assert.equal(typeof st.bySector[id], "number", "قطاع بلا عدّاد: " + id);
  }
});

test("غياب طبقة الجغرافيا يعيد إحصاءً فارغاً صادقاً لا أصفاراً مخترعة", () => {
  const st = M.hotspotStats(null);
  assert.equal(st.count, 0);
  assert.equal(st.min, null);
  assert.equal(st.max, null);
  assert.equal(st.top, null);
});

test("حجم الفقاعة متناسب مع المساحة (جذر تربيعي) لا مع القطر", () => {
  const su = 1;
  const min = 0, max = 100;
  const d0 = M.bubbleDiameter(0, min, max, su);
  const d100 = M.bubbleDiameter(100, min, max, su);
  const d25 = M.bubbleDiameter(25, min, max, su);
  /* عند ربع المدى يقطع القطر **نصف** المسافة بين الطرفين — قانون الجذر */
  assert.ok(Math.abs((d25 - d0) - (d100 - d0) / 2) < 1e-9,
    "التناسب ليس بالمساحة: " + d25);
  assert.ok(d100 > d0);
});

test("حجم الفقاعة رتيب، ومحصور بين الحدّين، ويصمد أمام مدى منهار", () => {
  const st = M.hotspotStats(geo);
  let prev = -Infinity;
  for (let d = st.min; d <= st.max; d++) {
    const v = M.bubbleDiameter(d, st.min, st.max, 1);
    assert.ok(v >= prev, "غير رتيب عند " + d);
    assert.ok(v >= 9 - 1e-9 && v <= 34 + 1e-9, "خارج الحدّين عند " + d);
    prev = v;
  }
  /* قيم خارج المدى تُقصّ ولا تنتج قطراً سالباً أو ضخماً */
  assert.equal(M.bubbleDiameter(-50, st.min, st.max, 1), 9);
  assert.equal(M.bubbleDiameter(9999, st.min, st.max, 1), 34);
  /* مدى منهار (كل النقاط متساوية) → قطر وسطي ثابت لا قسمة على صفر */
  const flat = M.bubbleDiameter(5, 5, 5, 1);
  assert.ok(Number.isFinite(flat) && flat > 0);
  assert.ok(Number.isFinite(M.bubbleDiameter(null, 1, 2, 1)));
});

test("القطر يتدرّج مع وحدة القياس su فلا يتجمّد على مقاس شاشة واحدة", () => {
  const a = M.bubbleDiameter(50, 0, 100, 1);
  const b = M.bubbleDiameter(50, 0, 100, 0.5);
  assert.ok(Math.abs(a / 2 - b) < 1e-9, "لم يتدرّج مع su");
});

/* ══════════════════════ 5) صدق مستوى الحي ══════════════════════ */

test("فهرس الأحياء كامل (189) وكل حي مسنَد إلى صف قطاع معتمد", () => {
  assert.equal(index.length, 189);
  for (const e of index) assert.ok(e.sectorRow, "حي بلا صف قطاع: " + e.name);
});

test("مواصفة الحي: عنوانها اسم الحي وأرقامها **قيم قطاعه** حصراً", () => {
  const sectorViol = new Set(rel.sectors.map((s) => fmt.int(s.violations)));
  const sectorVisits = new Set(rel.sectors.map((s) => fmt.int(s.visits)));
  for (const e of index) {
    const spec = M.districtHighlight(rel, der, e);
    assert.equal(spec.title, e.name);
    assert.ok(sectorViol.has(spec.stats[0].value),
      "رقم ليس قطاعياً في مواصفة حي: " + spec.stats[0].value);
    assert.ok(sectorVisits.has(spec.stats[2].value));
    assert.equal(spec.stats[0].value, fmt.int(e.sectorRow.violations));
    assert.equal(spec.stats[1].value, fmt.pct(der.sector[e.sectorRow.id].violations_share_pct));
  }
});

test("وسم الصدق يعلن غياب بيانات الحي ويحمل تحفّظ الخريطة المنشور", () => {
  const spec = M.districtHighlight(rel, der, index[0]);
  assert.ok(spec.note.includes(rel.meta.map_disclaimer));
  assert.ok(spec.note.includes("لا توجد مخالفات على مستوى الحي"));
  assert.ok(spec.sentence.includes("لا تُنسب قيمة إلى مستوى الحي"));
  assert.equal(spec.appendix.params.page, M.AX.SECTORS);
});

test("مدخل ناقص يعيد null لا كائناً فارغاً مضللاً", () => {
  assert.equal(M.districtHighlight(rel, der, null), null);
  assert.equal(M.districtHighlight(rel, der, { name: "س" }), null);
  assert.equal(M.sectorHighlight(rel, der, "nope"), null);
  assert.equal(M.violationHighlight(rel, "nope"), null);
  assert.equal(M.hotspotHighlight(rel, geo, 999), null);
  assert.equal(M.hotspotHighlight(rel, null, 0), null);
});

/* ══════════════════════ 6) صدق نقاط التركّز في الإبراز ══════════════════════ */

test("مواصفة النقطة: مؤشر نسبي معلن، ووسم الحسم المنشور يلازمها حرفياً", () => {
  const resolution = rel.quarantine_resolved.hotspots.resolution;
  for (let i = 0; i < geo.hotspots.length; i++) {
    const spec = M.hotspotHighlight(rel, geo, i);
    assert.equal(spec.note, resolution, "وسم الحسم غائب عن النقطة " + i);
    assert.ok(spec.sentence.includes("موقع توضيحي"), spec.sentence);
    assert.equal(spec.stats[0].value, fmt.int(geo.hotspots[i].density));
    assert.equal(spec.appendix.params.page, M.AX.PROV);
  }
});

test("عدد نقاط القطاع في المواصفة يطابق الإحصاء لا رقماً مستقلاً", () => {
  const st = M.hotspotStats(geo);
  for (let i = 0; i < geo.hotspots.length; i++) {
    const spec = M.hotspotHighlight(rel, geo, i);
    assert.equal(spec.stats[1].value, fmt.int(st.bySector[geo.hotspots[i].sector]));
  }
});

/* ══════════════════════ 7) بوابة الحد 320 حرفاً (V3_SPEC §5) ══════════════════════ */

test("كل مواصفة يولّدها التبويب تمر بالوضع الصارم دون قصّ ولا إسقاط", () => {
  const specs = M.allHighlightSpecs(rel, der, geo, index);
  /* 5 أرقام مفتاحية + 6 فئات + 5 قطاعات + 189 حياً + 40 نقطة تركّز */
  assert.equal(specs.length, 5 + 6 + 5 + 189 + 40);
  for (const spec of specs) {
    const out = HL.normalize(spec, { strict: true });   /* يرمي عند التجاوز */
    assert.equal(out.truncated, false, "قُصّت: " + spec.title);
    assert.equal(out.dropped, 0, "أُسقط رقم من: " + spec.title);
    assert.ok(out.chars <= HL.MAX_CHARS,
      "تجاوز الحد (" + out.chars + "): " + spec.title);
    assert.ok(out.stats.length <= HL.MAX_STATS, "أرقام زائدة: " + spec.title);
  }
});

test("كل مواصفة: عنوان + جملة واحدة + زر واحد إلى ملحق الرقابة وصفحة معرَّفة", () => {
  const PAGES = new Set(["0", "1", "2", "3", "4"]);
  for (const spec of M.allHighlightSpecs(rel, der, geo, index)) {
    assert.ok(spec.title && spec.title.length > 0, "عنوان فارغ");
    assert.ok(spec.sentence && spec.sentence.length > 0, "جملة فارغة");
    /* «جملة واحدة»: نقطة ختامية واحدة فقط، في آخر النص (والعشرية مستثناة) */
    const stops = sentenceStops(spec.sentence);
    assert.equal(stops.length, 1, "أكثر من جملة: " + spec.sentence);
    assert.equal(stops[0], spec.sentence.length - 1,
      "الجملة لا تنتهي بنقطة: " + spec.sentence);
    assert.equal(spec.appendix.id, "monitoring");
    assert.ok(PAGES.has(spec.appendix.params.page),
      "صفحة ملحق خارج المعرَّف: " + spec.appendix.params.page);
    assert.ok(spec.appendix.label && spec.appendix.label.length > 0);
    assert.ok(spec.stats.length > 0 && spec.stats.length <= 3);
  }
});

test("النغمات دلالية مقفلة: المرجاني (neg) للمخالفات والذهبي لغير المعتمد", () => {
  const ALLOWED = new Set(["pos", "neg", "gold", null, undefined]);
  for (const spec of M.allHighlightSpecs(rel, der, geo, index)) {
    for (const st of spec.stats) {
      assert.ok(ALLOWED.has(st.tone),
        "نغمة خارج المنظومة: " + st.tone + " في " + spec.title);
    }
  }
  const comp = M.figureHighlight(rel, der, "compliance");
  assert.equal(comp.stats[0].tone, "gold", "قيمة غير معتمدة أخذت لون بيانات");
});

test("وسم الصدق (note) خارج حساب الحد فلا يُقصّ ولا يزاحم النص الحرّ", () => {
  const spec = M.figureHighlight(rel, der, "compliance");
  const withNote = HL.measure(spec);
  const withoutNote = HL.measure(Object.assign({}, spec, { note: "" }));
  assert.equal(withNote, withoutNote, "الوسم دخل حساب الحد");
  assert.equal(spec.note, rel.compliance.note, "تحفّظ الامتثال ليس نص الإصدار");
});

test("لا رقم ظاهر بلا صياغة fmt: كل قيمة مساندة تطابق صيغة معتمدة", () => {
  /* ⁨ (FSI) معزل معتمد كـLRI: هو عزل العبارة المختلطة «n من N» */
  const ok = /^[⁦-⁩٠-٩٪0-9,.+−\s؀-ۿ]+$/;
  for (const spec of M.allHighlightSpecs(rel, der, geo, index)) {
    for (const st of spec.stats) {
      assert.ok(ok.test(st.value),
        "قيمة غير منسقة: «" + st.value + "» في " + spec.title);
      /* أي عدد من أربع خانات فأكثر يحمل فاصل الآلاف الموحد */
      const bare = st.value.replace(/[⁦-⁩]/g, "");
      if (/^\d+$/.test(bare)) {
        assert.ok(bare.length <= 3, "رقم كبير بلا فاصل آلاف: " + bare);
      }
    }
  }
});

test("كل نسبة معزولة اتجاهياً بـLRI/PDI فلا تنقلب في سياق عربي", () => {
  for (const spec of M.allHighlightSpecs(rel, der, geo, index)) {
    for (const st of spec.stats) {
      if (st.value.includes("٪")) {
        assert.ok(st.value.startsWith(LRI) && st.value.endsWith(PDI),
          "نسبة بلا عزل اتجاهي: " + st.value);
      }
    }
  }
});

/* ══════════════════════ 8) مضمون الإبراز يطابق المصدر ══════════════════════ */

test("إبراز المخالفات يشير إلى أعلى القطاعات وإلى أعلى الفئات بأرقامهما", () => {
  const spec = M.figureHighlight(rel, der, "violations");
  const V = M.violationRows(rel, 5);
  assert.ok(spec.sentence.includes("3,617"));
  assert.ok(spec.sentence.includes("قطاع الجنوب"));
  assert.equal(spec.stats[0].value, fmt.int(1367));
  assert.equal(spec.stats[1].value, fmt.pct(37.8));
  assert.equal(spec.stats[2].value, fmt.int(V.rows[0].count));
  assert.ok(spec.note.includes(V.rows[0].name), "اسم الفئة الأعلى غائب عن الوسم");
  assert.equal(spec.appendix.params.page, M.AX.TYPES);
});

test("إبراز الزيارات يستعمل المتوسط الشهري المشتق المنشور لا قسمة محلية", () => {
  const spec = M.figureHighlight(rel, der, "visits");
  assert.equal(spec.stats[0].value, fmt.int(der.avg_monthly_visits));
  assert.equal(spec.stats[0].value, fmt.int(rel.derived.avg_monthly_visits.value));
  assert.equal(spec.appendix.params.page, M.AX.MONTHLY);
});

test("إبراز الإغلاق: حصة أعلى القطاعات محسوبة من الإجمالي المنشور", () => {
  const spec = M.figureHighlight(rel, der, "closures");
  assert.equal(spec.stats[0].value, fmt.int(40));
  assert.equal(spec.stats[1].value, fmt.pct(RH.data.derive.pct(40, 113)));
  assert.equal(spec.appendix.params.page, M.AX.SECTORS);
});

test("إبراز الامتثال يقول صراحة إن المنهجية لم تُعتمد ولا يقدّمه معتمداً", () => {
  const spec = M.figureHighlight(rel, der, "compliance");
  assert.equal(spec.title, rel.compliance.label);
  assert.ok(spec.sentence.includes("لم تُعتمد منهجيتها"), spec.sentence);
  assert.ok(spec.sentence.includes(fmt.pct(81.6)));
  assert.equal(spec.appendix.params.page, M.AX.METHOD);
});

test("إبراز فئة منفردة يحمل رتبتها من ستٍّ، والدلو يرفض ادّعاء الرتبة", () => {
  const top = M.violationHighlight(rel, "overcrowding");
  assert.equal(top.title, "الاكتظاظ وتجاوز الطاقة الاستيعابية");
  assert.equal(top.stats[1].value, fmt.ofTotal(1, 6));
  assert.equal(top.stats[0].value, fmt.pct(RH.data.derive.pct(1121, 3617)));

  const agg = M.violationHighlight(rel, "other");
  assert.ok(agg.sentence.includes("ليس فئة منفردة"), agg.sentence);
  assert.equal(agg.stats[2].value, fmt.int(1));
  assert.ok(agg.note.includes("التهوية والعزل غير المطابق"));
});

test("إبراز القطاع يعلن أن التلوين قطاعي ويحمل زر جدول القطاعات", () => {
  const spec = M.sectorHighlight(rel, der, "east");
  assert.equal(spec.title, "قطاع الشرق");
  assert.equal(spec.stats[0].value, fmt.int(907));
  assert.equal(spec.stats[1].value, fmt.pct(der.sector.east.violations_share_pct));
  assert.equal(spec.stats[2].value, fmt.int(4716));
  assert.equal(spec.appendix.params.page, M.AX.SECTORS);
  /* عنوان بديل (اسم الحي) لا يغيّر مصدر الأرقام */
  const asDistrict = M.sectorHighlight(rel, der, "east", "حي الملقا");
  assert.equal(asDistrict.title, "حي الملقا");
  assert.equal(asDistrict.stats[0].value, spec.stats[0].value);
});

/* ══════════════════════ 9) ثبات النموذج ══════════════════════ */

test("النموذج نقي: نداءان متتاليان يعطيان النتيجة ذاتها ولا يعدّلان الإصدار", () => {
  const before = JSON.stringify(rel);
  const a = JSON.stringify(norm(M.violationRows(rel, 5).rows));
  const b = JSON.stringify(norm(M.violationRows(rel, 5).rows));
  assert.equal(a, b);
  const s1 = JSON.stringify(norm(M.sectorRows(rel, der)));
  const s2 = JSON.stringify(norm(M.sectorRows(rel, der)));
  assert.equal(s1, s2);
  assert.equal(JSON.stringify(rel), before, "النموذج عدّل كائن الإصدار");
});
