/* s0-cover.js — الغلاف السينمائي V2 (عقد V2_CONTRACTS §1 — مشهد «00»)
   ─────────────────────────────────────────────────────────────────
   يسجل مباشرة عبر engine.registerScene (لا يمر عبر RH.sections.register).
   طبقة الوسائط عبر RH.presenter.mediaBg.attachVideo: ملصق 2K فوراً ثم فيديو
   CloudFront الحلقي بعد جاهزيته حصراً؛ reduced-motion أو غياب الشبكة/MEDIA
   → الملصق أو البديل الكودي (سماء غسق + صورة ظلية لأفق الرياض) — لا إطار
   مكسور في أي ظرف. لا قوائم ولا شارات ولا شعارات مخترعة. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** صورة ظلية كودية لأفق الرياض: برج المملكة بقوسه المميز والفيصلية المخروطية
      وكتل المركز المالي — زخرفة لا بيانات، لذلك aria-hidden. */
  function skylineSvg() {
    const g = svg("svg", {
      viewBox: "0 0 1920 360", preserveAspectRatio: "xMidYMax slice",
      "aria-hidden": "true",
    });
    const ground = "M0,360 L0,330 L1920,330 L1920,360 Z";
    // برج المملكة: جسم ينحني لقوس مقلوب مفتوح
    const kingdom = "M760,330 L760,150 C760,90 795,60 830,58 C865,60 900,90 900,150 L900,330 " +
      "L880,330 L880,175 C880,140 862,120 830,118 C798,120 780,140 780,175 L780,330 Z";
    // الفيصلية: مخروط مستدق بكرة قمة
    const faisaliah = "M1050,330 L1090,105 L1094,105 L1134,330 Z M1090,92 a6,6 0 1,1 8,0 " +
      "a4,4 0 1,1 -8,0 Z";
    const blocks = [
      "M180,330 L180,240 L230,225 L230,330 Z", "M260,330 L260,205 L300,205 L300,330 Z",
      "M330,330 L330,255 L390,240 L390,330 Z", "M440,330 L440,180 L455,172 L490,180 L490,330 Z",
      "M540,330 L540,225 L590,225 L590,330 Z", "M630,330 L648,160 L666,160 L684,330 Z",
      "M960,330 L960,220 L1010,235 L1010,330 Z", "M1200,330 L1200,215 L1240,200 L1252,215 L1252,330 Z",
      "M1300,330 L1300,250 L1360,250 L1360,330 Z", "M1420,330 L1440,185 L1470,185 L1478,330 Z",
      "M1530,330 L1530,245 L1600,230 L1600,330 Z", "M1660,330 L1660,270 L1740,265 L1740,330 Z",
    ];
    const all = [ground, kingdom, faisaliah].concat(blocks).join(" ");
    g.appendChild(svg("path", { d: all, fill: "#04170E", "fill-rule": "evenodd", opacity: "0.92" }));
    // أضواء نوافذ خافتة
    for (let i = 0; i < 46; i++) {
      const x = 170 + ((i * 197) % 1580);
      const y = 200 + ((i * 83) % 118);
      g.appendChild(svg("rect", {
        x, y, width: 3.2, height: 2.2, fill: "#D6AB4C",
        opacity: (0.12 + (i % 5) * 0.05).toFixed(2),
      }));
    }
    return g;
  }

  function build(host, _ctx) {
    const rel = RH.data.store.release();
    const meta = rel.meta;

    // البديل الكودي دائماً في القاع، ثم طبقة الوسائط السينمائية فوقه
    const media = h("div", { class: "cover-media", "aria-hidden": "true" },
      h("div", { class: "cover-fallback" },
        h("div", { class: "skyline" }, skylineSvg())));

    const M = RH.presenter.mediaBg.media();
    const C = (M && M.cover) || {};
    /* سلسلة مرشحي الوسائط بالأولوية (إصلاح المراجعة): الملصق المضمّن وقت
       البناء (data URI — يعمل من file:// دون اتصال) ← الملف الشقيق المجلوب
       بـ tools/fetch_media.sh ← ملصقا CloudFront؛ والفيديو: الشقيق ← 2K ← 720 */
    RH.presenter.mediaBg.attachVideo(media, {
      posters: [
        C.poster_embedded,
        "assets/media/cover-poster.jpg",
        C.poster,
        C.poster_1k,
      ].filter(Boolean),
      sources: [
        "assets/media/cover-loop.mp4",
        C.video,
        C.video_720,
      ].filter(Boolean),
      dim: 0.38, // زجاج خفيف: الغلاف سينمائي والscrim النصي يتكفل بالمقروئية
    });

    const content = h("div", { class: "cover-content" },
      h("h1", { class: "cover-title rise" }, meta.title),
      h("div", { class: "cover-rule rise", "aria-hidden": "true" }),
      meta.presentation_date
        ? h("div", { class: "cover-date rise" }, fmt.date(meta.presentation_date))
        : null,
      h("div", { class: "cover-asof rise" }, "البيانات حتى " + meta.data_as_of),
    );

    const actions = h("div", { class: "cover-actions" },
      h("button", {
        class: "btn-begin",
        onclick: () => {
          // ملء الشاشة يتطلب إيماءة مستخدم — من هذه النقرة تحديداً
          RH.presenter.chrome.requestFullscreen().finally(() => {
            RH.presenter.engine.agenda();
          });
        },
      }, "بدء العرض التقديمي"),
      h("button", {
        class: "btn-fullscreen",
        onclick: () => RH.presenter.chrome.requestFullscreen(),
      }, "ملء الشاشة"),
    );

    /* شريط المعلومات السفلي (إصلاح المراجعة: يكسر فراغ الغلاف بحقائق
       الإصدار المعتمدة) — فترة الرصد وبوابات التحقق ورقم الإصدار وأرقام
       الجملة التنفيذية، كلها من الإصدار عبر fmt حصراً */
    const der = RH.data.store.der();
    const v = rel.validation || {};
    const tickerItems = [
      { k: "فترة الرصد", v: String(meta.monitoring_period_label) },
      {
        k: "بوابات التحقق",
        v: (Number.isFinite(v.gates_passed) && Number.isFinite(v.gates_total))
          ? fmt.iso(fmt.int(v.gates_passed) + "/" + fmt.int(v.gates_total))
          : "—",
      },
      { k: "الطلب التقديري", v: fmt.compact(rel.metrics.total_demand.value) + " سرير" },
      { k: "الطاقة المرخصة", v: fmt.compact(rel.metrics.licensed_beds.value) + " سرير" },
      { k: "نسبة التغطية", v: fmt.pct(der.coverage_pct) },
      { k: "رقم الإصدار", v: fmt.iso(String((rel.release && rel.release.id) || "—")) },
    ];
    const ticker = h("div", {
      class: "cover-ticker",
      role: "list",
      "aria-label": "حقائق الإصدار المعتمدة",
    });
    for (const it of tickerItems) {
      ticker.appendChild(h("div", { class: "cover-tick", role: "listitem" },
        h("span", { class: "cover-tick-k" }, it.k),
        h("b", { class: "cover-tick-v" }, it.v),
      ));
    }

    host.appendChild(h("section", {
      class: "sc sc-cover", role: "region", "aria-label": "الغلاف",
    }, media, h("div", { class: "cover-scrim", "aria-hidden": "true" }),
    content, actions, ticker));
  }

  RH.presenter.engine.registerScene({ id: "00", kind: "cinematic", build });
})();
