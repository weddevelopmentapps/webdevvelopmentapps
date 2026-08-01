# Build Pipeline & QA — how the deck is physically produced

## 1. Golden rule: clone, don't draw

Pixel fidelity comes from **reusing a template donor deck**, never from rebuilding
geometry by eye. If any past proposal .pptx exists in the reference library:

1. Copy the most recent complete proposal as `build/working.pptx`.
2. Unpack it (`zipfile.extractall`), work on the XML.
3. For every slide in the new proposal plan, map it to a donor slide of the same
   archetype:
   - **Reused library slides** (frameworks, About Deloitte, T&C, legal, launch-phase
     methodology, boilerplate): keep the donor slide, update footers/project name/dates.
   - **Same-archetype rewrites** (exec summary, PoV slides, methodology pages, CVs,
     credentials, Gantt): keep the donor slide's shapes and geometry; replace run text
     only (assign `run.text`, never `text_frame.text` which nukes formatting); swap
     photos/logos via the rels; delete surplus repeated groups whole (image + text boxes
     together), never leave orphaned visuals.
   - **Net-new slides**: duplicate the closest archetype with `add_slide.py`
     (never hand-copy slide files) and edit.
4. Reorder/delete via `<p:sldIdLst>` in `ppt/presentation.xml`, run `clean.py`, rezip
   from inside the dir, validate with `validate.py --original donor.pptx`.
5. Do ALL structural work (add/duplicate/delete/reorder) BEFORE editing content.

Only when no donor exists: build from scratch per `design-system.md` +
`slide-archetypes.md` with pptxgenjs (respect the pptx skill's gotchas: set layout size
13.333×7.5, no `#` in hex, RTL text boxes need `rtl: true` + `align: "right"`,
`lang` on runs, bold-only emphasis).

## 1b. Template infrastructure facts (from XML forensics of the reference decks)

**Masters & layouts.** The reference files carry FIVE slide masters and 60 layouts —
clone accretion from years of proposal copying (deck 1 even contains a master with
deck 2's footer frozen inside it). **A rebuild collapses to ONE master + ~14
layouts**: cover (Title Slide - White), letter (Letter Layout), TOC, divider
(Divider - Deloitte white), hero (3_Title & subtitle master1), general content
(3_Title & subtitle — the L5/L26 twins merged), frameworks chassis (2_MD Proposal
Content Slide), methodology (1_MD Proposal Content Slide), 3-card drivers
(11_Title & subtitle), funnel photo-bg (6_Title & subtitle), credential detail
(4_Title & subtitle: 20pt one-line title + gray `53565A` headline placeholder whose
layout default is 18pt — slides override the headline run to 16pt; run overrides win),
About (Title Only + 1_Title & subtitle), certificates (2_/5_Title & subtitle), T&C
(Text and chart), disclaimer.

**Footers are MASTER-level literal shapes** (not placeholders): page number
(`slidenum` field) at (0.50", 7.13"), CaseCode project line at (1.05", 7.13") 10.5→9pt
(`العرض الفني: {الجهة} | {المشروع}`), Copyright right-aligned at (6.98", 7.13") 9pt.
Per-proposal footer changes are **master edits**. Suppression mechanics: cover +
letter layouts set `showMasterSp="0"` (the letter then REDRAWS its own identical trio
locally — that's why it's "page 2"); dividers keep master shapes on but their
full-bleed art covers them. Don't "fix" either mechanism.

**Content-slide source line** is a layout placeholder (8pt) at y≈6.63", just above the
footer — put `المصدر: …` there, not in a free textbox.

**Fixed media assets** (reuse byte-identical for pixel fidelity): `image8.jpeg`
header-band skyline; `image9.png` white contour-wave; `image13.jpeg` KAFD night hero
(cover/exec-summary/credentials matrix); divider art photos + pattern tiles; the
Monitor Deloitte wordmark is a **vector EMF**; icons are **real SVGs** (`svgBlip` with
PNG fallback — keep SVG+PNG pairs when inserting new icons). Omit on rebuild: hidden
think-cell OLE stubs, the hidden FFFF00 tag rectangle, two 158750-EMU debris squares,
and the off-canvas color-swatch board parked past the right edge.

**Fonts are NOT embedded** and the theme's `<a:cs>` typeface is EMPTY — Sakkal
Majalla exists only as run-level `rPr`. The pipeline must (a) have Sakkal Majalla
installed for rendering/QA and (b) set `latin`+`cs`(+`sym`) = "Sakkal Majalla" on
every run it writes (or fix the theme cs font as an improvement).

**Native charts**: the GDP-scenario, district-bar, and population-scenario slides use
REAL PowerPoint chart parts with editable embedded workbooks (white-styled series per
the house grammar) — generate line/bar data slides as native charts (evaluators can
click into them). The Gantt and all diagrams are hand-drawn autoshapes.

**Speaker notes**: the references carry none — don't add any.

## 2. RTL mechanics (critical — the #1 corruption source)

- **RTL is opt-in per paragraph, never global**: presentation and master defaults are
  LTR (`algn="l" rtl="0"`); EVERY Arabic paragraph sets `<a:pPr algn="r" rtl="1">`.
  Latin paragraphs (letterhead, emails, EN education lines) stay LTR — mixed slides
  legitimately carry both.
- Every Arabic run keeps `latin`+`cs`+`sym` = Sakkal Majalla; digits and Latin names
  are separate `lang="en-US"` runs inside RTL paragraphs. Do not reorder characters
  manually — the bidi algorithm handles order.
- Hand-built tables need `<a:tblPr rtl="1">` — then the FIRST `gridCol` renders at
  the far RIGHT (author columns in logical order). The reference TOC table lacks it
  (a think-cell artifact) — set it in rebuilds.
- `flipH="1"` mirrors chevrons/homePlate arrows so points lead LEFT = RTL flow.
  Column sequences, tab ribbons, numbered circles, and the Gantt time axis all run
  right→left.
- Rendering caveat: LibreOffice mirrors some RTL tables/ribbons vs real PowerPoint —
  when a render looks flipped, verify against the XML before "fixing".
- Arabic-Indic digits (١٢٣) appear ONLY in the final disclaimer's legal prose;
  Western digits everywhere else.

## 3. Assembly order (do content in this order)

1. Structure pass: full slide list from the Proposal Plan (deck-blueprint budgets),
   duplicated/deleted to match, `<p:sldIdLst>` final.
2. Boilerplate pass: footers (`العرض الفني: {الاسم}` + copyright + page numbers), cover,
   letter, dividers.
3. Bespoke content pass: exec summary → PoV → approach → timeline → team → CVs →
   credentials (order matters — later sections quote earlier names).
4. Cross-reference pass: TOC page numbers, `(1/N)` counts, track names identical across
   exec-summary/PoV-pivot/approach/Gantt/BoQ table, deliverable names identical to BoQ.
5. QA pass (below).

## 4. QA checklist (run ALL of it; render → inspect → fix → re-render)

Render: `soffice.py --headless --convert-to pdf` → `pdftoppm -jpeg -r 150` → inspect
EVERY slide image fresh (subagent review recommended).

**Text/QA**
- [ ] No placeholder residue (grep the markitdown dump for lorem/xxx/TODO/`[insert`/old
      client names — **grep for the DONOR's client name and project name**; zero hits
      allowed outside legitimately-shared context).
- [ ] Project name character-identical everywhere (cover, letter subject, footers,
      titles, TOC).
- [ ] Titles are complete assertion sentences; storyline reads through titles alone.
- [ ] Every stat has a source line; every mock visual has `للتوضيح`; every partial list
      `غير شامل`.
- [ ] All CVs/credentials/experts real (from library) — zero invented people, projects,
      numbers, or logos.

**Visual QA (per slide)**
- [ ] No text overflow/cut-off (Sakkal Majalla renders near-true in LibreOffice; still
      keep ~5% slack in boxes).
- [ ] RTL alignment: right-aligned text, right-anchored layouts, flows run right→left.
- [ ] Repeated archetypes pixel-consistent (methodology pages, CVs, credentials:
      identical frame positions across all instances).
- [ ] Header band present on all content slides; heroes/dividers chrome-free.
- [ ] Colors only from the palette; the green highlight only on load-bearing phrases.
- [ ] **Font enforcement**: every run the generator authored carries
      `typeface="Sakkal Majalla"` on latin+cs+sym — verify with
      `grep -L 'Sakkal Majalla' unpacked/ppt/slides/slide*.xml` (only untouched donor
      slides may differ) and spot-grep new slides for stray `Calibri`/`Arial`
      typefaces in authored text.
- [ ] Photos: correct city, dark enough for white text, no stretching/distortion.
- [ ] Footer page numbers sequential; TOC numbers match reality.

**File QA**
- [ ] `validate.py out.pptx --original donor.pptx` clean.
- [ ] Opens in LibreOffice; PDF export has the same slide count as `<p:sldIdLst>`.

## 5. Failure patterns to avoid (observed AI tells)

- Even spacing forced onto uneven content (the reference decks center each numbered
  circle on its own paragraph — ragged is human).
- One-idea-per-bullet inflated into one-bullet-per-slide emptiness; the house style is
  DENSE (a methodology page carries 15–25 activity bullets).
- Icon soup: an icon for every bullet. House style: icons only in defined slots (card
  headers, About-Deloitte stat cards, framework stage badges).
- Emphasis inflation: bolding whole sentences. Bold is for lead-ins and payloads only.
- Inventing a new divider/section when unsure — always map content into the canonical
  16 sections.
