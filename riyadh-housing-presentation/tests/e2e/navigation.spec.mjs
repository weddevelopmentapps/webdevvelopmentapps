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

// ── لا أخطاء صفحة ──
check("لا أخطاء JavaScript في كل الجولة", errors.length === 0, errors.join(" | "));

await browser.close();
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} اختباراً ناجحاً`);
process.exit(failures ? 1 : 0);
