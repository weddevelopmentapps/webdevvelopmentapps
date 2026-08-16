/* editors.js — محررات المسودة
   ─────────────────────────────
   كل محرر يعمل على كائن «المسودة» الحية ويحفظ عبر store.saveDraft بنسخة متوقعة
   (رفض تعارضات التحرير). صلاحية التحرير لأدوار editor فأعلى. المدخلات تُتحقق
   وتُنظف: أرقام via Number مع رفض NaN، نصوص via trim، ولا HTML خام إطلاقاً. */
"use strict";

RH.admin.editors = (function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  // ── أدوات نماذج مشتركة ──
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
  function numInput(value, onInput, attrs) {
    return h("input", Object.assign({
      type: "number", value: value == null ? "" : value,
      oninput: (e) => {
        const v = e.target.value === "" ? null : Number(e.target.value);
        onInput(v != null && Number.isFinite(v) ? v : null);
      },
    }, attrs || {}));
  }
  function dateInput(value, onInput) {
    return h("input", {
      type: "date", value: value || "",
      oninput: (e) => onInput(e.target.value || null),
    });
  }
  function select(value, options, onChange) {
    const el = h("select", { onchange: (e) => onChange(e.target.value) },
      options.map(([v, label]) =>
        h("option", { value: v, selected: v === value ? "" : null }, label)));
    return el;
  }
  function checkbox(checked, label, onChange) {
    const id = "cb-" + Math.random().toString(36).slice(2, 8);
    return h("div", { style: { display: "flex", gap: "8px", alignItems: "center" } },
      h("input", { type: "checkbox", id, checked: checked ? "" : null,
        onchange: (e) => onChange(e.target.checked) }),
      h("label", { for: id, style: { margin: 0 } }, label));
  }

  // ═══ البيانات الوصفية والتواريخ المنفصلة ═══
  function metadata(container, draft, save) {
    const m = draft.meta;
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "البيانات الوصفية للعرض"),
      h("div", { class: "sub" },
        "العنوان والتواريخ حقول محوكمة منفصلة — لا تُكتب في الواجهة يدوياً أبداً"),
      h("div", { class: "frow single" },
        field("عنوان العرض", textInput(m.title, (v) => { m.title = v.trim(); }))),
      h("div", { class: "frow" },
        field("تاريخ العرض التقديمي (presentation_date)",
          dateInput(m.presentation_date, (v) => { m.presentation_date = v; }),
          "تاريخ إلقاء العرض أمام أمين المنطقة"),
        field("تاريخ فعالية البيانات (data_as_of)",
          textInput(m.data_as_of, (v) => { m.data_as_of = v.trim(); }),
          "يُعرض «البيانات حتى …» — يأتي عادة من ملف الورقة"),
      ),
      h("div", { class: "frow" },
        field("بداية فترة الرقابة", textInput(m.monitoring_period_label.split(" – ")[0] || "",
          (v) => { m.monitoring_period_label = v.trim() + " – " + (m.monitoring_period_label.split(" – ")[1] || ""); })),
        field("نهاية فترة الرقابة", textInput(m.monitoring_period_label.split(" – ")[1] || "",
          (v) => { m.monitoring_period_label = (m.monitoring_period_label.split(" – ")[0] || "") + " – " + v.trim(); })),
      ),
      h("div", { class: "frow" },
        h("div", { class: "fitem locked" },
          h("label", {}, "تاريخ الاحتساب (calculation_date)"),
          h("input", { type: "text", value: m.calculation_date, readonly: "" }),
          h("div", { class: "hint" }, "يأتي من ملف الورقة حصراً — يُحدَّث بالاستيراد")),
        field("", checkbox(!!m.presentation_date_needs_confirmation,
          "تاريخ العرض يحتاج تأكيداً قبل يوم العرض (إنذار جودة)",
          (v) => { m.presentation_date_needs_confirmation = v; })),
      ),
      h("button", { class: "btn btn-primary", onclick: save }, "حفظ المسودة"),
    );
    RH.core.dom.clear(container).appendChild(card);
  }

  // ═══ التحليلات المعتمدة ═══
  function insights(container, draft, save) {
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "التحليلات المعتمدة"),
      h("div", { class: "sub" },
        "كل تحليل جملة واحدة بقيمة دقيقة، مربوط بمقاييسه؛ تُفحص أرقامه ضد الإصدار عند النشر"),
    );
    const SCENES = { s03: "المشهد 03 — الطلب", s04: "المشهد 04 — التركز الجغرافي",
      s05: "المشهد 05 — خط الأساس", s06: "المشهد 06 — توزيع التراخيص",
      s07: "المشهد 07 — الرقابة" };
    for (const [key, ins] of Object.entries(draft.insights)) {
      const ta = h("textarea", {
        oninput: (e) => { ins.text = e.target.value.trim(); },
      }, ins.text);
      const statusEl = h("span", { class: "st " + (ins.status === "needs_review" ? "warn" : "ok") },
        ins.status === "needs_review" ? "يحتاج إعادة اعتماد بعد تغير البيانات"
          : ins.status === "approved_brief" ? "معتمد من التكليف" : "معتمد");
      card.appendChild(h("div", { style: { marginBottom: "18px" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center", gap: "10px" } },
          h("label", { style: { fontWeight: 700, fontSize: "12.5px" } }, SCENES[key] || key),
          h("span", { style: { display: "flex", gap: "10px", alignItems: "center" } },
            statusEl,
            ins.status === "needs_review"
              ? h("button", { class: "btn btn-line", onclick: () => {
                ins.status = "approved";
                RH.admin.shell.toast("اعتُمد نص التحليل بعد المراجعة");
                insights(container, draft, save);
              } }, "روجع — اعتماد")
              : null),
        ),
        ta,
        h("div", { class: "hint" }, "المقاييس المرتبطة: " + ins.metric_ids.join("، ")
          + " — أرقام النص تُفحص ضد بيانات الإصدار ببوابة حاجبة عند النشر"),
      ));
    }
    card.appendChild(h("button", { class: "btn btn-primary", onclick: save }, "حفظ المسودة"));
    RH.core.dom.clear(container).appendChild(card);
  }

  // ═══ الاستراتيجية: الركائز والمبادرات والمؤشرات ═══
  const EXEC_STATES = ["لم تبدأ", "قيد التنفيذ", "مكتملة", "متوقفة"];
  const SCHED_STATES = ["وفق الخطة", "معرّضة للتأخر", "متأخرة", "متعثرة"];

  function strategy(container, draft, save) {
    const st = draft.strategy;
    const root = h("div", {});

    // حالة المصدر
    root.appendChild(h("div", { class: "adm-card" },
      h("h3", {}, "مصدر الاستراتيجية"),
      h("div", { class: "sub" },
        "تعريفات الركائز والمبادرات والمؤشرات ملك للوثيقة المعتمدة — لا يكتمل النشر إلا بها"),
      h("div", { class: "frow" },
        field("الوثيقة المطلوبة", textInput(st.source_required,
          (v) => { st.source_required = v.trim(); })),
        field("حالة الاعتماد", select(st.status, [
          ["pending_source", "بانتظار الوثيقة المعتمدة (النشر الكامل محجوب)"],
          ["approved", "معتمدة — الوثيقة مرفقة ومدخلة"],
        ], (v) => { st.status = v; rerender(); }),
          "التحويل إلى «معتمدة» يفعّل بوابات: 7 ركائز كاملة، انتماء المبادرات، قيم المؤشرات"),
      ),
      h("div", { class: "frow single" },
        field("قاعدة الأوزان", select(st.weights_rule || "", [
          ["", "غير محددة (يحجب النسبة الإجمالية الدقيقة)"],
          ["equal", "أوزان متساوية معتمدة صراحة"],
          ["explicit", "أوزان صريحة لكل مبادرة وركيزة"],
        ], (v) => {
          st.weights_rule = v || null;
          if (v === "equal") {
            for (const i of st.initiatives) i.weight = 1;
            for (const p of st.pillars) p.weight = 1;
          }
        })),
      ),
    ));

    // الركائز
    const pillarsCard = h("div", { class: "adm-card" },
      h("h3", {}, "الركائز (" + st.pillars.length + " من " + st.required_pillars + ")"),
      h("div", { class: "sub" }, "مكوّن N-ركائز حتى سبع؛ الترتيب يُعرض كما هنا"),
    );
    const pt = h("table", { class: "adm-table" },
      h("thead", {}, h("tr", {},
        ["الاسم الكامل", "الاسم المختصر", "الوزن", ""].map((c) => h("th", {}, c)))));
    const ptb = h("tbody", {});
    st.pillars.forEach((p, i) => {
      ptb.appendChild(h("tr", {},
        h("td", {}, textInput(p.name, (v) => { p.name = v.trim(); })),
        h("td", {}, textInput(p.short || "", (v) => { p.short = v.trim(); })),
        h("td", {}, numInput(p.weight, (v) => { p.weight = v; }, { min: 0, step: 0.1, style: { width: "80px" } })),
        h("td", { class: "cell-actions" },
          h("button", { class: "danger", onclick: () => {
            if (st.initiatives.some((x) => x.pillar_id === p.id)) {
              RH.admin.shell.toast("لا يمكن حذف ركيزة لها مبادرات"); return;
            }
            st.pillars.splice(i, 1); rerender();
          } }, "حذف")),
      ));
    });
    pt.appendChild(ptb);
    pillarsCard.appendChild(h("div", { style: { overflowX: "auto" } }, pt));
    if (st.pillars.length < st.required_pillars) {
      pillarsCard.appendChild(h("button", { class: "btn btn-line", onclick: () => {
        st.pillars.push({ id: "p" + Date.now().toString(36), name: "", short: "", weight: 1 });
        rerender();
      } }, "إضافة ركيزة"));
    }
    root.appendChild(pillarsCard);

    // المبادرات
    const iniCard = h("div", { class: "adm-card" },
      h("h3", {}, "المبادرات (" + st.initiatives.length + ")"),
      h("div", { class: "sub" },
        "نسبة الإنجاز حقل صريح 0–100 — لا تُشتق من الحالة أبداً؛ «قيد التنفيذ» لا تعني 50٪"),
    );
    const it = h("table", { class: "adm-table" },
      h("thead", {}, h("tr", {},
        ["المبادرة", "الركيزة", "نسبة الإنجاز", "الوزن", "حالة التنفيذ", "حالة الجدول",
          "الجهة المسؤولة", "تاريخ الاستحقاق", ""].map((c) => h("th", {}, c)))));
    const itb = h("tbody", {});
    st.initiatives.forEach((ini, i) => {
      itb.appendChild(h("tr", {},
        h("td", { style: { minWidth: "220px" } },
          textInput(ini.name, (v) => { ini.name = v.trim(); })),
        h("td", {}, select(ini.pillar_id || "", [["", "—"]]
          .concat(st.pillars.map((p) => [p.id, p.short || p.name || p.id])),
          (v) => { ini.pillar_id = v || null; })),
        h("td", {}, numInput(ini.progress_percent, (v) => {
          ini.progress_percent = v == null ? null : Math.max(0, Math.min(100, v));
        }, { min: 0, max: 100, style: { width: "72px" } })),
        h("td", {}, numInput(ini.weight, (v) => { ini.weight = v; },
          { min: 0, step: 0.1, style: { width: "64px" } })),
        h("td", {}, select(ini.execution_status || "", [["", "—"]]
          .concat(EXEC_STATES.map((s) => [s, s])), (v) => { ini.execution_status = v || null; })),
        h("td", {}, select(ini.schedule_status || "", [["", "—"]]
          .concat(SCHED_STATES.map((s) => [s, s])), (v) => { ini.schedule_status = v || null; })),
        h("td", {}, textInput(ini.owner || "", (v) => { ini.owner = v.trim() || null; })),
        h("td", {}, dateInput(ini.due, (v) => { ini.due = v; })),
        h("td", { class: "cell-actions" },
          h("button", { class: "danger", onclick: () => { st.initiatives.splice(i, 1); rerender(); } }, "حذف")),
      ));
    });
    it.appendChild(itb);
    iniCard.appendChild(h("div", { style: { overflowX: "auto" } }, it));
    iniCard.appendChild(h("button", { class: "btn btn-line", onclick: () => {
      st.initiatives.push({ id: "i" + Date.now().toString(36), name: "",
        pillar_id: st.pillars[0] ? st.pillars[0].id : null,
        progress_percent: null, weight: st.weights_rule === "equal" ? 1 : null,
        execution_status: null, schedule_status: null, owner: null, due: null });
      rerender();
    } }, "إضافة مبادرة"));
    root.appendChild(iniCard);

    // المؤشرات
    const kpiCard = h("div", { class: "adm-card" },
      h("h3", {}, "مؤشرات الأداء (" + st.kpis.length + ")"),
      h("div", { class: "sub" },
        "القيمة الحالية الغائبة تبقى غائبة (لا صفر زائف) وتحجب نشر مؤشرات الأولوية دون تنازل"),
    );
    const kt = h("table", { class: "adm-table" },
      h("thead", {}, h("tr", {},
        ["المؤشر", "الوحدة", "خط الأساس", "المستهدف", "القيمة الحالية", "اتجاه التحسن",
          "أولوية", "الجهة", "تاريخ القياس", "المصدر", ""].map((c) => h("th", {}, c)))));
    const ktb = h("tbody", {});
    st.kpis.forEach((k, i) => {
      ktb.appendChild(h("tr", {},
        h("td", { style: { minWidth: "200px" } }, textInput(k.name, (v) => { k.name = v.trim(); })),
        h("td", {}, textInput(k.unit || "", (v) => { k.unit = v.trim() || null; },
          { style: { width: "70px" } })),
        h("td", {}, numInput(k.baseline, (v) => { k.baseline = v; }, { style: { width: "84px" } })),
        h("td", {}, numInput(k.target, (v) => { k.target = v; }, { style: { width: "84px" } })),
        h("td", {}, numInput(k.current_value, (v) => { k.current_value = v; },
          { style: { width: "84px" } })),
        h("td", {}, select(k.direction || "higher_better", [
          ["higher_better", "الارتفاع أفضل"], ["lower_better", "الانخفاض أفضل"],
        ], (v) => { k.direction = v; })),
        h("td", {}, checkbox(!!k.priority, "", (v) => { k.priority = v; })),
        h("td", {}, textInput(k.owner || "", (v) => { k.owner = v.trim() || null; })),
        h("td", {}, dateInput(k.as_of, (v) => { k.as_of = v; })),
        h("td", {}, textInput(k.source || "", (v) => { k.source = v.trim() || null; })),
        h("td", { class: "cell-actions" },
          h("button", { class: "danger", onclick: () => { st.kpis.splice(i, 1); rerender(); } }, "حذف")),
      ));
    });
    kt.appendChild(ktb);
    kpiCard.appendChild(h("div", { style: { overflowX: "auto" } }, kt));
    kpiCard.appendChild(h("button", { class: "btn btn-line", onclick: () => {
      st.kpis.push({ id: "k" + Date.now().toString(36), name: "", unit: null,
        baseline: null, target: null, current_value: null, direction: "higher_better",
        priority: false, owner: null, as_of: null, source: null, waiver: null });
      rerender();
    } }, "إضافة مؤشر"));
    root.appendChild(kpiCard);

    root.appendChild(h("button", { class: "btn btn-primary", onclick: save }, "حفظ المسودة"));

    function rerender() { strategy(container, draft, save); }
    RH.core.dom.clear(container).appendChild(root);
  }

  // ═══ الخطوات القادمة ═══
  function nextSteps(container, draft, save) {
    const ns = draft.next_steps;
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "الخطوات القادمة والقرارات المطلوبة"),
      h("div", { class: "sub" },
        "3–4 بنود معتمدة تظهر للمقدِّم؛ ما دون الاعتماد يبقى مسودة إدارية ولا يُنشر"),
      h("div", { class: "frow single" },
        field("حالة الاعتماد", select(ns.status, [
          ["pending_approval", "قيد الاعتماد (يُعرض مشهد الحالة الشريفة)"],
          ["approved", "معتمدة — تُعرض البنود أدناه"],
        ], (v) => { ns.status = v; rerender(); })),
      ),
    );
    ns.items.forEach((item, i) => {
      card.appendChild(h("div", {
        style: { border: "1px solid var(--hair)", borderRadius: "12px",
          padding: "16px", marginBottom: "14px" } },
        h("div", { class: "frow single" },
          field("الإجراء", textInput(item.action, (v) => { item.action = v.trim(); }))),
        h("div", { class: "frow" },
          field("الجهة المسؤولة (إن اعتُمدت)", textInput(item.owner || "",
            (v) => { item.owner = v.trim() || null; })),
          field("تاريخ الاستحقاق (إن اعتُمد)", dateInput(item.due, (v) => { item.due = v; })),
        ),
        h("div", { class: "frow" },
          field("حالة التنفيذ", textInput(item.status || "",
            (v) => { item.status = v.trim() || null; })),
          field("القرار المطلوب", textInput(item.decision || "",
            (v) => { item.decision = v.trim() || null; })),
        ),
        h("button", { class: "btn btn-danger-quiet", onclick: () => {
          ns.items.splice(i, 1); rerender();
        } }, "حذف البند"),
      ));
    });
    if (ns.items.length < 4) {
      card.appendChild(h("button", { class: "btn btn-line", onclick: () => {
        ns.items.push({ action: "", owner: null, due: null, status: null, decision: null });
        rerender();
      } }, "إضافة بند"));
    }
    card.appendChild(h("div", { style: { marginTop: "16px" } },
      h("button", { class: "btn btn-primary", onclick: save }, "حفظ المسودة")));

    function rerender() { nextSteps(container, draft, save); }
    RH.core.dom.clear(container).appendChild(card);
  }

  // ═══ استيراد الورقة ═══
  function importer(container, draft, save) {
    const zone = h("div", { class: "drop-zone" },
      h("div", { style: { fontWeight: 700, marginBottom: "6px" } },
        "أسقط ملف platform-data.xlsx هنا أو اختر ملفاً"),
      h("div", {}, "‎.xlsx فقط · قالب V1 · يُرفض الماكرو والتشفير والروابط الخارجية"),
      h("input", { type: "file", accept: ".xlsx", style: { marginTop: "14px" },
        onchange: (e) => { if (e.target.files[0]) run(e.target.files[0]); } }),
    );
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("hover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("hover"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("hover");
      if (e.dataTransfer.files[0]) run(e.dataTransfer.files[0]);
    });

    const out = h("div", {});
    const card = h("div", { class: "adm-card" },
      h("h3", {}, "استيراد ملف البيانات"),
      h("div", { class: "sub" },
        "معاينة في المتصفح وفق بيان المراسي V1؛ الاعتماد النهائي يعيد التحليل في المسار الموثوق (tools/import_workbook.py أو الدالة الطرفية عند تفعيل Supabase)"),
      zone, out);

    async function run(file) {
      RH.core.dom.clear(out).appendChild(h("p", {}, "جارٍ الفحص…"));
      const res = await RH.data.importXlsx.importFile(file);
      RH.core.dom.clear(out);
      if (res.warnings.length) {
        out.appendChild(h("div", { class: "adm-card", style: { background: "#FFF8EC" } },
          h("h3", {}, "تنبيهات"),
          h("ul", {}, res.warnings.map((w) => h("li", { class: "st warn" }, w)))));
      }
      if (!res.ok) {
        out.appendChild(h("div", { class: "adm-card", style: { background: "#FDF1EF" } },
          h("h3", {}, "رُفض الملف (" + fmt.int(res.errors.length) + " خطأ)"),
          h("ul", {}, res.errors.map((er) => h("li", { class: "st bad",
            style: { display: "flex", padding: "4px 0" } }, er)))));
        return;
      }
      const diff = res.diff;
      const table = h("table", { class: "adm-table import-diff" },
        h("thead", {}, h("tr", {},
          ["القيمة", "المنشور الحالي", "الملف الجديد", ""].map((c) => h("th", {}, c)))),
        h("tbody", {}, diff.rows.map((r) => h("tr", {},
          h("td", {}, r.label),
          h("td", { class: "num" }, fmt.int(r.oldV)),
          h("td", { class: "num" }, fmt.int(r.newV)),
          h("td", {}, r.changed
            ? h("span", { class: "chg" }, "تغيّر")
            : h("span", { class: "same" }, "بلا تغيير")),
        ))));
      out.appendChild(h("div", { class: "adm-card" },
        h("h3", {}, "اجتاز الملف كل الفحوص"),
        h("div", { class: "sub" },
          `${fmt.int(diff.changed)} قيمة متغيرة من ${fmt.int(diff.rows.length)} معروضة — راجع ثم طبّق على المسودة`),
        h("div", { style: { maxHeight: "320px", overflowY: "auto" } }, table),
        h("div", { style: { marginTop: "14px", display: "flex", gap: "10px" } },
          h("button", { class: "btn btn-primary", onclick: async () => {
            try {
              RH.data.importXlsx.applyToDraft(draft, res.extracted, {
                name: file.name, size: file.size, sha256: null,
              });
            } catch (ex) {
              RH.admin.shell.toast(ex.message || "رُفض تطبيق الاستيراد");
              return;
            }
            await save();
            RH.admin.shell.toast("طُبّق الاستيراد على المسودة — وُسمت نصوص التحليلات لإعادة الاعتماد؛ راجع فحوص الجودة ثم انشر");
          } }, "تطبيق على المسودة"),
          h("span", { class: "hint", style: { alignSelf: "center" } },
            "الملف الأصلي لا يُخزن في المتصفح ولا يُنشر — يُحفظ في المسار الخاص فقط"),
        ),
      ));
    }

    RH.core.dom.clear(container).appendChild(card);
  }

  return { metadata, insights, strategy, nextSteps, importer };
})();
