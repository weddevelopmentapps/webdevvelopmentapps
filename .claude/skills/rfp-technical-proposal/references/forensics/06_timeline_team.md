# 06 — TIMELINE & TEAM SECTIONS (Gantt, Org Chart, Leadership, Experts)

Scope analyzed:
- DECK1 "Strategic Studies": s-064 (Gantt), s-066 (team structure org chart), s-067 (leadership cards), s-068/069/070 (experts 1/3, 2/3, 3/3)
- DECK2 "Central Riyadh Sectors Performance": s-067 (Gantt), s-069 (team structure), s-070 (leadership), s-071–074 (experts 1/4 … 4/4)
- XML cross-checked: unpacked1/ppt/slides/slide64.xml, slide66.xml, slide67.xml, slide68.xml; unpacked2/ppt/slides/slide67.xml, slide69.xml; theme: unpacked1/ppt/theme/theme1.xml

Theme color map (verified in theme1.xml, identical in both decks):
- accent1=86BC25 (bright green), accent2=43B02A (mid green), accent3=26890D, accent4=046A38 (dark green), accent5=0D8390 (teal), accent6=007CB0 (blue), dk2/tx2=53565A, lt2/bg2=D0D0CE, dk1=000000, lt1=FFFFFF.
- ADDITIONAL non-theme colors used ONLY in this section (hardcoded srgbClr): **007680 → 004F59 teal gradient** (expert boxes, number ribbons, Gantt phase bands use solid 007680), **1A7749** (dark-green Gantt diamonds), **435E13** (olive knowledge-transfer circles), **75787B** (Deloitte cool gray, phase-0 band).

All four archetypes sit on the standard content layout: full-width header band (Riyadh skyline photo left fading into green gradient right), white RTL title in Sakkal Majalla ~20pt (sz="2000" verified on Gantt title), white body area, 9pt three-part footer.

---

## ARCHETYPE A — GANTT / PROJECT TIMELINE (خطة العمل الزمنية)
DECK1 s-064, DECK2 s-067

### 1. Narrative role
Single slide that proves the bidder read the RFP's mandated duration and converted the methodology phases into a credible month-by-month plan. It closes the "approach" story and pre-answers the evaluator checklist item "خطة العمل الزمنية". It must visibly tie to the RFP: the title explicitly cites **كراسة الشروط والمواصفات** (the RFP/terms booklet) as the source of the duration.

### 2. Layout anatomy (EMU exact, from XML)
- Chart canvas: x=1752600 (1.44"), width=10252075 (8.44"), spanning y≈1493838 → 6450000. To the LEFT of the canvas (outside it) sits the legend column (≈0–1.44" wide). Task/phase LABELS sit at the RIGHT edge of the canvas (RTL: labels right, bars extend left).
- **Time flows RIGHT → LEFT** (month 1 is the rightmost column). Header row: y=1493838, h=307975; one bordered white cell per month, each ≈744538–769938 EMU (0.61–0.63") wide in DECK1 (9 months); 18 narrower cells (~569560 EMU, 0.47") in DECK2. Rightmost header cell label: **«الشهر»** (black bold).
- Phase band rows: full-canvas-width rects, h=293688–307975 (0.24–0.25"). Phase 0 band = solid **75787B** gray. Phases 1..N = solid **007680** teal. White bold phase title right-aligned inside the band, numbered: «0. الانطلاق», «1. الدراسات الاستراتيجية والاقتصادية» …
- Task rows under each band: pitch ≈265000–267000 EMU (0.22"). Task label black, right-aligned at right margin; label text boxes h=182563.
- Bars: plain black (tx1) rectangles, h=98425 EMU (0.08") — thin, flat, no rounding, no outline. Continuous work-streams run the full canvas width (6748463–6962775 wide). Short launch tasks are mini-squares 149225×98425 (≈2-week blips in month 1, at the right edge).
- Vertical month gridlines: cxnSp straight lines; DECK1 w=9525 (0.75pt), DECK2 w=3175 (0.25pt), dark gray, drawn over the rows.
- Milestone markers: diamonds laid ON the bars/rows. Sizes measured: legend diamonds 252246 (0.21"); on-chart monthly diamonds 156625–189517 (0.13–0.16"); dense "weekly cadence" diamonds 97252 (0.08", light green) and 172288 (dark). DECK1 has 141 diamonds total (73× 1A7749, 50× 86BC25); DECK2 only 26 (18 dark / 6 light + 2 legend) — DECK2 marks monthly/quarterly, DECK1 also shows weekly cadence rows.
- DECK2 additions: (a) **deliverable marker** = small dark ellipse 189516 EMU with white **«#»** glyph (16pt) attached to the LEFT tip of a bar (= activity completion, since time runs leftward), plus 1 legend ellipse 252246; (b) **knowledge-transfer marker** = olive **435E13** ellipse 252246 containing a white "Teacher" icon (PowerPoint stock icon, `Teacher with solid fill`), 6 on row 6.2 + 1 legend; (c) bold black **bar callout labels** 11pt naming the key deliverable, e.g. «تحليل الوضع الراهن», «النموذج التشغيلي وآليات المتابعة والتقييم», «تصميم وتطوير لوحة المعلومات البيانات لمتابعة تنفيذ المبادرات داخل قطاع وسط الرياض ومتابعة الأداء», «الحلول والاحتياجات الرقمية الخاصة بتقنية المعلومات للقطاع».
- Legend block top-left, heading **«الشرح:»** (black bold), one marker + label per line, 16pt.

### 3. Typography (Sakkal Majalla throughout; Wingdings 2 present only as bullet-font remnant)
| Element | Size | Weight | Color |
|---|---|---|---|
| Title (placeholder) | 20pt (sz=2000) | regular | white on header band |
| Month numbers + «الشهر» | 16pt | bold | black |
| Phase band titles | 13pt | bold | white |
| Task labels | 12pt | regular | black |
| Bar callout labels (DECK2) | 11pt | bold | black |
| Legend labels / «الشرح:» | 16pt | regular / bold | black |
| Footer items | 9pt | regular | gray 53565A/575757 |

### 4. Title formula
Fixed sentence, only the two numbers and the phase-noun change:
- DECK1: «سيتم تنفيذ المشروع عبر **4 مسارات رئيسية** وخلال مدة زمنية تقدر بـ**9 أشهر** بحسب كراسة الشروط والمواصفات» (note: source file has typo «أشهربحسب» — missing space; do NOT reproduce)
- DECK2: «سيتم تنفيذ المشروع عبر **6 مراحل مختلفة** وخلال مدة زمنية تقدر بـ**18 شهر** بحسب كراسة الشروط والمواصفات»
- Template: `سيتم تنفيذ المشروع عبر {N} {مسارات رئيسية | مراحل مختلفة} وخلال مدة زمنية تقدر بـ{M} {أشهر|شهرًا} بحسب كراسة الشروط والمواصفات`
- «مسارات» (parallel tracks) when phases run concurrently (DECK1 study streams); «مراحل» (stages) when broadly sequential (DECK2). No green highlight run inside this title in either deck; the numbers-first assertion + RFP citation IS the formula.

### 5. Body writing patterns
- Phase names are numbered noun phrases, no verbs: «0. الانطلاق», «1. تحليل الوضع الراهن», «2. تصميم النموذج التشغيلي وآليات المتابعة والتقييم», «3. تطوير لوحات البيانات لمتابعة الأداء», «4. متابعة أداء الأعمال والمبادرات التشغيلية في القطاع», «5. تحديد وتصميم الحلول والاحتياجات الرقمية الخاصة بتقنية المعلومات», «6. نقل المعرفة».
- Phase 0 is ALWAYS «الانطلاق» with exactly two mini-tasks in month 1: «إطلاق المشروع» and «تحديد الطموح» — identical wording in both decks (pure boilerplate).
- Task rows: DECK2 uses decimal numbering (0.1, 1.1, 2.1, 2.2 …); DECK1 leaves sub-rows unnumbered. Task labels are gerund/noun phrases: «تطوير نموذج الحوكمة لقطاع وسط الرياض», «متابعة تنفيذ أعمال القطاع وتحديد فرص التحسين».
- Last phase in DECK2 is knowledge transfer with two full-length bars: «6.1 إشراك أصحاب المصلحة», «6.2 نقل المعرفة» — signals continuous engagement.
- Legend strings: DECK1 «التقارير الدورية» (dark diamond), «الدراسات» (light diamond). DECK2 richer: «مخرج رئيسي» (# circle), «التقارير الدورية لمتابعة تنفيذ الأعمال التشغيلية في القطاع» (dark 1A7749 diamond), «التقارير الربعية لمتابعة تنفيذ المبادرات في القطاع وضبط جودة الأداء» (light 86BC25 diamond), «جلسات نقل معرفة (عند الحاجة)» (olive teacher circle).

### 6. Visual grammar
- Semantics: gray band = launch; teal band = phase; black thin bar = activity duration; dark-green diamond = recurring report; bright-green diamond = study/quarterly deliverable; # circle = key deliverable at completion; olive teacher circle = knowledge-transfer session; mini black square = point task.
- Everything is hand-drawn shapes — NO PowerPoint table, NO chart object (verified: 0 `<a:tbl>`; the one graphicFrame is a hidden 1684 EMU think-cell remnant). Rebuild with rects/lines/diamonds on a computed grid.

### 7. Micro-conventions
- Footer right: «© 2026 ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة» (DECK1) / «© 2025 … محفوظة.» (DECK2, with trailing period). Footer left-of-center: DECK1 «العرض الفني: خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن»; DECK2 «العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع مدينة الرياض» (client **|** project pattern). Far left: bare page number (64 / 67), 9pt.
- No «المصدر:» line on plan/team slides (sources only on research slides).

### 8. DECK1 vs DECK2 deltas
IDENTICAL (template): title sentence skeleton + كراسة الشروط citation; chart canvas x/width; header-cell heights; phase-0 gray band + إطلاق المشروع/تحديد الطموح; teal 007680 bands; black 98425-high bars; 1A7749/86BC25 diamond duo; «الشرح:» legend block position; footer scheme.
CHANGED (per-RFP): number of months (9→18) and columns; phase count and names (4 thematic tracks → 6 sequential stages); sub-task numbering style; marker vocabulary enriched in DECK2 (#-deliverable circles, olive teacher circles, bar callouts); diamond density (weekly cadence in DECK1 dropped in DECK2); gridline weight (0.75pt→0.25pt).

### 9. RECONSTRUCTION RECIPE
1. From the RFP extract: total duration M (from كراسة الشروط والمواصفات — MUST match exactly, evaluators check), phase list (reuse the phase names from your own methodology section verbatim), required recurring reports (شهرية/ربع سنوية) and named deliverables.
2. Compose title with the formula above; pick مسارات vs مراحل by concurrency.
3. Build grid: canvas x=1.44", w=8.44"; month cell width = 8.44/M; month numbers RIGHT→LEFT (1 rightmost); header 16pt bold; «الشهر» label at far right.
4. Rows top→bottom: gray 75787B band «0. الانطلاق» + two month-1 mini-squares (إطلاق المشروع، تحديد الطموح); then per phase: 007680 teal band (13pt bold white, numbered) + 1–4 task rows (12pt black labels right-aligned, 0.22" pitch).
5. Draw black bars snapped to month boundaries from the methodology's phase durations; continuous streams (PMO, knowledge transfer, stakeholder engagement) run full width.
6. Overlay markers from RFP reporting duties: dark 1A7749 diamonds monthly on report rows; bright 86BC25 diamonds at each study/quarterly deliverable; a #-circle at the LEFT tip of each bar that produces a contract deliverable, with an 11pt bold callout naming it; olive teacher circles for knowledge-transfer sessions if the RFP demands نقل المعرفة.
7. Legend top-left listing ONLY the marker types actually used; wording pattern «التقارير الدورية لمتابعة …» / «مخرج رئيسي» / «جلسات نقل معرفة (عند الحاجة)».
8. Quality bar: every diamond sits exactly on a month gridline; bars all identical height; labels never overlap bars (the DECK1 render shows two task labels colliding with the canvas — beat the source); no orphan legend entries; phase names byte-identical to the methodology slides.

---

## ARCHETYPE B — TEAM STRUCTURE ORG CHART («سيتولّى إدارة التنفيذ فريق متفرّغ…»)
DECK1 s-066, DECK2 s-069

### 1. Narrative role
One slide that answers three procurement anxieties at once: (a) a dedicated full-time delivery team exists, (b) senior partners are personally accountable with QA oversight, (c) a deep bench of named regional/global experts backs them. It is the section opener for the team chapter.

### 2. Layout anatomy
Two-column composition inside white area, RTL priority:
- RIGHT column (≈54% width): TWO stacked white panels (bg1 fill, 0.25pt/3175 EMU border):
  - «قيادة المشروع» panel 5818360×1184457 EMU (4.79"×0.97"): lead partner box top-right, QA partner box top-left, connected by a **dashed** gray connector (prstDash="dash", tx2=53565A) = advisory/QA line; DECK1 adds a second leadership row (المدير التنفيذي). Panel label bold 14pt black, top-right.
  - «إدارة المشروع وفريق التنفيذ» panel 5818360×3363441 (4.79"×2.77"): PM box centered top, **solid** vertical connector (tx2) down from leadership; below, consultants in a 2-column × 2–3-row grid.
- LEFT column (≈44%): «الخبراء» panel(s). DECK1: three separate panels — main expert panel 5286526×3182159 (10 experts, 2-col) + two subcontractor strips each holding partner logo (GIBSON DUNN wordmark; PARSONS logo), one named expert box, and a gray «++ اخرين» box. DECK2: ONE tall panel 5286526×4652466 with 15 expert boxes (2-col, ~8 rows) + one «++ اخرين».
- Box specs (verified XML):
  - Leadership boxes: rect 1976377×383830 EMU (1.63"×0.32"), solidFill **accent4 = 046A38**; QA box narrower 1330484 wide.
  - PM box: same size, solidFill **accent2 = 43B02A** (the only bright-green box → visual focal point).
  - Consultant boxes: 1976377×394044, fill **bg2 (D0D0CE) @ lumMod 75% ≈ 9C9C9B** mid-gray.
  - Expert boxes: 2174015×383830, **gradient 007680 → 004F59**, lin ang=8100000 (135°), scaled — the signature teal of the whole team/timeline section.
  - «++ اخرين» boxes: 2350609–2452798×383830, fill **bg1 @ lumMod 75% ≈ BFBFBF**, white bold 16pt «++ اخرين».
  - No box outlines (ln noFill); flipH="1" on xfrm (RTL mirroring).
- Photos: circular headshots (ellipse crop) 445506 EMU (0.37") diameter, **grayscale forced in XML (`<a:grayscl/>`)**, white (bg1) ring, overlapping the LEFT end of each box (RTL: text right, photo left). 24–25 pics per slide.
- NO allocation percentages, NO CV page refs — pure name+role+face density.

### 3. Typography
| Element | Size | Weight | Color |
|---|---|---|---|
| Title | 20pt | regular | white |
| Panel labels (قيادة المشروع / إدارة المشروع وفريق التنفيذ / الخبراء) | 14pt | bold | black |
| Box: person name | 12pt | bold | white |
| Box: role / expertise tag | 10pt | regular (tag italic) | white |
| «++ اخرين» | 16pt | bold | white |
All Sakkal Majalla, centered inside boxes (text block shifted right of the photo).

### 4. Title formula
LITERALLY IDENTICAL in both decks (100% boilerplate — reuse verbatim):
«سيتولّى إدارة التنفيذ فريق متفرّغ ومتخصّص سيتابع المشروع بشكل يومي مع الاستفادة من قيادتنا ذات الخبرة وخبراء إقليميين وعالميين»
Assertion structure: commitment verb future tense (سيتولّى) + dedication claim (متفرّغ ومتخصّص، بشكل يومي) + leadership + regional/global experts. No pagination, no highlight run.

### 5. Body writing patterns
- Role labels are terse and standardized. Leadership: «الشريك الرئيسي للمشروع», «شريك ضمان الجودة», («المدير التنفيذي» DECK1 only). Delivery: «مدير المشروع», then DECK1: «استشاري أول», «استشاري»; DECK2: «مستشار أول», «مستشار», «مستشار تقني», «محلل أعمال», «مصمم انفوغرافيك».
- Expert tag inside org boxes = same one-liner as the expert pages: «خبير مختص في مجال {domain}» — kept identical across the org chart, the experts grid, and (in DECK2) the bench so cross-references never diverge.

### 6. Visual grammar
- Color = hierarchy layer: dark green 046A38 (leadership) → bright green 43B02A (PM, singular accent) → mid gray (consultants) → teal gradient (experts) → light gray (overflow «++ اخرين»). One glance encodes the whole pyramid.
- Connectors: dashed = QA/assurance relationship; solid = line management. DECK2 uses a bentConnector2 (elbow) dashed line from QA partner down to the PM.
- Subcontractor logos (DECK1 only) rendered as-is on white, adjacent to their named expert — this is how third-party firms are credited without their own org layer.

### 7. Micro-conventions
Footer identical to archetype A. Page number 66 / 69. Grayscale photos are mandatory (colored headshots are converted via the XML grayscale effect, not pre-processed).

### 8. DECK1 vs DECK2 deltas
IDENTICAL: title string; panel titles; geometry of panels/boxes to the EMU (1976377×383830 etc.); color coding; QA-dashed convention; مشعل السديري + مهند تيم occupy the same two leadership boxes with same roles (the real Deloitte KSA cities leadership bench).
CHANGED: PM identity (أحمد سلامة → باسم بحلس); DECK1 adds a client-facing «المدير التنفيذي» (سلطان بن فيصل آل سعود) in leadership; consultant bench swapped and DECK2 adds specialist delivery roles (مستشار تقني، محلل أعمال، مصمم انفوغرافيك — mirroring the RFP's operational/dashboard scope); expert list re-picked per scope (DECK1 11 experts + 2 subcontractors Gibson Dunn/Parsons for legal/infrastructure scope; DECK2 15 experts incl. تحول رقمي، خدمات بلدية، قياس الأثر — no subcontractors).

### 9. RECONSTRUCTION RECIPE
1. Parse the RFP's team requirements (كراسة الشروط usually lists required roles, quals, and full-time presence). Map each required role to a box; the RFP's mandated roles MUST all appear.
2. Fixed skeleton: title string verbatim; three panels with the exact labels; leadership = 1 lead partner + 1 QA partner (add exec director only if a client-side/figurehead exec is part of the offer); one bright-green PM box; 4–6 gray consultant boxes (2-col grid); teal expert boxes 2-col.
3. Pick people from the reference bench (CV library): reuse the standing leadership pair; choose PM with direct client-entity experience (both decks' PM bios name the client entity); pick experts so every scope domain in the RFP has ≥1 matching «خبير مختص في مجال …» tag.
4. Close each column with «++ اخرين» to signal bench depth. Add subcontractor logo strips only when the RFP scope needs capabilities outside the firm (legal, engineering).
5. Quality bar: every box same size; photos all grayscale, same diameter, all overlapping left edge identically; dashed vs solid connectors semantically correct; role labels consistent with the leadership and experts pages (use ONE of استشاري/مستشار consistently — the decks drifted between them across projects; never within one deck).

---

## ARCHETYPE C — LEADERSHIP CARDS («قيادة المشروع وإدارة المشروع»)
DECK1 s-067, DECK2 s-070

### 1. Narrative role
Deep-dive on the accountable seniors immediately after the org chart: puts faces, titles, and 60-word bios on the leadership + PM so evaluators can score "qualifications of key personnel". Only leadership + PM get bios here; everyone else waits for the experts pages (or CV annex).

### 2. Layout anatomy
- Two bordered white cards side by side, borders 1.5pt (w=19050) in bg2 @ lumMod 90% (≈BBBBB9), noFill:
  - RIGHT card «قيادة المشروع»: 8032249×4568083 EMU (6.61"×3.76"), holds 3 profile columns (DECK1: مشعل السديري، مهند تيم، سلطان بن فيصل آل سعود; DECK2: مشعل السديري، مهند تيم — 2 columns, wider).
  - LEFT card «إدارة المشروع»: 2950698×4568083 (2.43"×3.76"), 1 profile (the PM).
- Tab labels: white (bg1) text boxes straddling the card's top border, centered, bold, **accent5 teal 0D8390** text, default 18pt; widths 1319780 / 1090727 EMU. This floating-white-tab-on-border motif is the section's card-labeling convention.
- Per profile column (top→bottom, centered): circular photo 1284695 EMU (1.06"), grayscale; name box 1611232×295276; role line; bio block 2434133–2647206 wide × 1244739 high.

### 3. Typography
| Element | Size | Weight | Color |
|---|---|---|---|
| Slide title | 20pt | regular | white |
| Tab labels | 18pt (default) | bold | 0D8390 |
| Name | 14pt | bold | black |
| Role line | 12pt | bold + italic | black |
| Bio paragraph | 12pt | regular | black, centered |

### 4. Title formula
Fixed noun-pair title, identical in both decks: «قيادة المشروع وإدارة المشروع». No assertion sentence here — the one place the template uses a plain label title (the assertion was spent on the org-chart slide).

### 5. Body writing patterns — the bio formula (60–80 words, 3–4 sentences)
1. Identity + rank + office: «{الاسم} هو شريك في مكتب مونيتور ديلويت في الرياض…» / «يشغل {الاسم} منصب مدير تنفيذي في…».
2. Years-of-experience stat: «وقد اكتسب أكثر من 12 سنوات من الخبرة المهنية والاستشارية في الشرق الأوسط مع التركيز على تطوير المدن».
3. Focus domains: «تركزت معظم أعمال {الاسم} على تطوير الاستراتيجيات ونماذج التشغيل والأهداف الاستراتيجية والمبادرات وهياكل الحوكمة».
4. (PM only) name-drop the CLIENT entity: DECK1 PM «…العمل جنبا إلى جنب مع العديد من العملاء الرئيسيين في المملكة العربية السعودية»; DECK2 PM «وقد عمل باسم مع **امانة منطقة الرياض** وعلى نموذج الحوكمة والاستراتيجية لمدينة مكة المكرمة…». Roles rendered with «في المشروع» suffix on this slide: «الشريك الرئيسي في المشروع», «المدير التنفيذي في المشروع».

### 6–7. Visual grammar & micro-conventions
B/W circular photos only, no logos, no icons. Footer standard. Page 67 / 70. Beware: LibreOffice render shows bio overflow below card bottom (autofit text was tuned in PowerPoint); keep bios ≤80 words to stay inside the 1244739 EMU bio box.

### 8. DECK1 vs DECK2 deltas
IDENTICAL: title; card/tab geometry; مشعل السديري and مهند تيم bios are byte-identical boilerplate reused across proposals. CHANGED: PM card person + bio (rewritten around the new client); DECK1 adds 3rd leadership column for the executive director (his bio stresses «القطاع البلدي مع أمانة منطقة الرياض ووزارة البلديات والاسكان وكذلك الهيئات الملكية») — include such a column only when a senior client-domain figure is on the ticket.

### 9. RECONSTRUCTION RECIPE
1. Reuse the standing partner/QA bios from the reference library untouched (they are stable assets); regenerate ONLY the PM bio: rank + entity, tenure stat, then 1–2 sentences of engagements with THIS client's entity or sister entities (pulled from the firm's credentials list).
2. Keep card widths proportional to occupant count (1 column ≈ 2.4–2.7" incl. gutters); tabs must straddle the border, teal bold.
3. Quality bar: all three/four photos same diameter and vertical center; role line always bold-italic 12pt; bios length-matched (±1 line) so columns bottom-align; never let text spill past the card border.

---

## ARCHETYPE D — EXPERTS GRID («الخبراء (N/M)»)
DECK1 s-068/069/070 (11 experts over 3 pages: 4+4+3), DECK2 s-071/072/073/074 (16 experts over 4 pages: 4+4+4+4)

### 1. Narrative role
Serialized proof of bench depth: every scope domain in the RFP gets a named, numbered, photographed expert with a mini-bio. Continuation pages keep evaluators scoring "team breadth" without a single dense CV annex up front.

### 2. Layout anatomy
- 4 columns per page, RTL order (expert #1 = rightmost). Column width ≈2468880 EMU (2.03") for the bio block; column pitch ≈2.9".
- Per column, top→bottom:
  - **Number ribbon**: plain rect 858982×1011383 EMU (0.71"×0.83") at y=1103525, teal gradient **007680→004F59** (lin ang 8100000, scaled — same gradient as org-chart expert boxes), containing the expert's GLOBAL number, white bold **48pt** (sz=4800), centered. Numbering continues across pages (page 2 starts at 5, page 3 at 9, page 4 at 13).
  - Circular photo 1325880 EMU (1.09"), grayscale (`<a:grayscl/>` in XML), overlapping the ribbon's bottom edge (ribbon reads as a bookmark behind the head).
  - Name: 14pt bold, centered (box 1583644–1824960×265449).
  - Expertise tag: 12pt bold italic, centered, box 2007457–2208203×414764 (2 lines).
  - Bio: 12pt regular, centered, box 2468880×2322676 (≈1.9" tall, fits ~80–100 words).
- Title placeholder top-right on header band, standard 9761538×864970.

### 3. Typography
Name 14pt bold black; tag 12pt bold italic black; bio 12pt regular black; ribbon number 48pt bold white; title 20pt white. Sakkal Majalla everywhere.

### 4. Title formula
«الخبراء (1/3)» … «الخبراء (3/3)» / «الخبراء (1/4)» … «الخبراء (4/4)» — label + (page/total) pagination in parentheses (renders as (3/1) in RTL dumps; logical content is page/total). Total pages = ceil(experts/4). This is THE deck-wide continuation-pagination convention applied to a label title.

### 5. Body writing patterns
- Tag formula (fixed, quoted verbatim): «خبير مختص في مجال {التخطيط الاستراتيجي | المدن الذكية | النقل والبنية التحتية | تنفيذ الاستراتيجية | التطوير العمراني | التطوير العقاري والقطاع الخاص | المنظمة والقوى العاملة | الاقتصاد | الحوكمة وتنفيذ الاستراتيجيات | الهيكل التنظيمي | التحول الرقمي | الخدمات البلدية | قياس الأثر | النماذج التشغيلية | التخطيط الحضري والاستراتيجي للمناطق}». Female variant: «خبيرة مختصصة في مجال …» (دانيا نورالله). Prefix «د. / الدكتور» kept in the name. Rare variant without «مجال»: «خبير مختص في تطوير البنية التحتية» (ريتشارد كومبتن).
- Bio formula (2–4 sentences, 40–100 words): (1) current role + org: «{X} هو شريك في شركة ديلويت وقائد قسم…» / for externals: «مقرن الشعلان هو المؤسس والشريك الإداري لمكتب مقرن بن محمد الشعلان للمحاماة…»; (2) years stat in the house form: «لديه أكثر من 18 عامًا من الخبرة في…» / «يتمتع بأكثر من 25 عامًا…» / «يمتلك فيصل خبرة تزيد عن 20 عامًا…»; (3) domain list as a long wa-conjunction chain; (4) marquee KSA credentials: «أمانة منطقة الرياض», «وزارة البلديات والاسكان», «الديوان الملكي», «الهيئة الملكية لمحافظة العلا», «برنامج التحول الوطني», «نيوم والبحر الاحمر وامالا», «البنك الدولي». Numbers-first phrasing (25 عامًا، 18 عضوًا، 700 كيلو، 15 مدينة) is pervasive.
- Expert ORDER is a soft grouping by domain cluster: page 1 = strategy/planning core; page 2 = sector/economy; page 3–4 = delivery enablers (HR/org, infra, urban) then externals — mirrors the org chart column order.

### 6. Visual grammar
Teal gradient ribbon = "expert" brand within the deck (same fill as org-chart expert boxes — deliberate cross-slide echo). Grayscale headshots normalize wildly different photo sources. No icons, no charts.

### 7. Micro-conventions
Standard footer, sequential page numbers. No source lines. Note the RTL big numbers 10/11/12/13/16 render clipped in LibreOffice (two-digit overflow of the 0.71" ribbon) — widen ribbon or reduce to 40pt for 2-digit numbers when rebuilding.

### 8. DECK1 vs DECK2 deltas — the bench mechanism exposed
- 8 experts appear in BOTH decks with byte-identical tag+bio (ميغيل إيراس أنتونيس، سلطان بك خونكاييف، حسن مالك، طارق نحلة، أوليفر مورجان، سمير خيزران، سايمون بيدفورد، سام بلاكي، مقرن الشعلان، دانيا نورالله) → a standing CV card library is pasted per proposal.
- Project-specific additions in DECK2: اسماعيل رضوان (قياس الأثر), فيصل صديق (الخدمات البلدية), د. خالد الحازمي (التحول الرقمي), يزيد الثنيان (التخطيط الحضري والخدمات البلدية), الدكتور جيانكارلو مانجون (التخطيط الحضري والاستراتيجي للمناطق), محمد سعيد القباني (النماذج التشغيلية) — each maps 1:1 to a DECK2 scope element (dashboards/digital, municipal ops, impact). DECK1-only: ريتشارد كومبتن (Parsons infra).
- COPY-PASTE DEFECTS in DECK2 (evidence of the workflow, and what to avoid): s-073 card 9 shows BOTH «سمير خيزران» and «يزيد الثنيان» name lines and يزيد's bio pasted with kashida/tatweel-justified text («تسـلم يزيـد مشـاريع فـي أكثـر مـن 15 مدينـة…») from another document; s-074 card 15 is renamed «علي السامرائي» but keeps دانيا نورالله's bio verbatim AND her female tag «خبيرة مختصصة في مجال الهيكل التنظيمي». A rebuilt deck must lint for name/pronoun/gender/bio consistency.

### 9. RECONSTRUCTION RECIPE
1. Derive the required expertise list from the RFP scope items + any explicit «المؤهلات المطلوبة» clause; one tag per scope domain, phrased «خبير مختص في مجال {domain}».
2. Fill each tag from the reference bench (reusable CV cards); write NEW cards only for gap domains, following the 4-sentence bio formula with a KSA-client name-drop and one «أكثر من N عامًا» stat.
3. Lay out 4 per page RTL, global numbering, pages titled «الخبراء (i/⌈n/4⌉)». Order pages: core strategy → sector-specific → enabling functions → externals.
4. Keep every expert's tag string identical wherever it appears (org chart s-066/069 boxes, expert pages, any CV annex).
5. Quality bar: uniform photo diameter/greyscale; bios trimmed to fit the 1.9" box (no overflow, no kashida justification); 2-digit ribbons width-checked; gender agreement (خبير/خبيرة، مختص/مختصصة) matched to person; no orphan bench copies.

---

## SECTION-LEVEL NOTES
- Slide order of the chapter is fixed: Gantt → team-structure org chart → leadership cards → experts (N pages). DECK numbering shifted by +3 in DECK2 because its approach chapter is longer — archetypes, not positions, are the invariant.
- The section owns a private sub-palette (teal 007680/004F59, TOC-green 1A7749 diamonds, olive 435E13) layered over the master theme — reproduce these EXACT hex values; they are not derivable from the theme.
- Team size math observed: delivery team = PM + 5–6 consultants regardless of project size; leadership always 2 (+1 optional exec); experts = ~1 per scope domain, 11–16 typical; «++ اخرين» always closes each group.
- Nothing in the section uses tables, SmartArt, or charts — 100% positioned autoshapes + text boxes + picture fills, which is what makes pixel-faithful programmatic rebuilds feasible.
