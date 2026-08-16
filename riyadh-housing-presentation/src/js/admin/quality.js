/* quality.js — لوحة فحوص الجودة والتنازلات
   يعرض نتائج validateRelease على المسودة: بوابات حاجبة (تمنع النشر مطلقاً)
   وإنذارات تتطلب إقراراً موقَّعاً بسبب مكتوب (تنازل مسجَّل في الإصدار والتدقيق). */
"use strict";

RH.admin.quality = (function () {
  const { h } = RH.core.dom;

  const ICONS = {
    pass: "M5 13l4 4L19 7",
    warn: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
    block: "M18 6 6 18M6 6l12 12",
  };
  function icon(kind) {
    return RH.core.dom.svg("svg", {
      viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
      "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round",
      class: "qicon",
    }, RH.core.dom.svg("path", { d: ICONS[kind] }));
  }

  /**
   * يبني لوحة الفحوص. waivers كائن حي {gateId: {by, reason, at}}.
   * onChange يُستدعى عند تغير التنازلات لتحديث زر النشر.
   */
  function render(container, draft, waivers, session, onChange) {
    const v = RH.data.validate.validateRelease(draft);
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "فحوص الجودة"),
      h("div", { class: "sub" },
        `${v.gates.filter((g) => g.ok).length} من ${v.gates.length} فحصاً مجتازاً · ` +
        `${v.blockers.length} حاجب · ${v.warnings.length} إنذار`),
    );

    for (const g of v.gates) {
      const state = g.ok ? "pass" : (g.level === "block" ? "block" : "warn");
      const row = h("div", { class: "qgate " + state },
        icon(state),
        h("div", { style: { flex: "1" } },
          h("div", { class: "qname" }, g.label),
          g.detail ? h("div", { class: "qdetail" }, g.detail) : null,
          !g.ok && g.level === "warn" && waivers[g.id]
            ? h("div", { class: "qdetail", style: { color: "var(--warn)" } },
              `تنازل مسجَّل: ${waivers[g.id].reason} — ${waivers[g.id].by}`)
            : null,
        ),
      );
      if (!g.ok && g.level === "warn" && RH.admin.auth.can.publish(session)) {
        const btn = h("button", { class: "btn btn-line qwaive" },
          waivers[g.id] ? "إلغاء التنازل" : "تسجيل تنازل");
        btn.addEventListener("click", () => {
          if (waivers[g.id]) {
            delete waivers[g.id];
          } else {
            const reason = prompt(
              "سبب التنازل عن هذا الإنذار (يُسجَّل باسمك في الإصدار وسجل التدقيق):");
            if (!reason || reason.trim().length < 5) return;
            waivers[g.id] = {
              by: session.name, reason: reason.trim(),
              at: new Date().toISOString(),
            };
          }
          onChange();
        });
        row.appendChild(btn);
      }
      card.appendChild(row);
    }
    RH.core.dom.clear(container).appendChild(card);
    return v;
  }

  return { render };
})();
