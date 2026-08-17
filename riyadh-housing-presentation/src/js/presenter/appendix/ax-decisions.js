/* ════════════════════════════════════════════════════════════════════════════
   ax-decisions.js — سجل القرارات المطلوبة (ملحق `decisions`)
   عقد V2_CONTRACTS_EXPANSION §8.2 — بادئة الأنماط `dcs-` في src/styles/decisions.css
   ────────────────────────────────────────────────────────────────────────────
   ما تفعله هذه الوحدة بالضبط:

     ▸ تشتق **سجل القرارات المطلوبة** من لوحات الرؤى المعتمدة في الإصدار
       (`insight_panels` بحالة `approved_brief`) دون كتابة جملة واحدة جديدة:
       القرار والأثر **مقتطعان حرفياً** من نص البطاقة نفسه عند حدّ جملة
       آمن، والتصنيف من البطاقة، والمصدر عنوانها ومفتاح قسمها.
       بطاقة بلا لغة توصية صريحة تُستبعد — وتُعرض مستبعدةً بالاسم في صفحة
       الحدود كي لا يظن القارئ أن شيئاً حُجب عنه.

     ▸ تعرض `next_steps` بحالتها الحقيقية: ما دامت غير معتمدة فبطاقة
       `layout.pendingCard` الصادقة «لا خطوات معتمدة بعد» — ولا يُخترع منها
       قرار ولا تُملأ بقائمة مقترحة.

     ▸ تسجّل ملحقاً من ثلاث صفحات عبر `RH.presenter.ax.register`:
         1) السجل — جدول كثيف بترشيح التصنيف (أزرار `role="tab"`).
         2) مجمَّعة بالأقسام — بطاقة لكل قسم بقراراته وأثره ومصدره.
         3) الحدود والصدق — قاعدة الاشتقاق، والبطاقات المستبعدة بأسمائها،
            وحالة الخطوات القادمة، وما يلزم لتحويل قرار إلى خطوة معتمدة.

   قواعد ملزمة مطبَّقة حرفياً في هذا الملف:
   • **لا نص جديد**: `decision` و`impact` سلسلتان فرعيتان حرفيتان من
     `panel.text` — يُختبر ذلك في اختبار الوحدة باحتواء النص الأصلي لهما.
     لا إعادة صياغة ولا استنتاج ولا فعل أمر مضاف.
   • **لا رقم مختلق**: كل رقم يظهر هنا إما داخل نص بطاقة معتمدة (اجتاز
     بوابة مجمع الحقائق الحاجبة) أو عدّاد يُنسق عبر `RH.core.fmt`.
   • **منظومة المعنى مقفلة**: تصنيف البطاقة (pos/neg/warn/neu) هو مصدر
     اللون الوحيد — مرجاني للخلل حصراً، ذهبي للانتظار والوسوم حصراً.
   • **لوحة المفاتيح**: التبويبات `role="tab"` بأسهم يمين/يسار وHome/End،
     وصفوف الجدول قابلة للتفعيل بEnter/مسافة، وكلها `data-interactive`
     فلا يبتلع جهاز التقديم ضغطاتها (عقد §8).
   • **الحالة تصمد**: التصنيف المرشَّح والقرار المختار يُكتبان في معاملات
     المسار عبر `ctx.update` فيعودان كما تُركا.
   • **التنظيف**: لا مستمع عام ولا مؤقت في هذا الملف — ما يُنشأ من مستمعين
     يسقط مع هدم DOM الملحق (دورة حياة المحرك)، والمؤقت الوحيد المحتمل
     (تأجيل كتابة المسار) يُلغى في `ctx.onTeardown`.
   • **prefers-reduced-motion**: لا حركة هنا؛ الانتقالات في decisions.css
     وتُصفَّر عند طلب التقليل.

   ملاحظة قابلية الاختبار (عقد التوسعة §0): النموذج النقي يُعرَّف وقت التحميل
   دون لمس `document`/`window`، وتسجيل الملحق مشروط بحضور `RH.presenter.ax`.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════════════════════════════════════════════════════════════════
   القسم 1) النموذج النقي — RH.explore.decisions (+ الاختصار المتعاقد عليه
   RH.explore.decisionsModel الذي تفحصه لوحة الأوامر لتقرير وجود الملحق).
   ══════════════════════════════════════════════════════════════════════════ */
RH.explore.decisions = (function () {
  const fmt = RH.core.fmt;

  /* ── 1.0) مفردات مقفلة ─────────────────────────────────────────────── */

  /**
   * علامات لغة التوصية المعتمدة. القائمة **وصفية لا إنشائية**: تُستعمل
   * للكشف عن وجود توصية داخل نص قائم، ولا تُضاف كلمة منها إلى أي نص.
   * (هي مفردات الحكم نفسها التي انتقى بها قسم الخاتمة توصياته المعتمدة.)
   */
  const MARKERS = Object.freeze([
    "يوصى",
    "يستدعي",
    "حاجة",
    "يلزم",
    "ينبغي",
    "مطلوب",
    "يجب",
    "توصية",
  ]);

  /** حدود الجُمل الآمنة للقطع — القطع يقع **عندها** فلا تُبتر عبارة نصفين */
  const BOUNDARIES = Object.freeze(["—", "؛", "،", ".", ":"]);

  /** التصنيفات القانونية لبطاقات الرؤى (مفردات مقفلة — عقد §2) */
  const CLS_KEYS = Object.freeze(["pos", "neg", "warn", "neu"]);

  const CLS_LABELS = Object.freeze({
    pos: "إيجابي",
    neg: "خلل",
    warn: "تنبيه",
    neu: "محايد",
  });

  /** وصف ما يعنيه التصنيف في سياق قرار مطلوب (نص واجهة، لا بيانات) */
  const CLS_NOTES = Object.freeze({
    pos: "قرار يبني على أثر إيجابي قائم",
    neg: "قرار يعالج خللاً مسجَّلاً",
    warn: "قرار يستبق تنبيهاً مرصوداً",
    neu: "قرار تنظيمي أو إجرائي",
  });

  /** المفاتيح القانونية للوحات الرؤى وما تقابله من أقسام وملاحق */
  const SECTION_META = Object.freeze({
    supply: {
      key: "supply", label: "العرض والطلب", sectionId: "demand",
      appendixId: "demand", order: 1,
    },
    licensing: {
      key: "licensing", label: "التراخيص", sectionId: "licensing",
      appendixId: "licensing", order: 2,
    },
    control: {
      key: "control", label: "الرقابة الميدانية", sectionId: "control",
      appendixId: "monitoring", order: 3,
    },
    initiatives: {
      key: "initiatives", label: "المبادرات والركائز", sectionId: "initiatives",
      appendixId: "pillar", order: 4,
    },
  });

  /** ترتيب قراءة الأقسام (مفاتيح غير معروفة تلحق في الذيل أبجدياً) */
  const SECTION_ORDER = Object.freeze(
    Object.keys(SECTION_META).sort((a, b) => SECTION_META[a].order - SECTION_META[b].order));

  /** الحالة الوحيدة التي يُشتق منها قرار — ما دونها لا يدخل السجل */
  const APPROVED = "approved_brief";

  /** نصوص حالات معروفة (مرآة الخريطة المعتمدة في الأقسام) */
  const STATUS_LABELS = Object.freeze({
    approved: "معتمد",
    approved_brief: "موجز معتمد — اجتاز بوابة مجمع الحقائق",
    pending_approval: "بانتظار الاعتماد",
  });

  const str = (v) => (v == null ? "" : String(v));

  /** نص حالة معروف أو المعرف الخام صدقاً */
  function statusLabel(status) {
    const k = str(status);
    if (!k) return "—";
    return STATUS_LABELS[k] || k;
  }

  /** تصنيف قانوني أو المحايد — لا صنف خارج المفردات المقفلة يتسرب للعرض */
  function normalizeCls(cls) {
    const k = str(cls);
    return CLS_KEYS.includes(k) ? k : "neu";
  }

  /** اسم التصنيف المعروض */
  function clsLabel(cls) {
    return CLS_LABELS[normalizeCls(cls)];
  }

  /* ── 1.1) كشف التوصية وقطع الجملة ────────────────────────────────────
     القاعدة كلها **قصّ** لا إنشاء: نجد أول علامة توصية، ثم أقرب حدّ جملة
     قبلها، فيصير ما قبل الحدّ «أثراً» وما بعده «قراراً» — وكلاهما سلسلة
     فرعية حرفية من نص البطاقة.
     ─────────────────────────────────────────────────────────────────── */

  /** فهرس أول علامة توصية في النص، أو ‎-1 */
  function markerIndex(text) {
    const t = str(text);
    let best = -1;
    let bestMarker = "";
    for (const m of MARKERS) {
      const i = t.indexOf(m);
      if (i === -1) continue;
      if (best === -1 || i < best) { best = i; bestMarker = m; }
    }
    return { index: best, marker: bestMarker };
  }

  /** هل يتضمن النص لغة توصية صريحة؟ */
  function hasRecommendation(text) {
    return markerIndex(text).index !== -1;
  }

  /**
   * قطع النص إلى (أثر، قرار).
   * • علامة التوصية في أول النص أو بلا حدّ جملة قبلها → لا قطع آمن:
   *   النص كاملاً قرارٌ، والأثر يبقى فارغاً (والواجهة تقول ذلك صراحة).
   * • وإلا: الأثر ما قبل الحدّ، والقرار من بعد الحدّ إلى آخر النص.
   * تعيد: { decision, impact, split, marker, boundary }
   */
  function splitRecommendation(text) {
    const t = str(text).trim();
    const mk = markerIndex(t);
    if (mk.index === -1) {
      return { decision: "", impact: "", split: false, marker: "", boundary: "" };
    }

    /* أقرب حدّ جملة يقع **قبل** علامة التوصية */
    let cut = -1;
    let boundary = "";
    for (const b of BOUNDARIES) {
      const i = t.lastIndexOf(b, mk.index);
      if (i > cut) { cut = i; boundary = b; }
    }

    if (cut <= 0) {
      /* لا حدّ آمن: النص جملة واحدة كلها توصية */
      return { decision: t, impact: "", split: false, marker: mk.marker, boundary: "" };
    }

    const impact = t.slice(0, cut).trim();
    const decision = t.slice(cut + boundary.length).trim();

    /* حماية من قطع يخلّف طرفاً أجوف: نصف كلمة أو عبارة بلا معنى مستقل */
    if (decision.length < 12 || impact.length < 12) {
      return { decision: t, impact: "", split: false, marker: mk.marker, boundary: "" };
    }
    return { decision, impact, split: true, marker: mk.marker, boundary };
  }

  /* ── 1.2) قراءة لوحات الرؤى ──────────────────────────────────────────── */

  /** خريطة أقسام لوحات الرؤى من الإصدار (كائن فارغ عند الغياب) */
  function panelSections(release) {
    const ip = release && release.insight_panels;
    return (ip && ip.sections) || {};
  }

  /** مفاتيح الأقسام الموجودة فعلاً بترتيب القراءة القانوني */
  function sectionKeys(release) {
    const sections = panelSections(release);
    const present = Object.keys(sections);
    const known = SECTION_ORDER.filter((k) => present.includes(k));
    const rest = present.filter((k) => !SECTION_ORDER.includes(k)).sort();
    return known.concat(rest);
  }

  /** بيانات وصف قسم — مفتاح غير معروف يُعرض بمفتاحه صدقاً */
  function sectionMeta(key) {
    return SECTION_META[key] || {
      key, label: str(key), sectionId: null, appendixId: null, order: 99,
    };
  }

  /** كل بطاقات الرؤى بترتيبها مع مفتاح قسمها */
  function allPanels(release) {
    const sections = panelSections(release);
    const out = [];
    for (const key of sectionKeys(release)) {
      const list = sections[key];
      if (!Array.isArray(list)) continue;
      list.forEach((p, i) => {
        if (!p) return;
        out.push({
          panel: p, sectionKey: key, indexInSection: i, meta: sectionMeta(key),
        });
      });
    }
    return out;
  }

  /* ── 1.3) سجل القرارات ───────────────────────────────────────────────── */

  /**
   * السجل: قرار لكل بطاقة معتمدة تحمل لغة توصية.
   * الحقول المتعاقد عليها (§8.2): id, section, sectionTitle, decision,
   * impact, source, cls — ومعها حقول عرض لا تغيّر شيئاً من المعنى.
   */
  function decisionsModel(release) {
    const out = [];
    for (const rec of allPanels(release)) {
      const p = rec.panel;
      if (str(p.status) !== APPROVED) continue;
      const text = str(p.text).trim();
      if (!text || !hasRecommendation(text)) continue;

      const parts = splitRecommendation(text);
      if (!parts.decision) continue;

      out.push({
        id: str(p.id),
        section: rec.sectionKey,
        sectionTitle: rec.meta.label,
        sectionId: rec.meta.sectionId,
        appendixId: rec.meta.appendixId,
        decision: parts.decision,
        impact: parts.impact,
        source: str(p.title) + " — " + rec.meta.label,
        sourceTitle: str(p.title),
        cls: normalizeCls(p.cls),
        clsLabel: clsLabel(p.cls),
        clsNote: CLS_NOTES[normalizeCls(p.cls)],
        split: parts.split,
        marker: parts.marker,
        text,
        status: str(p.status),
        statusLabel: statusLabel(p.status),
        order: rec.meta.order * 100 + rec.indexInSection,
      });
    }
    out.sort((a, b) => a.order - b.order);
    return out;
  }

  /**
   * البطاقات المعتمدة **المستبعدة** من السجل لأنها تقريرية لا توصوية.
   * عرضها بالاسم جزء من الصدق: القارئ يرى أن الاستبعاد قاعدة معلنة لا حذف.
   */
  function excludedPanels(release) {
    const out = [];
    for (const rec of allPanels(release)) {
      const p = rec.panel;
      const text = str(p.text).trim();
      const approved = str(p.status) === APPROVED;
      if (approved && text && hasRecommendation(text)) continue;
      out.push({
        id: str(p.id),
        section: rec.sectionKey,
        sectionTitle: rec.meta.label,
        title: str(p.title),
        text,
        cls: normalizeCls(p.cls),
        clsLabel: clsLabel(p.cls),
        status: str(p.status),
        statusLabel: statusLabel(p.status),
        reason: !approved
          ? "حالة البطاقة ليست «موجز معتمد» — لا يُشتق قرار من نص غير معتمد"
          : "لا لغة توصية في النص — بطاقة تقريرية، والاشتقاق منها اختلاق",
      });
    }
    return out;
  }

  /** تجميع السجل بالأقسام بترتيب القراءة */
  function groupBySection(list) {
    const bag = new Map();
    for (const d of list || []) {
      if (!bag.has(d.section)) {
        bag.set(d.section, {
          key: d.section,
          title: d.sectionTitle,
          sectionId: d.sectionId,
          appendixId: d.appendixId,
          items: [],
        });
      }
      bag.get(d.section).items.push(d);
    }
    const arr = Array.from(bag.values());
    arr.sort((a, b) => sectionMeta(a.key).order - sectionMeta(b.key).order);
    return arr;
  }

  /** عدادات التصنيفات — مفاتيح ثابتة دائماً كي لا يختفي تبويب بلا نتائج */
  function countByCls(list) {
    const counts = { pos: 0, neg: 0, warn: 0, neu: 0 };
    for (const d of list || []) counts[normalizeCls(d.cls)] += 1;
    return counts;
  }

  /** ترشيح بالتصنيف — "all" أو تصنيف قانوني، وما عداه يُعامل معاملة "all" */
  function filterByCls(list, cls) {
    if (!cls || cls === "all" || !CLS_KEYS.includes(cls)) return (list || []).slice();
    return (list || []).filter((d) => normalizeCls(d.cls) === cls);
  }

  /** ترشيح بالقسم */
  function filterBySection(list, section) {
    if (!section || section === "all") return (list || []).slice();
    return (list || []).filter((d) => d.section === section);
  }

  /** تطبيع البحث عبر الأدوات المشتركة حصراً (عقد §10) */
  function normalize(s) {
    const geo = RH.viz && RH.viz.geoutils;
    if (geo && typeof geo.normalizeAr === "function") return geo.normalizeAr(s);
    return str(s).trim().toLowerCase();
  }

  /** بحث حر داخل السجل: القرار والأثر والمصدر والقسم والمعرف */
  function searchDecisions(list, query) {
    const q = normalize(query);
    if (!q) return (list || []).slice();
    return (list || []).filter((d) => normalize(
      [d.id, d.decision, d.impact, d.source, d.sectionTitle, d.clsLabel].join(" "),
    ).indexOf(q) !== -1);
  }

  /** قرار بمعرفه */
  function decisionById(list, id) {
    const key = str(id);
    for (const d of list || []) {
      if (d.id === key) return d;
    }
    return null;
  }

  /* ── 1.4) الخطوات القادمة ────────────────────────────────────────────── */

  /**
   * حالة `next_steps` كما وردت. غير معتمدة → بطاقة صادقة، ولا يُشتق منها
   * قرار ولا تُملأ بقائمة مقترحة. معتمدة → تُعرض بنودها كما وردت حرفياً.
   */
  function nextStepsModel(release) {
    const ns = (release && release.next_steps) || null;
    if (!ns) {
      return {
        present: false, approved: false, status: "", statusLabel: "—",
        note: "", items: [], count: 0,
        headline: "لا كتلة خطوات قادمة في هذا الإصدار",
      };
    }
    const approved = str(ns.status) === "approved";
    const items = Array.isArray(ns.items) ? ns.items.slice() : [];
    return {
      present: true,
      approved,
      status: str(ns.status),
      statusLabel: statusLabel(ns.status),
      note: str(ns.note),
      items,
      count: items.length,
      headline: approved
        ? "الخطوات المعتمدة"
        : "لا خطوات معتمدة بعد",
    };
  }

  /* ── 1.5) خلاصة السجل ────────────────────────────────────────────────── */

  /**
   * خلاصة جاهزة للعرض والاختبار: العدد، التوزيع بالتصنيف والقسم، وكم قرار
   * انقسم نصه بأمان وكم عُرض كاملاً في خانة القرار.
   */
  function summary(release) {
    const list = decisionsModel(release);
    const excluded = excludedPanels(release);
    const counts = countByCls(list);
    const groups = groupBySection(list);
    return {
      total: list.length,
      counts,
      sections: groups.map((g) => ({ key: g.key, title: g.title, count: g.items.length })),
      split: list.filter((d) => d.split).length,
      whole: list.filter((d) => !d.split).length,
      excluded: excluded.length,
      panelsTotal: list.length + excluded.length,
      nextSteps: nextStepsModel(release),
    };
  }

  /** صياغة نصية لقرار واحد — للتسمية الصوتية ولملخص قارئ الشاشة */
  function describe(entry) {
    if (!entry) return "—";
    const parts = ["قرار مطلوب من " + entry.sectionTitle + ": " + entry.decision];
    if (entry.impact) parts.push("أثره: " + entry.impact + ".");
    parts.push("مصدره: " + entry.source + ".");
    return parts.join(" ");
  }

  /** فحص اتساق تطويري: كل قرار مقتطع حرفياً من نص بطاقته */
  function verbatimCheck(list) {
    const bad = [];
    for (const d of list || []) {
      const okDecision = d.text.indexOf(d.decision) !== -1;
      const okImpact = !d.impact || d.text.indexOf(d.impact) !== -1;
      if (!okDecision || !okImpact) bad.push(d.id);
    }
    return { ok: bad.length === 0, offenders: bad };
  }

  return {
    /* مفردات مقفلة */
    MARKERS, BOUNDARIES, CLS_KEYS, CLS_LABELS, CLS_NOTES,
    SECTION_META, SECTION_ORDER, APPROVED, STATUS_LABELS,

    /* أدوات نصية */
    statusLabel, normalizeCls, clsLabel, normalize,
    markerIndex, hasRecommendation, splitRecommendation,

    /* قراءة الإصدار */
    panelSections, sectionKeys, sectionMeta, allPanels,

    /* السجل */
    decisionsModel, excludedPanels, groupBySection, countByCls,
    filterByCls, filterBySection, searchDecisions, decisionById,

    /* الخطوات والخلاصة */
    nextStepsModel, summary, describe, verbatimCheck,
  };
})();

/* الاختصار المتعاقد عليه في §8.2 — وهو أيضاً إشارة الوجود التي تفحصها
   لوحة الأوامر (`typeof RH.explore.decisionsModel === "function"`). */
RH.explore.decisionsModel = function (release) {
  return RH.explore.decisions.decisionsModel(release);
};

/* ══════════════════════════════════════════════════════════════════════════
   القسم 2) واجهة الملحق — ثلاث صفحات فوق النموذج النقي أعلاه
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  const dom = RH.core.dom;
  const { h } = dom;
  const fmt = RH.core.fmt;
  const model = RH.explore.decisions;

  /** عناوين الأقسام للعودة السياقية — مرآة الجدول القانوني في V2_CONTRACTS §1 */
  const SECTION_TITLES = {
    "00": "الغلاف",
    summary: "الملخص التنفيذي",
    demand: "العرض والطلب",
    licensing: "التراخيص",
    control: "الرقابة الميدانية",
    map: "خريطة الرياض التفاعلية",
    initiatives: "المبادرات والركائز",
    kpis: "مؤشرات الأداء",
    forecast: "سيناريوهات العجز",
    closing: "الخاتمة والتوصيات",
  };

  /** صيغ عدد ومعدود محلية */
  const LOCAL_NOUNS = {
    decision: { one: "قرار واحد", two: "قراران", few: "قرارات", many: "قراراً", hundred: "قرار" },
    card: { one: "بطاقة واحدة", two: "بطاقتان", few: "بطاقات", many: "بطاقة", hundred: "بطاقة" },
    step: { one: "خطوة واحدة", two: "خطوتان", few: "خطوات", many: "خطوة", hundred: "خطوة" },
    section: { one: "قسم واحد", two: "قسمان", few: "أقسام", many: "قسماً", hundred: "قسم" },
  };
  const noun = (n, key) => fmt.countNoun(n, LOCAL_NOUNS[key]);

  /** نسبة «جزء من كل» بعزل اتجاهي حتمي — بلا العازل ينعكس ترتيب الطرفين
      داخل الفقرة العربية فيُقرأ ‎3 / 4‎ مقلوباً. */
  const ratio = (a, b) => fmt.iso(fmt.int(a) + " / " + fmt.int(b));

  /* حالة تعمّر عبر إعادة البناء الناتجة عن كتابة المسار (الملف يُحمَّل مرة) */
  let pendingFocus = null;

  /* ── 2.0) أدوات بناء مشتركة ────────────────────────────────────────── */

  /** زر عام بنمط الملحق */
  function button(cls, label, onAct, opts) {
    const o = opts || {};
    const btn = h("button", {
      class: cls,
      type: "button",
      "data-interactive": "",
      "aria-label": o.aria || null,
      title: o.title || null,
      disabled: o.disabled === true,
      onclick: onAct,
    }, o.children || label);
    if (o.pressed != null) btn.setAttribute("aria-pressed", String(!!o.pressed));
    return btn;
  }

  /** وسم صغير — التصنيف هو مصدر اللون الوحيد (منظومة المعنى) */
  function badge(text, tone) {
    return h("span", { class: "dcs-badge" + (tone ? " " + tone : "") }, text);
  }

  /** سطر هامشي موحد */
  function noteLine(el, text, cls) {
    const p = h("p", { class: "dcs-note" + (cls ? " " + cls : "") }, text);
    el.appendChild(p);
    return p;
  }

  /** شريط إحصاءات علوي */
  function statStrip(el, items) {
    const strip = h("div", { class: "dcs-strip", role: "list" });
    for (const it of items || []) {
      if (!it) continue;
      strip.appendChild(h("div", {
        class: "dcs-stat" + (it.tone ? " " + it.tone : ""),
        role: "listitem",
      },
        h("div", { class: "dcs-stat-k" }, it.label),
        h("div", { class: "dcs-stat-v" }, it.value),
        it.foot ? h("div", { class: "dcs-stat-f" }, it.foot) : null,
      ));
    }
    el.appendChild(strip);
    return strip;
  }

  /**
   * شريط تبويبات `role="tab"` بملاحة أسهم كاملة (يمين/يسار في RTL،
   * أعلى/أسفل أيضاً) وHome/End — التفعيل بالنقر أو Enter/مسافة.
   */
  function tabBar(el, opts) {
    const o = opts || {};
    const bar = h("div", {
      class: "dcs-tabs" + (o.cls ? " " + o.cls : ""),
      role: "tablist",
      "aria-label": o.ariaLabel || "",
    });
    const btns = [];
    const items = o.items || [];

    items.forEach((it, i) => {
      const on = it.key === o.value;
      const b = h("button", {
        class: "dcs-tab" + (on ? " now" : "") + (it.cls ? " " + it.cls : ""),
        type: "button",
        role: "tab",
        "data-interactive": "",
        "aria-selected": String(on),
        tabindex: on ? "0" : "-1",
        "aria-label": it.aria || null,
        title: it.hint || null,
        onclick: () => o.onPick(it.key),
      },
        h("span", { class: "dcs-tab-label" }, it.label),
        it.count != null ? h("span", { class: "dcs-tab-n" }, fmt.int(it.count)) : null,
      );
      b.addEventListener("keydown", (ev) => {
        const k = ev.key;
        let j = -1;
        if (k === "ArrowLeft" || k === "ArrowDown") j = i + 1;
        else if (k === "ArrowRight" || k === "ArrowUp") j = i - 1;
        else if (k === "Home") j = 0;
        else if (k === "End") j = btns.length - 1;
        else if (k === "Enter" || k === " " || k === "Spacebar") {
          ev.preventDefault();
          ev.stopPropagation();
          o.onPick(it.key);
          return;
        } else return;
        ev.preventDefault();
        ev.stopPropagation();
        const t = Math.max(0, Math.min(btns.length - 1, j));
        btns.forEach((x) => x.setAttribute("tabindex", "-1"));
        btns[t].setAttribute("tabindex", "0");
        btns[t].focus();
      });
      bar.appendChild(b);
      btns.push(b);
    });

    el.appendChild(bar);
    return { bar, buttons: btns };
  }

  /** حالة فارغة صادقة */
  function emptyState(host, label, note) {
    return RH.presenter.layout.pendingCard(host, { label, note: note || null });
  }

  /** قراءة معامل مسار نصي محدود الطول */
  function paramStr(ctx, key, max) {
    const v = ctx && ctx.params ? ctx.params[key] : null;
    if (v == null) return "";
    const s = String(v);
    return s.length > (max || 40) ? s.slice(0, max || 40) : s;
  }

  /** قفز بين صفحات الملحق ذاته */
  function goPage(ctx, n) {
    pendingFocus = null;
    ctx.update({ page: n === 0 ? null : String(n) });
  }

  /** الانتقال إلى ملحق شقيق مع الحفاظ على وجهة العودة الأصلية */
  function goAppendix(id, ctx) {
    const params = {};
    if (ctx && ctx.params && ctx.params.return) params.return = ctx.params.return;
    RH.core.router.go({ kind: "appendix", id, params });
  }

  /** الانتقال إلى قسم مصدر القرار (مغادرة معلنة للملحق) */
  function goSection(id) {
    if (!id) return;
    if (RH.sections && RH.sections.VALID_IDS
        && !RH.sections.VALID_IDS.includes(id)) return;
    RH.core.router.go({ kind: "scene", id, params: {} });
  }

  /** بطاقة قرار واحدة — نفس التركيب في الصفحتين الأولى والثانية */
  function decisionCard(host, d, ctx, opts) {
    const o = opts || {};
    const card = h("article", {
      class: "dcs-card " + d.cls + (o.cls ? " " + o.cls : ""),
      "aria-label": model.describe(d),
    });

    card.appendChild(h("header", { class: "dcs-card-head" },
      badge(d.clsLabel, d.cls),
      h("span", { class: "dcs-card-src" }, d.sourceTitle),
      h("span", { class: "dcs-card-id" }, fmt.iso(d.id)),
    ));

    card.appendChild(h("div", { class: "dcs-field dcs-field-decision" },
      h("div", { class: "dcs-field-k" }, "قرار مطلوب"),
      h("p", { class: "dcs-field-v" }, d.decision),
    ));

    card.appendChild(h("div", { class: "dcs-field dcs-field-impact" },
      h("div", { class: "dcs-field-k" }, "أثره"),
      d.impact
        ? h("p", { class: "dcs-field-v" }, d.impact)
        : h("p", { class: "dcs-field-v dim" },
          "نص البطاقة جملة واحدة لا تنقسم بأمان — عُرضت كاملة في خانة القرار "
          + "أعلاه، ولم يُصَغ لها أثر منفصل."),
    ));

    card.appendChild(h("div", { class: "dcs-field dcs-field-source" },
      h("div", { class: "dcs-field-k" }, "مصدره"),
      h("p", { class: "dcs-field-v" }, d.source),
      h("p", { class: "dcs-field-sub" },
        d.statusLabel + " · " + d.clsNote),
    ));

    if (o.actions !== false) {
      const actions = h("div", { class: "dcs-card-actions" });
      if (d.sectionId) {
        actions.appendChild(button("dcs-linkbtn", "الانتقال إلى القسم",
          () => goSection(d.sectionId), {
            aria: "الانتقال إلى قسم " + d.sectionTitle + " مصدر هذا القرار",
            children: [h("span", {}, "الانتقال إلى " + d.sectionTitle),
              h("span", { class: "dcs-arrow", "aria-hidden": "true" }, "←")],
          }));
      }
      if (o.onFocus) {
        actions.appendChild(button("dcs-linkbtn ghost", "عرض نص البطاقة كاملاً",
          () => o.onFocus(d), { aria: "عرض نص بطاقة الرؤية كاملاً لهذا القرار" }));
      }
      if (actions.childNodes.length) card.appendChild(actions);
    }

    host.appendChild(card);
    return card;
  }

  /** بطاقة الخطوات القادمة الصادقة — تلازم السجل ولا تُخترع منها قرارات */
  function nextStepsCard(host, ns, opts) {
    const o = opts || {};
    if (!ns.present) {
      return emptyState(host, "لا كتلة خطوات قادمة في هذا الإصدار", null);
    }
    if (!ns.approved) {
      const card = RH.presenter.layout.pendingCard(host, {
        label: ns.headline + " — " + ns.statusLabel,
        note: ns.note,
      });
      if (o.extra) {
        const extra = h("p", { class: "dcs-pending-extra" }, o.extra);
        const body = card.querySelector ? card.querySelector(".pending-body") : null;
        (body || card).appendChild(extra);
      }
      return card;
    }
    const card = RH.presenter.layout.card(host, {
      title: ns.headline,
      sub: ns.statusLabel,
      cls: "dcs-card-steps",
    });
    const ol = h("ol", { class: "dcs-steps" });
    for (const it of ns.items) {
      ol.appendChild(h("li", { class: "dcs-step" },
        typeof it === "string" ? it : String(it && it.text ? it.text : it)));
    }
    card.body.appendChild(ol);
    return card.card;
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-أ) الصفحة 1 — السجل
     ──────────────────────────────────────────────────────────────────────
     جدول كثيف بترشيح التصنيف (`role="tab"`) ولوحة تفصيل للقرار المختار،
     وبطاقة الخطوات القادمة الصادقة أسفل السجل (عقد §8.2).
     ══════════════════════════════════════════════════════════════════════ */
  function pageRegister(el, ctx) {
    const rel = RH.data.store.release();
    const all = model.decisionsModel(rel);
    const counts = model.countByCls(all);
    const ns = model.nextStepsModel(rel);
    const groups = model.groupBySection(all);

    let cls = paramStr(ctx, "c", 6);
    if (cls !== "all" && !model.CLS_KEYS.includes(cls)) cls = "all";
    let selected = paramStr(ctx, "d", 12);
    if (selected && !model.decisionById(all, selected)) selected = "";

    const page = h("div", { class: "dcs-page dcs-p1" });
    el.appendChild(page);

    statStrip(page, [
      {
        label: "قرارات مطلوبة",
        value: noun(all.length, "decision"),
        foot: "مشتقة من لوحات رؤى معتمدة حصراً",
      },
      {
        label: "الأقسام المصدر",
        value: noun(groups.length, "section"),
        foot: groups.map((g) => g.title).join(" · "),
      },
      {
        label: "تنبيه",
        value: fmt.int(counts.warn),
        foot: model.CLS_NOTES.warn,
        tone: counts.warn ? "warn" : null,
      },
      {
        label: "خلل",
        value: fmt.int(counts.neg),
        foot: model.CLS_NOTES.neg,
        tone: counts.neg ? "neg" : null,
      },
      {
        label: "خطوات معتمدة",
        value: ns.approved ? noun(ns.count, "step") : "لا شيء بعد",
        foot: ns.statusLabel,
        tone: ns.approved ? "pos" : "warn",
      },
    ]);

    if (!all.length) {
      emptyState(page,
        "لا قرار مطلوب في هذا الإصدار",
        "لا لوحة رؤى معتمدة تحمل لغة توصية — ولا يُشتق قرار من نص تقريري.");
      nextStepsCard(page, ns);
      return;
    }

    /* ── تبويبات التصنيف ── */
    const tabsHost = h("div", { class: "dcs-tabsrow" });
    page.appendChild(tabsHost);
    tabBar(tabsHost, {
      ariaLabel: "ترشيح القرارات بالتصنيف",
      value: cls,
      items: [{
        key: "all", label: "الكل", count: all.length,
        hint: "كل القرارات المشتقة",
        aria: "كل القرارات: " + noun(all.length, "decision"),
      }].concat(model.CLS_KEYS.map((k) => ({
        key: k,
        label: model.CLS_LABELS[k],
        count: counts[k],
        cls: k,
        hint: model.CLS_NOTES[k],
        aria: model.CLS_LABELS[k] + ": " + noun(counts[k], "decision"),
      }))),
      onPick: (k) => {
        if (k === cls) return;
        pendingFocus = null;
        ctx.update({ c: k === "all" ? null : k, d: null });
      },
    });

    const shown = model.filterByCls(all, cls);

    /* ── جسم الصفحة: الجدول + التفصيل ── */
    const body = h("div", { class: "dcs-body" });
    page.appendChild(body);

    const listHost = h("div", { class: "dcs-list-host" });
    const sideHost = h("aside", {
      class: "dcs-side", "aria-label": "تفصيل القرار المختار",
    });
    body.appendChild(listHost);
    body.appendChild(sideHost);

    if (!shown.length) {
      emptyState(listHost, "لا قرار بهذا التصنيف",
        "أعد الترشيح إلى «الكل» — ولا يُعرض قرار بديل مختلق.");
    } else {
      const thead = h("thead", {}, h("tr", {},
        h("th", { scope: "col" }, "التصنيف"),
        h("th", { scope: "col" }, "القرار المطلوب"),
        h("th", { scope: "col" }, "أثره"),
        h("th", { scope: "col" }, "مصدره"),
      ));
      const tbody = h("tbody", {});
      const trs = [];
      shown.forEach((d, i) => {
        const on = d.id === selected;
        const tr = h("tr", {
          class: "dcs-tr " + d.cls + (on ? " now" : ""),
          role: "button",
          tabindex: on || (!selected && i === 0) ? "0" : "-1",
          "data-interactive": "",
          "aria-label": model.describe(d),
        },
          h("td", {}, badge(d.clsLabel, d.cls)),
          h("td", { class: "dcs-td-dec" }, d.decision),
          h("td", { class: "dcs-td-imp" }, d.impact || "—"),
          h("td", { class: "dcs-td-src" },
            h("span", {}, d.sourceTitle),
            h("span", { class: "dcs-td-sec" }, d.sectionTitle)),
        );
        if (on) tr.setAttribute("aria-current", "true");
        const activate = () => {
          pendingFocus = "row:" + d.id;
          ctx.update({ d: on ? null : d.id });
        };
        tr.addEventListener("click", activate);
        tr.addEventListener("keydown", (ev) => {
          const k = ev.key;
          if (k === "Enter" || k === " " || k === "Spacebar") {
            ev.preventDefault();
            ev.stopPropagation();
            activate();
            return;
          }
          if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
            ev.preventDefault();
            ev.stopPropagation();
            let j = i;
            if (k === "ArrowDown") j = i + 1;
            else if (k === "ArrowUp") j = i - 1;
            else if (k === "Home") j = 0;
            else j = trs.length - 1;
            const t = Math.max(0, Math.min(trs.length - 1, j));
            trs.forEach((x) => x.setAttribute("tabindex", "-1"));
            trs[t].setAttribute("tabindex", "0");
            trs[t].focus();
          }
        });
        tbody.appendChild(tr);
        trs.push(tr);
      });

      listHost.appendChild(h("div", { class: "dcs-tscroll" },
        h("table", {
          class: "table-dense dcs-table",
          "aria-label": "سجل القرارات المطلوبة",
        },
          h("caption", { class: "sr-only" },
            "سجل القرارات المطلوبة مشتقاً من لوحات الرؤى المعتمدة"),
          thead, tbody)));

      listHost.appendChild(h("p", { class: "dcs-tnote" },
        "المعروض " + noun(shown.length, "decision") + " من "
        + fmt.int(all.length) + " — كل خلية أعلاه نص من بطاقة رؤية معتمدة، "
        + "لا صياغة جديدة."));

      /* استعادة التركيز بعد إعادة البناء الناتجة عن اختيار صف */
      const want = pendingFocus;
      pendingFocus = null;
      if (want && want.indexOf("row:") === 0) {
        const id = want.slice(4);
        const i = shown.findIndex((d) => d.id === id);
        if (i >= 0 && trs[i]) trs[i].focus();
      }
    }

    /* ── لوحة التفصيل ── */
    const sel = selected ? model.decisionById(all, selected) : null;
    if (sel) {
      decisionCard(sideHost, sel, ctx, { cls: "wide" });
      const close = h("div", { class: "dcs-card-actions" },
        button("dcs-linkbtn ghost", "إغلاق التفصيل", () => {
          pendingFocus = null;
          ctx.update({ d: null });
        }, { aria: "إغلاق تفصيل القرار" }));
      sideHost.appendChild(close);
    } else {
      const card = RH.presenter.layout.card(sideHost, {
        title: "اختر قراراً من السجل",
        sub: "لعرض منطوقه وأثره ومصدره كاملاً",
        cls: "dcs-hintcard",
      });
      const ul = h("ul", { class: "dcs-hint" });
      for (const line of [
        "كل قرار في هذا السجل مقتطع حرفياً من بطاقة رؤية معتمدة.",
        "«قرار مطلوب» جملة التوصية، و«أثره» الجزء التقريري من البطاقة نفسها.",
        "البطاقات التقريرية بلا توصية مستبعدة — وأسماؤها في صفحة الحدود.",
        "الأسهم أعلى/أسفل تتنقل بين الصفوف، وEnter يفتح التفصيل.",
      ]) ul.appendChild(h("li", {}, line));
      card.body.appendChild(ul);
    }

    /* ── الخطوات القادمة أسفل السجل (عقد §8.2) ── */
    const stepsHost = h("div", { class: "dcs-steps-host" });
    page.appendChild(stepsHost);
    nextStepsCard(stepsHost, ns, {
      extra: "القرارات أعلاه ليست خطوات معتمدة: هي منطوق توصيات موجزٍ معتمد. "
        + "تحويلها إلى خطة تنفيذ يمر بالإدارة ويُنشر في كتلة الخطوات القادمة.",
    });

    /* ── مسار الصفحات ── */
    const nav = h("div", { class: "dcs-pagenav" },
      button("dcs-linkbtn", "مجمَّعة بالأقسام", () => goPage(ctx, 1), {
        aria: "عرض القرارات مجمَّعة بالأقسام",
        children: [h("span", {}, "مجمَّعة بالأقسام"),
          h("span", { class: "dcs-arrow", "aria-hidden": "true" }, "←")],
      }),
      button("dcs-linkbtn", "الحدود والصدق", () => goPage(ctx, 2), {
        aria: "عرض قاعدة الاشتقاق والبطاقات المستبعدة",
        children: [h("span", {}, "الحدود والصدق"),
          h("span", { class: "dcs-arrow", "aria-hidden": "true" }, "←")],
      }),
      RH.explore && RH.explore.methodology
        ? button("dcs-linkbtn ghost", "منهجية البيانات",
          () => goAppendix("methodology", ctx), {
            aria: "فتح ملحق منهجية البيانات ومصادرها",
            children: [h("span", {}, "منهجية البيانات"),
              h("span", { class: "dcs-arrow", "aria-hidden": "true" }, "←")],
          })
        : null,
    );
    page.appendChild(nav);
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ب) الصفحة 2 — مجمَّعة بالأقسام
     ──────────────────────────────────────────────────────────────────────
     بطاقة لكل قسم مصدر بقراراته كاملة: المنطوق والأثر والمصدر، مع كاشف
     يعرض نص بطاقة الرؤية الأصلي حرفياً — فيقارن القارئ الاقتطاع بالأصل
     بنفسه ولا يأخذه تسليماً.
     ══════════════════════════════════════════════════════════════════════ */
  function pageBySection(el, ctx) {
    const rel = RH.data.store.release();
    const all = model.decisionsModel(rel);
    const groups = model.groupBySection(all);
    const sum = model.summary(rel);

    const page = h("div", { class: "dcs-page dcs-p2" });
    el.appendChild(page);

    statStrip(page, [
      { label: "قرارات مطلوبة", value: noun(all.length, "decision") },
      {
        label: "أقسام مصدر",
        value: noun(groups.length, "section"),
        foot: "من أصل أربعة مفاتيح لوحات رؤى قانونية",
      },
      {
        label: "انقسم نصه بأمان",
        value: ratio(sum.split, all.length),
        foot: "قرار وأثر مقتطعان عند حدّ جملة",
      },
      {
        label: "عُرض كاملاً",
        value: fmt.int(sum.whole),
        foot: "جملة واحدة لا تنقسم — النص كله في خانة القرار",
        tone: sum.whole ? "warn" : null,
      },
    ]);

    if (!groups.length) {
      emptyState(page, "لا قرار مطلوب في هذا الإصدار", null);
      return;
    }

    const grid = h("div", { class: "dcs-groups" });
    page.appendChild(grid);

    for (const g of groups) {
      const card = RH.presenter.layout.card(grid, {
        title: g.title,
        sub: noun(g.items.length, "decision") + " من لوحات رؤى هذا القسم",
        cls: "dcs-group",
      });

      for (const d of g.items) {
        const holder = h("div", { class: "dcs-group-item" });
        card.body.appendChild(holder);

        const reveal = h("div", { class: "dcs-reveal", hidden: true },
          h("div", { class: "dcs-reveal-k" }, "نص بطاقة الرؤية كاملاً"),
          h("p", { class: "dcs-reveal-v" }, d.text),
          h("p", { class: "dcs-reveal-f" },
            "التصنيف " + d.clsLabel + " · الحالة " + d.statusLabel
            + " · علامة التوصية المرصودة: " + fmt.iso(d.marker)),
        );

        decisionCard(holder, d, ctx, {
          onFocus: () => {
            const on = reveal.hidden;
            reveal.hidden = !on;
            /* الزر مُنشأ داخل بطاقة القرار ويُلتقط بعد بنائها؛ الحارس يمنع
               انهيار التبديل لو تغيّر تركيب البطاقة مستقبلاً */
            if (!toggleBtn) return;
            toggleBtn.setAttribute("aria-expanded", String(on));
            dom.clear(toggleBtn);
            toggleBtn.appendChild(h("span", {},
              on ? "إخفاء نص البطاقة" : "عرض نص البطاقة كاملاً"));
          },
        });

        /* زر الكشف هو آخر زر أُضيف داخل بطاقة القرار (عقد decisionCard) */
        const actions = holder.querySelector
          ? holder.querySelector(".dcs-card-actions") : null;
        const toggleBtn = actions
          ? actions.querySelector(".dcs-linkbtn.ghost") : null;
        if (toggleBtn) {
          toggleBtn.setAttribute("aria-expanded", "false");
          toggleBtn.setAttribute("aria-controls", "dcs-reveal-" + d.id);
        }
        reveal.setAttribute("id", "dcs-reveal-" + d.id);
        holder.appendChild(reveal);
      }

      if (g.sectionId) {
        card.body.appendChild(h("div", { class: "dcs-card-actions" },
          button("dcs-linkbtn", "الانتقال إلى القسم", () => goSection(g.sectionId), {
            aria: "الانتقال إلى قسم " + g.title,
            children: [h("span", {}, "الانتقال إلى " + g.title),
              h("span", { class: "dcs-arrow", "aria-hidden": "true" }, "←")],
          })));
      }
    }

    noteLine(page,
      "الترتيب داخل كل قسم ترتيب بطاقات الرؤى في الإصدار نفسه — لا ترتيب "
      + "أولوية ولا وزن: أولوية القرارات قرار إداري لا تشتقّه هذه الشاشة.",
      "wide");
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-ج) الصفحة 3 — الحدود والصدق
     ──────────────────────────────────────────────────────────────────────
     قاعدة الاشتقاق معلنة بحروفها، والبطاقات المستبعدة بأسمائها وأسباب
     استبعادها، وحالة الخطوات القادمة كما وردت، وما لا يفعله هذا السجل.
     ══════════════════════════════════════════════════════════════════════ */
  function pageLimits(el, ctx) {
    const rel = RH.data.store.release();
    const all = model.decisionsModel(rel);
    const excluded = model.excludedPanels(rel);
    const ns = model.nextStepsModel(rel);
    const check = model.verbatimCheck(all);

    const page = h("div", { class: "dcs-page dcs-p3" });
    el.appendChild(page);

    statStrip(page, [
      {
        label: "بطاقات الرؤى المقروءة",
        value: noun(all.length + excluded.length, "card"),
        foot: "كل بطاقة في الإصدار مرت على قاعدة الاشتقاق",
      },
      {
        label: "دخلت السجل",
        value: fmt.int(all.length),
        foot: "معتمدة وتحمل لغة توصية",
        tone: "pos",
      },
      {
        label: "استُبعدت",
        value: fmt.int(excluded.length),
        foot: "تقريرية أو غير معتمدة — وأسماؤها أدناه",
      },
      {
        label: "فحص الاقتطاع الحرفي",
        value: check.ok ? "مطابق" : "انحراف",
        foot: check.ok
          ? "كل قرار وأثر سلسلة فرعية من نص بطاقته"
          : "معرفات منحرفة: " + check.offenders.join("، "),
        tone: check.ok ? "pos" : "neg",
      },
    ]);

    const grid = h("div", { class: "dcs-limits" });
    page.appendChild(grid);
    const colA = h("div", { class: "dcs-col" });
    const colB = h("div", { class: "dcs-col" });
    grid.appendChild(colA);
    grid.appendChild(colB);

    /* ── قاعدة الاشتقاق ── */
    const ruleCard = RH.presenter.layout.card(colA, {
      title: "قاعدة اشتقاق السجل",
      sub: "معلنة بحروفها كي يعيد المدقق تطبيقها بنفسه",
      cls: "dcs-card-rule",
    });
    const ol = h("ol", { class: "dcs-rules" });
    for (const line of [
      "المصدر الوحيد: بطاقات لوحات الرؤى في الإصدار المنشور، وحالتها "
      + "«موجز معتمد» حصراً — ما دونها لا يدخل السجل.",
      "البطاقة تدخل إن حملت لغة توصية صريحة؛ والعلامات المرصودة: "
      + model.MARKERS.map((m) => "«" + m + "»").join("، ") + ".",
      "القطع يقع عند أقرب حدّ جملة قبل علامة التوصية، فما بعده «قرار "
      + "مطلوب» وما قبله «أثره» — وكلاهما سلسلة فرعية حرفية من نص البطاقة.",
      "جملة واحدة لا تنقسم بأمان تُعرض كاملة في خانة القرار، ويُعلن أن "
      + "الأثر لم يُصَغ — ولا يُنشأ له نص.",
      "التصنيف من البطاقة (المفردات المقفلة أربع)، والمصدر عنوانها ومفتاح "
      + "قسمها — لا حكم جديد على أهمية أو أولوية.",
    ]) ol.appendChild(h("li", { class: "dcs-rule" }, line));
    ruleCard.body.appendChild(ol);

    /* ── ما لا يفعله هذا السجل ── */
    const limitCard = RH.presenter.layout.card(colA, {
      title: "ما لا يفعله هذا السجل",
      sub: "حدوده جزء من صدقه",
      cls: "dcs-card-limit",
    });
    const ul = h("ul", { class: "dcs-limitlist" });
    for (const line of [
      "لا يرتّب القرارات بالأولوية ولا يزنها — الترتيب ترتيب البطاقات في الإصدار.",
      "لا يسنِد مالكاً ولا تاريخاً ولا كلفة: هذه الحقول غير واردة في المصدر المعتمد.",
      "لا يحوّل قراراً إلى خطة تنفيذ — كتلة الخطوات القادمة وحدها تفعل ذلك بعد اعتمادها.",
      "لا يضيف قراراً من خارج لوحات الرؤى ولو بدا بديهياً.",
      "لا يعيد صياغة جملة توصية لتبدو أمراً تنفيذياً.",
    ]) ul.appendChild(h("li", {}, line));
    limitCard.body.appendChild(ul);

    /* ── الخطوات القادمة ── */
    const stepsHost = h("div", { class: "dcs-steps-host" });
    colA.appendChild(stepsHost);
    nextStepsCard(stepsHost, ns, { extra: liveGateDetail() });

    /* ── البطاقات المستبعدة ── */
    const exCard = RH.presenter.layout.card(colB, {
      title: "البطاقات المستبعدة",
      sub: "معروضة بالاسم كي لا يُظن أن شيئاً حُجب",
      cls: "dcs-card-ex",
    });
    if (!excluded.length) {
      emptyState(exCard.body, "لا بطاقة مستبعدة — كل البطاقات دخلت السجل", null);
    } else {
      const thead = h("thead", {}, h("tr", {},
        h("th", { scope: "col" }, "البطاقة"),
        h("th", { scope: "col" }, "القسم"),
        h("th", { scope: "col" }, "سبب الاستبعاد"),
      ));
      const tbody = h("tbody", {});
      for (const e of excluded) {
        tbody.appendChild(h("tr", { class: "dcs-tr " + e.cls },
          h("td", { class: "dcs-td-src" },
            h("span", {}, e.title),
            h("span", { class: "dcs-td-sec" }, fmt.iso(e.id))),
          h("td", {}, e.sectionTitle),
          h("td", { class: "dcs-td-why" }, e.reason),
        ));
      }
      exCard.body.appendChild(h("div", { class: "dcs-tscroll" },
        h("table", {
          class: "table-dense dcs-table",
          "aria-label": "بطاقات الرؤى المستبعدة من سجل القرارات",
        }, thead, tbody)));
      exCard.body.appendChild(h("p", { class: "dcs-tnote" },
        noun(excluded.length, "card") + " تقريرية أو غير معتمدة — نصوصها "
        + "معروضة في عمود الرؤى داخل أقسامها، ولم تُحذف من العرض."));
    }

    noteLine(page,
      "هذه الصفحة تصف الأداة لا البيانات: قاعدة الاشتقاق ثابتة في الكود "
      + "وقابلة لإعادة التطبيق يدوياً على نصوص البطاقات نفسها.",
      "wide");

    const nav = h("div", { class: "dcs-pagenav" },
      button("dcs-linkbtn", "العودة إلى السجل", () => goPage(ctx, 0), {
        aria: "العودة إلى صفحة سجل القرارات",
        children: [h("span", {}, "العودة إلى السجل"),
          h("span", { class: "dcs-arrow", "aria-hidden": "true" }, "←")],
      }),
      RH.explore && RH.explore.methodology
        ? button("dcs-linkbtn ghost", "قرارات المطابقة R1–R12",
          () => goAppendix("methodology", ctx), {
            aria: "فتح ملحق المنهجية عند جدول قرارات المطابقة",
            children: [h("span", {}, "قرارات المطابقة"),
              h("span", { class: "dcs-arrow", "aria-hidden": "true" }, "←")],
          })
        : null,
    );
    page.appendChild(nav);
  }

  /**
   * نص البوابة الحية الخاصة بالخطوات القادمة — يُقرأ من محرك التحقق لا
   * يُكتب هنا: إن غابت الوحدة أو البوابة، لا يُعرض نص بديل.
   */
  function liveGateDetail() {
    const V = RH.data && RH.data.validate;
    if (!V || typeof V.validateRelease !== "function") return "";
    let res = null;
    try {
      res = V.validateRelease(RH.data.store.release());
    } catch (_e) {
      return "";
    }
    const gate = (res.gates || []).find((g) => g.id === "next_steps.pending");
    if (!gate) return "";
    return gate.detail ? String(gate.detail) : "";
  }

  /* ══════════════════════════════════════════════════════════════════════
     2-د) التسجيل — يرث من ax-shell هيكل الصفحات والعودة السياقية ومفاتيح
        التقليب. مشروط بحضور الهيكل كي يُحمَّل الملف في بيئة اختبار الوحدة
        بنموذجه النقي وحده (عقد §0).
     ══════════════════════════════════════════════════════════════════════ */
  if (RH.presenter && RH.presenter.ax
      && typeof RH.presenter.ax.register === "function") {
    RH.presenter.ax.register({
      id: "decisions",
      kicker: "ملحق الإسناد",
      title: "سجل القرارات المطلوبة",
      returnLabel: (ret) => {
        const title = ret && ret.id ? SECTION_TITLES[ret.id] : null;
        return title ? "العودة إلى " + title : "العودة إلى العرض";
      },
      pages: () => [
        { name: "السجل", build: pageRegister },
        { name: "مجمَّعة بالأقسام", build: pageBySection },
        { name: "الحدود والصدق", build: pageLimits },
      ],
    });
  }
})();

