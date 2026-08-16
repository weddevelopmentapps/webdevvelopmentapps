/* ns.js — مساحة الأسماء الجذرية + حاجز الأخطاء العام
   نمط الوحدات: ملفات تُضم بالترتيب في build.py وتكتب تحت RH.* — لا وحدات ES
   لأن الملف النهائي يجب أن يعمل عبر file:// بالنقر المزدوج. */
"use strict";

const RH = {
  core: {},
  data: {},
  viz: {},
  presenter: {},
  admin: {},
  VERSION: "1.0.0",
};

// حاجز أخطاء عام: شاشة عربية رشيقة بدل صفحة بيضاء صامتة
(function () {
  let shown = false;
  function showFatal(msg) {
    if (shown) return;
    shown = true;
    try {
      const el = document.getElementById("fatal");
      const m = document.getElementById("fatal-msg");
      if (m && msg) {
        m.textContent = "حدث خطأ غير متوقع أثناء التشغيل. أعد تحميل الصفحة، وإن تكرر الخطأ زوّد مسؤول المنصة بهذا الرمز: ";
        const code = document.createElement("code");
        code.style.direction = "ltr";
        code.style.unicodeBidi = "isolate";
        code.textContent = String(msg).slice(0, 140);
        m.appendChild(code);
      }
      if (el) el.hidden = false;
    } catch (_e) { /* لا شيء أسوأ من فشل حاجز الفشل */ }
  }
  window.addEventListener("error", (e) => {
    // أخطاء تحميل موارد فرعية (وسائط) لا تسقط التطبيق — لها بدائلها
    if (e && e.target && (e.target.tagName === "VIDEO" || e.target.tagName === "IMG")) return;
    showFatal(e.message || e.error);
  }, true);
  window.addEventListener("unhandledrejection", (e) => {
    showFatal(e.reason && (e.reason.message || e.reason));
  });
  RH.core.showFatal = showFatal;
})();
