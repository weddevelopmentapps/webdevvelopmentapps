/* navigation.spec.mjs — اختبارات عقد الملاحة الحي (القسم 8) بمتصفح حقيقي
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
const settle = (ms) => page.waitForTimeout(ms || 950);

// ── التحميل الأولي والغلاف ──
await page.goto(URL0, { waitUntil: "load" });
await settle(900);
check("الجذر يفتح الغلاف", (await hash()) === "" || (await hash()).includes("/scene/00"));
check("زر بدء العرض موجود", await page.locator(".btn-begin").count() === 1);
check("لا عناصر تأليف في المقدِّم",
  await page.locator("#stage input, #stage textarea, #stage select, #stage [contenteditable]").count() === 0);

// ── بدء العرض → الأجندة ──
await page.click(".btn-begin");
await settle();
check("بدء العرض يفتح المحاور", (await hash()).includes("/scene/01"));

// ── مفاتيح التالي/السابق ──
await page.keyboard.press("ArrowRight");
await settle();
check("ArrowRight يتقدم إلى 02", (await hash()).includes("/scene/02"));
await page.keyboard.press("Space");
await settle();
check("Space يتقدم إلى 03", (await hash()).includes("/scene/03"));
await page.keyboard.press("PageDown");
await settle();
check("PageDown يدخل خطوة البناء (step=1)", (await hash()).includes("step=1"));
await page.keyboard.press("ArrowDown");
await settle();
check("استنفاد الخطوات ينتقل إلى 04", (await hash()).includes("/scene/04"));
await page.keyboard.press("Backspace");
await settle();
check("Backspace يعود إلى 03 على آخر خطوة",
  (await hash()).includes("/scene/03") && (await hash()).includes("step=1"));
await page.keyboard.press("ArrowUp");
await settle();
check("ArrowUp يعود خطوة داخل المشهد",
  (await hash()).includes("/scene/03") && !(await hash()).includes("step"));

// ── Home/End ──
await page.keyboard.press("End");
await settle(900);
check("End يقفز إلى المشهد الأخير", (await hash()).includes("/scene/11"));
await page.keyboard.press("ArrowRight");
await settle();
check("لا لفّ دائري بعد الأخير", (await hash()).includes("/scene/11"));
await page.keyboard.press("Home");
await settle();
check("Home يعود للغلاف", (await hash()).includes("/scene/00"));

// ── تجاهل المعدِّلات والتكرار ──
await page.keyboard.press("Control+ArrowRight");
await settle(300);
check("توليفة معدَّلة لا تتقدم", (await hash()).includes("/scene/00"));

// ── نقرة الخلفية مقابل العناصر التفاعلية ──
await page.goto(URL0 + "#/scene/03", { waitUntil: "load" });
await settle(900);
// النقر في منطقة حشو المشهد (لا عنصر فوقها) — الهدف .sc ذاته
await page.click(".sc", { position: { x: 30, y: 540 } });
await settle();
check("نقرة خلفية المسرح تتقدم", (await hash()).includes("step=1"),
  "الهاش: " + (await hash()));
await page.goto(URL0 + "#/scene/04", { waitUntil: "load" });
await settle(900);
// نقر عنصر تفاعلي (زر طبقة) يجب ألا يغادر المشهد
await page.click(".layer-steps button:last-child");
await settle();
check("نقر زر طبقة لا يغادر المشهد", (await hash()).includes("/scene/04"));
// Enter على زر مركّز يفعّله ولا يتقدم المشهد
await page.focus(".btn-appendix");
await page.keyboard.press("Enter");
await settle(900);
check("Enter على زر مركّز يفعّله (فتح الملحق) لا يتقدم خطياً",
  (await hash()).includes("/appendix/demand"));

// ── الملحق: حالة العودة الدقيقة ──
await page.goto(URL0 + "#/scene/04?step=1&sector=south", { waitUntil: "load" });
await settle(900);
await page.click(".btn-appendix");
await settle(900);
check("الملحق يفتح بحالة عودة مرمزة",
  (await hash()).includes("/appendix/demand") && (await hash()).includes("return="));
await page.keyboard.press("ArrowRight");
await settle();
check("مفاتيح جهاز التقديم تقلب صفحات الملحق", (await hash()).includes("page=1"));
await page.click(".btn-return");
await settle(900);
const back = await hash();
check("العودة تعيد المشهد بخطوته وقطاعه حرفياً",
  back.includes("/scene/04") && back.includes("step=1") && back.includes("sector=south"));

// ── المسارات القديمة ──
for (const [legacy, target] of [
  ["#/summary", "/scene/02"], ["#/supply", "/scene/03"], ["#/licenses", "/scene/05"],
  ["#/control", "/scene/07"], ["#/initiatives", "/scene/08"],
]) {
  await page.goto(URL0 + legacy, { waitUntil: "load" });
  await settle(700);
  check(`تحويل ${legacy} → ${target}`, (await hash()).includes(target));
}

// ── رجوع/تقدم المتصفح ──
await page.goto(URL0 + "#/scene/02", { waitUntil: "load" });
await settle(700);
await page.keyboard.press("ArrowRight");
await settle();
await page.goBack();
await settle();
check("زر رجوع المتصفح يعمل", (await hash()).includes("/scene/02"));
await page.goForward();
await settle();
check("زر تقدم المتصفح يعمل", (await hash()).includes("/scene/03"));

// ── قفل الانتقال (نقر مزدوج سريع لجهاز التقديم) ──
await page.goto(URL0 + "#/scene/01", { waitUntil: "load" });
await settle(800);
await page.keyboard.press("ArrowRight");
await page.keyboard.press("ArrowRight"); // خلال القفل — يجب أن تُبتلع
await settle(900);
check("قفل الانتقال يمنع القفز المزدوج", (await hash()).includes("/scene/02"),
  "الهاش: " + (await hash()));

// ── لا أخطاء صفحة ──
check("لا أخطاء JavaScript في كل الجولة", errors.length === 0, errors.join(" | "));

await browser.close();
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} اختباراً ناجحاً`);
process.exit(failures ? 1 : 0);
