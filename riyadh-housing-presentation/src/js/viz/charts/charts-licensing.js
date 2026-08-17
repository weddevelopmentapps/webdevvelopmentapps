/* ════════════════════════════════════════════════════════════════════════════
   charts-licensing.js — مكتبة رسوم «التراخيص» (RH.viz.charts2)
   ────────────────────────────────────────────────────────────────────────────
   ينفذ خمسة مُنشئين من القائمة القانونية في docs/V2_CONTRACTS.md §3:

     cumulativeLicenses    مسار تراكمي: خط الأساس + الإضافات الشهرية لثلاثة
                           مقاييس (بناء/تشغيلية/أسرّة). لا محاور مزدوجة:
                           الرخص في شبكة عليا والأسرّة في شبكة سفلى داخل
                           المثيل الواحد (مضاعفات صغيرة بمقياسين منفصلين)
                           مع مؤشر محور مترابط وخطوط أساس ذهبية.
     monthlyNetIssuance    الإصدار الشهري الصافي: أعمدة الأسرّة المضافة في
                           شبكة عليا + أعمدة الرخص (بناء/تشغيلية) مجمعة في
                           شبكة سفلى — المقياسان مفصولان شبكتين لا محورين.
     facilityTypes         أنواع الإيواء: أعمدة أفقية بثلاثية facility3
                           المتحقق منها لونياً (أخضر/أزرق/رملي) مع تلميحات
                           الحصص، وبديل donut اختياري برقم مركزي.
     sectorLicenseCompare  مقارنة قطاعية مجمعة: بناء/تشغيلية في شبكة عليا
                           والأسرّة المرخصة في شبكة سفلى + تلميحات ترتيبية.
     licenseGrowthBridge   تكوين النمو المعاد تصميمه (بديل الجسر الشلالي
                           المرفوض): شريط أفقي مدمج — خط الأساس ذهبي ثم
                           الإضافات الشهرية شرائح خضراء متتابعة بفواصل —
                           مع شريط «الإضافات مكبّرة» أسفله بتسميات ‎+N واضحة.

   العقد الموحد: RH.viz.charts2.<name>(el, su, opts?) → مثيل ECharts.
   المثيل يُنشأ حصراً عبر سجل الثيم RH.viz.theme.chart("c2:"+name[+":"+key], el)
   — السجل يتخلص من المثيل المستبدل، وresizeAll/disposeAll يبقيان صالحين.

   قواعد غير قابلة للتفاوض (مطبقة حرفياً هنا):
   • كل البيانات من RH.data.store.release()/.der() — لا قيمة مختلقة إطلاقاً.
   • كل رقم ظاهر عبر RH.core.fmt (أرقام لاتينية، فواصل آلاف، ٪ عربية معزولة).
   • كل نص إصدار يمر إلى HTML التلميح عبر theme.esc/ttRow/ttTitle حصراً.
   • منظومة المعنى: أخضر = الطاقة/الرخص التشغيلية النشطة، أخضر مضيء = سلسلة
     الأسرّة (درجة من صبغة الطاقة ذاتها تميّزها في وسيلة الإيضاح)، أزرق =
     فئة تصنيفية ثانوية (رخص البناء، مبنى سكني)، رملي = فئة facility3
     الثالثة، ذهبي = خط الأساس حصراً، مرجاني لا يظهر هنا (لا خلل في التراخيص).
   • لا محاور مزدوجة أبداً: مقياسان مختلفا النطاق = شبكتان grid منفصلتان
     داخل المثيل الواحد بمحور مستقل لكل شبكة.
   • وسيلة إيضاح عند ≥ سلسلتين؛ تسميات مباشرة انتقائية لا رقماً على كل نقطة.
   • حركة الدخول من theme.base(su) وتُعطَّل تلقائياً مع prefers-reduced-motion؛
     تعرّج التأخير stagger يصفر معها؛ لا حركة مستمرة بعد الاستقرار.
   • المحاور بأدوات الثيم (اتجاه RTL معكوس، محور القيم على اليمين).
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

RH.viz.charts2 = RH.viz.charts2 || {};

(function () {
  const T = RH.viz.theme;
  const fmt = RH.core.fmt;

  /* قراءة الإصدار والمشتقات وقت البناء — لا نسخ محلية قابلة للتقادم */
  const S = () => RH.data.store.release();
  const D = () => RH.data.store.der();

  /* نسبة مئوية بنفس تقريب بايثون (نصف لأعلى، منزلة واحدة) — المرآة الرسمية */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  /* ──────────────────────────────────────────────────────────────────────────
     أدوات مشتركة صغيرة — محلية للملف عمداً (كل ملف رسوم مكتفٍ بذاته وفق
     ترتيب ضم build.py؛ لا تصدير أدوات بين ملفات الرسوم). المقاسات بوحدة su.
     ────────────────────────────────────────────────────────────────────────── */

  /** معرف السجل الموحد: "c2:<name>[:<key>]" — key يسمح بمثيلين للمُنشئ الواحد
      (نسخة مصغرة في الملخص التنفيذي ونسخة كاملة في قسم التراخيص مثلاً) */
  function cid(name, opts) {
    return "c2:" + name + (opts && opts.key ? ":" + opts.key : "");
  }

  /** منسق محور القيم الكمية الكبيرة: صيغة تنفيذية مختصرة (612.4 ألف) */
  const axisK = (v) => fmt.compact(v);

  /** نمط نص رقمي (أرقام جدولية — IBM Plex Sans Arabic tnum عبر الخط نفسه) */
  function numStyle(su, size, color, weight) {
    const st = {
      color: color || T.C.ink2,
      fontFamily: "IBM Plex Sans Arabic",
      fontSize: T.fs(su, size),
    };
    if (weight) st.fontWeight = weight;
    return st;
  }

  /** نمط نص تحريري (Cairo) للتسميات والأسماء والعناوين */
  function txtStyle(su, size, color, weight) {
    const st = {
      color: color || T.C.ink2,
      fontFamily: "Cairo",
      fontSize: T.fs(su, size),
    };
    if (weight) st.fontWeight = weight;
    return st;
  }

  /** وسيلة إيضاح موحدة أعلى الرسم — تُستدعى فقط عند ≥ سلسلتين (قاعدة صارمة) */
  function legendBox(su, names, extra) {
    return Object.assign({
      top: 0,
      left: "center",
      data: names,
      icon: "roundRect",
      itemWidth: T.fs(su, 13),
      itemHeight: T.fs(su, 9),
      itemGap: T.fs(su, 18),
      textStyle: txtStyle(su, 13.5, T.C.ink2),
      inactiveColor: T.C.faint,
      selectedMode: true,
    }, extra || {});
  }

  /** عنوان شبكة فرعية داخل المثيل متعدد الشبكات — على اليمين (قراءة RTL) */
  function gridTitle(su, text, top, compact) {
    return {
      text: text,
      right: T.fs(su, 4),
      top: top,
      textStyle: txtStyle(su, compact ? 12.5 : 14, T.C.ink2, 600),
    };
  }

  /** حد فاصل بلون المسرح بين شرائح المكدس — فاصل 1px يقرأ الشرائح كأجزاء
      متمايزة دون لون إضافي (قاعدة الفواصل في منهجية اللوحات) */
  function segBorder() {
    return { borderColor: T.C.stage1, borderWidth: 1 };
  }

  /** حالة تأكيد موحدة: توهج خفيف بلون السلسلة نفسها — لا تغيير صبغة
      (تغيير الصبغة عند التحويم يكسر عقد «لون واحد للمقياس الواحد») */
  function softEmphasis(color) {
    return {
      focus: "none",
      itemStyle: {
        shadowBlur: 14,
        shadowColor: color,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      },
    };
  }

  /** تعرّج دخول الأعمدة: تأخير متدرج بفهرس النقطة — يصفر مع reduced-motion */
  function stagger(step) {
    return (idx) => (T.REDUCED ? 0 : idx * step);
  }

  /** «+N» بعزل اتجاهي حتمي — للتسميات والتلميحات (إضافات موجبة دائماً هنا) */
  const plusInt = (n) => fmt.iso("+" + fmt.int(n));
  const plusPct = (v) => fmt.iso("+" + fmt.dec1(v) + "٪");

  /** سطر هامشي داخل تلميح HTML — القالب ثابت والنص يمر عبر esc حصراً */
  function ttNote(text) {
    return '<div style="color:#93A096;font-size:.86em;margin-top:5px;max-width:270px">'
      + T.esc(text) + "</div>";
  }

  /** إتاحة: مضيف الرسم قابل للتركيز بلوحة المفاتيح ويحمل وصفاً ناطقاً كاملاً.
      الدور "figure" لا "img" عمداً — كي يبقى الجدول النصي المكافئ (srTable)
      مكشوفاً لقارئات الشاشة (role="img" يجعل الأحفاد عرضيين فيُبتلع الجدول). */
  function a11y(el, label) {
    el.setAttribute("role", "figure");
    el.setAttribute("aria-label", label);
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
  }

  /** جدول بيانات مكافئ مخفي بصرياً — البديل النصي الكامل للرسم (عقد الإتاحة:
      «توجد نسخة جدولية»). يُبنى بـ textContent حصراً فلا مسار HTML إطلاقاً،
      وبأنماط سطرية كي لا نلمس ملفات CSS لا نملكها. يُستبدل عند إعادة البناء. */
  function srTable(el, caption, head, rows) {
    const old = el.querySelector(":scope > .sr-chart-table");
    if (old) old.remove();
    const tbl = document.createElement("table");
    tbl.className = "sr-chart-table";
    tbl.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;"
      + "clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;margin:-1px;"
      + "padding:0;border:0;";
    const cap = document.createElement("caption");
    cap.textContent = caption;
    tbl.appendChild(cap);
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    for (const h of head) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = h;
      trh.appendChild(th);
    }
    thead.appendChild(trh);
    tbl.appendChild(thead);
    const tbody = document.createElement("tbody");
    for (const r of rows) {
      const tr = document.createElement("tr");
      r.forEach((cell, i) => {
        const td = document.createElement(i === 0 ? "th" : "td");
        if (i === 0) td.scope = "row";
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    tbl.appendChild(tbody);
    el.appendChild(tbl);
  }

  /** تنقل لوحة المفاتيح داخل الرسم: الأسهم تمشط النقاط وتُظهر التلميح،
      وEscape يخفيه. المضيف يحمل data-interactive وفق عقد المحرك فلا تتقدم
      الأسهم بالعرض أثناء تركيز الرسم. المحور معكوس (RTL): النقطة الأولى في
      أقصى اليمين، فالسهم الأيسر يتقدم زمنياً والأيمن يتراجع. */
  function keyNav(el, chart, count, onIndex) {
    if (count < 1) return;
    el.setAttribute("data-interactive", "");
    let idx = -1;
    const show = (i) => {
      idx = Math.max(0, Math.min(count - 1, i));
      onIndex(idx);
    };
    el.addEventListener("keydown", (ev) => {
      switch (ev.key) {
        case "ArrowLeft":
          show(idx < 0 ? 0 : idx + 1);
          break;
        case "ArrowRight":
          show(idx < 0 ? 0 : idx - 1);
          break;
        case "Home":
          show(0);
          break;
        case "End":
          show(count - 1);
          break;
        case "Escape":
          if (idx < 0) return;       // لا تلميح ظاهراً → تمر Escape للمحرك
          idx = -1;
          if (!chart.isDisposed()) chart.dispatchAction({ type: "hideTip" });
          break;
        default:
          return;
      }
      ev.preventDefault();
      ev.stopPropagation();
    });
    el.addEventListener("blur", () => {
      idx = -1;
      if (!chart.isDisposed()) chart.dispatchAction({ type: "hideTip" });
    });
  }

  /** حارس اتساق تطويري: متطابقات الإصدار التي تتكئ عليها الرسوم — مرآة مخففة
      لبوابات validate.js. فشل فحص لا يُسقط اللوحة (الإصدار المنشور اجتاز
      البوابات أصلاً) بل ينبه في وحدة التحكم لالتقاط أي انجراف بيانات مبكراً. */
  function guard(name, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("charts-licensing/" + name + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /** تسميات الأشهر: كاملة افتراضياً، ومختصرة (بلا سنة) في الوضع المدمج —
      السنة تبقى حاضرة في التلميح بالتسمية الكاملة دائماً */
  function monthCats(rows, short) {
    return rows.map((r) => (short ? r.label.replace(/\s+\d{4}$/, "") : r.label));
  }

  /* ──────────────────────────────────────────────────────────────────────────
     تعريف المقاييس الثلاثة — كل قيمة من الإصدار، والألوان من منظومة المعنى:
       operational  أخضر (الرخص التشغيلية النشطة = طاقة مرخصة فاعلة)
       building     أزرق (خط أنابيب البناء — فئة تصنيفية ثانوية)
       beds         أخضر مضيء (درجة من صبغة الطاقة ذاتها — سلسلة الأسرّة)
     أسماء العرض القصيرة («بناء/تشغيلية/أسرّة») ثوابت عرض معتمدة لا بيانات.
     ────────────────────────────────────────────────────────────────────────── */
  function measureMeta(key) {
    const rel = S();
    const der = D();
    const M = {
      building: {
        key: "building",
        label: rel.metrics.current_building.label,      // «رخص البناء»
        disp: "رخص البناء",
        shortName: "بناء",
        unit: "رخصة",
        nounKey: "licence",
        color: T.C.blue,
        base: rel.baseline.building,
        current: rel.metrics.current_building.value,
        growthAbs: der.growth_building_abs,
        growthPct: der.growth_building_pct,
        fV: fmt.int,
      },
      operational: {
        key: "operational",
        label: rel.metrics.current_operational.label,   // «الرخص التشغيلية»
        disp: "الرخص التشغيلية",
        shortName: "تشغيلية",
        unit: "رخصة",
        nounKey: "licence",
        color: T.C.green,
        base: rel.baseline.operational,
        current: rel.metrics.current_operational.value,
        growthAbs: der.growth_operational_abs,
        growthPct: der.growth_operational_pct,
        fV: fmt.int,
      },
      beds: {
        key: "beds",
        label: rel.metrics.licensed_beds.label,         // «الطاقة الاستيعابية المرخصة»
        disp: "الأسرّة المرخصة",
        shortName: "أسرّة",
        unit: "سرير",
        nounKey: "bed",
        color: T.C.greenHi,
        base: rel.baseline.beds,
        current: rel.metrics.licensed_beds.value,
        growthAbs: der.growth_beds_abs,
        growthPct: der.growth_beds_pct,
        fV: fmt.compact,
      },
    };
    return M[key] || null;
  }

  /** المسارات التراكمية الثلاثة: خط الأساس + إضافات monthly.licensing شهرياً.
      المتطابقة المحروسة: آخر نقطة تراكمية = القيمة الحالية المنشورة لكل مقياس
      (96 بناء / 140 تشغيلية / 612,400 سرير) — مرآة بوابات validate.js. */
  function cumData() {
    const rel = S();
    const months = rel.monthly.licensing;
    const base = rel.baseline;
    const cur = {
      building: rel.metrics.current_building.value,
      operational: rel.metrics.current_operational.value,
      beds: rel.metrics.licensed_beds.value,
    };
    const cum = { building: [], operational: [], beds: [] };
    const acc = {
      building: base.building,
      operational: base.operational,
      beds: base.beds,
    };
    for (const m of months) {
      for (const k of ["building", "operational", "beds"]) {
        acc[k] += m[k];
        cum[k].push(acc[k]);
      }
    }
    guard("cumData", {
      "12 شهراً في السلسلة": months.length === 12,
      "تراكمي البناء = الحالي": acc.building === cur.building,
      "تراكمي التشغيلية = الحالي": acc.operational === cur.operational,
      "تراكمي الأسرّة = الطاقة المرخصة": acc.beds === cur.beds,
    });
    return { months, base, cur, cum };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) cumulativeLicenses — المسار التراكمي للتراخيص (شبكتان متجاورتان)
     ──────────────────────────────────────────────────────────────────────────
     المعالجة المعاد ترتيبها بعد المراجعة (كانت الشبكتان متراصتين رأسياً
     فتشابكت تسميات محوريهما): رسمان متجاوران داخل المثيل الواحد —
     الشبكة اليمنى: خطّا الرخص (تشغيلية خضراء، بناء أزرق) بمقياس الرخص؛
     الشبكة اليسرى: مساحة الأسرّة (أخضر مضيء) بمقياسها المستقل ومحور قيمها
     على اليسار — فصل مكاني كامل بدل المحور المزدوج المحظور. خطوط الأساس
     الذهبية متقطعة بتسميات «حبة» داكنة لا تتصادم مع السلاسل، والإجماليات
     الحالية معلنة في عنواني الشبكتين (فوق الشبكة لا داخلها). مؤشر المحور
     مترابط بين الشبكتين، والمحور الرأسي لا يبدأ من الصفر عمداً (ترميز موضع
     لا طول) — النطاق معلن على المحور نفسه.
     opts: { key?, compact? }
     ══════════════════════════════════════════════════════════════════════════ */
  function cumulativeLicenses(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const compact = !!opts.compact;
    const cd = cumData();
    const mB = measureMeta("building");
    const mO = measureMeta("operational");
    const mS = measureMeta("beds");

    /* الفئات: نقطة الأساس المسبوقة ثم 12 شهراً — التسمية الكاملة في التلميح */
    const BASE_CAT = "الأساس";
    const cats = [BASE_CAT].concat(monthCats(cd.months, true));
    const fullTitle = (i) => (i === 0 ? rel.meta.baseline_label : cd.months[i - 1].label);

    const dataB = [cd.base.building].concat(cd.cum.building);
    const dataO = [cd.base.operational].concat(cd.cum.operational);
    const dataS = [cd.base.beds].concat(cd.cum.beds);

    /* مدى محوري القيم: صريح ومحسوب من الخام — بلا تضخيم صامت */
    const licLo = Math.max(0, Math.floor((cd.base.building * 0.9) / 5) * 5);
    const licHi = Math.ceil((cd.cur.operational * 1.07) / 5) * 5;
    const bedGrowth = cd.cur.beds - cd.base.beds;
    const bedLo = Math.floor((cd.base.beds - bedGrowth * 0.15) / 1000) * 1000;
    const bedHi = Math.ceil((cd.cur.beds + bedGrowth * 0.15) / 1000) * 1000;

    /** تسمية «حبة» ذهبية لخط الأساس — خلفية داكنة تمنع أي تصادم بصري */
    function pillLabel(pos) {
      return {
        position: pos,
        backgroundColor: "rgba(11,21,18,.82)",
        padding: [T.fs(su, 2), T.fs(su, 5)],
        borderRadius: 6,
      };
    }

    /** خط سلسلة تراكمية موحد النمط — الإجماليات تعلنها عناوين الشبكتين */
    function cumLine(meta, data, xi, yi) {
      return {
        name: meta.disp,
        type: "line",
        xAxisIndex: xi,
        yAxisIndex: yi,
        color: meta.color,
        z: 10,
        symbol: "circle",
        symbolSize: T.fs(su, compact ? 4.5 : 6),
        showSymbol: !compact,
        lineStyle: { width: compact ? 2.5 : 3, color: meta.color },
        itemStyle: { color: meta.color, borderColor: T.C.stage1, borderWidth: 1 },
        emphasis: { focus: "series", lineStyle: { width: (compact ? 2.5 : 3) + 1 } },
        labelLayout: { hideOverlap: true },
        /* خط الأساس الذهبي — الذهبي لخط الأساس حصراً، عبر مساعد الثيم */
        markLine: T.targetLine(su, meta.base,
          "الأساس " + meta.fV(meta.base)),
        data: data,
      };
    }

    /* إصلاح مراجعة الجولة 1: تسميات الأساس الثلاث داخل مساحة الرسم كانت
       تتصادم مع بعضها ومع المفتاح («الأساس 64» فوق «الأساس 118») —
       القيم تُرسى الآن خارج مساحة الرسم في عنواني الشبكتين حصراً،
       ويبقى خطا الأساس الذهبيان المتقطعان صامتين (القيمة في التلميح أيضاً). */
    const sOper = cumLine(mO, dataO, 0, 0);
    sOper.markLine.label.show = false;
    const sBldg = cumLine(mB, dataB, 0, 0);
    sBldg.markLine.label.show = false;

    const sBeds = cumLine(mS, dataS, 1, 1);
    sBeds.markLine.label.show = false;
    /* مساحة متدرجة من صبغة الطاقة الواحدة — تتلاشى نحو الأرضية */
    sBeds.areaStyle = {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: "rgba(76,193,140,.28)" },
        { offset: 1, color: "rgba(76,193,140,.02)" },
      ]),
    };

    /* تسميات الأشهر المشتركة للشبكتين — كل شهر ثانٍ منعاً للتزاحم */
    const monthAxisLabel = {
      color: T.C.mut, fontFamily: "Cairo",
      fontSize: T.fs(su, compact ? 10 : 11),
      interval: 1,
      rotate: compact ? 0 : 28,
    };

    const c = T.chart(cid("cumulativeLicenses", opts), el);
    c.setOption(Object.assign(T.base(su), {
      legend: legendBox(su, [mO.disp, mB.disp, mS.disp], compact
        ? { itemGap: T.fs(su, 12), textStyle: txtStyle(su, 12, T.C.ink2) }
        : null),
      /* العنوانان فوق الشبكتين (لا داخل مساحة الرسم) ويعلنان الإجماليات.
         إصلاح مراجعة الجولة 2: عند فئة العرض 1366 كان العنوانان يعبران خط
         الالتقاء بين الشبكتين ويطبعان فوق بعضهما — عند الضيق حصراً يُحصر
         كل عنوان بعرض عموده (42٪ من عرض العنصر) مع قطع بعلامة الحذف بدل
         التصادم؛ في المقاس الكامل يتسعان كاملين كما ثبت بالمعاينة. */
      title: (() => {
        const colW = T.narrow()
          ? Math.max(150, Math.floor((el.clientWidth || 640) * 0.42))
          : null;
        const clampW = (ts) => (colW
          ? Object.assign(ts, { width: colW, overflow: "truncate" })
          : ts);
        return [
          {
            text: "الرخص التراكمية — تشغيلية " + fmt.int(cd.cur.operational)
              + " (الأساس " + fmt.int(cd.base.operational) + ") · بناء "
              + fmt.int(cd.cur.building) + " (الأساس " + fmt.int(cd.base.building) + ")",
            right: T.fs(su, 8),
            top: T.fs(su, compact ? 24 : 30),
            textStyle: clampW(txtStyle(su, compact ? 11 : 12.5, T.C.ink2, 600)),
          },
          {
            text: "الأسرّة المرخصة — " + fmt.compact(cd.cur.beds)
              + " (الأساس " + fmt.compact(cd.base.beds) + ")",
            left: T.fs(su, 8),
            top: T.fs(su, compact ? 24 : 30),
            textStyle: clampW(txtStyle(su, compact ? 11 : 12.5, T.C.ink2, 600)),
          },
        ];
      })(),
      grid: [
        { top: T.fs(su, compact ? 50 : 62), bottom: T.fs(su, compact ? 24 : 38),
          left: "57%", right: T.fs(su, 8), containLabel: true },
        { top: T.fs(su, compact ? 50 : 62), bottom: T.fs(su, compact ? 24 : 38),
          left: T.fs(su, 8), right: "57%", containLabel: true },
      ],
      /* مؤشر محور مترابط: تحويم أي شبكة يحرّك الشبكة الأخرى معه */
      axisPointer: { link: [{ xAxisIndex: "all" }] },
      xAxis: [
        T.catXAxis(su, cats, {
          gridIndex: 0,
          boundaryGap: false,
          axisLabel: monthAxisLabel,
        }),
        T.catXAxis(su, cats, {
          gridIndex: 1,
          boundaryGap: false,
          axisLabel: monthAxisLabel,
        }),
      ],
      /* splitNumber صغير: علامات قليلة مقروءة في شبكتين قصيرتين */
      /* علامتان إلى ثلاث كحد أقصى لكل شبكة مصغرة — إصلاح مراجعة الجولة 1:
         كانت العلامات تتراكب (620/600/580 و140…60 مندمجة فلا تُقرأ) */
      yAxis: [
        T.valAxis(su, fmt.int, { gridIndex: 0, min: licLo, max: licHi,
          minInterval: 1, splitNumber: 2 }),
        /* إصلاح مراجعة الجولة 2: كانت علامتا «600 ألف/570 ألف» تطبعان فوق
           بعضهما — علامتان عند طرفي الشبكة حصراً (المدى الكامل) بأقصى
           تباعد رأسي ممكن، فلا تصادم في أي مقاس. */
        T.valAxis(su, axisK, { gridIndex: 1, min: bedLo, max: bedHi,
          position: "left", interval: bedHi - bedLo }),
      ],
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: { color: "rgba(244,241,230,.22)", width: 1 },
        },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          let out = T.ttTitle(fullTitle(i));
          if (i === 0) {
            out += T.ttRow(mB.disp, fmt.noun(cd.base.building, "licence"), mB.color)
              + T.ttRow(mO.disp, fmt.noun(cd.base.operational, "licence"), mO.color)
              + T.ttRow(mS.disp, fmt.unitAfter(cd.base.beds, "سرير"), mS.color)
              + ttNote("نقطة الانطلاق — " + rel.meta.baseline_label);
            return out;
          }
          const m = cd.months[i - 1];
          out += T.ttRow(mB.disp,
            fmt.int(cd.cum.building[i - 1]) + " (" + plusInt(m.building) + ")", mB.color);
          out += T.ttRow(mO.disp,
            fmt.int(cd.cum.operational[i - 1]) + " (" + plusInt(m.operational) + ")", mO.color);
          out += T.ttRow(mS.disp,
            fmt.int(cd.cum.beds[i - 1]) + " (" + plusInt(m.beds) + ")", mS.color);
          out += T.ttRow("التغطية بعد الشهر",
            fmt.pct(pctOf(cd.cum.beds[i - 1], rel.metrics.total_demand.value)));
          return out;
        },
      }),
      series: [sOper, sBldg, sBeds],
    }), true);

    a11y(el,
      "المسار التراكمي للتراخيص من " + rel.meta.baseline_label + ": رخص البناء من "
      + fmt.int(cd.base.building) + " إلى " + fmt.int(cd.cur.building)
      + "، والرخص التشغيلية من " + fmt.int(cd.base.operational) + " إلى "
      + fmt.int(cd.cur.operational) + "، والأسرّة المرخصة من "
      + fmt.unitAfter(cd.base.beds, "سرير") + " إلى "
      + fmt.unitAfter(cd.cur.beds, "سرير") + " حتى " + rel.meta.data_as_of);

    srTable(el, "المسار التراكمي للتراخيص — بيانات الرسم كاملة",
      ["الفترة", "بناء (تراكمي)", "تشغيلية (تراكمي)", "أسرّة (تراكمي)"],
      cats.map((_, i) => [
        fullTitle(i),
        fmt.int(dataB[i]),
        fmt.int(dataO[i]),
        fmt.int(dataS[i]),
      ]));

    keyNav(el, c, cats.length, (i) => {
      if (c.isDisposed()) return;
      c.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: i });
    });
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) monthlyNetIssuance — الإصدار الشهري الصافي (شبكتان مكدستان)
     ──────────────────────────────────────────────────────────────────────────
     الشبكة العليا: أعمدة صافي الأسرّة المضافة شهرياً (أخضر مضيء) بتسميات
     «+N» مباشرة — الرقم الذي يقرأه الأمين أولاً. الشبكة السفلى: أعمدة الرخص
     الصادرة مجمعة (بناء أزرق / تشغيلية أخضر) بمقياس الرخص الصغير المستقل.
     المقياسان (آلاف الأسرّة مقابل آحاد الرخص) مفصولان شبكتين — لا محور مزدوج.
     الأعمدة مرتكزة للصفر حتماً (ترميز طول)، والتلميح يجمع الشهر من الشبكتين
     مع حصة الشهر من نمو الأسرّة السنوي.
     opts: { key?, compact? }
     ══════════════════════════════════════════════════════════════════════════ */
  function monthlyNetIssuance(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const months = rel.monthly.licensing;
    const mB = measureMeta("building");
    const mO = measureMeta("operational");
    const mS = measureMeta("beds");

    /* متطابقات النمو: مجموع الإضافات الشهرية = النمو المطلق المنشور */
    let sumB = 0, sumO = 0, sumS = 0;
    for (const m of months) { sumB += m.building; sumO += m.operational; sumS += m.beds; }
    guard("monthlyNetIssuance", {
      "مجموع إضافات البناء = النمو المنشور": sumB === der.growth_building_abs,
      "مجموع إضافات التشغيلية = النمو المنشور": sumO === der.growth_operational_abs,
      "مجموع إضافات الأسرّة = النمو المنشور": sumS === der.growth_beds_abs,
    });

    const cats = monthCats(months, compact);
    const NAME_BEDS = "أسرّة مضافة";
    const NAME_BLDG = "رخص بناء";
    const NAME_OPER = "رخص تشغيلية";

    const c = T.chart(cid("monthlyNetIssuance", opts), el);
    c.setOption(Object.assign(T.base(su), {
      legend: legendBox(su, [NAME_BEDS, NAME_BLDG, NAME_OPER], compact
        ? { itemGap: T.fs(su, 12), textStyle: txtStyle(su, 12, T.C.ink2) }
        : null),
      /* شبكتان متجاورتان أفقياً (إصلاح المراجعة الثاني: التراص الرأسي كان
         يقصّ الأرقام ويلصق العنوان بالأعمدة) — الأسرّة يميناً بمقياسها
         والرخص يساراً بمقياسها المستقل، والعنوانان فوق شبكتيهما */
      title: [
        {
          text: "صافي الأسرّة المضافة شهرياً",
          right: T.fs(su, 8),
          top: T.fs(su, compact ? 24 : 30),
          textStyle: txtStyle(su, compact ? 12 : 13.5, T.C.ink2, 600),
        },
        {
          text: "الرخص الصادرة شهرياً (بناء وتشغيلية)",
          left: T.fs(su, 8),
          top: T.fs(su, compact ? 24 : 30),
          textStyle: txtStyle(su, compact ? 12 : 13.5, T.C.ink2, 600),
        },
      ],
      grid: [
        { top: T.fs(su, compact ? 48 : 60), bottom: T.fs(su, compact ? 20 : 28),
          left: "56%", right: T.fs(su, 8), containLabel: true },
        { top: T.fs(su, compact ? 48 : 60), bottom: T.fs(su, compact ? 20 : 28),
          left: T.fs(su, 8), right: "56%", containLabel: true },
      ],
      axisPointer: { link: [{ xAxisIndex: "all" }] },
      xAxis: [
        T.catXAxis(su, cats, {
          gridIndex: 0,
          axisLabel: {
            color: T.C.mut, fontFamily: "Cairo",
            fontSize: T.fs(su, 10),
            interval: 1,
            rotate: compact ? 0 : 26,
          },
        }),
        T.catXAxis(su, cats, {
          gridIndex: 1,
          axisLabel: {
            color: T.C.mut, fontFamily: "Cairo",
            fontSize: T.fs(su, 10),
            interval: 1,
            rotate: compact ? 0 : 26,
          },
        }),
      ],
      /* إصلاح مراجعة الجولة 2: علامتان كحد أقصى عند العرض الضيق (1366) */
      yAxis: [
        T.valAxis(su, fmt.int, { gridIndex: 0,
          splitNumber: T.narrow() ? 2 : 3 }),
        T.valAxis(su, fmt.int, { gridIndex: 1, minInterval: 1,
          splitNumber: T.narrow() ? 2 : 3, position: "left" }),
      ],
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(244,241,230,.045)" } },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          const m = months[i];
          return T.ttTitle(m.label)
            + T.ttRow(NAME_BEDS, plusInt(m.beds) + " سرير", mS.color)
            + T.ttRow(NAME_BLDG, plusInt(m.building), mB.color)
            + T.ttRow(NAME_OPER, plusInt(m.operational), mO.color)
            + T.ttRow("إجمالي رخص الشهر",
              fmt.noun(m.building + m.operational, "licence"))
            + T.ttRow("حصة الشهر من نمو الأسرّة",
              fmt.pct(pctOf(m.beds, der.growth_beds_abs)));
        },
      }),
      series: [
        {
          name: NAME_BEDS,
          type: "bar",
          xAxisIndex: 0,
          yAxisIndex: 0,
          color: mS.color,
          barWidth: "56%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          emphasis: softEmphasis(mS.color),
          animationDelay: stagger(22),
          labelLayout: { hideOverlap: true },
          label: {
            show: !compact,
            position: "top",
            color: T.C.mut,
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: T.fs(su, 11),
            formatter: (p) => plusInt(p.value),
          },
          data: months.map((m) => m.beds),
        },
        {
          name: NAME_BLDG,
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          color: mB.color,
          barGap: "18%",
          barWidth: "26%",
          itemStyle: { borderRadius: [3, 3, 0, 0] },
          emphasis: softEmphasis(mB.color),
          animationDelay: stagger(22),
          data: months.map((m) => m.building),
        },
        {
          name: NAME_OPER,
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          color: mO.color,
          barWidth: "26%",
          itemStyle: { borderRadius: [3, 3, 0, 0] },
          emphasis: softEmphasis(mO.color),
          animationDelay: stagger(22),
          data: months.map((m) => m.operational),
        },
      ],
    }), true);

    a11y(el,
      "الإصدار الشهري الصافي خلال " + rel.meta.monitoring_period_label + ": أضيف "
      + fmt.unitAfter(sumS, "سرير") + " و" + fmt.noun(sumB, "licence")
      + " للبناء و" + fmt.noun(sumO, "licence") + " تشغيلية عبر اثني عشر شهراً");

    srTable(el, "الإصدار الشهري الصافي — بيانات الرسم كاملة",
      ["الشهر", "أسرّة مضافة", "رخص بناء", "رخص تشغيلية"],
      months.map((m) => [
        m.label,
        plusInt(m.beds),
        plusInt(m.building),
        plusInt(m.operational),
      ]));

    keyNav(el, c, months.length, (i) => {
      if (c.isDisposed()) return;
      c.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: i });
    });
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) facilityTypes — أنواع الإيواء المرخصة (أعمدة أفقية بتلميحات الحصص)
     ──────────────────────────────────────────────────────────────────────────
     ثلاث فئات بثلاثية facility3 المتحقق منها لونياً — اللون يتبع الهوية لا
     الترتيب (mapping ثابت على المعرفات): مجمع سكني أخضر، مبنى سكني أزرق،
     كبائن متنقلة رملي. الترتيب تنازلي على الخام، تسمية مباشرة «العدد · الحصة»
     عند طرف كل عمود، والمتطابقة المحروسة: مجموع الأنواع = الرخص التشغيلية
     النشطة (140). لا وسيلة إيضاح: المحور الفئوي يسمي الهوية نصاً.
     opts.variant:"donut" يقلبه جزءاً-من-كل حلقياً برقم مركزي (بديل معتمد في
     العقد — donut جزء-من-كل لا gauge دائري).
     opts: { key?, compact?, variant? }
     ══════════════════════════════════════════════════════════════════════════ */
  function facilityTypes(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const compact = !!opts.compact;
    const donut = opts.variant === "donut";
    const total = rel.metrics.current_operational.value;

    /* اللون يتبع المعرف الثابت — لا يتغير بتغير الترتيب أو التصفية */
    const COLORS = { compound: T.C.green, building: T.C.blue, cabins: T.C.demand };
    const rows = rel.facility_types.slice().sort((a, b) => b.count - a.count);
    const colorOf = (r) => COLORS[r.id] || T.C.blue;

    let sum = 0;
    for (const r of rows) sum += r.count;
    guard("facilityTypes", {
      "مجموع الأنواع = الرخص التشغيلية النشطة": sum === total,
      "ثلاثة أنواع إيواء": rows.length === 3,
    });

    const c = T.chart(cid("facilityTypes", opts), el);

    if (donut) {
      /* ── بديل الحلقة: جزء-من-كل برقم مركزي — لا مؤشر ولا عقرب (ليس gauge) ── */
      c.setOption(Object.assign(T.base(su), {
        tooltip: Object.assign(T.tooltip(su), {
          formatter: (p) => {
            const r = rows[p.dataIndex];
            return T.ttTitle(r.name)
              + T.ttRow("الرخص التشغيلية", fmt.noun(r.count, "licence"), colorOf(r))
              + T.ttRow("الحصة", fmt.pct(pctOf(r.count, total)))
              + ttNote("من إجمالي " + fmt.noun(total, "licence") + " تشغيلية نشطة");
          },
        }),
        /* الرقم المركزي: الإجمالي المنشور — نص ثابت القالب بقيم fmt حصراً */
        graphic: [
          {
            type: "text",
            left: "center",
            top: compact ? "44%" : "45%",
            silent: true,
            style: {
              text: fmt.int(total),
              fill: T.C.ivory,
              fontFamily: "IBM Plex Sans Arabic",
              fontSize: T.fs(su, compact ? 26 : 34),
              fontWeight: 700,
              textAlign: "center",
            },
            z: 40,
          },
          {
            type: "text",
            left: "center",
            top: compact ? "56%" : "55%",
            silent: true,
            style: {
              text: "رخصة تشغيلية",
              fill: T.C.mut,
              fontFamily: "Cairo",
              fontSize: T.fs(su, compact ? 11.5 : 13),
              textAlign: "center",
            },
            z: 40,
          },
        ],
        series: [{
          type: "pie",
          radius: [compact ? "56%" : "58%", compact ? "78%" : "80%"],
          center: ["50%", "52%"],
          startAngle: 90,
          clockwise: false,            // دوران بعكس العقارب — انسياب قراءة RTL
          avoidLabelOverlap: true,
          /* حلقة فاصلة بلون المسرح بين الشرائح — قاعدة الفواصل 2px */
          itemStyle: { borderColor: T.C.stage1, borderWidth: 2, borderRadius: 4 },
          label: {
            show: !compact,
            color: T.C.ink2,
            fontFamily: "Cairo",
            fontSize: T.fs(su, 12.5),
            formatter: (p) =>
              p.name + "\n" + fmt.pct(pctOf(rows[p.dataIndex].count, total)),
          },
          labelLine: {
            lineStyle: { color: T.C.faint },
            length: T.fs(su, 12),
            length2: T.fs(su, 10),
          },
          emphasis: {
            scale: true,
            scaleSize: T.fs(su, 5),
            itemStyle: { shadowBlur: 16, shadowColor: "rgba(4,10,8,.55)" },
          },
          data: rows.map((r) => ({
            name: r.name,
            value: r.count,
            itemStyle: { color: colorOf(r) },
          })),
        }],
      }), true);
    } else {
      /* ── الافتراضي: أعمدة أفقية بتسميات «العدد · الحصة» المباشرة ── */
      c.setOption(Object.assign(T.base(su), {
        grid: {
          top: T.fs(su, 8),
          bottom: T.fs(su, compact ? 24 : 30),
          left: T.fs(su, compact ? 100 : 140),
          right: T.fs(su, compact ? 118 : 152),
        },
        xAxis: T.hValAxis(su, fmt.int),
        yAxis: T.hCatAxis(su, rows.map((r) => r.name)),
        tooltip: Object.assign(T.tooltip(su), {
          formatter: (p) => {
            const r = rows[p.dataIndex];
            return T.ttTitle(r.name)
              + T.ttRow("الرخص التشغيلية", fmt.noun(r.count, "licence"), colorOf(r))
              + T.ttRow("الحصة", fmt.pct(pctOf(r.count, total)))
              + ttNote("من إجمالي " + fmt.noun(total, "licence") + " تشغيلية نشطة");
          },
        }),
        series: [{
          type: "bar",
          barWidth: compact ? "48%" : "52%",
          animationDelay: stagger(60),
          data: rows.map((r) => ({
            value: r.count,
            itemStyle: {
              color: colorOf(r),
              borderRadius: [6, 0, 0, 6],
            },
            emphasis: softEmphasis(colorOf(r)),
          })),
          labelLayout: { hideOverlap: true },
          label: {
            show: true,
            position: "left",
            color: T.C.ivory,
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: T.fs(su, compact ? 12 : 13.5),
            formatter: (p) => compact
              ? fmt.int(p.value)
              : fmt.int(p.value) + "  " + fmt.pct(pctOf(p.value, total)),
          },
        }],
      }), true);
    }

    a11y(el,
      "أنواع الإيواء المرخصة: يتصدر " + String(rows[0].name) + " بواقع "
      + fmt.noun(rows[0].count, "licence") + " أي "
      + fmt.pct(pctOf(rows[0].count, total)) + " من إجمالي "
      + fmt.noun(total, "licence") + " تشغيلية نشطة");

    srTable(el, "أنواع الإيواء المرخصة — بيانات الرسم كاملة",
      ["النوع", "الرخص التشغيلية", "الحصة"],
      rows.map((r) => [
        r.name,
        fmt.int(r.count),
        fmt.pct(pctOf(r.count, total)),
      ]).concat([["الإجمالي", fmt.int(total), fmt.pct(100)]]));

    keyNav(el, c, rows.length, (i) => {
      if (c.isDisposed()) return;
      c.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: i });
    });
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) sectorLicenseCompare — مقارنة التراخيص قطاعياً (شبكتان مكدستان)
     ──────────────────────────────────────────────────────────────────────────
     الشبكة العليا: أعمدة مجمعة لكل قطاع — بناء (أزرق) وتشغيلية (أخضر) بمقياس
     الرخص. الشبكة السفلى: الأسرّة المرخصة (أخضر مضيء) بمقياسها المستقل —
     الفصل الصريح بدل المحور المزدوج. تسميات قيمة مباشرة على القمم، والتلميح
     يجمع القطاع كاملاً (قيم + حصص من الإجماليات) مع تلميحات ترتيبية من
     rankings المشتقة (الأعلى/الأدنى) — نص لا لون، فالمنظومة اللونية محفوظة.
     المتطابقات المحروسة: مجاميع القطاعات = الإجماليات المنشورة (96/140/612.4 ألف).
     opts: { key?, compact? }
     ══════════════════════════════════════════════════════════════════════════ */
  function sectorLicenseCompare(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const sectors = rel.sectors;
    const names = sectors.map((s) => s.short);
    const mB = measureMeta("building");
    const mO = measureMeta("operational");
    const mS = measureMeta("beds");

    let sumB = 0, sumO = 0, sumS = 0;
    for (const s of sectors) { sumB += s.building; sumO += s.operational; sumS += s.beds; }
    guard("sectorLicenseCompare", {
      "مجموع بناء القطاعات = الإجمالي": sumB === mB.current,
      "مجموع تشغيلية القطاعات = الإجمالي": sumO === mO.current,
      "مجموع أسرّة القطاعات = الطاقة المرخصة": sumS === mS.current,
    });

    /* تلميحات ترتيبية نصية من rankings — كسر التعادل موحد في derive */
    function rankHints(id) {
      const R = der.rankings;
      const hints = [];
      if (id === R.highest_building) hints.push("الأعلى في رخص البناء");
      if (id === R.lowest_building) hints.push("الأدنى في رخص البناء");
      if (id === R.highest_operational) hints.push("الأعلى في الرخص التشغيلية");
      if (id === R.lowest_operational) hints.push("الأدنى في الرخص التشغيلية");
      if (id === R.highest_beds) hints.push("الأعلى في الأسرّة المرخصة");
      if (id === R.lowest_beds) hints.push("الأدنى في الأسرّة المرخصة");
      return hints;
    }

    const c = T.chart(cid("sectorLicenseCompare", opts), el);
    c.setOption(Object.assign(T.base(su), {
      legend: legendBox(su, [mB.disp, mO.disp, mS.disp], compact
        ? { itemGap: T.fs(su, 12), textStyle: txtStyle(su, 12, T.C.ink2) }
        : null),
      /* شبكتان متجاورتان أفقياً (إصلاح المراجعة الثاني: التراص الرأسي كان
         يسحق شبكة الأسرّة في البطاقات القصيرة) — الرخص يميناً والأسرّة
         يساراً بمحور قيم مستقل لكل شبكة، والعنوانان فوق شبكتيهما */
      title: [
        {
          text: "الرخص حسب القطاع",
          right: T.fs(su, 8),
          top: T.fs(su, compact ? 24 : 30),
          textStyle: txtStyle(su, compact ? 12 : 13.5, T.C.ink2, 600),
        },
        {
          text: "الأسرّة المرخصة حسب القطاع",
          left: T.fs(su, 8),
          top: T.fs(su, compact ? 24 : 30),
          textStyle: txtStyle(su, compact ? 12 : 13.5, T.C.ink2, 600),
        },
      ],
      grid: [
        { top: T.fs(su, compact ? 48 : 60), bottom: T.fs(su, compact ? 20 : 28),
          left: "56%", right: T.fs(su, 8), containLabel: true },
        { top: T.fs(su, compact ? 48 : 60), bottom: T.fs(su, compact ? 20 : 28),
          left: T.fs(su, 8), right: "56%", containLabel: true },
      ],
      axisPointer: { link: [{ xAxisIndex: "all" }] },
      /* القطاعات الخمسة كلها مسماة في النصفين — لا إسقاط تلقائي */
      xAxis: [
        T.catXAxis(su, names, {
          gridIndex: 0,
          axisLabel: {
            color: T.C.mut, fontFamily: "Cairo",
            fontSize: T.fs(su, compact ? 10.5 : 12), interval: 0,
          },
        }),
        T.catXAxis(su, names, {
          gridIndex: 1,
          axisLabel: {
            color: T.C.mut, fontFamily: "Cairo",
            fontSize: T.fs(su, compact ? 10.5 : 12), interval: 0,
          },
        }),
      ],
      /* إصلاح مراجعة الجولة 2: علامتان كحد أقصى عند العرض الضيق (1366)
         بدل ثلاث كانت تندمج (150/100/50 ألف و30/20/10) */
      yAxis: [
        T.valAxis(su, fmt.int, { gridIndex: 0, minInterval: 1,
          splitNumber: T.narrow() ? 2 : 3 }),
        T.valAxis(su, axisK, { gridIndex: 1,
          splitNumber: T.narrow() ? 2 : 3, position: "left" }),
      ],
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(244,241,230,.045)" } },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          const s = sectors[i];
          let out = T.ttTitle(s.name)
            + T.ttRow(mB.disp,
              fmt.int(s.building) + " (" + fmt.pct(pctOf(s.building, mB.current)) + ")",
              mB.color)
            + T.ttRow(mO.disp,
              fmt.int(s.operational) + " (" + fmt.pct(pctOf(s.operational, mO.current)) + ")",
              mO.color)
            + T.ttRow(mS.disp,
              fmt.int(s.beds) + " (" + fmt.pct(pctOf(s.beds, mS.current)) + ")",
              mS.color);
          const hints = rankHints(s.id);
          if (hints.length) out += ttNote(hints.join("، "));
          return out;
        },
      }),
      series: [
        {
          name: mB.disp,
          type: "bar",
          xAxisIndex: 0,
          yAxisIndex: 0,
          color: mB.color,
          barGap: "18%",
          barWidth: "26%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          emphasis: softEmphasis(mB.color),
          animationDelay: stagger(40),
          labelLayout: { hideOverlap: true },
          label: {
            show: !compact,
            position: "top",
            color: T.C.mut,
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: T.fs(su, 11.5),
            formatter: (p) => fmt.int(p.value),
          },
          data: sectors.map((s) => s.building),
        },
        {
          name: mO.disp,
          type: "bar",
          xAxisIndex: 0,
          yAxisIndex: 0,
          color: mO.color,
          barWidth: "26%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          emphasis: softEmphasis(mO.color),
          animationDelay: stagger(40),
          labelLayout: { hideOverlap: true },
          label: {
            show: !compact,
            position: "top",
            color: T.C.mut,
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: T.fs(su, 11.5),
            formatter: (p) => fmt.int(p.value),
          },
          data: sectors.map((s) => s.operational),
        },
        {
          name: mS.disp,
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          color: mS.color,
          barWidth: "42%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          emphasis: softEmphasis(mS.color),
          animationDelay: stagger(40),
          labelLayout: { hideOverlap: true },
          label: {
            show: !compact,
            position: "top",
            color: T.C.mut,
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: T.fs(su, 11.5),
            formatter: (p) => fmt.compact(p.value),
          },
          data: sectors.map((s) => s.beds),
        },
      ],
    }), true);

    const topB = sectors.find((s) => s.id === der.rankings.highest_building);
    const topS = sectors.find((s) => s.id === der.rankings.highest_beds);
    a11y(el,
      "مقارنة التراخيص قطاعياً: يتصدر " + String(topB.name) + " رخص البناء بواقع "
      + fmt.noun(topB.building, "licence") + "، ويتصدر " + String(topS.name)
      + " الأسرّة المرخصة بواقع " + fmt.unitAfter(topS.beds, "سرير")
      + " من إجمالي " + fmt.unitAfter(mS.current, "سرير"));

    srTable(el, "مقارنة التراخيص قطاعياً — بيانات الرسم كاملة",
      ["القطاع", "رخص البناء", "الرخص التشغيلية", "الأسرّة المرخصة"],
      sectors.map((s) => [
        s.name,
        fmt.int(s.building),
        fmt.int(s.operational),
        fmt.int(s.beds),
      ]).concat([[
        "الإجمالي",
        fmt.int(mB.current),
        fmt.int(mO.current),
        fmt.int(mS.current),
      ]]));

    keyNav(el, c, sectors.length, (i) => {
      if (c.isDisposed()) return;
      c.dispatchAction({ type: "showTip", seriesIndex: 1, dataIndex: i });
    });
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) licenseGrowthBridge — النمو منذ خط الأساس (بديل الجسر الشلالي)
     ──────────────────────────────────────────────────────────────────────────
     المعالجة الثالثة بعد ملاحظة المراجعة (كانت شريحة الأساس الذهبية العملاقة
     تبتلع الرسم وتسحق شرائح الأشهر): أعمدة التراكمي الشهري لمقياس واحد
     (opts.measure: "beds" افتراضياً | "building" | "operational") —

     • 12 عموداً أخضر بقيمة التراكمي (الأساس + الإضافات حتى الشهر)؛ المحور
       الرأسي يبدأ قرب خط الأساس عمداً (ترميز موضع لا طول — النطاق معلن على
       المحور) كي يُقرأ النمو بكامل ارتفاع الرسم لا كشريحة 8٪.
     • خط الأساس ذهبي متقطع رفيع markLine بتسمية «حبة» عند حافة المحور —
       الذهبي لخط الأساس حصراً، لا شريحة ذهبية بعد اليوم.
     • تسميات «+N» فوق كل عمود ثانٍ (hideOverlap) والعمود الأخير يعلن
       الإجمالي الحالي مع «+النمو · +النسبة».
     المتطابقة المحروسة: الأساس + مجموع الإضافات = الإجمالي الحالي المنشور.
     opts: { key?, compact?, measure? } (خيار detail القديم يُقبل ويُتجاهل)
     ══════════════════════════════════════════════════════════════════════════ */
  function licenseGrowthBridge(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const compact = !!opts.compact;
    let meta = measureMeta(opts.measure || "beds");
    if (!meta) {
      console.warn("charts-licensing/licenseGrowthBridge: مقياس غير معروف «"
        + opts.measure + "» — استخدام الأسرّة");
      meta = measureMeta("beds");
    }

    const months = rel.monthly.licensing;
    const adds = months.map((m) => m[meta.key]);
    const cums = [];
    let acc = meta.base;
    for (const v of adds) { acc += v; cums.push(acc); }
    let sum = 0;
    for (const v of adds) sum += v;

    guard("licenseGrowthBridge:" + meta.key, {
      "الأساس + الإضافات = الإجمالي الحالي": meta.base + sum === meta.current,
      "النمو المطلق المنشور متطابق": sum === meta.growthAbs,
      "12 إضافة شهرية": adds.length === 12,
    });

    const fV = meta.fV;
    const catsShort = monthCats(months, true);
    const isBeds = meta.key === "beds";

    /* مدى المحور: يبدأ قرب الأساس وينتهي فوق الإجمالي بهامش للتسميات */
    const pad = Math.max(meta.growthAbs * 0.14, isBeds ? 1000 : 2);
    const roundTo = isBeds ? 1000 : 1;
    const yMin = Math.max(0, Math.floor((meta.base - pad) / roundTo) * roundTo);
    const yMax = Math.ceil((meta.current + pad * 1.6) / roundTo) * roundTo;

    /* بيانات الأعمدة: التراكمي بعد كل شهر — العمود الأخير يحمل إعلان الطرف */
    const barData = cums.map((v, i) => {
      const isLast = i === cums.length - 1;
      const item = { value: v };
      if (isLast) {
        item.label = {
          show: true,
          position: "top",
          distance: T.fs(su, 6),
          formatter: () =>
            "{big|" + fV(meta.current) + "}\n{sub|"
            + fmt.iso("+" + fV(meta.growthAbs)) + " · " + plusPct(meta.growthPct) + "}",
          rich: {
            big: {
              color: T.C.greenHi,
              fontFamily: "IBM Plex Sans Arabic",
              fontSize: T.fs(su, compact ? 14 : 17),
              fontWeight: 700,
              align: "center",
            },
            sub: {
              color: T.C.mut,
              fontFamily: "IBM Plex Sans Arabic",
              fontSize: T.fs(su, compact ? 10 : 11.5),
              align: "center",
              padding: [T.fs(su, 2), 0, 0, 0],
            },
          },
        };
      }
      return item;
    });

    const c = T.chart(cid("licenseGrowthBridge", opts), el);
    c.setOption(Object.assign(T.base(su), {
      grid: {
        top: T.fs(su, compact ? 40 : 52),
        bottom: T.fs(su, compact ? 22 : 34),
        /* هامش أيسر يتسع لإعلان الطرف فوق آخر عمود (لا قصّ) */
        left: T.fs(su, compact ? 26 : 34),
        right: T.fs(su, compact ? 12 : 16),
        containLabel: true,
      },
      xAxis: T.catXAxis(su, catsShort, {
        axisLabel: {
          color: T.C.mut, fontFamily: "Cairo",
          fontSize: T.fs(su, compact ? 10 : 11),
          interval: 1,                 // كل شهر ثانٍ — إصلاح تزاحم التسميات
          rotate: compact ? 0 : 28,
        },
      }),
      yAxis: T.valAxis(su, isBeds ? axisK : fmt.int, Object.assign(
        { min: yMin, max: yMax, splitNumber: 2 },
        isBeds ? null : { minInterval: 1 })),
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "item",
        formatter: (p) => {
          const m = months[p.dataIndex];
          return T.ttTitle(m.label)
            + T.ttRow("صافي الإضافة",
              plusInt(m[meta.key]) + " " + meta.unit, T.C.green)
            + T.ttRow("التراكمي بعد الشهر", fmt.unitAfter(cums[p.dataIndex], meta.unit))
            + T.ttRow("حصة من إجمالي النمو",
              fmt.pct(pctOf(m[meta.key], meta.growthAbs)))
            + T.ttRow("خط الأساس", fmt.unitAfter(meta.base, meta.unit), T.C.gold);
        },
      }),
      series: [{
        name: meta.disp,
        type: "bar",
        color: T.C.green,
        barWidth: compact ? "56%" : "60%",
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        emphasis: softEmphasis(T.C.green),
        animationDelay: stagger(24),
        labelLayout: { hideOverlap: true },
        /* تسمية «+N» فوق كل عمود ثانٍ — العمود الأخير له إعلانه الغني أعلاه */
        label: {
          show: true,
          position: "top",
          color: T.C.greenHi,
          fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, compact ? 10 : 11.5),
          fontWeight: 600,
          formatter: (p) => (p.dataIndex % 2 === 0 && p.dataIndex !== adds.length - 1
            ? plusInt(adds[p.dataIndex])
            : ""),
        },
        /* خط الأساس الذهبي الرفيع المتقطع — صامت التسمية: القيمة معلنة في
           إعلان الطرف الغني وفي التلميح (إصلاح مراجعة الجولة 1: كانت الحبة
           داخل مساحة الرسم تغطي عموداً وتسمية شهر) */
        markLine: (() => {
          const ml = T.targetLine(su, meta.base, "");
          ml.lineStyle.width = 1.5;
          ml.label.show = false;
          return ml;
        })(),
        data: barData,
      }],
    }), true);

    a11y(el,
      "نمو " + meta.disp + ": من " + fmt.unitAfter(meta.base, meta.unit)
      + " عند " + rel.meta.baseline_label + " إلى "
      + fmt.unitAfter(meta.current, meta.unit) + " حالياً — إضافة "
      + fmt.unitAfter(meta.growthAbs, meta.unit) + " بنمو "
      + fmt.pct(meta.growthPct) + " عبر اثني عشر شهراً");

    srTable(el, "نمو " + meta.disp + " منذ خط الأساس — بيانات الرسم كاملة",
      ["الفترة", "صافي الإضافة", "التراكمي"],
      [[rel.meta.baseline_label, "—", fmt.int(meta.base)]]
        .concat(months.map((m, i) => [
          m.label,
          plusInt(m[meta.key]),
          fmt.int(cums[i]),
        ]))
        .concat([["الإجمالي حتى " + rel.meta.data_as_of,
          plusInt(meta.growthAbs), fmt.int(meta.current)]]));

    /* التنقل المفاتيحي يمشط أعمدة الأشهر مباشرة */
    keyNav(el, c, months.length, (i) => {
      if (c.isDisposed()) return;
      c.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: i });
    });
    return c;
  }

  /* ── التسجيل في مساحة الأسماء المشتركة (ملفات الرسوم الأخرى تدمج مثلها) ── */
  Object.assign(RH.viz.charts2, {
    cumulativeLicenses,
    monthlyNetIssuance,
    facilityTypes,
    sectorLicenseCompare,
    licenseGrowthBridge,
  });
})();
