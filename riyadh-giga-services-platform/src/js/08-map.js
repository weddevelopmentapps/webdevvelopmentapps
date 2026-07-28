/* ============================================================
   Inline-SVG Riyadh map — stylized district fabric + ring roads
   + wadi, project markers by lat/lng affine transform. No tiles,
   no network. ux-spec §6.13. Geography never mirrors.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h;
  var MAP = RGP.map = {};

  /* viewBox 0 0 900 640; calibrated affine fit for Riyadh metro:
     lng 46.0–47.1 → x 40–860 ; lat 25.05–24.45 → y 40–600 */
  var LNG0 = 46.0, LNG1 = 47.1, LAT0 = 25.05, LAT1 = 24.45;
  function px(lng) { return 40 + (lng - LNG0) / (LNG1 - LNG0) * 820; }
  function py(lat) { return 40 + (LAT0 - lat) / (LAT0 - LAT1) * 560; }

  /* stylized district polygons (hand-drawn abstraction of Riyadh's fabric) */
  var DISTRICTS = [
    { n: { ar: "الدرعية", en: "Diriyah" },        d: "M330 180 L410 165 L455 210 L430 275 L350 285 L310 235 Z" },
    { n: { ar: "حطين والملقا", en: "Hittin & Malqa" }, d: "M455 210 L560 195 L600 250 L560 305 L470 300 L430 275 Z" },
    { n: { ar: "العليا", en: "Olaya" },           d: "M560 305 L640 290 L670 350 L630 410 L555 400 L535 350 Z" },
    { n: { ar: "المركز", en: "City core" },       d: "M555 400 L630 410 L645 470 L590 510 L525 480 L520 435 Z" },
    { n: { ar: "الدرعية التاريخية", en: "At-Turaif" }, d: "M270 240 L310 235 L350 285 L330 330 L275 320 Z" },
    { n: { ar: "إرقاح ولبن", en: "Irqah & Laban" }, d: "M330 330 L430 340 L445 420 L380 460 L300 430 L290 370 Z" },
    { n: { ar: "السويدي", en: "Suwaidi" },        d: "M380 460 L445 420 L520 435 L525 480 L470 540 L390 520 Z" },
    { n: { ar: "النرجس والعارض", en: "Narjis & Arid" }, d: "M480 90 L590 75 L640 130 L600 195 L520 200 L470 150 Z" },
    { n: { ar: "القيروان", en: "Qairawan" },      d: "M410 120 L480 90 L470 150 L455 210 L410 165 Z" },
    { n: { ar: "الشمال الشرقي", en: "North-east" }, d: "M640 130 L740 120 L790 190 L740 260 L660 250 L600 195 Z" },
    { n: { ar: "الروضة", en: "Rawdah" },          d: "M660 250 L740 260 L770 330 L720 390 L645 385 L640 290 L600 250 Z" },
    { n: { ar: "الشرق", en: "East" },             d: "M720 390 L790 380 L810 460 L740 510 L670 480 L645 470 L630 410 Z" },
    { n: { ar: "الجنوب", en: "South" },           d: "M470 540 L590 510 L645 470 L670 480 L660 570 L540 590 L460 570 Z" },
    { n: { ar: "بنبان", en: "Banban" },           d: "M470 40 L610 30 L590 75 L480 90 Z" },
  ];

  /* ring roads (stylized) */
  var ROADS = [
    "M240 260 C 340 140, 620 120, 760 240",
    "M250 430 C 300 540, 600 570, 730 460",
    "M250 430 C 220 350, 230 300, 240 260",
    "M760 240 C 790 320, 780 390, 730 460",
    "M430 60 C 470 240, 480 420, 500 590",
  ];
  var WADI = "M270 200 C 330 300, 300 420, 380 520 C 420 570, 480 580, 540 590";

  var STATUS_COLOR = {
    registered: "var(--st-submitted-fg)",
    active: "var(--ch-2)",
    on_hold: "var(--warn)",
    enabled: "var(--accent)",
    archived: "var(--faint)"
  };

  MAP.statusColor = function (status) { return STATUS_COLOR[status] || "var(--accent)"; };

  /* Render the map card. opts: {projects, height, onSelect, showLabels, pulseIds} */
  MAP.render = function (opts) {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 900 640");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", RGP.i18n.lang === "ar" ? "خريطة مشاريع الرياض" : "Riyadh projects map");
    svg.style.direction = "ltr";

    DISTRICTS.forEach(function (d) {
      var p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d.d);
      p.setAttribute("class", "rmap-district");
      var title = document.createElementNS(svgNS, "title");
      title.textContent = td(d.n);
      p.appendChild(title);
      svg.appendChild(p);
    });
    ROADS.forEach(function (r) {
      var p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", r);
      p.setAttribute("class", "rmap-road");
      svg.appendChild(p);
    });
    var w = document.createElementNS(svgNS, "path");
    w.setAttribute("d", WADI);
    w.setAttribute("class", "rmap-wadi");
    svg.appendChild(w);

    var wrap = h("div.map-svg-wrap");
    var pop = null;
    function closePop() { if (pop) { pop.remove(); pop = null; } }

    /* Phone rendering: the viewBox shrinks to ~0.4x on a 390px screen, so
       markers scale up, clustering widens (clusters-first navigation), and
       every marker gets an invisible touch circle ≥ ~40px on screen. */
    var phone = (window.innerWidth || 1200) <= 768;
    var MK = phone ? 2.1 : 1;              /* marker scale in viewBox units */
    var CLUSTER_DIST = phone ? 90 : 34;

    /* --- proximity clustering (§6.13) --- */
    var pts = (opts.projects || []).map(function (prj) {
      return { prj: prj, x: px(prj.location.lng), y: py(prj.location.lat), cluster: -1 };
    });
    var clusters = [];
    pts.forEach(function (pt) {
      for (var ci = 0; ci < clusters.length; ci++) {
        var c = clusters[ci];
        var dx = c.x - pt.x, dy = c.y - pt.y;
        if (Math.sqrt(dx * dx + dy * dy) < CLUSTER_DIST) { c.items.push(pt); pt.cluster = ci;
          c.x = c.items.reduce(function (a, i2) { return a + i2.x; }, 0) / c.items.length;
          c.y = c.items.reduce(function (a, i2) { return a + i2.y; }, 0) / c.items.length;
          return; }
      }
      clusters.push({ x: pt.x, y: pt.y, items: [pt] });
      pt.cluster = clusters.length - 1;
    });

    function hitCircle(cx, cy) {
      var hc = document.createElementNS(svgNS, "circle");
      hc.setAttribute("cx", cx); hc.setAttribute("cy", cy);
      hc.setAttribute("r", 22 * MK);
      hc.setAttribute("fill", "transparent");
      return hc;
    }

    clusters.filter(function (c) { return c.items.length > 1; }).forEach(function (c) {
      var g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "rmap-marker");
      g.appendChild(hitCircle(c.x, c.y));
      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", c.x); circle.setAttribute("cy", c.y); circle.setAttribute("r", 13 * MK);
      circle.setAttribute("fill", "var(--accent)");
      circle.setAttribute("class", "core");
      g.appendChild(circle);
      var txt = document.createElementNS(svgNS, "text");
      txt.setAttribute("x", c.x); txt.setAttribute("y", c.y + 3.5 * MK);
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("style", "font-family:var(--ff-display);font-size:" + (11 * MK) + "px;font-weight:700;fill:var(--on-accent);pointer-events:none");
      txt.textContent = String(c.items.length);
      g.appendChild(txt);
      g.addEventListener("click", function (e) {
        e.stopPropagation();
        closePop();
        pop = h("div.map-pop", null,
          h("div.t-footnote.mut.mbe-1", { style: { fontWeight: 600 } },
            (RGP.i18n.lang === "ar" ? "مشاريع متقاربة: " : "Nearby projects: ") + c.items.length),
          c.items.map(function (pt2) {
            return h("div.flex.g1.hairline-b", {
              style: { padding: "6px 0", cursor: opts.onSelect ? "pointer" : "default" },
              onclick: opts.onSelect ? function () { closePop(); opts.onSelect(pt2.prj); } : null
            },
              h("span.lg-dot", { style: { width: "8px", height: "8px", borderRadius: "8px", background: MAP.statusColor(pt2.prj.status) } }),
              h("span.t-footnote", { style: { fontWeight: 600 } }, td(pt2.prj.name)),
              h("span.grow"),
              h("span.t-caption.mut", { style: { fontWeight: 500 } }, td(RGP.projectPhaseLabel(pt2.prj.phase))));
          }));
        var rect = wrap.getBoundingClientRect();
        var sx = rect.width / 900, sy = rect.height / 640;
        pop.style.left = RGP.clamp(c.x * sx - 140, 8, rect.width - 288) + "px";
        pop.style.top = Math.max(8, c.y * sy - 160) + "px";
        wrap.appendChild(pop);
      });
      svg.appendChild(g);
    });

    pts.filter(function (pt) { return clusters[pt.cluster].items.length === 1; }).forEach(function (pt) {
      var prj = pt.prj;
      var cx = pt.x, cy = pt.y;
      var g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "rmap-marker");
      var color = MAP.statusColor(prj.status);
      g.appendChild(hitCircle(cx, cy));

      if ((opts.pulseIds || []).indexOf(prj.id) >= 0) {
        var pulse = document.createElementNS(svgNS, "circle");
        pulse.setAttribute("cx", cx); pulse.setAttribute("cy", cy); pulse.setAttribute("r", 9 * MK);
        pulse.setAttribute("fill", "none");
        pulse.setAttribute("stroke", "var(--danger)");
        pulse.setAttribute("stroke-width", "2");
        pulse.setAttribute("class", "pulse");
        g.appendChild(pulse);
      }
      if (prj.isGiga) {
        var ringO = document.createElementNS(svgNS, "circle");
        ringO.setAttribute("cx", cx); ringO.setAttribute("cy", cy); ringO.setAttribute("r", 10 * MK);
        ringO.setAttribute("fill", "none");
        ringO.setAttribute("stroke", "var(--sand)");
        ringO.setAttribute("stroke-width", "1.5");
        g.appendChild(ringO);
      }
      var core = document.createElementNS(svgNS, "circle");
      core.setAttribute("cx", cx); core.setAttribute("cy", cy);
      core.setAttribute("r", (prj.isGiga ? 7 : 5) * MK);
      core.setAttribute("fill", color);
      core.setAttribute("class", "core");
      g.appendChild(core);

      if (opts.showLabels) {
        var lbl = document.createElementNS(svgNS, "text");
        lbl.setAttribute("x", cx); lbl.setAttribute("y", cy - 14 * MK);
        lbl.setAttribute("text-anchor", "middle");
        lbl.setAttribute("class", "rmap-label");
        if (phone) lbl.setAttribute("style", "font-size:" + (11 * MK) + "px");
        lbl.textContent = td(prj.name);
        g.appendChild(lbl);
      }

      g.addEventListener("click", function (e) {
        e.stopPropagation();
        closePop();
        var reqs = RGP.store.state.requests.filter(function (r) { return r.projectId === prj.id; });
        var open = reqs.filter(function (r) { return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0; }).length;
        var chs = RGP.store.state.challenges.filter(function (c) {
          return c.projectId === prj.id && ["open", "in_progress", "escalated"].indexOf(c.state) >= 0;
        }).length;
        pop = h("div.map-pop", null,
          h("div.flex.g1.between.mbe-1", null,
            h("div.t-headline", null, td(prj.name)),
            prj.isGiga ? RGP.ui.gigaBadge() : null),
          h("div.t-footnote.mut.mbe-1", null, td(prj.owner)),
          h("div.flex.g15.mbe-2", null,
            h("span.pill.plain", null, td(RGP.projectPhaseLabel(prj.phase))),
            h("span.pill." + (prj.status === "enabled" ? "ok" : "info"), null, td(RGP.projectStatusLabel(prj.status)))),
          h("div.flex.g2", null,
            h("span.t-footnote.mut", null, (RGP.i18n.lang === "ar" ? "طلبات نشطة: " : "Active requests: "),
              h("b.num", null, RGP.fmtNum(open, { dec: 0 }))),
            h("span.t-footnote.mut", null, (RGP.i18n.lang === "ar" ? "تحديات مفتوحة: " : "Open challenges: "),
              h("b.num", null, RGP.fmtNum(chs, { dec: 0 })))),
          opts.onSelect ? h("div.mbs-2", null,
            h("button.btn.tertiary.sm", {
              onclick: function () { closePop(); opts.onSelect(prj); }
            }, RGP.i18n.lang === "ar" ? "عرض المشروع" : "View project")) : null);
        var rect = wrap.getBoundingClientRect();
        var sx = rect.width / 900, sy = rect.height / 640;
        var leftPx = RGP.clamp(cx * sx - 140, 8, rect.width - 288);
        var topPx = cy * sy - 8;
        pop.style.left = leftPx + "px";
        if (topPx > 220) { pop.style.top = (topPx - 180) + "px"; } else { pop.style.top = (topPx + 24) + "px"; }
        wrap.appendChild(pop);
      });
      svg.appendChild(g);
    });

    wrap.appendChild(svg);
    wrap.addEventListener("click", closePop);

    var legend = h("div.map-legend", null,
      [["enabled", RGP.i18n.lang === "ar" ? "ممكّن" : "Enabled"],
       ["active", RGP.i18n.lang === "ar" ? "نشط" : "Active"],
       ["registered", RGP.i18n.lang === "ar" ? "مسجل" : "Registered"],
       ["on_hold", RGP.i18n.lang === "ar" ? "متوقف" : "On hold"]].map(function (x) {
        return h("span.lg-item", null,
          h("span.lg-dot", { style: { background: STATUS_COLOR[x[0]] } }), x[1]);
      }),
      h("span.lg-item", null,
        h("span.lg-dot", { style: { background: "transparent", border: "1.5px solid var(--sand)" } }),
        RGP.i18n.lang === "ar" ? "مشروع كبير" : "Giga project"));

    var card = h("div.map-card.elev-1", { style: opts.height ? { } : null }, wrap, legend);
    return card;
  };
})();
