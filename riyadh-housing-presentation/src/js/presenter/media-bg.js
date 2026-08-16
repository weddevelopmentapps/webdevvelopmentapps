/* media-bg.js — طبقات الخلفية الفوتوغرافية/السينمائية للأقسام (عقد V2_CONTRACTS §6)
   ────────────────────────────────────────────────────────────────────────────
   window.MEDIA يُحقن وقت البناء من data/media-v2-jobs.json:
     { backdrops: {demand, licensing, control, map, initiatives, kpis_closing},
       cover: {poster, video, video_720, poster_1k, night_grid, heritage} }
   المبدأ: الصورة إثراء لا اعتماد — التدرج الزمردي الفني يظهر أولاً دائماً،
   والصورة تخفت للداخل بعد اكتمال تحميلها فقط. غياب الشبكة أو المفتاح أو فشل
   التحميل = لا نتوء بصري إطلاقاً (تدهور رشيق كامل من file:// دون اتصال). */
"use strict";

RH.presenter.mediaBg = (function () {
  const { h } = RH.core.dom;

  const media = () => window.MEDIA || null;

  /** أسماء مستعارة: مفاتيح الأقسام التسعة → مفاتيح التوليدات الستة المتوفرة */
  function resolve(key) {
    const M = media();
    if (!M) return null;
    const B = M.backdrops || {};
    const C = M.cover || {};
    const ALIAS = {
      summary: C.night_grid,
      kpis: B.kpis_closing,
      closing: B.kpis_closing,
      kpis_closing: B.kpis_closing,
      forecast: B.demand,
      cover: C.poster,
      heritage: C.heritage,
    };
    return B[key] || ALIAS[key] || null;
  }

  /** طبقة خلفية فوتوغرافية + زجاج زمردي متدرج. dim = عتامة الزجاج (0..1). */
  function attach(el, key, opts) {
    const o = opts || {};
    const dim = typeof o.dim === "number" ? Math.min(1, Math.max(0, o.dim)) : 0.82;
    const layer = h("div", { class: "media-bg", "aria-hidden": "true" });
    const glass = h("div", { class: "media-glass", style: { "--media-dim": String(dim) } });

    const url = resolve(key);
    if (url) {
      const img = new Image();
      img.decoding = "async";
      img.alt = "";
      img.className = "media-img";
      img.addEventListener("load", () => {
        // الإدراج بعد اكتمال التحميل فقط — ثم خفوت للداخل عبر صنف loaded
        layer.insertBefore(img, glass);
        requestAnimationFrame(() => img.classList.add("loaded"));
      });
      // فشل التحميل (لا شبكة/رابط ميت): لا شيء يتغير — التدرج الفني قائم
      img.addEventListener("error", () => { /* تدهور رشيق صامت */ });
      img.src = url;
    }

    layer.appendChild(glass);
    el.appendChild(layer);
    return layer;
  }

  /** فيديو خلفية حلقي صامت (الغلاف) — الملصق يظهر فوراً والفيديو يخفت داخلاً
      عند جاهزيته. reduced-motion أو فشل التحميل → الملصق وحده.
      opts.posters/opts.sources: قوائم مرشحين بالأولوية (المضمّن ← الملف
      الشقيق ← CloudFront) — فشل مرشح يجرّب التالي (إصلاح المراجعة: الغلاف
      يعرض الصورة الفوتوغرافية بكل الظروف الممكنة قبل أي بديل مرسوم). */
  function attachVideo(el, opts) {
    const o = opts || {};
    const M = media();
    const posters = (o.posters || [o.poster, M && M.cover && M.cover.poster])
      .filter(Boolean);
    const sources = (o.sources || [o.src, M && M.cover && M.cover.video])
      .filter(Boolean);
    const dim = typeof o.dim === "number" ? o.dim : 0.62;
    const layer = h("div", { class: "media-bg media-bg-video", "aria-hidden": "true" });
    const glass = h("div", { class: "media-glass", style: { "--media-dim": String(dim) } });

    /* سلسلة مرشحي الملصق: أول نجاح يُدرج، وفشلٌ يجرّب التالي بصمت */
    (function tryPoster(i) {
      if (i >= posters.length) return;
      const img = new Image();
      img.decoding = "async";
      img.alt = "";
      img.className = "media-img";
      img.addEventListener("load", () => {
        layer.insertBefore(img, layer.firstChild);
        requestAnimationFrame(() => img.classList.add("loaded"));
      });
      img.addEventListener("error", () => tryPoster(i + 1));
      img.src = posters[i];
    })(0);

    if (sources.length && !RH.viz.motion.REDUCED) {
      const video = h("video", {
        class: "media-video", muted: true, loop: true,
        playsinline: true, preload: "auto",
      });
      video.muted = true; // خاصية الكائن أوثق من السمة في بعض المتصفحات
      video.addEventListener("canplay", () => {
        if (!video.parentNode) layer.insertBefore(video, glass);
        const p = video.play();
        if (p && p.catch) p.catch(() => { /* منع تشغيل تلقائي: يبقى الملصق */ });
        requestAnimationFrame(() => video.classList.add("loaded"));
      });
      let si = 0;
      video.addEventListener("error", () => {
        si += 1;
        if (si < sources.length) {
          video.src = sources[si];   // المرشح التالي للفيديو
          return;
        }
        if (video.parentNode) video.parentNode.removeChild(video);
      });
      video.src = sources[0];
    }

    layer.appendChild(glass);
    el.appendChild(layer);
    return layer;
  }

  return { attach, attachVideo, media, resolve };
})();
