/* dom.js — أدوات DOM دقيقة: بناء عناصر آمن (لا innerHTML لمحتوى المستخدم) */
"use strict";

RH.core.dom = (function () {

  /** بناء عنصر: h("div", {class:"x", onclick:fn}, child1, "نص", ...) */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") el.className = v;
        else if (k === "dataset") Object.assign(el.dataset, v);
        else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
        else if (k.startsWith("on") && typeof v === "function") {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === "html") {
          // يُستخدم حصراً لقوالب ثابتة من الكود — أبداً لمدخلات المستخدم
          el.innerHTML = v;
        } else if (v === true) el.setAttribute(k, "");
        else el.setAttribute(k, String(v));
      }
    }
    append(el, children);
    return el;
  }

  function append(el, children) {
    for (const c of children) {
      if (c == null || c === false) continue;
      if (Array.isArray(c)) append(el, c);
      else if (c instanceof Node) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
  }

  /** عنصر SVG بمساحة الأسماء الصحيحة */
  function svg(tag, attrs, ...children) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") el.setAttribute("class", v);
        else if (k.startsWith("on") && typeof v === "function") {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else el.setAttribute(k, String(v));
      }
    }
    append(el, children);
    return el;
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  /** هل العنصر (أو سلفه) تفاعلي؟ — جوهري لعقد الملاحة في القسم 8 */
  const INTERACTIVE = "button, a[href], input, select, textarea, [contenteditable], [role='button'], [role='tab'], [data-interactive], dialog, [role='dialog']";
  function isInteractive(el) {
    return !!(el && el.closest && el.closest(INTERACTIVE));
  }

  return { h, svg, clear, qs, qsa, isInteractive };
})();
