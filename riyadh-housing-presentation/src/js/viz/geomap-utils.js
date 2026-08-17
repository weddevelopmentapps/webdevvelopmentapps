/* geomap-utils.js — أدوات الجغرافيا المشتركة (عقد V2_CONTRACTS_EXPANSION §10)
   ─────────────────────────────────────────────────────────────────────────
   منطق نقي بلا DOM إطلاقاً: تطبيع الأسماء العربية للبحث، فهرس الأحياء الـ189
   الموحد (قطاع + صف قطاع + عينة)، بحث مدرّج الدرجات، مسافات haversine،
   نقاط التركّز ضمن نصف قطر، ومصنع الإسقاط المتساوي البعد المصحح بجيب تمام
   خط العرض الأوسط — مرآة حسابية دقيقة لما في viz/geomap.js المعتمد (الذي
   يبقى دون مساس حفاظاً على الثبات البكسلي للبناء المعتمد؛ اختبار الوحدة
   يضمن تطابق التطبيعين). تستهلكه: أطلس الأحياء، لوحة الأوامر، والموجز. */
"use strict";

RH.viz.geoutils = (function () {

  /** الترتيب القانوني للقطاعات الخمسة — مطابق لترتيب geomap والإصدار */
  const SECTOR_ORDER = ["north", "east", "center", "west", "south"];

  /* ── التطبيع ── */

  /** مرآة normName في geomap.js حرفياً: همزات الألف، التاء المربوطة،
      الألف المقصورة، حذف بادئة «حي»، وضم الفراغات — تُستخدم حيث يلزم
      التطابق التام مع فهرس عينة الأحياء في الخريطة المعتمدة. */
  function normDistrict(name) {
    return String(name || "")
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
      .replace(/^حي\s+/, "").replace(/\s+/g, " ").trim();
  }

  /** تطبيع بحث شامل للمطابقة الحرة (لوحة الأوامر/بحث الأطلس):
      يشمل normDistrict ويزيد عليه إسقاط التشكيل والتطويل وتوحيد الهمزات
      على الواو والياء وحذف الهمزة المفردة وخفض الحرف اللاتيني —
      «الملقى» و«ملقا» و"Malqa" تلتقي كلها على النص ذاته. */
  function normalizeAr(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[ً-ْٰ]/g, "")   // التشكيل والألف الخنجرية
      .replace(/ـ/g, "")                   // التطويل
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ء/g, "")
      .replace(/ة/g, "ه").replace(/ى/g, "ي")
      .replace(/^حي\s+/, "").replace(/\s+/g, " ").trim();
  }

  /* ── فهرس الأحياء الموحد ── */

  /** فهرس عينة الأحياء بالاسم المطبع (normDistrict — مرآة الخريطة) */
  function sampleIndex(release) {
    const idx = new Map();
    const rows = release && release.neighbourhoods && release.neighbourhoods.rows;
    for (const row of rows || []) idx.set(normDistrict(row.name), row);
    return idx;
  }

  /**
   * القائمة المسطحة الموحدة للأحياء الـ189: القطاع وصفه من الإصدار ومشتقاته
   * وصف العينة المطابق ونصا المطابقة الجاهزان — أساس الأطلس ولوحة الأوامر.
   * derived اختياري (يغيب في السياقات النقية كالاختبارات).
   */
  function districtIndex(geo, release, derived) {
    const out = [];
    if (!geo || !geo.sectors || !release) return out;
    const samples = sampleIndex(release);
    for (const sec of SECTOR_ORDER) {
      const sectorRow = (release.sectors || []).find((s) => s.id === sec) || null;
      const sectorDerived = derived && derived.sector ? derived.sector[sec] || null : null;
      for (const d of geo.sectors[sec] || []) {
        const nd = normDistrict(d.name);
        out.push({
          key: sec + ":" + nd,
          name: d.name,
          name_en: d.name_en || "",
          sector: sec,
          sectorName: sectorRow ? sectorRow.name : sec,
          centroid: d.centroid,
          rings: d.rings,
          sectorRow,
          sectorDerived,
          sample: samples.get(nd) || null,
          norm: normalizeAr(d.name),
          normEn: String(d.name_en || "").toLowerCase().trim(),
        });
      }
    }
    return out;
  }

  /** استرجاع مدخل بمعرفه الثابت "<sector>:<normDistrict>" (معامل ?d= في الأطلس) */
  function findByKey(index, key) {
    if (!key) return null;
    for (const e of index) { if (e.key === key) return e; }
    return null;
  }

  /* ── البحث المدرّج ── */

  /** تتابع حروف بترتيبها (أدنى درجات المطابقة — شبكة أمان للأخطاء المطبعية) */
  function subsequence(hay, needle) {
    let i = 0;
    for (const ch of hay) {
      if (ch === needle[i]) i += 1;
      if (i >= needle.length) return true;
    }
    return i >= needle.length;
  }

  /** درجة مطابقة مدخل واحد لاستعلام مطبع — 0 يعني لا مطابقة */
  function scoreEntry(entry, q) {
    if (!q) return 0;
    if (entry.norm === q) return 100;
    if (entry.norm.startsWith(q)) return 80;
    // بادئة كلمة داخلية: «العزيزيه» تلتقط «حي العزيزية الجديدة» وسطياً
    if (entry.norm.includes(" " + q)) return 60;
    if (entry.norm.includes(q)) return 40;
    if (entry.normEn && entry.normEn.includes(q)) return 30;
    if (q.length >= 3 && subsequence(entry.norm, q)) return 15;
    return 0;
  }

  /**
   * بحث الأحياء: استعلام حر → مدخلات مرتبة (الدرجة ثم الاسم) بحد أقصى limit.
   * استعلام فارغ → مصفوفة فارغة (المستهلك يعرض حالته التمهيدية الصادقة).
   */
  function searchDistricts(index, query, limit) {
    const q = normalizeAr(query);
    if (!q) return [];
    const scored = [];
    for (const e of index) {
      const s = scoreEntry(e, q);
      if (s > 0) scored.push({ s, e });
    }
    scored.sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name, "ar"));
    return scored.slice(0, limit || 12).map((x) => x.e);
  }

  /* ── المسافات ونقاط التركّز ── */

  const R_EARTH_KM = 6371.0088; // نصف القطر المتوسط المعتمد
  const rad = (deg) => (deg * Math.PI) / 180;

  /** مسافة haversine بالكيلومتر بين نقطتي [lat,lng] */
  function distanceKm(a, b) {
    const dLat = rad(b[0] - a[0]);
    const dLng = rad(b[1] - a[1]);
    const s = Math.sin(dLat / 2) ** 2
      + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
    return 2 * R_EARTH_KM * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  /**
   * نقاط التركّز الرقابي ضمن نصف قطر من مركز حي — تصاعدياً بالمسافة،
   * km بمنزلة عشرية واحدة (تكفي عرضياً؛ المواقع توضيحية من سجل المنصة أصلاً).
   */
  function hotspotsNear(geo, centroid, radiusKm) {
    const r = radiusKm == null ? 3 : radiusKm;
    const out = [];
    if (!geo || !geo.hotspots || !centroid) return out;
    for (const hs of geo.hotspots) {
      const km = distanceKm(centroid, [hs.lat, hs.lng]);
      if (km <= r) {
        out.push({ sector: hs.sector, density: hs.density,
          lat: hs.lat, lng: hs.lng, km: Math.round(km * 10) / 10 });
      }
    }
    out.sort((a, b) => a.km - b.km);
    return out;
  }

  /** مركز قطاع تقريبي: متوسط مراكز أحيائه (مرآة geomap) */
  function sectorCentroid(geo, sectorId) {
    const list = geo && geo.sectors ? geo.sectors[sectorId] || [] : [];
    if (!list.length) return null;
    let lat = 0, lng = 0;
    for (const d of list) { lat += d.centroid[0]; lng += d.centroid[1]; }
    return [lat / list.length, lng / list.length];
  }

  /* ── مصنع الإسقاط ── */

  /**
   * إسقاط متساوي البعد مصحح بجيب تمام خط العرض الأوسط — الحسابات ذاتها
   * المعتمدة في geomap.js (وضع SVG) كي تتطابق خرائط الأطلس المصغرة هندسياً
   * مع الخريطة الرئيسة. bounds: [[latMin,lngMin],[latMax,lngMax]].
   */
  function projector(bounds, viewWidth) {
    const VW = viewWidth || 1000;
    const [[latMin, lngMin], [latMax, lngMax]] = bounds;
    const latMid = (latMin + latMax) / 2;
    const kx = Math.cos(rad(latMid));
    const S = VW / ((lngMax - lngMin) * kx);
    const VH = Math.round((latMax - latMin) * S);
    const px = (lng) => (lng - lngMin) * kx * S;
    const py = (lat) => (latMax - lat) * S;

    /** سلسلة d جاهزة لوسم <path> من حلقات [[lat,lng],…] (مرآة geomap) */
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

    return { w: VW, h: VH, px, py, ringPath };
  }

  return {
    SECTOR_ORDER, normalizeAr, normDistrict, sampleIndex,
    districtIndex, findByKey, searchDistricts,
    distanceKm, hotspotsNear, sectorCentroid, projector,
  };
})();
