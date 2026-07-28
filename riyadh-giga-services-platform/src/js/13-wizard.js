/* ============================================================
   New-request wizard — 5 steps: ① project & phase ② service
   ③ smart form ④ documents ⑤ review & submit.
   it-spec §7.3 · ux-spec §7.4. Draft persists at every step.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;

  function wizard() {
    var u = RGP.auth.current();
    var qs = (location.hash.split("?")[1] || "");
    var preService = (qs.match(/service=([^&]+)/) || [])[1] || null;
    var draftId = (qs.match(/draft=([^&]+)/) || [])[1] || null;

    var draft = draftId ? RGP.store.request(draftId) : null;

    var state = {
      step: 1, back: false,
      projectId: draft ? draft.projectId : (u.projectIds && u.projectIds[0]) || null,
      phase: null,
      serviceId: draft ? draft.serviceId : preService,
      formData: draft ? RGP.deepClone(draft.formData) : {},
      docs: {},           /* key → {fileName, sizeKB, mime, dataUrl} */
      prereqOk: false,
      declared: false,
      submitted: null
    };
    if (preService) {
      var pre = RGP.store.service(preService);
      if (pre) { state.phase = pre.phase; state.step = state.projectId || !myProjects().length ? 2 : 1; }
    }
    if (draft) {
      var dsvc = RGP.store.service(draft.serviceId);
      if (dsvc) state.phase = dsvc.phase;
      draft.documents.forEach(function (d) {
        if (d.fileName) state.docs[d.key] = { fileName: d.fileName, sizeKB: d.sizeKB, mime: d.mime, dataUrl: d.dataUrl };
      });
      state.step = 3;
    }

    function myProjects() {
      return RGP.store.state.projects.filter(function (p) { return (u.projectIds || []).indexOf(p.id) >= 0; });
    }
    function availableServices() {
      return RGP.store.state.services.filter(function (s) {
        if (state.phase && s.phase !== state.phase) return false;
        if (u.allowedServiceIds && u.allowedServiceIds.indexOf(s.id) < 0) return false;
        if (u.personaType && s.personas && s.personas.length && s.personas.indexOf(u.personaType) < 0
            && !(u.delegatedBy && s.personas.indexOf("engineering_office") >= 0)) return false;
        return true;
      });
    }
    function svc() { return state.serviceId ? RGP.store.service(state.serviceId) : null; }
    function isFastTrack() {
      var p = state.projectId && RGP.store.project(state.projectId);
      var s = svc();
      return !!((p && p.isGiga) || (s && s.gigaFastTrack && u.personaType === "giga_entity"));
    }
    function slaDays() {
      var s = svc(); if (!s) return null;
      return isFastTrack() ? Math.max(1, Math.ceil(s.slaDays * 0.5)) : s.slaDays;
    }

    var formEngine = null;
    var container = h("div");

    function saveDraft(silent) {
      var payload = {
        projectId: state.projectId,
        serviceId: state.serviceId,
        formData: formEngine ? formEngine.values() : state.formData,
        documents: buildDocs()
      };
      if (draft) {
        draft.projectId = payload.projectId;
        draft.formData = payload.formData;
        draft.documents = payload.documents;
        draft.updatedAt = RGP.nowISO();
        RGP.store.save();
      } else {
        draft = RGP.lifecycle.createDraft(payload);
      }
      if (!silent) UI.toast("ok", { ar: t("toast.draftSaved"), en: t("toast.draftSaved") });
      return draft;
    }

    function buildDocs() {
      var s = svc(); if (!s) return [];
      return (s.requiredDocuments || []).map(function (d, i) {
        var key = "doc-" + i;
        var up = state.docs[key];
        return {
          key: key, name: d.name,
          fileName: up ? up.fileName : null,
          sizeKB: up ? up.sizeKB : 0,
          mime: up ? up.mime : "",
          dataUrl: up && up.dataUrl ? up.dataUrl : null,
          uploadedAt: up ? RGP.nowISO() : null,
          verifyState: up ? "pending" : "missing",
          verifyNote: null
        };
      });
    }

    function go(n, back) {
      state.back = !!back;
      state.step = n;
      render();
      window.scrollTo(0, 0);
    }

    /* ---------------- steps ---------------- */
    function step1() {
      var projects = myProjects();
      return h("div.card-lg.elev-1.card-pad", null,
        h("h2.t-title3.mbe-1", null, t("wizard.chooseProject")),
        h("p.t-sub.mut.mbe-3", null, RGP.i18n.lang === "ar"
          ? "يرتبط الطلب بمشروع مسجل في سجل المشاريع الكبرى. الطلبات المرتبطة بمشروع كبير تدخل مسار الأولوية تلقائيًا."
          : "Requests link to a registered project. Giga-project requests enter the priority lane automatically."),
        projects.length ? h("div.flex-col.g15.mbe-3", null, projects.map(function (p) {
          return h("button.pick-card" + (state.projectId === p.id ? ".selected" : ""), {
            onclick: function () { state.projectId = p.id; render(); }
          },
            h("span.pc-radio"),
            h("span.avatar.lg", { style: { background: "var(--green-800)", color: "#fff" } }, p.monogram || "PR"),
            h("div.grow", null,
              h("div.t-headline", null, td(p.name)),
              h("div.t-caption.mut", { style: { fontWeight: 500 } }, td(p.owner) + " · " + td(RGP.projectPhaseLabel(p.phase)))),
            p.isGiga ? UI.gigaBadge() : null);
        }),
          h("button.pick-card" + (state.projectId === null ? ".selected" : ""), {
            onclick: function () { state.projectId = null; render(); }
          },
            h("span.pc-radio"),
            h("div.grow", null,
              h("div.t-headline", null, RGP.i18n.lang === "ar" ? "بدون مشروع مرتبط" : "No linked project"),
              h("div.t-caption.mut", { style: { fontWeight: 500 } }, RGP.i18n.lang === "ar" ? "طلب مستقل (فرصة استثمارية أو خدمة عامة)" : "Standalone request (investment opportunity or general service)"))))
          : h("div.well.card-pad.mbe-3.t-sub.mut", null, RGP.i18n.lang === "ar"
            ? "لا مشاريع مسجلة لحسابك — يمكنك المتابعة بطلب مستقل، أو طلب تسجيل مشروعك عبر خدمة «تسجيل مشروع كبير»."
            : "No projects on your account — continue standalone, or register your project via the onboarding service."),
        h("h2.t-title3.mbe-1.mbs-2", null, t("wizard.choosePhase")),
        h("div.grid.cols-3", null, ["before", "during", "after"].map(function (ph) {
          return h("button.pick-card" + (state.phase === ph ? ".selected" : ""), {
            onclick: function () { state.phase = ph; state.serviceId = null; render(); }
          },
            h("span.pc-radio"),
            h("div", null,
              h("div.t-headline", null, t("phase." + ph)),
              h("div.t-caption.mut.num", { style: { fontWeight: 500 } },
                RGP.store.state.services.filter(function (s) { return s.phase === ph; }).length +
                (RGP.i18n.lang === "ar" ? " خدمة" : " services"))));
        })));
    }

    function step2() {
      var list = availableServices();
      return h("div.card-lg.elev-1.card-pad", null,
        h("h2.t-title3.mbe-1", null, t("wizard.chooseService")),
        h("p.t-sub.mut.mbe-3", null,
          (RGP.i18n.lang === "ar" ? "الخدمات المتاحة لدورك ضمن مرحلة " : "Services available to your role in ") + t("phase." + state.phase)),
        list.length ? h("div.flex-col.g15", null, list.map(function (s) {
          return h("button.pick-card" + (state.serviceId === s.id ? ".selected" : ""), {
            onclick: function () { state.serviceId = s.id; render(); }
          },
            h("span.pc-radio"),
            h("div.grow", null,
              h("div.t-headline", null, td(s.name)),
              h("div.t-caption.mut.clamp2", { style: { fontWeight: 500, maxWidth: "560px" } }, td(s.description)),
              h("div.flex.g2.mbs-1.wrap", null,
                h("span.t-caption.mut.flex.g05.num", { style: { fontWeight: 600 } }, UI.icon("clock", 12),
                  (isFastTrack() && s.gigaFastTrack ? Math.max(1, Math.ceil(s.slaDays * 0.5)) : s.slaDays) + " " + t("common.workdays")),
                h("span.t-caption.mut.flex.g05", { style: { fontWeight: 600 } }, UI.icon("docs", 12),
                  h("span.num", null, String((s.requiredDocuments || []).length)), RGP.i18n.lang === "ar" ? "مستندات" : "docs"),
                s.fees && s.fees.model !== "none"
                  ? h("span.t-caption.warn-fg", { style: { fontWeight: 600 } }, RGP.i18n.lang === "ar" ? "رسوم" : "Fees")
                  : h("span.t-caption.ok-fg", { style: { fontWeight: 600 } }, RGP.i18n.lang === "ar" ? "بدون رسوم" : "No fees"),
                s.gigaFastTrack ? UI.gigaBadge() : null)));
        })) : UI.empty("search", { ar: "لا خدمات متاحة لهذا الدور في هذه المرحلة", en: "No services for this role in this phase" }, null, null, true));
    }

    function step3() {
      var s = svc();
      var prereqs = h("div.well.card-pad-dense.mbe-3", null,
        h("div.t-footnote.mbe-1", { style: { fontWeight: 600 } }, t("wizard.prereqs")),
        h("ul", null, (s.prerequisites || []).map(function (p) {
          return h("li.flex.g1.t-sub", { style: { alignItems: "flex-start", padding: "3px 0" } },
            h("span.ok-fg", { style: { marginTop: "3px" } }, UI.icon("check", 14)), td(p));
        })),
        h("label.checkbox-row.mbs-2", null,
          h("input", { type: "checkbox", checked: state.prereqOk, onchange: function (e) { state.prereqOk = e.target.checked; } }),
          h("span.t-sub", null, t("wizard.prereqConfirm"))));

      formEngine = UI.formEngine(s.formFields || [], state.formData);

      return h("div.card-lg.elev-1.card-pad", null,
        h("h2.t-title3.mbe-3", null, t("wizard.step3") + " — " + td(s.name)),
        (s.prerequisites || []).length ? prereqs : null,
        formEngine.el);
    }

    function step4() {
      var s = svc();
      var docsList = h("div.card.elev-0", null, (s.requiredDocuments || []).map(function (d, i) {
        var key = "doc-" + i;
        var up = state.docs[key];
        var fileInput = h("input", {
          type: "file", hidden: true,
          accept: (d.formats || []).map(function (f) { return "." + f; }).join(","),
          onchange: function (e) {
            var f = e.target.files[0]; if (!f) return;
            var entry = { fileName: f.name, sizeKB: Math.round(f.size / 1024), mime: f.type };
            if (f.size <= 200 * 1024) {
              var rd = new FileReader();
              rd.onload = function () { entry.dataUrl = rd.result; state.docs[key] = entry; render(); };
              rd.readAsDataURL(f);
            } else {
              state.docs[key] = entry; render();
            }
          }
        });
        return h("div.doc-row" + (up ? ".verified" : ""), null,
          h("span.d-icon", null, UI.icon("doc", 20)),
          h("div.grow", null,
            h("div.t-footnote", { style: { fontWeight: 600 } }, td(d.name),
              h("span.req", { style: { color: "var(--danger)" } }, " *")),
            h("div.t-caption.mut.num", { style: { fontWeight: 500 } },
              (d.formats || []).join(" · ").toUpperCase() + " — " + (RGP.i18n.lang === "ar" ? "بحد أقصى 25 م.ب" : "max 25 MB")),
            up ? h("div.t-caption.ok-fg.num", { style: { fontWeight: 600 } }, up.fileName + " · " + RGP.fmtNum(up.sizeKB, { dec: 0 }) + " KB") : null),
          h("span.d-state", null,
            up ? h("span.ok-fg", null, UI.icon("checkCircle", 18)) : null,
            h("button.btn.tertiary.sm", { onclick: function () { fileInput.click(); } },
              UI.icon("upload", 14), up ? (RGP.i18n.lang === "ar" ? "استبدال" : "Replace") : (RGP.i18n.lang === "ar" ? "رفع" : "Upload")),
            fileInput));
      }));

      /* demo shortcut: attach sample files */
      var demoFill = h("button.btn.secondary.sm", {
        onclick: function () {
          (s.requiredDocuments || []).forEach(function (d, i) {
            var key = "doc-" + i;
            if (!state.docs[key]) {
              state.docs[key] = {
                fileName: (td(d.name).replace(/\s+/g, "-") + ".pdf"),
                sizeKB: 180 + i * 120, mime: "application/pdf"
              };
            }
          });
          render();
        }
      }, UI.icon("docs", 14), RGP.i18n.lang === "ar" ? "إرفاق ملفات تجريبية" : "Attach sample files");

      return h("div.card-lg.elev-1.card-pad", null,
        h("div.flex.between.g2.mbe-3.wrap", null,
          h("h2.t-title3", null, t("wizard.attach")),
          h("span.flex.g1", null, demoFill, UI.simBadge())),
        docsList,
        h("div.dropzone.mbs-3", {
          onclick: function () { UI.toast("info", { ar: "اختر «رفع» بجانب المستند المطلوب", en: "Use the Upload button next to each document" }); },
          ondragover: function (e) { e.preventDefault(); e.currentTarget.classList.add("dragover"); },
          ondragleave: function (e) { e.currentTarget.classList.remove("dragover"); },
          ondrop: function (e) { e.preventDefault(); e.currentTarget.classList.remove("dragover"); }
        },
          UI.icon("upload", 36),
          h("div.t-sub", null, t("wizard.attachHint")),
          h("div.t-caption.mut", { style: { fontWeight: 500 } }, "PDF · DWG · XLSX · KML")));
    }

    function step5() {
      var s = svc();
      var vals = state.formData;
      var p = state.projectId && RGP.store.project(state.projectId);
      var due = RGP.addWorkingDays(RGP.todayISO(), slaDays());
      return h("div.card-lg.elev-1.card-pad", null,
        h("h2.t-title3.mbe-1", null, t("wizard.step5")),
        h("p.t-sub.mut.mbe-3", null, t("wizard.reviewNote")),
        isFastTrack() ? h("div.sla-note.mbe-2", { style: { background: "var(--sand-soft)", color: "var(--sand-deep)", borderColor: "var(--sand-border)" } },
          UI.icon("bolt", 14), t("wizard.fastTrackNote")) : null,
        h("div.review-grid.mbe-3", null,
          rv(t("req.service"), td(s.name)),
          rv(t("req.project"), p ? td(p.name) : t("common.none")),
          rv(t("req.applicant"), td(u.name) + " — " + td(u.org)),
          rv(t("common.sla"), h("span.num", null, String(slaDays())), " " + t("common.workdays")),
          rv(t("wizard.expectedBy"), h("span.num", null, RGP.fmtDate(due))),
          rv(t("common.fees"), s.fees && s.fees.model !== "none" ? td(s.fees.note) : (RGP.i18n.lang === "ar" ? "لا رسوم" : "None"))),
        h("div.t-headline.mbe-1", null, t("req.formData")),
        h("div.review-grid.mbe-3", null, (s.formFields || []).map(function (f) {
          return rv(td(f.label), vals[f.key] != null && vals[f.key] !== "" ? String(vals[f.key]) : "—");
        })),
        h("div.t-headline.mbe-1", null, t("req.documents")),
        h("div.flex.g1.wrap.mbe-3", null, (s.requiredDocuments || []).map(function (d, i) {
          var up = state.docs["doc-" + i];
          return h("span.pill." + (up ? "ok" : "dang"), null,
            up ? UI.icon("check", 12) : UI.icon("x", 12), td(d.name));
        })),
        h("label.checkbox-row.well.card-pad-dense", null,
          h("input", { type: "checkbox", checked: state.declared, onchange: function (e) { state.declared = e.target.checked; } }),
          h("span.t-sub", null, t("wizard.declaration"))));

      function rv(k, v, extra) {
        return h("div", null, h("div.rk", null, k), h("div.rv", null, v, extra || null));
      }
    }

    function successView(req) {
      return h("div.card-lg.elev-1.card-pad", null,
        h("div.success-hero", null,
          h("span.ok-circle", null, UI.icon("check", 40)),
          h("h2.t-title2", null, t("wizard.submitted")),
          h("p.t-sub.mut.mbs-1", null,
            t("wizard.submittedSub") + ": ", h("b.num", null, req.id),
            " — " + t("wizard.expectedBy") + " ", h("b.num", null, RGP.fmtDate(req.sla.dueAt))),
          req.priority === "fast_track" ? h("div.mbs-2", null, UI.gigaBadge()) : null,
          h("div.flex.g15.mbs-4", null,
            h("a.btn.primary", { href: "#/portal/requests/" + req.id }, t("wizard.track"), UI.fwd(16)),
            h("a.btn.secondary", { href: "#/portal" }, RGP.i18n.lang === "ar" ? "الرئيسية" : "Home"))));
    }

    /* ---------------- render ---------------- */
    function render() {
      container.innerHTML = "";
      if (state.submitted) {
        container.appendChild(successView(state.submitted));
        return;
      }

      var s = svc();
      var stepLabels = [t("wizard.step1"), t("wizard.step2"), t("wizard.step3"), t("wizard.step4"), t("wizard.step5")];
      var stepper = h("div.stepper", null, stepLabels.map(function (lbl, i) {
        var n = i + 1;
        var cls = n < state.step ? "done" : n === state.step ? "current" : "";
        return h("div.step" + (cls ? "." + cls : ""), {
          onclick: cls === "done" ? function () { go(n, true); } : null
        },
          h("span.s-dot", null, n < state.step ? UI.icon("check", 13) : h("span.num", null, String(n))),
          h("span.s-label", null, lbl));
      }));

      var slaBar = s ? h("div.flex.between.wrap.g2.mbe-2", null,
        h("span.sla-note", null, UI.icon("clock", 14),
          (RGP.i18n.lang === "ar" ? "المدة المتوقعة للمعالجة: " : "Expected processing: "),
          h("span.num", null, String(slaDays())), " " + t("common.workdays") +
          (RGP.i18n.lang === "ar" ? " وفق اتفاقية مستوى الخدمة" : " per the SLA")),
        isFastTrack() ? UI.gigaBadge() : null) : null;

      var pane = h("div.wiz-pane" + (state.back ? ".back" : ""), null,
        state.step === 1 ? step1() :
        state.step === 2 ? step2() :
        state.step === 3 ? step3() :
        state.step === 4 ? step4() : step5());

      var canNext =
        state.step === 1 ? !!state.phase :
        state.step === 2 ? !!state.serviceId :
        true;

      var foot = h("div.wiz-foot", null,
        state.step > 1 ? h("button.btn.secondary", { onclick: function () {
          if (state.step === 3 && formEngine) state.formData = formEngine.values();
          go(state.step - 1, true);
        } }, t("common.previous")) : h("span"),
        h("span.grow"),
        state.step >= 3 ? h("button.btn.tertiary", { onclick: function () {
          if (state.step === 3 && formEngine) state.formData = formEngine.values();
          saveDraft();
        } }, t("wizard.saveDraft")) : null,
        state.step < 5
          ? h("button.btn.primary", {
              disabled: !canNext,
              onclick: function () {
                if (state.step === 3) {
                  if ((svc().prerequisites || []).length && !state.prereqOk) {
                    UI.toast("warn", { ar: "أكد توفر المتطلبات المسبقة أولًا", en: "Confirm the prerequisites first" });
                    return;
                  }
                  var bad = formEngine.validate();
                  if (bad.length) return;
                  state.formData = formEngine.values();
                }
                if (state.step === 4) {
                  var s2 = svc();
                  var missing = (s2.requiredDocuments || []).some(function (_, i) { return !state.docs["doc-" + i]; });
                  if (missing) { UI.toast("warn", { ar: t("toast.needAllDocs"), en: t("toast.needAllDocs") }); return; }
                }
                go(state.step + 1);
              }
            }, t("common.next"), UI.fwd(16))
          : h("button.btn.primary.lg", {
              onclick: function () {
                if (!state.declared) { UI.toast("warn", { ar: "أقر بصحة البيانات للمتابعة", en: "Accept the declaration to continue" }); return; }
                var d = saveDraft(true);
                try {
                  RGP.lifecycle.transition(d, "submitted", {});
                  state.submitted = d;
                  render();
                } catch (e) {
                  console.error(e);
                  UI.toast("danger", { ar: "تعذر تقديم الطلب", en: "Couldn't submit" });
                }
              }
            }, UI.icon("send", 18), t("wizard.submit")));

      container.appendChild(h("div", null, stepper, slaBar, h("div.wizard-body", null, pane), foot));
    }

    render();

    var head = h("div.page-head", null,
      h("div.kicker", null, t("brand.short")),
      h("h1.t-title1", null, t("wizard.title")));

    return RGP.shell(h("div", null, head, container), { context: t("wizard.title"), narrow: true });
  }

  RGP.router.register("#/wizard", ["project_rep"], wizard);
})();
