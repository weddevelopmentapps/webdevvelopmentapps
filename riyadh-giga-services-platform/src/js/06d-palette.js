/* ============================================================
   Command palette — Ctrl/Cmd+K. Art-direction spec §5.
   Sections: Actions / Navigate / Requests / Projects / Services
   (+ Recent on empty query). Role-aware; anonymous scope is
   services + journeys + sign-in only. Virtual selection via
   aria-activedescendant — focus never leaves the input.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h;
  var RECENT_KEY = "rgp.recent";
  var Palette = RGP.palette = {};

  /* role → routes, mirroring the rail NAVS in 09-domain.js (route/label/icon
     verbatim; NAVS itself is private to that module) */
  var NAV_ROUTES = {
    project_rep: [
      { route: "#/portal", icon: "home", label: { ar: "الرئيسية", en: "Home" } },
      { route: "#/portal/journeys", icon: "map", label: { ar: "مستكشف الرحلة", en: "Journeys" } },
      { route: "#/wizard", icon: "plus", label: { ar: "طلب جديد", en: "New request" } },
      { route: "#/portal/requests", icon: "docs", label: { ar: "طلباتي", en: "My requests" } },
      { route: "#/portal/challenges", icon: "flag", label: { ar: "التحديات", en: "Challenges" } },
      { route: "#/portal/inbox", icon: "bell", label: { ar: "الإشعارات", en: "Notifications" } },
      { route: "#/portal/profile", icon: "user", label: { ar: "الملف الشخصي", en: "Profile" } }
    ],
    amanah_specialist: [
      { route: "#/work/queue", icon: "inbox", label: { ar: "قائمة الطلبات", en: "Queue" } },
      { route: "#/challenges", icon: "flag", label: { ar: "التحديات", en: "Challenges" } },
      { route: "#/portal/inbox", icon: "bell", label: { ar: "الإشعارات", en: "Notifications" } },
      { route: "#/portal/profile", icon: "user", label: { ar: "الملف الشخصي", en: "Profile" } }
    ],
    platform_manager: [
      { route: "#/manager/dashboard", icon: "grid", label: { ar: "لوحة القيادة", en: "Dashboard" } },
      { route: "#/manager/projects", icon: "building", label: { ar: "سجل المشاريع", en: "Projects registry" } },
      { route: "#/work/queue", icon: "inbox", label: { ar: "الطلبات", en: "Requests" } },
      { route: "#/manager/challenges", icon: "flag", label: { ar: "التحديات", en: "Challenges" } },
      { route: "#/manager/kpis", icon: "chart", label: { ar: "مؤشرات الأداء", en: "KPIs" } },
      { route: "#/manager/impact", icon: "spark", label: { ar: "الأثر", en: "Impact" } },
      { route: "#/manager/reports", icon: "doc", label: { ar: "التقارير", en: "Reports" } },
      { route: "#/manager/services", icon: "layers", label: { ar: "دليل الخدمات", en: "Catalog" } },
      { route: "#/manager/audit", icon: "shield", label: { ar: "سجل التدقيق", en: "Audit log" } },
      { route: "#/manager/settings", icon: "settings", label: { ar: "الإعدادات", en: "Settings" } }
    ],
    external_entity: [
      { route: "#/external", icon: "inbox", label: { ar: "الإحالات الواردة", en: "Referrals" } },
      { route: "#/portal/inbox", icon: "bell", label: { ar: "الإشعارات", en: "Notifications" } },
      { route: "#/portal/profile", icon: "user", label: { ar: "الملف الشخصي", en: "Profile" } }
    ],
    viewer: [
      { route: "#/executive", icon: "eye", label: { ar: "الملخص التنفيذي", en: "Executive" } },
      { route: "#/portal/profile", icon: "user", label: { ar: "الملف الشخصي", en: "Profile" } }
    ]
  };

  /* ---------------- recent (last 5 opened) ---------------- */
  function getRecent() {
    try {
      var raw = localStorage.getItem(RECENT_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.slice(0, 5) : [];
    } catch (e) { return []; }
  }
  function recordRecent(entry) {
    if (!entry || !entry.route) return;
    var arr = getRecent().filter(function (r) { return r.route !== entry.route; });
    arr.unshift({ route: entry.route, ar: entry.ar, en: entry.en, icon: entry.icon || "doc" });
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0, 5))); } catch (e) { /* noop */ }
  }

  /* ---------------- matching: substring over ar+" "+en, startsWith first ---------------- */
  function rank(items, q) {
    if (!q) return items;
    var ql = q.toLowerCase();
    var starts = [], contains = [];
    items.forEach(function (it) {
      var hay = (it.hay || "").toLowerCase();
      var idx = hay.indexOf(ql);
      if (idx < 0) return;
      if (idx === 0 || hay.split(/\s+/).some(function (w) { return w.indexOf(ql) === 0; })) starts.push(it);
      else contains.push(it);
    });
    return starts.concat(contains);
  }

  /* ---------------- section builders ---------------- */
  function svcRoute(user, s) {
    if (!user) return "#/login";
    if (user.role === "project_rep") return "#/wizard?service=" + s.id;
    if (user.role === "platform_manager") return "#/manager/services";
    if (user.role === "amanah_specialist" || user.role === "viewer") return "#/portal/journeys";
    return RGP.auth.homeRoute(user);
  }

  function buildSections(q) {
    var UI = RGP.ui;
    var user = RGP.auth.current();
    var S = RGP.store.state;
    var sections = [];

    if (!user) {
      /* anonymous / public scope: services + journeys + sign-in only */
      var pubActs = rank([{
        hay: t("common.signin") + " تسجيل الدخول sign in login",
        icon: "login", route: "#/login",
        ar: "تسجيل الدخول", en: "Sign in",
        render: function () { return [h("span.pal-ic", null, UI.icon("login", 18)), h("span.grow", null, t("common.signin"))]; }
      }], q).slice(0, 5);
      if (pubActs.length) sections.push({ title: t("pal.actions"), rows: pubActs });

      var jrows = rank((S.journeys || []).map(function (jr) {
        return {
          hay: jr.name.ar + " " + jr.name.en,
          icon: "map", route: "#/login", ar: jr.name.ar, en: jr.name.en,
          render: function () { return [h("span.pal-ic", null, UI.icon("map", 18)), h("span.grow", null, td(jr.name))]; }
        };
      }), q).slice(0, 5);
      if (jrows.length) sections.push({ title: t("pal.navigate"), rows: jrows });

      var pubSvcs = rank(S.services.map(function (s) { return svcItem(s, null); }), q).slice(0, 5);
      if (pubSvcs.length && q) sections.push({ title: t("pal.services"), rows: pubSvcs });
      if (!q) sections.push({ title: t("pal.services"), rows: S.services.slice(0, 5).map(function (s) { return svcItem(s, null); }) });
      return sections;
    }

    /* 1 — actions (role-aware) */
    var actions = [];
    if (user.role === "project_rep") actions.push({
      hay: t("pal.newRequest") + " طلب خدمة جديد new request",
      icon: "plus", route: "#/wizard", ar: "طلب خدمة جديد", en: "New request",
      render: function () { return [h("span.pal-ic", null, UI.icon("plus", 18)), h("span.grow", null, t("pal.newRequest"))]; }
    });
    actions.push({
      hay: t("pal.switchLang") + " تبديل اللغة switch language english عربي",
      action: function () { Palette.close(); RGP.i18n.toggle(); },
      render: function () { return [h("span.pal-ic", null, UI.icon("lang", 18)), h("span.grow", null, t("pal.switchLang"))]; }
    });
    actions.push({
      hay: t("pal.toggleTheme") + " تبديل المظهر toggle theme dark light داكن فاتح",
      action: function () { Palette.close(); RGP.toggleTheme(); },
      render: function () { return [h("span.pal-ic", null, UI.icon(document.documentElement.getAttribute("data-theme") === "dark" ? "sun" : "moon", 18)), h("span.grow", null, t("pal.toggleTheme"))]; }
    });
    actions.push({
      hay: t("pal.personalize") + " تخصيص المظهر personalize accent density",
      action: function () { Palette.close(); if (RGP.prefs) RGP.prefs.openSheet(); },
      render: function () { return [h("span.pal-ic", null, UI.icon("sliders", 18)), h("span.grow", null, t("pal.personalize"))]; }
    });
    actions.push({
      hay: t("pal.signOut") + " تسجيل الخروج sign out logout",
      action: function () { Palette.close(); RGP.auth.signOut(); RGP.router.go("#/"); },
      render: function () { return [h("span.pal-ic", null, UI.icon("logout", 18)), h("span.grow", null, t("pal.signOut"))]; }
    });
    var actRows = rank(actions, q).slice(0, 5);
    if (actRows.length) sections.push({ title: t("pal.actions"), rows: actRows });

    /* 2 — navigate (every route the current role can access) */
    var navRows = rank((NAV_ROUTES[user.role] || []).map(function (n) {
      return {
        hay: n.label.ar + " " + n.label.en,
        icon: n.icon, route: n.route, ar: n.label.ar, en: n.label.en,
        render: function () { return [h("span.pal-ic", null, UI.icon(n.icon, 18)), h("span.grow", null, td(n.label))]; }
      };
    }), q).slice(0, 5);
    if (navRows.length) sections.push({ title: t("pal.navigate"), rows: navRows });

    /* empty query → Actions + Navigate + Recent */
    if (!q) {
      var recent = getRecent().map(function (r) {
        return {
          hay: "", icon: r.icon, route: r.route, ar: r.ar, en: r.en,
          render: function () {
            return [h("span.pal-ic", null, UI.icon(r.icon || "doc", 18)),
              h("span.grow", null, RGP.i18n.lang === "ar" ? (r.ar || r.en) : (r.en || r.ar))];
          }
        };
      });
      if (recent.length) sections.push({ title: t("pal.recent"), rows: recent.slice(0, 5) });
      return sections;
    }

    /* 3 — requests: id + service name + project name */
    if (["project_rep", "amanah_specialist", "platform_manager"].indexOf(user.role) >= 0) {
      var staff = user.role !== "project_rep";
      var reqItems = [];
      S.requests.forEach(function (r) {
        if (!staff && r.createdById !== user.id &&
            (!user.delegatedBy || r.createdById !== user.delegatedBy)) return;
        var svc = RGP.store.service(r.serviceId);
        var proj = RGP.store.project ? RGP.store.project(r.projectId)
          : S.projects.filter(function (p) { return p.id === r.projectId; })[0];
        reqItems.push({
          hay: r.id + " " + (svc ? svc.name.ar + " " + svc.name.en : "") + " " +
               (proj ? proj.name.ar + " " + proj.name.en : ""),
          icon: "doc",
          route: staff ? "#/work/review/" + r.id : "#/portal/requests/" + r.id,
          ar: r.id, en: r.id,
          render: function () {
            return [h("span.id-cell.num", null, r.id),
              h("span.grow.ellipsis", null, svc ? td(svc.name) : ""),
              RGP.ui.statePill(r.state, true)];
          }
        });
      });
      var reqRows = rank(reqItems, q).slice(0, 5);
      if (reqRows.length) sections.push({ title: t("pal.requests"), rows: reqRows });
    }

    /* 4 — projects */
    if (user.role === "platform_manager") {
      var projRows = rank(S.projects.map(function (p) {
        return {
          hay: p.name.ar + " " + p.name.en,
          icon: "building", route: "#/manager/projects/" + p.id, ar: p.name.ar, en: p.name.en,
          render: function () {
            return [h("span.pal-ic", null, UI.icon("building", 18)),
              h("span.grow.ellipsis", null, td(p.name)),
              h("span.pill.plain.sm", null, td(RGP.projectPhaseLabel(p.phase)))];
          }
        };
      }), q).slice(0, 5);
      if (projRows.length) sections.push({ title: t("pal.projects"), rows: projRows });
    }

    /* 5 — services */
    var svcRows = rank(S.services.map(function (s) { return svcItem(s, user); }), q).slice(0, 5);
    if (svcRows.length) sections.push({ title: t("pal.services"), rows: svcRows });

    return sections;
  }

  function svcItem(s, user) {
    var UI = RGP.ui;
    var iconMap = { planning: "map", building: "building", infrastructure: "bolt", operation: "key",
      environment: "leaf", enablement: "crane", investment: "briefcase" };
    return {
      hay: s.name.ar + " " + s.name.en + " " + td(RGP.categoryLabel(s.category)),
      icon: iconMap[s.category] || "doc",
      route: svcRoute(user, s), ar: s.name.ar, en: s.name.en,
      render: function () {
        return [h("span.pal-ic", null, UI.icon(iconMap[s.category] || "doc", 18)),
          h("span.grow.ellipsis", null, td(s.name)),
          h("span.t-footnote.mut", null, RGP.fmtWorkdays(s.slaDays))];
      }
    };
  }

  /* ---------------- surface ---------------- */
  var state = null; /* { overlay, input, list, live, rows, sel } */

  Palette.isOpen = function () { return !!state; };

  Palette.open = function () {
    if (state) return;
    var UI = RGP.ui;
    var root = RGP.$("#overlay-root") || document.body;
    var prevFocus = document.activeElement;

    var input = h("input.pal-input", {
      type: "text", role: "combobox",
      placeholder: t("pal.placeholder"),
      "aria-label": t("pal.placeholder"),
      "aria-expanded": "true", "aria-autocomplete": "list",
      "aria-controls": "pal-listbox",
      oninput: function () { renderResults(input.value.trim()); },
      onkeydown: onInputKey
    });
    var live = h("div.sr-only", { "aria-live": "polite" });
    var list = h("div.pal-results#pal-listbox", { role: "listbox" });

    var panel = h("div.pal-panel", { role: "dialog", "aria-modal": "true", "aria-label": t("pal.placeholder") },
      h("div.pal-input-row", null,
        UI.icon("search", 18, "pal-search-ic"),
        input,
        h("span.kbd", { "aria-hidden": "true" }, RGP.isMac ? "⌘K" : "Ctrl K"),
        h("button.btn.tertiary.sm.pal-cancel", { onclick: function () { Palette.close(); } }, t("common.cancel"))),
      list, live);

    var overlay = h("div.pal-overlay", {
      onclick: function (e) { if (e.target === overlay) Palette.close(); }
    }, panel);

    root.appendChild(overlay);
    document.body.classList.add("pal-open");
    state = { overlay: overlay, input: input, list: list, live: live, rows: [], sel: -1, prevFocus: prevFocus };
    renderResults("");
    input.focus();
  };

  Palette.close = function () {
    if (!state) return;
    state.overlay.remove();
    document.body.classList.remove("pal-open");
    var pf = state.prevFocus;
    state = null;
    if (pf && pf.focus && document.contains(pf)) { try { pf.focus(); } catch (e) { /* noop */ } }
  };

  Palette.toggle = function () { if (state) Palette.close(); else Palette.open(); };

  function renderResults(q) {
    if (!state) return;
    var UI = RGP.ui;
    var sections = buildSections(q);
    var list = state.list;
    list.innerHTML = "";
    state.rows = [];
    state.sel = -1;

    var total = 0;
    sections.forEach(function (sec) { total += sec.rows.length; });

    if (!total) {
      list.appendChild(UI.empty("search",
        t("pal.noResults") + (q ? " ‹" + q + "›" : ""),
        t("pal.noResultsSub"), null, true));
      state.live.textContent = t("pal.noResults");
      state.input.removeAttribute("aria-activedescendant");
      return;
    }

    var idx = 0;
    sections.forEach(function (sec) {
      if (!sec.rows.length) return;
      list.appendChild(h("div.t-caption.mut.pal-sec-h", null, sec.title));
      sec.rows.forEach(function (item) {
        (function (i) {
          var row = h("button.pal-row#pal-opt-" + i, {
            role: "option", "aria-selected": "false", tabindex: "-1", type: "button",
            onclick: function () { execute(item); },
            onmousemove: function () { if (state && state.sel !== i) select(i); }
          }, item.render());
          state.rows.push({ el: row, item: item });
          list.appendChild(row);
        })(idx++);
      });
    });
    select(0);
    state.live.textContent = RGP.i18n.lang === "ar"
      ? RGP.fmtNum(total, { dec: 0 }) + " من النتائج"
      : RGP.fmtNum(total, { dec: 0 }) + " results";
  }

  /* virtual selection — focus stays in the input */
  function select(i) {
    if (!state || !state.rows.length) return;
    var n = state.rows.length;
    i = ((i % n) + n) % n;                       /* wrap */
    if (state.sel >= 0 && state.rows[state.sel]) state.rows[state.sel].el.setAttribute("aria-selected", "false");
    state.sel = i;
    var row = state.rows[i].el;
    row.setAttribute("aria-selected", "true");
    state.input.setAttribute("aria-activedescendant", row.id);
    if (row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
  }

  function execute(item) {
    if (!item) return;
    if (item.action) { item.action(); return; }
    if (item.route) {
      recordRecent(item);
      Palette.close();
      RGP.router.go(item.route);
    }
  }

  function onInputKey(e) {
    if (!state) return;
    if (e.key === "ArrowDown") { e.preventDefault(); select(state.sel + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); select(state.sel - 1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (state.sel >= 0 && state.rows[state.sel]) execute(state.rows[state.sel].item);
    } else if (e.key === "Escape") { e.preventDefault(); Palette.close(); }
  }

  /* ---------------- global keybindings (attached once on load) ---------------- */
  function typingContext() {
    var a = document.activeElement;
    if (!a) return false;
    var tag = a.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || a.isContentEditable;
  }
  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && !e.altKey && k === "k") {
      e.preventDefault();
      Palette.toggle();
      return;
    }
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !Palette.isOpen() && !typingContext()) {
      e.preventDefault();
      Palette.open();
    }
  });
})();
