/* ════════════════════════════════════════════════════════════════════════════
   s07-kpis.js — القسم 7: «مؤشرات الأداء» — لوحة قياس أثر خطة العمل
   ────────────────────────────────────────────────────────────────────────────
   لوحة قيادة كثيفة (عقد V2_CONTRACTS §1 — order:7, id:"kpis",
   backdrop:"kpis" → الاسم المستعار kpis_closing في عقد الوسائط §6):

     ▸ شريط خمسة مؤشرات تعريفية أعلى الشاشة — كل رقم قابل للنقر يفتح بطاقة
       تفاصيل كاملة (التعريف والمصدر والقوائم — كل شيء من الإصدار حرفياً):
         1. المؤشرات الاستراتيجية   14 مؤشراً   (وسم المصدر «خطة عمل V.1.0.0»)
         2. بصيغة نسبة مئوية        11 مؤشراً   (مستهدفاتها بين 30٪ و100٪)
         3. بصيغة قيمة عددية        3 مؤشرات    (مستهدفاتها من قائمة المصدر)
         4. مستهدفها التغطية الكاملة 7 مؤشرات   (مستهدف 100٪ — ذهبي: دلالة
                                                المستهدف حصراً؛ عدّ محسوب)
         5. القيم الحالية           —           (وسم «تُسجَّل من المنصة» الصادق)

     ▸ البطاقة الرئيسة (8 من 12 عموداً × الصفين): المؤشرات الأربعة عشر كاملة
       بشبكة بطاقات bullet أنيقة — كل بطاقة: المعرف، الاسم، رقاقة الصيغة،
       مسار bullet (شاخص خط الأساس الذهبي المجوف ← منطقة التحسن الذهبية
       الشفافة ← شاخص المستهدف الذهبي عند 100٪) والوسم الصادق «الحالية:
       غير متوفرة» — لا امتلاء بياني مختلق. أدوات الترويسة ثلاث مجموعات:
         ترشيح بالصيغة  الكل/النسبية/العددية بأعدادها المحسوبة من النموذج
         ترتيب عرضي     المعرف (ترتيب المصدر) / «الأقرب انطلاقاً» (موضع خط
                        الأساس على المسار المُعاير — نسبة موحدة قابلة
                        للمقارنة عبر الصيغتين) / تجميع بالصيغة
         مبدل العرض     «البطاقات» ↔ «الشريط القياسي» (مُنشئ kpiBullets
                        القانوني من charts2) + زر الملحق الكامل
       نقر أي بطاقة يفتح ملف المؤشر الكامل، وشريط تصفح «السابق/التالي»
       داخل الملف يتنقل بين الملفات الأربعة عشر دون تكديس طبقات — والتركيز
       يعود عند الإغلاق النهائي إلى البطاقة الفاتحة الأصلية مهما طال التصفح.

     ▸ ملف المؤشر يعرض: مسار bullet كبيراً بالقيم الحقيقية على شاخصيه،
       قائمة تعريف (خط الأساس/المستهدف/مدى التحسن/موضع الانطلاق/الحالية)،
       سطر سياق محسوباً، ملاحظة القيمة الحالية والمصدر حرفيين، وزر الملحق.
       بطاقة «التعريف والمصدر» تضم جرد «أعمدة المصدر»: تعبئة كل عمود من
       أعمدة strategy.kpis عدّاً من الصفوف ذاتها (14/14 لأعمدة التعريف،
       0/14 للقيم الحالية — الغياب يظهر رقماً لا ادعاءً). بطاقة الصدق
       الكاملة تضم «مرآة البوابات الحية»: البوابات الأربع الموثقة (§9)
       تُعاد حساباتها من بيانات الإصدار لحظة العرض.

     ▸ خطوات البناء (عقد §1 — steps:2): الكليكر يكشف اللوحة طبقة طبقة:
       0 = الشريط والبطاقة الرئيسة · 1 = + المصفوفة · 2 = + عمود الصدق
       والرؤى — الطبقات المحجوبة مبنية كاملة (كشفها opacity لا إعادة بناء).

     ▸ العمود الجانبي (4 من 12):
         صف 1: مصفوفة المؤشرات (kpiMatrix القانوني — جدول كثيف بفرز تفاعلي)
         صف 2: بطاقة الصدق «القيم الحالية تُسجَّل من المنصة» (بنص ملاحظة
               الإصدار حرفياً) + مزيج الصيغ (شريط مكدس 11/3) + بطاقة المصدر
               بنصه الحرفي + عمود رؤى insight_panels.sections.initiatives
               (المفتاح القانوني الأقرب — موسوم بمرجعه بصدق) + سطر الحداثة
               وبوابات التحقق.

     ▸ وصول عميق عبر معاملات المسار (عقد ctx.params — تُقرأ ولا تُكتب يدوياً):
         ‎#/section/kpis?kpi=13‎      يفتح ملف المؤشر 13 مباشرة
         ‎#/section/kpis?view=bars‎   يبدأ بعرض الشريط القياسي
         ‎#/section/kpis?mix=pct‎     يبدأ مرشحاً على المؤشرات النسبية
         ‎#/section/kpis?sort=base‎   يبدأ مرتباً بالأقرب انطلاقاً
       معامل غير صالح يُتجاهل بصمت — لا شاشات خطأ في مسرح العرض.

     ▸ دورة تركيز مفاتيحية مكتملة: إغلاق أي بطاقة تفاصيل (بأي بوابة من
       بواباتها الثلاث Escape/زر الإغلاق/نقر الخلفية) يعيد التركيز إلى
       العنصر الذي فتحها — مراقب طفرات على جذر القسم يُفصل عند الهدم.

   قواعد ملزمة مطبقة حرفياً:
   • لا قيمة مختلقة: كل معطى من release.json (strategy.kpis/meta/validation/
     insight_panels) عبر ctx.release حصراً؛ المشتقات الوحيدة حسابات شفافة
     من قيم المصدر ذاتها (أعداد الصيغ، مدى التحسن = المستهدف − خط الأساس،
     موضع خط الأساس على مسار مُعاير بالمستهدف) بمرآة تقريب بايثون الرسمية
     (RH.data.derive.roundHalfUp/pct). القيم الحالية غائبة في المصدر
     (current=null) فتُعرض «غير متوفرة» صراحة في كل موضع — لا تعويض،
     لا أصفار كاذبة، لا امتلاء مسار مختلق.
   • كل رقم ظاهر عبر RH.core.fmt (تطابق العدد والمعدود عبر noun/countNoun،
     عزل اتجاهي عبر fmt.iso/fmt.pct، تواريخ عربية عبر fmt.date).
   • كل نص إصدار يُبنى بعقد dom.h النصي (textContent) — لا innerHTML لمحتوى
     الإصدار إطلاقاً؛ تلميحات الرسوم داخل مكتبة charts2 ذاتها (theme.esc).
   • منظومة المعنى: الذهبي = المستهدف/خط الأساس ووسوم «بانتظار التسجيل»
     المقننة حصراً؛ الأزرق = فئة تصنيفية ثانوية (شريحة «نسبة مئوية» في مزيج
     الصيغ)؛ لا أخضر إنجاز هنا (لا قيم حالية فلا إنجاز يُدّعى)؛ لا مرجاني
     (لا عجز ولا خلل في هذه اللوحة)؛ لا gauges دائرية، لا KPI بأيقونات،
     لا محاور مزدوجة.
   • الرسوم عبر مُنشئي RH.viz.charts2 القانونيين حصراً بمفتاح مثيلات "kpis"
     كي لا تصطدم بمثيلات الملخص التنفيذي أو قسم المبادرات.
   • prefers-reduced-motion محترم: العد التصاعدي عبر RH.viz.motion (يتحول
     قيمة نهائية فورية)، وانتقالات CSS تُصفَّر في kpis.css.
   • كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح (أزرار حقيقية أو role=button
     بمعالجة Enter/مسافة) وموسوم data-interactive كي لا يبتلع جهاز التقديم
     ضغطاته (عقد §8)؛ أسهم لوحة المفاتيح تتنقل بين بطاقات الشبكة.
   • التنظيف عبر ctx.onTeardown: فصل مراقب الطفرات — مستمعو عناصر القسم
     تسقط مع هدم DOM ذاته، ومثيلات ECharts يديرها سجل الثيم المركزي.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h } = RH.core.dom;
  const fmt = RH.core.fmt;

  /* مرآة التقريب المركزية (نصف لأعلى، منزلة واحدة) — نفس مرآة بايثون التي
     تعتمدها بوابات التحقق ومكتبة الرسوم القانونية سواء */
  const round1 = (v) => RH.data.derive.roundHalfUp(v, 1);
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /* ──────────────────────────────────────────────────────────────────────────
     ثوابت عرض (لا قيم بيانات): صيغ عدد ومعدود محلية لما لا تغطيه NOUNS
     المركزية، وتسميات الصيغتين المقفلة (مرآة تسميات kpiMatrix القانونية).
     ────────────────────────────────────────────────────────────────────────── */

  /** صيغ العدد والمعدود للنقطة المئوية — لصياغة مدى التحسن المشتق */
  const POINT_FORMS = {
    one: "نقطة مئوية واحدة", two: "نقطتان مئويتان", few: "نقاط مئوية",
    many: "نقطة مئوية", hundred: "نقطة مئوية",
  };
  const pointNoun = (n) => fmt.countNoun(n, POINT_FORMS);

  /** تسمية صيغة المؤشر — مفردات مقفلة تطابق kpiMatrix وtooltip القانونيين */
  const fmtLabel = (k) => (k.pct ? "نسبة مئوية" : "قيمة عددية");
  const fmtChip = (k) => (k.pct ? "نسبة" : "عدد");

  /** تفكيك «عدد + معدود» من countNoun — يضمن تطابق الوحدة اللاحقة مع العدد
      في كل موضع يعرض الرقم والمعدود منفصلين (شريط المؤشرات وبطاقات الإحصاء) */
  function nounParts(n, key) {
    const parts = fmt.noun(n, key).split(fmt.NBSP);
    return {
      num: parts.length > 1 ? parts[0] : fmt.int(n),
      word: parts.length > 1 ? parts.slice(1).join(fmt.NBSP) : "",
    };
  }

  /* ──────────────────────────────────────────────────────────────────────────
     حارس اتساق تطويري — مرآة مخففة لبوابات validate.js (strategy.kpis14 /
     kpi.pct_bounds / kpi.target_gt_baseline / kpi.current_values): فشل فحص
     لا يُسقط اللوحة (الإصدار المنشور اجتاز البوابات أصلاً) بل ينبه في وحدة
     التحكم لالتقاط أي انجراف بيانات مبكراً.
     ────────────────────────────────────────────────────────────────────────── */
  function guard(where, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("s07-kpis/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) نموذج المؤشرات — القراءة الموحدة الوحيدة لطبقة strategy.kpis
        يُبنى مرة واحدة عند بناء القسم ويُمرر لكل ما يحتاجه. كل حقل فيه
        منقول أو محسوب حسابياً شفافاً من الإصدار — لا اختلاق.
     ══════════════════════════════════════════════════════════════════════════ */
  function kpiModel(rel) {
    const st = rel.strategy;
    const kpis = (st.kpis || []).slice().sort((a, b) => a.id - b.id);

    /* تقسيم الصيغ: نسبية (baseline/target ∈ [0,1] بالبوابة) وعددية */
    const pctList = kpis.filter((k) => k.pct);
    const absList = kpis.filter((k) => !k.pct);

    /* القيم الحالية المتوفرة — تبقى صفراً بصدق ما دامت current=null كلها */
    const availableCurrent = kpis.filter((k) => k.current != null).length;

    /* أوسع مدى تحسن مطلوب بين المؤشرات النسبية (مقارنة متجانسة الصيغة):
       مشتق شفاف = المستهدف − خط الأساس، بالنقاط المئوية (×100) */
    let widest = null;
    for (const k of pctList) {
      if (!widest || (k.target - k.baseline) > (widest.target - widest.baseline)) {
        widest = k;
      }
    }
    const widestPoints = widest ? round1((widest.target - widest.baseline) * 100) : null;

    /* حدود مستهدفات المؤشرات النسبية (بالنقاط المئوية) — للسطر التعريفي */
    let minPctTarget = null, maxPctTarget = null;
    for (const k of pctList) {
      if (minPctTarget == null || k.target < minPctTarget) minPctTarget = k.target;
      if (maxPctTarget == null || k.target > maxPctTarget) maxPctTarget = k.target;
    }

    /* أنواع المؤشرات كما وردت (كلها «استراتيجي» في الإصدار المنشور) */
    const types = [];
    for (const k of kpis) {
      if (types.indexOf(k.type) < 0) types.push(k.type);
    }

    /* مجموعتا خط الأساس — مشتق شفاف من قيم المصدر:
       «تبدأ من الصفر» (baseline=0) مقابل «لها خط أساس قائم» (baseline>0) */
    const zeroBase = kpis.filter((k) => k.baseline === 0);
    const liveBase = kpis.filter((k) => k.baseline > 0);

    /* من المؤشرات النسبية: كم مستهدفه التغطية الكاملة (target=1 أي 100٪) */
    const fullTargets = kpis.filter((k) => k.pct && k.target === 1);

    /* «الأقرب انطلاقاً»: أعلى موضع لخط الأساس على مسار مُعاير بالمستهدف —
       ترتيب مقارن مشروع لأن المقياس نسبة معايرة موحدة لكل الصفوف */
    let nearest = null;
    for (const k of kpis) {
      const pos = k.target > 0 ? k.baseline / k.target : 0;
      if (!nearest || pos > (nearest.target > 0 ? nearest.baseline / nearest.target : 0)) {
        nearest = k;
      }
    }

    /* ملاحظة القيم الحالية الموحدة — النص الحرفي من الإصدار */
    const note = kpis.length ? String(kpis[0].current_note || "") : "";

    /* المرآة المخففة لبوابات التحقق الحاجبة */
    const ids = kpis.map((k) => k.id).join(",");
    const wanted = kpis.map((_, i) => i + 1).join(",");
    guard("kpiModel", {
      "14 مؤشراً بالضبط (بوابة strategy.kpis14)": kpis.length === 14,
      "معرفات 1..14 بالضبط": ids === wanted,
      "كل مستهدف > خط أساسه (بوابة kpi.target_gt_baseline)":
        kpis.every((k) => k.target > k.baseline),
      "حدود النسب [0,1] (بوابة kpi.pct_bounds)":
        pctList.every((k) => k.baseline >= 0 && k.baseline <= 1
          && k.target >= 0 && k.target <= 1),
      "القيم الحالية غائبة بصدق (إنذار kpi.current_values)":
        availableCurrent === 0,
      "ملاحظة القيم الحالية موحدة عبر الصفوف":
        kpis.every((k) => String(k.current_note || "") === note),
      "11 نسبية + 3 عددية (تكوين الإصدار المنشور)":
        pctList.length === 11 && absList.length === 3,
      "مجموعتا خط الأساس تغطيان القائمة":
        zeroBase.length + liveBase.length === kpis.length,
    });

    return {
      st, kpis, pctList, absList, availableCurrent,
      widest, widestPoints, minPctTarget, maxPctTarget, types, note,
      zeroBase, liveBase, fullTargets, nearest,
      calc: rel.meta.calculation_date,
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) تنسيق قيم المؤشرات — المرآة الحرفية لدالة kpiVal في مكتبة الرسوم
        القانونية: النسبية ×100 بعلامة ٪ العربية المعزولة، والعددية بفاصل
        الآلاف — كل شيء عبر RH.core.fmt حصراً.
     ══════════════════════════════════════════════════════════════════════════ */
  function kpiVal(k, v) {
    if (v == null || !Number.isFinite(v)) return "—";
    return k.pct ? fmt.pct(round1(v * 100)) : fmt.int(v);
  }

  /** مدى التحسن المطلوب (المستهدف − خط الأساس) بصيغة المؤشر ذاتها —
      مرآة سطر «مدى التحسن المطلوب» في تلميح kpiBullets القانوني */
  function spanVal(k) {
    return k.pct
      ? fmt.pct(round1((k.target - k.baseline) * 100))
      : fmt.int(k.target - k.baseline);
  }

  /** موضع خط الأساس على مسار مُعاير بالمستهدف (المستهدف = 100٪) —
      البوابة تضمن target > baseline ≥ 0 فالمقام موجب حتماً */
  function basePos(k) {
    return k.target > 0 ? k.baseline / k.target : 0;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) أدوات تفاعل مشتركة
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

  /** استدعاء مُنشئ رسم قانوني باسمه مع حماية الضم المتوازي: مكتبات الرسوم
      تُبنى بالتوازي مع الأقسام، وغياب مُنشئ واحد (ضم ناقص) يجب ألا يُسقط
      اللوحة كلها — بطاقة صادقة مدمجة بدل الرسم + تنبيه في وحدة التحكم.
      عند اكتمال الضم القانوني هذا المسار لا يُسلك إطلاقاً. */
  function chart2(name, el, su, opts) {
    const mk = RH.viz.charts2 ? RH.viz.charts2[name] : null;
    if (typeof mk !== "function") {
      console.warn("s07-kpis: مُنشئ الرسم غير مضموم في هذا البناء — " + name);
      RH.presenter.layout.pendingCard(el, {
        label: "الرسم غير متوفر في هذا البناء",
        note: "المُنشئ " + name + " لم يُضم بعد — أعد البناء عبر build.py",
      });
      return null;
    }
    return mk(el, su, opts);
  }

  /** فاتح بطاقات التفاصيل الموحد بدورة تركيز مكتملة:
        - يفتح عبر ctx.openDetail (عقد السجل: Escape/زر الإغلاق/نقر الخلفية
          كلها تغلق، والتركيز يدخل الطبقة فلا تتقدم مفاتيح العرض أثناءها)
        - يسجل معامل ?kpi= عند فتح ملف مؤشر (وصول عميق قابل للمشاركة)
        - عند الإغلاق بأي بوابة: يعيد التركيز إلى العنصر الفاتح ويصفّر
          المعامل — عبر مراقب طفرات على جذر القسم يُفصل عند الهدم.  */
  function makeDetailOpener(bodyEl, ctx) {
    const root = bodyEl.closest(".dash") || bodyEl.parentNode;
    let pendingFocus = null;
    let kpiParamSet = false;

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        for (const node of m.removedNodes) {
          if (node.nodeType === 1 && node.classList
            && node.classList.contains("detail-overlay")) {
            /* تنقّل «السابق/التالي» في ملفات المؤشرات يستبدل طبقة بطبقة
               في اللحظة ذاتها — لا تصفير ولا استرداد تركيز ما دامت طبقة
               أخرى قائمة (الإغلاق الحقيقي وحده يعيد الحالة) */
            if (root && root.querySelector(".detail-overlay")) continue;
            if (kpiParamSet) {
              kpiParamSet = false;
              ctx.update({ kpi: null });
            }
            if (pendingFocus && document.contains(pendingFocus)) {
              try { pendingFocus.focus(); } catch (e) { /* عنصر زال — لا شيء */ }
            }
            pendingFocus = null;
          }
        }
      }
    });
    if (root) mo.observe(root, { childList: true });
    ctx.onTeardown(() => mo.disconnect());

    return function open(content, title, openerEl, kpiId) {
      pendingFocus = openerEl
        || (document.activeElement instanceof HTMLElement
          ? document.activeElement : null);
      if (kpiId != null) {
        kpiParamSet = true;
        ctx.update({ kpi: String(kpiId) });
      }
      return ctx.openDetail(content, { title });
    };
  }

  /** ملاح ملفات المؤشرات — تصفح «السابق/التالي» داخل طبقة التفاصيل ذاتها:
        - يستبدل الطبقة الحالية بطبقة المؤشر المجاور (لا تكديس طبقات)
        - يتذكر العنصر الفاتح الأصلي فيعود إليه التركيز عند الإغلاق النهائي
          مهما طال التصفح بين الملفات
        - المعرفات بترتيب المصدر القانوني (1..14) — لا ترتيب مخترعاً  */
  function makeProfileNav(ctx, model, rel, open) {
    let closeCurrent = null;
    let rememberedOpener = null;
    const api = {};

    /** فتح ملف مؤشر (openerEl يُمرر من البطاقة/الشريط، وnull عند التصفح) */
    api.open = function (k, openerEl) {
      if (openerEl) rememberedOpener = openerEl;
      if (closeCurrent) {
        const c = closeCurrent;
        closeCurrent = null;
        c(); // إزالة الطبقة السابقة قبل بناء الجديدة — الاستبدال الذري
      }
      closeCurrent = open(
        profileDetail(k, model, rel, ctx, api),
        "ملف المؤشر " + fmt.int(k.id),
        rememberedOpener,
        k.id);
    };

    /** الانتقال النسبي: dir = ‎-1 السابق / ‎+1 التالي (بترتيب المعرفات) */
    api.go = function (k, dir) {
      const i = model.kpis.indexOf(k);
      const next = i >= 0 ? model.kpis[i + dir] : null;
      if (next) api.open(next, null);
    };

    /** موقع المؤشر في القائمة — لسطر «7 من 14» في شريط التصفح */
    api.pos = function (k) {
      return model.kpis.indexOf(k);
    };

    return api;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) مسار bullet بعناصر DOM خالصة — لغة بصرية واحدة للبطاقات وملف المؤشر
        الهندسة مرآة renderBullet في kpiBullets القانوني:
          مسار حيادي كامل 0 → المستهدف (المستهدف = 100٪ لكل الصفوف)
          منطقة التحسن المطلوب (خط الأساس → المستهدف) بصبغة ذهبية شفافة
          شاخص خط الأساس: دائرة ذهبية مجوفة عند baseline/target
          شاخص المستهدف: عارضة ذهبية عند نهاية المسار (100٪)
          الوسم الصادق «غير متوفرة» فوق المسار — لا امتلاء بياني مختلق
        الاتجاه RTL: الصفر عند البداية السطرية (يمين) والمستهدف عند النهاية
        السطرية (يسار) — مرآة hValAxis المعكوس في الثيم.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildTrack(k, size) {
    const lg = size === "lg";
    const pos = basePos(k);                          // 0..1 — من الإصدار حسابياً
    const posPct = (pos * 100).toFixed(2) + "%";
    const gainPct = ((1 - pos) * 100).toFixed(2) + "%";

    const wrap = h("div", {
      class: "kpi7-track" + (lg ? " lg" : ""),
      "aria-hidden": "true",                          // البديل النصي في البطاقة/الملف
    });

    /* المسار الحيادي الكامل */
    const rail = h("div", { class: "kpi7-rail" });

    /* منطقة التحسن المطلوب — مثبتة على طرف المستهدف (النهاية السطرية) */
    const gain = h("div", { class: "kpi7-gain" });
    gain.style.width = gainPct;
    rail.appendChild(gain);
    wrap.appendChild(rail);

    /* شاخص خط الأساس الذهبي المجوف */
    const dot = h("div", { class: "kpi7-base-dot" });
    dot.style.insetInlineStart = posPct;
    wrap.appendChild(dot);

    /* شاخص المستهدف الذهبي عند 100٪ */
    wrap.appendChild(h("div", { class: "kpi7-target-tick" }));

    /* الوسم الصادق — current تبقى null بصدق. في البطاقات الصغيرة شارة «—»
       مدمجة بدل تكرار الجملة أربع عشرة مرة (إصلاح المراجعة: الرتابة القالبية)؛
       الجملة الكاملة في تلميح الشارة وفي لافتة أعلى البطاقة الرئيسة. */
    wrap.appendChild(h("div", {
      class: "kpi7-na" + (lg ? "" : " dot"),
      title: lg ? "" : "القيمة الحالية غير متوفرة — تُسجَّل من المنصة",
    }, lg ? "القيمة الحالية غير متوفرة — تُسجَّل من المنصة" : "—"));

    /* في الحجم الكبير: القيم الحقيقية على شاخصيها (ذهبي — دلالته الحصرية) */
    if (lg) {
      const bv = h("span", { class: "kpi7-track-bv" }, kpiVal(k, k.baseline));
      bv.style.insetInlineStart = posPct;
      wrap.appendChild(bv);
      wrap.appendChild(h("span", { class: "kpi7-track-tv" }, kpiVal(k, k.target)));
      wrap.appendChild(h("span", { class: "kpi7-track-zero" }, kpiVal(k, 0)));
    }
    return wrap;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) بناة محتوى بطاقات التفاصيل — كلها عقد Node مبني بـ dom.h النصي:
        نصوص الإصدار تدخل textContent حصراً فلا مسار HTML إطلاقاً.
     ══════════════════════════════════════════════════════════════════════════ */

  /** قائمة تعريف كثيفة: صفوف {k, v, cls?} — v نص أو عقدة */
  function defList(rows) {
    const dl = h("dl", { class: "kpi7-dl" });
    for (const r of rows) {
      dl.appendChild(h("div", { class: "kpi7-dl-row" + (r.cls ? " " + r.cls : "") },
        h("dt", {}, r.k),
        h("dd", {}, r.v),
      ));
    }
    return dl;
  }

  /** اقتباس مصدر حرفي — نص الإصدار كما هو (textContent) بوسم بصري هادئ */
  function sourceQuote(rel) {
    return h("blockquote", { class: "kpi7-quote" },
      h("p", { class: "kpi7-quote-main" }, String(rel.strategy.source)),
      rel.strategy.note
        ? h("p", { class: "kpi7-quote-note" }, String(rel.strategy.note))
        : null,
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     تدقيق أعمدة المصدر — «أي أعمدة يورّدها المصدر وكم صفاً يملأ كلاً منها؟»
     جرد صادق لطبقة strategy.kpis عموداً عموداً: التعبئة تُحسب عدّاً من
     الصفوف الأربعة عشر ذاتها (قيمة غير null/غير فارغة = معبأ) — فيظهر
     اكتمال أعمدة التعريف (14/14) وغياب عمود القيم الحالية (0/14) بالأرقام
     لا بالدعاوى. يُعرض داخل بطاقة «التعريف والمصدر».
     ────────────────────────────────────────────────────────────────────────── */

  /** تعريف أعمدة المصدر المقفل — label للعرض وpick يقرأ الخلية الخام */
  const SOURCE_COLUMNS = [
    { id: "id", label: "المعرف", pick: (k) => k.id },
    { id: "name", label: "اسم المؤشر", pick: (k) => k.name },
    { id: "type", label: "النوع", pick: (k) => k.type },
    { id: "pct", label: "علم الصيغة (نسبي/عددي)", pick: (k) => k.pct },
    { id: "baseline", label: "خط الأساس", pick: (k) => k.baseline },
    { id: "target", label: "المستهدف", pick: (k) => k.target },
    { id: "current", label: "القيمة الحالية", pick: (k) => k.current },
    { id: "current_note", label: "ملاحظة القيمة الحالية", pick: (k) => k.current_note },
  ];

  /** هل الخلية معبأة؟ — null/undefined/سلسلة فارغة = غائبة؛ الصفر والـfalse
      قيمتان مشروعتان (خط أساس 0 وعلم صيغة عددي) لا غيابان */
  function cellFilled(v) {
    if (v == null) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
  }

  /** حساب تعبئة عمود واحد عبر الصفوف الأربعة عشر */
  function columnFill(model, col) {
    let n = 0;
    for (const k of model.kpis) {
      if (cellFilled(col.pick(k))) n += 1;
    }
    return n;
  }

  /** لوحة تدقيق أعمدة المصدر: صف لكل عمود — شريط تعبئة + عدّ + وسم حالة.
      شريط التعبئة أزرق (فئة تصنيفية ثانوية)؛ العمود الغائب كلياً يحمل وسم
      «تُسجَّل من المنصة» الذهبي (وسم انتظار مقنن — لا قيمة بيانات). */
  function sourceColumnsPanel(model) {
    const total = model.kpis.length;
    const panel = h("div", { class: "kpi7-cols-audit" });

    /* مرآة الجرد: أعمدة التعريف مكتملة والقيم الحالية غائبة كلياً —
       أي انحراف هنا انجراف بيانات يستحق تنبيهاً مبكراً في وحدة التحكم */
    const fillOf = (id) => {
      const col = SOURCE_COLUMNS.find((c) => c.id === id);
      return col ? columnFill(model, col) : -1;
    };
    guard("sourceColumnsPanel", {
      "أعمدة التعريف الخمسة مكتملة (14/14)":
        ["id", "name", "type", "baseline", "target"]
          .every((id) => fillOf(id) === total),
      "عمود القيم الحالية غائب كلياً (0/14)": fillOf("current") === 0,
      "عمود ملاحظة القيمة الحالية مكتمل": fillOf("current_note") === total,
    });

    for (const col of SOURCE_COLUMNS) {
      const n = columnFill(model, col);
      const share = pctOf(n, total);
      const full = n === total;
      const empty = n === 0;

      const bar = h("span", { class: "kpi7-cols-bar", "aria-hidden": "true" },
        (() => {
          const f = h("i", { class: "kpi7-cols-fill" + (empty ? " empty" : "") });
          f.style.width = share + "%";
          return f;
        })(),
      );

      panel.appendChild(h("div", {
        class: "kpi7-cols-row" + (empty ? " empty" : ""),
      },
        h("span", { class: "kpi7-cols-label" }, col.label),
        bar,
        h("b", { class: "kpi7-cols-count" },
          fmt.iso(fmt.int(n) + "/" + fmt.int(total))),
        h("span", { class: "kpi7-cols-tag" + (empty ? " pending" : "") },
          full ? "مكتمل" : (empty ? "تُسجَّل من المنصة" : "جزئي")),
      ));
    }

    panel.appendChild(h("p", { class: "kpi7-cols-note" },
      "التعبئة محسوبة عدّاً من صفوف الإصدار ذاتها — الصفر وعلم الصيغة"
      + " قيمتان مشروعتان لا غيابان، والعمود الغائب كلياً يُعرض غائباً"
      + " بصدق لا يُعوَّض."));
    return panel;
  }

  /** جدول كثيف داخل بطاقة تفاصيل: cols نصوص، rows مصفوفات خلايا —
      حاوية قابلة للتمرير الداخلي كي لا تفيض البطاقة */
  function denseTable(cols, rows, caption) {
    const thead = h("thead", {}, h("tr", {},
      cols.map((c) => h("th", { scope: "col" }, c))));
    const tbody = h("tbody", {},
      rows.map((r) => h("tr", {}, r.map((cell, i) =>
        h(i === 0 ? "th" : "td", i === 0 ? { scope: "row" } : {}, cell)))));
    return h("div", { class: "table-scroll kpi7-detail-scroll" },
      h("table", { class: "table-dense" },
        caption ? h("caption", { class: "kpi7-tbl-caption" }, caption) : null,
        thead, tbody));
  }

  /** بطاقة «التعريف والمصدر» — تفتح من مؤشر الشريط الأول */
  function defDetail(model, rel) {
    const typeLine = model.types.length === 1
      ? "جميع المؤشرات من النوع «" + String(model.types[0]) + "» كما وردت في المصدر."
      : "أنواع المؤشرات كما وردت: " + model.types.map(String).join("، ") + ".";

    return h("div", { class: "kpi7-detail" },
      h("p", { class: "kpi7-detail-lead" },
        fmt.noun(model.kpis.length, "indicator")
        + " لقياس أثر خطة العمل، لكل منها خط أساس ومستهدف معتمدان من المصدر — "
        + typeLine),
      defList([
        { k: "عدد المؤشرات", v: fmt.noun(model.kpis.length, "indicator") },
        { k: "بصيغة نسبة مئوية", v: fmt.noun(model.pctList.length, "indicator") },
        { k: "بصيغة قيمة عددية", v: fmt.noun(model.absList.length, "indicator") },
        {
          k: "مستهدفات المؤشرات النسبية",
          v: "بين " + fmt.pct(round1(model.minPctTarget * 100))
            + " و" + fmt.pct(round1(model.maxPctTarget * 100)),
          cls: "gold",
        },
        {
          k: "يرافقها في خطة العمل",
          v: fmt.noun((rel.strategy.initiatives || []).length, "initiative")
            + " موزعة على " + fmt.noun((rel.strategy.pillars || []).length, "pillar")
            + " (منها ممكن واحد)",
        },
        {
          k: "مستهدفها التغطية الكاملة (" + fmt.pct(100) + ")",
          v: fmt.noun(model.fullTargets.length, "indicator")
            + " من النسبية",
          cls: "gold",
        },
        {
          k: "أوسع مدى تحسن مطلوب",
          v: model.widest
            ? fmt.pct(model.widestPoints) + " (أولها المؤشر "
              + fmt.int(model.widest.id) + ")"
            : "—",
          cls: "gold",
        },
        {
          k: "القيم الحالية",
          v: "غير متوفرة — المتوفر " + fmt.iso(fmt.int(model.availableCurrent)
            + "/" + fmt.int(model.kpis.length)),
          cls: "pending",
        },
      ]),
      h("h4", { class: "kpi7-detail-h" }, "أعمدة المصدر — جرد التعبئة"),
      sourceColumnsPanel(model),
      h("h4", { class: "kpi7-detail-h" }, "المصدر الحرفي"),
      sourceQuote(rel),
    );
  }

  /** بطاقة قائمة فرعية (النسبية/العددية) — جدول كثيف بكل صفوف الصيغة */
  function listDetail(model, list, lead) {
    return h("div", { class: "kpi7-detail" },
      h("p", { class: "kpi7-detail-lead" }, lead),
      denseTable(
        ["المؤشر", "#", "خط الأساس", "المستهدف", "مدى التحسن", "الحالية"],
        list.map((k) => [
          String(k.name),
          fmt.int(k.id),
          h("span", { class: "kpi7-gold-val" }, kpiVal(k, k.baseline)),
          h("span", { class: "kpi7-gold-val" }, kpiVal(k, k.target)),
          spanVal(k),
          h("span", { class: "kpi7-na-tag" }, "غير متوفرة"),
        ]),
        "خط الأساس والمستهدف من خطة العمل — القيم الحالية تُسجَّل من المنصة"),
      h("p", { class: "kpi7-detail-foot" }, String(model.note)),
    );
  }

  /** ملف المؤشر الكامل — يفتح من بطاقته أو من الشريط أو من معامل ?kpi=
      nav (اختياري): واجهة الملاح — يضيف شريط تصفح «السابق/التالي» بموقع
      المؤشر في القائمة، فيُتصفح الأربعة عشر ملفاً دون مغادرة الطبقة. */
  function profileDetail(k, model, rel, ctx, nav) {
    /* سطر سياق محسوب: موضع خط الأساس على المسار المُعاير — وللمؤشر الأقرب
       انطلاقاً وسم صريح (مشتق شفاف من قيم المصدر، لا حكم مخترع) */
    const pos01 = basePos(k);
    const contextLine = "ينطلق المؤشر من "
      + fmt.pct(round1(pos01 * 100)) + " من مساره المُعاير بالمستهدف"
      + (model.nearest && model.nearest.id === k.id
        ? " — الأقرب انطلاقاً بين المؤشرات كلها"
        : "") + ".";

    /* شريط التصفح — يظهر فقط حين يمر الفتح عبر الملاح */
    let navBar = null;
    if (nav) {
      const i = nav.pos(k);
      const prevBtn = h("button", {
        class: "kpi7-btn ghost nav",
        type: "button",
        "data-interactive": "",
        disabled: i <= 0,
        "aria-label": "الملف السابق (المؤشر الأدنى معرفاً)",
        onclick: () => nav.go(k, -1),
      },
        h("span", { class: "kpi7-btn-arrow", "aria-hidden": "true" }, "→"),
        h("span", {}, "السابق"),
      );
      const nextBtn = h("button", {
        class: "kpi7-btn ghost nav",
        type: "button",
        "data-interactive": "",
        disabled: i >= model.kpis.length - 1,
        "aria-label": "الملف التالي (المؤشر الأعلى معرفاً)",
        onclick: () => nav.go(k, 1),
      },
        h("span", {}, "التالي"),
        h("span", { class: "kpi7-btn-arrow", "aria-hidden": "true" }, "←"),
      );
      navBar = h("div", { class: "kpi7-profile-nav" },
        prevBtn,
        h("span", { class: "kpi7-profile-pos" },
          fmt.int(i + 1) + " من " + fmt.noun(model.kpis.length, "indicator")),
        nextBtn,
      );
    }

    return h("div", { class: "kpi7-detail kpi7-profile" },
      h("div", { class: "kpi7-profile-chips" },
        h("span", { class: "kpi7-chip id" }, "المؤشر " + fmt.int(k.id)),
        h("span", { class: "kpi7-chip" }, String(k.type)),
        h("span", { class: "kpi7-chip" }, fmtLabel(k)),
      ),
      h("h4", { class: "kpi7-profile-name" }, String(k.name)),
      buildTrack(k, "lg"),
      defList([
        { k: "خط الأساس", v: kpiVal(k, k.baseline), cls: "gold" },
        { k: "المستهدف", v: kpiVal(k, k.target), cls: "gold" },
        {
          k: "مدى التحسن المطلوب",
          v: k.pct
            ? spanVal(k) + " (" + pointNoun(round1((k.target - k.baseline) * 100)) + ")"
            : spanVal(k),
        },
        { k: "موضع الانطلاق على المسار", v: fmt.pct(round1(pos01 * 100)) },
        { k: "القيمة الحالية", v: "غير متوفرة", cls: "pending" },
      ]),
      h("p", { class: "kpi7-profile-ctx" }, contextLine),
      h("p", { class: "kpi7-profile-note" }, String(k.current_note)),
      h("p", { class: "kpi7-profile-src" }, "المصدر: " + String(rel.strategy.source)),
      h("div", { class: "kpi7-profile-actions" },
        h("button", {
          class: "kpi7-btn",
          type: "button",
          "data-interactive": "",
          "aria-label": "فتح ملحق المؤشرات الكامل",
          onclick: () => ctx.openAppendix("kpi"),
        }, "ملحق المؤشرات الكامل"),
      ),
      navBar,
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     مرآة بوابات المؤشرات الحية — البوابات الأربع الموثقة (V2_CONTRACTS §9)
     تُعاد حساباتها هنا من بيانات الإصدار ذاتها لحظة العرض: الحاجبات الثلاث
     يجب أن تظهر «مجتازة» دوماً (إصدار منشور اجتازها أصلاً — أي انحراف يعني
     انجراف بيانات)، وبوابة القيم الحالية «إنذار قائم» بصدق ما دامت current
     غائبة. لا حالة مكتوبة يدوياً — كل خلية «الحالة» ناتج فحص حي.
     ────────────────────────────────────────────────────────────────────────── */
  function gateMirrorRows(model) {
    const kpis = model.kpis;
    const ids = kpis.map((k) => k.id).join(",");
    const wanted = kpis.map((_, i) => i + 1).join(",");
    return [
      {
        id: "strategy.kpis14",
        label: "14 مؤشراً بمعرفات 1..14 بالضبط",
        level: "حاجبة",
        pass: kpis.length === 14 && ids === wanted,
      },
      {
        id: "kpi.pct_bounds",
        label: "خط الأساس والمستهدف ضمن [0,1] للمؤشرات النسبية",
        level: "حاجبة",
        pass: kpis.every((k) => !k.pct
          || (k.baseline >= 0 && k.baseline <= 1
            && k.target >= 0 && k.target <= 1)),
      },
      {
        id: "kpi.target_gt_baseline",
        label: "كل مستهدف أكبر من خط أساسه",
        level: "حاجبة",
        pass: kpis.every((k) => k.target > k.baseline),
      },
      {
        id: "kpi.current_values",
        label: "القيم الحالية غائبة — النشر تم بتنازل موقَّع (العقد القائم)",
        level: "إنذار",
        pass: null, // إنذار مقصود قائم — ليس نجاحاً ولا فشلاً
        standing: kpis.every((k) => k.current == null),
      },
    ];
  }

  /** جدول مرآة البوابات — يُعرض داخل بطاقة الصدق الكاملة */
  function gateMirrorTable(model) {
    const rows = gateMirrorRows(model);
    return denseTable(
      ["البوابة", "المعرف", "المستوى", "الحالة"],
      rows.map((g) => [
        g.label,
        h("span", { class: "kpi7-gate-id" }, fmt.iso(g.id)),
        g.level,
        g.pass === null
          ? h("span", { class: "kpi7-gate-tag warn" },
            g.standing ? "إنذار قائم" : "إنذار غير مطابق")
          : h("span", { class: "kpi7-gate-tag " + (g.pass ? "pass" : "fail") },
            g.pass ? "مجتازة" : "غير مجتازة"),
      ]),
      "مرآة حية لبوابات المؤشرات — تُعاد حساباتها من بيانات الإصدار لحظة العرض");
  }

  /** بطاقة الصدق الكاملة — تفتح من مؤشر الشريط الخامس وبطاقة العمود */
  function honestyDetail(model, rel) {
    const v = rel.validation || null;
    const rows = [
      {
        k: "المتوفر من القيم الحالية",
        v: fmt.iso(fmt.int(model.availableCurrent) + "/" + fmt.int(model.kpis.length))
          + " — لا قيمة حالية في هذا الإصدار",
        cls: "pending",
      },
      { k: "تاريخ الحساب المرجعي", v: fmt.date(model.calc) },
      { k: "البيانات حتى", v: String(rel.meta.data_as_of) },
    ];
    if (v && Number.isFinite(v.gates_passed) && Number.isFinite(v.gates_total)) {
      rows.push({
        k: "بوابات التحقق",
        v: "اجتاز الإصدار " + fmt.iso(fmt.int(v.gates_passed) + "/"
          + fmt.int(v.gates_total)) + " — " + fmt.date(v.checked_at),
      });
    }
    return h("div", { class: "kpi7-detail" },
      h("blockquote", { class: "kpi7-quote big" },
        h("p", { class: "kpi7-quote-main" }, String(model.note)),
      ),
      defList(rows),
      h("h4", { class: "kpi7-detail-h" }, "بوابات المؤشرات — المرآة الحية"),
      gateMirrorTable(model),
      h("p", { class: "kpi7-detail-foot" },
        "تُدخل القيم الحالية من واجهة الإدارة وتخضع لبوابات التحقق ذاتها قبل"
        + " أي نشر قادم — لا يُعرض في مسرح العرض رقم لم يمر من البوابات."),
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) شريط المؤشرات التعريفية — خمسة أرقام كبرى، كل واحد زر تفاصيل
        الأعداد كلها محسوبة من نموذج الإصدار (لا رقم مكتوب يدوياً)،
        والعد التصاعدي عند أول دخول فقط (عقد kpiStrip + RH.viz.motion).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildStrip(el, ctx, model, rel, open, profileNav) {
    /* تفكيك «عدد + معدود» عبر nounParts المشترك — تطابق الوحدة دائماً */
    const pAll = nounParts(model.kpis.length, "indicator");
    const pPct = nounParts(model.pctList.length, "indicator");
    const pAbs = nounParts(model.absList.length, "indicator");
    const pFull = nounParts(model.fullTargets.length, "indicator");

    /* أعداد صحيحة أثناء العد التصاعدي (لا كسور عابرة على الشاشة) */
    const intFmt = (v) => fmt.int(Math.round(v));

    /* مستهدفات المؤشرات العددية الثلاثة — قائمة محسوبة للسطر الهامشي */
    const absTargets = model.absList.map((k) => fmt.int(k.target)).join(" و");

    const items = [
      {
        label: "المؤشرات الاستراتيجية",
        value: pAll.num, unit: pAll.word,
        countTo: model.kpis.length, fmt: intFmt, key: "kpis:strip:all",
        note: "المصدر: خطة عمل المشروع",
      },
      {
        label: "بصيغة نسبة مئوية",
        value: pPct.num, unit: pPct.word,
        countTo: model.pctList.length, fmt: intFmt, key: "kpis:strip:pct",
        note: "المستهدفات بين "
          + fmt.pct(round1(model.minPctTarget * 100)) + " و"
          + fmt.pct(round1(model.maxPctTarget * 100)),
      },
      {
        label: "بصيغة قيمة عددية",
        value: pAbs.num, unit: pAbs.word,
        countTo: model.absList.length, fmt: intFmt, key: "kpis:strip:abs",
        note: "مستهدفاتها: " + absTargets,
      },
      {
        label: "مستهدفها التغطية الكاملة",
        value: pFull.num, unit: pFull.word,
        tone: "gold",
        countTo: model.fullTargets.length, fmt: intFmt, key: "kpis:strip:full",
        note: "مستهدف " + fmt.pct(100) + " من الصيغة النسبية",
      },
      {
        label: "القيم الحالية",
        value: "—",
        tone: "warn",
        delta: { text: "تُسجَّل من داخل المنصة", tone: "warn" },
        note: "المتوفر: " + fmt.iso(fmt.int(model.availableCurrent) + "/"
          + fmt.int(model.kpis.length)),
      },
    ];

    const strip = RH.presenter.layout.kpiStrip(el, items);

    /* الشريط قائمة أزرار تفاصيل — role=group يحل محل list لأن كل عنصر زر */
    strip.setAttribute("role", "group");
    strip.setAttribute("aria-label", "مؤشرات تعريفية — كل رقم يفتح بطاقة تفاصيله");
    strip.classList.add("kpi7-strip");

    /* فاتحات التفاصيل الخمس بترتيب العناصر */
    const openers = [
      (elh) => open(defDetail(model, rel), "المؤشرات الاستراتيجية — التعريف والمصدر", elh),
      (elh) => open(
        listDetail(model, model.pctList,
          fmt.noun(model.pctList.length, "indicator")
          + " بصيغة نسبة مئوية — خط الأساس والمستهدف كنسب معايرة [0,1] في المصدر"
          + " وتُعرض ×100 بعلامة ٪."),
        "المؤشرات بصيغة نسبة مئوية", elh),
      (elh) => open(
        listDetail(model, model.absList,
          fmt.noun(model.absList.length, "indicator")
          + " بصيغة قيمة عددية — لكل منها خط أساس ومستهدف مطلقان من المصدر."),
        "المؤشرات بصيغة قيمة عددية", elh),
      (elh) => open(
        listDetail(model, model.fullTargets,
          fmt.noun(model.fullTargets.length, "indicator")
          + " من الصيغة النسبية مستهدفها التغطية الكاملة " + fmt.pct(100)
          + " — وأوسع مدى تحسن مطلوب في القائمة "
          + fmt.pct(model.widestPoints) + "."),
        "مؤشرات المستهدف الكامل", elh),
      (elh) => open(honestyDetail(model, rel), "القيم الحالية — بيان الصدق", elh),
    ];

    const labels = [
      fmt.noun(model.kpis.length, "indicator") + " استراتيجياً من خطة العمل — عرض التعريف والمصدر",
      fmt.noun(model.pctList.length, "indicator") + " بصيغة نسبة مئوية — عرض القائمة",
      fmt.noun(model.absList.length, "indicator") + " بصيغة قيمة عددية — عرض القائمة",
      fmt.noun(model.fullTargets.length, "indicator")
        + " مستهدفها التغطية الكاملة " + fmt.pct(100) + " — عرض القائمة",
      "القيم الحالية غير متوفرة — تُسجَّل من داخل المنصة، عرض بيان الصدق",
    ];

    Array.prototype.forEach.call(strip.children, (child, i) => {
      if (!openers[i]) return;
      child.removeAttribute("role"); // كان listitem من المساعد — يصبح زراً
      activatable(child, () => openers[i](child), labels[i]);
    });

    return strip;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7) بطاقة bullet واحدة — لبنة شبكة «الأربعة عشر كاملة»
        كل بطاقة زر يفتح ملف المؤشر؛ القيم على أطرافها بالذهبي (مستهدف/خط
        أساس حصراً) والوسم الصادق فوق المسار. البديل النصي الكامل في
        aria-label — المسار ذاته aria-hidden.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildKpiCard(k, model, rel, ctx, profileNav) {
    const card = h("article", {
      class: "kpi7-card",
      dataset: { fmt: k.pct ? "pct" : "num", kpi: String(k.id) },
      title: "فتح ملف المؤشر " + fmt.int(k.id) + " — "
        + kpiVal(k, k.baseline) + " ← " + kpiVal(k, k.target),
    },
      h("div", { class: "kpi7-card-top" },
        h("span", { class: "kpi7-card-id", "aria-hidden": "true" }, fmt.int(k.id)),
        h("span", { class: "kpi7-card-name" }, String(k.name)),
        h("span", { class: "kpi7-fmt-chip", "aria-hidden": "true" }, fmtChip(k)),
      ),
      buildTrack(k, "sm"),
      h("div", { class: "kpi7-card-foot" },
        h("span", { class: "kpi7-foot-item" },
          h("span", { class: "kpi7-foot-label" }, "الأساس"),
          h("b", { class: "kpi7-foot-val gold" }, kpiVal(k, k.baseline)),
        ),
        h("span", { class: "kpi7-foot-item mid" },
          h("span", { class: "kpi7-foot-label" }, "المدى"),
          h("b", { class: "kpi7-foot-val" }, spanVal(k)),
        ),
        h("span", { class: "kpi7-foot-item" },
          h("span", { class: "kpi7-foot-label" }, "المستهدف"),
          h("b", { class: "kpi7-foot-val gold" }, kpiVal(k, k.target)),
        ),
      ),
    );

    activatable(card,
      () => profileNav.open(k, card),
      "المؤشر " + fmt.int(k.id) + ": " + String(k.name)
      + " — " + fmtLabel(k)
      + "، خط الأساس " + kpiVal(k, k.baseline)
      + "، المستهدف " + kpiVal(k, k.target)
      + "، القيمة الحالية غير متوفرة. عرض الملف الكامل");

    return card;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8) البطاقة الرئيسة — شبكة البطاقات + الشريط القياسي + أدوات الترويسة
        تعيد واجهة برمجية صغيرة {applyMix, setView, openProfileById} تستهلكها
        الروابط العميقة (§11) — الحالة كلها عرضية، البيانات لا تُمس.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildMainCard(cell, ctx, model, rel, profileNav) {
    const res = RH.presenter.layout.card(cell, {
      title: "المؤشرات الأربعة عشر — من خط الأساس إلى المستهدف",
      sub: "الذهبي = المستهدف وخط الأساس حصراً · القيم الحالية غير متوفرة",
      cls: "kpi7-main",
    });
    res.body.classList.add("kpi7-main-body");

    /* ── حالة العرض العرضية ── الترتيب الافتراضي «الصيغة»: البطاقات مجمعة
       تحت ترويستي نوع (نسبية/عددية) بدل رتابة أربعة عشر صفاً متطابقاً
       (إصلاح المراجعة) — ترتيب المصدر متاح بزر «المعرف». */
    const state = { view: "cards", mix: "all", sort: "fmt" };
    let barChart = null;

    /* ترويستا المجموعتين — تُدرجان قبل أول بطاقة من كل صيغة عند الترتيب
       بالصيغة، وتختفيان مع أي ترتيب/ترشيح آخر (لا تشويش على المعرف) */
    const groupHeads = {
      pct: h("div", { class: "kpi7-group-head", "aria-hidden": "true" },
        "النوع: نسبة مئوية — " + fmt.noun(model.pctList.length, "indicator")),
      num: h("div", { class: "kpi7-group-head", "aria-hidden": "true" },
        "النوع: قيمة عددية — " + fmt.noun(model.absList.length, "indicator")),
    };

    /* مُقارِنات الترتيب العرضي — كل مقياس قابل للمقارنة عبر الصيغتين */
    const comparators = {
      id: (a, b) => a.id - b.id,
      base: (a, b) => (basePos(b) - basePos(a)) || (a.id - b.id),
      fmt: (a, b) => ((a.pct ? 0 : 1) - (b.pct ? 0 : 1)) || (a.id - b.id),
    };

    /* ── أدوات الترويسة: ترشيح بالصيغة + مبدل عرض + الملحق ── */
    const tools = h("div", {
      class: "kpi7-tools",
      role: "toolbar",
      "aria-label": "أدوات عرض المؤشرات",
    });

    /** زر أداة موحد بحالة ضغط معلنة */
    function toolBtn(text, pressed, onAct, aria) {
      const b = h("button", {
        class: "kpi7-tool",
        type: "button",
        "data-interactive": "",
        "aria-pressed": pressed ? "true" : "false",
        "aria-label": aria || text,
        onclick: onAct,
      }, text);
      return b;
    }
    const setPressed = (btn, on) =>
      btn.setAttribute("aria-pressed", on ? "true" : "false");

    /* مجموعة الترشيح — الأعداد محسوبة من النموذج */
    const mixDefs = [
      { id: "all", text: "الكل " + fmt.int(model.kpis.length) },
      { id: "pct", text: "النسبية " + fmt.int(model.pctList.length) },
      { id: "num", text: "العددية " + fmt.int(model.absList.length) },
    ];
    const mixBtns = {};
    const mixGroup = h("span", {
      class: "kpi7-tool-group",
      role: "group",
      "aria-label": "ترشيح المؤشرات بالصيغة",
    });
    for (const d of mixDefs) {
      const b = toolBtn(d.text, d.id === state.mix,
        () => applyMix(d.id),
        "ترشيح: " + d.text);
      mixBtns[d.id] = b;
      mixGroup.appendChild(b);
    }

    /* مجموعة الترتيب — عرضي محض على مقاييس قابلة للمقارنة عبر الصيغتين:
       «المعرف» ترتيب المصدر القانوني، «الأقرب انطلاقاً» بموضع خط الأساس
       على المسار المُعاير (نسبة موحدة لكل الصفوف — مقارنة مشروعة)،
       «الصيغة» يجمع النسبية أولاً ثم العددية وبالمعرف داخل كل مجموعة. */
    const sortDefs = [
      { id: "id", text: "المعرف", aria: "ترتيب بترتيب المصدر (المعرف)" },
      {
        id: "base", text: "الأقرب انطلاقاً",
        aria: "ترتيب بموضع خط الأساس على المسار المُعاير — الأقرب إلى مستهدفه انطلاقاً أولاً",
      },
      { id: "fmt", text: "الصيغة", aria: "تجميع بالصيغة — النسبية أولاً ثم العددية" },
    ];
    const sortBtns = {};
    const sortGroup = h("span", {
      class: "kpi7-tool-group",
      role: "group",
      "aria-label": "ترتيب البطاقات",
    });
    for (const d of sortDefs) {
      const b = toolBtn(d.text, d.id === state.sort, () => applySort(d.id), d.aria);
      sortBtns[d.id] = b;
      sortGroup.appendChild(b);
    }

    /* مجموعة مبدل العرض */
    const viewBtns = {};
    const viewGroup = h("span", {
      class: "kpi7-tool-group",
      role: "group",
      "aria-label": "طريقة العرض",
    });
    viewBtns.cards = toolBtn("البطاقات", true,
      () => setView("cards"), "عرض شبكة البطاقات");
    viewBtns.bars = toolBtn("الشريط القياسي", false,
      () => setView("bars"),
      "عرض الشريط القياسي — كل المؤشرات معايرة على مستهدفاتها");
    viewGroup.appendChild(viewBtns.cards);
    viewGroup.appendChild(viewBtns.bars);

    /* زر الملحق الكامل (عقد §7: يحفظ حالة القسم، الكليكر لا يبلغه) */
    const axBtn = h("button", {
      class: "kpi7-tool ghost",
      type: "button",
      "data-interactive": "",
      title: "فتح ملحق المؤشرات التفصيلي",
      "aria-label": "فتح ملحق المؤشرات التفصيلي",
      onclick: () => ctx.openAppendix("kpi"),
    }, "الملحق");

    tools.appendChild(mixGroup);
    tools.appendChild(sortGroup);
    tools.appendChild(viewGroup);
    tools.appendChild(axBtn);
    res.head.appendChild(tools);

    /* ── الجسمان المتبادلان: شبكة البطاقات / الشريط القياسي ── */
    const cardsHost = h("div", {
      class: "kpi7-cards",
      role: "group",
      "aria-label": "بطاقات " + fmt.noun(model.kpis.length, "indicator")
        + " — الأسهم تتنقل بينها وEnter يفتح الملف",
    });
    const cards = model.kpis.map((k) => buildKpiCard(k, model, rel, ctx, profileNav));
    const cardById = {};
    cards.forEach((c) => { cardById[c.dataset.kpi] = c; });
    for (const c of cards) cardsHost.appendChild(c);

    const barsWrap = h("div", { class: "kpi7-bars", hidden: true });
    const barsHost = h("div", { class: "chart-host kpi7-bars-host" });
    barsWrap.appendChild(barsHost);

    /* سطر العدّ الحي — يعلن نتيجة الترشيح لقارئات الشاشة أيضاً */
    const countLine = h("div", { class: "kpi7-count", "aria-live": "polite" });

    res.body.appendChild(cardsHost);
    res.body.appendChild(barsWrap);
    res.body.appendChild(countLine);

    /* ── سلوكيات ── */

    function refreshCount() {
      if (state.view === "bars") {
        countLine.textContent = "الشريط القياسي: "
          + fmt.noun(model.kpis.length, "indicator")
          + " معايرة على مستهدفاتها — المستهدف = " + fmt.pct(100)
          + " لكل الصفوف، والقيم الحقيقية في التلميح.";
        return;
      }
      const shown = cards.filter((c) => !c.hidden).length;
      countLine.textContent = shown === model.kpis.length
        ? "يعرض " + fmt.noun(shown, "indicator") + " — كامل قائمة المصدر."
        : "يعرض " + fmt.int(shown) + " من "
          + fmt.noun(model.kpis.length, "indicator")
          + " (ترشيح " + (state.mix === "pct" ? "النسبية" : "العددية") + ").";
    }

    /** ترشيح عرضي محض بالصيغة — البيانات لا تُمس */
    function applyMix(mix, o) {
      if (mix !== "all" && mix !== "pct" && mix !== "num") return;
      state.mix = mix;
      for (const id of Object.keys(mixBtns)) setPressed(mixBtns[id], id === mix);
      for (const c of cards) {
        c.hidden = mix !== "all" && c.dataset.fmt !== mix;
      }
      syncGroupHeads();
      refreshCount();
      if (!o || !o.silent) ctx.update({ mix: mix === "all" ? null : mix });
    }

    /** مزامنة ترويستي المجموعتين: تظهران فقط مع ترتيب «الصيغة» بلا ترشيح —
        تُدرج كل ترويسة قبل أول بطاقة من صيغتها بترتيب DOM الحي */
    function syncGroupHeads() {
      const show = state.sort === "fmt" && state.mix === "all"
        && state.view === "cards";
      for (const key of ["pct", "num"]) {
        const gh = groupHeads[key];
        if (!show) {
          if (gh.parentNode) gh.parentNode.removeChild(gh);
          continue;
        }
        const first = cardsHost.querySelector(
          ".kpi7-card[data-fmt=\"" + key + "\"]");
        if (first) cardsHost.insertBefore(gh, first);
      }
    }

    /** ترتيب عرضي محض — إعادة ترتيب عناصر DOM ذاتها (البيانات لا تُمس)؛
        تنقّل الأسهم يقرأ ترتيب DOM الحي فيتبع الترتيب الجديد تلقائياً */
    function applySort(sortId, o) {
      if (!Object.prototype.hasOwnProperty.call(comparators, sortId)) return;
      state.sort = sortId;
      for (const id of Object.keys(sortBtns)) setPressed(sortBtns[id], id === sortId);
      const order = model.kpis.slice().sort(comparators[sortId]);
      for (const k of order) {
        const c = cardById[String(k.id)];
        if (c) cardsHost.appendChild(c); // الإلحاق يعيد الترتيب دون هدم
      }
      syncGroupHeads();
      if (!o || !o.silent) ctx.update({ sort: sortId === "fmt" ? null : sortId });
    }

    /** تبديل العرض: البطاقات ↔ الشريط القياسي (kpiBullets القانوني) */
    function setView(view, o) {
      if (view !== "cards" && view !== "bars") return;
      if (state.view === view) return;
      state.view = view;
      const bars = view === "bars";
      setPressed(viewBtns.cards, !bars);
      setPressed(viewBtns.bars, bars);
      cardsHost.hidden = bars;
      barsWrap.hidden = !bars;
      /* الشريط القياسي يعرض القائمة كاملة بترتيب المصدر دوماً — الترشيح
         والترتيب يُصفَّران بصمت وتُعطَّل أزرارهما كي لا توحي بحالة لا تُطبق */
      for (const id of Object.keys(mixBtns)) {
        mixBtns[id].disabled = bars;
      }
      for (const id of Object.keys(sortBtns)) {
        sortBtns[id].disabled = bars;
      }
      if (bars) {
        if (state.mix !== "all") applyMix("all", { silent: true });
        if (state.sort !== "id") applySort("id", { silent: true });
        /* البناء بعد الإظهار — للمضيف مقاس حقيقي وقتها */
        requestAnimationFrame(() => {
          if (!barChart) {
            barChart = chart2("kpiBullets", barsHost, ctx.su, { key: "kpis" });
          } else if (barChart && !barChart.isDisposed()) {
            barChart.resize();
          }
        });
      }
      syncGroupHeads();
      refreshCount();
      if (!o || !o.silent) ctx.update({ view: bars ? "bars" : null });
    }

    /* مراقب مقاس مضيف الشريط القياسي — تغيّر أبعاد البطاقة (ترشيح جار في
       بطاقات مجاورة أو تدرّج --su) يعيد قياس الرسم دون إعادة بناء؛
       يُفصل عند هدم القسم (عقد ctx.onTeardown). */
    if (typeof ResizeObserver === "function") {
      const ro = new ResizeObserver(() => {
        if (barChart && !barChart.isDisposed() && !barsWrap.hidden) {
          barChart.resize();
        }
      });
      ro.observe(barsHost);
      ctx.onTeardown(() => ro.disconnect());
    }

    /* تنقل الأسهم بين البطاقات الظاهرة — شبكة عمودين، RTL:
       السهم الأيسر يتقدم (العنصر التالي يقع بصرياً يساراً).
       القراءة من ترتيب DOM الحي فيتبع التنقل أي ترتيب/ترشيح جارٍ. */
    const GRID_COLS = 2;
    cardsHost.addEventListener("keydown", (ev) => {
      const tgt = ev.target && ev.target.closest
        ? ev.target.closest(".kpi7-card") : null;
      if (!tgt) return;
      const vis = Array.prototype.filter.call(cardsHost.children,
        (c) => !c.hidden && c.classList.contains("kpi7-card"));
      const i = vis.indexOf(tgt);
      if (i < 0) return;
      let n = null;
      switch (ev.key) {
        case "ArrowLeft": n = i + 1; break;
        case "ArrowRight": n = i - 1; break;
        case "ArrowDown": n = i + GRID_COLS; break;
        case "ArrowUp": n = i - GRID_COLS; break;
        case "Home": n = 0; break;
        case "End": n = vis.length - 1; break;
        default: return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      if (n >= 0 && n < vis.length) vis[n].focus();
    });

    /* الترتيب الافتراضي المجمع بالصيغة — يدرج ترويستي المجموعتين */
    applySort(state.sort, { silent: true });
    refreshCount();

    return {
      applyMix,
      applySort,
      setView,
      openProfileById(id) {
        const k = model.kpis.find((x) => x.id === id);
        if (!k) return;
        profileNav.open(k, cardById[String(id)] || null);
      },
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9) خلية المصفوفة — kpiMatrix القانوني داخل بطاقة زجاجية
        الجدول الكثيف بفرزه التفاعلي (aria-sort) يأتي جاهزاً من المكتبة؛
        البطاقة هنا تمنحه الترويسة والإطار الزجاجي والتمرير الداخلي فقط.
     ══════════════════════════════════════════════════════════════════════════ */
  function buildMatrixCell(cell, ctx, model) {
    const res = RH.presenter.layout.card(cell, {
      title: "مصفوفة المؤشرات",
      sub: "فرز تفاعلي بالأعمدة الرقمية",
      cls: "kpi7-matrix",
    });
    chart2("kpiMatrix", res.body, ctx.su, { key: "kpis", compact: true });
    return res;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10) عمود الصدق والمصدر والرؤى — الصف الثاني من العمود الجانبي
         بطاقة الصدق (نص ملاحظة الإصدار حرفياً) ← مزيج الصيغ (شريط مكدس
         بالأزرق التصنيفي الثانوي) ← المصدر الحرفي ← رؤى المحفظة ← الحداثة
         والبوابات. العمود يتمرر داخلياً عند الضيق (المسرح لا يتمرر أبداً).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildTruthColumn(cell, ctx, model, rel, open) {
    const col = h("div", { class: "kpi7-truth-col" });
    cell.appendChild(col);

    /* ── 10.a بطاقة الصدق — الذهبي وسم «بانتظار التسجيل» المقنن حصراً ── */
    const truth = RH.presenter.layout.card(col, {
      title: "القيم الحالية تُسجَّل من المنصة",
      tone: "gold",
      cls: "kpi7-truth",
    });
    truth.body.appendChild(h("div", { class: "kpi7-truth-row" },
      h("span", { class: "kpi7-truth-dot", "aria-hidden": "true" }),
      h("p", { class: "kpi7-truth-note" }, String(model.note)),
    ));
    truth.body.appendChild(h("div", { class: "kpi7-truth-line" },
      "المتوفر في هذا الإصدار: ",
      h("b", {}, fmt.iso(fmt.int(model.availableCurrent) + "/"
        + fmt.int(model.kpis.length))),
      " — لا امتلاء بياني مختلق.",
    ));
    activatable(truth.card,
      () => open(honestyDetail(model, rel), "القيم الحالية — بيان الصدق", truth.card),
      "القيم الحالية تُسجَّل من المنصة — المتوفر "
      + fmt.int(model.availableCurrent) + " من " + fmt.int(model.kpis.length)
      + "، عرض بيان الصدق الكامل");

    /* ── 10.b مجموعتا خط الأساس — بطاقتا إحصاء مدمجتان (مشتق شفاف):
          «تبدأ من الصفر» مقابل «لها خط أساس قائم»، وسطر «الأقرب انطلاقاً» ── */
    const baseRow = h("div", { class: "kpi7-base-row" });
    const pZero = nounParts(model.zeroBase.length, "indicator");
    const pLive = nounParts(model.liveBase.length, "indicator");
    RH.presenter.layout.statCard(baseRow, {
      label: "تبدأ من الصفر",
      value: pZero.num,
      unit: pZero.word,
      foot: "خط أساسها صفر في المصدر",
    });
    RH.presenter.layout.statCard(baseRow, {
      label: "لها خط أساس قائم",
      value: pLive.num,
      unit: pLive.word,
      foot: model.nearest
        ? "أقربها انطلاقاً: المؤشر " + fmt.int(model.nearest.id) + " عند "
          + fmt.pct(round1(basePos(model.nearest) * 100)) + " من مساره"
        : "",
    });
    col.appendChild(baseRow);

    /* ── 10.c مزيج الصيغ — شريط مكدس صغير (أزرق تصنيفي ثانوي + حياد) ── */
    const pctShare = pctOf(model.pctList.length, model.kpis.length);
    const absShare = pctOf(model.absList.length, model.kpis.length);
    const mix = h("div", { class: "kpi7-mix" },
      h("div", { class: "kpi7-mix-title" }, "مزيج الصيغ"),
      h("div", { class: "kpi7-mix-bar", "aria-hidden": "true" },
        (() => {
          const a = h("span", { class: "kpi7-mix-seg pct" });
          a.style.width = pctShare + "%";
          return a;
        })(),
        (() => {
          const b = h("span", { class: "kpi7-mix-seg num" });
          b.style.width = absShare + "%";
          return b;
        })(),
      ),
      h("div", { class: "kpi7-mix-legend" },
        h("span", { class: "kpi7-mix-key pct" },
          h("i", { "aria-hidden": "true" }),
          "نسبة مئوية — " + fmt.noun(model.pctList.length, "indicator")
          + " (" + fmt.pct(pctShare) + ")",
        ),
        h("span", { class: "kpi7-mix-key num" },
          h("i", { "aria-hidden": "true" }),
          "قيمة عددية — " + fmt.noun(model.absList.length, "indicator")
          + " (" + fmt.pct(absShare) + ")",
        ),
      ),
    );
    col.appendChild(mix);

    /* ── 10.d بطاقة المصدر الحرفي + معبر إلى قسم المبادرات ── */
    const src = RH.presenter.layout.card(col, {
      title: "مصدر المؤشرات",
      cls: "kpi7-src",
    });
    src.body.appendChild(sourceQuote(rel));
    src.body.appendChild(h("div", { class: "kpi7-src-actions" },
      h("button", {
        class: "kpi7-btn ghost",
        type: "button",
        "data-interactive": "",
        title: "الانتقال إلى قسم «المبادرات والركائز»",
        "aria-label": "الانتقال إلى قسم «المبادرات والركائز»",
        onclick: () => RH.presenter.engine.goScene("initiatives"),
      },
        h("span", {}, "المبادرات والركائز"),
        h("span", { class: "kpi7-btn-arrow", "aria-hidden": "true" }, "←"),
      ),
    ));

    /* ── 10.e عمود الرؤى — المفتاح القانوني الأقرب (محفظة المبادرات التي
          تقيسها هذه المؤشرات) موسوماً بمرجعه بصدق؛ غيابه = لا شيء يُرسم ── */
    RH.presenter.layout.insightRail(col, "initiatives", {
      title: "رؤى تحليلية — محفظة المبادرات",
    });

    /* ── 10.f سطر الحداثة وبوابات التحقق ── */
    const v = rel.validation || null;
    col.appendChild(h("div", { class: "kpi7-meta-foot" },
      h("div", { class: "kpi7-meta-line" },
        "تاريخ الحساب المرجعي: " + fmt.date(model.calc)
        + " · البيانات حتى " + String(rel.meta.data_as_of)),
      (v && Number.isFinite(v.gates_passed) && Number.isFinite(v.gates_total))
        ? h("div", { class: "kpi7-meta-line gates" },
          h("span", { class: "kpi7-gates-dot", "aria-hidden": "true" }),
          (v.gates_passed === v.gates_total
            ? "اجتاز الإصدار جميع بوابات التحقق "
              + fmt.iso(fmt.int(v.gates_passed) + "/" + fmt.int(v.gates_total))
            : "اجتاز الإصدار "
              + fmt.iso(fmt.int(v.gates_passed) + "/" + fmt.int(v.gates_total))
              + " من بوابات التحقق")
          + " — " + fmt.date(v.checked_at))
        : null,
    ));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11) الملخص الناطق — فقرة مخفية بصرياً تقرأ اللوحة جملة واحدة لقارئات
         الشاشة قبل الغوص في البطاقات (كل بطاقة تحمل بديلها النصي الكامل
         في aria-label، والمصفوفة جدول حقيقي أصلاً).
     ══════════════════════════════════════════════════════════════════════════ */
  function buildSrSummary(el, model, rel) {
    const txt = "لوحة مؤشرات الأداء — "
      + fmt.noun(model.kpis.length, "indicator")
      + " استراتيجياً من خطة العمل: "
      + fmt.int(model.pctList.length) + " بصيغة نسبة مئوية و"
      + fmt.int(model.absList.length) + " بصيغة قيمة عددية، لكل مؤشر خط أساس"
      + " ومستهدف معتمدان، والمستهدف يعادل " + fmt.pct(100)
      + " على مسار كل بطاقة. القيم الحالية غير متوفرة في هذا الإصدار — "
      + String(model.note) + ". تاريخ الحساب المرجعي "
      + fmt.date(model.calc) + "، والبيانات حتى "
      + String(rel.meta.data_as_of) + ".";
    el.appendChild(h("p", { class: "kpi7-sr-summary" }, txt));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     12) الروابط العميقة — قراءة معاملات المسار عند البناء (عقد ctx.params):
         mix=pct|num يرشح، view=bars يبدل، kpi=<1..14> يفتح الملف.
         معامل غير صالح يُتجاهل بصمت؛ silent يمنع إعادة كتابة العنوان
         بما هو مكتوب فيه أصلاً.
     ══════════════════════════════════════════════════════════════════════════ */
  function applyDeepLinks(ctx, model, main) {
    const p = ctx.params || {};
    if (p.mix === "pct" || p.mix === "num") {
      main.applyMix(p.mix, { silent: true });
    }
    if (p.sort === "base" || p.sort === "fmt" || p.sort === "id") {
      main.applySort(p.sort, { silent: true });
    }
    if (p.view === "bars") {
      main.setView("bars", { silent: true });
    }
    const kq = parseInt(p.kpi, 10);
    if (Number.isFinite(kq) && model.kpis.some((k) => k.id === kq)) {
      /* بعد إطار — القسم يُبنى في مضيف احتياطي ثم يُبدَّل (عقد المحرك) */
      requestAnimationFrame(() => main.openProfileById(kq));
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     13) تجميع اللوحة وتسجيل القسم — عقد RH.sections.register
         (order:7، id:"kpis"، backdrop:"kpis" → kpis_closing بالاسم المستعار)
         الشبكة: البطاقة الرئيسة 8 أعمدة × الصفين، المصفوفة 4 أعمدة صفاً
         أول، عمود الصدق 4 أعمدة صفاً ثانياً — كثافة كاملة بلا فراغ،
         والتسلسل الهرمي محفوظ: شريط ← رسوم ← عمود رؤى.
     ══════════════════════════════════════════════════════════════════════════ */
  RH.sections.register({
    id: "kpis",
    order: 7,
    title: "مؤشرات الأداء",
    kicker: "قياس أثر خطة العمل",
    backdrop: "kpis",
    /* خطوتا بناء إضافيتان (عقد §1 — الكليكر يقلب الخطوات ثم الأقسام):
       0 = الشريط والبطاقة الرئيسة · 1 = + المصفوفة · 2 = + عمود الصدق والرؤى */
    steps: 2,
    build(el, ctx) {
      const rel = ctx.release;
      const model = kpiModel(rel);
      const open = makeDetailOpener(el, ctx);
      const profileNav = makeProfileNav(ctx, model, rel, open);

      /* الترويسة: سياق ذهبي + عنوان + وسم المصدر + سطر الاحتساب.
         وسم المصدر مشتق من نص المصدر الحرفي (ما قبل الشرطة الطويلة)
         مع عزل اتجاهي للمقطع اللاتيني الختامي (رقم الإصدار). */
      let srcShort = String(rel.strategy.source || "").split("—")[0].trim();
      const mLatin = /^(.*?)([A-Za-z][A-Za-z0-9._-]*)$/.exec(srcShort);
      if (mLatin) srcShort = mLatin[1] + fmt.iso(mLatin[2]);
      RH.presenter.layout.sectionHeader(el, {
        kicker: "قياس أثر خطة العمل",
        title: "مؤشرات الأداء",
        badge: "المصدر: " + srcShort,
        meta: "تاريخ الحساب المرجعي: " + fmt.date(model.calc),
      });

      /* الملخص الناطق ثم شريط المؤشرات التعريفية الخمسة */
      buildSrSummary(el, model, rel);
      buildStrip(el, ctx, model, rel, open, profileNav);

      /* الشبكة 12 عموداً: رئيسة 8×2 · مصفوفة 4 · عمود الصدق 4 */
      const g = RH.presenter.layout.grid(el, { cols: 12, cls: "kpi7-grid" });
      const cMain = g.cell({ span: 8, rows: 2, cls: "kpi7-cell" });
      const cMatrix = g.cell({ span: 4, cls: "kpi7-cell" });
      const cTruth = g.cell({ span: 4, cls: "kpi7-cell" });

      const main = buildMainCard(cMain, ctx, model, rel, profileNav);
      buildMatrixCell(cMatrix, ctx, model);
      buildTruthColumn(cTruth, ctx, model, rel, open);

      /* خطوات البناء (عقد §1) — بعد المراجعة: اللوحة كاملة مبنية وظاهرة
         من الحالة الأولى (لا مناطق سوداء في الحالة الافتراضية أبداً)،
         والخطوات تُبرز الطبقة محل الحديث بتوهج ذهبي بدل أن تخلقها:
         0 = لا إبراز · 1 = إبراز المصفوفة · 2 = إبراز عمود الصدق والرؤى. */
      const step = Math.max(0, Math.min((ctx.steps || 1) - 1, ctx.step || 0));
      cMatrix.classList.toggle("kpi7-step-hi", step === 1);
      cTruth.classList.toggle("kpi7-step-hi", step === 2);

      /* الروابط العميقة أخيراً — بعد اكتمال الواجهة البرمجية للبطاقة الرئيسة */
      applyDeepLinks(ctx, model, main);
    },
  });
})();
