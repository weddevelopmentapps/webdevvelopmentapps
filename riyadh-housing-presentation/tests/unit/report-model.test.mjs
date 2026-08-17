/* report-model.test.mjs — نموذج الموجز التنفيذي ومحرك ترقيمه
   ═══════════════════════════════════════════════════════════════════════════
   ما يُثبَت هنا هو ما لا يجوز أن ينكسر بتعديل عرضي:

   • **وسوم الصدق جزء من النموذج** — منهجية 81.6٪ على صفحة الرقابة، وcaveat
     السيناريوهات نصاً كاملاً على صفحة التوقعات، ووسم العينة مع كل جدول أحياء،
     وتنويه الخريطة وإسناد الحدود، وغياب القيم الحالية للمؤشرات معلَناً نصاً.
     الفحص على النموذج النقي لا على شجرة DOM، فلا يمكن إسقاط وسم بتغيير قالب.

   • **حصر الصفحات** — الغلاف وصفحة الإسناد لا يُسقطان مهما كان ‎?pages=،
     والمعرفات المجهولة تُرفض دون إسقاط المستند.

   • **اشتقاق الحالات** — قاعدة «متأخرة حكماً» تُعطي 2 منجزة / 9 جاري العمل /
     7 متأخرة على الإصدار المرجعي (الأعداد المثبتة بالبوابات).

   • **حساب الترقيم** — تقسيم الجداول لا يفقد صفاً ولا يكرره، والوسم يتكرر مع
     كل قطعة، وكل ورقة يبقى محتواها داخل حد القص المحسوب.

   الوحدة نقية بالكامل (لا DOM)، لكن ملفاتها تُحمَّل بترتيب build.py الحقيقي
   داخل سياق vm واحد — كوسوم <script> متتالية — كي تُختبر الملفات المُسلَّمة
   نفسها لا نسخة منها. `load-app.mjs` يملكه معمار التوسعة ولا يعدّله وكيل
   ميزة، لذا هذا الملف يحمل محمّله الخاص المكافئ. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/* ── ترتيب التحميل = ترتيب الضم في build.py لهذه السلسلة ────────────────── */
const JS_ORDER = [
  "src/js/core/ns.js",
  "src/js/core/dom.js",
  "src/js/core/format.js",
  "src/js/core/bus.js",
  "src/js/data/derive.js",
  "src/js/viz/charts-micro.js",
  "src/js/report/report-charts.js",
  "src/js/report/report-pages.js",
  "src/js/report/report.js",
];

/* ── محاكاة DOM دنيا: تكفي h()/svg()/clear ولا تنفّذ عرضاً ─────────────── */
class FakeNode {
  constructor() { this.childNodes = []; this.parentNode = null; }
  appendChild(c) { this.childNodes.push(c); c.parentNode = this; return c; }
  removeChild(c) {
    const i = this.childNodes.indexOf(c);
    if (i !== -1) this.childNodes.splice(i, 1);
    c.parentNode = null;
    return c;
  }
  get firstChild() { return this.childNodes.length ? this.childNodes[0] : null; }
}
class FakeText extends FakeNode {
  constructor(t) { super(); this.textContent = String(t); }
}
class FakeElement extends FakeNode {
  constructor(tag, ns) {
    super();
    this.tagName = String(tag).toUpperCase();
    this.namespaceURI = ns || null;
    this.attributes = Object.create(null);
    this.style = { setProperty() {} };
    this.dataset = {};
    this.className = "";
    this.textContent = "";
    this.hidden = false;
    this.classList = { add() {}, remove() {}, toggle() {}, contains: () => false };
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; }
  removeAttribute(k) { delete this.attributes[k]; }
  hasAttribute(k) { return k in this.attributes; }
  addEventListener() {}
  removeEventListener() {}
  closest() { return null; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}
const documentMock = {
  createElement: (t) => new FakeElement(t),
  createElementNS: (ns, t) => new FakeElement(t, ns),
  createTextNode: (t) => new FakeText(t),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  body: new FakeElement("body"),
};
const win = {
  location: { hash: "", href: "https://unit.test/index.html", search: "" },
  innerWidth: 1440,
  addEventListener() {},
  removeEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
};

const sandbox = {
  window: win,
  document: documentMock,
  location: win.location,
  Node: FakeNode,
  console,
  setTimeout,
  clearTimeout,
  URL,
  URLSearchParams,
};
const context = vm.createContext(sandbox);
for (const rel of JS_ORDER) {
  const file = path.join(ROOT, rel);
  vm.runInContext(readFileSync(file, "utf8"), context, { filename: file });
}
const RH = vm.runInContext("RH;", context);

const P = RH.report.pages;
const C = RH.report.charts;
const fmt = RH.core.fmt;

/** يطبّع كائناً وُلد داخل سياق vm إلى عالم الاختبار: البروتوتايب مختلف عبر
    العالمين فيفشل deepStrictEqual رغم تطابق البنية — الاستنساخ البنيوي يعيد
    البناء بكائنات العالم الحالي دون مساس بالقيم. */
const norm = (x) => structuredClone(x);

const releaseText = readFileSync(path.join(ROOT, "data", "release.json"), "utf8");
const freshRelease = () => JSON.parse(releaseText);
const geoText = readFileSync(path.join(ROOT, "data", "riyadh-geo.json"), "utf8");
const freshGeo = () => JSON.parse(geoText);

/* حقيقة مرجعية واحدة تُعاد بناؤها لكل حزمة اختبار تحتاج تعديلاً */
const REL = freshRelease();
const DER = RH.data.derive.compute(REL);
const GEO = freshGeo();
const NOW = "2026-08-17T09:00:00.000Z";

/** النموذج الكامل (كل الصفحات) — يُبنى مرة ويُقرأ كثيراً */
const FULL = P.model(REL, DER, { geo: GEO, now: NOW });

/** كل نصوص صفحة مجمّعة — للبحث عن وسم داخل أي موضع منها */
function pageText(page) {
  const bits = [];
  for (const f of page.figures || []) {
    bits.push(f.label, f.value, f.unit || "", f.note || "");
  }
  for (const c of page.charts || []) bits.push(c.caption || "", c.caveat || "");
  for (const i of page.insights || []) bits.push(i.title, i.text);
  for (const cv of page.caveats || []) bits.push(String(cv));
  for (const t of page.tables || []) {
    bits.push(t.title, t.note || "");
    for (const r of t.rows || []) {
      for (const cell of r) bits.push(typeof cell === "object" && cell ? cell.text : String(cell));
    }
  }
  return bits.join("\n");
}

const pagesById = (m, id) => m.pages.filter((p) => p.id === id);
const onePage = (m, id) => {
  const list = pagesById(m, id);
  assert.equal(list.length, 1, "توقعت صفحة واحدة بالمعرف " + id);
  return list[0];
};

/* ══════════════════════════════════════════════════════════════════════════
   1) القائمة القانونية للصفحات وحصر الاختيار
   ══════════════════════════════════════════════════════════════════════════ */

test("قائمة الصفحات القانونية 12 معرفاً بالترتيب المعتمد", () => {
  assert.deepEqual(norm(P.PAGE_IDS), [
    "cover", "summary", "demand", "licensing", "control", "map",
    "initiatives", "kpis", "forecast", "closing", "appendix-tables", "provenance",
  ]);
  assert.equal(new Set(P.PAGE_IDS).size, P.PAGE_IDS.length, "معرف مكرر");
});

test("الغلاف وصفحة الإسناد إلزاميان وخارج قائمة الحصر", () => {
  assert.deepEqual(norm(P.MANDATORY_PAGE_IDS), ["cover", "provenance"]);
  for (const id of P.MANDATORY_PAGE_IDS) {
    assert.equal(P.SECTION_PAGE_IDS.indexOf(id), -1,
      id + " يجب ألا يكون قابلاً للحصر");
  }
  assert.equal(P.SECTION_PAGE_IDS.length, 10);
});

test("اختيار غائب أو فارغ = كل صفحات الأقسام", () => {
  assert.deepEqual(P.normalizePages(null), P.SECTION_PAGE_IDS.slice());
  assert.deepEqual(P.normalizePages(""), P.SECTION_PAGE_IDS.slice());
  assert.deepEqual(P.normalizePages([]), P.SECTION_PAGE_IDS.slice());
  assert.deepEqual(P.normalizePages("  "), P.SECTION_PAGE_IDS.slice());
});

test("الاختيار يُرتَّب بالترتيب القانوني لا بترتيب كتابته", () => {
  assert.deepEqual(norm(P.normalizePages("control,demand,summary")),
    ["summary", "demand", "control"]);
  assert.deepEqual(norm(P.normalizePages(["kpis", "map"])), ["map", "kpis"]);
});

test("التكرار يُطوى والمسافات تُشذَّب", () => {
  assert.deepEqual(norm(P.normalizePages(" demand , demand ,demand")), ["demand"]);
});

test("المعرفات المجهولة تُسقَط ولا تُسقط المستند، وتُعلن بصدق", () => {
  assert.deepEqual(norm(P.normalizePages("demand,zzz,control")), ["demand", "control"]);
  assert.deepEqual(norm(P.rejectedPages("demand,zzz,control,qqq")), ["zzz", "qqq"]);
  assert.deepEqual(norm(P.rejectedPages("demand")), []);
});

test("محاولة حصر الاختيار في صفحة إلزامية ترتد إلى كل الصفحات", () => {
  assert.deepEqual(norm(P.normalizePages("cover")), norm(P.SECTION_PAGE_IDS));
  assert.deepEqual(norm(P.normalizePages("provenance,cover")), norm(P.SECTION_PAGE_IDS));
  assert.deepEqual(norm(P.rejectedPages("cover")), ["cover"]);
});

test("تسلسل الاختيار: الكامل يعطي نصاً فارغاً فلا معامل زائد في العنوان", () => {
  assert.equal(P.serializePages(null), "");
  assert.equal(P.serializePages(P.SECTION_PAGE_IDS.slice()), "");
  assert.equal(P.serializePages("control,demand"), "demand,control");
  assert.equal(P.isRestricted(null), false);
  assert.equal(P.isRestricted(["control"]), true);
});

/* ══════════════════════════════════════════════════════════════════════════
   2) اشتقاق حالة المبادرات — قاعدة «متأخرة حكماً»
   ══════════════════════════════════════════════════════════════════════════ */

test("الحالة المصرّحة في المصدر تسبق أي اشتقاق", () => {
  assert.equal(
    P.initiativeStatus({ status: "منجزة", start: "2020-01-01", end: "2020-02-01" },
      "2026-08-11"),
    "منجزة");
});

test("نهاية قبل تاريخ الحساب بلا إنجاز = متأخرة حكماً", () => {
  assert.equal(
    P.initiativeStatus({ start: "2026-04-01", end: "2026-07-31" }, "2026-08-11"),
    "متأخرة");
});

test("بدأت ولم تنته بعد = جاري العمل", () => {
  assert.equal(
    P.initiativeStatus({ start: "2026-04-01", end: "2027-04-30" }, "2026-08-11"),
    "جاري العمل");
});

test("لم يحن بدؤها = لم يتم البدء", () => {
  assert.equal(
    P.initiativeStatus({ start: "2026-12-01", end: "2027-01-31" }, "2026-08-11"),
    "لم يتم البدء");
});

test("النهاية في يوم الحساب نفسه ليست تأخراً (المقارنة صارمة)", () => {
  assert.equal(
    P.initiativeStatus({ start: "2026-01-01", end: "2026-08-11" }, "2026-08-11"),
    "جاري العمل");
});

test("توزيع الحالات على الإصدار المرجعي = 2 منجزة / 9 جاري / 7 متأخرة", () => {
  const st = REL.strategy;
  const counts = P.statusCounts(st.initiatives, REL.meta.calculation_date,
    st.status_vocabulary);
  assert.deepEqual(norm(counts), {
    "منجزة": 2, "جاري العمل": 9, "متأخرة": 7, "لم يتم البدء": 0,
  });
  const sum = Object.keys(counts).reduce((a, k) => a + counts[k], 0);
  assert.equal(sum, st.initiatives.length, "المجموع لا يساوي عدد المبادرات");
});

test("توزيع الحالات يبدأ من مفردات الإصدار كاملة ولو كان بعضها صفراً", () => {
  const counts = P.statusCounts([], "2026-08-11", ["منجزة", "متأخرة"]);
  assert.deepEqual(norm(counts), { "منجزة": 0, "متأخرة": 0 });
});

/* ══════════════════════════════════════════════════════════════════════════
   3) سلسلة التغطية وقيم المؤشرات
   ══════════════════════════════════════════════════════════════════════════ */

test("سلسلة التغطية 12 نقطة وآخرها = نسبة التغطية المنشورة", () => {
  const cs = P.coverageSeries(REL);
  assert.equal(cs.pts.length, 12);
  assert.equal(cs.last, DER.coverage_pct);
  assert.equal(cs.cums[cs.cums.length - 1], REL.metrics.licensed_beds.value);
});

test("قيمة مؤشر نسبية تُضرب في مئة وتحمل علامة ٪ العربية المعزولة", () => {
  assert.equal(P.kpiValue({ pct: true }, 0.8), fmt.pct(80));
  assert.equal(P.kpiValue({ pct: true }, 0.15), fmt.pct(15));
});

test("قيمة مؤشر عددية بفاصل الآلاف اللاتيني", () => {
  assert.equal(P.kpiValue({ pct: false }, 260000), "260,000");
});

test("القيمة الحالية الغائبة تُعلن غيابها بالصيغة المعتمدة حرفياً", () => {
  assert.equal(P.KPI_MISSING, "تُسجَّل من المنصة — غير متوفرة");
  assert.equal(P.kpiValue({ pct: true }, null), P.KPI_MISSING);
  assert.equal(P.kpiValue({ pct: false }, undefined), P.KPI_MISSING);
  assert.equal(P.kpiValue({ pct: false }, NaN), P.KPI_MISSING);
});

test("ملخص المحفظة: 14 مؤشراً كلها بلا قيمة حالية", () => {
  const ks = P.kpiSummary(REL);
  assert.equal(ks.total, 14);
  assert.equal(ks.missingCurrent, 14);
  assert.equal(ks.availableCurrent, 0);
  assert.equal(ks.pctKind + ks.countKind, 14);
});

/* ══════════════════════════════════════════════════════════════════════════
   4) وسوم الصدق داخل النموذج — العقد الأصعب
   ══════════════════════════════════════════════════════════════════════════ */

test("منهجية 81.6٪ تلازم صفحة الرقابة نصاً وحالةً", () => {
  const page = onePage(FULL, "control");
  const joined = page.caveats.join("\n");
  assert.ok(joined.includes(REL.compliance.note), "نص المنهجية غائب عن وسوم الصفحة");
  assert.ok(joined.includes("بانتظار اعتماد المنهجية"), "حالة القيمة غير معلنة");
  assert.ok(joined.includes(fmt.pct(REL.compliance.value)), "القيمة 81.6٪ غائبة عن الوسم");
});

test("رسم الامتثال نفسه يحمل الوسم — الوسم يسافر مع الرقم لا مع الصفحة فقط", () => {
  const page = onePage(FULL, "control");
  const comp = page.charts.find((c) => c.builder === "complianceCard");
  assert.ok(comp, "رسم الامتثال غائب عن صفحة الرقابة");
  assert.ok(comp.caveat && comp.caveat.includes(REL.compliance.note));
});

test("caveat السيناريوهات يلازم صفحة التوقعات نصاً كاملاً بلا اختصار", () => {
  const page = onePage(FULL, "forecast");
  const joined = page.caveats.join("\n");
  assert.ok(joined.includes(REL.scenarios.caveat), "نص الـcaveat غير كامل");
  const chart = page.charts.find((c) => c.builder === "forecastScenarios");
  assert.ok(chart.caveat.includes(REL.scenarios.caveat));
  assert.ok(page.tables[0].note.includes(REL.scenarios.caveat),
    "جدول السيناريوهات بلا وسمه");
});

test("صفحة التوقعات تعلن منع الاستيفاء والامتداد خارج الأشهر المورّدة", () => {
  const page = onePage(FULL, "forecast");
  assert.ok(page.caveats.some((c) => c.includes("لا استيفاء")));
});

test("صفحة الخريطة تحمل تنويه الخريطة وسطر إسناد الحدود", () => {
  const page = onePage(FULL, "map");
  const joined = page.caveats.join("\n");
  assert.ok(joined.includes(REL.meta.map_disclaimer), "تنويه الخريطة غائب");
  assert.ok(joined.includes(P.BOUNDARY_ATTRIB), "سطر إسناد الحدود غائب");
});

test("كل جدول أحياء يحمل وسم العينة في ملاحظته", () => {
  const sample = P.sampleCaveat(REL);
  assert.ok(sample.includes(REL.meta.sample_label));
  const districtTables = [];
  for (const page of FULL.pages) {
    for (const t of page.tables) {
      if (/حي |الأحياء/.test(t.title)) districtTables.push({ page: page.id, t });
    }
  }
  assert.ok(districtTables.length >= 2, "لم يُعثر على جداول أحياء");
  for (const { page, t } of districtTables) {
    assert.ok(t.note && t.note.includes(REL.meta.sample_label),
      "جدول أحياء بلا وسم العينة في صفحة " + page + ": " + t.title);
  }
});

test("صفحة المؤشرات تعلن غياب القيم الحالية في الأرقام والجدول والوسوم", () => {
  const page = onePage(FULL, "kpis");
  assert.ok(page.caveats.join("\n").includes(P.KPI_MISSING));
  const t = page.tables[0];
  const currentIdx = t.columns.findIndex((c) => c.label === "القيمة الحالية");
  assert.ok(currentIdx > 0);
  assert.equal(t.rows.length, 14);
  for (const row of t.rows) {
    const cellValue = row[currentIdx];
    assert.equal(typeof cellValue === "object" ? cellValue.text : cellValue,
      P.KPI_MISSING, "خلية قيمة حالية لا تعلن غيابها");
  }
});

test("المستهدف الاسترشادي 60٪ يحمل وسمه أينما ظهر رسم التغطية", () => {
  const page = onePage(FULL, "summary");
  const cov = page.charts.find((c) => c.builder === "coverageEvolution");
  assert.ok(cov.caveat && cov.caveat.includes(REL.coverage_target_indicative.note));
  assert.ok(cov.caveat.includes("استرشادية غير معتمدة"));
});

test("سجلات الحجر وسمٌ صريح، وأرقامها لا تُعرض قيمةً في رقم بارز أو جدول", () => {
  const page = onePage(FULL, "control");
  const reason = REL.quarantine.inspector_level_records.reason;
  assert.ok(page.caveats.join("\n").includes(reason),
    "سبب الحجر غائب عن وسوم صفحة الرقابة");

  /* الأرقام المحجورة مذكورة داخل نص السبب نفسه (وهذا مقصود: الوسم يشرح
     التعارض)، لكنها ممنوعة أن تظهر كقيمة معروضة — لا في رقم بارز ولا خلية. */
  const banned = ["37,322", "7,409"];
  const values = [];
  for (const p of FULL.pages.concat([FULL.provenancePage])) {
    for (const f of p.figures) values.push(f.value, f.unit || "", f.note || "");
    for (const t of p.tables) {
      for (const r of t.rows) {
        for (const c of r) values.push(typeof c === "object" && c ? c.text : String(c));
      }
    }
  }
  const joined = values.join("\n");
  for (const b of banned) {
    assert.ok(!joined.includes(b), "رقم محجور معروض كقيمة: " + b);
  }
  /* وفي المقابل: الإجماليات المعتمدة حاضرة فعلاً */
  assert.ok(joined.includes(fmt.int(REL.metrics.total_visits.value)));
  assert.ok(joined.includes(fmt.int(REL.metrics.total_violations.value)));
});

test("مصدر طبقة الاستراتيجية وقاعدة الحالة يلازمان صفحة المبادرات", () => {
  const page = onePage(FULL, "initiatives");
  const joined = page.caveats.join("\n");
  assert.ok(joined.includes(REL.strategy.source));
  assert.ok(joined.includes(REL.strategy.status_rule));
});

/* ══════════════════════════════════════════════════════════════════════════
   5) بنية النموذج — الحدود المعلنة في العقد
   ══════════════════════════════════════════════════════════════════════════ */

test("الغلاف يحمل الهوية والبصمة وحداثة البيانات ولحظة التوليد", () => {
  assert.equal(FULL.cover.title, REL.meta.title);
  assert.equal(FULL.cover.releaseId, REL.release.id);
  assert.equal(FULL.cover.dataAsOf, REL.meta.data_as_of);
  assert.equal(FULL.cover.generatedAt, new Date(NOW).toISOString());
  assert.equal(FULL.cover.sha256Short, REL.release.sha256.slice(0, 12));
  assert.equal(FULL.cover.sha256Short.length, 12);
});

test("الجهة الغائبة تبقى null — لا اسم مختلق على الغلاف", () => {
  assert.equal(REL.meta.entity, null);
  assert.equal(FULL.cover.entity, null);
});

test("لحظة التوليد قابلة للحقن فيكون النموذج حتمياً", () => {
  const a = P.model(REL, DER, { now: "2026-01-01T00:00:00.000Z" });
  const b = P.model(REL, DER, { now: "2026-01-01T00:00:00.000Z" });
  assert.equal(a.cover.generatedAt, b.cover.generatedAt);
  assert.equal(JSON.stringify(a.pages), JSON.stringify(b.pages));
});

test("كل صفحة قسم بين 0 و6 أرقام بارزة، و0..2 رسم، و0..2 جدول", () => {
  for (const page of FULL.pages) {
    assert.ok(page.figures.length <= 6,
      page.id + ": " + page.figures.length + " رقماً بارزاً (الحد 6)");
    assert.ok(page.charts.length <= 2, page.id + ": رسوم أكثر من اثنين");
    assert.ok(page.tables.length <= 2, page.id + ": جداول أكثر من اثنين");
  }
});

test("صفحات الأقسام التسعة تحمل 3 أرقام بارزة على الأقل", () => {
  for (const page of FULL.pages) {
    if (page.id === "appendix-tables") continue;   // صفحات جداول صرفة
    assert.ok(page.figures.length >= 3,
      page.id + ": أقل من ثلاثة أرقام بارزة");
  }
});

test("كل مُنشئ رسم مطلوب من القائمة القانونية للرسوم", () => {
  let n = 0;
  for (const page of FULL.pages) {
    for (const c of page.charts) {
      assert.ok(C.isLegal(c.builder), "مُنشئ خارج القائمة: " + c.builder);
      assert.ok(c.caption && c.caption.length > 0, "رسم بلا تسمية: " + c.builder);
      n += 1;
    }
  }
  assert.ok(n >= 12, "عدد الرسوم في الموجز أقل من المتوقع: " + n);
});

test("قيم الأرقام البارزة منسّقة سلفاً نصاً — لا رقم خام يتسرب للعرض", () => {
  for (const page of FULL.pages) {
    for (const f of page.figures) {
      assert.equal(typeof f.value, "string", page.id + "/" + f.label);
      assert.equal(typeof f.label, "string");
      if (f.tone) assert.ok(typeof f.tone === "string");
    }
  }
});

test("الرؤى منقولة حرفياً من لوحات الرؤى المعتمدة", () => {
  const src = REL.insight_panels.sections;
  for (const [pageId, key] of Object.entries(P.INSIGHT_KEY)) {
    const page = onePage(FULL, pageId);
    assert.equal(page.insights.length, src[key].length, pageId);
    page.insights.forEach((ins, i) => {
      assert.equal(ins.title, src[key][i].title);
      assert.equal(ins.text, src[key][i].text);
      assert.equal(ins.cls, src[key][i].cls);
    });
  }
});

test("الصفحات بلا لوحة رؤى معتمدة تخرج بمصفوفة فارغة لا بلوحة مختلقة", () => {
  for (const id of ["demand", "map", "kpis", "forecast", "closing"]) {
    for (const page of pagesById(FULL, id)) {
      assert.deepEqual(norm(page.insights), [], id + " اخترع رؤى");
    }
  }
});

test("جداول الملاحق ورقتان منطقيتان بالمعرف نفسه وأربعة جداول", () => {
  const list = pagesById(FULL, "appendix-tables");
  assert.equal(list.length, 2);
  assert.equal(list[0].tables.length + list[1].tables.length, 4);
  const titles = list.flatMap((p) => p.tables.map((t) => t.title));
  assert.ok(titles.some((t) => t.includes("القطاعات")));
  assert.ok(titles.some((t) => t.includes("الأحياء")));
  assert.ok(titles.some((t) => t.includes("المبادرات")));
  assert.ok(titles.some((t) => t.includes("مؤشرات")));
});

test("جدول المبادرات يعرض الثمانية عشر بحالاتها المشتقة", () => {
  const list = pagesById(FULL, "appendix-tables");
  const t = list[1].tables.find((x) => x.title.includes("المبادرات"));
  assert.equal(t.rows.length, 18);
  const statuses = t.rows.map((r) => r[5].text);
  assert.equal(statuses.filter((s) => s === "منجزة").length, 2);
  assert.equal(statuses.filter((s) => s === "متأخرة").length, 7);
  assert.equal(statuses.filter((s) => s === "جاري العمل").length, 9);
});

test("جدول عينة الأحياء يعرض كل صفوف العينة العشرين", () => {
  const list = pagesById(FULL, "appendix-tables");
  const t = list[0].tables.find((x) => x.title.includes("الأحياء"));
  assert.equal(t.rows.length, REL.neighbourhoods.rows.length);
});

test("الحصر يقلّص صفحات الأقسام ويبقي الغلاف والإسناد", () => {
  const m = P.model(REL, DER, { pages: "control,forecast", now: NOW });
  assert.deepEqual(norm(m.pages.map((p) => p.id)), ["control", "forecast"]);
  assert.ok(m.cover, "الغلاف أُسقط");
  assert.ok(m.provenance, "الإسناد أُسقط");
  assert.ok(m.provenancePage, "صفحة الإسناد أُسقطت");
  assert.equal(m.cover.restricted, true);
  assert.deepEqual(norm(m.cover.selectedPages), ["control", "forecast"]);
});

test("النموذج يرفض غياب الإصدار برسالة عربية لا بانهيار صامت", () => {
  assert.throws(() => P.model(null, DER, {}), /إصدار/);
});

test("غياب طبقة الجغرافيا يظهر بصدق لا بقيمة مختلقة", () => {
  const m = P.model(REL, DER, { pages: "map", now: NOW });   // بلا geo
  const page = onePage(m, "map");
  const districts = page.figures.find((f) => f.label === "الأحياء المرسومة");
  assert.equal(districts.value, "—");
  assert.ok(districts.note.includes("غير مضمّنة"));
  const withGeo = onePage(FULL, "map");
  assert.equal(withGeo.figures.find((f) => f.label === "الأحياء المرسومة").value,
    fmt.int(189));
});

/* ══════════════════════════════════════════════════════════════════════════
   6) الإسناد — أصل كل رقم
   ══════════════════════════════════════════════════════════════════════════ */

test("الإسناد يوثق كل مقياس خام بورقته ومرساته", () => {
  const prov = FULL.provenance;
  const raws = prov.metrics.filter((m) => m.kind === "raw");
  assert.equal(raws.length, Object.keys(REL.metrics).length);
  for (const m of raws) {
    const src = REL.metrics[m.id];
    assert.equal(m.origin, src.sheet + "!" + src.anchor, m.id);
    assert.equal(m.label, src.label);
  }
});

test("الإسناد يوثق كل مقياس مشتق بصيغته — والتجميعات بلا صيغة تُستبعد", () => {
  const prov = FULL.provenance;
  const derivedIds = Object.keys(REL.derived).filter((k) => REL.derived[k].formula);
  const got = prov.metrics.filter((m) => m.kind === "derived");
  assert.equal(got.length, derivedIds.length);
  for (const m of got) {
    assert.ok(m.origin.startsWith("مشتق ("), m.id);
    assert.ok(m.origin.includes(REL.derived[m.id].formula), m.id);
  }
  assert.ok(!got.some((m) => m.id === "sector_derived"));
  assert.ok(!got.some((m) => m.id === "rankings"));
});

test("عداد البوابات صادق: 152/152 بلا إنذار مفتوح", () => {
  assert.deepEqual(
    norm({ total: FULL.provenance.gates.total, passed: FULL.provenance.gates.passed,
      warnings: FULL.provenance.gates.warnings }),
    { total: 152, passed: 152, warnings: 0 });
});

test("عداد البوابات لا يخفي فشلاً: إنذار مفتوح يظهر عدداً", () => {
  const rel = freshRelease();
  rel.validation.gates_passed = 150;
  const prov = P.provenance(rel, RH.data.derive.compute(rel));
  assert.equal(prov.gates.warnings, 2);
});

test("قرارات المنهجية تُحيل إلى ملحقها ولا تُعاد صياغتها", () => {
  assert.equal(FULL.provenance.decisions, "انظر ملحق المنهجية");
});

test("المصدر الخاص يُوثَّق ببصمته لا بمحتواه", () => {
  const s = FULL.provenance.sources[0];
  assert.equal(s.name, REL.sources[0].name);
  assert.equal(s.private, true);
  assert.equal(s.sha256Short, REL.sources[0].sha256.slice(0, 12));
});

test("صفحة الإسناد تحمل الوسوم الأربعة الكبرى مجتمعة", () => {
  const p = FULL.provenancePage;
  const joined = p.caveats.join("\n");
  assert.ok(joined.includes(REL.compliance.note));
  assert.ok(joined.includes(REL.scenarios.caveat));
  assert.ok(joined.includes(REL.meta.sample_label));
  assert.ok(joined.includes(REL.coverage_target_indicative.note));
});

/* ══════════════════════════════════════════════════════════════════════════
   7) هندسة الورقة — الثوابت والاقتران مع report-charts
   ══════════════════════════════════════════════════════════════════════════ */

test("صندوق المحتوى مشتق من A4 وهوامشها لا مكتوب يدوياً", () => {
  assert.equal(P.SHEET.contentWidthMm, P.SHEET.widthMm - 2 * P.SHEET.marginMm);
  assert.equal(P.SHEET.contentHeightMm, P.SHEET.heightMm - 2 * P.SHEET.marginMm);
});

test("المساحة المتاحة موجبة ومساحة ورقة الاستكمال أوسع", () => {
  assert.ok(P.usableFirstMm() > 0);
  assert.ok(P.usableContMm() > P.usableFirstMm(),
    "ورقة الاستكمال يجب أن تتسع أكثر (ترويستها أقصر)");
});

test("ارتفاعات إطارات الرسوم في النموذج تطابق ما تحسبه وحدة اللقطات", () => {
  for (const [size, mm] of [
    ["standard", P.BLOCK.chartStandardMm],
    ["wide", P.BLOCK.chartWideMm],
    ["tall", P.BLOCK.chartTallMm],
  ]) {
    assert.ok(Math.abs(C.frameHeightMm(size) - mm) < 0.3,
      size + ": " + C.frameHeightMm(size) + "مم في اللقطات مقابل " + mm + "مم في الترقيم");
  }
});

test("عرض الإطار الممتد لا يتجاوز عرض صندوق المحتوى", () => {
  assert.ok(C.frameWidthMm("wide") <= P.SHEET.contentWidthMm + 0.5);
  assert.ok(C.frameWidthMm("standard") * 2 <= P.SHEET.contentWidthMm + 1);
});

test("معامل التصغير يعطي كثافة نقاط أعلى من واحد (حدة الطباعة)", () => {
  for (const key of ["standard", "wide", "tall"]) {
    const s = C.SIZES[key];
    assert.ok(s.scale < 1, key + ": لا تصغير");
    assert.ok(Math.abs(s.frameW - s.w * s.scale) < 1.5, key + ": عرض الإطار لا يطابق التصغير");
    assert.ok(Math.abs(s.frameH - s.h * s.scale) < 1.5, key + ": ارتفاع الإطار لا يطابق التصغير");
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   8) القائمة القانونية للرسوم ووحدة القياس
   ══════════════════════════════════════════════════════════════════════════ */

test("القائمة القانونية 21 مُنشئاً بلا تكرار", () => {
  assert.equal(C.LEGAL.length, 21);
  assert.equal(new Set(C.LEGAL).size, 21);
});

test("كل مُنشئ قانوني له مقاس افتراضي وملف مصدر معلن", () => {
  for (const name of C.LEGAL) {
    assert.ok(C.DEFAULT_SIZE[name], "مقاس مفقود: " + name);
    assert.ok(C.SOURCE_FILE[name], "ملف مصدر مفقود: " + name);
    assert.ok(C.SIZES[C.DEFAULT_SIZE[name]], "مقاس مجهول لـ " + name);
  }
});

test("الاسم خارج القائمة يُرفض ولو كان معرفاً في مكان آخر", () => {
  assert.equal(C.isLegal("occupancyComposition"), true);
  assert.equal(C.isLegal("_supplyInternals"), false);
  assert.equal(C.isLegal("bridge"), false);      // من charts.js القديمة
  assert.equal(C.isLegal(""), false);
  assert.equal(C.isLegal(undefined), false);
});

test("pillarCards مُنشئ DOM لا مثيل رسم", () => {
  assert.equal(C.isDomBuilder("pillarCards"), true);
  assert.equal(C.isDomBuilder("statusDonut"), false);
});

test("وحدة القياس مشتقة من العرض ومحصورة بين حديها", () => {
  assert.equal(C.su(720), 1);
  assert.ok(C.su(560) > 0.7 && C.su(560) < 0.8);
  assert.equal(C.su(4000), 1, "لا تجاوز للحد الأعلى");
  assert.equal(C.su(10), 0.62, "لا هبوط تحت الحد الأدنى");
  assert.equal(C.su(0), 1, "عرض غير صالح يعود للمرجع");
  assert.equal(C.su(undefined), 1);
});

test("مقاس المواصفة: الصريح يسبق الافتراضي", () => {
  assert.equal(C.sizeNameOf("statusDonut", null), "standard");
  assert.equal(C.sizeNameOf("statusDonut", { size: "wide" }), "wide");
  assert.equal(C.sizeNameOf("coverageEvolution", null), "wide");
  assert.equal(C.sizeNameOf("مجهول", null), "standard");
});

/* ══════════════════════════════════════════════════════════════════════════
   9) توزيع الرسوم على الصفوف
   ══════════════════════════════════════════════════════════════════════════ */

const spec = (builder, size) => ({ builder, opts: size ? { size } : null, caption: "س" });

test("القياسيان يقترنان في صف واحد", () => {
  const rows = P.chartRows([spec("statusDonut"), spec("violationTypes")]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].length, 2);
});

test("الممتد يشغل صفه وحده ويكسر الاقتران المعلّق", () => {
  const rows = P.chartRows([
    spec("statusDonut"), spec("coverageEvolution"), spec("violationTypes"),
  ]);
  assert.deepEqual(norm(rows.map((r) => r.length)), [1, 1, 1]);
  assert.equal(rows[0][0].builder, "statusDonut");
  assert.equal(rows[1][0].builder, "coverageEvolution");
});

test("قياسي يتيم في النهاية يبقى صفاً بمفرده", () => {
  const rows = P.chartRows([spec("statusDonut"), spec("violationTypes"), spec("closuresBars")]);
  assert.deepEqual(norm(rows.map((r) => r.length)), [2, 1]);
});

test("ارتفاع صف الرسوم = أطول إطار + تسمية + وسم + فاصل", () => {
  const withCaveat = [{ builder: "complianceCard", caption: "س", caveat: "و" }];
  const bare = [{ builder: "complianceCard", caption: "س" }];
  assert.ok(P.chartRowMm(withCaveat) > P.chartRowMm(bare));
  assert.ok(P.chartRowMm(bare) >= P.BLOCK.chartStandardMm);
  const tall = [{ builder: "initiativeGantt", caption: "س" }];
  assert.ok(P.chartRowMm(tall) > P.chartRowMm(bare), "الطويل لا يُقاس أطول");
});

test("صف مختلط يُقاس بأطول إطاراته", () => {
  const mixed = [spec("statusDonut"), spec("statusDonut", "tall")];
  assert.ok(P.chartRowMm(mixed) >= P.BLOCK.chartTallMm);
});

/* ══════════════════════════════════════════════════════════════════════════
   10) تقسيم الجداول
   ══════════════════════════════════════════════════════════════════════════ */

const bigTable = (n, withNote) => ({
  title: "جدول اختبار",
  columns: [{ label: "أ" }, { label: "ب", align: "end" }],
  rows: Array.from({ length: n }, (_, i) => ["صف " + (i + 1), String(i)]),
  note: withNote ? "وسم صدق ملازم" : undefined,
});

test("سعة الصفوف تتناقص مع المساحة وتصل صفراً بلا انهيار", () => {
  const big = P.rowsFitting(200, true, true);
  const small = P.rowsFitting(60, true, true);
  assert.ok(big > small);
  assert.equal(P.rowsFitting(5, true, true), 0);
  assert.equal(P.rowsFitting(-100, true, true), 0);
});

test("الملاحظة تستهلك مساحة فتقل الصفوف الممكنة", () => {
  assert.ok(P.rowsFitting(150, true, false) > P.rowsFitting(150, true, true));
});

test("التقسيم لا يفقد صفاً ولا يكرره ولا يخلط ترتيبه", () => {
  const t = bigTable(57, true);
  const chunks = P.splitTable(t, [80, 200]);
  const flat = chunks.flatMap((c) => c.rows);
  assert.equal(flat.length, 57);
  flat.forEach((r, i) => assert.equal(r[0], "صف " + (i + 1)));
  assert.ok(chunks.length >= 2, "جدول 57 صفاً لم يُقسَّم");
});

test("كل قطعة تحمل ترقيمها وحدود صفوفها وعلم الاستكمال", () => {
  const chunks = P.splitTable(bigTable(50, true), [90, 200]);
  const parts = chunks.length;
  chunks.forEach((c, i) => {
    assert.equal(c.part, i + 1);
    assert.equal(c.parts, parts);
    assert.equal(c.continued, i > 0);
    assert.equal(c.endIndex - c.startIndex + 1, c.rows.length);
  });
  assert.equal(chunks[0].startIndex, 0);
  assert.equal(chunks[chunks.length - 1].endIndex, 49);
});

test("وسم الصدق يتكرر على كل قطعة — لا صفوف بلا وسمها", () => {
  const chunks = P.splitTable(bigTable(60, true), [80, 200]);
  assert.ok(chunks.length > 1);
  for (const c of chunks) assert.equal(c.note, "وسم صدق ملازم");
});

test("الترويسة تتكرر: كل قطعة تحمل عنوان الجدول وأعمدته كاملة", () => {
  const t = bigTable(60, true);
  for (const c of P.splitTable(t, [80, 200])) {
    assert.equal(c.title, t.title);
    assert.deepEqual(norm(c.columns), norm(t.columns));
  }
});

test("جدول فارغ يعطي قطعة واحدة فارغة لا حلقة لا نهائية", () => {
  const chunks = P.splitTable({ title: "ف", columns: [{ label: "أ" }], rows: [] }, [200]);
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].rows.length, 0);
  assert.equal(chunks[0].parts, 1);
});

test("مساحات ضيقة جداً لا تُدخل المحرك في حلقة (حارس التكرار)", () => {
  const chunks = P.splitTable(bigTable(30, false), [1, 1, 1]);
  assert.ok(Array.isArray(chunks));
  assert.ok(chunks.length <= 501);
});

/* ══════════════════════════════════════════════════════════════════════════
   11) تدفق الصفحة على الأوراق
   ══════════════════════════════════════════════════════════════════════════ */

/** يعيد قياس ورقة بالثوابت نفسها — لكشف أي تجاوز لحد القص */
function measureSheet(sheet) {
  let mm = 0;
  mm += P.figuresMm(sheet.figures.length);
  for (const row of sheet.chartRows) mm += P.chartRowMm(row);
  if (sheet.insights.length) {
    mm += P.BLOCK.insightsTitleMm + sheet.insights.length * P.BLOCK.insightMm;
  }
  mm += sheet.caveats.length * P.BLOCK.caveatMm;
  for (const t of sheet.tables) {
    mm += P.BLOCK.tableTitleMm + P.BLOCK.tableHeadMm
      + t.rows.length * P.BLOCK.tableRowMm
      + (t.note ? P.BLOCK.tableNoteMm : 0) + P.BLOCK.gapMm;
  }
  return mm;
}

test("كل ورقة من كل صفحة تبقى داخل حد القص المحسوب", () => {
  for (const page of FULL.pages.concat([FULL.provenancePage])) {
    const sheets = P.flowPage(page);
    sheets.forEach((s, i) => {
      const cap = i === 0 ? P.usableFirstMm() : P.usableContMm();
      assert.ok(measureSheet(s) <= cap + 0.001,
        page.id + " ورقة " + (i + 1) + ": " + measureSheet(s).toFixed(1)
        + "مم تتجاوز " + cap + "مم");
    });
  }
});

test("ترقيم الأوراق داخل الصفحة متسلسل وعلم الاستكمال دقيق", () => {
  for (const page of FULL.pages.concat([FULL.provenancePage])) {
    const sheets = P.flowPage(page);
    sheets.forEach((s, i) => {
      assert.equal(s.part, i + 1);
      assert.equal(s.parts, sheets.length);
      assert.equal(s.continued, i > 0);
      assert.equal(s.pageId, page.id);
      assert.equal(s.title, page.title);
    });
  }
});

test("الأرقام البارزة والرسوم لا تهاجر إلى ورقة استكمال", () => {
  for (const page of FULL.pages.concat([FULL.provenancePage])) {
    const sheets = P.flowPage(page);
    for (let i = 1; i < sheets.length; i++) {
      assert.equal(sheets[i].figures.length, 0,
        page.id + ": أرقام بارزة على ورقة استكمال");
    }
  }
});

test("صفحة الإسناد تُقسَّم فعلاً — 30 مقياساً لا تسع ورقة واحدة", () => {
  const sheets = P.flowPage(FULL.provenancePage);
  assert.ok(sheets.length >= 2, "صفحة الإسناد لم تُقسَّم رغم طول جدولها");
  const rows = sheets.flatMap((s) => s.tables)
    .filter((t) => t.title.includes("أصل كل مقياس"))
    .reduce((a, t) => a + t.rows.length, 0);
  assert.equal(rows, FULL.provenance.metrics.length,
    "التقسيم فقد مقاييس من جدول الإسناد");
});

test("لا صف يضيع ولا يتكرر عبر تقسيم أي جدول في المستند كله", () => {
  for (const page of FULL.pages.concat([FULL.provenancePage])) {
    const sheets = P.flowPage(page);
    const byTitle = new Map();
    for (const s of sheets) {
      for (const t of s.tables) {
        if (!byTitle.has(t.title)) byTitle.set(t.title, []);
        byTitle.get(t.title).push(t);
      }
    }
    for (const src of page.tables) {
      const parts = byTitle.get(src.title) || [];
      const total = parts.reduce((a, t) => a + t.rows.length, 0);
      assert.equal(total, src.rows.length,
        page.id + "/" + src.title + ": صفوف مفقودة أو مكررة");
      let expect = 0;
      for (const p of parts) {
        assert.equal(p.startIndex, expect, page.id + "/" + src.title + ": فجوة في التقسيم");
        expect += p.rows.length;
      }
    }
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   12) الخطة الكاملة
   ══════════════════════════════════════════════════════════════════════════ */

const PLAN = P.plan(FULL, {});

test("الخطة تبدأ بالغلاف وتنتهي بالإسناد", () => {
  assert.equal(PLAN.sheets[0].kind, "cover");
  assert.equal(PLAN.sheets[0].pageId, "cover");
  assert.equal(PLAN.sheets[PLAN.sheets.length - 1].pageId, "provenance");
});

test("الأوراق مرقّمة 1..N وكلها تعرف المجموع نفسه", () => {
  assert.equal(PLAN.total, PLAN.sheets.length);
  PLAN.sheets.forEach((s, i) => {
    assert.equal(s.n, i + 1);
    assert.equal(s.of, PLAN.total);
  });
});

test("المستند الكامل يتجاوز اثنتي عشرة ورقة (كثافة حقيقية لا غلاف وخلاصة)", () => {
  assert.ok(PLAN.total >= 12, "المستند " + PLAN.total + " ورقة فقط");
});

test("فهرس المحتويات يشير إلى أوراق افتتاحية لا إلى استكمالات", () => {
  assert.ok(PLAN.contents.length >= 11);
  for (const item of PLAN.contents) {
    const sheet = PLAN.sheets[item.sheet - 1];
    assert.equal(sheet.n, item.sheet);
    assert.equal(sheet.continued, false, "الفهرس يشير إلى ورقة استكمال");
    assert.equal(sheet.title, item.title);
    assert.notEqual(sheet.kind, "cover", "الغلاف لا يُدرج في فهرسه");
  }
  const nums = PLAN.contents.map((c) => c.sheet);
  assert.deepEqual(norm(nums), norm(nums.slice().sort((a, b) => a - b)),
    "الفهرس غير مرتب");
});

test("كل صفحة منطقية ممثَّلة في الفهرس مرة واحدة", () => {
  const keys = PLAN.contents.map((c) => c.pageId + "|" + c.title);
  assert.equal(new Set(keys).size, keys.length, "تكرار في الفهرس");
  const ids = new Set(PLAN.contents.map((c) => c.pageId));
  for (const p of FULL.pages) assert.ok(ids.has(p.id), "صفحة غائبة عن الفهرس: " + p.id);
  assert.ok(ids.has("provenance"));
});

test("الحصر يقلّص عدد الأوراق ويبقي الغلاف والإسناد", () => {
  const m = P.model(REL, DER, { pages: "control", now: NOW });
  const plan = P.plan(m, {});
  assert.ok(plan.total < PLAN.total);
  assert.equal(plan.sheets[0].kind, "cover");
  assert.equal(plan.sheets[plan.sheets.length - 1].pageId, "provenance");
  assert.ok(plan.sheets.some((s) => s.pageId === "control"));
  assert.ok(!plan.sheets.some((s) => s.pageId === "forecast"));
});

test("كل ورقة في الخطة تعرف صفحتها وعنوانها — لا ورقة يتيمة", () => {
  for (const s of PLAN.sheets) {
    assert.ok(s.pageId, "ورقة بلا معرف صفحة");
    assert.ok(s.title, "ورقة بلا عنوان");
    assert.ok(["cover", "section", "provenance"].includes(s.kind), s.kind);
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   13) اتساق العناوين مع تعريفات الأقسام المعتمدة
   ══════════════════════════════════════════════════════════════════════════ */

test("عناوين صفحات الأقسام تطابق تعريفات الأقسام حرفياً", () => {
  const expected = {
    summary: "الملخص التنفيذي",
    demand: "العرض والطلب",
    licensing: "التراخيص",
    control: "الرقابة الميدانية",
    map: "خريطة الرياض التفاعلية",
    initiatives: "المبادرات والركائز",
    kpis: "مؤشرات الأداء",
    forecast: "سيناريوهات العجز",
    closing: "الخاتمة والتوصيات",
  };
  for (const [id, title] of Object.entries(expected)) {
    assert.equal(P.titleFor(id), title, id);
    assert.equal(onePage(FULL, id).title, title, id);
  }
});

test("مفردات الحالة مقفلة ولا تُترجم حالة مجهولة إلى ادعاء", () => {
  assert.equal(P.statusLabel("pending_methodology"), "بانتظار اعتماد المنهجية");
  assert.equal(P.statusLabel("supplied_unvalidated"), "قيمة مورّدة غير معتمدة");
  assert.equal(P.statusLabel("مجهول_تماماً"), "مجهول_تماماً");
  assert.equal(P.statusLabel(null), "");
});

test("موازنة الذيل اليتيم: لا قطعة تالية بصفٍّ وحيد تحت ترويسة كاملة", () => {
  /* سعة تعطي 9 صفوف من 10 لولا الموازنة — الذيل صف واحد */
  const chunks = P.splitTable(bigTable(10, true), [
    P.BLOCK.tableTitleMm + P.BLOCK.tableHeadMm + P.BLOCK.tableNoteMm
      + P.BLOCK.gapMm + 9 * P.BLOCK.tableRowMm,
    P.usableContMm(),
  ]);
  assert.equal(chunks.length, 2);
  assert.ok(chunks[1].rows.length >= P.BLOCK.orphanMinRows,
    "الذيل " + chunks[1].rows.length + " صف — دون حد اليُتم");
  assert.ok(chunks[0].rows.length >= P.BLOCK.minTableRows);
  assert.equal(chunks[0].rows.length + chunks[1].rows.length, 10);
});

test("الموازنة لا تُفعَّل إن أنزلت القطعة الأولى تحت حدها الأدنى", () => {
  const chunks = P.splitTable(bigTable(5, false), [
    P.BLOCK.tableTitleMm + P.BLOCK.tableHeadMm + P.BLOCK.gapMm
      + 4 * P.BLOCK.tableRowMm,
    P.usableContMm(),
  ]);
  assert.equal(chunks[0].rows.length, 4, "سُحب من القطعة الأولى تحت حدها");
  assert.equal(chunks.reduce((a, c) => a + c.rows.length, 0), 5);
});

test("كل قطع الجداول في المستند الكامل بلا ذيل يتيم", () => {
  for (const page of FULL.pages.concat([FULL.provenancePage])) {
    const byTitle = new Map();
    for (const s of P.flowPage(page)) {
      for (const t of s.tables) {
        if (!byTitle.has(t.title)) byTitle.set(t.title, []);
        byTitle.get(t.title).push(t);
      }
    }
    for (const [title, parts] of byTitle) {
      if (parts.length < 2) continue;
      const tail = parts[parts.length - 1];
      assert.ok(tail.rows.length >= P.BLOCK.orphanMinRows,
        page.id + "/" + title + ": ذيل بـ" + tail.rows.length + " صف");
    }
  }
});
