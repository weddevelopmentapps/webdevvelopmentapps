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
  "scene/00,scene/01,scene/02,scene/03,scene/03?step=1").split(",");
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
    // غياب وسائط الغلاف الاختيارية مسار بديل مقصود لا خطأ
    if (/ERR_FILE_NOT_FOUND|ERR_NAME_NOT_RESOLVED/.test(msg.text())
        && /assets\/media|cover-/.test(page.url() + msg.location().url)) return;
    consoleErrors.push(`[${w}x${hgt}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => consoleErrors.push(`[${w}x${hgt}] PAGEERROR ${err.message}`));
  for (const route of ROUTES) {
    await page.goto(indexUrl + "#/" + route, { waitUntil: "load" });
    await page.waitForTimeout(1400); // استقرار الحركة والعد
    const name = route.replace(/[\/?=&]/g, "_") + `_${w}x${hgt}.png`;
    await page.screenshot({ path: path.join(OUT, name) });
    // فحص التمرير الرأسي المحظور في مشاهد المقدِّم
    const scrollable = await page.evaluate(() => {
      const host = document.querySelector(".scene-host:not([hidden])");
      if (!host) return false;
      const sc = host.querySelector(".sc");
      return sc ? sc.scrollHeight > sc.clientHeight + 2 : false;
    });
    if (scrollable) consoleErrors.push(`[${w}x${hgt}] ${route}: تمرير رأسي داخل المشهد!`);
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
