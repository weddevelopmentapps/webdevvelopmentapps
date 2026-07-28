/* ============================================================
   Boot — init store, restore session, apply theme/lang, route.
   ============================================================ */
"use strict";

(function () {
  function boot() {
    RGP.applyTheme();
    if (RGP.prefs && RGP.prefs.apply) RGP.prefs.apply();   /* accent/density/type before first paint */
    RGP.i18n.init();
    RGP.store.init();
    RGP.auth.init();
    try { RGP.lifecycle.sweep(); } catch (e) { console.error("sweep failed", e); }
    RGP.bus.on("store:saveError", function () {
      RGP.ui.toast("danger", { ar: t("toast.storageFull"), en: t("toast.storageFull") });
    });
    RGP.router.render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
