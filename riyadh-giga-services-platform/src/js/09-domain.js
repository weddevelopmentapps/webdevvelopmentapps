/* ============================================================
   Domain labels + app shell (rail, topbar, notifications).
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;

  /* ---------------- label helpers ---------------- */
  var PHASE_LABELS = {
    planning: { ar: "التخطيط", en: "Planning" },
    design: { ar: "التصميم", en: "Design" },
    infrastructure: { ar: "البنية التحتية", en: "Infrastructure" },
    construction: { ar: "الإنشاء", en: "Construction" },
    handover: { ar: "التسليم", en: "Handover" },
    operation: { ar: "التشغيل", en: "Operation" }
  };
  var STATUS_LABELS = {
    registered: { ar: "مسجل", en: "Registered" },
    active: { ar: "نشط", en: "Active" },
    on_hold: { ar: "متوقف مؤقتًا", en: "On hold" },
    enabled: { ar: "ممكّن", en: "Enabled" },
    archived: { ar: "مؤرشف", en: "Archived" }
  };
  var SECTOR_LABELS = {
    cultural: { ar: "ثقافي وتراثي", en: "Culture & heritage" },
    entertainment: { ar: "ترفيهي", en: "Entertainment" },
    residential: { ar: "سكني", en: "Residential" },
    sports: { ar: "رياضي", en: "Sports" },
    transport: { ar: "نقل ومطارات", en: "Transport & aviation" },
    "mixed-use": { ar: "متعدد الاستخدامات", en: "Mixed-use" },
    mixed: { ar: "متعدد الاستخدامات", en: "Mixed-use" },
    environment: { ar: "بيئي", en: "Environment" },
    education: { ar: "تعليمي", en: "Education" },
    commercial: { ar: "تجاري", en: "Commercial" },
    infrastructure: { ar: "بنية تحتية", en: "Infrastructure" }
  };
  var CATEGORY_LABELS = {
    planning: { ar: "التخطيط", en: "Planning" },
    building: { ar: "البناء", en: "Building" },
    infrastructure: { ar: "البنية التحتية", en: "Infrastructure" },
    operation: { ar: "التشغيل", en: "Operation" },
    environment: { ar: "البيئة", en: "Environment" },
    enablement: { ar: "التنسيق والتمكين", en: "Enablement" },
    investment: { ar: "الاستثمار", en: "Investment" }
  };
  RGP.projectPhaseLabel = function (k) { return PHASE_LABELS[k] || { ar: k, en: k }; };
  RGP.projectStatusLabel = function (k) { return STATUS_LABELS[k] || { ar: k, en: k }; };
  RGP.sectorLabel = function (k) { return SECTOR_LABELS[k] || { ar: k, en: k }; };
  RGP.categoryLabel = function (k) { return CATEGORY_LABELS[k] || { ar: k, en: k }; };
  function tObj(key) { /* returns {ar,en} from dictionary irrespective of lang */
    var save = RGP.i18n.lang, out = {};
    RGP.i18n.lang = "ar"; out.ar = t(key);
    RGP.i18n.lang = "en"; out.en = t(key);
    RGP.i18n.lang = save;
    return out;
  }
  RGP.personaLabel = function (k) { return tObj("persona." + k); };
  RGP.entityName = function (id) {
    var e = RGP.store.entity(id);
    return e ? e.name : { ar: id, en: id };
  };
  RGP.challengeCatLabel = function (id) {
    var c = (RGP.store.state.challengeCategories || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.name : { ar: id, en: id };
  };

  /* macro pipeline for the request tracking stepper (12 states → 5 phases) */
  RGP.macroPhase = function (state) {
    if (state === "draft") return 0;
    if (["submitted", "screening"].indexOf(state) >= 0) return 1;
    if (["in_review", "returned", "resubmitted", "external_review"].indexOf(state) >= 0) return 2;
    if (state === "decision_due") return 3;
    return 4;
  };

  /* ---------------- app shell ---------------- */
  var NAVS = {
    project_rep: [
      { route: "#/portal", icon: "home", label: { ar: "الرئيسية", en: "Home" } },
      { route: "#/portal/journeys", icon: "map", label: { ar: "مستكشف الرحلة", en: "Journeys" } },
      { route: "#/wizard", icon: "plus", label: { ar: "طلب جديد", en: "New request" } },
      { route: "#/portal/requests", icon: "docs", label: { ar: "طلباتي", en: "My requests" }, badge: function (u) {
          return RGP.store.state.requests.filter(function (r) { return r.createdById === u.id && ["returned", "draft"].indexOf(r.state) >= 0; }).length;
        } },
      { route: "#/portal/challenges", icon: "flag", label: { ar: "التحديات", en: "Challenges" } },
      { route: "#/portal/inbox", icon: "bell", label: { ar: "الإشعارات", en: "Notifications" }, badge: function (u) { return RGP.store.unreadCount(u.id); } },
      { route: "#/portal/profile", icon: "user", label: { ar: "الملف الشخصي", en: "Profile" } }
    ],
    amanah_specialist: [
      { route: "#/work/queue", icon: "inbox", label: { ar: "قائمة الطلبات", en: "Queue" }, badge: function (u) {
          return RGP.store.state.requests.filter(function (r) {
            return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0 && r.state !== "returned" && (r.assigneeId === u.id || !r.assigneeId);
          }).length;
        } },
      { route: "#/challenges", icon: "flag", label: { ar: "التحديات", en: "Challenges" } },
      { route: "#/portal/inbox", icon: "bell", label: { ar: "الإشعارات", en: "Notifications" }, badge: function (u) { return RGP.store.unreadCount(u.id); } },
      { route: "#/portal/profile", icon: "user", label: { ar: "الملف الشخصي", en: "Profile" } }
    ],
    platform_manager: [
      { route: "#/manager/dashboard", icon: "grid", label: { ar: "لوحة القيادة", en: "Dashboard" } },
      { route: "#/manager/projects", icon: "building", label: { ar: "سجل المشاريع", en: "Projects registry" } },
      { route: "#/work/queue", icon: "inbox", label: { ar: "الطلبات", en: "Requests" } },
      { route: "#/manager/challenges", icon: "flag", label: { ar: "التحديات", en: "Challenges" }, badge: function () {
          return RGP.store.state.challenges.filter(function (c) { return ["open", "escalated"].indexOf(c.state) >= 0; }).length;
        } },
      { route: "#/manager/kpis", icon: "chart", label: { ar: "مؤشرات الأداء", en: "KPIs" } },
      { route: "#/manager/reports", icon: "doc", label: { ar: "التقارير", en: "Reports" } },
      { section: { ar: "الإدارة", en: "Administration" } },
      { route: "#/manager/services", icon: "layers", label: { ar: "دليل الخدمات", en: "Catalog" } },
      { route: "#/manager/audit", icon: "shield", label: { ar: "سجل التدقيق", en: "Audit log" } },
      { route: "#/manager/settings", icon: "settings", label: { ar: "الإعدادات", en: "Settings" } }
    ],
    external_entity: [
      { route: "#/external", icon: "inbox", label: { ar: "الإحالات الواردة", en: "Referrals" } },
      { route: "#/portal/inbox", icon: "bell", label: { ar: "الإشعارات", en: "Notifications" }, badge: function (u) { return RGP.store.unreadCount(u.id); } },
      { route: "#/portal/profile", icon: "user", label: { ar: "الملف الشخصي", en: "Profile" } }
    ],
    viewer: [
      { route: "#/executive", icon: "eye", label: { ar: "الملخص التنفيذي", en: "Executive" } },
      { route: "#/portal/profile", icon: "user", label: { ar: "الملف الشخصي", en: "Profile" } }
    ]
  };

  RGP.shell = function (contentEl, opts) {
    opts = opts || {};
    var user = RGP.auth.current();
    var route = location.hash || "#/";

    var nav = (NAVS[user.role] || []).map(function (item) {
      if (item.section) return h("div.rail-section", null, td(item.section));
      var active = route === item.route || (item.route !== "#/portal" && route.indexOf(item.route) === 0);
      if (item.route === "#/portal" && route.split("?")[0] === "#/portal") active = true;
      var badge = item.badge ? item.badge(user) : 0;
      return h("a.nav-item" + (active ? ".active" : ""), { href: item.route },
        UI.icon(item.icon, 20),
        h("span", null, td(item.label)),
        badge ? h("span.nav-badge.num", null, String(badge)) : null);
    });

    var rail = h("aside.rail", null,
      h("div.rail-head", null,
        h("img.rail-logo", { src: window.ASSETS.logo, alt: t("brand.owner") }),
        h("div.rail-title", null, t("brand.short"), h("small", null, t("brand.owner")))),
      h("nav.rail-nav", null, nav),
      h("div.rail-foot", null,
        h("div.rail-user", null,
          UI.avatar(user),
          h("div.grow", null,
            h("div.t-footnote", { style: { fontWeight: 600 } }, td(user.name)),
            h("div.t-caption.mut", null, t("role." + user.role))))));

    var unread = RGP.store.unreadCount(user.id);

    var topbar = h("header.topbar", null,
      h("span.topbar-context", null, opts.context ? td(opts.context) : t("brand.name")),
      h("div.topbar-search", null,
        UI.icon("search", 18),
        h("input", {
          type: "search",
          placeholder: RGP.i18n.lang === "ar" ? "ابحث عن طلب أو مشروع أو خدمة…" : "Search requests, projects, services…",
          "aria-label": t("common.search"),
          onkeydown: function (e) {
            if (e.key === "Enter" && e.target.value.trim()) {
              RGP.globalSearch(e.target.value.trim());
            }
          }
        })),
      h("button.iconbtn", {
        "aria-label": t("ntf.title"),
        onclick: function (e) { RGP.notifPopover(e.currentTarget); }
      }, UI.icon("bell", 20), unread ? h("span.dotbadge.num", null, String(Math.min(unread, 99))) : null),
      h("button.iconbtn", { "aria-label": "language", title: t("common.language"), onclick: function () { RGP.i18n.toggle(); } }, UI.icon("lang", 20)),
      h("button.iconbtn", {
        "aria-label": "theme",
        onclick: function () { RGP.toggleTheme(); }
      }, UI.icon(document.documentElement.getAttribute("data-theme") === "dark" ? "sun" : "moon", 19)),
      h("button.iconbtn", {
        "aria-label": "profile",
        onclick: function (e) {
          UI.menu(e.currentTarget, [
            { icon: "user", label: { ar: "الملف الشخصي", en: "Profile" }, onclick: function () { RGP.router.go("#/portal/profile"); } },
            "-",
            { icon: "logout", label: { ar: "تسجيل الخروج", en: "Sign out" }, danger: true, onclick: function () { RGP.auth.signOut(); RGP.router.go("#/"); } }
          ]);
        }
      }, UI.avatar(user)));

    /* bottom tabs: first four destinations + «المزيد» sheet covering the rest,
       so every desktop rail destination stays reachable on the phone.
       Exactly one tab is active — the longest route prefix wins. */
    var navItems = (NAVS[user.role] || []).filter(function (i) { return i.route; });
    var routePath = route.split("?")[0];
    var best = "";
    navItems.forEach(function (i) {
      if ((routePath === i.route || routePath.indexOf(i.route + "/") === 0 || route.indexOf(i.route + "?") === 0) &&
          i.route.length > best.length) best = i.route;
    });
    if (!best) navItems.forEach(function (i) {
      if (routePath.indexOf(i.route) === 0 && i.route.length > best.length) best = i.route;
    });
    var tabItems = navItems.slice(0, navItems.length > 5 ? 4 : 5);
    var moreItems = navItems.slice(tabItems.length);
    function moreSheet() {
      UI.modal({
        title: { ar: "جميع الأقسام", en: "All sections" }, size: "sm",
        body: h("div.flex-col.g1", null, moreItems.map(function (item) {
          var badge = item.badge ? item.badge(user) : 0;
          return h("button.sheet-item", {
            onclick: function () {
              var or = RGP.$("#overlay-root"); if (or) or.innerHTML = "";
              RGP.router.go(item.route);
            }
          }, UI.icon(item.icon, 20), h("span.grow.t-footnote", { style: { fontWeight: 600 } }, td(item.label)),
            badge ? h("span.nav-badge.num", null, String(badge)) : null);
        }))
      });
    }
    var bottomtabs = h("nav.bottomtabs", null,
      tabItems.map(function (item) {
        var active = item.route === best;
        return h("button" + (active ? ".active" : ""), { onclick: function () { RGP.router.go(item.route); } },
          UI.icon(item.icon, 22), td(item.label));
      }),
      moreItems.length ? h("button" + (moreItems.some(function (i) { return i.route === best; }) ? ".active" : ""),
        { onclick: moreSheet },
        UI.icon("grid", 22), RGP.i18n.lang === "ar" ? "المزيد" : "More") : null);

    /* chrome-minimal boardroom layout (ux-spec §7.12): no rail, identity strip only */
    if (opts.chromeMinimal) {
      var minibar = h("header.topbar", null,
        h("img", { src: window.ASSETS.logo, style: { width: "36px", height: "36px", borderRadius: "50%" }, alt: t("brand.owner") }),
        h("div", null,
          h("div", { style: { fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "13.5px" } }, t("brand.owner")),
          h("div.t-caption.mut", { style: { fontWeight: 500 } }, opts.context ? td(opts.context) : t("brand.name"))),
        h("span.grow"),
        h("button.iconbtn", { "aria-label": "language", onclick: function () { RGP.i18n.toggle(); } }, UI.icon("lang", 20)),
        h("button.iconbtn", { "aria-label": "theme", onclick: function () { RGP.toggleTheme(); } },
          UI.icon(document.documentElement.getAttribute("data-theme") === "dark" ? "sun" : "moon", 19)),
        h("button.iconbtn", {
          "aria-label": "profile",
          onclick: function (e) {
            UI.menu(e.currentTarget, [
              { icon: "user", label: { ar: "الملف الشخصي", en: "Profile" }, onclick: function () { RGP.router.go("#/portal/profile"); } },
              "-",
              { icon: "logout", label: { ar: "تسجيل الخروج", en: "Sign out" }, danger: true, onclick: function () { RGP.auth.signOut(); RGP.router.go("#/"); } }
            ]);
          }
        }, UI.avatar(user)));
      return h("div", null, minibar,
        h("main.content.page-in", null, contentEl));
    }

    return h("div.shell", null, rail,
      h("div.main", null, topbar,
        h("main.content" + (opts.narrow ? ".narrow" : "") + ".page-in", null, contentEl),
        bottomtabs));
  };

  /* ---------------- theme ---------------- */
  RGP.applyTheme = function () {
    var saved = null;
    try { saved = localStorage.getItem("rgp.theme"); } catch (e) { /* noop */ }
    var theme = saved || "light";
    if (theme === "auto") theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  };
  RGP.toggleTheme = function () {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("rgp.theme", cur); } catch (e) { /* noop */ }
    document.documentElement.setAttribute("data-theme", cur);
    RGP.charts.disposeAll();
    RGP.router.render();
  };

  /* ---------------- notifications popover ---------------- */
  /* full inbox — the popover's «عرض جميع الإشعارات» footer */
  function showAllNotifications(user) {
    var rows = RGP.store.state.notifications.filter(function (n) { return n.userId === user.id; });
    UI.modal({
      title: { ar: "جميع الإشعارات", en: "All notifications" },
      body: rows.length ? h("div.ntf-list", { style: { maxHeight: "60vh", overflowY: "auto" } }, rows.map(function (n) {
        var iconName = n.kind === "success" ? "checkCircle" : n.kind === "danger" ? "alert" : n.kind === "warning" ? "alert" : "infoC";
        return h("div.ntf-row" + (n.read ? "" : ".unread"), {
          onclick: function () {
            n.read = true; RGP.store.save();
            var or = RGP.$("#overlay-root"); if (or) or.innerHTML = "";
            if (n.link) RGP.router.go(n.link); else RGP.router.render();
          }
        },
          h("span.ntf-icon." + (n.kind || "info"), null, UI.icon(iconName, 16)),
          h("div.grow", null,
            h("div.t-footnote", { style: { fontWeight: 600 } }, td(n.title)),
            n.body ? h("div.t-caption.mut.clamp2", { style: { fontWeight: 500 } }, td(n.body)) : null,
            h("div.t-caption.mut.mbs-05", { style: { fontWeight: 500 } }, RGP.fmtAgo(n.at))));
      })) : UI.empty("bell", { ar: "لا توجد إشعارات", en: "No notifications" }, null, null, true)
    });
  }

  RGP.notifPopover = function (anchor) {
    var user = RGP.auth.current();
    var existing = RGP.$(".menu"); if (existing) existing.remove();
    var filter = "all";
    var all = RGP.store.state.notifications.filter(function (n) { return n.userId === user.id; }).slice(0, 30);
    function isReq(n) { return (n.link || "").indexOf("request") >= 0 || (n.link || "").indexOf("review") >= 0; }
    function isCh(n) { return (n.link || "").indexOf("challenge") >= 0; }
    function applyFilter() {
      if (filter === "req") return all.filter(isReq);
      if (filter === "ch") return all.filter(isCh);
      if (filter === "sys") return all.filter(function (n) { return !isReq(n) && !isCh(n); });
      return all;
    }
    var list = applyFilter();

    var m = h("div.menu.ntf-pop", null,
      h("div.flex.between.g2", { style: { padding: "10px 14px" } },
        h("span.t-headline", null, t("ntf.title")),
        h("button.btn.tertiary.sm", {
          onclick: function () {
            RGP.store.state.notifications.forEach(function (n) { if (n.userId === user.id) n.read = true; });
            RGP.store.save(); m.remove(); RGP.router.render();
          }
        }, t("ntf.markAll"))),
      h("div", { style: { padding: "0 14px 10px" } },
        h("div.segmented", { style: { height: "34px" } },
          [["all", t("common.all")], ["req", { ar: "الطلبات", en: "Requests" }], ["ch", { ar: "التحديات", en: "Challenges" }], ["sys", { ar: "النظام", en: "System" }]].map(function (x) {
            return h("button" + (filter === x[0] ? ".active" : ""), {
              onclick: function (e) {
                e.stopPropagation();
                filter = x[0];
                m.remove();
                RGP.notifPopover(anchor);
              },
              style: { fontSize: "11px", paddingInline: "10px" }
            }, td(x[1]));
          }))),
      h("div.hairline-b"),
      list.length ? h("div.ntf-list", null, list.map(function (n) {
        var iconName = n.kind === "success" ? "checkCircle" : n.kind === "danger" ? "alert" : n.kind === "warning" ? "alert" : "infoC";
        return h("div.ntf-row" + (n.read ? "" : ".unread"), {
          onclick: function () {
            n.read = true; RGP.store.save(); m.remove();
            if (n.link) RGP.router.go(n.link); else RGP.router.render();
          }
        },
          h("span.ntf-icon." + (n.kind || "info"), null, UI.icon(iconName, 16)),
          h("div.grow", null,
            h("div.t-footnote", { style: { fontWeight: 600 } }, td(n.title)),
            n.body ? h("div.t-caption.mut.clamp2", { style: { fontWeight: 500 } }, td(n.body)) : null,
            h("div.t-caption.mut.mbs-05", { style: { fontWeight: 500 } }, RGP.fmtAgo(n.at))));
      })) : UI.empty("bell", { ar: "لا توجد إشعارات جديدة", en: "No new notifications" },
        null, null, true),
      h("div.hairline-t", { style: { padding: "8px 14px", textAlign: "center" } },
        h("button.btn.tertiary.sm", {
          onclick: function () { m.remove(); showAllNotifications(user); }
        }, RGP.i18n.lang === "ar" ? "عرض جميع الإشعارات" : "View all notifications")));

    document.body.appendChild(m);
    var r = anchor.getBoundingClientRect();
    m.style.top = (r.bottom + 8 + window.scrollY) + "px";
    var pw = m.offsetWidth || 400;
    var left = RGP.clamp(RGP.i18n.lang === "ar" ? r.left - 40 : r.right - pw,
      8, Math.max(8, window.innerWidth - pw - 8));
    m.style.left = left + "px";
    setTimeout(function () {
      document.addEventListener("click", function onDoc(e) {
        if (!m.contains(e.target) && e.target !== anchor) { m.remove(); document.removeEventListener("click", onDoc); }
      });
    }, 0);
  };

  /* ---------------- global search ---------------- */
  RGP.globalSearch = function (q) {
    var user = RGP.auth.current();
    var ql = q.toLowerCase();
    var reqs = RGP.store.state.requests.filter(function (r) {
      if (user.role === "project_rep" && r.createdById !== user.id && (!user.delegatedBy || r.createdById !== user.delegatedBy)) return false;
      var svc = RGP.store.service(r.serviceId);
      return r.id.toLowerCase().indexOf(ql) >= 0 ||
        (svc && (svc.name.ar + svc.name.en).toLowerCase().indexOf(ql) >= 0);
    }).slice(0, 8);
    var projects = RGP.store.state.projects.filter(function (p) {
      return (p.name.ar + " " + p.name.en).toLowerCase().indexOf(ql) >= 0;
    }).slice(0, 5);

    UI.modal({
      title: { ar: "نتائج البحث: " + q, en: "Search results: " + q },
      body: h("div", null,
        reqs.length ? h("div", null,
          h("div.t-footnote.mut.mbe-1", null, RGP.i18n.lang === "ar" ? "الطلبات" : "Requests"),
          reqs.map(function (r) {
            var svc = RGP.store.service(r.serviceId);
            return h("button.pick-card.mbe-1", {
              onclick: function () {
                RGP.$(".overlay") && RGP.$(".overlay").remove();
                RGP.router.go(user.role === "amanah_specialist" || user.role === "platform_manager"
                  ? "#/work/review/" + r.id : "#/portal/requests/" + r.id);
              }
            },
              h("div.grow", null,
                h("div.flex.g1", null, h("span.id-cell.num", null, r.id), UI.statePill(r.state, true)),
                h("div.t-sub.mut", null, svc ? td(svc.name) : "")));
          })) : null,
        projects.length ? h("div.mbs-2", null,
          h("div.t-footnote.mut.mbe-1", null, RGP.i18n.lang === "ar" ? "المشاريع" : "Projects"),
          projects.map(function (p) {
            return h("div.pick-card.mbe-1", null,
              h("div.grow", null, h("div.t-headline", null, td(p.name)),
                h("div.t-sub.mut", null, td(p.owner))));
          })) : null,
        (!reqs.length && !projects.length) ? UI.empty("search", { ar: "لا نتائج مطابقة", en: "No matches" }, null, null, true) : null)
    });
  };
})();
