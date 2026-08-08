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

    var svcExpanded = false;
    function svcCards() {
      var list = S.services.filter(function (s) {
        if (phaseFilter && s.phase !== phaseFilter) return false;
        if (svcSearch) {
          var hay = (s.name.ar + " " + s.name.en + " " + td(s.description)).toLowerCase();
          if (hay.indexOf(svcSearch.toLowerCase()) < 0) return false;
        }
        return true;
      });
      /* the portal keeps this section compact — first ten, then expand */
      var total = list.length, capped = false;
      if (!svcExpanded && !svcSearch && total > 10) { list = list.slice(0, 10); capped = true; }
      if (!list.length) return UI.empty("search", { ar: "لا توجد خدمات مطابقة", en: "No matching services" },
        { ar: "جرّب تعديل البحث أو عوامل التصفية.", en: "Try adjusting your search or filters." }, null, true);
      var moreBtn = capped ? h("div.flex.mbs-3", { style: { justifyContent: "center" } },
        h("button.gov-all-btn", {
          style: { background: "transparent", border: "1.5px solid var(--gov-emerald)", color: "var(--gov-emerald)", minHeight: "44px" },
          onclick: function () { svcExpanded = true; refreshSvc(); }
        }, (RGP.i18n.lang === "ar" ? "عرض جميع الخدمات (" : "Show all services ("),
          h("span.num", null, String(total)), ")")) : null;
      return h("div", null, h("div.gov-cards", null, list.map(function (s) {
        return h("button.gov-card", { onclick: function () { serviceModal(s); } },
          h("span.gi", null, UI.icon(svcIcon(s), 24)),
          h("h4", null, td(s.name)),
          h("div.gc-sub", null, td(RGP.categoryLabel(s.category)) + " · " + t("phase." + s.phase)),
          h("div.gc-meta", null,
            h("span.flex.g05", null, UI.icon("clock", 12), h("span.num-date", null, RGP.fmtWorkdays(s.slaDays))),
            h("span.flex.g05", null, UI.icon("docs", 12),
              h("span.num", null, String((s.requiredDocuments || []).length)),
              RGP.i18n.lang === "ar" ? " مستندات" : " docs"),
            s.gigaFastTrack ? h("span", { style: { color: "var(--sand-deep)" } }, RGP.i18n.lang === "ar" ? "مسار أولوية" : "Fast-track") : null));
      })), moreBtn);
    }

    function svcIcon(s) {
      var m = { planning: "map", building: "building", infrastructure: "bolt", operation: "key",
                environment: "leaf", enablement: "crane", investment: "briefcase" };
      return m[s.category] || "doc";
    }

    function refreshSvc() {
      svcSection.innerHTML = "";
      svcSection.appendChild(svcCards());
      RGP.$$("button", chipsRow).forEach(function (c) {
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
                    h("span.t-caption.mut.num", { style: { marginInline: "8px" } }, (d.formats || []).join(" · ").toUpperCase())));
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

    /* ================================================================
       Gov chrome — the platform as a section of alriyadh.gov.sa:
       utility bar, transparent header over the emerald gradient hero,
       geometric backdrop, «تحدث معنا» tab. Recreated in our own code.
       ================================================================ */
    var ar = RGP.i18n.lang === "ar";
    function toastDemo() {
      UI.toast("info", { ar: "قسم من بوابة أمانة منطقة الرياض — خارج نطاق هذا العرض التجريبي", en: "Part of the Riyadh Municipality portal — outside this demo's scope" });
    }

    var utilbar = h("div.gov-utilbar", null,
      h("button", { onclick: function () { RGP.router.go("#/login"); } }, UI.icon("users", 14), ar ? "التسجيل في البوابة" : "Portal Login"),
      h("a", { href: "#/login" }, UI.icon("user", 14), ar ? "تسجيل الدخول" : "Login"),
      h("button.u-hide-sm", { onclick: toastDemo }, UI.icon("send", 14), ar ? "بريد الموظفين" : "Email"),
      h("button.u-hide-sm", { onclick: toastDemo }, ar ? "مؤشر جودة الهواء" : "Air Quality Index"),
      h("span.u-hide-sm.num", { style: { display: "inline-flex", alignItems: "center", gap: "6px" } }, UI.icon("drop", 14), "44°C"),
      h("span.sep"),
      h("button.u-hide-sm", { onclick: toastDemo }, UI.icon("doc", 14), ar ? "تطبيق مدينتي" : "My City"),
      h("button", { onclick: function () { if (RGP.palette) RGP.palette.open(); } }, UI.icon("infoC", 14), ar ? "التساؤلات" : "Questions"));

    /* abstract geometric backdrop — our own polygons in the portal's manner */
    var geo = h("div.gov-geo", { html:
      '<svg width="100%" height="100%" viewBox="0 0 1400 480" preserveAspectRatio="xMidYMid slice">' +
      '<g fill="#fff">' +
      '<polygon points="150,0 420,0 210,480 -60,480" opacity="0.045"/>' +
      '<polygon points="480,0 640,0 430,480 270,480" opacity="0.03"/>' +
      '<polygon points="1050,0 1400,0 1400,300" opacity="0.04"/>' +
      '<polygon points="880,480 1400,480 1400,360" opacity="0.035"/>' +
      '</g></svg>' });

    var navItems = [
      { l: { ar: "عن الأمانة", en: "About Us" }, chev: true, hide: false },
      { l: { ar: "قطاعات التنمية المستدامة", en: "Development Sectors" }, chev: true, hide: true },
      { l: { ar: "الخدمات الإلكترونية", en: "Services" }, chev: true, active: true },
      { l: { ar: "الإعلام", en: "Media" }, chev: true, hide: true },
      { l: { ar: "البيانات المفتوحة", en: "Open Data" }, chev: true, hide: true },
      { l: { ar: "المشاركة الإلكترونية", en: "Participation" }, chev: false, hide: false }
    ];
    var govHeader = h("header.gov-header", null,
      h("a.gov-brand", { href: "#/" },
        h("img", { src: window.ASSETS.logo, alt: t("brand.owner") }),
        h("span", null,
          h("span.b-ar", { style: { display: "block" } }, t("brand.owner")),
          h("span.b-en", { style: { display: "block" } }, "RIYADH REGION MUNICIPALITY"))),
      h("nav.gov-nav", null,
        navItems.map(function (it) {
          return h("a" + (it.active ? ".active" : "") + (it.hide ? ".n-hide" : ""), {
            href: "#services",
            onclick: function (e) {
              e.preventDefault();
              if (it.active) document.getElementById("services").scrollIntoView({ behavior: "smooth" });
              else toastDemo();
            }
          }, td(it.l), it.chev ? UI.icon("chevD", 13) : null);
        }),
        h("span.gov-icons", null,
          h("button.iconbtn", { "aria-label": "language", onclick: function () { RGP.i18n.toggle(); } },
            h("span", { style: { fontFamily: "var(--ff-display)", fontSize: "13px", fontWeight: "600" } }, ar ? "EN" : "ع")),
          h("button.iconbtn", { "aria-label": t("prefs.title"), onclick: function () { if (RGP.prefs) RGP.prefs.openSheet(); } }, UI.icon("settings", 18)),
          h("button.iconbtn", { "aria-label": t("common.search"), onclick: function () { if (RGP.palette) RGP.palette.open(); } }, UI.icon("search", 18)))));

    var hero = h("section.gov-hero", null,
      geo,
      govHeader,
      h("button.gov-chat-tab", { onclick: function () { if (RGP.palette) RGP.palette.open(); } },
        h("span.dot", null, UI.icon("infoC", 13)), ar ? "تحدث معنا" : "Live Chat"),
      h("div.gov-hero-body", null,
        h("h1", null, t("landing.heroTitle")),
        h("p.g-sub", null, t("landing.heroSub")),
        h("div.g-ctas", null,
          h("a.btn.primary.lg", { href: RGP.auth.current() ? "#/wizard" : "#/login" }, t("landing.cta"), UI.fwd(18)),
          h("a.btn.ghost.lg", {
            href: "#services",
            onclick: function (e) { e.preventDefault(); document.getElementById("services").scrollIntoView({ behavior: "smooth" }); }
          }, t("landing.explore")))));

    /* stats band — the projects label agrees with its dynamic count (تمييز العدد) */
    var projStatLabel = (function (n) {
      if (RGP.i18n.lang !== "ar") return t("landing.statsProjects");
      if (n === 1) return "مشروع كبير ممكّن";
      if (n === 2) return "مشروعان كبيران ممكّنان";
      if (n >= 3 && n <= 10) return "مشاريع كبرى ممكّنة";
      return t("landing.statsProjects");
    })(kpis.enabledProjects);
    /* «الأمانة في أرقام» — flat white stats band in the portal's manner */
    var stats = h("section.gov-sec.pub-section", null,
      h("h2.gov-title", null, ar ? "المنصة في أرقام" : "The platform in numbers"),
      h("div.grid.mbs-3", { "data-io": "group", style: { gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" } },
        statBig(kpis.enabledProjects, projStatLabel),
        statBig(S.services.length, t("landing.statsServices")),
        statBig(kpis.onTimePct, t("landing.statsOnTime"), "%"),
        statBig(kpis.avgProcessing, t("landing.statsAvg"))));

    function statBig(v, label, suffix) {
      var el = h("div.gov-card", { style: { textAlign: "center", alignItems: "center", cursor: "default", minHeight: "110px", justifyContent: "center" } },
        h("div.v.num", { style: { fontFamily: "var(--ff-display)", fontSize: "clamp(30px, 3vw, 40px)", fontWeight: "700", color: "var(--gov-emerald)" } }, "0"),
        h("div", { style: { fontFamily: "var(--ff-display)", fontSize: "12.5px", fontWeight: "500", color: "var(--mut)" } }, label));
      var opts = { dec: suffix ? 0 : (v % 1 ? 1 : 0), suffix: suffix || "" };
      if (RGP.motion && RGP.motion.countUp) RGP.motion.countUp(RGP.$(".v", el), v, opts);
      else UI.countUp(RGP.$(".v", el), v, opts);
      return el;
    }

    /* services explorer — centered portal title + audience-style pill tabs */
    var TAB_ICON = { "null": "grid", before: "map", during: "crane", after: "key" };
    chipsRow = h("div.gov-tabs", null,
      h("div.wrap2", null,
        [null, "before", "during", "after"].map(function (ph) {
          return h("button" + (phaseFilter === ph ? ".active" : ""), {
            dataset: { phase: String(ph) },
            onclick: function () { phaseFilter = ph; refreshSvc(); }
          }, UI.icon(TAB_ICON[String(ph)], 18), ph == null ? t("common.all") : t("phase." + ph));
        })));

    svcSection = h("div.mbs-3");
    svcSection.appendChild(svcCards());

    var services = h("section.gov-sec.pub-section#services", null,
      h("div", { "data-io": "" },
        h("h2.gov-title", null, t("landing.servicesTitle")),
        h("p.t-body.mut.mbs-1", { style: { maxWidth: "620px", marginInline: "auto", textAlign: "center" } }, t("landing.servicesSub"))),
      chipsRow,
      h("div.flex.mbs-2", { style: { justifyContent: "center" } },
        h("div.topbar-search", { style: { marginInlineStart: "0" } },
          UI.icon("search", 18),
          h("input", {
            type: "search", style: { width: "min(520px, 86vw)" },
            placeholder: RGP.i18n.lang === "ar" ? "ابحث عن خدمة…" : "Search services…",
            oninput: RGP.debounce(function (e) { svcSearch = e.target.value; refreshSvc(); }, 200)
          }))),
      svcSection);

    /* the five official journeys — connected canvas strip under a portal title row */
    var journeysStrip = h("section.gov-sec.pub-section", null,
      h("div.gov-title-row", { "data-io": "" },
        h("h2.gov-title", null, RGP.i18n.lang === "ar" ? "رحلات المطور والمستثمر العقاري" : "Developer & investor journeys"),
        h("a.gov-all-btn", { href: RGP.auth.current() ? "#/portal/journeys" : "#/login" },
          RGP.i18n.lang === "ar" ? "جميع الرحلات" : "All journeys", UI.fwd(14))),
      h("div.mbs-3", null,
        RGP.journeyCanvas ? RGP.journeyCanvas.compact() :
          h("div.grid", { style: { gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" } },
            (S.journeys || []).map(function (jr) {
              return h("a.gov-card", { href: RGP.auth.current() ? "#/portal/journeys" : "#/login", style: { textDecoration: "none" } },
                h("h4", null, td(jr.name)),
                h("span.num", null, String(jr.steps.length)));
            }))));

    /* impact — the portal's deep-green rounded promo panel, carrying live counters */
    var impactBand = h("section.gov-sec.impact-band.pub-section#impact", null,
      h("div.gov-panel", { "data-io": "" },
        UI.sadu({ tone: "white", opacity: 0.05 }),
        h("div", { style: { position: "relative" } },
          h("h2.gov-title", null, RGP.i18n.lang === "ar" ? "أثرٌ يُقاس بمدنٍ تُبنى" : "Impact measured in cities being built"),
          h("p.g-lede", null,
            RGP.i18n.lang === "ar"
              ? "تقليل زمن الخدمات يعني رأس مال يُستثمر أبكر، ووظائف تُدعم، وناتجًا محليًا ينمو."
              : "Faster services mean capital deployed earlier, jobs supported, and a growing city economy."),
          RGP.impact && RGP.impact.band ? RGP.impact.band("landing") : null)));

    /* «أهم مشاريع الرياض» — full-width photo tile strip */
    var strip = window.ASSETS.diriyah ? h("section.gov-sec", null,
      h("div.pub-section", null,
        h("div.gov-title-row", { "data-io": "" },
          h("h2.gov-title", null, RGP.i18n.lang === "ar" ? "أهم مشاريع الرياض الكبرى" : "Riyadh's flagship giga projects"),
          h("a.gov-all-btn", {
            href: "#rmap",
            onclick: function (e) { e.preventDefault(); var el2 = document.getElementById("rmap"); if (el2) el2.scrollIntoView({ behavior: "smooth" }); }
          }, RGP.i18n.lang === "ar" ? "جميع المشاريع" : "All projects", UI.fwd(14)))),
      h("div.gov-strip", null,
        [{ img: window.ASSETS.diriyah, t: { ar: "بوابة الدرعية", en: "Diriyah" }, s: { ar: "ثقافة وتراث", en: "Culture & heritage" } },
         { img: window.ASSETS.hero, t: { ar: "المربع الجديد", en: "New Murabba" }, s: { ar: "وسط المدينة الجديد", en: "The new downtown" } },
         { img: window.ASSETS.night, t: { ar: "مطار الملك سلمان الدولي", en: "King Salman Airport" }, s: { ar: "بنية تحتية", en: "Infrastructure" } },
         { img: window.ASSETS.metro, t: { ar: "النقل والمواصلات", en: "Transport" }, s: { ar: "شبكة النقل العام", en: "Public transit network" } },
         { img: null, t: { ar: "10 مشاريع كبرى ممكّنة", en: "10 giga projects enabled" }, s: { ar: "استعرض الخريطة", en: "View the map" } }
        ].map(function (x) {
          return h("button.gov-tile", {
            onclick: function () { var el2 = document.getElementById("rmap"); if (el2) el2.scrollIntoView({ behavior: "smooth" }); }
          },
            x.img ? h("img", { src: x.img, alt: "" }) : UI.sadu({ tone: "white", opacity: 0.08 }),
            h("span.tl", null, td(x.t), h("small", null, td(x.s))));
        }))) : null;

    /* «بوابات المنصة» — portal cards with outlined pill CTAs */
    var portals = h("section.gov-sec.pub-section", null,
      h("h2.gov-title", { "data-io": "" }, RGP.i18n.lang === "ar" ? "بوابات المنصة" : "Platform portals"),
      h("div.gov-portals", { "data-io": "group" },
        [{ img: window.ASSETS.hero, t: { ar: "بوابة المستفيدين", en: "Customer portal" },
           d: { ar: "للمطورين والمستثمرين وجهات المشاريع الكبرى: تقديم الطلبات ومتابعتها ورفع التحديات.", en: "For developers, investors and giga-project entities: submit and track requests, raise challenges." } },
         { img: window.ASSETS.metro, t: { ar: "لوحة موظفي الأمانة", en: "Municipality staff" },
           d: { ar: "قوائم العمل والدراسة والقرارات ضمن المدد المعتمدة ولوحات المؤشرات.", en: "Work queues, reviews, decisions within adopted SLAs, and KPI dashboards." } },
         { img: window.ASSETS.night, t: { ar: "الملخص التنفيذي", en: "Executive summary" },
           d: { ar: "نظرة قيادية على الأداء والأثر الاقتصادي للمنصة على مدينة الرياض.", en: "A leadership view of performance and the platform's economic impact on Riyadh." } }
        ].map(function (x) {
          return h("div.gov-portal", null,
            h("div.ph", null, h("img", { src: x.img || "", alt: "" })),
            h("div.bd", null,
              h("h4", null, td(x.t)),
              h("p", null, td(x.d)),
              h("a.pl", { href: "#/login" }, RGP.i18n.lang === "ar" ? "دخول البوابة" : "Enter portal", UI.fwd(13))));
        })));

    /* «الأدلة واللوائح» — guides band */
    var guides = h("section.gov-sec.pub-section", null,
      h("div.gov-guides", { "data-io": "" },
        h("div.gov-title-row", null,
          h("h2.gov-title", { style: { textAlign: "start" } }, RGP.i18n.lang === "ar" ? "الأدلة واللوائح" : "Guides & regulations"),
          null),
        h("div.list", null,
          h("a.gd", { href: "#services", onclick: function (e) { e.preventDefault(); document.getElementById("services").scrollIntoView({ behavior: "smooth" }); } },
            UI.icon("layers", 16), RGP.i18n.lang === "ar" ? "دليل الخدمات البلدية" : "Municipal services catalog"),
          h("button.gd", { onclick: function () { if (RGP.impact) RGP.impact.methodologyModal(); } },
            UI.icon("note", 16), RGP.i18n.lang === "ar" ? "منهجية احتساب الأثر" : "Impact methodology"),
          h("a.gd", { href: RGP.auth.current() ? "#/portal/journeys" : "#/login" },
            UI.icon("map", 16), RGP.i18n.lang === "ar" ? "دليل المطور والمستثمر العقاري" : "Developer & investor guide"),
          h("a.gd", { href: "#/login" },
            UI.icon("flag", 16), RGP.i18n.lang === "ar" ? "بلاغ عن تحدٍّ" : "Report a challenge"))));

    /* public Riyadh projects map (Track 9 — الواجهة الرئيسية) */
    var publicMap = h("section.gov-sec.pub-section#rmap", null,
      h("div", { "data-io": "" },
        h("h2.gov-title", null, RGP.i18n.lang === "ar" ? "خريطة المشاريع الكبرى في الرياض" : "The giga-projects map of Riyadh"),
        h("p.t-body.mut.mbs-1", { style: { maxWidth: "620px", marginInline: "auto", textAlign: "center" } },
          RGP.i18n.lang === "ar"
            ? "المشاريع المسجلة في السجل الموحد لدى مكتب المشاريع الكبرى، بحسب حالتها ومرحلتها."
            : "Projects in the unified registry of the Giga Projects Office, by status and phase.")),
      h("div.mbs-3", null, RGP.map.render({ projects: S.projects, showLabels: true })));

    /* how it works */
    var how = h("section.gov-sec.how-sec.pub-section", null,
      h("h2.gov-title", { "data-io": "" }, t("landing.howTitle")),
      h("div.how-steps.mbs-4", { "data-io": "group" }, [1, 2, 3, 4].map(function (n) {
        return h("div.how-step", null,
          h("div.h-num.num", null, String(n)),
          h("div.t-headline", null, t("landing.how" + n)));
      })));

    /* governance & methodology — with the heritage bleed portrait */
    var methodology = h("section.sec.pub-section", null,
      window.ASSETS.diriyah ? h("div.herit-wrap.mbe-4", null,
        h("div", { "data-io": "" },
          h("div.kicker", null, RGP.i18n.lang === "ar" ? "من الدرعية إلى المربع الجديد" : "From Diriyah to New Murabba"),
          h("h2.t-title2", null, RGP.i18n.lang === "ar" ? "خدمات بلدية بمقياس مدن المستقبل" : "Municipal services at the scale of future cities"),
          h("p.t-body.mut.mbs-1", null,
            RGP.i18n.lang === "ar"
              ? "من مواقع التراث المسجلة في اليونسكو إلى أحياء الأعمال الناشئة، تصل المنصة عشرة من كبرى مشاريع الرياض بجهة بلدية واحدة ومسار موحد للتصاريح والرخص — بمددٍ معلنة يمكن قياسها ومساءلتها."
              : "From UNESCO-listed heritage grounds to rising business districts, the platform connects ten of Riyadh's largest projects to a single municipal counterpart and one permit pathway — with published, accountable timelines.")),
        h("figure.herit-fig", { "data-io": "" },
          h("img", { src: window.ASSETS.diriyah, alt: "" }),
          h("figcaption.cap", null, RGP.i18n.lang === "ar" ? "حي الطريف التاريخي — الدرعية" : "At-Turaif historic district — Diriyah"))) : null,
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

    /* footer — the portal's deep-green sitemap footer */
    var footer = h("footer.gov-footer", null,
      h("div.cols", null,
        h("div", null,
          h("div.flex.g15.mbe-2", null,
            h("img", { src: window.ASSETS.logo, style: { width: "48px", height: "48px", borderRadius: "50%", background: "#fff", padding: "2px" }, alt: "" }),
            h("div", null,
              h("div", { style: { color: "#fff", fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px" } }, t("brand.owner")),
              h("div", { style: { fontSize: "9px", letterSpacing: "1.4px", color: "rgba(255,255,255,.6)" } }, "RIYADH REGION MUNICIPALITY"))),
          h("p", { style: { fontSize: "12.5px", lineHeight: 1.9, color: "rgba(255,255,255,.7)", maxWidth: "360px" } },
            RGP.i18n.lang === "ar"
              ? "منصة الخدمات البلدية للمشاريع الكبرى — البوابة الموحدة لتقديم الخدمات البلدية للمشاريع الكبرى في مدينة الرياض ومتابعتها."
              : "The Giga-Projects Municipal Services Platform — the unified gateway for submitting and tracking municipal services for Riyadh's giga projects."),
          h("a.gov-940", { href: "#/login" }, UI.icon("flag", 18), RGP.i18n.lang === "ar" ? "بلاغ 940" : "Report 940")),
        h("div", null, h("h5", null, RGP.i18n.lang === "ar" ? "نظرة عامة" : "Overview"),
          h("a", { href: "#/" }, RGP.i18n.lang === "ar" ? "الرئيسية" : "Home"),
          h("a", { href: "#services", onclick: function (e) { e.preventDefault(); document.getElementById("services").scrollIntoView(); } }, t("landing.servicesTitle")),
          h("a", { href: RGP.auth.current() ? "#/portal/journeys" : "#/login" }, RGP.i18n.lang === "ar" ? "رحلات المطور والمستثمر" : "Journeys")),
        h("div", null, h("h5", null, RGP.i18n.lang === "ar" ? "البوابات" : "Portals"),
          h("a", { href: "#/login" }, RGP.i18n.lang === "ar" ? "بوابة المستفيدين" : "Customer portal"),
          h("a", { href: "#/login" }, RGP.i18n.lang === "ar" ? "لوحة موظفي الأمانة" : "Staff workspace"),
          h("a", { href: "#/login" }, RGP.i18n.lang === "ar" ? "الملخص التنفيذي" : "Executive summary")),
        h("div", null, h("h5", null, RGP.i18n.lang === "ar" ? "الدعم والمساندة" : "Support"),
          h("a", { href: "#/login" }, RGP.i18n.lang === "ar" ? "مركز المساعدة" : "Help center"),
          h("a", { href: RGP.auth.current() ? "#/portal/journeys" : "#/login" }, RGP.i18n.lang === "ar" ? "دليل المطور والمستثمر" : "Developer & investor guide"),
          h("a", { href: "#/login" }, RGP.i18n.lang === "ar" ? "بلاغ عن تحدٍّ" : "Report a challenge"))),
      h("div.bottom", null,
        h("span", null, "© 2026 " + (RGP.i18n.lang === "ar" ? "أمانة منطقة الرياض — جميع الحقوق محفوظة" : "Riyadh Region Municipality — all rights reserved")),
        h("span.grow"),
        h("span", null, (RGP.i18n.lang === "ar" ? "آخر تحديث: " : "Last updated: "), h("span.num", null, "08/08/2026")),
        h("span.demo-note", null, t("common.demo"))));

    /* demo notice — consent-banner vocabulary, used honestly */
    var demoNote = null;
    try { demoNote = sessionStorage.getItem("rgp.demoAck") ? null : h("div.gov-demo-note", null,
      h("span", { style: { fontFamily: "var(--ff-display)", fontWeight: 700 } }, RGP.i18n.lang === "ar" ? "نموذج تجريبي" : "Demonstration prototype"),
      h("span.grow", { style: { flex: "1 1 260px" } },
        RGP.i18n.lang === "ar"
          ? "هذه نسخة عرض تجريبية لمنصة الخدمات البلدية للمشاريع الكبرى ببيانات افتراضية، وليست الموقع الرسمي لأمانة منطقة الرياض."
          : "This is a demonstration prototype of the Giga-Projects Municipal Services Platform with fictional data — not the official Riyadh Municipality website."),
      h("button.btn.dark.sm", {
        onclick: function (e) {
          try { sessionStorage.setItem("rgp.demoAck", "1"); } catch (err) { /* noop */ }
          var n = e.target.closest(".gov-demo-note"); if (n) n.remove();
        }
      }, RGP.i18n.lang === "ar" ? "فهمت" : "Got it")); } catch (e) { demoNote = null; }

    /* lean home page: hero → services catalog → journeys → footer */
    return h("div.page-in.gov-page", null,
      utilbar, hero,
      services, journeysStrip,
      footer, demoNote);
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
      window.ASSETS.metro ? h("img.login-photo", { src: window.ASSETS.metro, alt: "" }) : null,
      window.ASSETS.metro ? h("div.login-photo-scrim") : null,
      UI.sadu({ tone: "white", opacity: 0.06 }),
      RGP.skylineSvg(0.5),
      h("div.flex.g15", null,
        h("img", { src: window.ASSETS.logo, style: { width: "52px", height: "52px", borderRadius: "50%", background: "#fff" }, alt: "" }),
        h("div", null,
          h("div", { style: { fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "15px" } }, t("brand.owner")),
          h("div", { style: { fontSize: "11px", opacity: .7, letterSpacing: ".5px" } }, "RIYADH REGION MUNICIPALITY"))),
      h("div", null,
        h("h1", { style: { fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "clamp(24px, 2.6vw, 34px)", lineHeight: 1.3, maxWidth: "420px" } }, t("brand.name")),
        h("p", { style: { color: "rgba(255,255,255,.72)", marginTop: "12px", fontSize: "14px", maxWidth: "380px" } }, t("brand.tagline"))));

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
