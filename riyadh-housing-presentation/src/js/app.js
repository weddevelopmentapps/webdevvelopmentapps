/* app.js — الإقلاع: المخزن ← المحرك ← الموجّه
   الغلاف يتفاعل قبل أي تهيئة لرسوم ECharts (لا تُنشأ مثيلات إلا عند مشهد يحتاجها).
   مسار الإدارة يُبنى عند طلبه فقط ولا يظهر أي أثر له في وضع المقدِّم.

   V2 + التوسعة: ثلاثة أوضاع حصرية على <body> — mode-presenter (المسرح)،
   mode-admin (الإدارة)، mode-report (الموجز التنفيذي المطبوع). الوضعان
   الأخيران **يتجاوزان المسرح** كلياً: يخفيان stage/hud/release-badge ويعرضان
   جذرهما الخاص، والعودة منهما تعيد المقدِّم إلى حالته كاملاً. جذرا الإدارة
   والموجز لا يتعايشان أبداً. */
"use strict";

(async function boot() {
  try {
    await RH.data.store.init();
  } catch (e) {
    RH.core.showFatal(e.message || e);
    return;
  }

  RH.presenter.engine.init();
  // V2: توصيل الأقسام المسجلة وبناء التسلسل الخطي قبل رسم مؤشر التقدم
  if (RH.sections) RH.sections.boot();
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

  /** العودة إلى المقدِّم من أي وضع مستندي — تُستدعى قبل engine.show */
  function restorePresenter() {
    const body = document.body;
    if (!body.classList.contains("mode-admin")
      && !body.classList.contains("mode-report")) return;
    // className كامل: يمسح كذلك أعلام الطبقات (on-cover/in-appendix) التي
    // يعيد engine.show ضبطها فوراً بحسب المسار الجديد.
    body.className = "mode-presenter";
    el("stage").hidden = false;
    el("hud").hidden = false;
    const adminRoot = el("admin-root");
    if (adminRoot) adminRoot.hidden = true;
    const rptRoot = el("report-root");
    if (rptRoot) rptRoot.hidden = true;
    RH.presenter.chrome.renderBadge();
    RH.presenter.chrome.syncExtras();
  }

  RH.core.router.start((route, opts) => {
    if (route.kind === "admin") {
      if (!RH.admin.shell) {
        RH.core.router.go({ kind: "scene", id: "00", params: {} }, { replace: true });
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
        const fallback = (RH.sections && RH.sections.get("summary")) ? "summary" : "00";
        RH.core.router.go({ kind: "scene", id: fallback, params: {} }, { replace: true });
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

    // العودة من وضع مستندي (إدارة/موجز) إلى المقدِّم
    restorePresenter();
    RH.presenter.engine.show(route, opts);
  });

  RH.core.bus.on("release:changed", () => {
    RH.presenter.chrome.renderBadge();
  });
})();
