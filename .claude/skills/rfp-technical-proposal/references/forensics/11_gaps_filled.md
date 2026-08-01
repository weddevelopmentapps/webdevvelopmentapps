# 11 — GAPS AUDIT & FILL (completeness critic pass)

Audit of findings 01–10 against the goal "a skill file can regenerate a pixel-faithful new proposal".
Findings 01–10 cover every *content* archetype (cover→disclaimer) with EMU geometry, hex, and writing formulas.
The gaps were all in the *infrastructure* layer: master/layout architecture, footer mechanics, layout→slide census,
consolidated RTL rules, media/asset inventory, font-embedding reality, and native-chart usage. All verified and
filled below by direct XML inspection of `unpacked1/` (deck1; deck2 spot-checked).

---

## GAP 1 (FILLED) — MASTER ARCHITECTURE: there are FIVE slide masters, and they prove the clone workflow

`ppt/slideMasters/` holds slideMaster1–5 (~57–60 KB each), each owning a family of layouts
(master1 → layouts 1–3; master2 → 4–14; master3 → 15–30; master4 → 31–45; master5 → 46–60).
The 60 layouts are ~4 near-duplicate generations of the same ~15-layout family (duplicate names like
"3_Title & subtitle" exist as L3/L5/L26/L32/L47 across different masters).

**Smoking gun:** inside DECK1 (the فبراير 2026 ريمات deck), master4's footer reads
`العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض` + `© 2025 …محفوظة.`
— i.e., DECK2's footer, frozen inside DECK1's file. Masters/layouts accrete as proposals are cloned.
**Regeneration rule:** collapse to ONE master + the ~14 layouts actually used (list in Gap 3); do not reproduce the accretion.

### slideMaster1.xml anatomy (the pattern for all five)
- Background: `<p:bgRef idx="1001"><a:schemeClr val="bg1"/>` (plain white).
- Title ph at (501651, 317501) 11188700×309820; body ph idx=1 at (501650, 1665289) 11188700×4716462.
- `<p:txStyles>` defaults: titleStyle lvl1 = **21pt, algn="l"**, Sakkal Majalla (latin+cs), tx1;
  bodyStyle lvl1 = **13pt, algn="l"**, b=0; otherStyle 18pt. NOTE: master defaults are LTR/left —
  RTL is applied per-paragraph on slides, never inherited (see Gap 4).
- `<p:hf hdr="0" dt="0"/>` — header/date placeholders disabled.
- **The footer trio are plain SHAPES on the master, not placeholders** (no `<p:ph>`):
  | Shape name | off (EMU) | ext (EMU) | Spec |
  |---|---|---|---|
  | TextBox 31 (page no.) | 457201, 6517368 | 307975×161583 | 10.5pt Sakkal Majalla/Arial, `<a:fld type="slidenum">` |
  | CaseCode (project line) | 960257, 6517368 | 6437160×138499 | 10.5→9pt, tx1, text `العرض الفني: …` |
  | Copyright | 6379632, 6517368 | 5355168×138499 | 9pt, algn="r", `© 2026 ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة` |
  Consequence: to re-stamp footers per proposal you edit the MASTER(s) (all 5 in the source files), and any
  slide whose layout sets `showMasterSp="0"` loses the footer entirely.
- Also on the master (template debris to omit): two 158750-EMU squares at (0,0), and the full Deloitte
  swatch board parked OFF-CANVAS at x≥12338175 (20 chips: 004F59, 2C5234, 53565A, D0D0CE, A7A8AA, 97999B,
  86BC25, 43B02A, 26890D, DDEFE8, 6FC2B4, 00ABAB, 012169, 62B5E5, 00A3E0, 0076A8, 005587, 007680, 1A7749, 63666A).
- Masters 2/3 = same trio, DECK1 strings; masters 4/5 = © 2025 variants. The letter layout (L16) sets
  `showMasterSp="0"` but REDRAWS its own identical footer trio — that's why the letter is "page 2".

### Footer suppression mechanics (who has no footer and why — two different mechanisms)
- Cover (L9 "Title Slide - White") and Letter (L16): explicit `showMasterSp="0"`.
- Dividers (L4 "Divider - Deloitte white"): showMasterSp defaults ON, but the full-bleed layout art
  (photos + gradient rect at z-order above master shapes) simply COVERS the footer. Don't "fix" this.

---

## GAP 2 (FILLED) — THE MOST-USED LAYOUTS, dissected (the three the whole deck stands on)

### slideLayout27 "4_Title & subtitle" — 70 slides (the credentials-detail chassis)
Used by s101–104 + 107–172 (every خبراتنا detail slide). It is the MINIMAL white layout:
- Title ph (457200, 345992) 11277600×334099, **20pt (sz=2000), anchor="t"** — the thin one-line title strip.
- Body ph idx=22 (457200, 736105) 11277600×757255, 18pt, solid 53565A — the gray headline-sentence placeholder
  (this is where the credential's `دعمت ديلويت…` headline lives).
- Plus the hidden 1588-EMU think-cell OLE (image2.emf rel). No band, no photo — all credential art
  (photo panel, white card, green slivers) is drawn per-slide.

### slideLayout11 "2_MD Proposal Content Slide" — 58 slides (the frameworks-appendix chassis)
Used by s175–233 (+s75). Carries the full header band ON THE LAYOUT:
- Picture 17 = `image8.jpeg` skyline strip, (0,0) 12192000×1418619 (band height 1.55in).
- Rectangle 18 over it, same rect, gradient `056946` alpha 85% @pos 18000 → `88AEF1` alpha 60% @pos 100000,
  **`<a:lin ang="8100000" scaled="1"/>`** (135°). ⚠ CORRECTION to 05_approach.md, which recorded ang=2700000 —
  the layout XML says 8100000 on L11, L5 and L26 alike.
- Picture 22 = `image9.png` white contour-wave overlay at (−5068, 22827) 12197068×2212373 (bleeds past both edges;
  hi-res JPEG-XR alternate `hdphoto3.wdp` attached via ms-photo extension).
- Title ph (457200, 345992) 11277600×864970, **28pt, anchor="ctr"** (2-line titles wrap inside the band).
- Body ph idx=24 at (457201, 6377326) 11277599×123111, **8pt** — the SOURCE-LINE placeholder sitting just above
  the master footer. (This is where «المصدر: …» goes; it's a layout placeholder, not a free textbox.)

### slideLayout5 + slideLayout26, both "3_Title & subtitle" — 30 + 26 slides (the general content chassis)
Same anatomy as L11 (band photo image8.jpeg + 056946→88AEF1 gradient + wave overlay + 28pt ctr title +
8pt bottom body ph idx=15 at (498475, 6375400)), plus a **hidden FFFF00 tag rectangle** at (0,0) 181024×144015
(template artifact — omit). L5 (master2) carries: approach overview/BoQ (45–47), KT pair (59–60), Gantt (64),
team/leadership/experts (66–70), team+expert CVs (73, 76–92), frameworks divider-adjacent (174, 177).
L26 (master3) carries: PoV context/argument dark slides (13–18, 21, 23, 25–30, 32–35, 40) and the credentials
matrix (94–100). Functionally identical twins from different master generations → merge into one when rebuilding.

---

## GAP 3 (FILLED) — COMPLETE LAYOUT→SLIDE CENSUS, DECK1 (archetype ↔ layout mapping)

| Layout | Name | n | Slides | Archetype |
|---|---|---|---|---|
| L27 | 4_Title & subtitle | 70 | 101–104, 107–172 | credential detail |
| L11 | 2_MD Proposal Content Slide | 58 | 75, 175–219, 221–233 | frameworks appendix (+1 CV stray) |
| L5 | 3_Title & subtitle | 30 | 45–47, 59–60, 64, 66–70, 73, 76–92, 174, 177 | approach/team/CVs |
| L26 | 3_Title & subtitle | 26 | 13–18, 21, 23, 25–35*, 40, 94–100 | PoV dark + credentials matrix |
| L4 | Divider - Deloitte white | 13 | 4, 7, 44, 63, 65, 71, 72, 81, 93, 173, 234, 246, 259 | ALL dividers |
| L12 | 1_MD Proposal Content Slide | 13 | 48–58, 61–62 | detailed methodology |
| L6 | Text and chart | 12 | 247–258 | T&C text pages |
| L18 | 11_Title & subtitle | 9 | 12, 19–20, 22, 24, 36–38, 42 | 3-card drivers/statements/proof |
| L30 | Title Only | 7 | 237–239, 242–245 | About-Deloitte slides |
| L13 | 2_Title & subtitle | 7 | 260–263, 266–268 | legal-document scans |
| L29 | 1_Title & subtitle | 6 | 105–106, 235–236, 240–241 | credential+About mixed |
| L19 | 6_Title & subtitle | 4 | 9–10, 41, 43 | funnel photo-bg slides |
| L3 | 3_Title & subtitle (master1) | 3 | 5–6, 11 | exec-summary heroes + royal quote |
| L14 | 5_Title & subtitle | 2 | 264–265 | 2-page certificate scans |
| singletons | | | 1→L9 cover; 2→L16 letter; 3→L8 TOC; 8→L20; 31→L28; 39→L32; 74→L47; 220→L10; 269→L7 disclaimer | |
(*minus 31, 39 which sit on L28/L32 one-offs.) Rebuild set = **14 layouts**: L9, L16, L8, L4, L3, L26/L5 (merged),
L11, L12, L18, L19, L27, L29, L30, L13/L14, L6, L7.

---

## GAP 4 (FILLED) — CONSOLIDATED RTL / DIRECTIONALITY RULES (scattered before, now one list)

1. **RTL is opt-in per paragraph, never global.** `presentation.xml` defaultTextStyle lvl1 =
   `algn="l" rtl="0"`; master txStyles also algn="l". EVERY Arabic paragraph on every slide sets
   `<a:pPr algn="r" rtl="1">`. Census: slide45 = 43×rtl="1"/43×algn="r"/0×algn="l"; slide247 (T&C) = 33/33/0.
2. **Latin content keeps LTR paragraphs**: mixed slides carry both (CV s73: 25×algn="r" + 21×algn="l" —
   the Latin letterhead/email/education lines; slide105: 15 r / 9 l). Digits and Latin names are separate
   `lang="en-US"` runs inside RTL paragraphs.
3. **Tables**: `<a:tblPr rtl="1"/>` on hand-built tables — BoQ (s46) and credentials matrix
   (s94: `rtl="1" firstRow="1" firstCol="1" bandRow="1"`). With rtl="1" the FIRST `gridCol` renders at the
   far RIGHT (author columns in logical order). Exception: the TOC table (s3, think-cell-generated) has NO
   rtl attribute — its column order was authored visually; don't copy that quirk, set rtl="1".
4. **Shape mirroring**: `flipH="1"` on content rects/chevrons (slide45: 10 instances) makes homePlate/
   pentagon arrows point LEFT = RTL flow. Layout column sequences, tab ribbons, numbered circles and
   Gantt time axis all run right→left.
5. **Rendering caveat**: LibreOffice renders rtl tables/ribbons mirrored vs PowerPoint — trust the XML.
6. Arabic-Indic digits (١٢٣) appear ONLY in the final disclaimer's legal prose; everywhere else Western digits.

---

## GAP 5 (FILLED) — MEDIA / ASSET INVENTORY (`ppt/media`, nobody had documented it)

Deck1: **794 files** (deck2: 891): 443 PNG, 178 JPEG, **110 SVG**, 25 EMF, 36 WDP (JPEG-XR), 1 GIF, 1 TIFF.

Key template assets (stable rIds via layouts; reuse byte-identical for pixel fidelity):
| File | What it is | Where |
|---|---|---|
| image8.jpeg (38 KB) | header-band skyline photo, stretched to 12192000×1418619 | L5/L11/L26 band |
| image9.png (1280×232 RGBA) | white contour-wave overlay art | header band + dividers (hdphoto3.wdp = hi-res alternate) |
| image13.jpeg (189 KB) | KAFD night hero, full-bleed 12192000×6858000 | cover L9, exec-summary s5/6, credentials matrix |
| image5.png (1074×806), image6.png, image7.png | divider art: gold lattice photo, city night, pattern tiles | L4 divider |
| image14.png (300×140) | client logo (cover card) — the per-proposal swap slot | L9 |
| image12.emf | Monitor Deloitte wordmark — **vector EMF**, 1841929×761121 on cover | L9/L16 |
| image2.emf / image15.emf / image4.emf (188 B) | think-cell stub objects, 1588 EMU, on every layout | omit in rebuild |
| hdphoto1/2/3/4.wdp | JPEG-XR hi-res alternates for wave/pattern art | L4, L5, L11 |

- **Icons are true SVGs**: 44 deck1 slides embed `<asvg:svgBlip>` with PNG fallback — the thin-line icon
  system is vector. A generator should keep SVG+PNG pairs (python-pptx: add PNG, then patch svgBlip ext).
- Logos: client/partner logos mix PNG and EMF; wordmarks are EMF vectors.
- 282 files in `ppt/embeddings` (think-cell OLE .bin + 3 .xlsb chart workbooks).

---

## GAP 6 (FILLED) — FONTS ARE **NOT EMBEDDED** + theme-font reality

- No `embeddedFontLst`, no `ppt/fonts/` — **Sakkal Majalla must be installed** on the generating/rendering
  machine or the deck falls back (this is why LibreOffice renders drift). Ship/install the font in the pipeline.
- theme1.xml major+minor fonts = **Calibri with EMPTY `<a:cs typeface=""/>`** — the theme provides NO Arabic
  font. Arabic exists ONLY because every run sets `rPr` latin+cs(+sym) = "Sakkal Majalla". A rebuild must set
  the font on every run (or fix the theme's cs font to Sakkal Majalla as an improvement).
- Divider big titles: slide72 XML = 3×sz=8800 runs, 6× "Sakkal Majalla" + 1× "Open Sans" typeface refs —
  Open Sans appears only as latin fallback on divider text. Resolves the 01 (Sakkal) vs 07 (Open Sans)
  contradiction: **Arabic divider glyphs render in Sakkal Majalla; Open Sans is the latin face on those runs.**
- notesSlides exist (258 in deck1 / 278 in deck2) but contain only stray digits — no speaker notes to reproduce.

---

## GAP 7 (FILLED) — NATIVE CHART PARTS EXIST (correction to "everything is shapes")

`ppt/charts/chart1–8.xml` + `style1/colors1.xml` + 3 embedded .xlsb workbooks. Referenced by:
- s9 → chart1 (KSA GDP scenarios — a real `<c:lineChart>`, not drawn shapes)
- s14 → chart2 (district bar chart), s15 → chart3 (population scenarios)
- s185 → chart4+5, s199 → chart6, s219 → chart7, s224 → chart8 (frameworks-appendix mini charts)
So: scenario/bar charts on data slides are NATIVE PowerPoint charts with editable workbook data (white-styled
series per house grammar); the Gantt and all diagrams remain hand-drawn autoshapes (06's finding stands for
the Gantt). A generator should emit real chart parts for line/bar data — evaluators can click into them.

## Corrections log (to apply when writing the skill)
1. Header-band overlay gradient angle = `ang="8100000" scaled="1"` (not 2700000) on L5/L11/L26.
2. Footer trio = master-level literal shapes with a `slidenum` field — per-proposal footer changes are
   master edits, and the letter layout duplicates the trio locally.
3. Divider layout's OWN title default is 36pt; 88pt is a slide-level override (both decks do it on every divider).
4. TOC table lacks rtl="1" (think-cell artifact) — set it in rebuilds.
5. s9/s14/s15 "chart" slides are native charts, not shape-drawn (03_pov_context implied drawn lines).
