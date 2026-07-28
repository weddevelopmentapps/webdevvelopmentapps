/* ============================================================
   Customization — «تخصيص المظهر». Art-direction spec §4.
   Accent / density / type-scale persisted in one localStorage
   key (rgp.prefs); theme stays in rgp.theme. apply() stamps the
   data-attributes on <html> and runs before first render (boot).
   The side-sheet UI re-opens after every re-render so the user
   can keep adjusting.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h;
  var KEY = "rgp.prefs";
  var DEFAULTS = { accent: "green", density: "comfortable", fontScale: "md" };
  var ACCENTS = ["green", "sand", "teal", "violet"];
  var ACCENT_LABEL_KEY = {
    green: "prefs.accentGreen", sand: "prefs.accentSand",
    teal: "prefs.accentTeal", violet: "prefs.accentViolet"
  };

  var Prefs = RGP.prefs = {};

  Prefs.get = function () {
    var out = { accent: DEFAULTS.accent, density: DEFAULTS.density, fontScale: DEFAULTS.fontScale };
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (ACCENTS.indexOf(saved.accent) >= 0) out.accent = saved.accent;
        if (saved.density === "compact" || saved.density === "comfortable") out.density = saved.density;
        if (saved.fontScale === "sm" || saved.fontScale === "md" || saved.fontScale === "lg") out.fontScale = saved.fontScale;
      }
    } catch (e) { /* defaults */ }
    return out;
  };

  Prefs.set = function (patch) {
    var next = Object.assign(Prefs.get(), patch || {});
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* noop */ }
    Prefs.apply();
    return next;
  };

  /* stamps <html> — defaults (green/comfortable/md) remove the attribute */
  Prefs.apply = function () {
    var p = Prefs.get();
    var root = document.documentElement;
    if (p.accent === "green") root.removeAttribute("data-accent");
    else root.setAttribute("data-accent", p.accent);
    if (p.density === "comfortable") root.removeAttribute("data-density");
    else root.setAttribute("data-density", p.density);
    if (p.fontScale === "md") root.removeAttribute("data-fontscale");
    else root.setAttribute("data-fontscale", p.fontScale);
  };

  /* charts read CSS vars at init → dispose + rerender the mounted route,
     then re-open the sheet (a render clears every overlay). */
  function afterChange() {
    if (RGP.charts && RGP.charts.disposeAll) RGP.charts.disposeAll();
    if (RGP.router && RGP.router.render && RGP.auth && RGP.store && RGP.store.state) {
      RGP.router.render();
      setTimeout(function () { Prefs.openSheet(); }, 0);
    }
  }

  function currentTheme() {
    var saved = null;
    try { saved = localStorage.getItem("rgp.theme"); } catch (e) { /* noop */ }
    return saved || "light";
  }

  function setTheme(mode) {
    try { localStorage.setItem("rgp.theme", mode); } catch (e) { /* noop */ }
    RGP.applyTheme();
  }

  /* ---------------- side sheet (§4.1) ---------------- */
  Prefs.openSheet = function () {
    var UI = RGP.ui;
    var root = RGP.$("#overlay-root") || document.body;
    var existing = RGP.$(".prefs-scrim", root);
    if (existing) existing.remove();

    var p = Prefs.get();
    var theme = currentTheme();

    function close() {
      scrim.remove();
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }

    function seg(options, value, onPick, extraCls) {
      return h("div.segmented.prefs-seg" + (extraCls || ""), null, options.map(function (o) {
        return h("button" + (value === o.v ? ".active" : ""), {
          type: "button", "aria-pressed": value === o.v ? "true" : "false",
          "aria-label": o.aria || null,
          onclick: function () { onPick(o.v); }
        }, o.label);
      }));
    }

    function section(label, control) {
      return h("div.prefs-sec", null,
        h("div.t-caption.mut.prefs-sec-label", null, label),
        control);
    }

    var sheet = h("aside.prefs-sheet", { role: "dialog", "aria-modal": "true", "aria-label": t("prefs.title") },
      h("div.prefs-head", null,
        h("div.t-title3.grow", null, t("prefs.title")),
        h("button.iconbtn", { "aria-label": t("common.close"), onclick: close }, UI.icon("x", 18))),

      /* 1 — المظهر (writes existing rgp.theme) */
      section(t("prefs.appearance"),
        seg([
          { v: "light", label: t("prefs.light") },
          { v: "dark", label: t("prefs.dark") },
          { v: "auto", label: t("prefs.auto") }
        ], theme, function (v) { setTheme(v); afterChange(); })),

      /* 2 — لون الهوية */
      section(t("prefs.accent"),
        h("div.prefs-swatches", null, ACCENTS.map(function (a) {
          return h("button.swatch.swatch-" + a + (p.accent === a ? ".active" : ""), {
            type: "button",
            title: t(ACCENT_LABEL_KEY[a]),
            "aria-label": t(ACCENT_LABEL_KEY[a]),
            "aria-pressed": p.accent === a ? "true" : "false",
            onclick: function () { Prefs.set({ accent: a }); afterChange(); }
          }, p.accent === a ? UI.icon("check", 18) : null);
        }))),

      /* 3 — الكثافة */
      section(t("prefs.density"),
        seg([
          { v: "comfortable", label: t("prefs.comfortable") },
          { v: "compact", label: t("prefs.compact") }
        ], p.density, function (v) { Prefs.set({ density: v }); afterChange(); })),

      /* 4 — حجم الخط (A− A A+) */
      section(t("prefs.fontSize"),
        seg([
          { v: "sm", label: "A−", aria: RGP.i18n.lang === "ar" ? "صغير" : "Small" },
          { v: "md", label: "A", aria: RGP.i18n.lang === "ar" ? "افتراضي" : "Default" },
          { v: "lg", label: "A+", aria: RGP.i18n.lang === "ar" ? "كبير" : "Large" }
        ], p.fontScale, function (v) { Prefs.set({ fontScale: v }); afterChange(); }, ".prefs-seg-type")),

      /* 5 — إعادة التعيين */
      h("div.prefs-foot", null,
        h("button.btn.tertiary", {
          type: "button",
          onclick: function () {
            try { localStorage.removeItem(KEY); } catch (e) { /* noop */ }
            setTheme("light");
            Prefs.apply();
            afterChange();
          }
        }, t("prefs.reset"))));

    var scrim = h("div.prefs-scrim", {
      onclick: function (e) { if (e.target === scrim) close(); }
    }, sheet);

    root.appendChild(scrim);
    document.addEventListener("keydown", onKey);
    var first = RGP.$("button", sheet);
    if (first && window.innerWidth > 768) first.focus();
    return { close: close, el: sheet };
  };
})();
