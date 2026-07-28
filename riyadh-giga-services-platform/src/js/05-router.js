/* ============================================================
   Hash router with role guards. it-spec §7.
   Route table entries: {pattern, roles (null = public), view(params)}.
   ============================================================ */
"use strict";

(function () {
  var Router = RGP.router = { routes: [], current: null, params: {} };

  Router.register = function (pattern, roles, view) {
    Router.routes.push({ pattern: pattern, roles: roles, view: view });
  };

  function match(hash) {
    var path = (hash || "#/").split("?")[0];
    for (var i = 0; i < Router.routes.length; i++) {
      var r = Router.routes[i];
      var pp = r.pattern.split("/"), hp = path.split("/");
      if (pp.length !== hp.length) continue;
      var params = {}, ok = true;
      for (var j = 0; j < pp.length; j++) {
        if (pp[j][0] === ":") params[pp[j].slice(1)] = decodeURIComponent(hp[j]);
        else if (pp[j] !== hp[j]) { ok = false; break; }
      }
      if (ok) return { route: r, params: params };
    }
    return null;
  }

  Router.go = function (hash) {
    if (location.hash === hash) Router.render();
    else location.hash = hash;
  };

  Router.render = function () {
    var hash = location.hash || "#/";
    var m = match(hash);
    var user = RGP.auth.current();

    if (!m) {
      Router.go(user ? RGP.auth.homeRoute(user) : "#/");
      return;
    }
    if (m.route.roles) {
      if (!user) { Router.go("#/login"); return; }
      if (m.route.roles.indexOf(user.role) < 0) {
        RGP.ui.toast("danger", { ar: "لا تملك صلاحية الوصول", en: "You don't have access to this page" });
        Router.go(RGP.auth.homeRoute(user));
        return;
      }
    }
    Router.current = m.route.pattern;
    Router.params = m.params;

    /* background sweeps before each render keep SLA/escalation live */
    try { RGP.lifecycle.sweep(); } catch (e) { /* pre-init */ }

    /* stale modals/popovers must never survive navigation (review M) */
    var overlayRoot = RGP.$("#overlay-root");
    if (overlayRoot) overlayRoot.innerHTML = "";
    RGP.$$(".menu").forEach(function (m) { m.remove(); });

    var root = RGP.$("#app");
    root.innerHTML = "";
    try {
      root.appendChild(m.route.view(m.params));
    } catch (err) {
      console.error("render failed", err);
      root.appendChild(RGP.h("div.content", null,
        RGP.h("div.card.elev-1.card-pad.mbs-6", null,
          RGP.h("div.t-title3", null, RGP.i18n.lang === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong"),
          RGP.h("div.t-sub.mut.mbs-1", null, RGP.i18n.lang === "ar"
            ? "أعد تحميل الصفحة أو ارجع إلى الرئيسية. التفاصيل مسجلة في وحدة التحكم."
            : "Reload the page or go home. Details are in the console."),
          RGP.h("div.mbs-2", null,
            RGP.h("a.btn.secondary", { href: "#/" }, RGP.i18n.lang === "ar" ? "الرئيسية" : "Home")))));
    }
    window.scrollTo(0, 0);
  };

  window.addEventListener("hashchange", function () { Router.render(); });

  /* a language change always re-renders — callers of i18n.toggle() need no extra step */
  RGP.bus.on("lang:changed", function () { Router.render(); });
})();
