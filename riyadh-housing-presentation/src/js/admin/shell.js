/* shell.js — هيكل الإدارة: البوابة، التبويبات، دورة المسودة
   لا يظهر أي عنصر من هذا في وضع المقدِّم. المسودة تُفتح من الإصدار الحالي
   وتُحفظ بنسخة متوقعة (رفض التعارض الصامت). */
"use strict";

RH.admin.shell = (function () {
  const { h } = RH.core.dom;

  let root = null;
  let draft = null;
  let draftVersion = null;
  const waivers = {};

  const TABS = [
    { id: "home", name: "نظرة عامة" },
    { id: "meta", name: "البيانات الوصفية" },
    { id: "import", name: "استيراد الملف" },
    { id: "insights", name: "التحليلات" },
    { id: "strategy", name: "الاستراتيجية" },
    { id: "kpis", name: "المؤشرات" },
    { id: "panels", name: "لوحات الرؤى" },
    { id: "steps", name: "الخطوات القادمة" },
    { id: "publish", name: "التحقق والنشر" },
    { id: "preview", name: "المعاينة" },
    { id: "history", name: "الإصدارات" },
    { id: "audit", name: "سجل التدقيق" },
    { id: "offline", name: "تجهيز دون اتصال" },
  ];

  function toast(msg) {
    let el = document.getElementById("adm-toast");
    if (!el) {
      el = h("div", { id: "adm-toast", hidden: true });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 3400);
  }

  async function show(route) {
    root = document.getElementById("admin-root");
    const session = RH.admin.auth.session();
    if (!session) return gate(route);
    return shell(route, session);
  }

  // ── بوابة الدخول ──
  async function gate(route) {
    const provisioned = await RH.admin.auth.isProvisioned();
    const supa = RH.admin.auth.supabaseEnabled();
    const err = h("div", { class: "adm-err" });
    const pass = h("input", { type: "password", autocomplete: "current-password" });
    const name = h("input", { type: "text", autocomplete: "name" });

    const form = h("form", {
      onsubmit: async (e) => {
        e.preventDefault();
        err.textContent = "";
        try {
          if (!provisioned) {
            await RH.admin.auth.provision(pass.value, name.value.trim());
            await RH.admin.auth.signIn(pass.value);
          } else {
            await RH.admin.auth.signIn(pass.value);
          }
          show(route);
        } catch (ex) {
          err.textContent = ex.message;
        }
      },
    },
      !provisioned ? h("div", {},
        h("label", {}, "اسم مسؤول المنصة"), name) : null,
      h("label", {}, "عبارة المرور" + (provisioned ? "" : " (10 محارف فأكثر)")),
      pass, err,
      h("button", { class: "btn btn-primary", type: "submit", style: { width: "100%" } },
        provisioned ? "دخول" : "تهيئة ودخول"),
    );

    RH.core.dom.clear(root).appendChild(h("div", { class: "adm-gate" },
      h("div", { class: "adm-gate-card" },
        h("h1", {}, "إدارة منصة العرض"),
        h("div", { class: "sub" },
          supa
            ? "مصادقة Supabase مفعّلة"
            : "وضع محلي تجريبي — ضبط وصول جهازي، ليس مصادقة خادم"),
        form,
        h("div", { class: "adm-gate-note" },
          supa
            ? "الدخول بدعوة فقط؛ التسجيل الذاتي معطّل. راجع supabase/README.md."
            : "بيئة التسليم الحالية بلا مشروع Supabase، فيعمل هذا الوضع على مخزن "
              + "المتصفح المحلي بكامل سير المسودة/النشر/التراجع للتجربة والتدريب. "
              + "للإنتاج فعّل حزمة Supabase المرفقة (supabase/README.md) فتصبح "
              + "المصادقة دعوةً فقط بأدوار مفروضة بسياسات RLS."),
      ),
    ));
  }

  // ── الهيكل الرئيس ──
  async function shell(route, session) {
    const tab = TABS.some((t) => t.id === route.id) ? route.id : "home";
    if (!draft) {
      const existing = await RH.data.store.getDraft();
      if (existing) {
        draft = existing;
        draftVersion = existing.release.draft_version;
      }
    }

    const content = h("div", {});
    const shellEl = h("div", { class: "adm-shell" },
      h("header", { class: "adm-header" },
        h("div", {},
          h("div", { class: "brand-kicker" }, "الإدارة المحمية"),
          h("h1", {}, RH.data.store.release().meta.title),
        ),
        h("div", { style: { display: "flex", alignItems: "center", gap: "14px" } },
          session.mode === "local-demo"
            ? h("span", { class: "adm-mode-chip" }, "وضع محلي تجريبي") : null,
          h("span", { class: "who" }, "المستخدم: ", h("b", {}, session.name),
            " · الدور: ", h("b", {}, roleName(session.role))),
          h("button", { class: "btn btn-quiet", onclick: () => {
            RH.admin.auth.signOut();
            show(route);
          } }, "خروج"),
          h("a", { class: "btn btn-line", href: "#/scene/00" }, "إلى العرض"),
        ),
      ),
      h("nav", { class: "adm-nav", "aria-label": "أقسام الإدارة" },
        TABS.map((t) => h("button", {
          class: t.id === tab ? "on" : "",
          onclick: () => RH.core.router.go({ kind: "admin", id: t.id, params: {} }),
        }, t.name))),
      content,
    );
    RH.core.dom.clear(root).appendChild(shellEl);

    const needDraft = ["meta", "import", "insights", "strategy", "kpis", "panels",
      "steps", "publish"];
    if (needDraft.includes(tab) && !draft) {
      content.appendChild(h("div", { class: "adm-card" },
        h("h3", {}, "لا مسودة مفتوحة"),
        h("div", { class: "sub" },
          "التحرير يجري على مسودة منسوخة من الإصدار المنشور الحالي ("
          + RH.data.store.release().release.id + ") — افتحها أولاً"),
        RH.admin.auth.can.edit(session)
          ? h("button", { class: "btn btn-primary", onclick: async () => {
            draft = await RH.data.store.startDraft(session.name);
            draftVersion = 1;
            toast("فُتحت مسودة من " + draft.release.base_release_id);
            shell(route, session);
          } }, "فتح مسودة للتحرير")
          : h("div", { class: "hint" }, "دورك الحالي للقراءة فقط"),
      ));
      return;
    }

    const save = async () => {
      try {
        draftVersion = await RH.data.store.saveDraft(draft, session.name, draftVersion);
        toast("حُفظت المسودة (نسخة " + draftVersion + ")");
      } catch (e) {
        if (e.code === "draft_conflict") {
          toast(e.message);
        } else {
          toast("تعذر الحفظ: " + e.message);
        }
      }
    };

    switch (tab) {
      case "home": return home(content, session);
      case "meta": return RH.admin.editors.metadata(content, draft, save);
      case "import": return RH.admin.editors.importer(content, draft, save);
      case "insights": return RH.admin.editors.insights(content, draft, save);
      // V2: عقد الاستراتيجية «مرآة المصدر» — المحررات الموسعة (editors-strategy/insights2)
      case "strategy": return RH.admin.editors2.strategy(content, draft, save);
      case "kpis": return RH.admin.editors2.kpis(content, draft, save);
      case "panels": return RH.admin.editors2.panels(content, draft, save);
      case "steps": return RH.admin.editors.nextSteps(content, draft, save);
      case "publish":
        return RH.admin.publish.validation(content, draft, waivers, session,
          (state) => {
            if (state === "published") {
              draft = null;
              draftVersion = null;
              for (const k of Object.keys(waivers)) delete waivers[k];
              RH.core.router.go({ kind: "admin", id: "history", params: {} });
            }
          });
      case "preview": return RH.admin.publish.preview(content);
      case "history":
        return RH.admin.publish.history(content, session, () => {
          draft = null;
          RH.data.store.getDraft().then((d) => {
            draft = d;
            draftVersion = d ? d.release.draft_version : null;
            RH.core.router.go({ kind: "admin", id: "publish", params: {} });
          });
        });
      case "audit": return RH.admin.publish.auditLog(content);
      case "offline": return RH.admin.publish.offlinePrep(content);
    }
  }

  function roleName(r) {
    return { viewer: "عارض", editor: "محرر", publisher: "ناشر", admin: "مسؤول" }[r] || r;
  }

  async function home(content, session) {
    const rel = RH.data.store.release();
    const v = RH.data.validate.validateRelease(rel);
    const d = await RH.data.store.getDraft();
    content.appendChild(h("div", { class: "adm-page-head" },
      h("div", { class: "kicker" }, "نظرة عامة"),
      h("h2", {}, "حالة المنصة"),
      h("div", { class: "desc" },
        "الإصدار المعروض للمقدِّم، وحالة المسودة، وخلاصة فحوص الجودة."),
    ));
    content.appendChild(h("div", { class: "adm-card" },
      h("h3", {}, "الإصدار المنشور"),
      h("div", { class: "sub" }, "ما يقرؤه المقدِّم الآن — لقطة غير قابلة للتغيير"),
      h("div", { class: "rel-item current" },
        h("span", { class: "rid" }, rel.release.id),
        h("span", { class: "rmeta" },
          "البيانات حتى " + rel.meta.data_as_of
          + " · فحوص مجتازة " + v.gates.filter((g) => g.ok).length + "/" + v.gates.length
          + " · إنذارات مفتوحة " + v.warnings.length),
        h("span", { class: "st " + (v.blockers.length ? "bad" : v.warnings.length ? "warn" : "ok") },
          v.blockers.length ? "خلل حاجب!" : v.warnings.length ? "إنذارات موثقة" : "سليم"),
      ),
    ));
    content.appendChild(h("div", { class: "adm-card" },
      h("h3", {}, "المسودة"),
      d
        ? h("div", { class: "rel-item" },
          h("span", { class: "rid" }, "مسودة نسخة " + d.release.draft_version),
          h("span", { class: "rmeta" },
            "من الإصدار " + d.release.base_release_id + " · آخر تحديث "
            + (d.release.updated_by || d.release.started_by)),
          h("button", { class: "btn btn-danger-quiet", onclick: async () => {
            if (!confirm("إهمال المسودة وكل تحريرها؟")) return;
            await RH.data.store.discardDraft(session.name);
            draft = null; draftVersion = null;
            show({ kind: "admin", id: "home", params: {} });
          } }, "إهمال المسودة"))
        : h("div", { class: "sub" }, "لا مسودة مفتوحة"),
    ));
    const open = v.warnings.concat(v.blockers);
    if (open.length) {
      content.appendChild(h("div", { class: "adm-card" },
        h("h3", {}, "أبرز الملاحظات المفتوحة"),
        open.slice(0, 6).map((g) => h("div", { class: "qgate " + (g.level === "block" ? "block" : "warn") },
          h("div", {},
            h("div", { class: "qname" }, g.label),
            g.detail ? h("div", { class: "qdetail" }, g.detail) : null))),
      ));
    }
  }

  return { show, toast };
})();
