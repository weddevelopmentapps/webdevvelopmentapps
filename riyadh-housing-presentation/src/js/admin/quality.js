/* quality.js — لوحة فحوص الجودة والتنازلات
   يعرض نتائج validateRelease على المسودة: بوابات حاجبة (تمنع النشر مطلقاً)
   وإنذارات تتطلب إقراراً موقَّعاً بسبب مكتوب (تنازل مسجَّل في الإصدار والتدقيق).

   V2: مع عقد الاستراتيجية «مرآة المصدر» (4 محاور + 18 مبادرة + 14 مؤشراً)
   ولوحات الرؤى تضاعف عدد البوابات، فتُعرض مجمّعة بعناوين، وتتصدرها بطاقة
   ملخص العقد: الأعداد والحالات المحتسبة بقاعدة «متأخرة حكماً» عند تاريخ
   الاحتساب المعتمد — مرآة القاعدة ذاتها في generate_data.py والمحرر. */
"use strict";

RH.admin.quality = (function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

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

  /** تجميع البوابات بعناوين قرائية — الترتيب داخل كل مجموعة كما ولّده الفاحص */
  const GROUPS = [
    { title: "عقد الاستراتيجية والمؤشرات (مرآة المصدر — 4 محاور)",
      match: (g) => /^(strategy|kpi)\./.test(g.id) },
    { title: "لوحات الرؤى (مجمع الحقائق والمفردات المقفلة)",
      match: (g) => /^insight_panels\./.test(g.id) },
    { title: "التحليلات المعتمدة", match: (g) => /^insight\./.test(g.id) },
    { title: "سلامة البيانات والمجاميع والمشتقات", match: () => true },
  ];

  /** قاعدة الحالة المحتسبة — من المحرر إن حضر، وإلا مرآة محلية مطابقة حرفياً
      (generate_data.py:ini_state) كي لا تعتمد اللوحة على ترتيب تحميل الملفات */
  function effStatus(ini, calcDate) {
    if (RH.admin.editors2 && RH.admin.editors2.effectiveStatus) {
      return RH.admin.editors2.effectiveStatus(ini, calcDate);
    }
    if (ini.status) return { status: ini.status, computed: false };
    if (ini.end && ini.end < calcDate) return { status: "متأخرة", computed: true };
    if (ini.start && ini.start <= calcDate) return { status: "جاري العمل", computed: true };
    return { status: "لم يتم البدء", computed: true };
  }

  /** بطاقة ملخص عقد الاستراتيجية الجديد — أعداد حية لا نتائج بوابات فقط */
  function strategyContractCard(rel) {
    const st = rel.strategy;
    if (!st || !Array.isArray(st.pillars)) return null;
    const calcDate = rel.meta.calculation_date;
    const mirror = st.status === "approved_source_mirror";

    const kinds = st.pillars.map((p) => p.kind);
    const pillarsOk = st.pillars.length === 4 && st.required_pillars === 4
      && new Set(st.pillars.map((p) => p.id)).size === 4
      && kinds.filter((k) => k === "ركيزة").length === 3
      && kinds.filter((k) => k === "ممكن").length === 1;
    const iniOk = st.initiatives.length === 18
      && new Set(st.initiatives.map((i) => i.id)).size === 18;
    const kpisOk = Array.isArray(st.kpis) && st.kpis.length === 14
      && st.kpis.every((k, i) => k.id === i + 1);
    const noCurrent = Array.isArray(st.kpis)
      ? st.kpis.filter((k) => k.current == null).length : 0;

    const counts = { "منجزة": 0, "جاري العمل": 0, "متأخرة": 0, "لم يتم البدء": 0 };
    let computedLate = 0;
    for (const ini of st.initiatives) {
      const es = effStatus(ini, calcDate);
      counts[es.status] = (counts[es.status] || 0) + 1;
      if (es.computed && es.status === "متأخرة") computedLate++;
    }

    const row = (ok, label, detail) => h("div", { class: "qgate " + (ok ? "pass" : "block") },
      icon(ok ? "pass" : "block"),
      h("div", { style: { flex: "1" } },
        h("div", { class: "qname" }, label),
        detail ? h("div", { class: "qdetail" }, detail) : null));

    return h("div", { class: "adm-card" },
      h("h3", {}, "عقد الاستراتيجية — مرآة المصدر المعتمد"),
      h("div", { class: "sub" },
        (st.source || "خطة عمل المشروع V.1.0.0")
        + " · حالة الاعتماد: " + (mirror
          ? "معتمدة (البوابات الحاجبة فعّالة)"
          : "بانتظار المصدر — النشر الكامل محجوب")),
      row(pillarsOk, "المحاور 4 بمعرفات فريدة: 3 «ركيزة» + 1 «ممكن»",
        "الموجود: " + fmt.int(st.pillars.length)),
      row(iniOk, "18 مبادرة بمعرفات فريدة",
        "الموجود: " + fmt.noun(st.initiatives.length, "initiative")),
      row(kpisOk, "14 مؤشراً بمعرفات 1..14 بالضبط",
        Array.isArray(st.kpis) ? "الموجود: " + fmt.noun(st.kpis.length, "indicator") : "لا مؤشرات"),
      h("div", { class: "qgate " + (noCurrent ? "warn" : "pass") },
        icon(noCurrent ? "warn" : "pass"),
        h("div", { style: { flex: "1" } },
          h("div", { class: "qname" }, "القيم الحالية للمؤشرات"),
          h("div", { class: "qdetail" }, noCurrent
            ? fmt.noun(noCurrent, "indicator")
              + " بلا قيمة حالية — تُعرض «غير متوفرة» بصدق والنشر يتطلب تنازلاً موقَّعاً"
            : "كل المؤشرات بقيم حالية مسجَّلة"))),
      h("div", { class: "qgate pass" },
        icon("pass"),
        h("div", { style: { flex: "1" } },
          h("div", { class: "qname" },
            "الحالات المحتسبة بقاعدة «متأخرة حكماً» عند " + fmt.date(calcDate)),
          h("div", { class: "qdetail" },
            "منجزة: " + fmt.noun(counts["منجزة"], "initiative")
            + " · جاري العمل: " + fmt.noun(counts["جاري العمل"], "initiative")
            + " · متأخرة: " + fmt.noun(counts["متأخرة"], "initiative")
            + (computedLate ? " (منها " + fmt.noun(computedLate, "initiative") + " حكماً)" : "")
            + " · لم يتم البدء: " + fmt.noun(counts["لم يتم البدء"], "initiative")))),
    );
  }

  /**
   * يبني لوحة الفحوص. waivers كائن حي {gateId: {by, reason, at}}.
   * onChange يُستدعى عند تغير التنازلات لتحديث زر النشر.
   */
  function render(container, draft, waivers, session, onChange) {
    const v = RH.data.validate.validateRelease(draft);
    const wrap = h("div", {});

    const contract = strategyContractCard(draft);
    if (contract) wrap.appendChild(contract);

    const card = h("div", { class: "adm-card" },
      h("h3", {}, "فحوص الجودة"),
      h("div", { class: "sub" },
        `${v.gates.filter((g) => g.ok).length} من ${v.gates.length} فحصاً مجتازاً · ` +
        `${v.blockers.length} حاجب · ${v.warnings.length} إنذار`),
    );

    function gateRow(g) {
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
      return row;
    }

    // توزيع البوابات على المجموعات: أول مطابقة تفوز، والأخيرة تلتقط الباقي
    const buckets = GROUPS.map(() => []);
    for (const g of v.gates) {
      const gi = GROUPS.findIndex((grp) => grp.match(g));
      buckets[gi === -1 ? GROUPS.length - 1 : gi].push(g);
    }
    GROUPS.forEach((grp, gi) => {
      const gates = buckets[gi];
      if (!gates.length) return;
      const failed = gates.filter((x) => !x.ok).length;
      card.appendChild(h("div", {
        style: { display: "flex", justifyContent: "space-between", alignItems: "center",
          margin: "16px 0 6px", paddingBottom: "4px",
          borderBottom: "1px solid var(--hair)" } },
        h("div", { style: { fontWeight: 700, fontSize: "12.5px" } }, grp.title),
        h("span", { class: "st " + (failed ? "warn" : "ok") },
          failed
            ? `${fmt.int(failed)} من ${fmt.int(gates.length)} تحتاج معالجة`
            : `${fmt.int(gates.length)} مجتازة`),
      ));
      for (const g of gates) card.appendChild(gateRow(g));
    });

    wrap.appendChild(card);
    RH.core.dom.clear(container).appendChild(wrap);
    return v;
  }

  return { render, strategyContractCard };
})();
