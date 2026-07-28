/* ============================================================
   Specialist workspace (أخصائي بلدي) — priority queue with SLA
   countdown + 3-pane review workspace + guarded decisions.
   it-spec §7.4 · ux-spec §7.6-7.7 · rmun-notes §1-3.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;

  /* ---------------- queue ---------------- */
  function queue() {
    var u = RGP.auth.current();
    var isMgr = u.role === "platform_manager";
    var tab = "inbox";
    var svcFilter = "", stFilter = "", gigaOnly = false;

    var content = h("div.mbs-2");

    function rows() {
      var all = RGP.store.state.requests.filter(function (r) { return r.state !== "draft"; });
      if (!isMgr) {
        all = all.filter(function (r) { return r.assigneeId === u.id || !r.assigneeId; });
      }
      var byTab = {
        inbox: function (r) { return ["submitted", "resubmitted"].indexOf(r.state) >= 0; },
        mine: function (r) { return ["screening", "in_review", "external_review"].indexOf(r.state) >= 0; },
        decisions: function (r) { return r.state === "decision_due"; },
        returned: function (r) { return r.state === "returned"; },
        done: function (r) { return RGP.lifecycle.TERMINAL_STATES.indexOf(r.state) >= 0; },
        all: function () { return true; }
      };
      var list = all.filter(byTab[tab]);
      if (svcFilter) list = list.filter(function (r) { return r.serviceId === svcFilter; });
      if (stFilter) list = list.filter(function (r) { return r.state === stFilter; });
      if (gigaOnly) list = list.filter(function (r) { return r.priority === "fast_track"; });
      /* §3.4 ordering: fast_track first, then earliest due */
      list.sort(function (a, b) {
        if (a.priority !== b.priority) return a.priority === "fast_track" ? -1 : 1;
        var da = a.sla && a.sla.dueAt || "9999", db2 = b.sla && b.sla.dueAt || "9999";
        if (da !== db2) return da < db2 ? -1 : 1;
        return (a.submittedAt || "") < (b.submittedAt || "") ? -1 : 1;
      });
      return list;
    }

    function counts() {
      var all = RGP.store.state.requests.filter(function (r) { return r.state !== "draft"; });
      if (!isMgr) all = all.filter(function (r) { return r.assigneeId === u.id || !r.assigneeId; });
      return {
        inbox: all.filter(function (r) { return ["submitted", "resubmitted"].indexOf(r.state) >= 0; }).length,
        mine: all.filter(function (r) { return ["screening", "in_review", "external_review"].indexOf(r.state) >= 0; }).length,
        decisions: all.filter(function (r) { return r.state === "decision_due"; }).length,
        returned: all.filter(function (r) { return r.state === "returned"; }).length
      };
    }

    function refresh() {
      content.innerHTML = "";
      content.appendChild(UI.table({
        rows: rows(),
        pageSize: 12,
        cols: [
          { key: "id", label: t("req.number"), render: function (r) {
              return h("span.flex.g1", null,
                h("span.id-cell.num", null, r.id),
                r.priority === "fast_track" ? h("span", { class: "flex", title: t("sla.fastTrack"), style: { color: "var(--sand-deep)" } }, UI.icon("bolt", 14)) : null);
            }, sortVal: function (r) { return r.id; } },
          { key: "svc", label: t("req.service"), render: function (r) {
              var s = RGP.store.service(r.serviceId);
              return h("span.ellipsis", { style: { maxWidth: "200px", display: "inline-block" } }, s ? td(s.name) : "—");
            } },
          { key: "proj", label: t("req.project"), render: function (r) {
              var p = r.projectId && RGP.store.project(r.projectId);
              return p ? h("span.ellipsis", { style: { maxWidth: "150px", display: "inline-block" } }, td(p.name)) : "—";
            } },
          { key: "applicant", label: t("req.applicant"), render: function (r) {
              return h("span.t-footnote", null, td(r.personaSnapshot.name));
            } },
          { key: "sub", label: { ar: "الاستلام", en: "Received" }, render: function (r) {
              return h("span.num-date.t-footnote", null, r.submittedAt ? RGP.fmtDate(r.submittedAt.slice(0, 10)) : "—");
            }, sortVal: function (r) { return r.submittedAt || ""; } },
          { key: "sla", label: t("work.slaLeft"), render: function (r) { return UI.slaChip(r) || "—"; },
            sortVal: function (r) { return r.sla && r.sla.dueAt || "9999"; } },
          { key: "state", label: t("common.status"), render: function (r) { return UI.statePill(r.state); } },
          { key: "assignee", label: t("req.assignee"), render: function (r) {
              var a = r.assigneeId && RGP.store.user(r.assigneeId);
              return a ? UI.avatar(a, "sm") : h("span.pill.plain.sm", null, t("work.unassigned"));
            } }
        ],
        onRow: function (r) { RGP.router.go("#/work/review/" + r.id); },
        empty: UI.empty("inbox", { ar: "لا توجد طلبات في هذه القائمة", en: "No requests in this list" },
          null, null, true)
      }));
    }

    var c = counts();
    var seg = h("div.segmented", null,
      [["inbox", { ar: "وارد جديد", en: "Inbox" }, c.inbox],
       ["mine", { ar: "قيد الدراسة", en: "In progress" }, c.mine],
       ["decisions", { ar: "قرارات مستحقة", en: "Decisions" }, c.decisions],
       ["returned", { ar: "معاد للعميل", en: "Returned" }, c.returned],
       ["done", { ar: "منتهية", en: "Done" }, null],
       ["all", t("common.all"), null]].map(function (x) {
        return h("button" + (tab === x[0] ? ".active" : ""), {
          onclick: function (e) {
            tab = x[0];
            RGP.$$("button", e.target.closest(".segmented")).forEach(function (b) { b.classList.remove("active"); });
            e.target.closest("button").classList.add("active");
            refresh();
          }
        }, td(x[1]), x[2] ? h("span.count.num", null, "(" + x[2] + ")") : null);
      }));

    var services = RGP.store.state.services;
    var filters = h("div.flex.g15.wrap.mbs-2", null,
      h("div.select-wrap", { style: { width: "220px" } },
        h("select.input.sm", {
          onchange: function (e) { svcFilter = e.target.value; refresh(); }
        },
          h("option", { value: "" }, t("work.filters.service") + ": " + t("common.all")),
          services.map(function (s) { return h("option", { value: s.id }, td(s.name)); }))),
      h("div.select-wrap", { style: { width: "170px" } },
        h("select.input.sm", {
          onchange: function (e) { stFilter = e.target.value; refresh(); }
        },
          h("option", { value: "" }, t("work.filters.state") + ": " + t("common.all")),
          RGP.lifecycle.STATES.filter(function (s) { return s !== "draft"; }).map(function (s) {
            return h("option", { value: s }, t("state." + s));
          }))),
      h("label.checkbox-row", { style: { alignItems: "center" } },
        h("input", { type: "checkbox", onchange: function (e) { gigaOnly = e.target.checked; refresh(); } }),
        h("span.t-footnote", { style: { fontWeight: 600 } }, t("sla.fastTrack"))));

    refresh();

    var kpis = RGP.kpi.compute();
    var head = h("div.page-head", null,
      h("div.kicker", null, td(u.org)),
      h("h1.t-title1", null, t("work.queue")),
      h("p.desc.t-sub", null,
        (RGP.i18n.lang === "ar" ? "متوسط زمن المعالجة: " : "Avg processing: "),
        h("b", null, RGP.fmtWorkdays(kpis.avgProcessing)), " · ",
        (RGP.i18n.lang === "ar" ? "الالتزام بالمواعيد: " : "On-time: "),
        h("b.num", null, kpis.onTimePct + "%")),
      h("div.actions", null, seg));

    return RGP.shell(h("div", null, head, filters, content), { context: t("work.queue") });
  }

  /* ---------------- review workspace ---------------- */
  function review(params) {
    var u = RGP.auth.current();
    var r = RGP.store.request(params.id);
    if (!r) return RGP.shell(UI.empty("search", { ar: "الطلب غير موجود", en: "Request not found" }), {});
    var svc = RGP.store.service(r.serviceId);
    var proj = r.projectId && RGP.store.project(r.projectId);
    var applicant = RGP.store.user(r.createdById);
    var actions = RGP.lifecycle.actionsFor(r, u);

    function has(a) { return actions.indexOf(a) >= 0; }
    function rerender() { RGP.router.render(); }
    function tryTransition(to, ctx, okMsg) {
      try {
        RGP.lifecycle.transition(r, to, ctx || {});
        if (okMsg) UI.toast("ok", okMsg);
        rerender();
      } catch (e) {
        console.error(e);
        UI.toast("danger", { ar: "إجراء غير مسموح في الحالة الحالية", en: "Action not allowed in the current state" });
      }
    }

    /* ---- pane A: request summary ---- */
    var paneA = h("div.ws-a.flex-col.g2", null,
      h("div.card.elev-1.card-pad-dense", null,
        h("div.flex.g1.wrap.mbe-1", null,
          h("span.id-cell.num.t-headline", null, r.id),
          r.priority === "fast_track" ? UI.gigaBadge() : null),
        UI.statePill(r.state),
        h("div.t-headline.mbs-2", null, svc ? td(svc.name) : ""),
        h("div.t-caption.mut", { style: { fontWeight: 500 } }, svc ? td(RGP.categoryLabel(svc.category)) + " · " + t("phase." + svc.phase) : ""),
        r.sla && r.sla.startAt ? h("div.flex.g2.mbs-2", null,
          UI.ring(Math.min(RGP.lifecycle.consumedPct(r), 100), 64, RGP.lifecycle.slaBand(r) === "paused" ? null : RGP.lifecycle.slaBand(r)),
          h("div", null,
            h("div.t-caption.mut", { style: { fontWeight: 500 } }, t("sla.due")),
            h("div.t-footnote.num-date", { style: { fontWeight: 600 } }, RGP.fmtDate(r.sla.dueAt)),
            h("div.mbs-1", null, UI.slaChip(r)))) : null),
      h("div.card.elev-1.card-pad-dense", null,
        h("div.t-footnote.mut.mbe-1", null, t("req.applicant")),
        h("div.flex.g15", null,
          applicant ? UI.avatar(applicant) : null,
          h("div", null,
            h("div.t-footnote", { style: { fontWeight: 600 } }, td(r.personaSnapshot.name)),
            h("div.t-caption.mut", { style: { fontWeight: 500 } },
              t("persona." + (r.personaSnapshot.personaType || "developer")) + " · " + td(r.personaSnapshot.org)))),
        r.personaSnapshot.delegatedBy ? h("div.t-caption.mut.mbs-1", { style: { fontWeight: 500 } },
          (RGP.i18n.lang === "ar" ? "بالإنابة عن: " : "Delegate of: ") + td(RGP.store.userName(r.personaSnapshot.delegatedBy)),
          (function () {
            var creator = RGP.store.user(r.createdById);
            if (!creator || !creator.allowedServiceIds) return null;
            var inScope = creator.allowedServiceIds.indexOf(r.serviceId) >= 0;
            return h("div.mbs-05", null,
              h("span.pill." + (inScope ? "ok" : "dang") + ".sm", null,
                inScope ? (RGP.i18n.lang === "ar" ? "الخدمة ضمن نطاق التفويض" : "Within delegation scope")
                        : (RGP.i18n.lang === "ar" ? "الخدمة خارج نطاق التفويض" : "Outside delegation scope")));
          })()) : null),
      proj ? h("div.card.elev-1.card-pad-dense", null,
        h("div.t-footnote.mut.mbe-1", null, t("req.project")),
        h("div.flex.g15", null,
          h("span.avatar", { style: { background: "var(--green-800)", color: "#fff" } }, proj.monogram || "PR"),
          h("div", null,
            h("div.t-footnote", { style: { fontWeight: 600 } }, td(proj.name)),
            h("div.t-caption.mut", { style: { fontWeight: 500 } }, td(RGP.projectPhaseLabel(proj.phase)) + " · " + td(proj.location.district)))),
        h("div.flex.g1.mbs-1.wrap", null,
          h("span.pill." + (proj.status === "enabled" ? "ok" : "info") + ".sm", null, td(RGP.projectStatusLabel(proj.status))),
          proj.isGiga ? h("span.pill.plain.sm", null, RGP.i18n.lang === "ar" ? "سجل المشاريع الكبرى" : "Giga registry") : null)) : null,
      priorHistory(),
      (function () {
        var linked = RGP.store.state.challenges.filter(function (c) { return c.requestId === r.id; });
        if (!linked.length) return null;
        return h("div.card.elev-1.card-pad-dense", null,
          h("div.t-footnote.mut.mbe-1", null, RGP.i18n.lang === "ar" ? "تحديات مرتبطة" : "Linked challenges"),
          linked.map(function (c) {
            return h("div.flex.g1.hairline-b", { style: { padding: "6px 0", cursor: "pointer" }, onclick: function () { RGP.challengeDetail(c); } },
              h("span.sev-dot." + (c.severity || "medium")),
              h("span.t-caption.accent.num", { style: { fontWeight: 600 } }, c.id),
              h("span.grow"),
              RGP.chStatePill(c.state));
          }));
      })());

    function priorHistory() {
      var prior = RGP.store.state.requests.filter(function (x) {
        return x.id !== r.id && x.createdById === r.createdById && x.state !== "draft";
      }).slice(0, 4);
      if (!prior.length) return null;
      return h("div.card.elev-1.card-pad-dense", null,
        h("div.t-footnote.mut.mbe-1", null, RGP.i18n.lang === "ar" ? "طلبات سابقة لمقدم الطلب" : "Applicant's prior requests"),
        prior.map(function (x) {
          return h("a.flex.g1.hairline-b", { href: "#/work/review/" + x.id, style: { padding: "6px 0", textDecoration: "none" } },
            h("span.t-caption.accent.num", { style: { fontWeight: 600 } }, x.id),
            h("span.grow"),
            UI.statePill(x.state, true));
        }));
    }

    /* ---- pane B: tabs (documents / details / log) ---- */
    var tabB = "docs";
    var paneB = h("div.ws-b");
    function renderB() {
      paneB.innerHTML = "";
      var seg = h("div.segmented.mbe-2", null,
        [["docs", t("req.documents")], ["details", t("req.formData")], ["log", t("req.timeline")]].map(function (x) {
          return h("button" + (tabB === x[0] ? ".active" : ""), {
            onclick: function () { tabB = x[0]; renderB(); }
          }, td(x[1]));
        }));
      var body;
      if (tabB === "docs") {
        body = h("div.card.elev-1", null,
          h("div.card-pad-dense.hairline-b.flex.g2", null,
            h("span.t-headline", null, t("work.checklist")),
            h("span.grow"),
            h("span.t-caption.mut.num", { style: { fontWeight: 500 } },
              r.documents.filter(function (d) { return d.verifyState === "verified"; }).length + " / " + r.documents.length)),
          r.documents.length ? r.documents.map(function (d) {
            var canVerify = RGP.auth.isStaff() && ["screening", "in_review", "resubmitted", "external_review", "decision_due"].indexOf(r.state) >= 0;
            return h("div.doc-row" + (d.verifyState === "verified" ? ".verified" : ""), null,
              h("span.d-icon", null, UI.icon("doc", 20)),
              h("div.grow", null,
                h("div.t-footnote", { style: { fontWeight: 600 } }, td(d.name)),
                d.fileName
                  ? h("div.t-caption.mut.num", { style: { fontWeight: 500 } }, d.fileName + " · " + RGP.fmtNum(d.sizeKB, { dec: 0 }) + " KB")
                  : h("div.t-caption.warn-fg", { style: { fontWeight: 600 } }, RGP.i18n.lang === "ar" ? "غير مرفق" : "Not attached"),
                d.verifyNote ? h("div.t-caption.danger-fg", { style: { fontWeight: 500 } }, d.verifyNote) : null),
              h("span.d-state", null,
                d.fileName && d.dataUrl ? h("button.btn.tertiary.sm", {
                  onclick: function () {
                    var w = window.open("about:blank");
                    if (w) w.document.write('<iframe src="' + d.dataUrl + '" style="border:0;width:100%;height:100%"></iframe>');
                  }
                }, UI.icon("eye", 14), t("common.view")) : null,
                canVerify && d.fileName ? h("button.btn." + (d.verifyState === "verified" ? "secondary" : "tertiary") + ".sm", {
                  onclick: function () { RGP.lifecycle.verifyDoc(r, d.key, "verified"); rerender(); }
                }, UI.icon("check", 14), t("work.verifyDoc")) : null,
                canVerify && d.fileName ? h("button.btn.destructive.sm", {
                  onclick: function () {
                    var note = h("input.input", { placeholder: RGP.i18n.lang === "ar" ? "سبب عدم المطابقة…" : "Reason…" });
                    UI.modal({
                      title: { ar: "عدم مطابقة المستند", en: "Mark not compliant" }, size: "sm",
                      body: h("div.field", null, note),
                      actions: function (close) {
                        return [h("button.btn.secondary", { onclick: close }, t("common.cancel")),
                          h("button.btn.destructive-solid", {
                            onclick: function () {
                              RGP.lifecycle.verifyDoc(r, d.key, "rejected", note.value || null);
                              close(); rerender();
                            }
                          }, t("work.flagDoc"))];
                      }
                    });
                  }
                }, UI.icon("x", 14), t("work.flagDoc")) : null));
          }) : h("div.card-pad.t-sub.mut", null, RGP.i18n.lang === "ar" ? "لا مستندات لهذه الخدمة" : "No documents for this service"));
      } else if (tabB === "details") {
        body = h("div.card.elev-1.card-pad", null,
          h("div.review-grid", null, (svc ? svc.formFields : []).map(function (f) {
            var v = r.formData[f.key];
            return h("div", null,
              h("div.rk", null, td(f.label)),
              h("div.rv", null, v == null || v === "" ? "—" : String(v)));
          })),
          r.note ? h("div.tl-quote.mbs-2", null, td(r.note)) : null,
          r.referrals.length ? h("div.mbs-3", null,
            h("div.t-headline.mbe-1", null, RGP.i18n.lang === "ar" ? "مرئيات الجهات الخارجية" : "External opinions"),
            r.referrals.map(function (ref) {
              return h("div.flex.g15.hairline-b", { style: { padding: "8px 0", alignItems: "flex-start" } },
                h("span.pill." + (ref.answeredAt ? (ref.opinion === "reject_recommend" ? "dang" : "ok") : "info"), null,
                  td(RGP.entityName(ref.entityId))),
                h("div.grow.t-sub", null,
                  ref.answeredAt
                    ? (ref.opinion === "approve_recommend" ? (RGP.i18n.lang === "ar" ? "لا مانع" : "No objection")
                      : ref.opinion === "reject_recommend" ? (RGP.i18n.lang === "ar" ? "توصية بالرفض" : "Recommend decline")
                      : (RGP.i18n.lang === "ar" ? "مطلوب معلومات إضافية" : "More info needed")) + (ref.note ? " — " + ref.note : "")
                    : (RGP.i18n.lang === "ar" ? "بانتظار الرد…" : "Awaiting response…")));
            })) : null);
      } else {
        body = h("div.card.elev-1.card-pad", null,
          h("div.timeline", null, r.timeline.slice().reverse().map(function (e) {
            var text = e.type === "state" ? (e.toState ? t("state." + e.toState) : "")
              : e.type === "decision" ? (e.toState === "approved" ? t("state.approved") : t("state.rejected"))
              : e.type === "referral" ? (RGP.i18n.lang === "ar" ? "إحالة خارجية" : "External referral")
              : e.type === "note" ? (RGP.i18n.lang === "ar" ? "ملاحظة داخلية" : "Internal note")
              : (RGP.i18n.lang === "ar" ? "إجراء" : "Action");
            return h("div.tl-item" + (e.type === "note" ? ".hollow" : "") + (e.toState === "rejected" || e.toState === "cancelled" ? ".danger" : e.toState === "returned" ? ".warn" : ""), null,
              h("span.tl-node"),
              h("div.tl-actor", null,
                h("span.t-footnote", { style: { fontWeight: 600 } }, td(RGP.store.userName(e.byId))),
                h("span.t-caption.mut", { style: { fontWeight: 500 } }, RGP.fmtAgo(e.at))),
              h("div.t-sub", null, text),
              e.textAr ? h("div.tl-quote", null, RGP.i18n.lang === "ar" ? e.textAr : (e.textEn || e.textAr)) : null,
              e.payload && e.payload.items ? h("div.tl-quote", null, e.payload.items.join("، ")) : null);
          })));
      }
      paneB.appendChild(seg);
      paneB.appendChild(body);
    }
    renderB();

    /* ---- pane C: decision panel ---- */
    var noteInput = h("textarea.input", { placeholder: t("work.addNote") + "…", style: { minHeight: "64px" } });
    var paneC = h("div.ws-c.flex-col.g2", null,
      h("div.card.elev-1.card-pad-dense", null,
        h("div.t-headline.mbe-2", null, RGP.i18n.lang === "ar" ? "الإجراءات" : "Actions"),
        h("div.flex-col.g1", null,
          has("start_screening") ? h("button.btn.primary.block", { onclick: function () { tryTransition("screening", {}, { ar: t("toast.claimed"), en: t("toast.claimed") }); } }, UI.icon("inbox", 16), t("work.claim")) : null,
          has("reopen_review") ? h("button.btn.primary.block", { onclick: function () { tryTransition("in_review", {}); } }, t("work.startReview")) : null,
          has("accept_review") ? h("button.btn.primary.block", { onclick: function () { tryTransition("in_review", {}); } }, UI.icon("eye", 16), t("work.startReview")) : null,
          has("refer_external") ? h("button.btn.secondary.block", { onclick: externalModal }, UI.icon("send", 16), t("work.sendExternal")) : null,
          has("mark_decision_due") ? h("button.btn.secondary.block", { onclick: function () { tryTransition("decision_due", {}); } }, UI.icon("flag", 16), t("work.markDecision")) : null,
          has("force_recall") ? h("button.btn.secondary.block", { onclick: function () { tryTransition("in_review", {}); } }, UI.icon("back", 16), RGP.i18n.lang === "ar" ? "سحب من الجهات الخارجية" : "Force recall") : null,
          has("approve") ? h("button.btn.primary.block", { onclick: approveModal }, UI.icon("checkCircle", 16), t("work.approve")) : null,
          has("return") ? h("button.btn.secondary.block", { onclick: returnModal }, UI.icon("back", 16), t("work.return")) : null,
          has("reject") ? h("button.btn.destructive.block", { onclick: rejectModal }, UI.icon("xCircle", 16), t("work.reject")) : null,
          has("reassign") ? h("button.btn.secondary.block", { onclick: reassignModal }, UI.icon("swap", 16), t("work.reassign")) : null,
          has("cancel_admin") ? h("button.btn.destructive.block", { onclick: adminCancelModal }, t("req.cancelReq")) : null,
          has("close") ? h("button.btn.secondary.block", { onclick: function () { tryTransition("closed", {}); } }, UI.icon("archive", 16), t("req.closeReq")) : null,
          !actions.length ? h("div.t-sub.mut", { style: { textAlign: "center", padding: "8px" } },
            RGP.i18n.lang === "ar" ? "لا إجراءات متاحة لك على هذا الطلب في حالته الحالية." : "No actions available to you in the current state.") : null)),
      RGP.auth.isStaff() ? h("div.card.elev-1.card-pad-dense", null,
        h("div.t-headline.mbe-1", null, t("work.internalNotes")),
        h("div.field", null, noteInput),
        h("button.btn.tertiary.sm", {
          onclick: function () {
            if (!noteInput.value.trim()) return;
            RGP.lifecycle.addNote(r, noteInput.value.trim());
            noteInput.value = "";
            UI.toast("ok", { ar: t("toast.saved"), en: t("toast.saved") });
            rerender();
          }
        }, UI.icon("note", 14), t("work.addNote"))) : null,
      r.decision ? h("div.card.elev-1.card-pad-dense", null,
        h("div.t-footnote.mut.mbe-1", null, t("req.decision")),
        r.decision.type === "approved"
          ? h("div", null,
              h("div.t-sub", null, t("req.documentNo") + ": ", h("b.num", null, r.decision.permitNo)),
              h("button.btn.secondary.sm.mbs-1", { onclick: function () { RGP.print.permit(r); } }, UI.icon("print", 14), t("req.printPermit")))
          : h("div.t-sub", null, r.decision.reason)) : null);

    /* ---- decision modals ---- */
    var feeBearing = !!(svc && svc.fees && svc.fees.model !== "none");
    function coSignRow(cb) {
      /* segregation of duties (rmun-notes §3): fee-bearing or fast-track decisions
         by the reviewing specialist require the section-head / GPO co-sign */
      if (u.role === "platform_manager" || (r.priority !== "fast_track" && !feeBearing)) return null;
      var label = r.priority === "fast_track"
        ? { ar: "تم الحصول على اعتماد مدير مكتب المشاريع الكبرى (توقيع مشترك لمسار الأولوية)", en: "GPO director co-sign obtained (required for fast-track decisions)" }
        : { ar: "تم الحصول على اعتماد رئيس القسم (فصل المهام للخدمات ذات المقابل المالي)", en: "Section-head co-sign obtained (segregation of duties for fee-bearing services)" };
      return h("label.checkbox-row.well.card-pad-dense", null, cb, h("span.t-sub", null, td(label)));
    }
    function approveModal() {
      var pendingDocs = r.documents.filter(function (d) { return d.verifyState !== "verified"; });
      var conditions = h("textarea.input", { placeholder: t("work.conditionsOpt") });
      var coSign = h("input", { type: "checkbox" });
      UI.modal({
        title: { ar: "اعتماد الطلب " + r.id, en: "Approve " + r.id },
        body: h("div", null,
          h("p.t-sub.mbe-2", null, RGP.i18n.lang === "ar"
            ? "سيتم إشعار ممثل المشروع فورًا ويصدر رقم وثيقة رسمي. لا يمكن التراجع عن الاعتماد إلا بقرار موثق."
            : "The representative is notified immediately and an official document number is issued. Approval can only be reversed by a documented decision."),
          pendingDocs.length ? h("div.error-summary", null,
            h("div.t-footnote.warn-fg", { style: { fontWeight: 600 } },
              (RGP.i18n.lang === "ar" ? "تنبيه: " : "Note: ") + pendingDocs.length +
              (RGP.i18n.lang === "ar" ? " مستند لم يكتمل التحقق منه" : " document(s) not yet verified"))) : null,
          h("div.field", null, h("label", null, t("work.conditionsOpt")), conditions),
          feeBearing ? h("p.t-caption.mut.mbe-1", { style: { fontWeight: 500 } },
            RGP.i18n.lang === "ar"
              ? "خدمة ذات مقابل مالي: تصدر فاتورة سداد مع القرار ويُسلَّم التصريح بعد إتمام السداد."
              : "Fee-bearing service: a SADAD invoice is issued with the decision; the permit is released after payment.") : null,
          coSignRow(coSign)),
        actions: function (close) {
          return [
            h("button.btn.secondary", { onclick: close }, t("common.cancel")),
            h("button.btn.primary", {
              onclick: function () {
                try {
                  RGP.lifecycle.transition(r, "approved", { conditions: conditions.value || null, coSign: coSign.checked });
                  close();
                  UI.toast("ok", { ar: t("toast.approved"), en: t("toast.approved") }, { ar: r.decision.permitNo, en: r.decision.permitNo });
                  rerender();
                } catch (e) {
                  if (String(e.message).indexOf("needCoSign") >= 0)
                    UI.toast("warn", { ar: "يتطلب هذا القرار توقيعًا مشتركًا — يرجى تأكيد الحصول عليه", en: "This decision requires a co-sign — confirm it first" });
                  else UI.toast("danger", { ar: "تعذر الاعتماد", en: "Couldn't approve" });
                }
              }
            }, t("work.approve"))
          ];
        }
      });
    }

    function returnModal() {
      if ((r.returnNotes || []).length >= 2) {
        UI.modal({
          title: { ar: "بلوغ الحد الأقصى لدورات الإعادة", en: "Return-cycle limit reached" },
          size: "sm",
          body: h("div.t-body", null, RGP.i18n.lang === "ar"
            ? "أعيد هذا الطلب لممثل المشروع مرتين، وهو الحد الأقصى المقرر. عند استمرار عدم الاكتمال يوصى برفض الطلب مع بيان الأسباب والسند النظامي، ويحق لممثل المشروع التقدم بطلب جديد."
            : "This request has been returned twice — the maximum allowed. If it remains incomplete, decline it with the reason and regulatory reference; the representative may file a new request."),
          actions: function (close) {
            return [h("button.btn.secondary", { onclick: close }, t("common.close")),
              h("button.btn.destructive", { onclick: function () { close(); rejectModal(); } }, t("work.reject"))];
          }
        });
        return;
      }
      var checks = [];
      var extraItems = [];
      var note = h("textarea.input", { placeholder: RGP.i18n.lang === "ar" ? "توضيح إضافي للعميل… (اختياري)" : "Extra context for the customer… (optional)" });
      var extraWrap = h("div");
      function addExtra() {
        var inp = h("input.input.sm", { placeholder: t("work.returnItemPh") });
        extraItems.push(inp);
        extraWrap.appendChild(h("div.field", null, inp));
      }
      var body = h("div", null,
        h("p.t-sub.mbe-2", null, t("work.returnNote")),
        h("div.t-footnote.mbe-1", { style: { fontWeight: 600 } }, t("req.missingItems"), h("span.req", { style: { color: "var(--danger)" } }, " *")),
        r.documents.map(function (d) {
          var cb = h("input", { type: "checkbox", checked: d.verifyState === "rejected" || d.verifyState === "missing" });
          checks.push({ cb: cb, label: td(d.name) });
          return h("label.checkbox-row.mbe-1", null, cb, h("span.t-sub", null, td(d.name)));
        }),
        extraWrap,
        h("button.btn.tertiary.sm.mbe-2", { onclick: addExtra }, UI.icon("plus", 14), t("work.addItem")),
        h("div.field", null, h("label", null, t("work.internalNotes")), note));
      UI.modal({
        title: { ar: "إعادة الطلب " + r.id + " للعميل", en: "Return " + r.id },
        body: body,
        actions: function (close) {
          return [
            h("button.btn.secondary", { onclick: close }, t("common.cancel")),
            h("button.btn.primary", {
              onclick: function () {
                var items = checks.filter(function (x) { return x.cb.checked; }).map(function (x) { return x.label; })
                  .concat(extraItems.map(function (i) { return i.value.trim(); }).filter(Boolean));
                if (!items.length) {
                  UI.toast("warn", { ar: "حدد بندًا واحدًا على الأقل", en: "Select at least one item" });
                  return;
                }
                try {
                  RGP.lifecycle.transition(r, "returned", { missingItems: items, note: note.value || null });
                  close();
                  UI.toast("ok", { ar: t("toast.returned"), en: t("toast.returned") });
                  rerender();
                } catch (e) { UI.toast("danger", { ar: "تعذرت الإعادة", en: "Couldn't return" }); }
              }
            }, t("work.return"))
          ];
        }
      });
    }

    function rejectModal() {
      var rejCoSign = h("input", { type: "checkbox" });
      var reason = h("textarea.input", { placeholder: t("work.reasonPh") });
      var counter = h("span.t-caption.mut.num", { style: { fontWeight: 500 } }, "0 / 30");
      reason.addEventListener("input", function () { counter.textContent = reason.value.trim().length + " / 30"; });
      var regSel = h("select.input", null,
        h("option", { value: "" }, RGP.i18n.lang === "ar" ? "اختر السند النظامي…" : "Choose regulation…"),
        RGP.store.state.settings.regulations.map(function (rg) {
          return h("option", { value: td(rg.label) }, td(rg.label));
        }));
      var regOther = h("input.input", { placeholder: t("work.regulationPh"), hidden: true });
      regSel.onchange = function () {
        regOther.hidden = regSel.value.indexOf("أخرى") < 0 && regSel.value.indexOf("Other") < 0;
      };
      UI.modal({
        title: { ar: "رفض الطلب " + r.id, en: "Decline " + r.id },
        body: h("div", null,
          h("p.t-sub.mbe-2", null, t("work.rejectNote")),
          h("div.field", null,
            h("label", null, RGP.i18n.lang === "ar" ? "سبب الرفض" : "Reason", h("span.req", null, "*"), h("span.opt", null, counter)),
            reason),
          h("div.field", null,
            h("label", null, t("req.regulationRef"), h("span.req", null, "*")),
            h("div.select-wrap", null, regSel), regOther),
          coSignRow(rejCoSign)),
        actions: function (close) {
          return [
            h("button.btn.secondary", { onclick: close }, t("common.cancel")),
            h("button.btn.destructive-solid", {
              onclick: function () {
                var reg = regOther.hidden ? regSel.value : (regOther.value.trim() || regSel.value);
                if (reason.value.trim().length < 30) {
                  UI.toast("warn", { ar: "سبب الرفض يجب ألا يقل عن 30 حرفًا", en: "Reason must be at least 30 characters" });
                  return;
                }
                if (!reg) { UI.toast("warn", { ar: "حدد السند النظامي", en: "Choose the regulation" }); return; }
                try {
                  RGP.lifecycle.transition(r, "rejected", { reason: reason.value.trim(), regulationRef: reg, coSign: rejCoSign.checked });
                  close();
                  UI.toast("ok", { ar: t("toast.rejected"), en: t("toast.rejected") });
                  rerender();
                } catch (e) {
                  if (String(e.message).indexOf("needCoSign") >= 0)
                    UI.toast("warn", { ar: "يتطلب هذا القرار توقيعًا مشتركًا — يرجى تأكيد الحصول عليه", en: "This decision requires a co-sign — confirm it first" });
                  else UI.toast("danger", { ar: "تعذر الرفض", en: "Couldn't decline" });
                }
              }
            }, t("work.reject"))
          ];
        }
      });
    }

    function externalModal() {
      var checks = [];
      UI.modal({
        title: t("work.externalTitle"),
        body: h("div", null,
          h("p.t-sub.mbe-2", null, t("work.externalNote")),
          RGP.store.state.settings.entities.filter(function (e) { return e.type === "external"; }).map(function (e) {
            var pre = (r.involvedEntities || []).indexOf(e.id) >= 0;
            var cb = h("input", { type: "checkbox", checked: pre });
            checks.push({ cb: cb, id: e.id });
            return h("label.checkbox-row.mbe-1", null, cb, h("span.t-sub", null, td(e.name)));
          })),
        actions: function (close) {
          return [
            h("button.btn.secondary", { onclick: close }, t("common.cancel")),
            h("button.btn.primary", {
              onclick: function () {
                var ids = checks.filter(function (x) { return x.cb.checked; }).map(function (x) { return x.id; });
                if (!ids.length) { UI.toast("warn", { ar: "اختر جهة واحدة على الأقل", en: "Choose at least one entity" }); return; }
                try {
                  RGP.lifecycle.transition(r, "external_review", { entityIds: ids });
                  close(); rerender();
                } catch (e) { UI.toast("danger", { ar: "تعذرت الإحالة", en: "Couldn't refer" }); }
              }
            }, t("work.sendExternal"))
          ];
        }
      });
    }

    function reassignModal() {
      var specs = RGP.store.usersByRole("amanah_specialist");
      var sel = h("select.input", null, specs.map(function (s) {
        return h("option", { value: s.id, selected: r.assigneeId === s.id }, td(s.name));
      }));
      UI.modal({
        title: t("work.reassign"), size: "sm",
        body: h("div.field", null, h("label", null, t("req.assignee")), h("div.select-wrap", null, sel)),
        actions: function (close) {
          return [h("button.btn.secondary", { onclick: close }, t("common.cancel")),
            h("button.btn.primary", {
              onclick: function () { RGP.lifecycle.reassign(r, sel.value); close(); rerender(); }
            }, t("common.save"))];
        }
      });
    }

    function adminCancelModal() {
      var reason = h("input.input", { placeholder: RGP.i18n.lang === "ar" ? "سبب الإلغاء…" : "Reason…" });
      UI.modal({
        title: { ar: "إلغاء الطلب " + r.id, en: "Cancel " + r.id }, size: "sm",
        body: h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "السبب" : "Reason", h("span.req", null, "*")), reason),
        actions: function (close) {
          return [h("button.btn.secondary", { onclick: close }, t("common.cancel")),
            h("button.btn.destructive-solid", {
              onclick: function () {
                if (!reason.value.trim()) { UI.toast("warn", { ar: "أدخل السبب", en: "Enter a reason" }); return; }
                try { RGP.lifecycle.transition(r, "cancelled", { reason: reason.value }); close(); rerender(); }
                catch (e) { UI.toast("danger", { ar: "تعذر الإلغاء", en: "Couldn't cancel" }); }
              }
            }, t("req.cancelReq"))];
        }
      });
    }

    var head = h("div.page-head", null,
      h("div.crumbs", null,
        h("a", { href: "#/work/queue" }, t("work.queue")),
        h("span", null, "‹"), h("span.num", null, r.id)),
      h("h1.t-title2", null,
        RGP.i18n.lang === "ar" ? "مراجعة الطلب" : "Request review"));

    return RGP.shell(h("div", null, head, h("div.ws.mbs-2", null, paneA, paneB, paneC)),
      { context: { ar: "مساحة عمل الأخصائي", en: "Specialist workspace" } });
  }

  RGP.router.register("#/work/queue", ["amanah_specialist", "platform_manager"], queue);
  RGP.router.register("#/work/review/:id", ["amanah_specialist", "platform_manager"], review);
  RGP.router.register("#/challenges", ["amanah_specialist"], function () {
    var head = h("div.page-head", null, h("h1.t-title1", null, t("ch.title")),
      h("div.actions", null, h("button.btn.primary", { onclick: function () { RGP.challengeForm(); } }, UI.icon("plus", 18), t("ch.new"))));
    var list = h("div.grid.cols-2.mbs-2", null, RGP.store.state.challenges.map(function (c) { return RGP.challengeCard(c); }));
    return RGP.shell(h("div", null, head, list), { context: t("ch.title") });
  });
})();
