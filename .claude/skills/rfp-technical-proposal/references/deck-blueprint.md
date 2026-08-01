# Deck Blueprint — the canonical proposal skeleton

Both reference decks follow this exact order. **Never reorder, rename, or drop sections**;
scale their depth instead. Canonical Arabic section names are fixed vocabulary.

## 0. The skeleton

| # | Section | Canonical name | Slides (deck1 / deck2) | Slide type |
|---|---|---|---|---|
| 1 | Cover | — | 1 / 1 | Title Slide |
| 2 | Cover letter | — | 2 / 2 | Letter Layout |
| 3 | Table of contents | جدول المحتويات | 3 / 3 | TOC split |
| 4 | Executive summary | الملخص التنفيذي | 4–6 / 4–6 | divider + 2 dark slides |
| 5 | Our point of view | وجهة نظرنا | 7–43 / 7–47 | divider + story arc |
| 6 | Our approach | النهج الذي سنتّبعه | 44–62 / 48–65 | divider + overview + BoQ + methodology pages |
| 7 | Proposed timeline | الجدول الزمني الذي نقترحه | 63–64 / 66–67 | divider + Gantt |
| 8 | Proposed team | فريق العمل الذي نقترحه | 65–70 / 68–74 | divider + org + leadership + experts |
| 9 | Appendix marker | ملحق | one divider before EACH appendix | Divider |
| 10 | Team profiles | ملحق: ملفات تعريف الفريق | 73–80 / 77–85 | 1 CV per slide |
| 11 | Expert profiles | ملحق: ملفات تعريف الخبراء | 82–92 / 87–102 | 1 profile per slide |
| 12 | Our credentials | ملحق: خبراتنا | 94–172 / 104–187 | summary matrix + 1 credential per slide |
| 13 | Frameworks | ملحق: أطر العمل والمنهجيات | 174–233 / 189–248 | framework library |
| 14 | About Deloitte | ملحق: نبذة عن ديلويت | 235–245 / 250–260 | fixed pack |
| 15 | Terms & conditions | ملحق: الشروط والأحكام | 247–258 / 262–273 | fixed pack |
| 16 | Legal documents | ملحق: المستندات القانونية | 260–269 / 275–286 | certificate scans + final disclaimer (always slide N) |

The TOC lists exactly these names with their start pages, appendices prefixed
`ملحق: `. (TOC page numbers point at each section's divider — sometimes divider+1 in
the references; be consistent and point at section starts. The content ranges above
are the actual content slides, not the TOC figures.)

## 1. Cover (slide 1)

- Full-bleed night aerial photo of the client's city with one landmark (dark, ideally
  with green light accents; the reference decks use the KAFD night aerial for Riyadh
  clients — reuse it for Riyadh). Photo lives on the layout, no overlay.
- Two rounded-rect logo cards, fill `F2F2F2`, no stroke, **3.52 × 1.28 in** at y=0.24":
  **client logo card top-LEFT** (x=0.45"), **Monitor Deloitte wordmark card top-RIGHT**
  (x=9.49"). Client logo drawn large inside its card (slight vertical overhang is in the
  reference). Get the real client logo; never redraw it.
- Title block: one text box ≈11.4" wide × 1.8" tall, top at 4.9", center-anchored,
  right-aligned RTL, 106% line spacing, 4 lines, all bold Sakkal Majalla:
  1. Client legal name — 40pt, `schemeClr accent3 (26890D) + lumMod 60%/lumOff 40%`
     (renders bright green). **The green goes on the CLIENT — the client is the hero.**
  2. Project name verbatim from the RFP — 32pt white (may wrap 2 lines)
  3. `العرض الفني` — 20pt white (fixed deliverable label; financial proposal = العرض المالي)
  4. Submission month + year in Arabic (`فبراير 2026`) — 16pt white; month only, never a day
- No footer, no page number, no taglines, no "prepared by", no confidentiality line.

## 2. Cover letter (slide 2) — see writing-style.md §6 for the full formula

Three-zone layout: letterhead top-LEFT at (0,0) (company line 10pt bold + address
block 10pt), Monitor Deloitte wordmark large top-RIGHT, contacts sidebar on the RIGHT
rail (x≈10.1–12.8": `جهات الاتصال` header, two partner entries — circular photo
1.06", bold name, شريك, entity, hyperlink email, `جوال:`). Main body ~9.4" wide at
left/center, 12pt, right-aligned RTL: addressee → greeting → bold subject → thanks ¶ →
bridge ¶ → 4–6 teal-lead advantage bullets → commitment ¶ → sign-off → partner name +
title. Footer present (page 2 — the letter layout redraws the footer trio locally).

## 3. Table of contents (slide 3)

- Left **44.3%**: full-height city photo (dusk, one landmark — different photo from the
  cover), hard vertical cut.
- Right **55.7%**: rectangle with **45° linear gradient `0A5456` → `055B3F` at ~85%
  alpha** over the photo edge (reads as a rich dark green field).
- Title `جدول المحتويات` **24pt** white, standard title strip, right-aligned.
- Contents table ≈6.3" wide starting y≈1.25": **13 rows, 2 columns** — page number cell
  (`D0D0CE` light gray, Latin digits, 16pt) + section-name cell (white, 16pt); each row
  a 1pt `D0D0CE` bottom border only; transparent fills; no leaders, no zebra.
- The 13 canonical rows are fixed (see §0). Extra RFP-demanded sections append as
  `ملحق: …` rows. Never translate section names.
- Footer: copyright only. Page numbers recomputed LAST after final pagination.

## 4. Section dividers

**One background variant for every divider in the deck** (all art on the layout):
- Left strip (~14% width): close-up photo of sand-gold curved lattice architecture with
  a white curved edge; full height.
- Main field: city night photo covered by the same 45° gradient `0A5456`→`055B3F` @85%
  alpha; white contour-wave line art sweeping top-right; Deloitte triangle/chevron
  pattern tiles at ~18% alpha along the left edge.
- Title: **88pt bold white** Sakkal Majalla, right-aligned, in a box 11.5" wide, top at
  1.83", bottom-anchored (baseline lands upper-middle). 88pt is a slide-level override
  (the layout default is 36pt) — apply it on every divider. Never shrink below 88pt;
  2-line wrap is fine. Arabic glyphs = Sakkal Majalla; Open Sans appears in the
  references only as the Latin fallback face on divider runs.
- Main-section divider = single title, text verbatim from the TOC entry
  (first-person-plural voice: وجهة نظرنا، النهج الذي سنتّبعه، الجدول الزمني الذي نقترحه…).
- **Appendix divider = two lines**: line 1 `ملحق` (title placeholder, 88pt), line 2 the
  appendix name (subtitle placeholder at y=3.75", also 88pt bold) — the line-2 string
  drops the `ملحق: ` prefix and may be fuller than the TOC entry (TOC `ملحق: خبراتنا` →
  divider `خبراتنا المماثلة محلياً وعالمياً`). When the appendix shows only a sample,
  append a second paragraph `(غير شامل)` — **48pt italic white** (the one permitted
  italic in the deck).
- No footers, page numbers, or logos on dividers.

## 5. Section-by-section requirements

Each content section has its own playbook file:
- `executive-summary.md` — the 2 exec slides
- `point-of-view.md` — the PoV story arc (the longest bespoke section)
- `approach.md` — overview, BoQ mapping, detailed methodology pages
- `team-and-timeline.md` — Gantt, org chart, leadership, experts, CVs, expert profiles
- `credentials.md` — summary matrix + credential pages
- `appendices.md` — frameworks, About Deloitte, T&C, legal

## 6. Page-number discipline & footers

- Footer strip at y≈7.13" (9–10pt): page number bottom-left; running title; copyright
  right. Present on letter + TOC + all content slides; suppressed on cover and dividers
  (the count still advances).
- Running-title formula (use the fuller, newer form):
  `العرض الفني: {الجهة} | {اسم المشروع}`.
- Copyright: `© {سنة الميلادية} ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة`
  — year = proposal year.
- The TOC page numbers and every `(1/N)` series must be recomputed after final assembly.
- TOC entries point at each section's divider slide — be consistent.

## 7. Scaling rule

For a smaller RFP, keep every section but shrink: PoV ≥ 12 slides, approach ≥ 1 overview
+ 1 BoQ + 1 methodology page per track, credentials ≥ 1 summary + 10 pages, frameworks
≥ 10 pages, corporate packs never shrink (they are fixed). For a larger RFP, grow PoV and
methodology depth, never the corporate packs.
