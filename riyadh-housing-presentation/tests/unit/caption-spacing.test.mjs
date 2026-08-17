/* ════════════════════════════════════════════════════════════════════════════
   caption-spacing.test.mjs — بوابة القبول ضد «المسافات المفقودة» في الوسوم
   المركّبة (رقم + كلمة عربية) عبر التبويبات الخمسة.
   ────────────────────────────────────────────────────────────────────────────
   الخطأ الجذري الذي تحرسه هذه البوابة:
     كان العزل الاتجاهي في ‎RH.core.fmt.iso‎ يستعمل LRI‏ (\u2066) دائماً، وLRI
     يفرض أساساً **يسارياً** على محتواه. فإن حوت العبارة كلمةً عربية («0 من 14»)
     انقلب ترتيب مقاطعها بصرياً («من 14 0»)، فبدت الأرقام ملتصقة بالكلمات بلا
     مسافة وبلا معنى. الإصلاح: FSI‏ (\u2068) للعبارة المختلطة، وLRI للمقطع
     الرقمي/اللاتيني المحض، ومقاطع «تسمية + قيمة + وحدة» تُبنى حصراً من
     ‎fmt.seg‎/‎fmt.caption‎/‎fmt.ofTotal‎ بفواصل صريحة.

   ما تفحصه البوابة:
     ١) عقد المُعِينات المشتركة (‎iso‎/‎seg‎/‎caption‎/‎ofTotal‎).
     ٢) كل نص يخرج من النماذج النقية للتبويبات الخمسة (عناوين الإبراز وجُمَلها
        وإحصاءاتها ووسومها + الأرقام الكبرى + وسوم المجموعات): لا رقم يلاصق
        حرفاً عربياً ولا حرف عربي يلاصق رقماً بعد إسقاط محارف التحكم الصفرية.
        الصيغ المختصرة المعتمدة («1.42 مليون») تمر لأنها مفصولة بفراغ أصلاً.
     ٣) لا عزل LRI يحيط بعبارة فيها حرف عربي (منع تكرار الخطأ الجذري نفسه).
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import { RH, ROOT, freshRelease, freshGeo } from "./load-app.mjs";

/* التبويبات الخمسة تُنفَّذ على RH ذاتها؛ سجل وهمي يبتلع التسجيل فلا تلزم القشرة */
RH.tabs = { captured: [], register(def) { this.captured.push(def); } };
for (const f of ["t1-demand", "t2-licensing", "t3-monitoring",
  "t4-initiatives", "t5-kpis"]) {
  const file = path.join(ROOT, "src/js/presenter/tabs", f + ".js");
  new Function("RH", readFileSync(file, "utf8"))(RH);
}

const fmt = RH.core.fmt;
const NB = fmt.NBSP;

/* نموذج كل تبويب: بعضها مكشوف على tabModels وبعضها على تعريف التسجيل وحده */
const M = {};
for (const def of RH.tabs.captured) {
  M[def.id] = def.model || (RH.presenter.tabModels || {})[def.id];
}
Object.assign(M, RH.presenter.tabModels || {}, M);

const rel = freshRelease();
const der = RH.data.derive.compute(rel);
const geo = freshGeo();
const index = RH.viz.geoutils.districtIndex(geo, rel, der);

/* ── القواعد المعجمية للفحص ─────────────────────────────────────────────────
   • حرف عربي: الأبجدية والصور العرضية — **بلا** الأرقام الهندية ولا العلامات.
   • ذيل رقمي: خانة لاتينية أو علامة نسبة (٪/%) تُلحق بالرقم فتكمّله.
   • محارف التحكم الاتجاهية صفرية العرض تُسقط قبل الفحص: البصر لا يراها،
     فإن كانت هي كل ما يفصل رقماً عن كلمة فالفاصل غير موجود فعلياً. */
const AR_LETTER = "\u0620-\u064A\u066E-\u06D3\u06FA-\u06FF\uFB50-\uFDFF\uFE70-\uFEFC";
const BIDI_CTRL = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const NUM_THEN_AR = new RegExp("[0-9\u066A%][" + AR_LETTER + "]");
const AR_THEN_NUM = new RegExp("[" + AR_LETTER + "][0-9]");
const LRI_OVER_ARABIC = new RegExp("\u2066[^\u2069]*[" + AR_LETTER + "]");

/* الالتصاقات **المعتمدة** في العربية الفصيحة — تُستثنى صراحة لا ضمناً، وكلها
   لصق نحوي صحيح لا وسم مركّب مكسور:
     • سابقة من حرف واحد (بتطويل اختياري) تسبق الرقم: «و100.0٪» · «بـ14 مؤشراً»
     • اختصار وحدة قصير يلي الرقم عند حدّ كلمة كما ورد في المصدر: «6م» · «12كم»
   الصيغ التنفيذية المختصرة («1.42 مليون») مفصولة بفراغ أصلاً فلا تحتاج استثناء. */
const AR_PROCLITIC = new RegExp("(^|[\\s(\u00AB\u2014\u00B7:\u060C])([\u0648\u0641\u0628\u0644\u0643]\u0640?)(?=[0-9])", "g");
const AR_UNIT_ABBR = new RegExp("([0-9])(\u0643\u0645|\u0645|\u0643)(?![" + AR_LETTER + "])", "g");

/** كل خرق تباعد في نص واحد — يعيد قائمة أسباب (فارغة = سليم) */
function spacingFaults(text) {
  const s = String(text);
  const faults = [];
  if (LRI_OVER_ARABIC.test(s)) {
    faults.push("عزل LRI يحيط بعبارة فيها حرف عربي (يقلب ترتيبها بصرياً)");
  }
  const bare = s.replace(BIDI_CTRL, "")
    .replace(AR_PROCLITIC, "$1")
    .replace(AR_UNIT_ABBR, "$1");
  if (NUM_THEN_AR.test(bare)) faults.push("رقم ملاصق لحرف عربي بلا فاصل");
  if (AR_THEN_NUM.test(bare)) faults.push("حرف عربي ملاصق لرقم بلا فاصل");
  return faults;
}

/** يجمع كل النصوص من بنية متداخلة (يتخطى الدوال والعناصر غير النصية) */
function harvest(node, out, seen) {
  if (node == null) return out;
  if (typeof node === "string") { if (node) out.push(node); return out; }
  if (typeof node !== "object") return out;
  if (seen.has(node)) return out;
  seen.add(node);
  if (Array.isArray(node)) {
    for (const v of node) harvest(v, out, seen);
    return out;
  }
  for (const k of Object.keys(node)) harvest(node[k], out, seen);
  return out;
}

/** كل نصوص تبويب واحد بعنوان يُسمّيه في رسالة الفشل */
function textsOf(payload) {
  return harvest(payload, [], new Set());
}

function assertClean(label, texts) {
  const bad = [];
  for (const t of texts) {
    const faults = spacingFaults(t);
    if (faults.length) bad.push(JSON.stringify(t) + " ← " + faults.join(" · "));
  }
  assert.deepStrictEqual(bad, [], label + ": وسوم مركّبة بلا فاصل\n" + bad.join("\n"));
}

/* ══════════════════════════════════════════════════════════════════════════
   ١) عقد المُعِينات المشتركة
   ══════════════════════════════════════════════════════════════════════════ */

test("iso: LRI للمقطع الرقمي المحض وFSI للعبارة المختلطة", () => {
  assert.equal(fmt.iso("1,420,000"), "\u2066" + "1,420,000" + "\u2069");
  assert.equal(fmt.iso("rel-2026-08-16-001"),
    "\u2066" + "rel-2026-08-16-001" + "\u2069");
  /* العبارة المختلطة تأخذ «أول قوي» فيبقى أساسها عربياً */
  assert.equal(fmt.iso("0 من 14"), "\u2068" + "0 من 14" + "\u2069");
  /* ولا تُعزل مرتين */
  assert.equal(fmt.iso(fmt.iso("43.1")), fmt.iso("43.1"));
  assert.equal(fmt.iso(fmt.pct(43.1)), fmt.pct(43.1));
  assert.equal(fmt.iso(""), "");
});

test("seg: «تسمية + قيمة + وحدة» بفواصل صريحة وعزل حول القيمة وحدها", () => {
  const s = fmt.seg({ label: "الياقات الزرقاء", value: fmt.int(1164400), unit: "سرير" });
  assert.equal(s, "الياقات الزرقاء" + NB + fmt.iso("1,164,400") + NB + "سرير");
  assert.deepStrictEqual(spacingFaults(s), []);
  /* الحقول الغائبة لا تُخلّف فراغاً مزدوجاً ولا فاصلاً يتيماً */
  assert.equal(fmt.seg({ value: fmt.int(12) }), fmt.iso("12"));
  assert.equal(fmt.seg({ label: "المجموع" }), "المجموع");
  assert.equal(fmt.seg(""), "");
  assert.equal(fmt.seg(null), "");
  /* النص الجاهز يمر كما هو (النسبة معزولة سلفاً) */
  assert.equal(fmt.seg(fmt.pct(82)), fmt.pct(82));
});

test("caption: ضمّ المقاطع بفاصل ظاهر — لا لصق ولا فاصل يتيم", () => {
  const c = fmt.caption([{ value: fmt.int(1164400), unit: "سرير" }, fmt.pct(82)]);
  assert.equal(c, fmt.iso("1,164,400") + NB + "سرير" + " \u00B7 " + fmt.pct(82));
  assert.deepStrictEqual(spacingFaults(c), []);
  assert.equal(fmt.caption([null, "", { label: "الإجمالي" }]), "الإجمالي");
  assert.equal(fmt.caption(["أ", "ب"], " و"), "أ وب");
});

test("ofTotal: «n من N» عبارة واحدة معزولة بأساس عربي", () => {
  const t = fmt.ofTotal(0, 14);
  assert.equal(t, "\u2068" + "0 من 14" + "\u2069");
  assert.deepStrictEqual(spacingFaults(t), []);
  assert.equal(fmt.ofTotal(1, 6), "\u2068" + "1 من 6" + "\u2069");
  /* لا عزل يساري يبتلع العبارة العربية — ذلك بعينه هو الخطأ الجذري */
  assert.ok(!t.startsWith("\u2066"));
  assert.equal(fmt.ofTotal(1164400, 1420000), "\u2068" + "1,164,400 من 1,420,000" + "\u2069");
});

test("الصيغة التنفيذية المختصرة مفصولة بفراغ فتمر البوابة", () => {
  assert.deepStrictEqual(spacingFaults(fmt.compact(1420000)), []);
  assert.deepStrictEqual(spacingFaults(fmt.compact(612400)), []);
  assert.deepStrictEqual(spacingFaults(fmt.unitAfter(612400, "سرير")), []);
  assert.deepStrictEqual(spacingFaults(fmt.noun(8, "initiative")), []);
  assert.deepStrictEqual(spacingFaults(fmt.date("2026-08-11")), []);
  /* اللصق النحوي المعتمد يمر: سابقة الحرف الواحد واختصار الوحدة */
  assert.deepStrictEqual(spacingFaults("\u0645\u0633\u062A\u0647\u062F\u0641\u0627\u062A \u0628\u064A\u0646 30.0\u066A \u0648100.0\u066A"), []);
  assert.deepStrictEqual(spacingFaults("\u0628\u0640\u0661\u0664 \u0645\u0624\u0634\u0631\u0627\u064B".replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))), []);
});

test("البوابة نفسها تلتقط الخطأ الجذري لو عاد", () => {
  /* الصياغة المعطوبة القديمة: LRI حول عبارة فيها كلمة عربية */
  assert.notDeepStrictEqual(spacingFaults("\u2066" + "0 من 14" + "\u2069"), []);
  /* واللصق الصريح */
  assert.notDeepStrictEqual(spacingFaults("الياقات الزرقاء1,164,400 سرير"), []);
  assert.notDeepStrictEqual(spacingFaults("82.0٪من إجمالي الطلب"), []);
  assert.notDeepStrictEqual(spacingFaults("16.7٪من 6"), []);
});

/* ══════════════════════════════════════════════════════════════════════════
   ٢) مسح التبويبات الخمسة — كل نص يخرج من النماذج النقية
   ══════════════════════════════════════════════════════════════════════════ */

test("تبويب الطلب: كل وسم مركّب مفصول", () => {
  assertClean("t1-demand", textsOf([
    M.demand.figures(rel, der),
    M.demand.allSpecs(rel, der),
    M.demand.collarSplit(rel, der),
    M.demand.sectorsByDemand(rel, der),
    M.demand.topActivities(rel.economic_activities, M.demand.TOP_N, M.demand.AGG_ID),
  ]));
});

test("تبويب التراخيص: كل وسم مركّب مفصول", () => {
  assertClean("t2-licensing", textsOf([
    M.licensing.totals(rel, der),
    M.licensing.series(rel),
    M.licensing.allHighlightSpecs(rel, der, index),
  ]));
});

test("تبويب الرقابة: كل وسم مركّب مفصول", () => {
  assertClean("t3-monitoring", textsOf([
    M.monitoring.figures(rel),
    M.monitoring.violationRows(rel, M.monitoring.TOP_N),
    M.monitoring.sectorRows(rel, der),
    M.monitoring.allHighlightSpecs(rel, der, geo, index),
  ]));
});

test("تبويب المبادرات: كل وسم مركّب مفصول", () => {
  assertClean("t4-initiatives", textsOf([
    M.initiatives.rows(rel),
    M.initiatives.pillars(rel),
    M.initiatives.portfolio(rel),
    M.initiatives.allSpecs(rel),
  ]));
});

test("تبويب مؤشرات الأداء: كل وسم مركّب مفصول", () => {
  assertClean("t5-kpis", textsOf([
    M.kpis.rows(rel),
    M.kpis.summary(rel),
    M.kpis.allSpecs(rel),
  ]));
});

/* ══════════════════════════════════════════════════════════════════════════
   ٣) حراسة المصدر: لا عودة إلى LRI اليدوي حول عبارة عربية في ملفات التبويبات
   ══════════════════════════════════════════════════════════════════════════ */

test("ملفات التبويبات لا تركّب «n من N» يدوياً حول fmt.iso", () => {
  const offenders = [];
  for (const f of ["t1-demand", "t2-licensing", "t3-monitoring",
    "t4-initiatives", "t5-kpis"]) {
    const p = path.join(ROOT, "src/js/presenter/tabs", f + ".js");
    const src = readFileSync(p, "utf8");
    const re = /fmt\.iso\((?:[^()]|\([^()]*\))*\)/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      if (new RegExp("[" + AR_LETTER + "]").test(m[0])) {
        offenders.push(f + ".js: " + m[0]);
      }
    }
  }
  assert.deepStrictEqual(offenders, [],
    "استعمل fmt.ofTotal/fmt.caption بدل تركيب عبارة عربية داخل fmt.iso");
});
