/* ax-shell.js — هيكل الملاحق الموحد
   صفحات فرعية بحجم الإطار (لا تمرير)، ترقيم مرئي + مفاتيح، وزر عودة سياقي
   («العودة إلى التراخيص» لا «العودة إلى العرض») يعيد حالة المستدعي حرفياً. */
"use strict";

RH.presenter.ax = (function () {
  const { h } = RH.core.dom;

  /**
   * def: { id, kicker, title, returnLabel(ret) | returnLabelText,
   *        pages: (ctx) => [{ name, build(el, ctx) }] }
   */
  function register(def) {
    RH.presenter.engine.registerAppendix({
      id: def.id,
      build(host, ctx) {
        const pages = def.pages(ctx);
        let page = Math.min(pages.length - 1,
          Math.max(0, parseInt(ctx.params.page || "0", 10)));

        const ret = ctx.params.return
          ? RH.core.router.decodeReturn(ctx.params.return) : null;
        const returnLabel = typeof def.returnLabel === "function"
          ? def.returnLabel(ret) : (def.returnLabel || "العودة");

        const body = h("div", { class: "ax-body" });
        const dots = h("span", { class: "pdots", "aria-hidden": "true" });
        const pageName = h("span", {
          style: { fontSize: "calc(var(--su)*15)", color: "var(--mut-d)", minWidth: "calc(var(--su)*220)", textAlign: "center" },
        });
        const prevBtn = h("button", { class: "pbtn", onclick: () => go(page + 1) }, "التالية");
        const nextBtn = h("button", { class: "pbtn", onclick: () => go(page - 1) }, "السابقة");

        function renderPage() {
          RH.core.dom.clear(body);
          const el = h("div", { class: "ax-page" });
          body.appendChild(el);
          pages[page].build(el, ctx);
          RH.core.dom.clear(dots);
          pages.forEach((_p, i) => dots.appendChild(
            h("button", {
              class: "pdot" + (i === page ? " now" : ""),
              "aria-label": "الصفحة " + (i + 1),
              onclick: () => go(i),
            })));
          pageName.textContent = pages[page].name || "";
          prevBtn.disabled = page >= pages.length - 1;
          nextBtn.disabled = page <= 0;
          setTimeout(() => RH.viz.theme.resizeAll(), 40);
        }

        function go(n) {
          if (n < 0 || n >= pages.length) return;
          page = n;
          ctx.update({ page: n === 0 ? null : String(n) });
          renderPage();
        }

        // مفاتيح جهاز التقديم داخل الملحق تقلب الصفحات (يبثها nav.js)،
        // ويُفصل المستمع حتماً قبل أي بناء تالٍ (دورة حياة المحرك)
        const off = RH.core.bus.on("appendix:page", (dir) => go(page + dir));
        ctx.onTeardown(off);

        host.appendChild(h("section", { class: "ax", role: "region", "aria-label": def.title },
          h("div", { class: "ax-head" },
            h("div", {},
              h("div", { class: "ax-kicker" }, def.kicker),
              h("h2", { class: "ax-title" }, def.title),
            ),
            h("button", {
              class: "btn-return",
              onclick: () => RH.presenter.engine.returnFromAppendix(),
            },
              returnLabel,
              h("span", { "aria-hidden": "true", html: "&#8592;" }),
            ),
          ),
          body,
          pages.length > 1 ? h("div", { class: "ax-pager" }, nextBtn, dots, pageName, prevBtn) : null,
        ));
        renderPage();
      },
    });
  }

  /** صفّ مصدر/صيغة موحد لجداول «الصيغ والمصادر» */
  function provenanceRows(metricIds) {
    const rel = RH.data.store.release();
    const rows = [];
    for (const id of metricIds) {
      const m = rel.metrics[id] || rel.derived[id];
      if (!m) continue;
      rows.push({
        label: m.label || id,
        value: m.value,
        unit: m.unit || "",
        source: m.kind === "raw"
          ? `${m.sheet}!${m.anchor} — ${rel.sources[0] ? rel.sources[0].name : ""}`
          : "مشتق (" + (m.formula_version || "") + ")",
        formula: m.formula || "قيمة خام من الورقة",
      });
    }
    return rows;
  }

  return { register, provenanceRows };
})();
