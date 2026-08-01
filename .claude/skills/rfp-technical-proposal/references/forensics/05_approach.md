# 05 — APPROACH SECTION (النهج الذي سنتّبعه) — Deep Reverse-Engineering Findings

Scope analyzed: **DECK1 slides 45–62** (Strategic Studies, 4 tracks/مسارات, 9 months) and **DECK2 slides 49–65** (Central Riyadh Sector Performance, 6 phases/مراحل, 18 months). Every image was inspected; wording cross-checked against txt dumps; geometry/colors verified in slide XML (`unpacked1/ppt/slides/slide45..62.xml`, `unpacked2/ppt/slides/slide49..65.xml`, layouts 5 & 12, theme1.xml, slideMaster1.xml).

This is the TECHNICAL HEART of the proposal: it converts the RFP scope-of-work + bill-of-quantities into (1) a one-slide execution model, (2) a BoQ→deliverables contract table, (3) a per-track detailed methodology series, and (4) a reusable project-governance / knowledge-transfer library. Six archetypes, documented below.

---

## 0. SHARED FRAME FOR EVERY APPROACH SLIDE (verified in XML)

### 0.1 Header zone (from slideLayout5 "3_Title & subtitle" and slideLayout12 "1_MD Proposal Content Slide")
- Riyadh-skyline photo strip, full bleed: `0,0 → 13.333 × 1.55 in`.
- Overlay rectangle, same rect, **gradient**: stop @18% `056946` alpha 85% → stop @100% `88AEF1` alpha 60%, linear `ang=2700000` (45°). This exact gradient is the section's signature ("green fading to hazy blue toward the left").
- Title placeholder: `x=0.5", y=0.38", 12.33 × 0.95 in`, anchor ctr, `algn="r" rtl="1"`, **Sakkal Majalla 28 pt, regular weight, white (`bg1`)**. No autofit — 2-line titles simply wrap.
- Digits inside Arabic titles are separate `lang="en-US"` runs (Western numerals: 4, 6, 9, 18, (1/3)) — same size/color, no highlight. **In this section the green 86BC25 keyword highlight is NOT used on titles** (titles sit on the photo band, so they stay 100% white).

### 0.2 Footer (from slideMaster1, 8 pt / sz=800 strip at y≈6.97")
- Right: copyright, hard-coded in master —
  - DECK1: `© 2026 ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة`
  - DECK2: `© ` + date field + ` ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة.` (renders as © 2025 …)
- Center: project identifier line —
  - DECK1: `العرض الفني: خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن`
  - DECK2: `العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض` (note the ` | ` separator between client and project)
- Far left: plain page number, 8 pt gray.

### 0.3 The phase/track navigation ribbon (present on EVERY approach slide except the two KT diagram slides)
The single most load-bearing device of the section. One tab per track/phase, laid RTL (track 0 at far right), plus in DECK2 a second full-width row for phase 6.

| Property | DECK1 (5 tabs) | DECK2 (7 tabs) |
|---|---|---|
| Shape | `prstGeom="rect"` with `flipH="1"` (shapes still *named* "Pentagon 27/32" — they were flattened from chevrons) | `prstGeom="homePlate"` (true chevron, point toward reading direction) |
| Row-1 tab height | 0.41 in @ y=1.62" | 0.30 in @ y=1.57" |
| Text | Sakkal Majalla **14 pt**, white, `algn=r rtl=1`, lnSpc 80% | Sakkal Majalla **11 pt**, white (smaller because 7 tabs must fit) |
| Launch tab width | 1.15 in (x=11.99) | 1.15 in |
| Content tab widths | 2.84 in each, ~0.105 in gaps | 2.92 (phase 1), 2.02 (phases 2–4), 2.65 (phase 5) — width ∝ label length |
| Row 2 | — | full-width homePlate `0.19,1.88 → 12.95 × 0.30` for `6. نقل المعرفة` |
| ACTIVE tab fill | the header gradient itself: `056946` a85 @18% → `88AEF1` a60 @100%, 45° | identical |
| INACTIVE tab fill | solid `F2F2F2`, text stays WHITE → ghosted, barely legible on purpose | identical |

Tab labels are always `N. اسم المسار/المرحلة` with Western numeral + period. On the overview slide ALL tabs are active (all gradient); on methodology slides exactly one is active — this is the "you are here" mechanism.

### 0.4 "شكل توضيحي" (illustrative figure) tag
On every boilerplate/library slide (D1 s49, s50, s51; D2 s52, s53, s54, s55) a small TextBox sits at top-left over the photo band: `شكل توضيحي`, Sakkal Majalla ~14 pt (sz=1399), **white**, underlined. It flags the diagram as illustrative (not project-computed). Reuse verbatim; never put it on the BoQ or methodology-content slides.

### 0.5 Theme mapping used in this section (theme1.xml identical in both decks)
`accent1=86BC25, accent2=43B02A, accent3=26890D, accent4=046A38, accent5=0D8390 (the workhorse teal of this section), accent6=007CB0, dk2=53565A, lt2=D0D0CE`. Off-palette colors that appear only inside gradients/diagrams: `056946` (deep green anchor), `88AEF1` / `6596ED` (periwinkle blue), `498D9E` (steel teal), `6FC2B4` (mint pill), `00ABAB` (cyan), `556478` (slate), `313131`/`575757` (body grays), `F2F2F2` (bg1 lumMod 95%).

---

## ARCHETYPE A — APPROACH OVERVIEW ("execution model on a page")
**D1 s45 ↔ D2 s49** (layout 5)

### A1 Narrative role
First slide after the approach divider. Answers in one glance: how many workstreams, how long, what happens in each. It is the map that every following methodology slide zooms into. Everything on it must reappear verbatim later (tab names, sub-track numbers, activity lines) — this internal consistency is what makes the proposal feel engineered.

### A2 Title formula (exact)
`سيتم تنفيذ المشروع عبر N مسارات رئيسية وخلال مدة زمنية تقدر بـ9 أشهر` (D1)
`سيتم تنفيذ المشروع عبر 6 مراحل رئيسية وخلال مدة زمنية تقدر بـ18 شهر` (D2)
Template: **سيتم تنفيذ المشروع عبر {N} {مسارات|مراحل} رئيسية وخلال مدة زمنية تقدر بـ{X} {أشهر|شهر}** — passive future سيتم + count + duration, white 28 pt, no highlight. (D2's `18 شهر` is grammatically loose — the house does not polish to فصحى perfection; do write `شهرًا` in new decks but keep the formula.)

### A3 Layout anatomy (XML-verified, D1)
- N+1 vertical columns under the ribbon, RTL: rightmost = `0. الاطلاق` (narrow, 1.15"), then tracks 1..N right→left, each 2.84" wide.
- Column header = the ribbon tab itself (all in active/gradient state), height 0.41".
- Under each header a borderless text rectangle `y=2.03", h=4.86"` (launch col h=2.72") with `lIns=72000/rIns=36576`.
- D2 variant: phase 6 (نقل المعرفة) is a **full-width horizontal gradient chevron band** at `0.19,5.96 → 12.95 × 0.41` with its two sub-phases written inline in a 12.55"-wide rectangle beneath it.

### A4 Typography inside columns
- Sub-track heading: `X.Y اسم المسار الفرعي` — Sakkal Majalla **12 pt bold, accent5 (0D8390 teal)**, right-aligned, spcAft 3 pt, no bullet.
- Activities: **12 pt black**, Arial `•` bullet, `marL=171450 indent=-171450` (0.19" hanging), spcAft 3 pt.
- Everything Sakkal Majalla (latin+cs+sym all set to it).

### A5 Body writing pattern
- Each column: 1–2 numbered sub-tracks (`1.1`, `1.2`, `4.1`, `4.2`; launch always `0.1 إطلاق المشروع` + `0.2 تحديد الطموح`).
- Under each sub-track 1–8 activity bullets, each ONE sentence, **verb-first with a masdar** (verbal noun): رصد وتحليل / تطوير / دعم / إعداد / تنفيذ / صياغة / إجراء / عقد / توثيق / تقييم / اقتراح / تحليل وتقييم / متابعة / تصميم. These lines are near-verbatim liftovers of the RFP scope-of-work items (D2's bullets even keep the RFP's `الخ.` endings and `تحليل رباعي / SWOT` phrasing).
- Launch column is 100% boilerplate, byte-identical in both decks:
  - `0.1 إطلاق المشروع` → `عقد اجتماع الإطلاق الأولي وتحديد أصحاب المصلحة الرئيسيين، وإعداد ميثاق المشروع`
  - `0.2 تحديد الطموح` → `إجراء ورشة عمل مع أصحاب المصلحة الرئيسيين في المشروع للموائمة على طموحات وأهداف المشروع`

### A6 D1 vs D2 deltas
- Word `مسار` (track, capability-retainer engagement) vs `مرحلة` (phase, sequential build engagement) — chosen once and used consistently in every later slide (`المسار الفرعي` vs `المرحلة الفرعية`, `لكل مسار` vs `لكل مرحلة`).
- D2 adds the horizontal phase-6 band (its overflow solution when N+1 > 6 columns).
- D1 columns are packed (up to 8 bullets); D2 columns lighter (2–5 bullets).
- Chevron (homePlate) vs flattened rect tabs — cosmetic drift; reconstruct with homePlate.

### A7 Reconstruction recipe
1. Cluster the RFP's BoQ + scope-of-work into 3–6 workstreams; decide مسارات (parallel/retainer) vs مراحل (sequential). Name each ≤ 6 words, noun-phrase, numbered 1..N. Always prepend `0. الاطلاق`; append a knowledge-transfer stream if the RFP requires it (as phase N or embedded in a track).
2. Estimate duration from RFP contract period → title sentence.
3. Build ribbon: homePlate chevrons, RTL, launch 1.15" wide, others share remaining ~12" minus 0.105" gaps; all tabs in gradient state.
4. For each track write 1–2 sub-tracks numbered X.Y whose names will be reused verbatim on methodology slides, then 3–6 verb-first activity bullets distilled from the RFP scope text (keep client's own vocabulary — أمانة، القطاع، المدينة).
5. Quality bar: columns visually balanced (±2 lines), every bullet one line-to-three-lines, zero orphan words, all headings teal-bold, all body 12 pt — dense but perfectly gridded.

---

## ARCHETYPE B — BoQ → DELIVERABLES TABLE ("جدول الكميات")
**D1 s46 ↔ D2 s50** (layout 5)

### B1 Narrative role
Proves compliance: maps every bill-of-quantities line item to a track/phase, a deliverable name, a unit and a quantity. It is the contract inside the proposal; the same deliverable strings feed the methodology slides' المخرجات panel.

### B2 Title formula (exact)
`بناء على جدول الكميات، تم تفصيل المخرجات الرئيسية للنهج الذي سنتّبعه لكل مسار` (D1) / `…لكل مرحلة` (D2). Note the shadda in `سنتّبعه` — house spelling, and the echo of the section name النهج الذي سنتّبعه.

### B3 Table anatomy (XML-verified)
- D1 columns (logical RTL order): `المسار` 3.43" | `المخرج` 7.2" | `وحدة القياس` 1.4" | `الكمية` 0.75".
- D2 adds a serial column: `المرحلة` 3.98" | `الرقم التسلسلي` 0.93" | `البند` 5.92" | `وحدة القياس` 1.3" | `الكمية` 0.7". (D2 renames المخرج → البند, mirroring that RFP's own BoQ header.)
- Header row 0.41" (D1) / 0.68" (D2): **no fill**, text **15 pt bold `53565A`**, centered, thin borders; a **1 pt accent5 (0D8390) rule** runs under the header (lnT of first body row).
- Body rows 0.53" (D1) / 0.75" (D2): white fill, **16 pt** black text; deliverable names right-aligned, unit + quantity centered; row separators 1 pt `bg1 lumMod85` (light gray).
- Track/phase column: cells **merged per track** (`rowSpan`), filled with the signature 3-stop gradient `pos0 056946 a85 → pos50 498D9E → pos100 6596ED a60, lin ang=10800000` (horizontal), text **18 pt bold white**. Visually: each track is a green→blue gradient block spanning its deliverable rows.
- D2 serial column: light periwinkle fill continuing the gradient hue, 15 pt.
- Units are only ever `دراسة` (study) or `تقرير` (report). Quantities Western numerals.

### B4 Content pattern
One row per BoQ line. Deliverable names are compressed noun phrases (2–8 words) lifted from the RFP BoQ: e.g. D1 `تقييم الأثر والبدائل الاستراتيجية | تقرير | 27`, `الدراسات التنفيذية داعمة لاتخاذ القرار | دراسة | 45`; D2 `التقارير الدورية لمتابعة تنفيذ الأعمال التشغيلية في القطاع | تقرير | 18`. Tracks with one deliverable get one row (still a merged gradient cell).

### B5 Reconstruction recipe
1. Transcribe the RFP BoQ verbatim (names, units, quantities) — never invent quantities.
2. Assign each line to a track; order rows by track number; merge the track cell with the gradient fill.
3. Keep the table to one slide; if > 10 rows, shrink row height before shrinking font.
4. Reuse the exact deliverable strings later in every methodology slide's المخرجات والنتائج panel (this cross-reference is the auditability trick evaluators reward).

---

## ARCHETYPE C — QUANTITY UPSELL / "MORE FOR SAME COST" (D1 s47 ONLY)
**D1 s47** — no D2 equivalent (project-specific commercial move).

### C1 Narrative role
Immediately after the BoQ table, Deloitte proposes MORE deliverables at the same team size and price — a differentiator slide. Title starts with **و** to read as a continuation of s46: `ونقترح هذه الكمية من المخرجات بنفس عدد فريق العمل والذي لا يؤثر على على تكلفة المشروع` (note the human typo `على على` — evidence of manual authoring; obviously fix in new decks).

### C2 Anatomy
Same table as Archetype B plus three columns: `الكمية حسب جدول الكميات` | `الكمية المقترحة` | `الزيادة`. Increase cells show `+5`, `+3`, `+4` (plain black); unchanged rows leave الزيادة empty. Everything else (gradient track cells, header style) identical to B.

### C3 Reconstruction recipe
Optional slide; include when strategy = differentiate on volume. Copy table B, add the three columns, bump 2–4 line items by 10–45%, leave anchors (biggest quantities) untouched so the gesture looks considered, and reference team capacity in the title.

---

## ARCHETYPE D — DETAILED METHODOLOGY SLIDE (the most important archetype in the deck)
**D1 s48 (launch), s52–54 (track 1, 1/3–3/3), s55–56 (track 2, 1/3–2/3*), s57–58 (track 3, 1/2–2/2), s61–62 (track 4, 1/2–2/2); D2 s51 (launch), s56–57 (phase 1), s58–59 (phase 2), s60 (phase 3), s61 (phase 4), s62 (phase 5), s63 (phase 6)** — all on layout 12. (*D1 track 2 is titled (1/3)/(2/3) but only 2 slides exist — a pagination slip; do not reproduce.)

### D1 Narrative role
One sub-track per slide-run: WHAT we will do (activities, decomposed two levels deep) and WHAT you will receive (deliverables). This is where technical evaluators score the bid; density and decomposition depth signal competence.

### D2 Title formula (exact patterns)
- Track slide: `منهجية المشروع التفصيلية | المسار الأول – الدراسات الاستراتيجية والاقتصادية (1/3)`
- Phase slide: `منهجية المشروع التفصيلية | المرحلة الأولى – تحليل الوضع الراهن (1/2)`
- Launch: D1 `منهجية المشروع التفصيلية | الاطلاق` ; D2 `منهجية المشروع التفصيلية | المرحلة صفر – الاطلاق`
- Library sub-slides append a third breadcrumb: `… | الاطلاق | آلية ادارة المشروع`
Grammar: fixed stem `منهجية المشروع التفصيلية`, ` | ` breadcrumb separator, ordinal in words (الأول/الثانية/السادسة; deck2 uses صفر for 0), **en-dash –** before the track name, pagination `(1/N)` in Western digits ONLY when the sub-track spans multiple slides (single-slide phases like D2 s60/s61/s62 carry no (1/1)).

### D3 Layout anatomy (XML-verified, identical in both decks)
- Ribbon: one active tab (gradient), all others F2F2F2-ghosted.
- Content container: bordered rectangle `x=0.08", y=2.21", 13.18 × 4.86 in`, white, thin light-gray outline.
- **Deliverables panel** (RTL-final position = LEFT edge): `0.08,2.21 → 2.28 × 4.86 in`, fill `bg1 lumMod 95%` (= F2F2F2).
- **Activities panel**: text rectangle `2.36,2.21 → 10.87 × 4.86 in` on the white area (~82% of width vs 17% panel).

### D4 Typography (element by element)
| Element | Spec |
|---|---|
| `الأنشطة:` (activities header) | Sakkal Majalla 16 pt **bold italic**, black, right-aligned, first line of the activities box |
| Sub-track header `المسار الفرعي 1.1 \| التحليل الاستراتيجي والاقتصادي المتكامل` | 16 pt **bold, accent5 0D8390**, same paragraph after a `<br>`; pipe separator between number and name; launch uses `المرحلة الفرعية 0.1 \| إطلاق المشروع` (even D1 says مرحلة for launch) |
| L1 activity bullet | 14 pt black, Arial `•`, `marL=171450 indent=-171450`, rtl, algn r |
| L2 sub-activity bullet | 14 pt black, `o` bullet char, `marL=548640 indent=-182880` (deep 0.6" indent — the visible "double indent" rhythm) |
| `المخرجات والنتائج:` (panel header) | 16 pt **bold italic** black |
| Panel bullets | 16 pt black, Arial `•`, `marL=155539` hanging |

### D5 Body writing patterns (the content formula)
- **L1 = RFP scope sentence** (often verbatim from the overview slide/ RFP): masdar-first, one sentence, may end with `من خلال:` to introduce subs (D2 style) or just a period (D1 style).
- **L2 = consultant decomposition**: 3–6 concrete steps per L1, each 5–14 words, masdar-first, no punctuation except final period; parallel structure strictly maintained (عقد، تحليل، تحويل، تحديد، صياغة…).
- Typical load: 2–4 L1 groups per slide, 12–20 total lines. When a sub-track's L1 list exceeds one slide, continue on (2/N) with the SAME sub-track header repeated, remaining L1s. Final continuation slides may be sparse (D1 s54 has one L1 + 4 L2 and ~50% white space — the house tolerates a light last page rather than re-flowing).
- **Deliverables panel = the BoQ deliverable strings for this track, verbatim, repeated on every page of the run** (all three pages of track 1 list the same 4 deliverables). Launch and KT phases: panel says `لا ينطبق` (not applicable).
- English technical terms appear inline untranslated where they add credibility: `Power BI أو Tableau`, `(UX/UI)`, `(Prototypes)`, `(Big Data)`, `(Predictive Analytics)`, `SWOT`, `Project Shadowing`.
- Numbers-first phrasing appears as element counts: D2 s58 `…من خلال تفصيل العناصر الـ 10التالية:` followed by ten **bold lead-in + colon + explanation** bullets (أصحاب المصلحة: …، الخدمات: …، القنوات: …) — the classic operating-model decomposition pattern.

### D6 D1 vs D2 deltas
- Identical geometry, fills, type specs, panel behavior — this is pure template.
- D1 depth is uniform (almost every L1 has L2s); D2 mixes flat-bullet slides (s60, s61) with deep ones (s56, s62).
- Launch methodology slide content (s48/s51) is ~100% identical library text, down to `ميثاق المشروع` charter checklist (7 sub-items: الأهداف الواضحة، فريق المشروع وأدواره ومصفوفة المسؤوليات، نهج المشروع ونطاق العمل، الجدول الزمني وأداة التتبّع ونموذج تقارير التقدّم، نموذج الحوكمة، مخاطر المشروع والافتراضات والتبعيات، تفاصيل ومحتوى كل مخرج ومعايير القبول). Only one sentence is client-tuned: D2 changed `عقد ورشة عمل مع الأمانة…` to `…مع قادة القطاع لتحديد الغرض والأهداف المتوقعة من تحديث استراتيجية الامانة…` (and left a mismatched phrase from yet another proposal — proof of clone-and-tweak).

### D7 Reconstruction recipe
1. For each sub-track X.Y from the overview: copy its L1 activities, then DECOMPOSE each into 3–6 L2 steps (this decomposition is generated from consulting method knowledge — interviews, document review, benchmarks, workshops, drafting, validation cycles — flavored with RFP vocabulary).
2. Paginate: ≤ ~20 body lines per slide; add `(k/N)` to titles when N > 1; repeat the sub-track header and the deliverables panel on every page.
3. Populate the panel with the exact BoQ strings of that track; `لا ينطبق` for launch/KT.
4. Set the ribbon's active tab = this track.
5. Launch slide: paste the library text, tune only client name and ambition-workshop sentence.
6. Quality bar: two indent levels visible at a glance, perfect parallelism (all masdar), no bullet exceeding 3 rendered lines, teal headers as the only color accents on white.

---

## ARCHETYPE E — LAUNCH-PHASE GOVERNANCE LIBRARY (reusable, near-verbatim in both decks)
Sub-slides of the launch tab, each with 3-segment breadcrumb + `شكل توضيحي` tag + ghosted ribbon (launch tab active).

### E1 آلية ادارة المشروع — PM mechanism (D1 s49 ↔ D2 s52, byte-identical content)
- Two-part layout. RIGHT: heading `دورة حياة المشروع` (18 pt, flanked by teal rules) over a circular arrow cycle of 5 chevron-arrow freeforms: الإطلاق `86BC25` → التخطيط `00ABAB` → التنفيذ `0D8390` → المراقبة والتحكم `007CB0` → الإغلاق `556478`, hub label `إطار عمل إدارة المشاريع والتكامل` (14 pt, `575757`). Stage name chips 14 pt white on matching solid fills.
- LEFT: heading `إطار عمل إدارة المشاريع` + **8 pill rows**: label pill (roundRect, fill `6FC2B4` mint, 11 pt black bold) + description card (white roundRect, border `bg1 lumMod75`, 11 pt): إدارة المعرفة، إدارة النطاق، إدارة الإطار الزمني، إدارة الإنفاق، إدارة المخاطر، إدارة الجودة، إدارة أصحاب المصلحة (+ hub row). Descriptions are one-sentence masdar phrases (quote: `تحديد وتقييم المخاطر التي تؤثر على سير عمل المشروع ووضع خطط التخفيف من حدتها ومتابعتها بشكل مستمر`).

### E2 إدارة المخاطر والتحديات — risk & challenges (D1 s50 ↔ D2 s53, byte-identical)
- **6-column card grid**, RTL order: التخطيط، إدارة المخاطر، إدارة التحديات، التحكم في التغيير، إدارة التواصل، متابعة التقدم وإعداد التقارير.
- Each column: gray icon chip (`E7E6E6` rounded, mono line-icon: Gantt chart, warning, traffic cone, transfer, megaphone, pie chart) → teal `round2SameRect` header bar (white 12 pt bold) → description (10.5–12 pt) → **downward isosceles-triangle arrow `0D8390`** → fanned stack of tool screenshots (trackers, dashboards, RAID logs) on `F8F8F8` cards.
- FOSSIL WARNING: the change-control text says `ورفع التغييرات بشكل استباقي إلى الوزارة وأصحاب المصلحة المعنيين` — **الوزارة (the Ministry!) survives in BOTH Amanah decks**, a leftover from an older ministry proposal. When reusing the library, grep for الوزارة/الأمانة/الجهة and normalize to the new client.

### E3 خطة إدارة الجودة والمخرجات — quality & deliverables approval (D2 s54 ONLY; D1 omits it)
- Two full-width **thin teal band headers** (`0.24 in` tall, accent5 fill, white 14 pt bold, right-aligned): `دورة الموافقة على المخرجات` and `المخرجات`, each with a green `86BC25` circle-check freeform at its right end.
- Under band 1: intro sentence (`سيتم تقديم كل مخرج باللغة العربية وفي قالب الامانة. عند اكتمال التسليم، يلزم المرور بدورة الموافقة وعملية التوقيع…`) then `ستكون عملية ذلك كما يلي:` + **numbered 1–7 process list** (14 pt, `313131`): notify → route to reviewers → Amanah review & comments → **`قضاء ديلويت يومين كحد أقصى لتحديث المخرجات`** (2-day turnaround SLA) → sign-off → out-of-scope changes go through change order → `ستنعكس التعليقات بعد كل مراجعة`.
- Under band 2: **4 homePlate chevrons** (2.89 × 0.31 in) RTL: `المراجعة الداخلية` (gray, caption `الشريك الرئيسي في المشروع`) → `مراجعة الامانة` (accent5, caption `المراجع ذات الصلة، بناء على مسارات الموافقة للمخرج`) → `المراجعة الداخلية` (accent6 007CB0, caption `شريك ضمان الجودة`) → `مراجعة الامانة` (dark, same caption). Captions 11 pt italic gray beneath; double-headed arrow labeled `ستنعكس التعليقات بعد كل مراجعة` (14 pt gray `ABABAB`) above; rotated side label `المراجعين`.
- Recipe: pure boilerplate — swap only client name and template line. Include it whenever the RFP scores quality management.

### E4 خطة إدارة التصعيد — escalation plan (D1 s51 ↔ D2 s55, byte-identical)
- 3-column table: `المستوى` 1.42" | `وصف مستوى التصعيد` 5.93" | `معايير` 5.93".
- Header row 0.56": **fill accent5 (0D8390), white 24 pt bold**. Body rows 1.14": white, level cell 18 pt bold, others 16 pt; thick 3 pt white inter-row borders + thin gray rules → airy 3-row ladder.
- Fixed content (quote): المستوى 1 = `مدير مشروع ديلويت ومدير مشروع الامانة` / `التصعيد إلى المستوى 2 إذا لم يتم حلها في غضون 3 أيام`; المستوى 2 = `مدير مشروع ديلويت، شريك ديلويت، ومدير مشروع الامانة` / `التصعيد إلى فريق قيادة المشروع إذا لم يتم حلها في غضون 5 أيام`; المستوى 3 = `…وراعي المشروع من الامانة` / criteria cell empty.
- Recipe: reuse verbatim, substitute client word (الامانة → الجهة/الوزارة/الهيئة). The 3-day/5-day SLAs are house constants.

---

## ARCHETYPE F — KNOWLEDGE-TRANSFER PAIR (no ribbon; title breadcrumb carries context)
These two drop the navigation ribbon entirely — the only approach slides that do.

### F1 العمل التشاركي مع الأمانة — collaborative working (D1 s59 ↔ D2 s64, content byte-identical)
- Title: `منهجية المشروع التفصيلية | المسار الثالث – التمكين المؤسسي | العمل التشاركي مع الأمانة` (D2 re-hangs it under `المرحلة السادسة – نقل المعرفة`) — same slide, different parent: **the library slide is re-parented via its breadcrumb, nothing else changes.**
- Banner: bordered full-width box, **bold italic** claim + trainer icon (teal, top-right): `كجزء من إلتزامنا لنقل المعرفة وبهدف تطوير الكوادر البشرية في الأمانة سنقوم بتطوير خطة شاملة تتضمن مجموعة من ورش العمل والدورات التدريبية والآليات الاخرى`.
- Left half: collage of 5 real workshop photos (Deloitte-branded events, people at round tables).
- Right half: teal header card (accent5 fill, white bold `خطة نقل المعرفة` + hands-gears icon + sub-line) above 3 white outlined cards, each **bold title + one-line explainer**: `تنفيذ الارشاد المهني Project Shadowing / تعاون وثيق بين موظفين الأمانة وديلويت`; `المشاركة الفعلية في الأنشطة اليومية / سيتم تعريف فريق عمل بمنهجياتنا`; `ورش عمل وجلسات نقاش وجلسات مركزة / تتكون من عدة مواضيع فنية وإدارية`. Gray chevron arrow → bottom assertion (bold): `سيتم تحديد مجموعة من الخبراء المختصين بالمواضيع ذات الأولوية`.

### F2 منهجية نقل المعرفة — KT methodology diagram (D1 s60 ↔ D2 s65)
- Caption over diagram: `منهجية ديلويت في نقل المعرفة` (bold, right).
- RIGHT legend column of gray panels: `مسارات المشروع` (D2: `مراحل المشروع`), `انتقال المسؤوليات من فريق ديلويت إلى موظفي الأمانة`, `مجال التركيز في نقل المعرفة` + a 4-node hub icon with numbered squares 1 التأهيل, 2 التدريب, 3 التنفيذ, 4 الإشراف والتوجيه.
- CENTER: stacked outlined boxes listing the tracks (D1: المسار الأول…الرابع; D2: المرحلة الأولى…الخامسة — **with a copy-paste bug: المرحلة الأولى appears twice and الثالثة is missing**) feeding a dark-slate box `استدامة أعمال مسارات المشروع`; below, a **wedge/ramp diagram**: teal band (فريق عمل الأمانة, client logo) grows while green wedge (فريق مونيتور ديلويت, Monitor Deloitte logo) shrinks, y-axis `الموارد المتاحة` 0%→100%, meaning responsibility handover.
- BOTTOM: 4 numbered text columns (gray square number chips) describing each focus area, e.g. `1 التأهيل والتكامل من خلال فريق ديلويت للتعرف على موظفي المشروع من الأمانة وبناء علاقات جيدة معهم…`, `2 عقد ورشات تدريبية مصغرة… تدريب مكثف للموظفين على منهجيات العمل`, `مشاركة موظفي الأمانة مهام ليقوموا بتنفيذها بأنفسهم وتقديم تغذية راجعة بشكل مستمر`, ending state: `موظفوا الأمانة والمعنيين في المشروع تتوفر لديهم القدرات والمهارات اللازمة لتنفيذ العمل بشكل منفصل واستدامة تشغيل المنظومة`.
- Recipe: fully reusable; recompute ONLY the track/phase name boxes (one per track, no duplicates — fix the D2 bug), swap client logo/name. Keep 0%→100%, the 4 focus areas, and both team labels.

---

## CROSS-CUTTING FINDINGS & MASTER RECIPE

1. **Template vs project content split** (what the two decks prove): FIXED = header gradient+photo, ribbon mechanics, content container, panel scheme, all Archetype E slides, F pair, launch methodology text, escalation SLAs, PM framework, footers' structure, `شكل توضيحي`, all fonts/sizes. RECOMPUTED per RFP = N of tracks + names + مسار/مرحلة choice, duration, BoQ table rows, deliverables panels, all L1/L2 activity content, active-tab per slide, footer project string, © year, breadcrumb parents of library slides.
2. **Word-choice switch**: retainer/parallel engagement → مسارات + `المسار الفرعي`; sequential transformation → مراحل + `المرحلة الفرعية`; launch is always `0. الاطلاق` (spelled without hamza, house style; sub-phases always `0.1 إطلاق المشروع`, `0.2 تحديد الطموح`).
3. **Consistency chain** (the quality signature): ribbon tab names = overview column headers = breadcrumb titles = BoQ table track cells = active-tab labels; BoQ deliverable strings = methodology panel bullets. Break this chain and the deck stops looking consultant-made.
4. **Slide budget formula**: 1 overview + 1 BoQ (+1 optional upsell) + 1 launch methodology + 3–4 launch library + Σ per track ceil(activity_lines/20) methodology pages + 2 KT slides ≈ 15–18 slides for a 4–6 track engagement (D1: 18, D2: 17).
5. **Human-tell imperfections observed** (do not replicate, but they calibrate the "human bar"): `على على` typo (D1 s47), duplicated phrase in D1 s45 2.1 lead bullet, track-2 (1/3) with no (3/3), D2 s65 duplicated المرحلة الأولى, `الوزارة` fossil in both risk slides, `18 شهر` agreement slip. The house optimizes for density + parallelism + grid discipline, not copy-editing perfection.
6. **RTL execution details for a faithful rebuild**: every pPr carries `algn="r" rtl="1"`; digits as `lang="en-US"` runs; chevrons flipH'd so points lead leftward; column/tab sequences laid right→left; tables authored with logical column 1 = rightmost (LibreOffice renders them flipped — trust XML/real PowerPoint, not the raster).
7. **Density/quality bar**: body never below 10.5 pt; max 3 colors per slide (teal accents + one gradient family + black); one idea per slide (one sub-track, one governance mechanism); ≥ 60% of slides carry a real diagram or table, not prose; whitespace lives in fixed margins, not random gaps.
