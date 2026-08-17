/* ax-kpi.js — ملحق المؤشرات الكامل (appendix/kpi)
   جدول واحد بكل حقول عقد V2 المنشورة حرفياً من خطة عمل المشروع V.1.0.0:
   المعرف، المؤشر، النوع، الصيغة (نسبة مئوية/قيمة عددية)، خط الأساس،
   المستهدف، مدى التحسن المطلوب (مشتق شفاف = المستهدف − خط الأساس)،
   والقيمة الحالية — الغياب يُعرض «غير متوفرة» بوسمه الصادق ولا يتحول
   صفراً أبداً (ملاحظة المصدر الحرفية في ذيل كل صفحة).
   بوابة الاعتماد عبر الحكم الموحد RH.data.strategyApproved حصراً —
   "approved_source_mirror" اعتماد نقلاً حرفياً (إصلاح مراجعة الجولة 1:
   كانت البوابة النصية القديمة تحجب الجدول رغم اعتماد المصدر).
   صفحات ديناميكية: أكثر من 8 مؤشرات → تقسيم بحجم الإطار. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** حد الكثافة: 8 صفوف كحد أقصى للصفحة الواحدة (إطار بلا تمرير) */
  const ROWS_PER_PAGE = 8;

  const HEADS = [
    "#", "المؤشر", "النوع", "الصيغة", "خط الأساس", "المستهدف",
    "مدى التحسن المطلوب", "القيمة الحالية",
  ];

  /* مرآة تنسيق قيم المؤشرات القانونية (kpiVal في s07/charts2 حرفياً):
     النسبية ×100 بعلامة ٪ العربية المعزولة، والعددية بفاصل الآلاف */
  const round1 = (v) => RH.data.derive.roundHalfUp(v, 1);
  function kpiVal(k, v) {
    if (v == null || !Number.isFinite(v)) return "—";
    return k.pct ? fmt.pct(round1(v * 100)) : fmt.int(v);
  }
  const spanVal = (k) => (k.pct
    ? fmt.pct(round1((k.target - k.baseline) * 100))
    : fmt.int(k.target - k.baseline));

  /** خلية رقمية بعزل اتجاهي */
  function numCell(txt, gold) {
    return h("td", { class: "num" },
      h("span", {
        class: "ltr",
        style: gold ? { color: "var(--gold)", fontWeight: "700" } : null,
      }, txt));
  }

  /* ── صفحة الحالة الشريفة — لا تُسلك إلا إن غاب الاعتماد فعلاً ─────────── */
  function pagePending(el) {
    const st = RH.data.store.release().strategy;
    el.appendChild(h("div", { class: "pending-scene" },
      h("div", { class: "glyph" },
        svg("svg", {
          viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
          "stroke-width": 1.1, "stroke-linecap": "round", "aria-hidden": "true",
        },
          svg("path", { d: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2", "stroke-dasharray": "3 3" })),
      ),
      h("h2", {}, "يُستكمل جدول المؤشرات فور اعتماد مصدره"),
      h("p", {},
        "تعريفات المؤشرات وخطوط أساسها ومستهدفاتها مملوكة للوثيقة المعتمدة ",
        h("span", { class: "src-name" }, "«" + String(st.source || "خطة عمل المشروع") + "»"),
        "، وتُسجَّل القيم الحالية من الإدارة بمصدر وتاريخ قياس لكل مؤشر. ",
        "لا تعرض هذه المنصة قيماً مصطنعة ولا تحوّل الغياب إلى صفر."),
    ));
  }

  /* ── صفحة الجدول: شريحة مؤشرات بحجم الإطار ───────────────────────────── */
  function buildTablePage(el, kpis) {
    const st = RH.data.store.release().strategy;

    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        HEADS.map((t) => h("th", { scope: "col" }, t)))),
      h("tbody", {}, kpis.map((k) => h("tr", {},
        h("td", { class: "num" }, fmt.int(k.id)),
        h("td", {}, String(k.name)),
        h("td", {}, String(k.type || "—")),
        h("td", {}, k.pct ? "نسبة مئوية" : "قيمة عددية"),
        numCell(kpiVal(k, k.baseline), true),
        numCell(kpiVal(k, k.target), true),
        numCell(spanVal(k)),
        k.current == null
          ? h("td", {}, "— ",
            h("span", { class: "rank-note" }, "غير متوفرة"))
          : numCell(kpiVal(k, k.current)),
      ))),
    ));

    const missing = kpis.filter((k) => k.current == null).length;
    const note = h("div", { class: "ax-note" },
      h("b", {}, fmt.noun(kpis.length, "indicator")),
      " في هذه الصفحة · المصدر: ", String(st.source), ".");
    if (missing) {
      note.appendChild(document.createTextNode(" القيمة الحالية غير متوفرة لعدد "));
      note.appendChild(h("b", {}, fmt.noun(missing, "indicator")));
      note.appendChild(document.createTextNode(
        " — " + String((kpis[0] && kpis[0].current_note)
          || "تُسجَّل القيم الحالية من داخل المنصة")
        + "، والغياب يُعرض بأمانة ولا يُحوَّل إلى صفر."));
    }
    el.appendChild(note);
  }

  RH.presenter.ax.register({
    id: "kpi",
    kicker: "ملحق الاستراتيجية",
    title: "مؤشرات الأداء — الجدول الكامل",
    returnLabel: "العودة إلى مؤشرات الأداء",
    pages: () => {
      const st = RH.data.store.release().strategy;
      if (!RH.data.strategyApproved(st) || !(st.kpis || []).length) {
        return [{ name: "حالة الاعتماد", build: pagePending }];
      }
      const kpis = st.kpis.slice().sort((a, b) => a.id - b.id);
      if (kpis.length <= ROWS_PER_PAGE) {
        return [{
          name: "جدول المؤشرات الكامل",
          build: (el) => buildTablePage(el, kpis),
        }];
      }
      // صفحات ديناميكية بحجم الإطار — لا تمرير ولا تصغير خط
      const chunks = [];
      for (let i = 0; i < kpis.length; i += ROWS_PER_PAGE) {
        chunks.push(kpis.slice(i, i + ROWS_PER_PAGE));
      }
      return chunks.map((chunk, i) => ({
        name: "جدول المؤشرات (" + fmt.int(i + 1) + " من " + fmt.int(chunks.length) + ")",
        build: (el) => buildTablePage(el, chunk),
      }));
    },
  });
})();
