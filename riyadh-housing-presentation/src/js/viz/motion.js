/* motion.js — الحركة المنضبطة: عدّ الأرقام عند أول دخول ثم ثبات تام
   يحترم prefers-reduced-motion بحالة نهائية فورية. لا حركة مستمرة للبيانات. */
"use strict";

RH.viz.motion = (function () {
  const REDUCED = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const seen = new Set(); // «أول دخول فقط» لكل مفتاح مشهد+عنصر

  /** عدّ رقم واحد داخل عنصر. key يضمن عدم إعادة العد عند العودة للمشهد */
  function countUp(el, target, formatFn, key, duration) {
    if (REDUCED || (key && seen.has(key))) {
      el.textContent = formatFn(target);
      return;
    }
    if (key) seen.add(key);
    const dur = duration || 900;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatFn(target * eased);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatFn(target);
    }
    requestAnimationFrame(tick);
  }

  /** هل عُرض هذا المفتاح من قبل؟ (لإلغاء حركات كشف الرسوم عند العودة) */
  function firstEntry(key) {
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }

  return { countUp, firstEntry, REDUCED };
})();
