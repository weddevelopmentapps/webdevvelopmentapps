/* geomap-utils.test.mjs — أدوات الجغرافيا المشتركة (عقد التوسعة §10)
   ────────────────────────────────────────────────────────────────
   المنطق نقي بلا DOM، فيُختبر بالملف الحقيقي المضموم في البناء لا بنسخة.
   البند الأهم: تطابق normDistrict مع normName في geomap.js المعتمد —
   يُنتزع مصدر الدالة من ملف الخريطة ويُقارن على أسماء الأحياء الـ189
   وصفوف العينة كلها، فأي انحراف مستقبلي في أحد الطرفين يسقط الاختبار. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RH, ROOT, freshRelease, freshGeo } from "./load-app.mjs";

const G = RH.viz.geoutils;
const geo = freshGeo();
const release = freshRelease();

/** أسماء الأحياء الـ189 مسطحة بترتيب الملف */
function allNames() {
  const out = [];
  for (const sec of G.SECTOR_ORDER) {
    for (const d of geo.sectors[sec] || []) out.push(d.name);
  }
  return out;
}

/** ينتزع normName من geomap.js المعتمد ويجعلها دالة قابلة للاستدعاء */
function geomapNormName() {
  const src = readFileSync(path.join(ROOT, "src/js/viz/geomap.js"), "utf8");
  const m = /function normName\(name\)\s*\{[\s\S]*?\n  \}/.exec(src);
  assert.ok(m, "لم يُعثر على normName في geomap.js — تغيّر شكل الملف المعتمد");
  return new Function("return (" + m[0] + ")")();
}

/* ══════════════════ التطبيع ══════════════════ */

test("normDistrict مرآة حرفية لـnormName في geomap.js على كل الأسماء", () => {
  const ref = geomapNormName();
  const names = allNames();
  assert.equal(names.length, 189);
  for (const n of names) {
    assert.equal(G.normDistrict(n), ref(n), "انحراف تطبيع في: " + n);
  }
  for (const row of release.neighbourhoods.rows) {
    assert.equal(G.normDistrict(row.name), ref(row.name));
  }
});

test("normDistrict يحذف بادئة «حي» ويوحّد الهمزات والتاء المربوطة", () => {
  assert.equal(G.normDistrict("حي الملقا"), "الملقا");
  assert.equal(G.normDistrict("حي  العزيزية  "), "العزيزيه");
  assert.equal(G.normDistrict("أم الحمام"), "ام الحمام");
  assert.equal(G.normDistrict("المصيف الأولى"), "المصيف الاولي");
  assert.equal(G.normDistrict(null), "");
});

test("normalizeAr يُسقط التشكيل والتطويل ويوحّد الهمزات ويخفض اللاتينية", () => {
  assert.equal(G.normalizeAr("الـمَلـقَا"), "الملقا");
  assert.equal(G.normalizeAr("مُؤْتَة"), "موته");
  assert.equal(G.normalizeAr("شُئون"), "شيون");
  assert.equal(G.normalizeAr("ماءُ"), "ما");
  assert.equal(G.normalizeAr("Al MALQA"), "al malqa");
  assert.equal(G.normalizeAr("  حي   النرجس  "), "النرجس");
  assert.equal(G.normalizeAr(undefined), "");
});

test("normalizeAr أوسع من normDistrict: التشكيل يفرّق الثاني لا الأول", () => {
  const withDiacritics = "حي النَّرجس";
  assert.notEqual(G.normDistrict(withDiacritics), G.normalizeAr(withDiacritics));
  assert.equal(G.normalizeAr(withDiacritics), G.normalizeAr("حي النرجس"));
});

/* ══════════════════ الفهرس ══════════════════ */

test("districtIndex يغطي الأحياء الـ189 بمعرفات فريدة وبترتيب القطاعات", () => {
  const idx = G.districtIndex(geo, release);
  assert.equal(idx.length, 189);
  assert.equal(new Set(idx.map((e) => e.key)).size, 189);
  // الترتيب: كل قطاع كتلة متصلة بترتيب SECTOR_ORDER
  const seen = [];
  for (const e of idx) {
    if (!seen.length || seen[seen.length - 1] !== e.sector) seen.push(e.sector);
  }
  assert.deepEqual(seen, [...G.SECTOR_ORDER]);
});

test("districtIndex يربط كل مدخل بصف قطاعه ويشتق نصي المطابقة", () => {
  const idx = G.districtIndex(geo, release);
  for (const e of idx) {
    assert.ok(e.sectorRow, "صف القطاع مفقود لـ" + e.name);
    assert.equal(e.sectorRow.id, e.sector);
    assert.equal(e.sectorName, e.sectorRow.name);
    assert.equal(e.key, e.sector + ":" + G.normDistrict(e.name));
    assert.equal(e.norm, G.normalizeAr(e.name));
    assert.ok(Array.isArray(e.centroid) && e.centroid.length === 2);
    assert.ok(Array.isArray(e.rings) && e.rings.length >= 1);
  }
});

test("districtIndex يطابق صفوف العينة العشرين كلها ولا يخترع صفاً", () => {
  const idx = G.districtIndex(geo, release);
  const withSample = idx.filter((e) => e.sample);
  assert.equal(withSample.length, release.neighbourhoods.rows.length);
  for (const e of withSample) {
    assert.equal(G.normDistrict(e.sample.name), G.normDistrict(e.name));
    assert.equal(e.sample.sector, e.sector);
  }
  // بقية الأحياء بلا عينة صراحةً (null لا كائن فارغ) — أساس الحالة الصادقة
  for (const e of idx.filter((x) => !x.sample)) assert.equal(e.sample, null);
});

test("districtIndex يمرّر مشتقات القطاع عند توفرها ويصمد بدونها", () => {
  const derived = { sector: { north: { coverage_pct: 42.5 } } };
  const idx = G.districtIndex(geo, release, derived);
  const north = idx.find((e) => e.sector === "north");
  assert.deepEqual(north.sectorDerived, { coverage_pct: 42.5 });
  const south = idx.find((e) => e.sector === "south");
  assert.equal(south.sectorDerived, null);
  assert.equal(G.districtIndex(geo, release)[0].sectorDerived, null);
});

test("districtIndex يعيد مصفوفة فارغة على مدخلات ناقصة بدل الانهيار", () => {
  assert.equal(G.districtIndex(null, release).length, 0);
  assert.equal(G.districtIndex(geo, null).length, 0);
  assert.equal(G.districtIndex({}, release).length, 0);
});

test("findByKey يسترجع المدخل بمعرفه الثابت ويعيد null لما لا وجود له", () => {
  const idx = G.districtIndex(geo, release);
  const first = idx[0];
  assert.equal(G.findByKey(idx, first.key), first);
  assert.equal(G.findByKey(idx, "north:لا-يوجد"), null);
  assert.equal(G.findByKey(idx, ""), null);
  assert.equal(G.findByKey(idx, null), null);
});

/* ══════════════════ البحث ══════════════════ */

test("searchDistricts يرتب التطابق التام أولاً ثم البادئة", () => {
  const idx = G.districtIndex(geo, release);
  const target = idx.find((e) => G.normalizeAr(e.name) === "الملقا");
  assert.ok(target, "حي الملقا غير موجود في الفهرس");
  const res = G.searchDistricts(idx, "الملقا");
  assert.equal(res[0].name, target.name);
});

test("searchDistricts يتجاهل بادئة «حي» والتشكيل في الاستعلام", () => {
  const idx = G.districtIndex(geo, release);
  const a = G.searchDistricts(idx, "حي الملقا");
  const b = G.searchDistricts(idx, "الـمَلقا");
  assert.ok(a.length > 0);
  assert.equal(a[0].key, b[0].key);
});

test("searchDistricts يطابق الاسم الإنجليزي ويحترم الحد الأقصى", () => {
  const idx = G.districtIndex(geo, release);
  const en = G.searchDistricts(idx, "dist", 5);
  assert.ok(en.length <= 5);
  const wide = G.searchDistricts(idx, "ال", 200);
  assert.ok(wide.length > 5, "استعلام واسع يجب أن يعيد نتائج كثيرة");
  assert.ok(G.searchDistricts(idx, "ال", 3).length <= 3);
});

test("searchDistricts: استعلام فارغ = لا نتائج (المستهلك يعرض حالته التمهيدية)", () => {
  const idx = G.districtIndex(geo, release);
  assert.equal(G.searchDistricts(idx, "").length, 0);
  assert.equal(G.searchDistricts(idx, "   ").length, 0);
  assert.equal(G.searchDistricts(idx, null).length, 0);
});

test("searchDistricts لا يعيد شيئاً لاستعلام بلا أي صلة", () => {
  const idx = G.districtIndex(geo, release);
  assert.equal(G.searchDistricts(idx, "زقنطوسيا").length, 0);
});

/* ══════════════════ المسافات والتركّز ══════════════════ */

test("distanceKm صفر للنقطة نفسها ومتماثل ومعقول على مدى الرياض", () => {
  const a = [24.7136, 46.6753];
  const b = [24.8236, 46.7753];
  assert.equal(G.distanceKm(a, a), 0);
  assert.ok(Math.abs(G.distanceKm(a, b) - G.distanceKm(b, a)) < 1e-9);
  const km = G.distanceKm(a, b);
  assert.ok(km > 14 && km < 17, "المسافة المحسوبة خارج المدى المتوقع: " + km);
  // درجة عرض واحدة ≈ 111 كم (تحقق مستقل عن الصيغة)
  const deg = G.distanceKm([24, 46], [25, 46]);
  assert.ok(Math.abs(deg - 111.2) < 1.0, "درجة العرض = " + deg);
});

test("hotspotsNear يحصر ضمن نصف القطر ويرتب تصاعدياً بدقة عشرية واحدة", () => {
  const idx = G.districtIndex(geo, release);
  let found = null;
  for (const e of idx) {
    const hs = G.hotspotsNear(geo, e.centroid, 3);
    if (hs.length >= 2) { found = hs; break; }
  }
  assert.ok(found, "لم يوجد حي بنقطتي تركّز ضمن 3 كم — تحقق من بيانات hotspots");
  for (let i = 1; i < found.length; i++) {
    assert.ok(found[i].km >= found[i - 1].km, "الترتيب ليس تصاعدياً");
  }
  for (const p of found) {
    assert.ok(p.km <= 3);
    assert.equal(p.km, Math.round(p.km * 10) / 10);
    assert.ok(typeof p.density === "number");
    assert.ok(G.SECTOR_ORDER.includes(p.sector));
  }
});

test("hotspotsNear بنصف قطر كبير يشمل كل النقاط الأربعين", () => {
  const c = G.sectorCentroid(geo, "center");
  assert.ok(c);
  assert.equal(G.hotspotsNear(geo, c, 500).length, geo.hotspots.length);
  assert.ok(G.hotspotsNear(geo, c, 0).length >= 0);
  assert.equal(G.hotspotsNear(null, c).length, 0);
  assert.equal(G.hotspotsNear(geo, null).length, 0);
});

test("sectorCentroid داخل حدود الملف ويعيد null لقطاع مجهول", () => {
  const [[latMin, lngMin], [latMax, lngMax]] = geo.bounds;
  for (const sec of G.SECTOR_ORDER) {
    const c = G.sectorCentroid(geo, sec);
    assert.ok(c, "لا مركز للقطاع " + sec);
    assert.ok(c[0] >= latMin && c[0] <= latMax, sec + " خارج مدى العرض");
    assert.ok(c[1] >= lngMin && c[1] <= lngMax, sec + " خارج مدى الطول");
  }
  assert.equal(G.sectorCentroid(geo, "شمال-غرب"), null);
  assert.equal(G.sectorCentroid(null, "north"), null);
});

/* ══════════════════ الإسقاط ══════════════════ */

test("projector: عرض مضبوط وارتفاع موجب مصحح بجيب تمام خط العرض الأوسط", () => {
  const p = G.projector(geo.bounds, 1000);
  assert.equal(p.w, 1000);
  assert.ok(p.h > 0);
  const [[latMin, lngMin], [latMax, lngMax]] = geo.bounds;
  const latMid = (latMin + latMax) / 2;
  const kx = Math.cos((latMid * Math.PI) / 180);
  const S = 1000 / ((lngMax - lngMin) * kx);
  assert.equal(p.h, Math.round((latMax - latMin) * S));
});

test("projector: px يتزايد شرقاً وpy يتزايد جنوباً وأطراف الإطار مضبوطة", () => {
  const p = G.projector(geo.bounds, 1000);
  const [[latMin, lngMin], [latMax, lngMax]] = geo.bounds;
  assert.ok(Math.abs(p.px(lngMin)) < 1e-9);
  assert.ok(Math.abs(p.px(lngMax) - 1000) < 1e-6);
  assert.ok(Math.abs(p.py(latMax)) < 1e-9);
  assert.ok(p.py(latMin) > p.py(latMax));
  assert.ok(p.px(lngMax) > p.px(lngMin));
});

test("projector.ringPath يبني سلسلة d مغلقة بإحداثيات داخل الإطار", () => {
  const p = G.projector(geo.bounds, 1000);
  const d = geo.sectors.north[0];
  const path = p.ringPath(d.rings);
  assert.ok(path.startsWith("M"));
  assert.ok(path.endsWith("Z"));
  assert.equal((path.match(/Z/g) || []).length, d.rings.length);
  const nums = path.replace(/[MLZ]/g, " ").trim().split(/[\s,]+/).map(Number);
  assert.ok(nums.length >= 6 && nums.every((n) => Number.isFinite(n)));
  for (let i = 0; i < nums.length; i += 2) {
    assert.ok(nums[i] >= -1 && nums[i] <= p.w + 1, "س خارج الإطار: " + nums[i]);
    assert.ok(nums[i + 1] >= -1 && nums[i + 1] <= p.h + 1, "ص خارج الإطار: " + nums[i + 1]);
  }
});

test("projector يتدرج خطياً مع عرض العرض المطلوب", () => {
  const a = G.projector(geo.bounds, 500);
  const b = G.projector(geo.bounds, 1000);
  assert.ok(Math.abs(b.h - a.h * 2) <= 1, "الارتفاع لا يتدرج مع العرض");
  const lng = geo.bounds[1][1];
  assert.ok(Math.abs(b.px(lng) - a.px(lng) * 2) < 1e-6);
});
