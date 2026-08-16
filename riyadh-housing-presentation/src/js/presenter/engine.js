/* engine.js — آلة حالات المشاهد
   ──────────────────────────────
   سجلّان منفصلان بأمر التكليف: linearOrder لتسلسل جهاز التقديم، وbranchRoutes
   للملاحق التي لا يبلغها «التالي/السابق» أبداً. المشهد يُبنى في مضيف احتياطي
   ثم يُبدَّل بانتقال متجه الحركة، مع قفل ملاحة يمنع القفز المزدوج. */
"use strict";

RH.presenter.engine = (function () {
  const { h } = RH.core.dom;

  const LINEAR = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"];
  const scenes = new Map();     // id → تعريف المشهد
  const appendices = new Map(); // id → تعريف الملحق

  let hostA = null, hostB = null, activeHost = null;
  let current = null;           // {kind, id, params}
  let locked = false;
  let unlockTimer = null;
  const teardowns = new Map();  // host → [دوال تنظيف يسجلها المشهد عبر ctx.onTeardown]

  function registerScene(def) { scenes.set(def.id, def); }
  function registerAppendix(def) { appendices.set(def.id, def); }

  // ── قياس المسرح: 16:9 دائماً مع letterbox متحكم ──
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.min(vw, vh * 16 / 9);
    const hgt = w * 9 / 16;
    const su = w / 1920;
    const root = document.documentElement;
    root.style.setProperty("--host-w", w.toFixed(2) + "px");
    root.style.setProperty("--host-h", hgt.toFixed(2) + "px");
    root.style.setProperty("--su", su.toFixed(5) + "px");
    return su;
  }
  const su = () => parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--su")) || 1;

  function init() {
    hostA = document.getElementById("scene-host");
    hostB = document.getElementById("scene-next");
    activeHost = hostA;
    layout();
    window.addEventListener("resize", () => { layout(); RH.viz.theme.resizeAll(); });
    document.addEventListener("fullscreenchange", () => {
      layout();
      setTimeout(() => RH.viz.theme.resizeAll(), 80);
    });
  }

  const idx = (id) => LINEAR.indexOf(id);

  function stepsOf(id) {
    const def = scenes.get(id);
    return def && def.steps ? def.steps : 1;
  }

  /** بناء مشهد/ملحق في مضيف — ينفذ تنظيف البناء السابق أولاً */
  function build(route, host) {
    for (const fn of teardowns.get(host) || []) { try { fn(); } catch (_e) {} }
    teardowns.set(host, []);
    RH.core.dom.clear(host);
    host.className = "scene-host";
    let def;
    if (route.kind === "appendix") {
      const baseId = route.id.split("/")[0];
      def = appendices.get(baseId);
    } else {
      def = scenes.get(route.id);
    }
    if (!def) {
      host.appendChild(h("div", { class: "sc" },
        h("div", { class: "sc-headline" }, "المشهد غير موجود")));
      return;
    }
    const ctx = {
      su: su(),
      params: route.params || {},
      route,
      update: (params) => updateParams(params),
      onTeardown: (fn) => teardowns.get(host).push(fn),
    };
    def.build(host, ctx);
  }

  /** إعادة كتابة معاملات المشهد الحالي في العنوان دون إدخال تاريخ جديد */
  function updateParams(params) {
    if (!current) return;
    current.params = Object.assign({}, current.params, params);
    for (const k of Object.keys(current.params)) {
      if (current.params[k] == null || current.params[k] === "" || current.params[k] === "0") {
        delete current.params[k];
      }
    }
    RH.core.router.go({ kind: current.kind, id: current.id, params: current.params },
      { replace: true, inPlace: true });
  }

  /** عرض مسار (يُستدعى من الموجّه). direction: fwd|back|major|none
      تحديث معاملات المسار نفسه يُبنى في مكانه دون تبديل مضيف ولا مؤقتات —
      يمنع سباقات المؤقتات وتراكم المستمعين عند تقليب الطبقات/الصفحات. */
  function show(route, opts) {
    const sameRoute = current && current.kind === route.kind && current.id === route.id;
    if ((opts && opts.inPlace) || sameRoute) {
      current = { kind: route.kind, id: route.id, params: route.params || {} };
      build(route, activeHost);
      RH.presenter.chrome.sync(current);
      setTimeout(() => RH.viz.theme.resizeAll(), 40);
      return;
    }
    const direction = (opts && opts.direction) || inferDirection(route);
    const nextHost = activeHost === hostA ? hostB : hostA;
    nextHost.hidden = false;
    nextHost.setAttribute("aria-hidden", "false");
    build(route, nextHost);

    const old = activeHost;
    activeHost = nextHost;
    const prevRoute = current;
    current = { kind: route.kind, id: route.id, params: route.params || {} };

    document.body.classList.toggle("on-cover",
      route.kind === "scene" && route.id === "00");
    document.body.classList.toggle("in-appendix", route.kind === "appendix");

    const dur = direction === "major" ? 750 : 400;
    lock(dur + 60);
    if (RH.viz.motion.REDUCED || direction === "none" || !prevRoute) {
      old.hidden = true;
      finishSwap(old);
    } else {
      document.body.classList.add("transitioning");
      old.classList.add(direction === "back" ? "leaving-back" : "leaving-fwd");
      activeHost.classList.add(
        direction === "major" ? "entering-major"
          : direction === "back" ? "entering-back" : "entering-fwd");
      setTimeout(() => {
        document.body.classList.remove("transitioning");
        finishSwap(old);
      }, dur + 30);
    }
    RH.presenter.chrome.sync(current);
    setTimeout(() => RH.viz.theme.resizeAll(), 60);
  }

  function finishSwap(old) {
    old.hidden = true;
    old.className = "scene-host";
    old.setAttribute("aria-hidden", "true");
    RH.core.dom.clear(old);
    activeHost.className = "scene-host";
  }

  function inferDirection(route) {
    if (!current) return "none";
    if (route.kind === "appendix" || current.kind === "appendix") return "major";
    const a = idx(current.id), b = idx(route.id);
    if (a < 0 || b < 0) return "none";
    // الانتقالات المقطعية الكبرى: دخول البوابات 02 و08 و11
    if (b > a && (route.id === "02" || route.id === "08" || route.id === "11")) return "major";
    return b > a ? "fwd" : b < a ? "back" : "none";
  }

  function lock(ms) {
    locked = true;
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => { locked = false; }, ms);
  }
  const isLocked = () => locked;

  // ── الملاحة الخطية القانونية (جهاز التقديم): البناءات ثم المشهد ──
  function next() {
    if (locked || !current) return;
    if (current.kind === "appendix") return; // الملاحق تتنقل بأدواتها المرئية فقط
    const step = parseInt(current.params.step || "0", 10);
    if (step < stepsOf(current.id) - 1) {
      RH.core.router.go({ kind: "scene", id: current.id,
        params: Object.assign({}, current.params, { step: String(step + 1) }) });
      return;
    }
    const i = idx(current.id);
    if (i >= 0 && i < LINEAR.length - 1) {
      goScene(LINEAR[i + 1]);
    }
  }

  function prev() {
    if (locked || !current) return;
    if (current.kind === "appendix") return;
    const step = parseInt(current.params.step || "0", 10);
    if (step > 0) {
      const p = Object.assign({}, current.params);
      if (step - 1 === 0) delete p.step; else p.step = String(step - 1);
      RH.core.router.go({ kind: "scene", id: current.id, params: p });
      return;
    }
    const i = idx(current.id);
    if (i > 0) {
      const prevId = LINEAR[i - 1];
      const lastStep = stepsOf(prevId) - 1;
      const params = lastStep > 0 ? { step: String(lastStep) } : {};
      RH.core.router.go({ kind: "scene", id: prevId, params });
    }
  }

  function goScene(id, params) {
    RH.core.router.go({ kind: "scene", id, params: params || {} });
  }
  const home = () => goScene("00");
  const end = () => goScene(LINEAR[LINEAR.length - 1]);
  const agenda = () => goScene("01");

  /** فتح ملحق مع حفظ حالة المستدعي الدقيقة */
  function openAppendix(id, extraParams) {
    const ret = RH.core.router.encodeReturn({
      kind: current.kind, id: current.id, params: current.params,
    });
    RH.core.router.go({ kind: "appendix", id,
      params: Object.assign({}, extraParams || {}, { return: ret }) });
  }

  /** العودة من ملحق إلى حالة المستدعي المخزنة حرفياً */
  function returnFromAppendix() {
    const ret = current && current.params.return
      ? RH.core.router.decodeReturn(current.params.return) : null;
    if (ret && ret.kind === "scene") {
      RH.core.router.go({ kind: "scene", id: ret.id, params: ret.params || {} });
    } else {
      agenda();
    }
  }

  return {
    LINEAR, registerScene, registerAppendix, init, show, layout,
    next, prev, home, end, agenda, goScene, openAppendix, returnFromAppendix,
    isLocked, current: () => current, updateParams, stepsOf, su,
  };
})();
