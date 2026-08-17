/* highlight.js — نافذة الإبراز: الطبقة الثانية من سلوك النقر (V3_SPEC §5)
   ═══════════════════════════════════════════════════════════════════════
   الطبقات الثلاث الصارمة:
     1) تحويم  → تلميح مصغّر (سطران: عنوان + قيمة واحدة) — ‎RH.viz.theme.ttMicro‎
     2) نقرة أولى → **هذه النافذة**: جملة واحدة + ≤3 أرقام مساندة + زر واحد
     3) الزر    → الملحق المختص بحالة عودة مرمّزة

   **الحد الصارم: 320 حرفاً.** يُحتسب على النص الحرّ الذي يكتبه بانو التبويبات:
       العنوان + الجملة + مجموع (تسمية كل رقم مساند + قيمته)
   ولا يُحتسب نص الزر الثابت ولا تسميات الواجهة. عند التجاوز:
     • ‎strict‎ (التطوير) → **يرمي خطأً** فيسقط البناء في وجه المطوّر فوراً.
     • غير ‎strict‎ (الإنتاج) → يقصّ الجملة ثم الأرقام الزائدة، ويُنذر في الكونسول.
   ‎RH.highlight.normalize()‎ دالة **نقية** بلا DOM — عليها يقوم اختبار الوحدة
   ‎tests/unit/highlight-cap.test.mjs‎ (بوابة القبول في V3_SPEC §7).

   إتاحة: ‎role="dialog"‎ + ‎aria-modal‎ (فيحترمها حارس ‎modalOpen()‎ في nav.js
   فلا يقلّب الكليكر خلف النافذة)، مصيدة تركيز دائرية، ‎Escape‎ يغلق ويعيد
   التركيز إلى العنصر المستدعي، و‎prefers-reduced-motion‎ يلغي الحركة. */
"use strict";

RH.highlight = (function () {
  const { h, clear } = RH.core.dom;

  /** الحد الأقصى الملزم لمجموع النص الحرّ */
  const MAX_CHARS = 320;
  /** الحد الأقصى للأرقام المساندة */
  const MAX_STATS = 3;

  /** وضع التطوير: يرمي بدل أن يقصّ. يُفعّل بـ‎window.RH_DEV = true‎ قبل الإقلاع،
      أو بضبط ‎RH.highlight.strict = true‎ في أي وقت (الاختبارات تمرره صراحةً). */
  function isStrict() {
    return !!(RH.highlight && RH.highlight.strict);
  }
  const DEV_DEFAULT = typeof window !== "undefined" && window.RH_DEV === true;

  const str = (x) => (x == null ? "" : String(x));

  /** طول النص الحرّ لمواصفة إبراز */
  function measure(spec) {
    const s = spec || {};
    let n = str(s.title).length + str(s.sentence).length;
    for (const st of (s.stats || [])) {
      n += str(st && st.label).length + str(st && st.value).length;
    }
    return n;
  }

  /**
   * تطبيع مواصفة الإبراز وفرض الحدّين (نقية — لا DOM).
   * يعيد ‎{title, sentence, stats, appendix, chars, truncated, dropped}‎.
   * ‎opts.strict‎ يتجاوز الوضع العام (للاختبارات).
   */
  function normalize(spec, opts) {
    const o = opts || {};
    const strict = typeof o.strict === "boolean" ? o.strict : isStrict();
    const s = spec || {};

    const title = str(s.title).trim();
    let sentence = str(s.sentence).trim();
    let stats = (Array.isArray(s.stats) ? s.stats : [])
      .filter((x) => x && (x.label != null || x.value != null))
      .map((x) => ({
        label: str(x.label).trim(),
        value: str(x.value).trim(),
        tone: x.tone || null,      /* "pos" | "neg" | "gold" | null — دلالي فقط */
      }));

    let dropped = 0;
    if (stats.length > MAX_STATS) {
      if (strict) {
        throw new Error("نافذة الإبراز: الأرقام المساندة " + stats.length
          + " والحد " + MAX_STATS + " — انقل الزائد إلى الملحق");
      }
      dropped = stats.length - MAX_STATS;
      stats = stats.slice(0, MAX_STATS);
    }

    let chars = measure({ title, sentence, stats });
    let truncated = false;
    if (chars > MAX_CHARS) {
      if (strict) {
        throw new Error("نافذة الإبراز: النص " + chars + " حرفاً والحد "
          + MAX_CHARS + " — اختصر الجملة أو انقل التفصيل إلى الملحق"
          + (title ? " (العنوان: " + title + ")" : ""));
      }
      truncated = true;
      // القصّ يبدأ من الجملة (الحقل الحرّ الوحيد) ويُبقي الأرقام والعنوان
      const fixed = measure({ title, sentence: "", stats });
      const room = MAX_CHARS - fixed;
      if (room > 1) {
        sentence = sentence.slice(0, room - 1).replace(/\s+\S*$/, "") + "…";
      } else {
        sentence = "";
        // ما زال التجاوز؟ تُسقَط الأرقام من الآخِر حتى يستقيم الحد
        while (stats.length && measure({ title, sentence, stats }) > MAX_CHARS) {
          stats.pop();
          dropped++;
        }
      }
      chars = measure({ title, sentence, stats });
      if (typeof console !== "undefined") {
        console.warn("نافذة الإبراز تجاوزت " + MAX_CHARS
          + " حرفاً فقُصّت — راجع نص «" + title + "»");
      }
    }

    return {
      title, sentence, stats, chars, truncated, dropped,
      appendix: s.appendix && s.appendix.id
        ? { id: str(s.appendix.id), params: s.appendix.params || {},
          label: str(s.appendix.label).trim() || null }
        : null,
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     الطبقة المرئية
     ══════════════════════════════════════════════════════════════════════════ */

  const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea,'
    + ' [tabindex]:not([tabindex="-1"])';

  let openState = null;   // {overlay, close, restore}

  /** يغلق النافذة المفتوحة إن وُجدت (آمن للاستدعاء المتكرر) */
  function close() {
    if (!openState) return;
    const st = openState;
    openState = null;
    document.removeEventListener("keydown", st.onKey, true);
    if (st.overlay.parentNode) st.overlay.parentNode.removeChild(st.overlay);
    try {
      if (st.restore && st.restore.focus) st.restore.focus();
    } catch (_e) { /* العنصر المستدعي زال مع إعادة بناء القسم — لا ضير */ }
  }

  const isOpen = () => !!openState;

  /**
   * ‎open(spec)‎ — يفتح نافذة الإبراز.
   * spec:
   *   title    {string}  عنوان قصير (اسم الفئة/الشهر/الحي)
   *   sentence {string}  **جملة واحدة** بالقيمة الرئيسة
   *   stats    {Array<{label,value,tone}>} ≤3
   *   appendix {{id, params, label}} وجهة الزر — إن غابت لم يُعرض الزر
   *   anchor   {Element} العنصر المستدعي (يعود إليه التركيز عند الإغلاق)
   *   root     {Element} مضيف الطبقة (افتراضي ‎document.body‎)
   *   note     {string}  سطر مصدر/تحفّظ اختياري تحت الأرقام (خارج حدّ الأحرف —
   *                      وسوم الصدق الإلزامية لا تُقصّ أبداً)
   * يعيد دالة الإغلاق.
   */
  function open(spec) {
    const model = normalize(spec);
    close();   // نافذة واحدة في كل لحظة

    const restore = (spec && spec.anchor)
      || (typeof document !== "undefined" ? document.activeElement : null);
    const host = (spec && spec.root) || document.body;

    const statsEl = model.stats.length
      ? h("ul", { class: "hl-stats" }, model.stats.map((st) =>
        h("li", { class: "hl-stat" + (st.tone ? " is-" + st.tone : "") },
          h("span", { class: "hl-stat-label" }, st.label),
          h("b", { class: "hl-stat-value tnum ltr" }, st.value))))
      : null;

    let goBtn = null;
    if (model.appendix) {
      goBtn = h("button", {
        class: "hl-go", type: "button",
        onclick: () => {
          const dest = model.appendix;
          close();
          // حالة العودة يرمّزها المحرك من المسار الحالي (تبويب أو قسم)
          RH.presenter.engine.openAppendix(dest.id, dest.params);
        },
      },
        h("span", {}, model.appendix.label || "التفاصيل الكاملة في الملحق"),
        h("span", { class: "hl-go-arrow", "aria-hidden": "true" }, "←"));
    }

    const closeBtn = h("button", {
      class: "hl-close", type: "button",
      "aria-label": "إغلاق نافذة الإبراز",
      onclick: () => close(),
    }, "✕");

    const panel = h("div", {
      class: "hl-panel", role: "dialog", "aria-modal": "true",
      "aria-label": model.title || "إبراز",
      tabindex: "-1",
    },
      h("div", { class: "hl-head" },
        h("h2", { class: "hl-title" }, model.title), closeBtn),
      model.sentence ? h("p", { class: "hl-sentence" }, model.sentence) : null,
      statsEl,
      spec && spec.note ? h("p", { class: "hl-note" }, String(spec.note)) : null,
      goBtn ? h("div", { class: "hl-foot" }, goBtn) : null);

    const overlay = h("div", { class: "hl-overlay" }, panel);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    /** مصيدة تركيز دائرية + Escape */
    function onKey(e) {
      if (!openState) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE))
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      } else if (!panel.contains(document.activeElement)) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", onKey, true);

    host.appendChild(overlay);
    openState = { overlay, onKey, restore };
    (goBtn || closeBtn).focus();
    return close;
  }

  /** مساعد للتبويبات: يبني ويفتح من مواصفة، ويسجّل الإغلاق في تنظيف القسم */
  function bind(ctx, spec) {
    const dispose = open(spec);
    if (ctx && typeof ctx.onTeardown === "function") ctx.onTeardown(dispose);
    return dispose;
  }

  return {
    open, close, isOpen, bind, normalize, measure,
    MAX_CHARS, MAX_STATS,
    /** true في التطوير (يرمي) و false في الإنتاج (يقصّ) — قابل للضبط وقت التشغيل */
    strict: DEV_DEFAULT,
    _clear: () => { if (openState) clear(openState.overlay); },
  };
})();
