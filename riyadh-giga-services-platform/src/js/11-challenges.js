/* ============================================================
   Challenges module — shared card, create form, lifecycle
   actions, detail modal. it-spec §4.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;

  var CH_STATES = ["open", "in_progress", "escalated", "resolved", "closed"];
  RGP.CH_STATES = CH_STATES;

  function chStatePill(state) {
    var map = { open: "warn", in_progress: "info", escalated: "dang", resolved: "ok", closed: "plain" };
    return h("span.pill." + map[state], null, h("span.dot"), t("ch." + state));
  }
  RGP.chStatePill = chStatePill;

  RGP.challengeAge = function (c) {
    var end = c.resolvedAt || c.closedAt || null;
    return RGP.workingDaysBetween(c.openedAt.slice(0, 10), (end || RGP.nowISO()).slice(0, 10));
  };

  RGP.challengeCard = function (c, compact) {
    var proj = c.projectId && RGP.store.project(c.projectId);
    return h("div.kb-card", { onclick: function () { RGP.challengeDetail(c); } },
      h("div.flex.g1.mbe-1", null,
        h("span.sev-dot." + (c.severity || "medium")),
        h("span.t-caption.mut.num", { style: { fontWeight: 600 } }, c.id),
        h("span.grow"),
        chStatePill(c.state)),
      h("div.t-sub", { style: { fontWeight: 600, lineHeight: 1.55 } }, td(c.title)),
      h("div.flex.g15.wrap.mbs-1", null,
        proj ? h("span.t-caption.mut", { style: { fontWeight: 500 } }, td(proj.name)) : null,
        c.responsibleEntity ? h("span.pill.plain.sm", null, td(RGP.entityName(c.responsibleEntity))) : null,
        h("span.t-caption.mut.num.flex.g05", { style: { fontWeight: 500 } }, UI.icon("clock", 11),
          RGP.challengeAge(c) + " " + t("common.workdays")),
        c.requestId ? h("span.t-caption.accent.num", { style: { fontWeight: 600 } }, c.requestId) : null));
  };

  RGP.challengeDetail = function (c) {
    var u = RGP.auth.current();
    var proj = c.projectId && RGP.store.project(c.projectId);
    var isStaff = u.role === "platform_manager" || u.role === "amanah_specialist";
    var canResolve = isStaff || (u.role === "external_entity" && u.entityId === c.responsibleEntity);

    function action(label, kind, fn) {
      return h("button.btn." + kind + ".sm", { onclick: fn }, td(label));
    }

    var actions = [];
    if (c.state === "open" && canResolve) {
      actions.push(action({ ar: "بدء المعالجة", en: "Start" }, "primary", function () {
        c.state = "in_progress"; c.startedAt = RGP.nowISO();
        RGP.store.audit("challenge.updated", "challenge", c.id, { to: "in_progress" });
        RGP.store.save(); close(); RGP.router.render();
      }));
    }
    if (["in_progress", "escalated"].indexOf(c.state) >= 0 && canResolve) {
      actions.push(action({ ar: "تسجيل المعالجة", en: "Resolve" }, "primary", function () {
        close(); resolveForm(c);
      }));
    }
    if (c.state === "in_progress" && u.role === "platform_manager") {
      actions.push(action({ ar: "تصعيد", en: "Escalate" }, "destructive", function () {
        c.state = "escalated"; c.escalatedAt = RGP.nowISO();
        RGP.store.audit("challenge.escalated", "challenge", c.id);
        RGP.store.save(); close(); RGP.router.render();
      }));
    }
    if (c.state === "resolved" && u.role === "platform_manager") {
      actions.push(action({ ar: "إغلاق التحدي", en: "Close" }, "secondary", function () {
        c.state = "closed"; c.closedAt = RGP.nowISO();
        RGP.store.audit("challenge.closed", "challenge", c.id);
        RGP.store.notify([c.openedById], {
          kind: "success",
          title: { ar: "أُغلق التحدي " + c.id, en: "Challenge " + c.id + " closed" },
          body: c.title, link: "#/portal/challenges"
        });
        RGP.store.save(); close(); RGP.router.render();
      }));
    }

    var modal = UI.modal({
      title: c.title, size: "lg",
      body: h("div", null,
        h("div.flex.g15.wrap.mbe-2", null,
          chStatePill(c.state),
          h("span.pill.plain", null, td(RGP.challengeCatLabel(c.category))),
          h("span.pill." + (c.severity === "critical" || c.severity === "high" ? "dang" : c.severity === "medium" ? "warn" : "plain"), null,
            t("ch.impact") + ": " + t("ch.impact." + (c.severity === "critical" ? "high" : c.severity))),
          h("span.t-caption.mut.num", { style: { fontWeight: 600 } }, c.id)),
        h("p.t-body.mbe-2", null, td(c.description)),
        h("div.review-grid.mbe-2", null,
          kv(t("req.project"), proj ? td(proj.name) : "—"),
          kv(t("ch.owner"), c.responsibleEntity ? td(RGP.entityName(c.responsibleEntity)) : "—"),
          kv({ ar: "فتح بواسطة", en: "Opened by" }, td(RGP.store.userName(c.openedById))),
          kv({ ar: "تاريخ الفتح", en: "Opened" }, h("span.num", null, RGP.fmtDate(c.openedAt.slice(0, 10)))),
          kv(t("ch.resolutionDays"), h("span.num", null, RGP.challengeAge(c) + " "), t("common.workdays")),
          kv(t("ch.linkedRequest"), c.requestId ? h("a.num", { href: "#/portal/requests/" + c.requestId, onclick: function () { modal.close(); } }, c.requestId) : "—")),
        (c.proposedSolutions || []).length ? h("div.mbe-2", null,
          h("div.t-headline.mbe-1", null, t("ch.resolution")),
          c.proposedSolutions.map(function (s) {
            return h("div.tl-quote.mbe-1", null, td(s.text),
              s.chosen ? h("span.pill.ok.sm", { style: { marginInlineStart: "8px" } }, UI.icon("check", 10), RGP.i18n.lang === "ar" ? "معتمد" : "Chosen") : null);
          })) : null,
        c.resolution ? h("div.well.card-pad-dense", null,
          h("div.t-footnote.ok-fg.mbe-1", { style: { fontWeight: 600 } }, RGP.i18n.lang === "ar" ? "المعالجة النهائية" : "Final resolution"),
          h("div.t-sub", null, td(c.resolution.text)),
          h("div.t-caption.mut.mbs-1.num", { style: { fontWeight: 500 } }, RGP.fmtDate(c.resolution.resolvedAt.slice(0, 10)))) : null),
      actions: function (closeFn) {
        closeRef = closeFn;
        return [h("span.grow")].concat(actions.length ? actions : [h("button.btn.secondary", { onclick: closeFn }, t("common.close"))]);
      }
    });
    var closeRef = null;
    function close() { if (closeRef) closeRef(); }

    function kv(k, v, extra) {
      return h("div", null, h("div.rk", null, td(k)), h("div.rv", null, v, extra || null));
    }
  };

  function resolveForm(c) {
    var text = h("textarea.input", { placeholder: RGP.i18n.lang === "ar" ? "وصف المعالجة المنفذة…" : "Describe the resolution…" });
    UI.modal({
      title: { ar: "تسجيل معالجة التحدي " + c.id, en: "Resolve " + c.id },
      body: h("div", null,
        h("p.t-sub.mut.mbe-2", null, RGP.i18n.lang === "ar"
          ? "تُعرض المعالجة على مكتب المشاريع الكبرى لاعتماد الإغلاق، ويُشعر صاحب التحدي."
          : "The resolution goes to the GPO for closure approval; the opener is notified."),
        h("div.field", null, h("label", null, t("ch.resolution"), h("span.req", null, "*")), text)),
      actions: function (close) {
        return [
          h("button.btn.secondary", { onclick: close }, t("common.cancel")),
          h("button.btn.primary", {
            onclick: function () {
              if (!text.value.trim()) { UI.toast("warn", { ar: "أدخل وصف المعالجة", en: "Enter the resolution" }); return; }
              c.state = "resolved";
              c.resolvedAt = RGP.nowISO();
              c.resolution = { text: { ar: text.value, en: text.value }, byId: RGP.auth.current().id, resolvedAt: RGP.nowISO() };
              RGP.store.audit("challenge.resolved", "challenge", c.id);
              RGP.store.notify(RGP.store.managerIds().concat([c.openedById]), {
                kind: "success",
                title: { ar: "تمت معالجة التحدي " + c.id, en: "Challenge " + c.id + " resolved" },
                body: c.title, link: "#/manager/challenges"
              });
              RGP.store.save(); close(); RGP.router.render();
              UI.toast("ok", { ar: "سُجلت المعالجة", en: "Resolution recorded" });
            }
          }, t("common.save"))
        ];
      }
    });
  }

  RGP.challengeForm = function (presetProjectId) {
    var u = RGP.auth.current();
    var S = RGP.store.state;
    var title = h("input.input", { placeholder: RGP.i18n.lang === "ar" ? "عنوان موجز للتحدي…" : "Short challenge title…" });
    var desc = h("textarea.input", { placeholder: RGP.i18n.lang === "ar" ? "الوصف والأثر على المشروع…" : "Description and project impact…" });
    var proj = h("select.input", null,
      h("option", { value: "" }, RGP.i18n.lang === "ar" ? "اختر المشروع…" : "Choose project…"),
      S.projects.filter(function (p) {
        return u.role !== "project_rep" || (u.projectIds || []).indexOf(p.id) >= 0;
      }).map(function (p) {
        return h("option", { value: p.id, selected: presetProjectId === p.id }, td(p.name));
      }));
    var cat = h("select.input", null, (S.challengeCategories || []).map(function (c) {
      return h("option", { value: c.id }, td(c.name));
    }));
    var sev = h("select.input", null,
      [["medium", t("ch.impact.medium")], ["low", t("ch.impact.low")], ["high", t("ch.impact.high")], ["critical", RGP.i18n.lang === "ar" ? "حرج" : "Critical"]]
        .map(function (x) { return h("option", { value: x[0] }, x[1]); }));
    var owner = h("select.input", null,
      h("option", { value: "" }, RGP.i18n.lang === "ar" ? "تُحدد لاحقًا من مكتب المشاريع" : "Assigned later by the GPO"),
      S.settings.entities.map(function (e) { return h("option", { value: e.id }, td(e.name)); }));
    var sol = h("textarea.input", { placeholder: RGP.i18n.lang === "ar" ? "حل مقترح (اختياري)…" : "Proposed solution (optional)…" });

    UI.modal({
      title: t("ch.new"),
      body: h("div", null,
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "العنوان" : "Title", h("span.req", null, "*")), title),
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "الوصف" : "Description", h("span.req", null, "*")), desc),
        h("div.grid.cols-2", null,
          h("div.field", null, h("label", null, t("req.project"), h("span.req", null, "*")), h("div.select-wrap", null, proj)),
          h("div.field", null, h("label", null, t("ch.category")), h("div.select-wrap", null, cat)),
          h("div.field", null, h("label", null, t("ch.impact")), h("div.select-wrap", null, sev)),
          h("div.field", null, h("label", null, t("ch.owner")), h("div.select-wrap", null, owner))),
        h("div.field", null, h("label", null, t("ch.resolution")), sol)),
      actions: function (close) {
        return [
          h("button.btn.secondary", { onclick: close }, t("common.cancel")),
          h("button.btn.primary", {
            onclick: function () {
              if (!title.value.trim() || !desc.value.trim() || !proj.value) {
                UI.toast("warn", { ar: "أكمل الحقول الإلزامية", en: "Complete the required fields" });
                return;
              }
              var c = {
                id: RGP.store.nextChallengeId(),
                projectId: proj.value, requestId: null,
                title: { ar: title.value, en: title.value },
                description: { ar: desc.value, en: desc.value },
                category: cat.value, severity: sev.value,
                state: "open",
                responsibleEntity: owner.value || null,
                proposedSolutions: sol.value.trim() ? [{ id: RGP.uid("sol"), text: { ar: sol.value, en: sol.value }, byId: u.id, at: RGP.nowISO(), chosen: false }] : [],
                resolution: null, slaTargetDays: 10,
                openedById: u.id, openedAt: RGP.nowISO(),
                startedAt: null, escalatedAt: null, resolvedAt: null, closedAt: null,
                reopenCount: 0, timeline: []
              };
              S.challenges.unshift(c);
              RGP.store.audit("challenge.opened", "challenge", c.id);
              RGP.store.notify(RGP.store.managerIds(), {
                kind: "warning",
                title: { ar: "تحدٍّ جديد: " + c.id, en: "New challenge: " + c.id },
                body: c.title, link: "#/manager/challenges"
              });
              RGP.store.save(); close();
              UI.toast("ok", { ar: t("toast.challengeLogged"), en: t("toast.challengeLogged") });
              RGP.router.render();
            }
          }, t("ch.new"))
        ];
      }
    });
  };
})();
