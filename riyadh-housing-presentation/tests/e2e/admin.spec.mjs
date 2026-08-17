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

/* ════════════════════════════════════════════════════════════════════════════
   حزمة التوسعة §11 — تبويبا الإدارة الجديدان (فحص دخان)
   ────────────────────────────────────────────────────────────────────────────
   يصل الاختبار إليهما بعد النشر والتراجع، فتكون هناك مسودة مفتوحة وإصدار
   منشور معاً — وهي الحالة الوحيدة التي يعمل فيها مقارن الإصدارات فعلياً.
   ══════════════════════════════════════════════════════════════════════════ */

// ── منشئ الموجز: يبني، يستجيب لتغيير الاختيار، ولا يفقد الصفحات الإلزامية ──
await page.goto(URL0 + "#/admin/report", { waitUntil: "load" });
await settle(1400);
check("تبويب منشئ الموجز يُبنى", await page.locator(".adf-pagelist").count() === 1);
const rowCount = await page.locator(".adf-pagerow").count();
check("قائمة صفحات الموجز غير فارغة", rowCount >= 5, "العدد: " + rowCount);
check("توجد صفحة إلزامية لا تُسقط",
  await page.locator(".adf-pagerow.is-mandatory").count() >= 1);
check("زر فتح الموجز يشير إلى مسار الموجز",
  (await page.locator("a.btn-primary", { hasText: "فتح الموجز للطباعة" })
    .getAttribute("href")) === "#/report");
check("معاينة النموذج مبنية", await page.locator(".adf-preview").count() >= 1);

// إسقاط أول صفحة اختيارية يجب أن ينعكس على النموذج العام فوراً
const before = await page.evaluate(() => RH.admin.reportBuilder.selection().length);
/* ملاحظة تنفيذية: القائمة تُعاد بناؤها بعد كل تغيير اختيار، فمُحدِّد «أول
   مربع مؤشَّر» حيٌّ يتحرك مع كل إعادة بناء. نلتقط معرّف عنصر بعينه أولاً ثم
   ننقره مرة واحدة — لا uncheck ذات إعادة محاولة تُسقط الصفحات تباعاً. */
const optId = await page.evaluate(() => {
  const row = document.querySelector(".adf-pagerow:not(.is-mandatory)");
  const box = row && row.querySelector('input[type=checkbox]');
  return box && box.checked ? box.id : null;
});
check("توجد صفحة اختيارية قابلة للإسقاط", !!optId, "المعرّف: " + optId);
if (optId) {
  await page.locator("#" + optId).click();
  await settle(900);
  const after = await page.evaluate(() => RH.admin.reportBuilder.selection().length);
  check("إسقاط صفحة ينقص الاختيار بواحدة", after === before - 1,
    `قبل ${before} بعد ${after}`);
  check("لوحة «ما الذي يفقده هذا الاختيار» تعرض الفاقد",
    (await page.locator(".adf-losshost").textContent()).trim().length > 0);
}
// التوليفة تعيد ضبط الاختيار إلى قيمة معلنة
const presetBtns = page.locator(".adf-presets button, .adm-card button", { hasText: "الكل" });
if (await presetBtns.count() >= 1) {
  await presetBtns.first().click();
  await settle(600);
}
// الاختيار يعبر إلى مسار الموجز فعلاً (لا يبقى حبيس التبويب)
await page.evaluate(() => RH.admin.reportBuilder.setSelection(null));
await settle(300);
check("setSelection(null) يعيد الاختيار الكامل الشرعي",
  await page.evaluate(() => RH.admin.reportBuilder.selection().length) >= 5);

// ── مقارن الإصدارات: يبني فروقاً حقيقية بين المسودة والمنشور ──
await page.goto(URL0 + "#/admin/diff", { waitUntil: "load" });
await settle(1500);
const diffText = await page.locator(".adm-content").textContent();
check("تبويب مقارنة الإصدارات يُبنى", diffText.trim().length > 0);
check("بطاقة هوية الطرفين ظاهرة", await page.locator(".adf-identity").count() === 1);
check("الطرفان معروضان: المنشور والمسودة",
  await page.locator(".adf-side-base").count() === 1
  && await page.locator(".adf-side-draft").count() === 1);
const tallies = await page.locator(".adf-tally").count();
check("عدّادات الفروق معروضة", tallies >= 2, "العدد: " + tallies);
// النموذج النقي يوافق ما يُعرض
const diffModel = await page.evaluate(async () => {
  const draft = await RH.data.store.getDraft();
  if (!draft) return { noDraft: true };
  const rows = RH.admin.diffViewer.diff(RH.data.store.release(), draft);
  // تعديل مُصطنع على نسخة عميقة: النموذج يجب أن يلتقطه صفاً واحداً بمساره
  const mutated = JSON.parse(JSON.stringify(draft));
  mutated.meta.title = String(mutated.meta.title) + " — اختبار الفروق";
  const rows2 = RH.admin.diffViewer.diff(draft, mutated);
  return {
    isArray: Array.isArray(rows),
    n: Array.isArray(rows) ? rows.length : -1,
    n2: Array.isArray(rows2) ? rows2.length : -1,
    path2: rows2 && rows2[0] ? String(rows2[0].path || "") : "",
  };
});
check("نموذج الفروق النقي يعمل خارج DOM ويعيد صفوفاً",
  !diffModel.noDraft && diffModel.isArray && diffModel.n >= 0,
  JSON.stringify(diffModel));
check("النموذج يلتقط تعديلاً مُصطنعاً بمساره الدقيق",
  diffModel.n2 === 1 && /meta\.title/.test(diffModel.path2),
  JSON.stringify(diffModel));
// البحث والتصفية لا يكسران العرض
const search = page.locator(".adf-search").first();
if (await search.count() >= 1) {
  await search.fill("لا-يوجد-مفتاح-بهذا-الاسم-إطلاقاً");
  await settle(700);
  const emptyOk = await page.evaluate(() =>
    document.querySelector(".adm-content").textContent.length > 0);
  check("بحث بلا نتائج يعرض حالة فارغة صادقة لا شاشة بيضاء", emptyOk);
  await search.fill("");
  await settle(600);
}
const groupChips = await page.locator(".adf-groupchip").count();
if (groupChips >= 1) {
  await page.locator(".adf-groupchip").first().click();
  await settle(600);
  check("تصفية المجموعة تبقي العرض قائماً",
    (await page.locator(".adm-content").textContent()).trim().length > 0);
}

// ── حارس الأدوار: لا نشر في المقدِّم ──
await page.goto(URL0 + "#/scene/05", { waitUntil: "load" });
await settle(1000);
check("لا أثر لعناصر الإدارة في المقدِّم",
  await page.locator("#stage .adm-card, #stage input, #stage select").count() === 0);

check("لا أخطاء JavaScript في الجولة كلها", errors.length === 0, errors.join(" | "));

await browser.close();
console.log(failures ? `\n✗ ${failures} إخفاقاً` : "\n✓ دورة الإدارة كاملة سليمة");
process.exit(failures ? 1 : 0);
