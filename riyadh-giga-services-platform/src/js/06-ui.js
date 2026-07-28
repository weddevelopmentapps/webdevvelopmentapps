/* ============================================================
   UI kit — icon set (one family, stroke 1.5), toasts, modals,
   menus, pills, tables, empty states, rings, sparklines, forms
   engine. ux-spec §6.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h;
  var UI = RGP.ui = {};

  /* ---------------- icons: single line family, stroke 1.5, 24 grid ---------------- */
  var PATHS = {
    home: 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    doc: 'M6 2h8l5 5v15H6zM14 2v5h5M9 12h7M9 16h7',
    docs: 'M8 4h8l4 4v12H8zM16 4v4h4M4 8v14h12',
    plus: 'M12 5v14M5 12h14',
    search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM16 16l5 5',
    bell: 'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2.5 2.5 0 0 0 4 0',
    user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-3.5 3-6 7-6s7 2.5 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c0-3-1.8-5-4.5-5.8',
    check: 'M4 12.5 10 18.5 20 6',
    checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l3 3 5.5-6.5',
    x: 'M6 6l12 12M18 6 6 18',
    xCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6M15 9l-6 6',
    alert: 'M12 3 2.5 20h19zM12 10v4.5M12 17.6v.4',
    infoC: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.4v.4',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
    calendar: 'M4 6h16v15H4zM4 10.5h16M8 3v4M16 3v4',
    map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
    pin: 'M12 21s-7-6.5-7-11.5a7 7 0 0 1 14 0C19 14.5 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    chart: 'M4 20V10M10 20V4M16 20v-8M21 20H3',
    layers: 'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5',
    flag: 'M5 21V4M5 4h13l-2.5 4L18 12H5',
    send: 'M21 3 3 10.5l7 2.5M21 3l-6 18-4.5-8M21 3 10 13',
    settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.5 12a7.5 7.5 0 0 0-.1-1.2l2.1-1.6-2-3.4-2.4 1a7.7 7.7 0 0 0-2.1-1.2L14.6 3h-4l-.4 2.6a7.7 7.7 0 0 0-2.1 1.2l-2.4-1-2 3.4 2.1 1.6a7.5 7.5 0 0 0 0 2.4l-2.1 1.6 2 3.4 2.4-1c.6.5 1.4.9 2.1 1.2l.4 2.6h4l.4-2.6a7.7 7.7 0 0 0 2.1-1.2l2.4 1 2-3.4-2.1-1.6c.1-.4.1-.8.1-1.2z',
    upload: 'M12 16V4M7 8.5 12 3.5l5 5M4 16v5h16v-5',
    download: 'M12 4v12M7 11.5l5 5 5-5M4 21h16',
    print: 'M7 8V3h10v5M5 8h14a2 2 0 0 1 2 2v7h-4v4H7v-4H3v-7a2 2 0 0 1 2-2zM7 16h10',
    eye: 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    arrow: 'M4 12h16M13 5l7 7-7 7',
    back: 'M20 12H4M11 5l-7 7 7 7',
    chevD: 'M6 9l6 6 6-6',
    chevS: 'M15 6l-6 6 6 6',
    external: 'M14 4h6v6M20 4 11 13M9 6H5v13h13v-4',
    building: 'M4 21V5l8-3v19M12 21h8V9l-8-2.5M7 9h.5M7 13h.5M7 17h.5M16 12h.5M16 16h.5',
    tower: 'M9 21V8l3-5 3 5v13M9 12h6M9 16h6M4 21h16',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
    note: 'M5 4h14v13l-4 4H5zM15 21v-4h4M9 9h6M9 13h4',
    shield: 'M12 3 4.5 6v6c0 5 3.5 8 7.5 9 4-1 7.5-4 7.5-9V6z',
    bolt: 'M13 2 4.5 13.5H11L9.5 22 19 10h-6.5z',
    swap: 'M7 4 3 8l4 4M3 8h13M17 12l4 4-4 4M21 16H8',
    filter: 'M3 5h18l-7 8v6l-4 2v-8z',
    lang: 'M4 6h9M8.5 3v3M11 6c-.8 3.6-3.4 7-7 9M6 9.5c1.4 2.6 3.9 4.8 6.5 5.9M13 21l4.5-11L22 21M14.6 17.5h5.8',
    moon: 'M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5z',
    sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    logout: 'M15 4H5v16h10M10 12h11M18 8.5 21.5 12 18 15.5',
    login: 'M9 4h10v16H9M3 12h11M11 8.5 14.5 12 11 15.5',
    inbox: 'M4 4h16v16H4zM4 14h5l1.5 2.5h3L15 14h5',
    archive: 'M3 4h18v5H3zM5 9v11h14V9M10 13h4',
    star: 'm12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z',
    starF: 'm12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z',
    hourglass: 'M6 3h12M6 21h12M8 3v4l4 5 4-5V3M8 21v-4l4-5 4 5v4',
    key: 'M14 10a4 4 0 1 0-4 4h1v2h2v2h2v2h3v-3l-4.6-4.6',
    briefcase: 'M3 8h18v12H3zM9 8V5h6v3M3 13h18',
    truck: 'M2 6h12v11H2zM14 10h4l4 4v3h-8M6.5 20a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM17.5 20a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z',
    leaf: 'M5 21C5 11 11 5 21 4c0 10-5 15-13 15-1 0-2 0-3-.5M5 21c2-5 5-9 10-12',
    drop: 'M12 3s6.5 7 6.5 12a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3z',
    crane: 'M3 21h12M9 21V6L4 9M9 6l11 3v3M17 9v6a1.8 1.8 0 1 0 2 0V9.6M9 10l-5-.9',
    road: 'M4 21 9 3h6l5 18M12 5v3M12 11v3M12 17v3',
    hammer: 'M14 6 8 12M10 4l6 6M3 21l7-7 2 2-5.5 5.5zM14 4l6 6',
    export: 'M12 15V3M7 7.5 12 3l5 4.5M4 15v6h16v-6',
  };
  UI.icon = function (name, size, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", size || 20); svg.setAttribute("height", size || 20);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    if (cls) svg.setAttribute("class", cls);
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", PATHS[name] || PATHS.doc);
    if (name === "starF") { svg.setAttribute("fill", "currentColor"); svg.setAttribute("stroke-width", "0"); }
    svg.appendChild(p);
    return svg;
  };

  /* chevron that means "forward" — mirrors in RTL */
  UI.fwd = function (size) { return UI.icon(RGP.i18n.lang === "ar" ? "chevS" : "arrow", size || 16); };

  /* ---------------- toasts ---------------- */
  UI.toast = function (kind, title, body) {
    var root = RGP.$("#toast-root");
    while (root.children.length >= 3) root.removeChild(root.lastChild);
    var iconName = kind === "ok" ? "checkCircle" : kind === "danger" ? "xCircle" : kind === "warn" ? "alert" : "infoC";
    var el = h("div.toast." + (kind === "success" ? "ok" : kind), { role: "status" },
      h("span", { class: kind === "ok" || kind === "success" ? "ok-fg" : kind === "danger" ? "danger-fg" : kind === "warn" ? "warn-fg" : "accent" }, UI.icon(iconName, 20)),
      h("div.grow", null,
        h("div.t-title", null, td(title)),
        body ? h("div.t-body", null, td(body)) : null),
      h("button.iconbtn", { "aria-label": "close", onclick: function () { dismiss(); } }, UI.icon("x", 14)));
    root.prepend(el);
    var t = null;
    function dismiss() {
      clearTimeout(t);
      el.classList.add("leaving");
      setTimeout(function () { el.remove(); }, 160);
    }
    if (kind !== "danger") t = setTimeout(dismiss, 5000);
    return el;
  };

  /* ---------------- modal ---------------- */
  UI.modal = function (opts) {
    var root = RGP.$("#overlay-root");
    var prevFocus = document.activeElement;
    var overlay = h("div.overlay", {
      onclick: function (e) { if (e.target === overlay && !opts.sticky) close(); }
    });
    function close() {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) {
      if (e.key === "Escape" && !opts.sticky) close();
      if (e.key === "Tab") { /* simple focus trap */
        var f = RGP.$$("button, input, select, textarea, a[href]", overlay).filter(function (x) { return !x.disabled; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    }
    var modal = h("div.modal" + (opts.size === "sm" ? ".sm" : opts.size === "lg" ? ".lg" : ""), { role: "dialog", "aria-modal": "true" },
      h("div.modal-head", null,
        h("div.t-title2.grow", null, td(opts.title)),
        h("button.iconbtn", { "aria-label": "close", onclick: close }, UI.icon("x", 18))),
      h("div.modal-body", null, opts.body),
      opts.actions ? h("div.modal-foot", null, opts.actions(close)) : null);
    overlay.appendChild(modal);
    root.appendChild(overlay);
    document.addEventListener("keydown", onKey);
    var focusable = RGP.$$("input, textarea, select, button", modal).filter(function (x) { return !x.closest(".modal-head"); });
    if (focusable.length) focusable[0].focus();
    return { close: close, el: modal };
  };

  UI.confirm = function (title, bodyText, confirmLabel, kind, cb) {
    UI.modal({
      title: title, size: "sm",
      body: h("div.t-body", null, td(bodyText)),
      actions: function (close) {
        return [
          h("button.btn.secondary", { onclick: close }, t("common.cancel")),
          h("button.btn." + (kind || "primary"), {
            onclick: function () { close(); cb(); }
          }, td(confirmLabel))
        ];
      }
    });
  };

  /* ---------------- dropdown menu ---------------- */
  UI.menu = function (anchor, items) {
    var existing = RGP.$(".menu");
    if (existing) existing.remove();
    var r = anchor.getBoundingClientRect();
    var m = h("div.menu", { style: { top: (r.bottom + 6 + window.scrollY) + "px" } });
    items.forEach(function (it) {
      if (it === "-") { m.appendChild(h("hr")); return; }
      m.appendChild(h("button.mi" + (it.danger ? ".danger" : ""), {
        onclick: function () { m.remove(); it.onclick(); }
      }, it.icon ? UI.icon(it.icon, 16) : null, td(it.label)));
    });
    document.body.appendChild(m);
    var isRTL = RGP.i18n.lang === "ar";
    var w = m.offsetWidth;
    var left = isRTL ? r.left : r.right - w;
    left = RGP.clamp(left, 8, window.innerWidth - w - 8);
    m.style.left = left + "px";
    setTimeout(function () {
      document.addEventListener("click", function onDoc(e) {
        if (!m.contains(e.target)) { m.remove(); document.removeEventListener("click", onDoc); }
      });
    }, 0);
    return m;
  };

  /* ---------------- pills & badges ---------------- */
  UI.statePill = function (state, sm) {
    return h("span.pill.st-" + state + (sm ? ".sm" : ""), null,
      h("span.dot"), t("state." + state));
  };

  UI.gigaBadge = function () {
    return h("span.giga-badge", { title: t("sla.fastTrack") }, UI.icon("bolt", 12), t("sla.fastTrack"));
  };

  UI.slaChip = function (req) {
    var band = RGP.lifecycle.slaBand(req);
    if (!band) return null;
    var remaining = RGP.lifecycle.remainingDays(req);
    var label;
    if (band === "paused") label = t("sla.paused");
    else if (RGP.lifecycle.TERMINAL_STATES.indexOf(req.state) >= 0) {
      label = band === "red" ? t("sla.red") : t("sla.ok");
    } else if (remaining === 0) {
      label = RGP.i18n.lang === "ar" ? "يستحق اليوم" : "Due today";
      if (band === "ok") band = "amber";
    } else if (band === "red" && remaining < 0) {
      label = t("work.overdueBy") + " " + RGP.fmtWorkdays(Math.abs(remaining));
    } else if (band === "red") {
      label = t("sla.red");
    } else {
      label = t("sla.remaining") + " " + RGP.fmtWorkdays(remaining);
    }
    return h("span.sla-chip." + band, null, UI.icon("clock", 12), label);
  };

  UI.simBadge = function () {
    return h("span.sim-badge", null, RGP.i18n.lang === "ar" ? "بيانات محاكاة" : "Simulated");
  };

  UI.avatar = function (user, size) {
    var initials = user && user.avatarInitials ? user.avatarInitials : "؟";
    return h("span.avatar" + (size === "lg" ? ".lg" : size === "sm" ? ".sm" : ""),
      { title: user ? td(user.name) : "" }, initials);
  };

  /* ---------------- empty state ---------------- */
  UI.empty = function (icon, title, sub, action, compact) {
    return h("div.empty" + (compact ? ".compact" : ""), null,
      UI.icon(icon || "inbox", compact ? 48 : 72),
      h("div.e-title", null, td(title)),
      sub ? h("div.e-sub", null, td(sub)) : null,
      action || null);
  };

  /* ---------------- progress ring ---------------- */
  UI.ring = function (pct, size, band) {
    size = size || 84;
    var stroke = 7, rr = (size - stroke) / 2, c = 2 * Math.PI * rr;
    var color = band === "red" ? "var(--danger)" : band === "amber" ? "var(--warn)" : "var(--accent)";
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", size); svg.setAttribute("height", size);
    var bg = document.createElementNS(svgNS, "circle");
    bg.setAttribute("cx", size / 2); bg.setAttribute("cy", size / 2); bg.setAttribute("r", rr);
    bg.setAttribute("fill", "none"); bg.setAttribute("stroke", "var(--hair)"); bg.setAttribute("stroke-width", stroke);
    var fg = document.createElementNS(svgNS, "circle");
    fg.setAttribute("cx", size / 2); fg.setAttribute("cy", size / 2); fg.setAttribute("r", rr);
    fg.setAttribute("fill", "none"); fg.setAttribute("stroke", color); fg.setAttribute("stroke-width", stroke);
    fg.setAttribute("stroke-linecap", "round");
    fg.setAttribute("stroke-dasharray", c);
    var target = c * (1 - RGP.clamp(pct, 0, 100) / 100);
    fg.setAttribute("stroke-dashoffset", RGP.REDUCED_MOTION ? target : c);
    svg.appendChild(bg); svg.appendChild(fg);
    if (!RGP.REDUCED_MOTION) {
      requestAnimationFrame(function () {
        fg.style.transition = "stroke-dashoffset 700ms cubic-bezier(0,0,.2,1)";
        fg.setAttribute("stroke-dashoffset", target);
      });
    }
    var wrap = h("span.ring-wrap", null, svg,
      h("span.ring-label", null,
        h("span.num", { style: { fontSize: size / 4.4 + "px", fontWeight: 600 } }, Math.round(pct) + "%")));
    return wrap;
  };

  /* ---------------- sparkline ---------------- */
  UI.sparkline = function (values, w, hgt) {
    w = w || 120; hgt = hgt || 36;
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + hgt);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("style", "width:100%;height:" + hgt + "px;direction:ltr");
    if (!values || values.length < 2) return svg;
    var max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    var span = (max - min) || 1;
    var pts = values.map(function (v, i) {
      var x = (i / (values.length - 1)) * (w - 6) + 3;
      var y = hgt - 5 - ((v - min) / span) * (hgt - 10);
      return [x, y];
    });
    var d = "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L");
    var area = document.createElementNS(svgNS, "path");
    area.setAttribute("d", d + " L" + (w - 3) + " " + hgt + " L3 " + hgt + " Z");
    area.setAttribute("fill", "rgba(14,106,63,.08)");
    var line = document.createElementNS(svgNS, "path");
    line.setAttribute("d", d);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "var(--accent)");
    line.setAttribute("stroke-width", "1.5");
    var dot = document.createElementNS(svgNS, "circle");
    var lastP = pts[pts.length - 1];
    dot.setAttribute("cx", lastP[0]); dot.setAttribute("cy", lastP[1]); dot.setAttribute("r", "3");
    dot.setAttribute("fill", "var(--accent)");
    svg.appendChild(area); svg.appendChild(line); svg.appendChild(dot);
    return svg;
  };

  /* ---------------- count-up ---------------- */
  UI.countUp = function (el, value, opts) {
    opts = opts || {};
    var fmt = function (v) { return RGP.fmtNum(v, { dec: opts.dec != null ? opts.dec : 0 }) + (opts.suffix || ""); };
    if (RGP.REDUCED_MOTION) { el.textContent = fmt(value); return; }
    var start = null;
    function tick(now) {
      if (!start) start = now;
      var p = RGP.clamp((now - start) / 700, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(value * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  /* ---------------- KPI tile ---------------- */
  UI.kpi = function (opts) {
    var valEl = h("span", null, "0");
    var tile = h("div.kpi.elev-1", { onclick: opts.onclick, role: "button", tabindex: "0" },
      h("div.k-label", null, td(opts.label)),
      h("div.k-value", null, valEl, opts.unit ? h("span.k-unit", null, td(opts.unit)) : null),
      opts.delta != null ? h("div.k-delta", null,
        h("span", { class: opts.deltaGood == null ? "mut" : opts.deltaGood ? "ok-fg" : "danger-fg" },
          (opts.delta >= 0 ? "▲ " : "▼ ") + RGP.fmtNum(Math.abs(opts.delta), { dec: 1 }) + (opts.deltaPct ? "%" : "")),
        h("span.comp", null, opts.compare ? td(opts.compare) : "")) : null,
      opts.spark ? h("div.k-spark", null, UI.sparkline(opts.spark)) : null);
    UI.countUp(valEl, opts.value, { dec: opts.dec, suffix: opts.suffix });
    return tile;
  };

  /* ---------------- table builder ---------------- */
  /* cols: [{key, label, render(row), sortVal(row), end, width}] */
  UI.table = function (opts) {
    var state = { sortKey: opts.defaultSort || null, dir: opts.defaultDir || 1, page: 0, pageSize: opts.pageSize || 12 };
    var wrap = h("div.table-card.elev-1");
    function build() {
      wrap.innerHTML = "";
      var rows = opts.rows.slice();
      if (state.sortKey) {
        var col = opts.cols.filter(function (c) { return c.key === state.sortKey; })[0];
        if (col && col.sortVal) rows.sort(function (a, b) {
          var va = col.sortVal(a), vb = col.sortVal(b);
          return (va < vb ? -1 : va > vb ? 1 : 0) * state.dir;
        });
      }
      var pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
      state.page = RGP.clamp(state.page, 0, pages - 1);
      var slice = rows.slice(state.page * state.pageSize, (state.page + 1) * state.pageSize);

      var thead = h("thead", null, h("tr", null, opts.cols.map(function (c) {
        return h("th" + (c.sortVal ? ".sortable" : "") + (c.end ? ".end" : ""), {
          onclick: c.sortVal ? function () {
            if (state.sortKey === c.key) state.dir *= -1; else { state.sortKey = c.key; state.dir = 1; }
            build();
          } : null,
          "aria-sort": state.sortKey === c.key ? (state.dir > 0 ? "ascending" : "descending") : null
        }, td(c.label), state.sortKey === c.key ? (state.dir > 0 ? " ▲" : " ▼") : "");
      })));
      var tbody = h("tbody", null, slice.map(function (row) {
        return h("tr", { onclick: opts.onRow ? function () { opts.onRow(row); } : null },
          opts.cols.map(function (c) {
            return h("td" + (c.end ? ".end" : ""), null, c.render(row));
          }));
      }));
      if (!slice.length) {
        wrap.appendChild(h("div.table-scroll", null, h("table.tbl", null, thead)));
        wrap.appendChild(opts.empty || UI.empty("inbox", { ar: "لا توجد سجلات", en: "No records" }, null, null, true));
        return;
      }
      wrap.appendChild(h("div.table-scroll", null, h("table.tbl", null, thead, tbody)));
      var from = state.page * state.pageSize + 1, to = Math.min(rows.length, (state.page + 1) * state.pageSize);
      wrap.appendChild(h("div.tbl-foot", null,
        h("span.num", null, from + "–" + to + " / " + rows.length),
        h("span.grow"),
        h("button.btn.secondary.sm", { disabled: state.page === 0, onclick: function () { state.page--; build(); } },
          RGP.i18n.lang === "ar" ? "السابق" : "Prev"),
        h("button.btn.secondary.sm", { disabled: state.page >= pages - 1, onclick: function () { state.page++; build(); } },
          RGP.i18n.lang === "ar" ? "التالي" : "Next")));
    }
    build();
    return wrap;
  };

  /* ---------------- forms engine (it-spec §7.10) ---------------- */
  /* Renders ServiceDefinition.formFields → returns {el, validate(), values()} */
  UI.formEngine = function (fields, initial) {
    var values = Object.assign({}, initial || {});
    var refs = {};
    var wrap = h("div.grid.cols-2");

    function fieldEl(f) {
      var err = h("div.err-msg", { hidden: true }, UI.icon("alert", 13), h("span"));
      var input;
      var common = {
        id: "ff-" + f.key,
        onblur: function () { validateField(f, false); },
        oninput: function () { values[f.key] = input.value; }
      };
      if (f.type === "textarea") {
        input = h("textarea.input", common); input.value = values[f.key] || "";
      } else if (f.type === "select") {
        input = h("select.input", common,
          h("option", { value: "" }, RGP.i18n.lang === "ar" ? "اختر…" : "Choose…"),
          (f.options || []).map(function (o) {
            var v = typeof o === "string" ? o : (o.v || o.value || td(o));
            var label = typeof o === "string" ? o : (o.label ? td(o.label) : (o.ar || o.en) ? td(o) : v);
            return h("option", { value: v, selected: values[f.key] === v }, label);
          }));
        input.onchange = function () { values[f.key] = input.value; validateField(f, false); };
      } else if (f.type === "number") {
        input = h("input.input.num-field", Object.assign({ type: "number", inputmode: "decimal" }, common));
        input.value = values[f.key] != null ? values[f.key] : "";
      } else if (f.type === "date") {
        input = h("input.input.num-field", Object.assign({ type: "date" }, common));
        input.value = values[f.key] || "";
      } else if (f.type === "parcel-id" || f.type === "parcel") {
        input = h("input.input.num-field", Object.assign({ type: "text", placeholder: "1010-XXXX" }, common));
        input.value = values[f.key] || "";
      } else if (f.type === "map-point") {
        input = h("input.input.num-field", Object.assign({ type: "text", placeholder: "24.7136, 46.6753" }, common));
        input.value = values[f.key] || "";
      } else {
        input = h("input.input", Object.assign({ type: "text" }, common));
        input.value = values[f.key] || "";
      }
      refs[f.key] = { input: input, err: err, field: f };

      var el = h("div.field" + ((f.type === "textarea") ? "" : ""), null,
        h("label", { for: "ff-" + f.key },
          td(f.label),
          f.required ? h("span.req", null, "*") : h("span.opt", null, t("common.optional"))),
        input, err,
        f.hint ? h("div.hint", null, td(f.hint)) : null);
      if (f.type === "textarea") el.style.gridColumn = "1 / -1";

      /* simulated GIS lookup on parcel fields (it-spec T9.11, acceptance #9) */
      if (f.type === "parcel-id" || f.type === "parcel") {
        var gisBox = h("div", { hidden: true });
        el.appendChild(gisBox);
        input.addEventListener("change", function () {
          if (!input.value) { gisBox.hidden = true; return; }
          gisBox.hidden = false;
          gisBox.innerHTML = "";
          gisBox.appendChild(h("div.well.card-pad-dense.mbs-1", null,
            h("div.flex.g1.mbe-1", null,
              h("span.t-footnote.mut", null, RGP.i18n.lang === "ar" ? "نتيجة الاستعلام من نظم المعلومات الجغرافية" : "GIS lookup result"),
              UI.simBadge()),
            h("div.skeleton", { style: { height: "40px" } })));
          RGP.connectors.gisLookup(input.value, function (parcel) {
            gisBox.innerHTML = "";
            gisBox.appendChild(h("div.well.card-pad-dense.mbs-1", null,
              h("div.flex.g1.mbe-1", null,
                h("span.t-footnote.mut", null, RGP.i18n.lang === "ar" ? "نتيجة الاستعلام من نظم المعلومات الجغرافية" : "GIS lookup result"),
                UI.simBadge()),
              h("div.t-sub", null,
                (RGP.i18n.lang === "ar" ? "حي " : "District: ") + td(parcel.district) +
                " · " + (RGP.i18n.lang === "ar" ? "مخطط " : "Plan ") + parcel.planNo +
                " · " + RGP.fmtNum(parcel.areaSqm, { dec: 0 }) + (RGP.i18n.lang === "ar" ? " م²" : " sqm") +
                " · " + td(parcel.landUse))));
          });
        });
      }
      return el;
    }

    function validateField(f, silent) {
      var r = refs[f.key];
      var v = (values[f.key] == null ? "" : String(values[f.key])).trim();
      var msg = null;
      if (f.required && !v) msg = RGP.i18n.lang === "ar" ? "هذا الحقل إلزامي" : "This field is required";
      else if (f.type === "number" && v && isNaN(Number(v))) msg = RGP.i18n.lang === "ar" ? "أدخل رقمًا صحيحًا" : "Enter a valid number";
      else if (f.min != null && v && Number(v) < f.min) msg = (RGP.i18n.lang === "ar" ? "الحد الأدنى " : "Minimum ") + f.min;
      if (msg && !silent) {
        r.err.hidden = false; r.err.lastChild.textContent = msg;
        r.input.closest(".field").classList.add("error");
      } else {
        r.err.hidden = true;
        r.input.closest(".field").classList.remove("error");
      }
      return !msg;
    }

    fields.forEach(function (f) { wrap.appendChild(fieldEl(f)); });

    return {
      el: wrap,
      values: function () { return Object.assign({}, values); },
      validate: function () {
        var bad = [];
        fields.forEach(function (f) { if (!validateField(f, false)) bad.push(f); });
        return bad;
      },
      focusField: function (key) {
        if (refs[key]) refs[key].input.focus();
      }
    };
  };

  /* ---------------- star rating ---------------- */
  UI.stars = function (onRate) {
    var current = 0;
    var wrap = h("div.flex.g05", { style: { direction: "ltr", justifyContent: "center" } });
    for (var i = 1; i <= 5; i++) {
      (function (n) {
        var b = h("button.iconbtn", {
          "aria-label": n + " stars",
          onclick: function () {
            current = n;
            RGP.$$("button", wrap).forEach(function (x, idx) {
              x.style.color = idx < n ? "var(--sand)" : "var(--neutral-300)";
              x.innerHTML = "";
              x.appendChild(UI.icon(idx < n ? "starF" : "star", 26));
            });
            onRate(n);
          }
        }, UI.icon("star", 26));
        b.style.color = "var(--neutral-300)";
        wrap.appendChild(b);
      })(i);
    }
    return wrap;
  };
})();
