/* navigation.spec.mjs — عقد ملاحة V3 الحي بمتصفح حقيقي
   ══════════════════════════════════════════════════════
   البنية القانونية (V3_SPEC §4): **خمسة تبويبات ومتتبّع أعلى الشاشة**
     ١ الطلب · ٢ التراخيص · ٣ الرقابة · ٤ المبادرات · ٥ مؤشرات الأداء
   وكل ما عداها ملحق ‎#/appendix/*‎. الجذر يفتح ‎#/tab/demand‎ — لا غلاف ولا زر
   «ابدأ العرض»: وضع العرض بالكليكر صار **طبقة اختيارية** فوق التبويبات لا
   البنية الأساسية، ومسارات V2 (‎#/section/*‎ و‎#/scene/*‎) صارت **مسارات قديمة**
   تُحال باستبدال صامت.

   ما يفحصه هذا الملف حرفياً (بوابة القبول في V3_SPEC §7):
     ١) الجذر يهبط على ‎#/tab/demand‎ وقشرة التبويبات هي الوضع الحي.
     ٢) المتتبّع يقود التبويبات الخمسة **بالنقر وبلوحة المفاتيح** معاً
        (أسهم RTL · Home/End · tabindex متجوّل · aria-selected).
     ٣) مبدّل السمة يكتب اختياره ويصمد **عبر إعادة التحميل**.
     ٤) النقرة الأولى تفتح نافذة الإبراز بحدّ ‎320‎ حرفاً و≤3 أرقام وزر واحد،
        والزر يقفز إلى **الملحق الصحيح** بحالة عودة مرمّزة تشير إلى التبويب.
     ٥) العودة من الملحق تعيد التبويب المُنطلَق منه **بمعاملاته حرفياً**.
     ٦) المسارات القديمة ‎#/section/*‎ و‎#/scene/*‎ و‎#/summary‎ تُحال إلى وجهة
        مشروعة (تبويب أو ملحق) — لا شاشة فارغة ولا حلقة رجوع.
     ٧) لا خطأ JavaScript واحد في الجولة كلها.

   node tests/e2e/navigation.spec.mjs — يفشل (exit 1) عند أي إخفاق */
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

/** المحاور الخمسة: المعرف · مُطلِق الإبراز · ملحق الزر المتوقع */
const TABS = [
  { id: "demand", label: "الطلب", trigger: ".tabfig", appendix: "/appendix/demand" },
  { id: "licensing", label: "التراخيص", trigger: ".tabfig", appendix: "/appendix/licensing" },
  { id: "control", label: "الرقابة", trigger: ".tabfig", appendix: "/appendix/monitoring" },
  { id: "initiatives", label: "المبادرات", trigger: ".int-ring-more", appendix: "/appendix/pillar" },
  { id: "kpis", label: "مؤشرات الأداء", trigger: ".kpi5-stat", appendix: "/appendix/kpi" },
];
const IDS = TABS.map((t) => t.id);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const hash = () => page.evaluate(() => window.location.hash);
const settle = (ms) => page.waitForTimeout(ms || 900);
/** يفتح تبويباً من العنوان مباشرة ويترك اللوحة تستقر (رسوم + خرائط) */
async function openTab(id, query) {
  await page.goto(URL0 + "#/tab/" + id + (query ? "?" + query : ""),
    { waitUntil: "load" });
  await settle(1800);
}

/* ════════════════════════ ١) الجذر والقشرة ════════════════════════ */

await page.goto(URL0, { waitUntil: "load" });
await settle(2000);
check("الجذر يهبط على تبويب الطلب", (await hash()).includes("/tab/demand"),
  "الهاش: " + (await hash()));
check("وضع التبويبات هو الوضع الحي على body",
  await page.evaluate(() => document.body.classList.contains("mode-tabs")));
check("قشرة التبويبات مبنية وظاهرة",
  await page.evaluate(() => {
    const r = document.getElementById("tabs-root");
    return !!r && !r.hidden;
  }));
check("المسرح وكروم المقدِّم مخفيان في الوضع الافتراضي",
  await page.evaluate(() => {
    const vis = (id) => {
      const el = document.getElementById(id);
      return !!el && !el.hidden && getComputedStyle(el).display !== "none";
    };
    return !vis("stage") && !vis("hud");
  }));
check("غلاف V2 وزر «ابدأ العرض» لم يعودا في البنية",
  await page.locator(".btn-begin").count() === 0);
check("المتتبّع يحمل المحاور الخمسة بترتيبها القانوني",
  await page.evaluate(() => Array.from(
    document.querySelectorAll(".tabtrack-item")).map((b) => b.dataset.tab)
    .join(",")) === IDS.join(","));
check("لا عناصر تأليف في لوح التبويب (الإدارة وحدها تحرّر)",
  await page.locator(".tab-panel input, .tab-panel textarea, "
    + ".tab-panel select, .tab-panel [contenteditable]").count() === 0);
check("لا تمرير أفقي على الجذر",
  await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth + 2));

/* ════════════════════ ٢) المتتبّع: النقر ثم لوحة المفاتيح ════════════════════ */

for (const t of TABS) {
  await page.click("#tabtrack-" + t.id);
  await settle(1500);
  const state = await page.evaluate((id) => {
    const btn = document.getElementById("tabtrack-" + id);
    const panel = document.querySelector(".tab-panel");
    return {
      hash: location.hash,
      selected: btn && btn.getAttribute("aria-selected"),
      tabindex: btn && btn.getAttribute("tabindex"),
      current: btn && btn.classList.contains("is-current"),
      panelTab: panel && panel.dataset.tab,
      panelId: panel && panel.id,
      labelledBy: panel && panel.getAttribute("aria-labelledby"),
      empty: !panel || !String(panel.textContent || "").trim(),
      missing: !!document.querySelector(".tab-missing"),
      title: document.title,
    };
  }, t.id);
  check("نقر المتتبّع يفتح تبويب «" + t.label + "»",
    state.hash.includes("/tab/" + t.id), "الهاش: " + state.hash);
  check("تبويب «" + t.label + "» يعلن حالته الراهنة للإتاحة",
    state.selected === "true" && state.tabindex === "0" && state.current,
    JSON.stringify(state));
  check("لوح تبويب «" + t.label + "» مربوط بزره ومبني بمحتوى",
    state.panelTab === t.id && state.panelId === "tabpanel-" + t.id
    && state.labelledBy === "tabtrack-" + t.id
    && !state.empty && !state.missing, JSON.stringify(state));
  check("عنوان المستند يتبع التبويب المفتوح",
    state.title.includes(t.label), state.title);
  check("لا تمرير أفقي في تبويب «" + t.label + "»",
    await page.evaluate(() =>
      document.documentElement.scrollWidth <= window.innerWidth + 2));
}

// ── لوحة المفاتيح داخل المتتبّع: RTL فاليسار هو التالي ──
await openTab("demand");
await page.focus("#tabtrack-demand");
for (let i = 1; i < IDS.length; i++) {
  await page.keyboard.press("ArrowLeft");
  await settle(1000);
  check("ArrowLeft يتقدم إلى «" + TABS[i].label + "»",
    (await hash()).includes("/tab/" + IDS[i]), "الهاش: " + (await hash()));
}
check("التركيز يتبع المتتبّع بلوحة المفاتيح",
  await page.evaluate(() => document.activeElement
    && document.activeElement.id === "tabtrack-kpis"));
await page.keyboard.press("ArrowRight");
await settle(1000);
check("ArrowRight يرجع خطوة في المتتبّع",
  (await hash()).includes("/tab/initiatives"), "الهاش: " + (await hash()));
await page.keyboard.press("End");
await settle(1000);
check("End يقفز إلى آخر محور", (await hash()).includes("/tab/kpis"));
await page.keyboard.press("Home");
await settle(1400);
check("Home يعود إلى أول محور", (await hash()).includes("/tab/demand"));
await page.keyboard.press("ArrowRight");
await settle(1000);
check("لفّ المتتبّع دائري من الأول إلى الأخير",
  (await hash()).includes("/tab/kpis"), "الهاش: " + (await hash()));

/* ════════════════════════ ٣) مبدّل السمة ════════════════════════ */

await openTab("demand");
const themeBefore = await page.evaluate(() => RH.core.themeMode.effective());
await page.click("#tabx-theme");
await settle(800);
const themeAfter = await page.evaluate(() => ({
  effective: RH.core.themeMode.effective(),
  attr: document.documentElement.getAttribute("data-theme"),
  stored: window.localStorage.getItem("rh:theme"),
  pressed: document.getElementById("tabx-theme").getAttribute("aria-pressed"),
}));
check("المبدّل يقلب السمة السارية",
  themeAfter.effective !== themeBefore, JSON.stringify(themeAfter));
check("الاختيار الصريح يُكتب على <html> ويُحفظ في التخزين",
  themeAfter.attr === themeAfter.effective
  && themeAfter.stored === themeAfter.effective, JSON.stringify(themeAfter));
check("زر السمة يعلن حالته للإتاحة",
  themeAfter.pressed === (themeAfter.effective === "dark" ? "true" : "false"));
await page.reload({ waitUntil: "load" });
await settle(1800);
const themeReload = await page.evaluate(() => ({
  effective: RH.core.themeMode.effective(),
  attr: document.documentElement.getAttribute("data-theme"),
  paper: getComputedStyle(document.body).backgroundColor,
}));
check("السمة تصمد عبر إعادة التحميل",
  themeReload.effective === themeAfter.effective
  && themeReload.attr === themeAfter.effective, JSON.stringify(themeReload));
check("اللوحة أُعيد صبغها فعلاً بالسمة المحفوظة (لا رموز ميتة)",
  /rgb/.test(themeReload.paper), themeReload.paper);
// إعادة الحال: التبديل مرة أخرى يُرجع السمة الأصلية ويصمد كذلك
await page.click("#tabx-theme");
await settle(700);
await page.reload({ waitUntil: "load" });
await settle(1600);
check("التبديل العكسي يصمد أيضاً عبر إعادة التحميل",
  (await page.evaluate(() => RH.core.themeMode.effective())) === themeBefore);

/* ═══════ ٤+٥) نافذة الإبراز → الملحق الصحيح → العودة إلى التبويب ═══════ */

for (const t of TABS) {
  await openTab(t.id);
  const n = await page.locator(t.trigger).count();
  check("مُطلِق الإبراز " + t.trigger + " موجود في «" + t.label + "»",
    n >= 1, "العدد: " + n);
  if (n < 1) continue;

  await page.locator(t.trigger).first().click();
  await settle(700);
  const hl = await page.evaluate(() => {
    const p = document.querySelector(".hl-panel");
    if (!p) return { open: false };
    const txt = (sel) => {
      const el = p.querySelector(sel);
      return el ? String(el.textContent || "").trim() : "";
    };
    const stats = Array.from(p.querySelectorAll(".hl-stat")).map((li) => ({
      label: String((li.querySelector(".hl-stat-label") || {}).textContent || "").trim(),
      value: String((li.querySelector(".hl-stat-value") || {}).textContent || "").trim(),
    }));
    const chars = txt(".hl-title").length + txt(".hl-sentence").length
      + stats.reduce((a, s) => a + s.label.length + s.value.length, 0);
    // «جملة واحدة»: نقطة ختامية واحدة كحد أقصى (والنقطة العشرية ليست نقطة)
    const stops = (txt(".hl-sentence").match(/\.(?!\d)/g) || []).length;
    return {
      open: true,
      role: p.getAttribute("role"),
      modal: p.getAttribute("aria-modal"),
      chars, stops,
      stats: stats.length,
      buttons: p.querySelectorAll(".hl-go").length,
      cap: RH.highlight.MAX_CHARS,
      maxStats: RH.highlight.MAX_STATS,
    };
  });
  check("النقرة الأولى تفتح نافذة الإبراز في «" + t.label + "»",
    hl.open && hl.role === "dialog" && hl.modal === "true", JSON.stringify(hl));
  if (!hl.open) continue;
  check("إبراز «" + t.label + "» داخل حدّ 320 حرفاً",
    hl.chars <= hl.cap, hl.chars + " حرفاً والحد " + hl.cap);
  check("إبراز «" + t.label + "»: ≤3 أرقام مساندة وزر واحد",
    hl.stats <= hl.maxStats && hl.buttons === 1, JSON.stringify(hl));
  check("إبراز «" + t.label + "»: جملة واحدة لا فقرة",
    hl.stops <= 1, "نقاط: " + hl.stops);

  // النقرة الثانية: الزر يقفز إلى الملحق المختص بحالة عودة مرمّزة
  await page.locator(".hl-go").first().click();
  await settle(1600);
  const inAx = await hash();
  check("زر الإبراز يفتح " + t.appendix + " من «" + t.label + "»",
    inAx.includes(t.appendix), "الهاش: " + inAx);
  check("الملحق يحمل حالة عودة مرمّزة", inAx.includes("return="),
    "الهاش: " + inAx);
  const ret = await page.evaluate(() => {
    const p = RH.core.router.parse();
    return p.params && p.params.return
      ? RH.core.router.decodeReturn(p.params.return) : null;
  });
  check("حالة العودة تشير إلى التبويب المُنطلَق منه لا إلى قسم V2",
    !!ret && ret.kind === "tab" && ret.id === t.id, JSON.stringify(ret));
  check("نافذة الإبراز أُغلقت عند القفز",
    await page.locator(".hl-panel").count() === 0);

  // العودة: زر العودة يعيد التبويب حرفياً
  await page.click(".btn-return");
  await settle(1600);
  check("زر العودة يعيد تبويب «" + t.label + "»",
    (await hash()).includes("/tab/" + t.id), "الهاش: " + (await hash()));
  check("العودة أعادت وضع التبويبات لا المسرح",
    await page.evaluate(() => document.body.classList.contains("mode-tabs")
      && !document.getElementById("tabs-root").hidden));
}

// ── Escape يغلق نافذة الإبراز دون مغادرة التبويب ──
await openTab("demand");
await page.locator(".tabfig").first().click();
await settle(600);
check("نافذة الإبراز مفتوحة قبل Escape",
  await page.locator(".hl-panel").count() === 1);
await page.keyboard.press("Escape");
await settle(500);
check("Escape يغلق نافذة الإبراز ويبقي التبويب",
  (await page.locator(".hl-panel").count()) === 0
  && (await hash()).includes("/tab/demand"), "الهاش: " + (await hash()));

// ── العودة تحفظ **معاملات** التبويب حرفياً (طبقة الخريطة المختارة) ──
await openTab("licensing", "layer=building");
check("معامل التبويب حاضر في العنوان قبل الملحق",
  (await hash()).includes("layer=building"), "الهاش: " + (await hash()));
await page.evaluate(() => RH.presenter.engine.openAppendix("licensing", {}));
await settle(1600);
check("الملحق فُتح من تبويب بمعاملات", (await hash()).includes("/appendix/licensing"));
await page.keyboard.press("Backspace");
await settle(1600);
const backHash = await hash();
check("Backspace يعيد التبويب بمعاملاته حرفياً",
  backHash.includes("/tab/licensing") && backHash.includes("layer=building"),
  "الهاش: " + backHash);

/* ════════════════════ ٦) المسارات القديمة ════════════════════ */

for (const [legacy, target] of [
  // أقسام V2 التي صارت تبويبات
  ["#/section/demand", "/tab/demand"],
  ["#/section/licensing", "/tab/licensing"],
  ["#/section/control", "/tab/control"],
  ["#/section/initiatives", "/tab/initiatives"],
  ["#/section/kpis", "/tab/kpis"],
  // أقسام V2 التي صارت ملاحق
  ["#/section/map", "/appendix/atlas"],
  ["#/section/forecast", "/appendix/scenarios"],
  ["#/section/closing", "/appendix/decisions"],
  // الملخص التنفيذي: لا ملحق مسجَّل باسمه في هذا البناء → التبويب الافتراضي
  ["#/section/summary", "/tab/demand"],
  // مشاهد V1 الرقمية (تمرّ بجدول الموجّه ثم بإحالة التبويبات)
  ["#/scene/00", "/tab/demand"],
  ["#/scene/03", "/tab/demand"],
  ["#/scene/07", "/tab/control"],
  ["#/scene/10", "/tab/kpis"],
  ["#/scene/11", "/appendix/decisions"],
  // مسارات V1 الاسمية
  ["#/summary", "/tab/demand"],
  ["#/supply", "/tab/demand"],
  ["#/licenses", "/tab/licensing"],
  ["#/control", "/tab/control"],
  ["#/initiatives", "/tab/initiatives"],
  // أسماء بديلة ومعرفات مجهولة داخل مسار التبويبات نفسه
  ["#/tab/monitoring", "/tab/control"],
  ["#/tab/kpi", "/tab/kpis"],
  ["#/tab/nonexistent", "/tab/demand"],
]) {
  await page.goto(URL0 + legacy, { waitUntil: "load" });
  await settle(1500);
  check("تحويل " + legacy + " → " + target, (await hash()).includes(target),
    "الهاش: " + (await hash()));
}

// الإحالة **استبدال صامت**: لا إدخال في التاريخ ⇒ لا حلقة رجوع
await page.goto(URL0 + "#/tab/kpis", { waitUntil: "load" });
await settle(1400);
await page.evaluate(() => { window.location.hash = "#/section/demand"; });
await settle(1500);
check("الإحالة من مسار قديم لا تترك أثراً مزدوجاً",
  (await hash()).includes("/tab/demand"), "الهاش: " + (await hash()));
await page.goBack();
await settle(1400);
check("زر رجوع المتصفح يعود إلى التبويب السابق لا إلى مسار محال",
  (await hash()).includes("/tab/kpis"), "الهاش: " + (await hash()));
await page.goForward();
await settle(1400);
check("زر تقدم المتصفح يعمل بعد الرجوع",
  (await hash()).includes("/tab/demand"), "الهاش: " + (await hash()));

/* ════════════ وضع العرض الاختياري: يدخل ويخرج فيعيد التبويب ════════════ */

await openTab("control");
await page.click("#tabx-present");
await settle(1800);
check("زر وضع العرض يغادر قشرة التبويبات إلى المسرح",
  await page.evaluate(() => document.body.classList.contains("mode-present")
    && document.body.classList.contains("mode-presenter")));
await page.keyboard.press("Escape");
await settle(1800);
check("Escape يخرج من وضع العرض ويعيد التبويب المُنطلَق منه",
  (await hash()).includes("/tab/control")
  && await page.evaluate(() => document.body.classList.contains("mode-tabs")),
  "الهاش: " + (await hash()));

/* ════════════════════════ ٧) لا أخطاء صفحة ════════════════════════ */

check("لا أخطاء JavaScript في كل الجولة", errors.length === 0, errors.join(" | "));

await browser.close();
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} اختباراً ناجحاً`);
process.exit(failures ? 1 : 0);
