/* notes-data.test.mjs — جدول ملاحظات المتحدث ونموذج الجولة الموجهة
   ═══════════════════════════════════════════════════════════════════════════
   عقد V2_CONTRACTS_EXPANSION §6. ما يُثبَت هنا هو ما يمنع الانحراف الذي يرفضه
   المدقق البشري، وما لا يجوز أن ينكسر بتعديل عرضي لاحق:

   • **لا رقم مختلق في نص منطوق**: كل رقم في كل سطر من جدول الملاحظات (سطر
     الافتتاح، النقاط، العبور، السؤال، الوسوم، الأسئلة المتوقعة وإجاباتها)
     موجود إما حرفياً في نص لوحة رؤى/رؤية معتمدة أو وسم منشور، وإما قيمةً
     منشورة في الإصدار بأحد تنسيقات RH.core.fmt القانونية. البوابة تُشغَّل على
     الإصدار الحقيقي لا على نسخة، وتقريرها يُطبع كاملاً عند الفشل.

   • **تغطية التسلسل الحي**: معرفات الملاحظات = الغلاف + الأقسام التسعة كما
     يعرّفها سجل الأقسام نفسه (تُستخرج من registry.js ومن ترتيب order في ملفات
     الأقسام، لا من قائمة منسوخة في الاختبار) — بلا نقص ولا زيادة.

   • **بوابة التدقيق تكشف فعلاً**: حقن رقم غريب في نسخة معزولة يجعل audit يسقط
     ويسمّي الرقم والقسم والحقل — فالبوابة ليست تزييناً.

   • **نموذج الجولة نقي وصحيح**: ترجمة المفاتيح (RTL)، حصر الفهارس بلا لفّ
     دائري، بناء الخطوات من التسلسل الحي، التقدم والساعة والإيقاع، ومنظومة
     اللون (لا نغمة مرجانية ولا ذهبية في مؤشر إيقاع البروفة).

   • **أهداف الإبراز عناصر حقيقية**: كل قسم له أهداف، ولكل هدف طريقة عثور،
     وعناوين البطاقات المطلوبة موجودة نصياً في ملف القسم المعني — فلا يشير
     الضوء الكاشف إلى عنصر غير موجود.

   الوحدتان تُحمَّلان بملفيهما الحقيقيين: `load-app.mjs` (ملف المعمار — لم
   يُعدَّل) يبني RH كاملة في سياق vm، ثم يُنفَّذ notes-data.js ثم tour.js على
   RH ذاتها. tour.js يكتشف غياب DOM حقيقي (CAN_DOM) فيعرّف نموذجه ولا يبني
   شيئاً — وهو بالضبط ما يوجبه عقد قابلية الاختبار §0. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RH, ROOT, freshRelease } from "./load-app.mjs";

/* ── تنفيذ ملفي الميزة على RH الحقيقية (بترتيب build.py: الجدول ثم الجولة) ── */
const NOTES_SRC = path.join(ROOT, "src", "js", "presenter", "notes-data.js");
const TOUR_SRC = path.join(ROOT, "src", "js", "presenter", "tour.js");
new Function("RH", readFileSync(NOTES_SRC, "utf8"))(RH);
new Function("RH", readFileSync(TOUR_SRC, "utf8"))(RH);

const N = RH.presenter.notesData;
const T = RH.tour;
const M = RH.tour.model;
const fmt = RH.core.fmt;

const rel = freshRelease();
const der = RH.data.derive.compute(rel);

/* ══════════════════════════════════════════════════════════════════════════
   الحقيقة المرجعية للتسلسل: تُستخرج من سجل الأقسام وملفات الأقسام ذاتها
   ══════════════════════════════════════════════════════════════════════════ */

/** قائمة المعرفات القانونية كما يعلنها registry.js حرفياً */
function registryValidIds() {
  const src = readFileSync(
    path.join(ROOT, "src", "js", "presenter", "sections", "registry.js"), "utf8");
  const m = /const VALID_IDS = \[([\s\S]*?)\];/.exec(src);
  assert.ok(m, "تعذر استخراج VALID_IDS من registry.js");
  return Array.from(m[1].matchAll(/"([^"]+)"/g)).map((x) => x[1]);
}

/** ترتيب الأقسام الحقيقي من استدعاءات RH.sections.register في ملفات الأقسام */
function registeredSections() {
  const dir = path.join(ROOT, "src", "js", "presenter", "sections");
  const files = ["s01-summary", "s02-demand", "s03-licensing", "s04-control",
    "s05-map", "s06-initiatives", "s07-kpis", "s08-forecast", "s09-closing"];
  const out = [];
  for (const f of files) {
    const src = readFileSync(path.join(dir, f + ".js"), "utf8");
    const m = /RH\.sections\.register\(\{\s*id:\s*"([^"]+)",\s*order:\s*(\d+),\s*title:\s*"([^"]+)"/
      .exec(src);
    assert.ok(m, "تعذر استخراج تسجيل القسم من " + f);
    out.push({ id: m[1], order: parseInt(m[2], 10), title: m[3], file: f });
  }
  out.sort((a, b) => a.order - b.order);
  return out;
}

const VALID_IDS = registryValidIds();
const REGISTERED = registeredSections();
/** التسلسل الخطي كما يبنيه rebuildLinear: الغلاف ثم الأقسام بترتيب order */
const LINEAR = ["00"].concat(REGISTERED.map((s) => s.id));

/* ══════════════════════════════════════════════════════════════════════════
   1) شكل الوحدة وتغطيتها
   ══════════════════════════════════════════════════════════════════════════ */

test("الوحدة تُعرَّف على RH.presenter دون لمس DOM", () => {
  assert.ok(N, "RH.presenter.notesData غير معرَّف");
  assert.equal(N.version, "1");
  assert.equal(typeof N.sections, "object");
  assert.equal(typeof N.audit, "function");
  assert.equal(typeof N.factPool, "function");
});

test("سجل الأقسام وملفاته متسقان: VALID_IDS = ترتيب order", () => {
  assert.deepEqual(REGISTERED.map((s) => s.id), VALID_IDS,
    "ترتيب order في ملفات الأقسام يخالف القائمة القانونية في السجل");
  assert.deepEqual(REGISTERED.map((s) => s.order), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("جدول الملاحظات يغطي التسلسل الحي كاملاً بلا نقص ولا زيادة", () => {
  assert.deepEqual(N.SECTION_ORDER, LINEAR,
    "SECTION_ORDER يخالف التسلسل المبني من السجل");
  const cov = N.coverage(LINEAR);
  assert.equal(cov.complete, true, "أقسام بلا ملاحظات: " + cov.missing.join("، "));
  assert.equal(cov.total, 10);
  assert.equal(cov.covered.length, 10);
  assert.equal(cov.pct, 100);
  assert.deepEqual(N.ids().sort(), LINEAR.slice().sort());
});

test("كل مدخل يحترم شكل العقد: 3..6 نقاط وحقول إلزامية حاضرة", () => {
  for (const id of LINEAR) {
    const note = N.forSection(id);
    assert.ok(note, "لا ملاحظات للقسم " + id);
    assert.equal(typeof note.headline, "string");
    assert.ok(note.headline.trim().length > 10, id + ": سطر افتتاح قصير");
    assert.ok(Array.isArray(note.points), id + ": points ليست مصفوفة");
    assert.ok(note.points.length >= 3 && note.points.length <= 6,
      id + ": عدد النقاط " + note.points.length + " خارج المدى 3..6");
    for (const p of note.points) {
      assert.equal(typeof p, "string");
      assert.ok(p.trim().length > 20, id + ": نقطة قصيرة جداً");
    }
    assert.equal(typeof note.transition, "string");
    assert.ok(Array.isArray(note.sourceRefs) && note.sourceRefs.length,
      id + ": sourceRefs فارغة");
    assert.ok(Array.isArray(note.caveats), id + ": caveats ليست مصفوفة");
    assert.ok(Array.isArray(note.qa), id + ": qa ليست مصفوفة");
    for (const qa of note.qa) {
      assert.equal(typeof qa.q, "string");
      assert.equal(typeof qa.a, "string");
      assert.ok(qa.q.length > 5 && qa.a.length > 20);
    }
  }
});

test("الخاتمة وحدها بلا جملة عبور (نهاية التسلسل)", () => {
  assert.equal(N.forSection("closing").transition, "");
  for (const id of LINEAR.filter((x) => x !== "closing")) {
    assert.ok(N.forSection(id).transition.length > 10,
      id + ": جملة العبور مفقودة");
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   2) بوابة «لا رقم مختلق» — القلب الأخلاقي لهذه الميزة
   ══════════════════════════════════════════════════════════════════════════ */

test("التدقيق الشامل يمر على الإصدار الحقيقي بلا رقم واحد خارج المجمع", () => {
  const report = N.audit(rel, der, LINEAR);
  assert.equal(report.ok, true, "\n" + N.auditMessage(report));
  assert.equal(report.offenders.length, 0);
  assert.equal(report.fabricated.length, 0);
  assert.equal(report.shape.length, 0);
  assert.equal(report.missing.length, 0);
  assert.equal(report.extra.length, 0);
  assert.equal(report.checkedSections, 10);
  assert.ok(report.checkedTexts > 80, "عدد النصوص المفحوصة أقل من المتوقع");
  assert.ok(report.checkedNumbers > 40, "عدد الأرقام المفحوصة أقل من المتوقع");
});

test("التدقيق يعمل كذلك بلا مشتقات حية (المجمع يكفي من الإصدار وحده)", () => {
  const report = N.audit(rel, null, LINEAR);
  assert.equal(report.ok, true, "\n" + N.auditMessage(report));
});

test("البوابة تكشف رقماً مختلقاً حقاً — لا تمرّ لأنها متساهلة", () => {
  const pool = N.factPool(rel, der);
  const wide = N.releasePool(rel, der);
  const bad = N.verifyText("رقم لم يرد في أي مصدر: 987,654 سرير", pool, wide);
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.offenders, ["987,654"]);
  assert.deepEqual(bad.fabricated, ["987,654"]);

  const good = N.verifyText("تغطية 43.1٪ وعجز 807.6 ألف سرير", pool, wide);
  assert.equal(good.ok, true);
  assert.deepEqual(good.numbers, ["43.1", "807.6"]);
});

test("البوابة تميّز «خارج المجمع المعتمد» عن «مختلق كلياً»", () => {
  const pool = N.factPool(rel, der);
  const wide = N.releasePool(rel, der);
  /* قيمة سيناريو مورّدة موجودة في الإصدار ومجمَّعة كذلك — لا مخالفة */
  const supplied = String(rel.scenarios.rows[0].conservative);
  const r1 = N.verifyText("قيمة " + supplied, pool, wide);
  assert.equal(r1.ok, true, "قيمة سيناريو منشورة يجب أن تمرّ");
  /* رقم لا وجود له في الشجرة كلها */
  const r2 = N.verifyText("قيمة 123,321,111", pool, wide);
  assert.equal(r2.fabricated.length, 1);
});

test("audit يبلغ عن معرف ناقص وعن ملاحظات زائدة", () => {
  const withGhost = N.audit(rel, der, LINEAR.concat(["ghost-section"]));
  assert.equal(withGhost.ok, false);
  assert.deepEqual(withGhost.missing, ["ghost-section"]);

  const partial = N.audit(rel, der, ["00", "summary"]);
  assert.equal(partial.ok, false);
  assert.ok(partial.extra.includes("closing"));
  assert.equal(partial.missing.length, 0);
});

test("رسالة التدقيق تصف الخلل بلغة مفهومة", () => {
  const report = N.audit(rel, der, LINEAR.concat(["ghost-section"]));
  const msg = N.auditMessage(report);
  assert.match(msg, /معرفات بلا ملاحظات/);
  assert.match(msg, /ghost-section/);
  assert.match(msg, /أقسام مفحوصة/);
});

/* ══════════════════════════════════════════════════════════════════════════
   3) استخراج الأرقام — دقة التطبيع
   ══════════════════════════════════════════════════════════════════════════ */

test("numbersIn يستخرج الأعداد بفواصلها وكسورها ويقصّ ترقيم الجملة", () => {
  assert.deepEqual(N.numbersIn("الطاقة 612,400 سرير."), ["612,400"]);
  assert.deepEqual(N.numbersIn("تغطية 43.1٪ فقط"), ["43.1"]);
  assert.deepEqual(N.numbersIn("رخصتان (26 و34)"), ["26", "34"]);
  assert.deepEqual(N.numbersIn("انتهت عند 100."), ["100"]);
  assert.deepEqual(N.numbersIn("بلا أرقام إطلاقاً"), []);
  assert.deepEqual(N.numbersIn(null), []);
  assert.deepEqual(N.numbersIn(""), []);
});

test("numbersIn يتجاهل محارف العزل الاتجاهي التي يحقنها fmt", () => {
  const withBidi = "النسبة " + fmt.pct(43.1) + " من الطلب";
  assert.deepEqual(N.numbersIn(withBidi), ["43.1"]);
  assert.deepEqual(N.numbersIn(fmt.iso("1,420,000")), ["1,420,000"]);
});

test("numbersIn يلتقط معرفات المبادرات المنقّطة كما تُنطق", () => {
  assert.deepEqual(N.numbersIn("دراسة الطلب والعرض (1.1) والرقابة (3.1)"),
    ["1.1", "3.1"]);
  assert.deepEqual(N.numbersIn("خطة عمل المشروع V.1.0.0"), ["1.0.0"]);
});

test("textsOf يجمع كل النصوص المنطوقة في المدخل", () => {
  const note = N.forSection("control");
  const texts = N.textsOf(note);
  assert.ok(texts.includes(note.headline));
  assert.ok(texts.includes(note.transition));
  assert.ok(texts.includes(note.ask));
  for (const p of note.points) assert.ok(texts.includes(p));
  for (const c of note.caveats) assert.ok(texts.includes(c));
  for (const qa of note.qa) {
    assert.ok(texts.includes(qa.q));
    assert.ok(texts.includes(qa.a));
  }
  assert.deepEqual(N.textsOf(null), []);
});

test("wordCount يعدّ الكلمات ويتحمّل الفراغ", () => {
  assert.equal(N.wordCount("ثلاث كلمات هنا"), 3);
  assert.equal(N.wordCount("   "), 0);
  assert.equal(N.wordCount(null), 0);
});

/* ══════════════════════════════════════════════════════════════════════════
   4) مجمع الحقائق — مصادره معلنة ومحتواه صحيح
   ══════════════════════════════════════════════════════════════════════════ */

test("المجمع المعتمد يضم كل صور القيم المنشورة القانونية", () => {
  const pool = N.factPool(rel, der);
  const has = (x) => pool.numbers.has(x);
  assert.ok(has("612,400"), "int للطاقة المرخصة");
  assert.ok(has("612.4"), "compactParts للطاقة المرخصة");
  assert.ok(has("43.1"), "نسبة التغطية");
  assert.ok(has("807.6"), "الصورة المختصرة للعجز");
  assert.ok(has("50,829"), "الأسرّة الشاغرة");
  assert.ok(has("81.6"), "قيمة الامتثال الموسومة");
  assert.ok(has("60"), "هدف التغطية الاسترشادي");
  assert.ok(has("152"), "بوابات التحقق");
  assert.ok(has("130,000") && has("260,000"), "خط أساس ومستهدف المؤشر 5");
  assert.ok(has("14"), "عدد المؤشرات البنيوي");
  assert.ok(has("18"), "عدد المبادرات البنيوي");
  assert.ok(has("4"), "عدد المحاور البنيوي");
});

test("المجمع المعتمد يضم أرقام نصوص لوحات الرؤى المعتمدة حرفياً", () => {
  const pool = N.factPool(rel, der);
  /* «48.5 ألف سرير» و«368 ألف سرير» و«172,400 سرير» ترد داخل نصوص معتمدة */
  assert.ok(pool.numbers.has("48.5"));
  assert.ok(pool.numbers.has("368"));
  assert.ok(pool.numbers.has("172,400"));
  assert.ok(pool.numbers.has("1,367"));
  assert.ok(pool.texts.some((t) => t.includes("807.6 ألف سرير")));
  assert.ok(pool.sources.includes("insight_panels.sections"));
  assert.ok(pool.sources.includes("validation"));
});

test("المجمع لا يضم رقماً غير منشور", () => {
  const pool = N.factPool(rel, der);
  assert.equal(pool.numbers.has("987,654"), false);
  assert.equal(pool.numbers.has("42,424"), false);
});

test("المجمع الواسع أشمل من المعتمد ولا ينقص عنه في القيم الجوهرية", () => {
  const pool = N.factPool(rel, der);
  const wide = N.releasePool(rel, der);
  for (const key of ["612,400", "43.1", "81.6", "1,367"]) {
    assert.ok(wide.has(key), "المجمع الواسع يفتقد " + key);
  }
  assert.ok(wide.size >= pool.numbers.size * 0.5,
    "المجمع الواسع أصغر من المتوقع");
});

test("المجمع يصمد أمام إصدار ناقص دون أن يرمي", () => {
  const empty = N.factPool({}, null);
  assert.equal(empty.numbers.size, 0,
    "مجموعة فارغة لا تنشئ حقيقة: " + Array.from(empty.numbers).join("، "));
  assert.deepEqual(empty.texts, []);
  const nul = N.factPool(null, null);
  assert.equal(nul.numbers.size, 0);
  assert.deepEqual(nul.sources, []);
  /* وتدقيق جدول كامل على إصدار فارغ يسقط بأكمله — لا يمرّ بصمت */
  const report = N.audit({}, null, ["00"]);
  assert.equal(report.ok, false);
  assert.ok(report.offenders.length > 0);
});

/* ══════════════════════════════════════════════════════════════════════════
   5) وسوم الصدق تلازم أقسامها
   ══════════════════════════════════════════════════════════════════════════ */

test("وسم منهجية 81.6٪ يلازم القسمين اللذين يعرضان القيمة", () => {
  for (const id of ["summary", "control"]) {
    const note = N.forSection(id);
    const joined = note.points.join(" ") + " " + note.caveats.join(" ");
    assert.match(joined, /81\.6/, id + ": القيمة غير مذكورة");
    assert.ok(note.caveats.some((c) => c.includes("81.6")
      && (c.includes("مورّدة") || c.includes("المنهجية"))),
    id + ": القيمة بلا وسم منهجيتها");
  }
});

test("تحفظ السيناريوهات يلازم قسم التوقعات بنص الإصدار ذاته", () => {
  const note = N.forSection("forecast");
  assert.ok(note.caveats.length >= 1);
  const c = note.caveats.join(" ");
  assert.match(c, /لا تمثل نموذج تنبؤ معتمداً/);
  assert.match(c, /توثيق الافتراضات/);
  /* الجملة مستمدة من نص التحفظ المنشور حرفياً لا من صياغة جديدة */
  assert.ok(rel.scenarios.caveat.includes("لا تمثل نموذج تنبؤ معتمداً"));
});

test("وسم العينة وتنويه الخريطة يلازمان قسم الخريطة", () => {
  const note = N.forSection("map");
  const c = note.caveats.join(" ");
  assert.match(c, /عينة الأحياء المدرجة في قاعدة البيانات/);
  assert.match(c, /الخريطة توضيحية/);
  assert.ok(rel.neighbourhoods.label.includes("عينة من الأحياء المدرجة"));
  assert.ok(rel.meta.map_disclaimer.includes("توضيحية"));
});

test("غياب القيم الحالية للمؤشرات معلَن في قسم المؤشرات", () => {
  const note = N.forSection("kpis");
  const all = note.points.join(" ") + note.caveats.join(" ");
  assert.match(all, /غير متوفرة/);
  assert.match(all, /تُسجَّل من/);
});

test("حالة الخطوات القادمة الصادقة تلازم الخاتمة", () => {
  const note = N.forSection("closing");
  const all = note.points.join(" ") + note.caveats.join(" ");
  assert.match(all, /لا خطوات معتمدة بعد/);
  assert.equal(rel.next_steps.status, "pending_approval");
});

/* ══════════════════════════════════════════════════════════════════════════
   6) ميزانية البروفة والإحصاءات
   ══════════════════════════════════════════════════════════════════════════ */

test("الميزانية تتبع صيغتها المعلنة حرفياً", () => {
  assert.equal(N.BUDGET_BASE_SEC, 15);
  assert.equal(N.BUDGET_PER_POINT_SEC, 20);
  for (const id of LINEAR) {
    const note = N.forSection(id);
    assert.equal(N.budgetSec(id), 15 + 20 * note.points.length);
  }
  assert.equal(N.budgetSec("لا-وجود-له"), 0);
});

test("مجموع الميزانية = مجموع الخطوات", () => {
  const sum = LINEAR.reduce((a, id) => a + N.budgetSec(id), 0);
  assert.equal(N.totalBudgetSec(LINEAR), sum);
  assert.equal(N.totalBudgetSec(), N.totalBudgetSec(N.SECTION_ORDER));
  assert.ok(sum > 0);
});

test("التغطية الجزئية تُبلَّغ بصدق", () => {
  const cov = N.coverage(["00", "summary", "لوحة-وهمية"]);
  assert.equal(cov.complete, false);
  assert.deepEqual(cov.missing, ["لوحة-وهمية"]);
  assert.equal(cov.total, 3);
  assert.ok(cov.pct > 66 && cov.pct < 67);
});

test("statLine يطابق العدد والمعدود عربياً عبر fmt وحده", () => {
  const line = N.statLine("summary");
  assert.ok(line.startsWith(fmt.countNoun(5, N.NOTE_NOUNS.point)),
    "سطر الإحصاء لا يبدأ بصيغة fmt.countNoun: " + line);
  assert.ok(line.includes(fmt.countNoun(1, N.NOTE_NOUNS.caveat)),
    "وسم الامتثال الوحيد غير معدود في السطر: " + line);
  assert.equal(N.statLine("لا-شيء"), "لا ملاحظات معتمدة لهذه اللوحة");
  /* الغلاف بلا وسوم ولا أسئلة: السطر نقاطه وحدها */
  assert.equal(N.statLine("00"), fmt.countNoun(N.pointsOf("00").length,
    N.NOTE_NOUNS.point));
});

test("density يعطي عدد كلمات لكل نقطة", () => {
  const d = N.density("summary");
  assert.equal(d.perPoint.length, N.pointsOf("summary").length);
  assert.ok(d.words > 0);
  assert.ok(d.longest >= Math.max.apply(null, d.perPoint) - 0.001);
  assert.deepEqual(N.density("لا-شيء").perPoint, []);
});

test("دوال القراءة تعيد نسخاً لا مراجع قابلة للتلويث", () => {
  const p = N.pointsOf("summary");
  p.push("نص دخيل");
  assert.equal(N.pointsOf("summary").length, p.length - 1);
  const c = N.caveatsOf("control");
  c.push("وسم دخيل");
  assert.equal(N.caveatsOf("control").length, c.length - 1);
});

/* ══════════════════════════════════════════════════════════════════════════
   7) نموذج الجولة — RH.tour.model
   ══════════════════════════════════════════════════════════════════════════ */

test("الجولة تُعرَّف دون بناء أي شيء في بيئة بلا DOM", () => {
  assert.ok(T, "RH.tour غير معرَّف");
  assert.equal(T.version, "1");
  assert.equal(T.active(), false);
  assert.equal(T.notes.isOpen(), false);
  assert.equal(T.start(), false, "البدء يجب أن يفشل بصمت بلا DOM");
  assert.equal(T.stop(), true, "الإيقاف آمن دائماً");
  assert.equal(T.notes.toggle(), undefined);
  assert.equal(T.notes.isOpen(), false);
});

test("ترجمة المفاتيح تطابق عقد الملاحة §8 (RTL: السهم الأيمن = التالي)", () => {
  for (const k of ["PageDown", " ", "Enter", "ArrowRight", "ArrowDown"]) {
    assert.equal(M.keyToAction(k), "next", k);
  }
  for (const k of ["PageUp", "Backspace", "ArrowLeft", "ArrowUp"]) {
    assert.equal(M.keyToAction(k), "prev", k);
  }
  assert.equal(M.keyToAction("Home"), "first");
  assert.equal(M.keyToAction("End"), "last");
  assert.equal(M.keyToAction("Escape"), "stop");
  assert.equal(M.keyToAction("a"), null);
  assert.equal(M.keyToAction(null), null);
});

test("حصر الفهارس بلا لفّ دائري عند الطرفين", () => {
  assert.equal(M.clampIndex(-3, 10), 0);
  assert.equal(M.clampIndex(99, 10), 9);
  assert.equal(M.clampIndex(4, 10), 4);
  assert.equal(M.clampIndex(0, 0), 0);
  assert.equal(M.clampIndex(NaN, 10), 0);

  assert.equal(M.applyAction("next", 9, 10), 9, "لا التفاف عند النهاية");
  assert.equal(M.applyAction("prev", 0, 10), 0, "لا التفاف عند البداية");
  assert.equal(M.applyAction("next", 3, 10), 4);
  assert.equal(M.applyAction("prev", 3, 10), 2);
  assert.equal(M.applyAction("first", 7, 10), 0);
  assert.equal(M.applyAction("last", 2, 10), 9);
  assert.equal(M.applyAction("wat", 2, 10), 2);
});

test("buildSteps يبني خطوة لكل معرف في التسلسل الحي بملاحظاته", () => {
  const meta = { "00": { title: "الغلاف", kicker: "افتتاح العرض" } };
  for (const s of REGISTERED) meta[s.id] = { title: s.title, kicker: "" };
  const steps = M.buildSteps(LINEAR, N, meta);
  assert.equal(steps.length, LINEAR.length);
  steps.forEach((s, i) => {
    assert.equal(s.index, i);
    assert.equal(s.id, LINEAR[i]);
    assert.equal(s.hasNotes, true, s.id + ": الخطوة بلا ملاحظات");
    assert.ok(s.points.length >= 3);
    assert.equal(s.budgetSec, N.budgetSec(s.id));
    assert.ok(s.targetCount >= 3, s.id + ": أهداف الإبراز أقل من ثلاثة");
  });
  assert.equal(steps[1].title, REGISTERED[0].title);
});

test("buildSteps يتحمّل معرفاً بلا ملاحظات ولا يخترع نصاً", () => {
  const steps = M.buildSteps(["00", "ghost"], N, {});
  assert.equal(steps.length, 2);
  assert.equal(steps[1].hasNotes, false);
  assert.deepEqual(steps[1].points, []);
  assert.equal(steps[1].note, null);
  assert.equal(steps[1].title, "ghost");
  assert.deepEqual(M.buildSteps(null, N, {}), []);
});

test("indexOf يجد الخطوة ويعيد ‎-1 خارج التسلسل (الملاحق)", () => {
  const steps = M.buildSteps(LINEAR, N, {});
  assert.equal(M.indexOf(steps, "00"), 0);
  assert.equal(M.indexOf(steps, "closing"), LINEAR.length - 1);
  assert.equal(M.indexOf(steps, "atlas"), -1);
  assert.equal(M.indexOf(null, "00"), -1);
});

test("نموذج التقدم يمر بكل أرقامه عبر fmt", () => {
  const p = M.progressModel(0, 10);
  assert.equal(p.label, "الخطوة " + fmt.int(1) + " من " + fmt.int(10));
  assert.equal(p.atFirst, true);
  assert.equal(p.atLast, false);
  assert.equal(p.remaining, 9);
  assert.equal(p.pct, 10);

  const last = M.progressModel(9, 10);
  assert.equal(last.atLast, true);
  assert.equal(last.pct, 100);
  assert.equal(last.remaining, 0);

  const none = M.progressModel(0, 0);
  assert.equal(none.label, "لا خطوات");
  assert.equal(none.atLast, true);
  assert.equal(none.pct, 0);
});

test("ساعة البروفة تُصفّر بمنزلتين وتُعزل اتجاهياً", () => {
  assert.equal(M.clock(0), fmt.iso("00:00"));
  assert.equal(M.clock(9), fmt.iso("00:09"));
  assert.equal(M.clock(65), fmt.iso("01:05"));
  assert.equal(M.clock(600), fmt.iso("10:00"));
  assert.equal(M.clock(-5), fmt.iso("00:00"));
  assert.equal(M.clock("لا رقم"), fmt.iso("00:00"));
  assert.match(M.clock(125), /^\u2066\d\d:\d\d\u2069$/);
});

test("نموذج الإيقاع يعطي ثلاث حالات ولا يستعمل نغمة محرّمة", () => {
  const ALLOWED = new Set(["on", "near", "over", "neu"]);
  const cases = [[0, 100], [50, 100], [85, 100], [100, 100], [140, 100], [10, 0]];
  for (const [e, b] of cases) {
    const p = M.pacingModel(e, b);
    assert.ok(ALLOWED.has(p.tone), "نغمة غير مسموحة: " + p.tone);
    assert.notEqual(p.tone, "neg", "لا مرجاني في إيقاع البروفة");
    assert.notEqual(p.tone, "gold", "لا ذهبي في إيقاع البروفة");
  }
  assert.equal(M.pacingModel(50, 100).tone, "on");
  assert.equal(M.pacingModel(85, 100).tone, "near");
  assert.equal(M.pacingModel(140, 100).tone, "over");
  assert.equal(M.pacingModel(140, 100).delta, 40);
  assert.equal(M.pacingModel(10, 0).tone, "neu");
  assert.equal(M.pacingModel(10, 0).label, "بلا زمن تقديري");
});

test("selfKeyed يترك مفاتيح الاتجاه لأصحابها ولا يسرق من الأزرار", () => {
  assert.equal(M.selfKeyed("INPUT", "", "ArrowRight"), true);
  assert.equal(M.selfKeyed("TEXTAREA", "", "PageDown"), true);
  assert.equal(M.selfKeyed("DIV", "listbox", "ArrowDown"), true);
  assert.equal(M.selfKeyed("DIV", "slider", "Home"), true);
  assert.equal(M.selfKeyed("BUTTON", "", "ArrowRight"), false);
  assert.equal(M.selfKeyed("DIV", "", "PageDown"), false);
  assert.equal(M.selfKeyed("DIV", "listbox", "PageDown"), false);
});

test("coverageModel يلخّص التسلسل بميزانيته", () => {
  const steps = M.buildSteps(LINEAR, N, {});
  const cov = M.coverageModel(steps);
  assert.equal(cov.steps, 10);
  assert.equal(cov.withNotes, 10);
  assert.equal(cov.missing, 0);
  assert.equal(cov.complete, true);
  assert.equal(cov.budgetSec, N.totalBudgetSec(LINEAR));
  assert.equal(cov.budgetLabel, M.clock(cov.budgetSec));
  assert.equal(cov.points, LINEAR.reduce((a, id) => a + N.pointsOf(id).length, 0));

  const partial = M.coverageModel(M.buildSteps(["00", "ghost"], N, {}));
  assert.equal(partial.complete, false);
  assert.equal(partial.missing, 1);
  assert.deepEqual(M.coverageModel(null).steps, 0);
});

test("مقياس خط الدرج محصور بين حديه", () => {
  assert.equal(M.clampScale(0.1), M.SCALE_MIN);
  assert.equal(M.clampScale(9), M.SCALE_MAX);
  assert.equal(M.clampScale(1), 1);
  assert.equal(M.clampScale("سلسلة"), 1);
  assert.ok(M.SCALE_MIN < 1 && M.SCALE_MAX > 1 && M.SCALE_STEP > 0);
});

/* ══════════════════════════════════════════════════════════════════════════
   8) أهداف الإبراز — عناصر حقيقية في اللوحات المعتمدة
   ══════════════════════════════════════════════════════════════════════════ */

test("لكل قسم في التسلسل أهداف إبراز، ولكل هدف طريقة عثور", () => {
  for (const id of LINEAR) {
    const targets = M.targetsFor(id);
    assert.ok(targets.length >= 3, id + ": أهداف أقل من ثلاثة");
    const keys = new Set();
    for (const t of targets) {
      assert.equal(typeof t.key, "string");
      assert.ok(!keys.has(t.key), id + ": مفتاح هدف مكرر " + t.key);
      keys.add(t.key);
      assert.equal(typeof t.label, "string");
      assert.ok(t.label.trim().length > 4, id + "/" + t.key + ": تسمية قصيرة");
      assert.ok(t.cardTitle || t.kpiLabel || t.sel,
        id + "/" + t.key + ": بلا طريقة عثور");
    }
  }
});

test("تسميات الإبراز وصف واجهة لا بيانات — بلا أي رقم", () => {
  for (const id of LINEAR) {
    for (const t of M.targetsFor(id)) {
      assert.deepEqual(N.numbersIn(t.label), [],
        id + "/" + t.key + ": تسمية الإبراز تحمل رقماً — الوصف لا يحمل بيانات");
    }
  }
});

test("جدول الأهداف لا يحمل معرفاً خارج التسلسل الحي", () => {
  assert.deepEqual(Object.keys(T.TARGETS).sort(), LINEAR.slice().sort());
});

test("targetsFor يعيد نسخاً — الجدول المقفل لا يُلوَّث من المستدعي", () => {
  const a = M.targetsFor("summary");
  a[0].label = "تلويث";
  assert.notEqual(M.targetsFor("summary")[0].label, "تلويث");
  assert.deepEqual(M.targetsFor("لا-وجود-له"), []);
});

test("كل عنوان بطاقة مطلوب موجود نصياً في ملف قسمه المعتمد", () => {
  const dir = path.join(ROOT, "src", "js", "presenter", "sections");
  const fileOf = { "00": "s0-cover" };
  for (const s of REGISTERED) fileOf[s.id] = s.file;
  for (const id of LINEAR) {
    const src = readFileSync(path.join(dir, fileOf[id] + ".js"), "utf8");
    for (const t of M.targetsFor(id)) {
      if (t.cardTitle) {
        assert.ok(src.includes(t.cardTitle),
          id + "/" + t.key + ": عنوان البطاقة «" + t.cardTitle
          + "» غير موجود في " + fileOf[id] + ".js");
      }
      if (t.kpiLabel) {
        /* المطابقة على `label: "…"` حرفياً لا على مجرد ورود النص: تسمية
           المؤشر هي ما يُكتب في `.kpi-label`، وعنوان بطاقة تفصيله نص آخر
           أطول قد يحتوي التسمية فيمرّ فحص «الاحتواء» زوراً */
        assert.ok(src.includes('label: "' + t.kpiLabel + '"'),
          id + "/" + t.key + ": تسمية المؤشر «" + t.kpiLabel
          + "» ليست تسمية شريط مؤشرات في " + fileOf[id] + ".js");
      }
    }
  }
});

test("محددات الأصناف المطلوبة مبنية فعلاً في ملفات الأقسام", () => {
  const dir = path.join(ROOT, "src", "js", "presenter", "sections");
  const fileOf = { "00": "s0-cover" };
  for (const s of REGISTERED) fileOf[s.id] = s.file;
  /* أصناف مشتركة تبنيها layout.js لا ملف القسم — تُستثنى من الفحص الملفّي */
  const SHARED = new Set([".kpi-strip", ".rail", ".pending-card"]);
  for (const id of LINEAR) {
    const src = readFileSync(path.join(dir, fileOf[id] + ".js"), "utf8");
    for (const t of M.targetsFor(id)) {
      const sels = [].concat(t.sel || [], t.alt || []);
      for (const sel of sels) {
        if (SHARED.has(sel)) continue;
        const cls = sel.replace(/^\./, "");
        assert.ok(src.includes(cls),
          id + "/" + t.key + ": الصنف «" + cls + "» غير مبني في " + fileOf[id]);
      }
    }
  }
});

test("الأصناف المشتركة المستهدفة تبنيها layout.js فعلاً", () => {
  const layout = readFileSync(
    path.join(ROOT, "src", "js", "presenter", "layout.js"), "utf8");
  for (const cls of ["kpi-strip", "kpi-label", "rail", "pending-card",
    "card-title", "dash-card"]) {
    assert.ok(layout.includes(cls), "layout.js لا يبني الصنف " + cls);
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   9) ثبات المصدر: الملاحظات مشتقة من الإصدار لا مستقلة عنه
   ══════════════════════════════════════════════════════════════════════════ */

test("النقاط المنسوخة حرفياً تطابق نص لوحة الرؤى مصدرها", () => {
  const panels = rel.insight_panels.sections;
  const byId = Object.create(null);
  for (const key of Object.keys(panels)) {
    for (const p of panels[key]) byId[p.id] = p.text;
  }
  const expectations = [
    ["summary", byId.sd1],
    ["summary", byId.sd2],
    ["summary", byId.sd3],
    ["licensing", byId.ld1],
    ["licensing", byId.ld3],
    ["control", byId.cd1],
    ["control", byId.cd2],
    ["control", byId.cd3],
    ["initiatives", byId.id1],
    ["initiatives", byId.id2],
    ["initiatives", byId.id3],
    ["closing", byId.id2],
  ];
  for (const [id, text] of expectations) {
    assert.ok(text, "نص لوحة الرؤى غير موجود في الإصدار");
    const joined = N.pointsOf(id).join(" ").replace(/\s+/g, " ");
    const needle = text.replace(/\s+/g, " ");
    assert.ok(joined.includes(needle),
      id + ": النص المعتمد غير منقول حرفياً — «" + needle.slice(0, 48) + "…»");
  }
});

test("نقاط الرؤى القصيرة (s03…s07) منقولة كما اعتُمدت", () => {
  const ins = rel.insights;
  const pairs = [
    ["demand", ins.s03.text],
    ["demand", ins.s04.text],
    ["licensing", ins.s05.text],
    ["map", ins.s04.text],
    ["closing", ins.s03.text],
  ];
  for (const [id, text] of pairs) {
    const joined = N.pointsOf(id).join(" ").replace(/\s+/g, " ");
    const core = text.replace(/\s+/g, " ").replace(/[.،]$/, "");
    assert.ok(joined.includes(core.slice(0, Math.min(60, core.length))),
      id + ": الرؤية المعتمدة غير حاضرة — «" + core.slice(0, 48) + "…»");
  }
  /* الرقابة تنقل شطر الرؤية s07 المتعلق بالحصة حرفياً (شطرها الأول يكرّر
     لوحة الرؤى cd1 المنقولة كاملة في النقطة الأولى، فلا يُعاد الرقم مرتين) */
  const controlPoints = N.pointsOf("control").join(" ");
  assert.ok(ins.s07.text.includes("37.8٪ من إجمالي مخالفات المدينة"));
  assert.ok(controlPoints.includes("37.8٪ من إجمالي مخالفات المدينة"),
    "control: شطر الرؤية s07 المعتمد غير منقول حرفياً");
});

test("قيم الوسوم في CAVEATS مسندة إلى نصوص الإصدار", () => {
  assert.ok(N.CAVEATS.compliance.includes(String(rel.compliance.value)));
  assert.ok(N.CAVEATS.targetIndicative
    .includes(String(rel.coverage_target_indicative.value)));
  assert.ok(rel.next_steps.note.includes("لا خطوات معتمدة بعد"));
  assert.ok(N.CAVEATS.nextSteps.includes("لا خطوات معتمدة بعد"));
  assert.ok(N.CAVEATS.strategyMirror.includes("V.1.0.0"));
  assert.ok(rel.strategy.source.includes("V.1.0.0"));
});

test("تغيّر قيمة منشورة يكسر البوابة — الجدول ليس مستقلاً عن الإصدار", () => {
  /* إصدار معدَّل: قيمة الامتثال تتغير فلا تعود 81.6 مسنَدة إلى شيء */
  const mutatedRel = freshRelease();
  mutatedRel.compliance.value = 77.7;
  /* ونزع النصوص التي تحمل الرقم كذلك (وسم الامتثال يذكره) */
  mutatedRel.compliance.note = "قيمة مورّدة بلا رقم في النص";
  const report = N.audit(mutatedRel, RH.data.derive.compute(mutatedRel), LINEAR);
  assert.equal(report.ok, false,
    "البوابة لم تلاحظ اختفاء القيمة المنشورة من الإصدار");
  assert.ok(report.offenders.some((o) => o.number === "81.6"),
    "المخالفة المتوقعة (81.6) غير مذكورة في التقرير");
});
