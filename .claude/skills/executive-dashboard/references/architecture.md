# Architecture — self-contained platform app

Vanilla JS + ECharts, one HTML file out. No frameworks: the deliverable must open by
double-click on a locked-down government machine, and every dependency you add is a way
for that to fail.

## Contents
1. Build pipeline
2. Data layer with assertions
3. App skeleton (state, persistence, routing)
4. Rendering pattern
5. Editing & workflow gates
6. Drawer / modal / toast
7. Mobile bottom nav + sheet
8. Reports & print isolation
9. Logo handling

## 1. Build pipeline

```
generate_data.py  →  data.json          (assertions gate the build)
src/{markup.html, styles.css, app.js}
build.py          →  index.html         (inlines EVERYTHING)
```

`build.py` essentials: read all parts; base64 the logo PNGs to data URIs and substitute
`__LOGO_EMBLEM__` / `__LOGO_FULL__` tokens across the whole HTML string; concatenate
`vendor/fonts-embedded.css + vendor/fonts-light.css` into a `<style>`; inline
`vendor/echarts.min.js` in a `<script>`; embed data as `window.DATA = {...}` (json.dumps
with `ensure_ascii=False`); set favicon to the emblem data URI. Result ~1.5–1.8MB — fine.

`<html dir="rtl" lang="ar">` for Arabic-first products.

## 2. Data layer with assertions

One Python file holds every record and derives every aggregate. Assertions are the
product's honesty; a build that can't reconcile must fail loudly:

```python
identified = sum(i["est"] for i in RECORDS)
realized   = sum(i["realized"] for i in RECORDS)
assert documented <= realized <= approved <= identified
assert round(sum(v["realized"] for v in by_category.values()),1) == realized
in_chain = [r for r in REQUESTS if r["stage"] not in ("الإعداد","معاد للاستكمال")]
assert all(complete(r) for r in in_chain), "gate violation: incomplete record inside review chain"
```

Also derive at runtime in JS everything the user can edit (roll-ups, commitment %, coverage),
so edits recompute live; the seeded aggregates only initialize the story.

## 3. App skeleton

```js
const SEED = window.DATA;
const LS_KEY = "product.v1";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
let S = { tab:"home", data: loadState(), filters:{...} };

function loadState(){                    // localStorage overlay over seed
  try{ const raw = localStorage.getItem(LS_KEY);
    if(raw){ const saved = JSON.parse(raw);
      if(saved?.meta?.asOf === SEED.meta.asOf) return saved; }   // seed version check
  }catch(e){}
  return structuredClone ? structuredClone(SEED) : JSON.parse(JSON.stringify(SEED));
}
let saveT; function save(){ clearTimeout(saveT);
  saveT = setTimeout(()=>{ try{ localStorage.setItem(LS_KEY, JSON.stringify(S.data)); }
    catch(e){ toast("تعذر الحفظ المحلي"); } }, 250); }
```

Export = Blob download of `S.data`; import = FileReader + shape check + replace; reset =
confirm() → remove key → clone seed. Hash routing: `location.hash = tab` on navigate,
`hashchange` listener, read hash at boot. `Escape` closes drawer/modal/sheet; overlay click too.

## 4. Rendering pattern

- A `RENDER` registry: one `{html(), mount()}` object per tab. `refresh()` sets
  `APP.innerHTML = pageHead + R.html()` then `R.mount()` wires events and mounts charts.
  Full re-render on every state change — at this scale it's simpler and fast enough.
- Generic page head from tab metadata (`{id,name,icon,kicker,desc}`); home sets `hero:true`
  and renders its own.
- Chart registry `CH = {}` with `chart(id)` that disposes instances whose DOM was replaced
  (`CH[id].getDom() !== el`), a debounced window-resize resizing all, and a
  `requestAnimationFrame` resize pass after each tab render (fixes zero-size charts that
  initialized while hidden). Charts inside drawers need an explicit `.resize()` after mount.
- Search inputs that trigger re-render must restore focus + caret
  (`selectionStart` saved → `refresh()` → `focus()+setSelectionRange`).

## 5. Editing & workflow gates

The platform's value is enforced process. Encode each rule ONCE and check it in **every**
mutation path — the classic bug is a drawer button that enforces a gate while the edit
modal's stage dropdown bypasses it.

```js
const gateBlocked = (next==="معتمدة" && !r.financeValidated)
                 || (next==="مقفلة" && !(r.financeValidated && r.realized>0));
// drawer: disable button + show reason;  modal save: re-check and toast-refuse.
```

Editing surfaces worth building: score chips (1–5) that write to state and recompute
roll-ups live; status toggles that cycle values; stage-advance buttons with gates;
add/edit modal forms with required-field checks; return-to-earlier-stage flows (real
processes have rework loops with "return to step N" semantics, not just approve/reject).

## 6. Drawer / modal / toast

- One reusable end-side drawer (dialog role, close X, overlay) — serves every detail view.
- One modal for forms: sticky header/footer, `frow` 2-col grid collapsing on mobile.
- Toast: fixed pill bottom-center; `#toast[hidden]{display:none}` — the display rule
  otherwise overrides the hidden attribute and the toast haunts every screenshot.

## 7. Mobile bottom nav + sheet

Markup: `<nav id="bottomnav"><div id="bn-inner"></div></nav>` + `<div id="moresheet">`.
Both `display:none` by default and shown only ≤768px (the sheet WILL leak into desktop
full-page screenshots otherwise). Render 4 primary tabs + «المزيد»; the sheet lists the
rest plus data actions (export/import/print/reset — extract those handlers into named
functions so header buttons and sheet share them). Sheet uses the same overlay; close it
from every navigation.

## 8. Reports & print isolation

Reports are live views compiled from state into `#reportview` (print-styled tables +
official full logo in the header), not canned text. Print isolation needs a body class:

```js
function buildReport(){ ...; document.body.classList.add("report-open"); }
function hideReport(){ ...; document.body.classList.remove("report-open"); }
```
```css
@media print{
  body.report-open #masthead{display:none !important}
  body.report-open #app > :not(#reportview){display:none !important}
}
```
(A sibling selector like `#reportview.on ~ *` fails — the generator cards precede the
report in DOM order. QA caught this; keep the body-class approach.)

## 9. Logo handling

Split the official logo: emblem (mark only) for header + favicon; full bilingual wordmark
for report headers. PIL: trim alpha bbox, find the largest fully-transparent gap row,
crop above it. Never recolor an official mark; on light headers place it directly on
white. Both PNGs → data URIs at build time.

## Bundled vendor files

Copy from this skill's `assets/vendor/` into the project: `echarts.min.js` (5.x),
`fonts-embedded.css` (Cairo 400/600/700 + Plex Arabic 500/600/700, base64 woff2),
`fonts-light.css` (Plex Arabic 300/400 — the editorial numerals depend on these).
