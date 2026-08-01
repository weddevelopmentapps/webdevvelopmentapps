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

**The library is meant to GROW.** File every delivered proposal back into `_templates/`
when a build completes, and the user may drop new credentials, CVs, frameworks, or photos
into their folders at any time. The inventory pass below runs on EVERY RFP and picks up
whatever is new — the more the library grows, the better every subsequent proposal gets.

## 2. Inventory pass (run on EVERY RFP; cache by content, not by session)

Re-scan the whole library at the start of every proposal run. Keep a cached index
directory (`index/`) inside the library keyed by file content hash: unchanged files reuse
their cached entries instantly, new or modified files get indexed fresh. Never rely on a
stale index from a previous run — new assets the user dropped in must be seen.

The index has TWO layers, and both are mandatory:
- **Text layer** — per-slide extracted text, for classification and RFP-fit matching.
- **Visual layer** — every deck rendered once to per-page images (`soffice` → `pdftoppm`,
  cached by the same hash). Slide selection is a DESIGN decision as much as a content
  decision, and design can only be judged by looking. This is what enables the
  best-of-breed sweep in §3.0 and the archetype chrome survey in creative mode.

For every .pptx in the library:
1. `markitdown file.pptx > index/file.md` and split per slide; render pages to
   `index/img/<hash>/` if not already cached.
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

### 3.0 Best-of-breed slide selection — sweep the WHOLE library, per section

The donor is not a single deck. Two-level rule:

- **Base donor** (one deck): the most recent complete past proposal supplies the global
  chrome — masters, theme, footers, dividers, TOC mechanics — so the assembled deck has
  one consistent skeleton.
- **Section layouts** (any deck): for EVERY section of the new deck, sweep the candidate
  slides of that section across ALL decks in the library and pick the strongest, not
  merely the base donor's version. Use the text index to shortlist candidates, then judge
  the shortlist VISUALLY (fan out review agents over the cached page renders when the
  pool is large — same mechanics as the creative-mode archetype survey). Score each
  candidate on:
  1. **Fit** — does this layout carry THIS RFP's story for this section (right number of
     tracks/phases/pillars, right density for the content volume)?
  2. **Design quality** — density, layered craft, grid discipline; only layouts a design
     partner would call beautiful. A newer deck's redesigned section beats an older
     deck's tired one; an older deck's brilliant framework page beats a newer mediocre one.
  3. **Recency & client-signal** — newer wins ties; slides originally built for the same
     client or sister entities win over generic ones.
  Clone the winner's chrome, rewrite its text per the section playbook.
- **Consistency pass afterwards**: slides sourced from different decks must be normalized
  to the base donor's palette, typography scale, footer, and divider language before QA —
  a mixed-donor deck must read as ONE deck. Record every slide's source deck in
  `manifest.md`.

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
