/* nav.js — عقد الملاحة الحي (القسم 8 من التكليف حرفياً)
   ──────────────────────────────────────────────────────
   • التالي: PageDown, Space, Enter, ArrowRight, ArrowDown
   • السابق: PageUp, Backspace, ArrowLeft, ArrowUp · Home/End
   • تجاهل: تكرار الضغط، التوافيق المعدَّلة، والتركيز داخل عنصر تفاعلي
   • Enter/Space على عنصر مركّز = تفعيله فقط (المتصفح) — لا تقدّم مزدوج
   • نقرة الخلفية تتقدّم فقط إذا كان الهدف عنصر المسرح ذاته لا سليله
   • لا تقدّم بعجلة الفأرة/لوح اللمس؛ سحب لمس بعتبة متحفظة
   • منع السلوك الافتراضي للمفاتيح المعالجة (تمرير Space وBackspace للخلف)

   امتداد حزمة التوسعة (عقد V2_CONTRACTS_EXPANSION §2) — ثلاث إضافات لا تمسّ
   شيئاً مما سبق:
     • Ctrl+K / ⌘K  → palette:toggle (المقدِّم والموجز، لا الإدارة) — تُفحص
       أولاً وقبل رفض المعدِّلات، لأنها الاختصار الوحيد المعدَّل في العقد.
     • N            → notes:toggle (درج ملاحظات المتحدث — المقدِّم وحده)
     • أثناء ‎body.tour-active تُحوَّل مفاتيح العرض إلى tour:key فتقود الجولة
       الملاحة بدل المحرك.
   قاعدة §8 محفوظة حرفياً: التركيز داخل عنصر تفاعلي (ومنه حقل بحث اللوحة
   وجذرها role="dialog") لا يقلّب الأقسام أبداً، ويزيدها هذا الامتداد صرامةً
   بحارس «حوار مشروط مفتوح» فلا يقلّب الكليكر خلف طبقة مفتوحة ولو ضاع التركيز. */
"use strict";

RH.presenter.nav = (function () {
  const E = () => RH.presenter.engine;
  const { isInteractive } = RH.core.dom;

  const NEXT_KEYS = ["PageDown", " ", "Enter", "ArrowRight", "ArrowDown"];
  const PREV_KEYS = ["PageUp", "Backspace", "ArrowLeft", "ArrowUp"];
  const PREVENT = new Set([" ", "PageUp", "PageDown", "Backspace",
    "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"]);
  /** مفاتيح العرض التي تقودها الجولة بنفسها حين تكون نشطة */
  const TOUR_KEYS = new Set(NEXT_KEYS.concat(PREV_KEYS, ["Home", "End", "Escape"]));

  function inPresenter() {
    return document.body.classList.contains("mode-presenter");
  }
  function inReport() {
    return document.body.classList.contains("mode-report");
  }
  function inAdmin() {
    return document.body.classList.contains("mode-admin");
  }
  function tourActive() {
    return document.body.classList.contains("tour-active");
  }

  /**
   * مطابقة مفتاح مستقلة عن تخطيط لوحة المفاتيح:
   * e.code فيزيائي (KeyK) ويعمل مع كل التخطيطات، ويُسند بمحرفي التخطيطين
   * اللاتيني والعربي للأجهزة التي لا ترسل code (بعض أجهزة التقديم).
   */
  function isKey(e, code, latin, arabic) {
    if (e.code === code) return true;
    const k = e.key;
    return k === latin || k === latin.toUpperCase() || k === arabic;
  }

  /** هل ثمة طبقة مشروطة مفتوحة (لوحة أوامر/طبقة تفاصيل)؟ */
  function modalOpen() {
    return !!document.querySelector('[role="dialog"][aria-modal="true"]');
  }
  /** هل التركيز داخل طبقة مشروطة؟ (تملك مفاتيحها ومنها Escape) */
  function inDialog(el) {
    return !!(el && el.closest && el.closest('[role="dialog"]'));
  }

  function onKeydown(e) {
    if (e.repeat) return;

    /* ── 1) لوحة الأوامر: الاختصار المعدَّل الوحيد — يُفحص قبل رفض المعدِّلات ── */
    if ((e.ctrlKey || e.metaKey) && !e.altKey && isKey(e, "KeyK", "k", "ن")) {
      if (inAdmin()) return;                 // الإدارة سطح تحريري — لا لوحة أوامر
      if (!RH.palette) return;               // بناء جزئي: لا اختصار بلا وحدة
      e.preventDefault();
      RH.core.bus.emit("palette:toggle");
      wake();
      return;
    }

    if (inReport() || inAdmin()) return;     // ما بعده يخصّ المسرح وحده
    if (!inPresenter()) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

    /* ── 2) حارس الجولة: الجولة تقود الملاحة بنفسها ──
       Escape ينفذ حتى مع تركيز تفاعلي (إنهاء الجولة مخرج طوارئ المتحدث)،
       إلا إذا كان التركيز داخل طبقة مشروطة تملك Escape الخاص بها. */
    if (tourActive() && TOUR_KEYS.has(e.key)) {
      if (e.key === "Escape") {
        if (inDialog(e.target)) return;
        e.stopPropagation();
        RH.core.bus.emit("tour:key", "Escape");
        wake();
        return;
      }
      if (isInteractive(e.target) || modalOpen()) return;
      if (PREVENT.has(e.key)) e.preventDefault();
      RH.core.bus.emit("tour:key", e.key);
      wake();
      return;
    }

    /* ── 3) درج ملاحظات المتحدث ── */
    if (isKey(e, "KeyN", "n", "ى")) {
      if (isInteractive(e.target) || modalOpen()) return;
      if (!RH.tour || !RH.tour.notes) return; // بناء جزئي: لا مفتاح بلا درج
      e.preventDefault();
      RH.core.bus.emit("notes:toggle");
      wake();
      return;
    }

    if (isInteractive(e.target)) return; // Enter/Space يفعّلان العنصر لا المشهد
    // طبقة مشروطة مفتوحة والتركيز ضلّ خارجها: الكليكر لا يقلّب خلفها
    if (modalOpen() && e.key !== "Escape") return;
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
    // أثناء الجولة أو خلف طبقة مشروطة: الخلفية لا تقلّب الأقسام
    if (tourActive() || modalOpen()) return;
    const cur = E().current();
    if (!cur || cur.kind !== "scene" || cur.id === "00") return;
    const t = e.target;
    // خلفية المشهد ذاتها فقط: مضيف المشهد أو جذر المشهد/اللوحة أو جسمها —
    // أي سليل (بطاقة/رسم/خريطة) لا يقلب الأقسام أبداً
    const isStageSelf = t.classList
      && (t.classList.contains("scene-host") || t.classList.contains("sc")
        || t.classList.contains("dash") || t.classList.contains("dash-body"));
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
    if (modalOpen()) return;
    if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) return;
    // RTL: السحب يساراً (dx سالب) = التالي
    if (tourActive()) {
      // الجولة تقود: السحب يقلّب خطواتها لا أقسام المحرك
      RH.core.bus.emit("tour:key", dx < 0 ? "ArrowRight" : "ArrowLeft");
      wake();
      return;
    }
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
    document.addEventListener("touchstart", wake, { passive: true });
    document.addEventListener("focusin", wake);
    // عجلة الفأرة: لا تقدّم إطلاقاً (يمنع القفز العرضي للوح اللمس)
    wake();
  }

  return { init, wake };
})();
