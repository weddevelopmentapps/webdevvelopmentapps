/* methodology-model.test.mjs — ملحقا الإسناد: المنهجية وسجل القرارات
   ─────────────────────────────────────────────────────────────────────────
   عقد التوسعة §8 (‏8.1 و8.2 معاً — الجدول في §0 يضع اختبار سجل القرارات
   داخل هذا الملف). ما يُثبَت هنا هو ما يمنع الانجراف الذي يرفضه المدقق:

     • **لا اختلاق**: كل قيمة إسناد تُقرأ من `release` حرفياً، وكل قرار في
       السجل **سلسلة فرعية حرفية** من نص بطاقة رؤية معتمدة (يُفحص بالاحتواء
       على نص البطاقة وعلى نص الإصدار كاملاً).
     • **لا رقم متجمّد في كود**: جدول قرارات المطابقة R1–R12 خالٍ من الأرقام
       تماماً — أرقامه تأتي حيّة من الإصدار عبر «القرينة».
     • **الوسم يسافر مع الرقم**: سجل الوسوم الملازمة يحمل نص الإصدار الحرفي
       لكل قيمة موسومة (‏81.6٪ ومنهجيتها، التحفظ، الهدف الاسترشادي، العينة).
     • **العد الحي لا المكتوب**: نموذج البوابات ناتج تشغيل فعلي لمحرك التحقق،
       ويحمل ما سجّله المولّد منفصلاً بوسم «غير قابلين للمقارنة».
     • **حساب الترقيم والترتيب والبحث صادق**: حدود الصفحات ونوافذ الأزرار
       والقيم الغائبة والمفاتيح المجهولة — كلها بسلوك معلن ومختبَر.
     • **الصدق عند النقص**: إصدار ناقص أو وحدة تحقق غائبة تعطي حالة صادقة
       لا صفراً مضللاً ولا انهياراً.

   الوحدتان تُحمَّلان بملفيهما الحقيقيين: `load-app.mjs` يبني RH كاملة
   (core + derive + validate + geoutils + micro) في سياق vm، ثم يُنفَّذ كل
   ملف ملحق بوسم RH ذاته — فالنموذج النقي يُعرَّف دون DOM، وتسجيل الملحق
   يتخطى نفسه بغياب `RH.presenter.ax` (عقد قابلية الاختبار §0).
   لم يُعدَّل `load-app.mjs` (ملف المعمار) ولا أي ملف خارج عقد هذه الميزة. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RH, ROOT, freshRelease } from "./load-app.mjs";

/* تنفيذ ملفَّي الميزة على RH الحقيقية — بلا نسخ منطق ولا محاكاة للوحدتين */
const AX_DIR = path.join(ROOT, "src", "js", "presenter", "appendix");
const METH_SRC = readFileSync(path.join(AX_DIR, "ax-methodology.js"), "utf8");
const DEC_SRC = readFileSync(path.join(AX_DIR, "ax-decisions.js"), "utf8");
new Function("RH", METH_SRC)(RH);
new Function("RH", DEC_SRC)(RH);

const M = RH.explore.methodology;
const D = RH.explore.decisions;
const fmt = RH.core.fmt;
const rel = freshRelease();

/** نسخة معدّلة معزولة — لا اختبار يلوث إصدار اختبار آخر */
function mutated(fn) {
  const copy = freshRelease();
  fn(copy);
  return copy;
}

/* ══════════════════════════════════════════════════════════════════════
   0) تحميل الوحدتين وشكل الواجهة
   ══════════════════════════════════════════════════════════════════════ */

test("الوحدتان تُعرَّفان على RH.explore دون لمس DOM ودون تسجيل ملحق", () => {
  assert.ok(M, "RH.explore.methodology غير معرَّف");
  assert.ok(D, "RH.explore.decisions غير معرَّف");
  assert.equal(typeof RH.explore.decisionsModel, "function",
    "الاختصار المتعاقد عليه في §8.2 غائب — وهو إشارة وجود الملحق للوحة الأوامر");
  /* ax-shell غائب في بيئة الوحدة فلا يجوز أن يكون التسجيل قد وقع */
  assert.equal(RH.presenter.ax, undefined,
    "تسجيل الملحق يجب أن يتخطى نفسه بغياب الهيكل");
});

test("إشارتا الوجود اللتان تفحصهما لوحة الأوامر متحققتان", () => {
  /* palette.js: methodology → RH.explore.methodology || methodologyModel،
     decisions → typeof RH.explore.decisionsModel === "function" */
  assert.ok(RH.explore.methodology || RH.explore.methodologyModel);
  assert.equal(typeof RH.explore.decisionsModel, "function");
});

test("دوال النموذج النقي كلها معرَّفة بالأسماء المتعاقد عليها", () => {
  for (const fn of ["shortSha", "identity", "sources", "periodRows",
    "standingDisclaimers", "provenanceRows", "rawRows", "derivedRows",
    "originText", "valueText", "valueWithUnit", "dependencyChain",
    "dependentsOf", "searchRows", "filterRows", "sortRows", "paginate",
    "pageWindow", "gatesModel", "filterGates", "flaggedValues",
    "reconciliation", "reconciliationById", "reconciliationStats",
    "evidenceFor", "decisionsWithEvidence", "describeRow", "sheetIndex",
    "coverageStats", "normalize", "statusLabel"]) {
    assert.equal(typeof M[fn], "function", "الدالة الغائبة: " + fn);
  }
  for (const fn of ["decisionsModel", "excludedPanels", "splitRecommendation",
    "hasRecommendation", "markerIndex", "groupBySection", "countByCls",
    "filterByCls", "filterBySection", "searchDecisions", "decisionById",
    "nextStepsModel", "summary", "describe", "verbatimCheck", "clsLabel",
    "normalizeCls", "sectionMeta", "allPanels"]) {
    assert.equal(typeof D[fn], "function", "الدالة الغائبة: " + fn);
  }
});

/* ══════════════════════════════════════════════════════════════════════
   1) هوية الإصدار والمصادر — قراءة حرفية
   ══════════════════════════════════════════════════════════════════════ */

test("اختصار البصمة قالب ثابت لا تقصير عشوائي", () => {
  const sha = "0123456789abcdef0123456789abcdef";
  assert.equal(M.shortSha(sha, 16), "0123456789abcdef…");
  assert.equal(M.shortSha(sha, 8), "01234567…");
  assert.equal(M.shortSha("abc", 16), "abc", "أقصر من الحد لا يُلحق به قطع");
  assert.equal(M.shortSha("", 16), "—");
  assert.equal(M.shortSha(null), "—");
  /* الافتراضي 16 محرفاً — القالب نفسه في كل مواضع العرض */
  assert.equal(M.shortSha(sha), sha.slice(0, 16) + "…");
});

test("هوية الإصدار تنقل حقول release حرفياً", () => {
  const id = M.identity(rel);
  assert.equal(id.id, rel.release.id);
  assert.equal(id.status, rel.release.status);
  assert.equal(id.publishedAt, rel.release.published_at);
  assert.equal(id.publishedBy, rel.release.published_by);
  assert.equal(id.sha256, rel.release.sha256);
  assert.equal(id.notes, rel.release.notes);
  assert.equal(id.schemaVersion, rel.schema_version);
  assert.equal(id.shaShort, M.shortSha(rel.release.sha256, 16));
});

test("غياب الإصدار السابق يبقى null ولا يُخترع له سلف", () => {
  const id = M.identity(rel);
  assert.equal(rel.release.base_release_id, null);
  assert.equal(id.baseReleaseId, null);
  const withBase = M.identity(mutated((r) => { r.release.base_release_id = "rel-000"; }));
  assert.equal(withBase.baseReleaseId, "rel-000");
});

test("هوية إصدار فارغ لا تنهار وتعطي شرطات صادقة", () => {
  const id = M.identity({});
  assert.equal(id.id, "—");
  assert.equal(id.shaShort, "—");
  assert.equal(id.baseReleaseId, null);
  assert.doesNotThrow(() => M.identity(null));
});

test("سجل المصادر ينقل الهاش وخصوصية الملف", () => {
  const srcs = M.sources(rel);
  assert.equal(srcs.length, rel.sources.length);
  const s = srcs[0];
  assert.equal(s.name, rel.sources[0].name);
  assert.equal(s.sha256, rel.sources[0].sha256);
  assert.equal(s.templateVersion, rel.sources[0].template_version);
  assert.equal(s.isPrivate, true);
  assert.match(s.privacyNote, /يُسجَّل هاشه فقط/);
  assert.equal(M.sourceName(rel, s.id), s.name);
  assert.equal(M.sourceName(rel, "لا-يوجد"), "لا-يوجد",
    "معرف غير معروف يُعرض كما هو لا يُستبدل باسم مختلق");
});

test("مصدر غير خاص لا يحمل وسم الخصوصية", () => {
  const open = M.sources(mutated((r) => { r.sources[0].private = false; }));
  assert.equal(open[0].isPrivate, false);
  assert.equal(open[0].privacyNote, "");
});

test("صفوف الفترات تفصل التواريخ الأربعة ولا تخلطها", () => {
  const rows = M.periodRows(rel);
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  for (const id of ["monitoring_period", "data_as_of", "calculation_date",
    "presentation_date", "baseline_label", "comparison_qualifier"]) {
    assert.ok(byId[id], "الصف الغائب: " + id);
  }
  assert.equal(byId.monitoring_period.value, rel.meta.monitoring_period_label);
  assert.equal(byId.data_as_of.value, rel.meta.data_as_of);
  assert.equal(byId.calculation_date.value, fmt.date(rel.meta.calculation_date));
  assert.equal(byId.baseline_label.value, rel.meta.baseline_label);
});

test("تاريخ العرض يحمل وسم «بانتظار التأكيد» حين يوجبه الإصدار", () => {
  const rows = M.periodRows(rel);
  const pres = rows.find((r) => r.id === "presentation_date");
  assert.equal(rel.meta.presentation_date_needs_confirmation, true);
  assert.equal(pres.flag, "بانتظار التأكيد");

  const confirmed = M.periodRows(mutated((r) => {
    r.meta.presentation_date_needs_confirmation = false;
  }));
  assert.equal(confirmed.find((x) => x.id === "presentation_date").flag, null);
});

test("صف بلا قيمة يسقط بصمت، وتاريخ العرض يبقى لأن غيابه معلومة", () => {
  const rows = M.periodRows(mutated((r) => {
    r.meta.baseline_label = "";
    r.meta.presentation_date = null;
  }));
  assert.equal(rows.some((x) => x.id === "baseline_label"), false);
  assert.equal(rows.some((x) => x.id === "presentation_date"), true);
});

test("الإخلاءات الدائمة تنقل نص الإصدار حرفياً", () => {
  const disc = M.standingDisclaimers(rel);
  const byId = Object.fromEntries(disc.map((d) => [d.id, d]));
  assert.equal(byId.map_disclaimer.text, rel.meta.map_disclaimer);
  assert.equal(byId.sample_label.text, rel.meta.sample_label);
  assert.equal(byId.ranking_note.text, rel.neighbourhoods.ranking_note);
  /* كل إخلاء يحمل قاعدته الملزمة — الوسم بلا قاعدة زينة */
  for (const d of disc) assert.ok(d.rule.length > 10);
});

/* ══════════════════════════════════════════════════════════════════════
   2) أصل كل مقياس
   ══════════════════════════════════════════════════════════════════════ */

test("جدول الأصل يغطي كل مقياس خام وكل مشتقة قياسية", () => {
  const raws = M.rawRows(rel);
  const ders = M.derivedRows(rel);
  assert.equal(raws.length, Object.keys(rel.metrics).length);
  const scalarDerived = Object.keys(rel.derived)
    .filter((k) => !M.COMPOSITE_DERIVED.includes(k));
  assert.equal(ders.length, scalarDerived.length);
  const all = M.provenanceRows(rel);
  assert.equal(all.length, raws.length + ders.length);
  /* الخام أولاً ثم المشتق — ترتيب القراءة الطبيعي */
  assert.equal(all[0].kind, "raw");
  assert.equal(all[all.length - 1].kind, "derived");
});

test("الكتل المشتقة المركّبة مستثناة من صفوف القيم المفردة", () => {
  const ids = M.derivedRows(rel).map((r) => r.id);
  for (const composite of M.COMPOSITE_DERIVED) {
    assert.equal(ids.includes(composite), false,
      "كتلة مركّبة تسربت صفاً مفرداً: " + composite);
  }
  assert.ok(M.COMPOSITE_DERIVED.includes("sector_derived"));
  assert.ok(M.COMPOSITE_DERIVED.includes("rankings"));
});

test("صف المقياس الخام يحمل ورقته ومرساته ومصنفه", () => {
  const row = M.rowById(M.provenanceRows(rel), "total_demand");
  assert.equal(row.kind, "raw");
  assert.equal(row.value, rel.metrics.total_demand.value);
  assert.equal(row.unit, rel.metrics.total_demand.unit);
  assert.equal(row.sheet, rel.metrics.total_demand.sheet);
  assert.equal(row.anchor, rel.metrics.total_demand.anchor);
  assert.equal(row.label, rel.metrics.total_demand.label);
  assert.equal(row.sourceName, rel.sources[0].name);
  assert.deepEqual(row.inputs, []);
});

test("صف المشتقة يحمل صيغتها وإصدارها ومدخلاتها", () => {
  const row = M.rowById(M.provenanceRows(rel), "coverage_pct");
  assert.equal(row.kind, "derived");
  assert.equal(row.value, rel.derived.coverage_pct.value);
  assert.equal(row.formula, rel.derived.coverage_pct.formula);
  assert.equal(row.formulaVersion, rel.derived.coverage_pct.formula_version);
  assert.deepEqual(row.inputs, rel.derived.coverage_pct.inputs);
});

test("اسم المشتقة من القاموس حين لا يحمل الإصدار label", () => {
  assert.equal(rel.derived.coverage_pct.label, undefined);
  assert.equal(M.metricLabel("coverage_pct", rel.derived.coverage_pct),
    M.DERIVED_AR.coverage_pct);
  /* label الوارد في البيانات يتقدم على القاموس دائماً */
  assert.equal(M.metricLabel("coverage_pct", { label: "اسم من البيانات" }),
    "اسم من البيانات");
  assert.equal(M.metricLabel("مقياس_مجهول", {}), "مقياس_مجهول");
});

test("تنسيق القيمة يمر عبر fmt حصراً: النسب بعلامتها والأعداد بفاصلها", () => {
  const cov = M.rowById(M.provenanceRows(rel), "coverage_pct");
  const dem = M.rowById(M.provenanceRows(rel), "total_demand");
  assert.equal(M.valueText(cov), fmt.pct(rel.derived.coverage_pct.value));
  assert.equal(M.valueText(dem), fmt.int(rel.metrics.total_demand.value));
  assert.equal(M.valueWithUnit(dem),
    fmt.int(rel.metrics.total_demand.value) + fmt.NBSP + "سرير");
  assert.equal(M.valueWithUnit(cov), fmt.pct(rel.derived.coverage_pct.value),
    "النسبة لا تُلحق بها وحدة مكررة");
  assert.equal(M.valueText(null), "—");
  assert.equal(M.valueText({ value: null }), "—");
});

test("سطر المصدر يميّز الخام من المشتق بصيغتين ثابتتين", () => {
  const raw = M.rowById(M.provenanceRows(rel), "licensed_beds");
  const der = M.rowById(M.provenanceRows(rel), "deficit_beds");
  const rawText = M.originText(raw);
  assert.ok(rawText.includes(rel.metrics.licensed_beds.sheet));
  assert.ok(rawText.includes(rel.metrics.licensed_beds.anchor));
  const derText = M.originText(der);
  assert.ok(derText.includes(rel.derived.deficit_beds.formula));
  assert.ok(derText.includes(rel.derived.deficit_beds.formula_version));
  assert.equal(M.originText(null), "—");
});

test("سلسلة الاعتماد تنزل حتى القيم الخام", () => {
  const chain = M.dependencyChain(rel, "coverage_pct");
  assert.deepEqual(chain.map((c) => c.id).sort(),
    ["licensed_beds", "total_demand"].sort());
  assert.ok(chain.every((c) => c.depth === 1));

  const deep = M.dependencyChain(rel, "uncovered_pct");
  const byId = Object.fromEntries(deep.map((c) => [c.id, c]));
  assert.equal(byId.coverage_pct.depth, 1);
  assert.equal(byId.licensed_beds.depth, 2);
  assert.equal(byId.licensed_beds.via, "coverage_pct");
  assert.equal(byId.total_demand.depth, 2);
});

test("سلسلة الاعتماد آمنة ضد الدوران ومحدودة العمق", () => {
  const cyclic = mutated((r) => {
    r.derived.a_cycle = {
      id: "a_cycle", value: 1, unit: "", kind: "derived",
      formula: "b", formula_version: "fv1", inputs: ["b_cycle"],
    };
    r.derived.b_cycle = {
      id: "b_cycle", value: 2, unit: "", kind: "derived",
      formula: "a", formula_version: "fv1", inputs: ["a_cycle"],
    };
  });
  const chain = M.dependencyChain(cyclic, "a_cycle", 6);
  assert.equal(chain.length, 1, "الدوران لا يكرر عقدة مزارة");
  assert.equal(chain[0].id, "b_cycle");
});

test("مدخل غير موجود في الإصدار يظهر عقدة بلا صف لا يُختلق له صف", () => {
  const broken = mutated((r) => {
    r.derived.coverage_pct.inputs = ["total_demand", "مقياس_غائب"];
  });
  const chain = M.dependencyChain(broken, "coverage_pct");
  const missing = chain.find((c) => c.id === "مقياس_غائب");
  assert.ok(missing);
  assert.equal(missing.row, null);
});

test("المعتمدون على مقياس يُحسبون من المدخلات المعلنة", () => {
  const deps = M.dependentsOf(rel, "total_demand").map((r) => r.id);
  assert.ok(deps.includes("deficit_beds"));
  assert.ok(deps.includes("coverage_pct"));
  assert.ok(deps.includes("blue_share_pct"));
  assert.equal(M.dependentsOf(rel, "لا-أحد").length, 0);
});

test("توزيع الأوراق وإحصاء التغطية يطابقان الإصدار", () => {
  const stats = M.coverageStats(rel);
  assert.equal(stats.raw, Object.keys(rel.metrics).length);
  assert.equal(stats.total, stats.raw + stats.derived);
  assert.equal(stats.sources, rel.sources.length);

  const sheets = M.sheetIndex(rel);
  const sum = sheets.reduce((a, s) => a + s.count, 0);
  assert.equal(sum, stats.raw, "مجموع مقاييس الأوراق = كل المقاييس الخام");
  assert.equal(sheets.length, stats.sheets);
  /* مرتب تنازلياً بالعدد */
  for (let i = 1; i < sheets.length; i++) {
    assert.ok(sheets[i - 1].count >= sheets[i].count);
  }
});

test("وصف الصف صياغة نقية تجمع القيمة والأصل", () => {
  const row = M.rowById(M.provenanceRows(rel), "total_visits");
  const text = M.describeRow(row);
  assert.ok(text.includes(row.label));
  assert.ok(text.includes(fmt.int(row.value)));
  assert.ok(text.includes(row.sheet));
  const der = M.describeRow(M.rowById(M.provenanceRows(rel), "coverage_pct"));
  assert.ok(der.includes(rel.derived.coverage_pct.formula));
  assert.equal(M.describeRow(null), "—");
});

/* ══════════════════════════════════════════════════════════════════════
   3) البحث والترشيح والترتيب والترقيم — الحساب الصادق
   ══════════════════════════════════════════════════════════════════════ */

test("التطبيع يمر عبر الأدوات المشتركة لا بنسخة محلية", () => {
  const samples = ["نسبة التغطية", "  حي الملقا ", "Coverage", "الطلبُ"];
  for (const s of samples) {
    assert.equal(M.normalize(s), RH.viz.geoutils.normalizeAr(s));
    assert.equal(D.normalize(s), RH.viz.geoutils.normalizeAr(s));
  }
});

test("البحث يطابق الاسم والمعرف والورقة والمرساة والصيغة", () => {
  const rows = M.provenanceRows(rel);
  assert.ok(M.searchRows(rows, "total_demand").some((r) => r.id === "total_demand"));
  assert.ok(M.searchRows(rows, rel.metrics.total_visits.sheet)
    .some((r) => r.id === "total_visits"));
  assert.ok(M.searchRows(rows, rel.metrics.total_demand.anchor)
    .some((r) => r.id === "total_demand"));
  assert.ok(M.searchRows(rows, "÷").length > 0, "رمز الصيغة قابل للبحث");
});

test("البحث يتجاهل التشكيل والهمزات كما يفعل تطبيع الأدوات", () => {
  const rows = M.provenanceRows(rel);
  const plain = M.searchRows(rows, "الاسرة");
  const shaped = M.searchRows(rows, "الأسرّة");
  assert.deepEqual(plain.map((r) => r.id), shaped.map((r) => r.id));
  assert.ok(plain.length > 0);
});

test("استعلام فارغ يعيد نسخة كاملة لا المرجع ذاته", () => {
  const rows = M.provenanceRows(rel);
  const out = M.searchRows(rows, "   ");
  assert.equal(out.length, rows.length);
  assert.notEqual(out, rows, "إعادة المرجع تعرّض قائمة المصدر للتعديل");
});

test("الترشيح المركّب يجمع النوع والورقة والاستعلام", () => {
  const rows = M.provenanceRows(rel);
  const raw = M.filterRows(rows, { kind: "raw" });
  assert.ok(raw.every((r) => r.kind === "raw"));
  const derived = M.filterRows(rows, { kind: "derived" });
  assert.ok(derived.every((r) => r.kind === "derived"));
  assert.equal(raw.length + derived.length, rows.length);

  const sheet = rel.metrics.total_visits.sheet;
  const bySheet = M.filterRows(rows, { sheet });
  assert.ok(bySheet.length > 0);
  assert.ok(bySheet.every((r) => r.sheet === sheet));

  const combo = M.filterRows(rows, { kind: "raw", sheet, query: "مخالفات" });
  assert.ok(combo.every((r) => r.kind === "raw" && r.sheet === sheet));
  assert.equal(M.filterRows(rows, {}).length, rows.length);
});

test("الترتيب بالقيمة يدفع الغائبة إلى الذيل في الاتجاهين", () => {
  const rows = M.provenanceRows(rel).concat([{
    id: "بلا_قيمة", label: "مقياس بلا قيمة", value: null, unit: "",
    kind: "raw", kindLabel: "خام", sheet: "", anchor: "", sourceId: "",
    sourceName: "", formula: "", formulaVersion: "", inputs: [],
  }]);
  const asc = M.sortRows(rows, "value", "asc");
  const desc = M.sortRows(rows, "value", "desc");
  assert.equal(asc[asc.length - 1].id, "بلا_قيمة");
  assert.equal(desc[desc.length - 1].id, "بلا_قيمة");
  /* التصاعدي مرتب فعلاً على القيم الموجودة */
  const vals = asc.filter((r) => r.value != null).map((r) => r.value);
  for (let i = 1; i < vals.length; i++) assert.ok(vals[i - 1] <= vals[i]);
});

test("الترتيب مستقر: التعادل يفصله ترتيب الإدخال", () => {
  const base = M.provenanceRows(rel).map((r) => Object.assign({}, r, { value: 5 }));
  const sorted = M.sortRows(base, "value", "asc");
  assert.deepEqual(sorted.map((r) => r.id), base.map((r) => r.id));
});

test("مفتاح ترتيب مجهول لا يعيد ترتيباً عشوائياً", () => {
  const rows = M.provenanceRows(rel);
  const out = M.sortRows(rows, "لا-يوجد", "asc");
  assert.deepEqual(out.map((r) => r.id), rows.map((r) => r.id));
  assert.notEqual(out, rows);
});

test("الترتيب بالاسم وبالنوع وبالمصدر يعمل على القيم المعروضة", () => {
  const rows = M.provenanceRows(rel);
  const byLabel = M.sortRows(rows, "label", "asc");
  for (let i = 1; i < byLabel.length; i++) {
    assert.ok(M.normalize(byLabel[i - 1].label) <= M.normalize(byLabel[i].label));
  }
  const byKind = M.sortRows(rows, "kind", "asc");
  assert.equal(byKind.length, rows.length);
  const byOrigin = M.sortRows(rows, "origin", "desc");
  assert.equal(byOrigin.length, rows.length);
});

test("حساب الترقيم صادق في الحالة العادية", () => {
  const list = Array.from({ length: 30 }, (_v, i) => i);
  const p0 = M.paginate(list, 0, 12);
  assert.equal(p0.pages, 3);
  assert.equal(p0.from, 0);
  assert.equal(p0.to, 12);
  assert.equal(p0.firstIndex, 1);
  assert.equal(p0.lastIndex, 12);
  assert.equal(p0.hasPrev, false);
  assert.equal(p0.hasNext, true);
  assert.equal(p0.items.length, 12);

  const p2 = M.paginate(list, 2, 12);
  assert.equal(p2.from, 24);
  assert.equal(p2.to, 30);
  assert.equal(p2.items.length, 6);
  assert.equal(p2.hasNext, false);
  assert.equal(p2.lastIndex, 30);
});

test("الصفحة خارج المدى تُقصّ ولا تعرض صفحة بيضاء", () => {
  const list = Array.from({ length: 5 }, (_v, i) => i);
  assert.equal(M.paginate(list, 99, 12).page, 0);
  assert.equal(M.paginate(list, -4, 2).page, 0);
  assert.equal(M.paginate(list, 99, 2).page, 2);
  assert.equal(M.paginate(list, "1", 2).page, 1, "السلسلة الرقمية تُقرأ");
  assert.equal(M.paginate(list, "ص", 2).page, 0, "نص غير رقمي يسقط إلى الأولى");
});

test("قائمة فارغة تعطي صفحة واحدة بعدادات صفرية صادقة", () => {
  const p = M.paginate([], 3, 12);
  assert.equal(p.pages, 1);
  assert.equal(p.total, 0);
  assert.equal(p.firstIndex, 0);
  assert.equal(p.lastIndex, 0);
  assert.equal(p.items.length, 0);
  assert.equal(p.hasPrev, false);
  assert.equal(p.hasNext, false);
});

test("حجم صفحة غير صالح يسقط إلى الافتراضي المعلن", () => {
  const list = Array.from({ length: 10 }, (_v, i) => i);
  assert.equal(M.paginate(list, 0, 0).perPage, M.DEFAULT_PER_PAGE);
  assert.equal(M.paginate(list, 0, -5).perPage, M.DEFAULT_PER_PAGE);
  assert.equal(M.paginate(list, 0, null).perPage, M.DEFAULT_PER_PAGE);
  assert.ok(M.PER_PAGE_OPTIONS.includes(M.DEFAULT_PER_PAGE));
});

test("نافذة أزرار الصفحات ثابتة الطول ومحصورة داخل المدى", () => {
  assert.deepEqual(M.pageWindow(0, 10, 5), [0, 1, 2, 3, 4]);
  assert.deepEqual(M.pageWindow(9, 10, 5), [5, 6, 7, 8, 9]);
  assert.deepEqual(M.pageWindow(5, 10, 5), [3, 4, 5, 6, 7]);
  assert.deepEqual(M.pageWindow(0, 3, 5), [0, 1, 2], "صفحات أقل من النافذة");
  assert.deepEqual(M.pageWindow(0, 1, 5), [0]);
  assert.deepEqual(M.pageWindow(-3, 4, 3), [0, 1, 2]);
  assert.deepEqual(M.pageWindow(99, 4, 3), [1, 2, 3]);
});

/* ══════════════════════════════════════════════════════════════════════
   4) بوابات التحقق حيّاً
   ══════════════════════════════════════════════════════════════════════ */

test("نموذج البوابات ناتج تشغيل حي لا رقم مكتوب", () => {
  const gm = M.gatesModel(rel);
  const live = RH.data.validate.validateRelease(rel);
  assert.equal(gm.available, true);
  assert.equal(gm.total, live.gates.length);
  assert.equal(gm.passed, live.gates.filter((g) => g.ok).length);
  assert.equal(gm.failed, gm.total - gm.passed);
  assert.equal(gm.blockers.length, live.blockers.length);
  assert.equal(gm.warnings.length, live.warnings.length);
  assert.equal(gm.byLevel.block + gm.byLevel.warn, gm.total);
});

test("العدد المسجَّل في الإصدار يُحمل منفصلاً وموسوماً بعدم القابلية للمقارنة", () => {
  const gm = M.gatesModel(rel);
  assert.equal(gm.recorded.passed, rel.validation.gates_passed);
  assert.equal(gm.recorded.total, rel.validation.gates_total);
  assert.equal(gm.recorded.checkedAt, rel.validation.checked_at);
  assert.equal(gm.comparable, false,
    "خلط عدّ البناء بعدّ التشغيل تضليل — العلم يجب أن يبقى مرفوعاً");
  assert.notEqual(gm.total, gm.recorded.total,
    "المجموعتان مختلفتان فعلاً في هذا الإصدار — وهو سبب الوسم");
});

test("تجميع البوابات يحفظ العدد ويقدّم الفاشل", () => {
  const gm = M.gatesModel(rel);
  const sum = gm.groups.reduce((a, g) => a + g.total, 0);
  assert.equal(sum, gm.total);
  const passed = gm.groups.reduce((a, g) => a + g.passed, 0);
  assert.equal(passed, gm.passed);
  /* المجموعة ذات الحاجب أولاً ثم الأكثر فشلاً */
  for (let i = 1; i < gm.groups.length; i++) {
    const a = gm.groups[i - 1], b = gm.groups[i];
    assert.ok(a.blockers > b.blockers
      || (a.blockers === b.blockers && a.failed >= b.failed)
      || (a.blockers === b.blockers && a.failed === b.failed));
  }
});

test("مفتاح المجموعة من المعرف واسمها من القاموس أو خامها", () => {
  assert.equal(M.gateGroupOf("licensing.chain.beds"), "licensing");
  assert.equal(M.gateGroupOf("derived"), "derived");
  assert.equal(M.gateGroupLabel("licensing"), M.GATE_GROUPS.licensing);
  assert.equal(M.gateGroupLabel("مجموعة_مجهولة"), "مجموعة_مجهولة");
});

test("ترشيح البوابات بالمجموعة والحالة والبحث", () => {
  const gm = M.gatesModel(rel);
  const warn = M.filterGates(gm.gates, { state: "warn" });
  assert.equal(warn.length, gm.warnings.length);
  assert.ok(warn.every((g) => !g.ok && g.level === "warn"));

  const passed = M.filterGates(gm.gates, { state: "passed" });
  assert.equal(passed.length, gm.passed);

  const failed = M.filterGates(gm.gates, { state: "failed" });
  assert.equal(failed.length, gm.failed);

  const group = gm.groups[0].key;
  const inGroup = M.filterGates(gm.gates, { group });
  assert.equal(inGroup.length, gm.groups[0].total);

  assert.equal(M.filterGates(gm.gates, { group: "all", state: "all" }).length,
    gm.total);
  const q = M.filterGates(gm.gates, { query: "الامتثال" });
  assert.ok(q.length > 0);
});

test("غياب وحدة التحقق يعطي حالة صادقة لا صفراً مضللاً", () => {
  const saved = RH.data.validate;
  try {
    RH.data.validate = undefined;
    const gm = M.gatesModel(rel);
    assert.equal(gm.available, false);
    assert.equal(gm.total, 0);
    assert.ok(gm.unavailableNote.length > 10);
    /* المسجَّل في الإصدار يبقى محمولاً كي لا تختفي المعلومة كلها */
    assert.equal(gm.recorded.total, rel.validation.gates_total);
  } finally {
    RH.data.validate = saved;
  }
});

test("انهيار الفحص يُلتقط ويُعرض سببه لا يُبتلع", () => {
  const saved = RH.data.validate.validateRelease;
  try {
    RH.data.validate.validateRelease = () => { throw new Error("عطل مفتعل"); };
    const gm = M.gatesModel(rel);
    assert.equal(gm.available, false);
    assert.ok(gm.unavailableNote.includes("عطل مفتعل"));
  } finally {
    RH.data.validate.validateRelease = saved;
  }
});

/* ══════════════════════════════════════════════════════════════════════
   5) سجل الوسوم الملازمة — الوسم يسافر مع الرقم
   ══════════════════════════════════════════════════════════════════════ */

test("سجل الوسوم يضم كل قيمة موسومة في الإصدار", () => {
  const ids = M.flaggedValues(rel).map((f) => f.id);
  for (const id of ["compliance", "scenarios", "coverage_target",
    "neighbourhoods", "kpi_current", "strategy_source", "next_steps",
    "quarantine:inspector_level_records", "presentation_date"]) {
    assert.ok(ids.includes(id), "الوسم الغائب: " + id);
  }
});

test("وسم الامتثال يحمل قيمته ونص منهجيته حرفياً", () => {
  const f = M.flaggedValues(rel).find((x) => x.id === "compliance");
  assert.equal(f.rawValue, rel.compliance.value);
  assert.equal(f.valueText, fmt.pct(rel.compliance.value));
  assert.ok(f.valueText.includes("81.6"));
  assert.equal(f.note, rel.compliance.note, "النص الحرفي لا إعادة صياغة");
  assert.equal(f.status, "pending_methodology");
  assert.equal(f.statusLabel, "قيمة مورّدة — بانتظار اعتماد المنهجية");
  assert.equal(f.decisionRef, "R8");
});

test("وسم السيناريوهات يحمل التحفظ كاملاً", () => {
  const f = M.flaggedValues(rel).find((x) => x.id === "scenarios");
  assert.equal(f.note, rel.scenarios.caveat);
  assert.equal(f.status, rel.scenarios.status);
  assert.ok(f.valueText.includes(String(rel.scenarios.rows.length)));
});

test("الهدف الاسترشادي يحمل شرطه ووسم عدم اعتماده", () => {
  const f = M.flaggedValues(rel).find((x) => x.id === "coverage_target");
  assert.equal(f.rawValue, rel.coverage_target_indicative.value);
  assert.equal(f.note, rel.coverage_target_indicative.note);
  assert.equal(f.statusLabel, "قيمة استرشادية — غير معتمدة");
  assert.match(f.rule, /لا يدخل أي حساب/);
});

test("وسم العينة ينقل تسميتها وقاعدة ترتيبها", () => {
  const f = M.flaggedValues(rel).find((x) => x.id === "neighbourhoods");
  assert.equal(f.note, rel.neighbourhoods.label);
  assert.equal(f.rule, rel.neighbourhoods.ranking_note);
  assert.ok(f.valueText.includes(fmt.int(rel.neighbourhoods.rows.length)));
});

test("القيم الحالية للمؤشرات تُعلن غائبة بعددها الحقيقي", () => {
  const f = M.flaggedValues(rel).find((x) => x.id === "kpi_current");
  const missing = rel.strategy.kpis.filter((k) => k.current == null).length;
  assert.equal(f.rawValue, missing);
  assert.equal(missing, rel.strategy.kpis.length,
    "كل القيم الحالية غائبة في هذا الإصدار");
  assert.ok(f.valueText.includes(fmt.int(missing)));
  assert.ok(f.note.includes("تُسجَّل"));
});

test("غياب الأوزان يُعلن غياباً في المصدر لا يُلفَّق", () => {
  const f = M.flaggedValues(rel).find((x) => x.id === "strategy_weights");
  assert.equal(rel.strategy.weights_rule, null);
  assert.ok(f);
  assert.match(f.statusLabel, /لا تُلفَّق/);
  /* وجود قاعدة أوزان يُسقط الوسم — الوسم يصف الواقع لا يفترضه */
  const withWeights = M.flaggedValues(mutated((r) => {
    r.strategy.weights_rule = "قاعدة ما";
  }));
  assert.equal(withWeights.some((x) => x.id === "strategy_weights"), false);
});

test("السجل المحجور يظهر بسببه الحرفي ومرجع قراره", () => {
  const f = M.flaggedValues(rel)
    .find((x) => x.id === "quarantine:inspector_level_records");
  assert.equal(f.note, rel.quarantine.inspector_level_records.reason);
  assert.equal(f.decisionRef, "R1");
  assert.equal(f.tone, "neg");
});

test("الخطوات المعتمدة تُسقط وسم الانتظار", () => {
  const approved = M.flaggedValues(mutated((r) => {
    r.next_steps.status = "approved";
    r.next_steps.items = [{ text: "خطوة" }];
  }));
  assert.equal(approved.some((x) => x.id === "next_steps"), false);
});

test("كل وسم يحمل نصاً أو قاعدة — لا وسم أجوف", () => {
  for (const f of M.flaggedValues(rel)) {
    assert.ok((f.note && f.note.length > 5) || (f.rule && f.rule.length > 5),
      "وسم بلا مضمون: " + f.id);
    assert.ok(f.label && f.valueText);
  }
});

test("مراجع القرارات في الوسوم كلها موجودة في جدول المطابقة", () => {
  for (const f of M.flaggedValues(rel)) {
    if (!f.decisionRef) continue;
    assert.ok(M.reconciliationById(f.decisionRef),
      "مرجع قرار غير موجود: " + f.decisionRef);
  }
});

test("إصدار فارغ يعطي سجل وسوم فارغاً لا انهياراً", () => {
  assert.deepEqual(M.flaggedValues({}), []);
  assert.doesNotThrow(() => M.flaggedValues(null));
});

/* ══════════════════════════════════════════════════════════════════════
   6) قرارات المطابقة R1–R12
   ══════════════════════════════════════════════════════════════════════ */

test("الجدول اثنا عشر قراراً بمعرفات R1..R12 بلا تكرار", () => {
  const list = M.reconciliation();
  assert.equal(list.length, 12);
  const ids = list.map((d) => d.id);
  assert.deepEqual(ids, Array.from({ length: 12 }, (_v, i) => "R" + (i + 1)));
  assert.equal(new Set(ids).size, 12);
});

test("الحالات: R1 وR2 وR8 مفتوحة، وR4 وR5 محسومتان بتوجيه العميل", () => {
  const stats = M.reconciliationStats();
  assert.equal(stats.total, 12);
  assert.equal(stats.open + stats.closed, 12);
  for (const id of ["R1", "R2", "R8"]) {
    assert.equal(M.reconciliationById(id).state, M.OPEN, id + " يجب أن يبقى مفتوحاً");
  }
  for (const id of ["R3", "R4", "R5", "R6", "R7", "R9", "R10", "R11", "R12"]) {
    assert.equal(M.reconciliationById(id).state, M.CLOSED, id + " محسوم");
  }
  assert.equal(stats.open, 3);
  assert.equal(stats.closed, 9);
  assert.match(M.reconciliationById("R4").stateNote, /بتوجيه العميل/);
  assert.match(M.reconciliationById("R5").stateNote, /بتوجيه العميل/);
});

test("نصوص الجدول خالية من الأرقام — لا رقم متجمّد في كود", () => {
  /* الاستثناء الوحيد المسموح: الإحالة إلى قرار آخر بمعرفه (‏«مُغلق مع R4»)
     — وهي إحالة داخل الجدول لا قيمة بيانات، فتُزال قبل الفحص. كل ما عداها
     من أرقام يجب أن يأتي حيّاً من الإصدار عبر «القرينة». */
  for (const d of M.reconciliation()) {
    const text = [d.topic, d.decision, d.stateNote, d.area].join(" ")
      .replace(/R\d+/g, "");
    assert.equal(/[0-9٠-٩]/.test(text), false,
      "رقم متجمّد في القرار " + d.id + ": " + text);
  }
});

test("الإحالات بين القرارات تشير إلى معرفات موجودة", () => {
  const ids = M.reconciliation().map((d) => d.id);
  for (const d of M.reconciliation()) {
    const refs = (d.decision + " " + d.stateNote).match(/R\d+/g) || [];
    for (const ref of refs) {
      assert.ok(ids.includes(ref), d.id + " يحيل إلى قرار غير موجود: " + ref);
      assert.notEqual(ref, d.id, d.id + " يحيل إلى نفسه");
    }
  }
});

test("كل قرار يحمل موضوعاً ومنطوقاً ومجالاً وحالةً معلنة", () => {
  for (const d of M.reconciliation()) {
    assert.ok(d.topic.length > 20, d.id);
    assert.ok(d.decision.length > 40, d.id);
    assert.ok(d.area.length > 2, d.id);
    assert.ok([M.OPEN, M.CLOSED].includes(d.state), d.id);
    assert.ok(d.stateNote.length > 3, d.id);
  }
});

test("الجدول المصدَّر نسخة — التعديل عليه لا يفسد المصدر", () => {
  const a = M.reconciliation();
  a.push({ id: "R99" });
  a[0] = null;
  const b = M.reconciliation();
  assert.equal(b.length, 12);
  assert.equal(b[0].id, "R1");
  assert.equal(M.reconciliationById("R99"), null);
});

test("البحث عن قرار غير موجود يعيد null لا كائناً فارغاً", () => {
  assert.equal(M.reconciliationById("R13"), null);
  assert.equal(M.reconciliationById(""), null);
  assert.equal(M.reconciliationById(null), null);
  assert.equal(M.reconciliationById("r8").id, "R8", "الحالة الحرفية لا تهم");
});

test("ترشيح القرارات بالحالة وبالبحث", () => {
  const all = M.reconciliation();
  assert.equal(M.filterDecisions(all, { state: M.OPEN }).length, 3);
  assert.equal(M.filterDecisions(all, { state: M.CLOSED }).length, 9);
  assert.equal(M.filterDecisions(all, {}).length, 12);
  const q = M.filterDecisions(all, { query: "الخريطة" });
  assert.ok(q.some((d) => d.id === "R11"));
});

test("قرينة كل قرار نص حرفي من الإصدار لا شرح مكتوب", () => {
  const r8 = M.evidenceFor(rel, "R8");
  assert.ok(r8.some((e) => e.text === rel.compliance.note));
  assert.ok(r8.some((e) => e.path === "compliance.note"));

  const r2 = M.evidenceFor(rel, "R2");
  assert.ok(r2.some((e) => e.text === rel.quarantine_resolved.hotspots.resolution));

  const r1 = M.evidenceFor(rel, "R1");
  assert.ok(r1.some((e) => e.text === rel.quarantine.inspector_level_records.reason));

  const r9 = M.evidenceFor(rel, "R9");
  assert.ok(r9.some((e) => e.text === rel.coverage_target_indicative.note));

  const r10 = M.evidenceFor(rel, "R10");
  assert.ok(r10.some((e) => e.text === rel.neighbourhoods.label));

  const r4 = M.evidenceFor(rel, "R4");
  assert.ok(r4.some((e) => e.text === rel.strategy.source));
});

test("قرينة R12 تُظهر المصدر الخاص ببصمته المختصرة", () => {
  const r12 = M.evidenceFor(rel, "R12");
  assert.equal(r12.length, 1);
  assert.ok(r12[0].text.includes(rel.sources[0].name));
  assert.ok(r12[0].text.includes(M.shortSha(rel.sources[0].sha256, 16)));
  /* لا مصدر خاص → لا قرينة مختلقة */
  const none = M.evidenceFor(mutated((r) => { r.sources[0].private = false; }), "R12");
  assert.equal(none.length, 0);
});

test("قرينة R5 تحسب تكوين المحاور من الإصدار لا من نص ثابت", () => {
  const ev = M.evidenceFor(rel, "R5");
  const text = ev.map((e) => e.text).join(" ");
  assert.ok(text.includes(fmt.int(rel.strategy.pillars.length)));
  for (const kind of new Set(rel.strategy.pillars.map((p) => p.kind))) {
    assert.ok(text.includes(kind), "نوع محور غائب عن القرينة: " + kind);
  }
});

test("قرار بلا أثر مسجَّل في الإصدار لا تُختلق له قرينة", () => {
  assert.deepEqual(M.evidenceFor(rel, "R99"), []);
  assert.deepEqual(M.evidenceFor({}, "R8"), []);
  const stripped = mutated((r) => { delete r.quarantine; });
  assert.deepEqual(M.evidenceFor(stripped, "R1"), []);
});

test("الجدول مع القرائن يحمل حالة معروضة وعلم وجود القرينة", () => {
  const list = M.decisionsWithEvidence(rel);
  assert.equal(list.length, 12);
  for (const d of list) {
    assert.equal(d.stateLabel, d.state === M.OPEN ? "مفتوح" : "محسوم");
    assert.equal(d.hasEvidence, d.evidence.length > 0);
  }
  assert.ok(list.filter((d) => d.hasEvidence).length >= 10,
    "أغلب القرارات لها أثر ظاهر في الإصدار المنشور");
});

/* ══════════════════════════════════════════════════════════════════════
   7) سجل القرارات المطلوبة — الاشتقاق من لوحات الرؤى
   ══════════════════════════════════════════════════════════════════════ */

test("السجل يطابق البطاقات التوصوية المعتمدة بالضبط", () => {
  const list = RH.explore.decisionsModel(rel);
  assert.deepEqual(list.map((d) => d.id), ["sd2", "cd2", "cd3", "id2"]);
  /* الترتيب: ترتيب أقسام لوحات الرؤى ثم ترتيب البطاقة داخل قسمها */
  assert.deepEqual(list.map((d) => d.section),
    ["supply", "control", "control", "initiatives"]);
});

test("الاختصار المتعاقد عليه والنموذج الكامل مخرجهما واحد", () => {
  assert.deepEqual(RH.explore.decisionsModel(rel), D.decisionsModel(rel));
});

test("الحقول المتعاقد عليها في §8.2 كلها حاضرة", () => {
  for (const d of D.decisionsModel(rel)) {
    for (const key of ["id", "section", "sectionTitle", "decision", "impact",
      "source", "cls"]) {
      assert.ok(Object.prototype.hasOwnProperty.call(d, key),
        "الحقل الغائب " + key + " في " + d.id);
    }
    assert.ok(D.CLS_KEYS.includes(d.cls), "تصنيف خارج المفردات المقفلة: " + d.cls);
  }
});

test("القرار والأثر سلسلتان فرعيتان حرفيتان من نص البطاقة", () => {
  const list = D.decisionsModel(rel);
  const check = D.verbatimCheck(list);
  assert.equal(check.ok, true, "انحراف اقتطاع: " + check.offenders.join("، "));
  for (const d of list) {
    assert.ok(d.text.includes(d.decision));
    if (d.impact) assert.ok(d.text.includes(d.impact));
  }
});

test("لا نص جديد إطلاقاً: كل قرار موجود حرفياً في ملف الإصدار", () => {
  const raw = JSON.stringify(rel);
  for (const d of D.decisionsModel(rel)) {
    assert.ok(raw.includes(d.decision),
      "نص قرار غير موجود في الإصدار: " + d.id);
    if (d.impact) assert.ok(raw.includes(d.impact));
    assert.ok(raw.includes(d.sourceTitle));
  }
});

test("التصنيف والحالة والعنوان من البطاقة نفسها", () => {
  const panels = rel.insight_panels.sections;
  const byId = {};
  for (const key of Object.keys(panels)) {
    for (const p of panels[key]) byId[p.id] = p;
  }
  for (const d of D.decisionsModel(rel)) {
    assert.equal(d.cls, byId[d.id].cls);
    assert.equal(d.status, byId[d.id].status);
    assert.equal(d.sourceTitle, byId[d.id].title);
    assert.ok(d.source.includes(byId[d.id].title));
    assert.ok(d.source.includes(d.sectionTitle));
  }
});

test("الجملة التي لا تنقسم بأمان تُعرض كاملة ويبقى الأثر فارغاً", () => {
  const cd3 = D.decisionById(D.decisionsModel(rel), "cd3");
  assert.equal(cd3.split, false);
  assert.equal(cd3.impact, "");
  assert.equal(cd3.decision, cd3.text);
  /* وما ينقسم بأمان يحمل طرفيه */
  const sd2 = D.decisionById(D.decisionsModel(rel), "sd2");
  assert.equal(sd2.split, true);
  assert.ok(sd2.impact.length > 10);
  assert.ok(sd2.decision.length > 10);
  assert.equal(sd2.text.indexOf(sd2.impact), 0, "الأثر صدر النص");
});

test("علامة التوصية المرصودة مسجَّلة في كل قرار", () => {
  for (const d of D.decisionsModel(rel)) {
    assert.ok(D.MARKERS.includes(d.marker), d.id + ": " + d.marker);
    assert.ok(d.text.includes(d.marker));
  }
});

test("كشف التوصية: نص تقريري لا يدخل السجل", () => {
  assert.equal(D.hasRecommendation("الطلب الحالي يتجاوز العرض بنحو كذا."), false);
  assert.equal(D.hasRecommendation("يوصى بإعادة التوزيع."), true);
  assert.equal(D.hasRecommendation("ما يستدعي مراجعة الخطة."), true);
  assert.equal(D.hasRecommendation(""), false);
  assert.equal(D.hasRecommendation(null), false);
});

test("قطع الجملة يقع عند حدّ آمن لا في وسط عبارة", () => {
  const t = "سبع مبادرات تجاوزت نهايتها دون إنجاز — يوصى بتحديث حالاتها.";
  const r = D.splitRecommendation(t);
  assert.equal(r.split, true);
  assert.equal(r.impact, "سبع مبادرات تجاوزت نهايتها دون إنجاز");
  assert.equal(r.decision, "يوصى بتحديث حالاتها.");
  assert.equal(t.includes(r.impact), true);
  assert.equal(t.includes(r.decision), true);
});

test("علامة التوصية في أول النص تعني النص كله قراراً", () => {
  const t = "يوصى بإعادة توزيع المراقبين وفق كثافة المخالفات.";
  const r = D.splitRecommendation(t);
  assert.equal(r.split, false);
  assert.equal(r.decision, t);
  assert.equal(r.impact, "");
});

test("قطع يخلّف طرفاً أجوف يُلغى ويُعرض النص كاملاً", () => {
  const t = "نعم، يلزم توثيق الافتراضات قبل الاعتماد.";
  const r = D.splitRecommendation(t);
  assert.equal(r.split, false, "«نعم» ليست أثراً — القطع مرفوض");
  assert.equal(r.decision, t);
});

test("نص بلا توصية لا يُقطع ولا يُنشأ له قرار", () => {
  const r = D.splitRecommendation("قطاع الشرق يسجل أعلى نسبة تغطية.");
  assert.equal(r.decision, "");
  assert.equal(r.impact, "");
  assert.equal(r.split, false);
});

test("البطاقات المستبعدة معروضة بالاسم وبسبب معلن", () => {
  const list = D.decisionsModel(rel);
  const excluded = D.excludedPanels(rel);
  const panels = D.allPanels(rel);
  assert.equal(list.length + excluded.length, panels.length);
  assert.deepEqual(excluded.map((e) => e.id),
    ["sd1", "sd3", "ld1", "ld2", "ld3", "cd1", "id1", "id3"]);
  for (const e of excluded) {
    assert.ok(e.reason.length > 20);
    assert.ok(e.title.length > 3);
  }
});

test("بطاقة غير معتمدة تُستبعد بسبب حالتها لا بسبب نصها", () => {
  const changed = mutated((r) => {
    r.insight_panels.sections.control[2].status = "needs_review";
  });
  const list = D.decisionsModel(changed);
  assert.equal(list.some((d) => d.id === "cd3"), false,
    "لا يُشتق قرار من نص غير معتمد");
  const ex = D.excludedPanels(changed).find((e) => e.id === "cd3");
  assert.match(ex.reason, /ليست «موجز معتمد»/);
});

test("غياب لوحات الرؤى يعطي سجلاً فارغاً لا انهياراً", () => {
  assert.deepEqual(D.decisionsModel({}), []);
  assert.deepEqual(D.decisionsModel(null), []);
  assert.deepEqual(D.excludedPanels({}), []);
  const empty = mutated((r) => { r.insight_panels.sections = {}; });
  assert.deepEqual(D.decisionsModel(empty), []);
});

test("مفتاح قسم غير معروف يُعرض بمفتاحه ولا يُسقط بطاقاته", () => {
  const extra = mutated((r) => {
    r.insight_panels.sections.مجهول = [{
      id: "xx1", cls: "warn", title: "بطاقة غريبة",
      text: "أمر ما، ما يستدعي إجراءً واضحاً.", status: "approved_brief",
    }];
  });
  const list = D.decisionsModel(extra);
  const found = list.find((d) => d.id === "xx1");
  assert.ok(found);
  assert.equal(found.sectionTitle, "مجهول");
  assert.equal(found.sectionId, null, "لا يُخترع معرف قسم للمفاتيح المجهولة");
  assert.equal(list[list.length - 1].id, "xx1", "المجهول يلحق في الذيل");
});

test("تصنيف خارج المفردات المقفلة يُطبَّع إلى محايد", () => {
  assert.equal(D.normalizeCls("سيء"), "neu");
  assert.equal(D.normalizeCls(""), "neu");
  assert.equal(D.normalizeCls("neg"), "neg");
  assert.equal(D.clsLabel("warn"), "تنبيه");
  assert.equal(D.clsLabel("لا-يوجد"), "محايد");
});

test("عدادات التصنيف تحمل المفاتيح الأربعة دائماً", () => {
  const counts = D.countByCls(D.decisionsModel(rel));
  assert.deepEqual(Object.keys(counts).sort(), ["neg", "neu", "pos", "warn"]);
  const total = counts.pos + counts.neg + counts.warn + counts.neu;
  assert.equal(total, D.decisionsModel(rel).length);
  assert.deepEqual(D.countByCls([]), { pos: 0, neg: 0, warn: 0, neu: 0 });
});

test("الترشيح بالتصنيف وبالقسم", () => {
  const list = D.decisionsModel(rel);
  assert.equal(M.normalize("x"), RH.viz.geoutils.normalizeAr("x"));
  const warn = D.filterByCls(list, "warn");
  assert.ok(warn.every((d) => d.cls === "warn"));
  assert.equal(D.filterByCls(list, "all").length, list.length);
  assert.equal(D.filterByCls(list, "لا-يوجد").length, list.length,
    "تصنيف مجهول لا يُفرغ الشاشة");
  const control = D.filterBySection(list, "control");
  assert.deepEqual(control.map((d) => d.id), ["cd2", "cd3"]);
  assert.equal(D.filterBySection(list, "all").length, list.length);
});

test("البحث في السجل يطبّع كما تطبّع الأدوات المشتركة", () => {
  const list = D.decisionsModel(rel);
  assert.ok(D.searchDecisions(list, "المراقبين").length > 0);
  assert.equal(D.searchDecisions(list, "").length, list.length);
  assert.equal(D.searchDecisions(list, "نص غير موجود إطلاقاً").length, 0);
  assert.equal(D.decisionById(list, "cd2").id, "cd2");
  assert.equal(D.decisionById(list, "zz"), null);
});

test("التجميع بالأقسام يحفظ العدد ويتبع ترتيب القراءة", () => {
  const list = D.decisionsModel(rel);
  const groups = D.groupBySection(list);
  assert.deepEqual(groups.map((g) => g.key), ["supply", "control", "initiatives"]);
  assert.equal(groups.reduce((a, g) => a + g.items.length, 0), list.length);
  assert.equal(groups.find((g) => g.key === "control").items.length, 2);
  assert.equal(groups[0].sectionId, D.SECTION_META.supply.sectionId);
});

/* ══════════════════════════════════════════════════════════════════════
   8) الخطوات القادمة والخلاصة
   ══════════════════════════════════════════════════════════════════════ */

test("الخطوات غير المعتمدة تُعرض بطاقة صادقة ولا يُخترع منها قرار", () => {
  const ns = D.nextStepsModel(rel);
  assert.equal(ns.present, true);
  assert.equal(ns.approved, false);
  assert.equal(ns.status, "pending_approval");
  assert.equal(ns.note, rel.next_steps.note, "النص الحرفي من الإصدار");
  assert.equal(ns.headline, "لا خطوات معتمدة بعد");
  assert.deepEqual(ns.items, []);
  assert.equal(ns.count, 0);
  /* ولا تتسرب خطوة إلى سجل القرارات */
  assert.equal(D.decisionsModel(rel).length, 4);
});

test("الخطوات المعتمدة تُعرض بنودها كما وردت", () => {
  const ns = D.nextStepsModel(mutated((r) => {
    r.next_steps.status = "approved";
    r.next_steps.items = ["خطوة أولى", "خطوة ثانية", "خطوة ثالثة"];
  }));
  assert.equal(ns.approved, true);
  assert.equal(ns.count, 3);
  assert.equal(ns.headline, "الخطوات المعتمدة");
  assert.deepEqual(ns.items, ["خطوة أولى", "خطوة ثانية", "خطوة ثالثة"]);
});

test("غياب كتلة الخطوات يُعلن غياباً لا فراغاً صامتاً", () => {
  const ns = D.nextStepsModel({});
  assert.equal(ns.present, false);
  assert.equal(ns.approved, false);
  assert.ok(ns.headline.length > 5);
});

test("خلاصة السجل متسقة مع مكوناتها", () => {
  const s = D.summary(rel);
  const list = D.decisionsModel(rel);
  assert.equal(s.total, list.length);
  assert.equal(s.split + s.whole, s.total);
  assert.equal(s.excluded, D.excludedPanels(rel).length);
  assert.equal(s.panelsTotal, D.allPanels(rel).length);
  assert.equal(s.sections.reduce((a, x) => a + x.count, 0), s.total);
  assert.equal(s.nextSteps.approved, false);
});

test("صياغة القرار النصية تجمع المنطوق والأثر والمصدر", () => {
  const d = D.decisionById(D.decisionsModel(rel), "id2");
  const text = D.describe(d);
  assert.ok(text.includes(d.decision));
  assert.ok(text.includes(d.impact));
  assert.ok(text.includes(d.source));
  assert.equal(D.describe(null), "—");
});

test("فحص الاقتطاع يلتقط أي انحراف مفتعل", () => {
  const list = D.decisionsModel(rel);
  const tampered = list.map((d) => Object.assign({}, d));
  tampered[0].decision = "نص مصنوع لم يرد في البطاقة";
  const check = D.verbatimCheck(tampered);
  assert.equal(check.ok, false);
  assert.deepEqual(check.offenders, [tampered[0].id]);
});

/* ══════════════════════════════════════════════════════════════════════
   9) اتساق المفردات المقفلة بين الوحدتين والمشروع
   ══════════════════════════════════════════════════════════════════════ */

test("نصوص حالات الاعتماد مطابقة للنصوص المعتمدة في المشروع", () => {
  assert.equal(M.statusLabel("pending_methodology"),
    "قيمة مورّدة — بانتظار اعتماد المنهجية");
  assert.equal(M.statusLabel("indicative_not_approved"),
    "قيمة استرشادية — غير معتمدة");
  assert.equal(M.statusLabel("supplied_unvalidated"),
    "سيناريوهات مورّدة — غير معتمدة");
  assert.equal(M.statusLabel("approved_source_mirror"), "مرآة حرفية لمصدر معتمد");
  assert.equal(M.statusLabel("حالة_مجهولة"), "حالة_مجهولة",
    "حالة غير معروفة تُعرض بمعرفها الخام — صدق لا تجميل");
  assert.equal(M.statusLabel(""), "—");
});

test("مفاتيح أقسام لوحات الرؤى الأربعة معروفة في وحدة القرارات", () => {
  assert.deepEqual(D.SECTION_ORDER, ["supply", "licensing", "control", "initiatives"]);
  for (const key of Object.keys(rel.insight_panels.sections)) {
    assert.ok(D.SECTION_META[key], "مفتاح قسم غير معروف: " + key);
  }
  assert.equal(D.sectionMeta("مجهول").order, 99);
});

test("مستويات البوابات ومجموعاتها معرَّفة بالنصوص المعتمدة", () => {
  assert.equal(M.GATE_LEVELS.block.label, "حاجبة");
  assert.equal(M.GATE_LEVELS.warn.label, "منذِرة");
  const gm = M.gatesModel(rel);
  for (const g of gm.groups) {
    assert.ok(g.label && g.label.length > 1, "مجموعة بلا اسم: " + g.key);
  }
});
