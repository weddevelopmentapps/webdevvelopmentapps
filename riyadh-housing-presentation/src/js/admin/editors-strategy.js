/* editors-strategy.js — محرر الاستراتيجية V2 (مرآة المصدر المعتمد)
   ─────────────────────────────────────────────────────────────────
   تبويب «الاستراتيجية» المتكامل: المحاور الأربعة (3 ركائز + ممكن واحد)
   والمبادرات الثماني عشرة بحالاتها وتواريخها، مع عرض حي لقاعدة الاحتساب
   «متأخرة حكماً» (مرآة generate_data.py حرفياً): الحالة المعروضة = حالة
   الملف إن وُجدت؛ وإلا: تجاوزت النهاية دون إنجاز = متأخرة حكماً، بدأت ولم
   تنته = جاري العمل، لم يحن بدؤها = لم يتم البدء.

   العقد ذاته الذي تعمل به بقية المحررات: تحرير على المسودة الحية، حفظ عبر
   save (وراءه store.saveDraft بنسخة متوقعة ترفض التعارض الصامت)، وقيود
   عقد «مرآة المصدر» معروضة حية قبل أن تحسمها بوابات validate الحاجبة.
   لا اختلاق قيم: التعريفات ملك «خطة عمل المشروع V.1.0.0» — التحرير هنا
   لمواكبة تحديثات الوثيقة نفسها، ويُسجَّل بالكامل في سجل التدقيق. */
"use strict";

RH.admin.editors2 = RH.admin.editors2 || {};

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  const PILLAR_KINDS = ["ركيزة", "ممكن"];
  const ST_DONE = "منجزة";
  const ST_ONGOING = "جاري العمل";
  const ST_LATE = "متأخرة";
  const ST_NOT_STARTED = "لم يتم البدء";

  // ── أدوات نماذج مطابقة لنمط editors.js (نسخ محلية — الوحدة الأم لا تصدّرها) ──
  function field(label, input, hint) {
    return h("div", { class: "fitem" },
      h("label", {}, label), input,
      hint ? h("div", { class: "hint" }, hint) : null);
  }
  function textInput(value, onInput, attrs) {
    return h("input", Object.assign({
      type: "text", value: value == null ? "" : value,
      oninput: (e) => onInput(e.target.value),
    }, attrs || {}));
  }
  function dateInput(value, onInput) {
    return h("input", {
      type: "date", value: value || "",
      oninput: (e) => onInput(e.target.value || null),
    });
  }
  function select(value, options, onChange, attrs) {
    return h("select", Object.assign({ onchange: (e) => onChange(e.target.value) }, attrs || {}),
      options.map(([v, label]) =>
        h("option", { value: v, selected: v === value ? "" : null }, label)));
  }

  /** اسم الفاعل لسجل التدقيق — من الجلسة الإدارية الحالية */
  function actor() {
    const s = RH.admin.auth.session();
    return (s && s.name) || "غير معروف";
  }

  // ═══ قاعدة الحالة المحتسبة — مرآة generate_data.py:ini_state حرفياً ═══
  /** يعيد {status, computed}: computed=true عندما تكون الحالة محتسبة حكماً
      من التواريخ لا منقولة من الملف. المقارنة نصية على ISO (سليمة ترتيبياً). */
  function effectiveStatus(ini, calcDate) {
    if (ini.status) return { status: ini.status, computed: false };
    if (ini.end && ini.end < calcDate) return { status: ST_LATE, computed: true };
    if (ini.start && ini.start <= calcDate) return { status: ST_ONGOING, computed: true };
    return { status: ST_NOT_STARTED, computed: true };
  }

  /** أعداد الحالات الفعلية (بعد تطبيق القاعدة) لكل مفردات الحالة */
  function statusCounts(st, calcDate) {
    const counts = {};
    counts[ST_DONE] = 0; counts[ST_ONGOING] = 0;
    counts[ST_LATE] = 0; counts[ST_NOT_STARTED] = 0;
    let computedLate = 0;
    for (const ini of st.initiatives) {
      const es = effectiveStatus(ini, calcDate);
      counts[es.status] = (counts[es.status] || 0) + 1;
      if (es.computed && es.status === ST_LATE) computedLate++;
    }
    return { counts, computedLate };
  }

  /** صنف عرض الحالة — منظومة المعنى: المتأخرة خلل (مرجاني) حصراً */
  function statusCls(status) {
    if (status === ST_DONE) return "ok";
    if (status === ST_LATE) return "bad";
    if (status === ST_ONGOING) return "info";
    return "mut";
  }

  /** تاريخ ISO سليم (أو غائب بصدق) */
  function isoOk(s) {
    return s == null || (/^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)));
  }

  // ═══ فحوص عقد «مرآة المصدر» الحية — مرآة بوابات validate الحاجبة ═══
  function contractChecks(st) {
    const checks = [];
    const c = (ok, label, detail) => checks.push({ ok: !!ok, label, detail: detail || "" });
    const pillarIds = st.pillars.map((p) => p.id);
    const kinds = st.pillars.map((p) => p.kind);
    c(st.pillars.length === 4 && st.required_pillars === 4
      && new Set(pillarIds).size === 4
      && kinds.filter((k) => k === "ركيزة").length === 3
      && kinds.filter((k) => k === "ممكن").length === 1,
      "4 محاور بمعرفات فريدة: 3 «ركيزة» + 1 «ممكن»",
      "الموجود: " + fmt.int(st.pillars.length));
    const iniIds = st.initiatives.map((i) => i.id);
    c(st.initiatives.length === 18 && new Set(iniIds).size === 18,
      "18 مبادرة بمعرفات فريدة",
      "الموجود: " + fmt.noun(st.initiatives.length, "initiative"));
    c(st.initiatives.every((i) => pillarIds.includes(i.pillar_id)),
      "كل مبادرة تنتمي لمحور معرَّف");
    c(st.initiatives.every((i) => isoOk(i.start) && isoOk(i.end)
      && (!i.start || !i.end || i.start <= i.end)),
      "تواريخ ISO سليمة وتاريخ البدء ≤ النهاية حيث وُجدا");
    const vocab = st.status_vocabulary || [];
    c(st.initiatives.every((i) => i.status == null || vocab.includes(i.status)),
      "حالة كل مبادرة من المفردات المعتمدة أو فارغة بصدق (تُحتسب حكماً)");
    return checks;
  }

  /** اقتراح معرف مبادرة جديد داخل محور: «رقم المحور.التسلسل التالي» */
  function suggestInitiativeId(st, pillarId) {
    const pn = String(pillarId || "").replace(/\D/g, "") || "0";
    let maxSeq = 0;
    for (const ini of st.initiatives) {
      const m = /^(\d+)\.(\d+)$/.exec(String(ini.id));
      if (m && m[1] === pn) maxSeq = Math.max(maxSeq, parseInt(m[2], 10));
    }
    return pn + "." + (maxSeq + 1);
  }

  // ═══ التبويب: «الاستراتيجية» — المحاور والمبادرات ═══
  function strategy(container, draft, save) {
    const st = draft.strategy;
    if (!st) {
      RH.core.dom.clear(container).appendChild(h("div", { class: "adm-card" },
        h("h3", {}, "لا عقد استراتيجية في هذه المسودة"),
        h("div", { class: "sub" },
          "المسودة أقدم من عقد V2 — افتح مسودة جديدة من الإصدار المنشور الحالي.")));
      return;
    }
    const calcDate = draft.meta.calculation_date;
    const root = h("div", {});

    // ── بطاقة المصدر المعتمد (مرآة لا تأليف) ──
    root.appendChild(h("div", { class: "adm-card" },
      h("h3", {}, "مصدر الاستراتيجية — مرآة الوثيقة المعتمدة"),
      h("div", { class: "sub" },
        "المحاور والمبادرات منقولة حرفياً من المصدر المعتمد؛ التحرير هنا لمواكبة "
        + "تحديثات الوثيقة نفسها لا لتأليف بنود — الحقول الغائبة تبقى فارغة بصدق."),
      h("div", { class: "frow" },
        h("div", { class: "fitem locked" },
          h("label", {}, "الوثيقة المصدر"),
          h("input", { type: "text", value: st.source || "", readonly: "" }),
          h("div", { class: "hint" }, "تُحدَّث من مسار البيانات الموثوق حصراً")),
        field("حالة الاعتماد", select(st.status, [
          ["approved_source_mirror", "معتمدة — مرآة المصدر (بوابات العقد الكامل فعّالة)"],
          ["pending_source", "بانتظار الوثيقة المعتمدة (النشر الكامل محجوب)"],
        ], (v) => { st.status = v; rerender(); }),
          "«معتمدة» تفعّل البوابات الحاجبة: 4 محاور، 18 مبادرة، الانتماء، التواريخ، المفردات"),
      ),
      st.note ? h("div", { class: "hint" }, st.note) : null,
    ));

    // ── بطاقة قاعدة «متأخرة حكماً» + الأعداد الحية ──
    const sc = statusCounts(st, calcDate);
    root.appendChild(h("div", { class: "adm-card" },
      h("h3", {}, "قاعدة الحالة المحتسبة («متأخرة حكماً»)"),
      h("div", { class: "sub" }, st.status_rule || ""),
      h("div", { class: "frow" },
        h("div", { class: "fitem locked" },
          h("label", {}, "تاريخ الحساب المعتمد"),
          h("input", { type: "text", value: fmt.date(calcDate), readonly: "" }),
          h("div", { class: "hint" },
            "من البيانات الوصفية (calculation_date) — يُحدَّث بالاستيراد حصراً")),
        h("div", { class: "fitem" },
          h("label", {}, "الحالات الفعلية بعد تطبيق القاعدة"),
          h("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" } },
            h("span", { class: "st ok" }, "منجزة: " + fmt.noun(sc.counts[ST_DONE], "initiative")),
            h("span", { class: "st info" }, "جاري العمل: " + fmt.noun(sc.counts[ST_ONGOING], "initiative")),
            h("span", { class: "st bad" }, "متأخرة: " + fmt.noun(sc.counts[ST_LATE], "initiative")
              + (sc.computedLate ? " (منها " + fmt.noun(sc.computedLate, "initiative") + " حكماً)" : "")),
            h("span", { class: "st mut" }, "لم يتم البدء: " + fmt.noun(sc.counts[ST_NOT_STARTED], "initiative")),
          ),
          h("div", { class: "hint" },
            "الأعداد تظهر في نصوص لوحات الرؤى المعتمدة — أي تعديل يغيّرها "
            + "استوجب مراجعة تلك النصوص في تبويب «لوحات الرؤى»")),
      ),
    ));

    // ── فحوص العقد الحية ──
    const checks = contractChecks(st);
    const checksCard = h("div", { class: "adm-card" },
      h("h3", {}, "فحوص عقد «مرآة المصدر» (حية)"),
      h("div", { class: "sub" },
        "المرآة الحية للبوابات الحاجبة في «التحقق والنشر» — أصلِح الأحمر هنا قبل النشر"));
    for (const c of checks) {
      checksCard.appendChild(h("div", { class: "qgate " + (c.ok ? "pass" : "block") },
        h("span", { class: "st " + (c.ok ? "ok" : "bad") }, c.ok ? "مجتاز" : "مخالف"),
        h("div", { style: { flex: "1" } },
          h("div", { class: "qname" }, c.label),
          c.detail ? h("div", { class: "qdetail" }, c.detail) : null)));
    }
    root.appendChild(checksCard);

    // ── المحاور الأربعة ──
    const pillarsCard = h("div", { class: "adm-card" },
      h("h3", {}, "المحاور (" + fmt.int(st.pillars.length) + " من "
        + fmt.int(st.required_pillars) + ")"),
      h("div", { class: "sub" },
        "3 «ركيزة» + 1 «ممكن» بأسمائها الحرفية من خطة العمل؛ المعرفات ثابتة "
        + "لأن المبادرات تنتمي إليها"),
    );
    const pt = h("table", { class: "adm-table" },
      h("thead", {}, h("tr", {},
        ["المعرف", "النوع", "الاسم الحرفي", "مبادراته", ""].map((c) => h("th", {}, c)))));
    const ptb = h("tbody", {});
    st.pillars.forEach((p, i) => {
      const belong = st.initiatives.filter((x) => x.pillar_id === p.id).length;
      ptb.appendChild(h("tr", {},
        h("td", {}, h("span", { class: "rid" }, p.id)),
        h("td", {}, select(p.kind || "", [["", "—"]]
          .concat(PILLAR_KINDS.map((k) => [k, k])),
          (v) => { p.kind = v || null; rerender(); },
          { style: { width: "92px" } })),
        h("td", { style: { minWidth: "260px" } },
          textInput(p.name, (v) => { p.name = v.trim(); })),
        h("td", {}, fmt.noun(belong, "initiative")),
        h("td", { class: "cell-actions" },
          h("button", { class: "danger", onclick: () => {
            if (belong > 0) {
              RH.admin.shell.toast("لا يمكن حذف محور له مبادرات — انقلها أولاً");
              return;
            }
            if (!confirm("حذف المحور «" + (p.name || p.id) + "»؟")) return;
            st.pillars.splice(i, 1); rerender();
          } }, "حذف")),
      ));
    });
    pt.appendChild(ptb);
    pillarsCard.appendChild(h("div", { style: { overflowX: "auto" } }, pt));
    if (st.pillars.length < st.required_pillars) {
      pillarsCard.appendChild(h("button", { class: "btn btn-line", onclick: () => {
        let n = st.pillars.length + 1;
        while (st.pillars.some((p) => p.id === "p" + n)) n++;
        st.pillars.push({ id: "p" + n, kind: "ركيزة", name: "" });
        rerender();
      } }, "إضافة محور"));
    }
    root.appendChild(pillarsCard);

    // ── المبادرات الثماني عشرة ──
    const vocab = st.status_vocabulary || [ST_DONE, ST_ONGOING, ST_LATE, ST_NOT_STARTED];
    const iniCard = h("div", { class: "adm-card" },
      h("h3", {}, "المبادرات (" + fmt.int(st.initiatives.length) + " من 18)"),
      h("div", { class: "sub" },
        "حالة الملف تُنقل كما هي أو تُترك فارغة بصدق فتُحتسب حكماً من التواريخ — "
        + "عمود «الحالة الفعلية» يطبّق القاعدة أمامك فورياً"),
    );
    const it = h("table", { class: "adm-table" },
      h("thead", {}, h("tr", {},
        ["المعرف", "المحور", "المبادرة (حرفياً)", "البدء", "النهاية",
          "حالة الملف", "الحالة الفعلية", ""].map((c) => h("th", {}, c)))));
    const itb = h("tbody", {});
    const iniIds = st.initiatives.map((x) => x.id);
    st.initiatives.forEach((ini, i) => {
      const es = effectiveStatus(ini, calcDate);
      const dup = iniIds.filter((x) => x === ini.id).length > 1;
      const datesBad = !(isoOk(ini.start) && isoOk(ini.end)
        && (!ini.start || !ini.end || ini.start <= ini.end));
      itb.appendChild(h("tr", {},
        h("td", {},
          textInput(ini.id, (v) => { ini.id = v.trim(); },
            { style: { width: "58px" }, "aria-label": "معرف المبادرة" }),
          dup ? h("div", { class: "st bad", style: { marginTop: "4px" } }, "معرف مكرر") : null),
        h("td", {}, select(ini.pillar_id || "", [["", "—"]]
          .concat(st.pillars.map((p) => [p.id, p.name || p.id])),
          (v) => { ini.pillar_id = v || null; rerender(); },
          { style: { maxWidth: "180px" } })),
        h("td", { style: { minWidth: "240px" } },
          textInput(ini.name, (v) => { ini.name = v.trim(); })),
        h("td", {}, dateInput(ini.start, (v) => { ini.start = v; rerender(); })),
        h("td", {},
          dateInput(ini.end, (v) => { ini.end = v; rerender(); }),
          datesBad ? h("div", { class: "st bad", style: { marginTop: "4px" } },
            "البدء بعد النهاية") : null),
        h("td", {}, select(ini.status || "", [["", "— تُحتسب حكماً"]]
          .concat(vocab.map((s) => [s, s])),
          (v) => { ini.status = v || null; rerender(); },
          { style: { width: "130px" } })),
        h("td", {},
          h("span", { class: "st " + statusCls(es.status) },
            es.status + (es.computed && es.status === ST_LATE ? " حكماً" : "")),
          es.computed
            ? h("div", { class: "hint", style: { marginTop: "3px" } }, "محتسبة من التواريخ")
            : h("div", { class: "hint", style: { marginTop: "3px" } }, "من الملف")),
        h("td", { class: "cell-actions" },
          h("button", { class: "danger", onclick: () => {
            if (!confirm("حذف المبادرة «" + (ini.name || ini.id) + "»؟")) return;
            st.initiatives.splice(i, 1); rerender();
          } }, "حذف")),
      ));
    });
    it.appendChild(itb);
    iniCard.appendChild(h("div", { style: { overflowX: "auto" } }, it));
    iniCard.appendChild(h("button", { class: "btn btn-line", onclick: () => {
      const pid = st.pillars[0] ? st.pillars[0].id : null;
      st.initiatives.push({ id: suggestInitiativeId(st, pid), pillar_id: pid,
        name: "", start: null, end: null, status: null });
      rerender();
    } }, "إضافة مبادرة"));
    root.appendChild(iniCard);

    // ── الحفظ (المسار الموحد: save → store.saveDraft بنسخة متوقعة) + تدقيق ──
    root.appendChild(h("button", { class: "btn btn-primary", onclick: async () => {
      await save();
      const after = statusCounts(st, calcDate);
      RH.data.store.audit(actor(), "draft.strategy_save", {
        pillars: st.pillars.length,
        initiatives: st.initiatives.length,
        done: after.counts[ST_DONE],
        ongoing: after.counts[ST_ONGOING],
        late: after.counts[ST_LATE],
        computed_late: after.computedLate,
        not_started: after.counts[ST_NOT_STARTED],
      });
    } }, "حفظ المسودة"));

    function rerender() { strategy(container, draft, save); }
    RH.core.dom.clear(container).appendChild(root);
  }

  RH.admin.editors2.effectiveStatus = effectiveStatus;
  RH.admin.editors2.statusCounts = statusCounts;
  RH.admin.editors2.contractChecks = contractChecks;
  RH.admin.editors2.strategy = strategy;
})();
