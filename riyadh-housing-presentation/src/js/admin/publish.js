/* publish.js — التحقق والمعاينة والنشر والتاريخ والتراجع
   المعاينة تستخدم عارض المقدِّم ذاته (iframe لنفس الملف بمعامل preview=draft)
   فلا انحراف بين ما يراجعه المحرر وما يراه أمين المنطقة. */
"use strict";

RH.admin.publish = (function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  function validation(container, draft, waivers, session, onState) {
    const card = h("div", {});
    const gateBox = h("div", {});
    const publishBox = h("div", { class: "adm-card" });

    function refresh() {
      const v = RH.admin.quality.render(gateBox, draft, waivers, session, refresh);
      RH.core.dom.clear(publishBox);
      publishBox.appendChild(h("h3", {}, "النشر"));
      const unwaived = v.warnings.filter((w) => !waivers[w.id]);
      const blocked = v.blockers.length > 0 || unwaived.length > 0;
      publishBox.appendChild(h("div", { class: "sub" },
        v.blockers.length
          ? `النشر محجوب: ${fmt.int(v.blockers.length)} فحص حاجب فاشل`
          : unwaived.length
            ? `النشر بانتظار إقرار ${fmt.int(unwaived.length)} إنذار (تنازل موقَّع)`
            : "كل الفحوص مجتازة أو مُقرّ بها — يمكن النشر"));
      const notes = h("input", { type: "text",
        placeholder: "ملاحظات الإصدار (اختياري)", style: { marginBottom: "12px" } });
      publishBox.appendChild(h("div", { class: "frow single" },
        h("div", { class: "fitem" }, notes)));
      const btn = h("button", {
        class: "btn btn-primary",
        disabled: blocked || !RH.admin.auth.can.publish(session) ? "" : null,
      }, "نشر إصدار غير قابل للتغيير");
      btn.addEventListener("click", async () => {
        if (!confirm("سيُنشر إصدار جديد يقرؤه المقدِّم فوراً. هل تريد المتابعة؟")) return;
        try {
          draft.release.notes = notes.value.trim();
          const rel = await RH.data.store.publish(draft, session.name, waivers);
          RH.admin.shell.toast("نُشر الإصدار " + rel.release.id);
          onState("published", rel);
        } catch (e) {
          RH.admin.shell.toast(e.message || "فشل النشر");
        }
      });
      publishBox.appendChild(btn);
      if (!RH.admin.auth.can.publish(session)) {
        publishBox.appendChild(h("div", { class: "hint", style: { marginTop: "8px" } },
          "دورك الحالي لا يملك صلاحية النشر"));
      }
    }
    refresh();
    card.appendChild(gateBox);
    card.appendChild(publishBox);
    RH.core.dom.clear(container).appendChild(card);
  }

  /** معاينة المسودة في عارض المقدِّم الحقيقي */
  function preview(container) {
    const src = window.location.pathname.split("#")[0]
      + "?preview=draft#/scene/00";
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "معاينة المسودة في عارض المقدِّم"),
      h("div", { class: "sub" },
        "العارض ذاته الذي يراه أمين المنطقة، ببيانات المسودة غير المنشورة — احفظ المسودة أولاً ليظهر آخر تحريرك"),
      h("div", { class: "preview-frame" },
        h("iframe", { src, style: { width: "100%", height: "100%", border: "0" },
          title: "معاينة العرض" })),
      h("div", { style: { marginTop: "12px" } },
        h("a", { href: src, target: "_blank", class: "btn btn-line" },
          "فتح المعاينة في نافذة مستقلة")),
    );
    RH.core.dom.clear(container).appendChild(card);
  }

  /** سجل الإصدارات + التراجع */
  async function history(container, session, onRollback) {
    const releases = await RH.data.store.history();
    const current = RH.data.store.release().release.id;
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "سجل الإصدارات"),
      h("div", { class: "sub" },
        "كل إصدار لقطة غير قابلة للتغيير ببصمة تحقق؛ التراجع ينسخ إصداراً تاريخياً إلى مسودة جديدة تمر بمسار النشر الكامل"),
    );
    for (const r of releases) {
      const isCurrent = r.release.id === current;
      card.appendChild(h("div", { class: "rel-item" + (isCurrent ? " current" : "") },
        h("span", { class: "rid" }, r.release.id + (isCurrent ? " ← المعروض" : "")),
        h("span", { class: "rmeta" },
          (r.release.published_at ? fmt.date(r.release.published_at.slice(0, 10)) : "—")
          + " · " + (r.release.published_by || "—")
          + (r.release.notes ? " · " + r.release.notes : "")
          + (r.release.sha256 ? " · " : ""),
          r.release.sha256
            ? h("span", { class: "ltr", style: { fontSize: "11px" } },
              r.release.sha256.slice(0, 12) + "…") : null),
        !isCurrent && RH.admin.auth.can.publish(session)
          ? h("button", { class: "btn btn-line", onclick: async () => {
            if (!confirm("ستُنشأ مسودة من هذا الإصدار للتراجع إليه عبر النشر. هل تريد المتابعة؟")) return;
            await RH.data.store.rollback(r.release.id, session.name);
            RH.admin.shell.toast("أُنشئت مسودة تراجع — راجع الفحوص ثم انشر");
            onRollback();
          } }, "تراجع إلى هذا الإصدار")
          : h("span", {}),
      ));
    }
    RH.core.dom.clear(container).appendChild(card);
  }

  /** سجل التدقيق */
  async function auditLog(container) {
    const rows = await RH.data.store.auditLog();
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "سجل التدقيق"),
      h("div", { class: "sub" }, "من فعل ماذا ومتى — سجل إلحاقي لا يُعدل"),
    );
    for (const r of rows.slice().reverse().slice(0, 200)) {
      card.appendChild(h("div", { class: "audit-row" },
        h("span", { class: "at ltr" }, r.at.replace("T", " ").slice(0, 19)),
        h("span", { class: "aw" }, r.actor),
        h("span", {}, r.action +
          (r.detail && Object.keys(r.detail).length
            ? " — " + JSON.stringify(r.detail).slice(0, 120) : "")),
      ));
    }
    RH.core.dom.clear(container).appendChild(card);
  }

  /** تجهيز العرض دون اتصال */
  function offlinePrep(container) {
    const media = ["assets/media/cover-poster.jpg", "assets/media/cover-loop.mp4"];
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "تجهيز العرض دون اتصال"),
      h("div", { class: "sub" },
        "التطبيق ملف واحد مكتفٍ بذاته: البيانات والرسوم والخطوط مضمّنة، فلا يحتاج اتصالاً أصلاً. "
        + "هذا الفحص يتحقق من وجود ملفات الوسائط الاختيارية بجوار الملف قبل البروفة."),
    );
    const list = h("div", {});
    card.appendChild(list);
    media.forEach((m) => {
      const row = h("div", { class: "qgate" },
        h("span", { class: "st mut" }, "جارٍ الفحص…"),
        h("span", { style: { flex: 1 } }, m));
      list.appendChild(row);
      fetch(m, { method: "GET" }).then((r) => {
        row.firstChild.className = "st " + (r.ok ? "ok" : "warn");
        row.firstChild.textContent = r.ok ? "موجود" : "غائب (يعمل البديل الكودي)";
      }).catch(() => {
        row.firstChild.className = "st warn";
        row.firstChild.textContent = "غائب (يعمل البديل الكودي)";
      });
    });
    card.appendChild(h("div", { class: "hint", style: { marginTop: "10px" } },
      "قائمة بروفة كاملة في دليل المقدِّم (PRESENTER_GUIDE_AR.md §قائمة ما قبل العرض)"));
    RH.core.dom.clear(container).appendChild(card);
  }

  return { validation, preview, history, auditLog, offlinePrep };
})();
