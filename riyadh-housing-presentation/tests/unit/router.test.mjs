/* router.test.mjs — الموجّه: تقابل هوية encodeReturn/decodeReturn على حالات
   معقدة (عربية + معاملات متعددة)، وسلامة base64url في العنوان، وصمود decode
   أمام السلاسل التالفة، وتقابل serialize/parse بما فيه المسارات القديمة. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH, win, historyCalls, norm } from "./load-app.mjs";

const R = RH.core.router;

/* ── encodeReturn / decodeReturn ── */
test("encodeReturn→decodeReturn: تقابل هوية على حالة عربية معقدة", () => {
  const state = {
    kind: "scene",
    id: "05",
    params: { step: "2", sector: "الجنوب", layer: "خريطة توضيحية", note: "عجز ٪" },
  };
  assert.deepStrictEqual(norm(R.decodeReturn(R.encodeReturn(state))), state);
});

test("encodeReturn: ناتج base64url نقي صالح لمعامل هاش", () => {
  const enc = R.encodeReturn({ id: "04", params: { sector: "الشرق", متعدد: "نعم" } });
  assert.match(enc, /^[A-Za-z0-9_-]+$/, "لا + ولا / ولا = في الناتج");
});

test("decodeReturn: سلسلة تالفة أو غير base64 أو JSON فاسد → null", () => {
  assert.deepStrictEqual(R.decodeReturn("%%%غير-صالح%%%"), null);
  assert.deepStrictEqual(R.decodeReturn("!!!"), null);
  assert.deepStrictEqual(R.decodeReturn("YWJj"), null); // base64 صحيح لكن "abc" ليست JSON
  assert.deepStrictEqual(R.decodeReturn(""), null);
});

test("التقابل يصمد عبر دورة العنوان كاملة (ترميز → مسار → تحليل → فك)", () => {
  const state = { kind: "scene", id: "07", params: { step: "1", sector: "الجنوب" } };
  const route = { kind: "appendix", id: "control", params: { page: "2", return: R.encodeReturn(state) } };
  win.location.hash = "#" + R.serialize(route);
  const parsed = R.parse();
  assert.deepStrictEqual(parsed.kind, "appendix");
  assert.deepStrictEqual(parsed.id, "control");
  assert.deepStrictEqual(parsed.params.page, "2");
  assert.deepStrictEqual(norm(R.decodeReturn(parsed.params.return)), state);
});

/* ── serialize / parse ── */
test("serialize→parse: تقابل على مسار مشهد بمعاملات متعددة", () => {
  const route = { kind: "scene", id: "05", params: { step: "2", sector: "south" } };
  const s = R.serialize(route);
  assert.deepStrictEqual(s, "/scene/05?step=2&sector=south");
  win.location.hash = "#" + s;
  assert.deepStrictEqual(norm(R.parse()), route);
});

test("serialize→parse: معاملات عربية تُرمَّز وتعود حرفياً", () => {
  const route = { kind: "scene", id: "04", params: { sector: "الجنوب", ملاحظة: "أ ب" } };
  const s = R.serialize(route);
  assert.match(s, /^[!-~]+$/, "المسار المتسلسل ASCII مطبوع بالكامل (ترميز URI)");
  win.location.hash = "#" + s;
  assert.deepStrictEqual(norm(R.parse()), route);
});

test("serialize: يسقط المعاملات الفارغة، و admin/home يختصر إلى /admin", () => {
  assert.deepStrictEqual(
    R.serialize({ kind: "scene", id: "03", params: { step: null, sector: "" } }),
    "/scene/03");
  assert.deepStrictEqual(R.serialize({ kind: "admin", id: "home", params: {} }), "/admin");
  assert.deepStrictEqual(R.serialize({ kind: "admin", id: "publish", params: {} }), "/admin/publish");
});

test("parse: هاش فارغ أو جذر → المشهد 00", () => {
  win.location.hash = "";
  assert.deepStrictEqual(norm(R.parse()), { kind: "scene", id: "00", params: {} });
  win.location.hash = "#/";
  assert.deepStrictEqual(norm(R.parse()), { kind: "scene", id: "00", params: {} });
});

test("parse: مسار مجهول يسقط بأمان إلى المشهد 00", () => {
  win.location.hash = "#/bogus/route";
  assert.deepStrictEqual(norm(R.parse()), { kind: "scene", id: "00", params: {} });
});

test("parse: ملحق بمعرف مركّب وadmin بتبويب", () => {
  win.location.hash = "#/appendix/lic/detail?page=1";
  assert.deepStrictEqual(norm(R.parse()),
    { kind: "appendix", id: "lic/detail", params: { page: "1" } });
  win.location.hash = "#/admin";
  assert.deepStrictEqual(norm(R.parse()), { kind: "admin", id: "home", params: {} });
});

test("المسارات القديمة تُستبدل (لا إدخال في التاريخ) وتصل لهدفها", () => {
  const before = historyCalls.length;
  win.location.hash = "#/licenses";
  const route = R.parse();
  assert.deepStrictEqual(route.kind, "scene");
  assert.deepStrictEqual(route.id, "05");
  assert.deepStrictEqual(historyCalls.length, before + 1, "استبدال واحد بالضبط");
  assert.deepStrictEqual(historyCalls[historyCalls.length - 1], "#/scene/05");
  // الصيغة بلا شرطة مبدئية تُحوَّل أيضاً
  win.location.hash = "#summary";
  assert.deepStrictEqual(R.parse().id, "02");
});
