/* router.js — موجّه الهاش (آمن على GitHub Pages وfile:// معاً)
   المسارات:  #/scene/<id>[?step=n&sector=x&layer=y]
              #/appendix/<id>[?page=n&return=<حالة مرمّزة>]
              #/admin[/<tab>]
   تحويلات المسارات القديمة تتم بالاستبدال (لا إدخال في التاريخ → لا حلقات). */
"use strict";

RH.core.router = (function () {
  const LEGACY = {
    "summary": "/scene/02",
    "supply": "/scene/03",
    "licenses": "/scene/05",
    "control": "/scene/07",
    "initiatives": "/scene/08",
  };

  let onChange = null;

  /** معالجة رجوع PKCE قبل أي توجيه: يزيل ?code= من العنوان (تفعيل Supabase) */
  function handleAuthCallback() {
    const url = new URL(window.location.href);
    if (url.searchParams.has("code") && window.SUPABASE_CONFIG) {
      const code = url.searchParams.get("code");
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
      RH.core.bus.emit("auth:pkce-code", code);
    }
  }

  function parse() {
    let raw = window.location.hash.replace(/^#/, "");
    if (!raw || raw === "/") raw = "/scene/00";
    // مسارات قديمة: ‎#/summary أو ‎#summary
    const legacyKey = raw.replace(/^\//, "").split("?")[0];
    if (LEGACY[legacyKey]) {
      replace(LEGACY[legacyKey]);
      raw = LEGACY[legacyKey];
    }
    const [pathPart, queryPart] = raw.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const params = {};
    if (queryPart) {
      for (const pair of queryPart.split("&")) {
        const [k, v] = pair.split("=");
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || "");
      }
    }
    if (segments[0] === "scene" && segments[1] != null) {
      return { kind: "scene", id: segments[1], params };
    }
    if (segments[0] === "appendix" && segments[1] != null) {
      return { kind: "appendix", id: segments.slice(1).join("/"), params };
    }
    if (segments[0] === "admin") {
      return { kind: "admin", id: segments[1] || "home", params };
    }
    return { kind: "scene", id: "00", params: {} };
  }

  function serialize(route) {
    let h = "/" + route.kind + "/" + route.id;
    if (route.kind === "admin" && route.id === "home") h = "/admin";
    const q = Object.entries(route.params || {})
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
      .join("&");
    return q ? h + "?" + q : h;
  }

  function go(route, opts) {
    const target = "#" + serialize(route);
    if (window.location.hash === target) { if (onChange) onChange(parse(), opts || {}); return; }
    if (opts && opts.replace) {
      // replaceState لا يطلق hashchange أبداً — نستدعي المعالج مباشرة
      history.replaceState(null, "", target);
      if (onChange) onChange(parse(), opts);
    } else {
      // تغيير الهاش يطلق hashchange الذي يستدعي onChange
      if (opts) pendingOpts = opts;
      window.location.hash = target;
    }
  }

  function replace(path) {
    // استبدال صامت للمسارات القديمة — لا hashchange ولا إدخال في التاريخ
    history.replaceState(null, "", "#" + path);
  }

  let pendingOpts = null;

  /** ترميز حالة العودة للملاحق: base64url لسلسلة JSON مضغوطة المفاتيح */
  function encodeReturn(state) {
    const json = JSON.stringify(state);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decodeReturn(str) {
    try {
      const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(decodeURIComponent(escape(atob(b64))));
    } catch (_e) { return null; }
  }

  function start(handler) {
    onChange = handler;
    handleAuthCallback();
    window.addEventListener("hashchange", () => {
      const opts = pendingOpts || {};
      pendingOpts = null;
      onChange(parse(), opts);
    });
    onChange(parse(), { initial: true });
  }

  return { parse, serialize, go, replace, start, encodeReturn, decodeReturn };
})();
