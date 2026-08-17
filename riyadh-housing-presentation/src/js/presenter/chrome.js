/* chrome.js — عناصر تحكم المقدِّم: التالي/السابق، مؤشر التقدم، العودة للمحاور،
   ملء الشاشة، ومؤشر الإصدار الرصين.

   امتداد حزمة التوسعة (عقد V2_CONTRACTS_EXPANSION §2): زرّا دخول اثنان يُبنيان
   من الجافاسكربت لا من markup.html — «بحث وتنقّل» (لوحة الأوامر) و«الموجز
   التنفيذي». يُبنيان بالصنف .hud-btn ذاته فيرثان سلوك الخمول والغلاف كاملاً،
   ويُخفى كلٌّ منهما تلقائياً إذا غابت وحدته عن البناء (بناء جزئي) — لا زر
   يقود إلى فراغ. أنماط موضعهما hudx- في src/styles/chrome-ext.css. */
"use strict";

RH.presenter.chrome = (function () {
  const { h, svg, clear } = RH.core.dom;

  function init() {
    document.getElementById("hud-next").addEventListener("click", () => {
      RH.presenter.engine.next();
    });
    document.getElementById("hud-prev").addEventListener("click", () => {
      RH.presenter.engine.prev();
    });
    document.getElementById("hud-agenda").addEventListener("click", () => {
      RH.presenter.engine.agenda();
    });
    buildExtras();
    renderProgress();
    renderBadge();
  }

  /* ── أزرار حزمة التوسعة ──────────────────────────────────────────────── */

  /** أيقونة خطية موحدة السماكة ترث لون النص (لا لون بيانات في الكروم) */
  function ico(...paths) {
    return svg("svg", {
      class: "hudx-ico", viewBox: "0 0 24 24", "aria-hidden": "true",
      focusable: "false",
    }, paths.map((d) => svg("path", { d })));
  }

  /** هل وحدة الميزة مضمّنة في هذا البناء؟ (يحدد ظهور زرها) */
  const hasPalette = () => !!(RH.palette && typeof RH.palette.toggle === "function");
  const hasReport = () => !!(RH.report && typeof RH.report.show === "function");

  /**
   * يبني زرّي الدخول مرة واحدة داخل شريط HUD القائم.
   * لا يلمس أزرار markup.html المعتمدة ولا ترتيبها — إضافة صرفة في نهاية
   * الشريط بموضع CSS مستقل (أسفل يسار المسرح).
   */
  function buildExtras() {
    const hud = document.getElementById("hud");
    if (!hud || document.getElementById("hud-palette")) return;

    const paletteBtn = h("button", {
      id: "hud-palette",
      class: "hud-btn hudx-palette",
      type: "button",
      title: "بحث وتنقّل سريع في الأقسام والملاحق والأحياء والمقاييس",
      "aria-label": "بحث وتنقّل — اختصار Ctrl+K",
      onclick: () => RH.core.bus.emit("palette:toggle"),
    },
      ico("M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M20 20l-4-4"),
      h("span", {}, "بحث وتنقّل"),
      // رقاقة الاختصار: نص لا مفتاح — العزل الاتجاهي يمنع انقلاب «Ctrl K»
      h("span", { class: "hudx-kbd", "aria-hidden": "true" }, "Ctrl K"),
    );

    const reportBtn = h("button", {
      id: "hud-report",
      class: "hud-btn hudx-report",
      type: "button",
      title: "فتح الموجز التنفيذي المطبوع (مستند A4 قابل للطباعة وحفظ PDF)",
      "aria-label": "الموجز التنفيذي",
      onclick: () => RH.core.router.go({ kind: "report", id: "main", params: {} }),
    },
      ico("M6 3h8l4 4v14H6z", "M14 3v4h4", "M9 12h6", "M9 16h6"),
      h("span", {}, "الموجز التنفيذي"),
    );

    hud.appendChild(reportBtn);
    hud.appendChild(paletteBtn);
    syncExtras();
  }

  /** يعيد تقييم ظهور زرّي التوسعة (يُستدعى عند الإقلاع وعند العودة من وضع مستندي) */
  function syncExtras() {
    const p = document.getElementById("hud-palette");
    const r = document.getElementById("hud-report");
    if (p) p.hidden = !hasPalette();
    if (r) r.hidden = !hasReport();
  }

  function renderProgress() {
    const wrap = document.getElementById("hud-progress");
    clear(wrap);
    for (const id of RH.presenter.engine.LINEAR) {
      wrap.appendChild(h("span", { class: "seg", dataset: { scene: id } }));
    }
  }

  function sync(current) {
    const segs = document.querySelectorAll("#hud-progress .seg");
    const iCur = current.kind === "scene"
      ? RH.presenter.engine.LINEAR.indexOf(current.id) : -1;
    segs.forEach((seg, i) => {
      seg.classList.toggle("now", i === iCur);
      seg.classList.toggle("done", iCur >= 0 && i < iCur);
    });
    const agendaBtn = document.getElementById("hud-agenda");
    // يختفي على الغلاف وعلى وجهته ذاتها (أول لوحة — الملخص التنفيذي)
    const firstSection = RH.presenter.engine.LINEAR[1];
    agendaBtn.hidden = current.kind === "scene"
      && (current.id === "00" || current.id === firstSection);
  }

  /** طلب ملء الشاشة — من إيماءة مستخدم حصراً، مع استمرار رشيق عند الرفض */
  function requestFullscreen() {
    const el = document.documentElement;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!fn) return Promise.resolve(false);
    try {
      const p = fn.call(el);
      if (p && p.catch) return p.then(() => true).catch(() => false);
      return Promise.resolve(true);
    } catch (_e) {
      return Promise.resolve(false);
    }
  }

  /** مؤشر الإصدار/الاتصال: يظهر فقط خارج الغلاف وبمعلومة مفيدة */
  function renderBadge() {
    const el = document.getElementById("release-badge");
    const rel = RH.data.store.release();
    const mode = RH.data.store.mode();
    let label;
    if (mode === "preview-draft") {
      label = "معاينة مسودة — غير منشورة · البيانات حتى " + rel.meta.data_as_of;
      el.classList.add("warn");
    } else {
      label = "الإصدار " + RH.core.fmt.iso(rel.release.id)
        + " · البيانات حتى " + rel.meta.data_as_of
        + (mode === "local" ? " · نسخة منشورة محلياً" : "");
    }
    el.textContent = label;
    el.hidden = false;
  }

  return { init, sync, requestFullscreen, renderBadge, buildExtras, syncExtras };
})();
