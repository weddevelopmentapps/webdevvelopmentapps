/* theme-mode.js — مبدّل السمة (V3_SPEC §1)
   ─────────────────────────────────────────
   عقد ملزم:
     • ثلاث حالات مخزَّنة: "light" | "dark" | "auto" (الافتراضي "auto").
     • "auto" لا يكتب سمة على ‎<html>‎ إطلاقاً، فتحكم ‎@media (prefers-color-scheme)‎
       في tokens.css وحدها — وهذا يجعل «الفاتح» الافتراضي على كل جهاز لا يطلب
       الداكن صراحةً (V3_SPEC §1: الفاتح هو الافتراضي).
     • الاختيار الصريح يكتب ‎data-theme="light|dark"‎ على ‎<html>‎ ويُحفظ في
       RH.core.storage.local تحت المفتاح ‎rh:theme‎.
     • كل تغيّر يبثّ ‎theme:change‎ على ‎RH.core.bus‎ بحمولة
       ‎{mode, effective, previous}‎ — ‎effective‎ هو «light» أو «dark» فعلياً.
     • لا يلمس هذا الملف أي DOM وقت التحميل عدا ‎<html>‎ (يُستدعى ‎apply()‎ من
       ‎boot()‎ في app.js قبل بناء أي مشهد)، فيبقى قابلاً للتحميل في بيئة
       اختبار الوحدة بمحاكاة DOM دنيا.

   ملاحظة أداء: أثناء التبديل تُوضع سمة ‎data-theme-switching‎ لمدة قصيرة
   تُعطِّل كل الانتقالات (قاعدة في tokens.css) فلا يمر السطح بلون وسيط خاطئ. */
"use strict";

RH.core.themeMode = (function () {
  const KEY = "rh:theme";
  const MODES = ["light", "dark", "auto"];
  const SWITCH_MS = 220;

  let mode = "auto";
  let switchTimer = null;

  /** جذر المستند — يُقرأ كسولاً كي لا يتطلب DOM وقت التحميل */
  function root() {
    return (typeof document !== "undefined" && document.documentElement) || null;
  }

  function storageGet() {
    try {
      const v = RH.core.storage.local.getItem(KEY);
      return MODES.includes(v) ? v : null;
    } catch (_e) {
      return null;   // file:// بلا تخزين، أو منع من سياسة الخصوصية — لا يعطّل شيئاً
    }
  }
  function storageSet(v) {
    try {
      if (v === "auto") RH.core.storage.local.removeItem(KEY);
      else RH.core.storage.local.setItem(KEY, v);
    } catch (_e) { /* التخزين ترف لا شرط */ }
  }

  /** استعلام تفضيل النظام (يُعاد إنشاؤه كسولاً — بعض البيئات بلا matchMedia) */
  let mq = null;
  function systemQuery() {
    if (mq !== null) return mq;
    mq = (typeof window !== "undefined" && window.matchMedia)
      ? window.matchMedia("(prefers-color-scheme: dark)") : false;
    return mq;
  }
  /** السمة التي يطلبها النظام حين يكون الوضع "auto" */
  function systemTheme() {
    const q = systemQuery();
    return q && q.matches ? "dark" : "light";
  }

  /** السمة السارية فعلياً بعد حساب "auto" */
  function effective() {
    return mode === "auto" ? systemTheme() : mode;
  }

  /** يكتب/يمسح ‎data-theme‎ على ‎<html>‎ بحسب الوضع الحالي */
  function paint() {
    const el = root();
    if (!el) return;
    if (mode === "auto") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", mode);
  }

  /** إطفاء الانتقالات مؤقتاً أثناء القفزة اللونية */
  function freeze() {
    const el = root();
    if (!el) return;
    el.setAttribute("data-theme-switching", "");
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => {
      el.removeAttribute("data-theme-switching");
    }, SWITCH_MS);
  }

  function announce(previous) {
    const payload = { mode, effective: effective(), previous };
    if (RH.core.bus) RH.core.bus.emit("theme:change", payload);
    return payload;
  }

  /** التهيئة: يقرأ الاختيار المحفوظ ويطبّقه، ويراقب تغيّر تفضيل النظام. */
  function init() {
    mode = storageGet() || "auto";
    paint();
    const q = systemQuery();
    if (q && (q.addEventListener || q.addListener)) {
      const onSystem = () => {
        // تغيّر تفضيل النظام لا يهمّ إلا في الوضع التلقائي
        if (mode !== "auto") return;
        freeze();
        announce(effective() === "dark" ? "light" : "dark");
      };
      if (q.addEventListener) q.addEventListener("change", onSystem);
      else q.addListener(onSystem);
    }
    return effective();
  }

  /** الوضع المخزَّن ("light"|"dark"|"auto") */
  function get() { return mode; }

  /** ضبط الوضع صراحةً — يحفظ ويطبّق ويبثّ */
  function set(next) {
    if (!MODES.includes(next)) {
      throw new Error("وضع سمة غير معروف: " + next);
    }
    const previous = effective();
    if (next === mode) return effective();
    mode = next;
    storageSet(mode);
    freeze();
    paint();
    announce(previous);
    return effective();
  }

  /** التبديل الثنائي الذي يراه المستخدم: فاتح ⇄ داكن (يخرج من "auto" بأول نقرة) */
  function toggle() {
    return set(effective() === "dark" ? "light" : "dark");
  }

  /** التسمية العربية المعروضة على الزر (الفعل المقبل لا الحالة الراهنة) */
  function label() {
    return effective() === "dark" ? "التبديل إلى السمة الفاتحة"
      : "التبديل إلى السمة الداكنة";
  }

  return { init, get, set, toggle, effective, systemTheme, label, KEY, MODES };
})();
