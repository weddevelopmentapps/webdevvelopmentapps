/* theme-mode.test.mjs — عقد مبدّل السمة (V3_SPEC §1)
   يفحص الملف الحقيقي src/js/core/theme-mode.js داخل سياق vm بمحاكاة
   localStorage/matchMedia/documentElement الدنيا في load-app.mjs. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH, norm, localStorageMock, mediaState, documentElementMock }
  from "./load-app.mjs";

const TM = RH.core.themeMode;

/** قيمة ‎data-theme‎ المكتوبة فعلاً على ‎<html>‎ الوهمي (أو null إن مُسحت) */
const attr = () => documentElementMock.getAttribute("data-theme");

function reset(mode) {
  localStorageMock.clear();
  mediaState.dark = false;
  TM.init();
  if (mode) TM.set(mode);
}

test("الافتراضي auto: لا اختيار محفوظ ولا سمة مكتوبة", () => {
  reset();
  assert.equal(TM.get(), "auto");
  assert.equal(attr(), null);
  assert.equal(localStorageMock.getItem(TM.KEY), null);
});

test("auto يتبع تفضيل النظام: الفاتح افتراضاً والداكن عند طلبه", () => {
  reset();
  mediaState.dark = false;
  assert.equal(TM.effective(), "light", "الفاتح هو الافتراضي (V3_SPEC §1)");
  mediaState.dark = true;
  assert.equal(TM.effective(), "dark");
  mediaState.dark = false;
});

test("الاختيار الصريح يُحفظ في localStorage تحت rh:theme", () => {
  reset();
  TM.set("dark");
  assert.equal(TM.get(), "dark");
  assert.equal(TM.effective(), "dark");
  assert.equal(localStorageMock.getItem("rh:theme"), "dark");
  TM.set("light");
  assert.equal(localStorageMock.getItem("rh:theme"), "light");
});

test("العودة إلى auto تمسح المفتاح المحفوظ", () => {
  reset("dark");
  TM.set("auto");
  assert.equal(TM.get(), "auto");
  assert.equal(localStorageMock.getItem("rh:theme"), null);
});

test("toggle ثنائي ويخرج من auto بأول نقرة", () => {
  reset();
  mediaState.dark = false;
  assert.equal(TM.toggle(), "dark", "من الفاتح التلقائي إلى الداكن الصريح");
  assert.equal(TM.get(), "dark");
  assert.equal(TM.toggle(), "light");
  assert.equal(TM.get(), "light");
});

test("الاختيار الصريح «فاتح» يتقدم على تفضيل النظام الداكن", () => {
  reset();
  mediaState.dark = true;
  TM.set("light");
  assert.equal(TM.effective(), "light");
  mediaState.dark = false;
});

test("init يستعيد الاختيار المحفوظ بعد إعادة التحميل", () => {
  localStorageMock.clear();
  localStorageMock.setItem("rh:theme", "dark");
  TM.init();
  assert.equal(TM.get(), "dark");
  assert.equal(TM.effective(), "dark");
  // قيمة فاسدة في التخزين تُتجاهل بأمان
  localStorageMock.setItem("rh:theme", "neon");
  TM.init();
  assert.equal(TM.get(), "auto");
});

test("وضع غير معروف يُرفض بخطأ صريح", () => {
  reset();
  assert.throws(() => TM.set("sepia"), /وضع سمة غير معروف/);
  assert.deepEqual(norm(TM.MODES), ["light", "dark", "auto"]);
});

test("كل تغيّر يبثّ theme:change بحمولة {mode, effective, previous}", () => {
  reset();
  const seen = [];
  const off = RH.core.bus.on("theme:change", (p) => seen.push(p));
  TM.set("dark");
  TM.set("light");
  TM.set("light");            // بلا تغيّر → بلا بثّ
  off();
  assert.equal(seen.length, 2);
  assert.deepEqual(norm(seen[0]), { mode: "dark", effective: "dark", previous: "light" });
  assert.deepEqual(norm(seen[1]), { mode: "light", effective: "light", previous: "dark" });
});

test("التسمية المعروضة تصف الفعل المقبل لا الحالة الراهنة", () => {
  reset("light");
  assert.match(TM.label(), /الداكنة/);
  TM.set("dark");
  assert.match(TM.label(), /الفاتحة/);
});

test("السمة تُكتب على <html> صراحةً وتُمسح في auto", () => {
  reset();
  assert.equal(attr(), null, "auto لا يكتب سمة — تحكم prefers-color-scheme");
  TM.set("dark");
  assert.equal(attr(), "dark");
  TM.set("light");
  assert.equal(attr(), "light", "الاختيار الصريح يتقدم على تفضيل النظام");
  TM.set("auto");
  assert.equal(attr(), null);
});
