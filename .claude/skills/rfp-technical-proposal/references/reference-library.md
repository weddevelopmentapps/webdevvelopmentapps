# The Reference Library — organizing and retrieving reusable assets

The skill assumes a **reference folder** the user maintains (past proposals, credentials,
CVs, boilerplate). The agent must first *inventory* it, then *retrieve selectively* per the
Proposal Plan. Never dump the whole library into a proposal — selection IS the craft.

## 1. Expected layout (create/normalize it if absent)

```
reference/
├── _templates/
│   └── *.pptx                  ← past full proposals (the style donors; ALWAYS prefer
│                                  cloning slides from here over building from scratch)
├── credentials/                ← one file/slide-extract per project credential
├── cvs/
│   ├── team/                   ← consulting staff CVs (partner → consultant)
│   └── experts/                ← SME/expert profiles
├── frameworks/                 ← methodology slides (policy cycle, TOM, PMO, KPIs…)
├── corporate/                  ← About Deloitte, T&C, legal certificates, letter blocks
├── logos/                      ← client + partner logos
└── photos/                     ← city/asset photography
```

If the user's folder is unstructured (e.g. only old .pptx decks), treat every past deck as
a quarry: index its slides by section using the canonical TOC names (جدول المحتويات page
maps each section), extract per-slide text (`markitdown`), and record slide numbers per
category. Past decks contain *all* categories — a full library exists inside any one
complete proposal.

## 2. Inventory pass (do once per run, cache the index)

For every .pptx in the library:
1. `markitdown file.pptx > index/file.md` and split per slide.
2. Classify each slide by its title signature:
   - `خبراتنا | محلياً` / `خبراتنا | عالمياً` → credential
   - `{name} | {role}` with السيرة الذاتية blocks → CV
   - `{name} | خبير مختص في مجال {domain}` → expert profile
   - `منهجية المشروع التفصيلية | …` → methodology page
   - Framework assertion titles mentioning منهجية/إطار/StrategyByDesign/SWOT/PESTEL → framework
   - `الشروط والأحكام`, `المستندات القانونية | …`, `ديلويت هي أكبر…` → corporate boilerplate
3. For each credential record: client, sector, service type, geography, outcomes-numbers,
   which decks it appeared in. For each CV: name, grade, domains (مجالات الخبرة), sectors,
   named projects. For each framework: family, topic keywords.

## 3. Retrieval & selection logic

### Credentials (see `credentials.md` for rendering)
Score each credential 0–5 against the RFP:
- +2 same service family (strategy studies / performance / TOM / PMO…)
- +1 same sector (municipal/urban, and specifically the same client type)
- +1 same client or sister entity (أمانة، هيئة ملكية، وزارة البلديات…) — these lead
- +1 recency / marquee scale (numbers to quote)
Order: same-client first, then same-sector local, then other local, then global.
Local outnumbers global heavily (~60:10 in the references). Cap global at ~10.

### CVs
- Match one person per RFP-required role; **retitle the role to the RFP's vocabulary**
  (the same person appears as "المدير التنفيذي للمشروع" in one proposal and "مدير المشروع"
  in another — roles are per-proposal, people are durable).
- Prefer people whose bullet history already contains the client or sister entities.
- Experts: cover every domain the RFP names + the standard bench (strategy planning,
  strategy execution, governance, infrastructure, economics, org design…). If a domain is
  missing from the library, flag it to the user rather than inventing a person. **Never
  fabricate names, bios, degrees, or project history.**

### Frameworks
- Pick one framework slide-set per approach track theme + always include the fixed set:
  project management mechanism, risk management, escalation plan, quality plan,
  collaborative working, knowledge transfer (these six appear near-verbatim in BOTH
  reference decks — they are the stable core).

### Boilerplate
- Letter skeleton, About Deloitte pack, T&C pack, legal certificates: reuse verbatim,
  update only dates/project names/footers.

## 4. Gap handling — when the library lacks something

- **Missing credential in a needed domain**: use the closest adjacent credential and
  emphasize the transferable part in its taglines — do not invent projects.
- **Missing slide type**: build it from the archetype recipes (`slide-archetypes.md`)
  using cloned geometry from the template donor, so it is indistinguishable from library
  slides.
- **Missing photo**: pick from `photos/` of the same city; if none, source a real photo of
  the client's city/asset (correct city skyline — never a generic or wrong-city skyline).
- **Missing logo**: ask the user; do not redraw logos.

## 5. Provenance discipline

Keep a build manifest (`manifest.md`) recording, for every slide in the output deck:
source (`library:<file>#<slide>` / `generated:<archetype>`), and for library slides what
was changed (retitle, re-bullet, date update). The user can audit selection decisions.
