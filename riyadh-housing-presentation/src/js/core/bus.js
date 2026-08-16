/* bus.js — ناقل أحداث بسيط للفصل بين الوحدات */
"use strict";

RH.core.bus = (function () {
  const listeners = new Map();
  return {
    on(evt, fn) {
      if (!listeners.has(evt)) listeners.set(evt, new Set());
      listeners.get(evt).add(fn);
      return () => listeners.get(evt).delete(fn);
    },
    emit(evt, payload) {
      const set = listeners.get(evt);
      // لقطة ثابتة: مستمع يُسجَّل أثناء البث لا يستقبل الحدث نفسه
      if (set) for (const fn of Array.from(set)) fn(payload);
    },
  };
})();
