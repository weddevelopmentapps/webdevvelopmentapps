/* ============================================================
   Auth — demo session management with role-based access.
   Demo identities are seeded and clearly labeled. A production
   deployment replaces this module with النفاذ الوطني الموحد
   (Nafath SSO) behind the same interface. Route-level guards
   live in the router's route table.
   ============================================================ */
"use strict";

(function () {
  var SESSION_KEY = "rgp.session.v1";

  var Auth = RGP.auth = {
    _current: null,

    init: function () {
      try {
        var raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        if (raw) {
          var sess = JSON.parse(raw);
          var user = RGP.store.user(sess.userId);
          if (user) Auth._current = user;
        }
      } catch (e) { /* fresh session */ }
    },

    current: function () { return Auth._current; },

    /* password-less demo sign-in by identity card, or email+password form */
    signIn: function (userId, password) {
      var user = RGP.store.user(userId);
      if (!user) {
        user = RGP.store.state.users.filter(function (u) { return u.email === userId; })[0] || null;
      }
      if (!user || user.active === false) throw new Error("auth:unknown");
      if (password != null && password !== "" && password !== user.password) throw new Error("auth:badpass");
      Auth._current = user;
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, at: Date.now() })); } catch (e) { /* noop */ }
      RGP.store.audit("auth.login", "auth", user.id);
      RGP.bus.emit("auth:changed", user);
      return user;
    },

    signOut: function () {
      if (Auth._current) RGP.store.audit("auth.logout", "auth", Auth._current.id);
      Auth._current = null;
      try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); } catch (e) { /* noop */ }
      RGP.bus.emit("auth:changed", null);
    },

    isCustomer:   function () { var u = Auth._current; return !!u && u.role === "project_rep"; },
    isSpecialist: function () { var u = Auth._current; return !!u && u.role === "amanah_specialist"; },
    isManager:    function () { var u = Auth._current; return !!u && u.role === "platform_manager"; },
    isExternal:   function () { var u = Auth._current; return !!u && u.role === "external_entity"; },
    isViewer:     function () { var u = Auth._current; return !!u && u.role === "viewer"; },
    isStaff:      function () {
      var u = Auth._current;
      return !!u && (u.role === "amanah_specialist" || u.role === "platform_manager");
    },

    homeRoute: function (user) {
      var u = user || Auth._current;
      if (!u) return "#/";
      switch (u.role) {
        case "project_rep":       return "#/portal";
        case "amanah_specialist": return "#/work/queue";
        case "platform_manager":  return "#/manager/dashboard";
        case "external_entity":   return "#/external";
        case "viewer":            return "#/executive";
        default:                  return "#/";
      }
    }
  };
})();
