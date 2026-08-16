/* auth.js — بوابة الدخول الإدارية
   ──────────────────────────────
   وضعان صريحان:
   • وضع Supabase (window.SUPABASE_CONFIG موجود): مصادقة فعلية بدعوة فقط عبر
     PKCE — أكواد التفعيل في supabase/؛ هذا هو وضع الإنتاج المعتمد.
   • الوضع المحلي التجريبي (بيئة التسليم الحالية): عبارة مرور محلية بتجزئة
     مملّحة مكررة (PBKDF2 عبر WebCrypto حيث يتاح، وإلا SHA-256 مكرر 20,000 مرة).
     يُعرض وسم «وضع محلي تجريبي» دائماً — هذا ضبط وصول جهازي لا مصادقة خادم،
     وحدوده موثقة في ADMIN_GUIDE_AR.md. لا يمنح أي حماية لبيانات الخادم.
   الجلسة في sessionStorage (تنتهي بإغلاق التبويب). لا localStorage للاعتماد. */
"use strict";

RH.admin.auth = (function () {
  const SESSION_KEY = "rh-admin-session";
  const ITER = 20_000;

  async function hashPassphrase(pass, salt) {
    if (window.crypto && crypto.subtle) {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw", enc.encode(pass), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits({
        name: "PBKDF2", salt: enc.encode(salt), iterations: 310_000, hash: "SHA-256",
      }, key, 256);
      return "pbkdf2:" + Array.from(new Uint8Array(bits))
        .map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    // file:// بلا سياق آمن: تجزئة مكررة (أفضل الممكن محلياً — موثق كحد أمني)
    let h = salt + ":" + pass;
    for (let i = 0; i < ITER; i++) h = RH.data.sha256(h + salt);
    return "iter-sha256:" + h;
  }

  const kvGet = async (key) => {
    // نستخدم مخزن kv نفسه عبر store (يتشارك القاعدة)
    return new Promise((res) => {
      const req = indexedDB.open("rh-presentation");
      req.onsuccess = () => {
        const db = req.result;
        try {
          const r = db.transaction("kv").objectStore("kv").get(key);
          r.onsuccess = () => { res(r.result); db.close(); };
          r.onerror = () => { res(undefined); db.close(); };
        } catch (_e) { res(undefined); db.close(); }
      };
      req.onerror = () => res(undefined);
    });
  };
  const kvSet = async (key, val) => new Promise((res) => {
    const req = indexedDB.open("rh-presentation");
    req.onsuccess = () => {
      const db = req.result;
      const t = db.transaction("kv", "readwrite");
      t.objectStore("kv").put(val, key);
      t.oncomplete = () => { res(true); db.close(); };
      t.onerror = () => { res(false); db.close(); };
    };
    req.onerror = () => res(false);
  });

  async function isProvisioned() {
    return !!(await kvGet("admin_credential"));
  }

  async function provision(passphrase, displayName) {
    if (passphrase.length < 10) {
      throw new Error("عبارة المرور يجب ألا تقل عن 10 محارف");
    }
    let salt;
    if (window.crypto && crypto.getRandomValues) {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      salt = Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
    } else {
      salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    const digest = await hashPassphrase(passphrase, salt);
    await kvSet("admin_credential", { salt, digest, name: displayName || "مدير المنصة",
      role: "publisher", created_at: new Date().toISOString() });
    await RH.data.store.audit(displayName || "مدير المنصة", "auth.provision_local", {});
  }

  async function signIn(passphrase) {
    const cred = await kvGet("admin_credential");
    if (!cred) throw new Error("لم تتم تهيئة الوضع المحلي بعد");
    const digest = await hashPassphrase(passphrase, cred.salt);
    if (digest !== cred.digest) {
      await RH.data.store.audit("مجهول", "auth.failed_attempt", {});
      throw new Error("عبارة المرور غير صحيحة");
    }
    const session = {
      name: cred.name, role: cred.role, mode: "local-demo",
      at: new Date().toISOString(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    await RH.data.store.audit(cred.name, "auth.sign_in", { mode: "local-demo" });
    return session;
  }

  function session() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch (_e) { return null; }
  }

  function signOut() {
    const s = session();
    if (s) RH.data.store.audit(s.name, "auth.sign_out", {});
    sessionStorage.removeItem(SESSION_KEY);
  }

  /** أدوار: العارض يقرأ، المحرر يحرر المسودة، الناشر ينشر ويتراجع */
  const can = {
    edit: (s) => s && ["editor", "publisher", "admin"].includes(s.role),
    publish: (s) => s && ["publisher", "admin"].includes(s.role),
    admin: (s) => s && s.role === "admin",
  };

  const supabaseEnabled = () => !!window.SUPABASE_CONFIG;

  return { isProvisioned, provision, signIn, signOut, session, can, supabaseEnabled };
})();
