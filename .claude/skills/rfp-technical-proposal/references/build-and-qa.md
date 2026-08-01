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

## 2. RTL mechanics (critical — the #1 corruption source)

- Every Arabic paragraph: `<a:pPr algn="r" rtl="1">`; every run keeps
  `latin`+`cs`+`sym` = Sakkal Majalla.
- Mixed Arabic/Latin runs (framework names, emails, `N+` stats): keep the Latin fragment
  in its own run; do not reorder characters manually — the bidi algorithm handles order.
- Tables: column order is visually mirrored in RTL. In the XML, gridCol order stays
  logical; verify visually in the render that months/steps flow right→left.
- Numbered sequences (tracks 0→4, months 1→9, process steps) must READ right→left in the
  render. If a donor diagram is being repurposed, keep its shape order — it is already
  RTL-correct.

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
