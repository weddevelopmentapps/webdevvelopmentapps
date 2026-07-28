/* ============================================================
   Customer portal (ممثل المشروع) — home, journey explorer,
   my requests + tracking detail, challenges, inbox, profile.
   it-spec §7.3 · ux-spec §7.3, §7.5.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;

  function myRequests(u) {
    return RGP.store.state.requests.filter(function (r) {
      return r.createdById === u.id || (u.delegatedBy && r.createdById === u.delegatedBy);
    });
  }
  function myProjects(u) {
    return RGP.store.state.projects.filter(function (p) { return (u.projectIds || []).indexOf(p.id) >= 0; });
  }

  /* ---------------- home ---------------- */
  function home() {
    var u = RGP.auth.current();
    var reqs = myRequests(u);
    var open = reqs.filter(function (r) { return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0; });
    var needsAction = reqs.filter(function (r) { return ["returned", "draft"].indexOf(r.state) >= 0; });
    var approvedMonth = reqs.filter(function (r) {
      return r.decision && r.decision.type === "approved" &&
        RGP.daysBetween(r.decision.decidedAt.slice(0, 10), RGP.todayISO()) <= 30;
    });
    var myCh = RGP.store.state.challenges.filter(function (c) { return c.openedById === u.id; });
    var openCh = myCh.filter(function (c) { return ["open", "in_progress", "escalated"].indexOf(c.state) >= 0; });

    var head = h("div.page-head", null,
      h("div.kicker", null, td(u.org)),
      h("h1.t-title1", null, t("portal.welcome") + "، " + td(u.name).split("—")[0]),
      h("p.desc.t-sub", null,
        RGP.i18n.lang === "ar"
          ? "تابع طلباتك ومشاريعك، وابدأ خدمة جديدة في دقائق — بمدد إنجاز ملتزمة."
          : "Track your requests and projects, and start a new service in minutes — on committed timelines."),
      h("div.actions", null,
        h("a.btn.primary", { href: "#/wizard" }, UI.icon("plus", 18), t("portal.newRequest")),
        h("a.btn.secondary", { href: "#/portal/journeys" }, UI.icon("map", 18), t("portal.journeyExplorer"))));

    var band = h("div.kpi-band.mbs-3", null,
      UI.kpi({ label: { ar: "طلبات نشطة", en: "Active requests" }, value: open.length, onclick: function () { RGP.router.go("#/portal/requests"); } }),
      UI.kpi({ label: t("portal.needsAction"), value: needsAction.length, onclick: function () { RGP.router.go("#/portal/requests?f=action"); } }),
      UI.kpi({ label: { ar: "معتمدة هذا الشهر", en: "Approved this month" }, value: approvedMonth.length, onclick: function () { RGP.router.go("#/portal/requests"); } }),
      UI.kpi({ label: { ar: "تحديات مفتوحة", en: "Open challenges" }, value: openCh.length, onclick: function () { RGP.router.go("#/portal/challenges"); } }));

    /* active requests table */
    var tbl = requestsTable(open.slice(0, 6), true);

    /* needs-action stack */
    var actionCards = needsAction.length ? needsAction.slice(0, 4).map(function (r) {
      var svc = RGP.store.service(r.serviceId);
      return h("div.card.elev-1.card-pad-dense.mbe-2", null,
        h("div.flex.g1.mbe-1", null, h("span.id-cell.num", null, r.id), UI.statePill(r.state, true)),
        h("div.t-headline.mbe-1", null, svc ? td(svc.name) : ""),
        r.state === "returned" && r.returnNotes.length
          ? h("div.t-caption.warn-fg.mbe-1", { style: { fontWeight: 500 } },
              (RGP.i18n.lang === "ar" ? "مطلوب: " : "Needed: ") + r.returnNotes[r.returnNotes.length - 1].items.join("، "))
          : null,
        h("button.btn.primary.sm", { onclick: function () { RGP.router.go("#/portal/requests/" + r.id); } },
          r.state === "draft" ? (RGP.i18n.lang === "ar" ? "إكمال المسودة" : "Complete draft") : t("req.resubmit")));
    }) : [UI.empty("checkCircle", { ar: "لا إجراءات مطلوبة منك", en: "Nothing needs your action" },
      { ar: "سنشعرك فور الحاجة لأي استكمال.", en: "We'll notify you the moment anything is needed." }, null, true)];

    /* my projects */
    var projCards = myProjects(u).map(function (p) {
      var pReqs = RGP.store.state.requests.filter(function (r) { return r.projectId === p.id; });
      var pOpen = pReqs.filter(function (r) { return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0; }).length;
      return h("div.card.elev-1.card-pad-dense.flex.g15", null,
        h("span.avatar.lg", { style: { background: "var(--green-800)", color: "#fff" } }, p.monogram || "PR"),
        h("div.grow", null,
          h("div.t-headline", null, td(p.name)),
          h("div.t-caption.mut", { style: { fontWeight: 500 } },
            td(RGP.projectPhaseLabel(p.phase)) + " · " +
            (RGP.i18n.lang === "ar" ? "طلبات نشطة: " : "Active: ") + pOpen)),
        p.isGiga ? UI.gigaBadge() : null);
    });

    var grid = h("div.grid.cols-21.mbs-3", null,
      h("div", null,
        h("div.flex.between.mbe-2", null,
          h("h2.t-title3", null, t("portal.activeRequests")),
          h("a.btn.tertiary.sm", { href: "#/portal/requests" }, t("common.showAll"))),
        tbl),
      h("div", null,
        h("h2.t-title3.mbe-2", null, t("portal.needsAction")),
        h("div", null, actionCards),
        projCards.length ? h("div.mbs-3", null,
          h("h2.t-title3.mbe-2", null, t("portal.myProjects")),
          h("div.flex-col.g2", null, projCards)) : null));

    return RGP.shell(h("div", null, head, band, grid), { context: { ar: "بوابة المستفيد", en: "Customer portal" } });
  }

  /* shared requests table */
  function requestsTable(rows, compact) {
    return UI.table({
      rows: rows,
      pageSize: compact ? 6 : 12,
      defaultSort: "date", defaultDir: -1,
      cols: [
        { key: "id", label: t("req.number"), render: function (r) {
            return h("span.flex.g1", null, h("span.id-cell.num", null, r.id),
              r.priority === "fast_track" ? h("span", { title: t("sla.fastTrack"), class: "flex" }, UI.icon("bolt", 13, "giga-ic")) : null);
          }, sortVal: function (r) { return r.id; } },
        { key: "svc", label: t("req.service"), render: function (r) {
            var svc = RGP.store.service(r.serviceId);
            return h("span.ellipsis", { style: { maxWidth: "220px", display: "inline-block" } }, svc ? td(svc.name) : "—");
          }, sortVal: function (r) { var s = RGP.store.service(r.serviceId); return s ? td(s.name) : ""; } },
        { key: "project", label: t("req.project"), render: function (r) {
            var p = r.projectId && RGP.store.project(r.projectId);
            return p ? td(p.name) : "—";
          } },
        { key: "date", label: t("common.date"), render: function (r) {
            return h("span.num.t-footnote", null, RGP.fmtDate(r.submittedAt ? r.submittedAt.slice(0, 10) : r.createdAt.slice(0, 10)));
          }, sortVal: function (r) { return r.submittedAt || r.createdAt; } },
        { key: "sla", label: t("common.sla"), render: function (r) { return UI.slaChip(r) || h("span.mut", null, "—"); } },
        { key: "state", label: t("common.status"), render: function (r) { return UI.statePill(r.state); },
          sortVal: function (r) { return r.state; } }
      ],
      onRow: function (r) { RGP.router.go("#/portal/requests/" + r.id); },
      empty: UI.empty("docs", { ar: "لا توجد طلبات بعد", en: "No requests yet" },
        { ar: "ابدأ بتقديم أول طلب خدمة لمشروعك، وستجد هنا حالته خطوة بخطوة.", en: "Submit your first service request and track every step here." },
        h("a.btn.primary", { href: "#/wizard" }, t("portal.newRequest")))
    });
  }

  /* ---------------- my requests list ---------------- */
  function requestsList() {
    var u = RGP.auth.current();
    var all = myRequests(u);
    var filter = (location.hash.split("?")[1] || "").indexOf("f=action") >= 0 ? "action" : "all";

    var content = h("div");
    function refresh() {
      var rows = all;
      if (filter === "action") rows = all.filter(function (r) { return ["returned", "draft"].indexOf(r.state) >= 0; });
      if (filter === "open") rows = all.filter(function (r) { return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0; });
      if (filter === "done") rows = all.filter(function (r) { return RGP.lifecycle.TERMINAL_STATES.indexOf(r.state) >= 0; });
      content.innerHTML = "";
      content.appendChild(requestsTable(rows));
    }

    var seg = h("div.segmented", null,
      [["all", t("common.all")], ["open", { ar: "نشطة", en: "Open" }], ["action", t("portal.needsAction")], ["done", { ar: "منتهية", en: "Done" }]]
        .map(function (x) {
          return h("button" + (filter === x[0] ? ".active" : ""), {
            onclick: function (e) {
              filter = x[0];
              RGP.$$("button", e.target.closest(".segmented")).forEach(function (b) { b.classList.remove("active"); });
              e.target.closest("button").classList.add("active");
              refresh();
            }
          }, td(x[1]));
        }));

    refresh();

    var head = h("div.page-head", null,
      h("div.kicker", null, t("brand.short")),
      h("h1.t-title1", null, t("portal.myRequests")),
      h("div.actions", null,
        h("a.btn.primary", { href: "#/wizard" }, UI.icon("plus", 18), t("portal.newRequest")), seg));

    return RGP.shell(h("div", null, head, h("div.mbs-2", null, content)),
      { context: { ar: "بوابة المستفيد", en: "Customer portal" } });
  }

  /* ---------------- request tracking detail ---------------- */
  function requestDetail(params) {
    var u = RGP.auth.current();
    var r = RGP.store.request(params.id);
    if (!r) return RGP.shell(UI.empty("search", { ar: "الطلب غير موجود", en: "Request not found" }), {});
    var svc = RGP.store.service(r.serviceId);
    var proj = r.projectId && RGP.store.project(r.projectId);

    var isOwner = r.createdById === u.id || (u.delegatedBy && r.createdById === u.delegatedBy);
    if (u.role === "project_rep" && !isOwner) {
      return RGP.shell(UI.empty("shield", { ar: "لا تملك صلاحية عرض هذا الطلب", en: "You can't view this request" }), {});
    }

    var macro = RGP.macroPhase(r.state);
    var bad = ["rejected", "cancelled"].indexOf(r.state) >= 0;
    var macroLabels = [
      { ar: "التقديم", en: "Submit" }, { ar: "الفرز", en: "Screening" },
      { ar: "الدراسة", en: "Review" }, { ar: "القرار", en: "Decision" },
      { ar: "الإنجاز", en: "Done" }];

    var head = h("div.page-head", null,
      h("div.crumbs", null,
        h("a", { href: "#/portal/requests" }, t("portal.myRequests")),
        h("span", null, "‹"), h("span.num", null, r.id)),
      h("h1.t-title1", null,
        h("span.num", null, r.id),
        UI.statePill(r.state),
        r.priority === "fast_track" ? UI.gigaBadge() : null),
      h("div.flex.g2.wrap.mbs-1", null,
        h("span.t-sub.mut", null, svc ? td(svc.name) : ""),
        proj ? h("span.t-sub.mut", null, "· " + td(proj.name)) : null,
        r.submittedAt ? h("span.t-sub.mut.num", null, "· " + RGP.fmtDate(r.submittedAt.slice(0, 10))) : null,
        UI.slaChip(r)));

    var macroBar = h("div", null,
      h("div.macro-steps", null, macroLabels.map(function (_, i) {
        var cls = i < macro ? "done" : i === macro ? (bad ? "bad" : "current") : "";
        return h("span.m-step" + (cls ? "." + cls : ""));
      })),
      h("div.macro-labels", null, macroLabels.map(function (l) { return h("span", null, td(l)); })));

    /* timeline */
    var tl = h("div.timeline", null, r.timeline.slice().reverse().map(function (e) {
      var actor = RGP.store.userName(e.byId);
      var actorUser = RGP.store.user(e.byId);
      var cls = "";
      var text = "";
      if (e.type === "state") {
        if (e.toState === "returned") { cls = "warn"; }
        if (e.toState === "cancelled") { cls = "danger"; }
        text = e.toState ? t("state." + e.toState) : "";
        if (e.fromState === null && e.toState === "draft") text = RGP.i18n.lang === "ar" ? "إنشاء الطلب" : "Request created";
        if (e.toState === "submitted") text = RGP.i18n.lang === "ar" ? "تقديم الطلب وبدء احتساب المدة" : "Submitted — SLA clock started";
      } else if (e.type === "decision") {
        cls = e.toState === "rejected" ? "danger" : "";
        text = e.toState === "approved"
          ? (RGP.i18n.lang === "ar" ? "اعتماد الطلب وإصدار الوثيقة " : "Approved — document ") + (e.payload && e.payload.permitNo || "")
          : (RGP.i18n.lang === "ar" ? "رفض الطلب" : "Request declined");
      } else if (e.type === "referral") {
        text = (RGP.i18n.lang === "ar" ? "إحالة إلى: " : "Referred to: ") +
          ((e.payload && e.payload.entities) || []).map(function (id) { return td(RGP.entityName(id)); }).join("، ");
      } else if (e.type === "note") {
        cls = "hollow";
        text = RGP.i18n.lang === "ar" ? "ملاحظة" : "Note";
      } else {
        cls = "hollow";
        text = RGP.i18n.lang === "ar" ? "إجراء" : "Action";
      }
      var quote = null;
      if (e.type === "note" && (e.textAr || e.textEn)) quote = RGP.i18n.lang === "ar" ? (e.textAr || e.textEn) : (e.textEn || e.textAr);
      if (e.payload && e.payload.items) quote = (RGP.i18n.lang === "ar" ? "المطلوب استكماله: " : "To complete: ") + e.payload.items.join("، ");
      if (e.payload && e.payload.reason) quote = e.payload.reason + (e.payload.regulationRef ? " — " + e.payload.regulationRef : "");

      return h("div.tl-item" + (cls ? "." + cls : ""), null,
        h("span.tl-node"),
        h("div.tl-actor", null,
          actorUser ? UI.avatar(actorUser, "sm") : h("span.avatar.sm", null, "ن"),
          h("span.t-footnote", { style: { fontWeight: 600 } }, td(actor)),
          h("span.t-caption.mut", { style: { fontWeight: 500 } }, e.byRole === "system" ? (RGP.i18n.lang === "ar" ? "النظام" : "System") : t("role." + e.byRole))),
        h("div.t-sub", null, text),
        quote ? h("div.tl-quote", null, quote) : null,
        h("div.t-caption.mut.mbs-05", { style: { fontWeight: 500 } },
          h("span.num", null, RGP.fmtDateTime(e.at)), " · " + RGP.fmtAgo(e.at)));
    }));

    /* side stack */
    var side = h("div.flex-col.g2");

    /* SLA card */
    if (r.sla && r.sla.startAt) {
      var pct = RGP.clamp(RGP.lifecycle.consumedPct(r), 0, 130);
      var band = RGP.lifecycle.slaBand(r);
      side.appendChild(h("div.card.elev-1.card-pad-dense", null,
        h("div.t-footnote.mut.mbe-1", null, t("common.sla")),
        h("div.flex.g2", null,
          UI.ring(Math.min(pct, 100), 76, band === "paused" ? null : band),
          h("div", null,
            h("div.t-sub", null, t("sla.due") + ":"),
            h("div.t-headline.num", null, RGP.fmtDate(RGP.lifecycle.TERMINAL_STATES.indexOf(r.state) < 0 ? r.sla.dueAt : (r.decision ? r.decision.decidedAt.slice(0, 10) : r.sla.dueAt))),
            band === "paused" ? h("div.t-caption.warn-fg.mbs-05", { style: { fontWeight: 600 } }, t("sla.paused")) :
              RGP.lifecycle.TERMINAL_STATES.indexOf(r.state) < 0 ?
              h("div.t-caption.mut.mbs-05", { style: { fontWeight: 500 } },
                t("sla.elapsed") + " ", h("span.num", null, String(RGP.lifecycle.elapsedDays(r))),
                " " + t("common.of") + " ", h("span.num", null, String(RGP.lifecycle.slaDaysFor(r))), " " + t("common.workdays")) : null))));
    }

    /* documents card */
    side.appendChild(h("div.card.elev-1", null,
      h("div.card-pad-dense.hairline-b.t-footnote.mut", null, t("req.documents")),
      h("div", null, r.documents.length ? r.documents.map(function (d) {
        var stateIcon = d.verifyState === "verified" ? h("span.ok-fg.flex.g05", null, UI.icon("checkCircle", 16), h("span.t-caption", { style: { fontWeight: 600 } }, t("work.verifyDoc")))
          : d.verifyState === "rejected" ? h("span.danger-fg.flex.g05", null, UI.icon("alert", 16), h("span.t-caption", { style: { fontWeight: 600 } }, t("work.flagDoc")))
          : d.verifyState === "missing" ? h("span.warn-fg.t-caption", { style: { fontWeight: 600 } }, RGP.i18n.lang === "ar" ? "غير مرفق" : "Missing")
          : h("span.t-caption.mut", { style: { fontWeight: 500 } }, RGP.i18n.lang === "ar" ? "بانتظار التحقق" : "Pending verify");
        return h("div.doc-row" + (d.verifyState === "verified" ? ".verified" : ""), null,
          h("span.d-icon", null, UI.icon("doc", 18)),
          h("div.grow", null,
            h("div.t-footnote", { style: { fontWeight: 600 } }, td(d.name)),
            d.fileName ? h("div.t-caption.mut.num", { style: { fontWeight: 500 } }, d.fileName + " · " + RGP.fmtNum(d.sizeKB, { dec: 0 }) + " KB") : null),
          h("span.d-state", null, stateIcon));
      }) : h("div.card-pad-dense.t-sub.mut", null, RGP.i18n.lang === "ar" ? "لا مستندات مطلوبة لهذه الخدمة" : "No documents required"))));

    /* entities card */
    if (r.involvedEntities.length) {
      side.appendChild(h("div.card.elev-1.card-pad-dense", null,
        h("div.t-footnote.mut.mbe-1", null, RGP.i18n.lang === "ar" ? "الجهات المعنية" : "Involved entities"),
        h("div.flex.g1.wrap", null, r.involvedEntities.map(function (eid) {
          var ref = r.referrals.filter(function (x) { return x.entityId === eid; })[0];
          return h("span.pill." + (ref ? (ref.answeredAt ? "ok" : "info") : "plain"), null, td(RGP.entityName(eid)),
            ref && !ref.answeredAt ? "…" : "");
        }))));
    }

    /* decision card */
    if (r.decision) {
      side.appendChild(h("div.card.elev-1.card-pad-dense", null,
        h("div.t-footnote.mut.mbe-1", null, t("req.decision")),
        r.decision.type === "approved"
          ? h("div", null,
              h("div.flex.g1.mbe-1", null, h("span.ok-fg", null, UI.icon("checkCircle", 20)), h("span.t-headline", null, t("state.approved"))),
              h("div.t-sub", null, t("req.documentNo") + ": ", h("b.num", null, r.decision.permitNo)),
              h("div.t-sub.num", null, RGP.fmtDate(r.decision.decidedAt.slice(0, 10))),
              r.decision.conditions ? h("div.tl-quote.mbs-1", null, r.decision.conditions) : null,
              h("button.btn.secondary.sm.mbs-2", { onclick: function () { RGP.print.permit(r); } }, UI.icon("print", 16), t("req.printPermit")))
          : h("div", null,
              h("div.flex.g1.mbe-1", null, h("span.danger-fg", null, UI.icon("xCircle", 20)), h("span.t-headline", null, t("state.rejected"))),
              h("div.tl-quote", null, r.decision.reason),
              h("div.t-caption.mut.mbs-1", { style: { fontWeight: 500 } }, t("req.regulationRef") + ": " + r.decision.regulationRef))));
    }

    /* satisfaction */
    if (r.decision && !r.satisfaction && isOwner) {
      var starsBox = h("div.card.elev-1.card-pad-dense", null,
        h("div.t-headline.mbe-1", { style: { textAlign: "center" } }, t("req.rate")),
        UI.stars(function (n) {
          setTimeout(function () {
            RGP.lifecycle.submitSatisfaction(r, n);
            UI.toast("ok", { ar: t("req.rateThanks"), en: t("req.rateThanks") });
            RGP.router.render();
          }, 350);
        }));
      side.appendChild(starsBox);
    } else if (r.satisfaction) {
      side.appendChild(h("div.card.elev-1.card-pad-dense.flex.g1", null,
        h("span", { style: { color: "var(--sand)" } }, UI.icon("starF", 18)),
        h("span.t-sub", null, t("req.satisfaction") + ": "),
        h("b.num", null, r.satisfaction.score + "/5")));
    }

    /* owner actions */
    var actions = h("div.flex.g15.wrap.mbs-3");
    if (isOwner && u.role === "project_rep") {
      if (r.state === "returned") {
        actions.appendChild(h("button.btn.primary", { onclick: function () { resubmitFlow(r); } }, t("req.resubmit")));
      }
      if (r.state === "draft") {
        actions.appendChild(h("a.btn.primary", { href: "#/wizard?draft=" + r.id }, RGP.i18n.lang === "ar" ? "إكمال المسودة" : "Complete draft"));
      }
      if (RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0 && !r.decision) {
        actions.appendChild(h("button.btn.destructive", {
          onclick: function () {
            UI.confirm({ ar: "إلغاء الطلب " + r.id, en: "Cancel " + r.id },
              { ar: "سيتم إيقاف دراسة الطلب نهائيًا. يمكنك تقديم طلب جديد لاحقًا.", en: "Processing stops permanently. You may submit a new request later." },
              { ar: "إلغاء الطلب", en: "Cancel request" }, "destructive-solid",
              function () {
                try { RGP.lifecycle.transition(r, "cancelled", {}); RGP.router.render(); }
                catch (e) { UI.toast("danger", { ar: "تعذر الإلغاء", en: "Couldn't cancel" }); }
              });
          }
        }, t("req.cancelReq")));
      }
    }

    /* form data */
    var formCard = h("div.card.elev-1.card-pad", null,
      h("div.t-headline.mbe-2", null, t("req.formData")),
      h("div.review-grid", null, (svc ? svc.formFields : []).map(function (f) {
        var v = r.formData[f.key];
        return h("div", null,
          h("div.rk", null, td(f.label)),
          h("div.rv" + (f.type === "number" || f.type === "date" || f.type === "parcel-id" || f.type === "map-point" ? ".num" : ""),
            null, v == null || v === "" ? "—" : String(v)));
      })),
      r.note ? h("div.tl-quote.mbs-2", null, td(r.note)) : null);

    var main = h("div.grid.cols-21.mbs-3", null,
      h("div", null,
        formCard,
        h("div.card.elev-1.card-pad.mbs-2", null,
          h("div.t-headline.mbe-3", null, t("req.timeline")), tl)),
      side);

    return RGP.shell(h("div", null, head, macroBar, actions, main),
      { context: { ar: "تفاصيل الطلب", en: "Request detail" } });
  }

  /* resubmission flow — customer addresses each missing item */
  function resubmitFlow(r) {
    var last = r.returnNotes[r.returnNotes.length - 1];
    var checks = [];
    var note = h("textarea.input", { placeholder: RGP.i18n.lang === "ar" ? "أوضح ما تم استكماله… (اختياري)" : "Describe what was completed… (optional)" });
    var body = h("div", null,
      h("p.t-sub.mut.mbe-2", null, RGP.i18n.lang === "ar"
        ? "أكد استكمال جميع البنود المطلوبة، وستستأنف مدة الإنجاز من تاريخ إعادة التقديم."
        : "Confirm every requested item is complete — the SLA clock resumes on resubmission."),
      last.items.map(function (item, i) {
        var cb = h("input", { type: "checkbox", id: "ri-" + i });
        checks.push(cb);
        return h("label.checkbox-row.mbe-2", { for: "ri-" + i }, cb, h("span.t-sub", null, item));
      }),
      h("div.field.mbs-2", null, note));
    UI.modal({
      title: { ar: "استكمال وإعادة التقديم", en: "Complete & resubmit" },
      body: body,
      actions: function (close) {
        return [
          h("button.btn.secondary", { onclick: close }, t("common.cancel")),
          h("button.btn.primary", {
            onclick: function () {
              if (!checks.every(function (c) { return c.checked; })) {
                UI.toast("warn", { ar: "أكد جميع البنود قبل الإرسال", en: "Confirm all items first" });
                return;
              }
              /* re-attach any missing docs automatically as re-uploaded */
              r.documents.forEach(function (d) {
                if (d.verifyState === "missing" || d.verifyState === "rejected") {
                  d.verifyState = "pending";
                  d.fileName = d.fileName || (d.key + "-resubmitted.pdf");
                  d.sizeKB = d.sizeKB || 240;
                  d.uploadedAt = RGP.nowISO();
                }
              });
              try {
                RGP.lifecycle.transition(r, "resubmitted", { note: note.value });
                close();
                UI.toast("ok", { ar: "أُعيد تقديم الطلب", en: "Resubmitted" });
                RGP.router.render();
              } catch (e) { UI.toast("danger", { ar: "تعذر إعادة التقديم", en: "Couldn't resubmit" }); }
            }
          }, t("req.resubmit"))
        ];
      }
    });
  }

  /* ---------------- journey explorer ---------------- */
  function journeys() {
    var u = RGP.auth.current();
    var J = RGP.store.state.journeys;
    var openJourney = J[0].id;
    var openPath = null;

    var wrap = h("div");
    function render() {
      wrap.innerHTML = "";
      var jr = J.filter(function (x) { return x.id === openJourney; })[0];

      wrap.appendChild(h("div.flex.g1.wrap.mbe-3", null, J.map(function (x) {
        return h("button.chip" + (x.id === openJourney ? ".active" : ""), {
          onclick: function () { openJourney = x.id; openPath = null; render(); }
        }, td(x.name));
      })));

      wrap.appendChild(h("div.flex.g2.wrap.mbe-3", null,
        h("span.pill.info", null, t("phase." + jr.phase)),
        h("span.t-sub.mut", null, td(jr.audience)),
        h("span.grow"),
        h("span.flex.g05", null, (jr.personas || []).map(function (p) {
          return h("span.pill.plain.sm", null, td(RGP.personaLabel(p)));
        }))));

      jr.steps.forEach(function (s, i) {
        var svc = s.serviceId && RGP.store.service(s.serviceId);
        wrap.appendChild(h("div.jr-step-row" + (s.kind !== "service" ? ".review" : ""), null,
          h("span.jr-n.num", null, String(i + 1)),
          h("div.grow", null,
            h("div.t-headline", null, td(s.title)),
            h("div.flex.g2.wrap.mbs-05", null,
              h("span.t-caption.mut.flex.g05", { style: { fontWeight: 500 } }, UI.icon("user", 12), td(s.actor)),
              s.slaDays ? h("span.t-caption.mut.flex.g05.num", { style: { fontWeight: 500 } }, UI.icon("clock", 12),
                String(s.slaDays) + " " + t("common.workdays")) : null,
              s.note ? h("span.t-caption.mut", { style: { fontWeight: 500 } }, td(s.note)) : null)),
          svc && u.role === "project_rep" ? h("a.btn.tertiary.sm", { href: "#/wizard?service=" + svc.id },
            RGP.i18n.lang === "ar" ? "ابدأ الطلب" : "Start", UI.fwd(14)) : null));
      });

      if (jr.paths) {
        wrap.appendChild(h("h3.t-title3.mbs-4.mbe-2", null,
          RGP.i18n.lang === "ar" ? "مسارات اعتماد المخطط" : "Plan-approval paths"));
        jr.paths.forEach(function (p) {
          var open = openPath === p.id;
          wrap.appendChild(h("div.path-card.mbe-2" + (open ? ".open" : ""), {
            onclick: function () { openPath = open ? null : p.id; render(); }
          },
            h("div.flex.g15", null,
              h("span.accent", null, UI.icon(open ? "chevD" : (RGP.i18n.lang === "ar" ? "chevS" : "arrow"), 16)),
              h("div.grow", null,
                h("div.t-headline", null, td(p.name)),
                h("div.t-caption.mut", { style: { fontWeight: 500 } }, td(p.description))),
              h("span.pill.plain.sm.num", null, p.steps.length + (RGP.i18n.lang === "ar" ? " خطوات" : " steps"))),
            open ? h("div.mbs-2", { onclick: function (e) { e.stopPropagation(); } }, p.steps.map(function (s, i) {
              var svc = s.serviceId && RGP.store.service(s.serviceId);
              return h("div.jr-step-row" + (s.kind !== "service" ? ".review" : ""), null,
                h("span.jr-n.num", null, (i + 1) + ""),
                h("div.grow", null,
                  h("div.t-sub", { style: { fontWeight: 600 } }, td(s.title)),
                  h("div.flex.g2.mbs-05", null,
                    h("span.t-caption.mut", { style: { fontWeight: 500 } }, td(s.actor)),
                    s.slaDays ? h("span.t-caption.mut.num", { style: { fontWeight: 500 } }, s.slaDays + " " + t("common.workdays")) : null)),
                svc && u.role === "project_rep" ? h("a.btn.tertiary.sm", { href: "#/wizard?service=" + svc.id },
                  RGP.i18n.lang === "ar" ? "ابدأ" : "Start") : null);
            })) : null));
        });
      }
    }
    render();

    var head = h("div.page-head", null,
      h("div.kicker", null, t("brand.short")),
      h("h1.t-title1", null, t("portal.journeyExplorer")),
      h("p.desc.t-sub", null, RGP.i18n.lang === "ar"
        ? "الرحلات الرسمية للمطور والمستثمر العقاري كما اعتمدتها أمانة منطقة الرياض — يوليو 2026."
        : "The official developer & investor journeys as adopted by the Amanah — July 2026."));

    return RGP.shell(h("div", null, head, wrap), { context: t("portal.journeyExplorer"), narrow: true });
  }

  /* ---------------- challenges (customer) ---------------- */
  function challenges() {
    var u = RGP.auth.current();
    var mine = RGP.store.state.challenges.filter(function (c) {
      return c.openedById === u.id || (u.projectIds || []).indexOf(c.projectId) >= 0;
    });

    var head = h("div.page-head", null,
      h("div.kicker", null, t("brand.short")),
      h("h1.t-title1", null, t("ch.title")),
      h("p.desc.t-sub", null, RGP.i18n.lang === "ar"
        ? "سجّل أي معوق يواجه مشروعك وسيتولى مكتب المشاريع الكبرى إدارته حتى الإغلاق."
        : "Log any obstacle facing your project — the GPO drives it to closure."),
      h("div.actions", null,
        h("button.btn.primary", { onclick: function () { RGP.challengeForm(); } }, UI.icon("plus", 18), t("ch.new"))));

    var list = mine.length ? h("div.grid.cols-2.mbs-2", null, mine.map(function (c) { return RGP.challengeCard(c, false); }))
      : UI.empty("flag", { ar: "لا تحديات مسجلة", en: "No challenges logged" },
        { ar: "نتمنى ألا تحتاج هذه الصفحة أبدًا — وإن احتجتها فنحن هنا.", en: "We hope you never need this page — but we're here if you do." });

    return RGP.shell(h("div", null, head, list), { context: t("ch.title") });
  }

  /* ---------------- inbox page ---------------- */
  function inbox() {
    var u = RGP.auth.current();
    var list = RGP.store.state.notifications.filter(function (n) { return n.userId === u.id; });

    var head = h("div.page-head", null,
      h("h1.t-title1", null, t("ntf.title")),
      h("div.actions", null,
        h("button.btn.secondary.sm", {
          onclick: function () {
            list.forEach(function (n) { n.read = true; });
            RGP.store.save(); RGP.router.render();
          }
        }, t("ntf.markAll"))));

    var body = list.length ? h("div.card.elev-1", null, list.map(function (n) {
      var iconName = n.kind === "success" ? "checkCircle" : (n.kind === "danger" || n.kind === "warning") ? "alert" : "infoC";
      return h("div.ntf-row" + (n.read ? "" : ".unread"), {
        onclick: function () { n.read = true; RGP.store.save(); if (n.link) RGP.router.go(n.link); }
      },
        h("span.ntf-icon." + (n.kind || "info"), null, UI.icon(iconName, 16)),
        h("div.grow", null,
          h("div.t-footnote", { style: { fontWeight: 600 } }, td(n.title)),
          n.body ? h("div.t-sub.mut", null, td(n.body)) : null,
          h("div.t-caption.mut.mbs-05", { style: { fontWeight: 500 } }, RGP.fmtAgo(n.at))));
    })) : UI.empty("bell", { ar: "لا إشعارات", en: "No notifications" }, { ar: t("ntf.empty"), en: t("ntf.empty") });

    return RGP.shell(h("div", null, head, h("div.mbs-2", null, body)), { context: t("ntf.title"), narrow: true });
  }

  /* ---------------- profile ---------------- */
  function profile() {
    var u = RGP.auth.current();
    var head = h("div.page-head", null, h("h1.t-title1", null, t("prof.title")));

    var idCard = h("div.card.elev-1.card-pad.flex.g2", null,
      UI.avatar(u, "lg"),
      h("div.grow", null,
        h("div.t-title3", null, td(u.name)),
        h("div.t-sub.mut", null, td(u.title || { ar: "", en: "" })),
        h("div.t-footnote.mut.mbs-1", null, t("prof.org") + ": " + td(u.org)),
        h("div.t-footnote.mut.num", null, u.email)),
      h("div.flex-col.g1", { style: { alignItems: "flex-end" } },
        h("span.pill.info", null, t("role." + u.role)),
        u.personaType ? h("span.pill.plain", null, t("persona." + u.personaType)) : null,
        u.delegatedBy ? h("span.pill.plain.sm", null,
          (RGP.i18n.lang === "ar" ? "بالإنابة عن: " : "Delegate of: ") + td(RGP.store.userName(u.delegatedBy))) : null));

    var theme = document.documentElement.getAttribute("data-theme") || "light";
    var prefs = h("div.card.elev-1.card-pad.mbs-2", null,
      h("div.t-headline.mbe-2", null, t("prof.theme")),
      h("div.segmented", null,
        [["light", t("prof.theme.light")], ["dark", t("prof.theme.dark")]].map(function (x) {
          return h("button" + (theme === x[0] ? ".active" : ""), {
            onclick: function () {
              try { localStorage.setItem("rgp.theme", x[0]); } catch (e) { /* noop */ }
              document.documentElement.setAttribute("data-theme", x[0]);
              RGP.charts.disposeAll(); RGP.router.render();
            }
          }, x[1]);
        })),
      h("div.t-headline.mbs-3.mbe-2", null, RGP.i18n.lang === "ar" ? "اللغة" : "Language"),
      h("div.segmented", null,
        [["ar", "العربية"], ["en", "English"]].map(function (x) {
          return h("button" + (RGP.i18n.lang === x[0] ? ".active" : ""), {
            onclick: function () { if (RGP.i18n.lang !== x[0]) { RGP.i18n.toggle(); RGP.router.render(); } }
          }, x[1]);
        })));

    var canAdmin = u.role === "platform_manager";
    var data = h("div.card.elev-1.card-pad.mbs-2", null,
      h("div.t-headline.mbe-1", null, t("prof.dataTools")),
      h("p.t-caption.mut.mbe-2", { style: { fontWeight: 500 } }, t("common.demo")),
      h("div.flex.g15.wrap", null,
        h("button.btn.secondary.sm", {
          onclick: function () {
            var blob = new Blob([RGP.store.exportSnapshot()], { type: "application/json" });
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "rgp-backup-" + RGP.todayISO() + ".json";
            a.click();
            UI.toast("ok", { ar: t("toast.exportDone"), en: t("toast.exportDone") });
          }
        }, UI.icon("export", 16), t("common.export")),
        canAdmin ? h("button.btn.secondary.sm", {
          onclick: function () {
            var inp = h("input", { type: "file", accept: ".json" });
            inp.onchange = function () {
              var f = inp.files[0]; if (!f) return;
              var rd = new FileReader();
              rd.onload = function () {
                try { RGP.store.importSnapshot(rd.result); UI.toast("ok", { ar: t("toast.imported"), en: t("toast.imported") }); RGP.router.render(); }
                catch (e) { UI.toast("danger", { ar: t("toast.importFail"), en: t("toast.importFail") }); }
              };
              rd.readAsText(f);
            };
            inp.click();
          }
        }, UI.icon("upload", 16), t("common.import")) : null,
        canAdmin ? h("button.btn.destructive.sm", {
          onclick: function () {
            UI.confirm({ ar: "استرجاع بيانات العرض", en: "Reset demo data" },
              { ar: "ستفقد جميع التعديلات وتعود المنصة إلى بيانات العرض الأصلية.", en: "All changes are lost; the platform returns to the pristine demo data." },
              { ar: "استرجاع", en: "Reset" }, "destructive-solid",
              function () { RGP.store.resetToSeed(); UI.toast("ok", { ar: t("toast.resetDone"), en: t("toast.resetDone") }); RGP.router.go(RGP.auth.homeRoute()); });
          }
        }, t("common.reset")) : null));

    return RGP.shell(h("div", null, head, idCard, prefs, data), { context: t("prof.title"), narrow: true });
  }

  RGP.router.register("#/portal", ["project_rep"], home);
  RGP.router.register("#/portal/journeys", ["project_rep", "amanah_specialist", "platform_manager", "viewer"], journeys);
  RGP.router.register("#/portal/requests", ["project_rep"], requestsList);
  RGP.router.register("#/portal/requests/:id", ["project_rep", "viewer"], requestDetail);
  RGP.router.register("#/portal/challenges", ["project_rep"], challenges);
  RGP.router.register("#/portal/inbox", ["project_rep", "amanah_specialist", "platform_manager", "external_entity", "viewer"], inbox);
  RGP.router.register("#/portal/profile", ["project_rep", "amanah_specialist", "platform_manager", "external_entity", "viewer"], profile);
})();
