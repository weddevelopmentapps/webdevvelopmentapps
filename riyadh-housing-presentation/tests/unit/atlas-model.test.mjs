/* atlas-model.test.mjs — نموذج أطلس الأحياء RH.explore.districts
   ─────────────────────────────────────────────────────────────────
   عقد التوسعة §5. ما يُثبَت هنا هو ما يمنع الانجراف الذي يرفضه المدقق:

     • **لا اختلاق على مستوى الحي**: القيمة الوحيدة المسموح عرضها لحي هي صف
       عينة الأحياء المدرجة، وأي حي خارجها يحمل **نص الحالة الصادقة المنصوص
       في العقد حرفاً بحرف** ولا يتسرب إليه رقم من القطاع ولا من الجوار.
     • **الوسم يسافر مع الرقم**: بطاقة العينة تحمل `meta.sample_label`،
       والإسناد يحمل نص الحالة الصادقة عند غياب الصف.
     • **الأرقام القطاعية منقولة لا محسوبة**: كل قيمة في `sectorFigures`
       تطابق حرفياً ما في `release.sectors` أو `derived.sector`.
     • **حساب الترقيم نقي وحتمي**: مدخلات فاسدة (صفر/سالب/نص/NaN) تُحصر بلا
       خطأ، والقائمة الفارغة تعطي مدى صفرياً صادقاً لا مدى وهمياً.
     • **التطبيع مفوَّض**: البحث يمر من `geoutils` حصراً — لا تطبيع محلي.
     • **الحالات اشتقاق تعريفي**: «ضمن العينة/خارجها» و«فوق/دون متوسط
       المدينة» و«التركّز ضمن النطاق» كلها من الحضور والمقارنة لا من تقدير.
     • **منظومة اللون**: نغمة كل رقم مقفلة (مرجاني للعجز والمخالفات حصراً).
     • **لا تسرب لقيمة موسومة بلا وسمها**: 81.6٪ (المعلّقة المنهجية) لا تظهر
       في أي مخرج من مخرجات الأطلس.

   الوحدة تُحمَّل بملفها الحقيقي: `load-app.mjs` يبني RH كاملة (core + derive
   + geoutils + micro) في سياق vm، ثم يُنفَّذ ملف الملحق بوسم RH ذاته — فالنموذج
   النقي يُعرَّف دون DOM، وتسجيل الملحق يتخطى نفسه بغياب `RH.presenter.ax`
   (وهو بالضبط ما يوجبه عقد قابلية الاختبار §0). لم يُعدَّل `load-app.mjs`
   (ملف المعمار) ولا أي ملف خارج عقد هذه الميزة. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RH, ROOT, freshRelease, freshGeo } from "./load-app.mjs";

/* تنفيذ ملف الميزة على RH الحقيقية — بلا نسخ منطق ولا محاكاة للوحدة */
const SRC = path.join(ROOT, "src", "js", "presenter", "appendix", "ax-atlas.js");
new Function("RH", readFileSync(SRC, "utf8"))(RH);

const M = RH.explore.districts;
const G = RH.viz.geoutils;
const fmt = RH.core.fmt;

const rel = freshRelease();
const geo = freshGeo();
const der = RH.data.derive.compute(rel);
const idx = M.index(geo, rel, der);

/** مدخل حي ضمن العينة ومدخل خارجها — أساس كل فحوص الصدق أدناه */
const inSample = idx.find((e) => !!e.sample);
const outSample = idx.find((e) => !e.sample);

/** نسخة معدّلة معزولة — لا اختبار يلوث إصدار اختبار آخر */
function mutated(fn) {
  const copy = freshRelease();
  fn(copy);
  return copy;
}

/* ══════════════════ تحميل الوحدة وشكل الواجهة ══════════════════ */

test("الوحدة تُعرَّف على RH.explore دون لمس DOM ودون تسجيل ملحق في بيئة الاختبار", () => {
  assert.ok(M, "RH.explore.districts غير معرَّف");
  assert.equal(typeof M.panelModel, "function");
  assert.equal(typeof M.paginate, "function");
  assert.equal(typeof M.formatValue, "function");
  /* ax-shell غائب في بيئة الوحدة فلا يجوز أن يكون التسجيل قد وقع */
  assert.equal(RH.presenter.ax, undefined,
    "تسجيل الملحق يجب أن يتخطى نفسه بغياب الهيكل");
});

test("نص الحالة الصادقة منصوص العقد حرفاً بحرف — لا إعادة صياغة", () => {
  assert.equal(M.HONEST_NO_DATA,
    "لا بيانات على مستوى الحي — القيم المعروضة قطاعية، "
    + "والحي خارج عينة الأحياء المدرجة");
});

test("ثوابت العقد: نصف قطر 3 كم ومعرّفات الترتيب والألسنة مقفلة", () => {
  assert.equal(M.HOTSPOT_RADIUS_KM, 3);
  assert.deepEqual(Array.from(M.TAB_IDS),
    ["profile", "sample", "watch", "near", "prov"]);
  assert.deepEqual(Array.from(M.SORT_IDS),
    ["auto", "name", "sector", "beds", "violations", "hotspots"]);
  for (const id of M.SORT_IDS) {
    assert.equal(typeof M.SORT_LABELS[id], "string");
    assert.ok(M.SORT_LABELS[id].length > 0, "تسمية ترتيب فارغة: " + id);
  }
});

/* ══════════════════ التنسيق ══════════════════ */

test("formatValue يمر من RH.core.fmt لكل نوع معلن", () => {
  assert.equal(M.formatValue(21500, "beds"), fmt.unitAfter(21500, "سرير"));
  assert.equal(M.formatValue(43.1, "pct"), fmt.pct(43.1));
  assert.equal(M.formatValue(612400, "compactBeds"),
    fmt.compact(612400) + fmt.NBSP + "سرير");
  assert.equal(M.formatValue(22, "licence"), fmt.noun(22, "licence"));
  assert.equal(M.formatValue(3538, "visit"), fmt.noun(3538, "visit"));
  assert.equal(M.formatValue(439, "violation"), fmt.noun(439, "violation"));
  assert.equal(M.formatValue(4, "monitor"), fmt.noun(4, "monitor"));
  assert.equal(M.formatValue(15, "decision"), fmt.noun(15, "decision"));
  assert.equal(M.formatValue(3, "km"),
    fmt.iso(fmt.dec1(3) + fmt.NBSP + "كم"));
  assert.equal(M.formatValue(59, "density"), fmt.iso(fmt.int(59)));
  assert.equal(M.formatValue(1420000, "int"), fmt.int(1420000));
});

test("formatValue: النوع المجهول يسقط إلى fmt.int ولا يخترع تنسيقاً", () => {
  assert.equal(M.formatValue(1234, "لا-يوجد"), fmt.int(1234));
  assert.equal(M.formatValue(1234), fmt.int(1234));
});

test("formatValue: الغياب شرطة محايدة لا صفر مختلق", () => {
  for (const kind of M.VALUE_KINDS) {
    assert.equal(M.formatValue(null, kind), "—", "نوع: " + kind);
    assert.equal(M.formatValue(undefined, kind), "—", "نوع: " + kind);
    assert.equal(M.formatValue(NaN, kind), "—", "نوع: " + kind);
    assert.equal(M.formatValue("21500", kind), "—", "نص لا يُقبل: " + kind);
  }
});

test("تسميات العدد والمعدود العربية سليمة عند كل التفريعات", () => {
  /* الفاصل بين العدد والمعدود هو NBSP المركزي في format.js — لا مسافة عادية */
  const N = fmt.NBSP;
  assert.equal(M.districtsLabel(0), "لا أحياء");
  assert.equal(M.districtsLabel(1), "حي واحد");
  assert.equal(M.districtsLabel(2), "حيان");
  assert.equal(M.districtsLabel(5), "5" + N + "أحياء");
  assert.equal(M.districtsLabel(20), "20" + N + "حياً");
  assert.equal(M.districtsLabel(100), "100" + N + "حي");
  assert.equal(M.districtsLabel(189), "189" + N + "حياً");
  assert.equal(M.resultsLabel(0), "لا نتائج");
  assert.equal(M.resultsLabel(1), "نتيجة واحدة");
  assert.equal(M.resultsLabel(2), "نتيجتان");
  assert.equal(M.resultsLabel(7), "7" + N + "نتائج");
  assert.equal(M.resultsLabel(40), "40" + N + "نتيجة");
  assert.equal(M.pointsLabel(3), "3" + N + "نقاط");
  assert.equal(M.pointsLabel(40), "40" + N + "نقطة");
});

test("rangeLabel يعزل المدى اتجاهياً ويعلن الخلو بصدق", () => {
  const pg = M.paginate(idx, 3, 12);
  assert.equal(M.rangeLabel(pg),
    fmt.iso(fmt.int(25) + "–" + fmt.int(36)) + " من " + M.districtsLabel(189));
  assert.equal(M.rangeLabel(M.paginate([], 1, 12)), "لا نتائج مطابقة");
  assert.equal(M.rangeLabel(null), "لا نتائج مطابقة");
});

/* ══════════════════ الفهرس والتطبيع والبحث ══════════════════ */

test("الفهرس يمر من geoutils حصراً: 189 حياً بمعرفات فريدة", () => {
  assert.equal(idx.length, 189);
  assert.equal(new Set(idx.map((e) => e.key)).size, 189);
  assert.deepEqual(idx.map((e) => e.key),
    G.districtIndex(geo, rel, der).map((e) => e.key));
});

test("normalizeQuery تفويض حرفي لـgeoutils.normalizeAr — لا تطبيع محلي", () => {
  for (const s of ["حي الملقا", "  حي   النرجس ", "Al MALQA", "مُؤْتَة",
    "الـمَلـقَا", "", null, undefined]) {
    assert.equal(M.normalizeQuery(s), G.normalizeAr(s));
  }
});

test("keyOf يبني المعرف الثابت بمرآة normDistrict", () => {
  assert.equal(M.keyOf("north", "حي الملقا"), "north:الملقا");
  assert.equal(M.keyOf("south", "حي الشفا"), "south:الشفا");
  assert.equal(M.keyOf("", "حي الملقا"), "");
  assert.equal(M.keyOf("north", ""), "");
  const e = idx.find((x) => x.name === "حي الملقا");
  assert.equal(M.keyOf(e.sector, e.name), e.key);
});

test("findByKey يسترجع المدخل ويرفض المعرف المجهول بصدق", () => {
  assert.equal(M.findByKey(idx, inSample.key).name, inSample.name);
  assert.equal(M.findByKey(idx, "north:لا-يوجد-حي"), null);
  assert.equal(M.findByKey(idx, ""), null);
});

test("filterEntries: استعلام فارغ يعيد الفهرس كاملاً بترتيبه", () => {
  const out = M.filterEntries(idx, {});
  assert.equal(out.length, 189);
  assert.deepEqual(out.map((e) => e.key), idx.map((e) => e.key));
});

test("filterEntries: البحث العربي والإنجليزي يلتقيان على الحي نفسه", () => {
  const ar = M.filterEntries(idx, { query: "الملقا" });
  const arNoisy = M.filterEntries(idx, { query: "  حي  الـمَلقا " });
  assert.ok(ar.some((e) => e.name === "حي الملقا"));
  assert.equal(arNoisy[0].key, ar[0].key);
  const en = M.filterEntries(idx, { query: "malqa" });
  assert.ok(en.some((e) => e.key === ar[0].key));
});

test("filterEntries: مرشح القطاع ومرشح العينة يعملان معاً", () => {
  const north = M.filterEntries(idx, { sector: "north" });
  assert.equal(north.length, geo.sectors.north.length);
  assert.ok(north.every((e) => e.sector === "north"));

  const sample = M.filterEntries(idx, { sampleOnly: true });
  assert.equal(sample.length, rel.neighbourhoods.rows.length);
  assert.ok(sample.every((e) => !!e.sample));

  const both = M.filterEntries(idx, { sector: "south", sampleOnly: true });
  assert.ok(both.every((e) => e.sector === "south" && e.sample));
  assert.equal(both.length,
    rel.neighbourhoods.rows.filter((r) => r.sector === "south").length);
});

test("filterEntries: قطاع «all» لا يرشّح، والاستعلام بلا مطابقة يعيد فارغاً", () => {
  assert.equal(M.filterEntries(idx, { sector: "all" }).length, 189);
  assert.equal(M.filterEntries(idx, { query: "زذضظغقكق" }).length, 0);
});

/* ══════════════════ الترتيب ══════════════════ */

test("sortEntries نقية: لا تمس المصفوفة الواردة", () => {
  const src = idx.slice(0, 20);
  const before = src.map((e) => e.key);
  const out = M.sortEntries(src, "name");
  assert.notEqual(out, src);
  assert.deepEqual(src.map((e) => e.key), before);
  assert.equal(out.length, src.length);
});

test("sortEntries: «auto» يحفظ ترتيب الوارد (درجات البحث)", () => {
  const found = M.filterEntries(idx, { query: "ال" });
  assert.deepEqual(M.sortEntries(found, "auto").map((e) => e.key),
    found.map((e) => e.key));
  /* معرّف ترتيب مجهول يسقط إلى auto لا إلى ترتيب عشوائي */
  assert.deepEqual(M.sortEntries(found, "لا-يوجد").map((e) => e.key),
    found.map((e) => e.key));
});

test("sortEntries: «name» أبجدي عربي و«sector» يتبع الترتيب القانوني", () => {
  const byName = M.sortEntries(idx, "name");
  for (let i = 1; i < byName.length; i++) {
    assert.ok(String(byName[i - 1].name)
      .localeCompare(String(byName[i].name), "ar") <= 0);
  }
  const bySector = M.sortEntries(idx, "sector");
  let last = -1;
  for (const e of bySector) {
    const r = G.SECTOR_ORDER.indexOf(e.sector);
    assert.ok(r >= last, "خرق ترتيب القطاعات عند " + e.name);
    last = r;
  }
});

test("sortEntries: ترتيبات العينة تُنزل غير المدرجين آخراً بلا اختلاق صفر", () => {
  for (const key of M.SAMPLE_SORTS) {
    const metric = key === "beds" ? "beds" : "violations";
    const out = M.sortEntries(idx, key);
    const firstMissing = out.findIndex((e) => !e.sample);
    assert.equal(firstMissing, rel.neighbourhoods.rows.length,
      "المدرجون يجب أن يتصدروا كاملين — " + key);
    for (let i = 1; i < rel.neighbourhoods.rows.length; i++) {
      assert.ok(out[i - 1].sample[metric] >= out[i].sample[metric]);
    }
    /* لم تُحقن أي قيمة على مدخلات بلا عينة */
    assert.ok(out.slice(firstMissing).every((e) => e.sample === null));
  }
});

test("sortEntries: «hotspots» يرتب بعدد النقاط ثم بأقربها", () => {
  const stats = M.hotspotStats(idx, geo);
  const out = M.sortEntries(idx, "hotspots", { stats });
  for (let i = 1; i < out.length; i++) {
    const a = stats.get(out[i - 1].key);
    const b = stats.get(out[i].key);
    assert.ok(a.count >= b.count, "خرق ترتيب العدد عند " + out[i].name);
    if (a.count === b.count && a.count > 0) {
      assert.ok(a.nearestKm <= b.nearestKm);
    }
  }
  assert.ok(stats.get(out[0].key).count > 0);
});

test("sortEntries: غياب خريطة الإحصاء لا يُسقط الترتيب", () => {
  const out = M.sortEntries(idx.slice(0, 30), "hotspots");
  assert.equal(out.length, 30);
});

/* ══════════════════ حساب الترقيم ══════════════════ */

test("paginate: الحساب الأساسي على الفهرس الكامل", () => {
  const p1 = M.paginate(idx, 1, 12);
  assert.equal(p1.total, 189);
  assert.equal(p1.pages, 16);
  assert.equal(p1.page, 1);
  assert.equal(p1.from, 1);
  assert.equal(p1.to, 12);
  assert.equal(p1.items.length, 12);
  assert.equal(p1.hasPrev, false);
  assert.equal(p1.hasNext, true);
  assert.equal(p1.items[0].key, idx[0].key);
});

test("paginate: الصفحة الأخيرة ناقصة بصدق ولا تُحشى", () => {
  const last = M.paginate(idx, 16, 12);
  assert.equal(last.page, 16);
  assert.equal(last.items.length, 189 - 15 * 12);
  assert.equal(last.from, 181);
  assert.equal(last.to, 189);
  assert.equal(last.hasNext, false);
  assert.equal(last.hasPrev, true);
});

test("paginate: الصفحة خارج المدى تُحصر لا تُخطئ", () => {
  assert.equal(M.paginate(idx, 999, 12).page, 16);
  assert.equal(M.paginate(idx, 0, 12).page, 1);
  assert.equal(M.paginate(idx, -7, 12).page, 1);
  assert.equal(M.paginate(idx, NaN, 12).page, 1);
  assert.equal(M.paginate(idx, null, 12).page, 1);
  assert.equal(M.paginate(idx, "لا-رقم", 12).page, 1);
  assert.equal(M.paginate(idx, "4", 12).page, 4);
  assert.equal(M.paginate(idx, 4.9, 12).page, 4);
});

test("paginate: القائمة الفارغة تعطي مدى صفرياً صادقاً لا مدى وهمياً", () => {
  const p = M.paginate([], 3, 12);
  assert.equal(p.total, 0);
  assert.equal(p.pages, 1);
  assert.equal(p.page, 1);
  assert.equal(p.from, 0);
  assert.equal(p.to, 0);
  assert.equal(p.items.length, 0);
  assert.equal(p.hasPrev, false);
  assert.equal(p.hasNext, false);
});

test("paginate: مقاس صفحة فاسد يسقط إلى القيمة الافتراضية", () => {
  for (const bad of [0, -5, null, undefined, NaN, "س"]) {
    assert.equal(M.paginate(idx, 1, bad).pageSize, M.PAGE_SIZE);
  }
  assert.equal(M.paginate(idx, 1, "20").pageSize, 20);
  assert.equal(M.paginate(idx, 1, 20).pages, Math.ceil(189 / 20));
});

test("paginate: مدخل ليس مصفوفة يعامَل قائمةً فارغة لا انهياراً", () => {
  for (const bad of [null, undefined, 5, "نص", {}]) {
    const p = M.paginate(bad, 1, 12);
    assert.equal(p.total, 0);
    assert.equal(p.pages, 1);
  }
});

test("paginate: تقسيم كامل بلا صفحة زائدة فارغة", () => {
  const twelve = idx.slice(0, 24);
  const p = M.paginate(twelve, 2, 12);
  assert.equal(p.pages, 2);
  assert.equal(p.items.length, 12);
  assert.equal(p.to, 24);
  assert.equal(p.hasNext, false);
});

test("paginate: كل الصفحات مجتمعة تعيد القائمة كاملة بلا تكرار ولا فقد", () => {
  const seen = [];
  for (let p = 1; p <= 16; p++) {
    for (const e of M.paginate(idx, p, 12).items) seen.push(e.key);
  }
  assert.equal(seen.length, 189);
  assert.equal(new Set(seen).size, 189);
});

test("pageOfKey يعيد صفحة الحي المطلوب — والافتراضية عند الغياب", () => {
  const sorted = M.sortEntries(idx, "sector");
  const target = sorted[40];
  assert.equal(M.pageOfKey(sorted, target.key, 12), Math.floor(40 / 12) + 1);
  assert.equal(M.pageOfKey(sorted, sorted[0].key, 12), 1);
  assert.equal(M.pageOfKey(sorted, "لا-يوجد", 12), 1);
  assert.equal(M.pageOfKey(sorted, "", 12), 1);
  /* الصفحة المعادة تحتوي الحي فعلاً */
  const pg = M.pageOfKey(sorted, target.key, 12);
  assert.ok(M.paginate(sorted, pg, 12).items.some((e) => e.key === target.key));
});

/* ══════════════════ اشتقاق الحالات ══════════════════ */

test("sampleStatus: اشتقاق تعريفي من حضور صف العينة", () => {
  const a = M.sampleStatus(inSample);
  assert.equal(a.id, "in_sample");
  assert.equal(a.label, "ضمن العينة");
  assert.equal(a.inSample, true);
  assert.equal(a.tone, "pos");

  const b = M.sampleStatus(outSample);
  assert.equal(b.id, "sector_only");
  assert.equal(b.label, "خارج العينة");
  assert.equal(b.inSample, false);
  /* نقص تغطية بيانات لا خلل تشغيلي — المرجاني للعجز والمخالفات حصراً */
  assert.equal(b.tone, "neu");

  const c = M.sampleStatus(null);
  assert.equal(c.id, "unknown");
  assert.equal(c.inSample, false);
  assert.equal(c.tone, "neu");
});

test("sampleStatus يغطي الفهرس كله بلا حالة ثالثة", () => {
  const ids = new Set(idx.map((e) => M.sampleStatus(e).id));
  assert.deepEqual(Array.from(ids).sort(), ["in_sample", "sector_only"]);
  assert.equal(idx.filter((e) => M.sampleStatus(e).inSample).length,
    rel.neighbourhoods.rows.length);
});

test("coverageStatus: فوق/دون/على متوسط المدينة بفارق نقاط محسوب", () => {
  const city = der.coverage_pct;
  const east = M.coverageStatus(der.sector.east.coverage_pct, city);
  assert.equal(east.id, "above");
  assert.equal(east.tone, "pos");
  assert.equal(east.deltaPts,
    RH.data.derive.roundHalfUp(der.sector.east.coverage_pct - city, 1));

  const south = M.coverageStatus(der.sector.south.coverage_pct, city);
  assert.equal(south.id, "below");
  /* فجوة تغطية تُقرأ محايدة — المرجاني محجوز للعجز والمخالفات */
  assert.equal(south.tone, "neu");
  assert.ok(south.deltaPts < 0);

  assert.equal(M.coverageStatus(43.1, 43.1).id, "equal");
  assert.equal(M.coverageStatus(43.1, 43.1).deltaPts, 0);
  assert.equal(M.coverageStatus(null, city).id, "unknown");
  assert.equal(M.coverageStatus(43.1, null).deltaPts, null);
});

test("watchStatus: خلو/نقطة/تجمّع — والنغمة مرجانية عند التركّز حصراً", () => {
  const none = M.watchStatus([]);
  assert.equal(none.id, "none");
  assert.equal(none.count, 0);
  assert.equal(none.tone, "neu");

  const one = M.watchStatus([{ km: 1.2, density: 30 }]);
  assert.equal(one.id, "single");
  assert.equal(one.tone, "neg");

  const many = M.watchStatus([{ km: 1 }, { km: 2 }, { km: 3 }]);
  assert.equal(many.id, "cluster");
  assert.equal(many.count, 3);
  assert.equal(many.tone, "neg");
  assert.ok(many.label.includes(M.pointsLabel(3)));

  assert.equal(M.watchStatus(null).id, "none");
});

/* ══════════════════ أرقام القطاع ══════════════════ */

test("sectorFigures: ثلاثة عشر رقماً كلها منقولة حرفياً من الإصدار", () => {
  const row = rel.sectors.find((s) => s.id === "south");
  const sd = der.sector.south;
  const figs = M.sectorFigures(row, sd);
  assert.equal(figs.length, 13);
  const byId = Object.create(null);
  for (const f of figs) byId[f.id] = f;

  assert.equal(byId.demand.value, row.demand);
  assert.equal(byId.beds.value, row.beds);
  assert.equal(byId.building.value, row.building);
  assert.equal(byId.operational.value, row.operational);
  assert.equal(byId.visits.value, row.visits);
  assert.equal(byId.violations.value, row.violations);
  assert.equal(byId.monitors.value, row.monitors);
  assert.equal(byId.closures.value, row.closures);
  assert.equal(byId.coverage_pct.value, sd.coverage_pct);
  assert.equal(byId.deficit_beds.value, sd.deficit_beds);
  assert.equal(byId.demand_share_pct.value, sd.demand_share_pct);
  assert.equal(byId.violations_share_pct.value, sd.violations_share_pct);
  assert.equal(byId.visits_share_pct.value, sd.visits_share_pct);
});

test("sectorFigures: منظومة اللون مقفلة — المرجاني للعجز والمخالفات حصراً", () => {
  const figs = M.sectorFigures(rel.sectors[0], der.sector.north);
  const neg = figs.filter((f) => f.tone === "neg").map((f) => f.id).sort();
  assert.deepEqual(neg,
    ["deficit_beds", "violations", "violations_share_pct"]);
  const demandTone = figs.filter((f) => f.tone === "demand")
    .map((f) => f.id).sort();
  assert.deepEqual(demandTone, ["demand", "demand_share_pct"]);
  const pos = figs.filter((f) => f.tone === "pos").map((f) => f.id).sort();
  assert.deepEqual(pos, ["beds", "coverage_pct"]);
  /* الذهبي لا يُستهلك لتلوين قيمة بيانات في هذا الملحق إطلاقاً */
  assert.equal(figs.filter((f) => f.tone === "gold").length, 0);
});

test("sectorFigures: كل رقم يحمل مرساة مصدره ونوع تنسيقه", () => {
  for (const s of rel.sectors) {
    const figs = M.sectorFigures(s, der.sector[s.id]);
    for (const f of figs) {
      assert.ok(f.origin && f.origin.length > 0, "رقم بلا مصدر: " + f.id);
      assert.ok(M.VALUE_KINDS.includes(f.kind), "نوع مجهول: " + f.kind);
      assert.ok(typeof f.label === "string" && f.label.length > 0);
      assert.notEqual(M.formatValue(f.value, f.kind), "—",
        "قيمة قطاعية غائبة: " + f.id);
    }
  }
});

test("sectorFigures: غياب المشتقات يقصر القائمة على الخام بلا اختلاق", () => {
  const figs = M.sectorFigures(rel.sectors[0], null);
  assert.equal(figs.length, 8);
  assert.ok(figs.every((f) => f.origin.startsWith("sectors[]")));
  assert.equal(M.sectorFigures(null, der.sector.north).length, 0);
});

test("sectorRowOf وsectorDerivedOf يرفضان المجهول بصدق", () => {
  assert.equal(M.sectorRowOf(rel, "north").id, "north");
  assert.equal(M.sectorRowOf(rel, "لا-يوجد"), null);
  assert.equal(M.sectorRowOf(null, "north"), null);
  assert.equal(M.sectorDerivedOf(der, "south").coverage_pct,
    der.sector.south.coverage_pct);
  assert.equal(M.sectorDerivedOf(der, "لا-يوجد"), null);
  assert.equal(M.sectorDerivedOf(null, "south"), null);
});

/* ══════════════════ بطاقة العينة ══════════════════ */

test("sampleBlock: القيم منقولة حرفياً والوسم يلازمها", () => {
  const row = rel.neighbourhoods.rows[0];
  const b = M.sampleBlock(row, rel);
  assert.equal(b.name, row.name);
  assert.equal(b.sector, row.sector);
  assert.equal(b.sampleLabel, rel.meta.sample_label);
  assert.equal(b.rankingNote, rel.neighbourhoods.ranking_note);
  assert.equal(b.rows.length, 4);
  const byId = Object.create(null);
  for (const r of b.rows) byId[r.id] = r;
  assert.equal(byId.beds.value, row.beds);
  assert.equal(byId.building.value, row.building);
  assert.equal(byId.operational.value, row.operational);
  assert.equal(byId.violations.value, row.violations);
  assert.equal(byId.violations.tone, "neg");
  assert.equal(byId.beds.tone, "pos");
});

test("sampleBlock: غياب الصف يعيد null — لا بطاقة بقيم مشتقة", () => {
  assert.equal(M.sampleBlock(null, rel), null);
  assert.equal(M.sampleBlock(undefined, rel), null);
});

test("sampleLabelOf يعود إلى label العينة عند غياب meta.sample_label", () => {
  assert.equal(M.sampleLabelOf(rel), rel.meta.sample_label);
  const noMeta = mutated((r) => { delete r.meta.sample_label; });
  assert.equal(M.sampleLabelOf(noMeta), rel.neighbourhoods.label);
  assert.equal(M.sampleLabelOf(null), "");
});

test("sampleTotals: مجاميع العينة العشرين لا مجاميع المدينة", () => {
  const t = M.sampleTotals(rel);
  assert.equal(t.count, 20);
  const rows = rel.neighbourhoods.rows;
  assert.equal(t.beds, rows.reduce((a, r) => a + r.beds, 0));
  assert.equal(t.building, rows.reduce((a, r) => a + r.building, 0));
  assert.equal(t.operational, rows.reduce((a, r) => a + r.operational, 0));
  assert.equal(t.violations, rows.reduce((a, r) => a + r.violations, 0));
  /* البرهان أنها عينة لا مدينة: مجموع أسرّتها دون الطاقة المرخصة المنشورة */
  assert.ok(t.beds < rel.metrics.licensed_beds.value);
});

test("sampleRank: رتبة داخل العينة مع ملاحظة الترتيب المنشورة", () => {
  const rows = rel.neighbourhoods.rows;
  const top = rows.slice().sort((a, b) => b.beds - a.beds)[0];
  const r = M.sampleRank(rel, top, "beds");
  assert.equal(r.rank, 1);
  assert.equal(r.of, 20);
  assert.equal(r.value, top.beds);
  assert.equal(r.note, rel.neighbourhoods.ranking_note);

  const bottom = rows.slice().sort((a, b) => a.beds - b.beds)[0];
  assert.equal(M.sampleRank(rel, bottom, "beds").rank, 20);
  assert.equal(M.sampleRank(rel, null, "beds"), null);
  assert.equal(M.sampleRank(rel, { name: "س" }, "beds"), null);
});

test("sampleRank: التعادل يأخذ الرتبة نفسها بلا قفز مصطنع", () => {
  const tied = mutated((r) => {
    r.neighbourhoods.rows[0].beds = 999999;
    r.neighbourhoods.rows[1].beds = 999999;
  });
  const a = M.sampleRank(tied, tied.neighbourhoods.rows[0], "beds");
  const b = M.sampleRank(tied, tied.neighbourhoods.rows[1], "beds");
  assert.equal(a.rank, 1);
  assert.equal(b.rank, 1);
});

test("sampleRanks يغطي المقاييس الأربعة بأنواع تنسيق معلنة", () => {
  const ranks = M.sampleRanks(rel, rel.neighbourhoods.rows[0]);
  assert.equal(ranks.length, 4);
  assert.deepEqual(ranks.map((r) => r.metric),
    ["beds", "building", "operational", "violations"]);
  for (const r of ranks) {
    assert.ok(M.VALUE_KINDS.includes(r.kind));
    assert.ok(r.rank >= 1 && r.rank <= r.of);
  }
  assert.equal(M.sampleRanks(rel, null).length, 0);
});

/* ══════════════════ الجغرافيا: التركّز والجوار ══════════════════ */

test("hotspotsFor: كل نقطة ضمن النطاق ومرتبة تصاعدياً بالمسافة", () => {
  let anyFound = false;
  for (const e of idx) {
    const list = M.hotspotsFor(e, geo);
    for (let i = 0; i < list.length; i++) {
      assert.ok(list[i].km <= M.HOTSPOT_RADIUS_KM,
        "نقطة خارج النطاق في " + e.name);
      if (i) assert.ok(list[i - 1].km <= list[i].km);
      assert.ok(typeof list[i].density === "number");
      anyFound = true;
    }
  }
  assert.ok(anyFound, "لا نقطة تركّز التُقطت — الفحص بلا قيمة");
});

test("hotspotsFor: نصف قطر مخصص يوسّع النطاق ولا يخترع نقاطاً", () => {
  const e = idx.find((x) => M.hotspotsFor(x, geo).length > 0);
  const wide = M.hotspotsFor(e, geo, 500);
  assert.ok(wide.length >= M.hotspotsFor(e, geo).length);
  assert.equal(wide.length, geo.hotspots.length);
  assert.equal(M.hotspotsFor(null, geo).length, 0);
  assert.equal(M.hotspotsFor(e, null).length, 0);
});

test("hotspotSummary: خلاصة صادقة عند الخلو وعند الحضور", () => {
  const empty = M.hotspotSummary([]);
  assert.equal(empty.count, 0);
  assert.equal(empty.nearestKm, null);
  assert.equal(empty.maxDensity, null);
  assert.equal(empty.sumDensity, 0);

  const list = [{ km: 2.4, density: 30 }, { km: 0.9, density: 51 }];
  const s = M.hotspotSummary(list);
  assert.equal(s.count, 2);
  assert.equal(s.nearestKm, 0.9);
  assert.equal(s.maxDensity, 51);
  assert.equal(s.sumDensity, 81);
  assert.equal(M.hotspotSummary(null).count, 0);
});

test("hotspotStats: خريطة لكل الفهرس ولا تحقن حقولاً على المدخلات", () => {
  const stats = M.hotspotStats(idx, geo);
  assert.equal(stats.size, 189);
  for (const e of idx) {
    assert.equal(stats.get(e.key).count, M.hotspotsFor(e, geo).length);
    assert.equal(e.count, undefined);
    assert.equal(e.nearestKm, undefined);
  }
});

test("neighboursOf: يستبعد الحي نفسه ويرتب بالأقرب ويحترم الحد", () => {
  const near = M.neighboursOf(idx, inSample, 8);
  assert.equal(near.length, 8);
  assert.ok(near.every((n) => n.entry.key !== inSample.key));
  for (let i = 1; i < near.length; i++) {
    assert.ok(near[i - 1].km <= near[i].km);
  }
  for (const n of near) {
    assert.equal(n.sameSector, n.entry.sector === inSample.sector);
    assert.equal(n.inSample, !!n.entry.sample);
    /* المسافة حساب haversine مقرّب لمنزلة واحدة — لا تقدير */
    assert.equal(n.km,
      Math.round(G.distanceKm(inSample.centroid, n.entry.centroid) * 10) / 10);
  }
  assert.equal(M.neighboursOf(idx, inSample, 3).length, 3);
  assert.equal(M.neighboursOf(idx, inSample).length, M.NEIGHBOUR_LIMIT);
  assert.equal(M.neighboursOf(idx, null).length, 0);
});

test("countDistricts وsectorGeoStats يطابقان ملف الحدود حرفياً", () => {
  assert.equal(M.countDistricts(geo), 189);
  assert.equal(M.countDistricts(null), 0);
  const st = M.sectorGeoStats(geo);
  let sumD = 0, sumH = 0;
  for (const sid of G.SECTOR_ORDER) {
    assert.equal(st[sid].districts, geo.sectors[sid].length);
    sumD += st[sid].districts;
    sumH += st[sid].hotspots;
  }
  assert.equal(sumD, 189);
  assert.equal(sumH, geo.hotspots.length);
});

test("sampleCountOf يعد صفوف العينة بالقطاع", () => {
  let total = 0;
  for (const sid of G.SECTOR_ORDER) {
    const n = M.sampleCountOf(rel, sid);
    assert.equal(n,
      rel.neighbourhoods.rows.filter((r) => r.sector === sid).length);
    total += n;
  }
  assert.equal(total, 20);
});

/* ══════════════════ نموذج لوحة الحي — قلب عقد الصدق ══════════════════ */

test("panelModel: حي ضمن العينة يحمل بطاقته ولا يحمل حالة صادقة", () => {
  const m = M.panelModel(inSample, rel, der, geo);
  assert.equal(m.honest, null);
  assert.ok(m.sample);
  assert.equal(m.sample.sampleLabel, rel.meta.sample_label);
  assert.equal(m.name, inSample.name);
  assert.equal(m.sector, inSample.sector);
  assert.equal(m.key, inSample.key);
  assert.equal(m.sectorFigures.length, 13);
});

test("panelModel: حي خارج العينة يحمل نص العقد ولا يتسرب إليه رقم حيّي", () => {
  const m = M.panelModel(outSample, rel, der, geo);
  assert.equal(m.sample, null);
  assert.equal(m.honest, M.HONEST_NO_DATA);
  /* كل رقم في النموذج مصدره قطاعي أو جغرافي معلن — لا رقم بلا مرساة */
  for (const f of m.sectorFigures) {
    assert.ok(f.origin.startsWith("sectors[]")
      || f.origin.startsWith("derived.sector[]"));
  }
});

test("panelModel: كل الأحياء الـ189 إما ببطاقة عينة وإما بالحالة الصادقة", () => {
  let withSample = 0;
  for (const e of idx) {
    const m = M.panelModel(e, rel, der, geo);
    const hasSample = !!m.sample;
    assert.equal(hasSample, m.honest === null,
      "تناقض بين البطاقة والحالة في " + e.name);
    if (hasSample) {
      withSample += 1;
      assert.equal(m.sample.sampleLabel, rel.meta.sample_label,
        "بطاقة عينة بلا وسمها في " + e.name);
    } else {
      assert.equal(m.honest, M.HONEST_NO_DATA);
    }
  }
  assert.equal(withSample, rel.neighbourhoods.rows.length);
});

test("panelModel: القيم القطاعية تطابق الإصدار لكل حي بلا انحراف", () => {
  for (const e of idx) {
    const m = M.panelModel(e, rel, der, geo);
    const row = rel.sectors.find((s) => s.id === e.sector);
    const sd = der.sector[e.sector];
    const byId = Object.create(null);
    for (const f of m.sectorFigures) byId[f.id] = f.value;
    assert.equal(byId.demand, row.demand);
    assert.equal(byId.beds, row.beds);
    assert.equal(byId.coverage_pct, sd.coverage_pct);
    assert.equal(byId.deficit_beds, sd.deficit_beds);
    assert.equal(m.sectorName, row.name);
  }
});

test("panelModel: النقاط المرفقة هي عين ما تعيده hotspotsFor", () => {
  for (const e of idx.slice(0, 40)) {
    const m = M.panelModel(e, rel, der, geo);
    assert.deepEqual(m.hotspots.map((x) => x.km),
      M.hotspotsFor(e, geo).map((x) => x.km));
  }
});

test("panelModel: مدخل غائب يعيد null — لا لوحة بحي مختلق", () => {
  assert.equal(M.panelModel(null, rel, der, geo), null);
  assert.equal(M.panelModel(undefined, rel, der, geo), null);
});

test("panelModel: غياب ملف الحدود لا يخترع نقاط تركّز", () => {
  const m = M.panelModel(inSample, rel, der, null);
  assert.equal(m.hotspots.length, 0);
  assert.ok(m.sample, "بطاقة العينة لا تعتمد على ملف الحدود");
});

/* ══════════════════ اللوحة التمهيدية ══════════════════ */

test("overviewModel: كل عدد منقول من الإصدار أو ملف الحدود", () => {
  const ov = M.overviewModel(rel, der, geo);
  assert.equal(ov.totalDistricts, 189);
  assert.equal(ov.sampleCount, 20);
  assert.equal(ov.hotspotCount, geo.hotspots.length);
  assert.equal(ov.sectorCount, rel.sectors.length);
  assert.equal(ov.cityDemand, rel.metrics.total_demand.value);
  assert.equal(ov.cityBeds, rel.metrics.licensed_beds.value);
  assert.equal(ov.cityCoveragePct, der.coverage_pct);
  assert.equal(ov.cityDeficitBeds, der.deficit_beds);
  assert.equal(ov.sampleLabel, rel.meta.sample_label);
  assert.equal(ov.mapDisclaimer, rel.meta.map_disclaimer);
  assert.equal(ov.dataAsOf, rel.meta.data_as_of);
  assert.equal(ov.monitoringPeriod, rel.meta.monitoring_period_label);
  assert.ok(ov.attribution.includes("MIT"));
});

test("overviewModel: صفوف القطاعات مرآة للإصدار ومشتقاته", () => {
  const ov = M.overviewModel(rel, der, geo);
  assert.equal(ov.sectors.length, 5);
  for (const s of ov.sectors) {
    const row = rel.sectors.find((x) => x.id === s.id);
    const sd = der.sector[s.id];
    assert.equal(s.demand, row.demand);
    assert.equal(s.beds, row.beds);
    assert.equal(s.violations, row.violations);
    assert.equal(s.monitors, row.monitors);
    assert.equal(s.coveragePct, sd.coverage_pct);
    assert.equal(s.deficitBeds, sd.deficit_beds);
    assert.equal(s.districts, geo.sectors[s.id].length);
    assert.equal(s.sampleCount, M.sampleCountOf(rel, s.id));
  }
  assert.equal(ov.sectors.reduce((a, s) => a + s.beds, 0),
    rel.metrics.licensed_beds.value);
});

test("overviewModel: غياب ملف الحدود يعلن الصفر ولا يخمّن", () => {
  const ov = M.overviewModel(rel, der, null);
  assert.equal(ov.totalDistricts, 0);
  assert.equal(ov.hotspotCount, 0);
  assert.ok(ov.sectors.every((s) => s.districts === 0 && s.hotspots === 0));
  /* أرقام الإصدار تبقى كاملة — الغياب جغرافي لا بياني */
  assert.equal(ov.cityDemand, rel.metrics.total_demand.value);
});

/* ══════════════════ الإسناد ══════════════════ */

test("provenanceModel: سطر لكل مصدر مع وسم العينة الملازم", () => {
  const rows = M.provenanceModel(inSample, rel, geo);
  const ids = rows.map((r) => r.id);
  assert.ok(ids.includes("name"));
  assert.ok(ids.includes("sector"));
  assert.ok(ids.includes("sector_figures"));
  assert.ok(ids.includes("sample"));
  assert.ok(ids.includes("hotspots"));
  assert.ok(ids.includes("distance"));
  assert.ok(ids.includes("map"));
  const sample = rows.find((r) => r.id === "sample");
  assert.equal(sample.note, rel.meta.sample_label);
  const map = rows.find((r) => r.id === "map");
  assert.equal(map.note, rel.meta.map_disclaimer);
  for (const r of rows) {
    assert.ok(r.what && r.origin && r.detail, "سطر إسناد ناقص: " + r.id);
  }
});

test("provenanceModel: الحي خارج العينة يحمل الحالة الصادقة في إسناده", () => {
  const rows = M.provenanceModel(outSample, rel, geo);
  const miss = rows.find((r) => r.id === "sample_missing");
  assert.ok(miss, "لا سطر يعلن غياب قيم الحي");
  assert.equal(miss.detail, M.HONEST_NO_DATA);
  assert.equal(miss.origin, "غير متوفرة");
  assert.equal(rows.find((r) => r.id === "sample"), undefined);
});

test("provenanceModel: قرار المطابقة المحسوم يُنقل نصاً حين وُجد", () => {
  const rows = M.provenanceModel(inSample, rel, geo);
  const dec = rows.find((r) => r.id === "hotspots_decision");
  assert.ok(dec);
  assert.equal(dec.detail, rel.quarantine_resolved.hotspots.resolution);

  const noQr = mutated((r) => { delete r.quarantine_resolved; });
  assert.equal(
    M.provenanceModel(inSample, noQr, geo)
      .find((r) => r.id === "hotspots_decision"),
    undefined);
});

/* ══════════════════ ملخص البحث ══════════════════ */

test("searchSummary يركّب جملة صادقة من الحالة الفعلية", () => {
  assert.equal(M.searchSummary({ total: 0 }), "لا نتائج");
  assert.equal(M.searchSummary({ total: 1 }), "نتيجة واحدة");
  const s = M.searchSummary({
    total: 7, query: " الملقا ", sectorName: "قطاع الشمال",
    sampleOnly: true, sortLabel: M.SORT_LABELS.name,
  });
  assert.ok(s.startsWith("7" + fmt.NBSP + "نتائج"));
  assert.ok(s.includes("«الملقا»"));
  assert.ok(s.includes("قطاع الشمال"));
  assert.ok(s.includes("ضمن العينة الموثقة فقط"));
  assert.ok(s.includes(M.SORT_LABELS.name));
  assert.equal(M.searchSummary({}), "لا نتائج");
});

/* ══════════════════ بوابات الصدق الشاملة ══════════════════ */

test("لا قيمة موسومة بلا وسمها: 81.6٪ لا تظهر في أي مخرج للأطلس", () => {
  const compliance = rel.compliance.value;
  const seen = [];
  const scan = (obj) => {
    if (obj == null) return;
    if (typeof obj === "number") { seen.push(obj); return; }
    if (Array.isArray(obj)) { for (const x of obj) scan(x); return; }
    if (typeof obj === "object") {
      for (const k of Object.keys(obj)) {
        if (k === "rings" || k === "centroid" || k === "entry") continue;
        scan(obj[k]);
      }
    }
  };
  for (const e of [inSample, outSample]) {
    scan(M.panelModel(e, rel, der, geo));
    scan(M.provenanceModel(e, rel, geo));
  }
  scan(M.overviewModel(rel, der, geo));
  assert.ok(!seen.includes(compliance),
    "قيمة الامتثال المعلّقة منهجياً تسربت إلى الأطلس بلا وسمها");
});

test("لا رقم مختلق: كل قيمة عددية في لوحة أي حي لها أصل منشور", () => {
  const allowed = new Set();
  for (const s of rel.sectors) {
    for (const k of ["demand", "beds", "building", "operational", "visits",
      "violations", "monitors", "closures"]) allowed.add(s[k]);
    const sd = der.sector[s.id];
    for (const k of ["coverage_pct", "deficit_beds", "demand_share_pct",
      "violations_share_pct", "visits_share_pct"]) allowed.add(sd[k]);
  }
  for (const r of rel.neighbourhoods.rows) {
    for (const k of ["beds", "building", "operational", "violations"]) {
      allowed.add(r[k]);
    }
  }
  for (const e of idx) {
    const m = M.panelModel(e, rel, der, geo);
    for (const f of m.sectorFigures) {
      assert.ok(allowed.has(f.value),
        "رقم قطاعي بلا أصل منشور: " + f.id + " في " + e.name);
    }
    if (m.sample) {
      for (const r of m.sample.rows) {
        assert.ok(allowed.has(r.value),
          "قيمة عينة بلا أصل منشور: " + r.id + " في " + e.name);
      }
    }
  }
});

test("لا قيمة حيّية تُشتق من القطاع: الأحياء خارج العينة بلا صفوف قيم", () => {
  const outs = idx.filter((e) => !e.sample);
  assert.equal(outs.length, 189 - rel.neighbourhoods.rows.length);
  for (const e of outs) {
    const m = M.panelModel(e, rel, der, geo);
    assert.equal(m.sample, null);
    assert.equal(M.sampleRank(rel, e.sample, "beds"), null);
    assert.equal(M.sampleRanks(rel, e.sample).length, 0);
  }
});

test("الفهرس المرشّح والمرتّب والمرقّم يبقى مجموعة فرعية أمينة من الـ189", () => {
  const keys = new Set(idx.map((e) => e.key));
  for (const sort of M.SORT_IDS) {
    for (const sector of ["all"].concat(Array.from(G.SECTOR_ORDER))) {
      const filtered = M.filterEntries(idx, { sector, sampleOnly: false });
      const sorted = M.sortEntries(filtered, sort,
        sort === "hotspots" ? { stats: M.hotspotStats(idx, geo) } : null);
      assert.equal(sorted.length, filtered.length);
      assert.equal(new Set(sorted.map((e) => e.key)).size, sorted.length);
      for (const e of sorted) assert.ok(keys.has(e.key));
      const pg = M.paginate(sorted, 2, M.PAGE_SIZE);
      assert.ok(pg.items.length <= M.PAGE_SIZE);
      for (const e of pg.items) assert.ok(keys.has(e.key));
    }
  }
});
