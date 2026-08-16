/* import-xlsx.js — مستورد platform-data.xlsx في المتصفح (معاينة الإدارة)
   ──────────────────────────────────────────────────────────────────────
   قارئ XLSX حتمي بلا اعتماديات: ZIP (مخزَّن/deflate عبر DecompressionStream)
   + سلاسل مشتركة + خلايا بالمرساة. يلتزم حرفياً ببيان المحلل V1
   (window.WORKBOOK_MANIFEST): خلايا مبيضة بالاسم، لا مطابقة عربية تقريبية،
   تجاهل خلايا الصيغ ونتائجها المخبأة، وإعادة حساب كل الفحوص من الخام.

   هذا مسار «معاينة» فقط: النشر النهائي يعيد التحليل والتحقق في مسار موثوق
   (tools/import_workbook.py محلياً، أو Edge Function عند تفعيل Supabase). */
"use strict";

RH.data.importXlsx = (function () {
  const M = () => window.WORKBOOK_MANIFEST;

  // ── طبقة ZIP ──
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("متصفحك لا يدعم فك الضغط المدمج (DecompressionStream) — استخدم Chrome أو Edge أو Safari حديثاً");
    }
    const ds = new DecompressionStream("deflate-raw");
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    const buf = await new Response(stream).arrayBuffer();
    return new Uint8Array(buf);
  }

  async function readZip(buffer) {
    const u8 = new Uint8Array(buffer);
    const dv = new DataView(buffer);
    // البحث عن سجل نهاية الدليل المركزي (EOCD)
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66_000); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("الملف ليس ملف XLSX سليماً (بنية ZIP تالفة)");
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const entries = new Map();
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(off, true) !== 0x02014b50) throw new Error("دليل ZIP تالف");
      const method = dv.getUint16(off + 10, true);
      const compSize = dv.getUint32(off + 20, true);
      const nameLen = dv.getUint16(off + 28, true);
      const extraLen = dv.getUint16(off + 30, true);
      const commentLen = dv.getUint16(off + 32, true);
      const localOff = dv.getUint32(off + 42, true);
      const name = new TextDecoder().decode(u8.subarray(off + 46, off + 46 + nameLen));
      entries.set(name, { method, compSize, localOff });
      off += 46 + nameLen + extraLen + commentLen;
    }
    async function file(name) {
      const e = entries.get(name);
      if (!e) return null;
      const nameLen = dv.getUint16(e.localOff + 26, true);
      const extraLen = dv.getUint16(e.localOff + 28, true);
      const start = e.localOff + 30 + nameLen + extraLen;
      const raw = u8.subarray(start, start + e.compSize);
      if (e.method === 0) return raw;
      if (e.method === 8) return inflateRaw(raw);
      throw new Error("طريقة ضغط غير مدعومة داخل الملف");
    }
    return { entries, file };
  }

  const parseXml = (bytes) =>
    new DOMParser().parseFromString(new TextDecoder().decode(bytes), "application/xml");

  // ── فحوص الأمان قبل أي تحليل محتوى ──
  function securityChecks(fileName, size, zip) {
    const errors = [];
    const lim = M().limits;
    if (!/\.xlsx$/i.test(fileName)) {
      errors.push("يُقبل ملف بامتداد ‎.xlsx فقط — رُفض: " + fileName);
    }
    if (size > lim.max_bytes) {
      errors.push(`حجم الملف يتجاوز الحد (${Math.round(lim.max_bytes / 1e6)} م.ب)`);
    }
    for (const name of zip.entries.keys()) {
      if (/vbaProject/i.test(name)) errors.push("رُفض: الملف يحتوي وحدات ماكرو (xlsm مقنَّع)");
      if (/^xl\/externalLinks\//.test(name)) errors.push("رُفض: الملف يحتوي روابط خارجية");
      if (/^\.\.|\\/.test(name)) errors.push("رُفض: مسار داخلي مشبوه في الأرشيف");
    }
    if (zip.entries.has("EncryptionInfo") || !zip.entries.has("[Content_Types].xml")) {
      errors.push("رُفض: ملف مشفَّر أو ليس بصيغة Office المفتوحة");
    }
    return errors;
  }

  // ── قراءة الأوراق ──
  function colToNum(col) {
    let n = 0;
    for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n;
  }

  function cellsOf(sheetDoc, shared) {
    // خريطة العنوان → {v, t, hasFormula}. خلايا الصيغ تُوسم وتُتجاهل لاحقاً.
    const map = new Map();
    for (const c of sheetDoc.getElementsByTagName("c")) {
      const rAttr = c.getAttribute("r");
      if (!rAttr) continue;
      const t = c.getAttribute("t") || "n";
      const hasFormula = c.getElementsByTagName("f").length > 0;
      let v = null;
      const vEl = c.getElementsByTagName("v")[0];
      if (t === "inlineStr") {
        const tEl = c.getElementsByTagName("t")[0];
        v = tEl ? tEl.textContent : null;
      } else if (vEl) {
        v = t === "s" ? shared[parseInt(vEl.textContent, 10)] : vEl.textContent;
      }
      map.set(rAttr, { v, t, hasFormula });
    }
    return map;
  }

  const norm = (s) => String(s == null ? "" : s)
    .normalize("NFC").replace(/\s+/g, " ").trim();

  function asInt(cell, addr, sheet, errors) {
    if (!cell || cell.v == null || cell.v === "") {
      errors.push(`خلية إلزامية فارغة: ${sheet}!${addr}`);
      return null;
    }
    if (cell.hasFormula) {
      errors.push(`الخلية ${sheet}!${addr} صيغة — البيان V1 يتطلب قيمة خام`);
      return null;
    }
    const n = Number(String(cell.v).trim());
    if (!Number.isFinite(n)) {
      errors.push(`قيمة غير رقمية في ${sheet}!${addr}: «${cell.v}» — أدخل رقماً لاتينياً خاماً`);
      return null;
    }
    if (!Number.isInteger(n)) {
      errors.push(`قيمة غير صحيحة العدد في ${sheet}!${addr}: ${cell.v}`);
      return null;
    }
    if (n < 0) {
      errors.push(`قيمة سالبة مرفوضة في ${sheet}!${addr}`);
      return null;
    }
    return n;
  }

  /** الاستيراد الكامل: يعيد {ok, errors[], warnings[], extracted, diff} */
  async function importFile(file) {
    const errors = [];
    const warnings = [];
    let zip;
    try {
      zip = await readZip(await file.arrayBuffer());
    } catch (e) {
      return { ok: false, errors: ["تعذر فتح الملف: " + e.message], warnings, extracted: null };
    }
    errors.push(...securityChecks(file.name, file.size, zip));
    if (errors.length) return { ok: false, errors, warnings, extracted: null };

    // أسماء الأوراق
    const wbDoc = parseXml(await zip.file("xl/workbook.xml"));
    const relsDoc = parseXml(await zip.file("xl/_rels/workbook.xml.rels"));
    const rels = new Map();
    for (const r of relsDoc.getElementsByTagName("Relationship")) {
      rels.set(r.getAttribute("Id"), r.getAttribute("Target").replace(/^\//, ""));
    }
    const sheets = new Map();
    const sheetEls = Array.from(wbDoc.getElementsByTagName("sheet"));
    if (sheetEls.length > M().limits.max_sheets) {
      errors.push("عدد الأوراق يتجاوز حد القالب");
    }
    for (const s of sheetEls) {
      const rid = s.getAttribute("r:id") || s.getAttributeNS(
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
      let target = rels.get(rid) || "";
      if (!target.startsWith("xl/")) target = "xl/" + target;
      sheets.set(norm(s.getAttribute("name")), target);
    }
    for (const required of M().required_sheets) {
      if (!sheets.has(norm(required))) errors.push(`ورقة إلزامية مفقودة: «${required}»`);
    }
    const extraSheets = [...sheets.keys()].filter(
      (n) => !M().required_sheets.some((r) => norm(r) === n));
    if (extraSheets.length) {
      warnings.push("أوراق زائدة عن القالب (ستُتجاهل): " + extraSheets.join("، "));
    }
    if (errors.length) return { ok: false, errors, warnings, extracted: null };

    // السلاسل المشتركة
    const shared = [];
    const sstBytes = await zip.file("xl/sharedStrings.xml");
    if (sstBytes) {
      const sstDoc = parseXml(sstBytes);
      for (const si of sstDoc.getElementsByTagName("si")) {
        shared.push(Array.from(si.getElementsByTagName("t"))
          .map((t) => t.textContent).join(""));
      }
    }
    const sheetCells = {};
    for (const [name, target] of sheets) {
      sheetCells[name] = cellsOf(parseXml(await zip.file(target)), shared);
    }
    const cell = (sheet, addr) => sheetCells[norm(sheet)] && sheetCells[norm(sheet)].get(addr);

    // ── الاستخراج بالمراسي V1 ──
    const X = { sectors: {}, monthly: {} };
    const S_ORDER = ["north", "east", "center", "west", "south"];
    const S_NAMES = M().anchors["الطلب"].sector_table.expected_labels;

    X.total_demand = asInt(cell("الطلب", "C4"), "C4", "الطلب", errors);
    S_ORDER.forEach((sec, i) => {
      const row = 7 + i;
      const label = norm((cell("الطلب", "B" + row) || {}).v);
      if (label !== norm(S_NAMES[i])) {
        errors.push(`مرساة منقولة: الطلب!B${row} — المتوقع «${S_NAMES[i]}» والموجود «${label || "فارغ"}»`);
      }
      X.sectors[sec] = { demand: asInt(cell("الطلب", "C" + row), "C" + row, "الطلب", errors) };
    });

    X.baseline = {
      building: asInt(cell("التراخيص", "C5"), "C5", "التراخيص", errors),
      operational: asInt(cell("التراخيص", "D5"), "D5", "التراخيص", errors),
      beds: asInt(cell("التراخيص", "E5"), "E5", "التراخيص", errors),
    };
    X.monthly.licensing = [];
    for (let i = 0; i < 12; i++) {
      const row = 8 + i;
      X.monthly.licensing.push({
        label: norm((cell("التراخيص", "B" + row) || {}).v),
        building: asInt(cell("التراخيص", "C" + row), "C" + row, "التراخيص", errors),
        operational: asInt(cell("التراخيص", "D" + row), "D" + row, "التراخيص", errors),
        beds: asInt(cell("التراخيص", "E" + row), "E" + row, "التراخيص", errors),
      });
    }
    S_ORDER.forEach((sec, i) => {
      const row = 23 + i;
      Object.assign(X.sectors[sec], {
        building: asInt(cell("التراخيص", "C" + row), "C" + row, "التراخيص", errors),
        operational: asInt(cell("التراخيص", "D" + row), "D" + row, "التراخيص", errors),
        beds: asInt(cell("التراخيص", "E" + row), "E" + row, "التراخيص", errors),
      });
    });

    S_ORDER.forEach((sec, i) => {
      const row = 5 + i;
      Object.assign(X.sectors[sec], {
        monitors: asInt(cell("الرقابة", "C" + row), "C" + row, "الرقابة", errors),
        violations: asInt(cell("الرقابة", "D" + row), "D" + row, "الرقابة", errors),
        visits: asInt(cell("الرقابة", "E" + row), "E" + row, "الرقابة", errors),
        closures: asInt(cell("الرقابة", "F" + row), "F" + row, "الرقابة", errors),
      });
    });
    X.violation_types = [];
    for (let i = 0; i < 6; i++) {
      const row = 15 + i;
      X.violation_types.push({
        name: norm((cell("الرقابة", "B" + row) || {}).v),
        count: asInt(cell("الرقابة", "C" + row), "C" + row, "الرقابة", errors),
      });
    }
    const compCell = cell("الرقابة", "C12");
    X.compliance = compCell && compCell.v != null ? Number(compCell.v) : null;

    X.occupied_beds = asInt(cell("السياق", "C4"), "C4", "السياق", errors);
    X.data_as_of = norm((cell("السياق", "C5") || {}).v);
    X.calculation_date = norm((cell("السياق", "C6") || {}).v);
    X.facility_types = [];
    for (let i = 0; i < 3; i++) {
      const row = 9 + i;
      X.facility_types.push({
        name: norm((cell("السياق", "B" + row) || {}).v),
        count: asInt(cell("السياق", "C" + row), "C" + row, "السياق", errors),
      });
    }
    X.collar = {
      blue: asInt(cell("السياق", "C15"), "C15", "السياق", errors),
      white: asInt(cell("السياق", "C16"), "C16", "السياق", errors),
    };
    X.economic = [];
    for (let i = 0; i < 6; i++) {
      const row = 20 + i;
      X.economic.push({
        name: norm((cell("السياق", "B" + row) || {}).v),
        demand: asInt(cell("السياق", "C" + row), "C" + row, "السياق", errors),
      });
    }
    X.monthly.monitoring = [];
    for (let i = 0; i < 12; i++) {
      const row = 30 + i;
      X.monthly.monitoring.push({
        label: norm((cell("السياق", "B" + row) || {}).v),
        visits: asInt(cell("السياق", "C" + row), "C" + row, "السياق", errors),
        violations: asInt(cell("السياق", "D" + row), "D" + row, "السياق", errors),
      });
    }
    X.scenarios = [];
    for (let i = 0; i < 10; i++) {
      const row = 46 + i;
      X.scenarios.push({
        label: norm((cell("السياق", "B" + row) || {}).v),
        conservative: asInt(cell("السياق", "C" + row), "C" + row, "السياق", errors),
        base: asInt(cell("السياق", "D" + row), "D" + row, "السياق", errors),
        optimistic: asInt(cell("السياق", "E" + row), "E" + row, "السياق", errors),
      });
    }
    X.neighbourhoods = [];
    for (let i = 0; i < 20; i++) {
      const row = 5 + i;
      X.neighbourhoods.push({
        name: norm((cell("الأحياء", "B" + row) || {}).v),
        sector_name: norm((cell("الأحياء", "C" + row) || {}).v),
        building: asInt(cell("الأحياء", "D" + row), "D" + row, "الأحياء", errors),
        operational: asInt(cell("الأحياء", "E" + row), "E" + row, "الأحياء", errors),
        beds: asInt(cell("الأحياء", "F" + row), "F" + row, "الأحياء", errors),
        violations: asInt(cell("الأحياء", "G" + row), "G" + row, "الأحياء", errors),
      });
    }

    if (errors.length) return { ok: false, errors, warnings, extracted: null };

    // ── إعادة حساب الفحوص من الخام (لا ثقة بخلايا ✓) ──
    const sum = (a, f) => a.reduce((t, x) => t + f(x), 0);
    const secArr = S_ORDER.map((s) => X.sectors[s]);
    const recon = (label, ok) => { if (!ok) errors.push("فشل فحص الاتساق: " + label); };
    recon("مجموع طلب القطاعات = الإجمالي", sum(secArr, (s) => s.demand) === X.total_demand);
    for (const [key, label] of [["building", "رخص البناء"], ["operational", "الرخص التشغيلية"], ["beds", "الأسرّة"]]) {
      recon(`خط الأساس + الشهري = مجموع القطاعات (${label})`,
        X.baseline[key] + sum(X.monthly.licensing, (m) => m[key]) === sum(secArr, (s) => s[key]));
    }
    recon("أنواع المخالفات = مخالفات القطاعات",
      sum(X.violation_types, (t) => t.count) === sum(secArr, (s) => s.violations));
    recon("النشاط الشهري يطابق إجماليات الرقابة",
      sum(X.monthly.monitoring, (m) => m.visits) === sum(secArr, (s) => s.visits)
      && sum(X.monthly.monitoring, (m) => m.violations) === sum(secArr, (s) => s.violations));
    recon("الياقات = إجمالي الطلب", X.collar.blue + X.collar.white === X.total_demand);
    recon("الأنشطة الاقتصادية = إجمالي الطلب", sum(X.economic, (e) => e.demand) === X.total_demand);
    recon("أنواع الإيواء = الرخص التشغيلية",
      sum(X.facility_types, (t) => t.count) === sum(secArr, (s) => s.operational));
    recon("المشغول ≤ الطاقة", X.occupied_beds <= sum(secArr, (s) => s.beds));
    recon("ترتيب السيناريوهات (متحفظ ≥ أساسي ≥ متفائل)",
      X.scenarios.every((r) => r.conservative >= r.base && r.base >= r.optimistic));
    const sNameOf = (i) => norm(S_NAMES[S_ORDER.indexOf(i)]);
    for (const sec of S_ORDER) {
      const rows = X.neighbourhoods.filter((n) => n.sector_name === sNameOf(sec));
      recon(`عينة أحياء «${sNameOf(sec)}» ≤ إجمالي القطاع`,
        sum(rows, (n) => n.beds) <= X.sectors[sec].beds
        && sum(rows, (n) => n.violations) <= X.sectors[sec].violations);
    }

    if (errors.length) return { ok: false, errors, warnings, extracted: null };

    return { ok: true, errors, warnings, extracted: X, diff: diffAgainst(X) };
  }

  /** مقارنة المستخرج بالإصدار المنشور الحالي — تُعرض قبل أي اعتماد */
  function diffAgainst(X) {
    const rel = RH.data.store.release();
    const rows = [];
    const cmp = (label, oldV, newV) => rows.push({ label, oldV, newV, changed: oldV !== newV });
    cmp("إجمالي الطلب", rel.metrics.total_demand.value, X.total_demand);
    cmp("الأسرّة المشغولة", rel.metrics.occupied_beds.value, X.occupied_beds);
    for (const s of rel.sectors) {
      const n = X.sectors[s.id];
      cmp(`${s.name} — الطلب`, s.demand, n.demand);
      cmp(`${s.name} — الأسرّة`, s.beds, n.beds);
      cmp(`${s.name} — المخالفات`, s.violations, n.violations);
    }
    cmp("رخص البناء (خط الأساس)", rel.baseline.building, X.baseline.building);
    cmp("الرخص التشغيلية (خط الأساس)", rel.baseline.operational, X.baseline.operational);
    cmp("الأسرّة (خط الأساس)", rel.baseline.beds, X.baseline.beds);
    return { rows, changed: rows.filter((r) => r.changed).length };
  }

  /** تطبيق المستخرج على مسودة (لا يمس الوحدات المملوكة لمصادر أخرى) */
  function applyToDraft(draft, X, fileMeta) {
    const S_ORDER = ["north", "east", "center", "west", "south"];
    draft.metrics.total_demand.value = X.total_demand;
    draft.metrics.occupied_beds.value = X.occupied_beds;
    draft.metrics.current_building.value =
      X.baseline.building + X.monthly.licensing.reduce((a, m) => a + m.building, 0);
    draft.metrics.current_operational.value =
      X.baseline.operational + X.monthly.licensing.reduce((a, m) => a + m.operational, 0);
    draft.metrics.licensed_beds.value =
      X.baseline.beds + X.monthly.licensing.reduce((a, m) => a + m.beds, 0);
    draft.metrics.baseline_building.value = X.baseline.building;
    draft.metrics.baseline_operational.value = X.baseline.operational;
    draft.metrics.baseline_beds.value = X.baseline.beds;
    draft.metrics.blue_collar.value = X.collar.blue;
    draft.metrics.white_collar.value = X.collar.white;
    draft.baseline = { ...X.baseline };
    draft.collar = { ...X.collar };
    for (const s of draft.sectors) {
      Object.assign(s, X.sectors[s.id]);
    }
    draft.metrics.total_monitors.value = draft.sectors.reduce((a, s) => a + s.monitors, 0);
    draft.metrics.total_visits.value = draft.sectors.reduce((a, s) => a + s.visits, 0);
    draft.metrics.total_violations.value = draft.sectors.reduce((a, s) => a + s.violations, 0);
    draft.metrics.total_closures.value = draft.sectors.reduce((a, s) => a + s.closures, 0);
    draft.metrics.south_violations.value = draft.sectors.find((s) => s.id === "south").violations;
    draft.monthly.licensing.forEach((m, i) => Object.assign(m, X.monthly.licensing[i]));
    draft.monthly.monitoring.forEach((m, i) => Object.assign(m, X.monthly.monitoring[i]));
    draft.violation_types.forEach((t, i) => { t.count = X.violation_types[i].count; });
    draft.facility_types.forEach((t, i) => { t.count = X.facility_types[i].count; });
    draft.economic_activities.forEach((a, i) => { a.demand = X.economic[i].demand; });
    draft.scenarios.rows.forEach((r, i) => {
      r.conservative = X.scenarios[i].conservative;
      r.base = X.scenarios[i].base;
      r.optimistic = X.scenarios[i].optimistic;
    });
    draft.neighbourhoods.rows.forEach((n, i) => {
      const x = X.neighbourhoods[i];
      Object.assign(n, { name: x.name, building: x.building, operational: x.operational,
        beds: x.beds, violations: x.violations });
    });
    if (draft.compliance) draft.compliance.value = X.compliance;
    draft.meta.data_as_of = X.data_as_of || draft.meta.data_as_of;
    draft.meta.calculation_date = X.calculation_date || draft.meta.calculation_date;
    // إعادة توليد المشتقات المخزنة من الخام الجديد (تبقى مرآة derive.js)
    const der = RH.data.derive.compute(draft);
    for (const [k, v] of Object.entries(der)) {
      if (draft.derived[k] && typeof draft.derived[k] === "object" && "value" in draft.derived[k]) {
        draft.derived[k].value = v;
      }
    }
    draft.derived.sector_derived = der.sector ? Object.fromEntries(
      Object.entries(der.sector).map(([sid, sv]) => [sid, {
        coverage_pct: sv.coverage_pct, coverage_raw: sv.coverage_raw,
        deficit_beds: sv.deficit_beds, violations_share_pct: sv.violations_share_pct,
        visits_share_pct: sv.visits_share_pct, demand_share_pct: sv.demand_share_pct,
      }])) : draft.derived.sector_derived;
    draft.derived.rankings = der.rankings;
    // سجل المصدر الجديد — الملف الأصلي يبقى خاصاً (لا يُضمَّن في الإصدار)
    draft.sources = [{
      id: "src-workbook-" + Date.now().toString(36),
      name: fileMeta.name, kind: "workbook",
      template_version: M().template_version,
      sha256: fileMeta.sha256 || null,
      size: fileMeta.size,
      imported_at: new Date().toISOString(),
      private: true,
    }];
    return draft;
  }

  return { importFile, applyToDraft };
})();
