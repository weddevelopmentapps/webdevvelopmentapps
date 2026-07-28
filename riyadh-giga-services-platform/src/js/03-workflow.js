/* ============================================================
   Request lifecycle engine — IT-spec §3 implemented verbatim.
   States: draft, submitted, screening, in_review, returned,
           resubmitted, external_review, decision_due,
           approved, rejected, cancelled, closed
   ============================================================ */
"use strict";

(function () {
  var WF = RGP.lifecycle = {};

  WF.STATES = ["draft", "submitted", "screening", "in_review", "returned", "resubmitted",
               "external_review", "decision_due", "approved", "rejected", "cancelled", "closed"];
  WF.OPEN_STATES = ["submitted", "screening", "in_review", "returned", "resubmitted", "external_review", "decision_due"];
  WF.RUNNING_STATES = ["submitted", "screening", "in_review", "resubmitted", "external_review", "decision_due"]; /* SLA running */
  WF.DECIDED_STATES = ["approved", "rejected"];
  WF.TERMINAL_STATES = ["approved", "rejected", "cancelled", "closed"];

  /* ---------------- SLA clock (§3.3) ---------------- */
  WF.slaDaysFor = function (req) {
    var svc = RGP.store.service(req.serviceId);
    var days = svc ? svc.slaDays : 10;
    if (req.priority === "fast_track") {
      var pol = RGP.store.state.settings.slaPolicy || {};
      days = Math.max(1, Math.ceil(days * (pol.fastTrackMultiplier || 0.5)));
    }
    return days;
  };

  WF.startClock = function (req) {
    var start = RGP.todayISO();
    req.sla = {
      startAt: start,
      dueAt: RGP.addWorkingDays(start, WF.slaDaysFor(req)),
      pausedDays: 0, pauseStartAt: null,
      breached: false, escalation: "none"
    };
  };

  WF.elapsedDays = function (req) {
    if (!req.sla || !req.sla.startAt) return 0;
    var end = RGP.todayISO();
    if (req.decision) end = req.decision.decidedAt.slice(0, 10);
    var gross = RGP.workingDaysBetween(req.sla.startAt, end);
    var paused = req.sla.pausedDays || 0;
    if (req.sla.pauseStartAt) paused += RGP.workingDaysBetween(req.sla.pauseStartAt, RGP.todayISO());
    return Math.max(0, gross - paused);
  };

  WF.consumedPct = function (req) {
    var total = WF.slaDaysFor(req);
    return total ? Math.round(100 * WF.elapsedDays(req) / total) : 0;
  };

  WF.remainingDays = function (req) { return WF.slaDaysFor(req) - WF.elapsedDays(req); };

  /* 'ok' | 'amber' | 'red' | 'paused' | null */
  WF.slaBand = function (req) {
    if (!req.sla || !req.sla.startAt) return null;
    if (req.state === "returned") return "paused";
    if (req.decision) return req.sla.breached ? "red" : "ok";
    if (WF.RUNNING_STATES.indexOf(req.state) < 0) return null;
    var pol = RGP.store.state.settings.slaPolicy || {};
    var pct = WF.consumedPct(req);
    if (pct >= (pol.redPct || 100)) return "red";
    if (pct >= (pol.amberPct || 80)) return "amber";
    return "ok";
  };

  /* ---------------- timeline ---------------- */
  WF.event = function (req, type, extra) {
    var actor = RGP.auth && RGP.auth.current();
    var e = {
      id: RGP.uid("evt"),
      at: RGP.nowISO(),
      byId: actor ? actor.id : "system",
      byRole: actor ? actor.role : "system",
      type: type
    };
    Object.keys(extra || {}).forEach(function (k) { e[k] = extra[k]; });
    req.timeline.push(e);
  };

  /* ---------------- guards ---------------- */
  /* owner = creator, the creator's principal, or the principal's delegate —
     the principal supervises everything filed on his deed (dev-review M1) */
  function isOwner(req, u) {
    if (req.createdById === u.id) return true;
    if (u.delegatedBy && req.createdById === u.delegatedBy) return true;
    var creator = RGP.store.user(req.createdById);
    if (creator && creator.delegatedBy === u.id) return true;
    return false;
  }
  RGP.isRequestOwner = isOwner;
  function isAssignee(req, u) { return req.assigneeId === u.id; }

  /* Which actions the given user may take on the request right now.
     Returns array of action ids. */
  WF.actionsFor = function (req, u) {
    if (!u) return [];
    var s = req.state, a = [];
    var mgr = u.role === "platform_manager";
    var spec = u.role === "amanah_specialist" && (isAssignee(req, u) || !req.assigneeId);
    var owner = u.role === "project_rep" && isOwner(req, u);

    if (s === "draft" && owner) a.push("submit", "discard");
    if (s === "submitted" && (spec || mgr)) a.push("start_screening");
    if (s === "screening" && (isAssignee(req, u) || mgr)) a.push("accept_review", "return", "note");
    if (s === "in_review" && (isAssignee(req, u) || mgr)) a.push("refer_external", "mark_decision_due", "return", "note");
    if (s === "returned" && owner) a.push("resubmit", "cancel");
    if (s === "resubmitted" && (isAssignee(req, u) || mgr)) a.push("reopen_review", "note");
    if (s === "external_review" && mgr) a.push("force_recall", "note");
    if (s === "external_review" && (isAssignee(req, u))) a.push("note");
    if (s === "decision_due" && (isAssignee(req, u) || mgr)) a.push("approve", "reject", "return", "note");
    if (WF.OPEN_STATES.indexOf(s) >= 0 && s !== "returned" && owner) a.push("cancel");
    if (WF.OPEN_STATES.indexOf(s) >= 0 && mgr) a.push("cancel_admin", "reassign", "note");
    if (WF.DECIDED_STATES.indexOf(s) >= 0 && mgr) a.push("close");
    return a;
  };

  /* ---------------- service eligibility (delegation scope + persona) ---------------- */
  WF.serviceEligible = function (svc, u) {
    if (!svc || !u || u.role !== "project_rep") return false;
    if (u.allowedServiceIds && u.allowedServiceIds.indexOf(svc.id) < 0) return false;
    if (svc.personas && svc.personas.length) {
      var ok = u.personaType && svc.personas.indexOf(u.personaType) >= 0;
      if (u.delegatedBy && svc.personas.indexOf("engineering_office") >= 0) ok = true;
      if (!ok) return false;
    }
    return true;
  };

  /* priority rule (rmun-notes §1.1): fast-track IFF the request's project is in
     the giga registry AND the service is fast-track eligible */
  WF.computePriority = function (projectId, serviceId) {
    var p = projectId && RGP.store.project(projectId);
    var svc = RGP.store.service(serviceId);
    return (p && p.isGiga && svc && svc.gigaFastTrack) ? "fast_track" : "normal";
  };

  /* ---------------- auto-assignment (§3.4) ---------------- */
  WF.autoAssign = function (req) {
    var specialists = RGP.store.usersByRole("amanah_specialist");
    if (!specialists.length) return null;
    var load = {};
    specialists.forEach(function (u) { load[u.id] = 0; });
    RGP.store.state.requests.forEach(function (r) {
      if (WF.OPEN_STATES.indexOf(r.state) >= 0 && r.assigneeId && load[r.assigneeId] != null) load[r.assigneeId]++;
    });
    specialists.sort(function (a, b) { return (load[a.id] - load[b.id]) || (a.id < b.id ? -1 : 1); });
    req.assigneeId = specialists[0].id;
    return req.assigneeId;
  };

  /* ---------------- notification matrix (§3.8) ---------------- */
  function svcName(req) {
    var svc = RGP.store.service(req.serviceId);
    return svc ? svc.name : { ar: "", en: "" };
  }
  function notifyOwner(req, kind, title, body) {
    RGP.store.notify([req.createdById], {
      kind: kind, title: title,
      body: body || { ar: req.id + " — " + svcName(req).ar, en: req.id + " — " + svcName(req).en },
      link: "#/portal/requests/" + req.id
    });
  }
  function notifyAssignee(req, kind, title) {
    if (!req.assigneeId) return;
    RGP.store.notify([req.assigneeId], {
      kind: kind, title: title,
      body: { ar: req.id + " — " + svcName(req).ar, en: req.id + " — " + svcName(req).en },
      link: "#/work/review/" + req.id
    });
  }
  function notifyManagers(req, kind, title) {
    RGP.store.notify(RGP.store.managerIds(), {
      kind: kind, title: title,
      body: { ar: req.id + " — " + svcName(req).ar, en: req.id + " — " + svcName(req).en },
      link: "#/manager/dashboard"
    });
  }

  /* ---------------- transitions (§3.1) ---------------- */
  /* ctx: {missingItems[], note, reason, regulationRef, entityIds[], conditions, coSign} */
  WF.transition = function (req, to, ctx) {
    ctx = ctx || {};
    var u = RGP.auth.current();
    if (!u) throw new Error("wf:noauth");
    var from = req.state;

    function deny() { throw new Error("wf:invalid " + from + "→" + to); }

    switch (from + "→" + to) {
      case "draft→submitted": {
        if (!(u.role === "project_rep" && isOwner(req, u))) deny();
        var subSvc = RGP.store.service(req.serviceId);
        if (!WF.serviceEligible(subSvc, u)) throw new Error("wf:notEligible");
        req.priority = WF.computePriority(req.projectId, req.serviceId);
        req.submittedAt = RGP.nowISO();
        WF.startClock(req);
        WF.autoAssign(req);
        WF.event(req, "state", { fromState: from, toState: to });
        RGP.store.audit("request.submitted", "request", req.id);
        notifyOwner(req, "success",
          { ar: "تم تقديم طلبكم وسيُنجز بحلول " + RGP.fmtDate(req.sla.dueAt), en: "Request submitted — due " + RGP.fmtDate(req.sla.dueAt) });
        notifyAssignee(req, "info", { ar: "طلب جديد مسند إليك", en: "New request assigned to you" });
        break;
      }
      case "draft→cancelled": {
        if (!(u.role === "project_rep" && isOwner(req, u))) deny();
        WF.event(req, "state", { fromState: from, toState: to });
        RGP.store.audit("request.cancelled", "request", req.id, { by: u.id });
        break;
      }
      case "submitted→screening": {
        if (!(u.role === "platform_manager" || (u.role === "amanah_specialist" && (isAssignee(req, u) || !req.assigneeId)))) deny();
        if (!req.assigneeId && u.role === "amanah_specialist") req.assigneeId = u.id;
        if (!req.firstResponseAt) req.firstResponseAt = RGP.nowISO();
        WF.event(req, "state", { fromState: from, toState: to });
        RGP.store.audit("request.screening_started", "request", req.id);
        notifyOwner(req, "info", { ar: "بدأت دراسة طلبكم", en: "Your request entered screening" });
        break;
      }
      case "screening→in_review": {
        if (!(u.role === "platform_manager" || isAssignee(req, u))) deny();
        WF.event(req, "state", { fromState: from, toState: to });
        RGP.store.audit("request.review_started", "request", req.id);
        notifyOwner(req, "info", { ar: "طلبكم قيد المراجعة الفنية", en: "Your request is under technical review" });
        break;
      }
      case "screening→returned":
      case "in_review→returned":
      case "decision_due→returned": {
        if (!(u.role === "platform_manager" || isAssignee(req, u))) deny();
        if ((req.returnNotes || []).length >= 2) throw new Error("wf:maxReturns");
        if (!ctx.missingItems || !ctx.missingItems.length) throw new Error("wf:needMissingItems");
        req.returnNotes.push({ at: RGP.nowISO(), byId: u.id, items: ctx.missingItems, note: ctx.note || "" });
        req.sla.pauseStartAt = RGP.todayISO();
        WF.event(req, "state", { fromState: from, toState: to, payload: { items: ctx.missingItems } });
        RGP.store.audit("request.returned", "request", req.id, { missingItems: ctx.missingItems });
        notifyOwner(req, "warning", { ar: "طلبكم بحاجة إلى استكمال", en: "Your request needs completion" });
        break;
      }
      case "returned→resubmitted": {
        if (!(u.role === "project_rep" && isOwner(req, u))) deny();
        var paused = req.sla.pauseStartAt ? RGP.workingDaysBetween(req.sla.pauseStartAt, RGP.todayISO()) : 0;
        req.sla.pausedDays = (req.sla.pausedDays || 0) + paused;
        req.sla.dueAt = RGP.addWorkingDays(req.sla.dueAt, paused);
        req.sla.pauseStartAt = null;
        req.resubmissionCount = (req.resubmissionCount || 0) + 1;
        WF.event(req, "state", { fromState: from, toState: to, payload: { note: ctx.note || null } });
        RGP.store.audit("request.resubmitted", "request", req.id);
        notifyOwner(req, "info", { ar: "أعيد تقديم طلبكم وسيستأنف العد", en: "Resubmitted — the clock resumes" });
        notifyAssignee(req, "info", { ar: "أعاد العميل تقديم الطلب", en: "Customer resubmitted the request" });
        break;
      }
      case "returned→cancelled": {
        if (!(u.role === "project_rep" && isOwner(req, u))) deny();
        WF.event(req, "state", { fromState: from, toState: to });
        RGP.store.audit("request.cancelled", "request", req.id, { by: u.id });
        notifyAssignee(req, "info", { ar: "ألغى العميل الطلب", en: "Customer cancelled the request" });
        break;
      }
      case "resubmitted→in_review": {
        if (!(u.role === "platform_manager" || isAssignee(req, u))) deny();
        WF.event(req, "state", { fromState: from, toState: to });
        RGP.store.audit("request.review_started", "request", req.id);
        break;
      }
      case "in_review→external_review": {
        if (!(u.role === "platform_manager" || isAssignee(req, u))) deny();
        if (!ctx.entityIds || !ctx.entityIds.length) throw new Error("wf:needEntities");
        req.referrals = ctx.entityIds.map(function (eid) {
          return { entityId: eid, sentAt: RGP.nowISO(), answeredAt: null, opinion: null, note: null };
        });
        ctx.entityIds.forEach(function (eid) {
          if (req.involvedEntities.indexOf(eid) < 0) req.involvedEntities.push(eid);
        });
        WF.event(req, "referral", { fromState: from, toState: to, payload: { entities: ctx.entityIds } });
        RGP.store.audit("request.referred", "request", req.id, { entities: ctx.entityIds });
        notifyOwner(req, "info", { ar: "طلبكم لدى الجهات الخارجية", en: "Your request is with external entities" });
        /* notify external entity users */
        RGP.store.state.users.forEach(function (usr) {
          if (usr.role === "external_entity" && ctx.entityIds.indexOf(usr.entityId) >= 0) {
            RGP.store.notify([usr.id], {
              kind: "info",
              title: { ar: "إحالة جديدة تتطلب مرئياتكم", en: "New referral awaiting your opinion" },
              body: { ar: req.id + " — " + svcName(req).ar, en: req.id + " — " + svcName(req).en },
              link: "#/external"
            });
          }
        });
        break;
      }
      case "external_review→in_review": {
        /* auto (all answered) or manager force-recall */
        var allAnswered = req.referrals.every(function (r) { return !!r.answeredAt; });
        if (!allAnswered && u.role !== "platform_manager") deny();
        WF.event(req, "state", { fromState: from, toState: to, payload: { forced: !allAnswered } });
        RGP.store.audit("request.external_completed", "request", req.id, {
          opinions: req.referrals.map(function (r) { return { entityId: r.entityId, opinion: r.opinion }; })
        });
        notifyAssignee(req, "info", { ar: "اكتملت مرئيات الجهات الخارجية", en: "External opinions complete" });
        break;
      }
      case "in_review→decision_due": {
        if (!(u.role === "platform_manager" || isAssignee(req, u))) deny();
        WF.event(req, "state", { fromState: from, toState: to });
        RGP.store.audit("request.decision_pending", "request", req.id);
        notifyAssignee(req, "info", { ar: "طلب جاهز لاتخاذ القرار", en: "Request ready for decision" });
        if (req.priority === "fast_track") notifyManagers(req, "info", { ar: "قرار مسار سريع بانتظار الاعتماد", en: "Fast-track decision pending" });
        break;
      }
      case "decision_due→approved": {
        if (!(u.role === "platform_manager" || isAssignee(req, u))) deny();
        var aSvc = RGP.store.service(req.serviceId);
        var feeBearing = !!(aSvc && aSvc.fees && aSvc.fees.model !== "none");
        /* segregation of duties (rmun-notes §3): fee-bearing or fast-track decisions
           by the reviewing specialist require the section-head/GPO co-sign */
        if ((req.priority === "fast_track" || feeBearing) && u.role !== "platform_manager" && !ctx.coSign) throw new Error("wf:needCoSign");
        var permitNo = RGP.store.nextPermitNo(req.serviceId);
        req.decision = {
          type: "approved", decidedAt: RGP.nowISO(), deciderId: u.id,
          permitNo: permitNo, conditions: ctx.conditions || null, note: ctx.note || null,
          coSigned: !!ctx.coSign
        };
        /* the demo's proof that impact is generated, not painted (impact spec §7.5) */
        if (RGP.impact && RGP.impact.decisionToast) {
          setTimeout(function () { try { RGP.impact.decisionToast(req); } catch (e) { /* noop */ } }, 400);
        }
        if (feeBearing) {
          /* سداد invoice (simulated — live SADAD integration at the CRM phase) */
          req.decision.sadadInvoiceNo = "SADAD-" + new Date().getFullYear() + "-" + RGP.zeroPad(100000 + (RGP.hash32(req.id + permitNo) % 900000), 6);
        }
        req.sla.breached = RGP.todayISO() > req.sla.dueAt;
        WF.event(req, "decision", { fromState: from, toState: to, payload: { permitNo: permitNo, coSigned: req.decision.coSigned } });
        RGP.store.audit("request.approved", "request", req.id, { permitNo: permitNo, coSigned: req.decision.coSigned });
        notifyOwner(req, "success", { ar: "تم اعتماد طلبكم — رقم الوثيقة " + permitNo, en: "Approved — document " + permitNo });
        notifyManagers(req, "success", { ar: "اعتماد طلب " + req.id, en: "Request " + req.id + " approved" });
        break;
      }
      case "decision_due→rejected": {
        if (!(u.role === "platform_manager" || isAssignee(req, u))) deny();
        if (!ctx.reason || String(ctx.reason).trim().length < 30) throw new Error("wf:needReason30");
        if (!ctx.regulationRef) throw new Error("wf:needRegulation");
        var rSvc = RGP.store.service(req.serviceId);
        var rFee = !!(rSvc && rSvc.fees && rSvc.fees.model !== "none");
        if ((req.priority === "fast_track" || rFee) && u.role !== "platform_manager" && !ctx.coSign) throw new Error("wf:needCoSign");
        var regMatch = (RGP.store.state.settings.regulations || []).filter(function (rg) { return rg.id === ctx.regulationRef; })[0];
        if (regMatch) ctx.regulationRef = td(regMatch.label);
        req.decision = {
          type: "rejected", decidedAt: RGP.nowISO(), deciderId: u.id,
          reason: ctx.reason, regulationRef: ctx.regulationRef, note: ctx.note || null,
          coSigned: !!ctx.coSign
        };
        req.sla.breached = RGP.todayISO() > req.sla.dueAt;
        WF.event(req, "decision", { fromState: from, toState: to, payload: { reason: ctx.reason, regulationRef: ctx.regulationRef, coSigned: req.decision.coSigned } });
        RGP.store.audit("request.rejected", "request", req.id, { regulationRef: ctx.regulationRef, coSigned: req.decision.coSigned });
        notifyOwner(req, "danger", { ar: "نأسف، تم رفض طلبكم", en: "Your request was declined" });
        notifyManagers(req, "warning", { ar: "رفض طلب " + req.id, en: "Request " + req.id + " declined" });
        break;
      }
      case "approved→closed":
      case "rejected→closed": {
        if (u.role !== "platform_manager" && u.id !== "system") deny();
        req.closedAt = RGP.nowISO();
        WF.event(req, "state", { fromState: from, toState: to });
        RGP.store.audit("request.closed", "request", req.id);
        break;
      }
      default: {
        /* open-state cancels */
        if (to === "cancelled" && WF.OPEN_STATES.indexOf(from) >= 0) {
          var ownCancel = u.role === "project_rep" && isOwner(req, u) && !req.decision;
          var adminCancel = u.role === "platform_manager";
          if (!ownCancel && !adminCancel) deny();
          if (adminCancel && !ctx.reason) throw new Error("wf:needReason");
          WF.event(req, "state", { fromState: from, toState: to, payload: { reason: ctx.reason || null } });
          RGP.store.audit("request.cancelled", "request", req.id, { by: u.id, reason: ctx.reason || null });
          if (ownCancel) notifyAssignee(req, "info", { ar: "ألغى العميل الطلب", en: "Customer cancelled the request" });
          else notifyOwner(req, "warning", { ar: "أُلغي الطلب من قبل الأمانة", en: "Request cancelled by the Municipality" });
          break;
        }
        deny();
      }
    }

    req.state = to;
    req.updatedAt = RGP.nowISO();
    RGP.store.save();
    RGP.bus.emit("request:changed", req);
    return req;
  };

  /* ---------------- external opinions ---------------- */
  WF.recordOpinion = function (req, entityId, opinion, note) {
    var u = RGP.auth.current();
    if (!u || u.role !== "external_entity" || u.entityId !== entityId) throw new Error("wf:notEntity");
    var ref = req.referrals.filter(function (r) { return r.entityId === entityId; })[0];
    if (!ref || ref.answeredAt) throw new Error("wf:refDone");
    ref.answeredAt = RGP.nowISO();
    ref.opinion = opinion;                /* approve_recommend | reject_recommend | info_needed */
    ref.note = note || null;
    WF.event(req, "action", { type: "action", payload: { external_opinion: opinion, entityId: entityId } });
    RGP.store.audit("request.external_opinion", "request", req.id, { entityId: entityId, opinion: opinion });
    notifyAssignee(req, "info", { ar: "وردت مرئيات جهة خارجية", en: "External opinion received" });
    /* auto-return when all answered */
    if (req.referrals.every(function (r) { return !!r.answeredAt; })) {
      var actor = RGP.auth._current;
      RGP.auth._current = { id: "system", role: "platform_manager" }; /* system transition */
      try { WF.transition(req, "in_review", {}); } finally { RGP.auth._current = actor; }
    } else {
      RGP.store.save();
    }
  };

  /* ---------------- notes, reassign, satisfaction ---------------- */
  WF.addNote = function (req, text) {
    var u = RGP.auth.current();
    WF.event(req, "note", { textAr: text, textEn: text });
    RGP.store.audit("request.note_added", "request", req.id);
    RGP.store.save();
  };

  WF.reassign = function (req, toUserId) {
    var u = RGP.auth.current();
    if (!u || u.role !== "platform_manager") throw new Error("wf:mgrOnly");
    var fromId = req.assigneeId;
    req.assigneeId = toUserId;
    WF.event(req, "action", { payload: { reassigned: { from: fromId, to: toUserId } } });
    RGP.store.audit("request.reassigned", "request", req.id, { from: fromId, to: toUserId });
    notifyAssignee(req, "info", { ar: "أُسند إليك طلب", en: "A request was assigned to you" });
    RGP.store.save();
  };

  WF.submitSatisfaction = function (req, score, comment) {
    req.satisfaction = { score: score, comment: comment || null, at: RGP.nowISO() };
    RGP.store.audit("satisfaction.submitted", "satisfaction", req.id, { score: score });
    RGP.store.save();
    RGP.bus.emit("request:changed", req);
  };

  WF.verifyDoc = function (req, docKey, stateVal, note) {
    var doc = req.documents.filter(function (d) { return d.key === docKey; })[0];
    if (!doc) return;
    doc.verifyState = stateVal;   /* verified | rejected | pending */
    doc.verifyNote = note || null;
    WF.event(req, "doc", { payload: { key: docKey, verifyState: stateVal } });
    RGP.store.audit("request.doc_verified", "request", req.id, { key: docKey, state: stateVal });
    RGP.store.save();
  };

  /* ---------------- sweeps: escalation + auto-close (§3.6, transition 16) ---------------- */
  WF.sweep = function () {
    var S = RGP.store, changed = 0;
    S.state.requests.forEach(function (req) {
      /* escalation */
      if (WF.RUNNING_STATES.indexOf(req.state) >= 0 && req.sla && req.sla.startAt) {
        var band = WF.slaBand(req);
        if (band === "amber" && req.sla.escalation === "none") {
          req.sla.escalation = "amber";
          changed++;
          /* escalation ladder level 1: proactive alert to the specialist + section head */
          S.notify((req.assigneeId ? [req.assigneeId] : []).concat(S.managerIds()), {
            kind: "warning",
            title: { ar: "اقتراب موعد الاستحقاق — متابعة استباقية", en: "Approaching due date — proactive follow-up" },
            body: { ar: "بلغ الطلب " + req.id + " ثمانين بالمئة من مدته المحددة", en: "Request " + req.id + " reached 80% of its allotted time" },
            link: "#/work/review/" + req.id
          });
        }
        if (band === "red" && req.sla.escalation !== "red") {
          req.sla.escalation = "red";
          /* «يستحق اليوم» (100% exactly) is escalated but not yet a breach */
          var pastDue = WF.remainingDays(req) < 0;
          req.sla.breached = pastDue;
          changed++;
          RGP.store.audit("request.escalated", "request", req.id);
          WF.event(req, "action", {
            textAr: pastDue
              ? "تصعيد آلي: تجاوز الطلب مدته المحددة وأُشعر مدير مكتب المشاريع الكبرى"
              : "تصعيد آلي: بلغ الطلب مدته المحددة (يستحق اليوم) وأُشعر مدير مكتب المشاريع الكبرى",
            textEn: pastDue
              ? "Automatic escalation: the request exceeded its allotted time; the GPO director was notified"
              : "Automatic escalation: the request reached its allotted time (due today); the GPO director was notified",
            payload: { escalated: true }
          });
          S.notify(S.managerIds().concat(req.assigneeId ? [req.assigneeId] : []), {
            kind: "danger",
            title: pastDue ? { ar: "تجاوز مدة الإنجاز — تصعيد", en: "SLA breached — escalated" }
                           : { ar: "بلوغ مدة الإنجاز — تصعيد", en: "SLA due today — escalated" },
            body: pastDue ? { ar: "الطلب " + req.id + " تجاوز المدة المستهدفة", en: "Request " + req.id + " exceeded its target" }
                          : { ar: "الطلب " + req.id + " بلغ مدته المستهدفة اليوم", en: "Request " + req.id + " reached its target today" },
            link: "#/work/review/" + req.id
          });
        }
        /* a due-today escalation becomes a breach once the due date passes */
        if (req.sla.escalation === "red" && !req.sla.breached && WF.remainingDays(req) < 0) {
          req.sla.breached = true;
          changed++;
        }
      }
      /* auto-close 5wd after decision */
      if (WF.DECIDED_STATES.indexOf(req.state) >= 0 && req.decision) {
        if (RGP.workingDaysBetween(req.decision.decidedAt.slice(0, 10), RGP.todayISO()) >= 5) {
          var actor = RGP.auth._current;
          RGP.auth._current = { id: "system", role: "platform_manager" };
          try { WF.transition(req, "closed", {}); changed++; } catch (e) { /* noop */ }
          RGP.auth._current = actor;
        }
      }
    });
    /* challenge auto-escalation */
    S.state.challenges.forEach(function (ch) {
      if (ch.state === "in_progress" && !ch.escalatedAt) {
        var age = RGP.workingDaysBetween((ch.startedAt || ch.openedAt).slice(0, 10), RGP.todayISO());
        if (age > (ch.slaTargetDays || 10)) {
          ch.state = "escalated";
          ch.escalatedAt = RGP.nowISO();
          changed++;
          RGP.store.audit("challenge.escalated", "challenge", ch.id);
          S.notify(S.managerIds(), {
            kind: "danger",
            title: { ar: "تصعيد تحدٍّ متأخر", en: "Challenge escalated" },
            body: { ar: ch.id + " — " + (ch.title.ar || ""), en: ch.id + " — " + (ch.title.en || "") },
            link: "#/manager/challenges"
          });
        }
      }
    });
    if (changed) S.save();
    return changed;
  };

  /* ---------------- request factory ---------------- */
  WF.createDraft = function (payload) {
    var u = RGP.auth.current();
    var project = payload.projectId ? RGP.store.project(payload.projectId) : null;
    var svc = RGP.store.service(payload.serviceId);
    if (!WF.serviceEligible(svc, u)) throw new Error("wf:notEligible");
    var req = {
      id: RGP.store.nextRequestId(),
      projectId: payload.projectId || null,
      serviceId: payload.serviceId,
      createdById: u.id,
      personaSnapshot: {
        userId: u.id, name: u.name, personaType: u.personaType || null,
        org: u.org, delegatedBy: u.delegatedBy || null
      },
      state: "draft",
      formData: payload.formData || {},
      documents: payload.documents || [],
      involvedEntities: (svc && svc.supportingEntities ? svc.supportingEntities.slice() : []),
      referrals: [],
      timeline: [],
      returnNotes: [],
      resubmissionCount: 0,
      sla: { startAt: null, dueAt: null, pausedDays: 0, pauseStartAt: null, breached: false, escalation: "none" },
      priority: WF.computePriority(payload.projectId, payload.serviceId),
      assigneeId: null,
      firstResponseAt: null,
      decision: null,
      satisfaction: null,
      submittedAt: null, closedAt: null,
      createdAt: RGP.nowISO(), updatedAt: RGP.nowISO()
    };
    WF.event(req, "state", { fromState: null, toState: "draft" });
    RGP.store.state.requests.unshift(req);
    RGP.store.audit("request.created", "request", req.id);
    RGP.store.save();
    return req;
  };
})();
