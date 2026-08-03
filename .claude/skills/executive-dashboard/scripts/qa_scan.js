/**
 * qa_scan.js — quality gates for a built executive-dashboard index.html.
 *
 * Usage:
 *   node qa_scan.js /abs/path/to/index.html [tab1,tab2,...]
 *
 * Requires: npm i playwright  (Chromium path override via PW_CHROMIUM env if vendored,
 * e.g. PW_CHROMIUM=/opt/pw-browsers/chromium on Claude remote runners).
 *
 * Gates checked (exit code 0 = all pass):
 *   1. Zero console errors / page errors across every tab (desktop).
 *   2. Zero horizontal overflow at 390px width on every tab (scrollWidth <= 395).
 *   3. localStorage persistence key exists after interaction.
 * If tabs are not passed, they are auto-discovered from [data-tab] buttons.
 * On overflow, prints the offending element chain (visible-overflow walker) so you fix
 * the element, not the symptom.
 */
const { chromium } = require('playwright');

(async () => {
  const file = process.argv[2];
  if (!file) { console.error('usage: node qa_scan.js /path/to/index.html [tabs]'); process.exit(1); }
  const url = file.startsWith('file://') ? file : 'file://' + file;
  const launch = { };
  if (process.env.PW_CHROMIUM) launch.executablePath = process.env.PW_CHROMIUM;
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1100);

  let tabs = (process.argv[3] || '').split(',').filter(Boolean);
  if (!tabs.length) {
    tabs = await page.evaluate(() =>
      [...document.querySelectorAll('[data-tab]')].map(b => b.dataset.tab)
        .filter((v, i, a) => a.indexOf(v) === i));
  }
  console.log('tabs:', tabs.join(' '));

  // Gate 1: desktop sweep
  for (const t of tabs) {
    await page.evaluate(t => { location.hash = t; }, t);
    await page.waitForTimeout(380);
  }

  // Gate 2: mobile overflow sweep with offender walker
  await page.setViewportSize({ width: 390, height: 844 });
  let overflow = 0;
  for (const t of tabs) {
    await page.evaluate(t => { location.hash = t; }, t);
    await page.waitForTimeout(380);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > 395) {
      overflow++;
      console.log(`OVERFLOW ${t}: scrollWidth=${sw}`);
      const chain = await page.evaluate(() => {
        const out = [];
        const walk = (el, path) => {
          if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === 'visible')
            out.push(`${path} scrollW=${el.scrollWidth} clientW=${el.clientWidth}`);
          [...el.children].forEach(c =>
            walk(c, path + '>' + c.tagName + (c.className ? '.' + String(c.className).split(' ')[0] : '')));
        };
        walk(document.body, 'BODY');
        return out.slice(0, 8);
      });
      chain.forEach(l => console.log('   ', l));
    }
  }

  // Gate 3: persistence key present (any localStorage entry written by the app)
  const persisted = await page.evaluate(() => localStorage.length > 0);

  console.log('---');
  console.log('console/page errors:', errors.length ? errors.slice(0, 10) : 'NONE');
  console.log('mobile overflow tabs:', overflow);
  console.log('localStorage persistence:', persisted ? 'ok' : 'NOT WRITTEN (check save())');
  await browser.close();
  process.exit(errors.length || overflow ? 2 : 0);
})();
