/* app.js — الإقلاع: السمة ← المخزن ← المحرك ← التبويبات ← الموجّه
   ══════════════════════════════════════════════════════════════
   V3: **التبويبات هي البنية الأساسية** (V3_SPEC §4). أربعة أوضاع حصرية على
   <body>:
     mode-tabs      — قشرة التبويبات الخمسة (الوضع الافتراضي عند الإقلاع)
     mode-presenter — المسرح: الملاحق **و**وضع العرض الاختياري بالكليكر
                      (يُضاف معه mode-present)
     mode-admin     — الإدارة
     mode-report    — الموجز التنفيذي المطبوع
   الأوضاع الثلاثة الأخيرة تتجاوز قشرة التبويبات كلياً وتخفي جذرها، والعودة
   منها تعيد التبويب إلى حالته المرمّزة في العنوان.

   السمة تُطبَّق **قبل** أي بناء (‎themeMode.init()‎ أول سطر) فلا تومض المنصة
   بلون خاطئ قبل قراءة الاختيار المحفوظ. */
"use strict";

(async function boot() {
  // 1) السمة أولاً — قبل المخزن وقبل أي عنصر مرئي
  RH.core.themeMode.init();

  try {
    await RH.data.store.init();
  } catch (e) {
    RH.core.showFatal(e.message || e);
    return;
  }

  RH.presenter.engine.init();
  // V2: توصيل الأقسام المسجلة وبناء التسلسل الخطي (يخدم وضع العرض والملاحق)
  if (RH.sections) RH.sections.boot();
  // V3: قشرة التبويبات — تُبنى مرة واحدة وتظل حيّة تحت الأوضاع الأخرى
  RH.tabs.boot();
  RH.presenter.nav.init();
  RH.presenter.chrome.init();

  document.title = RH.data.store.release().meta.title;

  const el = (id) => document.getElementById(id);

  /** جذر الموجز التنفيذي — يُنشأ كسولاً عند أول طلب للمسار فقط،
      فلا يوجد له عنصر ولا أثر في DOM أثناء تجربة المقدِّم العادية. */
  function reportRoot() {
    let root = el("report-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "report-root";
      root.className = "rpt-root";
      root.setAttribute("role", "document");
      root.setAttribute("aria-label", "الموجز التنفيذي");
      root.hidden = true;
      document.body.appendChild(root);
    }
    return root;
  }

  /** إخفاء كروم المقدِّم عند دخول وضع مستندي (إدارة/موجز) */
  function hidePresenterChrome() {
    el("stage").hidden = true;
    el("hud").hidden = true;
    el("release-badge").hidden = true;
  }

  /** إخفاء الجذور المستندية (إدارة/موجز) — لا يتعايشان مع غيرهما أبداً */
  function hideDocumentRoots() {
    const adminRoot = el("admin-root");
    if (adminRoot) adminRoot.hidden = true;
    const rptRoot = el("report-root");
    if (rptRoot) rptRoot.hidden = true;
  }

  /** دخول المسرح: الملاحق ووضع العرض الاختياري — يُستدعى قبل engine.show.
      className كامل: يمسح أعلام الطبقات (on-cover/in-appendix) التي يعيد
      engine.show ضبطها فوراً، ويحافظ على علم وضع العرض إن كان نشطاً. */
  function enterStage() {
    const body = document.body;
    body.className = "mode-presenter"
      + (RH.tabs.present.active() ? " mode-present" : "");
    RH.tabs.hide();
    el("stage").hidden = false;
    el("hud").hidden = false;
    hideDocumentRoots();
    RH.presenter.chrome.renderBadge();
    RH.presenter.chrome.syncExtras();
  }

  RH.core.router.start((route, opts) => {
    if (route.kind === "admin") {
      if (!RH.admin.shell) {
        RH.core.router.go({ kind: "tab", id: RH.tabs.DEFAULT_ID, params: {} },
          { replace: true });
        return;
      }
      document.body.className = "mode-admin";
      hidePresenterChrome();
      const rptRoot = el("report-root");
      if (rptRoot) rptRoot.hidden = true;   // الوضعان المستنديان لا يتعايشان
      const adminRoot = el("admin-root");
      adminRoot.hidden = false;
      RH.admin.shell.show(route);
      return;
    }

    // الموجز التنفيذي (عقد التوسعة §2/§3): وضع مستند كامل يتجاوز المسرح.
    // غياب وحدة الموجز (بناء جزئي) → تحويل استبدالي صادق إلى أول لوحة،
    // فلا تبقى شاشة فارغة ولا يُحبس المستخدم في مسار بلا مُنفِّذ.
    if (route.kind === "report") {
      if (!RH.report || typeof RH.report.show !== "function") {
        RH.core.router.go({ kind: "tab", id: RH.tabs.DEFAULT_ID, params: {} },
          { replace: true });
        return;
      }
      document.body.className = "mode-report";
      hidePresenterChrome();
      const adminRoot = el("admin-root");
      if (adminRoot) adminRoot.hidden = true;
      const root = reportRoot();
      root.hidden = false;
      try {
        RH.report.show(root, route);
      } catch (e) {
        RH.core.showFatal(e && (e.message || e));
      }
      return;
    }

    // ── تبويبات V3: البنية الأساسية ─────────────────────────────────────
    if (route.kind === "tab") {
      // عنوان قابل للمشاركة دائماً: الجذر الفارغ يُكتب مساراً صريحاً باستبدال
      // صامت (لا إدخال في التاريخ) فينسخ المستخدم رابطاً يفتح تبويبه ذاته.
      if (!window.location.hash) {
        RH.core.router.replace("/tab/" + route.id);
      }
      document.body.className = "mode-tabs";
      hidePresenterChrome();
      hideDocumentRoots();
      RH.tabs.show(route);
      return;
    }

    // ── أقسام/مشاهد V2 ──────────────────────────────────────────────────
    // خارج وضع العرض هي **مسارات قديمة**: تُحال إلى تبويبها أو إلى ملحقها
    // باستبدال صامت (لا إدخال في التاريخ ← لا حلقة رجوع).
    if (route.kind === "scene" && !RH.tabs.present.active()) {
      const dest = RH.tabs.resolveLegacy(route);
      if (dest) { RH.core.router.go(dest, { replace: true }); return; }
    }

    // ملحق أو وضع عرض نشط → المسرح
    enterStage();
    RH.presenter.engine.show(route, opts);
  });

  RH.core.bus.on("release:changed", () => {
    RH.presenter.chrome.renderBadge();
  });
})();
