/* ============================================================
   Motion system — IO reveals, visible-triggered counters,
   shared-rAF parallax, pointer specular. Art-direction spec §2.
   One IntersectionObserver for the whole app; reveals fire once
   and never replay. All effects honor prefers-reduced-motion.
   ============================================================ */
"use strict";

(function () {
  var Motion = RGP.motion = {};

  var HOVER_FINE = false;
  try { HOVER_FINE = matchMedia("(hover: hover)").matches; } catch (e) { /* noop */ }

  /* ---------------- one IntersectionObserver ---------------- */
  var io = null;
  if (!RGP.REDUCED_MOTION && typeof IntersectionObserver === "function") {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);                       /* reveals never replay */
        if (el.hasAttribute && el.hasAttribute("data-io")) el.classList.add("io-in");
        if (el._rgpCount) { runCount(el); el._rgpCount = null; }
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -10% 0px" });
  }

  /* Observe every [data-io] under root. Called by the router after mount. */
  Motion.scan = function (root) {
    var nodes = RGP.$$("[data-io]", root || document);
    nodes.forEach(function (el) {
      if (el.classList.contains("io-in")) return;
      if (io) io.observe(el);
      else el.classList.add("io-in");           /* reduced motion / no IO: fully rendered */
    });
  };

  Motion.observe = function (el) {
    if (!el) return;
    if (io) io.observe(el);
    else el.classList.add("io-in");
  };

  /* ---------------- visible-triggered counters (§2.2) ----------------
     1400ms, easeOutQuart 1-(1-t)^4, RGP.fmtNum formatting.
     opts: { dec, suffix }. Runs once; re-navigation does not replay. */
  function runCount(el) {
    var reg = el._rgpCount;
    if (!reg) return;
    var value = reg.value, opts = reg.opts || {};
    var fmt = function (v) {
      return RGP.fmtNum(v, { dec: opts.dec != null ? opts.dec : 0 }) + (opts.suffix || "");
    };
    var start = null, dur = 1400;
    function tick(now) {
      if (!start) start = now;
      var p = RGP.clamp((now - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 4);       /* easeOutQuart */
      el.textContent = fmt(value * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(value);
    }
    requestAnimationFrame(tick);
  }

  Motion.countUp = function (el, value, opts) {
    if (!el) return;
    opts = opts || {};
    if (RGP.REDUCED_MOTION || !io) {            /* final value immediately */
      el.textContent = RGP.fmtNum(value, { dec: opts.dec != null ? opts.dec : 0 }) + (opts.suffix || "");
      return;
    }
    el._rgpCount = { value: value, opts: opts };
    io.observe(el);
  };

  /* ---------------- parallax (§1.1) ----------------
     ONE shared rAF scroll handler for every registered layer.
     Desktop ≥768px only; never attached under reduced motion. */
  var layers = [];
  var scrollBound = false;
  var rafPending = false;

  function applyParallax() {
    rafPending = false;
    var y = window.scrollY || window.pageYOffset || 0;
    for (var i = layers.length - 1; i >= 0; i--) {
      var L = layers[i];
      if (!L.el.isConnected) { layers.splice(i, 1); continue; }
      L.el.style.transform = "translateY(" + Math.min(y * L.factor, L.cap) + "px)";
    }
  }
  function onScroll() {
    if (rafPending || !layers.length) return;
    rafPending = true;
    requestAnimationFrame(applyParallax);
  }

  Motion.parallax = function (mediaEl, factor, cap) {
    if (!mediaEl) return;
    if (RGP.REDUCED_MOTION) return;             /* transform stays none */
    if (window.innerWidth < 768) return;        /* phones: no listener */
    layers.push({ el: mediaEl, factor: factor || 0.14, cap: cap != null ? cap : 64 });
    if (!scrollBound) {
      scrollBound = true;
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    onScroll();
  };

  /* ---------------- pointer-tracked specular (§2.4-3) ----------------
     Sets --mx/--my percent vars; hover-capable pointers only, no
     transform, no tilt. Guarded off under reduced motion. */
  Motion.specular = function (el) {
    if (!el) return;
    if (RGP.REDUCED_MOTION || !HOVER_FINE) return;
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    });
    el.addEventListener("mouseleave", function () {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    });
  };
})();
