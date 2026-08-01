# Section Playbook — الجدول الزمني + فريق العمل + الملفات التعريفية

Fixed chapter order: **Gantt → team-structure org chart → leadership cards → experts
(N pages)** — then the CV appendices. The chapter owns a private sub-palette layered
over the theme — reproduce these EXACT hex values (not derivable from the theme):
teal `007680`→`004F59` gradients, Gantt diamonds `1A7749` (dark) / `86BC25` (bright),
launch band gray `75787B`, knowledge-transfer olive `435E13`. Nothing in this chapter
uses tables, SmartArt, or chart objects — 100% positioned autoshapes + text boxes +
picture fills (which is what makes pixel-faithful programmatic rebuilds feasible).

## 1. Gantt slide (خطة العمل الزمنية)

**Title** (20pt white, no highlight): `سيتم تنفيذ المشروع عبر {N} {مسارات رئيسية |
مراحل مختلفة} وخلال مدة زمنية تقدر بـ{M} {أشهر|شهرًا} بحسب كراسة الشروط والمواصفات` —
the duration MUST match the RFP exactly; evaluators check the كراسة citation.

**Grid** (time flows RIGHT → LEFT, month 1 = rightmost column):
- Canvas x=1.44", width=8.44"; month cell width = 8.44/M; bordered white header cells,
  month numerals 16pt bold black, `الشهر` label at far right; thin vertical gridlines
  (0.25–0.75pt dark gray) full height.
- Legend block top-left OUTSIDE the canvas: `الشرح:` bold + one marker/label per line
  (16pt), listing ONLY marker types actually used.

**Rows** (top→bottom):
- `0. الانطلاق` band — solid gray `75787B`, white bold 13pt, with exactly two month-1
  mini-square tasks: `إطلاق المشروع`, `تحديد الطموح` (fixed boilerplate).
- Per phase: full-width solid teal `007680` band (numbered phase name, 13pt bold
  white — byte-identical to the methodology chapter names) + 1–4 task rows (labels
  12pt black, right-aligned at the right margin, 0.22" pitch, decimal numbering
  `1.1, 2.1…` optional).
- Bars: thin flat black rectangles (0.08" high), snapped to month boundaries;
  continuous streams (PMO, knowledge transfer) run full width.

**Markers** (semantic vocabulary):
- Dark `1A7749` diamond = `التقارير الدورية` (recurring reports — one per month on
  report rows).
- Bright `86BC25` diamond = `الدراسات` / quarterly deliverables.
- Small dark ellipse with white `#` at a bar's LEFT tip = `مخرج رئيسي` (key contract
  deliverable at completion), optionally with an 11pt bold black callout naming it.
- Olive `435E13` ellipse with white teacher icon = `جلسات نقل معرفة (عند الحاجة)`.
- Every diamond sits exactly on a month gridline; labels never overlap bars.

## 2. Team structure org chart

**Title** (fixed boilerplate, reuse verbatim): `سيتولّى إدارة التنفيذ فريق متفرّغ
ومتخصّص سيتابع المشروع بشكل يومي مع الاستفادة من قيادتنا ذات الخبرة وخبراء إقليميين
وعالميين`.

Two columns of white bordered panels (0.25pt border), labels bold 14pt black:
- **Right ~54%** — `قيادة المشروع` panel: lead partner box top-right + QA partner
  (`شريك ضمان الجودة`) top-left joined by a **dashed** gray connector (dashed = QA/
  advisory, solid = line management); optional `المدير التنفيذي` row when a senior
  client-domain figure is on the ticket. Below, `إدارة المشروع وفريق التنفيذ` panel:
  PM box centered with solid vertical connector, then consultants in a 2-column grid.
- **Left ~44%** — `الخبراء` panel: expert boxes 2-col; a `++ اخرين` box closes every
  group; subcontractor logo strips (logo + one named expert + `++ اخرين`) only when
  the bid needs outside capabilities.

**Box grammar — color = hierarchy layer** (all boxes ~1.63" × 0.32", no outline):
| Layer | Fill | Text |
|---|---|---|
| Leadership | dark green `046A38` | 12pt bold white name + 10pt role |
| Project manager | bright green `43B02A` (the ONLY bright box — focal point) | same |
| Consultants | mid-gray (`D0D0CE` @ lumMod75 ≈ `9C9C9B`) | same |
| Experts | gradient `007680`→`004F59` 135° | name + italic tag `خبير مختص في مجال {X}` |
| `++ اخرين` | light gray `BFBFBF` | 16pt bold white |

Photos: circular headshots 0.37", **grayscale forced in XML** (`<a:grayscl/>`), white
ring, overlapping each box's LEFT end (RTL: text right, photo left). No allocation
percentages, no CV page refs — pure name+role+face density.

Rules: every RFP-mandated role appears; PM chosen with direct client-entity
experience; every scope domain has ≥1 matching expert tag; pick ONE of
استشاري/مستشار and use it consistently within the deck.

## 3. Leadership cards (قيادة المشروع وإدارة المشروع)

The one plain LABEL title in the template (the assertion was spent on the org chart).
Two bordered white cards: right `قيادة المشروع` (~6.6" wide, 2–3 profile columns),
left `إدارة المشروع` (~2.4", the PM). **Floating white tab labels straddle each
card's top border — bold teal `0D8390` 18pt** (the section's card-labeling motif).

Per profile column (centered): circular grayscale photo 1.06" → name 14pt bold →
role line 12pt **bold italic** (`الشريك الرئيسي في المشروع`, `مدير المشروع في
المشروع` style) → bio 12pt centered, **60–80 words, 3–4 sentences**:
1. Identity + rank + office (`{الاسم} هو شريك في مكتب مونيتور ديلويت في الرياض…`)
2. Years stat (`وقد اكتسب أكثر من 12 سنة من الخبرة المهنية والاستشارية في الشرق
   الأوسط مع التركيز على {المجال}`)
3. Focus domains (`تركزت معظم أعماله على تطوير الاستراتيجيات ونماذج التشغيل…`)
4. (PM only) name-drop THIS client or sister entities.
Partner/QA bios are stable library assets — reuse untouched; regenerate ONLY the PM
bio. Bios length-matched (±1 line) so columns bottom-align; never overflow the card.

## 4. Experts grid (الخبراء (i/N))

Title: `الخبراء (1/3)` … — label + (page/total); total pages = ⌈experts/4⌉.
**4 experts per page**, RTL (expert #1 rightmost), global numbering continuing across
pages. Per column (pitch ~2.9"):
- **Number ribbon**: rect 0.71" × 0.83", teal gradient `007680`→`004F59` 135°, the
  expert's GLOBAL number in white bold **48pt** (drop to 40pt / widen ribbon for
  2-digit numbers — the reference clips them).
- Circular grayscale photo 1.09" overlapping the ribbon's bottom edge (ribbon reads
  as a bookmark behind the head).
- Name 14pt bold centered (keep `د./الدكتور` prefixes).
- Expertise tag 12pt **bold italic** centered: `خبير مختص في مجال {التخصص}` — female
  variant `خبيرة مختصة في مجال {…}`.
- Bio 12pt centered (~80–100 words max, must fit the 1.9" box): (1) current role +
  org; (2) `لديه أكثر من {N} عامًا من الخبرة في…`; (3) domain chain with و; (4)
  marquee KSA credential name-drops (أمانة منطقة الرياض، وزارة البلديات والإسكان،
  الديوان الملكي، نيوم…). Numbers-first phrasing throughout.
- Page order: core strategy → sector-specific → enabling functions → externals
  (mirrors the org-chart column order).

**Bench mechanism**: ~8–10 experts are standing library cards reused verbatim across
proposals; add project-specific experts 1:1 against this RFP's scope elements.
**Lint hard for clone defects** (observed in the references): name/bio mismatches,
duplicated name lines, wrong gender agreement (خبير/خبيرة، مختص/مختصة), kashida-
justified pasted text. Tags must be character-identical everywhere they appear (org
chart, expert pages, exec-summary strip, CV annex).

## 5. Team CV slides — ملحق: ملفات تعريف الفريق (archetype Q)

One slide per team member, ordered by grade (شريك → المدير التنفيذي → مدير المشروع →
استشاري أول → استشاري). Title: `{الاسم} | {الدور في المشروع}` on the standard header
band.

Frame (identical for every CV):
- Right sidebar (`F2F2F2`, ~2.4" wide, full body height): circular photo ~1.9" top;
  bold name; grade line; `مجالات الخبرة:` header + 4–8 short bullets;
  `قطاعات الخبرة:` header + 2–4 bullets (القطاع العام، القطاع الخاص…).
- Main area:
  - `ملخص السيرة الذاتية` — section header with **black underline bar** → 1–2
    paragraphs (career summary), then an education line (`تخرج {الاسم} من جامعة {X}
    بدرجة {الماجستير في Y}، وبكالوريوس في {Z}`).
  - `الخبرات السابقة` — section header with **green underline bar** → 6–10 bullets,
    each `**{الجهة}:** {ما قاده}` — bold client lead-in + colon + achievement.
    Confidential clients: `**{وصف القطاع} - سرية:**`.

**Tailoring rules (the craft):**
- Role titles are per-proposal — retitle to this RFP's vocabulary (the same person is
  `المدير التنفيذي للمشروع` in one deck and `مدير المشروع` in another).
- Re-order experience bullets so the most RFP-relevant engagements come first;
  re-angle emphasis toward this RFP's domain; never invent engagements.
- Every RFP-required qualification (degree, years, certification) must be visibly
  satisfied on the slide of the person filling that role.

## 6. Expert profile slides — ملحق: ملفات تعريف الخبراء (archetype R)

Same frame as §5. Title: `{الاسم} | خبير مختص في مجال {التخصص}`. Bio leads with
seniority + years; bullets fewer (5–8), heavier on numbers (`أكثر من 150 مشروعًا`،
`بقيمة 118 مليار دولار`), global/regional span. The appendix divider carries the
`(غير شامل)` italic tag (it is a sample of the bench).

## 7. Consistency contract

- Everyone on the org chart has a profile slide; every name on the exec-summary strip
  and experts grids appears here too.
- Names, photos, tags identical across all appearances; phase names on the Gantt
  byte-identical to the methodology chapter; durations identical everywhere.
- Team size shown = team size priced.
