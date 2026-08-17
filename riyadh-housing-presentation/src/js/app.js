/* app.js — الإقلاع: المخزن ← المحرك ← الموجّه
   الغلاف يتفاعل قبل أي تهيئة لرسوم ECharts (لا تُنشأ مثيلات إلا عند مشهد يحتاجها).
   مسار الإدارة يُبنى عند طلبه فقط ولا يظهر أي أثر له في وضع المقدِّم. */
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

  RH.core.router.start((route, opts) => {
    if (route.kind === "admin") {
      if (!RH.admin.shell) {
        RH.core.router.go({ kind: "scene", id: "00", params: {} }, { replace: true });
        return;
      }
      document.body.className = "mode-admin";
      document.getElementById("stage").hidden = true;
      document.getElementById("hud").hidden = true;
      document.getElementById("release-badge").hidden = true;
      const adminRoot = document.getElementById("admin-root");
      adminRoot.hidden = false;
      RH.admin.shell.show(route);
      return;
    }
    // العودة من الإدارة إلى المقدِّم
    if (document.body.classList.contains("mode-admin")) {
      document.body.className = "mode-presenter";
      document.getElementById("stage").hidden = false;
      document.getElementById("hud").hidden = false;
      document.getElementById("admin-root").hidden = true;
      RH.presenter.chrome.renderBadge();
    }
    RH.presenter.engine.show(route, opts);
  });

  RH.core.bus.on("release:changed", () => {
    RH.presenter.chrome.renderBadge();
  });
})();
