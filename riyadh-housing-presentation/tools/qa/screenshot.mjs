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
    "appendix/pillar", "appendix/licensing"].join(",")).split(",");
const SIZES = argOf("--sizes", "1920x1080,1366x768").split(",")
  .map((s) => s.split("x").map(Number));

fs.mkdirSync(OUT, { recursive: true });
const indexUrl = "file://" + path.join(ROOT, "index.html");

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
