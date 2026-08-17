/* theme.js — أساس ECharts: الألوان من الرموز الحية + قانون التلميح (V3)
   ══════════════════════════════════════════════════════════════════════
   ما تغيّر في V3 (V3_SPEC §1 و§3):

   1) **لا ثابت لوني واحد في هذا الملف.** كل قيمة في ‎C‎ تُقرأ من رموز CSS
      الحيّة عبر ‎getComputedStyle(document.documentElement)‎، ويُعاد ملؤها
      عند كل ‎theme:change‎. الكائن ‎C‎ **يُحدَّث في مكانه** (لا يُستبدل) كي
      تبقى كل الإشارات المحفوظة في المنشئات (‎const T = RH.viz.theme‎ ثم
      ‎T.C.green‎) صحيحة تلقائياً بلا تعديل سطر واحد فيها.

   2) **قانون التلميح الإلزامي:** كل ‎tooltip‎ يمرّ من ‎tooltip(su)‎ فيرث:
      ‎confine:true‎ + دالة ‎position‎ تُلصق الصندوق بالحافة **المقابلة** لموضع
      المؤشر داخل القماش + ‎max-width:260px‎. والمحتوى الملزم في التبويبات هو
      ‎ttMicro(title, value)‎: سطران لا أكثر (عنوان + قيمة واحدة). التفاصيل
      تنتقل إلى نافذة الإبراز ‎RH.highlight‎ لا إلى التلميح.

   3) ‎refreshAll()‎ — يُستدعى تلقائياً عند ‎theme:change‎: يعيد صبغ خيارات كل
      رسم مسجَّل (استبدال حرفي لقيم اللوحة القديمة بالجديدة في شجرة الخيارات)
      ثم ينفّذ خطافات إعادة البناء المسجَّلة. الصياغات (formatters) تقرأ ‎C‎
      وقت النداء فتُحدَّث بلا عمل إضافي.

   المنظومة الدلالية مقفلة كما هي: أخضر=الطاقة المرخصة · برونزي=الطلب ·
   مرجاني=العجز والمخالفات حصراً · ذهبي=المستهدف وخط الأساس حصراً ·
   أزرق=فئة تصنيفية ثانوية. الفصل بين الذهبي والبرونزي مقصود على السمتين. */
"use strict";

RH.viz.theme = (function () {

  /* ══════════════════════════════════════════════════════════════════════════
     1) قراءة اللوحة من الرموز الحية
     ══════════════════════════════════════════════════════════════════════════ */

  /** خريطة: مفتاح ‎C‎ → اسم رمز CSS · القيمة الاحتياطية تُستعمل قبل توفر DOM */
  const TOKENS = Object.freeze({
    green: ["--green", "#0E7A4E"],
    greenHi: ["--green-hi", "#0A5F3C"],
    demand: ["--demand", "#6E5320"],
    demandHi: ["--demand-hi", "#8A6A28"],
    coral: ["--coral", "#C0402A"],
    gold: ["--gold", "#A8760A"],
    goldHi: ["--gold-hi", "#8F6408"],
    blue: ["--collar-blue", "#2F6690"],
    blueHi: ["--blue-hi", "#24506F"],
    brand: ["--brand", "#00733D"],
    brandTeal: ["--brand-teal", "#127C74"],
    brandDeep: ["--brand-deep", "#0B6B4F"],
    ivory: ["--ink", "#0B2A20"],       /* الحبر الرئيس — الاسم تاريخي */
    ink2: ["--ink-2", "#3C5A4E"],
    mut: ["--ink-3", "#5C7269"],
    faint: ["--ink-4", "#7C9188"],
    stage1: ["--surface", "#FFFFFF"],
    stage2: ["--surface-2", "#EFF3F1"],
    stage3: ["--surface-3", "#E4EBE7"],
    line: ["--line", "#DCE5E1"],
    tipBg: ["--tip-bg", "#0B2A20"],
    tipFg: ["--tip-fg", "#F4F8F5"],
    tipMut: ["--tip-mut", "#A9C1B4"],
    ok: ["--ok", "#0E7A4E"],
    warn: ["--warn", "#9A6B10"],
    bad: ["--bad", "#B3402F"],
    info: ["--info", "#2F6690"],
  });

  /** سلاسل التدرّج التسلسلي (خمس درجات لكل منها) */
  const RAMPS = Object.freeze({
    seq: ["--seq-1", "--seq-2", "--seq-3", "--seq-4", "--seq-5"],
    seqViol: ["--seq-viol-1", "--seq-viol-2", "--seq-viol-3",
      "--seq-viol-4", "--seq-viol-5"],
  });

  /** ‎C‎: كائن اللوحة الحي — يُحدَّث في مكانه ولا يُستبدل أبداً */
  const C = {};

  /** قنوات الشفافية المشتقة (خطوط المحاور والشبكة) — تُحسب بعد قراءة الحبر */
  function computeAxisTints(root) {
    const rgb = cssVar(root, "--ink-rgb", "11, 42, 32");
    C.axLine = "rgba(" + rgb + ", 0.16)";
    C.axSplit = "rgba(" + rgb + ", 0.08)";
    C.plateEdge = "rgba(" + rgb + ", 0.10)";
    C.shadowRgb = cssVar(root, "--shadow-rgb", "11, 42, 32");
  }

  function cssVar(root, name, fallback) {
    if (!root) return fallback;
    const v = root.getPropertyValue(name);
    return v && v.trim() ? v.trim() : fallback;
  }

  /** يعيد ملء ‎C‎ من الرموز الحية · يُرجع لقطة {مفتاح: قيمة} قبل التحديث */
  function refreshTokens() {
    const before = Object.assign({}, C);
    let root = null;
    try {
      if (typeof getComputedStyle === "function" && document.documentElement) {
        root = getComputedStyle(document.documentElement);
      }
    } catch (_e) { root = null; }

    for (const key of Object.keys(TOKENS)) {
      const [name, fb] = TOKENS[key];
      C[key] = cssVar(root, name, fb);
    }
    for (const key of Object.keys(RAMPS)) {
      const prev = Array.isArray(C[key]) ? C[key].slice() : null;
      const arr = RAMPS[key].map((n, i) =>
        cssVar(root, n, prev ? prev[i] : "#888888"));
      // تحديث في المكان: المصفوفة نفسها قد تكون مُمرَّرة إلى visualMap
      if (Array.isArray(C[key])) { for (let i = 0; i < arr.length; i++) C[key][i] = arr[i]; }
      else C[key] = arr;
    }
    computeAxisTints(root);
    return before;
  }
  refreshTokens();

  const REDUCED = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

  /* مقاس خط مدرّج مع المسرح (المشاهد تمرر su وقت البناء) */
  const fs = (su, n) => Math.max(11, Math.round(n * su));

  /** كسر العرض الضيق (فئة 1366): تُشدَّد فيه ضوابط العلامات تلقائياً */
  const narrow = () => typeof window !== "undefined" && window.innerWidth <= 1440;

  /* ══════════════════════════════════════════════════════════════════════════
     2) المحاور (سلوكها من V2 محفوظ حرفياً — تغيّر مصدر اللون فقط)
     ══════════════════════════════════════════════════════════════════════════ */

  /** انضباط العلامات المعمم: ‎hideOverlap‎ يقصي كل تسمية تتقاطع مع سابقتها،
      ودمج ‎axisLabel‎ عميق كي لا تفقد التخصيصات المحلية هذا الضابط. */
  function mergeAxis(base, extra) {
    if (!extra) return base;
    const out = Object.assign({}, base, extra);
    if (extra.axisLabel) {
      out.axisLabel = Object.assign({}, base.axisLabel, extra.axisLabel);
    }
    return out;
  }

  /** محاور رأسية RTL: الفئات تُقرأ من اليمين لليسار والقيم على اليمين */
  function catXAxis(su, data, extra) {
    return mergeAxis({
      type: "category", data, inverse: true,
      axisLine: { lineStyle: { color: C.axLine } },
      axisTick: { show: false },
      axisLabel: {
        color: C.mut, fontFamily: "Cairo", fontSize: fs(su, 14),
        hideOverlap: true,
      },
    }, extra);
  }
  function valAxis(su, fmt, extra) {
    return mergeAxis({
      type: "value", position: "right",
      splitLine: { lineStyle: { color: C.axSplit } },
      splitNumber: narrow() ? 2 : undefined,
      axisLabel: {
        color: C.faint, fontFamily: "IBM Plex Sans Arabic",
        fontSize: fs(su, 12.5), formatter: fmt,
        hideOverlap: true,
      },
    }, extra);
  }
  /** أعمدة أفقية RTL: تنمو يميناً→يساراً، التسميات على اليمين، الأول أعلى */
  function hValAxis(su, fmt, max) {
    const a = {
      type: "value", inverse: true,
      splitLine: { lineStyle: { color: C.axSplit } },
      splitNumber: narrow() ? 2 : undefined,
      axisLabel: {
        color: C.faint, fontFamily: "IBM Plex Sans Arabic",
        fontSize: fs(su, 12.5), formatter: fmt,
        hideOverlap: true,
      },
    };
    if (max != null) a.max = max;
    return a;
  }
  function hCatAxis(su, data, labelWidth) {
    return {
      type: "category", data, position: "right", inverse: true,
      axisLine: { lineStyle: { color: "transparent" } },
      axisTick: { show: false },
      axisLabel: {
        color: C.ink2, fontFamily: "Cairo", fontSize: fs(su, 15),
        width: labelWidth || null, overflow: labelWidth ? "truncate" : "none",
        hideOverlap: true,
      },
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) قانون التلميح الإلزامي (V3_SPEC §3) — لا استثناء
     ══════════════════════════════════════════════════════════════════════════ */

  const TT_MAX_W = 260;   /* عرض أقصى ملزم */
  const TT_PAD = 12;      /* هامش الحافة داخل القماش */

  /**
   * دالة الموضع الملزمة: تُلصق التلميح بالحافة الأفقية **المقابلة** لموضع
   * المؤشر، وتُقيّده رأسياً داخل القماش. النتيجة: صندوق التلميح لا يتقاطع
   * أبداً مع النقطة المحوَّم عليها ولا مع مركز منطقة الرسم — وهي الشكوى
   * الحرفية للعميل («التفاصيل تظهر فتغطي الرسم كله»).
   * توقيع ECharts: (point, params, dom, rect, size) → [x, y] بإحداثيات القماش.
   */
  function ttPosition(point, _params, _dom, _rect, size) {
    const view = (size && size.viewSize) || [0, 0];
    const box = (size && size.contentSize) || [0, 0];
    const cw = view[0], ch = view[1];
    const tw = Math.min(box[0], TT_MAX_W), th = box[1];
    // الحافة المقابلة أفقياً
    const x = point[0] < cw / 2
      ? Math.max(TT_PAD, cw - tw - TT_PAD)
      : TT_PAD;
    // رأسياً: يتبع المؤشر محصوراً داخل القماش
    let y = point[1] - th / 2;
    const maxY = Math.max(TT_PAD, ch - th - TT_PAD);
    if (y < TT_PAD) y = TT_PAD;
    if (y > maxY) y = maxY;
    return [x, y];
  }

  /**
   * قاعدة التلميح الموحدة. كل منشئ رسم **ملزم** بتمرير نتيجتها في
   * ‎tooltip:‎ (مباشرة أو عبر ‎Object.assign(T.tooltip(su), {...})‎).
   * ‎opts.trigger‎ يقبل "item" (الافتراضي) أو "axis".
   */
  function tooltip(su, opts) {
    const o = opts || {};
    return {
      trigger: o.trigger || "item",
      confine: true,                       /* قانون: لا يخرج عن القماش */
      position: ttPosition,                /* قانون: مُلصق بالحافة المقابلة */
      appendToBody: false,
      enterable: false,
      transitionDuration: REDUCED ? 0 : 0.12,
      backgroundColor: C.tipBg,
      borderWidth: 0,
      padding: 0,
      textStyle: { color: C.tipFg, fontFamily: "Cairo", fontSize: fs(su, 13) },
      extraCssText:
        "direction:rtl;text-align:right;max-width:" + TT_MAX_W + "px;" +
        "box-shadow:0 14px 40px rgba(" + C.shadowRgb + ",.30);border-radius:12px;" +
        "padding:9px 13px;pointer-events:none;",
    };
  }

  /** تعقيم إلزامي: تسميات الأشهر والأسماء تمر من ورقة مستوردة إلى HTML التلميح */
  function esc(x) {
    return String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /**
   * محتوى التلميح الملزم في تبويبات V3: **سطران لا أكثر**.
   *   السطر 1: العنوان (اسم الفئة/الشهر)
   *   السطر 2: قيمة واحدة + وحدتها
   * أي تفصيل زائد مكانه نافذة الإبراز عند النقر — لا التلميح.
   */
  function ttMicro(title, value, unit) {
    const head = '<div style="color:' + C.tipMut + ';font-size:.92em;'
      + 'margin-bottom:3px;white-space:nowrap">' + esc(title) + "</div>";
    const val = '<div style="font-family:\'IBM Plex Sans Arabic\';font-weight:700;'
      + 'white-space:nowrap">' + esc(value)
      + (unit ? ' <span style="font-weight:400;font-size:.85em;opacity:.8">'
        + esc(unit) + "</span>" : "") + "</div>";
    return head + val;
  }

  /* صيغ V2 المتعددة الأسطر — تبقى للملاحق والموجز (سطح تفصيلي لا تحويم مسرح).
     ممنوعة في تبويبات V3: القانون هناك ‎ttMicro‎ حصراً. */
  function ttRow(k, v, color) {
    k = esc(k); v = esc(v);
    return '<div style="display:flex;justify-content:space-between;gap:18px;'
      + 'align-items:center;margin:2px 0">'
      + '<span style="color:' + C.tipMut + '">'
      + (color ? '<span style="display:inline-block;width:8px;height:8px;'
        + "border-radius:50%;background:" + color + ';margin-left:6px"></span>' : "")
      + k + "</span>"
      + '<b style="font-family:\'IBM Plex Sans Arabic\';color:' + C.tipFg + '">'
      + v + "</b></div>";
  }
  const ttTitle = (t) =>
    '<div style="font-weight:700;margin-bottom:5px">' + esc(t) + "</div>";

  /** خط مستهدف ذهبي (لون تعليق حصراً) */
  function targetLine(su, value, label) {
    return {
      silent: true, symbol: "none",
      lineStyle: { color: C.gold, width: 2, type: "dashed" },
      label: {
        show: true, position: "insideStartTop", color: C.gold,
        fontFamily: "Cairo", fontSize: fs(su, 13), formatter: label,
      },
      data: [{ yAxis: value }],
    };
  }

  const base = (su) => ({
    animationDuration: REDUCED ? 0 : 300,
    animationEasing: "cubicOut",
    textStyle: { fontFamily: "Cairo" },
    tooltip: tooltip(su),
  });

  /* ══════════════════════════════════════════════════════════════════════════
     4) سجل المثيلات + إعادة الصبغ عند تبديل السمة
     ══════════════════════════════════════════════════════════════════════════ */

  const registry = new Map();       // id → مثيل ECharts
  const lastOption = new WeakMap(); // مثيل → آخر خيارات مُرَّرت (لإعادة الصبغة)
  const rebuilders = new Set();     // خطافات إعادة بناء كاملة (يسجلها قشرة التبويب)

  /** يلتقط آخر ‎setOption‎ لكل مثيل دون تغيير أي سطر في المنشئات */
  function instrument(inst) {
    if (inst.__rhInstrumented) return inst;
    const original = inst.setOption.bind(inst);
    inst.setOption = function (opt, notMerge, lazy) {
      lastOption.set(inst, opt);
      return original(opt, notMerge, lazy);
    };
    inst.__rhSetOption = original;
    inst.__rhInstrumented = true;
    return inst;
  }

  function chart(id, el) {
    const old = registry.get(id);
    if (old && old.getDom() !== el) { old.dispose(); registry.delete(id); }
    if (!registry.has(id) || registry.get(id).isDisposed()) {
      registry.set(id, instrument(echarts.init(el, null, { renderer: "canvas" })));
    }
    return registry.get(id);
  }
  function disposeAll() {
    for (const c of registry.values()) { if (!c.isDisposed()) c.dispose(); }
    registry.clear();
  }
  /** إتلاف مثيل واحد بمعرفه — تستعمله قشرة التبويبات عند مغادرة التبويب */
  function disposeById(id) {
    const c = registry.get(id);
    if (!c) return false;
    if (!c.isDisposed()) c.dispose();
    registry.delete(id);
    return true;
  }
  function resizeAll() {
    for (const c of registry.values()) { if (!c.isDisposed()) c.resize(); }
  }

  /** تسجيل خطاف إعادة بناء (قشرة التبويبات) — يعيد ‎unregister‎ */
  function onRetheme(fn) {
    rebuilders.add(fn);
    return () => rebuilders.delete(fn);
  }

  /** خريطة استبدال «قيمة قديمة → قيمة جديدة» من لقطة ما قبل التحديث */
  function swapMap(before) {
    const map = new Map();
    const put = (a, b) => {
      if (typeof a === "string" && typeof b === "string" && a && b && a !== b) {
        map.set(a.toLowerCase(), b);
      }
    };
    for (const key of Object.keys(TOKENS)) put(before[key], C[key]);
    for (const key of Object.keys(RAMPS)) {
      const oldArr = before[key], newArr = C[key];
      if (Array.isArray(oldArr) && Array.isArray(newArr)) {
        for (let i = 0; i < newArr.length; i++) put(oldArr[i], newArr[i]);
      }
    }
    put(before.axLine, C.axLine);
    put(before.axSplit, C.axSplit);
    put(before.plateEdge, C.plateEdge);
    return map;
  }

  /** استبدال حرفي عميق لقيم اللوحة داخل شجرة الخيارات (نسخة جديدة) */
  function recolor(node, map, seen) {
    if (typeof node === "string") {
      const hit = map.get(node.toLowerCase());
      return hit || node;
    }
    if (!node || typeof node !== "object") return node;
    if (typeof node === "function") return node;
    if (seen.has(node)) return seen.get(node);
    if (Array.isArray(node)) {
      const out = [];
      seen.set(node, out);
      for (const v of node) out.push(recolor(v, map, seen));
      return out;
    }
    const out = {};
    seen.set(node, out);
    for (const k of Object.keys(node)) {
      const v = node[k];
      out[k] = (typeof v === "function") ? v : recolor(v, map, seen);
    }
    return out;
  }

  /**
   * إعادة تطبيق اللوحة على كل رسم مسجَّل. يُستدعى تلقائياً عند ‎theme:change‎
   * ويجوز استدعاؤه يدوياً. الترتيب: (1) قراءة الرموز الجديدة، (2) إعادة صبغ
   * خيارات كل مثيل حي، (3) تنفيذ خطافات إعادة البناء الكاملة إن وُجدت.
   */
  function refreshAll() {
    const before = refreshTokens();
    const map = swapMap(before);
    for (const inst of registry.values()) {
      if (inst.isDisposed()) continue;
      const opt = lastOption.get(inst);
      if (!opt) { inst.resize(); continue; }
      try {
        const next = map.size ? recolor(opt, map, new WeakMap()) : opt;
        // خيارات التلميح تُعاد بناءً لا استبدالاً (تحمل دوال وقواعد CSS)
        if (next && next.tooltip && !Array.isArray(next.tooltip)) {
          next.tooltip = Object.assign({}, next.tooltip, {
            backgroundColor: C.tipBg,
            textStyle: Object.assign({}, next.tooltip.textStyle,
              { color: C.tipFg }),
            confine: true, position: ttPosition,
          });
        }
        lastOption.set(inst, next);
        inst.__rhSetOption(next, true);
      } catch (e) {
        if (typeof console !== "undefined") {
          console.warn("تعذّرت إعادة صبغ رسم عند تبديل السمة:", e && e.message);
        }
      }
    }
    for (const fn of Array.from(rebuilders)) {
      try { fn(C); } catch (e) {
        if (typeof console !== "undefined") console.warn("خطاف إعادة البناء:", e);
      }
    }
    return C;
  }

  // تبديل السمة → إعادة الصبغ (تأخير إطار واحد كي تكون الرموز الجديدة سارية)
  if (RH.core && RH.core.bus) {
    RH.core.bus.on("theme:change", () => {
      const run = () => refreshAll();
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
      else setTimeout(run, 0);
    });
  }

  let rt;
  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(resizeAll, 120);
    });
  }

  return {
    C, REDUCED, fs, narrow, base, catXAxis, valAxis, hValAxis, hCatAxis,
    tooltip, ttPosition, ttMicro, ttRow, ttTitle, esc, targetLine,
    chart, disposeAll, disposeById, resizeAll, refreshAll, refreshTokens, onRetheme,
    TT_MAX_W, TOKENS,
  };
})();
