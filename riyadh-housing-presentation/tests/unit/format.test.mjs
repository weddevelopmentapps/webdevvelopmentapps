/* format.test.mjs — التنسيق العربي المركزي: فواصل الآلاف، العزل الاتجاهي
   لعلامة ٪، الصيغة التنفيذية المختصرة وحدودها، تطابق العدد والمعدود، والتواريخ. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH } from "./load-app.mjs";

const fmt = RH.core.fmt;
const NBSP = " ";
const LRI = "⁦";
const PDI = "⁩";

test("NBSP المصدَّر هو المسافة غير الفاصلة U+00A0", () => {
  assert.strictEqual(fmt.NBSP, NBSP);
});

/* ── int: فاصل آلاف لاتيني ── */
test("int: فواصل الآلاف والسالب والقيم المفقودة", () => {
  assert.strictEqual(fmt.int(1420000), "1,420,000");
  assert.strictEqual(fmt.int(612400), "612,400");
  assert.strictEqual(fmt.int(999), "999");
  assert.strictEqual(fmt.int(0), "0");
  assert.strictEqual(fmt.int(1234.6), "1,235"); // تقريب لا اقتطاع
  assert.strictEqual(fmt.int(-1234), "−1,234"); // علامة الطرح U+2212
  assert.strictEqual(fmt.int(null), "—");
  assert.strictEqual(fmt.int(NaN), "—");
});

/* ── pct: علامة ٪ العربية داخل عزل اتجاهي حتمي ── */
test("pct: يبدأ بـ LRI وينتهي بـ PDI ويحوي ٪ العربية", () => {
  const s = fmt.pct(43.1);
  assert.ok(s.startsWith(LRI), "يبدأ بمحرف العزل \\u2066");
  assert.ok(s.endsWith(PDI), "ينتهي بمحرف الإنهاء \\u2069");
  assert.ok(s.includes("٪"), "علامة النسبة العربية U+066A");
  assert.strictEqual(s, LRI + "43.1٪" + PDI);
});

test("pct: منزلة عشرية واحدة دائماً والقيم المفقودة شرطة", () => {
  assert.strictEqual(fmt.pct(50), LRI + "50.0٪" + PDI);
  assert.strictEqual(fmt.pct(91.7), LRI + "91.7٪" + PDI);
  assert.strictEqual(fmt.pct(null), "—");
  assert.strictEqual(fmt.pct(NaN), "—");
});

/* ── dec1 ── */
test("dec1: الصحيح يكتسب منزلته العشرية (43 → 43.0)", () => {
  assert.strictEqual(fmt.dec1(43), "43.0");
  assert.strictEqual(fmt.dec1(91.7), "91.7");
  assert.strictEqual(fmt.dec1(0), "0.0");
  assert.strictEqual(fmt.dec1(null), "—");
});

/* ── compactParts: حدود الصيغة التنفيذية ── */
test("compactParts: 999 دون الحد → رقم كامل بلا كلمة", () => {
  assert.deepStrictEqual(fmt.compactParts(999), { num: "999", word: "" });
  assert.deepStrictEqual(fmt.compactParts(9999), { num: "9,999", word: "" });
});

test("compactParts: 10000 أول عتبة «ألف»", () => {
  assert.deepStrictEqual(fmt.compactParts(10000), { num: "10", word: "ألف" });
  assert.deepStrictEqual(fmt.compactParts(612400), { num: "612.4", word: "ألف" });
});

test("compactParts: 1420000 → 1.42 مليون", () => {
  assert.deepStrictEqual(fmt.compactParts(1420000), { num: "1.42", word: "مليون" });
  assert.deepStrictEqual(fmt.compactParts(1000000), { num: "1", word: "مليون" });
  assert.deepStrictEqual(fmt.compactParts(null), { num: "—", word: "" });
});

test("compact: الصيغة النصية توافق الأجزاء نفسها", () => {
  assert.strictEqual(fmt.compact(1420000), "1.42" + NBSP + "مليون");
  assert.strictEqual(fmt.compact(612400), "612.4" + NBSP + "ألف");
  assert.strictEqual(fmt.compact(9999), "9,999");
});

/* ── unitAfter: لحاق الوحدة الموحد ── */
test("unitAfter: قيمة ثم مسافة غير فاصلة ثم الوحدة", () => {
  assert.strictEqual(fmt.unitAfter(612400, "سرير"), "612,400" + NBSP + "سرير");
  assert.strictEqual(fmt.unitAfter(140, "رخصة"), "140" + NBSP + "رخصة");
});

/* ── noun: تطابق العدد والمعدود العربي الحقيقي ── */
test("noun(licence): حالات 0/1/2/3/11", () => {
  assert.strictEqual(fmt.noun(0, "licence"), "لا رخصة");
  assert.strictEqual(fmt.noun(1, "licence"), "رخصة واحدة");
  assert.strictEqual(fmt.noun(2, "licence"), "رخصتان");
  assert.strictEqual(fmt.noun(3, "licence"), "3" + NBSP + "رخص");
  assert.strictEqual(fmt.noun(11, "licence"), "11" + NBSP + "رخصة");
});

test("noun(bed): حالات 0/1/2/3/11 مع صيغة الصفر الخاصة", () => {
  assert.strictEqual(fmt.noun(0, "bed"), "لا أسرّة");
  assert.strictEqual(fmt.noun(1, "bed"), "سرير واحد");
  assert.strictEqual(fmt.noun(2, "bed"), "سريران");
  assert.strictEqual(fmt.noun(3, "bed"), "3" + NBSP + "أسرّة");
  assert.strictEqual(fmt.noun(11, "bed"), "11" + NBSP + "سريراً");
});

test("noun: حد جمع القلة 10 ثم جمع الكثرة، ومئات كبيرة بفواصل", () => {
  assert.strictEqual(fmt.noun(10, "licence"), "10" + NBSP + "رخص");
  assert.strictEqual(fmt.noun(103, "licence"), "103" + NBSP + "رخص"); // 103 % 100 = 3
  assert.strictEqual(fmt.noun(3617, "violation"), "3,617" + NBSP + "مخالفة");
});

/* ── date: ميلادي عربي بيوم أو شهر-فقط ── */
test("date: تاريخ كامل وشهر-سنة فقط", () => {
  assert.strictEqual(fmt.date("2026-08-16"), "16 أغسطس 2026");
  assert.strictEqual(fmt.date("2026-01-05"), "5 يناير 2026"); // بلا صفر بادئ
  assert.strictEqual(fmt.date("2025-09"), "سبتمبر 2025");
  assert.strictEqual(fmt.date("2026-12"), "ديسمبر 2026");
});

test("date: المفقود شرطة وغير المطابق يعاد كما هو", () => {
  assert.strictEqual(fmt.date(null), "—");
  assert.strictEqual(fmt.date(""), "—");
  assert.strictEqual(fmt.date("بلا تاريخ"), "بلا تاريخ");
});

/* ── iso: العزل الاتجاهي العام ── */
test("iso: يغلّف أي مقطع مختلط بمحرفي LRI/PDI", () => {
  assert.strictEqual(fmt.iso("V1"), LRI + "V1" + PDI);
});
