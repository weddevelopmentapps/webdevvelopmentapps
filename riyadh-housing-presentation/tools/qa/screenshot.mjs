#!/usr/bin/env node
/* screenshot.mjs — لقطات المشاهد للمراجعة البصرية وفحص الكونسول
   الاستخدام: node tools/qa/screenshot.mjs [--out DIR] [--routes r1,r2] [--sizes 1920x1080,1366x768]
   يفشل (exit 1) عند أي خطأ كونسول. */
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const args = process.argv.slice(2);
const argOf = (k, dflt) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : dflt;
};
const OUT = path.resolve(argOf("--out", path.join(ROOT, "tools", "qa", "shots")));
const ROUTES = argOf("--routes",
  ["scene/00",
    "section/summary", "section/demand", "section/licensing", "section/control",
    "section/map", "section/initiatives", "section/kpis",
    "section/kpis?step=1", "section/kpis?step=2",
    "section/forecast", "section/closing",
    "appendix/demand", "appendix/monitoring", "appendix/kpi",
    "appendix/pillar", "appendix/licensing",
    // ── حزمة التوسعة: ملاحقها الأربعة الجديدة ──
    "appendix/atlas", "appendix/scenarios",
    "appendix/methodology", "appendix/decisions",
    // ── مركز المقارنة القطاعية: صفحاته الخمس (المصفوفة، بطاقة القطاع،
    //    الفجوة والتركّز، مطابقة المجاميع، الصيغ والمصادر) ──
    "appendix/compare", "appendix/compare?page=1", "appendix/compare?page=2",
    "appendix/compare?page=3", "appendix/compare?page=4",
    // ── حالات لا يبلغها العنوان وحده (تفاعل لازم) — أسماء زائفة يحلّها
    //    جدول PSEUDO أدناه: وضع الموجز، لوحة الأوامر مفتوحة، خطوة جولة،
    //    درج ملاحظات المقدِّم (N)، وتبويبا الإدارة الجديدان (خلف بوابة دخول) ──
    "state/report", "state/report-print",
    "state/palette", "state/tour", "state/notes",
    "state/admin-report", "state/admin-diff"].join(",")).split(",");
const SIZES = argOf("--sizes", "1920x1080,1366x768").split(",")
  .map((s) => s.split("x").map(Number));

fs.mkdirSync(OUT, { recursive: true });
const indexUrl = "file://" + path.join(ROOT, "index.html");

/* ════════════════════════════════════════════════════════════════════════════
   المسارات الزائفة (state/*) — حالات حزمة التوسعة التي لا يبلغها الهاش وحده
   ────────────────────────────────────────────────────────────────────────────
   كلٌّ منها: هاش انطلاق + تهيئة تفاعلية + تأكيدات خاصة بالحالة. تُشغَّل داخل
   حلقة المقاسات ذاتها فتخضع لفحص الكونسول نفسه، وتنتج لقطة مسمّاة كبقية
   المسارات. تخرج التأكيدات بقائمة نصوص أخطاء (فارغة = خضراء).
   ══════════════════════════════════════════════════════════════════════════ */
/* دخول الإدارة (وضع محلي تجريبي): البوابة تطلب اسماً وعبارة مرور عند أول
   تهيئة في سياق متصفح جديد، والعبارة وحدها إن سبقت التهيئة — فنتعامل مع
   الحالتين. لا جلسة قائمة = لا بوابة، فنمرّ بلا عمل. */
async function adminSignIn(page) {
  const errs = [];
  const gate = page.locator(".adm-gate-card");
  if (await gate.count() === 0) return errs;
  const nameIn = gate.locator("input[type=text]");
  if (await nameIn.count() > 0) await nameIn.first().fill("مدقق الجودة");
  await gate.locator("input[type=password]").first().fill("عبارة-مرور-اختبارية-قوية");
  await gate.locator("button[type=submit]").first().click();
  await page.waitForTimeout(1600);
  if (await page.locator(".adm-shell").count() === 0) {
    errs.push("تعذر الدخول إلى الإدارة من البوابة");
  }
  return errs;
}

const PSEUDO = {
  /* وضع الموجز التنفيذي: مستند A4 يتجاوز المسرح كلياً */
  "state/report": {
    hash: "#/report",
    settle: 5000,
    async check(page) {
      return page.evaluate(() => {
        const errs = [];
        if (!document.body.classList.contains("mode-report")) {
          errs.push("وضع الموجز غير مفعّل على body");
        }
        const root = document.getElementById("report-root");
        if (!root || root.hidden) errs.push("جذر الموجز غائب أو مخفي");
        const pages = document.querySelectorAll(".rpt-page");
        if (pages.length < 3) errs.push("صفحات الموجز " + pages.length + " (<3)");
        const stage = document.getElementById("stage");
        if (stage && !stage.hidden) errs.push("المسرح ظاهر في وضع الموجز");
        const hud = document.getElementById("hud");
        if (hud && !hud.hidden) errs.push("شريط HUD ظاهر في وضع الموجز");
        const admin = document.getElementById("admin-root");
        if (admin && !admin.hidden) errs.push("جذر الإدارة يتعايش مع الموجز");
        return errs;
      });
    },
  },

  /* بوابة الطباعة (البند 5): محاكاة media:print على مسار الموجز — لا شيء
     غير المستند مرئي، ولا شريط أدوات، ولا كروم مقدِّم. */
  "state/report-print": {
    hash: "#/report",
    settle: 5000,
    async before(page) { await page.emulateMedia({ media: "print" }); },
    async after(page) { await page.emulateMedia({ media: null }); },
    async check(page) {
      return page.evaluate(() => {
        const errs = [];
        const vis = (el) => {
          if (!el) return false;
          if (el.hidden) return false;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") return false;
          return el.getBoundingClientRect().height > 1;
        };
        // (أ) كل ما ليس الموجز مخفيٌّ فعلياً عند الطباعة
        for (const id of ["stage", "hud", "release-badge", "admin-root"]) {
          if (vis(document.getElementById(id))) errs.push("ظاهر عند الطباعة: #" + id);
        }
        for (const sel of [".rpt-toolbar", ".hudx-palette", ".hudx-report",
          ".tour-bar", ".tour-notes", ".pal-root"]) {
          const el = document.querySelector(sel);
          if (vis(el)) errs.push("ظاهر عند الطباعة: " + sel);
        }
        // (ب) المستند نفسه ظاهر بصفحاته
        const root = document.getElementById("report-root");
        if (!vis(root)) errs.push("مستند الموجز غير مرئي عند الطباعة");
        const pages = Array.from(document.querySelectorAll(".rpt-page")).filter(vis);
        if (pages.length < 3) errs.push("صفحات مرئية عند الطباعة " + pages.length + " (<3)");
        // (ج) لا صفحة تفيض عرضياً عن ورقتها (كسر تخطيط الطباعة)
        for (const p of pages) {
          if (p.scrollWidth > p.clientWidth + 2) {
            errs.push("صفحة موجز تفيض عرضياً: " + (p.className || ""));
          }
        }
        return errs;
      });
    },
  },

  /* لوحة الأوامر مفتوحة فوق لوحة حية (Ctrl+K) */
  "state/palette": {
    hash: "#/section/demand",
    settle: 2600,
    async prepare(page) {
      await page.keyboard.press("Control+KeyK");
      await page.waitForTimeout(700);
      await page.keyboard.type("الرياض");
      await page.waitForTimeout(700);
    },
    async check(page) {
      return page.evaluate(() => {
        const errs = [];
        const dlg = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!dlg) { errs.push("لوحة الأوامر لم تُفتح بـ Ctrl+K"); return errs; }
        const input = dlg.querySelector(".pal-input");
        if (!input) errs.push("حقل بحث اللوحة غائب");
        else if (document.activeElement !== input) {
          errs.push("التركيز ليس في حقل البحث عند الفتح");
        }
        const r = dlg.getBoundingClientRect();
        if (r.bottom > window.innerHeight + 1 || r.top < -1) {
          errs.push("جذر اللوحة خارج إطار العرض رأسياً");
        }
        const list = dlg.querySelector(".pal-list");
        if (list && list.scrollWidth > list.clientWidth + 2) {
          errs.push("قائمة النتائج تفيض عرضياً");
        }
        return errs;
      });
    },
    async after(page) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    },
  },

  /* خطوة من الجولة الموجهة: تنطلق من زر الغلاف ثم تتقدم خطوتين */
  "state/tour": {
    hash: "#/scene/00",
    settle: 3000,
    /* التهيئة تُرجع أخطاءها بنفسها: زر الإطلاق يعيش على الغلاف وحده، وبدء
       الجولة يغادر الغلاف فيُفكَّك مضيفه — فالتأكيد على وجود الزر يجب أن يقع
       قبل النقر لا بعده (وإلا ظُنّ الغياب المشروع خللاً). */
    async prepare(page) {
      const errs = [];
      const launch = page.locator(".tour-launch");
      if (await launch.count() === 0) {
        errs.push("زر إطلاق الجولة غير مركَّب على الغلاف");
        return errs;
      }
      if (!await launch.first().isVisible()) {
        errs.push("زر إطلاق الجولة مركَّب لكنه غير مرئي على الغلاف");
      }
      await launch.first().click();
      await page.waitForTimeout(1600);
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(1600);
      return errs;
    },
    async check(page) {
      return page.evaluate(() => {
        const errs = [];
        if (!document.body.classList.contains("tour-active")) {
          errs.push("الجولة لم تُفعّل (tour-active غائب عن body)");
          return errs;
        }
        const bar = document.querySelector(".tour-bar");
        if (!bar) { errs.push("شريط الجولة غائب"); return errs; }
        const r = bar.getBoundingClientRect();
        if (r.bottom > window.innerHeight + 1) errs.push("شريط الجولة مقصوص أسفل الإطار");
        if (r.left < -1 || r.right > window.innerWidth + 1) {
          errs.push("شريط الجولة مقصوص أفقياً");
        }
        // الجولة قادت المحرك فعلاً: لم نعد على الغلاف
        if (/scene\/00/.test(location.hash)) errs.push("الجولة لم تغادر الغلاف بعد خطوة");
        return errs;
      });
    },
    async after(page) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    },
  },

  /* درج ملاحظات المقدِّم (مفتاح N) فوق لوحة حية — يعمل دون جولة نشطة */
  "state/notes": {
    hash: "#/section/control",
    settle: 3400,
    async prepare(page) {
      await page.keyboard.press("KeyN");
      await page.waitForTimeout(1000);
      return [];
    },
    async check(page) {
      return page.evaluate(() => {
        const errs = [];
        if (!document.body.classList.contains("tour-notes-open")) {
          errs.push("درج الملاحظات لم يُفتح بمفتاح N");
          return errs;
        }
        const dr = document.querySelector(".tour-notes");
        if (!dr || dr.hidden) { errs.push("درج الملاحظات غائب أو مخفي"); return errs; }
        const r = dr.getBoundingClientRect();
        if (r.top < -1 || r.bottom > window.innerHeight + 1) {
          errs.push("درج الملاحظات مقصوص رأسياً");
        }
        if (r.left < -1 || r.right > window.innerWidth + 1) {
          errs.push("درج الملاحظات مقصوص أفقياً");
        }
        const body = dr.querySelector(".tour-notes-body");
        if (body && body.scrollWidth > body.clientWidth + 2) {
          errs.push("جسم الملاحظات يفيض عرضياً");
        }
        if (!dr.querySelector(".tour-notes-title")
          || !String(dr.textContent || "").trim()) {
          errs.push("درج الملاحظات مفتوح لكنه بلا محتوى");
        }
        return errs;
      });
    },
    async after(page) {
      await page.keyboard.press("KeyN");
      await page.waitForTimeout(300);
    },
  },

  /* منشئ الموجز في الإدارة (تبويب #/admin/report) — خلف بوابة الدخول */
  "state/admin-report": {
    hash: "#/admin",
    settle: 1700,
    async prepare(page) {
      const errs = await adminSignIn(page);
      if (errs.length) return errs;
      await page.goto(indexUrl + "#/admin/report", { waitUntil: "load" });
      await page.waitForTimeout(2400);
      return errs;
    },
    async check(page) {
      return page.evaluate(() => {
        const errs = [];
        if (!/admin\/report/.test(location.hash)) {
          errs.push("لم نصل إلى تبويب منشئ الموجز");
        }
        const content = document.querySelector(".adm-content");
        if (!content || !String(content.textContent || "").trim()) {
          errs.push("جسم تبويب منشئ الموجز فارغ");
          return errs;
        }
        const rows = document.querySelectorAll(".adf-pagerow").length;
        if (rows < 3) errs.push("صفوف اختيار صفحات الموجز " + rows + " (<3)");
        if (content.scrollWidth > content.clientWidth + 2) {
          errs.push("جسم منشئ الموجز يفيض عرضياً");
        }
        const stage = document.getElementById("stage");
        if (stage && !stage.hidden) errs.push("المسرح ظاهر داخل الإدارة");
        return errs;
      });
    },
  },

  /* مقارن الإصدارات (تبويب #/admin/diff): يتطلب مسودة مفتوحة — نفتحها من
     الإصدار المنشور بمسار الواجهة نفسه ونجري تعديلاً واحداً موثّقاً على حقل
     تاريخ العرض كي تُرى المقارنة عاملة لا فارغة. المسودة محلية زائلة في سياق
     متصفح اللقطات، ولا تمسّ الإصدار المنشور بحال. */
  "state/admin-diff": {
    hash: "#/admin",
    settle: 1700,
    async prepare(page) {
      const errs = await adminSignIn(page);
      if (errs.length) return errs;
      await page.goto(indexUrl + "#/admin/meta", { waitUntil: "load" });
      await page.waitForTimeout(1400);
      const open = page.locator("button", { hasText: "فتح مسودة للتحرير" });
      if (await open.count() > 0) {
        await open.first().click();
        await page.waitForTimeout(1400);
      }
      const dateField = page.locator(".fitem input[type=date]").first();
      if (await dateField.count() === 0) {
        errs.push("حقل تاريخ العرض غائب عن محرر البيانات الوصفية");
      } else {
        await dateField.fill("2026-09-01");
        await page.locator("button", { hasText: "حفظ المسودة" }).first().click();
        await page.waitForTimeout(1000);
      }
      await page.goto(indexUrl + "#/admin/diff", { waitUntil: "load" });
      await page.waitForTimeout(2400);
      return errs;
    },
    async check(page) {
      return page.evaluate(() => {
        const errs = [];
        if (!/admin\/diff/.test(location.hash)) {
          errs.push("لم نصل إلى تبويب مقارنة الإصدارات");
        }
        const content = document.querySelector(".adm-content");
        if (!content || !String(content.textContent || "").trim()) {
          errs.push("جسم تبويب المقارنة فارغ");
          return errs;
        }
        if (document.querySelectorAll(".adf-identity").length !== 1) {
          errs.push("بطاقة هوية طرفي المقارنة غائبة (لا مسودة مفتوحة؟)");
        }
        if (!document.querySelector(".adf-side-base")
          || !document.querySelector(".adf-side-draft")) {
          errs.push("أحد طرفي المقارنة (المنشور/المسودة) غائب");
        }
        const tallies = document.querySelectorAll(".adf-tally").length;
        if (tallies < 2) errs.push("عدّادات الفروق " + tallies + " (<2)");
        if (content.scrollWidth > content.clientWidth + 2) {
          errs.push("جسم المقارن يفيض عرضياً");
        }
        return errs;
      });
    },
  },
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
let consoleErrors = [];

for (const [w, hgt] of SIZES) {
  const page = await browser.newPage({ viewport: { width: w, height: hgt } });
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    // غياب الوسائط الاختيارية (ملفات شقيقة/CloudFront/بلاطات OSM) مسار بديل
    // مقصود بعقد التدهور الرشيق — أخطاء شبكتها فقط تُتجاهل، لا شيء غيرها.
    if (/ERR_FILE_NOT_FOUND|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_ADDRESS_UNREACHABLE|ERR_CONNECTION|ERR_TUNNEL_CONNECTION|ERR_PROXY_CONNECTION|Failed to load resource/.test(msg.text())
        && /assets\/media|cover-|cloudfront\.net|openstreetmap\.org/.test(page.url() + msg.location().url + msg.text())) return;
    consoleErrors.push(`[${w}x${hgt}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => consoleErrors.push(`[${w}x${hgt}] PAGEERROR ${err.message}`));
  for (const route of ROUTES) {
    const pseudo = PSEUDO[route];
    if (pseudo) {
      // ── مسار زائف: هاش انطلاق + تهيئة تفاعلية + تأكيدات حالة ──
      if (pseudo.before) await pseudo.before(page);
      await page.goto(indexUrl + pseudo.hash, { waitUntil: "load" });
      await page.waitForTimeout(pseudo.settle || 3000);
      const prepErrs = pseudo.prepare ? (await pseudo.prepare(page)) || [] : [];
      await page.waitForTimeout(600);
      const pname = route.replace(/[\/?=&]/g, "_") + `_${w}x${hgt}.png`;
      // الموجز مستند طويل، وتبويبا الإدارة صفحتا أداة تتمرران بحق (لا مسرح
      // مقدِّم) — لقطة كاملة الصفحة في الحالتين كي يرى المجلس السطح كله لا
      // رأسه وحده. أما درج الملاحظات ولوحة الأوامر والجولة فطبقات فوق مسرح
      // بلا تمرير، فلقطة الإطار هي تمثيلها الصادق.
      const full = route.startsWith("state/report")
        || route.startsWith("state/admin-");
      await page.screenshot({ path: path.join(OUT, pname), fullPage: full });
      const errs = prepErrs.concat(pseudo.check ? await pseudo.check(page) : []);
      for (const e of errs) consoleErrors.push(`[${w}x${hgt}] ${route}: ${e}`);
      if (pseudo.after) await pseudo.after(page);
      continue;
    }

    await page.goto(indexUrl + "#/" + route, { waitUntil: "load" });
    // استقرار كامل: حركات الدخول والعد التصاعدي + مهلة سقوط بلاطات الخريطة
    // إلى SVG (3 ثوانٍ) — فلا تُلتقط اللوحة في حالة انتقالية أبداً
    await page.waitForTimeout(4000);
    const name = route.replace(/[\/?=&]/g, "_") + `_${w}x${hgt}.png`;
    await page.screenshot({ path: path.join(OUT, name) });

    // بوابات «لا صف بيانات مقصوص»: عناصر معدودة يجب أن تكون كاملة داخل
    // إطار العرض (مراجعة الجولة 1 — صف الجنوب وصف المتفائل المقصوصان)
    const VISIBLE_COUNTS = {
      "section/summary": [[".sum-gates", 1]],
      "section/demand": [[".dmd-rank-row", 5], [".dmd-appx", 1], [".dmd-meta", 1]],
      "section/control": [[".ctl-mon-row", 5], [".rail-item", 3], [".ctl-meta", 1]],
      "section/forecast": [[".fct-rank-row", 3], [".fct-sc", 3]],
      // الجولة 3: القطاعات الخمسة كلها ظاهرة كاملة (كانت 1 = المتصدر فقط)
      "section/map": [[".map-sec", 5], [".map-src", 1]],
      "section/initiatives": [[".rail-item", 3], [".ini-source", 1], [".ini-meta", 1]],
      "section/kpis": [[".kpi7-src-bar", 1], [".rail-item", 3]],
      "section/kpis?step=2": [[".kpi7-src-bar", 1], [".rail-item", 3]],
      "section/closing": [[".cls-home", 1]],
    };
    const checks = VISIBLE_COUNTS[route];
    if (checks) {
      for (const [sel, wanted] of checks) {
        const fullyVisible = await page.evaluate(([s, n]) => {
          const els = Array.from(document.querySelectorAll(s));
          const vh = window.innerHeight, vw = window.innerWidth;
          const ok = els.filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 8) return false; // منهار = مقصوص فعلياً
            if (r.top < -1 || r.bottom > vh + 1) return false;
            if (r.left < -1 || r.right > vw + 1) return false;
            // غير مقصوص بأسلاف overflow: نقطة مركزه تصله فعلاً
            const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
            const hit = document.elementFromPoint(cx, cy);
            return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
          });
          return ok.length;
        }, [sel, wanted]);
        if (fullyVisible < wanted) {
          consoleErrors.push(`[${w}x${hgt}] ${route}: ${sel} — الظاهر كاملاً ${fullyVisible} من ${wanted} (صف بيانات مقصوص!)`);
        }
      }
    }
    // بوابة اللاتمرير على مستوى المسرح: لا تمرير في المضيف ولا في جذر
    // المشهد/اللوحة (.sc للغلاف والملاحق، .dash لأقسام V2). جسم اللوحة
    // .dash-body يجوز له التمرير الداخلي بعقد V2 (وضع اللوحة) — لا يُحتسب.
    const scrollable = await page.evaluate(() => {
      const host = document.querySelector(".scene-host:not([hidden])");
      if (!host) return false;
      if (host.scrollHeight > host.clientHeight + 2) return "host";
      const sc = host.querySelector(".sc");
      if (sc && sc.scrollHeight > sc.clientHeight + 2) return "sc";
      const dash = host.querySelector(".dash");
      if (dash && dash.scrollHeight > dash.clientHeight + 2) return "dash";
      return false;
    });
    if (scrollable) consoleErrors.push(`[${w}x${hgt}] ${route}: تمرير رأسي على مستوى المسرح (${scrollable})!`);

    // بوابة الجولة 3 (وعد الجولة 2 المؤتمت): على كل شاشات الأقسام وبكلا
    // المقاسين — (أ) لا محتوى يُرسم تحت شارة الإصدار الثابتة، (ب) لا بطاقة/
    // صف يُقص عند طية العرض خارج متمرر داخلي معلن، (ج) لا نص رؤية يفيض
    // بلا قصّ line-clamp معلن (بتر عند حافة البطاقة).
    if (route.startsWith("section/")) {
      const layoutErrs = await page.evaluate(() => {
        const errs = [];
        const CONTENT = ".dash-card, .rail-item, .stat-card, .pending-card, .kpi, "
          + ".dmd-rank-row, .dmd-appx, .dmd-meta, .dmd-chip, .dmd-cardfoot, "
          + ".ctl-mon-row, .ctl-appx, .ctl-meta, .ini-source, .ini-meta, "
          + ".map-sec, .map-src, .sum-gates, .kpi7-src-bar, .kpi7-truth, "
          + ".cls-footer, .cls-linkbtn, .table-dense, button";

        // (أ) عيّنة نقاط عبر مستطيل الشارة: elementFromPoint يتجاهل الشارة
        // (pointer-events:none) فيصيب ما يُرسم تحتها فعلاً — أي إصابة لعنصر
        // محتوى تعني تصادماً بصرياً حقيقياً لا تقاطع مستطيلات نظرياً.
        const badge = document.getElementById("release-badge");
        if (badge && !badge.hidden) {
          const br = badge.getBoundingClientRect();
          let hitCls = null;
          outer:
          for (let fx = 0.06; fx <= 0.95; fx += 0.22) {
            for (let fy = 0.15; fy <= 0.85; fy += 0.35) {
              const el = document.elementFromPoint(
                br.left + br.width * fx, br.top + br.height * fy);
              const c = el && el.closest ? el.closest(CONTENT) : null;
              if (c) { hitCls = c.className || c.tagName; break outer; }
            }
          }
          if (hitCls) errs.push("محتوى يُرسم تحت شارة الإصدار: " + hitCls);
        }

        // (ب) القص عند الطية: عنصر بطاقي ظاهرُ الأعلى مقصوصُ الأسفل خارج
        // أي متمرر داخلي (المتمرر المعلن بشريطه يقصّ مشروعاً — سواه لا).
        const CARDS = document.querySelectorAll(
          ".rail-item, .stat-card, .pending-card, .map-sec, .dmd-rank-row, "
          + ".ctl-mon-row, .dmd-appx, .ctl-appx, .ini-source, .kpi7-src-bar, "
          + ".dash-card");
        const vh = window.innerHeight;
        for (const el of CARDS) {
          const r = el.getBoundingClientRect();
          if (r.height < 8 || r.top >= vh || r.bottom <= vh + 1) continue;
          let anc = el.parentElement, scrollableAnc = false;
          while (anc) {
            const oy = getComputedStyle(anc).overflowY;
            if ((oy === "auto" || oy === "scroll")
              && anc.scrollHeight > anc.clientHeight + 2) { scrollableAnc = true; break; }
            anc = anc.parentElement;
          }
          if (!scrollableAnc) {
            errs.push("عنصر مقصوص عند الطية بلا متمرر: " + (el.className || el.tagName));
          }
        }

        // (ج) نص رؤية يفيض عن صندوقه بلا line-clamp معلن = بتر منتصف جملة
        for (const t of document.querySelectorAll(".rail-item-text")) {
          const cs = getComputedStyle(t);
          const clamped = cs.webkitLineClamp && cs.webkitLineClamp !== "none";
          const oneLine = cs.whiteSpace === "nowrap" && cs.textOverflow === "ellipsis";
          if (t.scrollHeight > t.clientHeight + 3 && !clamped && !oneLine) {
            errs.push("نص رؤية مبتور بلا قصّ معلن: "
              + String(t.textContent || "").slice(0, 40));
          }
        }
        return errs;
      });
      for (const e of layoutErrs) consoleErrors.push(`[${w}x${hgt}] ${route}: ${e}`);
    }
  }
  await page.close();
}
await browser.close();

console.log(`✓ لقطات في ${OUT}`);
if (consoleErrors.length) {
  console.error("✗ أخطاء كونسول/تخطيط:");
  for (const e of consoleErrors) console.error("  •", e);
  process.exit(1);
}
console.log("✓ الكونسول نظيف ولا تمرير رأسياً");
