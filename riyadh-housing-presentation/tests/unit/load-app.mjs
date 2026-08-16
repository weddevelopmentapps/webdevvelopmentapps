/* load-app.mjs — محمّل مشترك لاختبارات الوحدة
   ينفّذ ملفات src الحقيقية بترتيب build.py داخل سياق vm واحد — السكربتات تتشارك
   البيئة المعجمية العامة تماماً كوسوم <script> المتتالية، فتُبنى RH.* حقيقية.
   derive/validate/format/bus نقية بلا DOM وتعمل بلا أي محاكاة جوهرية؛
   المحاكاة الدنيا (window/document/history/btoa) تخدم ns/dom/router فقط. */
"use strict";

import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/* ترتيب الضم = ترتيب الاعتماد (مطابق لتسلسل JS_ORDER للوحدات المُحمَّلة هنا) */
const JS_ORDER = [
  "src/js/core/ns.js",
  "src/js/core/dom.js",
  "src/js/core/format.js",
  "src/js/core/bus.js",
  "src/js/data/derive.js",
  "src/js/data/validate.js",
  "src/js/core/router.js",
];

/* ── محاكاة DOM دنيا: تكفي h()/svg()/clear دون محرك عرض ── */
class FakeNode {
  constructor() { this.childNodes = []; this.parentNode = null; }
  appendChild(c) { this.childNodes.push(c); c.parentNode = this; return c; }
  removeChild(c) {
    const i = this.childNodes.indexOf(c);
    if (i !== -1) this.childNodes.splice(i, 1);
    c.parentNode = null;
    return c;
  }
  get firstChild() { return this.childNodes.length ? this.childNodes[0] : null; }
}

class FakeText extends FakeNode {
  constructor(t) { super(); this.textContent = String(t); }
}

class FakeElement extends FakeNode {
  constructor(tag, ns) {
    super();
    this.tagName = String(tag).toUpperCase();
    this.namespaceURI = ns || null;
    this.attributes = Object.create(null);
    this.style = {};
    this.dataset = {};
    this.className = "";
    this.textContent = "";
    this.hidden = false;
    this._listeners = Object.create(null);
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(evt, fn) {
    (this._listeners[evt] = this._listeners[evt] || []).push(fn);
  }
  removeEventListener() {}
  closest() { return null; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const documentMock = {
  createElement: (t) => new FakeElement(t),
  createElementNS: (ns, t) => new FakeElement(t, ns),
  createTextNode: (t) => new FakeText(t),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  body: new FakeElement("body"),
};

/* ── window/history وهميان قابلان للفحص من الاختبارات ── */
export const historyCalls = [];

const historyMock = {
  replaceState(_state, _title, url) {
    historyCalls.push(String(url));
    // يحاكي المتصفح: replaceState بعنوان يبدأ بـ # يحدّث الهاش دون حدث hashchange
    if (typeof url === "string" && url.startsWith("#")) win.location.hash = url;
  },
  pushState(_state, _title, url) { historyCalls.push(String(url)); },
};

export const win = {
  location: {
    hash: "",
    href: "https://unit.test/index.html",
    pathname: "/index.html",
    search: "",
  },
  history: historyMock,
  _listeners: Object.create(null),
  addEventListener(evt, fn) {
    (this._listeners[evt] = this._listeners[evt] || []).push(fn);
  },
  removeEventListener() {},
};

/* ── السياق الواحد: بيئة معجمية عامة مشتركة لكل السكربتات ── */
const sandbox = {
  window: win,
  document: documentMock,
  history: historyMock,
  location: win.location,
  Node: FakeNode,
  // btoa/atob/URL كائنات مضيف Node لا توفرها بيئة vm تلقائياً
  btoa: globalThis.btoa,
  atob: globalThis.atob,
  URL,
  URLSearchParams,
  console,
  setTimeout,
  clearTimeout,
};

const context = vm.createContext(sandbox);
for (const rel of JS_ORDER) {
  const file = path.join(ROOT, rel);
  vm.runInContext(readFileSync(file, "utf8"), context, { filename: file });
}

/* ns.js يعرّف RH بـ const (بيئة معجمية عامة، ليست خاصية على globalThis)
   فيُستخرج بتقييم تعبير داخل السياق نفسه */
export const RH = vm.runInContext("RH;", context);

/* ── الحقيقة المرجعية: نسخة جديدة معزولة عند كل استدعاء ── */
const releaseText = readFileSync(path.join(ROOT, "data", "release.json"), "utf8");
export function freshRelease() { return JSON.parse(releaseText); }
