/* ════════════════════════════════════════════════════════════════════════════
   tab-kpis.test.mjs — بوابات القبول للتبويب ٥ «مؤشرات الأداء»
   (‎RH.presenter.tabModels.kpis‎ — عقد V3_CONTRACTS §4 و§5 و§7 و§7-أ)
   ────────────────────────────────────────────────────────────────────────────
   يُنفَّذ الملف الحقيقي ‎src/js/presenter/tabs/t5-kpis.js‎ على ‎RH‎ التي يبنيها
   ‎load-app.mjs‎ (core + derive + highlight) — لا نسخة من المنطق، ولا حاجة إلى
   قشرة التبويبات ولا إلى ECharts، فالنموذج نقي بلا DOM.

   ما تحرسه هذه الاختبارات (V3_SPEC §4-ب و§5 · V3_CONTRACTS §7):
     • عقد التسجيل (‎id: "kpis"‎ · ‎order: 5‎) والنموذج النقي المكشوف.
     • **لا إبرة وهمية**: القيم الحالية ‎14/14‎ غائبة في المصدر، فكل صف
       ‎recorded === false‎ و‎currentFrac === null‎ ونصّه «غير مسجّلة» —
       ولا يتحول الغياب صفراً في أي موضع.
     • **العلامتان الواضحتان**: ‎arcSegments‎ تُخرج شريحة ‎base‎ وشريحة ‎target‎
       على كل عدّاد من عدّادات الإصدار الأربعة عشر، بنهايات تصاعدية آخرها ‎1‎.
     • **العدّاد يكتمل تلقائياً** حين تُدخل الإدارة قيمة: مسار ‎recorded‎ مغطى
       بإصدار مُخلَّق (إبرة + موضع + نص القيمة) بلا تعديل سطر في الوحدة.
     • هندسة نصف الدائرة بالاتجاه العربي (الصفر يميناً وأعلى المقياس يساراً).
     • حراسة معاملات العنوان وحتمية الترشيح والترتيب.
     • **حد نافذة الإبراز 320 حرفاً** و≤3 أرقام على كل مواصفة يفتحها التبويب.
     • صفر لون مكتوب في ملفَّي التبويب (JS وCSS) + قانون التلميح في المصدر.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { RH, ROOT, freshRelease, norm } from "./load-app.mjs";

/* سجل تبويبات وهمي يلتقط تعريف التبويب — القشرة نفسها غير مطلوبة هنا */
RH.tabs = { captured: [], register(def) { this.captured.push(def); } };

const TAB_FILE = "src/js/presenter/tabs/t5-kpis.js";
const CSS_FILE = "src/styles/tabs/kpis.css";

new Function("RH", readFileSync(path.join(ROOT, TAB_FILE), "utf8"))(RH);

const DEF = RH.tabs.captured[0];
const M = RH.presenter.tabModels.kpis;
const HL = RH.highlight;
const fmt = RH.core.fmt;

/** الحقيقة المرجعية: نسخة جديدة معزولة من الإصدار عند كل استدعاء */
const data = () => freshRelease();

/** الفاصل بين العدد والمعدود في ‎fmt‎ فراغ غير فاصل (U+00A0) لا فراغ عادي */
const NB = fmt.NBSP;

/* ══════════════════════════════════════════════════════════════════════════
   ١) عقد التسجيل والنموذج النقي
   ══════════════════════════════════════════════════════════════════════════ */

test("التبويب يسجّل نفسه بالمعرف والترتيب القانونيين", () => {
  assert.equal(RH.tabs.captured.length, 1, "تسجيل واحد لا أكثر");
  assert.equal(DEF.id, "kpis");
  assert.equal(DEF.order, 5);
  assert.equal(DEF.title, "مؤشرات الأداء");
  assert.equal(typeof DEF.build, "function");
  assert.equal(DEF.model, M, "النموذج المسجَّل هو النموذج المكشوف نفسه");
});

test("النموذج النقي يكشف اشتقاقاته وهندسته ومواصفاته كاملة", () => {
  for (const key of ["kpiVal", "spanVal", "scaleMax", "fracOf", "nounParts",
    "typeChip", "typeLong", "scaleNote", "arcSegments", "polar", "arcPath",
    "pageOf", "rows", "summary", "mixOf", "sortOf", "applyMix", "applySort",
    "focusOf", "overviewSpec", "typeSpec", "currentSpec", "kpiSpec",
    "allSpecs"]) {
    assert.equal(typeof M[key], "function", "الدالة الناقصة: " + key);
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ٢) التسميات الحرفية الملزمة (V3_SPEC §4-ب) — لا يُعاد صياغتها
   ══════════════════════════════════════════════════════════════════════════ */

test("الحالة الصريحة مكتوبة بنص المواصفة حرفياً", () => {
  assert.equal(M.NOT_RECORDED, "القيمة الحالية غير مسجّلة — تُدخل من الإدارة");
  assert.equal(M.NOT_RECORDED_SHORT, "غير مسجّلة");
  assert.equal(M.CURRENT_LABEL, "القيمة الحالية");
  assert.equal(M.MARK_BASE, "خط الأساس");
  assert.equal(M.MARK_TARGET, "المستهدف");
  assert.equal(M.SPAN_LABEL, "مدى التحسن المطلوب");
});

test("رقاقة نوع المؤشر (نسبي/عددي) كما طلبها الموجز", () => {
  assert.equal(M.TYPE_PCT, "نسبي");
  assert.equal(M.TYPE_NUM, "عددي");
  assert.equal(M.typeChip({ pct: true }), "نسبي");
  assert.equal(M.typeChip({ pct: false }), "عددي");
  assert.equal(M.typeLong({ pct: true }), "نسبة مئوية");
  assert.equal(M.typeLong({ pct: false }), "قيمة عددية");
  /* المقياس معلن لا مضمر: لكل صيغة تسميتها الملازمة */
  assert.equal(M.scaleNote({ pct: true }), "المقياس: 0 إلى 100٪");
  assert.equal(M.scaleNote({ pct: false }), "المقياس: 0 إلى المستهدف");
});

/* ══════════════════════════════════════════════════════════════════════════
   ٣) تنسيق القيم والمقياس — مرآة ‎kpiVal‎ القانونية في ‎s07‎ و‎ax-kpi‎
   ══════════════════════════════════════════════════════════════════════════ */

test("kpiVal يطابق مرآة المشروع: النسبية ×100 بعلامة ٪ والعددية بفواصل", () => {
  assert.equal(M.kpiVal({ pct: true }, 0.8), fmt.pct(80));
  assert.equal(M.kpiVal({ pct: true }, 0.155), fmt.pct(15.5));
  assert.equal(M.kpiVal({ pct: false }, 260000), "260,000");
  assert.equal(M.kpiVal({ pct: false }, 0), "0");
  /* الغياب يُعرض غياباً ولا يتحول صفراً أبداً */
  assert.equal(M.kpiVal({ pct: true }, null), "—");
  assert.equal(M.kpiVal({ pct: false }, undefined), "—");
  assert.equal(M.kpiVal({ pct: false }, NaN), "—");
});

test("spanVal مشتق شفاف: المستهدف − خط الأساس بصيغة المؤشر", () => {
  assert.equal(M.spanVal({ pct: true, baseline: 0.2, target: 0.9 }), fmt.pct(70));
  assert.equal(M.spanVal({ pct: false, baseline: 130000, target: 260000 }), "130,000");
});

test("المقياس معلن: النسبي على 0→100٪ والعددي على 0→المستهدف", () => {
  assert.equal(M.scaleMax({ pct: true, target: 0.8 }), 1);
  assert.equal(M.scaleMax({ pct: false, target: 10 }), 10);
  /* مستهدف غير موجب (لا يقع في الإصدار) يعيد صفراً بدل قسمة على صفر */
  assert.equal(M.scaleMax({ pct: false, target: 0 }), 0);
  assert.equal(M.scaleMax(null), 0);
  assert.equal(M.fracOf({ pct: false, target: 0 }, 5), 0);
});

test("fracOf يحصر الموضع في [0,1] ولا يسقط على قيمة شاذة", () => {
  const k = { pct: true, target: 0.8 };
  assert.equal(M.fracOf(k, 0), 0);
  assert.equal(M.fracOf(k, 0.5), 0.5);
  assert.equal(M.fracOf(k, 1), 1);
  assert.equal(M.fracOf(k, 4), 1, "ما فوق المقياس يُحصر عند نهايته");
  assert.equal(M.fracOf(k, -3), 0, "ما دون الصفر يُحصر عند بدايته");
  assert.equal(M.fracOf(k, null), 0);
});

/* ══════════════════════════════════════════════════════════════════════════
   ٤) صفوف العرض — من المصدر وحده وبترتيب المعرفات القانوني
   ══════════════════════════════════════════════════════════════════════════ */

test("أربعة عشر صفاً بمعرفات 1..14 بالترتيب — مرآة بوابة strategy.kpis14", () => {
  const rows = M.rows(data());
  assert.equal(rows.length, 14);
  assert.deepEqual(norm(rows.map((r) => r.id)),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  assert.equal(rows.filter((r) => r.pct).length, 11);
  assert.equal(rows.filter((r) => !r.pct).length, 3);
  assert.ok(rows.every((r) => r.target > r.baseline),
    "بوابة kpi.target_gt_baseline");
  assert.ok(rows.filter((r) => r.pct).every((r) => r.baseline >= 0
    && r.baseline <= 1 && r.target >= 0 && r.target <= 1),
  "بوابة kpi.pct_bounds");
});

test("قيم صفوف عيّنة منقولة من المصدر حرفياً ومنسّقة بـ fmt", () => {
  const by = {};
  for (const r of M.rows(data())) by[r.id] = r;

  /* المؤشر 1 — نسبي ينطلق من الصفر إلى 80٪ */
  assert.equal(by[1].typeChip, "نسبي");
  assert.equal(by[1].baseText, fmt.pct(0));
  assert.equal(by[1].targetText, fmt.pct(80));
  assert.equal(by[1].spanText, fmt.pct(80));
  assert.equal(by[1].maxText, fmt.pct(100));
  assert.equal(by[1].baseFrac, 0);
  assert.equal(by[1].targetFrac, 0.8);

  /* المؤشر 5 — عددي: المقياس ينتهي عند المستهدف وخط الأساس في منتصفه */
  assert.equal(by[5].typeChip, "عددي");
  assert.equal(by[5].baseText, "130,000");
  assert.equal(by[5].targetText, "260,000");
  assert.equal(by[5].spanText, "130,000");
  assert.equal(by[5].maxText, "260,000");
  assert.equal(by[5].zeroText, "0");
  assert.equal(by[5].baseFrac, 0.5);
  assert.equal(by[5].targetFrac, 1);
  assert.equal(by[5].basePosText, fmt.pct(50));

  /* المؤشر 13 — نسبي ينطلق من 20٪ إلى 90٪ */
  assert.equal(by[13].baseText, fmt.pct(20));
  assert.equal(by[13].targetText, fmt.pct(90));
  assert.equal(by[13].spanText, fmt.pct(70));
  assert.equal(by[13].basePosText, fmt.pct(20));
});

/* ══════════════════════════════════════════════════════════════════════════
   ٥) **لا إبرة وهمية** — الحالة الصريحة (V3_SPEC §4-ب)
   ══════════════════════════════════════════════════════════════════════════ */

test("14/14 بلا قيمة حالية: لا إبرة ولا صفر مختلق على أي عدّاد", () => {
  const rows = M.rows(data());
  for (const r of rows) {
    assert.equal(r.recorded, false, "المؤشر " + r.id + " ادّعى قيمة حالية");
    assert.equal(r.current, null, "المؤشر " + r.id + " حوّل الغياب قيمةً");
    assert.equal(r.currentFrac, null,
      "المؤشر " + r.id + " له موضع إبرة رغم غياب القيمة");
    assert.equal(r.currentText, M.NOT_RECORDED_SHORT);
    assert.equal(r.note, "تُسجَّل القيم الحالية من داخل المنصة — غير متوفرة بعد",
      "ملاحظة المصدر الحرفية تلازم كل صف");
  }
});

test("العدّاد يكتمل تلقائياً حين تُدخل الإدارة قيمة — بلا تعديل وحدة", () => {
  const rel = data();
  /* إصدار مُخلَّق للاختبار وحده: قيمة حالية مسجَّلة على المؤشرين 5 و13 */
  rel.strategy.kpis.find((k) => k.id === 5).current = 195000;
  rel.strategy.kpis.find((k) => k.id === 13).current = 0.45;

  const by = {};
  for (const r of M.rows(rel)) by[r.id] = r;

  assert.equal(by[5].recorded, true);
  assert.equal(by[5].currentFrac, 0.75, "موضع الإبرة = القيمة ÷ المقياس");
  assert.equal(by[5].currentText, "195,000");
  assert.equal(by[13].recorded, true);
  assert.equal(by[13].currentFrac, 0.45);
  assert.equal(by[13].currentText, fmt.pct(45));
  /* بقية المؤشرات تبقى معلّقة بصدق — لا عدوى بين الصفوف */
  assert.equal(by[1].recorded, false);
  assert.equal(by[1].currentFrac, null);

  const sum = M.summary(rel);
  assert.equal(sum.recordedCount, 2);
  assert.equal(sum.recordedLabel, fmt.iso("2 من 14"));

  /* ومواصفة الإبراز تتحول إلى صياغة القيمة المسجَّلة لا إلى «غير مسجّلة» */
  const spec = M.kpiSpec(rel, 5);
  assert.ok(spec.sentence.includes("195,000"));
  assert.equal(/غير مسجّلة/.test(spec.sentence), false);
  assert.equal(spec.stats[2].label, M.CURRENT_LABEL);
  assert.equal(spec.stats[2].value, "195,000");
  assert.equal(HL.normalize(spec, { strict: true }).chars <= HL.MAX_CHARS, true);
});

/* ══════════════════════════════════════════════════════════════════════════
   ٦) شرائح القوس: **علامتان واضحتان** بين خط الأساس والمستهدف
   ══════════════════════════════════════════════════════════════════════════ */

/** نهايات الشرائح تصاعدية حصراً وآخرها ‎1‎ — عقد ‎axisLine‎ في ECharts وSVG معاً */
function assertMonotonic(segs, label) {
  assert.ok(segs.length > 0, label + ": لا شريحة");
  let prev = 0;
  for (const s of segs) {
    assert.ok(s.stop > prev, label + ": نهاية غير تصاعدية عند " + s.stop);
    assert.ok(s.stop <= 1, label + ": نهاية تتجاوز المقياس");
    prev = s.stop;
  }
  assert.equal(segs[segs.length - 1].stop, 1, label + ": القوس لا ينتهي عند 1");
}

test("كل عدّاد في الإصدار يحمل شريحتَي العلامتين وقوساً مكتملاً", () => {
  for (const r of M.rows(data())) {
    const roles = r.segments.map((s) => s.role);
    assertMonotonic(r.segments, "المؤشر " + r.id);
    assert.ok(roles.includes("base"), "المؤشر " + r.id + " بلا علامة خط أساس");
    assert.ok(roles.includes("target"), "المؤشر " + r.id + " بلا علامة مستهدف");
    /* ترتيب العلامتين على القوس يتبع ترتيب القيمتين دائماً */
    assert.ok(roles.indexOf("base") < roles.indexOf("target"),
      "المؤشر " + r.id + ": المستهدف قبل خط الأساس على القوس");
    for (const role of roles) {
      assert.ok(["track", "base", "band", "target"].includes(role),
        "دور شريحة مجهول: " + role);
    }
  }
});

test("arcSegments: نطاق التحسن يظهر بين العلامتين ويختفي عند تلاصقهما", () => {
  const wide = M.arcSegments(0.2, 0.9, 0.014);
  assertMonotonic(wide, "متباعدتان");
  assert.deepEqual(norm(wide.map((s) => s.role)),
    ["track", "base", "band", "target", "track"]);
  assert.ok(Math.abs(wide[0].stop - 0.186) < 1e-9);
  assert.ok(Math.abs(wide[1].stop - 0.214) < 1e-9);

  /* علامتان متقاربتان: لا نطاق بينهما، والعلامتان تبقيان */
  const tight = M.arcSegments(0.5, 0.52, 0.014);
  assertMonotonic(tight, "متقاربتان");
  assert.deepEqual(norm(tight.map((s) => s.role)),
    ["track", "base", "target", "track"]);

  /* خط أساس عند الصفر: لا شريحة مسار قبله (شريحة بلا طول تُسقط) */
  const fromZero = M.arcSegments(0, 0.8, 0.014);
  assertMonotonic(fromZero, "من الصفر");
  assert.equal(fromZero[0].role, "base");

  /* مستهدف عند نهاية المقياس: القوس ينتهي بالعلامة لا بالمسار */
  const toEnd = M.arcSegments(0.5, 1, 0.014);
  assertMonotonic(toEnd, "إلى النهاية");
  assert.equal(toEnd[toEnd.length - 1].role, "target");
});

test("arcSegments يحصر الشذوذ ويحفظ العلامتين حتى عند انطباق الموضعين", () => {
  /* ترتيب معكوس يُصحَّح ولا يقلب النهايات */
  assertMonotonic(M.arcSegments(0.9, 0.2, 0.014), "معكوسة");
  /* قيم خارج المدى تُحصر */
  assertMonotonic(M.arcSegments(-2, 5, 0.014), "خارج المدى");
  /* انطباق الموضعين (لا يقع في الإصدار) — العلامتان تبقيان */
  const same = M.arcSegments(0.5, 0.5, 0.014);
  assertMonotonic(same, "منطبقتان");
  const roles = same.map((s) => s.role);
  assert.ok(roles.includes("base") && roles.includes("target"));
  /* مدخل غير رقمي لا يُسقط الرسم */
  assertMonotonic(M.arcSegments(NaN, NaN, NaN), "غير رقمية");
});

/* ══════════════════════════════════════════════════════════════════════════
   ٧) هندسة نصف الدائرة بالاتجاه العربي
   ══════════════════════════════════════════════════════════════════════════ */

test("الصفر عند الطرف الأيمن وأعلى المقياس عند الأيسر (اتجاه القراءة)", () => {
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  const p0 = M.polar(120, 122, 96, 0);
  const p1 = M.polar(120, 122, 96, 1);
  const pm = M.polar(120, 122, 96, 0.5);
  assert.ok(near(p0.x, 216) && near(p0.y, 122), "الكسر 0 عند اليمين");
  assert.ok(near(p1.x, 24) && near(p1.y, 122), "الكسر 1 عند اليسار");
  assert.ok(near(pm.x, 120) && near(pm.y, 26), "الكسر 0.5 عند القمة");
  /* الشذوذ يُحصر داخل نصف الدائرة ولا يخرج عنه */
  assert.deepEqual(norm(M.polar(120, 122, 96, 9)), norm(p1));
  assert.deepEqual(norm(M.polar(120, 122, 96, -9)), norm(p0));
  assert.deepEqual(norm(M.polar(120, 122, 96, NaN)), norm(p0));
});

test("arcPath يرسم قوساً بعكس عقارب الساعة بلا علم قوس كبير", () => {
  const d = M.arcPath(120, 122, 96, 0, 1);
  assert.equal(d, "M 216 122 A 96 96 0 0 0 24 122",
    "‎sweep-flag = 0‎ (يمين → أعلى → يسار) و‎large-arc-flag = 0‎");
  const half = M.arcPath(120, 122, 96, 0, 0.5);
  assert.ok(/^M 216 122 A 96 96 0 0 0 120 26$/.test(half));
  /* الإحداثيات مقرَّبة فلا تتسرب كسور عائمة إلى سمة ‎d‎ */
  assert.equal(/\d\.\d{3,}/.test(M.arcPath(120, 122, 96, 0.13, 0.77)), false);
});

test("هندسة العدّاد الثابتة تبقى داخل إطار الرسم", () => {
  const g = M.GEO;
  /* أبعد امتداد خارج نصف القطر: نصف سماكة القوس · شاخص الأساس · عارضة المستهدف */
  const out = g.R + Math.max(g.BAND / 2, g.DOT + 2, g.TICK_OUT);
  assert.ok(g.CX - out >= 0, "الطرف الأيسر داخل الإطار");
  assert.ok(g.CX + out <= g.W, "الطرف الأيمن داخل الإطار");
  assert.ok(g.CY - out >= 0, "قمة القوس داخل الإطار");
  assert.ok(g.CY + g.BAND / 2 <= g.H, "قاعدة القوس داخل الإطار");
  /* العارضة الداخلية لا تعبر مركز القوس */
  assert.ok(g.TICK_IN < g.R, "عارضة المستهدف لا تتجاوز المركز");
});

/* ══════════════════════════════════════════════════════════════════════════
   ٨) الإحصاء وأدوات اللوح
   ══════════════════════════════════════════════════════════════════════════ */

test("summary يحسب تكوين المحفظة من الصفوف لا من أرقام مكتوبة", () => {
  const rel = data();
  const sum = M.summary(rel);
  assert.equal(sum.total, 14);
  assert.equal(sum.pctCount, 11);
  assert.equal(sum.numCount, 3);
  assert.equal(sum.pctCount + sum.numCount, sum.total);
  assert.equal(sum.recordedCount, 0);
  assert.equal(sum.missingCount, 14);
  assert.equal(sum.recordedLabel, fmt.iso("0 من 14"));
  assert.equal(sum.fullTargets, 7, "سبعة مؤشرات نسبية مستهدفها التغطية الكاملة");
  assert.equal(sum.minPctTargetText, fmt.pct(30));
  assert.equal(sum.maxPctTargetText, fmt.pct(100));
  assert.equal(sum.widest.id, 2, "أوسع مدى تحسن — أول الأقصى بترتيب المعرفات");
  assert.equal(sum.asOf, rel.meta.data_as_of);
  assert.equal(sum.calc, rel.meta.calculation_date);
  assert.equal(sum.source, rel.strategy.source);
});

test("nounParts يحفظ تطابق العدد والمعدود في صف الأرقام الكبرى", () => {
  assert.deepEqual(norm(M.nounParts(14, "indicator")),
    { num: "14", word: "مؤشراً" });
  assert.deepEqual(norm(M.nounParts(11, "indicator")),
    { num: "11", word: "مؤشراً" });
  assert.deepEqual(norm(M.nounParts(3, "indicator")),
    { num: "3", word: "مؤشرات" });
  assert.equal(M.nounParts(3, "indicator").num + NB
    + M.nounParts(3, "indicator").word, fmt.noun(3, "indicator"));
});

test("حراسة معاملات العنوان: القيمة الغريبة تسقط إلى الافتراضي بصمت", () => {
  assert.equal(M.mixOf({ mix: "pct" }), "pct");
  assert.equal(M.mixOf({ mix: "num" }), "num");
  assert.equal(M.mixOf({ mix: "زائف" }), "");
  assert.equal(M.mixOf({}), "");
  assert.equal(M.mixOf(null), "");
  assert.equal(M.sortOf({ sort: "span" }), "span");
  assert.equal(M.sortOf({ sort: "base" }), "base");
  assert.equal(M.sortOf({ sort: "<script>" }), "");
  assert.equal(M.sortOf(null), "");
});

test("الترشيح بالصيغة يعيد القائمة كاملة لمفتاح مجهول", () => {
  const rows = M.rows(data());
  assert.equal(M.applyMix(rows, "pct").length, 11);
  assert.equal(M.applyMix(rows, "num").length, 3);
  assert.equal(M.applyMix(rows, "").length, 14);
  assert.equal(M.applyMix(rows, "زائف").length, 14);
  assert.notEqual(M.applyMix(rows, ""), rows, "نسخة لا إشارة");
});

test("الترتيب حتمي دائماً بكسر تعادل على المعرف", () => {
  const rows = M.rows(data());
  assert.deepEqual(norm(M.applySort(rows, "").map((r) => r.id)),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  /* الأوسع مدى تحسن: تسعة مؤشرات بمدى كامل تتصدر بترتيب معرفاتها */
  assert.deepEqual(norm(M.applySort(rows, "span").slice(0, 5).map((r) => r.id)),
    [2, 3, 4, 7, 9]);
  /* الأقرب انطلاقاً: موضع خط الأساس على المقياس تنازلياً */
  assert.deepEqual(norm(M.applySort(rows, "base").slice(0, 4).map((r) => r.id)),
    [5, 6, 13, 8]);
  /* الترتيب لا يمسّ القائمة الأصلية */
  const before = rows.map((r) => r.id).join(",");
  M.applySort(rows, "span");
  assert.equal(rows.map((r) => r.id).join(","), before);
});

test("focusOf يسقط على أول مؤشر لمعرف مجهول — لا شاشة فارغة", () => {
  const rows = M.rows(data());
  assert.equal(M.focusOf(rows, "13").id, 13);
  assert.equal(M.focusOf(rows, 7).id, 7);
  assert.equal(M.focusOf(rows, "زائف").id, 1);
  assert.equal(M.focusOf(rows, "99").id, 1);
  assert.equal(M.focusOf(rows, "").id, 1);
  assert.equal(M.focusOf([], "3"), null);
});

test("pageOf مرآة ترقيم ملحق المؤشرات (8 صفوف للصفحة، فهرس صفري)", () => {
  assert.equal(M.AX_ROWS_PER_PAGE, 8);
  assert.equal(M.pageOf(1), 0);
  assert.equal(M.pageOf(8), 0);
  assert.equal(M.pageOf(9), 1);
  assert.equal(M.pageOf(14), 1);
  assert.equal(M.pageOf(0), 0, "معرف شاذ لا يخرج عن المدى");
  /* كل صف يحمل صفحته المحسوبة */
  for (const r of M.rows(data())) {
    assert.equal(r.axPage, M.pageOf(r.id));
    assert.ok(r.axPage >= 0 && r.axPage <= 1);
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ٩) نافذة الإبراز: حد 320 حرفاً · ≤3 أرقام · زر واحد إلى الملحق
   ══════════════════════════════════════════════════════════════════════════ */

test("كل مواصفة إبراز تمر من normalize في الوضع الصارم دون قصّ", () => {
  const rel = data();
  const specs = M.allSpecs(rel);
  assert.equal(specs.length, 18, "أربع مواصفات عامة + أربعة عشر مؤشراً");
  for (const spec of specs) {
    const model = HL.normalize(spec, { strict: true });
    assert.ok(model.chars <= HL.MAX_CHARS,
      "«" + spec.title + "» = " + model.chars + " حرفاً");
    assert.equal(model.truncated, false, "«" + spec.title + "» قُصّت");
    assert.equal(model.dropped, 0, "«" + spec.title + "» أُسقط منها رقم");
    assert.ok(model.stats.length <= HL.MAX_STATS);
    assert.ok(model.sentence.length > 0, "جملة واحدة إلزامية");
    /* جملة واحدة لا فقرة: تنتهي بنقطة، ولا فاصل جملة داخلها
       (النقطة العشرية في «80.0٪» لا تتبعها مسافة فلا تُحسب فاصلاً) */
    assert.ok(/[.؟!]$/.test(model.sentence),
      "«" + spec.title + "» بلا نقطة ختامية");
    assert.equal(/[.؟!]\s+\S/.test(model.sentence), false,
      "«" + spec.title + "» أكثر من جملة");
    /* الزر الوحيد يقود إلى ملحق المؤشرات لا غير */
    assert.ok(model.appendix, "«" + spec.title + "» بلا زر ملحق");
    assert.equal(model.appendix.id, "kpi");
    assert.equal(model.appendix.label, "التفاصيل الكاملة في الملحق");
    assert.ok(spec.note && spec.note.includes(rel.meta.data_as_of),
      "وسم الصدق ملازم — وهو خارج حدّ الأحرف");
  }
});

test("وسم الصدق يصرّح بغياب القيم الحالية وبانتفاء الإبرة — خارج الحد", () => {
  const rel = data();
  const spec = M.kpiSpec(rel, 1);
  assert.ok(spec.note.includes("غير مسجّلة في المصدر"));
  assert.ok(spec.note.includes("فلا إبرة على أي عدّاد"));
  const withNote = HL.measure({
    title: spec.title, sentence: spec.sentence, stats: spec.stats,
  });
  assert.equal(HL.normalize(spec, { strict: true }).chars, withNote,
    "الوسم خارج الحساب فلا يستهلك الحد");
});

test("مواصفة المؤشر تحمل العلامتين بنغمة المستهدف وتقود إلى صفحته", () => {
  const rel = data();
  const spec = M.kpiSpec(rel, 13);
  assert.equal(spec.title, "نسبة الأفراد الساكنين في سكن مرخص");
  assert.deepEqual(norm(spec.stats.map((s) => s.label)),
    ["خط الأساس", "المستهدف", "مدى التحسن المطلوب"]);
  assert.equal(spec.stats[0].value, fmt.pct(20));
  assert.equal(spec.stats[1].value, fmt.pct(90));
  assert.equal(spec.stats[2].value, fmt.pct(70));
  /* الذهبي دلالة المستهدف وخط الأساس حصراً */
  assert.equal(spec.stats[0].tone, "gold");
  assert.equal(spec.stats[1].tone, "gold");
  assert.equal(spec.stats[2].tone, undefined);
  assert.ok(spec.sentence.includes("غير مسجّلة بعد"));
  /* المؤشر 13 في الصفحة الثانية من الملحق (فهرس 1) */
  assert.deepEqual(norm(spec.appendix.params), { page: "1" });
  /* والمؤشر 5 في الصفحة الأولى فلا معامل صفحة أصلاً */
  assert.deepEqual(norm(M.kpiSpec(rel, 5).appendix.params), {});
  /* معرف مجهول يسقط على المؤشر الأول بصمت */
  assert.equal(M.kpiSpec(rel, "زائف").title, M.rows(rel)[0].name);
});

test("مواصفة بيان الصدق تعلن الغياب عدداً ومصدرَ تسجيله", () => {
  const rel = data();
  const spec = M.currentSpec(rel);
  assert.equal(spec.title, "القيمة الحالية");
  assert.ok(spec.sentence.includes("بلا إبرة"));
  assert.deepEqual(norm(spec.stats.map((s) => s.label)),
    ["المسجَّل", "مصدر التسجيل", "البيانات حتى"]);
  assert.equal(spec.stats[0].value, fmt.iso("0 من 14"));
  assert.equal(spec.stats[1].value, "واجهة الإدارة");
  assert.equal(spec.stats[2].value, rel.meta.data_as_of);
});

test("مواصفتا الصيغة تعدّان من الصفوف وتحفظان تطابق العدد والمعدود", () => {
  const rel = data();
  const pct = M.typeSpec(rel, "pct");
  assert.equal(pct.title, "المؤشرات النسبية");
  assert.equal(pct.stats[0].value, fmt.noun(11, "indicator"));
  assert.equal(pct.stats[1].value, fmt.pct(78.6));
  assert.equal(pct.stats[2].value, fmt.noun(7, "indicator"));
  assert.equal(pct.stats[2].tone, "gold");

  const num = M.typeSpec(rel, "num");
  assert.equal(num.title, "المؤشرات العددية");
  assert.equal(num.stats[0].value, fmt.noun(3, "indicator"));
  assert.equal(num.stats[1].value, fmt.pct(21.4));
  /* الحصتان تكملان المئة — لا صيغة ثالثة مخفية */
  assert.equal(11 + 3, 14);
});

test("مواصفة النظرة العامة تلخّص التكوين بلا رقم مكتوب يدوياً", () => {
  const rel = data();
  const spec = M.overviewSpec(rel);
  assert.equal(spec.title, "المؤشرات الاستراتيجية");
  assert.ok(spec.sentence.includes(fmt.noun(14, "indicator")));
  assert.deepEqual(norm(spec.stats.map((s) => s.value)), [
    fmt.noun(11, "indicator"),
    fmt.noun(3, "indicator"),
    fmt.iso("0 من 14"),
  ]);
});

test("كل قيمة داخل المواصفات منسّقة: لا ٪ لاتينية ولا رقم بلا فواصل", () => {
  const rel = data();
  for (const spec of M.allSpecs(rel)) {
    const text = [spec.title, spec.sentence,
      ...spec.stats.map((s) => s.label + " " + s.value)].join(" ");
    assert.equal(/%/.test(text), false, "«" + spec.title + "» فيها ٪ لاتينية");
    const bare = text.replace(/,/g, "@").replace(/\b(?:19|20)\d{2}\b/g, "");
    assert.equal(/\d{4,}/.test(bare), false,
      "«" + spec.title + "» فيها رقم بلا فاصل آلاف");
  }
});

test("لا مواصفة تدّعي قيمة حالية أو نسبة إنجاز لمؤشر بلا تسجيل", () => {
  const rel = data();
  for (const spec of M.allSpecs(rel)) {
    const text = spec.sentence + " " + spec.stats.map((s) => s.label).join(" ");
    assert.equal(/نسبة الإنجاز|أُنجز|تحقّق منه/.test(text), false,
      "«" + spec.title + "» تحمل ادّعاء إنجاز");
  }
  for (const r of M.rows(rel)) {
    const spec = M.kpiSpec(rel, r.id);
    const values = spec.stats.map((s) => s.value).join(" ");
    assert.equal(values.includes(M.CURRENT_LABEL + ":"), false);
    assert.ok(spec.stats.every((s) => s.label !== M.CURRENT_LABEL),
      "المؤشر " + r.id + " عرض «القيمة الحالية» رقماً وهو غير مسجَّل");
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ١٠) صفر لون مكتوب (V3_CONTRACTS §1-د) على ملفَّي التبويب
   ══════════════════════════════════════════════════════════════════════════ */

test("لا لون مكتوب يدوياً في JS التبويب ولا في CSS التبويب", () => {
  for (const rel of [TAB_FILE, CSS_FILE]) {
    const src = readFileSync(path.join(ROOT, rel), "utf8");
    assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(src), false,
      "لون سداسي مكتوب في " + rel);
    assert.equal(/rgba?\(\s*[0-9]/.test(src), false,
      "ثلاثي RGB عددي في " + rel);
  }
});

test("CSS التبويب يلتزم بادئته ولا يعيد تعريف أصناف القشرة", () => {
  const css = readFileSync(path.join(ROOT, CSS_FILE), "utf8");
  for (const owned of [".tabchart", ".tabgrid", ".tabcard", ".tabfigs", ".tabfig"]) {
    const re = new RegExp("(^|[},]\\s*)\\" + owned + "[\\s,{]", "m");
    assert.equal(re.test(css), false,
      "قاعدة تبدأ بـ" + owned + " — أصناف القشرة لا تُعاد كتابتها");
  }
  assert.ok(css.includes(".kpi5-"), "البادئة الخاصة مستعملة");
  /* شرائح القوس والعلامتان تستمد ألوانها من الرموز الحية فتتبع السمتين */
  assert.ok(/\.kpi5-arc\.is-track\s*\{[^}]*stroke:\s*var\(--line\)/.test(css));
  assert.ok(/\.kpi5-arc\.is-base\s*\{[^}]*stroke:\s*var\(--gold\)/.test(css));
  assert.ok(/\.kpi5-arc\.is-target\s*\{[^}]*stroke:\s*var\(--gold-hi\)/.test(css));
  assert.ok(/\.kpi5-arc\.is-band\s*\{[^}]*stroke:\s*rgba\(var\(--gold-rgb\)/.test(css));
  /* الإبرة معرَّفة لمسار القيمة المسجَّلة، ولونها الأخضر الدلالي */
  assert.ok(/\.kpi5-needle\s*\{[^}]*stroke:\s*var\(--green\)/.test(css));
  /* **شبكة ثلاثة في الصف على 1920 واثنان على 1366** — الموجز الملزم */
  assert.ok(/\.kpi5-board\s*\{[^}]*grid-template-columns:\s*repeat\(3,/.test(css),
    "شبكة العدّادات ثلاثة في الصف على الشاشة العريضة");
  assert.ok(/@media\s*\(max-width:\s*1500px\)\s*\{\s*\.kpi5-board\s*\{[^}]*repeat\(2,/
    .test(css), "عتبة 1366 تعطي عمودين لا ثلاثة");
  /* اسم المؤشر مقصوص في سطرين بإعلان صريح */
  assert.ok(/\.kpi5-g-name\s*\{[^}]*-webkit-line-clamp:\s*2/.test(css),
    "اسم المؤشر بلا قصّ معلن في سطرين");
  assert.equal(/repeat\(\s*([4-9]|\d{2,})\s*,/.test(css), false,
    "لا شبكة تتجاوز ثلاثة أعمدة في هذا اللوح");
  /* التمرير الأفقي محصور داخل حاوية المصفوفة ولا يصل إلى الصفحة */
  assert.ok(/\.kpi5-matrix-scroll\s*\{[^}]*overflow-x:\s*auto/.test(css));
});

/* ══════════════════════════════════════════════════════════════════════════
   ١١) عقد البناء في مصدر التبويب: **شبكة عدّادات لا عدّاد مكبَّر**
       (الموجز الملزم: «show guages … of the strategic KPIs» — V3_CONTRACTS §4)
   ══════════════════════════════════════════════════════════════════════════ */

test("التبويب شبكة عدّادات SVG بلا ECharts ولا تلميح رسم", () => {
  const src = readFileSync(path.join(ROOT, TAB_FILE), "utf8");
  /* لا مثيل رسم في هذا التبويب أصلاً: العدّادات الأربعة عشر SVG كودي */
  assert.equal(src.includes("echarts.init"), false);
  assert.equal((src.match(/ctx\.chart\(/g) || []).length, 0,
    "لا مثيل ECharts — العدّادات مرسومة كوداً");
  assert.equal((src.match(/tooltip:/g) || []).length, 0,
    "لا تلميح رسم: الطبقة الأولى تلميح المتصفح الأصلي على البطاقة");
  for (const banned of ["T.ttRow(", "T.ttTitle(", "T.ttMicro("]) {
    assert.equal(src.includes(banned), false,
      banned + " لا محل لها بلا رسم ECharts");
  }
  /* كل مستمع وطبقة مسجَّل في تنظيف التبويب */
  assert.ok((src.match(/ctx\.onTeardown\(/g) || []).length >= 2,
    "التنظيف مسجَّل لكل مستمع/طبقة");
});

test("لا عدّاد مكبَّر ولا لوح تفاصيل مرسى ولا ترقيم «1 من 14»", () => {
  const src = readFileSync(path.join(ROOT, TAB_FILE), "utf8");
  const css = readFileSync(path.join(ROOT, CSS_FILE), "utf8");
  for (const gone of ["kpi5-focus-card", "kpi5-facts-card", "kpi5-step",
    "kpi5-g-zoom", "kpi5-dl"]) {
    assert.equal(src.includes(gone), false,
      "بقية العدّاد المكبَّر في JS: " + gone);
    assert.equal(css.includes(gone), false,
      "بقية العدّاد المكبَّر في CSS: " + gone);
  }
  /* معامل التركيز ‎?kpi=‎ لم يعد يحكم الشاشة — الأربعة عشر ظاهرة دائماً */
  assert.equal(/params\s*&&\s*ctx\.params\.kpi/.test(src), false,
    "معامل ‎kpi‎ ما زال يقصر الشاشة على مؤشر واحد");
  /* البطاقة نفسها زر: نقرة واحدة = إبراز (الطبقة الثانية) لا تصفية */
  assert.ok(/class: "kpi5-g-card"/.test(src), "بطاقة العدّاد هي الزر");
  assert.ok(src.includes("gaugeCard("), "بانِي بطاقة العدّاد موجود");
});

test("كل عدّاد في الشبكة يعلن حالته بلا إبرة وهمية", () => {
  const src = readFileSync(path.join(ROOT, TAB_FILE), "utf8");
  /* الإبرة مشروطة بـ‎r.recorded‎ حصراً داخل ‎gaugeSvg‎ */
  assert.ok(/if\s*\(r\.recorded\s*&&\s*r\.currentFrac\s*!=\s*null\)/.test(src),
    "الإبرة غير مشروطة بتسجيل القيمة");
  /* النص الحرفي للحالة الصريحة حاضر في المصدر */
  assert.ok(src.includes("القيمة الحالية غير مسجّلة — تُدخل من الإدارة"));
  /* الاسم مقصوص في سطرين والاسم الكامل في ‎title‎ — لا بتر خفي */
  assert.ok(/class: "kpi5-g-name", title: r\.name/.test(src),
    "الاسم الكامل غائب عن ‎title‎");
  /* نصف الدائرة بالاتجاه العربي: الصفر يميناً وأعلى المقياس يساراً —
     تحرسه هندسة ‎polar‎ المغطاة أعلاه، وهنا نتأكد أن العدّاد SVG وحده */
  assert.ok(src.includes("function gaugeSvg("), "عدّاد SVG كودي");
});
