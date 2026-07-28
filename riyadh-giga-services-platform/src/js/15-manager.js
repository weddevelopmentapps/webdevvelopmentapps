/* ============================================================
   GPO manager (مكتب المشاريع الكبرى) — command dashboard,
   projects registry, challenges board, KPIs, reports, catalog
   admin, audit log, settings. it-spec §7.5 · ux-spec §7.8-7.13.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;

  /* ---------------- dashboard ---------------- */
  function dashboard() {
    var S = RGP.store.state;
    var k = RGP.kpi.compute();
    var trend = RGP.kpi.weeklyTrend();
    var cmp = RGP.kpi.compare();
    var compareCaption = { ar: "مقارنة بالثلاثين يومًا السابقة", en: "vs. previous 30 days" };
    var dAvg = (cmp.cur.avgProcessing != null && cmp.prev.avgProcessing != null)
      ? Math.round((cmp.cur.avgProcessing - cmp.prev.avgProcessing) * 10) / 10 : null;
    var dOnTime = (cmp.cur.onTimePct != null && cmp.prev.onTimePct != null)
      ? cmp.cur.onTimePct - cmp.prev.onTimePct : null;
    /* weekly resolved-challenge counts for the closure sparkline */
    var chSpark = (function () {
      var out = [];
      for (var w2 = 11; w2 >= 0; w2--) {
        var from = RGP.daysAgo((w2 + 1) * 7), to = RGP.daysAgo(w2 * 7);
        out.push(S.challenges.filter(function (c) {
          var d2 = c.resolvedAt && c.resolvedAt.slice(0, 10);
          return d2 && d2 > from && d2 <= to;
        }).length);
      }
      return out;
    })();

    var band = h("div.kpi-band.six.mbs-3", null,
      UI.kpi({ label: t("kpi.avgProcessing"), value: k.avgProcessing, dec: 1, unit: t("kpi.workdaysUnit"),
        delta: dAvg, deltaGood: dAvg != null ? dAvg <= 0 : null, compare: dAvg != null ? compareCaption : null,
        spark: trend.decided,
        onclick: function () { drill(t("kpi.avgProcessing"), k.decidedList); } }),
      UI.kpi({ label: t("kpi.challengeClosure"), value: k.challengeClosure, suffix: "%",
        spark: chSpark,
        onclick: function () { RGP.router.go("#/manager/challenges"); } }),
      UI.kpi({ label: t("kpi.firstResponse"), value: k.firstResponse, dec: 1, unit: t("kpi.workdaysUnit"),
        spark: trend.submitted,
        onclick: function () { drill(t("kpi.firstResponse"), k.firstRespList); } }),
      UI.kpi({ label: t("kpi.slaCompliance"), value: k.onTimePct, suffix: "%",
        delta: dOnTime, deltaGood: dOnTime != null ? dOnTime >= 0 : null, deltaPct: true,
        compare: dOnTime != null ? compareCaption : null,
        spark: trend.decided,
        onclick: function () { drill(t("kpi.slaCompliance"), k.openList); } }),
      UI.kpi({ label: t("kpi.satisfaction"), value: k.satisfaction, dec: 1, unit: "/5",
        onclick: function () { drill(t("kpi.satisfaction"), k.ratedList); } }),
      UI.kpi({ label: t("kpi.enabledProjects"), value: k.enabledProjects,
        onclick: function () { RGP.router.go("#/manager/projects"); } }));

    function drill(title, list) {
      UI.modal({
        title: title, size: "lg",
        body: list.length ? h("div.flex-col.g1", null, list.slice(0, 20).map(function (r) {
          var svc = RGP.store.service(r.serviceId);
          return h("a.pick-card", { href: "#/work/review/" + r.id },
            h("div.grow", null,
              h("div.flex.g1", null, h("span.id-cell.num", null, r.id), UI.statePill(r.state, true)),
              h("div.t-caption.mut", { style: { fontWeight: 500 } }, svc ? td(svc.name) : "")),
            r.satisfaction ? h("span.pill.plain.num", null, r.satisfaction.score + "/5") : UI.slaChip(r));
        })) : UI.empty("inbox", { ar: "لا سجلات", en: "No records" }, null, null, true)
      });
    }

    /* charts row */
    var trendBox = h("div.chart-box");
    var donutBox = h("div.chart-box");
    var chartsRow = h("div.grid.cols-21.mbs-2", null,
      h("div.chart-card.elev-1", null,
        h("div.ch-head", null, h("span.t-headline", null, t("gpo.trend"))),
        trendBox),
      h("div.chart-card.elev-1", null,
        h("div.ch-head", null, h("span.t-headline", null, t("gpo.byStatus"))),
        donutBox));

    /* map + attention row */
    var pulseIds = S.challenges.filter(function (c) { return c.severity === "critical" && ["open", "in_progress", "escalated"].indexOf(c.state) >= 0; })
      .map(function (c) { return c.projectId; });
    var attention = S.requests.filter(function (r) {
      return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0 && ["amber", "red"].indexOf(RGP.lifecycle.slaBand(r)) >= 0;
    }).sort(function (a, b) {
      var ba = RGP.lifecycle.slaBand(a) === "red" ? 0 : 1, bb = RGP.lifecycle.slaBand(b) === "red" ? 0 : 1;
      if (ba !== bb) return ba - bb;
      return a.priority === "fast_track" ? -1 : 1;
    });

    var openCh = S.challenges.filter(function (c) { return ["open", "in_progress", "escalated"].indexOf(c.state) >= 0; })
      .sort(function (a, b) { return RGP.challengeAge(b) - RGP.challengeAge(a); });

    var mapRow = h("div.grid.cols-21.mbs-2", null,
      h("div", null,
        h("div.flex.between.mbe-1", null,
          h("span.t-headline", null, t("gpo.map")),
          h("a.btn.tertiary.sm", { href: "#/manager/projects" }, t("gpo.registry"))),
        RGP.map.render({
          projects: S.projects, pulseIds: pulseIds, showLabels: true,
          onSelect: function (p) { RGP.router.go("#/manager/projects/" + p.id); }
        })),
      h("div.flex-col.g2", null,
        h("div.card.elev-1.card-pad-dense", null,
          h("div.flex.between.mbe-1", null,
            h("span.t-headline", null, t("gpo.needsAttention")),
            h("span.pill.dang.sm.num", null, String(attention.length))),
          attention.length ? attention.slice(0, 5).map(function (r) {
            var svc = RGP.store.service(r.serviceId);
            return h("a.attn-row", { href: "#/work/review/" + r.id, style: { textDecoration: "none", color: "inherit" } },
              h("span.id-cell.num.t-caption", { style: { fontWeight: 600 } }, r.id),
              h("span.grow.t-caption.mut.ellipsis", { style: { fontWeight: 500 } }, svc ? td(svc.name) : ""),
              UI.slaChip(r));
          }) : h("div.t-sub.mut", { style: { padding: "8px 0" } }, RGP.i18n.lang === "ar" ? "لا توجد تجاوزات، وجميع الطلبات ضمن مددها المحددة." : "No breaches; all requests are within their timelines."),
          attention.length > 5 ? h("a.btn.tertiary.sm", { href: "#/work/queue" }, t("common.showAll")) : null),
        h("div.card.elev-1.card-pad-dense", null,
          h("div.flex.between.mbe-1", null,
            h("span.t-headline", null, t("gpo.challenges")),
            h("a.btn.tertiary.sm", { href: "#/manager/challenges" }, t("common.showAll"))),
          openCh.slice(0, 4).map(function (c) {
            return h("div.attn-row", { style: { cursor: "pointer" }, onclick: function () { RGP.challengeDetail(c); } },
              h("span.sev-dot." + c.severity),
              h("div.grow", null,
                h("div.t-caption.ellipsis", { style: { fontWeight: 600, maxWidth: "240px" } }, td(c.title)),
                h("div.t-caption.mut", { style: { fontWeight: 500 } },
                  (c.responsibleEntity ? td(RGP.entityName(c.responsibleEntity)) + " · " : "") +
                  RGP.fmtWorkdays(RGP.challengeAge(c)))),
              RGP.chStatePill(c.state));
          }))));

    /* sector & phase row */
    var sectorBox = h("div.chart-box.short");
    var svcBox = h("div.chart-box.short");
    var breakdown = h("div.grid.cols-2.mbs-2", null,
      h("div.chart-card.elev-1", null,
        h("div.ch-head", null, h("span.t-headline", null, t("gpo.bySector"))), sectorBox),
      h("div.chart-card.elev-1", null,
        h("div.ch-head", null, h("span.t-headline", null, t("gpo.byService"))), svcBox));

    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("gpo.dashboard")),
      h("p.desc.t-sub", null,
        RGP.i18n.lang === "ar"
          ? "متابعة حالة الطلبات والمدد والتحديات والجهات المعنية بتمكين المشاريع الكبرى."
          : "Monitor the requests, timelines, challenges, and entities involved in giga-project enablement."),
      h("div.actions", null,
        h("a.btn.primary", { href: "#/manager/reports" }, UI.icon("doc", 16), t("rep.generate")),
        h("button.btn.secondary", { onclick: function () { RGP.challengeForm(); } }, UI.icon("flag", 16), t("ch.new"))));

    var root = RGP.shell(h("div", null, head, band, chartsRow, mapRow, breakdown), { context: t("gpo.dashboard") });

    /* charts after mount */
    requestAnimationFrame(function () {
      RGP.charts.area(trendBox, trend.labels, [
        { name: RGP.i18n.lang === "ar" ? "المقدمة" : "Submitted", data: trend.submitted },
        { name: RGP.i18n.lang === "ar" ? "المنجزة" : "Decided", data: trend.decided }
      ]);
      var groups = [
        { states: ["submitted", "screening"], label: RGP.i18n.lang === "ar" ? "وارد" : "Intake" },
        { states: ["in_review", "resubmitted"], label: RGP.i18n.lang === "ar" ? "قيد الدراسة" : "In review" },
        { states: ["external_review"], label: RGP.i18n.lang === "ar" ? "جهات خارجية" : "External" },
        { states: ["returned"], label: RGP.i18n.lang === "ar" ? "معاد" : "Returned" },
        { states: ["decision_due"], label: RGP.i18n.lang === "ar" ? "قرار مستحق" : "Decision due" },
        { states: ["approved", "rejected", "cancelled", "closed"], label: RGP.i18n.lang === "ar" ? "منتهية" : "Done" }
      ];
      RGP.charts.donut(donutBox, groups.map(function (g) {
        return { name: g.label, value: S.requests.filter(function (r) { return g.states.indexOf(r.state) >= 0; }).length };
      }), RGP.i18n.lang === "ar" ? "طلبًا" : "requests");
      var secAgg = {};
      S.projects.forEach(function (p) {
        var key = td(RGP.sectorLabel(p.sector));
        secAgg[key] = (secAgg[key] || 0) + 1;
      });
      RGP.charts.hbar(sectorBox, Object.keys(secAgg), Object.values(secAgg));
      var svcAgg = {};
      S.requests.forEach(function (r) {
        if (r.state === "draft") return;
        var svc = RGP.store.service(r.serviceId);
        if (!svc) return;
        var key = td(RGP.categoryLabel(svc.category));
        svcAgg[key] = (svcAgg[key] || 0) + 1;
      });
      RGP.charts.bar(svcBox, Object.keys(svcAgg), [{ name: "", data: Object.values(svcAgg) }]);
    });

    return root;
  }

  /* ---------------- projects registry ---------------- */
  function projects() {
    var S = RGP.store.state;
    var view = "table";
    var content = h("div.mbs-2");

    function refresh() {
      content.innerHTML = "";
      if (view === "map") {
        content.appendChild(RGP.map.render({
          projects: S.projects, showLabels: true,
          onSelect: function (p) { RGP.router.go("#/manager/projects/" + p.id); }
        }));
        return;
      }
      if (view === "cards") {
        content.appendChild(h("div.grid.cols-3.reveal", null, S.projects.map(function (p) {
          return h("div.card.elev-1.card-pad", { style: { cursor: "pointer" }, onclick: function () { RGP.router.go("#/manager/projects/" + p.id); } },
            h("div.flex.g15.mbe-2", null,
              h("span.avatar.lg", { style: { background: "var(--green-800)", color: "#fff" } }, p.monogram),
              h("div.grow", null,
                h("div.t-headline", null, td(p.name)),
                h("div.t-caption.mut", { style: { fontWeight: 500 } }, td(p.owner))),
              p.isGiga ? UI.gigaBadge() : null),
            h("div.flex.g1.wrap", null,
              h("span.pill.plain.sm", null, td(RGP.sectorLabel(p.sector))),
              h("span.pill.info.sm", null, td(RGP.projectPhaseLabel(p.phase))),
              h("span.pill." + (p.status === "enabled" ? "ok" : p.status === "on_hold" ? "warn" : "plain") + ".sm", null, td(RGP.projectStatusLabel(p.status)))),
            h("div.t-caption.mut.mbs-2.num", { style: { fontWeight: 500 } },
              RGP.fmtNum(p.location.areaKm2, { dec: 1 }) + (RGP.i18n.lang === "ar" ? " كم²" : " km²") + " · " + td(p.location.district)));
        })));
        return;
      }
      content.appendChild(UI.table({
        rows: S.projects,
        cols: [
          { key: "name", label: { ar: "المشروع", en: "Project" }, render: function (p) {
              return h("span.flex.g15", null,
                h("span.avatar.sm", { style: { background: "var(--green-800)", color: "#fff" } }, p.monogram),
                h("b", null, td(p.name)));
            }, sortVal: function (p) { return td(p.name); } },
          { key: "owner", label: { ar: "الجهة المالكة", en: "Owner" }, render: function (p) { return td(p.owner); } },
          { key: "dev", label: { ar: "المطور", en: "Developer" }, render: function (p) { return td(p.developer); } },
          { key: "sector", label: { ar: "القطاع", en: "Sector" }, render: function (p) { return h("span.pill.plain.sm", null, td(RGP.sectorLabel(p.sector))); } },
          { key: "phase", label: { ar: "المرحلة", en: "Phase" }, render: function (p) { return h("span.pill.info.sm", null, td(RGP.projectPhaseLabel(p.phase))); } },
          { key: "reqs", label: { ar: "الطلبات", en: "Requests" }, end: true, render: function (p) {
              return h("span.num", null, String(S.requests.filter(function (r) { return r.projectId === p.id; }).length));
            }, sortVal: function (p) { return S.requests.filter(function (r) { return r.projectId === p.id; }).length; } },
          { key: "status", label: t("common.status"), render: function (p) {
              return h("span.pill." + (p.status === "enabled" ? "ok" : p.status === "on_hold" ? "warn" : p.status === "registered" ? "info" : "plain"), null, td(RGP.projectStatusLabel(p.status)));
            } }
        ],
        onRow: function (p) { RGP.router.go("#/manager/projects/" + p.id); }
      }));
    }
    refresh();

    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("gpo.registry")),
      h("p.desc.t-sub", null, RGP.i18n.lang === "ar"
        ? "قاعدة البيانات الموحدة للمشاريع الكبرى في مدينة الرياض، وتشمل بيانات المشروع وموقعه ومرحلته وخدماته وحالته."
        : "The unified registry of giga projects in Riyadh, covering each project's data, location, phase, services and status."),
      h("div.actions", null,
        h("button.btn.primary", { onclick: function () { projectForm(null); } }, UI.icon("plus", 16), t("gpo.addProject")),
        h("div.segmented", null,
          [["table", { ar: "جدول", en: "Table" }], ["cards", { ar: "بطاقات", en: "Cards" }], ["map", { ar: "خريطة", en: "Map" }]].map(function (x) {
            return h("button" + (view === x[0] ? ".active" : ""), {
              onclick: function (e) {
                view = x[0];
                RGP.$$("button", e.target.closest(".segmented")).forEach(function (b) { b.classList.remove("active"); });
                e.target.closest("button").classList.add("active");
                refresh();
              }
            }, td(x[1]));
          }))));

    return RGP.shell(h("div", null, head, content), { context: t("gpo.registry") });
  }

  function projectForm(existing) {
    var p = existing || {};
    function inp(val, ph, num) { return h("input.input" + (num ? ".num-field" : ""), { value: val || "", placeholder: ph || "" }); }
    var nameAr = inp(p.name && p.name.ar), nameEn = inp(p.name && p.name.en);
    var ownerAr = inp(p.owner && p.owner.ar), devAr = inp(p.developer && p.developer.ar);
    var sector = h("select.input", null, Object.keys({ cultural: 1, entertainment: 1, residential: 1, sports: 1, transport: 1, "mixed-use": 1, environment: 1, education: 1, commercial: 1 }).map(function (s) {
      return h("option", { value: s, selected: p.sector === s }, td(RGP.sectorLabel(s)));
    }));
    var phase = h("select.input", null, ["planning", "design", "infrastructure", "construction", "handover", "operation"].map(function (s) {
      return h("option", { value: s, selected: p.phase === s }, td(RGP.projectPhaseLabel(s)));
    }));
    var status = h("select.input", null, ["registered", "active", "on_hold", "enabled", "archived"].map(function (s) {
      return h("option", { value: s, selected: p.status === s }, td(RGP.projectStatusLabel(s)));
    }));
    var lat = inp(p.location && p.location.lat, "24.71", true), lng = inp(p.location && p.location.lng, "46.67", true);
    var area = inp(p.location && p.location.areaKm2, "10", true);
    var district = inp(p.location && p.location.district && p.location.district.ar, RGP.i18n.lang === "ar" ? "الحي / النطاق" : "District");
    var isGiga = h("input", { type: "checkbox", checked: p.isGiga !== false });

    UI.modal({
      title: existing ? t("gpo.editProject") : t("gpo.addProject"), size: "lg",
      body: h("div.grid.cols-2", null,
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "الاسم (عربي)" : "Name (AR)", h("span.req", null, "*")), nameAr),
        h("div.field", null, h("label", null, "Name (EN)"), nameEn),
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "الجهة المالكة" : "Owner entity", h("span.req", null, "*")), ownerAr),
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "المطور" : "Developer"), devAr),
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "القطاع" : "Sector"), h("div.select-wrap", null, sector)),
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "المرحلة" : "Phase"), h("div.select-wrap", null, phase)),
        h("div.field", null, h("label", null, t("common.status")), h("div.select-wrap", null, status)),
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "الحي / النطاق" : "District"), district),
        h("div.field", null, h("label", null, "Lat"), lat),
        h("div.field", null, h("label", null, "Lng"), lng),
        h("div.field", null, h("label", null, RGP.i18n.lang === "ar" ? "المساحة (كم²)" : "Area (km²)"), area),
        h("div.field", null, h("label", null, " "), h("label.checkbox-row", null, isGiga, h("span.t-sub", null, RGP.i18n.lang === "ar" ? "مشروع كبير (مسار أولوية)" : "Giga project (priority lane)")))),
      actions: function (close) {
        return [
          h("button.btn.secondary", { onclick: close }, t("common.cancel")),
          h("button.btn.primary", {
            onclick: function () {
              if (!nameAr.value.trim() || !ownerAr.value.trim()) {
                UI.toast("warn", { ar: "أكمل الحقول الإلزامية", en: "Complete required fields" });
                return;
              }
              if (existing) {
                p.name = { ar: nameAr.value, en: nameEn.value || nameAr.value };
                p.owner = { ar: ownerAr.value, en: ownerAr.value };
                p.developer = { ar: devAr.value, en: devAr.value };
                p.sector = sector.value; p.phase = phase.value; p.status = status.value;
                p.isGiga = isGiga.checked;
                p.location.lat = parseFloat(lat.value) || p.location.lat;
                p.location.lng = parseFloat(lng.value) || p.location.lng;
                p.location.areaKm2 = parseFloat(area.value) || p.location.areaKm2;
                p.location.district = { ar: district.value, en: district.value };
                p.updatedAt = RGP.nowISO();
                RGP.store.audit("project.updated", "project", p.id);
              } else {
                var np = {
                  id: RGP.store.nextProjectId(),
                  name: { ar: nameAr.value, en: nameEn.value || nameAr.value },
                  owner: { ar: ownerAr.value, en: ownerAr.value },
                  developer: { ar: devAr.value, en: devAr.value },
                  sector: sector.value, isGiga: isGiga.checked,
                  phase: phase.value, status: status.value || "registered",
                  monogram: (nameEn.value || nameAr.value).slice(0, 2).toUpperCase(),
                  location: { district: { ar: district.value, en: district.value }, lat: parseFloat(lat.value) || 24.71, lng: parseFloat(lng.value) || 46.67, areaKm2: parseFloat(area.value) || 1 },
                  description: { ar: "", en: "" }, requestedServiceIds: [],
                  createdAt: RGP.nowISO(), updatedAt: RGP.nowISO()
                };
                RGP.store.state.projects.push(np);
                RGP.store.audit("project.created", "project", np.id);
              }
              RGP.store.save(); close(); RGP.router.render();
              UI.toast("ok", { ar: t("toast.saved"), en: t("toast.saved") });
            }
          }, t("common.save"))
        ];
      }
    });
  }

  function projectDetail(params) {
    var p = RGP.store.project(params.id);
    if (!p) return RGP.shell(UI.empty("search", { ar: "المشروع غير موجود", en: "Project not found" }), {});
    var S = RGP.store.state;
    var reqs = S.requests.filter(function (r) { return r.projectId === p.id; });
    var chs = S.challenges.filter(function (c) { return c.projectId === p.id; });
    var open = reqs.filter(function (r) { return RGP.lifecycle.OPEN_STATES.indexOf(r.state) >= 0; });
    var approvedR = reqs.filter(function (r) { return r.decision && r.decision.type === "approved"; });

    var head = h("div.page-head", null,
      h("div.crumbs", null, h("a", { href: "#/manager/projects" }, t("gpo.registry")), h("span", null, "‹"), h("span", null, td(p.name))),
      h("h1.t-title1", null,
        h("span.avatar.lg", { style: { background: "var(--green-800)", color: "#fff" } }, p.monogram),
        td(p.name),
        p.isGiga ? UI.gigaBadge() : null),
      h("p.desc.t-sub", null, td(p.description)),
      h("div.actions", null,
        h("button.btn.secondary", { onclick: function () { projectForm(p); } }, UI.icon("settings", 16), t("gpo.editProject")),
        p.status !== "enabled" ? h("button.btn.primary", {
          onclick: function () {
            p.status = "enabled"; p.enabledManually = true; p.updatedAt = RGP.nowISO();
            RGP.store.audit("project.status_changed", "project", p.id, { to: "enabled" });
            RGP.store.save(); RGP.router.render();
          }
        }, UI.icon("checkCircle", 16), RGP.i18n.lang === "ar" ? "اعتماد كمشروع ممكّن" : "Mark enabled") : null));

    var band = h("div.kpi-band.mbs-2", null,
      UI.kpi({ label: { ar: "إجمالي الطلبات", en: "Total requests" }, value: reqs.length }),
      UI.kpi({ label: { ar: "طلبات نشطة", en: "Active" }, value: open.length }),
      UI.kpi({ label: { ar: "وثائق معتمدة", en: "Approved documents" }, value: approvedR.length }),
      UI.kpi({ label: { ar: "تحديات مفتوحة", en: "Open challenges" }, value: chs.filter(function (c) { return ["open", "in_progress", "escalated"].indexOf(c.state) >= 0; }).length }));

    var meta = h("div.card.elev-1.card-pad.mbs-2", null,
      h("div.review-grid", null,
        kv({ ar: "الجهة المالكة", en: "Owner" }, td(p.owner)),
        kv({ ar: "المطور", en: "Developer" }, td(p.developer)),
        kv({ ar: "القطاع", en: "Sector" }, td(RGP.sectorLabel(p.sector))),
        kv({ ar: "المرحلة", en: "Phase" }, td(RGP.projectPhaseLabel(p.phase))),
        kv({ ar: "النطاق", en: "District" }, td(p.location.district)),
        kv({ ar: "المساحة", en: "Area" }, h("span.num", null, RGP.fmtNum(p.location.areaKm2, { dec: 1 }) + " km²"))));
    function kv(k, v) { return h("div", null, h("div.rk", null, td(k)), h("div.rv", null, v)); }

    var reqTable = UI.table({
      rows: reqs,
      cols: [
        { key: "id", label: t("req.number"), render: function (r) { return h("span.id-cell.num", null, r.id); } },
        { key: "svc", label: t("req.service"), render: function (r) { var s = RGP.store.service(r.serviceId); return s ? td(s.name) : "—"; } },
        { key: "sla", label: t("common.sla"), render: function (r) { return UI.slaChip(r) || "—"; } },
        { key: "state", label: t("common.status"), render: function (r) { return UI.statePill(r.state); } }
      ],
      onRow: function (r) { RGP.router.go("#/work/review/" + r.id); },
      empty: UI.empty("docs", { ar: "لا طلبات لهذا المشروع", en: "No requests yet" }, null, null, true)
    });

    var chList = chs.length ? h("div.grid.cols-2", null, chs.map(function (c) { return RGP.challengeCard(c); }))
      : UI.empty("flag", { ar: "لا تحديات", en: "No challenges" }, null, null, true);

    return RGP.shell(h("div", null, head, band, meta,
      h("h2.t-title3.mbs-3.mbe-2", null, RGP.i18n.lang === "ar" ? "طلبات المشروع" : "Project requests"), reqTable,
      h("h2.t-title3.mbs-3.mbe-2", null, t("gpo.challenges")), chList),
      { context: t("gpo.registry") });
  }

  /* ---------------- challenges board ---------------- */
  function challengesBoard() {
    var S = RGP.store.state;
    var k = RGP.kpi.compute();
    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("gpo.challenges")),
      h("p.desc.t-sub", null,
        t("kpi.challengeClosure") + ": ", h("b.num", null, k.challengeClosure + "%"),
        " · " + (RGP.i18n.lang === "ar" ? "مفتوحة: " : "Open: "), h("b.num", null, String(k.openChallenges))),
      h("div.actions", null,
        h("button.btn.primary", { onclick: function () { RGP.challengeForm(); } }, UI.icon("plus", 16), t("ch.new"))));

    var view = "board";
    var content = h("div.mbs-2");
    function renderCh() {
      content.innerHTML = "";
      if (view === "table") {
        content.appendChild(UI.table({
          rows: S.challenges,
          pageSize: 12,
          cols: [
            { key: "id", label: { ar: "الرقم", en: "ID" }, render: function (c) { return h("span.id-cell.num", null, c.id); } },
            { key: "title", label: { ar: "التحدي", en: "Challenge" }, render: function (c) {
                return h("span.ellipsis", { style: { maxWidth: "280px", display: "inline-block" } }, td(c.title)); } },
            { key: "proj", label: t("req.project"), render: function (c) {
                var p2 = c.projectId && RGP.store.project(c.projectId); return p2 ? td(p2.name) : "—"; } },
            { key: "owner", label: t("ch.owner"), render: function (c) {
                return c.responsibleEntity ? h("span.pill.plain.sm", null, td(RGP.entityName(c.responsibleEntity))) : "—"; } },
            { key: "age", label: t("ch.resolutionDays"), end: true, render: function (c) {
                return h("span.num", null, String(RGP.challengeAge(c))); },
              sortVal: function (c) { return RGP.challengeAge(c); } },
            { key: "state", label: t("common.status"), render: function (c) { return RGP.chStatePill(c.state); } }
          ],
          onRow: function (c) { RGP.challengeDetail(c); }
        }));
        return;
      }
      content.appendChild(h("div.kanban", null, RGP.CH_STATES.map(function (st) {
        var items = S.challenges.filter(function (c) { return c.state === st; });
        return h("div.kb-col", null,
          h("div.kb-head", null,
            RGP.chStatePill(st),
            h("span.t-caption.mut.num", { style: { fontWeight: 600 } }, String(items.length))),
          items.map(function (c) { return RGP.challengeCard(c); }),
          !items.length ? h("div.t-caption.mut", { style: { textAlign: "center", padding: "16px 0", fontWeight: 500 } }, "—") : null);
      })));
    }
    renderCh();
    head.querySelector(".actions").appendChild(
      h("div.segmented", null,
        [["board", { ar: "لوحة", en: "Board" }], ["table", { ar: "جدول", en: "Table" }]].map(function (x) {
          return h("button" + (view === x[0] ? ".active" : ""), {
            onclick: function (e) {
              view = x[0];
              RGP.$$("button", e.target.closest(".segmented")).forEach(function (b) { b.classList.remove("active"); });
              e.target.closest("button").classList.add("active");
              renderCh();
            }
          }, td(x[1]));
        })));

    return RGP.shell(h("div", null, head, content), { context: t("gpo.challenges") });
  }

  /* ---------------- KPIs screen ---------------- */
  function kpis() {
    var S = RGP.store.state;
    var k = RGP.kpi.compute();

    var entityBox = h("div.chart-box");
    var returnBox = h("div.chart-box.short");
    var satBox = h("div.chart-box.short");

    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("gpo.kpis")),
      h("p.desc.t-sub", null, RGP.i18n.lang === "ar"
        ? "مؤشرات الأداء المعتمدة في المسار التاسع، محسوبة من بيانات المنصة."
        : "The performance indicators adopted in Track 9, computed from platform data."));

    var band = h("div.kpi-band.six.mbs-3", null,
      UI.kpi({ label: t("kpi.avgProcessing"), value: k.avgProcessing, dec: 1, unit: t("kpi.workdaysUnit") }),
      UI.kpi({ label: t("kpi.challengeClosure"), value: k.challengeClosure, suffix: "%" }),
      UI.kpi({ label: t("kpi.firstResponse"), value: k.firstResponse, dec: 1, unit: t("kpi.workdaysUnit") }),
      UI.kpi({ label: t("kpi.slaCompliance"), value: k.onTimePct, suffix: "%" }),
      UI.kpi({ label: t("kpi.satisfaction"), value: k.satisfaction, dec: 1, unit: "/5" }),
      UI.kpi({ label: t("kpi.enabledProjects"), value: k.enabledProjects }));

    var extra = h("div.kpi-band.mbs-2", null,
      UI.kpi({ label: t("kpi.openRequests"), value: k.openRequests }),
      UI.kpi({ label: t("kpi.returnRate"), value: k.returnRate, suffix: "%" }),
      UI.kpi({ label: { ar: "طلبات متجاوزة", en: "Overdue" }, value: k.escalatedCount }),
      UI.kpi({ label: { ar: "قرارات صادرة", en: "Decisions issued" }, value: k.decidedCount }));

    var chartsRow = h("div.grid.cols-2.mbs-2", null,
      h("div.chart-card.elev-1", null, h("div.ch-head", null, h("span.t-headline", null, t("gpo.slaByEntity"))), entityBox),
      h("div.flex-col.g2", null,
        h("div.chart-card.elev-1", null, h("div.ch-head", null, h("span.t-headline", null, t("kpi.satisfaction"))), satBox)));

    var root = RGP.shell(h("div", null, head, band, extra, chartsRow), { context: t("gpo.kpis") });

    requestAnimationFrame(function () {
      /* per assigned specialist performance */
      var specs = RGP.store.usersByRole("amanah_specialist");
      var names = [], vals = [];
      specs.forEach(function (sp) {
        var mine = S.requests.filter(function (r) { return r.assigneeId === sp.id && r.decision; });
        if (!mine.length) return;
        var onTime = mine.filter(function (r) { return r.decision.decidedAt.slice(0, 10) <= r.sla.dueAt; });
        names.push(td(sp.name));
        vals.push(Math.round(100 * onTime.length / mine.length));
      });
      RGP.charts.hbar(entityBox, names, vals, { label: "{c}%" });
      var dist = [0, 0, 0, 0, 0];
      S.requests.forEach(function (r) { if (r.satisfaction) dist[r.satisfaction.score - 1]++; });
      RGP.charts.bar(satBox, ["★1", "★2", "★3", "★4", "★5"], [{ name: "", data: dist }]);
    });

    return root;
  }

  /* ---------------- reports ---------------- */
  function reports() {
    var S = RGP.store.state;
    var type = "projects";
    var period = 90;
    var sheet = h("div.mbs-2");

    var TYPES = [
      ["projects", t("rep.projects"), "building"],
      ["requests", t("rep.requests"), "docs"],
      ["challenges", t("rep.challenges"), "flag"],
      ["coordination", t("rep.coordination"), "globe"],
      ["escalations", td({ ar: "تقرير التصعيدات الأسبوعي — مكتب الأمين", en: "Weekly escalations report — Mayor's office" }), "alert"]
    ];

    function build() {
      sheet.innerHTML = "";
      var k = RGP.kpi.compute({ days: period });
      var now = RGP.fmtDateTime(Date.now());
      var title = TYPES.filter(function (x) { return x[0] === type; })[0][1];

      var body;
      if (type === "projects") {
        body = h("div.table-scroll", null,
          h("table.p-table.tbl", { style: { width: "100%" } },
            h("thead", null, h("tr", null,
              [{ ar: "المشروع", en: "Project" }, { ar: "الجهة المالكة", en: "Owner" }, { ar: "المرحلة", en: "Phase" },
               { ar: "الطلبات", en: "Requests" }, { ar: "معتمد", en: "Approved" }, { ar: "تحديات مفتوحة", en: "Open challenges" }, { ar: "الحالة", en: "Status" }]
                .map(function (c) { return h("th", null, td(c)); }))),
            h("tbody", null, S.projects.map(function (p) {
              var reqs = S.requests.filter(function (r) { return r.projectId === p.id; });
              var appr = reqs.filter(function (r) { return r.decision && r.decision.type === "approved"; });
              var chs = S.challenges.filter(function (c) { return c.projectId === p.id && ["open", "in_progress", "escalated"].indexOf(c.state) >= 0; });
              return h("tr", null,
                h("td", null, h("b", null, td(p.name))),
                h("td", null, td(p.owner)),
                h("td", null, td(RGP.projectPhaseLabel(p.phase))),
                h("td.num", null, String(reqs.length)),
                h("td.num", null, String(appr.length)),
                h("td.num", null, String(chs.length)),
                h("td", null, td(RGP.projectStatusLabel(p.status))));
            }))));
      } else if (type === "requests") {
        var byService = {};
        S.requests.forEach(function (r) {
          if (r.state === "draft") return;
          var svc = RGP.store.service(r.serviceId); if (!svc) return;
          var key = td(svc.name);
          byService[key] = byService[key] || { total: 0, approved: 0, overdue: 0 };
          byService[key].total++;
          if (r.decision && r.decision.type === "approved") byService[key].approved++;
          if (RGP.lifecycle.slaBand(r) === "red") byService[key].overdue++;
        });
        body = h("div.table-scroll", null, h("table.p-table.tbl", { style: { width: "100%" } },
          h("thead", null, h("tr", null, [{ ar: "الخدمة", en: "Service" }, { ar: "الطلبات", en: "Requests" }, { ar: "معتمد", en: "Approved" }, { ar: "متجاوز", en: "Overdue" }].map(function (c) { return h("th", null, td(c)); }))),
          h("tbody", null, Object.keys(byService).map(function (name) {
            var v = byService[name];
            return h("tr", null, h("td", null, name), h("td.num", null, String(v.total)), h("td.num", null, String(v.approved)), h("td.num", null, String(v.overdue)));
          }))));
      } else if (type === "challenges") {
        body = h("div.table-scroll", null, h("table.p-table.tbl", { style: { width: "100%" } },
          h("thead", null, h("tr", null, [{ ar: "التحدي", en: "Challenge" }, { ar: "المشروع", en: "Project" }, { ar: "الجهة المسؤولة", en: "Owner" }, { ar: "التصنيف", en: "Category" }, { ar: "العمر (أيام عمل)", en: "Age (wd)" }, { ar: "الحالة", en: "Status" }].map(function (c) { return h("th", null, td(c)); }))),
          h("tbody", null, S.challenges.map(function (c) {
            var p = c.projectId && RGP.store.project(c.projectId);
            return h("tr", null,
              h("td", null, td(c.title)),
              h("td", null, p ? td(p.name) : "—"),
              h("td", null, c.responsibleEntity ? td(RGP.entityName(c.responsibleEntity)) : "—"),
              h("td", null, td(RGP.challengeCatLabel(c.category))),
              h("td.num", null, String(RGP.challengeAge(c))),
              h("td", null, t("ch." + c.state)));
          }))));
      } else if (type === "escalations") {
        /* rmun-notes §4 level 3: cases at or beyond 120% of SLA + escalated challenges */
        var overdueReqs = S.requests.filter(function (r2) {
          if (RGP.lifecycle.OPEN_STATES.indexOf(r2.state) < 0 || !r2.sla || !r2.sla.startAt) return false;
          return RGP.lifecycle.consumedPct(r2) >= 100;
        });
        var escCh = S.challenges.filter(function (c2) { return c2.state === "escalated"; });
        body = h("div", null,
          h("div.t-headline.mbe-1", null, RGP.i18n.lang === "ar" ? "طلبات بلغت أو تجاوزت مددها المحددة" : "Requests at or beyond their allotted time"),
          h("div.table-scroll", null, h("table.p-table.tbl", { style: { width: "100%" } },
            h("thead", null, h("tr", null,
              [{ ar: "الطلب", en: "Request" }, { ar: "التجاوز (أيام عمل)", en: "Overdue (wd)" }, { ar: "نسبة الاستهلاك", en: "Consumed" },
               { ar: "الخدمة", en: "Service" }, { ar: "المشروع", en: "Project" }, { ar: "الأخصائي", en: "Specialist" }]
                .map(function (c3) { return h("th", null, td(c3)); }))),
            h("tbody", null, overdueReqs.length ? overdueReqs.map(function (r2) {
              var svc2 = RGP.store.service(r2.serviceId);
              var p2 = r2.projectId && RGP.store.project(r2.projectId);
              var over2 = Math.max(0, -RGP.lifecycle.remainingDays(r2));
              return h("tr", null,
                h("td.num", null, r2.id),
                h("td" + (over2 ? ".num" : ""), null, over2 ? String(over2) : (RGP.i18n.lang === "ar" ? "يستحق اليوم" : "Due today")),
                h("td.num", null, RGP.lifecycle.consumedPct(r2) + "%"),
                h("td", null, svc2 ? td(svc2.name) : "—"),
                h("td", null, p2 ? td(p2.name) : "—"),
                h("td", null, r2.assigneeId ? td(RGP.store.userName(r2.assigneeId)) : "—"));
            }) : h("tr", null, h("td", { colspan: "6" }, RGP.i18n.lang === "ar" ? "لا توجد تجاوزات قائمة." : "No active breaches."))))),
          h("div.t-headline.mbs-3.mbe-1", null, RGP.i18n.lang === "ar" ? "تحديات مصعّدة" : "Escalated challenges"),
          h("div.table-scroll", null, h("table.p-table.tbl", { style: { width: "100%" } },
            h("thead", null, h("tr", null,
              [{ ar: "التحدي", en: "Challenge" }, { ar: "المشروع", en: "Project" }, { ar: "الجهة المسؤولة", en: "Owner" }, { ar: "العمر (أيام عمل)", en: "Age (wd)" }]
                .map(function (c3) { return h("th", null, td(c3)); }))),
            h("tbody", null, escCh.length ? escCh.map(function (c2) {
              var p3 = c2.projectId && RGP.store.project(c2.projectId);
              return h("tr", null,
                h("td", null, td(c2.title)),
                h("td", null, p3 ? td(p3.name) : "—"),
                h("td", null, c2.responsibleEntity ? td(RGP.entityName(c2.responsibleEntity)) : "—"),
                h("td.num", null, String(RGP.challengeAge(c2))));
            }) : h("tr", null, h("td", { colspan: "4" }, RGP.i18n.lang === "ar" ? "لا توجد تحديات مصعّدة." : "No escalated challenges."))))));
      } else {
        /* coordination: referrals per external entity */
        var agg = {};
        S.requests.forEach(function (r) {
          (r.referrals || []).forEach(function (ref) {
            agg[ref.entityId] = agg[ref.entityId] || { sent: 0, answered: 0, days: 0 };
            agg[ref.entityId].sent++;
            if (ref.answeredAt) {
              agg[ref.entityId].answered++;
              agg[ref.entityId].days += Math.max(0, RGP.workingDaysBetween(ref.sentAt.slice(0, 10), ref.answeredAt.slice(0, 10)));
            }
          });
        });
        body = h("div.table-scroll", null, h("table.p-table.tbl", { style: { width: "100%" } },
          h("thead", null, h("tr", null, [{ ar: "الجهة", en: "Entity" }, { ar: "الإحالات", en: "Referrals" }, { ar: "المجاب عنها", en: "Answered" }, { ar: "متوسط أيام الرد", en: "Avg response (wd)" }].map(function (c) { return h("th", null, td(c)); }))),
          h("tbody", null, Object.keys(agg).map(function (eid) {
            var v = agg[eid];
            return h("tr", null,
              h("td", null, td(RGP.entityName(eid))),
              h("td.num", null, String(v.sent)),
              h("td.num", null, String(v.answered)),
              h("td.num", null, v.answered ? RGP.fmtNum(v.days / v.answered, { dec: 1 }) : "—"));
          }))));
      }

      sheet.appendChild(h("div.report-sheet", null,
        h("div.rs-head", null,
          h("div.flex.g15", null,
            h("img", { src: window.ASSETS.logo, style: { width: "44px", borderRadius: "50%" }, alt: "" }),
            h("div", null,
              h("div.t-headline", null, t("brand.owner")),
              h("div.t-caption.mut", { style: { fontWeight: 500 } }, t("brand.name")))),
          h("div", { style: { textAlign: "end" } },
            h("div.t-title3", null, title),
            h("div.t-caption.mut.num", { style: { fontWeight: 500 } }, t("rep.generatedAt") + " " + now))),
        h("div.report-kv.mbe-3", null,
          h("div", null, h("div.rk", null, t("kpi.avgProcessing")), h("div.rv.num", null, k.avgProcessing + " " + t("kpi.workdaysUnit"))),
          h("div", null, h("div.rk", null, t("kpi.slaCompliance")), h("div.rv.num", null, k.onTimePct + "%")),
          h("div", null, h("div.rk", null, t("kpi.challengeClosure")), h("div.rv.num", null, k.challengeClosure + "%")),
          h("div", null, h("div.rk", null, t("kpi.satisfaction")), h("div.rv.num", null, k.satisfaction + "/5")),
          h("div", null, h("div.rk", null, t("kpi.enabledProjects")), h("div.rv.num", null, String(k.enabledProjects))),
          h("div", null, h("div.rk", null, t("kpi.openRequests")), h("div.rv.num", null, String(k.openRequests)))),
        body,
        h("div.t-caption.mut.mbs-3", { style: { fontWeight: 500 } }, t("rep.confidential"))));
    }
    build();

    var rail = h("div.card.elev-1.card-pad-dense", null, TYPES.map(function (x) {
      return h("button.nav-item" + (type === x[0] ? ".active" : ""), {
        onclick: function () { type = x[0]; RGP.$$(".nav-item", rail).forEach(function (n) { n.classList.remove("active"); }); event.currentTarget.classList.add("active"); build(); }
      }, UI.icon(x[2], 18), h("span", null, x[1]));
    }));

    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("rep.title")),
      h("div.actions", null,
        h("div.segmented", null, [[30, { ar: "شهر", en: "Month" }], [90, { ar: "ربع", en: "Quarter" }], [365, { ar: "سنة", en: "Year" }]].map(function (x) {
          return h("button" + (period === x[0] ? ".active" : ""), {
            onclick: function (e) {
              period = x[0];
              RGP.$$("button", e.target.closest(".segmented")).forEach(function (b) { b.classList.remove("active"); });
              e.target.closest("button").classList.add("active");
              build();
            }
          }, td(x[1]));
        })),
        h("button.btn.primary", { onclick: function () { RGP.print.report(sheet); } }, UI.icon("print", 16), t("common.print"))));

    return RGP.shell(h("div", null, head, h("div.grid.cols-12.mbs-2", null, rail, sheet)), { context: t("rep.title") });
  }

  /* ---------------- catalog admin ---------------- */
  function catalogAdmin() {
    var S = RGP.store.state;
    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("gpo.catalog")),
      h("p.desc.t-sub", null, RGP.i18n.lang === "ar"
        ? "دليل الخدمات البلدية للمشاريع الكبرى (المسار الثالث)، ويشمل توصيف الخدمات ومددها ورسومها والجهات الداعمة."
        : "The giga-projects municipal service catalog (Track 3), covering service definitions, timelines, fees and supporting entities."));

    var tbl = UI.table({
      rows: S.services,
      pageSize: 15,
      cols: [
        { key: "name", label: { ar: "الخدمة", en: "Service" }, render: function (s) { return h("b", null, td(s.name)); }, sortVal: function (s) { return td(s.name); } },
        { key: "cat", label: { ar: "الفئة", en: "Category" }, render: function (s) { return h("span.pill.plain.sm", null, td(RGP.categoryLabel(s.category))); } },
        { key: "phase", label: { ar: "المرحلة", en: "Phase" }, render: function (s) { return t("phase." + s.phase); } },
        { key: "sla", label: t("common.sla"), end: true, render: function (s) { return h("span.num", null, String(s.slaDays)); }, sortVal: function (s) { return s.slaDays; } },
        { key: "docs", label: t("req.documents"), end: true, render: function (s) { return h("span.num", null, String((s.requiredDocuments || []).length)); } },
        { key: "ft", label: t("sla.fastTrack"), render: function (s) { return s.gigaFastTrack ? h("span.ok-fg", null, UI.icon("check", 16)) : h("span.mut", null, "—"); } },
        { key: "edit", label: t("common.actions"), render: function (s) {
            return h("button.btn.tertiary.sm", { onclick: function (e) { e.stopPropagation(); editService(s); } }, t("common.edit"));
          } }
      ]
    });

    function editService(s) {
      var slaInput = h("input.input.num-field", { type: "number", value: s.slaDays, min: 1 });
      var ft = h("input", { type: "checkbox", checked: s.gigaFastTrack });
      UI.modal({
        title: s.name,
        body: h("div", null,
          h("p.t-sub.mut.mbe-2", null, td(s.description)),
          h("div.grid.cols-2", null,
            h("div.field", null, h("label", null, t("common.sla") + " (" + t("common.workdays") + ")"), slaInput),
            h("div.field", null, h("label", null, " "),
              h("label.checkbox-row", null, ft, h("span.t-sub", null, t("sla.fastTrack"))))),
          h("div.t-caption.mut", { style: { fontWeight: 500 } },
            RGP.i18n.lang === "ar" ? "آخر تعديل بواسطة " + td(RGP.auth.current().name) : "Last edited by " + td(RGP.auth.current().name))),
        actions: function (close) {
          return [h("button.btn.secondary", { onclick: close }, t("common.cancel")),
            h("button.btn.primary", {
              onclick: function () {
                s.slaDays = parseInt(slaInput.value, 10) || s.slaDays;
                s.gigaFastTrack = ft.checked;
                RGP.store.audit("service.updated", "service", s.id, { slaDays: s.slaDays });
                RGP.store.save(); close(); RGP.router.render();
                UI.toast("ok", { ar: t("toast.saved"), en: t("toast.saved") });
              }
            }, t("common.save"))];
        }
      });
    }

    return RGP.shell(h("div", null, head, h("div.mbs-2", null, tbl)), { context: t("gpo.catalog") });
  }

  /* ---------------- audit log ---------------- */
  function audit() {
    var S = RGP.store.state;
    var typeFilter = "";
    var content = h("div.card.elev-1.card-pad.mbs-2");

    function refresh() {
      content.innerHTML = "";
      var list = S.auditEvents.filter(function (a) { return !typeFilter || a.type.indexOf(typeFilter) === 0; }).slice(0, 120);
      if (!list.length) { content.appendChild(UI.empty("shield", { ar: "لا سجلات", en: "No entries" }, null, null, true)); return; }
      list.forEach(function (a) {
        content.appendChild(h("div.audit-row", null,
          h("span.audit-type.num", null, a.type),
          h("span.t-footnote", { style: { fontWeight: 600 } }, td(RGP.store.userName(a.actorId))),
          h("span.t-caption.mut", { style: { fontWeight: 500 } }, a.entityType + " · "),
          h("span.t-caption.accent.num", { style: { fontWeight: 600 } }, a.entityId),
          h("span.grow"),
          h("span.t-caption.mut.num-date", { style: { fontWeight: 500 } }, RGP.fmtDateTime(a.at))));
      });
    }
    refresh();

    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("gpo.audit")),
      h("p.desc.t-sub", null, RGP.i18n.lang === "ar"
        ? "سجل غير قابل للتعديل يوثق جميع الإجراءات على المنصة وفق متطلبات الأرشفة الإلكترونية."
        : "An append-only record documenting every platform action per electronic-archiving requirements."),
      h("div.actions", null,
        h("div.select-wrap", { style: { width: "220px" } },
          h("select.input.sm", { onchange: function (e) { typeFilter = e.target.value; refresh(); } },
            h("option", { value: "" }, t("common.all")),
            ["request.", "project.", "challenge.", "service.", "auth.", "satisfaction."].map(function (p2) {
              return h("option", { value: p2 }, p2);
            })))));

    return RGP.shell(h("div", null, head, content), { context: t("gpo.audit") });
  }

  /* ---------------- settings ---------------- */
  function settings() {
    var S = RGP.store.state;
    var head = h("div.page-head", null,
      h("div.kicker", null, t("role.platform_manager")),
      h("h1.t-title1", null, t("gpo.settings")));

    var connectors = h("div.card.elev-1", null,
      h("div.card-pad-dense.hairline-b.flex.g2", null,
        h("span.t-headline", null, RGP.i18n.lang === "ar" ? "قنوات التكامل" : "Integration connectors"),
        UI.simBadge(),
        h("span.grow"),
        h("span.t-caption.mut", { style: { fontWeight: 500 } }, t("ext.simNote"))),
      S.settings.connectors.map(function (c) {
        var dot = h("span.conn-dot" + (c.lastPingAt ? ".ok" : ""));
        var pingBtn = h("button.btn.tertiary.sm", {
          onclick: function () {
            pingBtn.textContent = "…";
            RGP.connectors.ping(c.id, function (res) {
              dot.classList.add("ok");
              pingBtn.textContent = "";
              pingBtn.appendChild(document.createTextNode(RGP.fmtNum(res.latencyMs, { dec: 0 }) + " ms"));
            });
          }
        }, "Ping");
        return h("div.doc-row", null, dot,
          h("div.grow", null,
            h("div.t-footnote", { style: { fontWeight: 600 } }, td(c.name)),
            h("div.t-caption.mut.num-date", { style: { fontWeight: 500 } },
              c.lastPingAt ? (RGP.i18n.lang === "ar" ? "آخر فحص: " : "Last ping: ") + RGP.fmtDateTime(c.lastPingAt) : (RGP.i18n.lang === "ar" ? "لم يُفحص بعد" : "Not pinged yet"))),
          h("span.pill.info.sm", null, RGP.i18n.lang === "ar" ? "محاكاة" : "Simulated"),
          pingBtn);
      }));

    var holidayList = h("div.flex.g1.wrap");
    function renderHolidays() {
      holidayList.innerHTML = "";
      S.settings.holidays.forEach(function (d, idx) {
        holidayList.appendChild(h("span.pill.plain.num", null, d,
          h("button.iconbtn", { style: { width: "18px", height: "18px" }, "aria-label": "remove",
            onclick: function () {
              S.settings.holidays.splice(idx, 1);
              RGP.store.audit("settings.updated", "settings", "holidays");
              RGP.store.save(); renderHolidays();
            } }, UI.icon("x", 10))));
      });
    }
    renderHolidays();
    var newHoliday = h("input.input.sm.num-field", { type: "date", style: { width: "170px" } });
    var holidays = h("div.card.elev-1.card-pad.mbs-2", null,
      h("div.t-headline.mbe-1", null, RGP.i18n.lang === "ar" ? "أيام العطل الرسمية (تُستثنى من المدد)" : "Official holidays (excluded from SLAs)"),
      holidayList,
      h("div.flex.g1.mbs-2", null, newHoliday,
        h("button.btn.secondary.sm", {
          onclick: function () {
            if (!newHoliday.value) return;
            if (S.settings.holidays.indexOf(newHoliday.value) < 0) {
              S.settings.holidays.push(newHoliday.value);
              S.settings.holidays.sort();
              RGP.store.audit("settings.updated", "settings", "holidays");
              RGP.store.save(); renderHolidays();
            }
            newHoliday.value = "";
          }
        }, UI.icon("plus", 14), t("common.add"))));

    var sla = h("div.card.elev-1.card-pad.mbs-2", null,
      h("div.t-headline.mbe-2", null, RGP.i18n.lang === "ar" ? "سياسة اتفاقيات مستوى الخدمة" : "SLA policy"),
      h("div.review-grid", null,
        h("div", null, h("div.rk", null, RGP.i18n.lang === "ar" ? "أيام العمل" : "Working days"), h("div.rv", null, RGP.i18n.lang === "ar" ? "الأحد – الخميس (توقيت الرياض)" : "Sunday–Thursday (Riyadh)")),
        h("div", null, h("div.rk", null, t("sla.fastTrack")), h("div.rv.num", null, "×0.5 (ceil)")),
        h("div", null, h("div.rk", null, RGP.i18n.lang === "ar" ? "إنذار مبكر" : "Amber"), h("div.rv.num", null, S.settings.slaPolicy.amberPct + "%")),
        h("div", null, h("div.rk", null, RGP.i18n.lang === "ar" ? "تصعيد" : "Red escalation"), h("div.rv.num", null, S.settings.slaPolicy.redPct + "%"))),
      h("div.t-caption.mut.mbs-2", { style: { fontWeight: 500 } },
        RGP.i18n.lang === "ar"
          ? "التصعيد: أخصائي ← رئيس القسم (80%) ← مدير مكتب المشاريع الكبرى (100%) ← مكتب الأمين (120% ضمن التقرير الأسبوعي)."
          : "Escalation: specialist → section head (80%) → GPO director (100%) → Mayor's office (120%, weekly report)."));

    return RGP.shell(h("div", null, head, connectors, holidays, sla), { context: t("gpo.settings"), narrow: true });
  }

  RGP.router.register("#/manager/dashboard", ["platform_manager"], dashboard);
  RGP.router.register("#/manager/projects", ["platform_manager"], projects);
  RGP.router.register("#/manager/projects/:id", ["platform_manager"], projectDetail);
  RGP.router.register("#/manager/challenges", ["platform_manager"], challengesBoard);
  RGP.router.register("#/manager/kpis", ["platform_manager"], kpis);
  RGP.router.register("#/manager/reports", ["platform_manager"], reports);
  RGP.router.register("#/manager/services", ["platform_manager"], catalogAdmin);
  RGP.router.register("#/manager/audit", ["platform_manager"], audit);
  RGP.router.register("#/manager/settings", ["platform_manager"], settings);
})();
