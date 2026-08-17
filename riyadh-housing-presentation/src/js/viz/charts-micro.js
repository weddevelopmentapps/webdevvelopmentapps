/* charts-micro.js — مكتبة الرسوم المصغرة (عقد V2_CONTRACTS_EXPANSION §9)
   ──────────────────────────────────────────────────────────────────────
   SVG/DOM نقي بلا ECharts ولا canvas: sparklines، أشرطة مصغرة، رقاقات دلتا،
   شريط نسبة (بديل الgauge المحرّم)، ومحرك المضاعفات الصغيرة — تستهلكها
   لوحة الأوامر وأطلس الأحياء والموجز التنفيذي (تُطبع نصاً وخطوطاً حادة).
   قواعد مقفلة: المكتبة لا تنسق رقماً بنفسها (fmt الممرر أو افتراضات
   RH.core.fmt)؛ كل نص عبر textContent/عقد نص؛ النغمات دلالية حصراً
   (t-neg للعجز/المخالفات، t-gold للمستهدف/خط الأساس)؛ سكونية بالكامل —
   لا حركة ولا مستمعين ولا مؤقتات فلا شيء يحتاج teardown. */
"use strict";

RH.viz.micro = (function () {
  const { h, svg } = RH.core.dom;

  /** النغمات الدلالية المقفلة → أصناف micro.css (ألوانها من tokens.css) */
  const TONES = ["pos", "demand", "neg", "gold", "blue", "neu"];
  const toneCls = (t) => "t-" + (TONES.includes(t) ? t : "neu");

  /** ضبط إتاحة موحد: ariaLabel إلزامي وإلا صار العنصر زخرفياً بصدق */
  function applyAria(el, ariaLabel) {
    if (ariaLabel) {
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", ariaLabel);
    } else {
      el.setAttribute("aria-hidden", "true");
    }
  }

  /** حالة «لا بيانات» الصادقة الموحدة — شرطة محايدة لا خط صفري زائف */
  function emptyMark(el, ariaLabel) {
    const em = h("span", { class: "mcr-empty" }, "—");
    applyAria(em, ariaLabel ? ariaLabel + " — لا بيانات" : null);
    el.appendChild(em);
    return em;
  }

  const isNum = (v) => typeof v === "number" && !Number.isNaN(v);

  /* ═══ sparkline — خط اتجاه مصغر بفجوات صادقة ═══ */
  function sparkline(el, opts) {
    const o = opts || {};
    const values = Array.isArray(o.values) ? o.values : [];
    const nums = values.filter(isNum);
    if (!nums.length) return emptyMark(el, o.ariaLabel);

    const W = o.width || 220, H = o.height || 56;
    const PAD = 4;                       // هامش يمنع قص العلامات عند الأطراف
    const fmt = o.fmt || RH.core.fmt.int;

    // المدى يشمل خط المستهدف كي لا يسقط خارج الإطار
    let min = Math.min(...nums), max = Math.max(...nums);
    if (o.target && isNum(o.target.value)) {
      min = Math.min(min, o.target.value);
      max = Math.max(max, o.target.value);
    }
    if (min === max) { min -= 1; max += 1; } // سلسلة ثابتة: خط وسطي لا قسمة على صفر

    const n = values.length;
    const X = (i) => n === 1 ? W / 2 : PAD + (i / (n - 1)) * (W - PAD * 2);
    const Y = (v) => PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2);

    /* RTL: الزمن يجري يميناً→يساراً كمحاور المشروع — الفهرس 0 عند أقصى اليمين */
    const XR = (i) => W - X(i);

    // مقاطع متصلة تفصلها القيم الغائبة — الفجوة تُرى فجوةً لا خطاً مختلقاً
    const segs = [];
    let cur = [];
    values.forEach((v, i) => {
      if (isNum(v)) cur.push([XR(i), Y(v), i]);
      else if (cur.length) { segs.push(cur); cur = []; }
    });
    if (cur.length) segs.push(cur);

    const root = svg("svg", {
      class: "mcr-spark " + toneCls(o.tone || "pos"),
      viewBox: "0 0 " + W + " " + H,
      preserveAspectRatio: "none",
      focusable: "false",
    });
    applyAria(root, o.ariaLabel);

    for (const seg of segs) {
      const pts = seg.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1));
      if (o.area && seg.length > 1) {
        const first = seg[0], last = seg[seg.length - 1];
        root.appendChild(svg("path", {
          class: "mcr-spark-area",
          d: "M" + first[0].toFixed(1) + "," + (H - PAD)
            + " L" + pts.join(" L")
            + " L" + last[0].toFixed(1) + "," + (H - PAD) + " Z",
        }));
      }
      if (seg.length === 1) {
        // نقطة يتيمة بين فجوتين: تُعلَّم دائرة كي لا تختفي
        root.appendChild(svg("circle", {
          class: "mcr-spark-dot", cx: seg[0][0].toFixed(1), cy: seg[0][1].toFixed(1), r: 2.4,
        }));
      } else {
        root.appendChild(svg("path", {
          class: "mcr-spark-line", d: "M" + pts.join(" L"), fill: "none",
        }));
      }
    }

    // خط المستهدف الذهبي (مستهدف/خط أساس حصراً — عقد الدلالة)
    if (o.target && isNum(o.target.value)) {
      const ty = Y(o.target.value).toFixed(1);
      root.appendChild(svg("line", {
        class: "mcr-spark-target", x1: PAD, x2: W - PAD, y1: ty, y2: ty,
      }));
      if (o.target.label) {
        root.appendChild(svg("text", {
          class: "mcr-spark-target-label",
          x: W - PAD, y: Math.max(9, parseFloat(ty) - 3), "text-anchor": "end",
        }, String(o.target.label)));
      }
    }

    // علامة آخر قيمة (آخر عنصر زمنياً = أقصى اليسار في RTL)
    if (o.markLast) {
      let li = -1;
      for (let i = values.length - 1; i >= 0; i--) { if (isNum(values[i])) { li = i; break; } }
      if (li >= 0) {
        const cx = XR(li), cy = Y(values[li]);
        root.appendChild(svg("circle", {
          class: "mcr-spark-dot", cx: cx.toFixed(1), cy: cy.toFixed(1), r: 3,
        }));
        root.appendChild(svg("text", {
          class: "mcr-spark-last",
          x: Math.max(PAD, cx - 5).toFixed(1),
          y: (cy > H / 2 ? cy - 6 : cy + 12).toFixed(1),
          "text-anchor": "start",
        }, fmt(values[li])));
      }
    }

    el.appendChild(root);
    return root;
  }

  /* ═══ microBars — أشرطة أفقية مصغرة كثيفة (RTL: تنمو من اليمين) ═══ */
  function microBars(el, opts) {
    const o = opts || {};
    const items = (o.items || []).filter((it) => it && isNum(it.value));
    if (!items.length) return emptyMark(el, o.ariaLabel);
    const fmt = o.fmt || RH.core.fmt.int;
    const max = isNum(o.max) && o.max > 0
      ? o.max : Math.max(...items.map((it) => it.value), 0) || 1;

    const root = h("div", { class: "mcr-bars " + toneCls(o.tone || "pos") });
    applyAria(root, o.ariaLabel);
    for (const it of items) {
      const pct = Math.max(0, Math.min(100, (it.value / max) * 100));
      root.appendChild(h("div", { class: "mcr-bar" },
        h("span", { class: "mcr-bar-label" }, String(it.label)),
        h("span", { class: "mcr-bar-track" },
          h("span", {
            class: "mcr-bar-fill" + (it.tone ? " " + toneCls(it.tone) : ""),
            style: { width: pct.toFixed(2) + "%" },
          })),
        h("b", { class: "mcr-bar-val" }, fmt(it.value)),
      ));
    }
    el.appendChild(root);
    return root;
  }

  /* ═══ deltaChip — رقاقة تغيّر بدلالة صادقة الاتجاه ═══ */
  function deltaChip(el, opts) {
    const o = opts || {};
    const fmt = o.fmt || RH.core.fmt.int;
    const good = o.positiveIsGood !== false;   // false للعجز/المخالفات
    let cls, arrow, text;
    if (!isNum(o.value) || o.value === 0) {
      cls = "neu"; arrow = ""; text = isNum(o.value) ? fmt(0) : "—";
    } else if (o.value > 0) {
      cls = good ? "pos" : "neg"; arrow = "▲"; text = fmt(o.value);
    } else {
      cls = good ? "neg" : "pos"; arrow = "▼"; text = fmt(Math.abs(o.value));
    }
    const chip = h("span", {
      class: "mcr-delta " + cls,
      title: o.title || null,
    },
      arrow ? h("span", { class: "mcr-delta-arrow", "aria-hidden": "true" }, arrow) : null,
      // عزل اتجاهي حتمي للرقم داخل النص العربي
      h("b", {}, RH.core.fmt.iso(text)),
      o.label ? h("span", { class: "mcr-delta-label" }, String(o.label)) : null,
    );
    applyAria(chip, o.ariaLabel || null);
    el.appendChild(chip);
    return chip;
  }

  /* ═══ ratioBar — شريط نسبة أفقي (البديل القانوني للgauge المحرّم) ═══ */
  function ratioBar(el, opts) {
    const o = opts || {};
    if (!isNum(o.pct)) return emptyMark(el, o.ariaLabel);
    const fmt = o.fmt || RH.core.fmt.pct;
    const clamped = Math.max(0, Math.min(100, o.pct));

    const root = h("div", {
      class: "mcr-ratio " + toneCls(o.tone || "pos"),
      title: clamped !== o.pct ? "القيمة خارج 0–100 وقُصّت للعرض" : null,
    });
    applyAria(root, o.ariaLabel);
    const track = h("div", { class: "mcr-ratio-track" },
      h("div", { class: "mcr-ratio-fill", style: { width: clamped.toFixed(2) + "%" } }));
    // شاخص المستهدف الذهبي (مستهدف حصراً) — RTL: الإزاحة من اليمين
    if (o.target && isNum(o.target.pct)) {
      const tp = Math.max(0, Math.min(100, o.target.pct));
      track.appendChild(h("span", {
        class: "mcr-ratio-target",
        style: { insetInlineStart: tp.toFixed(2) + "%" },
        title: o.target.label || null,
      }));
    }
    root.appendChild(track);
    root.appendChild(h("div", { class: "mcr-ratio-meta" },
      h("b", { class: "mcr-ratio-val" }, fmt(o.pct)),
      o.target && isNum(o.target.pct) && o.target.label
        ? h("span", { class: "mcr-ratio-target-label" }, String(o.target.label)) : null,
    ));
    // سطر الوسم الملازم — منهجية 81.6٪ وأمثالها تمرر هنا إلزامياً
    if (o.note) root.appendChild(h("div", { class: "mcr-ratio-note" }, String(o.note)));
    el.appendChild(root);
    return root;
  }

  /* ═══ smallMultiples — محرك المضاعفات الصغيرة (شبكة خلايا موحدة) ═══ */
  function smallMultiples(el, opts) {
    const o = opts || {};
    if (typeof o.renderCell !== "function") {
      throw new Error("smallMultiples: renderCell(cellEl, item, i) إلزامية");
    }
    const items = o.items || [];
    const cols = o.cols || (items.length <= 6 ? Math.max(1, Math.min(3, items.length)) : 4);

    const root = h("div", {
      class: "mcr-sm",
      style: { gridTemplateColumns: "repeat(" + cols + ", 1fr)" },
    });
    if (o.ariaLabel) root.setAttribute("aria-label", o.ariaLabel);
    if (o.title) {
      el.appendChild(h("div", { class: "mcr-sm-title" }, String(o.title)));
    }

    let cells = [];
    function build(list) {
      RH.core.dom.clear(root);
      cells = [];
      if (!list.length) { emptyMark(root, o.ariaLabel); return; }
      list.forEach((item, i) => {
        const cell = h("div", { class: "mcr-sm-cell" });
        root.appendChild(cell);
        o.renderCell(cell, item, i);
        cells.push(cell);
      });
    }
    build(items);
    el.appendChild(root);
    return {
      el: root,
      get cells() { return cells; },
      update: (list) => build(list || []),
    };
  }

  return { sparkline, microBars, deltaChip, ratioBar, smallMultiples, TONES };
})();
