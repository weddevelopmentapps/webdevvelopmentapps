/* geomap.js — خريطة الرياض الحقيقية بوضعين (عقد V2_CONTRACTS §4)
   ─────────────────────────────────────────────────────────────
   المصدر الوحيد للحدود: window.GEO (يُحقن وقت البناء من data/riyadh-geo.json —
   حدود 189 حياً حقيقية lat/lng بترخيص MIT + 40 نقطة تركّز رقابي من سجل المنصة).
   وضعان:
     svg   — إسقاط متساوي البعد مصحح بجيب تمام خط العرض الأوسط؛ يعمل دائماً
             من file:// دون أي اتصال (الوضع الاحتياطي القانوني).
     tiles — Leaflet (مضمن من vendor/leaflet) + بلاطات OpenStreetMap عند توفر
             الاتصال؛ فشل جلب البلاطات → سقوط تلقائي صامت إلى svg.
   choropleth قطاعي: أحياء القطاع تُملأ بدرجة سلم أحادي الصبغة حسب قيمة القطاع
   من الإصدار المنشور — لا قيمة مختلقة على مستوى الحي؛ قيم الأحياء تظهر فقط
   حيث وُجد الحي في عينة release.neighbourhoods وبوسم العينة. */
"use strict";

RH.viz.geomap = (function () {
  const { h, svg } = RH.core.dom;

  const SECTOR_ORDER = ["north", "east", "center", "west", "south"];

  /* سلالم أحادية الصبغة: الأخضر للطاقة/الرخص، المرجاني للمخالفات حصراً،
     الرملي النحاسي للطلب (لون الطلب الدلالي — لا أخضر لغير ما نتحكم به).
     أرضية السلالم مرفوعة الفاتحية عمداً (إصلاح المراجعة: كانت الدرجات الدنيا
     شبه سوداء على المسرح الداكن فتُقرأ الخريطة صورة ظلية مسطحة) — السلم
     يُدرَّج على مدى القيم الفعلي في rampStep فتبقى القطاعات الخمسة متمايزة. */
  const RAMPS = {
    seq: ["#1E4432", "#27573E", "#2F6E4E", "#31A26D", "#4CC18C"],
    viol: ["#4A241A", "#6B3222", "#8C4630", "#B0563C", "#D66A50"],
    demand: ["#3A2F15", "#54431E", "#6F5827", "#8C7132", "#AA8A3E"],
  };

  /** تعريف الطبقات: القيمة قطاعية من الإصدار حصراً */
  const LAYERS = {
    beds: {
      label: "الطاقة الاستيعابية المرخصة", ramp: "seq",
      val: (s) => s.beds, fmtV: (v) => RH.core.fmt.unitAfter(v, "سرير"),
    },
    operational: {
      label: "الرخص التشغيلية", ramp: "seq",
      val: (s) => s.operational, fmtV: (v) => RH.core.fmt.noun(v, "licence"),
    },
    building: {
      label: "رخص البناء", ramp: "seq",
      val: (s) => s.building, fmtV: (v) => RH.core.fmt.noun(v, "licence"),
    },
    violations: {
      label: "المخالفات المسجلة", ramp: "viol",
      val: (s) => s.violations, fmtV: (v) => RH.core.fmt.noun(v, "violation"),
    },
    inspectors: {
      label: "المراقبون الميدانيون", ramp: "seq",
      val: (s) => s.monitors, fmtV: (v) => RH.core.fmt.noun(v, "monitor"),
    },
    demand: {
      label: "الطلب التقديري على الأسرّة", ramp: "demand",
      val: (s) => s.demand, fmtV: (v) => RH.core.fmt.unitAfter(v, "سرير"),
    },
    coverage: {
      label: "نسبة تغطية الطلب", ramp: "seq",
      val: (s, der) => der.sector[s.id].coverage_pct,
      fmtV: (v) => RH.core.fmt.pct(v),
    },
  };

  const ATTRIB = "حدود الأحياء: بيانات عامة (MIT) — مواقع النقاط توضيحية من سجل المنصة";
  const OSM_ATTRIB = "© مساهمو OpenStreetMap";
  const OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  /** تطبيع اسم الحي لمطابقة عينة الأحياء (همزات/تاء مربوطة/ألف مقصورة/«حي») */
  function normName(name) {
    return String(name || "")
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
      .replace(/^حي\s+/, "").replace(/\s+/g, " ").trim();
  }

  /** فهرس عينة الأحياء بالاسم المطبع → صف العينة */
  function sampleIndex(rel) {
    const idx = new Map();
    for (const row of rel.neighbourhoods.rows) idx.set(normName(row.name), row);
    return idx;
  }

  /** درجة السلم 0..4 من قيمة القطاع منسوبة إلى مدى القطاعات الخمسة */
  function rampStep(v, min, max) {
    if (max === min) return 2;
    return Math.max(0, Math.min(4, Math.round(((v - min) / (max - min)) * 4)));
  }

  function render(el, opts) {
    const o = opts || {};
    const GEO = window.GEO;
    const rel = RH.data.store.release();
    const der = RH.data.store.der();
    const fmt = RH.core.fmt;
    const esc = RH.viz.theme.esc;
    const interactive = o.interactive !== false;
    if (!GEO || !GEO.sectors) {
      // غياب بيانات الحدود (بناء ناقص): بطاقة صادقة لا شاشة بيضاء
      el.appendChild(h("div", { class: "geomap-missing" },
        "حدود الأحياء غير مضمنة في هذا البناء — أعد البناء عبر build.py"));
      return { el, mode: () => "none", setLayer() {}, setMode() {},
        setHotspots() {}, refresh() {}, destroy() {} };
    }

    let layerKey = LAYERS[o.layer] ? o.layer : "beds";
    let showHotspots = !!o.hotspots;
    const samples = sampleIndex(rel);

    /* قائمة مسطحة بالأحياء مع قطاعها — أساس التلوين والتنقل بلوحة المفاتيح */
    const districts = [];
    for (const sec of SECTOR_ORDER) {
      for (const d of GEO.sectors[sec] || []) {
        districts.push({ sector: sec, d, sample: samples.get(normName(d.name)) || null });
      }
    }

    /** مركز قطاع تقريبي: متوسط مراكز أحيائه — لتسمية القطاع على الخريطة */
    function sectorCentroid(sec) {
      const list = GEO.sectors[sec] || [];
      if (!list.length) return null;
      let lat = 0, lng = 0;
      for (const d of list) { lat += d.centroid[0]; lng += d.centroid[1]; }
      return [lat / list.length, lng / list.length];
    }

    // ── الحاوية والعناصر المشتركة بين الوضعين ──
    el.classList.add("geomap");
    const canvas = h("div", { class: "geomap-canvas" });
    const tip = h("div", { class: "geomap-tip", hidden: true });
    const legend = h("div", { class: "geomap-legend", "aria-hidden": "true" });
    const attrib = h("div", { class: "geomap-attrib" });
    el.appendChild(canvas);
    el.appendChild(tip);
    el.appendChild(legend);
    el.appendChild(attrib);
    if (interactive) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "application");
      el.setAttribute("data-interactive", "");
    } else {
      el.setAttribute("role", "img");
    }

    function ariaLabel() {
      return "خريطة الرياض — " + LAYERS[layerKey].label
        + (showHotspots ? " مع نقاط التركّز الرقابي" : "");
    }
    function syncAria() { el.setAttribute("aria-label", ariaLabel()); }

    /** قيم القطاعات للطبقة الحالية + مداها */
    function layerValues() {
      const L = LAYERS[layerKey];
      const vals = {};
      let min = Infinity, max = -Infinity;
      for (const s of rel.sectors) {
        const v = L.val(s, der);
        vals[s.id] = v;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      return { vals, min, max, ramp: RAMPS[L.ramp] };
    }

    function sectorColor(sectorId, lv) {
      return lv.ramp[rampStep(lv.vals[sectorId], lv.min, lv.max)];
    }

    function renderLegend(mode) {
      RH.core.dom.clear(legend);
      const L = LAYERS[layerKey];
      const lv = layerValues();
      legend.appendChild(h("div", { class: "geomap-legend-title" }, L.label));
      const sw = h("div", { class: "geomap-swatches" });
      for (const c of lv.ramp) {
        sw.appendChild(h("span", { class: "geomap-swatch", style: { background: c } }));
      }
      legend.appendChild(h("div", { class: "geomap-scale" },
        h("span", {}, L.fmtV(lv.min)), sw, h("span", {}, L.fmtV(lv.max))));
      if (showHotspots) {
        legend.appendChild(h("div", { class: "geomap-legend-hs" },
          h("span", { class: "geomap-hs-dot", "aria-hidden": "true" }),
          "نقاط التركّز الرقابي (حجم النقطة = الكثافة)"));
      }
      attrib.textContent = ATTRIB + (mode === "tiles" ? " · " + OSM_ATTRIB : "");
    }

    /** نص التلميح (HTML موثوق: قوالب كود + كل نص خارجي عبر esc) */
    function tipHTML(item) {
      const L = LAYERS[layerKey];
      const s = rel.sectors.find((x) => x.id === item.sector);
      let html = "<div class=\"geomap-tip-name\">" + esc(item.d.name) + "</div>"
        + "<div class=\"geomap-tip-row\"><span>" + esc(s.name) + "</span><b>"
        + esc(L.fmtV(L.val(s, der))) + "</b></div>";
      if (o.sample !== false && item.sample) {
        const r = item.sample;
        html += "<div class=\"geomap-tip-sep\">من عينة الأحياء المدرجة</div>"
          + "<div class=\"geomap-tip-row\"><span>الأسرّة</span><b>"
          + esc(fmt.unitAfter(r.beds, "سرير")) + "</b></div>"
          + "<div class=\"geomap-tip-row\"><span>رخص البناء / التشغيلية</span><b>"
          + esc(fmt.int(r.building) + " / " + fmt.int(r.operational)) + "</b></div>"
          + "<div class=\"geomap-tip-row\"><span>المخالفات</span><b>"
          + esc(fmt.int(r.violations)) + "</b></div>";
      }
      return html;
    }

    function showTip(item, x, y) {
      tip.innerHTML = tipHTML(item); // آمن: كل محتوى خارجي مرّ عبر esc أعلاه
      tip.hidden = false;
      const bw = el.clientWidth, bh = el.clientHeight;
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let left = x - tw / 2;
      left = Math.max(6, Math.min(bw - tw - 6, left));
      let top = y - th - 14;
      if (top < 6) top = y + 18;
      top = Math.min(bh - th - 6, Math.max(6, top));
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }
    const hideTip = () => { tip.hidden = true; };

    function districtInfo(item) {
      const s = rel.sectors.find((x) => x.id === item.sector);
      return {
        name: item.d.name, name_en: item.d.name_en,
        sector: item.sector, sectorName: s.name,
        sectorRow: s, sectorDerived: der.sector[item.sector],
        centroid: item.d.centroid, sample: item.sample,
      };
    }

    // ═══ الوضع الأول: SVG مُسقط (احتياطي قانوني يعمل دائماً) ═══
    let svgRoot = null, svgPaths = [];
    const [[latMin, lngMin], [latMax, lngMax]] = GEO.bounds;
    const latMid = (latMin + latMax) / 2;
    const kx = Math.cos((latMid * Math.PI) / 180);
    const VW = 1000;
    const S = VW / ((lngMax - lngMin) * kx);
    const VH = Math.round((latMax - latMin) * S);
    const px = (lng) => (lng - lngMin) * kx * S;
    const py = (lat) => (latMax - lat) * S;

    function ringPath(rings) {
      let dstr = "";
      for (const ring of rings) {
        for (let i = 0; i < ring.length; i++) {
          const [lat, lng] = ring[i];
          dstr += (i === 0 ? "M" : "L") + px(lng).toFixed(2) + "," + py(lat).toFixed(2);
        }
        dstr += "Z";
      }
      return dstr;
    }

    let focusIdx = -1;
    function focusDistrict(i) {
      if (!svgPaths.length) return;
      if (focusIdx >= 0 && svgPaths[focusIdx]) svgPaths[focusIdx].classList.remove("kfocus");
      focusIdx = ((i % districts.length) + districts.length) % districts.length;
      const path = svgPaths[focusIdx];
      path.classList.add("kfocus");
      const item = districts[focusIdx];
      const [lat, lng] = item.d.centroid;
      const rect = el.getBoundingClientRect();
      const sx = (px(lng) / VW) * rect.width;
      const sy = (py(lat) / VH) * (rect.width * (VH / VW));
      showTip(item, sx, Math.min(sy, rect.height - 8));
    }

    function onKeydown(e) {
      if (!interactive) return;
      const NEXT = ["ArrowLeft", "ArrowDown"]; // RTL: التالي جهة اليسار
      const PREV = ["ArrowRight", "ArrowUp"];
      if (NEXT.includes(e.key)) {
        e.preventDefault(); e.stopPropagation(); focusDistrict(focusIdx + 1);
      } else if (PREV.includes(e.key)) {
        e.preventDefault(); e.stopPropagation(); focusDistrict(focusIdx - 1);
      } else if (e.key === "Home") {
        e.preventDefault(); e.stopPropagation(); focusDistrict(0);
      } else if ((e.key === "Enter" || e.key === " ") && focusIdx >= 0) {
        e.preventDefault(); e.stopPropagation();
        if (o.onDistrict) o.onDistrict(districtInfo(districts[focusIdx]));
      } else if (e.key === "Escape") {
        hideTip();
        if (focusIdx >= 0 && svgPaths[focusIdx]) svgPaths[focusIdx].classList.remove("kfocus");
        focusIdx = -1;
        el.blur();
      }
    }
    el.addEventListener("keydown", onKeydown);
    el.addEventListener("blur", () => { if (focusIdx < 0) hideTip(); });

    function buildSvg() {
      const lv = layerValues();
      svgRoot = svg("svg", {
        class: "geomap-svg", viewBox: "0 0 " + VW + " " + VH,
        preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true",
      });
      svgPaths = [];
      const gD = svg("g", { class: "geomap-districts" });
      districts.forEach((item, i) => {
        const path = svg("path", {
          d: ringPath(item.d.rings),
          class: "geomap-district" + (item.sample ? " has-sample" : ""),
          fill: sectorColor(item.sector, lv),
        });
        if (interactive) {
          path.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            showTip(item, e.clientX - r.left, e.clientY - r.top);
          });
          path.addEventListener("mouseleave", hideTip);
          path.addEventListener("click", () => {
            focusIdx = i;
            if (o.onDistrict) o.onDistrict(districtInfo(item));
          });
        }
        svgPaths.push(path);
        gD.appendChild(path);
      });
      svgRoot.appendChild(gD);

      /* تسميات القطاعات الخمسة عند مركز أحيائها — الخريطة تُقرأ خريطةً
         حقيقية لا صورة ظلية (إصلاح المراجعة). صامتة كلياً (لا أحداث). */
      const gL = svg("g", { class: "geomap-seclabels", "aria-hidden": "true" });
      for (const sec of SECTOR_ORDER) {
        const cen = sectorCentroid(sec);
        if (!cen) continue;
        const srow = rel.sectors.find((x) => x.id === sec);
        gL.appendChild(svg("text", {
          x: px(cen[1]).toFixed(1), y: py(cen[0]).toFixed(1),
          class: "geomap-seclabel",
          "text-anchor": "middle",
        }, srow ? srow.short : sec));
      }
      svgRoot.appendChild(gL);

      const gH = svg("g", { class: "geomap-hotspots" });
      if (showHotspots) {
        for (const hs of GEO.hotspots || []) {
          gH.appendChild(svg("circle", {
            cx: px(hs.lng).toFixed(2), cy: py(hs.lat).toFixed(2),
            r: Math.max(4, Math.sqrt(hs.density) * 1.7).toFixed(2),
            class: "geomap-hotspot",
          }));
        }
      }
      svgRoot.appendChild(gH);
      canvas.appendChild(svgRoot);
    }

    function recolorSvg() {
      const lv = layerValues();
      districts.forEach((item, i) => {
        svgPaths[i].setAttribute("fill", sectorColor(item.sector, lv));
      });
    }

    // ═══ الوضع الثاني: Leaflet + بلاطات OSM (عند الاتصال) ═══
    let lmap = null, lpolys = [], lhots = [];
    let effectiveMode = "svg";
    let tileWatch = 0;

    function tilesAvailable() {
      return !!window.L && navigator.onLine !== false;
    }

    function buildTiles() {
      const L = window.L;
      const lv = layerValues();
      const mapDiv = h("div", { class: "geomap-leaflet" });
      canvas.appendChild(mapDiv);
      lmap = L.map(mapDiv, {
        zoomControl: interactive,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: false,          // لا تعارض مع عقد عجلة الفأرة في العرض
        doubleClickZoom: interactive,
        boxZoom: false, keyboard: false, // لوحة المفاتيح لنا (تنقل الأحياء)
        tap: interactive,
        zoomSnap: 0.25,
      });
      let sawTile = false, tileErrors = 0;
      const tl = L.tileLayer(OSM_URL, { maxZoom: 16, minZoom: 9 });
      tl.on("tileload", () => { sawTile = true; clearTimeout(tileWatch); });
      tl.on("tileerror", () => {
        tileErrors += 1;
        // لم تصل أي بلاطة وتراكمت الإخفاقات → الشبكة غير صالحة: سقوط صامت إلى svg
        if (!sawTile && tileErrors >= 4 && effectiveMode === "tiles") {
          setMode("svg");
        }
      });
      tl.addTo(lmap);
      /* مهلة صدق: لا بلاطة واحدة خلال ٣ ثوانٍ → سقوط إلى SVG بدل خريطة
         سوداء تدّعي رقاقتها «بلاطات حية» (إصلاح المراجعة) */
      tileWatch = setTimeout(() => {
        if (!sawTile && effectiveMode === "tiles") setMode("svg");
      }, 3000);
      lmap.fitBounds(GEO.bounds, { padding: [8, 8] });

      lpolys = [];
      districts.forEach((item, i) => {
        const poly = L.polygon(item.d.rings, {
          color: "rgba(244,241,230,0.35)", weight: 1,
          fillColor: sectorColor(item.sector, lv), fillOpacity: 0.55,
        }).addTo(lmap);
        if (interactive) {
          poly.on("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            showTip(item, e.originalEvent.clientX - r.left, e.originalEvent.clientY - r.top);
          });
          poly.on("mouseout", hideTip);
          poly.on("click", () => {
            focusIdx = i;
            if (o.onDistrict) o.onDistrict(districtInfo(item));
          });
        }
        lpolys.push(poly);
      });
      /* تسميات القطاعات في وضع البلاطات أيضاً — عبر divIcon صامت */
      for (const sec of SECTOR_ORDER) {
        const cen = sectorCentroid(sec);
        if (!cen) continue;
        const srow = rel.sectors.find((x) => x.id === sec);
        L.marker(cen, {
          interactive: false,
          keyboard: false,
          icon: L.divIcon({
            className: "geomap-seclabel-tile",
            html: "<span>" + RH.viz.theme.esc(srow ? srow.short : sec) + "</span>",
            iconSize: [0, 0],
          }),
        }).addTo(lmap);
      }

      lhots = [];
      if (showHotspots) {
        for (const hs of GEO.hotspots || []) {
          lhots.push(L.circleMarker([hs.lat, hs.lng], {
            radius: Math.max(4, Math.sqrt(hs.density) * 1.4),
            color: "#D66A50", weight: 1, fillColor: "#D66A50", fillOpacity: 0.42,
            interactive: false,
          }).addTo(lmap));
        }
      }
    }

    function recolorTiles() {
      const lv = layerValues();
      districts.forEach((item, i) => {
        lpolys[i].setStyle({ fillColor: sectorColor(item.sector, lv) });
      });
    }

    // ── إدارة الأوضاع ──
    function clearCanvas() {
      hideTip();
      clearTimeout(tileWatch);
      if (lmap) { try { lmap.remove(); } catch (_e) { /* لا شيء */ } lmap = null; }
      lpolys = []; lhots = [];
      svgRoot = null; svgPaths = []; focusIdx = -1;
      RH.core.dom.clear(canvas);
    }

    function setMode(m) {
      const want = m === "tiles" && tilesAvailable() ? "tiles" : "svg";
      clearCanvas();
      effectiveMode = want;
      if (want === "tiles") buildTiles(); else buildSvg();
      renderLegend(effectiveMode);
      syncAria();
      /* إبلاغ القسم المضيف بالوضع الفعلي — كي تصدُق رقاقة «الوضع» عند
         السقوط التلقائي من البلاطات إلى SVG (إصلاح المراجعة) */
      if (typeof o.onModeChange === "function") o.onModeChange(effectiveMode);
    }

    function setLayer(k) {
      if (!LAYERS[k]) return;
      layerKey = k;
      if (effectiveMode === "tiles") recolorTiles(); else recolorSvg();
      renderLegend(effectiveMode);
      syncAria();
    }

    function setHotspots(b) {
      showHotspots = !!b;
      setMode(effectiveMode); // إعادة بناء الطبقة — رخيصة ونادرة
    }

    function refresh() {
      if (lmap) lmap.invalidateSize();
    }

    function destroy() {
      clearCanvas();
      el.removeEventListener("keydown", onKeydown);
      RH.core.dom.clear(el);
      el.classList.remove("geomap");
    }

    // البناء الأول وفق الوضع المطلوب
    const requested = o.mode || "auto";
    setMode(requested === "svg" ? "svg"
      : requested === "tiles" ? "tiles"
        : (tilesAvailable() ? "tiles" : "svg"));

    return {
      el, setLayer, setHotspots, setMode, refresh, destroy,
      mode: () => effectiveMode,
      layers: Object.keys(LAYERS),
    };
  }

  return { render, LAYERS_META: LAYERS };
})();
