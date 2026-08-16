/* registry.js — سجل أقسام لوحات القيادة V2 (عقد V2_CONTRACTS §1)
   ────────────────────────────────────────────────────────────
   يستبدل تسلسل مشاهد V1: الأقسام التسعة تصبح التسلسل الخطي للمحرك بعد الغلاف
   («00» يبقى مشهداً يسجله s0-cover مباشرة). كل قسم يُغلف بمشهد محرك يبني:
   طبقة الخلفية الفوتوغرافية + جسم اللوحة + سياق ctx الموسع (release/derived/
   openDetail/openAppendix). عقد الكليكر §8 محفوظ حرفياً عبر المحرك ذاته. */
"use strict";

RH.sections = (function () {
  const { h } = RH.core.dom;

  const defs = new Map();   // id → تعريف القسم
  let booted = false;

  /** القائمة القانونية لمعرفات الأقسام (V2_CONTRACTS §1) */
  const VALID_IDS = ["summary", "demand", "licensing", "control", "map",
    "initiatives", "kpis", "forecast", "closing"];

  function register(def) {
    if (!def || !def.id || typeof def.build !== "function") {
      throw new Error("تسجيل قسم ناقص: id وbuild إلزاميان");
    }
    if (!VALID_IDS.includes(def.id)) {
      throw new Error("معرف قسم خارج القائمة القانونية: " + def.id);
    }
    if (typeof def.order !== "number") {
      throw new Error("القسم " + def.id + " بلا ترتيب order");
    }
    defs.set(def.id, def);
    if (booted) wire(def); // تسجيل متأخر (نادر): يوصل فوراً ويعاد بناء التسلسل
    if (booted) rebuildLinear();
  }

  /** طبقة تفاصيل زجاجية فوق القسم — تُغلق بالمفتاح Escape وزر الإغلاق
      ونقر الخلفية؛ التركيز يدخل الطبقة فلا تتقدم مفاتيح العرض أثناءها. */
  function openDetail(root, content, opts, teardowns) {
    const o = opts || {};
    const panel = h("div", {
      class: "detail-panel", role: "dialog", "aria-modal": "true",
      "aria-label": o.title || "تفاصيل",
    });
    const closeBtn = h("button", {
      class: "detail-close", "aria-label": "إغلاق التفاصيل",
      onclick: () => close(),
    }, "✕");
    const head = h("div", { class: "detail-head" },
      h("div", { class: "detail-title" }, o.title || ""), closeBtn);
    const body = h("div", { class: "detail-body" });
    if (content instanceof Node) {
      body.appendChild(content);
    } else if (content != null) {
      // سلسلة HTML من قوالب الكود الثابتة حصراً — نصوص الإصدار تمر عبر theme.esc
      body.innerHTML = String(content);
    }
    panel.appendChild(head);
    panel.appendChild(body);
    const overlay = h("div", { class: "detail-overlay" }, panel);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    function onKey(e) {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
    }
    document.addEventListener("keydown", onKey, true);

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKey, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    root.appendChild(overlay);
    closeBtn.focus();
    teardowns(close); // هدم القسم يغلق أي طبقة معلقة
    return close;
  }

  /** تغليف تعريف القسم كمشهد محرك: خلفية + جسم + سياق موسع */
  function wire(def) {
    RH.presenter.engine.registerScene({
      id: def.id,
      kind: "section",
      steps: (def.steps || 0) + 1, // عقد المحرك: steps = عدد الحالات الكلي
      build(host, ctx0) {
        const root = h("section", {
          class: "dash",
          dataset: { section: def.id },
          role: "region",
          "aria-label": def.title,
        });
        RH.presenter.mediaBg.attach(root, def.backdrop || def.id,
          { dim: typeof def.dim === "number" ? def.dim : 0.82 });
        const body = h("div", { class: "dash-body" });
        root.appendChild(body);
        host.appendChild(root);

        const ctx = {
          su: ctx0.su,
          release: RH.data.store.release(),
          derived: RH.data.store.der(),
          geo: window.GEO || null,
          params: ctx0.params,
          step: parseInt(ctx0.params.step || "0", 10) || 0,
          steps: (def.steps || 0) + 1,
          route: ctx0.route,
          update: ctx0.update,
          onTeardown: ctx0.onTeardown,
          openDetail: (content, opts) =>
            openDetail(root, content, opts, ctx0.onTeardown),
          openAppendix: (id, params) =>
            RH.presenter.engine.openAppendix(id, params),
          def,
        };
        def.build(body, ctx);
      },
    });
  }

  /** التسلسل الخطي: الغلاف ثم الأقسام بترتيب order — يُبلغ المحرك ومداخله */
  function rebuildLinear() {
    const ordered = Array.from(defs.values()).sort((a, b) => a.order - b.order);
    const ids = ["00"].concat(ordered.map((d) => d.id));
    RH.presenter.engine.setLinear(ids);
    RH.presenter.engine.setMajors(ordered.filter((d) => d.major).map((d) => d.id));
  }

  /** الإقلاع (يستدعيه app.js بعد engine.init وقبل chrome.init):
      يوصل الأقسام المسجلة ويبني التسلسل الخطي النهائي. */
  function boot() {
    if (booted) return;
    booted = true;
    for (const def of defs.values()) wire(def);
    rebuildLinear();
  }

  const list = () => Array.from(defs.values()).sort((a, b) => a.order - b.order);
  const get = (id) => defs.get(id) || null;

  return { register, boot, list, get, VALID_IDS };
})();
