/* ============================================================
   منصة الخدمات البلدية للمشاريع الكبرى — أمانة منطقة الرياض
   Riyadh Unified Giga-Projects Enablement Platform (RGP)
   Core utilities. Vanilla JS, RTL-first, offline, no frameworks.
   ============================================================ */
"use strict";

var RGP = window.RGP = window.RGP || {};

/* ---------------- DOM helpers ---------------- */
RGP.$  = function (sel, root) { return (root || document).querySelector(sel); };
RGP.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

/* Hyperscript-style element builder: h('div.card', {onclick:fn}, child, ...) */
RGP.h = function (spec, attrs) {
  var parts = String(spec).split(/(?=[.#])/);
  var el = document.createElement(parts[0] || "div");
  for (var i = 1; i < parts.length; i++) {
    var p = parts[i];
    if (p[0] === ".") el.classList.add(p.slice(1));
    else if (p[0] === "#") el.id = p.slice(1);
  }
  var children = Array.prototype.slice.call(arguments, 2);
  if (attrs != null) {
    if (typeof attrs === "string" || typeof attrs === "number" || attrs instanceof Node || Array.isArray(attrs)) {
      children.unshift(attrs);
    } else {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class") el.className += (el.className ? " " : "") + v;
        else if (k === "dataset") Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
        else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
        else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (k === "html") el.innerHTML = v;
        else if (v === true) el.setAttribute(k, "");
        else el.setAttribute(k, v);
      });
    }
  }
  function append(c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(append); return; }
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  children.forEach(append);
  return el;
};

/* ---------------- misc ---------------- */
RGP.uid = function (prefix) {
  return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
};
RGP.deepClone = function (o) { return JSON.parse(JSON.stringify(o)); };
RGP.debounce = function (fn, ms) {
  var t = null;
  return function () {
    var args = arguments, self = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(self, args); }, ms || 200);
  };
};
RGP.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
RGP.escapeHtml = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};
RGP.zeroPad = function (n, w) { n = String(n); while (n.length < w) n = "0" + n; return n; };

/* Deterministic 32-bit hash (verification codes, stable pseudo-random). */
RGP.hash32 = function (str) {
  var h = 2166136261;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
};

/* ---------------- dates & working days (Riyadh: Sun–Thu, holidays-aware) ---------------- */
RGP.DAY = 86400000;

RGP.parseISO = function (iso) { return new Date(iso.length === 10 ? iso + "T12:00:00" : iso); };
RGP.toISO = function (d) {
  var z = function (n) { return (n < 10 ? "0" : "") + n; };
  return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
};
RGP.todayISO = function () { return RGP.toISO(new Date()); };
RGP.nowISO = function () { return new Date().toISOString(); };

RGP.holidays = function () {
  try { return (RGP.store.state.settings.holidays) || []; } catch (e) { return []; }
};

RGP.isWorkday = function (d) {
  var g = d.getDay();
  if (g === 5 || g === 6) return false;                 /* Fri, Sat */
  return RGP.holidays().indexOf(RGP.toISO(d)) < 0;
};

/* Add n working days to an ISO date (n ≥ 0). */
RGP.addWorkingDays = function (iso, n) {
  var d = RGP.parseISO(iso.slice(0, 10)), left = n;
  while (left > 0) {
    d = new Date(d.getTime() + RGP.DAY);
    if (RGP.isWorkday(d)) left--;
  }
  return RGP.toISO(d);
};

/* Working days from a to b (a ≤ b → ≥0; a > b → negative). */
RGP.workingDaysBetween = function (aISO, bISO) {
  var a = RGP.parseISO(aISO.slice(0, 10)), b = RGP.parseISO(bISO.slice(0, 10));
  var sign = 1;
  if (a > b) { var t = a; a = b; b = t; sign = -1; }
  var n = 0, d = new Date(a.getTime());
  while (d < b) {
    d = new Date(d.getTime() + RGP.DAY);
    if (RGP.isWorkday(d)) n++;
  }
  return sign * n;
};

RGP.daysBetween = function (aISO, bISO) {
  return Math.round((RGP.parseISO(bISO.slice(0, 10)) - RGP.parseISO(aISO.slice(0, 10))) / RGP.DAY);
};

/* Seed helper: ISO date n calendar days ago (n may be negative for future). */
RGP.daysAgo = function (n) { return RGP.toISO(new Date(Date.now() - n * RGP.DAY)); };

/* ---------------- numeral policy (ux-spec §3.3) ----------------
   Western digits everywhere — the Amanah reporting convention —
   always rendered inside .num for tabular figures + LTR isolation. */
RGP.fmtNum = function (v, opts) {
  if (v == null || (typeof v === "number" && isNaN(v))) return "—";
  var o = opts || {};
  return Number(v).toLocaleString("en-US", {
    maximumFractionDigits: o.dec != null ? o.dec : 1,
    minimumFractionDigits: o.min || 0
  });
};

RGP.fmtPct = function (v, opts) {
  if (v == null || isNaN(v)) return "—";
  return RGP.fmtNum(v, opts) + "%";
};

RGP.MONTHS = {
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

RGP.fmtDate = function (iso) {
  if (!iso) return "—";
  var lang = RGP.i18n ? RGP.i18n.lang : "ar";
  var d = RGP.parseISO(iso.slice(0, 10));
  var m = RGP.MONTHS[lang][d.getMonth()];
  if (lang === "en") return m + " " + d.getDate() + ", " + d.getFullYear();
  return d.getDate() + " " + m + " " + d.getFullYear();
};

RGP.fmtDateTime = function (isoOrTs) {
  if (!isoOrTs) return "—";
  var d = typeof isoOrTs === "number" ? new Date(isoOrTs) : new Date(isoOrTs);
  var z = function (n) { return (n < 10 ? "0" : "") + n; };
  return RGP.fmtDate(RGP.toISO(d)) + " · " + z(d.getHours()) + ":" + z(d.getMinutes());
};

/* Arabic plural agreement: n + (singular, dual, plural3to10, plural11plus) */
RGP.arPlural = function (n, one, two, few, many) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return RGP.fmtNum(n, { dec: 0 }) + " " + few;
  return RGP.fmtNum(n, { dec: 0 }) + " " + many;
};

/* working-day counts with correct فصحى agreement.
   opts.gen: genitive context (after بمقدار/منذ/خلال) — dual becomes «يومي عمل» */
RGP.fmtWorkdays = function (n, opts) {
  var lang = RGP.i18n ? RGP.i18n.lang : "ar";
  n = Math.round(n * 10) / 10;
  if (lang === "en") return RGP.fmtNum(n, { dec: (n % 1 ? 1 : 0) }) + " working day" + (n === 1 ? "" : "s");
  if (n % 1) return RGP.fmtNum(n, { dec: 1 }) + " يوم عمل";
  return RGP.arPlural(n, "يوم عمل واحد", (opts && opts.gen) ? "يومي عمل" : "يوما عمل", "أيام عمل", "يوم عمل");
};

/* relative time for timeline/notifications — correct Arabic plurals */
RGP.fmtAgo = function (isoOrTs) {
  var t = typeof isoOrTs === "number" ? isoOrTs : new Date(isoOrTs).getTime();
  var mins = Math.round((Date.now() - t) / 60000);
  var lang = RGP.i18n ? RGP.i18n.lang : "ar";
  if (mins < 1) return lang === "ar" ? "الآن" : "now";
  if (mins < 60) return lang === "ar" ? "قبل " + RGP.arPlural(mins, "دقيقة", "دقيقتين", "دقائق", "دقيقة") : mins + "m ago";
  var hrs = Math.round(mins / 60);
  if (hrs < 24) return lang === "ar" ? "قبل " + RGP.arPlural(hrs, "ساعة", "ساعتين", "ساعات", "ساعة") : hrs + "h ago";
  var days = Math.round(hrs / 24);
  if (days < 30) return lang === "ar" ? "قبل " + RGP.arPlural(days, "يوم", "يومين", "أيام", "يومًا") : days + "d ago";
  return RGP.fmtDate(RGP.toISO(new Date(t)));
};

/* ---------------- tiny event bus ---------------- */
RGP.bus = (function () {
  var handlers = {};
  return {
    on: function (evt, fn) { (handlers[evt] = handlers[evt] || []).push(fn); },
    emit: function (evt, payload) {
      (handlers[evt] || []).forEach(function (fn) {
        try { fn(payload); } catch (e) { console.error("bus handler failed for", evt, e); }
      });
    }
  };
})();

RGP.REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;

RGP.isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
