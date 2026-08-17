/* ════════════════════════════════════════════════════════════════════════════
   s05-map.js — القسم 5: «خريطة الرياض التفاعلية» — القيادة الجغرافية الكاملة
   ────────────────────────────────────────────────────────────────────────────
   لوحة القيادة الجغرافية (عقد V2_CONTRACTS §1 — order:5, id:"map"):

     ▸ شريط ستة مؤشرات كبرى أعلى الشاشة (كل رقم قابل للنقر → بطاقة تفصيلية):
         1. أحياء الرياض الممثلة    189 حياً بحدود lat/lng حقيقية (MIT)
         2. عينة الأحياء الموثقة     20 حياً بقيم أسرّة/رخص/مخالفات من القاعدة
         3. نقاط التركّز الرقابي     40 نقطة (مواقع توضيحية من سجل المنصة)
         4. الطاقة المرخصة الموزعة   612.4 ألف سرير على القطاعات الخمسة
         5. أعلى تغطية قطاعية        52.1٪ (قطاع الشرق)
         6. أدنى تغطية قطاعية        34.8٪ (قطاع الجنوب — مرجاني: عجز حصراً)

     ▸ الخريطة الكبيرة تملأ ما تبقى (span 9): RH.viz.geomap.render بوضع auto
       (بلاطات OSM حية عبر Leaflet عند توفرها، وإلا SVG مُسقط يعمل من file://)
       مع شريط تحكم كامل:
         • مفاتيح الطبقات السبع القانونية: أسرّة/تشغيلية/بناء/مخالفات/
           مراقبون/طلب/تغطية (ألوان دلالية: أخضر=طاقة/رخص/مراقبون/تغطية،
           رملي نحاسي=طلب، مرجاني=مخالفات حصراً)
         • مفتاح نقاط التركّز الرقابي (40 نقطة مرجانية، الحجم=الكثافة)
         • مفتاح إبراز أحياء العينة العشرين (تعتيم غير العينة + حدود عاجية —
           يعمل في وضع SVG؛ في وضع البلاطات يظهر تنويه صادق)
         • مبدل الوضع اليدوي: بلاطات OSM حية ↔ SVG دون اتصال (العقد §4:
           فشل البلاطات → سقوط صامت إلى SVG تعكسه رقاقة الوضع دورياً)
       ووسم المصدر إلزامي في الوضعين (وسيلة إيضاح + سطر إسناد داخل الخريطة
       يرسمهما geomap، وسطرا مصدر إضافيان أسفل العمود الجانبي).

     ▸ العمود الجانبي (span 3):
         • رصيف «بطاقة الحي»: نقر/Enter على حي → بطاقة قيم فورية (قيم عينة
           الحي إن وُجد في العينة العشرين، وإلا القيم القطاعية بصدق) مع زر
           «الملف الكامل» وEscape/زر إغلاق — الخريطة تبقى ظاهرة
         • خمس بطاقات ملخص قطاعية: التغطية + عدّاد الطبقة الحالية بشريط
           قياس متزامن مع مفتاح الطبقة + عجز/مخالفات/مراقبون — كل بطاقة
           تفتح الملف القطاعي الموحد
         • سطرا الإسناد: عينة الأحياء + حدود MIT

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل رقم من release.json (ctx.release/ctx.derived) أو
     riyadh-geo.json (ctx.geo) — وكل رقم ظاهر عبر RH.core.fmt حصراً
     (تطابق العدد والمعدود عبر fmt.noun/countNoun، عزل اتجاهي fmt.iso/pct).
   • كل نص إصدار/حدود يُبنى بعقد dom.h النصي (textContent) — لا innerHTML
     لمحتوى خارجي إطلاقاً؛ تلميحات الخريطة يعقّمها geomap عبر theme.esc.
   • منظومة المعنى سارية على الطبقات والرقاقات والبطاقات (المرجاني للمخالفات
     والعجز حصراً، الذهبي لكنة كروم مقننة لا لون قيمة).
   • الخريطة عبر RH.viz.geomap.render حصراً (عقد §4) — هذا الملف لا يعيد
     رسم حدود ولا يحسب قيماً على مستوى الحي: قيم الأحياء من العينة العشرين
     فقط وبوسمها، وقيم الطبقات قطاعية من الإصدار.
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (أزرار حقيقية أو role=button
     بمعالجة Enter/مسافة) وموسوم data-interactive كي لا يبتلع جهاز التقديم
     ضغطاته؛ Escape يغلق رصيف الحي وبطاقات التفاصيل (عقد ctx.openDetail).
   • prefers-reduced-motion محترم (العد عبر RH.viz.motion، والانتقالات تصفّر
     في map.css)؛ التنظيف الكامل عبر ctx.onTeardown: هدم الخريطة وفصل مراقب
     المقاس ومؤقّت مزامنة الوضع ومستمع Escape المستندي.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* نسبة مئوية بنفس تقريب بايثون (نصف لأعلى، منزلة واحدة) — المرآة الرسمية */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /* ──────────────────────────────────────────────────────────────────────────
     ثوابت عرض (لا قيم بيانات)
     ────────────────────────────────────────────────────────────────────────── */

  /** صيغ عدد ومعدود محلية لما لا تغطيه NOUNS المركزية (عقد fmt.countNoun) */
  const LOCAL_NOUNS = {
    district: { one: "حي واحد", two: "حيان", few: "أحياء", many: "حياً", hundred: "حي", zero: "لا أحياء" },
    sector: { one: "قطاع واحد", two: "قطاعان", few: "قطاعات", many: "قطاعاً", hundred: "قطاع" },
    point: { one: "نقطة واحدة", two: "نقطتان", few: "نقاط", many: "نقطة", hundred: "نقطة" },
    layer: { one: "طبقة واحدة", two: "طبقتان", few: "طبقات", many: "طبقة", hundred: "طبقة" },
  };

  /** نص الإسناد القانوني (حرفياً من عقد geomap §4 — يُعرض داخل الخريطة
      تلقائياً، ويُكرر أسفل العمود الجانبي لأن وسم المصدر إلزامي) */
  const ATTRIB_TEXT = "حدود الأحياء: بيانات عامة (MIT) — مواقع النقاط توضيحية من سجل المنصة";
  const OSM_ATTRIB_TEXT = "© مساهمو OpenStreetMap";

  /** أسماء ترتيبات الصدارة المنشورة (سجل rankings في الإصدار — لا إعادة
      حساب ترتيب: قاعدة كسر التعادل ملك derive.js حصراً) */
  const RANK_LABELS = {
    lowest_coverage: "أدنى تغطية بين القطاعات",
    highest_coverage: "أعلى تغطية بين القطاعات",
    highest_demand: "أعلى طلب بين القطاعات",
    highest_violations: "أعلى مخالفات بين القطاعات",
    highest_building: "أعلى رخص بناء",
    lowest_building: "أدنى رخص بناء",
    highest_operational: "أعلى رخص تشغيلية",
    lowest_operational: "أدنى رخص تشغيلية",
    highest_beds: "أعلى طاقة مرخصة",
    lowest_beds: "أدنى طاقة مرخصة",
  };

  /* ══════════════════════════════════════════════════════════════════════════
     1) مرآة عرضية لعقد طبقات geomap (V2_CONTRACTS §4)
        القيم قطاعية من الإصدار حصراً — التعريف هنا لأغراض العرض فقط:
        تسميات الأزرار، ألوان النقاط الدلالية، أشرطة القياس الجانبية،
        وصف الطبقة في بطاقة الحي. ramp يطابق سلالم geomap الأحادية:
          seq   = أخضر (طاقة/رخص/مراقبون/تغطية — ما نتحكم به)
          viol  = مرجاني (المخالفات حصراً)
          demand= رملي نحاسي (الطلب — لونه الدلالي)
     ══════════════════════════════════════════════════════════════════════════ */
  const LAYER_DEFS = [
    {
      id: "beds", short: "أسرّة", label: "الطاقة الاستيعابية المرخصة",
      ramp: "seq",
      val: (s) => s.beds,
      fmtV: (v) => fmt.unitAfter(v, "سرير"),
      meter: (v) => fmt.int(v),
    },
    {
      id: "operational", short: "تشغيلية", label: "الرخص التشغيلية",
      ramp: "seq",
      val: (s) => s.operational,
      fmtV: (v) => fmt.noun(v, "licence"),
      meter: (v) => fmt.int(v),
    },
    {
      id: "building", short: "بناء", label: "رخص البناء",
      ramp: "seq",
      val: (s) => s.building,
      fmtV: (v) => fmt.noun(v, "licence"),
      meter: (v) => fmt.int(v),
    },
    {
      id: "violations", short: "مخالفات", label: "المخالفات المسجلة",
      ramp: "viol",
      val: (s) => s.violations,
      fmtV: (v) => fmt.noun(v, "violation"),
      meter: (v) => fmt.int(v),
    },
    {
      id: "inspectors", short: "مراقبون", label: "المراقبون الميدانيون",
      ramp: "seq",
      val: (s) => s.monitors,
      fmtV: (v) => fmt.noun(v, "monitor"),
      meter: (v) => fmt.int(v),
    },
    {
      id: "demand", short: "طلب", label: "الطلب التقديري على الأسرّة",
      ramp: "demand",
      val: (s) => s.demand,
      fmtV: (v) => fmt.unitAfter(v, "سرير"),
      meter: (v) => fmt.int(v),
    },
    {
      id: "coverage", short: "تغطية", label: "نسبة تغطية الطلب",
      ramp: "seq",
      val: (s, der) => der.sector[s.id].coverage_pct,
      fmtV: (v) => fmt.pct(v),
      meter: (v) => fmt.pct(v),
    },
  ];

  const layerById = (id) => LAYER_DEFS.find((d) => d.id === id) || null;
  const validLayer = (id) => !!layerById(id);

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js: فشل فحص لا يُسقط
     اللوحة (الإصدار المنشور اجتاز البوابات أصلاً) بل ينبه في وحدة التحكم.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s05-map/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) أدوات مشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** جعل عنصر غير-زر قابلاً للتفعيل بالكامل: نقر + Enter + مسافة، بدور
      button ووسم data-interactive (فلا يبتلع جهاز التقديم ضغطاته — عقد §8).
      المستمعون على عناصر القسم ذاته فيسقطون مع هدم DOM (لا تسريب). */
  function activatable(el, onAct, ariaLabel) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-interactive", "");
    if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
    el.addEventListener("click", onAct);
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
        ev.preventDefault();
        ev.stopPropagation();
        onAct();
      }
    });
  }

  /** تفكيك «العدد والمعدود» إلى {num, word} لعرض الرقم البطولي في شريط
      المؤشرات (الرقم في kpi-num والوحدة في kpi-unit) دون كسر التطابق:
      نفس تفريعات fmt.countNoun حرفياً؛ حالتا 1/2 تعرضان المفرد المجرد
      (مساران نظريان — الأعداد هنا مثبتة بالبوابات: 189/20/40). */
  function countParts(n, forms) {
    if (n == null || Number.isNaN(n)) return { num: "—", word: "" };
    if (n === 0) return { num: "0", word: forms.many };
    if (n === 1 || n === 2) return { num: fmt.int(n), word: forms.hundred || forms.many };
    const tail = n % 100;
    if (tail === 0) return { num: fmt.int(n), word: forms.hundred || forms.many };
    if (tail >= 3 && tail <= 10) return { num: fmt.int(n), word: forms.few };
    return { num: fmt.int(n), word: forms.many };
  }

  /** إجمالي الأحياء في ملف الحدود — صفر عند غياب الملف (بناء ناقص) */
  function countDistricts(geo) {
    if (!geo || !geo.sectors) return 0;
    let n = 0;
    for (const k of Object.keys(geo.sectors)) {
      n += (geo.sectors[k] || []).length;
    }
    return n;
  }

  /** إحصاءات الجغرافيا لكل قطاع من ملف الحدود: عدد الأحياء + نقاط التركّز
      وأقصى كثافة — كلها من riyadh-geo.json حصراً (لا اختلاق) */
  function sectorGeoStats(geo) {
    const st = {};
    if (!geo || !geo.sectors) return st;
    for (const k of Object.keys(geo.sectors)) {
      st[k] = { districts: (geo.sectors[k] || []).length, hotspots: 0, maxDensity: null };
    }
    for (const hs of geo.hotspots || []) {
      if (!st[hs.sector]) st[hs.sector] = { districts: 0, hotspots: 0, maxDensity: null };
      st[hs.sector].hotspots += 1;
      if (st[hs.sector].maxDensity == null || hs.density > st[hs.sector].maxDensity) {
        st[hs.sector].maxDensity = hs.density;
      }
    }
    return st;
  }

  /** صف قطاع من الإصدار بمعرفه */
  function sectorById(rel, id) {
    for (const s of rel.sectors) { if (s.id === id) return s; }
    return null;
  }

  /** صفوف عينة الأحياء التابعة لقطاع — قيم حقيقية من قاعدة البيانات */
  function sampleRowsOf(rel, sectorId) {
    return rel.neighbourhoods.rows.filter((r) => r.sector === sectorId);
  }

  /** سطر مصدر لمقياس خام: اسم المصنف + الورقة + المرساة (بعزل اتجاهي) */
  function rawSource(rel, metric) {
    let name = metric.source_id || "";
    for (const s of rel.sources || []) {
      if (s.id === metric.source_id) { name = s.name; break; }
    }
    return "المصدر: " + name + " — ورقة «" + metric.sheet + "» خلية "
      + fmt.iso(String(metric.anchor));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) هيكل بطاقة التفاصيل الموحد + بناتها
        كلها عقد Node مبني بـ dom.h النصي: نصوص الإصدار/الحدود تدخل
        textContent حصراً فلا مسار HTML إطلاقاً — أمان أقوى من مسار esc ذاته.
        تُفتح عبر ctx.openDetail (Escape/زر الإغلاق/نقر الخلفية تغلق — عقد §1).
     ══════════════════════════════════════════════════════════════════════════ */

  /** جدول كثيف داخل بطاقة تفاصيل — حاوية قابلة للتمرير الداخلي */
  function denseTable(cols, rows) {
    return h("div", { class: "map-detail-table" },
      h("table", { class: "table-dense" },
        h("thead", {}, h("tr", {}, cols.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, rows.map((r) => h("tr", {},
          r.map((cell, i) => h(i === 0 ? "th" : "td",
            i === 0 ? { scope: "row" } : {}, cell))))),
      ));
  }

  /** هيكل بطاقة التفاصيل:
      { num, unit?, tone?, caption?, rows?[{k,v,tone?}], table?, notes?[],
        sources?[], actions?[{label, onAct, aria?}] } */
  function detailShell(o) {
    const box = h("div", { class: "map-detail" });

    if (o.num != null) {
      box.appendChild(h("div", { class: "map-detail-hero" },
        h("span", {
          class: "map-detail-num" + (o.tone ? " " + o.tone : ""),
        }, o.num),
        o.unit ? h("span", { class: "map-detail-unit" }, o.unit) : null,
      ));
    }
    if (o.caption) {
      box.appendChild(h("p", { class: "map-detail-cap" }, o.caption));
    }
    if (o.rows && o.rows.length) {
      box.appendChild(h("div", { class: "map-detail-rows" },
        o.rows.map((r) => h("div", {
          class: "map-detail-row" + (r.tone ? " " + r.tone : ""),
        },
          h("span", { class: "map-detail-k" }, r.k),
          h("b", { class: "map-detail-v" }, r.v),
        ))));
    }
    if (o.table) box.appendChild(o.table);
    for (const n of o.notes || []) {
      box.appendChild(h("p", { class: "map-detail-note" },
        h("span", { class: "map-detail-note-dot", "aria-hidden": "true" }), n));
    }
    for (const s of o.sources || []) {
      box.appendChild(h("p", { class: "map-detail-src" }, s));
    }
    if (o.actions && o.actions.length) {
      box.appendChild(h("div", { class: "map-detail-actions" },
        o.actions.map((a) => h("button", {
          class: "map-detail-go",
          type: "button",
          "data-interactive": "",
          "aria-label": a.aria || a.label,
          onclick: a.onAct,
        }, a.label))));
    }
    return box;
  }

  /** وسوم الصدارة المنشورة لقطاع (من سجل rankings حصراً) */
  function sectorBadges(der, sectorId) {
    const badges = [];
    for (const key of Object.keys(der.rankings)) {
      if (der.rankings[key] === sectorId && RANK_LABELS[key]) {
        badges.push(RANK_LABELS[key]);
      }
    }
    return badges;
  }

  /* ── 3.1) الملف القطاعي الموحد (بطاقات القطاعات + مؤشرا التغطية) ──
     قراءة قرار عابرة للمجالات: طلب/طاقة/تغطية/عجز/تراخيص/رقابة لقطاع واحد
     + جغرافيته من ملف الحدود + صفوف عينته الحقيقية + وسوم صدارته المنشورة. */
  function sectorDetail(ctx, s) {
    const rel = ctx.release;
    const der = ctx.derived;
    const sd = der.sector[s.id];
    const gs = sectorGeoStats(ctx.geo)[s.id] || null;

    guard("sectorDetail", {
      "التغطية المنشورة تطابق مرآة الحساب": sd.coverage_pct === pctOf(s.beds, s.demand),
      "عجز القطاع = طلبه − طاقته": sd.deficit_beds === Math.max(s.demand - s.beds, 0),
    });

    const rows = [
      { k: "الطلب التقديري", v: fmt.unitAfter(s.demand, "سرير") },
      { k: "حصة القطاع من الطلب", v: fmt.pct(sd.demand_share_pct) },
      { k: "الطاقة المرخصة", v: fmt.unitAfter(s.beds, "سرير"), tone: "pos" },
      { k: "العجز", v: fmt.unitAfter(sd.deficit_beds, "سرير"), tone: "neg" },
      { k: "رخص البناء", v: fmt.noun(s.building, "licence") },
      { k: "الرخص التشغيلية", v: fmt.noun(s.operational, "licence") },
      { k: "الزيارات الميدانية", v: fmt.noun(s.visits, "visit") },
      { k: "المخالفات المسجلة", v: fmt.noun(s.violations, "violation"), tone: "neg" },
      { k: "حصة القطاع من المخالفات", v: fmt.pct(sd.violations_share_pct), tone: "neg" },
      { k: "المراقبون", v: fmt.noun(s.monitors, "monitor") },
      { k: "قرارات الإغلاق", v: fmt.noun(s.closures, "decision") },
    ];
    if (gs) {
      rows.push({
        k: "أحياء القطاع في ملف الحدود",
        v: fmt.countNoun(gs.districts, LOCAL_NOUNS.district),
      });
      rows.push({
        k: "نقاط التركّز الرقابي بالقطاع",
        v: fmt.countNoun(gs.hotspots, LOCAL_NOUNS.point),
      });
    }

    /* صفوف عينة القطاع (4 أحياء لكل قطاع في العينة العشرين) — قيم حقيقية */
    const sample = sampleRowsOf(rel, s.id);
    const table = sample.length
      ? denseTable(
        ["حي العينة", "الأسرّة", "بناء/تشغيلية", "المخالفات"],
        sample.map((r) => [
          String(r.name),
          fmt.int(r.beds),
          fmt.iso(fmt.int(r.building) + " / " + fmt.int(r.operational)),
          fmt.int(r.violations),
        ]))
      : null;

    const badges = sectorBadges(der, s.id);
    const notes = [];
    if (badges.length) notes.push("مواضع الصدارة: " + badges.join("، ") + ".");
    if (sample.length) notes.push(String(rel.neighbourhoods.label));

    return detailShell({
      num: fmt.pct(sd.coverage_pct),
      unit: "نسبة تغطية القطاع",
      tone: sd.coverage_pct < der.coverage_pct ? "neg" : "pos",
      caption: String(s.name) + " — الملف القطاعي الموحد (طلب/طاقة/تراخيص/رقابة/جغرافيا)",
      rows,
      table,
      notes,
      actions: [{
        label: "لوحة العرض والطلب",
        aria: "الانتقال إلى قسم «العرض والطلب»",
        onAct: () => RH.presenter.engine.goScene("demand"),
      }, {
        label: "لوحة الرقابة الميدانية",
        aria: "الانتقال إلى قسم «الرقابة الميدانية»",
        onAct: () => RH.presenter.engine.goScene("control"),
      }],
    });
  }

  /* ── 3.2) الملف الكامل لحي (زر «الملف الكامل» في رصيف الحي) ──
     info من عقد geomap.onDistrict: {name, name_en, sector, sectorName,
     sectorRow, sectorDerived, centroid, sample|null} — أسماء الأحياء من ملف
     الحدود العام فتُبنى بعقد النص حصراً. */
  function districtFullDetail(ctx, info, layerDef) {
    const rel = ctx.release;
    const s = info.sectorRow;
    const sd = info.sectorDerived;

    const rows = [
      { k: "القطاع", v: String(info.sectorName) },
      { k: layerDef.label + " (قطاعياً)", v: layerDef.fmtV(layerDef.val(s, ctx.derived)) },
      { k: "تغطية القطاع", v: fmt.pct(sd.coverage_pct) },
      { k: "عجز القطاع", v: fmt.unitAfter(sd.deficit_beds, "سرير"), tone: "neg" },
      { k: "مخالفات القطاع", v: fmt.noun(s.violations, "violation"), tone: "neg" },
      { k: "المراقبون بالقطاع", v: fmt.noun(s.monitors, "monitor") },
    ];

    let table = null;
    const notes = [];
    if (info.sample) {
      /* صف عينة الأحياء المطابق — قيم الحي الحقيقية من قاعدة البيانات */
      table = denseTable(
        ["بيان الحي (من العينة)", "القيمة"],
        [
          ["الطاقة الاستيعابية", fmt.unitAfter(info.sample.beds, "سرير")],
          ["رخص البناء", fmt.noun(info.sample.building, "licence")],
          ["الرخص التشغيلية", fmt.noun(info.sample.operational, "licence")],
          ["المخالفات المسجلة", fmt.noun(info.sample.violations, "violation")],
        ]);
      notes.push(String(rel.neighbourhoods.label));
    } else {
      notes.push("لا صف لهذا الحي في عينة قاعدة البيانات — القيم المعروضة قطاعية.");
    }
    notes.push(ATTRIB_TEXT);

    return detailShell({
      num: fmt.pct(sd.coverage_pct),
      unit: "تغطية " + String(info.sectorName),
      caption: info.name_en ? fmt.iso(String(info.name_en)) : null,
      rows,
      table,
      notes,
      actions: [{
        label: "لوحة التراخيص",
        aria: "الانتقال إلى قسم «التراخيص»",
        onAct: () => RH.presenter.engine.goScene("licensing"),
      }, {
        label: "لوحة الرقابة الميدانية",
        aria: "الانتقال إلى قسم «الرقابة الميدانية»",
        onAct: () => RH.presenter.engine.goScene("control"),
      }],
    });
  }

  /* ── 3.3) جغرافيا التمثيل (مؤشر «أحياء الرياض الممثلة») ──
     توزيع الأحياء والعينة ونقاط التركّز على القطاعات الخمسة — أعداد من ملف
     الحدود وعينة الإصدار حصراً. */
  function geographyDetail(ctx) {
    const rel = ctx.release;
    const geo = ctx.geo;
    const stats = sectorGeoStats(geo);
    const total = countDistricts(geo);

    const tableRows = rel.sectors.map((s) => {
      const gs = stats[s.id] || { districts: 0, hotspots: 0 };
      const sampleN = sampleRowsOf(rel, s.id).length;
      return [
        String(s.name),
        fmt.int(gs.districts),
        fmt.int(sampleN),
        fmt.int(gs.hotspots),
      ];
    });

    const notes = [ATTRIB_TEXT];
    if (rel.quarantine_resolved && rel.quarantine_resolved.hotspots
      && rel.quarantine_resolved.hotspots.resolution) {
      notes.push(String(rel.quarantine_resolved.hotspots.resolution));
    }

    return detailShell({
      num: total ? fmt.int(total) : "—",
      unit: total ? countParts(total, LOCAL_NOUNS.district).word : "",
      caption: "حدود جغرافية حقيقية lat/lng لكل حي، موزعة على "
        + fmt.countNoun(rel.sectors.length, LOCAL_NOUNS.sector)
        + " بمطابقة اسمية كاملة مع طبقة بيانات المنصة الأصلية.",
      table: denseTable(
        ["القطاع", "الأحياء", "منها في العينة", "نقاط التركّز"],
        tableRows),
      notes,
      actions: [{
        label: "لوحة الملخص التنفيذي",
        aria: "الانتقال إلى قسم «الملخص التنفيذي»",
        onAct: () => RH.presenter.engine.goScene("summary"),
      }],
    });
  }

  /* ── 3.4) عينة الأحياء العشرين (مؤشر «عينة الأحياء الموثقة») ──
     الجدول الكامل بقيمه الحقيقية. أي ترتيب ضمن العينة فقط مع تسمية المقياس
     المرتب — التزاماً بقاعدة ranking_note المنشورة حرفياً. */
  function sampleDetail(ctx) {
    const rel = ctx.release;
    const rows = rel.neighbourhoods.rows.slice()
      .sort((a, b) => b.beds - a.beds); // الترتيب المسمى: تنازلياً بالأسرّة

    const secName = {};
    for (const s of rel.sectors) secName[s.id] = s.short;

    return detailShell({
      num: fmt.int(rows.length),
      unit: countParts(rows.length, LOCAL_NOUNS.district).word,
      caption: "مرتبة تنازلياً بالطاقة الاستيعابية — الترتيب ضمن العينة"
        + " المورّدة فقط لا على مستوى المدينة.",
      table: denseTable(
        ["الحي", "القطاع", "الأسرّة", "بناء", "تشغيلية", "المخالفات"],
        rows.map((r) => [
          String(r.name),
          String(secName[r.sector] || r.sector),
          fmt.int(r.beds),
          fmt.int(r.building),
          fmt.int(r.operational),
          fmt.int(r.violations),
        ])),
      notes: [
        String(rel.neighbourhoods.label),
        String(rel.neighbourhoods.ranking_note),
      ],
      actions: [{
        label: "لوحة التراخيص",
        aria: "الانتقال إلى قسم «التراخيص»",
        onAct: () => RH.presenter.engine.goScene("licensing"),
      }],
    });
  }

  /* ── 3.5) نقاط التركّز الرقابي (مؤشر «نقاط التركّز») ──
     توزيع الأربعين نقطة على القطاعات + مدى الكثافة — من ملف الحدود حصراً،
     مع الإفصاح الكامل: مواقع توضيحية من سجل المنصة (قرار R2 المحسوم). */
  function hotspotsDetail(ctx) {
    const rel = ctx.release;
    const geo = ctx.geo;
    const stats = sectorGeoStats(geo);
    const total = geo && geo.hotspots ? geo.hotspots.length : 0;

    const tableRows = rel.sectors.map((s) => {
      const gs = stats[s.id] || { hotspots: 0, maxDensity: null };
      return [
        String(s.name),
        fmt.int(gs.hotspots),
        total ? fmt.pct(pctOf(gs.hotspots, total)) : "—",
        gs.maxDensity != null ? fmt.int(gs.maxDensity) : "—",
      ];
    });

    const notes = [ATTRIB_TEXT];
    if (rel.quarantine_resolved && rel.quarantine_resolved.hotspots
      && rel.quarantine_resolved.hotspots.resolution) {
      notes.push(String(rel.quarantine_resolved.hotspots.resolution));
    }

    return detailShell({
      num: total ? fmt.int(total) : "—",
      unit: total ? countParts(total, LOCAL_NOUNS.point).word : "",
      tone: "neg",
      caption: "نقاط التركّز الرقابي على خريطة المدينة — حجم النقطة يعكس"
        + " كثافة التركّز المسجلة في سجل المنصة.",
      table: denseTable(
        ["القطاع", "النقاط", "حصة العدد", "أعلى كثافة"],
        tableRows),
      notes,
      actions: [{
        label: "لوحة الرقابة الميدانية",
        aria: "الانتقال إلى قسم «الرقابة الميدانية»",
        onAct: () => RH.presenter.engine.goScene("control"),
      }],
    });
  }

  /* ── 3.6) توزيع الطاقة المرخصة (مؤشر «الطاقة المرخصة الموزعة») ── */
  function capacityDetail(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const m = rel.metrics.licensed_beds;
    const base = rel.metrics.baseline_beds;

    const sumBeds = rel.sectors.reduce((a, s) => a + s.beds, 0);
    guard("capacityDetail", {
      "مجموع أسرّة القطاعات يطابق الإجمالي المعتمد": sumBeds === m.value,
    });

    return detailShell({
      num: fmt.int(m.value),
      unit: "سرير",
      tone: "pos",
      caption: String(m.label) + " — التوزيع القطاعي على الخريطة (طبقة «أسرّة»).",
      rows: [
        { k: String(rel.meta.baseline_label), v: fmt.unitAfter(base.value, "سرير") },
        {
          k: "النمو منذ خط الأساس",
          v: fmt.iso("+" + fmt.int(der.growth_beds_abs)) + " سرير ("
            + fmt.iso("+" + fmt.dec1(der.growth_beds_pct) + "٪") + ")",
          tone: "pos",
        },
        { k: "معدل الإشغال الحالي", v: fmt.pct(der.occupancy_pct) },
      ],
      table: denseTable(
        ["القطاع", "الأسرّة", "الحصة", "التغطية"],
        rel.sectors.map((s) => [
          String(s.name),
          fmt.int(s.beds),
          fmt.pct(pctOf(s.beds, m.value)),
          fmt.pct(der.sector[s.id].coverage_pct),
        ])),
      notes: [String(rel.meta.comparison_qualifier)],
      sources: [rawSource(rel, m)],
      actions: [{
        label: "لوحة التراخيص",
        aria: "الانتقال إلى قسم «التراخيص»",
        onAct: () => RH.presenter.engine.goScene("licensing"),
      }, {
        label: "لوحة العرض والطلب",
        aria: "الانتقال إلى قسم «العرض والطلب»",
        onAct: () => RH.presenter.engine.goScene("demand"),
      }],
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3.7) قراءة الطبقة التنفيذية — سطر واحد أسفل شريط التحكم يتبدل مع
        الطبقة النشطة: الصدارة والأدنى من سجل rankings المنشور حصراً
        (لا إعادة حساب ترتيب — قاعدة كسر التعادل ملك derive.js)، والحصص
        من المشتقات المنشورة. يعيد {text, tone, sectorId} — النقر يفتح
        الملف القطاعي للقطاع المتصدر.
     ══════════════════════════════════════════════════════════════════════════ */
  function layerReading(ctx, layerId) {
    const rel = ctx.release;
    const der = ctx.derived;
    const rk = der.rankings;
    const S = (id) => sectorById(rel, id);

    switch (layerId) {
      case "beds": {
        const hi = S(rk.highest_beds), lo = S(rk.lowest_beds);
        return {
          tone: "pos", sectorId: hi.id,
          text: String(hi.name) + " يتصدر الطاقة المرخصة ("
            + fmt.unitAfter(hi.beds, "سرير") + ") — الأدنى "
            + String(lo.name) + " (" + fmt.unitAfter(lo.beds, "سرير") + ")",
        };
      }
      case "operational": {
        const hi = S(rk.highest_operational), lo = S(rk.lowest_operational);
        return {
          tone: "pos", sectorId: hi.id,
          text: String(hi.name) + " يتصدر الرخص التشغيلية ("
            + fmt.noun(hi.operational, "licence") + ") — الأدنى "
            + String(lo.name) + " (" + fmt.noun(lo.operational, "licence") + ")",
        };
      }
      case "building": {
        const hi = S(rk.highest_building), lo = S(rk.lowest_building);
        return {
          tone: "pos", sectorId: hi.id,
          text: String(hi.name) + " يتصدر رخص البناء ("
            + fmt.noun(hi.building, "licence") + ") — الأدنى "
            + String(lo.name) + " (" + fmt.noun(lo.building, "licence") + ")",
        };
      }
      case "violations": {
        const hi = S(rk.highest_violations);
        return {
          tone: "neg", sectorId: hi.id,
          text: String(hi.name) + " يتصدر المخالفات المسجلة ("
            + fmt.noun(hi.violations, "violation") + " — "
            + fmt.pct(der.sector[hi.id].violations_share_pct) + " من الإجمالي)",
        };
      }
      case "inspectors": {
        /* لا ترتيب منشوراً للمراقبين — نعرض الإجمالي المعتمد وتفاوت التغطية
           الموثق في رؤى الرقابة (الجنوب الأعلى مخالفات بثلاثة مراقبين) */
        const so = S(rk.highest_violations);
        return {
          tone: "warn", sectorId: so.id,
          text: fmt.noun(rel.metrics.total_monitors.value, "monitor")
            + " على " + fmt.countNoun(rel.sectors.length, LOCAL_NOUNS.sector)
            + " — " + String(so.name) + " الأعلى مخالفاتٍ يغطيه "
            + fmt.noun(so.monitors, "monitor"),
        };
      }
      case "demand": {
        const hi = S(rk.highest_demand);
        return {
          tone: "dem", sectorId: hi.id,
          text: String(hi.name) + " يتصدر الطلب التقديري ("
            + fmt.unitAfter(hi.demand, "سرير") + " — "
            + fmt.pct(der.sector[hi.id].demand_share_pct) + " من طلب المدينة)",
        };
      }
      case "coverage": {
        const hi = S(rk.highest_coverage), lo = S(rk.lowest_coverage);
        return {
          tone: "neu", sectorId: hi.id,
          text: "أعلى تغطية في " + String(hi.name) + " ("
            + fmt.pct(der.sector[hi.id].coverage_pct) + ") — الأدنى "
            + String(lo.name) + " (" + fmt.pct(der.sector[lo.id].coverage_pct) + ")",
        };
      }
      default:
        return null;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) شريط المؤشرات الكبرى — ستة أرقام بطولية بعقد layout.kpiStrip
        كل مؤشر قابل للنقر → بطاقة تفصيلية، مع عدّ تصاعدي عند أول دخول
        (مفتاح مشهدي فلا يعاد العد عند العودة — عقد RH.viz.motion).
     ══════════════════════════════════════════════════════════════════════════ */
  function kpiDefs(ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const geo = ctx.geo;

    const districts = countDistricts(geo);
    const sampleN = rel.neighbourhoods.rows.length;
    const hotspotsN = geo && geo.hotspots ? geo.hotspots.length : 0;
    const cap = rel.metrics.licensed_beds.value;

    const hiId = der.rankings.highest_coverage;
    const loId = der.rankings.lowest_coverage;
    const hiSec = sectorById(rel, hiId);
    const loSec = sectorById(rel, loId);

    guard("kpiStrip", {
      "خمسة قطاعات معتمدة": rel.sectors.length === 5,
      "عينة عشرين حياً (بوابة)": sampleN === 20,
      "الحدود 189 حياً (عند توفر الملف)": !geo || districts === 189,
      "نقاط التركّز 40 (عند توفر الملف)": !geo || hotspotsN === 40,
      "أعلى تغطية منشورة تطابق المرآة":
        der.sector[hiId].coverage_pct === pctOf(hiSec.beds, hiSec.demand),
      "أدنى تغطية منشورة تطابق المرآة":
        der.sector[loId].coverage_pct === pctOf(loSec.beds, loSec.demand),
    });

    const dParts = countParts(districts, LOCAL_NOUNS.district);
    const sParts = countParts(sampleN, LOCAL_NOUNS.district);
    const hParts = countParts(hotspotsN, LOCAL_NOUNS.point);
    const capParts = fmt.compactParts(cap);

    /* منسقا العد التصاعدي: مقياس ثابت مطابق للوحدة المعروضة (لا قفزات
       «ألف» أثناء العد) — القيمة النهائية تساوي حتماً القيمة المنسقة */
    const countInt = (v) => fmt.int(v);
    const countThousands = (v) => fmt.compactParts(Math.max(v, 10000)).num;

    return [
      {
        item: {
          label: "أحياء الرياض الممثلة",
          value: districts ? dParts.num : "—",
          unit: districts ? dParts.word : "",
          note: districts
            ? "حدود lat/lng حقيقية بترخيص MIT"
            : "ملف الحدود غير مضمن في هذا البناء",
          delta: { text: "على " + fmt.countNoun(rel.sectors.length, LOCAL_NOUNS.sector), tone: "neu" },
          countTo: districts || null, fmt: countInt, key: "map:kpi:districts",
        },
        title: "جغرافيا التمثيل — الأحياء والقطاعات",
        aria: "أحياء الرياض الممثلة "
          + fmt.countNoun(districts, LOCAL_NOUNS.district)
          + " — عرض التوزيع القطاعي",
        detail: () => geographyDetail(ctx),
      },
      {
        item: {
          label: "عينة الأحياء الموثقة",
          value: sParts.num,
          unit: sParts.word,
          note: "قيم أسرّة ورخص ومخالفات لكل حي",
          delta: { text: "تُبرز على الخريطة بمفتاح العينة", tone: "neu" },
          countTo: sampleN, fmt: countInt, key: "map:kpi:sample",
        },
        title: String(rel.neighbourhoods.label),
        aria: "عينة الأحياء الموثقة "
          + fmt.countNoun(sampleN, LOCAL_NOUNS.district)
          + " — عرض الجدول الكامل",
        detail: () => sampleDetail(ctx),
      },
      {
        item: {
          label: "نقاط التركّز الرقابي",
          value: hotspotsN ? hParts.num : "—",
          unit: hotspotsN ? hParts.word : "",
          tone: "neg",
          note: "مواقع توضيحية من سجل المنصة",
          delta: { text: "حجم النقطة = الكثافة", tone: "neu" },
          countTo: hotspotsN || null, fmt: countInt, key: "map:kpi:hotspots",
        },
        title: "نقاط التركّز الرقابي",
        aria: "نقاط التركّز الرقابي "
          + fmt.countNoun(hotspotsN, LOCAL_NOUNS.point)
          + " — عرض التوزيع القطاعي",
        detail: () => hotspotsDetail(ctx),
      },
      {
        item: {
          label: "الطاقة المرخصة الموزعة",
          value: capParts.num,
          unit: capParts.word + " سرير",
          tone: "pos",
          delta: {
            text: fmt.iso("+" + fmt.dec1(der.growth_beds_pct) + "٪") + " منذ خط الأساس",
            tone: "pos",
          },
          note: fmt.unitAfter(cap, "سرير"),
          countTo: cap, fmt: countThousands, key: "map:kpi:capacity",
        },
        title: "الطاقة المرخصة الموزعة قطاعياً",
        aria: "الطاقة المرخصة الموزعة " + fmt.unitAfter(cap, "سرير")
          + " — عرض التوزيع القطاعي",
        detail: () => capacityDetail(ctx),
      },
      {
        item: {
          label: "أعلى تغطية قطاعية",
          value: fmt.pct(der.sector[hiId].coverage_pct),
          tone: "pos",
          delta: { text: String(hiSec.name), tone: "pos" },
          note: fmt.unitAfter(hiSec.beds, "سرير") + " مرخص",
          countTo: der.sector[hiId].coverage_pct,
          fmt: (v) => fmt.pct(v), key: "map:kpi:hicov",
        },
        title: String(hiSec.name) + " — الملف القطاعي",
        aria: "أعلى تغطية قطاعية " + fmt.pct(der.sector[hiId].coverage_pct)
          + " في " + String(hiSec.name) + " — عرض الملف القطاعي",
        detail: () => sectorDetail(ctx, hiSec),
      },
      {
        item: {
          label: "أدنى تغطية قطاعية",
          /* الرقم نسبة تغطية لا عجزاً — عاجي محايد (المرجاني للعجز حصراً؛
             إصلاح المراجعة)، وسطر العجز في الهامش يحمل الدلالة السالبة */
          value: fmt.pct(der.sector[loId].coverage_pct),
          tone: "neu",
          delta: { text: String(loSec.name), tone: "neu" },
          note: "عجز " + fmt.unitAfter(der.sector[loId].deficit_beds, "سرير"),
          countTo: der.sector[loId].coverage_pct,
          fmt: (v) => fmt.pct(v), key: "map:kpi:locov",
        },
        title: String(loSec.name) + " — الملف القطاعي",
        aria: "أدنى تغطية قطاعية " + fmt.pct(der.sector[loId].coverage_pct)
          + " في " + String(loSec.name) + " — عرض الملف القطاعي",
        detail: () => sectorDetail(ctx, loSec),
      },
    ];
  }

  /** بناء الشريط وتوصيل التعمق: كل بطاقة مؤشر زر حقيقي بلوحة المفاتيح */
  function buildStrip(el, ctx) {
    const defs = kpiDefs(ctx);
    const strip = RH.presenter.layout.kpiStrip(el, defs.map((d) => d.item));
    const nodes = strip.querySelectorAll(".kpi");
    defs.forEach((d, i) => {
      const node = nodes[i];
      if (!node) return;
      node.classList.add("map-kpi");
      node.title = "عرض التفاصيل";
      activatable(node, () => ctx.openDetail(d.detail(), { title: d.title }), d.aria);
    });
    return strip;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) بطاقة الخريطة الكبيرة (span 9): شريط تحكم كامل + مضيف geomap
        الطبقات السبع + نقاط التركّز + إبراز العينة + مبدل الوضع اليدوي،
        مع رقاقة وضع حية في الترويسة (تعكس السقوط الصامت إلى SVG دورياً).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildMapCell(cell, ctx, rt) {
    const rel = ctx.release;
    const geo = ctx.geo;
    const districts = countDistricts(geo);
    const hasGeo = districts > 0;

    const res = RH.presenter.layout.card(cell, {
      title: "الخريطة الحية — تلوين قطاعي على حدود الأحياء الحقيقية",
      sub: hasGeo
        ? fmt.countNoun(districts, LOCAL_NOUNS.district) + " · "
          + fmt.countNoun(rel.sectors.length, LOCAL_NOUNS.sector) + " · "
          + fmt.countNoun(rel.neighbourhoods.rows.length, LOCAL_NOUNS.district) + " في العينة"
        : "حدود الأحياء غير مضمنة في هذا البناء",
      cls: "map-card",
      pad: false,
    });

    /* رقاقة الوضع الحية في ترويسة البطاقة (حالة لا زر — الأزرار في الشريط) */
    const modeChip = h("span", {
      class: "map-mode-chip",
      role: "status",
      "aria-live": "polite",
    }, "الوضع: —");
    const head = res.card.querySelector(".card-head");
    if (head) head.appendChild(modeChip);

    /* ── شريط التحكم: مجموعة الطبقات + مجموعة المفاتيح + مجموعة الوضع ── */
    const controls = h("div", { class: "map-controls" });
    res.body.appendChild(controls);

    /* سطر قراءة الطبقة التنفيذية: صدارة/أدنى من سجل rankings المنشور —
       يتبدل مع الطبقة، والنقر يفتح الملف القطاعي للقطاع المتصدر */
    const readingText = h("span", { class: "map-reading-text" }, "");
    const reading = h("div", {
      class: "map-reading",
      "aria-live": "polite",
    },
      h("span", { class: "map-reading-dot", "aria-hidden": "true" }),
      readingText,
      h("span", { class: "map-reading-arrow", "aria-hidden": "true" }, "←"),
    );
    let readingSector = null;
    activatable(reading, () => {
      const s = readingSector ? sectorById(rel, readingSector) : null;
      if (s) ctx.openDetail(sectorDetail(ctx, s), { title: String(s.name) });
    }, "قراءة الطبقة النشطة — فتح الملف القطاعي للقطاع المتصدر");
    res.body.appendChild(reading);

    function syncReading() {
      const r = layerReading(ctx, rt.st.layer);
      if (!r) { reading.hidden = true; return; }
      reading.hidden = false;
      reading.className = "map-reading " + r.tone;
      readingText.textContent = r.text;
      readingSector = r.sectorId || null;
    }
    rt.sub(syncReading);
    syncReading();

    /* مضيف الخريطة — geomap يضيف صنف .geomap ويملأ المساحة المتبقية */
    const stage = h("div", { class: "map-stage" });
    res.body.appendChild(stage);

    /* البناء الفعلي للخريطة (عقد §4) — عند غياب الحدود يرسم geomap بطاقته
       الصادقة، ونعطل شريط التحكم كاملاً (لا أزرار ميتة صامتة). */
    let uiReady = false; // تصير true بعد بناء أزرار الوضع (تفادي TDZ أدناه)
    const gm = RH.viz.geomap.render(stage, {
      su: ctx.su,
      layer: rt.st.layer,
      mode: rt.st.mode,
      hotspots: rt.st.hotspots,
      sample: true,
      interactive: true,
      onDistrict: (info) => rt.showDistrict(info),
      /* السقوط التلقائي من البلاطات إلى SVG يحدّث رقاقة الوضع فوراً —
         صدق الرقاقة (إصلاح المراجعة)؛ المزامنة الدورية تبقى شبكة أمان. */
      onModeChange: () => { if (uiReady) syncModeUI(); },
    });
    rt.gm = gm;

    if (rt.st.sample) stage.classList.add("sm-on");

    /* ── 5.1) مجموعة مفاتيح الطبقات السبع ── */
    const layerGroup = h("div", {
      class: "map-ctl-group map-layers",
      role: "group",
      "aria-label": "اختيار طبقة الخريطة — "
        + fmt.countNoun(LAYER_DEFS.length, LOCAL_NOUNS.layer),
    });
    const layerBtns = [];

    function syncLayerBtns() {
      for (const b of layerBtns) {
        const on = b.dataset.layer === rt.st.layer;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.classList.toggle("active", on);
      }
    }

    function setLayer(id) {
      if (!validLayer(id) || id === rt.st.layer) return;
      rt.st.layer = id;
      gm.setLayer(id);
      syncLayerBtns();
      rt.emit(); // يبلغ العمود الجانبي: أشرطة القياس + رقاقة الطبقة + الرصيف
      /* لا ctx.update هنا عمداً: إعادة كتابة المعاملات تعيد بناء القسم كاملاً
         في مكانه (عقد المحرك)، بينما setLayer يعيد التلوين بلا هدم — التبديل
         الفوري جوهر واجهة geomap. معامل layer يبقى مقروءاً من العنوان
         (روابط عميقة يدوية) دون أن يُكتب من هذا المبدل. */
    }

    for (const d of LAYER_DEFS) {
      const b = h("button", {
        class: "map-lyr-btn r-" + d.ramp,
        type: "button",
        dataset: { layer: d.id },
        "data-interactive": "",
        "aria-pressed": "false",
        title: d.label,
        "aria-label": "طبقة " + d.label,
        onclick: () => setLayer(d.id),
      },
        h("span", { class: "map-lyr-dot", "aria-hidden": "true" }),
        d.short,
      );
      layerBtns.push(b);
      layerGroup.appendChild(b);
    }
    controls.appendChild(layerGroup);

    /* ── 5.2) مجموعة المفاتيح: نقاط التركّز + إبراز العينة ── */
    const togglesGroup = h("div", {
      class: "map-ctl-group map-toggles",
      role: "group",
      "aria-label": "طبقات إضافية",
    });

    const hotspotsN = geo && geo.hotspots ? geo.hotspots.length : 0;
    const hsBtn = h("button", {
      class: "map-tgl tgl-hs",
      type: "button",
      "data-interactive": "",
      "aria-pressed": rt.st.hotspots ? "true" : "false",
      title: "إظهار/إخفاء نقاط التركّز الرقابي (مواقع توضيحية من سجل المنصة)",
      "aria-label": "نقاط التركّز الرقابي — "
        + fmt.countNoun(hotspotsN, LOCAL_NOUNS.point),
      onclick: () => {
        rt.st.hotspots = !rt.st.hotspots;
        gm.setHotspots(rt.st.hotspots);
        hsBtn.setAttribute("aria-pressed", rt.st.hotspots ? "true" : "false");
        hsBtn.classList.toggle("active", rt.st.hotspots);
      },
    },
      h("span", { class: "map-tgl-dot", "aria-hidden": "true" }),
      "نقاط التركّز",
      h("span", { class: "map-tgl-count" }, fmt.int(hotspotsN)),
    );
    hsBtn.classList.toggle("active", rt.st.hotspots);
    togglesGroup.appendChild(hsBtn);

    const sampleN = rel.neighbourhoods.rows.length;
    const smBtn = h("button", {
      class: "map-tgl tgl-sm",
      type: "button",
      "data-interactive": "",
      "aria-pressed": rt.st.sample ? "true" : "false",
      title: "إبراز أحياء العينة الموثقة على الخريطة (تعتيم سائر الأحياء)",
      "aria-label": "إبراز أحياء العينة — "
        + fmt.countNoun(sampleN, LOCAL_NOUNS.district),
      onclick: () => {
        rt.st.sample = !rt.st.sample;
        stage.classList.toggle("sm-on", rt.st.sample);
        smBtn.setAttribute("aria-pressed", rt.st.sample ? "true" : "false");
        smBtn.classList.toggle("active", rt.st.sample);
        syncSampleHint();
      },
    },
      h("span", { class: "map-tgl-dot", "aria-hidden": "true" }),
      "إبراز العينة",
      h("span", { class: "map-tgl-count" }, fmt.int(sampleN)),
    );
    smBtn.classList.toggle("active", rt.st.sample);
    togglesGroup.appendChild(smBtn);
    controls.appendChild(togglesGroup);

    /* ── 5.3) مبدل الوضع اليدوي (العقد: تبديل تلقائي مع إتاحة يدوية) ── */
    const modeGroup = h("div", {
      class: "map-ctl-group map-modes",
      role: "group",
      "aria-label": "وضع عرض الخريطة",
    });

    const leafletMissing = !window.L;
    const tilesBtn = h("button", {
      class: "map-mode-btn",
      type: "button",
      dataset: { mode: "tiles" },
      "data-interactive": "",
      "aria-pressed": "false",
      disabled: leafletMissing ? true : null,
      title: leafletMissing
        ? "مكتبة الخرائط غير مضمنة في هذا البناء — الوضع الحي غير متاح"
        : "بلاطات OpenStreetMap الحية (تتطلب اتصالاً)",
      "aria-label": "وضع البلاطات الحية OSM",
      onclick: () => { gm.setMode("tiles"); syncModeUI(); },
    }, "بلاطات حية");

    const svgBtn = h("button", {
      class: "map-mode-btn",
      type: "button",
      dataset: { mode: "svg" },
      "data-interactive": "",
      "aria-pressed": "false",
      title: "إسقاط SVG محلي — يعمل دون اتصال دائماً",
      "aria-label": "وضع SVG دون اتصال",
      onclick: () => { gm.setMode("svg"); syncModeUI(); },
    }, "SVG دون اتصال");

    modeGroup.appendChild(tilesBtn);
    modeGroup.appendChild(svgBtn);
    controls.appendChild(modeGroup);

    /* تنويه صادق: إبراز العينة تظليل SVG؛ في وضع البلاطات لا يظهر التعتيم
       (المضلعات يرسمها Leaflet) — نقوله صراحة بدل ترك مفتاح يبدو معطوباً.
       تلميحات العينة نفسها تعمل في الوضعين (يثريها geomap دوماً). */
    const smHint = h("span", { class: "map-hint", hidden: true },
      "إبراز العينة يظهر في وضع SVG — بدّل الوضع لمشاهدته");
    controls.appendChild(smHint);

    function syncSampleHint() {
      smHint.hidden = !(rt.st.sample && gm.mode() === "tiles");
    }

    /* مزامنة واجهة الوضع مع الوضع الفعلي (يشمل السقوط الصامت إلى SVG
       عند فشل البلاطات — عقد §4): تُستدعى بعد كل تبديل ودورياً. */
    const MODE_LABELS = { tiles: "بلاطات OSM حية", svg: "SVG دون اتصال" };
    function syncModeUI() {
      const m = gm.mode();
      /* وضع غير معروف (غياب ملف الحدود → "none") يُعرض شرطة صادقة */
      modeChip.textContent = "الوضع: " + (MODE_LABELS[m] || "—");
      modeChip.classList.toggle("live", m === "tiles");
      for (const b of [tilesBtn, svgBtn]) {
        const on = b.dataset.mode === m;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.classList.toggle("active", on);
      }
      syncSampleHint();
    }

    /* غياب الحدود: تعطيل صريح لكل الأزرار (geomap عندها واجهة صماء) */
    if (!hasGeo) {
      for (const b of controls.querySelectorAll("button")) {
        b.disabled = true;
        b.setAttribute("aria-disabled", "true");
      }
      modeChip.textContent = "الوضع: —";
    }

    syncLayerBtns();
    uiReady = true;
    syncModeUI();

    /* مواءمة مقاس الخريطة: المحرك يبني في مضيف احتياطي ثم يبدّل، وresizeAll
       يخدم ECharts لا Leaflet — مراقب المقاس يستدعي refresh عند أول قياس
       حقيقي وعند كل تغيّر لاحق. يُفصل في التنظيف. */
    let ro = null;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => gm.refresh());
      ro.observe(stage);
    }

    /* السقوط الصامت إلى SVG حدث غير معلن (لا حدث في واجهة geomap) —
       مزامنة دورية خفيفة لرقاقة الوضع وأزراره، تُفصل في التنظيف. */
    const modeTimer = setInterval(syncModeUI, 1600);

    ctx.onTeardown(() => {
      clearInterval(modeTimer);
      if (ro) ro.disconnect();
      gm.destroy();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) العمود الجانبي (span 3): رصيف بطاقة الحي + بطاقات الملخص القطاعية
        + سطرا الإسناد — أشرطة قياس البطاقات تتزامن مع الطبقة النشطة.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildRailCell(cell, ctx, rt) {
    const rel = ctx.release;
    const der = ctx.derived;
    const geoStats = sectorGeoStats(ctx.geo);
    cell.classList.add("map-rail-cell");

    const rail = h("div", { class: "map-rail", dataset: { ramp: "seq" } });
    cell.appendChild(rail);

    /* ── 6.1) رصيف بطاقة الحي — منطقة إعلان حية لقارئات الشاشة ── */
    const dock = h("div", {
      class: "map-dock-slot",
      "aria-live": "polite",
      "aria-atomic": "true",
    });
    rail.appendChild(dock);

    let dockOpen = false;
    let lastInfo = null;

    /** بطاقة التلميح الافتتاحية — إرشاد تفاعل لا شاشة انتظار */
    function dockHint() {
      RH.core.dom.clear(dock);
      dockOpen = false;
      lastInfo = null;
      dock.appendChild(h("div", { class: "map-dock map-dock-hint dash-card" },
        h("div", { class: "map-dock-hint-title" },
          h("span", { class: "map-dock-hint-dot", "aria-hidden": "true" }),
          "بطاقة الحي",
        ),
        h("p", { class: "map-dock-hint-text" },
          "انقر حياً على الخريطة — أو ركّزها بلوحة المفاتيح وتنقّل بالأسهم"
          + " ثم Enter — لعرض قيمه هنا فوراً."),
        h("p", { class: "map-dock-hint-text sub" },
          "أحياء العينة العشرون تحمل قيماً موثقة (أسرّة/رخص/مخالفات)"
          + " وتُبرز بمفتاح «إبراز العينة»."),
      ));
    }

    /** إغلاق الرصيف والعودة للتلميح مع إعادة التركيز إلى الخريطة */
    function closeDock() {
      if (!dockOpen) return;
      dockHint();
      const stage = cell.parentElement
        ? cell.parentElement.querySelector(".map-stage") : null;
      if (stage && stage.hasAttribute("tabindex")) stage.focus();
    }

    /** ملء الرصيف ببطاقة حي (عقد info من geomap.onDistrict) */
    function showDistrict(info) {
      RH.core.dom.clear(dock);
      dockOpen = true;
      lastInfo = info;
      const L = layerById(rt.st.layer);
      const s = info.sectorRow;
      const sd = info.sectorDerived;

      const card = h("div", { class: "map-dock dash-card" },
        h("div", { class: "map-dock-head" },
          h("div", { class: "map-dock-name" }, String(info.name)),
          h("button", {
            class: "map-dock-close",
            type: "button",
            "data-interactive": "",
            "aria-label": "إغلاق بطاقة الحي",
            title: "إغلاق (Escape)",
            onclick: closeDock,
          }, "✕"),
        ),
        h("div", { class: "map-dock-sub" },
          h("span", {}, String(info.sectorName)),
          info.name_en ? h("span", { class: "map-dock-en" },
            fmt.iso(String(info.name_en))) : null,
        ),
        h("div", { class: "map-dock-rows" },
          h("div", { class: "map-dock-row" },
            h("span", { class: "map-dock-k" }, L.short + " (قطاعياً)"),
            h("b", { class: "map-dock-v" }, L.fmtV(L.val(s, der))),
          ),
          h("div", { class: "map-dock-row" },
            h("span", { class: "map-dock-k" }, "تغطية القطاع"),
            h("b", { class: "map-dock-v" }, fmt.pct(sd.coverage_pct)),
          ),
          h("div", { class: "map-dock-row neg" },
            h("span", { class: "map-dock-k" }, "عجز القطاع"),
            h("b", { class: "map-dock-v" }, fmt.unitAfter(sd.deficit_beds, "سرير")),
          ),
        ),
      );

      if (info.sample) {
        /* قيم العينة الحقيقية للحي — شبكة أربع خانات موسومة بمصدر العينة */
        card.appendChild(h("div", { class: "map-dock-sample" },
          h("div", { class: "map-dock-sample-title" }, "قيم العينة للحي"),
          h("div", { class: "map-dock-sample-grid" },
            h("div", { class: "map-dock-cellv" },
              h("b", {}, fmt.int(info.sample.beds)),
              h("span", {}, "سرير"),
            ),
            h("div", { class: "map-dock-cellv" },
              h("b", {}, fmt.int(info.sample.building)),
              h("span", {}, "رخصة بناء"),
            ),
            h("div", { class: "map-dock-cellv" },
              h("b", {}, fmt.int(info.sample.operational)),
              h("span", {}, "رخصة تشغيلية"),
            ),
            h("div", { class: "map-dock-cellv neg" },
              h("b", {}, fmt.int(info.sample.violations)),
              h("span", {}, "مخالفة"),
            ),
          ),
          h("div", { class: "map-dock-note" }, String(rel.neighbourhoods.label)),
        ));
      } else {
        card.appendChild(h("div", { class: "map-dock-note plain" },
          "الحي خارج عينة الأحياء الموثقة — القيم المعروضة قطاعية بصدق."));
      }

      card.appendChild(h("div", { class: "map-dock-actions" },
        h("button", {
          class: "map-btn",
          type: "button",
          "data-interactive": "",
          "aria-label": "فتح الملف الكامل للحي «" + String(info.name) + "»",
          onclick: () => ctx.openDetail(
            districtFullDetail(ctx, info, layerById(rt.st.layer)),
            { title: String(info.name) }),
        }, "الملف الكامل"),
        h("button", {
          class: "map-btn ghost",
          type: "button",
          "data-interactive": "",
          "aria-label": "فتح الملف القطاعي «" + String(info.sectorName) + "»",
          onclick: () => ctx.openDetail(
            sectorDetail(ctx, info.sectorRow),
            { title: String(info.sectorName) }),
        }, "ملف القطاع"),
      ));

      dock.appendChild(card);
    }

    rt.showDistrict = showDistrict;
    dockHint();

    /* Escape يغلق رصيف الحي — إلا إذا كانت طبقة تفاصيل مفتوحة فوق القسم
       (مستمعها المتأخر في سجل الأقسام يجب أن يغلقها هو): مستمع مستندي
       بالتقاط، يُفصل في التنظيف. */
    const sectionRoot = cell.closest(".dash");
    function onDockKey(e) {
      if (e.key !== "Escape" || !dockOpen) return;
      if (sectionRoot && sectionRoot.querySelector(".detail-overlay")) return;
      e.stopPropagation();
      closeDock();
    }
    document.addEventListener("keydown", onDockKey, true);
    ctx.onTeardown(() => document.removeEventListener("keydown", onDockKey, true));

    /* ── 6.2) ترويسة الملخص القطاعي + رقاقة الطبقة النشطة ── */
    const layerChip = h("span", { class: "map-rail-layer" }, "");
    rail.appendChild(h("div", { class: "map-rail-head" },
      h("span", { class: "map-rail-title" }, "ملخص القطاعات"),
      layerChip,
    ));
    /* ── 6.3) خمسة صفوف قطاعية بأشرطة قياس متزامنة مع الطبقة ──
       إصلاح مراجعة الجولة 3 (بنيوي): البطاقات متعددة الأسطر كانت تفيض عن
       العمود فيُقص الشمال منتصف بطاقته وتغيب الشرق — الأعلى تغطية — تحت
       الطية كلياً. الصفوف الآن سطر واحد لكل قطاع (القطاع · شريط الطبقة
       وقيمتها · التغطية · العجز — الخريطة ذاتها تحمل الباقي، وملف القطاع
       بالنقر يحمل كل التفاصيل) فتظهر الخمسة كاملة فوق شريط الشارة في كلا
       المقاسين بلا تمرير — وسطر «مرر لاستعراضها» حُذف لأنه لم يعد صادقاً. */
    const secsWrap = h("div", { class: "map-secs" });
    rail.appendChild(secsWrap);

    const refs = []; // مراجع التحديث الحي: {sector, barEl, valEl}

    /* الترتيب التنفيذي الصحيح: تصاعدياً بنسبة التغطية — الأسوأ أولاً،
       فيتصدر الجنوب (34.8٪) العمود فوق خط الطي دائماً (مراجعة الجولة 1:
       كان الترتيب جغرافياً فيغيب الجنوب تحت الطي وهو جواب السؤال الأول) */
    const byCoverageAsc = rel.sectors.slice().sort((a, b) =>
      der.sector[a.id].coverage_pct - der.sector[b.id].coverage_pct);

    for (const s of byCoverageAsc) {
      const sd = der.sector[s.id];
      const gs = geoStats[s.id] || null;

      const bar = h("i", { class: "map-sec-bar-fill" });
      const val = h("b", { class: "map-sec-val" }, "");

      const card = h("article", { class: "map-sec dash-card" },
        h("span", { class: "map-sec-name" }, String(s.short || s.name)),
        h("span", { class: "map-sec-bar", "aria-hidden": "true" }, bar),
        val,
        h("span", {
          class: "map-sec-cov"
            + (sd.coverage_pct < der.coverage_pct ? " neg" : " pos"),
        }, fmt.pct(sd.coverage_pct)),
        /* المرجاني للعجز حصراً — قيمة بيانات لا زخرفة */
        h("span", { class: "map-sec-deficit" },
          "عجز " + fmt.compact(sd.deficit_beds)),
      );

      /* البديل النصي الكامل يحمل ما خرج من الصف المضغوط (المخالفات
         والمراقبون وعدّ الأحياء) — العدد والمعدود عبر fmt.noun حصراً */
      activatable(card,
        () => ctx.openDetail(sectorDetail(ctx, s), { title: String(s.name) }),
        String(s.name) + " — التغطية " + fmt.pct(sd.coverage_pct)
        + " والعجز " + fmt.unitAfter(sd.deficit_beds, "سرير")
        + "، " + fmt.noun(s.violations, "violation")
        + " و" + fmt.noun(s.monitors, "monitor")
        + (gs ? "، " + fmt.countNoun(gs.districts, LOCAL_NOUNS.district)
          + (gs.hotspots
            ? " و" + fmt.countNoun(gs.hotspots, LOCAL_NOUNS.point) + " تركّز"
            : "")
          : "")
        + " — عرض الملف القطاعي الموحد");
      card.title = String(s.name) + " — عرض الملف القطاعي الموحد";

      refs.push({ sector: s, barEl: bar, valEl: val });
      secsWrap.appendChild(card);
    }

    /** مزامنة أشرطة القياس مع الطبقة النشطة: العرض نسبة إلى أقصى قيمة
        قطاعية للطبقة، واللون من سلمها الدلالي (dataset.ramp على العمود) */
    function syncMeters() {
      const L = layerById(rt.st.layer);
      rail.dataset.ramp = L.ramp;
      layerChip.textContent = "الطبقة: " + L.short;

      let max = -Infinity;
      for (const r of refs) {
        const v = L.val(r.sector, der);
        if (v > max) max = v;
      }
      for (const r of refs) {
        const v = L.val(r.sector, der);
        const w = max > 0 ? Math.max(3, Math.round((v / max) * 100)) : 0;
        r.barEl.style.width = w + "%";
        r.valEl.textContent = L.meter(v);
      }

      /* الرصيف المفتوح يتبع الطبقة: تحديث سطر «قيمة الطبقة» بلا إغلاق */
      if (dockOpen && lastInfo) showDistrict(lastInfo);
    }
    rt.sub(syncMeters);
    syncMeters();

    /* ── 6.4) سطرا الإسناد الإلزاميان أسفل العمود ── */
    rail.appendChild(h("div", { class: "map-src" },
      h("p", { class: "map-src-line" }, String(rel.neighbourhoods.label) + "."),
      h("p", { class: "map-src-line" }, ATTRIB_TEXT + "."),
      h("p", { class: "map-src-line faint" },
        "في وضع البلاطات الحية يضاف: " + OSM_ATTRIB_TEXT + "."),
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) الملخص الناطق — فقرة مخفية بصرياً تقرأ اللوحة الجغرافية جملة واحدة
        لقارئات الشاشة قبل الغوص في الخريطة (الخريطة ذاتها role=application
        بملاحة أسهم كاملة داخل geomap).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, ctx) {
    const rel = ctx.release;
    const der = ctx.derived;
    const districts = countDistricts(ctx.geo);
    const hotspotsN = ctx.geo && ctx.geo.hotspots ? ctx.geo.hotspots.length : 0;
    const hi = sectorById(rel, der.rankings.highest_coverage);
    const lo = sectorById(rel, der.rankings.lowest_coverage);

    const txt = "خريطة الرياض التفاعلية — "
      + (districts
        ? fmt.countNoun(districts, LOCAL_NOUNS.district) + " بحدود حقيقية"
        : "ملف الحدود غير مضمن")
      + " على " + fmt.countNoun(rel.sectors.length, LOCAL_NOUNS.sector)
      + "، منها " + fmt.countNoun(rel.neighbourhoods.rows.length, LOCAL_NOUNS.district)
      + " في العينة الموثقة، و"
      + fmt.countNoun(hotspotsN, LOCAL_NOUNS.point) + " للتركّز الرقابي. "
      + "أعلى تغطية قطاعية " + fmt.pct(der.sector[hi.id].coverage_pct)
      + " في " + String(hi.name)
      + "، وأدناها " + fmt.pct(der.sector[lo.id].coverage_pct)
      + " في " + String(lo.name)
      + ". الطبقات المتاحة: أسرّة وتشغيلية وبناء ومخالفات ومراقبون وطلب وتغطية.";
    el.appendChild(h("p", { class: "map-sr-summary" }, txt));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) تجميع اللوحة وتسجيل القسم — عقد RH.sections.register
        (order:5، id:"map"، backdrop:"map" من عقد الوسائط §6)
        الشبكة: الخريطة span 9 تملأ الارتفاع، العمود الجانبي span 3.
        معاملات الروابط العميقة المقروءة (لا تُكتب من المبدلات — عقد المحرك):
          layer=beds|operational|building|violations|inspectors|demand|coverage
          hs=1 (نقاط التركّز) · sm=1 (إبراز العينة) · mmode=svg|tiles
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "map",
    order: 5,
    title: "خريطة الرياض التفاعلية",
    kicker: "القيادة الجغرافية",
    backdrop: "map",
    build(el, ctx) {
      const rel = ctx.release;

      /* حالة القسم المشتركة بين الخريطة والعمود الجانبي + ناقل اشتراكات
         خفيف: تغيير الطبقة في شريط التحكم يحدّث أشرطة القياس والرصيف. */
      const subs = [];
      const rt = {
        st: {
          layer: validLayer(ctx.params.layer) ? ctx.params.layer : "beds",
          /* نقاط التركّز ظاهرة افتراضياً (إصلاح المراجعة: الطبقة الافتراضية
             كانت صامتة بلا نقاط) — hs=0 يخفيها عبر الرابط العميق */
          hotspots: ctx.params.hs !== "0",
          sample: ctx.params.sm === "1",
          mode: ctx.params.mmode === "svg" ? "svg"
            : ctx.params.mmode === "tiles" ? "tiles" : "auto",
        },
        gm: null,
        sub: (fn) => subs.push(fn),
        emit: () => { for (const fn of subs) fn(); },
        showDistrict: () => {}, // يوصله العمود الجانبي قبل أول نقر ممكن
      };

      /* الترويسة: سياق ذهبي + عنوان + وسم حداثة البيانات + سطر الفترة */
      RH.presenter.layout.sectionHeader(el, {
        kicker: "القيادة الجغرافية",
        title: "خريطة الرياض التفاعلية",
        badge: "بيانات حتى " + String(rel.meta.data_as_of),
        meta: "فترة الرصد: " + String(rel.meta.monitoring_period_label),
      });

      /* الملخص الناطق ثم شريط المؤشرات الست ثم شبكة الخريطة/العمود */
      buildSrSummary(el, ctx);
      buildStrip(el, ctx);

      const g = RH.presenter.layout.grid(el, { cols: 12, cls: "map-grid" });
      const cMap = g.cell({ span: 9, cls: "map-cell" });
      const cRail = g.cell({ span: 3, cls: "map-cell" });

      /* العمود أولاً كي يكون rt.showDistrict موصولاً قبل بناء الخريطة
         (نقر مبكر محتمل أثناء نفس الإطار) — ترتيب DOM تضبطه الشبكة لا
         ترتيب البناء. */
      buildRailCell(cRail, ctx, rt);
      buildMapCell(cMap, ctx, rt);
    },
  });
})();
