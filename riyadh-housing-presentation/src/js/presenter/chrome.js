/* chrome.js — عناصر تحكم المقدِّم: التالي/السابق، مؤشر التقدم، العودة للمحاور،
   ملء الشاشة، ومؤشر الإصدار الرصين. */
"use strict";

RH.presenter.chrome = (function () {
  const { h, clear } = RH.core.dom;

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
    renderProgress();
    renderBadge();
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

  return { init, sync, requestFullscreen, renderBadge };
})();
