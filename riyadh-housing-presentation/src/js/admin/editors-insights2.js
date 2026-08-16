/* editors-insights2.js — محررا «المؤشرات» و«لوحات الرؤى» (V2)
   ───────────────────────────────────────────────────────────
   «المؤشرات»: تعريفات المؤشرات الأربعة عشر (الاسم/النوع/الأساس/المستهدف)
   مقفلة لأنها مرآة المصدر المعتمد؛ التحرير مقصور على «القيمة الحالية»
   التي تُسجَّل من المنصة — والغائبة تبقى null بصدق (لا صفر زائف أبداً)،
   وتُعرض «غير متوفرة» ويتطلب نشرها تنازلاً موقَّعاً (بوابة kpi.current_values).

   «لوحات الرؤى»: نصوص بطاقات الرؤى لكل قسم قابلة للتحرير، وأي تعديل رقمي
   (تغيّر الأرقام الواردة في العنوان أو النص) يعيد حالة البطاقة إلى
   needs_review تلقائياً حتى يعتمدها محرر مخوَّل — والأرقام ذاتها تبقى خاضعة
   لبوابة «مجمع الحقائق» الحاجبة عند النشر (لا رقم بلا أصل في الإصدار).

   دورة المسودة والحفظ والتزامن التفاؤلي كما في بقية المحررات حرفياً. */
"use strict";

RH.admin.editors2 = RH.admin.editors2 || {};

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;
  const round1 = (v) => RH.data.derive.roundHalfUp(v, 1);

  /** النص القانوني لغياب القيمة الحالية — يُعاد حرفياً عند مسح القيمة */
  const CANONICAL_CURRENT_NOTE = "تُسجَّل القيم الحالية من داخل المنصة — غير متوفرة بعد";

  function actor() {
    const s = RH.admin.auth.session();
    return (s && s.name) || "غير معروف";
  }

  // ═══ التبويب: «المؤشرات» — تحرير القيم الحالية مع بقاء null صادقاً ═══
  function kpis(container, draft, save) {
    const st = draft.strategy;
    if (!st || !Array.isArray(st.kpis)) {
      RH.core.dom.clear(container).appendChild(h("div", { class: "adm-card" },
        h("h3", {}, "لا مؤشرات في هذه المسودة"),
        h("div", { class: "sub" },
          "المسودة أقدم من عقد V2 — افتح مسودة جديدة من الإصدار المنشور الحالي.")));
      return;
    }
    const root = h("div", {});
    const empty = st.kpis.filter((k) => k.current == null).length;

    const card = h("div", { class: "adm-card" },
      h("h3", {}, "مؤشرات الأداء (" + fmt.int(st.kpis.length) + " من 14)"),
      h("div", { class: "sub" },
        "التعريفات وخطوط الأساس والمستهدفات مقفلة (مرآة المصدر المعتمد)؛ "
        + "التحرير مقصور على القيمة الحالية المسجَّلة من المنصة — الغائبة تبقى "
        + "غائبة بصدق وتُعرض «غير متوفرة»، ولا يُدخل صفر بديلاً عنها أبداً."),
      h("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", margin: "6px 0 14px" } },
        h("span", { class: "st " + (empty ? "warn" : "ok") },
          empty
            ? fmt.noun(empty, "indicator") + " بلا قيمة حالية — النشر يتطلب تنازلاً موقَّعاً"
            : "كل المؤشرات بقيم حالية مسجَّلة"),
        h("span", { class: "st mut" },
          "المؤشرات النسبية تُدخل نسبةً مئوية (0–100) وتُخزن كسراً بين 0 و1"),
      ),
    );

    const t = h("table", { class: "adm-table" },
      h("thead", {}, h("tr", {},
        ["#", "المؤشر (حرفياً)", "النوع", "خط الأساس", "المستهدف",
          "القيمة الحالية", "العرض", ""].map((c) => h("th", {}, c)))));
    const tb = h("tbody", {});

    const showVal = (k, v) => {
      if (v == null) return "—";
      return k.pct ? fmt.pct(round1(v * 100)) : fmt.int(v);
    };

    st.kpis.forEach((k) => {
      const currentCell = h("td", {});
      const displayCell = h("td", {});
      const renderDisplay = () => {
        RH.core.dom.clear(displayCell).appendChild(
          k.current == null
            ? h("span", { class: "st warn" }, "غير متوفرة — تُسجَّل من المنصة")
            : h("span", { class: "st ok" }, showVal(k, k.current)));
      };
      const input = h("input", {
        type: "number",
        min: 0,
        max: k.pct ? 100 : null,
        step: k.pct ? 0.1 : 1,
        style: { width: "96px" },
        "aria-label": "القيمة الحالية للمؤشر " + k.id,
        value: k.current == null ? "" : (k.pct ? round1(k.current * 100) : k.current),
        oninput: (e) => {
          const raw = e.target.value === "" ? null : Number(e.target.value);
          if (raw == null || !Number.isFinite(raw)) {
            k.current = null;
            k.current_note = CANONICAL_CURRENT_NOTE;
          } else if (k.pct) {
            const clamped = Math.max(0, Math.min(100, raw));
            k.current = Math.round(clamped * 100) / 10000; // كسر [0,1] بدقة 4 منازل
            k.current_note = "قيمة مسجَّلة من الإدارة بتاريخ "
              + fmt.date(new Date().toISOString().slice(0, 10));
          } else {
            k.current = Math.max(0, raw);
            k.current_note = "قيمة مسجَّلة من الإدارة بتاريخ "
              + fmt.date(new Date().toISOString().slice(0, 10));
          }
          renderDisplay();
        },
      });
      currentCell.appendChild(input);
      currentCell.appendChild(h("div", { class: "hint", style: { marginTop: "3px" } },
        k.pct ? "نسبة مئوية 0–100" : "قيمة عددية"));
      renderDisplay();

      tb.appendChild(h("tr", {},
        h("td", {}, h("span", { class: "rid" }, String(k.id))),
        h("td", { style: { minWidth: "260px" } }, k.name),
        h("td", {}, k.type || "—"),
        h("td", { class: "num" }, showVal(k, k.baseline)),
        h("td", { class: "num" }, showVal(k, k.target)),
        currentCell,
        displayCell,
        h("td", { class: "cell-actions" },
          h("button", { class: "danger", onclick: () => {
            if (k.current == null) return;
            if (!confirm("مسح القيمة الحالية للمؤشر " + k.id
              + "؟ ستعود «غير متوفرة» بصدق.")) return;
            k.current = null;
            k.current_note = CANONICAL_CURRENT_NOTE;
            RH.data.store.audit(actor(), "draft.kpi_current_clear", { kpi: k.id });
            kpis(container, draft, save);
          } }, "مسح")),
      ));
    });
    t.appendChild(tb);
    card.appendChild(h("div", { style: { overflowX: "auto" } }, t));
    card.appendChild(h("div", { class: "hint", style: { marginTop: "10px" } },
      "لا إضافة ولا حذف هنا: عدد المؤشرات ومعرفاتها (1..14) بوابة حاجبة من "
      + "عقد مرآة المصدر — تعديل التعريفات يمر من مسار البيانات الموثوق."));
    card.appendChild(h("div", { style: { marginTop: "14px" } },
      h("button", { class: "btn btn-primary", onclick: async () => {
        await save();
        const filled = st.kpis.filter((k) => k.current != null).length;
        RH.data.store.audit(actor(), "draft.kpi_currents_save", {
          filled, empty: st.kpis.length - filled,
        });
      } }, "حفظ المسودة")));

    root.appendChild(card);
    RH.core.dom.clear(container).appendChild(root);
  }

  // ═══ التبويب: «لوحات الرؤى» — تحرير النصوص بإعادة اعتماد تلقائية ═══

  /** بصمة الأرقام في عنوان البطاقة ونصها — أساس كشف «التعديل الرقمي» */
  function numSig(p) {
    const s = String(p.title || "") + " " + String(p.text || "");
    return (s.match(/[0-9][0-9,\.]*/g) || []).join("|");
  }

  const SECTION_TITLES = {
    supply: "العرض والطلب",
    licensing: "التراخيص",
    control: "الرقابة الميدانية",
    initiatives: "المبادرات والركائز",
  };
  const CLS_OPTIONS = [
    ["pos", "إيجابي (أخضر)"],
    ["neg", "سلبي (مرجاني — عجز/خلل حصراً)"],
    ["warn", "تنبيهي"],
    ["neu", "محايد"],
  ];

  function panels(container, draft, save) {
    const ip = draft.insight_panels && draft.insight_panels.sections;
    if (!ip) {
      RH.core.dom.clear(container).appendChild(h("div", { class: "adm-card" },
        h("h3", {}, "لا لوحات رؤى في هذه المسودة"),
        h("div", { class: "sub" },
          "المسودة أقدم من عقد V2 — افتح مسودة جديدة من الإصدار المنشور الحالي.")));
      return;
    }
    const root = h("div", {});
    root.appendChild(h("div", { class: "adm-page-head" },
      h("div", { class: "kicker" }, "لوحات الرؤى"),
      h("h2", {}, "بطاقات الرؤى التحليلية للأقسام"),
      h("div", { class: "desc" },
        "أي تعديل يغيّر الأرقام الواردة في البطاقة يعيدها تلقائياً إلى "
        + "«يحتاج إعادة اعتماد»؛ وأرقام النص كلها تُفحص ضد مجمع حقائق الإصدار "
        + "ببوابة حاجبة عند النشر — لا رقم بلا أصل."),
    ));

    // بصمة مرجعية لكل بطاقة وقت فتح المحرر + حالتها آنذاك — للكشف والارتداد.
    // خارطة محلية بالإغلاق (لا حقول مؤقتة تُحفظ في المسودة).
    const baseline = new Map();
    for (const panelsArr of Object.values(ip)) {
      for (const p of panelsArr) {
        baseline.set(p.id, { sig: numSig(p), status: p.status });
      }
    }

    function onNumericCheck(p, statusEl) {
      const base = baseline.get(p.id);
      if (!base) return;
      if (numSig(p) !== base.sig) {
        if (p.status !== "needs_review") p.status = "needs_review";
      } else if (p.status === "needs_review" && base.status !== "needs_review") {
        p.status = base.status; // عاد الرقم كما كان — تُستعاد الحالة المرجعية
      }
      renderStatus(p, statusEl);
    }

    function renderStatus(p, statusEl) {
      statusEl.className = "st " + (p.status === "needs_review" ? "warn" : "ok");
      statusEl.textContent = p.status === "needs_review"
        ? "يحتاج إعادة اعتماد بعد تعديل رقمي"
        : p.status === "approved_brief" ? "معتمد من التكليف" : "معتمد";
    }

    for (const [secKey, secPanels] of Object.entries(ip)) {
      const card = h("div", { class: "adm-card" },
        h("h3", {}, "قسم «" + (SECTION_TITLES[secKey] || secKey) + "» ("
          + fmt.int(secPanels.length) + " بطاقات)"),
        h("div", { class: "sub" },
          "تُعرض في عمود «رؤى تحليلية» داخل لوحة القسم — التصنيف من مفردات "
          + "مقفلة، والمرجاني للعجز والخلل حصراً"),
      );

      secPanels.forEach((p, i) => {
        const statusEl = h("span", {});
        renderStatus(p, statusEl);

        const approveBtn = () => p.status === "needs_review"
          ? h("button", { class: "btn btn-line", onclick: () => {
            p.status = "approved";
            baseline.set(p.id, { sig: numSig(p), status: "approved" });
            RH.data.store.audit(actor(), "draft.insight_panel_approve",
              { section: secKey, panel: p.id });
            RH.admin.shell.toast("اعتُمدت البطاقة بعد المراجعة (" + p.id + ")");
            panels(container, draft, save);
          } }, "روجع — اعتماد")
          : null;

        const ta = h("textarea", {
          oninput: (e) => { p.text = e.target.value.trim(); onNumericCheck(p, statusEl); },
        }, p.text);

        card.appendChild(h("div", {
          style: { border: "1px solid var(--hair)", borderRadius: "12px",
            padding: "16px", marginBottom: "14px" } },
          h("div", { style: { display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: "10px", marginBottom: "8px" } },
            h("span", { class: "rid" }, p.id),
            h("span", { style: { display: "flex", gap: "10px", alignItems: "center" } },
              statusEl, approveBtn()),
          ),
          h("div", { class: "frow" },
            h("div", { class: "fitem" },
              h("label", {}, "العنوان"),
              h("input", { type: "text", value: p.title || "",
                oninput: (e) => { p.title = e.target.value.trim(); onNumericCheck(p, statusEl); } })),
            h("div", { class: "fitem" },
              h("label", {}, "التصنيف البصري"),
              h("select", { onchange: (e) => { p.cls = e.target.value; } },
                CLS_OPTIONS.map(([v, label]) =>
                  h("option", { value: v, selected: v === p.cls ? "" : null }, label))),
              h("div", { class: "hint" }, "مفردات مقفلة {pos, neg, warn, neu} — بوابة حاجبة")),
          ),
          h("div", { class: "frow single" },
            h("div", { class: "fitem" },
              h("label", {}, "النص (جملة واحدة بقيم دقيقة)"), ta,
              h("div", { class: "hint" },
                "أرقام النص تُطابق مجمع حقائق الإصدار عند النشر — وأي تعديل رقمي "
                + "يعيد البطاقة إلى «يحتاج إعادة اعتماد» فوراً"))),
          h("button", { class: "btn btn-danger-quiet", onclick: () => {
            if (!confirm("حذف بطاقة «" + (p.title || p.id) + "» من قسم «"
              + (SECTION_TITLES[secKey] || secKey) + "»؟")) return;
            secPanels.splice(i, 1);
            RH.data.store.audit(actor(), "draft.insight_panel_delete",
              { section: secKey, panel: p.id });
            panels(container, draft, save);
          } }, "حذف البطاقة"),
        ));
      });

      card.appendChild(h("button", { class: "btn btn-line", onclick: () => {
        const prefix = secPanels.length
          ? String(secPanels[0].id).replace(/\d+$/, "") : secKey.charAt(0) + "d";
        let n = secPanels.length + 1;
        const all = Object.values(ip).flat().map((x) => x.id);
        while (all.includes(prefix + n)) n++;
        secPanels.push({ id: prefix + n, cls: "neu", title: "", text: "",
          status: "needs_review" });
        RH.data.store.audit(actor(), "draft.insight_panel_add",
          { section: secKey, panel: prefix + n });
        panels(container, draft, save);
      } }, "إضافة بطاقة (تولد بحالة «يحتاج اعتماداً»)"));
      root.appendChild(card);
    }

    root.appendChild(h("button", { class: "btn btn-primary", onclick: async () => {
      await save();
      const review = Object.values(ip).flat()
        .filter((p) => p.status === "needs_review").length;
      RH.data.store.audit(actor(), "draft.insight_panels_save", {
        panels: Object.values(ip).flat().length, needs_review: review,
      });
    } }, "حفظ المسودة"));

    RH.core.dom.clear(container).appendChild(root);
  }

  RH.admin.editors2.kpis = kpis;
  RH.admin.editors2.panels = panels;
  RH.admin.editors2.numSig = numSig;
  RH.admin.editors2.CANONICAL_CURRENT_NOTE = CANONICAL_CURRENT_NOTE;
})();
