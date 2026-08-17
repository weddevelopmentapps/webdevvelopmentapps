/* navigation.spec.mjs — اختبارات عقد الملاحة الحي V2 بمتصفح حقيقي
   التسلسل الخطي القانوني (V2_CONTRACTS §1/§7):
     00 (الغلاف) → summary → demand → licensing → control → map
     → initiatives → kpis (خطوتا بناء) → forecast → closing
   node tests/e2e/navigation.spec.mjs  — يفشل (exit 1) عند أي إخفاق */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const URL0 = "file://" + path.join(ROOT, "index.html");

let failures = 0;
const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail });
  if (!cond) failures++;
  console.log((cond ? "✓" : "✗"), name, cond ? "" : ("— " + (detail || "")));
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const hash = () => page.evaluate(() => window.location.hash);
const settle = (ms) => page.waitForTimeout(ms || 1000);

// ── التحميل الأولي والغلاف ──
await page.goto(URL0, { waitUntil: "load" });
await settle(900);
check("الجذر يفتح الغلاف", (await hash()) === "" || (await hash()).includes("/scene/00"));
check("زر بدء العرض موجود", await page.locator(".btn-begin").count() === 1);
check("لا عناصر تأليف في المقدِّم",
  await page.locator("#stage input, #stage textarea, #stage select, #stage [contenteditable]").count() === 0);

// ── بدء العرض → أول لوحة (الملخص التنفيذي) ──
await page.click(".btn-begin");
await settle(1100);
check("بدء العرض يفتح الملخص التنفيذي", (await hash()).includes("/section/summary"));

// ── مفاتيح التالي عبر التسلسل الخطي ──
await page.keyboard.press("ArrowRight");
await settle();
check("ArrowRight يتقدم إلى العرض والطلب", (await hash()).includes("/section/demand"));
await page.keyboard.press("Space");
await settle();
check("Space يتقدم إلى التراخيص", (await hash()).includes("/section/licensing"));
await page.keyboard.press("PageDown");
await settle();
check("PageDown يتقدم إلى الرقابة", (await hash()).includes("/section/control"));
await page.keyboard.press("ArrowDown");
await settle();
check("ArrowDown يتقدم إلى الخريطة", (await hash()).includes("/section/map"));
await page.keyboard.press("Enter");
await settle(1100);
check("Enter يتقدم إلى المبادرات", (await hash()).includes("/section/initiatives"));
await page.keyboard.press("Backspace");
await settle();
check("Backspace يعود إلى الخريطة", (await hash()).includes("/section/map"));

// ── خطوات البناء (kpis: steps=2) ──
await page.goto(URL0 + "#/section/kpis", { waitUntil: "load" });
await settle(1100);
await page.keyboard.press("ArrowRight");
await settle(700);
check("ArrowRight يدخل خطوة البناء الأولى (step=1)",
  (await hash()).includes("/section/kpis") && (await hash()).includes("step=1"));
await page.keyboard.press("ArrowRight");
await settle(700);
check("ArrowRight يدخل خطوة البناء الثانية (step=2)",
  (await hash()).includes("step=2"));
await page.keyboard.press("ArrowRight");
await settle();
check("استنفاد الخطوات ينتقل إلى السيناريوهات", (await hash()).includes("/section/forecast"));
await page.keyboard.press("Backspace");
await settle();
check("Backspace يعود إلى kpis على آخر خطوة",
  (await hash()).includes("/section/kpis") && (await hash()).includes("step=2"));
await page.keyboard.press("ArrowUp");
await settle(700);
check("ArrowUp يعود خطوة داخل القسم", (await hash()).includes("step=1"));

// ── Home/End ──
await page.keyboard.press("End");
await settle(1100);
check("End يقفز إلى الخاتمة", (await hash()).includes("/section/closing"));
await page.keyboard.press("ArrowRight");
await settle(700);
check("لا لفّ دائري بعد الأخير", (await hash()).includes("/section/closing"));
await page.keyboard.press("Home");
await settle(1100);
check("Home يعود للغلاف", (await hash()).includes("/scene/00"));

// ── تجاهل التوليفات المعدَّلة ──
await page.keyboard.press("Control+ArrowRight");
await settle(300);
check("توليفة معدَّلة لا تتقدم", (await hash()).includes("/scene/00"));

// ── نقرة الخلفية مقابل العناصر التفاعلية ──
await page.goto(URL0 + "#/section/demand", { waitUntil: "load" });
await settle(1100);
// النقر في حشو جسم اللوحة (لا بطاقة فوقه) — الهدف .dash-body ذاته
await page.click(".dash-body", { position: { x: 12, y: 8 } });
await settle();
check("نقرة خلفية المسرح تتقدم إلى التراخيص",
  (await hash()).includes("/section/licensing"), "الهاش: " + (await hash()));
// نقر عنصر تفاعلي (بطاقة مؤشر بدور زر) يجب ألا يقلب القسم
await page.goto(URL0 + "#/section/summary", { waitUntil: "load" });
await settle(1100);
await page.click(".sum-kpi");
await settle(500);
check("نقر بطاقة مؤشر تفاعلية لا يغادر القسم", (await hash()).includes("/section/summary"));
const overlayOpen = await page.locator(".detail-overlay").count();
check("النقرة فتحت طبقة التفاصيل الزجاجية", overlayOpen === 1);
await page.keyboard.press("Escape");
await settle(400);
check("Escape يغلق طبقة التفاصيل دون مغادرة القسم",
  (await page.locator(".detail-overlay").count()) === 0
  && (await hash()).includes("/section/summary"));

// ── الملحق: حالة العودة الدقيقة من قسم بخطوة بناء ──
await page.goto(URL0 + "#/section/kpis?step=1", { waitUntil: "load" });
await settle(1100);
await page.locator(".kpi7-tool.ghost").first().click();
await settle(1000);
check("الملحق يفتح بحالة عودة مرمزة",
  (await hash()).includes("/appendix/kpi") && (await hash()).includes("return="));
await page.keyboard.press("Backspace");
await settle(1000);
const back = await hash();
check("العودة تعيد القسم بخطوته حرفياً",
  back.includes("/section/kpis") && back.includes("step=1"), "الهاش: " + back);

// ── الملحق: تقليب الصفحات بمفاتيح جهاز التقديم وزر العودة ──
await page.goto(URL0 + "#/section/summary", { waitUntil: "load" });
await settle(1100);
await page.locator(".sum-link.ghost").first().click();
await settle(1000);
check("ملحق الطلب يفتح من بطاقة الملخص",
  (await hash()).includes("/appendix/demand") && (await hash()).includes("return="));
await page.keyboard.press("ArrowRight");
await settle(700);
check("مفاتيح جهاز التقديم تقلب صفحات الملحق", (await hash()).includes("page=1"));
await page.click(".btn-return");
await settle(1000);
check("زر العودة يعيد قسم الملخص", (await hash()).includes("/section/summary"));

// ── المسارات القديمة (V1 → V2) ──
for (const [legacy, target] of [
  ["#/summary", "/section/summary"], ["#/supply", "/section/demand"],
  ["#/licenses", "/section/licensing"], ["#/control", "/section/control"],
  ["#/initiatives", "/section/initiatives"],
  ["#/scene/03", "/section/demand"], ["#/scene/07", "/section/control"],
  ["#/scene/10", "/section/kpis"], ["#/scene/11", "/section/closing"],
]) {
  await page.goto(URL0 + legacy, { waitUntil: "load" });
  await settle(800);
  check(`تحويل ${legacy} → ${target}`, (await hash()).includes(target));
}

// ── رجوع/تقدم المتصفح ──
await page.goto(URL0 + "#/section/demand", { waitUntil: "load" });
await settle(900);
await page.keyboard.press("ArrowRight");
await settle();
await page.goBack();
await settle();
check("زر رجوع المتصفح يعمل", (await hash()).includes("/section/demand"));
await page.goForward();
await settle();
check("زر تقدم المتصفح يعمل", (await hash()).includes("/section/licensing"));

// ── قفل الانتقال (نقر مزدوج سريع لجهاز التقديم) ──
await page.goto(URL0 + "#/section/summary", { waitUntil: "load" });
await settle(1000);
await page.keyboard.press("ArrowRight");
await page.keyboard.press("ArrowRight"); // خلال القفل — يجب أن تُبتلع
await settle(1100);
check("قفل الانتقال يمنع القفز المزدوج", (await hash()).includes("/section/demand"),
  "الهاش: " + (await hash()));

// ── حارس قصّ تسميات المحاور عند 1366×768 (إصلاح مراجعة الجولة 2) ──
// بطاقة «سيناريوهات العجز المتوقع» في الملخص كانت تفقد الرقم الأخير من
// علاماتها («91 ألف» بدل «914 ألف») — الحارس يقيس أعرض تسمية فعلية للمحور
// ويؤكد أن قناة العلامات (grid.right ناقص هامش التسمية) تسعها كاملة.
{
  const page2 = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page2.goto(URL0 + "#/section/summary", { waitUntil: "load" });
  await page2.waitForTimeout(1600);
  const clip = await page2.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".dash-card"));
    const card = cards.find((c) =>
      (c.textContent || "").includes("سيناريوهات العجز المتوقع"));
    if (!card) return { err: "لم تُعثر بطاقة السيناريوهات" };
    let inst = null;
    for (const n of [card, ...card.querySelectorAll("*")]) {
      inst = window.echarts.getInstanceByDom(n);
      if (inst) break;
    }
    if (!inst) return { err: "لا مثيل ECharts على المضيف" };
    const opt = inst.getOption();
    const grid = opt.grid && opt.grid[0];
    const yAxis = opt.yAxis && opt.yAxis[0];
    if (!grid || !yAxis) return { err: "لا شبكة/محور في الخيار" };
    let labels = [];
    try {
      labels = inst.getModel().getComponent("yAxis", 0).axis.getViewLabels()
        .map((l) => l.formattedLabel);
    } catch (e) { return { err: "getViewLabels: " + e.message }; }
    const al = yAxis.axisLabel || {};
    const ctx2d = document.createElement("canvas").getContext("2d");
    ctx2d.font = (al.fontSize || 12) + "px '"
      + (al.fontFamily || "IBM Plex Sans Arabic") + "'";
    const maxW = Math.max(...labels.map((t) => ctx2d.measureText(t).width), 0);
    const margin = al.margin == null ? 8 : al.margin;
    const room = (typeof grid.right === "number" ? grid.right : 0) - margin;
    return { labels, maxW: Math.round(maxW), room: Math.round(room) };
  });
  check("علامات محور سيناريوهات الملخص غير مقصوصة عند 1366×768",
    !clip.err && clip.room >= clip.maxW, JSON.stringify(clip));
  await page2.close();
}

/* ════════════════════════════════════════════════════════════════════════════
   حزمة التوسعة — الحالات التي أضافها التكامل
   ────────────────────────────────────────────────────────────────────────────
   القاعدة الحاكمة لكل ما يلي هي عقد §8 نفسه: أي طبقة جديدة (لوحة أوامر، درج
   ملاحظات، وضع موجز، ملحق جديد) يجب ألا تسرق ضغطة جهاز التقديم بعد إغلاقها،
   وألا تقلّب الأقسام خلفها وهي مفتوحة. كل فحص أدناه يثبت طرفَي هذه المعادلة.
   ══════════════════════════════════════════════════════════════════════════ */

// ── لوحة الأوامر: فتح بالاختصار، حجب الكليكر، قفزة، ثم Escape يعيد التحكم ──
await page.goto(URL0 + "#/section/demand", { waitUntil: "load" });
await settle(1200);
await page.keyboard.press("Control+KeyK");
await settle(700);
check("Ctrl+K يفتح لوحة الأوامر",
  (await page.locator('[role="dialog"][aria-modal="true"] .pal-input').count()) === 1);
check("التركيز داخل حقل بحث اللوحة",
  await page.evaluate(() => !!document.activeElement
    && document.activeElement.classList.contains("pal-input")));
// الكليكر لا يقلّب القسم خلف اللوحة المفتوحة (§8): سهم داخل الحقل يتنقّل في
// النتائج فقط، والهاش يبقى على القسم نفسه
await page.keyboard.press("ArrowDown");
await settle(400);
check("لوحة مفتوحة: الكليكر لا يقلّب القسم خلفها",
  (await hash()).includes("/section/demand"), "الهاش: " + (await hash()));
await page.keyboard.press("Escape");
await settle(600);
check("Escape يغلق لوحة الأوامر",
  (await page.locator('[role="dialog"][aria-modal="true"]').count()) === 0);
check("الإغلاق لم يغيّر القسم", (await hash()).includes("/section/demand"));
// أهم فحص: بعد الإغلاق يعود جهاز التقديم فوراً إلى قيادة الملاحة
await page.keyboard.press("ArrowRight");
await settle(1000);
check("بعد Escape يستعيد الكليكر التحكم فوراً",
  (await hash()).includes("/section/licensing"), "الهاش: " + (await hash()));

// ── لوحة الأوامر: القفز إلى وجهة يغيّر المسار فعلاً ويغلق اللوحة ──
await page.goto(URL0 + "#/section/summary", { waitUntil: "load" });
await settle(1200);
await page.keyboard.press("Control+KeyK");
await settle(700);
await page.keyboard.type("الخريطة");
await settle(800);
await page.keyboard.press("Enter");
await settle(1300);
check("Enter في اللوحة يقفز إلى الوجهة",
  (await hash()).includes("/section/map"), "الهاش: " + (await hash()));
check("القفزة أغلقت اللوحة",
  (await page.locator('[role="dialog"][aria-modal="true"]').count()) === 0);
check("الكليكر عامل بعد القفزة", await (async () => {
  await page.keyboard.press("ArrowRight");
  await settle(1000);
  return (await hash()).includes("/section/initiatives");
})(), "الهاش: " + (await hash()));

// ── درج ملاحظات المتحدث: N يفتح ويغلق، والعرض يستمر خلفه (غير حواري) ──
await page.goto(URL0 + "#/section/control", { waitUntil: "load" });
await settle(1200);
await page.keyboard.press("KeyN");
await settle(700);
check("مفتاح N يفتح درج الملاحظات",
  await page.evaluate(() => !!RH.tour && RH.tour.notes.isOpen()));
check("الدرج ليس حوارياً (لا aria-modal)",
  (await page.locator('.tour-notes[aria-modal="true"]').count()) === 0);
// الدرج مفتوح والتركيز خارجه: الكليكر يبقى قائداً للعرض (شرط المتحدث)
await page.keyboard.press("ArrowRight");
await settle(1100);
check("الدرج مفتوح والعرض يستمر بالكليكر",
  (await hash()).includes("/section/map"), "الهاش: " + (await hash()));
check("الدرج تزامن مع القسم الجديد ولم يُغلق",
  await page.evaluate(() => !!RH.tour && RH.tour.notes.isOpen()));
await page.keyboard.press("KeyN");
await settle(600);
check("N يغلق الدرج",
  await page.evaluate(() => !!RH.tour && !RH.tour.notes.isOpen()));

// ── وضع الموجز التنفيذي: دخول من زر HUD، ثم خروج يعيد المقدِّم كاملاً ──
await page.goto(URL0 + "#/section/summary", { waitUntil: "load" });
await settle(1200);
await page.click("#hud-report");
await settle(2200);
check("زر HUD يدخل وضع الموجز", (await hash()).includes("/report"));
check("body في وضع الموجز",
  await page.evaluate(() => document.body.classList.contains("mode-report")));
check("المسرح وشريط HUD مخفيان في الموجز",
  await page.evaluate(() => document.getElementById("stage").hidden
    && document.getElementById("hud").hidden));
check("صفحات الموجز مبنية", (await page.locator(".rpt-page").count()) >= 3);
check("الموجز لا يتعايش مع جذر الإدارة",
  await page.evaluate(() => {
    const a = document.getElementById("admin-root");
    return !a || a.hidden;
  }));
// مفاتيح العرض داخل الموجز لا تقلّب أقسام المسرح خلفه
await page.keyboard.press("ArrowRight");
await settle(700);
check("مفاتيح العرض لا تقلّب المسرح من داخل الموجز",
  (await hash()).includes("/report"), "الهاش: " + (await hash()));
// الخروج: العودة إلى المقدِّم تعيد الكروم والحالة
await page.goBack();
await settle(1600);
check("الخروج من الموجز يعيد المسار السابق",
  (await hash()).includes("/section/summary"), "الهاش: " + (await hash()));
check("العودة أعادت وضع المقدِّم وكروم المسرح",
  await page.evaluate(() => document.body.classList.contains("mode-presenter")
    && !document.getElementById("stage").hidden
    && !document.getElementById("hud").hidden
    && !document.getElementById("release-badge").hidden));
check("الكليكر عامل بعد الخروج من الموجز", await (async () => {
  await page.keyboard.press("ArrowRight");
  await settle(1100);
  return (await hash()).includes("/section/demand");
})(), "الهاش: " + (await hash()));

// ── ملاحق حزمة التوسعة الأربعة: دخول بحالة عودة مرمّزة ثم عودة حرفية ──
for (const [sectionRoute, entrySel, appendixId, backRoute] of [
  ["#/section/map", ".atl-entry", "/appendix/atlas", "/section/map"],
  ["#/section/forecast", ".axs-entry", "/appendix/scenarios", "/section/forecast"],
  ["#/section/closing", ".mth-entry", "/appendix/methodology", "/section/closing"],
]) {
  await page.goto(URL0 + sectionRoute, { waitUntil: "load" });
  await settle(1500);
  const n = await page.locator(entrySel).count();
  check(`زر الدخول ${entrySel} موجود`, n >= 1, "العدد: " + n);
  if (n < 1) continue;
  await page.locator(entrySel).first().click();
  await settle(1600);
  const inAx = await hash();
  check(`${appendixId} يفتح بحالة عودة مرمّزة`,
    inAx.includes(appendixId) && inAx.includes("return="), "الهاش: " + inAx);
  await page.keyboard.press("Backspace");
  await settle(1500);
  check(`العودة من ${appendixId} تعيد ${backRoute}`,
    (await hash()).includes(backRoute), "الهاش: " + (await hash()));
  check(`الكليكر عامل بعد العودة من ${appendixId}`, await (async () => {
    await page.keyboard.press("ArrowRight");
    await settle(1100);
    return !(await hash()).includes(appendixId);
  })(), "الهاش: " + (await hash()));
}

// ملحق القرارات: مدخله الثاني في ترويسة الخاتمة (زر mth-entry الثاني)
await page.goto(URL0 + "#/section/closing", { waitUntil: "load" });
await settle(1500);
const dcsEntries = await page.locator(".mth-entry").count();
check("ترويسة الخاتمة تحمل مدخلَي الإسناد", dcsEntries >= 2, "العدد: " + dcsEntries);
if (dcsEntries >= 2) {
  await page.locator(".mth-entry").nth(1).click();
  await settle(1600);
  const h2 = await hash();
  check("/appendix/decisions يفتح بحالة عودة مرمّزة",
    h2.includes("/appendix/decisions") && h2.includes("return="), "الهاش: " + h2);
  await page.click(".btn-return");
  await settle(1500);
  check("زر العودة من سجل القرارات يعيد الخاتمة",
    (await hash()).includes("/section/closing"), "الهاش: " + (await hash()));
}

// ── تراجع رشيق: مسار الموجز يظل صالحاً بلا وحدته (بناء جزئي محاكى) ──
await page.goto(URL0 + "#/section/summary", { waitUntil: "load" });
await settle(1200);
await page.evaluate(() => { window.__rptShow = RH.report.show; delete RH.report.show; });
await page.evaluate(() => RH.core.router.go({ kind: "report", id: "main", params: {} }));
await settle(1200);
check("غياب وحدة الموجز يحوّل استبدالياً إلى قسم حقيقي لا شاشة فارغة",
  (await hash()).includes("/section/summary")
  && await page.evaluate(() => document.body.classList.contains("mode-presenter")),
  "الهاش: " + (await hash()));
await page.evaluate(() => { RH.report.show = window.__rptShow; });

// ── لا أخطاء صفحة ──
check("لا أخطاء JavaScript في كل الجولة", errors.length === 0, errors.join(" | "));

await browser.close();
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} اختباراً ناجحاً`);
process.exit(failures ? 1 : 0);
