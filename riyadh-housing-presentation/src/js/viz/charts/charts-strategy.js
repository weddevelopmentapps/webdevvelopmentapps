/* ════════════════════════════════════════════════════════════════════════════
   charts-strategy.js — مكتبة رسوم «المبادرات ومؤشرات الأداء» (RH.viz.charts2)
   ────────────────────────────────────────────────────────────────────────────
   ينفذ خمسة مُنشئين من القائمة القانونية في docs/V2_CONTRACTS.md §3:

     initiativeGantt  مخطط زمني custom series: 18 مبادرة مجمعة على الركائز
                      الأربع (نطاقات markArea مسماة)، محور زمن RTL معكوس،
                      خط «اليوم» الذهبي عند meta.calculation_date، والحالة
                      محسوبة بمرآة قاعدة status_rule («متأخرة حكماً» بعد
                      النهاية دون إنجاز): منجزة أخضر / جاري العمل أزرق /
                      متأخرة مرجاني / لم يتم البدء رمادي خافت. المبادرتان
                      المنجزتان بلا تواريخ في المصدر تُعرضان وسماً نصياً
                      صادقاً لا شريطاً — لا اختلاق نطاق زمني.
     statusDonut      حلقة رفيعة (donut جزء-من-كل، ليست gauge) لتوزيع حالات
                      المبادرات: 2 منجزة / 9 جاري العمل / 7 متأخرة — الأعداد
                      المثبتة ببوابات التحقق، والعدد الكلي 18 في المركز.
     pillarCards      ليست ECharts: أربع بطاقات DOM للركائز (3 ركيزة + 1
                      ممكن) بعدّاد مبادرات متحرك وشريط توزيع حالات — ترجع
                      العنصر المُلحق.
     kpiBullets       14 شريط bullet أفقياً: مسار مُعاير على المستهدف
                      (المستهدف = 100٪)، شاخص المستهدف الذهبي وقيمته
                      الحقيقية، شاخص خط الأساس الذهبي المجوف، والوسم الصادق
                      «القيمة الحالية غير متوفرة» — current تبقى null بصدق.
     kpiMatrix        ليست ECharts: مصفوفة جدولية كثيفة للمؤشرات الأربعة عشر
                      (النوع/الصيغة/خط الأساس/المستهدف/الحالية) بفرز عمودي
                      تفاعلي — ترجع العنصر المُلحق.

   العقد الموحد: RH.viz.charts2.<name>(el, su, opts?) → مثيل ECharts
   (وpillarCards/kpiMatrix ترجعان عنصر DOM بنص العقد نفسه في V2_CONTRACTS).
   مثيلات ECharts تُنشأ حصراً عبر سجل الثيم RH.viz.theme.chart("c2:"+name[+
   ":"+key], el) — السجل يتخلص من المثيل المستبدل، وresizeAll/disposeAll
   يبقيان صالحين.

   قواعد غير قابلة للتفاوض (مطبقة حرفياً هنا):
   • كل البيانات من RH.data.store.release()/.der() — لا قيمة مختلقة إطلاقاً؛
     الحقول الغائبة في المصدر (تواريخ 1.1 و3.1، والقيم الحالية للمؤشرات)
     تُعرض غائبة صراحة ولا تُعوَّض.
   • كل رقم ظاهر عبر RH.core.fmt (أرقام لاتينية، فواصل آلاف، ٪ عربية معزولة،
     تطابق العدد والمعدود عبر countNoun/noun).
   • كل نص إصدار يمر إلى HTML التلميح عبر theme.esc/ttRow/ttTitle حصراً.
   • منظومة المعنى: أخضر = منجز/ما نتحكم به، أزرق = فئة ثانوية (جاري العمل)،
     مرجاني = خلل/تأخر حصراً، ذهبي = مستهدف/خط أساس/خط اليوم المرجعي حصراً،
     رمادي خافت = لم يبدأ (غياب حالة لا فئة بيانات).
   • لا محاور مزدوجة؛ لا gauges دائرية؛ وسيلة إيضاح عند ≥ سلسلتين فقط.
   • حركة الدخول من theme.base(su) وتُعطَّل مع prefers-reduced-motion؛
     عدّادات pillarCards عبر RH.viz.motion (أول دخول فقط ثم ثبات).
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

  /* مرآة التقريب المركزية (نصف لأعلى، منزلة واحدة) — نفس مرآة بايثون */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);
  const round1 = (v) => RH.data.derive.roundHalfUp(v, 1);

  /* ──────────────────────────────────────────────────────────────────────────
     أدوات مشتركة صغيرة — كل شيء مدرّج بوحدة su (عرض المسرح ÷ 1920)
     ────────────────────────────────────────────────────────────────────────── */

  /** معرف السجل الموحد: "c2:<name>[:<key>]" — key يسمح بمثيلين للمُنشئ الواحد
      (مثال: donut مصغر في الملخص التنفيذي ونسخة كاملة في قسم المبادرات) */
  function cid(name, opts) {
    return "c2:" + name + (opts && opts.key ? ":" + opts.key : "");
  }

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

  /** سلسلة خط canvas مختصرة لعناصر custom/graphic — zrender يقبل صيغة CSS */
  function cFont(su, size, weight, plex) {
    return (weight ? weight + " " : "") + T.fs(su, size) + "px "
      + (plex ? "'IBM Plex Sans Arabic'" : "Cairo");
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

  /** حالة تأكيد موحدة: توهج خفيف بلون السلسلة نفسها — لا تغيير صبغة */
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

  /** وسم زاوي ذهبي داخل الرسم — لوسوم المنهجية والحالة حصراً (الذهبي هنا
      لكنة كروم «بانتظار الاعتماد» في tokens.css لا قيمة بيانات) */
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
      مكشوفاً لقارئات الشاشة. */
  function a11y(el, label) {
    el.setAttribute("role", "figure");
    el.setAttribute("aria-label", label);
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
  }

  /** جدول بيانات مكافئ مخفي بصرياً — البديل النصي الكامل للرسم. يُبنى
      بـ textContent حصراً فلا مسار HTML إطلاقاً، وبأنماط سطرية كي لا نلمس
      ملفات CSS لا نملكها. يُستبدل عند إعادة البناء. */
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

  /** تنقل لوحة المفاتيح داخل الرسم: الأسهم تمشط الصفوف وتُظهر التلميح،
      وEscape يخفيه. المضيف يحمل data-interactive وفق عقد المحرك فلا تتقدم
      الأسهم بالعرض أثناء تركيز الرسم. المحور معكوس (RTL): الأول في أقصى
      اليمين/الأعلى، فالسهم الأيسر يتقدم والأيمن يتراجع. */
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
        case "ArrowDown":
          show(idx < 0 ? 0 : idx + 1);
          break;
        case "ArrowRight":
        case "ArrowUp":
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
        console.warn("charts-strategy/" + name + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /** ملاحظة تلميح ملتفة — للنصوص الطويلة من الإصدار (تمر عبر esc حتماً) */
  function ttNote(text) {
    return "<div style=\"max-width:340px;margin-top:7px;color:#A9B6AE;"
      + "font-size:0.92em;line-height:1.55;white-space:normal\">"
      + T.esc(text) + "</div>";
  }

  /* ──────────────────────────────────────────────────────────────────────────
     أدوات التاريخ — تحليل ISO حتمي بتوقيت UTC (لا انزياح مناطق زمنية)
     ────────────────────────────────────────────────────────────────────────── */
  const DAY_MS = 86400000;

  /** "2026-04-01" → ميلي ثانية UTC؛ يعيد NaN للغائب/غير الصالح */
  function isoMs(iso) {
    if (!iso) return NaN;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
    if (!m) return NaN;
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  }

  /** تسمية شهرية عربية لمحور الزمن: ميلي ثانية → «أبريل 2026» */
  function monthTick(ms) {
    const d = new Date(ms);
    return fmt.AR_MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }

  /** صيغ العدد والمعدود لليوم — لصياغة المدد والتأخر المشتقة من التواريخ */
  const DAY_FORMS = {
    one: "يوم واحد", two: "يومان", few: "أيام", many: "يوماً", hundred: "يوم",
  };
  const dayNoun = (n) => fmt.countNoun(n, DAY_FORMS);

  /* ──────────────────────────────────────────────────────────────────────────
     نواة بيانات الاستراتيجية المشتركة — مرآة قاعدة الحالة الرسمية
     ────────────────────────────────────────────────────────────────────────── */

  /* مفردات الحالة القانونية (تُطابَق ضد strategy.status_vocabulary بالحرس) */
  const ST_DONE = "منجزة";
  const ST_RUN = "جاري العمل";
  const ST_LATE = "متأخرة";
  const ST_IDLE = "لم يتم البدء";

  /* ألوان الحالات وفق منظومة المعنى المتحقق منها لونياً (main3 + الأزرق):
     المنجز أخضر (ما نتحكم به)، الجاري أزرق (فئة ثانوية محايدة)، المتأخر
     مرجاني (خلل حصراً)، غير المبدوء رمادي خافت (غياب لا فئة). */
  const ST_META = {};
  ST_META[ST_DONE] = { color: T.C.green, order: 0 };
  ST_META[ST_RUN] = { color: T.C.blue, order: 1 };
  ST_META[ST_LATE] = { color: T.C.coral, order: 2 };
  ST_META[ST_IDLE] = { color: T.C.faint, order: 3 };

  /** مرآة حرفية لقاعدة status_rule في generate_data (والموثقة في V2_CONTRACTS):
      حالة الملف إن وُجدت؛ وإلا: end < calculation_date → «متأخرة» حكماً؛
      start ≤ calculation_date → «جاري العمل»؛ وإلا «لم يتم البدء».
      مقارنة سلاسل ISO مباشرة — حتمية وبلا مناطق زمنية. */
  function statusOf(ini, calcDate) {
    if (ini.status) return ini.status;
    if (ini.end && ini.end < calcDate) return ST_LATE;
    if (ini.start && ini.start <= calcDate) return ST_RUN;
    return ST_IDLE;
  }

  /** القراءة الموحدة لطبقة الاستراتيجية: صفوف مرتبة بالركيزة ثم بالمعرف،
      مع الحالة المحسوبة والتواريخ المحللة وتاريخ الحساب المرجعي. */
  function strategyRows() {
    const rel = S();
    const st = rel.strategy;
    const calc = rel.meta.calculation_date;
    const pIdx = {};
    st.pillars.forEach((p, i) => { pIdx[p.id] = i; });

    const rows = st.initiatives.slice().sort((a, b) => {
      const d = (pIdx[a.pillar_id] || 0) - (pIdx[b.pillar_id] || 0);
      if (d !== 0) return d;
      return String(a.id).localeCompare(String(b.id), "en", { numeric: true });
    }).map((ini) => ({
      ini: ini,
      pillar: st.pillars[pIdx[ini.pillar_id]],
      status: statusOf(ini, calc),
      startMs: isoMs(ini.start),
      endMs: isoMs(ini.end),
    }));

    /* متطابقات الإصدار المشتركة لكل مُنشئي هذا الملف */
    const vocab = st.status_vocabulary || [];
    guard("strategyRows", {
      "4 محاور في المصدر": st.pillars.length === 4,
      "18 مبادرة في المصدر": st.initiatives.length === 18,
      "3 ركائز + 1 ممكن":
        st.pillars.filter((p) => p.kind === "ركيزة").length === 3
        && st.pillars.filter((p) => p.kind === "ممكن").length === 1,
      "كل مبادرة تنتمي لمحور معرَّف": rows.every((r) => !!r.pillar),
      "كل حالة محسوبة من المفردات القانونية":
        rows.every((r) => vocab.indexOf(r.status) >= 0),
      "تاريخ الحساب المرجعي حاضر": Number.isFinite(isoMs(calc)),
      "start ≤ end حيث وُجد التاريخان":
        rows.every((r) => !Number.isFinite(r.startMs)
          || !Number.isFinite(r.endMs) || r.startMs <= r.endMs),
    });

    return { rel: rel, st: st, calc: calc, calcMs: isoMs(calc), rows: rows };
  }

  /** توزيع الحالات بترتيب المفردات القانونية من الإصدار (لا ترتيب مخترعاً) */
  function statusCounts(rows, vocabulary) {
    const counts = {};
    for (const v of vocabulary) counts[v] = 0;
    for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;
    return counts;
  }

  /** القراءة الموحدة لمؤشرات الأداء: مرتبة بالمعرف مع فحوص المرآة */
  function kpiRows() {
    const rel = S();
    const kpis = rel.strategy.kpis.slice()
      .sort((a, b) => a.id - b.id);
    const ids = kpis.map((k) => k.id).join(",");
    const wanted = kpis.map((_, i) => i + 1).join(",");
    guard("kpiRows", {
      "14 مؤشراً بالضبط": kpis.length === 14,
      "معرفات 1..14 بالضبط": ids === wanted,
      "كل مستهدف > خط أساسه": kpis.every((k) => k.target > k.baseline),
      "حدود النسب [0,1] للمؤشرات النسبية":
        kpis.every((k) => !k.pct
          || (k.baseline >= 0 && k.baseline <= 1 && k.target >= 0 && k.target <= 1)),
      "القيم الحالية غائبة بصدق (current=null)":
        kpis.every((k) => k.current == null),
      "ملاحظة القيم الحالية موحدة المصدر":
        kpis.every((k) => k.current_note === kpis[0].current_note),
    });
    return { rel: rel, kpis: kpis, note: kpis.length ? kpis[0].current_note : "" };
  }

  /** تنسيق قيمة مؤشر وفق صيغته: النسبية ×100 بعلامة ٪ العربية، والعددية
      بفاصل الآلاف — كل شيء عبر RH.core.fmt حصراً */
  function kpiVal(k, v) {
    if (v == null || !Number.isFinite(v)) return "—";
    return k.pct ? fmt.pct(round1(v * 100)) : fmt.int(v);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1) initiativeGantt — المخطط الزمني لمحفظة المبادرات (custom series)
     ──────────────────────────────────────────────────────────────────────────
     18 صفاً مجمعة على الركائز الأربع بترتيب المصدر: نطاقات markArea مظللة
     بالتناوب تحمل أسماء الركائز، ومحور الزمن معكوس RTL (الأقدم يميناً).
     خط «اليوم» الذهبي عند تاريخ الحساب المرجعي (الذهبي مرجع حصراً).
     ترميز الحالة:
       جاري العمل  شريط أزرق: المنقضي من المدة صلب والمتبقي شفاف — ترميز
                   زمن منقضٍ لا «إنجاز» (لا نسب إنجاز في المصدر فلا نخترعها)
       متأخرة      شريط مرجاني كامل + خط متقطع يصل نهايته المخططة بخط اليوم
                   (مقدار التجاوز مشتق من التواريخ لا مختلق)
       منجزة       المبادرتان المنجزتان بلا تواريخ في المصدر: وسم نصي أخضر
                   عند بداية المحور — لا شريط، لا نطاق مختلق
       لم يتم البدء شريط رمادي خافت (لا حالة عند تاريخ الحساب الحالي — يبقى
                   المسار مدعوماً لأي إصدار قادم)
     وسيلة الإيضاح من سلاسل مفاتيح فارغة (selectedMode:false) لأن الحالة
     ترميز لوني داخل سلسلة واحدة. opts: { key?, compact? }
     ══════════════════════════════════════════════════════════════════════════ */
  function initiativeGantt(el, su, opts) {
    opts = opts || {};
    const compact = !!opts.compact;
    const sd = strategyRows();
    const rel = sd.rel;
    const rows = sd.rows;
    const calcMs = sd.calcMs;
    const vocab = sd.st.status_vocabulary;
    const counts = statusCounts(rows, vocab);

    /* الأعداد المثبتة ببوابات validate (V2_CONTRACTS §3) — إنذار انجراف */
    guard("initiativeGantt", {
      "التوزيع المثبت بالبوابات 2 منجزة / 9 جاري / 7 متأخرة":
        counts[ST_DONE] === 2 && counts[ST_RUN] === 9 && counts[ST_LATE] === 7,
      "المبادرات غير المؤرخة منجزة حصراً في هذا الإصدار":
        rows.every((r) => Number.isFinite(r.startMs) || r.status === ST_DONE),
    });

    /* مدى المحور الزمني: من أقدم بداية إلى أبعد نهاية (مع خط اليوم) + متنفس */
    let lo = Infinity, hi = -Infinity;
    for (const r of rows) {
      if (Number.isFinite(r.startMs) && r.startMs < lo) lo = r.startMs;
      if (Number.isFinite(r.endMs) && r.endMs > hi) hi = r.endMs;
    }
    if (calcMs < lo) lo = calcMs;
    if (calcMs > hi) hi = calcMs;
    const axMin = lo - 14 * DAY_MS;
    const axMax = hi + 24 * DAY_MS;

    /* فئات المحور الرأسي: أسماء المبادرات (فريدة في المصدر) — المعرف
       والتفاصيل في التلميح والبديل الجدولي */
    const cats = rows.map((r) => String(r.ini.name));

    /* نطاقات الركائز على المحور الفئوي: حدود كل مجموعة كما رُتبت */
    const bands = [];
    for (let i = 0; i < rows.length; i++) {
      const pid = rows[i].pillar.id;
      if (!bands.length || bands[bands.length - 1].pid !== pid) {
        bands.push({ pid: pid, name: String(rows[i].pillar.name), from: i, to: i });
      } else {
        bands[bands.length - 1].to = i;
      }
    }

    /** راسم الصف الواحد: شريط مدى/طبقتا جارٍ/وسم منجز بلا تواريخ */
    function renderRow(params, api) {
      const i = api.value(2);
      const r = rows[i];
      const meta = ST_META[r.status] || { color: T.C.faint };
      const cy = api.coord([axMin, i])[1];
      const rowH = api.size([0, 1])[1];
      const barH = Math.max(6, Math.min(rowH * 0.46, T.fs(su, compact ? 12 : 16)));
      const kids = [];

      /* منجزة بلا تواريخ: وسم نصي صادق عند بداية المحور (يمين RTL) */
      if (!Number.isFinite(r.startMs) || !Number.isFinite(r.endMs)) {
        const xr = api.coord([axMin, i])[0];
        const dotR = Math.max(3.5, barH * 0.26);
        const dx = xr - T.fs(su, 13);
        kids.push({
          type: "circle",
          shape: { cx: dx, cy: cy, r: dotR },
          style: { fill: meta.color },
        });
        /* رقاقة قصيرة عند طرف الصف بدل جملة طويلة فوق الأشرطة (إصلاح
           المراجعة) — النص الكامل «بلا نطاق زمني في المصدر» في التلميح */
        kids.push({
          type: "text",
          style: {
            text: compact
              ? String(r.status)
              : String(r.status) + " · بلا تواريخ",
            x: dx - dotR - T.fs(su, 7),
            y: cy,
            textAlign: "right",
            textVerticalAlign: "middle",
            fill: meta.color,
            font: cFont(su, compact ? 10.5 : 12, 600),
          },
        });
        return { type: "group", children: kids };
      }

      const ps = api.coord([r.startMs, i]);
      const pe = api.coord([r.endMs, i]);
      const x0 = Math.min(ps[0], pe[0]);
      const w = Math.max(Math.abs(ps[0] - pe[0]), 3);
      const y0 = cy - barH / 2;

      if (r.status === ST_RUN) {
        /* المدى الكامل شفافاً + المنقضي حتى اليوم صلباً — زمن لا إنجاز */
        kids.push({
          type: "rect",
          shape: { x: x0, y: y0, width: w, height: barH, r: barH / 2 },
          style: { fill: meta.color, opacity: 0.30 },
        });
        const pc = api.coord([Math.min(calcMs, r.endMs), i]);
        const ex0 = Math.min(ps[0], pc[0]);
        const ew = Math.max(Math.abs(ps[0] - pc[0]), 3);
        kids.push({
          type: "rect",
          shape: { x: ex0, y: y0, width: ew, height: barH, r: barH / 2 },
          style: { fill: meta.color },
        });
      } else {
        const style = { fill: meta.color };
        if (r.status === ST_IDLE) style.opacity = 0.5;
        kids.push({
          type: "rect",
          shape: { x: x0, y: y0, width: w, height: barH, r: barH / 2 },
          style: style,
        });
      }

      /* المتأخرة: خط تجاوز متقطع من النهاية المخططة إلى خط اليوم */
      if (r.status === ST_LATE && calcMs > r.endMs) {
        const pc = api.coord([calcMs, i]);
        kids.push({
          type: "line",
          shape: { x1: pe[0], y1: cy, x2: pc[0], y2: cy },
          style: {
            stroke: meta.color, lineWidth: 1,
            lineDash: [4, 4], opacity: 0.55,
          },
        });
        kids.push({
          type: "circle",
          shape: { cx: pc[0], cy: cy, r: Math.max(2.5, barH * 0.18) },
          style: { fill: "none", stroke: meta.color, lineWidth: 1, opacity: 0.8 },
        });
      }
      return { type: "group", children: kids };
    }

    /* السلسلة الرئيسة: custom على محور زمني معكوس */
    const mainSeries = {
      name: "__gantt",
      type: "custom",
      renderItem: renderRow,
      encode: { x: [0, 1], y: 2 },
      clip: false,
      z: 10,
      data: rows.map((r, i) => [
        Number.isFinite(r.startMs) ? r.startMs : axMin,
        Number.isFinite(r.endMs) ? r.endMs : axMin,
        i,
      ]),
    };

    /* سلاسل مفاتيح فارغة: وسيلة إيضاح للترميز اللوني داخل السلسلة الواحدة —
       الحالات الحاضرة فعلاً فقط، بترتيب المفردات القانونية، دون تبديل */
    const present = vocab.filter((v) => counts[v] > 0);
    const keySeries = present.map((v) => ({
      name: v,
      type: "bar",
      data: [],
      itemStyle: { color: (ST_META[v] || {}).color || T.C.faint },
    }));

    /* حامل خط اليوم ونطاقات الركائز: أول سلسلة مفاتيح (silent components) */
    if (keySeries.length) {
      keySeries[0].markLine = {
        silent: true,
        symbol: "none",
        z: 40,
        lineStyle: { color: T.C.gold, width: 2, type: "dashed" },
        /* تسمية «اليوم» حبة أفقية مثبتة عند قمة الخط الذهبي — لا نص رأسي
           يتقاطع مع الأشرطة وسط الرسم (إصلاح المراجعة) */
        label: {
          show: true,
          position: "start",
          distance: T.fs(su, 4),
          color: T.C.gold,
          fontFamily: "Cairo",
          fontSize: T.fs(su, compact ? 11 : 12.5),
          fontWeight: 700,
          backgroundColor: "rgba(11,21,18,.85)",
          padding: [T.fs(su, 2), T.fs(su, 6)],
          borderRadius: 999,
          borderColor: "rgba(214,171,76,.4)",
          borderWidth: 1,
          formatter: () => "اليوم · " + fmt.date(sd.calc),
        },
        data: [{ xAxis: calcMs }],
      };
      keySeries[0].markArea = {
        silent: true,
        z: 1,
        data: bands.map((b, bi) => [{
          name: b.name,
          yAxis: cats[b.from],
          itemStyle: {
            color: bi % 2 === 1 ? "rgba(244,241,230,.028)" : "rgba(0,0,0,0)",
          },
          /* تسمية النطاق في أعلى يساره (الأشهر البعيدة الأقل أشرطة) بحبة
             داكنة — كانت تتصادم يميناً مع تسميات الصفوف ورقاقات المنجز */
          label: {
            show: !compact,
            position: "insideTopLeft",
            distance: T.fs(su, 6),
            color: T.C.mut,
            fontFamily: "Cairo",
            fontSize: T.fs(su, 11.5),
            fontWeight: 700,
            backgroundColor: "rgba(11,21,18,.72)",
            padding: [T.fs(su, 2), T.fs(su, 6)],
            borderRadius: 6,
            formatter: b.name,
          },
        }, { yAxis: cats[b.to] }]),
      };
    }

    const c = T.chart(cid("initiativeGantt", opts), el);
    const graphics = [];
    if (!compact) {
      graphics.push(caveatBadge(su,
        "الحالة محسوبة بقاعدة خطة العمل حتى " + fmt.date(sd.calc)));
    }

    c.setOption(Object.assign(T.base(su), {
      /* إصلاح مراجعة الجولة 2: كانت حبة «اليوم» الذهبية تطبع فوق مفتاح
         الحالات وسط الترويسة («جاري العمل» مدفونة و«متأخرة» نصف مغطاة) —
         المفتاح إلى أقصى يمين الترويسة فوق حاشية أسماء المبادرات (خارج
         مدى مساحة الرسم الذي تسكنه الحبة) ووسم الحالة في أقصى اليسار،
         فلا يتقاسم أي منهما نطاق الحبة الأفقي. */
      legend: legendBox(su, present, Object.assign(
        { selectedMode: false, left: null, right: T.fs(su, 8) },
        compact ? { itemGap: T.fs(su, 12), textStyle: txtStyle(su, 12, T.C.ink2) } : {}
      )),
      graphic: graphics,
      grid: {
        top: T.fs(su, compact ? 34 : 46),
        bottom: T.fs(su, compact ? 26 : 34),
        left: T.fs(su, 18),
        right: T.fs(su, compact ? 224 : 316),
        containLabel: false,
      },
      xAxis: {
        type: "time",
        inverse: true,                       // RTL: الزمن يتقدم يميناً → يساراً
        min: axMin,
        max: axMax,
        axisLine: { lineStyle: { color: T.C.axLine } },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: T.C.axSplit } },
        axisLabel: {
          color: T.C.mut,
          fontFamily: "Cairo",
          fontSize: T.fs(su, compact ? 10.5 : 11.5),
          hideOverlap: true,
          formatter: monthTick,
        },
      },
      /* حاشية تسميات أوسع بخط أصغر — يظهر من الاسم ضعف ما كان يظهر قبل
         القص (إصلاح المراجعة)؛ الاسم الكامل في التلميح دائماً. الالتفاف
         لسطرين مرفوض هنا: صفوف الثمانية عشر أقصر من سطرين فتتراكب. */
      yAxis: (() => {
        /* حاشية أوسع (إصلاح مراجعة الجولة 1): أسماء المبادرات الطويلة كانت
           تُبتر منتصف الكلمة — الاسم الكامل يبقى في التلميح دائماً */
        const ax = T.hCatAxis(su, cats, T.fs(su, compact ? 210 : 296));
        ax.axisLabel.fontSize = T.fs(su, compact ? 11 : 12);
        return ax;
      })(),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          const r = rows[p.dataIndex];
          const meta = ST_META[r.status] || { color: T.C.faint };
          let out = T.ttTitle(r.ini.name)
            + T.ttRow("المعرف", fmt.iso(String(r.ini.id)))
            + T.ttRow("المحور", String(r.pillar.name))
            + T.ttRow("الحالة", String(r.status), meta.color);
          if (!Number.isFinite(r.startMs) || !Number.isFinite(r.endMs)) {
            out += T.ttRow("التواريخ", "غير مدرجة في المصدر");
            return out;
          }
          const days = Math.round((r.endMs - r.startMs) / DAY_MS) + 1;
          out += T.ttRow("البداية", fmt.date(r.ini.start))
            + T.ttRow("النهاية المخططة", fmt.date(r.ini.end))
            + T.ttRow("المدة المخططة", dayNoun(days));
          if (r.status === ST_LATE) {
            const over = Math.round((calcMs - r.endMs) / DAY_MS);
            out += T.ttRow("التجاوز حتى تاريخ الحساب", dayNoun(over), T.C.coral)
              + ttNote("متأخرة حكماً: تجاوزت نهايتها المخططة دون تسجيل إنجاز"
                + " — وفق قاعدة الحالة المعتمدة في خطة العمل.");
          } else if (r.status === ST_RUN) {
            const span = r.endMs - r.startMs;
            if (span > 0) {
              const gone = Math.min(Math.max(calcMs - r.startMs, 0), span);
              const left = Math.round((r.endMs - calcMs) / DAY_MS);
              out += T.ttRow("المنقضي من المدة", fmt.pct(pctOf(gone, span)), T.C.blue)
                + T.ttRow("المتبقي للنهاية المخططة", dayNoun(Math.max(left, 0)));
            }
          } else if (r.status === ST_IDLE) {
            const until = Math.round((r.startMs - calcMs) / DAY_MS);
            out += T.ttRow("تبدأ بعد", dayNoun(Math.max(until, 0)));
          }
          return out;
        },
      }),
      series: [mainSeries].concat(keySeries),
    }), true);

    a11y(el,
      "المخطط الزمني لمحفظة " + fmt.noun(rows.length, "initiative")
      + " موزعة على " + fmt.noun(sd.st.pillars.length, "pillar") + ": "
      /* تطابق العدد والمعدود مع الصفة — لا «2 منجزة» (إصلاح المراجعة) */
      + fmt.countNoun(counts[ST_DONE], {
        zero: "لا مبادرات منجزة", one: "مبادرة منجزة واحدة",
        two: "مبادرتان منجزتان", few: "مبادرات منجزة",
        many: "مبادرة منجزة", hundred: "مبادرة منجزة",
      })
      + " و" + fmt.noun(counts[ST_RUN], "initiative") + " جاري العمل عليها و"
      + fmt.countNoun(counts[ST_LATE], {
        zero: "لا مبادرات متأخرة", one: "مبادرة متأخرة واحدة",
        two: "مبادرتان متأخرتان", few: "مبادرات متأخرة",
        many: "مبادرة متأخرة", hundred: "مبادرة متأخرة",
      }) + " حكماً حتى " + fmt.date(sd.calc));

    srTable(el, "المخطط الزمني للمبادرات — بيانات الرسم كاملة",
      ["المبادرة", "المعرف", "المحور", "البداية", "النهاية المخططة", "الحالة"],
      rows.map((r) => [
        String(r.ini.name),
        String(r.ini.id),
        String(r.pillar.name),
        r.ini.start ? fmt.date(r.ini.start) : "غير مدرجة في المصدر",
        r.ini.end ? fmt.date(r.ini.end) : "غير مدرجة في المصدر",
        String(r.status),
      ]));

    keyNav(el, c, rows.length, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2) statusDonut — توزيع حالات المبادرات (حلقة رفيعة، ليست gauge)
     ──────────────────────────────────────────────────────────────────────────
     جزء-من-كل واحد: 18 مبادرة تتوزع على الحالات المحسوبة (2 منجزة / 9 جاري
     العمل / 7 متأخرة عند تاريخ الحساب المنشور — الأعداد المثبتة بالبوابات).
     العدد الكلي في المركز (رقم بطولي + معدوده المتطابق)، والدوران عكس عقارب
     الساعة كي تتقدم القراءة يميناً → يساراً كاتجاه النص. تسميات مباشرة خارجية
     (سلسلة واحدة → لا وسيلة إيضاح، قاعدة صارمة). الحالات صفرية العدّ لا
     تدخل الحلقة (شريحة صفرية كذبة هندسية) وتبقى في البديل الجدولي بصدق.
     opts: { key?, compact? }
     ══════════════════════════════════════════════════════════════════════════ */
  function statusDonut(el, su, opts) {
    opts = opts || {};
    const compact = !!opts.compact;
    const sd = strategyRows();
    const vocab = sd.st.status_vocabulary;
    const counts = statusCounts(sd.rows, vocab);
    const total = sd.rows.length;

    guard("statusDonut", {
      "مجموع الحالات = عدد المبادرات":
        vocab.reduce((a, v) => a + counts[v], 0) === total,
      "التوزيع المثبت بالبوابات 2/9/7":
        counts[ST_DONE] === 2 && counts[ST_RUN] === 9 && counts[ST_LATE] === 7,
    });

    const data = vocab.filter((v) => counts[v] > 0).map((v) => ({
      name: v,
      value: counts[v],
      itemStyle: {
        color: (ST_META[v] || {}).color || T.C.faint,
        borderColor: T.C.stage1,
        borderWidth: 2,
      },
    }));

    /* رقم المركز ومعدوده عبر countNoun — التقسيم على الفاصل الرقيق الموحد */
    const parts = fmt.noun(total, "initiative").split(fmt.NBSP);
    const centerNum = parts.length > 1 ? parts[0] : fmt.int(total);
    const centerWord = parts.length > 1 ? parts.slice(1).join(fmt.NBSP) : "";

    /* إصلاح مراجعة الجولة 5: مركز المدمج يُقاس على مضيفه الحقيقي لا على
       مقاس ثابت صُمم لمضيف الملخص الأطول — قطر فتحة الحلقة (نصف القطر
       الداخلي 62% من القطر الأصغر للمضيف) يحكم الحجمين: الرقم ≈ 40% من
       الفتحة بسقف المقاس المعهود، والمعدود ≈ 18% بسقفه، ويُخفى المعدود
       كلياً حين تضيق الفتحة عن ~44px أو ينحدر خطه دون عتبة القراءة (10px)
       فيحمله سطر البطاقة الفرعي «18 مبادرة» بصدق (مضيف المبادرات). عند
       بلوغ السقفين (مضيفا الملخص والختام) يبقى الرسم كما كان حرفياً.
       القياس يُعاد اشتقاقه عبر ResizeObserver لأن مضيف المبادرات يتقلص
       بعد إدراج صف الرقاقات لاحقاً في البطاقة (سبب العطب الأصلي). */
    const pxFont = (px, weight, plex) =>
      weight + " " + px + "px " + (plex ? "'IBM Plex Sans Arabic'" : "Cairo");
    function centerGraphic() {
      const hostH = el.clientHeight || 0;
      const hostD = Math.min(el.clientWidth || 0, hostH);
      const holeD = hostD > 0
        ? hostD * (compact ? 0.62 : 0.58)
        : Infinity; /* مضيف بلا قياس بعد → المقاسات المعهودة */
      const numCap = T.fs(su, compact ? 30 : 42);
      const wordCap = T.fs(su, compact ? 12 : 14);
      const numPx = Math.min(numCap, Math.round(holeD * 0.40));
      const wordPx = Math.min(wordCap, Math.round(holeD * 0.18));
      const showWord = !compact || (holeD >= 44 && wordPx >= 10);
      const scaledC = compact && numPx < numCap && hostH > 0;
      /* في الوضع المقاس تتمركز الكتلة على مركز الحلقة الفعلي (52% رأسياً) */
      const numTop = scaledC
        ? Math.round(hostH * 0.52 - numPx * (showWord ? 1.05 : 0.62))
        : (compact ? "40%" : "41%");
      const wordTop = scaledC
        ? Math.round(hostH * 0.52 + numPx * 0.25)
        : (compact ? "57%" : "55%");
      return [
        {
          type: "text",
          left: "center",
          top: numTop,
          silent: true,
          style: {
            text: centerNum,
            fill: T.C.ivory,
            font: pxFont(numPx, 700, true),
          },
          z: 50,
        },
        {
          type: "text",
          left: "center",
          top: wordTop,
          silent: true,
          invisible: !showWord,
          style: {
            /* نص فارغ عند الإخفاء — لا اعتماد على invisible وحدها */
            text: showWord ? centerWord : "",
            fill: T.C.mut,
            font: pxFont(wordPx, 600),
          },
          z: 50,
        },
      ];
    }

    const c = T.chart(cid("statusDonut", opts), el);
    c.setOption(Object.assign(T.base(su), {
      graphic: centerGraphic(),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          let out = T.ttTitle(p.name)
            + T.ttRow("العدد", fmt.noun(p.value, "initiative"), p.color)
            + T.ttRow("من المحفظة", fmt.pct(pctOf(p.value, total)));
          if (p.name === ST_LATE) {
            out += ttNote(sd.st.status_rule);
          }
          return out;
        },
      }),
      series: [{
        name: "حالات المبادرات",
        type: "pie",
        radius: compact ? ["62%", "82%"] : ["58%", "78%"],
        center: ["50%", "52%"],
        startAngle: 90,
        clockwise: false,              // القراءة تتقدم يميناً → يساراً كالنص
        avoidLabelOverlap: true,
        emphasis: {
          scale: true,
          scaleSize: T.fs(su, 4),
        },
        label: {
          show: !compact,
          color: "inherit",
          fontFamily: "Cairo",
          fontSize: T.fs(su, 12.5),
          fontWeight: 600,
          lineHeight: T.fs(su, 17),
          alignTo: "labelLine",
          formatter: (p) => p.name + "\n" + fmt.noun(p.value, "initiative"),
        },
        labelLine: {
          show: !compact,
          length: T.fs(su, 10),
          length2: T.fs(su, 8),
          lineStyle: { color: T.C.faint },
        },
        data: data,
      }],
    }), true);

    /* إعادة اشتقاق مركز الحلقة عند كل تغيّر في مقاس المضيف — يغطي إدراج
       الرقاقات بعد الإنشاء (المبادرات) وتغيّر إطار العرض معاً. المراقب
       يفصل نفسه متى تخلّص السجل من المثيل أو انفصل المضيف عن الوثيقة. */
    if (typeof ResizeObserver !== "undefined") {
      let lastD = 0;
      const ro = new ResizeObserver(() => {
        if (c.isDisposed() || !el.isConnected) { ro.disconnect(); return; }
        const d = Math.min(el.clientWidth || 0, el.clientHeight || 0);
        if (d === lastD) return;
        lastD = d;
        c.resize();
        c.setOption({ graphic: centerGraphic() });
      });
      ro.observe(el);
    }

    a11y(el,
      "توزيع حالات محفظة " + fmt.noun(total, "initiative") + ": "
      + vocab.map((v) => fmt.int(counts[v]) + " " + v).join("، ")
      + " حتى " + fmt.date(sd.calc));

    srTable(el, "توزيع حالات المبادرات — بيانات الرسم كاملة",
      ["الحالة", "العدد", "من المحفظة"],
      vocab.map((v) => [
        v,
        fmt.int(counts[v]),
        counts[v] > 0 ? fmt.pct(pctOf(counts[v], total)) : fmt.pct(0),
      ]));

    keyNav(el, c, data.length, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3) pillarCards — بطاقات الركائز الأربع (DOM خالص، ليست ECharts)
     ──────────────────────────────────────────────────────────────────────────
     أربع بطاقات زجاجية (3 «ركيزة» + 1 «ممكن») لكل منها: وسم النوع، اسم
     المحور (مقسوماً على فاصلته الأصلية إن وُجدت)، عدّاد مبادرات متحرك عند
     أول دخول (RH.viz.motion — يحترم reduced-motion)، شريط توزيع حالات
     نسبي الأطوال بألوان المنظومة، وسطر مفتاح رقمي، وسطر النطاق الزمني
     المشتق من تواريخ المصدر. تُبنى بـ textContent حصراً (لا مسار HTML)
     وبأنماط سطرية بوحدة su — لا نلمس ملفات CSS لا نملكها.
     opts: { key?, compact?, cols?, onSelect?(pillar, rows) }
     ترجع عنصر الحاوية المُلحق بالمضيف (عقد V2_CONTRACTS حرفياً).
     ══════════════════════════════════════════════════════════════════════════ */
  function pillarCards(el, su, opts) {
    opts = opts || {};
    const compact = !!opts.compact;
    const sd = strategyRows();
    const vocab = sd.st.status_vocabulary;
    const motion = RH.viz.motion || null;
    const suPx = (n) => "calc(var(--su) * " + n + ")";

    /* استبدال بناء سابق في المضيف نفسه (سلوك سجل الثيم نفسه للـDOM) */
    const old = el.querySelector(":scope > .pillar-cards");
    if (old) old.remove();

    const wrap = document.createElement("div");
    wrap.className = "pillar-cards";
    wrap.setAttribute("role", "list");
    wrap.setAttribute("aria-label",
      fmt.noun(sd.st.pillars.length, "pillar") + " ومبادراتها");
    wrap.style.cssText = "display:grid;grid-template-columns:repeat("
      + (opts.cols || (compact ? 2 : 4)) + ",1fr);gap:" + suPx(12)
      + ";width:100%;min-width:0;";

    for (const p of sd.st.pillars) {
      const list = sd.rows.filter((r) => r.pillar.id === p.id);
      const counts = statusCounts(list, vocab);
      const dated = list.filter((r) => Number.isFinite(r.startMs));
      const undated = list.length - dated.length;

      /* اسم المحور: القسمة على الفاصلة الأصلية «ركيزة 1: …» — عرض حرفي */
      const name = String(p.name);
      const cut = name.indexOf(":");
      const kicker = cut > 0 ? name.slice(0, cut).trim() : String(p.kind);
      const title = cut > 0 ? name.slice(cut + 1).trim() : name;

      const card = document.createElement("div");
      card.className = "dash-card pillar-card";
      card.setAttribute("role", "listitem");
      card.setAttribute("tabindex", "0");
      card.style.cssText = "display:flex;flex-direction:column;gap:" + suPx(8)
        + ";padding:" + suPx(compact ? 12 : 15) + " " + suPx(compact ? 14 : 18)
        + ";min-width:0;";

      /* سطر الوسمين: نوع المحور + سطره الرقمي الأصلي */
      const chips = document.createElement("div");
      chips.style.cssText = "display:flex;align-items:center;gap:" + suPx(8) + ";";
      const kindChip = document.createElement("span");
      kindChip.textContent = String(p.kind);
      kindChip.style.cssText = "font-size:" + suPx(11.5) + ";font-weight:700;"
        + "color:var(--mut-d);border:1px solid var(--hair-d);border-radius:999px;"
        + "padding:" + suPx(2) + " " + suPx(10) + ";white-space:nowrap;";
      chips.appendChild(kindChip);
      const kickEl = document.createElement("span");
      kickEl.textContent = kicker;
      kickEl.style.cssText = "font-size:" + suPx(12) + ";font-weight:600;"
        + "color:var(--faint-d);white-space:nowrap;overflow:hidden;"
        + "text-overflow:ellipsis;";
      chips.appendChild(kickEl);
      card.appendChild(chips);

      /* اسم المحور */
      const titleEl = document.createElement("div");
      titleEl.textContent = title;
      titleEl.style.cssText = "font-size:" + suPx(compact ? 14.5 : 16.5)
        + ";font-weight:700;color:var(--ivory);line-height:1.45;min-height:"
        + suPx(compact ? 40 : 48) + ";";
      card.appendChild(titleEl);

      /* العدّاد: رقم بطولي + معدوده المتطابق (countNoun) */
      const nounStr = fmt.noun(list.length, "initiative");
      const nParts = nounStr.split(fmt.NBSP);
      const counter = document.createElement("div");
      counter.style.cssText = "display:flex;align-items:baseline;gap:" + suPx(7) + ";";
      const numEl = document.createElement("span");
      numEl.style.cssText = "font-family:var(--f-display);font-variant-numeric:"
        + "tabular-nums;font-size:" + suPx(compact ? 26 : 34)
        + ";font-weight:700;color:var(--ivory);line-height:1;";
      const wordEl = document.createElement("span");
      wordEl.style.cssText = "font-size:" + suPx(compact ? 12 : 13.5)
        + ";color:var(--mut-d);font-weight:600;";
      if (nParts.length > 1) {
        wordEl.textContent = nParts.slice(1).join(fmt.NBSP);
        if (motion) {
          motion.countUp(numEl, list.length, (v) => fmt.int(v),
            "pillar-card:" + p.id + ":" + (opts.key || ""));
        } else {
          numEl.textContent = fmt.int(list.length);
        }
      } else {
        /* صيغ المفرد والمثنى نص كامل بلا رقم — لا عدّ متحركاً عليها */
        numEl.textContent = nounStr;
      }
      counter.appendChild(numEl);
      counter.appendChild(wordEl);
      card.appendChild(counter);

      /* شريط توزيع الحالات: أطوال نسبية بألوان المنظومة، بفواصل المسرح */
      const strip = document.createElement("div");
      strip.style.cssText = "display:flex;height:" + suPx(7)
        + ";border-radius:999px;overflow:hidden;background:rgba(244,241,230,.06);";
      strip.setAttribute("aria-hidden", "true");
      for (const v of vocab) {
        if (!counts[v]) continue;
        const seg = document.createElement("span");
        seg.style.cssText = "flex-grow:" + counts[v] + ";background:"
          + ((ST_META[v] || {}).color || "var(--faint-d)")
          + ";border-inline-end:1px solid var(--stage-1);";
        seg.title = v + " — " + fmt.noun(counts[v], "initiative");
        strip.appendChild(seg);
      }
      card.appendChild(strip);

      /* المفتاح الرقمي: نقطة ملونة + عدد لكل حالة حاضرة */
      const legend = document.createElement("div");
      legend.style.cssText = "display:flex;flex-wrap:wrap;gap:" + suPx(4) + " "
        + suPx(12) + ";font-size:" + suPx(11.5) + ";color:var(--ink2-d);";
      for (const v of vocab) {
        if (!counts[v]) continue;
        const item = document.createElement("span");
        item.style.cssText = "display:inline-flex;align-items:center;gap:"
          + suPx(5) + ";white-space:nowrap;";
        const dot = document.createElement("span");
        dot.style.cssText = "width:" + suPx(7) + ";height:" + suPx(7)
          + ";border-radius:50%;background:"
          + ((ST_META[v] || {}).color || "var(--faint-d)") + ";flex:none;";
        dot.setAttribute("aria-hidden", "true");
        const txt = document.createElement("span");
        txt.textContent = fmt.int(counts[v]) + " " + v;
        txt.style.cssText = "font-variant-numeric:tabular-nums;";
        item.appendChild(dot);
        item.appendChild(txt);
        legend.appendChild(item);
      }
      card.appendChild(legend);

      /* النطاق الزمني المشتق من تواريخ المصدر (مقارنة سلاسل ISO حتمية) */
      if (dated.length) {
        let minStart = dated[0].ini.start, maxEnd = dated[0].ini.end;
        for (const r of dated) {
          if (r.ini.start < minStart) minStart = r.ini.start;
          if (r.ini.end > maxEnd) maxEnd = r.ini.end;
        }
        const foot = document.createElement("div");
        let footText = "النطاق المخطط: " + fmt.date(minStart)
          + " – " + fmt.date(maxEnd);
        if (undated > 0) {
          footText += " · " + fmt.noun(undated, "initiative")
            + " بلا نطاق زمني في المصدر";
        }
        foot.textContent = footText;
        foot.style.cssText = "font-size:" + suPx(11) + ";color:var(--faint-d);"
          + "line-height:1.6;margin-top:auto;";
        card.appendChild(foot);
      }

      /* وصف ناطق كامل للبطاقة */
      card.setAttribute("aria-label",
        name + ": " + fmt.noun(list.length, "initiative") + " — "
        + vocab.filter((v) => counts[v] > 0)
          .map((v) => fmt.int(counts[v]) + " " + v).join("، "));

      /* تفاعل اختياري: القسم يمرر onSelect لفتح طبقة تفاصيل المحور */
      if (typeof opts.onSelect === "function") {
        card.setAttribute("role", "button");
        card.style.cursor = "pointer";
        const fire = () => opts.onSelect(p, list.map((r) => ({
          id: r.ini.id,
          name: r.ini.name,
          start: r.ini.start,
          end: r.ini.end,
          status: r.status,
        })));
        card.addEventListener("click", fire);
        card.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            fire();
          }
        });
      }

      wrap.appendChild(card);
    }

    el.appendChild(wrap);
    return wrap;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4) kpiBullets — أشرطة bullet للمؤشرات الأربعة عشر (custom series)
     ──────────────────────────────────────────────────────────────────────────
     الصيغ مختلطة (11 نسبة مئوية + 3 قيم عددية بوحدات متباينة) فمحور مشترك
     خام يكذب مقياساً. الحل القانوني: معايرة كل صف على مستهدفه — المحور
     «نسبة بلوغ المستهدف» والمستهدف = 100٪ لكل الصفوف، والقيم الحقيقية
     كاملة في التسميات والتلميح والبديل الجدولي (كل عبر fmt).
     عناصر الصف: مسار حيادي 0→المستهدف، مدى التحسن (خط الأساس→المستهدف)
     بصبغة ذهبية شفافة، شاخص المستهدف الذهبي مع قيمته الحقيقية، شاخص خط
     الأساس الذهبي المجوف (الذهبي = مستهدف/خط أساس حصراً)، والوسم الصادق
     «القيمة الحالية غير متوفرة» فوق كل مسار — current تبقى null بصدق ولا
     امتلاء بياني مختلقاً. opts: { key?, compact? }
     ══════════════════════════════════════════════════════════════════════════ */
  function kpiBullets(el, su, opts) {
    opts = opts || {};
    const compact = !!opts.compact;
    const kd = kpiRows();
    const kpis = kd.kpis;

    /* موضع خط الأساس على مسار معاير بالمستهدف — البوابة تضمن target > baseline
       وbaseline ≥ 0، فالمقام موجب حتماً */
    const base01 = (k) => (k.target > 0 ? k.baseline / k.target : 0);

    guard("kpiBullets", {
      "كل المقامات موجبة (target > 0)": kpis.every((k) => k.target > 0),
      "مواضع خط الأساس ضمن [0,1)": kpis.every((k) => {
        const b = base01(k);
        return b >= 0 && b < 1;
      }),
    });

    const cats = kpis.map((k) => String(k.name));

    /** راسم صف bullet الواحد */
    function renderBullet(params, api) {
      const i = api.value(2);
      const k = kpis[i];
      const cy = api.coord([0, i])[1];
      const rowH = api.size([0, 1])[1];
      const trackH = Math.max(5, Math.min(rowH * 0.28, T.fs(su, 9)));
      const p0 = api.coord([0, i]);                    // يمين (الصفر)
      const p1 = api.coord([1, i]);                    // يسار (المستهدف)
      const pb = api.coord([base01(k), i]);            // خط الأساس
      const x0 = Math.min(p0[0], p1[0]);
      const w = Math.max(Math.abs(p0[0] - p1[0]), 3);
      const y0 = cy - trackH / 2;
      const kids = [];

      /* المسار الحيادي الكامل 0 → المستهدف */
      kids.push({
        type: "rect",
        shape: { x: x0, y: y0, width: w, height: trackH, r: trackH / 2 },
        style: { fill: "rgba(244,241,230,.07)" },
      });

      /* مدى التحسن المطلوب (خط الأساس → المستهدف) بصبغة ذهبية شفافة —
         الذهبي هنا امتداد دلالة «مستهدف/خط أساس» لا فئة بيانات جديدة */
      const gx0 = Math.min(pb[0], p1[0]);
      const gw = Math.abs(pb[0] - p1[0]);
      if (gw > 1) {
        kids.push({
          type: "rect",
          shape: { x: gx0, y: y0, width: gw, height: trackH, r: trackH / 2 },
          style: { fill: "rgba(214,171,76,.13)" },
        });
      }

      /* الوسم الصادق فوق منتصف المسار: لا قيمة حالية — لا امتلاء مختلقاً */
      if (!compact) {
        kids.push({
          type: "text",
          style: {
            text: "القيمة الحالية غير متوفرة",
            x: x0 + w / 2,
            y: y0 - T.fs(su, 6),
            textAlign: "center",
            textVerticalAlign: "bottom",
            fill: T.C.faint,
            font: cFont(su, 10.5),
            opacity: 0.9,
          },
        });
      }

      /* شاخص المستهدف الذهبي عند 100٪ */
      const tickH = Math.min(rowH * 0.6, T.fs(su, compact ? 15 : 19));
      kids.push({
        type: "rect",
        shape: {
          x: p1[0] - T.fs(su, 1.5),
          y: cy - tickH / 2,
          width: T.fs(su, 3),
          height: tickH,
          r: 1.2,
        },
        style: { fill: T.C.gold },
      });

      /* قيمة المستهدف الحقيقية يسار الشاخص (خارج المسار، داخل الهامش) */
      kids.push({
        type: "text",
        style: {
          text: kpiVal(k, k.target),
          x: p1[0] - T.fs(su, 8),
          y: cy,
          textAlign: "right",
          textVerticalAlign: "middle",
          fill: T.C.gold,
          font: cFont(su, compact ? 11 : 12.5, 700, true),
        },
      });

      /* شاخص خط الأساس: دائرة ذهبية مجوفة على أرضية المسرح */
      kids.push({
        type: "circle",
        shape: { cx: pb[0], cy: cy, r: Math.max(3, trackH * 0.55) },
        style: { fill: T.C.stage1, stroke: T.C.gold, lineWidth: 1.5 },
      });

      /* قيمة خط الأساس تحت شاخصه — للصفوف ذات الأساس غير الصفري فقط */
      if (!compact && k.baseline > 0) {
        kids.push({
          type: "text",
          style: {
            text: kpiVal(k, k.baseline),
            x: pb[0],
            y: cy + trackH / 2 + T.fs(su, 4),
            textAlign: "center",
            textVerticalAlign: "top",
            fill: T.C.gold,
            font: cFont(su, 10.5, 600, true),
            opacity: 0.85,
          },
        });
      }

      return { type: "group", children: kids };
    }

    const c = T.chart(cid("kpiBullets", opts), el);
    c.setOption(Object.assign(T.base(su), {
      /* الوسم الذهبي بنص ملاحظة الإصدار حرفياً — إفصاح المنهجية أعلى الرسم */
      graphic: [caveatBadge(su, String(kd.note))],
      grid: {
        top: T.fs(su, compact ? 26 : 34),
        bottom: T.fs(su, compact ? 30 : 42),
        left: T.fs(su, compact ? 72 : 96),
        right: T.fs(su, compact ? 198 : 256),
        containLabel: false,
      },
      xAxis: Object.assign(T.hValAxis(su, (v) => fmt.pct(round1(v * 100))), {
        min: 0,
        max: 1,
        interval: 0.25,
        name: compact ? "" : "نسبة بلوغ المستهدف — المستهدف = 100٪",
        nameLocation: "middle",
        nameGap: T.fs(su, 28),
        nameTextStyle: txtStyle(su, 11.5, T.C.faint),
      }),
      yAxis: T.hCatAxis(su, cats, T.fs(su, compact ? 182 : 236)),
      tooltip: Object.assign(T.tooltip(su), {
        formatter: (p) => {
          const k = kpis[p.dataIndex];
          const span = k.pct
            ? fmt.pct(round1((k.target - k.baseline) * 100))
            : fmt.int(k.target - k.baseline);
          return T.ttTitle(k.name)
            + T.ttRow("المعرف", fmt.iso(String(k.id)))
            + T.ttRow("النوع", String(k.type))
            + T.ttRow("الصيغة", k.pct ? "نسبة مئوية" : "قيمة عددية")
            + T.ttRow("خط الأساس", kpiVal(k, k.baseline), T.C.gold)
            + T.ttRow("المستهدف", kpiVal(k, k.target), T.C.gold)
            + T.ttRow("مدى التحسن المطلوب", span)
            + T.ttRow("القيمة الحالية", "غير متوفرة")
            + ttNote(k.current_note);
        },
      }),
      series: [{
        name: "__bullets",
        type: "custom",
        renderItem: renderBullet,
        encode: { x: [0, 1], y: 2 },
        clip: false,
        z: 10,
        data: kpis.map((k, i) => [0, 1, i]),
      }],
    }), true);

    const nPct = kpis.filter((k) => k.pct).length;
    a11y(el,
      "أشرطة مؤشرات الأداء: " + fmt.noun(kpis.length, "indicator")
      + " استراتيجياً، منها " + fmt.int(nPct) + " بصيغة نسبة مئوية و"
      + fmt.int(kpis.length - nPct) + " بصيغة عددية؛ لكل مؤشر خط أساس"
      + " ومستهدف من خطة العمل، والقيم الحالية غير متوفرة — "
      + String(kd.note));

    srTable(el, "مؤشرات الأداء — خط الأساس والمستهدف (القيم الحالية غير متوفرة)",
      ["المؤشر", "المعرف", "الصيغة", "خط الأساس", "المستهدف", "القيمة الحالية"],
      kpis.map((k) => [
        String(k.name),
        fmt.int(k.id),
        k.pct ? "نسبة مئوية" : "عدد",
        kpiVal(k, k.baseline),
        kpiVal(k, k.target),
        "غير متوفرة",
      ]));

    keyNav(el, c, kpis.length, tipShower(c, 0));
    return c;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5) kpiMatrix — مصفوفة المؤشرات الجدولية (DOM خالص، ليست ECharts)
     ──────────────────────────────────────────────────────────────────────────
     جدول كثيف (أصناف table-dense/table-scroll من dashboard.css) بصفوف
     الأربعة عشر مؤشراً: المعرف، الاسم، النوع، الصيغة، خط الأساس، المستهدف
     (ذهبي — دلالته الحصرية)، والقيمة الحالية «غير متوفرة» بوسم ذهبي صادق.
     الأعمدة الرقمية قابلة للفرز بالنقر/لوحة المفاتيح (aria-sort) — فرز
     عرضي محض لا يمس البيانات. يُبنى بـ textContent حصراً — لا مسار HTML.
     opts: { key?, compact? } — ترجع عنصر الحاوية المُلحق.
     ══════════════════════════════════════════════════════════════════════════ */
  function kpiMatrix(el, su, opts) {
    opts = opts || {};
    const compact = !!opts.compact;
    const kd = kpiRows();
    const kpis = kd.kpis;
    const suPx = (n) => "calc(var(--su) * " + n + ")";

    const old = el.querySelector(":scope > .kpi-matrix");
    if (old) old.remove();

    const wrap = document.createElement("div");
    wrap.className = "kpi-matrix";
    wrap.style.cssText = "display:flex;flex-direction:column;min-height:0;"
      + "flex:1;min-width:0;";

    const scroll = document.createElement("div");
    scroll.className = "table-scroll";
    scroll.setAttribute("tabindex", "0");
    scroll.setAttribute("aria-label", "مصفوفة مؤشرات الأداء — جدول قابل للتمرير");

    const table = document.createElement("table");
    table.className = "table-dense";

    const caption = document.createElement("caption");
    caption.textContent = "مصفوفة مؤشرات الأداء — خط الأساس والمستهدف من"
      + " خطة العمل، والقيم الحالية تُدار من المنصة";
    if (compact) {
      /* في المدمج: التسمية لقارئات الشاشة فقط — بصرياً تكرر عنوان البطاقة
         وسطرها الثانوي وتسرق ارتفاع صف كامل (كثافة الجولة 3) */
      caption.style.cssText = "position:absolute;width:1px;height:1px;"
        + "overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;";
    } else {
      caption.style.cssText = "text-align:start;font-size:" + suPx(12)
        + ";color:var(--faint-d);padding-bottom:" + suPx(6) + ";caption-side:top;";
    }
    table.appendChild(caption);

    /* تعريف الأعمدة: sortKey يجعل العمود قابلاً للفرز (قيم رقمية خالصة).
       إصلاح مراجعة الجولة 2: في المدمج ترويسة العمود الأخير «القيمة».
       إصلاح مراجعة الجولة 3: في المدمج يسقط عمودا «النوع» و«الصيغة» —
       النوع ثابت («استراتيجي» لكل الصفوف، معلن في سطر الخلاصة) والصيغة
       تُدمج رقاقة صغيرة داخل خلية الاسم؛ فيسترد عمود «المؤشر» عرضه
       (~40٪) ويلتف الاسم سطرين بحد أقصى بقصّ معلن … بدل برج
       كلمة-في-كل-سطر الذي أفقد المصفوفة كثافتها. */
    const BASE_COLS = [
      { label: "#", sortKey: (k) => k.id },
      { label: "المؤشر", sortKey: null },
      { label: "النوع", sortKey: null, wide: true },
      { label: "الصيغة", sortKey: null, wide: true },
      { label: "خط الأساس", sortKey: (k) => k.baseline },
      { label: "المستهدف", sortKey: (k) => k.target },
      { label: compact ? "القيمة" : "القيمة الحالية", sortKey: null },
    ];
    const COLS = compact ? BASE_COLS.filter((c) => !c.wide) : BASE_COLS;

    /* حالة الفرز العرضية: الافتراضي الترتيب القانوني بالمعرف تصاعدياً */
    const sort = { idx: 0, dir: 1 };

    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    const headCells = [];
    COLS.forEach((col, ci) => {
      const th = document.createElement("th");
      th.scope = "col";
      if (col.sortKey) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = col.label;
        btn.style.cssText = "background:none;border:none;padding:0;margin:0;"
          + "font:inherit;color:inherit;cursor:pointer;";
        btn.setAttribute("aria-label", "فرز حسب " + col.label);
        btn.addEventListener("click", () => {
          if (sort.idx === ci) {
            sort.dir = -sort.dir;
          } else {
            sort.idx = ci;
            sort.dir = 1;
          }
          renderBody();
        });
        th.appendChild(btn);
        const arrow = document.createElement("span");
        arrow.className = "sort-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.style.cssText = "margin-inline-start:" + suPx(4)
          + ";color:var(--gold);";
        th.appendChild(arrow);
      } else {
        th.textContent = col.label;
      }
      headCells.push(th);
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    /** بناء جسد الجدول وفق حالة الفرز الحالية — عرض محض، البيانات ثابتة */
    function renderBody() {
      tbody.textContent = "";
      const col = COLS[sort.idx];
      const rows = kpis.slice();
      if (col && col.sortKey) {
        rows.sort((a, b) => (col.sortKey(a) - col.sortKey(b)) * sort.dir);
      }
      /* مؤشرات aria-sort وأسهم الاتجاه على الترويسات */
      COLS.forEach((cc, ci) => {
        const th = headCells[ci];
        if (!cc.sortKey) return;
        const arrow = th.querySelector(".sort-arrow");
        if (ci === sort.idx) {
          th.setAttribute("aria-sort", sort.dir > 0 ? "ascending" : "descending");
          if (arrow) arrow.textContent = sort.dir > 0 ? "↑" : "↓";
        } else {
          th.removeAttribute("aria-sort");
          if (arrow) arrow.textContent = "";
        }
      });

      for (const k of rows) {
        const tr = document.createElement("tr");

        const tdId = document.createElement("td");
        tdId.textContent = fmt.int(k.id);
        tdId.style.cssText = "color:var(--faint-d);";
        tr.appendChild(tdId);

        const tdName = document.createElement("td");
        const bName = document.createElement("b");
        bName.textContent = String(k.name);
        tdName.appendChild(bName);
        /* إصلاح مراجعة الجولة 3: في المدمج يأخذ الاسم ~40٪ من عرض الجدول
           بسطرين بحد أقصى وقصّ معلن … (الاسم الكامل في التلميح)، ورقاقة
           الصيغة تُدمج بجانبه بدل عمود مستقل — فتظهر 4-5 صفوف كاملة بلا
           التفاف كلمة-في-كل-سطر. */
        if (compact) {
          /* الصيغة في التلميح (العمود المستقل أُسقط والرقاقة المرئية كانت
             تضيف سطراً ثالثاً لكل صف فتُنقص الصفوف الظاهرة) — والنوع ثابت
             معلن في سطر الخلاصة أسفل الجدول */
          tdName.title = String(k.name) + " — الصيغة: "
            + (k.pct ? "نسبة مئوية" : "قيمة عددية");
          tdName.style.cssText = "white-space:normal;line-height:1.5;"
            + "width:40%;min-width:" + suPx(150) + ";";
          bName.style.cssText = "display:-webkit-box;-webkit-line-clamp:2;"
            + "-webkit-box-orient:vertical;overflow:hidden;";
        } else {
          tdName.style.cssText = "white-space:normal;line-height:1.5;min-width:"
            + suPx(230) + ";";
        }
        tr.appendChild(tdName);

        if (!compact) {
          const tdType = document.createElement("td");
          tdType.textContent = String(k.type);
          tdType.style.cssText = "color:var(--mut-d);";
          tr.appendChild(tdType);

          const tdForm = document.createElement("td");
          tdForm.textContent = k.pct ? "نسبة مئوية" : "عدد";
          tdForm.style.cssText = "color:var(--mut-d);";
          tr.appendChild(tdForm);
        }

        const tdBase = document.createElement("td");
        tdBase.textContent = kpiVal(k, k.baseline);
        tr.appendChild(tdBase);

        const tdTarget = document.createElement("td");
        tdTarget.textContent = kpiVal(k, k.target);
        tdTarget.style.cssText = "color:var(--gold);font-weight:700;";
        tr.appendChild(tdTarget);

        const tdCur = document.createElement("td");
        const curTag = document.createElement("span");
        curTag.textContent = "غير متوفرة";
        curTag.title = String(k.current_note);
        curTag.style.cssText = "color:var(--gold-hi);font-size:" + suPx(12.5)
          + ";border:1px dashed rgba(214,171,76,.4);border-radius:999px;"
          + "padding:" + suPx(1.5) + " " + suPx(9) + ";white-space:nowrap;";
        tdCur.appendChild(curTag);
        tr.appendChild(tdCur);

        tbody.appendChild(tr);
      }
    }
    renderBody();

    scroll.appendChild(table);
    wrap.appendChild(scroll);

    /* سطر الخلاصة المحسوب: الأعداد كلها من البيانات لا من نص مكتوب */
    const nPct = kpis.filter((k) => k.pct).length;
    const nAbs = kpis.length - nPct;
    const note = document.createElement("p");
    note.textContent = fmt.noun(kpis.length, "indicator") + " من النوع «"
      + String(kpis[0].type) + "» — مرر داخل الجدول لاستعراضها كاملة: "
      + fmt.int(nPct) + " بصيغة نسبة مئوية و"
      + fmt.int(nAbs) + " بصيغة عددية — " + String(kd.note) + ".";
    note.title = note.textContent;
    /* في المدمج سطر واحد بقصّ معلن … (النص الكامل في التلميح) — يحرر
       ارتفاع صف كامل لصالح صفوف البيانات (كثافة الجولة 3) */
    note.style.cssText = "font-size:" + suPx(12) + ";color:var(--faint-d);"
      + "line-height:1.6;margin:" + suPx(6) + " 0 0;flex:none;"
      + (compact
        ? "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
        : "");
    wrap.appendChild(note);

    el.appendChild(wrap);
    return wrap;
  }

  /* ── التسجيل في مساحة الأسماء المشتركة (ملفات الرسوم الأخرى تدمج مثلها) ── */
  Object.assign(RH.viz.charts2, {
    initiativeGantt,
    statusDonut,
    pillarCards,
    kpiBullets,
    kpiMatrix,
  });

  /* منفذ اختبار داخلي (ليس من القائمة القانونية للمنشئين): يكشف مرآة قاعدة
     الحالة والقراءات الموحدة كي تتحقق الاختبارات من تطابق المخرجين python/JS
     (2 منجزة / 9 جاري العمل / 7 متأخرة عند تاريخ الحساب المنشور).
     البادئة السفلية تعلن أنه غير معد للاستهلاك من الأقسام. */
  RH.viz.charts2._strategyInternals = {
    statusOf: statusOf,
    strategyRows: strategyRows,
    statusCounts: statusCounts,
    kpiRows: kpiRows,
    kpiVal: kpiVal,
    isoMs: isoMs,
  };
})();
