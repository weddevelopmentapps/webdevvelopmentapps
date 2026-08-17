/* ════════════════════════════════════════════════════════════════════════════
   tab-licensing.test.mjs — نموذج التبويب ٢ «التراخيص»
   (‎RH.presenter.tabModels.licensing‎ — عقد V3_CONTRACTS §4 و§5 و§7)
   ────────────────────────────────────────────────────────────────────────────
   ما يُثبَت هنا هو ما يمنع الانجراف الذي ترفضه بوابات القبول:

     • **لا اختلاق**: كل رقم في كل مواصفة إبراز هو صياغة ‎fmt‎ لرقم موجود في
       ‎release.json‎ أو مشتقة معتمدة — والتراكمي ينتهي عند القيمة المنشورة
       حرفياً (96 · 140 · 612,400)، فهو إعادة تعبير لا تقدير جديد.
     • **حد الإبراز 320 حرفاً** (V3_SPEC §5) مُثبَت على **كل** مواصفة يولّدها
       التبويب: 3 إجماليات + خط الأساس + 12 شهراً × قراءتين + 189 حياً × 3
       طبقات — كلها تمر من ‎RH.highlight.normalize(spec, {strict:true})‎ دون
       أن ترمي، أي دون قصّ ولا إسقاط رقم.
     • **≤3 أرقام مساندة وزر واحد** في كل مواصفة، ووجهة الزر ملحق ‎licensing‎
       بصفحة من صفحاته المعرَّفة في ‎ax-licensing.js‎ لا غير.
     • **صدق مستوى الحي**: حي خارج عينة الأحياء المدرجة لا يحمل رقماً على
       مستواه إطلاقاً — تُعرض قيم قطاعه المعتمدة، ويلازمها وسم الصدق في
       ‎note‎ (وهو خارج حدّ الأحرف فلا يُقصّ أبداً).
     • **العزل الاتجاهي**: كل نسبة/إشارة موقعة معزولة بـ‎LRI/PDI‎ فلا تنقلب
       في سياق عربي.
     • **حراسة المعاملات**: طبقة الخريطة القادمة من العنوان تُحصر في القائمة
       القانونية ولا تتسرب قيمة غريبة إلى النموذج.

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
const SRC = path.join(ROOT, "src", "js", "presenter", "tabs", "t2-licensing.js");
new Function("RH", readFileSync(SRC, "utf8"))(RH);

const M = RH.presenter.tabModels.licensing;
const HL = RH.highlight;
const fmt = RH.core.fmt;

const rel = freshRelease();
const geo = freshGeo();
const der = RH.data.derive.compute(rel);
const index = RH.viz.geoutils.districtIndex(geo, rel, der);

/** الفهرس مقسوم إلى داخل العينة وخارجها — الفصل هو مربط الصدق كله */
const inSample = index.filter((e) => e.sample);
const outSample = index.filter((e) => !e.sample);

/** محارف العزل الاتجاهي (LRI/PDI) — تلازم كل رقم مختلط في نص عربي */
const LRI = "⁦";
const PDI = "⁩";

/* ══════════════════════ 0) التحميل وشكل الواجهة ══════════════════════ */

test("الوحدة تُعرَّف على RH.presenter.tabModels دون لمس DOM ودون تسجيل تبويب", () => {
  assert.ok(M, "RH.presenter.tabModels.licensing غير معرَّف");
  for (const fn of ["series", "categories", "fullTitles", "totals", "layerRange",
    "layerKeyOf", "totalHighlight", "baselineHighlight", "monthHighlight",
    "districtHighlight", "allHighlightSpecs", "signedPct", "plusInt"]) {
    assert.equal(typeof M[fn], "function", "الدالة الناقصة: " + fn);
  }
  /* قشرة التبويبات غائبة في بيئة الوحدة فلا يجوز أن يكون التسجيل قد وقع */
  assert.equal(RH.tabs, undefined,
    "تسجيل التبويب يجب أن يتخطى نفسه بغياب القشرة");
});

test("ترتيب الطبقات مقفل على ثلاثة مقاييس — أسرّة ثم تشغيلية ثم بناء", () => {
  assert.deepEqual(norm(M.LAYER_ORDER), ["beds", "operational", "building"]);
  assert.deepEqual(norm(Object.keys(M.LAYERS)).sort(),
    ["beds", "building", "operational"]);
});

test("layerKeyOf يحرس معامل العنوان: كل قيمة خارج القائمة تسقط إلى الأسرّة", () => {
  assert.equal(M.layerKeyOf("operational"), "operational");
  assert.equal(M.layerKeyOf("building"), "building");
  assert.equal(M.layerKeyOf("beds"), "beds");
  for (const bad of [null, undefined, "", "violations", "BEDS", "0", 7, {}]) {
    assert.equal(M.layerKeyOf(bad), "beds", "قيمة غريبة لم تُحصر: " + String(bad));
  }
});

/* ══════════════════════ 1) السلاسل الزمنية والتراكمي ══════════════════════ */

test("السلسلة الشهرية اثنا عشر شهراً، والتراكمي يبدأ من خط الأساس", () => {
  const S = M.series(rel);
  assert.equal(S.months.length, 12);
  assert.equal(S.base.building, rel.baseline.building);
  assert.equal(S.base.operational, rel.baseline.operational);
  assert.equal(S.base.beds, rel.baseline.beds);
  for (const k of ["building", "operational", "beds"]) {
    assert.equal(S.cum[k].length, 12, "طول التراكمي: " + k);
  }
});

test("التراكمي ينتهي عند القيمة المنشورة حرفياً — 96 و140 و612,400", () => {
  const S = M.series(rel);
  assert.equal(S.end.building, 96);
  assert.equal(S.end.operational, 140);
  assert.equal(S.end.beds, 612400);
  assert.equal(S.end.building, rel.metrics.current_building.value);
  assert.equal(S.end.operational, rel.metrics.current_operational.value);
  assert.equal(S.end.beds, rel.metrics.licensed_beds.value);
  assert.equal(S.cum.building[11], S.cur.building);
  assert.equal(S.cum.operational[11], S.cur.operational);
  assert.equal(S.cum.beds[11], S.cur.beds);
});

test("التراكمي غير تناقصي وكل خطوة تساوي صافي شهرها بالضبط", () => {
  const S = M.series(rel);
  for (const k of ["building", "operational", "beds"]) {
    let prev = S.base[k];
    S.months.forEach((m, i) => {
      assert.equal(S.cum[k][i] - prev, m[k],
        "الخطوة لا تساوي الصافي: " + k + " @" + i);
      assert.ok(S.cum[k][i] >= prev, "تراكمي متناقص: " + k + " @" + i);
      prev = S.cum[k][i];
    });
  }
});

test("الفئات ١٣: نقطة الأساس ثم اثنا عشر شهراً بتسمية مختصرة بلا سنة", () => {
  const cats = M.categories(rel);
  assert.equal(cats.length, 13);
  assert.equal(cats[0], "الأساس");
  assert.equal(cats[1], "سبتمبر");
  assert.equal(cats[12], "أغسطس");
  for (const c of cats.slice(1)) {
    assert.ok(!/\d{4}$/.test(c), "تسريب سنة في تسمية مختصرة: " + c);
  }
});

test("العناوين الكاملة تقابل الفئات واحداً بواحد وتبدأ بوسم خط الأساس", () => {
  const titles = M.fullTitles(rel);
  assert.equal(titles.length, M.categories(rel).length);
  assert.equal(titles[0], rel.meta.baseline_label);
  assert.equal(titles[1], rel.monthly.licensing[0].label);
  assert.equal(titles[12], rel.monthly.licensing[11].label);
});

/* ══════════════════════ 2) الإجماليات الثلاثة ══════════════════════ */

test("الإجماليات بترتيب الموجز: بناء ثم تشغيلية ثم أسرّة، بقيم الإصدار", () => {
  const t = M.totals(rel, der);
  assert.deepEqual(norm(t.map((x) => x.key)), ["building", "operational", "beds"]);
  assert.deepEqual(norm(t.map((x) => x.value)), [96, 140, 612400]);
  assert.deepEqual(norm(t.map((x) => x.base)), [64, 118, 563900]);
  assert.deepEqual(norm(t.map((x) => x.growthAbs)), [32, 22, 48500]);
  assert.deepEqual(norm(t.map((x) => x.growthPct)), [50.0, 18.6, 8.6]);
});

test("صياغة الأرقام الكبرى: الرخص بعدد دقيق والأسرّة بصيغة تنفيذية مختصرة", () => {
  const t = M.totals(rel, der);
  assert.equal(t[0].num, "96");
  assert.equal(t[0].word, "");
  assert.equal(t[0].unit, "رخصة");
  assert.equal(t[1].num, "140");
  assert.equal(t[2].num, "612.4");
  assert.equal(t[2].word, "ألف");
  assert.equal(t[2].unit, "سرير");
  /* القيمة الدقيقة تلازم المختصرة في وسم الإتاحة — لا تختفي خلف التقريب */
  assert.equal(t[2].exact, fmt.unitAfter(612400, "سرير"));
  assert.equal(t[0].exact, fmt.noun(96, "licence"));
});

test("النمو المعروض يطابق المشتقات المنشورة في الإصدار لا حساباً محلياً", () => {
  const t = M.totals(rel, der);
  assert.equal(t[0].growthPct, rel.derived.growth_building_pct.value);
  assert.equal(t[1].growthPct, rel.derived.growth_operational_pct.value);
  assert.equal(t[2].growthPct, rel.derived.growth_beds_pct.value);
  assert.equal(t[0].growthAbs, rel.derived.growth_building_abs.value);
  assert.equal(t[2].growthAbs, rel.derived.growth_beds_abs.value);
});

test("signedPct وplusInt معزولان اتجاهياً بإشارة صريحة", () => {
  assert.equal(M.signedPct(50.0), LRI + "+50.0٪" + PDI);
  assert.equal(M.signedPct(8.6), LRI + "+8.6٪" + PDI);
  assert.equal(M.signedPct(-3.25), LRI + "−3.3٪" + PDI);
  assert.equal(M.plusInt(48500), LRI + "+48,500" + PDI);
  assert.equal(M.plusInt(-5), LRI + "−5" + PDI);
  assert.equal(M.signedPct(null), "—");
  assert.equal(M.plusInt(null), "—");
});

test("layerRange يعيد مدى القطاعات الخمسة الخام لكل طبقة", () => {
  const s = rel.sectors;
  const mn = (f) => Math.min.apply(null, s.map(f));
  const mx = (f) => Math.max.apply(null, s.map(f));
  assert.deepEqual(norm(M.layerRange(rel, "beds")),
    { min: mn((x) => x.beds), max: mx((x) => x.beds) });
  assert.deepEqual(norm(M.layerRange(rel, "building")),
    { min: mn((x) => x.building), max: mx((x) => x.building) });
  assert.deepEqual(norm(M.layerRange(rel, "operational")),
    { min: mn((x) => x.operational), max: mx((x) => x.operational) });
  /* طبقة غريبة تسقط إلى الأسرّة لا إلى مدى صفري مختلق */
  assert.deepEqual(norm(M.layerRange(rel, "nope")), norm(M.layerRange(rel, "beds")));
});

/* ══════════════════════ 3) مواصفات الإبراز ══════════════════════ */

test("إبراز الرقم الكبير: من خط الأساس إلى الحالي بثلاثة أرقام مساندة وزر واحد", () => {
  const spec = M.totalHighlight(rel, der, "beds");
  assert.equal(spec.title, "الطاقة الاستيعابية المرخصة");
  assert.ok(spec.sentence.includes(fmt.unitAfter(563900, "سرير")));
  assert.ok(spec.sentence.includes(fmt.unitAfter(612400, "سرير")));
  assert.equal(spec.stats.length, 3);
  assert.equal(spec.stats[0].value, fmt.int(563900));
  assert.equal(spec.stats[1].value, M.plusInt(48500));
  assert.equal(spec.stats[2].value, M.signedPct(8.6));
  assert.equal(spec.appendix.id, "licensing");
  assert.equal(spec.appendix.params.page, "1");
  assert.equal(spec.note, rel.meta.comparison_qualifier);
});

test("إبراز الرقم الكبير للرخص يستعمل تطابق العدد والمعدود لا «64 رخصة» جامدة", () => {
  const spec = M.totalHighlight(rel, der, "building");
  assert.ok(spec.sentence.includes(fmt.noun(64, "licence")), spec.sentence);
  assert.ok(spec.sentence.includes(fmt.noun(96, "licence")), spec.sentence);
  /* مفتاح غريب يسقط إلى الأسرّة لا إلى قيمة مختلقة */
  assert.equal(M.totalHighlight(rel, der, "nope").title,
    M.totalHighlight(rel, der, "beds").title);
});

test("إبراز خط الأساس يحمل القيم الثلاث المرساة بنغمة ذهبية حصراً", () => {
  const spec = M.baselineHighlight(rel);
  assert.equal(spec.title, rel.meta.baseline_label);
  assert.deepEqual(norm(spec.stats.map((s) => s.value)),
    [fmt.int(64), fmt.int(118), fmt.int(563900)]);
  assert.deepEqual(norm(spec.stats.map((s) => s.tone)), ["gold", "gold", "gold"]);
  assert.equal(spec.appendix.params.page, "1");
});

test("إبراز الشهر (قراءة الرخص): الصادر في الشهر وتراكميه من المصدر حرفياً", () => {
  const S = M.series(rel);
  const i = 3;                        /* ديسمبر 2025 */
  const m = S.months[i];
  const spec = M.monthHighlight(rel, der, i, "licences");
  assert.equal(spec.title, m.label);
  assert.ok(spec.sentence.includes(fmt.noun(m.building, "licence")));
  assert.ok(spec.sentence.includes(fmt.noun(m.operational, "licence")));
  assert.equal(spec.stats[0].value, fmt.int(S.cum.building[i]));
  assert.equal(spec.stats[1].value, fmt.int(S.cum.operational[i]));
  assert.equal(spec.stats[2].value, M.plusInt(m.beds));
  assert.equal(spec.appendix.params.page, "0");
});

test("إبراز الشهر (قراءة الأسرّة): تغطية آخر شهر = نسبة التغطية المنشورة", () => {
  const S = M.series(rel);
  const last = S.months.length - 1;
  const spec = M.monthHighlight(rel, der, last, "beds");
  assert.equal(spec.stats[0].value, fmt.int(612400));
  assert.equal(spec.stats[1].value, fmt.pct(der.coverage_pct));
  assert.equal(fmt.pct(der.coverage_pct), fmt.pct(rel.derived.coverage_pct.value));
  assert.ok(spec.sentence.includes(fmt.unitAfter(S.months[last].beds, "سرير")));
});

test("حصص الأشهر من نمو السنة تجمع إلى مئة تقريباً — قسمة على النمو المنشور", () => {
  const S = M.series(rel);
  const growth = rel.derived.growth_beds_abs.value;
  let sum = 0;
  S.months.forEach((m) => { sum += RH.data.derive.pct(m.beds, growth); });
  assert.ok(Math.abs(sum - 100) < 0.5, "مجموع الحصص = " + sum);
});

test("إبراز شهر خارج المدى يعيد null — لا شهر مختلق خارج السلسلة المورّدة", () => {
  assert.equal(M.monthHighlight(rel, der, -1, "beds"), null);
  assert.equal(M.monthHighlight(rel, der, 12, "beds"), null);
  assert.equal(M.monthHighlight(rel, der, 999, "licences"), null);
});

/* ══════════════════════ 4) صدق مستوى الحي ══════════════════════ */

test("الفهرس ينقسم فعلاً: أحياء داخل العينة وأحياء خارجها", () => {
  assert.equal(index.length, 189);
  assert.ok(inSample.length > 0, "لا حي داخل العينة — الفهرسة منكسرة");
  assert.ok(outSample.length > 0, "لا حي خارج العينة — الفحص بلا معنى");
  assert.equal(inSample.length + outSample.length, index.length);
});

test("حي داخل العينة: أرقامه من صف العينة، ووسم العينة يلازمه في note", () => {
  const e = inSample[0];
  const spec = M.districtHighlight(rel, der, e, "beds");
  assert.equal(spec.title, e.name);
  assert.ok(spec.sentence.includes(fmt.unitAfter(e.sample.beds, "سرير")));
  assert.equal(spec.stats[0].value, fmt.int(e.sample.building));
  assert.equal(spec.stats[1].value, fmt.int(e.sample.operational));
  assert.ok(spec.note.includes(rel.neighbourhoods.label));
  assert.ok(spec.note.includes(rel.neighbourhoods.ranking_note));
  assert.equal(spec.appendix.params.page, "4");
});

test("حي خارج العينة: لا رقم على مستواه إطلاقاً — قيم القطاع المعتمدة وحدها", () => {
  const e = outSample[0];
  for (const layer of ["beds", "operational", "building"]) {
    const spec = M.districtHighlight(rel, der, e, layer);
    const L = M.LAYERS[layer];
    assert.ok(spec.sentence.includes("خارج العينة"), spec.sentence);
    assert.ok(spec.sentence.includes(e.sectorName), spec.sentence);
    assert.equal(spec.stats[0].label, L.label);
    assert.equal(spec.stats[0].value, fmt.int(L.sectorVal(e.sectorRow)));
    assert.equal(spec.stats[1].value, fmt.pct(e.sectorDerived.coverage_pct));
    assert.ok(spec.note.includes(rel.meta.map_disclaimer));
    assert.equal(spec.appendix.params.page, "3");
  }
});

test("لا مواصفة حي خارج العينة تسرّب قيمة من عينة حي آخر", () => {
  /* مجموعة كل الأرقام الظاهرة في مواصفات الأحياء خارج العينة */
  const sampleBeds = new Set(rel.neighbourhoods.rows.map((r) => fmt.int(r.beds)));
  const sectorBeds = new Set(rel.sectors.map((s) => fmt.int(s.beds)));
  for (const e of outSample) {
    const spec = M.districtHighlight(rel, der, e, "beds");
    const v = spec.stats[0].value;
    assert.ok(sectorBeds.has(v), "قيمة ليست قطاعية: " + v);
    if (!sectorBeds.has(v)) assert.ok(!sampleBeds.has(v));
  }
});

test("مواصفة بلا مدخل أو بلا صف قطاع تعيد null لا كائناً فارغاً مضللاً", () => {
  assert.equal(M.districtHighlight(rel, der, null, "beds"), null);
  assert.equal(M.districtHighlight(rel, der, { name: "س" }, "beds"), null);
});

/* ══════════════════════ 5) بوابة الحد 320 حرفاً (V3_SPEC §5) ══════════════════════ */

test("كل مواصفة يولّدها التبويب تمر بالوضع الصارم دون قصّ ولا إسقاط", () => {
  const specs = M.allHighlightSpecs(rel, der, index);
  /* 3 إجماليات + خط الأساس + 12 شهراً × قراءتين + 189 حياً × 3 طبقات */
  assert.equal(specs.length, 3 + 1 + (12 * 2) + (189 * 3));
  for (const spec of specs) {
    const out = HL.normalize(spec, { strict: true });   /* يرمي عند التجاوز */
    assert.equal(out.truncated, false, "قُصّت: " + spec.title);
    assert.equal(out.dropped, 0, "أُسقط رقم من: " + spec.title);
    assert.ok(out.chars <= HL.MAX_CHARS,
      "تجاوز الحد (" + out.chars + "): " + spec.title);
    assert.ok(out.stats.length <= HL.MAX_STATS, "أرقام زائدة: " + spec.title);
  }
});

test("كل مواصفة تحمل عنواناً وجملة واحدة وزراً واحداً إلى ملحق التراخيص", () => {
  const PAGES = new Set(["0", "1", "3", "4"]);
  for (const spec of M.allHighlightSpecs(rel, der, index)) {
    assert.ok(spec.title && spec.title.length > 0, "عنوان فارغ");
    assert.ok(spec.sentence && spec.sentence.length > 0, "جملة فارغة");
    /* «جملة واحدة»: نقطة ختامية واحدة فقط في نهاية النص */
    assert.equal(spec.sentence.indexOf("."), spec.sentence.length - 1,
      "أكثر من جملة: " + spec.sentence);
    assert.equal(spec.appendix.id, "licensing");
    assert.ok(PAGES.has(spec.appendix.params.page),
      "صفحة ملحق خارج المعرَّف: " + spec.appendix.params.page);
    assert.ok(spec.appendix.label && spec.appendix.label.length > 0);
  }
});

test("النغمات دلالية مقفلة: pos/neg/gold فقط — ولا مرجاني في التراخيص", () => {
  const ALLOWED = new Set(["pos", "gold", null, undefined]);
  for (const spec of M.allHighlightSpecs(rel, der, index)) {
    for (const st of spec.stats) {
      assert.ok(ALLOWED.has(st.tone),
        "نغمة خارج المنظومة: " + st.tone + " في " + spec.title);
    }
  }
});

test("وسم الصدق (note) خارج حساب الحد فلا يُقصّ ولا يزاحم النص الحرّ", () => {
  const spec = M.districtHighlight(rel, der, outSample[0], "beds");
  const withNote = HL.measure(spec);
  const withoutNote = HL.measure(Object.assign({}, spec, { note: "" }));
  assert.equal(withNote, withoutNote, "الوسم دخل حساب الحد");
  assert.ok(spec.note.length > 0);
});

test("لا رقم ظاهر بلا صياغة fmt: كل قيمة مساندة تطابق صيغة معتمدة", () => {
  const ok = /^[⁦⁩٠-٩٪0-9,.٪+− ؀-ۿ\s]+$/;
  for (const spec of M.allHighlightSpecs(rel, der, index)) {
    for (const st of spec.stats) {
      assert.ok(ok.test(st.value),
        "قيمة غير منسقة: «" + st.value + "» في " + spec.title);
      assert.ok(!/\d{4,}(?![,\d])/.test(st.value.replace(/,/g, "")) || /,/.test(st.value)
        || st.value.includes("٪"),
        "رقم كبير بلا فاصل آلاف: " + st.value);
    }
  }
});
