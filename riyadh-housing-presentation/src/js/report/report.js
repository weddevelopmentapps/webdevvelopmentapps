/* ════════════════════════════════════════════════════════════════════════════
   report.js — وضع «الموجز التنفيذي» المطبوع
   عقد V2_CONTRACTS_EXPANSION §3.3 — آخر ملفات حزمة الموجز في ترتيب الضم
   ────────────────────────────────────────────────────────────────────────────
   وضع مستندي كامل يتجاوز مسرح المقدِّم: `app.js` يضع `body.mode-report`،
   يخفي `#stage/#hud/#release-badge`، وينشئ `#report-root` كسولاً ثم يسلّمه
   لـ`show(root, route)`. **العنصر نفسه** يُسلَّم في كل دخول، فهذه الوحدة هي
   من يفرّغه ويعيد بناءه.

   ما يميز هذا الوضع عن بقية التطبيق:

   • **المستند نهاري** — ورق فاتح وحبر داكن (`--paper/--ink` من tokens.css)
     على أرضية المسرح الداكنة أثناء المعاينة. الطباعة تُخرج الورق وحده.

   • **الطباعة تُظهر الموجز فقط** — قواعد `@media print` في `report.css`
     (وحده — `print.css` المعتمد لا يُلمس) تخفي كل ما ليس `#report-root`،
     وتلغي تكبير المعاينة، وتضبط `@page { size: A4; margin: 12mm }`.

   • **الترقيم هندسي لا عرضي** — الأوراق تُبنى من خطة `RH.report.pages.plan`
     المحسوبة بالمليمتر، فالجداول الطويلة تُقسَّم بترويسة مكررة ووسم «تابع»
     بدل أن يتركها المتصفح تُقص عشوائياً عند حد الصفحة.

   • **الحركة صفر** — لقطات الرسوم مجمَّدة (`report-charts.js`)، والانتقالات
     الوحيدة في الواجهة (تمرير الفهرس) تُلغى مع `prefers-reduced-motion`.

   • **التنظيف ذاتي** — `app.js` لا يستدعي `destroy()`؛ هذه الوحدة تراقب
     `hashchange` بنفسها، فحين يغادر المستخدم `#/report` تتخلص من مثائل
     الرسوم وتفرّغ الجذر وتفكّ مستمعيها. لا مثيل ECharts يتيم ولا مستمع عالق.

   • **الصدق** — بناء جزئي (غياب `pages` أو `charts`) يعطي بطاقة صريحة تسمي
     الوحدة الغائبة بدل مستند فارغ؛ وكل وسم صدق في النموذج يُطبع كما هو.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

RH.report = RH.report || {};

(function () {
  const { h, clear } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* ══════════════════════════════════════════════════════════════════════════
     0) ثوابت الوحدة
     ══════════════════════════════════════════════════════════════════════════ */

  /** مستويات تكبير المعاينة (الطباعة تتجاهلها كلها) */
  const ZOOMS = Object.freeze([0.5, 0.6, 0.75, 0.9, 1, 1.15, 1.35]);
  const DEFAULT_ZOOM = 0.75;
  const ZOOM_KEY = "rh.report.zoom";

  /** عرض ورقة A4 بالبكسل عند 96dpi — يُستعمل في حساب «ملاءمة العرض» */
  const PAGE_W_PX = 210 * (96 / 25.4);   // ≈ 793.7

  /** الوجهة المعتمدة للعودة إلى العرض */
  const BACK_ROUTE = { kind: "scene", id: "summary", params: {} };

  /* ══════════════════════════════════════════════════════════════════════════
     1) حالة الوحدة
     ══════════════════════════════════════════════════════════════════════════ */

  const state = {
    root: null,          // #report-root
    docEl: null,         // .rpt-doc — كومة الأوراق
    wrapEl: null,        // .rpt-doc-wrap — يحمل ارتفاع المستند بعد التكبير
    toolbarEl: null,
    model: null,
    planned: null,
    route: null,
    selected: null,      // معرفات صفحات الأقسام المعروضة
    rejected: [],        // معرفات مرفوضة من ‎?pages= — تُعلن بصدق
    zoom: DEFAULT_ZOOM,
    built: false,
    sheetEls: [],        // مرجع كل ورقة للفهرس والتمرير
    teardowns: [],       // مفكِّكات المستمعين
    wired: false,        // هل رُكّب مراقب hashchange مرة واحدة؟
    printing: false,
    prevZoom: null,
  };

  const reduced = () => !!(typeof window !== "undefined" && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ══════════════════════════════════════════════════════════════════════════
     2) أدوات صغيرة
     ══════════════════════════════════════════════════════════════════════════ */

  /** تخزين محلي متسامح: file:// قد يمنعه — السقوط الصامت إلى الافتراضي */
  function readZoom() {
    try {
      const v = RH.core.storage.local.getItem(ZOOM_KEY);
      const n = v == null ? NaN : parseFloat(v);
      if (Number.isFinite(n) && ZOOMS.indexOf(n) !== -1) return n;
    } catch (_e) { /* بيئة بلا تخزين */ }
    return DEFAULT_ZOOM;
  }
  function writeZoom(z) {
    try { RH.core.storage.local.setItem(ZOOM_KEY, String(z)); }
    catch (_e) { /* لا شيء — التفضيل يعيش للجلسة فقط */ }
  }

  /** زر شريط الأدوات بنمط `rpt-` (لا يرث `.btn` كي لا تخفيه print.css) */
  function toolBtn(label, opts) {
    const o = opts || {};
    return h("button", {
      type: "button",
      class: "rpt-btn" + (o.primary ? " is-primary" : "") + (o.quiet ? " is-quiet" : ""),
      onclick: o.onClick,
      title: o.title || null,
      "aria-label": o.ariaLabel || null,
      "aria-pressed": o.pressed == null ? null : (o.pressed ? "true" : "false"),
      disabled: o.disabled === true,
    }, o.icon ? h("span", { class: "rpt-btn-icon", "aria-hidden": "true" }, o.icon) : null,
      h("span", {}, String(label)));
  }

  /** إضافة مستمع مع تسجيل مفكِّكه — لا مستمع يبقى بعد `destroy()` */
  function on(target, evt, fn, capture) {
    if (!target || !target.addEventListener) return;
    target.addEventListener(evt, fn, !!capture);
    state.teardowns.push(() => {
      try { target.removeEventListener(evt, fn, !!capture); } catch (_e) { /* */ }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) بناة الكتل داخل الورقة
     ══════════════════════════════════════════════════════════════════════════ */

  /** بطاقة رقم بارز — القيمة منسّقة سلفاً في النموذج، لا تنسيق هنا */
  function renderFigure(fig) {
    return h("div", {
      class: "rpt-fig" + (fig.tone ? " is-" + fig.tone : ""),
    },
      h("div", { class: "rpt-fig-label" }, fig.label),
      h("div", { class: "rpt-fig-value" },
        h("b", { class: "rpt-fig-num" }, fmt.iso(fig.value)),
        fig.unit ? h("span", { class: "rpt-fig-unit" }, fig.unit) : null),
      fig.note ? h("div", { class: "rpt-fig-note" }, fig.note) : null,
    );
  }

  function renderFigures(list) {
    if (!list || !list.length) return null;
    const grid = h("div", {
      class: "rpt-figures",
      role: "list",
      "aria-label": "الأرقام البارزة",
    });
    for (const f of list) {
      const cardEl = renderFigure(f);
      cardEl.setAttribute("role", "listitem");
      grid.appendChild(cardEl);
    }
    return grid;
  }

  /** صف رسوم: عمود واحد للممتد/الطويل، وعمودان للقياسيين */
  function renderChartRow(row) {
    const wrap = h("div", {
      class: "rpt-chart-row",
      dataset: { count: String(row.length) },
    });
    const charts = RH.report.charts;
    for (const spec of row) {
      if (charts && typeof charts.figure === "function") {
        charts.figure(wrap, spec);
      } else {
        wrap.appendChild(h("div", { class: "rpt-chart-fail" },
          h("div", { class: "rpt-chart-fail-title" }, "تعذر إدراج الرسم"),
          h("p", { class: "rpt-chart-fail-reason" },
            "وحدة لقطات الرسوم (report-charts.js) غير مضمّنة في هذا البناء.")));
      }
    }
    return wrap;
  }

  /** كتلة الرؤى المعتمدة — نصوصها من `insight_panels` حرفياً */
  function renderInsights(list) {
    if (!list || !list.length) return null;
    const box = h("section", { class: "rpt-insights", "aria-label": "الرؤى المعتمدة" });
    box.appendChild(h("h3", { class: "rpt-block-title" }, "الرؤى المعتمدة"));
    for (const ins of list) {
      box.appendChild(h("div", { class: "rpt-insight is-" + (ins.cls || "neu") },
        h("div", { class: "rpt-insight-title" }, ins.title),
        h("p", { class: "rpt-insight-text" }, ins.text)));
    }
    return box;
  }

  /** وسوم الصدق — تُطبع بالكامل، لا اقتصاص ولا طيّ */
  function renderCaveats(list) {
    if (!list || !list.length) return null;
    const box = h("aside", {
      class: "rpt-caveats",
      "aria-label": "وسوم الصدق والقيود المنهجية",
    });
    box.appendChild(h("h3", { class: "rpt-block-title" }, "قيود ومنهجية"));
    for (const c of list) {
      box.appendChild(h("p", { class: "rpt-caveat" },
        h("span", { class: "rpt-caveat-mark", "aria-hidden": "true" }, "▪"),
        h("span", {}, String(c))));
    }
    return box;
  }

  /** خلية جدول: نص بسيط أو كائن بنغمة/رسم مصغر/خط أحادي */
  function renderCell(td, cellValue, colDef) {
    if (cellValue == null) { td.appendChild(document.createTextNode("—")); return; }
    if (typeof cellValue !== "object") {
      td.appendChild(document.createTextNode(String(cellValue)));
      return;
    }
    if (cellValue.tone) td.classList.add("t-" + cellValue.tone);
    if (cellValue.mono) td.classList.add("is-mono");
    if (cellValue.strong) td.classList.add("is-strong");
    const text = h("span", { class: "rpt-cell-text" }, String(cellValue.text));
    td.appendChild(text);
    if (cellValue.micro && RH.report.charts) {
      const holder = h("span", { class: "rpt-cell-micro" });
      td.appendChild(holder);
      renderMicro(holder, cellValue.micro, colDef);
    }
  }

  /** الرسوم المصغرة داخل الخلايا — SVG عبر RH.viz.micro، يطبع حاداً */
  function renderMicro(holder, micro, _colDef) {
    const C = RH.report.charts;
    if (!C) return;
    try {
      if (micro.kind === "ratio") {
        C.ratioCell(holder, micro.pct, {
          tone: micro.tone || "pos",
          fmt: () => "",                 // القيمة مطبوعة نصاً في الخلية نفسها
          ariaLabel: null,
        });
      } else if (micro.kind === "spark") {
        C.sparkCell(holder, micro.values, {
          tone: micro.tone || "pos", width: micro.width, height: micro.height,
        });
      } else if (micro.kind === "delta") {
        C.deltaCell(holder, micro.value, {
          positiveIsGood: micro.positiveIsGood !== false,
        });
      } else if (micro.kind === "bars") {
        C.barsCell(holder, micro.items, { tone: micro.tone || "pos" });
      }
    } catch (e) {
      console.warn("report: تعذر رسم عنصر مصغر في جدول — " + (e.message || e));
    }
  }

  /** كتلة جدول (أو قطعة منه) — الترويسة تتكرر في كل قطعة والوسم يسافر معها */
  function renderTable(t) {
    const box = h("section", { class: "rpt-table-block" });

    const head = h("div", { class: "rpt-table-head" },
      h("h3", { class: "rpt-table-title" }, t.title));
    if (t.parts > 1) {
      head.appendChild(h("span", { class: "rpt-table-part" },
        (t.continued ? "تابع — " : "")
        + "الجزء " + fmt.int(t.part) + " من " + fmt.int(t.parts)
        + (t.rows && t.rows.length
          ? " · الصفوف " + fmt.int(t.startIndex + 1) + "–" + fmt.int(t.endIndex + 1)
          : "")));
    }
    box.appendChild(head);

    const tbl = h("table", { class: "rpt-table" });
    const thead = h("thead", {});
    const trh = h("tr", {});
    for (const c of t.columns || []) {
      const label = typeof c === "string" ? c : c.label;
      const align = typeof c === "string" ? "start" : (c.align || "start");
      trh.appendChild(h("th", { scope: "col", class: "align-" + align }, label));
    }
    thead.appendChild(trh);
    tbl.appendChild(thead);

    const tbody = h("tbody", {});
    for (const row of t.rows || []) {
      const tr = h("tr", {});
      (t.columns || []).forEach((c, i) => {
        const align = typeof c === "string" ? "start" : (c.align || "start");
        const td = h(i === 0 ? "th" : "td", { class: "align-" + align });
        if (i === 0) td.setAttribute("scope", "row");
        renderCell(td, row[i], c);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    if (!(t.rows || []).length) {
      tbody.appendChild(h("tr", {},
        h("td", {
          class: "rpt-table-empty",
          colspan: String((t.columns || []).length || 1),
        }, "لا صفوف في هذا الجدول ضمن الإصدار الحالي")));
    }
    tbl.appendChild(tbody);
    box.appendChild(tbl);

    if (t.note) box.appendChild(h("p", { class: "rpt-table-note" }, String(t.note)));
    return box;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) تذييل الورقة — هوية الإصدار + التاريخ + الترقيم (عقد §3.3)
     ══════════════════════════════════════════════════════════════════════════ */

  function renderFooter(sheet, cover) {
    return h("footer", { class: "rpt-page-foot" },
      h("span", { class: "rpt-foot-release" },
        h("span", { class: "rpt-foot-id", dir: "ltr" }, cover.releaseId),
        h("span", { class: "rpt-foot-sep", "aria-hidden": "true" }, "·"),
        h("span", {}, "بيانات حتى " + cover.dataAsOf),
        cover.sha256Short
          ? [h("span", { class: "rpt-foot-sep", "aria-hidden": "true" }, "·"),
            h("span", { class: "rpt-foot-sha", dir: "ltr" }, cover.sha256Short)]
          : null),
      h("span", { class: "rpt-foot-title" }, sheet.kind === "cover"
        ? "الموجز التنفيذي" : sheet.title),
      h("span", { class: "rpt-foot-num" },
        "صفحة " + fmt.iso(fmt.int(sheet.n)) + " من " + fmt.iso(fmt.int(sheet.of))),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) ورقة الغلاف — الهوية والفهرس
     ══════════════════════════════════════════════════════════════════════════ */

  function renderCover(sheet, model, planned) {
    const cover = model.cover;
    const page = h("article", {
      class: "rpt-page is-cover",
      dataset: { page: "cover", sheet: String(sheet.n) },
      "aria-label": "الغلاف",
    });

    const body = h("div", { class: "rpt-page-body rpt-cover-body" });

    body.appendChild(h("div", { class: "rpt-cover-mark" },
      h("span", { class: "rpt-cover-rule", "aria-hidden": "true" }),
      h("span", { class: "rpt-cover-kind" }, "موجز تنفيذي · مستند مطبوع")));

    body.appendChild(h("h1", { class: "rpt-cover-title" }, cover.title));

    /* الجهة: `meta.entity` فارغة في هذا الإصدار — يُعلن الغياب ولا يُختلق اسم */
    body.appendChild(h("p", { class: "rpt-cover-entity" },
      cover.entity
        ? String(cover.entity)
        : "الجهة المالكة غير محددة في الإصدار — تُضبط من الإدارة قبل الاعتماد"));

    const meta = h("dl", { class: "rpt-cover-meta" });
    const metaRow = (k, v, extra) => {
      meta.appendChild(h("dt", {}, k));
      meta.appendChild(h("dd", {},
        h("span", { class: extra && extra.mono ? "is-mono" : null, dir: extra && extra.ltr ? "ltr" : null }, v),
        extra && extra.note ? h("span", { class: "rpt-cover-meta-note" }, extra.note) : null));
    };
    metaRow("هوية الإصدار", cover.releaseId, { mono: true, ltr: true, note: cover.statusLabel });
    metaRow("بصمة الإصدار", cover.sha256Short || "—",
      { mono: true, ltr: true, note: "sha256 — أول 12 محرفاً" });
    metaRow("حداثة البيانات", cover.dataAsOf, { note: "فترة الرصد: " + cover.monitoringPeriod });
    metaRow("خط الأساس", cover.baselineLabel);
    metaRow("تاريخ الحساب المرجعي",
      cover.calculationDate ? fmt.date(cover.calculationDate) : "—");
    metaRow("تاريخ توليد المستند", cover.generatedAtLabel);
    if (cover.presentationDate) {
      metaRow("تاريخ العرض", fmt.date(cover.presentationDate),
        cover.presentationDateNeedsConfirmation
          ? { note: "بانتظار التأكيد" } : null);
    }
    metaRow("عدد الأوراق", fmt.iso(fmt.int(planned.total)));
    body.appendChild(meta);

    if (cover.restricted) {
      const names = cover.selectedPages
        .map((id) => RH.report.pages.titleFor(id)).join("، ");
      body.appendChild(h("p", { class: "rpt-cover-restricted" },
        "هذا الموجز مطبوع باختيار محصور من صفحات الأقسام ("
        + fmt.iso(fmt.int(cover.selectedPages.length)) + " من "
        + fmt.iso(fmt.int(RH.report.pages.SECTION_PAGE_IDS.length)) + "): "
        + names
        + " — الغلاف وصفحة الإسناد إلزاميان ولا يُسقطان."));
    }

    /* فهرس المحتويات بأرقام الأوراق — أزرار حقيقية فهو تنقل لا زخرفة */
    const toc = h("nav", { class: "rpt-toc", "aria-label": "فهرس المحتويات" });
    toc.appendChild(h("h2", { class: "rpt-toc-title" }, "المحتويات"));
    const list = h("ol", { class: "rpt-toc-list" });
    for (const item of planned.contents) {
      const btn = h("button", {
        type: "button",
        class: "rpt-toc-link",
        onclick: () => gotoSheet(item.sheet),
      },
        h("span", { class: "rpt-toc-label" }, item.title),
        h("span", { class: "rpt-toc-dots", "aria-hidden": "true" }),
        h("span", { class: "rpt-toc-num" }, fmt.iso(fmt.int(item.sheet))));
      list.appendChild(h("li", {}, btn));
    }
    toc.appendChild(list);
    body.appendChild(toc);

    body.appendChild(h("p", { class: "rpt-cover-foot-note" },
      "كل رقم في هذا المستند من الإصدار المنشور أعلاه؛ أصل كل مقياس ورقةً "
      + "ومرساةً في صفحة الإسناد الأخيرة. القيم الموسومة تحمل وسمها أينما وردت."));

    page.appendChild(body);
    page.appendChild(renderFooter(sheet, cover));
    return page;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) ورقة قسم / إسناد
     ══════════════════════════════════════════════════════════════════════════ */

  function renderSheet(sheet, model) {
    const cover = model.cover;
    const page = h("article", {
      class: "rpt-page is-" + sheet.kind,
      dataset: { page: sheet.pageId, sheet: String(sheet.n) },
      "aria-label": sheet.title
        + (sheet.parts > 1 ? " — ورقة " + sheet.part + " من " + sheet.parts : ""),
    });

    const head = h("header", { class: "rpt-page-head" },
      h("div", { class: "rpt-page-head-main" },
        sheet.kicker ? h("div", { class: "rpt-kicker" }, sheet.kicker) : null,
        h("h2", { class: "rpt-page-title" }, sheet.title)),
      sheet.parts > 1
        ? h("div", { class: "rpt-page-part" },
          (sheet.continued ? "تابع · " : "")
          + "ورقة " + fmt.iso(fmt.int(sheet.part)) + " من "
          + fmt.iso(fmt.int(sheet.parts)))
        : null,
    );
    page.appendChild(head);

    const body = h("div", { class: "rpt-page-body" });

    const figs = renderFigures(sheet.figures);
    if (figs) body.appendChild(figs);

    for (const row of sheet.chartRows || []) {
      body.appendChild(renderChartRow(row));
    }

    const ins = renderInsights(sheet.insights);
    if (ins) body.appendChild(ins);

    const cav = renderCaveats(sheet.caveats);
    if (cav) body.appendChild(cav);

    for (const t of sheet.tables || []) body.appendChild(renderTable(t));

    page.appendChild(body);
    page.appendChild(renderFooter(sheet, cover));
    return page;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) شريط الأدوات (لا يُطبع)
     ══════════════════════════════════════════════════════════════════════════ */

  function renderToolbar(model, planned) {
    const bar = h("div", {
      class: "rpt-toolbar",
      role: "toolbar",
      "aria-label": "أدوات الموجز التنفيذي",
    });

    const left = h("div", { class: "rpt-toolbar-group" });
    const mid = h("div", { class: "rpt-toolbar-status" });
    const right = h("div", { class: "rpt-toolbar-group" });

    right.appendChild(toolBtn("طباعة / حفظ PDF", {
      primary: true,
      icon: "⎙",
      title: "يفتح حوار الطباعة — اختر «حفظ كـ PDF» لإخراج ملف",
      onClick: () => printDocument(),
    }));
    right.appendChild(toolBtn("العودة إلى العرض", {
      icon: "↩",
      title: "الخروج من وضع الموجز والعودة إلى لوحة الملخص التنفيذي",
      onClick: () => RH.core.router.go(BACK_ROUTE),
    }));

    /* تكبير المعاينة — لا أثر له على الطباعة إطلاقاً */
    const zoomOut = toolBtn("−", {
      quiet: true, ariaLabel: "تصغير المعاينة",
      onClick: () => stepZoom(-1),
    });
    const zoomLabel = h("span", {
      class: "rpt-zoom-label",
      role: "status",
      "aria-live": "polite",
    }, "");
    const zoomIn = toolBtn("+", {
      quiet: true, ariaLabel: "تكبير المعاينة",
      onClick: () => stepZoom(1),
    });
    const zoomFit = toolBtn("ملاءمة العرض", {
      quiet: true,
      title: "يضبط التكبير كي تملأ الورقة عرض النافذة",
      onClick: () => fitZoom(),
    });
    left.appendChild(h("span", { class: "rpt-zoom" },
      h("span", { class: "rpt-zoom-cap" }, "المعاينة"),
      zoomOut, zoomLabel, zoomIn, zoomFit));
    state.zoomLabelEl = zoomLabel;

    /* الحالة: عدد الأوراق + حصر الصفحات + جرد الرسوم — كلها بصدق */
    const bits = [];
    bits.push(fmt.int(planned.total) + (planned.total === 1 ? " ورقة" : " ورقة A4"));
    bits.push(fmt.int(model.pages.length + 2) + " صفحة منطقية");
    mid.appendChild(h("span", { class: "rpt-status-main" }, bits.join(" · ")));

    if (model.cover.restricted) {
      const names = model.cover.selectedPages
        .map((id) => RH.report.pages.titleFor(id)).join("، ");
      mid.appendChild(h("span", { class: "rpt-status-restricted" },
        "اختيار محصور: " + names));
      mid.appendChild(toolBtn("عرض كل الصفحات", {
        quiet: true,
        onClick: () => RH.core.router.go({ kind: "report", id: "main", params: {} }),
      }));
    }
    if (state.rejected && state.rejected.length) {
      mid.appendChild(h("span", { class: "rpt-status-warn" },
        "معرفات صفحات مجهولة في الرابط تُجوهلت: " + state.rejected.join("، ")));
    }

    const inv = RH.report.charts && RH.report.charts.inventory
      ? RH.report.charts.inventory() : null;
    if (inv && inv.failedCount) {
      mid.appendChild(h("span", { class: "rpt-status-warn" },
        RH.report.charts.inventoryLabel()
        + " — بطاقات التعذر مطبوعة في مواضعها."));
    }

    bar.appendChild(right);
    bar.appendChild(mid);
    bar.appendChild(left);
    return bar;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) التكبير والتمرير
     ══════════════════════════════════════════════════════════════════════════ */

  function applyZoom(z) {
    state.zoom = z;
    if (!state.docEl) return;
    state.docEl.style.setProperty("--rpt-zoom", String(z));
    syncDocHeight();
    if (state.zoomLabelEl) {
      state.zoomLabelEl.textContent = fmt.iso(String(Math.round(z * 100)) + "٪");
    }
  }

  /** المستند مكبَّر بـ`transform` فلا يتغير حيزه التخطيطي — نضبط ارتفاع
      الغلاف يدوياً كي لا يبقى فراغ ضخم أسفل الصفحة عند التصغير. */
  function syncDocHeight() {
    if (!state.docEl || !state.wrapEl) return;
    const nat = state.docEl.offsetHeight || 0;
    if (!nat) return;
    state.wrapEl.style.height = Math.ceil(nat * state.zoom) + "px";
  }

  function stepZoom(dir) {
    const i = ZOOMS.indexOf(state.zoom);
    const base = i === -1 ? ZOOMS.indexOf(DEFAULT_ZOOM) : i;
    const next = Math.max(0, Math.min(ZOOMS.length - 1, base + dir));
    applyZoom(ZOOMS[next]);
    writeZoom(ZOOMS[next]);
  }

  /** يختار أقرب مستوى معتمد يُلائم عرض النافذة (لا قيمة حرة — تبقى القائمة
      المعتمدة كي يظل عرض الرسوم متوقعاً عبر الجلسات) */
  function fitZoom() {
    if (!state.root) return;
    const avail = (state.root.clientWidth || window.innerWidth || PAGE_W_PX) - 48;
    const want = avail / PAGE_W_PX;
    let best = ZOOMS[0];
    for (const z of ZOOMS) if (z <= want) best = z;
    applyZoom(best);
    writeZoom(best);
  }

  /** تمرير إلى ورقة برقمها — يحترم prefers-reduced-motion */
  function gotoSheet(n) {
    const el = state.sheetEls[n - 1];
    if (!el) return;
    try {
      el.scrollIntoView({
        behavior: reduced() ? "auto" : "smooth",
        block: "start",
      });
    } catch (_e) {
      el.scrollIntoView();
    }
    // تركيز مقروء لقارئات الشاشة دون حلقة تركيز دائمة
    el.setAttribute("tabindex", "-1");
    try { el.focus({ preventScroll: true }); } catch (_e) { el.focus(); }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) الطباعة
     ══════════════════════════════════════════════════════════════════════════ */

  /** الطباعة تُلغي التكبير مؤقتاً وتعيد قياس الرسوم كي تخرج على مقاسها الكامل */
  function beforePrint() {
    if (state.printing) return;
    state.printing = true;
    state.prevZoom = state.zoom;
    if (state.docEl) {
      state.docEl.style.setProperty("--rpt-zoom", "1");
      if (state.wrapEl) state.wrapEl.style.height = "";
    }
    document.body.classList.add("rpt-printing");
    if (RH.report.charts && RH.report.charts.resizeAll) RH.report.charts.resizeAll();
  }

  function afterPrint() {
    if (!state.printing) return;
    state.printing = false;
    document.body.classList.remove("rpt-printing");
    if (state.prevZoom != null) applyZoom(state.prevZoom);
    state.prevZoom = null;
    if (RH.report.charts && RH.report.charts.resizeAll) RH.report.charts.resizeAll();
  }

  /** الطباعة اليدوية: نمر بالمسار نفسه الذي يسلكه Ctrl+P كي لا يختلف الخرجان */
  function printDocument() {
    beforePrint();
    try {
      window.print();
    } catch (e) {
      console.warn("report: تعذر فتح حوار الطباعة — " + (e.message || e));
    }
    // المتصفحات التي لا تطلق afterprint (بعض بيئات file://) تُعاد يدوياً
    if (typeof window.onafterprint === "undefined") {
      setTimeout(afterPrint, 400);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) بطاقة البناء الجزئي
     ══════════════════════════════════════════════════════════════════════════ */

  function renderMissingModule(root, moduleName, file) {
    clear(root);
    root.appendChild(h("div", { class: "rpt-missing" },
      h("h1", {}, "وحدة الموجز غير مكتملة في هذا البناء"),
      h("p", {},
        "الجزء الغائب: " + moduleName + " (" + file + "). "
        + "المستند لا يُبنى جزئياً كي لا يُقرأ ناقصاً دون أن يُعلن نقصه."),
      h("button", {
        type: "button", class: "rpt-btn is-primary",
        onclick: () => RH.core.router.go(BACK_ROUTE),
      }, "العودة إلى العرض")));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) البناء الكامل — show(root, route)
     ══════════════════════════════════════════════════════════════════════════ */

  function show(rootEl, route) {
    if (!rootEl) return;
    // الجذر نفسه يُسلَّم في كل دخول — التفريغ والتخلص مسؤوليتنا
    teardown();
    state.root = rootEl;
    state.route = route || null;
    clear(rootEl);

    if (!RH.report.pages || typeof RH.report.pages.model !== "function") {
      renderMissingModule(rootEl, "نموذج الصفحات", "src/js/report/report-pages.js");
      return;
    }
    if (!RH.report.charts || typeof RH.report.charts.snapshot !== "function") {
      renderMissingModule(rootEl, "لقطات الرسوم", "src/js/report/report-charts.js");
      return;
    }

    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const geo = (typeof window !== "undefined" && window.GEO) ? window.GEO : null;

    const raw = (route && route.params && route.params.pages) || null;
    state.selected = RH.report.pages.normalizePages(raw);
    state.rejected = RH.report.pages.rejectedPages(raw);

    let model, planned;
    try {
      model = RH.report.pages.model(rel, der, {
        pages: raw, geo, now: new Date(),
      });
      planned = RH.report.pages.plan(model, {});
    } catch (e) {
      clear(rootEl);
      rootEl.appendChild(h("div", { class: "rpt-missing" },
        h("h1", {}, "تعذر بناء نموذج الموجز"),
        h("p", {}, String((e && e.message) || e)),
        h("button", {
          type: "button", class: "rpt-btn is-primary",
          onclick: () => RH.core.router.go(BACK_ROUTE),
        }, "العودة إلى العرض")));
      console.warn("report.show:", e);
      return;
    }
    state.model = model;
    state.planned = planned;

    /* رابط تخطٍ لقارئات الشاشة ولوحة المفاتيح — أول عنصر قابل للتركيز */
    rootEl.appendChild(h("a", {
      class: "rpt-skip",
      href: "#rpt-doc",
      onclick: (e) => {
        e.preventDefault();
        gotoSheet(1);
      },
    }, "تخطٍ إلى المستند"));

    /* شريط الأدوات يُبنى قبل الأوراق كي يظهر فوراً، ثم يُحدَّث جرد الرسوم بعدها */
    const toolbar = renderToolbar(model, planned);
    state.toolbarEl = toolbar;
    rootEl.appendChild(toolbar);

    const wrap = h("div", { class: "rpt-doc-wrap" });
    const doc = h("div", {
      class: "rpt-doc",
      id: "rpt-doc",
      role: "region",
      "aria-label": "أوراق الموجز التنفيذي",
    });
    state.wrapEl = wrap;
    state.docEl = doc;
    wrap.appendChild(doc);
    rootEl.appendChild(wrap);

    state.sheetEls = [];
    for (const sheet of planned.sheets) {
      const el = sheet.kind === "cover"
        ? renderCover(sheet, model, planned)
        : renderSheet(sheet, model);
      doc.appendChild(el);
      state.sheetEls.push(el);
    }

    /* جرد الرسوم لا يُعرف إلا بعد البناء — نعيد بناء شريط الحالة مرة واحدة */
    refreshToolbarStatus();

    state.zoom = readZoom();
    applyZoom(state.zoom);

    wire();
    state.built = true;
  }

  /** يعيد بناء شريط الأدوات بعد اكتمال الرسوم (ليعلن التعذر إن وقع) */
  function refreshToolbarStatus() {
    if (!state.toolbarEl || !state.model || !state.planned) return;
    const fresh = renderToolbar(state.model, state.planned);
    if (state.toolbarEl.parentNode) {
      state.toolbarEl.parentNode.replaceChild(fresh, state.toolbarEl);
    }
    state.toolbarEl = fresh;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) الربط والتفكيك
     ══════════════════════════════════════════════════════════════════════════ */

  function wire() {
    // مستمعو الجلسة الحالية (تُفكّ في teardown)
    on(window, "beforeprint", beforePrint);
    on(window, "afterprint", afterPrint);
    on(window, "resize", onResize);

    // مطبوعة قديمة: بعض المتصفحات لا تطلق before/afterprint بل matchMedia
    if (window.matchMedia) {
      const mq = window.matchMedia("print");
      const handler = (e) => { if (e.matches) beforePrint(); else afterPrint(); };
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handler);
        state.teardowns.push(() => {
          try { mq.removeEventListener("change", handler); } catch (_e) { /* */ }
        });
      }
    }

    // مراقب مغادرة الوضع — يُركَّب مرة واحدة ويبقى (app.js لا يستدعي destroy)
    if (!state.wired) {
      state.wired = true;
      window.addEventListener("hashchange", onHashChange);
      RH.core.bus.on("release:changed", onReleaseChanged);
    }
  }

  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      syncDocHeight();
      if (RH.report.charts && RH.report.charts.resizeAll) RH.report.charts.resizeAll();
    }, 140);
  }

  /** مغادرة `#/report` ⇒ تنظيف ذاتي كامل */
  function onHashChange() {
    if (!state.built) return;
    let route = null;
    try { route = RH.core.router.parse(); } catch (_e) { route = null; }
    if (!route || route.kind !== "report") {
      destroy();
      return;
    }
    /* بقاء في الوضع مع تغيّر ‎?pages= ⇒ إعادة بناء (app.js يستدعي show أيضاً،
       ونحن نتسامح مع الاستدعاء المزدوج لأن show يفكك أولاً) */
    const raw = (route.params && route.params.pages) || null;
    const next = RH.report.pages.normalizePages(raw);
    if (String(next) !== String(state.selected) && state.root) {
      show(state.root, route);
    }
  }

  /** نشر إصدار جديد أثناء فتح الموجز ⇒ إعادة بناء بالأرقام الجديدة */
  function onReleaseChanged() {
    if (!state.built || !state.root) return;
    show(state.root, state.route);
  }

  /** تفكيك الجلسة: مثائل الرسوم + المستمعون المؤقتون (يبقى مراقب hashchange) */
  function teardown() {
    for (const fn of state.teardowns) {
      try { fn(); } catch (_e) { /* مفكِّك لا يُسقط تفكيكاً */ }
    }
    state.teardowns = [];
    clearTimeout(resizeTimer);
    if (RH.report.charts && RH.report.charts.disposeAll) {
      RH.report.charts.disposeAll();
    }
    if (state.printing) {
      state.printing = false;
      try { document.body.classList.remove("rpt-printing"); } catch (_e) { /* */ }
    }
    state.sheetEls = [];
    state.docEl = null;
    state.wrapEl = null;
    state.toolbarEl = null;
    state.zoomLabelEl = null;
  }

  /** يفرّغ الجذر ويتخلص من كل شيء — يستدعيه المراقب الذاتي عند مغادرة الوضع */
  function destroy() {
    teardown();
    if (state.root) {
      try { clear(state.root); } catch (_e) { /* */ }
    }
    state.model = null;
    state.planned = null;
    state.selected = null;
    state.rejected = [];
    state.built = false;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     13) الواجهة العامة
     ──────────────────────────────────────────────────────────────────────────
     تُسنَد مفاتيحها على `RH.report` القائم (الذي أنشأه report-charts.js بـ
     `charts` وreport-pages.js بـ`pages`) بدل استبداله — فتبقى إشارة الوجود
     التي تفحصها النواة (`typeof RH.report.show === "function"`) صادقة تماماً:
     لا تتحقق إلا بضمّ هذا الملف بالذات.
     ══════════════════════════════════════════════════════════════════════════ */

  RH.report.show = show;
  RH.report.destroy = destroy;
  RH.report.printDocument = printDocument;
  RH.report.gotoSheet = gotoSheet;
  RH.report.setZoom = (z) => {
    if (ZOOMS.indexOf(z) === -1) return false;
    applyZoom(z); writeZoom(z); return true;
  };
  RH.report.ZOOMS = ZOOMS;
  RH.report.state = () => ({
    built: state.built,
    zoom: state.zoom,
    sheets: state.planned ? state.planned.total : 0,
    selected: state.selected ? state.selected.slice() : null,
    rejected: state.rejected.slice(),
    printing: state.printing,
  });
})();
