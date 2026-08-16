/* nav.js — عقد الملاحة الحي (القسم 8 من التكليف حرفياً)
   ──────────────────────────────────────────────────────
   • التالي: PageDown, Space, Enter, ArrowRight, ArrowDown
   • السابق: PageUp, Backspace, ArrowLeft, ArrowUp · Home/End
   • تجاهل: تكرار الضغط، التوافيق المعدَّلة، والتركيز داخل عنصر تفاعلي
   • Enter/Space على عنصر مركّز = تفعيله فقط (المتصفح) — لا تقدّم مزدوج
   • نقرة الخلفية تتقدّم فقط إذا كان الهدف عنصر المسرح ذاته لا سليله
   • لا تقدّم بعجلة الفأرة/لوح اللمس؛ سحب لمس بعتبة متحفظة
   • منع السلوك الافتراضي للمفاتيح المعالجة (تمرير Space وBackspace للخلف) */
"use strict";

RH.presenter.nav = (function () {
  const E = () => RH.presenter.engine;
  const { isInteractive } = RH.core.dom;

  const NEXT_KEYS = ["PageDown", " ", "Enter", "ArrowRight", "ArrowDown"];
  const PREV_KEYS = ["PageUp", "Backspace", "ArrowLeft", "ArrowUp"];
  const PREVENT = new Set([" ", "PageUp", "PageDown", "Backspace",
    "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"]);

  function inPresenter() {
    return document.body.classList.contains("mode-presenter");
  }

  function onKeydown(e) {
    if (!inPresenter()) return;
    if (e.repeat) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (isInteractive(e.target)) return; // Enter/Space يفعّلان العنصر لا المشهد
    const cur = E().current();
    if (!cur) return;

    // داخل ملحق: مفاتيح الأسهم تقلب صفحاته وEscape/Backspace يعود
    if (cur.kind === "appendix") {
      if (e.key === "Backspace" || e.key === "Escape") {
        if (PREVENT.has(e.key)) e.preventDefault();
        E().returnFromAppendix();
      } else if (NEXT_KEYS.includes(e.key)) {
        if (PREVENT.has(e.key)) e.preventDefault();
        RH.core.bus.emit("appendix:page", +1);
      } else if (PREV_KEYS.includes(e.key)) {
        if (PREVENT.has(e.key)) e.preventDefault();
        RH.core.bus.emit("appendix:page", -1);
      }
      wake();
      return;
    }

    if (NEXT_KEYS.includes(e.key)) {
      if (PREVENT.has(e.key)) e.preventDefault();
      E().next();
    } else if (PREV_KEYS.includes(e.key)) {
      if (PREVENT.has(e.key)) e.preventDefault();
      E().prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      E().home();
    } else if (e.key === "End") {
      e.preventDefault();
      E().end();
    } else {
      return;
    }
    wake();
  }

  /** نقرة الخلفية: الهدف يجب أن يكون مضيف المشهد أو عنصر المشهد الجذري نفسه */
  function onClick(e) {
    if (!inPresenter()) return;
    const cur = E().current();
    if (!cur || cur.kind !== "scene" || cur.id === "00") return;
    const t = e.target;
    const isStageSelf = t.classList
      && (t.classList.contains("scene-host") || t.classList.contains("sc"));
    if (!isStageSelf) return;
    E().next();
    wake();
  }

  // ── لمس: سحب أفقي بعتبة متحفظة (٦٪ من العرض و<45° انحرافاً) ──
  let touchStart = null;
  function onTouchStart(e) {
    if (e.touches.length !== 1) { touchStart = null; return; }
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }
  function onTouchEnd(e) {
    if (!touchStart || !inPresenter()) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const threshold = Math.max(70, window.innerWidth * 0.06);
    touchStart = null;
    if (isInteractive(e.target)) return;
    if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) return;
    // RTL: السحب يساراً (dx سالب) = التالي
    if (dx < 0) E().next(); else E().prev();
    wake();
  }

  // ── إخفاء عناصر التحكم بعد الخمول ──
  let idleTimer = null;
  function wake() {
    document.body.classList.remove("hud-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => document.body.classList.add("hud-idle"), 4000);
  }

  function init() {
    document.addEventListener("keydown", onKeydown, true);
    document.getElementById("stage").addEventListener("click", onClick);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("mousemove", wake, { passive: true });
    document.addEventListener("focusin", wake);
    // عجلة الفأرة: لا تقدّم إطلاقاً (يمنع القفز العرضي للوح اللمس)
    wake();
  }

  return { init, wake };
})();
