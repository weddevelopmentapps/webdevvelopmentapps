/* s00-cover.js — الغلاف السينمائي
   عنوان + تاريخ العرض + فعلان فقط. الفيديو يحل محل الملصق بعد جاهزيته حصراً،
   والبديل المدرَّج عند غياب الوسائط سماءُ غسقٍ وصورة ظلية لأفق الرياض مرسومتان
   كوداً — لا إطار مكسور في أي ظرف. لا قوائم ولا شارات ولا شعارات مخترعة. */
"use strict";

(function () {
  const { h, svg } = RH.core.dom;
  const fmt = RH.core.fmt;

  /** صورة ظلية كودية لأفق الرياض: برج المملكة بقوسه المميز والفيصلية المخروطية
      وكتل أبراج المركز المالي — زخرفة لا بيانات، لذلك aria-hidden. */
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
    // كتل المركز المالي وأبراج متفاوتة
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

  function build(host, ctx) {
    const rel = RH.data.store.release();
    const meta = rel.meta;

    const media = h("div", { class: "cover-media", "aria-hidden": "true" });
    const fallback = h("div", { class: "cover-fallback" },
      h("div", { class: "skyline" }, skylineSvg()));
    media.appendChild(fallback);

    // الملصق فوراً ثم الفيديو بعد جاهزية التشغيل فقط (لا شاشة سوداء أبداً)
    if (!RH.viz.motion.REDUCED && !(navigator.connection && navigator.connection.saveData)) {
      const poster = new Image();
      poster.src = "assets/media/cover-poster.jpg";
      poster.className = "cover-poster";
      poster.alt = "";
      poster.addEventListener("load", () => {
        poster.style.position = "absolute";
        poster.style.inset = "0";
        poster.style.width = "100%";
        poster.style.height = "100%";
        poster.style.objectFit = "cover";
        poster.style.objectPosition = "center 38%";
        media.appendChild(poster);
        const video = h("video", {
          muted: true, loop: true, playsinline: true, preload: "auto",
          "aria-hidden": "true",
        });
        video.muted = true; // بعض المتصفحات تتجاهل الخاصية دون التعيين البرمجي
        video.src = "assets/media/cover-loop.mp4";
        video.addEventListener("canplaythrough", () => {
          media.appendChild(video);
          video.play().then(() => { poster.style.opacity = "0"; }).catch(() => {});
        }, { once: true });
      });
      // فشل تحميل الملصق = نبقى على البديل الكودي بصمت
    }

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

    host.appendChild(h("section", {
      class: "sc sc-cover", role: "region", "aria-label": "الغلاف",
    }, media, h("div", { class: "cover-scrim", "aria-hidden": "true" }), content, actions));
  }

  RH.presenter.engine.registerScene({ id: "00", kind: "cinematic", build });
})();
