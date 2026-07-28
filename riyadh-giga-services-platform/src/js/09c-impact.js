/* ============================================================
   Impact module — «وحدة الأثر». Delay-cost methodology over live
   DataStore data: every working day saved is valued as a daily
   fraction of the affected project's investment value, weighted
   by the service's critical-path share. No hardcoded totals —
   approving a request in the demo grows the counters live.
   impact-spec §1–§7. Loads between 09b-kpi.js and 10-public.js.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h;
  var Impact = RGP.impact = {};

  function cssv(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* ---------------- bilingual copy (impact-spec §2, §5, §6) ---------------- */
  var L = {
    m1:    { ar: "متوسط تقليل زمن الخدمة", en: "Average service-time reduction" },
    m1sub: { ar: "من 25 يوم عمل في المتوسط قبل المنصة إلى 8 أيام", en: "From an average of 25 working days pre-platform to 8" },
    m2:    { ar: "أيام عمل موفَّرة تراكميًا", en: "Cumulative working days saved" },
    m2unit:{ ar: "يوم عمل", en: "working days" },
    m3:    { ar: "وفر مالي تقديري من تقليل زمن الخدمات", en: "Estimated savings from reduced service time" },
    m4:    { ar: "قيمة استثمارية مُسرَّعة", en: "Investment value accelerated" },
    m4sub: { ar: "معادل سنوي لرأس المال الذي قُدِّم جدوله الزمني", en: "Annualized equivalent of capital brought forward" },
    m5:    { ar: "مساهمة تقديرية في الناتج المحلي لمدينة الرياض", en: "Estimated contribution to Riyadh's GDP" },
    m6:    { ar: "وظائف مدعومة بالتسريع", en: "Jobs supported by acceleration" },
    m7:    { ar: "رضا المتعاملين", en: "Customer satisfaction" },
    m8:    { ar: "الإنجاز الرقمي الكامل (بلا ورق)", en: "Fully digital, paperless completion" },
    yearly:{ ar: "سنويًا", en: "per year" },
    realized: { ar: "المتحقق فعليًا", en: "Realized" },
    beforeSeries: { ar: "قبل المنصة", en: "Before" },
    viaSeries:    { ar: "عبر المنصة", en: "Via platform" },
    chartBeforeAfter: { ar: "زمن الخدمة: قبل المنصة وبعدها", en: "Service time: before vs. via the platform" },
    chartBySector:    { ar: "الوفر حسب القطاع", en: "Savings by sector" },
    chartCumulative:  { ar: "الوفر المالي التراكمي", en: "Cumulative estimated savings" },
    ledgerTitle:      { ar: "سجل الأثر", en: "Impact ledger" },
    ledgerDays:       { ar: "أيام موفَّرة", en: "Days saved" },
    ledgerSar:        { ar: "وفر تقديري", en: "Estimated savings" },
    sarMillion:       { ar: "مليون ريال", en: "SAR M" },
    other:            { ar: "أخرى", en: "Other" },
    ofCityGdp:        { ar: "من ناتج المدينة", en: "of city GDP" },
    outOf5:           { ar: "من 5", en: "of 5" },
    docsSub:          { ar: "وثيقة رقمية · صفر معاملة ورقية", en: "digital documents · zero paper transactions" },
    modalTitle:       { ar: "منهجية احتساب الأثر", en: "Impact methodology" },
    landingEyebrow:   { ar: "الأثر", en: "Impact" },
    landingTitle:     { ar: "أثر يتجاوز الأتمتة", en: "Impact beyond automation" },
    landingLede:      { ar: "تقليل زمن الخدمات يعني رأس مال يُستثمر أبكر، ووظائف تُدعم، وناتجًا محليًا ينمو",
                        en: "Faster services mean capital deployed earlier, jobs supported, and a growing city economy" },
    landingM3:        { ar: "وفر مالي تقديري", en: "Estimated savings" },
    landingM4:        { ar: "قيمة استثمارية مُسرَّعة", en: "Investment value accelerated" },
    landingM2:        { ar: "يوم عمل موفَّرة", en: "Working days saved" },
    landingM1:        { ar: "تقليل زمن الخدمة", en: "Service-time reduction" },
    landingCaption:   { ar: "تقديرات نموذجية لأغراض العرض التجريبي · ", en: "Modeled estimates for demonstration purposes · " },
    landingLink:      { ar: "منهجية الاحتساب", en: "calculation methodology" },
    execNote:         { ar: "أرقام تقديرية وفق منهجية تكلفة التأخير — ", en: "Estimates per the delay-cost methodology — " },
    execLink:         { ar: "للاطلاع على المنهجية", en: "view methodology" },
    toastTitle:       { ar: "أثر مُحقق", en: "Impact generated" }
  };

  /* methodology paragraph (impact-spec §6, verbatim) split around the bold clause */
  var METHOD = {
    ar: {
      pre: "تُحتسب مؤشرات الأثر في هذه المنصة وفق منهجية «تكلفة التأخير»: تُقارَن مدة إنجاز كل خدمة عبر المنصة بخط الأساس المعياري لإجراءات ما قبل المنصة، وتُقدَّر قيمة كل يوم عمل موفَّر بنسبة يومية من القيمة الاستثمارية للمشروع المتأثر، موزونةً بوزن الخدمة على المسار الحرج للمشروع. وتُشتق المساهمة في الناتج المحلي وعدد الوظائف المدعومة من معاملات اقتصادية قياسية (حصة القيمة المضافة من الإنفاق الرأسمالي، ومضاعف الأثر الاقتصادي). الأرقام الواردة ",
      bold: "تقديرات نموذجية لأغراض العرض التجريبي",
      post: "، مبنية على قيم استثمارية استرشادية، ولا تمثل أرقامًا رسمية معتمدة من أمانة منطقة الرياض أو من أي جهة أخرى؛ أما مؤشرا رضا المتعاملين والإنجاز الرقمي فهما مقيسان مباشرة من بيانات المنصة. وعند التشغيل الفعلي تُستبدل خطوط الأساس والمعاملات ببيانات موثقة معتمدة من الجهات المختصة."
    },
    en: {
      pre: "Impact indicators on this platform follow a delay-cost methodology: each service's completion time via the platform is compared with a documented pre-platform baseline, and every working day saved is valued as a daily fraction of the affected project's investment value, weighted by the service's share of the project's critical path. GDP contribution and jobs supported are derived using standard economic coefficients (gross-value-added share of capital expenditure and an economic impact multiplier). The figures shown are ",
      bold: "modeled estimates for demonstration purposes",
      post: ", based on indicative investment values, and do not represent official figures endorsed by the Riyadh Region Municipality or any other entity; customer satisfaction and digital-completion indicators are measured directly from platform data. In production, baselines and coefficients would be replaced with documented, officially approved data."
    }
  };

  function methodologyNodes() {
    var m = METHOD[RGP.i18n.lang] || METHOD.ar;
    return [m.pre, h("b", null, m.bold), m.post];
  }

  /* ---------------- economic model (impact-spec §1) ---------------- */
  function model() {
    var s = (RGP.store.state.settings || {});
    return s.impactModel || {
      workingDaysPerYear: 250, defaultProjectValueSar: 400000000,
      gvaShareOfCapex: 0.55, gdpMultiplier: 1.4,
      riyadhGdpSar: 1480000000000, jobsPerBillionSarYear: 2300
    };
  }

  /* identical to netDays() in 09b-kpi.js */
  function netDays(r) {
    var d = RGP.workingDaysBetween(r.sla.startAt, r.decision.decidedAt.slice(0, 10)) - (r.sla.pausedDays || 0);
    return Math.max(0, d);
  }

  /* per-request impact — used by the approval toast and by compute() */
  Impact.requestImpact = function (r) {
    var zero = { daysSaved: 0, sarSaved: 0, accelerated: 0 };
    if (!r || !r.decision || r.decision.type !== "approved" || !r.sla || !r.sla.startAt) return zero;
    var svc = RGP.store.service(r.serviceId);
    if (!svc || !svc.impact) return zero;
    var M = model();
    var p = r.projectId ? RGP.store.project(r.projectId) : null;
    var V = (p && p.impact) ? p.impact.estimatedValueSar : M.defaultProjectValueSar;
    var f = (p && p.impact) ? p.impact.delayCostFactorDaily : 0.00035;
    var w = svc.impact.criticalPathWeight;
    var saved = Math.max(0, svc.impact.baselineDays - netDays(r));
    return {
      daysSaved: saved,
      sarSaved: saved * V * f * w,
      accelerated: V * w * saved / (M.workingDaysPerYear || 250)
    };
  };

  /* aggregate model — everything computed live from RGP.store.state */
  Impact.compute = function () {
    var S = RGP.store.state, M = model();
    var reqs = S.requests.filter(function (r) { return r.state !== "draft"; });

    var per = [];
    var daysSavedTotal = 0, savingsTotal = 0, acceleratedTotal = 0;
    var actualSum = 0, baselineSumDecided = 0;
    var bySecMap = {};

    reqs.forEach(function (r) {
      if (!r.decision || r.decision.type !== "approved") return;
      var svc = RGP.store.service(r.serviceId);
      if (!svc || !svc.impact || !r.sla || !r.sla.startAt) return;
      var im = Impact.requestImpact(r);
      per.push({
        id: r.id, serviceId: r.serviceId, projectId: r.projectId,
        daysSaved: im.daysSaved, sarSaved: im.sarSaved,
        decidedAt: r.decision.decidedAt.slice(0, 10)
      });
      daysSavedTotal += im.daysSaved;
      savingsTotal += im.sarSaved;
      acceleratedTotal += im.accelerated;
      actualSum += netDays(r);
      baselineSumDecided += svc.impact.baselineDays;
      var p = r.projectId ? RGP.store.project(r.projectId) : null;
      var sec = p ? p.sector : "other";
      bySecMap[sec] = (bySecMap[sec] || 0) + im.sarSaved;
    });

    var gdpContribution = (savingsTotal + acceleratedTotal * M.gvaShareOfCapex) * M.gdpMultiplier;
    var gdpSharePct = M.riyadhGdpSar ? 100 * gdpContribution / M.riyadhGdpSar : 0;
    var jobsSupported = Math.round(acceleratedTotal / 1e9 * M.jobsPerBillionSarYear);

    /* M1 — catalog-level headline (stable) + realized secondary line */
    var slaSum = 0, baselineSum = 0;
    S.services.forEach(function (s) {
      if (!s.impact) return;
      slaSum += s.slaDays;
      baselineSum += s.impact.baselineDays;
    });
    var reductionPct = baselineSum ? Math.round(100 * (1 - slaSum / baselineSum)) : 0;
    var realizedReductionPct = baselineSumDecided ? Math.round(100 * (1 - actualSum / baselineSumDecided)) : 0;

    /* M7 — measured, reuses the platform's rated set */
    var rated = S.requests.filter(function (r) { return r.satisfaction && r.satisfaction.score; });
    var satisfactionAvg = rated.length
      ? rated.reduce(function (a, r) { return a + r.satisfaction.score; }, 0) / rated.length : 0;
    var satisfactionPct = Math.round(100 * satisfactionAvg / 5);

    /* M8 — measured: everything on the platform is digitally submitted */
    var digitalDocs = reqs.reduce(function (a, r) { return a + (r.documents || []).length; }, 0);
    var paperlessPct = 100;

    /* sector donut data — top 5 + «أخرى», raw SAR values */
    var bySector = Object.keys(bySecMap).map(function (k) { return { sector: k, value: bySecMap[k] }; })
      .sort(function (a, b) { return b.value - a.value; });
    if (bySector.length > 6) {
      var top = bySector.slice(0, 5);
      var rest = bySector.slice(5).reduce(function (a, x) { return a + x.value; }, 0);
      var existing = top.filter(function (x) { return x.sector === "other"; })[0];
      if (existing) existing.value += rest; else top.push({ sector: "other", value: rest });
      bySector = top;
    }

    /* weekly cumulative savings, bucketed by decidedAt, week ending Friday (SAR M) */
    var weeklyCumulative = { labels: [], values: [] };
    if (per.length) {
      var sorted = per.slice().sort(function (a, b) { return a.decidedAt < b.decidedAt ? -1 : 1; });
      var d = RGP.parseISO(sorted[0].decidedAt);
      while (d.getDay() !== 5) d = new Date(d.getTime() + RGP.DAY);
      var last = RGP.parseISO(sorted[sorted.length - 1].decidedAt);
      var guard = 0;
      for (;;) {
        var iso = RGP.toISO(d);
        var cum = 0;
        per.forEach(function (x) { if (x.decidedAt <= iso) cum += x.sarSaved; });
        weeklyCumulative.labels.push((d.getMonth() + 1) + "/" + d.getDate());
        weeklyCumulative.values.push(Math.round(cum / 1e6 * 10) / 10);
        if (d >= last || ++guard > 60) break;
        d = new Date(d.getTime() + 7 * RGP.DAY);
      }
    }

    return {
      daysSavedTotal: daysSavedTotal,
      savingsTotal: savingsTotal,
      acceleratedTotal: acceleratedTotal,
      gdpContribution: gdpContribution,
      gdpSharePct: gdpSharePct,
      jobsSupported: jobsSupported,
      reductionPct: reductionPct,
      realizedReductionPct: realizedReductionPct,
      satisfactionPct: satisfactionPct,
      satisfactionAvg: Math.round(satisfactionAvg * 10) / 10,
      paperlessPct: paperlessPct,
      digitalDocs: digitalDocs,
      perRequest: per,
      bySector: bySector,
      weeklyCumulative: weeklyCumulative
    };
  };

  /* ---------------- compact bilingual money (never raw 9-digit numbers) ---------------- */
  Impact.fmtSar = function (v) {
    if (v == null || (typeof v === "number" && isNaN(v))) return "—";
    var ar = RGP.i18n.lang === "ar";
    var a = Math.abs(v), n, uAr, uEn;
    if (a >= 1e9)      { n = v / 1e9; uAr = "مليار ريال"; uEn = "B"; }
    else if (a >= 1e6) { n = v / 1e6; uAr = "مليون ريال"; uEn = "M"; }
    else if (a >= 1e3) { n = v / 1e3; uAr = "ألف ريال";  uEn = "K"; }
    else               { n = v;       uAr = "ريال";      uEn = ""; }
    var num = RGP.fmtNum(n, { dec: a >= 1e3 ? 1 : 0 });
    return ar ? num + " " + uAr : "SAR " + num + uEn;
  };

  /* ---------------- count-up counter (impact-spec §7.4) ----------------
     IntersectionObserver threshold 0.35, fire once, rAF ease-out-cubic
     900ms. opts: {dec, suffix, fmt} — fmt(value) overrides formatting. */
  Impact.counter = function (el, value, opts) {
    opts = opts || {};
    var fmt = opts.fmt || function (v) {
      return RGP.fmtNum(v, { dec: opts.dec != null ? opts.dec : 0 }) + (opts.suffix || "");
    };
    if (RGP.REDUCED_MOTION || typeof IntersectionObserver === "undefined") {
      el.textContent = fmt(value);
      return;
    }
    el.textContent = fmt(0);
    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || fired) return;
        fired = true;
        io.disconnect();
        var start = null;
        function tick(now) {
          if (!start) start = now;
          var p = RGP.clamp((now - start) / 900, 0, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(value * eased);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.35 });
    io.observe(el);
  };

  /* ---------------- methodology modal (impact-spec §6) ---------------- */
  Impact.methodologyModal = function () {
    RGP.ui.modal({
      title: L.modalTitle,
      size: "lg",
      body: h("div", null,
        h("p.t-body", { style: { lineHeight: "1.95" } }, methodologyNodes()),
        h("div.flex.g1.mbs-2.wrap", null,
          h("span.pill.plain.sm", null, td(L.m7) + " · " + t("impact.measured")),
          h("span.pill.plain.sm", null, td(L.m8) + " · " + t("impact.measured"))))
    });
  };

  /* ---------------- live-impact approval toast (impact-spec §7.5) ---------------- */
  Impact.decisionToast = function (request) {
    var im = Impact.requestImpact(request);
    if (!(im.sarSaved > 0)) return;
    var msg = RGP.i18n.lang === "ar"
      ? "قرارك وفّر تقديريًا " + Impact.fmtSar(im.sarSaved) + " و" + RGP.fmtWorkdays(im.daysSaved)
      : "This decision saved an estimated " + Impact.fmtSar(im.sarSaved) + " and " + RGP.fmtWorkdays(im.daysSaved);
    RGP.ui.toast("ok", L.toastTitle, msg);
  };

  /* ---------------- shared view pieces ---------------- */
  function qualChip(measured) {
    return h("button.qual-chip" + (measured ? ".measured" : ""), {
      type: "button",
      "aria-label": t("impact.methodology"),
      onclick: function (e) { e.stopPropagation(); Impact.methodologyModal(); }
    }, measured ? t("impact.measured") : t("impact.estimated") + " ▸ " + t("impact.methodology"));
  }

  /* hero counter block. opts: {value, label, sub, gold, dec, suffix, fmt, zero, small} */
  function heroCounter(opts) {
    var v = h("div.ihc-value.num" + (opts.gold ? ".gold" : ""));
    if (opts.zero) v.textContent = "—";
    else Impact.counter(v, opts.value, { dec: opts.dec, suffix: opts.suffix, fmt: opts.fmt });
    return h("div.imp-hc" + (opts.small ? ".small" : ""), null,
      v,
      h("div.ihc-label", null, td(opts.label)),
      opts.sub ? h("div.ihc-sub", null, td(opts.sub)) : null,
      opts.noChip ? null : qualChip(opts.measured));
  }

  /* secondary KPI tile matching the dashboard tile family */
  function tile(opts) {
    var v = h("span");
    if (opts.zero) v.textContent = "—";
    else Impact.counter(v, opts.value, { dec: opts.dec, suffix: opts.suffix, fmt: opts.fmt });
    return h("div.kpi.elev-1.imp-tile", null,
      h("div.k-label", null, td(opts.label)),
      h("div.k-value", null, v, opts.unit ? h("span.k-unit", null, td(opts.unit)) : null),
      opts.sub ? h("div.t-caption.mut.imp-tile-sub", null, td(opts.sub)) : null,
      opts.sub2 ? h("div.t-caption.imp-tile-sub.accent", null, td(opts.sub2)) : null,
      qualChip(opts.measured));
  }

  function sectorName(id) {
    return id === "other" ? td(L.other) : td(RGP.sectorLabel(id));
  }

  /* mount a chart once its container is attached and sized */
  function whenMounted(el, fn) {
    var tries = 0;
    (function attempt() {
      if (el.isConnected && el.offsetWidth > 0) { fn(); return; }
      if (++tries < 30) requestAnimationFrame(attempt);
    })();
  }

  function zeroCaption() {
    return h("div.impact-zero.t-caption", null, t("impact.zeroState"));
  }

  /* ---------------- reusable bands (impact-spec §5.2, §5.3) ----------------
     kind "executive": compact hero (M3, M4, M5 + M1 small stat) + sparkline + note.
     kind "landing":   4-counter landing content WITHOUT the section wrapper. */
  Impact.band = function (kind) {
    var I = Impact.compute();
    var has = I.perRequest.length > 0;
    var frag = document.createDocumentFragment();

    if (kind === "executive") {
      var spark = h("div.imp-spark");
      var hero = h("section.impact-hero.compact", null,
        h("div.imp-hgrid", null,
          heroCounter({ zero: !has, value: I.savingsTotal, fmt: Impact.fmtSar, label: L.m3, gold: true }),
          heroCounter({ zero: !has, value: I.acceleratedTotal, fmt: Impact.fmtSar, label: L.m4 }),
          heroCounter({ zero: !has, value: I.gdpContribution, fmt: Impact.fmtSar, label: L.m5,
            sub: { ar: "سنويًا · ≈ " + RGP.fmtNum(I.gdpSharePct, { dec: 2 }) + "% " + L.ofCityGdp.ar,
                   en: L.yearly.en + " · ≈ " + RGP.fmtNum(I.gdpSharePct, { dec: 2 }) + "% " + L.ofCityGdp.en } }),
          heroCounter({ small: true, noChip: true, zero: !has, value: I.reductionPct, suffix: "%", label: L.landingM1 })),
        spark,
        h("div.ihc-note.t-caption", null,
          td(L.execNote),
          h("button.qual-link", { type: "button", onclick: function () { Impact.methodologyModal(); } }, td(L.execLink))),
        !has ? zeroCaption() : null);
      frag.appendChild(hero);
      if (has && I.weeklyCumulative.values.length > 1) {
        whenMounted(spark, function () {
          var inst = RGP.charts.area(spark, I.weeklyCumulative.labels, [
            { name: "", data: I.weeklyCumulative.values, color: cssv("--sand") }
          ]);
          inst.setOption({
            grid: { top: 4, right: 0, bottom: 4, left: 0, containLabel: false },
            xAxis: { show: false }, yAxis: { show: false },
            legend: { show: false }, tooltip: { show: false }
          });
        });
      }
      return frag;
    }

    /* landing band content (integrator wraps in <section class="pub-section impact-band" id="impact">) */
    function landingStat(opts) {
      var v = h("div.v.num" + (opts.gold ? ".gold" : ""));
      if (opts.zero) v.textContent = "—";
      else Impact.counter(v, opts.value, { dec: opts.dec, suffix: opts.suffix, fmt: opts.fmt });
      return h("div.imp-stat", null, v, h("div.l", null, td(opts.label)));
    }
    frag.appendChild(h("div.kicker", null, td(L.landingEyebrow)));
    frag.appendChild(h("h2.t-title1", null, td(L.landingTitle)));
    frag.appendChild(h("p.t-body.mut.mbs-1", { style: { maxWidth: "640px" } }, td(L.landingLede)));
    frag.appendChild(h("div.imp-counters.mbs-4", null,
      landingStat({ zero: !has, value: I.savingsTotal, fmt: Impact.fmtSar, label: L.landingM3, gold: true }),
      landingStat({ zero: !has, value: I.acceleratedTotal, fmt: Impact.fmtSar, label: L.landingM4 }),
      landingStat({ zero: !has, value: I.daysSavedTotal, dec: 0, label: L.landingM2 }),
      landingStat({ zero: !has, value: I.reductionPct, suffix: "%", label: L.landingM1 })));
    frag.appendChild(h("div.t-caption.mut.mbs-3", { style: { fontWeight: 500 } },
      !has ? t("impact.zeroState") + " · " : null,
      td(L.landingCaption),
      h("button.qual-link", { type: "button", onclick: function () { Impact.methodologyModal(); } }, td(L.landingLink))));
    return frag;
  };

  /* ---------------- #/manager/impact — «أثر المنصة» dashboard (impact-spec §5.1) ---------------- */
  function impactView() {
    var I = Impact.compute();
    var has = I.perRequest.length > 0;
    var ar = RGP.i18n.lang === "ar";

    /* 1 — header */
    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("impact.title")),
      h("p.desc.t-sub", null, t("impact.subtitle")),
      h("div.actions", null,
        h("button.btn.secondary", { onclick: function () { Impact.methodologyModal(); } },
          RGP.ui.icon("note", 16), t("impact.methodology"))));

    /* 2 — sovereign hero band: M3 (gold) · M4 · M2 · M5 */
    var hero = h("section.impact-hero.mbs-3", null,
      heroCounter({ zero: !has, value: I.savingsTotal, fmt: Impact.fmtSar, label: L.m3, gold: true }),
      heroCounter({ zero: !has, value: I.acceleratedTotal, fmt: Impact.fmtSar, label: L.m4, sub: L.m4sub }),
      heroCounter({ zero: !has, value: I.daysSavedTotal, dec: 0, label: L.m2, sub: L.m2unit }),
      heroCounter({ zero: !has, value: I.gdpContribution, fmt: Impact.fmtSar, label: L.m5,
        sub: { ar: "سنويًا · ≈ " + RGP.fmtNum(I.gdpSharePct, { dec: 2 }) + "% " + L.ofCityGdp.ar,
               en: L.yearly.en + " · ≈ " + RGP.fmtNum(I.gdpSharePct, { dec: 2 }) + "% " + L.ofCityGdp.en } }),
      !has ? zeroCaption() : null);

    /* 3 — secondary tiles: M1 (with realized line) · M6 · M7 · M8 */
    var tiles = h("div.impact-tiles.mbs-2", null,
      tile({ label: L.m1, value: I.reductionPct, suffix: "%", sub: L.m1sub,
        sub2: has ? { ar: L.realized.ar + " " + RGP.fmtNum(I.realizedReductionPct, { dec: 0 }) + "%",
                      en: L.realized.en + " " + RGP.fmtNum(I.realizedReductionPct, { dec: 0 }) + "%" } : null }),
      tile({ zero: !has, label: L.m6, value: I.jobsSupported, dec: 0 }),
      tile({ label: L.m7, value: I.satisfactionPct, suffix: "%", measured: true,
        sub: { ar: RGP.fmtNum(I.satisfactionAvg, { dec: 1 }) + " " + L.outOf5.ar,
               en: RGP.fmtNum(I.satisfactionAvg, { dec: 1 }) + " " + L.outOf5.en } }),
      tile({ label: L.m8, value: I.paperlessPct, suffix: "%", measured: true,
        sub: { ar: RGP.fmtNum(I.digitalDocs, { dec: 0 }) + " " + L.docsSub.ar,
               en: RGP.fmtNum(I.digitalDocs, { dec: 0 }) + " " + L.docsSub.en } }));

    /* 4 — charts row A: before/after bar + sector donut */
    var barBox = h("div.chart-box");
    var donutBox = h("div.chart-box");
    var rowA = h("div.grid.impact-cols-75.mbs-2", null,
      h("div.chart-card.elev-1", null,
        h("div.ch-head", null, h("span.t-headline", null, td(L.chartBeforeAfter))), barBox),
      h("div.chart-card.elev-1", null,
        h("div.ch-head", null, h("span.t-headline", null, td(L.chartBySector))),
        has ? donutBox : RGP.ui.empty("chart", { ar: "لا بيانات بعد", en: "No data yet" }, t("impact.zeroState"), null, true)));

    /* 5 — charts row B: cumulative savings area + impact ledger */
    var areaBox = h("div.chart-box");
    var ledger = RGP.ui.table({
      rows: I.perRequest.slice().sort(function (a, b) { return b.sarSaved - a.sarSaved; }),
      pageSize: 8,
      cols: [
        { key: "id", label: t("req.number"), render: function (x) { return h("span.id-cell.num", null, x.id); } },
        { key: "svc", label: t("req.service"), render: function (x) {
            var s = RGP.store.service(x.serviceId); return s ? td(s.name) : "—"; } },
        { key: "proj", label: t("req.project"), render: function (x) {
            var p = x.projectId && RGP.store.project(x.projectId); return p ? td(p.name) : "—"; } },
        { key: "days", label: L.ledgerDays, end: true,
          render: function (x) { return h("span.num", null, RGP.fmtNum(x.daysSaved, { dec: 0 })); },
          sortVal: function (x) { return x.daysSaved; } },
        { key: "sar", label: L.ledgerSar, end: true,
          render: function (x) { return h("span.num", null, Impact.fmtSar(x.sarSaved)); },
          sortVal: function (x) { return x.sarSaved; } }
      ],
      empty: RGP.ui.empty("chart", { ar: "لا سجلات أثر بعد", en: "No impact records yet" }, t("impact.zeroState"), null, true)
    });
    var rowB = h("div.grid.impact-cols-75.mbs-2", null,
      h("div.chart-card.elev-1", null,
        h("div.ch-head", null, h("span.t-headline", null, td(L.chartCumulative))),
        has ? areaBox : RGP.ui.empty("chart", { ar: "لا بيانات بعد", en: "No data yet" }, t("impact.zeroState"), null, true)),
      h("div", null,
        h("div.flex.between.mbe-1", null, h("span.t-headline", null, td(L.ledgerTitle))),
        ledger));

    /* 6 — methodology footnote, visible inline (dignity requires the caveat be visible) */
    var note = h("div.impact-note.mbs-2", null,
      h("span.imp-note-icon", null, RGP.ui.icon("note", 20)),
      h("p.t-caption", null, methodologyNodes()));

    var root = RGP.shell(h("div", null, head, hero, tiles, rowA, rowB, note),
      { context: t("impact.title") });

    /* charts after mount — same pattern as the manager dashboard */
    requestAnimationFrame(function () {
      var showcase = ["survey-decision", "planning-request", "building-permit", "infra-design-studies",
        "power-connection", "env-construction-permit", "excavation-permit", "commercial-activity-license"];
      var cats = [], before = [], via = [];
      showcase.forEach(function (id) {
        var s = RGP.store.service(id);
        if (!s || !s.impact) return;
        cats.push(td(s.name));
        before.push(s.impact.baselineDays);
        via.push(s.slaDays);
      });
      RGP.charts.bar(barBox, cats, [
        { name: td(L.beforeSeries), data: before, color: cssv("--ch-3") },
        { name: td(L.viaSeries), data: via, color: cssv("--ch-1") }
      ]);
      if (has) {
        RGP.charts.donut(donutBox, I.bySector.map(function (x) {
          return { name: sectorName(x.sector), value: Math.round(x.value / 1e6 * 10) / 10 };
        }), td(L.sarMillion));
        RGP.charts.area(areaBox, I.weeklyCumulative.labels, [
          { name: td(L.chartCumulative), data: I.weeklyCumulative.values, color: cssv("--ch-1") }
        ]);
      }
    });

    return root;
  }

  RGP.router.register("#/manager/impact", ["platform_manager"], impactView);
})();
