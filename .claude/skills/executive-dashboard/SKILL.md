---
name: executive-dashboard
description: >
  Build flagship-quality, Arabic-first executive platforms and dashboards for government and
  corporate entities in ANY domain — PMO (مكتب إدارة المشاريع), SMO (مكتب إدارة الاستراتيجية),
  spending efficiency, HR, operations, compliance, investment — as fully self-contained offline
  HTML apps with editable workflows, seeded realistic data, live reports, and a real mobile
  experience. Use this skill whenever the user asks for a dashboard, platform, لوحة معلومات,
  لوحة قيادة, منصة, command center, executive reporting tool, maturity/self-assessment tracker,
  KPI system, or any data-driven web deliverable for an organization — even if they don't say
  "dashboard", even if they only attach an RFP/برنامج/framework document and say "build something
  to manage this". Also use it when asked to redesign or "de-AI-ify" an existing dashboard.
---

# Executive Dashboard / Platform Builder

This skill encodes a complete, battle-tested methodology for producing executive platforms that
a sovereign-level client (a Royal Commission, a ministry, a listed company) would accept as a
paid deliverable. It was distilled from a real engagement that went through domain research,
a 12-module build, four independent review boards (domain-CEO critic, UI/UX, compliance,
functional QA), an ex-Apple-persona design-director pass, and a professional Arabic editorial
pass. Follow the process — the quality comes from the process, not from any single trick.

## What you will produce

One folder, e.g. `entity-domain-platform/`:

```
entity-domain-platform/
├── index.html          # THE deliverable — fully self-contained, works offline by double-click
├── generate_data.py    # single source of truth for seeded data + reconciliation assertions
├── data.json           # generated output — never hand-edit
├── build.py            # assembles src/ + vendor/ + data.json → index.html
├── src/                # markup.html · styles.css · app.js  (kept for maintainability)
├── vendor/             # echarts.min.js + embedded Arabic fonts (copy from this skill's assets/vendor/)
├── assets/             # client logo (emblem + full wordmark), split & inlined at build time
└── README.md           # Arabic-first: modules, scope mapping, how to replace demo data
```

Self-contained matters: government clients open deliverables behind strict proxies and on
iPads in committee rooms. Zero external requests (no CDN, no Google Fonts at runtime) is a
hard requirement, not an optimization. Copy `assets/vendor/*` from this skill into the
project's `vendor/` and inline everything in `build.py`.

## The process — nine phases

Work through these in order. Do not skip the review phases; they are where "good demo"
becomes "defensible deliverable".

### 1. Intake

Extract from the user's materials (RFP, program guide, framework PDF, verbal brief):
the entity, the domain's governing framework (e.g., for a PMO: the entity's project
governance manual / PMI-style stage gates; for spending efficiency: EXPRO's pillars program),
the grade or outcome being pursued, and who will stand in front of this screen. If a document
is attached, read it fully before designing anything — deliverable lists and priced BoQ tables
in RFPs are the real module list.

### 2. Research (parallel agents)

Fan out research agents before designing: (a) deep-read every attached document and return
structured notes; (b) web-research the domain's official framework, maturity model, and
terminology; (c) profile the entity — real portfolio, real program names WITH their official
honorific forms (e.g., «مشروع الملك عبدالعزيز للنقل العام», never a stripped generic name);
(d) international best practices for the domain (gives the "30-year veteran" depth reviewers
notice). Everything the platform says must survive an expert reader from that entity.

### 3. Specification

Write a one-page spec before coding: module list mapped line-by-line to the source
document's requirements, the data model, which records are user-editable, and which
workflow rules are enforced in code (gates). Read
`references/domain-adaptation.md` for how to derive modules from a domain framework,
with worked PMO and SMO examples.

### 4. Data layer — `generate_data.py`

All seeded data lives in one Python file that computes every roll-up and **asserts every
reconciliation** (totals match across charts, tables, and KPIs; percentages recompute from
the underlying records; workflow invariants hold — e.g., no record sits past a gate it
doesn't satisfy). A failed assertion stops the build. This is what lets an executive add
any two numbers on screen and get the third — the single most credibility-building
property the platform has. Rules:

- Numbers must be plausible for the entity's real scale; research it, don't invent orders of magnitude.
- Use role titles, never invented person names. Anonymize third-party entities («جهة خدمية كبرى»).
- Label demo data honestly: a quiet «بيانات تجريبية لأغراض العرض» chip in the header + README note.
- Watch for cross-domain vocabulary leaks (a Makkah term in a Riyadh dataset ended a review).

### 5. Build

Read `references/architecture.md` (app skeleton, state/persistence, routing, drawer/modal,
bottom-nav mobile pattern, print isolation, build scripts — with working code) and
`references/design-language.md` (the visual system) before writing code. Charts: read
`references/rtl-charts.md` — RTL chart grammar is the most error-prone part of the build
and the reference contains the exact recipes.

Editability is what makes it a platform rather than a poster: score chips that recompute
roll-ups live, stage-advance buttons that respect gates, add/edit modals, evidence/status
toggles, localStorage persistence with export/import/reset. Enforce workflow rules in
every path (a modal dropdown must not bypass a gate the drawer button enforces — this
exact bug was found by QA).

### 6. Review board (parallel agents)

Spawn four independent reviewers with structured-findings output, then fix everything
critical/major before continuing:

1. **Domain-executive critic** — impersonates the entity's CEO; knows the real portfolio;
   attacks credibility, terminology, and missing promised scope.
2. **UI/UX expert** — reviews actual screenshots (desktop + mobile), not code.
3. **Compliance auditor** — maps every requirement in the source document to where the
   platform covers it; verifies formulas and official terminology.
4. **QA engineer** — writes and runs Playwright tests against the built file: consoles,
   gates, persistence, print, deep links.

Prompt templates and the findings schema: `references/review-protocol.md`.

### 7. Design-director pass

After the build is visually complete, run one design-director agent on fresh screenshots
with the explicit bar "would a $10M engagement ship this — and does anything look
AI-generated?". The recurring root cause of "looks AI-generated" is **color that decorates
instead of meaning something** — the checklist is in `references/design-language.md`.

### 8. Language pass (Arabic-first products)

Run `references/arabic-language.md`'s calque table yourself, then spawn a professional
Arabic-editor agent over ALL user-facing strings (UI + seeded data) for grammar
(number–noun agreement with correct dual/plural in dynamic strings, gender concord),
register, and terminology consistency with the domain's official vocabulary. Literal
translations («خط أنابيب», «شلال») are the #1 thing native-speaker clients flag.

### 9. Quality gates + delivery

Run `scripts/qa_scan.js` (bundled, reusable — takes the index.html path). All gates must pass:

- **Zero console errors** across every tab, drawer, and modal.
- **Zero horizontal overflow at 390px** on every tab (`scrollWidth ≤ viewport+5`).
- Workflow gates enforced through every path; localStorage survives reload; reset restores seed.
- Print emulation shows only the report, not the app chrome.
- Full-page screenshots of every tab reviewed by you before declaring done.

Deliver: the folder in the repo + screenshots to the user + README. If publishing to
GitHub Pages, verify which branch Pages actually serves before assuming `main`.

## Non-negotiables (the difference between demo and deliverable)

- **One accent color, and color only ever means something.** Brand color = data + action;
  one metal (gold) reserved exclusively for the target/goal; red exclusively for trouble.
- **No boxed KPI tile rows with icon chips, no dark gradient masthead, no circular gauges** —
  these are the "AI-generated dashboard" tells. Use the editorial patterns in the design reference.
- **Every number reconciles.** If two screens show the same figure with different verdicts
  (one green, one red), a reviewer will find it.
- **Official names in full.** Programs, authorities, committees — verified, honorifics intact.
- **The mobile experience is an app**, not a squeezed website: bottom tab bar + "more" sheet.
- **RTL is a grammar, not a direction attribute** — charts, steppers, kanban, and meters all
  have explicit RTL recipes; follow the reference.

## Reference map

| Read when | File |
|---|---|
| Deriving modules for a new domain (PMO/SMO/any) | `references/domain-adaptation.md` |
| Writing any code | `references/architecture.md` |
| Choosing tokens, components, layout; final visual pass | `references/design-language.md` |
| Writing any chart | `references/rtl-charts.md` |
| Writing/reviewing Arabic copy | `references/arabic-language.md` |
| Spawning review/QA agents | `references/review-protocol.md` |
| Running quality gates | `scripts/qa_scan.js` (see header comment for usage) |

Bundled assets: `assets/vendor/echarts.min.js`, `assets/vendor/fonts-embedded.css`
(Cairo 400/600/700 + IBM Plex Sans Arabic 500/600/700), `assets/vendor/fonts-light.css`
(IBM Plex Sans Arabic 300/400 — required for the light editorial numerals). Copy them into
every project's `vendor/`.
