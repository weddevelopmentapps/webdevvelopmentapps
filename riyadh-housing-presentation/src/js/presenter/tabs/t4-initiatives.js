/* ════════════════════════════════════════════════════════════════════════════
   t4-initiatives.js — التبويب ٤: «المبادرات» (V3_SPEC §4 و§4-ب · V3_CONTRACTS §4)
   ────────────────────────────────────────────────────────────────────────────
   الموجز الملزم لهذا التبويب:
     ▸ أعلى الشاشة: **الركائز الأربع حلقات تقدم دائرية كبيرة** — الحلقة نسبة
       ‎المنجز من مبادرات الركيزة‎ عدداً، ومعها **العدّ الظاهر** («1 من 6»).
     ▸ تحت الحلقات: الخط الزمني لمبادرات الخطة من تواريخ المصدر وحدها،
       وشاخص ذهبي عند تاريخ الحساب.
     ▸ ثم تحت كل ركيزة **قائمة مبادراتها** بحالتها اللونية وشريط
       «مضي المدة الزمنية» **المسمّى حرفياً**.
     ▸ التفاعل: نقر الركيزة يبرزها (حالة مختارة) ويصفّي القائمة والخط الزمني؛
       وزر «إبراز» داخل بطاقة الركيزة يفتح نافذة الإبراز (الطبقة الثانية).

   ══ صدق البيانات (V3_SPEC §4-ب — يُنفَّذ حرفياً، ولا استثناء) ══
     • **لا توجد «نسبة إنجاز» لكل مبادرة في المصدر.** المتاح: الحالة
       (منجزة/جاري العمل/متأخرة/لم يتم البدء) والتواريخ لا غير. لذلك:
         – **حلقة الركيزة** = عدد المنجز ÷ عدد مبادرات الركيزة، بتسمية صريحة
           «المنجز من مبادرات الركيزة» وعدٍّ ظاهر بجانب النسبة.
         – **شريط المبادرة** = «مضي المدة الزمنية» = (تاريخ الحساب − البداية)
           ÷ (النهاية − البداية)، **بتسمية حرفية لا تدّعي الإنجاز**؛
           و**يُخفى** لمن لا تاريخ له؛ و**المنجزة تُعرض 100٪ إنجازاً**.
     • حالة كل مبادرة تُحسب بقاعدة ‎strategy.status_rule‎ الحرفية: حالة الملف
       إن وُجدت، وإلا فمن تجاوزت نهايتها المخططة «متأخرة» حكماً، ومن بدأت ولم
       تنته «جاري العمل»، وإلا «لم يتم البدء». لا اجتهاد خارج هذه القاعدة.
     • المبادرتان بلا تواريخ في المصدر تُعلَنان كذلك ولا تُخترع لهما نطاقات،
       ولا تظهران على الخط الزمني (يُذكر غيابهما في وسم البطاقة).

   حدود الكثافة (V3_SPEC §3):
     • ثلاثة عناصر في اللوح: شريط الحلقات + بطاقة الخط الزمني + بطاقة القوائم
       — أقل من الحد (أربعة عناصر)، ورسم رئيس واحد في صفّه (الحد رسمان).
     • الرسم الرئيس بالصنف ‎.tabchart‎ (‎min-height: min(46vh,420px)‎) ويرتفع
       إلى ‎.is-tall‎ حين تُعرض المحفظة كاملة.

   طبقات النقر الثلاث (V3_SPEC §5) — لا رابعة:
     ١) تحويم على شريط الخط الزمني → ‎T.ttMicro‎: سطران (عنوان + قيمة واحدة).
     ٢) نقرة أولى (شريط/صف قائمة/رقاقة حالة/زر إبراز الركيزة) → ‎ctx.highlight‎:
        جملة واحدة + ≤3 أرقام + زر واحد، بحدّ ‎320‎ حرفاً يحرسه اختبار الوحدة
        ‎tests/unit/tab-initiatives.test.mjs‎.
     ٣) الزر → ملحق ‎pillar‎ (أو ‎pillar/<id>‎) بحالة عودة يرمّزها المحرك.
     • نقر بطاقة الركيزة نفسها **تصفية** لا نافذة: الموجز يطلبها حرفياً
       («نقر الركيزة يبرزها ويصفّي القائمة») فبقيت النافذة على زرّها المستقل
       كي لا تنبثق طبقة مشروطة مع كل تصفية.

   اللون: **صفر لون مكتوب**. ألوان الرسم من ‎RH.viz.theme.C‎ (رموز حيّة تُقرأ
   وقت البناء)، وألوان الواجهة والحلقات من ‎var(--…)‎ في
   ‎src/styles/tabs/initiatives.css‎ — فتتبع الحلقات السمتين بلا سطر JS.
   تبديل السمة يعيد بناء التبويب كاملاً عبر خطاف ‎onRetheme‎ في القشرة.
   ════════════════════════════════════════════════════════════════════════════ */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** نسبة بتقريب المشروع الموحد (نصف لأعلى، منزلة واحدة) — تُقرأ وقت النداء */
  const pctOf = (num, den) => RH.data.derive.pct(num, den);

  const DAY_MS = 86400000;

  /* ── مفردات الحالة: مرآة ‎strategy.status_vocabulary‎ حرفياً ─────────────── */
  const ST_DONE = "منجزة";
  const ST_RUN = "جاري العمل";
  const ST_LATE = "متأخرة";
  const ST_IDLE = "لم يتم البدء";
  /** ترتيب العرض القانوني (ترتيب المفردات في المصدر) */
  const ST_ORDER = Object.freeze([ST_DONE, ST_RUN, ST_LATE, ST_IDLE]);

  /** أصناف CSS الدلالية: أخضر=منجز · أزرق=جارٍ (فئة ثانوية) · مرجاني=تأخر
      حصراً · رمادي خافت=غياب بدء. اللون تعزيز لا حامل معنى وحيد — كل حالة
      مكتوبة نصاً بجانب نقطتها في كل موضع تظهر فيه. */
  const ST_CLS = {};
  ST_CLS[ST_DONE] = "done";
  ST_CLS[ST_RUN] = "run";
  ST_CLS[ST_LATE] = "late";
  ST_CLS[ST_IDLE] = "idle";

  /** نغمة أرقام نافذة الإبراز (دلالية فقط) */
  const ST_TONE = {};
  ST_TONE[ST_DONE] = "pos";
  ST_TONE[ST_RUN] = null;
  ST_TONE[ST_LATE] = "neg";
  ST_TONE[ST_IDLE] = null;

  /** التسمية الظاهرة للحالة: «متأخرة» تُقرأ «متأخرة حكماً» لأنها محسوبة
      بقاعدة الخطة لا مسجَّلة في الملف — والتصريح جزء من الصدق لا زخرفة. */
  const ST_LABEL = {};
  ST_LABEL[ST_DONE] = ST_DONE;
  ST_LABEL[ST_RUN] = ST_RUN;
  ST_LABEL[ST_LATE] = ST_LATE + " حكماً";
  ST_LABEL[ST_IDLE] = ST_IDLE;

  /* ── التسميات الحرفية الملزمة (V3_SPEC §4-ب) — لا تُعاد صياغتها ────────── */
  /** تسمية حلقة الركيزة — نص المواصفة حرفياً */
  const RING_LABEL = "المنجز من مبادرات الركيزة";
  /** تسمية شريط المبادرة — نص المواصفة حرفياً: زمن مضى، لا إنجاز أُحرز */
  const BAR_ELAPSED = "مضي المدة الزمنية";
  /** المنجزة تُعرض 100٪ إنجازاً (وهي الحالة الوحيدة التي يجوز فيها ذكر إنجاز) */
  const BAR_DONE = "إنجاز مسجَّل";
  /** من لا تاريخ له: لا شريط ولا نسبة — إعلان صريح بدل فراغ صامت */
  const BAR_NONE = "لا تواريخ في المصدر";

  /** الملحق الوحيد لهذا التبويب ونص زره */
  const AX_ID = "pillar";
  const AX_LABEL = "التفاصيل الكاملة في الملحق";
  /** حجم صفحة سجل الملحق — مرآة ‎ROWS_PER_PAGE‎ في ‎ax-pillar.js‎ */
  const ROWS_PER_PAGE = 9;

  /** صيغ عدد ومعدود محلية لما لا تغطيه ‎NOUNS‎ المركزية */
  const LOCAL_NOUNS = {
    day: {
      one: "يوم واحد", two: "يومان", few: "أيام",
      many: "يوماً", hundred: "يوم", zero: "لا أيام",
    },
    enabler: {
      one: "ممكن واحد", two: "ممكنان", few: "ممكنات",
      many: "ممكناً", hundred: "ممكن", zero: "لا ممكنات",
    },
  };
  const dayNoun = (n) => fmt.countNoun(n, LOCAL_NOUNS.day);

  /* ══════════════════════════════════════════════════════════════════════════
     ١) النموذج النقي — دوال بلا DOM ولا ECharts، مغطاة باختبار الوحدة
        ‎tests/unit/tab-initiatives.test.mjs‎ (اشتقاق · تسميات · حدود).
     ══════════════════════════════════════════════════════════════════════════ */

  /** "2026-04-01" → ميلي ثانية UTC حتمية؛ ‎NaN‎ للغائب/غير الصالح */
  function isoMs(iso) {
    if (!iso) return NaN;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
    if (!m) return NaN;
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  }

  /**
   * الحالة وفق ‎strategy.status_rule‎ حرفياً:
   * حالة الملف إن وُجدت؛ وإلا: نهاية مخططة سبقت تاريخ الحساب → «متأخرة» حكماً،
   * بداية بلغت تاريخ الحساب → «جاري العمل»، وإلا «لم يتم البدء».
   * مقارنة سلاسل ISO مباشرة — حتمية وبلا مناطق زمنية.
   */
  function statusOf(ini, calcDate) {
    if (!ini) return ST_IDLE;
    if (ini.status) return String(ini.status);
    if (ini.end && ini.end < calcDate) return ST_LATE;
    if (ini.start && ini.start <= calcDate) return ST_RUN;
    return ST_IDLE;
  }

  /**
   * **مضي المدة الزمنية** — لا نسبة إنجاز.
   * ‎(تاريخ الحساب − البداية) ÷ (النهاية − البداية)‎ محصورة في ‎[0,100]‎.
   * تعيد ‎null‎ لمن ينقصه أحد التاريخين (فيُخفى شريطه — لا صفر مختلق).
   */
  function elapsedOf(ini, calcMs) {
    const startMs = isoMs(ini && ini.start);
    const endMs = isoMs(ini && ini.end);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
    const span = endMs - startMs;
    /* المدة المخططة بالأيام شاملةً الطرفين — مرآة حساب القسم السادس */
    const days = Math.round(span / DAY_MS) + 1;
    if (span <= 0) {
      /* نطاق بيوم واحد: إما انقضى كاملاً أو لم يبدأ — لا قسمة على صفر */
      return { pct: calcMs >= endMs ? 100 : 0, days, startMs, endMs, span: 0 };
    }
    const passed = Math.min(Math.max(calcMs - startMs, 0), span);
    return { pct: pctOf(passed, span), days, startMs, endMs, span };
  }

  /**
   * شريط المبادرة الواحد — الحاكم الوحيد لما يُرسم تحت كل مبادرة:
   *   ‎done‎    منجزة → 100٪ **إنجازاً** (النص الوحيد الذي يجوز فيه ذكر إنجاز)
   *   ‎elapsed‎ مؤرخة غير منجزة → «مضي المدة الزمنية» بنسبته
   *   ‎none‎    بلا تاريخ → **لا شريط** وإعلان صريح بغياب التواريخ
   */
  function barOf(row) {
    if (!row) return { kind: "none", pct: null, caption: BAR_NONE, value: "—" };
    if (row.status === ST_DONE) {
      return { kind: "done", pct: 100, caption: BAR_DONE, value: fmt.pct(100) };
    }
    if (!row.elapsed) {
      return { kind: "none", pct: null, caption: BAR_NONE, value: "—" };
    }
    return {
      kind: "elapsed",
      pct: row.elapsed.pct,
      caption: BAR_ELAPSED,
      value: fmt.pct(row.elapsed.pct),
    };
  }

  /**
   * صفوف المحفظة بترتيب الركيزة ثم المعرف عددياً — ترتيب حتمي على كل متصفح
   * ومطابق لترتيب الملحق وقسم V2 (فلا يختلف صف عن صفه بين الشاشات).
   */
  function rows(release) {
    const st = release.strategy;
    const calc = release.meta.calculation_date;
    const calcMs = isoMs(calc);
    const order = {};
    (st.pillars || []).forEach((p, i) => { order[p.id] = i; });

    return (st.initiatives || []).slice().sort((a, b) => {
      const d = (order[a.pillar_id] || 0) - (order[b.pillar_id] || 0);
      if (d !== 0) return d;
      return String(a.id).localeCompare(String(b.id), "en", { numeric: true });
    }).map((ini) => {
      const status = statusOf(ini, calc);
      const elapsed = elapsedOf(ini, calcMs);
      const row = {
        id: String(ini.id),
        name: String(ini.name),
        pillarId: String(ini.pillar_id),
        pillar: st.pillars[order[ini.pillar_id]] || null,
        start: ini.start || null,
        end: ini.end || null,
        status,
        dated: !!elapsed,
        elapsed,
      };
      row.bar = barOf(row);
      return row;
    });
  }

  /**
   * الركائز الأربع جاهزة للحلقات.
   * ‎pct‎ = المنجز ÷ الإجمالي **عدداً** (لا وزناً — لا أوزان في المصدر)،
   * و‎countLabel‎ العدّ الظاهر الملزم («1 من 6») بعزل اتجاهي.
   */
  function pillars(release) {
    const st = release.strategy;
    const all = rows(release);
    return (st.pillars || []).map((p) => {
      const list = all.filter((r) => r.pillarId === String(p.id));
      const counts = {};
      for (const v of ST_ORDER) counts[v] = 0;
      for (const r of list) counts[r.status] = (counts[r.status] || 0) + 1;
      const done = counts[ST_DONE] || 0;
      const name = String(p.name);
      const cut = name.indexOf(":");
      return {
        id: String(p.id),
        kind: String(p.kind),
        name,
        /* «ركيزة 1» / «ممكن 4» — الشطر قبل النقطتين كما ورد في المصدر */
        kicker: cut > 0 ? name.slice(0, cut).trim() : String(p.kind),
        title: cut > 0 ? name.slice(cut + 1).trim() : name,
        list,
        total: list.length,
        done,
        counts,
        pct: list.length ? pctOf(done, list.length) : null,
        countLabel: fmt.iso(fmt.int(done) + " من " + fmt.int(list.length)),
      };
    });
  }

  /** إحصاء المحفظة كاملة + نطاقها الزمني المشتق من تواريخ المصدر وحدها */
  function portfolio(release) {
    const all = rows(release);
    const calc = release.meta.calculation_date;
    const calcMs = isoMs(calc);
    const counts = {};
    for (const v of ST_ORDER) counts[v] = 0;
    for (const r of all) counts[r.status] = (counts[r.status] || 0) + 1;

    let minStart = null, maxEnd = null;
    for (const r of all) {
      if (!r.dated) continue;
      if (minStart === null || r.start < minStart) minStart = r.start;
      if (maxEnd === null || r.end > maxEnd) maxEnd = r.end;
    }
    const minStartMs = isoMs(minStart);
    const maxEndMs = isoMs(maxEnd);
    const dated = all.filter((r) => r.dated).length;

    return {
      calc, calcMs, counts,
      total: all.length,
      pillars: (release.strategy.pillars || []).length,
      dated,
      undated: all.length - dated,
      minStart, maxEnd, minStartMs, maxEndMs,
      spanDays: Number.isFinite(minStartMs) && Number.isFinite(maxEndMs)
        ? Math.round((maxEndMs - minStartMs) / DAY_MS) : 0,
      calcDay: Number.isFinite(minStartMs)
        ? Math.round((calcMs - minStartMs) / DAY_MS) : 0,
    };
  }

  /** ترشيح صفوف بركيزة — معرف مجهول أو فارغ يعيد المحفظة كاملة بصمت */
  function filterRows(all, pillarId) {
    const id = String(pillarId || "");
    if (!id) return all.slice();
    const hit = all.filter((r) => r.pillarId === id);
    return hit.length ? hit : all.slice();
  }

  /**
   * هندسة حلقة SVG نقية: محيط الدائرة وإزاحة الشرطة المقابلة لنسبة مئوية.
   * ‎pct = 0‎ → إزاحة = المحيط كاملاً (قوس معدوم، لا قوس كامل مضلِّل).
   */
  function ringDash(pctValue, radius) {
    const r = Number(radius) || 0;
    const circumference = 2 * Math.PI * r;
    const raw = Number(pctValue);
    const p = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;
    return { circumference, offset: circumference * (1 - p / 100) };
  }

  /** تسمية محور الخط الزمني: رقم اليوم منذ أقدم بداية → «أبريل 2026» */
  function dayLabel(baseMs, day) {
    if (!Number.isFinite(baseMs)) return "—";
    const t = baseMs + Math.round(Number(day) || 0) * DAY_MS;
    const d = new Date(t);
    const mm = String(d.getUTCMonth() + 1);
    return fmt.date(d.getUTCFullYear() + "-" + (mm.length < 2 ? "0" + mm : mm));
  }

  /**
   * فهرس صفحة «المتأخرة حكماً» في ملحق ‎pillar‎ — مرآة ترقيم ‎ax-shell/ax-pillar‎:
   * سجل يزيد على صفحة يُقسَّم أولاً، ثم تُلحق صفحة المتأخرات في الذيل.
   * (وحتى لو تغيّر حجم الصفحة هناك، يقصّ ‎ax-shell‎ الفهرس داخل المدى — لا شاشة فارغة.)
   */
  function latePageIndex(rowCount) {
    const n = Math.max(0, Math.round(Number(rowCount) || 0));
    return n <= ROWS_PER_PAGE ? 1 : Math.ceil(n / ROWS_PER_PAGE);
  }

  /* ── مواصفات الإبراز (الطبقة الثانية) — جملة واحدة + ≤3 أرقام + زر واحد ──
     ‎note‎ خارج حدّ الأحرف عمداً: وسم صدق/مصدر لا يُقصّ أبداً (عقد §5-ج). */

  /** وسم الصدق الموحد: الحلقة عددية والشريط زمني — لا نسبة إنجاز مخترعة */
  const honestyNote = (release) =>
    "الحلقة نسبة المنجز عدداً والشريط زمن مضى لا إنجاز — لا نسب إنجاز في المصدر · "
    + "البيانات حتى " + release.meta.data_as_of + ".";

  function pillarSpec(release, pillarId) {
    const list = pillars(release);
    const p = list.find((x) => x.id === String(pillarId)) || list[0];
    const stats = [{
      label: RING_LABEL,
      value: p.countLabel,
      tone: p.done > 0 ? "pos" : null,
    }];
    /* بقية الحالات ذات الرصيد بترتيب المفردات — بحد ثلاثة أرقام إجمالاً */
    for (const v of ST_ORDER) {
      if (v === ST_DONE || !p.counts[v] || stats.length >= 3) continue;
      stats.push({
        label: ST_LABEL[v],
        value: fmt.noun(p.counts[v], "initiative"),
        tone: ST_TONE[v],
      });
    }
    return {
      title: p.title,
      /* صياغة محايدة النوع: تصلح لـ«ركيزة» ولـ«ممكن» معاً بلا خطأ لغوي */
      sentence: p.kicker + " — المنجز " + p.countLabel
        + " من مبادرات هذا المحور، أي " + fmt.pct(p.pct) + " عدداً لا وزناً.",
      stats,
      appendix: { id: AX_ID + "/" + p.id, params: {}, label: AX_LABEL },
      note: honestyNote(release),
    };
  }

  function initiativeSpec(release, iniId) {
    const all = rows(release);
    const r = all.find((x) => x.id === String(iniId)) || all[0];
    const pv = pillars(release).find((x) => x.id === r.pillarId) || null;
    const tag = "مبادرة " + fmt.iso(r.id);

    let sentence;
    if (r.status === ST_DONE) {
      sentence = tag + " منجزة وفق ملف الخطة"
        + (r.dated ? "." : "، وبلا نطاق زمني مسجّل في المصدر.");
    } else if (!r.dated) {
      sentence = tag + " بلا تواريخ في المصدر، فلا يُعرض لها شريط زمني.";
    } else if (r.status === ST_LATE) {
      sentence = tag + " تجاوزت نهايتها المخططة دون تسجيل إنجاز، وانقضت مدتها "
        + "الزمنية كاملة.";
    } else if (r.status === ST_RUN) {
      sentence = tag + " قيد العمل ومضى " + fmt.pct(r.elapsed.pct)
        + " من مدتها الزمنية حتى تاريخ الحساب.";
    } else {
      sentence = tag + " لم يحن بدؤها بعد وفق تواريخ الخطة.";
    }

    const stats = r.dated
      ? [
        { label: "البداية", value: fmt.date(r.start) },
        { label: "النهاية المخططة", value: fmt.date(r.end) },
        {
          label: r.bar.caption,
          value: r.bar.value,
          tone: r.status === ST_DONE ? "pos" : ST_TONE[r.status],
        },
      ]
      : [
        { label: "الحالة", value: ST_LABEL[r.status], tone: ST_TONE[r.status] },
        { label: "الركيزة", value: pv ? pv.kicker : "—" },
        { label: "التواريخ", value: "غير مدرجة في المصدر" },
      ];

    return {
      title: r.name,
      sentence,
      stats,
      appendix: {
        id: AX_ID + "/" + r.pillarId,
        params: {},
        label: AX_LABEL,
      },
      note: honestyNote(release),
    };
  }

  function statusSpec(release, status) {
    const all = rows(release);
    const port = portfolio(release);
    const st = String(status);
    const list = all.filter((r) => r.status === st);
    const onPillars = new Set(list.map((r) => r.pillarId)).size;
    return {
      title: ST_LABEL[st] || st,
      sentence: "حالة «" + ST_LABEL[st] + "» تضم "
        + fmt.noun(list.length, "initiative") + " من "
        + fmt.noun(port.total, "initiative") + " في المحفظة.",
      stats: [
        {
          label: "العدد",
          value: fmt.noun(list.length, "initiative"),
          tone: ST_TONE[st],
        },
        { label: "الحصة", value: fmt.pct(pctOf(list.length, port.total)) },
        { label: "موزعة على", value: fmt.noun(onPillars, "pillar") },
      ],
      appendix: {
        id: AX_ID,
        params: st === ST_LATE
          ? { page: String(latePageIndex(port.total)) } : {},
        label: AX_LABEL,
      },
      note: honestyNote(release),
    };
  }

  function portfolioSpec(release) {
    const port = portfolio(release);
    const stats = [];
    for (const v of ST_ORDER) {
      if (!port.counts[v] || stats.length >= 3) continue;
      stats.push({
        label: ST_LABEL[v],
        value: fmt.noun(port.counts[v], "initiative"),
        tone: ST_TONE[v],
      });
    }
    return {
      title: "محفظة المبادرات",
      sentence: "خطة العمل " + fmt.noun(port.total, "initiative") + " على "
        + fmt.noun(port.pillars, "pillar") + "، المنجز منها "
        + fmt.noun(port.counts[ST_DONE], "initiative") + " حتى تاريخ الحساب.",
      stats,
      appendix: { id: AX_ID, params: {}, label: AX_LABEL },
      note: honestyNote(release),
    };
  }

  /**
   * كل مواصفات الإبراز التي يستطيع هذا التبويب فتحها — مصدر واحد يفحصه
   * اختبار الوحدة على حدّ ‎320‎ حرفاً وحدّ ثلاثة أرقام (بوابة قبول V3_SPEC §5).
   */
  function allSpecs(release) {
    const out = [portfolioSpec(release)];
    for (const p of pillars(release)) out.push(pillarSpec(release, p.id));
    for (const r of rows(release)) out.push(initiativeSpec(release, r.id));
    const port = portfolio(release);
    for (const v of ST_ORDER) {
      if (port.counts[v]) out.push(statusSpec(release, v));
    }
    return out;
  }

  const MODEL = {
    ST_DONE, ST_RUN, ST_LATE, ST_IDLE, ST_ORDER, ST_CLS, ST_LABEL,
    RING_LABEL, BAR_ELAPSED, BAR_DONE, BAR_NONE,
    AX_ID, AX_LABEL, ROWS_PER_PAGE, DAY_MS,
    isoMs, statusOf, elapsedOf, barOf, rows, pillars, portfolio,
    filterRows, ringDash, dayLabel, latePageIndex,
    pillarSpec, initiativeSpec, statusSpec, portfolioSpec, allSpecs,
  };

  /* ══════════════════════════════════════════════════════════════════════════
     ٢) حارس اتساق تطويري — يُنبّه ولا يُسقط (الإصدار اجتاز بواباته الـ152)
     ══════════════════════════════════════════════════════════════════════════ */
  function guard(where, checks) {
    if (typeof console === "undefined") return;
    for (const label of Object.keys(checks)) {
      if (!checks[label]) {
        console.warn("t4-initiatives/" + where + ": فحص اتساق لم يجتز — " + label);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٣) عناصر الواجهة المشتركة
     ══════════════════════════════════════════════════════════════════════════ */

  /** بطاقة رسم/قائمة بعقد ‎.tabcard‎ الجاهز — تعيد ‎{card, body}‎ */
  function panelCard(opts) {
    const body = h("div", { class: "tabcard-body" });
    const card = h("section", {
      class: "tabcard int-card" + (opts.cls ? " " + opts.cls : ""),
      "aria-label": opts.title,
    },
      h("div", { class: "tabcard-head" },
        h("h2", { class: "tabcard-title" }, opts.title),
        opts.note ? h("p", { class: "tabcard-note" }, opts.note) : null),
      body);
    return { card, body };
  }

  /** نقطة حالة + نصّها — الحالة معلنة نصاً لا باللون وحده (شرط إتاحة) */
  function statusChip(status, cls) {
    return h("span", {
      class: "int-st is-" + (ST_CLS[status] || "idle") + (cls ? " " + cls : ""),
    },
      h("i", { class: "int-st-dot", "aria-hidden": "true" }),
      h("span", { class: "int-st-txt" }, ST_LABEL[status] || String(status)));
  }

  /**
   * شريط المبادرة: العنوان الحرفي + النسبة + المسار.
   * ‎kind === "none"‎ → لا مسار إطلاقاً (V3_SPEC §4-ب: «يُخفى لمن لا تاريخ له»).
   */
  function barBlock(bar) {
    const head = h("span", { class: "int-bar-top" },
      h("span", { class: "int-bar-cap" }, bar.caption),
      h("b", { class: "int-bar-val tnum" }, bar.value));
    if (bar.kind === "none") {
      return h("span", { class: "int-bar is-none" }, head);
    }
    return h("span", { class: "int-bar is-" + bar.kind },
      head,
      h("span", { class: "int-bar-track" },
        h("span", {
          class: "int-bar-fill",
          style: { inlineSize: Math.max(0, Math.min(100, bar.pct)) + "%" },
        })));
  }

  /** توصيل نقر مثيل ECharts بفصل مضمون عند مغادرة التبويب */
  function onChartClick(ctx, chart, handler) {
    chart.on("click", handler);
    ctx.onTeardown(() => {
      try {
        if (!chart.isDisposed()) chart.off("click", handler);
      } catch (_e) { /* أُتلف سلفاً */ }
    });
  }

  /**
   * لون الحالة من الرموز الحيّة — يُقرأ وقت البناء لا وقت التحميل.
   * المنظومة الدلالية المقفلة: أخضر=منجز · أزرق=فئة ثانوية (جارٍ) ·
   * مرجاني=خلل (تأخر) حصراً · خافت=غياب بدء. درجة التوكيد (‎hi‎) من
   * الرمز الشقيق نفسه — ولتدرّج المخالفات درجةٌ من سلّم ‎seqViol‎ ذاته.
   */
  function statusColor(T, status, hi) {
    if (status === ST_DONE) return hi ? T.C.greenHi : T.C.green;
    if (status === ST_LATE) return hi ? T.C.seqViol[3] : T.C.coral;
    if (status === ST_RUN) return hi ? T.C.blueHi : T.C.blue;
    return hi ? T.C.mut : T.C.faint;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ٤) البناء
     ══════════════════════════════════════════════════════════════════════════ */

  function build(el, ctx) {
    const T = RH.viz.theme;
    const rel = ctx.release;
    const su = ctx.su;

    const all = rows(rel);
    const pills = pillars(rel);
    const port = portfolio(rel);

    /* الركيزة المختارة من حالة اللوح (‎#/tab/initiatives?pillar=p1‎) */
    const wanted = String((ctx.params && ctx.params.pillar) || "");
    const focus = pills.find((p) => p.id === wanted) || null;
    const view = filterRows(all, focus ? focus.id : "");

    guard("build", {
      "أربع ركائز في المصدر": pills.length === 4,
      "كل مبادرة تنتمي لركيزة معرَّفة": all.every((r) => !!r.pillar),
      "مجموع مبادرات الركائز = المحفظة":
        pills.reduce((a, p) => a + p.total, 0) === all.length,
      "كل حالة من المفردات القانونية":
        all.every((r) => ST_ORDER.indexOf(r.status) >= 0),
      "لا شريط لمن لا تاريخ له":
        all.every((r) => r.dated || r.status === ST_DONE
          || r.bar.kind === "none"),
      "المنجزة تُعرض 100٪ إنجازاً":
        all.filter((r) => r.status === ST_DONE)
          .every((r) => r.bar.kind === "done" && r.bar.pct === 100),
      "نطاق المحفظة صالح": port.spanDays > 0,
    });

    const root = h("div", { class: "int" });
    el.appendChild(root);

    /* ── ٤-أ) شريط الركائز: حلقات التقدم الدائرية الكبرى ─────────────────── */
    const band = h("div", {
      class: "tabfigs int-rings",
      role: "group",
      "aria-label": "الركائز الأربع — " + RING_LABEL,
    });

    /* النمط الهندسي لهوية الأمانة خلف شريط الحلقات بتعتيم منخفض */
    if (RH.brand && typeof RH.brand.pattern === "function") {
      ctx.onTeardown(RH.brand.pattern(band, {
        opacity: 0.05, angle: 18, size: 150,
      }));
    }

    /** نصف قطر الحلقة في نظام إحداثيات ثابت (‎viewBox‎ 120×120) */
    const RING_R = 50;
    const ringTimers = [];

    pills.forEach((p) => {
      const on = !!focus && focus.id === p.id;
      const dash = ringDash(p.pct, RING_R);
      const zero = !p.done;

      const fill = svg("circle", {
        class: "int-ring-fill", cx: 60, cy: 60, r: RING_R,
        "stroke-dasharray": dash.circumference.toFixed(2),
        /* يبدأ فارغاً ثم ينزلق إلى قيمته — والانزلاق يُلغى تحت تقليل الحركة */
        "stroke-dashoffset": (T.REDUCED ? dash.offset : dash.circumference)
          .toFixed(2),
        transform: "rotate(-90 60 60)",
      });
      if (!T.REDUCED) {
        const tid = setTimeout(() => {
          fill.setAttribute("stroke-dashoffset", dash.offset.toFixed(2));
        }, 40);
        ringTimers.push(tid);
      }

      const ring = svg("svg", {
        class: "int-ring" + (zero ? " is-zero" : ""),
        viewBox: "0 0 120 120", "aria-hidden": "true", focusable: "false",
      },
        svg("circle", { class: "int-ring-track", cx: 60, cy: 60, r: RING_R }),
        fill);

      const ariaSelect = on
        ? "إلغاء تصفية القائمة على هذه الركيزة"
        : "تصفية الخط الزمني والقائمة على هذه الركيزة";

      const selectBtn = h("button", {
        class: "int-ring-btn",
        type: "button",
        "data-interactive": "",
        "aria-pressed": on ? "true" : "false",
        "aria-label": p.name + " — " + RING_LABEL + " " + p.countLabel
          + "، أي " + fmt.pct(p.pct) + " — " + ariaSelect,
        onclick: () => ctx.update({ pillar: on ? null : p.id }),
      },
        h("span", { class: "int-ring-kicker" }, p.kicker),
        h("span", { class: "int-ring-wrap" },
          ring,
          h("span", { class: "int-ring-center" },
            h("b", { class: "int-ring-pct tnum" }, fmt.pct(p.pct)),
            h("span", { class: "int-ring-count tnum" }, p.countLabel))),
        h("span", { class: "int-ring-title" }, p.title),
        /* التسمية الحرفية الملزمة تحت كل حلقة — لا اختصار ولا إيماء */
        h("span", { class: "int-ring-cap" }, RING_LABEL));

      /* خليط حالات الركيزة: نقطة + عدد لكل حالة ذات رصيد (مفتاح لوني محلي) */
      const mix = h("span", { class: "int-mix" });
      for (const v of ST_ORDER) {
        if (!p.counts[v]) continue;
        mix.appendChild(h("span", {
          class: "int-mix-item is-" + ST_CLS[v],
          title: ST_LABEL[v] + ": " + fmt.noun(p.counts[v], "initiative"),
        },
          h("i", { class: "int-st-dot", "aria-hidden": "true" }),
          h("span", { class: "int-mix-txt" }, ST_LABEL[v]),
          h("b", { class: "int-mix-num tnum" }, fmt.int(p.counts[v]))));
      }

      const moreBtn = h("button", {
        class: "int-ring-more",
        type: "button",
        "data-interactive": "",
        "aria-label": "إبراز " + p.name,
        onclick: (ev) => ctx.highlight(Object.assign(
          pillarSpec(rel, p.id), { anchor: ev.currentTarget })),
      }, "إبراز");

      band.appendChild(h("div", {
        class: "int-ring-card" + (on ? " is-on" : "")
          + (p.kind === "ممكن" ? " is-enabler" : ""),
        role: "group",
        "aria-label": p.name,
        dataset: { pillar: p.id },
      }, selectBtn, h("div", { class: "int-ring-foot" }, mix, moreBtn)));
    });
    root.appendChild(band);
    ctx.onTeardown(() => { for (const t of ringTimers) clearTimeout(t); });

    /* شريط الحالة الراهنة للتصفية + مفتاح الحالات (رقاقات إبراز) */
    const scope = h("div", { class: "int-scope" });
    scope.appendChild(h("p", { class: "int-scope-txt" },
      focus
        ? "المعروض أدناه: مبادرات " + focus.kicker + " — "
          + fmt.noun(view.length, "initiative") + "."
        : "المعروض أدناه: المحفظة كاملة — "
          + fmt.noun(port.total, "initiative") + " على "
          + fmt.noun(port.pillars, "pillar") + "."));

    /* مفتاح الحالات **على مستوى المحفظة كاملة** حتى مع التصفية — والتصريح
       بذلك نصاً يمنع قراءة أعداده على أنها أعداد المعروض أدناه. */
    const legend = h("div", {
      class: "int-legend", role: "group",
      "aria-label": "حالات مبادرات المحفظة كاملة — اضغط الحالة لإبرازها",
    }, h("span", { class: "int-legend-cap" }, "حالات المحفظة:"));
    for (const v of ST_ORDER) {
      if (!port.counts[v]) continue;
      legend.appendChild(h("button", {
        class: "int-chip is-" + ST_CLS[v],
        type: "button",
        "data-interactive": "",
        "aria-label": ST_LABEL[v] + ": "
          + fmt.noun(port.counts[v], "initiative") + " — اعرض الإبراز",
        onclick: (ev) => ctx.highlight(Object.assign(
          statusSpec(rel, v), { anchor: ev.currentTarget })),
      },
        h("i", { class: "int-st-dot", "aria-hidden": "true" }),
        h("span", { class: "int-chip-txt" }, ST_LABEL[v]),
        h("b", { class: "int-chip-num tnum" }, fmt.int(port.counts[v]))));
    }
    if (focus) {
      legend.appendChild(h("button", {
        class: "int-chip is-clear",
        type: "button",
        "data-interactive": "",
        "aria-label": "إلغاء التصفية وعرض المحفظة كاملة",
        onclick: () => ctx.update({ pillar: null }),
      }, h("span", { class: "int-chip-txt" }, "عرض المحفظة كاملة")));
    }
    legend.appendChild(h("button", {
      class: "int-chip is-quiet",
      type: "button",
      "data-interactive": "",
      "aria-label": "إبراز محفظة المبادرات كاملة",
      onclick: (ev) => ctx.highlight(Object.assign(
        portfolioSpec(rel), { anchor: ev.currentTarget })),
    }, h("span", { class: "int-chip-txt" }, "المحفظة كاملة")));
    scope.appendChild(legend);
    root.appendChild(scope);

    /* ── ٤-ب) الخط الزمني للمبادرات (الرسم الرئيس) ───────────────────────── */
    const timed = view.filter((r) => r.dated);
    const hidden = view.length - timed.length;

    const tlGrid = h("div", { class: "tabgrid is-1" });
    const tlNote = "من تواريخ الخطة وحدها · شاخص ذهبي عند تاريخ الحساب "
      + fmt.date(port.calc)
      + (hidden
        ? " · " + fmt.noun(hidden, "initiative") + " بلا تواريخ في المصدر "
          + "لا تظهر هنا"
        : "");
    const tlCard = panelCard({
      title: "الخط الزمني لمبادرات الخطة",
      note: tlNote,
      cls: "int-tl-card",
    });
    tlGrid.appendChild(tlCard.card);
    root.appendChild(tlGrid);

    if (!timed.length) {
      tlCard.body.appendChild(h("p", { class: "int-empty" },
        "لا مبادرة مؤرخة ضمن هذا النطاق — لا يُرسم خط زمني بلا تواريخ."));
    } else {
      const tlEl = h("div", {
        class: "tabchart int-tl-chart" + (timed.length > 8 ? " is-tall" : ""),
      });
      tlCard.body.appendChild(tlEl);

      const base = port.minStartMs;
      const dayOf = (ms) => Math.round((ms - base) / DAY_MS);
      const labels = timed.map((r) => fmt.iso(r.id) + " · " + r.name);
      const chart = ctx.chart("timeline", tlEl);

      chart.setOption(Object.assign(T.base(su), {
        grid: {
          top: T.fs(su, 34), bottom: T.fs(su, 30),
          left: T.fs(su, 18), right: T.fs(su, 292),
        },
        xAxis: Object.assign(T.hValAxis(su, (v) => dayLabel(base, v),
          port.spanDays), { min: 0 }),
        yAxis: T.hCatAxis(su, labels, T.fs(su, 284)),
        tooltip: Object.assign(T.tooltip(su), {
          formatter: (p) => {
            const r = timed[p.dataIndex];
            if (!r) return "";
            return T.ttMicro("مبادرة " + fmt.iso(r.id) + " · " + ST_LABEL[r.status],
              fmt.date(r.start) + " – " + fmt.date(r.end));
          },
        }),
        series: [
          {
            /* إزاحة شفافة تضع بداية كل مبادرة في موضعها — بلا لون مكتوب:
               تأخذ لون سطح حيّ وتُخفى بالشفافية، و‎silent‎ يمنع تحويمها. */
            name: "إزاحة البداية",
            type: "bar",
            stack: "tl",
            barWidth: "62%",
            silent: true,
            itemStyle: { color: T.C.stage1, opacity: 0 },
            data: timed.map((r) => dayOf(r.elapsed.startMs)),
          },
          {
            name: "المدة المخططة",
            type: "bar",
            stack: "tl",
            barWidth: "62%",
            cursor: "pointer",
            itemStyle: { borderRadius: 5 },
            data: timed.map((r) => ({
              value: Math.max(dayOf(r.elapsed.endMs) - dayOf(r.elapsed.startMs), 1),
              itemStyle: { color: statusColor(T, r.status) },
              emphasis: { itemStyle: { color: statusColor(T, r.status, true) } },
            })),
            markLine: {
              silent: true,
              symbol: "none",
              lineStyle: { color: T.C.gold, width: 2, type: "dashed" },
              label: {
                show: true, position: "end",
                color: T.C.gold, fontFamily: "Cairo",
                fontSize: T.fs(su, 12),
                formatter: "تاريخ الحساب",
              },
              data: [{ xAxis: port.calcDay }],
            },
          },
        ],
      }), true);

      onChartClick(ctx, chart, (p) => {
        if (!p || p.componentType !== "series") return;
        const r = timed[p.dataIndex];
        if (r) {
          ctx.highlight(Object.assign(initiativeSpec(rel, r.id),
            { anchor: tlEl }));
        }
      });
    }

    /* ── ٤-ج) قائمة مبادرات كل ركيزة بشريط «مضي المدة الزمنية» ──────────── */
    const listGrid = h("div", { class: "tabgrid is-1" });
    const listCard = panelCard({
      title: focus ? "مبادرات " + focus.kicker : "مبادرات الركائز الأربع",
      note: "الشريط يقيس «" + BAR_ELAPSED + "» من تواريخ الخطة — لا يدّعي إنجازاً",
      cls: "int-list-card",
    });

    const groups = h("div", {
      class: "int-groups" + (focus ? " is-single" : ""),
    });
    const shown = focus ? pills.filter((p) => p.id === focus.id) : pills;

    for (const p of shown) {
      const list = h("ul", { class: "int-inis" });
      for (const r of p.list) {
        list.appendChild(h("li", { class: "int-ini-li" },
          h("button", {
            class: "int-ini is-" + (ST_CLS[r.status] || "idle"),
            type: "button",
            "data-interactive": "",
            dataset: { ini: r.id },
            "aria-label": "مبادرة " + r.id + ": " + r.name + " — "
              + ST_LABEL[r.status] + " — " + r.bar.caption + " "
              + r.bar.value + " — اعرض الإبراز",
            onclick: (ev) => ctx.highlight(Object.assign(
              initiativeSpec(rel, r.id), { anchor: ev.currentTarget })),
          },
            h("span", { class: "int-ini-id tnum" }, fmt.iso(r.id)),
            h("span", { class: "int-ini-main" },
              h("span", { class: "int-ini-name" }, r.name),
              statusChip(r.status, "int-ini-st")),
            barBlock(r.bar))));
      }

      groups.appendChild(h("section", {
        class: "int-group" + (p.kind === "ممكن" ? " is-enabler" : ""),
        "aria-label": p.name,
      },
        h("header", { class: "int-group-head" },
          h("h3", { class: "int-group-title" },
            h("span", { class: "int-group-kicker" }, p.kicker),
            h("span", { class: "int-group-name" }, p.title)),
          h("span", { class: "int-group-count tnum" }, p.countLabel),
          h("span", { class: "int-group-cap" }, RING_LABEL)),
        list));
    }

    listCard.body.appendChild(groups);
    listGrid.appendChild(listCard.card);
    root.appendChild(listGrid);

    /* ── ٤-د) سطر الصدق أسفل اللوح ──────────────────────────────────────── */
    root.appendChild(h("p", { class: "int-foot" },
      "المصدر: ", h("span", { class: "int-foot-src" },
        String(rel.strategy.source || "خطة عمل المشروع")),
      " · قاعدة الحالة: ", String(rel.strategy.status_rule || "—"),
      " · تاريخ الحساب " + fmt.date(port.calc) + "."));

    /* ── ٤-هـ) وصول عميق: ‎?initiative=1.4‎ يفتح إبراز المبادرة بعد الطلاء ──
       معامل مجهول يُتجاهل بصمت — لا شاشة خطأ في لوحة عرض. */
    const wantedIni = String((ctx.params && ctx.params.initiative) || "");
    if (wantedIni && all.some((r) => r.id === wantedIni)) {
      const tid = setTimeout(() => {
        ctx.highlight(Object.assign(initiativeSpec(rel, wantedIni),
          { anchor: root.querySelector('[data-ini="' + wantedIni + '"]') }));
      }, 60);
      ctx.onTeardown(() => clearTimeout(tid));
    }
  }

  RH.tabs.register({
    id: "initiatives",
    order: 4,
    title: "المبادرات",
    /** النموذج النقي مكشوف للاختبار ولوحة الأوامر — لا حالة فيه ولا DOM */
    model: MODEL,
    build,
  });
})();
