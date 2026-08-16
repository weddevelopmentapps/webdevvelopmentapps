/* ax-monitoring.js — ملحق الرقابة: التفاصيل والتحليل
   خمس صفحات بحجم الإطار (لا تمرير): النشاط الشهري (رسمان منفصلان — الجمع
   بينهما يتطلب محورين وهو محظور)، المخالفات حسب النوع، جدول القطاعات،
   منهجية معدل الامتثال بحالة اعتمادها الشريفة (لا تلفيق)، ثم الأصل والحساب.
   كل قيمة من store حصراً وكل رقم ظاهر عبر fmt. */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** حاوية رسم قياسية داخل صفحة الملحق (تملأ حصتها من العمود المرن) */
  function chartArea() {
    const chart = h("div", { class: "chart" });
    return { area: h("div", { class: "chart-area" }, chart), chart };
  }

  /** تسميات عربية لبنود الحجر — المعرّفات تقنية والأسباب تُعرض حرفياً من الإصدار */
  const QUARANTINE_LABELS = {
    inspector_level_records: "سجلات مستوى المفتشين",
    hotspots: "النقاط الساخنة (الإحداثيات)",
  };

  /* ── 1) النشاط الرقابي الشهري — لوحة كثيفة بعد المراجعة: شريط إجماليات
        أعلى، رسمان متراصفان (خط المتوسط الشهري في كل منهما — من charts.js)
        وإلى جانبهما جدول القيم الشهرية الكامل ── */
  function pgMonthly(el, ctx) {
    const rel = RH.data.store.release();
    const m = rel.metrics;
    const rows = rel.monthly.monitoring;
    /* المتوسط الشهري من المشتقات المنشورة (مرآة بايثون) حصراً */
    const avgVisits = RH.data.store.der().avg_monthly_visits;

    /* شريط الإجماليات الثلاثة */
    el.appendChild(h("div", { class: "ax-strip" },
      h("div", { class: "ax-stat" },
        h("span", { class: "ax-stat-k" }, "الزيارات الميدانية"),
        h("b", { class: "ax-stat-v" }, fmt.int(m.total_visits.value)),
      ),
      h("div", { class: "ax-stat" },
        h("span", { class: "ax-stat-k" }, "المخالفات المسجلة"),
        h("b", { class: "ax-stat-v neg" }, fmt.int(m.total_violations.value)),
      ),
      h("div", { class: "ax-stat" },
        h("span", { class: "ax-stat-k" }, "متوسط الزيارات شهرياً"),
        h("b", { class: "ax-stat-v" }, fmt.int(avgVisits)),
      ),
    ));

    const split = h("div", { class: "ax-split" });
    const chartsCol = h("div", { class: "ax-charts-col" });
    const visits = chartArea();
    const violations = chartArea();
    chartsCol.appendChild(visits.area);
    chartsCol.appendChild(violations.area);
    split.appendChild(chartsCol);

    /* جدول القيم الشهرية الكامل بجانب الرسمين */
    split.appendChild(h("table", { class: "ax-table ax-rank-table" },
      h("thead", {}, h("tr", {},
        ["الشهر", "زيارات", "مخالفات"].map((t) => h("th", { scope: "col" }, t)),
      )),
      h("tbody", {}, rows.map((r) => h("tr", {},
        h("td", {}, r.label),
        h("td", { class: "num" }, fmt.int(r.visits)),
        h("td", { class: "num" }, fmt.int(r.violations)),
      ))),
    ));
    el.appendChild(split);

    RH.viz.charts.monitoringMonthly(visits.chart, ctx.su, "visits");
    RH.viz.charts.monitoringMonthly(violations.chart, ctx.su, "violations");

    el.appendChild(h("div", { class: "ax-note" },
      "يُعرض النشاطان في رسمين منفصلين لاختلاف نطاقي مقياسيهما، وخط المتوسط",
      " الشهري مرسوم في كل منهما — الفترة المرجعية: ",
      h("b", {}, rel.meta.monitoring_period_label), ".",
    ));
  }

  /* ── 2) المخالفات حسب النوع + النوع الأعلى وحصته من الإجمالي ── */
  function pgViolationTypes(el, ctx) {
    const rel = RH.data.store.release();
    const total = rel.metrics.total_violations.value;
    const top = rel.violation_types.slice()
      .sort((a, b) => b.count - a.count)[0];
    const topShare = RH.data.derive.pct(top.count, total);

    const { area, chart } = chartArea();
    el.appendChild(area);
    RH.viz.charts.violTypeBars(chart, ctx.su);

    el.appendChild(h("div", { class: "ax-note" },
      "النوع الأعلى تكراراً هو ", h("b", {}, top.name),
      " بواقع ", h("b", {}, fmt.unitAfter(top.count, "مخالفة")),
      "، أي ما يمثل ", h("b", {}, fmt.pct(topShare)),
      " من إجمالي المخالفات المسجلة البالغ ",
      fmt.unitAfter(total, "مخالفة"),
      " خلال ", rel.meta.monitoring_period_label, ".",
    ));
  }

  /* ── 3) القطاعات: زيارات ومخالفات ومراقبون وإغلاق + صف إجمالي من metrics ── */
  function pgSectorTable(el) {
    const rel = RH.data.store.release();
    const m = rel.metrics;

    const totalCell = (v) => h("td", {
      class: "num",
      style: { fontWeight: "700", borderTop: "1px solid var(--hair-d)" },
    }, fmt.int(v));

    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        h("th", {}, "القطاع"),
        h("th", {}, "الزيارات الميدانية"),
        h("th", {}, "المخالفات المسجلة"),
        h("th", {}, "المراقبون"),
        h("th", {}, "قرارات الإغلاق"),
      )),
      h("tbody", {},
        rel.sectors.map((s) => h("tr", {},
          h("td", {}, s.name),
          h("td", { class: "num" }, fmt.int(s.visits)),
          h("td", { class: "num" }, fmt.int(s.violations)),
          h("td", { class: "num" }, fmt.int(s.monitors)),
          h("td", { class: "num" }, fmt.int(s.closures)),
        )),
        h("tr", {},
          h("td", { style: { fontWeight: "700", color: "var(--ivory)", borderTop: "1px solid var(--hair-d)" } },
            "الإجمالي"),
          totalCell(m.total_visits.value),
          totalCell(m.total_violations.value),
          totalCell(m.total_monitors.value),
          totalCell(m.total_closures.value),
        ),
      ),
    ));

    el.appendChild(h("div", { class: "ax-note" },
      "صف الإجمالي من مؤشرات الإصدار المعتمدة — الفترة المرجعية: ",
      rel.meta.monitoring_period_label,
      "، وعدد المراقبين حتى ", rel.meta.data_as_of, ".",
    ));
  }

  /* ── 4) منهجية معدل الامتثال — بطاقة حالة الاعتماد، لا رسم ── */
  function pgMethodology(el) {
    const rel = RH.data.store.release();
    const comp = rel.compliance;
    const pending = comp.status === "pending_methodology";

    const badge = pending
      ? h("span", { class: "badge-pending" }, "قيمة مورّدة — بانتظار اعتماد المنهجية")
      : h("span", {
        class: "badge-pending",
        style: { color: "var(--green)", borderColor: "var(--green)" },
      }, "منهجية معتمدة");

    const card = h("div", {
      style: {
        background: "var(--stage-2)",
        border: "1px solid var(--hair-d)",
        borderRadius: "calc(var(--su) * 16)",
        padding: "calc(var(--su) * 36) calc(var(--su) * 44)",
        maxWidth: "calc(var(--su) * 1250)",
        display: "flex",
        flexDirection: "column",
        gap: "calc(var(--su) * 18)",
      },
    },
      h("div", { style: { fontSize: "calc(var(--su) * 18)", fontWeight: "600", color: "var(--mut-d)" } },
        comp.label),
      h("div", { style: { display: "flex", alignItems: "center", gap: "calc(var(--su) * 24)" } },
        h("span", {
          style: {
            fontFamily: "var(--f-display)",
            fontSize: "calc(var(--su) * 72)",
            fontWeight: "600",
            color: "var(--ivory)",
            lineHeight: "1",
          },
        }, fmt.pct(comp.value)),
        badge,
      ),
      h("div", { class: "ax-note" }, comp.note),
      pending ? h("div", { class: "ax-note" },
        h("b", {}, "ما الذي يلزم لاعتماد المنهجية: "),
        "تعريف البسط (ما الذي يُعدّ زيارة ممتثلة تعريفاً قابلاً للقياس)، ",
        "وتعريف المقام (إجمالي الزيارات أم المنشآت التي جرت زيارتها)، ",
        "وقاعدة معالجة تعدد المخالفات في الزيارة الواحدة، ",
        "وتسمية المالك المسؤول عن تعريف المؤشر ومراجعته الدورية.",
      ) : h("div", { class: "ax-note" },
        "المنهجية معتمدة بتعريف موثق للبسط والمقام ومعالجة تعدد المخالفات ومالك المؤشر.",
      ),
    );
    el.appendChild(card);

    // ملاحظة الحجر: البنود المحجورة بأسبابها الحرفية من الإصدار
    const quarantined = Object.keys(rel.quarantine || {});
    if (quarantined.length) {
      const note = h("div", { class: "ax-note" },
        h("b", {}, "بيانات محجورة: "));
      quarantined.forEach((key, i) => {
        if (i > 0) note.appendChild(document.createTextNode("؛ "));
        note.appendChild(document.createTextNode(
          (QUARANTINE_LABELS[key] || key) + " — " + rel.quarantine[key].reason));
      });
      note.appendChild(document.createTextNode("."));
      el.appendChild(note);
    }
  }

  /* ── 5) الأصل والحساب — الأعمدة الموحدة لصفحات المصادر في الملاحق ── */
  function pgProvenance(el) {
    const rel = RH.data.store.release();
    const rows = RH.presenter.ax.provenanceRows([
      "total_monitors", "total_visits", "total_violations", "total_closures",
      "south_violations", "south_violations_share_pct", "avg_monthly_visits",
    ]);

    const val = (r) => r.unit === "٪" ? fmt.pct(r.value) : fmt.unitAfter(r.value, r.unit);
    // المشتقات بلا تسمية عربية تعود بمعرّفها اللاتيني — يُعزل بصنف .ltr
    const label = (r) => /^[\x20-\x7E]+$/.test(r.label)
      ? h("span", { class: "ltr" }, r.label) : r.label;

    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        h("th", {}, "المؤشر"),
        h("th", {}, "القيمة"),
        h("th", {}, "المصدر"),
        h("th", {}, "الصيغة"),
      )),
      h("tbody", {}, rows.map((r) => h("tr", {},
        h("td", {}, label(r)),
        h("td", { class: "num" }, val(r)),
        h("td", {}, r.source),
        h("td", {}, h("span", { class: "formula" }, r.formula)),
      ))),
    ));

    el.appendChild(h("div", { class: "ax-note" },
      "الفترة المرجعية للنشاط الرقابي: ",
      h("b", {}, rel.meta.monitoring_period_label),
      " — البيانات حتى ", rel.meta.data_as_of, ".",
    ));
  }

  RH.presenter.ax.register({
    id: "monitoring",
    kicker: "ملحق تحليلي",
    title: "الرقابة — التفاصيل والتحليل",
    returnLabel: "العودة إلى الرقابة",
    pages: () => [
      { name: "النشاط الرقابي الشهري", build: pgMonthly },
      { name: "المخالفات حسب النوع", build: pgViolationTypes },
      { name: "القطاعات: زيارات ومخالفات ومراقبون وإغلاق", build: (el) => pgSectorTable(el) },
      { name: "منهجية معدل الامتثال", build: (el) => pgMethodology(el) },
      { name: "الأصل والحساب", build: (el) => pgProvenance(el) },
    ],
  });
})();
