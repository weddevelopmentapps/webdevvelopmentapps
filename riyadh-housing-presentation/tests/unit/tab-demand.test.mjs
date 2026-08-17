/* tab-demand.test.mjs — بوابات القبول للتبويب ١ «الطلب» (V3_CONTRACTS §7)
   ═══════════════════════════════════════════════════════════════════════
   يُنفَّذ الملف الحقيقي ‎src/js/presenter/tabs/t1-demand.js‎ داخل سياق ‎vm‎
   يحمل السلسلة الدنيا التي يعتمد عليها (‎ns/dom/format/bus/derive/highlight‎)
   مع **سجل تبويبات وهمي** يلتقط تعريف التبويب — فلا نسخة من المنطق ولا
   حاجة إلى قشرة التبويبات ولا إلى ECharts.

   ما تحرسه هذه الاختبارات:
     • عقد التسجيل (‎id/order/title/build‎) والنموذج النقي المكشوف.
     • الاشتقاقات: تقسيم الياقات · ترتيب القطاعات تنازلياً · دلو «قطاعات أخرى»
       (لا ينافس على المراتب، ويبتلع الفائض بعدّ ظاهر).
     • التنسيق: كل رقم عبر ‎RH.core.fmt‎ (فاصل آلاف لاتيني · ‎٪‎ العربية).
     • **حدّ نافذة الإبراز 320 حرفاً** و≤3 أرقام مساندة على كل مواصفة يستطيع
       التبويب فتحها — ‎normalize(spec, {strict:true})‎ يرمي عند أي تجاوز.
     • صفر لون مكتوب في ملفَي التبويب (JS وCSS) — فحص V3_CONTRACTS §1-د. */
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

const TAB_FILE = "src/js/presenter/tabs/t1-demand.js";
const CSS_FILE = "src/styles/tabs/demand.css";

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

/** الحقيقة المرجعية: نسخة جديدة من الإصدار + مشتقاته المحسوبة مركزياً */
function data() {
  const release = freshRelease();
  return { release, derived: RH.data.derive.compute(release) };
}

/* ══════════════════════════════════════════════════════════════════════════
   ١) عقد التسجيل
   ══════════════════════════════════════════════════════════════════════════ */

test("التبويب يسجَّل مرة واحدة بعقد V3_CONTRACTS §4-أ", () => {
  assert.equal(RH.tabs.captured.length, 1, "تسجيل واحد لا أكثر");
  assert.equal(DEF.id, "demand");
  assert.equal(DEF.order, 1);
  assert.equal(DEF.title, "الطلب");
  assert.equal(typeof DEF.build, "function");
  assert.equal(DEF.build.length, 2, "build(el, ctx)");
});

test("النموذج النقي مكشوف للاختبار بكامل دواله", () => {
  for (const k of ["collarSplit", "sectorsByDemand", "topActivities", "figures",
    "totalSpec", "coverageSpec", "collarSpec", "sectorSpec", "activitySpec",
    "allSpecs"]) {
    assert.equal(typeof M[k], "function", "الدالة " + k + " مكشوفة");
  }
  assert.equal(M.AGG_ID, "other");
  assert.equal(M.TOP_N, 5);
});

/* ══════════════════════════════════════════════════════════════════════════
   ٢) تقسيم الياقات
   ══════════════════════════════════════════════════════════════════════════ */

test("collarSplit يعيد القيمتين الخامّتين والحصتين المنشورتين بلا إعادة حساب", () => {
  const { release, derived } = data();
  const c = M.collarSplit(release, derived);

  assert.equal(c.total, 1420000);
  assert.equal(c.exact, true, "زرقاء + بيضاء = إجمالي الطلب");
  assert.equal(c.rows.length, 2);

  const [blue, white] = c.rows;
  assert.equal(blue.id, "blue");
  assert.equal(blue.value, 1164400);
  assert.equal(blue.share, derived.blue_share_pct);
  assert.equal(blue.share, 82.0);
  assert.equal(blue.label, release.metrics.blue_collar.label);

  assert.equal(white.id, "white");
  assert.equal(white.value, 255600);
  assert.equal(white.share, 18.0);
  assert.equal(blue.value + white.value, c.total);
});

test("collarSplit يكشف الانجراف بصدق بدل أن يُخفيه", () => {
  const { release, derived } = data();
  release.collar.white = 1;                 // انجراف مصطنع
  const c = M.collarSplit(release, derived);
  assert.equal(c.exact, false, "المجموع لم يعد يطابق الإجمالي فيُعلَن ذلك");
});

/* ══════════════════════════════════════════════════════════════════════════
   ٣) القطاعات البلدية الخمسة
   ══════════════════════════════════════════════════════════════════════════ */

test("sectorsByDemand يرتّب تنازلياً بالطلب ويحمل التغطية والعجز والحصة", () => {
  const { release, derived } = data();
  const rows = M.sectorsByDemand(release, derived);

  assert.equal(rows.length, 5);
  assert.deepEqual(norm(rows.map((r) => r.id)),
    ["south", "east", "north", "center", "west"]);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].demand >= rows[i].demand, "ترتيب تنازلي محفوظ");
  }

  const south = rows[0];
  assert.equal(south.demand, 368000);
  assert.equal(south.beds, 128000);
  assert.equal(south.coverage_pct, derived.sector.south.coverage_pct);
  assert.equal(south.coverage_pct, 34.8);
  assert.equal(south.deficit_beds, 240000);
  assert.equal(south.demand_share_pct, 25.9);

  assert.equal(rows.reduce((a, r) => a + r.demand, 0),
    release.metrics.total_demand.value, "مجموع القطاعات = إجمالي الطلب");
});

test("sectorsByDemand يكسر التعادل بالمعرف أبجدياً فيبقى الترتيب حتمياً", () => {
  const release = freshRelease();
  for (const s of release.sectors) s.demand = 284000;   // تعادل تام
  const derived = RH.data.derive.compute(release);
  const ids = norm(M.sectorsByDemand(release, derived).map((r) => r.id));
  assert.deepEqual(ids, ids.slice().sort((a, b) => a.localeCompare(b)));
});

/* ══════════════════════════════════════════════════════════════════════════
   ٤) الأنشطة الاقتصادية ودلو «قطاعات أخرى»
   ══════════════════════════════════════════════════════════════════════════ */

test("topActivities على بيانات الإصدار: خمسة أنشطة مفصّلة ودلو التجميع في الذيل", () => {
  const { release } = data();
  const out = M.topActivities(release.economic_activities, 5, "other");

  assert.deepEqual(norm(out.top.map((a) => a.id)),
    ["construction", "retail", "industry", "public-services", "hospitality"]);
  assert.deepEqual(norm(out.top.map((a) => a.demand)),
    [505000, 217000, 198000, 165000, 152000]);

  assert.ok(out.other, "الدلو موجود");
  assert.equal(out.other.id, "other");
  assert.equal(out.other.name, "قطاعات أخرى");
  assert.equal(out.other.demand, 183000);
  assert.equal(out.other.folded, 0, "لا فائض مطوي في بيانات الإصدار");
  assert.equal(out.other.aggregate, true);

  assert.equal(out.total, release.metrics.total_demand.value,
    "المجموع المعاد = إجمالي الطلب المنشور");
  assert.equal(
    out.top.reduce((a, r) => a + r.demand, 0) + out.other.demand,
    out.total, "المعروض لا يفقد سريراً واحداً");
});

test("الدلو لا ينافس على المراتب مهما كبر", () => {
  const rows = [
    { id: "other", name: "قطاعات أخرى", demand: 9_000_000 },
    { id: "a", name: "أ", demand: 10 },
    { id: "b", name: "ب", demand: 20 },
  ];
  const out = M.topActivities(rows, 5, "other");
  assert.deepEqual(norm(out.top.map((a) => a.id)), ["b", "a"]);
  assert.equal(out.other.demand, 9_000_000);
  assert.equal(out.other.folded, 0);
});

test("ما يفيض عن الحد يُطوى داخل الدلو بعدّ ظاهر — لا طلب يختفي", () => {
  const rows = [
    { id: "a", name: "أ", demand: 100 },
    { id: "b", name: "ب", demand: 90 },
    { id: "c", name: "ج", demand: 80 },
    { id: "d", name: "د", demand: 70 },
    { id: "e", name: "هـ", demand: 60 },
    { id: "f", name: "و", demand: 50 },
    { id: "g", name: "ز", demand: 40 },
    { id: "other", name: "قطاعات أخرى", demand: 5 },
  ];
  const out = M.topActivities(rows, 5, "other");
  assert.deepEqual(norm(out.top.map((a) => a.id)), ["a", "b", "c", "d", "e"]);
  assert.equal(out.folded.length, 2);
  assert.equal(out.other.folded, 2);
  assert.equal(out.other.demand, 5 + 50 + 40);
  assert.equal(out.top.reduce((a, r) => a + r.demand, 0) + out.other.demand,
    out.total, "المعروض = مجموع المُدخل");
});

test("بلا دلو في المصدر: يُنشأ دلو للفائض فقط، ولا يُنشأ إن لم يوجد فائض", () => {
  const rows = [
    { id: "a", name: "أ", demand: 3 },
    { id: "b", name: "ب", demand: 2 },
    { id: "c", name: "ج", demand: 1 },
  ];
  const folded = M.topActivities(rows, 2, "other");
  assert.equal(folded.other.name, "قطاعات أخرى");
  assert.equal(folded.other.demand, 1);
  assert.equal(folded.other.folded, 1);

  const none = M.topActivities(rows, 5, "other");
  assert.equal(none.other, null, "لا دلو مخترع حين لا فائض ولا دلو مصدري");
  assert.equal(none.top.length, 3);
});

test("topActivities يتحمّل المدخل الفارغ بلا رمي", () => {
  const empty = M.topActivities([], 5, "other");
  assert.equal(empty.top.length, 0);
  assert.equal(empty.other, null);
  assert.equal(empty.total, 0);
  assert.equal(M.topActivities(null, 5, "other").total, 0);
});

/* ══════════════════════════════════════════════════════════════════════════
   ٥) الأرقام الكبرى — تنسيق عبر fmt حصراً
   ══════════════════════════════════════════════════════════════════════════ */

test("figures يعيد أربع بطاقات بقيم منسّقة عبر RH.core.fmt", () => {
  const { release, derived } = data();
  const figs = M.figures(release, derived);

  assert.equal(figs.length, 4, "أربعة أرقام كبرى — لا شريط مزدحم");
  assert.deepEqual(norm(figs.map((f) => f.id)),
    ["total", "blue", "white", "coverage"]);
  assert.deepEqual(norm(figs.map((f) => f.kind)),
    ["hero", "exact", "exact", "pct"]);

  const [total, blue, white, cov] = figs;

  assert.equal(total.value, "1.42");
  assert.equal(total.word, "مليون");
  assert.equal(total.unit, "سرير");
  /* ‎unitAfter‎ يفصل بمسافة غير قاطعة — تُقارَن عبر الدالة نفسها لا بنص حرفي */
  assert.ok(total.foot.includes(fmt.unitAfter(1420000, "سرير")),
    "القيمة الدقيقة في الذيل");

  /* الموجز الملزم: الياقات بأرقامها الدقيقة لا بصيغة تنفيذية */
  assert.equal(blue.value, "1,164,400");
  assert.equal(white.value, "255,600");
  assert.equal(blue.foot, fmt.pct(82.0) + " من إجمالي الطلب");
  assert.equal(white.foot, fmt.pct(18.0) + " من إجمالي الطلب");

  assert.equal(cov.value, fmt.pct(derived.coverage_pct));
  assert.ok(cov.foot.includes(fmt.unitAfter(612400, "سرير")));

  /* لا رقم بلا تنسيق: فاصل الآلاف اللاتيني و‎٪‎ العربية حصراً */
  for (const f of figs) {
    const text = [f.value, f.foot].join(" ");
    assert.ok(!/%/.test(text), "لا علامة نسبة لاتينية في «" + f.id + "»");
    assert.ok(!/\d{5,}/.test(text.replace(/,/g, "@")),
      "كل رقم طويل مفصول بفواصل في «" + f.id + "»");
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ٦) نافذة الإبراز — الحدّ الصارم 320 حرفاً (بوابة V3_SPEC §5-ج)
   ══════════════════════════════════════════════════════════════════════════ */

test("allSpecs يغطي كل ما يمكن نقره في التبويب", () => {
  const { release, derived } = data();
  const specs = M.allSpecs(release, derived);
  /* 2 (إجمالي + تغطية) + 2 ياقات + 5 قطاعات + 5 أنشطة + دلو = 15 */
  assert.equal(specs.length, 15);
  const titles = specs.map((s) => s.title);
  assert.equal(new Set(titles).size, titles.length, "لا عنوانين متطابقين");
});

test("كل مواصفة إبراز تمر بـ strict دون رمي: ≤320 حرفاً و≤3 أرقام", () => {
  const { release, derived } = data();
  for (const spec of M.allSpecs(release, derived)) {
    const model = HL.normalize(spec, { strict: true });   // يرمي عند التجاوز
    assert.equal(model.truncated, false, "لا قصّ في «" + spec.title + "»");
    assert.equal(model.dropped, 0, "لا إسقاط أرقام في «" + spec.title + "»");
    assert.ok(model.chars <= HL.MAX_CHARS,
      "«" + spec.title + "» = " + model.chars + " حرفاً");
    assert.ok(spec.stats.length <= HL.MAX_STATS);
    assert.ok(spec.sentence.length > 0, "جملة واحدة إلزامية");
    /* جملة **واحدة**: تنتهي بنقطة ولا فاصل جُمَل داخلها (النقطة العشرية
       في «34.8٪» ليست نهاية جملة فلا تُحتسب — الفحص على فاصل الجملة). */
    assert.ok(spec.sentence.endsWith("."), "الجملة مختومة في «" + spec.title + "»");
    assert.equal(/[.؟!؛]\s/.test(spec.sentence), false,
      "جملة واحدة لا أكثر في «" + spec.title + "»");
  }
});

test("كل مواصفة تحمل زراً واحداً إلى ملحق الطلب ووسم صدق خارج الحد", () => {
  const { release, derived } = data();
  for (const spec of M.allSpecs(release, derived)) {
    assert.equal(spec.appendix.id, "demand", "الملحق المختص للتبويب");
    assert.equal(spec.appendix.label, "التفاصيل الكاملة في الملحق");
    assert.ok(spec.note && spec.note.includes(release.meta.data_as_of),
      "وسم «البيانات حتى …» ملازم — وهو خارج حدّ الأحرف");
    const model = HL.normalize(spec, { strict: true });
    assert.ok(model.chars < HL.MAX_CHARS,
      "الوسم لا يُحتسب فيبقى الهامش قائماً");
  }
});

test("مواصفة القطاع صادقة الأرقام وتحمل معرفه إلى الملحق", () => {
  const { release, derived } = data();
  const spec = M.sectorSpec(release, derived, "south");
  assert.equal(spec.title, "قطاع الجنوب");
  assert.deepEqual(norm(spec.appendix.params), { sector: "south" });
  assert.deepEqual(norm(spec.stats.map((s) => s.value)), [
    fmt.unitAfter(368000, "سرير"),
    fmt.unitAfter(128000, "سرير"),
    fmt.unitAfter(240000, "سرير"),
  ]);
  assert.deepEqual(norm(spec.stats.map((s) => s.tone || null)),
    [null, "pos", "neg"]);
  assert.ok(spec.sentence.includes(fmt.pct(34.8)), "نسبة التغطية في الجملة");
});

test("مواصفة الدلو تُعلن أنها تجميع ولا تدّعي رتبة", () => {
  const { release, derived } = data();
  const spec = M.activitySpec(release, derived, "other");
  assert.equal(spec.title, "قطاعات أخرى");
  assert.ok(spec.sentence.includes("تجميع"), "التجميع مُعلن في الجملة");
  assert.equal(spec.stats.length, 2, "لا رتبة لدلو تجميع");
  assert.ok(!spec.stats.some((s) => s.label === "الترتيب"));
  assert.ok(spec.note.includes("تجميع لا نشاط منفرد"));
  assert.deepEqual(norm(spec.appendix.params), { activity: "other" });
});

test("مواصفة نشاط مفصّل تحمل رتبته الحقيقية من الترتيب التنازلي", () => {
  const { release, derived } = data();
  const first = M.activitySpec(release, derived, "construction");
  assert.equal(first.title, "التشييد والبناء");
  assert.ok(first.sentence.includes("المرتبة 1"));
  assert.equal(first.stats[2].label, "الترتيب");
  assert.equal(first.stats[2].value, fmt.iso("1 من 5"));

  const last = M.activitySpec(release, derived, "hospitality");
  assert.ok(last.sentence.includes("المرتبة 5"));
  assert.equal(last.stats[0].value, fmt.unitAfter(152000, "سرير"));
});

test("مواصفة الياقات تذكر الفئة المقابلة كرقم ثالث لا كجملة ثانية", () => {
  const { release, derived } = data();
  const blue = M.collarSpec(release, derived, "blue");
  assert.equal(blue.title, "الياقات الزرقاء");
  assert.equal(blue.stats.length, 3);
  assert.equal(blue.stats[2].label, "الياقات البيضاء");
  assert.equal(blue.stats[2].value, fmt.unitAfter(255600, "سرير"));

  const white = M.collarSpec(release, derived, "white");
  assert.equal(white.stats[2].label, "الياقات الزرقاء");
  /* معرّف مجهول يسقط على الفئة الأولى بصمت — لا شاشة خطأ في لوحة عرض */
  assert.equal(M.collarSpec(release, derived, "زائف").title, "الياقات الزرقاء");
});

test("كل قيمة داخل المواصفات منسّقة: لا ٪ لاتينية ولا رقم بلا فواصل", () => {
  const { release, derived } = data();
  for (const spec of M.allSpecs(release, derived)) {
    const text = [spec.title, spec.sentence,
      ...spec.stats.map((s) => s.label + " " + s.value)].join(" ");
    assert.ok(!/%/.test(text), "«" + spec.title + "» فيها ٪ لاتينية");
    assert.ok(!/\d{4,}/.test(text.replace(/,/g, "@")),
      "«" + spec.title + "» فيها رقم بلا فاصل آلاف");
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
  /* لا قاعدة تبدأ بصنف من ملكية tabs.css — التزيين يمر عبر ‎.dmt-*‎ */
  for (const owned of [".tabchart", ".tabgrid", ".tabcard", ".tabfigs", ".tabfig"]) {
    const re = new RegExp("(^|[},]\\s*)\\" + owned + "[\\s,{]", "m");
    assert.equal(re.test(css), false,
      "قاعدة تبدأ بـ" + owned + " — أصناف القشرة لا تُعاد كتابتها");
  }
  assert.ok(css.includes(".dmt-"), "البادئة الخاصة مستعملة");
});

/* ══════════════════════════════════════════════════════════════════════════
   ٨) قانون التلميح في مصدر التبويب (V3_SPEC §3)
   ══════════════════════════════════════════════════════════════════════════ */

test("كل تلميح في التبويب من T.tooltip(su) ومحتواه ttMicro حصراً", () => {
  const src = readFileSync(path.join(ROOT, TAB_FILE), "utf8");
  const tooltips = src.match(/tooltip:/g) || [];
  const lawful = src.match(/Object\.assign\(T\.tooltip\(su\)/g) || [];
  assert.equal(tooltips.length, lawful.length,
    "كل ‎tooltip:‎ يمر من ‎T.tooltip(su)‎");
  assert.equal(lawful.length, 3, "ثلاثة رسوم = ثلاثة تلميحات");
  assert.equal((src.match(/T\.ttMicro\(/g) || []).length, 3);
  for (const banned of ["T.ttRow(", "T.ttTitle("]) {
    assert.equal(src.includes(banned), false,
      banned + " ممنوعة في التبويبات — التفاصيل في نافذة الإبراز");
  }
  /* لا ‎echarts.init‎ مباشرة: كل مثيل عبر ‎ctx.chart‎ كي يُتلف مع التبويب */
  assert.equal(src.includes("echarts.init"), false);
  assert.equal((src.match(/ctx\.chart\(/g) || []).length, 3);
  /* كل رسم رئيس بالصنف ‎.tabchart‎ */
  assert.equal((src.match(/class: "tabchart /g) || []).length, 3);
});
