/* diff-model.test.mjs — منطق تبويبي الإدارة الجديدين (عقد التوسعة §11)
   ═══════════════════════════════════════════════════════════════════════════
   ما يُثبَت هنا هو ما لا يجوز أن ينكسر بتعديل عرضي:

   • **المقارنة تقول الحقيقة كاملة.** الحذف يُكتشف ولا يُبتلع، والمصفوفات ذات
     المعرّفات تُطابق بالمعرّف لا بالفهرس (فإعادة ترتيب مبادرة ليست ثمانية
     عشر تغييراً)، والحقول التشغيلية مستثناة بقائمة معلَنة قابلة للتوسعة.

   • **وسوم الصدق جزء من نموذج المقارنة لا زينة عرض.** أي مسّ لمنهجية الامتثال
     81.6٪ أو تنويه السيناريوهات أو وسم العينة يخرج بدرجة خطورة عالية ومعه
     نص وسمه **حرفياً من البيانات** — الفحص على الدوال النقية لا على DOM،
     فلا يمكن إسقاط الوسم بتغيير قالب.

   • **التنسيق من البيانات لا من الحدس.** 43.1 نسبةٌ لأن حاويتها تحمل
     `unit: "٪"`، و0.8 نسبةٌ لأن المؤشر يحمل `pct: true`، و1,420,000 سريرٌ
     لأن حاويتها تحمل `unit: "سرير"`. لا قاعدة اسمية مخترعة.

   • **حساب الترقيم لا يفقد صفاً ولا يكرره** عند أي مقاس صفحة أو رقم صفحة
     خارج المدى.

   • **منشئ الموجز لا يفرّع منطق الصفحات.** يفوّض التطبيع والترتيب إلى
     `RH.report.pages`، ويعدّ ما في النموذج فعلاً، ويعلن ما يفقده الحصر
     بما فيه وسوم الصدق الغائبة.

   الوحدات تُحمَّل بترتيب build.py الحقيقي داخل سياق vm واحد — كوسوم <script>
   متتالية — كي تُختبر الملفات المُسلَّمة نفسها لا نسخة منها. `load-app.mjs`
   يملكه معمار التوسعة ولا يعدّله وكيل ميزة، لذا يحمل هذا الملف محمّله الخاص
   المكافئ (النمط ذاته المعتمد في report-model/atlas-model). */
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
  "src/js/viz/geomap-utils.js",     // مصدر normalizeAr الوحيد (عقد §10)
  "src/js/viz/charts-micro.js",
  "src/js/report/report-charts.js",
  "src/js/report/report-pages.js",
  "src/js/admin/report-builder.js",
  "src/js/admin/diff-viewer.js",
];

/* ── محاكاة DOM دنيا: تكفي h()/clear ولا تنفّذ عرضاً ────────────────────── */
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

/* مخزن محلي وهمي: منشئ الموجز يحفظ الاختيار فيه (داخل try/catch دائماً) */
const storeMap = new Map();
const localStorageMock = {
  getItem: (k) => (storeMap.has(k) ? storeMap.get(k) : null),
  setItem: (k, v) => { storeMap.set(String(k), String(v)); },
  removeItem: (k) => { storeMap.delete(k); },
  clear: () => storeMap.clear(),
};

const sandbox = {
  window: win,
  document: documentMock,
  location: win.location,
  localStorage: localStorageMock,
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

const D = RH.admin.diffViewer;
const B = RH.admin.reportBuilder;
const P = RH.report.pages;
const fmt = RH.core.fmt;

/** يطبّع كائناً وُلد داخل سياق vm إلى عالم الاختبار */
const norm = (x) => structuredClone(x);

const releaseText = readFileSync(path.join(ROOT, "data", "release.json"), "utf8");
const freshRelease = () => JSON.parse(releaseText);
const geoText = readFileSync(path.join(ROOT, "data", "riyadh-geo.json"), "utf8");
const freshGeo = () => JSON.parse(geoText);

const REL = freshRelease();
const DER = RH.data.derive.compute(REL);
const GEO = freshGeo();
const NOW = "2026-08-17T09:00:00.000Z";

/** مسودة مشتقة من الإصدار — تماماً كما تفعل store.startDraft */
function makeDraft(mutate) {
  const d = JSON.parse(JSON.stringify(REL));
  d.release = {
    id: "draft",
    status: "draft",
    base_release_id: REL.release.id,
    draft_version: 3,
    started_by: "محرر الاختبار",
    started_at: "2026-08-17T08:00:00.000Z",
  };
  if (mutate) mutate(d);
  return d;
}

/** يبحث عن فرق بمساره */
function at(entries, p) {
  for (const e of entries) if (e.path === p) return e;
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1) المشي العميق: ما الذي تكتشفه المقارنة
   ═══════════════════════════════════════════════════════════════════════════ */

test("diff: إصدار مطابق لنفسه لا يُنتج فرقاً واحداً", () => {
  const a = freshRelease();
  const b = freshRelease();
  assert.equal(D.diff(a, b).length, 0);
});

test("diff: المسودة المفتوحة من الإصدار بلا تحرير لا تُظهر فرقاً (الحقول التشغيلية مستثناة)", () => {
  const draft = makeDraft();
  assert.equal(D.diff(REL, draft).length, 0);
});

test("diff: تغيّر قيمة رقمية يخرج بنوع «تغيير» ومساره النقطي الكامل", () => {
  const draft = makeDraft((d) => { d.metrics.total_demand.value = 1430000; });
  const out = D.diff(REL, draft);
  assert.equal(out.length, 1);
  const e = out[0];
  assert.equal(e.path, "metrics.total_demand.value");
  assert.equal(e.kind, "changed");
  assert.equal(e.from, 1420000);
  assert.equal(e.to, 1430000);
  assert.equal(e.group, "metrics");
  assert.equal(e.key, "value");
  assert.equal(e.parent, "metrics.total_demand");
});

test("diff: حقل جديد في المسودة يخرج «إضافة» بقيمة from غير موجودة", () => {
  const draft = makeDraft((d) => { d.meta.entity = "أمانة منطقة الرياض"; });
  const out = D.diff(REL, draft);
  assert.equal(out.length, 1);
  assert.equal(out[0].kind, "changed");   // الحقل موجود أصلاً بقيمة null
  assert.equal(out[0].from, null);

  const draft2 = makeDraft((d) => { d.meta.new_field_x = "قيمة"; });
  const out2 = D.diff(REL, draft2);
  assert.equal(out2.length, 1);
  assert.equal(out2[0].kind, "added");
  assert.equal(out2[0].from, undefined);
  assert.equal(out2[0].to, "قيمة");
});

test("diff: حقل محذوف من المسودة يخرج «حذف» ولا يُبتلع صامتاً", () => {
  const draft = makeDraft((d) => { delete d.meta.baseline_label; });
  const out = D.diff(REL, draft);
  assert.equal(out.length, 1);
  assert.equal(out[0].kind, "removed");
  assert.equal(out[0].path, "meta.baseline_label");
  assert.equal(out[0].to, undefined);
  assert.equal(out[0].from, REL.meta.baseline_label);
});

test("diff: مسودة فارغة تماماً تُظهر كل مجموعات الجذر حذفاً لا انهياراً", () => {
  const out = D.diff(REL, { release: {}, meta: {} });
  assert.ok(out.length > 5);
  assert.ok(out.every((e) => e.kind === "removed"));
  assert.ok(at(out, "metrics"));
});

/* ═══════════════════════════════════════════════════════════════════════════
   2) المصفوفات: المطابقة بالمعرّف مقابل الفهرس
   ═══════════════════════════════════════════════════════════════════════════ */

test("diff: مصفوفة بمعرّفات تُطابق بالمعرّف — تغيير حالة مبادرة فرق واحد", () => {
  const draft = makeDraft((d) => {
    d.strategy.initiatives[0].status = "جاري العمل";
  });
  const out = D.diff(REL, draft);
  assert.equal(out.length, 1);
  assert.equal(out[0].path, "strategy.initiatives[1.1].status");
  assert.equal(out[0].kind, "changed");
});

test("diff: إعادة ترتيب مصفوفة معرَّفة لا تُنتج فروقاً كاذبة", () => {
  const draft = makeDraft((d) => { d.strategy.initiatives.reverse(); });
  assert.equal(D.diff(REL, draft).length, 0);
});

test("diff: حذف عنصر معرَّف يخرج حذفاً واحداً بمعرّفه في المسار", () => {
  const gone = REL.strategy.initiatives[2].id;
  const draft = makeDraft((d) => { d.strategy.initiatives.splice(2, 1); });
  const out = D.diff(REL, draft);
  assert.equal(out.length, 1);
  assert.equal(out[0].kind, "removed");
  assert.equal(out[0].path, "strategy.initiatives[" + gone + "]");
});

test("diff: إضافة عنصر معرَّف تخرج إضافة واحدة", () => {
  const draft = makeDraft((d) => {
    d.strategy.initiatives.push({
      id: "9.9", pillar_id: "p1", name: "مبادرة اختبار", start: null,
      end: null, status: "لم يتم البدء",
    });
  });
  const out = D.diff(REL, draft);
  assert.equal(out.length, 1);
  assert.equal(out[0].kind, "added");
  assert.equal(out[0].path, "strategy.initiatives[9.9]");
});

test("diff: مصفوفة بلا معرّفات تُطابق بالفهرس", () => {
  const draft = makeDraft((d) => { d.monthly.licensing[0].beds = 3300; });
  const out = D.diff(REL, draft);
  assert.equal(out.length, 1);
  assert.equal(out[0].path, "monthly.licensing[0].beds");
});

test("diff: تقصير مصفوفة بالفهرس يخرج حذفاً لكل عنصر زائد", () => {
  const draft = makeDraft((d) => { d.violation_types = d.violation_types.slice(0, 4); });
  const out = D.diff(REL, draft);
  assert.equal(out.length, REL.violation_types.length - 4);
  assert.ok(out.every((e) => e.kind === "removed"));
});

test("matchKeyFor: يختار id متى حملته العناصر كلها، وإلا فلا مفتاح", () => {
  assert.equal(D.matchKeyFor(norm(REL.strategy.initiatives),
    norm(REL.strategy.initiatives), ["id"]), "id");
  assert.equal(D.matchKeyFor(norm(REL.monthly.licensing),
    norm(REL.monthly.licensing), ["id"]), null);
  // مصفوفة فارغة مقابل معرَّفة: المفتاح صالح (إضافة عناصر لأول مرة)
  assert.equal(D.matchKeyFor([], norm(REL.sectors), ["id"]), "id");
});

/* ═══════════════════════════════════════════════════════════════════════════
   3) الاستثناءات
   ═══════════════════════════════════════════════════════════════════════════ */

test("buildIgnore: opts.ignore تُضيف ولا تستبدل، وreplaceIgnore تستبدل", () => {
  const base = norm(D.DEFAULT_IGNORE);
  const added = D.buildIgnore({ ignore: ["meta.entity"] });
  assert.equal(added.length, base.length + 1);
  assert.ok(added.indexOf("meta.entity") !== -1);
  assert.ok(added.indexOf("release.sha256") !== -1);

  const replaced = D.buildIgnore({ ignore: ["meta.entity"], replaceIgnore: true });
  assert.deepEqual(norm(replaced), ["meta.entity"]);

  // التكرار لا يتضاعف
  const dup = D.buildIgnore({ ignore: ["release.sha256"] });
  assert.equal(dup.length, base.length);
});

test("isIgnored: يشمل المسار نفسه وأبناءه لا جاره ذا البادئة نفسها", () => {
  const list = ["release.waivers"];
  assert.equal(D.isIgnored("release.waivers", list), true);
  assert.equal(D.isIgnored("release.waivers.g1.by", list), true);
  assert.equal(D.isIgnored("release.waivers[0]", list), true);
  assert.equal(D.isIgnored("release.waivers_extra", list), false);
  assert.equal(D.isIgnored("release.notes", list), false);
});

test("diff: بصمة التحقق وأختام الزمن مستثناة افتراضاً وتظهر عند طلبها صراحةً", () => {
  const draft = makeDraft();
  draft.release.sha256 = "0000";
  assert.equal(D.diff(REL, draft).length, 0);
  const forced = D.diff(REL, draft, { replaceIgnore: true, ignore: [] });
  assert.ok(forced.some((e) => e.path === "release.sha256"));
});

test("diff: ملاحظات الإصدار مستثناة — المسودة تبدأ بلا ملاحظات فالحذف كاذب", () => {
  /* startDraft يستبدل كتلة release كاملة، فملاحظات الإصدار المنشور تختفي من
     كل مسودة جديدة. إظهارها «حذفاً» يُنذر عن حدث لم يقع — ولذلك تُستثنى
     وتُعرض بدلها في بطاقة الهوية. */
  assert.ok(norm(D.DEFAULT_IGNORE).indexOf("release.notes") !== -1);
  const draft = makeDraft((d) => { d.release.notes = "نص جديد"; });
  assert.equal(D.diff(REL, draft).length, 0);
  const forced = D.diff(REL, draft, { replaceIgnore: true });
  assert.ok(forced.some((e) => e.path === "release.notes"));
});

test("IGNORE_REASON: كل حقل مستثنى يحمل سبباً مكتوباً — لا استثناء صامت", () => {
  const reasons = norm(D.IGNORE_REASON);
  for (const p of norm(D.DEFAULT_IGNORE)) {
    assert.ok(typeof reasons[p] === "string" && reasons[p].length > 8, p);
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   4) أدوات المسار
   ═══════════════════════════════════════════════════════════════════════════ */

test("splitPath/groupOf/lastKey/parentPath على مسار مركّب", () => {
  const p = "strategy.initiatives[1.1].status";
  assert.deepEqual(norm(D.splitPath(p)), [
    { kind: "key", token: "strategy" },
    { kind: "key", token: "initiatives" },
    { kind: "item", token: "1.1" },
    { kind: "key", token: "status" },
  ]);
  assert.equal(D.groupOf(p), "strategy");
  assert.equal(D.lastKey(p), "status");
  assert.equal(D.lastSegment(p), "status");
  assert.equal(D.parentPath(p), "strategy.initiatives[1.1]");
  assert.equal(D.lastSegment("sectors[0]"), "[0]");
  assert.equal(D.lastKey("sectors[0]"), "sectors");
  assert.equal(D.parentPath("meta"), "");
});

test("resolveAt: يقرأ بالمعرّف وبالفهرس ويعيد undefined للمفقود", () => {
  assert.equal(D.resolveAt(REL, "metrics.total_demand.value"), 1420000);
  assert.equal(D.resolveAt(REL, "strategy.initiatives[1.1].id"), "1.1");
  assert.equal(D.resolveAt(REL, "monthly.licensing[0].iso"), "2025-09");
  assert.equal(D.resolveAt(REL, "sectors[north].name"), "قطاع الشمال");
  assert.equal(D.resolveAt(REL, "metrics.nope.value"), undefined);
  assert.equal(D.resolveAt(null, "metrics"), undefined);
});

test("pathLabel: يفضّل أسماء البيانات على أسماء المفاتيح", () => {
  const l = D.pathLabel("metrics.total_demand.value", REL);
  assert.ok(l.indexOf("المقاييس الخام") === 0, l);
  assert.ok(l.indexOf(REL.metrics.total_demand.label) !== -1, l);
  assert.ok(l.endsWith("القيمة"), l);

  const l2 = D.pathLabel("strategy.initiatives[1.1].status", REL);
  assert.ok(l2.indexOf(REL.strategy.initiatives[0].name) !== -1, l2);
  assert.ok(l2.endsWith("الحالة"), l2);
});

test("pathLabel: يعود إلى الجذر البديل حين يغيب المسار من الأول (حالة الحذف)", () => {
  const draft = makeDraft((d) => { d.strategy.initiatives.splice(0, 1); });
  const l = D.pathLabel("strategy.initiatives[1.1]", draft, REL);
  assert.ok(l.indexOf(REL.strategy.initiatives[0].name) !== -1, l);
});

test("pathLabel: عنصر المصفوفة يُسمّى بتسميته من البيانات، وبـ«العنصر N» حين لا اسم", () => {
  const l = D.pathLabel("monthly.licensing[0].beds", REL);
  assert.ok(l.indexOf(REL.monthly.licensing[0].label) !== -1, l);
  assert.ok(l.endsWith("الأسرّة"), l);
  // مصفوفة عناصرها بلا اسم: الفهرس هو كل ما نملكه فنقوله صراحةً
  const bare = { rows: [{ a: 1 }] };
  const l2 = D.pathLabel("rows[0].a", bare);
  assert.ok(l2.indexOf("العنصر") !== -1, l2);
});

/* ═══════════════════════════════════════════════════════════════════════════
   5) المساواة العميقة والتسلسل الحتمي
   ═══════════════════════════════════════════════════════════════════════════ */

test("stableStringify: مستقل عن ترتيب المفاتيح ويفرّق null عن غير الموجود", () => {
  assert.equal(D.stableStringify({ a: 1, b: 2 }), D.stableStringify({ b: 2, a: 1 }));
  assert.notEqual(D.stableStringify(null), D.stableStringify(undefined));
  assert.equal(D.deepEqual([1, { x: 1, y: 2 }], [1, { y: 2, x: 1 }]), true);
  assert.equal(D.deepEqual({ a: 0 }, { a: "0" }), false);
  assert.equal(D.deepEqual(NaN, NaN), true);   // كلاهما «قيمة غير رقمية» نفسها
});

test("valueKind: يميّز الغياب عن null عن الكائن عن المصفوفة", () => {
  assert.equal(D.valueKind(undefined), "missing");
  assert.equal(D.valueKind(null), "null");
  assert.equal(D.valueKind([]), "array");
  assert.equal(D.valueKind({}), "object");
  assert.equal(D.valueKind(1), "number");
  assert.equal(D.valueKind("s"), "string");
  assert.equal(D.valueKind(false), "boolean");
});

/* ═══════════════════════════════════════════════════════════════════════════
   6) التنسيق: الوحدة من البيانات لا من الحدس
   ═══════════════════════════════════════════════════════════════════════════ */

test("numberHint: يقرأ النسبة من unit ومن علم pct في المؤشرات", () => {
  assert.deepEqual(norm(D.numberHint("derived.coverage_pct.value", REL)),
    { pct: true, scale: 1, unit: "٪" });
  assert.deepEqual(norm(D.numberHint("compliance.value", REL)),
    { pct: true, scale: 1, unit: "٪" });
  assert.deepEqual(norm(D.numberHint("metrics.total_demand.value", REL)),
    { pct: false, scale: 1, unit: "سرير" });
  // المؤشر الأول نسبي (pct:true) فمستهدفه كسر يُعرض ×100
  assert.deepEqual(norm(D.numberHint("strategy.kpis[1].target", REL)),
    { pct: true, scale: 100, unit: "٪" });
  // المؤشر الخامس عددي (pct:false) فمستهدفه رقم مجرد
  assert.deepEqual(norm(D.numberHint("strategy.kpis[5].target", REL)),
    { pct: false, scale: 1, unit: null });
});

test("formatValue: كل قيمة بصيغتها الصادقة", () => {
  assert.equal(D.formatValue(undefined), "(غير موجود)");
  assert.equal(D.formatValue(null), "(غير محدد)");
  assert.equal(D.formatValue(true), "نعم");
  assert.equal(D.formatValue(false), "لا");
  assert.equal(D.formatValue(""), "(نص فارغ)");
  assert.equal(D.formatValue("نص"), "نص");
  assert.equal(D.formatValue(1420000), "1,420,000");
  assert.equal(D.formatValue(43.1), "43.1");
  assert.equal(D.formatValue(43.1, { pct: true, scale: 1 }), fmt.pct(43.1));
  assert.equal(D.formatValue(0.8, { pct: true, scale: 100 }), fmt.pct(80));
  assert.equal(D.formatValue(1420000, { unit: "سرير" }), fmt.unitAfter(1420000, "سرير"));
  assert.equal(D.formatValue([1, 2, 3]), fmt.countNoun(3,
    { zero: "قائمة فارغة", one: "عنصر واحد", two: "عنصران", few: "عناصر",
      many: "عنصراً", hundred: "عنصر" }));
  assert.equal(D.formatValue([]), "قائمة فارغة");
});

test("formatValue: كائن يحمل اسماً يُعرض باسمه وعدد حقوله", () => {
  const s = D.formatValue(norm(REL.sectors[0]));
  assert.ok(s.indexOf("قطاع الشمال") === 0, s);
  assert.ok(s.indexOf("حقل") !== -1, s);
});

test("formatValueFull: الكائنات بصيغة JSON مقروءة والقيم البسيطة كما هي", () => {
  assert.equal(D.formatValueFull(undefined), "(غير موجود في هذا الإصدار)");
  assert.equal(D.formatValueFull(null), "null");
  assert.equal(D.formatValueFull("نص"), "نص");
  const j = D.formatValueFull({ a: 1 });
  assert.ok(j.indexOf('"a": 1') !== -1, j);
});

test("numericDelta: الاتجاه والنسبة، والقسمة على صفر لا تخترع نسبة", () => {
  assert.equal(D.numericDelta("a", 1), null);
  const up = norm(D.numericDelta(100, 110));
  assert.deepEqual(up, { abs: 10, relative: 10, direction: "up" });
  const down = norm(D.numericDelta(100, 95));
  assert.deepEqual(down, { abs: -5, relative: -5, direction: "down" });
  const flat = norm(D.numericDelta(7, 7));
  assert.deepEqual(flat, { abs: 0, relative: 0, direction: "flat" });
  const zero = norm(D.numericDelta(0, 5));
  assert.equal(zero.relative, null);
  assert.equal(zero.direction, "up");
});

test("deltaText: يحمل السهم والمقدار والوحدة والنسبة", () => {
  const t = D.deltaText(D.numericDelta(1420000, 1430000), { unit: "سرير" });
  assert.ok(t.indexOf("▲") === 0, t);
  assert.ok(t.indexOf("10,000") !== -1, t);
  assert.ok(t.indexOf("سرير") !== -1, t);
  const t2 = D.deltaText(D.numericDelta(100, 90), { pct: false });
  assert.ok(t2.indexOf("▼") === 0, t2);
  assert.equal(D.deltaText(null), "");
});

test("changeCount: تطابق العدد والمعدود العربي", () => {
  assert.equal(D.changeCount(0), "لا فروق");
  assert.equal(D.changeCount(1), "فرق واحد");
  assert.equal(D.changeCount(2), "فرقان");
  assert.equal(D.changeCount(5), "5" + fmt.NBSP + "فروق");
  assert.equal(D.changeCount(20), "20" + fmt.NBSP + "فرقاً");
});

/* ═══════════════════════════════════════════════════════════════════════════
   7) وسوم الصدق والخطورة
   ═══════════════════════════════════════════════════════════════════════════ */

test("isHonestyPath: يشمل الوسوم والحالات ومجموعات القيم المورّدة", () => {
  assert.equal(D.isHonestyPath("compliance.value"), true);
  assert.equal(D.isHonestyPath("scenarios.rows[0].base"), true);
  assert.equal(D.isHonestyPath("coverage_target_indicative.value"), true);
  assert.equal(D.isHonestyPath("quarantine.inspector_level_records"), true);
  assert.equal(D.isHonestyPath("meta.sample_label"), true);
  assert.equal(D.isHonestyPath("meta.map_disclaimer"), true);
  assert.equal(D.isHonestyPath("neighbourhoods.ranking_note"), true);
  assert.equal(D.isHonestyPath("strategy.kpis[1].current"), true);
  assert.equal(D.isHonestyPath("next_steps.status"), true);
  assert.equal(D.isHonestyPath("metrics.total_demand.value"), false);
  assert.equal(D.isHonestyPath("sectors[north].beds"), false);
});

test("caveatsFor: منهجية الامتثال 81.6٪ تلازم أي مسّ لقيمتها — بنصها من البيانات", () => {
  const cav = norm(D.caveatsFor("compliance.value", REL, REL));
  assert.ok(cav.length >= 2, JSON.stringify(cav));
  assert.equal(cav[0], REL.compliance.note);
  assert.ok(cav.some((t) => t.indexOf("بانتظار اعتماد المنهجية") !== -1),
    JSON.stringify(cav));
});

test("caveatsFor: تنويه السيناريوهات ووسم العينة يخرجان بنصهما الحرفي", () => {
  const sc = norm(D.caveatsFor("scenarios.rows[0].base", REL, REL));
  assert.equal(sc[0], REL.scenarios.caveat);
  const nb = norm(D.caveatsFor("neighbourhoods.rows[0].beds", REL, REL));
  assert.ok(nb.indexOf(REL.neighbourhoods.label) !== -1, JSON.stringify(nb));
  assert.ok(nb.indexOf(REL.neighbourhoods.ranking_note) !== -1, JSON.stringify(nb));
});

test("caveatsFor: وسم القيم الحالية الغائبة للمؤشرات", () => {
  const c = norm(D.caveatsFor("strategy.kpis[1].current", REL, REL));
  assert.ok(c.indexOf(REL.strategy.kpis[0].current_note) !== -1, JSON.stringify(c));
});

test("caveatsFor: مسار بلا وسم يخرج قائمة فارغة لا نصاً مخترعاً", () => {
  assert.deepEqual(norm(D.caveatsFor("metrics.total_demand.value", REL, REL)), []);
});

test("statusLabel: المفردات مقفلة، والمجهول يخرج كما هو لا يُترجم بالحدس", () => {
  assert.equal(D.statusLabel("pending_methodology"), "بانتظار اعتماد المنهجية");
  assert.equal(D.statusLabel("indicative_not_approved"), "استرشادية غير معتمدة");
  assert.equal(D.statusLabel("x_unknown"), "x_unknown");
  assert.equal(D.statusLabel(null), "—");
});

test("severityOf: القاعدة الحتمية للخطورة", () => {
  assert.equal(D.severityOf({ path: "meta.title", kind: "removed" }), "high");
  assert.equal(D.severityOf({ path: "compliance.value", kind: "changed",
    from: 81.6, to: 81.7 }), "high");
  assert.equal(D.severityOf({ path: "metrics.a.value", kind: "changed",
    from: 100, to: 130 }), "high");
  assert.equal(D.severityOf({ path: "metrics.a.value", kind: "changed",
    from: 100, to: 105 }), "medium");
  assert.equal(D.severityOf({ path: "metrics.a.value", kind: "changed",
    from: 100, to: 100.5 }), "low");
  assert.equal(D.severityOf({ path: "meta.title", kind: "added",
    from: undefined, to: "x" }), "medium");
  assert.equal(D.severityOf({ path: "meta.title", kind: "changed",
    from: "أ", to: "ب" }), "low");
  assert.equal(D.severityOf({ path: "meta.x", kind: "changed",
    from: "1", to: 1 }), "medium");   // تغيّر النوع ليس تفصيلاً
});

/* ═══════════════════════════════════════════════════════════════════════════
   8) التطبيع والبحث
   ═══════════════════════════════════════════════════════════════════════════ */

test("normalizeSearch: يفوَّض إلى RH.viz.geoutils.normalizeAr لا إلى منطق منسوخ", () => {
  const samples = ["حي الملقا", "الصَّحافة", "  حطين ", "AL Malqa", "الأولى"];
  for (const s of samples) {
    assert.equal(D.normalizeSearch(s), RH.viz.geoutils.normalizeAr(s), s);
  }
  assert.equal(D.normalizeSearch(null), "");
});

test("normalizeSearch: يوحّد صور الهمزة فيلتقي البحث بالمكتوب", () => {
  assert.equal(D.normalizeSearch("إجمالي"), D.normalizeSearch("اجمالي"));
  assert.equal(D.normalizeSearch("الأسرّة"), D.normalizeSearch("الاسرة"));
});

/* ═══════════════════════════════════════════════════════════════════════════
   9) التزيين والملخص
   ═══════════════════════════════════════════════════════════════════════════ */

const DRAFT_MIX = makeDraft((d) => {
  d.metrics.total_demand.value = 1500000;          // تغيير رقمي كبير
  d.compliance.note = "نص منهجية محرَّر";           // وسم صدق
  d.strategy.initiatives[3].status = "منجزة";      // تغيير نصي
  delete d.meta.baseline_label;                    // حذف
  d.meta.brand_new = "قيمة";                       // إضافة
  d.sectors[4].beds = REL.sectors[4].beds + 500;   // تغيير رقمي صغير
});
const RAW_MIX = D.diff(REL, DRAFT_MIX);
const DEC_MIX = D.decorate(RAW_MIX, REL, DRAFT_MIX);

test("decorate: يضيف التسمية والنصوص والفرق والخطورة والوسوم ونص البحث", () => {
  assert.equal(DEC_MIX.length, RAW_MIX.length);
  const e = at(DEC_MIX, "metrics.total_demand.value");
  assert.ok(e);
  assert.ok(e.label.indexOf("المقاييس الخام") === 0);
  assert.equal(e.fromText, fmt.unitAfter(1420000, "سرير"));
  assert.equal(e.toText, fmt.unitAfter(1500000, "سرير"));
  // 1,420,000 ← 1,500,000 ‏= ‎+5.6٪ فهي «متوسطة» بالقاعدة المنصوصة
  assert.equal(e.severity, "medium");
  assert.equal(e.honesty, false);
  assert.ok(e.deltaText.indexOf("▲") === 0);
  assert.ok(e.search.length > 0);
});

test("decorate: صف وسم الصدق يحمل نص وسمه ودرجة خطورة عالية", () => {
  const e = at(DEC_MIX, "compliance.note");
  assert.ok(e);
  assert.equal(e.honesty, true);
  assert.equal(e.severity, "high");
  assert.ok(e.caveats.length >= 1);
});

test("decorate: قيمة حيٍّ من العينة تحمل وسم العينة ولو لم تُرفع خطورتها", () => {
  const draft = makeDraft((d) => { d.neighbourhoods.rows[0].beds = 22000; });
  const dec = D.decorate(D.diff(REL, draft), REL, draft);
  const e = at(dec, "neighbourhoods.rows[0].beds");
  assert.ok(e, "تغيّر أسرّة حي مرصود");
  assert.equal(e.honesty, false, "ليست حقل وسم بذاتها");
  assert.ok(e.caveats.indexOf(REL.neighbourhoods.label) !== -1,
    "لكن وسم العينة يلازم قيمتها: " + JSON.stringify(e.caveats));
  assert.ok(e.caveats.indexOf(REL.neighbourhoods.ranking_note) !== -1);
});

test("decorate: قيمة سيناريو مورّد تحمل تنويهه ولو تغيّرت في صف عادي", () => {
  const draft = makeDraft((d) => { d.scenarios.rows[0].base = 900000; });
  const dec = D.decorate(D.diff(REL, draft), REL, draft);
  const e = at(dec, "scenarios.rows[0].base");
  assert.ok(e);
  assert.ok(e.caveats.indexOf(REL.scenarios.caveat) !== -1);
});

test("decorate: صف بلا وسم لا يخترع وسماً", () => {
  const e = at(DEC_MIX, "sectors[south].beds")
    || at(DEC_MIX, "metrics.total_demand.value");
  assert.ok(e);
  assert.deepEqual(norm(e.caveats), []);
});

test("summarize: الإجماليات وتوزيع الأنواع والمجموعات بترتيب عقد البيانات", () => {
  const s = norm(D.summarize(DEC_MIX));
  assert.equal(s.total, DEC_MIX.length);
  assert.equal(s.added + s.removed + s.changed, s.total);
  assert.equal(s.high + s.medium + s.low, s.total);
  assert.equal(s.removed, 1);
  assert.equal(s.added, 1);
  assert.ok(s.honesty >= 1);
  const groups = s.groups.map((g) => g.group);
  assert.deepEqual(groups, groups.slice().sort(
    (a, b) => D.groupRank(a) - D.groupRank(b)));
  assert.ok(groups.indexOf("meta") < groups.indexOf("metrics"));
  const meta = s.groups.find((g) => g.group === "meta");
  assert.equal(meta.label, "البيانات الوصفية");
  assert.equal(meta.total, 2);
});

test("summarize: قائمة فارغة تُخرج أصفاراً لا انهياراً", () => {
  const s = norm(D.summarize([]));
  assert.equal(s.total, 0);
  assert.equal(s.groups.length, 0);
});

/* ═══════════════════════════════════════════════════════════════════════════
   10) التصفية والترتيب
   ═══════════════════════════════════════════════════════════════════════════ */

test("filterEntries: النوع والمجموعة والخطورة ووسوم الصدق", () => {
  assert.equal(D.filterEntries(DEC_MIX, {}).length, DEC_MIX.length);
  const onlyRemoved = D.filterEntries(DEC_MIX,
    { kinds: { added: false, changed: false, removed: true } });
  assert.equal(onlyRemoved.length, 1);
  assert.equal(onlyRemoved[0].kind, "removed");

  const onlyMeta = D.filterEntries(DEC_MIX, { group: "meta" });
  assert.equal(onlyMeta.length, 2);

  const onlyHigh = D.filterEntries(DEC_MIX, { severity: "high" });
  assert.ok(onlyHigh.every((e) => e.severity === "high"));

  const onlyHonesty = D.filterEntries(DEC_MIX, { honestyOnly: true });
  assert.ok(onlyHonesty.length >= 1);
  assert.ok(onlyHonesty.every((e) => e.honesty));
});

test("filterEntries: البحث الحر يطابق المسار والتسمية بعد التطبيع", () => {
  const byPath = D.filterEntries(DEC_MIX, { query: "compliance" });
  assert.ok(byPath.length >= 1);
  assert.ok(byPath.every((e) => e.path.indexOf("compliance") !== -1));

  const byLabel = D.filterEntries(DEC_MIX, { query: "الاسرة" });
  assert.ok(byLabel.length >= 1, "التطبيع يجعل «الاسرة» تطابق «الأسرّة»");

  // كل الكلمات مطلوبة (AND) لا أيها
  const both = D.filterEntries(DEC_MIX, { query: "المقاييس القيمة" });
  assert.ok(both.length >= 1);
  const none = D.filterEntries(DEC_MIX, { query: "المقاييس زقاق" });
  assert.equal(none.length, 0);
});

test("sortEntries: الترتيب حتمي ولا يفقد صفاً", () => {
  for (const key of ["path", "severity", "kind", "delta", "group"]) {
    const a = D.sortEntries(DEC_MIX, key, "asc");
    const b = D.sortEntries(DEC_MIX, key, "asc");
    assert.equal(a.length, DEC_MIX.length);
    assert.deepEqual(a.map((e) => e.path), b.map((e) => e.path), key);
  }
});

test("sortEntries: الخطورة تصعد بالأشد أولاً والنوع يبدأ بالحذف", () => {
  const bySev = D.sortEntries(DEC_MIX, "severity", "asc");
  assert.equal(bySev[0].severity, "high");
  const byKind = D.sortEntries(DEC_MIX, "kind", "asc");
  assert.equal(byKind[0].kind, "removed");
  const byDelta = D.sortEntries(DEC_MIX, "delta", "asc");
  assert.ok(byDelta[0].delta, "الأكبر فرقاً أولاً");
});

test("sortEntries: عكس الاتجاه يعكس الترتيب فعلاً", () => {
  const asc = D.sortEntries(DEC_MIX, "path", "asc").map((e) => e.path);
  const desc = D.sortEntries(DEC_MIX, "path", "desc").map((e) => e.path);
  assert.deepEqual(desc, asc.slice().reverse());
});

/* ═══════════════════════════════════════════════════════════════════════════
   11) حساب الترقيم
   ═══════════════════════════════════════════════════════════════════════════ */

test("paginate: الحساب الأساسي وحدود العرض البشرية", () => {
  const items = Array.from({ length: 57 }, (_, i) => i);
  const p1 = norm(D.paginate(items, 1, 25));
  assert.equal(p1.pages, 3);
  assert.equal(p1.from, 1);
  assert.equal(p1.to, 25);
  assert.equal(p1.slice.length, 25);
  assert.equal(p1.hasPrev, false);
  assert.equal(p1.hasNext, true);

  const p3 = norm(D.paginate(items, 3, 25));
  assert.equal(p3.from, 51);
  assert.equal(p3.to, 57);
  assert.equal(p3.slice.length, 7);
  assert.equal(p3.hasNext, false);
});

test("paginate: يقصّ رقم الصفحة داخل المدى في الطرفين", () => {
  const items = Array.from({ length: 10 }, (_, i) => i);
  assert.equal(D.paginate(items, 0, 5).page, 1);
  assert.equal(D.paginate(items, -7, 5).page, 1);
  assert.equal(D.paginate(items, 99, 5).page, 2);
  assert.equal(D.paginate(items, 1.9, 5).page, 1);
});

test("paginate: القائمة الفارغة صفحة واحدة بحدود صفرية", () => {
  const p = norm(D.paginate([], 3, 25));
  assert.equal(p.pages, 1);
  assert.equal(p.page, 1);
  assert.equal(p.total, 0);
  assert.equal(p.from, 0);
  assert.equal(p.to, 0);
  assert.deepEqual(p.slice, []);
  assert.equal(p.hasPrev, false);
  assert.equal(p.hasNext, false);
});

test("paginate: مقاس صفحة غير صالح يعود إلى 25، والتقسيم لا يفقد عنصراً", () => {
  const items = Array.from({ length: 30 }, (_, i) => i);
  assert.equal(D.paginate(items, 1, 0).perPage, 25);
  assert.equal(D.paginate(items, 1, -3).perPage, 25);
  assert.equal(D.paginate(items, 1, NaN).perPage, 25);

  for (const size of [1, 3, 7, 10, 25, 100]) {
    const seen = [];
    const pages = D.paginate(items, 1, size).pages;
    for (let i = 1; i <= pages; i++) {
      for (const x of D.paginate(items, i, size).slice) seen.push(x);
    }
    assert.deepEqual(seen, items, "مقاس " + size);
  }
});

test("pageWindow: نافذة حول الحالية مع فجوات صريحة", () => {
  assert.deepEqual(norm(D.pageWindow(1, 1, 2)), [1]);
  assert.deepEqual(norm(D.pageWindow(1, 5, 2)), [1, 2, 3, 4, 5],
    "فجوة صفحة واحدة تُملأ برقمها لا بـ«…»");
  assert.deepEqual(norm(D.pageWindow(1, 20, 2)), [1, 2, 3, null, 20]);
  assert.deepEqual(norm(D.pageWindow(10, 20, 2)), [1, null, 8, 9, 10, 11, 12, null, 20]);
  assert.deepEqual(norm(D.pageWindow(20, 20, 2)), [1, null, 18, 19, 20]);
  // رقم خارج المدى يُقصّ قبل بناء النافذة
  assert.deepEqual(norm(D.pageWindow(99, 3, 2)), [1, 2, 3]);
});

/* ═══════════════════════════════════════════════════════════════════════════
   12) التقارير النصية
   ═══════════════════════════════════════════════════════════════════════════ */

test("textReport: ترويسة الهوية والإجماليات وكل فرق بسطره ووسمه", () => {
  const t = D.textReport(DEC_MIX, REL, DRAFT_MIX);
  assert.ok(t.indexOf(REL.release.id) !== -1);
  assert.ok(t.indexOf("نسخة 3") !== -1);
  assert.ok(t.indexOf("إجمالي الفروق") !== -1);
  assert.ok(t.indexOf("metrics.total_demand.value") !== -1);
  assert.ok(t.indexOf(REL.compliance.note) !== -1, "وسم المنهجية يسافر مع التقرير");
  for (const e of DEC_MIX) assert.ok(t.indexOf(e.path) !== -1, e.path);
});

test("textReport: قائمة فارغة تقول ذلك صراحةً", () => {
  const t = D.textReport([], REL, DRAFT_MIX);
  assert.ok(t.indexOf("لا فروق في الحقول المقارَنة.") !== -1);
});

test("csvReport: ترويسة وصف لكل فرق مع تهريب علامات الاقتباس", () => {
  const csv = D.csvReport(DEC_MIX);
  const lines = csv.split("\r\n");
  assert.equal(lines.length, DEC_MIX.length + 1);
  assert.ok(lines[0].indexOf("المسار") !== -1);
  const quoted = D.csvReport([{
    path: "meta.title", kind: "changed", group: "meta",
    from: 'قال "نعم"', to: "لا", fromText: 'قال "نعم"', toText: "لا",
  }]);
  assert.ok(quoted.indexOf('""نعم""') !== -1, quoted);
});

/* ═══════════════════════════════════════════════════════════════════════════
   13) منشئ الموجز — الاختيار والتوليفات
   ═══════════════════════════════════════════════════════════════════════════ */

test("reportBuilder: وحدة الموجز متاحة والقوائم مطابقة لعقد الصفحات", () => {
  assert.equal(B.reportAvailable(), true);
  assert.deepEqual(norm(B.allPageIds()), norm(P.PAGE_IDS));
  assert.deepEqual(norm(B.mandatoryIds()), norm(P.MANDATORY_PAGE_IDS));
  assert.deepEqual(norm(B.sectionIds()), norm(P.SECTION_PAGE_IDS));
  assert.deepEqual(norm(B.FALLBACK_PAGE_IDS), norm(P.PAGE_IDS),
    "القائمة الاحتياطية يجب أن تبقى مرآة للقائمة القانونية");
  assert.deepEqual(norm(B.FALLBACK_MANDATORY), norm(P.MANDATORY_PAGE_IDS));
});

test("reportBuilder.normalize: يفوّض إلى normalizePages حرفياً", () => {
  const cases = [null, [], ["control"], ["control", "summary"], "summary,control",
    ["nope"], ["cover", "provenance"], ["demand", "demand"]];
  for (const c of cases) {
    assert.deepEqual(norm(B.normalize(c)), norm(P.normalizePages(c)),
      JSON.stringify(c));
  }
});

test("reportBuilder.normalize: الترتيب قانوني لا ترتيب الإدخال، والمجهول يُسقط", () => {
  assert.deepEqual(norm(B.normalize(["closing", "summary", "nope"])),
    ["summary", "closing"]);
  assert.deepEqual(norm(B.normalize([])), norm(P.SECTION_PAGE_IDS));
  assert.deepEqual(norm(B.normalize(["cover"])), norm(P.SECTION_PAGE_IDS),
    "الصفحة الإلزامية ليست صفحة أقسام — اختيارها وحدها = الكل");
});

test("reportBuilder.serialize/isRestricted: الاختيار الكامل بلا معامل", () => {
  assert.equal(B.serialize(null), "");
  assert.equal(B.serialize(norm(P.SECTION_PAGE_IDS)), "");
  assert.equal(B.isRestricted(null), false);
  assert.equal(B.serialize(["summary", "closing"]), "summary,closing");
  assert.equal(B.isRestricted(["summary"]), true);
});

test("reportBuilder.reportHref: يطابق العنوان الذي يقرؤه الموجّه", () => {
  assert.equal(B.reportHref(null), "#/report");
  assert.equal(B.reportHref(["summary", "closing"]),
    "#/report?pages=" + encodeURIComponent("summary,closing"));
});

test("reportBuilder: التوليفات صالحة كلها ومطابقتها انعكاسية", () => {
  for (const p of norm(B.PRESETS)) {
    const pages = norm(B.presetPages(p));
    assert.ok(pages.length > 0, p.id);
    for (const id of pages) {
      assert.ok(norm(P.SECTION_PAGE_IDS).indexOf(id) !== -1, p.id + "/" + id);
    }
    assert.equal(B.matchPreset(pages), p.id, p.id);
  }
  assert.equal(B.matchPreset(["summary"]), null);
  assert.equal(B.presetFor("board").id, "board");
  assert.equal(B.presetFor("nope"), null);
  assert.deepEqual(norm(B.presetPages(B.presetFor("full"))), norm(P.SECTION_PAGE_IDS));
});

test("reportBuilder: كل صفحة قانونية لها تلميح مكتوب — لا صف بلا شرح", () => {
  const hints = norm(B.PAGE_HINT);
  for (const id of norm(P.PAGE_IDS)) {
    assert.ok(typeof hints[id] === "string" && hints[id].length > 8, id);
  }
});

test("reportBuilder: الاختيار يُحفظ ويُقرأ مطبَّعاً عبر المخزن المحلي", () => {
  storeMap.clear();
  assert.equal(B.loadSelection(), null);
  B.setSelection(["closing", "summary", "nope"]);
  assert.deepEqual(norm(B.selection()), ["summary", "closing"]);
  assert.deepEqual(norm(B.loadSelection()), ["summary", "closing"]);
  assert.equal(storeMap.has(B.STORAGE_KEY), true);

  // محتوى تالف لا يُسقط التبويب
  storeMap.set(B.STORAGE_KEY, "{ليس JSON");
  assert.equal(B.loadSelection(), null);
  storeMap.set(B.STORAGE_KEY, '{"a":1}');
  assert.equal(B.loadSelection(), null);

  B.setSelection(null);
  assert.deepEqual(norm(B.selection()), norm(P.SECTION_PAGE_IDS));
  storeMap.clear();
});

test("reportBuilder: سجل الاختيارات محدود ولا يكرر الاختيار نفسه", () => {
  storeMap.clear();
  B.pushHistory(["summary"]);
  B.pushHistory(["closing"]);
  B.pushHistory(["summary"]);
  const hist = norm(B.loadHistory());
  assert.equal(hist.length, 2);
  assert.deepEqual(hist[0].pages, ["summary"]);
  for (let i = 0; i < 20; i++) B.pushHistory([norm(P.SECTION_PAGE_IDS)[i % 10]]);
  assert.ok(norm(B.loadHistory()).length <= B.HISTORY_MAX);
  storeMap.clear();
});

/* ═══════════════════════════════════════════════════════════════════════════
   14) منشئ الموجز — التلخيص وما يفقده الحصر
   ═══════════════════════════════════════════════════════════════════════════ */

const FULL_MODEL = P.model(REL, DER, { geo: GEO, now: NOW });

test("summarizePage: العدّادات مطابقة لما في النموذج فعلاً", () => {
  for (const page of FULL_MODEL.pages) {
    const s = norm(B.summarizePage(page));
    assert.equal(s.id, page.id);
    assert.equal(s.figures, (page.figures || []).length, page.id);
    assert.equal(s.charts, (page.charts || []).length, page.id);
    assert.equal(s.tables, (page.tables || []).length, page.id);
    assert.equal(s.insights, (page.insights || []).length, page.id);
    assert.equal(s.caveats, (page.caveats || []).length, page.id);
    let rows = 0;
    for (const t of page.tables || []) rows += (t.rows || []).length;
    assert.equal(s.tableRows, rows, page.id);
    assert.equal(s.blocks, s.figures + s.charts + s.tables + s.insights, page.id);
  }
});

test("summarizePage: صفحة فارغة أو غائبة لا تُسقط الحساب", () => {
  const z = norm(B.summarizePage(null));
  assert.equal(z.figures, 0);
  assert.equal(z.tableRows, 0);
  assert.equal(z.blocks, 0);
  assert.deepEqual(z.caveatTexts, []);
});

test("aggregateById: «جداول الملاحق» صفحتان في النموذج وصفحة اختيار واحدة", () => {
  const ids = FULL_MODEL.pages.map((p) => p.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.ok(dup.length >= 1, "النموذج الكامل يقسّم صفحة طويلة على أكثر من صفحة منطقية");

  const per = norm(B.summarizeModel(FULL_MODEL)).pages;
  const merged = norm(B.aggregateById(per));
  assert.equal(merged.length, norm(P.SECTION_PAGE_IDS).length,
    "بعد الدمج: بطاقة لكل صفحة اختيار لا لكل صفحة منطقية");
  assert.deepEqual(merged.map((m) => m.id).slice().sort(),
    norm(P.SECTION_PAGE_IDS).slice().sort());

  const app = merged.find((m) => m.id === "appendix-tables");
  assert.equal(app.parts, ids.filter((x) => x === "appendix-tables").length);
  let rows = 0;
  for (const p of per) if (p.id === "appendix-tables") rows += p.tableRows;
  assert.equal(app.tableRows, rows, "الصفوف تُجمع لا تُفقد");
});

test("aggregateById: الوسم المكرر على جزأي الصفحة يُعدّ مرة واحدة", () => {
  const merged = norm(B.aggregateById([
    { id: "x", title: "س", kicker: "", figures: 1, charts: 0, chartCaveats: 0,
      tables: 1, tableRows: 5, insights: 0, caveats: 1, caveatTexts: ["وسم أ"], blocks: 2 },
    { id: "x", title: "س", kicker: "", figures: 2, charts: 1, chartCaveats: 0,
      tables: 1, tableRows: 3, insights: 1, caveats: 2,
      caveatTexts: ["وسم أ", "وسم ب"], blocks: 5 },
  ]));
  assert.equal(merged.length, 1);
  assert.equal(merged[0].parts, 2);
  assert.equal(merged[0].figures, 3);
  assert.equal(merged[0].tableRows, 8);
  assert.deepEqual(merged[0].caveatTexts, ["وسم أ", "وسم ب"]);
  assert.equal(merged[0].caveats, 2);
  assert.deepEqual(norm(B.aggregateById(null)), []);
});

test("summarizeModel: الإجماليات مجموع الصفحات بالضبط", () => {
  const s = norm(B.summarizeModel(FULL_MODEL));
  assert.equal(s.pages.length, FULL_MODEL.pages.length);
  let fig = 0, cav = 0;
  for (const p of s.pages) { fig += p.figures; cav += p.caveats; }
  assert.equal(s.totals.figures, fig);
  assert.equal(s.totals.caveats, cav);
  assert.ok(s.totals.caveats > 0, "الموجز الكامل يحمل وسوم صدق حتماً");
});

test("summarizePage: صفحة الرقابة تحمل وسم منهجية 81.6٪ بنصه", () => {
  const page = FULL_MODEL.pages.find((p) => p.id === "control");
  assert.ok(page, "صفحة الرقابة موجودة في النموذج الكامل");
  const s = norm(B.summarizePage(page));
  assert.ok(s.caveats > 0);
  assert.ok(s.caveatTexts.some((t) => t.indexOf(REL.compliance.note) !== -1),
    JSON.stringify(s.caveatTexts));
});

test("missingFrom: إسقاط الرقابة يُعلن فقد وسم المنهجية صراحةً", () => {
  const keep = norm(P.SECTION_PAGE_IDS).filter((id) => id !== "control");
  const miss = norm(B.missingFrom(FULL_MODEL, keep));
  assert.equal(miss.restricted, true);
  assert.equal(miss.dropped.length, 1);
  assert.equal(miss.dropped[0].id, "control");
  assert.ok(miss.caveatTexts.some((t) => t.indexOf(REL.compliance.note) !== -1),
    JSON.stringify(miss.caveatTexts));
  assert.ok(miss.lost.figures > 0);
});

test("missingFrom: إسقاط التوقعات يُعلن فقد تنويه السيناريوهات", () => {
  const keep = norm(P.SECTION_PAGE_IDS).filter((id) => id !== "forecast");
  const miss = norm(B.missingFrom(FULL_MODEL, keep));
  assert.ok(miss.caveatTexts.some((t) => t.indexOf(REL.scenarios.caveat) !== -1),
    JSON.stringify(miss.caveatTexts));
});

test("missingFrom: الاختيار الكامل لا يفقد شيئاً", () => {
  const miss = norm(B.missingFrom(FULL_MODEL, null));
  assert.equal(miss.restricted, false);
  assert.equal(miss.dropped.length, 0);
  assert.deepEqual(miss.caveatTexts, []);
  assert.equal(miss.lost.figures, 0);
});

test("buildModel/buildPlan/sheetsByPage: المعاينة تقرأ محرك الترقيم نفسه", () => {
  const model = B.buildModel(REL, DER, GEO, ["summary", "closing"], NOW);
  assert.ok(model);
  assert.deepEqual(norm(model.pages.map((p) => p.id)), ["summary", "closing"]);
  const planned = B.buildPlan(model);
  assert.ok(planned && planned.total > 0);
  const byPage = norm(B.sheetsByPage(planned));
  assert.ok(byPage.cover >= 1, "الغلاف ورقة دائماً");
  assert.ok(byPage.summary >= 1);
  assert.ok(byPage.provenance >= 1, "صفحة الإسناد لا تُسقط");
  let sum = 0;
  for (const k of Object.keys(byPage)) sum += byPage[k];
  assert.equal(sum, planned.total, "مجموع أوراق الصفحات = إجمالي الخطة");
  assert.equal(norm(B.sheetsByPage(null)) && Object.keys(norm(B.sheetsByPage(null))).length, 0);
});

test("reportBuilder: معدودات الواجهة تطابق العدد والمعدود", () => {
  assert.equal(B.pagesNoun(0), "لا صفحات");
  assert.equal(B.pagesNoun(1), "صفحة واحدة");
  assert.equal(B.pagesNoun(2), "صفحتان");
  assert.equal(B.pagesNoun(3), "3" + fmt.NBSP + "صفحات");
  assert.equal(B.pagesNoun(11), "11" + fmt.NBSP + "صفحة");
  assert.equal(B.sheetsNoun(2), "ورقتان");
  assert.equal(B.figuresNoun(1), "رقم واحد");
  assert.equal(B.chartsNoun(2), "رسمان");
  assert.equal(B.tablesNoun(4), "4" + fmt.NBSP + "جداول");
  assert.equal(B.rowsNoun(2), "صفان");
  assert.equal(B.insightsNoun(3), "3" + fmt.NBSP + "رؤى");
  assert.equal(B.caveatsNoun(1), "وسم واحد");
});
