/* safe-storage.js — طبقة تخزين متسامحة مع البيئات المقيَّدة
   ────────────────────────────────────────────────────────────
   لماذا: بعض بيئات العرض (إطار مضمَّن معزول sandbox، تصفح خاص متشدد،
   حظر ملفات تعريف الارتباط والتخزين) تجعل مجرد قراءة
   ‎window.localStorage‎ يرمي DOMException("SecurityError").
   الوصول المباشر كان يُسقط التطبيق كله عبر حاجز الفشل.

   العقد: كل وصول للتخزين في المنصة يمر عبر ‎RH.core.storage‎ حصراً.
   عند تعذر التخزين الحقيقي نستبدله بذاكرة داخل الصفحة: التطبيق يعمل
   كاملاً، وتضيع التفضيلات عند إعادة التحميل فقط — ولا شاشة خطأ.

   واجهة متعمَّدة الصغر (getItem/setItem/removeItem) لتطابق ما نستخدمه. */
"use strict";

RH.core.storage = (function () {
  /** ذاكرة بديلة تحاكي Storage عند الحظر */
  function memoryStore() {
    const map = new Map();
    return {
      getItem: (k) => (map.has(String(k)) ? map.get(String(k)) : null),
      setItem: (k, v) => { map.set(String(k), String(v)); },
      removeItem: (k) => { map.delete(String(k)); },
      key: (i) => Array.from(map.keys())[i] ?? null,
      get length() { return map.size; },
      __memory: true,
    };
  }

  /** يفحص توفر مخزن حقيقي بكتابة اختبارية (الوصول وحده قد يرمي) */
  function probe(kind) {
    try {
      const s = window[kind];
      if (!s) return null;
      const probeKey = "__rh_probe__";
      s.setItem(probeKey, "1");
      s.removeItem(probeKey);
      return s;
    } catch (_e) {
      return null;
    }
  }

  const realLocal = probe("localStorage");
  const realSession = probe("sessionStorage");

  const local = realLocal || memoryStore();
  const session = realSession || memoryStore();

  /** IndexedDB قد يكون محظوراً بالمثل — نعيد null بدل الرمي */
  function idb() {
    try {
      return window.indexedDB || null;
    } catch (_e) {
      return null;
    }
  }

  /** غلاف آمن لأي عملية تخزين: لا يرمي أبداً، ويعيد القيمة البديلة */
  function attempt(fn, fallback) {
    try {
      return fn();
    } catch (_e) {
      return fallback;
    }
  }

  const persistent = !!(realLocal && realSession);

  return {
    local,
    session,
    idb,
    attempt,
    /** هل التفضيلات ستبقى بعد إعادة التحميل؟ تستخدمه الواجهة لتلميح صادق */
    isPersistent: () => persistent,
    /** للاختبارات فقط */
    _memoryStore: memoryStore,
  };
})();
