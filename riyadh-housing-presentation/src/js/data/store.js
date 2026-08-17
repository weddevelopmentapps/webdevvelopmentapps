/* store.js — مخزن الإصدارات والمسودات
   ─────────────────────────────────────
   عقد القراءة للمقدِّم: «إصدار منشور واحد غير قابل للتغيير» — يبدأ من الإصدار
   المضمّن وقت البناء (window.RELEASE)، وإن وُجد في المخزن المحلي إصدار منشور
   أحدث لنفس schema_version فهو المعتمد. لا خلط بيانات من إصدارين أبداً.

   الإدارة تعمل على «مسودة» منفصلة كلياً، بنسخة أساس متوقعة
   (expected_base_release_id) تُرفض عندها تعارضات التحرير الصامتة.

   وضعا تشغيل:
   • محلي (الحالي): IndexedDB — كامل الوظيفة، موسوم في الواجهة «وضع محلي تجريبي»
     لأن مصادقة Supabase غير مفعّلة في بيئة التسليم (انظر ARCHITECTURE.md §7).
   • Supabase: يُفعَّل بتوفير window.SUPABASE_CONFIG — الواجهة نفسها، والتحقق
     النهائي والنشر عبر RPC موثوق (supabase/migrations + edge function مسلَّمة).

   sha256 خالص بجافاسكريبت لأن crypto.subtle غير متاح عبر file:// (سياق غير آمن). */
"use strict";

RH.data.sha256 = (function () {
  // تنفيذ SHA-256 مدمج (حتمي، بلا اعتماديات) — للاستخدام على نصوص UTF-8
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  function hash(str) {
    const bytes = new TextEncoder().encode(str);
    const l = bytes.length;
    const bitLen = l * 8;
    const withOne = new Uint8Array(((l + 8) >> 6 << 6) + 64);
    withOne.set(bytes);
    withOne[l] = 0x80;
    const dv = new DataView(withOne.buffer);
    dv.setUint32(withOne.length - 4, bitLen >>> 0);
    dv.setUint32(withOne.length - 8, Math.floor(bitLen / 0x100000000));

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
      h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const w = new Int32Array(64);
    for (let i = 0; i < withOne.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = dv.getInt32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (hh + S1 + ch + K[t] + w[t]) | 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + hh) | 0;
    }
    return [h0, h1, h2, h3, h4, h5, h6, h7]
      .map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
  }
  return hash;
})();

RH.data.store = (function () {
  const DB_NAME = "rh-presentation";
  const DB_VER = 1;
  let db = null;
  let currentRelease = null;   // الإصدار الوحيد الذي يقرأه المقدِّم
  let derived = null;
  let mode = "embedded";       // embedded | local | supabase

  function canonicalHash(release) {
    const body = {};
    for (const k of Object.keys(release).sort()) {
      if (k === "release" || k === "validation") continue;
      body[k] = release[k];
    }
    return RH.data.sha256(JSON.stringify(body));
  }

  function openDB() {
    return new Promise((resolve) => {
      const _idb = RH.core.storage.idb();
      if (!_idb) return resolve(null);
      const req = _idb.open(DB_NAME, DB_VER);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains("releases")) {
          d.createObjectStore("releases", { keyPath: "release.id" });
        }
        if (!d.objectStoreNames.contains("kv")) d.createObjectStore("kv");
        if (!d.objectStoreNames.contains("audit")) {
          d.createObjectStore("audit", { keyPath: "seq", autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null); // بيئة بلا IndexedDB: نعمل بالمضمّن فقط
    });
  }

  const tx = (storeName, rw, fn) => new Promise((resolve, reject) => {
    if (!db) return resolve(undefined);
    const t = db.transaction(storeName, rw ? "readwrite" : "readonly");
    const s = t.objectStore(storeName);
    const out = fn(s);
    t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
    t.onerror = () => reject(t.error);
  });
  const idbGet = (store, key) => new Promise((res) => {
    if (!db) return res(undefined);
    const r = db.transaction(store).objectStore(store).get(key);
    r.onsuccess = () => res(r.result);
    r.onerror = () => res(undefined);
  });
  const idbAll = (store) => new Promise((res) => {
    if (!db) return res([]);
    const r = db.transaction(store).objectStore(store).getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => res([]);
  });

  /** التهيئة: يحدد الإصدار المعتمد للمقدِّم (المضمّن أو أحدث منشور محلي).
      وضع خاص: ?preview=draft يعرض المسودة في عارض المقدِّم ذاته (للمعاينة
      الإدارية فقط) — لا يُخزن ولا يُخلط بأي إصدار منشور. */
  async function init() {
    const embedded = window.RELEASE;
    if (!embedded) throw new Error("لا يوجد إصدار مضمّن — أعد البناء عبر build.py");
    db = await openDB();
    currentRelease = embedded;
    const previewMode = new URLSearchParams(window.location.search).get("preview") === "draft";
    if (previewMode && db) {
      const d = await idbGet("kv", "draft");
      if (d) {
        try {
          derived = RH.data.derive.compute(d);
          currentRelease = d;
          mode = "preview-draft";
          return currentRelease;
        } catch (e) {
          // مسودة غير قابلة للاشتقاق: نسقط للإصدار المنشور بدل شاشة فارغة
          console.warn("تعذر اشتقاق المسودة للمعاينة:", e.message);
        }
      }
    }
    if (db) {
      const pointer = await idbGet("kv", "current_release_id");
      if (pointer && pointer !== embedded.release.id) {
        const stored = await idbGet("releases", pointer);
        if (stored && stored.schema_version === embedded.schema_version) {
          const v = RH.data.validate.validateRelease(stored);
          if (v.blockers.length === 0) {
            currentRelease = stored;   // إصدار منشور محلياً أحدث ومتحقق منه
            mode = "local";
          }
        }
      }
      // أرشفة الإصدار المضمّن في السجل إن لم يكن موجوداً
      const seeded = await idbGet("releases", embedded.release.id);
      if (!seeded) {
        await tx("releases", true, (s) => s.put(embedded)).catch(() => {});
      }
    }
    try {
      derived = RH.data.derive.compute(currentRelease);
    } catch (e) {
      throw new Error("تعذر اشتقاق قيم الإصدار — " + (e.message || e));
    }
    return currentRelease;
  }

  // ── واجهة القراءة للمقدِّم ──
  const release = () => currentRelease;
  const der = () => derived;
  const sector = (id) => currentRelease.sectors.find((s) => s.id === id);

  // ── واجهة الإدارة (مسودات ونشر وتراجع وتدقيق) ──

  async function getDraft() {
    return (await idbGet("kv", "draft")) || null;
  }

  async function startDraft(actor) {
    const base = currentRelease;
    const draft = JSON.parse(JSON.stringify(base));
    draft.release = {
      id: "draft",
      status: "draft",
      base_release_id: base.release.id,
      draft_version: 1,
      started_by: actor,
      started_at: new Date().toISOString(),
    };
    await tx("kv", true, (s) => s.put(draft, "draft"));
    await audit(actor, "draft.start", { base: base.release.id });
    return draft;
  }

  async function saveDraft(draft, actor, expectedVersion) {
    const existing = await getDraft();
    if (existing && expectedVersion != null
        && existing.release.draft_version !== expectedVersion) {
      const err = new Error("تعارض تحرير: عدّل مستخدم آخر المسودة منذ فتحتها. حدّث الصفحة وادمج تغييراتك.");
      err.code = "draft_conflict";
      throw err;
    }
    draft.release.draft_version = (existing ? existing.release.draft_version : 0) + 1;
    draft.release.updated_at = new Date().toISOString();
    draft.release.updated_by = actor;
    await tx("kv", true, (s) => s.put(draft, "draft"));
    return draft.release.draft_version;
  }

  async function discardDraft(actor) {
    await tx("kv", true, (s) => s.delete("draft"));
    await audit(actor, "draft.discard", {});
  }

  /** النشر: تحقق كامل → لقطة غير قابلة للتغيير → تحديث المؤشر → تدقيق.
      يرفض إن تغيّر الإصدار الأساس منذ بدء المسودة (تفاؤلية التزامن). */
  async function publish(draft, actor, waivers) {
    if (!db) throw new Error("المخزن المحلي غير متاح في هذا المتصفح");
    if (draft.release.base_release_id !== currentRelease.release.id) {
      const err = new Error("رُفض النشر: نُشر إصدار آخر منذ بدء هذه المسودة. أعد فتح مسودة من الإصدار الحالي.");
      err.code = "base_conflict";
      throw err;
    }
    const v = RH.data.validate.validateRelease(draft);
    const hardBlockers = v.blockers;
    if (hardBlockers.length) {
      const err = new Error("رُفض النشر: فحوص حاجبة لم تجتز — " +
        hardBlockers.map((b) => b.label).join("؛ "));
      err.code = "validation";
      err.gates = hardBlockers;
      throw err;
    }
    const unwaived = v.warnings.filter((w) =>
      !(waivers && waivers[w.id] && waivers[w.id].by));
    // الإنذارات تتطلب إقراراً صريحاً (تنازل مسجَّل) — لا نشر بتجاهل صامت
    if (unwaived.length) {
      const err = new Error("النشر يتطلب إقراراً موقَّعاً بكل إنذار مفتوح");
      err.code = "waivers_required";
      err.gates = unwaived;
      throw err;
    }

    const stamp = new Date().toISOString();
    const nextId = "rel-" + stamp.slice(0, 10) + "-" +
      String((await idbAll("releases")).length + 1).padStart(3, "0");
    const snapshot = JSON.parse(JSON.stringify(draft));
    snapshot.release = {
      id: nextId,
      status: "published",
      published_at: stamp,
      published_by: actor,
      base_release_id: draft.release.base_release_id,
      waivers: waivers || {},
      notes: draft.release.notes || "",
    };
    snapshot.release.sha256 = canonicalHash(snapshot);
    Object.freeze(snapshot.release);

    await tx("releases", true, (s) => s.put(snapshot));
    await tx("kv", true, (s) => s.put(nextId, "current_release_id"));
    await tx("kv", true, (s) => s.delete("draft"));
    await audit(actor, "release.publish", {
      id: nextId, base: snapshot.release.base_release_id, sha256: snapshot.release.sha256,
      waivers: Object.keys(waivers || {}),
    });
    currentRelease = snapshot;
    derived = RH.data.derive.compute(currentRelease);
    mode = "local";
    RH.core.bus.emit("release:changed", snapshot);
    return snapshot;
  }

  /** التراجع = إصدار جديد مستنسخ من إصدار سابق — لا تعديل على التاريخ أبداً */
  async function rollback(toReleaseId, actor) {
    const source = await idbGet("releases", toReleaseId);
    if (!source) throw new Error("الإصدار المطلوب غير موجود في السجل");
    const clone = JSON.parse(JSON.stringify(source));
    clone.release = {
      id: "draft",
      status: "draft",
      base_release_id: currentRelease.release.id,
      draft_version: 1,
      started_by: actor,
      started_at: new Date().toISOString(),
      notes: "تراجع إلى " + toReleaseId,
      rollback_of: toReleaseId,
    };
    await tx("kv", true, (s) => s.put(clone, "draft"));
    await audit(actor, "release.rollback_draft", { to: toReleaseId });
    return clone; // يمر بمسار النشر الاعتيادي (تحقق + إقرارات)
  }

  async function history() {
    const all = await idbAll("releases");
    return all.sort((a, b) =>
      (b.release.published_at || "").localeCompare(a.release.published_at || ""));
  }

  async function audit(actor, action, detail) {
    if (!db) return;
    await tx("audit", true, (s) => s.put({
      at: new Date().toISOString(), actor, action, detail: detail || {},
    })).catch(() => {});
  }

  const auditLog = () => idbAll("audit");

  return {
    init, release, der, sector, mode: () => mode,
    getDraft, startDraft, saveDraft, discardDraft,
    publish, rollback, history, audit, auditLog, canonicalHash,
  };
})();
