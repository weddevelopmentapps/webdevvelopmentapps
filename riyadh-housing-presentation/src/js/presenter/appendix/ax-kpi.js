/* ax-kpi.js — ملحق المؤشرات الكامل (appendix/kpi)
   جدول واحد بكل الحقول المعتمدة: المؤشر، القيمة الحالية (الغياب «—» بوسم
   «غير متاحة» — لا يتحول صفراً أبداً)، خط الأساس، المستهدف، الفجوة
   (derive.kpiVariance)، اتجاه التحسن، الوحدة، الجهة المسؤولة، تاريخ القياس،
   مصدر البيانات. صفحات ديناميكية: أكثر من 8 مؤشرات → تقسيم بحجم الإطار.
   عند غياب الاعتماد: صفحة حالة شريفة — لا قيم مصطنعة (بوابة R4/R5). */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** حد الكثافة: 8 صفوف كحد أقصى للصفحة الواحدة (إطار بلا تمرير) */
  const ROWS_PER_PAGE = 8;

  const HEADS = [
    "المؤشر", "القيمة الحالية", "خط الأساس", "المستهدف", "الفجوة",
    "اتجاه التحسن", "الوحدة", "الجهة المسؤولة", "تاريخ القياس", "مصدر البيانات",
  ];

  /** قيمة مؤشر واحدة عبر fmt حصراً: ٪ من fmt.pct، وإلا صحيح/منزلة واحدة */
  function fmtVal(v, unit) {
    if (v == null) return "—";
    if (unit === "٪") return fmt.pct(v);
    return Number.isInteger(v) ? fmt.int(v) : fmt.dec1(v);
  }

  /** خلية رقمية بعزل اتجاهي؛ الغياب «—» دون أي تحويل */
  function numCell(v, unit) {
    return h("td", { class: "num" },
      v == null ? "—" : h("span", { class: "ltr" }, fmtVal(v, unit)));
  }

  /** خلية نصية: عزل .ltr للمقاطع اللاتينية داخل النص العربي */
  function textCell(s) {
    if (s == null || s === "") return h("td", {}, "—");
    const t = String(s);
    return h("td", {}, /[A-Za-z]/.test(t) ? h("span", { class: "ltr" }, t) : t);
  }

  /* ── صفحة الحالة الشريفة عند غياب الاعتماد ───────────────────────────── */
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
      h("h2", {}, "يُستكمل جدول المؤشرات فور اعتماد مصدره وتسجيل قيمه الحالية"),
      h("p", {},
        "تعريفات المؤشرات وخطوط أساسها ومستهدفاتها مملوكة للوثيقة المعتمدة ",
        h("span", { class: "src-name" }, "«" + st.source_required + "»"),
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
      h("tbody", {}, kpis.map((k) => {
        const variance = RH.data.derive.kpiVariance(k);
        return h("tr", {},
          h("td", {}, k.name),
          k.current_value == null
            ? h("td", { class: "num" }, "— ",
              h("span", { class: "rank-note" }, "غير متاحة"))
            : numCell(k.current_value, k.unit),
          numCell(k.baseline, k.unit),
          numCell(k.target, k.unit),
          h("td", { class: "num" }, variance
            ? h("span", { class: "ltr" }, fmtVal(Math.abs(variance.gap), k.unit))
            : "—"),
          h("td", {}, k.direction === "lower_better" ? "الانخفاض أفضل" : "الارتفاع أفضل"),
          textCell(k.unit),
          textCell(k.owner),
          h("td", { class: "num" }, k.as_of ? fmt.date(k.as_of) : "—"),
          textCell(k.source),
        );
      })),
    ));

    const missing = kpis.filter((k) => k.current_value == null).length;
    const note = h("div", { class: "ax-note" },
      h("b", {}, fmt.noun(kpis.length, "indicator")),
      " في هذه الصفحة · المصدر: ", st.source_required, ".");
    if (missing) {
      note.appendChild(document.createTextNode(" القيمة الحالية غير متاحة لعدد "));
      note.appendChild(h("b", {}, fmt.noun(missing, "indicator")));
      note.appendChild(document.createTextNode(" — الغياب يُعرض بأمانة ولا يُحوَّل إلى صفر."));
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
      if (st.status !== "approved" || !(st.kpis || []).length) {
        return [{ name: "حالة الاعتماد", build: pagePending }];
      }
      const kpis = st.kpis;
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
