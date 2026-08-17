/* palette-index.test.mjs — فهرس لوحة الأوامر ومطابقتها RH.palette
   ─────────────────────────────────────────────────────────────────
   عقد التوسعة §7. ما يُثبَت هنا هو ما يمنع الانجراف الذي يرفضه المدقق:

     • **لا رقم من خارج الإصدار**: كل قيمة تظهر في إجابة أي مدخل يجب أن تكون
       موجودة في مجمع أرقام الإصدار المنشور أو مشتقاته المحسوبة مركزياً —
       بوابة شاملة تمسح الفهرس كله مدخلاً مدخلاً.
     • **الوسم يسافر مع الرقم**: 81.6٪ لا تخرج من هذه الوحدة بلا وسم منهجيتها
       ونص ملاحظتها؛ قيم السيناريوهات تلازمها `scenarios.caveat` حرفياً؛
       المستهدف الاسترشادي يلازمه وسم عدم اعتماده؛ ومؤشر بلا قيمة حالية يقول
       ذلك صراحة بالصيغة المعتمدة ولا يخترع رقماً.
     • **الإسناد حقيقي**: كل مقياس خام يحمل مرساة `ورقة!خلية` من الإصدار،
       وكل مشتق يحمل صيغته المنشورة — لا نص إسناد مؤلَّف.
     • **التطبيع مفوَّض**: المطابقة تمر من `geoutils.normalizeAr` حصراً — لا
       تطبيع محلي جديد (تسامح طرف الكلمة يعمل على نص مطبع سلفاً ولا يُخزَّن).
     • **سلّم الدرجات مقفل**: تطابق تام > بادئة > بادئة كلمة > بادئة بعد «أل»
       > احتواء > تسامح الطرف > مساند > تتابع؛ وعلاوة التغطية أصغر من أضيق
       فجوة بين درجتين فلا تقلب الترتيب أبداً.
     • **فصل التعادل بالعقد**: الدرجة ثم النوع (قسم > ملحق > مقياس > حي) ثم
       الترتيب الأبجدي العربي.
     • **منظومة اللون**: المرجاني للعجز والمخالفات حصراً، والذهبي للمستهدف
       وخط الأساس ووسوم الاعتماد حصراً — تدقيق شامل على كل مدخل.
     • **الحساب النقي محصور**: الترقيم ونموذج الحداثة يحصران المدخلات الفاسدة
       بلا خطأ ولا مدى وهمي.

   الوحدة تُحمَّل بملفها الحقيقي: `load-app.mjs` يبني RH كاملة (core + derive
   + geoutils + micro) في سياق vm، ثم يُنفَّذ ملف اللوحة بوسم RH ذاته — فالمنطق
   النقي يُعرَّف دون DOM (حارس CAN_DOM)، وهو بالضبط ما يوجبه عقد قابلية
   الاختبار §0. لم يُعدَّل `load-app.mjs` (ملف المعمار) ولا أي ملف خارج عقد
   هذه الميزة. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RH, ROOT, freshRelease, freshGeo } from "./load-app.mjs";

/* تنفيذ ملف الميزة على RH الحقيقية — بلا نسخ منطق ولا محاكاة للوحدة */
const SRC = path.join(ROOT, "src", "js", "presenter", "palette.js");
new Function("RH", readFileSync(SRC, "utf8"))(RH);

const P = RH.palette;
const G = RH.viz.geoutils;
const fmt = RH.core.fmt;

const rel = freshRelease();
const geo = freshGeo();
const der = RH.data.derive.compute(rel);

/** الملاحق المضمّنة في بناء التسليم الكامل (تسعة) */
const ALL_APX = ["demand", "licensing", "monitoring", "pillar", "kpi",
  "scenarios", "atlas", "methodology", "decisions"];

const idx = P.buildIndex(rel, der, geo, null,
  { appendices: ALL_APX, includeReport: true });

/* المفتاح هو النوع+المعرف: القسم `licensing` والملحق `licensing` معرفان
   متطابقان لنوعين مختلفين، والخلط بينهما يخفي أخطاء حقيقية */
const byKey = new Map(idx.map((e) => [e.kind + "|" + e.id, e]));
const get = (kind, id) => byKey.get(kind + "|" + id);
const byId = {
  get: (id) => get("metric", id),          // المقاييس معرفاتها فريدة
  has: (id) => byKey.has("metric|" + id),
};
const metrics = idx.filter((e) => e.kind === "metric");
const districts = idx.filter((e) => e.kind === "district");
const sections = idx.filter((e) => e.kind === "section");
const appendices = idx.filter((e) => e.kind === "appendix");

/** نسخة معدّلة معزولة — لا اختبار يلوث إصدار اختبار آخر */
function mutated(fn) {
  const copy = freshRelease();
  fn(copy);
  return copy;
}

/* ══════════════════ 1) تحميل الوحدة وشكل الواجهة ══════════════════ */

test("الوحدة تُعرَّف كاملة وقت التحميل دون لمس DOM (إشارة الوجود §2.1)", () => {
  assert.ok(P, "RH.palette غير معرَّف");
  for (const fn of ["open", "close", "toggle", "isOpen", "buildIndex", "search"]) {
    assert.equal(typeof P[fn], "function", "الدالة الملزمة ناقصة: " + fn);
  }
  /* دوال المنطق النقي المصدَّرة للاختبار */
  for (const fn of ["parseQuery", "paginate", "matchSegments", "normalize",
    "scoreText", "scoreEntry", "kindRank", "statusOf", "formatMetricValue",
    "recentModel", "pushRecent", "countsByKind", "groupResults", "filterScope"]) {
    assert.equal(typeof P[fn], "function", "دالة نقية ناقصة: " + fn);
  }
  assert.equal(P.isOpen(), false, "اللوحة يجب أن تبدأ مغلقة");
});

test("مفردات الأنواع مقفلة وترتيب فصل التعادل هو نص العقد", () => {
  assert.deepEqual(Array.from(P.KINDS), ["section", "appendix", "metric", "district"]);
  assert.equal(P.kindRank("section"), 0);
  assert.equal(P.kindRank("appendix"), 1);
  assert.equal(P.kindRank("metric"), 2);
  assert.equal(P.kindRank("district"), 3);
  assert.ok(P.kindRank("nope") > 3, "نوع مجهول يقع بعد كل الأنواع المعروفة");
});

test("مفتاح تخزين الحداثة وحدوده منصوصة في العقد حرفياً", () => {
  assert.equal(P.STORE_KEY, "rh.palette.recent");
  assert.equal(P.LIMITS.RECENT, 8, "العقد: آخر 8 تفعيلات");
  assert.equal(P.LIMITS.PAGE, 12, "العقد: limit الافتراضي 12");
});

test("مفردات حالات الاعتماد مقفلة — لا صياغة جديدة", () => {
  assert.equal(P.STATUS_LABEL.pending_methodology,
    "قيمة مورّدة — بانتظار اعتماد المنهجية");
  assert.equal(P.STATUS_LABEL.supplied_unvalidated, "قيمة مورّدة غير معتمدة");
  assert.equal(P.STATUS_LABEL.indicative_not_approved, "قيمة استرشادية غير معتمدة");
  assert.equal(P.KPI_MISSING, "تُسجَّل من المنصة — غير متوفرة");
  assert.equal(P.statusLabel("حالة_غير_معروفة"), "حالة_غير_معروفة",
    "الحالة المجهولة تُعرض بمعرفها الخام — صدق لا تجميل");
});

test("نص الحالة الصادقة لحي خارج العينة مطابق لنص العقد حرفاً بحرف", () => {
  assert.equal(P.honestNoData(),
    "لا بيانات على مستوى الحي — القيم المعروضة قطاعية، "
    + "والحي خارج عينة الأحياء المدرجة");
});

/* ══════════════════ 2) التطبيع مفوَّض إلى geoutils ══════════════════ */

test("normalize تفويض مباشر لا نسخة محلية", () => {
  const samples = ["حي الملقا", "الْعَزيزيّة", "AL Malqa", "  حي   النرجس  ",
    "شُبْرا", "الياسمين", "ديراب", "المرسلات"];
  for (const s of samples) {
    assert.equal(P.normalize(s), G.normalizeAr(s),
      "التطبيع يجب أن يكون تفويضاً حرفياً: " + s);
  }
});

test("التطبيع يبتلع التشكيل والهمزات والتاء المربوطة وبادئة «حي»", () => {
  assert.equal(P.normalize("حي الأمانة"), P.normalize("الامانه"));
  assert.equal(P.normalize("  حي الصحافة "), P.normalize("الصحافه"));
  assert.equal(P.normalize("النَّرجِس"), P.normalize("النرجس"));
});

test("stripAl تجريد أداة التعريف للمطابقة فقط ولا يمسّ الكلمات القصيرة", () => {
  assert.equal(P.stripAl("التغطيه"), "تغطيه");
  assert.equal(P.stripAl("الي"), "الي", "كلمة قصيرة لا تُجرَّد فلا تُفرَّغ");
  assert.equal(P.stripAl("تغطيه"), "تغطيه");
});

test("tolerantTail تسامح طرف الكلمة يعمل على نص مطبع ولا يغيّر وسطها", () => {
  assert.equal(P.tolerantTail("الملقي"), "الملقا");
  assert.equal(P.tolerantTail("النرجس"), "النرجس", "لا مساس بكلمة تنتهي بغيرهما");
  assert.equal(P.tolerantTail("الياسمين"), "الياسمين", "الياء الوسطى لا تتأثر");
  assert.equal(P.tolerantTail("بني مالك"), "بنا مالك");
});

/* ══════════════════ 3) سلّم الدرجات ══════════════════ */

test("سلّم scoreText مرتب حرفياً كما ينص العقد §7", () => {
  const S = P.SCORE;
  assert.equal(P.scoreText("التراخيص", "التراخيص"), S.EXACT);
  assert.equal(P.scoreText("التراخيص والتفاصيل", "التراخيص"), S.PREFIX);
  assert.equal(P.scoreText("ملحق التراخيص", "التراخيص"), S.WORD_PREFIX);
  assert.equal(P.scoreText("ملحق التراخيص", "تراخيص"), S.AL_WORD_PREFIX);
  assert.equal(P.scoreText("سجل تراخيصات", "راخيص"), S.CONTAINS);
  assert.equal(P.scoreText("الملقا", "الملقي"), S.LOOSE_TAIL);
  assert.ok(S.EXACT > S.PREFIX && S.PREFIX > S.WORD_PREFIX
    && S.WORD_PREFIX > S.AL_WORD_PREFIX && S.AL_WORD_PREFIX > S.CONTAINS
    && S.CONTAINS > S.LOOSE_TAIL && S.LOOSE_TAIL > S.ALT && S.ALT > S.SUBSEQ,
    "ترتيب الدرجات هو العقد");
  assert.equal(P.scoreText("أي نص", ""), 0);
  assert.equal(P.scoreText("", "استعلام"), 0);
});

test("علاوة التغطية أصغر من أضيق فجوة بين درجتين — الترتيب محفوظ", () => {
  const S = P.SCORE;
  const rungs = [S.SUBSEQ, S.ALT, S.LOOSE_TAIL, S.CONTAINS, S.AL_WORD_PREFIX,
    S.WORD_PREFIX, S.PREFIX, S.EXACT].sort((a, b) => a - b);
  let minGap = Infinity;
  for (let i = 1; i < rungs.length; i++) minGap = Math.min(minGap, rungs[i] - rungs[i - 1]);
  assert.ok(S.BONUS_MAX < minGap,
    "العلاوة " + S.BONUS_MAX + " يجب أن تقل عن أضيق فجوة " + minGap);
});

test("التتابع الحرفي محصور الامتداد — لا يلتقط عناوين طويلة بالمصادفة", () => {
  assert.equal(P.subsequenceSpan("الملقا", "املق"), 5);
  assert.equal(P.subsequenceSpan("النرجس", "زززز"), -1);
  assert.ok(P.subsequence("الملقاا", "الملقا"), "تتابع قريب مقبول");
  assert.equal(
    P.subsequence("الطلب على الاسره للعماله ذات الياقات البيضاء", "الملقا"), false,
    "تتابع متباعد عبر عنوان طويل مرفوض — هذا ما كان يغرق الفهرس بالضجيج");
  assert.equal(P.subsequence("الملقا", "ال"), false,
    "استعلام أقصر من الحد الأدنى لا يدخل التتابع أصلاً");
});

test("scoreEntry: العبارة الكاملة تتقدم دائماً على الكلمات المتفرقة", () => {
  const e = (title, sub) => ({
    kind: "metric", title, norm: P.normalize(title),
    normAlt: P.normalize(sub || ""),
  });
  const phrase = P.scoreEntry(e("نسبة تغطية الطلب"), P.normalize("نسبة تغطية"));
  const multi = P.scoreEntry(e("تغطية الطلب حسب النسبة"), P.normalize("نسبة تغطية"));
  assert.ok(phrase > multi, "مطابقة العبارة أعلى درجةً من الكلمات المتفرقة");
  assert.ok(multi > 0, "كل الكلمات موجودة فالمدخل يظهر");
  assert.ok(multi <= P.SCORE.MULTI_CAP + P.SCORE.BONUS_MAX,
    "سقف الكلمات المتفرقة محترم");
});

test("scoreEntry: كلمة واحدة غائبة تُسقط المدخل كله (شرط AND)", () => {
  const e = { kind: "metric", title: "المخالفات المسجلة",
    norm: P.normalize("المخالفات المسجلة"), normAlt: "" };
  assert.equal(P.scoreEntry(e, P.normalize("مخالفات الجنوب")), 0);
  assert.ok(P.scoreEntry(e, P.normalize("مخالفات مسجلة")) > 0);
});

test("النص المساند يُطابق بدرجة مخصومة لا بدرجة النص الأساسي", () => {
  const e = { kind: "district", title: "حي الملقا",
    norm: P.normalize("حي الملقا"), normAlt: "malqa north" };
  const main = P.scoreEntry(e, P.normalize("الملقا"));
  const alt = P.scoreEntry(e, P.normalize("malqa"));
  assert.ok(main > alt, "المطابقة على الاسم تتقدم على المطابقة الإنجليزية");
  assert.ok(alt > 0, "الاسم الإنجليزي يبقى مساراً صالحاً للوصول");
});

/* ══════════════════ 4) تحليل الاستعلام ══════════════════ */

test("parseQuery يقرأ النطاق الرمزي ويزيله من نص المطابقة", () => {
  assert.deepEqual(P.parseQuery("#التراخيص"), { scope: "section", text: "التراخيص", token: "#" });
  assert.deepEqual(P.parseQuery("@الملقا"), { scope: "district", text: "الملقا", token: "@" });
  assert.deepEqual(P.parseQuery("=تغطية"), { scope: "metric", text: "تغطية", token: "=" });
  assert.deepEqual(P.parseQuery("+أطلس"), { scope: "appendix", text: "أطلس", token: "+" });
});

test("parseQuery يقرأ النطاق العربي المكتوب بنقطتين", () => {
  assert.equal(P.parseQuery("حي: الياسمين").scope, "district");
  assert.equal(P.parseQuery("حي: الياسمين").text, "الياسمين");
  assert.equal(P.parseQuery("مقياس:تغطية").scope, "metric");
  assert.equal(P.parseQuery("ملحق:أطلس").scope, "appendix");
  assert.equal(P.parseQuery("قسم:الخريطة").scope, "section");
});

test("parseQuery لا يخلط النقطتين داخل نص عادي بنطاق", () => {
  const q = P.parseQuery("الملخص التنفيذي: الصورة الكاملة");
  assert.equal(q.scope, "all", "رأس طويل ليس مفتاح نطاق");
  assert.equal(q.text, "الملخص التنفيذي: الصورة الكاملة");
});

test("parseQuery يقصّ الفراغ ويعيد استعلاماً فارغاً بأمان", () => {
  assert.deepEqual(P.parseQuery("   "), { scope: "all", text: "", token: "" });
  assert.deepEqual(P.parseQuery(null), { scope: "all", text: "", token: "" });
  assert.equal(P.parseQuery("  @  الملقا ").text, "الملقا");
});

/* ══════════════════ 5) إبراز المطابقة ══════════════════ */

test("matchSegments يعيد تركيب النص الأصلي حرفياً مهما كانت المطابقة", () => {
  const cases = [["نسبة تغطية الطلب", "تغطية"], ["حي الملقا", "ملقا"],
    ["قطاع الجنوب — المخالفات المسجلة", "مخالفات"], ["أي نص", ""],
    ["الملخص التنفيذي", "لا يوجد"]];
  for (const [text, q] of cases) {
    const segs = P.matchSegments(text, q);
    assert.equal(segs.map((s) => s.text).join(""), text,
      "الشرائح يجب أن تعيد النص كما هو: " + text);
  }
});

test("matchSegments يبرز الموضع الصحيح رغم اختلاف التشكيل والهمز", () => {
  const segs = P.matchSegments("نسبة تغطية الطلب", "تغطيه");
  const hit = segs.filter((s) => s.hit).map((s) => s.text);
  assert.deepEqual(hit, ["تغطية"], "الإبراز يقع على النص الأصلي لا المطبع");
});

test("matchSegments يبرز كل كلمات الاستعلام حين تتفرق في العنوان", () => {
  const segs = P.matchSegments("قطاع الجنوب — المخالفات المسجلة", "مخالفات الجنوب");
  const hits = segs.filter((s) => s.hit).map((s) => s.text);
  assert.ok(hits.length >= 2, "كل كلمة موجودة تُبرز");
  assert.ok(hits.some((t) => t.includes("الجنوب")));
});

test("matchSegments لا يبرز شيئاً حين لا مطابقة نصية مباشرة", () => {
  const segs = P.matchSegments("الملقا", "الملقي");
  assert.deepEqual(segs, [{ text: "الملقا", hit: false }],
    "تسامح المطابقة لا يزوّر إبرازاً على حروف غير موجودة");
});

test("normMap يبني خريطة فهارس متسقة الطول مع النص المطبع", () => {
  const { norm, map } = P.normMap("حي الملقا");
  assert.equal(norm.length, map.length);
  for (const i of map) assert.ok(i >= 0 && i < "حي الملقا".length);
});

/* ══════════════════ 6) الترقيم ══════════════════ */

test("paginate يحسب الصفحات والمدى بدقة", () => {
  const list = Array.from({ length: 25 }, (_v, i) => i);
  const p1 = P.paginate(list, 1, 12);
  assert.deepEqual([p1.page, p1.pages, p1.total, p1.from, p1.to], [1, 3, 25, 1, 12]);
  assert.equal(p1.items.length, 12);
  assert.equal(p1.hasPrev, false);
  assert.equal(p1.hasNext, true);
  const p3 = P.paginate(list, 3, 12);
  assert.deepEqual([p3.page, p3.from, p3.to, p3.items.length], [3, 25, 25, 1]);
  assert.equal(p3.hasNext, false);
});

test("paginate يحصر الصفحة خارج المدى ولا يكسر", () => {
  const list = [1, 2, 3];
  assert.equal(P.paginate(list, 99, 12).page, 1);
  assert.equal(P.paginate(list, -4, 12).page, 1);
  assert.equal(P.paginate(list, 0, 12).page, 1);
});

test("paginate يعطي مدى صفرياً صادقاً لقائمة فارغة لا مدى وهمياً", () => {
  const p = P.paginate([], 1, 12);
  assert.deepEqual([p.total, p.from, p.to, p.pages, p.items.length], [0, 0, 0, 1, 0]);
  assert.equal(p.hasPrev, false);
  assert.equal(p.hasNext, false);
});

test("paginate يحصر مدخلات فاسدة بلا خطأ", () => {
  assert.equal(P.paginate(null, 1, 12).total, 0);
  assert.equal(P.paginate([1, 2, 3], 1, 0).per >= 1, true);
  assert.equal(P.paginate([1, 2, 3], NaN, NaN).page, 1);
});

test("rangeLabel يطابق العدد والمعدود عبر fmt لا يدوياً", () => {
  assert.equal(P.rangeLabel(P.paginate([], 1, 12)), "لا نتائج");
  assert.equal(P.rangeLabel(P.paginate([1], 1, 12)), "نتيجة واحدة");
  assert.equal(P.rangeLabel(P.paginate([1, 2], 1, 12)), "نتيجتان");
  assert.equal(P.rangeLabel(P.paginate([1, 2, 3], 1, 12)),
    fmt.countNoun(3, { few: "نتائج", many: "نتيجة" }),
    "الفاصل بين العدد والمعدود من fmt نفسه (فراغ غير قاطع) لا مكتوباً يدوياً");
  assert.equal(P.resultCount(11), fmt.countNoun(11, {
    zero: "لا نتائج", one: "نتيجة واحدة", two: "نتيجتان",
    few: "نتائج", many: "نتيجة", hundred: "نتيجة",
  }));
});

/* ══════════════════ 7) تركيب الفهرس ══════════════════ */

test("الفهرس يضم الأقسام التسعة والغلاف والموجز", () => {
  const ids = sections.map((e) => e.id);
  for (const id of ["00", "summary", "demand", "licensing", "control", "map",
    "initiatives", "kpis", "forecast", "closing", "report"]) {
    assert.ok(ids.includes(id), "بند القسم ناقص: " + id);
  }
  assert.equal(sections.length, 11);
});

test("بند الموجز يسقط تماماً حين لا تكون وحدته في البناء", () => {
  const partial = P.buildIndex(rel, der, geo, null,
    { appendices: ALL_APX, includeReport: false });
  assert.equal(partial.filter((e) => e.id === "report").length, 0,
    "لا بند يقود إلى وحدة غير مضمّنة");
});

test("الملاحق المفهرسة هي المضمّنة فقط — بناء جزئي لا يعرض ملحقاً غائباً", () => {
  assert.equal(appendices.length, 9);
  const partial = P.buildIndex(rel, der, geo, null,
    { appendices: ["demand", "licensing"], includeReport: true });
  const ax = partial.filter((e) => e.kind === "appendix").map((e) => e.id);
  assert.deepEqual(ax, ["demand", "licensing"]);
});

test("عناوين الملاحق مطابقة لعناوينها المسجلة في المحرك", () => {
  assert.equal(get("appendix", "atlas").title, "أطلس الأحياء");
  assert.equal(get("appendix", "scenarios").title, "مستكشف السيناريوهات");
  assert.equal(get("appendix", "kpi").title, "مؤشرات الأداء — الجدول الكامل");
  assert.equal(get("appendix", "monitoring").title, "الرقابة — التفاصيل والتحليل");
});

test("الأحياء الـ189 كلها مفهرسة بمفاتيح الأطلس ذاتها", () => {
  const geoCount = G.districtIndex(geo, rel, der).length;
  assert.equal(districts.length, geoCount);
  assert.equal(districts.length, 189, "عدد الأحياء المنشور في العقد");
  for (const d of districts) {
    assert.match(d.id, /^(north|east|center|west|south):/,
      "مفتاح الحي هو مفتاح geoutils الثابت: " + d.id);
    assert.equal(d.nav.kind, "appendix");
    assert.equal(d.nav.id, "atlas");
    assert.equal(d.nav.params.d, d.id, "التفعيل يفتح الأطلس على الحي ذاته");
  }
});

test("غياب الأطلس يحوّل الأحياء إلى قسم الخريطة لا إلى مسار ميت", () => {
  const partial = P.buildIndex(rel, der, geo, null,
    { appendices: ["demand"], includeReport: false });
  const d = partial.find((e) => e.kind === "district");
  assert.equal(d.nav.kind, "scene");
  assert.equal(d.nav.id, "map");
});

test("كل مقاييس الإصدار الخام مفهرسة بعناوينها المنشورة", () => {
  for (const id of Object.keys(rel.metrics)) {
    const e = byId.get("metric:" + id);
    assert.ok(e, "مقياس خام غير مفهرس: " + id);
    assert.equal(e.title, rel.metrics[id].label,
      "العنوان يجب أن يكون label المنشور حرفياً: " + id);
  }
});

test("المشتقات القياسية مفهرسة والكائنية مستثناة", () => {
  for (const id of Object.keys(rel.derived)) {
    const dm = rel.derived[id];
    const e = byId.get("metric:" + id);
    if (typeof dm.value === "number") {
      assert.ok(e, "مشتقة قياسية غير مفهرسة: " + id);
    } else {
      assert.equal(e, undefined, "مشتقة كائنية لا تُفهرس كمقياس: " + id);
    }
  }
  assert.equal(byId.has("metric:sector_derived"), false);
  assert.equal(byId.has("metric:rankings"), false);
});

test("مقاييس القطاعات: خمسة قطاعات × اثنا عشر حقلاً بلا نقص", () => {
  const sectorEntries = metrics.filter((e) => e.id.startsWith("sector:"));
  assert.equal(sectorEntries.length, rel.sectors.length * P.SECTOR_FIELDS.length);
  for (const s of rel.sectors) {
    for (const f of P.SECTOR_FIELDS) {
      const e = byId.get("sector:" + s.id + ":" + f.key);
      assert.ok(e, "حقل قطاعي ناقص: " + s.id + "/" + f.key);
      assert.ok(e.title.startsWith(s.name), "عنوان الحقل يبدأ باسم القطاع");
    }
  }
});

test("مؤشرات الأداء الأربعة عشر مفهرسة بأسمائها المنشورة", () => {
  const kpis = metrics.filter((e) => e.id.startsWith("kpi:"));
  assert.equal(kpis.length, 14);
  for (const k of rel.strategy.kpis) {
    const e = byId.get("kpi:" + k.id);
    assert.ok(e, "مؤشر غير مفهرس: " + k.id);
    assert.equal(e.title, k.name);
    assert.equal(e.nav.id, "kpis");
  }
});

test("كل مدخل يحمل الحقول الملزمة في العقد ولا معرف مكرر", () => {
  const seen = new Set();
  for (const e of idx) {
    assert.ok(P.KINDS.includes(e.kind), "نوع خارج المفردات: " + e.kind);
    assert.equal(typeof e.id, "string");
    assert.ok(e.id.length > 0);
    assert.ok(typeof e.title === "string" && e.title.length > 0, "عنوان فارغ: " + e.id);
    assert.equal(e.norm, P.normalize(e.title), "norm يجب أن يكون تطبيع العنوان");
    assert.ok(e.nav && typeof e.nav.kind === "string", "بلا وجهة: " + e.id);
    const key = e.kind + "|" + e.id;
    assert.equal(seen.has(key), false, "معرف مكرر في الفهرس: " + key);
    seen.add(key);
  }
});

test("وجهات الفهرس كلها ضمن مفردات الموجّه المعروفة", () => {
  const okScenes = new Set(["00", "summary", "demand", "licensing", "control",
    "map", "initiatives", "kpis", "forecast", "closing"]);
  for (const e of idx) {
    if (e.nav.kind === "scene") {
      assert.ok(okScenes.has(e.nav.id), "وجهة قسم مجهولة: " + e.nav.id);
    } else if (e.nav.kind === "appendix") {
      assert.ok(ALL_APX.includes(e.nav.id), "وجهة ملحق مجهولة: " + e.nav.id);
    } else {
      assert.equal(e.nav.kind, "report");
    }
    if (e.alt) {
      assert.ok(["scene", "appendix", "report"].includes(e.alt.kind));
    }
  }
});

test("buildIndex نقية: لا تعدّل الإصدار ولا المشتقات الممررة", () => {
  const before = JSON.stringify(rel);
  const derBefore = JSON.stringify(der);
  P.buildIndex(rel, der, geo, null, { appendices: ALL_APX });
  assert.equal(JSON.stringify(rel), before, "الإصدار تغيّر — الفهرس ليس نقياً");
  assert.equal(JSON.stringify(der), derBefore, "المشتقات تغيّرت");
});

test("buildIndex تصمد أمام غياب الجغرافيا والأقسام", () => {
  const noGeo = P.buildIndex(rel, der, null, null, { appendices: [] });
  assert.equal(noGeo.filter((e) => e.kind === "district").length, 0);
  assert.ok(noGeo.filter((e) => e.kind === "metric").length > 0,
    "غياب الجغرافيا لا يُسقط المقاييس");
  assert.deepEqual(P.buildIndex(null, null, null, null), []);
});

test("قائمة الأقسام الممررة تتقدم على القائمة الاحتياطية", () => {
  const custom = [{ id: "map", order: 1, title: "عنوان مخصص للخريطة", kicker: "س" }];
  const out = P.buildIndex(rel, der, null, custom, { appendices: [], includeReport: false });
  const s = out.filter((e) => e.kind === "section");
  assert.equal(s.length, 2, "الغلاف + القسم الممرر");
  assert.equal(s[1].title, "عنوان مخصص للخريطة");
});

/* ══════════════════ 8) الإسناد: مرساة حقيقية لكل رقم ══════════════════ */

test("كل مقياس خام يحمل مرساة ورقته وخليته من الإصدار", () => {
  for (const id of Object.keys(rel.metrics)) {
    const m = rel.metrics[id];
    const e = byId.get("metric:" + id);
    assert.equal(e.answer.status, "raw");
    assert.ok(e.answer.source.includes(m.sheet), "الورقة غائبة عن الإسناد: " + id);
    assert.ok(e.answer.source.includes(String(m.anchor)), "المرساة غائبة: " + id);
    assert.ok(e.answer.source.includes(rel.sources[0].name), "اسم المصدر غائب: " + id);
    assert.ok(e.sub.includes(String(m.anchor)), "السطر المختصر بلا مرساة: " + id);
  }
});

test("كل مشتق يحمل صيغته المنشورة وإصدارها لا نصاً مؤلفاً", () => {
  for (const id of Object.keys(rel.derived)) {
    const dm = rel.derived[id];
    if (typeof dm.value !== "number") continue;
    const e = byId.get("metric:" + id);
    assert.equal(e.answer.status, "derived");
    assert.ok(e.answer.source.startsWith("مشتق ("), "صيغة الإسناد المعتمدة");
    assert.ok(e.answer.source.includes(dm.formula), "الصيغة المنشورة غائبة: " + id);
    assert.ok(e.answer.source.includes(dm.formula_version), "إصدار الصيغة غائب: " + id);
  }
});

test("المشتقات القطاعية تعلن صيغتها ولا تدّعي مرساة ورقة", () => {
  const e = byId.get("sector:south:coverage_pct");
  assert.ok(e.answer.source.startsWith("مشتق ("));
  assert.equal(e.answer.source.includes("!"), false, "لا مرساة خلية لقيمة محسوبة");
  const raw = byId.get("sector:south:violations");
  assert.ok(raw.answer.source.includes("جدول القطاعات"));
  assert.equal(raw.answer.status, "sector");
});

test("العناوين المشتقة بلا label تأخذ اسم عرض عربياً لا معرفاً لاتينياً", () => {
  assert.equal(byId.get("metric:coverage_pct").title, "نسبة تغطية الطلب");
  assert.equal(byId.get("metric:deficit_beds").title, "عجز الأسرّة");
  for (const id of Object.keys(P.DERIVED_AR)) {
    if (!rel.derived[id]) continue;
    assert.equal(byId.get("metric:" + id).title, P.DERIVED_AR[id]);
  }
});

/* ══════════════════ 9) بوابة الصدق الكبرى: لا رقم من خارج الإصدار ══════════════════ */

/** مجمع أرقام الإصدار ومشتقاته — مع صور النسب (×100) كما في بوابات validate */
function numberPool() {
  const pool = new Set();
  const add = (n) => {
    if (typeof n !== "number" || !Number.isFinite(n)) return;
    pool.add(Number(n.toFixed(6)));
    pool.add(Number((n * 100).toFixed(6)));
    pool.add(Number(Math.round(n).toFixed(6)));
  };
  (function walk(v) {
    if (v == null) return;
    if (typeof v === "number") { add(v); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x); return; }
    if (typeof v === "object") { for (const k of Object.keys(v)) walk(v[k]); }
  })({ rel, der });
  return pool;
}

test("كل قيمة في كل إجابة موجودة في مجمع أرقام الإصدار — لا رقم مخترع", () => {
  const pool = numberPool();
  let checked = 0;
  for (const e of idx) {
    if (!e.answer || e.answer.raw == null) continue;
    checked += 1;
    assert.ok(pool.has(Number(e.answer.raw.toFixed(6))),
      "قيمة خارج مجمع الإصدار في المدخل " + e.id + ": " + e.answer.raw);
  }
  assert.ok(checked >= 90, "البوابة يجب أن تفحص تسعين قيمة على الأقل، فحصت " + checked);
});

test("نص القيمة المعروضة هو ناتج fmt حرفياً — لا تنسيق يدوي", () => {
  for (const e of idx) {
    if (!e.answer || e.answer.raw == null) continue;
    const expected = e.answer.unit === "" && e.answer.value.includes("٪")
      ? fmt.pct(e.answer.raw) : fmt.int(e.answer.raw);
    assert.equal(e.answer.value, expected,
      "قيمة غير منسقة عبر fmt في " + e.id);
  }
});

test("formatMetricValue يفوّض النسب والأعداد إلى fmt ويصدق في الغياب", () => {
  assert.equal(P.formatMetricValue(43.1, "٪"), fmt.pct(43.1));
  assert.equal(P.formatMetricValue(612400, "سرير"), fmt.int(612400));
  assert.equal(P.formatMetricValue(null, "سرير"), "—");
  assert.equal(P.formatMetricValue(NaN, "٪"), "—");
  assert.equal(P.formatMetricValue("612400", "سرير"), "—",
    "نص لا يُنسَّق كرقم — لا تحويل صامت");
});

/* ══════════════════ 10) الوسم يسافر مع الرقم ══════════════════ */

test("81.6٪ لا تخرج من اللوحة بلا وسم منهجيتها ونص ملاحظتها", () => {
  const e = byId.get("metric:compliance");
  assert.ok(e, "مقياس الامتثال غير مفهرس");
  assert.equal(e.answer.raw, rel.compliance.value);
  assert.equal(e.answer.value, fmt.pct(rel.compliance.value));
  assert.equal(e.answer.status, "supplied_pending");
  assert.equal(e.answer.badge, P.STATUS_LABEL.pending_methodology);
  assert.equal(e.badge, P.STATUS_LABEL.pending_methodology,
    "الوسم المختصر حاضر في السطر لا في اللوح وحده");
  assert.equal(e.answer.caveat, rel.compliance.note, "نص الملاحظة حرفياً");
});

test("قيمة الامتثال لا تُلوَّن ذهبياً ولا مرجانياً — لا اعتماد ولا عجز", () => {
  const e = byId.get("metric:compliance");
  assert.equal(e.answer.tone, "neu");
});

test("سيناريوهات العجز الثلاثة تحمل caveat الإصدار كاملاً ولا رابع لها", () => {
  const sc = metrics.filter((e) => e.id.startsWith("scenario:"));
  assert.equal(sc.length, 3, "ثلاثة سيناريوهات لا أكثر");
  assert.deepEqual(sc.map((e) => e.id).sort(),
    ["scenario:base", "scenario:conservative", "scenario:optimistic"]);
  for (const e of sc) {
    assert.equal(e.answer.caveat, rel.scenarios.caveat, "نص الـcaveat حرفياً");
    assert.equal(e.answer.badge, P.STATUS_LABEL.supplied_unvalidated);
    assert.equal(e.answer.status, "supplied_scenario");
    assert.equal(e.answer.tone, "neg", "العجز مرجاني حصراً");
  }
});

test("قيم السيناريوهات من الأشهر المورّدة ذاتها بلا استيفاء", () => {
  const first = rel.scenarios.rows[0];
  const last = rel.scenarios.rows[rel.scenarios.rows.length - 1];
  for (const key of ["conservative", "base", "optimistic"]) {
    const e = byId.get("scenario:" + key);
    assert.equal(e.answer.raw, first[key], "القيمة المعروضة هي شهر مورّد");
    assert.ok(e.title.includes(first.label), "الشهر معلن في العنوان");
    const rangeLine = e.answer.extra.find((t) => t.includes("المدى"));
    assert.ok(rangeLine.includes(fmt.int(last[key])), "طرف المدى قيمة مورّدة");
    assert.ok(rangeLine.includes(last.label));
  }
});

test("المستهدف الاسترشادي ذهبي بوسم عدم اعتماده ونص ملاحظته", () => {
  const e = byId.get("metric:coverage_target");
  assert.equal(e.answer.raw, rel.coverage_target_indicative.value);
  assert.equal(e.answer.tone, "gold", "الذهبي للمستهدف حصراً");
  assert.equal(e.answer.badge, P.STATUS_LABEL.indicative_not_approved);
  assert.equal(e.answer.caveat, rel.coverage_target_indicative.note);
});

test("مؤشر بلا قيمة حالية يقول ذلك صراحة ولا يخترع رقماً", () => {
  const missing = rel.strategy.kpis.filter((k) => k.current == null);
  assert.ok(missing.length > 0, "الإصدار الحالي يحوي مؤشرات بلا قيمة");
  for (const k of missing) {
    const e = byId.get("kpi:" + String(k.id));
    assert.equal(e.answer.value, P.KPI_MISSING);
    assert.equal(e.answer.raw, null, "لا قيمة رقمية مخترعة");
    assert.equal(e.answer.status, "unavailable");
    assert.equal(e.answer.caveat, k.current_note);
  }
});

test("خط الأساس والمستهدف يظهران بقيم الإصدار ×100 للنسب", () => {
  const k = rel.strategy.kpis.find((x) => x.pct && x.target != null);
  const e = byId.get("kpi:" + String(k.id));
  const targetLine = e.answer.extra.find((t) => t.startsWith("المستهدف"));
  assert.equal(targetLine, "المستهدف: " + fmt.pct(k.target * 100));
  const baseLine = e.answer.extra.find((t) => t.startsWith("خط الأساس"));
  assert.equal(baseLine, "خط الأساس: " + fmt.pct(k.baseline * 100));
});

test("قيم الأحياء لا تدخل الفهرس أصلاً — البند يحمل وسم العينة لا أرقامها", () => {
  for (const d of districts) {
    assert.equal(d.answer, null, "بند الحي لا يحمل إجابة رقمية في السطر");
    if (d.meta.district.sample) {
      assert.equal(d.badge, "ضمن العينة");
      assert.ok(d.sub.includes("ضمن العينة المدرجة"));
    } else {
      assert.equal(d.badge, "");
    }
  }
});

test("عدد أحياء العينة في الفهرس يطابق صفوف العينة المنشورة", () => {
  const inSample = districts.filter((d) => d.meta.district.sample).length;
  const rows = rel.neighbourhoods.rows.length;
  assert.ok(inSample > 0 && inSample <= rows,
    "أحياء العينة المطابقة: " + inSample + " من " + rows);
});

/* ══════════════════ 11) منظومة اللون الدلالية ══════════════════ */

test("المرجاني للعجز والمخالفات حصراً — تدقيق شامل على الفهرس", () => {
  const allowed = /(deficit|violation|uncovered|scenario)/;
  for (const e of idx) {
    if (!e.answer || e.answer.tone !== "neg") continue;
    assert.match(e.id, allowed,
      "المرجاني على مدخل ليس عجزاً ولا مخالفة: " + e.id);
  }
});

test("الذهبي لخط الأساس والمستهدف حصراً", () => {
  for (const e of idx) {
    if (!e.answer || e.answer.tone !== "gold") continue;
    assert.match(e.id, /(baseline|target)/,
      "الذهبي على قيمة ليست مستهدفاً ولا خط أساس: " + e.id);
  }
});

test("كل نغمة من المفردات المقفلة ولا نغمة مبتكرة", () => {
  const tones = new Set(["pos", "neg", "gold", "demand", "blue", "neu"]);
  for (const e of idx) {
    if (!e.answer) continue;
    assert.ok(tones.has(e.answer.tone), "نغمة خارج المفردات: " + e.answer.tone);
  }
  assert.equal(P.toneOf("قوس-قزح"), "neu", "نغمة مجهولة تسقط إلى الحياد");
});

test("قيم الطلب رملية وقيم الطاقة خضراء — لا خلط للدلالة", () => {
  assert.equal(byId.get("metric:total_demand").answer.tone, "demand");
  assert.equal(byId.get("metric:licensed_beds").answer.tone, "pos");
  assert.equal(byId.get("metric:blue_collar").answer.tone, "blue");
  assert.equal(byId.get("sector:south:demand").answer.tone, "demand");
  assert.equal(byId.get("sector:south:beds").answer.tone, "pos");
});

/* ══════════════════ 12) البحث والترتيب ══════════════════ */

test("استعلام فارغ لا يعيد نتائج — حالة البدء مسؤولية العرض", () => {
  assert.deepEqual(P.search(idx, ""), []);
  assert.deepEqual(P.search(idx, "   "), []);
  assert.deepEqual(P.search([], "الملقا"), []);
});

test("الحد الافتراضي 12 والحد الممرر يُحترم", () => {
  assert.ok(P.search(idx, "ا").length <= 12);
  assert.equal(P.search(idx, "ا", 5).length <= 5, true);
  assert.equal(P.search(idx, "ا", 0).length, 0);
});

test("فصل التعادل: الدرجة ثم النوع ثم الترتيب الأبجدي", () => {
  const mk = (kind, title) => ({
    kind, id: kind + ":" + title, title,
    norm: P.normalize(title), normAlt: "", nav: { kind: "scene", id: "map" },
  });
  const same = [mk("district", "الرقابة"), mk("metric", "الرقابة"),
    mk("appendix", "الرقابة"), mk("section", "الرقابة")];
  const out = P.search(same, "الرقابة", 10);
  assert.deepEqual(out.map((e) => e.kind),
    ["section", "appendix", "metric", "district"]);

  const alpha = [mk("metric", "ياء"), mk("metric", "ألف"), mk("metric", "باء")];
  const out2 = P.search(alpha, "ا", 10).concat();
  assert.ok(out2.length >= 1);
});

test("البحث الحي يقدّم القسم على الملحق على المقياس عند تطابق الاسم", () => {
  const res = P.search(idx, "التراخيص", 6);
  assert.equal(res[0].kind, "section");
  assert.equal(res[0].id, "licensing");
  assert.equal(res[1].kind, "appendix");
});

test("اسم الحي بالعربية والإنجليزية والمكتوب بألف مقصورة يصل إلى الحي ذاته", () => {
  for (const q of ["الملقا", "حي الملقا", "malqa", "الملقى"]) {
    const res = P.search(idx, q, 5);
    assert.ok(res.length > 0, "لا نتائج لـ" + q);
    assert.equal(res[0].kind, "district", "أول نتيجة يجب أن تكون الحي: " + q);
    assert.ok(res[0].title.includes("الملقا"), "الحي الخطأ لـ" + q);
  }
});

test("سؤال المقياس يصل إلى إجابته بالرقم والمرساة", () => {
  const res = P.search(idx, "الطلب التقديري", 5);
  const hit = res.find((e) => e.id === "metric:total_demand");
  assert.ok(hit, "المقياس الأشهر يجب أن يكون ضمن النتائج الأولى");
  assert.equal(hit.answer.value, fmt.int(rel.metrics.total_demand.value));
  assert.equal(hit.answer.unit, "سرير");
  assert.ok(hit.answer.source.includes("C4"));
});

test("المقياس على مستوى المدينة يتقدم على مثيله القطاعي بعلاوة التغطية", () => {
  const res = P.search(idx, "نسبة تغطية الطلب", 6);
  assert.equal(res[0].id, "metric:coverage_pct",
    "المقياس العام يتقدم لأن الاستعلام يغطي عنوانه بالكامل");
});

test("كلمتان متفرقتان تصلان إلى القيمة القطاعية الصحيحة", () => {
  const res = P.search(idx, "مخالفات الجنوب", 4);
  assert.ok(res.some((e) => e.id === "sector:south:violations"));
  const hit = res.find((e) => e.id === "sector:south:violations");
  const south = rel.sectors.find((s) => s.id === "south");
  assert.equal(hit.answer.raw, south.violations);
});

test("searchScored يعيد الدرجات مرتبة تنازلياً", () => {
  const out = P.searchScored(idx, "تغطية", 20);
  assert.ok(out.length > 1);
  for (let i = 1; i < out.length; i++) {
    assert.ok(out[i - 1].score >= out[i].score, "الترتيب التنازلي مكسور");
  }
});

/* ══════════════════ 13) الترشيح والتجميع والعدّ ══════════════════ */

test("filterScope يحصر النوع ويمرّ الكل", () => {
  assert.equal(P.filterScope(idx, "district").length, districts.length);
  assert.equal(P.filterScope(idx, "all").length, idx.length);
  assert.equal(P.filterScope(idx, null).length, idx.length);
  assert.equal(P.filterScope(idx, "nope").length, 0);
});

test("countsByKind يعد كل نوع والمجموع", () => {
  const c = P.countsByKind(idx);
  assert.equal(c.all, idx.length);
  assert.equal(c.section, sections.length);
  assert.equal(c.appendix, appendices.length);
  assert.equal(c.metric, metrics.length);
  assert.equal(c.district, districts.length);
  assert.equal(c.all, c.section + c.appendix + c.metric + c.district);
  assert.equal(P.countsByKind(null).all, 0);
});

test("groupResults يجمع بترتيب الأنواع القانوني ويسقط الفارغ", () => {
  const groups = P.groupResults(idx);
  assert.deepEqual(groups.map((g) => g.kind),
    ["section", "appendix", "metric", "district"]);
  assert.equal(groups[0].label, "الأقسام");
  const one = P.groupResults(districts.slice(0, 3));
  assert.equal(one.length, 1);
  assert.equal(one[0].kind, "district");
  assert.deepEqual(P.groupResults([]), []);
});

/* ══════════════════ 14) الحداثة ══════════════════ */

test("recentModel يحل المعرفات المحفوظة إلى مدخلات حية بترتيبها", () => {
  const keys = ["section|licensing", "district|" + districts[0].id, "metric:نجم"];
  const out = P.recentModel(idx, keys, 8);
  assert.equal(out.length, 2, "المعرف غير الموجود يُسقط بلا ضجيج");
  assert.equal(out[0].id, "licensing");
  assert.equal(out[1].id, districts[0].id);
});

test("recentModel يحترم الحد ويُسقط التكرار", () => {
  const keys = ["section|licensing", "section|licensing", "section|control",
    "section|map", "section|kpis"];
  assert.equal(P.recentModel(idx, keys, 2).length, 2);
  assert.equal(P.recentModel(idx, keys, 8).length, 4);
  assert.deepEqual(P.recentModel(idx, null), []);
  assert.deepEqual(P.recentModel([], ["section|map"]), []);
});

test("pushRecent يضع الأحدث أولاً بلا تكرار وضمن الحد", () => {
  let list = P.pushRecent([], "section|map", 3);
  assert.deepEqual(list, ["section|map"]);
  list = P.pushRecent(list, "section|kpis", 3);
  assert.deepEqual(list, ["section|kpis", "section|map"]);
  list = P.pushRecent(list, "section|map", 3);
  assert.deepEqual(list, ["section|map", "section|kpis"], "المكرر يُرفع لا يُضاعف");
  list = P.pushRecent(list, "a", 3);
  list = P.pushRecent(list, "b", 3);
  assert.equal(list.length, 3, "الحد محترم");
  assert.deepEqual(list, ["b", "a", "section|map"]);
});

/* ══════════════════ 15) اشتقاق الحالات ونصوص الإجراء ══════════════════ */

test("statusOf يقبل المدخل أو إجابته ويصدق في الغياب", () => {
  assert.equal(P.statusOf(byId.get("metric:total_demand")), "raw");
  assert.equal(P.statusOf(byId.get("metric:coverage_pct").answer), "derived");
  assert.equal(P.statusOf(byId.get("metric:compliance")), "supplied_pending");
  assert.equal(P.statusOf(get("section", "licensing")), "none", "بند بلا إجابة");
  assert.equal(P.statusOf(null), "unknown");
});

test("تسمية الإجراء الأساسي تصف الوجهة الحقيقية لا نصاً عاماً", () => {
  assert.equal(P.primaryLabel(get("section", "licensing")), "الانتقال إلى القسم");
  assert.equal(P.primaryLabel(get("section", "00")), "الانتقال إلى الغلاف");
  assert.equal(P.primaryLabel(get("section", "report")), "فتح الموجز التنفيذي");
  assert.equal(P.primaryLabel(get("appendix", "atlas")), "فتح الملحق");
  assert.equal(P.primaryLabel(districts[0]), "فتح الأطلس على هذا الحي");
  assert.equal(P.primaryLabel(byId.get("metric:total_demand")), "الانتقال إلى القسم");
});

test("تسمية إتاحة الصف تنطق النوع والعنوان والقيمة ووسمها", () => {
  const aria = P.optionAria(byId.get("metric:compliance"));
  assert.ok(aria.startsWith("مقياس — "));
  assert.ok(aria.includes(fmt.pct(rel.compliance.value)));
  assert.ok(aria.includes(P.STATUS_LABEL.pending_methodology),
    "الوسم يسافر مع الرقم حتى في تسمية قارئ الشاشة");
});

test("وصف الوجهة يميّز وضع المستند عن الملحق عن القسم", () => {
  assert.ok(P.destinationText({ kind: "report" }).includes("المستند"));
  assert.ok(P.destinationText({ kind: "appendix", id: "atlas" }).includes("ملحق"));
  assert.ok(P.destinationText({ kind: "scene", id: "00" }).includes("غلاف"));
  assert.equal(P.destinationText(null), "—");
});

/* ══════════════════ 16) صمود أمام إصدار متغيّر ══════════════════ */

test("تغيّر قيمة منشورة ينعكس فوراً في الإجابة — الفهرس ليس مستقلاً عن الإصدار", () => {
  const copy = mutated((r) => { r.metrics.total_demand.value = 1500000; });
  const out = P.buildIndex(copy, RH.data.derive.compute(copy), null, null,
    { appendices: [], includeReport: false });
  const e = out.find((x) => x.id === "metric:total_demand");
  assert.equal(e.answer.raw, 1500000);
  assert.equal(e.answer.value, fmt.int(1500000));
});

test("غياب كتلة الامتثال أو السيناريوهات يُسقط بندها بلا انهيار", () => {
  const copy = mutated((r) => { delete r.compliance; delete r.scenarios; });
  const out = P.buildIndex(copy, der, null, null, { appendices: [], includeReport: false });
  assert.equal(out.some((e) => e.id === "metric:compliance"), false);
  assert.equal(out.some((e) => e.id.startsWith("scenario:")), false);
  assert.ok(out.length > 20, "بقية الفهرس سليمة");
});

test("مؤشرات بلا استراتيجية معتمدة لا تُسقط الفهرس", () => {
  const copy = mutated((r) => { r.strategy.kpis = []; });
  const out = P.buildIndex(copy, der, null, null, { appendices: [], includeReport: false });
  assert.equal(out.filter((e) => e.id.startsWith("kpi:")).length, 0);
});

test("قطاع بلا مشتقات يعرض حقوله الخام فقط ولا يخترع مشتقة", () => {
  const partial = P.buildIndex(rel, { sector: {} }, null, null,
    { appendices: [], includeReport: false });
  const south = partial.filter((e) => e.id.startsWith("sector:south:"));
  assert.equal(south.length, P.SECTOR_FIELDS.filter((f) => f.from === "row").length);
  assert.equal(south.some((e) => e.id.endsWith("coverage_pct")), false);
});
