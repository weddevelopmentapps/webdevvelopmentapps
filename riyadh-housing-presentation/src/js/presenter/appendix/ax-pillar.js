/* ax-pillar.js — ملحق المبادرات والركائز (appendix/pillar[/<pillarId>])
   عقد V2 (مرآة المصدر): المحاور الأربعة والمبادرات الثماني عشرة منقولة
   حرفياً من خطة عمل المشروع V.1.0.0 بحقولها المنشورة {المحور، المبادرة،
   البداية، النهاية} والحالة محسوبة بقاعدة خطة العمل ذاتها (مرآة قسم
   المبادرات حرفياً): حالة صريحة في المصدر تُنقل كما هي، وإلا فمَن تجاوزت
   نهايتها المخططة دون تسجيل إنجاز «متأخرة» حكماً، ومَن بدأت ولم تنته
   «جاري العمل»، وإلا «لم يتم البدء». لا نسب إنجاز مختلقة — الأوزان
   والنسب غير واردة في المصدر فلا تُعرض حلقة تقدم أصلاً (غياب صادق).
   بوابة الاعتماد عبر الحكم الموحد RH.data.strategyApproved حصراً
   (إصلاح مراجعة الجولة 1: البوابة النصية القديمة كانت تحجب الملحق رغم
   اعتماد المصدر مرآةً، وتدّعي أن الوثيقة «لم تُرفَق بعد» — وهو غير صحيح).
   دون معرف ركيزة: سجل المحفظة كاملاً بصفحاته + صفحة المتأخرات. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** المسار يصل كـ appendix/pillar[/<pillarId>] */
  const pillarId = (ctx) => (ctx.route.id.split("/")[1] || "");

  const pillarOf = (st, id) =>
    st.pillars ? st.pillars.find((p) => p.id === id) : null;

  /* مفردات الحالة المقفلة — مرآة s06-initiatives حرفياً */
  const ST_DONE = "منجزة";
  const ST_RUN = "جاري العمل";
  const ST_LATE = "متأخرة";
  const ST_IDLE = "لم يتم البدء";

  /** قاعدة الحالة المحسوبة — مرآة statusOf في قسم المبادرات حرفياً */
  function statusOf(ini, calcDate) {
    if (ini.status) return ini.status;
    if (ini.end && ini.end < calcDate) return ST_LATE;
    if (ini.start && ini.start <= calcDate) return ST_RUN;
    return ST_IDLE;
  }

  /** صفوف المحفظة بترتيب المحور فالمعرف (مرآة ترتيب القسم والمكتبة) */
  function portfolioRows(st, calc) {
    const pIdx = {};
    st.pillars.forEach((p, i) => { pIdx[p.id] = i; });
    return (st.initiatives || []).slice().sort((a, b) => {
      const d = (pIdx[a.pillar_id] || 0) - (pIdx[b.pillar_id] || 0);
      if (d !== 0) return d;
      return String(a.id).localeCompare(String(b.id), "en", { numeric: true });
    }).map((ini) => ({
      ini,
      pillar: st.pillars[pIdx[ini.pillar_id]] || null,
      status: statusOf(ini, calc),
    }));
  }

  const ROWS_PER_PAGE = 9;

  function statusCell(status) {
    if (status === ST_LATE) {
      return h("td", {}, h("span", {
        style: { color: "var(--coral)", fontWeight: "700" },
      }, status + " حكماً"));
    }
    if (status === ST_DONE) {
      return h("td", {}, h("span", {
        style: { color: "var(--green-hi)", fontWeight: "700" },
      }, status));
    }
    return h("td", {}, status);
  }

  /** تاريخ عربي كامل — نص RTL طبيعي (لا عزل ltr: يقلب ترتيب اليوم والشهر) */
  function dateCell(iso) {
    return h("td", {}, iso ? fmt.date(iso) : "—");
  }

  /** جدول مبادرات موحد (شريحة صفوف جاهزة) + ذيل المصدر والقاعدة */
  function buildTable(el, rows, footNote) {
    const st = RH.data.store.release().strategy;
    el.appendChild(h("table", { class: "ax-table" },
      h("thead", {}, h("tr", {},
        ["#", "المبادرة", "المحور", "البداية المخططة", "النهاية المخططة",
          "الحالة"].map((t) => h("th", { scope: "col" }, t)))),
      h("tbody", {}, rows.map((r) => h("tr", {},
        h("td", { class: "num" }, h("span", { class: "ltr" }, String(r.ini.id))),
        h("td", {}, String(r.ini.name)),
        h("td", {}, r.pillar ? String(r.pillar.name) : "—"),
        dateCell(r.ini.start),
        dateCell(r.ini.end),
        statusCell(r.status),
      ))),
    ));
    const note = h("div", { class: "ax-note" },
      h("b", {}, fmt.noun(rows.length, "initiative")),
      " في هذه الصفحة · المصدر: ", String(st.source), ".");
    if (footNote) note.appendChild(document.createTextNode(" " + footNote));
    el.appendChild(note);
  }

  /* ── صفحة الحالة الشريفة: مصدر غير معتمد أو ركيزة غير موجودة ─────────── */
  function pagePending(el, ctx) {
    const st = RH.data.store.release().strategy;
    const id = pillarId(ctx);
    const notApproved = !RH.data.strategyApproved(st) || !(st.pillars || []).length;

    el.appendChild(h("div", { class: "pending-scene" },
      h("div", { class: "glyph" },
        svg("svg", {
          viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
          "stroke-width": 1.1, "stroke-linecap": "round", "stroke-linejoin": "round",
          "aria-hidden": "true",
        },
          svg("circle", { cx: 12, cy: 12, r: 9, "stroke-dasharray": "4 3" }),
          svg("path", { d: "M12 7v5l3 3" }),
        )),
      notApproved
        ? h("h2", {}, "تُستكمل تفاصيل الركائز فور اعتماد مصدرها الرسمي")
        : h("h2", {}, "الركيزة المطلوبة غير مدرجة في الإصدار المنشور"),
      notApproved
        ? h("p", {},
          "تعريفات الركائز والمبادرات مملوكة للوثيقة المعتمدة ",
          h("span", { class: "src-name" }, "«" + String(st.source || "خطة عمل المشروع") + "»"),
          ". تعرض هذه الشاشة الحالة بأمانة بدل أي أرقام تقديرية، ويُستكمل النشر من الإدارة فور اعتماد المصدر.")
        : h("p", {},
          "المعرّف ", h("span", { class: "ltr" }, id),
          " غير موجود ضمن ركائز الإصدار الحالي. يمكن العودة إلى المبادرات واختيار ركيزة أخرى."),
    ));
  }

  /* ── صفحة المتأخرات حكماً — حصراً من الحالة المحسوبة ─────────────────── */
  function pageLate(el, rows) {
    const st = RH.data.store.release().strategy;
    const late = rows.filter((r) => r.status === ST_LATE);
    if (!late.length) {
      el.appendChild(h("div", {
        class: "ax-note",
        style: { flex: "1", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "calc(var(--su)*24)" },
      }, "لا مبادرات متأخرة حكماً ضمن هذا النطاق."));
      return;
    }
    buildTable(el, late,
      "قاعدة «متأخرة حكماً»: " + String(st.status_rule
        || "تجاوزت نهايتها المخططة دون تسجيل إنجاز في المصدر."));
  }

  RH.presenter.ax.register({
    id: "pillar",
    kicker: "ملحق الاستراتيجية",
    title: "المبادرات والركائز — السجل الكامل",
    returnLabel: "العودة إلى المبادرات",
    pages: (ctx) => {
      const rel = RH.data.store.release();
      const st = rel.strategy;
      const calc = rel.meta.calculation_date;
      const id = pillarId(ctx);
      const approved = RH.data.strategyApproved(st) && (st.pillars || []).length;
      if (!approved || (id && !pillarOf(st, id))) {
        return [{ name: "حالة الاعتماد", build: pagePending }];
      }

      const all = portfolioRows(st, calc);
      const rows = id ? all.filter((r) => r.ini.pillar_id === id) : all;
      const scopeName = id ? String(pillarOf(st, id).name) : "المحفظة الكاملة";

      const pages = [];
      if (rows.length <= ROWS_PER_PAGE) {
        pages.push({
          name: "مبادرات " + scopeName,
          build: (el) => buildTable(el, rows,
            "الحالة محسوبة بقاعدة خطة العمل حتى " + fmt.date(calc) + "."),
        });
      } else {
        const chunks = [];
        for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
          chunks.push(rows.slice(i, i + ROWS_PER_PAGE));
        }
        chunks.forEach((chunk, i) => pages.push({
          name: "سجل المحفظة (" + fmt.int(i + 1) + " من " + fmt.int(chunks.length) + ")",
          build: (el) => buildTable(el, chunk,
            "الحالة محسوبة بقاعدة خطة العمل حتى " + fmt.date(calc) + "."),
        }));
      }
      pages.push({
        name: "المتأخرة حكماً",
        build: (el) => pageLate(el, rows),
      });
      return pages;
    },
  });
})();
