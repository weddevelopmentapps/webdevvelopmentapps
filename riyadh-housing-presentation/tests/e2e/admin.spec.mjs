/* admin.spec.mjs — دورة الإدارة كاملة بمتصفح حقيقي:
   تهيئة ← دخول ← مسودة ← تحرير ← فحوص ← تنازلات ← نشر ← تاريخ ← تراجع ← تدقيق
   node tests/e2e/admin.spec.mjs */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const URL0 = "file://" + path.join(ROOT, "index.html");

let failures = 0;
function check(name, cond, detail) {
  if (!cond) failures++;
  console.log((cond ? "✓" : "✗"), name, cond ? "" : ("— " + (detail || "")));
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
// حوارات confirm/prompt: قبول مع نص سبب للتنازلات
page.on("dialog", (d) => d.accept(d.type() === "prompt" ? "سبب اختباري موثق للتنازل" : undefined));

const settle = (ms) => page.waitForTimeout(ms || 700);

// ── التهيئة والدخول ──
await page.goto(URL0 + "#/admin", { waitUntil: "load" });
await settle(1100);
check("بوابة الدخول تظهر", await page.locator(".adm-gate-card").count() === 1);
check("وسم الوضع المحلي التجريبي ظاهر في البوابة",
  (await page.locator(".adm-gate-card .sub").textContent()).includes("وضع محلي تجريبي"));
await page.fill(".adm-gate-card input[type=text]", "مدقق الجودة");
await page.fill(".adm-gate-card input[type=password]", "عبارة-مرور-اختبارية-قوية");
await page.click(".adm-gate-card button[type=submit]");
await settle(1200);
check("الدخول يفتح هيكل الإدارة", await page.locator(".adm-shell").count() === 1);
check("شارة الوضع التجريبي في الترويسة", await page.locator(".adm-mode-chip").count() === 1);

// ── فتح مسودة ──
await page.goto(URL0 + "#/admin/meta", { waitUntil: "load" });
await settle(900);
await page.click("text=فتح مسودة للتحرير");
await settle(900);
check("المسودة فُتحت ومحرر البيانات الوصفية ظاهر",
  await page.locator(".adm-card h3", { hasText: "البيانات الوصفية" }).count() === 1);

// ── تحرير وحفظ ──
const notesField = page.locator(".fitem input[type=date]").first();
await notesField.fill("2026-09-01");
await page.click("text=حفظ المسودة");
await settle(600);

// ── المعاينة تعرض بيانات المسودة في عارض المقدِّم ──
await page.goto(URL0 + "#/admin/preview", { waitUntil: "load" });
await settle(1400);
check("إطار المعاينة موجود بمعامل preview=draft",
  (await page.locator(".preview-frame iframe").getAttribute("src")).includes("preview=draft"));

// ── الفحوص والنشر ──
await page.goto(URL0 + "#/admin/publish", { waitUntil: "load" });
await settle(1200);
const gatesText = await page.locator(".adm-card", { hasText: "فحوص الجودة" }).textContent();
check("فحوص الجودة تعمل وتظهر إنذارات", /إنذار/.test(gatesText));
const publishBtn = page.locator("button", { hasText: "نشر إصدار غير قابل للتغيير" });
check("النشر معطل قبل الإقرار بالإنذارات", await publishBtn.isDisabled());

// تسجيل تنازل عن كل إنذار مفتوح
let waiveButtons = page.locator("button", { hasText: "تسجيل تنازل" });
let n = await waiveButtons.count();
check("توجد إنذارات تتطلب تنازلاً (المصدر الاستراتيجي والخطوات...)", n >= 3, "العدد: " + n);
while (n > 0) {
  await waiveButtons.first().click();
  await settle(500);
  waiveButtons = page.locator("button", { hasText: "تسجيل تنازل" });
  n = await waiveButtons.count();
}
await settle(400);
check("النشر أصبح متاحاً بعد الإقرارات",
  !(await page.locator("button", { hasText: "نشر إصدار غير قابل للتغيير" }).isDisabled()));

await page.click("text=نشر إصدار غير قابل للتغيير");
await settle(1500);
check("النشر نقلنا إلى سجل الإصدارات", page.url().includes("/admin/history"));
const relCount = await page.locator(".rel-item").count();
check("السجل يعرض إصدارين (المضمّن + المنشور)", relCount >= 2, "العدد: " + relCount);
check("الإصدار الجديد هو المعروض", await page.locator(".rel-item.current").count() === 1);

// ── المقدِّم يقرأ الإصدار الجديد ──
await page.goto(URL0 + "#/scene/03", { waitUntil: "load" });
await settle(1100);
const badge = await page.locator("#release-badge").textContent();
check("شارة المقدِّم تُظهر النسخة المنشورة محلياً", badge.includes("نسخة منشورة محلياً"), badge);

// ── التراجع ──
await page.goto(URL0 + "#/admin/history", { waitUntil: "load" });
await settle(1000);
await page.click("text=تراجع إلى هذا الإصدار");
await settle(1200);
check("التراجع أنشأ مسودة وفتح صفحة النشر", page.url().includes("/admin/publish"));

// ── سجل التدقيق ──
await page.goto(URL0 + "#/admin/audit", { waitUntil: "load" });
await settle(900);
const audit = await page.locator(".adm-card", { hasText: "سجل التدقيق" }).textContent();
check("التدقيق سجّل الدخول والنشر والتراجع",
  audit.includes("auth.sign_in") && audit.includes("release.publish")
  && audit.includes("release.rollback_draft"));

// ── حارس الأدوار: لا نشر في المقدِّم ──
await page.goto(URL0 + "#/scene/05", { waitUntil: "load" });
await settle(1000);
check("لا أثر لعناصر الإدارة في المقدِّم",
  await page.locator("#stage .adm-card, #stage input, #stage select").count() === 0);

check("لا أخطاء JavaScript في الجولة كلها", errors.length === 0, errors.join(" | "));

await browser.close();
console.log(failures ? `\n✗ ${failures} إخفاقاً` : "\n✓ دورة الإدارة كاملة سليمة");
process.exit(failures ? 1 : 0);
