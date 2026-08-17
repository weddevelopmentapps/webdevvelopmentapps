#!/usr/bin/env node
/* screenshot.mjs — لقطات المراجعة البصرية وبوابات التخطيط (V3)
   ════════════════════════════════════════════════════════════
   الاستخدام:
     node tools/qa/screenshot.mjs [--out DIR] [--routes r1,r2]
                                  [--sizes 1920x1080,1366x768]
                                  [--themes light,dark]

   ما تغيّر عن V2 (وهو سبب الإخفاقات الكاذبة السابقة): البنية صارت **خمسة
   تبويبات** ‎#/tab/*‎ وكل ما عداها ملحق (V3_SPEC §4). مسارات ‎#/section/*‎
   تقاعدت وصارت إحالات صامتة — فكان التقاطها يصوّر التبويب المحال إليه ثم
   يفحصه ببوابات أقسام V2 (‎.dash-card‎ · ‎.rail-item‎ · شارة الإصدار) التي لا
   وجود لها في قشرة التبويبات، فيُبلَّغ عن «صفوف مقصوصة» لا وجود لها.

   البوابات التي يفرضها هذا الملف الآن:
     • **الكونسول نظيف** في كل مسار وكل مقاس وكل سمة.
     • **صفر تمرير أفقي** (V3_SPEC §3): لا على الجذر ولا في لوح التبويب ولا
       في أي بطاقة/شبكة داخله.
     • **التلميح لا يغطي الرسم** (V3_SPEC §7): تحويم حقيقي بالفأرة على كل رسم
       رئيس، ثم إثبات أن صندوق التلميح لا يتقاطع مع **مركز منطقة الرسم** ولا
       مع النقطة المحوَّم عليها.
     • **اللوح مبني بمحتوى**: لا ‎.tab-missing‎ ولا لوح فارغ.
     • **الملاحق بلا تمرير على مستوى المسرح** (عقد V2 الباقي للملاحق).
   يفشل (exit 1) عند أي إخفاق. */
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

/** المحاور الخمسة القانونية — أساس كل لقطة ومقياس */
const TAB_IDS = ["demand", "licensing", "control", "initiatives", "kpis"];

const ROUTES = argOf("--routes", [
  // ١) التبويبات الخمسة — البنية الأساسية
  ...TAB_IDS.map((id) => "tab/" + id),
  // ٢) الملاحق المفتاحية: ملحق كل تبويب + الملاحق المستعرضة
  "appendix/demand", "appendix/licensing", "appendix/monitoring",
  "appendix/pillar", "appendix/kpi",
  "appendix/atlas", "appendix/scenarios",
  "appendix/methodology", "appendix/decisions", "appendix/compare",
  // ٣) حالات لا يبلغها العنوان وحده (تفاعل لازم) — تُلتقط في السمة الأولى فقط
  "state/report", "state/report-print", "state/palette",
  "state/present", "state/notes",
  "state/admin-report", "state/admin-diff",
].join(",")).split(",");

const SIZES = argOf("--sizes", "1920x1080,1366x768").split(",")
  .map((s) => s.split("x").map(Number));
const THEMES = argOf("--themes", "light,dark").split(",");

fs.mkdirSync(OUT, { recursive: true });
const indexUrl = "file://" + path.join(ROOT, "index.html");

/* ════════════════════════════════════════════════════════════════════════════
   المسارات الزائفة (state/*) — حالات لا يبلغها الهاش وحده
   ──────────────────────────────────────────────────────────────────────────
   كلٌّ منها: هاش انطلاق + تهيئة تفاعلية + تأكيدات خاصة بالحالة. تخرج التأكيدات
   بقائمة نصوص أخطاء (فارغة = خضراء). تُلتقط في **السمة الأولى وحدها**: كلفتها
   عالية (بوابة دخول الإدارة، مستند الموجز الطويل) وما تفحصه سلوكيّ لا لوني.
   ══════════════════════════════════════════════════════════════════════════ */
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
  /* وضع الموجز التنفيذي: مستند A4 يتجاوز قشرة التبويبات كلياً */
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
        const tabs = document.getElementById("tabs-root");
        if (tabs && !tabs.hidden) errs.push("قشرة التبويبات تتعايش مع الموجز");
        const admin = document.getElementById("admin-root");
        if (admin && !admin.hidden) errs.push("جذر الإدارة يتعايش مع الموجز");
        return errs;
      });
    },
  },

  /* بوابة الطباعة: محاكاة media:print على مسار الموجز */
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
        for (const id of ["stage", "hud", "release-badge", "admin-root",
          "tabs-root"]) {
          if (vis(document.getElementById(id))) errs.push("ظاهر عند الطباعة: #" + id);
        }
        for (const sel of [".rpt-toolbar", ".tour-bar", ".tour-notes",
          ".pal-root", ".hl-overlay"]) {
          if (vis(document.querySelector(sel))) {
            errs.push("ظاهر عند الطباعة: " + sel);
          }
        }
        const root = document.getElementById("report-root");
        if (!vis(root)) errs.push("مستند الموجز غير مرئي عند الطباعة");
        const pages = Array.from(document.querySelectorAll(".rpt-page")).filter(vis);
        if (pages.length < 3) errs.push("صفحات مرئية عند الطباعة " + pages.length + " (<3)");
        for (const p of pages) {
          if (p.scrollWidth > p.clientWidth + 2) {
            errs.push("صفحة موجز تفيض عرضياً: " + (p.className || ""));
          }
        }
        return errs;
      });
    },
  },

  /* لوحة الأوامر مفتوحة فوق تبويب حي (Ctrl+K) */
  "state/palette": {
    hash: "#/tab/demand",
    settle: 2600,
    async prepare(page) {
      await page.keyboard.press("Control+KeyK");
      await page.waitForTimeout(700);
      await page.keyboard.type("الرياض");
      await page.waitForTimeout(700);
      return [];
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

  /* وضع العرض الاختياري بالكليكر (V3_SPEC §6): طبقة فوق التبويبات لا بنية */
  "state/present": {
    hash: "#/tab/control",
    settle: 2600,
    async prepare(page) {
      const errs = [];
      const btn = page.locator("#tabx-present");
      if (await btn.count() === 0) {
        errs.push("زر وضع العرض غائب عن الرأس");
        return errs;
      }
      await btn.first().click();
      await page.waitForTimeout(2600);
      return errs;
    },
    async check(page) {
      return page.evaluate(() => {
        const errs = [];
        if (!document.body.classList.contains("mode-present")) {
          errs.push("وضع العرض لم يُفعّل على body");
          return errs;
        }
        const tabs = document.getElementById("tabs-root");
        if (tabs && getComputedStyle(tabs).display !== "none") {
          errs.push("قشرة التبويبات ما زالت مرسومة في وضع العرض");
        }
        const stage = document.getElementById("stage");
        if (!stage || stage.hidden) errs.push("المسرح غائب في وضع العرض");
        const exit = document.getElementById("tabx-exit-present");
        if (!exit || exit.getBoundingClientRect().height < 4) {
          errs.push("مخرج وضع العرض غير ظاهر");
        }
        return errs;
      });
    },
    async after(page) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1200);
    },
  },

  /* درج ملاحظات المتحدث (N) داخل وضع العرض — أداته الطبيعية */
  "state/notes": {
    hash: "#/tab/control",
    settle: 2600,
    async prepare(page) {
      const errs = [];
      const btn = page.locator("#tabx-present");
      if (await btn.count() === 0) {
        errs.push("زر وضع العرض غائب — تعذّر بلوغ درج الملاحظات");
        return errs;
      }
      await btn.first().click();
      await page.waitForTimeout(2600);
      await page.keyboard.press("KeyN");
      await page.waitForTimeout(1000);
      return errs;
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
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
    },
  },

  /* منشئ الموجز في الإدارة — خلف بوابة الدخول */
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
        const tabs = document.getElementById("tabs-root");
        if (tabs && !tabs.hidden) errs.push("قشرة التبويبات ظاهرة داخل الإدارة");
        return errs;
      });
    },
  },

  /* مقارن الإصدارات: يتطلب مسودة مفتوحة — تُفتح ويُعدَّل حقل واحد موثّق */
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

/* ════════════════════════════════════════════════════════════════════════════
   بوابة «صفر تمرير أفقي» (V3_SPEC §3)
   ══════════════════════════════════════════════════════════════════════════ */
async function horizontalScrollErrors(page) {
  return page.evaluate(() => {
    const errs = [];
    const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth + 2) {
      errs.push("تمرير أفقي على الجذر: " + de.scrollWidth + " > " + window.innerWidth);
    }
    if (document.body.scrollWidth > window.innerWidth + 2) {
      errs.push("تمرير أفقي على body: " + document.body.scrollWidth);
    }
    // أي وعاء تخطيط يفيض عرضياً بلا تمرير معلن = كسر شبكة لا تمرير مقصود
    const SEL = ".tab-panel, .tabgrid, .tabcard, .tabcard-body, .tabfigs, "
      + ".tabtrack, .brand-lock-inner, .sc, .ax-body, .ax-page";
    for (const el of document.querySelectorAll(SEL)) {
      const cs = getComputedStyle(el);
      if (cs.overflowX === "auto" || cs.overflowX === "scroll") continue;
      if (el.scrollWidth > el.clientWidth + 2) {
        errs.push("فيضان أفقي بلا تمرير معلن: " + (el.className || el.tagName)
          + " (" + el.scrollWidth + " > " + el.clientWidth + ")");
      }
    }
    return errs;
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   بوابة «التلميح لا يغطي الرسم» (V3_SPEC §3 و§7)
   ──────────────────────────────────────────────────────────────────────────
   الشكوى الحرفية للعميل: «حين أحوّم على رسم تظهر التفاصيل فتغطي الرسم كله».
   العلاج المتعاقَد عليه: ‎confine:true‎ + ‎ttPosition‎ التي تُلصق الصندوق
   بالحافة **المقابلة** للمؤشر. هذه البوابة تحوّم بفأرة حقيقية على كل رسم رئيس
   ثم تقيس صندوق التلميح الظاهر فعلاً وتثبت أنه:
     (أ) لا يبتلع **مركز منطقة الرسم**،
     (ب) لا يغطي النقطة المحوَّم عليها نفسها،
     (ج) لا يتجاوز العرض الأقصى المتعاقد عليه (260px)،
     (د) لا يخرج عن حدود الرسم (‎confine‎).
   غياب التلميح ليس إخفاقاً: بعض الأسطح (خرائط، حلقات) لا تلميح لها.
   ══════════════════════════════════════════════════════════════════════════ */
const TT_MAX_W = 260;

/** مواضع التحويم النسبية داخل كل رسم — مسح لا نقطة واحدة، فالسلسلة قد تكون
    خالية عند موضع بعينه فيمرّ الفحص بلا أن يرى تلميحاً قط. */
const HOVER_POINTS = [
  [0.26, 0.42], [0.42, 0.62], [0.62, 0.38], [0.78, 0.58],
];

async function tooltipOverlapErrors(page) {
  const errs = [];
  const seen = { charts: 0, tips: 0 };
  const count = await page.evaluate(() => {
    let n = 0;
    document.querySelectorAll(".tabchart").forEach((el, i) => {
      el.dataset.qaChart = String(i);
      n++;
    });
    return n;
  });

  for (let i = 0; i < count; i++) {
    // التبويب يتمرر رأسياً بحق، فكل رسم يُجلب إلى الإطار قبل تحويمه — وإلا
    // فُحص الطي الأول وحده وبقيت رسوم أسفل الصفحة بلا بوابة.
    const b = await page.evaluate((idx) => {
      const el = document.querySelector('[data-qa-chart="' + idx + '"]');
      if (!el) return null;
      el.scrollIntoView({ block: "center", behavior: "instant" });
      const r = el.getBoundingClientRect();
      if (r.width < 80 || r.height < 80) return null;
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, i);
    if (!b) continue;
    await page.waitForTimeout(140);
    seen.charts++;

    for (const [fx, fy] of HOVER_POINTS) {
      const hx = b.x + b.w * fx;
      const hy = b.y + b.h * fy;
      if (hy < 1 || hy > 1e5) continue;
      await page.mouse.move(hx, hy, { steps: 3 });
      await page.waitForTimeout(260);
      const tip = await page.evaluate(([idx, px, py]) => {
        const el = document.querySelector('[data-qa-chart="' + idx + '"]');
        if (!el) return null;
        const cand = Array.from(el.querySelectorAll("div")).filter((d) => {
          const st = d.getAttribute("style") || "";
          if (!/position:\s*absolute/i.test(st)) return false;
          const cs = getComputedStyle(d);
          if (cs.display === "none" || cs.visibility === "hidden") return false;
          if (parseFloat(cs.opacity || "1") < 0.05) return false;
          const rr = d.getBoundingClientRect();
          if (rr.width < 20 || rr.height < 12) return false;
          return !!String(d.textContent || "").trim();
        });
        if (!cand.length) return null;
        const t = cand[cand.length - 1].getBoundingClientRect();
        const c = el.getBoundingClientRect();
        return {
          t: { l: t.left, r: t.right, tp: t.top, b: t.bottom, w: t.width },
          c: { l: c.left, r: c.right, tp: c.top, b: c.bottom,
            cx: c.left + c.width / 2, cy: c.top + c.height / 2 },
          px, py,
        };
      }, [i, hx, hy]);

      // لا تلميح عند هذا الموضع — مشروع (سلسلة خالية أو سطح بلا تحويم)
      if (!tip) continue;
      seen.tips++;

      const where = "(رسم #" + i + " @" + fx + "," + fy + ")";
      const inBox = (x, y, r) => x >= r.l - 1 && x <= r.r + 1
        && y >= r.tp - 1 && y <= r.b + 1;
      if (inBox(tip.c.cx, tip.c.cy, tip.t)) {
        errs.push("صندوق التلميح يبتلع مركز منطقة الرسم " + where);
      }
      if (inBox(tip.px, tip.py, tip.t)) {
        errs.push("صندوق التلميح يغطي النقطة المحوَّم عليها " + where);
      }
      if (tip.t.w > TT_MAX_W + 2) {
        errs.push("عرض التلميح " + Math.round(tip.t.w)
          + "px > الحد " + TT_MAX_W + " " + where);
      }
      if (tip.t.l < tip.c.l - 2 || tip.t.r > tip.c.r + 2
        || tip.t.tp < tip.c.tp - 2 || tip.t.b > tip.c.b + 2) {
        errs.push("التلميح يخرج عن حدود الرسم رغم confine " + where);
      }
    }
  }
  // إبعاد الفأرة وإعادة التمرير إلى الأعلى كي لا يتسرب أثر إلى اللقطة التالية
  await page.mouse.move(2, 2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(140);
  if (process.env.QA_TOOLTIP_TRACE) {
    console.log("    · تلميح: " + seen.tips + " ظهور على " + seen.charts + " رسماً");
  }
  return errs;
}

/* ════════════════════════════════════════════════════════════════════════════
   التنفيذ
   ══════════════════════════════════════════════════════════════════════════ */
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const problems = [];

for (const [w, hgt] of SIZES) {
  for (const theme of THEMES) {
    const page = await browser.newPage({ viewport: { width: w, height: hgt } });
    const tag = `[${w}x${hgt}/${theme}]`;
    // السمة تُثبَّت قبل أول طلاء بمفتاح ‎themeMode‎ نفسه — لا نقر ولا ومضة
    await page.addInitScript((t) => {
      try { window.localStorage.setItem("rh:theme", t); } catch (_e) { /* بلا تخزين */ }
    }, theme);

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      // غياب الوسائط الاختيارية (ملفات شقيقة/CloudFront/بلاطات OSM) مسار بديل
      // مقصود بعقد التدهور الرشيق — أخطاء شبكتها فقط تُتجاهل، لا شيء غيرها.
      if (/ERR_FILE_NOT_FOUND|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_ADDRESS_UNREACHABLE|ERR_CONNECTION|ERR_TUNNEL_CONNECTION|ERR_PROXY_CONNECTION|Failed to load resource/.test(msg.text())
        && /assets\/media|cover-|cloudfront\.net|openstreetmap\.org/.test(page.url() + msg.location().url + msg.text())) return;
      problems.push(`${tag} ${msg.text()}`);
    });
    page.on("pageerror", (err) => problems.push(`${tag} PAGEERROR ${err.message}`));

    for (const route of ROUTES) {
      const pseudo = PSEUDO[route];
      // الحالات التفاعلية تُلتقط في السمة الأولى وحدها (سلوك لا لون)
      if (pseudo && theme !== THEMES[0]) continue;

      const shot = (extra) => path.join(OUT,
        route.replace(/[\/?=&]/g, "_") + `_${theme}_${w}x${hgt}${extra || ""}.png`);

      if (pseudo) {
        if (pseudo.before) await pseudo.before(page);
        await page.goto(indexUrl + pseudo.hash, { waitUntil: "load" });
        await page.waitForTimeout(pseudo.settle || 3000);
        const prepErrs = pseudo.prepare ? (await pseudo.prepare(page)) || [] : [];
        await page.waitForTimeout(600);
        // الموجز مستند طويل وتبويبا الإدارة صفحتا أداة تتمرران بحق — لقطة
        // كاملة الصفحة فيهما كي يُرى السطح كله لا رأسه وحده.
        const full = route.startsWith("state/report")
          || route.startsWith("state/admin-");
        await page.screenshot({ path: shot(), fullPage: full });
        const errs = prepErrs.concat(pseudo.check ? await pseudo.check(page) : []);
        for (const e of errs) problems.push(`${tag} ${route}: ${e}`);
        if (pseudo.after) await pseudo.after(page);
        continue;
      }

      await page.goto(indexUrl + "#/" + route, { waitUntil: "load" });
      // استقرار كامل: حركات الدخول والعد التصاعدي + مهلة سقوط بلاطات الخريطة
      // إلى SVG — فلا تُلتقط اللوحة في حالة انتقالية أبداً
      await page.waitForTimeout(4000);

      const isTab = route.startsWith("tab/");
      // التبويب يتمرر رأسياً بحق (V3_SPEC §3) فلقطته كاملة الصفحة، وإلى جانبها
      // لقطة الإطار الأول التي يراها العميل عند الفتح.
      await page.screenshot({ path: shot(), fullPage: isTab });
      if (isTab) await page.screenshot({ path: shot("_fold") });

      // ── بوابة العنوان: المسار وصل حيث يجب ──
      const landed = await page.evaluate(() => location.hash);
      if (isTab) {
        const want = "#/" + route.split("?")[0];
        if (!landed.startsWith(want)) {
          problems.push(`${tag} ${route}: العنوان انزلق إلى ${landed}`);
        }
      }

      // ── بوابة «اللوح مبني بمحتوى» ──
      if (isTab) {
        const panel = await page.evaluate(() => {
          const p = document.querySelector(".tab-panel");
          return {
            missing: !!document.querySelector(".tab-missing"),
            empty: !p || String(p.textContent || "").trim().length < 40,
            charts: document.querySelectorAll(".tabchart").length,
            tracker: document.querySelectorAll(".tabtrack-item").length,
            logo: !!document.querySelector(".brand-lock-logo *"),
          };
        });
        if (panel.missing) problems.push(`${tag} ${route}: لوح «التبويب غير مُسجَّل»`);
        if (panel.empty) problems.push(`${tag} ${route}: لوح التبويب فارغ`);
        if (panel.tracker !== TAB_IDS.length) {
          problems.push(`${tag} ${route}: المتتبّع يعرض ${panel.tracker} محاور لا ${TAB_IDS.length}`);
        }
        if (!panel.logo) problems.push(`${tag} ${route}: شعار الرأس لم يُبنَ`);
      }

      // ── بوابة صفر تمرير أفقي ──
      for (const e of await horizontalScrollErrors(page)) {
        problems.push(`${tag} ${route}: ${e}`);
      }

      // ── بوابة التلميح لا يغطي الرسم ──
      if (isTab) {
        for (const e of await tooltipOverlapErrors(page)) {
          problems.push(`${tag} ${route}: ${e}`);
        }
      }

      // ── الملاحق: لا تمرير رأسي على مستوى المسرح (عقد V2 الباقي) ──
      if (route.startsWith("appendix/")) {
        const scrollable = await page.evaluate(() => {
          const host = document.querySelector(".scene-host:not([hidden])");
          if (!host) return "لا مضيف مشهد";
          if (host.scrollHeight > host.clientHeight + 2) return "host";
          const sc = host.querySelector(".sc");
          if (sc && sc.scrollHeight > sc.clientHeight + 2) return "sc";
          return false;
        });
        if (scrollable) {
          problems.push(`${tag} ${route}: تمرير رأسي على مستوى المسرح (${scrollable})`);
        }
      }
    }
    await page.close();
  }
}
await browser.close();

console.log(`✓ لقطات في ${OUT}`);
if (problems.length) {
  console.error("✗ أخطاء كونسول/تخطيط:");
  for (const e of problems) console.error("  •", e);
  process.exit(1);
}
console.log("✓ الكونسول نظيف · صفر تمرير أفقي · التلميح لا يغطي الرسم");
