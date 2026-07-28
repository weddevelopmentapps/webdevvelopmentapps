/* ============================================================
   KPI engine — it-spec §5 formulas over live DataStore data.
   All six Track-9 KPIs + supplementary metrics.
   ============================================================ */
"use strict";

(function () {
  var K = RGP.kpi = {};

  function decided(reqs) {
    return reqs.filter(function (r) { return r.decision != null; });
  }
  function netDays(r) {
    var d = RGP.workingDaysBetween(r.sla.startAt, r.decision.decidedAt.slice(0, 10)) - (r.sla.pausedDays || 0);
    return Math.max(0, d);
  }

  K.compute = function (filter) {
    var S = RGP.store.state;
    var reqs = S.requests.filter(function (r) { return r.state !== "draft"; });
    if (filter && filter.projectId) reqs = reqs.filter(function (r) { return r.projectId === filter.projectId; });
    if (filter && filter.days) {
      var cutoff = RGP.daysAgo(filter.days);
      reqs = reqs.filter(function (r) { return r.submittedAt && r.submittedAt.slice(0, 10) >= cutoff; });
    }
    var dec = decided(reqs);

    /* KPI-1 avg processing */
    var avgProcessing = dec.length ? dec.reduce(function (a, r) { return a + netDays(r); }, 0) / dec.length : 0;

    /* KPI-1b SLA compliance (decided on time) */
    var onTimeDecided = dec.filter(function (r) { return r.decision.decidedAt.slice(0, 10) <= r.sla.dueAt; });
    var slaCompliance = dec.length ? 100 * onTimeDecided.length / dec.length : 100;

    /* KPI-2 challenge closure */
    var chs = S.challenges;
    var closedCh = chs.filter(function (c) { return ["resolved", "closed"].indexOf(c.state) >= 0; });
    var challengeClosure = chs.length ? 100 * closedCh.length / chs.length : 100;

    /* KPI-3 first response (working days) */
    var withFR = reqs.filter(function (r) { return r.firstResponseAt && r.submittedAt; });
    var firstResponse = withFR.length ? withFR.reduce(function (a, r) {
      return a + Math.max(0, RGP.workingDaysBetween(r.submittedAt.slice(0, 10), r.firstResponseAt.slice(0, 10)));
    }, 0) / withFR.length : 0;

    /* KPI-4 on-time % (open counted breached if overdue) */
    var considered = reqs.filter(function (r) { return r.sla && r.sla.startAt; });
    var onTimeAll = considered.filter(function (r) {
      if (r.decision) return r.decision.decidedAt.slice(0, 10) <= r.sla.dueAt;
      if (r.state === "cancelled" || r.state === "closed") return true;
      return RGP.lifecycle.slaBand(r) !== "red";
    });
    var onTimePct = considered.length ? 100 * onTimeAll.length / considered.length : 100;

    /* KPI-5 satisfaction */
    var rated = S.requests.filter(function (r) { return r.satisfaction && r.satisfaction.score; });
    var satisfaction = rated.length ? rated.reduce(function (a, r) { return a + r.satisfaction.score; }, 0) / rated.length : 0;

    /* KPI-6 enabled projects */
    var enabledProjects = S.projects.filter(function (p) { return p.status === "enabled"; }).length;

    /* supplementary */
    var openReqs = S.requests.filter(function (r) { return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0; });
    var everSubmitted = reqs.length;
    var returned = reqs.filter(function (r) { return (r.resubmissionCount || 0) >= 1 || r.state === "returned"; });
    var returnRate = everSubmitted ? 100 * returned.length / everSubmitted : 0;
    var escalated = openReqs.filter(function (r) { return RGP.lifecycle.slaBand(r) === "red"; });

    return {
      avgProcessing: Math.round(avgProcessing * 10) / 10,
      slaCompliance: Math.round(slaCompliance),
      challengeClosure: Math.round(challengeClosure),
      firstResponse: Math.round(firstResponse * 10) / 10,
      onTimePct: Math.round(onTimePct),
      satisfaction: Math.round(satisfaction * 10) / 10,
      enabledProjects: enabledProjects,
      openRequests: openReqs.length,
      totalRequests: S.requests.length,
      totalProjects: S.projects.length,
      decidedCount: dec.length,
      returnRate: Math.round(returnRate),
      escalatedCount: escalated.length,
      ratedCount: rated.length,
      openChallenges: chs.length - closedCh.length,
      decidedList: dec, ratedList: rated, escalatedList: escalated, openList: openReqs,
      firstRespList: withFR
    };
  };

  /* current-vs-previous 30-day window comparison for KPI tile deltas */
  K.compare = function () {
    var S = RGP.store.state;
    function windowOf(fromDays, toDays) {
      var from = RGP.daysAgo(fromDays), to = RGP.daysAgo(toDays);
      var reqs = S.requests.filter(function (r) {
        var d = r.submittedAt && r.submittedAt.slice(0, 10);
        return d && d > from && d <= to;
      });
      var dec = reqs.filter(function (r) { return r.decision; });
      var onTime = dec.filter(function (r) { return r.decision.decidedAt.slice(0, 10) <= r.sla.dueAt; });
      var avg = dec.length ? dec.reduce(function (a, r) {
        return a + Math.max(0, RGP.workingDaysBetween(r.sla.startAt, r.decision.decidedAt.slice(0, 10)) - (r.sla.pausedDays || 0));
      }, 0) / dec.length : null;
      return {
        submitted: reqs.length,
        decided: dec.length,
        avgProcessing: avg,
        onTimePct: dec.length ? Math.round(100 * onTime.length / dec.length) : null
      };
    }
    return { cur: windowOf(30, 0), prev: windowOf(60, 30) };
  };

  /* 12-week submission trend */
  K.weeklyTrend = function () {
    var S = RGP.store.state;
    var weeks = [], labels = [];
    for (var w = 11; w >= 0; w--) {
      var from = RGP.daysAgo((w + 1) * 7), to = RGP.daysAgo(w * 7);
      var count = S.requests.filter(function (r) {
        var d = r.submittedAt && r.submittedAt.slice(0, 10);
        return d && d > from && d <= to;
      }).length;
      var decidedCount = S.requests.filter(function (r) {
        var d = r.decision && r.decision.decidedAt.slice(0, 10);
        return d && d > from && d <= to;
      }).length;
      weeks.push({ submitted: count, decided: decidedCount });
      var dt = RGP.parseISO(to);
      labels.push((dt.getMonth() + 1) + "/" + dt.getDate());
    }
    return { labels: labels, submitted: weeks.map(function (x) { return x.submitted; }), decided: weeks.map(function (x) { return x.decided; }) };
  };

  /* per-entity (assignee dept) performance */
  K.byService = function () {
    var S = RGP.store.state, agg = {};
    S.requests.forEach(function (r) {
      if (r.state === "draft") return;
      var svc = RGP.store.service(r.serviceId);
      if (!svc) return;
      var key = svc.category;
      agg[key] = agg[key] || { count: 0 };
      agg[key].count++;
    });
    return agg;
  };
})();
