/* ============================================================
   Journey canvas «مسار الرحلة» — serpentine journey visualization.
   journey-canvas spec §0–§9. Exposes RGP.journeyCanvas:
     screen()        full #/portal/journeys view (shell included)
     compact()       read-only public landing strip
     rail(request)   5-node macro rail for request detail
     build(jr, opts) core engine — returns a DOM node
   Pure SVG measured-overlay wire, RTL-first, offline, ES5 IIFE.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;
  var SVG_NS = "http://www.w3.org/2000/svg";

  /* ---------------- i18n — §8 keys with local fallback ----------------
     01-i18n.js is expected to carry jc.*; until it does, this table keeps
     the module fully functional (checked once per key, then cached). */
  var JCFB = {
    "jc.stage":           { ar: "المحطة", en: "Stage" },
    "jc.of":              { ar: "من", en: "of" },
    "jc.youAreHere":      { ar: "أنت هنا", en: "You are here" },
    "jc.trackProject":    { ar: "تتبّع مشروعك", en: "Track your project" },
    "jc.exploreOnly":     { ar: "استكشاف فقط", en: "Explore only" },
    "jc.legend.done":     { ar: "مكتملة", en: "Completed" },
    "jc.legend.active":   { ar: "قيد التنفيذ", en: "In progress" },
    "jc.legend.blocked":  { ar: "بانتظار إجراء", en: "Action required" },
    "jc.legend.upcoming": { ar: "قادمة", en: "Upcoming" },
    "jc.sla":             { ar: "المدة المستهدفة", en: "Target duration" },
    "jc.fastTrack":       { ar: "بمسار الأولوية:", en: "Fast-track:" },
    "jc.actor":           { ar: "الجهة المنفذة", en: "Responsible party" },
    "jc.docs":            { ar: "المستندات المطلوبة", en: "Required documents" },
    "jc.prereqs":         { ar: "المتطلبات المسبقة", en: "Prerequisites" },
    "jc.prereqShort":     { ar: "متطلبات", en: "prerequisites" },
    "jc.apply":           { ar: "قدّم الطلب", en: "Start request" },
    "jc.reapply":         { ar: "أعد التقديم", en: "Resubmit" },
    "jc.viewRequest":     { ar: "عرض طلبي", en: "View my request" },
    "jc.continueDraft":   { ar: "أكمل المسودة", en: "Continue draft" },
    "jc.viewDoc":         { ar: "عرض الوثيقة", en: "View document" },
    "jc.viewDecision":    { ar: "عرض القرار", en: "View decision" },
    "jc.blockedHint":     { ar: "تتطلب هذه الخطوة إتمام الخطوات السابقة أولًا", en: "Complete the previous steps first" },
    "jc.waypointHint":    { ar: "تنفَّذ هذه الخطوة من الجهة المختصة دون حاجة لطلب منك", en: "Performed by the responsible entity — no request needed from you" },
    "jc.paths":           { ar: "مسارات اعتماد المخطط", en: "Plan-approval paths" },
    "jc.choosePath":      { ar: "اختر هذا المسار", en: "Choose this path" },
    "jc.steps":           { ar: "خطوات", en: "steps" },
    "jc.railLabel":       { ar: "مراحل الطلب", en: "Request progress" }
  };
  var jcMiss = {};
  function jt(key) {
    if (jcMiss[key] === undefined) jcMiss[key] = (t(key) === key);
    return jcMiss[key] ? td(JCFB[key] || { ar: key, en: key }) : t(key);
  }

  /* ---------------- constants ---------------- */
  var DONE_STATES = ["approved", "closed"];
  var RUNNING_STATES = ["submitted", "screening", "in_review", "resubmitted", "external_review", "decision_due"];
  var CAT_ICON = {
    planning: "map", permits: "doc", construction: "building", building: "building",
    infrastructure: "layers", environment: "globe", operations: "settings", operation: "settings",
    investment: "chart", compliance: "shield", enablement: "shield"
  };
  var JOURNEY_ICON = { planning: "map", building: "building", investor: "chart", operation: "settings", industrial: "tower" };
  var STATUS_PILL = {
    "done":           { ar: "مكتملة", en: "Completed" },
    "active":         { ar: "قيد التنفيذ", en: "In progress" },
    "blocked-warn":   { ar: "بانتظار إجراء منك", en: "Action required" },
    "blocked-danger": { ar: "مرفوض — راجع القرار", en: "Declined — review decision" },
    "upcoming":       { ar: "قادمة", en: "Upcoming" }
  };

  function rm() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function isRTL() { return document.documentElement.getAttribute("dir") === "rtl"; }
  function svgEl(tag) { return document.createElementNS(SVG_NS, tag); }
  function lang() { return RGP.i18n.lang; }

  /* ================================================================
     §7.2 — request → step index (latest non-cancelled per serviceId)
     ================================================================ */
  function requestIndex(user, project) {
    var reqs = RGP.store.state.requests.filter(function (r) {
      if (project) return r.projectId === project.id;
      return r.createdById === user.id && !r.projectId;
    });
    var byService = {};
    reqs.forEach(function (r) {
      if (r.state === "cancelled") return;
      var prev = byService[r.serviceId];
      if (!prev || r.createdAt > prev.createdAt) byService[r.serviceId] = r;
    });
    return byService;
  }

  /* ================================================================
     §7.3 — per-step status: done | active | blocked | upcoming
     ================================================================ */
  function stepStatuses(steps, byService) {
    var flavor = {};
    var st = steps.map(function (s, i) {
      if (s.serviceId && byService[s.serviceId]) {
        var r = byService[s.serviceId];
        if (DONE_STATES.indexOf(r.state) >= 0) return "done";
        if (r.state === "returned") { flavor[i] = "warn"; return "blocked"; }
        if (r.state === "rejected") { flavor[i] = "danger"; return "blocked"; }
        if (r.state === "draft") return "active";
        if (RUNNING_STATES.indexOf(r.state) >= 0) return "active";
      }
      return null;
    });
    var lastDone = -1;
    st.forEach(function (x, i) { if (x === "done") lastDone = i; });
    for (var i = 0; i < st.length; i++) {
      if (st[i] === null) st[i] = (i <= lastDone) ? "done" : "upcoming";
    }
    /* waypoint right after the last done step, before any active, is
       implicitly active — the Amanah is working */
    var firstActive = st.indexOf("active");
    if (firstActive < 0 && lastDone >= 0 && lastDone + 1 < st.length &&
        steps[lastDone + 1].kind !== "service" && st[lastDone + 1] === "upcoming") {
      st[lastDone + 1] = "active";
    }
    /* downstream lock after first blocked */
    var firstBlocked = st.indexOf("blocked");
    if (firstBlocked >= 0) {
      for (var k = firstBlocked + 1; k < st.length; k++) {
        if (st[k] !== "done") st[k] = "upcoming";
      }
    }
    return { st: st, flavor: flavor };
  }

  function currentIndex(st) {
    var i = st.indexOf("active");
    if (i < 0) i = st.indexOf("blocked");
    if (i < 0) i = st.indexOf("upcoming");
    if (i < 0) i = st.length - 1;
    return i;
  }

  /* ================================================================
     Wire engine — measured SVG overlay (§1.2 / §5 / §6)
     ================================================================ */
  var gradSeq = 0;

  function makeGradient(defs, id, clsA, clsB) {
    var g = svgEl("linearGradient");
    g.setAttribute("id", id);
    g.setAttribute("x1", isRTL() ? "1" : "0"); g.setAttribute("y1", "0");
    g.setAttribute("x2", isRTL() ? "0" : "1"); g.setAttribute("y2", "0");
    var s1 = svgEl("stop"); s1.setAttribute("offset", "0"); s1.setAttribute("class", clsA);
    var s2 = svgEl("stop"); s2.setAttribute("offset", "1"); s2.setAttribute("class", clsB);
    g.appendChild(s1); g.appendChild(s2);
    defs.appendChild(g);
  }

  function wireSvg(host) {
    var svg = host._jcSvg;
    if (!svg || svg.parentNode !== host) {
      svg = svgEl("svg");
      svg.setAttribute("class", "jc-wire");
      svg.setAttribute("aria-hidden", "true");
      host.insertBefore(svg, host.firstChild);
      host._jcSvg = svg;
    }
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var w = Math.max(1, host.offsetWidth), ht = Math.max(1, host.offsetHeight);
    svg.setAttribute("width", w); svg.setAttribute("height", ht);
    svg.setAttribute("viewBox", "0 0 " + w + " " + ht);
    return svg;
  }

  function segPathD(a, b, o, hostW) {
    if (o && o.vertical) {
      /* near-vertical, gentle 8px lean toward the text side */
      var lean = isRTL() ? -8 : 8;
      var dy = b.y - a.y;
      return "M" + a.x + " " + a.y +
        " C" + (a.x + lean) + " " + (a.y + dy * 0.4) + ", " +
        (b.x + lean) + " " + (b.y - dy * 0.4) + ", " + b.x + " " + b.y;
    }
    if (Math.abs(a.y - b.y) < 6) {
      var dx = b.x - a.x;
      return "M" + a.x + " " + a.y +
        " C" + (a.x + 0.4 * dx) + " " + a.y + ", " +
        (b.x - 0.4 * dx) + " " + b.y + ", " + b.x + " " + b.y;
    }
    /* row turn — dignified U-turn arc bulging outward */
    var K = (a.x > hostW / 2) ? 84 : -84;
    return "M" + a.x + " " + a.y +
      " C" + (a.x + K) + " " + a.y + ", " +
      (b.x + K) + " " + b.y + ", " + b.x + " " + b.y;
  }

  function drawWire(host, centers, segClasses, o) {
    o = o || {};
    var svg = wireSvg(host);
    var w = Math.max(1, host.offsetWidth);
    var defs = svgEl("defs");
    var gid = "jcGradDone-" + (++gradSeq);
    makeGradient(defs, gid, "jc-g-done-a", "jc-g-done-b");
    svg.appendChild(defs);
    var segs = [];
    for (var i = 0; i < centers.length - 1; i++) {
      var p = svgEl("path");
      p.setAttribute("d", segPathD(centers[i], centers[i + 1], o, w));
      p.setAttribute("class", "jc-seg " + (segClasses[i] || "jc-seg-explore"));
      if ((segClasses[i] || "").indexOf("jc-seg-done") >= 0) p.setAttribute("stroke", "url(#" + gid + ")");
      svg.appendChild(p);
      segs.push(p);
    }
    host._jcSegs = segs;
    return { svg: svg, segs: segs };
  }

  /* §4.1 step 2 — the wire draws itself; dotted segments fade in */
  function entranceWire(segs) {
    if (rm() || !segs.length) return;
    var per = Math.max(40, Math.round(900 / segs.length));
    segs.forEach(function (p, i) {
      var cls = p.getAttribute("class") || "";
      var delay = 120 + i * per;
      if (cls.indexOf("jc-seg-done") >= 0 || cls.indexOf("jc-seg-explore") >= 0) {
        var L = 0;
        try { L = p.getTotalLength(); } catch (e) { L = 0; }
        if (!L) return;
        p.style.strokeDasharray = L + " " + L;
        p.style.strokeDashoffset = L;
        p.style.transition = "stroke-dashoffset " + per + "ms var(--ease-decelerate) " + delay + "ms";
        requestAnimationFrame(function () { p.style.strokeDashoffset = "0"; });
        p.addEventListener("transitionend", function te() {
          p.removeEventListener("transitionend", te);
          p.style.transition = ""; p.style.strokeDasharray = ""; p.style.strokeDashoffset = "";
        });
      } else {
        p.style.opacity = "0";
        p.style.transition = "opacity 200ms var(--ease-decelerate) " + delay + "ms";
        requestAnimationFrame(function () { p.style.opacity = "1"; });
        p.addEventListener("transitionend", function te2() {
          p.removeEventListener("transitionend", te2);
          p.style.transition = ""; p.style.opacity = "";
        });
      }
    });
  }

  /* segment i (node i → i+1) stroke state — §1.2 */
  function segClass(ctx, i) {
    if (!ctx.st) return "jc-seg-explore";
    if (ctx.st[i] === "blocked") {
      return ctx.flavor[i] === "danger" ? "jc-seg-blocked jc-fl-danger" : "jc-seg-blocked";
    }
    if (i + 1 === ctx.current) {
      return rm() ? "jc-seg-active" : "jc-seg-active jc-seg-flow";
    }
    if (ctx.st[i] === "done" && ctx.st[i + 1] === "done") return "jc-seg-done";
    return "jc-seg-upcoming";
  }

  /* ================================================================
     Node cells (§1.3, §3)
     ================================================================ */
  function statusPillEl(status, flavor, req) {
    if (req && req.state === "draft") return h("span.pill.st-draft.sm", null, h("span.dot"), t("state.draft"));
    var key = status === "blocked" ? "blocked-" + (flavor || "warn") : status;
    var label = STATUS_PILL[key];
    if (!label) return null;
    var cls = status === "done" ? "ok" : status === "active" ? "info"
      : key === "blocked-danger" ? "dang" : status === "blocked" ? "warn" : "plain";
    return h("span.pill." + cls + ".sm", null, td(label));
  }

  function prereqLabel(n) {
    if (lang() === "ar") {
      if (n === 1) return "متطلب واحد";
      if (n === 2) return "متطلبان";
      return RGP.fmtNum(n, { dec: 0 }) + " " + jt("jc.prereqShort");
    }
    return RGP.fmtNum(n, { dec: 0 }) + " " + (n === 1 ? "prerequisite" : jt("jc.prereqShort"));
  }

  function cellAria(s, i, n, ctx) {
    var out = jt("jc.stage") + " " + (i + 1) + " " + jt("jc.of") + " " + n + ": " + td(s.title);
    if (ctx.st) {
      var key = ctx.st[i] === "blocked" ? "blocked-" + (ctx.flavor[i] || "warn") : ctx.st[i];
      if (STATUS_PILL[key]) out += " — " + td(STATUS_PILL[key]);
    }
    return out;
  }

  function buildCell(s, i, steps, ctx) {
    var n = steps.length;
    var status = ctx.st ? ctx.st[i] : "explore";
    var flavor = ctx.flavor ? ctx.flavor[i] : null;
    var svc = s.serviceId ? RGP.store.service(s.serviceId) : null;
    var isCurrent = !!ctx.st && i === ctx.current;
    var kindCls = s.kind === "service" ? ".jc-kind-svc" : s.kind === "choice" ? ".jc-kind-choice" : ".jc-kind-way";
    var cell = h("button.jc-cell" + kindCls + ".jc-st-" + status + (flavor ? ".jc-fl-" + flavor : ""), {
      type: "button", role: "listitem", tabindex: "-1",
      "aria-label": cellAria(s, i, n, ctx)
    });
    if (isCurrent) cell.setAttribute("aria-current", "step");

    /* --- node visual --- */
    var node = h("span.jc-node" + (s.kind === "service" ? ".jc-svc" : s.kind === "choice" ? ".jc-choice" : ".jc-way"));
    var box = s.kind === "review" || s.kind === "action" ? 52 : 68;
    var rr = s.kind === "service" ? 30 : 22;
    if (s.kind !== "choice") {
      var ringSvg = svgEl("svg");
      ringSvg.setAttribute("class", "jc-ring-svg");
      ringSvg.setAttribute("viewBox", "0 0 " + box + " " + box);
      ringSvg.setAttribute("aria-hidden", "true");
      var ring = svgEl("circle");
      ring.setAttribute("cx", box / 2); ring.setAttribute("cy", box / 2); ring.setAttribute("r", rr);
      ring.setAttribute("class", "jc-ring");
      if (status === "active") {
        /* 270° arc, quiet orbital */
        var c = 2 * Math.PI * rr;
        ring.setAttribute("stroke-dasharray", (c * 0.75).toFixed(1) + " " + (c * 0.25).toFixed(1));
        ring.setAttribute("stroke-linecap", "round");
        if (!rm()) ring.classList.add("jc-ring-spin");
      }
      ringSvg.appendChild(ring);
      node.appendChild(ringSvg);
    }
    node.appendChild(h("span.jc-disc"));
    var iconName = s.kind === "service" ? (svc ? (CAT_ICON[svc.category] || "doc") : "doc")
      : s.kind === "review" ? "eye" : s.kind === "action" ? "bolt" : "swap";
    node.appendChild(h("span.jc-ic", null, UI.icon(iconName, s.kind === "service" ? 22 : s.kind === "choice" ? 18 : 16)));
    node.appendChild(status === "done"
      ? h("span.jc-num.done", null, UI.icon("check", 12))
      : h("span.jc-num.num", null, String(i + 1)));
    var docsN = (svc && svc.requiredDocuments) ? svc.requiredDocuments.length : 0;
    if (s.kind === "service" && docsN > 0) {
      node.appendChild(h("span.jc-docs", null, UI.icon("docs", 10), h("span.num", null, String(docsN))));
    }
    if (svc && svc.gigaFastTrack && ctx.personaType === "giga_entity") node.appendChild(h("span.jc-ft-dot"));
    if (isCurrent) node.classList.add("jc-here");
    cell.appendChild(node);

    /* §2.5 «أنت هنا» flag */
    if (isCurrent) cell.appendChild(h("span.jc-here-chip", null, jt("jc.youAreHere")));

    /* --- label block --- */
    var prereqN = (svc && svc.prerequisites) ? svc.prerequisites.length : 0;
    cell.appendChild(h("span.jc-label-block", null,
      h("span.jc-label", null,
        status === "blocked" && flavor !== "danger" ? h("span.jc-alert-ic", null, UI.icon("alert", 14)) : null,
        td(s.title)),
      s.slaDays ? h("span.jc-sub.t-caption.mut.num", null, RGP.fmtWorkdays(s.slaDays)) : null,
      s.kind === "service" && prereqN > 0
        ? h("span.jc-dep", null, UI.icon("shield", 11), prereqLabel(prereqN)) : null));

    if (ctx.interactive) {
      cell.addEventListener("click", function (e) {
        var toPrereqs = !!(e.target && e.target.closest && e.target.closest(".jc-dep"));
        openPanel(ctx, i, { scrollPrereqs: toPrereqs, trigger: cell });
      });
    }
    return cell;
  }

  /* ================================================================
     Canvas — serpentine grid / vertical spine (§1.1, §5)
     ================================================================ */
  function buildCanvas(steps, ctx, o) {
    o = o || {};
    var canvas = h("div.jc-canvas" + (o.stubs ? ".has-fork" : ""));
    var grid = h("div.jc-grid", { role: "list", "aria-label": td(ctx.journey.name) });
    var cells = steps.map(function (s, i) { return buildCell(s, i, steps, ctx); });
    cells.forEach(function (c) { grid.appendChild(c); });
    canvas.appendChild(grid);

    /* screen-reader mirror (§2.4) */
    canvas.appendChild(h("ol.jc-sr", null, steps.map(function (s, i) {
      return h("li", null, cellAria(s, i, steps.length, ctx));
    })));

    /* roving tabindex — current (or first) node */
    var focusIdx = (ctx.st && ctx.current >= 0) ? ctx.current : 0;
    if (cells[focusIdx]) cells[focusIdx].setAttribute("tabindex", "0");

    function layout() {
      var vw = window.innerWidth;
      var vertical = vw <= 768;
      var cols = vw >= 1024 ? 4 : 3;
      canvas.classList.toggle("vertical", vertical);
      cells.forEach(function (c, i) {
        if (vertical) { c.style.gridRow = ""; c.style.gridColumn = ""; return; }
        var row = Math.floor(i / cols);
        var col = (row % 2 === 0) ? (i % cols) : (cols - 1 - (i % cols));
        c.style.gridRow = String(row + 1);
        c.style.gridColumn = String(col + 1);
      });
      canvas._jcCols = cols;
      canvas._jcVertical = vertical;
    }

    function draw(entrance) {
      if (!canvas.isConnected) return;
      var rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      var centers = cells.map(function (c) {
        var nodeEl = c.querySelector(".jc-node");
        var r = nodeEl.getBoundingClientRect();
        return { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top };
      });
      var segCls = [];
      for (var i = 0; i < steps.length - 1; i++) segCls.push(segClass(ctx, i));
      var res = drawWire(canvas, centers, segCls, { vertical: canvas._jcVertical });
      if (o.stubs && ctx.paths) drawStubs(canvas, res.svg, ctx, cells, steps, rect);
      canvas._jcW = rect.width; canvas._jcH = rect.height;
      if (entrance) entranceWire(res.segs);
    }
    canvas._jcRedraw = function () { layout(); draw(false); };

    /* §2.4 keyboard traversal — logical order follows reading direction */
    grid.addEventListener("keydown", function (e) {
      var idx = cells.indexOf(document.activeElement);
      if (idx < 0) return;
      var cols = canvas._jcVertical ? 1 : (canvas._jcCols || 4);
      var rtl = isRTL();
      var nxt = null;
      if (e.key === "ArrowRight") nxt = idx + (rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") nxt = idx + (rtl ? 1 : -1);
      else if (e.key === "ArrowDown") nxt = idx + cols;
      else if (e.key === "ArrowUp") nxt = idx - cols;
      else if (e.key === "Home") nxt = 0;
      else if (e.key === "End") nxt = cells.length - 1;
      if (nxt == null) return;
      e.preventDefault();
      nxt = RGP.clamp(nxt, 0, cells.length - 1);
      cells[idx].setAttribute("tabindex", "-1");
      cells[nxt].setAttribute("tabindex", "0");
      cells[nxt].focus();
    });

    /* §2.3 hover — pointer devices only */
    if (ctx.interactive && matchMedia("(hover: hover)").matches) {
      cells.forEach(function (c, i) {
        var timer = null;
        c.addEventListener("mouseenter", function () {
          highlightSegs(canvas, i, true);
          timer = setTimeout(function () { showTip(c, steps[i]); }, 400);
        });
        c.addEventListener("mouseleave", function () {
          highlightSegs(canvas, i, false);
          clearTimeout(timer);
          hideTip();
        });
      });
    }

    /* §4.1 entrance choreography — once per mount */
    if (o.entrance && !rm()) {
      canvas.classList.add("jc-enter");
      cells.forEach(function (c, i) {
        var node = c.querySelector(".jc-node");
        node.classList.add("jc-pop");
        node.style.animationDelay = (160 + i * 70) + "ms";
        var lb = c.querySelector(".jc-label-block");
        if (lb) { lb.classList.add("jc-rise"); lb.style.animationDelay = (200 + i * 70) + "ms"; }
        var chip = c.querySelector(".jc-here-chip");
        var chipDelay = 160 + cells.length * 70 + 200;
        if (chip) { chip.classList.add("jc-chip-in"); chip.style.animationDelay = chipDelay + "ms"; }
        if (node.classList.contains("jc-here")) node.style.setProperty("--jc-pulse-delay", chipDelay + "ms");
      });
    }

    layout();
    requestAnimationFrame(function () { draw(!!o.entrance); });

    /* redraw on resize — debounced 120ms, skipped when size unchanged */
    if (typeof ResizeObserver !== "undefined") {
      var deb = RGP.debounce(function () {
        if (!canvas.isConnected) { ro.disconnect(); return; }
        var r = canvas.getBoundingClientRect();
        if (Math.abs(r.width - (canvas._jcW || 0)) < 1 && Math.abs(r.height - (canvas._jcH || 0)) < 1) return;
        layout(); draw(false);
      }, 120);
      var ro = new ResizeObserver(deb);
      ro.observe(canvas);
    }

    canvas._jcCells = cells;
    return canvas;
  }

  function highlightSegs(canvas, i, on) {
    var segs = canvas._jcSegs || [];
    [segs[i - 1], segs[i]].forEach(function (p) {
      if (!p) return;
      if (on) p.classList.add("hl"); else p.classList.remove("hl");
    });
  }

  /* ---------------- tooltip (§2.3) ---------------- */
  var tipEl = null;
  function showTip(cell, s) {
    hideTip();
    if (!cell.isConnected) return;
    var node = cell.querySelector(".jc-node");
    var r = node.getBoundingClientRect();
    tipEl = h("div.jc-tip", null,
      h("div.jc-tip-title", null, td(s.title)),
      h("div.t-caption.mut", { style: { fontWeight: 500 } }, td(s.actor)),
      s.slaDays ? h("div.t-caption.mut.num", { style: { fontWeight: 500 } }, RGP.fmtWorkdays(s.slaDays)) : null);
    document.body.appendChild(tipEl);
    var tw = tipEl.offsetWidth;
    var left = RGP.clamp(r.left + r.width / 2 - tw / 2, 8, window.innerWidth - tw - 8);
    tipEl.style.left = left + "px";
    tipEl.style.top = Math.max(8, r.top + window.scrollY - tipEl.offsetHeight - 10) + "px";
  }
  function hideTip() { if (tipEl) { tipEl.remove(); tipEl = null; } }

  /* ---------------- fork stubs (§1.4) ---------------- */
  function drawStubs(canvas, svg, ctx, cells, steps, rect) {
    var ci = -1;
    steps.forEach(function (s, i) { if (s.kind === "choice") ci = i; });
    if (ci < 0 || !cells[ci]) return;
    var nodeEl = cells[ci].querySelector(".jc-node");
    var r = nodeEl.getBoundingClientRect();
    var cx = r.left + r.width / 2 - rect.left;
    var cy = r.top + r.height - rect.top;
    var selIdx = 0;
    ctx.paths.forEach(function (p, k) { if (p.id === ctx.pathId) selIdx = k; });
    var stubs = [];
    for (var k = 0; k < ctx.paths.length; k++) {
      var tx = cx + (k - 1) * 28, ty = cy + 24;
      var p2 = svgEl("path");
      p2.setAttribute("d", "M" + cx + " " + cy + " C" + cx + " " + (cy + 12) + ", " + tx + " " + (ty - 12) + ", " + tx + " " + ty);
      p2.setAttribute("class", "jc-stub" + (k === selIdx ? " sel" : ""));
      svg.appendChild(p2);
      var dot = svgEl("circle");
      dot.setAttribute("cx", tx); dot.setAttribute("cy", ty + 4); dot.setAttribute("r", "2.5");
      dot.setAttribute("class", "jc-stub-dot" + (k === selIdx ? " sel" : ""));
      svg.appendChild(dot);
      stubs.push({ path: p2, dot: dot });
    }
    canvas._jcStubs = stubs;
  }

  function restyleStubs(canvas, selIdx) {
    (canvas._jcStubs || []).forEach(function (s2, k) {
      s2.path.setAttribute("class", "jc-stub" + (k === selIdx ? " sel" : ""));
      s2.dot.setAttribute("class", "jc-stub-dot" + (k === selIdx ? " sel" : ""));
    });
  }

  /* ================================================================
     Panel / bottom sheet (§2.1, §2.2, §7.4)
     ================================================================ */
  var panel = null;

  function closePanel() {
    if (!panel) return;
    var p = panel; panel = null;
    document.removeEventListener("keydown", p.onKey);
    hideTip();
    p.wrap.classList.remove("open");
    p.wrap.classList.add("closing");
    var kill = function () { if (p.wrap.parentNode) p.wrap.remove(); };
    if (rm()) kill(); else setTimeout(kill, 300);
    if (p.trigger && p.trigger.focus && document.contains(p.trigger)) p.trigger.focus();
  }

  function scrollPrereqs(body) {
    var el = body.querySelector(".jc-prereqs");
    if (el) el.scrollIntoView({ block: "start", behavior: rm() ? "auto" : "smooth" });
  }

  function openPanel(ctx, i, o) {
    o = o || {};
    var content = panelContent(ctx, i);

    if (panel) { /* reuse — swap content with cross-fade (§2.1) */
      panel.trigger = o.trigger || panel.trigger;
      var b = panel.body;
      b.classList.add("swap");
      setTimeout(function () {
        b.innerHTML = "";
        b.appendChild(content);
        b.classList.remove("swap");
        if (o.scrollPrereqs) scrollPrereqs(b);
      }, rm() ? 0 : 150);
      return;
    }

    var body = h("div.jc-panel-body", null, content);
    var closeBtn = h("button.iconbtn.jc-panel-x", {
      "aria-label": lang() === "ar" ? "إغلاق" : "Close",
      onclick: closePanel
    }, UI.icon("x", 18));
    var handle = h("div.jc-sheet-handle", null, h("span"));
    var pEl = h("div.jc-panel", { role: "dialog", "aria-modal": "true" }, handle, closeBtn, body);
    var scrim = h("div.jc-scrim", { onclick: closePanel });
    var wrap = h("div.jc-panel-wrap", null, scrim, pEl);
    (RGP.$("#overlay-root") || document.body).appendChild(wrap);

    function onKey(e) { if (e.key === "Escape") closePanel(); }
    document.addEventListener("keydown", onKey);
    panel = { wrap: wrap, el: pEl, body: body, onKey: onKey, trigger: o.trigger };

    /* bottom-sheet drag-to-close (≥60px) */
    var startY = null, curY = 0;
    handle.addEventListener("pointerdown", function (e) {
      startY = e.clientY; curY = 0;
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    });
    handle.addEventListener("pointermove", function (e) {
      if (startY == null) return;
      curY = Math.max(0, e.clientY - startY);
      pEl.style.transition = "none";
      pEl.style.transform = "translateY(" + curY + "px)";
    });
    function endDrag() {
      if (startY == null) return;
      pEl.style.transition = "";
      if (curY >= 60) closePanel(); else pEl.style.transform = "";
      startY = null; curY = 0;
    }
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);

    requestAnimationFrame(function () { wrap.classList.add("open"); });
    closeBtn.focus();
    if (o.scrollPrereqs) setTimeout(function () { scrollPrereqs(body); }, rm() ? 0 : 300);
  }

  function metaRow(icon, label, value) {
    return h("div.jc-meta-row", null,
      h("span.jc-meta-ic", null, UI.icon(icon, 16)),
      h("span.jc-meta-lb", null, label),
      h("div.jc-meta-val", null, value));
  }

  function panelHead(ctx, i, title, status, flavor, req, code) {
    return h("div.jc-panel-head", null,
      h("div.kicker", null, jt("jc.stage") + " ", h("span.num", null, String(i + 1))),
      h("h2.t-title3", null, title),
      h("div.flex.g1.wrap.mbs-1", null,
        ctx.st ? statusPillEl(status, flavor, req) : null,
        code ? h("span.pill.plain.sm.num", null, code) : null));
  }

  function panelContent(ctx, i) {
    var s = ctx.steps[i];
    if (s.kind === "choice") return choicePanel(ctx, i);
    if (s.kind !== "service") return waypointPanel(ctx, i);
    return servicePanel(ctx, i);
  }

  /* §2.2 — service node panel */
  function servicePanel(ctx, i) {
    var s = ctx.steps[i];
    var svc = s.serviceId ? RGP.store.service(s.serviceId) : null;
    var status = ctx.st ? ctx.st[i] : "explore";
    var flavor = ctx.flavor ? ctx.flavor[i] : null;
    var req = (ctx.byService && s.serviceId) ? ctx.byService[s.serviceId] : null;
    var u = ctx.user;
    var out = h("div", null,
      panelHead(ctx, i, svc ? td(svc.name) : td(s.title), status, flavor, req, svc && svc.code));

    var meta = h("div.jc-meta");
    var slaDays = (svc && svc.slaDays) || s.slaDays;
    if (slaDays) {
      var fast = svc && svc.gigaFastTrack && ctx.personaType === "giga_entity";
      meta.appendChild(metaRow("clock", jt("jc.sla"),
        h("div", null,
          h("div.num", null, RGP.fmtWorkdays(slaDays)),
          fast ? h("div.jc-fast.num", null,
            jt("jc.fastTrack") + " " + RGP.fmtWorkdays(Math.max(1, Math.ceil(slaDays * 0.5)))) : null)));
    }
    meta.appendChild(metaRow("user", jt("jc.actor"), td(s.actor)));
    var docs = (svc && svc.requiredDocuments) || [];
    if (docs.length) {
      meta.appendChild(metaRow("docs", jt("jc.docs"),
        h("details.jc-docs-list", null,
          h("summary", null, h("span.num", null, String(docs.length))),
          h("div.mbs-1", null, docs.map(function (d) {
            return h("div.jc-doc-row", null,
              h("span.t-footnote", { style: { fontWeight: 600 } }, td(d.name)),
              h("span.flex.g05.wrap", null, (d.formats || []).map(function (f) {
                return h("span.pill.plain.sm.num", null, f);
              })));
          })))));
    }
    var pres = (svc && svc.prerequisites) || [];
    if (pres.length) {
      meta.appendChild(h("div.jc-meta-row.jc-prereqs", null,
        h("span.jc-meta-ic", null, UI.icon("shield", 16)),
        h("div.grow", null,
          h("div.jc-meta-lb", null, jt("jc.prereqs")),
          h("ul.jc-pre-list", null, pres.map(function (p) {
            return h("li.t-caption", { style: { fontWeight: 500 } }, td(p));
          })))));
    }
    if (svc && svc.fees && svc.fees.note) {
      meta.appendChild(metaRow("note", lang() === "ar" ? "الرسوم" : "Fees", td(svc.fees.note)));
    }
    if (s.note) meta.appendChild(h("div.t-caption.mut.jc-step-note", { style: { fontWeight: 500 } }, td(s.note)));
    out.appendChild(meta);

    /* live request block (§2.2.3) */
    if (req && u && u.role === "project_rep") {
      out.appendChild(h("div.jc-live", null,
        h("div.flex.g1.wrap", null,
          h("span.id-cell.num", null, req.id),
          UI.statePill(req.state, true),
          UI.slaChip(req)),
        h("a.btn.secondary.sm.mbs-1", { href: "#/portal/requests/" + req.id, onclick: closePanel },
          jt("jc.viewRequest"))));
    }

    /* primary CTA (§7.4 matrix) */
    if (u && u.role === "project_rep" && s.serviceId) {
      var cta = null;
      if (!req) {
        var locked = status === "upcoming" || status === "blocked";
        cta = locked
          ? h("div.jc-cta", null,
              h("button.btn.primary", { disabled: true }, jt("jc.apply")),
              h("div.t-caption.mut.mbs-05", { style: { fontWeight: 500 } }, jt("jc.blockedHint")))
          : h("div.jc-cta", null,
              h("a.btn.primary", { href: "#/wizard?service=" + s.serviceId, onclick: closePanel }, jt("jc.apply")));
      } else if (req.state === "draft") {
        cta = h("div.jc-cta", null,
          h("a.btn.primary", { href: "#/wizard?draft=" + req.id, onclick: closePanel }, jt("jc.continueDraft")));
      } else if (req.state === "returned") {
        cta = h("div.jc-cta", null,
          h("a.btn.primary", { href: "#/portal/requests/" + req.id, onclick: closePanel }, jt("jc.reapply")));
      } else if (DONE_STATES.indexOf(req.state) >= 0) {
        cta = h("div.jc-cta", null,
          h("a.btn.primary", { href: "#/portal/requests/" + req.id, onclick: closePanel }, jt("jc.viewDoc")));
      } else if (req.state === "rejected") {
        cta = h("div.jc-cta", null,
          h("a.btn.primary", { href: "#/portal/requests/" + req.id, onclick: closePanel }, jt("jc.viewDecision")));
      } else {
        cta = h("div.jc-cta", null,
          h("a.btn.primary", { href: "#/portal/requests/" + req.id, onclick: closePanel }, jt("jc.viewRequest")));
      }
      out.appendChild(cta);
    }
    return out;
  }

  /* waypoint panel — no CTA */
  function waypointPanel(ctx, i) {
    var s = ctx.steps[i];
    var status = ctx.st ? ctx.st[i] : "explore";
    return h("div", null,
      panelHead(ctx, i, td(s.title), status, ctx.flavor ? ctx.flavor[i] : null, null, null),
      h("div.jc-meta", null,
        metaRow("user", jt("jc.actor"), td(s.actor)),
        s.slaDays ? metaRow("clock", jt("jc.sla"), h("span.num", null, RGP.fmtWorkdays(s.slaDays))) : null),
      h("div.jc-step-note.t-caption.mut", { style: { fontWeight: 500 } }, jt("jc.waypointHint")),
      s.note ? h("div.t-caption.mut.mbs-1", { style: { fontWeight: 500 } }, td(s.note)) : null);
  }

  /* choice panel — the three path cards */
  function choicePanel(ctx, i) {
    var s = ctx.steps[i];
    var paths = ctx.paths || [];
    return h("div", null,
      panelHead(ctx, i, td(s.title), ctx.st ? ctx.st[i] : "explore", null, null, null),
      h("div.flex-col.g2.mbs-2", null, paths.map(function (p) {
        return h("div.jc-path-card" + (p.id === ctx.pathId ? ".sel" : ""), null,
          h("div.t-headline", null, td(p.name)),
          p.description ? h("div.t-caption.mut.mbs-05", { style: { fontWeight: 500 } }, td(p.description)) : null,
          h("div.flex.g1.mbs-1", null,
            h("span.pill.plain.sm.num", null, String(p.steps.length) + " " + jt("jc.steps")),
            h("span.grow"),
            h("button.btn.secondary.sm", {
              onclick: function () {
                closePanel();
                if (ctx.selectPath) ctx.selectPath(p.id);
              }
            }, jt("jc.choosePath"))));
      })));
  }

  /* ================================================================
     Path fork block (§1.4)
     ================================================================ */
  function forkBlock(ctx, mainCanvas) {
    var paths = ctx.paths;
    var sub = h("div.jc-fork-canvas");
    var tabs = h("div.jc-path-tabs", { role: "tablist", "aria-label": jt("jc.paths") });

    function pathCanvas(p) {
      var pctx = {
        journey: { name: p.name }, steps: p.steps, mode: ctx.mode,
        user: ctx.user, personaType: ctx.personaType,
        interactive: ctx.interactive, byService: ctx.byService,
        paths: paths, pathId: ctx.pathId, selectPath: ctx.selectPath,
        st: null, flavor: {}, current: -1
      };
      if (ctx.st) {
        var r2 = stepStatuses(p.steps, ctx.byService || {});
        pctx.st = r2.st; pctx.flavor = r2.flavor; pctx.current = currentIndex(r2.st);
      }
      return buildCanvas(p.steps, pctx, { entrance: true });
    }

    function renderPath(pid, first) {
      ctx.pathId = pid;
      var selIdx = 0;
      paths.forEach(function (p, k) { if (p.id === pid) selIdx = k; });
      RGP.$$(".jc-path-tab", tabs).forEach(function (b, k) {
        b.classList.toggle("active", k === selIdx);
        b.setAttribute("aria-selected", k === selIdx ? "true" : "false");
      });
      restyleStubs(mainCanvas, selIdx);
      var p = paths[selIdx];
      var mount = function () {
        sub.innerHTML = "";
        sub.appendChild(pathCanvas(p));
      };
      if (first || rm() || !sub.firstChild) { mount(); }
      else { /* cross-fade 120ms */
        sub.classList.add("jc-fade-out");
        setTimeout(function () { mount(); sub.classList.remove("jc-fade-out"); }, 120);
      }
      if (!first && ctx.onPathChange) ctx.onPathChange(pid);
    }

    paths.forEach(function (p) {
      tabs.appendChild(h("button.jc-path-tab", {
        type: "button", role: "tab", "aria-selected": "false",
        onclick: function () { if (ctx.pathId !== p.id) renderPath(p.id); }
      },
        h("span", null, td(p.name)),
        h("span.pill.plain.sm.num", null, String(p.steps.length) + " " + jt("jc.steps"))));
    });

    ctx.selectPath = function (pid) { if (ctx.pathId !== pid) renderPath(pid); };
    renderPath(ctx.pathId, true);

    return h("div.jc-fork", null,
      h("h3.t-title3.mbe-2", null, jt("jc.paths")),
      tabs,
      sub);
  }

  /* ================================================================
     Core public build (§0)
     opts = { mode, personaType, user, project, requests, pathId,
              onPathChange, interactive, explore }
     ================================================================ */
  function build(journey, opts) {
    opts = opts || {};
    var mode = opts.mode || "full";
    var u = opts.user || (RGP.auth && RGP.auth.current ? RGP.auth.current() : null);
    var interactive = opts.interactive !== false && mode === "full";
    var tracking = !!(u && u.role === "project_rep" && !opts.explore);
    var byService = tracking ? requestIndex(u, opts.project || null) : null;

    var ctx = {
      journey: journey, steps: journey.steps, mode: mode,
      user: u, personaType: opts.personaType || (u && u.personaType) || null,
      interactive: interactive, tracking: tracking, byService: byService,
      paths: journey.paths || null,
      pathId: opts.pathId || (journey.paths ? journey.paths[0].id : null),
      onPathChange: opts.onPathChange || null,
      st: null, flavor: {}, current: -1
    };
    if (journey.paths && !journey.paths.some(function (p) { return p.id === ctx.pathId; })) {
      ctx.pathId = journey.paths[0].id;
    }
    if (tracking) {
      var res = stepStatuses(journey.steps, byService);
      ctx.st = res.st; ctx.flavor = res.flavor; ctx.current = currentIndex(res.st);
    }

    var wrap = h("div.jc-root");
    var canvas = buildCanvas(journey.steps, ctx, { entrance: true, stubs: !!(ctx.paths && mode === "full") });
    wrap.appendChild(canvas);
    if (ctx.paths && mode === "full") wrap.appendChild(forkBlock(ctx, canvas));

    /* §2.5 — bring the current node into view on mount */
    if (tracking && mode === "full" && ctx.current >= 0) {
      setTimeout(function () {
        var cell = (canvas._jcCells || [])[ctx.current];
        if (!cell || !canvas.isConnected) return;
        var r = cell.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) {
          cell.scrollIntoView({ block: "center", behavior: rm() ? "auto" : "smooth" });
        }
      }, 150);
    }
    return wrap;
  }

  /* ================================================================
     §2.6 — full screen at #/portal/journeys (drop-in for journeys())
     ================================================================ */
  function hashQuery() {
    var out = {};
    (location.hash.split("?")[1] || "").split("&").forEach(function (kv) {
      if (!kv) return;
      var p = kv.split("=");
      try { out[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); } catch (e) { /* noop */ }
    });
    return out;
  }

  function myProjects(u) {
    return RGP.store.state.projects.filter(function (p) {
      return (u.projectIds || []).indexOf(p.id) >= 0;
    });
  }

  function legendChip(cls, label) {
    return h("span.jc-lg", null, h("span.jc-lg-dot." + cls), label);
  }

  function screen() {
    var u = RGP.auth.current();
    var J = RGP.store.state.journeys;
    var q = hashQuery();
    var defaultByPersona = { operator: "operation", investor: "investor", giga_entity: "planning", developer: "planning" };
    var openJourney =
      (q.j && J.some(function (x) { return x.id === q.j; })) ? q.j
      : (u.personaType && defaultByPersona[u.personaType] &&
         J.some(function (x) { return x.id === defaultByPersona[u.personaType]; }))
        ? defaultByPersona[u.personaType] : J[0].id;
    var openPath = q.path || null;
    var projects = u.role === "project_rep" ? myProjects(u) : [];
    var exploreOnly = false;
    var selProject = null;

    function currentJourney() {
      return J.filter(function (x) { return x.id === openJourney; })[0];
    }

    /* default: the user's project with the most requests matching this journey */
    function pickDefaultProject(jr) {
      if (!projects.length) return null;
      var svcIds = {};
      jr.steps.forEach(function (s) { if (s.serviceId) svcIds[s.serviceId] = 1; });
      (jr.paths || []).forEach(function (p) {
        p.steps.forEach(function (s) { if (s.serviceId) svcIds[s.serviceId] = 1; });
      });
      var best = projects[0], bestN = -1;
      projects.forEach(function (p) {
        var n = RGP.store.state.requests.filter(function (r) {
          return r.projectId === p.id && svcIds[r.serviceId];
        }).length;
        if (n > bestN) { best = p; bestN = n; }
      });
      return best;
    }
    selProject = pickDefaultProject(currentJourney());

    function syncHash() {
      var jr = currentJourney();
      var next = "#/portal/journeys?j=" + openJourney +
        (jr.paths && openPath ? "&path=" + openPath : "");
      if (location.hash !== next) {
        try { history.replaceState(null, "", location.pathname + location.search + next); } catch (e) { /* noop */ }
      }
    }

    var wrap = h("div");
    function render() {
      wrap.innerHTML = "";
      var jr = currentJourney();
      if (jr.paths) { if (!openPath || !jr.paths.some(function (p) { return p.id === openPath; })) openPath = jr.paths[0].id; }
      else openPath = null;
      syncHash();

      /* journey switcher — the familiar chip row */
      wrap.appendChild(h("div.flex.g1.wrap.mbe-3", null, J.map(function (x) {
        return h("button.chip" + (x.id === openJourney ? ".active" : ""), {
          onclick: function () {
            openJourney = x.id; openPath = null;
            selProject = pickDefaultProject(currentJourney());
            render();
          }
        }, td(x.name));
      })));

      /* context bar */
      var ctxBar = h("div.jc-context.mbe-2", null,
        h("span.pill.info", null, t("phase." + jr.phase)),
        h("span.t-sub.mut", null, td(jr.audience)),
        h("span.grow"),
        h("span.flex.g05.wrap", null, (jr.personas || []).map(function (p) {
          return h("span.pill.plain.sm", null, td(RGP.personaLabel(p)));
        })));
      if (u.role === "project_rep" && projects.length > 0) {
        ctxBar.appendChild(h("label.jc-proj-field", null,
          h("span.t-caption.mut", { style: { fontWeight: 600 } }, jt("jc.trackProject")),
          h("select.input", {
            "aria-label": jt("jc.trackProject"),
            onchange: function (e) {
              if (e.target.value === "__explore") { exploreOnly = true; selProject = null; }
              else {
                exploreOnly = false;
                selProject = projects.filter(function (p) { return p.id === e.target.value; })[0] || null;
              }
              render();
            }
          },
            projects.map(function (p) {
              return h("option", { value: p.id, selected: !exploreOnly && selProject && selProject.id === p.id }, td(p.name));
            }),
            h("option", { value: "__explore", selected: exploreOnly }, jt("jc.exploreOnly")))));
      }
      wrap.appendChild(ctxBar);

      /* legend — always visible above the canvas */
      wrap.appendChild(h("div.jc-legend.mbe-2", null,
        legendChip("done", jt("jc.legend.done")),
        legendChip("active", jt("jc.legend.active")),
        legendChip("blocked", jt("jc.legend.blocked")),
        legendChip("upcoming", jt("jc.legend.upcoming"))));

      /* the canvas (+ fork for planning) */
      wrap.appendChild(build(jr, {
        mode: "full",
        user: u,
        personaType: u.personaType,
        project: selProject,
        explore: exploreOnly,
        pathId: openPath,
        onPathChange: function (pid) { openPath = pid; syncHash(); }
      }));
    }
    render();

    var head = h("div.page-head", null,
      h("div.kicker", null, t("brand.short")),
      h("h1.t-title1", null, t("portal.journeyExplorer")),
      h("p.desc.t-sub", null, lang() === "ar"
        ? "الرحلات الرسمية للمطور والمستثمر العقاري كما اعتمدتها أمانة منطقة الرياض في يوليو 2026."
        : "The official developer and investor journeys as adopted by the Amanah in July 2026."));

    return RGP.shell(h("div", null, head, wrap), { context: t("portal.journeyExplorer"), narrow: true });
  }

  /* ================================================================
     §6.1 — public landing strip
     ================================================================ */
  function compact() {
    var S = RGP.store.state;
    var signed = !!(RGP.auth && RGP.auth.current && RGP.auth.current());
    var wrapEl = h("div.jc-mini");
    var order = [];
    var groupsRow = h("div.jc-mini-groups", null, ["before", "during", "after"].map(function (ph) {
      var js = (S.journeys || []).filter(function (j) { return j.phase === ph; });
      js.forEach(function (j) { order.push(j); });
      return h("div.jc-mini-group", null,
        h("div.jc-mini-head", null, h("span.kicker", null, t("phase." + ph))),
        h("div.jc-mini-nodes", null, js.map(function (jr) {
          return h("a.jc-mini-node", {
            href: signed ? "#/portal/journeys?j=" + jr.id : "#/login",
            "aria-label": td(jr.name)
          },
            h("span.jc-mini-dot", null, UI.icon(JOURNEY_ICON[jr.id] || "map", 20)),
            h("span.jc-mini-lb", null, td(jr.name)),
            h("span.t-caption.mut.num", { style: { fontWeight: 500 } },
              RGP.fmtNum(jr.steps.length, { dec: 0 }) + " " + jt("jc.steps")));
        })));
    }));
    wrapEl.appendChild(groupsRow);

    function draw() {
      if (!wrapEl.isConnected) return null;
      var rect = wrapEl.getBoundingClientRect();
      if (!rect.width) return null;
      var dots = RGP.$$(".jc-mini-dot", wrapEl);
      if (dots.length < 2) return null;
      var centers = dots.map(function (d) {
        var r = d.getBoundingClientRect();
        return { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top };
      });
      var svg = wireSvg(wrapEl);
      var defs = svgEl("defs");
      var mid = "jcGradMini-" + (++gradSeq);
      makeGradient(defs, mid, "jc-g-mini-a", "jc-g-mini-b");
      svg.appendChild(defs);
      var d = "M" + centers[0].x + " " + centers[0].y;
      for (var i = 1; i < centers.length; i++) {
        var a = centers[i - 1], b = centers[i];
        if (Math.abs(a.y - b.y) < Math.abs(a.x - b.x)) {
          var dx = b.x - a.x;
          d += " C" + (a.x + 0.4 * dx) + " " + a.y + ", " + (b.x - 0.4 * dx) + " " + b.y + ", " + b.x + " " + b.y;
        } else {
          var lean = isRTL() ? -8 : 8;
          var dy = b.y - a.y;
          d += " C" + (a.x + lean) + " " + (a.y + dy * 0.4) + ", " + (b.x + lean) + " " + (b.y - dy * 0.4) + ", " + b.x + " " + b.y;
        }
      }
      var p = svgEl("path");
      p.setAttribute("d", d);
      p.setAttribute("class", "jc-mini-wire");
      p.setAttribute("stroke", "url(#" + mid + ")");
      svg.appendChild(p);
      wrapEl._jcW = rect.width; wrapEl._jcH = rect.height;
      return p;
    }

    /* entrance draw-on when scrolled into view — once */
    var entered = false;
    function enter() {
      if (entered) { draw(); return; }
      entered = true;
      var p = draw();
      if (!p || rm()) return;
      var L = 0;
      try { L = p.getTotalLength(); } catch (e) { L = 0; }
      if (!L) return;
      p.style.strokeDasharray = L + " " + L;
      p.style.strokeDashoffset = L;
      p.style.transition = "stroke-dashoffset 900ms var(--ease-decelerate) 120ms";
      requestAnimationFrame(function () { p.style.strokeDashoffset = "0"; });
    }
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { enter(); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      requestAnimationFrame(function () { io.observe(wrapEl); });
    } else {
      requestAnimationFrame(enter);
    }
    if (typeof ResizeObserver !== "undefined") {
      var deb = RGP.debounce(function () {
        if (!wrapEl.isConnected || !entered) return;
        var r = wrapEl.getBoundingClientRect();
        if (Math.abs(r.width - (wrapEl._jcW || 0)) < 1 && Math.abs(r.height - (wrapEl._jcH || 0)) < 1) return;
        draw();
      }, 120);
      new ResizeObserver(deb).observe(wrapEl);
    }
    return wrapEl;
  }

  /* ================================================================
     §6.2 — request-detail macro progress rail
     ================================================================ */
  function rail(r) {
    var macro = RGP.macroPhase(r.state);
    var danger = ["rejected", "cancelled"].indexOf(r.state) >= 0;
    var warn = r.state === "returned";
    var labels = [
      { ar: "التقديم", en: "Submit" }, { ar: "الفرز", en: "Screening" },
      { ar: "الدراسة", en: "Review" }, { ar: "القرار", en: "Decision" },
      { ar: "الإنجاز", en: "Done" }];
    var aria = lang() === "ar"
      ? "مراحل الطلب: اكتملت " + macro + " من 5"
      : "Request progress: " + macro + " of 5 stages complete";

    var cols = labels.map(function (l, i) {
      var cls = i < macro ? "done"
        : i === macro ? (danger ? "bad-danger" : warn ? "bad-warn" : "active")
        : "upcoming";
      return h("div.jc-rail-col." + cls, null,
        h("span.jc-rail-dot", null, i < macro ? UI.icon("check", 12) : null),
        h("span.jc-rail-lb.t-caption", null, td(l)));
    });
    var railEl = h("div.jc-rail", { role: "img", "aria-label": aria },
      h("div.jc-rail-cols", null, cols));

    function draw() {
      if (!railEl.isConnected) return;
      var rect = railEl.getBoundingClientRect();
      if (!rect.width) return;
      var dots = RGP.$$(".jc-rail-dot", railEl);
      var centers = dots.map(function (d) {
        var rr = d.getBoundingClientRect();
        return { x: rr.left + rr.width / 2 - rect.left, y: rr.top + rr.height / 2 - rect.top };
      });
      var classes = [];
      for (var i = 0; i < centers.length - 1; i++) {
        if (i + 1 < macro) classes.push("jc-seg-done");
        else if (i + 1 === macro) {
          if (danger) classes.push("jc-seg-blocked jc-fl-danger");
          else if (warn) classes.push("jc-seg-blocked");
          else classes.push(rm() ? "jc-seg-active" : "jc-seg-active jc-seg-flow");
        } else classes.push("jc-seg-upcoming");
      }
      drawWire(railEl, centers, classes, {});
      railEl._jcW = rect.width;
    }
    requestAnimationFrame(draw);
    if (typeof ResizeObserver !== "undefined") {
      var deb = RGP.debounce(function () {
        if (!railEl.isConnected) return;
        var rw = railEl.getBoundingClientRect().width;
        if (Math.abs(rw - (railEl._jcW || 0)) < 1) return;
        draw();
      }, 120);
      new ResizeObserver(deb).observe(railEl);
    }
    return railEl;
  }

  /* ---------------- export ---------------- */
  RGP.journeyCanvas = {
    screen: screen,
    compact: compact,
    rail: rail,
    build: build
  };
})();
