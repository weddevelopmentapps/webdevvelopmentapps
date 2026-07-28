/* ============================================================
   Print engine — official A4 permit/certificate with local
   verification block, and report printing. ux-spec §6.20.
   ============================================================ */
"use strict";

(function () {
  var h = RGP.h;
  var P = RGP.print = {};

  /* deterministic 21×21 verification matrix drawn from a hash —
     a visual verification token (labeled, not a scannable QR) */
  function verifySvg(seedStr, sizeMm) {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    var N = 21;
    svg.setAttribute("viewBox", "0 0 " + N + " " + N);
    svg.setAttribute("width", (sizeMm || 20) + "mm");
    svg.setAttribute("height", (sizeMm || 20) + "mm");
    svg.setAttribute("shape-rendering", "crispEdges");
    var state = RGP.hash32(seedStr);
    function next() { state = (state * 1103515245 + 12345) >>> 0; return state; }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var corner = (x < 5 && y < 5) || (x >= N - 5 && y < 5) || (x < 5 && y >= N - 5);
      var on = corner ? ((x === 0 || y === 0 || x === 4 || y === 4 ||
                          x === N - 1 || x === N - 5 || y === N - 1 || y === N - 5) ||
                         (x >= 1 && x <= 3 && y >= 1 && y <= 3) ||
                         (x >= N - 4 && x <= N - 2 && y >= 1 && y <= 3) ||
                         (x >= 1 && x <= 3 && y >= N - 4 && y <= N - 2))
                      : (next() % 100) < 42;
      if (on) {
        var r = document.createElementNS(svgNS, "rect");
        r.setAttribute("x", x); r.setAttribute("y", y);
        r.setAttribute("width", 1); r.setAttribute("height", 1);
        r.setAttribute("fill", "#14201A");
        svg.appendChild(r);
      }
    }
    return svg;
  }

  function headerBlock(docCode) {
    return h("div", null,
      h("div.p-head", null,
        h("img", { src: window.ASSETS.logo, alt: "" }),
        h("div.p-org", null,
          h("div.o1", null, "أمانة منطقة الرياض"),
          h("div.o2", null, "RIYADH REGION MUNICIPALITY"),
          h("div.o3", null, "منصة الرياض الموحدة لتمكين المشاريع الكبرى")),
        verifySvg(docCode, 22)),
      h("hr.p-rule"), h("hr.p-rule2"));
  }

  function openPrint(sheet) {
    var root = RGP.$("#print-root");
    root.innerHTML = "";
    root.appendChild(sheet);
    root.setAttribute("aria-hidden", "false");
    setTimeout(function () {
      window.print();
      root.setAttribute("aria-hidden", "true");
    }, 60);
  }

  /* ---------------- permit / certificate ---------------- */
  P.permit = function (r) {
    var svc = RGP.store.service(r.serviceId);
    var proj = r.projectId && RGP.store.project(r.projectId);
    var d = r.decision;
    if (!d || d.type !== "approved") return;
    var verifyCode = "RRM-P" + (RGP.hash32(d.permitNo) % 10).toString(36).toUpperCase() +
      "-" + (RGP.hash32(d.permitNo + d.decidedAt) % 46656).toString(36).toUpperCase() + "-" + new Date(d.decidedAt).getFullYear();
    var expiry = RGP.addWorkingDays(d.decidedAt.slice(0, 10), 250);

    var conditions = [
      "يلتزم المستفيد بنطاق الخدمة الموضح في هذا التصريح وبجميع الاشتراطات الفنية والبلدية ذات العلاقة.",
      "يُبرز هذا التصريح للجهات الرقابية عند الطلب، ولا يغني عن أي موافقات نظامية أخرى.",
      "تلتزم الجهة المستفيدة بإشعار الأمانة بأي تغيير جوهري في نطاق الأعمال قبل تنفيذه.",
      "يخضع التصريح للإيقاف أو الإلغاء عند الإخلال بالاشتراطات وفق الأنظمة واللوائح المرعية."
    ];
    if (d.conditions) conditions.unshift(d.conditions);

    var sheet = h("div.print-sheet", null,
      headerBlock(verifyCode),
      h("div.p-title", null,
        h("div.t", null, svc ? svc.name.ar : "وثيقة اعتماد"),
        h("div", { style: { fontSize: "10pt", color: "#5D5D55", marginTop: "1mm" } }, svc ? svc.name.en : ""),
        h("div.no.num", null, d.permitNo)),
      h("div.p-grid", null,
        pkv("المشروع / Project", proj ? proj.name.ar + " — " + proj.name.en : "—"),
        pkv("الجهة المستفيدة / Beneficiary", r.personaSnapshot.org.ar),
        pkv("مقدم الطلب / Applicant", r.personaSnapshot.name.ar),
        pkv("رقم الطلب / Request no.", r.id),
        pkv("تاريخ القرار / Decision date", RGP.fmtDate(d.decidedAt.slice(0, 10))),
        pkv("سريان الوثيقة حتى / Valid until", RGP.fmtDate(expiry)),
        pkv("المسار / Lane", r.priority === "fast_track" ? "أولوية المشاريع الكبرى — Giga fast-track" : "المسار الاعتيادي — Standard"),
        pkv("الجهة المصدرة / Issuing office", "مكتب المشاريع الكبرى — أمانة منطقة الرياض")),
      h("div.p-conditions", null,
        h("h4", null, "الاشتراطات"),
        h("ol", null, conditions.map(function (c) { return h("li", null, c); }))),
      h("div.p-verify", null,
        verifySvg(verifyCode + "-v", 20),
        h("div", null,
          h("div.v-code.num", null, "رمز التحقق: " + verifyCode),
          h("div.v-note", null, "للتحقق من صحة الوثيقة: verify.rrm.gov.sa — رمز تحقق مرئي، يُستبدل برمز قابل للمسح عند الربط بالأنظمة الحكومية"))),
      h("div.p-sign", null,
        h("div.s-block", null, h("div.s-line", null, "مدير مكتب المشاريع الكبرى")),
        h("div.s-block", null, h("div.s-line", null, "الختم الرقمي"))),
      h("div.p-foot", null,
        h("span", null, "وثيقة إلكترونية معتمدة لا تتطلب توقيعًا يدويًا"),
        h("span.num", null, "أُصدرت آليًا في " + RGP.fmtDateTime(Date.now()))));

    function pkv(k, v) {
      return h("div", null, h("div.pk", null, k), h("div.pv", null, v));
    }
    openPrint(sheet);
  };

  /* ---------------- report printing ---------------- */
  P.report = function (sheetContainer) {
    var clone = sheetContainer.cloneNode(true);
    clone.className = "print-sheet";
    openPrint(h("div.print-sheet", null,
      headerBlock("RRM-REPORT-" + RGP.todayISO()),
      clone));
  };
})();
