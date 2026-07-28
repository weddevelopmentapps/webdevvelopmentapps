/* ============================================================
   Public screens — landing (hero, journey selector, service
   explorer, stats, methodology, governance, footer) + login.
   ux-spec §7.1, §6.19 · it-spec §7.1-2 · Track 9 T9.13.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h, UI = RGP.ui;

    function skylineSvg(opacity) {
      var s = '<svg viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" style="position:absolute;inset-inline:0;bottom:0;width:100%;height:70%;opacity:' + (opacity || 1) + '" aria-hidden="true">' +
        '<g fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' +
        /* Kingdom Centre — parabolic crown */
        '<path d="M700 420 V190 C700 120 715 84 745 62 C775 84 790 120 790 190 V420"/>' +
        '<path d="M714 180 C718 140 728 112 745 96 C762 112 772 140 776 180 L776 214 C766 232 724 232 714 214 Z"/>' +
        '<path d="M722 66 h46 M700 260 h90 M700 320 h90"/>' +
        /* Al Faisaliah — tapered pyramid + sphere */
        '<path d="M940 420 L985 96 L1030 420"/>' +
        '<circle cx="985" cy="120" r="12"/>' +
        '<path d="M985 84 v-20 M955 300 h60 M947 360 h76"/>' +
        /* PIF tower / KAFD cluster */
        '<path d="M540 420 V180 L575 160 V420 M575 205 h-35 M575 260 h-35 M575 315 h-35"/>' +
        '<path d="M600 420 V240 h40 V420 M600 285 h40 M600 330 h40"/>' +
        '<path d="M460 420 V265 l30 -18 V420 M460 300 h30 M460 345 h30"/>' +
        '<path d="M840 420 V250 h44 V420 M840 292 h44 M840 336 h44"/>' +
        '<path d="M1090 420 V230 l38 14 V420 M1090 275 h38 M1090 322 h38"/>' +
        '<path d="M1160 420 V300 h34 V420 M1160 342 h34"/>' +
        '<path d="M380 420 V310 h36 V420 M380 350 h36"/>' +
        '<path d="M1230 420 V330 l28 -14 V420"/>' +
        '<path d="M300 420 V350 h30 V420"/>' +
        /* low fabric + palms */
        '<path d="M120 420 v-36 h44 v36 M196 420 v-52 h36 v52 M1310 420 v-44 h40 v44 M1390 420 v-30 h36 v30"/>' +
        '<path d="M250 420 v-26 M250 394 c-10 -12 -24 -16 -34 -14 M250 394 c10 -12 24 -16 34 -14 M250 394 c-4 -16 -2 -26 6 -34 M250 394 c2 -16 -2 -26 -8 -34"/>' +
        '<path d="M1470 420 v-26 M1470 394 c-10 -12 -24 -16 -34 -14 M1470 394 c10 -12 24 -16 34 -14 M1470 394 c-4 -16 -2 -26 6 -34"/>' +
        '</g>' +
        /* ground hairline */
        '<path d="M0 419 H1600" stroke="rgba(255,255,255,.22)" stroke-width="1"/>' +
        '</svg>';
      return h("div", { html: s, style: { position: "absolute", inset: "0", pointerEvents: "none" } });
    }
    RGP.skylineSvg = skylineSvg;


  /* ---------------- landing ---------------- */
  function landing() {
    var S = RGP.store.state;
    var approvedCount = S.requests.filter(function (r) { return r.decision && r.decision.type === "approved"; }).length;
    var kpis = RGP.kpi.compute();

    var phaseFilter = null;
    var svcSearch = "";
    var svcSection, chipsRow;

    function svcCards() {
      var list = S.services.filter(function (s) {
        if (phaseFilter && s.phase !== phaseFilter) return false;
        if (svcSearch) {
          var hay = (s.name.ar + " " + s.name.en + " " + td(s.description)).toLowerCase();
          if (hay.indexOf(svcSearch.toLowerCase()) < 0) return false;
        }
        return true;
      });
      if (!list.length) return UI.empty("search", { ar: "لا توجد خدمات مطابقة", en: "No matching services" },
        { ar: "جرّب تعديل البحث أو عوامل التصفية.", en: "Try adjusting your search or filters." }, null, true);
      return h("div.svc-grid.reveal", null, list.map(function (s) {
        return h("button.svc-card", { onclick: function () { serviceModal(s); } },
          h("div.flex.between.g1", null,
            h("span.sc-icon", null, UI.icon(svcIcon(s), 20)),
            s.gigaFastTrack ? UI.gigaBadge() : null),
          h("h4", null, td(s.name)),
          h("div.t-caption.mut", { style: { fontWeight: 500 } }, td(RGP.categoryLabel(s.category)) + " · " + t("phase." + s.phase)),
          h("div.sc-meta", null,
            h("span.t-footnote.mut.flex.g05", null, UI.icon("clock", 13),
              RGP.fmtWorkdays(s.slaDays)),
            h("span.t-footnote.mut.flex.g05", null, UI.icon("docs", 13),
              h("span.num", null, String((s.requiredDocuments || []).length)),
              RGP.i18n.lang === "ar" ? " مستندات" : " documents")));
      }));
    }

    function svcIcon(s) {
      var m = { planning: "map", building: "building", infrastructure: "bolt", operation: "key",
                environment: "leaf", enablement: "crane", investment: "briefcase" };
      return m[s.category] || "doc";
    }

    function refreshSvc() {
      svcSection.innerHTML = "";
      svcSection.appendChild(svcCards());
      RGP.$$(".chip", chipsRow).forEach(function (c) {
        c.classList.toggle("active", c.dataset.phase === String(phaseFilter));
      });
    }

    function serviceModal(s) {
      UI.modal({
        title: s.name, size: "lg",
        body: h("div", null,
          h("div.flex.g15.wrap.mbe-2", null,
            h("span.pill.plain", null, td(RGP.categoryLabel(s.category))),
            h("span.pill.info", null, t("phase." + s.phase)),
            s.gigaFastTrack ? UI.gigaBadge() : null,
            h("span.sla-chip.ok", null, UI.icon("clock", 12),
              t("common.sla") + ": " + RGP.fmtWorkdays(s.slaDays))),
          h("p.t-body.mbe-3", null, td(s.description)),
          h("div.grid.cols-2", null,
            h("div", null,
              h("div.t-headline.mbe-1", null, t("wizard.prereqs")),
              h("ul", null, (s.prerequisites || []).map(function (p) {
                return h("li.flex.g1.t-sub", { style: { alignItems: "flex-start", padding: "4px 0" } },
                  h("span.ok-fg", { style: { marginTop: "3px" } }, UI.icon("check", 14)), td(p));
              }))),
            h("div", null,
              h("div.t-headline.mbe-1", null, t("req.documents")),
              h("ul", null, (s.requiredDocuments || []).map(function (d) {
                return h("li.flex.g1.t-sub", { style: { alignItems: "flex-start", padding: "4px 0" } },
                  h("span.mut", { style: { marginTop: "3px" } }, UI.icon("doc", 14)),
                  h("span", null, td(d.name),
                    h("span.t-caption.mut.num", { style: { marginInlineStart: "6px" } }, (d.formats || []).join(" ").toUpperCase())));
              })))),
          h("div.well.card-pad-dense.mbs-3.flex.g2.wrap", null,
            h("span.t-footnote.mut", null, t("common.fees") + ": "),
            h("span.t-footnote", null, s.fees && s.fees.model !== "none" ? td(s.fees.note) : (RGP.i18n.lang === "ar" ? "لا يترتب على هذه الخدمة رسوم" : "No fees for this service")),
            h("span.grow"),
            (s.supportingEntities || []).map(function (eid) {
              return h("span.pill.plain.sm", null, td(RGP.entityName(eid)));
            }))),
        actions: function (close) {
          return [
            h("button.btn.secondary", { onclick: close }, t("common.close")),
            h("button.btn.primary", {
              onclick: function () {
                close();
                if (RGP.auth.current()) RGP.router.go("#/wizard?service=" + s.id);
                else RGP.router.go("#/login");
              }
            }, t("landing.cta"), UI.fwd(16))
          ];
        }
      });
    }

    /* hero — line-art Riyadh skyline (Kingdom Centre, Al Faisaliah) over the
       sovereign gradient; drawn locally, no external imagery */

    var hero = h("section.hero", null,
      window.ASSETS.hero ? h("img.hero-photo", { src: window.ASSETS.hero, alt: "" }) : h("div.hero-fallback"),
      RGP.skylineSvg(0.85),
      h("div.pub-section", null,
        h("div.kicker", null, t("brand.owner")),
        h("h1", null, t("landing.heroTitle")),
        h("p.hero-sub", null, t("landing.heroSub")),
        h("div.flex.g15.mbs-4.wrap", null,
          h("a.btn.primary.lg", { href: RGP.auth.current() ? "#/wizard" : "#/login" }, t("landing.cta"), UI.fwd(18)),
          h("a.btn.secondary.lg", {
            href: "#services",
            style: { background: "rgba(255,255,255,.1)", borderColor: "rgba(255,255,255,.3)", color: "#fff" },
            onclick: function (e) { e.preventDefault(); document.getElementById("services").scrollIntoView({ behavior: "smooth" }); }
          }, t("landing.explore"))),
        h("div.mbs-6", null,
          h("div.t-headline", { style: { color: "rgba(255,255,255,.85)" } }, t("landing.journeyTitle")),
          h("div.t-footnote", { style: { color: "rgba(255,255,255,.6)" } }, t("landing.journeySub"))),
        h("div.journey-cards", null, ["before", "during", "after"].map(function (ph, i) {
          var descs = {
            before: { ar: "القرار المساحي، طلب التخطيط، الدراسات التخطيطية، الاعتماد الأولي للمخططات.", en: "Survey decision, planning request, planning studies, initial plan approval." },
            during: { ar: "رخص البناء، تصاريح التمكين الإنشائي، البنية التحتية، التصاريح البيئية.", en: "Building permits, construction enablement, infrastructure, environmental permits." },
            after: { ar: "رخص التشغيل والأنشطة، الفعاليات، الامتثال الدوري، التجديد أو الإنهاء.", en: "Operating licenses, events, periodic compliance, renewal or exit." }
          };
          return h("button.journey-card", {
            onclick: function () {
              phaseFilter = ph; refreshSvc();
              document.getElementById("services").scrollIntoView({ behavior: "smooth" });
            }
          },
            h("div.jc-num.num", null, "0" + (i + 1)),
            h("h3", null, t("phase." + ph)),
            h("p", null, td(descs[ph])));
        }))));

    /* stats band */
    var stats = h("section.stats-band", null,
      h("div.pub-section", null,
        h("div.grid", null,
          statBig(kpis.enabledProjects, t("landing.statsProjects")),
          statBig(S.services.length, t("landing.statsServices")),
          statBig(kpis.onTimePct, t("landing.statsOnTime"), "%"),
          statBig(kpis.avgProcessing, t("landing.statsAvg")))));

    function statBig(v, label, suffix) {
      var el = h("div.stat-big", null, h("div.v", null, "0"), h("div.l", null, label));
      UI.countUp(RGP.$(".v", el), v, { dec: suffix ? 0 : (v % 1 ? 1 : 0), suffix: suffix || "" });
      return el;
    }

    /* services explorer */
    chipsRow = h("div.flex.g1.wrap", null,
      h("button.chip" + (phaseFilter == null ? ".active" : ""), {
        dataset: { phase: "null" },
        onclick: function () { phaseFilter = null; refreshSvc(); }
      }, t("common.all")),
      ["before", "during", "after"].map(function (ph) {
        return h("button.chip", { dataset: { phase: ph }, onclick: function () { phaseFilter = ph; refreshSvc(); } }, t("phase." + ph));
      }));

    svcSection = h("div.mbs-3");
    svcSection.appendChild(svcCards());

    var services = h("section.pub-section#services", { style: { paddingBlock: "72px 0" } },
      h("div.kicker", null, t("brand.short")),
      h("h2.t-title1", null, t("landing.servicesTitle")),
      h("p.t-body.mut.mbs-1", { style: { maxWidth: "620px" } }, t("landing.servicesSub")),
      h("div.flex.g2.mbs-3.wrap", null,
        h("div.topbar-search", { style: { marginInlineStart: "0" } },
          UI.icon("search", 18),
          h("input", {
            type: "search", style: { width: "min(520px, 80vw)" },
            placeholder: RGP.i18n.lang === "ar" ? "ابحث عن خدمة…" : "Search services…",
            oninput: RGP.debounce(function (e) { svcSearch = e.target.value; refreshSvc(); }, 200)
          })),
        chipsRow),
      svcSection);

    /* five official journeys (it-spec AC2) */
    var journeysStrip = h("section.pub-section", { style: { paddingBlock: "72px 0" } },
      h("div.kicker", null, RGP.i18n.lang === "ar" ? "الدليل الاسترشادي للمطور والمستثمر العقاري" : "The developer & investor guide"),
      h("h2.t-title1", null, RGP.i18n.lang === "ar" ? "الرحلات الرسمية الخمس" : "The five official journeys"),
      h("div.grid.mbs-3", { style: { gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" } },
        (S.journeys || []).map(function (jr) {
          return h("a.svc-card", { href: RGP.auth.current() ? "#/portal/journeys" : "#/login", style: { textDecoration: "none", color: "inherit" } },
            h("span.sc-icon", null, UI.icon(jr.id === "planning" ? "map" : jr.id === "building" ? "building" : jr.id === "investor" ? "briefcase" : jr.id === "operation" ? "key" : "hammer", 20)),
            h("h4", null, td(jr.name)),
            h("div.t-caption.mut.clamp2", { style: { fontWeight: 500 } }, td(jr.audience)),
            h("div.sc-meta", null,
              h("span.t-footnote.mut.flex.g05", null, UI.icon("layers", 13),
                h("span.num", null, String(jr.steps.length)), RGP.i18n.lang === "ar" ? " خطوات" : " steps"),
              h("span.pill.info.sm", null, t("phase." + jr.phase))));
        })));

    /* public Riyadh projects map (Track 9 — الواجهة الرئيسية) */
    var publicMap = h("section.pub-section#rmap", { style: { paddingBlock: "72px 0" } },
      h("div.kicker", null, t("brand.owner")),
      h("h2.t-title1", null, RGP.i18n.lang === "ar" ? "خريطة المشاريع الكبرى في الرياض" : "The giga-projects map of Riyadh"),
      h("p.t-body.mut.mbs-1", { style: { maxWidth: "620px" } },
        RGP.i18n.lang === "ar"
          ? "المشاريع المسجلة في السجل الموحد لدى مكتب المشاريع الكبرى، بحسب حالتها ومرحلتها."
          : "Projects in the unified registry of the Giga Projects Office, by status and phase."),
      h("div.mbs-3", null, RGP.map.render({ projects: S.projects, showLabels: true })));

    /* how it works */
    var how = h("section.pub-section", { style: { paddingBlock: "88px 0" } },
      h("h2.t-title1", null, t("landing.howTitle")),
      h("div.how-steps.mbs-4", null, [1, 2, 3, 4].map(function (n) {
        return h("div.how-step", null,
          h("div.h-num.num", null, String(n)),
          h("div.t-headline", null, t("landing.how" + n)));
      })));

    /* governance & methodology */
    var methodology = h("section.pub-section", { style: { paddingBlock: "88px 0" } },
      h("div.grid.cols-21", null,
        h("div.card-lg.elev-1.card-pad", null,
          h("div.kicker", null, RGP.i18n.lang === "ar" ? "منهجية العمل التشغيلية" : "Operating methodology"),
          h("h3.t-title2.mbe-2", null, t("landing.govTitle")),
          h("p.t-sub.mut.mbe-3", null, t("landing.govSub")),
          h("div.grid.cols-4", { style: { gap: "10px" } },
            [{ ar: "تسجيل المشروع", en: "Register project" }, { ar: "تحديد الخدمات", en: "Define services" },
             { ar: "توزيع الطلبات", en: "Distribute requests" }, { ar: "التنسيق بين الجهات", en: "Coordinate entities" },
             { ar: "معالجة التحديات", en: "Resolve challenges" }, { ar: "متابعة التنفيذ", en: "Track delivery" },
             { ar: "قياس الأداء", en: "Measure performance" }, { ar: "إصدار التقارير", en: "Issue reports" }
            ].map(function (s, i) {
              return h("div.well.card-pad-dense", null,
                h("div.t-caption.accent.num", null, RGP.zeroPad(i + 1, 2)),
                h("div.t-footnote", { style: { fontWeight: 600 } }, td(s)));
            }))),
        h("div.card-lg.elev-1.card-pad", null,
          h("div.kicker", null, RGP.i18n.lang === "ar" ? "نموذج الحوكمة" : "Governance model"),
          h("h3.t-title3.mbe-2", null, RGP.i18n.lang === "ar" ? "أطراف منظومة الحوكمة" : "Governance parties and roles"),
          [{ i: "building", t: { ar: "مكتب المشاريع الكبرى", en: "Giga Projects Office" }, d: { ar: "يدير المنصة ويشرف على الأولويات والتصعيد", en: "Runs the platform and oversees priority and escalation" } },
           { i: "shield", t: { ar: "أمانة منطقة الرياض", en: "The Amanah" }, d: { ar: "تدرس الطلبات وتصدر القرارات ضمن المدد", en: "Reviews requests and decides within SLAs" } },
           { i: "globe", t: { ar: "الجهات الحكومية والخارجية", en: "Government & external entities" }, d: { ar: "تقدم المرئيات عبر قنوات تكامل موحدة", en: "Provide clearances via unified channels" } },
           { i: "tower", t: { ar: "المشاريع الكبرى", en: "Giga projects" }, d: { ar: "تقدم طلباتها عبر المنصة وتتابع حالتها", en: "Submit their requests via the platform and track their status" } }
          ].map(function (g) {
            return h("div.flex.g15", { style: { padding: "10px 0", alignItems: "flex-start" } },
              h("span.sc-icon", null, UI.icon(g.i, 20)),
              h("div", null,
                h("div.t-headline", null, td(g.t)),
                h("div.t-caption.mut", { style: { fontWeight: 500 } }, td(g.d))));
          }))));

    /* entities strip */
    var entities = h("section.pub-section", { style: { paddingBlock: "48px 0" } },
      h("div.hairline-t", { style: { paddingBlock: "32px 0" } },
        h("div.t-footnote.mut.mbe-2", { style: { textAlign: "center" } }, t("landing.entitiesTitle")),
        h("div.flex.g3.wrap", { style: { justifyContent: "center", opacity: ".75" } },
          RGP.store.state.settings.entities.filter(function (e) { return e.type === "external"; }).slice(0, 8)
            .map(function (e) { return h("span.t-footnote.mut", { style: { fontWeight: 600 } }, td(e.name)); }))));

    /* footer */
    var footer = h("footer.pub-footer", null,
      h("div.pub-section", null,
        h("div.cols", null,
          h("div", null,
            h("div.flex.g15.mbe-2", null,
              h("img", { src: window.ASSETS.logo, style: { width: "44px", borderRadius: "50%" }, alt: "" }),
              h("div", null,
                h("div", { style: { color: "#fff", fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "14px" } }, t("brand.name")),
                h("div.t-caption", { style: { color: "rgba(255,255,255,.55)", fontWeight: 500 } }, t("brand.owner") + " · Riyadh Region Municipality"))),
            h("p", { style: { fontSize: "12.5px", lineHeight: 1.8, color: "rgba(255,255,255,.6)", maxWidth: "380px" } },
              RGP.i18n.lang === "ar"
                ? "منصة موحدة تقدم من خلالها أمانة منطقة الرياض الخدمات البلدية للمشاريع الكبرى وتتابعها وفق مدد زمنية معتمدة، إسهامًا في تحقيق مستهدفات رؤية المملكة 2030."
                : "A unified platform through which Riyadh Region Municipality delivers and tracks municipal services for giga projects within approved timelines, in support of Saudi Vision 2030.")),
          h("div", null, h("h5", null, RGP.i18n.lang === "ar" ? "المنصة" : "Platform"),
            h("a", { href: "#/" }, RGP.i18n.lang === "ar" ? "الرئيسية" : "Home"),
            h("a", { href: "#services", onclick: function (e) { e.preventDefault(); document.getElementById("services").scrollIntoView(); } }, t("landing.servicesTitle")),
            h("a", { href: "#/login" }, t("common.signin"))),
          h("div", null, h("h5", null, RGP.i18n.lang === "ar" ? "الرحلات" : "Journeys"),
            h("a", { href: "#/login" }, t("phase.before")),
            h("a", { href: "#/login" }, t("phase.during")),
            h("a", { href: "#/login" }, t("phase.after"))),
          h("div", null, h("h5", null, RGP.i18n.lang === "ar" ? "الدعم" : "Support"),
            h("a", { href: "#/login" }, RGP.i18n.lang === "ar" ? "مركز المساعدة 940" : "Help center 940"),
            h("a", { href: "#/login" }, RGP.i18n.lang === "ar" ? "دليل المطور والمستثمر" : "Developer & investor guide"),
            h("a", { href: "#/login" }, RGP.i18n.lang === "ar" ? "بلاغ عن تحدٍّ" : "Report a challenge"))),
        h("div.hairline-t.mbs-4", { style: { paddingBlock: "20px 0", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" } },
          h("span", { style: { fontSize: "11.5px", color: "rgba(255,255,255,.5)" } },
            "© 2026 " + (RGP.i18n.lang === "ar" ? "أمانة منطقة الرياض — جميع الحقوق محفوظة" : "Riyadh Region Municipality — all rights reserved")),
          h("span.grow"),
          h("span.demo-note", { style: { color: "rgba(255,255,255,.45)" } }, t("common.demo")))));

    /* public nav */
    var nav = h("nav.pub-nav", null,
      h("img", { src: window.ASSETS.logo, style: { width: "40px", height: "40px", borderRadius: "50%" }, alt: t("brand.owner") }),
      h("div", null,
        h("div", { style: { fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "13.5px", lineHeight: 1.3 } }, t("brand.short")),
        h("div.t-caption.mut", { style: { fontWeight: 500 } }, t("brand.owner"))),
      h("div.links", null,
        h("a", { href: "#/" }, RGP.i18n.lang === "ar" ? "الرئيسية" : "Home"),
        h("a", { href: "#services", onclick: function (e) { e.preventDefault(); document.getElementById("services").scrollIntoView({ behavior: "smooth" }); } }, t("landing.servicesTitle")),
        h("a", { href: "#rmap", onclick: function (e) { e.preventDefault(); var el2 = document.getElementById("rmap"); if (el2) el2.scrollIntoView({ behavior: "smooth" }); } }, RGP.i18n.lang === "ar" ? "خريطة المشاريع" : "Projects map")),
      h("button.iconbtn", { style: { marginInlineStart: "auto" }, "aria-label": "language", onclick: function () { RGP.i18n.toggle(); RGP.router.render(); } }, UI.icon("lang", 20)),
      h("a.btn.primary.sm", { href: "#/login", style: { marginInlineStart: "8px" } }, t("common.signin")));
    nav.querySelector(".links").style.marginInlineStart = "auto";

    return h("div.page-in", null, nav, hero, stats, services, journeysStrip, publicMap, how, methodology, entities, footer);
  }

  /* ---------------- login ---------------- */
  function login() {
    var email = h("input.input", { type: "email", id: "login-email", placeholder: "name@example.sa", autocomplete: "username", style: { direction: "ltr", textAlign: "start" } });
    var pass = h("input.input", { type: "password", id: "login-pass", placeholder: "••••••••", autocomplete: "current-password", style: { direction: "ltr", textAlign: "start" } });
    var errBox = h("div.err-msg", { hidden: true }, UI.icon("alert", 13), h("span", null, t("login.badCreds")));

    function doLogin(idOrEmail, pw) {
      try {
        var user = RGP.auth.signIn(idOrEmail, pw);
        RGP.router.go(RGP.auth.homeRoute(user));
        UI.toast("ok", { ar: "تم تسجيل الدخول: " + td(user.name), en: "Signed in: " + td(user.name) });
      } catch (e) {
        errBox.hidden = false;
      }
    }

    var groups = [
      { label: t("login.customers"), roles: ["project_rep"] },
      { label: t("login.staff"), roles: ["amanah_specialist", "platform_manager"] },
      { label: RGP.i18n.lang === "ar" ? "الجهات الخارجية والمشاهدة" : "External & viewer", roles: ["external_entity", "viewer"] }
    ];

    var brand = h("div.login-brand", null,
      h("svg.brand-pattern", { html: sadu() }),
      RGP.skylineSvg(0.5),
      h("div.flex.g15", null,
        h("img", { src: window.ASSETS.logo, style: { width: "52px", height: "52px", borderRadius: "50%", background: "#fff" }, alt: "" }),
        h("div", null,
          h("div", { style: { fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px" } }, t("brand.owner")),
          h("div", { style: { fontSize: "11px", opacity: .7, letterSpacing: ".5px" } }, "RIYADH REGION MUNICIPALITY"))),
      h("div", null,
        h("h1", { style: { fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "clamp(24px, 2.6vw, 34px)", lineHeight: 1.3, maxWidth: "420px" } }, t("brand.name")),
        h("p", { style: { color: "rgba(255,255,255,.72)", marginTop: "12px", fontSize: "14px", maxWidth: "380px" } }, t("brand.tagline"))));

    function sadu() {
      /* subtle geometric sadu-inspired pattern, 6% white */
      var cells = "";
      for (var y = 0; y < 14; y++) for (var x = 0; x < 10; x++) {
        var cx2 = x * 90 + (y % 2) * 45, cy2 = y * 78;
        cells += '<path d="M' + cx2 + " " + cy2 + " l32 -26 l32 26 l-32 26 z\" fill=\"none\" stroke=\"rgba(255,255,255,.06)\" stroke-width=\"1.4\"/>";
      }
      return '<svg width="100%" height="100%" viewBox="0 0 900 1100" preserveAspectRatio="xMidYMid slice">' + cells + "</svg>";
    }

    var form = h("div.login-form", null,
      h("a.t-footnote.mut.flex.g05", { href: "#/", style: { marginBottom: "24px", display: "inline-flex" } },
        UI.icon(RGP.i18n.lang === "ar" ? "chevS" : "back", 14), RGP.i18n.lang === "ar" ? "العودة للرئيسية" : "Back to home"),
      h("h2.t-title2", null, t("login.title")),
      h("p.t-sub.mut.mbs-1.mbe-3", null, t("login.sub")),
      h("button.btn.secondary.lg.block", {
        onclick: function () {
          UI.toast("info", { ar: "النفاذ الوطني الموحد", en: "Nafath SSO" }, { ar: t("login.nafathNote"), en: t("login.nafathNote") });
        }
      }, UI.icon("shield", 20), t("login.nafath")),
      h("div.flex.g2", { style: { margin: "20px 0", alignItems: "center" } },
        h("span.grow.hairline-t"), h("span.t-caption.mut", null, RGP.i18n.lang === "ar" ? "أو" : "or"), h("span.grow.hairline-t")),
      h("div.field", null, h("label", { for: "login-email" }, t("login.email")), email),
      h("div.field", null, h("label", { for: "login-pass" }, t("login.password")), pass, errBox),
      h("button.btn.primary.lg.block", {
        onclick: function () { doLogin(email.value.trim(), pass.value); }
      }, t("common.signin")),
      h("div.hairline-t.mbs-4", { style: { paddingTop: "20px" } },
        h("div.flex.g1.mbe-2", null,
          h("span.t-footnote.mut", null, t("login.demoIdentities")),
          UI.simBadge()),
        groups.map(function (g) {
          var users = RGP.store.state.users.filter(function (u) { return g.roles.indexOf(u.role) >= 0 && u.showInLogin !== false; });
          return h("div.mbe-2", null,
            h("div.t-caption.mut.mbe-1", { style: { fontWeight: 600 } }, g.label),
            h("div.grid", { style: { gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" } },
              users.map(function (u) {
                return h("button.id-card", { onclick: function () { doLogin(u.id, null); } },
                  UI.avatar(u),
                  h("div.grow", null,
                    h("div.t-footnote.ellipsis", { style: { fontWeight: 600 } }, td(u.name)),
                    h("div.t-caption.mut.ellipsis", { style: { fontWeight: 500 } },
                      (u.personaType ? t("persona." + u.personaType) : t("role." + u.role)) +
                      (u.delegatedBy ? " · " + (RGP.i18n.lang === "ar" ? "بالإنابة" : "delegate") : ""))));
              })));
        }),
        h("div.t-caption.mut", { style: { fontWeight: 500 } },
          RGP.i18n.lang === "ar" ? "كلمة المرور لجميع الحسابات التجريبية: " : "Password for all demo accounts: ",
          h("b.num", null, "Demo@2026"))));

    pass.addEventListener("keydown", function (e) { if (e.key === "Enter") doLogin(email.value.trim(), pass.value); });

    return h("div.login-wrap.page-in", null, brand, h("div.login-form-col", null, form));
  }

  RGP.router.register("#/", null, landing);
  RGP.router.register("#/login", null, login);
})();
