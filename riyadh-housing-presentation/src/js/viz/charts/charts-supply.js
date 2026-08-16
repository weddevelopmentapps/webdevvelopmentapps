/* ════════════════════════════════════════════════════════════════════════════
   charts-supply.js — مكتبة رسوم «العرض والطلب» (RH.viz.charts2)
   ────────────────────────────────────────────────────────────────────────────
   ينفذ ستة مُنشئين من القائمة القانونية في docs/V2_CONTRACTS.md §3:

     occupancyComposition  شرائح أفقية مكدسة: مشغول/شاغر (أخضر/أخضر خافت)
                           + شريحة تركيبة الطلب (ياقات زرقاء/بيضاء) اختيارياً
     econBars              أعمدة أفقية: الطلب حسب النشاط الاقتصادي (رملي)
     sectorSupplyDemand    أعمدة مجمعة قطاعياً: طلب (رملي) × طاقة (أخضر)
                           + تسميات نسبة التغطية المباشرة (+ عجز مرجاني اختياري)
     coverageEvolution     مساحة شهرية: سلسلة التغطية المشتقة (خط الأساس
                           + تراكمي الأسرّة الشهرية ÷ إجمالي الطلب) — تنتهي 43.1٪
                           مع خط المستهدف الاسترشادي الذهبي 60٪ بوسم «استرشادي»
     forecastScenarios     خطوط سيناريوهات العجز الثلاثة (درجات مرجانية مرتبة)
                           + نطاق عدم يقين + تسميات طرفية + وسم «مورّدة غير معتمدة»
     demandCollarSplit     شريط مكدس ثنائي: الياقات الزرقاء (أزرق) / البيضاء (رملي)

   العقد الموحد: RH.viz.charts2.<name>(el, su, opts?) → مثيل ECharts.
   المثيل يُنشأ حصراً عبر سجل الثيم RH.viz.theme.chart("c2:"+name[+":"+key], el)
   — السجل يتخلص من المثيل المستبدل، وresizeAll/disposeAll يبقيان صالحين.

   قواعد غير قابلة للتفاوض (مطبقة حرفياً هنا):
   • كل البيانات من RH.data.store.release()/.der() — لا قيمة مختلقة إطلاقاً.
   • كل رقم ظاهر عبر RH.core.fmt (أرقام لاتينية، فواصل آلاف، ٪ عربية معزولة).
   • كل نص إصدار يمر إلى HTML التلميح عبر theme.esc/ttRow/ttTitle حصراً.
   • منظومة المعنى: أخضر = طاقة مرخصة، رملي = طلب، مرجاني = عجز/خلل حصراً،
     ذهبي = مستهدف/خط أساس حصراً، أزرق = فئة تصنيفية ثانوية.
   • لا محاور مزدوجة أبداً؛ لا gauges؛ وسيلة إيضاح عند ≥ سلسلتين فقط.
   • حركة الدخول من theme.base(su) وتُعطَّل تلقائياً مع prefers-reduced-motion؛
     لا حركة مستمرة للبيانات بعد الاستقرار.
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
     أدوات مشتركة صغيرة — كل شيء مدرّج بوحدة su (عرض المسرح ÷ 1920)
     ────────────────────────────────────────────────────────────────────────── */

  /** معرف السجل الموحد: "c2:<name>[:<key>]" — key يسمح بمثيلين للمُنشئ الواحد
      (مثال: نسخة مصغرة في الملخص ونسخة كاملة في قسم العرض والطلب) */
  function cid(name, opts) {
    return "c2:" + name + (opts && opts.key ? ":" + opts.key : "");
  }

  /** منسق محور القيم الكمية: صيغة تنفيذية مختصرة (1.42 مليون / 612.4 ألف) */
  const axisK = (v) => fmt.compact(v);

  /** منسق محور النسب: قيمة بمنزلة واحدة وعلامة ٪ العربية المعزولة اتجاهياً */
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
      الأولى في أقصى اليمين، فالسهم الأيسر يتقدم زمنياً والأيمن يتراجع. */
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
        console.warn("charts-supply/" + name + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /** تسميات الأشهر: كاملة افتراضياً، ومختصرة (بلا سنة) في الوضع المدمج —
      السنة تبقى حاضرة في التلميح بالتسمية الكاملة دائماً */
  function monthCats(rows, short) {
    return rows.map((r) => (short ? r.label.replace(/\s+\d{4}$/, "") : r.label));
  }

  /** سلسلة التغطية الشهرية المشتقة — الصيغة المعتمدة في المواصفة حرفياً:
      (baseline.beds + تراكمي beds الشهرية) ÷ total_demand × 100
      بتقريب derive.pct (مرآة بايثون) — آخر نقطة تساوي coverage_pct المنشورة 43.1 */
  function coverageSeries() {
    const rel = S();
    const months = rel.monthly.licensing;
    const dem = rel.metrics.total_demand.value;
    let cum = rel.baseline.beds;
    const pts = [], cums = [], adds = [];
    for (const m of months) {
      cum += m.beds;
      cums.push(cum);
      adds.push(m.beds);
      pts.push(pctOf(cum, dem));
    }
    return { months, dem, pts, cums, adds, last: pts[pts.length - 1] };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) occupancyComposition — تركيبة الإشغال (شرائح أفقية مكدسة)
     ──────────────────────────────────────────────────────────────────────────
     الصف الأول: الطاقة المرخصة = مشغول (أخضر) + شاغر (أخضر خافت — درجتان من
     الصبغة الواحدة لأن الشاغر جزء من المقياس نفسه، لا فئة مستقلة).
     الصف الثاني (افتراضي، يُعطَّل بـ opts.collar:false): تركيبة الطلب =
     ياقات زرقاء (أزرق) + بيضاء (رملي) — زوج collar2 المتحقق منه لونياً.
     وجود الصفين معاً على محور قيم واحد يجعل فارق الحجم بين الطاقة (612.4 ألف)
     والطلب (1.42 مليون) مقروءاً مباشرة من طول الشريطين — بلا أي تحايل مقياس.
     opts: { key?, compact?, collar? (افتراضي true) }
     ══════════════════════════════════════════════════════════════════════════ */
  function occupancyComposition(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const withCollar = opts.collar !== false;

    const capacity = rel.metrics.licensed_beds.value;
    const occupied = rel.metrics.occupied_beds.value;
    const vacant = der.vacant_beds;
    const demand = rel.metrics.total_demand.value;
    const blue = rel.collar.blue;
    const white = rel.collar.white;

    /* حصص الشرائح — كلها عبر مرآة التقريب المركزية */
    const occPct = der.occupancy_pct;                 // 91.7
    const vacPct = pctOf(vacant, capacity);           // 8.3
    const bluePct = der.blue_share_pct;               // 82.0
    const whitePct = der.white_share_pct;             // 18.0

    /* متطابقات الإصدار التي يرتكز عليها هذا الرسم — تنبيه مبكر عند أي انجراف */
    guard("occupancyComposition", {
      "مشغول + شاغر = الطاقة المرخصة": occupied + vacant === capacity,
      "زرقاء + بيضاء = إجمالي الطلب": blue + white === demand,
    });

    /* أخضر خافت للشاغر: الصبغة نفسها بشفافية — سلم تسلسلي لا فئة جديدة */
    const VACANT = "rgba(49,162,109,.30)";

    const cats = withCollar
      ? ["الطاقة المرخصة", "الطلب التقديري"]
      : ["الطاقة المرخصة"];

    /* أربع سلاسل مكدسة على صفين: null يُسقط الشريحة من الصف غير المعني */
    const segs = [
      { name: "أسرّة مشغولة", color: T.C.green, pct: occPct,
        data: withCollar ? [occupied, null] : [occupied], inside: T.C.stage1 },
      { name: "أسرّة شاغرة", color: VACANT, pct: vacPct,
        data: withCollar ? [vacant, null] : [vacant], inside: T.C.ink2 },
    ];
    if (withCollar) {
      segs.push(
        { name: "الياقات الزرقاء", color: T.C.blue, pct: bluePct,
          data: [null, blue], inside: T.C.ivory },
        { name: "الياقات البيضاء", color: T.C.demand, pct: whitePct,
          data: [null, white], inside: T.C.stage1 }
      );
    }

    const c = T.chart(cid("occupancyComposition", opts), el);
    c.setOption(Object.assign(T.base(su), {
      legend: legendBox(su, segs.map((s) => s.name), compact
        ? { itemGap: T.fs(su, 12), textStyle: txtStyle(su, 12, T.C.ink2) }
        : null),
      grid: gridBox(su, compact, {
        top: T.fs(su, compact ? 34 : 42),
        bottom: T.fs(su, compact ? 22 : 30),
        left: T.fs(su, 12),
        right: T.fs(su, compact ? 108 : 138),
      }),
      xAxis: T.hValAxis(su, axisK),
      yAxis: T.hCatAxis(su, cats),
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(244,241,230,.045)" } },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          if (i === 0) {
            return T.ttTitle(rel.metrics.licensed_beds.label)
              + T.ttRow("مشغولة", fmt.unitAfter(occupied, "سرير"), T.C.green)
              + T.ttRow("شاغرة", fmt.unitAfter(vacant, "سرير"), VACANT)
              + T.ttRow("معدل الإشغال", fmt.pct(occPct))
              + T.ttRow("الإجمالي", fmt.unitAfter(capacity, "سرير"));
          }
          return T.ttTitle(rel.metrics.total_demand.label)
            + T.ttRow("الياقات الزرقاء", fmt.unitAfter(blue, "سرير"), T.C.blue)
            + T.ttRow("الياقات البيضاء", fmt.unitAfter(white, "سرير"), T.C.demand)
            + T.ttRow("الإجمالي", fmt.unitAfter(demand, "سرير"));
        },
      }),
      series: segs.map((sg) => ({
        name: sg.name,
        type: "bar",
        stack: "mix",
        barWidth: compact ? "46%" : "52%",
        data: sg.data,
        itemStyle: Object.assign({ color: sg.color }, segBorder()),
        emphasis: softEmphasis(sg.color),
        labelLayout: { hideOverlap: true },
        label: Object.assign(
          { show: !compact, position: "inside", formatter: () => fmt.pct(sg.pct) },
          numStyle(su, 12.5, sg.inside, 600)),
      })),
    }), true);

    a11y(el,
      "تركيبة الإشغال: " + fmt.unitAfter(occupied, "سرير") + " مشغول و"
      + fmt.unitAfter(vacant, "سرير") + " شاغر من طاقة "
      + fmt.unitAfter(capacity, "سرير") + " بمعدل إشغال " + fmt.pct(occPct)
      + (withCollar
        ? "؛ الطلب " + fmt.unitAfter(demand, "سرير") + " منه "
          + fmt.pct(bluePct) + " ياقات زرقاء"
        : ""));

    /* البديل الجدولي الكامل لقارئات الشاشة */
    const tblRows = [
      ["أسرّة مشغولة", fmt.unitAfter(occupied, "سرير"), fmt.pct(occPct)],
      ["أسرّة شاغرة", fmt.unitAfter(vacant, "سرير"), fmt.pct(vacPct)],
      ["إجمالي الطاقة المرخصة", fmt.unitAfter(capacity, "سرير"), fmt.pct(100)],
    ];
    if (withCollar) {
      tblRows.push(
        ["الياقات الزرقاء", fmt.unitAfter(blue, "سرير"), fmt.pct(bluePct)],
        ["الياقات البيضاء", fmt.unitAfter(white, "سرير"), fmt.pct(whitePct)],
        ["إجمالي الطلب التقديري", fmt.unitAfter(demand, "سرير"), fmt.pct(100)]
      );
    }
    srTable(el, "تركيبة الإشغال والطلب — بيانات الرسم كاملة",
      ["البند", "القيمة", "الحصة"], tblRows);

    /* تنقل مفاتيحي بين الصفين: صف الطاقة تخدمه سلسلة المشغول (فهرس 0)
       وصف الطلب تخدمه سلسلة الياقات الزرقاء (فهرس 2) */
    keyNav(el, c, cats.length, (i) => {
      if (c.isDisposed()) return;
      c.dispatchAction({
        type: "showTip",
        seriesIndex: i === 0 ? 0 : 2,
        dataIndex: i,
      });
    });
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) econBars — الطلب حسب النشاط الاقتصادي (أعمدة أفقية رملية)
     ──────────────────────────────────────────────────────────────────────────
     سلسلة واحدة بلون الطلب الدلالي الواحد → لا وسيلة إيضاح (قاعدة صارمة).
     ترتيب تنازلي على الخام، تسمية قيمة مباشرة عند طرف كل عمود، والحصة من
     إجمالي الطلب في التلميح (وفي التسمية أيضاً عند opts.share:true).
     opts: { key?, compact?, share? }
     ══════════════════════════════════════════════════════════════════════════ */
  function econBars(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const compact = !!opts.compact;
    const withShare = !!opts.share;
    const total = rel.metrics.total_demand.value;

    const rows = rel.economic_activities.slice()
      .sort((a, b) => b.demand - a.demand);

    /* مجموع الأنشطة الاقتصادية يساوي إجمالي الطلب — متطابقة الإصدار */
    guard("econBars", {
      "مجموع الأنشطة = إجمالي الطلب":
        rows.reduce((a, r) => a + r.demand, 0) === total,
    });

    const c = T.chart(cid("econBars", opts), el);
    c.setOption(Object.assign(T.base(su), {
      grid: gridBox(su, compact, {
        top: T.fs(su, 6),
        bottom: T.fs(su, compact ? 24 : 30),
        left: T.fs(su, compact ? 66 : 104),
        right: T.fs(su, compact ? 128 : 176),
      }),
      xAxis: T.hValAxis(su, axisK),
      yAxis: T.hCatAxis(su, rows.map((r) => r.name),
        compact ? T.fs(su, 118) : T.fs(su, 165)),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          const r = rows[p.dataIndex];
          return T.ttTitle(r.name)
            + T.ttRow("الطلب", fmt.unitAfter(r.demand, "سرير"), T.C.demand)
            + T.ttRow("من إجمالي الطلب", fmt.pct(pctOf(r.demand, total)));
        },
      }),
      series: [{
        type: "bar",
        data: rows.map((r) => r.demand),
        color: T.C.demand,
        barWidth: compact ? "50%" : "56%",
        itemStyle: { borderRadius: [6, 0, 0, 6] },
        emphasis: softEmphasis(T.C.demand),
        labelLayout: { hideOverlap: true },
        label: Object.assign({
          show: true,
          position: "left",
          formatter: (p) => withShare
            ? fmt.int(p.value) + "  " + fmt.pct(pctOf(p.value, total))
            : fmt.int(p.value),
        }, numStyle(su, compact ? 12 : 13.5, T.C.ivory)),
      }],
    }), true);

    a11y(el,
      "الطلب حسب النشاط الاقتصادي: يتصدر " + String(rows[0].name) + " بواقع "
      + fmt.unitAfter(rows[0].demand, "سرير") + " أي "
      + fmt.pct(pctOf(rows[0].demand, total)) + " من إجمالي الطلب");

    srTable(el, "الطلب على الأسرّة حسب النشاط الاقتصادي — بيانات الرسم كاملة",
      ["النشاط", "الطلب", "من إجمالي الطلب"],
      rows.map((r) => [
        r.name,
        fmt.unitAfter(r.demand, "سرير"),
        fmt.pct(pctOf(r.demand, total)),
      ]));

    keyNav(el, c, rows.length, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) sectorSupplyDemand — العرض × الطلب قطاعياً (أعمدة مجمعة)
     ──────────────────────────────────────────────────────────────────────────
     زوج متحقق منه لونياً: طلب (رملي) مقابل طاقة مرخصة (أخضر)، مع تسمية نسبة
     التغطية المباشرة فوق عمود الطاقة لكل قطاع — الرقم الذي يقرأه الأمين أولاً.
     opts.deficit:true يضيف سلسلة العجز المرجانية (المرجاني للعجز حصراً).
     مقياس واحد (أسرّة) لكل السلاسل → محور واحد بلا استثناء.
     opts.sort يعيد ترتيب القطاعات دون مساس بالقيم:
       "demand"   → الأعلى طلباً أولاً (قراءة حجم السوق)
       "coverage" → الأدنى تغطية أولاً (قراءة الأولوية التدخلية)
       غيابه      → الترتيب القانوني كما في الإصدار
     opts: { key?, compact?, deficit?, sort? }
     ══════════════════════════════════════════════════════════════════════════ */
  function sectorSupplyDemand(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const withDeficit = !!opts.deficit;

    let sectors = rel.sectors.slice();
    if (opts.sort === "demand") {
      sectors.sort((a, b) => b.demand - a.demand);
    } else if (opts.sort === "coverage") {
      sectors.sort((a, b) =>
        der.sector[a.id].coverage_raw - der.sector[b.id].coverage_raw);
    }

    /* مجاميع القطاعات تطابق الإجماليات المعتمدة — متطابقتا الإصدار */
    guard("sectorSupplyDemand", {
      "مجموع طلب القطاعات = إجمالي الطلب":
        sectors.reduce((a, s) => a + s.demand, 0)
          === rel.metrics.total_demand.value,
      "مجموع أسرّة القطاعات = الطاقة المرخصة":
        sectors.reduce((a, s) => a + s.beds, 0)
          === rel.metrics.licensed_beds.value,
    });

    const names = sectors.map((s) => s.short);
    const legendNames = withDeficit
      ? ["الطلب", "الطاقة المرخصة", "العجز"]
      : ["الطلب", "الطاقة المرخصة"];

    const series = [
      {
        name: "الطلب",
        type: "bar",
        color: T.C.demand,
        barGap: "14%",
        barWidth: withDeficit ? "22%" : (compact ? "26%" : "30%"),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        emphasis: softEmphasis(T.C.demand),
        data: sectors.map((s) => s.demand),
      },
      {
        name: "الطاقة المرخصة",
        type: "bar",
        color: T.C.green,
        barWidth: withDeficit ? "22%" : (compact ? "26%" : "30%"),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        emphasis: softEmphasis(T.C.green),
        data: sectors.map((s) => s.beds),
        /* تسمية التغطية المباشرة — انتقائية: رقم واحد فوق العمود الأخضر فقط */
        label: Object.assign({
          show: !compact,
          position: "top",
          formatter: (p) => fmt.pct(der.sector[sectors[p.dataIndex].id].coverage_pct),
        }, numStyle(su, 12.5, T.C.greenHi, 700)),
      },
    ];
    if (withDeficit) {
      series.push({
        name: "العجز",
        type: "bar",
        color: T.C.coral,
        barWidth: "22%",
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        emphasis: softEmphasis(T.C.coral),
        data: sectors.map((s) => der.sector[s.id].deficit_beds),
      });
    }

    const c = T.chart(cid("sectorSupplyDemand", opts), el);
    c.setOption(Object.assign(T.base(su), {
      legend: legendBox(su, legendNames),
      grid: gridBox(su, compact, {
        top: T.fs(su, compact ? 36 : 46),
        bottom: T.fs(su, compact ? 26 : 34),
        left: T.fs(su, 14),
        right: T.fs(su, compact ? 48 : 66),
      }),
      xAxis: T.catXAxis(su, names),
      yAxis: T.valAxis(su, axisK),
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(244,241,230,.045)" } },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          const s = sectors[i];
          const sd = der.sector[s.id];
          let out = T.ttTitle(s.name)
            + T.ttRow("الطلب", fmt.unitAfter(s.demand, "سرير"), T.C.demand)
            + T.ttRow("الطاقة المرخصة", fmt.unitAfter(s.beds, "سرير"), T.C.green)
            + T.ttRow("نسبة التغطية", fmt.pct(sd.coverage_pct))
            + T.ttRow("العجز", fmt.unitAfter(sd.deficit_beds, "سرير"), T.C.coral);
          out += T.ttRow("حصة القطاع من الطلب", fmt.pct(sd.demand_share_pct));
          return out;
        },
      }),
      series: series,
    }), true);

    const worst = der.rankings.lowest_coverage;
    const worstRow = sectors.find((s) => s.id === worst);
    a11y(el,
      "العرض والطلب قطاعياً: أدنى تغطية في " + String(worstRow.name) + " عند "
      + fmt.pct(der.sector[worst].coverage_pct) + " وأعلى تغطية "
      + fmt.pct(der.sector[der.rankings.highest_coverage].coverage_pct));

    srTable(el, "العرض والطلب حسب القطاع — بيانات الرسم كاملة",
      ["القطاع", "الطلب", "الطاقة المرخصة", "نسبة التغطية", "العجز"],
      sectors.map((s) => [
        s.name,
        fmt.unitAfter(s.demand, "سرير"),
        fmt.unitAfter(s.beds, "سرير"),
        fmt.pct(der.sector[s.id].coverage_pct),
        fmt.unitAfter(der.sector[s.id].deficit_beds, "سرير"),
      ]));

    keyNav(el, c, sectors.length, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) coverageEvolution — تطور نسبة التغطية (مساحة شهرية مشتقة)
     ──────────────────────────────────────────────────────────────────────────
     12 نقطة شهرية من الصيغة المعتمدة (تراكمي الأسرّة ÷ إجمالي الطلب) تنتهي
     حتماً عند 43.1٪ (بوابة التحقق). محور النسبة يبدأ من الصفر — المساحة تقرأ
     كحصة من الكل بلا تضخيم بصري. خط المستهدف الاسترشادي 60٪ ذهبي متقطع بوسم
     «استرشادي» (الذهبي للمستهدف حصراً)، وقيمته من release.coverage_target_indicative
     لا من ثابت مكتوب. التسمية الطرفية تعلن القيمة الأخيرة مباشرة.
     opts.baseline:true يضيف خطاً ذهبياً ثانياً عند تغطية خط الأساس (الطاقة
     قبل سبتمبر 2025 ÷ الطلب) — الذهبي لخط الأساس مسموح بعقده الحصري نفسه.
     opts: { key?, compact?, target? (افتراضي true), baseline? (افتراضي false) }
     ══════════════════════════════════════════════════════════════════════════ */
  function coverageEvolution(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const cs = coverageSeries();

    /* المستهدف الاسترشادي — يُقرأ من الإصدار ويُتجاوز بأمان إن غاب */
    const tgt = rel.coverage_target_indicative || null;
    const withTarget = opts.target !== false && !!(tgt && Number.isFinite(tgt.value));

    /* تغطية خط الأساس المشتقة من قيم الإصدار — لا ثابت مكتوباً */
    const basePct = pctOf(rel.baseline.beds, cs.dem);
    const withBaseline = !!opts.baseline;

    /* آخر نقطة في السلسلة المشتقة يجب أن تطابق نسبة التغطية المنشورة (بوابة
       «التغطية الشهرية الأخيرة = 43.1» في المواصفة) — وتراكميّها يطابق الطاقة */
    guard("coverageEvolution", {
      "آخر نقطة تغطية = coverage_pct المنشورة": cs.last === der.coverage_pct,
      "التراكمي الأخير = الطاقة المرخصة":
        cs.cums[cs.cums.length - 1] === rel.metrics.licensed_beds.value,
      "12 شهراً كاملة": cs.months.length === 12,
    });

    const cats = monthCats(cs.months, compact);
    const yMax = withTarget ? tgt.value + 10 : Math.ceil(cs.last + 8);

    const line = {
      name: "نسبة التغطية",
      type: "line",
      color: T.C.greenHi,
      z: 10,
      symbol: "circle",
      symbolSize: T.fs(su, compact ? 5 : 6.5),
      showSymbol: !compact,
      lineStyle: { width: compact ? 2.5 : 3, color: T.C.greenHi },
      itemStyle: { color: T.C.greenHi, borderColor: T.C.stage1, borderWidth: 1 },
      emphasis: { focus: "none", scale: 1.6 },
      /* مساحة متدرجة من صبغة الطاقة الواحدة — تتلاشى نحو الأرضية */
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(49,162,109,.34)" },
          { offset: 1, color: "rgba(49,162,109,.02)" },
        ]),
      },
      /* التسمية الطرفية: القيمة الأخيرة (43.1٪) عند نهاية الخط — طرف RTL الأيسر */
      endLabel: Object.assign({
        show: !compact,
        distance: T.fs(su, 8),
        formatter: () => fmt.pct(cs.last),
      }, numStyle(su, 14.5, T.C.greenHi, 700)),
      data: cs.pts,
    };

    /* الخطوط الذهبية المرجعية (مستهدف/خط أساس حصراً): تُبنى مجتمعة كي يحمل
       كل خط تسميته الخاصة — مساعد الثيم يخدم الخط المفرد، وهنا قد يكون خطان */
    const mlData = [];
    if (withTarget) {
      mlData.push({
        yAxis: tgt.value,
        label: { formatter: "استرشادي " + fmt.pct(tgt.value) },
      });
    }
    if (withBaseline) {
      /* تسمية خط الأساس عند حافة المحور (طرف البداية) وتحت الخط — بحشوة
         «حبة» داكنة كي لا تتصادم مع أول نقاط السلسلة (إصلاح المراجعة) */
      mlData.push({
        yAxis: basePct,
        label: {
          formatter: "خط الأساس " + fmt.pct(basePct),
          position: "insideStartBottom",
        },
      });
    }
    if (mlData.length) {
      line.markLine = {
        silent: true,
        symbol: "none",
        lineStyle: { color: T.C.gold, width: 2, type: "dashed" },
        label: {
          show: true,
          position: "insideStartTop",
          color: T.C.gold,
          fontFamily: "Cairo",
          fontSize: T.fs(su, compact ? 11.5 : 13),
          backgroundColor: "rgba(11,21,18,.82)",
          padding: [T.fs(su, 2), T.fs(su, 5)],
          borderRadius: 6,
        },
        data: mlData,
      };
    }

    const c = T.chart(cid("coverageEvolution", opts), el);
    c.setOption(Object.assign(T.base(su), {
      grid: gridBox(su, compact, {
        top: T.fs(su, compact ? 18 : 26),
        bottom: T.fs(su, compact ? 30 : 44),
        left: T.fs(su, compact ? 40 : 58),
        right: T.fs(su, compact ? 46 : 64),
        containLabel: true,
      }),
      xAxis: T.catXAxis(su, cats, {
        axisLabel: {
          color: T.C.mut, fontFamily: "Cairo",
          fontSize: T.fs(su, compact ? 10.5 : 11.5),
          /* كل شهر ثانٍ — إصلاح تصادم/قصّ تسميات الأشهر الدوارة */
          interval: 1,
          rotate: compact ? 0 : 32,
        },
        boundaryGap: false,
      }),
      yAxis: T.valAxis(su, axisPct, { min: 0, max: yMax }),
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: { color: "rgba(244,241,230,.22)", width: 1 },
        },
        formatter: (ps) => {
          const i = ps && ps.length ? ps[0].dataIndex : 0;
          const remaining = cs.dem - cs.cums[i];
          let out = T.ttTitle(cs.months[i].label)
            + T.ttRow("نسبة التغطية", fmt.pct(cs.pts[i]), T.C.greenHi)
            + T.ttRow("الطاقة التراكمية", fmt.unitAfter(cs.cums[i], "سرير"), T.C.green)
            + T.ttRow("صافي إضافة الشهر", fmt.iso("+" + fmt.int(cs.adds[i])) + " سرير")
            + T.ttRow("الفجوة المتبقية", fmt.unitAfter(remaining, "سرير"), T.C.coral);
          if (withTarget) {
            out += T.ttRow("المستهدف الاسترشادي", fmt.pct(tgt.value), T.C.gold);
          }
          return out;
        },
      }),
      series: [line],
    }), true);

    a11y(el,
      "تطور نسبة التغطية الشهرية من " + fmt.pct(cs.pts[0]) + " في "
      + String(cs.months[0].label) + " إلى " + fmt.pct(cs.last) + " في "
      + String(cs.months[cs.months.length - 1].label)
      + (withTarget ? "؛ المستهدف الاسترشادي " + fmt.pct(tgt.value) : ""));

    srTable(el, "تطور نسبة التغطية الشهرية — بيانات الرسم كاملة",
      ["الشهر", "نسبة التغطية", "الطاقة التراكمية", "صافي إضافة الشهر"],
      cs.months.map((m, i) => [
        m.label,
        fmt.pct(cs.pts[i]),
        fmt.unitAfter(cs.cums[i], "سرير"),
        fmt.iso("+" + fmt.int(cs.adds[i])) + " سرير",
      ]));

    keyNav(el, c, cs.months.length, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) forecastScenarios — سيناريوهات العجز المتوقع (خطوط نطاق)
     ──────────────────────────────────────────────────────────────────────────
     ثلاث درجات مرتبة من صبغة الخلل الواحدة (سلم ترتيبي أحادي — لا ثلاث فئات):
     الأساسي الأفتح والأثخن (السيناريو المميز)، المتحفظ أوسط، المتفائل الأدكن
     متقطعاً — التطابق الحرفي مع مقاربة V1 المعتمدة حفاظاً على الاستمرارية.
     نطاق عدم اليقين مساحة مرجانية شفافة بين المتفائل والمتحفظ (حيلة التراص:
     خط قاعدة صامت عند المتفائل + فرق مكدس فوقه). التسميات الطرفية تسمي كل
     خط مع قيمته الأخيرة، والوسم الذهبي يعلن حالة البيانات «مورّدة غير معتمدة»
     (نص الحالة الكامل من release.scenarios.caveat في تلميح الوسم التوثيقي).
     خط الأساس الذهبي عند العجز الحالي يمنح القراءة مرساها (ذهبي = خط أساس حصراً).
     opts: { key?, compact?, baseline? (افتراضي true) }
     ══════════════════════════════════════════════════════════════════════════ */
  function forecastScenarios(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const rows = rel.scenarios.rows;
    const withBaseline = opts.baseline !== false;
    const deficitNow = der.deficit_beds;

    /* رتابة السيناريوهات: المتحفظ ≥ الأساسي ≥ المتفائل في كل شهر — أي كسر
       لهذا الترتيب يعني انقلاب دلالة النطاق فيستحق تنبيهاً فورياً */
    guard("forecastScenarios", {
      "المتحفظ ≥ الأساسي ≥ المتفائل شهرياً":
        rows.every((r) => r.conservative >= r.base && r.base >= r.optimistic),
      "سلسلة توقع غير فارغة": rows.length > 0,
    });

    /* درجات المرجان الترتيبية — ثوابت عرض (فُرّقت فاتحيتها بعد ملاحظة
       المراجعة: كانت شبه متطابقة في مقاس المفتاح الصغير) */
    const SH_BASE = "#F29B76";     // الأساسي: الأفتح والأبرز على المسرح الداكن
    const SH_CONS = "#C05841";     // المتحفظ
    const SH_OPT = "#7C3A24";      // المتفائل: الأدكن، متقطع
    const defs = [
      { key: "conservative", name: "متحفظ", color: SH_CONS, dash: "solid", w: 2.5 },
      { key: "base", name: "أساسي", color: SH_BASE, dash: "solid", w: 3.5 },
      { key: "optimistic", name: "متفائل", color: SH_OPT, dash: "dashed", w: 2.5 },
    ];
    const names = defs.map((d) => d.name);
    const byName = {};
    defs.forEach((d) => { byName[d.name] = d; });

    /* مدى المحور: صريح ومحسوب من الخام — يضم خط الأساس إن كان ظاهراً */
    let lo = Infinity, hi = -Infinity;
    for (const r of rows) {
      if (r.optimistic < lo) lo = r.optimistic;
      if (r.conservative > hi) hi = r.conservative;
    }
    if (withBaseline && deficitNow < lo) lo = deficitNow;
    const yMin = Math.floor((lo * 0.985) / 1000) * 1000;
    const yMax = Math.ceil((hi * 1.01) / 1000) * 1000;

    const cats = monthCats(rows, compact);

    /* نطاق عدم اليقين: قاعدة صامتة عند المتفائل + الفرق مكدساً فوقها */
    const bandBase = {
      name: "__band_base",
      type: "line",
      stack: "band",
      silent: true,
      symbol: "none",
      lineStyle: { opacity: 0 },
      itemStyle: { opacity: 0 },
      emphasis: { disabled: true },
      tooltip: { show: false },
      z: 1,
      data: rows.map((r) => r.optimistic),
    };
    const bandSpan = {
      name: "__band_span",
      type: "line",
      stack: "band",
      silent: true,
      symbol: "none",
      lineStyle: { opacity: 0 },
      itemStyle: { opacity: 0 },
      areaStyle: { color: T.C.coral, opacity: 0.10 },
      emphasis: { disabled: true },
      tooltip: { show: false },
      z: 1,
      data: rows.map((r) => r.conservative - r.optimistic),
    };

    const lines = defs.map((d) => {
      const last = rows[rows.length - 1][d.key];
      const s = {
        name: d.name,
        type: "line",
        color: d.color,
        z: 10,
        symbol: "circle",
        symbolSize: T.fs(su, compact ? 4.5 : 6),
        showSymbol: !compact,
        itemStyle: { color: d.color, borderColor: T.C.stage1, borderWidth: 1 },
        lineStyle: { width: d.w, type: d.dash, color: d.color },
        emphasis: { focus: "series", lineStyle: { width: d.w + 1 } },
        endLabel: Object.assign({
          show: !compact,
          distance: T.fs(su, 8),
          formatter: () => d.name + " " + fmt.compact(last),
        }, txtStyle(su, 12.5, d.color, 600)),
        labelLayout: { hideOverlap: true },
        data: rows.map((r) => r[d.key]),
      };
      /* مرساة خط الأساس الذهبية تُعلّق على السلسلة الأساسية وحدها —
         التسمية حبة داكنة تحت الخط عند حافة المحور كي لا تصادم خط المتفائل
         عند الطرف (إصلاح المراجعة) */
      if (d.key === "base" && withBaseline) {
        s.markLine = T.targetLine(su, deficitNow,
          "العجز الحالي " + fmt.compact(deficitNow) + " سرير");
        s.markLine.label.position = "insideStartBottom";
        s.markLine.label.backgroundColor = "rgba(11,21,18,.82)";
        s.markLine.label.padding = [T.fs(su, 2), T.fs(su, 5)];
        s.markLine.label.borderRadius = 6;
      }
      return s;
    });

    const c = T.chart(cid("forecastScenarios", opts), el);
    c.setOption(Object.assign(T.base(su), {
      /* الوضع المدمج: المفتاح يساراً والوسم يميناً كي لا يتراكبا في بطاقة
         ضيقة (كانا متراكبين وسط الملخص) — النص الكامل يبقى في الوضع الموسع.
         أيقونة المفتاح تُحذف عمداً فيرث كل بند خطه بنمطه (المتقطع يظهر
         متقطعاً في المفتاح — إصلاح المراجعة). */
      legend: (() => {
        const lg = legendBox(su, names, compact
          ? { textStyle: txtStyle(su, 12, T.C.ink2), left: T.fs(su, 8) } : null);
        delete lg.icon;
        return lg;
      })(),
      /* وسم الحالة الذهبي: البيانات مورّدة وغير معتمدة — إفصاح داخل الرسم */
      graphic: [compact
        ? Object.assign(caveatBadge(su, "مورّدة — غير معتمدة"),
          { left: null, right: T.fs(su, 8) })
        : caveatBadge(su, "سيناريوهات مورّدة — غير معتمدة")],
      grid: gridBox(su, compact, {
        top: T.fs(su, compact ? 40 : 50),
        bottom: T.fs(su, compact ? 30 : 42),
        left: T.fs(su, compact ? 68 : 104),
        right: T.fs(su, compact ? 50 : 72),
      }),
      xAxis: T.catXAxis(su, cats, {
        axisLabel: {
          color: T.C.mut, fontFamily: "Cairo",
          fontSize: T.fs(su, compact ? 10.5 : 11.5),
          rotate: compact ? 0 : 30,
          interval: compact ? "auto" : 0,
        },
        boundaryGap: false,
      }),
      yAxis: T.valAxis(su, axisK, { min: yMin, max: yMax }),
      tooltip: Object.assign(T.tooltip(su), {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: { color: "rgba(244,241,230,.22)", width: 1 },
        },
        formatter: (ps) => {
          if (!ps || !ps.length) return "";
          const i = ps[0].dataIndex;
          const r = rows[i];
          let out = T.ttTitle(r.label);
          for (const p of ps) {
            const d = byName[p.seriesName];
            if (!d) continue; // سلاسل النطاق الصامتة لا تظهر في التلميح
            out += T.ttRow(d.name, fmt.unitAfter(r[d.key], "سرير"), d.color);
          }
          out += T.ttRow("نطاق عدم اليقين",
            fmt.unitAfter(r.conservative - r.optimistic, "سرير"));
          if (withBaseline) {
            out += T.ttRow("العجز الحالي (خط الأساس)",
              fmt.unitAfter(deficitNow, "سرير"), T.C.gold);
          }
          return out;
        },
      }),
      series: [bandBase, bandSpan].concat(lines),
    }), true);

    const first = rows[0];
    const lastRow = rows[rows.length - 1];
    a11y(el,
      "سيناريوهات العجز المورّدة غير المعتمدة من " + String(first.label)
      + " إلى " + String(lastRow.label) + ": الأساسي يبلغ "
      + fmt.unitAfter(lastRow.base, "سرير") + " والنطاق بين "
      + fmt.compact(lastRow.optimistic) + " و" + fmt.compact(lastRow.conservative)
      + " سرير، مقابل عجز حالي " + fmt.unitAfter(deficitNow, "سرير"));

    /* البديل الجدولي يحمل نص التحفظ الكامل من الإصدار في وصفه — إفصاح تام */
    srTable(el,
      String(rel.scenarios.title) + " — " + String(rel.scenarios.caveat),
      ["الشهر", "متحفظ", "أساسي", "متفائل", "نطاق عدم اليقين"],
      rows.map((r) => [
        r.label,
        fmt.unitAfter(r.conservative, "سرير"),
        fmt.unitAfter(r.base, "سرير"),
        fmt.unitAfter(r.optimistic, "سرير"),
        fmt.unitAfter(r.conservative - r.optimistic, "سرير"),
      ]));

    /* التنقل المفاتيحي يستهدف سلسلة المتحفظ (أول سلسلة مرئية بعد سلسلتي
       النطاق الصامتتين) — التلميح المحوري يعرض الشهور الثلاثة معاً */
    keyNav(el, c, rows.length, tipShower(c, 2));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6) demandCollarSplit — تركيبة الطلب حسب فئة العمالة (شريط مكدس ثنائي)
     ──────────────────────────────────────────────────────────────────────────
     جزء-من-كل واحد: الياقات الزرقاء (أزرق — استخدامه الدلالي الوحيد) والياقات
     البيضاء (رملي) — زوج collar2 المتحقق منه لونياً. محور القيم مخفي عمداً:
     الشريط يقرأ نسبةً لا مقداراً، والمقادير كاملة في التسميات الداخلية والتلميح.
     opts: { key?, compact?, axis? (إظهار محور القيم عند true) }
     ══════════════════════════════════════════════════════════════════════════ */
  function demandCollarSplit(el, su, opts) {
    opts = opts || {};
    const rel = S();
    const der = D();
    const compact = !!opts.compact;
    const withAxis = !!opts.axis;

    const blue = rel.collar.blue;
    const white = rel.collar.white;
    const total = rel.metrics.total_demand.value;
    const bluePct = der.blue_share_pct;    // 82.0
    const whitePct = der.white_share_pct;  // 18.0

    /* الشريحتان تكملان المقام تماماً — وإلا فالشريط يكذب بصرياً */
    guard("demandCollarSplit", {
      "زرقاء + بيضاء = إجمالي الطلب": blue + white === total,
    });

    const segs = [
      { name: "الياقات الزرقاء", val: blue, pct: bluePct,
        color: T.C.blue, inside: T.C.ivory,
        radius: [0, 6, 6, 0],   // الطرف الأيمن الخارجي (بداية الشريط في RTL)
        label: rel.metrics.blue_collar.label },
      { name: "الياقات البيضاء", val: white, pct: whitePct,
        color: T.C.demand, inside: T.C.stage1,
        radius: [6, 0, 0, 6],   // الطرف الأيسر الخارجي (نهاية الشريط)
        label: rel.metrics.white_collar.label },
    ];

    const c = T.chart(cid("demandCollarSplit", opts), el);
    c.setOption(Object.assign(T.base(su), {
      legend: legendBox(su, segs.map((s) => s.name), compact
        ? { textStyle: txtStyle(su, 12, T.C.ink2) } : null),
      grid: gridBox(su, compact, {
        top: T.fs(su, compact ? 32 : 40),
        bottom: T.fs(su, withAxis ? (compact ? 24 : 30) : 10),
        left: T.fs(su, 12),
        right: T.fs(su, 12),
      }),
      xAxis: {
        type: "value",
        inverse: true,           // RTL: الشريط يبدأ من اليمين
        max: total,              // المقام الحقيقي — الشريط يملأ العرض تماماً
        show: withAxis,
        splitLine: { lineStyle: { color: T.C.axSplit } },
        axisLabel: {
          color: T.C.faint, fontFamily: "IBM Plex Sans Arabic",
          fontSize: T.fs(su, 12), formatter: axisK,
        },
      },
      yAxis: {
        type: "category",
        data: ["الطلب التقديري"],
        position: "right",
        inverse: true,
        show: false,
      },
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          const sg = segs[p.seriesIndex];
          return T.ttTitle(sg.label)
            + T.ttRow(sg.name, fmt.unitAfter(sg.val, "سرير"), sg.color)
            + T.ttRow("من إجمالي الطلب", fmt.pct(sg.pct))
            + T.ttRow("إجمالي الطلب", fmt.unitAfter(total, "سرير"));
        },
      }),
      series: segs.map((sg) => ({
        name: sg.name,
        type: "bar",
        stack: "collar",
        barWidth: compact ? "52%" : "60%",
        data: [sg.val],
        itemStyle: Object.assign({
          color: sg.color,
          borderRadius: sg.radius,
        }, segBorder()),
        emphasis: softEmphasis(sg.color),
        labelLayout: { hideOverlap: true },
        label: Object.assign({
          show: true,
          position: "inside",
          lineHeight: T.fs(su, compact ? 15 : 18),
          formatter: compact
            ? () => fmt.pct(sg.pct)
            : () => fmt.compact(sg.val) + " سرير\n" + fmt.pct(sg.pct),
        }, numStyle(su, compact ? 12 : 13.5, sg.inside, 600)),
      })),
    }), true);

    a11y(el,
      "تركيبة الطلب حسب فئة العمالة: الياقات الزرقاء "
      + fmt.unitAfter(blue, "سرير") + " بنسبة " + fmt.pct(bluePct)
      + " والياقات البيضاء " + fmt.unitAfter(white, "سرير") + " بنسبة "
      + fmt.pct(whitePct) + " من إجمالي " + fmt.unitAfter(total, "سرير"));

    srTable(el, "تركيبة الطلب حسب فئة العمالة — بيانات الرسم كاملة",
      ["الفئة", "الطلب", "الحصة"],
      segs.map((sg) => [
        sg.label,
        fmt.unitAfter(sg.val, "سرير"),
        fmt.pct(sg.pct),
      ]).concat([[
        "إجمالي الطلب التقديري",
        fmt.unitAfter(total, "سرير"),
        fmt.pct(100),
      ]]));

    /* التنقل المفاتيحي بين الشريحتين: كل شريحة سلسلة مستقلة بنقطة واحدة */
    keyNav(el, c, segs.length, (i) => {
      if (c.isDisposed()) return;
      c.dispatchAction({ type: "showTip", seriesIndex: i, dataIndex: 0 });
    });
    return c;
  }

  /* ── التسجيل في مساحة الأسماء المشتركة (ملفات الرسوم الأخرى تدمج مثلها) ── */
  Object.assign(RH.viz.charts2, {
    occupancyComposition,
    econBars,
    sectorSupplyDemand,
    coverageEvolution,
    forecastScenarios,
    demandCollarSplit,
  });

  /* منفذ اختبار داخلي (ليس من القائمة القانونية للمنشئين): يكشف سلسلة التغطية
     المشتقة كما يرسمها coverageEvolution حرفياً، كي تتحقق الاختبارات من تساوي
     المخرجين python/JS نقطةً نقطة (مطلب المواصفة §3 «تُختبر بالتساوي»).
     البادئة السفلية تعلن أنه غير معد للاستهلاك من الأقسام. */
  RH.viz.charts2._supplyInternals = { coverageSeries };
})();
