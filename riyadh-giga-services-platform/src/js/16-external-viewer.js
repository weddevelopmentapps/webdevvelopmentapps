/* ============================================================
   External-entity referrals inbox (simulated integration
   channel) + executive viewer (مكتب الأمين). it-spec §7.6-7.7.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;

  /* ---------------- external entity ---------------- */
  function external() {
    var u = RGP.auth.current();
    var S = RGP.store.state;
    var mine = S.requests.filter(function (r) {
      return (r.referrals || []).some(function (ref) { return ref.entityId === u.entityId; });
    });
    var pending = mine.filter(function (r) {
      return r.state === "external_review" &&
        r.referrals.some(function (ref) { return ref.entityId === u.entityId && !ref.answeredAt; });
    });
    var answered = mine.filter(function (r) { return pending.indexOf(r) < 0; });

    function respondModal(r) {
      var svc = RGP.store.service(r.serviceId);
      var opinion = null;
      var note = h("textarea.input", { placeholder: t("ext.remarks") + "…" });
      var opts = [
        ["approve_recommend", t("ext.clear"), "ok"],
        ["info_needed", { ar: "مطلوب معلومات إضافية", en: "More info needed" }, "warn"],
        ["reject_recommend", { ar: "توصية بعدم الموافقة", en: "Recommend decline" }, "dang"]
      ];
      var optWrap = h("div.flex-col.g1.mbe-2", null, opts.map(function (o) {
        return h("button.pick-card", {
          onclick: function (e) {
            opinion = o[0];
            RGP.$$(".pick-card", optWrap).forEach(function (c) { c.classList.remove("selected"); });
            e.currentTarget.classList.add("selected");
          }
        },
          h("span.pc-radio"),
          h("span.pill." + o[2], null, td(o[1])));
      }));
      UI.modal({
        title: { ar: "مرئيات " + td(u.org) + " — " + r.id, en: td(u.org) + " opinion — " + r.id },
        body: h("div", null,
          h("div.well.card-pad-dense.mbe-2", null,
            h("div.t-headline", null, svc ? td(svc.name) : ""),
            h("div.t-caption.mut", { style: { fontWeight: 500 } },
              (r.projectId && RGP.store.project(r.projectId) ? td(RGP.store.project(r.projectId).name) + " · " : "") + td(r.personaSnapshot.org))),
          optWrap,
          h("div.field", null, h("label", null, t("ext.remarks")), note)),
        actions: function (close) {
          return [
            h("button.btn.secondary", { onclick: close }, t("common.cancel")),
            h("button.btn.primary", {
              onclick: function () {
                if (!opinion) { UI.toast("warn", { ar: "اختر الرأي أولًا", en: "Choose an opinion" }); return; }
                try {
                  RGP.lifecycle.recordOpinion(r, u.entityId, opinion, note.value || null);
                  close();
                  UI.toast("ok", { ar: "سُجلت المرئيات وأُشعر الأخصائي", en: "Opinion recorded — specialist notified" });
                  RGP.router.render();
                } catch (e) { UI.toast("danger", { ar: "تعذر التسجيل", en: "Couldn't record" }); }
              }
            }, t("ext.respond"))
          ];
        }
      });
    }

    function row(r, done) {
      var svc = RGP.store.service(r.serviceId);
      var proj = r.projectId && RGP.store.project(r.projectId);
      var myRef = r.referrals.filter(function (x) { return x.entityId === u.entityId; })[0];
      return h("div.card.elev-1.card-pad-dense.flex.g2.mbe-2", { style: { flexWrap: "wrap" } },
        h("div.grow", null,
          h("div.flex.g1.wrap.mbe-1", null,
            h("span.id-cell.num", null, r.id),
            r.priority === "fast_track" ? UI.gigaBadge() : null,
            UI.statePill(r.state, true)),
          h("div.t-headline", null, svc ? td(svc.name) : ""),
          h("div.t-caption.mut", { style: { fontWeight: 500 } },
            (proj ? td(proj.name) + " · " : "") +
            (RGP.i18n.lang === "ar" ? "وردت " : "Received ") + RGP.fmtAgo(myRef.sentAt)),
          h("div.t-caption.mut.num", { style: { fontWeight: 500 } },
            (RGP.i18n.lang === "ar" ? "مرجع التنسيق: " : "Coordination ref: ") + "GPO-" + r.id)),
        done
          ? h("div.flex.g1", null,
              h("span.pill." + (myRef.opinion === "reject_recommend" ? "dang" : myRef.opinion === "info_needed" ? "warn" : "ok"), null,
                UI.icon("check", 12), t("ext.responded")),
              myRef.note ? h("span.t-caption.mut.ellipsis", { style: { maxWidth: "220px", fontWeight: 500 } }, myRef.note) : null)
          : h("button.btn.primary", { onclick: function () { respondModal(r); } }, t("ext.respond")));
    }

    var head = h("div.page-head", null,
      h("div.kicker", null, td(u.org)),
      h("h1.t-title1", null, t("ext.inbox")),
      h("div.flex.g1.mbs-1", null, UI.simBadge(), h("span.t-caption.mut", { style: { fontWeight: 500 } }, t("ext.simNote"))));

    var body = h("div.mbs-3", null,
      h("h2.t-title3.mbe-2", null, RGP.i18n.lang === "ar" ? "بانتظار مرئياتكم" : "Awaiting your opinion",
        " ", h("span.pill.warn.sm.num", null, String(pending.length))),
      pending.length ? pending.map(function (r) { return row(r, false); })
        : UI.empty("checkCircle", { ar: "لا توجد إحالات معلقة", en: "No pending referrals" },
          null, null, true),
      answered.length ? h("div.mbs-4", null,
        h("h2.t-title3.mbe-2", null, RGP.i18n.lang === "ar" ? "إحالات سابقة" : "Previous referrals"),
        answered.map(function (r) { return row(r, true); })) : null);

    return RGP.shell(h("div", null, head, body), { context: t("ext.inbox"), narrow: true });
  }

  /* ---------------- executive viewer ---------------- */
  function executive() {
    var S = RGP.store.state;
    var k = RGP.kpi.compute();
    var trend = RGP.kpi.weeklyTrend();

    var head = h("div.page-head", null,
      h("div.kicker", null, t("brand.owner")),
      h("h1.t-title1", null, t("exec.title")),
      h("p.desc.t-sub", null, t("exec.sub")));

    var band = h("div.kpi-band.six.mbs-3", null,
      UI.kpi({ label: t("kpi.enabledProjects"), value: k.enabledProjects }),
      UI.kpi({ label: t("kpi.avgProcessing"), value: k.avgProcessing, dec: 1, unit: t("kpi.workdaysUnit") }),
      UI.kpi({ label: t("kpi.slaCompliance"), value: k.onTimePct, suffix: "%" }),
      UI.kpi({ label: t("kpi.challengeClosure"), value: k.challengeClosure, suffix: "%" }),
      UI.kpi({ label: t("kpi.satisfaction"), value: k.satisfaction, dec: 1, unit: "/5" }),
      UI.kpi({ label: t("kpi.openRequests"), value: k.openRequests }));

    var trendBox = h("div.chart-box");
    var highlights = h("div.card.elev-1.card-pad", null,
      h("div.t-headline.mbe-2", null, RGP.i18n.lang === "ar" ? "أبرز مستجدات الأسبوع" : "Weekly highlights"),
      h("ul", null, buildHighlights().map(function (x) {
        return h("li.flex.g1.t-sub", { style: { padding: "6px 0", alignItems: "flex-start" } },
          h("span." + x.cls, { style: { marginTop: "3px" } }, UI.icon(x.icon, 15)), x.text);
      })));

    function buildHighlights() {
      var out = [];
      var red = S.requests.filter(function (r) { return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0 && RGP.lifecycle.slaBand(r) === "red"; });
      var esc = S.challenges.filter(function (c) { return c.state === "escalated"; });
      var approvedWeek = S.requests.filter(function (r) {
        return r.decision && r.decision.type === "approved" && RGP.daysBetween(r.decision.decidedAt.slice(0, 10), RGP.todayISO()) <= 7;
      });
      out.push({
        icon: "checkCircle", cls: "ok-fg",
        text: RGP.i18n.lang === "ar"
          ? RGP.fmtNum(approvedWeek.length, { dec: 0 }) + " وثيقة اعتماد صدرت للمشاريع الكبرى خلال الأسبوع الأخير."
          : approvedWeek.length + " approval documents issued for giga projects in the last week."
      });
      if (red.length) out.push({
        icon: "alert", cls: "danger-fg",
        text: RGP.i18n.lang === "ar"
          ? RGP.fmtNum(red.length, { dec: 0 }) + " طلبات بلغت أو تجاوزت مددها المحددة وجرى تصعيدها إلى مكتب المشاريع الكبرى."
          : red.length + " requests reached or exceeded their SLA and are escalated to the GPO."
      });
      if (esc.length) out.push({
        icon: "flag", cls: "warn-fg",
        text: RGP.i18n.lang === "ar"
          ? "تحديات مصعّدة تتطلب قرارًا تنسيقيًا: " + esc.map(function (c) { return td(c.title); }).join("؛ ")
          : "Escalated challenges needing a coordination decision: " + esc.map(function (c) { return td(c.title); }).join("; ")
      });
      out.push({
        icon: "chart", cls: "accent",
        text: RGP.i18n.lang === "ar"
          ? "بلغت نسبة الالتزام بالمواعيد " + k.onTimePct + "% وبلغ متوسط زمن المعالجة " + k.avgProcessing + " يوم عمل."
          : "On-time performance at " + k.onTimePct + "% with average processing of " + k.avgProcessing + " working days."
      });
      return out;
    }

    var mapCard = RGP.map.render({ projects: S.projects, showLabels: true });

    band.classList.add("exec-band");
    RGP.$$(".kpi", band).forEach(function (tile) {
      tile.classList.add("exec-tile");
      tile.appendChild(UI.saduMark("ink"));
    });
    var impactBand = RGP.impact && RGP.impact.band ? RGP.impact.band("executive") : null;
    var root = RGP.shell(h("div", null, head, impactBand, band,
      h("div.grid.cols-21.mbs-2", null,
        h("div.chart-card.elev-1", null,
          h("div.ch-head", null, h("span.t-headline", null, t("gpo.trend"))), trendBox),
        highlights),
      h("div.mbs-2", null,
        h("div.t-headline.mbe-1", null, t("gpo.map")), mapCard)),
      { context: t("exec.title"), chromeMinimal: true });

    requestAnimationFrame(function () {
      RGP.charts.area(trendBox, trend.labels, [
        { name: RGP.i18n.lang === "ar" ? "المقدمة" : "Submitted", data: trend.submitted },
        { name: RGP.i18n.lang === "ar" ? "المنجزة" : "Decided", data: trend.decided }
      ]);
    });
    return root;
  }

  RGP.router.register("#/external", ["external_entity"], external);
  RGP.router.register("#/executive", ["viewer"], executive);
})();
