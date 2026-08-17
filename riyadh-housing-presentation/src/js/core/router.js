/* router.js — موجّه الهاش (آمن على GitHub Pages وfile:// معاً)
   المسارات:  #/tab/<id>[?…]              — تبويبات V3 الخمسة (الافتراضي demand)
              #/section/<id>[?step=n&…]   — أقسام V2 (وضع العرض بالكليكر)
              #/scene/00                   — الغلاف (المعرفات الرقمية القديمة تُحوَّل)
              #/appendix/<id>[?page=n&return=<حالة مرمّزة>]
              #/report[?pages=a,b,c]        — الموجز التنفيذي (يتجاوز المسرح)
              #/admin[/<tab>]
   تحويلات المسارات القديمة تتم بالاستبدال (لا إدخال في التاريخ → لا حلقات). */
"use strict";

RH.core.router = (function () {
  /* مشاهد V1 الرقمية → أقسام V2 (خريطة الإحالة المعتمدة في V2_CONTRACTS §7) */
  const LEGACY_SCENES = {
    "01": "summary", "02": "summary",
    "03": "demand", "04": "demand",
    "05": "licensing", "06": "licensing",
    "07": "control",
    "08": "initiatives", "09": "initiatives",
    "10": "kpis",
    "11": "closing",
  };
  const LEGACY = {
    "summary": "/section/summary",
    "supply": "/section/demand",
    "licenses": "/section/licensing",
    "control": "/section/control",
    "initiatives": "/section/initiatives",
  };
  for (const [old, sec] of Object.entries(LEGACY_SCENES)) {
    LEGACY["scene/" + old] = "/section/" + sec;
  }

  /** الجذر الافتراضي في V3: التبويب الأول لا غلاف المسرح (V3_SPEC §4) */
  const DEFAULT_PATH = "/tab/demand";

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
    if (!raw || raw === "/") raw = DEFAULT_PATH;
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
    // تبويبات V3: البنية الأساسية للمنصة
    if (segments[0] === "tab" && segments[1] != null) {
      return { kind: "tab", id: segments[1], params };
    }
    if (segments[0] === "scene" && segments[1] != null) {
      return { kind: "scene", id: segments[1], params };
    }
    // أقسام V2: نوعها الداخلي "scene" ذاته — العنوان وحده يميزها (§7)
    if (segments[0] === "section" && segments[1] != null) {
      return { kind: "scene", id: segments[1], params };
    }
    if (segments[0] === "appendix" && segments[1] != null) {
      return { kind: "appendix", id: segments.slice(1).join("/"), params };
    }
    // الموجز التنفيذي (عقد التوسعة §2): مسار بلا معرف — المعرف الثابت "main"
    // يبقى في الكائن كي تظل مقارنات المحرك/التطبيق موحدة الشكل (kind+id).
    // ‎?pages=a,b,c يحصر صفحات الأقسام؛ غيابه = المستند كاملاً.
    if (segments[0] === "report") {
      return { kind: "report", id: "main", params };
    }
    if (segments[0] === "admin") {
      return { kind: "admin", id: segments[1] || "home", params };
    }
    return { kind: "tab", id: "demand", params: {} };
  }

  function serialize(route) {
    let h = "/" + route.kind + "/" + route.id;
    if (route.kind === "tab") h = "/tab/" + route.id;
    // معرفات المشاهد الرقمية (الغلاف 00) تبقى /scene/، وأقسام V2 الاسمية /section/
    if (route.kind === "scene" && !/^\d+$/.test(route.id)) h = "/section/" + route.id;
    if (route.kind === "admin" && route.id === "home") h = "/admin";
    // الموجز مسار مفرد لا معرف له في العنوان — ‎#/report وحده (مع معاملاته)
    if (route.kind === "report") h = "/report";
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
