/* charts-micro.test.mjs — مكتبة الرسوم المصغرة RH.viz.micro (عقد التوسعة §9)
   ────────────────────────────────────────────────────────────────────────
   المكتبة SVG/DOM نقية بلا ECharts ولا canvas، فتُختبر بالملف الحقيقي داخل
   محاكاة DOM الدنيا في load-app.mjs. ما يُثبَت هنا هو ما يعتمد عليه المدقق:
   حالة «لا بيانات» الصادقة (شرطة لا خط صفري)، الفجوات تبقى فجوات، اتجاه
   الزمن RTL، أصناف النغمة الدلالية المقفلة، اتجاه الدلتا حين يكون الارتفاع
   سيئاً (العجز/المخالفات)، والوسم الملازم في شريط النسبة. */
"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { RH, host, textOf, classOf, find, findAll } from "./load-app.mjs";

const M = RH.viz.micro;
const fmt = RH.core.fmt;

/** أصناف عنصر كمصفوفة */
const classes = (el) => classOf(el).split(/\s+/).filter(Boolean);

/** نقاط مسار sparkline: "M12.0,4.0 L3.0,9.0" → [[12,4],[3,9]] */
function pathPoints(pathEl) {
  return pathEl.getAttribute("d").replace(/^M/, "").split(" L")
    .map((p) => p.split(",").map(Number));
}

/* ══════════════════ حالات «لا بيانات» الصادقة ══════════════════ */

test("sparkline بلا قيم يعطي شرطة محايدة لا خطاً صفرياً مختلقاً", () => {
  const el = host();
  M.sparkline(el, { values: [], ariaLabel: "اتجاه التغطية" });
  const empty = find(el, "mcr-empty");
  assert.ok(empty, "لا عنصر mcr-empty");
  assert.equal(textOf(empty), "—");
  assert.equal(findAll(el, "mcr-spark").length, 0, "لا يجوز رسم إطار فارغ");
});

test("سلسلة كلها فجوات = لا بيانات، والوسم يقول ذلك صراحةً", () => {
  const el = host();
  M.sparkline(el, { values: [null, null, null], ariaLabel: "التغطية" });
  const empty = find(el, "mcr-empty");
  assert.equal(empty.getAttribute("role"), "img");
  assert.equal(empty.getAttribute("aria-label"), "التغطية — لا بيانات");
});

test("كل الدوال تعطي الشرطة الصادقة على مدخلات فارغة", () => {
  for (const call of [
    (el) => M.sparkline(el, { values: [] }),
    (el) => M.microBars(el, { items: [] }),
    (el) => M.microBars(el, { items: [{ label: "أ", value: null }] }),
    (el) => M.ratioBar(el, { pct: null }),
    (el) => M.ratioBar(el, { pct: "٨٠" }),
  ]) {
    const el = host();
    call(el);
    assert.ok(find(el, "mcr-empty"), "غابت الشرطة الصادقة");
  }
});

/* ══════════════════ الإتاحة ══════════════════ */

test("ariaLabel يجعل الرسم صورةً مسماة، وغيابه يجعله زخرفياً بصدق", () => {
  const named = host();
  const root = M.sparkline(named, { values: [1, 2, 3], ariaLabel: "الطلب" });
  assert.equal(root.getAttribute("role"), "img");
  assert.equal(root.getAttribute("aria-label"), "الطلب");
  assert.equal(root.getAttribute("aria-hidden"), null);

  const bare = host();
  const root2 = M.sparkline(bare, { values: [1, 2, 3] });
  assert.equal(root2.getAttribute("aria-hidden"), "true");
  assert.equal(root2.getAttribute("role"), null);
});

/* ══════════════════ sparkline ══════════════════ */

test("الفجوة تقطع الخط: نقطة يتيمة تُعلَّم دائرة ولا تُوصل بجارتها", () => {
  const el = host();
  M.sparkline(el, { values: [5, null, 8, 9], ariaLabel: "س" });
  assert.equal(findAll(el, "mcr-spark-line").length, 1, "مقطع متصل واحد فقط");
  assert.equal(findAll(el, "mcr-spark-dot").length, 1, "النقطة اليتيمة بلا علامة");
});

test("مقاطع متعددة لفجوات متعددة — لا وصل عبر الفراغ", () => {
  const el = host();
  M.sparkline(el, { values: [1, 2, null, 4, 5, null, 7, 8], ariaLabel: "س" });
  assert.equal(findAll(el, "mcr-spark-line").length, 3);
});

test("RTL: الفهرس صفر عند أقصى اليمين والزمن يجري يساراً", () => {
  const el = host();
  M.sparkline(el, { values: [1, 2, 3, 4], ariaLabel: "س" });
  const pts = pathPoints(find(el, "mcr-spark-line"));
  assert.equal(pts.length, 4);
  for (let i = 1; i < pts.length; i++) {
    assert.ok(pts[i][0] < pts[i - 1][0], "المحور الزمني ليس RTL");
    assert.ok(pts[i][1] < pts[i - 1][1], "القيم الصاعدة يجب أن ترتفع (ص يقل)");
  }
});

test("سلسلة ثابتة لا تقسم على صفر — خط وسطي أفقي", () => {
  const el = host();
  M.sparkline(el, { values: [7, 7, 7], ariaLabel: "س" });
  const pts = pathPoints(find(el, "mcr-spark-line"));
  for (const p of pts) assert.ok(Number.isFinite(p[1]));
  assert.equal(new Set(pts.map((p) => p[1].toFixed(1))).size, 1);
});

test("خط المستهدف ذهبي ومسمى، والمدى يتسع له فلا يسقط خارج الإطار", () => {
  const el = host();
  M.sparkline(el, {
    values: [10, 12, 11], ariaLabel: "س",
    target: { value: 40, label: "المستهدف" },
    height: 56,
  });
  const t = find(el, "mcr-spark-target");
  assert.ok(t, "لا خط مستهدف");
  const y = Number(t.getAttribute("y1"));
  assert.ok(y >= 0 && y <= 56, "خط المستهدف خارج الإطار: " + y);
  assert.equal(textOf(find(el, "mcr-spark-target-label")), "المستهدف");
});

test("markLast يطبع آخر قيمة فعلية (لا الفجوة) عبر المنسق الممرر", () => {
  const el = host();
  M.sparkline(el, { values: [100, 2500, null], ariaLabel: "س", markLast: true });
  assert.equal(textOf(find(el, "mcr-spark-last")), fmt.int(2500));

  const el2 = host();
  M.sparkline(el2, {
    values: [1.5, 9.25], ariaLabel: "س", markLast: true, fmt: fmt.dec1,
  });
  assert.equal(textOf(find(el2, "mcr-spark-last")), "9.3");
});

test("area يضيف مساحة مغلقة تحت المقطع دون المساس بالخط", () => {
  const el = host();
  M.sparkline(el, { values: [1, 2, 3], ariaLabel: "س", area: true });
  const a = find(el, "mcr-spark-area");
  assert.ok(a);
  assert.ok(a.getAttribute("d").endsWith("Z"), "المساحة غير مغلقة");
  assert.equal(findAll(el, "mcr-spark-line").length, 1);
});

test("viewBox يتبع الأبعاد المنطقية الممررة", () => {
  const el = host();
  const root = M.sparkline(el, { values: [1, 2], ariaLabel: "س", width: 320, height: 80 });
  assert.equal(root.getAttribute("viewBox"), "0 0 320 80");
});

/* ══════════════════ النغمات الدلالية ══════════════════ */

test("النغمات المقفلة تُترجم أصنافاً، وأي نغمة خارجها تسقط إلى المحايد", () => {
  for (const tone of M.TONES) {
    const el = host();
    const root = M.sparkline(el, { values: [1, 2], ariaLabel: "س", tone });
    assert.ok(classes(root).includes("t-" + tone), "النغمة " + tone + " لم تُطبق");
  }
  const el = host();
  const root = M.sparkline(el, { values: [1, 2], ariaLabel: "س", tone: "purple" });
  assert.ok(classes(root).includes("t-neu"), "نغمة غير قانونية لم تسقط إلى المحايد");
  assert.equal(M.TONES.includes("purple"), false);
});

test("النغمة الافتراضية خضراء (طاقة/إيجابي) لا مرجانية", () => {
  const el = host();
  assert.ok(classes(M.sparkline(el, { values: [1, 2], ariaLabel: "س" })).includes("t-pos"));
  const el2 = host();
  assert.ok(classes(M.microBars(el2, {
    items: [{ label: "أ", value: 1 }], ariaLabel: "س",
  })).includes("t-pos"));
});

/* ══════════════════ microBars ══════════════════ */

test("microBars: النسب تُحسب من أقصى قيمة، والقيم تمر بالمنسق", () => {
  const el = host();
  M.microBars(el, {
    ariaLabel: "القطاعات",
    items: [
      { label: "الشمال", value: 1000 },
      { label: "الشرق", value: 500 },
      { label: "الوسط", value: 0 },
    ],
  });
  const fills = findAll(el, "mcr-bar-fill");
  assert.equal(fills.length, 3);
  assert.equal(fills[0].style.width, "100.00%");
  assert.equal(fills[1].style.width, "50.00%");
  assert.equal(fills[2].style.width, "0.00%");
  const vals = findAll(el, "mcr-bar-val").map(textOf);
  assert.deepEqual(vals, ["1,000", "500", "0"]);
  assert.deepEqual(findAll(el, "mcr-bar-label").map(textOf),
    ["الشمال", "الشرق", "الوسط"]);
});

test("microBars: max الممرر يضبط السقف بدل أقصى القيم", () => {
  const el = host();
  M.microBars(el, {
    ariaLabel: "س", max: 2000,
    items: [{ label: "أ", value: 1000 }],
  });
  assert.equal(find(el, "mcr-bar-fill").style.width, "50.00%");
});

test("microBars: القيم فوق السقف تُقصّ عند 100٪ ولا تتجاوز المضمار", () => {
  const el = host();
  M.microBars(el, {
    ariaLabel: "س", max: 100,
    items: [{ label: "أ", value: 400 }, { label: "ب", value: -50 }],
  });
  const fills = findAll(el, "mcr-bar-fill");
  assert.equal(fills[0].style.width, "100.00%");
  assert.equal(fills[1].style.width, "0.00%");
});

test("microBars: نغمة الصف تتقدم على النغمة العامة (العجز مرجاني وحده)", () => {
  const el = host();
  M.microBars(el, {
    ariaLabel: "س", tone: "pos",
    items: [
      { label: "الطاقة", value: 10 },
      { label: "العجز", value: 4, tone: "neg" },
    ],
  });
  const fills = findAll(el, "mcr-bar-fill");
  assert.equal(classes(fills[0]).includes("t-neg"), false);
  assert.ok(classes(fills[1]).includes("t-neg"));
});

test("microBars: الصفوف بلا قيمة رقمية تُستبعد ولا تُرسم صفراً", () => {
  const el = host();
  M.microBars(el, {
    ariaLabel: "س",
    items: [{ label: "أ", value: 10 }, { label: "ب", value: null },
      { label: "ج", value: 5 }],
  });
  assert.equal(findAll(el, "mcr-bar").length, 2);
  assert.deepEqual(findAll(el, "mcr-bar-label").map(textOf), ["أ", "ج"]);
});

test("microBars: منسق مخصص يُحترم (نسب مئوية بدل أعداد صحيحة)", () => {
  const el = host();
  M.microBars(el, {
    ariaLabel: "س", fmt: fmt.pct,
    items: [{ label: "التغطية", value: 43.14 }],
  });
  assert.equal(textOf(find(el, "mcr-bar-val")), fmt.pct(43.14));
});

/* ══════════════════ deltaChip ══════════════════ */

test("deltaChip: الارتفاع أخضر حين يكون جيداً ومرجاني حين لا يكون", () => {
  const up = host();
  M.deltaChip(up, { value: 120 });
  assert.ok(classes(find(up, "mcr-delta")).includes("pos"));

  const upBad = host();
  M.deltaChip(upBad, { value: 120, positiveIsGood: false });   // عجز/مخالفات
  assert.ok(classes(find(upBad, "mcr-delta")).includes("neg"));

  const downBad = host();
  M.deltaChip(downBad, { value: -120 });
  assert.ok(classes(find(downBad, "mcr-delta")).includes("neg"));

  const downGood = host();
  M.deltaChip(downGood, { value: -120, positiveIsGood: false }); // انخفاض العجز
  assert.ok(classes(find(downGood, "mcr-delta")).includes("pos"));
});

test("deltaChip: المقدار مطلق والسهم يحمل الاتجاه، والرقم معزول اتجاهياً", () => {
  const el = host();
  const chip = M.deltaChip(el, { value: -1500 });
  assert.equal(textOf(find(el, "mcr-delta-arrow")), "▼");
  const txt = textOf(chip);
  assert.ok(txt.includes(fmt.iso("1,500")), "الرقم غير معزول اتجاهياً: " + txt);
  assert.equal(txt.includes("−1,500"), false, "المقدار يجب أن يكون مطلقاً");
  assert.equal(find(el, "mcr-delta-arrow").getAttribute("aria-hidden"), "true");
});

test("deltaChip: صفر محايد بلا سهم، وغياب القيمة يعطي الشرطة", () => {
  const zero = host();
  const c0 = M.deltaChip(zero, { value: 0 });
  assert.ok(classes(c0).includes("neu"));
  assert.equal(findAll(zero, "mcr-delta-arrow").length, 0);
  assert.ok(textOf(c0).includes("0"));

  const none = host();
  const cn = M.deltaChip(none, { value: null });
  assert.ok(classes(cn).includes("neu"));
  assert.ok(textOf(cn).includes("—"));
});

test("deltaChip: التسمية والعنوان الاختياريان يُلحقان دون تنسيق يدوي", () => {
  const el = host();
  const chip = M.deltaChip(el, {
    value: 12, label: "عن الأساسي", title: "الفرق عن السيناريو الأساسي",
  });
  assert.equal(textOf(find(el, "mcr-delta-label")), "عن الأساسي");
  assert.equal(chip.getAttribute("title"), "الفرق عن السيناريو الأساسي");
});

/* ══════════════════ ratioBar ══════════════════ */

test("ratioBar: التعبئة بالنسبة والنص عبر fmt.pct افتراضاً", () => {
  const el = host();
  M.ratioBar(el, { pct: 43.14, ariaLabel: "التغطية" });
  assert.equal(find(el, "mcr-ratio-fill").style.width, "43.14%");
  assert.equal(textOf(find(el, "mcr-ratio-val")), fmt.pct(43.14));
});

test("ratioBar: القيم خارج 0–100 تُقصّ بصمت مع عنوان صادق يفصح", () => {
  const over = host();
  const r1 = M.ratioBar(over, { pct: 140, ariaLabel: "س" });
  assert.equal(find(over, "mcr-ratio-fill").style.width, "100.00%");
  assert.ok(String(r1.getAttribute("title")).includes("قُصّت"));
  // النص يبقى القيمة الحقيقية لا المقصوصة — لا تجميل للرقم
  assert.equal(textOf(find(over, "mcr-ratio-val")), fmt.pct(140));

  const under = host();
  M.ratioBar(under, { pct: -20, ariaLabel: "س" });
  assert.equal(find(under, "mcr-ratio-fill").style.width, "0.00%");

  const ok = host();
  const r2 = M.ratioBar(ok, { pct: 50, ariaLabel: "س" });
  assert.equal(r2.getAttribute("title"), null);
});

test("ratioBar: شاخص المستهدف ذهبي بموضعه ووسمه", () => {
  const el = host();
  M.ratioBar(el, {
    pct: 43.1, ariaLabel: "س", target: { pct: 60, label: "المستهدف الاسترشادي" },
  });
  const t = find(el, "mcr-ratio-target");
  assert.equal(t.style.insetInlineStart, "60.00%");
  assert.equal(t.getAttribute("title"), "المستهدف الاسترشادي");
  assert.equal(textOf(find(el, "mcr-ratio-target-label")), "المستهدف الاسترشادي");
});

test("ratioBar: الوسم الملازم يُعرض نصاً كاملاً (منهجية 81.6٪ تمر من هنا)", () => {
  const el = host();
  const note = "قيمة مورّدة — بانتظار اعتماد المنهجية";
  M.ratioBar(el, { pct: 81.6, ariaLabel: "الامتثال", note, tone: "pos" });
  assert.equal(textOf(find(el, "mcr-ratio-note")), note);
  assert.equal(textOf(find(el, "mcr-ratio-val")), fmt.pct(81.6));
});

test("ratioBar: بلا وسم لا يُضاف سطر فارغ", () => {
  const el = host();
  M.ratioBar(el, { pct: 12, ariaLabel: "س" });
  assert.equal(findAll(el, "mcr-ratio-note").length, 0);
});

/* ══════════════════ smallMultiples ══════════════════ */

test("smallMultiples: خلية لكل عنصر ببانٍ يستقبل العنصر وفهرسه", () => {
  const el = host();
  const seen = [];
  const sm = M.smallMultiples(el, {
    items: [{ n: "أ" }, { n: "ب" }, { n: "ج" }],
    ariaLabel: "مقارنة",
    renderCell: (cell, item, i) => { seen.push([item.n, i]); },
  });
  assert.equal(sm.cells.length, 3);
  assert.deepEqual(seen, [["أ", 0], ["ب", 1], ["ج", 2]]);
  assert.equal(sm.el.getAttribute("aria-label"), "مقارنة");
});

test("smallMultiples: الأعمدة الافتراضية 3 حتى ستة عناصر و4 لما فوقها", () => {
  const mk = (n) => {
    const el = host();
    return M.smallMultiples(el, {
      items: Array.from({ length: n }, (_, i) => i),
      renderCell: () => {},
    }).el.style.gridTemplateColumns;
  };
  assert.equal(mk(2), "repeat(2, 1fr)");
  assert.equal(mk(3), "repeat(3, 1fr)");
  assert.equal(mk(6), "repeat(3, 1fr)");
  assert.equal(mk(7), "repeat(4, 1fr)");
  const el = host();
  assert.equal(M.smallMultiples(el, {
    items: [1, 2, 3], cols: 1, renderCell: () => {},
  }).el.style.gridTemplateColumns, "repeat(1, 1fr)");
});

test("smallMultiples: update يعيد البناء بالشبكة نفسها بلا تراكم خلايا", () => {
  const el = host();
  const sm = M.smallMultiples(el, {
    items: [1, 2, 3], renderCell: (cell, v) => { cell.textContent = String(v); },
  });
  assert.equal(sm.cells.length, 3);
  sm.update([9]);
  assert.equal(sm.cells.length, 1);
  assert.equal(sm.el.childNodes.length, 1);
  sm.update([]);
  assert.equal(sm.cells.length, 0);
  assert.ok(find(sm.el, "mcr-empty"), "قائمة فارغة بلا شرطة صادقة");
});

test("smallMultiples: العنوان الاختياري يسبق الشبكة، وغياب البانٍ خطأ صريح", () => {
  const el = host();
  M.smallMultiples(el, { items: [1], title: "الحساسية", renderCell: () => {} });
  assert.equal(textOf(find(el, "mcr-sm-title")), "الحساسية");
  assert.throws(() => M.smallMultiples(host(), { items: [1] }), /renderCell/);
});

/* ══════════════════ عقد المكتبة ══════════════════ */

test("المكتبة تصدّر خمس دوال وقائمة النغمات المقفلة فقط", () => {
  assert.deepEqual(Object.keys(M).sort(),
    ["TONES", "deltaChip", "microBars", "ratioBar", "smallMultiples", "sparkline"]);
  assert.deepEqual([...M.TONES], ["pos", "demand", "neg", "gold", "blue", "neu"]);
});

test("لا دالة تنسق رقماً بنفسها: كل نص قيمة يطابق مخرج RH.core.fmt", () => {
  const el = host();
  M.microBars(el, { ariaLabel: "س", items: [{ label: "أ", value: 1234567 }] });
  assert.equal(textOf(find(el, "mcr-bar-val")), fmt.int(1234567));
  assert.equal(textOf(find(el, "mcr-bar-val")), "1,234,567");
});
