/* layout.js — مساعدات تخطيط لوحات القيادة (عقد V2_CONTRACTS §2)
   ─────────────────────────────────────────────────────────────
   كل قسم لوحة كثيفة: شريط مؤشرات كبرى، شبكة بطاقات ورسوم، عمود رؤى.
   هذه المساعدات هي اللغة الوحيدة للبناء — لا HTML حر متناثر في الأقسام.
   القيم الممررة إلى kpiStrip/statCard منسقة سلفاً عبر RH.core.fmt (عقد ملزم)،
   والنصوص كلها تمر عبر عقد dom.h النصي (لا innerHTML لمحتوى الإصدار). */
"use strict";

RH.presenter.layout = (function () {
  const { h } = RH.core.dom;

  const TONES = ["pos", "neg", "warn", "neu", "gold"];
  const toneCls = (t) => (t && TONES.includes(t) ? " " + t : "");

  /** ترويسة القسم: سطر السياق الذهبي + العنوان + وسم اختياري + سطر ثانوي */
  function sectionHeader(el, opts) {
    const head = h("div", { class: "dash-head" },
      h("div", { class: "dash-head-main" },
        opts.kicker ? h("div", { class: "dash-kicker" }, opts.kicker) : null,
        h("h2", { class: "dash-title" }, opts.title || ""),
      ),
      (opts.badge || opts.meta) ? h("div", { class: "dash-head-side" },
        opts.badge ? h("span", { class: "dash-badge" }, opts.badge) : null,
        opts.meta ? h("span", { class: "dash-meta" }, opts.meta) : null,
      ) : null,
    );
    el.appendChild(head);
    return head;
  }

  /** شريط المؤشرات الكبرى أعلى اللوحة — 4 إلى 6 أرقام ضخمة tabular.
      item: {label, value(منسقة سلفاً), unit?, delta?{text,tone}, tone?, note?,
             countTo?, fmt?, key?} — countTo يفعّل العد التصاعدي عند أول دخول. */
  function kpiStrip(el, items) {
    const strip = h("div", { class: "kpi-strip", role: "list" });
    for (const it of items || []) {
      const numEl = h("span", { class: "kpi-num" }, it.value != null ? it.value : "—");
      if (typeof it.countTo === "number" && typeof it.fmt === "function") {
        RH.viz.motion.countUp(numEl, it.countTo, it.fmt,
          it.key || null, it.duration || 900);
      }
      strip.appendChild(h("div", {
        class: "kpi" + toneCls(it.tone),
        role: "listitem",
      },
        h("div", { class: "kpi-label" }, it.label || ""),
        h("div", { class: "kpi-value" },
          numEl,
          it.unit ? h("span", { class: "kpi-unit" }, it.unit) : null,
        ),
        it.delta ? h("div", { class: "kpi-delta" + toneCls(it.delta.tone) },
          it.delta.text) : null,
        it.note ? h("div", { class: "kpi-note" }, it.note) : null,
      ));
    }
    el.appendChild(strip);
    return strip;
  }

  /** شبكة اللوحة: cols عموداً (افتراضي 12) وصفوف اختيارية متساوية الارتفاع.
      cell({span, rows, cls, card}) يعيد مضيف الخلية للبناء داخله. */
  function grid(el, opts) {
    const o = opts || {};
    const cols = o.cols || 12;
    const root = h("div", {
      class: "dash-grid" + (o.cls ? " " + o.cls : ""),
      style: Object.assign({
        gridTemplateColumns: "repeat(" + cols + ", minmax(0, 1fr))",
      },
      o.rows ? { gridTemplateRows: "repeat(" + o.rows + ", minmax(0, 1fr))" } : {},
      o.gap != null ? { gap: "calc(var(--su) * " + o.gap + ")" } : {}),
    });
    el.appendChild(root);
    function cell(co) {
      const c = co || {};
      const cellEl = h("div", {
        class: "dash-cell" + (c.card ? " dash-card" : "") + (c.cls ? " " + c.cls : ""),
        style: Object.assign(
          { gridColumn: "span " + (c.span || 1) },
          (c.rows || 1) > 1 ? { gridRow: "span " + c.rows } : {},
        ),
      });
      root.appendChild(cellEl);
      return cellEl;
    }
    return { el: root, cell };
  }

  /** بطاقة زجاجية عامة: ترويسة اختيارية + جسم. tone يلوّن خيط الحافة العلوية. */
  function card(el, opts) {
    const o = opts || {};
    const body = h("div", { class: "card-body" + (o.pad === false ? " no-pad" : "") });
    let head = null;
    if (o.title || o.sub) {
      /* النص الكامل في تلميح title — السطر الثانوي مقصوص على سطرين CSSياً */
      head = h("div", { class: "card-head" },
        h("div", { class: "card-title", title: o.title || "" }, o.title || ""),
        o.sub ? h("div", { class: "card-sub", title: o.sub }, o.sub) : null,
      );
    }
    const cardEl = h("div", {
      class: "dash-card" + toneCls(o.tone) + (o.cls ? " " + o.cls : ""),
    }, head, body);
    el.appendChild(cardEl);
    return { card: cardEl, head, body };
  }

  /** بطاقة رسم: الجسم مضيف .chart-host يمرر مباشرة لمُنشئ RH.viz.charts2 */
  function chartCard(el, opts) {
    const o = opts || {};
    const res = card(el, {
      title: o.title, sub: o.sub, cls: "chart-card" + (o.cls ? " " + o.cls : ""),
      pad: false,
    });
    const host = h("div", { class: "chart-host" });
    res.body.appendChild(host);
    return { card: res.card, body: host };
  }

  /** بطاقة إحصاء مدمجة للأرقام الثانوية داخل الشبكة */
  function statCard(el, opts) {
    const o = opts || {};
    const elx = h("div", { class: "stat-card" + toneCls(o.tone) },
      h("div", { class: "stat-label" }, o.label || ""),
      h("div", { class: "stat-value" },
        h("span", { class: "stat-num" }, o.value != null ? o.value : "—"),
        o.unit ? h("span", { class: "stat-unit" }, o.unit) : null,
      ),
      o.foot ? h("div", { class: "stat-foot" }, o.foot) : null,
    );
    el.appendChild(elx);
    return elx;
  }

  /** جدول كثيف داخل بطاقة. الأعمدة: {key, label, align?, render?(row)}.
      بلا render تُعرض row[key] نصياً — الأرقام تُنسق في render عبر fmt حصراً. */
  function tableCard(el, opts) {
    const o = opts || {};
    const thead = h("thead", {}, h("tr", {},
      (o.columns || []).map((c) => h("th", {
        style: c.align ? { textAlign: c.align } : null, scope: "col",
      }, c.label))));
    const tbody = h("tbody", {});
    for (const row of o.rows || []) {
      tbody.appendChild(h("tr", {},
        (o.columns || []).map((c) => {
          const v = c.render ? c.render(row) : row[c.key];
          return h("td", { style: c.align ? { textAlign: c.align } : null }, v);
        })));
    }
    const table = h("table", { class: "table-dense" }, thead, tbody);
    const res = card(el, { title: o.title, cls: "table-card" + (o.cls ? " " + o.cls : "") });
    res.body.appendChild(h("div", { class: "table-scroll" }, table));
    if (o.note) res.body.appendChild(h("div", { class: "card-note" }, o.note));
    return { card: res.card, table };
  }

  /** عمود الرؤى: يقرأ release.insight_panels.sections[key] — لا اختلاق رؤى:
      مفتاح غائب أو فارغ → null بصمت (القسم يقرر بديله المشروع). */
  function insightRail(el, sectionKey, opts) {
    const o = opts || {};
    const rel = RH.data.store.release();
    const panels = rel.insight_panels && rel.insight_panels.sections
      && rel.insight_panels.sections[sectionKey];
    if (!panels || !panels.length) return null;
    const rail = h("aside", {
      class: "rail" + (o.compact ? " compact" : ""),
      role: "complementary", "aria-label": o.title || "رؤى تحليلية",
    },
      h("div", { class: "rail-title" }, o.title || "رؤى تحليلية"),
      panels.map((p) => h("div", {
        class: "rail-item " + (["pos", "neg", "warn", "neu"].includes(p.cls) ? p.cls : "neu"),
      },
        h("div", { class: "rail-item-title" }, p.title),
        /* النص الكامل في التلميح دوماً — الأقسام التي تقص النص لأسطر
           محدودة (قصّ معلن بعلامة …) لا تفقد المحتوى (مراجعة الجولة 3) */
        h("div", { class: "rail-item-text", title: p.text }, p.text),
      )),
    );
    el.appendChild(rail);
    return rail;
  }

  /** الحالة الصادقة «قيد الاعتماد/غير متوفر» — بطاقة مدمجة داخل اللوحة،
      ممنوع أن تتحول شاشة كاملة (حكم العميل على V1). */
  function pendingCard(el, opts) {
    const o = opts || {};
    const elx = h("div", { class: "pending-card" },
      h("span", { class: "pending-dot", "aria-hidden": "true" }),
      h("div", { class: "pending-body" },
        h("div", { class: "pending-label" }, o.label || "بانتظار الاعتماد"),
        o.note ? h("div", { class: "pending-note" }, o.note) : null,
      ),
    );
    el.appendChild(elx);
    return elx;
  }

  return {
    sectionHeader, kpiStrip, grid, card, chartCard,
    statCard, tableCard, insightRail, pendingCard,
  };
})();
