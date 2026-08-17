/* tab-initiatives.test.mjs — بوابات القبول للتبويب ٤ «المبادرات» (V3_CONTRACTS §7)
   ══════════════════════════════════════════════════════════════════════════════
   يُنفَّذ الملف الحقيقي ‎src/js/presenter/tabs/t4-initiatives.js‎ داخل سياق ‎vm‎
   يحمل السلسلة الدنيا التي يعتمد عليها (‎ns/dom/format/bus/derive/highlight‎)
   مع **سجل تبويبات وهمي** يلتقط تعريف التبويب — فلا نسخة من المنطق ولا حاجة
   إلى قشرة التبويبات ولا إلى ECharts.

   ما تحرسه هذه الاختبارات (V3_SPEC §4-ب و§5 · V3_CONTRACTS §7 و§7-أ):
     • عقد التسجيل (‎id: "initiatives"‎ · ‎order: 4‎) والنموذج النقي المكشوف.
     • قاعدة الحالة الحرفية ‎status_rule‎ (منجزة/جاري العمل/متأخرة حكماً/لم يبدأ).
     • **حلقة الركيزة = المنجز عدداً** مع العدّ الظاهر «1 من 6» — لا نسبة
       إنجاز مخترعة لمبادرة واحدة.
     • **شريط المبادرة = «مضي المدة الزمنية»** بتسميته الحرفية، ويُخفى لمن لا
       تاريخ له، والمنجزة وحدها تُعرض 100٪ إنجازاً.
     • هندسة الحلقة النقية (محيط/إزاحة) وتسمية محور الخط الزمني وفهرس صفحة
       المتأخرات في الملحق.
     • **حدّ نافذة الإبراز 320 حرفاً** و≤3 أرقام مساندة على كل مواصفة يفتحها
       التبويب — ‎normalize(spec, {strict:true})‎ يرمي عند أي تجاوز.
     • صفر لون مكتوب في ملفَي التبويب (JS وCSS) + قانون التلميح في المصدر. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { ROOT, freshRelease, norm } from "./load-app.mjs";

/* ── سياق مستقل: السلسلة الدنيا ثم سجل تبويبات وهمي ثم ملف التبويب ── */

const CHAIN = [
  "src/js/core/ns.js",
  "src/js/core/dom.js",
  "src/js/core/format.js",
  "src/js/core/bus.js",
  "src/js/data/derive.js",
  "src/js/presenter/highlight.js",
];

const TAB_FILE = "src/js/presenter/tabs/t4-initiatives.js";
const CSS_FILE = "src/styles/tabs/initiatives.css";

const windowMock = { addEventListener() {}, removeEventListener() {} };
const documentMock = {
  documentElement: {}, body: {},
  addEventListener() {}, removeEventListener() {},
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
};

const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  console,
  setTimeout,
  clearTimeout,
});

for (const rel of CHAIN) {
  vm.runInContext(readFileSync(path.join(ROOT, rel), "utf8"), context,
    { filename: rel });
}

/* سجل وهمي: يلتقط ما يمرره التبويب إلى ‎RH.tabs.register‎ بلا قشرة ولا DOM */
vm.runInContext(
  "RH.tabs = { captured: [], register(def) { this.captured.push(def); } };",
  context, { filename: "stub-tabs.js" });

vm.runInContext(readFileSync(path.join(ROOT, TAB_FILE), "utf8"), context,
  { filename: TAB_FILE });

const RH = vm.runInContext("RH;", context);
const DEF = RH.tabs.captured[0];
const M = DEF.model;
const fmt = RH.core.fmt;
const HL = RH.highlight;

/** الحقيقة المرجعية: نسخة جديدة معزولة من الإصدار عند كل استدعاء */
const data = () => freshRelease();

/* ══════════════════════════════════════════════════════════════════════════
   ١) عقد التسجيل
   ══════════════════════════════════════════════════════════════════════════ */

test("التبويب يسجّل نفسه بالمعرف والترتيب القانونيين", () => {
  assert.equal(RH.tabs.captured.length, 1, "تسجيل واحد لا أكثر");
  assert.equal(DEF.id, "initiatives");
  assert.equal(DEF.order, 4);
  assert.equal(DEF.title, "المبادرات");
  assert.equal(typeof DEF.build, "function");
  assert.equal(typeof DEF.model, "object");
});

test("النموذج النقي يكشف اشتقاقاته ومواصفاته كاملة", () => {
  for (const key of ["rows", "pillars", "portfolio", "barOf", "elapsedOf",
    "statusOf", "ringDash", "dayLabel", "latePageIndex", "filterRows",
    "pillarSpec", "initiativeSpec", "statusSpec", "portfolioSpec", "allSpecs"]) {
    assert.equal(typeof M[key], "function", "الدالة الناقصة: " + key);
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ٢) قاعدة الحالة الحرفية (strategy.status_rule)
   ══════════════════════════════════════════════════════════════════════════ */

test("مفردات الحالة مطابقة لقاموس الإصدار حرفياً", () => {
  const release = data();
  assert.deepEqual(norm(M.ST_ORDER.slice()),
    norm(release.strategy.status_vocabulary.slice()),
    "ترتيب المفردات ونصّها من المصدر لا من اجتهاد التبويب");
});

test("statusOf يطبّق قاعدة المصدر: ملف → متأخرة → جارية → لم تبدأ", () => {
  const calc = "2026-08-11";
  assert.equal(M.statusOf({ status: "منجزة" }, calc), "منجزة");
  /* حالة الملف تتقدم على أي حساب — حتى لو تجاوزت تواريخها */
  assert.equal(
    M.statusOf({ status: "منجزة", start: "2026-01-01", end: "2026-02-01" }, calc),
    "منجزة");
  assert.equal(M.statusOf({ start: "2026-04-01", end: "2026-07-31" }, calc),
    "متأخرة");
  assert.equal(M.statusOf({ start: "2026-04-01", end: "2027-04-30" }, calc),
    "جاري العمل");
  assert.equal(M.statusOf({ start: "2026-12-01", end: "2027-04-30" }, calc),
    "لم يتم البدء");
  assert.equal(M.statusOf({}, calc), "لم يتم البدء");
});

test("التوزيع المحسوب يطابق ما أثبتته بوابات الإصدار: 2 منجزة · 9 جارية · 7 متأخرة", () => {
  const port = M.portfolio(data());
  assert.equal(port.total, 18);
  assert.equal(port.pillars, 4);
  assert.equal(port.counts["منجزة"], 2);
  assert.equal(port.counts["جاري العمل"], 9);
  assert.equal(port.counts["متأخرة"], 7);
  assert.equal(port.counts["لم يتم البدء"], 0);
  assert.equal(port.counts["منجزة"] + port.counts["جاري العمل"]
    + port.counts["متأخرة"] + port.counts["لم يتم البدء"], port.total);
});

test("نطاق المحفظة الزمني وموضع تاريخ الحساب من تواريخ المصدر وحدها", () => {
  const port = M.portfolio(data());
  assert.equal(port.minStart, "2026-04-01");
  assert.equal(port.maxEnd, "2027-04-30");
  assert.equal(port.spanDays, 394);
  assert.equal(port.calcDay, 132);
  assert.equal(port.undated, 2, "مبادرتان بلا تواريخ في المصدر");
  assert.equal(port.dated, 16);
});

/* ══════════════════════════════════════════════════════════════════════════
   ٣) حلقة الركيزة: المنجز **عدداً** مع العدّ الظاهر (V3_SPEC §4-ب)
   ══════════════════════════════════════════════════════════════════════════ */

test("حلقات الركائز الأربع: نسبة المنجز عدداً وعدٌّ ظاهر «1 من 6»", () => {
  const pills = M.pillars(data());
  assert.equal(pills.length, 4);
  assert.deepEqual(norm(pills.map((p) => p.id)), ["p1", "p2", "p3", "p4"]);
  assert.deepEqual(norm(pills.map((p) => p.total)), [6, 4, 3, 5]);
  assert.deepEqual(norm(pills.map((p) => p.done)), [1, 0, 1, 0]);
  assert.deepEqual(norm(pills.map((p) => p.pct)), [16.7, 0, 33.3, 0]);
  /* العدّ الظاهر الملزم بعزل اتجاهي — «1 من 6» للركيزة الأولى حرفياً */
  assert.equal(pills[0].countLabel, fmt.iso("1 من 6"));
  assert.equal(pills[1].countLabel, fmt.iso("0 من 4"));
  assert.equal(pills[2].countLabel, fmt.iso("1 من 3"));
  assert.equal(pills[3].countLabel, fmt.iso("0 من 5"));
  /* مجموع مبادرات الركائز = المحفظة كاملة — لا مبادرة يتيمة ولا مكرّرة */
  assert.equal(pills.reduce((a, p) => a + p.total, 0), 18);
});

test("عنوان الركيزة يُقسم على نقطتَي المصدر ويحفظ نوعها (ركيزة/ممكن)", () => {
  const pills = M.pillars(data());
  assert.equal(pills[0].kicker, "ركيزة 1");
  assert.equal(pills[0].title, "زيادة المعروض المرخص");
  assert.equal(pills[0].kind, "ركيزة");
  assert.equal(pills[3].kicker, "ممكن 4");
  assert.equal(pills[3].title, "الحوكمة والنموذج التشغيلي");
  assert.equal(pills[3].kind, "ممكن");
  assert.equal(pills.filter((p) => p.kind === "ركيزة").length, 3);
  assert.equal(pills.filter((p) => p.kind === "ممكن").length, 1);
});

test("التسمية الحرفية للحلقة كما نصّت المواصفة — لا إعادة صياغة", () => {
  assert.equal(M.RING_LABEL, "المنجز من مبادرات الركيزة");
});

test("هندسة الحلقة نقية: صفر = قوس معدوم و100 = قوس كامل", () => {
  const r = 50;
  const c = 2 * Math.PI * r;
  const zero = M.ringDash(0, r);
  assert.ok(Math.abs(zero.circumference - c) < 1e-9);
  assert.ok(Math.abs(zero.offset - c) < 1e-9, "صفر منجز → لا قوس مرسوم");
  const full = M.ringDash(100, r);
  assert.ok(Math.abs(full.offset) < 1e-9);
  const half = M.ringDash(50, r);
  assert.ok(Math.abs(half.offset - c / 2) < 1e-9);
  /* القيم الشاذة تُحصر ولا تُسقط الرسم: null → صفر، و120 → مئة */
  assert.ok(Math.abs(M.ringDash(null, r).offset - c) < 1e-9);
  assert.ok(Math.abs(M.ringDash(120, r).offset) < 1e-9);
  assert.ok(Math.abs(M.ringDash(-40, r).offset - c) < 1e-9);
});

/* ══════════════════════════════════════════════════════════════════════════
   ٤) شريط المبادرة: «مضي المدة الزمنية» — لا ادّعاء إنجاز (V3_SPEC §4-ب)
   ══════════════════════════════════════════════════════════════════════════ */

test("التسميتان الحرفيتان للشريط: مضي المدة الزمنية · وحالة الغياب", () => {
  assert.equal(M.BAR_ELAPSED, "مضي المدة الزمنية");
  assert.equal(M.BAR_NONE, "لا تواريخ في المصدر");
});

test("elapsedOf يحسب المنقضي من المدة ويحصره في [0,100]", () => {
  const calcMs = Date.UTC(2026, 7, 11);
  /* 1.4: 2026-04-01 → 2027-04-30 · 132 يوماً من 394 */
  const run = M.elapsedOf({ start: "2026-04-01", end: "2027-04-30" }, calcMs);
  assert.equal(run.pct, 33.5);
  assert.equal(run.days, 395, "المدة المخططة شاملة الطرفين");
  /* نطاق انقضى كاملاً يُحصر عند مئة ولا يتجاوزها */
  assert.equal(M.elapsedOf({ start: "2026-04-01", end: "2026-04-30" }, calcMs).pct, 100);
  /* نطاق لم يبدأ بعد يُحصر عند صفر ولا ينزل تحته */
  assert.equal(M.elapsedOf({ start: "2026-12-01", end: "2027-01-01" }, calcMs).pct, 0);
  /* نطاق بيوم واحد: لا قسمة على صفر */
  assert.equal(M.elapsedOf({ start: "2026-04-01", end: "2026-04-01" }, calcMs).pct, 100);
  assert.equal(M.elapsedOf({ start: "2027-04-01", end: "2027-04-01" }, calcMs).pct, 0);
  /* غياب أي من التاريخين → لا اشتقاق أصلاً */
  assert.equal(M.elapsedOf({ start: null, end: null }, calcMs), null);
  assert.equal(M.elapsedOf({ start: "2026-04-01", end: null }, calcMs), null);
});

test("barOf: المنجزة 100٪ إنجازاً · المؤرخة زمنٌ مضى · بلا تاريخ لا شريط", () => {
  const done = M.barOf({ status: "منجزة", elapsed: null });
  assert.equal(done.kind, "done");
  assert.equal(done.pct, 100);
  assert.equal(done.caption, M.BAR_DONE);
  assert.equal(done.value, fmt.pct(100));

  const run = M.barOf({ status: "جاري العمل", elapsed: { pct: 33.5 } });
  assert.equal(run.kind, "elapsed");
  assert.equal(run.caption, M.BAR_ELAPSED,
    "التسمية حرفية ولا تذكر إنجازاً");
  assert.equal(run.value, fmt.pct(33.5));

  const none = M.barOf({ status: "لم يتم البدء", elapsed: null });
  assert.equal(none.kind, "none");
  assert.equal(none.pct, null, "لا صفر مختلق مكان الغياب");
  assert.equal(none.caption, M.BAR_NONE);
  assert.equal(none.value, "—");
});

test("لا مبادرة تحمل نسبة إنجاز مخترعة: الإنجاز حكرٌ على المنجزة", () => {
  const rows = M.rows(data());
  for (const r of rows) {
    if (r.status === "منجزة") {
      assert.equal(r.bar.kind, "done");
      assert.equal(r.bar.pct, 100, "المنجزة تُعرض 100٪ إنجازاً");
    } else {
      assert.notEqual(r.bar.kind, "done",
        "«" + r.id + "» غير منجزة فلا تُصنّف إنجازاً");
      assert.equal(r.bar.caption === M.BAR_DONE, false,
        "«" + r.id + "» لا يجوز أن تحمل تسمية إنجاز");
      if (r.dated) assert.equal(r.bar.caption, M.BAR_ELAPSED);
      else assert.equal(r.bar.kind, "none", "بلا تاريخ ⇒ بلا شريط");
    }
  }
});

test("صفوف المحفظة مرتبة بالركيزة ثم بالمعرف عددياً — ترتيب حتمي", () => {
  const rows = M.rows(data());
  assert.equal(rows.length, 18);
  assert.deepEqual(norm(rows.map((r) => r.id)), [
    "1.1", "1.2", "1.3", "1.4", "1.5", "1.6",
    "2.1", "2.2", "2.3", "2.4",
    "3.1", "3.2", "3.3",
    "4.1", "4.2", "4.3", "4.4", "4.5",
  ]);
  /* عيّنات محسوبة من تواريخ المصدر وتاريخ الحساب 2026-08-11 */
  const by = {};
  for (const r of rows) by[r.id] = r;
  assert.equal(by["1.1"].status, "منجزة");
  assert.equal(by["1.1"].dated, false);
  assert.equal(by["1.2"].status, "متأخرة");
  assert.equal(by["1.4"].status, "جاري العمل");
  assert.equal(by["1.4"].bar.pct, 33.5);
  assert.equal(by["4.2"].bar.pct, 78);
  assert.equal(by["4.5"].bar.pct, 56.4);
  assert.equal(by["3.1"].status, "منجزة");
});

test("filterRows يصفّي بالركيزة ويعيد المحفظة كاملة لمعرف مجهول", () => {
  const rows = M.rows(data());
  assert.equal(M.filterRows(rows, "p1").length, 6);
  assert.equal(M.filterRows(rows, "p3").length, 3);
  assert.equal(M.filterRows(rows, "").length, 18);
  assert.equal(M.filterRows(rows, "زائف").length, 18,
    "معرف مجهول يُتجاهل بصمت — لا شاشة فارغة في لوحة عرض");
  assert.notEqual(M.filterRows(rows, ""), rows, "نسخة لا إشارة");
});

/* ══════════════════════════════════════════════════════════════════════════
   ٥) محور الخط الزمني وفهرس صفحة الملحق
   ══════════════════════════════════════════════════════════════════════════ */

test("dayLabel يترجم رقم اليوم إلى شهر عربي من قاعدة النطاق", () => {
  const base = Date.UTC(2026, 3, 1);          // 2026-04-01
  assert.equal(M.dayLabel(base, 0), "أبريل 2026");
  assert.equal(M.dayLabel(base, 91), "يوليو 2026");
  assert.equal(M.dayLabel(base, 394), "أبريل 2027");
  assert.equal(M.dayLabel(NaN, 0), "—", "قاعدة غير صالحة → غياب معلن");
});

test("latePageIndex مرآة ترقيم الملحق (9 صفوف للصفحة)", () => {
  assert.equal(M.latePageIndex(6), 1, "ركيزة بصفحة واحدة → المتأخرات تليها");
  assert.equal(M.latePageIndex(9), 1);
  assert.equal(M.latePageIndex(18), 2, "المحفظة صفحتان → المتأخرات ثالثة");
  assert.equal(M.latePageIndex(19), 3);
  assert.equal(M.latePageIndex(0), 1);
});

/* ══════════════════════════════════════════════════════════════════════════
   ٦) نافذة الإبراز: حد 320 حرفاً · ≤3 أرقام · زر واحد إلى الملحق
   ══════════════════════════════════════════════════════════════════════════ */

test("كل مواصفة إبراز تمر من normalize في الوضع الصارم دون قصّ", () => {
  const release = data();
  const specs = M.allSpecs(release);
  assert.ok(specs.length >= 25, "المواصفات تغطي المحفظة والركائز والحالات");
  for (const spec of specs) {
    const model = HL.normalize(spec, { strict: true });
    assert.ok(model.chars <= HL.MAX_CHARS,
      "«" + spec.title + "» = " + model.chars + " حرفاً");
    assert.equal(model.truncated, false, "«" + spec.title + "» قُصّت");
    assert.equal(model.dropped, 0, "«" + spec.title + "» أُسقط منها رقم");
    assert.ok(model.stats.length <= HL.MAX_STATS);
    assert.ok(model.sentence.length > 0, "جملة واحدة إلزامية");
    /* جملة واحدة لا فقرة: تنتهي بنقطة، ولا فاصل جملة داخلها.
       (النقطة العشرية في «16.7٪» لا تتبعها مسافة فلا تُحسب فاصلاً.) */
    assert.ok(/[.؟!]$/.test(model.sentence),
      "«" + spec.title + "» بلا نقطة ختامية");
    assert.equal(/[.؟!]\s+\S/.test(model.sentence), false,
      "«" + spec.title + "» أكثر من جملة");
    assert.ok(model.appendix && model.appendix.id.indexOf("pillar") === 0,
      "الزر الوحيد يقود إلى ملحق الركائز");
    assert.equal(model.appendix.label, "التفاصيل الكاملة في الملحق");
    assert.ok(spec.note && spec.note.includes(release.meta.data_as_of),
      "وسم الصدق ملازم — وهو خارج حدّ الأحرف");
  }
});

test("وسم الصدق يُصرّح أن الحلقة عددية والشريط زمني — ولا يُحتسب في الحد", () => {
  const release = data();
  const spec = M.pillarSpec(release, "p1");
  assert.ok(spec.note.includes("عدداً"));
  assert.ok(spec.note.includes("لا نسب إنجاز في المصدر"));
  const withNote = HL.measure({
    title: spec.title, sentence: spec.sentence, stats: spec.stats,
  });
  const model = HL.normalize(spec, { strict: true });
  assert.equal(model.chars, withNote, "الوسم خارج الحساب فلا يستهلك الحد");
});

test("مواصفة الركيزة تحمل العدّ الظاهر وتقود إلى ملحق ركيزتها", () => {
  const release = data();
  const spec = M.pillarSpec(release, "p1");
  assert.equal(spec.title, "زيادة المعروض المرخص");
  assert.equal(spec.stats[0].label, M.RING_LABEL);
  assert.equal(spec.stats[0].value, fmt.iso("1 من 6"));
  assert.equal(spec.stats[0].tone, "pos");
  assert.ok(spec.sentence.includes(fmt.pct(16.7)));
  assert.ok(spec.sentence.includes("عدداً لا وزناً"),
    "الجملة تعلن أن النسبة عددية لا موزونة");
  assert.equal(spec.appendix.id, "pillar/p1");

  /* ركيزة بلا منجز: لا نغمة إيجابية ولا ادّعاء تقدم */
  const p2 = M.pillarSpec(release, "p2");
  assert.equal(p2.stats[0].value, fmt.iso("0 من 4"));
  assert.equal(p2.stats[0].tone, null);
  /* معرّف مجهول يسقط على الركيزة الأولى بصمت */
  assert.equal(M.pillarSpec(release, "زائف").appendix.id, "pillar/p1");
});

test("مواصفة المبادرة المؤرخة تعرض تواريخها ونسبة مضي مدتها لا إنجازها", () => {
  const release = data();
  const spec = M.initiativeSpec(release, "1.4");
  assert.equal(spec.title, "تقنين السكن الجماعي غير المرخص");
  assert.equal(spec.stats.length, 3);
  assert.equal(spec.stats[0].label, "البداية");
  assert.equal(spec.stats[0].value, fmt.date("2026-04-01"));
  assert.equal(spec.stats[1].label, "النهاية المخططة");
  assert.equal(spec.stats[2].label, M.BAR_ELAPSED);
  assert.equal(spec.stats[2].value, fmt.pct(33.5));
  assert.ok(spec.sentence.includes("مدتها الزمنية"));
  assert.equal(/إنجاز/.test(spec.sentence), false,
    "لا كلمة إنجاز في وصف مبادرة غير منجزة");
  assert.equal(spec.appendix.id, "pillar/p1");
});

test("مواصفة المبادرة المنجزة بلا تواريخ تُعلن الغياب ولا تخترع نطاقاً", () => {
  const release = data();
  const spec = M.initiativeSpec(release, "1.1");
  assert.equal(spec.title, "دراسة الطلب والعرض على السكن الجماعي للأفراد");
  assert.ok(spec.sentence.includes("بلا نطاق زمني مسجّل في المصدر"));
  assert.deepEqual(norm(spec.stats.map((s) => s.label)),
    ["الحالة", "الركيزة", "التواريخ"]);
  assert.equal(spec.stats[0].value, "منجزة");
  assert.equal(spec.stats[2].value, "غير مدرجة في المصدر");
});

test("مواصفة المتأخرة تصرّح بالحكم وتنقل إلى صفحة المتأخرات في الملحق", () => {
  const release = data();
  const ini = M.initiativeSpec(release, "1.2");
  assert.ok(ini.sentence.includes("تجاوزت نهايتها المخططة دون تسجيل إنجاز"));
  assert.equal(ini.stats[2].tone, "neg");

  const st = M.statusSpec(release, "متأخرة");
  assert.equal(st.title, "متأخرة حكماً");
  assert.equal(st.stats[0].value, fmt.noun(7, "initiative"));
  assert.equal(st.stats[1].value, fmt.pct(38.9));
  assert.equal(st.appendix.id, "pillar");
  assert.deepEqual(norm(st.appendix.params), { page: "2" },
    "18 صفاً ⇒ صفحتان ⇒ المتأخرات في الفهرس 2");

  const done = M.statusSpec(release, "منجزة");
  assert.deepEqual(norm(done.appendix.params), {},
    "الحالات الأخرى تفتح السجل من أوله");
});

test("مواصفة المحفظة تجمع الحالات الثلاث بلا تجاوز حد الأرقام", () => {
  const release = data();
  const spec = M.portfolioSpec(release);
  assert.equal(spec.title, "محفظة المبادرات");
  assert.equal(spec.stats.length, 3);
  assert.deepEqual(norm(spec.stats.map((s) => s.label)),
    ["منجزة", "جاري العمل", "متأخرة حكماً"]);
  assert.deepEqual(norm(spec.stats.map((s) => s.value)), [
    fmt.noun(2, "initiative"),
    fmt.noun(9, "initiative"),
    fmt.noun(7, "initiative"),
  ]);
  assert.ok(spec.sentence.includes(fmt.noun(18, "initiative")));
  assert.ok(spec.sentence.includes(fmt.noun(4, "pillar")));
});

test("كل قيمة داخل المواصفات منسّقة: لا ٪ لاتينية ولا رقم بلا فواصل", () => {
  const release = data();
  for (const spec of M.allSpecs(release)) {
    const text = [spec.title, spec.sentence,
      ...spec.stats.map((s) => s.label + " " + s.value)].join(" ");
    assert.equal(/%/.test(text), false, "«" + spec.title + "» فيها ٪ لاتينية");
    /* السنوات الميلادية (2026/2027) أربع خانات مشروعة — تُستثنى قبل الفحص */
    const bare = text.replace(/,/g, "@").replace(/\b(?:19|20)\d{2}\b/g, "");
    assert.equal(/\d{4,}/.test(bare), false,
      "«" + spec.title + "» فيها رقم بلا فاصل آلاف");
  }
});

test("لا مواصفة تدّعي «نسبة إنجاز» لمبادرة غير منجزة", () => {
  const release = data();
  const rows = M.rows(release);
  for (const r of rows) {
    if (r.status === "منجزة") continue;
    const spec = M.initiativeSpec(release, r.id);
    const text = spec.sentence + " "
      + spec.stats.map((s) => s.label).join(" ");
    assert.equal(/نسبة الإنجاز|إنجاز مسجَّل|أُنجز/.test(text), false,
      "«" + r.id + "» تحمل ادّعاء إنجاز");
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ٧) صفر لون مكتوب (V3_CONTRACTS §1-د) على ملفَّي التبويب
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
  assert.ok(css.includes(".int-"), "البادئة الخاصة مستعملة");
  /* الحلقة والشريط يستمدان لونهما من الرموز الحية فيتبعان السمتين بلا JS */
  assert.ok(/\.int-ring-fill\s*\{[^}]*stroke:\s*var\(--green\)/.test(css),
    "قوس الحلقة بلون رمزي حيّ");
  assert.ok(/\.int-ring-track\s*\{[^}]*stroke:\s*var\(--surface-3\)/.test(css),
    "مسار الحلقة بلون رمزي حيّ");
});

/* ══════════════════════════════════════════════════════════════════════════
   ٨) قانون التلميح وعقود البناء في مصدر التبويب (V3_SPEC §3 · V3_CONTRACTS §2-ب)
   ══════════════════════════════════════════════════════════════════════════ */

test("كل تلميح في التبويب من T.tooltip(su) ومحتواه ttMicro حصراً", () => {
  const src = readFileSync(path.join(ROOT, TAB_FILE), "utf8");
  const tooltips = src.match(/tooltip:/g) || [];
  const lawful = src.match(/Object\.assign\(T\.tooltip\(su\)/g) || [];
  assert.equal(tooltips.length, lawful.length,
    "كل ‎tooltip:‎ يمر من ‎T.tooltip(su)‎");
  assert.equal(lawful.length, 1, "رسم رئيس واحد = تلميح واحد");
  assert.equal((src.match(/T\.ttMicro\(/g) || []).length, 1);
  for (const banned of ["T.ttRow(", "T.ttTitle("]) {
    assert.equal(src.includes(banned), false,
      banned + " ممنوعة في التبويبات — التفاصيل في نافذة الإبراز");
  }
  /* لا ‎echarts.init‎ مباشرة: كل مثيل عبر ‎ctx.chart‎ كي يُتلف مع التبويب */
  assert.equal(src.includes("echarts.init"), false);
  assert.equal((src.match(/ctx\.chart\(/g) || []).length, 1);
  /* الرسم الرئيس بالصنف الملزم ‎.tabchart‎ */
  assert.equal((src.match(/class: "tabchart /g) || []).length, 1);
  /* كل مؤقّت ومستمع وطبقة مسجَّل في تنظيف التبويب */
  assert.ok((src.match(/ctx\.onTeardown\(/g) || []).length >= 4,
    "التنظيف مسجَّل لكل مؤقّت/مستمع/طبقة");
});

test("النصوص الحرفية الملزمة حاضرة في مصدر التبويب", () => {
  const src = readFileSync(path.join(ROOT, TAB_FILE), "utf8");
  assert.ok(src.includes("المنجز من مبادرات الركيزة"));
  assert.ok(src.includes("مضي المدة الزمنية"));
  /* «نسبة الإنجاز» لا ترد إلا في نصوص النفي داخل التعليقات — لا في تسمية */
  assert.equal(/label: "نسبة الإنجاز|caption: "نسبة الإنجاز/.test(src), false);
});
