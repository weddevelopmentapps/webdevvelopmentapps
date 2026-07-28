/* ============================================================
   DataStore — repository layer with pluggable persistence adapter
   (IT-spec §1.1). UI code calls RGP.store only — never localStorage.
   Today: LocalStorageAdapter. Phase 2: the Amanah CRM/REST adapter
   implements the same interface and swaps in without UI changes.
   ============================================================ */
"use strict";

(function () {
  var SCHEMA_VERSION = 1;
  var LS_KEY = "rgp.v" + SCHEMA_VERSION;

  function LocalStorageAdapter(key) { this.key = key; this._t = null; }
  LocalStorageAdapter.prototype.load = function () {
    try {
      var raw = localStorage.getItem(this.key);
      if (!raw) return null;
      var st = JSON.parse(raw);
      if (!st || !st.settings || st.settings.schemaVersion !== SCHEMA_VERSION) return null;
      if (st.settings.seedVersion !== window.SEED.settings.seedVersion) return null; /* new seed shipped */
      return st;
    } catch (e) { return null; /* corrupted → seed */ }
  };
  LocalStorageAdapter.prototype.save = function (state) {
    var self = this;
    clearTimeout(this._t);
    this._t = setTimeout(function () {
      try { localStorage.setItem(self.key, JSON.stringify(state)); }
      catch (e) { RGP.bus.emit("store:saveError", e); }
    }, 250);
  };
  LocalStorageAdapter.prototype.clear = function () {
    try { localStorage.removeItem(this.key); } catch (e) { /* noop */ }
  };

  var adapter = new LocalStorageAdapter(LS_KEY);

  var Store = RGP.store = {
    state: null,

    init: function () {
      var loaded = adapter.load();
      Store.state = loaded || Store.freshState();
      if (!loaded) adapter.save(Store.state);
      return Store.state;
    },

    freshState: function () { return RGP.deepClone(window.SEED); },

    save: function () { adapter.save(Store.state); },

    resetToSeed: function () {
      adapter.clear();
      Store.state = Store.freshState();
      adapter.save(Store.state);
      RGP.bus.emit("store:reset");
    },

    exportSnapshot: function () { return JSON.stringify(Store.state, null, 2); },

    importSnapshot: function (text) {
      var st = JSON.parse(text); /* throws on invalid JSON */
      if (!st || !st.settings || !Array.isArray(st.requests) || !Array.isArray(st.users)) {
        throw new Error("import:invalid");
      }
      if (st.settings.schemaVersion !== SCHEMA_VERSION) throw new Error("import:schema");
      st.settings.seedVersion = window.SEED.settings.seedVersion;
      Store.state = st;
      adapter.save(st);
      RGP.bus.emit("store:reset");
    },

    /* ---------- lookups ---------- */
    byId: function (coll, id) {
      var arr = Store.state[coll] || [];
      for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
      return null;
    },
    user:      function (id) { return Store.byId("users", id); },
    project:   function (id) { return Store.byId("projects", id); },
    service:   function (id) { return Store.byId("services", id); },
    request:   function (id) { return Store.byId("requests", id); },
    challenge: function (id) { return Store.byId("challenges", id); },
    entity:    function (id) {
      var arr = Store.state.settings.entities || [];
      for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
      return null;
    },
    userName: function (id) {
      if (id === "system") return { ar: "النظام", en: "System" };
      var u = Store.user(id);
      return u ? u.name : { ar: "غير معروف", en: "Unknown" };
    },

    /* ---------- sequence counters (survive export/import; never reused) ---------- */
    nextRequestId: function () {
      var s = Store.state.settings;
      s.requestSeq = (s.requestSeq || 0) + 1;
      return "RQ-" + new Date().getFullYear() + "-" + RGP.zeroPad(s.requestSeq, 4);
    },
    /* official decision-document number: RRM-{YYYY}-{serviceCode}-{seq}
       (rmun-notes §3 — the service code classifies archived documents) */
    nextPermitNo: function (serviceId) {
      var st = Store.state.settings;
      st.permitSeq = (st.permitSeq || 0) + 1;
      var svc = serviceId ? Store.service(serviceId) : null;
      var code = (svc && svc.code) || "GEN";
      return "RRM-" + new Date().getFullYear() + "-" + code + "-" + RGP.zeroPad(st.permitSeq, 4);
    },
    nextChallengeId: function () {
      var s = Store.state.settings;
      s.challengeSeq = (s.challengeSeq || 0) + 1;
      return "CH-" + new Date().getFullYear() + "-" + RGP.zeroPad(s.challengeSeq, 3);
    },
    nextProjectId: function () {
      var s = Store.state.settings;
      s.projectSeq = (s.projectSeq || 0) + 1;
      return "PRJ-" + new Date().getFullYear() + "-" + RGP.zeroPad(s.projectSeq, 3);
    },

    /* ---------- audit (append-only) ---------- */
    audit: function (type, entityType, entityId, payload) {
      var actor = RGP.auth && RGP.auth.current();
      Store.state.auditEvents.unshift({
        id: RGP.uid("aud"),
        at: RGP.nowISO(),
        actorId: actor ? actor.id : "system",
        actorRole: actor ? actor.role : "system",
        type: type, entityType: entityType, entityId: entityId,
        payload: payload || null
      });
      if (Store.state.auditEvents.length > 1500) Store.state.auditEvents.length = 1500;
      Store.save();
    },

    /* ---------- notifications ---------- */
    notify: function (userIds, notif) {
      var seen = {};
      (Array.isArray(userIds) ? userIds : [userIds]).forEach(function (uid) {
        if (!uid || seen[uid]) return;
        seen[uid] = 1;
        Store.state.notifications.unshift({
          id: RGP.uid("ntf"),
          userId: uid,
          at: RGP.nowISO(),
          read: false,
          kind: notif.kind || "info",
          title: notif.title,          /* {ar,en} */
          body: notif.body || null,    /* {ar,en} */
          link: notif.link || null
        });
      });
      if (Store.state.notifications.length > 900) Store.state.notifications.length = 900;
      Store.save();
      RGP.bus.emit("notify");
    },

    unreadCount: function (userId) {
      return Store.state.notifications.filter(function (n) { return n.userId === userId && !n.read; }).length;
    },

    usersByRole: function (role) {
      return Store.state.users.filter(function (u) { return u.role === role && u.active !== false; });
    },
    managers: function () { return Store.usersByRole("platform_manager"); },
    managerIds: function () { return Store.managers().map(function (u) { return u.id; }); }
  };

  /* ---------- simulated integration connectors (IT-spec §1.1, T9.11) ----------
     Each result rendered with the «بيانات محاكاة / Simulated» badge. */
  RGP.connectors = {
    list: function () { return Store.state.settings.connectors || []; },

    ping: function (id, cb) {
      var latency = 300 + (RGP.hash32(id + Date.now()) % 600);
      setTimeout(function () {
        var c = RGP.connectors.list().filter(function (x) { return x.id === id; })[0];
        if (c) { c.lastPingAt = RGP.nowISO(); c.lastLatencyMs = latency; Store.save(); }
        cb({ ok: true, latencyMs: latency });
      }, RGP.REDUCED_MOTION ? 0 : latency);
    },

    /* GIS parcel lookup — deterministic fake parcel from parcel number */
    gisLookup: function (parcelNo, cb) {
      var seedNum = RGP.hash32(String(parcelNo || ""));
      var districts = [
        { ar: "العليا", en: "Al Olaya" }, { ar: "الملقا", en: "Al Malqa" },
        { ar: "حطين", en: "Hittin" }, { ar: "العارض", en: "Al Arid" },
        { ar: "الدرعية", en: "Ad Diriyah" }, { ar: "النرجس", en: "Al Narjis" },
        { ar: "السفارات", en: "Diplomatic Quarter" }, { ar: "لبن", en: "Laban" }
      ];
      var d = districts[seedNum % districts.length];
      var parcel = {
        parcelNo: String(parcelNo),
        district: d,
        planNo: "م/" + (2400 + (seedNum % 900)),
        areaSqm: 1500 + (seedNum % 48500),
        landUse: [{ ar: "سكني", en: "Residential" }, { ar: "تجاري", en: "Commercial" },
                  { ar: "متعدد الاستخدام", en: "Mixed-use" }][seedNum % 3],
        lat: 24.55 + (seedNum % 400) / 1000,
        lng: 46.45 + ((seedNum >> 8) % 400) / 1000,
        simulated: true
      };
      setTimeout(function () { cb(parcel); }, RGP.REDUCED_MOTION ? 0 : 420);
    }
  };
})();
