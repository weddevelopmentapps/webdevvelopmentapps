---
name: rfp-technical-proposal
description: >
  Autonomous generation of Monitor-Deloitte-house-style Arabic technical proposals
  (العرض الفني) from an RFP / scope of work / كراسة الشروط والمواصفات. Use whenever the
  user asks to create, draft, or build a technical proposal, proposal deck, عرض فني,
  RFP response, or asks to "generate a proposal based on the attached RFP". Reads the
  RFP, mines the user's reference folder for credentials/CVs/frameworks/boilerplate,
  plans the full deck (executive summary, point of view, approach, timeline, team,
  appendices), and produces a .pptx that is pixel-faithful to the house design system —
  never copy-pasting content, always re-deriving it from the new RFP.
---

# RFP → Technical Proposal (العرض الفني) — House Style Generator

You are producing a complete Arabic technical proposal deck in the exact house style of
the two reference proposals (RMUN Strategic Studies; RMUN Central Riyadh Sectors
Performance — Monitor Deloitte, ~270–290 slides, RTL, Sakkal Majalla, Deloitte green).
The output must be indistinguishable in style, density, and craft from those decks while
every project-specific word is newly derived from the input RFP.

## Non-negotiables

0. **Sakkal Majalla is THE typeface — no exceptions, no substitutions.** Every text
   run the generator writes sets `latin` + `cs` + `sym` = "Sakkal Majalla" (the theme
   provides no Arabic font; only run-level rPr carries it). This applies to Arabic
   AND Latin/English content alike — framework names, emails, digits, stats, and any
   EN-language deck all stay in Sakkal Majalla, exactly as the reference decks do.
   Generic font guidance from other skills (e.g. the pptx skill's "safe fonts" list —
   Arial, Calibri) does NOT apply to this deliverable; never silently fall back.
   Install Sakkal Majalla in the build environment BEFORE any rendering/QA (fonts are
   not embedded in the .pptx) and pass the hard font gate in
   `references/build-and-qa.md` §4.0 — fc-match must resolve both weights, every
   Arabic run in every part must carry the typeface, and `pdffonts` on the exported
   PDF must show only SakkalMajalla. A PDF rendered with a substitute font is NOT a
   deliverable: if the font cannot be installed, stop and ask the user for
   `majalla.ttf`/`majallab.ttf` instead of shipping a substituted export.
1. **Understand, never transplant.** Scope, objectives, tracks, timeline, team,
   deliverables are all re-derived from THIS RFP. Boilerplate (letter skeleton, firm
   blurbs, frameworks, About Deloitte, T&C, legal) is reused verbatim by design.
2. **Real assets only.** CVs, credentials, logos, photos, people come from the
   reference folder. Never invent a person, project, client, number, or logo. Gaps are
   reported to the user, not fabricated.
3. **The skeleton is sacred.** 16 canonical sections in fixed order
   (`references/deck-blueprint.md`). Scale depth, never structure.
4. **Assertion titles carry the story.** Reading titles alone must reproduce the full
   argument (`references/writing-style.md`).
5. **Clone geometry, rewrite text.** Build from a donor deck whenever one exists
   (`references/build-and-qa.md`). No AI-slide tells: no icon soup, no empty minimalism,
   no decorative bars, no invented layouts — density with discipline.

## Pipeline (run in order; each step has a reference file)

### Step 0 — Inventory inputs
- Locate the RFP (attachment or path given by the user).
- Locate the reference folder; index it per `references/reference-library.md` §2.
  If no reference folder exists, ask the user for it (or for permission to build from
  archetype recipes alone).
- Identify the template donor deck (most recent complete past proposal).
- Load the `pptx` skill for all reading/writing of .pptx files.

### Step 1 — Deconstruct the RFP → Proposal Plan
Follow `references/rfp-analysis.md` in full. Output `proposal-plan.md`: hard facts
(client, project name, objectives, scope, BoQ, duration, required team, evaluation
criteria), the strategic read (what the client is really buying; 3 enablers OR 3
challenges; 3–4 work areas; win themes), the approach skeleton (N tracks/phases + names +
sub-tracks + deliverables), the deck budget, and the retrieval shopping list.

### Step 2 — Retrieve from the reference library
Per `references/reference-library.md` §3: shortlist credentials (scored & ordered),
CVs (one per required role, retitled to RFP vocabulary), experts (cover every named
domain), frameworks (one family per work area + the fixed six), boilerplate packs.
Record everything in `manifest.md`.

### Step 3 — Write the content, section by section
Use the section playbooks — each defines the slide-by-slide anatomy, exact typography,
title formulas, and what is fixed vs recomputed:

| Order | Section | Playbook |
|---|---|---|
| 1 | Cover, letter, TOC, dividers | `references/deck-blueprint.md` + `references/writing-style.md` §6 |
| 2 | الملخص التنفيذي | `references/executive-summary.md` |
| 3 | وجهة نظرنا | `references/point-of-view.md` |
| 4 | النهج الذي سنتّبعه | `references/approach.md` |
| 5 | الجدول الزمني + فريق العمل + CVs | `references/team-and-timeline.md` |
| 6 | ملحق: خبراتنا | `references/credentials.md` |
| 7 | ملحق: أطر العمل / نبذة عن ديلويت / الشروط والأحكام / المستندات القانونية | `references/appendices.md` |

Design constraints for every slide: `references/design-system.md`. Slide-type recipes:
`references/slide-archetypes.md`. The full title-by-title storylines of both reference
decks (the gold standard for "titles carry the story"): `references/reference-storylines.md`.

**When a spec question isn't answered by a playbook**, consult
`references/forensics/01…11_*.md` — the raw XML-level forensic analyses of both
reference decks (EMU coordinates, exact fills, run-level typography, verbatim Arabic
boilerplate, deck-vs-deck diffs, and the corrections log in `11_gaps_filled.md`).
The playbooks distill these; the forensics are the source of truth.

### Step 4 — Build the .pptx
Follow `references/build-and-qa.md` §1–3 (clone-don't-draw, RTL mechanics, assembly
order, cross-reference pass).

### Step 5 — QA and deliver
Run the full QA checklist (`references/build-and-qa.md` §4): render every slide,
inspect fresh, fix, re-render. Grep for donor-client residue. Validate the file.
Deliver the .pptx plus `manifest.md` (slide-by-slide provenance) and flag any gaps
(missing credentials/CVs/logos) for the user.

## Language

The reference system is Arabic/RTL and these playbooks assume AR (default). If the
RFP is English or demands a bilingual response: keep the identical skeleton, design
system, and formulas but mirror the geometry LTR (left-aligned text, flows left→right,
chevrons pointing right, month 1 leftmost), translate the canonical section names
once and use them consistently, keep **Sakkal Majalla as the typeface** (it renders
Latin text cleanly and is the house face — see non-negotiable 0), and keep all
framework names as-is. The corporate packs (About Deloitte, T&C, legal) must come from the library's
EN versions if they exist — never machine-translate legal text; if no EN pack exists,
flag it to the user.

## Interaction contract

- The user may say only: "generate a technical proposal based on the attached RFP".
  Everything else is your job. Ask questions ONLY for: missing reference folder, missing
  client logo, un-inferable language choice (default AR), or a genuinely ambiguous
  scope conflict inside the RFP.
- Always state, at the end: which credentials/CVs were selected and why (1 line each,
  from `manifest.md`), and any gaps flagged.
