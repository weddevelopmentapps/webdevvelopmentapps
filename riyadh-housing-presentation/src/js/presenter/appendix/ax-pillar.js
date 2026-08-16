/* ax-pillar.js — ملحق تفصيل الركيزة (appendix/pillar/<pillarId>)
   ثلاث صفحات عند اعتماد المصدر: 1) حلقة نسبة إنجاز الركيزة 2) جدول المبادرات
   حسب الحالة 3) الانحرافات الرئيسة (متأخرة/متعثرة فقط). عند غياب الاعتماد أو
   ركيزة غير موجودة: صفحة حالة اعتماد شريفة — لا ركائز ملفّقة ولا أصفار زائفة.
   كل قيمة من store.release()/der() حصراً وكل رقم ظاهر عبر RH.core.fmt. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** المسار يصل كـ appendix/pillar/<pillarId> */
  const pillarId = (ctx) => (ctx.route.id.split("/")[1] || "");

  const pillarOf = (st, id) =>
    st.pillars ? st.pillars.find((p) => p.id === id) : null;

  const initiativesOf = (st, id) =>
    (st.initiatives || []).filter((i) => i.pillar_id === id);

  /** حالات الجدول المعدودة انحرافاً — حصراً */
  const DEVIATION_STATUSES = ["متأخرة", "متعثرة"];

  function pendingGlyph() {
    return svg("svg", {
      viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
      "stroke-width": 1.1, "stroke-linecap": "round", "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
      svg("circle", { cx: 12, cy: 12, r: 9, "stroke-dasharray": "4 3" }),
      svg("path", { d: "M12 7v5l3 3" }),
    );
  }

  /* ── صفحة الحالة الشريفة: مصدر غير معتمد أو ركيزة غير موجودة ─────────── */
  function pagePending(el, ctx) {
    const st = RH.data.store.release().strategy;
    const id = pillarId(ctx);
    const notApproved = st.status !== "approved" || !(st.pillars || []).length;

    el.appendChild(h("div", { class: "pending-scene" },
      h("div", { class: "glyph" }, pendingGlyph()),
      notApproved
        ? h("h2", {}, "تُستكمل تفاصيل الركائز فور اعتماد مصدرها الرسمي")
        : h("h2", {}, "الركيزة المطلوبة غير مدرجة في الإصدار المنشور"),
      notApproved
        ? h("p", {},
          "تعريفات الركائز والمبادرات وأوزانها ونسب إنجازها مملوكة للوثيقة المعتمدة ",
          h("span", { class: "src-name" }, "«" + st.source_required + "»"),
          "، ولم تُرفَق بعد. تعرض هذه الشاشة الحالة بأمانة بدل أي أرقام تقديرية، ويُستكمل النشر من الإدارة فور ورود الوثيقة.")
        : h("p", {},
          "المعرّف ", h("span", { class: "ltr" }, id),
          " غير موجود ضمن ركائز الإصدار الحالي. يمكن العودة إلى المبادرات واختيار ركيزة من الكوكبة."),
    ));
  }

  /* ── الصفحة 1: نسبة إنجاز الركيزة — حلقة كبيرة ────────────────────────── */
  function pageRing(el, ctx) {
    const st = RH.data.store.release().strategy;
    const id = pillarId(ctx);
    const p = pillarOf(st, id);
    const pv = RH.data.store.der().strategy.pillars[id] || null;
    const pctVal = pv && pv.progress_pct != null ? pv.progress_pct : null;
    const inis = initiativesOf(st, id);

    const W = 1500, H = 620;
    const cx = W / 2, cy = H / 2;
    const root = svg("svg", {
      class: "constellation", viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": p.name + " — نسبة إنجاز الركيزة: " +
        (pctVal != null ? fmt.pct(pctVal) : "غير متاحة"),
    });
    root.appendChild(svg("circle", { cx, cy, r: 236, class: "ring-core" }));
    RH.viz.rings.ring(root, cx, cy, 210, pctVal, { stroke: 22, animate: true });
    root.appendChild(svg("text", {
      x: cx, y: cy - 52, class: "pname", "font-size": 30, fill: "#93A096",
    }, "نسبة إنجاز الركيزة"));
    root.appendChild(svg("text", {
      x: cx, y: cy + 62, class: "ppct", "font-size": 116,
    }, pctVal != null ? fmt.pct(pctVal) : "—"));
    root.appendChild(svg("text", {
      x: cx, y: cy + 316, class: "pname", "font-size": 38,
    }, p.name));
    el.appendChild(h("div", { class: "chart-area" }, root));

    // سطر الاسم والحالة: حالة الركيزة إن اعتُمدت، وإلا توزيع حالات التنفيذ الفعلي
    const note = h("div", { class: "ax-note" },
      "الركيزة: ", h("b", {}, p.name), " · ",
      fmt.noun(inis.length, "initiative"), " ضمن الركيزة");
    if (p.status) {
      note.appendChild(document.createTextNode(" · الحالة: "));
      note.appendChild(h("b", {}, p.status));
    } else if (inis.length) {
      const counts = {};
      for (const i of inis) {
        if (i.execution_status) counts[i.execution_status] = (counts[i.execution_status] || 0) + 1;
      }
      const entries = Object.entries(counts);
      if (entries.length) {
        note.appendChild(document.createTextNode(" · حالات التنفيذ: "));
        entries.forEach(([k, v], idx) => {
          if (idx > 0) note.appendChild(document.createTextNode("، "));
          note.appendChild(document.createTextNode(k + " "));
          note.appendChild(h("b", {}, fmt.int(v)));
        });
      }
    }
    if (pctVal == null) {
      note.appendChild(document.createTextNode(
        " · النسبة الدقيقة محجوبة حتى اعتماد الأوزان ونسب الإنجاز لكل مبادرة."));
    }
    el.appendChild(note);
  }

  /* ── الصفحة 2: المبادرات حسب الحالة — جدول ────────────────────────────── */
  function pageInitiatives(el, ctx) {
    const st = RH.data.store.release().strategy;
    const id = pillarId(ctx);
    const p = pillarOf(st, id);
    const rows = initiativesOf(st, id);

    if (!rows.length) {
      el.appendChild(h("div", {
        class: "ax-note",
        style: { flex: "1", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "calc(var(--su)*24)" },
      }, "لا مبادرات مسجلة ضمن هذه الركيزة في الإصدار المنشور."));
      return;
    }

    // العمودان الاختياريان يظهران فقط إذا اعتُمدت حقولهما في الإصدار
    const hasOwner = rows.some((r) => r.owner);
    const hasDue = rows.some((r) => r.due_date);
    const heads = ["المبادرة", "نسبة الإنجاز", "حالة التنفيذ", "حالة الجدول"]
      .concat(hasOwner ? ["الجهة المسؤولة"] : [])
      .concat(hasDue ? ["تاريخ الاستحقاق"] : []);

    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        heads.map((t) => h("th", { scope: "col" }, t)))),
      h("tbody", {}, rows.map((r) => h("tr", {},
        h("td", {}, r.name),
        h("td", { class: "num" },
          typeof r.progress_percent === "number"
            ? h("span", { class: "ltr" }, fmt.pct(r.progress_percent))
            : "—"),
        h("td", {}, r.execution_status || "—"),
        h("td", {}, DEVIATION_STATUSES.includes(r.schedule_status)
          ? h("span", { style: { color: "var(--coral)", fontWeight: "600" } }, r.schedule_status)
          : (r.schedule_status || "—")),
        hasOwner ? h("td", {}, r.owner || "—") : null,
        hasDue ? h("td", { class: "num" }, r.due_date ? fmt.date(r.due_date) : "—") : null,
      ))),
    ));

    el.appendChild(h("div", { class: "ax-note" },
      h("b", {}, fmt.noun(rows.length, "initiative")),
      " ضمن ركيزة «", p.name, "» · المصدر: ", st.source_required, ".",
    ));
  }

  /* ── الصفحة 3: الانحرافات الرئيسة — متأخرة/متعثرة حصراً ──────────────── */
  function pageDeviations(el, ctx) {
    const st = RH.data.store.release().strategy;
    const id = pillarId(ctx);
    const rows = initiativesOf(st, id)
      .filter((i) => DEVIATION_STATUSES.includes(i.schedule_status));

    if (!rows.length) {
      el.appendChild(h("div", {
        class: "ax-note",
        style: { flex: "1", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "calc(var(--su)*24)" },
      }, "لا انحرافات مسجلة ضمن هذه الركيزة."));
      return;
    }

    const hasOwner = rows.some((r) => r.owner);
    const heads = ["المبادرة", "حالة الجدول", "حالة التنفيذ", "نسبة الإنجاز"]
      .concat(hasOwner ? ["الجهة المسؤولة"] : []);

    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        heads.map((t) => h("th", { scope: "col" }, t)))),
      h("tbody", {}, rows.map((r) => h("tr", {},
        h("td", {}, r.name),
        h("td", {}, h("span", {
          style: { color: "var(--coral)", fontWeight: "600" },
        }, r.schedule_status)),
        h("td", {}, r.execution_status || "—"),
        h("td", { class: "num" },
          typeof r.progress_percent === "number"
            ? h("span", { class: "ltr" }, fmt.pct(r.progress_percent))
            : "—"),
        hasOwner ? h("td", {}, r.owner || "—") : null,
      ))),
    ));

    el.appendChild(h("div", { class: "ax-note" },
      h("b", {}, fmt.noun(rows.length, "initiative")),
      " بحالة جدول متأخرة أو متعثرة ضمن هذه الركيزة — تتطلب متابعة تنفيذية.",
    ));
  }

  RH.presenter.ax.register({
    id: "pillar",
    kicker: "ملحق الاستراتيجية",
    title: "تفصيل الركيزة",
    returnLabel: "العودة إلى المبادرات",
    pages: (ctx) => {
      const st = RH.data.store.release().strategy;
      const approved = st.status === "approved" && (st.pillars || []).length;
      if (!approved || !pillarOf(st, pillarId(ctx))) {
        return [{ name: "حالة الاعتماد", build: pagePending }];
      }
      return [
        { name: "نسبة إنجاز الركيزة", build: pageRing },
        { name: "المبادرات حسب الحالة", build: pageInitiatives },
        { name: "الانحرافات الرئيسة", build: pageDeviations },
      ];
    },
  });
})();
