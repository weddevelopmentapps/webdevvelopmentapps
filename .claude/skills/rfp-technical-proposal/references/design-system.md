# Design System — البصمة البصرية للعرض الفني

Every measurement, color, and type rule in this file was extracted from the two reference
decks (RMUN Strategic Studies AR v1.0.0, 269 slides; RMUN Central Riyadh Sectors AR v1.0.0,
286 slides). Treat these as **hard constraints**, not suggestions. A slide that violates them
will read as foreign to the house style.

## 1. Canvas & grid

| Property | Value |
|---|---|
| Slide size | 13.333 in × 7.5 in (12,192,000 × 6,858,000 EMU), 16:9 widescreen |
| Direction | **RTL**. Text frames carry `rtl="1"`, paragraphs right-aligned (`algn="r"`). Reading order right → left; diagrams, process flows, Gantt month columns, and numbered sequences all run right → left |
| Content margins | 0.50–0.55 in left/right; title block at y = 0.36–0.38 in |
| Header band (content slides) | Full-width rectangle 13.33 × **1.55 in** at (0,0): city-skyline photo with gradient overlay — `056946` at 85% alpha (position 18%) → `88AEF1` at 60% alpha (position 100%). Title sits inside this band |
| Title placeholder | (0.50, 0.38), 12.33 × 0.95 in, right-aligned, RTL |
| Body zone | y ≈ 1.7 in → 6.9 in (below band, above footer) |
| Footer line | y = 7.13 in: page number at x=0.50 (10pt); project name "العرض الفني: {اسم المشروع}" at x=1.05, width 7.04 in (10pt); copyright right-aligned at x=6.98, width 5.86 in (9pt) |

## 2. Color palette (exact hex — never approximate)

### Primary greens (Deloitte brand)
| Hex | Role |
|---|---|
| `86BC25` | **Signature bright green.** Highlighted phrases inside titles, big stat numbers, section-header underline bars, active-state accents, key callouts |
| `26890D` | Primary green for shapes, sub-headlines on white, icon strokes, tagline text |
| `43B02A` | Secondary green (accent2) — mid-tone fills |
| `046A38` | Dark green — org-chart leadership boxes, dark fills |
| `009A44` | Supplementary green for diagram fills |
| `056946` | Header-band gradient start (with photo underlay) |
| `0A5456` → `055B3F` | TOC/divider panel gradient: 45° linear, both stops ~85% alpha, over a city night photo (reads as the rich dark-green field; `1A7749` is its approximate flat equivalent) |

### Teals & blues
| Hex | Role |
|---|---|
| `0D8390` | Teal — icon circles on dark photo cards, Gantt phase bands, expert-card fills, framework stage 2 |
| `007CB0` | Blue — framework stage 1, hyperlink-adjacent accents |
| `62B5E5` / `00B0F0` | Light blue accents in charts/diagrams |
| `0F2837` | Near-black navy — framework stage 3 / dark diagram fills |

### Neutrals
| Hex | Role |
|---|---|
| `000000` | Titles and body text on white |
| `FFFFFF` | Text on dark photo/green; white cards |
| `53565A` | Dark gray (dk2) — secondary text, letterhead |
| `575757` / `313131` | Body gray text |
| `D0D0CE` | Light gray (lt2) — big ghost numerals (1 2 3 4), inactive states, "اخرين ++" boxes |
| `BFBFBF` / `A6A6A6` | Mid grays — dashed separators, muted labels |
| `F2F2F2` / `EEEEEE` | Light gray panel fills (CV sidebar, deliverables sidebar) |

### Tint backgrounds (cards/table rows)
| Hex | Role |
|---|---|
| `F2F8E5` / `EFF3E8` | Pale green tint — highlight cells, alternating table rows |
| `E5F0F9` / `E5F7FD` | Pale blue tint — secondary highlight cells |

### Warm accents (rare, semantic)
| Hex | Role |
|---|---|
| `ED8B00` | Deloitte orange — big stats ONLY when the number signals pain/scale (e.g. an overloaded org: `22+ إدارة`), never achievements |
| `C00000` | Red — negative accents, at most 1–2 per slide, matrices/heat only |

### Color discipline
- One dominant color family per slide (green). Teal (`0D8390`/`004F59`) is the standard secondary for structural fills: icon circles, banner boxes, tab bars, matrix cells, Gantt bands. Blue appears only in multi-stage frameworks and charts.
- Green semantics: `86BC25` = underline rules, icons, ✓ badges, headline emphasis on dark; `046A38` = header bars and emphasis on light backgrounds; `D0D0CE` = ghost numerals.
- Achievement numbers green; pain/scale numbers orange `ED8B00`; nothing else warm.
- Never introduce colors outside this palette.

## 3. Typography

| Element | Font | Size | Weight/Color |
|---|---|---|---|
| Arabic — all text | **Sakkal Majalla** | see below | — |
| Latin fragments (framework names, emails, URLs, EN logos) | Arial / Calibri / Open Sans | match surrounding | — |
| Slide title (content slides) | Sakkal Majalla | **28pt** | Bold; white on header band; black on white slides; highlighted phrase = `schemeClr accent4 + lumMod 60%/lumOff 40%` bold (renders bright green — use the schemeClr formula, not raw hex) |
| Section divider title | Sakkal Majalla | **88pt** | Bold white (both lines of appendix dividers too; `(غير شامل)` sample-tag = 48pt italic white) |
| Cover: client name | Sakkal Majalla | 40pt | Bold, `schemeClr accent3 + lumMod 60%/lumOff 40%` (bright green) |
| Cover: project title | Sakkal Majalla | 32pt | Bold white |
| Cover: "العرض الفني" / date | Sakkal Majalla | 20pt / 16pt | Bold white |
| TOC title / rows | Sakkal Majalla | 24pt / 16pt | White; page numbers `D0D0CE` |
| Letter body / bullet lead-ins | Sakkal Majalla | 12pt / 14pt | Black / **bold teal `0D8390`** (letter-only accent) |
| Sub-headlines / block headers | Sakkal Majalla | 16–20pt | Bold; `26890D` on white, `86BC25` or white on dark |
| Body / bullets | Sakkal Majalla | **12–16pt** (14 default; 12 dense) | Black on white, white on dark |
| Dense table/appendix text | Sakkal Majalla | 9–11pt | — |
| Big stat numbers | Sakkal Majalla | 32–48pt (up to 88pt on stat slides) | Bold `86BC25` on dark, `26890D` on white |
| Footers | Sakkal Majalla | 9–10pt | Gray/white per background |
| T&C legal text | Sakkal Majalla | 8–9pt | Black |
| Chart axis/labels | Arial or Sakkal Majalla | 9–11pt | Per background |

Rules:
- **Bold is the primary emphasis.** Italic appears in exactly three places: the divider-level `(غير شامل)` tag (48pt), the expertise tag under expert names on the الخبراء grids, and occasional table column-header labels — nowhere else. Underline for text appears only on credential block headers (`السياق:` / `المنهجية:` / `النتيجة:`) and CV section headers; elsewhere the "underline" is an accent bar drawn as a shape.
- Latin terms stay in Latin inside Arabic sentences: `StrategyByDesign©`, `SWOT`, `PESTEL`, `CAGR`, `KPI`, emails, URLs. Keep them in a Latin font.
- Numbers: use Western digits (1, 2, 3…) throughout — matching the reference decks.

## 4. The photo language

- **Subject matter**: Riyadh cityscapes (KAFD towers, Kingdom Tower, metro stations, aerial districts) or the client city. Night/dusk shots for covers and dark slides; golden-hour aerials for panoramas. For new clients, use the client's own city/asset photography — never stock-generic "business people shaking hands".
- **Treatments**:
  - Cover: full-bleed photo, slight dark vignette at bottom for title legibility.
  - Dark content slides: full-bleed photo with heavy dark overlay (60–80% black) so white text reads.
  - Split slides: photo occupies a full half or third panel, hard edge (sometimes a chevron/arrow edge pointing into the content panel).
  - Photo cards (enabler/challenge rails): each card is a topical photo (traffic, blueprint, chart screen) with dark overlay + white text.
- **Header band**: always the same city panorama + green gradient overlay (see §1) — this is the single most recognizable element of the system.

## 5. Iconography

- Style: **thin-line white icons inside filled teal (`0D8390`) circles** on dark cards, with a white ring offset creating a double-circle effect; or **green (`26890D`/`86BC25`) outline icons in outline circles** on white slides (About-Deloitte style).
- Icon circles on cards: ~0.9–1.1 in diameter, centered at the top of the card, overlapping the card edge.
- Never mix icon families on one slide; never use emoji, clipart, or filled-color multi-hue icons.

## 6. Shapes & connectors

- Cards: sharp-cornered or barely-rounded rectangles. White cards on photo panels carry a thin `86BC25` top bar accent (credentials) or a green underline bar below the card title (enabler/challenge cards).
- Ghost numerals: giant `D0D0CE` numbers (60–90pt) behind/above numbered concepts (one-team slide, PoV lists).
- Numbered circles: thin black or white outline circles with the number, used for approach tracks (0,1,2,3,4).
- Arrows: chevron shapes for process direction (pointing left in RTL flow); dashed gray connectors for org-chart QA/advisory relations; solid elbow connectors for hierarchy.
- Dashed separators: `BFBFBF`/white dashed 1pt lines between table rows on photo backgrounds.
- The 6-stage framework ribbons use bidirectional double-headed arrows between stage blocks.

## 7. Tables

- Header row: bold, either on `0D8390`/green band (Gantt phase rows, matrix headers) or plain bold black with a solid underline.
- Data rows: white/transparent with dashed separators (on photo) or hairline gray borders (on white); zebra tints `F2F8E5`/`E5F0F9` when categorization matters.
- Country flags as small rectangular icons inside credential tables.
- Checkmarks: Wingdings 2 "P" (✓) in green for capability/criteria matrices.

## 8. Charts

- Line charts on dark slides: **white series lines**, white axis labels, scenario labels inside white oval badges ("CAGR = 8%"), a green (`86BC25`) filled callout box with pointer + green data-point dot for the key message (e.g. "هدف رؤية 2030 = 6.5 ترليون ريال").
- Bar/column: green family (`86BC25`, `26890D`, `046A38`) with `D0D0CE` for comparisons.
- Choropleth maps: 5-step green ramp from near-white to `26890D`, with a horizontal gradient legend bar labeled كثافة سكانية منخفضة/عالية.
- Every chart gets: a bold chart title (what it shows + unit + year range), axis unit label, and a **source line**.

## 9. Recurring micro-elements

| Element | Spec |
|---|---|
| Source line | `المصدر: أبحاث وتحليلات مونيتور ديلويت، {جهات أخرى}` — 9pt, bottom of content zone, above footer |
| Copyright | `© {year} ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة` — every content slide |
| Illustrative tag | `للتوضيح` in a small teal box, top-left corner, on any mocked/example visual |
| Non-exhaustive tag | `غير شامل` small gray tag on logo walls / expert lists |
| Pagination | `(1/3)` appended to repeated-title series — **in the title itself** |
| Breadcrumb titles | `منهجية المشروع التفصيلية | المسار الأول – {الاسم} (1/3)` and `خبراتنا | محلياً` — the `|` separator is the standard |
| Continuation titles | Slide A ends `...` and slide B starts `...` to span one sentence across two consecutive slides (e.g. `يسكن منطقة الرياض حوالي 8.6 مليون نسمة ...` → `... 81% منهم يتركزون في مدينة الرياض`) |
| Logo cards | `F2F2F2` rounded-corner cards 3.52 × 1.28 in, top corners of cover: client logo top-left, Monitor Deloitte top-right |
| Status pill | `قيد التنفيذ` — white pill, black bold-italic 10pt, on in-progress project medallions |
| "And more" bar | `++ مستندات اخرى` / `++ خدمات أخرى يقدمها القطاع بشكل مستمر` — full-width bar closing enumerations |
| Cross-reference ribbon | `تجدون المزيد من المشاريع في ملحق "خبراتنا"` / `تفاصيل في الشريحة التالية` — forward-references between sections, appendix names in «» |
| Tab bar | Rotated double-bracket shapes, one per work area, ~11pt white; inactive = charcoal fill, active = teal fill bold text; runs across the PoV methodology+proof chapters, active tab advancing right→left |
| Focus frame | `تركيز الشرائح التالية` green tag + dashed-green rounded frame around the diagram element the next slides zoom into |
| Checkmarks | Wingdings 2 ✓ glyphs in green circle badges |

## 10. What makes it look human-made (anti-AI-slide rules)

1. **One assertion per slide**, stated fully in the title as a sentence — never a two-word label title.
2. **Dense, aligned content**: real consulting slides are information-rich. Do not leave large empty areas or pad with oversized icons. Density is achieved with discipline: strict column grids, equal gutters, consistent card sizes.
3. **No decorative filler**: no gradient blobs, no random rounded squares, no icon-per-bullet decoration, no drop shadows except the subtle card shadows already in the system.
4. **Real diagrams, not layout tricks**: hub-and-spoke, cascades, chevron flows, matrices with actual axes and weights — every diagram encodes a real structure, not a list dressed as a graphic.
5. **Consistent geometry across sibling slides**: repeated slide types (methodology pages, CVs, credentials) must be pixel-identical in frame positions — only content changes.
6. **Every number has a source**; every example visual has `للتوضيح`; every partial list has `غير شامل`.
7. Footers on every content slide; dividers and cover are the only slides without them.
