/* highlight-cap.test.mjs — بوابة القبول الملزمة في V3_SPEC §5 و§7
   «حد أقصى 320 حرفاً — يُفرض باختبار وحدة».
   تُختبر الدالة النقية RH.highlight.normalize بالملف الحقيقي (لا نسخة). */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH, norm } from "./load-app.mjs";

const HL = RH.highlight;

/** يبني نصاً عربياً بطول محدد بالضبط */
const pad = (n) => "ن".repeat(n);

test("الحدّان معلنان في العقد: 320 حرفاً و3 أرقام مساندة", () => {
  assert.equal(HL.MAX_CHARS, 320);
  assert.equal(HL.MAX_STATS, 3);
});

test("measure يجمع العنوان والجملة وتسميات الأرقام وقيمها فقط", () => {
  const spec = {
    title: pad(10),
    sentence: pad(20),
    stats: [{ label: pad(5), value: pad(7) }, { label: pad(3), value: pad(1) }],
    appendix: { id: "demand", params: { x: "لا يُحتسب" } },
  };
  assert.equal(HL.measure(spec), 10 + 20 + 5 + 7 + 3 + 1);
  // وجهة الزر ومعاملاتها خارج الحساب — الزر كروم ثابت لا نص حرّ
  assert.equal(HL.measure({ appendix: { id: "x".repeat(50) } }), 0);
});

test("مواصفة داخل الحد تمر كما هي بلا قصّ ولا إسقاط", () => {
  const spec = {
    title: "القطاع الجنوبي",
    sentence: "القطاع الجنوبي يستحوذ على أعلى عدد مخالفات في فترة الرصد.",
    stats: [
      { label: "المخالفات", value: "1,204" },
      { label: "الحصة", value: "33.3٪" },
    ],
    appendix: { id: "monitoring", params: { sector: "south" } },
  };
  const out = HL.normalize(spec, { strict: true });
  assert.equal(out.truncated, false);
  assert.equal(out.dropped, 0);
  assert.equal(out.sentence, spec.sentence);
  assert.equal(out.stats.length, 2);
  assert.deepEqual(norm(out.appendix.params), { sector: "south" });
  assert.ok(out.chars <= HL.MAX_CHARS);
});

test("التطوير (strict): تجاوز 320 حرفاً يرمي خطأً صريحاً", () => {
  assert.throws(
    () => HL.normalize({ title: "عنوان", sentence: pad(400) }, { strict: true }),
    /320/);
});

test("التطوير (strict): أكثر من ثلاثة أرقام مساندة يرمي خطأً", () => {
  assert.throws(() => HL.normalize({
    title: "ع",
    stats: [{ label: "أ", value: "1" }, { label: "ب", value: "2" },
      { label: "ج", value: "3" }, { label: "د", value: "4" }],
  }, { strict: true }), /الأرقام المساندة/);
});

test("الإنتاج: القصّ يبدأ من الجملة ويُبقي العنوان والأرقام", () => {
  const spec = {
    title: pad(30),
    sentence: pad(400),
    stats: [{ label: pad(10), value: pad(10) }],
  };
  const out = HL.normalize(spec, { strict: false });
  assert.equal(out.truncated, true);
  assert.equal(out.dropped, 0);
  assert.equal(out.title, spec.title, "العنوان لا يُمَسّ");
  assert.equal(out.stats.length, 1, "الأرقام المساندة لا تُمَسّ ما دام القصّ كافياً");
  assert.ok(out.chars <= HL.MAX_CHARS, "النتيجة داخل الحد: " + out.chars);
  assert.ok(out.sentence.endsWith("…"), "القصّ معلَن بعلامة حذف");
});

test("الإنتاج: الأرقام الزائدة تُقصّ إلى ثلاثة ولا يبتلع الحد الرابع صامتاً", () => {
  const out = HL.normalize({
    title: "ع",
    stats: [{ label: "أ", value: "1" }, { label: "ب", value: "2" },
      { label: "ج", value: "3" }, { label: "د", value: "4" }],
  }, { strict: false });
  assert.equal(out.stats.length, 3);
  assert.equal(out.dropped, 1);
  assert.deepEqual(norm(out.stats.map((s) => s.label)), ["أ", "ب", "ج"]);
});

test("الإنتاج: حين لا تكفي الجملة تُسقط الأرقام من الآخِر حتى يستقيم الحد", () => {
  const out = HL.normalize({
    title: pad(200),
    sentence: pad(50),
    stats: [{ label: pad(60), value: pad(60) },
      { label: pad(60), value: pad(60) },
      { label: pad(5), value: pad(5) }],
  }, { strict: false });
  assert.ok(out.chars <= HL.MAX_CHARS, "النتيجة داخل الحد: " + out.chars);
  assert.ok(out.dropped > 0, "أُسقط ما لا يسعه الحد");
  assert.equal(out.truncated, true);
});

test("مواصفة فارغة لا تنهار: صفر أحرف ولا وجهة ملحق", () => {
  const out = HL.normalize(null, { strict: true });
  assert.equal(out.chars, 0);
  assert.equal(out.appendix, null);
  assert.deepEqual(norm(out.stats), []);
});

test("وجهة الملحق تُطبَّع: معرف نصي ومعاملات كائن دائماً", () => {
  const out = HL.normalize({ title: "ع", appendix: { id: "kpi" } },
    { strict: true });
  assert.equal(out.appendix.id, "kpi");
  assert.deepEqual(norm(out.appendix.params), {});
  assert.equal(out.appendix.label, null);
  // ملحق بلا معرف = لا زر
  assert.equal(HL.normalize({ appendix: { params: {} } }, { strict: true })
    .appendix, null);
});

test("الأرقام بلا تسمية ولا قيمة تُستبعد قبل عدّ الحدّ", () => {
  const out = HL.normalize({
    title: "ع",
    stats: [null, { label: "أ", value: "1" }, {}, undefined],
  }, { strict: true });
  assert.equal(out.stats.length, 1);
});
