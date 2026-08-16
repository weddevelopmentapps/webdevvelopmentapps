/* ════════════════════════════════════════════════════════════════════════════
   charts-control.js — مكتبة رسوم «الرقابة الميدانية» (RH.viz.charts2)
   ────────────────────────────────────────────────────────────────────────────
   ينفذ خمسة مُنشئين من القائمة القانونية في docs/V2_CONTRACTS.md §3:

     monthlyActivityDual   شبكتان مكدستان في مثيل واحد: الزيارات (أعلى، أخضر)
                           والمخالفات (أسفل، مرجاني) — **ليس** محورين على رسم
                           واحد أبداً؛ كلا المحورين مرسى عند الصفر، ومؤشر
                           المحور مرتبط بين الشبكتين فيقرأ الشهر الواحد معاً
     violationTypes        أعمدة أفقية: أنواع المخالفات الست (مرجاني — الخلل
                           حصراً) بتسمياتها الكاملة دون بتر، مرتبة تنازلياً،
                           مع الحصة والتراكمي في التلميح
     sectorViolationsBars  أعمدة قطاعية: المخالفات (مرجاني) بوسم عدد المراقبين
                           فوق كل عمود + مبدّل مقياس مدمج (مراقبون/إغلاقات)
                           قابل للتركيز بلوحة المفاتيح — إعادة تلوين بلا هدم
     complianceCard        عرض قيمة معدل الامتثال المورّد 81.6٪: رقم بطولي +
                           شريط نسبة أفقي (لا gauge دائري إطلاقاً) بوسم ذهبي
                           «قيمة مورّدة — بانتظار اعتماد المنهجية» من
                           compliance.status، والملاحظة الكاملة ظاهرة ومُتاحة
     closuresBars          أعمدة قطاعية: قرارات الإغلاق (أزرق — فئة ثانوية؛
                           الإغلاق إجراء إنفاذ لا خللاً، فلا يلبس المرجاني)

   العقد الموحد: RH.viz.charts2.<name>(el, su, opts?) → مثيل ECharts.
   المثيل يُنشأ حصراً عبر سجل الثيم RH.viz.theme.chart("c2:"+name[+":"+key], el)
   — السجل يتخلص من المثيل المستبدل، وresizeAll/disposeAll يبقيان صالحين.

   قواعد غير قابلة للتفاوض (مطبقة حرفياً هنا):
   • كل البيانات من RH.data.store.release()/.der() — لا قيمة مختلقة إطلاقاً.
   • كل رقم ظاهر عبر RH.core.fmt (أرقام لاتينية، فواصل آلاف، ٪ عربية معزولة،
     تطابق العدد والمعدود عبر fmt.noun/countNoun).
   • كل نص إصدار يمر إلى HTML التلميح عبر theme.esc/ttRow/ttTitle حصراً.
   • منظومة المعنى: أخضر = طاقة/قدرة نتحكم بها (ومنها المراقبون — مطابق لطبقة
     inspectors في geomap)، مرجاني = عجز/مخالفات حصراً، ذهبي = مستهدف/خط أساس
     ووسوم «بانتظار الاعتماد» حصراً، أزرق = فئة تصنيفية ثانوية (الإغلاقات).
   • لا محاور مزدوجة أبداً — مقياسا الزيارات والمخالفات مختلفا النطاق فيعيشان
     في شبكتين grid منفصلتين داخل المثيل الواحد (monthlyActivityDual).
   • أعمدة مرساة عند الصفر دائماً (min: 0 صريح) — لا بتر محور يضخم الفروق.
   • حركة الدخول من theme.base(su) وتُعطَّل تلقائياً مع prefers-reduced-motion؛
     لا حركة مستمرة للبيانات بعد الاستقرار.
   • المحاور بأدوات الثيم (اتجاه RTL معكوس، محور القيم على اليمين)، وكل
     المقاسات مدرّجة بوحدة su، والأرقام بخط جدولي (IBM Plex Sans Arabic).
   • وسيلة إيضاح عند ≥ سلسلتين؛ تسميات مباشرة انتقائية (الذروة/الأطراف) لا
     رقماً فوق كل نقطة؛ كل مضيف رسم قابل للتركيز وله بديل جدولي كامل.
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
  const round0 = (v) => RH.data.derive.roundHalfUp(v, 0);
  const round1 = (v) => RH.data.derive.roundHalfUp(v, 1);

  /* ──────────────────────────────────────────────────────────────────────────
     أدوات مشتركة صغيرة — كل شيء مدرّج بوحدة su (عرض المسرح ÷ 1920).
     مكررة عمداً ملفاً بملف (عقد ملفات الرسوم المستقلة) كما في charts-supply.
     ────────────────────────────────────────────────────────────────────────── */

  /** معرف السجل الموحد: "c2:<name>[:<key>]" — key يسمح بمثيلين للمُنشئ الواحد
      (مثال: نسخة مصغرة في الملخص التنفيذي ونسخة كاملة في قسم الرقابة) */
  function cid(name, opts) {
    return "c2:" + name + (opts && opts.key ? ":" + opts.key : "");
  }

  /** منسق محور الأعداد الصحيحة (زيارات/مخالفات/قرارات — نطاقات دون الآلاف
      العشرة فالصيغة المختصرة لا تلزم): فاصل آلاف لاتيني عبر fmt.int */
  const axisInt = (v) => fmt.int(v);

  /** منسق محور النسب: منزلة واحدة وعلامة ٪ العربية المعزولة اتجاهياً */
  const axisPct = (v) => fmt.pct(v);

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

  /** نمط نص تحريري (Cairo) للتسميات والأسماء */
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

  /** شبكة رسم متجاوبة: هوامش su-مدرّجة مع نمط مدمج للبطاقات الصغيرة */
  function gridBox(su, compact, o) {
    const g = {
      top: T.fs(su, compact ? 30 : 44),
      bottom: T.fs(su, compact ? 26 : 36),
      left: T.fs(su, compact ? 10 : 16),
      right: T.fs(su, compact ? 46 : 66),
      containLabel: false,
    };
    return Object.assign(g, o || {});
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

  /** وسم زاوي ذهبي داخل الرسم — للبيانات المورّدة غير المعتمدة حصراً.
      الذهبي هنا لكنة كروم (وسوم «بانتظار الاعتماد» في tokens.css) لا قيمة بيانات */
  function caveatBadge(su, text) {
    return {
      type: "text",
      left: T.fs(su, 8),
      top: T.fs(su, 4),
      silent: true,
      style: {
        text: text,
        fill: T.C.gold,
        fontFamily: "Cairo",
        fontSize: T.fs(su, 12),
        fontWeight: 600,
        opacity: 0.92,
      },
      z: 60,
    };
  }

  /** تحويل لون سداسي إلى rgba بشفافية — لخلفيات أزرار المبدّل الزجاجية
      (كروم واجهة لا علامة بيانات؛ الصبغة نفسها تبقى هوية المقياس) */
  function hexA(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
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
      وEscape يخفيه. المضيف يحمل data-interactive وفق عقد المحرك (القسم 4 من
      V2_CONTRACTS) فلا تتقدم الأسهم بالعرض أثناء تركيز الرسم — التنقل بين
      المشاهد يبقى متاحاً بمجرد مغادرة التركيز. المحور معكوس (RTL): النقطة
      الأولى في أقصى اليمين، فالسهم الأيسر يتقدم والأيمن يتراجع. */
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

  /** مُظهِر تلميح افتراضي للتنقل المفاتيحي: يبرز نقطة السلسلة المحددة */
  function tipShower(chart, seriesIndex) {
    return (i) => {
      if (chart.isDisposed()) return;
      chart.dispatchAction({ type: "showTip", seriesIndex: seriesIndex, dataIndex: i });
    };
  }

  /** حارس اتساق تطويري: متطابقات الإصدار التي تتكئ عليها الرسوم — مرآة مخففة
      لبوابات validate.js. فشل فحص لا يُسقط اللوحة (الإصدار المنشور اجتاز
      البوابات أصلاً) بل ينبه في وحدة التحكم لالتقاط أي انجراف بيانات مبكراً. */
  function guard(name, checks) {
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("charts-control/" + name + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /** تسميات الأشهر: كاملة افتراضياً، ومختصرة (بلا سنة) في الوضع المدمج —
      السنة تبقى حاضرة في التلميح بالتسمية الكاملة دائماً */
  function monthCats(rows, short) {
    return rows.map((r) => (short ? r.label.replace(/\s+\d{4}$/, "") : r.label));
  }

  /** فهرس أول قيمة عظمى في مصفوفة (قاعدة كسر التعادل الموحدة: الأول يفوز —
      مرآة byRaw في derive.js) — للتسميات المباشرة الانتقائية على الذروة */
  function maxIdx(values) {
    let best = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[best]) best = i;
    }
    return best;
  }

  /** فرق شهري موقَّع للتلميح: «+13» بعزل اتجاهي حتمي أو «−197» عبر fmt.int */
  function signedDelta(d) {
    if (d == null) return "—";
    if (d > 0) return fmt.iso("+" + fmt.int(d));
    return fmt.int(d); // fmt.int يتكفل بإشارة السالب الحقيقية − والصفر
  }

  /** السلسلتان التراكميتان للنشاط الرقابي — جمع جارٍ صرف على قيم الإصدار
      (لا تقريب فلا انحراف): آخر نقطة في كل سلسلة تساوي الإجمالي المعتمد،
      وهذه متطابقة محروسة في monthlyActivityDual ومكشوفة للاختبارات عبر
      _controlInternals لتثبيت تساوي المخرجين python/JS نقطةً نقطة */
  function cumControlSeries(rows) {
    const v = [], f = [];
    let a = 0, b = 0;
    for (const r of rows) {
      a += r.visits;
      b += r.violations;
      v.push(a);
      f.push(b);
    }
    return { visits: v, violations: f };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) monthlyActivityDual — النشاط الرقابي الشهري (شبكتان مكدستان)
     ──────────────────────────────────────────────────────────────────────────
     الزيارات (~1,500–1,800 شهرياً) والمخالفات (~280–320 شهرياً) مقياسان
     مختلفا النطاق — دمجهما على محور واحد يسحق المخالفات، ومحوران على رسم
     واحد ممنوعان قطعياً (يسمحان بأي قصة عبر ضبط النسب). الحل القانوني:
     لوحتان مكدستان داخل مثيل واحد، لكلٍّ محور قيم خاص مرسى عند الصفر،
     ومؤشر المحور مرتبط بينهما فيقرأ المحلل الشهر الواحد في اللوحتين معاً.
     الأخضر للزيارات (قدرة رقابية نتحكم بها) والمرجاني للمخالفات (خلل حصراً).
     تسمية مباشرة انتقائية: قيمة شهر الذروة فقط في كل لوحة — لا رقم فوق كل
     عمود. خط المتوسط الشهري للزيارات (من der.avg_monthly_visits) بصبغة
     السلسلة نفسها خافتةً — ليس ذهبياً لأنه ليس مستهدفاً ولا خط أساس.
     وسيلة الإيضاح حاضرة (سلسلتان) لكن بلا تبديل — إخفاء سلسلة هنا يترك
     لوحة كاملة فارغة، والهوية مؤكدة أيضاً بعنوان كل لوحة المجاور لها.
     وضعان للقراءة (opts.mode):
       "monthly" (افتراضي)  أعمدة شهرية — قراءة الإيقاع والذروة
       "cumulative"          مساحتان تراكميتان — قراءة معدل الإنجاز حتى تاريخه؛
                             آخر نقطة في كل لوحة تساوي حتماً الإجمالي المعتمد
                             (متطابقة محروسة) فالمنحنى لا يعد بما لم يقع
     opts: { key?, compact?, mode? }
     ══════════════════════════════════════════════════════════════════════════ */
  function monthlyActivityDual(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const cumulative = opts.mode === "cumulative";

    const rows = rel.monthly.monitoring;
    const totVisits = rel.metrics.total_visits.value;
    const totViol = rel.metrics.total_violations.value;
    const visits = rows.map((r) => r.visits);
    const viols = rows.map((r) => r.violations);
    const cum = cumControlSeries(rows);
    const avgVisits = der.avg_monthly_visits;

    /* متطابقات الإصدار: المجاميع الشهرية تطابق الإجماليات المعتمدة (R1)،
       وآخر نقطة تراكمية تساويها حتماً — المنحنى التراكمي لا يكذب طرفاً */
    guard("monthlyActivityDual", {
      "مجموع الزيارات الشهرية = الإجمالي المعتمد":
        visits.reduce((a, v) => a + v, 0) === totVisits,
      "مجموع المخالفات الشهرية = الإجمالي المعتمد":
        viols.reduce((a, v) => a + v, 0) === totViol,
      "آخر تراكمي زيارات = الإجمالي المعتمد":
        cum.visits[cum.visits.length - 1] === totVisits,
      "آخر تراكمي مخالفات = الإجمالي المعتمد":
        cum.violations[cum.violations.length - 1] === totViol,
      "12 شهراً كاملة": rows.length === 12,
      "لا قيمة سالبة (مرساة الصفر صادقة)":
        visits.every((v) => v >= 0) && viols.every((v) => v >= 0),
    });

    const cats = monthCats(rows, compact);
    const iMaxV = maxIdx(visits);   // ذروة الزيارات (أول الأقصى عند التعادل)
    const iMaxF = maxIdx(viols);    // ذروة المخالفات

    const NAME_V = "الزيارات الميدانية";
    const NAME_F = "المخالفات المسجلة";

    /* هندسة اللوحتين: أرقام su أعلى الشاشة ونسب مئوية للحدود الداخلية —
       يصمد التقسيم في كل مقاسات المضيف دون قياس DOM (البناء قد يتم منفصلاً) */
    const grid0 = {
      top: T.fs(su, compact ? 52 : 64),
      height: compact ? "26%" : "27%",
      left: T.fs(su, compact ? 12 : 16),
      right: T.fs(su, compact ? 48 : 64),
      containLabel: false,
    };
    const grid1 = {
      top: compact ? "60%" : "58%",
      bottom: T.fs(su, compact ? 26 : 42),
      left: grid0.left,
      right: grid0.right,
      containLabel: false,
    };

    /* عنوانا اللوحتين مع إجماليي الفترة — تطابق العدد والمعدود عبر fmt.noun */
    const cap0 = cumulative
      ? NAME_V + " تراكمياً — " + fmt.noun(totVisits, "visit") + " بنهاية الفترة"
      : NAME_V + " — " + fmt.noun(totVisits, "visit") + " خلال الفترة";
    const cap1 = cumulative
      ? NAME_F + " تراكمياً — " + fmt.noun(totViol, "violation") + " بنهاية الفترة"
      : NAME_F + " — " + fmt.noun(totViol, "violation") + " خلال الفترة";

    /* تسمية مباشرة انتقائية: الذروة فقط (لا رقم فوق كل عمود — قاعدة صارمة) */
    const peakLabel = (peakAt, color) => Object.assign({
      show: !compact,
      position: "top",
      formatter: (p) => (p.dataIndex === peakAt ? fmt.int(p.value) : ""),
    }, numStyle(su, 12, color, 700));

    /* لوحة شهرية: أعمدة مرساة عند الصفر بذروة موسومة (+ متوسط الزيارات) */
    const barPanel = (name, data, hue, hiColor, gridIdx, peakAt) => ({
      name: name,
      type: "bar",
      xAxisIndex: gridIdx,
      yAxisIndex: gridIdx,
      color: hue,
      barWidth: "52%",
      itemStyle: { borderRadius: [3, 3, 0, 0] },
      emphasis: softEmphasis(hue),
      labelLayout: { hideOverlap: true },
      label: peakLabel(peakAt, hiColor),
      data: data,
    });

    /* لوحة تراكمية: مساحة متدرجة من صبغة اللوحة الواحدة تتلاشى نحو الأرضية،
       والتسمية الطرفية تعلن الإجمالي المعتمد عند نهاية الخط (طرف RTL الأيسر) */
    const cumPanel = (name, data, hue, lineColor, gridIdx, total) => ({
      name: name,
      type: "line",
      xAxisIndex: gridIdx,
      yAxisIndex: gridIdx,
      color: lineColor,
      z: 10,
      symbol: "circle",
      symbolSize: T.fs(su, compact ? 4.5 : 6),
      showSymbol: !compact,
      itemStyle: { color: lineColor, borderColor: T.C.stage1, borderWidth: 1 },
      lineStyle: { width: compact ? 2.5 : 3, color: lineColor },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: hexA(hue, 0.30) },
          { offset: 1, color: hexA(hue, 0.02) },
        ]),
      },
      emphasis: { focus: "none", scale: 1.5 },
      endLabel: Object.assign({
        show: !compact,
        distance: T.fs(su, 8),
        formatter: () => fmt.int(total),
      }, numStyle(su, 13.5, lineColor, 700)),
      labelLayout: { hideOverlap: true },
      data: data,
    });

    const c = T.chart(cid("monthlyActivityDual", opts), el);
    c.setOption(Object.assign(T.base(su), {
      /* وسيلة الإيضاح: سلسلتان → حاضرة إلزاماً؛ التبديل معطل عمداً لأن إخفاء
         سلسلة يفرغ لوحة كاملة (الهوية مضمونة بالعنوانين المجاورين أيضاً) */
      legend: legendBox(su, [NAME_V, NAME_F], {
        selectedMode: false,
        textStyle: txtStyle(su, compact ? 12 : 13, T.C.ink2),
      }),
      title: [
        {
          text: cap0,
          right: grid0.right,
          top: T.fs(su, compact ? 28 : 36),
          textStyle: txtStyle(su, compact ? 11.5 : 13, T.C.mut, 600),
        },
        {
          text: cap1,
          right: grid0.right,
          top: compact ? "52%" : "50%",
          textStyle: txtStyle(su, compact ? 11.5 : 13, T.C.mut, 600),
        },
      ],
      grid: [grid0, grid1],
      /* ربط مؤشري المحورين: تحويم على أي لوحة يضيء الشهر نفسه في الأخرى */
      axisPointer: { link: [{ xAxisIndex: "all" }] },
      xAxis: [
        /* اللوحة العليا: الفئات نفسها بلا تسميات (تظهر مرة واحدة أسفل)؛
           في الوضع التراكمي يلتصق الخط بحافتي الشبكة (boundaryGap:false) */
        T.catXAxis(su, cats, {
          gridIndex: 0,
          axisLabel: { show: false },
          axisTick: { show: false },
          boundaryGap: !cumulative,
        }),
        T.catXAxis(su, cats, {
          gridIndex: 1,
          axisLabel: {
            color: T.C.mut, fontFamily: "Cairo",
            fontSize: T.fs(su, compact ? 10.5 : 11.5),
            interval: compact ? "auto" : 0,
            rotate: compact ? 0 : 32,
          },
          boundaryGap: !cumulative,
        }),
      ],
      yAxis: [
        /* مرساة الصفر الصريحة في المحورين — أعمدة بلا بتر مقياس أبداً */
        T.valAxis(su, axisInt, { gridIndex: 0, min: 0 }),
        T.valAxis(su, axisInt, { gridIndex: 1, min: 0 }),
      ],
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(244,241,230,.045)" } },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          const r = rows[i];
          if (cumulative) {
            /* قراءة «حتى تاريخه»: التراكمي + إضافة الشهر + نسبة الإنجاز
               من إجمالي الفترة المعتمد — بنفس تقريب المرآة */
            return T.ttTitle(r.label)
              + T.ttRow("الزيارات تراكمياً", fmt.noun(cum.visits[i], "visit"), T.C.greenHi)
              + T.ttRow("زيارات الشهر", fmt.iso("+" + fmt.int(r.visits)))
              + T.ttRow("من زيارات الفترة", fmt.pct(pctOf(cum.visits[i], totVisits)))
              + T.ttRow("المخالفات تراكمياً", fmt.noun(cum.violations[i], "violation"), T.C.coral)
              + T.ttRow("مخالفات الشهر", fmt.iso("+" + fmt.int(r.violations)))
              + T.ttRow("من مخالفات الفترة", fmt.pct(pctOf(cum.violations[i], totViol)));
          }
          const dV = i > 0 ? r.visits - rows[i - 1].visits : null;
          const dF = i > 0 ? r.violations - rows[i - 1].violations : null;
          return T.ttTitle(r.label)
            + T.ttRow(NAME_V, fmt.noun(r.visits, "visit"), T.C.green)
            + T.ttRow("تغير الزيارات", signedDelta(dV))
            + T.ttRow("حصة الشهر من الزيارات", fmt.pct(pctOf(r.visits, totVisits)))
            + T.ttRow(NAME_F, fmt.noun(r.violations, "violation"), T.C.coral)
            + T.ttRow("تغير المخالفات", signedDelta(dF))
            + T.ttRow("حصة الشهر من المخالفات", fmt.pct(pctOf(r.violations, totViol)));
        },
      }),
      series: cumulative
        ? [
          cumPanel(NAME_V, cum.visits, T.C.green, T.C.greenHi, 0, totVisits),
          cumPanel(NAME_F, cum.violations, T.C.coral, T.C.coral, 1, totViol),
        ]
        : [
          Object.assign(barPanel(NAME_V, visits, T.C.green, T.C.greenHi, 0, iMaxV), {
            /* المتوسط الشهري من المشتقات المنشورة — بصبغة السلسلة خافتةً:
               ليس مستهدفاً ولا خط أساس فلا يجوز له الذهبي */
            markLine: {
              silent: true,
              symbol: "none",
              lineStyle: { color: "rgba(49,162,109,.55)", width: 1.5, type: "dashed" },
              label: {
                show: !compact,
                position: "insideStartTop",
                color: T.C.mut,
                fontFamily: "Cairo",
                fontSize: T.fs(su, 11.5),
                formatter: "متوسط شهري " + fmt.noun(avgVisits, "visit"),
              },
              data: [{ yAxis: avgVisits }],
            },
          }),
          barPanel(NAME_F, viols, T.C.coral, T.C.coral, 1, iMaxF),
        ],
    }), true);

    a11y(el, cumulative
      ? "النشاط الرقابي تراكمياً في لوحتين منفصلتين: بلغت الزيارات "
        + fmt.noun(totVisits, "visit") + " والمخالفات "
        + fmt.noun(totViol, "violation") + " بنهاية "
        + String(rows[rows.length - 1].label)
      : "النشاط الرقابي الشهري في لوحتين منفصلتين: "
        + fmt.noun(totVisits, "visit") + " و" + fmt.noun(totViol, "violation")
        + " خلال 12 شهراً؛ ذروة الزيارات في " + String(rows[iMaxV].label)
        + " بواقع " + fmt.noun(visits[iMaxV], "visit")
        + " وذروة المخالفات في " + String(rows[iMaxF].label)
        + " بواقع " + fmt.noun(viols[iMaxF], "violation")
        + "؛ المتوسط الشهري " + fmt.noun(avgVisits, "visit"));

    /* البديل الجدولي يحمل القراءتين معاً (شهري + تراكمي) مهما كان الوضع */
    srTable(el, "النشاط الرقابي الشهري — بيانات اللوحتين كاملة",
      ["الشهر", "الزيارات الميدانية", "الزيارات تراكمياً",
        "المخالفات المسجلة", "المخالفات تراكمياً"],
      rows.map((r, i) => [
        r.label,
        fmt.noun(r.visits, "visit"),
        fmt.noun(cum.visits[i], "visit"),
        fmt.noun(r.violations, "violation"),
        fmt.noun(cum.violations[i], "violation"),
      ]));

    /* التنقل المفاتيحي يمشط الأشهر — التلميح المحوري يعرض اللوحتين معاً */
    keyNav(el, c, rows.length, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) violationTypes — أنواع المخالفات (أعمدة أفقية مرجانية)
     ──────────────────────────────────────────────────────────────────────────
     سلسلة واحدة بلون الخلل الحصري الواحد → لا وسيلة إيضاح (قاعدة صارمة).
     التسميات الكاملة دون بتر مطلب صريح من المواصفة: الأسماء طويلة
     («الاكتظاظ وتجاوز الطاقة الاستيعابية») والأفقي هو الشكل الوحيد الذي
     يحملها كاملة — الهامش الأيمن مقدَّر لأطول اسم بلا truncate إطلاقاً.
     ترتيب تنازلي على الخام، تسمية قيمة مباشرة عند طرف كل عمود (هنا كل
     الأعمدة قليلة فالتسمية الشاملة مقروءة لا ضجيج)، والحصة والتراكمي
     في التلميح — قراءة باريتو: أعلى نوعين يجاوزان نصف المخالفات.
     opts: { key?, compact?, share? (إظهار الحصة في التسمية — افتراضي true) }
     ══════════════════════════════════════════════════════════════════════════ */
  function violationTypes(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const compact = !!opts.compact;
    const withShare = opts.share !== false;
    const total = rel.metrics.total_violations.value;

    const rows = rel.violation_types.slice()
      .sort((a, b) => b.count - a.count);

    /* الحصص والتراكمي — كلها عبر مرآة التقريب المركزية */
    const shares = rows.map((r) => pctOf(r.count, total));
    const cums = [];
    let acc = 0;
    for (const r of rows) {
      acc += r.count;
      cums.push(acc);
    }

    /* مجموع الأنواع الستة يساوي إجمالي المخالفات المعتمد — متطابقة الإصدار */
    guard("violationTypes", {
      "مجموع الأنواع = إجمالي المخالفات": acc === total,
      "ستة أنواع كما في الإصدار": rows.length === rel.violation_types.length,
      "لا عدد سالب": rows.every((r) => r.count >= 0),
    });

    /* محور الفئات بتسميات كاملة: بلا width → overflow:none في مساعد الثيم.
       الوضع المدمج يصغّر الخط فقط — البتر ممنوع في الوضعين */
    const yAx = T.hCatAxis(su, rows.map((r) => r.name));
    if (compact) yAx.axisLabel.fontSize = T.fs(su, 12);

    const c = T.chart(cid("violationTypes", opts), el);
    c.setOption(Object.assign(T.base(su), {
      grid: gridBox(su, compact, {
        top: T.fs(su, 6),
        bottom: T.fs(su, compact ? 24 : 30),
        left: T.fs(su, compact ? 96 : 140),
        right: T.fs(su, compact ? 214 : 268),
      }),
      /* مرساة الصفر صريحة رغم أنها افتراضية للأعمدة — عقد لا مصادفة */
      /* splitNumber مخفض في الوضع المدمج: بطاقة الملخص الضيقة كانت تكدس
         تسميات المحور القيمي فوق بعضها («1,000 800 600…» متراكبة) */
      xAxis: Object.assign(T.hValAxis(su, axisInt),
        { min: 0, splitNumber: compact ? 3 : 5 }),
      yAxis: yAx,
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          const r = rows[p.dataIndex];
          return T.ttTitle(r.name)
            + T.ttRow("العدد", fmt.noun(r.count, "violation"), T.C.coral)
            + T.ttRow("من إجمالي المخالفات", fmt.pct(shares[p.dataIndex]))
            + T.ttRow("تراكمياً حتى هذا النوع",
              fmt.pct(pctOf(cums[p.dataIndex], total)));
        },
      }),
      series: [{
        type: "bar",
        data: rows.map((r) => r.count),
        color: T.C.coral,
        barWidth: compact ? "52%" : "58%",
        itemStyle: { borderRadius: [6, 0, 0, 6] },
        emphasis: softEmphasis(T.C.coral),
        labelLayout: { hideOverlap: true },
        label: Object.assign({
          show: true,
          position: "left",
          formatter: (p) => (withShare && !compact)
            ? fmt.int(p.value) + "  " + fmt.pct(shares[p.dataIndex])
            : fmt.int(p.value),
        }, numStyle(su, compact ? 12 : 13.5, T.C.ivory)),
      }],
    }), true);

    a11y(el,
      "أنواع المخالفات مرتبة تنازلياً: يتصدر " + String(rows[0].name)
      + " بواقع " + fmt.noun(rows[0].count, "violation") + " أي "
      + fmt.pct(shares[0]) + " من إجمالي " + fmt.noun(total, "violation")
      + "؛ أعلى نوعين معاً " + fmt.pct(pctOf(cums[1], total)));

    srTable(el, "أنواع المخالفات المسجلة — بيانات الرسم كاملة",
      ["النوع", "العدد", "الحصة", "التراكمي"],
      rows.map((r, i) => [
        r.name,
        fmt.noun(r.count, "violation"),
        fmt.pct(shares[i]),
        fmt.pct(pctOf(cums[i], total)),
      ]));

    keyNav(el, c, rows.length, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) sectorViolationsBars — المخالفات قطاعياً + مبدّل المقياس
     ──────────────────────────────────────────────────────────────────────────
     المشهد الافتراضي: أعمدة المخالفات (مرجاني — الخلل حصراً) وفوق كل عمود
     وسم عدد المراقبين (مطلب المواصفة: قراءة «حجم الخلل مقابل القدرة
     الرقابية» في نظرة واحدة — رؤية cd2 عن اختلال التوزيع تُقرأ من هنا).
     المبدّل المدمج يقلب المقياس إلى المراقبين (أخضر — قدرة نتحكم بها،
     مطابق لطبقة inspectors في geomap) أو قرارات الإغلاق (أزرق — إجراء
     إنفاذ، فئة ثانوية لا خلل) بإعادة تلوين للمثيل نفسه دون هدم.
     أزرار المبدّل كروم واجهة: نص بألوان الحبر دائماً، ونقطة بلون المقياس
     تحمل الهوية (النص لا يلبس لون السلسلة أبداً — قاعدة صارمة). المضيف
     يحمل عنصر <span> لا <div> عمداً: dashboard.css يمدد كل <div> مباشر
     في .chart-host إلى كامل المساحة (عقد مضيف ECharts) فيحجب اللوحة.
     التلميح يعرض المقاييس الثلاثة معاً مهما كان المقياس الظاهر + الحصص
     من المشتقات المنشورة + متوسط المخالفات لكل مراقب (حساب شفاف بنفس
     تقريب derive) — كثافة قرار لا زخرفة.
     opts: { key?, compact?, measure? ("violations"|"monitors"|"closures"),
             toggle? (افتراضي true), sort? ("value" ترتيب تنازلي حي) }
     يعيد مثيل ECharts مزوداً بواجهة برمجية صغيرة:
       c.setMeasure(id) — تبديل المقياس برمجياً (تستعمله الأقسام إن شاءت)
       c.measure()      — معرف المقياس الظاهر حالياً
     ══════════════════════════════════════════════════════════════════════════ */
  function sectorViolationsBars(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const withToggle = opts.toggle !== false;
    const liveSort = opts.sort === "value";

    const sectors = rel.sectors;
    const totViol = rel.metrics.total_violations.value;
    const totMon = rel.metrics.total_monitors.value;
    const totClo = rel.metrics.total_closures.value;

    /* المقاييس الثلاثة القانونية — الترتيب ترتيب الأزرار في المبدّل.
       الألوان دلالية لا جمالية: مرجاني=خلل، أخضر=قدرة، أزرق=فئة ثانوية */
    const MEASURES = [
      { id: "violations", label: "المخالفات", color: T.C.coral,
        field: "violations", total: totViol, nounKey: "violation" },
      { id: "monitors", label: "المراقبون", color: T.C.green,
        field: "monitors", total: totMon, nounKey: "monitor" },
      { id: "closures", label: "قرارات الإغلاق", color: T.C.blue,
        field: "closures", total: totClo, nounKey: "decision" },
    ];
    const byId = {};
    MEASURES.forEach((m) => { byId[m.id] = m; });

    /* متطابقات الإصدار: مجاميع القطاعات تطابق الإجماليات المعتمدة الثلاثة */
    guard("sectorViolationsBars", {
      "مجموع مخالفات القطاعات = الإجمالي":
        sectors.reduce((a, s) => a + s.violations, 0) === totViol,
      "مجموع المراقبين = الإجمالي":
        sectors.reduce((a, s) => a + s.monitors, 0) === totMon,
      "مجموع الإغلاقات = الإجمالي":
        sectors.reduce((a, s) => a + s.closures, 0) === totClo,
      "خمسة قطاعات": sectors.length === 5,
    });

    /* ترتيب العرض الحي: تنازلي على قيم المقياس الظاهر (الترتيب على الخام)،
       أو الترتيب القانوني كما في الإصدار. view متغير مغلق تقرأه التلميحات */
    let view = sectors.slice();
    let current = byId[opts.measure] ? opts.measure : "violations";

    const orderFor = (m) => liveSort
      ? sectors.slice().sort((a, b) => b[m.field] - a[m.field])
      : sectors.slice();

    /* تسمية العمود: القيمة دائماً، وتحتها عدد المراقبين في مشهد المخالفات
       حصراً (rich text: الرقم جدولي والوسم تحريري خافت) */
    const labelFor = (m) => ({
      show: !compact,
      position: "top",
      formatter: (p) => {
        const s = view[p.dataIndex];
        const val = fmt.int(s[m.field]);
        if (m.id !== "violations") return val;
        return "{v|" + val + "}\n{m|" + fmt.noun(s.monitors, "monitor") + "}";
      },
      rich: {
        v: {
          color: T.C.ivory, fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, 13.5), fontWeight: 700, align: "center",
        },
        m: {
          color: T.C.mut, fontFamily: "Cairo",
          fontSize: T.fs(su, 10.5), align: "center",
          padding: [T.fs(su, 2), 0, 0, 0],
        },
      },
      color: T.C.ivory,
      fontFamily: "IBM Plex Sans Arabic",
      fontSize: T.fs(su, 13),
      fontWeight: 700,
    });

    const a11yFor = (m) => {
      /* أول الأقصى بترتيب الإصدار — قاعدة كسر التعادل الموحدة (مرآة byRaw) */
      let top = sectors[0];
      for (const s of sectors) if (s[m.field] > top[m.field]) top = s;
      return m.label + " حسب القطاع: الأعلى " + String(top.name) + " بواقع "
        + fmt.noun(top[m.field], m.nounKey)
        + " من إجمالي " + fmt.noun(m.total, m.nounKey)
        + (m.id === "violations"
          ? "؛ حصة قطاع الجنوب " + fmt.pct(der.sector.south.violations_share_pct)
          : "");
    };

    const c = T.chart(cid("sectorViolationsBars", opts), el);

    /* الخيار الثابت (لا يتغير مع التبديل): الشبكة والتلميح والمحور القيمي */
    c.setOption(Object.assign(T.base(su), {
      /* top ≥ 72px مع المبدّل: أعلى عمود ووسمه يخلوان من رقاقات المبدّل
         (إصلاح المراجعة: كانت الرقاقات تحجب قيمة عمود الجنوب) */
      grid: gridBox(su, compact, {
        top: T.fs(su, compact ? 34 : (withToggle ? 80 : 40)),
        bottom: T.fs(su, compact ? 26 : 34),
        left: T.fs(su, 14),
        right: T.fs(su, compact ? 48 : 66),
      }),
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(244,241,230,.045)" } },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          const s = view[i];
          const sd = der.sector[s.id];
          /* متوسط المخالفات لكل مراقب: حساب شفاف بنفس تقريب المرآة —
             القسمة على المراقبين آمنة (كل قطاع ≥ 3 مراقبين في الإصدار) */
          const perMon = round0(s.violations / s.monitors);
          return T.ttTitle(s.name)
            + T.ttRow("المخالفات", fmt.noun(s.violations, "violation"), T.C.coral)
            + T.ttRow("حصة القطاع من المخالفات", fmt.pct(sd.violations_share_pct))
            + T.ttRow("المراقبون", fmt.noun(s.monitors, "monitor"), T.C.green)
            + T.ttRow("متوسط المخالفات لكل مراقب", fmt.int(perMon))
            + T.ttRow("قرارات الإغلاق", fmt.noun(s.closures, "decision"), T.C.blue)
            + T.ttRow("الزيارات الميدانية", fmt.noun(s.visits, "visit"))
            + T.ttRow("حصة القطاع من الزيارات", fmt.pct(sd.visits_share_pct));
        },
      }),
      yAxis: T.valAxis(su, axisInt, { min: 0 }),   // مرساة الصفر الصريحة
      xAxis: T.catXAxis(su, []),                   // تُملأ في apply()
      series: [{ type: "bar", data: [] }],         // كذلك
    }), true);

    /* تطبيق مقياس: إعادة تلوين وتسمية للمثيل نفسه — لا هدم ولا إنشاء */
    function apply(measureId) {
      const m = byId[measureId] || byId.violations;
      current = m.id;
      view = orderFor(m);
      c.setOption({
        xAxis: T.catXAxis(su, view.map((s) => s.short)),
        series: [{
          type: "bar",
          name: m.label,
          data: view.map((s) => s[m.field]),
          color: m.color,
          barWidth: compact ? "38%" : "42%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          emphasis: softEmphasis(m.color),
          labelLayout: { hideOverlap: true },
          label: labelFor(m),
        }],
      });
      a11y(el, a11yFor(m));
      syncButtons();
    }

    /* ── مبدّل المقياس المدمج: كروم واجهة قابل للتركيز بلوحة المفاتيح ──
       <span> حاوية (لا <div> — انظر رأس المُنشئ) بأزرار حقيقية aria-pressed.
       الانتقالات تحترم prefers-reduced-motion (تُصفَّر عند T.REDUCED). */
    const btns = [];
    function syncButtons() {
      for (const b of btns) {
        const active = b.dataset.measure === current;
        const m = byId[b.dataset.measure];
        b.setAttribute("aria-pressed", active ? "true" : "false");
        b.style.color = active ? T.C.ivory : T.C.mut;
        b.style.borderColor = active ? m.color : "rgba(244,241,230,.14)";
        b.style.background = active ? hexA(m.color, 0.13) : "rgba(16,32,26,.72)";
      }
    }
    if (withToggle && !compact) {
      const old = el.querySelector(":scope > .c2-measure-toggle");
      if (old) old.remove();
      const bar = document.createElement("span");
      bar.className = "c2-measure-toggle";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", "اختيار مقياس الأعمدة القطاعية");
      bar.style.cssText = "position:absolute;top:" + T.fs(su, 6) + "px;left:"
        + T.fs(su, 8) + "px;z-index:5;display:inline-flex;gap:"
        + T.fs(su, 6) + "px;";
      for (const m of MEASURES) {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.measure = m.id;
        b.setAttribute("aria-pressed", "false");
        b.style.cssText = "display:inline-flex;align-items:center;gap:"
          + T.fs(su, 6) + "px;padding:" + T.fs(su, 3) + "px " + T.fs(su, 10)
          + "px;border:1px solid rgba(244,241,230,.14);border-radius:999px;"
          + "background:rgba(16,32,26,.72);color:" + T.C.mut
          + ";font-family:Cairo,sans-serif;font-size:" + T.fs(su, 12)
          + "px;font-weight:600;cursor:pointer;"
          + (T.REDUCED ? "" :
            "transition:color 160ms ease,border-color 160ms ease,background 160ms ease;");
        const dot = document.createElement("i");
        dot.setAttribute("aria-hidden", "true");
        dot.style.cssText = "width:" + T.fs(su, 8) + "px;height:" + T.fs(su, 8)
          + "px;border-radius:50%;background:" + m.color + ";flex:none;";
        b.appendChild(dot);
        b.appendChild(document.createTextNode(m.label));
        b.addEventListener("click", () => apply(m.id));
        bar.appendChild(b);
        btns.push(b);
      }
      el.appendChild(bar);
    }

    apply(current);

    /* البديل الجدولي يحمل المقاييس الثلاثة معاً — مستقل عن المقياس الظاهر */
    srTable(el, "الرقابة الميدانية حسب القطاع — المخالفات والمراقبون والإغلاقات",
      ["القطاع", "المخالفات", "حصة المخالفات", "المراقبون", "قرارات الإغلاق", "الزيارات"],
      sectors.map((s) => [
        s.name,
        fmt.noun(s.violations, "violation"),
        fmt.pct(der.sector[s.id].violations_share_pct),
        fmt.noun(s.monitors, "monitor"),
        fmt.noun(s.closures, "decision"),
        fmt.noun(s.visits, "visit"),
      ]));

    keyNav(el, c, sectors.length, tipShower(c, 0));

    /* الواجهة البرمجية الصغيرة على المثيل — تستهلكها الأقسام إن أرادت ربط
       المبدّل بحالتها الخاصة (ctx.update) بدل أزرار الرسم المدمجة */
    c.setMeasure = apply;
    c.measure = () => current;
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) complianceCard — معدل الامتثال المورّد (عرض قيمة، لا gauge)
     ──────────────────────────────────────────────────────────────────────────
     81.6٪ قيمة مورّدة في ملف البيانات لم تُعتمد منهجيتها بعد (البسط والمقام
     ومعالجة تعدد المخالفات في الزيارة الواحدة) — compliance.status يقولها
     صراحة. لذلك تُعرض «كما هي» بثلاثة عناصر صادقة:
       رقم بطولي كبير (أخضر مضيء — معدل التزام، مما نتحكم به) +
       شريط نسبة أفقي مرسى 0–100 (الشكل القانوني البديل للـgauge الدائري
       المحظور) امتلاؤه أخضر ومساره المتبقي حياد شفاف — المتبقي «متمم
       حسابي إلى 100٪» لا «عدم امتثال»، فتسميته كذلك تكذب على منهجية لم
       تُعتمد أصلاً، ولذا لا يلبس المرجاني +
       وسم ذهبي «قيمة مورّدة — بانتظار اعتماد المنهجية» (الذهبي وسم اعتماد
       حصراً) مع نص الملاحظة الكاملة من الإصدار ظاهراً في البطاقة والتلميح
       والبديل الجدولي — إفصاح ثلاثي لا يترك مجالاً لقراءة القيمة كمعتمدة.
     الملاحظة عنصر <p> لا <div> (dashboard.css يمدد كل <div> مباشر في
     المضيف إلى كامل المساحة). opts: { key?, compact? }
     ══════════════════════════════════════════════════════════════════════════ */
  function complianceCard(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const compact = !!opts.compact;
    const comp = rel.compliance;

    /* وسم الحالة: خريطة عرض مقفلة لحالات الإصدار المعروفة — نص الوسم
       القانوني من V2_CONTRACTS حرفياً؛ حالة غير معروفة تُعرض بمعرفها الخام */
    const STATUS_BADGE = {
      pending_methodology: "قيمة مورّدة — بانتظار اعتماد المنهجية",
    };
    const badgeText = STATUS_BADGE[comp.status] || String(comp.status);

    /* المتمم الحسابي إلى 100٪ بنفس تقريب المرآة (نمط uncovered_pct نفسه) */
    const remainder = round1(100 - comp.value);

    /* متطابقات الإصدار: النسبة ضمن حدودها والحالة معلنة */
    guard("complianceCard", {
      "القيمة نسبة سليمة ضمن [0,100]":
        Number.isFinite(comp.value) && comp.value >= 0 && comp.value <= 100,
      "حالة الاعتماد معلنة في الإصدار": !!comp.status,
      "نص الملاحظة التوضيحية حاضر": !!comp.note,
    });

    const c = T.chart(cid("complianceCard", opts), el);

    /* العناصر الرسومية: الوسم الذهبي + الرقم البطولي + تسمية المؤشر.
       المواضع بوحدات su ونسب مئوية — لا قياس DOM (البناء قد يتم منفصلاً) */
    const graphics = [
      caveatBadge(su, badgeText),
      {
        type: "text",
        right: T.fs(su, 24),
        top: T.fs(su, compact ? 30 : 40),
        silent: true,
        style: {
          text: fmt.pct(comp.value),
          fill: T.C.greenHi,
          fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, compact ? 40 : 58),
          fontWeight: 700,
        },
        z: 50,
      },
      {
        type: "text",
        right: T.fs(su, 24),
        top: T.fs(su, compact ? 78 : 110),
        silent: true,
        style: {
          text: String(comp.label),
          fill: T.C.ink2,
          fontFamily: "Cairo",
          fontSize: T.fs(su, compact ? 12.5 : 14.5),
          fontWeight: 600,
        },
        z: 50,
      },
    ];

    c.setOption(Object.assign(T.base(su), {
      graphic: graphics,
      /* شريط النسبة في الثلث السفلي — الرقم البطولي يملك الصدارة أعلاه */
      grid: {
        top: compact ? "68%" : "64%",
        bottom: T.fs(su, compact ? 22 : 30),
        left: T.fs(su, 16),
        right: T.fs(su, 16),
        containLabel: false,
      },
      xAxis: {
        type: "value",
        inverse: true,                 // RTL: الامتلاء يبدأ من اليمين
        min: 0,
        max: 100,                      // المقام الكامل — الشريط لا يكذب مقياساً
        splitLine: { lineStyle: { color: T.C.axSplit } },
        axisLabel: {
          color: T.C.faint,
          fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, 11),
          formatter: axisPct,
        },
      },
      yAxis: {
        type: "category",
        data: [String(comp.label)],
        position: "right",
        inverse: true,
        show: false,
      },
      tooltip: Object.assign(T.tooltip(su), {
        formatter: () =>
          T.ttTitle(comp.label)
          + T.ttRow("القيمة المورّدة", fmt.pct(comp.value), T.C.greenHi)
          + T.ttRow("حالة الاعتماد", badgeText, T.C.gold)
          + T.ttRow("المتمم إلى 100٪", fmt.pct(remainder))
          + "<div style=\"max-width:340px;margin-top:7px;color:#A9B6AE;"
          + "font-size:0.92em;line-height:1.55;white-space:normal\">"
          + T.esc(comp.note) + "</div>",
      }),
      series: [
        {
          name: "القيمة المورّدة",
          type: "bar",
          stack: "comp",
          barWidth: compact ? "46%" : "52%",
          data: [comp.value],
          color: T.C.green,
          itemStyle: { borderRadius: [0, 5, 5, 0] },   // الطرف الأيمن (البداية)
          emphasis: softEmphasis(T.C.green),
          label: Object.assign({
            show: !compact,
            position: "insideRight",
            formatter: () => fmt.pct(comp.value),
          }, numStyle(su, 12.5, T.C.stage1, 700)),
        },
        {
          /* مسار متبقٍ حيادي شفاف — ليس بيانات فلا لون دلالياً ولا تلميحاً */
          name: "__track",
          type: "bar",
          stack: "comp",
          silent: true,
          barWidth: compact ? "46%" : "52%",
          data: [remainder],
          color: "rgba(244,241,230,.08)",
          itemStyle: { borderRadius: [5, 0, 0, 5] },   // الطرف الأيسر (النهاية)
          emphasis: { disabled: true },
          tooltip: { show: false },
        },
      ],
    }), true);

    /* الملاحظة الكاملة ظاهرة في البطاقة (غير المدمجة): عنصر <p> فوق القماش،
       textContent حصراً (لا HTML)، لا يعترض المؤشر كي يبقى التلميح حياً */
    const oldNote = el.querySelector(":scope > .c2-comp-note");
    if (oldNote) oldNote.remove();
    if (!compact) {
      const p = document.createElement("p");
      p.className = "c2-comp-note";
      p.textContent = comp.note;
      p.style.cssText = "position:absolute;top:" + T.fs(su, 38) + "px;left:"
        + T.fs(su, 16) + "px;max-width:48%;margin:0;z-index:3;"
        + "pointer-events:none;color:" + T.C.mut
        + ";font-family:Cairo,sans-serif;font-size:" + T.fs(su, 11.5)
        + "px;line-height:1.55;";
      el.appendChild(p);
    }

    a11y(el,
      String(comp.label) + ": " + fmt.pct(comp.value) + " — " + badgeText
      + ". " + String(comp.note));

    srTable(el, String(comp.label) + " — " + badgeText,
      ["البند", "القيمة"],
      [
        ["القيمة المورّدة", fmt.pct(comp.value)],
        ["المتمم إلى 100٪", fmt.pct(remainder)],
        ["حالة الاعتماد", badgeText],
        ["الملاحظة", String(comp.note)],
      ]);

    /* نقطة واحدة: التركيز + سهم يُظهر التلميح، وEscape يخفيه */
    keyNav(el, c, 1, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) closuresBars — قرارات الإغلاق قطاعياً (أعمدة زرقاء)
     ──────────────────────────────────────────────────────────────────────────
     الإغلاق إجراء إنفاذ لا خلل — لا يجوز له المرجاني (المحجوز للمخالفات
     والعجز حصراً) ولا الأخضر الكمي (محجوز للطاقة المرخصة)؛ الأزرق الفئوي
     الثانوي هو موضعه الدلالي الصحيح. سلسلة واحدة → لا وسيلة إيضاح.
     تسمية قيمة مباشرة فوق كل عمود (خمس قيم صغيرة — الشمول هنا مقروء)،
     والتلميح يضيف الحصة ونسبة الإغلاق إلى مخالفات القطاع (شدة الإنفاذ)
     بنفس تقريب المرآة. مرساة الصفر صريحة.
     opts: { key?, compact?, sort? ("value" ترتيب تنازلي) }
     ══════════════════════════════════════════════════════════════════════════ */
  function closuresBars(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const compact = !!opts.compact;
    const total = rel.metrics.total_closures.value;

    const sectors = opts.sort === "value"
      ? rel.sectors.slice().sort((a, b) => b.closures - a.closures)
      : rel.sectors.slice();

    /* متطابقات الإصدار */
    guard("closuresBars", {
      "مجموع إغلاقات القطاعات = الإجمالي":
        sectors.reduce((a, s) => a + s.closures, 0) === total,
      "لا قيمة سالبة": sectors.every((s) => s.closures >= 0),
    });

    /* الأعلى إغلاقاً: أول الأقصى بترتيب المصفوفة المعروضة — للوصف الناطق */
    let top = sectors[0];
    for (const s of sectors) if (s.closures > top.closures) top = s;

    const c = T.chart(cid("closuresBars", opts), el);
    c.setOption(Object.assign(T.base(su), {
      grid: gridBox(su, compact, {
        top: T.fs(su, compact ? 28 : 38),
        bottom: T.fs(su, compact ? 26 : 34),
        left: T.fs(su, 14),
        right: T.fs(su, compact ? 48 : 66),
      }),
      xAxis: T.catXAxis(su, sectors.map((s) => s.short)),
      yAxis: T.valAxis(su, axisInt, { min: 0 }),   // مرساة الصفر الصريحة
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(244,241,230,.045)" } },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          const s = sectors[i];
          return T.ttTitle(s.name)
            + T.ttRow("قرارات الإغلاق", fmt.noun(s.closures, "decision"), T.C.blue)
            + T.ttRow("من إجمالي القرارات", fmt.pct(pctOf(s.closures, total)))
            + T.ttRow("مخالفات القطاع", fmt.noun(s.violations, "violation"), T.C.coral)
            + T.ttRow("نسبة الإغلاق إلى المخالفات",
              fmt.pct(pctOf(s.closures, s.violations)));
        },
      }),
      series: [{
        type: "bar",
        name: "قرارات الإغلاق",
        data: sectors.map((s) => s.closures),
        color: T.C.blue,
        barWidth: compact ? "38%" : "42%",
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        emphasis: softEmphasis(T.C.blue),
        labelLayout: { hideOverlap: true },
        label: Object.assign({
          show: !compact,
          position: "top",
          formatter: (p) => fmt.int(p.value),
        }, numStyle(su, 13, T.C.ivory, 700)),
      }],
    }), true);

    a11y(el,
      "قرارات الإغلاق حسب القطاع: " + fmt.noun(total, "decision")
      + " إجمالاً؛ الأعلى " + String(top.name) + " بواقع "
      + fmt.noun(top.closures, "decision") + " أي "
      + fmt.pct(pctOf(top.closures, total)) + " من الإجمالي");

    srTable(el, "قرارات الإغلاق حسب القطاع — بيانات الرسم كاملة",
      ["القطاع", "قرارات الإغلاق", "الحصة", "مخالفات القطاع", "نسبة الإغلاق إلى المخالفات"],
      sectors.map((s) => [
        s.name,
        fmt.noun(s.closures, "decision"),
        fmt.pct(pctOf(s.closures, total)),
        fmt.noun(s.violations, "violation"),
        fmt.pct(pctOf(s.closures, s.violations)),
      ]));

    keyNav(el, c, sectors.length, tipShower(c, 0));
    return c;
  }

  /* ── التسجيل في مساحة الأسماء المشتركة (ملفات الرسوم الأخرى تدمج مثلها) ── */
  Object.assign(RH.viz.charts2, {
    monthlyActivityDual,
    violationTypes,
    sectorViolationsBars,
    complianceCard,
    closuresBars,
  });

  /* منفذ اختبار داخلي (ليس من القائمة القانونية للمنشئين) على غرار
     _supplyInternals: يكشف السلسلتين التراكميتين كما يرسمهما
     monthlyActivityDual حرفياً كي تثبت الاختبارات أن آخر نقطة تساوي
     الإجماليات المعتمدة (19,651 / 3,617) وأن الجمع الجاري بلا انحراف.
     البادئة السفلية تعلن أنه غير معد للاستهلاك من الأقسام. */
  RH.viz.charts2._controlInternals = { cumControlSeries };
})();
