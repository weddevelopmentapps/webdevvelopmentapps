/* format.test.mjs — التنسيق العربي المركزي: فواصل الآلاف، العزل الاتجاهي
   لعلامة ٪، الصيغة التنفيذية المختصرة وحدودها، تطابق العدد والمعدود، والتواريخ. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH, norm } from "./load-app.mjs";

const fmt = RH.core.fmt;
const NBSP = " ";
const LRI = "⁦";
const PDI = "⁩";

test("NBSP المصدَّر هو المسافة غير الفاصلة U+00A0", () => {
  assert.deepStrictEqual(fmt.NBSP, NBSP);
});

/* ── int: فاصل آلاف لاتيني ── */
test("int: فواصل الآلاف والسالب والقيم المفقودة", () => {
  assert.deepStrictEqual(fmt.int(1420000), "1,420,000");
  assert.deepStrictEqual(fmt.int(612400), "612,400");
  assert.deepStrictEqual(fmt.int(999), "999");
  assert.deepStrictEqual(fmt.int(0), "0");
  assert.deepStrictEqual(fmt.int(1234.6), "1,235"); // تقريب لا اقتطاع
  assert.deepStrictEqual(fmt.int(-1234), "−1,234"); // علامة الطرح U+2212
  assert.deepStrictEqual(fmt.int(null), "—");
  assert.deepStrictEqual(fmt.int(NaN), "—");
});

/* ── pct: علامة ٪ العربية داخل عزل اتجاهي حتمي ── */
test("pct: يبدأ بـ LRI وينتهي بـ PDI ويحوي ٪ العربية", () => {
  const s = fmt.pct(43.1);
  assert.ok(s.startsWith(LRI), "يبدأ بمحرف العزل \\u2066");
  assert.ok(s.endsWith(PDI), "ينتهي بمحرف الإنهاء \\u2069");
  assert.ok(s.includes("٪"), "علامة النسبة العربية U+066A");
  assert.deepStrictEqual(s, LRI + "43.1٪" + PDI);
});

test("pct: منزلة عشرية واحدة دائماً والقيم المفقودة شرطة", () => {
  assert.deepStrictEqual(fmt.pct(50), LRI + "50.0٪" + PDI);
  assert.deepStrictEqual(fmt.pct(91.7), LRI + "91.7٪" + PDI);
  assert.deepStrictEqual(fmt.pct(null), "—");
  assert.deepStrictEqual(fmt.pct(NaN), "—");
});

/* ── dec1 ── */
test("dec1: الصحيح يكتسب منزلته العشرية (43 → 43.0)", () => {
  assert.deepStrictEqual(fmt.dec1(43), "43.0");
  assert.deepStrictEqual(fmt.dec1(91.7), "91.7");
  assert.deepStrictEqual(fmt.dec1(0), "0.0");
  assert.deepStrictEqual(fmt.dec1(null), "—");
});

/* ── compactParts: حدود الصيغة التنفيذية ── */
test("compactParts: 999 دون الحد → رقم كامل بلا كلمة", () => {
  assert.deepStrictEqual(norm(fmt.compactParts(999)), { num: "999", word: "" });
  assert.deepStrictEqual(norm(fmt.compactParts(9999)), { num: "9,999", word: "" });
});

test("compactParts: 10000 أول عتبة «ألف»", () => {
  assert.deepStrictEqual(norm(fmt.compactParts(10000)), { num: "10", word: "ألف" });
  assert.deepStrictEqual(norm(fmt.compactParts(612400)), { num: "612.4", word: "ألف" });
});

test("compactParts: 1420000 → 1.42 مليون", () => {
  assert.deepStrictEqual(norm(fmt.compactParts(1420000)), { num: "1.42", word: "مليون" });
  assert.deepStrictEqual(norm(fmt.compactParts(1000000)), { num: "1", word: "مليون" });
  assert.deepStrictEqual(norm(fmt.compactParts(null)), { num: "—", word: "" });
});

test("compact: الصيغة النصية توافق الأجزاء نفسها", () => {
  assert.deepStrictEqual(fmt.compact(1420000), "1.42" + NBSP + "مليون");
  assert.deepStrictEqual(fmt.compact(612400), "612.4" + NBSP + "ألف");
  assert.deepStrictEqual(fmt.compact(9999), "9,999");
});

/* ── unitAfter: لحاق الوحدة الموحد ── */
test("unitAfter: قيمة ثم مسافة غير فاصلة ثم الوحدة", () => {
  assert.deepStrictEqual(fmt.unitAfter(612400, "سرير"), "612,400" + NBSP + "سرير");
  assert.deepStrictEqual(fmt.unitAfter(140, "رخصة"), "140" + NBSP + "رخصة");
});

/* ── noun: تطابق العدد والمعدود العربي الحقيقي ── */
test("noun(licence): حالات 0/1/2/3/11", () => {
  assert.deepStrictEqual(fmt.noun(0, "licence"), "لا رخصة");
  assert.deepStrictEqual(fmt.noun(1, "licence"), "رخصة واحدة");
  assert.deepStrictEqual(fmt.noun(2, "licence"), "رخصتان");
  assert.deepStrictEqual(fmt.noun(3, "licence"), "3" + NBSP + "رخص");
  assert.deepStrictEqual(fmt.noun(11, "licence"), "11" + NBSP + "رخصة");
});

test("noun(bed): حالات 0/1/2/3/11 مع صيغة الصفر الخاصة", () => {
  assert.deepStrictEqual(fmt.noun(0, "bed"), "لا أسرّة");
  assert.deepStrictEqual(fmt.noun(1, "bed"), "سرير واحد");
  assert.deepStrictEqual(fmt.noun(2, "bed"), "سريران");
  assert.deepStrictEqual(fmt.noun(3, "bed"), "3" + NBSP + "أسرّة");
  assert.deepStrictEqual(fmt.noun(11, "bed"), "11" + NBSP + "سريراً");
});

test("noun: حد جمع القلة 10 ثم جمع الكثرة، ومئات كبيرة بفواصل", () => {
  assert.deepStrictEqual(fmt.noun(10, "licence"), "10" + NBSP + "رخص");
  assert.deepStrictEqual(fmt.noun(103, "licence"), "103" + NBSP + "رخص"); // 103 % 100 = 3
  assert.deepStrictEqual(fmt.noun(3617, "violation"), "3,617" + NBSP + "مخالفة");
});

/* ── date: ميلادي عربي بيوم أو شهر-فقط ── */
test("date: تاريخ كامل وشهر-سنة فقط", () => {
  assert.deepStrictEqual(fmt.date("2026-08-16"), "16 أغسطس 2026");
  assert.deepStrictEqual(fmt.date("2026-01-05"), "5 يناير 2026"); // بلا صفر بادئ
  assert.deepStrictEqual(fmt.date("2025-09"), "سبتمبر 2025");
  assert.deepStrictEqual(fmt.date("2026-12"), "ديسمبر 2026");
});

test("date: المفقود شرطة وغير المطابق يعاد كما هو", () => {
  assert.deepStrictEqual(fmt.date(null), "—");
  assert.deepStrictEqual(fmt.date(""), "—");
  assert.deepStrictEqual(fmt.date("بلا تاريخ"), "بلا تاريخ");
});

/* ── iso: العزل الاتجاهي العام ── */
test("iso: يغلّف أي مقطع مختلط بمحرفي LRI/PDI", () => {
  assert.deepStrictEqual(fmt.iso("V1"), LRI + "V1" + PDI);
});

/* ── monthsList: إفصاح تعادل الذروة (إصلاح مراجعة الجولة 4) ── */
test("monthsList: شهر واحد يعود كما هو", () => {
  assert.deepStrictEqual(fmt.monthsList(["يوليو 2026"]), "يوليو 2026");
});

test("monthsList: تعادل داخل السنة الواحدة يدمج السنة (يوليو وأغسطس 2026)", () => {
  assert.deepStrictEqual(
    fmt.monthsList(["يوليو 2026", "أغسطس 2026"]),
    "يوليو وأغسطس" + NBSP + "2026");
});

test("monthsList: سنوات مختلفة تُعطف التسميات كاملة", () => {
  assert.deepStrictEqual(
    fmt.monthsList(["ديسمبر 2025", "أغسطس 2026"]),
    "ديسمبر 2025 وأغسطس 2026");
});

test("monthsList: ثلاثة أشهر متعادلة والمفقود شرطة", () => {
  assert.deepStrictEqual(
    fmt.monthsList(["مارس 2026", "أبريل 2026", "مايو 2026"]),
    "مارس وأبريل ومايو" + NBSP + "2026");
  assert.deepStrictEqual(fmt.monthsList([]), "—");
  assert.deepStrictEqual(fmt.monthsList(null), "—");
});
