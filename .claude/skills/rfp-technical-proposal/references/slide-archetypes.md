# Slide Archetype Library — every reusable slide pattern with its recipe

Each archetype below was observed repeatedly in the reference decks. When the proposal
plan calls for a slide, pick the archetype, follow its recipe, and keep sibling
instances pixel-identical in frame geometry. Cite: (D1-N) = deck1 slide N.

Framing archetypes (cover, letter, TOC, dividers) are specified in
`deck-blueprint.md`. Exec-summary heroes in `executive-summary.md`. This file covers
the body archetypes.

---

## A. Standard content slide (the workhorse)

**Base**: layout `3_Title & subtitle` (the general content chassis — approach
overview/BoQ, team, CVs, PoV light slides). The frameworks appendix sits on
`2_MD Proposal Content Slide`; methodology pages on `1_MD Proposal Content Slide`;
credential details on the minimal `4_Title & subtitle` (see `build-and-qa.md` §1b).
All share: full-width header band 13.33 × 1.55" (city photo + gradient `056946` 85%
@18% → `88AEF1` 60% @100%, ang=8100000); title 28pt white (stem regular, payload
bold-green) right-aligned RTL at (0.50", 0.38"), up to 2 lines; white body zone
1.7"–6.9"; footer strip at 7.13".

Body content varies by sub-archetype below. Density target: a filled grid, 0.3–0.4"
gutters, nothing floating in empty space.

## B. Dark hero slide (photo full-bleed)

Used for: exec summary pair, PoV stat/context slides, credentials summary matrix.
Full-bleed dark photo, no band, no footer (exec heroes) or with footer (PoV slides).
White text + bright-green highlights only. See `executive-summary.md` for canvas specs.

## C. Split panel slide (photo half + content half)

(D1-8, D1-13, D1-101) Two vertical panels with a hard cut (typically 40–50% photo).
Variants:
- **Narrative split** (D1-8): photo panel carries white prose with green bold highlighted
  phrases; white panel carries a diagram (e.g. hub-and-spoke). A chevron/arrow shape may
  point from the photo panel into the content panel.
- **Twin-stat split** (D1-13): white panel = title + choropleth/map/chart; photo panel =
  continuation title (`... 81% منهم يتركزون في مدينة الرياض` in green) + stacked big
  stats separated by dashed lines, with small chevron arrows bridging the panels.
- **Credential split** (D1-101): photo panel (project-related photography) + content
  panel with white card. See §L.

## D. Continuation pair (two consecutive slides, one sentence)

(D1-10/11, D1-16/17) Slide A title ends `...`; slide B title begins `...`. (D1-13
resolves its `...` INSIDE one slide — white-panel title trails off, photo-panel green
kicker answers it: the twin-title variant.)
Content of A sets up (value chain, stat, benefit map); B pays off (stakeholders,
concentration, backbone role). Use 1–3 pairs per PoV, never elsewhere.

## E. Driver card rail (the 3-card enabler/challenge machine)

(D1-19→25, D2-23→29) The PoV's argument core — full spec in `point-of-view.md` §2.1–2.2:
1. **Drivers slide**: title `ولمواكبة…، تحتاج {الجهة} إلى 3 ممكنات رئيسية` or
   `3 تحديات تشغيلية تواجه {القطاع}` + 3 cards, all lit.
2. **Statement slide ×3**: the SAME slide cloned; title prepends
   `الممكن الأول: {عنوان البطاقة حرفياً}`; non-focus cards get ~75%-alpha black
   overlays (still faintly legible). No new content is authored.
3. **Evidence slide ×3**: `...` continuation pair — ~58% white data half (stats/logos/
   org screenshots) + ~42% dark implication half (3–4 icon rows, one green capability
   phrase each). See `point-of-view.md` §2.2.

Card anatomy (exact: 4.03" × 5.30", y=1.27", x = 0.545"/4.70"/8.85" — driver 1
rightmost, 0.126" gutters):
- Topical photo fill + dark gradient scrim (alpha ~74–98%).
- Teal `0D8390` filled icon circle 1.28" inside a **broken white ring** 1.56" (arc
  with a gap — signature), centered at card top.
- Card title: bold white 20–24pt noun phrase (4–7 words), then a **green `86BC25`
  underline rule ~3.03" wide**.
- Body: one white 16pt sentence (20–30 words): current dynamic + `ما يفرض/يتطلب…`.
- Source line + standard footer on the slide.

## F. Pivot slide (drivers → work areas)

(D1-26, D2-30) Title `ولتحقيق الممكنات، ينبغي أن تعمل {الجهة} على {N} مجالات رئيسية`.
Dark bg; top = 2–3 deep-teal `004F59` banner boxes carrying one run-on sentence split
with `...` + sequencing words (أولاً/بعد ذلك/و); N columns right→left: ghost numeral
44pt `D0D0CE` → bold white area name 18pt → teal icon circle (broken ring) → white
card 16pt body → green base strip. Last area always institutional/continuity. Area
strings become tab labels + approach tracks — immutable. Full spec:
`point-of-view.md` §2.3–2.4 (including the tab-bar navigation device that follows).

## F2. Proof-ladder slides

(D1-36→42, D2-43→46) Seven sub-archetypes, most-specific → broadest: frosted-glass
differentiator cards; real deck-cover gallery with `++ مستندات اخرى` bar; circular
project medallions with `قيد التنفيذ` pills; ✓-badged logo wall with one-liners +
`تجدون المزيد…` ribbon; enumerated-artifact flex (24-KPI pattern); alliance ring;
`+200 خبراء` expert wall. Full specs: `point-of-view.md` §2.6.

## G. Big-stat dark slide

(D1-9) Full-bleed evocative photo (satellite/aerial). Long assertion title with green
payload. Stat callouts: number huge (36–88pt) bold green `86BC25`, unit smaller, label
white; grouped left; chart right (white lines, oval scenario badges, green callout box
with pointer to the key data point). Source line bottom.

## H. Hub-and-spoke / ecosystem diagram slide

(D1-8 right panel; D2-18 strategy-linkage hub) White panel or full white slide. Center circle with
the theme; 8–12 satellite icon-circles connected by a thin teal geometric web; each
satellite = small icon circle + 2–4 word label. Label above the diagram in bold. Used
for: city benefits, stakeholder ecosystems, client-as-backbone.

## I. Number-title list slide (the "N things" slide)

(D1-43; pivot slides) Title asserts N items; body = N columns/blocks, each with a **giant
ghost numeral** (`D0D0CE`, 60–90pt) above/behind a bold black lead phrase + regular
continuation text. The one-team closing slide (D1-43) is this archetype over a
panoramic city photo strip: 4 numbered value statements, numerals gray, leads bold
black, no other decoration.

## J. Approach overview slide (tracks on a page)

(D1-45, D2-49) Title: `سيتم تنفيذ المشروع عبر {N} مسارات/مراحل رئيسية وخلال مدة زمنية
تقدر بـ{X} أشهر`. Body: N+1 vertical column bands (RTL right→left: المسار صفر الاطلاق
first at right), each with:
- Column header chip: gradient green band (solid green for track 0), bold white track
  name 12–14pt.
- Under it: **teal `0D8390` bold** sub-track numbers (`1.1 {الاسم}`, 12pt) + dense
  12pt bulleted activity previews.
Bottom or side: duration note. This slide is the compressed twin of the whole
methodology chapter — names must match everywhere.

## K. Detailed methodology page (the most important archetype)

(D1-48→62, D2-51→65) Title breadcrumb: `منهجية المشروع التفصيلية | المسار {ordinal} –
{الاسم} ({i}/{n})`.

**Navigator ribbon** directly under the header band: the same N+1 track chips as the
overview slide, full width; the ACTIVE chip fill = the header-band gradient
(`056946`@85%→`88AEF1`@60%, ang=8100000); INACTIVE chips = solid `F2F2F2` with the
text left white (ghosted on purpose). The ribbon repeats on every methodology page
and moves the highlight — it is the section's navigation system. Full spec:
`approach.md` §1.

**Body grid**:
- Right main area (~82% width, white, thin border): header `الأنشطة:` (16pt **bold
  italic** black); then per sub-track: **bold teal `0D8390`** header
  `المسار الفرعي {X.Y} | {الاسم}` followed by 2 levels of bullets — • activity
  (verb-first, 14pt) → deep-indented `o` sub-steps. 12–20 body lines total.
- Left sidebar (~17% width, `F2F2F2` fill): header `المخرجات والنتائج:` 16pt bold
  italic, then noun-phrase deliverable bullets = that track's BoQ strings verbatim,
  repeated on every page of the run (`لا ينطبق` on launch/KT pages).
- Launch-phase pages (المسار/المرحلة صفر) swap the grid for special layouts:
  آلية ادارة المشروع (governance diagram), إدارة المخاطر والتحديات (risk matrix + plan
  table), خطة إدارة الجودة والمخرجات, خطة إدارة التصعيد (escalation pyramid),
  العمل التشاركي مع {الجهة} (collaboration model), منهجية نقل المعرفة (knowledge-transfer
  steps). These six recur near-verbatim across proposals — clone from the library.

## L. Credential slide (خبراتنا)

(D1-101…172) Title breadcrumb: `خبراتنا | محلياً` or `خبراتنا | عالمياً` (20pt bold
black, white slide, no header band) + client logo + flag roundel left of the title +
**gray `53565A` headline** under it: `{دعمت/عملت/قادت} ديلويت {الإنجاز} لـ{الجهة}`.
Left panel: full-height theme-matched photo (56%, no scrim). Right: white card
overlapping the photo, **two `26890D` corner bars** (top-left + bottom-right), with
exactly three blocks, headers 16pt green bold underlined + colon:
- `السياق:` — 2–5 line client situation & need
- `المنهجية:` — 3–6 parallel masdar bullets (no bold lead-ins here)
- `النتيجة:` — outcome paragraph; ongoing = `المشروع قيد التنفيذ حاليًا ويستهدف…`
Rules: real projects only; confidential clients `سري` box / `احدى المشاريع الكبرى`;
no footers anywhere in the credentials section. Full spec: `credentials.md`.

## M. Credentials summary matrix (dark table slide)

(D1-94→100) Dark full-bleed photo + 70% black scrim. Title: `لدينا سجل حافل في تسليم
المشاريع ذات المتطلبات المماثلة لـ{الخدمة} ({i}/{n})`. RTL table: `#` / `البلد` (flag
icons) / `الجهة` / `المشروع` + **5–6 RFP scope columns with Wingdings ✓ checks** under
a green `نطاق العمل` brace; 10 rows per slide; white text, 1pt `618894` header rule,
0.75pt white dashed row separators. The list enumerates ALL credentials that follow
as detail slides — counts must agree. Full spec: `credentials.md`.

## N. Gantt / timeline slide

(D1-64, D2-67) Title: overview-title + `بحسب كراسة الشروط والمواصفات`.
Anatomy (built from shapes, not a native table):
- Month header row: numbered columns 1→N running **right→left**.
- Phase header rows: full-width **teal `007680`** bands, bold white phase names
  (launch phase band gray).
- Activity rows: black horizontal bars spanning their months.
- Deliverable markers: diamond shapes on the bars — dark green diamonds = `التقارير
  الدورية`, light green = `الدراسات` (legend `الشرح:` top-left corner).
- Legend + standard footers.
Every BoQ deliverable must appear as a marker; recurring deliverables repeat monthly.

## O. Team structure slide (org chart)

(D1-66) Title: `سيتولّى إدارة التنفيذ فريق متفرّغ ومتخصّص سيتابع المشروع بشكل يومي مع
الاستفادة من قيادتنا…`. Two panels:
- Right: `قيادة المشروع` — partner + exec director boxes (dark green `046A38` fill,
  white bold name + role), QA partner attached by **dashed** connector; below,
  `إدارة المشروع وفريق التنفيذ` group box: project manager (bright green fill), then
  consultant boxes (gray fill) in two columns. Each box has a circular photo attached
  to its edge.
- Left: `الخبراء` — teal boxes with circular photos: bold name + `خبير مختص في مجال {X}`;
  a gray `اخرين ++` box closes each group; partner-firm logos (white cards) with
  `اخرين ++` when alliances exist.

## P. Experts grid (الخبراء (i/n))

(D1-68→70, D2-71→74) White slide, title 20pt. **4 experts per page in one row**
(expert #1 rightmost): teal-gradient (`007680`→`004F59`) number ribbon 0.71"×0.83"
with the GLOBAL number at 48pt bold white (numbering continues across pages);
circular grayscale photo 1.09" overlapping the ribbon; bold name 14pt; expertise tag
`خبير مختص في مجال {X}` 12pt bold italic; paragraph mini-bio 12pt (~80–100 words).
Grouped thematically across the series. Full spec: `team-and-timeline.md` §4.

## Q. CV slide (team profile)

(D1-73→80) Title: `{الاسم} | {الدور في المشروع}` on standard header band (28pt).
- Right sidebar (`F2F2F2`, 2.18" wide): circular photo 1.70", bold name, role line
  (must match the PROJECT role in the title), `مجالات الخبرة:` 3–6 bullets,
  `قطاعات الخبرة:` 2–4 bullets.
- Main area: `ملخص السيرة الذاتية` header with **black** underline bar → 2 paragraphs
  (career summary; education line `تخرج {الاسم} من جامعة {X} بدرجة {Y}…`).
  Then `الخبرات السابقة` header with **green `86BC25`** underline bar → 6–10 bullets,
  each `**{الجهة/المشروع}:** {ما قاده/أنجزه}` — client-name bold lead-ins,
  confidential as `{وصف} - سرية:`. Most-relevant-to-this-RFP bullets first.

## R. Expert profile slide

(D1-82→92) Same frame as Q; title `{الاسم} | خبير مختص في مجال {التخصص}`. Sidebar grade
usually شريك or مدير تنفيذي. Bio emphasizes years (`لديه أكثر من 18 عامًا من الخبرة…`)
and global/regional span; bullets carry numbers (150 مشروع، 118 مليار دولار…).

## S. Framework slide (methodology appendix)

(D1-174→233) White slide, standard band. Title = assertion about what the methodology
achieves (never a bare name): `تعمل منهجية مونيتور ديلويت لتطوير وتحديث الاستراتيجيات
بشكل شامل ومتكامل باستعمال اطار StrategyByDesign©`. EN framework names stay Latin.
`للتوضيح` teal tag top-left when the visual is illustrative.
Sub-archetypes and their visual grammar:
- **Stage ribbon** (StrategyByDesign): 3 rounded stage pills with outline icon badges,
  color-coded stages darkening with progress (blue `007CB0` → teal `0D8390` → navy
  `0F2837`); below, 6 sub-stage rectangles joined by double-headed arrows; under each,
  question bullets (`كيف يمكننا…؟`).
- **Cycle/process wheel** (policy cycle, 7 phases): numbered segments, green family.
- **Cascade/pyramid** (Strategy Cascade, escalation): stacked layers narrowing upward.
- **Matrix** (SWOT 2×2, prioritization with weights, RACI): labeled axes, tint fills
  `F2F8E5`/`E5F0F9`, weight percentages shown.
- **Component wheel** (TOM 10 components): center + ring segments.
- **Maturity ladder**: left-to-right (RTL: right-to-left) ascending steps.
- **Platform/screenshot slides**: real product screenshots (dashboards, Deloitte Score)
  in device frames or straight, with feature blocks around them.

## T. About-Deloitte stat slide

(D1-235→245) White slide. Title assertion (`ديلويت هي أكبر شركة خدمات مهنية في العالم`);
green bold sub-line (`السنة المالية 2024`); row of 5 stat cards: green outline icon in
outline circle on top, light-gray rounded card with **green bold big number**
(`67.2 مليار` / `460,000+`) + black label. Green dot-scatter decorative field allowed
here only. Other slides in the pack: world/region maps, service-dimension diagrams,
industry matrices — all from the fixed library, reuse verbatim.

## U. Legal/certificate slide

(D1-260→268) Title: `المستندات القانونية | {اسم الشهادة}` (20pt). The certificate
scan centered at native aspect ratio, **no frame/border/shadow/caption**; two-page
certificates side-by-side on one slide. Final slide of the deck = the standard
Deloitte legal disclaimer text page (fixed boilerplate). Full spec: `appendices.md` §4.

## V. Text-pack slide (T&C)

(D1-247→258) Title `الشروط والأحكام` + subtitle. Numbered legal clauses (1.1, 1.1.1)
in 8–9pt across the full width, right-aligned. Reuse the pack verbatim; never rewrite
legal text.
